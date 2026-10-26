import { useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import WakeLockToggle from '@/components/WakeLockToggle';
import AppFooter from '@/components/AppFooter';
import useHaptics from '@/hooks/useHaptics';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMenuLayout } from '@/hooks/useMenuLayout';
import { TILE_MAP } from '@/types/menu';
import MenuTile from '@/components/menu/MenuTile';
import MenuSpacer from '@/components/menu/MenuSpacer';
import MenuEditBar from '@/components/menu/MenuEditBar';
import MenuOnboardingHint from '@/components/menu/MenuOnboardingHint';
import PcCategorizedMenu from '@/components/menu/PcCategorizedMenu';

const Index = () => {
  const { t } = useTranslation();
  const { triggerLight } = useHaptics();
  const isMobile = useIsMobile();
  const {
    items,
    setItems,
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    addSpacer,
    removeSpacer,
    moveItem,
    resetToDefault,
  } = useMenuLayout();

  const draggedIdRef = useRef<string | null>(null);
  const lastSwapTimeRef = useRef<number>(0);

  const handleDragStart = (id: string) => {
    draggedIdRef.current = id;
    triggerLight();
  };

  const handleDrag = (id: string, info: PanInfo) => {
    // Przelicz współrzędne Framer Motion (pageX, pageY) na współrzędne widoku (clientX, clientY)
    // Dzięki temu przeciąganie działa w 100% poprawnie zarówno na PC jak i po przewinięciu strony na telefonie!
    const clientX = info.point.x - window.scrollX;
    const clientY = info.point.y - window.scrollY;

    // Płynny auto-scroll, gdy przeciągamy blisko krawędzi ekranu
    const edgeThreshold = 80;
    if (clientY < edgeThreshold && window.scrollY > 0) {
      window.scrollBy({ top: -10, behavior: 'auto' });
    } else if (clientY > window.innerHeight - edgeThreshold) {
      window.scrollBy({ top: 10, behavior: 'auto' });
    }

    const now = Date.now();
    // Odstęp min. 200 ms pomiędzy zamianami pozycji (zapobiega migotaniu przy granicy)
    if (now - lastSwapTimeRef.current < 200) return;

    // Szukamy kafelka pod kursorem/palcem w obrębie bieżącego widoku
    const elements = document.elementsFromPoint(clientX, clientY);
    let targetId: string | null = null;
    for (const el of elements) {
      const container = (el as HTMLElement).closest?.('[data-layout-id]');
      const layoutId = container?.getAttribute('data-layout-id');
      if (layoutId && layoutId !== id) {
        targetId = layoutId;
        break;
      }
    }

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

  const handleAddSpacer = () => {
    addSpacer();
    toast(t('menuEdit.spacerAddedBottom', { defaultValue: 'Pusty kafelek pojawił się na samym dole menu ⬇️' }), {
      duration: 1500,
    });
    // Płynne przewinięcie ekranu na sam dół do nowego kafelka
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    }, 60);
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-safe overflow-x-hidden flex flex-col items-center">
      {/* 
        ⚠️ WAŻNE DLA POTOMNYCH / ARCHITEKTURA NAGŁÓWKA:
        Tytuł / baner główny '⚙️ CNC HUB' MUSI być absolutnie i idealnie wycentrowany na środku ekranu
        na każdym urządzeniu (zarówno mobile, jak i PC).
        Układ opiera się na symetrycznym CSS Grid: `grid-cols-[2.25rem_1fr_2.25rem]`.
        Lewa kolumna (przycisk edycji na mobile / puste pole na PC) oraz prawa kolumna (WakeLockToggle)
        mają DOKŁADNIE taką samą szerokość: 2.25rem (w-9 = 36px).
        ABSOLUTNIE NIE DODAWAĆ tekstów do lewego przycisku ani nie zmieniać szerokości bocznych kolumn,
        ponieważ spowoduje to asymetrię i przesunięcie baneru ze środka ekranu!
      */}
      <header className="w-full pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pt-14 md:pt-4 pb-3 mb-6 max-w-4xl md:max-w-6xl grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
        {/* Na mobile przycisk trybu edycji (wyłącznie ikona w-9 h-9 dla idealnej symetrii), na PC puste pole wyrównujące */}
        {isMobile ? (
          <button
            type="button"
            onClick={toggleEditMode}
            className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all active:scale-95 ${
              isEditMode
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-zinc-800'
            }`}
            aria-label={isEditMode ? t('menuEdit.done') : t('menuEdit.edit')}
            title={isEditMode ? t('menuEdit.done') : t('menuEdit.edit')}
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          </button>
        ) : (
          <span aria-hidden="true" className="w-9 h-9" />
        )}

        {/* Tytuł / baner aplikacji - ZAWSZE IDEALNIE WYCENTROWANY */}
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

        {/* Blokada wygaszania ekranu (w-9 h-9) */}
        <div className="flex justify-end">
          <WakeLockToggle />
        </div>
      </header>

      {/* Na PC wyświetlamy menu podzielone na kategorie, bez możliwości edycji */}
      {!isMobile ? (
        <PcCategorizedMenu />
      ) : (
        <>
          {/* Podpowiedź przy pierwszym wejściu (tylko na mobile) */}
          {!isEditMode && (
            <MenuOnboardingHint onStartEdit={() => setIsEditMode(true)} />
          )}

          {/* Elastyczny pulpit z kafelkami na mobile */}
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
                      style={{ touchAction: isEditMode ? 'none' : 'pan-y' }}
                      className="w-full"
                    >
                      <MenuSpacer
                        id={item.id}
                        index={index}
                        totalItems={items.length}
                        isEditMode={isEditMode}
                        onRemove={removeSpacer}
                        onMove={(dir) => moveItem(item.id, dir)}
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
                    style={{ touchAction: isEditMode ? 'none' : 'pan-y' }}
                    className="w-full"
                  >
                    <MenuTile
                      tile={tile}
                      index={index}
                      totalItems={items.length}
                      isEditMode={isEditMode}
                      onStartEdit={() => setIsEditMode(true)}
                      onMove={(dir) => moveItem(item.id, dir)}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dolny pasek narzędzi w trybie edycji (tylko na mobile) */}
          {isEditMode && (
            <MenuEditBar
              onAddSpacer={handleAddSpacer}
              onReset={resetToDefault}
              onDone={() => setIsEditMode(false)}
            />
          )}
        </>
      )}

      {/* Stopka aplikacji */}
      <AppFooter className={isMobile && isEditMode ? 'pb-24' : ''} />
    </div>
  );
};

export default Index;
