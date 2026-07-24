import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  EASY_PRESETS,
  EasyPresetId,
  EasyDayLog,
  EasyCycleLog,
  generateDefaultDayLog,
  cascadeRecalculateCycles,
  addMinutesToTime,
  getSafeDurationMinutes,
  isValidTimeStr,
  getCycleTotalMilk,
  getDayTotalMilk,
  easyStorage
} from '../../data/easyStorage';
import { FORMULA_DATABASE } from '../../data/formulaDatabase';
import {
  Clock,
  Calendar,
  Sparkles,
  RefreshCw,
  Save,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Baby,
  Milk,
  Bed,
  Smile,
  Heart,
  Printer,
  FileDown
} from 'lucide-react';

export const EasyScheduleTab: React.FC = () => {
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

  // Custom cycle configuration drawer/modal index
  const [editingCycleIndex, setEditingCycleIndex] = useState<number | null>(null);

  // Print / Export PDF ref
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `EASY_${selectedDate}_${selectedPreset}`,
  });

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

  // Apply preset or wake time change
  const handleApplyPreset = (presetId: EasyPresetId, wakeTime: string) => {
    const newLog = generateDefaultDayLog(presetId, wakeTime, selectedDate);
    setDayLog(newLog);
    setSelectedPreset(presetId);
    easyStorage.saveDayLog(newLog);
  };

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

  const handleUpdateCycle = (index: number, updatedFields: Partial<EasyCycleLog>, saveImmediate = true) => {
    if (!dayLog) return;
    const updatedCycles = [...dayLog.cycles];
    updatedCycles[index] = { ...updatedCycles[index], ...updatedFields };

    const updatedDayLog = { ...dayLog, cycles: updatedCycles };
    setDayLog(updatedDayLog);
    if (saveImmediate) {
      easyStorage.saveDayLog(updatedDayLog);
    }
  };

  const handleUpdateNightLog = (updatedFields: Partial<EasyDayLog>) => {
    if (!dayLog) return;
    const updatedDayLog = { ...dayLog, ...updatedFields };
    setDayLog(updatedDayLog);
    easyStorage.saveDayLog(updatedDayLog);
  };

  const handleSyncToDiary = async () => {
    if (!dayLog) return;
    setIsSaving(true);
    try {
      await easyStorage.syncToDailyDiary(dayLog);
      setSyncMessage('Đã đồng bộ lịch EASY vào Nhật Ký Nuôi Con!');
      setTimeout(() => setSyncMessage(null), 3500);
    } catch (err) {
      console.error('Failed to sync diary', err);
      setSyncMessage('Lỗi đồng bộ nhật ký.');
    } finally {
      setIsSaving(false);
    }
  };

  const currentPresetInfo = EASY_PRESETS[selectedPreset] || EASY_PRESETS.easy3;
  const milkSummary = dayLog ? getDayTotalMilk(dayLog) : { daytimeMilk: 0, breastMilkTotal: 0, formulaMilkTotal: 0, nightMilk: 0, grandTotal: 0 };

  return (
    <div className="space-y-6" ref={printRef}>
      {/* Top Banner Control Panel */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center space-x-1.5 bg-indigo-800/60 border border-indigo-700/80 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-yellow-300 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Theo dõi sinh hoạt khoa học</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Lịch Trình E.A.S.Y Hàng Ngày
              </h2>
            </div>

            {/* Date Selector & Export PDF */}
            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <div className="flex items-center space-x-2 bg-indigo-950/80 border border-indigo-800 rounded-xl px-3 py-1.5">
                <Calendar className="w-4 h-4 text-pink-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
                />
              </div>
              <button
                onClick={() => handlePrint()}
                className="print:hidden flex items-center space-x-1.5 bg-indigo-950/80 border border-indigo-800 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-100 hover:bg-indigo-800 hover:text-yellow-300 transition-colors cursor-pointer"
                title="Xuất PDF / In lịch trình EASY"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Xuất PDF</span>
              </button>
            </div>
          </div>

          {/* Preset & Morning Wake Picker Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-indigo-800/60">
            {/* Choose Preset */}
            <div className="md:col-span-8 space-y-1">
              <label className="text-[11px] font-bold text-indigo-200 block">
                Chọn Mẫu Lịch EASY Theo Độ Tuổi:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(Object.keys(EASY_PRESETS) as EasyPresetId[]).map((pId) => {
                  const p = EASY_PRESETS[pId];
                  const isSelected = selectedPreset === pId;
                  return (
                    <button
                      key={pId}
                      onClick={() => handleApplyPreset(pId, morningWake)}
                      className={`px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-yellow-400 text-indigo-950 font-extrabold border-yellow-300 shadow-md scale-[1.02]'
                          : 'bg-indigo-950/50 text-indigo-100 border-indigo-800/80 hover:bg-indigo-800/50'
                      }`}
                    >
                      <div className="text-xs font-black leading-snug">{p.name}</div>
                      <div className="text-[10px] opacity-85 leading-none mt-0.5">{p.ageRange}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Morning Wake Time */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-indigo-200 block">
                Giờ Dậy Sáng (Khởi động cữ 1):
              </label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Clock className="w-4 h-4 text-indigo-300 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="time"
                    value={morningWake}
                    onChange={(e) => {
                      setMorningWake(e.target.value);
                      handleApplyPreset(selectedPreset, e.target.value);
                    }}
                    className="w-full bg-indigo-950/80 border border-indigo-800 rounded-xl pl-9 pr-3 py-2 text-xs font-extrabold text-yellow-300 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                <button
                  onClick={() => handleApplyPreset(selectedPreset, morningWake)}
                  title="Đặt lại cữ chuẩn"
                  className="p-2 bg-indigo-800 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Target Description */}
          <div className="bg-indigo-950/60 rounded-xl p-3 border border-indigo-800/50 text-xs leading-relaxed text-indigo-100 flex items-start space-x-2.5">
            <Smile className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
            <div>
              <strong>{currentPresetInfo.name} ({currentPresetInfo.ageRange}):</strong> {currentPresetInfo.desc}
            </div>
          </div>
        </div>
      </div>

      {/* Sync Message Alert */}
      {syncMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs font-bold flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncMessage}</span>
          </div>
        </div>
      )}

      {/* Daily Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Tổng Sữa Mẹ</span>
          <div className="text-lg font-black text-rose-600 flex items-center">
            <Heart className="w-4 h-4 text-rose-500 mr-1" />
            <span>{milkSummary.breastMilkTotal} ml</span>
          </div>
          <span className="text-[10px] text-gray-500 block">Sữa mẹ ước lượng + bình</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Sữa Công Thức</span>
          <div className="text-lg font-black text-amber-600 flex items-center">
            <Milk className="w-4 h-4 text-amber-500 mr-1" />
            <span>{milkSummary.formulaMilkTotal} ml</span>
          </div>
          <span className="text-[10px] text-gray-500 block">Sữa công thức dạng bình</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Tổng Sữa Ngày</span>
          <div className="text-lg font-black text-indigo-600 flex items-center">
            <Baby className="w-4 h-4 text-indigo-500 mr-1" />
            <span>{milkSummary.daytimeMilk} ml</span>
          </div>
          <span className="text-[10px] text-gray-500 block">Sữa các cữ ban ngày</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase block">Tổng Sữa Hôm Nay</span>
          <div className="text-lg font-black text-emerald-600 flex items-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-1" />
            <span>{milkSummary.grandTotal} ml</span>
          </div>
          <span className="text-[10px] text-gray-500 block">Tổng lượng sữa đếm được</span>
        </div>
      </div>

      {/* Main Cycles Timeline */}
      {dayLog && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center">
              <Sun className="w-4 h-4 text-amber-500 mr-2" />
              Lịch Trình Các Cữ Ban Ngày ({dayLog.cycles.length} cữ)
            </h3>
            <span className="text-xs text-gray-500 font-medium">Bấm cữ để chỉnh chi tiết</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayLog.cycles.map((cycle, index) => {
              const totalMilk = getCycleTotalMilk(cycle);
              const isEditing = editingCycleIndex === index;

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 shadow-xs hover:border-indigo-300 transition-all duration-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-slate-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                        {cycle.cycleId}
                      </span>
                      <span className="font-extrabold text-sm text-gray-900">
                        {cycle.cycleName}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingCycleIndex(isEditing ? null : index)}
                        className="p-1 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {isEditing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Card Content Summary */}
                  <div className="p-4 space-y-3">
                    {/* Time Timeline Badges */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* EAT & WAKE */}
                      <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center space-x-1.5 text-amber-900 font-extrabold text-[11px]">
                          <Sun className="w-3.5 h-3.5 text-amber-600" />
                          <span>ĂN & THỨC (A)</span>
                        </div>
                        <div className="flex items-center justify-between text-amber-950">
                          <input
                            type="time"
                            value={cycle.eatStartTime}
                            onChange={(e) => handleCycleEatStartTimeChange(index, e.target.value)}
                            className="bg-white border border-amber-300 rounded px-1 py-0.5 text-xs font-bold focus:outline-none"
                          />
                          <span className="text-gray-400">➔</span>
                          <input
                            type="time"
                            value={cycle.eatEndTime}
                            onChange={(e) => handleCycleEatEndTimeChange(index, e.target.value)}
                            className="bg-white border border-amber-300 rounded px-1 py-0.5 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* SLEEP */}
                      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-2.5 space-y-1">
                        <div className="flex items-center space-x-1.5 text-indigo-900 font-extrabold text-[11px]">
                          <Bed className="w-3.5 h-3.5 text-indigo-600" />
                          <span>NGỦ GIẤC NÀY (S)</span>
                        </div>
                        <div className="flex items-center justify-between text-indigo-950">
                          <input
                            type="time"
                            value={cycle.sleepStartTime}
                            onChange={(e) => handleCycleSleepStartTimeChange(index, e.target.value)}
                            className="bg-white border border-indigo-300 rounded px-1 py-0.5 text-xs font-bold focus:outline-none"
                          />
                          <span className="text-gray-400">➔</span>
                          <input
                            type="time"
                            value={cycle.sleepEndTime}
                            onChange={(e) => handleUpdateCycle(index, { sleepEndTime: e.target.value })}
                            className="bg-white border border-indigo-300 rounded px-1 py-0.5 text-xs font-bold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats overview */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-600">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Milk className="w-3.5 h-3.5 text-amber-500 mr-1" />
                          <strong>{totalMilk > 0 ? `${totalMilk} ml` : 'Chưa ghi bú'}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Baby className="w-3.5 h-3.5 text-pink-500 mr-1" />
                          <strong>Tã: {cycle.wetDiaperCount || 0} ướt, {cycle.dirtyDiaperCount || 0} dơ</strong>
                        </span>
                      </div>

                      <button
                        onClick={() => setEditingCycleIndex(isEditing ? null : index)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                      >
                        {isEditing ? 'Thu gọn' : 'Chỉnh cữ ăn & tã'}
                      </button>
                    </div>

                    {/* EXPANDED EDITING FORM */}
                    {isEditing && (
                      <div className="pt-3 border-t border-gray-200 space-y-4 animate-fade-in text-xs">
                        
                        {/* 1. Ti Mẹ Trực Tiếp */}
                        <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-rose-900 flex items-center">
                              <Heart className="w-3.5 h-3.5 mr-1 text-rose-500" />
                              1. Ti Mẹ Trực Tiếp
                            </span>
                            <span className="text-[10px] text-rose-700 font-semibold">Ghi chép cho bé bú mẹ</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Giờ bắt đầu:</label>
                              <input
                                type="time"
                                value={cycle.directBreastfeedStartTime || cycle.eatStartTime}
                                onChange={(e) => handleUpdateCycle(index, { directBreastfeedStartTime: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Thời gian (phút):</label>
                              <input
                                type="number"
                                min="0"
                                max="120"
                                placeholder="VD: 20"
                                value={cycle.directBreastfeedDurationMinutes || ''}
                                onChange={(e) => handleUpdateCycle(index, { directBreastfeedDurationMinutes: Number(e.target.value) })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Đánh giá cữ ti:</label>
                              <select
                                value={cycle.directBreastfeedRating || 5}
                                onChange={(e) => handleUpdateCycle(index, { directBreastfeedRating: Number(e.target.value) as any })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold"
                              >
                                <option value="5">⭐⭐⭐⭐⭐ Ti rất hiệu quả</option>
                                <option value="4">⭐⭐⭐⭐ Ti tốt</option>
                                <option value="3">⭐⭐⭐ Ti trung bình</option>
                                <option value="2">⭐⭐ Bú vặt / Thiếp đi</option>
                                <option value="1">⭐ Gắt ti / Ti ít</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Ước lượng (ml):</label>
                              <input
                                type="number"
                                step="10"
                                placeholder="VD: 100"
                                value={cycle.directBreastfeedEstimatedMilkMl || ''}
                                onChange={(e) => handleUpdateCycle(index, { directBreastfeedEstimatedMilkMl: Number(e.target.value) })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. Ti Bình */}
                        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-amber-900 flex items-center">
                              <Milk className="w-3.5 h-3.5 mr-1 text-amber-600" />
                              2. Ti Bình (Sữa Mẹ / Sữa Công Thức)
                            </span>
                            <span className="text-[10px] text-amber-700 font-semibold">Đếm ml chính xác</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Giờ ti bình:</label>
                              <input
                                type="time"
                                value={cycle.bottleFeedStartTime || cycle.eatStartTime}
                                onChange={(e) => handleUpdateCycle(index, { bottleFeedStartTime: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Lượng sữa (ml):</label>
                              <input
                                type="number"
                                step="10"
                                placeholder="VD: 120"
                                value={cycle.bottleMilkVolumeMl || ''}
                                onChange={(e) => handleUpdateCycle(index, { bottleMilkVolumeMl: Number(e.target.value) })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-amber-900"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Loại sữa ti bình:</label>
                              <select
                                value={cycle.bottleMilkType || 'breast'}
                                onChange={(e) => handleUpdateCycle(index, { bottleMilkType: e.target.value as any })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold"
                              >
                                <option value="breast">🥛 Sữa mẹ vắt bình</option>
                                <option value="formula">🍼 Sữa công thức</option>
                              </select>
                            </div>

                            {/* Dropdown chọn hãng sữa công thức */}
                            {cycle.bottleMilkType === 'formula' && (
                              <div>
                                <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Dòng sữa công thức:</label>
                                <select
                                  value={cycle.formulaBrandId || ''}
                                  onChange={(e) => {
                                    const bId = e.target.value;
                                    const brand = FORMULA_DATABASE.find(b => b.id === bId);
                                    handleUpdateCycle(index, {
                                      formulaBrandId: bId,
                                      formulaBrandName: brand ? brand.name : ''
                                    });
                                  }}
                                  className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-indigo-900"
                                >
                                  <option value="">-- Chọn dòng sữa --</option>
                                  {FORMULA_DATABASE.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 3. Tã Đếm Số Lượng */}
                        <div className="bg-slate-50 border border-gray-200 rounded-xl p-3 space-y-2">
                          <span className="font-extrabold text-gray-800 block text-[11px]">
                            👶 3. Đếm Số Lượng Tã Cữ Này:
                          </span>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Wet Diaper Counter */}
                            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                              <span className="text-xs font-bold text-blue-900">Tã Ướt (Đi Tè):</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCycle(index, { wetDiaperCount: Math.max(0, (cycle.wetDiaperCount || 0) - 1) })}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-extrabold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-black text-sm text-blue-900 w-4 text-center">{cycle.wetDiaperCount || 0}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCycle(index, { wetDiaperCount: (cycle.wetDiaperCount || 0) + 1 })}
                                  className="w-6 h-6 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 font-extrabold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Dirty Diaper Counter */}
                            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200">
                              <span className="text-xs font-bold text-amber-900">Tã Dơ (Đi Ngoài):</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCycle(index, { dirtyDiaperCount: Math.max(0, (cycle.dirtyDiaperCount || 0) - 1) })}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-extrabold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-black text-sm text-amber-900 w-4 text-center">{cycle.dirtyDiaperCount || 0}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCycle(index, { dirtyDiaperCount: (cycle.dirtyDiaperCount || 0) + 1 })}
                                  className="w-6 h-6 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 font-extrabold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Ghi chú khác */}
                        <div>
                          <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Ghi chú cữ này (Tâm trạng, chơi gì, phản ứng...):</label>
                          <input
                            type="text"
                            placeholder="VD: Bé tự ngủ sau 10p wind-down, vui vẻ..."
                            value={cycle.notes || ''}
                            onChange={(e) => handleUpdateCycle(index, { notes: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>

                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>

          {/* NIGHT SLEEP & DIAPERS SECTION */}
          <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 rounded-2xl p-5 text-white shadow-md space-y-4 border border-indigo-800">
            <div className="flex items-center space-x-2 border-b border-indigo-800/80 pb-3">
              <Moon className="w-5 h-5 text-yellow-300" />
              <h3 className="text-base font-extrabold tracking-tight">
                Giấc Ngủ Đêm & Ghi Chép Đêm
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 1. Night Sleep Duration */}
              <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-indigo-200 block text-[11px]">Giờ Bắt Đầu Ngủ Đêm:</span>
                <input
                  type="time"
                  value={dayLog.bedtimeStart}
                  onChange={(e) => handleUpdateNightLog({ bedtimeStart: e.target.value })}
                  className="w-full bg-indigo-950 border border-indigo-700 rounded px-3 py-1.5 text-xs font-extrabold text-yellow-300"
                />
              </div>

              {/* 2. Night Sleep Quality */}
              <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3.5 space-y-2">
                <span className="font-bold text-indigo-200 block text-[11px]">Đánh Giá Chất Lượng Giấc Đêm:</span>
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

              {/* 3. Save to Diary Action */}
              <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3.5 flex items-center justify-center">
                <button
                  onClick={handleSyncToDiary}
                  disabled={isSaving}
                  className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-extrabold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu Lịch EASY Vào Nhật Ký'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default EasyScheduleTab;
