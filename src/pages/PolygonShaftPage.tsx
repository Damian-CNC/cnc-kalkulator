import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import PolygonShaftCalculator from '@/components/PolygonShaftCalculator';

const PolygonShaftPage = () => {
  const { t } = useTranslation();
  return (
  <PageLayout title={t('pages.polygon')}>
    <PolygonShaftCalculator />
  </PageLayout>
);
};

export default PolygonShaftPage;
