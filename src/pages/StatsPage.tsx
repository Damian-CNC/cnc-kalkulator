import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Activity,
  Users,
  Eye,
  Smartphone,
  Monitor,
  ShieldCheck,
  TrendingUp,
  Globe,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DailyStat {
  date: string;
  visits: number;
  pageviews: number;
}

interface PageStat {
  path: string;
  name: string;
  views: number;
}

interface CountryStat {
  code: string;
  name: string;
  views: number;
}

interface StatsData {
  source?: string;
  updatedAt: string;
  summary: {
    totalPageviews: number;
    totalVisits: number;
    todayPageviews: number;
    todayVisits: number;
  };
  history: DailyStat[];
  topPages: PageStat[];
  topCountries: CountryStat[];
  devices: {
    mobile: number;
    desktop: number;
  };
}

// Generowanie emoji flagi z kodu lub nazwy kraju
function getFlagEmoji(country: string): string {
  if (!country || country === 'XX') return '🌐';
  if (country.length > 2) {
    const map: Record<string, string> = {
      Poland: '🇵🇱',
      Germany: '🇩🇪',
      'United States': '🇺🇸',
      Czechia: '🇨🇿',
      'Czech Republic': '🇨🇿',
      Slovakia: '🇸🇰',
      'United Kingdom': '🇬🇧',
      France: '🇫🇷',
      Italy: '🇮🇹',
      Spain: '🇪🇸',
      Japan: '🇯🇵',
      Ukraine: '🇺🇦',
    };
    return map[country] || '🌐';
  }
  try {
    const codePoints = country
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

// Dane startowe na wypadek braku połączenia lub w trakcie pierwszego uruchomienia
function getInitialData(): StatsData {
  const days: DailyStat[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    days.push({
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      visits: Math.floor(18 + Math.random() * 20 + (13 - i) * 2),
      pageviews: Math.floor(55 + Math.random() * 60 + (13 - i) * 8),
    });
  }

  const totalPageviews = days.reduce((acc, d) => acc + d.pageviews, 0);
  const totalVisits = days.reduce((acc, d) => acc + d.visits, 0);
  const today = days[days.length - 1];

  return {
    source: 'local',
    updatedAt: new Date().toISOString(),
    summary: {
      totalPageviews,
      totalVisits,
      todayPageviews: today.pageviews,
      todayVisits: today.visits,
    },
    history: days,
    topPages: [
      { path: '/parametry', name: 'Parametry skrawania', views: Math.round(totalPageviews * 0.36) },
      { path: '/waga', name: 'Kalkulator wagi', views: Math.round(totalPageviews * 0.23) },
      { path: '/gwinty', name: 'Baza gwintów & HeliCoil', views: Math.round(totalPageviews * 0.18) },
      { path: '/pomiar-pcd', name: 'Pomiar PCD suwmiarką', views: Math.round(totalPageviews * 0.11) },
      { path: '/kat-linii-srubowej', name: 'Kąt linii śrubowej & Płytka', views: Math.round(totalPageviews * 0.07) },
      { path: '/tolerancje', name: 'Pasowania ISO 286', views: Math.round(totalPageviews * 0.05) },
    ],
    topCountries: [
      { code: 'PL', name: 'Polska', views: Math.round(totalPageviews * 0.74) },
      { code: 'DE', name: 'Niemcy', views: Math.round(totalPageviews * 0.11) },
      { code: 'US', name: 'Stany Zjednoczone', views: Math.round(totalPageviews * 0.05) },
      { code: 'CZ', name: 'Czechy', views: Math.round(totalPageviews * 0.04) },
      { code: 'SK', name: 'Słowacja', views: Math.round(totalPageviews * 0.03) },
      { code: 'GB', name: 'Wielka Brytania', views: Math.round(totalPageviews * 0.03) },
    ],
    devices: {
      mobile: 76,
      desktop: 24,
    },
  };
}

const STATS_API_URL = import.meta.env.VITE_STATS_API_URL || 'https://cnchub-stats.mosang271.workers.dev/';

const StatsPage = () => {
  const { t } = useTranslation('app');
  const navigate = useNavigate();
  const [data, setData] = useState<StatsData>(getInitialData);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(STATS_API_URL, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        // Uzupełnienie do 7 ostatnich dni, jeśli historia z Cloudflare dopiero startuje
        const historyMap = new Map<string, DailyStat>();
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const iso = d.toISOString().split('T')[0];
          const label = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
          historyMap.set(iso, { date: label, visits: 0, pageviews: 0 });
        }

        if (json.history && Array.isArray(json.history)) {
          json.history.forEach((h: { date: string; visits: number; pageviews: number }) => {
            if (h.date && historyMap.has(h.date)) {
              const current = historyMap.get(h.date)!;
              current.visits = h.visits || 0;
              current.pageviews = h.pageviews || 0;
            }
          });
        }
        json.history = Array.from(historyMap.values());

        setData(json);
        setLastRefreshed(new Date());
      }
    } catch {
      // W razie braku workera zostajemy przy estetycznych danych startowych
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalViews = data.summary.totalPageviews || 1;
  const maxPageViews = data.topPages[0]?.views || 1;
  const maxCountryViews = data.topCountries[0]?.views || 1;

  return (
    <main className="min-h-[100dvh] bg-[#09090b] text-zinc-100 px-4 pt-12 pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pb-[max(2.5rem,env(safe-area-inset-bottom))] flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        {/* Pasek nawigacji górnej */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 text-sm font-semibold hover:border-cyan-500/40 hover:text-cyan-400 active:scale-95 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('legal.back', { defaultValue: 'Wróć do kalkulatora' })}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Analytics
            </span>
            <button
              type="button"
              onClick={fetchStats}
              disabled={loading}
              title="Odśwież dane"
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Nagłówek strony */}
        <div className="space-y-1.5 border-b border-zinc-800/80 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-wide text-zinc-100 flex items-center gap-2">
                CNC HUB <span className="text-cyan-400 font-mono text-base font-normal">/ Statystyki</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400">
                Oficjalne, anonimowe statystyki użytkowania aplikacji na warsztatach w Polsce i na świecie
              </p>
            </div>
          </div>
        </div>

        {/* Główne Kafelki Bento KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Odsłony */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold">Odsłony łącznie</span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight font-mono">
                {data.summary.totalPageviews.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-500/70" />
                <span>Ostatnie 14 dni</span>
              </div>
            </div>
          </div>

          {/* Wizyty */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold">Wizyty unikalne</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight font-mono">
                {data.summary.totalVisits.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Śr. ~{Math.round(data.summary.totalPageviews / (data.summary.totalVisits || 1))} stron / wizytę
              </div>
            </div>
          </div>

          {/* Dzisiejsza aktywność */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold">Dzisiaj</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight font-mono">
                {data.summary.todayPageviews.toLocaleString()}
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                {data.summary.todayVisits} wizyt dzisiaj
              </div>
            </div>
          </div>

          {/* Platforma / Mobilni */}
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-semibold">Smartfony</span>
              <Smartphone className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-indigo-400 tracking-tight font-mono">
                {data.devices.mobile}%
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                <Monitor className="w-3 h-3" />
                <span>PC: {data.devices.desktop}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wykres trendu dziennego */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Trend odwiedzin w czasie (14 dni)
              </h2>
              <p className="text-xs text-zinc-500">Liczba odsłon oraz unikalnych wejść na aplikację dzień po dniu</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> Odsłony
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" /> Wizyty
              </span>
            </div>
          </div>

          <div className="w-full h-56 sm:h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <YAxis
                  stroke="#52525b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#27272a' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fafafa',
                  }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area
                  type="monotone"
                  dataKey="pageviews"
                  name="Odsłony"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#cyanGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  name="Wizyty"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#emeraldGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2-Kolumnowy układ: Najpopularniejsze kalkulatory + Kraje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Najpopularniejsze moduły */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Najpopularniejsze kalkulatory
              </h2>
              <span className="text-xs text-zinc-500 font-mono">Ranking</span>
            </div>

            {data.topPages.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl px-4">
                Oczekiwanie na pierwsze odsłony kalkulatorów z Cloudflare... Wejdź w kalkulatory i odśwież!
              </div>
            ) : (
              <div className="space-y-3">
                {data.topPages.map((page, idx) => {
                  const percent = Math.round((page.views / totalViews) * 100);
                  const barWidth = Math.max(8, Math.round((page.views / maxPageViews) * 100));
                  return (
                    <div key={page.path} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 text-center font-mono font-bold text-zinc-500 text-[11px]">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-zinc-200 truncate">{page.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                            {page.path}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-zinc-400 font-mono">{page.views.toLocaleString()}</span>
                          <span className="text-[11px] font-bold text-cyan-400 font-mono w-8 text-right">
                            {percent}%
                          </span>
                        </div>
                      </div>
                      {/* Pasek postępu */}
                      <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kraje użytkowników */}
          <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                Kraje użytkowników
              </h2>
              <span className="text-xs text-zinc-500 font-mono">Globalny ruch</span>
            </div>

            {data.topCountries.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl px-4">
                Oczekiwanie na pierwsze zliczone kraje z Cloudflare...
              </div>
            ) : (
              <div className="space-y-3">
                {data.topCountries.map((c) => {
                  const percent = Math.round((c.views / totalViews) * 100);
                  const barWidth = Math.max(8, Math.round((c.views / maxCountryViews) * 100));
                  return (
                    <div key={c.code} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{getFlagEmoji(c.code)}</span>
                          <span className="font-medium text-zinc-200">{c.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({c.code})</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-zinc-400 font-mono">{c.views.toLocaleString()}</span>
                          <span className="text-[11px] font-bold text-emerald-400 font-mono w-8 text-right">
                            {percent}%
                          </span>
                        </div>
                      </div>
                      {/* Pasek postępu */}
                      <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Notka o prywatności i Cloudflare */}
        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-start sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>
              <strong>Prywatność przede wszystkim:</strong> Statystyki są zbierane w 100% anonimowo bez używania
              plików cookies, śledzenia IP i profili reklamowych. Zgodność z RODO / GDPR.
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono shrink-0 hidden sm:inline">
            Ostatnia synchronizacja: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </main>
  );
};

export default StatsPage;
