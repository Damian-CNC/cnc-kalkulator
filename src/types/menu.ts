import type { ComponentType } from 'react';
import {
  Settings,
  Scale,
  Gem,
  Ruler,
  Waves,
  Target,
  Triangle,
  Calculator,
  Thermometer,
  Database,
} from 'lucide-react';
import {
  MillChamferIcon,
  ThreadIcon,
  CaliperIcon,
  LatheChamferIcon,
  DrillIcon,
  HexDiagonalIcon,
  UndercutIcon,
  PcdIcon,
  AngledHolesIcon,
  CirclipIcon,
  KeywayIcon,
  ORingIcon,
  BoltHoleIcon,
} from '@/components/icons/CncIcons';

export type TileDefinition = {
  id: string;
  labelKey: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number | string }>;
  route: string;
  isNew?: boolean;
};

export type MenuItemType = 'tile' | 'spacer';

export interface MenuLayoutItem {
  id: string;
  type: MenuItemType;
  tileId?: string;
}

export const LUCIDE_ICONS: unknown[] = [
  Settings,
  Waves,
  Ruler,
  Target,
  Scale,
  Gem,
  Triangle,
  Calculator,
  Thermometer,
  Database,
];

export const ALL_TILES: TileDefinition[] = [
  { id: 'parameters', labelKey: 'tiles.parameters', icon: Settings, route: '/parametry' },
  { id: 'calc', labelKey: 'tools:calc.tile', icon: Calculator, route: '/kalkulator', isNew: true },
  { id: 'roughness', labelKey: 'tiles.roughness', icon: Waves, route: '/chropowatosc' },
  { id: 'tolerances', labelKey: 'tiles.tolerances', icon: Ruler, route: '/tolerancje' },
  { id: 'threads', labelKey: 'tiles.threads', icon: ThreadIcon, route: '/gwinty' },
  { id: 'iso2768', labelKey: 'tiles.iso2768', icon: CaliperIcon, route: '/tolerancje-iso-2768' },
  { id: 'taper', labelKey: 'tiles.taper', icon: LatheChamferIcon, route: '/kalkulator-stozkow' },
  { id: 'millChamfer', labelKey: 'chamfer:tile', icon: MillChamferIcon, route: '/faza-frezem' },
  { id: 'cone', labelKey: 'tiles.cone', icon: DrillIcon, route: '/stozek' },
  { id: 'polygon', labelKey: 'tiles.polygon', icon: HexDiagonalIcon, route: '/przekatne' },
  { id: 'pcd', labelKey: 'tiles.pcd', icon: PcdIcon, route: '/pcd' },
  { id: 'linearHoles', labelKey: 'tiles.linearHoles', icon: AngledHolesIcon, route: '/otwory-liniowe' },
  { id: 'truePosition', labelKey: 'tiles.truePosition', icon: Target, route: '/true-position' },
  { id: 'trig', labelKey: 'tools:trig.tile', icon: Triangle, route: '/trygonometria', isNew: true },
  { id: 'seger', labelKey: 'tiles.seger', icon: CirclipIcon, route: '/rowki-segera' },
  { id: 'keyways', labelKey: 'tiles.keyways', icon: KeywayIcon, route: '/wpusty' },
  { id: 'oring', labelKey: 'tiles.oring', icon: ORingIcon, route: '/rowki-oring' },
  { id: 'din509', labelKey: 'tiles.din509', icon: UndercutIcon, route: '/podciecia-din509' },
  { id: 'boltHoles', labelKey: 'tools:holes.tile', icon: BoltHoleIcon, route: '/otwory-pod-sruby', isNew: true },
  { id: 'weight', labelKey: 'tiles.weight', icon: Scale, route: '/waga' },
  { id: 'hardness', labelKey: 'tiles.hardness', icon: Gem, route: '/twardosc' },
  { id: 'materialsDb', labelKey: 'tools:mat.tile', icon: Database, route: '/baza-materialow', isNew: true },
  { id: 'thermal', labelKey: 'tools:thermal.tile', icon: Thermometer, route: '/korekcja-temperaturowa', isNew: true },
];

export const TILE_MAP = new Map<string, TileDefinition>(
  ALL_TILES.map((tile) => [tile.id, tile]),
);

export const DEFAULT_LAYOUT: MenuLayoutItem[] = ALL_TILES.map((tile) => ({
  id: tile.id,
  type: 'tile',
  tileId: tile.id,
}));
