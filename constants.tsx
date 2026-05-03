
import { FarmProduct, ProductStatus, CertType, Crop, PestDisease, MarketProduct, MarketPrice, SupplyData, MarketWeatherData, MarketTransaction, GrowingArea } from './types';

export const APP_LOGO = "https://files.oaiusercontent.com/file-4n4R7H3vM2L8v2W6g6X6p6f1?se=2026-04-17T14%3A22%3A02Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D604800%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3D6971932f-488b-491c-a496-d8fcbce61937.webp&sig=P6p7q7r7s7t7u7v7w7x7y7z7a7b7c7d7e7f7g7h7i7j7k7l7m7n%3D";

export const CATEGORIES = [
  'Trái cây',
  'Lúa gạo',
  'Rau củ',
  'Cà phê/Hồ tiêu'
];

export const MOCK_PESTS_BAP_CAI: PestDisease[] = [
  {
    id: 'p1',
    name: 'Sâu tơ',
    scientificName: 'Plutella xylostella',
    category: 'Sâu bọ',
    type: 'pest',
    imageUrl: 'https://picsum.photos/seed/pest1/200',
    isDangerous: true,
    stages: ['Cây con', 'Phát triển'],
    seasons: ['Đông Xuân']
  },
  {
    id: 'p2',
    name: 'Sâu xanh bướm trắng',
    scientificName: 'Pieris brassicae',
    category: 'Sâu bọ',
    type: 'pest',
    imageUrl: 'https://picsum.photos/seed/pest2/200',
    isDangerous: true,
    stages: ['Phát triển'],
    seasons: ['Đông Xuân']
  },
  {
    id: 'p3',
    name: 'Bọ nhảy',
    scientificName: 'Chrysomelidae',
    category: 'Sâu bọ',
    type: 'pest',
    imageUrl: 'https://picsum.photos/seed/pest3/200',
    isDangerous: true,
    stages: ['Cây con'],
    seasons: ['Quanh năm']
  },
  {
    id: 'd1',
    name: 'Bệnh cháy lá',
    scientificName: 'Xanthomonas campestris pv. campestris',
    category: 'Vi khuẩn',
    type: 'disease',
    imageUrl: 'https://picsum.photos/seed/disease1/200',
    isDangerous: true,
    stages: ['Phát triển', 'Thu hoạch'],
    seasons: ['Mùa mưa']
  },
  {
    id: 'd2',
    name: 'Bệnh thối nhũn',
    scientificName: 'Pectobacterium carotovorum',
    category: 'Vi khuẩn',
    type: 'disease',
    imageUrl: 'https://picsum.photos/seed/disease2/200',
    isDangerous: true,
    stages: ['Thu hoạch'],
    seasons: ['Mùa mưa']
  }
];

export const MOCK_CROPS: Crop[] = [
  {
    id: 'c1',
    name: 'Bắp cải',
    icon: '🥬',
    category: 'Rau quả',
    pestsAndDiseases: MOCK_PESTS_BAP_CAI
  },
  {
    id: 'c2',
    name: 'Cà chua',
    icon: '🍅',
    category: 'Rau quả',
    pestsAndDiseases: []
  },
  {
    id: 'c3',
    name: 'Cà rốt',
    icon: '🥕',
    category: 'Rau quả',
    pestsAndDiseases: []
  },
  {
    id: 'c4',
    name: 'Cải xanh',
    icon: '🥬',
    category: 'Rau quả',
    pestsAndDiseases: []
  },
  {
    id: 'c5',
    name: 'Cam',
    icon: '🍊',
    category: 'Rau quả',
    pestsAndDiseases: []
  },
  {
    id: 'c6',
    name: 'Cát tường',
    icon: '🌸',
    category: 'Hoa',
    pestsAndDiseases: []
  },
  {
    id: 'c7',
    name: 'Dạ yến thảo',
    icon: '🌺',
    category: 'Hoa',
    pestsAndDiseases: []
  },
  {
    id: 'c8',
    name: 'Dưa chuột',
    icon: '🥒',
    category: 'Rau quả',
    pestsAndDiseases: []
  },
  {
    id: 'c9',
    name: 'Dưa lưới',
    icon: '🍈',
    category: 'Rau quả',
    pestsAndDiseases: []
  }
];

export const MOCK_PRODUCTS: FarmProduct[] = [
  {
    id: '1',
    farmerId: 'F-DEMO',
    farmerName: 'HTX Bến Tre Công Nghệ Cao',
    name: 'Bưởi Da Xanh Bến Tre',
    variety: 'Da Xanh Ruột Hồng',
    category: 'Trái cây',
    area: 12.5,
    expectedYield: 50,
    description: 'Bưởi da xanh Bến Tre nổi tiếng với vị ngọt thanh, tép bưởi hồng, mọng nước. Quy trình canh tác hữu cơ nghiêm ngặt.',
    harvestMonths: [8, 9, 10, 11, 12],
    images: {
      orchard: ['https://images.unsplash.com/photo-1636244537752-6f29df5ec15c?q=80&w=1000&auto=format&fit=crop'],
      product: ['https://images.unsplash.com/photo-1596541249704-bc5584852b75?q=80&w=1000&auto=format&fit=crop'],
      warehouse: ['https://images.unsplash.com/photo-1592394533824-3f86e3f0525d?q=80&w=1000&auto=format&fit=crop'],
    },
    certificates: [{ type: CertType.VIETGAP, proofUrl: 'pdf1', issueDate: '2023-05-10', expiryDate: '2025-05-10' }],
    regionCode: 'VN-BTE-PUC-001',
    location: { lat: 10.2435, lng: 106.3756, address: 'Châu Thành, Bến Tre' },
    status: ProductStatus.COMPLETED,
    statusHistory: [
      { status: ProductStatus.COMPLETED, timestamp: '2023-10-10T14:00:00Z' }
    ],
    contact: '0901234567',
    rating: 4.8,
    timeline: [],
    updatedAt: '2023-10-25'
  },
  {
    id: '2',
    farmerId: 'F-DEMO',
    farmerName: 'Nguyễn Văn An',
    name: 'Xoài Cát Hòa Lộc',
    variety: 'Hòa Lộc',
    category: 'Trái cây',
    area: 2.5,
    expectedYield: 15,
    description: 'Xoài Cát Hòa Lộc đặc sản Tiền Giang, thịt dày, thơm nồng, vị ngọt lịm đặc trưng không đâu có được.',
    harvestMonths: [4, 5, 6],
    images: {
      orchard: ['https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=1000&auto=format&fit=crop'],
      product: ['https://images.unsplash.com/photo-1591073113125-e46713c829ed?q=80&w=1000&auto=format&fit=crop'],
      warehouse: ['https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=1000&auto=format&fit=crop']
    },
    certificates: [
      { type: CertType.VIETGAP, proofUrl: 'https://picsum.photos/seed/cert1/600/800', issueDate: '2023-01-01', expiryDate: '2025-01-01' }
    ],
    regionCode: 'VN-TG-PUC-002',
    location: { lat: 10.35, lng: 106.36, address: 'Cái Bè, Tiền Giang' },
    status: ProductStatus.COMPLETED,
    statusHistory: [
      { status: ProductStatus.COMPLETED, timestamp: '2024-05-18T14:00:00Z' }
    ],
    contact: '0901234567',
    rating: 4.9,
    timeline: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    farmerId: 'F-DEMO',
    farmerName: 'Trần Thị B',
    name: 'Thanh Long Ruột Đỏ',
    variety: 'LĐ1',
    category: 'Trái cây',
    area: 1.8,
    expectedYield: 20,
    description: 'Thanh long ruột đỏ Bình Thuận, giàu chất dinh dưỡng, vỏ đỏ bóng mượt, tai quả xanh cứng cực đẹp.',
    harvestMonths: [5, 6, 7, 8, 9],
    images: {
      orchard: ['https://images.unsplash.com/photo-1527324688151-0e627063f2b1?q=80&w=1000&auto=format&fit=crop'],
      product: ['https://images.unsplash.com/photo-1559181567-c3190cb9959b?q=80&w=1000&auto=format&fit=crop'],
      warehouse: ['https://images.unsplash.com/photo-1628102422204-6f17e3f44372?q=80&w=1000&auto=format&fit=crop']
    },
    certificates: [
      { type: CertType.GLOBALGAP, proofUrl: 'https://picsum.photos/seed/cert2/600/800', issueDate: '2023-06-01', expiryDate: '2025-06-01' }
    ],
    regionCode: 'VN-BT-PUC-003',
    location: { lat: 10.93, lng: 108.10, address: 'Hàm Thuận Nam, Bình Thuận' },
    status: ProductStatus.COMPLETED,
    statusHistory: [
      { status: ProductStatus.COMPLETED, timestamp: '2024-05-20T14:00:00Z' }
    ],
    contact: '0912345678',
    rating: 4.7,
    timeline: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    farmerId: 'F-DEMO',
    farmerName: 'Lê Văn C',
    name: 'Cam Sành Vĩnh Long',
    variety: 'Cam Sành',
    category: 'Trái cây',
    area: 3.0,
    expectedYield: 40,
    description: 'Cam sành Vĩnh Long mọng nước, vị chua ngọt hài hòa, vỏ dày sần sùi đặc trưng mang đậm phong vị miền Tây.',
    harvestMonths: [10, 11, 12, 1],
    images: {
      orchard: ['https://images.unsplash.com/photo-1547514701-42782101795e?q=80&w=1000&auto=format&fit=crop'],
      product: ['https://images.unsplash.com/photo-1557800636-8db09a93073a?q=80&w=1000&auto=format&fit=crop'],
      warehouse: ['https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?q=80&w=1000&auto=format&fit=crop']
    },
    certificates: [
      { type: CertType.OCOP, proofUrl: 'https://picsum.photos/seed/cert3/600/800', issueDate: '2023-03-01', expiryDate: '2026-03-01' }
    ],
    regionCode: 'VN-VL-PUC-004',
    location: { lat: 10.25, lng: 105.97, address: 'Tam Bình, Vĩnh Long' },
    status: ProductStatus.COMPLETED,
    statusHistory: [
      { status: ProductStatus.COMPLETED, timestamp: '2024-05-22T14:00:00Z' }
    ],
    contact: '0923456789',
    rating: 4.6,
    timeline: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: '5',
    farmerId: 'F-DEMO',
    farmerName: 'Nguyễn Văn G',
    name: 'Sầu Riêng Ri6',
    variety: 'Ri6',
    category: 'Trái cây',
    area: 2.0,
    expectedYield: 40,
    description: 'Sầu riêng Ri6 cơm vàng, hạt lép, mùi hương quyến rũ, độ béo cao, đạt chuẩn xuất khẩu.',
    harvestMonths: [5, 6, 7],
    images: {
      orchard: ['https://images.unsplash.com/photo-1557800636-8db09a93073a?q=80&w=1000&auto=format&fit=crop'],
      product: ['https://images.unsplash.com/photo-1490885578174-acda8905c2c6?q=80&w=1000&auto=format&fit=crop'],
      warehouse: ['https://images.unsplash.com/photo-1557800609-b687f82701f2?q=80&w=1000&auto=format&fit=crop']
    },
    certificates: [
      { type: CertType.VIETGAP, proofUrl: 'https://picsum.photos/seed/cert4/600/800', issueDate: '2023-01-01', expiryDate: '2025-01-01' }
    ],
    regionCode: 'VN-TG-PUC-005',
    location: { lat: 10.380, lng: 106.40, address: 'Mỹ Tho, Tiền Giang' },
    status: ProductStatus.COMPLETED,
    statusHistory: [
      { status: ProductStatus.COMPLETED, timestamp: '2024-05-24T14:00:00Z' }
    ],
    contact: '0901234567',
    rating: 4.9,
    timeline: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: '6',
    farmerId: 'F-DEMO',
    farmerName: 'Trần Thị H',
    name: 'Táo Ninh Thuận',
    variety: 'Táo Xanh',
    category: 'Trái cây',
    area: 2.0,
    expectedYield: 30,
    description: 'Táo xanh Ninh Thuận giòn ngọt, giàu vitamin, được ví như "nho xanh" của vùng đất Phan Rang.',
    harvestMonths: [11, 12, 1],
    images: {
      orchard: ['https://images.unsplash.com/photo-1517431260214-e1d1fc4ac697?q=80&w=1000&auto=format&fit=crop'],
      product: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=1000&auto=format&fit=crop'],
      warehouse: ['https://images.unsplash.com/photo-1555037015-1498966bcd7c?q=80&w=1000&auto=format&fit=crop']
    },
    certificates: [{ type: CertType.VIETGAP, proofUrl: 'pdf apple', issueDate: '2023-01-01', expiryDate: '2025-01-01' }],
    regionCode: 'VN-NT-PUC-006',
    location: { lat: 11.56, lng: 108.99, address: 'Phan Rang, Ninh Thuận' },
    status: ProductStatus.COMPLETED,
    statusHistory: [
      { status: ProductStatus.COMPLETED, timestamp: '2024-06-01T08:00:00Z' }
    ],
    contact: '0934567890',
    rating: 4.8,
    timeline: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: '7',
    farmerId: 'F-DEMO',
    farmerName: 'Hoàng Văn E',
    name: 'Dứa Cầu Đúc',
    variety: 'Dứa Queen',
    category: 'Trái cây',
    area: 5.0,
    expectedYield: 80,
    description: 'Dứa Cầu Đúc Hậu Giang, nổi tiếng ngọt thanh, không xơ, mang đậm hương vị phù sa sông Hậu.',
    harvestMonths: [6, 7],
    images: {
      orchard: ['https://images.unsplash.com/photo-1550258114-68bd2950568c?q=80&w=1000&auto=format&fit=crop'],
      product: ['https://images.unsplash.com/photo-1589135403527-dfc5bbbb8a1d?q=80&w=1000&auto=format&fit=crop'],
      warehouse: ['https://images.unsplash.com/photo-1590080875515-8a3d8d5df4b2?q=80&w=1000&auto=format&fit=crop']
    },
    certificates: [
      { type: CertType.OCOP, proofUrl: 'https://picsum.photos/seed/cert5/600/800', issueDate: '2023-05-01', expiryDate: '2025-05-01' }
    ],
    regionCode: 'VN-HG-PUC-007',
    location: { lat: 9.78, lng: 105.47, address: 'Vị Thanh, Hậu Giang' },
    status: ProductStatus.COMPLETED,
    statusHistory: [
      { status: ProductStatus.COMPLETED, timestamp: '2024-06-10T10:00:00Z' }
    ],
    contact: '0945678901',
    rating: 4.7,
    timeline: [],
    updatedAt: new Date().toISOString()
  },
  {
    id: '8',
    farmerId: 'F-DEMO',
    farmerName: 'Lý Văn K',
    name: 'Gạo ST25 Sóc Trăng',
    variety: 'ST25',
    category: 'Lúa gạo',
    area: 20.0,
    expectedYield: 150,
    description: 'Gạo ST25 - Gạo ngon nhất thế giới, hạt gạo dài, trắng trong, cơm dẻo, thơm mùi lá dứa tự nhiên.',
    harvestMonths: [11, 12],
    images: {
      orchard: ['https://images.unsplash.com/photo-1586201327102-33008155c06a?q=80&w=1000&auto=format&fit=crop'],
      product: ['https://images.unsplash.com/photo-1526318896980-cf78c088247c?q=80&w=1000&auto=format&fit=crop'],
      warehouse: ['https://images.unsplash.com/photo-1534063297072-bc2ef6530663?q=80&w=1000&auto=format&fit=crop']
    },
    certificates: [{ type: CertType.ORGANIC, proofUrl: 'pdf rice', issueDate: '2023-01-01', expiryDate: '2026-01-01' }],
    regionCode: 'VN-ST-PUC-008',
    location: { lat: 9.60, lng: 105.97, address: 'Trần Đề, Sóc Trăng' },
    status: ProductStatus.COMPLETED,
    statusHistory: [
      { status: ProductStatus.COMPLETED, timestamp: '2024-06-15T08:00:00Z' }
    ],
    contact: '0987654321',
    rating: 5.0,
    timeline: [],
    updatedAt: new Date().toISOString()
  }
];

export const VIETNAM_PROVINCES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cần Thơ", "Cao Bằng", "Đà Nẵng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh", "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
];

export const MOCK_MARKET_PRODUCTS: MarketProduct[] = [
  {
    product_id: 'xoai_cat_chu',
    name: 'Xoài Cát Chu',
    category: 'Trái cây',
    unit: 'kg',
    season_start: '2026-03',
    season_end: '2026-06',
    image: 'https://picsum.photos/seed/xoai/400'
  },
  {
    product_id: 'buoi_da_xanh',
    name: 'Bưởi Da Xanh',
    category: 'Trái cây',
    unit: 'kg',
    season_start: '2026-01',
    season_end: '2026-12',
    image: 'https://picsum.photos/seed/buoi/400'
  },
  {
    product_id: 'thanh_long',
    name: 'Thanh Long',
    category: 'Trái cây',
    unit: 'kg',
    season_start: '2026-05',
    season_end: '2026-10',
    image: 'https://picsum.photos/seed/thanhlong/400'
  }
];

// Helper to generate price history
const generatePriceHistory = (productId: string, province: string, basePrice: number, days: number): MarketPrice[] => {
  const history: MarketPrice[] = [];
  const today = new Date('2026-04-17');
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const volBase = 10000 + Math.random() * 5000;
    const priceChange = (Math.sin(i / 5) * 2000) + (Math.random() * 1000 - 500);
    const avg = basePrice + priceChange;
    history.push({
      product_id: productId,
      province,
      date: dateStr,
      avg_price: Math.round(avg),
      min_price: Math.round(avg * 0.9),
      max_price: Math.round(avg * 1.1),
      volume: Math.round(volBase)
    });
  }
  return history;
};

export const MOCK_MARKET_PRICES: MarketPrice[] = [
  ...generatePriceHistory('xoai_cat_chu', 'Tiền Giang', 25000, 30),
  ...generatePriceHistory('xoai_cat_chu', 'Đồng Tháp', 24000, 30),
  ...generatePriceHistory('buoi_da_xanh', 'Bến Tre', 45000, 30),
  ...generatePriceHistory('buoi_da_xanh', 'Vĩnh Long', 43000, 30),
  ...generatePriceHistory('thanh_long', 'Bình Thuận', 15000, 30),
  ...generatePriceHistory('thanh_long', 'Long An', 14500, 30),
];

export const MOCK_SUPPLY_DATA: SupplyData[] = [
  {
    product_id: 'xoai_cat_chu',
    province: 'Đồng Tháp',
    date: '2026-04-17',
    estimated_yield: 50000,
    harvest_stage: 'mid',
    supply_level: 'high'
  },
  {
    product_id: 'xoai_cat_chu',
    province: 'Tiền Giang',
    date: '2026-04-17',
    estimated_yield: 30000,
    harvest_stage: 'mid',
    supply_level: 'medium'
  },
  {
    product_id: 'buoi_da_xanh',
    province: 'Bến Tre',
    date: '2026-04-17',
    estimated_yield: 100000,
    harvest_stage: 'mid',
    supply_level: 'high'
  }
];

export const MOCK_MARKET_WEATHER: MarketWeatherData[] = [
  {
    province: 'Đồng Tháp',
    date: '2026-04-17',
    rainfall: 20,
    temperature: 32,
    extreme_event: false
  },
  {
    province: 'Tiền Giang',
    date: '2026-04-17',
    rainfall: 5,
    temperature: 34,
    extreme_event: false
  },
  {
    province: 'Bình Thuận',
    date: '2026-04-17',
    rainfall: 0,
    temperature: 36,
    extreme_event: true
  }
];

export const MOCK_MARKET_TRANSACTIONS: MarketTransaction[] = [
  {
    product_id: 'xoai_cat_chu',
    province: 'Tiền Giang',
    date: '2026-04-17',
    price: 25500,
    quantity: 2000,
    buyer_id: 'B001'
  },
  {
    product_id: 'xoai_cat_chu',
    province: 'Đồng Tháp',
    date: '2026-04-17',
    price: 23500,
    quantity: 5000,
    buyer_id: 'B002'
  }
];

export const MOCK_GROWING_AREAS: GrowingArea[] = [
  {
    id: 'ga1',
    product_id: 'xoai_cat_chu',
    province: 'Đồng Tháp',
    area_name: 'Vùng xoài Cao Lãnh',
    lat: 10.46,
    lng: 105.63,
    status: 'harvesting',
    expected_yield: 12000,
    harvest_date: '2026-04-20'
  },
  {
    id: 'ga2',
    product_id: 'xoai_cat_chu',
    province: 'Tiền Giang',
    area_name: 'Vùng xoài Cái Bè',
    lat: 10.34,
    lng: 105.97,
    status: 'harvesting',
    expected_yield: 8000,
    harvest_date: '2026-04-22'
  },
  {
    id: 'ga3',
    product_id: 'buoi_da_xanh',
    province: 'Bến Tre',
    area_name: 'Hợp tác xã Bưởi Châu Thành',
    lat: 10.27,
    lng: 106.37,
    status: 'growing',
    expected_yield: 25000,
    harvest_date: '2026-05-15'
  },
  {
    id: 'ga4',
    product_id: 'thanh_long',
    province: 'Bình Thuận',
    area_name: 'Trang trại Thanh Long Phan Thiết',
    lat: 10.93,
    lng: 108.10,
    status: 'preparing',
    expected_yield: 40000,
    harvest_date: '2026-05-10'
  }
];

export const MOCK_COMPLAINTS: any[] = [
  {
    id: 'comp-001',
    type: 'REGISTRATION',
    title: 'Khiếu nại kết quả xét duyệt vùng trồng',
    description: 'Tôi đã cung cấp đầy đủ chứng chỉ OCOP 4 sao nhưng hồ sơ vẫn bị báo là thiếu chứng từ. Đề nghị xem xét lại.',
    fromUserId: 'f2',
    fromUserName: 'Nguyễn Văn A',
    targetId: '2',
    targetName: 'Xoài Cát Hòa Lộc',
    status: 'Chờ xử lý',
    createdAt: '2024-04-18T10:00:00Z',
    updatedAt: '2024-04-18T10:00:00Z',
    evidence: ['https://picsum.photos/seed/ev1/600/800']
  },
  {
    id: 'viol-001',
    type: 'TRANSACTION_VIOLATION',
    title: 'Tố cáo vi phạm hợp đồng vận chuyển',
    description: 'Bên mua không thanh toán phần cọc còn lại đúng hạn như cam kết trong hợp đồng mặc dù hàng đã được chuẩn bị xong.',
    fromUserId: 'f1',
    fromUserName: 'HTX Bến Tre Công Nghệ Cao',
    targetId: 'ORD-123456',
    targetName: 'Đơn hàng ORD-123456',
    status: 'Đang xử lý',
    createdAt: '2024-04-19T14:30:00Z',
    updatedAt: '2024-04-20T09:15:00Z',
    adminNote: 'Đã liên hệ với bên mua để xác minh thông tin.',
    evidence: ['https://picsum.photos/seed/ev2/600/400']
  },
  {
    id: 'viol-002',
    type: 'TRANSACTION_VIOLATION',
    title: 'Khiếu nại chất lượng hàng hóa không đúng mô tả',
    description: 'Hàng nhận được có tỷ lệ dập nát cao (>30%), không đúng với cam kết trong bộ tiêu chuẩn kỹ thuật đính kèm hợp đồng.',
    fromUserId: 'b1',
    fromUserName: 'Công ty TNHH BigMart VN',
    targetId: 'ORD-789012',
    targetName: 'Đơn hàng ORD-789012',
    status: 'Chờ xử lý',
    createdAt: '2024-04-21T08:00:00Z',
    updatedAt: '2024-04-21T08:00:00Z',
    evidence: ['https://picsum.photos/seed/ev3/600/400', 'https://picsum.photos/seed/ev4/600/400']
  }
];
