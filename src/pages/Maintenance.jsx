import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Wrench, Battery, AlertOctagon, AlertTriangle, ShieldAlert, Zap,
  Thermometer, Cpu, Download, FileSpreadsheet, FileDown,
  Clock, DollarSign, Calendar, CheckCircle, Play, Eye
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Skeleton Loader Component
const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', circle = false }) => (
  <div className="skeleton" style={{
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : borderRadius,
  }} />
);

export default function Maintenance() {
  const {
    vehicles,
    setToast,
    recommendations,
    setRecommendations
  } = useOutletContext();

  const [isLoading, setIsLoading] = useState(true);
  const [opacity, setOpacity] = useState(0);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('Auto-assign');

  // Page Load Trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setOpacity(1), 50);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // EV-003 Dynamic Status for Red Glow
  const ev3 = vehicles?.find(v => v.id === 'EV-003');
  const isEv3Spiking = ev3 && ev3.temp > 49;

  // Chart 1: Cost breakdown data
  const pieData = recommendations.map(rec => ({
    name: rec.component,
    value: rec.cost,
    vehicle: rec.vehicle
  }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981'];

  // Chart 2: Timeline data
  const timelineData = [
    { name: 'Week 1', Critical: 1, High: 1, Medium: 0, Low: 0 },
    { name: 'Week 2', Critical: 0, High: 0, Medium: 1, Low: 0 },
    { name: 'Week 3', Critical: 0, High: 0, Medium: 0, Low: 1 },
    { name: 'Week 4', Critical: 0, High: 0, Medium: 0, Low: 1 }
  ];

  // Schedule Service Modal handlers
  const handleOpenModal = (vehicle, issue) => {
    setSelectedVehicle(vehicle);
    setSelectedIssue(issue);
    setScheduleDate('');
    setSelectedTechnician('Auto-assign');
    setIsModalOpen(true);
  };

  const handleConfirmSchedule = (e) => {
    e.preventDefault();
    if (!scheduleDate) return;

    setIsModalOpen(false);
    setToast({
      show: true,
      message: `Service scheduled for ${selectedVehicle} on ${scheduleDate} with ${selectedTechnician}`
    });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  // Recommendations Details Map
  const expandedDetails = {
    'rec-1': {
      cause: 'Accelerated degradation in Cell Group 4 caused by localized temperature differentials and recurrent high-current fast charging cycles.',
      steps: [
        'Safe high-voltage pack isolation & disconnect main contactor.',
        'Remove battery module enclosure cover in static-free cleanroom.',
        'Replace bad cell module in Group 4 and verify cell voltage matches other groups.',
        'Reassemble pack, check coolant pathways, and perform a full charge-discharge cell balancing cycle.'
      ],
      parts: 'LFP Cell Module (Group 4), Thermal Pad, Sealing Gasket',
      hours: '6.5 hrs'
    },
    'rec-2': {
      cause: 'Contact pitting and carbon buildup on switch plates leading to micro-arcing and voltage drops under heavy acceleration.',
      steps: [
        'De-energize high voltage system and discharge internal inverter capacitors.',
        'Unbolt old contactor assembly and check signal wiring harnesses.',
        'Mount new heavy-duty contactor assembly and torque terminal bolts to 9 Nm.',
        'Run signal feedback test to verify coil resistance parameters.'
      ],
      parts: 'HV Contactor Assembly, Contact Grease',
      hours: '3.0 hrs'
    },
    'rec-3': {
      cause: 'Coolant pump motor showing rotor drag and 18% flow restriction due to micro-debris in the secondary cooling radiator circuit.',
      steps: [
        'Drain engine coolant circuit completely.',
        'Unmount electric coolant pump and clean inlet/outlet hose junctions.',
        'Install new high-flow brushless coolant pump and flush coolant lines.',
        'Refill system with ethylene glycol mixture and vacuum bleed to eliminate air bubbles.'
      ],
      parts: 'Brushless Coolant Pump, Ethylene Glycol Coolant Pack',
      hours: '4.5 hrs'
    },
    'rec-4': {
      cause: 'Traction motor drive-end rotor bearings exhibiting micro-wear anomalies detectable only at speeds above 8,500 RPM.',
      steps: [
        'Lift vehicle and inspect motor mount brackets for structural micro-cracks.',
        'Unhook motor coupling shaft and inspect dust seals.',
        'Clean and replace motor drive bearings with high-temp ceramic variants.',
        'Perform rotor alignment calibration and vibration analysis.'
      ],
      parts: 'Ceramic Bearing Set, Rotor Dust Seal, Vibration Isolation Dampeners',
      hours: '8.0 hrs'
    }
  };

  // Past Maintenance Records
  const historyLog = [
    { date: '2026-06-25', vehicle: 'EV-001', component: 'Battery Pack', action: 'Cell balancing calibration', cost: '₹8,000', tech: 'Technician A', status: 'Completed' },
    { date: '2026-06-20', vehicle: 'EV-003', component: 'BMS System', action: 'Firmware update & sensor check', cost: '₹4,500', tech: 'Technician B', status: 'Completed' },
    { date: '2026-06-18', vehicle: 'EV-002', component: 'Cooling System', action: 'Coolant line flush & refill', cost: '₹6,200', tech: 'Technician A', status: 'Completed' },
    { date: '2026-06-15', vehicle: 'EV-004', component: 'Charging Port', action: 'Fast charge contact pins cleaning', cost: '₹2,500', tech: 'Technician B', status: 'Completed' },
    { date: '2026-06-10', vehicle: 'EV-001', component: 'Inverter', action: 'Capacitor inspect & signal tune', cost: '₹11,000', tech: 'Technician A', status: 'Completed' },
    { date: '2026-06-05', vehicle: 'EV-003', component: 'Traction Motor', action: 'Tightened engine mounting bolts', cost: '₹3,200', tech: 'Technician B', status: 'Completed' },
    { date: '2026-06-01', vehicle: 'EV-002', component: 'Braking System', action: 'Regen pads inspection & update', cost: '₹9,800', tech: 'Technician A', status: 'Completed' },
    { date: '2026-05-28', vehicle: 'EV-004', component: 'Suspension', action: 'Front shock absorber dampening check', cost: '₹5,000', tech: 'Technician B', status: 'Completed' },
    { date: '2026-05-20', vehicle: 'EV-001', component: 'Auxiliary System', action: '12V lead-acid battery replacement', cost: '₹4,500', tech: 'Technician A', status: 'Completed' },
    { date: '2026-05-15', vehicle: 'EV-002', component: 'Tires', action: 'Wheel balancing and rotation', cost: '₹3,500', tech: 'Technician B', status: 'Completed' }
  ];

  // PDF Export of Recommendations
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFont('helvetica');

      // Title & Header
      doc.setFontSize(20);
      doc.setTextColor(16, 185, 129);
      doc.text('AI Predictive Maintenance Forecast', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated by Edge AI ECU Models — ${new Date().toLocaleDateString()}`, 14, 26);

      // Recommendations Table
      const headers = [['Vehicle', 'Component', 'Issue Description', 'Urgency', 'Recommended Action', 'Est. Cost', 'Confidence']];
      const data = recommendations.map(rec => [
        rec.vehicle,
        rec.component,
        rec.issue,
        rec.urgency,
        rec.action,
        `INR ${rec.cost.toLocaleString()}`,
        `${rec.confidence}%`
      ]);

      doc.autoTable({
        startY: 32,
        head: headers,
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9, cellPadding: 3 }
      });

      // Save PDF
      doc.save(`EV_Predictive_Maintenance_Recommendations_${new Date().toISOString().slice(0,10)}.pdf`);
      
      setToast({ show: true, message: 'Recommendations PDF exported successfully' });
      setTimeout(() => setToast({ show: false, message: '' }), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  // Skeleton view
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 overflow-y-auto flex-1">
        {/* Section 1 skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl border border-slate-800/40 bg-slate-900/10">
              <Skeleton width="40%" height="12px" />
              <Skeleton width="60%" height="24px" className="mt-2" />
            </div>
          ))}
        </div>

        {/* Section 2 skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800/40 bg-slate-900/10 space-y-4">
              <Skeleton width="30%" height="16px" />
              <Skeleton width="90%" height="40px" />
              <Skeleton width="50%" height="16px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Active view
  return (
    <main 
      className="p-6 space-y-6 overflow-y-auto flex-1 transition-opacity duration-500"
      style={{ opacity }}
    >
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-400" />
            AI Predictive Maintenance Recommendations
          </h2>
          <p className="text-xs text-slate-400 mt-1">Generated by Edge AI Isolation Forest model deployed on vehicle ECU — 30 Days Forecast</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700/50 rounded-xl transition-all cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export Recommendations PDF</span>
        </button>
      </div>

      {/* SECTION 1: Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl glow-blue relative overflow-hidden border border-slate-850">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Pending Services</p>
          <h3 className="text-3xl font-extrabold mt-2 text-blue-400">5</h3>
          <div className="absolute right-4 bottom-4 p-2 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/10">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl glow-red relative overflow-hidden border border-red-500/10">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Critical Services</p>
          <h3 className="text-3xl font-extrabold mt-2 text-red-500">1</h3>
          <div className="absolute right-4 bottom-4 p-2 bg-red-500/10 rounded-xl text-red-500 border border-red-500/10">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl glow-yellow relative overflow-hidden border border-amber-500/10">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Estimated Total Cost</p>
          <h3 className="text-3xl font-extrabold mt-2 text-amber-400">₹70,500</h3>
          <div className="absolute right-4 bottom-4 p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/10">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl glow-blue relative overflow-hidden border border-slate-850">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Next Scheduled Service</p>
          <h3 className="text-xl font-extrabold mt-2 text-slate-100">EV-002</h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1">July 3rd</p>
          <div className="absolute right-4 bottom-4 p-2 bg-slate-500/10 rounded-xl text-slate-400 border border-slate-850">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SECTION 2: AI Recommendation cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          Active ECU Diagnostic Forecasts
        </h3>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[...recommendations]
            .sort((a, b) => {
              const priority = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
              return priority[b.urgency] - priority[a.urgency];
            })
            .map((rec) => {
              const recDetails = expandedDetails[rec.id];
              const isEv3 = rec.vehicle === 'EV-003';
              
              let urgencyBg = 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60';
              let urgencyGlow = 'glow-green';
              if (rec.urgency === 'Critical') {
                urgencyBg = 'bg-red-950/40 text-red-400 border-red-900/60';
                urgencyGlow = 'glow-red animate-pulse-glow';
              } else if (rec.urgency === 'High') {
                urgencyBg = 'bg-orange-950/40 text-orange-400 border-orange-900/60';
                urgencyGlow = 'glow-orange';
              } else if (rec.urgency === 'Medium') {
                urgencyBg = 'bg-amber-950/40 text-amber-400 border-amber-900/60';
                urgencyGlow = 'glow-yellow';
              }

              // Color meter
              let meterColor = 'bg-emerald-500';
              if (rec.confidence < 75) {
                meterColor = 'bg-orange-500';
              } else if (rec.confidence < 90) {
                meterColor = 'bg-amber-500';
              }

              // Component icons mapping
              const compIcon = () => {
                if (rec.icon === 'Battery') return <Battery className="w-4 h-4 text-emerald-400" />;
                if (rec.icon === 'Zap') return <Zap className="w-4 h-4 text-amber-400" />;
                if (rec.icon === 'Thermometer') return <Thermometer className="w-4 h-4 text-sky-400" />;
                return <Cpu className="w-4 h-4 text-purple-400" />;
              };

              return (
                <div
                  key={rec.id}
                  className={`glass-card p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${urgencyGlow} ${
                    isEv3 && isEv3Spiking ? 'border-red-500 animate-pulse-red' : 'border-slate-800/60'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${urgencyBg}`}>
                        {rec.vehicle} • {rec.urgency}
                      </span>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/60 border border-slate-800 rounded-xl">
                        {compIcon()}
                        <span className="text-xs font-bold text-slate-200">{rec.component}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <h4 className="text-sm font-extrabold text-slate-100 uppercase tracking-wide mb-1.5">
                      {rec.issue}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      {recDetails.cause}
                    </p>

                    {/* Steps / Diagnostics */}
                    <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-3.5 space-y-2 mb-4">
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Recommended Actions:</p>
                      <ul className="space-y-1.5">
                        {recDetails.steps.map((step, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                            <span className="text-emerald-500 font-bold shrink-0">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                      <div className="bg-slate-900/30 border border-slate-800/40 rounded-xl py-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Parts Required</span>
                        <span className="text-xs font-bold text-slate-300 truncate block px-2" title={recDetails.parts}>
                          {recDetails.parts}
                        </span>
                      </div>
                      <div className="bg-slate-900/30 border border-slate-800/40 rounded-xl py-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Labor Hours</span>
                        <span className="text-xs font-bold text-amber-400 block">{recDetails.hours}</span>
                      </div>
                      <div className="bg-slate-900/30 border border-slate-800/40 rounded-xl py-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Est. Cost</span>
                        <span className="text-xs font-extrabold text-slate-200 block">₹{rec.cost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Confidence block & Actions */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/40">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1.5">
                      <span className="font-semibold uppercase tracking-wider">AI Model Confidence Score</span>
                      <span className="font-bold text-slate-200">{rec.confidence}%</span>
                    </div>

                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/40 mb-5">
                      <div
                        className={`h-full ${meterColor} rounded-full`}
                        style={{ width: `${rec.confidence}%` }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(rec.vehicle, rec.issue)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/20 cursor-pointer text-center"
                      >
                        Schedule Service
                      </button>
                      <button
                        onClick={() => setToast({ show: true, message: `Confidence detail diagnostic info logs copied for ${rec.vehicle}` })}
                        className="px-3.5 py-2.5 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* SECTION 3: Charts Grid (Timeline & Cost Pie) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              30-Day Scheduled Services Timeline
            </h3>
            <p className="text-xs text-slate-400 mt-1">Weekly volume projection classified by urgency parameters</p>
          </div>

          <div className="h-64 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#151c2c', borderColor: '#1f293d' }} />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="Critical" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="High" stackId="a" fill="#f97316" />
                <Bar dataKey="Medium" stackId="a" fill="#eab308" />
                <Bar dataKey="Low" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Breakdown Pie Chart */}
        <div className="glass-card p-6 rounded-2xl border border-slate-800/60">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Maintenance Cost Breakdown (₹70,500)
            </h3>
            <p className="text-xs text-slate-400 mt-1">Cost distribution across components under risk forecast</p>
          </div>

          <div className="h-64 w-full mt-6 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Cost']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2.5 w-full sm:w-1/2">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="text-slate-400 font-medium">{item.vehicle} • {item.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-200">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: History Log Table */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Historical Maintenance Logs
            </h3>
            <p className="text-xs text-slate-400 mt-1">Archived log of vehicle services performed across the active fleet</p>
          </div>
          <button
            onClick={() => setToast({ show: true, message: 'Exporting historical archives to CSV...' })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-400 hover:text-slate-200 rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
            <span>Export Logs CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4 font-bold">Date</th>
                <th className="py-3 px-4 font-bold">Vehicle</th>
                <th className="py-3 px-4 font-bold">Component</th>
                <th className="py-3 px-4 font-bold">Action Taken</th>
                <th className="py-3 px-4 font-bold">Cost</th>
                <th className="py-3 px-4 font-bold">Technician</th>
                <th className="py-3 px-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/60">
              {historyLog.map((log, index) => {
                let badgeClass = 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60';
                if (log.status === 'Overdue') {
                  badgeClass = 'bg-red-950/40 text-red-400 border-red-900/60';
                } else if (log.status === 'Pending') {
                  badgeClass = 'bg-amber-950/40 text-amber-400 border-amber-900/60';
                }

                return (
                  <tr key={index} className="hover:bg-slate-900/20 transition-colors">
                    <td className="py-3 px-4 text-slate-300 font-mono">{log.date}</td>
                    <td className="py-3 px-4 text-slate-100 font-extrabold">{log.vehicle}</td>
                    <td className="py-3 px-4 text-slate-200">{log.component}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{log.action}</td>
                    <td className="py-3 px-4 text-slate-200 font-bold">{log.cost}</td>
                    <td className="py-3 px-4 text-slate-400">{log.tech}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase ${badgeClass}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SCHEDULE MAINTENANCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all duration-300">
          <div className="bg-[#121824] border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">
              Schedule Maintenance for {selectedVehicle}
            </h3>
            <p className="text-xs text-slate-400 font-semibold mb-4 uppercase">
              {selectedIssue}
            </p>

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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/20 cursor-pointer text-center"
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
