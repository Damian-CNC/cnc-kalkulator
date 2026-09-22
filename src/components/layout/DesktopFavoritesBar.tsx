import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, X } from 'lucide-react';
import useFavorites from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

const DesktopFavoritesBar = () => {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();

  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    return localStorage.getItem('cnc_favorites_expanded') !== 'false'; // default to expanded
  });

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const next = !prev;
      localStorage.setItem('cnc_favorites_expanded', String(next));
      return next;
    });
  };

  return (
    <div className="hidden md:flex items-center fixed top-3 left-4 z-40">
      <div className="bg-zinc-900/85 backdrop-blur-md border border-zinc-800 rounded-xl p-1.5 shadow-lg flex items-center transition-all duration-300">
        <button
          onClick={toggleExpanded}
          className="p-1.5 rounded-lg text-amber-400 hover:bg-zinc-800/80 transition-colors flex items-center justify-center shrink-0"
          title={isExpanded ? 'Zwiń pasek ulubionych' : 'Rozwiń pasek ulubionych'}
          aria-label={isExpanded ? 'Zwiń pasek ulubionych' : 'Rozwiń pasek ulubionych'}
          aria-expanded={isExpanded}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        </button>
        <div
          className={cn(
            'flex items-center gap-1.5 transition-all duration-300 ease-in-out overflow-hidden',
            isExpanded ? 'max-w-xl opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0 pointer-events-none',
          )}
        >
          {favorites.length === 0 ? (
            <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
              Ulubione: kliknij gwiazdkę w nagłówku (max 4)
            </span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {favorites.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="group flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/60 hover:border-zinc-600 text-zinc-200 text-xs font-medium transition-all"
                >
                  <span className="truncate max-w-[9rem]">{item.title}</span>
                  <X
                    role="button"
                    aria-label={`Usuń ${item.title}`}
                    className="w-3 h-3 text-zinc-500 hover:text-rose-400 opacity-70 group-hover:opacity-100 transition-opacity ml-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(item.id);
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesktopFavoritesBar;
