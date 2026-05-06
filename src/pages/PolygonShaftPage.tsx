import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PolygonShaftCalculator from '@/components/PolygonShaftCalculator';

const PolygonShaftPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-full bg-zinc-950 overflow-x-hidden p-4 sm:p-6 pb-safe"
         style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
      <header className="w-full max-w-2xl mx-auto flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Menu</span>
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">
          Kalkulator Przekątnych
        </h1>
      </header>

      <main className="w-full max-w-2xl mx-auto">
        <PolygonShaftCalculator />
      </main>
    </div>
  );
};

export default PolygonShaftPage;
