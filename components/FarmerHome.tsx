
import React from 'react';
import { 
  Sprout, FileSignature, CloudSun, BookOpen, 
  ShieldCheck, Search, ChevronRight, TrendingDown, 
  TrendingUp, LayoutGrid, Calendar, Info, Thermometer, Bell, Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface FarmerHomeProps {
  onNavigate: (tab: any) => void;
  onOpenWeather: () => void;
  farmName: string;
}

const FarmerHome: React.FC<FarmerHomeProps> = ({ onNavigate, onOpenWeather, farmName }) => {
  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans text-slate-800">
      {/* Top Hero Section - More compact padding */}
      <div className="bg-slate-900 pt-10 pb-20 px-6 rounded-b-[3.5rem] relative shadow-2xl overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
        
        <div className="flex justify-between items-center mb-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <Sprout className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tighter uppercase leading-none">AgriMap</h1>
              <p className="text-[7px] font-black text-emerald-400 uppercase tracking-[0.3em] mt-0.5">Digital Farm Hub</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative group">
              <motion.div 
                whileHover={{ rotate: 15 }}
                className="p-2.5 bg-white/10 text-white rounded-xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                <Bell size={18} />
              </motion.div>
              <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></div>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 space-y-1 mb-2"
        >
          <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-[0.3em]">Hệ sinh thái nông nghiệp</p>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-tight">
            Chào {farmName || 'Nông hộ'}
          </h2>
        </motion.div>

        {/* Search Bar - More refined shadow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute -bottom-7 left-6 right-6 z-20"
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 flex items-center px-5 py-4 border border-slate-100 group transition-all">
            <Search className="text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Bạn muốn tìm gì hôm nay?" 
              className="flex-1 bg-transparent outline-none text-slate-800 font-bold px-3 text-xs placeholder:text-slate-300"
            />
            <div className="p-1.5 bg-slate-50 text-slate-400 rounded-lg">
              <Sparkles size={14} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Access Grid - Optimized spacing */}
      <div className="mt-14 px-6">
        <div className="grid grid-cols-3 gap-y-8 gap-x-5">
          {[
            { label: 'Đăng ký', icon: <PlusSquareIcon />, color: 'bg-emerald-500 text-white', tab: 'register' },
            { label: 'Nhật ký', icon: <BookOpen size={20} />, color: 'bg-blue-500 text-white', tab: 'diary' },
            { label: 'Bản đồ', icon: <Thermometer size={20} />, color: 'bg-orange-500 text-white', tab: 'heatmap' },
            { label: 'Hồ sơ', icon: <LayoutGrid size={20} />, color: 'bg-slate-900 text-white', tab: 'list' },
            { label: 'Thời tiết', icon: <CloudSun size={20} />, color: 'bg-amber-400 text-white', action: onOpenWeather },
            { label: 'Hợp đồng', icon: <FileSignature size={20} />, color: 'bg-purple-500 text-white', tab: 'contracts' },
          ].map((item, i) => (
            <motion.button 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + (i * 0.04) }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (item.tab) onNavigate(item.tab);
                if (item.action) item.action();
              }}
              className="flex flex-col items-center gap-2.5 transition-all"
            >
              <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-200"></div>
                <div className="relative z-10">{item.icon}</div>
              </div>
              <span className="text-[11px] font-black text-slate-600 text-center uppercase tracking-wider">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Market Prices Section */}
      <div className="mt-16 px-6">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-3">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div> Thị trường hôm nay
            </h3>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Giá nông sản</h2>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05, x: 5 }}
            className="text-emerald-600 font-black text-[11px] uppercase tracking-widest flex items-center gap-1 mb-1"
          >
            Tất cả <ChevronRight size={14} />
          </motion.button>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar">
          <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 whitespace-nowrap">Trong nước</button>
          <button className="bg-white text-slate-400 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 whitespace-nowrap">Quốc tế</button>
          <button className="bg-white text-slate-400 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 whitespace-nowrap">Xuất khẩu</button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <PriceCard 
            title="Hồ tiêu" 
            price="151.000đ" 
            change="-500" 
            trend="down" 
            sub="Tiêu đen xô" 
            loc="Hồ Chí Minh" 
            img="https://cdn-icons-png.flaticon.com/512/3211/3211110.png"
            index={0}
          />
          <PriceCard 
            title="Sầu riêng" 
            price="40.000đ" 
            change="+1.200" 
            trend="up" 
            sub="Ri6 loại 1" 
            loc="Tiền Giang" 
            img="https://cdn-icons-png.flaticon.com/512/3211/3211024.png"
            index={1}
          />
        </div>
      </div>

      {/* Featured Banner */}
      <div className="mt-16 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl shadow-emerald-500/20 group"
        >
          {/* Animated Background Elements */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
          ></motion.div>

          <div className="relative z-10 text-white space-y-6">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">Gợi ý hôm nay</p>
              <h3 className="text-4xl font-black tracking-tighter uppercase leading-tight italic">Xem gì<br />hôm nay?</h3>
            </div>
            
            <div className="flex items-center gap-3 bg-black/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
              <Calendar size={18} className="text-emerald-200" />
              <span className="font-bold text-sm tracking-tight">{new Date().toLocaleDateString('vi-VN')}</span>
            </div>
            
            <button className="bg-white text-emerald-700 px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl group-hover:scale-105 transition-all flex items-center gap-2">
              Tìm hiểu ngay <ChevronRight size={16} />
            </button>
          </div>

          <div className="absolute -right-10 -bottom-10 opacity-10 transform -rotate-12 group-hover:scale-110 transition-transform duration-700">
             <div className="w-64 h-64 bg-white rounded-full flex items-center justify-center">
                <TrendingUp size={120} className="text-emerald-950" />
             </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 text-center pb-8">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">AgriMap Premium v2.5.0</p>
      </div>
    </div>
  );
};

const PlusSquareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
);

const PriceCard: React.FC<{title: string, price: string, change: string, trend: 'up' | 'down', sub: string, loc: string, img: string, index: number}> = ({
  title, price, change, trend, sub, loc, img, index
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -6 }}
    className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group"
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 p-2 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
        <img src={img} className="w-full h-full object-contain" alt={title} />
      </div>
      <span className="font-black text-slate-800 uppercase tracking-tighter text-sm">{title}</span>
    </div>
    
    <div className="space-y-2">
      <p className="text-xl font-black text-slate-900 tracking-tight">{price}</p>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter ${trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
          {trend === 'up' ? <TrendingUp size={10}/> : <TrendingDown size={10}/>}
          {change}
        </div>
      </div>
    </div>
    
    <div className="mt-6 pt-5 border-t border-slate-50 flex flex-col gap-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sub}</p>
      <div className="flex items-center gap-1">
        <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">{loc}</p>
      </div>
    </div>
  </motion.div>
);

export default FarmerHome;
