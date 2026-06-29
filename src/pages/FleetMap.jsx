import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix default Leaflet marker icon issue in React using ES6 imports
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// India Coordinates configuration
const coordinates = {
  'EV-001': [19.0760, 72.8777],   // Mumbai
  'EV-002': [28.6139, 77.2090],   // Delhi
  'EV-003': [12.9716, 77.5946],   // Bangalore
  'EV-004': [13.0827, 80.2707],   // Chennai
};

const Skeleton = ({ width = '100%', height = '20px', borderRadius = '6px', circle = false }) => (
  <div className="skeleton" style={{
    width: circle ? height : width,
    height,
    borderRadius: circle ? '50%' : borderRadius,
    marginBottom: '8px'
  }} />
);

const FleetMapSkeleton = () => (
  <div className="p-6 space-y-6 overflow-hidden flex-1 flex flex-col h-full">
    <div>
      <Skeleton width="25%" height="24px" />
      <Skeleton width="45%" height="14px" className="mt-1" />
    </div>

    <div className="flex justify-between items-center gap-4 flex-wrap">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} width="120px" height="30px" borderRadius="15px" />
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton width="120px" height="36px" borderRadius="10px" />
        <Skeleton width="120px" height="36px" borderRadius="10px" />
      </div>
    </div>

    <div className="flex-1 w-full rounded-2xl border border-slate-800/60 overflow-hidden relative min-h-[500px]">
      <div className="w-full h-full skeleton" />
      
      <div className="absolute bottom-6 right-6 z-10 glass-panel bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3 w-[160px]">
        <Skeleton width="80%" height="10px" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton width="10px" height="10px" circle={true} />
              <Skeleton width="70%" height="8px" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Map Instance Capturing sub-component
function MapInstanceCapture({ setMap }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      setMap(map);
    }
  }, [map]);
  return null;
}

export default function FleetMap() {
  const { vehicles, alerts } = useOutletContext();
  const navigate = useNavigate();
  const [map, setMap] = useState(null);
  const markerRefs = useRef({});

  const [pageLoading, setPageLoading] = useState(true);
  const [pageOpacity, setPageOpacity] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
      setTimeout(() => setPageOpacity(1), 50);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  // Dynamic status counts
  const healthyCount = vehicles.filter(v => v.status === 'healthy').length;
  const warningCount = vehicles.filter(v => v.status === 'warning').length;
  const criticalCount = vehicles.filter(v => v.status === 'critical' || v.status === 'ISOLATED').length;

  // Custom marker pin generator
  const createCustomIcon = (status, id) => {
    let pinColor = '#10B981'; // Healthy green
    let shadowColor = 'rgba(16, 185, 129, 0.4)';
    
    if (status === 'warning') {
      pinColor = '#F59E0B'; // Warning yellow
      shadowColor = 'rgba(245, 158, 11, 0.4)';
    } else if (status === 'critical') {
      pinColor = '#EF4444'; // Critical red
      shadowColor = 'rgba(239, 68, 68, 0.5)';
    } else if (status === 'ISOLATED') {
      pinColor = '#94A3B8'; // Isolated gray
      shadowColor = 'rgba(148, 163, 184, 0.3)';
    }

    const isCritical = status === 'critical';

    return L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          ${isCritical ? `
            <span class="absolute w-8 h-8 rounded-full bg-red-500/30 animate-ping"></span>
            <span class="absolute w-12 h-12 rounded-full bg-red-500/20 animate-pulse"></span>
          ` : ''}
          ${id === 'EV-003' && !isCritical ? `
            <span class="absolute w-10 h-10 rounded-full bg-red-500/10 animate-pulse"></span>
          ` : ''}
          <div class="w-4 h-4 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-lg" 
               style="background-color: ${pinColor}; box-shadow: 0 0 10px ${shadowColor};">
            <div class="w-1 h-1 rounded-full bg-slate-950/80"></div>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -10]
    });
  };

  // Zoom map to show all 4 pins
  const handleFitAll = () => {
    if (map) {
      const bounds = L.latLngBounds(Object.values(coordinates));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // Fly to EV-003 Bangalore and open popup
  const handleCenterOnCritical = () => {
    if (map && markerRefs.current['EV-003']) {
      const coords = coordinates['EV-003'];
      map.flyTo(coords, 8, { duration: 1.2 });
      setTimeout(() => {
        markerRefs.current['EV-003'].openPopup();
      }, 1250);
    }
  };

  return pageLoading ? (
    <FleetMapSkeleton />
  ) : (
    <div className="p-6 space-y-6 overflow-hidden flex-1 flex flex-col h-full animate-fade-in" style={{ opacity: pageOpacity, transition: 'opacity 0.5s ease' }}>
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          Active Fleet Mapping
        </h2>
        <p className="text-xs text-slate-400 mt-1">Live geographic tracking of fleet assets, diagnostic indicators, and operational regions</p>
      </div>

      {/* Stats and Controls Row */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        
        {/* Quick stat pills */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="px-3.5 py-1.5 bg-slate-900 border border-slate-800/80 rounded-full text-xs font-bold text-slate-300">
            📍 {vehicles.length} Vehicles Tracked
          </span>
          <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-bold">
            🟢 {healthyCount} Healthy
          </span>
          <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-bold">
            🟡 {warningCount} Warning
          </span>
          <span className="px-3.5 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-bold">
            🔴 {criticalCount} Critical
          </span>
        </div>

        {/* Map controls buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleFitAll}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/40 rounded-xl text-xs font-bold transition-colors"
          >
            Fit All Vehicles
          </button>
          <button
            onClick={handleCenterOnCritical}
            className="py-2 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors animate-pulse-glow"
          >
            Center on Critical
          </button>
        </div>
      </div>

      {/* Leaflet Map Area */}
      <div className="flex-1 w-full rounded-2xl border border-slate-800/60 overflow-hidden relative min-h-[500px] z-10 shadow-inner">
        <MapContainer
          center={[20.5937, 78.9629]} // Center of India
          zoom={5}
          className="w-full h-full"
          zoomControl={true}
        >
          {/* Capture map instance */}
          <MapInstanceCapture setMap={setMap} />

          {/* CartoDB Dark Matter base tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Render markers */}
          {vehicles.map((v) => {
            const coords = coordinates[v.id];
            if (!coords) return null;

            const isIsolated = v.status === 'ISOLATED';
            const vehicleAlert = alerts.find(a => a.vehicle === v.id)?.message || 'No active fault alerts logged.';

            return (
              <Marker
                key={v.id}
                position={coords}
                icon={createCustomIcon(v.status, v.id)}
                ref={el => {
                  if (el) markerRefs.current[v.id] = el;
                }}
              >
                {/* Custom dark-themed popup */}
                <Popup>
                  <div className="w-[220px] p-1 space-y-3 text-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-black text-white">{v.id}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        v.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        v.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {isIsolated ? 'ISOLATED' : v.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>SOH Capacity</span>
                        <span className="font-bold font-mono text-slate-200">{isIsolated ? '0' : v.healthScore}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div className={`h-full ${
                          isIsolated ? 'bg-slate-600' :
                          v.healthScore > 70 ? 'bg-emerald-500' :
                          v.healthScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`} style={{ width: `${isIsolated ? 0 : v.healthScore}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                      <div>
                        <span className="text-slate-500 block">Temperature</span>
                        <span className="font-bold text-slate-300 font-mono">{isIsolated ? '—' : `${v.temp}°C`}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Est. Range</span>
                        <span className="font-bold text-slate-300 font-mono">{isIsolated ? '0' : v.estimatedRange} km</span>
                      </div>
                      <div className="col-span-2 border-t border-slate-800/60 pt-1 mt-1">
                        <span className="text-slate-500 block">Last Charged</span>
                        <span className="font-semibold text-slate-300">{v.lastCharged}</span>
                      </div>
                    </div>

                    <div className="text-[9px] bg-slate-950/40 border border-slate-900/60 p-2 rounded-lg text-slate-400 leading-normal">
                      <span className="font-bold text-slate-300 block mb-0.5 uppercase tracking-wider">Latest Alert</span>
                      {vehicleAlert}
                    </div>

                    <button
                      onClick={() => navigate('/battery-health', { state: { selectedVehicle: v.id } })}
                      className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider"
                    >
                      View Full Profile
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend Box Overlay */}
        <div className="absolute bottom-6 right-6 z-[400] glass-panel bg-slate-950/80 border border-slate-800/80 p-4 rounded-xl text-[10px] space-y-2 max-w-[180px] shadow-2xl pointer-events-auto leading-normal">
          <h4 className="font-bold text-white uppercase tracking-wider mb-1 text-[9px]">Fleet Status Legend</h4>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900"></span>
            <span className="text-slate-300 font-medium">Healthy vehicle</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-slate-900"></span>
            <span className="text-slate-300 font-medium">Warning — service required</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-slate-900"></span>
            <span className="text-slate-300 font-medium">Critical — immediate action</span>
          </div>
        </div>
      </div>

    </div>
  );
}
