import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Compass, HelpCircle } from 'lucide-react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', circle = false }) => (
  <div className="skeleton" style={{
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : borderRadius,
    marginBottom: '8px'
  }} />
);

const RangePredictorSkeleton = () => (
  <div className="p-6 space-y-6 overflow-y-auto flex-1">
    <div>
      <Skeleton width="30%" height="24px" />
      <Skeleton width="50%" height="14px" className="mt-1" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6">
        <Skeleton width="40%" height="18px" className="mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between"><Skeleton width="30%" height="12px" /><Skeleton width="15%" height="12px" /></div>
            <Skeleton width="100%" height="14px" borderRadius="10px" />
          </div>
        ))}
      </div>

      <div className="glass-card p-6 rounded-2xl flex flex-col items-center justify-center">
        <Skeleton width="180px" height="180px" circle={true} className="animate-pulse" />
        <Skeleton width="50%" height="14px" className="mt-4" />
        <Skeleton width="70%" height="10px" className="mt-2" />
      </div>
    </div>

    <div className="glass-card p-6 rounded-2xl">
      <Skeleton width="20%" height="18px" className="mb-4" />
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-4 pb-2 border-b border-slate-800/40">
          {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} width="60%" height="12px" />)}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-4 gap-4 py-1">
            {Array.from({ length: 4 }).map((_, j) => <Skeleton key={j} width="80%" height="10px" />)}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function RangePredictor() {
  const { vehicles, setToast } = useOutletContext();
  
  // Slider states with defaults
  const [soc, setSoc] = useState(88);
  const [temp, setTemp] = useState(34);
  const [weight, setWeight] = useState(120);
  const [mode, setMode] = useState('Normal');
  const [predictedRange, setPredictedRange] = useState(0);
  const [confidence, setConfidence] = useState(95);

  const [pageLoading, setPageLoading] = useState(true);
  const [pageOpacity, setPageOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      setTimeout(() => setPageOpacity(1), 50);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const calculateRange = (socVal, tempVal, weightVal, modeVal, sohBase = 100) => {
    // Temperature factor
    const tempFactor = tempVal < 0 ? 0.6 : tempVal < 15 ? 0.8 : tempVal > 40 ? 0.85 : 1.0;

    // Load factor
    const loadFactor = 1 - (weightVal / 500) * 0.25;

    // Drive mode factor
    const modeFactor = modeVal === 'Eco' ? 1.15 : modeVal === 'Normal' ? 1.0 : 0.82;

    // Final range calculation
    const baseRange = (socVal / 100) * 400 * tempFactor * loadFactor * modeFactor;
    return Math.round(baseRange * (sohBase / 100));
  };

  useEffect(() => {
    const range = calculateRange(soc, temp, weight, mode, 100);
    setPredictedRange(range);

    // Confidence decreases with extreme values
    let conf = 98 - (Math.abs(temp - 25) * 0.4) - ((weight / 500) * 8) - (mode === 'Sport' ? 4 : 0);
    setConfidence(Math.round(Math.max(60, Math.min(100, conf))));
  }, [soc, temp, weight, mode]);

  // Smooth number transition count up/down animation
  const [displayedRange, setDisplayedRange] = useState(0);
  useEffect(() => {
    let start = displayedRange;
    const end = predictedRange;
    if (start === end) return;

    const duration = 250; // ms
    const startTime = performance.now();
    let animationFrameId;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentVal = Math.round(start + (end - start) * progress);
      setDisplayedRange(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [predictedRange]);

  const handleReset = () => {
    setSoc(88);
    setTemp(34);
    setWeight(120);
    setMode('Normal');
  };

  const handleApplyToFleet = () => {
    if (setToast) {
      setToast({ show: true, message: "Simulation parameters applied to all fleet telemetry forecasts." });
      setTimeout(() => setToast({ show: false, message: "" }), 4000);
    }
  };

  // Dynamic explanation text based on inputs
  const getExplanation = () => {
    if (mode === 'Sport') {
      return "Sport mode increases torque response, reducing efficiency by 18%";
    }
    if (temp < 0) {
      return "Sub-zero temperature reduces battery chemistry activity by 40%";
    }
    if (temp < 15) {
      return "Cold temperature reduces battery chemistry efficiency by 20%";
    }
    if (temp > 40) {
      return "High temperature requires active thermal cooling, reducing range by 15%";
    }
    if (weight > 300) {
      return `High load weight (${weight} kg) increases rolling resistance and consumption`;
    }
    if (mode === 'Eco') {
      return "Eco mode optimizes throttle response, extending range by 15%";
    }
    return "Operating under optimal driving and climate conditions";
  };

  // Color coding for range output
  let rangeColor = 'text-emerald-400';
  let glowClass = 'glow-green';
  if (predictedRange < 150) {
    rangeColor = 'text-red-400';
    glowClass = 'glow-red';
  } else if (predictedRange <= 300) {
    rangeColor = 'text-amber-400';
    glowClass = 'glow-yellow';
  }

  return pageLoading ? (
    <RangePredictorSkeleton />
  ) : (
    <div className="p-6 space-y-6 overflow-y-auto animate-fade-in flex-1" style={{ opacity: pageOpacity, transition: 'opacity 0.5s ease' }}>
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-400" />
          AI Range Predictor Model
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Simulate driving parameters to predict remaining battery mileage based on payload weight, climate conditions, and drive profiles
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders Input Form */}
        <div className="lg:col-span-1 glass-card p-6 rounded-2xl space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Simulation Parameters</h3>

            {/* SOC Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Battery SoC (%)</span>
                <span className="text-emerald-400 font-bold font-mono">{soc}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={soc}
                onChange={(e) => setSoc(parseInt(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-900 h-2 rounded-lg cursor-pointer appearance-none"
              />
            </div>

            {/* Temperature Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Outside Temperature (°C)</span>
                <span className="text-amber-400 font-bold font-mono">{temp}°C</span>
              </div>
              <input
                type="range"
                min="-10"
                max="50"
                value={temp}
                onChange={(e) => setTemp(parseInt(e.target.value))}
                className="w-full accent-amber-500 bg-slate-900 h-2 rounded-lg cursor-pointer appearance-none"
              />
            </div>

            {/* Load weight Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">Payload Load Weight (kg)</span>
                <span className="text-blue-400 font-bold font-mono">{weight} kg</span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value))}
                className="w-full accent-blue-500 bg-slate-900 h-2 rounded-lg cursor-pointer appearance-none"
              />
            </div>

            {/* Drive Mode Dropdown Selector */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400 font-medium block">Drive Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="Eco">Eco</option>
                <option value="Normal">Normal</option>
                <option value="Sport">Sport</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/40">
            <button
              onClick={handleReset}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700/40 transition-colors"
            >
              Reset Defaults
            </button>
            <button
              onClick={handleApplyToFleet}
              className="py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Apply to Fleet
            </button>
          </div>
        </div>

        {/* Prediction Outputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Predictor Display */}
          <div className={`glass-card p-8 rounded-2xl flex flex-col justify-center items-center text-center relative overflow-hidden transition-all duration-300 ${glowClass}`}>
            <span className="text-[10px] uppercase font-mono font-bold px-3 py-1 bg-slate-950/40 text-slate-400 rounded-full border border-slate-800/60 tracking-wider">
              Predicted Range Output
            </span>
            
            <h3 className={`text-7xl font-black mt-6 tracking-tighter transition-colors duration-300 ${rangeColor}`}>
              {displayedRange} <span className="text-2xl text-slate-400 font-medium tracking-normal">km</span>
            </h3>

            {/* Confidence metric */}
            <div className="w-full max-w-sm mt-6 space-y-2">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                <span>Model Confidence</span>
                <span className="text-slate-300">{confidence}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/60">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

            {/* Dynamic Explanation Text */}
            <p className="text-xs text-slate-400 mt-6 font-medium bg-slate-950/30 border border-slate-900/60 px-4 py-2 rounded-xl">
              {getExplanation()}
            </p>
          </div>

          {/* Comparative fleet ranges based on active live state */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Active Fleet Range Side-by-Side</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[9px] tracking-wider">
                    <th className="py-3 font-semibold">Vehicle</th>
                    <th className="py-3 font-semibold">Live SOH</th>
                    <th className="py-3 font-semibold">Live Temp</th>
                    <th className="py-3 font-semibold">Predicted Range</th>
                    <th className="py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => {
                    const isIsolated = v.status === 'ISOLATED';
                    const range = isIsolated ? 0 : calculateRange(soc, temp, weight, mode, v.healthScore);
                    
                    let statusText = "Optimal";
                    let statusBadge = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
                    if (isIsolated) {
                      statusText = "Isolated";
                      statusBadge = "bg-slate-500/10 text-slate-400 border border-slate-500/30";
                    } else if (range < 150) {
                      statusText = "Critical Range";
                      statusBadge = "bg-red-500/10 text-red-400 border border-red-500/30";
                    } else if (range <= 300) {
                      statusText = "Thermal Advisory";
                      statusBadge = "bg-amber-500/10 text-amber-400 border border-amber-500/30";
                    }

                    return (
                      <tr key={v.id} className={`border-b border-slate-850 text-slate-300 transition-colors hover:bg-slate-800/10 ${isIsolated ? 'opacity-40' : ''}`}>
                        <td className="py-3.5 font-bold text-white">{v.id}</td>
                        <td className="py-3.5 font-mono">{isIsolated ? '—' : `${v.healthScore}%`}</td>
                        <td className="py-3.5 font-mono">{isIsolated ? '—' : `${v.temp}°C`}</td>
                        <td className="py-3.5 font-mono font-bold text-slate-200">{isIsolated ? '0' : range} km</td>
                        <td className="py-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${statusBadge}`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-slate-500 mt-4 text-center italic">
              Predictions generated by Edge AI model deployed on vehicle ECU
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
