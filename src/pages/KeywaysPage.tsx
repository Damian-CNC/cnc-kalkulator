import PageLayout from '@/components/PageLayout';

const KeywaysPage = () => {
  return (
    <PageLayout title="Wpusty pryzmowe (DIN 6885)">
      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Dobór wpustu</h2>
        <p className="text-zinc-500 text-sm">
          Moduł w przygotowaniu — dobór przekroju b × h na podstawie średnicy wału.
        </p>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Głębokości rowka</h2>
        <p className="text-zinc-500 text-sm">
          Miejsce na wymiary t1 (wał), t2 (piasta) oraz wymiary kontrolne d+t2 / d−t1.
        </p>
      </div>
    </PageLayout>
  );
};

export default KeywaysPage;
