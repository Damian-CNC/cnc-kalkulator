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

  return (
    <div className="relative w-full h-dvh overflow-hidden bg-background">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          initial="enter"
          animate="center"
          exit="exit"
          variants={{
            enter: (dir: number) => ({
              x: dir > 0 ? '100%' : '0%',
              zIndex: dir > 0 ? 2 : 0,
              opacity: dir > 0 ? 1 : 0.5,
            }),
            center: {
              x: '0%',
              zIndex: 1,
              opacity: 1,
            },
            exit: (dir: number) => ({
              x: dir > 0 ? '0%' : '100%',
              zIndex: dir > 0 ? 0 : 2,
              opacity: dir > 0 ? 1 : 1,
            }),
          }}
          transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 w-full h-full overflow-y-auto bg-background"
        >
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/parametry" element={<ParametersPage />} />
            <Route path="/waga" element={<WeightPage />} />
            <Route path="/stozek" element={<ConePage />} />
            <Route path="/twardosc" element={<HardnessPage />} />
            <Route path="/kalkulator-gwintow" element={<ThreadCalculatorPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
