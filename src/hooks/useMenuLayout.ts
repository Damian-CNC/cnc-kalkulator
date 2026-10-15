import { useState, useEffect, useCallback } from 'react';
import {
  ALL_TILES,
  DEFAULT_LAYOUT,
  TILE_MAP,
  type MenuLayoutItem,
} from '@/types/menu';

const STORAGE_KEY = 'cnc_menu_layout_v2';

const loadSavedLayout = (): MenuLayoutItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_LAYOUT;

    // Walidacja i auto-healing:
    const validItems: MenuLayoutItem[] = [];
    const existingTileIds = new Set<string>();

    for (const item of parsed) {
      if (item.type === 'spacer') {
        validItems.push({
          id: item.id || `spacer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: 'spacer',
        });
      } else if (item.type === 'tile' && item.tileId && TILE_MAP.has(item.tileId)) {
        if (!existingTileIds.has(item.tileId)) {
          existingTileIds.add(item.tileId);
          validItems.push({
            id: item.tileId,
            type: 'tile',
            tileId: item.tileId,
          });
        }
      }
    }

    // Dodaj na koniec wszelkie nowo dodane kafelki, których nie ma w zapisanym układzie użytkownika
    for (const tile of ALL_TILES) {
      if (!existingTileIds.has(tile.id)) {
        validItems.push({
          id: tile.id,
          type: 'tile',
          tileId: tile.id,
        });
      }
    }

    return validItems;
  } catch (error) {
    console.error('Failed to load menu layout:', error);
    return DEFAULT_LAYOUT;
  }
};

export const useMenuLayout = () => {
  const [items, setItemsState] = useState<MenuLayoutItem[]>(loadSavedLayout);
  const [isEditMode, setIsEditMode] = useState(false);

  // Zapis do localStorage przy każdej zmianie elementów
  const setItems = useCallback((newItems: MenuLayoutItem[] | ((prev: MenuLayoutItem[]) => MenuLayoutItem[])) => {
    setItemsState((prev) => {
      const next = typeof newItems === 'function' ? newItems(prev) : newItems;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save menu layout:', e);
      }
      return next;
    });
  }, []);

  const addSpacer = useCallback((afterId?: string) => {
    const newSpacer: MenuLayoutItem = {
      id: `spacer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'spacer',
    };

    setItems((prev) => {
      if (!afterId) {
        return [...prev, newSpacer];
      }
      const index = prev.findIndex((item) => item.id === afterId);
      if (index === -1) return [...prev, newSpacer];
      const copy = [...prev];
      copy.splice(index + 1, 0, newSpacer);
      return copy;
    });
  }, [setItems]);

  const removeSpacer = useCallback((spacerId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== spacerId));
  }, [setItems]);

  const moveItem = useCallback((id: string, direction: 'left' | 'right') => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  }, [setItems]);

  const resetToDefault = useCallback(() => {
    setItems(DEFAULT_LAYOUT);
  }, [setItems]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  // Zamknij tryb edycji klawiszem Escape
  useEffect(() => {
    if (!isEditMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsEditMode(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isEditMode]);

  return {
    items,
    setItems,
    isEditMode,
    setIsEditMode,
    toggleEditMode,
    addSpacer,
    removeSpacer,
    moveItem,
    resetToDefault,
  };
};
