import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import TrigCalculator from '@/components/TrigCalculator';

const TrigPage = () => {
  const { t } = useTranslation('tools');
  return (
    <PageLayout title={t('trig.title')}>
      <TrigCalculator />
    </PageLayout>
  );
};

export default TrigPage;
