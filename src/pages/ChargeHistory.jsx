import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { BatteryCharging, Calendar, Filter } from 'lucide-react';

const initialSessionLogs = [
  { id: 1, date: '2026-06-28', vehicle: 'EV-001', start: 12, end: 88, duration: 42, energy: 54.7, type: 'DC Fast' },
  { id: 2, date: '2026-06-27', vehicle: 'EV-003', start: 22, end: 45, duration: 25, energy: 16.5, type: 'AC Slow' },
  { id: 3, date: '2026-06-27', vehicle: 'EV-002', start: 30, end: 72, duration: 38, energy: 30.2, type: 'DC Fast' },
  { id: 4, date: '2026-06-26', vehicle: 'EV-004', start: 15, end: 95, duration: 55, energy: 57.6, type: 'DC Fast' },
  { id: 5, date: '2026-06-25', vehicle: 'EV-001', start: 40, end: 90, duration: 28, energy: 36.0, type: 'AC Slow' },
  { id: 6, date: '2026-06-24', vehicle: 'EV-002', start: 45, end: 68, duration: 18, energy: 16.5, type: 'DC Fast' },
  { id: 7, date: '2026-06-23', vehicle: 'EV-003', start: 10, end: 38, duration: 20, energy: 20.1, type: 'AC Slow' },
  { id: 8, date: '2026-06-22', vehicle: 'EV-004', start: 20, end: 85, duration: 45, energy: 46.8, type: 'DC Fast' },
  { id: 9, date: '2026-06-21', vehicle: 'EV-001', start: 5, end: 80, duration: 48, energy: 54.0, type: 'DC Fast' },
  { id: 10, date: '2026-06-20', vehicle: 'EV-002', start: 25, end: 88, duration: 44, energy: 45.3, type: 'AC Slow' },
];

const chargeFrequencyData = [
  { day: 'Week 1', 'EV-001': 5, 'EV-002': 4, 'EV-003': 3, 'EV-004': 6 },
  { day: 'Week 2', 'EV-001': 6, 'EV-002': 5, 'EV-003': 2, 'EV-004': 5 },
  { day: 'Week 3', 'EV-001': 4, 'EV-002': 3, 'EV-003': 4, 'EV-004': 4 },
  { day: 'Week 4', 'EV-001': 7, 'EV-002': 6, 'EV-003': 1, 'EV-004': 7 },
];

const avgDurationTrendData = [
  { day: '06/20', dc: 41, ac: 65 },
  { day: '06/22', dc: 38, ac: 58 },
  { day: '06/24', dc: 42, ac: 60 },
  { day: '06/26', dc: 39, ac: 62 },
  { day: '06/28', dc: 40, ac: 59 },
];

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', circle = false }) => (
  <div className="skeleton" style={{
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : borderRadius,
    marginBottom: '8px'
  }} />
);

const ChargeHistorySkeleton = () => (
  <div className="p-6 space-y-6 overflow-y-auto flex-1">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <Skeleton width="40%" height="24px" />
        <Skeleton width="60%" height="14px" className="mt-1" />
      </div>
      <Skeleton width="140px" height="32px" borderRadius="8px" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
        <Skeleton width="30%" height="18px" className="mb-6" />
        <div className="h-[200px] flex items-end justify-between px-8 pt-4">
          {[140, 180, 100, 160, 120, 150, 90].map((h, idx) => (
            <div key={idx} className="w-8 skeleton" style={{ height: `${h}px`, borderRadius: '4px 4px 0 0' }} />
          ))}
        </div>
      </div>
      <div className="glass-card p-6 rounded-2xl space-y-4">
        <Skeleton width="50%" height="18px" />
        <Skeleton width="100%" height="160px" />
      </div>
    </div>

    <div className="glass-card p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <Skeleton width="20%" height="18px" />
        <Skeleton width="15%" height="18px" />
      </div>
      <div className="space-y-3.5">
        <div className="grid grid-cols-6 gap-4 pb-2 border-b border-slate-800/40">
          {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} width="70%" height="12px" />)}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4 py-1.5">
            {Array.from({ length: 6 }).map((_, j) => <Skeleton key={j} width="85%" height="10px" />)}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default function ChargeHistory() {
  const { vehicles } = useOutletContext();
  const [filterVehicle, setFilterVehicle] = useState('ALL');
  const [pageLoading, setPageLoading] = useState(true);
  const [pageOpacity, setPageOpacity] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showAllColumns, setShowAllColumns] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      setTimeout(() => setPageOpacity(1), 50);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const filteredLogs = filterVehicle === 'ALL'
    ? initialSessionLogs
    : initialSessionLogs.filter(log => log.vehicle === filterVehicle);

  return pageLoading ? (
    <ChargeHistorySkeleton />
  ) : (
    <div className="p-6 space-y-6 overflow-y-auto animate-fade-in flex-1" style={{ opacity: pageOpacity, transition: 'opacity 0.5s ease' }}>
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BatteryCharging className="w-5 h-5 text-blue-400" />
            Fleet Charging History & Efficiency
          </h2>
          <p className="text-xs text-slate-400 mt-1">Telemetry log of charging cycles, times, energy transfers, and connection types</p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterVehicle}
            onChange={(e) => setFilterVehicle(e.target.value)}
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer w-full"
            style={{ minHeight: '44px' }}
          >
            <option value="ALL">All Vehicles</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.id}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Charge Frequency Bar Chart */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">30-Day Charge Frequency (Cycles)</h3>
            <p className="text-xs text-slate-400 mt-1">Weekly counts per vehicle</p>
          </div>
          
          <div className="w-full" style={{ height: isMobile ? '180px' : '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chargeFrequencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#151c2c', borderColor: '#1f293d' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="EV-001" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                <Bar dataKey="EV-002" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="EV-003" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="EV-004" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Avg Duration Trends */}
        <div className="glass-card p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Average Charging Duration Trends</h3>
            <p className="text-xs text-slate-400 mt-1">DC Fast vs. AC Slow duration profiles (minutes)</p>
          </div>
          
          <div className="w-full" style={{ height: isMobile ? '200px' : '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={avgDurationTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#151c2c', borderColor: '#1f293d' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" name="DC Fast Charger" dataKey="dc" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" name="AC Slow Charger" dataKey="ac" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* SESSION LOG TABLE */}
      <div className="glass-card p-6 rounded-2xl overflow-hidden">
        <div>
          <h3 className="text-sm font-bold text-white">Charge Session Telemetry Logs</h3>
          <p className="text-xs text-slate-400 mt-1">Chronological history index of fleet grid connections</p>
        </div>

        <div className="overflow-x-auto mt-4" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px]">
                {!(isMobile && !showAllColumns) && <th className="py-3 px-4 font-semibold">Date</th>}
                <th className="py-3 px-4 font-semibold">Vehicle</th>
                {!(isMobile && !showAllColumns) && (
                  <>
                    <th className="py-3 px-4 font-semibold text-center">Start SoC</th>
                    <th className="py-3 px-4 font-semibold text-center">End SoC</th>
                    <th className="py-3 px-4 font-semibold text-center">Duration</th>
                    <th className="py-3 px-4 font-semibold text-center">Energy Added</th>
                  </>
                )}
                {isMobile && !showAllColumns && (
                  <th className="py-3 px-4 font-semibold text-center">SOH%</th>
                )}
                <th className="py-3 px-4 font-semibold text-center">{isMobile && !showAllColumns ? 'Status' : 'Charger Type'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredLogs.map((log) => {
                const showThree = isMobile && !showAllColumns;
                return (
                  <tr key={log.id} className="hover:bg-slate-800/20 transition-colors">
                    {!showThree && (
                      <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {log.date}
                      </td>
                    )}
                    <td className="py-3.5 px-4 font-bold text-slate-200">{log.vehicle}</td>
                    {!showThree && (
                      <>
                        <td className="py-3.5 px-4 text-center font-mono">{log.start}%</td>
                        <td className="py-3.5 px-4 text-center font-mono">{log.end}%</td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-300">{log.duration} mins</td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-400 font-mono">+{log.energy} kWh</td>
                      </>
                    )}
                    {showThree && (
                      <td className="py-3.5 px-4 text-center font-mono text-slate-200 font-bold">{log.end}%</td>
                    )}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.type === 'DC Fast' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isMobile && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAllColumns(!showAllColumns)}
              className="px-4 py-2 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              style={{ minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {showAllColumns ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
