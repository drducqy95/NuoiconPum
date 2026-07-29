import React, { useEffect, useState } from 'react';
import { Baby, Camera, Trash2, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { babyProfileStorage, BabyProfile, DEFAULT_BABY_PROFILE, getBabyAgeText } from '../../data/babyProfileStorage';

export const BabyProfileSection: React.FC = () => {
  const [babyProfile, setBabyProfile] = useState<BabyProfile>(DEFAULT_BABY_PROFILE);
  const [savingBaby, setSavingBaby] = useState(false);
  const [babySaveResult, setBabySaveResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    babyProfileStorage.getProfile().then(setBabyProfile);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBabyProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBabyProfile = async () => {
    setSavingBaby(true);
    setBabySaveResult(null);
    try {
      await babyProfileStorage.saveProfile(babyProfile);
      setBabySaveResult({ type: 'success', text: 'Đã cập nhật hồ sơ và thông tin y tế của bé thành công!' });
    } catch (err) {
      console.error(err);
      setBabySaveResult({ type: 'error', text: 'Lỗi lưu hồ sơ bé.' });
    } finally {
      setSavingBaby(false);
    }
  };

  const babyAgeText = babyProfile ? getBabyAgeText(babyProfile.birthDate) : '';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <Baby className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hồ Sơ Của Bé (Cá Nhân & Thông Tin Y Tế)</h2>
            <p className="text-xs text-gray-500">Dùng để cá nhân hóa Trợ lý AI tư vấn chính xác theo độ tuổi và thể trạng bé</p>
          </div>
        </div>

        {babyAgeText && (
          <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 rounded-full border border-rose-200">
            🎂 {babyAgeText}
          </span>
        )}
      </div>

      {babySaveResult && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2 animate-fade-in ${
          babySaveResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {babySaveResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
          <span>{babySaveResult.text}</span>
        </div>
      )}

      {/* Avatar Upload Header Section */}
      <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5 bg-slate-50 p-4 rounded-2xl border border-gray-200">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-rose-100 flex items-center justify-center text-rose-400">
            {babyProfile.avatarUrl ? (
              <img src={babyProfile.avatarUrl} alt="Baby Avatar" className="w-full h-full object-cover" />
            ) : (
              <Baby className="w-12 h-12 text-rose-400" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full cursor-pointer shadow-md transition-transform hover:scale-110">
            <Camera size={14} />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <h3 className="text-base font-extrabold text-gray-900">
            {babyProfile.name || 'Bé chưa đặt tên'} ({babyProfile.nickname || 'Pum'})
          </h3>
          <p className="text-xs text-gray-500">
            Tải ảnh đại diện siêu đáng yêu của bé để hiển thị trên toàn ứng dụng
          </p>
          {babyProfile.avatarUrl && (
            <button
              type="button"
              onClick={() => setBabyProfile(prev => ({ ...prev, avatarUrl: '' }))}
              className="text-xs text-rose-600 font-bold hover:underline inline-flex items-center space-x-1 cursor-pointer pt-1"
            >
              <Trash2 size={12} />
              <span>Xóa ảnh đại diện</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. THÔNG TIN CÁ NHÂN */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center">
          <Baby className="w-4 h-4 text-rose-500 mr-1.5" />
          1. Thông Tin Cá Nhân Bé
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Tên đầy đủ khai sinh:</label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn Pum"
              value={babyProfile.name}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Tên gọi ở nhà (Nickname):</label>
            <input
              type="text"
              placeholder="VD: Bé Pum, Bé Thỏ"
              value={babyProfile.nickname}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, nickname: e.target.value }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Ngày sinh của bé:</label>
            <input
              type="date"
              value={babyProfile.birthDate}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, birthDate: e.target.value }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Giới tính:</label>
            <select
              value={babyProfile.gender}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            >
              <option value="male">Bé Trai</option>
              <option value="female">Bé Gái</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. CHỈ SỐ SINH & TIỀN SỬ */}
      <div className="space-y-3 pt-3 border-t border-gray-100">
        <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center">
          <Baby className="w-4 h-4 text-sky-500 mr-1.5" />
          2. Chỉ Số Lúc Sinh & Tiền Sử
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Tuổi thai lúc sinh (Tuần):</label>
            <input
              type="number"
              placeholder="VD: 39"
              value={babyProfile.gestationalAgeWeeks || ''}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, gestationalAgeWeeks: parseInt(e.target.value) || 0 }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Cân nặng lúc sinh (kg):</label>
            <input
              type="number"
              step="0.1"
              placeholder="VD: 3.2"
              value={babyProfile.birthWeightKg || ''}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, birthWeightKg: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Chiều dài lúc sinh (cm):</label>
            <input
              type="number"
              step="0.5"
              placeholder="VD: 50"
              value={babyProfile.birthHeightCm || ''}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, birthHeightCm: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Vòng đầu lúc sinh (cm):</label>
            <input
              type="number"
              step="0.5"
              placeholder="VD: 34"
              value={babyProfile.birthHeadCircumferenceCm || ''}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, birthHeadCircumferenceCm: parseFloat(e.target.value) || 0 }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-3">
          <div>
            <label className="block text-gray-700 font-bold mb-1">Tiền sử bệnh lý (Nếu có):</label>
            <textarea
              placeholder="VD: Viêm phế quản, trào ngược..."
              value={babyProfile.medicalHistory || ''}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, medicalHistory: e.target.value }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none h-16 resize-none"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-1">Dị ứng (Thức ăn, thuốc...):</label>
            <textarea
              placeholder="VD: Dị ứng đạm bò, lactose..."
              value={babyProfile.allergies || ''}
              onChange={(e) => setBabyProfile(prev => ({ ...prev, allergies: e.target.value }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none h-16 resize-none text-rose-600"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSaveBabyProfile}
          disabled={savingBaby}
          className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{savingBaby ? 'Đang lưu...' : 'Lưu Hồ Sơ Bé'}</span>
        </button>
      </div>
    </div>
  );
};
