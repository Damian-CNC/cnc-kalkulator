import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import { ThreadIcon } from '@/components/icons/CncIcons';

const tileDefs = [
  { id: 'metric', badge: 'M', route: '/threads/metric', color: 'text-cyan-400' },
  { id: 'bsp', badge: 'G', route: '/threads/bsp', color: 'text-emerald-400' },
  { id: 'bsw', badge: 'BSW', route: '/threads/bsw', color: 'text-amber-400' },
  { id: 'bsf', badge: 'BSF', route: '/threads/bsf', color: 'text-violet-400' },
];

const ThreadsMenuPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <PageLayout title={t('pages.threads')}>
      <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
        {tileDefs.map((tile) => {
          return (
            <button
              key={tile.id}
              onClick={() => navigate(tile.route)}
              className="aspect-square bg-zinc-900 border border-zinc-800/80 rounded-2xl flex flex-col items-center justify-center gap-3 p-4 text-center cursor-pointer transition-all hover:bg-zinc-800/80 hover:border-cyan-500/50 active:scale-95"
            >
              <ThreadIcon badge={tile.badge} className={`w-[72px] h-[72px] ${tile.color}`} strokeWidth={2.25} />
              <span className="text-sm sm:text-base font-semibold text-zinc-200 leading-tight">
                {t(`threadsCalc:menu.${tile.id}`)}
              </span>
            </button>
          );
        })}
      </div>
    </PageLayout>
  );
};

export default ThreadsMenuPage;
