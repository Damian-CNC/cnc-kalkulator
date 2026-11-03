/**
 * Skeleton Screens (powidoki ładowania) dla CNC HUB.
 *
 * Wyświetlają wierną, animowaną sylwetkę interfejsu (nagłówek, siatkę kafelków,
 * formularze i karty wyników) podczas ładowania chunków i inicjalizacji aplikacji.
 * Eliminuje to czarny ekran i obracające się kółka ładowania.
 */

export const AppSkeleton = () => {
  return (
    <div
      className="min-h-screen bg-zinc-950 px-4 pb-safe overflow-x-hidden flex flex-col items-center select-none"
      aria-busy="true"
      aria-label="Ładowanie..."
    >
      {/* Nagłówek: idealnie dopasowany do układu 3-kolumnowego CNC HUB */}
      <header className="w-full pt-[calc(env(safe-area-inset-top,0px)+1.25rem)] pt-14 md:pt-4 pb-3 mb-6 max-w-4xl md:max-w-6xl grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
        <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/80 animate-shimmer" />

        <div className="flex justify-center items-center">
          <span
            className="text-lg md:text-xl font-black tracking-wider text-cyan-400 select-none animate-pulse"
            style={{
              textShadow: '0 0 20px rgba(6,182,212,0.4), 0 0 40px rgba(6,182,212,0.2)',
            }}
          >
            ⚙️ CNC HUB
          </span>
        </div>

        <div className="flex justify-end">
          <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/80 animate-shimmer" />
        </div>
      </header>

      {/* Pasek pomocniczy / onboarding banner skeleton */}
      <div className="w-full max-w-4xl md:max-w-[44.8rem] mb-6">
        <div className="h-12 w-full rounded-2xl border border-zinc-800/80 bg-zinc-900/60 animate-shimmer" />
      </div>

      {/* Siatka kafelków menu (8 kart w widoku mobilnym / 4-kolumnowym desktopie) */}
      <div className="w-full max-w-4xl md:max-w-[44.8rem] mb-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[1.05/1] rounded-2xl border border-zinc-800/80 bg-zinc-900/85 p-4 flex flex-col items-center justify-center gap-3 relative overflow-hidden animate-shimmer shadow-lg shadow-black/40"
            >
              {/* Sylwetka ikony */}
              <div className="w-14 h-14 rounded-2xl bg-zinc-800/70" />
              {/* Sylwetka tytułu */}
              <div className="w-3/4 h-3.5 rounded-full bg-zinc-800/90" />
              {/* Sylwetka podtytułu / normy */}
              <div className="w-1/2 h-2.5 rounded-full bg-zinc-800/40" />
            </div>
          ))}
        </div>
      </div>

      {/* Sylwetka stopki */}
      <div className="w-full max-w-md mx-auto mt-auto pt-6 pb-8 border-t border-zinc-800/60 flex items-center justify-center gap-3">
        <div className="w-20 h-7 rounded-xl bg-zinc-900/70 border border-zinc-800/60 animate-shimmer" />
        <div className="w-28 h-7 rounded-xl bg-zinc-900/70 border border-zinc-800/60 animate-shimmer" />
        <div className="w-24 h-7 rounded-xl bg-zinc-900/70 border border-zinc-800/60 animate-shimmer" />
      </div>
    </div>
  );
};

export const PageSkeleton = () => {
  return (
    <div
      className="min-h-screen bg-background text-zinc-100 px-4 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] pt-14 md:pt-3 lg:pt-1.5 pb-20 select-none flex flex-col"
      aria-busy="true"
      aria-label="Ładowanie modułu..."
    >
      {/* Nagłówek strony */}
      <header className="flex items-center gap-4 mb-4 sm:mb-6 md:mb-2 lg:mb-2.5 max-w-4xl md:max-w-6xl mx-auto w-full">
        <div className="w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/80 animate-shimmer" />
        <div className="w-48 h-6 rounded-full bg-zinc-800/80 animate-shimmer" />
        <div className="ml-auto w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 animate-shimmer" />
      </header>

      {/* Zawartość: Split-view z 2 kolumnami */}
      <main className="flex-1 w-full max-w-4xl md:max-w-6xl mx-auto space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[320px_1fr] lg:gap-6 lg:items-start">
        {/* Lewa kolumna: Formularze wejściowe */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-4 animate-shimmer">
          <div className="w-32 h-4 rounded-full bg-zinc-800/80" />
          <div className="space-y-3">
            <div className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800" />
            <div className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800" />
            <div className="w-full h-12 rounded-xl bg-zinc-900 border border-zinc-800" />
          </div>
        </div>

        {/* Prawa kolumna: Karty wyników i podgląd */}
        <div className="space-y-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="h-24 rounded-xl border border-emerald-900/30 bg-emerald-950/15 p-4 animate-shimmer">
              <div className="w-24 h-3 rounded-full bg-emerald-800/40 mb-2" />
              <div className="w-36 h-6 rounded-full bg-emerald-700/40" />
            </div>
            <div className="h-24 rounded-xl border border-cyan-900/30 bg-cyan-950/15 p-4 animate-shimmer">
              <div className="w-24 h-3 rounded-full bg-cyan-800/40 mb-2" />
              <div className="w-36 h-6 rounded-full bg-cyan-700/40" />
            </div>
          </div>

          <div className="h-56 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-4 flex items-center justify-center animate-shimmer">
            <div className="w-40 h-28 rounded-xl bg-zinc-800/40" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppSkeleton;
