import { useNavigate } from 'react-router-dom';
import { Settings, Scale, Triangle, Gem, Wrench, Ruler } from 'lucide-react';

const tiles = [
  {
    id: 'threads',
    label: 'Gwinty Metryczne',
    icon: Wrench,
    route: '/kalkulator-gwintow',
    color: 'from-emerald-500 to-green-400',
    shadow: 'shadow-emerald-500/20',
  },
  {
    id: 'parameters',
    label: 'Parametry Skrawania',
    icon: Settings,
    route: '/parametry',
    color: 'from-cyan-500 to-teal-400',
    shadow: 'shadow-cyan-500/20',
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 pb-8"
         style={{ paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
      <h1 className="text-2xl md:text-4xl font-black tracking-wide mb-6 text-zinc-100 select-none text-center">
        ⚙️ Kalkulator CNC
      </h1>

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

      <footer className="text-center mt-auto pt-10 text-zinc-600 text-sm">
        © 2025 Damian Drewniak
      </footer>
    </div>
  );
};

export default Index;
