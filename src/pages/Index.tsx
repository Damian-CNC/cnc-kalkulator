import { useNavigate } from 'react-router-dom';
import { Settings, Scale, Triangle, Gem, Ruler, ClipboardList, RefreshCw, Cone, Hexagon, Bolt, Scissors, Waves, Disc, RectangleHorizontal, LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import WakeLockToggle from '@/components/WakeLockToggle';
import UnitSwitcher from '@/components/UnitSwitcher';

type Tile = {
  id: string;
  labelKey: string;
  icon: typeof Settings;
  route: string;
  isNew?: boolean;
};

const sections: { titleKey: string; tiles: Tile[] }[] = [
  {
    titleKey: 'sections.machining',
    tiles: [
      { id: 'parameters', labelKey: 'tiles.parameters', icon: Settings, route: '/parametry' },
      { id: 'std-cutting', labelKey: 'tiles.stdCutting', icon: ClipboardList, route: '/standardowe-parametry' },
      { id: 'roughness', labelKey: 'tiles.roughness', icon: Waves, route: '/chropowatosc', isNew: true },
    ],
  },
  {
    titleKey: 'sections.threadsFits',
    tiles: [
      { id: 'tolerances', labelKey: 'tiles.tolerances', icon: Ruler, route: '/tolerancje' },
      { id: 'threads', labelKey: 'tiles.threads', icon: Bolt, route: '/gwinty' },
    ],
  },
  {
    titleKey: 'sections.geometry',
    tiles: [
      { id: 'taper', labelKey: 'tiles.taper', icon: Cone, route: '/kalkulator-stozkow' },
      { id: 'cone', labelKey: 'tiles.cone', icon: Triangle, route: '/stozek' },
      { id: 'polygon', labelKey: 'tiles.polygon', icon: Hexagon, route: '/przekatne' },
      { id: 'din509', labelKey: 'tiles.din509', icon: Scissors, route: '/podciecia-din509' },
    ],
  },
  {
    titleKey: 'sections.standardParts',
    tiles: [
      { id: 'seger', labelKey: 'tiles.seger', icon: Disc, route: '/rowki-segera', isNew: true },
      { id: 'keyways', labelKey: 'tiles.keyways', icon: RectangleHorizontal, route: '/wpusty', isNew: true },
      { id: 'oring', labelKey: 'tiles.oring', icon: LifeBuoy, route: '/rowki-oring', isNew: true },
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
  const { t } = useTranslation();

  const handleForceUpdate = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      window.location.reload();
    } catch (error) {
      console.error('Update error:', error);
      window.location.reload();
    }
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 p-4 pb-safe overflow-x-hidden flex flex-col items-center"
      style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}
    >
      <div className="w-full max-w-4xl flex justify-end items-center gap-1.5 mb-2">
        <WakeLockToggle />
      </div>


      <motion.h1
        className="text-2xl md:text-4xl font-black tracking-wide mb-8 text-zinc-100 select-none text-center"
        initial={{ rotate: -360, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: [1, 1.05, 1], opacity: 1 }}
        transition={{
          rotate: { duration: 0.8, ease: 'easeOut' },
          scale: { duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.8 },
          opacity: { duration: 0.4 },
        }}
        style={{
          textShadow: '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2)',
        }}
      >
        ⚙️ {t('nav.appTitle')}
      </motion.h1>

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
                    onClick={() => navigate(tile.route)}
                    className="relative aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 text-center cursor-pointer transition-all hover:bg-zinc-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95 md:w-[calc((100%-3rem)/4)]"
                  >
                    {tile.isNew && (
                      <span className="absolute top-2 right-2 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {t('common.new')}
                      </span>
                    )}
                    <Icon className="w-8 h-8 text-cyan-400" strokeWidth={2} />
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

      <button
        onClick={handleForceUpdate}
        className="mt-10 mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        {t('common.forceUpdate')}
      </button>

      <footer className="text-center mt-auto pt-6 text-zinc-600 text-sm pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        © 2026 Damian Drewniak
      </footer>
    </div>
  );
};

export default Index;
