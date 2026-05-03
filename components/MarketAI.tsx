
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Info, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Brain,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  CloudRain,
  Thermometer,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { MarketAiService } from '../services/marketAiService';
import { 
  MarketProduct, 
  MarketPrediction, 
  LocationRecommendation,
  MarketPrice
} from '../types';
import { 
  MOCK_MARKET_PRODUCTS,
  MOCK_MARKET_PRICES
} from '../constants';

interface MarketAIProps {
  onViewOnMap?: (lat: number, lng: number, name: string) => void;
}

const MarketAI: React.FC<MarketAIProps> = ({ onViewOnMap }) => {
  const [selectedProduct, setSelectedProduct] = useState<MarketProduct>(MOCK_MARKET_PRODUCTS[0]);
  const [prediction, setPrediction] = useState<MarketPrediction | null>(null);
  const [recommendations, setRecommendations] = useState<LocationRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<'forecast' | 'locations'>('forecast');

  const productPrices = useMemo(() => {
    return MOCK_MARKET_PRICES.filter(p => p.product_id === selectedProduct.product_id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-15); // Lấy 15 ngày gần nhất
  }, [selectedProduct]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pred, recs] = await Promise.all([
        MarketAiService.getMarketPrediction(selectedProduct),
        MarketAiService.getLocationRecommendations(selectedProduct)
      ]);
      setPrediction(pred);
      setRecommendations(recs);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProduct]);

  const getBuyScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600 bg-emerald-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getDecisionBadge = (rec: string) => {
    switch (rec) {
      case 'buy': return { label: 'MUA NGAY', color: 'bg-emerald-600 shadow-emerald-500/40', icon: <ShoppingBag size={18} /> };
      case 'consider': return { label: 'CÂN NHẮC', color: 'bg-amber-600 shadow-amber-500/40', icon: <Info size={18} /> };
      case 'wait': return { label: 'CHỜ ĐỢI', color: 'bg-red-600 shadow-red-500/40', icon: <Zap size={18} /> };
      default: return { label: 'CHƯA RÕ', color: 'bg-slate-600', icon: <AlertCircle size={18} /> };
    }
  };

  if (!prediction) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      {/* Header & Product Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-black uppercase tracking-tighter flex items-center gap-3">
            <Brain className="text-emerald-600" size={36} /> 
            AI Dự báo thị trường
          </h2>
          <p className="text-slate-500 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
            Hệ thống phân tích Price-Supply-Weather Hybrid <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          </p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-3xl border-2 border-slate-200">
          {MOCK_MARKET_PRODUCTS.map((p) => (
            <button
              key={p.product_id}
              onClick={() => setSelectedProduct(p)}
              className={`px-6 py-3 rounded-2xl font-black uppercase text-xs transition-all ${
                selectedProduct.product_id === p.product_id 
                ? 'bg-white text-emerald-700 shadow-md border-2 border-emerald-100' 
                : 'text-slate-500 hover:text-black'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metrics & Chart */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Card */}
          <div className="bg-white border-4 border-black rounded-[3rem] p-10 shadow-[20px_20px_0px_0px_rgba(16,185,129,0.1)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Brain size={120} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-12">
              {/* Buy Score Gauge */}
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2.5rem] border-4 border-slate-100 w-full md:w-64">
                <div className={`relative w-40 h-40 flex items-center justify-center rounded-full border-8 ${getBuyScoreColor(prediction.buy_score).split(' ')[1]} border-white shadow-xl`}>
                  <div className="text-center">
                    <span className={`text-5xl font-black block leading-none ${getBuyScoreColor(prediction.buy_score).split(' ')[0]}`}>{prediction.buy_score}</span>
                    <span className="text-[10px] font-black uppercase text-slate-400">Buy Score</span>
                  </div>
                </div>
                <div className={`mt-6 px-6 py-2 rounded-xl font-black text-xs uppercase ${getBuyScoreColor(prediction.buy_score)}`}>
                  {getDecisionBadge(prediction.recommendation).label}
                </div>
              </div>

              {/* Insights & Strategy */}
              <div className="flex-1 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-4">Chiến lược AI</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prediction.insights.map((insight, i) => (
                      <div key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <span className="text-sm font-bold text-slate-700">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-[2rem] border-4 border-black ${getDecisionBadge(prediction.recommendation).color} text-white flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      {getDecisionBadge(prediction.recommendation).icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase opacity-80 tracking-widest">Khuyến nghị hiện tại</p>
                      <h4 className="text-xl font-black uppercase tracking-tight">{prediction.reason[0]}</h4>
                    </div>
                  </div>
                  <button className="bg-white text-black p-3 rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white border-4 border-black rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-2">
                 <TrendingUp size={24} className="text-amber-600" /> Biến động & Dự báo giá
               </h3>
               <div className="flex gap-2">
                 <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                   <div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Lịch sử
                 </span>
                 <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400">
                   <div className="w-3 h-3 border-2 border-emerald-500 border-dashed rounded-full"></div> AI Dự báo
                 </span>
               </div>
             </div>

             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={productPrices}>
                   <defs>
                     <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}}
                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                   />
                   <YAxis 
                    hide 
                    domain={['dataMin - 2000', 'dataMax + 2000']} 
                   />
                   <Tooltip 
                    contentStyle={{borderRadius: '1.5rem', border: '4px solid black', fontWeight: 900, fontSize: '12px'}}
                    formatter={(value: number) => [`${value.toLocaleString()}đ`, 'Giá TB']}
                   />
                   <Area 
                    type="monotone" 
                    dataKey="avg_price" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    animationDuration={2000}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>

             <div className="grid grid-cols-2 gap-6 mt-8">
               <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dự báo 3 ngày tới</p>
                   <p className="text-2xl font-black text-black">{prediction.predictions['3d'].toLocaleString()}đ</p>
                 </div>
                 <ArrowUpRight className="text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </div>
               <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dự báo 7 ngày tới</p>
                   <p className="text-2xl font-black text-black">{prediction.predictions['7d'].toLocaleString()}đ</p>
                 </div>
                 <ArrowUpRight className="text-emerald-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Province recommendations & Weather */}
        <div className="lg:col-span-4 space-y-8">
          {/* Best Locations */}
          <div className="bg-black text-white rounded-[3rem] p-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-2">
                <MapPin size={24} className="text-emerald-400" /> Vùng thu mua tối ưu
              </h3>
              
              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="bg-white/10 hover:bg-white/20 p-6 rounded-3xl transition-all border border-white/10 flex items-center justify-between group/rec">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => onViewOnMap?.(rec.lat, rec.lng, rec.best_location)}
                        className="p-3 bg-white/10 group-hover/rec:bg-emerald-500 rounded-2xl transition-all"
                        title="Xem vị trí vùng trồng trên bản đồ"
                      >
                        <MapPin size={20} className="group-hover/rec:scale-110 transition-transform" />
                      </button>
                      <div>
                        <p className="text-lg font-black">{rec.best_location}</p>
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Tiết kiệm {rec.saving}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black">{rec.expected_price.toLocaleString()}đ</p>
                      <p className="text-[10px] font-medium text-slate-400">Cách {rec.distance_km}km</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase text-xs transition-all shadow-lg">
                  Kết nối thương lái vùng này
                </button>
              </div>
            </div>
            
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <ShoppingBag size={200} />
            </div>
          </div>

          {/* Weather Impact */}
          <div className="bg-white border-4 border-black rounded-[3rem] p-10">
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-6 flex items-center gap-2">
              <CloudRain size={24} className="text-blue-600" /> Tác động thời tiết
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                <div className="flex items-center gap-3">
                  <Thermometer className="text-blue-700" size={24} />
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-800 tracking-widest">Nhiệt độ trung bình</p>
                    <p className="text-2xl font-black text-blue-900">32°C</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-blue-600 bg-white px-2 py-1 rounded-md">Tốt</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border-2 border-amber-100">
                <div className="flex items-center gap-3">
                    <CloudRain className="text-amber-700" size={24} />
                    <div>
                      <p className="text-[10px] font-black uppercase text-amber-800 tracking-widest">Lượng mưa</p>
                      <p className="text-2xl font-black text-amber-900">20mm</p>
                    </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-amber-600 bg-white px-2 py-1 rounded-md">Cảnh báo</span>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 italic text-xs font-bold text-slate-500 leading-relaxed">
                "Hiện tượng El Nino ảnh hưởng đến giai đoạn kết trái tại các tỉnh miền Tây. Nguồn cung Xoài Cát Chu có thể giảm 15% trong tháng tới."
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAI;
