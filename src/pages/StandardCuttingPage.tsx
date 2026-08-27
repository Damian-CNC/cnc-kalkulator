import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import StandardCuttingCalculator from '@/components/StandardCuttingCalculator';

const StandardCuttingPage = () => {
  const { t } = useTranslation();
  return (
  <PageLayout title={t('pages.stdCutting')}>
    <StandardCuttingCalculator />
  </PageLayout>
);
};

export default StandardCuttingPage;
