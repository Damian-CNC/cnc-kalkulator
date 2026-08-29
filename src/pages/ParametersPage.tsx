import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ParametersCalculator from '@/components/ParametersCalculator';
import ClearFab from '@/components/ClearFab';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import WakeLockToggle from '@/components/WakeLockToggle';
import UnitSwitcher from '@/components/UnitSwitcher';

const ParametersPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
              <span className="hidden sm:inline">{t('common.menu')}</span>
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-wide">
              {t('pages.parameters')}
            </h1>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <UnitSwitcher />
              <WakeLockToggle />
              <LanguageSwitcher />
            </div>
          </header>

          <main className="w-full max-w-2xl mx-auto">
            <ParametersCalculator />
          </main>
        </div>
      </div>

      <ClearFab onClear={handleReset} label={t('common.clearAll')} />
    </div>
  );
};

export default ParametersPage;
