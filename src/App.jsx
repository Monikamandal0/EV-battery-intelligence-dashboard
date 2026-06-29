import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import BatteryHealth from './pages/BatteryHealth';
import ChargeHistory from './pages/ChargeHistory';
import RangePredictor from './pages/RangePredictor';
import FleetMap from './pages/FleetMap';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import { vehicleHealthData, alertsFeed } from './data/mockData';

const alertTemplates = [
  { message: "Thermal Runaway Risk: Cell Group exceeded 49°C", severity: "critical", type: "thermal" },
  { message: "Critical cell voltage drop detected", severity: "critical", type: "voltage" },
  { message: "Charging anomaly: high impedance detected", severity: "warning", type: "charging" },
  { message: "Pack temperature stabilizing", severity: "info", type: "nominal" },
  { message: "SOH drop detected — service recommended", severity: "warning", type: "charging" }
];

const playThermalWarningSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    // Three descending beeps — subtle warning tone
    [0, 0.3, 0.6].forEach((delay, i) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880 - i * 110, audioCtx.currentTime + delay);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + delay + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + delay + 0.25);

      oscillator.start(audioCtx.currentTime + delay);
      oscillator.stop(audioCtx.currentTime + delay + 0.3);
    });
  } catch (err) {
    console.log('Audio not available:', err);
  }
};

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vehicles, setVehicles] = useState(vehicleHealthData);
  const [alerts, setAlerts] = useState([
    ...alertsFeed,
    {
      id: 'alt-8',
      vehicle: 'EV-004',
      message: 'Pack health recalibration completed',
      severity: 'warning',
      timestamp: '09:12:04',
      type: 'charging'
    }
  ]);

  // Alert Thresholds and Config Preferences state
  const [settings, setSettings] = useState({
    thermalTriggerTemp: 49.0,
    criticalSohThreshold: 35.0,
    alertRefreshInterval: 8,
    emailAlerts: true,
    soundAlerts: false,
    autoIsolate: false
  });

  const [recommendations, setRecommendations] = useState([
    {
      id: 'rec-1',
      vehicle: 'EV-003',
      component: 'Battery Pack',
      icon: 'Battery',
      issue: 'Cell group 4 degrading rapidly',
      urgency: 'Critical',
      urgencyText: 'Act within 3 days',
      action: 'Replace cell group 4 immediately',
      cost: 45000,
      confidence: 94
    },
    {
      id: 'rec-2',
      vehicle: 'EV-002',
      component: 'Charging Contactor',
      icon: 'Zap',
      issue: 'High impedance detected',
      urgency: 'High',
      urgencyText: 'Act within 7 days',
      action: 'Inspect and replace contactor',
      cost: 12000,
      confidence: 88
    },
    {
      id: 'rec-3',
      vehicle: 'EV-001',
      component: 'Cooling System',
      icon: 'Thermometer',
      issue: 'Pack temp trending upward',
      urgency: 'Medium',
      urgencyText: 'Act within 14 days',
      action: 'Service cooling pump',
      cost: 8500,
      confidence: 79
    },
    {
      id: 'rec-4',
      vehicle: 'EV-004',
      component: 'Traction Motor',
      icon: 'Cpu',
      issue: 'Minor vibration anomaly',
      urgency: 'Low',
      urgencyText: 'Act within 30 days',
      action: 'Schedule motor inspection',
      cost: 5000,
      confidence: 68
    }
  ]);

  // Live update of one recommendation's confidence score every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRecommendations(prev => {
        const idx = Math.floor(Math.random() * prev.length);
        return prev.map((rec, i) => {
          if (i === idx) {
            const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const newConfidence = Math.max(50, Math.min(99, rec.confidence + delta));
            return { ...rec, confidence: newConfidence };
          }
          return rec;
        });
      });
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Warning Popup and Toast States
  const [showWarning, setShowWarning] = useState(false);
  const [isSnoozed, setIsSnoozed] = useState(false);
  const [detectionTime, setDetectionTime] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  // Watch EV-003 telemetry for thermal warning triggers
  const ev3 = vehicles.find(v => v.id === 'EV-003');
  const isEv3Anomaly = ev3 && ev3.status !== 'ISOLATED' && (
    ev3.temp > settings.thermalTriggerTemp || ev3.healthScore < settings.criticalSohThreshold
  );

  // If auto-isolate is on, automatically trigger isolation instead of showing popup
  useEffect(() => {
    if (isEv3Anomaly) {
      if (settings.autoIsolate) {
        handleIsolateVehicle();
      } else if (!isSnoozed && !showWarning) {
        setShowWarning(true);
        playThermalWarningSound();
        if (!detectionTime) {
          setDetectionTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    } else {
      setShowWarning(false);
      setDetectionTime('');
    }
  }, [isEv3Anomaly, isSnoozed, settings.autoIsolate]);

  const handleDismissWarning = () => {
    setShowWarning(false);
    setIsSnoozed(true);
    // Snooze warning for 30 seconds
    setTimeout(() => {
      setIsSnoozed(false);
    }, 30000);
  };

  const handleIsolateVehicle = (autoIsolated = false) => {
    console.log('[FLEET SERVICE] Vehicle EV-003 successfully isolated from grid.');
    setVehicles(prevVehicles => prevVehicles.map(v => {
      if (v.id === 'EV-003') {
        return { 
          ...v, 
          status: 'ISOLATED'
        };
      }
      return v;
    }));

    // Trigger success toast
    setToast({ show: true, message: autoIsolated ? 'Vehicle EV-003 auto-isolated successfully' : 'Vehicle EV-003 isolated successfully' });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4000);

    // Prepend a critical alert to the alerts feed
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newAlert = {
      id: `alt-${Date.now()}`,
      vehicle: 'EV-003',
      message: autoIsolated 
        ? 'EV-003 auto-isolated by Edge AI — no technician response detected'
        : 'Grid Disconnection: EV-003 isolated successfully due to thermal threat.',
      severity: 'critical',
      timestamp: timestamp,
      type: 'thermal'
    };
    setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 7));

    setShowWarning(false);
  };

  const handleAlertTechnician = () => {
    setToast({ show: true, message: 'Technician notified via edge network' });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 4000);
  };

  // 1. Telemetry Clock Timer (Every 1 second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Battery Health and Status Fluctuation Timer (Every 5 seconds)
  useEffect(() => {
    const healthTimer = setInterval(() => {
      setVehicles(prevVehicles => prevVehicles.map(vehicle => {
        if (vehicle.status === 'ISOLATED') return vehicle;

        if (['EV-001', 'EV-002', 'EV-003', 'EV-004'].includes(vehicle.id)) {
          const change = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, 1, 2
          let newSoh = vehicle.healthScore + change;

          // Enforce bounds per vehicle
          if (vehicle.id === 'EV-001') newSoh = Math.max(80, Math.min(85, newSoh));
          if (vehicle.id === 'EV-002') newSoh = Math.max(58, Math.min(64, newSoh));
          if (vehicle.id === 'EV-003') newSoh = Math.max(35, Math.min(41, newSoh));
          if (vehicle.id === 'EV-004') newSoh = Math.max(89, Math.min(93, newSoh));

          // Dynamically adjust status based on SOH threshold settings
          let newStatus = 'healthy';
          if (newSoh < settings.criticalSohThreshold) {
            newStatus = 'critical';
          } else if (newSoh < 65) {
            newStatus = 'warning';
          }

          return {
            ...vehicle,
            healthScore: newSoh,
            status: newStatus
          };
        }
        return vehicle;
      }));
    }, 5000);

    return () => clearInterval(healthTimer);
  }, [settings.criticalSohThreshold]);

  // 3. Pack Temperature Fluctuation Timer (Every 6 seconds)
  useEffect(() => {
    const tempTimer = setInterval(() => {
      setVehicles(prevVehicles => prevVehicles.map(vehicle => {
        if (vehicle.status === 'ISOLATED') return vehicle;

        let change = (Math.random() * 1.6 - 0.8); // -0.8°C to +0.8°C
        let newTemp = vehicle.temp + change;

        if (vehicle.id === 'EV-003') {
          // Occasionally spike above trigger temp
          newTemp = Math.max(46.5, Math.min(settings.thermalTriggerTemp + 2.5, newTemp));
        } else {
          // Standard nominal bounds
          if (vehicle.id === 'EV-001') newTemp = Math.max(32, Math.min(36, newTemp));
          if (vehicle.id === 'EV-002') newTemp = Math.max(40, Math.min(45, newTemp));
          if (vehicle.id === 'EV-004') newTemp = Math.max(30, Math.min(33, newTemp));
        }

        let socChange = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        let newSoc = Math.max(10, Math.min(100, vehicle.soc + socChange));
        
        let baseRange = vehicle.id === 'EV-001' ? 390 : vehicle.id === 'EV-002' ? 350 : vehicle.id === 'EV-003' ? 310 : 440;
        let newRange = Math.round(baseRange * (newSoc / 100) * (vehicle.healthScore / 100));

        return {
          ...vehicle,
          temp: parseFloat(newTemp.toFixed(1)),
          soc: newSoc,
          estimatedRange: newRange
        };
      }));
    }, 6000);

    return () => clearInterval(tempTimer);
  }, [settings.thermalTriggerTemp]);

  // 4. Live Alerts Injector Timer (Every 8 seconds - Dynamic Interval)
  useEffect(() => {
    const alertTimer = setInterval(() => {
      const randomTemplate = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const randomVehicle = `EV-00${Math.floor(Math.random() * 4) + 1}`;

      const newAlert = {
        id: `alt-${Date.now()}`,
        vehicle: randomVehicle,
        message: randomTemplate.message,
        severity: randomTemplate.severity,
        timestamp: timestamp,
        type: randomTemplate.type
      };

      setAlerts(prevAlerts => [newAlert, ...prevAlerts].slice(0, 7));
    }, settings.alertRefreshInterval * 1000);

    return () => clearInterval(alertTimer);
  }, [settings.alertRefreshInterval]);

  const handleTriggerTelemetryRefresh = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newAlerts = [
      {
        id: `alt-${Date.now()}`,
        vehicle: `EV-00${Math.floor(Math.random() * 4) + 1}`,
        message: `Manual telemetry sync: all sensors balanced.`,
        severity: 'info',
        timestamp: timestamp,
        type: 'nominal'
      },
      ...alerts
    ];
    setAlerts(newAlerts.slice(0, 7));
  };

  // Derive dashboard statistics dynamically from live state
  const avgHealth = Math.round(vehicles.reduce((sum, v) => sum + v.healthScore, 0) / vehicles.length);
  const criticalCount = vehicles.filter(v => v.status === 'critical' || v.healthScore < settings.criticalSohThreshold).length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical').length;
  const warningAlertsCount = alerts.filter(a => a.severity === 'warning').length;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout
            vehicles={vehicles}
            setVehicles={setVehicles}
            alerts={alerts}
            setAlerts={setAlerts}
            toast={toast}
            setToast={setToast}
            showWarning={showWarning}
            setShowWarning={setShowWarning}
            detectionTime={detectionTime}
            setDetectionTime={setDetectionTime}
            settings={settings}
            setSettings={setSettings}
            handleTriggerTelemetryRefresh={handleTriggerTelemetryRefresh}
            currentTime={currentTime}
            avgHealth={avgHealth}
            criticalCount={criticalCount}
            criticalAlertsCount={criticalAlertsCount}
            warningAlertsCount={warningAlertsCount}
            handleIsolateVehicle={handleIsolateVehicle}
            handleAlertTechnician={handleAlertTechnician}
            handleDismissWarning={handleDismissWarning}
            recommendations={recommendations}
            setRecommendations={setRecommendations}
          />
        }>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="battery-health" element={<BatteryHealth />} />
          <Route path="charge-history" element={<ChargeHistory />} />
          <Route path="range-predictor" element={<RangePredictor />} />
          <Route path="fleet-map" element={<FleetMap />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
