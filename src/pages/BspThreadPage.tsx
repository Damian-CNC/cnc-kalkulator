import BspThreadCalculator from '@/components/BspThreadCalculator';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BspThreadPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-6 pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="w-full max-w-2xl flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/threads')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Gwinty</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">
          Gwinty Rurowe BSP (G)
        </h1>
      </header>

      <main className="w-full max-w-2xl mx-auto">
        <BspThreadCalculator />
      </main>
    </div>
  );
};

export default BspThreadPage;
