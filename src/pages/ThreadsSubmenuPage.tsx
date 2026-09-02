import { useNavigate } from 'react-router-dom';
import { Wrench, CircleDot, Cog, Hexagon, ChevronsUpDown, Pipette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';

type Tile = {
  id: string;
  labelKey: string;
  icon: typeof Wrench;
  route: string;
  color: string;
  isNew?: boolean;
};

const tiles: Tile[] = [
  { id: 'metric', labelKey: 'threads.metric', icon: Wrench, route: '/threads/metric', color: 'text-cyan-400' },
  { id: 'trapezoidal', labelKey: 'threads.trapezoidal', icon: ChevronsUpDown, route: '/threads/trapezoidal', color: 'text-sky-400' },
  { id: 'bsp', labelKey: 'threads.bsp', icon: CircleDot, route: '/threads/bsp', color: 'text-emerald-400' },
  { id: 'npt', labelKey: 'threads.npt', icon: Pipette, route: '/threads/npt', color: 'text-rose-400' },
  { id: 'bsw', labelKey: 'threads.bsw', icon: Hexagon, route: '/threads/bsw', color: 'text-amber-400' },
  { id: 'bsf', labelKey: 'threads.bsf', icon: Cog, route: '/threads/bsf', color: 'text-violet-400' },
];

const ThreadsSubmenuPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PageLayout title={t('pages.threadsMenu')}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => navigate(tile.route)}
              className="relative aspect-square bg-zinc-900 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 text-center cursor-pointer touch-manipulation transition-all hover:bg-zinc-800/80 hover:border-cyan-500/50 active:scale-95"
            >
              {tile.isNew && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {t('common.new')}
                </span>
              )}
              <Icon className={`w-10 h-10 ${tile.color}`} strokeWidth={2} />
              <span className="text-sm sm:text-base font-semibold text-zinc-200 leading-tight">
                {t(tile.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </PageLayout>
  );
};

export default ThreadsSubmenuPage;
