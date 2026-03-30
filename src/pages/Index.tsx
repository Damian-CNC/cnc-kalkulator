import { useNavigate } from 'react-router-dom';
import { Settings, Scale, Triangle, Gem, Wrench } from 'lucide-react';

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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-black tracking-wide mb-8 text-zinc-100 select-none text-center">
        ⚙️ Kalkulator CNC
      </h1>

      <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={() => navigate(tile.route)}
              className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm hover:border-zinc-600 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg ${tile.shadow}`}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${tile.color} shadow-lg`}>
                <Icon className="w-7 h-7 text-white" strokeWidth={2} />
              </div>
              <span className="text-sm md:text-base font-semibold text-zinc-200 text-center leading-tight">
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
