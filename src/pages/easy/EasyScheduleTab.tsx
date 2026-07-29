import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  EASY_PRESETS,
  EasyPresetId,
  EasyDayLog,
  EasyCycleLog,
  EasyCycleConfig,
  NightFeedEntry,
  generateDefaultDayLog,
  generateCustomDayLog,
  cascadeRecalculateCycles,
  addMinutesToTime,
  getSafeDurationMinutes,
  isValidTimeStr,
  getCycleTotalMilk,
  getDayTotalMilk,
  getDayTotalDurations,
  getDayTotalDiapers,
  getActiveConfig,
  saveActiveConfig,
  easyStorage,
  getDayTotalNutrition,
  NutritionSummary
} from '../../data/easyStorage';
import { fetchFormulaDatabase, FormulaBrand } from '../../data/formulaDatabase';
import { PrintableEasyReport } from '../../components/PrintableEasyReport';
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
  FileDown,
  Sliders,
  X,
  Plus,
  Trash2
} from 'lucide-react';

export const EasyScheduleTab: React.FC = () => {
  const [formulaDatabase, setFormulaDatabase] = useState<FormulaBrand[]>([]);
  useEffect(() => {
    fetchFormulaDatabase().then(data => setFormulaDatabase(data));
  }, []);
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

  // Custom cycle configuration drawer/modal state
  const [editingCycleIndex, setEditingCycleIndex] = useState<number | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCycleCount, setCustomCycleCount] = useState(4);
  const [customWakeMins, setCustomWakeMins] = useState(90);
  const [customSleepMins, setCustomSleepMins] = useState(120);
  const [customSkipNap4, setCustomSkipNap4] = useState(false);
  // Per-cycle custom config mode
  const [customPerCycleMode, setCustomPerCycleMode] = useState(false);
  const [customPerCycleConfigs, setCustomPerCycleConfigs] = useState<{wake: number; sleep: number; name: string}[]>([]);

  // Night feeds detail toggle
  const [showNightFeedDetails, setShowNightFeedDetails] = useState(false);

  // Expand/Collapse Stats State
  const [showStats, setShowStats] = useState(true);

  // Print / Export PDF ref
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `EASY_${selectedDate}_${selectedPreset}`,
  });

  // Load schedule for selected date (inherits active saved config if new date)
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
          const active = getActiveConfig();
          const newLog = generateDefaultDayLog(active.presetId, active.morningWakeTime, selectedDate, null, active.customCycles);
          setDayLog(newLog);
          setSelectedPreset(active.presetId);
          setMorningWake(active.morningWakeTime);
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

  // Apply preset or wake time change (persists active config for future days)
  const handleApplyPreset = (presetId: EasyPresetId, wakeTime: string) => {
    saveActiveConfig({ presetId, morningWakeTime: wakeTime });
    const newLog = generateDefaultDayLog(presetId, wakeTime, selectedDate, dayLog);
    setDayLog(newLog);
    setSelectedPreset(presetId);
    setMorningWake(wakeTime);
    easyStorage.saveDayLog(newLog);
  };

  // Generate Custom Auto-calculated Schedule
  const handleGenerateCustomSchedule = () => {
    const newLog = generateCustomDayLog(
      morningWake,
      customCycleCount,
      customWakeMins,
      customSleepMins,
      customSkipNap4,
      selectedDate,
      dayLog
    );
    setDayLog(newLog);
    setSelectedPreset('custom');
    easyStorage.saveDayLog(newLog);
    setShowCustomModal(false);
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
      saveActiveConfig({ presetId: selectedPreset, morningWakeTime: newTime });
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
    const newCycle: EasyCycleLog = {
      ...orig,
      sleepEndTime: newTime,
    };
    const updatedDayLog = cascadeRecalculateCycles(dayLog, index, newCycle);
    setDayLog(updatedDayLog);
    easyStorage.saveDayLog(updatedDayLog);
  };

  // Toggle skip nap (set nap duration to 0m vs restore 30m)
  const handleToggleSkipNap = (index: number) => {
    if (!dayLog) return;
    const orig = dayLog.cycles[index];
    const isSkipped = orig.sleepStartTime === orig.sleepEndTime;
    const newSleepEndTime = isSkipped
      ? addMinutesToTime(orig.sleepStartTime, 30)
      : orig.sleepStartTime;
    handleCycleSleepEndTimeChange(index, newSleepEndTime);
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
      setSyncMessage('✅ Đã đồng bộ lịch EASY & thống kê ngày vào Nhật Ký Chăm Bé!');
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err) {
      console.error('Failed to sync to diary', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewCycle = () => {
    if (!dayLog) return;
    
    // Find the last cycle to determine the start time for the new one
    const lastCycle = dayLog.cycles[dayLog.cycles.length - 1];
    
    // New cycle starts exactly when the last one's "sleepEndTime" was (which is technically just eatEndTime if sleep is 0)
    const newEatStartTime = lastCycle ? lastCycle.sleepEndTime : dayLog.morningWakeTime;
    
    const newEatEndTime = addMinutesToTime(newEatStartTime, 90); // default 90 mins wake
    const newSleepStartTime = newEatEndTime;
    const newSleepEndTime = newSleepStartTime; // default to 0 mins sleep (Chỉ thức)

    const newCycle: EasyCycleLog = {
      cycleId: dayLog.cycles.length + 1,
      cycleName: `Cữ ${dayLog.cycles.length + 1}`,
      eatStartTime: newEatStartTime,
      eatEndTime: newEatEndTime,
      sleepStartTime: newSleepStartTime,
      sleepEndTime: newSleepEndTime,
    };
    
    const updatedCycles = [...dayLog.cycles, newCycle];
    const updatedDayLog = { ...dayLog, cycles: updatedCycles, bedtimeStart: newSleepEndTime };
    setDayLog(updatedDayLog);
    easyStorage.saveDayLog(updatedDayLog);
  };

  const currentPresetInfo = EASY_PRESETS[selectedPreset] || EASY_PRESETS.easy3;
  const milkSummary = dayLog ? getDayTotalMilk(dayLog) : { daytimeMilk: 0, breastMilkTotal: 0, formulaMilkTotal: 0, nightMilk: 0, grandTotal: 0 };
  const nutritionSummary = dayLog ? getDayTotalNutrition(dayLog, formulaDatabase) : null;
  const durationStats = dayLog ? getDayTotalDurations(dayLog) : null;
  const diaperStats = dayLog ? getDayTotalDiapers(dayLog) : { dayWet: 0, dayDirty: 0, nightWet: 0, nightDirty: 0, totalWet: 0, totalDirty: 0, grandTotalDiapers: 0 };

  return (
    <>
    <div className="space-y-6">
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

          {/* Compact Preset & Morning Wake Picker Bar */}
          <div className="pt-3 border-t border-indigo-800/60 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <label className="text-[11px] font-extrabold text-indigo-200 block">
                  Chọn Mẫu Lịch EASY Theo Độ Tuổi:
                </label>
              </div>

              <div className="flex items-center space-x-2">
                {/* Morning Wake Input */}
                <div className="flex items-center space-x-1.5 bg-indigo-950/80 border border-indigo-800 rounded-xl px-2.5 py-1 text-xs">
                  <Clock className="w-3.5 h-3.5 text-yellow-300" />
                  <span className="text-[11px] text-indigo-200 font-bold hidden xs:inline">Giờ dậy:</span>
                  <input
                    type="time"
                    value={morningWake}
                    onChange={(e) => {
                      setMorningWake(e.target.value);
                      handleApplyPreset(selectedPreset, e.target.value);
                    }}
                    className="bg-transparent text-yellow-300 font-extrabold focus:outline-none cursor-pointer text-xs"
                  />
                </div>

                {/* Auto Custom Calculator Button */}
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-extrabold rounded-xl text-xs transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>⚡ Tự Động Tính Custom</span>
                </button>
              </div>
            </div>

            {/* Compact Horizontal Scroll Pill Buttons */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1.5 no-scrollbar">
              {(Object.keys(EASY_PRESETS) as EasyPresetId[]).map((pId) => {
                const p = EASY_PRESETS[pId];
                const isSelected = selectedPreset === pId;
                return (
                  <button
                    key={pId}
                    onClick={() => {
                      if (pId === 'custom') {
                        setShowCustomModal(true);
                      } else {
                        handleApplyPreset(pId, morningWake);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-extrabold transition-all cursor-pointer border flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-yellow-400 text-indigo-950 border-yellow-300 shadow-sm'
                        : 'bg-indigo-950/60 text-indigo-100 border-indigo-800/80 hover:bg-indigo-800/60'
                    }`}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] opacity-75 font-normal">({p.ageRange})</span>
                  </button>
                );
              })}
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

      {/* Toggle Stats Button */}
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-extrabold text-gray-800">Thống Kê Nhanh Trong Ngày</h3>
        <button 
          onClick={() => setShowStats(!showStats)} 
          className="text-xs font-bold text-indigo-600 flex items-center space-x-1 cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
        >
          <span>{showStats ? 'Thu gọn' : 'Mở rộng'}</span>
          {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Daily Summary Stat Cards (Milk, Nutrition & Wake/Sleep Durations) */}
      {showStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 animate-fade-in">
          {/* Nutrition Card - HIGHTLIGHTED */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-3 rounded-2xl shadow-2xs space-y-2 col-span-2 sm:col-span-3 lg:col-span-2">
            <span className="text-[10px] font-extrabold text-amber-900 uppercase flex items-center">
              <Sparkles className="w-3 h-3 text-amber-600 mr-1" />
              Tổng Dinh Dưỡng Nạp
            </span>
            <div className="flex items-end space-x-1">
              <span className="text-2xl font-black text-amber-600 leading-none">{nutritionSummary?.energyKcal || 0}</span>
              <span className="text-xs font-bold text-amber-700 pb-0.5">Kcal</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 border-t border-amber-200/60 text-[10px] text-amber-900">
              <div className="flex justify-between"><span>Đạm:</span> <span className="font-bold">{nutritionSummary?.proteinG || 0}g</span></div>
              <div className="flex justify-between"><span>Béo:</span> <span className="font-bold">{nutritionSummary?.fatG || 0}g</span></div>
              <div className="flex justify-between"><span>Canxi:</span> <span className="font-bold">{nutritionSummary?.calciumMg || 0}mg</span></div>
              <div className="flex justify-between"><span>DHA:</span> <span className="font-bold">{nutritionSummary?.dhaMg || 0}mg</span></div>
              <div className="flex justify-between"><span>Sắt:</span> <span className="font-bold">{nutritionSummary?.ironMg || 0}mg</span></div>
              <div className="flex justify-between"><span>Kẽm:</span> <span className="font-bold">{nutritionSummary?.zincMg || 0}mg</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Tổng Lượng Sữa</span>
            <div className="text-base font-black text-indigo-600 flex items-center">
              <Baby className="w-3.5 h-3.5 text-indigo-500 mr-1" />
              <span>{milkSummary.grandTotal} ml</span>
            </div>
            <span className="text-[10px] text-gray-500 block">Ngày: {milkSummary.daytimeMilk}ml | Đêm: {milkSummary.nightMilk}ml</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Tổng Sữa Mẹ</span>
            <div className="text-base font-black text-rose-600 flex items-center">
              <Heart className="w-3.5 h-3.5 text-rose-500 mr-1" />
              <span>{milkSummary.breastMilkTotal} ml</span>
            </div>
            <span className="text-[10px] text-gray-500 block">Sữa mẹ trực tiếp + vắt bình</span>
          </div>

          {/* Duration Stats: Total Wake */}
          <div className="bg-white rounded-2xl border border-amber-200/90 bg-amber-50/20 p-3 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-amber-900 uppercase block flex items-center">
              <Sun className="w-3 h-3 text-amber-600 mr-1" />
              Thời Gian Thức
            </span>
            <div className="text-base font-black text-amber-900">
              <span>{durationStats?.totalWakeStr || '0h'}</span>
            </div>
            <span className="text-[10px] text-amber-800/80 block">Ban ngày: {durationStats?.dayWakeStr}</span>
          </div>

          {/* Duration Stats: Total Sleep */}
          <div className="bg-white rounded-2xl border border-indigo-200/90 bg-indigo-50/20 p-3 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-indigo-900 uppercase block flex items-center">
              <Bed className="w-3 h-3 text-indigo-600 mr-1" />
              Thời Gian Ngủ
            </span>
            <div className="text-base font-black text-indigo-900">
              <span>{durationStats?.totalSleepStr || '0h'}</span>
            </div>
            <span className="text-[10px] text-indigo-800/80 block">Ngày: {durationStats?.daySleepStr} | Đêm: {durationStats?.nightSleepStr}</span>
          </div>

          {/* Night Sleep Quality badge */}
          <div className="bg-white rounded-2xl border border-purple-200/90 bg-purple-50/20 p-3 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-purple-900 uppercase block flex items-center">
              <Moon className="w-3 h-3 text-purple-600 mr-1" />
              Giấc Ngủ Đêm
            </span>
            <div className="text-base font-black text-purple-950 flex items-center space-x-1">
              <span>{dayLog?.nightSleepQuality ? '⭐'.repeat(dayLog.nightSleepQuality) : 'Tốt'}</span>
            </div>
            <span className="text-[10px] text-purple-800/80 block">Dậy đêm: {dayLog?.nightWakeCount ?? 0} lần</span>
          </div>

          {/* Diaper Summary Card */}
          <div className="bg-white rounded-2xl border border-sky-200/90 bg-sky-50/20 p-3 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-sky-900 uppercase block flex items-center">
              <Baby className="w-3 h-3 text-sky-600 mr-1" />
              Tổng Tã Cả Ngày
            </span>
            <div className="text-base font-black text-sky-900 flex items-center space-x-2">
              <span>💦 {diaperStats.totalWet}</span>
              <span>💩 {diaperStats.totalDirty}</span>
            </div>
            <span className="text-[10px] text-sky-800/80 block">Ngày: {diaperStats.dayWet}+{diaperStats.dayDirty} | Đêm: {diaperStats.nightWet}+{diaperStats.nightDirty}</span>
          </div>
        </div>
      )}

      {/* Main Cycles Timeline List */}
      {dayLog && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Danh Sách Cữ Sinh Hoạt ({dayLog.cycles.length} Cữ Day-time)</span>
            </h3>
            <span className="text-xs text-gray-500 font-bold">
              Bắt đầu đêm: <strong className="text-indigo-900 font-black">{dayLog.bedtimeStart}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayLog.cycles.map((cycle, index) => {
              const totalMilk = getCycleTotalMilk(cycle);
              const isEditing = editingCycleIndex === index;
              const isNapSkipped = cycle.sleepStartTime === cycle.sleepEndTime;

              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl border shadow-xs hover:border-indigo-300 transition-all duration-200 overflow-hidden ${
                    isNapSkipped ? 'border-amber-300/80 bg-amber-50/10' : 'border-gray-200'
                  }`}
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
                      {/* Skip Nap 4 / No-Nap Toggle Button - now only show if not the very last cycle */}
                      {index !== dayLog.cycles.length - 1 && index >= 3 && (
                        <button
                          type="button"
                          onClick={() => handleToggleSkipNap(index)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer border ${
                            isNapSkipped
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-slate-200/80 text-gray-700 border-gray-300 hover:bg-amber-50'
                          }`}
                          title="Bấm để bật/tắt bỏ giấc ngủ ngắn cữ này"
                        >
                          {isNapSkipped ? '⚡ Đã bỏ Nap' : '🚫 Bỏ Nap'}
                        </button>
                      )}

                      {/* Display explicit visual for last cycle */}
                      {index === dayLog.cycles.length - 1 && (
                        <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2 py-1 rounded-lg text-[10px] font-extrabold">
                          Cữ Cuối: Chỉ Thức
                        </span>
                      )}

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
                      <div className={`border rounded-xl p-2.5 space-y-1 ${
                        isNapSkipped ? 'bg-amber-100/40 border-amber-300/80' : 'bg-indigo-50/70 border-indigo-200/80'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1.5 text-indigo-900 font-extrabold text-[11px]">
                            <Bed className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{isNapSkipped ? 'BỎ NAP (CHỈ THỨC)' : 'NGỦ GIẤC NÀY (S)'}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-indigo-950">
                          <input
                            type="time"
                            value={cycle.sleepStartTime}
                            disabled={index === dayLog.cycles.length - 1} // Khóa cữ cuối
                            onChange={(e) => handleCycleSleepStartTimeChange(index, e.target.value)}
                            className="bg-white border border-indigo-300 rounded px-1 py-0.5 text-xs font-bold focus:outline-none disabled:opacity-60 disabled:bg-gray-100"
                          />
                          <span className="text-gray-400">➔</span>
                          <input
                            type="time"
                            value={cycle.sleepEndTime}
                            disabled={index === dayLog.cycles.length - 1} // Khóa cữ cuối
                            onChange={(e) => handleCycleSleepEndTimeChange(index, e.target.value)}
                            className="bg-white border border-indigo-300 rounded px-1 py-0.5 text-xs font-bold focus:outline-none disabled:opacity-60 disabled:bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats overview */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100 text-gray-600">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Milk className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                          <strong>Sữa cữ:</strong>&nbsp;<span className="font-bold text-indigo-950">{totalMilk} ml</span>
                        </span>
                        <span className="flex items-center">
                          <Baby className="w-3.5 h-3.5 text-amber-500 mr-1" />
                          <strong>Tã:</strong>&nbsp;<span>💦{cycle.wetDiaperCount ?? (cycle.wetDiaper ? 1 : 0)} / 💩{cycle.dirtyDiaperCount ?? (cycle.dirtyDiaper ? 1 : 0)}</span>
                        </span>
                      </div>

                      <button
                        onClick={() => setEditingCycleIndex(isEditing ? null : index)}
                        className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        {isEditing ? 'Đóng chi tiết' : '+ Nhập chi tiết cữ'}
                      </button>
                    </div>

                    {/* Detailed Collapsible Form */}
                    {isEditing && (
                      <div className="pt-3 border-t border-gray-100 space-y-4 animate-fade-in">
                        {/* 1. Ti mẹ trực tiếp */}
                        <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-3 space-y-2">
                          <div className="flex items-center space-x-1.5 text-rose-900 font-extrabold text-xs">
                            <Heart className="w-4 h-4 text-rose-600" />
                            <span>1. Ti Mẹ Trực Tiếp</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Giờ Bắt Đầu Ti:</label>
                              <input
                                type="time"
                                value={cycle.directBreastfeedStartTime || cycle.eatStartTime}
                                onChange={(e) => handleUpdateCycle(index, { directBreastfeedStartTime: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-rose-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Thời Gian Ti (Phút):</label>
                              <input
                                type="number"
                                placeholder="VD: 20"
                                value={cycle.directBreastfeedDurationMinutes || ''}
                                onChange={(e) => handleUpdateCycle(index, { directBreastfeedDurationMinutes: e.target.value ? Number(e.target.value) : null })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-rose-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Ước Lượng Sữa (ml):</label>
                              <input
                                type="number"
                                placeholder="VD: 90"
                                value={cycle.directBreastfeedEstimatedMilkMl || ''}
                                onChange={(e) => handleUpdateCycle(index, { directBreastfeedEstimatedMilkMl: e.target.value ? Number(e.target.value) : null })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-rose-500"
                              />
                            </div>
                          </div>

                          {/* Đánh giá sao cữ ti */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-bold text-gray-600">Đánh giá cữ ti mẹ:</span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleUpdateCycle(index, { directBreastfeedRating: star as any })}
                                  className={`text-base leading-none transition-transform hover:scale-125 cursor-pointer ${
                                    (cycle.directBreastfeedRating || 5) >= star ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* 2. Ti Bình */}
                        <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 space-y-2">
                          <div className="flex items-center space-x-1.5 text-amber-900 font-extrabold text-xs">
                            <Milk className="w-4 h-4 text-amber-600" />
                            <span>2. Ti Bình (Sữa Mẹ vắt / Sữa Công Thức)</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Giờ Ti Bình:</label>
                              <input
                                type="time"
                                value={cycle.bottleFeedStartTime || cycle.eatStartTime}
                                onChange={(e) => handleUpdateCycle(index, { bottleFeedStartTime: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-amber-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Lượng Sữa Bình (ml):</label>
                              <input
                                type="number"
                                placeholder="VD: 120"
                                value={cycle.bottleMilkVolumeMl || ''}
                                onChange={(e) => handleUpdateCycle(index, { bottleMilkVolumeMl: e.target.value ? Number(e.target.value) : null })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-extrabold text-amber-900 focus:ring-1 focus:ring-amber-500"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Loại Sữa:</label>
                              <select
                                value={cycle.bottleMilkType || 'breast'}
                                onChange={(e) => handleUpdateCycle(index, { bottleMilkType: e.target.value as any })}
                                className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-amber-500"
                              >
                                <option value="breast">Sữa mẹ (vắt)</option>
                                <option value="formula">Sữa công thức</option>
                              </select>
                            </div>
                          </div>

                          {/* Chọn thương hiệu sữa nếu là sữa công thức */}
                          {cycle.bottleMilkType === 'formula' && (
                            <div>
                              <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Thương hiệu / Loại sữa công thức:</label>
                              <select
                                value={cycle.formulaBrandId || ''}
                                onChange={(e) => {
                                  const bId = e.target.value;
                                  const found = formulaDatabase.find(f => f.id === bId);
                                  handleUpdateCycle(index, {
                                    formulaBrandId: bId || null,
                                    formulaBrandName: found ? found.name : null
                                  });
                                }}
                                className="w-full bg-white border border-amber-300 rounded px-2.5 py-1.5 text-xs text-amber-950 font-bold focus:ring-1 focus:ring-amber-500"
                              >
                                <option value="">-- Chọn hãng sữa từ thư viện --</option>
                                {formulaDatabase.map(f => (
                                  <option key={f.id} value={f.id}>
                                    {f.name} ({f.stage}) - {f.originCountry}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        {/* 3. Tã cữ ngày */}
                        <div className="bg-sky-50/60 border border-sky-200/80 rounded-xl p-3 space-y-2">
                          <div className="flex items-center space-x-1.5 text-sky-900 font-extrabold text-xs">
                            <Baby className="w-4 h-4 text-sky-600" />
                            <span>3. Ghi Chép Tã Trong Cữ</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center justify-between bg-white border border-sky-200 rounded-lg p-2">
                              <span className="font-bold text-sky-950 text-xs">💦 Tã ướt (Đi tè):</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCycle(index, { wetDiaperCount: Math.max(0, (cycle.wetDiaperCount || 0) - 1) })}
                                  className="w-6 h-6 rounded bg-sky-100 text-sky-900 font-extrabold hover:bg-sky-200 cursor-pointer flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="font-black text-sky-950 text-sm w-4 text-center">{cycle.wetDiaperCount || 0}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCycle(index, { wetDiaperCount: (cycle.wetDiaperCount || 0) + 1 })}
                                  className="w-6 h-6 rounded bg-sky-600 text-white font-extrabold hover:bg-sky-700 cursor-pointer flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg p-2">
                              <span className="font-bold text-amber-950 text-xs">💩 Tã dơ (Đi ngoài):</span>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCycle(index, { dirtyDiaperCount: Math.max(0, (cycle.dirtyDiaperCount || 0) - 1) })}
                                  className="w-6 h-6 rounded bg-amber-100 text-amber-900 font-extrabold hover:bg-amber-200 cursor-pointer flex items-center justify-center"
                                >
                                  -
                                </button>
                                <span className="font-black text-amber-950 text-sm w-4 text-center">{cycle.dirtyDiaperCount || 0}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCycle(index, { dirtyDiaperCount: (cycle.dirtyDiaperCount || 0) + 1 })}
                                  className="w-6 h-6 rounded bg-amber-600 text-white font-extrabold hover:bg-amber-700 cursor-pointer flex items-center justify-center"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Ghi chú cữ */}
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

          <div className="flex justify-center mt-2 pb-4">
            <button 
              onClick={handleAddNewCycle}
              className="flex items-center space-x-1 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              <span className="text-lg leading-none mb-0.5">+</span> <span>Thêm Cữ Mới (Linh động)</span>
            </button>
          </div>

          {/* NIGHT SLEEP & DIAPERS SECTION */}
          <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950 rounded-2xl p-5 text-white shadow-md space-y-4 border border-indigo-800">
            <div className="flex items-center space-x-2 border-b border-indigo-800/80 pb-3">
              <Moon className="w-5 h-5 text-yellow-300" />
              <h3 className="text-base font-extrabold tracking-tight">
                Giấc Ngủ Đêm & Ghi Chép Đêm
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              {/* 1. Bedtime Start */}
              <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3 space-y-1.5">
                <span className="font-bold text-indigo-200 block text-[11px]">Giờ Ngủ Đêm:</span>
                <input
                  type="time"
                  value={dayLog.bedtimeStart}
                  onChange={(e) => handleUpdateNightLog({ bedtimeStart: e.target.value })}
                  className="w-full bg-indigo-950 border border-indigo-700 rounded px-2.5 py-1 text-xs font-extrabold text-yellow-300"
                />
              </div>

              {/* 2. Night Wake Count */}
              <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3 space-y-1.5">
                <span className="font-bold text-indigo-200 block text-[11px]">Số Lần Bé Dậy Đêm:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={dayLog.nightWakeCount ?? 0}
                  onChange={(e) => handleUpdateNightLog({ nightWakeCount: Number(e.target.value) })}
                  className="w-full bg-indigo-950 border border-indigo-700 rounded px-2.5 py-1 text-xs font-extrabold text-yellow-300"
                />
              </div>

              {/* 3. Night Feed Count & Volume */}
              <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3 space-y-1.5">
                <span className="font-bold text-indigo-200 block text-[11px]">Số Cữ & Lượng Sữa Đêm (ml):</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    placeholder="Số cữ"
                    value={dayLog.nightFeedCount ?? 0}
                    onChange={(e) => handleUpdateNightLog({ nightFeedCount: Number(e.target.value) })}
                    className="bg-indigo-950 border border-indigo-700 rounded px-2 py-1 text-xs font-bold text-white"
                  />
                  <input
                    type="number"
                    placeholder="ml sữa"
                    value={dayLog.nightMilkVolumeMl ?? ''}
                    onChange={(e) => handleUpdateNightLog({ nightMilkVolumeMl: e.target.value ? Number(e.target.value) : null })}
                    className="bg-indigo-950 border border-indigo-700 rounded px-2 py-1 text-xs font-bold text-amber-300"
                  />
                </div>
                {dayLog.nightFeedCount && dayLog.nightFeedCount > 0 ? (
                  <div className="pt-1 border-t border-indigo-800/80">
                    <select
                      value={dayLog.nightMilkType || 'breast'}
                      onChange={(e) => handleUpdateNightLog({ nightMilkType: e.target.value as any })}
                      className="w-full mb-1 bg-indigo-950 border border-indigo-700 rounded px-2 py-1 text-xs font-bold text-indigo-100 focus:outline-none"
                    >
                      <option value="breast">Sữa Mẹ</option>
                      <option value="formula">Công Thức</option>
                    </select>
                    {dayLog.nightMilkType === 'formula' && (
                      <select
                        value={dayLog.nightFormulaBrandId || ''}
                        onChange={(e) => {
                          const bId = e.target.value;
                          const found = formulaDatabase.find(f => f.id === bId);
                          handleUpdateNightLog({
                            nightFormulaBrandId: bId || null,
                            nightFormulaBrandName: found ? found.name : null
                          });
                        }}
                        className="w-full bg-indigo-950 border border-amber-700/50 rounded px-2 py-1 text-[10px] text-amber-200 focus:outline-none"
                      >
                        <option value="">- Chọn Sữa CT -</option>
                        {formulaDatabase.map(f => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : null}
              </div>

              {/* 4. Night Sleep Quality */}
              <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3 space-y-1.5">
                <span className="font-bold text-indigo-200 block text-[11px]">Đánh Giá Ngủ Đêm:</span>
                <div className="flex space-x-1 pt-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleUpdateNightLog({ nightSleepQuality: star as any })}
                      className={`text-base leading-none transition-transform hover:scale-125 cursor-pointer ${
                        (dayLog.nightSleepQuality || 5) >= star ? 'text-yellow-400' : 'text-indigo-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Night Diapers Counter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3">
                <span className="font-bold text-indigo-200 block text-[11px] mb-2">Số Lượng Tã Đêm:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between bg-indigo-950/80 border border-indigo-700 rounded-lg p-2">
                    <span className="font-bold text-sky-200 text-xs">💦 Tã ướt:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateNightLog({ nightWetDiaperCount: Math.max(0, (dayLog.nightWetDiaperCount || 0) - 1), nightWetDiaper: (dayLog.nightWetDiaperCount || 0) - 1 > 0 })}
                        className="w-6 h-6 rounded bg-indigo-800 text-sky-200 font-extrabold hover:bg-indigo-700 cursor-pointer flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-black text-sky-200 text-sm w-4 text-center">{dayLog.nightWetDiaperCount ?? (dayLog.nightWetDiaper ? 1 : 0)}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateNightLog({ nightWetDiaperCount: (dayLog.nightWetDiaperCount || 0) + 1, nightWetDiaper: true })}
                        className="w-6 h-6 rounded bg-sky-600 text-white font-extrabold hover:bg-sky-700 cursor-pointer flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-indigo-950/80 border border-indigo-700 rounded-lg p-2">
                    <span className="font-bold text-amber-200 text-xs">💩 Tã dơ:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateNightLog({ nightDirtyDiaperCount: Math.max(0, (dayLog.nightDirtyDiaperCount || 0) - 1), nightDirtyDiaper: (dayLog.nightDirtyDiaperCount || 0) - 1 > 0 })}
                        className="w-6 h-6 rounded bg-indigo-800 text-amber-200 font-extrabold hover:bg-indigo-700 cursor-pointer flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-black text-amber-200 text-sm w-4 text-center">{dayLog.nightDirtyDiaperCount ?? (dayLog.nightDirtyDiaper ? 1 : 0)}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateNightLog({ nightDirtyDiaperCount: (dayLog.nightDirtyDiaperCount || 0) + 1, nightDirtyDiaper: true })}
                        className="w-6 h-6 rounded bg-amber-600 text-white font-extrabold hover:bg-amber-700 cursor-pointer flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Night Notes */}
              <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3 space-y-2">
                <span className="font-bold text-indigo-200 block text-[11px]">Ghi Chú Đêm:</span>
                <input
                  type="text"
                  placeholder="VD: Bé giật mình 2h sáng, tự ngủ lại..."
                  value={dayLog.nightNotes || ''}
                  onChange={(e) => handleUpdateNightLog({ nightNotes: e.target.value })}
                  className="w-full bg-indigo-950 border border-indigo-700 rounded px-3 py-1.5 text-xs text-indigo-100 placeholder-indigo-400/70 focus:outline-none"
                />
              </div>
            </div>

            {/* Night Feeds Detail Toggle */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={() => setShowNightFeedDetails(!showNightFeedDetails)}
                className="text-xs font-bold text-yellow-300 hover:text-yellow-200 flex items-center space-x-1.5 cursor-pointer transition-colors"
              >
                {showNightFeedDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showNightFeedDetails ? 'Thu gọn chi tiết cữ đêm' : '➕ Chi tiết từng cữ bú đêm (nâng cao)'}</span>
              </button>

              {showNightFeedDetails && (
                <div className="bg-indigo-900/50 border border-indigo-800/80 rounded-xl p-3 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-200">Danh sách cữ bú đêm chi tiết:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFeed: NightFeedEntry = {
                          id: (dayLog.nightFeeds?.length || 0) + 1,
                          time: '02:00',
                          milkVolumeMl: 0,
                          milkType: 'breast',
                        };
                        handleUpdateNightLog({
                          nightFeeds: [...(dayLog.nightFeeds || []), newFeed],
                          nightFeedCount: (dayLog.nightFeeds?.length || 0) + 1,
                        });
                      }}
                      className="flex items-center space-x-1 px-2 py-1 bg-yellow-400/90 hover:bg-yellow-300 text-indigo-950 font-extrabold rounded-lg text-[10px] cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm cữ đêm</span>
                    </button>
                  </div>

                  {(dayLog.nightFeeds && dayLog.nightFeeds.length > 0) ? (
                    <div className="space-y-2">
                      {dayLog.nightFeeds.map((nf, nfIdx) => (
                        <div key={nf.id} className="bg-indigo-950/80 border border-indigo-700 rounded-lg p-2.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-yellow-300">Cữ đêm #{nfIdx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = dayLog.nightFeeds!.filter((_, i) => i !== nfIdx);
                                handleUpdateNightLog({
                                  nightFeeds: updated,
                                  nightFeedCount: updated.length,
                                  nightMilkVolumeMl: updated.reduce((sum, f) => sum + (f.milkVolumeMl || 0), 0) || null,
                                });
                              }}
                              className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-indigo-300 block">Giờ:</label>
                              <input
                                type="time"
                                value={nf.time}
                                onChange={(e) => {
                                  const updated = [...dayLog.nightFeeds!];
                                  updated[nfIdx] = { ...updated[nfIdx], time: e.target.value };
                                  handleUpdateNightLog({ nightFeeds: updated });
                                }}
                                className="w-full bg-indigo-950 border border-indigo-600 rounded px-1.5 py-0.5 text-[10px] font-bold text-yellow-300"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-indigo-300 block">Sữa (ml):</label>
                              <input
                                type="number"
                                placeholder="ml"
                                value={nf.milkVolumeMl || ''}
                                onChange={(e) => {
                                  const updated = [...dayLog.nightFeeds!];
                                  updated[nfIdx] = { ...updated[nfIdx], milkVolumeMl: Number(e.target.value) || 0 };
                                  const totalNightMilk = updated.reduce((sum, f) => sum + (f.milkVolumeMl || 0), 0);
                                  handleUpdateNightLog({ nightFeeds: updated, nightMilkVolumeMl: totalNightMilk || null });
                                }}
                                className="w-full bg-indigo-950 border border-indigo-600 rounded px-1.5 py-0.5 text-[10px] font-bold text-amber-300"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-indigo-300 block">Loại:</label>
                              <select
                                value={nf.milkType}
                                onChange={(e) => {
                                  const updated = [...dayLog.nightFeeds!];
                                  updated[nfIdx] = { ...updated[nfIdx], milkType: e.target.value as 'breast' | 'formula' };
                                  handleUpdateNightLog({ nightFeeds: updated });
                                }}
                                className="w-full bg-indigo-950 border border-indigo-600 rounded px-1 py-0.5 text-[10px] font-bold text-indigo-100"
                              >
                                <option value="breast">Sữa mẹ</option>
                                <option value="formula">Công thức</option>
                              </select>
                            </div>
                            {nf.milkType === 'formula' && (
                              <div>
                                <label className="text-[9px] font-bold text-indigo-300 block">Hãng:</label>
                                <select
                                  value={nf.formulaBrandId || ''}
                                  onChange={(e) => {
                                    const bId = e.target.value;
                                    const found = formulaDatabase.find(f => f.id === bId);
                                    const updated = [...dayLog.nightFeeds!];
                                    updated[nfIdx] = { ...updated[nfIdx], formulaBrandId: bId || null, formulaBrandName: found ? found.name : null };
                                    handleUpdateNightLog({ nightFeeds: updated });
                                  }}
                                  className="w-full bg-indigo-950 border border-amber-700/50 rounded px-1 py-0.5 text-[9px] text-amber-200"
                                >
                                  <option value="">- Chọn -</option>
                                  {formulaDatabase.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="text-[10px] text-indigo-300 font-bold pt-1 border-t border-indigo-800/60">
                        Tổng sữa đêm (tự động): <span className="text-amber-300 font-black">{dayLog.nightFeeds.reduce((s, f) => s + (f.milkVolumeMl || 0), 0)} ml</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-indigo-400 italic">Chưa có cữ đêm chi tiết. Bấm "Thêm cữ đêm" để bắt đầu.</p>
                  )}
                </div>
              )}
            </div>

            {/* Sync to Diary Button */}
            <div className="pt-1">
              <button
                onClick={handleSyncToDiary}
                disabled={isSaving}
                className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-300 text-indigo-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Vào Nhật Ký'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Custom EASY Auto Calculator Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-indigo-900 font-black text-lg">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>Tùy Chỉnh & Tự Động Tính Lịch EASY</span>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Nhập thời gian thức và ngủ mong muốn. Hệ thống sẽ <strong>tự động tính toán chính xác tất cả các mốc giờ ăn, ngủ và giờ vào giấc đêm</strong> mà bạn không cần chỉnh thủ công từng cữ.
            </p>

            <div className="space-y-4 text-xs font-bold text-gray-700">
              {/* 1. Morning Wake Time */}
              <div className="space-y-1">
                <label className="block text-gray-900">Giờ Dậy Sáng (Khởi động cữ 1):</label>
                <input
                  type="time"
                  value={morningWake}
                  onChange={(e) => setMorningWake(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-extrabold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* 2. Number of Cycles */}
              <div className="space-y-1">
                <label className="block text-gray-900">Số Cữ Ban Ngày:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setCustomCycleCount(cnt)}
                      className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                        customCycleCount === cnt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {cnt} cữ ngày
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Mode Toggle: Đồng đều vs Riêng từng cữ */}
              <div className="space-y-1">
                <label className="block text-gray-900">Cách thiết lập thời gian:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPerCycleMode(false);
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      !customPerCycleMode
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ⚡ Đồng đều tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPerCycleMode(true);
                      // Init per-cycle configs if not set
                      if (customPerCycleConfigs.length !== customCycleCount) {
                        setCustomPerCycleConfigs(
                          Array.from({ length: customCycleCount }, (_, i) => ({
                            wake: customWakeMins,
                            sleep: i === customCycleCount - 1 && customSkipNap4 ? 0 : customSleepMins,
                            name: `Cữ ${i + 1}`,
                          }))
                        );
                      }
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      customPerCycleMode
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    🎯 Riêng từng cữ
                  </button>
                </div>
              </div>

              {/* 4a. Uniform Mode */}
              {!customPerCycleMode && (
                <>
                  <div className="space-y-1">
                    <label className="block text-gray-900">
                      Thời Gian Thức Mỗi Cữ (A) - Phút:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="30"
                        max="360"
                        step="15"
                        value={customWakeMins}
                        onChange={(e) => setCustomWakeMins(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-extrabold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">({(customWakeMins / 60).toFixed(1)} tiếng)</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-gray-900">
                      Thời Gian Ngủ Giấc Ngày (S) - Phút:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="240"
                        step="15"
                        value={customSleepMins}
                        onChange={(e) => setCustomSleepMins(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-extrabold text-indigo-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">({(customSleepMins / 60).toFixed(1)} tiếng)</span>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customSkipNap4}
                        onChange={(e) => setCustomSkipNap4(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="font-extrabold text-amber-950 text-xs">
                        Bỏ giấc ngủ ngắn cữ cuối (Chỉ thức, không ngủ nap)
                      </span>
                    </label>
                    <p className="text-[11px] text-amber-800 leading-snug pl-6 font-normal">
                      Khi chọn, cữ cuối sẽ kéo dài thời gian thức đến thẳng giờ ngủ đêm.
                    </p>
                  </div>
                </>
              )}

              {/* 4b. Per-Cycle Mode */}
              {customPerCycleMode && (
                <div className="space-y-2">
                  <label className="block text-gray-900 text-xs font-bold">Chỉnh riêng thời gian mỗi cữ:</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 max-h-64 overflow-y-auto">
                    {customPerCycleConfigs.map((pc, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center text-xs">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={pc.name}
                            onChange={(e) => {
                              const updated = [...customPerCycleConfigs];
                              updated[i] = { ...updated[i], name: e.target.value };
                              setCustomPerCycleConfigs(updated);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-bold text-gray-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            placeholder={`Cữ ${i + 1}`}
                          />
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center space-x-1">
                            <Sun className="w-3 h-3 text-amber-500 flex-shrink-0" />
                            <input
                              type="number"
                              min="15"
                              max="360"
                              step="15"
                              value={pc.wake}
                              onChange={(e) => {
                                const updated = [...customPerCycleConfigs];
                                updated[i] = { ...updated[i], wake: Number(e.target.value) };
                                setCustomPerCycleConfigs(updated);
                              }}
                              className="w-full bg-white border border-amber-200 rounded-lg px-1.5 py-1.5 text-xs font-extrabold text-amber-900 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                            <span className="text-[9px] text-gray-400 whitespace-nowrap">p thức</span>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <div className="flex items-center space-x-1">
                            <Bed className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                            <input
                              type="number"
                              min="0"
                              max="240"
                              step="15"
                              value={pc.sleep}
                              onChange={(e) => {
                                const updated = [...customPerCycleConfigs];
                                updated[i] = { ...updated[i], sleep: Number(e.target.value) };
                                setCustomPerCycleConfigs(updated);
                              }}
                              className="w-full bg-white border border-indigo-200 rounded-lg px-1.5 py-1.5 text-xs font-extrabold text-indigo-900 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                            />
                            <span className="text-[9px] text-gray-400 whitespace-nowrap">p ngủ</span>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="text-[9px] text-gray-500 font-bold">{((pc.wake + pc.sleep) / 60).toFixed(1)}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Preview auto-calculated schedule */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-3 space-y-1.5">
                <span className="text-[10px] font-extrabold text-indigo-900 uppercase flex items-center">
                  <Sparkles className="w-3 h-3 text-indigo-600 mr-1" />
                  Preview Tự Động Tính
                </span>
                <div className="text-[10px] text-indigo-800 space-y-0.5 font-bold">
                  {(() => {
                    let t = morningWake;
                    const configs = customPerCycleMode
                      ? customPerCycleConfigs
                      : Array.from({ length: customCycleCount }, (_, i) => ({
                          wake: customWakeMins,
                          sleep: (i === customCycleCount - 1 && customSkipNap4) ? 0 : customSleepMins,
                          name: `Cữ ${i + 1}`,
                        }));
                    return configs.map((pc, i) => {
                      const eatStart = t;
                      const eatEnd = addMinutesToTime(eatStart, pc.wake);
                      const sleepEnd = addMinutesToTime(eatEnd, pc.sleep);
                      t = sleepEnd;
                      return (
                        <div key={i} className="flex items-center space-x-2">
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[8px] font-black flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <span>{pc.name}: {eatStart} → {eatEnd} (thức) → {sleepEnd} (ngủ xong)</span>
                        </div>
                      );
                    });
                  })()}
                  <div className="pt-1 border-t border-indigo-200/60 text-indigo-900 font-black">
                    🌙 Giờ vào giấc đêm:{' '}
                    {(() => {
                      let t = morningWake;
                      const configs = customPerCycleMode
                        ? customPerCycleConfigs
                        : Array.from({ length: customCycleCount }, (_, i) => ({
                            wake: customWakeMins,
                            sleep: (i === customCycleCount - 1 && customSkipNap4) ? 0 : customSleepMins,
                            name: `Cữ ${i + 1}`,
                          }));
                      configs.forEach(pc => {
                        t = addMinutesToTime(addMinutesToTime(t, pc.wake), pc.sleep);
                      });
                      return t;
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customPerCycleMode) {
                    // Per-cycle mode: build custom cycles from per-cycle configs
                    const customCycles: EasyCycleConfig[] = customPerCycleConfigs.map((pc, i) => ({
                      id: i + 1,
                      name: pc.name || `Cữ ${i + 1}`,
                      wakeDurationMinutes: pc.wake,
                      sleepDurationMinutes: pc.sleep,
                    }));
                    saveActiveConfig({
                      presetId: 'custom',
                      morningWakeTime: morningWake,
                      customCycles,
                    });
                    const newLog = generateDefaultDayLog('custom', morningWake, selectedDate, dayLog, customCycles);
                    setDayLog(newLog);
                    setSelectedPreset('custom');
                    easyStorage.saveDayLog(newLog);
                  } else {
                    handleGenerateCustomSchedule();
                  }
                  setShowCustomModal(false);
                }}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>⚡ Áp Dụng & Tự Động Tính</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Hidden Print-Only Report */}
      {dayLog && <PrintableEasyReport ref={printRef} dayLog={dayLog} />}
    </>
  );
};

export default EasyScheduleTab;
