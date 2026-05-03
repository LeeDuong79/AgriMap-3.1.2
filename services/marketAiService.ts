
import { GoogleGenAI, Type } from "@google/genai";
import { 
  MarketPrediction, 
  LocationRecommendation, 
  MarketPrice, 
  SupplyData, 
  MarketWeatherData,
  MarketProduct,
  BigDataAnalytics,
  MarketImbalance,
  DemandTrend
} from "../types";
import { 
  MOCK_MARKET_PRICES, 
  MOCK_SUPPLY_DATA, 
  MOCK_MARKET_WEATHER,
  MOCK_GROWING_AREAS,
  MOCK_PRODUCTS
} from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export class MarketAiService {
  /**
   * Tổng hợp dữ liệu Big Data từ nguồn cung và nhu cầu
   */
  static async getBigDataAnalytics(): Promise<BigDataAnalytics> {
    // Giả lập dữ liệu từ hàng triệu điểm chạm
    const totalFarmers = 12450;
    const totalCustomers = 450000;
    const totalHectares = 85200;
    const totalMarketValue = 1250000000000; // 1.25 Trình đồng

    // Tính toán mất cân đối cung cầu
    const imbalances: MarketImbalance[] = [
      {
        productId: '1',
        productName: 'Bưởi Da Xanh',
        province: 'Bến Tre',
        supplyVolume: 5000,
        demandVolume: 7500,
        gap: -33,
        status: 'DEFICIT',
        recommendation: 'Cần mở rộng diện tích trồng hoặc tối ưu logistics từ các tỉnh lân cận.'
      },
      {
        productId: '5',
        productName: 'Sầu Riêng Ri6',
        province: 'Tiền Giang',
        supplyVolume: 12000,
        demandVolume: 8000,
        gap: 50,
        status: 'SURPLUS',
        recommendation: 'Nguy cơ rớt giá do thừa cung. Đẩy mạnh ký kết hợp đồng xuất khẩu sớm.'
      },
      {
        productId: '8',
        productName: 'Gạo ST25',
        province: 'Sóc Trăng',
        supplyVolume: 50000,
        demandVolume: 48000,
        gap: 4,
        status: 'BALANCED',
        recommendation: 'Thị trường ổn định. Duy trì chất lượng chuẩn Organic.'
      }
    ];

    const demandTrends: DemandTrend[] = [
      { keyword: 'Sầu riêng sạch', searchCount: 154000, growthRate: 25, topRegions: ['TP. Hồ Chí Minh', 'Hà Nội'] },
      { keyword: 'Gạo ST25 chính gốc', searchCount: 89000, growthRate: 12, topRegions: ['Đà Nẵng', 'Hải Phòng'] },
      { keyword: 'Bưởi organic', searchCount: 45000, growthRate: 45, topRegions: ['Bình Dương', 'Cần Thơ'] }
    ];

    const pricePredictions = [
      { productId: '5', productName: 'Sầu Riêng Ri6', forecastedPrice: 85000, confidence: 0.92 },
      { productId: '1', productName: 'Bưởi Da Xanh', forecastedPrice: 42000, confidence: 0.88 },
      { productId: '8', productName: 'Gạo ST25', forecastedPrice: 35000, confidence: 0.95 }
    ];

    const regionalActivity = [
      { province: 'Tiền Giang', farmerCount: 2400, customerCount: 15000, mainProduct: 'Sầu riêng' },
      { province: 'Bến Tre', farmerCount: 1800, customerCount: 8000, mainProduct: 'Bưởi' },
      { province: 'Đồng Tháp', farmerCount: 3200, customerCount: 12000, mainProduct: 'Xoài' }
    ];

    return {
      totalFarmers,
      totalCustomers,
      totalHectares,
      totalMarketValue,
      imbalances,
      demandTrends,
      pricePredictions,
      regionalActivity
    };
  }

  /**
   * Tính toán điểm mua (Buy Score) và dự báo
   */
  static async getMarketPrediction(product: MarketProduct): Promise<MarketPrediction> {
    const prices = MOCK_MARKET_PRICES.filter(p => p.product_id === product.product_id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (prices.length === 0) {
      throw new Error("Không có dữ liệu giá cho sản phẩm này");
    }

    const latestPrice = prices[0].avg_price;
    const price7DaysAgo = prices.find(p => {
      const d = new Date(prices[0].date);
      d.setDate(d.getDate() - 7);
      return p.date === d.toISOString().split('T')[0];
    })?.avg_price || latestPrice;

    const priceChangeRate = (latestPrice - price7DaysAgo) / price7DaysAgo;
    
    // Logic dự đoán đơn giản (Rule-based)
    const trend = priceChangeRate > 0.02 ? 'up' : priceChangeRate < -0.02 ? 'down' : 'stable';
    
    const supply = MOCK_SUPPLY_DATA.find(s => s.product_id === product.product_id);
    const weather = MOCK_MARKET_WEATHER.find(w => w.province === supply?.province);

    // Tính Buy Score (0-100)
    let buyScore = 50;
    if (trend === 'up') buyScore += 20;
    if (trend === 'down') buyScore -= 10;
    if (supply?.supply_level === 'low') buyScore += 15;
    if (supply?.supply_level === 'high') buyScore -= 10;
    if (weather?.extreme_event) buyScore -= 20;

    buyScore = Math.max(0, Math.min(100, buyScore));

    const recommendation = buyScore > 70 ? 'buy' : buyScore < 40 ? 'wait' : 'consider';

    // Sử dụng Gemini để lấy insights thông minh
    try {
      const prompt = `
        Dựa trên dữ liệu thị trường sau cho sản phẩm "${product.name}":
        - Giá hiện tại: ${latestPrice} ${product.unit}
        - Xu hướng giá 7 ngày: ${trend === 'up' ? 'Tăng' : trend === 'down' ? 'Giảm' : 'Ổn định'} (${(priceChangeRate * 100).toFixed(1)}%)
        - Nguồn cung: ${supply?.supply_level || 'Bình thường'} (Sản lượng ước tính: ${supply?.estimated_yield || 0} tấn)
        - Thời tiết tại vùng nguyên liệu: ${weather?.temperature}°C, ${weather?.rainfall}mm mưa, ${weather?.extreme_event ? 'Có hiện tượng cực đoan' : 'Bình thường'}
        - Điểm ưu tiên mua: ${buyScore}/100
        
        Hãy cung cấp:
        1. 3 Insight chính về thị trường (ngắn gọn, dưới 15 từ mỗi câu).
        2. 3 Lý do cụ thể cho lời khuyên "${recommendation === 'buy' ? 'NÊN MUA NGAY' : recommendation === 'wait' ? 'CHỜ ĐỢI TỐÊM' : 'CÂN NHẮC'}".
        
        Trả về định dạng JSON:
        {
          "insights": ["...", "...", "..."],
          "reasons": ["...", "...", "..."]
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              insights: { type: Type.ARRAY, items: { type: Type.STRING } },
              reasons: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      });

      const aiData = JSON.parse(response.text || "{}");

      return {
        buy_score: buyScore,
        trend,
        confidence: 0.85,
        predictions: {
          '3d': Math.round(latestPrice * (1 + priceChangeRate / 2)),
          '7d': Math.round(latestPrice * (1 + priceChangeRate))
        },
        insights: aiData.insights || ["Nguồn cung đang giảm dần", "Giá có dấu hiệu tăng nhẹ", "Nhu cầu thị trường ổn định"],
        recommendation,
        reason: aiData.reasons || ["Giá đang ở vùng hỗ trợ", "Sắp kết thúc vụ thu hoạch", "Dự báo thời tiết thuận lợi"]
      };
    } catch (error) {
      console.error("Gemini AI Error:", error);
      // Fallback
      return {
        buy_score: buyScore,
        trend,
        confidence: 0.7,
        predictions: {
          '3d': Math.round(latestPrice * 1.02),
          '7d': Math.round(latestPrice * 1.05)
        },
        insights: ["Dữ liệu lịch sử cho thấy xu hướng tích cực", "Vùng nguyên liệu đang vào chính vụ", "Chi phí vận chuyển ổn định"],
        recommendation,
        reason: ["Dựa trên biến động giá gần đây", "Phân tích cung cầu khu vực", "Số lượng giao dịch tăng"]
      };
    }
  }

  /**
   * Lấy gợi ý địa điểm mua tốt nhất
   */
  static async getLocationRecommendations(product: MarketProduct): Promise<LocationRecommendation[]> {
    const prices = MOCK_MARKET_PRICES.filter(p => p.product_id === product.product_id && p.date === '2026-04-17');
    const avgNational = prices.reduce((acc, p) => acc + p.avg_price, 0) / prices.length;

    return prices.map(p => {
      const supply = MOCK_SUPPLY_DATA.find(s => s.product_id === product.product_id && s.province === p.province);
      const growingArea = MOCK_GROWING_AREAS.find(ga => ga.product_id === product.product_id && ga.province === p.province);
      const priceDiff = (p.avg_price - avgNational) / avgNational;
      
      return {
        best_location: p.province,
        expected_price: p.avg_price,
        saving: `${Math.abs(Math.round(priceDiff * 100))}%`,
        distance_km: Math.floor(Math.random() * 200 + 50),
        supply_level: supply?.supply_level || 'medium',
        price_diff: priceDiff,
        lat: growingArea?.lat || 10.7769, // Default to HCM if not found
        lng: growingArea?.lng || 106.7009
      };
    }).sort((a, b) => a.price_diff - b.price_diff); // Ưu tiên nơi rẻ hơn
  }
}
