import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ParametersCalculator from '@/components/ParametersCalculator';

const ParametersPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-background">
      {/* Lewa strona – scrollowana zawartość */}
      <div className="absolute top-0 left-0 w-full h-full overflow-y-auto pr-14 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex flex-col items-center px-4 py-6 pt-[max(1rem,env(safe-area-inset-top))]">
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

      {/* Prawa strona – sztywny pionowy przycisk WYCZYŚĆ */}
      <button
        onClick={() => {
          window.dispatchEvent(new CustomEvent('parameters-calculator-clear'));
        }}
        className="absolute top-0 right-0 w-14 h-full bg-zinc-900 border-l border-zinc-800 flex items-center justify-center z-50 cursor-pointer hover:bg-zinc-800 transition-colors pb-[max(0px,env(safe-area-inset-bottom))]"
        aria-label="Wyczyść wszystkie pola"
        title="Wyczyść wszystkie pola"
      >
        <span className="-rotate-90 whitespace-nowrap tracking-[0.3em] font-bold text-red-500 text-sm uppercase">
          Wyczyść
        </span>
      </button>
    </div>
  );
};

export default ParametersPage;
