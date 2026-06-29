import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  AlertOctagon, AlertTriangle, Battery, Bell, Clock, Cpu, Gauge,
  History, Compass, MapPin, Sliders, RefreshCw, Thermometer, ShieldAlert,
  Download, FileSpreadsheet, FileDown, Wrench
} from 'lucide-react';

import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  LineChart, Line, XAxis, YAxis,
  ReferenceLine, ResponsiveContainer,
  Tooltip
} from 'recharts';

export default function Layout({
  vehicles,
  setVehicles,
  alerts,
  setAlerts,
  toast,
  setToast,
  showWarning,
  setShowWarning,
  detectionTime,
  setDetectionTime,
  settings,
  setSettings,
  handleTriggerTelemetryRefresh,
  currentTime,
  avgHealth,
  criticalCount,
  criticalAlertsCount,
  warningAlertsCount,
  handleIsolateVehicle,
  handleAlertTechnician,
  handleDismissWarning,
  recommendations,
  setRecommendations
}) {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [countdown, setCountdown] = useState(30);
  const [countdownActive, setCountdownActive] = useState(false);
  const [isAutoIsolating, setIsAutoIsolating] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [tempHistory, setTempHistory] = useState([
    { time: '-9s', temp: 45.2 },
    { time: '-8s', temp: 46.1 },
    { time: '-7s', temp: 46.8 },
    { time: '-6s', temp: 47.3 },
    { time: '-5s', temp: 47.9 },
    { time: '-4s', temp: 48.6 },
    { time: '-3s', temp: 49.4 },
    { time: '-2s', temp: 50.1 },
    { time: '-1s', temp: 50.9 },
    { time: 'now', temp: 51.7 },
  ]);

  // Sound players
  const playBeep = (freq, duration) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + duration - 0.05);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (err) {
      console.log('Audio not available:', err);
    }
  };

  const playTripleBeep = () => {
    [0, 0.2, 0.4].forEach((delay) => {
      setTimeout(() => playBeep(520, 0.15), delay * 1000);
    });
  };

  const playUrgentBeep = () => {
    [0, 0.25].forEach((delay) => {
      setTimeout(() => {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          if (audioCtx.state === 'suspended') {
            audioCtx.resume();
          }
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);

          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.6, audioCtx.currentTime + 0.05);
          gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2 - 0.05);

          oscillator.start(audioCtx.currentTime);
          oscillator.stop(audioCtx.currentTime + 0.2);
        } catch (err) {
          console.log('Audio not available:', err);
        }
      }, delay * 1000);
    });
  };

  // Start countdown when warning opens
  useEffect(() => {
    if (showWarning) {
      setCountdown(30);
      setCountdownActive(true);
      setIsAutoIsolating(false);
      setIsNotifying(false);
      setIsFrozen(false);
      setTempHistory([
        { time: '-9s', temp: 45.2 },
        { time: '-8s', temp: 46.1 },
        { time: '-7s', temp: 46.8 },
        { time: '-6s', temp: 47.3 },
        { time: '-5s', temp: 47.9 },
        { time: '-4s', temp: 48.6 },
        { time: '-3s', temp: 49.4 },
        { time: '-2s', temp: 50.1 },
        { time: '-1s', temp: 50.9 },
        { time: 'now', temp: 51.7 },
      ]);
    } else {
      setCountdownActive(false);
    }
  }, [showWarning]);

  // Tick every second
  useEffect(() => {
    if (!countdownActive) return;
    if (countdown <= 0) {
      setCountdownActive(false);
      setIsAutoIsolating(true);
      setIsFrozen(true);
      playUrgentBeep();
      setTimeout(() => {
        handleIsolateVehicle(true);
        setIsAutoIsolating(false);
      }, 2000);
      return;
    }
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, countdownActive]);

  // Add new reading every second while popup is open
  useEffect(() => {
    if (!showWarning || isFrozen) return;
    const interval = setInterval(() => {
      setTempHistory(prev => {
        const lastTemp = prev[prev.length - 1].temp;
        const newTemp = Math.min(54.9, lastTemp + (Math.random() * 0.4 + 0.1));
        const newPoint = {
          time: 'now',
          temp: parseFloat(newTemp.toFixed(1))
        };
        const updated = prev.map((p, i) => ({
          ...p,
          time: `-${prev.length - i}s`
        }));
        return [...updated.slice(-9), newPoint];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showWarning, isFrozen]);

  // Sound triggers at critical moments
  useEffect(() => {
    if (!countdownActive) return;
    if (countdown === 10) playBeep(440, 0.2);
    if (countdown === 5) playTripleBeep();
    if (countdown === 0) playUrgentBeep();
  }, [countdown, countdownActive]);

  const handleIsolateVehicleClick = () => {
    setIsFrozen(true);
    setCountdownActive(false);
    handleIsolateVehicle(false);
  };

  const handleAlertTechnicianClick = () => {
    setIsNotifying(true);
    setCountdownActive(false);
    handleAlertTechnician();
    setTimeout(() => {
      setIsNotifying(false);
    }, 3000);
  };

  const handleDismissWarningClick = () => {
    setCountdownActive(false);
    handleDismissWarning();
  };

  const handleExportCSV = () => {
    setShowDropdown(false);
    setIsDownloading(true);

    setTimeout(() => {
      try {
        const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '');
        
        const vehicleRows = vehicles.map(v => ({
          'Vehicle': v.id,
          'SOH%': `${v.status === 'ISOLATED' ? '0' : v.healthScore}%`,
          'Est Range': `${v.status === 'ISOLATED' ? '0' : v.estimatedRange} km`,
          'Pack Temp': v.status === 'ISOLATED' ? '—' : `${v.temp}°C`,
          'Bus Voltage': `${v.voltage}V`,
          'Status': v.status === 'ISOLATED' ? 'ISOLATED' : v.status.toUpperCase(),
          'Last Charged': v.lastCharged,
          'Last Alert': alerts.find(a => a.vehicle === v.id)?.message || 'None'
        }));
        
        const alertRows = alerts.slice(-7).reverse().map(a => ({
          'Timestamp': a.timestamp,
          'Vehicle ID': a.vehicle,
          'Alert Type': a.type || 'Nominal',
          'Severity': a.severity.toUpperCase()
        }));

        const csvVehicles = Papa.unparse(vehicleRows);
        const csvAlerts = Papa.unparse(alertRows);
        const csvString = `${csvVehicles}\n\n--- Alerts Log (Last 7) ---\n${csvAlerts}`;

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `EV_Fleet_Report_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setToast({ show: true, message: '✓ CSV downloaded successfully' });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
      } catch (err) {
        console.error('CSV generation failed:', err);
      } finally {
        setIsDownloading(false);
      }
    }, 1000);
  };

  const handleExportPDF = () => {
    setShowDropdown(false);
    setIsDownloading(true);

    setTimeout(() => {
      try {
        const doc = new jsPDF();
        const dateStr = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '');
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Helper for styling
        const drawHeader = (title) => {
          doc.setFillColor(15, 25, 35);
          doc.rect(0, 0, 210, 35, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(18);
          doc.text(title, 14, 22);
          
          doc.setFontSize(9);
          doc.setTextColor(156, 163, 175);
          doc.text(`Generated: ${dateStr} ${timeStr} | Edge AI Diagnostics`, 14, 29);
        };

        const drawFooter = (pageNum) => {
          doc.setFontSize(8);
          doc.setTextColor(156, 163, 175);
          doc.text('Tata Technologies InnoVent — Confidential', 14, 287);
          doc.text(`Page ${pageNum} of 3`, 180, 287);
        };

        // --- PAGE 1: FLEET SUMMARY ---
        drawHeader('EV Battery Intelligence — Fleet Report');

        doc.setTextColor(21, 28, 44);
        doc.setFontSize(12);
        doc.text('Operational Fleet Diagnostics Summary', 14, 50);

        // 4 Metric Boxes
        const avgSohVal = avgHealth;
        const avgRangeVal = Math.round(vehicles.reduce((acc, v) => acc + (v.status === 'ISOLATED' ? 0 : v.estimatedRange), 0) / vehicles.length);
        const critCountVal = criticalCount;
        const totalCyclesVal = vehicles.reduce((acc, v) => acc + v.cycles, 0);

        const boxWidth = 43;
        const boxHeight = 22;
        const startX = 14;
        const startY = 56;
        const metrics = [
          { label: 'Fleet Avg SOH', val: `${avgSohVal}%` },
          { label: 'Fleet Avg Range', val: `${avgRangeVal} km` },
          { label: 'Critical Group', val: critCountVal },
          { label: 'Total Charge Cycles', val: totalCyclesVal }
        ];

        metrics.forEach((m, idx) => {
          const x = startX + idx * (boxWidth + 5);
          doc.setFillColor(243, 244, 246);
          doc.setDrawColor(229, 231, 235);
          doc.roundedRect(x, startY, boxWidth, boxHeight, 3, 3, 'FD');
          
          doc.setFontSize(8);
          doc.setTextColor(107, 114, 128);
          doc.text(m.label, x + 4, startY + 7);
          
          doc.setFontSize(13);
          doc.setTextColor(17, 24, 39);
          doc.text(String(m.val), x + 4, startY + 16);
        });

        // Fleet status table
        doc.setFontSize(11);
        doc.setTextColor(21, 28, 44);
        doc.text('Asset Profiles Telemetry', 14, 92);

        const fleetRows = vehicles.map(v => [
          v.id,
          `${v.status === 'ISOLATED' ? '0' : v.healthScore}%`,
          v.status === 'ISOLATED' ? '0 km' : `${v.estimatedRange} km`,
          v.status === 'ISOLATED' ? '—' : `${v.temp}°C`,
          `${v.voltage}V`,
          v.status.toUpperCase(),
          v.lastCharged
        ]);

        autoTable(doc, {
          head: [['Vehicle', 'SOH%', 'Est Range', 'Pack Temp', 'Bus Voltage', 'Status', 'Last Charged']],
          body: fleetRows,
          startY: 97,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          styles: { fontSize: 9 }
        });

        drawFooter(1);

        // --- PAGE 2: ALERTS LOG ---
        doc.addPage();
        drawHeader('Live Anomaly Alerts Log');

        doc.setFontSize(12);
        doc.setTextColor(21, 28, 44);
        doc.text('Active Edge AI Detection Feed', 14, 50);

        const getClassifierModel = (msg, type) => {
          const m = (msg || '').toLowerCase();
          const t = (type || '').toLowerCase();
          if (m.includes('thermal runaway') || t === 'thermal') return 'Thermal Anomaly Model';
          if (m.includes('voltage drop') || t === 'voltage') return 'Isolation Forest';
          if (m.includes('charging anomaly') || t === 'charging') return 'Charge Pattern Analyzer';
          if (m.includes('soh drop') || m.includes('state of health')) return 'Degradation Predictor';
          if (m.includes('temp stabilizing') || m.includes('stabilizing')) return 'Health Monitor';
          return 'Isolation Forest';
        };

        const alertRows = alerts.slice(-10).reverse().map(a => [
          a.timestamp,
          a.vehicle,
          a.type ? a.type.toUpperCase() : 'TELEMETRY',
          a.severity.toUpperCase(),
          getClassifierModel(a.message, a.type)
        ]);

        autoTable(doc, {
          head: [['Time', 'Vehicle ID', 'Alert Type', 'Severity', 'AI Model Used']],
          body: alertRows,
          startY: 56,
          theme: 'striped',
          headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [254, 242, 242] },
          styles: { fontSize: 8.5 }
        });

        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text('All alerts detected by Edge AI — Isolation Forest Model', 14, 250);

        drawFooter(2);

        // --- PAGE 3: VEHICLE PROFILES ---
        doc.addPage();
        drawHeader('Battery Diagnostic Profiles');

        doc.setFontSize(12);
        doc.setTextColor(21, 28, 44);
        doc.text('Individual Asset Diagnostics & Recommended Actions', 14, 50);

        let currentY = 58;
        vehicles.forEach((v) => {
          const isIsolated = v.status === 'ISOLATED';
          
          doc.setFillColor(249, 250, 251);
          doc.setDrawColor(229, 231, 235);
          doc.roundedRect(14, currentY, 182, 45, 3, 3, 'FD');

          // Title
          doc.setFontSize(11);
          doc.setTextColor(17, 24, 39);
          doc.text(`${v.id} - ${isIsolated ? 'ISOLATED' : v.status.toUpperCase()}`, 18, currentY + 7);

          // Details grid
          doc.setFontSize(8.5);
          doc.setTextColor(107, 114, 128);
          doc.text(`SOH Capacity: ${isIsolated ? '0' : v.healthScore}%`, 18, currentY + 16);
          doc.text(`Estimated Range: ${isIsolated ? '0' : v.estimatedRange} km`, 18, currentY + 22);
          doc.text(`Pack Temperature: ${isIsolated ? '—' : `${v.temp}°C`}`, 18, currentY + 28);
          doc.text(`Bus Voltage: ${v.voltage}V`, 18, currentY + 34);

          // Actions
          let actionText = '';
          if (v.status === 'healthy') {
            actionText = 'No action required. Telemetry nominal.';
          } else if (v.status === 'warning') {
            actionText = 'Schedule maintenance review. Inspect cells delta.';
          } else if (v.status === 'critical') {
            actionText = 'Immediate grid isolation. Dispatch technician.';
          } else if (isIsolated) {
            actionText = 'Vehicle is isolated from grid. Inspect battery pack.';
          }

          doc.setTextColor(31, 41, 55);
          doc.text('Recommended Action:', 100, currentY + 16);
          doc.setTextColor(v.status === 'critical' || isIsolated ? 220 : 75, v.status === 'critical' ? 38 : 85, 38);
          doc.text(actionText, 100, currentY + 22);

          currentY += 51;
        });

        drawFooter(3);

        doc.save(`EV_Fleet_Report_${dateStr}.pdf`);

        setToast({ show: true, message: `✓ PDF report downloaded — EV_Fleet_Report_${dateStr}.pdf` });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
      } catch (err) {
        console.error('PDF generation failed:', err);
      } finally {
        setIsDownloading(false);
      }
    }, 1000);
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Gauge },
    { name: 'Battery Health', path: '/battery-health', icon: Battery },
    { name: 'Charge History', path: '/charge-history', icon: History },
    { name: 'Range Predictor', path: '/range-predictor', icon: Compass },
    { name: 'Fleet Map', path: '/fleet-map', icon: MapPin },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench },
    { name: 'Settings', path: '/settings', icon: Sliders }
  ];

  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;

  const ev3 = vehicles.find(v => v.id === 'EV-003');

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans">
      
      {/* SIDEBAR */}
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 left-0 glass-panel border-r border-slate-800/60 z-30">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/40">
          <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl shadow-lg glow-green">
            <Cpu className="w-6 h-6 text-[#070b14]" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 tracking-tight">
              Tata InnoVent
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Edge AI Diagnostics</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                id={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border-l-4 border-emerald-400 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/40 bg-slate-900/20 text-center">
          <p className="text-[11px] text-slate-500">Tata Technologies</p>
          <p className="text-[9px] text-emerald-500/60 font-mono mt-0.5">EV-EdgeAI v2.0.4</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 glass-panel border-b border-slate-800/60 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="md:hidden p-2 bg-emerald-500 rounded-lg mr-2">
              <Cpu className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                EV Battery Intelligence
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase font-mono px-2.5 py-0.5 bg-[#020e06] text-[#00ff80] rounded border border-emerald-500/30 animate-badge-glow">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff80] animate-dot-pulse shadow-[0_0_8px_rgba(0,255,128,0.8)]"></span>
                  TELEMETRY ACTIVE
                </span>
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">Real-time battery pack diagnostics and edge prediction</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span id="badge-critical" className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-red-950/40 text-red-400 border border-red-900/60 rounded-full animate-pulse-subtle">
                <AlertOctagon className="w-3.5 h-3.5" />
                {criticalAlertsCount} critical
              </span>
              <span id="badge-warning" className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-amber-950/40 text-amber-400 border border-amber-900/60 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" />
                {warningAlertsCount} warnings
              </span>
            </div>

            <div className="h-8 w-px bg-slate-800/80 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <button 
                id="btn-refresh"
                onClick={handleTriggerTelemetryRefresh}
                className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/40 transition-colors"
                title="Force Telemetry Sync"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              <div className="relative">
                <button className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/40 transition-colors">
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                  <Bell className="w-4 h-4" />
                </button>
              </div>

              {/* DOWNLOAD REPORT DROPDOWN BUTTON */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={isDownloading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-850 text-xs font-bold text-slate-200 hover:text-white border border-slate-700/50 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <svg className="animate-spin h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{isDownloading ? 'Downloading...' : 'Download Report'}</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-800 bg-[#0c1220]/95 backdrop-blur shadow-2xl z-50 p-1.5 space-y-1">
                    <button
                      onClick={handleExportPDF}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800/80 rounded-lg text-xs font-bold text-slate-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5 text-red-400" />
                      <span>Export as PDF</span>
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-800/80 rounded-lg text-xs font-bold text-slate-300 hover:text-white text-left transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export as CSV</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="hidden lg:block text-right">
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Last Telemetry</p>
                <p className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-500" />
                  {formatTimestamp(currentTime)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet with smooth route transition class */}
        <div className="flex-1 transition-all duration-300">
          <Outlet context={{
            vehicles,
            setVehicles,
            alerts,
            setAlerts,
            toast,
            setToast,
            settings,
            setSettings,
            avgHealth,
            criticalCount,
            criticalAlertsCount,
            warningAlertsCount,
            recommendations,
            setRecommendations
          }} />
        </div>
      </div>

      {/* THERMAL RUNAWAY WARNING POPUP FOR EV-003 */}
      {/* THERMAL RUNAWAY WARNING POPUP FOR EV-003 */}
      {showWarning && ev3 && (() => {
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (countdown / 30) * circumference;

        const getTimerColor = (sec) => {
          if (sec > 14) return '#f59e0b';
          if (sec >= 6) return '#f97316';
          return '#ef4444';
        };
        const ringColor = getTimerColor(countdown);

        const currentTemp = tempHistory[tempHistory.length - 1]?.temp || 51.7;
        let lineColor = '#ff4444';
        let lineStrokeWidth = 2;
        if (isFrozen) {
          lineColor = '#64748b';
          lineStrokeWidth = 2;
        } else if (currentTemp > 52) {
          lineColor = '#cc0000';
          lineStrokeWidth = 3;
        } else if (currentTemp >= 49) {
          lineColor = '#ff4444';
          lineStrokeWidth = 2;
        } else {
          lineColor = '#ff6b35';
          lineStrokeWidth = 2;
        }

        let popupBorderClass = "border-red-500 glow-red animate-pulse-subtle";
        if (countdown <= 5) {
          popupBorderClass = "border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-pulse-red animate-shake";
        } else if (countdown <= 10) {
          popupBorderClass = "border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-shake";
        } else if (countdown <= 15) {
          popupBorderClass = "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.75)]";
        }

        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all duration-300">
            <div className={`bg-[#121824] border-2 rounded-3xl max-w-md w-full p-6 shadow-2xl transition-all duration-300 ${popupBorderClass}`}>
              
              {/* Countdown Display */}
              <div className="flex flex-col items-center justify-center mb-5 mt-2">
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-2">
                  CRITICAL RESPONSE REQUIRED WITHIN
                </p>
                
                <div className="relative flex items-center justify-center">
                  <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
                    {/* Background ring */}
                    <circle cx="70" cy="70" r={radius}
                      fill="none" stroke="#1a2332" strokeWidth="8" />
                    {/* Countdown ring */}
                    <circle cx="70" cy="70" r={radius}
                      fill="none" stroke={ringColor} strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 70 70)"
                      style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                    />
                    {/* Countdown number in center */}
                    <text 
                      x="70" 
                      y="70" 
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      fontSize="36" 
                      fontWeight="black" 
                      fill={ringColor}
                      className={`font-mono transition-all duration-300 ${countdown <= 5 ? 'animate-flash-red text-red-500' : ''}`}
                    >
                      {countdown}
                    </text>
                  </svg>
                </div>
                
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-2">
                  SECONDS
                </p>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-black text-red-500 tracking-wide uppercase">
                  {isAutoIsolating ? "⚠ NO RESPONSE DETECTED — AUTO ISOLATING" : "⚠ THERMAL RUNAWAY RISK — EV-003"}
                </h2>
                <p className="text-xs text-slate-400 font-bold tracking-wider uppercase mt-1">
                  {isAutoIsolating ? "Safety isolation protocol initiated" : "Immediate intervention required"}
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-3 mb-4">
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/40">
                  <span className="text-xs text-slate-400 font-medium">Pack Temperature</span>
                  <span className="text-2xl font-black text-red-500 tracking-tight animate-pulse">
                    {ev3.temp}°C
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/40">
                  <span className="text-xs text-slate-400 font-medium">Current SOH</span>
                  <span className="text-sm font-bold text-slate-200">{ev3.healthScore}%</span>
                </div>
                <div className="flex justify-between items-center pb-2.5 border-b border-slate-800/40">
                  <span className="text-xs text-slate-400 font-medium">Cell Group Affected</span>
                  <span className="text-sm font-bold text-amber-400">Cell Group 4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 font-medium">Time of Detection</span>
                  <span className="text-sm font-mono text-slate-300 font-bold">{detectionTime}</span>
                </div>
              </div>

              {/* Live Temperature Rising Graph */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pack Temperature — Live Reading</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black tracking-tight transition-colors duration-300" style={{ color: lineColor }}>
                      {currentTemp.toFixed(1)}°C
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 bg-slate-950/40 rounded border border-slate-800/60 animate-pulse" style={{ color: isFrozen ? '#64748b' : lineColor }}>
                      {isFrozen ? 'Paused' : '↑ Rising'}
                    </span>
                  </div>
                </div>

                {isFrozen && (
                  <div className="text-center text-[10px] font-bold text-slate-400 bg-slate-800/40 py-1 rounded-lg border border-slate-800/60 mb-2">
                    ❄ Vehicle isolated — monitoring paused
                  </div>
                )}

                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={tempHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="time"
                      tick={{ fill: '#888', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[44, 55]}
                      tick={{ fill: '#888', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `${v}°`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#0f1923',
                        border: `0.5px solid ${lineColor}`,
                        borderRadius: '6px',
                        fontSize: '11px'
                      }}
                      formatter={v => [`${v}°C`, 'Pack Temp']}
                    />
                    {/* Danger zone threshold line */}
                    <ReferenceLine
                      y={49}
                      stroke="#ff4444"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Danger 49°C',
                        fill: '#ff4444',
                        fontSize: 10,
                        position: 'insideTopRight'
                      }}
                    />
                    {/* Temperature line */}
                    <Line
                      type="monotone"
                      dataKey="temp"
                      stroke={lineColor}
                      strokeWidth={lineStrokeWidth}
                      dot={{ fill: lineColor, r: 3 }}
                      activeDot={{ r: 5, fill: '#ff4444' }}
                      isAnimationActive={true}
                      animationDuration={300}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-2.5 mb-4">
                <button
                  onClick={handleIsolateVehicleClick}
                  className={`w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-red-950/20 ${countdownActive ? 'animate-pulsing-border border-red-500' : ''}`}
                >
                  Isolate Vehicle
                </button>
                <button
                  onClick={handleAlertTechnicianClick}
                  disabled={isNotifying}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-600/60 text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-amber-950/20 flex items-center justify-center gap-2"
                >
                  {isNotifying && (
                    <svg className="animate-spin h-3.5 w-3.5 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  <span>{isNotifying ? 'Notifying...' : 'Alert Technician'}</span>
                </button>
                <button
                  onClick={handleDismissWarningClick}
                  className="w-full py-3 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/30 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors"
                >
                  Dismiss Warning
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-500 font-semibold tracking-wide">
                Edge AI anomaly verification via Isolation Forest model
              </p>
            </div>
          </div>
        );
      })()}

      {/* Success Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 bg-emerald-950/90 border border-emerald-500/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-[9999] animate-bounce-subtle">
          <div className="p-1 bg-emerald-500 rounded-full text-black">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <span className="text-xs font-bold text-emerald-200">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
