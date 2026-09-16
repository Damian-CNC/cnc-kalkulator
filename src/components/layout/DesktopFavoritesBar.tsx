import { useNavigate } from 'react-router-dom';
import { Star, X } from 'lucide-react';
import useFavorites from '@/hooks/useFavorites';

const DesktopFavoritesBar = () => {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();

  return (
    <div className="hidden md:flex items-center gap-2 fixed top-3 left-4 z-40">
      <div className="flex items-center gap-2 bg-zinc-900/85 backdrop-blur-md border border-zinc-800 rounded-xl px-2.5 py-1.5 shadow-lg max-w-md">
        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
        {favorites.length === 0 ? (
          <span className="text-[11px] text-zinc-500 font-medium">
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
  );
};

export default DesktopFavoritesBar;
