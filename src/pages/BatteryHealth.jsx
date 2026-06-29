import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { Thermometer, AlertTriangle, CheckCircle, Wrench, ShieldAlert, Battery } from 'lucide-react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', circle = false }) => (
  <div className="skeleton" style={{
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : borderRadius,
    marginBottom: '8px'
  }} />
);

const BatteryHealthSkeleton = () => (
  <div className="p-6 space-y-6 overflow-y-auto flex-1">
    <div>
      <Skeleton width="30%" height="24px" />
      <Skeleton width="45%" height="14px" className="mt-1" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-6 rounded-3xl border border-slate-800/60 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <Skeleton width="20%" height="14px" />
            <Skeleton width="15%" height="16px" borderRadius="10px" />
          </div>

          <div className="flex justify-center items-center py-4 relative">
            <div className="w-[180px] h-[100px] flex items-center justify-center overflow-hidden relative">
              <div className="w-[150px] h-[150px] rounded-full border-[16px] border-slate-800/50 absolute -bottom-[75px] skeleton animate-pulse" />
              <div className="absolute bottom-2 flex flex-col items-center">
                <Skeleton width="50px" height="24px" />
                <Skeleton width="70px" height="10px" className="mt-1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-slate-800/40 mt-2 text-center">
            <div className="flex flex-col items-center"><Skeleton width="60%" height="8px" /><Skeleton width="40%" height="12px" className="mt-1.5" /></div>
            <div className="flex flex-col items-center"><Skeleton width="60%" height="8px" /><Skeleton width="40%" height="12px" className="mt-1.5" /></div>
            <div className="flex flex-col items-center"><Skeleton width="60%" height="8px" /><Skeleton width="40%" height="12px" className="mt-1.5" /></div>
          </div>

          <div className="space-y-2 mt-4 mb-4">
            <div className="flex justify-between"><Skeleton width="25%" height="10px" /><Skeleton width="15%" height="10px" /></div>
            <div className="flex gap-1.5">
              {Array.from({ length: 8 }).map((_, j) => (
                <div key={j} className="flex-1 h-6 rounded-md skeleton" />
              ))}
            </div>
          </div>

          <Skeleton width="100%" height="32px" borderRadius="12px" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6">
        <div className="flex justify-between items-center"><Skeleton width="30%" height="18px" /><Skeleton width="15%" height="24px" /></div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-800/40 bg-slate-900/10 flex flex-col items-center"><Skeleton width="40%" height="10px" /><Skeleton width="60%" height="18px" className="mt-2" /></div>
          ))}
        </div>
      </div>
      <div className="glass-card p-6 rounded-2xl"><Skeleton width="40%" height="18px" /><Skeleton width="100%" height="180px" className="mt-4" /></div>
    </div>
  </div>
);

export default function BatteryHealth() {
  const { vehicles, setToast } = useOutletContext();
  const location = useLocation();
  const [selectedVehicle, setSelectedVehicle] = useState(location.state?.selectedVehicle || 'Select Vehicle');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Staggered gauge loading states
  const [animatedSoh, setAnimatedSoh] = useState({
    'EV-001': 0,
    'EV-002': 0,
    'EV-003': 0,
    'EV-004': 0
  });

  const [hasLoaded, setHasLoaded] = useState(false);
  const [ev3DrainOffset, setEv3DrainOffset] = useState(0);

  // Staggered fill animation on mount
  useEffect(() => {
    const vehiclesList = ['EV-001', 'EV-002', 'EV-003', 'EV-004'];
    vehiclesList.forEach((id, index) => {
      setTimeout(() => {
        const vehicle = vehicles.find(v => v.id === id);
        if (vehicle) {
          setAnimatedSoh(prev => ({
            ...prev,
            [id]: vehicle.healthScore
          }));
        }
      }, index * 300);
    });

    const loadTimer = setTimeout(() => {
      setHasLoaded(true);
    }, 1500);

    return () => clearTimeout(loadTimer);
  }, []);

  // Sync with dynamic telemetry changes
  useEffect(() => {
    if (!hasLoaded) return;
    vehicles.forEach(vehicle => {
      setAnimatedSoh(prev => ({
        ...prev,
        [vehicle.id]: vehicle.healthScore
      }));
    });
  }, [vehicles, hasLoaded]);

  // Slowly drain EV-003 SOH by 1% every 10 seconds (degredation simulation)
  useEffect(() => {
    if (!hasLoaded) return;
    const drainTimer = setInterval(() => {
      setEv3DrainOffset(prev => prev + 1);
    }, 10000);
    return () => clearInterval(drainTimer);
  }, [hasLoaded]);

  // Cell voltage data (8 cells per vehicle)
  const cellVoltages = {
    'EV-001': [3.92, 3.91, 3.89, 3.92, 3.90, 3.91, 3.88, 3.90],
    'EV-002': [3.68, 3.52, 3.65, 3.48, 3.66, 3.61, 3.55, 3.60],
    'EV-003': [3.28, 3.42, 3.12, 3.39, 3.55, 3.82, 3.68, 3.75], // edited to contain exactly 4 red cells (<3.5V)
    'EV-004': [4.02, 4.01, 3.99, 4.02, 4.00, 4.01, 3.98, 4.00],
  };

  const getVoltageColorClass = (volts) => {
    if (volts > 3.8) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (volts >= 3.5) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse';
  };

  const getGaugeColor = (soh) => {
    if (soh > 70) return '#00ff88';
    if (soh >= 40) return '#ffaa00';
    return '#ff4444';
  };

  const handleScheduleService = (vehicleId) => {
    setToast({ show: true, message: `Maintenance scheduled successfully for ${vehicleId}` });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4000);
  };

  // Hardcoded last 24h temperature data for line chart
  const tempHistoryData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    'EV-001': parseFloat((33.5 + Math.sin(i / 2) * 1.2).toFixed(1)),
    'EV-002': parseFloat((41.2 + Math.cos(i / 2) * 1.5).toFixed(1)),
    'EV-003': parseFloat((48.0 + Math.sin(i) * 2.1).toFixed(1)),
    'EV-004': parseFloat((29.1 + Math.sin(i / 3) * 0.8).toFixed(1)),
  }));

  // Automatically update the selector vehicle default when selectedVehicle is unselected
  const effectiveSelected = selectedVehicle === 'Select Vehicle' ? 'EV-001' : selectedVehicle;

  const [pageLoading, setPageLoading] = useState(true);
  const [pageOpacity, setPageOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      setTimeout(() => setPageOpacity(1), 50);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return pageLoading ? (
    <BatteryHealthSkeleton />
  ) : (
    <div className="p-6 space-y-6 overflow-y-auto animate-fade-in flex-1" style={{ opacity: pageOpacity, transition: 'opacity 0.5s ease' }}>
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Wrench className="w-5 h-5 text-emerald-400" />
          Battery Health & Diagnostic Analysis
        </h2>
        <p className="text-xs text-slate-400 mt-1">Deep-dive cell telemetry, pack capacity checks, and thermal runaway monitoring</p>
      </div>

      {/* 2X2 GRID OF UPGRADED SOH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((v) => {
          const isIsolated = v.status === 'ISOLATED';
          const rawSoh = animatedSoh[v.id] || 0;
          const displaySoh = v.id === 'EV-003' ? Math.max(0, rawSoh - ev3DrainOffset) : rawSoh;

          let badgeStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
          if (isIsolated) {
            badgeStyle = "bg-slate-500/10 text-slate-400 border border-slate-500/30";
          } else if (v.status === 'critical') {
            badgeStyle = "bg-red-500/10 text-red-400 border border-red-500/30 animate-pulse-subtle";
          } else if (v.status === 'warning') {
            badgeStyle = "bg-amber-500/10 text-amber-400 border border-amber-500/30";
          }

          const cells = cellVoltages[v.id] || [];

          return (
            <div key={v.id} className={`glass-card p-6 rounded-3xl border border-slate-800/60 relative flex flex-col justify-between transition-all duration-300 ${isIsolated ? 'opacity-40 grayscale bg-slate-950/20' : ''}`}>
              
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-slate-200">{v.id}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}>
                  {v.status}
                </span>
              </div>

              {/* Gauge Area */}
              <div className="flex justify-center items-center py-4 relative">
                <div className="relative flex items-center justify-center overflow-hidden" style={{ width: isMobile ? '150px' : '200px', height: isMobile ? '85px' : '115px' }}>
                  <RadialBarChart
                    width={isMobile ? 150 : 200}
                    height={isMobile ? 150 : 200}
                    innerRadius="72%"
                    outerRadius="100%"
                    data={[{ value: displaySoh, fill: getGaugeColor(displaySoh) }]}
                    startAngle={180}
                    endAngle={0}
                    className="absolute top-0 left-0"
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                  </RadialBarChart>
                  
                  {/* Gauge Center Info Overlay */}
                  <div className="absolute bottom-2 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl sm:text-2xl font-black text-white font-mono leading-none">
                      {isIsolated ? '0' : displaySoh}%
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider">
                      State of Health
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 text-center py-3 border-t border-b border-slate-800/40 mt-2">
                <div>
                  <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Est. Range</span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-200">{isIsolated ? '0' : `${v.estimatedRange} km`}</span>
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Pack Temp</span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-200">{isIsolated ? '—' : `${v.temp} °C`}</span>
                </div>
                <div>
                  <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Bus Voltage</span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-200">{v.voltage} V</span>
                </div>
              </div>

              {/* Cell Voltage Heatmap Mini Row */}
              <div className="space-y-2 mt-4 mb-5">
                <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Cell Balancing Heatmap</span>
                  <span>8 Pack Groups</span>
                </div>
                <div className="grid grid-cols-4 min-[420px]:grid-cols-8 gap-1">
                  {cells.map((val, idx) => {
                    let cellColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    if (isIsolated) {
                      cellColor = 'bg-slate-900/40 text-slate-500 border border-slate-800';
                    } else if (val < 3.5) {
                      cellColor = 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse-subtle';
                    } else if (val <= 3.8) {
                      cellColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                    }
                    return (
                      <div
                        key={idx}
                        title={`Cell #${idx + 1} — ${val}V`}
                        className={`flex-1 h-6 rounded-md flex items-center justify-center font-mono text-[9px] font-bold cursor-help transition-all hover:scale-105 ${cellColor}`}
                      >
                        {isIsolated ? '—' : val.toFixed(2)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service button */}
              <button
                onClick={() => handleScheduleService(v.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-wider ${
                  isIsolated || v.status === 'critical' || v.status === 'warning'
                    ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/40'
                }`}
                style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                Schedule Service
              </button>

            </div>
          );
        })}
      </div>

      {/* HEATMAP & CELL MONITOR BOTTOM DETAIL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cell Heatmap Column */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-emerald-400" />
                Cell Voltage Heatmap (Detail)
              </h3>
              <p className="text-xs text-slate-400 mt-1">Pack cell balancing profiles for active telemetry groups</p>
            </div>
            
            <select
              value={effectiveSelected}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-xs rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500/50"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} disabled={v.status === 'ISOLATED'}>
                  {v.id} {v.status === 'ISOLATED' ? '(Isolated)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cellVoltages[effectiveSelected]?.map((v, i) => (
              <div key={i} className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${getVoltageColorClass(v)}`}>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cell #{i + 1}</span>
                <span className="text-lg font-extrabold mt-1.5">{v.toFixed(2)}V</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center gap-3 text-xs text-slate-400">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p>Cell balancing is nominal under 0.15V delta. Cells read below 3.4V indicate heavy degradation or load anomalies.</p>
          </div>
        </div>

        {/* Temperature History Chart */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">24h Pack Temperature Trends</h3>
            <p className="text-xs text-slate-400 mt-1">Pack cooling control metrics</p>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#151c2c', borderColor: '#1f293d' }} />
                <Line type="monotone" dataKey="EV-001" stroke="#2dd4bf" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="EV-002" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="EV-003" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="EV-004" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
