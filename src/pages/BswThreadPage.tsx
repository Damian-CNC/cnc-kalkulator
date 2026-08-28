import { useTranslation } from 'react-i18next';
import WhitworthThreadCalculator from '@/components/WhitworthThreadCalculator';
import { bswThreads, bswSizes } from '@/data/bswThreadsData';
import PageLayout from '@/components/PageLayout';

const BswThreadPage = () => {
  const { t } = useTranslation('threadsCalc');
  return (
    <PageLayout title={t('whitworth.bsw.title')} backRoute="/gwinty">
      <WhitworthThreadCalculator
        threads={bswThreads}
        sizes={bswSizes}
        standardLabel={t('whitworth.bsw.footnote')}
        emptyMessage={t('whitworth.bsw.emptyMessage')}
      />
    </PageLayout>
  );
};

export default BswThreadPage;
