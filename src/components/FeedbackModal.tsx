import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bug, Lightbulb, Loader2, MessageSquarePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import useHaptics from '@/hooks/useHaptics';

const APP_VERSION = 'v2.6.0';

type FeedbackType = 'bug' | 'suggestion';

const FeedbackModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t, i18n } = useTranslation('app');
  const { triggerLight, triggerSuccess, triggerWarning } = useHaptics();
  const [type, setType] = useState<FeedbackType>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !loading && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, loading]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerLight();
    const trimmed = message.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-feedback', {
        body: {
          type,
          message: trimmed,
          userEmail: email.trim() || undefined,
          metadata: {
            appVersion: APP_VERSION,
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height} @${window.devicePixelRatio}x`,
            language: i18n.language,
            url: window.location.href,
          },
        },
      });
      if (error || (data as { error?: string } | null)?.error) {
        throw error ?? new Error('Function error');
      }
      triggerSuccess();
      toast.success(t('feedback.success'));
      setMessage('');
      setEmail('');
      setType('bug');
      onClose();
    } catch (err) {
      console.error('Feedback submit failed', err);
      triggerWarning();
      toast.error(t('feedback.error'));
    } finally {
      setLoading(false);
    }
  };

  const typeButton = (value: FeedbackType, Icon: typeof Bug, label: string) => {
    const active = type === value;
    return (
      <button
        key={value}
        type="button"
        onClick={() => {
          triggerLight();
          setType(value);
        }}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border text-sm font-bold uppercase tracking-wide transition-colors touch-manipulation ${
          active
            ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
            : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('feedback.title')}
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-lg font-black tracking-wide text-zinc-100">{t('feedback.title')}</h2>
              <p className="text-xs text-zinc-500">{t('feedback.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('feedback.close')}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
              {t('feedback.typeLabel')}
            </span>
            <div className="flex gap-2">
              {typeButton('bug', Bug, t('feedback.bug'))}
              {typeButton('suggestion', Lightbulb, t('feedback.suggestion'))}
            </div>
          </div>

          <div>
            <label
              htmlFor="feedback-message"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2"
            >
              {t('feedback.messageLabel')}
            </label>
            <textarea
              id="feedback-message"
              required
              rows={4}
              inputMode="text"
              maxLength={5000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('feedback.messagePlaceholder')}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors focus:border-cyan-500/60"
            />
          </div>

          <div>
            <label
              htmlFor="feedback-email"
              className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2"
            >
              {t('feedback.emailLabel')}
            </label>
            <input
              id="feedback-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-base text-zinc-100 outline-none transition-colors focus:border-cyan-500/60"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-sm font-bold uppercase tracking-wider text-cyan-400 transition-colors hover:bg-cyan-500/20 disabled:opacity-40 disabled:hover:bg-cyan-500/10 touch-manipulation"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t('feedback.submit')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
