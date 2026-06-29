import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Sliders, Shield, Info, ToggleLeft, ToggleRight, Check } from 'lucide-react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', circle = false }) => (
  <div className="skeleton" style={{
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : borderRadius,
    marginBottom: '8px'
  }} />
);

const SettingsSkeleton = () => (
  <div className="p-6 space-y-6 overflow-y-auto flex-1">
    <div>
      <Skeleton width="30%" height="24px" />
      <Skeleton width="40%" height="14px" className="mt-1" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-6 rounded-2xl space-y-6">
        <Skeleton width="40%" height="18px" className="mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton width="20%" height="12px" />
            <Skeleton width="100%" height="36px" borderRadius="8px" />
          </div>
        ))}
        <div className="pt-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div>
                <Skeleton width="150px" height="12px" />
                <Skeleton width="250px" height="10px" className="mt-1" />
              </div>
              <Skeleton width="45px" height="24px" borderRadius="12px" />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-6">
        <Skeleton width="50%" height="18px" className="mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-800/40 bg-slate-900/10 space-y-2">
              <Skeleton width="40%" height="12px" />
              <Skeleton width="90%" height="10px" />
              <Skeleton width="80%" height="10px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default function Settings() {
  const { settings, setSettings, setToast } = useOutletContext();

  const [pageLoading, setPageLoading] = useState(true);
  const [pageOpacity, setPageOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      setTimeout(() => setPageOpacity(1), 50);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggle = (field) => {
    setSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setToast({ show: true, message: 'Settings saved successfully' });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4000);
  };

  return pageLoading ? (
    <SettingsSkeleton />
  ) : (
    <div className="p-6 space-y-6 overflow-y-auto animate-fade-in flex-1" style={{ opacity: pageOpacity, transition: 'opacity 0.5s ease' }}>
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          System Settings & Thresholds
        </h2>
        <p className="text-xs text-slate-400 mt-1">Configure Edge AI parameter bounds, notification rules, and isolation preferences</p>
      </div>

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns - Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Threshold Inputs */}
          <div className="glass-card p-6 rounded-2xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Alert Threshold Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Thermal Warning */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold block">Thermal Warning Trigger Temp (°C)</label>
                <input
                  type="number"
                  value={settings.thermalTriggerTemp}
                  onChange={(e) => handleInputChange('thermalTriggerTemp', parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  min="20"
                  max="80"
                />
              </div>

              {/* Critical SOH */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold block">Critical SOH Threshold (%)</label>
                <input
                  type="number"
                  value={settings.criticalSohThreshold}
                  onChange={(e) => handleInputChange('criticalSohThreshold', parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  min="10"
                  max="90"
                />
              </div>

              {/* Alert Refresh */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-semibold block">Alert Feed Refresh Interval (seconds)</label>
                <input
                  type="number"
                  value={settings.alertRefreshInterval}
                  onChange={(e) => handleInputChange('alertRefreshInterval', parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 text-xs rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  min="2"
                  max="60"
                />
              </div>

            </div>
          </div>

          {/* Toggle Preferences */}
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Notification & Emergency Rules
            </h3>
            
            <div className="divide-y divide-slate-800/40">
              
              {/* Email Alerts */}
              <div className="flex justify-between items-center py-3.5">
                <div>
                  <span className="text-xs text-slate-200 font-bold block">Email Notifications</span>
                  <span className="text-[10px] text-slate-500">Route alert events to fleet administrator mailboxes</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('emailAlerts')}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {settings.emailAlerts ? (
                    <ToggleRight className="w-9 h-9 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Sound Alerts */}
              <div className="flex justify-between items-center py-3.5">
                <div>
                  <span className="text-xs text-slate-200 font-bold block">Audio Sirens</span>
                  <span className="text-[10px] text-slate-500">Play local warning sirens inside grid dispatch room</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('soundAlerts')}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {settings.soundAlerts ? (
                    <ToggleRight className="w-9 h-9 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

              {/* Auto Isolate */}
              <div className="flex justify-between items-center py-3.5">
                <div>
                  <span className="text-xs text-slate-200 font-bold block">Auto-Isolate on Thermal Runaway</span>
                  <span className="text-[10px] text-slate-500">Automatically isolate the pack from grid when temp exceeds limit</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('autoIsolate')}
                  className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {settings.autoIsolate ? (
                    <ToggleRight className="w-9 h-9 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-slate-600" />
                  )}
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column - Diagnostics info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-2xl flex flex-col justify-between h-full space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                System Properties
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Model Version</span>
                  <span className="font-bold text-slate-300 font-mono">EV-EdgeAI v2.0.4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Model Update</span>
                  <span className="font-bold text-slate-300 font-mono">2026-06-25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Edge Node Status</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold uppercase tracking-wider text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
