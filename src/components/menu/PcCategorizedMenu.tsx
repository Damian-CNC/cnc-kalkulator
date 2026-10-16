import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useHaptics from '@/hooks/useHaptics';
import { MENU_SECTIONS, LUCIDE_ICONS } from '@/types/menu';

export const PcCategorizedMenu = () => {
  const navigate = useNavigate();
  const { triggerLight } = useHaptics();
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-4xl md:max-w-[44.8rem] flex flex-col gap-8 md:gap-6 mb-12 animate-in fade-in duration-300">
      {MENU_SECTIONS.map((section) => (
        <section key={section.titleKey}>
          <h2 className="text-zinc-400 text-sm uppercase tracking-widest mb-4 md:mb-3 px-1 md:text-xs font-semibold">
            {t(section.titleKey)}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:flex md:flex-wrap md:justify-center md:gap-3">
            {section.tiles.map((tile) => {
              const Icon = tile.icon;
              const isLucide = LUCIDE_ICONS.includes(Icon);
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => {
                    triggerLight();
                    navigate(tile.route);
                  }}
                  className="relative aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 p-3 text-center cursor-pointer transition-all hover:bg-zinc-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] active:scale-95 md:w-[calc((100%-2.25rem)/4)] md:gap-1.5 md:p-2.5 select-none"
                >
                  {tile.isNew && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {t('common.new')}
                    </span>
                  )}
                  <Icon
                    className="w-[60px] h-[60px] md:w-[67px] md:h-[67px] text-cyan-400"
                    strokeWidth={isLucide ? 0.85 : 2.25}
                  />
                  <span className="text-sm sm:text-base md:text-sm font-semibold text-zinc-200 leading-tight">
                    {t(tile.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default PcCategorizedMenu;
