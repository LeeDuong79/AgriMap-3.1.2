
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { 
  Thermometer, Droplets, Wind, CloudRain, 
  Map as MapIcon, Layers, Eye, EyeOff, 
  ChevronLeft, Info, Activity, Radio
} from 'lucide-react';

// Fix Leaflet icon issue - using a standard way that works with Vite
const DefaultIcon = L.divIcon({
  className: 'default-marker',
  html: '<div class="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-md"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});
L.Marker.prototype.options.icon = DefaultIcon;

const STATIONS = [
  { name: "TP.HCM", lat: 10.7626, lng: 106.6601, temp: 34, humidity: 65, soilMoisture: 60, rain: 5, wind: 8, updateTime: "10:30" },
  { name: "TP.HCM (Hóc Môn)", lat: 10.8833, lng: 106.5833, temp: 33, humidity: 62, soilMoisture: 55, rain: 0, wind: 6, updateTime: "10:45" },
  { name: "Cần Thơ", lat: 10.0371, lng: 105.7828, temp: 31, humidity: 72, soilMoisture: 60, rain: 5, wind: 8, updateTime: "10:25" },
  { name: "Cần Thơ (Thốt Nốt)", lat: 10.2833, lng: 105.5333, temp: 30, humidity: 75, soilMoisture: 65, rain: 2, wind: 7, updateTime: "10:50" },
  { name: "Đồng Nai", lat: 10.9574, lng: 106.8427, temp: 35, humidity: 58, soilMoisture: 60, rain: 5, wind: 8, updateTime: "10:40" },
  { name: "Đồng Nai (Long Khánh)", lat: 10.9333, lng: 107.2333, temp: 34, humidity: 60, soilMoisture: 58, rain: 0, wind: 9, updateTime: "10:55" },
  { name: "An Giang", lat: 10.5216, lng: 105.1259, temp: 30, humidity: 75, soilMoisture: 60, rain: 5, wind: 8, updateTime: "10:15" },
  { name: "An Giang (Châu Đốc)", lat: 10.7, lng: 105.1167, temp: 31, humidity: 70, soilMoisture: 62, rain: 0, wind: 10, updateTime: "11:00" },
  { name: "Lâm Đồng (Đà Lạt)", lat: 11.9404, lng: 108.4583, temp: 22, humidity: 85, soilMoisture: 60, rain: 5, wind: 8, updateTime: "09:50" },
  { name: "Lâm Đồng (Bảo Lộc)", lat: 11.5461, lng: 107.8025, temp: 25, humidity: 80, soilMoisture: 68, rain: 10, wind: 5, updateTime: "11:05" },
  { name: "Bến Tre", lat: 10.2435, lng: 106.3761, temp: 32, humidity: 68, soilMoisture: 60, rain: 5, wind: 8, updateTime: "10:35" },
  { name: "Bến Tre (Ba Tri)", lat: 10.05, lng: 106.6, temp: 31, humidity: 70, soilMoisture: 58, rain: 0, wind: 12, updateTime: "11:10" },
  { name: "Cà Mau", lat: 9.1769, lng: 105.1524, temp: 29, humidity: 80, soilMoisture: 60, rain: 5, wind: 8, updateTime: "10:05" },
  { name: "Cà Mau (Năm Căn)", lat: 8.75, lng: 104.9833, temp: 28, humidity: 82, soilMoisture: 65, rain: 8, wind: 15, updateTime: "11:15" },
];

// Heatmap Layer Component
const HeatmapLayer = ({ points, visible }: { points: any[], visible: boolean }) => {
  const map = useMap();

  useEffect(() => {
    if (!visible || !map) return;

    let heatLayer: any;

    const initHeatLayer = () => {
      // Ensure map has non-zero size to avoid Canvas IndexSizeError
      const size = map.getSize();
      if (size.x === 0 || size.y === 0) {
        // If map is not ready, wait for resize or try again shortly
        map.once('resize', initHeatLayer);
        return;
      }

      const heatData = points.map(p => [
        p.lat, 
        p.lng, 
        Math.max(0.1, (p.temp - 15) / 25) // Normalize intensity
      ]);

      // @ts-ignore
      heatLayer = L.heatLayer(heatData, {
        radius: 120,
        blur: 60,
        maxZoom: 10,
        gradient: {
          0.2: '#3b82f6', // Blue (< 24)
          0.4: '#22c55e', // Green (25-28)
          0.6: '#eab308', // Yellow (29-32)
          0.8: '#ef4444'  // Red (> 33)
        }
      }).addTo(map);
    };

    // Use whenReady and a small timeout as a safety measure
    map.whenReady(() => {
      setTimeout(initHeatLayer, 100);
    });

    return () => {
      if (heatLayer && map) {
        map.removeLayer(heatLayer);
      }
      map.off('resize', initHeatLayer);
    };
  }, [map, points, visible]);

  return null;
};

interface AgricultureHeatmapProps {
  onBack: () => void;
}

const AgricultureHeatmap: React.FC<AgricultureHeatmapProps> = ({ onBack }) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);


  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between z-[1001]">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">Bản đồ nhiệt Nông nghiệp</h1>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Khu vực Miền Nam Việt Nam</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 ${showHeatmap ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                title="Ẩn/Hiện Heatmap"
              >
                {showHeatmap ? <Layers size={18} /> : <EyeOff size={18} />}
                <span className="text-[10px] font-black uppercase">Nhiệt</span>
              </button>
              <button 
                onClick={() => setShowMarkers(!showMarkers)}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 ${showMarkers ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                title="Ẩn/Hiện Trạm"
              >
                {showMarkers ? <Radio size={18} /> : <EyeOff size={18} />}
                <span className="text-[10px] font-black uppercase">Trạm</span>
              </button>
           </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer 
          center={[10.5, 106.5]} 
          zoom={8} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {showHeatmap && <HeatmapLayer points={STATIONS} visible={showHeatmap} />}
          
          {showMarkers && STATIONS.map((station, idx) => {
            const sensorIcon = L.divIcon({
              className: 'custom-sensor-icon',
              html: `
                <div class="relative flex flex-col items-center justify-center">
                  <div class="absolute w-10 h-10 bg-blue-500/20 rounded-full animate-ping"></div>
                  <div class="relative bg-white border-2 border-blue-600 p-1.5 rounded-lg shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <div class="mt-1 bg-black/80 text-white text-[8px] px-2 py-0.5 rounded-full font-black uppercase whitespace-nowrap border border-white/20 shadow-sm">
                    Trạm ${station.name}
                  </div>
                </div>
              `,
              iconSize: [40, 40],
              iconAnchor: [20, 20],
            });

            return (
              <Marker 
                key={idx} 
                position={[station.lat, station.lng]} 
                icon={sensorIcon}
              >
              <Popup className="agriculture-popup">
                <div className="w-64 p-1">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Trạm {station.name}</h3>
                    <div className="bg-blue-100 p-1.5 rounded-lg">
                      <Activity size={16} className="text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Thermometer size={12} className="text-red-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">Nhiệt độ</span>
                      </div>
                      <p className="text-xs font-black text-slate-900">{station.temp}°C</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Droplets size={12} className="text-blue-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">Độ ẩm khí</span>
                      </div>
                      <p className="text-xs font-black text-slate-900">{station.humidity}%</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Info size={12} className="text-amber-600" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">Độ ẩm đất</span>
                      </div>
                      <p className="text-xs font-black text-slate-900">{station.soilMoisture}%</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CloudRain size={12} className="text-blue-400" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">Lượng mưa</span>
                      </div>
                      <p className="text-xs font-black text-slate-900">{station.rain}mm</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 col-span-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Wind size={12} className="text-slate-500" />
                        <span className="text-[8px] font-black text-slate-400 uppercase">Tốc độ gió</span>
                      </div>
                      <p className="text-xs font-black text-slate-900">{station.wind} km/h</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Cập nhật: {station.updateTime}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[8px] font-black text-green-600 uppercase">Live</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )})}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-[1000] bg-white/90 backdrop-blur-md border-2 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
           <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 border-b border-black/10 pb-2">Chú giải nhiệt độ</h4>
           <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                 <span className="text-[10px] font-bold text-slate-600">Dưới 24°C (Mát mẻ)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 <span className="text-[10px] font-bold text-slate-600">25 - 28°C (Lý tưởng)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <span className="text-[10px] font-bold text-slate-600">29 - 32°C (Ấm áp)</span>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <span className="text-[10px] font-bold text-slate-600">Trên 33°C (Nắng nóng)</span>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        .agriculture-popup .leaflet-popup-content-wrapper {
          border-radius: 1.5rem;
          padding: 0;
          overflow: hidden;
          border: 3px solid black;
          box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);
        }
        .agriculture-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .agriculture-popup .leaflet-popup-tip {
          background: black;
        }
      `}</style>
    </div>
  );
};

export default AgricultureHeatmap;
