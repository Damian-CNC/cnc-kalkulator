/**
 * Baza materiałów: nazwa, oznaczenie EN / numer, polskie oznaczenie (PN), odpowiednik USA,
 * nazwy handlowe, grupa ISO, gęstość [g/cm³] i współczynnik rozszerzalności liniowej
 * α [µm/(m·K)], ok. 20–100 °C. Wartości orientacyjne, zależą od dostawcy i stanu materiału.
 * „≈” = odpowiednik zbliżony, „—” = brak lub nieznany, null = brak pewnej wartości.
 */

export type MatGroup = 'P' | 'M' | 'K' | 'N' | 'S' | 'H' | 'O';
export const MAT_GROUPS: MatGroup[] = ['P', 'M', 'K', 'N', 'S', 'H', 'O'];

import { CATALOG_COLUMNS, CATALOG_RAW, type CatalogColumn } from '@/lib/materialsCatalog';

export type Material = {
  id: string;
  group: MatGroup;
  groups: MatGroup[]; // wszystkie grupy ISO, w których występuje materiał
  cmc: string[]; // kody grup CMC (katalog), np. P.2.2
  eq: Partial<Record<CatalogColumn, string>>; // odpowiedniki wg innych norm
  name: string;
  en: string; // numer materiałowy / oznaczenie EN
  pn: string; // polskie oznaczenie (PN), jeśli istnieje
  us: string;
  alt: string; // nazwy handlowe i inne oznaczenia do wyszukiwania
  rho: number | null;
  alpha: number | null;
};

const M = (
  group: MatGroup, id: string, name: string, en: string, us: string,
  rho: number | null, alpha: number | null, pn = '', alt = '',
): Material => ({ id, group, groups: [group], cmc: [], eq: {}, name, en, pn, us, alt, rho, alpha });

const CURATED: Material[] = [
  // ===== P — stale konstrukcyjne i do ulepszania =====
  M('P', 'c15', 'C15 (C15E)', '1.0401 / 1.1141', 'AISI 1015', 7.85, 11.7, '15'),
  M('P', 'c22', 'C22 (C22E)', '1.0402 / 1.1151', 'AISI 1020', 7.85, 11.7, '20 (≈)'),
  M('P', 'c35', 'C35 (C35E)', '1.0501 / 1.1181', 'AISI 1035', 7.85, 11.1, '35'),
  M('P', 'c40', 'C40 (C40E)', '1.0511 / 1.1186', 'AISI 1040', 7.85, 11.1, '40'),
  M('P', 'c45', 'C45 (C45E)', '1.0503 / 1.1191', 'AISI / SAE 1045', 7.85, 11.1, '45'),
  M('P', 'c55', 'C55 (C55E)', '1.0535 / 1.1203', 'AISI 1055', 7.85, 11.1, '55'),
  M('P', 'c60', 'C60 (C60E)', '1.0601 / 1.1221', 'AISI 1060', 7.85, 11.1, '60'),
  M('P', 's235', 'S235JR', '1.0038', '≈ ASTM A283 gr. C', 7.85, 11.7, 'St3S (≈)', 'St37-2'),
  M('P', 's355', 'S355J2', '1.0577', '≈ ASTM A572 gr. 50', 7.85, 11.7, '18G2A (≈)'),
  M('P', '11smn30', '11SMn30', '1.0715', 'AISI 1215', 7.85, 11.7, '', 'automatowa'),
  M('P', '11smnpb30', '11SMnPb30', '1.0718', 'AISI 12L14', 7.85, 11.7, '', 'automatowa'),
  M('P', '16mncr5', '16MnCr5', '1.7131', '≈ SAE 5115', 7.85, 11.5, '16HG'),
  M('P', '20mncr5', '20MnCr5', '1.7147', '≈ SAE 5120', 7.85, 11.5),
  M('P', '41cr4', '41Cr4', '1.7035', '≈ AISI 5140', 7.85, 12.0, '40H'),
  M('P', '25crmo4', '25CrMo4', '1.7218', 'AISI 4130', 7.85, 12.3),
  M('P', '42crmo4', '42CrMo4', '1.7225', 'AISI / SAE 4140', 7.85, 12.3),
  M('P', '34crnimo6', '34CrNiMo6', '1.6582', 'AISI / SAE 4340', 7.85, 12.3, '34HNM'),
  M('P', '17crnimo6', '17CrNiMo6', '1.6587', '—', 7.85, 11.5, '17HNM'),
  M('P', '15crni6', '15CrNi6', '1.5919', '—', 7.85, 11.5, '15HN'),
  M('P', '18crni8', '18CrNi8', '1.5920', '—', 7.85, 11.5, '18H2N2'),
  M('P', '51crv4', '51CrV4', '1.8159', 'AISI / SAE 6150', 7.85, 11.9, '50HF', 'resorowa'),
  M('P', '41cralmo7', '41CrAlMo7-10', '1.8509', '—', 7.8, null, '38HMJ', 'azotowana'),
  M('P', '34cralni7', '34CrAlNi7-10', '1.8550', '—', 7.8, null, '33H2NMJ', 'azotowana'),
  M('P', '30crmov9', '30CrMoV9', '1.7707', '—', 7.85, null, '30H2MF'),
  M('P', '14mov6-3', '14MoV6-3', '1.7715', '—', 7.85, null, '13HMF'),
  M('P', '21crmov5-11', '21CrMoV5-11', '1.8070', '—', 7.85, null, '21HMF'),
  M('P', 'p460n', 'P460N', '1.8905', '—', 7.85, 11.7, '18G2AV'),
  M('P', '100cr6', '100Cr6', '1.3505', 'AISI / SAE 52100', 7.81, 11.9, 'ŁH15', 'łożyskowa'),

  // ===== P — stale narzędziowe =====
  M('P', 'd2', 'X153CrMoV12 (NC11LV)', '1.2379', 'AISI D2', 7.7, 10.4, 'NC11LV', 'K110 SKD11 X155CrVMo12-1 X160CrMoV12-1'),
  M('P', 'd3', 'X210Cr12', '1.2080', 'AISI D3', 7.7, 10.8, 'NC11', 'X210Cr12'),
  M('P', 'nc10', 'NC10', '1.2201', '—', null, null, 'NC10'),
  M('P', 'nc6', 'NC6', '1.2063', '—', null, null, 'NC6'),
  M('P', 'nw1', '115CrV3', '1.2210', '—', 7.8, null, 'NW1'),
  M('P', 'nz3', '60WCrV7', '1.2550', 'AISI S1', 7.8, null, 'NZ3'),
  M('P', 'o1', '100MnCrW4', '1.2510', 'AISI O1', 7.8, 11.5),
  M('P', 'o2', '90MnCrV8', '1.2842', 'AISI O2', 7.8, 11.5, 'NMV'),
  M('P', 'h11', 'X37CrMoV5-1', '1.2343', 'AISI H11', 7.8, 11.5, 'WCL'),
  M('P', 'h13', 'X40CrMoV5-1', '1.2344', 'AISI H13', 7.8, 11.5, 'WCLV'),
  M('P', 'h10', 'X32CrMoV3-3', '1.2365', 'AISI H10', 7.8, null, 'WLV'),
  M('P', 'l6', '56NiCrMoV7', '1.2714', 'AISI L6', 7.8, null, 'WNLV'),
  M('P', 'p20', '40CrMnMo7', '1.2311', 'AISI P20', 7.8, 12.0, '', 'formy do tworzyw'),
  M('P', 'p20s', '40CrMnMoS8-6', '1.2312', 'AISI P20+S', 7.8, null, '', 'formy do tworzyw'),
  M('P', '1.2738', '40CrMnNiMo8-6-4', '1.2738', 'AISI P20+Ni', 7.8, null, '', 'formy do tworzyw'),
  M('P', '1.2767', 'X45NiCrMo4', '1.2767', '—', 7.8, null, '', 'formy do tworzyw'),
  M('P', '1.2083', 'X40Cr14', '1.2083', '≈ AISI 420', 7.7, 10.5, '', 'formy do tworzyw'),
  M('P', 'm2', 'HS6-5-2', '1.3343', 'AISI M2', 8.15, 11.0, 'SW7M', 'szybkotnąca'),
  M('P', 'm35', 'HS6-5-2-5', '1.3243', 'AISI M35', 8.15, 11.0, 'SK5M', 'szybkotnąca kobaltowa'),
  M('P', 'm42', 'HS2-9-1-8', '1.3247', 'AISI M42', 8.0, null, 'SK8M', 'szybkotnąca kobaltowa'),
  M('P', 'hs10-4-3-10', 'HS10-4-3-10', '1.3207', '—', null, null, 'SK10V', 'szybkotnąca'),
  M('P', 't1', 'HS18-0-1', '1.3355', 'AISI T1', 8.7, null, 'SW18', 'szybkotnąca'),

  // ===== M — stale nierdzewne =====
  M('M', '304', 'X5CrNi18-10', '1.4301', 'AISI 304', 7.9, 17.2, '0H18N9'),
  M('M', '304l', 'X2CrNi19-11', '1.4306', 'AISI 304L', 7.9, 17.2, '00H18N10'),
  M('M', '303', 'X8CrNiS18-9', '1.4305', 'AISI 303', 7.9, 17.2, '', 'automatowa'),
  M('M', '321', 'X6CrNiTi18-10', '1.4541', 'AISI 321', 7.9, 16.6, '1H18N9T'),
  M('M', '316', 'X5CrNiMo17-12-2', '1.4401', 'AISI 316', 8.0, 16.0),
  M('M', '316l', 'X2CrNiMo17-12-2', '1.4404', 'AISI 316L', 8.0, 16.0, '00H17N14M2'),
  M('M', '316ti', 'X6CrNiMoTi17-12-2', '1.4571', 'AISI 316Ti', 8.0, 16.5, '0H17N12M2T'),
  M('M', '430', 'X6Cr17', '1.4016', 'AISI 430', 7.7, 10.4, 'H17'),
  M('M', '430f', 'X14CrMoS17', '1.4104', 'AISI 430F', 7.7, 10.4, '', 'automatowa'),
  M('M', '410', 'X12Cr13', '1.4006', 'AISI 410', 7.7, 10.4, 'H13'),
  M('M', '420', 'X20Cr13', '1.4021', 'AISI 420', 7.7, 10.3, '2H13'),
  M('M', '3h13', 'X30Cr13', '1.4028', '≈ AISI 420', 7.7, 10.3, '3H13'),
  M('M', '4h13', 'X46Cr13', '1.4034', '≈ AISI 420', 7.7, 10.3, '4H13', 'X39Cr13 1.4031'),
  M('M', '431', 'X17CrNi16-2', '1.4057', 'AISI 431', 7.7, 10.2),
  M('M', '440b', 'X90CrMoV18', '1.4112', 'AISI 440B', 7.7, 10.2),
  M('M', '440c', 'X105CrMo17', '1.4125', 'AISI 440C', 7.65, 10.2),
  M('M', '17-4', 'X5CrNiCuNb16-4', '1.4542', '17-4 PH', 7.8, 10.8),
  M('M', 'duplex', 'X2CrNiMoN22-5-3', '1.4462', 'UNS S32205 (duplex 2205)', 7.8, 13.0),

  // ===== K — żeliwa =====
  M('K', 'gjl250', 'EN-GJL-250 (GG25)', 'EN-JL1040 / 0.6025', '≈ ASTM A48 class 35', 7.2, 10.5, 'Zl250', 'szare'),
  M('K', 'gjs400', 'EN-GJS-400-15 (GGG40)', 'EN-JS1030 / 0.7040', '≈ ASTM A536 60-40-18', 7.1, 12.0, 'Zs400-15', 'sferoidalne'),
  M('K', 'gjs500', 'EN-GJS-500-7 (GGG50)', 'EN-JS1050 / 0.7050', '≈ ASTM A536 80-55-06', 7.1, 12.0, 'Zs500-7', 'sferoidalne'),

  // ===== N — metale nieżelazne =====
  M('N', 'al1050', 'EN AW-1050A (Al99,5)', '3.0255', 'AA 1050', 2.71, 23.6, 'A1'),
  M('N', 'al2014', 'EN AW-2014 (AlCuSiMn)', '3.1255', 'AA 2014', 2.8, 23.0, 'PA33'),
  M('N', 'al2017a', 'EN AW-2017A (AlCu4MgSi)', '3.1325', 'AA 2017A', 2.79, 23.6, 'PA6', 'duraluminium'),
  M('N', 'al2024', 'EN AW-2024 (AlCu4Mg1)', '3.1355', 'AA 2024', 2.78, 22.9, 'PA7'),
  M('N', 'al5083', 'EN AW-5083 (AlMg4,5Mn0,7)', '3.3547', 'AA 5083', 2.66, 23.8, 'PA13'),
  M('N', 'al5251', 'EN AW-5251 (AlMg2)', '—', 'AA 5251', 2.69, 23.8, 'PA2'),
  M('N', 'al5754', 'EN AW-5754 (AlMg3)', '3.3535', 'AA 5754', 2.68, 23.7, 'PA11'),
  M('N', 'al6060', 'EN AW-6060 (AlMgSi)', '3.3206', 'AA 6060', 2.7, 23.4, 'PA38', 'Aldrey'),
  M('N', 'al6061', 'EN AW-6061 (AlMg1SiCu)', '3.3211', 'AA 6061', 2.7, 23.6, 'PA45'),
  M('N', 'al6082', 'EN AW-6082 (AlSi1MgMn)', '3.2315', 'AA 6082', 2.71, 23.1, 'PA4', 'Anticorodal'),
  M('N', 'al7020', 'EN AW-7020 (AlZn4,5Mg1)', '3.4335', 'AA 7020', 2.78, 23.1, 'PA47'),
  M('N', 'al7075', 'EN AW-7075 (AlZn5,5MgCu)', '3.4365', 'AA 7075', 2.81, 23.5, 'PA9', 'Fortal'),
  M('N', 'cu', 'Cu-ETP', 'CW004A / 2.0065', 'UNS C11000', 8.9, 16.9, 'M1E (≈)'),
  M('N', 'cw614n', 'CuZn39Pb3 (mosiądz automatowy)', 'CW614N / 2.0401', '≈ UNS C38500 / C36000', 8.5, 20.5, 'MM59 (≈)'),
  M('N', 'cw612n', 'CuZn39Pb2 (mosiądz)', 'CW612N / 2.0380', '—', 8.45, 20.5, 'MO58 (≈)'),
  M('N', 'cw508l', 'CuZn37 (mosiądz)', 'CW508L / 2.0321', '≈ UNS C27400', 8.4, 20.2, 'M63 (≈)'),
  M('N', 'cusn8', 'CuSn8 (brąz cynowy)', 'CW453K / 2.1030', '≈ UNS C52100', 8.8, 18.5),
  M('N', 'cuan', 'CuAl10Ni5Fe4 (brąz aluminiowy)', 'CW307G / 2.0966', '≈ UNS C63000', 7.6, 16.2),

  // ===== S — tytan i stopy żaroodporne =====
  M('S', 'ti2', 'Tytan Grade 2', '3.7035', 'ASTM Grade 2', 4.51, 8.6),
  M('S', 'ti64', 'Ti-6Al-4V', '3.7165', 'ASTM Grade 5', 4.43, 8.6),
  M('S', 'in718', 'Inconel 718', '2.4668', 'UNS N07718', 8.19, 13.0),
  M('S', 'in625', 'Inconel 625', '2.4856', 'UNS N06625', 8.44, 12.8),

  // ===== X — tworzywa =====
  M('O', 'peek', 'PEEK', 'PEEK', '—', 1.31, 47),
  M('O', 'uhmw', 'PE-UHMW (PE-1000)', 'PE-UHMW', '—', 0.94, 200),
  M('O', 'pet', 'PET', 'PET', '—', 1.38, 60),
  M('O', 'abs', 'ABS', 'ABS', '—', 1.05, 85),
];


// ===== scalenie z tabelą katalogową =====

const O_INFO: Record<string, { name: string; rho: number | null; alpha: number | null }> = {
  EP: { name: 'EP (żywica epoksydowa)', rho: null, alpha: null },
  MF: { name: 'MF (żywica melaminowa)', rho: null, alpha: null },
  PF: { name: 'PF (żywica fenolowa)', rho: null, alpha: null },
  UP: { name: 'UP (żywica poliestrowa nienasycona)', rho: null, alpha: null },
  PA: { name: 'PA (poliamid)', rho: 1.14, alpha: 80 },
  PC: { name: 'PC (poliwęglan)', rho: 1.2, alpha: 65 },
  PE: { name: 'PE (polietylen)', rho: 0.95, alpha: 200 },
  PI: { name: 'PI (poliimid)', rho: null, alpha: null },
  PMMA: { name: 'PMMA (pleksi)', rho: 1.19, alpha: 70 },
  POM: { name: 'POM (acetal)', rho: 1.41, alpha: 110 },
  PP: { name: 'PP (polipropylen)', rho: 0.91, alpha: 150 },
  PS: { name: 'PS (polistyren)', rho: 1.05, alpha: 70 },
  PTFE: { name: 'PTFE (teflon)', rho: 2.16, alpha: 130 },
  PVC: { name: 'PVC (polichlorek winylu)', rho: 1.4, alpha: 70 },
  AFK: { name: 'AFK (kompozyt z włóknem aramidowym)', rho: null, alpha: null },
  CFK: { name: 'CFK (kompozyt z włóknem węglowym)', rho: null, alpha: null },
  GFK: { name: 'GFK (kompozyt z włóknem szklanym)', rho: null, alpha: null },
  Graphit: { name: 'Grafit', rho: null, alpha: null },
};

type CatRow = { key: string; nr: string; eq: Partial<Record<CatalogColumn, string>>; cmc: string[] };

const parseCatalog = (): CatRow[] => {
  const map = new Map<string, CatRow>();
  let cmc = '';
  for (const raw of CATALOG_RAW.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      cmc = line.slice(1);
      continue;
    }
    const parts = line.split('|').map((x) => x.trim());
    const nr = parts[0];
    const row = map.get(nr) ?? { key: nr, nr, eq: {}, cmc: [] };
    CATALOG_COLUMNS.forEach((col, i) => {
      const v = parts[i + 1];
      if (v && !row.eq[col]) row.eq[col] = v;
    });
    if (!row.cmc.includes(cmc)) row.cmc.push(cmc);
    map.set(nr, row);
  }
  return [...map.values()];
};

const letterOf = (c: string) => c[0] as MatGroup;
const uniqGroups = (list: MatGroup[]) => [...new Set(list)];

const build = (): Material[] => {
  const rows = parseCatalog();
  const byNr = new Map(rows.map((r) => [r.nr, r]));
  const used = new Set<string>();

  // materiały ręcznie opisane: dołączamy odpowiedniki i kody CMC z katalogu
  const merged = CURATED.map((m) => {
    const nrs = m.en.match(/\b\d\.\d{4}\b/g) ?? [];
    const eq: Material['eq'] = { ...m.eq };
    const cmc = [...m.cmc];
    for (const nr of nrs) {
      const r = byNr.get(nr);
      if (!r) continue;
      used.add(nr);
      for (const col of CATALOG_COLUMNS) if (r.eq[col] && !eq[col]) eq[col] = r.eq[col];
      for (const c of r.cmc) if (!cmc.includes(c)) cmc.push(c);
    }
    const out: Material = { ...m, eq, cmc, groups: uniqGroups([m.group, ...cmc.map(letterOf)]) };
    // numery z katalogu do wyszukiwania
    return out;
  });

  // pozostałe wiersze katalogu
  const extra: Material[] = [];
  for (const r of rows) {
    if (used.has(r.nr)) continue;
    const isNr = /^\d\.\d{4}/.test(r.nr);
    const o = O_INFO[r.nr];
    const din = r.eq.din ?? '';
    const name = o ? o.name : isNr ? din || r.nr : `${r.nr}${din ? ` (${din})` : ''}`;
    const eq = { ...r.eq };
    delete eq.din;
    delete eq.usa;
    const group = letterOf(r.cmc[0]);
    extra.push({
      id: `cat-${r.key}`,
      group,
      groups: uniqGroups(r.cmc.map(letterOf)),
      cmc: r.cmc,
      eq,
      name,
      en: isNr ? r.nr : '',
      pn: '',
      us: r.eq.usa ?? '—',
      alt: o ? r.nr : '',
      rho: o ? o.rho : null,
      alpha: o ? o.alpha : null,
    });
  }
  return [...merged, ...extra];
};

export const MATERIALS: Material[] = build();

export const findMaterial = (id: string) => MATERIALS.find((m) => m.id === id);

/** Tekst do wyszukiwania: nazwa, numery, PN, odpowiedniki, nazwy handlowe i kody CMC. */
export const searchText = (m: Material): string =>
  [m.name, m.en, m.pn, m.us, m.alt, m.cmc.join(' '), ...Object.values(m.eq)].join(' ');
