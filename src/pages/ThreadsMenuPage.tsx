import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, CircleDot } from 'lucide-react';

const tiles = [
  {
    id: 'metric',
    label: 'Gwinty Metryczne',
    icon: Wrench,
    route: '/threads/metric',
    color: 'from-emerald-500 to-green-400',
    shadow: 'shadow-emerald-500/20',
  },
  {
    id: 'bsp',
    label: 'Gwinty Rurowe BSP (G)',
    icon: CircleDot,
    route: '/threads/bsp',
    color: 'from-sky-500 to-cyan-400',
    shadow: 'shadow-sky-500/20',
  },
];

const ThreadsMenuPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 pb-8"
         style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}>
      <header className="w-full max-w-md flex items-center gap-3 mb-6 px-2">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">
          🔩 Gwinty
        </h1>
      </header>

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
    </div>
  );
};

export default ThreadsMenuPage;
