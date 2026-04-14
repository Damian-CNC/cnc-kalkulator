import { Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Index from '@/pages/Index';
import ParametersPage from '@/pages/ParametersPage';
import WeightPage from '@/pages/WeightPage';
import ConePage from '@/pages/ConePage';
import HardnessPage from '@/pages/HardnessPage';
import ThreadsMenuPage from '@/pages/ThreadsMenuPage';
import MetricThreadPage from '@/pages/MetricThreadPage';
import BspThreadPage from '@/pages/BspThreadPage';
import BswThreadPage from '@/pages/BswThreadPage';
import BsfThreadPage from '@/pages/BsfThreadPage';
import TolerancesPage from '@/pages/TolerancesPage';
import StandardCuttingPage from '@/pages/StandardCuttingPage';
import TaperCalculatorPage from '@/pages/TaperCalculatorPage';
import NotFound from '@/pages/NotFound';

const AnimatedRoutes = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const prevPath = useRef(location.pathname);
  const [direction, setDirection] = useState(1);

  const isPopNavigation = navigationType === 'POP';

  useEffect(() => {
    const isGoingHome = location.pathname === '/' || location.pathname === '/threads';
    setDirection(isGoingHome ? -1 : 1);
    prevPath.current = location.pathname;
  }, [location.pathname]);

  const pageVariants = {
    initial: (dir: number) => ({
      x: isPopNavigation ? 0 : (dir > 0 ? '100vw' : '-100vw'),
      opacity: isPopNavigation ? 1 : 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween' as const,
        ease: 'easeOut' as const,
        duration: isPopNavigation ? 0 : 0.25,
      },
    },
    exit: (dir: number) => ({
      x: isPopNavigation ? 0 : (dir > 0 ? '-100vw' : '100vw'),
      opacity: isPopNavigation ? 1 : 0,
      transition: {
        type: 'tween' as const,
        ease: 'easeIn' as const,
        duration: isPopNavigation ? 0 : 0.2,
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
