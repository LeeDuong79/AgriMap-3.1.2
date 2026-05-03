
import React, { useState } from 'react';
import { FarmerUser } from '../types';
import { User, Phone, Mail, Calendar, Users, LogOut, Save, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FarmerProfileProps {
  user: FarmerUser;
  onLogout: () => void;
  onUpdateUser: (user: FarmerUser) => void;
}

const FarmerProfile: React.FC<FarmerProfileProps> = ({ user, onLogout, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user.representative || '',
    email: `${user.id.toLowerCase()}@agrimap.vn`,
    phone: user.phone || '',
    dob: '1990-01-01',
    gender: 'Nam'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    const updatedUser: FarmerUser = {
      ...user,
      representative: profileData.fullName,
      phone: profileData.phone,
    };
    onUpdateUser(updatedUser);
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 pb-24 max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center mt-6">
        <div className="relative inline-block">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-white overflow-hidden"
          >
            <User size={64} />
          </motion.div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute bottom-6 right-0 bg-emerald-500 p-2.5 rounded-full border-4 border-white shadow-lg text-white"
          >
            <ShieldCheck size={18} />
          </motion.div>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2">{user.farmName}</h1>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          Mã số nông hộ: {user.id}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Thông tin cá nhân</h2>
          {!isEditing && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(true)}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-bold text-xs uppercase shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
            >
              Chỉnh sửa
            </motion.button>
          )}
        </div>

        <div className="space-y-6">
          {/* Họ và Tên */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <User size={14} className="text-emerald-500" /> Họ và Tên
            </label>
            <input
              type="text"
              name="fullName"
              disabled={!isEditing}
              value={profileData.fullName}
              onChange={handleChange}
              className={`w-full bg-slate-50 border ${isEditing ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' : 'border-slate-100'} p-4 rounded-2xl font-bold text-slate-700 focus:border-emerald-500 focus:bg-white outline-none transition-all`}
              placeholder="Nhập họ và tên..."
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Mail size={14} className="text-emerald-500" /> Email
            </label>
            <input
              type="email"
              name="email"
              disabled={!isEditing}
              value={profileData.email}
              onChange={handleChange}
              className={`w-full bg-slate-50 border ${isEditing ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' : 'border-slate-100'} p-4 rounded-2xl font-bold text-slate-700 focus:border-emerald-500 focus:bg-white outline-none transition-all`}
              placeholder="example@agrimap.vn"
            />
          </div>

          {/* Số điện thoại */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
              <Phone size={14} className="text-emerald-500" /> Số điện thoại
            </label>
            <input
              type="tel"
              name="phone"
              disabled={!isEditing}
              value={profileData.phone}
              onChange={handleChange}
              className={`w-full bg-slate-50 border ${isEditing ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' : 'border-slate-100'} p-4 rounded-2xl font-bold text-slate-700 focus:border-emerald-500 focus:bg-white outline-none transition-all`}
              placeholder="09xxx..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ngày sinh */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Calendar size={14} className="text-emerald-500" /> Ngày sinh
              </label>
              <input
                type="date"
                name="dob"
                disabled={!isEditing}
                value={profileData.dob}
                onChange={handleChange}
                className={`w-full bg-slate-50 border ${isEditing ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' : 'border-slate-100'} p-4 rounded-2xl font-bold text-slate-700 focus:border-emerald-500 focus:bg-white outline-none transition-all`}
              />
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Users size={14} className="text-emerald-500" /> Giới tính
              </label>
              <select
                name="gender"
                disabled={!isEditing}
                value={profileData.gender}
                onChange={handleChange}
                className={`w-full bg-slate-50 border ${isEditing ? 'border-emerald-500 ring-4 ring-emerald-500/10 bg-white' : 'border-slate-100'} p-4 rounded-2xl font-bold text-slate-700 focus:border-emerald-500 focus:bg-white outline-none transition-all appearance-none outline-none`}
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-bold text-sm uppercase transition-all"
              >
                Hủy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm uppercase shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
              >
                <Save size={20} /> Lưu thông tin
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6 pt-4">
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsLogoutDialogOpen(true)}
          className="w-full bg-white border border-slate-100 text-slate-700 py-6 rounded-[2rem] font-black text-sm uppercase flex items-center justify-center gap-3 shadow-sm hover:shadow-xl hover:shadow-red-950/5 hover:text-red-600 transition-all duration-300"
        >
          <LogOut size={22} className="text-red-500" /> Đăng xuất tài khoản
        </motion.button>
        
        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          AgriMap Premium v2.5.0 • Digital Agriculture
        </p>
      </div>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {isLogoutDialogOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogoutDialogOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl relative z-10 text-center space-y-8"
            >
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
                <LogOut size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Đăng xuất?</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Bạn có chắc chắn muốn thoát khỏi hệ thống AgriMap không?</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsLogoutDialogOpen(false)}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all"
                >
                  Hủy
                </button>
                <button 
                  onClick={() => {
                    setIsLogoutDialogOpen(false);
                    onLogout();
                  }}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-red-600/20 transition-all"
                >
                  Xác nhận thoát
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FarmerProfile;
