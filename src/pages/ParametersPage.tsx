import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ParametersCalculator from '@/components/ParametersCalculator';
import ClearFab from '@/components/ClearFab';

const ParametersPage = () => {
  const navigate = useNavigate();
  const handleReset = () => {
    window.dispatchEvent(new CustomEvent('parameters-calculator-clear'));
  };

  return (
    <div className="relative h-[100dvh] w-full bg-zinc-950 overflow-hidden">
      {/* SEKCJA PRZEWIJANA */}
      <div className="h-full w-full overflow-y-auto overflow-x-hidden pb-28 sm:pb-32">
        <div className="flex flex-col items-center p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))]">
          <header className="w-full max-w-2xl flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">
              Parametry Skrawania
            </h1>
          </header>

          <main className="w-full max-w-2xl mx-auto">
            <ParametersCalculator />
          </main>
        </div>
      </div>

      {/* FAB — pływający przycisk "Wyczyść wszystko" */}
      <button
        onClick={handleReset}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-5 py-3 rounded-full border border-zinc-700/60 text-zinc-300 text-sm font-semibold tracking-wide shadow-lg backdrop-blur-md transition-all active:scale-95 hover:text-zinc-100 hover:border-zinc-600"
        style={{
          backgroundColor: 'rgba(24, 24, 27, 0.65)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
        aria-label="Wyczyść wszystko"
      >
        <RotateCcw className="w-4 h-4 text-cyan-400" />
        <span>Wyczyść wszystko</span>
      </button>
    </div>
  );
};

export default ParametersPage;
