import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, CircleDot, Cog } from 'lucide-react';

type Tile = {
  id: string;
  label: string;
  icon: typeof Wrench;
  route: string;
};

const tiles: Tile[] = [
  { id: 'metric', label: 'Gwinty Metryczne', icon: Wrench, route: '/threads/metric' },
  { id: 'bsp', label: 'Gwinty BSP', icon: CircleDot, route: '/threads/bsp' },
  { id: 'bsw-bsf', label: 'Gwinty BSW / BSF', icon: Cog, route: '/threads' },
];

const ThreadsSubmenuPage = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-zinc-950 p-4 pb-safe overflow-x-hidden flex flex-col items-center"
      style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
    >
      <header className="w-full max-w-4xl flex items-center gap-3 mb-8 px-1">
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

      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {tiles.map((tile) => {
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
      </div>
    </div>
  );
};

export default ThreadsSubmenuPage;
