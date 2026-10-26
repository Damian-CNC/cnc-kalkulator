import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import HardnessConverter from '@/components/HardnessConverter';

const HardnessPage = () => {
  const { t } = useTranslation();
  return (
  <PageLayout title={t('pages.hardness')} wideDesktop>
    <HardnessConverter />
  </PageLayout>
);
};

export default HardnessPage;
