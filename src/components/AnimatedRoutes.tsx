import React, { useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, Variants } from "framer-motion";

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

// Animacje wyłącznie na transform/opacity (GPU), bez cieni i skalowania
const pageVariants: Variants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-25%",
    opacity: direction > 0 ? 1 : 0.75,
    zIndex: direction > 0 ? 2 : 1,
  }),
  animate: {
    x: "0%",
    opacity: 1,
    zIndex: 2,
    transition: {
      x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.28 },
      opacity: { type: "tween", ease: "linear", duration: 0.18 },
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-25%" : "100%",
    opacity: direction > 0 ? 0.75 : 1,
    zIndex: direction > 0 ? 1 : 3,
    transition: {
      x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.28 },
      opacity: { type: "tween", ease: "linear", duration: 0.18 },
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
        if (
          typeof currentIdx === "number" &&
          typeof prevIdx === "number" &&
          currentIdx !== prevIdx
        ) {
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

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden bg-background">
      <AnimatePresence
        mode="popLayout"
        initial={false}
        custom={direction}
        onExitComplete={() => window.scrollTo(0, 0)}
      >
        <motion.div
          key={currentPath}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`relative w-full min-h-screen bg-background ${
            direction > 0
              ? "before:absolute before:inset-y-0 before:-left-5 before:w-5 before:pointer-events-none before:bg-gradient-to-r before:from-transparent before:to-black/40"
              : ""
          }`}
        >
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/parameters" element={<ParametersPage />} />
            <Route path="/roughness" element={<RoughnessPage />} />
            <Route path="/tolerances" element={<TolerancesPage />} />
            <Route path="/tolerances/iso2768" element={<Iso2768Page />} />
            <Route path="/iso2768" element={<Iso2768Page />} />
            <Route path="/threads" element={<ThreadsMenuPage />} />
            <Route path="/threads/submenu" element={<ThreadsSubmenuPage />} />
            <Route path="/threads-menu" element={<ThreadsSubmenuPage />} />
            <Route path="/threads/metric" element={<MetricThreadPage />} />
            <Route path="/threads/trapezoidal" element={<TrapezoidalThreadPage />} />
            <Route path="/threads/bsp" element={<BspThreadPage />} />
            <Route path="/threads/bsw" element={<BswThreadPage />} />
            <Route path="/threads/bsf" element={<BsfThreadPage />} />
            <Route path="/threads/npt" element={<NptThreadCalculator />} />
            <Route path="/din509" element={<Din509Page />} />
            <Route path="/oring" element={<ORingGroovesPage />} />
            <Route path="/seger" element={<SegerGroovesPage />} />
            <Route path="/keyways" element={<KeywaysPage />} />
            <Route path="/weight" element={<WeightPage />} />
            <Route path="/hardness" element={<HardnessPage />} />
            <Route path="/cone" element={<ConePage />} />
            <Route path="/taper-calculator" element={<TaperCalculatorPage />} />
            <Route path="/polygon" element={<PolygonShaftPage />} />
            <Route path="/pcd" element={<BoltCirclePage />} />
            <Route path="/bolt-circle" element={<BoltCirclePage />} />
            <Route path="/linear-holes" element={<LinearHolesPage />} />
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
