import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
  backRoute?: string;
}

const PageLayout = ({ title, children, backRoute = '/' }: PageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden pb-safe"
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      <header className="flex items-center gap-4 mb-6 sm:mb-8 mt-2 p-4 sm:p-6 pb-0 max-w-2xl mx-auto w-full">
        <button
          onClick={() => navigate(backRoute)}
          className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="Wstecz"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg sm:text-xl font-bold tracking-wide">{title}</h1>
      </header>

      <main className="w-full max-w-2xl mx-auto px-4 sm:px-6">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
