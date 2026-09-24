import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, ChevronRight, X } from 'lucide-react';
import useFavorites from '@/hooks/useFavorites';
import useHaptics from '@/hooks/useHaptics';

/**
 * Przyklejona gwiazdka z ulubionymi (lewy dolny róg, mobile i desktop).
 * Renderowana w App.tsx poza animowanymi stronami, dzięki czemu
 * transformacje animacji nie wpływają na jej pozycję.
 * Dodawanie do ulubionych: gwiazdka obok tytułu modułu (PageLayout).
 */
const FavoritesFab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites, removeFavorite, maxFavorites } = useFavorites();
  const { triggerLight } = useHaptics();
  const [isOpen, setIsOpen] = useState(false);

  const currentPath = `${location.pathname}${location.search}`;
  const isCurrentFavorite = favorites.some((f) => f.path === currentPath);

  // Zamknij panel po zmianie strony
  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  // Zamknij panel klawiszem Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  return (
    <div className="fixed left-4 sm:left-8 z-40 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:bottom-[calc(2rem+env(safe-area-inset-bottom))]">
      {isOpen && (
        <>
          <button
            type="button"
            aria-label="Zamknij ulubione"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute bottom-full left-0 z-50 mb-3 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <span>Ulubione</span>
              <span className="font-medium normal-case tracking-normal text-zinc-600">
                {favorites.length}/{maxFavorites}
              </span>
            </div>

            {favorites.length === 0 ? (
              <p className="px-3 py-3 text-center text-xs leading-relaxed text-zinc-500">
                Brak skrótów. Dotknij gwiazdki obok tytułu modułu, aby dodać.
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {favorites.map((item) => {
                  const isActive = item.path === currentPath;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center rounded-lg transition-colors hover:bg-zinc-800/80 ${
                        isActive ? 'bg-cyan-500/10' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => navigate(item.path)}
                        className={`flex min-w-0 flex-1 items-center justify-between px-2.5 py-2.5 text-left text-xs font-medium ${
                          isActive ? 'text-cyan-300' : 'text-zinc-200 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{item.title}</span>
                        <ChevronRight className="ml-1 h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Usuń ${item.title}`}
                        onClick={() => removeFavorite(item.id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-rose-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => {
          triggerLight();
          setIsOpen((prev) => !prev);
        }}
        aria-label="Ulubione skróty"
        aria-expanded={isOpen}
        className="relative z-50 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-900/85 text-amber-400 shadow-xl backdrop-blur-md transition-all duration-200 active:scale-95 sm:h-[42px] sm:w-[42px]"
      >
        <Star
          className={`h-5 w-5 sm:h-4 sm:w-4 ${
            isCurrentFavorite ? 'fill-amber-400 text-amber-400' : 'fill-amber-400/30 text-amber-400'
          }`}
        />
      </button>
    </div>
  );
};

export default FavoritesFab;
