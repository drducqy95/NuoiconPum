import React, { useState, useEffect } from 'react';
import { 
  Syringe, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  MapPin, 
  FileText, 
  AlertCircle, 
  Check, 
  Filter, 
  ListFilter, 
  Table, 
  Info, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Heart,
  CheckSquare,
  Square,
  Baby as BabyIcon,
  Tag
} from 'lucide-react';
import { 
  getTrackedVaccines, 
  saveTrackedVaccines, 
  addTrackedVaccine, 
  updateTrackedVaccine, 
  deleteTrackedVaccine, 
  TrackedVaccineRecord 
} from '../data/vaccineTrackerStorage';
import { babyProfileStorage, getBabyAgeText, BabyProfile, DEFAULT_BABY_PROFILE } from '../data/babyProfileStorage';
import { 
  NATIONAL_VACCINE_MATRIX, 
  DETAILED_VACCINES, 
  VACCINE_RULES, 
  BRAND_VACCINE_CATALOG,
  VaccineBrandPreset
} from '../data/vaccineKnowledge';

export const VaccinePage: React.FC = () => {
  const [babyProfile, setBabyProfile] = useState<BabyProfile>(DEFAULT_BABY_PROFILE);
  const [records, setRecords] = useState<TrackedVaccineRecord[]>(getTrackedVaccines());
  
  // Page mode: 'tracker' (Sổ tiêm chủng cá nhân) | 'guide' (Bảng lịch tiêm & cẩm nang)
  const [activePageTab, setActivePageTab] = useState<'tracker' | 'guide'>('tracker');

  // Filter status for tracker: 'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'SCHEDULED' | 'COMPLETED'>('ALL');

  // Checklist Selection Modal State
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  // Add / Edit Modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);

  // Form Fields
  const [formVaccineName, setFormVaccineName] = useState('');
  const [formDoseLabel, setFormDoseLabel] = useState('');
  const [formStatus, setFormStatus] = useState<'PENDING' | 'SCHEDULED' | 'COMPLETED'>('PENDING');
  const [formScheduledDate, setFormScheduledDate] = useState('');
  const [formCompletedDate, setFormCompletedDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formReactionNotes, setFormReactionNotes] = useState('');

  // Guide Tab States
  const [selectedVaccineId, setSelectedVaccineId] = useState<string>('6in1');
  const [matrixFilter, setMatrixFilter] = useState<'ALL' | 'TCMR' | 'DV'>('ALL');

  useEffect(() => {
    babyProfileStorage.getProfile().then(profile => {
      setBabyProfile(profile);
    });
    setRecords(getTrackedVaccines());
  }, []);

  const currentVaccineDetail = DETAILED_VACCINES.find(v => v.id === selectedVaccineId) || DETAILED_VACCINES[0];

  // Quick Stats
  const completedCount = records.filter(r => r.status === 'COMPLETED').length;
  const scheduledCount = records.filter(r => r.status === 'SCHEDULED').length;
  const pendingCount = records.filter(r => r.status === 'PENDING').length;

  const filteredRecords = records.filter(r => {
    if (statusFilter === 'ALL') return true;
    return r.status === statusFilter;
  });

  // Toggle Completion Checkbox in Table
  const handleToggleChecklistCompleted = (rec: TrackedVaccineRecord) => {
    const isCompleted = rec.status === 'COMPLETED';
    const nextStatus = isCompleted ? 'PENDING' : 'COMPLETED';
    const completedDate = nextStatus === 'COMPLETED' ? (rec.completedDate || new Date().toISOString().split('T')[0]) : undefined;

    const updated = updateTrackedVaccine(rec.id, {
      status: nextStatus,
      completedDate: completedDate
    });
    setRecords(updated);
  };

  // Toggle Selection of a Specific Vaccine Brand in Checklist Modal
  const handleToggleBrandSelection = (preset: VaccineBrandPreset) => {
    const existing = records.find(r => r.vaccineId === preset.id || r.vaccineName.includes(preset.brandName));
    if (existing) {
      // Remove
      const updated = deleteTrackedVaccine(existing.id);
      setRecords(updated);
    } else {
      // Add
      addTrackedVaccine({
        vaccineId: preset.id,
        vaccineName: `${preset.brandName} (${preset.categoryName})`,
        doseLabel: `${preset.manufacturer} • ${preset.totalDosesText}`,
        status: 'PENDING',
        location: preset.defaultLocation,
        notes: `Phòng bệnh: ${preset.targetDiseases}`
      });
      setRecords(getTrackedVaccines());
    }
  };

  const handleOpenAddForm = () => {
    setFormVaccineName('');
    setFormDoseLabel('');
    setFormStatus('PENDING');
    setFormScheduledDate('');
    setFormCompletedDate('');
    setFormLocation('VNVC');
    setFormNotes('');
    setFormReactionNotes('');
    setEditingRecordId(null);
    setShowAddForm(true);
  };

  const handleOpenEditForm = (rec: TrackedVaccineRecord) => {
    setFormVaccineName(rec.vaccineName);
    setFormDoseLabel(rec.doseLabel || '');
    setFormStatus(rec.status);
    setFormScheduledDate(rec.scheduledDate || '');
    setFormCompletedDate(rec.completedDate || '');
    setFormLocation(rec.location || '');
    setFormNotes(rec.notes || '');
    setFormReactionNotes(rec.reactionNotes || '');
    setEditingRecordId(rec.id);
    setShowAddForm(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formVaccineName.trim()) return;

    if (editingRecordId) {
      const updated = updateTrackedVaccine(editingRecordId, {
        vaccineName: formVaccineName.trim(),
        doseLabel: formDoseLabel.trim(),
        status: formStatus,
        scheduledDate: formScheduledDate,
        completedDate: formCompletedDate,
        location: formLocation.trim(),
        notes: formNotes.trim(),
        reactionNotes: formReactionNotes.trim(),
      });
      setRecords(updated);
    } else {
      addTrackedVaccine({
        vaccineId: 'custom',
        vaccineName: formVaccineName.trim(),
        doseLabel: formDoseLabel.trim(),
        status: formStatus,
        scheduledDate: formScheduledDate,
        completedDate: formCompletedDate,
        location: formLocation.trim(),
        notes: formNotes.trim(),
        reactionNotes: formReactionNotes.trim(),
      });
      setRecords(getTrackedVaccines());
    }

    setShowAddForm(false);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vắc-xin này khỏi sổ theo dõi?')) {
      const updated = deleteTrackedVaccine(id);
      setRecords(updated);
    }
  };

  // Group BRAND_VACCINE_CATALOG by Category Name for clear modal display
  const groupedBrandCatalog = BRAND_VACCINE_CATALOG.reduce((acc, item) => {
    if (!acc[item.categoryName]) {
      acc[item.categoryName] = [];
    }
    acc[item.categoryName].push(item);
    return acc;
  }, {} as Record<string, VaccineBrandPreset[]>);

  const filteredMatrix = NATIONAL_VACCINE_MATRIX.filter(row => {
    if (matrixFilter === 'ALL') return true;
    if (matrixFilter === 'TCMR') return row.programType === 'TCMR' || row.programType === 'BOTH';
    if (matrixFilter === 'DV') return row.programType === 'DV' || row.programType === 'BOTH';
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto w-full bg-slate-50 pb-16 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Baby Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {babyProfile.avatarUrl ? (
              <img 
                src={babyProfile.avatarUrl} 
                alt={babyProfile.name} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/80 shadow-md flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-md flex-shrink-0">
                <Syringe className="w-9 h-9 text-white" />
              </div>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black">{babyProfile.name}</h1>
                {babyProfile.nickname && (
                  <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                    "{babyProfile.nickname}"
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                <span className="bg-white/20 font-bold px-2.5 py-1 rounded-lg border border-white/20">
                  🎂 {getBabyAgeText(babyProfile.birthDate)}
                </span>
                {babyProfile.bloodType && (
                  <span className="bg-rose-500/80 font-bold px-2 py-1 rounded-lg border border-white/20">
                    🩸 Nhóm máu: {babyProfile.bloodType}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-3 gap-2 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-center">
            <div>
              <span className="text-lg font-black text-emerald-200 block">{completedCount}</span>
              <span className="text-[11px] font-medium text-white/90">Đã tiêm</span>
            </div>
            <div className="border-x border-white/20">
              <span className="text-lg font-black text-amber-200 block">{scheduledCount}</span>
              <span className="text-[11px] font-medium text-white/90">Hẹn tiêm</span>
            </div>
            <div>
              <span className="text-lg font-black text-white block">{pendingCount}</span>
              <span className="text-[11px] font-medium text-white/90">Chưa tiêm</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Switcher */}
        <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs font-bold text-xs">
          <button
            type="button"
            onClick={() => setActivePageTab('tracker')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activePageTab === 'tracker' 
                ? 'bg-emerald-600 text-white shadow-sm font-extrabold' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Table size={16} />
            <span>Bảng Theo Dõi Biệt Dược Vắc-Xin ({records.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePageTab('guide')}
            className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activePageTab === 'guide' 
                ? 'bg-emerald-600 text-white shadow-sm font-extrabold' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Syringe size={16} />
            <span>Lịch Tiêm Quốc Gia & Tra Cứu Y Khoa</span>
          </button>
        </div>

        {/* TAB 1: BẢNG SỔ THEO DÕI BIỆT DƯỢC VẮC-XIN */}
        {activePageTab === 'tracker' && (
          <div className="space-y-4">
            
            {/* Header Controls: Filters & Checklist Selection Button */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              
              {/* Status Filter Tabs */}
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  Tất cả ({records.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('COMPLETED')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'}`}
                >
                  🟢 Đã tiêm ({completedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('SCHEDULED')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'SCHEDULED' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-500'}`}
                >
                  🔵 Hẹn tiêm ({scheduledCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'PENDING' ? 'bg-slate-700 text-white shadow-2xs' : 'text-slate-500'}`}
                >
                  ⚪ Chưa tiêm ({pendingCount})
                </button>
              </div>

              {/* Action Buttons: Add / Checklist Select by Brand */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowChecklistModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <CheckSquare size={16} />
                  <span>+ Chọn Vắc-Xin Theo Biệt Dược</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 shadow-2xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  <span>+ Tự Nhập Khác</span>
                </button>
              </div>
            </div>

            {/* BẢNG SỔ THEO DÕI BIỆT DƯỢC VẮC-XIN */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Table className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Bảng Sổ Theo Dõi Tiêm Chủng Theo Loại Vắc-Xin & Biệt Dược
                    </h2>
                    <p className="text-xs text-slate-500">
                      Tích chọn ô [✓] để cập nhật hoàn thành tiêm chủng & bổ sung chú thích phản ứng sau tiêm
                    </p>
                  </div>
                </div>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center space-y-3">
                  <Syringe className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">Chưa có loại vắc-xin nào được chọn</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Hãy bấm nút <strong>"+ Chọn Vắc-Xin Theo Biệt Dược"</strong> để chọn loại vắc-xin & biệt dược cụ thể (Hexaxim, Infanrix, Prevenar 13, Synflorix, Rotarix, Rotateq...) vào sổ theo dõi của bé.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-white text-[11px] font-extrabold uppercase tracking-wider">
                        <th className="p-3 text-center w-12">Tích Đã Tiêm</th>
                        <th className="p-3 min-w-[200px]">Loại Vắc-Xin & Tên Biệt Dược</th>
                        <th className="p-3 min-w-[170px]">Hãng Dược & Phác Đồ Tiêm</th>
                        <th className="p-3 min-w-[110px]">Trạng Thái</th>
                        <th className="p-3 min-w-[130px]">Ngày Tiêm / Hẹn Tiêm</th>
                        <th className="p-3 min-w-[130px]">Cơ Sở Y Tế</th>
                        <th className="p-3 min-w-[200px]">Chú Thích & Phản Ứng Sau Tiêm</th>
                        <th className="p-3 text-center min-w-[90px]">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredRecords.map((rec, idx) => {
                        const isCompleted = rec.status === 'COMPLETED';
                        return (
                          <tr key={rec.id} className={idx % 2 === 0 ? 'bg-white hover:bg-emerald-50/40 transition-colors' : 'bg-slate-50/60 hover:bg-emerald-50/40 transition-colors'}>
                            
                            {/* Checklist Box Column */}
                            <td className="p-3 text-center align-middle">
                              <button
                                type="button"
                                onClick={() => handleToggleChecklistCompleted(rec)}
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all mx-auto cursor-pointer ${
                                  isCompleted 
                                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' 
                                    : 'border-slate-300 bg-white text-transparent hover:border-emerald-500'
                                }`}
                                title={isCompleted ? 'Đánh dấu chưa tiêm' : 'Đánh dấu ĐÃ TIÊM'}
                              >
                                <Check size={16} strokeWidth={3} className={isCompleted ? 'opacity-100' : 'opacity-0'} />
                              </button>
                            </td>

                            {/* Vaccine Name & Brand Title */}
                            <td className="p-3 font-bold text-slate-900 align-middle space-y-1">
                              <div className="text-xs text-slate-900 font-extrabold flex items-center">
                                <Tag size={13} className="text-indigo-600 mr-1.5 flex-shrink-0" />
                                <span>{rec.vaccineName}</span>
                              </div>
                            </td>

                            {/* Manufacturer & Dose Schedule */}
                            <td className="p-3 align-middle text-slate-700 text-[11px] leading-relaxed">
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                                {rec.doseLabel || 'Phác đồ nhi khoa'}
                              </span>
                            </td>

                            {/* Status Badge */}
                            <td className="p-3 align-middle">
                              <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border inline-flex items-center ${
                                rec.status === 'COMPLETED' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                  : (rec.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-800 border-blue-300' : 'bg-slate-100 text-slate-700 border-slate-300')
                              }`}>
                                {rec.status === 'COMPLETED' && '🟢 Đã tiêm'}
                                {rec.status === 'SCHEDULED' && '🔵 Hẹn tiêm'}
                                {rec.status === 'PENDING' && '⚪ Chưa tiêm'}
                              </span>
                            </td>

                            {/* Dates */}
                            <td className="p-3 align-middle font-medium text-slate-800">
                              {rec.status === 'COMPLETED' && rec.completedDate && (
                                <div className="text-emerald-900 font-bold flex items-center">
                                  <CheckCircle2 size={13} className="mr-1 text-emerald-600" />
                                  <span>{rec.completedDate}</span>
                                </div>
                              )}
                              {rec.status === 'SCHEDULED' && rec.scheduledDate && (
                                <div className="text-blue-900 font-bold flex items-center">
                                  <Calendar size={13} className="mr-1 text-blue-600" />
                                  <span>{rec.scheduledDate}</span>
                                </div>
                              )}
                              {!rec.completedDate && !rec.scheduledDate && (
                                <span className="text-slate-400 italic text-[11px]">Chưa cài ngày</span>
                              )}
                            </td>

                            {/* Location */}
                            <td className="p-3 align-middle text-slate-700 font-medium">
                              {rec.location ? (
                                <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-800">
                                  {rec.location}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">—</span>
                              )}
                            </td>

                            {/* Notes & Reactions Column */}
                            <td className="p-3 align-middle text-slate-700 text-[11px]">
                              <div className="space-y-1">
                                {rec.reactionNotes && (
                                  <div className="text-amber-900 font-semibold bg-amber-50 p-1.5 rounded border border-amber-200">
                                    🤒 <strong>Phản ứng:</strong> {rec.reactionNotes}
                                  </div>
                                )}
                                {rec.notes && (
                                  <div className="text-slate-700 italic">
                                    📝 {rec.notes}
                                  </div>
                                )}
                                {!rec.reactionNotes && !rec.notes && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditForm(rec)}
                                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                                  >
                                    + Thêm chú thích
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-center align-middle">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditForm(rec)}
                                  className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                  title="Sửa thông tin"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRecord(rec.id)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Xóa khỏi sổ"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: LỊCH TIÊM QUỐC GIA & TRA CỨU Y KHOA */}
        {activePageTab === 'guide' && (
          <div className="space-y-6">
            
            {/* Rules Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {VACCINE_RULES.map((rule, idx) => (
                <div key={idx} className={`p-3.5 rounded-xl border ${idx === 2 ? 'bg-rose-50 border-rose-200 text-rose-950' : 'bg-white border-gray-200 text-gray-800 shadow-2xs'}`}>
                  <h3 className={`font-bold text-xs mb-1.5 flex items-center ${idx === 2 ? 'text-rose-700' : 'text-emerald-800'}`}>
                    {idx === 2 ? <AlertCircle className="w-3.5 h-3.5 text-rose-600 mr-1.5" /> : <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />}
                    {rule.title}
                  </h3>
                  <ul className="space-y-1 text-[11px] leading-tight">
                    {rule.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start">
                        <span className="mr-1 text-emerald-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* National Vaccine Matrix Table */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
                      Bảng Lịch Tiêm Chủng Mở Rộng & Dịch Vụ Quốc Gia
                    </h2>
                    <p className="text-[11px] text-gray-500">Mô phỏng ma trận tiêm chủng đầy đủ 100% nội dung</p>
                  </div>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setMatrixFilter('ALL')}
                    className={`px-2.5 py-1 rounded transition-all ${matrixFilter === 'ALL' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatrixFilter('TCMR')}
                    className={`px-2.5 py-1 rounded transition-all ${matrixFilter === 'TCMR' ? 'bg-rose-600 text-white shadow-2xs' : 'text-gray-500'}`}
                  >
                    🔴 TCMR
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatrixFilter('DV')}
                    className={`px-2.5 py-1 rounded transition-all ${matrixFilter === 'DV' ? 'bg-amber-500 text-white shadow-2xs' : 'text-gray-500'}`}
                  >
                    🟨 Dịch vụ
                  </button>
                </div>
              </div>

              {/* Table Matrix */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-2xs">
                <table className="w-full text-center border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-800 text-white text-[11px] font-extrabold uppercase tracking-wider">
                      <th className="p-2.5 text-left min-w-[170px] sticky left-0 bg-slate-800 z-10">Tên Vắc-Xin & Phòng Bệnh</th>
                      <th className="p-2 min-w-[50px]">Sơ sinh</th>
                      <th className="p-2 min-w-[50px]">2T</th>
                      <th className="p-2 min-w-[50px]">3T</th>
                      <th className="p-2 min-w-[50px]">4T</th>
                      <th className="p-2 min-w-[50px]">6T</th>
                      <th className="p-2 min-w-[50px]">9T</th>
                      <th className="p-2 min-w-[50px]">12T</th>
                      <th className="p-2 min-w-[55px]">18-24T</th>
                      <th className="p-2 min-w-[55px]">4-6 Tuổi</th>
                      <th className="p-2.5 text-left min-w-[150px]">Ghi Chú Thương Hiệu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredMatrix.map((row, idx) => (
                      <tr key={row.id} className={idx % 2 === 0 ? 'bg-white hover:bg-emerald-50/40' : 'bg-slate-50/60 hover:bg-emerald-50/40'}>
                        <td className="p-2 text-left font-bold text-gray-900 align-middle sticky left-0 bg-inherit z-10 border-r border-gray-200">
                          <div className="flex items-center space-x-1.5">
                            <span className={`text-[9px] font-black px-1 py-0.2 rounded border flex-shrink-0 ${
                              row.programType === 'TCMR' ? 'bg-rose-100 text-rose-900 border-rose-200' : 'bg-amber-100 text-amber-900 border-amber-200'
                            }`}>
                              {row.programType === 'TCMR' ? 'TCMR' : 'DV'}
                            </span>
                            <span className="text-xs text-gray-900 leading-tight">{row.vaccineName}</span>
                          </div>
                        </td>
                        <td className="p-1.5 align-middle">{row.newborn ? <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">{row.newborn}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="p-1.5 align-middle">{row.month2 ? <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">{row.month2}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="p-1.5 align-middle">{row.month3 ? <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">{row.month3}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="p-1.5 align-middle">{row.month4 ? <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">{row.month4}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="p-1.5 align-middle">{row.month6 ? <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">{row.month6}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="p-1.5 align-middle">{row.month9 ? <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">{row.month9}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="p-1.5 align-middle">{row.month12 ? <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap">{row.month12}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="p-1.5 align-middle">{row.month18_24 ? <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">{row.month18_24}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="p-1.5 align-middle">{row.years4_6 ? <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">{row.years4_6}</span> : <span className="text-gray-300 text-xs">—</span>}</td>
                        <td className="p-2 text-left text-[11px] text-gray-600 font-medium align-middle">{row.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic Dropdown Lookup */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
                    <ListFilter className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
                      Tra Cứu Động Chi Tiết Từng Loại Vắc-Xin
                    </h2>
                    <p className="text-[11px] text-gray-500">Chọn vắc-xin từ Dropdown để xem cẩm nang y khoa</p>
                  </div>
                </div>

                <div className="w-full sm:w-72">
                  <select
                    value={selectedVaccineId}
                    onChange={(e) => setSelectedVaccineId(e.target.value)}
                    className="w-full bg-slate-50 border border-violet-300 rounded-xl px-3 py-2 text-xs font-extrabold text-violet-950 focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer"
                  >
                    {DETAILED_VACCINES.map((v) => (
                      <option key={v.id} value={v.id}>
                        💉 {v.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentVaccineDetail && (
                <div className="bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-indigo-50/40 rounded-xl border border-violet-200 p-4 space-y-3 text-xs">
                  <div className="flex items-center space-x-2 border-b border-violet-200 pb-2">
                    <span className="p-1.5 rounded-lg bg-violet-600 text-white font-extrabold text-xs">
                      {currentVaccineDetail.code}
                    </span>
                    <h3 className="text-sm font-extrabold text-violet-950">
                      {currentVaccineDetail.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-violet-100 space-y-1">
                      <strong className="text-gray-900 font-bold block text-[11px] border-b pb-1">🦠 Bệnh Phòng Ngừa:</strong>
                      <p className="text-gray-700 text-xs font-medium">{currentVaccineDetail.diseasePrevented}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-violet-100 space-y-1">
                      <strong className="text-gray-900 font-bold block text-[11px] border-b pb-1">💉 Phác Đồ & Số Mũi:</strong>
                      <p className="text-indigo-900 font-bold text-xs">{currentVaccineDetail.totalDoses}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-violet-100 space-y-1">
                      <strong className="text-gray-900 font-bold block text-[11px] border-b pb-1">🏢 Hãng Sản Xuất:</strong>
                      <p className="text-gray-800 font-bold text-xs">{currentVaccineDetail.manufacturers}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
                      <strong className="text-amber-900 font-bold block text-[11px] border-b border-amber-200 pb-1">🤒 Phản Ứng Phụ:</strong>
                      <p className="text-amber-950 font-medium text-xs">{currentVaccineDetail.sideEffects}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* BRAND-BASED CHECKLIST SELECTION MODAL */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-5 space-y-4 max-h-[88vh] flex flex-col font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-shrink-0">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center">
                <CheckSquare className="w-5 h-5 text-indigo-600 mr-2" />
                Checklist Chọn Vắc-Xin Theo Loại & Tên Biệt Dược Cụ Thể
              </h3>
              <button 
                type="button" 
                onClick={() => setShowChecklistModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 flex-shrink-0">
              Tích chọn biệt dược vắc-xin cụ thể (*Hexaxim, Infanrix, Prevenar 13, Synflorix, Rotarix, Rotateq...*) để đưa vào <strong>Bảng Sổ Theo Dõi Tiêm Chủng</strong> của bé:
            </p>

            {/* Checklist Grouped by Vaccine Category */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {Object.entries(groupedBrandCatalog).map(([categoryName, brands]) => (
                <div key={categoryName} className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <h4 className="font-black text-slate-900 text-xs flex items-center text-indigo-900 border-b border-slate-200/80 pb-1.5">
                    <Tag size={13} className="text-indigo-600 mr-1.5" />
                    {categoryName}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {brands.map((preset) => {
                      const isChecked = records.some(r => r.vaccineId === preset.id || r.vaccineName.includes(preset.brandName));
                      return (
                        <div 
                          key={preset.id}
                          onClick={() => handleToggleBrandSelection(preset)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked 
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-2xs' 
                              : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0 ${
                              isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                            }`}>
                              <Check size={12} strokeWidth={3} className={isChecked ? 'opacity-100' : 'opacity-0'} />
                            </div>
                            <div>
                              <div className="font-extrabold text-xs text-slate-900">{preset.brandName}</div>
                              <div className="text-[10px] text-indigo-700 font-semibold">{preset.manufacturer}</div>
                              <div className="text-[10px] text-slate-500 font-medium">{preset.totalDosesText}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowChecklistModal(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-sm cursor-pointer"
              >
                Hoàn Tất Chọn ({records.length} biệt dược trong sổ)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Record Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center">
                <Syringe className="w-5 h-5 text-emerald-600 mr-2" />
                {editingRecordId ? 'Chỉnh Sửa Loại Vắc-Xin / Biệt Dược' : 'Thêm Loại Vắc-Xin / Biệt Dược Mới'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-3.5 text-xs">
              
              {/* Vaccine Name */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Tên Vắc-Xin & Biệt Dược <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hexaxim (6 trong 1), Prevenar 13, Rotarix..."
                  value={formVaccineName}
                  onChange={(e) => setFormVaccineName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Dose Label & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Hãng Dược & Phác Đồ Tiêm</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Sanofi Pasteur • 4 mũi tiêm..."
                    value={formDoseLabel}
                    onChange={(e) => setFormDoseLabel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Trạng Thái Tiêm</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="PENDING">⚪ Chưa tiêm</option>
                    <option value="SCHEDULED">🔵 Hẹn tiêm</option>
                    <option value="COMPLETED">🟢 Đã tiêm</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ngày Hẹn Tiêm</label>
                  <input
                    type="date"
                    value={formScheduledDate}
                    onChange={(e) => setFormScheduledDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Ngày Đã Tiêm Thực Tế</label>
                  <input
                    type="date"
                    value={formCompletedDate}
                    onChange={(e) => setFormCompletedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Cơ Sở Y Tế / Địa Điểm Tiêm</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Trung tâm Tiêm chủng VNVC, Trạm Y tế phường, Pasteur..."
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Reaction Notes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Phản Ứng Sau Tiêm (Sốt, sưng đau...)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Sốt 38°C chườm mát tự khỏi sau 24h, hơi quấy..."
                  value={formReactionNotes}
                  onChange={(e) => setFormReactionNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Personal Notes */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Ghi Chú Cá Nhân & Thông Tin Tiêm</label>
                <textarea
                  rows={2}
                  placeholder="Số lô vắc-xin, tên bác sĩ khám, phác đồ mũi tiêm..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold shadow-sm cursor-pointer"
                >
                  {editingRecordId ? 'Cập Nhật' : 'Lưu Vào Sổ'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default VaccinePage;
