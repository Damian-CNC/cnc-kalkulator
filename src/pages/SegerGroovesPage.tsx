import PageLayout from '@/components/PageLayout';

const SegerGroovesPage = () => {
  return (
    <PageLayout title="Rowki Segera (DIN 471 / 472)">
      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Wybór normy</h2>
        <p className="text-zinc-500 text-sm">
          Moduł w przygotowaniu — DIN 471 (wałek) oraz DIN 472 (otwór).
        </p>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Wymiary rowka</h2>
        <p className="text-zinc-500 text-sm">
          Miejsce na tabelę wymiarów: średnica rowka (d2 / d3), szerokość (m), głębokość (t).
        </p>
      </div>
    </PageLayout>
  );
};

export default SegerGroovesPage;
