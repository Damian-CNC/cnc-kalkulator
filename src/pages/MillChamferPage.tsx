import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import MillChamferCalculator from '@/components/MillChamferCalculator';

const MillChamferPage = () => {
  const { t } = useTranslation('chamfer');
  return (
    <PageLayout title={t('title')}>
      <MillChamferCalculator />
    </PageLayout>
  );
};

export default MillChamferPage;
