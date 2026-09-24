import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import WakeLockToggle from './WakeLockToggle';
import UnitSwitcher from './UnitSwitcher';
import useFavorites from '@/hooks/useFavorites';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  backRoute?: string;
  favoriteTitle?: string;
  /** Use compact bottom padding when the page's scroll should end with its content. */
  compactBottom?: boolean;
}

const FAVORITE_VIEW_LABELS: Record<string, string> = {
  external: 'Zewnętrzny', internal: 'Wewnętrzny', shaft: 'Wałek', bore: 'Otwór',
  hole: 'Otwór',
  forward: 'Ra / Rz', reverse: 'Posuw dla Ra', linear: 'Liniowe', chamfer: 'Fazy',
  radial: 'Promieniowe', axial: 'Osiowe', dynamic: 'Dynamiczne',
};

const PageLayout = ({ title, children, backRoute = '/', compactBottom = false, favoriteTitle }: PageLayoutProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { addFavorite, removeFavorite, isFavorite, favorites } = useFavorites();

  const path = `${location.pathname}${location.search}`;
  const favorited = isFavorite(path);
  const activeView = new URLSearchParams(location.search).get('tab')
    ?? new URLSearchParams(location.search).get('type')
    ?? new URLSearchParams(location.search).get('mode')
    ?? new URLSearchParams(location.search).get('fit')
    ?? new URLSearchParams(location.search).get('class');
  const resolvedFavoriteTitle = favoriteTitle
    ?? (activeView ? `${title} — ${FAVORITE_VIEW_LABELS[activeView] ?? activeView.toUpperCase()}` : title);

  const toggleFavorite = () => {
    if (favorited) {
      const existing = favorites.find((f) => f.path === path);
      if (existing) removeFavorite(existing.id);
    } else {
      addFavorite({ id: encodeURIComponent(path), title: resolvedFavoriteTitle, path });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-background text-zinc-100 overflow-x-hidden pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] pt-14 md:pt-12"
    >
      <header className="flex items-center gap-4 mb-6 sm:mb-8 mt-2 p-4 sm:p-6 pb-0 max-w-2xl mx-auto w-full">
        <button
          onClick={() => navigate(backRoute)}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold tracking-wide truncate">{title}</h1>
          <button
            type="button"
            onClick={toggleFavorite}
            className="inline-flex items-center justify-center p-1 rounded-md text-zinc-400 hover:text-amber-400 transition-colors shrink-0"
            title={favorited ? 'Usuń z ulubionych' : 'Dodaj do ulubionych (max 4)'}
            aria-label={favorited ? 'Usuń z ulubionych' : 'Dodaj do ulubionych (max 4)'}
            aria-pressed={favorited}
          >
            <Star className={`w-4 h-4 transition-colors ${favorited ? 'fill-amber-400 text-amber-400' : 'text-zinc-500 hover:text-amber-400'}`} />
          </button>
        </div>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <UnitSwitcher />
          <div className="md:hidden">
            <WakeLockToggle />
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main
        className={`flex-1 w-full max-w-4xl mx-auto px-4 pt-4 ${
          compactBottom
            ? 'pb-6'
            : 'pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6'
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
