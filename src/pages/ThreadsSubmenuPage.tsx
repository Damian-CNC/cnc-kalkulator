import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import { ThreadIcon } from '@/components/icons/CncIcons';

type Tile = {
  id: string;
  labelKey: string;
  badge: string;
  route: string;
  color: string;
  isNew?: boolean;
};

const tiles: Tile[] = [
  { id: 'metric', labelKey: 'threads.metric', badge: 'M', route: '/threads/metric', color: 'text-cyan-400' },
  { id: 'trapezoidal', labelKey: 'threads.trapezoidal', badge: 'Tr', route: '/threads/trapezoidal', color: 'text-sky-400' },
  { id: 'bsp', labelKey: 'threads.bsp', badge: 'G', route: '/threads/bsp', color: 'text-emerald-400' },
  { id: 'npt', labelKey: 'threads.npt', badge: 'NPT', route: '/threads/npt', color: 'text-rose-400' },
  { id: 'bsw', labelKey: 'threads.bsw', badge: 'BSW', route: '/threads/bsw', color: 'text-amber-400' },
  { id: 'bsf', labelKey: 'threads.bsf', badge: 'BSF', route: '/threads/bsf', color: 'text-violet-400' },
  { id: 'un', labelKey: 'tools:un.menu', badge: 'UN', route: '/threads/un', color: 'text-orange-400', isNew: true },
];

const ThreadsSubmenuPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PageLayout title={t('pages.threadsMenu')}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
        {tiles.map((tile) => {
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
              <ThreadIcon badge={tile.badge} className={`w-[72px] h-[72px] ${tile.color}`} strokeWidth={2.25} />
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
