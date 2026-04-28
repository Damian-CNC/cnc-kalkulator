import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ParametersCalculator from '@/components/ParametersCalculator';

const ParametersPage = () => {
  const navigate = useNavigate();
  const handleReset = () => {
    window.dispatchEvent(new CustomEvent('parameters-calculator-clear'));
  };

  return (
    <div className="relative h-[100dvh] w-full bg-zinc-950 overflow-hidden">
      {/* SEKCJA PRZEWIJANA */}
      <div className="h-full w-full overflow-y-auto overflow-x-hidden pr-14 sm:pr-16 pb-20">
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

      {/* PRZYCISK WYCZYŚĆ — stała warstwa po prawej */}
      <button
        onClick={handleReset}
        className="absolute top-0 right-0 h-full w-14 sm:w-16 bg-zinc-900/90 border-l border-zinc-800 flex items-center justify-center z-[100] cursor-pointer hover:bg-zinc-800 transition-all active:scale-95"
      >
        <span className="-rotate-90 whitespace-nowrap tracking-widest font-bold text-red-500 text-xs sm:text-sm uppercase">
          Wyczyść
        </span>
      </button>
    </div>
  );
};

export default ParametersPage;
