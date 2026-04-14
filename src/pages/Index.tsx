import { useNavigate } from 'react-router-dom';
import { Settings, Scale, Triangle, Gem, Wrench, Ruler, ClipboardList, RefreshCw, Cone } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

const tiles = [
  {
    id: 'parameters',
    label: 'Parametry Skrawania',
    icon: Settings,
    route: '/parametry',
    color: 'from-cyan-500 to-teal-400',
    shadow: 'shadow-cyan-500/20',
  },
  {
    id: 'tolerances',
    label: 'Tolerancje ISO 286',
    icon: Ruler,
    route: '/tolerancje',
    color: 'from-sky-500 to-blue-400',
    shadow: 'shadow-sky-500/20',
  },
  {
    id: 'threads',
    label: 'Gwinty',
    icon: Wrench,
    route: '/threads',
    color: 'from-emerald-500 to-green-400',
    shadow: 'shadow-emerald-500/20',
  },
  {
    id: 'weight',
    label: 'Kalkulator Wagi',
    icon: Scale,
    route: '/waga',
    color: 'from-violet-500 to-purple-400',
    shadow: 'shadow-violet-500/20',
  },
  {
    id: 'cone',
    label: 'Stożek Wiertła',
    icon: Triangle,
    route: '/stozek',
    color: 'from-amber-500 to-orange-400',
    shadow: 'shadow-amber-500/20',
  },
  {
    id: 'taper',
    label: 'Kalkulator Stożków',
    icon: Cone,
    route: '/kalkulator-stozkow',
    color: 'from-pink-500 to-fuchsia-400',
    shadow: 'shadow-pink-500/20',
  },
  {
    id: 'std-cutting',
    label: 'Standardowe Parametry',
    icon: ClipboardList,
    route: '/standardowe-parametry',
    color: 'from-lime-500 to-green-400',
    shadow: 'shadow-lime-500/20',
  },
  {
    id: 'hardness',
    label: 'Twardość',
    icon: Gem,
    route: '/twardosc',
    color: 'from-rose-500 to-pink-400',
    shadow: 'shadow-rose-500/20',
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
    <div className="min-h-screen bg-background flex flex-col items-center px-4 pb-8"
         style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}>
      <motion.div
        className="flex items-center justify-center gap-3 mb-6 select-none"
        initial={{ rotate: -360, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: [1, 1.05, 1], opacity: 1 }}
        transition={{
          rotate: { duration: 0.8, ease: 'easeOut' },
          scale: { duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut', delay: 0.8 },
          opacity: { duration: 0.4 },
        }}
      >
        <img src={logo} alt="Kalkulator CNC" className="h-12 w-12 rounded-xl drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]" />
        <h1
          className="text-2xl md:text-4xl font-black tracking-wide text-zinc-100"
          style={{ textShadow: '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2)' }}
        >
          Kalkulator CNC
        </h1>
      </motion.div>

      <div className="w-full max-w-md flex flex-col gap-3 px-2">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={() => navigate(tile.route)}
              className={`group flex items-center gap-4 px-5 py-4 rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm hover:border-zinc-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${tile.shadow} w-full text-left`}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${tile.color} shadow-lg shrink-0`}>
                <Icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <span className="text-base font-semibold text-zinc-200 leading-tight">
                {tile.label}
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleForceUpdate}
        className="mt-8 mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-colors text-sm"
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
