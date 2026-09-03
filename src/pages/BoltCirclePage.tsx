import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import BoltCircleCalculator from '@/components/BoltCircleCalculator';

const BoltCirclePage = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('pages.pcd')} compactBottom>
      <BoltCircleCalculator />
    </PageLayout>
  );
};

export default BoltCirclePage;
