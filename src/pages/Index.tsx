import { useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import WakeLockToggle from '@/components/WakeLockToggle';
import AppFooter from '@/components/AppFooter';
import useHaptics from '@/hooks/useHaptics';
import { useMenuLayout } from '@/hooks/useMenuLayout';
import { TILE_MAP } from '@/types/menu';
import MenuTile from '@/components/menu/MenuTile';
import MenuSpacer from '@/components/menu/MenuSpacer';
import MenuEditBar from '@/components/menu/MenuEditBar';
import MenuOnboardingHint from '@/components/menu/MenuOnboardingHint';

const Index = () => {
  const { t } = useTranslation();
  const { triggerLight } = useHaptics();
  const {
    items,
    setItems,
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    addSpacer,
    removeSpacer,
    resetToDefault,
  } = useMenuLayout();

  const draggedIdRef = useRef<string | null>(null);
  const lastSwapTimeRef = useRef<number>(0);

  const handleDragStart = (id: string) => {
    draggedIdRef.current = id;
    triggerLight();
  };

  const handleDrag = (id: string, info: PanInfo) => {
    const now = Date.now();
    // Odstęp min. 220 ms pomiędzy zamianami pozycji (zapobiega migotaniu przy granicy)
    if (now - lastSwapTimeRef.current < 220) return;

    // Pobierz wszystkie elementy pod kursorem/palcem i znajdź inny kafelek
    const elements = document.elementsFromPoint(info.point.x, info.point.y);
    const targetEl = elements.find((el) => {
      const layoutId = el.getAttribute('data-layout-id');
      return layoutId && layoutId !== id;
    });

    const targetId = targetEl?.getAttribute('data-layout-id');
    if (targetId && targetId !== id) {
      lastSwapTimeRef.current = now;
      triggerLight();
      setItems((prev) => {
        const fromIndex = prev.findIndex((item) => item.id === id);
        const toIndex = prev.findIndex((item) => item.id === targetId);
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return prev;
        const copy = [...prev];
        const [moved] = copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, moved);
        return copy;
      });
    }
  };

  const handleDragEnd = () => {
    draggedIdRef.current = null;
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-safe overflow-x-hidden flex flex-col items-center">
      {/* Nagłówek */}
      <header className="w-full pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pt-14 md:pt-3 pb-3 mb-6 md:mb-6 max-w-4xl md:max-w-[44.8rem] grid grid-cols-[auto_1fr_auto] items-center gap-2">
        {/* Przycisk trybu edycji menu */}
        <button
          type="button"
          onClick={toggleEditMode}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
            isEditMode
              ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
          title={isEditMode ? t('menuEdit.done') : t('menuEdit.edit')}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">
            {isEditMode ? t('menuEdit.done') : t('menuEdit.edit')}
          </span>
        </button>

        {/* Tytuł aplikacji */}
        <motion.h1
          className="text-xl min-[400px]:text-2xl md:text-3xl font-black tracking-wide text-zinc-100 select-none text-center"
          initial={{ rotate: -360, scale: 0.5, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          transition={{
            rotate: { duration: 0.8, ease: 'easeOut' },
            scale: { duration: 0.8, ease: 'easeOut' },
            opacity: { duration: 0.4 },
          }}
          style={{
            textShadow: '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2)',
          }}
        >
          ⚙️ {t('nav.appTitle')}
        </motion.h1>

        {/* Blokada wygaszania ekranu */}
        <div className="flex justify-end">
          <WakeLockToggle />
        </div>
      </header>

      {/* Podpowiedź przy pierwszym wejściu */}
      {!isEditMode && (
        <MenuOnboardingHint onStartEdit={() => setIsEditMode(true)} />
      )}

      {/* Elastyczny pulpit z kafelkami */}
      <div className="w-full max-w-4xl md:max-w-[44.8rem] mb-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
          {items.map((item, index) => {
            if (item.type === 'spacer') {
              return (
                <motion.div
                  key={item.id}
                  layout
                  data-layout-id={item.id}
                  drag={isEditMode}
                  dragSnapToOrigin
                  whileDrag={{ scale: 1.05, zIndex: 50 }}
                  onDragStart={() => handleDragStart(item.id)}
                  onDrag={(_e, info) => handleDrag(item.id, info)}
                  onDragEnd={handleDragEnd}
                  transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                  className="w-full"
                >
                  <MenuSpacer
                    id={item.id}
                    index={index}
                    isEditMode={isEditMode}
                    onRemove={removeSpacer}
                  />
                </motion.div>
              );
            }

            const tile = TILE_MAP.get(item.tileId || '');
            if (!tile) return null;

            return (
              <motion.div
                key={item.id}
                layout
                data-layout-id={item.id}
                drag={isEditMode}
                dragSnapToOrigin
                whileDrag={{ scale: 1.05, zIndex: 50 }}
                onDragStart={() => handleDragStart(item.id)}
                onDrag={(_e, info) => handleDrag(item.id, info)}
                onDragEnd={handleDragEnd}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                className="w-full"
              >
                <MenuTile
                  tile={tile}
                  index={index}
                  isEditMode={isEditMode}
                  onStartEdit={() => setIsEditMode(true)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dolny pasek narzędzi w trybie edycji */}
      {isEditMode && (
        <MenuEditBar
          onAddSpacer={() => addSpacer()}
          onReset={resetToDefault}
          onDone={() => setIsEditMode(false)}
        />
      )}

      {/* Stopka aplikacji */}
      <AppFooter className={isEditMode ? 'pb-24' : ''} />
    </div>
  );
};

export default Index;
