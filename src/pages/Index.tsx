import { useNavigate } from 'react-router-dom';
import { Settings, Scale, Triangle, Gem, Ruler, ClipboardList, RefreshCw, Cone, Hexagon, Bolt, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';

type Tile = {
  id: string;
  label: string;
  icon: typeof Settings;
  route: string;
};

const sections: { title: string; tiles: Tile[] }[] = [
  {
    title: 'Obróbka',
    tiles: [
      { id: 'parameters', label: 'Parametry', icon: Settings, route: '/parametry' },
      { id: 'std-cutting', label: 'Standardowe Parametry', icon: ClipboardList, route: '/standardowe-parametry' },
    ],
  },
  {
    title: 'Gwinty i Pasowania',
    tiles: [
      { id: 'tolerances', label: 'Tolerancje ISO', icon: Ruler, route: '/tolerancje' },
      { id: 'threads', label: 'Gwinty', icon: Bolt, route: '/gwinty' },
    ],
  },
  {
    title: 'Geometria',
    tiles: [
      { id: 'taper', label: 'Fazy', icon: Cone, route: '/kalkulator-stozkow' },
      { id: 'cone', label: 'Stożek Wiertła', icon: Triangle, route: '/stozek' },
      { id: 'polygon', label: 'Przekątne', icon: Hexagon, route: '/przekatne' },
      { id: 'din509', label: 'Podcięcia DIN 509', icon: Scissors, route: '/podciecia-din509' },
    ],
  },
  {
    title: 'Materiały',
    tiles: [
      { id: 'weight', label: 'Waga', icon: Scale, route: '/waga' },
      { id: 'hardness', label: 'Twardość', icon: Gem, route: '/twardosc' },
    ],
  },
];

const Index = () => {
  const navigate = useNavigate();

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
      console.error('Błąd podczas aktualizacji:', error);
      window.location.reload();
    }
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 p-4 pb-safe overflow-x-hidden flex flex-col items-center"
      style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}
    >
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
        ⚙️ Kalkulator CNC
      </motion.h1>

      <div className="w-full max-w-4xl flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-zinc-400 text-sm uppercase tracking-widest mb-4 px-1">
              {section.title}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {section.tiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <button
                    key={tile.id}
                    onClick={() => navigate(tile.route)}
                    className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 text-center cursor-pointer transition-all hover:bg-zinc-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95"
                  >
                    <Icon className="w-8 h-8 text-cyan-400" strokeWidth={2} />
                    <span className="text-sm sm:text-base font-semibold text-zinc-200 leading-tight">
                      {tile.label}
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
        Wymuś aktualizację
      </button>

      <footer className="text-center mt-auto pt-6 text-zinc-600 text-sm pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        © 2025 Damian Drewniak
      </footer>
    </div>
  );
};

export default Index;
