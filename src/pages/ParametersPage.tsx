import { useTranslation } from 'react-i18next';
import ParametersCalculator from '@/components/ParametersCalculator';
import ClearFab from '@/components/ClearFab';
import PageLayout from '@/components/PageLayout';

const ParametersPage = () => {
  const { t } = useTranslation();
  const handleReset = () => {
    window.dispatchEvent(new CustomEvent('parameters-calculator-clear'));
  };

  return (
    <PageLayout title={t('pages.parameters')}>
      <ParametersCalculator />
      <ClearFab onClear={handleReset} label={t('common.clearAll')} />
    </PageLayout>
  );
};

export default ParametersPage;
