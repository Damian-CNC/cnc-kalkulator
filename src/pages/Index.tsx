import { useState } from 'react';
import TabNavigation from '@/components/TabNavigation';
import ParametersCalculator from '@/components/ParametersCalculator';
import WeightCalculator from '@/components/WeightCalculator';
import DrillConeCalculator from '@/components/DrillConeCalculator';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'parameters' | 'weight' | 'cone'>('parameters');

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      {/* Header */}
      <h1 className="text-4xl md:text-5xl font-black tracking-wider mb-6 gradient-text select-none text-center">
        Kalkulator CNC
      </h1>

      {/* Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <main className="w-full max-w-[460px] mx-auto">
        {activeTab === 'parameters' && <ParametersCalculator />}
        {activeTab === 'weight' && <WeightCalculator />}
        {activeTab === 'cone' && <DrillConeCalculator />}
      </main>

      {/* Footer */}
      <footer className="text-center mt-8 text-muted-foreground text-sm">
        Copyright © 2025 Damian Drewniak | Parametry skrawania & Kalkulator wagi
      </footer>
    </div>
  );
};

export default Index;
