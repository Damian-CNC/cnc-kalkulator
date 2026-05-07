import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useEffect, useState, lazy, Suspense } from 'react';

const Index = lazy(() => import('@/pages/Index'));
const ParametersPage = lazy(() => import('@/pages/ParametersPage'));
const WeightPage = lazy(() => import('@/pages/WeightPage'));
const ConePage = lazy(() => import('@/pages/ConePage'));
const HardnessPage = lazy(() => import('@/pages/HardnessPage'));
const ThreadsMenuPage = lazy(() => import('@/pages/ThreadsMenuPage'));
const MetricThreadPage = lazy(() => import('@/pages/MetricThreadPage'));
const BspThreadPage = lazy(() => import('@/pages/BspThreadPage'));
const BswThreadPage = lazy(() => import('@/pages/BswThreadPage'));
const BsfThreadPage = lazy(() => import('@/pages/BsfThreadPage'));
const TolerancesPage = lazy(() => import('@/pages/TolerancesPage'));
const StandardCuttingPage = lazy(() => import('@/pages/StandardCuttingPage'));
const TaperCalculatorPage = lazy(() => import('@/pages/TaperCalculatorPage'));
const PolygonShaftPage = lazy(() => import('@/pages/PolygonShaftPage'));
const ThreadsSubmenuPage = lazy(() => import('@/pages/ThreadsSubmenuPage'));
const Din509Page = lazy(() => import('@/pages/Din509Page'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const RouteFallback = () => (
  <div className="flex h-[100dvh] w-full items-center justify-center bg-zinc-950">
    <div
      className="h-12 w-12 rounded-full border-[3px] border-cyan-400/20 border-t-cyan-400 animate-spin"
      aria-label="Ładowanie"
    />
  </div>
);

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
          className="absolute top-0 left-0 w-full h-[100dvh] overflow-y-auto bg-zinc-950 pb-20"
        >
          <Suspense fallback={<RouteFallback />}>
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
              <Route path="/tolerancje" element={<TolerancesPage />} />
              <Route path="/standardowe-parametry" element={<StandardCuttingPage />} />
              <Route path="/kalkulator-stozkow" element={<TaperCalculatorPage />} />
              <Route path="/przekatne" element={<PolygonShaftPage />} />
              <Route path="/gwinty" element={<ThreadsSubmenuPage />} />
              <Route path="/podciecia-din509" element={<Din509Page />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
