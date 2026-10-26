import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useHaptics from '@/hooks/useHaptics';
import { MENU_SECTIONS, LUCIDE_ICONS, type TileDefinition } from '@/types/menu';

export const PcCategorizedMenu = () => {
  const navigate = useNavigate();
  const { triggerLight } = useHaptics();
  const { t } = useTranslation();

  const handleTileClick = (route: string) => {
    triggerLight();
    navigate(route);
  };

  const renderTile = (tile: TileDefinition) => {
    const Icon = tile.icon;
    const isLucide = LUCIDE_ICONS.includes(Icon);
    return (
      <button
        key={tile.id}
        type="button"
        onClick={() => handleTileClick(tile.route)}
        className="relative aspect-square w-full bg-zinc-900 border border-zinc-800/90 rounded-xl flex flex-col items-center justify-center gap-1.5 p-2 text-center cursor-pointer select-none transition-all hover:bg-zinc-800/90 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.18)] hover:-translate-y-0.5 active:scale-95 group"
      >
        {tile.isNew && (
          <span className="absolute top-1.5 right-1.5 text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1 py-0.2 rounded uppercase tracking-wider">
            {t('common.new')}
          </span>
        )}
        <Icon
          className="w-[46px] h-[46px] text-cyan-400 group-hover:scale-105 transition-transform duration-150 shrink-0"
          strokeWidth={isLucide ? 0.9 : 2.25}
        />
        <span className="text-xs font-semibold text-zinc-200 group-hover:text-white leading-tight line-clamp-2 px-0.5">
          {t(tile.labelKey)}
        </span>
      </button>
    );
  };

  // Sekcje z types/menu.ts:
  // 0: basic (2), 1: machining (1), 2: threadsFits (3), 3: geometry (8), 4: standardParts (5), 5: materials (4)
  const basicTiles = MENU_SECTIONS[0]?.tiles ?? [];
  const machiningTiles = MENU_SECTIONS[1]?.tiles ?? [];
  const basicAndMachiningTiles = [...basicTiles, ...machiningTiles];
  const threadsTiles = MENU_SECTIONS[2]?.tiles ?? [];
  const materialsTiles = MENU_SECTIONS[5]?.tiles ?? [];
  const geometryTiles = MENU_SECTIONS[3]?.tiles ?? [];
  const standardPartsTiles = MENU_SECTIONS[4]?.tiles ?? [];

  return (
    <div className="w-full max-w-6xl flex flex-col gap-4 mb-10 animate-in fade-in duration-300">
      {/* RZĄD 1 (3 równe kolumny Bento): Podstawowe & Obróbka (3) | Gwinty i Pasowania (3) | Materiały (4) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bento 1: Podstawowe & Obróbka */}
        <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-zinc-700/60 transition-colors">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <h2 className="text-zinc-300 text-xs font-bold uppercase tracking-wider">
                {t('sections.basic')} &amp; {t('sections.machining')}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/40">
              {basicAndMachiningTiles.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {basicAndMachiningTiles.map(renderTile)}
          </div>
        </section>

        {/* Bento 2: Gwinty i Pasowania */}
        <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-zinc-700/60 transition-colors">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <h2 className="text-zinc-300 text-xs font-bold uppercase tracking-wider">
                {t('sections.threadsFits')}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/40">
              {threadsTiles.length}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {threadsTiles.map(renderTile)}
          </div>
        </section>

        {/* Bento 3: Materiały */}
        <section className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-zinc-700/60 transition-colors">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <h2 className="text-zinc-300 text-xs font-bold uppercase tracking-wider">
                {t('sections.materials')}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/40">
              {materialsTiles.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {materialsTiles.map(renderTile)}
          </div>
        </section>
      </div>

      {/* RZĄD 2 (2 szerokie panele Bento): Geometria (8 kafelków, 4x2) | Części Znormalizowane (5 kafelków) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bento 4: Geometria (7 kolumn) */}
        <section className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-zinc-700/60 transition-colors">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              <h2 className="text-zinc-300 text-xs font-bold uppercase tracking-wider">
                {t('sections.geometry')}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/40">
              {geometryTiles.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {geometryTiles.map(renderTile)}
          </div>
        </section>

        {/* Bento 5: Części Znormalizowane (5 kolumn) */}
        <section className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3 shadow-sm hover:border-zinc-700/60 transition-colors">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
              <h2 className="text-zinc-300 text-xs font-bold uppercase tracking-wider">
                {t('sections.standardParts')}
              </h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-2 py-0.5 rounded-md border border-zinc-700/40">
              {standardPartsTiles.length}
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
            {standardPartsTiles.map(renderTile)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PcCategorizedMenu;
