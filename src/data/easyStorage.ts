import localforage from 'localforage';
import { localDiaryApi } from './localDiaryApi';

export type EasyPresetId = 'easy3' | 'easy35' | 'easy345' | 'easy4' | 'easy234' | 'easy56' | 'custom';

export interface EasyCycleConfig {
  id: number;
  name: string; // e.g. "Cữ 1 (Sáng)"
  wakeDurationMinutes: number; // Duration of Awake time A (in mins)
  sleepDurationMinutes: number; // Duration of Sleep time S (in mins)
}

export interface EasyDayConfig {
  presetId: EasyPresetId;
  morningWakeTime: string; // "07:00"
  cycles: EasyCycleConfig[];
}

export interface EasyCycleLog {
  cycleId: number;
  cycleName: string;
  eatStartTime: string; // "07:00"
  eatEndTime: string;   // "08:30"
  sleepStartTime: string; // "08:30"
  sleepEndTime: string;   // "10:00"

  // 1. Ti mẹ trực tiếp (Direct Breastfeeding)
  directBreastfeedStartTime?: string;            // Giờ bắt đầu ti mẹ (VD: "07:05")
  directBreastfeedDurationMinutes?: number | null; // Thời gian con ti (phút)
  directBreastfeedRating?: 1 | 2 | 3 | 4 | 5;    // Đánh giá cữ ti (1-5 sao)
  directBreastfeedEstimatedMilkMl?: number | null; // Ước lượng lượng sữa (ml)

  // 2. Ti bình (Bottle Feeding)
  bottleFeedStartTime?: string;                 // Giờ bắt đầu ti bình (VD: "07:30")
  bottleMilkVolumeMl?: number | null;           // Lượng sữa ti bình (ml)
  bottleMilkType?: 'breast' | 'formula';        // Loại sữa: Sữa mẹ / Sữa công thức
  formulaBrandId?: string | null;                // ID dòng sữa chọn từ thư viện
  formulaBrandName?: string | null;              // Tên/hãng sữa công thức

  // 3. Tã số lượng cụ thể
  wetDiaperCount?: number;                       // Số lượng cữ/tã ướt (đi tè)
  dirtyDiaperCount?: number;                     // Số lượng cữ/tã dơ (đi ngoài)

  // Legacy fields (for backwards compatibility)
  feedStartTime?: string;
  breastfeedStartTime?: string;
  breastfeedDurationMinutes?: number | null;
  breastfeedLatchingCount?: number | null;
  breastMilkVolumeMl?: number | null;
  formulaFeedStartTime?: string;
  formulaFeedDurationMinutes?: number | null;
  formulaFeedCount?: number | null;
  formulaMilkVolumeMl?: number | null;
  milkVolumeMl?: number | null;
  milkType?: 'breast' | 'formula' | 'mixed';
  wetDiaper?: boolean;
  dirtyDiaper?: boolean;

  notes?: string;
  sleptWellRating?: 1 | 2 | 3 | 4 | 5; // 1 to 5 stars
}

export interface EasyDayLog {
  dateStr: string; // "YYYY-MM-DD"
  presetId: EasyPresetId;
  morningWakeTime: string;
  cycles: EasyCycleLog[];
  bedtimeStart: string; // "19:00"
  // Night details
  nightFeedCount?: number | null;
  nightMilkVolumeMl?: number | null;
  nightMilkType?: 'breast' | 'formula' | 'mixed';
  nightWetDiaper?: boolean;
  nightDirtyDiaper?: boolean;
  nightWakeCount?: number | null;
  nightSleepQuality?: 1 | 2 | 3 | 4 | 5;
  nightNotes?: string;

  generalNotes?: string;
  updatedAt: number;
}

const easyStore = localforage.createInstance({
  name: "NuoiConDB",
  storeName: "easy_schedules"
});

// Standard default presets
export const EASY_PRESETS: Record<EasyPresetId, { name: string; ageRange: string; desc: string; morningWake: string; cycles: EasyCycleConfig[]; bedtime: string }> = {
  easy3: {
    name: 'E.A.S.Y 3',
    ageRange: '0 - 3 tháng',
    desc: 'Bé sinh ra đến 3 tháng. Mỗi cữ 3 tiếng (Thức 1 tiếng, Ngủ 2 tiếng). 4 cữ ngày + 1 cữ tối phụ + Ngủ đêm.',
    morningWake: '07:00',
    bedtime: '19:00',
    cycles: [
      { id: 1, name: 'Cữ 1 (Sáng)', wakeDurationMinutes: 60, sleepDurationMinutes: 120 },
      { id: 2, name: 'Cữ 2 (Trưa)', wakeDurationMinutes: 60, sleepDurationMinutes: 120 },
      { id: 3, name: 'Cữ 3 (Chiều)', wakeDurationMinutes: 60, sleepDurationMinutes: 120 },
      { id: 4, name: 'Cữ 4 (Mặt trời lặn)', wakeDurationMinutes: 60, sleepDurationMinutes: 90 },
      { id: 5, name: 'Cữ phụ 5 (Nạp đêm)', wakeDurationMinutes: 45, sleepDurationMinutes: 45 },
    ]
  },
  easy35: {
    name: 'E.A.S.Y 3.5',
    ageRange: '6 - 12 tuần (Chuyển tiếp 3 -> 3.5)',
    desc: 'Giai đoạn chuyển tiếp 3h -> 3.5h. Mỗi cữ 3.5 tiếng (Thức 1.5 tiếng, Ngủ 2 tiếng). Giúp bé thích nghi khi giãn cữ bú.',
    morningWake: '07:00',
    bedtime: '19:30',
    cycles: [
      { id: 1, name: 'Cữ 1 (Sáng)', wakeDurationMinutes: 90, sleepDurationMinutes: 120 },
      { id: 2, name: 'Cữ 2 (Trưa)', wakeDurationMinutes: 90, sleepDurationMinutes: 120 },
      { id: 3, name: 'Cữ 3 (Chiều)', wakeDurationMinutes: 90, sleepDurationMinutes: 90 },
      { id: 4, name: 'Cữ 4 (Chợp mắt phụ)', wakeDurationMinutes: 60, sleepDurationMinutes: 45 },
    ]
  },
  easy345: {
    name: 'E.A.S.Y 3h45m',
    ageRange: '12 - 16 tuần (Chuyển tiếp 3.5 -> 4)',
    desc: 'Giai đoạn chuyển tiếp 3.5h -> 4h. Mỗi cữ 3 tiếng 45 phút (Thức 1 tiếng 45 phút, Ngủ 2 tiếng). Tăng thời gian thức trước khi lên EASY 4 chính thức.',
    morningWake: '07:00',
    bedtime: '19:15',
    cycles: [
      { id: 1, name: 'Cữ 1 (Sáng)', wakeDurationMinutes: 105, sleepDurationMinutes: 120 },
      { id: 2, name: 'Cữ 2 (Trưa)', wakeDurationMinutes: 105, sleepDurationMinutes: 120 },
      { id: 3, name: 'Cữ 3 (Chiều)', wakeDurationMinutes: 105, sleepDurationMinutes: 90 },
      { id: 4, name: 'Cữ 4 (Chợp mắt phụ)', wakeDurationMinutes: 60, sleepDurationMinutes: 30 },
    ]
  },
  easy4: {
    name: 'E.A.S.Y 4',
    ageRange: '3 - 6 tháng',
    desc: 'Dành cho bé 3-6 tháng. Mỗi cữ 4 tiếng (Thức 2 tiếng, Ngủ 2 tiếng). 3 cữ chính + 1 cữ nap ngắn + Ngủ đêm.',
    morningWake: '07:00',
    bedtime: '19:00',
    cycles: [
      { id: 1, name: 'Cữ 1 (Sáng)', wakeDurationMinutes: 120, sleepDurationMinutes: 120 },
      { id: 2, name: 'Cữ 2 (Trưa)', wakeDurationMinutes: 120, sleepDurationMinutes: 120 },
      { id: 3, name: 'Cữ 3 (Chiều)', wakeDurationMinutes: 120, sleepDurationMinutes: 90 },
      { id: 4, name: 'Cữ 4 (Chợp mắt phụ)', wakeDurationMinutes: 60, sleepDurationMinutes: 30 },
    ]
  },
  easy234: {
    name: 'E.A.S.Y 2-3-4',
    ageRange: '7 - 11 tháng',
    desc: 'Dành cho bé 7-11 tháng. 2 giấc ngủ ngày. Khoảng thức tăng dần: Thức 2h -> Nap 1 -> Thức 3h -> Nap 2 -> Thức 4h -> Ngủ đêm.',
    morningWake: '07:00',
    bedtime: '19:00',
    cycles: [
      { id: 1, name: 'Giấc 1 (Thức 2h - Ngủ 1.5h)', wakeDurationMinutes: 120, sleepDurationMinutes: 90 },
      { id: 2, name: 'Giấc 2 (Thức 3h - Ngủ 1.5h)', wakeDurationMinutes: 180, sleepDurationMinutes: 90 },
      { id: 3, name: 'Vào giấc đêm (Thức 4h)', wakeDurationMinutes: 240, sleepDurationMinutes: 0 },
    ]
  },
  easy56: {
    name: 'E.A.S.Y 5-6 (Lịch 2-4)',
    ageRange: '12 - 18+ tháng',
    desc: 'Dành cho bé trên 1 tuổi. Bé bỏ giấc sáng, còn 1 giấc trưa dài. Thức 5h -> Ngủ trưa 2h -> Thức 5-6h -> Ngủ đêm.',
    morningWake: '07:00',
    bedtime: '20:00',
    cycles: [
      { id: 1, name: 'Sáng - Ngủ trưa (Thức 5h - Ngủ 2h)', wakeDurationMinutes: 300, sleepDurationMinutes: 120 },
      { id: 2, name: 'Chiều - Vào giấc đêm (Thức 5.5h)', wakeDurationMinutes: 330, sleepDurationMinutes: 0 },
    ]
  },
  custom: {
    name: 'Tùy chỉnh (Custom)',
    ageRange: 'Mọi độ tuổi',
    desc: 'Tự thiết lập khoảng thời gian thức và ngủ riêng cho từng cữ theo nhu cầu sinh lý của bé.',
    morningWake: '07:00',
    bedtime: '19:30',
    cycles: [
      { id: 1, name: 'Cữ 1', wakeDurationMinutes: 90, sleepDurationMinutes: 90 },
      { id: 2, name: 'Cữ 2', wakeDurationMinutes: 90, sleepDurationMinutes: 90 },
      { id: 3, name: 'Cữ 3', wakeDurationMinutes: 120, sleepDurationMinutes: 60 },
    ]
  }
};

// Helper to check valid HH:MM format
export function isValidTimeStr(timeStr: string): boolean {
  return typeof timeStr === 'string' && /^\d{2}:\d{2}$/.test(timeStr);
}

// Utility to add minutes to "HH:MM" string
export function addMinutesToTime(timeStr: string, minutes: number): string {
  if (!isValidTimeStr(timeStr)) return "07:00";
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h || 0, m || 0, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  const newH = String(date.getHours()).padStart(2, '0');
  const newM = String(date.getMinutes()).padStart(2, '0');
  return `${newH}:${newM}`;
}

// Utility to calculate minutes difference between "HH:MM" and "HH:MM"
export function getMinutesBetweenTimes(startStr: string, endStr: string): number {
  if (!isValidTimeStr(startStr) || !isValidTimeStr(endStr)) return 60;
  const [h1, m1] = startStr.split(':').map(Number);
  const [h2, m2] = endStr.split(':').map(Number);
  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 60;
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff <= 0) diff += 24 * 60; // Next day fallback
  return diff;
}

// Get safe duration in minutes, falling back if invalid or unrealistic
export function getSafeDurationMinutes(startStr: string, endStr: string, fallbackMins: number = 60): number {
  if (!isValidTimeStr(startStr) || !isValidTimeStr(endStr)) {
    return fallbackMins;
  }
  const diff = getMinutesBetweenTimes(startStr, endStr);
  if (diff <= 0 || diff > 480) {
    return fallbackMins;
  }
  return diff;
}

// Active Config Persistence (so subsequent days inherit the chosen active preset)
export interface EasyActiveConfig {
  presetId: EasyPresetId;
  morningWakeTime: string;
  customCycles?: EasyCycleConfig[];
}

export function saveActiveConfig(config: EasyActiveConfig): void {
  try {
    localStorage.setItem('cungcon_easy_active_config', JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save active EASY config:', e);
  }
}

export function getActiveConfig(): EasyActiveConfig {
  try {
    const str = localStorage.getItem('cungcon_easy_active_config');
    if (str) {
      const parsed = JSON.parse(str);
      if (parsed && parsed.presetId) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse active EASY config:', e);
  }
  return { presetId: 'easy3', morningWakeTime: '07:00' };
}

// Calculate complete daily time statistics (Wake vs Sleep)
export function getDayTotalDurations(dayLog: EasyDayLog): {
  dayWakeMinutes: number;
  daySleepMinutes: number;
  nightSleepMinutes: number;
  totalSleepMinutes: number;
  totalWakeMinutes: number;
  dayWakeStr: string;
  daySleepStr: string;
  nightSleepStr: string;
  totalSleepStr: string;
  totalWakeStr: string;
} {
  let dayWakeMinutes = 0;
  let daySleepMinutes = 0;

  const preset = EASY_PRESETS[dayLog.presetId] || EASY_PRESETS.easy3;

  dayLog.cycles.forEach((c, idx) => {
    const presetCycle = preset.cycles[idx];
    const defaultWake = presetCycle?.wakeDurationMinutes || 60;
    const defaultSleep = presetCycle?.sleepDurationMinutes || 120;

    const wakeMins = getSafeDurationMinutes(c.eatStartTime, c.eatEndTime, defaultWake);
    const sleepMins = getSafeDurationMinutes(c.sleepStartTime, c.sleepEndTime, defaultSleep);

    dayWakeMinutes += wakeMins;
    daySleepMinutes += sleepMins;
  });

  const bedtime = isValidTimeStr(dayLog.bedtimeStart) ? dayLog.bedtimeStart : "19:00";
  const morningWake = isValidTimeStr(dayLog.morningWakeTime) ? dayLog.morningWakeTime : "07:00";

  const nightSleepMinutes = getMinutesBetweenTimes(bedtime, morningWake);
  const totalSleepMinutes = daySleepMinutes + nightSleepMinutes;
  const totalWakeMinutes = Math.max(0, 1440 - totalSleepMinutes);

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}p`;
    return m > 0 ? `${h}h ${m}p` : `${h}h`;
  };

  return {
    dayWakeMinutes,
    daySleepMinutes,
    nightSleepMinutes,
    totalSleepMinutes,
    totalWakeMinutes,
    dayWakeStr: formatMins(dayWakeMinutes),
    daySleepStr: formatMins(daySleepMinutes),
    nightSleepStr: formatMins(nightSleepMinutes),
    totalSleepStr: formatMins(totalSleepMinutes),
    totalWakeStr: formatMins(totalWakeMinutes),
  };
}

// Generate default cycles log given preset and start wake time (preserves existing night notes if provided)
export function generateDefaultDayLog(
  presetId: EasyPresetId,
  morningWakeTime: string = '07:00',
  dateStr: string,
  existingLog?: EasyDayLog | null,
  customCycles?: EasyCycleConfig[]
): EasyDayLog {
  const preset = EASY_PRESETS[presetId] || EASY_PRESETS.easy3;
  let cycleConfigs = customCycles || (presetId === 'custom' && existingLog ? existingLog.cycles.map(c => ({
    id: c.cycleId,
    name: c.cycleName,
    wakeDurationMinutes: getSafeDurationMinutes(c.eatStartTime, c.eatEndTime, 90),
    sleepDurationMinutes: getSafeDurationMinutes(c.sleepStartTime, c.sleepEndTime, 90)
  })) : preset.cycles);

  let currentTime = isValidTimeStr(morningWakeTime) ? morningWakeTime : preset.morningWake;

  const cycles: EasyCycleLog[] = cycleConfigs.map((c) => {
    const eatStartTime = currentTime;
    const eatEndTime = addMinutesToTime(eatStartTime, c.wakeDurationMinutes);
    const sleepStartTime = eatEndTime;
    const sleepEndTime = addMinutesToTime(sleepStartTime, c.sleepDurationMinutes);

    currentTime = sleepEndTime;

    const existingCycle = existingLog?.cycles?.find(ec => ec.cycleId === c.id);

    return {
      cycleId: c.id,
      cycleName: c.name,
      eatStartTime,
      eatEndTime,
      sleepStartTime,
      sleepEndTime,
      milkVolumeMl: existingCycle?.milkVolumeMl ?? null,
      milkType: existingCycle?.milkType ?? 'breast',
      directBreastfeedStartTime: existingCycle?.directBreastfeedStartTime,
      directBreastfeedDurationMinutes: existingCycle?.directBreastfeedDurationMinutes,
      directBreastfeedRating: existingCycle?.directBreastfeedRating,
      directBreastfeedEstimatedMilkMl: existingCycle?.directBreastfeedEstimatedMilkMl,
      bottleFeedStartTime: existingCycle?.bottleFeedStartTime,
      bottleMilkVolumeMl: existingCycle?.bottleMilkVolumeMl,
      bottleMilkType: existingCycle?.bottleMilkType,
      formulaBrandId: existingCycle?.formulaBrandId,
      formulaBrandName: existingCycle?.formulaBrandName,
      wetDiaperCount: existingCycle?.wetDiaperCount ?? 0,
      dirtyDiaperCount: existingCycle?.dirtyDiaperCount ?? 0,
      wetDiaper: existingCycle?.wetDiaper ?? false,
      dirtyDiaper: existingCycle?.dirtyDiaper ?? false,
      notes: existingCycle?.notes ?? '',
      sleptWellRating: existingCycle?.sleptWellRating ?? 5
    };
  });

  return {
    dateStr,
    presetId,
    morningWakeTime: isValidTimeStr(morningWakeTime) ? morningWakeTime : preset.morningWake,
    cycles,
    bedtimeStart: currentTime,
    nightFeedCount: existingLog?.nightFeedCount ?? 1,
    nightMilkVolumeMl: existingLog?.nightMilkVolumeMl ?? null,
    nightMilkType: existingLog?.nightMilkType ?? 'breast',
    nightWetDiaper: existingLog?.nightWetDiaper ?? true,
    nightDirtyDiaper: existingLog?.nightDirtyDiaper ?? false,
    nightWakeCount: existingLog?.nightWakeCount ?? 1,
    nightSleepQuality: existingLog?.nightSleepQuality ?? 5,
    nightNotes: existingLog?.nightNotes ?? '',
    generalNotes: existingLog?.generalNotes ?? '',
    updatedAt: Date.now()
  };
}

// Generate Custom EASY Day Log auto-calculated from parameters
export function generateCustomDayLog(
  morningWakeTime: string,
  cycleCount: number,
  wakeMinsPerCycle: number,
  sleepMinsPerCycle: number,
  skipNap4: boolean,
  dateStr: string,
  existingLog?: EasyDayLog | null
): EasyDayLog {
  const customCycles: EasyCycleConfig[] = [];
  for (let i = 1; i <= cycleCount; i++) {
    const isNap4 = (i === 4 || i === cycleCount) && skipNap4;
    const sleepMins = isNap4 ? 0 : sleepMinsPerCycle;
    customCycles.push({
      id: i,
      name: `Cữ ${i}${isNap4 ? ' (Chỉ Thức)' : ''}`,
      wakeDurationMinutes: wakeMinsPerCycle,
      sleepDurationMinutes: sleepMins,
    });
  }

  saveActiveConfig({
    presetId: 'custom',
    morningWakeTime,
    customCycles,
  });

  return generateDefaultDayLog('custom', morningWakeTime, dateStr, existingLog, customCycles);
}

// Recalculate subsequent cycles when a cycle's timing changes
export function cascadeRecalculateCycles(dayLog: EasyDayLog, updatedCycleIndex: number, newCycleLog: EasyCycleLog): EasyDayLog {
  const preset = EASY_PRESETS[dayLog.presetId] || EASY_PRESETS.easy3;
  const newCycles = [...dayLog.cycles];
  newCycles[updatedCycleIndex] = newCycleLog;

  // Cascade recalculate all subsequent cycles starting from updatedCycleIndex + 1
  let currentStartTime = isValidTimeStr(newCycleLog.sleepEndTime) ? newCycleLog.sleepEndTime : "10:00";

  for (let i = updatedCycleIndex + 1; i < newCycles.length; i++) {
    const orig = newCycles[i];
    const presetCycle = preset.cycles[i];

    const defaultWake = presetCycle?.wakeDurationMinutes || 60;
    const defaultSleep = presetCycle?.sleepDurationMinutes || 120;

    // Calculate original duration of wake & sleep
    const wakeDuration = getSafeDurationMinutes(orig.eatStartTime, orig.eatEndTime, defaultWake);
    const sleepDuration = getSafeDurationMinutes(orig.sleepStartTime, orig.sleepEndTime, defaultSleep);

    const eatStartTime = currentStartTime;
    const eatEndTime = addMinutesToTime(eatStartTime, wakeDuration);
    const sleepStartTime = eatEndTime;
    const sleepEndTime = addMinutesToTime(sleepStartTime, sleepDuration);

    newCycles[i] = {
      ...orig,
      eatStartTime,
      eatEndTime,
      sleepStartTime,
      sleepEndTime,
    };

    currentStartTime = sleepEndTime;
  }

  return {
    ...dayLog,
    morningWakeTime: updatedCycleIndex === 0 && isValidTimeStr(newCycleLog.eatStartTime) ? newCycleLog.eatStartTime : dayLog.morningWakeTime,
    cycles: newCycles,
    bedtimeStart: currentStartTime,
    updatedAt: Date.now()
  };
}

// Helper to get total milk volume for a single cycle
export function getCycleTotalMilk(c: EasyCycleLog): number {
  let total = 0;
  if (c.directBreastfeedEstimatedMilkMl) total += c.directBreastfeedEstimatedMilkMl;
  if (c.bottleMilkVolumeMl) total += c.bottleMilkVolumeMl;

  // Fallback to legacy fields if new fields are empty
  if (total === 0) {
    if (c.breastMilkVolumeMl != null || c.formulaMilkVolumeMl != null) {
      total = (c.breastMilkVolumeMl || 0) + (c.formulaMilkVolumeMl || 0);
    } else if (c.milkVolumeMl) {
      total = c.milkVolumeMl;
    }
  }
  return total;
}

// Helper to calculate complete daily milk breakdown across daytime cycles & night feeds
export function getDayTotalMilk(dayLog: EasyDayLog): {
  daytimeMilk: number;
  breastMilkTotal: number;
  formulaMilkTotal: number;
  nightMilk: number;
  grandTotal: number;
} {
  let daytimeMilk = 0;
  let breastMilkTotal = 0;
  let formulaMilkTotal = 0;

  dayLog.cycles.forEach((c) => {
    const cycleTotal = getCycleTotalMilk(c);
    daytimeMilk += cycleTotal;

    // 1. Direct Breastfeed
    if (c.directBreastfeedEstimatedMilkMl) {
      breastMilkTotal += c.directBreastfeedEstimatedMilkMl;
    }

    // 2. Bottle Feed
    if (c.bottleMilkVolumeMl) {
      if (c.bottleMilkType === 'formula') {
        formulaMilkTotal += c.bottleMilkVolumeMl;
      } else {
        breastMilkTotal += c.bottleMilkVolumeMl;
      }
    }

    // 3. Legacy fallback
    if (!c.directBreastfeedEstimatedMilkMl && !c.bottleMilkVolumeMl) {
      if (c.breastMilkVolumeMl) breastMilkTotal += c.breastMilkVolumeMl;
      if (c.formulaMilkVolumeMl) formulaMilkTotal += c.formulaMilkVolumeMl;
      if (!c.breastMilkVolumeMl && !c.formulaMilkVolumeMl && c.milkVolumeMl) {
        if (c.milkType === 'formula') formulaMilkTotal += c.milkVolumeMl;
        else breastMilkTotal += c.milkVolumeMl;
      }
    }
  });

  const nightMilk = dayLog.nightMilkVolumeMl || 0;
  if (dayLog.nightMilkType === 'formula') {
    formulaMilkTotal += nightMilk;
  } else {
    breastMilkTotal += nightMilk;
  }

  const grandTotal = daytimeMilk + nightMilk;

  return {
    daytimeMilk,
    breastMilkTotal,
    formulaMilkTotal,
    nightMilk,
    grandTotal
  };
}

export const easyStorage = {
  async getDayLog(dateStr: string): Promise<EasyDayLog | null> {
    return await easyStore.getItem(dateStr);
  },

  async saveDayLog(dayLog: EasyDayLog): Promise<void> {
    await easyStore.setItem(dayLog.dateStr, {
      ...dayLog,
      updatedAt: Date.now()
    });
  },

  async syncToDailyDiary(dayLog: EasyDayLog, userId?: string | null): Promise<string> {
    // Generate clean markdown or structured text summarizing EASY day
    const preset = EASY_PRESETS[dayLog.presetId] || EASY_PRESETS.easy3;
    
    // Calculate total milk and diapers using stats helper
    const milkStats = getDayTotalMilk(dayLog);
    let totalWet = 0;
    let totalDirty = 0;

    const cycleDetailsText = dayLog.cycles.map((c) => {
      // Accumulate diapers count
      if (c.wetDiaperCount) totalWet += c.wetDiaperCount;
      else if (c.wetDiaper) totalWet += 1;

      if (c.dirtyDiaperCount) totalDirty += c.dirtyDiaperCount;
      else if (c.dirtyDiaper) totalDirty += 1;

      const cycleMilkTotal = getCycleTotalMilk(c);
      const feedParts: string[] = [];

      // Direct Breastfeed
      if (c.directBreastfeedDurationMinutes || c.directBreastfeedEstimatedMilkMl) {
        let text = `🤱 **Ti mẹ trực tiếp** [${c.directBreastfeedStartTime || c.eatStartTime}]`;
        if (c.directBreastfeedDurationMinutes) text += `: ${c.directBreastfeedDurationMinutes} phút`;
        if (c.directBreastfeedRating) text += ` (${'⭐'.repeat(c.directBreastfeedRating)})`;
        if (c.directBreastfeedEstimatedMilkMl) text += ` ~ ${c.directBreastfeedEstimatedMilkMl}ml`;
        feedParts.push(text);
      } else if (c.breastfeedDurationMinutes || c.breastMilkVolumeMl) { // Legacy
        feedParts.push(`🤱 Ti mẹ: ${c.breastfeedDurationMinutes ? `${c.breastfeedDurationMinutes}p` : ''}${c.breastMilkVolumeMl ? ` ${c.breastMilkVolumeMl}ml` : ''}`);
      }

      // Bottle Feed
      if (c.bottleMilkVolumeMl) {
        let text = `🍼 **Ti bình (${c.bottleMilkType === 'formula' ? 'Sữa công thức' : 'Sữa mẹ'})** [${c.bottleFeedStartTime || c.eatStartTime}]: ${c.bottleMilkVolumeMl}ml`;
        if (c.bottleMilkType === 'formula' && c.formulaBrandName) text += ` (${c.formulaBrandName})`;
        feedParts.push(text);
      } else if (c.formulaMilkVolumeMl) { // Legacy
        feedParts.push(`🍼 Sữa CT: ${c.formulaMilkVolumeMl}ml`);
      } else if (c.milkVolumeMl) {
        feedParts.push(`🍼 Sữa: ${c.milkVolumeMl}ml`);
      }

      const feedSummary = feedParts.length > 0 
        ? `\n  • ${feedParts.join('\n  • ')} → **Tổng cữ: ${cycleMilkTotal}ml**` 
        : (cycleMilkTotal > 0 ? ` → **Tổng cữ: ${cycleMilkTotal}ml**` : '');

      const diaperTextParts: string[] = [];
      const wetCount = c.wetDiaperCount ?? (c.wetDiaper ? 1 : 0);
      const dirtyCount = c.dirtyDiaperCount ?? (c.dirtyDiaper ? 1 : 0);
      if (wetCount > 0) diaperTextParts.push(`💦 Tã ướt: ${wetCount}`);
      if (dirtyCount > 0) diaperTextParts.push(`💩 Tã dơ: ${dirtyCount}`);
      const diaperSummary = diaperTextParts.length > 0 ? ` | ${diaperTextParts.join(', ')}` : '';

      return `🔹 **${c.cycleName}** (${c.eatStartTime} - ${c.sleepEndTime})
- 🍼 **Ăn & Chơi:** ${c.eatStartTime} - ${c.eatEndTime}${feedSummary}${diaperSummary}
- 😴 **Giấc ngủ:** ${c.sleepStartTime} - ${c.sleepEndTime} ${c.sleptWellRating ? `(Đánh giá ngủ: ${'⭐'.repeat(c.sleptWellRating)})` : ''}
${c.notes ? `- 📝 *Ghi chú:* ${c.notes}` : ''}`;
    }).join('\n\n');

    if (dayLog.nightWetDiaper) totalWet += 1;
    if (dayLog.nightDirtyDiaper) totalDirty += 1;

    const nightSummaryText = `🌙 **Trình tự & Giấc ngủ đêm (Bắt đầu từ ${dayLog.bedtimeStart}):**
- 🛌 **Chất lượng ngủ đêm:** ${dayLog.nightSleepQuality ? '⭐'.repeat(dayLog.nightSleepQuality) : 'Tốt'}
- 🍼 **Cữ bú đêm:** ${dayLog.nightFeedCount ?? 0} cữ ${dayLog.nightMilkVolumeMl ? `(Tổng ${dayLog.nightMilkVolumeMl}ml)` : ''}
- ⏰ **Số lần bé dậy đêm:** ${dayLog.nightWakeCount ?? 0} lần
- 👶 **Tã đêm:** ${dayLog.nightWetDiaper ? 'Tã ướt' : ''} ${dayLog.nightDirtyDiaper ? 'Tã dơ' : ''}
${dayLog.nightNotes ? `- 📝 *Ghi chú cữ đêm:* ${dayLog.nightNotes}` : ''}`;

    const title = `Lịch EASY ${preset.name} - Ngày ${dayLog.dateStr}`;
    const content = `⏰ **Giờ thức dậy buổi sáng:** ${dayLog.morningWakeTime}
🍼 **TỔNG LƯỢNG SỮA TRONG NGÀY:** **${milkStats.grandTotal} ml** (Sữa mẹ: ${milkStats.breastMilkTotal}ml, Sữa CT: ${milkStats.formulaMilkTotal}ml, Sữa đêm: ${milkStats.nightMilk}ml)
👶 **TỔNG TÃ TRONG NGÀY:** **💦 ${totalWet} cữ ướt**, **💩 ${totalDirty} cữ dơ**

📅 **Lịch trình EASY (${preset.name}):**

${cycleDetailsText}

${nightSummaryText}

${dayLog.generalNotes ? `📌 **Ghi chú chung ngày:**\n${dayLog.generalNotes}` : ''}`;

    // Search for existing entry in localDiaryApi with matching dateStr and title starting with "Lịch EASY"
    const allEntries = await localDiaryApi.getAllEntries();
    const existingEntry = allEntries.find(e => e.dateStr === dayLog.dateStr && e.title.includes('Lịch EASY'));

    if (existingEntry) {
      await localDiaryApi.updateEntry(existingEntry.id, {
        title,
        content,
        breastMilkVolume: milkStats.grandTotal > 0 ? milkStats.grandTotal : existingEntry.breastMilkVolume,
        wetDiapers: totalWet > 0 ? totalWet : existingEntry.wetDiapers,
        dirtyDiapers: totalDirty > 0 ? totalDirty : existingEntry.dirtyDiapers,
        abnormalNotes: dayLog.generalNotes || existingEntry.abnormalNotes,
      });
      return existingEntry.id;
    } else {
      const newId = await localDiaryApi.addEntry({
        userId: userId || null,
        title,
        content,
        dateStr: dayLog.dateStr,
        images: [],
        breastMilkVolume: milkStats.grandTotal > 0 ? milkStats.grandTotal : null,
        wetDiapers: totalWet > 0 ? totalWet : null,
        dirtyDiapers: totalDirty > 0 ? totalDirty : null,
        abnormalNotes: dayLog.generalNotes || null,
      });
      return newId;
    }
  },

  getAllDayLogs: async (): Promise<EasyDayLog[]> => {
    const logs: EasyDayLog[] = [];
    await easyStore.iterate((value: EasyDayLog) => {
      if (value && value.dateStr) {
        logs.push(value);
      }
    });
    return logs;
  }
};
