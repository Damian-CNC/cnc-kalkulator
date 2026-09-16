import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface FavoriteItem {
  id: string;
  title: string;
  path: string;
}

const STORAGE_KEY = 'cnc_desktop_favorites';
const MAX_FAVORITES = 4;

const read = (): FavoriteItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FavoriteItem[]) : [];
  } catch {
    return [];
  }
};

const listeners = new Set<(items: FavoriteItem[]) => void>();
let memory: FavoriteItem[] | null = null;

const publish = (items: FavoriteItem[]) => {
  memory = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l(items));
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => memory ?? read());

  useEffect(() => {
    listeners.add(setFavorites);
    return () => {
      listeners.delete(setFavorites);
    };
  }, []);

  const addFavorite = useCallback((item: FavoriteItem) => {
    const current = memory ?? read();
    if (current.some((f) => f.path === item.path)) return true;
    if (current.length >= MAX_FAVORITES) {
      toast.warning('Maksymalnie 4 ulubione skróty');
      return false;
    }
    publish([...current, item]);
    return true;
  }, []);

  const removeFavorite = useCallback((id: string) => {
    const current = memory ?? read();
    publish(current.filter((f) => f.id !== id));
  }, []);

  const isFavorite = useCallback(
    (path: string) => favorites.some((f) => f.path === path),
    [favorites],
  );

  return { favorites, addFavorite, removeFavorite, isFavorite, maxFavorites: MAX_FAVORITES };
}

export default useFavorites;
