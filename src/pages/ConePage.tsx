import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import DrillConeCalculator from '@/components/DrillConeCalculator';

const ConePage = () => {
  const { t } = useTranslation();
  return (
  <PageLayout title={t('pages.cone')}>
    <DrillConeCalculator />
  </PageLayout>
);
};

export default ConePage;
