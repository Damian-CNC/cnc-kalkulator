import { useNavigate } from 'react-router-dom';
import { Settings, Scale, Gem, Ruler, Waves, Target } from 'lucide-react';
import type { ComponentType } from 'react';
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
} from '@/components/icons/CncIcons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import WakeLockToggle from '@/components/WakeLockToggle';
import AppFooter from '@/components/AppFooter';
import useHaptics from '@/hooks/useHaptics';


type Tile = {
  id: string;
  labelKey: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  route: string;
  isNew?: boolean;
};

const sections: { titleKey: string; tiles: Tile[] }[] = [
  {
    titleKey: 'sections.machining',
    tiles: [
      { id: 'parameters', labelKey: 'tiles.parameters', icon: Settings, route: '/parametry' },
      { id: 'roughness', labelKey: 'tiles.roughness', icon: Waves, route: '/chropowatosc' },
    ],
  },
  {
    titleKey: 'sections.threadsFits',
    tiles: [
      { id: 'tolerances', labelKey: 'tiles.tolerances', icon: Ruler, route: '/tolerancje' },
      { id: 'threads', labelKey: 'tiles.threads', icon: ThreadIcon, route: '/gwinty' },
      { id: 'iso2768', labelKey: 'tiles.iso2768', icon: CaliperIcon, route: '/tolerancje-iso-2768' },
    ],
  },
  {
    titleKey: 'sections.geometry',
    tiles: [
      { id: 'taper', labelKey: 'tiles.taper', icon: LatheChamferIcon, route: '/kalkulator-stozkow' },
      { id: 'millChamfer', labelKey: 'chamfer:tile', icon: MillChamferIcon, route: '/faza-frezem', isNew: true },
      { id: 'cone', labelKey: 'tiles.cone', icon: DrillIcon, route: '/stozek' },
      { id: 'polygon', labelKey: 'tiles.polygon', icon: HexDiagonalIcon, route: '/przekatne' },
      { id: 'din509', labelKey: 'tiles.din509', icon: UndercutIcon, route: '/podciecia-din509' },
      { id: 'pcd', labelKey: 'tiles.pcd', icon: PcdIcon, route: '/pcd', isNew: true },
      { id: 'linearHoles', labelKey: 'tiles.linearHoles', icon: AngledHolesIcon, route: '/otwory-liniowe', isNew: true },
      { id: 'truePosition', labelKey: 'tiles.truePosition', icon: Target, route: '/true-position', isNew: true },
    ],
  },
  {
    titleKey: 'sections.standardParts',
    tiles: [
      { id: 'seger', labelKey: 'tiles.seger', icon: CirclipIcon, route: '/rowki-segera' },
      { id: 'keyways', labelKey: 'tiles.keyways', icon: KeywayIcon, route: '/wpusty' },
      { id: 'oring', labelKey: 'tiles.oring', icon: ORingIcon, route: '/rowki-oring' },
    ],
  },
  {
    titleKey: 'sections.materials',
    tiles: [
      { id: 'weight', labelKey: 'tiles.weight', icon: Scale, route: '/waga' },
      { id: 'hardness', labelKey: 'tiles.hardness', icon: Gem, route: '/twardosc' },
    ],
  },
];


const Index = () => {
  const navigate = useNavigate();
  const { triggerLight } = useHaptics();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-safe overflow-x-hidden flex flex-col items-center">
      <header className="w-full pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pt-14 md:pt-4 pb-3 mb-8 max-w-4xl grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
        <span aria-hidden />
        <motion.h1
          className="text-xl min-[400px]:text-2xl md:text-4xl font-black tracking-wide text-zinc-100 select-none text-center"
          initial={{ rotate: -360, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{
            rotate: { duration: 0.8, ease: 'easeOut' },
            scale: { duration: 0.8, ease: 'easeOut' },
            opacity: { duration: 0.4 },
          }}
          style={{
            textShadow: '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2)',
          }}
        >
          ⚙️ {t('nav.appTitle')}
        </motion.h1>
        <div className="md:hidden flex justify-end">
          <WakeLockToggle />
        </div>
      </header>

      <div className="w-full max-w-4xl flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.titleKey}>
            <h2 className="text-zinc-400 text-sm uppercase tracking-widest mb-4 px-1">
              {t(section.titleKey)}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center">
              {section.tiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <button
                    key={tile.id}
                    onClick={() => {
                      triggerLight();
                      navigate(tile.route);
                    }}
                    className="relative aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 p-3 text-center cursor-pointer transition-all hover:bg-zinc-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95 md:w-[calc((100%-3rem)/4)]"
                  >
                    {tile.isNew && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {t('common.new')}
                      </span>
                    )}
                    <Icon className="w-20 h-20 md:w-28 md:h-28 text-cyan-400" strokeWidth={2.25} />
                    <span className="text-sm sm:text-base font-semibold text-zinc-200 leading-tight">
                      {t(tile.labelKey)}
                    </span>
                  </button>

                );
              })}
            </div>
          </section>
        ))}
      </div>

      <AppFooter />

    </div>
  );
};

export default Index;
