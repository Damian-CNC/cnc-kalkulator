import { useTranslation } from 'react-i18next';
import { Check, Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supportedLanguages } from '@/i18n';

const LanguageSwitcher = ({ className = '' }: { className?: string }) => {
  const { i18n } = useTranslation();
  const current =
    supportedLanguages.find((l) => i18n.resolvedLanguage?.startsWith(l.code)) ??
    supportedLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Language"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md text-zinc-300 text-sm font-semibold tracking-wide transition-colors hover:text-cyan-400 hover:border-cyan-500/40 active:scale-95 ${className}`}
        >
          <Languages className="w-4 h-4 text-cyan-400" />
          <span aria-hidden>{current.flag}</span>
          <span>{current.label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[10rem] rounded-xl border-zinc-800 bg-zinc-900/95 backdrop-blur-xl text-zinc-200"
      >
        {supportedLanguages.map((lng) => (
          <DropdownMenuItem
            key={lng.code}
            onSelect={() => i18n.changeLanguage(lng.code)}
            className="gap-2 cursor-pointer focus:bg-zinc-800 focus:text-cyan-400"
          >
            <span aria-hidden>{lng.flag}</span>
            <span className="flex-1">{lng.name}</span>
            {current.code === lng.code && <Check className="w-4 h-4 text-cyan-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
