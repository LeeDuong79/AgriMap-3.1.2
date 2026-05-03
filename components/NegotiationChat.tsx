
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, User as UserIcon, Store, 
  ChevronRight, ArrowRight, MessageSquare, 
  FileText, PenTool, CheckCircle2, Clock
} from 'lucide-react';
import { User, UserRole, NegotiationSession, ChatMessage, FarmProduct } from '../types';

interface NegotiationChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  product: FarmProduct | null;
  session: NegotiationSession | null;
  onSendMessage: (text: string) => void;
  onProposeContract: () => void;
}

const NegotiationChat: React.FC<NegotiationChatProps> = ({
  isOpen,
  onClose,
  currentUser,
  product,
  session,
  onSendMessage,
  onProposeContract
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, session?.messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  if (!isOpen || !product || !currentUser) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          className="bg-white w-full max-w-2xl h-[80vh] rounded-[3.5rem] border-[6px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-black text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500 p-3 rounded-2xl">
                <Store size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter leading-tight">Thương lượng: {product.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Đối tác: {currentUser.role === UserRole.BUYER ? product.farmerName : (session?.buyerName || 'Người thu mua')}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Product Quick Info Bar */}
          <div className="bg-slate-50 border-b-4 border-black px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={product.images.product[0]} 
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover border-2 border-black" 
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="text-xs font-black uppercase text-slate-400 leading-none mb-1">Giá đề xuất</p>
                <p className="text-lg font-black text-emerald-700 tracking-tight">{product.price?.toLocaleString() || '16.000'} VNĐ/kg</p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="text-right">
                <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-1">Khu vực</p>
                <p className="text-xs font-black text-slate-700">{product.location.address.split(',').pop()}</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#FDFCFB] custom-scrollbar">
            {session?.messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <div className="bg-slate-100 p-6 rounded-full">
                  <MessageSquare size={48} />
                </div>
                <p className="font-black uppercase text-sm tracking-widest">Hãy bắt đầu gửi tin nhắn<br/>thương thảo về giá và sản lượng</p>
              </div>
            ) : (
              session?.messages.map((msg, idx) => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`
                        p-5 rounded-[2rem] font-bold text-sm leading-relaxed shadow-sm border-2
                        ${isMine 
                          ? 'bg-black text-white border-black rounded-tr-sm' 
                          : 'bg-white text-slate-800 border-slate-100 rounded-tl-sm shadow-slate-200/50'}
                      `}>
                        {msg.text}
                      </div>
                      <span className="mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">
                        {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white border-t-4 border-black">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={inputText}
                  placeholder="Nhập tin nhắn..."
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-slate-50 border-4 border-black p-4 rounded-2xl font-bold text-slate-800 focus:bg-white transition-all outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${inputText.trim() ? 'text-emerald-600 hover:scale-110' : 'text-slate-300'}`}
                >
                  <Send size={24} />
                </button>
              </div>
              
              {/* Farmer can only chat, buyer can propose contract */}
              {currentUser.role === UserRole.BUYER && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onProposeContract}
                  className="bg-amber-500 text-white border-4 border-black px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-amber-600 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
                >
                  <PenTool size={18} />
                  Dự thảo<br/>hợp đồng
                </motion.button>
              )}
            </div>
            <p className="mt-4 text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest">
              Ghi chú: Tin nhắn thương thảo được hệ thống ghi nhận làm căn cứ pháp lý
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NegotiationChat;
