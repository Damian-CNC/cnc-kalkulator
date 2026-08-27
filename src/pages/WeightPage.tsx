import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import WeightCalculator from '@/components/WeightCalculator';

const WeightPage = () => {
  const { t } = useTranslation();
  return (
  <PageLayout title={t('pages.weight')}>
    <WeightCalculator />
  </PageLayout>
);
};

export default WeightPage;
