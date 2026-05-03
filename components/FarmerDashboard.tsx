
import React, { useState } from 'react';
import { FarmProduct, ProductStatus, FarmerUser, Order, NegotiationSession } from '../types';
import { APP_LOGO } from '../constants';
import { Logo } from './Logo';
import { 
  Sprout, CheckCircle2, Clock, MapPin, 
  ClipboardCheck, Search, ChevronDown, 
  UserCheck, Building2, HelpCircle, 
  ArrowRight, FileText, Calendar, AlertCircle,
  LayoutDashboard, BookOpen, ShoppingBag, Zap,
  ShoppingCart, Package, GraduationCap, AlertTriangle,
  Landmark, Bell, User, Sun, Cloud, Thermometer, CloudSun,
  ArrowLeft, Layers, Map as MapIconLucide, NotebookPen, PenTool, Gavel, Truck, Camera, Image, Plus, Edit3, Save,
  ShieldCheck, X, ChevronRight, CreditCard, FileSignature, LogOut, TrendingUp, MessageSquare, Trash2
} from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import FarmProductDetail from './FarmProductDetail';
import AIDiagnosis from './AIDiagnosis';
import WeatherModal from './WeatherModal';
import { AppNotification } from '../types';

import { MarketAiService } from '../services/marketAiService';
import { BigDataAnalytics } from '../types';

interface FarmerDashboardProps {
  user: FarmerUser;
  products: FarmProduct[];
  onViewPortal: () => void;
  onNavigate?: (tab: any) => void;
  initialView?: 'dashboard' | 'records' | 'timeline';
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onLogout: () => void;
  onReportViolation: (report: any) => void;
  onStartNegotiation?: (product: FarmProduct, sessionId?: string) => void;
  negotiationSessions?: NegotiationSession[];
  activeSessionId?: string | null;
  setActiveSessionId?: (id: string | null) => void;
  onSendMessage?: (text: string) => void;
  onProposeContract?: () => void;
  onDeleteNegotiation?: (sessionId: string) => void;
  proposedOrderId?: string | null;
  onClearProposedOrder?: () => void;
}

const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ 
  user, products, onViewPortal, onNavigate, initialView = 'dashboard', 
  orders, setOrders, onLogout, onReportViolation, 
  onStartNegotiation, negotiationSessions = [],
  activeSessionId, setActiveSessionId, onSendMessage, onProposeContract,
  onDeleteNegotiation, proposedOrderId, onClearProposedOrder
}) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'records' | 'timeline' | 'ai' | 'contact' | 'e-contract-agreement' | 'orders'>(initialView);
  const [bigData, setBigData] = useState<BigDataAnalytics | null>(null);

  // Fetch big data on mount
  React.useEffect(() => {
    MarketAiService.getBigDataAnalytics().then(setBigData);
  }, []);

  const [selectedProduct, setSelectedProduct] = useState<FarmProduct | null>(null);
  const [selectedContract, setSelectedContract] = useState<Order | null>(null);

  React.useEffect(() => {
    if (proposedOrderId) {
      const order = orders.find(o => o.id === proposedOrderId);
      if (order) {
        setActiveView('e-contract-agreement');
        setSelectedContract(order);
        if (onClearProposedOrder) onClearProposedOrder();
      }
    }
  }, [proposedOrderId, orders, onClearProposedOrder]);

  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationNote, setNegotiationNote] = useState('');
  const [verificationPhotos, setVerificationPhotos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'f-notif-1',
      type: 'order_status',
      title: 'Yêu cầu báo giá mới',
      message: 'Một khách hàng vừa gửi yêu cầu báo giá cho 500kg Cam sành Vĩnh Long.',
      timestamp: '10 phút trước',
      isRead: false,
      relatedId: 'ORD-Q-001'
    },
    {
      id: 'f-notif-2',
      type: 'contract_signed',
      title: 'Hợp đồng đã được ký',
      message: 'Khách hàng Nguyễn Văn An đã ký hợp đồng điện tử AGRI/2024/002.',
      timestamp: '2 giờ trước',
      isRead: true,
      relatedId: 'ORD-2024-002'
    }
  ]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [reportingViolation, setReportingViolation] = useState<{orderId: string, type: string} | null>(null);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [violationDesc, setViolationDesc] = useState('');
  const [violationEvidences, setViolationEvidences] = useState<string[]>([]);

  // Simulation: Buyer signs contract notification
  React.useEffect(() => {
    // Timer 1: Deposit received (already implemented)
    const depositTimer = setTimeout(() => {
      const newNotif: AppNotification = {
        id: `f-notif-p-${Date.now()}`,
        type: 'payment_success',
        title: 'Đã nhận tiền cọc',
        message: 'Bạn vừa nhận được 4,500,000 VNĐ tiền đặt cọc cho đơn hàng ORD-2024-002.',
        timestamp: 'Vừa xong',
        isRead: false,
        relatedId: 'ORD-2024-002'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setActiveToast(newNotif);
    }, 15000);

    // Timer 2: New Order Request
    const orderTimer = setTimeout(() => {
      const newNotif: AppNotification = {
        id: `f-notif-o-${Date.now()}`,
        type: 'order_status',
        title: 'Đơn hàng mới từ hệ thống',
        message: 'Chuỗi cửa hàng Bách Hóa Xanh gửi yêu cầu thu mua 2 tấn Thanh long Ruột đỏ.',
        timestamp: 'Vừa xong',
        isRead: false,
        relatedId: 'ORD-Q-888'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setActiveToast(newNotif);
    }, 45000);

    // Timer 3: Contract Signed by Buyer
    const signTimer = setTimeout(() => {
      const newNotif: AppNotification = {
        id: `f-notif-s-${Date.now()}`,
        type: 'contract_signed',
        title: 'Khách hàng đã ký hợp đồng',
        message: 'Hợp đồng AGRI/2024/001 đã được khách hàng ký số thành công. Vui lòng kiểm tra và xác nhận.',
        timestamp: 'Vừa xong',
        isRead: false,
        relatedId: 'ORD-2024-001'
      };
      setNotifications(prev => [newNotif, ...prev]);
      setActiveToast(newNotif);
    }, 75000);

    return () => {
      clearTimeout(depositTimer);
      clearTimeout(orderTimer);
      clearTimeout(signTimer);
    };
  }, []);

  const activeNegotiations = negotiationSessions.filter(s => 
    s.farmerId === user.id && (s.status === 'OPEN' || s.status === 'CONTRACT_PROPOSED')
  );

  // Toast auto-dismiss
  React.useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Reset violation report state when modal closes
  React.useEffect(() => {
    if (!reportingViolation) {
      setViolationDesc('');
      setViolationEvidences([]);
    }
  }, [reportingViolation]);

  const unreadCount = React.useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const updateDeliveryStatus = (orderId: string, stepIndex: number, photos?: string[], details?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId && o.deliveryTimeline) {
        const newTimeline = o.deliveryTimeline.map((step, idx) => {
          if (idx === stepIndex) {
            return { 
              ...step, 
              completed: true, 
              timestamp: new Date().toLocaleString(),
              photos: photos || step.photos,
              details: details || step.details
            };
          }
          return step;
        });

        let newStatus = o.status;
        const completedStep = newTimeline[stepIndex];
        const isLastStep = stepIndex === newTimeline.length - 1;

        if (isLastStep) {
          newStatus = 'Hoàn tất';
        } else if (completedStep.status === 'preparing') {
          newStatus = 'Chuẩn bị vận chuyển';
        } else if (completedStep.status === 'shipping') {
          newStatus = 'Đang giao hàng';
        } else if (completedStep.status === 'signed') {
          newStatus = 'Đang chuẩn bị hàng';
        }

        return { ...o, deliveryTimeline: newTimeline, status: newStatus };
      }
      return o;
    }));
  };

  const [expandedId, setExpandedId] = useState<string | null>(products[0]?.id || null);

  const farmerName = user.representative;
  const totalArea = "2.5 ha";
  const currentDate = "Thứ Hai, 14/07/2025";
  const weatherInfo = "28°C, có mây";

  const stats = [
    { label: 'Sản lượng tháng', value: '1.2 tấn', icon: <Sprout className="text-green-600" />, sub: 'Sản lượng tháng' },
    { label: 'Đơn hàng mới', value: String(orders.filter(o => o.status === 'Đã ký kết' && (user.id === 'F-DEMO' || o.items.some(i => i.farmerId === user.id || i.farmerId === 'f_current'))).length), icon: <ShoppingCart className="text-blue-600" />, sub: 'Đơn hàng mới' },
    { label: 'Doanh thu tháng', value: '18.4 tr', icon: <Landmark className="text-yellow-600" />, sub: 'Doanh thu tháng' },
    { label: 'Tổng hồ sơ', value: String(products.length), icon: <FileText className="text-orange-600" />, sub: 'Tổng hồ sơ' },
  ];

  const menuItems = [
    { id: 'contact', label: 'Liên lạc', icon: <MessageSquare />, color: 'bg-amber-500', onClick: () => setActiveView('contact'), badge: activeNegotiations.length > 0 ? String(activeNegotiations.length) : undefined },
    { id: 'records', label: 'Hồ sơ', icon: <Layers />, color: 'bg-[#10B981]', onClick: () => setActiveView('records') },
    { id: 'ai', label: 'AI Chẩn đoán', icon: <Zap />, color: 'bg-[#84CC16]', onClick: () => setActiveView('ai') },
    { id: 'orders', label: 'Đơn hàng', icon: <ShoppingCart />, color: 'bg-[#15803D]', onClick: () => setActiveView('orders'), badge: orders.filter(o => ['Đã ký kết', 'Đang chuẩn bị hàng', 'Chuẩn bị vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'].includes(o.status) && (user.id === 'F-DEMO' || o.items.some(i => i.farmerId === user.id || i.farmerId === 'f_current'))).length > 0 ? String(orders.filter(o => ['Đã ký kết', 'Đang chuẩn bị hàng', 'Chuẩn bị vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'].includes(o.status) && (user.id === 'F-DEMO' || o.items.some(i => i.farmerId === user.id || i.farmerId === 'f_current'))).length) : undefined },
    { id: 'warehouse', label: 'Kho hàng', icon: <Package />, color: 'bg-[#15803D]' },
    { id: 'weather', label: 'Dự báo thời tiết', icon: <CloudSun />, color: 'bg-amber-400', onClick: () => setIsWeatherOpen(true) },
    { id: 'e-contract-agreement', label: 'Thỏa thuận ký kết HĐĐT', icon: <PenTool />, color: 'bg-indigo-600', onClick: () => setActiveView('e-contract-agreement'), badge: orders.filter(o => (o.status === 'Đang xử lý' || o.status === 'Đang thương lượng' || o.status === 'Chờ ký kết') && (user.id === 'F-DEMO' || o.items.some(i => i.farmerId === user.id || i.farmerId === 'f_current'))).length > 0 ? String(orders.filter(o => (o.status === 'Đang xử lý' || o.status === 'Đang thương lượng' || o.status === 'Chờ ký kết') && (user.id === 'F-DEMO' || o.items.some(i => i.farmerId === user.id || i.farmerId === 'f_current'))).length) : undefined },
  ];

  // Logic for the old view (Records Tracking)
  const getStepData = (product: FarmProduct) => {
    const isCompleted = product.status === ProductStatus.COMPLETED;
    const isPending = product.status === ProductStatus.PENDING;
    const hasNote = !!product.verificationNote;

    return [
      {
        id: 1,
        title: 'Bước 1: Chờ xác minh',
        description: 'Hồ sơ đã được gửi thành công. Hệ thống đang đợi Cán bộ Huyện tiếp nhận và đối soát chứng từ sơ bộ.',
        status: (isPending || isCompleted || hasNote) ? 'COMPLETED' : 'CURRENT',
        officer: 'Bộ phận Tiếp nhận - Phòng Nông nghiệp',
        date: new Date(product.updatedAt).toLocaleDateString('vi-VN')
      },
      {
        id: 2,
        title: 'Bước 2: Đang xử lý',
        description: 'Cán bộ đang tiến hành xác minh thực địa hoặc kiểm tra tính pháp lý của các chứng chỉ (VietGAP/OCOP).',
        status: isCompleted ? 'COMPLETED' : (isPending && hasNote ? 'CURRENT' : (isPending ? 'WAITING' : 'WAITING')),
        officer: 'Đoàn kiểm tra liên ngành / Cán bộ kỹ thuật',
        date: hasNote ? 'Đang thực hiện' : 'Chờ xử lý'
      },
      {
        id: 3,
        title: 'Bước 3: Hoàn tất',
        description: 'Chúc mừng! Hồ sơ đã được duyệt. Vùng trồng của bạn đã chính thức hiển thị công khai trên bản đồ nông sản toàn quốc.',
        status: isCompleted ? 'COMPLETED' : 'WAITING',
        officer: 'Sở NN&PTNT / Cục Trồng trọt',
        date: isCompleted ? (product.verifiedAt ? new Date(product.verifiedAt).toLocaleDateString('vi-VN') : 'Vừa xong') : '---'
      }
    ];
  };

  const renderSharedModals = () => (
    <>
      {/* Report Violation Modal */}
      {reportingViolation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[3rem] border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-red-600 text-white p-3 rounded-2xl shadow-lg">
                  <AlertTriangle size={32} />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter text-red-600">Báo cáo vi phạm</h3>
                  <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Mã đơn hàng: {reportingViolation.orderId}</p>
                </div>
              </div>
              <button 
                onClick={() => setReportingViolation(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-all border-2 border-transparent hover:border-slate-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-[2rem] border-2 border-red-100">
                <p className="text-xs font-black text-red-800 uppercase mb-2 tracking-widest">Lưu ý quan trọng</p>
                <p className="text-[11px] font-bold text-red-900 leading-relaxed italic">
                  "Mọi thông tin báo cáo sẽ được AgriMap phối hợp cùng cơ quan chức năng xác minh. Việc báo cáo sai sự thật có thể dẫn đến việc đình chỉ tài khoản vĩnh viễn."
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-black uppercase tracking-widest ml-1">Mô tả nội dung vi phạm</label>
                <textarea 
                  value={violationDesc}
                  onChange={(e) => setViolationDesc(e.target.value)}
                  placeholder="Vui lòng cung cấp chi tiết về hành vi vi phạm (ví dụ: thanh toán trễ, ép giá sau ký kết, không nhận hàng...)"
                  className="w-full h-40 bg-slate-50 border-4 border-black p-6 rounded-[2rem] font-bold focus:ring-8 focus:ring-red-500/10 transition-all outline-none resize-none placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-black uppercase tracking-widest ml-1">Bằng chứng hình ảnh/tài liệu</label>
                <div className="flex flex-wrap gap-4">
                  {violationEvidences.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img src={img} className="w-24 h-24 rounded-2xl object-cover border-4 border-black shadow-md" />
                      <button 
                        onClick={() => setViolationEvidences(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 border-2 border-black group-hover:scale-110 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="w-24 h-24 rounded-2xl bg-slate-100 border-4 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-red-500 hover:text-red-500 transition-all cursor-pointer group">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        files.forEach(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setViolationEvidences(prev => [...prev, reader.result as string]);
                          };
                          reader.readAsDataURL(file);
                        });
                      }}
                    />
                    <Plus size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase mt-1">Tải lên</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setReportingViolation(null)}
                className="flex-1 bg-white border-4 border-black py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                disabled={!violationDesc.trim()}
                onClick={() => {
                  onReportViolation({
                    type: reportingViolation.type,
                    title: `Tố cáo vi phạm đơn hàng ${reportingViolation.orderId}`,
                    description: violationDesc,
                    fromUserId: user.id,
                    fromUserName: user.representative,
                    targetId: reportingViolation.orderId,
                    targetName: `Đơn hàng ${reportingViolation.orderId}`,
                    evidence: violationEvidences
                  });
                  setReportingViolation(null);
                }}
                className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all ${
                  violationDesc.trim() 
                  ? 'bg-red-600 text-white border-4 border-black hover:bg-red-700' 
                  : 'bg-slate-200 text-slate-400 border-4 border-slate-300 cursor-not-allowed shadow-none active:translate-0'
                }`}
              >
                Gửi báo cáo ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {isLogoutDialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white border-4 border-black rounded-[2.5rem] p-8 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 font-sans">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-6 border-4 border-red-100 mx-auto">
              <LogOut size={40} className="text-red-500" />
            </div>
            <h3 className="text-2xl font-black text-center text-slate-800 uppercase tracking-tighter mb-2">Đăng xuất?</h3>
            <p className="text-slate-500 text-center font-bold mb-8 uppercase tracking-widest text-[10px]">Bạn có chắc chắn muốn kết thúc phiên làm việc này?</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setIsLogoutDialogOpen(false)}
                className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
              >
                Hủy
              </button>
              <button 
                onClick={onLogout}
                className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
              >
                Đăng xuất ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-8 z-[5000] w-full max-w-sm"
          >
            <div className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 bottom-0 w-2 bg-emerald-500"></div>
              <div className="flex gap-4 items-start">
                <div className={`p-3 rounded-xl ${
                  activeToast.type === 'payment_success' ? 'bg-emerald-100 text-emerald-600' : 
                  activeToast.type === 'contract_signed' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {activeToast.type === 'payment_success' ? <Landmark size={24} /> : 
                   activeToast.type === 'contract_signed' ? <PenTool size={24} /> : <ShoppingCart size={24} />}
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-black text-slate-800 uppercase tracking-tighter">{activeToast.title}</h4>
                  <p className="text-xs font-bold text-slate-500 leading-tight">{activeToast.message}</p>
                </div>
                <button onClick={() => setActiveToast(null)} className="text-slate-300 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WeatherModal isOpen={isWeatherOpen} onClose={() => setIsWeatherOpen(false)} />
    </>
  );

  if (selectedContract) {
    const product = selectedContract.items[0];
    const buyerInfo = {
      fullName: selectedContract.buyerName || "Nguyễn Văn Khách",
      address: selectedContract.buyerAddress || "123 Đường Lê Lợi, Quận 1, TP. HCM",
      phone: selectedContract.buyerPhone || "0901234567"
    };

    const isSigned = ['Đã ký kết', 'Đang chuẩn bị hàng', 'Chuẩn bị vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'].includes(selectedContract.status);
    const quantity = selectedContract.quantity || 0;
    const unitPrice = product.price || 0;
    const itemTotal = quantity * unitPrice;
    const shippingFee = 25000;
    const total = selectedContract.total || (itemTotal + shippingFee);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {/* Re-use Header logic to ensure notifications are visible even here */}
        <header className="bg-white/90 backdrop-blur-md border-b-2 border-slate-100 px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-[1000] shadow-sm">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedContract(null)}
              className="flex items-center gap-2 p-2 px-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-black uppercase text-xs transition-all"
            >
              <ArrowLeft size={18} /> Quay lại
            </motion.button>
            <div className="h-8 w-[2px] bg-slate-200 mx-2 hidden md:block"></div>
            <h2 className="text-lg font-black uppercase tracking-tighter text-slate-800 hidden md:block">Chi tiết hợp đồng</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 transition-all rounded-xl ${isNotifOpen ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-2 border-transparent hover:border-emerald-100'}`}
              >
                <Bell size={22} />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-red-500/40 z-10"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] border-2 border-slate-100 shadow-2xl z-[1100] overflow-hidden"
                  >
                    {/* Notification content - shared logic */}
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-black uppercase tracking-tighter text-lg text-slate-800">Thông báo</h3>
                      <button onClick={markAllAsRead} className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 tracking-widest">Đánh dấu đã đọc</button>
                    </div>
                    <div className="max-h-[32rem] overflow-y-auto p-4 space-y-3">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center text-slate-300 font-bold uppercase text-[10px] tracking-widest">Không có thông báo</div>
                      ) : (
                        notifications.map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              markAsRead(notif.id);
                              if (notif.relatedId) {
                                setSelectedContract(orders.find(o => o.id === notif.relatedId) || null);
                                setIsNotifOpen(false);
                              }
                            }}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.isRead ? 'bg-white opacity-60' : 'bg-emerald-50/30 border-emerald-100 shadow-sm'}`}
                          >
                            <h4 className="font-black text-sm uppercase tracking-tight text-slate-800">{notif.title}</h4>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed mt-1">{notif.message}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">{notif.timestamp}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               className="w-10 h-10 rounded-xl border-2 border-slate-200 overflow-hidden bg-slate-100 shadow-sm"
            >
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.representative}`} alt="Avatar" className="w-full h-full object-cover" />
            </motion.button>
          </div>
        </header>

        <div className="p-6 md:p-10 pb-48 overflow-y-auto flex-1">
          <div className="max-w-4xl mx-auto w-full bg-white rounded-[3rem] border-4 border-black shadow-[16px_16px_1px_0px_rgba(0,0,0,1)] overflow-hidden">
            {/* Inner Content Header removed as we use the main header now */}
            <div className="p-10 space-y-10 font-sans text-slate-800 leading-relaxed">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
              <p className="font-bold text-lg">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-40 h-1 bg-black mx-auto mt-3"></div>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Hợp đồng mua bán nông sản</h3>
              <p className="italic text-slate-500 font-bold mt-1">(Số: {selectedContract.contractNumber || `HD-${selectedContract.id.split('-')[1]}`})</p>
            </div>

            <div className="space-y-4 text-sm font-bold">
              <ul className="list-disc pl-6 space-y-1">
                <li>Căn cứ Bộ luật Dân sự số 91/2015/QH13;</li>
                <li>Căn cứ Luật Thương mại số 36/2005/QH11;</li>
                <li>Căn cứ nhu cầu và thỏa thuận của các bên.</li>
              </ul>
              <p className="mt-6">Hợp đồng được ký kết vào ngày {selectedContract.contractDate || selectedContract.date}, tại nền tảng AgriMap, giữa:</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-100 space-y-3">
                <h4 className="font-black text-blue-800 uppercase mb-4 text-sm tracking-widest border-b-2 border-blue-200 pb-2">Bên Mua (Bên B)</h4>
                <p>• <strong>Đại diện:</strong> {buyerInfo.fullName}</p>
                <p>• <strong>Địa chỉ:</strong> {buyerInfo.address}</p>
                <p>• <strong>Số điện thoại:</strong> {buyerInfo.phone}</p>
              </div>
              <div className="p-6 bg-green-50 rounded-3xl border-2 border-green-100 space-y-3">
                <h4 className="font-black text-green-800 uppercase mb-4 text-sm tracking-widest border-b-2 border-green-200 pb-2">Bên Bán (Bên A)</h4>
                <p>• <strong>Đại diện:</strong> {user.representative}</p>
                <p>• <strong>Địa chỉ:</strong> {`${user.address.detail}, ${user.address.commune}, ${user.address.district}, ${user.address.province}`}</p>
                <p>• <strong>Số điện thoại:</strong> {user.phone}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="font-black uppercase text-lg border-l-8 border-black pl-4">Nội dung giao dịch</h4>
              <div className="bg-slate-50 p-8 rounded-[2rem] border-4 border-black">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b-4 border-black">
                      <th className="pb-4 font-black uppercase text-xs">Sản phẩm</th>
                      <th className="pb-4 font-black uppercase text-xs text-center">Số lượng</th>
                      <th className="pb-4 font-black uppercase text-xs text-right">Đơn giá</th>
                      <th className="pb-4 font-black uppercase text-xs text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200">
                    <tr key={product.id}>
                      <td className="py-6 font-black uppercase">{product.name}</td>
                      <td className="py-6 text-center font-bold">{quantity.toLocaleString()} kg</td>
                      <td className="py-6 text-right font-bold">{unitPrice.toLocaleString()}đ</td>
                      <td className="py-6 text-right font-black">{itemTotal.toLocaleString()}đ</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-4 border-black">
                      <td colSpan={3} className="pt-6 text-right font-black uppercase text-sm">Phí vận chuyển:</td>
                      <td className="pt-6 text-right font-bold">{shippingFee.toLocaleString()}đ</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="pt-2 text-right text-2xl font-black uppercase">Tổng cộng:</td>
                      <td className="pt-2 text-right text-2xl font-black text-green-700">{total.toLocaleString()}đ</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="space-y-12 mt-12">
              <section>
                <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                  <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
                  ĐIỀU 1: ĐỐI TƯỢNG HÀNG HÓA VÀ TIÊU CHUẨN
                </h4>
                <div className="pl-12 space-y-2 text-sm font-medium">
                  <p>1. <strong>Tên sản phẩm:</strong> {product.name}</p>
                  <p>2. <strong>Sản lượng:</strong> {quantity.toLocaleString()} kg. Tỷ lệ sai số cho phép: +/- 5%</p>
                  <p>3. <strong>Tiêu chuẩn chất lượng:</strong> {product.certificates?.map((c: any) => c.type).join('/') || 'Đạt tiêu chuẩn xuất khẩu, không dư lượng thuốc BVTV'}.</p>
                  <p>4. <strong>Quy cách đóng gói:</strong> Đóng thùng carton/sọt nhựa theo tiêu chuẩn vận chuyển nông sản.</p>
                  <p>5. <strong>Truy xuất nguồn gốc:</strong> Sản phẩm được định danh và theo dõi nhật ký canh tác tại vùng trồng trên hệ thống AgriMap.</p>
                </div>
              </section>

              <section>
                <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                  <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">2</span>
                  ĐIỀU 2: GIÁ CẢ VÀ THANH TOÁN
                </h4>
                <div className="pl-12 space-y-2 text-sm font-medium">
                  <p>1. <strong>Đơn giá:</strong> {unitPrice.toLocaleString()} VNĐ/kg (Giá đã bao gồm VAT).</p>
                  <p>2. <strong>Tổng giá trị vật tư/hàng hóa:</strong> {itemTotal.toLocaleString()} VNĐ.</p>
                  <p>3. <strong>Phí vận chuyển:</strong> {shippingFee.toLocaleString()} VNĐ.</p>
                  <p>4. <strong>Tổng cộng (tạm tính):</strong> {total.toLocaleString()} VNĐ.</p>
                  <p>5. <strong>Phương thức thanh toán:</strong> Chuyển khoản qua hệ thống ví AgriMap Pay.</p>
                  <p>6. <strong>Tiến độ thanh toán:</strong></p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Đợt 1: Tạm ứng 30% giá trị hợp đồng ngay sau khi ký kết.</li>
                    <li>Đợt 2: Thanh toán 70% còn lại sau khi nhận đủ hàng và nghiệm thu đạt chuẩn.</li>
                  </ul>
                </div>
              </section>

              <section>
                <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                  <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">3</span>
                  ĐIỀU 3: GIAO NHẬN VÀ VẬN CHUYỂN
                </h4>
                <div className="pl-12 space-y-2 text-sm font-medium">
                  <p>1. <strong>Thời gian giao hàng:</strong> Dự kiến ngày {selectedContract.date}.</p>
                  <p>2. <strong>Địa điểm giao hàng:</strong> {buyerInfo.address}</p>
                  <p>3. <strong>Phương thức vận chuyển:</strong> Xe tải chuyên dụng. Chi phí vận chuyển do Bên B chịu.</p>
                </div>
              </section>

              <section>
                  <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">4</span>
                    ĐIỀU 4: KIỂM TRA VÀ NGHIỆM THU
                  </h4>
                  <div className="pl-12 space-y-2 text-sm font-medium">
                    <p>1. Bên B có quyền kiểm tra hàng hóa ngay tại thời điểm giao nhận.</p>
                    <p>2. <strong>Thông báo lỗi:</strong> Trong vòng 24 giờ kể từ khi nhận hàng, Bên B phải thông báo cho Bên A nếu phát hiện hàng lỗi.</p>
                  </div>
                </section>

                <section className="p-8 bg-red-50 rounded-[2rem] border-2 border-red-100">
                  <h4 className="font-black text-lg mb-3 flex items-center gap-2 text-red-800 uppercase tracking-tighter">
                    <AlertTriangle size={20} />
                    ĐIỀU 5: PHẠT VI PHẠM HỢP ĐỒNG
                  </h4>
                  <div className="text-sm font-medium text-red-900 space-y-2">
                    <p>• Nếu Bên A đơn phương hủy hợp đồng: Phải hoàn trả tiền cọc và bồi thường 100% giá trị cọc.</p>
                    <p>• Nếu Bên B từ chối mua không lý do: Mất toàn bộ tiền cọc đã thanh toán.</p>
                  </div>
                </section>
            </div>

            <div className="grid grid-cols-2 gap-12 mt-20 text-center">
              <div className="space-y-4">
                <p className="font-black text-lg uppercase">Đại diện bên B</p>
                <div className="h-40 flex items-center justify-center">
                  <div className="border-4 border-emerald-600 text-emerald-600 p-6 rounded-2xl -rotate-12 font-black text-sm shadow-[8px_8px_0px_0px_rgba(5,150,105,0.2)] bg-white">
                    ĐÃ KÝ SỐ BỞI AGRIMAP<br/>
                    <span className="text-xl">{buyerInfo.fullName}</span><br/>
                    <span className="text-[10px] opacity-70 italic font-medium">{selectedContract.contractDate || selectedContract.date}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="font-black text-lg uppercase">Đại diện bên A</p>
                <div className="h-40 flex items-center justify-center">
                  {isSigned ? (
                    <div className="border-4 border-blue-600 text-blue-600 p-6 rounded-2xl rotate-12 font-black text-sm shadow-[8px_8px_0px_0px_rgba(37,99,235,0.2)] bg-white">
                      ĐÃ KÝ SỐ BỞI AGRIMAP<br/>
                      <span className="text-xl">{user.representative}</span><br/>
                      <span className="text-[10px] opacity-70 italic font-medium">Xác nhận trực tuyến</span>
                    </div>
                  ) : (
                    <div className="border-4 border-slate-300 text-slate-300 p-6 rounded-2xl rotate-12 font-black text-sm border-dashed">
                      CHỜ XÁC NHẬN<br/>
                      <span className="text-xl">{user.representative}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="p-8 bg-amber-50 border-4 border-black rounded-3xl space-y-4 shadow-[8px_8px_0px_0px_rgba(217,119,6,0.1)]">
                <h5 className="font-black uppercase text-sm text-amber-700">ĐIỀU 6: TRƯỜNG HỢP BẤT KHẢ KHÁNG</h5>
                <p className="text-xs font-bold text-amber-900 leading-relaxed italic">
                  "Nếu xảy ra thiên tai, dịch bệnh, mất mùa nghiêm trọng hoặc sự kiện bất khả kháng khác: Hai bên sẽ thương lượng điều chỉnh nghĩa vụ/hủy hợp đồng phù hợp thực tế."
                </p>
              </div>

              <div className="p-8 bg-slate-100 border-4 border-black rounded-3xl space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)]">
                <h5 className="font-black uppercase text-sm text-slate-700">ĐIỀU 7: GIẢI QUYẾT TRANH CHẤP</h5>
                <div className="text-xs font-bold text-slate-700 space-y-2 leading-relaxed">
                  <p>• Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết bằng thương lượng.</p>
                  <p>• Nếu không đạt thỏa thuận, tranh chấp được đưa ra cơ quan có thẩm quyền theo quy định pháp luật.</p>
                </div>
              </div>
            </div>
          </div>

          {!isSigned && (
            <div className="p-10 bg-slate-50 border-t-4 border-black flex flex-wrap gap-4">
              <button 
                onClick={() => setSelectedContract(null)}
                className="flex-1 min-w-[120px] bg-white border-4 border-black py-5 rounded-3xl font-black text-lg uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Để sau
              </button>
              <button 
                onClick={() => {
                  const product = selectedContract.items[0];
                  if (onStartNegotiation) {
                    onStartNegotiation(product);
                  } else {
                    setIsNegotiating(true);
                  }
                }}
                className="flex-1 min-w-[180px] bg-amber-500 text-white border-4 border-black py-5 rounded-3xl font-black text-lg uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-600 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
              >
                <MessageSquare size={24} /> Thương lượng qua Chat
              </button>
              <button 
                onClick={() => {
                  setOrders(prev => prev.map(o => 
                    o.id === selectedContract.id ? { 
                      ...o, 
                      status: 'Đã ký kết',
                      deliveryTimeline: [
                        { status: 'signed', label: 'Hợp đồng đã ký', timestamp: new Date().toLocaleString(), completed: true },
                        { status: 'preparing', label: 'Đang chuẩn bị hàng', completed: false },
                        { status: 'shipping', label: 'Chuẩn bị vận chuyển', completed: false },
                        { status: 'delivered', label: 'Đã giao hàng', completed: false },
                      ]
                    } : o
                  ));
                  
                  // Add local notification
                  const signNotif: AppNotification = {
                    id: `f-notif-sign-${Date.now()}`,
                    type: 'contract_signed',
                    title: 'Đã ký hợp đồng thành công',
                    message: `Bạn đã ký số thành công hợp đồng ${selectedContract.contractNumber}. Hệ thống đã chuyển sang bước chuẩn bị hàng.`,
                    timestamp: 'Vừa xong',
                    isRead: true,
                    relatedId: selectedContract.id
                  };
                  setNotifications(prev => [signNotif, ...prev]);
                  setActiveToast(signNotif);
                  
                  setSelectedContract(null);
                  setActiveView('orders');
                }}
                className="flex-[2] min-w-[250px] bg-indigo-600 text-white border-4 border-black py-5 rounded-3xl font-black text-lg uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-indigo-700 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
              >
                <PenTool size={24} /> Xác nhận & Ký số
              </button>
            </div>
          )}

          {isSigned && (
            <div className="p-10 bg-slate-50 border-t-4 border-black flex justify-center">
              <button 
                onClick={() => window.print()}
                className="bg-black text-white px-12 py-4 rounded-2xl font-black uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-3"
              >
                <FileText size={20} /> Tải xuống bản PDF
              </button>
            </div>
          )}

          {isNegotiating && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
              <div className="bg-white rounded-[3rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg p-10 space-y-6 animate-in zoom-in duration-300">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Nội dung thương lượng</h3>
                <textarea 
                  value={negotiationNote}
                  onChange={(e) => setNegotiationNote(e.target.value)}
                  placeholder="Nhập nội dung bạn muốn thay đổi (ví dụ: giá cả, sản lượng, thời gian giao hàng...)"
                  className="w-full h-40 bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold focus:ring-4 focus:ring-amber-500/20 transition-all"
                />
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsNegotiating(false)}
                    className="flex-1 bg-white border-4 border-black py-4 rounded-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    Hủy
                  </button>
                  <button 
                    onClick={() => {
                      setOrders(prev => prev.map(o => 
                        o.id === selectedContract.id ? { ...o, status: 'Đang thương lượng', negotiationNote } : o
                      ));
                      
                      // Add local notification
                      const negNotif: AppNotification = {
                        id: `f-notif-neg-${Date.now()}`,
                        type: 'order_status',
                        title: 'Đã gửi yêu cầu thương lượng',
                        message: `Yêu cầu thương lượng cho hợp đồng ${selectedContract.contractNumber} đã được gửi đến khách hàng.`,
                        timestamp: 'Vừa xong',
                        isRead: true,
                        relatedId: selectedContract.id
                      };
                      setNotifications(prev => [negNotif, ...prev]);
                      setActiveToast(negNotif);

                      setIsNegotiating(false);
                      setSelectedContract(null);
                      setNegotiationNote('');
                    }}
                    className="flex-1 bg-amber-500 text-white border-4 border-black py-4 rounded-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-600 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                  >
                    Gửi yêu cầu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {renderSharedModals()}
    </div>
    );
  }

  if (activeView === 'contact') {
    const selectedSession = activeNegotiations.find(s => s.id === activeSessionId);
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 md:p-10 pb-48 max-w-6xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ x: -4 }}
              onClick={() => {
                if (activeSessionId && setActiveSessionId) setActiveSessionId(null);
                else setActiveView('dashboard');
              }} 
              className="w-12 h-12 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="w-12 h-1 bg-amber-500 rounded-full"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Communication Center</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
                {selectedSession ? 'Đang nhắn tin' : 'Liên lạc'}
              </h1>
            </div>
          </div>
          {!selectedSession && (
            <div className="flex items-center gap-4 bg-white border-4 border-black p-4 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
               <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white">
                  <MessageSquare size={24} />
               </div>
               <div className="pr-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang diễn ra</p>
                  <p className="text-2xl font-black leading-none">{activeNegotiations.length} cuộc hội thoại</p>
               </div>
            </div>
          )}
        </div>

        {selectedSession ? (
          <div className="bg-white border-4 border-black rounded-[3rem] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] h-[600px] flex flex-col">
            <div className="bg-black text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center font-black text-white">
                  {selectedSession.buyerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-tight">{selectedSession.buyerName}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đang thương thảo: {selectedSession.productName}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveSessionId && setActiveSessionId(null)}
                className="text-[10px] font-black uppercase bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors"
              >
                Đóng Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
              {selectedSession.messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl ${
                    msg.senderId === user.id 
                      ? 'bg-black text-white rounded-br-none' 
                      : msg.senderId === 'system'
                        ? 'bg-slate-200 text-slate-600 text-[10px] font-bold text-center w-full mx-8'
                        : 'bg-white border-2 border-slate-100 text-slate-800 rounded-bl-none shadow-sm'
                  }`}>
                    <p className="text-xs font-medium leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 font-bold uppercase opacity-50 ${msg.senderId === user.id ? 'justify-end text-right' : 'justify-start text-left'}`}>
                      <span className="text-[8px]">{msg.senderName}</span>
                      <span className="text-[8px] mx-1">•</span>
                      <span className="text-[8px]">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white border-t-4 border-black flex flex-col gap-4">
              <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Nhập tin nhắn phản hồi..."
                  className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      onSendMessage?.(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button 
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input.value.trim()) {
                      onSendMessage?.(input.value);
                      input.value = '';
                    }
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase px-8 rounded-2xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  Gửi
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeNegotiations.length === 0 ? (
              <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white border-4 border-dashed border-slate-200 rounded-[4rem] text-center px-6">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                  <MessageSquare size={56} className="text-slate-200" />
                </div>
                <h3 className="text-3xl font-black text-slate-400 uppercase italic tracking-tight mb-4">Danh sách liên lạc trống</h3>
                <p className="max-w-md text-sm font-bold text-slate-300 uppercase tracking-widest leading-loose">
                  Hiện tại chưa có yêu cầu thương thảo. Bạn có thể xem lại hồ sơ sản phẩm để đảm bảo thông tin liên hệ và giá cả đã được tối ưu nhất.
                </p>
              </div>
            ) : (
              activeNegotiations.map(session => (
                <motion.div 
                  key={session.id}
                  whileHover={{ y: -5 }}
                  className="bg-white border-4 border-black p-6 rounded-[2.5rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(34,197,94,1)] transition-all cursor-pointer group flex flex-col"
                  onClick={() => {
                    const prod = products.find(p => p.id === session.productId);
                    if (prod && onStartNegotiation) onStartNegotiation(prod, session.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white italic font-black text-xl border-4 border-black group-hover:scale-110 transition-transform">
                        {session.buyerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-lg uppercase leading-tight">{session.buyerName}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Khách hàng / Doanh nghiệp</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Bạn có chắc chắn muốn kết thúc và xóa cuộc hội thoại này?')) {
                            onDeleteNegotiation?.(session.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Xóa hội thoại"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-2xl border-2 border-black/5 mb-6 flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Sản phẩm trao đổi:</p>
                    <p className="font-black uppercase text-slate-800 border-b-2 border-black/10 pb-2 mb-2">{session.productName}</p>
                    
                    {session.messages.length > 0 ? (
                      <div className="mt-2">
                         <p className="text-[9px] font-bold text-amber-600 uppercase mb-1">Tin nhắn mới nhất:</p>
                         <p className="text-xs font-medium text-slate-600 line-clamp-1 italic">"{session.messages[session.messages.length - 1].text}"</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Clock size={14} />
                        <span>Chưa có trao đổi</span>
                      </div>
                    )}
                  </div>
  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                      {session.status === 'CONTRACT_PROPOSED' ? (
                        <div className="bg-emerald-100 text-emerald-600 font-black uppercase text-[9px] px-3 py-1 rounded-lg border border-emerald-200 animate-pulse">
                          Hợp đồng chờ ký
                        </div>
                      ) : (
                        <div className="bg-amber-100 text-amber-600 font-black uppercase text-[10px] px-3 py-1 rounded-lg">
                          Cần phản hồi
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-black font-black uppercase text-xs tracking-tighter group-hover:translate-x-1 transition-transform">
                      Xem tin nhắn <ChevronRight size={18} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
        {renderSharedModals()}
      </motion.div>
    );
  }

  if (activeView === 'e-contract-agreement') {
    // For demo purposes, if the user is the demo farmer, show all pending contracts
    // Otherwise, filter by farmerId
    const pendingContracts = orders.filter(o => 
      (o.status === 'Đang xử lý' || o.status === 'Đang thương lượng' || o.status === 'Chờ ký kết' || o.status === 'Đã đề xuất') && 
      (user.id === 'F-DEMO' || o.items.some(i => i.farmerId === user.id || i.farmerId === 'f_current'))
    );

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-6 md:p-10 pb-48 max-w-6xl mx-auto space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ x: -2 }}
              onClick={() => setActiveView('dashboard')} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <PenTool size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter text-wrap">Thỏa thuận ký kết HĐĐT</h1>
          </div>
        </div>
        
        <div className="h-px bg-slate-100 w-full mb-10"></div>

        <div className="space-y-6">
          {pendingContracts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-dashed border-slate-200 rounded-[3rem] p-16 text-center"
            >
              <FileText size={64} className="mx-auto text-slate-200 mb-6" />
              <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Không có thỏa thuận nào chờ ký</p>
            </motion.div>
          ) : (
            pendingContracts.map((contract, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={contract.id} 
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-950/5 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                    <FileText size={28} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Hợp đồng: {contract.contractNumber}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        contract.status === 'Đang thương lượng' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        contract.status === 'Chờ ký kết' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {contract.status === 'Đang thương lượng' ? 'ĐANG THƯƠNG LƯỢNG' : 
                         contract.status === 'Chờ ký kết' ? 'CHỜ KÝ KẾT' : 'ĐÃ ĐỀ XUẤT'}
                      </span>
                    </div>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-2">Khách hàng: <span className="text-slate-600">{contract.buyerName || "Nguyễn Văn Khách"}</span> • {contract.items[0].name}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-indigo-600 font-black text-xl tracking-tight">{(contract.total || 0).toLocaleString()} VNĐ</p>
                      {contract.depositPaid ? (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase flex items-center gap-1">
                          <ShieldCheck size={12} /> Đã nhận cọc
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 uppercase flex items-center gap-1">
                          <AlertTriangle size={12} /> Chờ cọc
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedContract(contract)}
                  className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-wide shadow-xl shadow-slate-950/10 hover:bg-indigo-600 transition-all"
                >
                  Xem & Ký hợp đồng
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
        {renderSharedModals()}
      </motion.div>
    );
  }

  if (activeView === 'orders') {
    const signedOrders = orders.filter(o => 
      ['Đã ký kết', 'Đang chuẩn bị hàng', 'Chuẩn bị vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'].includes(o.status) && 
      (user.id === 'F-DEMO' || o.items.some(i => i.farmerId === user.id || i.farmerId === 'f_current'))
    );

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-6 md:p-10 pb-48 max-w-6xl mx-auto space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ x: -2 }}
              onClick={() => setActiveView('dashboard')} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-600/20">
              <ShoppingCart size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter">Đơn hàng của tôi</h1>
          </div>
        </div>
        
        <div className="h-px bg-slate-100 w-full mb-10"></div>

        <div className="space-y-6">
          {signedOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center"
            >
              <ShoppingCart size={64} className="mx-auto text-slate-200 mb-6" />
              <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Chưa có đơn hàng nào</p>
            </motion.div>
          ) : (
            signedOrders.map((order, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={order.id} 
                className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div>
                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                      {order.status}
                    </span>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mt-2">{order.id}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 mt-1">
                      <Calendar size={12} /> {order.date}
                    </p>
                  </div>
                  <div className="text-left md:text-right w-full md:w-auto">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng giá trị</p>
                    <p className="text-3xl font-black text-emerald-600 tracking-tight">{(order.total || 0).toLocaleString()} VNĐ</p>
                    <div className="flex gap-2 justify-start md:justify-end mt-2 mb-4">
                       {order.depositPaid ? (
                         <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 uppercase flex items-center gap-1">
                           <ShieldCheck size={10} /> ĐÃ NHẬN CỌC
                         </span>
                       ) : (
                         <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 uppercase flex items-center gap-1">
                           <AlertTriangle size={10} /> CHƯA CỌC
                         </span>
                       )}
                    </div>
                    <motion.button 
                      whileHover={{ x: 2 }}
                      onClick={() => setSelectedContract(order)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors md:ml-auto"
                    >
                      <FileText size={14} /> Xem hợp đồng chi tiết
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <img src={item.images.product[0]} alt={item.name} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm" />
                      <div>
                        <p className="font-bold text-slate-800 uppercase tracking-tight text-sm">{item.name}</p>
                        <p className="text-[11px] font-medium text-slate-500">Số lượng: <span className="font-bold text-slate-700">100 kg</span> • Đơn giá: <span className="font-bold text-slate-700">{(item.price || 16000).toLocaleString()} VNĐ</span></p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Timeline */}
                <div className="space-y-6 pt-8 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-8">
                    <Truck size={16} className="text-emerald-600" /> Tiến độ giao hàng
                  </h4>
                  
                  <div className="relative pl-10 space-y-12">
                    {/* Vertical line with gradient */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        className="w-full bg-emerald-500 origin-top"
                      />
                    </div>
                    
                    {order.deliveryTimeline?.map((step, idx) => (
                      <div key={idx} className="relative group">
                        <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                          step.completed ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-slate-100 text-slate-200'
                        }`}>
                          {step.completed ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 bg-slate-100 rounded-full" />}
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                          <div className="space-y-1">
                            <p className={`font-bold uppercase text-sm tracking-tight ${step.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                              {step.label}
                            </p>
                            {step.timestamp && (
                              <p className="text-[10px] font-medium text-slate-400 uppercase">{step.timestamp}</p>
                            )}
                            
                            {step.completed && (step.photos || step.details) && (
                              <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 max-w-lg">
                                {step.details && (
                                  <p className="text-xs font-medium text-slate-500 italic">"{step.details}"</p>
                                )}
                                {step.photos && step.photos.length > 0 && (
                                  <div className="flex gap-2">
                                    {step.photos.map((p, i) => (
                                      <img key={i} src={p} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm" />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {!step.completed && (idx === 0 || order.deliveryTimeline?.[idx-1].completed) && (
                            <motion.div 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100 flex flex-col items-end gap-4"
                            >
                              {(step.status === 'preparing' || step.status === 'shipping' || step.status === 'delivered') && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Camera size={14} className="text-emerald-600" />
                                    <span className="text-[10px] font-black text-emerald-800 uppercase">
                                      {step.status === 'preparing' ? 'Ảnh kiểm tra hàng' : 
                                       step.status === 'shipping' ? 'Ảnh chuẩn bị vận tải' : 'Ảnh bằng chứng giao hàng'}
                                    </span>
                                  </div>
                                  <div className="flex gap-2">
                                    {verificationPhotos.map((p, i) => (
                                      <motion.img 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        key={i} 
                                        src={p} 
                                        className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md font-sans" 
                                      />
                                    ))}
                                    <label className="w-12 h-12 rounded-xl bg-white border-2 border-dashed border-emerald-200 flex items-center justify-center text-emerald-300 hover:border-emerald-500 hover:text-emerald-500 transition-all cursor-pointer">
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            setIsUploading(true);
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                              setVerificationPhotos(prev => [...prev, reader.result as string]);
                                              setIsUploading(false);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                      />
                                      {isUploading ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <Plus size={18} />}
                                    </label>
                                  </div>
                                </div>
                              )}
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const details = step.status === 'preparing' ? 'Đã kiểm tra chất lượng và đóng gói' : 
                                                 step.status === 'shipping' ? 'Hàng đã được bốc xếp lên xe vận chuyển' :
                                                 'Đã giao hàng thành công và ký nhận';
                                  updateDeliveryStatus(order.id, idx, verificationPhotos.length > 0 ? verificationPhotos : undefined, details);
                                  setVerificationPhotos([]);
                                }}
                                disabled={verificationPhotos.length === 0}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-lg ${
                                  verificationPhotos.length === 0 
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                                }`}
                              >
                                {step.status === 'preparing' ? 'Xác nhận & Gửi ảnh' : 'Xác nhận hoàn tất'}
                              </motion.button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Transaction Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-10 mt-6 border-t border-slate-100">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const product = order.items[0];
                        if (onStartNegotiation) {
                          onStartNegotiation(product);
                        }
                      }}
                      className="px-8 py-3 rounded-2xl bg-amber-50 text-amber-600 font-bold text-xs uppercase tracking-widest hover:bg-amber-100 transition-all border border-amber-100 flex items-center gap-2"
                    >
                      <MessageSquare size={16} /> Nhắn tin cho khách
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setReportingViolation({
                          orderId: order.id,
                          type: 'TRANSACTION_VIOLATION'
                        });
                        setViolationDesc('');
                        setViolationEvidences([]);
                      }}
                      className="px-8 py-3 rounded-2xl bg-red-50 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100 flex items-center gap-2"
                    >
                      <AlertTriangle size={16} /> Báo cáo vi phạm
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const confirmFinish = window.confirm('Xác nhận kết thúc giao dịch này?');
                        if (confirmFinish) {
                          const updatedOrders = orders.map(o => 
                            o.id === order.id ? { ...o, status: 'Hoàn tất' } : o
                          );
                          setOrders(updatedOrders);
                        }
                      }}
                      className="px-10 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Kết thúc giao dịch
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
        {renderSharedModals()}
      </motion.div>
    );
  }

  if (activeView === 'ai') {
    return (
      <>
        <AIDiagnosis onBack={() => setActiveView('dashboard')} />
        {renderSharedModals()}
      </>
    );
  }

  if (activeView === 'timeline' && selectedProduct) {
    return (
      <>
        <FarmProductDetail product={selectedProduct} onBack={() => setActiveView('records')} />
        {renderSharedModals()}
      </>
    );
  }

  if (activeView === 'records') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-6 md:p-10 pb-48 max-w-6xl mx-auto space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-4">
          <div className="flex items-center gap-4">
            <motion.button 
              whileHover={{ x: -2 }}
              onClick={() => setActiveView('dashboard')} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </motion.button>
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-600/20">
              <ClipboardCheck size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 uppercase tracking-tighter">Hồ sơ của tôi</h1>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewPortal}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <Plus size={20} /> Đăng ký mới
          </motion.button>
        </div>
        
        <div className="h-px bg-slate-100 w-full mb-10"></div>

        <div className="space-y-6">
          {products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center"
            >
              <FileText size={64} className="mx-auto text-slate-200 mb-6" />
              <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Hiện chưa có hồ sơ nào</p>
              <button onClick={onViewPortal} className="mt-6 text-emerald-600 font-bold underline hover:text-emerald-800 uppercase tracking-wide decoration-2 underline-offset-4">Bắt đầu đăng ký ngay</button>
            </motion.div>
          ) : (
            products.map((product, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={product.id} 
                className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6"
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-50">
                    <img src={product.images.product[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{product.name}</h3>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        product.status === ProductStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        product.status === ProductStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-100' : 
                        product.status === ProductStatus.REVIEWING ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        product.status === ProductStatus.PENDING ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {product.status === ProductStatus.NEW ? 'MỚI ĐĂNG KÝ' :
                         product.status === ProductStatus.PENDING ? 'CHỜ XÉT DUYỆT' : 
                         product.status === ProductStatus.REVIEWING ? 'ĐANG DUYỆT' : 
                         product.status === ProductStatus.COMPLETED ? 'XÉT DUYỆT XONG' :
                         product.status === ProductStatus.REJECTED ? 'TỪ CHỐI' : product.status}
                      </div>
                    </div>
                    {product.status === ProductStatus.REJECTED && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onReportViolation({
                            type: 'REGISTRATION',
                            title: `Khiếu nại hồ sơ ${product.name}`,
                            description: `Tôi muốn khiếu nại về việc hồ sơ ${product.name} bị từ chối xét duyệt.`,
                            fromUserId: user.id,
                            fromUserName: user.representative,
                            targetId: product.id,
                            targetName: product.name,
                            evidence: []
                          });
                        }}
                        className="mt-1 text-[10px] font-black text-red-600 underline uppercase tracking-widest hover:text-red-800 transition-colors"
                      >
                        Khiếu nại xét duyệt
                      </button>
                    )}
                    <p className="text-slate-500 font-medium flex items-center gap-2 uppercase text-[11px] tracking-widest mt-1">
                      <MapPin size={14} className="text-emerald-500" /> {product.location.address} • <span className="font-bold text-slate-700">{product.area} HA</span>
                    </p>
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedProduct(product);
                    setActiveView('timeline');
                  }}
                  className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg shadow-slate-950/10"
                >
                  XEM CHI TIẾT <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFEFE] font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate && onNavigate('home')} 
            className="flex items-center gap-2"
          >
            <Logo size="sm" />
            <span className="text-xl font-black text-slate-800 tracking-tighter hidden sm:block">AgriMap</span>
          </motion.button>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`relative p-2.5 transition-all rounded-xl ${isNotifOpen ? 'bg-emerald-50 text-emerald-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              <Bell size={22} />
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-lg shadow-red-500/40 z-10"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {isNotifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-emerald-950/10 z-[2000] overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-black uppercase tracking-tighter text-lg text-slate-800">Thông báo</h3>
                    <div className="flex gap-2">
                      <button onClick={markAllAsRead} className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 tracking-widest transition-colors">Đánh dấu đã đọc</button>
                    </div>
                  </div>
                  <div className="max-h-[32rem] overflow-y-auto p-4 space-y-3">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                          <Bell className="text-slate-200" size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Không có thông báo mới</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={notif.id} 
                          onClick={() => {
                            markAsRead(notif.id);
                            if (notif.relatedId) {
                              if (notif.type === 'contract_signed' || notif.type === 'payment_success' || notif.type === 'order_status') {
                                setActiveView('orders');
                              }
                            }
                            setIsNotifOpen(false);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                            notif.isRead ? 'bg-white border-slate-50 opacity-60' : 'bg-emerald-50/30 border-emerald-100/50 hover:bg-emerald-50 hover:border-emerald-200'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl ${
                              notif.type === 'contract_signed' ? 'bg-indigo-100 text-indigo-600' :
                              notif.type === 'payment_success' ? 'bg-emerald-100 text-emerald-600' :
                              notif.type === 'order_status' ? 'bg-blue-100 text-blue-600' :
                              'bg-amber-100 text-amber-600'
                            }`}>
                              {notif.type === 'contract_signed' ? <FileSignature size={18} /> :
                               notif.type === 'payment_success' ? <CreditCard size={18} /> :
                               notif.type === 'delivery_update' ? <Truck size={18} /> :
                               <ShoppingCart size={18} />}
                            </div>
                            <div className="flex-1 space-y-1">
                              <h4 className="font-bold text-sm text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">{notif.title}</h4>
                              <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2">{notif.message}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2 flex items-center gap-1.5">
                                <Clock size={10} /> {notif.timestamp}
                              </p>
                            </div>
                            {!notif.isRead && (
                               <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                  <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                     <button 
                       onClick={() => setIsNotifOpen(false)} 
                       className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs hover:bg-slate-50 hover:border-slate-300 transition-all"
                     >
                       Đóng
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-black text-xs">
              {user.representative?.[0] || 'A'}
            </div>
            <span className="text-sm font-semibold text-slate-700">{user.representative || farmerName}</span>
          </div>
          <button 
            onClick={() => setIsLogoutDialogOpen(true)}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group"
            title="Đăng xuất"
          >
            <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Real-time Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed top-24 right-6 z-[3000] w-96"
          >
            <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-2xl shadow-emerald-950/20 flex gap-4 items-start relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500 shrink-0"></div>
              <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl shrink-0">
                {activeToast.type === 'payment_success' ? <CreditCard size={24} /> : 
                 activeToast.type === 'contract_signed' ? <FileSignature size={24} /> : <Bell size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-emerald-600">Thông báo mới</p>
                  <button onClick={() => setActiveToast(null)} className="text-slate-300 hover:text-slate-500 transition-colors">
                    <X size={16} />
                  </button>
                </div>
                <h4 className="font-bold text-base text-slate-800 tracking-tight mb-1">{activeToast.title}</h4>
                <p className="font-medium text-xs text-slate-500 leading-tight mb-3">{activeToast.message}</p>
                <button 
                  onClick={() => {
                    setActiveView('orders');
                    setActiveToast(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-all"
                >
                  Xem chi tiết <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="p-6 md:p-10 pb-48 max-w-7xl mx-auto space-y-10">
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[2.5rem] overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-green-500"></div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full overflow-hidden opacity-10">
            <Logo size="lg" className="w-full h-auto translate-x-1/3 -translate-y-1/4 rotate-12" />
          </div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute right-1/4 top-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <motion.div 
                  animate={{ rotate: [0, 20, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  className="text-4xl"
                >
                  👋
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                  Chào buổi sáng, {farmerName.split(' ').pop()}!
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-emerald-50/80">
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Calendar size={16} />
                  {currentDate}
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                  <Sun size={16} />
                  {weatherInfo}
                </div>
              </div>
            </div>
            
            <div className="md:text-right flex items-center md:block gap-6">
              <div className="bg-white/15 backdrop-blur-sm px-8 py-5 rounded-[2rem] border border-white/20 shadow-xl shadow-emerald-950/20">
                <p className="text-5xl font-black text-white tracking-tighter">{totalArea}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 opacity-90 mt-1">Diện tích canh tác</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (i + 1) }}
              key={i} 
              className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 28 })}
              </div>
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{stat.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Active Negotiations */}
        {activeNegotiations.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                  <MessageSquare size={18} />
                </div>
                Thương thảo đang diễn ra
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeNegotiations.map(session => (
                <div 
                  key={session.id}
                  className="bg-white border-4 border-black p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer group"
                  onClick={() => {
                    const prod = products.find(p => p.id === session.productId);
                    if (prod && onStartNegotiation) onStartNegotiation(prod, session.id);
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                        <User size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase leading-tight">{session.buyerName}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Người thu mua</p>
                      </div>
                    </div>
                    <div className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase">
                      Đang mở
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-xl border-2 border-dashed border-slate-200 mb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Sản phẩm thương lượng:</p>
                    <p className="text-xs font-black uppercase text-slate-700">{session.productName}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] font-black uppercase text-slate-500">
                    <span>{session.messages.length} tin nhắn</span>
                    <div className="flex items-center gap-1 text-amber-600">
                      Tiếp tục chat <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Functions Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                <LayoutDashboard size={18} />
              </div>
              Trung tâm điều hành
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
            {menuItems.map((item, i) => (
              <motion.button 
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.95 }}
                key={item.id}
                onClick={item.onClick}
                className="relative flex flex-col items-center gap-5 p-6 md:p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 md:w-20 md:h-20 ${item.color} text-white ${item.id === 'records' ? 'rounded-full' : 'rounded-[2rem]'} flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500`}>
                  {React.cloneElement(item.icon as React.ReactElement<any>, { size: 32 })}
                </div>
                
                <span className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-tight text-center leading-tight group-hover:text-emerald-700 transition-colors">
                  {item.label}
                </span>

                <AnimatePresence>
                  {item.badge && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md animate-bounce"
                    >
                      {item.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
            
            {/* Registration Button */}
            <motion.button 
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewPortal}
              className="flex flex-col items-center gap-5 p-6 md:p-8 bg-emerald-50/50 rounded-[2.5rem] border border-emerald-100 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-300 group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                <Plus size={36} />
              </div>
              <span className="text-xs md:text-sm font-bold text-emerald-700 uppercase tracking-tight text-center leading-tight">
                Đăng ký vùng trồng
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Big Data Market Intelligence */}
        {bigData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-slate-900 rounded-[3.5rem] p-8 md:p-12 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
             <div className="relative z-10 flex flex-col lg:flex-row gap-12">
               <div className="lg:w-1/3 space-y-6">
                 <div>
                   <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                     Market Intelligence Hub
                   </span>
                   <h3 className="text-3xl font-black text-white uppercase mt-4 tracking-tighter">
                     Phân tích <br className="hidden md:block"/> Dữ liệu lớn
                   </h3>
                 </div>
                 <p className="text-slate-400 text-sm leading-relaxed font-bold italic">
                   "Dựa trên 100,000+ lượt tìm kiếm từ khách hàng và dữ liệu mùa vụ từ 10,000+ vùng trồng trên Agrimap."
                 </p>
                 <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                     <Zap size={24} />
                   </div>
                   <div>
                     <p className="text-white font-black text-sm uppercase">AI Recommendation</p>
                     <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Thời gian thực</p>
                   </div>
                 </div>
               </div>

               <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Demand Hotspot */}
                 <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
                         <TrendingUp size={24} />
                      </div>
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest animate-pulse">Hot Trend</span>
                    </div>
                    <h4 className="text-xl font-black text-white uppercase group-hover:text-emerald-400 transition-colors">
                      {bigData.demandTrends[0]?.keyword || 'Nông sản sạch'}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Sản phẩm đang được quan tâm nhất</p>
                    <div className="mt-8 flex items-end justify-between">
                       <div>
                         <p className="text-3xl font-black text-white">{bigData.demandTrends[0]?.searchCount.toLocaleString()}</p>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Lượt tìm kiếm/tháng</p>
                       </div>
                       <div className="text-right">
                         <p className="text-emerald-400 font-black text-xl">+{bigData.demandTrends[0]?.growthRate}%</p>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tăng trưởng</p>
                       </div>
                    </div>
                 </div>

                 {/* Market Imbalance Warning */}
                 <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl">
                         <AlertTriangle size={24} />
                      </div>
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Dự báo rủi ro</span>
                    </div>
                    <h4 className="text-xl font-black text-white uppercase group-hover:text-amber-400 transition-colors">
                      Dự báo Thừa Cung
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Cần điều chỉnh kế hoạch thu hoạch</p>
                    <div className="mt-8">
                       <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic">
                         "Vùng Đồng Tháp có xu hướng dư thừa Xoài trong 2 tuần tới. AI gợi ý bạn nên thu hoạch sớm hoặc chuyển đổi sang sấy khô."
                       </p>
                    </div>
                 </div>
               </div>
             </div>
          </motion.div>
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden sticky bottom-0 z-[100] bg-white/90 backdrop-blur-lg border-t border-slate-100 flex items-center justify-around p-3 pb-8">
        {[
          { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Trang chủ' },
          { id: 'contact', icon: <MessageSquare size={24} />, label: 'Liên lạc' },
          { id: 'map', icon: <MapIconLucide size={24} />, label: 'Bản đồ', center: true },
          { id: 'learning', icon: <NotebookPen size={24} />, label: 'Sổ tay' },
          { id: 'profile', icon: <User size={24} />, label: 'Cá nhân' },
        ].map((nav) => (
          <button 
            key={nav.id}
            onClick={() => {
              if (nav.id === 'records') setActiveView('records');
              else if (nav.id === 'dashboard') setActiveView('dashboard');
              else if (nav.id === 'contact') setActiveView('contact');
              else if (nav.id === 'map') onNavigate?.('map');
            }}
            className={`flex flex-col items-center gap-1 ${nav.center ? '-translate-y-6' : ''}`}
          >
            <div className={`${nav.center ? 'w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg border-4 border-white flex items-center justify-center' : 'text-slate-400'}`}>
              {nav.icon}
            </div>
            {!nav.center && <span className="text-[10px] font-bold text-slate-400 uppercase">{nav.label}</span>}
          </button>
        ))}
      </div>
      {renderSharedModals()}
    </div>
  );
};

export default FarmerDashboard;
