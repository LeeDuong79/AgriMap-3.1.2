
import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, ChevronRight, Info, AlertTriangle, Calendar, Thermometer, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Crop, PestDisease } from '../types';
import { MOCK_CROPS } from '../constants';

interface KnowledgeHandbookProps {
  onBack?: () => void;
}

const KnowledgeHandbook: React.FC<KnowledgeHandbookProps> = ({ onBack }) => {
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [view, setView] = useState<'selection' | 'details'>('selection');
  const [activeTab, setActiveTab] = useState<'techniques' | 'pests'>('pests');
  const [pestFilter, setPestFilter] = useState<'dangerous' | 'stage' | 'season'>('dangerous');

  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setView('details');
  };

  const handleBack = () => {
    if (view === 'details') {
      setView('selection');
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Header */}
      <div className="flex items-center px-6 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
        <motion.button 
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBack} 
          className="p-2 -ml-2 text-slate-800 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div className="flex-1 text-center">
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
            {view === 'selection' ? 'Sổ tay kiến thức' : selectedCrop?.name}
          </h1>
        </div>
        <div className="w-10 flex justify-end">
          {view === 'selection' && (
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Sparkles size={18} />
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {view === 'selection' ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              <CropSelection onSelect={handleSelectCrop} />
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="h-full"
            >
              <PestDiseaseView 
                crop={selectedCrop!} 
                pestFilter={pestFilter}
                setPestFilter={setPestFilter}
                onChangeCrop={() => setView('selection')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CropSelection: React.FC<{ onSelect: (crop: Crop) => void }> = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedIds, setSelectedIds] = useState<string[]>(['c1', 'c2']);

  const categories = ['Tất cả', 'Rau quả', 'Cây công nghiệp', 'Hoa'];

  const filteredCrops = useMemo(() => {
    return MOCK_CROPS.filter(crop => {
      const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Tất cả' || crop.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length < 8) return [...prev, id];
      return prev;
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden px-6 pt-6">
      <div className="space-y-6 flex flex-col flex-1 overflow-hidden">
        {/* Perfectly Balanced Row Header - Tighter and Larger */}
        <div className="flex items-center justify-between gap-3 h-20">
          <div className="flex-shrink-0">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              Cây trồng của bạn
            </h2>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Tối đa 08 loại
              </span>
            </div>
          </div>

          {/* More Visible Search Bar */}
          <div className="flex-1 max-w-[240px] relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Tìm nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:text-slate-400 shadow-md shadow-slate-200/20"
            />
          </div>
          
          <div className="flex-shrink-0 w-32 flex justify-end">
            <AnimatePresence mode="wait">
              {selectedIds.length > 0 && (
                <motion.button 
                  initial={{ scale: 0.8, opacity: 0, x: 10 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0.8, opacity: 0, x: 10 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(MOCK_CROPS[0])}
                  className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/40 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  LƯU ({selectedIds.length})
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-3 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                activeCategory === cat 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-white text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Optimized Grid - Back to 3 columns for better "fullness" */}
        <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 pb-32">
          <motion.div layout className="grid grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredCrops.map((crop, idx) => {
                const isSelected = selectedIds.includes(crop.id);
                return (
                  <motion.button
                    layout
                    key={crop.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => toggleSelect(crop.id)}
                    className="flex flex-col items-center gap-3 group relative mb-4"
                  >
                    <div className={`w-full aspect-square rounded-[2rem] flex items-center justify-center text-4xl shadow-sm border-2 transition-all relative overflow-hidden ${
                      isSelected 
                        ? 'bg-white border-emerald-500 ring-8 ring-emerald-500/5' 
                        : 'bg-white border-slate-50 hover:border-emerald-100'
                    }`}>
                      {/* Subtle background icon for "fullness" */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] scale-150 rotate-12">
                        {crop.icon}
                      </div>

                      <div className="group-hover:scale-110 transition-transform duration-500 relative z-10">
                        {crop.icon}
                      </div>
                      
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white"
                        >
                          <CheckCircle2 size={10} />
                        </motion.div>
                      )}
                    </div>
                    <span className={`text-xs font-black uppercase tracking-tighter transition-colors text-center leading-tight ${
                      isSelected ? 'text-emerald-700' : 'text-slate-500 group-hover:text-slate-900'
                    }`}>
                      {crop.name}
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const PestDiseaseView: React.FC<{ 
  crop: Crop; 
  pestFilter: 'dangerous' | 'stage' | 'season';
  setPestFilter: (filter: 'dangerous' | 'stage' | 'season') => void;
  onChangeCrop: () => void;
}> = ({ crop, pestFilter, setPestFilter, onChangeCrop }) => {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Crop Info Header */}
      <div className="flex flex-col items-center py-10 bg-white px-6">
        <motion.div 
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-28 h-28 rounded-[2.5rem] bg-emerald-50 border-4 border-white shadow-2xl shadow-emerald-500/10 flex items-center justify-center text-6xl mb-6 font-sans"
        >
          {crop.icon}
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase font-sans">{crop.name}</h2>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onChangeCrop}
          className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-3 hover:text-emerald-700 transition-colors flex items-center gap-2 bg-emerald-50/50 px-4 py-1.5 rounded-full border border-emerald-100 font-sans"
        >
          <div className="p-0.5 bg-emerald-500 text-white rounded">
            <Search size={10} />
          </div>
          Thay đổi cây trồng
        </motion.button>
      </div>

      <div className="flex-1 bg-white rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.02)] border-t border-slate-100 overflow-hidden flex flex-col mt-2">
        {/* Classification Header */}
        <div className="px-6 py-8">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3 font-sans">
             <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div> Phân loại sâu bệnh hại
          </h3>
          <div className="flex gap-3">
            {[
              { id: 'dangerous', label: 'Nguy hiểm', icon: <AlertTriangle size={16} /> },
              { id: 'stage', label: 'Theo giai đoạn', icon: <Calendar size={16} /> },
              { id: 'season', label: 'Theo mùa', icon: <Thermometer size={16} /> }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setPestFilter(btn.id as any)}
                className={`flex-1 flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-[1.5rem] border-2 transition-all font-sans ${
                  pestFilter === btn.id 
                    ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-lg shadow-orange-500/10' 
                    : 'border-slate-50 bg-slate-50/50 text-slate-400 hover:border-slate-200'
                }`}
              >
                {btn.icon}
                <span className="text-[9px] font-black uppercase tracking-tighter">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pest List */}
        <div className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar space-y-4">
          <AnimatePresence mode="popLayout">
            {crop.pestsAndDiseases.length > 0 ? (
              crop.pestsAndDiseases.map((item, idx) => (
                <PestCard key={item.id} item={item} index={idx} />
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-slate-300 font-sans"
              >
                <div className="bg-slate-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-4">
                  <Info size={40} strokeWidth={1} />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">Chưa có dữ liệu</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const PestCard: React.FC<{ item: PestDisease, index: number }> = ({ item, index }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95, x: 20 }}
    animate={{ opacity: 1, scale: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -4 }}
    className="flex gap-5 p-4 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
  >
    <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500 border border-slate-50">
      <img 
        src={item.imageUrl} 
        alt={item.name} 
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="flex flex-col justify-center flex-1 space-y-1 font-sans">
      <div className="flex flex-col">
        <span className="text-orange-500 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">{item.category}</span>
        <h4 className="text-xl font-black text-slate-800 tracking-tighter uppercase leading-tight">{item.name}</h4>
      </div>
      <p className="text-[11px] text-slate-400 italic font-bold">({item.scientificName})</p>
    </div>
    <div className="flex items-center text-slate-300 group-hover:text-emerald-500 transition-colors">
      <motion.div whileHover={{ x: 3 }}>
        <ChevronRight size={24} />
      </motion.div>
    </div>
  </motion.div>
);

export default KnowledgeHandbook;
