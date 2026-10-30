import { memo, type ReactNode } from 'react';

/**
 * Ikony kafelków w stylu rysunku technicznego.
 * Wszystkie rysowane na siatce 64x64, kolor z `currentColor`,
 * więc dziedziczą kolor z klasy `text-*` tak samo jak ikony lucide.
 *
 * Konwencja:
 *  - linia ciągła = kontur (strokeWidth z propsa, domyślnie 2.5)
 *  - wypełnienie 20% = materiał w przekroju
 *  - linia kreska-kropka = oś symetrii
 *  - cienka linia z grotami = wymiar
 */

export interface CncIconProps {
  className?: string;
  strokeWidth?: number;
}

const AXIS = '7 3 1.5 3';

const Base = ({
  className = 'w-16 h-16',
  strokeWidth = 2.5,
  children,
}: CncIconProps & { children: ReactNode }) => (
  <svg
    viewBox="0 0 64 64"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

/** Materiał w przekroju. */
const FILL = { fill: 'currentColor', fillOpacity: 0.2, stroke: 'none' } as const;
/** Oś symetrii / linia pomocnicza. */
const axisProps = {
  strokeWidth: 1.5,
  strokeDasharray: AXIS,
  strokeLinecap: 'butt' as const,
  opacity: 0.75,
};
/** Cienka linia wymiarowa. */
const dimProps = { strokeWidth: 1.5 };

/* ------------------------------------------------------------------ */
/* 1. Faza frezem — przekrój otworu z fazą + przekrój fazownika 90°    */
/* ------------------------------------------------------------------ */
export const MillChamferIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* przekrój detalu z otworem i fazą */}
    <path d="M4 40 H15 L21 46 V60 H4 Z M60 40 H49 L43 46 V60 H60 Z" {...FILL} />
    <path d="M4 60 V40 H15 L21 46 V60 M60 60 V40 H49 L43 46 V60" />
    {/* fazownik 90° w przekroju: trzpień + stożek 90° */}
    <path d="M23 2 H41 V27 L32 36 L23 27 Z" fill="currentColor" fillOpacity={0.2} />
    {/* oś */}
    <line x1="32" y1="0" x2="32" y2="64" {...axisProps} />
  </Base>
));
MillChamferIcon.displayName = 'MillChamferIcon';

/* ------------------------------------------------------------------ */
/* 2. Gwinty — widok boczny śruby, opcjonalna literka w rogu           */
/* ------------------------------------------------------------------ */
export const ThreadIcon = memo(({ badge, ...p }: CncIconProps & { badge?: string }) => {
  const dy = badge ? 5 : -1;
  const size = !badge ? 0 : badge.length === 1 ? 20 : badge.length === 2 ? 16 : 13;
  return (
    <Base {...p}>
      <g transform={`translate(0 ${dy})`}>
        {/* łeb */}
        <rect x="4" y="16" width="14" height="38" rx="1.5" fill="currentColor" fillOpacity={0.2} />
        <path d="M4 25 H18 M4 45 H18" strokeWidth={1.75} />
        {/* trzon z zarysem gwintu */}
        <path d="M18 23 H54 L60 29 V41 L54 47 H18 Z" />
        <path d="M26 47 L31 23 M34 47 L39 23 M42 47 L47 23 M50 47 L54 28" />
        {/* oś */}
        <line x1="1" y1="35" x2="63" y2="35" {...axisProps} />
      </g>
      {badge && (
        <text
          x="61"
          y={size >= 20 ? 21 : size >= 16 ? 19 : 17}
          textAnchor="end"
          fontSize={size}
          fontWeight="900"
          fill="currentColor"
          stroke="none"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {badge}
        </text>
      )}
    </Base>
  );
});
ThreadIcon.displayName = 'ThreadIcon';

/* ------------------------------------------------------------------ */
/* 3. ISO 2768 — rzut boczny suwmiarki                                 */
/* ------------------------------------------------------------------ */
export const CaliperIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* część stała: belka + szczęki */}
    <polygon
      points="4,8 12,15 12,22 24,22 24,34 12,34 12,58 4,58"
      fill="currentColor"
      fillOpacity={0.2}
    />
    {/* prowadnica z podziałką */}
    <rect x="42" y="22" width="18" height="12" fill="currentColor" fillOpacity={0.2} />
    <path d="M46 22 V30 M50 22 V27 M54 22 V30 M58 22 V27" strokeWidth={1.75} />
    {/* suwak ze szczękami */}
    <polygon
      points="24,15 32,8 32,16 42,16 42,40 32,40 32,58 24,58"
      fill="currentColor"
      fillOpacity={0.3}
    />
    {/* pokrętło */}
    <circle cx="37" cy="11" r="3.5" strokeWidth={2} />
  </Base>
));
CaliperIcon.displayName = 'CaliperIcon';

/* ------------------------------------------------------------------ */
/* 4. Faza na tokarce — połówka wałka z dużą fazą + płytka DNMG        */
/* ------------------------------------------------------------------ */
export const LatheChamferIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* połówka wałka z dużą fazą po prawej stronie */}
    <path d="M4 58 V24 H26 L40 38 V58 Z" {...FILL} />
    <path d="M4 58 V24 H26 L40 38 V58" />
    {/* oś */}
    <line x1="1" y1="58" x2="48" y2="58" {...axisProps} />
    {/* płytka DNMG (romb 55°) najeżdżająca na fazę od strony czoła */}
    <g transform="translate(54 20) rotate(-45)">
      <path d="M-11 0 L0 -5.7 L11 0 L0 5.7 Z" fill="currentColor" fillOpacity={0.2} />
      <circle cx="0" cy="0" r="2" strokeWidth={2} />
    </g>
  </Base>
));
LatheChamferIcon.displayName = 'LatheChamferIcon';

/* ------------------------------------------------------------------ */
/* 5. Stożek wiertła — rzut boczny wiertła krętego                     */
/* ------------------------------------------------------------------ */
export const DrillIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    <g transform="translate(32 32) rotate(45) scale(1.12) translate(-32 -30)">
      {/* chwyt */}
      <path d="M27 3 H37 V17 H27 Z" fill="currentColor" fillOpacity={0.2} />
      {/* część robocza z ostrzem 118° */}
      <path d="M23 17 H41 V50 L32 57 L23 50 Z" fill="currentColor" fillOpacity={0.2} />
      {/* rowki wiórowe */}
      <path d="M23 46 L41 38 M23 37 L41 29 M23 28 L41 20" />
      <path d="M23 50 L32 57 L41 50" />
    </g>
  </Base>
));
DrillIcon.displayName = 'DrillIcon';

/* ------------------------------------------------------------------ */
/* 6. Przekątne — sześciokąt ze zwymiarowaną przekątną                 */
/* ------------------------------------------------------------------ */
export const HexDiagonalIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    <polygon points="10,26 21,7 43,7 54,26 43,45 21,45" fill="currentColor" fillOpacity={0.2} />
    <polygon points="10,26 21,7 43,7 54,26 43,45 21,45" />
    {/* przekątna */}
    <line x1="10" y1="26" x2="54" y2="26" {...axisProps} />
    {/* linie pomocnicze */}
    <path d="M10 31 V58 M54 31 V58" {...dimProps} />
    {/* linia wymiarowa z grotami */}
    <path d="M10 54 H54" {...dimProps} />
    <path d="M10 54 L17 51 V57 Z M54 54 L47 51 V57 Z" fill="currentColor" strokeWidth={1} />
  </Base>
));
HexDiagonalIcon.displayName = 'HexDiagonalIcon';

/* ------------------------------------------------------------------ */
/* 7. Podcięcia DIN 509 — połówka wałka z podcięciem przy ramieniu     */
/* ------------------------------------------------------------------ */
export const UndercutIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* Powiększony profil DIN 509 wypełniający siatkę 64x64 */}
    <path d="M4 58 V10 H25 V30 Q25 38 33 38 L44 26 H60 V58 Z" {...FILL} />
    <path d="M4 58 V10 H25 V30 Q25 38 33 38 L44 26 H60 V58" />
    <line x1="2" y1="58" x2="62" y2="58" {...axisProps} />
    {/* Zaznaczenie łuku promienia podcięcia */}
    <path d="M29 34 A4 4 0 0 0 35 34" strokeWidth={1.5} opacity={0.8} />
  </Base>
));
UndercutIcon.displayName = 'UndercutIcon';

/* ------------------------------------------------------------------ */
/* 8. Podziałka PCD — 5 otworów na średnicy konstrukcyjnej             */
/* ------------------------------------------------------------------ */
const PCD_HOLES: Array<[number, number]> = [0, 1, 2, 3, 4].map((i) => {
  const a = ((-90 + i * 72) * Math.PI) / 180;
  return [Number((32 + 16 * Math.cos(a)).toFixed(2)), Number((32 + 16 * Math.sin(a)).toFixed(2))];
});

export const PcdIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* obrys tarczy */}
    <circle cx="32" cy="32" r="26" strokeWidth={1.75} opacity={0.55} />
    {/* okrąg konstrukcyjny (średnica podziałowa) */}
    <circle cx="32" cy="32" r="16" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.65} />
    {PCD_HOLES.map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="4.8" fill="currentColor" fillOpacity={0.25} />
    ))}
    {/* środek */}
    <path d="M28 32 H36 M32 28 V36" strokeWidth={1.5} />
  </Base>
));
PcdIcon.displayName = 'PcdIcon';

/* ------------------------------------------------------------------ */
/* 8b. Pomiar PCD — okrąg podziałowy z wymiarem rozstawu dwóch otworów */
/* ------------------------------------------------------------------ */
export const PcdMeasureIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* okrąg konstrukcyjny (średnica podziałowa) */}
    <circle cx="32" cy="35" r="22" strokeWidth={1.75} strokeDasharray="4 3" opacity={0.5} />
    {/* otwory podziałowe wokół okręgu */}
    <circle cx="54" cy="35" r="3.5" fill="currentColor" fillOpacity={0.25} />
    <circle cx="43" cy="54" r="3.5" fill="currentColor" fillOpacity={0.25} />
    <circle cx="21" cy="54" r="3.5" fill="currentColor" fillOpacity={0.25} />
    <circle cx="10" cy="35" r="3.5" fill="currentColor" fillOpacity={0.25} />
    {/* dwa górne otwory podlegające pomiarowi rozstawu */}
    <circle cx="21" cy="16" r="4.8" fill="currentColor" fillOpacity={0.4} strokeWidth={2} />
    <circle cx="43" cy="16" r="4.8" fill="currentColor" fillOpacity={0.4} strokeWidth={2} />
    {/* linie pomocnicze wymiarowe w górę */}
    <line x1="21" y1="16" x2="21" y2="7" strokeWidth={1.5} strokeDasharray="2 2" opacity={0.65} />
    <line x1="43" y1="16" x2="43" y2="7" strokeWidth={1.5} strokeDasharray="2 2" opacity={0.65} />
    {/* linia wymiarowa ze strzałkami (rozstaw C) */}
    <line x1="21" y1="9" x2="43" y2="9" strokeWidth={2} />
    <path d="M24 7 L21 9 L24 11" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 7 L43 9 L40 11" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    {/* środki dwóch mierzonych otworów */}
    <path d="M19 16 H23 M21 14 V18" strokeWidth={1.5} />
    <path d="M41 16 H45 M43 14 V18" strokeWidth={1.5} />
    {/* krzyżak środka okręgu podziałowego */}
    <path d="M28 35 H36 M32 31 V39" strokeWidth={1.5} opacity={0.6} />
  </Base>
));
PcdMeasureIcon.displayName = 'PcdMeasureIcon';

/* ------------------------------------------------------------------ */
/* 8c. Kąt linii śrubowej & Płytka podporowa (Thread Helix & Shim)     */
/* Symbol λ (lambda)                                                  */
/* ------------------------------------------------------------------ */
export const HelixAngleIcon = memo((p: CncIconProps) => {
  const width = (p.strokeWidth ?? 2.5) * 1.5;
  return (
    <Base {...p}>
      {/* Symbol lambda λ */}
      <path
        d="M 15 51 L 32 26"
        strokeWidth={width}
        strokeLinecap="round"
      />
      <path
        d="M 21 15 C 26 15.5 30 18.5 33 26 L 48 51"
        strokeWidth={width}
        strokeLinecap="round"
      />
    </Base>
  );
});
HelixAngleIcon.displayName = 'HelixAngleIcon';

/* ------------------------------------------------------------------ */
/* 9. Otwory pod kątem — linia ~30° z kilkoma otworami                 */
/* ------------------------------------------------------------------ */
export const AngledHolesIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    <g transform="translate(0 -3)">
    {/* linia odniesienia i kąt */}
    <path d="M4 52 H24" strokeWidth={1.75} opacity={0.75} />
    <path d="M14 52 A10 10 0 0 0 12.7 47" strokeWidth={1.75} />
    {/* linia otworów (odcinki między otworami) */}
    <path d="M4.00 52.00 L10.93 48.00 M21.32 42.00 L23.92 40.50 M34.31 34.50 L36.91 33.00 M47.30 27.00 L49.90 25.50" strokeWidth={2} strokeLinecap="butt" />
    {/* otwory */}
    <circle cx="16.12" cy="45.00" r="4.6" fill="currentColor" fillOpacity={0.25} />
    <circle cx="29.11" cy="37.50" r="4.6" fill="currentColor" fillOpacity={0.25} />
    <circle cx="42.10" cy="30.00" r="4.6" fill="currentColor" fillOpacity={0.25} />
    <circle cx="55.09" cy="22.50" r="4.6" fill="currentColor" fillOpacity={0.25} />
    </g>
  </Base>
));
AngledHolesIcon.displayName = 'AngledHolesIcon';

/* ------------------------------------------------------------------ */
/* 10. Rowki Segera — pierścień zewnętrzny (DIN 471)                   */
/* ------------------------------------------------------------------ */
export const CirclipIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* Powiększony pierścień zewnętrzny Segera wypełniający kadr */}
    <path
      d="M47 3 L44.3 12.8 A28 28 0 1 1 19.7 12.8 L17 3 H28.5 L25.5 21 A18 18 0 1 0 38.5 21 L35.5 3 Z"
      fill="currentColor"
      fillOpacity={0.25}
    />
    <path
      d="M47 3 L44.3 12.8 A28 28 0 1 1 19.7 12.8 L17 3 H28.5 L25.5 21 A18 18 0 1 0 38.5 21 L35.5 3 Z"
    />
    <circle cx="22.5" cy="8.5" r="2.8" strokeWidth={2} fill="currentColor" fillOpacity={0.4} />
    <circle cx="41.5" cy="8.5" r="2.8" strokeWidth={2} fill="currentColor" fillOpacity={0.4} />
  </Base>
));
CirclipIcon.displayName = 'CirclipIcon';

/* ------------------------------------------------------------------ */
/* 11. Wpusty pryzmowe — przekrój wałka z wpustem                      */
/* ------------------------------------------------------------------ */
export const KeywayIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* Powiększony wałek z rowkiem wpustowym */}
    <path d="M23 15 A26.5 26.5 0 1 0 41 15 V23 H23 Z" {...FILL} />
    <path d="M23 15 A26.5 26.5 0 1 0 41 15" />
    {/* Wpust pryzmowy w rowku */}
    <rect x="23" y="4" width="18" height="19" rx="1.5" fill="currentColor" fillOpacity={0.45} />
    <rect x="23" y="4" width="18" height="19" rx="1.5" />
    {/* Znacznik środka / osi symetrii */}
    <path d="M26 38 H38 M32 32 V44" strokeWidth={1.75} />
  </Base>
));
KeywayIcon.displayName = 'KeywayIcon';

/* ------------------------------------------------------------------ */
/* 12. Rowki O-ring — przekrój wałka z rowkiem i pierścieniem          */
/* ------------------------------------------------------------------ */
export const ORingIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* Powiększony detal i rowek o-ring na pełną wysokość kadru */}
    <path d="M4 58 V14 H18 V38 H46 V14 H60 V58 Z" {...FILL} />
    <path d="M4 58 V14 H18 V38 H46 V14 H60 V58" />
    <line x1="2" y1="58" x2="62" y2="58" {...axisProps} />
    {/* Pierścień O-ring o dużej czytelności w rowku */}
    <circle cx="32" cy="27" r="12" fill="currentColor" fillOpacity={0.45} />
    <circle cx="32" cy="27" r="12" />
    <circle cx="32" cy="27" r="4.5" strokeWidth={1.5} opacity={0.6} />
  </Base>
));
ORingIcon.displayName = 'ORingIcon';

/** Przekrój płyty z otworem przelotowym i wytoczeniem pod łeb śruby. */
export const BoltHoleIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* Powiększone pogłębienie walcowe pod łeb śruby */}
    <path d="M4 12 H18 V28 H25 V56 H4 Z" fill="currentColor" fillOpacity={0.25} />
    <path d="M4 12 H18 V28 H25 V56 H4 Z" />
    <path d="M60 12 H46 V28 H39 V56 H60 Z" fill="currentColor" fillOpacity={0.25} />
    <path d="M60 12 H46 V28 H39 V56 H60 Z" />
    {/* Oś symetrii otworu */}
    <path d="M32 4 V60" strokeDasharray={AXIS} strokeWidth={1.5} />
    {/* Linia wymiarowa łba */}
    <path d="M18 6 H46" strokeWidth={1.5} />
    <path d="M18 3 V9 M46 3 V9" strokeWidth={1.5} />
  </Base>
));
BoltHoleIcon.displayName = 'BoltHoleIcon';

/* ------------------------------------------------------------------ */
/* 14. Waga materiału — wałek / profil z wymiarami i symbolem masy   */
/* ------------------------------------------------------------------ */
export const WeightIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* Bryła wałka w perspektywie technicznej */}
    <ellipse cx="32" cy="18" rx="20" ry="8" {...FILL} />
    <ellipse cx="32" cy="18" rx="20" ry="8" />
    <path d="M12 18 V44 C12 48.5 21 52 32 52 C43 48.5 52 44 52 44 V18" />
    <path d="M12 31 C12 35.5 21 39 32 39 C43 35.5 52 31 52 31" opacity={0.4} strokeDasharray="3 2" />
    <path d="M12 44 C12 48.5 21 52 32 52 C43 48.5 52 44 52 44" {...FILL} />
    {/* Oś symetrii */}
    <line x1="32" y1="6" x2="32" y2="58" {...axisProps} />
    {/* Strzałka wymiaru długości */}
    <path d="M57 18 V44 M55 20 L57 18 L59 20 M55 42 L57 44 L59 42" strokeWidth={1.5} />
  </Base>
));
WeightIcon.displayName = 'WeightIcon';

/* ------------------------------------------------------------------ */
/* 15. Twardość materiału — wgłębnik stożkowy Rockwell HRC / Vickers   */
/* ------------------------------------------------------------------ */
export const HardnessIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* Próbka materiału (blok w przekroju) */}
    <path d="M6 38 H24 L32 46 L40 38 H58 V58 H6 Z" {...FILL} />
    <path d="M6 38 H24 L32 46 L40 38 H58 V58 H6 Z" />
    {/* Oś symetrii wgłębnika */}
    <line x1="32" y1="2" x2="32" y2="62" {...axisProps} />
    {/* Diamentowy wgłębnik stożkowy 120° z uchwytem */}
    <rect x="23" y="6" width="18" height="16" rx="1.5" fill="currentColor" fillOpacity={0.35} />
    <path d="M23 22 L32 37 L41 22 Z" fill="currentColor" fillOpacity={0.5} />
    <path d="M23 6 H41 V22 L32 37 L23 22 Z" />
    {/* Strzałki nacisku siły pomiarowej F */}
    <path d="M15 12 V24 M12 21 L15 24 L18 21" strokeWidth={1.5} />
    <path d="M49 12 V24 M46 21 L49 24 L52 21" strokeWidth={1.5} />
  </Base>
));
HardnessIcon.displayName = 'HardnessIcon';

/* ------------------------------------------------------------------ */
/* 16. Baza materiałów — wiązka profili hutniczych (okrągły, kwadrat, hex) */
/* ------------------------------------------------------------------ */
export const MaterialsDbIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* Przekroje różnych gatunków profili hutniczych */}
    {/* Profil okrągły */}
    <circle cx="21" cy="41" r="14" {...FILL} />
    <circle cx="21" cy="41" r="14" />
    <line x1="7" y1="41" x2="35" y2="41" {...axisProps} />
    <line x1="21" y1="27" x2="21" y2="55" {...axisProps} />
    {/* Profil kwadratowy z fazowanymi rogami */}
    <rect x="37" y="27" width="20" height="20" rx="2" {...FILL} />
    <rect x="37" y="27" width="20" height="20" rx="2" />
    {/* Profil sześciokątny (pręt sześciokątny) */}
    <polygon points="32,8 43,14 43,26 32,32 21,26 21,14" fill="currentColor" fillOpacity={0.3} />
    <polygon points="32,8 43,14 43,26 32,32 21,26 21,14" />
  </Base>
));
MaterialsDbIcon.displayName = 'MaterialsDbIcon';

/* ------------------------------------------------------------------ */
/* 17. Rozszerzalność temperaturowa — kołek pomiarowy ze skalą i delta */
/* ------------------------------------------------------------------ */
export const ThermalIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* Bazowy detal w przekroju */}
    <path d="M8 22 H44 V46 H8 Z" {...FILL} />
    <path d="M8 22 H44 V46 H8 Z" />
    {/* Rozszerzenie termiczne (obrys kreskowany + delta) */}
    <path d="M44 22 H56 V46 H44" strokeDasharray="3 2" />
    <line x1="2" y1="34" x2="62" y2="34" {...axisProps} />
    {/* Wymiar rozszerzalności delta L */}
    <path d="M44 14 H56 M44 11 V17 M56 11 V17" strokeWidth={1.5} />
    {/* Symbol temperatury / skali */}
    <circle cx="20" cy="53" r="3.5" fill="currentColor" fillOpacity={0.4} />
    <path d="M18.5 50 V47 H21.5 V50" />
    <path d="M26 49 L29 53 L32 49" strokeWidth={1.5} />
  </Base>
));
ThermalIcon.displayName = 'ThermalIcon';


