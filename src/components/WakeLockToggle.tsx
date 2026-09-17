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
      className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all active:scale-95 ${
        active
          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
          : 'border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-zinc-200'
      } ${className}`}
    >
      {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
    </button>
  );
};

export default memo(WakeLockToggle);
