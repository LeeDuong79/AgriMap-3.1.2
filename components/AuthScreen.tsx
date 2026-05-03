
import React, { useState, useEffect, useRef } from 'react';
import { UserRole, AdminLevel, User, FarmerUser, AdminUser } from '../types';
import { Logo } from './Logo';
import { 
  ShieldCheck, User as UserIcon, MapPin, Phone, Lock, 
  Mail, Landmark, CheckCircle2, ChevronRight, Fingerprint,
  Building2, Camera, MapIcon, KeyRound, ArrowLeft, ArrowRight
} from 'lucide-react';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'CHOICE' | 'AUTH' | 'OTP'>('CHOICE');
  const [activeBranch, setActiveBranch] = useState<UserRole.FARMER | UserRole.ADMIN | UserRole.BUYER | null>(null);
  const [isRegister, setIsRegister] = useState(false);
  
  // Farmer State
  const [farmerData, setFarmerData] = useState({
    farmName: '',
    rep: '',
    cccd: '',
    phone: '',
    province: 'Bến Tre',
    district: '',
    commune: '',
    location: null as { lat: number, lng: number } | null
  });

  // Admin State
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    otp: ''
  });

  // Customer State
  const [customerData, setCustomerData] = useState({
    email: '',
    password: '',
    companyName: ''
  });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize Map for Farmer Location Pinning
  useEffect(() => {
    if (isRegister && activeBranch === UserRole.FARMER && mapContainerRef.current && !mapRef.current) {
      setTimeout(() => {
        if (!mapContainerRef.current) return;
        mapRef.current = L.map(mapContainerRef.current).setView([10.2435, 106.3756], 13);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(mapRef.current);
        
        mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setFarmerData(prev => ({ ...prev, location: { lat, lng } }));
          if (markerRef.current) {
            markerRef.current.setLatLng(e.latlng);
          } else {
            markerRef.current = L.marker(e.latlng).addTo(mapRef.current!);
          }
        });
      }, 300);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isRegister, activeBranch]);

  const handleFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerData.location) return;
    const user: FarmerUser = {
      id: 'F-' + Date.now(),
      role: UserRole.FARMER,
      farmName: farmerData.farmName,
      representative: farmerData.rep,
      cccd: farmerData.cccd,
      phone: farmerData.phone,
      address: { province: farmerData.province, district: farmerData.district, commune: farmerData.commune, detail: '' },
      location: farmerData.location
    };
    onLogin(user);
  };

  const handleAdminLogin = () => {
    if (step === 'AUTH') {
      setStep('OTP');
    } else {
      const user: AdminUser = {
        id: 'A-01',
        role: UserRole.ADMIN,
        fullName: 'Nguyễn Văn Quản Lý',
        adminId: 'GOV-889',
        position: 'Cán bộ điều hành cấp cao',
        unit: 'Bộ Nông nghiệp',
        level: AdminLevel.CENTRAL,
        assignedArea: 'Toàn quốc',
        username: 'admin.gov',
        email: 'admin@mard.gov.vn',
        phone: '0912345678',
        status: 'ACTIVE'
      };
      onLogin(user);
    }
  };

  const handleCustomerLogin = () => {
    // Check if there's a saved buyer ID in localStorage to keep sessions linked
    const existingBuyerId = localStorage.getItem('agrimap_demo_buyer_id');
    const buyerId = existingBuyerId || ('C-DEMO-' + Math.random().toString(36).substr(2, 5).toUpperCase());
    
    if (!existingBuyerId) {
      localStorage.setItem('agrimap_demo_buyer_id', buyerId);
    }

    const user: User = {
      id: buyerId,
      role: UserRole.BUYER,
      fullName: 'Nguyễn Khách Hàng',
      companyName: customerData.companyName || 'Cty TNHH Rau Sạch Việt',
      phone: '0988776655',
      email: customerData.email || 'contact@rausachviet.vn',
      address: 'TP. Hồ Chí Minh',
      status: 'ACTIVE'
    };
    onLogin(user);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" as const } 
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { duration: 0.4 } 
    }
  };

  const cardVariants = {
    hover: { 
      scale: 1.02, 
      transition: { type: "spring" as const, stiffness: 300 } 
    },
    tap: { scale: 0.98 }
  };

  if (step === 'CHOICE') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-100 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
        
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 w-full max-w-6xl"
        >
          <div className="mb-16 text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block p-4 mb-6"
            >
              <Logo size="lg" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase mb-4 font-display">
              AgriMap VN
            </h1>
            <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-[0.3em]">
              Hệ thống số hóa Nông nghiệp Quốc gia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Farmer Choice */}
            <motion.button 
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => { setActiveBranch(UserRole.FARMER); setStep('AUTH'); }}
              className="group bg-white p-8 rounded-[2.5rem] text-left border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(21,128,61,0.1)] transition-all flex flex-col"
            >
              <div className="bg-green-50 text-green-700 p-5 rounded-2xl w-fit mb-8 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                <UserIcon size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase font-display">Tôi là Nông dân</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">Đăng ký vùng trồng, cập nhật sản lượng và kết nối thị trường tiêu thụ.</p>
              <div className="mt-auto flex items-center gap-2 text-xs font-black text-green-700 tracking-widest uppercase items-center">
                Bắt đầu ngay <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Customer Choice */}
            <motion.button 
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => { setActiveBranch(UserRole.BUYER); setStep('AUTH'); }}
              className="group bg-white p-8 rounded-[2.5rem] text-left border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(29,78,216,0.1)] transition-all flex flex-col"
            >
              <div className="bg-blue-50 text-blue-700 p-5 rounded-2xl w-fit mb-8 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Building2 size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase font-display">Tôi là Khách hàng</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">Tìm kiếm nguồn cung, quản lý đơn hàng và theo dõi chuỗi cung ứng nông sản sạch.</p>
              <div className="mt-auto flex items-center gap-2 text-xs font-black text-blue-700 tracking-widest uppercase">
                Khám phá thị trường <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Admin Choice */}
            <motion.button 
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => { setActiveBranch(UserRole.ADMIN); setStep('AUTH'); }}
              className="group bg-white p-8 rounded-[2.5rem] text-left border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all flex flex-col"
            >
              <div className="bg-slate-50 text-slate-700 p-5 rounded-2xl w-fit mb-8 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3 uppercase font-display">Cán bộ Nhà nước</h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed mb-10">Quản lý thực địa, phê duyệt mã số vùng trồng và điều hành dữ liệu số.</p>
              <div className="mt-auto flex items-center gap-2 text-xs font-black text-slate-900 tracking-widest uppercase">
                Truy cập cổng công vụ <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>

          <p className="mt-20 text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] opacity-80">
            Bản quyền © 2024 Bộ chuyên ngành • Nền tảng AgriMap
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative border-4 border-white"
      >
        
        {/* Sidebar Status */}
        <div className={`md:w-[35%] p-10 text-white flex flex-col justify-between relative overflow-hidden ${activeBranch === UserRole.FARMER ? 'bg-green-700' : activeBranch === UserRole.BUYER ? 'bg-blue-700' : 'bg-slate-900'}`}>
          {/* Subtle noise/texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"></div>
          
          <div className="relative z-10">
            <button 
              onClick={() => { setStep('CHOICE'); setIsRegister(false); }} 
              className="inline-flex items-center gap-2 text-white/70 hover:text-white font-black text-xs mb-12 tracking-widest transition-all"
            >
              <ArrowLeft size={16} /> QUAY LẠI
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20"
            >
              {activeBranch === UserRole.FARMER ? <UserIcon size={32} /> : activeBranch === UserRole.BUYER ? <Building2 size={32} /> : <ShieldCheck size={32} />}
            </motion.div>
            <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter leading-none font-display">
              {activeBranch === UserRole.FARMER ? 'Khu vực\nNông dân' : activeBranch === UserRole.BUYER ? 'Cổng\nKhách hàng' : 'Cổng\nCông vụ'}
            </h2>
            <p className="text-sm font-medium text-white/60 leading-relaxed max-w-xs">
              {activeBranch === UserRole.FARMER 
                ? "Bắt đầu số hóa nông hộ để mở khóa các đặc quyền hỗ trợ từ Chính phủ và kết nối thị trường."
                : activeBranch === UserRole.BUYER
                ? "Truy cập kho dữ liệu nông sản sạch, minh bạch nguồn gốc và hỗ trợ giao dịch số."
                : "Hệ thống bảo mật cao dành riêng cho viên chức. Vui lòng đăng nhập để bắt đầu phiên làm việc."}
            </p>
          </div>

          <div className="relative z-10 pt-12">
            <div className="flex items-center gap-3 bg-black/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
               <Fingerprint size={20} className="text-white/60" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Xác thực an toàn đa lớp</span>
            </div>
          </div>
        </div>

        {/* Form Area */}
        <div className="flex-1 p-10 md:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar bg-white">
          <AnimatePresence mode="wait">
            {activeBranch === UserRole.FARMER && (
              <motion.div 
                key={isRegister ? 'farmer-reg' : 'farmer-login'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col mb-10">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2 font-display">
                    {isRegister ? 'Đăng ký Nông hộ' : 'Đăng nhập'}
                  </h2>
                  <p className="text-sm font-medium text-slate-400">
                    {isRegister ? 'Điền thông tin để tham gia hệ sinh thái' : 'Sử dụng số điện thoại của bạn'}
                  </p>
                  <button onClick={() => setIsRegister(!isRegister)} className="mt-4 text-green-700 font-bold uppercase text-[11px] tracking-widest hover:text-green-800 transition-colors w-fit underline underline-offset-4">
                    {isRegister ? 'Bạn đã có tài khoản?' : 'Đăng ký nông hộ mới'}
                  </button>
                </div>

                {isRegister ? (
                  <form onSubmit={handleFarmerSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên nhà vườn / HTX</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-green-700/10 focus:border-green-700 outline-none transition-all placeholder:font-medium text-sm" placeholder="HTX Bến Tre..." value={farmerData.farmName} onChange={e => setFarmerData({...farmerData, farmName: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Người đại diện</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-green-700/10 focus:border-green-700 outline-none transition-all placeholder:font-medium text-sm" placeholder="Nguyễn Văn A" value={farmerData.rep} onChange={e => setFarmerData({...farmerData, rep: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-green-700/10 focus:border-green-700 outline-none transition-all placeholder:font-medium text-sm" placeholder="09xxx..." value={farmerData.phone} onChange={e => setFarmerData({...farmerData, phone: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">CCCD (Mã số nông hộ)</label>
                        <input required type="password" placeholder="••••••••••••" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-green-700/10 focus:border-green-700 outline-none transition-all placeholder:font-medium text-sm" value={farmerData.cccd} onChange={e => setFarmerData({...farmerData, cccd: e.target.value})} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <MapPin size={14} className="text-red-500" /> Vị trí vùng trồng
                      </label>
                      <div ref={mapContainerRef} className="h-44 w-full rounded-[1.5rem] border-2 border-slate-100 bg-slate-50 overflow-hidden relative shadow-inner">
                        {!farmerData.location && (
                          <div className="absolute inset-0 z-[1000] bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
                            <MapPin className="animate-pulse mb-2" size={24} />
                            <span className="text-xs font-black uppercase tracking-widest">Chạm vào bản đồ để ghim tọa độ</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      disabled={!farmerData.location}
                      className={`w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${farmerData.location ? 'bg-green-700 hover:bg-green-800 shadow-lg shadow-green-900/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                    >
                      HOÀN TẤT ĐĂNG KÝ <ArrowRight size={18} />
                    </motion.button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Số điện thoại</label>
                      <div className="relative">
                         <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                         <input className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl font-bold focus:border-green-700 focus:ring-2 focus:ring-green-700/10 outline-none transition-all placeholder:font-medium text-sm" placeholder="Nhập số điện thoại..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                      <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                         <input type="password" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl font-bold focus:border-green-700 focus:ring-2 focus:ring-green-700/10 outline-none transition-all placeholder:font-medium text-sm" placeholder="••••••••" />
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onLogin({
                        id: 'F-DEMO', 
                        role: UserRole.FARMER,
                        farmName: 'Nông trại Xanh Bến Tre',
                        representative: 'Nguyễn Văn An',
                        cccd: '012345678901',
                        phone: '0912345678',
                        address: { province: 'Bến Tre', district: 'Châu Thành', commune: 'Quới Sơn', detail: 'Ấp 1' },
                        location: { lat: 10.2435, lng: 106.3756 }
                      } as any)} 
                      className="w-full py-5 bg-green-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-green-900/20 hover:bg-green-800 transition-all"
                    >
                      ĐĂNG NHẬP NGAY
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {activeBranch === UserRole.BUYER && (
              <motion.div 
                key={isRegister ? 'buyer-reg' : 'buyer-login'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col mb-10">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2 font-display">
                    {isRegister ? 'Đăng ký Đối tác' : 'Đăng nhập'}
                  </h2>
                  <p className="text-sm font-medium text-slate-400">
                    {isRegister ? 'Dành cho doanh nghiệp thu mua nông sản' : 'Dành cho đối tác mua bán'}
                  </p>
                  <button onClick={() => setIsRegister(!isRegister)} className="mt-4 text-blue-700 font-bold uppercase text-[11px] tracking-widest hover:text-blue-800 transition-colors w-fit underline underline-offset-4">
                    {isRegister ? 'Quay lại đăng nhập?' : 'Đăng ký doanh nghiệp mới'}
                  </button>
                </div>

                {isRegister ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleCustomerLogin(); }} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên doanh nghiệp</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-blue-700/10 focus:border-blue-700 outline-none transition-all placeholder:font-medium text-sm" placeholder="Cty TNHH Rau Sạch..." value={customerData.companyName} onChange={e => setCustomerData({...customerData, companyName: e.target.value})} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email liên hệ</label>
                        <input required type="email" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold focus:ring-2 focus:ring-blue-700/10 focus:border-blue-700 outline-none transition-all placeholder:font-medium text-sm" placeholder="contact@company.com" value={customerData.email} onChange={e => setCustomerData({...customerData, email: e.target.value})} />
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit" 
                      className="w-full py-5 bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all font-display"
                    >
                      HOÀN TẤT ĐĂNG KÝ
                    </motion.button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email đăng nhập</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                         <input className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl font-bold focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 outline-none transition-all placeholder:font-medium text-sm" placeholder="contact@rausachviet.vn" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                      <div className="relative">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                         <input type="password" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl font-bold focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10 outline-none transition-all placeholder:font-medium text-sm" placeholder="••••••••" />
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleCustomerLogin} 
                      className="w-full py-5 bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-blue-800 transition-all font-display"
                    >
                      ĐĂNG NHẬP NGAY
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}

            {activeBranch === UserRole.ADMIN && (
              <motion.div 
                key={step === 'OTP' ? 'admin-otp' : 'admin-login'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2 font-display">
                    {step === 'OTP' ? 'Xác thực OTP' : 'Đăng nhập Công vụ'}
                  </h2>
                  <p className="text-sm font-medium text-slate-400 italic">
                    {step === 'OTP' ? 'Kiểm tra tin nhắn trên thiết bị di động' : 'Dành cho cán bộ quản lý Nhà nước'}
                  </p>
                </div>

                {step === 'OTP' ? (
                  <div className="space-y-8">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-600 leading-relaxed mb-6">Mã OTP đã được gửi về số điện thoại đuôi <span className="font-black text-slate-900">***889</span></p>
                      <div className="flex gap-2">
                        {[1,2,3,4,5,6].map(i => (
                          <input key={i} maxLength={1} className="w-full h-14 bg-white border border-slate-200 rounded-xl text-center text-2xl font-black outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" />
                        ))}
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleAdminLogin} 
                      className="w-full py-5 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-slate-900/20 hover:bg-black transition-all"
                    >
                      XÁC NHẬN TRUY CẬP
                    </motion.button>
                    <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Chưa nhận được mã? <button className="text-slate-900 font-bold underline underline-offset-4">Gửi lại (30s)</button></p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Công vụ (.gov.vn)</label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                         <input className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl font-bold focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all placeholder:font-medium text-sm" placeholder="admin@mard.gov.vn" value={adminData.email} onChange={e => setAdminData({...adminData, email: e.target.value})} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu công tác</label>
                      <div className="relative">
                         <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                         <input type="password" className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl font-bold focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 outline-none transition-all placeholder:font-medium text-sm" placeholder="••••••••" value={adminData.password} onChange={e => setAdminData({...adminData, password: e.target.value})} />
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                       <ShieldCheck className="text-amber-600 shrink-0 mt-0.5" size={20} />
                       <p className="text-[11px] font-bold text-amber-800 leading-normal">Lưu ý: Truy cập công vụ yêu cầu xác thực 2 thiết bị đồng thời. Sau bước này bạn cần nhập OTP.</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleAdminLogin} 
                      className="w-full py-5 bg-slate-900 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2"
                    >
                      TIẾP TỤC BẢO MẬT <ChevronRight size={18} />
                    </motion.button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthScreen;
