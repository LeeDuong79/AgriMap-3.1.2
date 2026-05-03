
import React, { useState } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { 
  Zap, Thermometer, Droplets, Sun, 
  FlaskConical, Activity, Sprout, 
  Calendar, CloudRain, ArrowLeft, 
  Loader2, Play, AlertCircle
} from 'lucide-react';

import { motion } from 'motion/react';

interface AIDiagnosisProps {
  onBack: () => void;
}

const AIDiagnosis: React.FC<AIDiagnosisProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sensorData, setSensorData] = useState({
    soilMoisture: '65',
    soilTemp: '26',
    ambientTemp: '30',
    airHumidity: '75',
    lightIntensity: '45000',
    pH: '6.2',
    ec: '1.4',
    cropType: 'Sầu riêng Ri6',
    growthStage: 'Kết trái',
    weatherForecast: 'Nắng nóng, chiều tối có mưa rào rải rác trong 3 ngày tới'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSensorData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdjust = (name: string, delta: number, isFloat: boolean = false) => {
    setSensorData(prev => {
      const val = prev[name as keyof typeof prev];
      const current = parseFloat(val);
      if (isNaN(current)) return prev;
      const next = isFloat ? (current + delta).toFixed(1) : Math.round(current + delta).toString();
      return { ...prev, [name]: next };
    });
  };

  const resetData = () => {
    setSensorData({
      soilMoisture: '65',
      soilTemp: '26',
      ambientTemp: '30',
      airHumidity: '75',
      lightIntensity: '45000',
      pH: '6.2',
      ec: '1.4',
      cropType: 'Sầu riêng Ri6',
      growthStage: 'Kết trái',
      weatherForecast: 'Nắng nóng, chiều tối có mưa rào rải rác trong 3 ngày tới'
    });
    setResult(null);
    setError(null);
  };

  const simulateData = () => {
    setSensorData({
      soilMoisture: '82',
      soilTemp: '27',
      ambientTemp: '28',
      airHumidity: '88',
      lightIntensity: '12000',
      pH: '5.8',
      ec: '1.2',
      cropType: 'Sầu riêng Ri6',
      growthStage: 'Kết trái',
      weatherForecast: 'Mưa lớn kéo dài trong 48h tới, độ ẩm cao'
    });
  };

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const systemInstruction = `Bạn là một chuyên gia dữ liệu nông nghiệp (Agri-Data Scientist) và kỹ sư hệ thống IoT. Nhiệm vụ của bạn là phân tích các chỉ số từ cảm biến thực tế để đưa ra chẩn đoán sức khỏe cây trồng và dự báo rủi ro cho trang trại.

Dữ liệu đầu vào (Context):
Tôi sẽ cung cấp cho bạn các thông số thời gian thực từ hệ thống cảm biến bao gồm:
- Độ ẩm đất (%) và Nhiệt độ đất (°C).
- Nhiệt độ môi trường (°C) và Độ ẩm không khí (%).
- Cường độ ánh sáng (Lux).
- Chỉ số pH và EC (độ dẫn điện) trong đất.
- Dữ liệu phụ: Loại cây trồng, giai đoạn sinh trưởng và dự báo thời tiết địa phương trong 7 ngày tới.

Yêu cầu phân tích (Tasks):
1. Chẩn đoán tức thời: Xác định cây có đang rơi vào trạng thái stress không (stress nhiệt, úng nước, hay thiếu nước)? Các chỉ số dinh dưỡng (EC) và độ pH có đang nằm trong ngưỡng tối ưu cho loại cây này không?
2. Dự báo nguy cơ dịch bệnh: Kết hợp độ ẩm không khí và nhiệt độ để cảnh báo khả năng xuất hiện nấm bệnh hoặc sâu hại.
3. Dự báo nhu cầu tài nguyên: Tính toán lượng nước tưới cần thiết cho 24h tới dựa trên độ bốc hơi nước và dự báo mưa.
4. Khuyến nghị hành động: Đưa ra hướng dẫn cụ thể cho nông dân.

Định dạng đầu ra (Output Format):
Hãy trả về kết quả theo cấu trúc:
- Tình trạng hiện tại: [Ổn định / Cảnh báo / Nguy hiểm] kèm lý do ngắn gọn.
- Chỉ số bất thường: Liệt kê các cảm biến vượt ngưỡng.
- Dự báo (72h tới): Các rủi ro tiềm ẩn về thời tiết và dịch bệnh.
- Hành động ưu tiên: 3 bước nông dân cần làm ngay.

Ghi chú về giọng văn:
Ngôn ngữ cần chuyên nghiệp nhưng dễ hiểu với nông dân, tránh dùng quá nhiều thuật ngữ kỹ thuật khó hiểu nếu không đi kèm giải thích.`;

      const prompt = `Dữ liệu cảm biến hiện tại:
- Độ ẩm đất: ${sensorData.soilMoisture}%
- Nhiệt độ đất: ${sensorData.soilTemp}°C
- Nhiệt độ môi trường: ${sensorData.ambientTemp}°C
- Độ ẩm không khí: ${sensorData.airHumidity}%
- Cường độ ánh sáng: ${sensorData.lightIntensity} Lux
- pH đất: ${sensorData.pH}
- EC đất: ${sensorData.ec} mS/cm

Dữ liệu phụ:
- Loại cây trồng: ${sensorData.cropType}
- Giai đoạn sinh trưởng: ${sensorData.growthStage}
- Dự báo thời tiết: ${sensorData.weatherForecast}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      setResult(response.text || "Không có phản hồi từ AI.");
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      setError("Đã xảy ra lỗi khi phân tích dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="bg-[#84CC16] p-2 rounded-xl text-white">
            <Zap size={24} />
          </div>
          <h1 className="text-4xl font-black text-black uppercase tracking-tighter">AI CHẨN ĐOÁN</h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={resetData}
            className="bg-white text-slate-400 px-4 py-3 rounded-xl font-black text-xs shadow-sm hover:text-red-500 transition-all border border-slate-100 uppercase"
          >
            Đặt lại
          </button>
          <button 
            onClick={simulateData}
            className="bg-white text-slate-600 px-6 py-3 rounded-xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 border-2 border-slate-200 uppercase"
          >
            <Play size={20} /> Giả lập dữ liệu
          </button>
        </div>
      </div>
      
      <div className="h-1 bg-black w-full mb-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-black shadow-[0px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <h3 className="text-xl font-black text-black uppercase tracking-tighter flex items-center gap-2">
              <Activity size={20} className="text-green-600" /> Thông số cảm biến
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Droplets size={12} /> Độ ẩm đất (%)
                </label>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAdjust('soilMoisture', -5)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">-</button>
                  <input 
                    type="number" name="soilMoisture" value={sensorData.soilMoisture} onChange={handleInputChange}
                    className="flex-1 min-w-0 bg-slate-50 border-2 border-slate-200 p-2 rounded-xl font-bold text-sm outline-none focus:border-black text-center"
                  />
                  <button onClick={() => handleAdjust('soilMoisture', 5)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">+</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Thermometer size={12} /> Nhiệt độ đất (°C)
                </label>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAdjust('soilTemp', -1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">-</button>
                  <input 
                    type="number" name="soilTemp" value={sensorData.soilTemp} onChange={handleInputChange}
                    className="flex-1 min-w-0 bg-slate-50 border-2 border-slate-200 p-2 rounded-xl font-bold text-sm outline-none focus:border-black text-center"
                  />
                  <button onClick={() => handleAdjust('soilTemp', 1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">+</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Thermometer size={12} /> Nhiệt độ môi trường (°C)
                </label>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAdjust('ambientTemp', -1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">-</button>
                  <input 
                    type="number" name="ambientTemp" value={sensorData.ambientTemp} onChange={handleInputChange}
                    className="flex-1 min-w-0 bg-slate-50 border-2 border-slate-200 p-2 rounded-xl font-bold text-sm outline-none focus:border-black text-center"
                  />
                  <button onClick={() => handleAdjust('ambientTemp', 1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">+</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Droplets size={12} /> Độ ẩm khí (%)
                </label>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAdjust('airHumidity', -5)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">-</button>
                  <input 
                    type="number" name="airHumidity" value={sensorData.airHumidity} onChange={handleInputChange}
                    className="flex-1 min-w-0 bg-slate-50 border-2 border-slate-200 p-2 rounded-xl font-bold text-sm outline-none focus:border-black text-center"
                  />
                  <button onClick={() => handleAdjust('airHumidity', 5)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">+</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <FlaskConical size={12} /> pH đất
                </label>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAdjust('pH', -0.1, true)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">-</button>
                  <input 
                    type="number" step="0.1" name="pH" value={sensorData.pH} onChange={handleInputChange}
                    className="flex-1 min-w-0 bg-slate-50 border-2 border-slate-200 p-2 rounded-xl font-bold text-sm outline-none focus:border-black text-center"
                  />
                  <button onClick={() => handleAdjust('pH', 0.1, true)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">+</button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Zap size={12} /> EC (mS/cm)
                </label>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleAdjust('ec', -0.1, true)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">-</button>
                  <input 
                    type="number" step="0.1" name="ec" value={sensorData.ec} onChange={handleInputChange}
                    className="flex-1 min-w-0 bg-slate-50 border-2 border-slate-200 p-2 rounded-xl font-bold text-sm outline-none focus:border-black text-center"
                  />
                  <button onClick={() => handleAdjust('ec', 0.1, true)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600 font-bold hover:bg-slate-200">+</button>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Sun size={12} /> Cường độ sáng (Lux)
              </label>
              <input 
                type="number" name="lightIntensity" value={sensorData.lightIntensity} onChange={handleInputChange}
                className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:border-black"
              />
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            <h3 className="text-xl font-black text-black uppercase tracking-tighter flex items-center gap-2 pt-2">
              <Sprout size={20} className="text-green-600" /> Thông tin bổ sung
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Loại cây trồng
                </label>
                <input 
                  type="text" name="cropType" value={sensorData.cropType} onChange={handleInputChange}
                  className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:border-black"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Giai đoạn sinh trưởng
                </label>
                <select 
                  name="growthStage" value={sensorData.growthStage} onChange={handleInputChange}
                  className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:border-black"
                >
                  <option value="Mới trồng">Mới trồng</option>
                  <option value="Phát triển lá">Phát triển lá</option>
                  <option value="Ra hoa">Ra hoa</option>
                  <option value="Kết trái">Kết trái</option>
                  <option value="Thu hoạch">Thu hoạch</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Dự báo thời tiết
                </label>
                <textarea 
                  name="weatherForecast" value={sensorData.weatherForecast} onChange={handleInputChange}
                  className="w-full bg-slate-50 border-2 border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:border-black min-h-[80px]"
                />
              </div>
            </div>

            <button 
              onClick={runAnalysis}
              disabled={loading}
              className="w-full bg-[#84CC16] text-white py-5 rounded-2xl font-black text-lg uppercase shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 border-2 border-black"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} /> ĐANG PHÂN TÍCH...
                </>
              ) : (
                <>
                  <Zap size={24} /> CHẨN ĐOÁN NGAY
                </>
              )}
            </button>
          </div>
        </div>

        {/* Result Section */}
        <div className="lg:col-span-2">
          {!result && !loading && !error && (
            <div className="bg-white border-4 border-dashed border-slate-200 rounded-[3rem] p-16 text-center h-full flex flex-col items-center justify-center">
              <Zap size={64} className="text-slate-200 mb-6" />
              <p className="text-2xl font-black text-slate-400 uppercase tracking-widest">Sẵn sàng phân tích</p>
              <p className="text-slate-400 font-bold mt-2">Nhập thông số cảm biến và nhấn nút chẩn đoán</p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-[3rem] p-16 text-center h-full flex flex-col items-center justify-center border-2 border-black shadow-[0px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="relative w-48 h-64 flex flex-col items-center justify-end mb-8 overflow-hidden">
                {/* Sun/Energy Glow */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                    rotate: 360
                  }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl"
                />
                
                {/* Sparkles */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      y: [-20, -100],
                      x: (i - 2) * 20
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: i * 0.4,
                      ease: "easeOut"
                    }}
                    className="absolute bottom-10 w-2 h-2 bg-yellow-400 rounded-full"
                  />
                ))}

                {/* Plant Stem */}
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: 160 }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-4 bg-green-500 rounded-t-full relative z-20"
                >
                  {/* Leaf 1 */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1, 1, 0] }}
                    transition={{ times: [0, 0.2, 0.8, 1], duration: 4, repeat: Infinity }}
                    className="absolute bottom-20 right-full w-12 h-6 bg-green-400 rounded-full origin-right -rotate-30"
                  />
                  {/* Leaf 2 */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 0, 1, 1, 0] }}
                    transition={{ times: [0, 0.3, 0.5, 0.8, 1], duration: 4, repeat: Infinity }}
                    className="absolute bottom-32 left-full w-14 h-7 bg-green-600 rounded-full origin-left rotate-30"
                  />
                  {/* Leaf 3 (Top) */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 0, 0, 1, 1, 0] }}
                    transition={{ times: [0, 0.5, 0.7, 0.9, 0.95, 1], duration: 4, repeat: Infinity }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-green-300 rounded-full rotate-45"
                  />
                </motion.div>
                
                {/* Soil/Pot */}
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-32 h-10 bg-amber-900 rounded-t-[20px] rounded-b-lg shadow-xl z-30 relative"
                >
                  <div className="absolute top-0 left-0 w-full h-2 bg-amber-800 rounded-t-[20px]" />
                </motion.div>
              </div>
              <p className="text-3xl font-black text-black uppercase tracking-tighter">ĐANG XỬ LÝ DỮ LIỆU</p>
              <p className="text-slate-500 font-bold mt-2 italic">Chuyên gia AI đang phân tích các chỉ số sinh học...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-[3rem] p-12 text-center h-full flex flex-col items-center justify-center">
              <AlertCircle size={64} className="text-red-500 mb-6" />
              <p className="text-2xl font-black text-red-600 uppercase tracking-widest">{error}</p>
              <button 
                onClick={runAnalysis}
                className="mt-6 bg-red-600 text-white px-8 py-3 rounded-xl font-black uppercase shadow-lg"
              >
                Thử lại
              </button>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-black shadow-[0px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-500">
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-green-100 p-3 rounded-2xl text-green-700">
                  <ClipboardCheck size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-black uppercase tracking-tighter">KẾT QUẢ CHẨN ĐOÁN</h2>
                  <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Phân tích bởi Agri-AI Scientist</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none 
                prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:text-black
                prose-p:font-bold prose-p:text-slate-700
                prose-li:font-bold prose-li:text-slate-700
                prose-strong:text-green-700 prose-strong:font-black
                bg-slate-50 p-8 rounded-[2rem] border border-slate-200
              ">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>

              <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-green-50 rounded-[2rem] border border-green-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="text-sm font-bold text-green-800">Kết quả này được dựa trên dữ liệu thời gian thực và mô hình sinh trưởng chuẩn của {sensorData.cropType}.</p>
                </div>
                <button className="whitespace-nowrap bg-black text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                  Lưu báo cáo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ClipboardCheck = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
);

const CheckCircle2 = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

export default AIDiagnosis;
