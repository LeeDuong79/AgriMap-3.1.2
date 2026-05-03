
import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import 'leaflet.markercluster';
import { FarmProduct, ProductStatus, CertType, Order } from '../types';
import { 
  MapPin, Phone, Award, Search, X, 
  Map as MapIcon, SlidersHorizontal, AlertCircle, 
  TrendingUp, Star, Share2, Bookmark, CheckCircle, 
  Info, ExternalLink, Calendar, ChevronRight, MessageSquare,
  Activity, Thermometer, Droplets, Wind, CloudRain, Sun,
  TrendingDown, QrCode, ShoppingCart, Heart, Package,
  RefreshCw, Filter, MousePointer2, Layers, Minimize2,
  Maximize2, ArrowRight, AlertTriangle, History, EyeOff,
  Eye, Cloud, Clock, Sparkles, FileText, PenTool, Navigation
} from 'lucide-react';

const MONITORING_LOCATIONS = [
    { lat: 10.005, lng: 105.655, name: "Phong Điền - Cần Thơ", sub: "Vườn Vú Sữa Lò Rèn", val: "85%", type: "rain", range: "28°/24°", feels: "25°" },
    { lat: 9.985, lng: 105.755, name: "Cái Răng - Cần Thơ", sub: "Vườn Dâu Hạ Châu", val: "26.5°C", type: "cool", range: "28°/23°", feels: "26°" },
    { lat: 10.125, lng: 105.505, name: "Thới Lai - Cần Thơ", sub: "Cây Ăn Quả Hỗn Hợp", val: "78%", type: "rain", range: "27°/23°", feels: "26°" },
    { lat: 10.055, lng: 105.805, name: "Bình Thủy - Cần Thơ", sub: "Vườn Nhãn Idor", val: "25.2°C", type: "cool", range: "27°/24°", feels: "25°" },
    { lat: 10.185, lng: 106.005, name: "Cái Mơn - Bến Tre", sub: "Sầu Riêng Ri6", val: "82%", type: "rain", range: "27°/23°", feels: "26°" },
    { lat: 10.355, lng: 106.305, name: "Châu Thành - Tiền Giang", sub: "Thanh Long Ruột Đỏ", val: "24.5°C", type: "cool", range: "26°/22°", feels: "24°" },
    { lat: 10.455, lng: 105.625, name: "Cao Lãnh - Đồng Tháp", sub: "Xoài Cát Hòa Lộc", val: "26.0°C", type: "cool", range: "28°/24°", feels: "26°" },
    { lat: 9.955, lng: 105.655, name: "Phụng Hiệp - Hậu Giang", sub: "Vườn Chanh Không Hạt", val: "90%", type: "rain", range: "26°/23°", feels: "25°" },
    { lat: 10.255, lng: 105.905, name: "Vĩnh Long", sub: "Bưởi Năm Roi", val: "25.8°C", type: "cool", range: "27°/24°", feels: "25°" },
    { lat: 10.155, lng: 105.455, name: "Ô Môn - Cần Thơ", sub: "Vườn Cam Sành", val: "80%", type: "rain", range: "27°/24°", feels: "26°" },
    { lat: 10.385, lng: 105.955, name: "Cai Lậy - Tiền Giang", sub: "Vườn Sầu Riêng Xuất Khẩu", val: "36.5°C", type: "hot", range: "37°/28°", feels: "39°" },
    { lat: 10.225, lng: 106.155, name: "Chợ Lách - Bến Tre", sub: "Vườn Cây Giống - Hoa Kiểng", val: "35.8°C", type: "hot", range: "36°/27°", feels: "38°" },
    { lat: 9.925, lng: 105.905, name: "Măng Thít - Vĩnh Long", sub: "Vườn Cam Sành Đang Ra Hoa", val: "36.2°C", type: "hot", range: "37°/27°", feels: "39°" },
    { lat: 9.755, lng: 105.985, name: "Kế Sách - Sóc Trăng", sub: "Vườn Vú Sữa Tím", val: "37.0°C", type: "hot", range: "38°/29°", feels: "40°" },
    { lat: 10.455, lng: 106.405, name: "Gò Công - Tiền Giang", sub: "Vườn Sơ Ri Đặc Sản", val: "18%", type: "water", range: "34°/26°", feels: "35°" },
    { lat: 10.105, lng: 106.455, name: "Ba Tri - Bến Tre", sub: "Vườn Mãng Cầu Xiêm", val: "15%", type: "water", range: "33°/25°", feels: "34°" },
    { lat: 9.655, lng: 105.655, name: "Long Mỹ - Hậu Giang", sub: "Vườn Mãng Cầu Ta", val: "20%", type: "water", range: "35°/27°", feels: "36°" },
    { lat: 10.555, lng: 105.455, name: "Hồng Ngự - Đồng Tháp", sub: "Cụm Cây Ăn Quả Ven Biên", val: "12%", type: "water", range: "36°/28°", feels: "37°" },
    { lat: 10.2435, lng: 106.3756, name: "Châu Thành - Bến Tre", sub: "Vùng Bưởi Da Xanh", val: "28.5°C", type: "cool", range: "30°/25°", feels: "29°" },
    { lat: 10.35, lng: 106.36, name: "Cái Bè - Tiền Giang", sub: "Vùng Xoài Cát Hòa Lộc", val: "29.0°C", type: "cool", range: "31°/26°", feels: "30°" },
    { lat: 10.25, lng: 105.97, name: "Tam Bình - Vĩnh Long", sub: "Vùng Cam Sành", val: "27.8°C", type: "cool", range: "29°/24°", feels: "28°" }
];

const SENSOR_STATIONS = [
  { id: "ST01", area: "TP.HCM", lat: 10.7626, lng: 106.6601, data: { temp: 34, humidity: 65, soilMoisture: 60, rain: 5, light: 45000, wind: 8 }, updatedAt: "10:30" },
  { id: "ST02", area: "TP.HCM (Hóc Môn)", lat: 10.8833, lng: 106.5833, data: { temp: 33, humidity: 62, soilMoisture: 55, rain: 0, light: 42000, wind: 6 }, updatedAt: "10:45" },
  { id: "ST03", area: "Cần Thơ", lat: 10.0371, lng: 105.7828, data: { temp: 31, humidity: 72, soilMoisture: 60, rain: 5, light: 38000, wind: 8 }, updatedAt: "10:25" },
  { id: "ST04", area: "Cần Thơ (Thốt Nốt)", lat: 10.2833, lng: 105.5333, data: { temp: 30, humidity: 75, soilMoisture: 65, rain: 2, light: 35000, wind: 7 }, updatedAt: "10:50" },
  { id: "ST05", area: "Đồng Nai", lat: 10.9574, lng: 106.8427, data: { temp: 35, humidity: 58, soilMoisture: 60, rain: 5, light: 50000, wind: 8 }, updatedAt: "10:40" },
  { id: "ST06", area: "Đồng Nai (Long Khánh)", lat: 10.9333, lng: 107.2333, data: { temp: 34, humidity: 60, soilMoisture: 58, rain: 0, light: 48000, wind: 9 }, updatedAt: "10:55" },
  { id: "ST07", area: "An Giang", lat: 10.5216, lng: 105.1259, data: { temp: 30, humidity: 75, soilMoisture: 60, rain: 5, light: 32000, wind: 8 }, updatedAt: "10:15" },
  { id: "ST08", area: "An Giang (Châu Đốc)", lat: 10.7, lng: 105.1167, data: { temp: 31, humidity: 70, soilMoisture: 62, rain: 0, light: 34000, wind: 10 }, updatedAt: "11:00" },
  { id: "ST09", area: "Lâm Đồng (Đà Lạt)", lat: 11.9404, lng: 108.4583, data: { temp: 22, humidity: 85, soilMoisture: 60, rain: 5, light: 25000, wind: 8 }, updatedAt: "09:50" },
  { id: "ST10", area: "Lâm Đồng (Bảo Lộc)", lat: 11.5461, lng: 107.8025, data: { temp: 25, humidity: 80, soilMoisture: 68, rain: 10, light: 28000, wind: 5 }, updatedAt: "11:05" },
  { id: "ST11", area: "Bến Tre", lat: 10.2435, lng: 106.3761, data: { temp: 32, humidity: 68, soilMoisture: 60, rain: 5, light: 40000, wind: 8 }, updatedAt: "10:35" },
  { id: "ST12", area: "Bến Tre (Ba Tri)", lat: 10.05, lng: 106.6, data: { temp: 31, humidity: 70, soilMoisture: 58, rain: 0, light: 42000, wind: 12 }, updatedAt: "11:10" },
  { id: "ST13", area: "Cà Mau", lat: 9.1769, lng: 105.1524, data: { temp: 29, humidity: 80, soilMoisture: 60, rain: 5, light: 30000, wind: 8 }, updatedAt: "10:05" },
  { id: "ST14", area: "Cà Mau (Năm Căn)", lat: 8.75, lng: 104.9833, data: { temp: 28, humidity: 82, soilMoisture: 65, rain: 8, light: 28000, wind: 15 }, updatedAt: "11:15" },
];

interface MapInterfaceProps {
  products: FarmProduct[];
  isFarmerView?: boolean;
  isBuyerView?: boolean;
  onSearch?: (query: string) => void;
  initialSearchQuery?: string;
  cart?: FarmProduct[];
  setCart?: React.Dispatch<React.SetStateAction<FarmProduct[]>>;
  orders?: Order[];
  setOrders?: React.Dispatch<React.SetStateAction<Order[]>>;
  initialView?: 'map' | 'monitoring';
  initialCartView?: 'cart' | 'orders' | null;
  onNegotiate?: (product: FarmProduct) => void;
  highlightedLocation?: { lat: number, lng: number, name: string } | null;
  hideUI?: boolean;
}

const POPULAR_SUGGESTIONS = ['Bưởi Da Xanh', 'Sầu riêng Ri6', 'Xoài Cát Hòa Lộc', 'Lúa ST25', 'Vú sữa Lò Rèn'];

const MapInterface: React.FC<MapInterfaceProps> = ({ 
  products, 
  isFarmerView = false, 
  isBuyerView = false, 
  onSearch, 
  initialSearchQuery = '',
  cart = [],
  setCart = () => {},
  orders = [],
  setOrders = () => {},
  initialView = 'map',
  initialCartView = null,
  onNegotiate,
  highlightedLocation = null,
  hideUI = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const productMarkersRef = useRef<L.Marker[]>([]);
  const monitoringMarkersRef = useRef<L.Marker[]>([]);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<FarmProduct | null>(null);
  const [localQuery, setLocalQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedCert, setSelectedCert] = useState('All');

  const orderedProductIds = useMemo(() => {
    const ids = new Set<string>();
    orders.forEach(order => {
      order.items.forEach(item => ids.add(item.id));
    });
    return ids;
  }, [orders]);

  const [maxDistance, setMaxDistance] = useState(2000); // Tăng lên 2000km để bao phủ toàn bộ Việt Nam mặc định
  const [onlySeasonal, setOnlySeasonal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isSaved, setIsSaved] = useState(false);
  const [isMonitoringMode, setIsMonitoringMode] = useState(initialView === 'monitoring');
  const [showCheckout, setShowCheckout] = useState(false);
  const [deliverySlot, setDeliverySlot] = useState('');
  const [aiRecipe, setAiRecipe] = useState<string | null>(null);
  const [isScanningFreshness, setIsScanningFreshness] = useState(false);
  const [freshnessResult, setFreshnessResult] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(!!initialCartView);
  const [cartView, setCartView] = useState<'cart' | 'orders'>(initialCartView === 'orders' ? 'orders' : 'cart');
  const [showFilters, setShowFilters] = useState(false);
  const [showLayerControl, setShowLayerControl] = useState(false);
  const [showProducts, setShowProducts] = useState(true);
  const [showMonitoring, setShowMonitoring] = useState(isBuyerView ? false : true);
  const [showStations, setShowStations] = useState(true);
  const [selectedMonitoringLoc, setSelectedMonitoringLoc] = useState<any>(MONITORING_LOCATIONS[0]);
  const [monitoringFilter, setMonitoringFilter] = useState('all');
  const [placeSuggestions, setPlaceSuggestions] = useState<any[]>([]);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const labelMarkerRef = useRef<L.Marker | null>(null);

  // nominatim search
  const handlePlaceSearch = async (query: string) => {
    if (!query.trim()) return;
    setIsSearchingPlace(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
      const data = await response.json();
      setPlaceSuggestions(data);
    } catch (error) {
      console.error("Place search error:", error);
    } finally {
      setIsSearchingPlace(false);
    }
  };

  const handleSelectPlace = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
    }
    setLocalQuery(suggestion.display_name);
    setPlaceSuggestions([]);
    setShowSuggestions(false);
  };

  const filteredDisplayProducts = useMemo(() => {
    let filtered = products;
    
    // Mock user location for distance calculation (Cần Thơ center)
    const userLat = 10.0371;
    const userLng = 105.7828;

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    if (localQuery.trim()) {
      const q = localQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.farmerName.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedProvince !== 'All') {
      filtered = filtered.filter(p => p.location.address.includes(selectedProvince));
    }

    if (selectedCert !== 'All') {
      filtered = filtered.filter(p => p.certificates.some(c => c.type === selectedCert));
    }

    if (onlySeasonal) {
      const currentMonth = new Date().getMonth() + 1;
      filtered = filtered.filter(p => p.harvestMonths.includes(currentMonth));
    }

    if (isBuyerView) {
      filtered = filtered.filter(p => {
        const dist = calculateDistance(userLat, userLng, p.location.lat, p.location.lng);
        return dist <= maxDistance;
      });
    }

    return filtered;
  }, [products, localQuery, selectedCategory, selectedProvince, selectedCert, onlySeasonal, maxDistance, isBuyerView]);

  const provinces = useMemo(() => {
    const set = new Set(products.map(p => {
      const parts = p.location.address.split(',');
      return parts[parts.length - 1].trim();
    }));
    return Array.from(set).sort();
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return Array.from(set).sort();
  }, [products]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [10.2435, 106.3756],
        zoom: 10,
        zoomControl: false
      });
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
    }
  }, []);

  // Handle Tile Layer Theme
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    
    const darkUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    const lightUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    
    tileLayerRef.current.setUrl(isMonitoringMode ? darkUrl : lightUrl);
  }, [isMonitoringMode]);

  // Handle Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    productMarkersRef.current.forEach(m => m.remove());
    productMarkersRef.current = [];
    monitoringMarkersRef.current.forEach(m => m.remove());
    monitoringMarkersRef.current = [];

    if (labelMarkerRef.current) {
      labelMarkerRef.current.remove();
      labelMarkerRef.current = null;
    }

    if (clusterGroupRef.current && mapRef.current) {
      mapRef.current.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }

    if (showProducts) { // Always show product markers
      const getProductMarkerData = (p: FarmProduct) => {
        const name = (p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();

        // Default: Green sprout
        let color = "#15803d";
        let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V10"/><path d="M12 10c0-2.8 2.2-5 5-5"/><path d="M12 10c0-2.8-2.2-5-5-5"/></svg>`;

        if (name.includes("táo") || name.includes("apple")) {
          color = "#ef4444"; // Red
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M12 20c-3 0-5.5-2.5-5.5-5.5s1-4.5 3-5.5c0.5-0.2 1-0.3 1.5-0.3 0.8 0 1.5 0.2 2 0.5 0.5-0.3 1.2-0.5 2-0.5 0.5 0 1.1 0.1 1.5 0.3 2 1 3 2.5 3 5.5s-2.5 5.5-5.5 5.5c-0.8 0-1.5-0.2-2-0.5-0.5 0.3-1.2 0.5-2 0.5z"/>
            <path d="M12 8c0-2 1-3 2-3" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M14 5c1-1 2.5-1 3.5 0s1 2.5 0 3.5c-0.5 0.5-1.5 0.5-2 0.5L14 5z" fill="white" opacity="0.8"/>
          </svg>`;
        } else if (name.includes("cam") || name.includes("quýt") || name.includes("orange") || name.includes("citrus")) {
          color = "#f97316"; // Orange
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <circle cx="12" cy="13" r="8" />
            <circle cx="10" cy="11" r="0.5" fill="rgba(0,0,0,0.2)"/>
            <circle cx="14" cy="15" r="0.5" fill="rgba(0,0,0,0.2)"/>
            <circle cx="10" cy="15" r="0.5" fill="rgba(0,0,0,0.2)"/>
            <circle cx="14" cy="11" r="0.5" fill="rgba(0,0,0,0.2)"/>
            <path d="M12 5c0-1.5 1-2 2-2" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M14 3c1 0 2 1 2 2s-1 2-2 2L14 3z" fill="white" opacity="0.8"/>
          </svg>`;
        } else if (name.includes("bưởi") || name.includes("pomelo")) {
          color = "#84cc16"; // Lime Green
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <circle cx="12" cy="13" r="9" />
            <circle cx="9" cy="10" r="0.8" fill="rgba(0,0,0,0.1)"/>
            <circle cx="15" cy="16" r="0.8" fill="rgba(0,0,0,0.1)"/>
            <path d="M12 4V2" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"/>
          </svg>`;
        } else if (name.includes("dứa") || name.includes("thơm") || name.includes("khóm") || name.includes("pineapple")) {
          color = "#eab308"; // Golden Yellow
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M12 22c2.5 0 5-2.5 5-7s-2-7-5-7-5 2.5-5 7 2.5 7 5 7z"/>
            <path d="M10 8l-1-5 3 2 3-2-1 5z" fill="white"/>
            <path d="M9 11l6 6M9 14l6-6M8 14h8" stroke="rgba(0,0,0,0.2)" stroke-width="1" fill="none"/>
          </svg>`;
        } else if (name.includes("sầu riêng") || name.includes("durian")) {
          color = "#a16207"; // Durian Brownish Yellow
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M12 21c4.5 0 7.5-3.5 7.5-8.5s-3-8.5-7.5-8.5-7.5 3.5-7.5 8.5 3 8.5 7.5 8.5z"/>
            <path d="M12 4V2" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M7 11l-3-1 3-1z M17 11l3-1-3-1z M12 18l-1 3h2l-1-3z M9 14l-2 2l2-2z" fill="white"/>
            <path d="M8 8l-2-2 M16 8l2-2 M8 18l-2 2 M16 18l2 2" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>`;
        } else if (name.includes("thanh long") || name.includes("dragonfruit")) {
          color = "#db2777"; // Dragonfruit Pink
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M12 21c4 0 7.5-4 7.5-9s-3.5-9-7.5-9-7.5 4-7.5 9 3.5 9 7.5 9z"/>
            <path d="M12 5c0-2.5 1.5-3 2.5-2.5s1 2.5 0 3L12 5z" fill="white" opacity="0.8"/>
            <path d="M9 8c-1-2-2-2.5-3-2s-0.5 2.5 1 3L9 8z" fill="white" opacity="0.8"/>
            <path d="M15 8c1-2 2-2.5 3-2s0.5 2.5-1 3L15 8z" fill="white" opacity="0.8"/>
            <path d="M12 3v3 M8 6l2 2 M16 6l-2 2" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          </svg>`;
        } else if (name.includes("xoài") || name.includes("mango")) {
          color = "#facc15"; // Mango Yellow
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M12 20c5 0 7-5 7-10s-4-7-9-7-7 4-7 9 4 8 9 8z"/>
            <path d="M10 3V1" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M10 1c2.5 0 4 1.5 5 2.5s1 2.5 0 3L10 1z" fill="white" opacity="0.8"/>
          </svg>`;
        } else if (name.includes("vải") || name.includes("nhãn") || name.includes("lychee")) {
          color = "#e11d48"; // Lychee Red
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <circle cx="9" cy="14" r="6" />
            <circle cx="16" cy="11" r="5" />
            <path d="M12 8V4" stroke="white" stroke-width="2" stroke-linecap="round"/>
            <path d="M12 4c2-1 4 0 4 2s-2 2-4 2L12 4z" fill="white" opacity="0.8"/>
          </svg>`;
        } else if (name.includes("chuối") || name.includes("banana")) {
          color = "#fde047";
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M4 4c0 0 2 0 4 4s4 8 10 10 2 2 2 2-1 1-3 1-5-1-10-10S4 4 4 4z"/>
            <path d="M4 4l1-1 1 1-1 1-1-1z" fill="rgba(0,0,0,0.5)"/>
          </svg>`;
        } else if (category.includes("lúa") || name.includes("gạo") || category.includes("ngũ cốc")) {
          color = "#fbbf24"; // Gold
          iconSvg = `<svg viewBox="0 0 24 24" width="22" height="22" fill="white">
            <path d="M12 21V5" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M12 5c2 2 4 4 4 6s-2 4-4 4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M12 8c2 2 4 4 4 6s-2 4-4 4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M12 11c-2 2-4 4-4 6s2 4 4 4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
            <path d="M12 14c-2 2-4 4-4 6s2 4 4 4" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
          </svg>`;
        }

        return { color, iconSvg };
      };

      const createIcon = (p: FarmProduct, isOrdered: boolean) => {
        const { color, iconSvg } = getProductMarkerData(p);
        const finalColor = isOrdered ? "#0ea5e9" : color;

        return L.divIcon({
          className: "custom-icon",
          html: `<div style="background-color: ${finalColor};" class="p-2 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform hover:scale-125 transition-all flex items-center justify-center">
                  ${iconSvg}
                </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
        });
      };

      if (clusterGroupRef.current) {
        mapRef.current.removeLayer(clusterGroupRef.current);
      }
      
      const clusterGroup = L.markerClusterGroup({
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        spiderfyOnMaxZoom: true,
        removeOutsideVisibleBounds: true,
        animate: true,
      });

      const newMarkers: L.Marker[] = [];
      filteredDisplayProducts.forEach(p => {
        const isOrdered = orderedProductIds.has(p.id);
        const marker = L.marker([p.location.lat, p.location.lng], { 
          icon: createIcon(p, isOrdered) 
        })
          .on('click', () => {
            setSelectedProduct(p);
            setIsSaved(false);
            mapRef.current?.flyTo([p.location.lat, p.location.lng], 14, { duration: 1.5 });
          });
        clusterGroup.addLayer(marker);
        newMarkers.push(marker);
      });

      mapRef.current.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
      productMarkersRef.current = newMarkers;

      if (newMarkers.length > 0 && localQuery.trim().length > 0) {
        mapRef.current.fitBounds(clusterGroup.getBounds().pad(0.3), { animate: true });
      }
    }

    if (isMonitoringMode && showMonitoring) {
      // Monitoring Mode Markers
      const getMonitoringIcon = (type: string) => {
        let content = '';
        let effectsHtml = '';
        let typeClass = `type-${type}`;
        
        if (type === 'hot' || type === 'water' || type === 'rain') {
            effectsHtml = `<div class="warning-rect ${typeClass}"></div><div class="ripple ${typeClass}"></div><div class="ripple ripple-2 ${typeClass}"></div>`;
        }

        if (type === 'hot') content = `<div class="sun-icon"></div>`;
        else if (type === 'water') content = `<div class="water-warning-bang"></div>`;
        else if (type === 'rain') {
            content = `<div class="rain-storm-container">
                <svg class="cloud-storm" viewBox="0 0 24 24"><path d="M17.5,19c2.5,0,4.5-2,4.5-4.5c0-1.9-1.2-3.6-3-4.2-0.1-3.1-2.6-5.5-5.7-5.5-2.3,0-4.3,1.4-5.2,3.4C7.5,8.1,7,8,6.5,8 C4,8,2,10,2,12.5S4,17,6.5,17h11"/></svg>
                <div class="rain-drops-heavy">
                    <div class="drop-heavy" style="left:5px;"></div>
                    <div class="drop-heavy" style="left:15px;animation-delay:0.1s"></div>
                    <div class="drop-heavy" style="left:25px;animation-delay:0.2s"></div>
                </div>
            </div>`;
        } else {
            content = `<div class="sun-cloud-container"><div class="sun-mini"></div><svg class="cloud-mini" viewBox="0 0 24 24"><path d="M17.5,19c2.5,0,4.5-2,4.5-4.5c0-1.9-1.2-3.6-3-4.2-0.1-3.1-2.6-5.5-5.7-5.5-2.3,0-4.3,1.4-5.2,3.4C7.5,8.1,7,8,6.5,8 C4,8,2,10,2,12.5S4,17,6.5,17h11"/></svg></div>`;
        }
        return L.divIcon({ className: '', html: `<div class="marker-container">${effectsHtml}${content}</div>`, iconSize: [60, 60], iconAnchor: [30, 30] });
      };

      const filtered = monitoringFilter === 'all' ? MONITORING_LOCATIONS : MONITORING_LOCATIONS.filter(l => l.type === monitoringFilter);
      const newMonitoringMarkers: L.Marker[] = [];
      
      filtered.forEach(loc => {
        const marker = L.marker([loc.lat, loc.lng], { icon: getMonitoringIcon(loc.type) })
          .addTo(mapRef.current!)
          .on('click', () => handleMonitoringLocClick(loc));
        newMonitoringMarkers.push(marker);
      });

      // Add Sensor Stations
      if (showStations) {
        SENSOR_STATIONS.forEach(station => {
        const sensorIcon = L.divIcon({
          className: 'custom-sensor-icon',
          html: `
            <div class="relative flex flex-col items-center justify-center">
              <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
              <div class="relative bg-white border-2 border-blue-600 p-1 rounded-lg shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
              </div>
              <div class="mt-1 bg-black/80 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase whitespace-nowrap border border-white/20 shadow-sm">
                Trạm ${station.area}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const popupContent = `
          <div class="p-5">
            <div class="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div>
                <h3 class="text-blue-400 font-black text-sm leading-none uppercase tracking-tighter">ID: ${station.id} - Khu vực: ${station.area}</h3>
              </div>
              <div class="bg-blue-500/20 p-2 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mb-4">
              <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div class="flex items-center gap-1.5 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>
                  <span class="text-[9px] font-black text-slate-400 uppercase">Nhiệt độ</span>
                </div>
                <p class="text-sm font-black text-white">${station.data.temp}°C</p>
              </div>
              <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div class="flex items-center gap-1.5 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                  <span class="text-[9px] font-black text-slate-400 uppercase">Độ ẩm khí</span>
                </div>
                <p class="text-sm font-black text-white">${station.data.humidity}%</p>
              </div>
              <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div class="flex items-center gap-1.5 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                  <span class="text-[9px] font-black text-slate-400 uppercase">Độ ẩm đất</span>
                </div>
                <p class="text-sm font-black text-white">${station.data.soilMoisture}%</p>
              </div>
              <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div class="flex items-center gap-1.5 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.89c0-4 5-9 5-9s5 5 5 9a5 5 0 1 1-10 0Z"/><path d="M17.76 15.57c0-2 3.24-4.5 3.24-4.5s3.24 2.5 3.24 4.5a3.24 3.24 0 0 1-6.48 0Z"/></svg>
                  <span class="text-[9px] font-black text-slate-400 uppercase">Lượng mưa</span>
                </div>
                <p class="text-sm font-black text-white">${station.data.rain}mm</p>
              </div>
              <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div class="flex items-center gap-1.5 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                  <span class="text-[9px] font-black text-slate-400 uppercase">Ánh sáng</span>
                </div>
                <p class="text-sm font-black text-white">${station.data.light} lux</p>
              </div>
              <div class="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div class="flex items-center gap-1.5 mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>
                  <span class="text-[9px] font-black text-slate-400 uppercase">Gió</span>
                </div>
                <p class="text-sm font-black text-white">${station.data.wind}km/h</p>
              </div>
            </div>

            <div class="flex items-center justify-between border-t border-white/5 pt-3">
              <span class="text-[8px] font-black text-slate-500 uppercase">Thời gian: Cập nhật lúc ${station.updatedAt}</span>
              <span class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span class="text-[8px] font-black text-green-500 uppercase">Trực tuyến</span>
              </span>
            </div>
          </div>
        `;

        const marker = L.marker([station.lat, station.lng], { icon: sensorIcon })
          .addTo(mapRef.current!)
          .bindPopup(popupContent, { 
            className: 'sensor-popup',
            maxWidth: 300,
            closeButton: true
          });
        newMonitoringMarkers.push(marker);
      });
    }

    monitoringMarkersRef.current = newMonitoringMarkers;
  }
}, [products, localQuery, showMonitoring, showProducts, showStations, monitoringFilter, filteredDisplayProducts, isMonitoringMode]);

  const handleMonitoringLocClick = (loc: any) => {
    setSelectedMonitoringLoc(loc);
    mapRef.current?.flyTo([loc.lat, loc.lng], 12, { duration: 1.2 });
    
    if (labelMarkerRef.current) {
      labelMarkerRef.current.remove();
    }

    setTimeout(() => {
      labelMarkerRef.current = L.marker([loc.lat, loc.lng], { 
          icon: L.divIcon({ 
              className: '', 
              html: `<div class="loc-label">${loc.name}</div>`, 
              iconAnchor: [60, 65] 
          }), 
          interactive: false 
      }).addTo(mapRef.current!);
    }, 600);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch?.(localQuery);
    setShowSuggestions(false);
    (document.activeElement as HTMLElement)?.blur();
  };

  const handleSuggestionClick = (q: string) => {
    setLocalQuery(q);
    onSearch?.(q);
    setShowSuggestions(false);
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  // Handle Highlighted Location from AI
  useEffect(() => {
    if (mapRef.current && highlightedLocation) {
      mapRef.current.setView([highlightedLocation.lat, highlightedLocation.lng], 13);
      
      const highlightMarker = L.marker([highlightedLocation.lat, highlightedLocation.lng], {
        icon: L.divIcon({
          className: 'highlight-ai-marker',
          html: `<div class="w-12 h-12 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white scale-125 shadow-2xl animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                 </div>`,
          iconSize: [48, 48],
          iconAnchor: [24, 48]
        })
      }).addTo(mapRef.current);

      highlightMarker.bindPopup(`
        <div class="p-4 font-black">
          <p class="text-[10px] uppercase text-emerald-600 mb-1">Gợi ý từ AI</p>
          <p class="text-base uppercase leading-tight">${highlightedLocation.name}</p>
          <div class="flex items-center gap-2 mt-2 py-1 px-2 bg-emerald-50 rounded-lg border border-emerald-100">
            <span class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span class="text-[10px] text-emerald-700 uppercase tracking-tighter">Giá tốt nhất khu vực</span>
          </div>
          <button class="mt-3 w-full py-2 bg-black text-white rounded-xl text-[10px] uppercase hover:bg-emerald-600 transition-colors">Xem thương lái vùng này</button>
        </div>
      `, {
        className: 'custom-popup-ai'
      }).openPopup();

      return () => {
        highlightMarker.remove();
      };
    }
  }, [highlightedLocation]);

  return (
    <div className={`relative w-full h-full font-sans bg-slate-50 overflow-hidden flex flex-col ${hideUI ? 'p-0' : 'p-4 md:p-6'}`}>
      <div className={`relative flex-1 overflow-hidden ${hideUI ? 'rounded-none border-0 shadow-none' : 'rounded-[3rem] border-[6px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,0.1)]'}`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* No Results Message */}
      {!isMonitoringMode && localQuery.trim() !== '' && filteredDisplayProducts.length === 0 && (
        <div className="absolute top-48 left-1/2 -translate-x-1/2 z-[3000] bg-white border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4 animate-in zoom-in duration-300 max-w-md w-full mx-4">
          <div className="bg-red-100 text-red-600 p-4 rounded-2xl shrink-0">
            <AlertCircle size={32} strokeWidth={3} />
          </div>
          <div>
            <p className="text-xl font-black text-black uppercase tracking-tighter leading-none mb-1">Không tìm thấy nông sản</p>
            <p className="text-xs font-bold text-slate-500 uppercase leading-tight">Vui lòng thử từ khóa khác hoặc kiểm tra lại khu vực tìm kiếm.</p>
          </div>
          <button onClick={() => { setLocalQuery(''); setSelectedCategory('All'); setSelectedProvince('All'); }} className="ml-auto p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} strokeWidth={4} className="text-slate-400" />
          </button>
        </div>
      )}

      {/* 1. Header Search Bar (Standard view) */}
      {!hideUI && (isBuyerView || !isMonitoringMode) && (
        <div className={`absolute top-6 left-6 right-6 z-[3100] flex justify-center transition-all duration-500 ${selectedProduct ? 'md:left-[474px]' : ''} ${isMonitoringMode && isBuyerView ? 'md:left-[400px] md:right-12' : ''} ${isBuyerView ? 'flex' : (isMonitoringMode ? 'hidden md:flex' : 'flex')}`}>
          <div ref={searchRef} className="w-full max-w-xl relative">
            <form 
              onSubmit={handleSearchSubmit}
              className="bg-white border-[4px] border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center p-1.5 transition-all focus-within:translate-x-1 focus-within:translate-y-1 focus-within:shadow-none"
            >
              <button type="submit" className="pl-4 pr-3 text-black hover:scale-110 active:scale-95 transition-transform">
                <Search size={28} strokeWidth={4} />
              </button>
              <div className="flex-1 px-2">
                <input 
                  type="text" 
                  value={localQuery}
                  placeholder={isBuyerView ? "Tìm nông sản hoặc địa danh..." : "Tìm nông sản, mã PUC hoặc địa điểm..."}
                  className="w-full py-3 bg-transparent text-xl font-black text-black outline-none placeholder:text-slate-400 uppercase tracking-tighter"
                  onChange={(e) => {
                    setLocalQuery(e.target.value);
                    if (e.target.value.length > 3) {
                      handlePlaceSearch(e.target.value);
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onClick={() => setShowSuggestions(true)}
                />
              </div>
              {localQuery && (
                <button type="button" onClick={() => { setLocalQuery(''); onSearch?.(''); }} className="p-2 mr-1">
                  <X size={20} strokeWidth={4} className="text-red-600" />
                </button>
              )}
              <button 
                type="button" 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-3.5 rounded-2xl transition-all ${showFilters ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-slate-800'}`}
              >
                <SlidersHorizontal size={22} strokeWidth={3} />
              </button>
              <div className="relative">
                <button 
                  type="button" 
                  onClick={() => setShowLayerControl(!showLayerControl)}
                  className={`p-3.5 rounded-2xl transition-all ${showLayerControl ? 'bg-blue-600 text-white' : 'bg-white text-black border-2 border-black hover:bg-slate-50'}`}
                >
                  <Layers size={22} strokeWidth={3} />
                </button>
                
                {showLayerControl && (
                  <div className="absolute top-full mt-4 right-0 bg-white border-4 border-black rounded-[2rem] shadow-2xl p-6 w-64 z-[3200] animate-in zoom-in-95 duration-200">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">Lớp bản đồ</h4>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs font-black text-black uppercase tracking-tight group-hover:text-green-600 transition-colors">Nông sản sạch</span>
                        <input type="checkbox" checked={showProducts} onChange={(e) => setShowProducts(e.target.checked)} className="w-5 h-5 accent-green-600" />
                      </label>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-xs font-black text-black uppercase tracking-tight group-hover:text-blue-600 transition-colors">Dữ liệu giám sát</span>
                        <input type="checkbox" checked={showMonitoring} onChange={(e) => setShowMonitoring(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                      </label>
                      {showMonitoring && (
                        <div className="pl-4 space-y-3 border-l-2 border-slate-100 mt-2">
                          <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">Trạm cảm biến</span>
                            <input type="checkbox" checked={showStations} onChange={(e) => setShowStations(e.target.checked)} className="w-4 h-4 accent-blue-400" />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Filters Panel */}
            {showFilters && (
              <div className="absolute top-full mt-4 left-0 right-0 bg-white border-4 border-black rounded-[2rem] shadow-2xl p-6 animate-in slide-in-from-top-4 duration-300 z-[2100]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</label>
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-black outline-none focus:border-black transition-all"
                    >
                      <option value="All">Tất cả danh mục</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tỉnh thành</label>
                    <select 
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-black outline-none focus:border-black transition-all"
                    >
                      <option value="All">Tất cả khu vực</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chứng nhận</label>
                    <select 
                      value={selectedCert}
                      onChange={(e) => setSelectedCert(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-black outline-none focus:border-black transition-all"
                    >
                      <option value="All">Tất cả chứng nhận</option>
                      {Object.values(CertType).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khoảng cách: {maxDistance}km</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="2000" 
                      step="10"
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t-2 border-slate-100 flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={onlySeasonal}
                        onChange={(e) => setOnlySeasonal(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6"></div>
                    </div>
                    <span className="text-xs font-black text-black uppercase tracking-tight">Chỉ hiện đang mùa vụ</span>
                  </label>
                  <button 
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedProvince('All');
                      setSelectedCert('All');
                      setMaxDistance(2000);
                      setOnlySeasonal(false);
                    }}
                    className="text-[10px] font-black text-slate-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              </div>
            )}

            {showSuggestions && (localQuery.length > 2 || !localQuery) && (
              <div className="absolute top-full mt-4 left-0 right-0 bg-white border-4 border-black rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in slide-in-from-top-4 duration-300 z-[3200]">
                {/* Place Suggestions from Nominatim */}
                {placeSuggestions.length > 0 && (
                  <div className="bg-slate-50 border-b-4 border-black">
                    <div className="px-6 py-3 border-b border-slate-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Địa điểm tìm thấy</p>
                    </div>
                    {placeSuggestions.map((s, idx) => (
                      <button
                        key={`place-${idx}`}
                        className="w-full text-left px-6 py-4 hover:bg-white flex items-start gap-4 transition-colors group"
                        onClick={() => handleSelectPlace(s)}
                      >
                        <div className="bg-blue-100 p-2 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Navigation size={18} fill="currentColor" />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-black text-black uppercase tracking-tighter text-sm line-clamp-1">{s.display_name.split(',')[0]}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase italic line-clamp-1">{s.display_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Keywords suggestions */}
                <div className="px-6 py-3 border-b border-slate-100 pb-0 flex items-center gap-2 text-green-700 mt-2">
                  <TrendingUp size={16} strokeWidth={3} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Gợi ý hôm nay</p>
                </div>
                <div className="p-6 pt-3 flex flex-wrap gap-2">
                  {POPULAR_SUGGESTIONS.map((s) => (
                    <button 
                      key={s} 
                      onClick={() => handleSuggestionClick(s)} 
                      className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-black hover:border-black transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monitoring Panel */}
      {!hideUI && isMonitoringMode && (
        <div className="absolute top-6 left-6 z-[3000] w-[360px] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col max-h-[calc(100vh-120px)] animate-in slide-in-from-left duration-500">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">TRẠM GIÁM SÁT</h1>
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">DỮ LIỆU CÂY ĂN QUẢ MIỀN TÂY • 2026</p>
          </div>

          {/* Weather Detail Widget */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-1.5 text-white font-black text-sm uppercase">
                  <MapPin size={14} className="text-blue-400" />
                  {selectedMonitoringLoc?.name || 'Vùng Giám Sát'}
                </div>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">Thứ Tư, 4 tháng 3 08:10</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  {selectedMonitoringLoc?.type === 'rain' ? 'Mưa rải rác' : 
                   selectedMonitoringLoc?.type === 'hot' ? 'Nguy cơ sốc nhiệt' : 
                   selectedMonitoringLoc?.type === 'water' ? 'Độ ẩm đất thấp' : 'Thời tiết ổn định'}
                </p>
                <p className="text-[8px] font-bold text-slate-500 uppercase">Cảm giác như {selectedMonitoringLoc?.feels || '--'}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {selectedMonitoringLoc?.type === 'rain' ? <CloudRain size={40} className="text-blue-400" /> : 
                 selectedMonitoringLoc?.type === 'hot' ? <Sun size={40} className="text-yellow-400" /> : 
                 <Activity size={40} className="text-green-400" />}
                <span className="text-4xl font-light text-white">{selectedMonitoringLoc?.val.replace('°C', '°') || '--'}</span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400">{selectedMonitoringLoc?.range || '--'}</p>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {[
                { time: '08:00', icon: '🌧️', temp: '25°', hum: '85%' },
                { time: '09:00', icon: '🌦️', temp: '26°', hum: '60%' },
                { time: '10:00', icon: '☁️', temp: '27°', hum: '40%' },
                { time: '11:00', icon: '⛅', temp: '29°', hum: '20%' },
                { time: '12:00', icon: '☀️', temp: '31°', hum: '10%' },
              ].map((h, i) => (
                <div key={i} className="flex flex-col items-center min-w-[42px]">
                  <span className="text-[9px] text-slate-500 font-bold">{h.time}</span>
                  <span className="my-1 text-sm">{h.icon}</span>
                  <span className="text-[11px] text-white font-black">{h.temp}</span>
                  <span className="text-[8px] text-blue-400 font-bold">💧{h.hum}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {[
              { id: 'all', label: 'TẤT CẢ', color: 'bg-blue-600' },
              { id: 'hot', label: 'NGUY CƠ', color: 'bg-red-600' },
              { id: 'cool', label: 'ỔN ĐỊNH', color: 'bg-green-600' },
              { id: 'water', label: 'CẦN TƯỚI', color: 'bg-yellow-600' },
              { id: 'rain', label: 'MƯA', color: 'bg-blue-400' },
            ].map(f => (
              <button 
                key={f.id}
                onClick={() => setMonitoringFilter(f.id)}
                className={`text-[8px] font-black py-2 px-1 rounded-lg border border-white/5 transition-all ${monitoringFilter === f.id ? `${f.color} text-white shadow-lg` : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {(monitoringFilter === 'all' ? MONITORING_LOCATIONS : MONITORING_LOCATIONS.filter(l => l.type === monitoringFilter)).map((loc, i) => (
              <div 
                key={i}
                onClick={() => handleMonitoringLocClick(loc)}
                className={`p-3 rounded-xl border border-white/5 flex justify-between items-center cursor-pointer transition-all hover:bg-white/5 ${selectedMonitoringLoc?.name === loc.name ? 'bg-white/10 border-blue-500/50' : 'bg-white/5'}`}
              >
                <div>
                  <h4 className="text-white font-black text-[11px] uppercase truncate w-40">{loc.name}</h4>
                  <p className="text-slate-500 text-[9px] font-bold mt-0.5">{loc.sub}</p>
                </div>
                <div className={`font-black text-sm italic tracking-tighter ${
                  loc.type === 'hot' ? 'text-red-500' : 
                  loc.type === 'cool' ? 'text-green-500' : 
                  loc.type === 'water' ? 'text-yellow-400' : 'text-blue-400'
                }`}>
                  {loc.val}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Side Panel / Place Details (Left side for desktop, full for mobile) */}
      {selectedProduct && (
        <div className="absolute top-0 bottom-0 left-0 w-full md:w-[450px] bg-white border-r-4 border-black z-[3500] shadow-2xl animate-in slide-in-from-left duration-500 overflow-y-auto no-scrollbar">
          {/* Header Image */}
          <div className="relative h-72">
            <img src={selectedProduct.images.product[0]} className="w-full h-full object-cover" alt={selectedProduct.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 left-6 bg-white border-3 border-black p-3 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <X size={24} strokeWidth={4} />
            </button>
            
            <div className="absolute bottom-6 left-6 right-6">
               <div className="flex items-center gap-2 mb-1">
                 <span className="bg-green-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border border-white/20">
                    <CheckCircle size={10} /> Đã xác thực
                 </span>
               </div>
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none drop-shadow-lg">{selectedProduct.name}</h2>
            </div>
          </div>

          {/* Place Body */}
          <div className="p-8 space-y-8">
            {/* Rating & Certificates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {isBuyerView ? (
                  <>
                    <span className="text-2xl font-black text-black">{selectedProduct.rating || '4.8'}</span>
                    <div className="flex text-orange-500">
                      <Star size={18} fill="currentColor" />
                      <Star size={18} fill="currentColor" />
                      <Star size={18} fill="currentColor" />
                      <Star size={18} fill="currentColor" />
                      <Star size={18} fill="currentColor" className="opacity-30" />
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="bg-black text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      Mã số PUC: {selectedProduct.id.split('-').pop()}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {selectedProduct.certificates.map((cert, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-blue-100">
                    {cert.type}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Assessment Widget - Only for buyers */}
            {isBuyerView && (
              <div className="bg-white border-4 border-black rounded-[2rem] p-6 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={20} className="text-blue-600" />
                    <h3 className="text-sm font-black uppercase tracking-widest">AI Đánh giá chất lượng</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-2xl p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black text-black uppercase mb-1">Độ chín</p>
                      <p className="text-xl font-black">92% <span className="text-[10px] font-bold text-slate-600">(Hoàn hảo)</span></p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black text-black uppercase mb-1">Độ tươi</p>
                      <p className="text-xl font-black">A+ <span className="text-[10px] font-bold text-slate-600">(Vừa thu hoạch)</span></p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-[10px] font-black text-black uppercase mb-1">Dự báo thời gian bảo quản</p>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-blue-700" />
                      <span className="text-sm font-black text-black">7 - 10 ngày (Nhiệt độ phòng)</span>
                    </div>
                  </div>
  
                  <button 
                    onClick={() => {
                      setIsScanningFreshness(true);
                      setFreshnessResult(null);
                      setTimeout(() => {
                        setIsScanningFreshness(false);
                        setFreshnessResult("Sản phẩm đạt độ tươi 98%, không có dấu hiệu dập nát. Phù hợp sử dụng ngay.");
                      }, 2000);
                    }}
                    className={`w-full mt-6 py-4 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${isScanningFreshness ? 'bg-slate-100 text-slate-400 cursor-wait' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    disabled={isScanningFreshness}
                  >
                    {isScanningFreshness ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Đang phân tích ảnh...
                      </>
                    ) : (
                      <>
                        <QrCode size={16} /> Quét độ tươi khi nhận hàng
                      </>
                    )}
                  </button>
                  {freshnessResult && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-[12px] font-black text-black animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-700" />
                        <span className="text-green-700 uppercase tracking-widest text-[10px]">Kết quả AI:</span>
                      </div>
                      {freshnessResult}
                    </div>
                  )}
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5">
                  <TrendingUp size={120} />
                </div>
              </div>
            )}

            {/* Farmer Info */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white rounded-2xl border-2 border-slate-200 p-1 relative">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedProduct.farmerName}`} className="w-full h-full rounded-xl" alt="Farmer" />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                    <CheckCircle size={10} />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-black text-black uppercase tracking-tight">{selectedProduct.farmerName}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chủ vườn • 15 năm kinh nghiệm</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase">VietGAP Certified</span>
                    {isBuyerView && (
                      <>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="text-[10px] font-black text-green-600 uppercase">4.9/5 Rating</span>
                      </>
                    )}
                  </div>
                </div>
                {isBuyerView && (
                  <button className="p-3 bg-white text-blue-600 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                    <MessageSquare size={20} />
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed italic">"Chúng tôi cam kết mang đến những trái {selectedProduct.name} sạch nhất, được chăm sóc theo tiêu chuẩn VietGAP nghiêm ngặt."</p>
                <div className="flex items-center gap-4 pt-3 border-t border-slate-200/50">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Cần Thơ, VN</span>
                  </div>
                  {isBuyerView && (
                    <div className="flex items-center gap-1.5">
                      <Award size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Top 10 Hộ Nông Dân Tiêu Biểu</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Farming Diary (Timeline) - Only for buyers or when relevant */}
            {isBuyerView && (
              <div>
                <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Calendar size={18} className="text-green-600" /> Nhật ký canh tác
                </h3>
                <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {selectedProduct.timeline.map((update, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 bg-white border-4 border-green-600 rounded-full z-10" />
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{update.date}</p>
                      <h5 className="font-black text-black text-sm uppercase tracking-tight mb-1">{update.stage}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">{update.description}</p>
                      {update.imageUrl && (
                        <img src={update.imageUrl} className="mt-3 rounded-2xl w-full h-32 object-cover border border-slate-100" alt="Update" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Checkout Section - Only for buyers */}
            {isBuyerView && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                {!showCheckout ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        if (!cart.find(p => p.id === selectedProduct.id)) {
                          setCart([...cart, selectedProduct]);
                        }
                      }}
                      className={`flex-1 border-4 border-black py-4 rounded-[2rem] font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 transition-all flex flex-col items-center justify-center gap-1 ${
                        cart.find(p => p.id === selectedProduct.id) 
                          ? 'bg-green-600 text-white border-green-800' 
                          : 'bg-white text-black'
                      }`}
                    >
                      {cart.find(p => p.id === selectedProduct.id) ? (
                        <>
                          <Heart size={28} fill="currentColor" />
                          <span className="text-base leading-none text-center">Đã quan tâm</span>
                        </>
                      ) : (
                        <>
                          <Heart size={28} />
                          <span className="text-base leading-none text-center">Quan tâm</span>
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        if (onNegotiate && selectedProduct) {
                          onNegotiate(selectedProduct);
                          setSelectedProduct(null);
                        }
                      }}
                      className="flex-[2] bg-black text-white border-4 border-black py-5 px-10 rounded-[2rem] font-black text-lg uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95 transition-all flex items-center justify-center gap-4 group overflow-hidden whitespace-nowrap"
                    >
                      <span>Bắt đầu thương lượng</span>
                      <MessageSquare size={24} className="group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chọn khung giờ giao hàng</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00'].map(slot => (
                          <button 
                            key={slot}
                            onClick={() => setDeliverySlot(slot)}
                            className={`py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${deliverySlot === slot ? 'bg-black text-white border-black' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2 border border-slate-100">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-bold">Khoảng cách từ vườn:</span>
                        <span className="text-black font-black">12.5 km</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-bold">Phí vận chuyển (2.000đ/km):</span>
                        <span className="text-black font-black">25.000 VNĐ</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-bold">Giá sản phẩm:</span>
                        <span className="text-black font-black">160.000 VNĐ</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                        <span className="text-black font-black uppercase tracking-tight">Tổng cộng:</span>
                        <span className="text-green-700 font-black text-lg">185.000 VNĐ</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setShowCheckout(false)}
                        className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-sm uppercase transition-all"
                      >
                        Hủy
                      </button>
                      <button 
                        onClick={() => {
                          if (onNegotiate && selectedProduct) {
                            onNegotiate(selectedProduct);
                            setShowCheckout(false);
                            setSelectedProduct(null);
                          }
                        }}
                        className="flex-[2] bg-green-600 text-white py-4 rounded-2xl font-black text-sm uppercase shadow-lg shadow-green-200 transition-all hover:scale-[1.02] active:scale-95"
                      >
                        Gửi yêu cầu thương lượng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Weather Summary Widget (Top Right) - REMOVED FOR CUSTOMER */}

      {/* 3. Floating Quick Buttons (Right side) */}
      <div className="absolute bottom-32 right-6 z-[1000] flex flex-col gap-3">
        {/* Cart Button for Buyers */}
        {isBuyerView && (
          <>
            <button 
              onClick={() => {
                setShowCart(true);
                setCartView('cart');
              }}
              className="bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all text-black active:translate-x-1 active:translate-y-1 active:shadow-none relative"
              title="Giỏ hàng"
            >
              <ShoppingCart size={28} strokeWidth={4} className="text-green-700" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  {cart.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => {
                setShowCart(true);
                setCartView('orders');
              }}
              className="bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 transition-all text-black active:translate-x-1 active:translate-y-1 active:shadow-none relative"
              title="Lịch sử đơn hàng"
            >
              <Package size={28} strokeWidth={4} className="text-blue-700" />
              {orders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  {orders.length}
                </span>
              )}
            </button>
          </>
        )}

        {/* Toggle Monitoring Mode Button - REMOVED */}

      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="absolute inset-0 z-[4000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in duration-300">
            <div className="p-8 border-b-4 border-black flex items-center justify-between bg-green-50">
              <div className="flex gap-4">
                <button 
                  onClick={() => setCartView('cart')}
                  className={`text-xl font-black uppercase tracking-tighter flex items-center gap-2 pb-1 border-b-4 transition-all ${cartView === 'cart' ? 'text-black border-black' : 'text-slate-400 border-transparent'}`}
                >
                  <ShoppingCart size={24} /> Giỏ hàng
                </button>
                <button 
                  onClick={() => setCartView('orders')}
                  className={`text-xl font-black uppercase tracking-tighter flex items-center gap-2 pb-1 border-b-4 transition-all ${cartView === 'orders' ? 'text-black border-black' : 'text-slate-400 border-transparent'}`}
                >
                  <Package size={24} /> Đơn hàng
                </button>
              </div>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-white rounded-full transition-colors border-2 border-transparent hover:border-black">
                <X size={24} strokeWidth={4} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
              {cartView === 'cart' ? (
                cart.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-100">
                      <ShoppingCart size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Giỏ hàng trống</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 group relative">
                      <img src={item.images.product[0]} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm" alt={item.name} />
                      <div className="flex-1">
                        <h4 className="font-black text-black uppercase tracking-tight text-sm">{item.name}</h4>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{item.farmerName}</p>
                        <p className="text-xs font-black text-green-700 mt-1">160.000 VNĐ</p>
                      </div>
                      <button 
                        onClick={() => setCart(cart.filter(p => p.id !== item.id))}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))
                )
              ) : (
                orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-slate-100">
                      <Package size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Chưa có đơn hàng nào</p>
                  </div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="p-5 bg-slate-50 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-[10px] font-black text-black uppercase tracking-widest">{order.id}</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[8px] font-black uppercase">{order.status}</span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between group/item">
                            <div className="flex items-center gap-3">
                              <img src={item.images.product[0]} className="w-10 h-10 rounded-lg object-cover border border-slate-200" alt={item.name} />
                              <div className="flex-1">
                                <p className="text-[11px] font-black text-black uppercase leading-tight">{item.name}</p>
                                <p className="text-[9px] font-bold text-slate-500 uppercase">{item.farmerName}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                mapRef.current?.flyTo([item.location.lat, item.location.lng], 15, { duration: 1.5 });
                                setSelectedProduct(item);
                                setShowCart(false);
                              }}
                              className="p-2 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all opacity-0 group-hover/item:opacity-100"
                              title="Xem trên bản đồ"
                            >
                              <MapPin size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{order.date}</span>
                        <span className="text-sm font-black text-green-700">{(order.total || 0).toLocaleString()} VNĐ</span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>

            {cartView === 'cart' && cart.length > 0 && (
              <div className="p-8 border-t-4 border-black bg-slate-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Tổng cộng ({cart.length} món):</span>
                  <span className="text-2xl font-black text-green-700 tracking-tighter">{cart.length * 160000} VNĐ</span>
                </div>
                <button 
                  onClick={() => {
                    const newOrder = {
                      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                      items: [...cart],
                      total: cart.length * 160000 + 25000,
                      date: new Date().toLocaleString(),
                      status: 'Đang xử lý'
                    };
                    setOrders([newOrder, ...orders]);
                    setCart([]);
                    setCartView('orders');
                  }}
                  className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg uppercase tracking-tighter shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Tiến hành thanh toán
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop when side panel is open on mobile */}
      {selectedProduct && (
        <div 
          className="md:hidden absolute inset-0 bg-black/40 z-[2500] backdrop-blur-[2px]" 
          onClick={() => setSelectedProduct(null)}
        />
      )}
      <style>{`
        .agriculture-popup .leaflet-popup-content-wrapper,
        .sensor-popup .leaflet-popup-content-wrapper {
          border-radius: 2rem;
          padding: 0;
          overflow: hidden;
          border: 4px solid black;
          box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
          background: #0f172a; /* Dark theme for monitoring popups */
          color: white;
        }
        .agriculture-popup .leaflet-popup-content,
        .sensor-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .agriculture-popup .leaflet-popup-tip,
        .sensor-popup .leaflet-popup-tip {
          background: black;
        }
        .leaflet-container {
          font-family: 'Inter', sans-serif;
        }
        
        /* Monitoring Marker Animations */
        @keyframes ripple {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(2.5); opacity: 0; }
        }
        .ripple {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 2px solid currentColor;
            animation: ripple 2s infinite;
        }
        .ripple-2 { animation-delay: 0.5s; }
        .type-hot { color: #ef4444; }
        .type-water { color: #f59e0b; }
        .type-rain { color: #3b82f6; }
      `}</style>
      </div>
    </div>
  );
};

export default MapInterface;
