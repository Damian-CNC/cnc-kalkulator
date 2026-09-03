import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import LinearHolesCalculator from '@/components/LinearHolesCalculator';

const LinearHolesPage = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('pages.linearHoles')} compactBottom>
      <LinearHolesCalculator />
    </PageLayout>
  );
};

export default LinearHolesPage;
