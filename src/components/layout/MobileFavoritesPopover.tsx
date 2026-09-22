import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, ChevronRight, Plus } from 'lucide-react';
import useFavorites from '@/hooks/useFavorites';

interface MobileFavoritesPopoverProps {
  /** Optional override title for the current page's favorite bookmark. */
  favoriteTitle?: string;
}

/**
 * Compact mobile-only favorites trigger + dropdown popover.
 * Visible on mobile (`md:hidden`), uses the same favorites store as the
 * desktop bar. Tapping the star opens a floating list of saved shortcuts
 * plus a quick "add current page" action.
 */
const MobileFavoritesPopover = ({ favoriteTitle }: MobileFavoritesPopoverProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  const path = `${location.pathname}${location.search}`;
  const isCurrentPageFavorite = isFavorite(path);
  const isRoot = path === '/' || path === '';

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const toggleCurrentFavorite = () => {
    if (isCurrentPageFavorite) {
      const existing = favorites.find((f) => f.path === path);
      if (existing) removeFavorite(existing.id);
    } else {
      addFavorite({
        id: encodeURIComponent(path),
        title: favoriteTitle ?? path,
        path,
      });
    }
  };

  const label = isCurrentPageFavorite ? 'Usuń tę stronę' : 'Dodaj bieżącą stronę';

  return (
    <div className="relative md:hidden" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900/80 border border-zinc-800 text-amber-400 active:scale-95 transition-all shadow-sm"
        aria-label="Ulubione skróty"
        aria-expanded={isOpen}
      >
        <Star
          className={`w-4 h-4 ${isCurrentPageFavorite ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/30 text-amber-400'}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Zamknij ulubione"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          {/* Dropdown */}
          <div className="absolute right-0 top-10 w-56 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-2 py-1 flex items-center justify-between">
              <span>Ulubione (max 4)</span>
              <span className="text-zinc-600 normal-case font-medium tracking-normal">
                {favorites.length}/4
              </span>
            </div>

            <div className="flex flex-col">
              {favorites.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-3">
                  Brak zapisanych skrótów
                </p>
              ) : (
                favorites.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      navigate(item.path);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/80 transition-colors"
                  >
                    <span className="truncate">{item.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0 ml-1" />
                  </button>
                ))
              )}
            </div>

            {!isRoot && favorites.length < 4 && (
              <button
                onClick={() => {
                  toggleCurrentFavorite();
                  setIsOpen(false);
                }}
                className="w-full mt-1 pt-1.5 border-t border-zinc-800 flex items-center gap-1.5 px-2 py-1.5 text-xs text-cyan-400 hover:bg-zinc-900 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isCurrentPageFavorite ? 'Usuń tę stronę' : label}</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MobileFavoritesPopover;
