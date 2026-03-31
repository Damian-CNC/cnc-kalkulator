import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Index from '@/pages/Index';
import ParametersPage from '@/pages/ParametersPage';
import WeightPage from '@/pages/WeightPage';
import ConePage from '@/pages/ConePage';
import HardnessPage from '@/pages/HardnessPage';
import ThreadCalculatorPage from '@/pages/ThreadCalculatorPage';
import TolerancesPage from '@/pages/TolerancesPage';
import NotFound from '@/pages/NotFound';

const AnimatedRoutes = () => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const isGoingHome = location.pathname === '/';
    setDirection(isGoingHome ? -1 : 1);
    prevPath.current = location.pathname;
  }, [location.pathname]);

  const pageVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? '100vw' : '-100vw',
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'tween' as const,
        ease: 'easeOut',
        duration: 0.25,
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100vw' : '100vw',
      opacity: 0,
      transition: {
        type: 'tween' as const,
        ease: 'easeIn',
        duration: 0.2,
      },
    }),
  };

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-background">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="absolute inset-0 w-full h-full overflow-y-auto bg-background"
        >
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/parametry" element={<ParametersPage />} />
            <Route path="/waga" element={<WeightPage />} />
            <Route path="/stozek" element={<ConePage />} />
            <Route path="/twardosc" element={<HardnessPage />} />
            <Route path="/kalkulator-gwintow" element={<ThreadCalculatorPage />} />
            <Route path="/tolerancje" element={<TolerancesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
