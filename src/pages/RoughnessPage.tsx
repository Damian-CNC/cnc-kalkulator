import PageLayout from '@/components/PageLayout';

const RoughnessPage = () => {
  return (
    <PageLayout title="Chropowatość Ra / Rz">
      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Przelicznik Ra / Rz</h2>
        <p className="text-zinc-500 text-sm">
          Moduł w przygotowaniu — tutaj pojawi się przeliczanie Ra ↔ Rz oraz klasy chropowatości N1–N12.
        </p>
      </div>

      <div className="glass-module">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-4">Dobór posuwu</h2>
        <p className="text-zinc-500 text-sm">
          Miejsce na kalkulator posuwu na podstawie promienia naroża i wymaganej chropowatości.
        </p>
      </div>
    </PageLayout>
  );
};

export default RoughnessPage;
