import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Book,
  Bot,
  ArrowRight,
  Activity,
  CalendarDays,
  BookPlus,
  TrendingUp,
  Sparkles,
  Milk,
  Heart,
  Zap,
  ShieldCheck,
  Scale,
  Ruler,
  CheckCircle2,
  ChevronRight,
  Pin,
  RefreshCw,
  Baby,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { localDiaryApi, LocalDiaryEntry } from '../data/localDiaryApi';
import { easyStorage, getDayTotalMilk, EasyDayLog } from '../data/easyStorage';
import { aiSettingsStorage } from '../data/aiSettingsStorage';
import { babyProfileStorage, BabyProfile, getBabyAgeText } from '../data/babyProfileStorage';
import { growthStorage, GrowthRecord } from '../data/growthStorage';
import { 
  WHO_BOYS_WEIGHT_KG, WHO_GIRLS_WEIGHT_KG, 
  WHO_BOYS_HEIGHT_CM, WHO_GIRLS_HEIGHT_CM, 
  evaluateGrowth 
} from '../data/whoGrowthData';
import { format, subDays, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiFetch } from '../apiClient';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LocalDiaryEntry[]>([]);
  const [todayEasyLog, setTodayEasyLog] = useState<EasyDayLog | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [newGrowth, setNewGrowth] = useState({ dateStr: new Date().toISOString().split('T')[0], weightKg: '', heightCm: '', notes: '' });

  // Pinned AI Advice state for today (analyzed from yesterday's data)
  const [pinnedAiAdvice, setPinnedAiAdvice] = useState<string>('');
  const [analyzedDateStr, setAnalyzedDateStr] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await localDiaryApi.getAllEntries();
        setEntries(data);
      } catch (e) {
        console.error('Failed to get entries', e);
      }
    };
    fetchEntries();
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    easyStorage.getDayLog(today).then(log => {
      setTodayEasyLog(log || null);
    });
    babyProfileStorage.getProfile().then(profile => {
      setBabyProfile(profile);
    });
    fetchGrowthRecords();
  }, []);

  const fetchGrowthRecords = async () => {
    const records = await growthStorage.getAllRecords();
    setGrowthRecords(records);
  };

  const handleSaveGrowth = async () => {
    if (!newGrowth.weightKg && !newGrowth.heightCm) return;
    let monthAge = 0;
    if (babyProfile?.birthDate) {
      const days = differenceInDays(new Date(newGrowth.dateStr), new Date(babyProfile.birthDate));
      monthAge = Math.max(0, Number((days / 30.436875).toFixed(1)));
    }
    
    await growthStorage.addRecord({
      dateStr: newGrowth.dateStr,
      monthAge,
      weightKg: newGrowth.weightKg ? Number(newGrowth.weightKg) : undefined,
      heightCm: newGrowth.heightCm ? Number(newGrowth.heightCm) : undefined,
      notes: newGrowth.notes
    });
    
    setShowGrowthModal(false);
    setNewGrowth({ dateStr: new Date().toISOString().split('T')[0], weightKg: '', heightCm: '', notes: '' });
    fetchGrowthRecords();
  };

  // Fetch & Pin AI Advice based on Yesterday's Data
  const analyzeYesterdayAndPinAdvice = async (forceRefresh = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = subDays(new Date(), 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    const yesterdayFormatted = format(yesterdayDate, 'dd/MM/yyyy', { locale: vi });

    setAnalyzedDateStr(yesterdayFormatted);

    // Check localStorage cache for today's pinned advice
    const cacheKey = `pinned_ai_advice_${todayStr}`;
    const cachedAdvice = localStorage.getItem(cacheKey);

    if (cachedAdvice && !forceRefresh) {
      setPinnedAiAdvice(cachedAdvice);
      return;
    }

    setLoadingAi(true);
    try {
      // 1. Get yesterday's diary entry (or fallback to latest entry)
      const yesterdayEntry = entries.find(e => e.dateStr === yesterdayStr) || entries[0];
      
      // 2. Get yesterday's EASY log
      const yesterdayEasy = await easyStorage.getDayLog(yesterdayStr);
      const milkStats = yesterdayEasy ? getDayTotalMilk(yesterdayEasy) : null;
      const aiSettings = await aiSettingsStorage.getSettings();
      const currentProfile = babyProfile || await babyProfileStorage.getProfile();

      const babyName = currentProfile.nickname || currentProfile.name || 'bé';
      const ageText = getBabyAgeText(currentProfile.birthDate);

      const dataStr = `
THÔNG TIN BÉ: Tên: ${babyName}, Độ tuổi: ${ageText}, Giới tính: ${currentProfile.gender === 'female' ? 'Bé gái' : 'Bé trai'}, Tiền sử dị ứng: ${currentProfile.allergies || 'Không'}, Lưu ý y tế: ${currentProfile.medicalNotes || 'Không'}.

PHÂN TÍCH CHĂM SÓC NGÀY HÔM QUA (${yesterdayFormatted}):
- Nhật ký: ${yesterdayEntry ? `Chiều cao: ${yesterdayEntry.height || 'N/A'}cm, Cân nặng: ${yesterdayEntry.weight || 'N/A'}kg, Tã: ${yesterdayEntry.wetDiapers || 0} ướt/${yesterdayEntry.dirtyDiapers || 0} dơ. Dấu hiệu bất thường: "${yesterdayEntry.abnormalNotes || 'Không có'}". Ghi chú: "${yesterdayEntry.title || ''} - ${yesterdayEntry.content || ''}"` : 'Chưa nhập nhật ký'}
- Lịch EASY: ${yesterdayEasy && milkStats ? `Tổng sữa: ${milkStats.grandTotal}ml (Sữa mẹ: ${milkStats.breastMilkTotal}ml, Sữa CT: ${milkStats.formulaMilkTotal}ml), Giờ ngủ đêm: ${yesterdayEasy.bedtimeStart}, Đánh giá giấc đêm: ${yesterdayEasy.nightSleepQuality || 5}/5 sao` : 'Chưa lưu lịch EASY'}
`;

      const res = await apiFetch('/api/generate-notes', {
        method: 'POST',
        body: JSON.stringify({ dataStr, aiSettings })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || 'Lỗi API');
      }

      const responseData = await res.json();
      const generatedText = responseData.notes || `Hôm qua ${babyName} sinh hoạt rất ngoan! Hãy tiếp tục duy trì cữ ăn và giấc ngủ khoa học cho bé hôm nay nhé.`;
      
      setPinnedAiAdvice(generatedText);
      localStorage.setItem(cacheKey, generatedText);
    } catch (error) {
      console.error("Failed to generate pinned AI advice", error);
      const babyName = babyProfile?.nickname || 'bé';
      setPinnedAiAdvice(`Hôm qua ${babyName} sinh hoạt rất ngoan! Hãy tiếp tục duy trì cữ ăn và giấc ngủ khoa học cho bé hôm nay nhé.`);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    analyzeYesterdayAndPinAdvice();
  }, [entries, babyProfile]);

  const latestEntry = entries.length > 0 ? entries[0] : null;
  const latestGrowth = growthRecords.length > 0 ? growthRecords[0] : null;

  // Xây dựng dữ liệu biểu đồ tăng trưởng (Merge WHO data và dữ liệu thực tế)
  const isBoy = babyProfile?.gender === 'male';
  const whoWeightData = isBoy ? WHO_BOYS_WEIGHT_KG : WHO_GIRLS_WEIGHT_KG;
  const whoHeightData = isBoy ? WHO_BOYS_HEIGHT_CM : WHO_GIRLS_HEIGHT_CM;

  let weightEval = null;
  if (latestGrowth?.weightKg) {
    weightEval = evaluateGrowth(latestGrowth.weightKg, whoWeightData, latestGrowth.monthAge);
  }
  let heightEval = null;
  if (latestGrowth?.heightCm) {
    heightEval = evaluateGrowth(latestGrowth.heightCm, whoHeightData, latestGrowth.monthAge);
  }

  // Kết hợp mốc WHO và record bé cho biểu đồ (Lấy từ 0-24 tháng làm chuẩn)
  const chartData: any[] = [];
  const maxMonth = latestGrowth ? Math.max(24, Math.ceil(latestGrowth.monthAge)) : 24;
  for (let m = 0; m <= maxMonth; m++) {
    // Nội suy sơ bộ dữ liệu WHO nếu không có tháng chẵn
    const wRef = whoWeightData.find(d => d.month === m) || whoWeightData.find(d => d.month > m);
    const hRef = whoHeightData.find(d => d.month === m) || whoHeightData.find(d => d.month > m);
    
    // Tìm record của bé ở tháng này (làm tròn)
    const babyRecs = growthRecords.filter(r => Math.round(r.monthAge) === m);
    const babyW = babyRecs.find(r => r.weightKg)?.weightKg;
    const babyH = babyRecs.find(r => r.heightCm)?.heightCm;

    if (wRef && hRef) {
      chartData.push({
        month: m,
        w_p3: wRef.p3,
        w_p50: wRef.p50,
        w_p97: wRef.p97,
        h_p3: hRef.p3,
        h_p50: hRef.p50,
        h_p97: hRef.p97,
        babyW: babyW || null,
        babyH: babyH || null,
      });
    }
  }

  // Calculate Nutrition Dashboard Stats for Today
  const milkStats = todayEasyLog ? getDayTotalMilk(todayEasyLog) : { daytimeMilk: 0, breastMilkTotal: 0, formulaMilkTotal: 0, nightMilk: 0, grandTotal: 0 };
  const totalMilkMl = milkStats.grandTotal || 0;
  const estKcal = Math.round((totalMilkMl / 100) * 67);
  const percentRdaKcal = Math.min(100, Math.round((estKcal / 500) * 100));
  const estCalciumMg = Math.round((totalMilkMl / 100) * 55);
  const estDhaMg = Math.round((totalMilkMl / 100) * 15);

  const babyName = babyProfile?.nickname || babyProfile?.name || 'Bé';
  const babyAgeText = babyProfile ? getBabyAgeText(babyProfile.birthDate) : '';

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-4">
        
        {/* Welcome Header with Baby Avatar & Profile Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-3.5">
            <Link to="/settings" title="Cập nhật ảnh & hồ sơ bé">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-rose-400 bg-rose-100 flex items-center justify-center text-rose-500 shadow-2xs hover:scale-105 transition-transform">
                {babyProfile?.avatarUrl ? (
                  <img src={babyProfile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Baby className="w-6 h-6" />
                )}
              </div>
            </Link>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                  {babyName} ({user?.displayName || 'Ba Mẹ'})
                </h1>
                {babyAgeText && (
                  <span className="text-[11px] font-extrabold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200">
                    🎂 {babyAgeText}
                  </span>
                )}
              </div>

              {/* Medical Allergies Warning Badge if present */}
              {babyProfile?.allergies ? (
                <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-0.5 w-fit">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Dị ứng: {babyProfile.allergies}</span>
                </div>
              ) : (
                <p className="text-xs text-gray-600">
                  Tổng quan dinh dưỡng & đà phát triển thể chất của {babyName} hôm nay.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to="/easy"
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Xem Lịch EASY</span>
            </Link>
            <Link
              to="/diary/new"
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1 transition-colors shadow-2xs"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>Viết nhật ký</span>
            </Link>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PINNED AI ADVICE DASHBOARD CARD (PHÂN TÍCH DỮ LIỆU HÔM QUA) */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden space-y-3">
          
          {/* Header Pin Banner */}
          <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-yellow-400 text-indigo-950 font-black flex items-center justify-center">
                <Pin className="w-4 h-4 text-indigo-950 fill-indigo-950" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold bg-yellow-300 text-indigo-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    📌 Lời khuyên ghim hôm nay cho {babyName}
                  </span>
                  <span className="text-[11px] text-purple-100 font-medium hidden sm:inline">
                    (Phân tích tự động dữ liệu ngày {analyzedDateStr})
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => analyzeYesterdayAndPinAdvice(true)}
              disabled={loadingAi}
              title="Phân tích lại dữ liệu"
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Phân tích lại</span>
            </button>
          </div>

          {/* Advice Body */}
          {loadingAi ? (
            <div className="animate-pulse space-y-2 py-2">
              <div className="h-2.5 bg-white/30 rounded w-3/4"></div>
              <div className="h-2.5 bg-white/30 rounded w-5/6"></div>
              <div className="h-2.5 bg-white/30 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed text-purple-50 space-y-2">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <div className="italic">
                  "{pinnedAiAdvice || `Hôm qua ${babyName} sinh hoạt rất ngoan! Hãy tiếp tục duy trì cữ ăn và giấc ngủ khoa học cho bé hôm nay nhé.`}"
                </div>
              </div>
              <div className="text-[10px] text-purple-200 text-right font-medium">
                — Trợ lý Bác sĩ Nhi khoa AI Nuôi Con
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* DASHBOARD WIDGET: DINH DƯỠNG NẠP TRONG NGÀY (NUTRITION) */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-sm space-y-4 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/20 pb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-yellow-100">
                <Milk className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider block">Bảng Dinh Dưỡng Nạp Hôm Nay của {babyName}</span>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Tổng Lượng Sữa & Vi Chất Nạp Vào
                </h2>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-extrabold text-white border border-white/20">
                Tổng: <span className="text-yellow-200 text-sm">{totalMilkMl} ml</span>
              </div>
              <Link
                to="/easy/formula"
                className="px-3 py-1.5 bg-white text-amber-900 font-extrabold rounded-xl text-xs hover:bg-amber-50 transition-colors shadow-xs flex items-center space-x-1"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Máy tính dinh dưỡng</span>
              </Link>
            </div>
          </div>

          {/* Quick Nutrient Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
            
            {/* Energy Kcal */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-amber-100 text-[10px] font-bold">
                <span>Năng Lượng</span>
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
              </div>
              <div className="text-base sm:text-lg font-black text-white">{estKcal} kcal</div>
              <div className="w-full bg-white/30 rounded-full h-1.5 overflow-hidden">
                <div className="bg-yellow-300 h-1.5 rounded-full" style={{ width: `${percentRdaKcal}%` }}></div>
              </div>
              <span className="text-[10px] text-amber-100 font-medium block">{percentRdaKcal}% Khuyến nghị (RDA)</span>
            </div>

            {/* Breast Milk Total */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-rose-100 text-[10px] font-bold">
                <span>Sữa Mẹ Bú</span>
                <Heart className="w-3.5 h-3.5 text-pink-200" />
              </div>
              <div className="text-base sm:text-lg font-black text-white">{milkStats.breastMilkTotal} ml</div>
              <span className="text-[10px] text-amber-100 block">Ước tính ti mẹ + ti bình</span>
            </div>

            {/* Formula Milk Total */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-amber-100 text-[10px] font-bold">
                <span>Sữa Công Thức</span>
                <Milk className="w-3.5 h-3.5 text-yellow-200" />
              </div>
              <div className="text-base sm:text-lg font-black text-white">{milkStats.formulaMilkTotal} ml</div>
              <span className="text-[10px] text-amber-100 block">Dạng bình công thức</span>
            </div>

            {/* Key Micronutrients */}
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-3 space-y-1">
              <div className="flex items-center justify-between text-amber-100 text-[10px] font-bold">
                <span>Vi Chất Thiết Yếu</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <div className="text-xs font-bold text-white space-y-0.5">
                <div>Canxi: <strong className="text-yellow-200">{estCalciumMg} mg</strong></div>
                <div>DHA: <strong className="text-purple-200">{estDhaMg} mg</strong></div>
              </div>
            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN DASHBOARD CONTENT GRID */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* DASHBOARD WIDGET: CHỈ SỐ PHÁT TRIỂN CỦA BÉ (GROWTH MILESTONES) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                      Chỉ Số Phát Triển Thể Chất (Chuẩn WHO)
                    </h3>
                    <p className="text-xs text-gray-500">So sánh với bách phân vị chuẩn của WHO</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowGrowthModal(true)}
                  className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg flex items-center shadow-xs transition-colors cursor-pointer"
                >
                  <Pin className="w-3.5 h-3.5 mr-1" />
                  Nhập số đo
                </button>
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                {/* Weight Card */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between text-rose-800 text-[11px] font-bold">
                    <span>Cân Nặng Mới Nhất</span>
                    <Scale className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-lg font-black text-rose-950">
                    {latestGrowth?.weightKg ? `${latestGrowth.weightKg} kg` : '---'}
                  </div>
                  <span className={`text-[10px] font-semibold block ${weightEval?.color || 'text-rose-700'}`}>
                    {weightEval ? `✓ ${weightEval.status} (${weightEval.percentileStr})` : 'Chưa có dữ liệu'}
                  </span>
                </div>

                {/* Height Card */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between text-blue-800 text-[11px] font-bold">
                    <span>Chiều Cao Mới Nhất</span>
                    <Ruler className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-lg font-black text-blue-950">
                    {latestGrowth?.heightCm ? `${latestGrowth.heightCm} cm` : '---'}
                  </div>
                  <span className={`text-[10px] font-semibold block ${heightEval?.color || 'text-blue-700'}`}>
                    {heightEval ? `✓ ${heightEval.status} (${heightEval.percentileStr})` : 'Chưa có dữ liệu'}
                  </span>
                </div>

                {/* Diapers Today */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-emerald-800 text-[11px] font-bold">
                    <span>Số Cữ Tã Hôm Nay</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-lg font-black text-emerald-950">
                    {latestEntry ? `${latestEntry.wetDiapers || 0} ướt / ${latestEntry.dirtyDiapers || 0} dơ` : '0 ướt / 0 dơ'}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    ✓ Tiêu hóa ổn định
                  </span>
                </div>

              </div>

              {/* Growth Chart */}
              {chartData.length > 0 && (
                <div className="pt-2 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-extrabold text-gray-800 mb-2 flex items-center">
                      <Activity className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
                      Cân nặng theo tuổi (kg)
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']} />
                          <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} labelFormatter={(l) => `Tháng thứ ${l}`} />
                          
                          {/* WHO Percentiles */}
                          <Line type="monotone" dataKey="w_p97" name="Vượt chuẩn (97th)" stroke="#d1d5db" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                          <Line type="monotone" dataKey="w_p50" name="Chuẩn (50th)" stroke="#10b981" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="w_p3" name="Dưới chuẩn (3rd)" stroke="#d1d5db" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                          
                          {/* Actual Baby Data */}
                          <Line type="monotone" dataKey="babyW" name={babyName} stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e' }} activeDot={{ r: 6 }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-gray-800 mb-2 flex items-center">
                      <Ruler className="w-3.5 h-3.5 text-blue-500 mr-1.5" />
                      Chiều cao theo tuổi (cm)
                    </h4>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} domain={['dataMin - 2', 'dataMax + 2']} />
                          <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} labelFormatter={(l) => `Tháng thứ ${l}`} />
                          
                          {/* WHO Percentiles */}
                          <Line type="monotone" dataKey="h_p97" name="Vượt chuẩn (97th)" stroke="#d1d5db" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                          <Line type="monotone" dataKey="h_p50" name="Chuẩn (50th)" stroke="#10b981" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="h_p3" name="Dưới chuẩn (3rd)" stroke="#d1d5db" strokeWidth={1} dot={false} strokeDasharray="4 4" />
                          
                          {/* Actual Baby Data */}
                          <Line type="monotone" dataKey="babyH" name={babyName} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Diary Entry */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">Kỷ niệm gần nhất</h3>
                <Link to="/diary" className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center">
                  Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              {latestEntry ? (
                <Link to={`/diary/${latestEntry.id}`} className="block bg-white rounded-2xl border border-gray-200 p-3.5 hover:border-rose-300 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row gap-3.5">
                    {latestEntry.images && latestEntry.images.length > 0 ? (
                      <div className="w-full sm:w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img src={latestEntry.images[0]} className="w-full h-full object-cover" alt="Cover" />
                      </div>
                    ) : (
                      <div className="w-full sm:w-20 h-20 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-200">
                        <Book className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-center">
                      <p className="text-[10px] font-semibold text-rose-500 mb-0.5 rounded-full bg-rose-50 w-fit px-1.5 py-0.5">
                        {(() => {
                          try {
                            return format(new Date(latestEntry.dateStr), 'dd/MM/yyyy', { locale: vi });
                          } catch (e) {
                            return 'Ngày không hợp lệ';
                          }
                        })()}
                      </p>
                      <h4 className="text-sm font-bold text-gray-900 mb-0.5 line-clamp-1">{latestEntry.title}</h4>
                      <p className="text-gray-500 text-xs line-clamp-2">{latestEntry.content}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-5 text-center">
                  <Book className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Chưa có trang nhật ký nào.</p>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDEBAR QUICK NAVIGATION */}
          <div className="space-y-3">
            
            {/* EASY Schedule Card */}
            <Link to="/easy" className="group block bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200 p-3.5 shadow-xs hover:border-rose-400 hover:shadow-md transition-all relative overflow-hidden">
              <div className="flex items-center space-x-3">
                <div className="bg-rose-500 text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-rose-600 transition-colors">Lịch sinh hoạt E.A.S.Y</h3>
                    <span className="bg-rose-200 text-rose-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">Mới</span>
                  </div>
                  <p className="text-gray-600 text-[11px] truncate">Quản lý cữ ăn, giấc ngủ nap & đồng bộ nhật ký...</p>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>

            {/* Formula & Nutrition Lookup Card */}
            <Link to="/easy/formula" className="group block bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-3.5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all relative overflow-hidden">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-500 text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                  <Milk className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Tra cứu sữa & dinh dưỡng</h3>
                  <p className="text-gray-600 text-[11px] truncate">Bảng 30+ vi chất dinh dưỡng của 25+ dòng sữa...</p>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>

            {/* AI Assistant Card */}
            <Link to="/assistant" className="group block bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:border-violet-300 hover:shadow-md transition-all relative overflow-hidden">
              <div className="flex items-center space-x-3">
                <div className="bg-violet-50 text-violet-600 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-violet-600 transition-colors">Trợ lý AI thông minh</h3>
                  <p className="text-gray-500 text-[11px] truncate">Hỏi đáp trực tiếp sức khỏe, giấc ngủ của bé...</p>
                </div>
                <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>

            {/* Knowledge Base Card */}
            <Link to="/knowledge" className="group block bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs hover:border-orange-300 hover:shadow-md transition-all text-left">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-50 text-orange-600 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Kiến thức nuôi con</h3>
                  <p className="text-gray-500 text-[11px] truncate">Các giai đoạn phát triển, sơ cấp cứu, sức khỏe...</p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>

            {/* Total Entries Counter */}
            <div className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-xs flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 font-medium">Tổng trang nhật ký đã viết</p>
                  <p className="text-base font-bold text-gray-900">{entries.length} trang</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
      
      {/* Growth Input Modal */}
      {showGrowthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Cập nhật chỉ số phát triển</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ngày đo</label>
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={newGrowth.dateStr}
                  onChange={e => setNewGrowth({...newGrowth, dateStr: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 5.5"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500"
                    value={newGrowth.weightKg}
                    onChange={e => setNewGrowth({...newGrowth, weightKg: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Chiều cao (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 60"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    value={newGrowth.heightCm}
                    onChange={e => setNewGrowth({...newGrowth, heightCm: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Ghi chú (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="Tiêm phòng, bé ngoan..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  value={newGrowth.notes}
                  onChange={e => setNewGrowth({...newGrowth, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowGrowthModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveGrowth}
                className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
              >
                Lưu chỉ số
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
