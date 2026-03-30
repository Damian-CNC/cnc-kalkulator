import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

const PageLayout = ({ title, children }: PageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center px-4 py-6">
      <header className="w-full max-w-2xl flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">
          {title}
        </h1>
      </header>

      <main className="w-full max-w-2xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
