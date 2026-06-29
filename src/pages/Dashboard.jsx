import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from 'recharts';
import {
  Activity, AlertOctagon, AlertTriangle, Battery, BatteryCharging, Clock,
  Compass, RefreshCw, Sliders, Thermometer, Zap, ShieldAlert, Cpu, Wrench
} from 'lucide-react';
import {
  degradationData,
  chargeCycleData
} from '../data/mockData';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', circle = false }) => (
  <div className="skeleton" style={{
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : borderRadius,
    marginBottom: '8px'
  }} />
);

const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 overflow-y-auto flex-1">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="glass-card p-5 rounded-2xl border border-slate-800/40 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <Skeleton width="65%" height="12px" />
              <Skeleton width="80%" height="24px" />
            </div>
            <Skeleton width="40px" height="40px" borderRadius="12px" />
          </div>
          <div className="mt-4">
            <Skeleton width="50%" height="12px" />
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800/40">
          <div className="flex justify-between items-center mb-6">
            <Skeleton width="30%" height="18px" />
            <Skeleton width="15%" height="18px" />
          </div>
          <Skeleton width="100%" height="320px" />
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800/40 space-y-4">
          <Skeleton width="20%" height="18px" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-800/40 bg-slate-900/10">
                <div className="flex justify-between items-center mb-3">
                  <Skeleton width="40%" height="14px" />
                  <Skeleton width="30%" height="14px" />
                </div>
                <Skeleton width="80%" height="10px" />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Skeleton width="80%" height="12px" />
                  <Skeleton width="80%" height="12px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800/40 h-[480px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800/40 pb-2 mb-4">
              <Skeleton width="40%" height="16px" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-800/40 bg-slate-900/10 flex items-start gap-3">
                  <Skeleton width="16px" height="16px" circle={true} />
                  <div className="flex-1">
                    <Skeleton width="70%" height="10px" />
                    <Skeleton width="90%" height="10px" />
                  </div>
                  <Skeleton width="30px" height="12px" borderRadius="10px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Recommendations Skeleton */}
    <div className="glass-card p-6 rounded-2xl border border-slate-800/40 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton width="250px" height="18px" />
          <Skeleton width="200px" height="12px" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-800/40 bg-slate-900/10 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton width="60px" height="16px" />
              <Skeleton width="24px" height="24px" borderRadius="8px" />
            </div>
            <Skeleton width="90%" height="12px" />
            <Skeleton width="120px" height="16px" />
            <Skeleton width="100%" height="8px" />
            <Skeleton width="70%" height="12px" />
            <Skeleton width="50%" height="16px" />
            <div className="flex gap-2 pt-2">
              <Skeleton width="50%" height="32px" borderRadius="8px" />
              <Skeleton width="50%" height="32px" borderRadius="8px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const getAlertEdgeLabel = (alert) => {
  const msg = (alert.message || '').toLowerCase();
  const type = (alert.type || '').toLowerCase();

  if (msg.includes('auto-isolated')) {
    return 'Auto-response by Edge AI — Safety Protocol';
  }
  if (msg.includes('thermal runaway') || type === 'thermal') {
    return 'Detected by Edge AI — Thermal Anomaly Model';
  }
  if (msg.includes('voltage drop') || type === 'voltage') {
    return 'Detected by Edge AI — Isolation Forest';
  }
  if (msg.includes('charging anomaly') || type === 'charging') {
    return 'Detected by Edge AI — Charge Pattern Analyzer';
  }
  if (msg.includes('soh drop') || msg.includes('state of health')) {
    return 'Detected by Edge AI — Degradation Predictor';
  }
  if (msg.includes('temp stabilizing') || msg.includes('stabilizing')) {
    return 'Verified by Edge AI — Health Monitor';
  }
  return 'Detected by Edge AI — Isolation Forest';
};

export default function Dashboard() {
  const {
    vehicles,
    alerts,
    avgHealth,
    criticalCount,
    recommendations,
    setRecommendations,
    setToast
  } = useOutletContext();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('Auto-assign');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

  const handleOpenScheduleModal = (vehicleId) => {
    setSelectedVehicle(vehicleId);
    setScheduleDate('');
    setSelectedTechnician('Auto-assign');
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = (e) => {
    e.preventDefault();
    if (!scheduleDate) return;
    setScheduleModalOpen(false);
    setToast({ 
      show: true, 
      message: `Service scheduled for ${selectedVehicle} on ${scheduleDate}` 
    });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleRefreshRecommendations = () => {
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setRecommendations(prev => {
      return prev.map(rec => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return { ...rec, confidence: Math.max(50, Math.min(99, rec.confidence + delta)) };
      });
    });
    setToast({ show: true, message: 'AI recommendations refreshed successfully' });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setOpacity(1), 50);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const derivedRangePredictionData = vehicles.map(v => {
    let status = 'Optimal';
    let severity = 'success';
    if (v.status === 'ISOLATED') {
      status = 'Isolated from Grid';
      severity = 'error';
    } else if (v.temp > 49 || v.healthScore < 40) {
      status = v.temp > 49 ? 'Thermal Hazard' : 'Critical Degradation';
      severity = 'error';
    } else if (v.temp > 42 || v.healthScore < 65) {
      status = v.temp > 42 ? 'Thermal Advisory' : 'Degraded SOH';
      severity = 'warning';
    }
    return {
      vehicle: v.id,
      batteryPercent: v.soc,
      temperature: v.temp,
      predictedRange: v.estimatedRange,
      status: status,
      severity: severity
    };
  });

  return isLoading ? (
    <DashboardSkeleton />
  ) : (
    <main className="p-6 space-y-6 overflow-y-auto animate-fade-in flex-1" style={{ opacity, transition: 'opacity 0.5s ease' }}>
      
      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Avg Battery Health */}
        <div className="glass-card p-5 rounded-2xl glow-green relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Battery Health</p>
              <h3 className="text-3xl font-extrabold mt-2 text-emerald-400">{avgHealth}%</h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Battery className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 bg-emerald-950/30 rounded border border-emerald-900/40">Within Nominal Limits</span>
          </div>
        </div>

        {/* Total Fleet */}
        <div className="glass-card p-5 rounded-2xl glow-blue relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Fleet</p>
              <h3 className="text-3xl font-extrabold mt-2 text-blue-400">{vehicles.length} Vehicles</h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="text-[10px] text-blue-400 font-semibold px-1.5 py-0.5 bg-blue-950/30 rounded border border-blue-900/40">Active in network</span>
          </div>
        </div>

        {/* Avg Range Estimate */}
        <div className="glass-card p-5 rounded-2xl glow-blue relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Range Estimate</p>
              <h3 className="text-3xl font-extrabold mt-2 text-blue-400">312 km</h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="text-[10px] text-blue-400 font-semibold px-1.5 py-0.5 bg-blue-950/30 rounded border border-blue-900/40">Based on drive profiles</span>
          </div>
        </div>

        {/* Batteries Critical */}
        <div className="glass-card p-5 rounded-2xl glow-red relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Batteries Critical</p>
              <h3 className="text-3xl font-extrabold mt-2 text-red-500">{criticalCount}</h3>
            </div>
            <div className="p-2.5 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="text-[10px] text-red-500 font-semibold px-1.5 py-0.5 bg-red-950/30 rounded border border-red-900/40 animate-pulse-glow">Immediate Service Required</span>
          </div>
        </div>

        {/* Charge Cycles Today */}
        <div className="glass-card p-5 rounded-2xl glow-yellow relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Charge Cycles Today</p>
              <h3 className="text-3xl font-extrabold mt-2 text-amber-500">47</h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <span className="text-[10px] text-amber-500 font-semibold px-1.5 py-0.5 bg-amber-950/30 rounded border border-amber-900/40">+8% higher than yesterday</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Charts & Analytics Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left/Middle Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* BATTERY DEGRADATION LINE CHART */}
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Battery Capacity Degradation (12 Months)
                </h3>
                <p className="text-xs text-slate-400 mt-1">Capacity retention (%) for active vehicles EV-001, EV-002, and EV-003</p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                <span className="text-[11px] text-slate-400 mr-3">EV-001</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-[11px] text-slate-400 mr-3">EV-002</span>
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
                <span className="text-[11px] text-slate-400">EV-003</span>
              </div>
            </div>
            
            <div className="w-full" style={{ height: isMobile ? '200px' : '288px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={degradationData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} interval={isMobile ? 2 : 0} />
                  <YAxis domain={[30, 100]} stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#151c2c', borderColor: '#1f293d' }} labelStyle={{ color: '#94a3b8' }} />
                  <Line type="monotone" dataKey="EV-001" stroke="#2dd4bf" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="EV-002" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="EV-003" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {isMobile && (
              <div className="flex justify-center items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                  <span className="text-[11px] text-slate-400">EV-001</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span className="text-[11px] text-slate-400">EV-002</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                  <span className="text-[11px] text-slate-400">EV-003</span>
                </div>
              </div>
            )}
          </div>

          {/* CHARGE CYCLE BAR CHART */}
          <div className="glass-card p-6 rounded-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-blue-400" />
                Charge Cycle Analysis
              </h3>
              <p className="text-xs text-slate-400 mt-1">Daily cycles across fleet (Last 7 Days) vs. 45-cycle target average</p>
            </div>

            <div className="w-full mt-6" style={{ height: isMobile ? '180px' : '256px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chargeCycleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} tickFormatter={(val) => isMobile ? val.charAt(0) : val} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#151c2c', borderColor: '#1f293d' }} />
                  <Bar dataKey="cycles" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={isMobile ? 18 : 32} />
                  <Line type="monotone" dataKey="average" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RANGE PREDICTION PANEL */}
          <div className="glass-card p-6 rounded-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  AI Range Prediction Model
                </h3>
                <p className="text-xs text-slate-400 mt-1">Predicted remaining operational distance based on State of Charge (SoC) and temperature</p>
              </div>
              
              <input
                type="text"
                placeholder="Search vehicle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-slate-900/60 border border-slate-800 text-xs rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Vehicle</th>
                    <th className="py-3 px-4 font-semibold text-center">Battery SoC</th>
                    <th className="py-3 px-4 font-semibold text-center">Temperature</th>
                    <th className="py-3 px-4 font-semibold text-center">Predicted Range</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {derivedRangePredictionData
                    .filter(row => row.vehicle.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((row) => (
                      <tr key={row.vehicle} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-200">{row.vehicle}</td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-mono">{row.batteryPercent}%</span>
                            <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  row.batteryPercent > 50 ? 'bg-emerald-500' : row.batteryPercent > 20 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${row.batteryPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium">
                          <span className="flex items-center justify-center gap-1">
                            <Thermometer className={`w-3.5 h-3.5 ${row.temperature > 49 ? 'text-red-400' : 'text-slate-400'}`} />
                            {row.temperature}°C
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-200">{row.predictedRange} km</td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                            row.severity === 'success'
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
                              : row.severity === 'warning'
                              ? 'bg-amber-950/40 text-amber-400 border-amber-900/60'
                              : 'bg-red-950/40 text-red-400 border-red-900/60'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6 items-start">

          {/* LIVE ALERTS FEED */}
          <div className="glass-card p-6 rounded-2xl flex flex-col h-[350px]">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse-glow" />
                  Live Alerts Feed
                </h3>
                <p className="text-[10px] text-slate-400">Real-time edge notification events</p>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded font-mono text-slate-400 font-bold">
                {alerts.length} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    alert.severity === 'critical'
                      ? 'bg-red-950/20 border-red-900/40 text-red-200'
                      : alert.severity === 'warning'
                      ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold flex items-center gap-1 uppercase tracking-wide">
                      {alert.severity === 'critical' ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                      ) : alert.severity === 'warning' ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      {alert.vehicle}
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">{alert.timestamp}</span>
                  </div>
                  <p className="leading-relaxed">{alert.message}</p>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-cyan-500/70 font-semibold">
                    <Cpu className="w-3.5 h-3.5 text-cyan-500/60" />
                    <span>{getAlertEdgeLabel(alert)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BATTERY HEALTH CARDS */}
          <div className="space-y-4">
            <div className="px-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Battery className="w-4 h-4 text-emerald-400" />
                Vehicle Battery Profiles
              </h3>
              <p className="text-xs text-slate-400 mt-1">Diagnostic summaries for all fleet assets</p>
            </div>

            {vehicles.map((vehicle) => {
              const isHealthy = vehicle.status === 'healthy';
              const isWarning = vehicle.status === 'warning';
              const isCritical = vehicle.status === 'critical';
              const isIsolated = vehicle.status === 'ISOLATED';

              let statusColor = 'text-emerald-400';
              let statusBg = 'bg-emerald-500';
              let statusCardGlow = 'glow-green';
              let statusBorder = 'border-emerald-500/20';

              if (isWarning) {
                statusColor = 'text-amber-400';
                statusBg = 'bg-amber-500';
                statusCardGlow = 'glow-yellow';
                statusBorder = 'border-amber-500/20';
              } else if (isCritical) {
                statusColor = 'text-red-400';
                statusBg = 'bg-red-500';
                statusCardGlow = 'glow-red';
                statusBorder = 'border-red-500/20';
              } else if (isIsolated) {
                statusColor = 'text-red-500 font-bold border border-red-500/30 px-1.5 py-0.5 rounded bg-red-950/20';
                statusBg = 'bg-red-500';
                statusCardGlow = 'glow-red';
                statusBorder = 'border-red-500/30';
              }

              return (
                <div
                  key={vehicle.id}
                  className={`glass-card p-5 rounded-2xl border ${statusBorder} ${statusCardGlow} relative overflow-hidden transition-all duration-300 ${
                    isIsolated ? 'opacity-45 grayscale bg-slate-950/20' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{vehicle.id}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Last charged: {vehicle.lastCharged}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-extrabold uppercase ${statusColor}`}>
                        {vehicle.status}
                      </span>
                      <p className="text-lg font-extrabold text-slate-100">{vehicle.healthScore}% SOH</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                      <span>Battery Health (SoH)</span>
                      <span className="font-semibold">{vehicle.healthScore}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/40">
                      <div
                        className={`h-full ${statusBg} rounded-full transition-all duration-500`}
                        style={{ width: `${vehicle.healthScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/30 text-center">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">Est. Range</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">{vehicle.estimatedRange} km</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">Pack Temp</p>
                      <p className={`text-xs font-bold mt-0.5 flex items-center justify-center gap-0.5 ${vehicle.temp > 49 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                        <Thermometer className={`w-3.5 h-3.5 ${vehicle.temp > 49 ? 'text-red-400' : 'text-slate-500'}`} />
                        {vehicle.temp}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wide">Bus Voltage</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">{vehicle.voltage} V</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

      {/* AI PREDICTIVE MAINTENANCE RECOMMENDATIONS */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/60 mt-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              AI Predictive Maintenance Recommendations
            </h3>
            <p className="text-xs text-slate-400 mt-1">Generated by Edge AI — next 30 days forecast</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...recommendations]
            .sort((a, b) => {
              const priority = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
              return priority[b.urgency] - priority[a.urgency];
            })
            .map((rec) => {
              const isEv3 = rec.vehicle === 'EV-003';
              
              let urgencyBadgeColor = 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60';
              let urgencyGlow = 'glow-green';
              if (rec.urgency === 'Critical') {
                urgencyBadgeColor = 'bg-red-950/40 text-red-400 border-red-900/60';
                urgencyGlow = 'glow-red';
              } else if (rec.urgency === 'High') {
                urgencyBadgeColor = 'bg-orange-950/40 text-orange-400 border-orange-900/60';
                urgencyGlow = 'glow-orange';
              } else if (rec.urgency === 'Medium') {
                urgencyBadgeColor = 'bg-amber-950/40 text-amber-400 border-amber-900/60';
                urgencyGlow = 'glow-yellow';
              }

              // Meter color mapping
              let meterColor = 'bg-emerald-500';
              if (rec.confidence < 75) {
                meterColor = 'bg-orange-500';
              } else if (rec.confidence < 90) {
                meterColor = 'bg-amber-500';
              }

              // Component icon mapping
              const compIcon = () => {
                if (rec.icon === 'Battery') return <Battery className="w-3.5 h-3.5 text-emerald-400" />;
                if (rec.icon === 'Zap') return <Zap className="w-3.5 h-3.5 text-amber-400" />;
                if (rec.icon === 'Thermometer') return <Thermometer className="w-3.5 h-3.5 text-sky-400" />;
                return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
              };

              const ev3 = vehicles.find(v => v.id === 'EV-003');
              const isEv3Spiking = ev3 && ev3.temp > 49;

              return (
                <div
                  key={rec.id}
                  className={`p-5 rounded-2xl border bg-slate-900/10 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${urgencyGlow} ${
                    isEv3 && isEv3Spiking ? 'border-red-500 animate-pulse-red' : 'border-slate-800/40'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Badge */}
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${urgencyBadgeColor}`}>
                        {rec.vehicle}
                      </span>
                      {compIcon()}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">{rec.component}</span>
                      <h4 className="text-xs font-extrabold text-slate-200 mt-0.5 line-clamp-1">
                        {rec.issue}
                      </h4>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Urgency</span>
                      <span className={`inline-block text-[10px] font-extrabold mt-0.5 ${
                        rec.urgency === 'Critical' ? 'text-red-400' :
                        rec.urgency === 'High' ? 'text-orange-400' :
                        rec.urgency === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {rec.urgencyText}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Recommended Action</span>
                      <p className="text-xs text-slate-300 font-medium leading-normal line-clamp-2 mt-0.5">
                        {rec.action}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/40">
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Est. Cost</span>
                        <span className="text-xs font-bold text-slate-200">₹{rec.cost.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Confidence</span>
                        <span className="text-xs font-bold text-slate-200">{rec.confidence}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-900/60">
                      <div
                        className={`h-full ${meterColor} rounded-full`}
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-5">
                    <button
                      onClick={() => handleOpenScheduleModal(rec.vehicle)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center font-bold"
                      style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Schedule
                    </button>
                    <button
                      onClick={() => navigate('/maintenance')}
                      className="w-full py-2 border border-slate-800 hover:border-slate-700 bg-slate-955 text-slate-400 hover:text-slate-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center"
                      style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800/40 text-[10px] text-slate-500 gap-4">
          <span className="font-semibold uppercase tracking-wider text-center sm:text-left">
            Predictions generated by Edge AI Isolation Forest model deployed on vehicle ECU • Last updated: {lastUpdated}
          </span>
          <button
            onClick={handleRefreshRecommendations}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/60 text-[10px] font-bold text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Recommendations</span>
          </button>
        </div>
      </div>

      {/* SCHEDULE SERVICE MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all duration-300">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-4">
              Schedule maintenance for {selectedVehicle}
            </h3>

            <form onSubmit={handleConfirmSchedule} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1.5">
                  Select Maintenance Date
                </label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-1.5">
                  Assign Maintenance Technician
                </label>
                <select
                  value={selectedTechnician}
                  onChange={(e) => setSelectedTechnician(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 text-xs rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  <option value="Auto-assign">Auto-assign (Fastest Response)</option>
                  <option value="Technician A">Technician A (HV Certified)</option>
                  <option value="Technician B">Technician B (BMS Specialist)</option>
                </select>
              </div>

              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/20 cursor-pointer text-center font-bold"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
