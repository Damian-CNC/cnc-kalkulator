import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const REFRESH_KEY = "cnc_chunk_reload_attempted";

type LazyModule<T extends ComponentType<unknown>> = Promise<{ default: T }>;

const readRefreshFlag = () => {
  try {
    return window.sessionStorage.getItem(REFRESH_KEY) === "true";
  } catch {
    return true;
  }
};

const clearRefreshFlag = () => {
  try {
    window.sessionStorage.removeItem(REFRESH_KEY);
  } catch {
    // Storage may be unavailable in private browsing modes.
  }
};

export const lazyWithRetry = <T extends ComponentType<unknown>>(
  componentImport: () => LazyModule<T>,
): LazyExoticComponent<T> =>
  lazy(async () => {
    try {
      const component = await componentImport();
      clearRefreshFlag();
      return component;
    } catch (error) {
      if (!readRefreshFlag()) {
        try {
          window.sessionStorage.setItem(REFRESH_KEY, "true");
        } catch {
          // Continue to reload even when storage is unavailable.
        }
        window.location.reload();
        return new Promise<never>(() => undefined);
      }

      clearRefreshFlag();
      throw error;
    }
  });