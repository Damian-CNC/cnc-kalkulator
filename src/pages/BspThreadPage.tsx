import { useTranslation } from 'react-i18next';
import BspThreadCalculator from '@/components/BspThreadCalculator';
import PageLayout from '@/components/PageLayout';

const BspThreadPage = () => {
  const { t } = useTranslation('threadsCalc');
  return (
    <PageLayout title={t('bsp.title', { defaultValue: 'Gwinty Rurowe BSP (G)' })} backRoute="/gwinty" wideDesktop>
      <BspThreadCalculator />
    </PageLayout>
  );
};

export default BspThreadPage;
