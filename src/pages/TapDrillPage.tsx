import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import TapDrillCalculator from '@/components/TapDrillCalculator';

const TapDrillPage = () => {
  const { t } = useTranslation('tools');
  return (
    <PageLayout title={t('tapDrill.title')}>
      <TapDrillCalculator />
    </PageLayout>
  );
};

export default TapDrillPage;
