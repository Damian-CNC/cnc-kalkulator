import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/PageLayout';
import Iso2768Calculator from '@/components/Iso2768Calculator';

const Iso2768Page = () => {
  const { t } = useTranslation('iso2768');
  return (
    <PageLayout title={t('shortTitle')}>
      <div className="pb-32">
        <Iso2768Calculator />
      </div>
    </PageLayout>
  );
};

export default Iso2768Page;
