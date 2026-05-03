
export enum UserRole {
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN'
}

export enum ProductStatus {
  NEW = 'Mới đăng ký',
  PENDING = 'Chờ xét duyệt',
  REVIEWING = 'Đang duyệt',
  COMPLETED = 'Xét duyệt xong',
  REJECTED = 'Từ chối'
}

export enum AdminLevel {
  COMMUNE = 'Cấp Xã/Phường',
  DISTRICT = 'Cấp Quận/Huyện',
  PROVINCE = 'Cấp Tỉnh/Thành phố',
  CENTRAL = 'Cấp Trung ương'
}

export interface FarmerUser {
  id: string;
  role: UserRole.FARMER;
  farmName: string;
  representative: string;
  cccd: string;
  phone: string;
  address: {
    province: string;
    district: string;
    commune: string;
    detail: string;
  };
  location: {
    lat: number;
    lng: number;
  } | null;
}

export interface AdminUser {
  id: string;
  role: UserRole.ADMIN;
  fullName: string;
  adminId: string;
  position: string;
  unit: string; // Đơn vị công tác (Sở/Bộ/Phòng)
  level: AdminLevel;
  assignedArea: string; // Địa bàn phụ trách
  username: string;
  email: string; // Đuôi .gov.vn
  phone: string;
  status: 'ACTIVE' | 'LOCKED' | 'DISABLED';
}

export interface BuyerUser {
  id: string;
  role: UserRole.BUYER;
  fullName: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  avatar?: string;
  status: 'ACTIVE' | 'LOCKED';
}

export type User = FarmerUser | AdminUser | BuyerUser | null;

export enum CertType {
  VIETGAP = 'VietGAP',
  GLOBALGAP = 'GlobalGAP',
  OCOP = 'OCOP',
  ORGANIC = 'Hữu cơ'
}

export interface FarmLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface FarmingTimelineUpdate {
  id: string;
  date: string;
  stage: string;
  description: string;
  imageUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  adminId: string;
  action: string;
  targetId: string;
  targetName: string;
  details?: string;
}

export interface StatusHistory {
  status: ProductStatus;
  timestamp: string;
  note?: string;
}

export interface FarmProduct {
  id: string;
  farmerId: string;
  farmerName: string;
  name: string;
  variety: string;
  category: string;
  area: number;
  expectedYield: number;
  description: string;
  harvestMonths: number[];
  images: {
    orchard: string[];
    product: string[];
    warehouse: string[];
  };
  certificates: {
    type: CertType;
    proofUrl: string;
    issueDate: string;
    expiryDate: string;
  }[];
  regionCode: string;
  location: FarmLocation;
  status: ProductStatus;
  statusHistory: StatusHistory[];
  contact: string;
  rating: number;
  price?: number;
  timeline: FarmingTimelineUpdate[];
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  verificationNote?: string;
}

export interface OrderTimeline {
  status: string;
  label: string;
  timestamp?: string;
  completed: boolean;
  photos?: string[];
  details?: string;
}

export interface Order {
  id: string;
  items: FarmProduct[];
  total: number;
  date: string;
  status: string;
  contractNumber?: string;
  contractDate?: string;
  buyerName?: string;
  buyerAddress?: string;
  buyerPhone?: string;
  negotiationNote?: string;
  deliveryTimeline?: OrderTimeline[];
  depositPaid?: boolean;
  depositAmount?: number;
  quantity?: number;
  sessionId?: string;
}

export interface AppNotification {
  id: string;
  type: 'order_status' | 'contract_signed' | 'payment_success' | 'delivery_update' | 'market_alert';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  relatedId?: string;
  actionLabel?: string;
}

export interface MarketProduct {
  product_id: string;
  name: string;
  category: string;
  unit: string;
  season_start: string; // YYYY-MM
  season_end: string;   // YYYY-MM
  image?: string;
}

export interface MarketPrice {
  product_id: string;
  province: string;
  date: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  volume: number;
}

export interface SupplyData {
  product_id: string;
  province: string;
  date: string;
  estimated_yield: number;
  harvest_stage: 'early' | 'mid' | 'late';
  supply_level: 'low' | 'medium' | 'high';
}

export interface MarketWeatherData {
  province: string;
  date: string;
  rainfall: number;
  temperature: number;
  extreme_event: boolean;
}

export interface MarketTransaction {
  product_id: string;
  province: string;
  date: string;
  price: number;
  quantity: number;
  buyer_id: string;
}

export interface MarketPrediction {
  buy_score: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  predictions: {
    '3d': number;
    '7d': number;
  };
  insights: string[];
  recommendation: 'buy' | 'consider' | 'wait';
  reason: string[];
}

export interface LocationRecommendation {
  best_location: string;
  expected_price: number;
  saving: string;
  distance_km: number;
  supply_level: 'low' | 'medium' | 'high';
  price_diff: number; // percentage
  lat: number;
  lng: number;
}

export interface GrowingArea {
  id: string;
  product_id: string;
  province: string;
  area_name: string;
  lat: number;
  lng: number;
  status: 'harvesting' | 'growing' | 'preparing';
  expected_yield: number;
  harvest_date: string;
}

export interface PestDisease {
  id: string;
  name: string;
  scientificName: string;
  category: string; // e.g., "Sâu bọ", "Vi khuẩn"
  type: 'pest' | 'disease';
  imageUrl: string;
  isDangerous: boolean;
  stages?: string[];
  seasons?: string[];
}

export interface Crop {
  id: string;
  name: string;
  icon: string;
  category: string; // e.g., "Rau quả", "Cây công nghiệp"
  pestsAndDiseases: PestDisease[];
}

export interface WeatherData {
  temp: number;
  condition: string;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  locationName: string;
  forecast: {
    time: string;
    temp: number;
    icon: string;
  }[];
  dailyForecast?: {
    day: string;
    tempMax: number;
    tempMin: number;
    icon: string;
    desc: string;
  }[];
}

export interface SellingPoint {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  type: 'STORE' | 'MARKET' | 'COOPERATIVE';
  products: string[]; // List of product names or categories available here
  openingHours?: string;
  imageUrl?: string;
  rating: number;
}

export interface MarketImbalance {
  productId: string;
  productName: string;
  province: string;
  supplyVolume: number; // Tấn
  demandVolume: number; // Lượng đơn hàng/tìm kiếm
  gap: number; // % chênh lệch
  status: 'SURPLUS' | 'DEFICIT' | 'BALANCED'; // Thừa, Thiếu, Cân bằng
  recommendation: string;
}

export interface DemandTrend {
  keyword: string;
  searchCount: number;
  growthRate: number; // % change
  topRegions: string[];
}

export interface BigDataAnalytics {
  totalFarmers: number;
  totalCustomers: number;
  totalHectares: number;
  totalMarketValue: number;
  imbalances: MarketImbalance[];
  demandTrends: DemandTrend[];
  pricePredictions: {
    productId: string;
    productName: string;
    forecastedPrice: number;
    confidence: number;
  }[];
  regionalActivity: {
    province: string;
    farmerCount: number;
    customerCount: number;
    mainProduct: string;
  }[];
}

export enum ComplaintStatus {
  PENDING = 'Chờ xử lý',
  PROCESSING = 'Đang xử lý',
  RESOLVED = 'Đã giải quyết',
  REJECTED = 'Bị từ chối'
}

export type ComplaintType = 'REGISTRATION' | 'TRANSACTION_VIOLATION';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface NegotiationSession {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  productId: string;
  productName: string;
  messages: ChatMessage[];
  status: 'OPEN' | 'CLOSED' | 'CONTRACT_PROPOSED';
}

export interface Complaint {
  id: string;
  type: ComplaintType;
  title: string;
  description: string;
  fromUserId: string;
  fromUserName: string;
  targetId: string; // Product id if registration, Order id if transaction
  targetName: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
  evidence?: string[]; // URLs to images
}
