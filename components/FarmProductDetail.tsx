
import React from 'react';
import { FarmProduct, ProductStatus } from '../types';
import { 
  ArrowLeft, MapPin, Info, Calendar, 
  ShieldCheck, Sprout, Phone, Award,
  CheckCircle2, XCircle, Clock,
  User as UserIcon, Maximize2, Layers,
  QrCode, History, Leaf, BookOpen,
  UserCheck, Bell, Plus, Upload, AlertTriangle, Send, MessageSquare, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FarmProductDetailProps {
  product: FarmProduct;
  onBack: () => void;
}

const FarmProductDetail: React.FC<FarmProductDetailProps> = ({ product, onBack }) => {
  const [localImages, setLocalImages] = React.useState<string[]>([]);
  const [isReportOpen, setIsReportOpen] = React.useState(false);
  const [reportType, setReportType] = React.useState('Thông tin sai sự thật');
  const [reportContent, setReportContent] = React.useState('');
  const [isReported, setIsReported] = React.useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFEFE] font-sans">
      <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center gap-4">
        <motion.button 
          whileHover={{ x: -2 }}
          onClick={onBack} 
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
        >
          <ArrowLeft size={24} />
        </motion.button>
        <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Chi tiết hồ sơ vùng trồng</h1>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 pb-24"
      >
        {/* Farm Profile Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-8 mb-10">
            <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 shrink-0 shadow-inner border border-emerald-100/50">
              <Sprout size={48} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Nông trại {product.name}</h2>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  product.status === ProductStatus.COMPLETED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                  product.status === ProductStatus.REJECTED ? 'bg-red-50 text-red-700 border-red-100' : 
                  product.status === ProductStatus.REVIEWING ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {product.status === ProductStatus.COMPLETED ? 'Đã xác minh' : 'Chờ xác minh'}
                </div>
              </div>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                <UserCheck size={16} className="text-emerald-500" /> {product.farmerName}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {product.certificates.map((cert, idx) => (
                  <span key={idx} className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20">
                    {cert.type}
                  </span>
                ))}
                {product.certificates.length === 0 && (
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Chưa có chứng chỉ
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoItem 
              icon={<UserIcon size={18} />} 
              label="Người đại diện" 
              value={product.farmerName} 
            />
            <InfoItem 
              icon={<MapPin size={18} />} 
              label="Vị trí" 
              value={product.location.address} 
            />
            <InfoItem 
              icon={<Maximize2 size={18} />} 
              label="Diện tích" 
              value={`${product.area} ha`} 
            />
            <InfoItem 
              icon={<Layers size={18} />} 
              label="Loại đất" 
              value="Đất phù sa" 
            />
            <InfoItem 
              icon={<History size={18} />} 
              label="Năm thành lập" 
              value="2015" 
            />
            <InfoItem 
              icon={<Leaf size={18} />} 
              label="Cây trồng chính" 
              value={`${product.name}, ${product.variety}`} 
            />
          </div>
        </motion.div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                <BookOpen size={20} className="text-emerald-600" />
                Quy trình canh tác
              </h3>
              <p className="text-slate-600 font-medium leading-relaxed italic bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                "{product.description || 'Chưa có mô tả chi tiết về quy trình canh tác cho vùng trồng này.'}"
              </p>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                <ShieldCheck size={20} className="text-blue-600" />
                Chứng chỉ đã cấp
              </h3>
              <div className="space-y-3">
                {product.certificates.length > 0 ? product.certificates.map((cert, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">{cert.type}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hết hạn: {cert.expiryDate}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  </div>
                )) : (
                  <p className="text-slate-400 font-bold italic text-center py-4">Chưa có chứng chỉ</p>
                )}
              </div>
            </motion.section>
          </div>

          <div className="space-y-8">
            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                <Bell size={20} className="text-orange-600" />
                Phản hồi từ Cán bộ
              </h3>
              <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                <p className="text-amber-900 font-bold italic text-sm">
                  "{product.verificationNote || 'Hồ sơ đang trong quá trình xử lý. Vui lòng đợi phản hồi từ cán bộ chuyên trách.'}"
                </p>
                {product.verifiedBy && (
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-amber-700 uppercase">
                    <UserCheck size={14} /> Xác minh bởi {product.verifiedBy}
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm"
            >
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                <Maximize2 size={20} className="text-purple-600" />
                Hình ảnh minh chứng
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { src: product.images.product[0], label: 'Sản phẩm' },
                  { src: product.images.orchard[0], label: 'Vùng trồng' },
                  { src: product.images.warehouse[0], label: 'Kho bãi' },
                  ...localImages.map((src, i) => ({ src, label: `Minh chứng ${i + 1}` }))
                ].map((img, i) => (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    key={i} 
                    className="aspect-square rounded-xl overflow-hidden border border-slate-100 relative group shadow-sm"
                  >
                    <img src={img.src} alt={img.label} className="w-full h-full object-cover transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-[8px] font-black uppercase tracking-widest">{img.label}</span>
                    </div>
                  </motion.div>
                ))}

                {/* Upload Button */}
                <motion.label 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                >
                  <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={20} />
                  </div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tải lên</span>
                </motion.label>
              </div>
            </motion.section>
          </div>
        </div>

        {/* Timeline Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm"
        >
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Lịch sử xét duyệt</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã hồ sơ: <span className="font-mono text-emerald-600 italic">{product.id}</span></p>
          </div>
          
          <div className="relative space-y-12">
            {/* Vertical Line with Gradient */}
            <div className="absolute left-[87px] top-2 bottom-2 w-0.5 bg-slate-100">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: "100%" }}
                className="w-full bg-emerald-500 origin-top"
              />
            </div>

            {[
              { status: ProductStatus.REJECTED, label: 'Từ chối', icon: <XCircle size={20} /> },
              { status: ProductStatus.COMPLETED, label: 'Xét duyệt xong', icon: <CheckCircle2 size={20} /> },
              { status: ProductStatus.REVIEWING, label: 'Đang duyệt', icon: <Clock size={20} /> },
              { status: ProductStatus.PENDING, label: 'Chờ xét duyệt', icon: <Clock size={20} /> },
              { status: ProductStatus.NEW, label: 'Mới đăng ký', icon: <Plus size={20} /> },
            ].filter(step => {
              if (step.status === ProductStatus.REJECTED) return product.status === ProductStatus.REJECTED;
              if (step.status === ProductStatus.COMPLETED) return product.statusHistory?.some(h => h.status === ProductStatus.COMPLETED) || product.status === ProductStatus.COMPLETED;
              return true;
            }).map((step, index) => {
              const historyItem = product.statusHistory?.find(h => h.status === step.status);
              const isCurrent = product.status === step.status;
              const isPast = product.statusHistory?.some(h => h.status === step.status);
              
              const date = historyItem ? new Date(historyItem.timestamp) : null;
              const displayDate = date ? `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}` : '';
              const displayTime = date ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';

              return (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index} 
                  className="flex items-start gap-8 relative z-10"
                >
                  <div className="w-16 text-right shrink-0 pt-1">
                    <p className="text-[11px] font-black text-slate-800 leading-none tracking-tighter">{displayDate}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{displayTime}</p>
                  </div>

                  <div className="relative flex items-center justify-center w-10 h-10 shrink-0">
                    <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
                      isCurrent ? (
                        step.status === ProductStatus.REJECTED ? 'bg-red-500 border-red-100 text-white shadow-lg shadow-red-500/20' : 
                        step.status === ProductStatus.COMPLETED ? 'bg-emerald-500 border-emerald-100 text-white shadow-lg shadow-emerald-500/20' :
                        'bg-amber-500 border-amber-100 text-white shadow-lg shadow-amber-500/20'
                      ) : 
                      isPast ? 'bg-emerald-500 border-emerald-100 text-white' : 'bg-white border-slate-100 text-slate-300'
                    }`}>
                      {isPast || isCurrent ? step.icon || <CheckCircle2 size={18} /> : null}
                    </div>
                  </div>

                  <div className="pt-0.5 flex-1">
                    <p className={`text-lg font-black tracking-tight uppercase ${
                      isCurrent ? (
                        step.status === ProductStatus.REJECTED ? 'text-red-600' : 
                        step.status === ProductStatus.COMPLETED ? 'text-emerald-600' :
                        'text-amber-600'
                      ) : 
                      isPast ? 'text-slate-800' : 'text-slate-300'
                    }`}>
                      {step.label}
                    </p>
                    {step.status === ProductStatus.REJECTED && product.rejectionReason && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100"
                      >
                        <p className="text-xs font-bold text-red-600 italic">Lý do: {product.rejectionReason}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Report Button */}
        {product.status !== ProductStatus.COMPLETED && (
          <div className="pt-6">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsReportOpen(true)}
              className="w-full bg-red-50 text-red-600 px-8 py-6 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border border-red-100 shadow-sm hover:bg-red-100 transition-all"
            >
              <AlertTriangle size={24} /> Khiếu nại xét duyệt hồ sơ
            </motion.button>
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 bg-slate-50 py-3 rounded-xl border border-slate-100 mx-auto max-w-lg">
              Mọi hành vi khiếu nại sai sự thật sẽ bị xử lý theo quy định của AgriMap
            </p>
          </div>
        )}
      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg p-8 md:p-10 space-y-8 relative z-10 overflow-hidden"
            >
              {!isReported ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="bg-red-50 p-4 rounded-2xl text-red-600">
                      <AlertTriangle size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Khiếu nại hồ sơ</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vui lòng cung cấp lý do chi tiết</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Loại khiếu nại</label>
                      <select 
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all appearance-none outline-none"
                      >
                        <option>Thông tin sai sự thật</option>
                        <option>Giả mạo chứng chỉ</option>
                        <option>Vùng trồng không tồn tại</option>
                        <option>Sản phẩm kém chất lượng</option>
                        <option>Khác</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nội dung chi tiết</label>
                      <textarea 
                        value={reportContent}
                        onChange={(e) => setReportContent(e.target.value)}
                        placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                        className="w-full h-40 bg-slate-50 border border-slate-200 p-4 rounded-2xl font-bold text-slate-700 focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white transition-all outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsReportOpen(false)}
                      className="flex-1 py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                    >
                      Hủy
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (reportContent.trim()) {
                          setIsReported(true);
                          setTimeout(() => {
                            setIsReportOpen(false);
                            setIsReported(false);
                            setReportContent('');
                          }, 2000);
                        }
                      }}
                      className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Send size={18} /> Gửi báo cáo
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800">Đã gửi khiếu nại!</h3>
                    <p className="text-slate-500 font-bold text-sm">AgriMap sẽ xem xét và phản hồi cho bạn sớm nhất có thể.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-slate-50/50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 group hover:bg-white hover:shadow-lg hover:shadow-slate-200/30 transition-all duration-300">
    <div className="text-emerald-600 shrink-0 bg-white p-2.5 rounded-xl shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-black text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

export default FarmProductDetail;
