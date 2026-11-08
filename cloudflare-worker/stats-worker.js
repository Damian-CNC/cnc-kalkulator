/**
 * Cloudflare Worker: CNC HUB Public Analytics API (v2)
 *
 * Pobiera dane analityczne z oficjalnego API Cloudflare:
 * 1. Przeszukuje listę witryn Web Analytics (/rum/site_info/list) aby pobrać właściwy site_tag i zone_tag
 * 2. Pobiera dane RUM (Real User Monitoring) z GraphQL rumPageloadEventsAdaptiveGroups
 * 3. Jeśli RUM ma 0 zdarzeń (np. adblockery lub nowa instalacja), automatycznie pobiera
 *    analitykę ruchu HTTP ze strefy Cloudflare (httpRequestsAdaptiveGroups)
 * 4. Obsługuje parametr ?debug=1 do natychmiastowej diagnostyki połączenia w przeglądarce.
 */

// Przyjazne nazwy kalkulatorów CNC HUB
const PATH_NAMES = {
  '/': 'Menu Główne',
  '/parametry': 'Parametry skrawania',
  '/waga': 'Kalkulator wagi',
  '/gwinty': 'Menu gwintów',
  '/threads': 'Menu gwintów',
  '/threads/metric': 'Gwinty metryczne',
  '/threads/helicoil': 'Gwinty HeliCoil',
  '/threads/bsp': 'Gwinty rurowe BSP',
  '/threads/un': 'Gwinty calowe UN',
  '/threads/acme': 'Gwinty trapezowe Acme',
  '/threads/trapezoidal': 'Gwinty trapezowe Tr',
  '/threads/npt': 'Gwinty NPT',
  '/pcd': 'Podziałka otworów PCD',
  '/pomiar-pcd': 'Pomiar PCD suwmiarką',
  '/kat-linii-srubowej': 'Kąt linii śrubowej & Płytka',
  '/plytka-podporowa': 'Kąt linii śrubowej & Płytka',
  '/true-position': 'Pozycja rzeczywista',
  '/tolerancje': 'Pasowania ISO 286',
  '/tolerancje-iso-2768': 'Tolerancje ISO 2768',
  '/iso-2768': 'Tolerancje ISO 2768',
  '/podciecia-din509': 'Podcięcia DIN 509',
  '/chropowatosc': 'Chropowatość powierzchni',
  '/rowki-segera': 'Rowki Segera',
  '/wpusty': 'Rowki wpustowe',
  '/rowki-oring': 'Rowki O-ring',
  '/otwory-pod-sruby': 'Otwory pod śruby',
  '/trygonometria': 'Trygonometria warsztatowa',
  '/kalkulator': 'Kalkulator prosty',
  '/baza-materialow': 'Baza materiałów',
  '/korekcja-temperaturowa': 'Korekcja temp.',
  '/privacy': 'Polityka prywatności',
  '/stats': 'Statystyki',
};

const COUNTRY_NAMES = {
  PL: 'Polska',
  Poland: 'Polska',
  DE: 'Niemcy',
  Germany: 'Niemcy',
  US: 'Stany Zjednoczone',
  'United States': 'Stany Zjednoczone',
  GB: 'Wielka Brytania',
  'United Kingdom': 'Wielka Brytania',
  CZ: 'Czechy',
  Czechia: 'Czechy',
  'Czech Republic': 'Czechy',
  SK: 'Słowacja',
  Slovakia: 'Słowacja',
  IT: 'Włochy',
  Italy: 'Włochy',
  FR: 'Francja',
  France: 'Francja',
  ES: 'Hiszpania',
  Spain: 'Hiszpania',
  NL: 'Holandia',
  Netherlands: 'Holandia',
  SE: 'Szwecja',
  Sweden: 'Szwecja',
  NO: 'Norwegia',
  Norway: 'Norwegia',
  CH: 'Szwajcaria',
  Switzerland: 'Szwajcaria',
  AT: 'Austria',
  JP: 'Japonia',
  Japan: 'Japonia',
  UA: 'Ukraina',
  Ukraine: 'Ukraina',
  LT: 'Litwa',
  Lithuania: 'Litwa',
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const isDebug = url.searchParams.has('debug') || url.searchParams.has('test');

    const apiToken = env?.CLOUDFLARE_API_TOKEN;
    const accountId = env?.ACCOUNT_ID;
    const manualSiteTag = env?.SITE_TAG;
    const manualZoneId = env?.ZONE_ID;

    if (!apiToken || !accountId) {
      return returnFallbackData(true, 'Brak skonfigurowanych zmiennych CLOUDFLARE_API_TOKEN lub ACCOUNT_ID.');
    }

    const debugLogs = {
      accountId,
      manualSiteTag,
      manualZoneId,
      stages: [],
      errors: [],
    };

    try {
      // 1. Próba pobrania witryn z Cloudflare REST API (/rum/site_info/list)
      let discoveredSiteTag = manualSiteTag || null;
      let discoveredZoneTag = manualZoneId || null;
      let rumSitesList = [];

      try {
        const siteListResp = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/rum/site_info/list`,
          {
            headers: {
              Authorization: `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const siteListJson = await siteListResp.json();
        debugLogs.stages.push({ stage: 'site_info_list', status: siteListResp.status, success: siteListJson.success });

        if (siteListJson.success && Array.isArray(siteListJson.result)) {
          rumSitesList = siteListJson.result;
          debugLogs.rumSitesList = rumSitesList.map((s) => ({
            id: s.id,
            site_tag: s.site_tag,
            site_token: s.site_token,
            zone_name: s.ruleset?.zone_name,
            zone_tag: s.ruleset?.zone_tag,
          }));

          // Znajdź witrynę pasującą do cnchub.app lub wybierz pierwszą dostępną
          const match =
            rumSitesList.find((s) => s.ruleset?.zone_name?.includes('cnchub')) ||
            rumSitesList[0];

          if (match) {
            discoveredSiteTag = match.site_tag || match.id || discoveredSiteTag;
            if (match.ruleset?.zone_tag) {
              discoveredZoneTag = match.ruleset.zone_tag;
            }
          }
        }
      } catch (err) {
        debugLogs.errors.push(`site_info_list error: ${err.message}`);
      }

      // 2. Pobieranie danych RUM przez GraphQL
      const now = new Date();
      const sinceDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const sinceDatetime = `${sinceDate}T00:00:00Z`;

      let rumData = null;
      try {
        rumData = await fetchRumAnalytics(accountId, discoveredSiteTag, sinceDatetime, apiToken, debugLogs);
      } catch (err) {
        debugLogs.errors.push(`fetchRumAnalytics error: ${err.message}`);
      }

      // 3. Pobieranie analityki strefy (Zone HTTP Traffic), jeśli RUM nie ma danych lub jako uzupełnienie
      let zoneData = null;
      try {
        zoneData = await fetchZoneAnalytics(discoveredZoneTag, accountId, sinceDatetime, apiToken, debugLogs);
      } catch (err) {
        debugLogs.errors.push(`fetchZoneAnalytics error: ${err.message}`);
      }

      // 4. Połączenie lub wybór najlepszych danych
      const result = buildConsolidatedPayload(rumData, zoneData, debugLogs);

      if (isDebug) {
        result.debug = debugLogs;
      }

      return new Response(JSON.stringify(result, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': isDebug ? 'no-cache, no-store' : 'public, max-age=120, s-maxage=120',
        },
      });
    } catch (globalErr) {
      debugLogs.errors.push(`Global error: ${globalErr.message}`);
      if (isDebug) {
        return new Response(JSON.stringify({ error: globalErr.message, debug: debugLogs }, null, 2), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      return returnFallbackData(false, globalErr.message);
    }
  },
};

/**
 * Zapytanie GraphQL dla Cloudflare Web Analytics (RUM)
 */
async function fetchRumAnalytics(accountId, siteTag, sinceDatetime, apiToken, debugLogs) {
  // Jeśli mamy zidentyfikowany siteTag, filtrujemy po nim; jeśli nie, filtrujemy tylko po dacie
  const filterBlock = siteTag
    ? `{ siteTag: "${siteTag}", datetime_geq: "${sinceDatetime}" }`
    : `{ datetime_geq: "${sinceDatetime}" }`;

  const query = `
    query GetRumData($accountTag: String!) {
      viewer {
        accounts(filter: { accountTag: $accountTag }) {
          daily: rumPageloadEventsAdaptiveGroups(
            filter: ${filterBlock}
            limit: 100
            orderBy: [count_DESC]
          ) {
            count
            sum { visits }
            dimensions { date siteTag }
          }
          pages: rumPageloadEventsAdaptiveGroups(
            filter: ${filterBlock}
            limit: 40
            orderBy: [count_DESC]
          ) {
            count
            dimensions { requestPath }
          }
          countries: rumPageloadEventsAdaptiveGroups(
            filter: ${filterBlock}
            limit: 20
            orderBy: [count_DESC]
          ) {
            count
            dimensions { countryName }
          }
          devices: rumPageloadEventsAdaptiveGroups(
            filter: ${filterBlock}
            limit: 10
            orderBy: [count_DESC]
          ) {
            count
            dimensions { deviceType }
          }
        }
      }
    }
  `;

  const resp = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      query,
      variables: { accountTag: accountId },
    }),
  });

  const json = await resp.json();
  debugLogs.stages.push({
    stage: 'rum_graphql',
    status: resp.status,
    hasData: Boolean(json.data),
    errors: json.errors,
  });

  if (json.errors && json.errors.length > 0) {
    throw new Error(json.errors[0].message);
  }

  const account = json.data?.viewer?.accounts?.[0];
  if (!account) return null;

  return {
    daily: account.daily || [],
    pages: account.pages || [],
    countries: account.countries || [],
    devices: account.devices || [],
  };
}

/**
 * Zapytanie GraphQL dla Zone HTTP Traffic (wszystkie żądania HTTP do domeny cnchub.app)
 */
async function fetchZoneAnalytics(zoneTag, accountId, sinceDatetime, apiToken, debugLogs) {
  // Jeśli nie mamy zoneTag, najpierw pobierzmy strefy konta
  let targetZoneTag = zoneTag;

  if (!targetZoneTag) {
    try {
      const zonesResp = await fetch(
        `https://api.cloudflare.com/client/v4/zones?name=cnchub.app&status=active`,
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const zonesJson = await zonesResp.json();
      if (zonesJson.success && zonesJson.result?.[0]?.id) {
        targetZoneTag = zonesJson.result[0].id;
        debugLogs.discoveredZoneId = targetZoneTag;
      }
    } catch {
      /* noop */
    }
  }

  if (!targetZoneTag) return null;

  const query = `
    query GetZoneData($zoneTag: String!, $since: String!) {
      viewer {
        zones(filter: { zoneTag: $zoneTag }) {
          zoneTag
          name
          daily: httpRequestsAdaptiveGroups(
            filter: { datetime_geq: $since, requestSource: "eyeball" }
            limit: 100
            orderBy: [count_DESC]
          ) {
            count
            sum { visits edgeResponseBytes }
            dimensions { date }
          }
          paths: httpRequestsAdaptiveGroups(
            filter: { datetime_geq: $since, requestSource: "eyeball" }
            limit: 30
            orderBy: [count_DESC]
          ) {
            count
            dimensions { clientRequestPath }
          }
          countries: httpRequestsAdaptiveGroups(
            filter: { datetime_geq: $since, requestSource: "eyeball" }
            limit: 20
            orderBy: [count_DESC]
          ) {
            count
            dimensions { clientCountryName }
          }
          devices: httpRequestsAdaptiveGroups(
            filter: { datetime_geq: $since, requestSource: "eyeball" }
            limit: 10
            orderBy: [count_DESC]
          ) {
            count
            dimensions { clientDeviceType }
          }
        }
      }
    }
  `;

  const resp = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      query,
      variables: { zoneTag: targetZoneTag, since: sinceDatetime },
    }),
  });

  const json = await resp.json();
  debugLogs.stages.push({
    stage: 'zone_graphql',
    status: resp.status,
    hasData: Boolean(json.data),
    errors: json.errors,
  });

  if (json.errors && json.errors.length > 0) {
    debugLogs.errors.push(`Zone GraphQL Error: ${json.errors[0].message}`);
    return null;
  }

  const zone = json.data?.viewer?.zones?.[0];
  if (!zone) return null;

  return {
    daily: zone.daily || [],
    paths: zone.paths || [],
    countries: zone.countries || [],
    devices: zone.devices || [],
  };
}

/**
 * Scalanie i formatowanie wyników do jednolitego schematu CNC HUB
 */
function buildConsolidatedPayload(rumData, zoneData, debugLogs) {
  const rumPageviews = (rumData?.daily || []).reduce((acc, row) => acc + (row.count || 0), 0);
  const zoneRequests = (zoneData?.daily || []).reduce((acc, row) => acc + (row.count || 0), 0);

  debugLogs.rumPageviews = rumPageviews;
  debugLogs.zoneRequests = zoneRequests;

  // Sprawdzamy, które źródło posiada realne dane
  const hasRum = rumPageviews > 0;
  const hasZone = zoneRequests > 0;

  // Wybieramy źródło nadrzędne
  const primarySource = hasRum ? 'cloudflare-rum' : hasZone ? 'cloudflare-zone' : 'cloudflare-empty';

  // 1. Historia dzienna (posortowana chronologicznie)
  const historyMap = new Map();
  const sourceDaily = hasRum ? rumData.daily : hasZone ? zoneData.daily : [];

  sourceDaily.forEach((row) => {
    const d = row.dimensions?.date;
    if (!d) return;
    const views = row.count || 0;
    const visits = row.sum?.visits || Math.max(1, Math.round(views * 0.45));

    if (historyMap.has(d)) {
      const cur = historyMap.get(d);
      cur.pageviews += views;
      cur.visits += visits;
    } else {
      historyMap.set(d, { date: d, visits, pageviews: views });
    }
  });

  const history = Array.from(historyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  let totalPageviews = history.reduce((acc, h) => acc + h.pageviews, 0);
  let totalVisits = history.reduce((acc, h) => acc + h.visits, 0);

  // 2. Podstrony
  let rawPages = [];
  if (hasRum && rumData.pages.length > 0) {
    rawPages = rumData.pages.map((p) => {
      const rawPath = p.dimensions?.requestPath || '/';
      const cleanPath = rawPath.replace(/^#/, '');
      return {
        path: cleanPath,
        name: PATH_NAMES[cleanPath] || cleanPath,
        views: p.count || 0,
      };
    });
  } else if (hasZone && zoneData.paths.length > 0) {
    rawPages = zoneData.paths.map((p) => {
      const rawPath = p.dimensions?.clientRequestPath || '/';
      const cleanPath = rawPath.replace(/^#/, '');
      return {
        path: cleanPath,
        name: PATH_NAMES[cleanPath] || cleanPath,
        views: p.count || 0,
      };
    });
  }

  // Grupowanie zduplikowanych ścieżek
  const pageMap = new Map();
  rawPages.forEach((p) => {
    if (pageMap.has(p.path)) {
      pageMap.get(p.path).views += p.views;
    } else {
      pageMap.set(p.path, { ...p });
    }
  });
  const topPages = Array.from(pageMap.values()).sort((a, b) => b.views - a.views).slice(0, 15);

  // 3. Kraje
  const sourceCountries = hasRum ? rumData.countries : hasZone ? zoneData.countries : [];
  const countryMap = new Map();

  sourceCountries.forEach((c) => {
    const rawName = c.dimensions?.countryName || c.dimensions?.clientCountryName || 'Inny';
    const views = c.count || 0;
    const name = COUNTRY_NAMES[rawName] || rawName;
    const code = rawName.length === 2 ? rawName.toUpperCase() : 'XX';

    if (countryMap.has(name)) {
      countryMap.get(name).views += views;
    } else {
      countryMap.set(name, { code, name, views });
    }
  });
  const topCountries = Array.from(countryMap.values()).sort((a, b) => b.views - a.views).slice(0, 10);

  // 4. Urządzenia
  let mobileCount = 0;
  let desktopCount = 0;
  const sourceDevices = hasRum ? rumData.devices : hasZone ? zoneData.devices : [];

  sourceDevices.forEach((d) => {
    const type = (d.dimensions?.deviceType || d.dimensions?.clientDeviceType || '').toLowerCase();
    const count = d.count || 0;
    if (type.includes('mobile') || type.includes('phone') || type.includes('tablet')) {
      mobileCount += count;
    } else {
      desktopCount += count;
    }
  });

  const devSum = mobileCount + desktopCount || 1;
  const devices = {
    mobile: Math.round((mobileCount / devSum) * 100) || 75,
    desktop: Math.round((desktopCount / devSum) * 100) || 25,
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = history.find((h) => h.date === todayStr);

  return {
    source: primarySource,
    updatedAt: new Date().toISOString(),
    summary: {
      totalPageviews,
      totalVisits,
      todayPageviews: todayEntry ? todayEntry.pageviews : 0,
      todayVisits: todayEntry ? todayEntry.visits : 0,
    },
    history,
    topPages,
    topCountries,
    devices,
  };
}

function returnFallbackData(isSetupPending, errorMsg) {
  return new Response(
    JSON.stringify(
      {
        source: isSetupPending ? 'demo' : 'fallback',
        notice: errorMsg || 'Brak danych telemetrycznych.',
        updatedAt: new Date().toISOString(),
        summary: { totalPageviews: 0, totalVisits: 0, todayPageviews: 0, todayVisits: 0 },
        history: [],
        topPages: [],
        topCountries: [],
        devices: { mobile: 75, desktop: 25 },
      },
      null,
      2
    ),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
    }
  );
}
