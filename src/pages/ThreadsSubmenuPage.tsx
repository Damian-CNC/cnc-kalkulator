import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import { ThreadIcon, HelixAngleIcon } from '@/components/icons/CncIcons';

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
  { id: 'helicoil', labelKey: 'threads.helicoil', badge: 'EG M', route: '/threads/helicoil', color: 'text-cyan-400' },
  { id: 'trapezoidal', labelKey: 'threads.trapezoidal', badge: 'Tr', route: '/threads/trapezoidal', color: 'text-sky-400' },
  { id: 'bsp', labelKey: 'threads.bsp', badge: 'G', route: '/threads/bsp', color: 'text-emerald-400' },
  { id: 'npt', labelKey: 'threads.npt', badge: 'NPT', route: '/threads/npt', color: 'text-rose-400' },
  { id: 'bsw', labelKey: 'threads.bsw', badge: 'BSW', route: '/threads/bsw', color: 'text-amber-400' },
  { id: 'bsf', labelKey: 'threads.bsf', badge: 'BSF', route: '/threads/bsf', color: 'text-violet-400' },
  { id: 'un', labelKey: 'tools:un.menu', badge: 'UN', route: '/threads/un', color: 'text-orange-400' },
  { id: 'acme', labelKey: 'tools:acme.menu', badge: 'Acme', route: '/threads/acme', color: 'text-pink-400' },
  { id: 'rd', labelKey: 'tools:rd.menu', badge: 'Rd', route: '/threads/rd', color: 'text-teal-400' },
  { id: 'bspt', labelKey: 'tools:bspt.menu', badge: 'R', route: '/threads/bspt', color: 'text-sky-400' },
  { id: 'buttress', labelKey: 'tools:buttress.menu', badge: 'S', route: '/threads/buttress', color: 'text-amber-400' },
  { id: 'pg', labelKey: 'tools:pg.menu', badge: 'Pg', route: '/threads/pg', color: 'text-lime-400' },
  { id: 'helixAngle', labelKey: 'threads.helixAngle', badge: 'λ', route: '/kat-linii-srubowej', color: 'text-amber-400', isNew: true },
];

const ThreadsSubmenuPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PageLayout title={t('pages.threadsMenu')} wideDesktop>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-4 w-full">
        {tiles.map((tile) => {
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => navigate(tile.route)}
              className="relative aspect-square md:aspect-[1.05/1] bg-zinc-900 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center gap-2 p-3 text-center cursor-pointer select-none transition-all hover:bg-zinc-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_16px_rgba(6,182,212,0.18)] hover:-translate-y-0.5 active:scale-95 group"
            >
              {tile.isNew && (
                <span className="absolute top-2 right-2 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {t('common.new')}
                </span>
              )}
              {tile.id === 'helixAngle' ? (
                <HelixAngleIcon
                  className={`w-[72px] h-[72px] md:w-[94px] md:h-[94px] ${tile.color} group-hover:scale-105 transition-transform duration-150`}
                  strokeWidth={2.25}
                />
              ) : (
                <ThreadIcon
                  badge={tile.badge}
                  className={`w-[72px] h-[72px] md:w-[94px] md:h-[94px] ${tile.color} group-hover:scale-105 transition-transform duration-150`}
                  strokeWidth={2.25}
                />
              )}
              <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white leading-tight line-clamp-2 px-1">
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
