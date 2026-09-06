import { memo } from 'react';

export type ShapeType =
  | 'rod'
  | 'tube'
  | 'flat'
  | 'square'
  | 'hex'
  | 'rhs'
  | 'angle'
  | 'channel'
  | 'tee'
  | 'ibeam';

const paths: Record<ShapeType, JSX.Element> = {
  rod: <circle cx="12" cy="12" r="8" className="fill-current opacity-30" strokeWidth="1.5" />,
  tube: (
    <>
      <circle cx="12" cy="12" r="8" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
    </>
  ),
  flat: <rect x="3" y="9" width="18" height="6" rx="0.5" className="fill-current opacity-30" strokeWidth="1.5" />,
  square: <rect x="5" y="5" width="14" height="14" rx="0.5" className="fill-current opacity-30" strokeWidth="1.5" />,
  hex: <polygon points="12,4 19,8 19,16 12,20 5,16 5,8" strokeWidth="1.5" />,
  rhs: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="0.5" strokeWidth="1.5" />
      <rect x="7" y="9" width="10" height="6" rx="0.5" strokeWidth="1.5" />
    </>
  ),
  angle: <polygon points="6,4 10,4 10,16 19,16 19,20 6,20" strokeWidth="1.5" />,
  channel: <polygon points="18,4 18,8 10,8 10,16 18,16 18,20 6,20 6,4" strokeWidth="1.5" />,
  tee: <polygon points="4,4 20,4 20,8 14,8 14,20 10,20 10,8 4,8" strokeWidth="1.5" />,
  ibeam: (
    <polygon
      points="5,4 19,4 19,8 14,8 14,16 19,16 19,20 5,20 5,16 10,16 10,8 5,8"
      strokeWidth="1.5"
    />
  ),
};

const ShapeIcon = memo(({ shape, className = 'w-6 h-6' }: { shape: ShapeType; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" aria-hidden="true">
    {paths[shape]}
  </svg>
));

ShapeIcon.displayName = 'ShapeIcon';

export default ShapeIcon;
