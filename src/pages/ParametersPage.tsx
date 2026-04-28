import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ParametersCalculator from '@/components/ParametersCalculator';

const ParametersPage = () => {
  const navigate = useNavigate();
  const handleReset = () => {
    window.dispatchEvent(new CustomEvent('parameters-calculator-clear'));
  };

  return (
    <div className="grid grid-cols-[1fr_3.5rem] sm:grid-cols-[1fr_4rem] w-full h-[100dvh] overflow-hidden bg-zinc-950">
      {/* LEWA KOLUMNA: kalkulator z własnym scrollem pionowym */}
      <div className="h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 pb-safe">
        <div className="flex flex-col items-center pt-[max(1rem,env(safe-area-inset-top))]">
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

      {/* PRAWA KOLUMNA: przycisk WYCZYŚĆ */}
      <button
        onClick={handleReset}
        className="h-full bg-red-950/20 hover:bg-red-900/40 border-l border-zinc-800 flex items-center justify-center transition-all cursor-pointer group"
      >
        <span className="-rotate-90 whitespace-nowrap tracking-[0.3em] font-bold text-red-500 text-xs sm:text-sm uppercase group-hover:scale-110 transition-transform">
          Wyczyść
        </span>
      </button>
    </div>
  );
};

export default ParametersPage;
