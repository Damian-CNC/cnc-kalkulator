import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Wykrywa czy urządzenie to fizyczny smartfon / telefon.
 *
 * Dlaczego jest to kluczowe:
 * Gdy tokarz/operator obraca telefon do poziomu (landscape), szerokość ekranu
 * w CSS rośnie do 800–932 px (iPhone, Galaxy, Pixel). Przy zwykłym sprawdzeniu
 * `window.innerWidth < 768` telefon nagle przełączał się na widok PC Bento Grid!
 *
 * Smartfon ma zawsze:
 * 1. Krótszy wymiar fizyczny ekranu w CSS px < 600 px (nawet iPhone 16 Pro Max ma 430 px, S24 Ultra ma 412 px).
 * 2. Ekran dotykowy (pointer: coarse / maxTouchPoints > 0).
 * 3. Lub nagłówek User Agent typowy dla telefonu (iPhone, Android Mobile itp.).
 */
export function isPhoneDevice(): boolean {
  if (typeof window === "undefined") return false;

  const ua = navigator.userAgent || "";
  const isMobileUA = /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|webOS|Windows Phone/i.test(ua);
  if (isMobileUA) return true;

  const isTouch = (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) ||
    window.matchMedia?.("(pointer: coarse)").matches;
  const minScreenDim = Math.min(window.screen?.width || 9999, window.screen?.height || 9999);

  if (isTouch && minScreenDim < 600) {
    return true;
  }

  return false;
}

/**
 * Blokuje orientację ekranu w pozycji pionowej przy użyciu Screen Orientation API
 * tam, gdzie wspiera to przeglądarka / PWA (np. Chrome na Androidzie, tryb standalone).
 */
export function lockPortraitOrientation(): void {
  if (typeof window === "undefined" || !("screen" in window)) return;
  const orientation = window.screen.orientation as ScreenOrientation | undefined;
  if (!orientation || typeof orientation.lock !== "function") return;

  try {
    orientation.lock("portrait-primary").catch(() => {
      try {
        orientation.lock("portrait").catch(() => undefined);
      } catch {
        /* ignore */
      }
    });
  } catch {
    /* ignore */
  }
}

/**
 * Wykrywa, czy telefon jest trzymany poziomo (landscape).
 */
export function useIsLandscapePhone(): boolean {
  const [isLandscape, setIsLandscape] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return isPhoneDevice() && window.innerWidth > window.innerHeight;
  });

  React.useEffect(() => {
    const check = () => {
      setIsLandscape(isPhoneDevice() && window.innerWidth > window.innerHeight);
    };

    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    const mql = window.matchMedia?.("(orientation: landscape)");
    mql?.addEventListener?.("change", check);

    check();

    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
      mql?.removeEventListener?.("change", check);
    };
  }, []);

  return isLandscape;
}

/**
 * Zwraca true jeśli aplikacja powinna działać w widoku mobilnym.
 * Na smartfonach ZAWSZE zwraca true (nawet przy obrocie do landscape),
 * gwarantując, że wersja PC nigdy nie pojawi się na telefonie.
 * Na komputerach PC reaguje na zwężenie okna przeglądarki poniżej 768px.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (isPhoneDevice()) return true;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    const checkMobile = () => {
      // Smartfony ZAWSZE pozostają w widoku mobilnym!
      if (isPhoneDevice()) {
        setIsMobile(true);
        return;
      }
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", checkMobile);
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);

    checkMobile();

    return () => {
      mql.removeEventListener("change", checkMobile);
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  return isMobile;
}
