import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Index from '@/pages/Index';
import ParametersPage from '@/pages/ParametersPage';
import WeightPage from '@/pages/WeightPage';
import ConePage from '@/pages/ConePage';
import HardnessPage from '@/pages/HardnessPage';
import ThreadCalculatorPage from '@/pages/ThreadCalculatorPage';
import NotFound from '@/pages/NotFound';

const AnimatedRoutes = () => {
  const location = useLocation();
  const prevPath = useRef(location.pathname);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const isGoingHome = location.pathname === '/';
    const wasHome = prevPath.current === '/';
    setDirection(isGoingHome ? -1 : wasHome ? 1 : 1);
    prevPath.current = location.pathname;
  }, [location.pathname]);

  const variants = {
    enter: (dir: number) => ({
      x: `${dir * 100}%`,
      opacity: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: `${dir * -100}%`,
      opacity: 1,
    }),
  };

  return (
    <div className="overflow-x-hidden w-full">
      <AnimatePresence mode="wait" custom={direction} initial={false}>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full"
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
