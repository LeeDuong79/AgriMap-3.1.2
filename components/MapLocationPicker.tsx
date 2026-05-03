
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Navigation, X, Loader2 } from 'lucide-react';

// Fix for default marker icon in Leaflet with Vite/React
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapLocationPickerProps {
  initialLat: number;
  initialLng: number;
  onChange: (lat: number, lng: number) => void;
}

// Component to handle map re-centering
const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ initialLat, initialLng, onChange }) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Update position when initial props change (if needed)
  useEffect(() => {
    setPosition([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  // Debounced search for suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2 && showSuggestions) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Suggestions error:", error);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setPosition([lat, lng]);
    onChange(lat, lng);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onChange(lat, lng);
        setShowSuggestions(false);
      },
    });

    return position === null ? null : (
      <Marker position={position} draggable={true} eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
          onChange(pos.lat, pos.lng);
        }
      }} />
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setPosition([newLat, newLng]);
        onChange(newLat, newLng);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative z-[2000] flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full p-4 pl-12 bg-white border-2 border-slate-300 rounded-2xl focus:border-green-600 outline-none font-bold shadow-sm"
              placeholder="Tìm kiếm địa chỉ, khu vực..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black"
              >
                <X size={18} />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black rounded-[1.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-[3000] animate-in slide-in-from-top-2 duration-200">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left p-4 hover:bg-green-50 border-b border-slate-100 last:border-0 flex items-start gap-3 transition-colors"
                  >
                    <MapPin size={18} className="text-green-600 mt-1 shrink-0" />
                    <div>
                      <p className="font-bold text-sm text-black line-clamp-1">{s.display_name.split(',')[0]}</p>
                      <p className="text-[10px] font-bold text-slate-500 line-clamp-1 italic">{s.display_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button 
            type="button"
            onClick={handleSearch}
            className="bg-black text-white px-6 py-2 rounded-2xl text-xs font-black uppercase hover:bg-slate-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center justify-center min-w-[120px]"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Tìm kiếm"}
          </button>
        </div>
      </div>

      <div className="h-[350px] rounded-[2.5rem] overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)] relative z-10 transition-all hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)]">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
        >
          <ChangeView center={position} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
        
        <div className="absolute bottom-6 left-6 z-[1000]">
          <div className="bg-white p-4 rounded-[1.5rem] border-4 border-black flex items-center gap-4 shadow-xl">
            <div className="bg-green-600 text-white p-2.5 rounded-xl">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Vị trí đã đánh dấu</p>
              <p className="text-sm font-black text-black tabular-nums">{position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
            </div>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                onChange(latitude, longitude);
              }, (err) => {
                alert("Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.");
              });
            }
          }}
          className="absolute top-6 right-6 z-[1000] bg-white p-4 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all text-black group"
          title="Lấy vị trí hiện tại"
        >
          <Navigation size={24} className="group-hover:rotate-12 transition-transform" />
        </button>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Hướng dẫn: Click vào bản đồ hoặc kéo thả Marker để chọn tọa độ
        </p>
      </div>
    </div>
  );
};

export default MapLocationPicker;
