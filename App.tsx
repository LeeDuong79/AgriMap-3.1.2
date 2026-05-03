
import React, { useState, useMemo } from 'react';
import { UserRole, FarmProduct, ProductStatus, User, AdminUser, AdminLevel, BuyerUser, FarmerUser, Order, Complaint, ComplaintStatus } from './types';
import { MOCK_PRODUCTS, MOCK_COMPLAINTS } from './constants';
import FarmerDashboard from './components/FarmerDashboard';
import Navbar from './components/Navbar';
import MapInterface from './components/MapInterface';
import FarmerPortal from './components/FarmerPortal';
import AdminDashboard from './components/AdminDashboard';
import CustomerDashboard from './components/CustomerDashboard';
import AuthScreen from './components/AuthScreen';
import FarmerProfile from './components/FarmerProfile';
import FarmerHome from './components/FarmerHome';
import KnowledgeHandbook from './components/KnowledgeHandbook';
import WeatherModal from './components/WeatherModal';
import AgricultureHeatmap from './components/AgricultureHeatmap';
import NegotiationChat from './components/NegotiationChat';
import { Home, Map as MapIcon, User as UserIcon, LayoutGrid, NotebookPen, Thermometer, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, NegotiationSession } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('agrimap_user');
    return saved ? JSON.parse(saved) : null;
  });
  const getUserDisplayName = (u: User) => {
    if (!u) return 'Khách';
    if (u.role === UserRole.FARMER) return u.representative;
    return (u as AdminUser | BuyerUser).fullName;
  };

  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    const saved = localStorage.getItem('agrimap_current_role');
    return saved ? (saved as UserRole) : null;
  });
  const [products, setProducts] = useState<FarmProduct[]>(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  
  // Buyer state
  const [cart, setCart] = useState<FarmProduct[]>([]);
  const [negotiationSessions, setNegotiationSessions] = useState<NegotiationSession[]>(() => [
    {
      id: 'session-demo-1',
      buyerId: 'B-DEMO-1',
      buyerName: 'Công ty TNHH BigMart VN',
      farmerId: 'F-DEMO',
      farmerName: 'Nguyễn Văn An',
      productId: '2',
      productName: 'Xoài Cát Hòa Lộc',
      messages: [
        {
          id: 'm1',
          senderId: 'B-DEMO-1',
          senderName: 'Công ty TNHH BigMart VN',
          senderRole: UserRole.BUYER,
          text: 'Chào anh An, chúng tôi đang quan tâm đến lô Xoài Cát Hòa Lộc của anh. Anh có thể cho biết sản lượng thu hoạch đợt tới là bao nhiêu không?',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'm2',
          senderId: 'system',
          senderName: 'Hệ thống AgriMap',
          senderRole: UserRole.ADMIN,
          text: 'Chào mừng bạn đến với cuộc thương thảo. AgriMap khuyến khích giao dịch minh bạch.',
          timestamp: new Date(Date.now() - 3500000).toISOString()
        }
      ],
      status: 'OPEN'
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedProductForChat, setSelectedProductForChat] = useState<FarmProduct | null>(null);
  const [customerTab, setCustomerTab] = useState<'dashboard' | 'find-supply' | 'orders' | 'traceability' | 'contact' | 'e-contract-agreement' | 'contracts' | 'deposits' | 'profile' | 'market_forecast'>('dashboard');
  const [proposedOrderId, setProposedOrderId] = useState<string | null>(null);

  // Persist user with error handling
  React.useEffect(() => {
    try {
      localStorage.setItem('agrimap_user', JSON.stringify(user));
      localStorage.setItem('agrimap_current_role', currentRole || '');
    } catch (e) {
      console.error('Failed to save state', e);
    }
  }, [user, currentRole]);

  // Sync state between tabs and handle new message notifications
  const lastSyncSessionsRef = React.useRef<NegotiationSession[]>(negotiationSessions);
  
  React.useEffect(() => {
    lastSyncSessionsRef.current = negotiationSessions;
  }, [negotiationSessions]);
  
  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      // Sync user and role state between tabs
      if (e.key === 'agrimap_user' || e.key === 'agrimap_current_role') {
        const savedUser = localStorage.getItem('agrimap_user');
        const savedRole = localStorage.getItem('agrimap_current_role');
        if (savedUser) setUser(JSON.parse(savedUser));
        if (savedRole) setCurrentRole(savedRole as UserRole);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user?.id]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD-2024-001',
      items: [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]],
      total: 125000000,
      date: '17/04/2026',
      status: 'Đã ký kết',
      contractNumber: 'AGRI/2024/001',
      contractDate: '15/04/2026',
      deliveryTimeline: [
        { status: 'signed', label: 'Hợp đồng đã ký', completed: true, timestamp: '15/04/2026, 14:30:00' },
        { status: 'preparing', label: 'Đang chuẩn bị hàng', completed: false },
        { status: 'shipping', label: 'Chuẩn bị vận chuyển', completed: false },
        { status: 'delivered', label: 'Đã giao hàng', completed: false }
      ],
      depositPaid: true,
      depositAmount: 12500000
    },
    {
      id: 'ORD-2024-002',
      items: [MOCK_PRODUCTS[2]],
      total: 45000000,
      date: '16/04/2026',
      status: 'Chuẩn bị vận chuyển',
      contractNumber: 'AGRI/2024/002',
      contractDate: '14/04/2026',
      deliveryTimeline: [
        { status: 'signed', label: 'Hợp đồng đã ký', completed: true, timestamp: '14/04/2026, 09:15:00' },
        { status: 'preparing', label: 'Đang chuẩn bị hàng', completed: true, timestamp: '15/04/2026, 11:00:00' },
        { status: 'shipping', label: 'Chuẩn bị vận chuyển', completed: false },
        { status: 'delivered', label: 'Đã giao hàng', completed: false }
      ],
      depositPaid: true,
      depositAmount: 4500000
    }
  ]);
  
  // Tabs: home, register, list, map, profile, knowledge, heatmap
  const [farmerTab, setFarmerTab] = useState<'home' | 'register' | 'list' | 'map' | 'profile' | 'knowledge' | 'heatmap'>('home');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (user?.role === UserRole.ADMIN) {
        const matchesArea = p.location.address.toLowerCase().includes(user.assignedArea.split(' ').pop()?.toLowerCase() || '');
        if (!matchesArea && user.level !== AdminLevel.CENTRAL) return false;
      }
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.regionCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const isAdminView = user?.role === UserRole.ADMIN;
      const isApproved = p.status === ProductStatus.COMPLETED;
      return matchesSearch && matchesCategory && (isAdminView || isApproved);
    });
  }, [products, searchQuery, categoryFilter, user]);

  const handleAddProduct = (newProduct: FarmProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    setFarmerTab('list');
  };

  const handleUpdateStatus = (id: string, status: ProductStatus, note?: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;

      const now = new Date().toISOString();
      const newHistory = [...(p.statusHistory || [])];

      // Add to history if not already there for this status
      if (!newHistory.some(h => h.status === status)) {
        newHistory.push({ status, timestamp: now, note });
      }

      return { 
        ...p, 
        status, 
        statusHistory: newHistory,
        verificationNote: note || p.verificationNote,
        verifiedAt: now,
        verifiedBy: user?.role === UserRole.ADMIN ? user.fullName : p.verifiedBy
      };
    }));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const handleAuthSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    setCurrentRole(loggedUser?.role || UserRole.BUYER);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentRole(null);
    localStorage.removeItem('agrimap_user');
    localStorage.removeItem('agrimap_current_role');
  };

  const handleUpdateComplaintStatus = (id: string, status: ComplaintStatus, adminNote?: string) => {
    setComplaints(prev => prev.map(c => 
      c.id === id ? { ...c, status, adminNote, updatedAt: new Date().toISOString() } : c
    ));
  };

  const handleReportViolation = (report: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const newReport: Complaint = {
      ...report,
      id: `compl-${Math.random().toString(36).substr(2, 9)}`,
      status: ComplaintStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComplaints(prev => [newReport, ...prev]);
    alert('Báo cáo vi phạm của bạn đã được gửi thành công. Ban quản trị sẽ sớm xem xét và xử lý.');
  };

  const handleStartNegotiation = (product: FarmProduct, sessionId?: string) => {
    if (sessionId) {
      setActiveSessionId(sessionId);
      setSelectedProductForChat(product);
      setIsChatOpen(true);
      return;
    }

    const currentUserId = user?.id || 'guest';

    // Check if session already exists for this product and the current user
    const existingSession = negotiationSessions.find(s => 
      s.productId === product.id && 
      (s.buyerId === currentUserId || s.farmerId === currentUserId)
    );
    
    if (existingSession) {
      setActiveSessionId(existingSession.id);
    } else {
      // Create new session
      // If it's a farmer clicking their own product, they are probably looking for messages
      // But if no session exists, we normally don't let them start one with themselves
      // EXCEPT if they are in the E-Contract view and want to chat with a buyer of an order
      
      if (user?.role === UserRole.BUYER || !user) {
        const farmerName = product.farmerName || 'Nông dân';
        const newSession: NegotiationSession = {
          id: `session-${Math.random().toString(36).substr(2, 9)}`,
          buyerId: currentUserId,
          buyerName: getUserDisplayName(user),
          farmerId: product.farmerId,
          farmerName: farmerName,
          productId: product.id,
          productName: product.name,
          messages: [
            {
              id: `msg-welcome-${Date.now()}`,
              senderId: 'system',
              senderName: 'Hệ thống AgriMap',
              senderRole: UserRole.ADMIN,
              text: `Chào mừng bạn đến với cuộc thương thảo cho sản phẩm "${product.name}". Cuộc trò chuyện này được bảo mật và theo dõi bởi AgriMap để đảm bảo quyền lợi cho cả hai bên.`,
              timestamp: new Date().toISOString()
            }
          ],
          status: 'OPEN'
        };
        setNegotiationSessions(prev => [...prev, newSession]);
        setActiveSessionId(newSession.id);
      }
    }
    
    setSelectedProductForChat(product);
    setIsChatOpen(true);
  };

  const [notifications, setNotifications] = useState<{id: string, text: string}[]>([]);

  const addNotification = (text: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { id, text }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleSendMessage = (text: string) => {
    if (!activeSessionId || !user) return;
    
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: getUserDisplayName(user),
      senderRole: user.role,
      text,
      timestamp: new Date().toISOString()
    };

    setNegotiationSessions(prev => prev.map(session => {
      if (session.id === activeSessionId) {
        return {
          ...session,
          messages: [...session.messages, newMessage]
        };
      }
      return session;
    }));

    // Local confirmation
    addNotification("Tin nhắn đã được gửi");
  };

  const handleProposeContract = (sessionId: string) => {
    const session = negotiationSessions.find(s => s.id === sessionId);
    if (!session || !user) return;

    const product = products.find(p => p.id === session.productId);
    if (!product) return;

    // Create a new order with status 'Đang soạn thảo'
    const newOrder: Order = {
      id: `ORD-PROPOSED-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      items: [product],
      total: (product.price || 16000) * (product.expectedYield || 100),
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Đang soạn thảo',
      contractNumber: `CONT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      contractDate: new Date().toLocaleDateString('vi-VN'),
      buyerName: session.buyerName,
      buyerPhone: '0901234567', // Mock phone
      quantity: product.expectedYield || 100,
      sessionId: sessionId,
      deliveryTimeline: [
        { status: 'draft', label: 'Hợp đồng đang được soạn thảo', completed: true, timestamp: new Date().toLocaleString('vi-VN') },
        { status: 'proposed', label: 'Chờ gửi đề xuất cho nhà vườn', completed: false },
        { status: 'signed', label: 'Chờ ký kết', completed: false }
      ],
      depositPaid: false,
      depositAmount: 0
    };

    setOrders(prev => [newOrder, ...prev]);
    setProposedOrderId(newOrder.id);
    
    // No system message yet, wait for confirmation
    
    addNotification("Bản thảo hợp đồng đã được khởi tạo!");
    
    if (user.role === UserRole.FARMER) {
      setFarmerTab('home'); 
    } else if (user.role === UserRole.BUYER) {
      setCustomerTab('e-contract-agreement');
    }
  };

  const handleConfirmProposedOrder = (order: Order) => {
    if (!order.sessionId) return;
    
    const systemMsg: ChatMessage = {
      id: `msg-system-confirm-${Date.now()}`,
      senderId: 'system',
      senderName: 'Hệ thống AgriMap',
      senderRole: UserRole.ADMIN,
      text: `Hợp đồng điện tử ${order.id} đã được gửi cho nhà vườn. Nhà vườn vui lòng kiểm tra và thực hiện ký kết tại mục "Hộp thư" hoặc "Đơn hàng".`,
      timestamp: new Date().toISOString()
    };

    setNegotiationSessions(prev => prev.map(s => {
      if (s.id === order.sessionId) {
        return {
          ...s,
          status: 'CONTRACT_PROPOSED',
          messages: [...s.messages, systemMsg]
        };
      }
      return s;
    }));

    addNotification("Bản ký kết đã được gửi tới nhà vườn!");
  };

  const handleDeleteNegotiation = (sessionId: string) => {
    const session = negotiationSessions.find(s => s.id === sessionId);
    if (!session) return;

    // Add a system message notifying both parties
    const deleterName = user?.role === UserRole.FARMER ? (user as FarmerUser).representative : (user as any).fullName;
    const systemMsg: ChatMessage = {
      id: `msg-system-delete-${Date.now()}`,
      senderId: 'system',
      senderName: 'Hệ thống AgriMap',
      senderRole: UserRole.ADMIN,
      text: `Cuộc hội thoại này đã bị đóng bởi ${deleterName}.`,
      timestamp: new Date().toISOString()
    };

    setNegotiationSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          status: 'CLOSED',
          messages: [...s.messages, systemMsg]
        };
      }
      return s;
    }));

    addNotification("Đã hủy cuộc hội thoại thành công!");
  };

  const activeSession = useMemo(() => 
    negotiationSessions.find(s => s.id === activeSessionId) || null
  , [negotiationSessions, activeSessionId]);

  if (!user) {
    return <AuthScreen onLogin={handleAuthSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white font-sans">
      {/* Admins use integrated dashboard header instead of global Navbar */}
      
      <main className="flex-1 relative flex overflow-hidden">
        {user.role === UserRole.FARMER && (
          <div className="flex-1 flex flex-col h-full bg-slate-50">
            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-48">
              {farmerTab === 'home' && (
                <FarmerDashboard 
                  key="home"
                  user={user as FarmerUser}
                  products={products.filter(p => p.farmerId === user.id || p.farmerId === 'f_current')} 
                  onViewPortal={() => setFarmerTab('register')} 
                  onNavigate={(tab) => setFarmerTab(tab)}
                  initialView="dashboard"
                  orders={orders}
                  setOrders={setOrders}
                  onLogout={handleLogout}
                  onReportViolation={handleReportViolation}
                  onStartNegotiation={handleStartNegotiation}
                  negotiationSessions={negotiationSessions}
                  activeSessionId={activeSessionId}
                  setActiveSessionId={setActiveSessionId}
                  onSendMessage={handleSendMessage}
                  onDeleteNegotiation={handleDeleteNegotiation}
                  proposedOrderId={proposedOrderId}
                  onClearProposedOrder={() => setProposedOrderId(null)}
                  onProposeContract={() => {
                    if (activeSessionId) {
                      handleProposeContract(activeSessionId);
                    }
                  }}
                />
              )}
              {farmerTab === 'register' && (
                <FarmerPortal 
                  onAdd={handleAddProduct} 
                  userId={user.id}
                  userName={user.role === UserRole.FARMER ? (user as FarmerUser).farmName : getUserDisplayName(user)}
                  existingProducts={products.filter(p => p.farmerId === user.id || p.farmerId === 'f_current')}
                  activeView="register"
                />
              )}
              {farmerTab === 'list' && (
                <FarmerDashboard 
                  key="list"
                  user={user as FarmerUser}
                  products={products.filter(p => p.farmerId === user.id || p.farmerId === 'f_current')} 
                  onViewPortal={() => setFarmerTab('register')} 
                  onNavigate={(tab) => setFarmerTab(tab)}
                  initialView="records"
                  orders={orders}
                  setOrders={setOrders}
                  onLogout={handleLogout}
                  onReportViolation={handleReportViolation}
                  onStartNegotiation={handleStartNegotiation}
                  negotiationSessions={negotiationSessions}
                  activeSessionId={activeSessionId}
                  setActiveSessionId={setActiveSessionId}
                  onSendMessage={handleSendMessage}
                  onDeleteNegotiation={handleDeleteNegotiation}
                  proposedOrderId={proposedOrderId}
                  onClearProposedOrder={() => setProposedOrderId(null)}
                  onProposeContract={() => {
                    if (activeSessionId) {
                      handleProposeContract(activeSessionId);
                    }
                  }}
                />
              )}
              {farmerTab === 'map' && (
                <div className="h-full relative">
                  <MapInterface 
                    products={filteredProducts} 
                    isFarmerView={true} 
                    onSearch={setSearchQuery} 
                    initialSearchQuery={searchQuery}
                    cart={cart}
                    setCart={setCart}
                    orders={orders}
                    setOrders={setOrders}
                    onNegotiate={handleStartNegotiation}
                  />
                </div>
              )}
              {farmerTab === 'profile' && (
                <FarmerProfile 
                  user={user as any} 
                  onLogout={handleLogout} 
                  onUpdateUser={handleUpdateUser}
                />
              )}
              {farmerTab === 'knowledge' && (
                <KnowledgeHandbook onBack={() => setFarmerTab('home')} />
              )}
              {farmerTab === 'heatmap' && (
                <AgricultureHeatmap onBack={() => setFarmerTab('home')} />
              )}
            </div>

            {/* Navigation Bar - Horizontal Rectangle Style at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-[2000] px-4 pb-4 flex justify-center">
              <nav className="bg-slate-900/95 backdrop-blur-xl border border-white/10 w-full max-w-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between px-6 py-2">
                <BottomNavItem 
                  active={farmerTab === 'home'} 
                  onClick={() => setFarmerTab('home')} 
                  icon={<Home size={22} />} 
                  label="Trang chủ" 
                />
                <BottomNavItem 
                  active={farmerTab === 'list'} 
                  onClick={() => setFarmerTab('list')} 
                  icon={<LayoutGrid size={22} />} 
                  label="Hồ sơ" 
                />
                <div className="relative -top-6">
                  <BottomNavItem 
                    active={farmerTab === 'map'} 
                    onClick={() => setFarmerTab('map')} 
                    icon={<MapIcon size={28} />} 
                    label="Bản đồ" 
                    isSpecial
                  />
                </div>
                <BottomNavItem 
                  active={farmerTab === 'knowledge'} 
                  onClick={() => setFarmerTab('knowledge')} 
                  icon={<NotebookPen size={22} />} 
                  label="Sổ tay" 
                />
                <BottomNavItem 
                  active={farmerTab === 'profile'} 
                  onClick={() => setFarmerTab('profile')} 
                  icon={<UserIcon size={22} />} 
                  label="Cá nhân" 
                />
              </nav>
            </div>
          </div>
        )}

        {user.role === UserRole.ADMIN && (
          <div className="h-full overflow-y-auto w-full bg-slate-50">
            <AdminDashboard 
              products={products} 
              onUpdateStatus={handleUpdateStatus} 
              admin={user as AdminUser}
              cart={cart}
              setCart={setCart}
              orders={orders}
              setOrders={setOrders}
              onLogout={handleLogout}
              complaints={complaints}
              onUpdateComplaint={handleUpdateComplaintStatus}
            />
          </div>
        )}

        {user.role === UserRole.BUYER && (
          <div className="h-full overflow-y-auto w-full bg-slate-50 pb-48">
            <CustomerDashboard 
              user={user as BuyerUser}
              products={products}
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
              cart={cart}
              setCart={setCart}
              orders={orders}
              setOrders={setOrders}
              onReportViolation={handleReportViolation}
              onStartNegotiation={handleStartNegotiation}
              negotiationSessions={negotiationSessions}
              activeSessionId={activeSessionId}
              setActiveSessionId={setActiveSessionId}
              onSendMessage={handleSendMessage}
              onDeleteNegotiation={handleDeleteNegotiation}
              activeTabProp={customerTab}
              onTabChange={setCustomerTab}
              proposedOrderId={proposedOrderId}
              onClearProposedOrder={() => setProposedOrderId(null)}
              onConfirmProposedOrder={handleConfirmProposedOrder}
              onProposeContract={() => {
                if (activeSessionId) {
                  handleProposeContract(activeSessionId);
                }
              }}
            />
          </div>
        )}
      </main>

      <WeatherModal 
        isOpen={isWeatherOpen} 
        onClose={() => setIsWeatherOpen(false)} 
      />

      <NegotiationChat 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={user}
        product={selectedProductForChat}
        session={activeSession}
        onSendMessage={handleSendMessage}
        onProposeContract={() => {
          if (activeSessionId) {
            handleProposeContract(activeSessionId);
            setIsChatOpen(false);
          }
        }}
      />

      {/* Notifications Overlay */}
      <div className="fixed top-24 right-6 z-[5000] space-y-4 pointer-events-none">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 20 }}
              className="bg-black text-white p-4 rounded-2xl border-4 border-amber-500 shadow-xl pointer-events-auto flex items-center gap-3 min-w-[280px]"
            >
              <div className="bg-amber-500 p-2 rounded-xl">
                <MessageSquare size={18} />
              </div>
              <p className="font-black text-xs uppercase tracking-tight">{n.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const BottomNavItem = ({ active, onClick, icon, label, isSpecial = false }: any) => {
  const IconComponent = () => {
    if (isSpecial) {
      return (
        <motion.div 
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.9 }}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all ${active ? 'bg-emerald-500 text-white shadow-emerald-500/40' : 'bg-white text-slate-900 hover:bg-emerald-50'}`}
        >
          {icon}
        </motion.div>
      );
    }
    return (
      <motion.div 
        whileHover={{ y: -2 }}
        className={`p-2 rounded-xl transition-all flex flex-col items-center gap-1.5 ${active ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 group-hover:text-slate-200'}`}
      >
        {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
        <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
          {label}
        </span>
      </motion.div>
    );
  };

  return (
    <button 
      onClick={onClick}
      className="group flex flex-col items-center transition-all"
    >
      <IconComponent />
    </button>
  );
};

export default App;
