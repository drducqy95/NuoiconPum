import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Book,
  Bot,
  ArrowRight,
  Activity,
  BookPlus,
  Milk,
  Baby,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { localDiaryApi, LocalDiaryEntry } from '../data/localDiaryApi';
import { easyStorage, EasyDayLog } from '../data/easyStorage';
import { babyProfileStorage, BabyProfile, getBabyAgeText } from '../data/babyProfileStorage';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { AiAdviceWidget } from '../components/dashboard/AiAdviceWidget';
import { NutritionWidget } from '../components/dashboard/NutritionWidget';
import { GrowthWidget } from '../components/dashboard/GrowthWidget';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LocalDiaryEntry[]>([]);
  const [todayEasyLog, setTodayEasyLog] = useState<EasyDayLog | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);

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

  const latestEntry = entries.length > 0 ? entries[0] : null;
  const babyName = babyProfile?.nickname || babyProfile?.name || 'Bé';
  const babyAgeText = babyProfile ? getBabyAgeText(babyProfile.birthDate) : '';

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-4">
        
        {/* Welcome Header */}
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

        {/* AI Advice Widget */}
        <AiAdviceWidget babyProfile={babyProfile} entries={entries} />

        {/* Nutrition Widget */}
        <NutritionWidget babyProfile={babyProfile} todayEasyLog={todayEasyLog} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            
            {/* Growth Widget */}
            <GrowthWidget babyProfile={babyProfile} latestEntry={latestEntry} />

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
