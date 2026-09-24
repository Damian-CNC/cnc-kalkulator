import { useEffect, useRef, Suspense, type ComponentType } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Każda strona jest ładowana leniwie, ale zapamiętujemy loadery,
// żeby po starcie aplikacji pobrać wszystkie chunki w tle.
// Dzięki temu nowa strona jest gotowa w momencie startu animacji.
const preloaders: Array<() => Promise<unknown>> = [];

const page = <T extends ComponentType<unknown>>(
  load: () => Promise<{ default: T }>,
) => {
  preloaders.push(load);
  return lazyWithRetry(load);
};

const Index = page(() => import("@/pages/Index"));
const ParametersPage = page(() => import("@/pages/ParametersPage"));
const WeightPage = page(() => import("@/pages/WeightPage"));
const ConePage = page(() => import("@/pages/ConePage"));
const HardnessPage = page(() => import("@/pages/HardnessPage"));
const ThreadsMenuPage = page(() => import("@/pages/ThreadsMenuPage"));
const MetricThreadPage = page(() => import("@/pages/MetricThreadPage"));
const BspThreadPage = page(() => import("@/pages/BspThreadPage"));
const BswThreadPage = page(() => import("@/pages/BswThreadPage"));
const BsfThreadPage = page(() => import("@/pages/BsfThreadPage"));
const TrapezoidalThreadPage = page(() => import("@/pages/TrapezoidalThreadPage"));
const NptThreadPage = page(() => import("@/pages/NptThreadCalculator"));
const TolerancesPage = page(() => import("@/pages/TolerancesPage"));
const Iso2768Page = page(() => import("@/pages/Iso2768Page"));
const TaperCalculatorPage = page(() => import("@/pages/TaperCalculatorPage"));
const PolygonShaftPage = page(() => import("@/pages/PolygonShaftPage"));
const ThreadsSubmenuPage = page(() => import("@/pages/ThreadsSubmenuPage"));
const Din509Page = page(() => import("@/pages/Din509Page"));
const RoughnessPage = page(() => import("@/pages/RoughnessPage"));
const SegerGroovesPage = page(() => import("@/pages/SegerGroovesPage"));
const KeywaysPage = page(() => import("@/pages/KeywaysPage"));
const ORingGroovesPage = page(() => import("@/pages/ORingGroovesPage"));
const BoltCirclePage = page(() => import("@/pages/BoltCirclePage"));
const LinearHolesPage = page(() => import("@/pages/LinearHolesPage"));
const TruePositionPage = page(() => import("@/pages/TruePositionPage"));
const PrivacyPage = page(() => import("@/pages/PrivacyPage"));
const MillChamferPage = page(() => import("@/pages/MillChamferPage"));
const NotFound = page(() => import("@/pages/NotFound"));

let preloadStarted = false;

const preloadAllPages = () => {
  if (preloadStarted) return;
  preloadStarted = true;

  const queue = [...preloaders];
  const idle =
    (window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    }).requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));

  const next = () => {
    const load = queue.shift();
    if (!load) return;
    load()
      .catch(() => undefined)
      .finally(() => idle(next));
  };

  idle(next);
};

// Głębokość ekranu: 0 = menu główne, 1 = moduł lub podmenu, 2 = podstrona gwintów
const getPathDepth = (path: string): number => {
  if (path === "/" || path === "") return 0;
  if (path === "/gwinty" || path === "/threads") return 1;
  if (path.startsWith("/threads/")) return 2;
  return 1;
};

// Tylko transform i opacity, bez cieni i skalowania
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

const AnimatedRoutes = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentIdx = (window.history.state?.idx as number) ?? 0;

  const navStateRef = useRef({
    path: currentPath,
    idx: currentIdx,
    direction: 1,
  });

  // Kierunek liczony synchronicznie w trakcie renderu (bez useState/useEffect),
  // żeby pierwsza klatka animacji miała już poprawny kierunek.
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
      } else if (currentIdx !== prevIdx) {
        dir = currentIdx < prevIdx ? -1 : 1;
      }
    }

    navStateRef.current = { path: currentPath, idx: currentIdx, direction: dir };
  }

  const direction = navStateRef.current.direction;

  useEffect(() => {
    preloadAllPages();
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background touch-pan-y">
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
          className={`relative min-h-screen w-full bg-background ${
            direction > 0
              ? "before:pointer-events-none before:absolute before:inset-y-0 before:-left-5 before:w-5 before:bg-gradient-to-r before:from-transparent before:to-black/40"
              : ""
          }`}
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
              <Route path="/faza-frezem" element={<MillChamferPage />} />
              <Route path="/mill-chamfer" element={<MillChamferPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedRoutes;
