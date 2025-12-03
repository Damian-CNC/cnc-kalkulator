import { useState, useEffect, useCallback } from 'react';
import InputField from './InputField';
import ResultDisplay from './ResultDisplay';

const ParametersCalculator = () => {
  const [vc, setVc] = useState('');
  const [diameter, setDiameter] = useState('');
  const [fz, setFz] = useState('');
  const [teeth, setTeeth] = useState('');
  const [rpm, setRpm] = useState('');
  const [holeDia, setHoleDia] = useState('');

  const [rpmResult, setRpmResult] = useState<string | null>(null);
  const [feedResult, setFeedResult] = useState<string | null>(null);
  const [centerFeedResult, setCenterFeedResult] = useState<string | null>(null);

  const calculateRPM = useCallback(() => {
    const vcNum = parseFloat(vc);
    const dNum = parseFloat(diameter);

    if (vcNum && dNum) {
      const n = (vcNum * 1000) / (Math.PI * dNum);
      setRpm(n.toFixed(0));
      setRpmResult(`🌀 ${n.toFixed(0)} obr/min`);
      return n;
    }
    setRpmResult(null);
    return null;
  }, [vc, diameter]);

  const calculateFeed = useCallback((rpmValue: number | null) => {
    const fzNum = parseFloat(fz);
    const teethNum = parseFloat(teeth);
    const rpmNum = rpmValue || parseFloat(rpm);

    if (fzNum && teethNum && rpmNum) {
      const feed = fzNum * teethNum * rpmNum;
      setFeedResult(`🚀 ${feed.toFixed(1)} mm/min`);
      return feed;
    }
    setFeedResult(null);
    return null;
  }, [fz, teeth, rpm]);

  const calculateCenterFeed = useCallback((feedValue: number | null) => {
    const d1 = parseFloat(diameter);
    const d2 = parseFloat(holeDia);

    if (feedValue && d1 && d2 && d2 > d1) {
      const fc = (feedValue * (d2 - d1)) / d2;
      setCenterFeedResult(`🎯 ${fc.toFixed(1)} mm/min`);
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
    setRpm('');
    setHoleDia('');
    setRpmResult(null);
    setFeedResult(null);
    setCenterFeedResult(null);
  };

  return (
    <div className="glass-container animate-fade-in">
      <div className="flex flex-col gap-6">
        {/* Module 1: RPM */}
        <div className="glass-module animate-slide-in stagger-1">
          <h2 className="text-primary font-semibold text-lg mb-4 flex items-center gap-2">
            ⚡ Obroty
          </h2>
          <div className="flex flex-col gap-4">
            <InputField
              label="Prędkość skrawania Vc [m/min]"
              type="number"
              step="0.1"
              value={vc}
              onChange={(e) => setVc(e.target.value)}
              placeholder="np. 200"
            />
            <InputField
              label="Średnica narzędzia D [mm]"
              type="number"
              step="0.1"
              value={diameter}
              onChange={(e) => setDiameter(e.target.value)}
              placeholder="np. 10"
            />
          </div>
          <ResultDisplay>
            {rpmResult && <span className="text-primary">{rpmResult}</span>}
          </ResultDisplay>
        </div>

        {/* Module 2: Feed Rate */}
        <div className="glass-module animate-slide-in stagger-2">
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
              placeholder="np. 0.1"
            />
            <InputField
              label="Liczba zębów Z"
              type="number"
              value={teeth}
              onChange={(e) => setTeeth(e.target.value)}
              placeholder="np. 4"
            />
            <InputField
              label="Obroty n [obr/min]"
              type="number"
              value={rpm}
              readOnly
              className="opacity-70"
            />
          </div>
          <ResultDisplay>
            {feedResult && <span className="text-primary">{feedResult}</span>}
          </ResultDisplay>
        </div>

        {/* Module 3: Center Feed */}
        <div className="glass-module animate-slide-in stagger-3">
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
              placeholder="np. 20"
            />
          </div>
          <ResultDisplay>
            {centerFeedResult && <span className="text-primary">{centerFeedResult}</span>}
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
