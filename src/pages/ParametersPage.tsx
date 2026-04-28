import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ParametersCalculator from '@/components/ParametersCalculator';

const ParametersPage = () => {
  const navigate = useNavigate();
  const handleReset = () => {
    window.dispatchEvent(new CustomEvent('parameters-calculator-clear'));
  };

  return (
    <div className="flex w-full min-h-screen relative bg-zinc-950">
      {/* LEWA STRONA (Kalkulator): Wypełnia przestrzeń. Brak własnego suwaka. */}
      <div className="flex-1 p-4 sm:p-6 pb-safe">
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

      {/* PRAWA STRONA (Tor dla przycisku): Pusta kolumna o szerokości przycisku */}
      <div className="w-14 sm:w-16 shrink-0 relative">
        {/* SAM PRZYCISK: 'sticky top-0' sprawia, że sunie razem z ekranem. */}
        <div
          onClick={handleReset}
          className="sticky top-0 h-[100dvh] w-full bg-zinc-900 border-l border-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors z-40 select-none pb-safe"
        >
          <span className="-rotate-90 whitespace-nowrap tracking-[0.3em] font-bold text-red-500 text-sm uppercase">
            Wyczyść
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParametersPage;
