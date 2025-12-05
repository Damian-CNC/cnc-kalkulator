interface TabNavigationProps {
  activeTab: 'parameters' | 'weight' | 'cone' | 'hardness';
  onTabChange: (tab: 'parameters' | 'weight' | 'cone' | 'hardness') => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="w-full max-w-[520px] mx-auto mb-6 flex rounded-2xl p-2 backdrop-blur-xl border-2 border-primary/15"
         style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
      <button
        className={`nav-tab ${activeTab === 'parameters' ? 'active' : ''}`}
        onClick={() => onTabChange('parameters')}
      >
        🔧 Parametry
      </button>
      <button
        className={`nav-tab ${activeTab === 'weight' ? 'active' : ''}`}
        onClick={() => onTabChange('weight')}
      >
        ⚖️ Waga
      </button>
      <button
        className={`nav-tab ${activeTab === 'cone' ? 'active' : ''}`}
        onClick={() => onTabChange('cone')}
      >
        🔺 Stożek
      </button>
      <button
        className={`nav-tab ${activeTab === 'hardness' ? 'active' : ''}`}
        onClick={() => onTabChange('hardness')}
      >
        💎 Twardość
      </button>
    </div>
  );
};

export default TabNavigation;
