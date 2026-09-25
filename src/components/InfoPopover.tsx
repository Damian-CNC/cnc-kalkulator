import { useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Info, X } from 'lucide-react';

interface InfoPopoverProps {
  title: string;
  children: ReactNode;
}

/** Mała plakietka "i" — po dotknięciu pokazuje proste wyjaśnienie (dowolnej długości). */
const InfoPopover = ({ title, children }: InfoPopoverProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={title}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800/80 text-zinc-400 transition-colors hover:border-cyan-500/60 hover:text-cyan-400"
      >
        <Info className="h-3 w-3" />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 p-0 backdrop-blur-md sm:items-center sm:p-4"
            onClick={() => setOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-t-2xl border border-zinc-800 bg-zinc-950 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:pb-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-zinc-100">{title}</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Zamknij"
                  className="-m-1.5 rounded-lg p-1.5 text-zinc-500 hover:text-zinc-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-zinc-300">{children}</div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default InfoPopover;
