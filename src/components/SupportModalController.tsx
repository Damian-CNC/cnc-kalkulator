import SupportModal from '@/components/SupportModal';
import { useSupportPrompt } from '@/hooks/useSupportPrompt';

/** Controls showing the Buy Me a Coffee support modal (5s after onboarding, recurring every 30 days). */
const SupportModalController = () => {
  const { isOpen, closeModal, handleSupportClick } = useSupportPrompt();

  return (
    <SupportModal
      open={isOpen}
      onClose={closeModal}
      onSupportClick={handleSupportClick}
    />
  );
};

export default SupportModalController;
