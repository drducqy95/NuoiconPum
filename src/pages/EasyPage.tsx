import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  EASY_PRESETS,
  EasyPresetId,
  EasyDayLog,
  EasyCycleLog,
  generateDefaultDayLog,
  cascadeRecalculateCycles,
  addMinutesToTime,
  getMinutesBetweenTimes,
  getSafeDurationMinutes,
  isValidTimeStr,
  getCycleTotalMilk,
  getDayTotalMilk,
  easyStorage
} from '../data/easyStorage';
import {
  Clock,
  BookOpen,
  Calendar,
  Sparkles,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Baby,
  Heart,
  Milk,
  Bed,
  Smile,
  ArrowRight,
  HelpCircle,
  FileText,
  ShieldCheck,
  Zap,
  Search,
  Info
} from 'lucide-react';

export const EasyPage: React.FC = () => {
  const { subpage } = useParams<{ subpage?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeTab = subpage === 'knowledge' ? 'knowledge' : 'schedule';

  // Date selection state
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // EASY Schedule State
  const [dayLog, setDayLog] = useState<EasyDayLog | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<EasyPresetId>('easy3');
  const [morningWake, setMorningWake] = useState<string>('07:00');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // EASY Knowledge Hub State
  const [knowledgeCategory, setKnowledgeCategory] = useState<string>('all');
  const [knowledgeSearch, setKnowledgeSearch] = useState<string>('');
  const [expandedCardId, setExpandedCardId] = useState<string | null>('basics_1');

  // Custom cycle configuration modal/drawer
  const [editingCycleIndex, setEditingCycleIndex] = useState<number | null>(null);

  // Load schedule for selected date
  useEffect(() => {
    let isMounted = true;
    const loadSchedule = async () => {
      try {
        const existing = await easyStorage.getDayLog(selectedDate);
        if (existing && isMounted) {
          setDayLog(existing);
          setSelectedPreset(existing.presetId);
          setMorningWake(existing.morningWakeTime);
        } else if (isMounted) {
          const newLog = generateDefaultDayLog('easy3', '07:00', selectedDate);
          setDayLog(newLog);
          setSelectedPreset('easy3');
          setMorningWake('07:00');
        }
      } catch (err) {
        console.error('Failed to load EASY schedule', err);
      }
    };
    loadSchedule();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Generate or reset schedule with new preset / morning wake time
  const handleApplyPreset = (presetId: EasyPresetId, wakeTime: string) => {
    const newLog = generateDefaultDayLog(presetId, wakeTime, selectedDate);
    setDayLog(newLog);
    setSelectedPreset(presetId);
    easyStorage.saveDayLog(newLog);
  };

  // Dedicated handlers for time modifications that correctly recalculate durations and cascade
  const handleCycleEatStartTimeChange = (index: number, newTime: string) => {
    if (!dayLog || !isValidTimeStr(newTime)) return;
    const orig = dayLog.cycles[index];
    const preset = EASY_PRESETS[dayLog.presetId] || EASY_PRESETS.easy3;
    const presetCycle = preset.cycles[index];

    const wakeMins = getSafeDurationMinutes(orig.eatStartTime, orig.eatEndTime, presetCycle?.wakeDurationMinutes || 60);
    const sleepMins = getSafeDurationMinutes(orig.sleepStartTime, orig.sleepEndTime, presetCycle?.sleepDurationMinutes || 120);

    const eatStartTime = newTime;
    const eatEndTime = addMinutesToTime(eatStartTime, wakeMins);
    const sleepStartTime = eatEndTime;
    const sleepEndTime = addMinutesToTime(sleepStartTime, sleepMins);

    const newCycle: EasyCycleLog = {
      ...orig,
      eatStartTime,
      eatEndTime,
      sleepStartTime,
      sleepEndTime,
    };

    if (index === 0) {
      setMorningWake(newTime);
    }

    const updatedDayLog = cascadeRecalculateCycles(dayLog, index, newCycle);
    setDayLog(updatedDayLog);
    easyStorage.saveDayLog(updatedDayLog);
  };

  const handleCycleEatEndTimeChange = (index: number, newTime: string) => {
    if (!dayLog || !isValidTimeStr(newTime)) return;
    const orig = dayLog.cycles[index];
    const preset = EASY_PRESETS[dayLog.presetId] || EASY_PRESETS.easy3;
    const presetCycle = preset.cycles[index];

    const sleepMins = getSafeDurationMinutes(orig.sleepStartTime, orig.sleepEndTime, presetCycle?.sleepDurationMinutes || 120);

    const eatEndTime = newTime;
    const sleepStartTime = eatEndTime;
    const sleepEndTime = addMinutesToTime(sleepStartTime, sleepMins);

    const newCycle: EasyCycleLog = {
      ...orig,
      eatEndTime,
      sleepStartTime,
      sleepEndTime,
    };

    const updatedDayLog = cascadeRecalculateCycles(dayLog, index, newCycle);
    setDayLog(updatedDayLog);
    easyStorage.saveDayLog(updatedDayLog);
  };

  const handleCycleSleepStartTimeChange = (index: number, newTime: string) => {
    if (!dayLog || !isValidTimeStr(newTime)) return;
    const orig = dayLog.cycles[index];
    const preset = EASY_PRESETS[dayLog.presetId] || EASY_PRESETS.easy3;
    const presetCycle = preset.cycles[index];

    const sleepMins = getSafeDurationMinutes(orig.sleepStartTime, orig.sleepEndTime, presetCycle?.sleepDurationMinutes || 120);

    const sleepStartTime = newTime;
    const eatEndTime = newTime;
    const sleepEndTime = addMinutesToTime(sleepStartTime, sleepMins);

    const newCycle: EasyCycleLog = {
      ...orig,
      eatEndTime,
      sleepStartTime,
      sleepEndTime,
    };

    const updatedDayLog = cascadeRecalculateCycles(dayLog, index, newCycle);
    setDayLog(updatedDayLog);
    easyStorage.saveDayLog(updatedDayLog);
  };

  const handleCycleSleepEndTimeChange = (index: number, newTime: string) => {
    if (!dayLog || !isValidTimeStr(newTime)) return;
    const orig = dayLog.cycles[index];
    const sleepEndTime = newTime;

    const newCycle: EasyCycleLog = {
      ...orig,
      sleepEndTime,
    };

    const updatedDayLog = cascadeRecalculateCycles(dayLog, index, newCycle);
    setDayLog(updatedDayLog);
    easyStorage.saveDayLog(updatedDayLog);
  };

  // Update specific cycle log for non-time fields (milk, diaper, notes, rating)
  const handleUpdateCycle = (
    index: number,
    updatedFields: Partial<EasyCycleLog>,
    shouldRecalculateSubsequent: boolean = false
  ) => {
    if (!dayLog) return;

    const currentCycle = dayLog.cycles[index];
    const newCycle: EasyCycleLog = {
      ...currentCycle,
      ...updatedFields
    };

    let updatedDayLog: EasyDayLog;
    if (shouldRecalculateSubsequent) {
      updatedDayLog = cascadeRecalculateCycles(dayLog, index, newCycle);
    } else {
      const newCycles = [...dayLog.cycles];
      newCycles[index] = newCycle;
      updatedDayLog = {
        ...dayLog,
        cycles: newCycles,
        updatedAt: Date.now()
      };
    }

    setDayLog(updatedDayLog);
    easyStorage.saveDayLog(updatedDayLog);
  };

  // Update night log fields
  const handleUpdateNightLog = (updatedFields: Partial<EasyDayLog>) => {
    if (!dayLog) return;
    const updatedDayLog: EasyDayLog = {
      ...dayLog,
      ...updatedFields,
      updatedAt: Date.now()
    };
    setDayLog(updatedDayLog);
    easyStorage.saveDayLog(updatedDayLog);
  };

  // Sync to daily diary
  const handleSyncToDiary = async () => {
    if (!dayLog) return;
    setIsSaving(true);
    setSyncMessage(null);
    try {
      const diaryId = await easyStorage.syncToDailyDiary(dayLog, user?.uid);
      setSyncMessage('Đã đồng bộ lịch EASY vào Nhật ký ngày thành công!');
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err) {
      console.error('Failed sync to diary', err);
      setSyncMessage('Có lỗi xảy ra khi đồng bộ nhật ký.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full bg-slate-50/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
        
        {/* Compact Header Title Banner */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 rounded-2xl p-4 sm:p-5 text-white shadow-md mb-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-6 pointer-events-none">
            <Clock className="w-40 h-40 text-white" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Nuôi con khoa học E.A.S.Y</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                Lịch Trình & Nếp Sống E.A.S.Y
              </h1>
              <p className="text-xs text-rose-100 mt-0.5 max-w-xl">
                Rèn nếp ăn - ngủ độc lập cho bé, giúp con ăn no, ngủ đủ và ba mẹ thảnh thơi.
              </p>
            </div>

            {/* Sub Navigation Tabs */}
            <div className="flex space-x-1.5 bg-black/15 p-1 rounded-xl backdrop-blur-xs self-start sm:self-center">
              <button
                onClick={() => navigate('/easy')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Lịch EASY</span>
              </button>

              <button
                onClick={() => navigate('/easy/knowledge')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'knowledge'
                    ? 'bg-white text-rose-600 shadow-xs'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Cẩm Nang</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sync Success Toast */}
        {syncMessage && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{syncMessage}</span>
            </div>
            <Link
              to="/diary"
              className="text-xs font-bold text-emerald-700 underline hover:text-emerald-900"
            >
              Xem Nhật ký →
            </Link>
          </div>
        )}

        {/* TAB 1: LỊCH EASY HẰNG NGÀY */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">

            {/* Unified Compact Control Panel Bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-sm space-y-3">
              
              {/* Controls Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                
                {/* 1. Date Picker */}
                <div className="lg:col-span-3 bg-slate-50 p-2.5 rounded-xl border border-gray-200/80">
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>Ngày theo dõi</span>
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full text-xs sm:text-sm font-bold text-gray-900 bg-transparent border-0 p-0 focus:ring-0 cursor-pointer"
                  />
                </div>

                {/* 2. Morning Wake Time */}
                <div className="lg:col-span-3 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/80">
                  <label className="block text-[10px] font-bold uppercase text-amber-800 mb-1 flex items-center space-x-1">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Giờ thức dậy sáng</span>
                  </label>
                  <input
                    type="time"
                    value={morningWake}
                    onChange={(e) => {
                      const newTime = e.target.value;
                      setMorningWake(newTime);
                      if (dayLog && dayLog.cycles.length > 0) {
                        handleCycleEatStartTimeChange(0, newTime);
                      } else {
                        handleApplyPreset(selectedPreset, newTime);
                      }
                    }}
                    className="w-full text-xs sm:text-sm font-bold text-amber-950 bg-white border border-amber-200 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {/* 3. Preset Selector Dropdown */}
                <div className="lg:col-span-3 bg-slate-50 p-2.5 rounded-xl border border-gray-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold uppercase text-gray-500">
                      Mẫu Lịch EASY
                    </label>
                    <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                      {EASY_PRESETS[selectedPreset]?.ageRange}
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={selectedPreset}
                      onChange={(e) => handleApplyPreset(e.target.value as EasyPresetId, morningWake)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1 pr-6 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer appearance-none"
                    >
                      {(Object.keys(EASY_PRESETS) as EasyPresetId[]).map((key) => {
                        const preset = EASY_PRESETS[key];
                        return (
                          <option key={key} value={key}>
                            {preset.name} ({preset.ageRange})
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* 4. Action Buttons */}
                <div className="lg:col-span-3 flex items-center space-x-2">
                  <button
                    onClick={handleSyncToDiary}
                    disabled={isSaving}
                    className="flex-1 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  >
                    {isSaving ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileText className="w-3.5 h-3.5" />
                    )}
                    <span>Đồng bộ Nhật Ký</span>
                  </button>
                  <button
                    onClick={() => handleApplyPreset(selectedPreset, morningWake)}
                    title="Đặt lại tính từ đầu"
                    className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

              </div>

              {/* Selected Preset Description Callout */}
              <div className="text-xs text-gray-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-rose-600">💡 Chi tiết lịch ({EASY_PRESETS[selectedPreset]?.name}):</span>{' '}
                  <span>{EASY_PRESETS[selectedPreset]?.desc}</span>
                </div>
              </div>

            </div>

            {/* Timeline & Interactive Cycles Section */}
            {dayLog && (
              <div className="space-y-4">

                {/* Daily Milk Total Summary Card (Thu gọn, tinh tế) */}
                {dayLog && (() => {
                  const milkStats = getDayTotalMilk(dayLog);
                  return (
                    <div className="bg-white border border-amber-200/90 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl shadow-xs flex-shrink-0">
                          <Milk className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider">Tổng Lượng Sữa Cả Ngày</span>
                            <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                              Tự động tính
                            </span>
                          </div>
                          <div className="text-xl font-black text-amber-950 mt-0.5 flex items-baseline space-x-1">
                            <span>{milkStats.grandTotal}</span>
                            <span className="text-xs font-bold text-amber-800">ml / ngày</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="bg-rose-50/80 border border-rose-200/80 rounded-xl px-3 py-1.5 text-center flex-1 sm:flex-initial min-w-[90px]">
                          <span className="text-gray-500 text-[10px] block font-medium">Sữa mẹ ngày</span>
                          <span className="font-extrabold text-rose-600 text-xs sm:text-sm">{milkStats.breastMilkTotal} ml</span>
                        </div>
                        <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl px-3 py-1.5 text-center flex-1 sm:flex-initial min-w-[90px]">
                          <span className="text-gray-500 text-[10px] block font-medium">Sữa CT ngày</span>
                          <span className="font-extrabold text-amber-700 text-xs sm:text-sm">{milkStats.formulaMilkTotal} ml</span>
                        </div>
                        <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-xl px-3 py-1.5 text-center flex-1 sm:flex-initial min-w-[90px]">
                          <span className="text-gray-500 text-[10px] block font-medium">Cữ bú đêm</span>
                          <span className="font-extrabold text-indigo-700 text-xs sm:text-sm">{milkStats.nightMilk} ml</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* List of Cycles */}
                <div className="space-y-4">
                  {dayLog.cycles.map((cycle, index) => {
                    const wakeMins = getMinutesBetweenTimes(cycle.eatStartTime, cycle.eatEndTime);
                    const sleepMins = getMinutesBetweenTimes(cycle.sleepStartTime, cycle.sleepEndTime);

                    return (
                      <div
                        key={index}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:border-rose-200 transition-colors"
                      >
                        {/* Cycle Card Header */}
                        <div className="px-4 py-3 bg-slate-50/80 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="font-bold text-sm sm:text-base text-gray-900">
                              {cycle.cycleName}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                            Khung giờ: {cycle.eatStartTime} - {cycle.sleepEndTime}
                          </div>
                        </div>

                        {/* Cycle Body */}
                        <div className="p-4 sm:p-5 space-y-4 font-sans">
                          
                          {/* Eat & Activity Block (E & A) */}
                          <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-100 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-2">
                              <div className="flex items-center space-x-2">
                                <Milk className="w-4 h-4 text-amber-600" />
                                <span className="font-bold text-xs sm:text-sm text-amber-900">
                                  E & A: Ăn & Hoạt Động (Thức ~{wakeMins} phút)
                                </span>
                              </div>

                              {/* Time Range Adjustment Inputs & Feed Start Time */}
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                <div className="flex items-center space-x-1">
                                  <span className="text-amber-900 font-bold text-[11px]">Giờ bắt đầu ti/ăn:</span>
                                  <input
                                    type="time"
                                    value={cycle.feedStartTime || cycle.eatStartTime}
                                    onChange={(e) => handleUpdateCycle(index, { feedStartTime: e.target.value }, false)}
                                    className="bg-white border border-amber-300 rounded px-1.5 py-0.5 font-bold text-amber-950 focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  />
                                </div>
                                <div className="text-gray-300">|</div>
                                <div className="flex items-center space-x-1 text-gray-600">
                                  <span>Cữ thức:</span>
                                  <input
                                    type="time"
                                    value={cycle.eatStartTime}
                                    onChange={(e) => handleCycleEatStartTimeChange(index, e.target.value)}
                                    className="bg-white border border-amber-200 rounded px-1.5 py-0.5 font-bold text-amber-950 focus:outline-none"
                                  />
                                  <span>-</span>
                                  <input
                                    type="time"
                                    value={cycle.eatEndTime}
                                    onChange={(e) => handleCycleEatEndTimeChange(index, e.target.value)}
                                    className="bg-white border border-amber-200 rounded px-1.5 py-0.5 font-bold text-amber-950 focus:outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Detailed Parallel Breastfeeding & Formula Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs pt-1">
                              
                              {/* 1. Sữa Mẹ / Ti Mẹ Card */}
                              <div className="bg-white/90 border border-rose-200/90 rounded-xl p-3 space-y-2.5 shadow-2xs">
                                <div className="font-bold text-rose-900 flex items-center justify-between text-[11px] border-b border-rose-100 pb-1.5">
                                  <span className="flex items-center space-x-1">
                                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Sữa Mẹ / Ti Mẹ</span>
                                  </span>
                                  <div className="flex items-center space-x-1 text-[10px]">
                                    <span className="text-rose-600 font-medium">Bắt đầu:</span>
                                    <input
                                      type="time"
                                      value={cycle.breastfeedStartTime || cycle.feedStartTime || cycle.eatStartTime}
                                      onChange={(e) => handleUpdateCycle(index, { breastfeedStartTime: e.target.value }, false)}
                                      className="bg-rose-50/60 border border-rose-200 rounded px-1 py-0.2 font-bold text-rose-900 text-[10px]"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                                  <div>
                                    <label className="block text-gray-500 text-[10px] mb-0.5 truncate">Ti mẹ (phút)</label>
                                    <input
                                      type="number"
                                      placeholder="p"
                                      value={cycle.breastfeedDurationMinutes ?? ''}
                                      onChange={(e) => {
                                        handleUpdateCycle(index, {
                                          breastfeedDurationMinutes: e.target.value ? Number(e.target.value) : null
                                        }, false);
                                      }}
                                      className="w-full bg-white border border-rose-200 rounded px-1.5 py-1 font-bold text-gray-900 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-gray-500 text-[10px] mb-0.5 truncate">Số lần ti</label>
                                    <input
                                      type="number"
                                      placeholder="lần"
                                      value={cycle.breastfeedLatchingCount ?? ''}
                                      onChange={(e) => {
                                        handleUpdateCycle(index, {
                                          breastfeedLatchingCount: e.target.value ? Number(e.target.value) : null
                                        }, false);
                                      }}
                                      className="w-full bg-white border border-rose-200 rounded px-1.5 py-1 font-bold text-gray-900 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-rose-700 text-[10px] font-semibold mb-0.5 truncate">Sữa mẹ (ml)</label>
                                    <input
                                      type="number"
                                      placeholder="ml"
                                      value={cycle.breastMilkVolumeMl ?? ''}
                                      onChange={(e) => {
                                        const newBm = e.target.value ? Number(e.target.value) : null;
                                        const fm = cycle.formulaMilkVolumeMl || 0;
                                        handleUpdateCycle(index, {
                                          breastMilkVolumeMl: newBm,
                                          milkVolumeMl: (newBm || 0) + fm
                                        }, false);
                                      }}
                                      className="w-full bg-white border border-rose-200 rounded px-1.5 py-1 font-bold text-rose-700 focus:ring-1 focus:ring-rose-400 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* 2. Sữa Công Thức Card (Tương tự Sữa Mẹ) */}
                              <div className="bg-white/90 border border-amber-200/90 rounded-xl p-3 space-y-2.5 shadow-2xs">
                                <div className="font-bold text-amber-900 flex items-center justify-between text-[11px] border-b border-amber-100 pb-1.5">
                                  <span className="flex items-center space-x-1">
                                    <Milk className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Sữa Công Thức</span>
                                  </span>
                                  <div className="flex items-center space-x-1 text-[10px]">
                                    <span className="text-amber-700 font-medium">Bắt đầu:</span>
                                    <input
                                      type="time"
                                      value={cycle.formulaFeedStartTime || cycle.feedStartTime || cycle.eatStartTime}
                                      onChange={(e) => handleUpdateCycle(index, { formulaFeedStartTime: e.target.value }, false)}
                                      className="bg-amber-50/60 border border-amber-200 rounded px-1 py-0.2 font-bold text-amber-900 text-[10px]"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                                  <div>
                                    <label className="block text-gray-500 text-[10px] mb-0.5 truncate">Thời gian (p)</label>
                                    <input
                                      type="number"
                                      placeholder="p"
                                      value={cycle.formulaFeedDurationMinutes ?? ''}
                                      onChange={(e) => {
                                        handleUpdateCycle(index, {
                                          formulaFeedDurationMinutes: e.target.value ? Number(e.target.value) : null
                                        }, false);
                                      }}
                                      className="w-full bg-white border border-amber-200 rounded px-1.5 py-1 font-bold text-gray-900 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-gray-500 text-[10px] mb-0.5 truncate">Số lần bú</label>
                                    <input
                                      type="number"
                                      placeholder="lần"
                                      value={cycle.formulaFeedCount ?? ''}
                                      onChange={(e) => {
                                        handleUpdateCycle(index, {
                                          formulaFeedCount: e.target.value ? Number(e.target.value) : null
                                        }, false);
                                      }}
                                      className="w-full bg-white border border-amber-200 rounded px-1.5 py-1 font-bold text-gray-900 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-amber-800 text-[10px] font-semibold mb-0.5 truncate">Sữa CT (ml)</label>
                                    <input
                                      type="number"
                                      placeholder="ml"
                                      value={cycle.formulaMilkVolumeMl ?? ''}
                                      onChange={(e) => {
                                        const newFm = e.target.value ? Number(e.target.value) : null;
                                        const bm = cycle.breastMilkVolumeMl || 0;
                                        handleUpdateCycle(index, {
                                          formulaMilkVolumeMl: newFm,
                                          milkVolumeMl: bm + (newFm || 0)
                                        }, false);
                                      }}
                                      className="w-full bg-white border border-amber-200 rounded px-1.5 py-1 font-bold text-amber-800 focus:ring-1 focus:ring-amber-400 focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* 3. Dynamic Total per Cycle Badge Card */}
                              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-300/80 rounded-xl p-3 flex flex-col justify-between sm:col-span-2 lg:col-span-1 shadow-2xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase font-bold text-amber-900 tracking-wider">
                                    Tổng Sữa Cữ Này
                                  </span>
                                  <span className="text-[10px] font-semibold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">
                                    Tự động cộng
                                  </span>
                                </div>
                                <div className="flex items-baseline space-x-1.5 my-1">
                                  <span className="text-2xl font-black text-amber-950">
                                    {getCycleTotalMilk(cycle)}
                                  </span>
                                  <span className="text-xs font-bold text-amber-800">ml</span>
                                </div>
                                <div className="text-[10px] text-gray-500 font-medium">
                                  Sữa mẹ ({cycle.breastMilkVolumeMl || 0}ml) + Sữa CT ({cycle.formulaMilkVolumeMl || 0}ml)
                                </div>
                              </div>

                            </div>
                          </div>

                          {/* Sleep Block (S) */}
                          <div className="p-3.5 rounded-xl bg-purple-50/40 border border-purple-100 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-100 pb-2">
                              <div className="flex items-center space-x-2">
                                <Bed className="w-4 h-4 text-purple-600" />
                                <span className="font-bold text-xs sm:text-sm text-purple-900">
                                  S: Giấc ngủ Nap ({sleepMins > 0 ? `~${sleepMins} phút` : 'Ngủ đêm'})
                                </span>
                              </div>

                              {/* Sleep time inputs */}
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="text-gray-500 font-medium">Bắt đầu ngủ:</span>
                                <input
                                  type="time"
                                  value={cycle.sleepStartTime}
                                  onChange={(e) => handleCycleSleepStartTimeChange(index, e.target.value)}
                                  className="bg-white border border-purple-200 rounded px-2 py-0.5 font-bold text-purple-950 focus:outline-none"
                                />
                                <span className="text-gray-500 font-medium">Thức dậy:</span>
                                <input
                                  type="time"
                                  value={cycle.sleepEndTime}
                                  onChange={(e) => handleCycleSleepEndTimeChange(index, e.target.value)}
                                  className="bg-white border border-purple-200 rounded px-2 py-0.5 font-bold text-purple-950 focus:outline-none"
                                />
                              </div>
                            </div>

                            {/* Sleep Quality & Diaper Checks */}
                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600 font-semibold">Chất lượng giấc ngủ:</span>
                                <div className="flex space-x-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => handleUpdateCycle(index, { sleptWellRating: star as any }, false)}
                                      className={`text-base leading-none transition-transform hover:scale-125 cursor-pointer ${
                                        (cycle.sleptWellRating || 5) >= star ? 'text-amber-400' : 'text-gray-300'
                                      }`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center space-x-3">
                                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cycle.wetDiaper || false}
                                    onChange={(e) => handleUpdateCycle(index, { wetDiaper: e.target.checked }, false)}
                                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                                  />
                                  <span className="text-gray-700 font-medium">Tã ướt (tè)</span>
                                </label>
                                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={cycle.dirtyDiaper || false}
                                    onChange={(e) => handleUpdateCycle(index, { dirtyDiaper: e.target.checked }, false)}
                                    className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                                  />
                                  <span className="text-gray-700 font-medium">Tã dơ (đi ngoài)</span>
                                </label>
                              </div>
                            </div>
                          </div>

                          {/* Your Time Banner (Y) */}
                          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-800">
                            <div className="flex items-center space-x-2">
                              <Smile className="w-4 h-4 text-emerald-600" />
                              <span className="font-semibold">Y - Your Time:</span>
                              <span>Bé đang ngủ, mẹ nghỉ ngơi, thư giãn hoặc hoàn thành việc riêng!</span>
                            </div>
                            <span className="font-bold text-emerald-700 hidden sm:inline">~{sleepMins} phút</span>
                          </div>

                          {/* Note input for this cycle */}
                          <div>
                            <input
                              type="text"
                              placeholder="Thêm ghi chú cho cữ này (ví dụ: Bé tự ngủ sau 5p, trớ nhẹ, chơi ngoan...)"
                              value={cycle.notes || ''}
                              onChange={(e) => handleUpdateCycle(index, { notes: e.target.value }, false)}
                              className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Night Schedule & Night Feeds Section */}
                <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-800/60 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-800/80 pb-4 gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-indigo-900/90 rounded-xl text-yellow-300 ring-1 ring-yellow-400/30">
                        <Moon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                          <span>Lịch Chi Tiết & Ghi Chú Cữ Đêm</span>
                          <span className="bg-indigo-900/90 text-yellow-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-yellow-400/30">
                            Đêm & Bú Đêm
                          </span>
                        </h3>
                        <p className="text-xs text-indigo-200 mt-0.5">
                          Quản lý cữ bú đêm, số lần thức giấc và ghi chú trình tự ngủ đêm của bé.
                        </p>
                      </div>
                    </div>

                    {/* Bedtime Start Selector */}
                    <div className="flex items-center space-x-2 bg-indigo-900/80 border border-indigo-700/80 px-3 py-1.5 rounded-xl">
                      <span className="text-xs font-semibold text-indigo-200 whitespace-nowrap">Bắt đầu giấc đêm:</span>
                      <input
                        type="time"
                        value={dayLog.bedtimeStart || '19:30'}
                        onChange={(e) => handleUpdateNightLog({ bedtimeStart: e.target.value })}
                        className="bg-indigo-950 text-yellow-300 font-bold text-xs sm:text-sm border border-indigo-600 rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Night Controls Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* 1. Night Feeds & Milk */}
                    <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center space-x-2 text-yellow-300 font-bold text-xs">
                        <Milk className="w-4 h-4 text-yellow-400" />
                        <span>Cữ Bú Đêm & Lượng Sữa</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] text-indigo-200 font-medium mb-1">Số cữ bú đêm:</label>
                          <select
                            value={dayLog.nightFeedCount ?? 1}
                            onChange={(e) => handleUpdateNightLog({ nightFeedCount: Number(e.target.value) })}
                            className="w-full bg-indigo-950 border border-indigo-700 rounded-lg px-2 py-1.5 text-white font-bold text-xs focus:outline-none"
                          >
                            {[0, 1, 2, 3, 4, 5].map((num) => (
                              <option key={num} value={num} className="bg-slate-900 text-white">
                                {num === 0 ? 'Không bú đêm' : `${num} cữ bú`}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] text-indigo-200 font-medium mb-1">Tổng ml đêm:</label>
                          <input
                            type="number"
                            placeholder="vd: 120"
                            value={dayLog.nightMilkVolumeMl || ''}
                            onChange={(e) => handleUpdateNightLog({ nightMilkVolumeMl: e.target.value ? Number(e.target.value) : null })}
                            className="w-full bg-indigo-950 border border-indigo-700 rounded-lg px-2 py-1 text-yellow-300 font-bold text-xs placeholder-indigo-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-indigo-200 font-medium mb-1">Loại sữa đêm:</label>
                        <select
                          value={dayLog.nightMilkType || 'breast'}
                          onChange={(e) => handleUpdateNightLog({ nightMilkType: e.target.value as any })}
                          className="w-full bg-indigo-950 border border-indigo-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                        >
                          <option value="breast" className="bg-slate-900">Sữa mẹ (Ti trực tiếp / Bú bình)</option>
                          <option value="formula" className="bg-slate-900">Sữa công thức</option>
                          <option value="mixed" className="bg-slate-900">Hỗn hợp</option>
                        </select>
                      </div>
                    </div>

                    {/* 2. Night Sleep & Wakeups */}
                    <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center space-x-2 text-yellow-300 font-bold text-xs">
                        <Bed className="w-4 h-4 text-purple-300" />
                        <span>Thức Giấc & Giấc Ngủ Đêm</span>
                      </div>

                      <div>
                        <label className="block text-[11px] text-indigo-200 font-medium mb-1">Số lần bé thức giấc đêm:</label>
                        <select
                          value={dayLog.nightWakeCount ?? 1}
                          onChange={(e) => handleUpdateNightLog({ nightWakeCount: Number(e.target.value) })}
                          className="w-full bg-indigo-950 border border-indigo-700 rounded-lg px-2 py-1.5 text-white font-bold text-xs focus:outline-none"
                        >
                          {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                            <option key={num} value={num} className="bg-slate-900 text-white">
                              {num === 0 ? 'Ngủ xuyên đêm (0 lần)' : `${num} lần thức giấc`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-indigo-200 font-medium mb-1">Chất lượng ngủ đêm:</label>
                        <div className="flex space-x-1.5 pt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => handleUpdateNightLog({ nightSleepQuality: star as any })}
                              className={`text-lg leading-none transition-transform hover:scale-125 cursor-pointer ${
                                (dayLog.nightSleepQuality || 5) >= star ? 'text-yellow-400' : 'text-indigo-700'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 3. Night Diapers */}
                    <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center space-x-2 text-yellow-300 font-bold text-xs">
                        <Baby className="w-4 h-4 text-pink-300" />
                        <span>Thay Tã Đêm</span>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        <label className="flex items-center space-x-2 text-xs text-indigo-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dayLog.nightWetDiaper ?? true}
                            onChange={(e) => handleUpdateNightLog({ nightWetDiaper: e.target.checked })}
                            className="rounded border-indigo-600 text-yellow-400 focus:ring-yellow-400 bg-indigo-950"
                          />
                          <span>Có thay tã ướt (tè) ban đêm</span>
                        </label>

                        <label className="flex items-center space-x-2 text-xs text-indigo-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dayLog.nightDirtyDiaper ?? false}
                            onChange={(e) => handleUpdateNightLog({ nightDirtyDiaper: e.target.checked })}
                            className="rounded border-indigo-600 text-yellow-400 focus:ring-yellow-400 bg-indigo-950"
                          />
                          <span>Có thay tã dơ (đi ngoài) ban đêm</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 4. Detailed Night Notes Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-indigo-200 mb-1.5 flex items-center justify-between">
                      <span>Ghi chú chi tiết cho cữ đêm & giấc ngủ đêm:</span>
                      <span className="text-[10px] text-indigo-300 font-normal">Ví dụ: giờ bú, phản ứng bé, tự ngủ...</span>
                    </label>
                    <textarea
                      rows={2.5}
                      placeholder="Ví dụ: Cữ 1 (01:30): Bé dậy ti mẹ 15p tự ngủ lại. Cữ 2 (04:30): Bú 90ml Sữa công thức, vỗ ợ hơi nhẹ rồi ngủ tiếp đến 07:00..."
                      value={dayLog.nightNotes || ''}
                      onChange={(e) => handleUpdateNightLog({ nightNotes: e.target.value })}
                      className="w-full bg-indigo-950/90 border border-indigo-700/80 rounded-xl p-3 text-xs text-indigo-100 placeholder-indigo-400/70 focus:outline-none focus:ring-2 focus:ring-yellow-400/80 focus:border-transparent leading-relaxed resize-none"
                    />
                  </div>

                  {/* Action & Sync Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-indigo-800/80">
                    <div className="text-xs text-indigo-200 flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                      <span>Đồng bộ toàn bộ lịch ngày & đêm vào Nhật Ký Theo Dõi</span>
                    </div>
                    <button
                      onClick={handleSyncToDiary}
                      disabled={isSaving}
                      className="w-full sm:w-auto px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Đang lưu...' : 'Lưu & Đồng Bộ Vào Nhật Ký'}</span>
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* TAB 2: CẨM NANG KIẾN THỨC EASY */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            
            {/* Overview Banner */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-gray-900">Cẩm Nang Khoa Học E.A.S.Y</h2>
                    <p className="text-xs text-gray-500">Kiến thức Y khoa & Kinh nghiệm thực chiến giúp rèn nếp sống tự lập cho bé</p>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết, mẹo..."
                    value={knowledgeSearch}
                    onChange={(e) => setKnowledgeSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Core EASY Process Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">E</div>
                    <h3 className="font-bold text-xs text-amber-950">Eat (Ăn)</h3>
                  </div>
                  <p className="text-[11px] text-amber-900/80 leading-relaxed">
                    Bé ăn ngay sau khi vừa ngủ dậy. Tỉnh táo nhất để nạp đủ lượng sữa cần thiết, tuyệt đối không vừa ti vừa ngủ.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500 text-white font-black text-xs flex items-center justify-center">A</div>
                    <h3 className="font-bold text-xs text-blue-950">Activity (Chơi)</h3>
                  </div>
                  <p className="text-[11px] text-blue-900/80 leading-relaxed">
                    Ợ hơi, vận động tay chân, tummy time, trò chuyện. Tạo môi trường kích thích giác quan giúp bé xả năng lượng.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-purple-500 text-white font-black text-xs flex items-center justify-center">S</div>
                    <h3 className="font-bold text-xs text-purple-950">Sleep (Ngủ)</h3>
                  </div>
                  <p className="text-[11px] text-purple-900/80 leading-relaxed">
                    Thực hiện trình tự wind-down và đặt bé tự ngủ khi có tín hiệu gắt ngủ. Giúp não bộ phục hồi và phát triển chiều cao.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-black text-xs flex items-center justify-center">Y</div>
                    <h3 className="font-bold text-sm text-emerald-950">Your time (Mẹ)</h3>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                    Khoảng thời gian nghỉ ngơi riêng tư cho mẹ khi bé đang trong giấc ngủ: thư giãn, hút sữa, giải trí tái tạo sức lao động.
                  </p>
                </div>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
              {[
                { id: 'all', label: 'Tất cả bài viết' },
                { id: 'basics', label: '1. Triết lý & Thuật ngữ' },
                { id: 'sleep', label: '2. Giấc ngủ & Tự ngủ' },
                { id: 'feeding', label: '3. Sữa & Dinh dưỡng' },
                { id: 'troubleshoot', label: '4. Xử lý Catnap & Gắt ngủ' },
                { id: 'regression', label: '5. Khủng hoảng & Chuyển lịch' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setKnowledgeCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl border whitespace-nowrap cursor-pointer transition-all ${
                    knowledgeCategory === cat.id
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Age Schedule Comparison Matrix */}
            {(knowledgeCategory === 'all' || knowledgeCategory === 'basics') && !knowledgeSearch && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center">
                  <Sparkles className="w-4 h-4 text-rose-500 mr-2" />
                  So Sánh Chi Tiết Các Mẫu Lịch EASY Theo Độ Tuổi
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-gray-200 text-gray-700 font-bold">
                        <th className="p-2.5">Lịch EASY</th>
                        <th className="p-2.5">Độ tuổi phù hợp</th>
                        <th className="p-2.5">Thời gian Thức (A)</th>
                        <th className="p-2.5">Thời gian Ngủ (S)</th>
                        <th className="p-2.5">Lượng cữ ăn ngày</th>
                        <th className="p-2.5">Đặc điểm chính</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-600">
                      <tr className="hover:bg-rose-50/20">
                        <td className="p-2.5 font-extrabold text-rose-600">EASY 3</td>
                        <td className="p-2.5 font-bold text-gray-900">0 - 3 tháng</td>
                        <td className="p-2.5 font-semibold text-amber-800">1.0 - 1.5 tiếng</td>
                        <td className="p-2.5 font-semibold text-indigo-800">1.5 - 2.0 tiếng</td>
                        <td className="p-2.5">5 cữ ngày + đêm</td>
                        <td className="p-2.5">Bé mới sinh, dạ dày nhỏ, cần ăn liên tục mỗi 3h.</td>
                      </tr>
                      <tr className="hover:bg-rose-50/20">
                        <td className="p-2.5 font-extrabold text-rose-600">EASY 4</td>
                        <td className="p-2.5 font-bold text-gray-900">3 - 6 tháng</td>
                        <td className="p-2.5 font-semibold text-amber-800">1.5 - 2.0 tiếng</td>
                        <td className="p-2.5 font-semibold text-indigo-800">1.5 - 2.0 tiếng</td>
                        <td className="p-2.5">4 cữ ngày + 1 cữ catnap</td>
                        <td className="p-2.5">Sức chứa dạ dày lớn hơn, giãn cữ bú lên 4h. Giảm bú đêm.</td>
                      </tr>
                      <tr className="hover:bg-rose-50/20">
                        <td className="p-2.5 font-extrabold text-rose-600">EASY 2-3-4</td>
                        <td className="p-2.5 font-bold text-gray-900">7 - 11 tháng</td>
                        <td className="p-2.5 font-semibold text-amber-800">2h ➔ 3h ➔ 4h</td>
                        <td className="p-2.5 font-semibold text-indigo-800">1.5 - 2.0 tiếng / giấc</td>
                        <td className="p-2.5">3 cữ sữa + 2 cữ ăn dặm</td>
                        <td className="p-2.5">Gồm 2 giấc ngày. Kết hợp hoàn hảo với nếp ăn dặm.</td>
                      </tr>
                      <tr className="hover:bg-rose-50/20">
                        <td className="p-2.5 font-extrabold text-rose-600">EASY 5-6</td>
                        <td className="p-2.5 font-bold text-gray-900">12 - 18+ tháng</td>
                        <td className="p-2.5 font-semibold text-amber-800">5.0 - 6.0 tiếng</td>
                        <td className="p-2.5 font-semibold text-indigo-800">1.5 - 2.5 tiếng</td>
                        <td className="p-2.5">3 cữ ăn chính + sữa</td>
                        <td className="p-2.5">Chuyển sang 1 giấc trưa duy nhất giống sinh hoạt người lớn.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Detailed Knowledge Articles List */}
            {(() => {
              const allArticles = [
                {
                  id: 'basics_1',
                  category: 'basics',
                  tag: 'Triết lý cốt lõi',
                  tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
                  title: '1. Triết Lý EASY: Tách Biệt Ăn Và Ngủ',
                  summary: 'Tại sao việc ghép đôi Ăn và Ngủ (Ti để ngủ) lại tạo ra thói quen ngủ ngắt quãng và bú vặt?',
                  icon: Sparkles,
                  iconColor: 'text-rose-500',
                  content: (
                    <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                      <p>
                        Trong thói quen truyền thống, em bé thường được cho ti mẹ hoặc ti bình ngay trước khi đi ngủ. Điều này vô tình tạo ra phản xạ có điều kiện: <strong>"Có ti mới ngủ được"</strong>. Khi bé cựa quậy chuyển chu kỳ ngủ giữa đêm, bé không thấy ti đâu và sẽ gắt khóc đòi bú lại dù dạ dày không hề đói.
                      </p>
                      <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                        <span className="font-bold block">💡 Lợi ích khi tách biệt Ăn (E) và Ngủ (S):</span>
                        <ul className="list-disc pl-4 space-y-1">
                          <li><strong>Dạ dày khỏe mạnh:</strong> Bé ăn no hoàn toàn ở đầu cữ thức, có đủ thời gian tiêu hóa trước khi ngủ.</li>
                          <li><strong>Không sợ nôn trớ:</strong> Bé được vỗ ợ hơi và chơi đùa (A) từ 30-60 phút trước khi nằm ngủ.</li>
                          <li><strong>Tự ngủ dễ dàng:</strong> Bé đi vào giấc ngủ nhờ sự thư giãn tự nhiên, không phụ thuộc vào ti mẹ hay ti giả.</li>
                        </ul>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'basics_2',
                  category: 'basics',
                  tag: 'Từ điển EASY',
                  tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
                  title: '2. Từ Điển & Thuật Ngữ Vàng Trong EASY',
                  summary: 'Nút chờ (Pause), Wake Window, Catnap, Sleep Cycle nghĩa là gì?',
                  icon: BookOpen,
                  iconColor: 'text-blue-500',
                  content: (
                    <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-900 block">• Nút chờ (Pause):</span>
                          <span>Khoảng thời gian 3 - 5 phút cha mẹ bình tĩnh quan sát khi bé ẹ hẹ, không vội lao vào bế hay đút ti ngay.</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-900 block">• Wake Window (Thời gian thức):</span>
                          <span>Tổng thời gian bé thức giữa 2 giấc ngủ (bao gồm giờ ăn, chơi và trình tự vào giấc).</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-900 block">• Catnap (Giấc ngắn):</span>
                          <span>Giấc ngủ chỉ kéo dài 30 - 45 phút (đúng 1 chu kỳ ngủ nông) bé đã giật mình thức giấc.</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-900 block">• Wind-down (Thư giãn vào giấc):</span>
                          <span>Trình tự 5 - 10 phút chuyển tiếp từ môi trường sáng/sôi động sang phòng tối giúp não bộ bé hạ nhiệt.</span>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'sleep_1',
                  category: 'sleep',
                  tag: 'Phòng ngủ chuẩn',
                  tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
                  title: '3. Môi Trường Ngủ An Toàn Standard Y Khoa',
                  summary: 'Nhiệt độ phòng, độ tối, tiếng ồn trắng & quy tắc chống đột tử sơ sinh (SIDS).',
                  icon: Bed,
                  iconColor: 'text-purple-500',
                  content: (
                    <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                      <ul className="space-y-2 list-disc pl-4">
                        <li><strong>Nhiệt độ phòng lý tưởng:</strong> Duy trì 20 - 22°C (hoặc 22 - 24°C tùy vùng miền). Trẻ sơ sinh thân nhiệt cao hơn người lớn, phòng nóng gây giật mình và quấy khóc.</li>
                        <li><strong>Độ tối phòng ngủ:</strong> Đóng rèm tối 95 - 100% cho cả giấc ngày và đêm để kích thích hormone buồn ngủ Melatonin.</li>
                        <li><strong>Tiếng ồn trắng (White Noise):</strong> Mở liên tục suốt giấc ngủ với âm lượng 50 - 60 dB (tương đương tiếng mưa rơi nhẹ) giúp tái tạo môi trường tử cung và lọc tiếng ồn ngoài.</li>
                        <li><strong>Nằm ngửa hoàn toàn:</strong> Đặt bé nằm ngửa trên đệm phẳng, không dùng gối cao, không để thú bông hay chăn dày quanh mặt bé.</li>
                      </ul>
                    </div>
                  )
                },
                {
                  id: 'sleep_2',
                  category: 'sleep',
                  tag: 'Trình tự 4S / 5S',
                  tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
                  title: '4. Hướng Dẫn Trình Tự Vào Giấc 4S Thần Tốc',
                  summary: 'Quy trình 4 bước chuẩn giúp bé nhận biết tín hiệu đi ngủ mà không cần bế ru.',
                  icon: Moon,
                  iconColor: 'text-purple-600',
                  content: (
                    <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <span className="font-extrabold text-purple-600">Bước 1S - Sleep Space:</span>
                          <span>Bế bé vào phòng tối, bật tiếng ồn trắng, hạ giọng thì thầm.</span>
                        </div>
                        <div className="flex space-x-2">
                          <span className="font-extrabold text-purple-600">Bước 2S - Swaddle:</span>
                          <span>Quấn chũn hoặc mặc nhộng chũn giữ chặt hai tay giúp bé không giật mình phản xạ Moro.</span>
                        </div>
                        <div className="flex space-x-2">
                          <span className="font-extrabold text-purple-600">Bước 3S - Sit:</span>
                          <span>Bế đứng bé trên vai từ 3 - 5 phút thư giãn, vỗ nhẹ lưng đến khi bé thả lỏng hoàn toàn.</span>
                        </div>
                        <div className="flex space-x-2">
                          <span className="font-extrabold text-purple-600">Bước 4S - Shush/Pat:</span>
                          <span>Đặt bé xuống cũi khi bé vẫn còn thiêm thiếp (chưa ngủ hẳn), vỗ nhẹ và suỵt nhẹ giúp bé tự chìm vào giấc.</span>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'feeding_1',
                  category: 'feeding',
                  tag: 'Bú chủ động',
                  tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
                  title: '5. Quy Tắc Cho Bé Bú Chủ Động & Tính Lượng Sữa',
                  summary: 'Nhận biết bé ngụm nuốt thật sự vs ti gật, công thức tính ml sữa chuẩn theo cân nặng.',
                  icon: Milk,
                  iconColor: 'text-amber-600',
                  content: (
                    <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                      <p>
                        <strong>Công thức tính tổng lượng sữa cả ngày:</strong> <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">Cân nặng (kg) x 150ml</span> (Ví dụ: bé 5kg cần khoảng 750ml/ngày).
                      </p>
                      <div className="bg-slate-50 p-3 rounded-xl border border-gray-200 space-y-1.5">
                        <span className="font-bold text-gray-900 block">• Phân biệt Bú Chủ Động (Active Feeding) và Bú Ngủ:</span>
                        <p>Bú chủ động: Mắt bé mở hoặc lim dim nhưng cơ hàm cằm cử động sâu, nghe tiếng ngụm "ực... ực" rõ ràng. Cữ bú hiệu quả kết thúc trong 15 - 25 phút.</p>
                        <p>Bú ngủ/ngậm ti: Bé mút chíp chíp tẻ nhạt ở đầu núm ti, mút vài cái rồi dừng hẳn, không nuốt.</p>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'feeding_2',
                  category: 'feeding',
                  tag: 'Mẹ & Công thức',
                  tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
                  title: '6. Vỗ Ợ Hơi 3 Tư Thế Vàng Ngừa Nôn Trớ',
                  summary: 'Tại sao ợ hơi lại quyết định 80% chất lượng giấc ngủ của bé sơ sinh?',
                  icon: Heart,
                  iconColor: 'text-rose-500',
                  content: (
                    <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                      <p>Trong quá trình bú, bé nuốt rất nhiều không khí vào dạ dày. Bọt khí kẹt lại làm bé đau bụng, đầy hơi và giật mình thức giấc sau 30 phút ngủ.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                          <span className="font-bold text-rose-900 block">Tư thế 1: Vỗ trên vai</span>
                          <span className="text-[11px] text-gray-600">Áp ngực bé vào vai mẹ, một tay đỡ mông, một tay khum lại vỗ nhẹ từ dưới lên.</span>
                        </div>
                        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                          <span className="font-bold text-rose-900 block">Tư thế 2: Vỗ ngồi đỡ cằm</span>
                          <span className="text-[11px] text-gray-600">Cho bé ngồi trên đùi mẹ, tay mẹ đỡ cằm & cổ bé hơi nghiêng về trước, vỗ lưng nhẹ.</span>
                        </div>
                        <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                          <span className="font-bold text-rose-900 block">Tư thế 3: Nằm sấp đùi</span>
                          <span className="text-[11px] text-gray-600">Đặt bé nằm sấp ngang qua đùi mẹ, đầu cao hơn bụng, nhẹ nhàng vuốt và vỗ lưng.</span>
                        </div>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'troubleshoot_1',
                  category: 'troubleshoot',
                  tag: 'Khắc phục Catnap',
                  tagColor: 'bg-rose-50 text-rose-700 border-rose-200',
                  title: '7. Khắc Phục Triệt Để Bé Ngủ Catnap (30-45 Phút)',
                  summary: 'Nguyên nhân bé tỉnh giấc khi vừa kết thúc 1 chu kỳ ngủ nông và các bước nối giấc.',
                  icon: AlertCircle,
                  iconColor: 'text-rose-600',
                  content: (
                    <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                      <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-rose-950 space-y-1">
                        <span className="font-bold block">🚨 4 Nguyên nhân chính gây Catnap:</span>
                        <ul className="list-disc pl-4 space-y-1">
                          <li><strong>Thời gian thức chưa đủ:</strong> Bé chưa tích lũy đủ áp lực ngủ (Sleep Pressure).</li>
                          <li><strong>Quá giấc (Overtired):</strong> Bé thức quá lâu khiến hormone Stress Cortisol tăng cao.</li>
                          <li><strong>Còn kẹt hơi trong bụng:</strong> Chưa được vỗ ợ kỹ trước khi đặt ngủ.</li>
                          <li><strong>Chưa biết tự chuyển chu kỳ:</strong> Bé phụ thuộc ti mẹ/bế ru nên khi tỉnh giấc không biết tự ngủ lại.</li>
                        </ul>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950">
                        <span className="font-bold block">✅ Các bước hỗ trợ nối giấc:</span>
                        <p className="mt-1">Khi thấy bé cựa quậy lúc 35-40 phút: Áp dụng nút chờ 3-5 phút ➔ Nếu bé khóc tăng dần, vào phòng giữ nhẹ tay bé, vỗ nhịp nhàng và suỵt suỵt ➔ Giúp bé băng qua điểm giao chu kỳ.</p>
                      </div>
                    </div>
                  )
                },
                {
                  id: 'regression_1',
                  category: 'regression',
                  tag: 'Khủng hoảng ngủ',
                  tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  title: '8. Các Mốc Khủng Hoảng Ngủ & Cách Vượt Qua',
                  summary: 'Mốc 4 tháng, 8-10 tháng, 12 tháng: Tại sao bé đang ngoan đột nhiên quấy khóc?',
                  icon: ShieldCheck,
                  iconColor: 'text-emerald-600',
                  content: (
                    <div className="space-y-3 text-xs text-gray-700 leading-relaxed pt-2 border-t border-gray-100">
                      <p>Khủng hoảng ngủ (Sleep Regression) xảy ra khi não bộ em bé có bước nhảy vọt về phát triển vận động (lẫy, bò, đứng) hoặc cấu trúc giấc ngủ biến đổi giống người lớn.</p>
                      <div className="space-y-2">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-900 block">• Khủng hoảng 4 tháng (Mốc quan trọng nhất):</span>
                          <span>Cấu trúc giấc ngủ của bé chuyển từ 2 giai đoạn sang 4 giai đoạn. Bé dễ thức giấc sau mỗi 45 phút. Cần kiên trì giữ nếp tự ngủ và không tạo thêm thói quen xấu mới.</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-gray-200">
                          <span className="font-bold text-gray-900 block">• Khủng hoảng 8 - 10 tháng:</span>
                          <span>Bé tập bò, tập đứng và bám víu thành cũi. Thường đứng dậy trong cũi khóc. Hãy dạy bé cách ngồi xuống an toàn thay vì bế bé ra khỏi cũi.</span>
                        </div>
                      </div>
                    </div>
                  )
                }
              ];

              const filteredArticles = allArticles.filter((art) => {
                const matchesCategory = knowledgeCategory === 'all' || art.category === knowledgeCategory;
                const matchesSearch = !knowledgeSearch || 
                  art.title.toLowerCase().includes(knowledgeSearch.toLowerCase()) || 
                  art.summary.toLowerCase().includes(knowledgeSearch.toLowerCase());
                return matchesCategory && matchesSearch;
              });

              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-gray-900 flex items-center">
                      <BookOpen className="w-4 h-4 text-rose-500 mr-2" />
                      Danh Sách Chuyên Đề Kiến Thức ({filteredArticles.length} bài)
                    </h3>
                  </div>

                  {filteredArticles.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500 text-xs">
                      Không tìm thấy bài viết phù hợp với từ khóa "{knowledgeSearch}".
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredArticles.map((art) => {
                        const IconComp = art.icon;
                        const isExpanded = expandedCardId === art.id;

                        return (
                          <div
                            key={art.id}
                            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                              isExpanded ? 'border-rose-300 shadow-md ring-1 ring-rose-200' : 'border-gray-200 shadow-xs hover:border-rose-200'
                            }`}
                          >
                            <div
                              onClick={() => setExpandedCardId(isExpanded ? null : art.id)}
                              className="p-4 cursor-pointer flex items-start justify-between gap-3 select-none"
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2.5 rounded-xl bg-slate-50 ${art.iconColor} flex-shrink-0 mt-0.5`}>
                                  <IconComp className="w-5 h-5" />
                                </div>
                                <div>
                                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold border mb-1.5 ${art.tagColor}`}>
                                    {art.tag}
                                  </span>
                                  <h4 className="font-extrabold text-xs sm:text-sm text-gray-900 leading-snug">
                                    {art.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {art.summary}
                                  </p>
                                </div>
                              </div>

                              <button className="p-1 rounded-lg hover:bg-slate-100 text-gray-400 flex-shrink-0 mt-1">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>

                            {/* Expanded Content View */}
                            {isExpanded && (
                              <div className="px-4 pb-4">
                                {art.content}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        )}

      </div>
    </div>
  );
};
