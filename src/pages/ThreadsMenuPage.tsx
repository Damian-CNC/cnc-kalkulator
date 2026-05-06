import { useNavigate } from 'react-router-dom';
import { Wrench, CircleDot, Cog, Settings2 } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const tiles = [
  { id: 'metric', label: 'Gwinty Metryczne', icon: Wrench, route: '/threads/metric', color: 'text-cyan-400' },
  { id: 'bsp', label: 'Gwinty Rurowe BSP (G)', icon: CircleDot, route: '/threads/bsp', color: 'text-emerald-400' },
  { id: 'bsw', label: 'Gwinty BSW (Whitworth)', icon: Cog, route: '/threads/bsw', color: 'text-amber-400' },
  { id: 'bsf', label: 'Gwinty BSF (British Fine)', icon: Settings2, route: '/threads/bsf', color: 'text-violet-400' },
];

const ThreadsMenuPage = () => {
  const navigate = useNavigate();

  return (
    <PageLayout title="Gwinty">
      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              onClick={() => navigate(tile.route)}
              className="aspect-square bg-zinc-900 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 text-center cursor-pointer transition-all hover:bg-zinc-800/80 hover:border-cyan-500/50 active:scale-95"
            >
              <Icon className={`w-10 h-10 ${tile.color}`} strokeWidth={2} />
              <span className="text-sm sm:text-base font-semibold text-zinc-200 leading-tight">
                {tile.label}
              </span>
            </button>
          );
        })}
      </div>
    </PageLayout>
  );
};

export default ThreadsMenuPage;
