import { useTranslation } from 'react-i18next';
import WhitworthThreadCalculator from '@/components/WhitworthThreadCalculator';
import { bsfThreads, bsfSizes } from '@/data/bsfThreadsData';
import PageLayout from '@/components/PageLayout';

const BsfThreadPage = () => {
  const { t } = useTranslation('threadsCalc');
  return (
    <PageLayout title={t('whitworth.bsf.title')} backRoute="/gwinty">
      <WhitworthThreadCalculator
        threads={bsfThreads}
        sizes={bsfSizes}
        standardLabel={t('whitworth.bsf.footnote')}
        emptyMessage={t('whitworth.bsf.emptyMessage')}
      />
    </PageLayout>
  );
};

export default BsfThreadPage;
