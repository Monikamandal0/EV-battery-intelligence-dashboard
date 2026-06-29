// Mock telemetry and analytic data for EV Battery Intelligence Dashboard

// 12 Months Battery Capacity Degradation (%)
export const degradationData = [
  { month: 'Jul 25', 'EV-001': 99.2, 'EV-002': 98.5, 'EV-003': 97.8 },
  { month: 'Aug 25', 'EV-001': 97.8, 'EV-002': 96.1, 'EV-003': 95.2 },
  { month: 'Sep 25', 'EV-001': 96.0, 'EV-002': 93.8, 'EV-003': 91.5 },
  { month: 'Oct 25', 'EV-001': 94.5, 'EV-002': 90.2, 'EV-003': 88.0 },
  { month: 'Nov 25', 'EV-001': 93.1, 'EV-002': 87.5, 'EV-003': 82.4 },
  { month: 'Dec 25', 'EV-001': 91.4, 'EV-002': 84.9, 'EV-003': 79.1 },
  { month: 'Jan 26', 'EV-001': 89.8, 'EV-002': 81.3, 'EV-003': 73.5 },
  { month: 'Feb 26', 'EV-001': 88.1, 'EV-002': 77.8, 'EV-003': 66.8 },
  { month: 'Mar 26', 'EV-001': 86.5, 'EV-002': 73.2, 'EV-003': 58.4 },
  { month: 'Apr 26', 'EV-001': 84.9, 'EV-002': 69.0, 'EV-003': 51.2 },
  { month: 'May 26', 'EV-001': 83.2, 'EV-002': 64.8, 'EV-003': 44.9 },
  { month: 'Jun 26', 'EV-001': 82.0, 'EV-002': 61.0, 'EV-003': 38.0 },
];

// Charge cycles per day (last 7 days)
export const chargeCycleData = [
  { day: 'Mon', cycles: 42, average: 45 },
  { day: 'Tue', cycles: 48, average: 45 },
  { day: 'Wed', cycles: 55, average: 45 },
  { day: 'Thu', cycles: 39, average: 45 },
  { day: 'Fri', cycles: 51, average: 45 },
  { day: 'Sat', cycles: 34, average: 45 },
  { day: 'Sun', cycles: 47, average: 45 }, // Today's cycles = 47
];

// Battery Health Cards (per vehicle)
export const vehicleHealthData = [
  {
    id: 'EV-001',
    healthScore: 82,
    status: 'healthy', // healthy | warning | critical
    estimatedRange: 345, // km
    lastCharged: '2 hours ago',
    soc: 88, // State of Charge %
    temp: 34.2, // °C
    voltage: 398, // V
    cycles: 184,
  },
  {
    id: 'EV-002',
    healthScore: 61,
    status: 'warning',
    estimatedRange: 256,
    lastCharged: '45 mins ago',
    soc: 72,
    temp: 42.8, // high temp
    voltage: 391,
    cycles: 312,
  },
  {
    id: 'EV-003',
    healthScore: 38,
    status: 'critical',
    estimatedRange: 142,
    lastCharged: '5 hours ago',
    soc: 45,
    temp: 49.5, // critical temp
    voltage: 368, // drop voltage
    cycles: 428,
  },
  {
    id: 'EV-004',
    healthScore: 91,
    status: 'healthy',
    estimatedRange: 378,
    lastCharged: '30 mins ago',
    soc: 95,
    temp: 31.2,
    voltage: 402,
    cycles: 64,
  },
];

// Range Prediction Panel data
export const rangePredictionData = [
  {
    vehicle: 'EV-001',
    batteryPercent: 88,
    temperature: 34.2,
    predictedRange: 345,
    status: 'Optimal', // Optimal | Degraded | Restricted
    severity: 'success',
  },
  {
    vehicle: 'EV-002',
    batteryPercent: 72,
    temperature: 42.8,
    predictedRange: 256,
    status: 'Thermal Advisory',
    severity: 'warning',
  },
  {
    vehicle: 'EV-003',
    batteryPercent: 45,
    temperature: 49.5,
    predictedRange: 142,
    status: 'Critical Degradation',
    severity: 'error',
  },
  {
    vehicle: 'EV-004',
    batteryPercent: 95,
    temperature: 29.8,
    predictedRange: 405,
    status: 'Optimal',
    severity: 'success',
  },
  {
    vehicle: 'EV-005',
    batteryPercent: 60,
    temperature: 31.5,
    predictedRange: 228,
    status: 'Optimal',
    severity: 'success',
  },
];

// Live Alerts Feed
export const alertsFeed = [
  {
    id: 'alt-1',
    vehicle: 'EV-003',
    message: 'Thermal Runaway Risk: Cell Group 4 exceeded 49°C',
    severity: 'critical',
    timestamp: '11:21:05',
    type: 'thermal',
  },
  {
    id: 'alt-2',
    vehicle: 'EV-003',
    message: 'Critical cell voltage drop: Cell #18 read 3.12V',
    severity: 'critical',
    timestamp: '11:18:42',
    type: 'voltage',
  },
  {
    id: 'alt-3',
    vehicle: 'EV-002',
    message: 'Charging anomaly: high contactor impedance detected',
    severity: 'warning',
    timestamp: '11:15:30',
    type: 'charging',
  },
  {
    id: 'alt-4',
    vehicle: 'EV-002',
    message: 'Thermal Advisory: Elevated pack cooling flow rate',
    severity: 'warning',
    timestamp: '10:58:12',
    type: 'thermal',
  },
  {
    id: 'alt-5',
    vehicle: 'EV-001',
    message: 'Regenerative braking torque restricted: battery temperature low',
    severity: 'warning',
    timestamp: '10:45:00',
    type: 'charging',
  },
  {
    id: 'alt-6',
    vehicle: 'EV-004',
    message: 'Charge cycle completed: 100% capacity balance achieved',
    severity: 'info',
    timestamp: '10:12:35',
    type: 'nominal',
  },
  {
    id: 'alt-7',
    vehicle: 'EV-001',
    message: 'State of Health (SoH) recalibrated to 82% after slow charge',
    severity: 'info',
    timestamp: '09:30:11',
    type: 'nominal',
  },
];
