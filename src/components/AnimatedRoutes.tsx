import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useEffect, useState, Suspense } from 'react';
import { lazyWithRetry } from '@/lib/lazyWithRetry';

const Index = lazyWithRetry(() => import('@/pages/Index'));
const ParametersPage = lazyWithRetry(() => import('@/pages/ParametersPage'));
const WeightPage = lazyWithRetry(() => import('@/pages/WeightPage'));
const ConePage = lazyWithRetry(() => import('@/pages/ConePage'));
const HardnessPage = lazyWithRetry(() => import('@/pages/HardnessPage'));
const ThreadsMenuPage = lazyWithRetry(() => import('@/pages/ThreadsMenuPage'));
const MetricThreadPage = lazyWithRetry(() => import('@/pages/MetricThreadPage'));
const BspThreadPage = lazyWithRetry(() => import('@/pages/BspThreadPage'));
const BswThreadPage = lazyWithRetry(() => import('@/pages/BswThreadPage'));
const BsfThreadPage = lazyWithRetry(() => import('@/pages/BsfThreadPage'));
const TrapezoidalThreadPage = lazyWithRetry(() => import('@/pages/TrapezoidalThreadPage'));
const NptThreadPage = lazyWithRetry(() => import('@/pages/NptThreadCalculator'));
const TolerancesPage = lazyWithRetry(() => import('@/pages/TolerancesPage'));
const Iso2768Page = lazyWithRetry(() => import('@/pages/Iso2768Page'));
const TaperCalculatorPage = lazyWithRetry(() => import('@/pages/TaperCalculatorPage'));
const PolygonShaftPage = lazyWithRetry(() => import('@/pages/PolygonShaftPage'));
const ThreadsSubmenuPage = lazyWithRetry(() => import('@/pages/ThreadsSubmenuPage'));
const Din509Page = lazyWithRetry(() => import('@/pages/Din509Page'));
const RoughnessPage = lazyWithRetry(() => import('@/pages/RoughnessPage'));
const SegerGroovesPage = lazyWithRetry(() => import('@/pages/SegerGroovesPage'));
const KeywaysPage = lazyWithRetry(() => import('@/pages/KeywaysPage'));
const ORingGroovesPage = lazyWithRetry(() => import('@/pages/ORingGroovesPage'));
const BoltCirclePage = lazyWithRetry(() => import('@/pages/BoltCirclePage'));
const LinearHolesPage = lazyWithRetry(() => import('@/pages/LinearHolesPage'));
const TruePositionPage = lazyWithRetry(() => import('@/pages/TruePositionPage'));
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'));

const AnimatedRoutes = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPath = useRef(location.pathname);
  const [direction, setDirection] = useState(1);

  const isPopNavigation = navigationType === 'POP';
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  useEffect(() => {
    const isGoingHome = location.pathname === '/' || location.pathname === '/threads';
    setDirection(isGoingHome ? -1 : 1);
    prevPath.current = location.pathname;
  }, [location.pathname]);

  const getDuration = (mobileDur: number) => (!isMobile || isPopNavigation) ? 0 : mobileDur;

  const pageVariants = {
    initial: (dir: number) => ({
      x: (isPopNavigation || !isMobile) ? 0 : (dir > 0 ? '100vw' : '-100vw'),
      opacity: (isPopNavigation || !isMobile) ? 1 : 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween' as const,
        ease: 'easeOut' as const,
        duration: getDuration(0.25),
      },
    },
    exit: (dir: number) => ({
      x: (isPopNavigation || !isMobile) ? 0 : (dir > 0 ? '-100vw' : '100vw'),
      opacity: (isPopNavigation || !isMobile) ? 1 : 0,
      transition: {
        type: 'tween' as const,
        ease: 'easeIn' as const,
        duration: getDuration(0.2),
      },
    }),
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-zinc-950 touch-pan-y">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="app-scroll-container absolute top-0 left-0 w-full h-[100dvh] overflow-y-auto bg-zinc-950 pb-20"
        >
          <Suspense fallback={<div className="min-h-[50vh]" aria-hidden />}>
          <Routes location={location}>
              <Route path="/" element={<Index />} />
              <Route path="/parametry" element={<ParametersPage />} />
              <Route path="/waga" element={<WeightPage />} />
              <Route path="/stozek" element={<ConePage />} />
              <Route path="/twardosc" element={<HardnessPage />} />
              <Route path="/threads" element={<ThreadsMenuPage />} />
              <Route path="/threads/metric" element={<MetricThreadPage />} />
              <Route path="/threads/bsp" element={<BspThreadPage />} />
              <Route path="/threads/bsw" element={<BswThreadPage />} />
              <Route path="/threads/bsf" element={<BsfThreadPage />} />
              <Route path="/threads/trapezoidal" element={<TrapezoidalThreadPage />} />
              <Route path="/threads/npt" element={<NptThreadPage />} />
              <Route path="/tolerancje" element={<TolerancesPage />} />
              <Route path="/tolerancje-iso-2768" element={<Iso2768Page />} />
              <Route path="/iso-2768" element={<Iso2768Page />} />
              <Route path="/kalkulator-stozkow" element={<TaperCalculatorPage />} />
              <Route path="/przekatne" element={<PolygonShaftPage />} />
              <Route path="/gwinty" element={<ThreadsSubmenuPage />} />
              <Route path="/podciecia-din509" element={<Din509Page />} />
              <Route path="/chropowatosc" element={<RoughnessPage />} />
              <Route path="/rowki-segera" element={<SegerGroovesPage />} />
              <Route path="/wpusty" element={<KeywaysPage />} />
              <Route path="/rowki-oring" element={<ORingGroovesPage />} />
              <Route path="/surface-roughness" element={<RoughnessPage />} />
              <Route path="/seger" element={<SegerGroovesPage />} />
              <Route path="/feather-keys" element={<KeywaysPage />} />
              <Route path="/oring" element={<ORingGroovesPage />} />
              <Route path="/pcd" element={<BoltCirclePage />} />
              <Route path="/otwory-liniowe" element={<LinearHolesPage />} />
              <Route path="/true-position" element={<TruePositionPage />} />
              <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
