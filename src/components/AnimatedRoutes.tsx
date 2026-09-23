import React, { useRef, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import Index from "@/pages/Index";
import ParametersPage from "@/pages/ParametersPage";
import RoughnessPage from "@/pages/RoughnessPage";
import TolerancesPage from "@/pages/TolerancesPage";
import Iso2768Page from "@/pages/Iso2768Page";
import Din509Page from "@/pages/Din509Page";
import ORingGroovesPage from "@/pages/ORingGroovesPage";
import SegerGroovesPage from "@/pages/SegerGroovesPage";
import KeywaysPage from "@/pages/KeywaysPage";
import WeightPage from "@/pages/WeightPage";
import HardnessPage from "@/pages/HardnessPage";
import ConePage from "@/pages/ConePage";
import TaperCalculatorPage from "@/pages/TaperCalculatorPage";
import PolygonShaftPage from "@/pages/PolygonShaftPage";
import BoltCirclePage from "@/pages/BoltCirclePage";
import LinearHolesPage from "@/pages/LinearHolesPage";
import TruePositionPage from "@/pages/TruePositionPage";
import ThreadsMenuPage from "@/pages/ThreadsMenuPage";
import ThreadsSubmenuPage from "@/pages/ThreadsSubmenuPage";
import MetricThreadPage from "@/pages/MetricThreadPage";
import TrapezoidalThreadPage from "@/pages/TrapezoidalThreadPage";
import BspThreadPage from "@/pages/BspThreadPage";
import BswThreadPage from "@/pages/BswThreadPage";
import BsfThreadPage from "@/pages/BsfThreadPage";
import NptThreadCalculator from "@/pages/NptThreadCalculator";
import PrivacyPage from "@/pages/PrivacyPage";
import NotFound from "@/pages/NotFound";

const getPathDepth = (path: string): number => {
  if (path === "/" || path === "") return 0;
  if (path === "/threads" || path === "/threads-menu") return 1;
  if (path.startsWith("/threads/")) return 2;
  return 1;
};

// Czyste przesunięcie X oparte wyłącznie o natywny kompozytor GPU (0 lagów przy montowaniu komponentów)
const pageVariants = {
  initial: (direction: number) => ({
    transform: direction > 0 ? "translate3d(100%, 0, 0)" : "translate3d(-20%, 0, 0)",
    zIndex: direction > 0 ? 2 : 1,
  }),
  animate: {
    transform: "translate3d(0%, 0, 0)",
    zIndex: 2,
    transition: {
      duration: 0.26,
      ease: [0.32, 0.72, 0, 1],
    },
  },
  exit: (direction: number) => ({
    transform: direction > 0 ? "translate3d(-20%, 0, 0)" : "translate3d(100%, 0, 0)",
    zIndex: direction > 0 ? 1 : 3,
    transition: {
      duration: 0.26,
      ease: [0.32, 0.72, 0, 1],
    },
  }),
};

export const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentIdx = (window.history.state?.idx as number) ?? 0;

  const navStateRef = useRef({
    path: currentPath,
    idx: currentIdx,
    direction: 1,
  });

  if (navStateRef.current.path !== currentPath) {
    const prevPath = navStateRef.current.path;
    const prevIdx = navStateRef.current.idx;

    let dir = 1;

    if (currentPath === "/") {
      dir = -1;
    } else if (prevPath === "/") {
      dir = 1;
    } else {
      const prevDepth = getPathDepth(prevPath);
      const currDepth = getPathDepth(currentPath);

      if (currDepth < prevDepth) {
        dir = -1;
      } else if (currDepth > prevDepth) {
        dir = 1;
      } else {
        if (typeof currentIdx === "number" && typeof prevIdx === "number" && currentIdx !== prevIdx) {
          dir = currentIdx < prevIdx ? -1 : 1;
        } else {
          dir = 1;
        }
      }
    }

    navStateRef.current = {
      path: currentPath,
      idx: currentIdx,
      direction: dir,
    };
  }

  const direction = navStateRef.current.direction;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background touch-pan-y">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`min-h-screen w-full bg-background ${
            direction > 0 ? "shadow-[-20px_0_35px_rgba(0,0,0,0.55)]" : ""
          }`}
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
            <Route path="/threads/trapezoidal" element={<TrapezoidalThreadPage />} />
            <Route path="/threads/npt" element={<NptThreadCalculator />} />
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
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
