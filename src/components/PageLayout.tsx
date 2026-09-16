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
  /** Use compact bottom padding when the page's scroll should end with its content. */
  compactBottom?: boolean;
}

const PageLayout = ({ title, children, backRoute = '/', compactBottom = false }: PageLayoutProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { addFavorite, removeFavorite, isFavorite, favorites } = useFavorites();

  const path = location.pathname;
  const favorited = isFavorite(path);

  const toggleFavorite = () => {
    if (favorited) {
      const existing = favorites.find((f) => f.path === path);
      if (existing) removeFavorite(existing.id);
    } else {
      addFavorite({ id: path.replace(/^\//, '').replace(/\//g, '-') || 'home', title, path });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-background text-zinc-100 overflow-x-hidden"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      <header className="flex items-center gap-4 mb-6 sm:mb-8 mt-2 p-4 sm:p-6 pb-0 max-w-2xl mx-auto w-full">
        <button
          onClick={() => navigate(backRoute)}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold tracking-wide truncate">{title}</h1>
        <div className="ml-auto flex items-center gap-1.5 shrink-0">
          <UnitSwitcher />
          <WakeLockToggle />
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
