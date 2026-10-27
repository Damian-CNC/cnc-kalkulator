import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import PcdMeasureCalculator from '@/components/PcdMeasureCalculator';

const PcdMeasurePage = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('pages.pcdMeasure')} wideDesktop>
      <PcdMeasureCalculator />
    </PageLayout>
  );
};

export default PcdMeasurePage;
