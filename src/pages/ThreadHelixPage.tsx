import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import ThreadHelixCalculator from '@/components/ThreadHelixCalculator';

const ThreadHelixPage = () => {
  const { t } = useTranslation();
  return (
    <PageLayout title={t('pages.helixAngle')} wideDesktop>
      <ThreadHelixCalculator />
    </PageLayout>
  );
};

export default ThreadHelixPage;
