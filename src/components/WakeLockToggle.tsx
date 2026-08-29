import { memo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import useWakeLock from '@/hooks/useWakeLock';

const WakeLockToggle = ({ className = '' }: { className?: string }) => {
  const { t } = useTranslation();
  const { supported, active, toggle } = useWakeLock();

  if (!supported) return null;

  const handleClick = async () => {
    const ok = await toggle();
    toast(ok ? t('common.wakeLockOn') : t('common.wakeLockOff'));
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={t('common.wakeLock')}
      title={t('common.wakeLock')}
      className={`p-2 rounded-xl border transition-colors active:scale-95 ${
        active
          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.25)]'
          : 'border-zinc-800 bg-zinc-900/70 text-zinc-500 hover:text-zinc-300'
      } ${className}`}
    >
      {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  );
};

export default memo(WakeLockToggle);
