import WhitworthThreadCalculator from '@/components/WhitworthThreadCalculator';
import { bsfThreads, bsfSizes } from '@/data/bsfThreadsData';
import PageLayout from '@/components/PageLayout';

const BsfThreadPage = () => (
  <PageLayout title="Gwinty BSF (British Fine)" backRoute="/gwinty">
    <WhitworthThreadCalculator
      threads={bsfThreads}
      sizes={bsfSizes}
      standardLabel="Tolerancje wg BS 84 · Profil Whitworth 55°"
      emptyMessage="Wybierz rozmiar gwintu BSF z listy powyżej."
    />
  </PageLayout>
);

export default BsfThreadPage;
