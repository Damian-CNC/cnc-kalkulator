import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { History, X } from 'lucide-react';

type Release = {
  version: string;
  key: string;
  date: string;
  tag: 'new' | 'update' | 'fix';
};

const RELEASES: Release[] = [
  { version: 'v2.5.0', key: 'v250', date: '2026-09', tag: 'new' },
  { version: 'v2.4.0', key: 'v240', date: '2026-08', tag: 'new' },
  { version: 'v2.3.0', key: 'v230', date: '2026-06', tag: 'new' },
  { version: 'v2.2.0', key: 'v220', date: '2026-04', tag: 'update' },
  { version: 'v2.1.0', key: 'v210', date: '2026-02', tag: 'update' },
];


const tagStyles: Record<Release['tag'], string> = {
  new: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  update: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  fix: 'bg-zinc-700/30 text-zinc-400 border-zinc-600/40',
};

const ChangelogModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation('app');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-black tracking-wide text-zinc-100">{t('changelog.title')}</h2>
              <p className="text-xs text-zinc-500">{t('changelog.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <ol className="relative border-l border-zinc-800 ml-2 flex flex-col gap-5">
          {RELEASES.map((r, i) => {
            const items = t(`changelog.${r.key}`, { returnObjects: true }) as string[];
            return (
              <li key={r.version} className="ml-5">
                <span className="absolute -left-[5px] mt-2 w-2.5 h-2.5 rounded-full bg-cyan-500/70" />
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-base font-bold text-zinc-100">{r.version}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tagStyles[r.tag]}`}
                  >
                    {t(`changelog.tags.${r.tag}`)}
                  </span>
                  {i === 0 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      {t('changelog.latest')}
                    </span>
                  )}
                  <span className="text-xs text-zinc-600 ml-auto">{r.date}</span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {(Array.isArray(items) ? items : []).map((item) => (
                    <li key={item} className="text-sm text-zinc-400 leading-snug flex gap-2">
                      <span className="text-cyan-500/60">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default ChangelogModal;
