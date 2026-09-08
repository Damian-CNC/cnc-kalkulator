import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { LegalSections } from '@/components/DisclaimerGateModal';

const PrivacyPage = () => {
  const { t } = useTranslation('app');
  const navigate = useNavigate();

  return (
    <main className="min-h-[100dvh] bg-zinc-950 px-4 py-6 flex justify-center">
      <div className="w-full max-w-2xl">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900/70 text-zinc-300 text-sm font-semibold transition-colors hover:text-cyan-400 hover:border-cyan-500/40 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('legal.back')}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <h1 className="text-xl font-black tracking-wide text-zinc-100">{t('legal.modalTitle')}</h1>
        </div>

        <article className="text-sm text-zinc-300 leading-relaxed space-y-5 pb-16">
          <LegalSections />
        </article>
      </div>
    </main>
  );
};

export default PrivacyPage;
