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
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { apiFetch } from '../apiClient';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LocalDiaryEntry[]>([]);
  const [todayEasyLog, setTodayEasyLog] = useState<EasyDayLog | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);

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
  }, []);

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
  const reversedEntries = [...entries].reverse(); // oldest first
  const chartData = reversedEntries.filter(e => e.height || e.weight).map(e => {
    let dateFormatted = '';
    try {
      dateFormatted = format(new Date(e.dateStr), 'dd/MM');
    } catch (err) {
      dateFormatted = 'N/A';
    }
    return {
      date: dateFormatted,
      height: e.height || null,
      weight: e.weight || null
    };
  });

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
                    <p className="text-xs text-gray-500">Cập nhật chiều cao, cân nặng từ nhật ký mới nhất</p>
                  </div>
                </div>

                <Link
                  to="/diary/new"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  Cập nhật chỉ số <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                
                {/* Weight Card */}
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between text-rose-800 text-[11px] font-bold">
                    <span>Cân Nặng Hiện Tại</span>
                    <Scale className="w-4 h-4 text-rose-500" />
                  </div>
                  <div className="text-lg font-black text-rose-950">
                    {latestEntry?.weight ? `${latestEntry.weight} kg` : 'Chưa có dữ liệu'}
                  </div>
                  <span className="text-[10px] text-rose-700 font-semibold block">
                    {latestEntry?.weight ? '✓ Phát triển cân đối' : 'Nhập nhật ký để ghi chép'}
                  </span>
                </div>

                {/* Height Card */}
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between text-blue-800 text-[11px] font-bold">
                    <span>Chiều Cao Hiện Tại</span>
                    <Ruler className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-lg font-black text-blue-950">
                    {latestEntry?.height ? `${latestEntry.height} cm` : 'Chưa có dữ liệu'}
                  </div>
                  <span className="text-[10px] text-blue-700 font-semibold block">
                    {latestEntry?.height ? '✓ Theo dõi đà tăng trưởng' : 'Nhập nhật ký để ghi chép'}
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
                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-extrabold text-gray-800 mb-2 flex items-center">
                    <Activity className="w-3.5 h-3.5 text-rose-500 mr-1.5" />
                    Biểu đồ tăng trưởng theo thời gian
                  </h4>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        <Line yAxisId="left" type="monotone" dataKey="height" name="Chiều cao (cm)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                        <Line yAxisId="right" type="monotone" dataKey="weight" name="Cân nặng (kg)" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
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
    </div>
  );
};

export default Dashboard;
