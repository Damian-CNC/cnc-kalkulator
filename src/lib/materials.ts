/**
 * Baza materiałów: oznaczenia (EN, numer, odpowiednik amerykański), grupa ISO,
 * gęstość [g/cm³] i współczynnik rozszerzalności liniowej α [µm/(m·K)], ok. 20–100 °C.
 * Wartości orientacyjne, zależą od dostawcy i stanu materiału. „≈” = odpowiednik zbliżony.
 */

export type MatGroup = 'P' | 'M' | 'K' | 'N' | 'S' | 'X';
export const MAT_GROUPS: MatGroup[] = ['P', 'M', 'K', 'N', 'S', 'X'];

export type Material = {
  id: string;
  group: MatGroup;
  name: string;
  en: string;
  us: string;
  rho: number;
  alpha: number;
};

const M = (
  group: MatGroup, id: string, name: string, en: string, us: string, rho: number, alpha: number,
): Material => ({ id, group, name, en, us, rho, alpha });

export const MATERIALS: Material[] = [
  // P — stale
  M('P', 'c15', 'C15 (C15E)', '1.0401 / 1.1141', 'AISI 1015', 7.85, 11.7),
  M('P', 'c35', 'C35 (C35E)', '1.0501 / 1.1181', 'AISI 1035', 7.85, 11.1),
  M('P', 'c45', 'C45 (C45E)', '1.0503 / 1.1191', 'AISI / SAE 1045', 7.85, 11.1),
  M('P', 'c60', 'C60 (C60E)', '1.0601 / 1.1221', 'AISI 1060', 7.85, 11.1),
  M('P', 's235', 'S235JR', '1.0038', '≈ ASTM A283 gr. C', 7.85, 11.7),
  M('P', 's355', 'S355J2', '1.0577', '≈ ASTM A572 gr. 50', 7.85, 11.7),
  M('P', '11smn30', '11SMn30', '1.0715', 'AISI 1215', 7.85, 11.7),
  M('P', '16mncr5', '16MnCr5', '1.7131', '≈ SAE 5115', 7.85, 11.5),
  M('P', '20mncr5', '20MnCr5', '1.7147', '≈ SAE 5120', 7.85, 11.5),
  M('P', '42crmo4', '42CrMo4', '1.7225', 'AISI / SAE 4140', 7.85, 12.3),
  M('P', '34crnimo6', '34CrNiMo6', '1.6582', 'AISI / SAE 4340', 7.85, 12.3),
  M('P', '100cr6', '100Cr6', '1.3505', 'AISI / SAE 52100', 7.81, 11.9),
  M('P', 'd2', 'X153CrMoV12', '1.2379', 'AISI D2', 7.7, 10.4),
  M('P', 'h11', 'X37CrMoV5-1', '1.2343', 'AISI H11', 7.8, 11.5),
  M('P', 'h13', 'X40CrMoV5-1', '1.2344', 'AISI H13', 7.8, 11.5),
  M('P', 'o1', '100MnCrW4', '1.2510', 'AISI O1', 7.8, 11.5),
  M('P', 'o2', '90MnCrV8', '1.2842', 'AISI O2', 7.8, 11.5),
  // M — stale nierdzewne
  M('M', '304', 'X5CrNi18-10', '1.4301', 'AISI 304', 7.9, 17.2),
  M('M', '304l', 'X2CrNi19-11', '1.4306', 'AISI 304L', 7.9, 17.2),
  M('M', '303', 'X8CrNiS18-9', '1.4305', 'AISI 303', 7.9, 17.2),
  M('M', '316', 'X5CrNiMo17-12-2', '1.4401', 'AISI 316', 8.0, 16.0),
  M('M', '316l', 'X2CrNiMo17-12-2', '1.4404', 'AISI 316L', 8.0, 16.0),
  M('M', '316ti', 'X6CrNiMoTi17-12-2', '1.4571', 'AISI 316Ti', 8.0, 16.5),
  M('M', '430', 'X6Cr17', '1.4016', 'AISI 430', 7.7, 10.4),
  M('M', '420', 'X20Cr13', '1.4021', '≈ AISI 420', 7.7, 10.3),
  M('M', '17-4', 'X5CrNiCuNb16-4', '1.4542', '17-4 PH', 7.8, 10.8),
  M('M', 'duplex', 'X2CrNiMoN22-5-3', '1.4462', 'UNS S32205 (duplex 2205)', 7.8, 13.0),
  // K — żeliwa
  M('K', 'gjl250', 'EN-GJL-250 (GG25)', 'EN-JL1040', '≈ ASTM A48 class 35', 7.2, 10.5),
  M('K', 'gjs400', 'EN-GJS-400-15 (GGG40)', 'EN-JS1030', '≈ ASTM A536 60-40-18', 7.1, 12.0),
  M('K', 'gjs500', 'EN-GJS-500-7 (GGG50)', 'EN-JS1050', '≈ ASTM A536 80-55-06', 7.1, 12.0),
  // N — metale nieżelazne
  M('N', 'al6061', 'EN AW-6061 (AlMg1SiCu)', 'EN AW-6061', 'AA 6061', 2.7, 23.6),
  M('N', 'al6082', 'EN AW-6082 (AlSi1MgMn)', 'EN AW-6082', 'AA 6082', 2.7, 23.4),
  M('N', 'al7075', 'EN AW-7075 (AlZn5,5MgCu)', 'EN AW-7075', 'AA 7075', 2.81, 23.4),
  M('N', 'al2024', 'EN AW-2024 (AlCu4Mg1)', 'EN AW-2024', 'AA 2024', 2.78, 22.9),
  M('N', 'al5083', 'EN AW-5083 (AlMg4,5Mn0,7)', 'EN AW-5083', 'AA 5083', 2.66, 23.8),
  M('N', 'cu', 'Cu-ETP', 'CW004A', 'UNS C11000', 8.9, 16.9),
  M('N', 'cw614n', 'CuZn39Pb3 (mosiądz automatowy)', 'CW614N', '≈ UNS C38500 / C36000', 8.5, 20.5),
  M('N', 'cw508l', 'CuZn37 (mosiądz)', 'CW508L', '≈ UNS C27400', 8.4, 20.2),
  M('N', 'cusn8', 'CuSn8 (brąz cynowy)', 'CW453K', '≈ UNS C52100', 8.8, 18.5),
  // S — tytan i stopy żaroodporne
  M('S', 'ti2', 'Tytan Grade 2', '3.7035', 'ASTM Grade 2', 4.51, 8.6),
  M('S', 'ti64', 'Ti-6Al-4V', '3.7165', 'ASTM Grade 5', 4.43, 8.6),
  M('S', 'in718', 'Inconel 718', '2.4668', 'UNS N07718', 8.19, 13.0),
  M('S', 'in625', 'Inconel 625', '2.4856', 'UNS N06625', 8.44, 12.8),
  // X — tworzywa
  M('X', 'pomc', 'POM-C (acetal)', 'POM-C', '—', 1.41, 110),
  M('X', 'pa6', 'PA6 (poliamid)', 'PA6', '—', 1.14, 80),
  M('X', 'peek', 'PEEK', 'PEEK', '—', 1.31, 47),
  M('X', 'ptfe', 'PTFE (teflon)', 'PTFE', '—', 2.16, 130),
  M('X', 'hdpe', 'PE-HD', 'PE-HD', '—', 0.95, 200),
  M('X', 'pmma', 'PMMA (pleksi)', 'PMMA', '—', 1.19, 70),
  M('X', 'abs', 'ABS', 'ABS', '—', 1.05, 85),
  M('X', 'pc', 'PC (poliwęglan)', 'PC', '—', 1.2, 65),
];

export const findMaterial = (id: string) => MATERIALS.find((m) => m.id === id);
