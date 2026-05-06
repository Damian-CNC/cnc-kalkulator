import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, CircleDot, Cog, Hexagon } from 'lucide-react';

type Tile = {
  id: string;
  label: string;
  icon: typeof Wrench;
  route: string;
  color: string;
};

const tiles: Tile[] = [
  { id: 'metric', label: 'Gwinty Metryczne', icon: Wrench, route: '/threads/metric', color: 'text-cyan-400' },
  { id: 'bsp', label: 'Gwinty Rurowe BSP (G)', icon: CircleDot, route: '/threads/bsp', color: 'text-emerald-400' },
  { id: 'bsw', label: 'Gwinty BSW (Whitworth)', icon: Hexagon, route: '/threads/bsw', color: 'text-amber-400' },
  { id: 'bsf', label: 'Gwinty BSF (British Fine)', icon: Cog, route: '/threads/bsf', color: 'text-violet-400' },
];

const ThreadsSubmenuPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-zinc-950 pb-safe overflow-x-hidden flex flex-col items-center"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <header className="w-full max-w-2xl flex items-center gap-3 mb-6 px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">
          Wybierz rodzaj gwintu
        </h1>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mx-auto p-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={() => navigate(tile.route)}
              className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 text-center cursor-pointer transition-all hover:bg-zinc-800/80 hover:border-cyan-500/50 active:scale-95"
            >
              <Icon className={`w-10 h-10 ${tile.color}`} strokeWidth={2} />
              <span className="text-sm sm:text-base font-semibold text-zinc-200 leading-tight">
                {tile.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThreadsSubmenuPage;
