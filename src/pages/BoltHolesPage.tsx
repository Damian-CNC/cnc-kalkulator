import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import BoltHolesCalculator from '@/components/BoltHolesCalculator';

const BoltHolesPage = () => {
  const { t } = useTranslation('tools');
  return (
    <PageLayout title={t('holes.title')}>
      <BoltHolesCalculator />
    </PageLayout>
  );
};

export default BoltHolesPage;
