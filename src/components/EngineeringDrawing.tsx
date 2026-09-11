import { useId, type ReactNode } from 'react';

type DrawingProps = {
  children: (ids: { arrow: string; hatch: string }) => ReactNode;
  label: string;
  className?: string;
};

export const EngineeringDrawing = ({ children, label, className = '' }: DrawingProps) => {
  const token = useId().replace(/:/g, '');
  const ids = { arrow: `arrow-${token}`, hatch: `hatch-${token}` };

  return (
    <div className={`rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-2 ${className}`}>
      <svg viewBox="0 0 320 180" role="img" aria-label={label} className="w-full" fill="none">
        <defs>
          <marker id={ids.arrow} viewBox="0 0 8 8" refX="4" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L8 4 L0 8 Z" className="fill-cyan-400" />
          </marker>
          <pattern id={ids.hatch} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="8" className="stroke-zinc-700/60 stroke-[1]" />
          </pattern>
        </defs>
        {children(ids)}
      </svg>
    </div>
  );
};

type DimensionProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
  arrowId: string;
  active?: boolean;
  labelX?: number;
  labelY?: number;
  rotateLabel?: boolean;
};

export const Dimension = ({ x1, y1, x2, y2, label, arrowId, active = false, labelX, labelY, rotateLabel = false }: DimensionProps) => {
  const strokeClass = active ? 'stroke-cyan-300 stroke-[2]' : 'stroke-cyan-400 stroke-[1.2]';
  const textClass = active ? 'fill-cyan-200' : 'fill-cyan-300';
  const tx = labelX ?? (x1 + x2) / 2;
  const ty = labelY ?? (y1 + y2) / 2 - 5;
  return (
    <g className="transition-all duration-150">
      <line x1={x1} y1={y1} x2={x2} y2={y2} className={strokeClass} markerStart={`url(#${arrowId})`} markerEnd={`url(#${arrowId})`} />
      <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle" transform={rotateLabel ? `rotate(-90 ${tx} ${ty})` : undefined} className={`${textClass} font-mono text-[11px] font-bold`}>{label}</text>
    </g>
  );
};

export const Witness = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-zinc-500 stroke-[1]" />
);

export const Centerline = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-zinc-500 stroke-[1]" strokeDasharray="16 3 3 3" />
);

export const Leader = ({ points, label, active = false, labelX, labelY }: { points: string; label: string; active?: boolean; labelX: number; labelY: number }) => (
  <g>
    <polyline points={points} className={active ? 'stroke-cyan-300 stroke-[2]' : 'stroke-cyan-400 stroke-[1.2]'} fill="none" />
    <circle cx={Number(points.split(/[ ,]/)[0])} cy={Number(points.split(/[ ,]/)[1])} r="2" className={active ? 'fill-cyan-200' : 'fill-cyan-400'} />
    <text x={labelX} y={labelY} className={`${active ? 'fill-cyan-200' : 'fill-cyan-300'} font-mono text-[11px] font-bold`}>{label}</text>
  </g>
);
