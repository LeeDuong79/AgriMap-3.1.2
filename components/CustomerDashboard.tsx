
import React, { useState, useEffect } from 'react';
import { 
  Search, ShoppingCart, FileText, QrCode, Gavel, Truck, CheckCircle2,
  TrendingUp, Network, BarChart3, Bell, LogOut,
  ChevronRight, ArrowUpRight, ArrowDownRight, MapPin,
  Filter, Calendar, Package, Users, LayoutGrid, PenTool, X, Edit3, FileSignature, AlertTriangle, Trash2,
  CreditCard, Wallet, Banknote, ShieldCheck, History, Camera, User as UserIcon, Phone, Building2, Save, Mail,
  Brain, Plus, ArrowLeft, ArrowRight, Zap, MessageSquare, Store
} from 'lucide-react';
import { FarmProduct, ProductStatus, BuyerUser, Order, AppNotification, User, MarketProduct, NegotiationSession } from '../types';
import { APP_LOGO, MOCK_MARKET_PRODUCTS } from '../constants';
import { Logo } from './Logo';
import MapInterface from './MapInterface';
import MarketAI from './MarketAI';
import { motion, AnimatePresence } from 'motion/react';

import { MarketAiService } from '../services/marketAiService';
import { BigDataAnalytics } from '../types';

interface CustomerDashboardProps {
  user: BuyerUser;
  products: FarmProduct[];
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  cart: FarmProduct[];
  setCart: React.Dispatch<React.SetStateAction<FarmProduct[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  onReportViolation: (report: any) => void;
  onStartNegotiation: (product: FarmProduct, sessionId?: string) => void;
  negotiationSessions: NegotiationSession[];
  activeSessionId?: string | null;
  setActiveSessionId?: (id: string | null) => void;
  onSendMessage?: (text: string) => void;
  onProposeContract?: () => void;
  onDeleteNegotiation?: (sessionId: string) => void;
  activeTabProp?: 'dashboard' | 'find-supply' | 'orders' | 'traceability' | 'contact' | 'e-contract-agreement' | 'contracts' | 'deposits' | 'profile' | 'market_forecast';
  onTabChange?: (tab: any) => void;
  proposedOrderId?: string | null;
  onClearProposedOrder?: () => void;
  onConfirmProposedOrder?: (order: Order) => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ 
  user, 
  products, 
  onLogout,
  onUpdateUser,
  cart,
  setCart,
  orders,
  setOrders,
  onReportViolation,
  onStartNegotiation,
  negotiationSessions,
  activeSessionId,
  setActiveSessionId,
  onSendMessage,
  onProposeContract,
  onDeleteNegotiation,
  activeTabProp,
  onTabChange,
  proposedOrderId,
  onClearProposedOrder,
  onConfirmProposedOrder
}) => {
  const [activeTab, setActiveTabInternal] = useState<'dashboard' | 'find-supply' | 'orders' | 'traceability' | 'contact' | 'e-contract-agreement' | 'contracts' | 'deposits' | 'profile' | 'market_forecast'>(activeTabProp || 'dashboard');

  const setActiveTab = (tab: any) => {
    setActiveTabInternal(tab);
    if (onTabChange) onTabChange(tab);
  };

  useEffect(() => {
    if (activeTabProp && activeTabProp !== activeTab) {
      setActiveTabInternal(activeTabProp);
    }
  }, [activeTabProp]);

  const [bigData, setBigData] = useState<BigDataAnalytics | null>(null);

  useEffect(() => {
    MarketAiService.getBigDataAnalytics().then(setBigData);
  }, []);

  const [selectedProductForContract, setSelectedProductForContract] = useState<FarmProduct | null>(null);
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [viewingContract, setViewingContract] = useState<Order | null>(null);
  const [contractEditData, setContractEditData] = useState({
    quantity: 0,
    unitPrice: 0,
    deliveryAddress: '',
    deliveryDate: ''
  });
  
  const getContractValues = () => {
    const product = selectedProductForContract || (viewingContract ? viewingContract.items[0] : null);
    
    // In Agreement tab or Edit modal, contractEditData should be the primary source of truth if it has values
    const inEditContext = isEditingContract || activeTab === 'e-contract-agreement';
    
    const effectiveQuantity = inEditContext && contractEditData.quantity > 0 
      ? contractEditData.quantity 
      : (viewingContract?.quantity || product?.expectedYield || 100);
      
    const effectivePrice = inEditContext && contractEditData.unitPrice > 0 
      ? contractEditData.unitPrice 
      : (viewingContract?.items[0]?.price || product?.price || 16000);
      
    const itemTotal = effectivePrice * effectiveQuantity;
    const effectiveTotal = itemTotal + 25000; // Adding shipping fee
    
    const effectiveAddress = (inEditContext && contractEditData.deliveryAddress) 
      ? contractEditData.deliveryAddress 
      : (viewingContract?.buyerAddress || user.address);
      
    const effectiveDeliveryDateStr = (inEditContext && contractEditData.deliveryDate)
      ? contractEditData.deliveryDate
      : (viewingContract?.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      
    const effectiveDeliveryDate = new Date(effectiveDeliveryDateStr).toLocaleDateString('vi-VN');
    
    return { 
      quantity: effectiveQuantity, 
      price: effectivePrice, 
      itemTotal: itemTotal,
      total: effectiveTotal,
      address: effectiveAddress,
      deliveryDateStr: effectiveDeliveryDateStr,
      deliveryDate: effectiveDeliveryDate,
      productName: product?.name || 'Sản phẩm'
    };
  };

  const currentValues = getContractValues();

  useEffect(() => {
    if (proposedOrderId) {
      const order = orders.find(o => o.id === proposedOrderId);
      if (order) {
        // Removed automatic tab switch to keep user in current context (e.g. chat)
        setViewingContract(order);
        if (onClearProposedOrder) onClearProposedOrder();
      }
    }
  }, [proposedOrderId, orders, onClearProposedOrder]);

  // Initialize contract edit data when relevant state changes
  useEffect(() => {
    if (activeTab === 'e-contract-agreement' || isEditingContract) {
      const product = selectedProductForContract || (viewingContract ? viewingContract.items[0] : null);
      if (product) {
        // Always sync if we aren't in the middle of editing (avoiding overwriting live typing)
        // or if explicitly starting an edit session
        setContractEditData(prev => {
          const needsSync = prev.quantity === 0 || (!isEditingContract && activeTab === 'e-contract-agreement' && (prev.quantity !== (viewingContract?.quantity || product.expectedYield)));
          
          if (needsSync) {
            return {
              quantity: viewingContract?.quantity || product.expectedYield || 100,
              unitPrice: viewingContract?.items[0]?.price || product.price || 16000,
              deliveryAddress: viewingContract?.buyerAddress || user.address,
              deliveryDate: viewingContract?.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
          }
          return prev;
        });
      }
    } else {
      // Reset if not in any contract context
      setContractEditData({
        quantity: 0,
        unitPrice: 0,
        deliveryAddress: '',
        deliveryDate: ''
      });
    }
  }, [activeTab, isEditingContract, viewingContract, selectedProductForContract, user.address]);

  const [isSignSuccess, setIsSignSuccess] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialMapCartView, setInitialMapCartView] = useState<'cart' | 'orders' | null>(null);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  
  // Deposit Payment States
  const [isPayingDeposit, setIsPayingDeposit] = useState(false);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success'>('method');

  // Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    fullName: user.fullName,
    companyName: user.companyName,
    phone: user.phone,
    email: user.email,
    address: user.address,
    avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`
  });

  const handleSaveProfile = () => {
    onUpdateUser({
      ...user,
      fullName: profileFormData.fullName,
      companyName: profileFormData.companyName,
      phone: profileFormData.phone,
      email: profileFormData.email,
      address: profileFormData.address,
      avatar: profileFormData.avatar
    });
    setIsEditingProfile(false);
    setActiveToast({
      id: `profile-${Date.now()}`,
      type: 'order_status',
      title: 'Cập nhật thành công',
      message: 'Thông tin cá nhân của bạn đã được lưu lại trên hệ thống.',
      timestamp: 'Vừa xong',
      isRead: true
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, we would upload to a server. Here we'll use a local URL simulation
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Notification States
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n1',
      type: 'contract_signed',
      title: 'Hợp đồng mới đã ký',
      message: 'Nông dân Nguyễn Văn A đã ký hợp đồng cung cấp Xoài Cát Hòa Lộc.',
      timestamp: '10 phút trước',
      isRead: false,
      relatedId: 'ORD-2024-001'
    },
    {
      id: 'n2',
      type: 'delivery_update',
      title: 'Cập nhật tiến độ giao hàng',
      message: 'Đơn hàng #382910 đã bắt đầu được vận chuyển.',
      timestamp: '1 giờ trước',
      isRead: true,
      relatedId: 'ORD-2024-002'
    }
  ]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [highlightedAiLocation, setHighlightedAiLocation] = useState<{ lat: number, lng: number, name: string } | null>(null);
  const [reportingViolation, setReportingViolation] = useState<{orderId: string, type: string} | null>(null);
  const [violationDesc, setViolationDesc] = useState('');
  const [violationEvidences, setViolationEvidences] = useState<string[]>([]);

  const unreadCount = React.useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  // Simulation: Update delivery status and notify
  useEffect(() => {
    if (orders.length === 0) return;

    const timer = setInterval(() => {
      // Find an order that can be updated for simulation
      const orderToUpdate = orders.find(o => 
        (o.status === 'Đã ký kết' || o.status === 'Chuẩn bị vận chuyển') && o.deliveryTimeline
      );

      if (orderToUpdate) {
        let nextStatus = '';
        let message = '';
        let stepStatusToComplete = '';

        if (orderToUpdate.status === 'Đã ký kết') {
          nextStatus = 'Chuẩn bị vận chuyển';
          message = `Đơn hàng ${orderToUpdate.id} đã chuyển sang trạng thái chuẩn bị vận chuyển.`;
          stepStatusToComplete = 'preparing';
        } else if (orderToUpdate.status === 'Chuẩn bị vận chuyển') {
          nextStatus = 'Đã giao hàng';
          message = `Đơn hàng ${orderToUpdate.id} đã được giao thành công.`;
          stepStatusToComplete = 'shipping';
        }

        if (nextStatus) {
          const now = new Date().toLocaleString('vi-VN');
          
          // Update order state including timeline
          setOrders(prev => prev.map(o => {
            if (o.id === orderToUpdate.id) {
              const updatedTimeline = o.deliveryTimeline?.map(step => {
                if (step.status === stepStatusToComplete) {
                  return { ...step, completed: true, timestamp: now };
                }
                // If moving to delivered, also complete that step
                if (nextStatus === 'Đã giao hàng' && step.status === 'delivered') {
                  return { ...step, completed: true, timestamp: now };
                }
                return step;
              });
              return { ...o, status: nextStatus, deliveryTimeline: updatedTimeline };
            }
            return o;
          }));
          
          // Add notification
          const newNotif: AppNotification = {
            id: `notif-${Date.now()}`,
            type: 'delivery_update',
            title: 'Cập nhật tiến độ',
            message: message,
            timestamp: 'Vừa xong',
            isRead: false,
            relatedId: orderToUpdate.id
          };
          setNotifications(prev => [newNotif, ...prev]);
          setActiveToast(newNotif);
        }
      }
    }, 45000); // Check every 45s for faster demo

    return () => clearInterval(timer);
  }, [orders, setOrders]);

  // Toast Auto-dismiss
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Reset violation report state when modal closes
  useEffect(() => {
    if (!reportingViolation) {
      setViolationDesc('');
      setViolationEvidences([]);
    }
  }, [reportingViolation]);

  const renderProfile = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto py-12 px-4 space-y-12"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Hồ sơ khách hàng</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab('dashboard')}
          className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-500 shadow-sm hover:text-emerald-600 hover:border-emerald-200 transition-all"
        >
          Quay lại
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Avatar Section */}
        <div className="lg:col-span-1 space-y-6 text-center">
          <div className="relative inline-block group">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="w-56 h-56 rounded-[3.5rem] border-8 border-white overflow-hidden shadow-2xl shadow-slate-200 bg-slate-50 relative"
            >
              <img 
                src={profileFormData.avatar} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <AnimatePresence>
                {isEditingProfile && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm"
                  >
                     <p className="text-white font-black text-[10px] uppercase tracking-widest">Đổi ảnh</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {isEditingProfile && (
              <motion.label 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-4 right-4 bg-emerald-600 text-white p-4 rounded-[1.5rem] shadow-xl shadow-emerald-600/30 cursor-pointer border-4 border-white z-10"
              >
                <Camera size={24} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </motion.label>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{user.fullName}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{user.companyName}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-16 -mt-16 opacity-30"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                  <UserIcon size={12} className="text-emerald-600" /> Tên hiển thị
                </label>
                <input 
                  type="text"
                  disabled={!isEditingProfile}
                  value={profileFormData.fullName}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                  <Building2 size={12} className="text-emerald-600" /> Đơn vị thu mua
                </label>
                <input 
                  type="text"
                  disabled={!isEditingProfile}
                  value={profileFormData.companyName}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                  <Phone size={12} className="text-emerald-600" /> Số điện thoại
                </label>
                <input 
                  type="text"
                  disabled={!isEditingProfile}
                  value={profileFormData.phone}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                  <Mail size={12} className="text-emerald-600" /> Địa chỉ Email
                </label>
                <input 
                  type="email"
                  disabled={!isEditingProfile}
                  value={profileFormData.email}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                  <MapPin size={12} className="text-emerald-600" /> Địa chỉ đăng ký
                </label>
                <input 
                  type="text"
                  disabled={!isEditingProfile}
                  value={profileFormData.address}
                  onChange={(e) => setProfileFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full bg-slate-50/50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 flex justify-end gap-4 relative z-10">
              {!isEditingProfile ? (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-3 bg-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/10 transition-all"
                >
                  <Edit3 size={18} /> Chỉnh sửa
                </motion.button>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setIsEditingProfile(false);
                      setProfileFormData({
                        fullName: user.fullName,
                        companyName: user.companyName,
                        phone: user.phone,
                        email: user.email,
                        address: user.address,
                        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`
                      });
                    }}
                    className="flex items-center gap-3 bg-white border border-slate-200 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Hủy
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    className="flex items-center gap-3 bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/30 transition-all"
                  >
                    <Save size={18} /> Lưu thay đổi
                  </motion.button>
                </>
              )}
            </div>
          </div>

          <div className="bg-red-50/50 border border-red-100 p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-black text-red-800 uppercase text-xs tracking-widest">Khu vực nguy hiểm</h4>
              <p className="text-[10px] font-bold text-red-600 opacity-70 italic">Thoát khỏi phiên làm việc hiện tại trên thiết bị.</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLogoutDialogOpen(true)}
              className="flex items-center gap-2 bg-white text-red-600 border border-red-200 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-sm hover:bg-red-600 hover:text-white transition-all shadow-red-200/50"
            >
              <LogOut size={16} /> Đăng xuất
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
    setIsNotificationOpen(false);
  };

  // Handle payment processing simulation
  useEffect(() => {
    if (paymentStep === 'processing') {
      const timer = setTimeout(() => {
        setPaymentStep('success');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentStep]);

  const renderSharedModals = () => (
    <>
      {/* Report Violation Modal */}
      <AnimatePresence>
        {reportingViolation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[2000] flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-900/20 w-full max-w-xl p-8 md:p-12 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="bg-red-50 text-red-600 p-3 rounded-2xl ring-8 ring-red-50">
                    <AlertTriangle size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-800 leading-none">Báo cáo vi phạm</h3>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-[9px] mt-2">Mã đơn hàng: {reportingViolation.orderId}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setReportingViolation(null)}
                  className="p-2.5 hover:bg-slate-50 rounded-full transition-all text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-5 rounded-2xl bg-red-50 text-red-800 border-l-4 border-red-500">
                  <p className="text-[11px] font-bold leading-relaxed italic opacity-80">
                    "Mọi thông tin báo cáo sẽ được AgriMap ghi nhận và xác minh. Vui lòng cung cấp thông tin trung thực để đảm bảo môi trường nông nghiệp số lành mạnh."
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mô tả vi phạm</label>
                  <textarea 
                    value={violationDesc}
                    onChange={(e) => setViolationDesc(e.target.value)}
                    placeholder="Mô tả chi tiết hành vi vi phạm..."
                    className="w-full h-40 bg-slate-50 border border-slate-100 p-6 rounded-[2rem] font-bold focus:bg-white focus:border-red-500/30 focus:ring-8 focus:ring-red-500/10 transition-all outline-none resize-none placeholder:text-slate-300 text-slate-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bằng chứng hình ảnh ({violationEvidences.length})</label>
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {violationEvidences.map((img, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="relative group"
                        >
                          <img src={img} className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg ring-1 ring-slate-100" />
                          <button 
                            onClick={() => setViolationEvidences(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-white shadow-lg shadow-red-500/20"
                          >
                            <X size={10} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <label className="w-20 h-20 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-red-500 hover:text-red-500 hover:bg-white transition-all cursor-pointer group">
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
                      <Plus size={24} />
                      <span className="text-[8px] font-black uppercase mt-1">Thêm</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setReportingViolation(null)}
                  className="flex-1 bg-slate-50 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-slate-600 transition-all"
                >
                  Hủy bỏ
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!violationDesc.trim()}
                  onClick={() => {
                    onReportViolation({
                      type: reportingViolation.type,
                      title: `Tố cáo vi phạm đơn hàng ${reportingViolation.orderId}`,
                      description: violationDesc,
                      fromUserId: user.id,
                      fromUserName: user.fullName,
                      targetId: reportingViolation.orderId,
                      targetName: `Đơn hàng ${reportingViolation.orderId}`,
                      evidence: violationEvidences
                    });
                    setReportingViolation(null);
                  }}
                  className={`flex-[2] py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl transition-all ${
                    violationDesc.trim() 
                    ? 'bg-red-600 text-white shadow-red-600/30 hover:bg-red-700' 
                    : 'bg-slate-100 text-slate-300 shadow-none cursor-not-allowed'
                  }`}
                >
                  Gửi báo cáo
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign Success Notification */}
      {isSignSuccess && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-xl" onClick={() => setIsSignSuccess(false)}></div>
          <div className="bg-white p-10 rounded-[3rem] border-8 border-black shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] relative z-10 max-w-md text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-200">
              <CheckCircle2 size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black uppercase tracking-tighter">Đã gửi hợp đồng!</h3>
              <p className="font-bold text-slate-500">AgriMap đã gửi bản thảo đã ký của bạn đến Nông dân. Bạn sẽ nhận được thông báo khi họ ký xác nhận.</p>
            </div>
            <button 
              onClick={() => setIsSignSuccess(false)}
              className="w-full bg-emerald-600 text-white border-4 border-black py-4 rounded-2xl font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              Tôi đã hiểu
            </button>
          </div>
        </div>
      )}

      {/* Real-time Toast Notification */}
      {activeToast && (
        <div className="fixed top-24 right-8 z-[2000] w-96 animate-in slide-in-from-right-8 fade-in-0 duration-500">
          <div className="bg-white border-4 border-black p-6 rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex gap-4 items-start relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-teal-600 shrink-0"></div>
            <div className="bg-teal-100 text-teal-600 p-3 rounded-xl shrink-0">
              {activeToast.type === 'delivery_update' ? <Truck size={24} /> : <Bell size={24} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <p className="font-black text-xs uppercase tracking-widest text-teal-700">Thông báo mới</p>
                <button onClick={() => setActiveToast(null)} className="text-slate-400 hover:text-black">
                  <X size={16} />
                </button>
              </div>
              <h4 className="font-black text-lg text-black uppercase tracking-tighter mb-1">{activeToast.title}</h4>
              <p className="font-bold text-sm text-slate-600 leading-tight">{activeToast.message}</p>
              <button 
                onClick={() => {
                  setActiveTab('orders');
                  if (activeToast.relatedId) setTrackingOrderId(activeToast.relatedId);
                  setActiveToast(null);
                }}
                className="mt-4 flex items-center gap-2 text-xs font-black uppercase text-teal-600 hover:text-teal-800 tracking-tighter transition-all"
              >
                Xem chi tiết <ChevronRight size={14} />
              </button>
            </div>
            {/* Visual Progress Timer for Dismiss */}
            <div className="absolute bottom-0 left-0 h-1 bg-slate-100 w-full">
              <div className="h-full bg-teal-600 animate-[width-shrink_8s_linear_forwards]" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Payment Modal */}
      {isPayingDeposit && payingOrder && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsPayingDeposit(false)}></div>
          <div className="bg-white w-full max-w-xl rounded-[3rem] border-[12px] border-black shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] relative z-10 overflow-hidden">
            {paymentStep === 'method' && (
              <div className="p-12 space-y-8 animate-in fade-in duration-200">
                <div className="flex justify-between items-center">
                   <h3 className="text-4xl font-black tracking-tighter uppercase">Thanh toán cọc</h3>
                   <button onClick={() => setIsPayingDeposit(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all">
                     <X size={24} />
                   </button>
                </div>
                
                <div className="bg-indigo-50 p-8 rounded-[2rem] border-4 border-indigo-100 flex items-center justify-between relative overflow-hidden group">
                   <div className="relative z-10">
                     <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">Số tiền ký quỹ (30%)</p>
                     <p className="text-5xl font-black text-black tabular-nums">{(payingOrder.depositAmount || Math.floor(payingOrder.total * 0.3)).toLocaleString()}đ</p>
                   </div>
                   <ShieldCheck size={64} className="text-indigo-600 opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="space-y-4">
                   <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Chọn phương thức</p>
                   
                   <button 
                     onClick={() => setPaymentStep('processing')}
                     className="w-full flex items-center justify-between p-8 bg-white border-[6px] border-black rounded-[2rem] hover:bg-indigo-50 transition-all group shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                   >
                     <div className="flex items-center gap-6">
                        <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600 transition-transform group-hover:scale-110">
                          <CreditCard size={32} />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-2xl">Ví AgriMap Pay</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Khuyên dùng • Miễn phí giao dịch</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className="text-sm font-black text-emerald-600 block mb-1">Sẵn có 8.5 tr</span>
                        <ChevronRight size={24} className="text-slate-300 ml-auto" />
                     </div>
                   </button>

                   <button 
                     onClick={() => setPaymentStep('processing')}
                     className="w-full flex items-center justify-between p-8 bg-slate-50 border-4 border-slate-200 rounded-[2rem] hover:border-black transition-all group"
                   >
                     <div className="flex items-center gap-6">
                        <div className="bg-white p-4 rounded-2xl border-2 border-slate-100">
                          <Banknote size={32} className="text-emerald-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-black text-2xl text-slate-700">Chuyển khoản Ngân hàng</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Xác nhận trong 15-30 phút</p>
                        </div>
                     </div>
                     <ChevronRight size={24} className="text-slate-300" />
                   </button>
                </div>

                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                  Tiền cọc sẽ được AgriMap giữ an toàn (Escrow) cho đến khi đơn hàng hoàn tất
                </p>
              </div>
            )}

            {paymentStep === 'processing' && (
              <div className="p-16 text-center space-y-8 py-24">
                <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div>
                   <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Đang xử lý giao dịch</h3>
                   <p className="text-slate-500 font-bold">Vui lòng không đóng cửa sổ này...</p>
                </div>
              </div>
            )}

            {paymentStep === 'success' && (
              <div className="p-16 text-center space-y-8 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto scale-125 border-4 border-white shadow-xl">
                   <CheckCircle2 size={48} />
                </div>
                <div>
                   <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Đặt cọc thành công!</h3>
                   <p className="text-slate-500 font-bold px-10">Mã ký quỹ của bạn đã được hệ thống AgriMap ghi nhận và bảo vệ.</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 font-mono text-sm">
                   <p className="flex justify-between border-b border-slate-200 pb-2 mb-2">
                     <span className="opacity-50">Mã giao dịch</span>
                     <span className="font-bold">TXN-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                   </p>
                   <p className="flex justify-between">
                     <span className="opacity-50">Số tiền</span>
                     <span className="font-bold">{(payingOrder.depositAmount || Math.floor(payingOrder.total * 0.3)).toLocaleString()}đ</span>
                   </p>
                </div>
                <button 
                  onClick={() => {
                    const updatedOrders = orders.map(o => 
                      o.id === payingOrder.id ? { ...o, depositPaid: true } : o
                    );
                    setOrders(updatedOrders);
                    setIsPayingDeposit(false);
                    setPayingOrder(null);
                    if (activeTab === 'dashboard') setActiveTab('deposits');
                  }}
                  className="w-full bg-black text-white py-5 rounded-3xl font-black text-lg uppercase shadow-lg hover:scale-105 transition-all"
                >
                  Tuyệt vời
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contract Detail Modal (Global) */}
      {viewingContract && !isEditingContract && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingContract(null)}></div>
          <div className="bg-white w-full max-w-5xl max-h-full overflow-y-auto rounded-[3rem] shadow-2xl relative z-10 animate-in zoom-in-95 duration-300 border-4 border-black">
            <button 
              onClick={() => setViewingContract(null)}
              className="absolute top-6 right-6 p-3 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all z-20"
            >
              <X size={24} />
            </button>
            
            <div className="p-12 font-sans text-slate-800 leading-relaxed">
              {/* Contract Content */}
              <div className="text-center mb-10">
                <h3 className="text-xl font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                <p className="font-bold text-lg">Độc lập - Tự do - Hạnh phúc</p>
                <div className="w-40 h-1 bg-black mx-auto mt-3"></div>
              </div>
              
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">Hợp đồng mua bán nông sản</h3>
                <p className="italic text-slate-500 font-bold mt-1">(Số: {viewingContract.contractNumber})</p>
                {viewingContract.status === 'Đang soạn thảo' && (
                  <button 
                    onClick={() => {
                      setContractEditData({
                        quantity: viewingContract.quantity || 100,
                        unitPrice: viewingContract.items[0].price || 16000,
                        deliveryAddress: viewingContract.buyerAddress || user.address,
                        deliveryDate: viewingContract.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      });
                      setIsEditingContract(true);
                    }}
                    className="mt-4 inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-xl font-bold text-xs uppercase border-2 border-amber-200 hover:bg-amber-200 transition-all font-sans"
                  >
                    <Edit3 size={14} /> Chỉnh sửa thông tin
                  </button>
                )}
              </div>
              
              <div className="mb-8 space-y-2">
                <ul className="list-disc pl-6 space-y-1 font-bold text-sm text-slate-600">
                  <li>Căn cứ Bộ luật Dân sự số 91/2015/QH13;</li>
                  <li>Căn cứ Luật Thương mại số 36/2005/QH11;</li>
                  <li>Căn cứ nhu cầu và thỏa thuận của các bên.</li>
                </ul>
                <p className="mt-6 text-lg font-medium">Hợp đồng được ký kết vào ngày {viewingContract.contractDate}, giữa:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <h4 className="font-black text-xs uppercase tracking-widest text-blue-800 border-b-2 border-blue-100 pb-2 mb-4">BÊN BÁN (BÊN A):</h4>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>Đại diện:</strong> {viewingContract.items[0].farmerName}</p>
                    <p>• <strong>Địa chỉ:</strong> {viewingContract.items[0].location.address}</p>
                    <p>• <strong>Số điện thoại:</strong> {viewingContract.items[0].contact}</p>
                    <p>• <strong>MST:</strong> 0312XXXXXX</p>
                    <p>• <strong>Số tài khoản:</strong> 1903XXXXXXXXXX (Techcombank)</p>
                  </div>
                </div>
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <h4 className="font-black text-xs uppercase tracking-widest text-emerald-800 border-b-2 border-emerald-100 pb-2 mb-4">BÊN MUA (BÊN B):</h4>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>Đại diện:</strong> {user.fullName}</p>
                    <p>• <strong>Địa chỉ:</strong> {user.address}</p>
                    <p>• <strong>Số điện thoại:</strong> {user.phone}</p>
                    <p>• <strong>MST:</strong> 0102XXXXXX</p>
                    <p>• <strong>Số tài khoản:</strong> 0071XXXXXXXXXX (Vietcombank)</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <h4 className="font-black text-lg uppercase tracking-tighter border-l-8 border-black pl-4">NỘI DUNG GIAO DỊCH</h4>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b-2 border-slate-200">
                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Sản phẩm</th>
                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Số lượng</th>
                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Đơn giá</th>
                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {viewingContract.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-5 font-bold text-lg">{item.name}</td>
                          <td className="py-5 text-center font-bold">{currentValues.quantity.toLocaleString()} kg</td>
                          <td className="py-5 text-right font-bold">{currentValues.price.toLocaleString()}đ</td>
                          <td className="py-5 text-right font-black text-lg">{(currentValues.price * currentValues.quantity).toLocaleString()}đ</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200">
                        <td colSpan={3} className="pt-6 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Phí vận chuyển:</td>
                        <td className="pt-6 text-right font-bold">25.000đ</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="pt-2 text-right text-3xl font-black uppercase tracking-tighter">TỔNG CỘNG:</td>
                        <td className="pt-2 text-right text-3xl font-black text-emerald-700">{currentValues.total.toLocaleString()}đ</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="space-y-12 mt-16">
                <section>
                  <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
                    ĐIỀU 1: ĐỐI TƯỢNG HÀNG HÓA VÀ TIÊU CHUẨN
                  </h4>
                  <div className="pl-12 space-y-2 text-sm font-medium">
                    <p>1. <strong>Tên sản phẩm:</strong> {viewingContract.items[0].name}</p>
                    <p>2. <strong>Sản lượng:</strong> {currentValues.quantity.toLocaleString()} kg. Tỷ lệ sai số cho phép: +/- 5%</p>
                    <p>3. <strong>Tiêu chuẩn chất lượng:</strong> {viewingContract.items[0].certificates?.map((c: any) => c.type).join('/') || 'Đạt tiêu chuẩn xuất khẩu, không dư lượng thuốc BVTV'}.</p>
                    <p>4. <strong>Quy cách đóng gói:</strong> Đóng thùng carton/sọt nhựa theo tiêu chuẩn vận chuyển nông sản.</p>
                    <p>5. <strong>Truy xuất nguồn gốc:</strong> Sản phẩm được định danh và theo dõi nhật ký canh tác tại vùng trồng {viewingContract.items[0].location.address} trên hệ thống AgriMap.</p>
                  </div>
                </section>
                
                <section>
                  <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">2</span>
                    ĐIỀU 2: GIÁ CẢ VÀ THANH TOÁN
                  </h4>
                  <div className="pl-12 space-y-2 text-sm font-medium">
                    <p>1. <strong>Đơn giá:</strong> {currentValues.price.toLocaleString()} VNĐ/kg (Giá đã bao gồm VAT).</p>
                    <p>2. <strong>Tổng giá trị đơn hàng:</strong> {currentValues.itemTotal.toLocaleString()} VNĐ.</p>
                    <p>3. <strong>Phí vận chuyển:</strong> 25.000 VNĐ.</p>
                    <p>4. <strong>Tổng cộng (tạm tính):</strong> {currentValues.total.toLocaleString()} VNĐ.</p>
                    <p>5. <strong>Phương thức thanh toán:</strong> Chuyển khoản qua hệ thống ví AgriMap Pay.</p>
                    <p>6. <strong>Tiến độ thanh toán:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Đợt 1: Tạm ứng 30% giá trị hợp đồng ({(currentValues.total * 0.3).toLocaleString()}đ) ngay sau khi ký kết.</li>
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
                    <p>1. <strong>Thời gian giao hàng:</strong> {currentValues.deliveryDate}.</p>
                    <p>2. <strong>Địa điểm giao hàng:</strong> {currentValues.address}</p>
                    <p>3. <strong>Phương thức vận chuyển:</strong> Xe tải chuyên dụng. Chi phí vận chuyển do Bên B chịu.</p>
                    <p>4. <strong>Rủi ro:</strong> Rủi ro về hàng hóa được chuyển giao từ Bên A sang Bên B kể từ thời điểm ký biên bản giao nhận hàng hóa.</p>
                  </div>
                </section>

                <section>
                  <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">4</span>
                    ĐIỀU 4: KIỂM TRA VÀ NGHIỆM THU
                  </h4>
                  <div className="pl-12 space-y-2 text-sm font-medium">
                    <p>1. Bên B có quyền kiểm tra hàng hóa ngay tại thời điểm giao nhận.</p>
                    <p>2. <strong>Thông báo lỗi:</strong> Trong vòng 24 giờ kể từ khi nhận hàng, Bên B phải thông báo cho Bên A nếu phát hiện hàng lỗi. Quá thời hạn trên, hàng được coi là đạt chuẩn.</p>
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

                <section>
                  <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">6</span>
                    ĐIỀU 6: CAM KẾT VỀ DỮ LIỆU SỐ (AGRIMAP)
                  </h4>
                  <div className="pl-12 space-y-2 text-sm font-medium">
                    <p>1. Bên A cam kết cập nhật trung thực nhật ký canh tác lên hệ thống AgriMap.</p>
                    <p>2. Mọi sai khác giữa dữ liệu số và thực tế hàng hóa được coi là vi phạm nghĩa vụ cung cấp thông tin.</p>
                  </div>
                </section>

                <section>
                  <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">7</span>
                    ĐIỀU 7: TRƯỜNG HỢP BẤT KHẢ KHÁNG
                  </h4>
                  <div className="pl-12 text-sm font-medium">
                    <p>Thiên tai hoặc dịch bệnh làm ảnh hưởng đến sản lượng/chất lượng nông sản: Hai bên cùng thương lượng giãn tiến độ hoặc hủy đơn hàng mà không bị phạt.</p>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-2 gap-12 mt-20 text-center">
                <div className="space-y-4">
                  <p className="font-bold text-lg uppercase tracking-tighter">ĐẠI DIỆN BÊN B</p>
                  <p className="text-sm italic text-slate-500">(Ký, ghi rõ họ tên, đóng dấu)</p>
                  <div className="h-32 flex items-center justify-center">
                    <div className="border-4 border-emerald-600 text-emerald-600 p-4 rounded-2xl -rotate-12 font-bold text-sm shadow-xl bg-white/80 backdrop-blur-sm">
                      Đã ký số bởi AgriMap<br/>
                      <span className="text-lg uppercase tracking-tighter">{user.fullName}</span><br/>
                      <span className="text-[10px] opacity-70 italic font-medium">{viewingContract.contractDate}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="font-bold text-lg uppercase tracking-tighter">ĐẠI DIỆN BÊN A</p>
                  <p className="text-sm italic text-slate-500">(Ký, ghi rõ họ tên, đóng dấu)</p>
                  <div className="h-32 flex items-center justify-center">
                    {viewingContract.status === 'Đã ký kết' || ['Chuẩn bị vận chuyển', 'Đã giao hàng', 'Hoàn tất'].includes(viewingContract.status) ? (
                      <div className="border-4 border-blue-600 text-blue-600 p-4 rounded-2xl rotate-12 font-bold text-sm shadow-xl bg-white/80 backdrop-blur-sm">
                        Đã ký số bởi AgriMap<br/>
                        <span className="text-lg uppercase tracking-tighter">{viewingContract.items[0].farmerName}</span><br/>
                        <span className="text-[10px] opacity-70 italic font-medium">Xác nhận trực tuyến</span>
                      </div>
                    ) : (
                      <div className="border-4 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 flex flex-col items-center justify-center w-full h-full p-4">
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest font-sans">
                          {viewingContract.status === 'Đang thương lượng' ? 'Đang thương lượng...' : 'Chờ xác nhận ký số...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

                {viewingContract.status === 'Đang thương lượng' && viewingContract.negotiationNote && (
                  <div className="mt-10 p-8 bg-amber-50 rounded-[2rem] border-4 border-amber-200 space-y-3">
                    <h4 className="font-black text-amber-800 uppercase text-sm tracking-widest flex items-center gap-2">
                      <Gavel size={18} /> Phản hồi từ Bên Bán
                    </h4>
                    <p className="font-bold text-amber-900 italic">"{viewingContract.negotiationNote}"</p>
                    <p className="text-xs text-amber-700 font-bold uppercase tracking-tight mt-4">Vui lòng liên hệ trực tiếp hoặc điều chỉnh lại yêu cầu hợp đồng.</p>
                  </div>
                )}
            </div>
            
            <div className="p-10 border-t-4 border-black bg-slate-50 flex flex-wrap justify-center gap-4">
              {viewingContract.status === 'Đang soạn thảo' && (
                <button 
                  onClick={() => {
                    const updatedOrder = { 
                      ...viewingContract, 
                      status: 'Chờ ký kết',
                      deliveryTimeline: [
                        { status: 'draft', label: 'Soạn thảo xong', completed: true, timestamp: new Date().toLocaleString('vi-VN') },
                        { status: 'proposed', label: 'Đã gửi bản ký kết cho nhà vườn', completed: true, timestamp: new Date().toLocaleString('vi-VN') },
                        { status: 'signed', label: 'Chờ ký kết điện tử', completed: false }
                      ]
                    };
                    setOrders(prev => prev.map(o => o.id === viewingContract.id ? updatedOrder : o));
                    if (onConfirmProposedOrder) onConfirmProposedOrder(updatedOrder);
                    setIsSignSuccess(true);
                    setViewingContract(null);
                  }}
                  className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-3"
                >
                  <FileSignature size={20} /> Gửi bản ký kết điện tử
                </button>
              )}
              {viewingContract.status === 'Đã ký kết' && !viewingContract.depositPaid && (
                <button 
                  onClick={() => {
                    setPayingOrder(viewingContract);
                    setIsPayingDeposit(true);
                    setPaymentStep('method');
                  }}
                  className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-3 animate-pulse"
                >
                  <CreditCard size={20} /> Thanh toán cọc ngay
                </button>
              )}
              <button 
                onClick={() => window.print()}
                className="bg-black text-white px-12 py-4 rounded-2xl font-black uppercase shadow-lg hover:scale-105 transition-all flex items-center gap-3"
              >
                <FileText size={20} /> Tải xuống bản PDF
              </button>
            </div>
          </div>
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
              className="bg-white rounded-[3.5rem] p-10 max-w-sm w-full shadow-2xl shadow-slate-900/40 border border-slate-100 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 border border-red-100 mx-auto">
                <LogOut size={36} className="text-red-500 ml-1.5" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-3 leading-none">Đăng xuất?</h3>
              <p className="text-slate-500 font-bold mb-8 text-sm px-4">Bạn có chắc chắn muốn kết thúc phiên làm việc hiện tại không?</p>
              <div className="flex flex-col gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsLogoutDialogOpen(false);
                    onLogout();
                  }}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/30 transition-all hover:bg-red-700"
                >
                  Đăng xuất ngay
                </motion.button>
                <button 
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:text-slate-600"
                >
                  Hủy bỏ
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  const approvedProducts = products.filter(p => p.status === ProductStatus.COMPLETED);

  const stats = [
    { label: 'Nhà cung cấp', value: '128', icon: <Users className="text-blue-600" />, sub: 'Đang kết nối' },
    { label: 'Đơn hàng', value: '3', icon: <ShoppingCart className="text-green-600" />, sub: 'Trong tháng này', alert: true },
    { label: 'Tổng sản lượng', value: '85 tấn', icon: <Package className="text-orange-600" />, sub: 'Đã thu mua' },
    { label: 'Doanh thu tháng', value: '2.4 tỷ', icon: <BarChart3 className="text-purple-600" />, sub: 'VNĐ' },
  ];

  const menuItems = [
    { id: 'find-supply', label: 'Tìm nguồn cung', icon: <Search size={32} />, color: 'bg-green-600' },
    { id: 'contact', label: 'Liên lạc', icon: <MessageSquare size={32} />, color: 'bg-amber-600', badge: negotiationSessions.length > 0 ? negotiationSessions.length : undefined },
    { id: 'orders', label: 'Đơn hàng', icon: <ShoppingCart size={32} />, color: 'bg-emerald-600', badge: orders.filter(o => ['Đã ký kết', 'Chuẩn bị vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'].includes(o.status)).length > 0 ? orders.filter(o => ['Đã ký kết', 'Chuẩn bị vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'].includes(o.status)).length : undefined },
    { id: 'deposits', label: 'Giao dịch cọc', icon: <Wallet size={32} />, color: 'bg-indigo-600', badge: orders.filter(o => o.contractNumber && !o.depositPaid && o.status === 'Đã ký kết').length > 0 ? orders.filter(o => o.contractNumber && !o.depositPaid && o.status === 'Đã ký kết').length : undefined },
    { id: 'contracts', label: 'Hợp đồng điện tử', icon: <FileText size={32} />, color: 'bg-teal-600', badge: orders.filter(o => o.contractNumber && ['Đã ký kết', 'Chuẩn bị vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'].includes(o.status)).length > 0 ? orders.filter(o => o.contractNumber && ['Đã ký kết', 'Chuẩn bị vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'].includes(o.status)).length : undefined },
    { id: 'traceability', label: 'Truy xuất nguồn gốc', icon: <QrCode size={32} />, color: 'bg-sky-600' },
    { id: 'market_forecast', label: 'AI Dự báo thị trường', icon: <TrendingUp size={32} />, color: 'bg-amber-600' },
  ];

  const marketForecast = [
    { name: 'Xoài', status: 'Nhu cầu tăng do xuất khẩu', trend: '+12%', isUp: true },
    { name: 'Lúa ST25', status: 'Nguồn cung dồi dào', trend: '-3%', isUp: false },
    { name: 'Thanh long', status: 'Thị trường Trung Quốc mở cửa', trend: '+8%', isUp: true },
    { name: 'Dưa hấu', status: 'Dư thừa vụ hè', trend: '-5%', isUp: false },
  ];

  if (isEditingContract) {
    const displayProduct = selectedProductForContract || (viewingContract ? viewingContract.items[0] : null);
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsEditingContract(false)} className="flex items-center gap-2 font-black text-black uppercase">
              <ChevronRight className="rotate-180" /> Quay lại
            </button>
            <h1 className="text-2xl font-black tracking-tighter uppercase ml-4 text-emerald-700">Điều chỉnh thông tin hợp đồng</h1>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-3xl mx-auto w-full">
          <div className="bg-white rounded-[3rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-10 space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black uppercase mb-2">Sản lượng (kg)</label>
                <input 
                  type="number" 
                  value={contractEditData.quantity}
                  onChange={(e) => setContractEditData({...contractEditData, quantity: Number(e.target.value)})}
                  className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold text-lg focus:ring-4 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase mb-2">Đơn giá (VNĐ/kg)</label>
                <input 
                  type="number" 
                  value={contractEditData.unitPrice || (displayProduct ? (displayProduct as any).price : 16000)}
                  onChange={(e) => setContractEditData({...contractEditData, unitPrice: Number(e.target.value)})}
                  className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold text-lg focus:ring-4 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase mb-2">Địa điểm giao hàng</label>
                <input 
                  type="text" 
                  value={contractEditData.deliveryAddress || user.address}
                  onChange={(e) => setContractEditData({...contractEditData, deliveryAddress: e.target.value})}
                  className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold text-lg focus:ring-4 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-black uppercase mb-2">Ngày giao hàng dự kiến</label>
                <input 
                  type="date" 
                  value={contractEditData.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  onChange={(e) => setContractEditData({...contractEditData, deliveryDate: e.target.value})}
                  className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold text-lg focus:ring-4 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

              <div className="pt-6 flex gap-4">
                <button 
                  onClick={() => setIsEditingContract(false)}
                  className="flex-1 bg-white border-4 border-black py-5 rounded-3xl font-black text-lg uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => {
                    const finalTotal = (contractEditData.unitPrice * contractEditData.quantity) + 25000;
                    
                    if (viewingContract) {
                      // Update existing contract if it was being viewed
                      setOrders(prev => prev.map(o => {
                        if (o.id === viewingContract.id) {
                          return {
                            ...o,
                            items: o.items.map(item => ({...item, price: contractEditData.unitPrice})),
                            total: finalTotal,
                            quantity: contractEditData.quantity,
                            buyerAddress: contractEditData.deliveryAddress,
                            date: contractEditData.deliveryDate
                          };
                        }
                        return o;
                      }));
                      setViewingContract(prev => {
                        if (!prev) return null;
                        return {
                          ...prev,
                          items: prev.items.map(item => ({...item, price: contractEditData.unitPrice})),
                          total: finalTotal,
                          quantity: contractEditData.quantity,
                          buyerAddress: contractEditData.deliveryAddress,
                          date: contractEditData.deliveryDate
                        };
                      });
                    }
                    setIsEditingContract(false);
                  }}
                  className="flex-[2] bg-emerald-600 text-white border-4 border-black py-5 rounded-3xl font-black text-lg uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-700 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  Lưu thay đổi
                </button>
              </div>
          </div>
        </main>
        {renderSharedModals()}
      </div>
    );
  }

  if (activeTab === 'find-supply') {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
          <button onClick={() => { setActiveTab('dashboard'); setInitialMapCartView(null); }} className="flex items-center gap-2 font-black text-black uppercase">
            <ChevronRight className="rotate-180" /> Quay lại Dashboard
          </button>
          <h1 className="text-xl font-black uppercase tracking-tighter">Tìm kiếm nguồn cung sạch</h1>
          <div className="w-24"></div>
        </div>
        <div className="flex-1 relative">
          <MapInterface 
            products={approvedProducts} 
            isFarmerView={false} 
            isBuyerView={true}
            onSearch={setSearchQuery}
            initialSearchQuery={searchQuery}
            cart={cart}
            setCart={setCart}
            orders={orders}
            setOrders={setOrders}
            initialCartView={initialMapCartView}
            onNegotiate={(product) => {
              onStartNegotiation(product);
              setActiveTab('contact');
            }}
            highlightedLocation={highlightedAiLocation}
          />
        </div>
        {renderSharedModals()}
      </div>
    );
  }

  if (activeTab === 'orders') {
    // Show regular orders AND contract orders that are in signed phase or later
    const regularOrders = orders.filter(o => !o.contractNumber && o.status !== 'Bị hủy');
    const shippingContractOrders = orders.filter(o => 
      o.contractNumber && 
      (['Đã ký kết', 'Chuẩn bị vận chuyển', 'Đang giao hàng', 'Đã giao hàng', 'Hoàn tất'].includes(o.status) || 
       o.deliveryTimeline?.some(step => (step.status === 'shipping' || step.status === 'preparing') && step.completed))
    );
    
    const allVisibleOrders = [...regularOrders, ...shippingContractOrders].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab('dashboard')} 
              className="p-2 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ChevronRight size={24} className="rotate-180 text-slate-400" /> 
            </motion.button>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-800">Đơn hàng của tôi</h1>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setInitialMapCartView('orders');
              setActiveTab('find-supply');
            }}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
          >
            <MapPin size={16} /> Bản đồ đơn hàng
          </motion.button>
        </header>

        <main className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
          {allVisibleOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-2xl shadow-slate-200/50"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <Package size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-slate-500 font-bold mb-8">Bạn chưa thực hiện giao dịch nào. Hãy khám phá các sản phẩm ngay!</p>
              <button 
                onClick={() => setActiveTab('find-supply')}
                className="bg-slate-800 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-slate-200"
              >
                Mua sắm ngay
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {allVisibleOrders.map((order, idx) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-emerald-950/5 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-wrap justify-between items-start gap-6 mb-8 relative z-10">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-black text-slate-800 tracking-tighter">#{order.id.split('-').pop()}</span>
                        {order.contractNumber && (
                          <span className="bg-teal-50 text-teal-600 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-teal-100">
                            HĐ: {order.contractNumber}
                          </span>
                        )}
                        <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                          order.status === 'Đã giao' || order.status === 'Hoàn tất' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          order.status === 'Đang giao' || order.status === 'Chuẩn bị vận chuyển' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng thanh toán</p>
                      <p className="text-3xl font-black text-emerald-600 tracking-tight">{(order.total || 0).toLocaleString()}đ</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-50 pt-8 flex items-center justify-between">
                      <div className="flex -space-x-3 overflow-hidden">
                        {order.items.map((item, idx) => (
                          <motion.div 
                            key={idx} 
                            whileHover={{ y: -5, scale: 1.1, zIndex: 10 }}
                            className="relative group/item"
                          >
                            <img 
                              src={item.images.product[0]} 
                              alt={item.name}
                              className="inline-block h-16 w-16 rounded-2xl ring-4 ring-white object-cover shadow-lg"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center text-[8px] text-white font-black text-center p-1 leading-tight uppercase">
                              {item.name}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    
                      <div className="flex items-center gap-4">
                        {order.deliveryTimeline && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                              trackingOrderId === order.id 
                              ? 'bg-slate-800 text-white shadow-xl shadow-slate-900/10' 
                              : 'bg-white border border-slate-100 text-slate-400 hover:text-emerald-600 hover:border-emerald-200'
                            }`}
                          >
                            <Truck size={16} /> Theo dõi tiến độ
                          </motion.button>
                        )}
                        {order.contractNumber && !order.depositPaid && order.status === 'Đã ký kết' && (
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setPayingOrder(order);
                              setIsPayingDeposit(true);
                              setPaymentStep('method');
                            }}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2"
                          >
                            <CreditCard size={16} /> Thanh toán cọc
                          </motion.button>
                        )}
                        {order.contractNumber && order.status !== 'Hoàn tất' && (
                          <div className="flex gap-3">
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
                              className="bg-red-50 text-red-600 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100"
                            >
                              Khiếu nại
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const confirmFinish = window.confirm('Xác nhận bạn đã nhận đủ hàng và kết thúc giao dịch?');
                                if (confirmFinish) {
                                  const updatedOrders = orders.map(o => 
                                    o.id === order.id ? { ...o, status: 'Hoàn tất' } : o
                                  );
                                  setOrders(updatedOrders);
                                }
                              }}
                              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
                            >
                              Hoàn tất đơn
                            </motion.button>
                          </div>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (order.contractNumber) {
                              setViewingContract(order);
                            }
                          }}
                          className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-all border border-slate-100"
                        >
                          Hợp đồng <ChevronRight size={14} />
                        </motion.button>
                      </div>
                    </div>

                    {/* Separate Tracking Section */}
                    <AnimatePresence>
                      {trackingOrderId === order.id && order.deliveryTimeline && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-8 pt-8 border-t border-slate-50 space-y-8">
                            <div className="flex items-center gap-3">
                              <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                                <Truck size={20} />
                              </div>
                              <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Timeline giao vận</h4>
                            </div>

                            <div className="relative pb-10">
                              {/* Connector Line */}
                              <div className="absolute top-6 left-12 right-12 h-0.5 bg-slate-100 rounded-full"></div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                                {order.deliveryTimeline.map((step, idx) => (
                                  <div key={idx} className="relative flex flex-col items-center text-center">
                                    <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center border-4 z-10 transition-all duration-700 ${
                                      step.completed 
                                      ? 'bg-emerald-500 border-white text-white shadow-xl shadow-emerald-500/20' 
                                      : 'bg-white border-slate-50 text-slate-200'
                                    }`}>
                                      {step.completed ? <CheckCircle2 size={24} /> : <div className="w-2 h-2 bg-slate-100 rounded-full" />}
                                    </div>
                                    <div className="mt-4 px-2">
                                      <p className={`font-black uppercase text-[9px] tracking-[0.2em] leading-tight ${step.completed ? 'text-emerald-700' : 'text-slate-300'}`}>
                                        {step.label}
                                      </p>
                                      {step.timestamp && (
                                        <p className="text-[9px] font-black text-slate-400 uppercase mt-1 tracking-widest">{step.timestamp.split(',')[0]}</p>
                                      )}
                                    </div>

                                    {/* Detailed Updates */}
                                    {step.completed && (step.photos || step.details || step.status === 'delivered') && (
                                      <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 w-full relative group/detail shadow-sm"
                                      >
                                        <div className="absolute -top-2 left-1/2 -ml-2 w-4 h-4 bg-slate-50 border-t border-l border-slate-100 rotate-45"></div>
                                        
                                        {step.photos && step.photos.length > 0 && (
                                          <div className="flex gap-2 justify-center mb-3">
                                            {step.photos.map((p, i) => (
                                              <img key={i} src={p} className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-md hover:scale-150 transition-all cursor-zoom-in z-20" />
                                            ))}
                                          </div>
                                        )}
                                        
                                        {step.status === 'delivered' && (
                                          <div className="mb-3 p-3 bg-white rounded-xl border border-slate-100 shadow-inner">
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Người nhận ký xác nhận</p>
                                            <div className="flex items-center justify-center gap-2 text-emerald-600">
                                              <PenTool size={14} />
                                              <span className="font-bold underline italic">{user.fullName}</span>
                                            </div>
                                            <p className="text-[7px] text-slate-300 mt-1 uppercase tracking-tighter">{step.timestamp}</p>
                                          </div>
                                        )}

                                        {step.details && (
                                          <p className="text-[9px] font-bold text-slate-500 italic leading-relaxed">"{step.details}"</p>
                                        )}
                                      </motion.div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
              ))}
            </div>
          )}
        </main>

        {renderSharedModals()}
      </div>
    );
  }

  if (activeTab === 'e-contract-agreement' && (selectedProductForContract || viewingContract)) {
    const finalProduct = selectedProductForContract || (viewingContract ? viewingContract.items[0] : null);

    if (!finalProduct) return null;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('find-supply')} className="flex items-center gap-2 font-black text-black uppercase">
              <ChevronRight className="rotate-180" /> Quay lại Bản đồ
            </button>
            <h1 className="text-2xl font-black uppercase ml-4">Ký kết Hợp đồng điện tử</h1>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
          <div className="bg-white border-4 border-black rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="p-12 font-sans text-slate-800 leading-relaxed bg-white">
              <div className="text-center mb-10">
                <h3 className="text-xl font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
                <p className="font-bold text-lg">Độc lập - Tự do - Hạnh phúc</p>
                <div className="w-40 h-1 bg-black mx-auto mt-3"></div>
              </div>
              
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold uppercase tracking-tighter">Hợp đồng mua bán nông sản</h3>
                <p className="italic text-slate-500 font-bold mt-1">(Số: {viewingContract?.contractNumber || 'HĐ-8291-AM'})</p>
              </div>
              
              <div className="mb-8 space-y-2">
                <ul className="list-disc pl-6 space-y-1 font-bold text-sm text-slate-600">
                  <li>Căn cứ Bộ luật Dân sự số 91/2015/QH13;</li>
                  <li>Căn cứ Luật Thương mại số 36/2005/QH11;</li>
                  <li>Căn cứ nhu cầu và thỏa thuận của các bên.</li>
                </ul>
                <p className="mt-6 text-lg font-medium">Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm 2026, tại nền tảng AgriMap, chúng tôi gồm:</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <h4 className="font-black text-xs uppercase tracking-widest text-blue-800 border-b-2 border-blue-100 pb-2 mb-4">BÊN BÁN (BÊN A):</h4>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>Đại diện:</strong> {finalProduct.farmerName}</p>
                    <p>• <strong>Địa chỉ:</strong> {finalProduct.location.address}</p>
                    <p>• <strong>Số điện thoại:</strong> {finalProduct.contact}</p>
                    <p>• <strong>MST:</strong> 0312XXXXXX</p>
                    <p>• <strong>Số tài khoản:</strong> 1903XXXXXXXXXX (Techcombank)</p>
                  </div>
                </div>
                <div className="space-y-4 p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100">
                  <h4 className="font-black text-xs uppercase tracking-widest text-emerald-800 border-b-2 border-emerald-100 pb-2 mb-4">BÊN MUA (BÊN B):</h4>
                  <div className="space-y-2 text-sm">
                    <p>• <strong>Đại diện:</strong> {user.fullName}</p>
                    <p>• <strong>Địa chỉ:</strong> {user.address}</p>
                    <p>• <strong>Số điện thoại:</strong> {user.phone}</p>
                    <p>• <strong>MST:</strong> 0102XXXXXX</p>
                    <p>• <strong>Số tài khoản:</strong> 0071XXXXXXXXXX (Vietcombank)</p>
                  </div>
                </div>
              </div>
              
              <p className="mb-10 font-black text-xl uppercase tracking-tighter border-l-8 border-black pl-4">Các điều khoản hợp đồng:</p>
              
              <div className="space-y-8 mb-16">
                <h4 className="font-black text-lg uppercase tracking-tighter border-l-8 border-black pl-4">NỘI DUNG GIAO DỊCH</h4>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b-2 border-slate-200">
                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400">Sản phẩm</th>
                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Số lượng</th>
                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Đơn giá</th>
                        <th className="pb-4 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {finalProduct && (
                        <tr>
                          <td className="py-5 font-bold text-lg">{finalProduct.name}</td>
                          <td className="py-5 text-center font-bold">{currentValues.quantity.toLocaleString()} kg</td>
                          <td className="py-5 text-right font-bold">{currentValues.price.toLocaleString()}đ</td>
                          <td className="py-5 text-right font-black text-lg">{(currentValues.price * currentValues.quantity).toLocaleString()}đ</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200">
                        <td colSpan={3} className="pt-6 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Phí vận chuyển:</td>
                        <td className="pt-6 text-right font-bold">25.000đ</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="pt-2 text-right text-3xl font-black uppercase tracking-tighter">TỔNG CỘNG:</td>
                        <td className="pt-2 text-right text-3xl font-black text-emerald-700">{currentValues.total.toLocaleString()}đ</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="space-y-12">
                <section>
                  <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">1</span>
                    ĐIỀU 1: ĐỐI TƯỢNG HÀNG HÓA VÀ TIÊU CHUẨN
                  </h4>
                  <div className="pl-12 space-y-2 text-sm font-medium">
                    <p>1. <strong>Tên sản phẩm:</strong> {finalProduct.name}</p>
                    <p>2. <strong>Sản lượng:</strong> {currentValues.quantity.toLocaleString()} kg. Tỷ lệ sai số cho phép: +/- 5%</p>
                    <p>3. <strong>Tiêu chuẩn chất lượng:</strong> {finalProduct.certificates?.map((c: any) => c.type).join('/') || 'Đạt tiêu chuẩn xuất khẩu, không dư lượng thuốc BVTV'}.</p>
                    <p>4. <strong>Quy cách đóng gói:</strong> Đóng thùng carton/sọt nhựa theo tiêu chuẩn vận chuyển nông sản.</p>
                    <p>5. <strong>Truy xuất nguồn gốc:</strong> Sản phẩm được định danh và theo dõi nhật ký canh tác tại vùng trồng {finalProduct.location.address} trên hệ thống AgriMap.</p>
                  </div>
                </section>
                
                <section>
                  <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">2</span>
                    ĐIỀU 2: GIÁ CẢ VÀ THANH TOÁN
                  </h4>
                  <div className="pl-12 space-y-2 text-sm font-medium">
                    <p>1. <strong>Đơn giá:</strong> {currentValues.price.toLocaleString()} VNĐ/kg (Giá đã bao gồm VAT).</p>
                    <p>2. <strong>Tổng giá trị đơn hàng:</strong> {currentValues.itemTotal.toLocaleString()} VNĐ.</p>
                    <p>3. <strong>Phí vận chuyển:</strong> 25.000 VNĐ.</p>
                    <p>4. <strong>Tổng cộng (tạm tính):</strong> {currentValues.total.toLocaleString()} VNĐ.</p>
                    <p>5. <strong>Phương thức thanh toán:</strong> Chuyển khoản qua hệ thống ví AgriMap Pay.</p>
                    <p>6. <strong>Tiến độ thanh toán:</strong></p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Đợt 1: Tạm ứng 30% giá trị hợp đồng ({(currentValues.total * 0.3).toLocaleString()}đ) ngay sau khi ký kết.</li>
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
                    <p>1. <strong>Thời gian giao hàng:</strong> {currentValues.deliveryDate}.</p>
                    <p>2. <strong>Địa điểm giao hàng:</strong> {currentValues.address}</p>
                    <p>3. <strong>Phương thức vận chuyển:</strong> Xe tải chuyên dụng. Chi phí vận chuyển do Bên B chịu.</p>
                    <p>4. <strong>Rủi ro:</strong> Rủi ro về hàng hóa được chuyển giao từ Bên A sang Bên B kể từ thời điểm ký biên bản giao nhận hàng hóa.</p>
                  </div>
                </section>

                <section>
                  <h4 className="font-black text-xl mb-4 flex items-center gap-3 uppercase tracking-tighter">
                    <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0">4</span>
                    ĐIỀU 4: KIỂM TRA VÀ NGHIỆM THU
                  </h4>
                  <div className="pl-12 space-y-2 text-sm font-medium">
                    <p>1. Bên B có quyền kiểm tra hàng hóa ngay tại thời điểm giao nhận.</p>
                    <p>2. <strong>Thông báo lỗi:</strong> Trong vòng 24 giờ kể từ khi nhận hàng, Bên B phải thông báo cho Bên A nếu phát hiện hàng lỗi. Quá thời hạn trên, hàng được coi là đạt chuẩn.</p>
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
                  <p className="font-bold text-lg uppercase tracking-tighter">ĐẠI DIỆN BÊN B</p>
                  <p className="text-sm italic text-slate-500">(Ký, ghi rõ họ tên, đóng dấu)</p>
                  <div className="h-32 flex items-center justify-center">
                    <div className="border-4 border-emerald-600 text-emerald-600 p-4 rounded-2xl -rotate-12 font-bold text-sm shadow-xl bg-white/80 backdrop-blur-sm">
                      Đã ký số bởi AgriMap<br/>
                      <span className="text-lg uppercase tracking-tighter">{user.fullName}</span><br/>
                      <span className="text-[10px] opacity-70 italic font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="font-bold text-lg uppercase tracking-tighter">ĐẠI DIỆN BÊN A</p>
                  <p className="text-sm italic text-slate-500">(Ký, ghi rõ họ tên, đóng dấu)</p>
                  <div className="h-32 flex items-center justify-center">
                    {viewingContract?.status === 'Đã ký kết' || (viewingContract && ['Chuẩn bị vận chuyển', 'Đã giao hàng', 'Hoàn tất'].includes(viewingContract.status)) ? (
                      <div className="border-4 border-blue-600 text-blue-600 p-4 rounded-2xl rotate-12 font-bold text-sm shadow-xl bg-white/80 backdrop-blur-sm">
                        Đã ký số bởi AgriMap<br/>
                        <span className="text-lg uppercase tracking-tighter">{finalProduct.farmerName}</span><br/>
                        <span className="text-[10px] opacity-70 italic font-medium">Xác nhận trực tuyến</span>
                      </div>
                    ) : (
                      <div className="border-4 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 flex flex-col items-center justify-center w-full h-full p-4">
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest font-sans">
                          {viewingContract?.status === 'Đang thương lượng' ? 'Đang thương lượng...' : 'Chờ xác nhận ký số...'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-10 border-t-4 border-black bg-slate-50 flex gap-6 sticky bottom-0 z-10">
              {(!viewingContract || viewingContract.status === 'Đang soạn thảo') && (
                <button 
                  onClick={() => {
                    setContractEditData({
                      quantity: currentValues.quantity,
                      unitPrice: currentValues.price,
                      deliveryAddress: currentValues.address,
                      deliveryDate: currentValues.deliveryDateStr
                    });
                    setIsEditingContract(true);
                  }}
                  className="flex-1 bg-amber-500 text-white border-4 border-black py-5 rounded-3xl font-black text-lg uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-600 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  <Edit3 size={24} /> Điều chỉnh thông tin
                </button>
              )}
              <button 
                onClick={() => setActiveTab('find-supply')}
                className="flex-1 bg-white border-4 border-black py-5 rounded-3xl font-black text-lg uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={() => {
                  const contractNum = viewingContract?.contractNumber || `${Math.floor(Math.random() * 1000)}/2026/HĐMB-AGRIMAP`;
                  const contractDate = viewingContract?.contractDate || new Date().toLocaleDateString('vi-VN');
                  
                  if (viewingContract) {
                    const isDraft = viewingContract.status === 'Đang soạn thảo';
                    const updatedOrder = {
                      ...viewingContract,
                      status: isDraft ? 'Chờ ký kết' : 'Đang xử lý',
                      items: viewingContract.items.map(item => ({...item, price: currentValues.price})),
                      total: currentValues.total,
                      buyerAddress: currentValues.address,
                      date: currentValues.deliveryDateStr,
                      quantity: currentValues.quantity,
                      depositAmount: Math.floor(currentValues.total * 0.3),
                      deliveryTimeline: isDraft ? [
                        { status: 'draft', label: 'Soạn thảo xong', completed: true, timestamp: new Date().toLocaleString('vi-VN') },
                        { status: 'proposed', label: 'Đã gửi bản ký kết cho nhà vườn', completed: true, timestamp: new Date().toLocaleString('vi-VN') },
                        { status: 'signed', label: 'Chờ nhà vườn ký kết', completed: false }
                      ] : viewingContract.deliveryTimeline
                    };

                    setOrders(prev => prev.map(o => o.id === viewingContract.id ? updatedOrder : o));
                    
                    if (isDraft && onConfirmProposedOrder) {
                      onConfirmProposedOrder(updatedOrder);
                    }
                  } else {
                    const newOrder: Order = {
                      id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                      items: [selectedProductForContract!],
                      total: currentValues.total,
                      date: currentValues.deliveryDateStr,
                      status: 'Đang xử lý',
                      contractNumber: contractNum,
                      contractDate: contractDate,
                      buyerName: user.fullName,
                      buyerAddress: currentValues.address,
                      buyerPhone: user.phone,
                      depositPaid: false,
                      quantity: currentValues.quantity,
                      depositAmount: Math.floor(currentValues.total * 0.3)
                    };
                    setOrders([newOrder, ...orders]);
                    setCart(cart.filter(p => p.id !== selectedProductForContract!.id));
                  }
                  
                  const destTab = (viewingContract?.status === 'Đang soạn thảo') ? 'contracts' : 'orders';
                  
                  setSelectedProductForContract(null);
                  setViewingContract(null);
                  if (onClearProposedOrder) onClearProposedOrder();
                  setIsSignSuccess(true);
                  setActiveTab(destTab);
                }}
                className="flex-[2] bg-emerald-600 text-white border-4 border-black py-5 rounded-3xl font-black text-xl uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-emerald-700 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4"
              >
                <FileSignature size={28} /> 
                {viewingContract?.status === 'Đang soạn thảo' ? 'Gửi bản ký kết điện tử' : 'Xác nhận & Ký số'}
              </button>
            </div>
          </div>
        </main>
        {renderSharedModals()}
      </div>
    );
  }

  if (activeTab === 'contracts') {
    const contractOrders = orders.filter(o => o.contractNumber);

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab('dashboard')} 
              className="p-2 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ChevronRight size={24} className="rotate-180 text-slate-400" /> 
            </motion.button>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-800">Hợp đồng điện tử</h1>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
          {contractOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-2xl shadow-slate-200/50"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <FileText size={48} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase mb-2">Chưa có hợp đồng nào</h3>
              <p className="text-slate-500 font-bold mb-8">Các hợp đồng điện tử sẽ xuất hiện ở đây sau khi bạn thực hiện ký kết mua bán.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {contractOrders.map((order, idx) => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-emerald-950/5 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-teal-50 rounded-bl-[4rem] -mr-16 -mt-16 opacity-30 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="flex flex-wrap justify-between items-start gap-6 mb-8 relative z-10">
                    <div className="flex gap-5">
                      <div className="p-4 bg-teal-50 text-teal-600 rounded-[1.5rem] ring-8 ring-teal-50 group-hover:ring-teal-100 transition-all">
                        <FileText size={28} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-slate-800 tracking-tighter">HĐ: {order.contractNumber}</span>
                          <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                            order.status === 'Đã ký kết' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            order.status === 'Đang thương lượng' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {order.status === 'Đã ký kết' ? 'ĐÃ KÝ KẾT' : 
                             order.status === 'Đang thương lượng' ? 'THƯƠNG LƯỢNG' : 'CHỜ PHẢN HỒI'}
                          </span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Ngày ký: {order.contractDate}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-40">Mã đơn: {order.id.split('-').pop()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Giá trị hợp đồng</p>
                      <p className="text-3xl font-black text-teal-600 tracking-tight">{(order.total || 0).toLocaleString()}đ</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-slate-50 pt-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                        {order.items.map((item, idx) => (
                          <img 
                            key={idx}
                            src={item.images.product[0]} 
                            alt={item.name}
                            className="h-12 w-12 rounded-2xl ring-4 ring-white object-cover shadow-lg"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">
                        {order.items[0].name} {order.items.length > 1 ? ` & ${order.items.length - 1} sản phẩm khác` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {order.status === 'Đã ký kết' && !order.depositPaid && (
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPayingOrder(order);
                            setIsPayingDeposit(true);
                            setPaymentStep('method');
                          }}
                          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20"
                        >
                          <CreditCard size={16} /> Thanh toán cọc
                        </motion.button>
                      )}
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewingContract(order)}
                        className="flex items-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/30"
                      >
                        Xem chi tiết <ChevronRight size={16} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>

        {renderSharedModals()}
      </div>
    );
  }

  if (activeTab === 'deposits') {
    const ordersNeedingDeposit = orders.filter(o => o.contractNumber && o.status !== 'Hoàn tất' && o.status !== 'Bị hủy');
    const actualOrdersWaitingPayment = ordersNeedingDeposit.filter(o => !o.depositPaid && o.status === 'Đã ký kết');

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab('dashboard')} 
              className="p-2 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ChevronRight size={24} className="rotate-180 text-slate-400" />
            </motion.button>
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl">
              <Wallet size={20} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-800 ml-2">Giao dịch đặt cọc</h1>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden group"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
               <p className="text-[10px] font-black uppercase opacity-70 mb-1 tracking-widest">Tiền cọc đang giữ</p>
               <h3 className="text-4xl font-black tracking-tight">72.000.000đ</h3>
               <p className="text-[9px] mt-4 font-bold opacity-60 uppercase tracking-tighter">AgriMap Escrow Protection</p>
               <ShieldCheck size={80} className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-12" />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center"
            >
               <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Hợp đồng chờ cọc</p>
               <h3 className="text-4xl font-black text-slate-800 tracking-tight">{actualOrdersWaitingPayment.length}</h3>
               <p className="text-[9px] mt-4 font-black text-amber-600 uppercase tracking-widest bg-amber-50 w-fit px-3 py-1 rounded-full">Cần thanh toán ngay</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-center"
            >
               <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Tổng giao dịch</p>
               <h3 className="text-4xl font-black text-slate-800 tracking-tight">{ordersNeedingDeposit.length}</h3>
               <p className="text-[9px] mt-4 font-black text-slate-400 uppercase tracking-widest bg-slate-50 w-fit px-3 py-1 rounded-full">Hợp đồng điện tử</p>
            </motion.div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <History size={20} />
              </div> 
              Lịch sử giao dịch cọc
            </h3>

            {ordersNeedingDeposit.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-dashed border-slate-200 rounded-[3rem] p-20 text-center shadow-sm"
              >
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] italic text-[11px]">Chưa có giao dịch cọc nào phát sinh</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {ordersNeedingDeposit.map((order, idx) => (
                  <motion.div 
                    key={order.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[2rem] p-6 border border-slate-100 flex flex-wrap items-center justify-between gap-6 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-950/5 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-[1.5rem] ${order.depositPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {order.depositPaid ? <ShieldCheck size={28} /> : <AlertTriangle size={28} />}
                      </div>
                      <div>
                        <h4 className="text-lg font-black text-slate-800 uppercase leading-none mb-1">HĐ: {order.contractNumber}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Giao dịch: {order.id.split('-').pop()}</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 tracking-widest">Số tiền cọc</p>
                      <p className="text-2xl font-black text-indigo-700 tracking-tight">{(order.depositAmount || Math.floor((order.total || 0) * 0.3)).toLocaleString()}đ</p>
                    </div>

                    <div className="text-right">
                       {order.depositPaid ? (
                         <div className="bg-emerald-50 text-emerald-700 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2">
                           <CheckCircle2 size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Đã ký quỹ</span>
                         </div>
                       ) : order.status === 'Đã ký kết' ? (
                         <motion.button 
                           whileHover={{ scale: 1.05 }}
                           whileTap={{ scale: 0.95 }}
                           onClick={() => {
                             setPayingOrder(order);
                             setIsPayingDeposit(true);
                             setPaymentStep('method');
                           }}
                           className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
                         >
                           <CreditCard size={18} /> THANH TOÁN NGAY
                         </motion.button>
                       ) : (
                         <div className="bg-slate-50 text-slate-400 px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-2">
                           <AlertTriangle size={16} />
                           <span className="text-[9px] font-black uppercase tracking-widest italic leading-tight text-left">Chờ nông dân<br/>xác nhận ký</span>
                         </div>
                       )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
        {renderSharedModals()}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between sticky top-0 z-[1000] shadow-sm shadow-slate-200/20">
        <div className="flex items-center gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 p-1 rounded-2xl transition-all"
          >
            <Logo size="md" />
            <h1 className="text-2xl font-black tracking-tighter uppercase text-slate-800 hidden sm:block">AgriMap</h1>
          </motion.button>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className={`relative p-2.5 transition-all rounded-xl ${isNotificationOpen ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-2 border-transparent hover:border-emerald-100'}`}
            >
              <Bell size={22} strokeWidth={2.5} />
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
            </motion.button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-emerald-950/10 z-[1100] overflow-hidden"
                >
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="font-black uppercase tracking-tighter text-lg text-slate-800">Thông báo</h3>
                    <div className="flex gap-2">
                      <button onClick={markAllAsRead} className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-700 tracking-widest">Đánh dấu đã đọc</button>
                      <span className="text-slate-200">|</span>
                      <button onClick={clearNotifications} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 tracking-widest">Xóa hết</button>
                    </div>
                  </div>
                  <div className="max-h-[32rem] overflow-y-auto p-4 space-y-3">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                          <Bell size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Không có thông báo mới</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={notif.id} 
                          className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                            notif.isRead ? 'bg-white border-slate-50 opacity-60' : 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200 shadow-sm'
                          }`}
                          onClick={() => {
                            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                            if (notif.relatedId) {
                              setActiveTab('orders');
                              setIsNotificationOpen(false);
                            }
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2.5 rounded-xl ${
                              notif.type === 'delivery_update' ? 'bg-blue-100 text-blue-600' :
                              notif.type === 'contract_signed' ? 'bg-emerald-100 text-emerald-600' :
                              'bg-indigo-100 text-indigo-600'
                            }`}>
                              {notif.type === 'delivery_update' ? <Truck size={18} /> : 
                               notif.type === 'contract_signed' ? <FileText size={18} /> : <Bell size={18} />}
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <h4 className="font-black text-sm uppercase tracking-tight text-slate-800">{notif.title}</h4>
                              <p className="text-xs font-bold text-slate-500 leading-relaxed">{notif.message}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1.5 opacity-60">{notif.timestamp}</p>
                            </div>
                            {!notif.isRead && (
                               <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-2 ring-4 ring-emerald-500/10"></div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                      <button 
                        onClick={() => setIsNotificationOpen(false)}
                        className="w-full py-3 bg-white border border-slate-200 rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
                      >
                        Đóng
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button 
            whileHover={{ x: 5 }}
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 pl-6 border-l border-slate-100 transition-all group ${activeTab === 'profile' ? 'bg-emerald-50 px-3 py-1 rounded-2xl' : ''}`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800 uppercase leading-none mb-1 group-hover:text-emerald-600 transition-colors">{user.fullName}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user.companyName}</p>
            </div>
            <div className="w-11 h-11 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group-hover:ring-4 group-hover:ring-emerald-500/10 transition-all shadow-sm">
              <img 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.fullName}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 12 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLogoutDialogOpen(true)}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent shadow-sm hover:shadow-red-200/30"
            title="Đăng xuất"
          >
            <LogOut size={22} />
          </motion.button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <AnimatePresence mode="wait">
          {activeTab === 'contact' && (
            <motion.div 
              key="contact"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">Trung tâm Liên lạc</h2>
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest mt-2">Quản lý các cuộc thương thảo và tin nhắn trực tiếp với nông gia</p>
                </div>
              </div>

              {activeSessionId ? (
                (() => {
                  const selectedSession = negotiationSessions.find(s => s.id === activeSessionId);
                  if (!selectedSession) return null;
                  return (
                    <div className="bg-white border-4 border-black rounded-[3rem] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] h-[650px] flex flex-col">
                      <div className="bg-black text-white p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setActiveSessionId && setActiveSessionId(null)}
                            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                          >
                            <ArrowLeft size={20} />
                          </button>
                          <div>
                            <h3 className="font-black uppercase text-sm tracking-tight">Cửa hàng: {selectedSession.farmerName}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sản phẩm: {selectedSession.productName}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase bg-emerald-500 text-white px-3 py-1 rounded-full">
                          Đang trực tuyến
                        </span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
                        {selectedSession.messages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-5 rounded-3xl ${
                              msg.senderId === user.id 
                                ? 'bg-emerald-600 text-white rounded-br-none shadow-lg' 
                                : msg.senderId === 'system'
                                  ? 'bg-slate-200 text-slate-600 text-[10px] font-bold text-center w-full mx-8'
                                  : 'bg-white border-2 border-slate-100 text-slate-800 rounded-bl-none shadow-md'
                            }`}>
                              <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                              <div className={`flex items-center gap-2 mt-2 font-bold uppercase opacity-60 ${msg.senderId === user.id ? 'justify-end text-right' : 'justify-start text-left'}`}>
                                <span className="text-[9px]">{msg.senderName}</span>
                                <span className="text-[9px]">•</span>
                                <span className="text-[9px]">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 bg-white border-t-4 border-black flex flex-col gap-4">
                        <div className="flex gap-4">
                          <input 
                            type="text" 
                            placeholder="Bạn muốn thương thảo thêm về điều gì?..."
                            className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-4 text-base font-medium focus:outline-none focus:border-emerald-500 transition-colors"
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
                            className="bg-black hover:bg-emerald-600 text-white font-black uppercase px-10 rounded-2xl transition-all shadow-[6px_6px_0px_0px_rgba(245,158,11,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                          >
                            Gửi
                          </button>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => onProposeContract?.()}
                          className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase rounded-2xl transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-3 border-4 border-black"
                        >
                          <Edit3 size={20} /> Khởi tạo hợp đồng điện tử
                        </motion.button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {negotiationSessions.filter(s => s.buyerId === user.id && s.status !== 'CLOSED').length === 0 ? (
                    <div className="col-span-full py-48 flex flex-col items-center justify-center bg-white border-4 border-dashed border-slate-200 rounded-[4rem] text-center px-6">
                      <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center mb-8 relative">
                         <div className="absolute inset-0 bg-emerald-500/5 rounded-full animate-ping"></div>
                         <MessageSquare size={80} className="text-slate-200" />
                      </div>
                      <h3 className="text-3xl font-black text-slate-400 uppercase italic tracking-tight mb-4">Chưa có liên lạc</h3>
                      <p className="max-w-md text-sm font-bold text-slate-300 uppercase tracking-widest leading-loose">
                         Bắt đầu thương thảo với nông gia bằng cách nhấn nút "Thương lượng" tại trang chi tiết sản phẩm.
                      </p>
                    </div>
                  ) : (
                    negotiationSessions.filter(s => s.buyerId === user.id && s.status !== 'CLOSED').map(session => (
                      <motion.div 
                        key={session.id}
                        whileHover={{ y: -8, rotate: -0.5 }}
                        className="bg-white border-4 border-black p-8 rounded-[3.5rem] shadow-[10px_10px_0px_0px_rgba(245,158,11,1)] hover:shadow-[14px_14px_0px_0px_rgba(16,185,129,1)] transition-all cursor-pointer group flex flex-col h-full"
                        onClick={() => {
                          const prod = products.find(p => p.id === session.productId);
                          if (prod && onStartNegotiation) onStartNegotiation(prod, session.id);
                        }}
                      >
                        <div className="flex items-start justify-between mb-8">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white italic font-black text-2xl">
                              {session.farmerName.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-black text-xl uppercase tracking-tighter line-clamp-1">{session.farmerName}</h3>
                              <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mt-1">Nông trại đối tác</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Bạn có chắc chắn muốn kết thúc và xóa cuộc hội thoại này?')) {
                                onDeleteNegotiation?.(session.id);
                              }
                            }}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            title="Xóa hội thoại"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-[2rem] border-2 border-black/5 mb-8 flex-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Sản phẩm đang thảo luận:</p>
                          <h4 className="font-black uppercase text-lg text-slate-800 border-b-2 border-black/10 pb-3 mb-4">{session.productName}</h4>
                          
                          {session.messages.length > 0 ? (
                            <div className="mt-2">
                               <p className="text-[10px] font-bold text-amber-600 uppercase mb-2">Tin nhắn mới nhất:</p>
                               <p className="text-sm font-medium text-slate-600 line-clamp-2 italic leading-relaxed">"{session.messages[session.messages.length - 1].text}"</p>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                              <History size={18} />
                              <span>Bắt đầu cuộc trò chuyện</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] font-black uppercase text-emerald-600 flex items-center gap-2 group-hover:gap-4 transition-all">
                            Tiếp tục thương thảo <ArrowRight size={18} />
                          </span>
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                            {session.messages.length}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Welcome Card */}
              <div className="relative rounded-[3rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-emerald-950/20 bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl -ml-32 -mb-32 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <motion.h2 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-4xl md:text-5xl font-black tracking-tighter leading-none"
                    >
                      Chào mừng trở lại! 👋
                    </motion.h2>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-1"
                    >
                      <p className="text-emerald-100 font-bold text-xl opacity-90">{user.companyName}</p>
                      <div className="flex items-center gap-2 text-emerald-200/80 text-[10px] font-black uppercase tracking-[0.3em] mt-4">
                        <Calendar size={12} />
                        <span>Thứ Hai, 14/07/2025</span>
                      </div>
                    </motion.div>
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                    animate={{ opacity: 0.15, scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 1 }}
                    className="hidden lg:block shrink-0"
                  >
                    <Network size={220} />
                  </motion.div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ y: -8 }}
                    className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl ring-4 ring-slate-50 transition-all group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:ring-emerald-50">
                        {stat.icon}
                      </div>
                      {stat.alert && (
                        <div className="relative">
                          <span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-50"></span>
                          <span className="relative block w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-800 mb-1 tracking-tight tabular-nums">{stat.value}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-80">{stat.label}</p>
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-50/50 w-fit px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {stat.sub}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recent Negotiations - Added for prominence */}
              {negotiationSessions.filter(s => s.buyerId === user.id && s.status !== 'CLOSED').length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-amber-500 rounded-full"></div>
                      <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Thương thảo đang diễn ra</h3>
                    </div>
                    <button 
                      onClick={() => setActiveTab('contact')}
                      className="text-[10px] font-black uppercase text-amber-600 hover:text-amber-700 tracking-widest flex items-center gap-2"
                    >
                      Xem tất cả <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {negotiationSessions.filter(s => s.buyerId === user.id && s.status !== 'CLOSED').slice(0, 3).map(session => (
                      <motion.div 
                        key={session.id}
                        whileHover={{ y: -5 }}
                        onClick={() => {
                          const prod = products.find(p => p.id === session.productId);
                          if (prod) onStartNegotiation(prod, session.id);
                        }}
                        className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] shadow-lg shadow-slate-100 hover:shadow-xl hover:border-amber-200 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white italic font-black">
                            {session.productName.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm uppercase truncate">{session.productName}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{session.messages.length} tin nhắn</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px] font-black uppercase text-amber-600">
                          <span>Khách hàng: {user.companyName || user.fullName}</span>
                          <span className="flex items-center gap-1">Tiếp tục <ArrowRight size={12} /></span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Main Functions */}
              <section>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-emerald-600 rounded-full"></div>
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Chức năng quản trị</h3>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {menuItems.map((item, idx) => (
                    <motion.button 
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * idx }}
                      whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (item.id === 'find-supply') setActiveTab('find-supply');
                        if (item.id === 'contact') setActiveTab('contact');
                        if (item.id === 'orders') setActiveTab('orders');
                        if (item.id === 'contracts') setActiveTab('contracts');
                        if (item.id === 'deposits') setActiveTab('deposits');
                        if (item.id === 'market_forecast') setActiveTab('market_forecast');
                      }}
                      className="bg-white/60 backdrop-blur-sm p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 transition-all group flex flex-col items-center relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className={`${item.color} text-white p-5 rounded-[2rem] mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl shadow-slate-900/10 z-10`}>
                        {React.cloneElement(item.icon as React.ReactElement<any>, { size: 36, strokeWidth: 2.5 })}
                      </div>
                      <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest leading-tight z-10 group-hover:text-emerald-700 transition-colors">{item.label}</span>
                      {item.badge && (
                        <span className="absolute top-6 right-6 bg-red-500 text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-white shadow-lg shadow-red-500/30 z-20">
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </section>

              {/* Big Data Analytics For Customers */}
              {bigData && (
                <section className="space-y-10">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Phân tích Thị trường <span className="text-blue-600">(BIG DATA)</span></h3>
                     </div>
                     <motion.button 
                      whileHover={{ x: 5 }}
                      onClick={() => setActiveTab('market_forecast')}
                      className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"
                     >
                        Xem dự báo chi tiết <ChevronRight size={14} />
                     </motion.button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                     {/* Trends Panel */}
                     <div className="lg:col-span-12 xl:col-span-8">
                        <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden h-full">
                           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
                           <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                              <div className="space-y-8">
                                 <div>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-3">
                                       <TrendingUp className="text-emerald-400" size={24} />
                                       Xu hướng tìm kiếm hot
                                    </h4>
                                    <p className="text-slate-400 text-xs font-bold leading-relaxed mb-8 italic">
                                       Dựa trên 100,000+ lượt tìm kiếm của nhà thu mua toàn quốc trong tuần qua.
                                    </p>
                                 </div>
                                 <div className="space-y-4">
                                    {bigData.demandTrends.slice(0, 3).map((trend, idx) => (
                                       <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex items-center justify-between group transition-all hover:bg-white/10">
                                          <div className="flex items-center gap-4">
                                             <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                                                #{idx + 1}
                                             </div>
                                             <div>
                                                <p className="text-base font-black text-white group-hover:text-blue-400 mt-1 transition-colors">{trend.keyword}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{trend.topRegions[0]}</p>
                                             </div>
                                          </div>
                                          <div className="text-right">
                                             <p className="text-lg font-black text-emerald-400 transition-colors">+{trend.growthRate}%</p>
                                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-end gap-1">
                                                <ArrowUpRight size={10} /> HOT
                                             </p>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] flex flex-col justify-between">
                                 <div>
                                    <div className="flex items-center justify-between mb-8">
                                       <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl">
                                          <AlertTriangle size={24} />
                                       </div>
                                       <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">Cảnh báo Cung-Cầu</span>
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase mb-4">Cơ hội Thu mua Tốt nhất</h4>
                                    <p className="text-[11px] font-bold text-slate-400 leading-relaxed italic mb-8">
                                       "{bigData.imbalances.find(i => i.status === 'SURPLUS')?.recommendation || 'Hệ thống đang phân tích các vùng trồng có nguồn cung dồi dào.'}"
                                    </p>
                                 </div>
                                 <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setActiveTab('find-supply')}
                                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-900/20"
                                 >
                                    Xem vùng cung ứng <ArrowRight size={14} className="inline ml-2" />
                                 </motion.button>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Price Forecast Card */}
                     <div className="lg:col-span-12 xl:col-span-4">
                        <div className="bg-white rounded-[3.5rem] border border-slate-100 p-12 shadow-2xl shadow-slate-200/40 h-full flex flex-col">
                           <h4 className="text-xl font-black text-slate-900 uppercase mb-4 flex items-center gap-3">
                              <Zap size={24} className="text-amber-500" />
                              Dự báo Giá AI
                           </h4>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 leading-relaxed italic">Biến động giá dựa trên dữ liệu vận tải và sản lượng vùng trồng.</p>
                           
                           <div className="space-y-6 flex-grow">
                              {bigData.pricePredictions.slice(0, 4).map((pred, i) => (
                                 <div key={i} className="flex items-center justify-between pb-6 border-b border-slate-50 last:border-0 group">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                          {i + 1}
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-800">{pred.productName}</p>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase">Tín hiệu: <span className="text-emerald-600">Ổn định</span></p>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <p className="text-lg font-black text-slate-900">{pred.forecastedPrice.toLocaleString()}<span className="text-[9px] text-slate-400 font-bold ml-1">đ</span></p>
                                       <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase">+{i * 0.5 + 2}%</span>
                                    </div>
                                 </div>
                              ))}
                           </div>

                           <motion.button 
                            whileHover={{ y: -5 }}
                            onClick={() => setActiveTab('market_forecast')}
                            className="w-full mt-10 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-slate-900/20"
                           >
                              Toàn bộ Phân tích
                           </motion.button>
                        </div>
                     </div>
                  </div>
                </section>
              )}


              {/* Market Forecast */}
              <section className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="p-8 md:px-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-600 rounded-2xl ring-4 ring-amber-50">
                      <TrendingUp size={24} />
                    </div>
                    AI Dự báo thị trường
                  </h3>
                  <button className="text-[10px] font-black text-slate-400 hover:text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2 transition-colors transition-transform hover:translate-x-1">
                    Xem báo cáo đầy đủ <ChevronRight size={14} strokeWidth={3} />
                  </button>
                </div>
                <div className="divide-y divide-slate-50 px-8 py-4">
                  {marketForecast.map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="py-6 transition-all flex items-center justify-between hover:bg-slate-50/50 -mx-8 px-8 rounded-3xl group"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-3 h-3 rounded-full ${item.isUp ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-red-500 ring-4 ring-red-500/10'}`}></div>
                        <div className="space-y-1">
                          <p className="text-xl font-black text-slate-800 tracking-tight group-hover:text-emerald-700 transition-colors">{item.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.status}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm shadow-sm ${item.isUp ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-red-500 text-white shadow-red-500/20'}`}>
                        {item.isUp ? <ArrowUpRight size={18} strokeWidth={3} /> : <ArrowDownRight size={18} strokeWidth={3} />}
                        <span className="tabular-nums">{item.trend}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )} 

        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'market_forecast' && (
          <MarketAI 
            onViewOnMap={(lat, lng, name) => {
              setHighlightedAiLocation({ lat, lng, name });
              setActiveTab('find-supply');
            }} 
          />
        )}
      </AnimatePresence>
    </main>

      <footer className="p-8 text-center bg-white border-t border-slate-50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] leading-loose">
          AgriMap Vietnam Ecosystem • Digital Agriculture Future • 2024
        </p>
      </footer>

      {renderSharedModals()}
    </div>
  );
};

export default CustomerDashboard;
