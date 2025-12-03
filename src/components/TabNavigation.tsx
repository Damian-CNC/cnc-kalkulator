interface TabNavigationProps {
  activeTab: 'parameters' | 'weight';
  onTabChange: (tab: 'parameters' | 'weight') => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  return (
    <div className="w-full max-w-[460px] mx-auto mb-6 flex rounded-2xl p-2 backdrop-blur-xl border-2 border-primary/15"
         style={{ background: 'rgba(255, 255, 255, 0.08)' }}>
      <button
        className={`nav-tab ${activeTab === 'parameters' ? 'active' : ''}`}
        onClick={() => onTabChange('parameters')}
      >
        🔧 Parametry skrawania
      </button>
      <button
        className={`nav-tab ${activeTab === 'weight' ? 'active' : ''}`}
        onClick={() => onTabChange('weight')}
      >
        ⚖️ Kalkulator wagi
      </button>
    </div>
  );
};

export default TabNavigation;
