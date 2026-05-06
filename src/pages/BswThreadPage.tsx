import WhitworthThreadCalculator from '@/components/WhitworthThreadCalculator';
import { bswThreads, bswSizes } from '@/data/bswThreadsData';
import PageLayout from '@/components/PageLayout';

const BswThreadPage = () => (
  <PageLayout title="Gwinty BSW (Whitworth)" backRoute="/gwinty">
    <WhitworthThreadCalculator
      threads={bswThreads}
      sizes={bswSizes}
      standardLabel="Tolerancje wg BS 84 · Profil Whitworth 55°"
      emptyMessage="Wybierz rozmiar gwintu BSW z listy powyżej."
    />
  </PageLayout>
);

export default BswThreadPage;
