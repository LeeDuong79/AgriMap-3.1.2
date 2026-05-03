
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FarmProduct, ProductStatus, AdminUser, AdminLevel, AuditLog, CertType, Order, Complaint, ComplaintStatus } from '../types';
import { APP_LOGO } from '../constants';
import { Logo } from './Logo';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import MapInterface from './MapInterface';
import { 
  CheckCircle2, XCircle, Clock, TrendingUp, Users, Sprout, 
  ShieldAlert, ClipboardCheck, History, BarChart3, Phone,
  Map as MapIcon, ChevronRight, Search, Filter, AlertTriangle, UserCheck,
  Award, FileText, Image as ImageIcon, Download, FileSpreadsheet, MapPin,
  Layers, Activity, ShieldCheck, LogOut, Target, ArrowUpRight, ArrowDownRight,
  Zap, Database, Globe
} from 'lucide-react';
import { MarketAiService } from '../services/marketAiService';
import { BigDataAnalytics } from '../types';

interface AdminDashboardProps {
  products: FarmProduct[];
  onUpdateStatus: (id: string, status: ProductStatus, note?: string) => void;
  admin: AdminUser;
  cart: FarmProduct[];
  setCart: React.Dispatch<React.SetStateAction<FarmProduct[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onLogout: () => void;
  complaints: Complaint[];
  onUpdateComplaint: (id: string, status: ComplaintStatus, adminNote?: string) => void;
}

const MOCK_LOGS: AuditLog[] = [
  {
    id: 'l1',
    timestamp: '2024-03-20 14:30:22',
    adminName: 'Nguyễn Văn Quản Lý',
    adminId: 'GOV-889',
    action: 'Duyệt hồ sơ',
    targetId: '1',
    targetName: 'Bưởi Da Xanh Bến Tre',
    details: 'Hồ sơ đầy đủ, chứng chỉ VietGAP còn hiệu lực.'
  },
  {
    id: 'l2',
    timestamp: '2024-03-20 10:15:45',
    adminName: 'Trần Thị Kiểm Duyệt',
    adminId: 'GOV-123',
    action: 'Từ chối',
    targetId: '2',
    targetName: 'Sầu riêng Ri6 Vĩnh Long',
    details: 'Chứng chỉ GlobalGAP đã hết hạn, yêu cầu cập nhật.'
  }
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  onUpdateStatus, 
  admin,
  cart,
  setCart,
  orders,
  setOrders,
  onLogout,
  complaints,
  onUpdateComplaint
}) => {
  const [activeTab, setActiveTab] = useState<'verification' | 'analytics' | 'logs' | 'map' | 'complaints'>('verification');
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'farmers' | 'certs' | 'reports' | 'bigdata'>('bigdata');
  const [bigData, setBigData] = useState<BigDataAnalytics | null>(null);
  const [isBigDataLoading, setIsBigDataLoading] = useState(false);

  // Load Big Data
  React.useEffect(() => {
    const fetchBigData = async () => {
      setIsBigDataLoading(true);
      try {
        const data = await MarketAiService.getBigDataAnalytics();
        setBigData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsBigDataLoading(false);
      }
    };
    if (activeTab === 'analytics') fetchBigData();
  }, [activeTab]);
  const [selectedProduct, setSelectedProduct] = useState<FarmProduct | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationNote, setVerificationNote] = useState('');
  const [complaintNote, setComplaintNote] = useState('');
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const [showFieldMap, setShowFieldMap] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  
  const [reportFilter, setReportFilter] = useState({
    province: 'Tất cả',
    category: 'Tất cả',
    standard: 'Tất cả',
    time: 'Năm 2024'
  });

  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalArea: products.reduce((acc, p) => acc + (p.area || 0), 0).toFixed(1),
    approvedCount: products.filter(p => p.status === ProductStatus.COMPLETED).length,
    pendingCount: products.filter(p => p.status === ProductStatus.PENDING).length,
    totalYield: products.reduce((acc, p) => acc + (p.expectedYield || 0), 0),
    totalCerts: products.reduce((acc, p) => acc + p.certificates.length, 0),
  }), [products]);

  const categoryData = useMemo(() => {
    const categories = Array.from(new Set(products.map(p => p.category)));
    return categories.map(cat => ({
      name: cat,
      value: products.filter(p => p.category === cat).length,
      area: products.filter(p => p.category === cat).reduce((acc, p) => acc + (p.area || 0), 0)
    }));
  }, [products]);

  const COLORS = ['#000000', '#15803d', '#16a34a', '#333333', '#4ade80'];

  const handleAction = (status: ProductStatus) => {
    if (!selectedProduct) return;
    const note = status === ProductStatus.REJECTED ? rejectionReason : verificationNote;
    onUpdateStatus(selectedProduct.id, status, note);
    setSelectedProduct(null);
    setRejectionReason('');
    setVerificationNote('');
  };

  const handleComplaintAction = (status: ComplaintStatus) => {
    if (!selectedComplaint) return;
    
    if (status === ComplaintStatus.PROCESSING) {
      const processingCount = complaints.filter(c => c.status === ComplaintStatus.PROCESSING).length;
      if (processingCount >= 3) {
        alert('Hệ thống giới hạn xử lý tối đa 3 đơn khiếu nại cùng một lúc. Vui lòng giải quyết xong các đơn đang xử lý trước khi tiếp nhận đơn mới.');
        return;
      }
    }

    if ((status === ComplaintStatus.RESOLVED || status === ComplaintStatus.REJECTED) && !complaintNote.trim()) {
      alert('Vui lòng nhập ghi chú đầy đủ trước khi xác nhận hoặc bác bỏ khiếu nại.');
      return;
    }

    onUpdateComplaint(selectedComplaint.id, status, complaintNote);
    setSelectedComplaint(null);
    setComplaintNote('');
  };

  const sortedComplaints = useMemo(() => {
    const filtered = complaints.filter(c => 
      c.fromUserName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      // 1. Processing status is highest priority
      if (a.status === ComplaintStatus.PROCESSING && b.status !== ComplaintStatus.PROCESSING) return -1;
      if (a.status !== ComplaintStatus.PROCESSING && b.status === ComplaintStatus.PROCESSING) return 1;
      
      // 2. Pending status is second priority
      if (a.status === ComplaintStatus.PENDING && b.status !== ComplaintStatus.PENDING && b.status !== ComplaintStatus.PROCESSING) return -1;
      if (a.status !== ComplaintStatus.PENDING && a.status !== ComplaintStatus.PROCESSING && b.status === ComplaintStatus.PENDING) return 1;

      // 3. Within same status or other statuses, sort by date descending
      const dateA = new Date(a.updatedAt || a.createdAt).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [complaints, searchTerm]);

  const filteredFarmers = products.filter(p => 
    p.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.regionCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-3 bg-emerald-50 rounded-2xl shadow-inner border border-emerald-100"
          >
            <Logo size="lg" />
          </motion.div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white p-1 rounded-md shadow-lg shadow-emerald-600/20">
                <ShieldCheck size={14} />
              </div>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hệ thống quản lý Nhà nước về Nông nghiệp</h2>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">TRUNG TÂM ĐIỀU HÀNH SỐ</h1>
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>{admin.unit}</span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <span>{admin.level}</span>
              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              <span className="text-emerald-600">{admin.assignedArea}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white px-6 py-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center gap-4 group hover:border-emerald-200 transition-all"
          >
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cán bộ đang trực</p>
              <p className="text-base font-black text-slate-800 leading-none group-hover:text-emerald-600 transition-colors">{admin.fullName}</p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner group-hover:bg-emerald-100 transition-all">
              <UserCheck size={20} />
            </div>
          </motion.div>
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsLogoutDialogOpen(true)}
            className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center group"
            title="Đăng xuất"
          >
            <LogOut size={20} />
            <span className="text-[8px] font-black uppercase mt-1 opacity-60 group-hover:opacity-100 tracking-tighter">Thoát</span>
          </motion.button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full space-y-8">
        <div className="bg-white/50 backdrop-blur-sm p-2 rounded-[2.5rem] border border-white shadow-2xl shadow-slate-200/50 flex items-center overflow-x-auto no-scrollbar gap-2 sticky top-28 z-40">
          {[
            { id: 'verification', icon: <ClipboardCheck />, label: 'DUYỆT HỒ SƠ', badge: stats.pendingCount },
            { id: 'analytics', icon: <BarChart3 />, label: 'QUẢN LÝ DỮ LIỆU' },
            { id: 'map', icon: <MapIcon />, label: 'BẢN ĐỒ VÙNG TRỒNG' },
            { id: 'logs', icon: <History />, label: 'NHẬT KÝ HỆ THỐNG' },
            { id: 'complaints', icon: <ShieldAlert />, label: 'XỬ LÝ KHIẾU NẠI', badge: complaints.filter(c => c.status === ComplaintStatus.PENDING).length }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex-1 py-4 px-8 rounded-[1.8rem] text-sm font-black flex items-center justify-center gap-3 transition-all whitespace-nowrap overflow-hidden group ${
                activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-slate-900 shadow-xl shadow-slate-900/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3">
                {React.cloneElement(tab.icon as React.ReactElement<any>, { size: 20 })}
                <span className="tracking-tighter uppercase">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === tab.id ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

      <AnimatePresence mode="wait">
        {activeTab === 'verification' && (
          <motion.div 
            key="verification"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-4 space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 custom-scrollbar">
              <div className="bg-white/70 backdrop-blur-md p-4 rounded-[2rem] border border-slate-100 mb-6 sticky top-0 z-10 shadow-xl shadow-slate-200/40">
                <div className="relative group">
                  <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    placeholder="Mã PUC hoặc tên nhà vườn..." 
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-emerald-200 focus:bg-white text-slate-800 font-bold placeholder:text-slate-300 transition-all font-sans" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              {products.filter(p => p.status === ProductStatus.PENDING || p.status === ProductStatus.REVIEWING).map((p, idx) => (
                <motion.button 
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedProduct(p)}
                  className={`w-full p-6 rounded-[2.5rem] border transition-all text-left flex items-center justify-between group relative overflow-hidden ${
                    selectedProduct?.id === p.id 
                    ? 'bg-slate-900 border-slate-900 shadow-2xl shadow-slate-950/20 translate-x-3' 
                    : 'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/50'
                  }`}
                >
                  <div className="relative z-10">
                    <h4 className={`text-lg font-black mb-1 transition-colors leading-tight ${selectedProduct?.id === p.id ? 'text-white' : 'text-slate-800'}`}>{p.name}</h4>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2rem] transition-colors ${selectedProduct?.id === p.id ? 'text-slate-400' : 'text-slate-500'}`}>{p.farmerName}</p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className={`text-[9px] px-3 py-1 rounded-xl font-black uppercase tracking-wider ${
                        selectedProduct?.id === p.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>{p.category}</span>
                      <span className={`text-[9px] px-3 py-1 rounded-xl font-black uppercase tracking-wider ${
                        selectedProduct?.id === p.id ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700'
                      }`}>{p.certificates[0]?.type || 'N/A'}</span>
                    </div>
                  </div>
                  <ChevronRight className={`transition-all ${selectedProduct?.id === p.id ? 'text-emerald-400 translate-x-1' : 'text-slate-300 group-hover:text-slate-500'}`} />
                </motion.button>
              ))}
            </div>

            <div className="lg:col-span-8">
              {selectedProduct ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden sticky top-28"
                >
                  <div className="bg-slate-900 text-white p-10 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                          <Target size={20} />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-[0.1em] text-white tracking-widest">HỒ SƠ MÃ SỐ: {selectedProduct.id}</h3>
                      </div>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1 pl-12 opacity-60">Gửi lúc: {new Date(selectedProduct.updatedAt).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl text-[10px] font-black text-white shadow-2xl uppercase tracking-widest relative z-10 ${
                      selectedProduct.status === ProductStatus.PENDING ? 'bg-amber-500' : 
                      selectedProduct.status === ProductStatus.REVIEWING ? 'bg-blue-600' : 'bg-emerald-600'
                    }`}>
                      {selectedProduct.status}
                    </div>
                  </div>
                  <div className="p-12 space-y-16 overflow-y-auto max-h-[calc(100vh-380px)] custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                      <div className="space-y-12">
                        <section>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase mb-8 flex items-center gap-3 tracking-[0.3em] opacity-80">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full ring-4 ring-emerald-500/10"></div> 1. THÔNG TIN SẢN XUẤT
                          </h4>
                          <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-8">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Tên nông sản / Vùng trồng</p>
                            <p className="text-xl font-black text-black">{selectedProduct.name}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Diện tích</p>
                              <p className="text-lg font-black text-black">{selectedProduct.area} ha</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase">Sản lượng dự kiến</p>
                              <p className="text-lg font-black text-black">{selectedProduct.expectedYield} tấn</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase italic">Số điện thoại liên hệ</p>
                            <p className="text-xl font-black text-black flex items-center gap-2">
                              <Phone size={18} className="text-green-700" />
                              {selectedProduct.contact}
                            </p>
                          </div>
                        </div>
                      </section>

                      <section>
                        <h4 className="text-sm font-black text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
                          <MapIcon size={18} className="text-blue-700" /> 2. TỌA ĐỘ VỆ TINH (GPS)
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-3xl border-2 border-slate-200 aspect-video flex flex-col items-center justify-center text-center relative overflow-hidden group">
                           <img 
                            src={`https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/pin-s-l+ff0000(${selectedProduct.location.lng},${selectedProduct.location.lat})/${selectedProduct.location.lng},${selectedProduct.location.lat},16,0/600x400?access_token=mock`} 
                            className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale group-hover:grayscale-0 transition-all"
                            alt="Satellite View"
                           />
                          <div className="relative z-10">
                            <MapIcon size={32} className="mx-auto mb-2 text-black" />
                            <p className="text-sm font-black text-black uppercase tracking-widest">ĐỐI CHIẾU THỰC ĐỊA</p>
                            <p className="text-[11px] font-bold text-slate-800 bg-white/80 px-2 py-1 rounded mt-2">{selectedProduct.location.lat}, {selectedProduct.location.lng}</p>
                            <button 
                              onClick={() => setShowFieldMap({
                                lat: selectedProduct.location.lat,
                                lng: selectedProduct.location.lng,
                                name: selectedProduct.farmerName + " - " + selectedProduct.name
                              })}
                              className="mt-4 text-xs font-black text-blue-700 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all uppercase"
                            >
                              Mở Bản đồ VN2000
                            </button>
                          </div>
                        </div>
                      </section>
                    </div>

                    <div className="space-y-8">
                      <section>
                        <h4 className="text-sm font-black text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
                          <ImageIcon size={18} className="text-orange-600" /> 3. CHỨNG CHỈ & MINH CHỨNG
                        </h4>
                        <div className="space-y-4">
                          {selectedProduct.certificates.length > 0 ? selectedProduct.certificates.map((c, i) => (
                            <div key={i} className="bg-white p-5 rounded-2xl border-2 border-slate-200 flex items-center justify-between hover:border-black transition-all shadow-sm">
                              <div className="flex items-center gap-4">
                                <div className="bg-green-100 p-2.5 rounded-xl text-green-800">
                                  <Award size={24} />
                                </div>
                                <div>
                                  <p className="text-lg font-black text-black leading-tight">{c.type}</p>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase">Hết hạn: {c.expiryDate}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => setShowFullImage(c.proofUrl)}
                                className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg hover:bg-black transition-all shadow-md"
                              >
                                XEM GIẤY TỜ
                              </button>
                            </div>
                          )) : (
                            <div className="bg-slate-100 p-8 rounded-2xl border-2 border-dashed border-slate-300 text-center">
                              <FileText size={32} className="mx-auto text-slate-400 mb-2" />
                              <p className="text-sm font-bold text-slate-500">Chưa tải lên chứng chỉ.</p>
                            </div>
                          )}
                        </div>
                      </section>

                      <section className="bg-yellow-50 p-8 rounded-[2rem] border-2 border-yellow-200 shadow-inner">
                        <h4 className="text-sm font-black text-yellow-900 uppercase mb-6 flex items-center gap-2">
                          <ClipboardCheck size={20} /> QUYẾT ĐỊNH CỦA CÁN BỘ
                        </h4>
                        <div className="space-y-5">
                          <div className="space-y-2">
                            <label className="block text-xs font-black text-black uppercase tracking-tighter">Ghi chú hậu kiểm (Log lưu vết)</label>
                            <textarea 
                              className="w-full p-4 border-2 border-slate-400 rounded-2xl outline-none focus:border-black text-black font-bold text-sm bg-white" 
                              placeholder="Nhập kết quả kiểm tra thực tế..."
                              rows={3}
                              value={verificationNote}
                              onChange={e => setVerificationNote(e.target.value)}
                            />
                          </div>
                          
                          <div className="flex flex-wrap gap-4">
                            {selectedProduct.status === ProductStatus.PENDING && (
                              <button 
                                onClick={() => handleAction(ProductStatus.REVIEWING)}
                                className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl hover:-translate-y-1 transition-all border-b-4 border-blue-800"
                              >
                                <Activity size={24} /> BẮT ĐẦU DUYỆT
                              </button>
                            )}
                            {selectedProduct.status === ProductStatus.REVIEWING && (
                              <>
                                <button 
                                  onClick={() => handleAction(ProductStatus.COMPLETED)}
                                  className="flex-1 min-w-[200px] bg-green-700 hover:bg-green-800 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl hover:-translate-y-1 transition-all border-b-4 border-green-900"
                                >
                                  <CheckCircle2 size={24} /> HOÀN TẤT XÉT DUYỆT
                                </button>
                                <button 
                                  onClick={() => handleAction(ProductStatus.REJECTED)}
                                  className="flex-1 min-w-[200px] bg-red-700 hover:bg-red-800 text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-xl hover:-translate-y-1 transition-all border-b-4 border-red-900"
                                >
                                  <XCircle size={24} /> TỪ CHỐI
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
                <div className="h-[600px] border-4 border-dashed border-slate-300 rounded-[4rem] flex flex-col items-center justify-center text-slate-400 p-12 text-center bg-white/50">
                  <ShieldAlert size={80} className="mb-6 opacity-10" />
                  <h3 className="text-2xl font-black text-slate-500 uppercase tracking-widest">TRUNG TÂM XỬ LÝ HỒ SƠ</h3>
                  <p className="text-lg font-bold max-w-sm mt-4 text-slate-400 leading-relaxed italic uppercase">Chọn hồ sơ từ danh sách bên trái để đối soát dữ liệu và cấp mã vùng trồng (PUC).</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

      {activeTab === 'analytics' && (
        <motion.div 
          key="analytics"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-12"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group transition-all hover:border-emerald-200">
               <div className="flex items-center gap-3 text-slate-400 mb-4 group-hover:text-emerald-500 transition-colors">
                  <Users size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tổng số Nhà vườn</span>
               </div>
               <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.totalProducts}</p>
               <div className="mt-4 text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Cập nhật trực tuyến
               </div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group transition-all hover:border-emerald-200">
               <div className="flex items-center gap-3 text-slate-400 mb-4 group-hover:text-emerald-500 transition-colors">
                  <Layers size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tổng diện tích (HA)</span>
               </div>
               <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.totalArea}</p>
               <div className="mt-4 text-[10px] font-black text-blue-600 uppercase flex items-center gap-2">
                  <MapPin size={12} /> Đã ghim tọa độ
               </div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between group transition-all hover:border-emerald-200">
               <div className="flex items-center gap-3 text-slate-400 mb-4 group-hover:text-amber-500 transition-colors">
                  <Award size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Chứng nhận số</span>
               </div>
               <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.totalCerts}</p>
               <div className="mt-4 text-[10px] font-black text-amber-600 uppercase flex items-center gap-2">
                  <ShieldCheck size={12} /> Hợp chuẩn VIETGAP/OCOP
               </div>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-950/20 flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all"></div>
               <div className="flex items-center gap-3 text-slate-400 mb-4 relative z-10">
                  <TrendingUp size={20} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sản lượng kỳ vọng</span>
               </div>
               <p className="text-4xl font-black text-white tracking-tighter relative z-10">{stats.totalYield} <span className="text-lg text-emerald-400/80">TẤN</span></p>
               <div className="mt-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest relative z-10">Tiềm năng xuất khẩu</div>
            </motion.div>
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[2rem] w-fit border border-slate-200">
            {[
              { id: 'bigdata', icon: <Database />, label: 'BIG DATA AI Hub' },
              { id: 'farmers', icon: <Users />, label: 'NHÀ VƯỜN' },
              { id: 'certs', icon: <Award />, label: 'CHỨNG NHẬN' },
              { id: 'reports', icon: <BarChart3 />, label: 'BÁO CÁO' }
            ].map((sub) => (
              <button 
                key={sub.id}
                onClick={() => setAnalyticsSubTab(sub.id as any)}
                className={`px-8 py-3 rounded-[1.5rem] font-black uppercase text-[11px] flex items-center gap-3 transition-all relative ${
                  analyticsSubTab === sub.id 
                  ? 'text-white' 
                  : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {analyticsSubTab === sub.id && (
                  <motion.div 
                    layoutId="analyticsSubBg"
                    className="absolute inset-0 bg-slate-900 rounded-[1.5rem] shadow-xl shadow-slate-900/10"
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  {React.cloneElement(sub.icon as React.ReactElement<any>, { size: 16 })}
                  {sub.label}
                </span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {analyticsSubTab === 'bigdata' && (
              <motion.div 
                key="bigdata-tab"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-12"
              >
                {/* Big Data Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
                        <Users size={24} />
                      </div>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">+12% Tháng này</span>
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter mb-2">{(bigData?.totalCustomers || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lượt tìm kiếm & Nhu cầu</p>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                        <Database size={24} />
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Thời gian thực</span>
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter mb-2">{( (bigData?.totalMarketValue || 0) / 1000000000).toFixed(1)}T</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Giá trị thị trường ước tính (VNĐ)</p>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                        <Zap size={24} />
                      </div>
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Dự báo 7 ngày</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <ArrowUpRight className="text-emerald-400" size={24} />
                       <p className="text-4xl font-black text-white tracking-tighter mb-2">8.5%</p>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dự báo tăng giá nông sản</p>
                  </div>

                  <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl">
                        <AlertTriangle size={24} />
                      </div>
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Cảnh báo đỏ</span>
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter mb-2">03</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vùng mất cân đối cung cầu</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left Column: Supply-Demand Gaps */}
                  <div className="lg:col-span-12">
                     <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                        <div className="p-10 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                          <div>
                             <h4 className="text-xl font-black text-slate-900 uppercase">Đối soát Cung - Cầu Toàn quốc (Big Data Analytics)</h4>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Phát hiện mất cân đối thị trường bằng AI dữ liệu lớn</p>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl text-emerald-700 text-[10px] font-black border border-emerald-100">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                LIVE DATA
                             </div>
                          </div>
                        </div>
                        <div className="p-0 overflow-x-auto">
                           <table className="w-full text-left">
                              <thead>
                                 <tr className="bg-slate-50/20">
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm & Khu vực</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nguồn cung (Tấn)</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nhu cầu (Point)</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Chênh lệch</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gợi ý từ Hệ thống AI</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                 {bigData?.imbalances.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                       <td className="px-10 py-8">
                                          <p className="text-base font-black text-slate-800">{item.productName}</p>
                                          <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                             <MapPin size={10} /> {item.province}
                                          </p>
                                       </td>
                                       <td className="px-10 py-8 text-center">
                                          <p className="text-lg font-black text-slate-700">{(item.supplyVolume || 0).toLocaleString()}</p>
                                       </td>
                                       <td className="px-10 py-8 text-center">
                                          <p className="text-lg font-black text-slate-700">{(item.demandVolume || 0).toLocaleString()}</p>
                                       </td>
                                       <td className="px-10 py-8 text-center">
                                          <div className={`flex flex-col items-center ${
                                            item.status === 'SURPLUS' ? 'text-rose-600' : 
                                            item.status === 'DEFICIT' ? 'text-amber-600' : 'text-emerald-600'
                                          }`}>
                                             <div className="flex items-center gap-1 font-black text-sm">
                                                {item.gap > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                                {Math.abs(item.gap)}%
                                             </div>
                                             <span className="text-[9px] font-black uppercase tracking-tighter">
                                                {item.status === 'SURPLUS' ? 'Thừa cung' : item.status === 'DEFICIT' ? 'Thiếu cầu' : 'Ổn định'}
                                             </span>
                                          </div>
                                       </td>
                                       <td className="px-10 py-8">
                                          <div className="max-w-md bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                                             <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                                                <Sprout size={16} />
                                             </div>
                                             <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">"{item.recommendation}"</p>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>

                  {/* Trends & Charts */}
                  <div className="lg:col-span-7">
                     <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl shadow-slate-950/20 relative overflow-hidden h-full">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
                        <h4 className="text-2xl font-black text-white uppercase mb-10 flex items-center gap-4">
                           <TrendingUp className="text-emerald-400" />
                           Xu hướng Nhu cầu Khách hàng
                        </h4>
                        <div className="space-y-8">
                           {bigData?.demandTrends.map((trend, idx) => (
                              <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group hover:bg-white transition-all">
                                 <div>
                                    <h5 className="text-xl font-black text-white group-hover:text-slate-900 transition-colors">#{idx + 1} {trend.keyword}</h5>
                                    <div className="flex gap-2 mt-2">
                                       {trend.topRegions.map((region, i) => (
                                          <span key={i} className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{region}{i < trend.topRegions.length - 1 ? ',' : ''}</span>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-2xl font-black text-emerald-400 group-hover:text-emerald-600 transition-colors">{(trend.searchCount || 0).toLocaleString()}</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-end gap-1">
                                       <ArrowUpRight size={12} /> {trend.growthRate}%
                                    </p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 p-12 shadow-2xl shadow-slate-200/40 h-full flex flex-col justify-between">
                       <div>
                          <h4 className="text-xl font-black text-slate-900 uppercase mb-4">Dự báo Giá Nông sản kỳ tới</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-10 leading-relaxed italic">Tính toán dựa trên lưu lượng giao dịch và biến đổi khí hậu trong 12 tháng qua.</p>
                          <div className="space-y-6">
                             {bigData?.pricePredictions.map((pred, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                                         {idx + 1}
                                      </div>
                                      <div>
                                         <p className="text-sm font-black text-slate-800">{pred.productName}</p>
                                         <p className="text-[10px] font-bold text-slate-400 uppercase">Độ tin cậy: {(pred.confidence * 100).toFixed(0)}%</p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-lg font-black text-emerald-600">{(pred.forecastedPrice || 0).toLocaleString()} <span className="text-[9px] text-slate-400">đ/kg</span></p>
                                      <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase">Tăng 2.5%</span>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                       <motion.button 
                        whileHover={{ scale: 1.02 }}
                        className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-2xl shadow-slate-900/20"
                       >
                          Xem Báo cáo Tổng thể
                       </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {analyticsSubTab === 'farmers' && (
              <motion.div 
                key="farmers-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden"
              >
                <div className="p-10 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight font-sans">Cơ sở dữ liệu Vùng trồng quản lý</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 italic">Trình xuất thời gian thực từ cơ sở dữ liệu quốc gia</p>
                  </div>
                  <div className="relative group min-w-[320px]">
                    <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl font-bold font-sans outline-none focus:border-emerald-300 focus:shadow-lg focus:shadow-emerald-500/10 transition-all text-sm" 
                      placeholder="Tìm theo nhà vườn, mã vùng..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/10">
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Nhà vườn & Sản phẩm</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Địa phương</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-center">Quy mô</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-center">Trạng thái hồ sơ</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-right">Ngày cập nhật</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredFarmers.map((p, idx) => (
                        <motion.tr 
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="group hover:bg-slate-50/50 transition-all"
                        >
                          <td className="px-10 py-8">
                             <p className="text-base font-black text-slate-800 leading-none group-hover:text-emerald-600 transition-colors">{p.farmerName}</p>
                             <div className="flex items-center gap-2 mt-2">
                               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.name}</p>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-start gap-2 text-sm font-bold text-slate-600">
                                <MapPin size={14} className="text-rose-500 shrink-0 mt-0.5" /> 
                                <span className="leading-tight">{p.location.address}</span>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                             <p className="text-lg font-black text-slate-800">{p.area} <span className="text-[10px] text-slate-400 ml-1 uppercase">HA</span></p>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center justify-center">
                               <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${
                                 p.status === ProductStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' : 
                                 p.status === ProductStatus.PENDING ? 'bg-amber-50 text-amber-700 border border-amber-100/50' : 
                                 'bg-blue-50 text-blue-700 border border-blue-100/50'
                               }`}>
                                 <div className={`w-1.5 h-1.5 rounded-full ${
                                   p.status === ProductStatus.COMPLETED ? 'bg-emerald-500' : 
                                   p.status === ProductStatus.PENDING ? 'bg-amber-500' : 'bg-blue-500'
                                 }`} />
                                 {p.status}
                               </div>
                             </div>
                          </td>
                          <td className="px-10 py-8 text-right">
                             <p className="text-xs font-bold text-slate-400 font-mono italic">{p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString('vi-VN') : '---'}</p>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {analyticsSubTab === 'certs' && (
              <motion.div 
                key="certs-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-amber-50/50 border border-amber-100 p-10 rounded-[3rem] flex items-center gap-8 shadow-xl shadow-amber-500/5">
                   <div className="bg-white p-5 rounded-[1.8rem] shadow-xl shadow-amber-500/10 border border-amber-100 shrink-0">
                      <AlertTriangle size={36} className="text-amber-600" />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-xl font-black text-amber-900 uppercase tracking-tight">Hệ thống Quản trị Chứng nhận Số</h4>
                      <p className="text-amber-700 font-bold italic leading-relaxed text-sm mt-1 opacity-80">
                        Dữ liệu chứng nhận được trích xuất trực tiếp từ hồ sơ đăng ký của nông dân. Hệ thống sẽ tự động hạ gỡ mã PUC trên bản đồ nếu chứng nhận quá hạn.
                      </p>
                   </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden">
                   <div className="p-10 bg-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                          <Award size={24} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest tracking-[0.1em]">Danh mục Chứng chỉ Hợp chuẩn</h3>
                      </div>
                      <div className="bg-emerald-500/20 px-4 py-2 rounded-xl text-[10px] font-black text-emerald-400 animate-pulse uppercase tracking-[0.2em] border border-emerald-500/30">Hệ thống đồng bộ trực tiếp</div>
                   </div>
                   <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-slate-50/50">
                               <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Cơ sở sản xuất & Mã vùng</th>
                               <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Tiêu chuẩn cấp</th>
                               <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Ngày cấp</th>
                               <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Thời hạn định kỳ</th>
                               <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-right">Minh chứng số</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100/50">
                            {products.flatMap(p => p.certificates.map(c => ({...c, farmName: p.farmerName, regionCode: p.regionCode}))).map((item, idx) => (
                               <motion.tr 
                                 key={idx}
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 transition={{ delay: idx * 0.03 }}
                                 className="group hover:bg-slate-50 transition-all"
                               >
                                  <td className="px-10 py-8">
                                     <p className="text-base font-black text-slate-800 leading-none group-hover:text-amber-600 transition-colors uppercase tracking-tight">{item.farmName}</p>
                                     <p className="text-[10px] font-bold text-slate-400 font-mono mt-2 uppercase tracking-widest">{item.regionCode}</p>
                                  </td>
                                  <td className="px-10 py-8">
                                     <div className="flex items-center gap-3">
                                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-100">
                                          <Award size={16} />
                                        </div>
                                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{item.type}</span>
                                     </div>
                                  </td>
                                  <td className="px-10 py-8">
                                     <p className="text-sm font-bold text-slate-500 font-mono italic">{new Date(item.issueDate).toLocaleDateString('vi-VN')}</p>
                                  </td>
                                  <td className="px-10 py-8">
                                     <p className={`text-sm font-black font-mono ${new Date(item.expiryDate) < new Date() ? 'text-rose-500' : 'text-emerald-600'}`}>
                                        {new Date(item.expiryDate).toLocaleDateString('vi-VN')}
                                     </p>
                                  </td>
                                  <td className="px-10 py-8 text-right">
                                     <motion.button 
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => setShowFullImage(item.proofUrl)}
                                      className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all border border-slate-800"
                                     >
                                        Xác thực hồ sơ
                                     </motion.button>
                                  </td>
                               </motion.tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
              </motion.div>
            )}

            {analyticsSubTab === 'reports' && (
              <motion.div 
                key="reports-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                 <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-950/20 grid grid-cols-1 md:grid-cols-4 gap-8 border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -ml-48 -mt-48"></div>
                    <div className="space-y-4 relative z-10">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Bộ lọc theo Địa phương</label>
                       <select className="w-full p-4 bg-white/5 text-white rounded-2xl font-bold border border-white/10 focus:border-emerald-500 outline-none appearance-none transition-all text-sm group-focus:bg-slate-800" value={reportFilter.province} onChange={e => setReportFilter({...reportFilter, province: e.target.value})}>
                          <option className="bg-slate-900">Tất cả tỉnh thành</option>
                          <option className="bg-slate-900">Bến Tre</option>
                          <option className="bg-slate-900">Vĩnh Long</option>
                          <option className="bg-slate-900">Tiền Giang</option>
                       </select>
                    </div>
                    <div className="space-y-4 relative z-10">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Ngành hàng sản xuất</label>
                       <select className="w-full p-4 bg-white/5 text-white rounded-2xl font-bold border border-white/10 focus:border-emerald-500 outline-none appearance-none transition-all text-sm" value={reportFilter.category} onChange={e => setReportFilter({...reportFilter, category: e.target.value})}>
                          <option className="bg-slate-900 text-white">Tất cả ngành hàng</option>
                          <option className="bg-slate-900 text-white">Trái cây</option>
                          <option className="bg-slate-900 text-white">Lúa gạo</option>
                          <option className="bg-slate-900 text-white">Thủy sản</option>
                       </select>
                    </div>
                    <div className="space-y-4 relative z-10">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tiêu chuẩn đánh giá</label>
                       <select className="w-full p-4 bg-white/5 text-white rounded-2xl font-bold border border-white/10 focus:border-emerald-500 outline-none appearance-none transition-all text-sm" value={reportFilter.standard} onChange={e => setReportFilter({...reportFilter, standard: e.target.value})}>
                          <option className="bg-slate-900 text-white">Mọi tiêu chuẩn</option>
                          <option className="bg-slate-900 text-white">VietGAP</option>
                          <option className="bg-slate-900 text-white">OCOP</option>
                          <option className="bg-slate-900 text-white">Hữu cơ</option>
                       </select>
                    </div>
                    <div className="space-y-4 relative z-10">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Giai đoạn báo cáo</label>
                       <select className="w-full p-4 bg-white/5 text-white rounded-2xl font-bold border border-white/10 focus:border-emerald-500 outline-none appearance-none transition-all text-sm" value={reportFilter.time} onChange={e => setReportFilter({...reportFilter, time: e.target.value})}>
                          <option className="bg-slate-900">Năm quyết toán 2024</option>
                          <option className="bg-slate-900">Sơ kết Quý 1/2024</option>
                          <option className="bg-slate-900">Báo cáo Tháng 3/2024</option>
                       </select>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
                       <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-6">
                          <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Diện tích theo ngành hàng</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Đơn vị tính: hectares (HA)</p>
                          </div>
                          <motion.button whileHover={{ scale: 1.1 }} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-emerald-500 transition-all"><Download size={20} /></motion.button>
                       </div>
                       <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: '800', fontSize: '10px'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontWeight: '800', fontSize: '10px'}} />
                                <Tooltip cursor={{fill: '#F8FAFC', radius: 10}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                                <Bar dataKey="area" radius={[12, 12, 0, 0]}>
                                   {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Bar>
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl shadow-slate-950/30 flex flex-col justify-between relative overflow-hidden group">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                       <div className="relative z-10">
                          <div className="flex items-center gap-4 mb-2">
                            <div className="p-3 bg-white/10 text-emerald-400 rounded-2xl border border-white/10">
                               <FileText size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Xuất báo cáo hệ thống</h3>
                          </div>
                          <p className="text-slate-400 font-bold mb-12 leading-relaxed uppercase tracking-[0.2em] text-[10px] opacity-60">Kết xuất dữ liệu vùng trồng & hồ sơ chứng chỉ theo chuẩn định dạng Bộ NN&PTNT phục vụ lưu trữ quốc gia.</p>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-6 relative z-10">
                          <motion.button 
                            whileHover={{ y: -5, backgroundColor: 'white' }} 
                            className="bg-white/5 border border-white/10 text-white p-8 rounded-[2rem] font-black flex flex-col items-center gap-4 transition-all group/btn"
                          >
                             <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl group-hover/btn:bg-rose-500 group-hover/btn:text-white transition-all shadow-xl">
                                <FileText size={32} />
                             </div>
                             <span className="uppercase text-[11px] tracking-widest group-hover/btn:text-slate-900 transition-colors">KẾT XUẤT PDF</span>
                          </motion.button>
                          <motion.button 
                            whileHover={{ y: -5, backgroundColor: '#10b981' }} 
                            className="bg-white/5 border border-white/10 text-white p-8 rounded-[2rem] font-black flex flex-col items-center gap-4 transition-all group/btn"
                          >
                             <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover/btn:bg-white group-hover/btn:text-emerald-600 transition-all shadow-xl">
                                <FileSpreadsheet size={32} />
                             </div>
                             <span className="uppercase text-[11px] tracking-widest group-hover/btn:text-white transition-colors">TRÍCH XUẤT EXCEL</span>
                          </motion.button>
                       </div>
                    </motion.div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </motion.div>
   )}

      {showFullImage && (
        <div className="fixed inset-0 z-[5000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm">
          <button 
            onClick={() => setShowFullImage(null)}
            className="absolute top-8 right-8 text-white hover:text-red-500 transition-colors"
          >
            <XCircle size={48} />
          </button>
          <div className="max-w-4xl w-full bg-white p-4 rounded-3xl shadow-2xl animate-in zoom-in-90 border-4 border-black">
             <div className="flex items-center justify-between mb-4 border-b-2 border-slate-100 pb-2">
                <h4 className="text-xl font-black text-black uppercase">MINH CHỨNG CHỨNG CHỈ NÔNG NGHIỆP SỐ</h4>
                <span className="text-xs font-bold text-slate-500 italic uppercase">Log: AgriMap Gov Auth v2.5</span>
             </div>
             <img src={showFullImage} className="w-full h-auto max-h-[70vh] object-contain rounded-xl border-2 border-slate-100" alt="Full Cert" />
             <div className="mt-6 flex justify-end gap-4">
                <button onClick={() => setShowFullImage(null)} className="px-8 py-3 bg-black text-white font-black rounded-xl uppercase tracking-tighter shadow-lg">Đóng lại</button>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <motion.div 
          key="logs"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 overflow-hidden"
        >
          <div className="bg-slate-900 p-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight font-sans">Nhật ký Hoạt động hệ thống</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Audit Log - Hồ sơ truy xuất bảo mật cấp cao</p>
            </div>
            <button className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-[1.5rem] text-[11px] font-black border border-white/10 flex items-center gap-3 transition-all">
              <Filter size={16} /> TRUY XUẤT NÂNG CAO
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Thời điểm</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Cán bộ thực hiện</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Loại hành động</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Đối tượng</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 italic font-mono">Log Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_LOGS.map((log, idx) => (
                  <motion.tr 
                    key={log.id} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-slate-50 transition-all"
                  >
                    <td className="px-10 py-8 text-xs font-bold text-slate-400 font-mono tracking-tighter">{log.timestamp}</td>
                    <td className="px-10 py-8">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{log.adminName}</p>
                      <p className="text-[10px] font-bold text-slate-400 font-mono mt-1">{log.adminId}</p>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                        log.action === 'Duyệt hồ sơ' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{log.targetName}</p>
                      <p className="text-[10px] font-bold text-slate-400 font-mono mt-1">ID: {log.targetId}</p>
                    </td>
                    <td className="px-10 py-8 text-xs font-bold text-slate-500 italic leading-relaxed max-w-sm">"{log.details}"</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'map' && (
        <motion.div 
          key="map"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-[750px] bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-300/40 overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-slate-50/50 pointer-events-none group-hover:opacity-0 transition-opacity z-10"></div>
          <MapInterface 
            products={products} 
            isFarmerView={false} 
            onSearch={setMapSearchQuery}
            initialSearchQuery={mapSearchQuery}
            cart={cart}
            setCart={setCart}
            orders={orders}
            setOrders={setOrders}
          />
        </motion.div>
      )}

      {activeTab === 'complaints' && (
        <motion.div 
          key="complaints"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10"
        >
          <div className="lg:col-span-4 space-y-4 max-h-[800px] overflow-y-auto pr-3 custom-scrollbar">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 mb-6 sticky top-0 z-10 shadow-xl shadow-slate-200/40">
              <div className="relative group">
                <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  placeholder="Tìm theo chủ thể, tiêu đề..." 
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl outline-none border border-transparent focus:border-emerald-300 focus:bg-white text-slate-900 font-bold transition-all text-sm" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              {sortedComplaints.map((c, idx) => (
                <motion.button 
                  key={c.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setSelectedComplaint(c)}
                  className={`w-full p-6 rounded-[2rem] border transition-all text-left flex items-center justify-between group relative overflow-hidden ${
                    selectedComplaint?.id === c.id 
                    ? 'border-emerald-200 bg-emerald-50 shadow-xl shadow-emerald-500/5' 
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                  }`}
                >
                  {selectedComplaint?.id === c.id && (
                    <motion.div layoutId="complaintActive" className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500" />
                  )}
                  <div className="flex-1 relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className={`text-base font-black uppercase tracking-tight transition-colors ${selectedComplaint?.id === c.id ? 'text-emerald-900' : 'text-slate-800'}`}>{c.title}</h4>
                      {c.status === ComplaintStatus.PROCESSING && <span className="animate-pulse w-2 h-2 rounded-full bg-blue-500"></span>}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Người gửi: {c.fromUserName}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className={`text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-wider ${c.type === 'REGISTRATION' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                        {c.type === 'REGISTRATION' ? 'VÙNG TRỒNG' : 'GIAO DỊCH'}
                      </span>
                      <span className={`text-[9px] px-3 py-1 rounded-lg font-black uppercase tracking-wider ${
                        c.status === ComplaintStatus.PENDING ? 'bg-amber-100 text-amber-700' :
                        c.status === ComplaintStatus.PROCESSING ? 'bg-blue-100 text-blue-700' :
                        c.status === ComplaintStatus.RESOLVED ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className={`text-slate-300 transition-all ${selectedComplaint?.id === c.id ? 'translate-x-1 text-emerald-500' : 'group-hover:text-slate-500'}`} />
                </motion.button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedComplaint ? (
                <motion.div 
                  key={selectedComplaint.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[3.5rem] border border-slate-100 p-12 shadow-2xl shadow-slate-200/50"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-2xl ${selectedComplaint.type === 'REGISTRATION' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                          <ShieldAlert size={28} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{selectedComplaint.title}</h3>
                      </div>
                      <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-3">
                        Gửi ngày: {new Date(selectedComplaint.createdAt).toLocaleDateString('vi-VN')} <span className="w-1 h-1 bg-slate-300 rounded-full"></span> ID No: {selectedComplaint.id}
                      </p>
                    </div>
                    <div className="bg-slate-50 px-6 py-4 rounded-3xl border border-slate-100 text-center min-w-[200px]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Trạng thái xử lý</p>
                      <span className={`px-5 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest inline-block ${
                        selectedComplaint.status === ComplaintStatus.RESOLVED ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                        selectedComplaint.status === ComplaintStatus.REJECTED ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 
                        'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      }`}>
                        {selectedComplaint.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 border border-slate-100">
                        <Users size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Người khiếu nại</p>
                        <p className="text-base font-black text-slate-800 uppercase leading-none">{selectedComplaint.fromUserName}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50/50 p-8 rounded-3xl border border-slate-100 flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 border border-slate-100">
                        <ShieldCheck size={20} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đối tượng bị phản ánh</p>
                        <p className="text-base font-black text-slate-800 uppercase leading-none">{selectedComplaint.targetName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-12">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Nội dung chi tiết</p>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                      <div className="relative bg-white border border-slate-100 p-10 rounded-[2rem] shadow-xl shadow-slate-200/20 italic text-slate-700 leading-relaxed text-lg">
                        "{selectedComplaint.description}"
                      </div>
                    </div>
                  </div>

                  {selectedComplaint.evidence && (
                    <div className="mb-12">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Tư liệu & Bằng chứng xác thực ({selectedComplaint.evidence.length})</p>
                      <div className="flex flex-wrap gap-6">
                        {selectedComplaint.evidence.map((img, i) => (
                          <motion.div 
                            key={i}
                            whileHover={{ y: -5, scale: 1.05 }}
                            className="relative group cursor-zoom-in"
                            onClick={() => setShowFullImage(img)}
                          >
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent rounded-2xl transition-colors"></div>
                            <img 
                              src={img} 
                              className="w-36 h-36 object-cover rounded-2xl border-4 border-white shadow-xl ring-1 ring-slate-100"
                              alt="Evidence"
                            />
                            <div className="absolute bottom-3 right-3 bg-white/90 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <Search size={14} className="text-slate-900" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-8 pt-12 border-t border-slate-100">
                    <div className="relative">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block px-1">Kết luận xử lý từ Ban quản trị</label>
                      <textarea 
                        className="w-full p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 focus:border-emerald-300 focus:bg-white outline-none font-bold text-slate-800 transition-all text-base min-h-[160px] shadow-inner" 
                        placeholder="Vui lòng nhập cơ sở lý luận và kết luận xử lý cuối cùng..."
                        value={complaintNote}
                        onChange={(e) => setComplaintNote(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleComplaintAction(ComplaintStatus.PROCESSING)}
                        className="py-5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border border-slate-200"
                      >
                        Tiếp nhận hồ sơ
                      </motion.button>
                      <motion.button 
                        whileHover={complaintNote.trim() ? { scale: 1.02, y: -2 } : {}}
                        whileTap={complaintNote.trim() ? { scale: 0.98 } : {}}
                        onClick={() => handleComplaintAction(ComplaintStatus.RESOLVED)}
                        disabled={!complaintNote.trim()}
                        className={`py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all ${
                          complaintNote.trim() 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Chấp nhận & Giải quyết
                      </motion.button>
                      <motion.button 
                        whileHover={complaintNote.trim() ? { scale: 1.02, y: -2 } : {}}
                        whileTap={complaintNote.trim() ? { scale: 0.98 } : {}}
                        onClick={() => handleComplaintAction(ComplaintStatus.REJECTED)}
                        disabled={!complaintNote.trim()}
                        className={`py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl transition-all ${
                          complaintNote.trim() 
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20' 
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Bác bỏ nội dung
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[600px] bg-slate-50/30 rounded-[4rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center mb-8 shadow-xl shadow-slate-200/50">
                    <ShieldAlert size={56} className="text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Trung tâm hòa giải & Khiếu nại</h3>
                  <p className="text-slate-400 font-bold uppercase text-xs mt-4 tracking-widest opacity-60">Chọn hồ sơ phản ánh để bắt đầu quy trình đối soát và xử lý</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
       {showFieldMap && (
        <div className="fixed inset-0 z-[6000] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-500">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[4rem] w-full max-w-7xl h-[90vh] relative overflow-hidden shadow-2xl border border-slate-100 flex flex-col"
          >
            <div className="p-10 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-8">
              <div className="flex items-center gap-6">
                <div className="bg-emerald-500 p-4 rounded-[1.5rem] text-white shadow-xl shadow-emerald-500/20">
                  <MapIcon size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight font-sans">Hệ thống Đối soát Tọa độ số</h3>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mt-1 opacity-80">AgriMap Gov Auth • Real-time Sync Protocol v2.5</p>
                </div>
              </div>
              <div className="flex items-center gap-10">
                <div className="text-right border-r border-white/10 pr-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 leading-none">Vĩ độ (LAT)</p>
                  <p className="text-xl font-black text-white tracking-widest font-mono">{showFieldMap.lat.toFixed(6)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 leading-none">Kinh độ (LNG)</p>
                  <p className="text-xl font-black text-white tracking-widest font-mono">{showFieldMap.lng.toFixed(6)}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 relative bg-slate-50">
               {/* Map integration placeholder or real map would go here, using the products array to show markers */}
               <div className="absolute inset-0 flex items-center justify-center bg-slate-100/50">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Đang nạp dữ liệu vệ tinh...</p>
               </div>
               
               {/* Overlay Info Card */}
               <div className="absolute bottom-10 left-10 z-[3000] bg-white/90 backdrop-blur-xl border border-slate-100 p-8 rounded-[3rem] shadow-2xl max-w-sm pointer-events-none animate-in slide-in-from-left-10 duration-700">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shrink-0 shadow-xl shadow-slate-900/30">
                      <Target size={32} className="animate-pulse text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang kiểm soát</p>
                      <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight leading-none mt-1">{showFieldMap.name}</h4>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-[11px] font-black uppercase border-b border-slate-50 pb-4">
                      <span className="text-slate-400">Sai số cho phép</span>
                      <span className="text-emerald-600 font-mono">+/- 0.000001°</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase border-b border-slate-100/50 pb-4">
                      <span className="text-slate-400">Trạng thái định vị</span>
                      <span className="text-blue-600 font-mono tracking-tighter bg-blue-50 px-3 py-1 rounded-lg">SECURE LOCK</span>
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-emerald-50 rounded-2xl flex items-center gap-4 border border-emerald-100 shadow-sm shadow-emerald-500/5">
                    <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <ShieldCheck size={20} />
                    </div>
                    <p className="text-[11px] font-black text-emerald-800 uppercase tracking-tight">Tọa độ khớp hồ sơ 100%</p>
                  </div>
               </div>
            </div>
            
            <div className="p-10 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-4 text-emerald-600">
                  <CheckCircle2 size={24} />
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] italic">Xác thực bởi AgriMap Verification Node #712</p>
               </div>
               <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: '#0f172a' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFieldMap(null)}
                className="px-12 py-5 bg-slate-900 text-white rounded-[1.8rem] font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-2xl shadow-slate-900/20"
               >
                Hoàn tất & Thoát
               </motion.button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {isLogoutDialogOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[5000] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3.5rem] p-12 max-w-md w-full shadow-2xl shadow-slate-900/30 border border-slate-100 text-center"
            >
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 border border-red-100 mx-auto">
                <LogOut size={42} className="text-red-500 ml-2" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-3">Xác nhận thoát</h3>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm">Hệ thống sẽ ghi nhận phiên làm việc của bạn kết thúc tại thời điểm này. Bạn có chắc chắn?</p>
              <div className="flex flex-col gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsLogoutDialogOpen(false);
                    onLogout();
                  }}
                  className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-600/30 transition-all"
                >
                  Kết thúc phiên trực
                </motion.button>
                <button 
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className="w-full py-4 text-slate-400 hover:text-slate-800 font-black uppercase tracking-widest text-[10px] transition-all"
                >
                  Tiếp tục làm việc
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  </div>
);
};

export default AdminDashboard;
