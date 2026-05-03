
import React, { useState } from 'react';
import { FarmProduct, FarmingTimelineUpdate, FarmerUser } from '../types';
import { 
  BookOpen, Plus, Calendar, Camera, 
  CheckCircle2, ChevronRight, ArrowLeft,
  Sprout, Droplets, Zap, Trash2, 
  Image as ImageIcon, Sparkles, Info, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FarmerDiaryProps {
  user: FarmerUser;
  products: FarmProduct[];
  onUpdateTimeline: (productId: string, timeline: FarmingTimelineUpdate[]) => void;
  onBack: () => void;
}

const STAGES = [
  "Chuẩn bị đất",
  "Gieo hạt / Trồng cây",
  "Bón phân",
  "Tưới nước",
  "Làm cỏ",
  "Phun thuốc bảo vệ thực vật",
  "Cắt tỉa cành",
  "Theo dõi sâu bệnh",
  "Thu hoạch",
  "Bảo quản sau thu hoạch"
];

const FarmerDiary: React.FC<FarmerDiaryProps> = ({ user, products, onUpdateTimeline, onBack }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id || null);
  const [isAdding, setIsAdding] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    stage: STAGES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    imageUrl: ''
  });

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleAddUpdate = () => {
    if (!selectedProductId || !newUpdate.description) return;

    const update: FarmingTimelineUpdate = {
      id: Math.random().toString(36).substr(2, 9),
      date: newUpdate.date,
      stage: newUpdate.stage,
      description: newUpdate.description,
      imageUrl: newUpdate.imageUrl || `https://picsum.photos/seed/${Math.random()}/400/300`
    };

    const updatedTimeline = [...(selectedProduct?.timeline || []), update].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    onUpdateTimeline(selectedProductId, updatedTimeline);
    setIsAdding(false);
    setNewUpdate({
      stage: STAGES[0],
      description: '',
      date: new Date().toISOString().split('T')[0],
      imageUrl: ''
    });
  };

  const handleDeleteUpdate = (updateId: string) => {
    if (!selectedProductId || !selectedProduct) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhật ký này?")) return;

    const updatedTimeline = selectedProduct.timeline.filter(t => t.id !== updateId);
    onUpdateTimeline(selectedProductId, updatedTimeline);
  };

  const generateAIDescription = () => {
    const suggestions: { [key: string]: string } = {
      "Chuẩn bị đất": "Đã tiến hành cày xới đất, bón lót phân chuồng hoai mục và vôi bột để khử trùng. Độ ẩm đất đạt yêu cầu.",
      "Gieo hạt / Trồng cây": "Xuống giống đúng lịch thời vụ. Cây giống khỏe mạnh, không sâu bệnh. Mật độ trồng đảm bảo thông thoáng.",
      "Bón phân": "Bón thúc đợt 1 bằng phân NPK tổng hợp. Kết hợp làm cỏ và xới xáo gốc để phân nhanh tan và thấm sâu.",
      "Tưới nước": "Duy trì hệ thống tưới nhỏ giọt 2 lần/ngày vào sáng sớm và chiều mát. Đảm bảo cây luôn đủ ẩm trong giai đoạn phát triển.",
      "Làm cỏ": "Tiến hành làm cỏ thủ công quanh gốc cây để tránh cạnh tranh dinh dưỡng. Không sử dụng thuốc diệt cỏ hóa học.",
      "Phun thuốc bảo vệ thực vật": "Phun phòng ngừa rầy nâu và đạo ôn bằng chế phẩm sinh học. Tuân thủ đúng liều lượng và thời gian cách ly.",
      "Cắt tỉa cành": "Cắt tỉa các cành già, cành sâu bệnh và cành vượt để tạo tán thông thoáng, tập trung dinh dưỡng nuôi trái.",
      "Theo dõi sâu bệnh": "Kiểm tra định kỳ, phát hiện sớm dấu hiệu của nhện đỏ. Đã có biện pháp xử lý kịp thời bằng thảo mộc.",
      "Thu hoạch": "Tiến hành thu hoạch đợt 1. Sản phẩm đạt kích thước và màu sắc tiêu chuẩn. Đảm bảo quy trình thu hái nhẹ nhàng.",
      "Bảo quản sau thu hoạch": "Phân loại sản phẩm tại bồn. Đóng gói vào thùng xốp có lót giấy chống sốc. Vận chuyển đến kho lạnh trong vòng 2 giờ."
    };

    setNewUpdate(prev => ({
      ...prev,
      description: suggestions[prev.stage] || "Đã hoàn thành công việc theo đúng quy trình kỹ thuật."
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FBF9] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="bg-green-700 p-2 rounded-xl text-white shadow-lg">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tighter">NHẬT KÝ CANH TÁC</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ghi chép quy trình sản xuất sạch</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-green-700 text-white px-5 py-3 rounded-2xl font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2 border-2 border-black uppercase"
        >
          <Plus size={20} /> Ghi nhật ký
        </button>
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-8">
        {/* Product Selector */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {products.map(product => (
            <button
              key={product.id}
              onClick={() => setSelectedProductId(product.id)}
              className={`flex-shrink-0 px-6 py-4 rounded-[2rem] border-2 transition-all flex items-center gap-4 ${
                selectedProductId === product.id 
                  ? 'bg-black text-white border-black shadow-xl scale-105' 
                  : 'bg-white text-slate-600 border-slate-100 hover:border-green-600'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20">
                <img src={product.images.product[0]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-tighter">{product.name}</p>
                <p className={`text-[10px] font-bold uppercase opacity-60`}>{product.variety}</p>
              </div>
            </button>
          ))}
        </div>

        {selectedProduct ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Timeline View */}
            <div className="lg:col-span-12 space-y-6">
              <div className="bg-white rounded-[3rem] p-10 border-2 border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <BookOpen size={120} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-black text-black uppercase tracking-tighter flex items-center gap-3">
                      <Calendar size={28} className="text-green-700" />
                      Lịch sử canh tác
                    </h2>
                    <div className="bg-green-50 px-4 py-2 rounded-full border border-green-100">
                      <span className="text-xs font-black text-green-700 uppercase tracking-widest">
                        {selectedProduct.timeline.length} Hoạt động
                      </span>
                    </div>
                  </div>

                  {selectedProduct.timeline.length === 0 ? (
                    <div className="py-20 text-center space-y-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto border-4 border-dashed border-slate-200">
                        <NotebookPen size={40} className="text-slate-300" />
                      </div>
                      <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Chưa có ghi chép nào cho vùng trồng này</p>
                      <button 
                        onClick={() => setIsAdding(true)}
                        className="text-green-700 font-black underline underline-offset-8 uppercase hover:text-green-800"
                      >
                        Bắt đầu ghi nhật ký ngay
                      </button>
                    </div>
                  ) : (
                    <div className="relative space-y-12 pl-4 md:pl-12">
                      {/* Vertical Line */}
                      <div className="absolute left-[20px] md:left-[52px] top-4 bottom-4 w-1 bg-gradient-to-b from-green-600 via-green-400 to-slate-100 rounded-full"></div>

                      {selectedProduct.timeline.map((item, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          key={item.id} 
                          className="relative flex flex-col md:flex-row gap-8 group"
                        >
                          {/* Circle Indicator */}
                          <div className="absolute left-[4px] md:left-[36px] top-1 w-8 h-8 rounded-full bg-white border-4 border-green-600 z-10 shadow-md group-hover:scale-125 transition-transform flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          </div>

                          {/* Date Label (Desktop) */}
                          <div className="hidden md:block w-32 pt-2">
                            <p className="text-lg font-black text-black leading-none">{new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{new Date(item.date).getFullYear()}</p>
                          </div>

                          {/* Content Card */}
                          <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 md:p-8 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-green-200 transition-all relative">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                              <div className="space-y-4 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="bg-green-700 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                      {item.stage}
                                    </span>
                                    <span className="md:hidden text-xs font-black text-slate-400">
                                      {new Date(item.date).toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteUpdate(item.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-2"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                                <p className="text-slate-700 font-bold leading-relaxed text-lg italic">
                                  "{item.description}"
                                </p>
                              </div>
                              
                              {item.imageUrl && (
                                <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0">
                                  <img src={item.imageUrl} alt={item.stage} className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border-4 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
            <Sprout size={64} className="mx-auto text-slate-200 mb-6" />
            <p className="text-2xl font-black text-slate-400 uppercase tracking-widest">Vui lòng chọn vùng trồng để xem nhật ký</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative z-10"
            >
              <div className="p-8 border-b-4 border-black flex items-center justify-between bg-green-50">
                <div className="flex items-center gap-4">
                  <div className="bg-black text-white p-3 rounded-2xl">
                    <NotebookPen size={28} />
                  </div>
                  <h3 className="text-3xl font-black text-black uppercase tracking-tighter">Ghi nhật ký mới</h3>
                </div>
                <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar size={14} /> Ngày thực hiện
                    </label>
                    <input 
                      type="date" 
                      value={newUpdate.date}
                      onChange={e => setNewUpdate({...newUpdate, date: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl font-bold text-black focus:border-black outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Layers size={14} /> Giai đoạn / Công việc
                    </label>
                    <select 
                      value={newUpdate.stage}
                      onChange={e => setNewUpdate({...newUpdate, stage: e.target.value})}
                      className="w-full bg-slate-50 border-2 border-slate-200 p-4 rounded-2xl font-bold text-black focus:border-black outline-none transition-all appearance-none"
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={14} /> Mô tả chi tiết công việc
                    </label>
                    <button 
                      onClick={generateAIDescription}
                      className="flex items-center gap-2 text-green-700 font-black text-[10px] uppercase tracking-widest hover:text-green-800"
                    >
                      <Sparkles size={14} /> AI Gợi ý mô tả
                    </button>
                  </div>
                  <textarea 
                    rows={4}
                    value={newUpdate.description}
                    onChange={e => setNewUpdate({...newUpdate, description: e.target.value})}
                    placeholder="Nhập chi tiết các bước đã thực hiện, vật tư sử dụng..."
                    className="w-full bg-slate-50 border-2 border-slate-200 p-6 rounded-3xl font-bold text-black focus:border-black outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Camera size={14} /> Hình ảnh minh chứng (Không bắt buộc)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-300 p-8 rounded-3xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-green-600 hover:text-green-700 transition-all cursor-pointer group">
                      <UploadCloud size={32} className="group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-widest">Tải ảnh lên</span>
                    </div>
                    <div className="w-32 h-32 bg-slate-100 rounded-3xl border-2 border-slate-200 flex items-center justify-center text-slate-300">
                      <ImageIcon size={32} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-slate-50 border-t-4 border-black flex gap-4">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-5 bg-white border-2 border-black rounded-2xl font-black text-lg uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleAddUpdate}
                  className="flex-[2] py-5 bg-green-700 text-white border-2 border-black rounded-2xl font-black text-lg uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-green-800 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={24} /> Lưu nhật ký
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const X = ({ size }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const FileText = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
);

const NotebookPen = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 6s3-1 3 1 2 1 2 1"/><path d="M2 10s3-1 3 1 2 1 2 1"/><path d="M2 14s3-1 3 1 2 1 2 1"/><path d="M2 18s3-1 3 1 2 1 2 1"/><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M16 2v20"/><path d="M10 8h4"/><path d="M10 12h4"/><path d="M10 16h4"/></svg>
);

const UploadCloud = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
);

export default FarmerDiary;
