import { useTranslation } from 'react-i18next';
import { Check, Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supportedLanguages } from '@/i18n';

type Props = {
  className?: string;
  btnClass?: string;
  txtClass?: string;
  iconClass?: string;
};

const LanguageSwitcher = ({
  className = '',
  btnClass = '',
  txtClass = '',
  iconClass = '',
}: Props) => {
  const { i18n } = useTranslation();
  const current =
    supportedLanguages.find((l) => i18n.resolvedLanguage?.startsWith(l.code)) ??
    supportedLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Language"
          className={`${btnClass} ${txtClass} ${className}`}
        >
          <Languages className={iconClass || 'text-cyan-400 w-3.5 h-3.5 shrink-0'} />
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
