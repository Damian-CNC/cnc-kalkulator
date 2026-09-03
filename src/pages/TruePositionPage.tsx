import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import TruePositionCalculator from '@/components/TruePositionCalculator';

const TruePositionPage = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('pages.truePosition')}>
      <TruePositionCalculator />
    </PageLayout>
  );
};

export default TruePositionPage;
