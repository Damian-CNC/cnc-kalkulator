import PageLayout from '@/components/PageLayout';

const ORingGroovesPage = () => {
  return (
    <PageLayout title="Rowki O-ring (ISO 3601)">
      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Parametry uszczelnienia</h2>
        <p className="text-zinc-500 text-sm">
          Moduł w przygotowaniu — dobór rowka wg średnicy przekroju sznura (d2).
        </p>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Wymiary rowka</h2>
        <p className="text-zinc-500 text-sm">
          Miejsce na szerokość (b), głębokość (t), promienie naroży oraz stopień ściśnięcia.
        </p>
      </div>
    </PageLayout>
  );
};

export default ORingGroovesPage;
