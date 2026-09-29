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
    <path d="M4 56 V16 H27 V33 Q27 39 33 39 L44 29 H60 V56 Z" {...FILL} />
    <path d="M4 56 V16 H27 V33 Q27 39 33 39 L44 29 H60 V56" />
    <line x1="2" y1="56" x2="62" y2="56" {...axisProps} />
  </Base>
));
UndercutIcon.displayName = 'UndercutIcon';

/* ------------------------------------------------------------------ */
/* 8. Podziałka PCD — 5 otworów na średnicy konstrukcyjnej             */
/* ------------------------------------------------------------------ */
const PCD_HOLES: Array<[number, number]> = [0, 1, 2, 3, 4].map((i) => {
  const a = ((-90 + i * 72) * Math.PI) / 180;
  return [Number((32 + 17 * Math.cos(a)).toFixed(2)), Number((32 + 17 * Math.sin(a)).toFixed(2))];
});

export const PcdIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    {/* obrys tarczy */}
    <circle cx="32" cy="32" r="29" strokeWidth={2} opacity={0.55} />
    {/* okrąg konstrukcyjny (średnica podziałowa) — łuki między otworami */}
    <path d="M38.09 16.13 A17 17 0 0 1 45.21 21.30 M48.98 32.89 A17 17 0 0 1 46.26 41.26 M36.40 48.42 A17 17 0 0 1 27.60 48.42 M17.74 41.26 A17 17 0 0 1 15.02 32.89 M18.79 21.30 A17 17 0 0 1 25.91 16.13" strokeWidth={1.75} strokeLinecap="butt" />
    {PCD_HOLES.map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" fill="currentColor" fillOpacity={0.25} />
    ))}
    {/* środek */}
    <path d="M27 32 H37 M32 27 V37" strokeWidth={1.75} />
  </Base>
));
PcdIcon.displayName = 'PcdIcon';

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
    {/* pierścień zewnętrzny (DIN 471): otwarty u góry, z uszami na szczypce */}
    <path
      d="M45 4 L42.57 13.34 A25 25 0 1 1 21.43 13.34 L19 4 H28 L25.45 21.95 A15.5 15.5 0 1 0 38.55 21.95 L36 4 Z"
      fill="currentColor"
      fillOpacity={0.2}
    />
    <circle cx="23.5" cy="9.5" r="2.4" strokeWidth={2} />
    <circle cx="40.5" cy="9.5" r="2.4" strokeWidth={2} />
  </Base>
));
CirclipIcon.displayName = 'CirclipIcon';

/* ------------------------------------------------------------------ */
/* 11. Wpusty pryzmowe — przekrój wałka z wpustem                      */
/* ------------------------------------------------------------------ */
export const KeywayIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    <path d="M25 17 A22 22 0 1 0 39 17 V23 H25 Z" {...FILL} />
    {/* wałek z rowkiem */}
    <path d="M25 17 A22 22 0 1 0 39 17" />
    {/* wpust */}
    <rect x="25" y="7" width="14" height="16" rx="1" fill="currentColor" fillOpacity={0.4} />
    {/* środek */}
    <path d="M28 40 H36 M32 36 V44" strokeWidth={1.75} />
  </Base>
));
KeywayIcon.displayName = 'KeywayIcon';

/* ------------------------------------------------------------------ */
/* 12. Rowki O-ring — przekrój wałka z rowkiem i pierścieniem          */
/* ------------------------------------------------------------------ */
export const ORingIcon = memo((p: CncIconProps) => (
  <Base {...p}>
    <path d="M4 56 V26 H20 V42 H44 V26 H60 V56 Z" {...FILL} />
    <path d="M4 56 V26 H20 V42 H44 V26 H60 V56" />
    <line x1="2" y1="56" x2="62" y2="56" {...axisProps} />
    {/* o-ring w rowku */}
    <circle cx="32" cy="33" r="9" fill="currentColor" fillOpacity={0.45} />
    <circle cx="32" cy="33" r="3" strokeWidth={1.5} opacity={0.6} />
  </Base>
));
ORingIcon.displayName = 'ORingIcon';
