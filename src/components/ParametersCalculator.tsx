import { useState, useEffect, useCallback } from 'react';
import InputField from './InputField';
import ResultDisplay from './ResultDisplay';

const ParametersCalculator = () => {
  const [vc, setVc] = useState('');
  const [diameter, setDiameter] = useState('');
  const [fz, setFz] = useState('');
  const [teeth, setTeeth] = useState('');
  const [holeDia, setHoleDia] = useState('');

  const [rpmResult, setRpmResult] = useState<number | null>(null);
  const [feedResult, setFeedResult] = useState<number | null>(null);
  const [centerFeedResult, setCenterFeedResult] = useState<number | null>(null);

  const calculateRPM = useCallback(() => {
    const vcNum = parseFloat(vc);
    const dNum = parseFloat(diameter);

    if (vcNum && dNum) {
      const n = (vcNum * 1000) / (Math.PI * dNum);
      setRpmResult(n);
      return n;
    }
    setRpmResult(null);
    return null;
  }, [vc, diameter]);

  const calculateFeed = useCallback((rpmValue: number | null) => {
    const fzNum = parseFloat(fz);
    const teethNum = parseFloat(teeth);

    if (fzNum && teethNum && rpmValue) {
      const feed = fzNum * teethNum * rpmValue;
      setFeedResult(feed);
      return feed;
    }
    setFeedResult(null);
    return null;
  }, [fz, teeth]);

  const calculateCenterFeed = useCallback((feedValue: number | null) => {
    const d1 = parseFloat(diameter);
    const d2 = parseFloat(holeDia);

    if (feedValue && d1 && d2 && d2 > d1) {
      const fc = (feedValue * (d2 - d1)) / d2;
      setCenterFeedResult(fc);
    } else {
      setCenterFeedResult(null);
    }
  }, [diameter, holeDia]);

  useEffect(() => {
    const rpmValue = calculateRPM();
    const feedValue = calculateFeed(rpmValue);
    calculateCenterFeed(feedValue);
  }, [calculateRPM, calculateFeed, calculateCenterFeed]);

  const handleClear = () => {
    setVc('');
    setDiameter('');
    setFz('');
    setTeeth('');
    setHoleDia('');
    setRpmResult(null);
    setFeedResult(null);
    setCenterFeedResult(null);
  };

  return (
    <div className="glass-container">
      <div className="flex flex-col gap-6">
        {/* Module 1: RPM */}
        <div className="glass-module">
          <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
            🌀 Obroty
          </h2>
          <div className="flex flex-col gap-4">
            <InputField
              label="Prędkość skrawania Vc [m/min]"
              type="number"
              step="0.1"
              value={vc}
              onChange={(e) => setVc(e.target.value)}
            />
            <InputField
              label="Średnica narzędzia D [mm]"
              type="number"
              step="0.1"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
            />
          </div>
          <ResultDisplay>
            {rpmResult && <span className="text-primary">🌀 {rpmResult.toFixed(0)} obr/min</span>}
          </ResultDisplay>
        </div>

        {/* Module 2: Feed Rate */}
        <div className="glass-module">
          <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
            🚀 Posuw minutowy
          </h2>
          <div className="flex flex-col gap-4">
            <InputField
              label="Posuw na ząb fz [mm/ząb]"
              type="number"
              step="0.01"
              value={fz}
              onChange={(e) => setFz(e.target.value)}
            />
            <InputField
              label="Liczba zębów Z"
              type="number"
              value={teeth}
              onChange={(e) => setTeeth(e.target.value)}
            />
          </div>
          <ResultDisplay>
            {(rpmResult || feedResult) && (
              <div className="flex flex-col items-center gap-1">
                {rpmResult && <span className="text-primary">🌀 {rpmResult.toFixed(0)} obr/min</span>}
                {feedResult && <span className="text-primary">🚀 {feedResult.toFixed(1)} mm/min</span>}
              </div>
            )}
          </ResultDisplay>
        </div>

        {/* Module 3: Center Feed */}
        <div className="glass-module">
          <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
            🎯 Posuw centralny
          </h2>
          <div className="flex flex-col gap-4">
            <InputField
              label="Średnica narzędzia D1 [mm]"
              type="number"
              step="0.1"
              value={diameter}
              readOnly
              className="opacity-70"
            />
            <InputField
              label="Średnica gwintu D2 [mm]"
              type="number"
              step="0.1"
              value={holeDia}
              onChange={(e) => setHoleDia(e.target.value)}
            />
          </div>
          <ResultDisplay>
            {centerFeedResult && <span className="text-primary">🎯 {centerFeedResult.toFixed(1)} mm/min</span>}
          </ResultDisplay>
        </div>

        <button onClick={handleClear} className="clear-btn mt-2">
          Wyczyść
        </button>
      </div>
    </div>
  );
};

export default ParametersCalculator;
