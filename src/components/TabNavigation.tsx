import { useTranslation } from 'react-i18next';

interface TabNavigationProps {
  activeTab: 'parameters' | 'weight' | 'cone' | 'hardness';
  onTabChange: (tab: 'parameters' | 'weight' | 'cone' | 'hardness') => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const { t } = useTranslation();

  return (
    <div className="w-full max-w-[520px] mx-auto mb-6 flex rounded-2xl p-2 backdrop-blur-xl border-2 border-primary/15"
         style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
      <button
        className={`nav-tab ${activeTab === 'parameters' ? 'active' : ''}`}
        onClick={() => onTabChange('parameters')}
      >
        🔧 {t('nav.parameters', { defaultValue: 'Parametry' })}
      </button>
      <button
        className={`nav-tab ${activeTab === 'weight' ? 'active' : ''}`}
        onClick={() => onTabChange('weight')}
      >
        ⚖️ {t('nav.weight', { defaultValue: 'Waga' })}
      </button>
      <button
        className={`nav-tab ${activeTab === 'cone' ? 'active' : ''}`}
        onClick={() => onTabChange('cone')}
      >
        🔺 {t('nav.cone', { defaultValue: 'Stożek' })}
      </button>
      <button
        className={`nav-tab ${activeTab === 'hardness' ? 'active' : ''}`}
        onClick={() => onTabChange('hardness')}
      >
        💎 {t('nav.hardness', { defaultValue: 'Twardość' })}
      </button>
    </div>
  );
};

export default TabNavigation;
