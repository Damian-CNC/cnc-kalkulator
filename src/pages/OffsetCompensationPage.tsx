import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import OffsetCompensationCalculator from '@/components/OffsetCompensationCalculator';

const OffsetCompensationPage = () => {
  const { t } = useTranslation('tools');
  return (
    <PageLayout title={t('comp.title')}>
      <OffsetCompensationCalculator />
    </PageLayout>
  );
};

export default OffsetCompensationPage;
