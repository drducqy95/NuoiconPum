import React, { useState } from 'react';
import {
  Sparkles,
  Milk,
  Zap,
  ShieldCheck,
  Search,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  fetchFormulaDatabase,
  searchFormulaBrands,
  calculateDailyNutrients,
  FormulaBrand
} from '../../data/formulaDatabase';
import { useEffect } from 'react';
import { EasyDayLog, getDayTotalMilk } from '../../data/easyStorage';

interface FormulaLookupTabProps {
  dayLog: EasyDayLog | null;
}

export const FormulaLookupTab: React.FC<FormulaLookupTabProps> = ({ dayLog }) => {
  const [formulaSearch, setFormulaSearch] = useState<string>('');
  const [formulaStageFilter, setFormulaStageFilter] = useState<string>('all');
  const [selectedFormulaIdForCalc, setSelectedFormulaIdForCalc] = useState<string>('aptamil-profutura-1');
  const [expandedFormulaId, setExpandedFormulaId] = useState<string | null>(null);
  const [formulaDatabase, setFormulaDatabase] = useState<FormulaBrand[]>([]);
  useEffect(() => {
    fetchFormulaDatabase().then(data => setFormulaDatabase(data));
  }, []);

  if (formulaDatabase.length === 0) return <div className="p-4 text-center">Đang tải dữ liệu...</div>;
  

  const milkStats = dayLog ? getDayTotalMilk(dayLog) : { formulaMilkTotal: 0, grandTotal: 0 };
  const currentFormulaMl = milkStats.formulaMilkTotal || milkStats.grandTotal || 0;
  const selectedBrand = formulaDatabase.find(b => b.id === selectedFormulaIdForCalc) || formulaDatabase[0];
  const intakeCalc = calculateDailyNutrients(selectedBrand, currentFormulaMl > 0 ? currentFormulaMl : 500);

  const brands = searchFormulaBrands(formulaDatabase, formulaSearch, formulaStageFilter);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>Dinh dưỡng nhi khoa y khoa</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Thư Viện Tra Cứu Sữa Công Thức & Dinh Dưỡng
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-1 max-w-2xl leading-relaxed">
              Tra cứu bảng hàm lượng 30+ vi chất dinh dưỡng chuẩn trên lon sữa thực tế và tự động tính toán tổng vi chất nạp vào hàng ngày cho bé.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/15 p-3 rounded-2xl backdrop-blur-xs border border-white/20 text-center">
            <Milk className="w-10 h-10 text-amber-100 mx-auto mb-1" />
            <span className="text-[10px] font-bold text-amber-100 block">25+ Dòng sữa chuẩn</span>
          </div>
        </div>
      </div>

      {/* Máy Tính Dinh Dưỡng Nạp Trong Ngày Banner */}
      <div className="bg-white rounded-2xl border border-amber-200 p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                Máy Tính Dinh Dưỡng Nạp Trong Ngày
              </h3>
              <p className="text-xs text-gray-500">
                Tự động tính tổng Kcal, Đạm, Béo, Canxi, DHA, Sắt, Vitamin D3 bé nạp trong ngày theo lịch EASY hiện tại
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900">
            <span>Tổng Sữa CT Hôm Nay:</span>
            <span className="text-sm font-black text-amber-700">{currentFormulaMl} ml</span>
          </div>
        </div>

        {/* Dropdown select formula brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-gray-200">
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Chọn Dòng Sữa Công Thức Đang Cho Bé Ti:
            </label>
            <select
              value={selectedFormulaIdForCalc}
              onChange={(e) => setSelectedFormulaIdForCalc(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {formulaDatabase.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.brand} - {b.originCountry})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <p>• <strong>Tỷ lệ pha chuẩn:</strong> {selectedBrand.scoopRatio}</p>
            <p>• <strong>Nhiệt độ nước:</strong> {selectedBrand.waterTempC}°C</p>
            <p>• <strong>Năng lượng chuẩn:</strong> {selectedBrand.nutrientsPer100ml.energyKcal} kcal / 100ml</p>
          </div>
        </div>

        {/* Nutrient Intake Grid Results */}
        <div>
          <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mr-1.5" />
            Kết quả Tổng hợp Dưỡng chất nạp vào ({intakeCalc.volumeMl}ml sữa {selectedBrand.name})
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Energy */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Năng Lượng</span>
              <span className="text-lg font-black text-amber-950 block">{intakeCalc.energyKcal} kcal</span>
              <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${intakeCalc.percentRdaEnergy}%` }}></div>
              </div>
              <span className="text-[10px] text-amber-700 font-semibold">{intakeCalc.percentRdaEnergy}% Nhu cầu/ngày</span>
            </div>

            {/* Protein */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">Chất Đạm</span>
              <span className="text-lg font-black text-rose-950 block">{intakeCalc.proteinG} g</span>
              <div className="w-full bg-rose-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-600 h-1.5 rounded-full" style={{ width: `${intakeCalc.percentRdaProtein}%` }}></div>
              </div>
              <span className="text-[10px] text-rose-700 font-semibold">{intakeCalc.percentRdaProtein}% Nhu cầu/ngày</span>
            </div>

            {/* Calcium */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Canxi</span>
              <span className="text-lg font-black text-blue-950 block">{intakeCalc.calciumMg} mg</span>
              <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${intakeCalc.percentRdaCalcium}%` }}></div>
              </div>
              <span className="text-[10px] text-blue-700 font-semibold">{intakeCalc.percentRdaCalcium}% Nhu cầu/ngày</span>
            </div>

            {/* DHA */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">DHA</span>
              <span className="text-lg font-black text-purple-950 block">{intakeCalc.dhaMg} mg</span>
              <div className="w-full bg-purple-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${intakeCalc.percentRdaDha}%` }}></div>
              </div>
              <span className="text-[10px] text-purple-700 font-semibold">{intakeCalc.percentRdaDha}% Nhu cầu/ngày</span>
            </div>

            {/* Vitamin D3 */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Vitamin D3</span>
              <span className="text-lg font-black text-emerald-950 block">{intakeCalc.vitaminD3Ug} mcg</span>
              <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${intakeCalc.percentRdaVitaminD}%` }}></div>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">{intakeCalc.percentRdaVitaminD}% Nhu cầu/ngày</span>
            </div>

            {/* Iron */}
            <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-orange-800 uppercase block">Sắt</span>
              <span className="text-lg font-black text-orange-950 block">{intakeCalc.ironMg} mg</span>
              <span className="text-[10px] text-orange-700 font-medium block">Kẽm: {intakeCalc.zincMg}mg</span>
              <span className="text-[10px] text-orange-700 font-medium block">2'-FL HMO: {intakeCalc.hmo2FlMg}mg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Stage Filter Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm dòng sữa (VD: Aptamil, Meiji, Nan, Enfamil, Sữa Úc, HMO...)"
              value={formulaSearch}
              onChange={(e) => setFormulaSearch(e.target.value)}
              className="w-full bg-slate-50 border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Stage Filter Buttons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'stage1', label: '0 - 6 tháng (Số 1)' },
              { id: 'stage2', label: '6 - 12 tháng (Số 2)' },
              { id: 'stage3', label: '1 - 3 tuổi (Số 3)' },
              { id: 'special', label: 'Sữa Đặc Trị / Dị Ứng' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFormulaStageFilter(filter.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  formulaStageFilter === filter.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formula Cards Catalog Grid */}
      {brands.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 text-xs sm:text-sm">
          Không tìm thấy dòng sữa phù hợp với từ khóa "{formulaSearch}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brands.map((b) => {
            const isExpanded = expandedFormulaId === b.id;
            const n = b.nutrientsPer100ml;

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-amber-400 shadow-md ring-1 ring-amber-300' : 'border-gray-200 shadow-xs hover:border-amber-300'
                }`}
              >
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Card Top Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200">
                          {b.stage}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-gray-700 border border-gray-200">
                          {b.originCountry}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm sm:text-base text-gray-900 leading-snug">
                        {b.name}
                      </h4>
                      <p className="text-xs font-semibold text-amber-700">
                        Hãng sản xuất: {b.brand}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedFormulaIdForCalc(b.id)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex-shrink-0"
                    >
                      Dùng tính dinh dưỡng
                    </button>
                  </div>

                  {/* Highlights badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {b.highlights.map((h, idx) => (
                      <span key={idx} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ {h}
                      </span>
                    ))}
                  </div>

                  {/* Quick Specs summary */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <span className="text-gray-500 text-[10px] block">Tỷ lệ pha chuẩn:</span>
                      <span className="font-bold text-gray-800 text-[11px]">{b.scoopRatio}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-[10px] block">Nhiệt độ nước:</span>
                      <span className="font-bold text-amber-800 text-[11px]">{b.waterTempC}°C</span>
                    </div>
                  </div>

                  {/* Expandable 30+ Nutrient Facts Button */}
                  <button
                    onClick={() => setExpandedFormulaId(isExpanded ? null : b.id)}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-extrabold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{isExpanded ? 'Thu gọn bảng dinh dưỡng' : 'Xem Bảng 30+ Thành Phần Dinh Dưỡng (trên 100ml)'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* EXPANDED 30+ NUTRIENT FACTS TABLE */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-gray-200 space-y-4 animate-fade-in text-xs">
                      <p className="text-[11px] text-gray-500 italic">
                        Mô tả: {b.description}
                      </p>

                      {/* 1. Năng Lượng & Đại Lượng */}
                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200 space-y-2">
                        <h5 className="font-extrabold text-amber-900 text-xs uppercase flex items-center">
                          ⚡ 1. Năng Lượng & Nhóm Đại Lượng (trên 100ml)
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="bg-white p-2 rounded border border-amber-100">
                            <span className="text-gray-500 block">Năng lượng:</span>
                            <strong className="text-amber-950">{n.energyKcal} kcal</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-amber-100">
                            <span className="text-gray-500 block">Chất đạm:</span>
                            <strong className="text-rose-900">{n.proteinG} g</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-amber-100">
                            <span className="text-gray-500 block">Chất béo tổng:</span>
                            <strong className="text-amber-900">{n.fatG} g</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-amber-100">
                            <span className="text-gray-500 block">DHA:</span>
                            <strong className="text-purple-900">{n.dhaMg} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-amber-100">
                            <span className="text-gray-500 block">ARA:</span>
                            <strong className="text-purple-900">{n.araMg || '—'} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-amber-100">
                            <span className="text-gray-500 block">Carbohydrate:</span>
                            <strong className="text-gray-800">{n.carbG} g</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-amber-100">
                            <span className="text-gray-500 block">Xơ GOS/FOS:</span>
                            <strong className="text-emerald-800">{n.fiberGosFosG || '—'} g</strong>
                          </div>
                        </div>
                      </div>

                      {/* 2. Khoáng Chất & Vi Chất */}
                      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-200 space-y-2">
                        <h5 className="font-extrabold text-blue-900 text-xs uppercase flex items-center">
                          🦴 2. Khoáng Chất & Vi Chất (trên 100ml)
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="text-gray-500 block">Canxi:</span>
                            <strong className="text-blue-950">{n.calciumMg} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="text-gray-500 block">Phốt pho:</span>
                            <strong className="text-blue-900">{n.phosphorusMg} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="text-gray-500 block">Sắt:</span>
                            <strong className="text-orange-900">{n.ironMg} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="text-gray-500 block">Kẽm:</span>
                            <strong className="text-indigo-900">{n.zincMg} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="text-gray-500 block">Ma-giê:</span>
                            <strong className="text-gray-800">{n.magnesiumMg || '—'} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="text-gray-500 block">Natri:</span>
                            <strong className="text-gray-800">{n.sodiumMg || '—'} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="text-gray-500 block">Kali:</span>
                            <strong className="text-gray-800">{n.potassiumMg || '—'} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <span className="text-gray-500 block">I-ốt:</span>
                            <strong className="text-gray-800">{n.iodineUg || '—'} mcg</strong>
                          </div>
                        </div>
                      </div>

                      {/* 3. Vitamin Thiết Yếu */}
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 space-y-2">
                        <h5 className="font-extrabold text-emerald-900 text-xs uppercase flex items-center">
                          🌿 3. Vitamin Thiết Yếu (trên 100ml)
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="bg-white p-2 rounded border border-emerald-100">
                            <span className="text-gray-500 block">Vitamin D3:</span>
                            <strong className="text-emerald-950">{n.vitaminD3Ug} mcg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-emerald-100">
                            <span className="text-gray-500 block">Vitamin A:</span>
                            <strong className="text-emerald-900">{n.vitaminAUg} mcg RE</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-emerald-100">
                            <span className="text-gray-500 block">Vitamin C:</span>
                            <strong className="text-emerald-900">{n.vitaminCMg} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-emerald-100">
                            <span className="text-gray-500 block">Vitamin E:</span>
                            <strong className="text-gray-800">{n.vitaminEMg || '—'} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-emerald-100">
                            <span className="text-gray-500 block">Axit Folic (B9):</span>
                            <strong className="text-gray-800">{n.folicAcidUg || '—'} mcg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-emerald-100">
                            <span className="text-gray-500 block">Vitamin B12:</span>
                            <strong className="text-gray-800">{n.vitaminB12Ug || '—'} mcg</strong>
                          </div>
                        </div>
                      </div>

                      {/* 4. Dưỡng Chất Sinh Học & Kháng Thể */}
                      <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-200 space-y-2">
                        <h5 className="font-extrabold text-purple-900 text-xs uppercase flex items-center">
                          🛡️ 4. Dưỡng Chất Sinh Học & Kháng Thể
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                          <div className="bg-white p-2 rounded border border-purple-100">
                            <span className="text-gray-500 block">2'-FL HMO:</span>
                            <strong className="text-purple-950">{n.hmo2FlMg ? `${n.hmo2FlMg} mg` : '—'}</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-purple-100">
                            <span className="text-gray-500 block">Lactoferrin:</span>
                            <strong className="text-purple-950">{n.lactoferrinMg ? `${n.lactoferrinMg} mg` : '—'}</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-purple-100">
                            <span className="text-gray-500 block">Nucleotides:</span>
                            <strong className="text-purple-900">{n.nucleotidesMg ? `${n.nucleotidesMg} mg` : '—'}</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-purple-100">
                            <span className="text-gray-500 block">Choline:</span>
                            <strong className="text-gray-800">{n.cholineMg ? `${n.cholineMg} mg` : '—'} mg</strong>
                          </div>
                          <div className="bg-white p-2 rounded border border-purple-100 col-span-2">
                            <span className="text-gray-500 block">Men vi sinh (Probiotics):</span>
                            <strong className="text-emerald-700">{n.probioticsCfu || 'Không bổ sung'}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormulaLookupTab;
