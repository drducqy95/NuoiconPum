import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Book, Bot, ArrowRight, Activity, CalendarDays, BookPlus, TrendingUp, Sparkles, HeartPulse, Stethoscope, Pill } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { localDiaryApi, LocalDiaryEntry } from '../data/localDiaryApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LocalDiaryEntry[]>([]);
  const [aiNotes, setAiNotes] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const data = await localDiaryApi.getAllEntries();
        setEntries(data);
      } catch(e) {
        console.error('Failed to get entries', e);
      }
    };
    fetchEntries();
  }, []);

  useEffect(() => {
    const fetchAiNotes = async () => {
      if (entries.length === 0) return;
      
      // Only run when we have entries and haven't fetched yet
      const recentEntries = entries.slice(0, 10);
      const hasData = recentEntries.some(e => e.height || e.weight || e.abnormalNotes || e.dirtyDiapers || e.wetDiapers);
      if (!hasData) {
         setAiNotes('Believing in your baby’s steady growth! Hãy ghi chép thêm các chỉ số chiều cao, cân nặng và thông tin sinh hoạt để AI có thể phân tích nhé.');
         return;
      }

      setLoadingAi(true);
      try {
        const dataStr = recentEntries.map(e => `Ngày: ${e.dateStr}, Cao: ${e.height || ''}, Nặng: ${e.weight || ''}, Đi ngoài: ${e.dirtyDiapers || ''}, Đi tè: ${e.wetDiapers || ''}, Bất thường: ${e.abnormalNotes || ''}`).join('\n');
        
        const res = await fetch('/api/generate-notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ dataStr })
        });
        
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        
        const responseData = await res.json();
        setAiNotes(responseData.notes || 'Không có nhận xét nào lúc này.');
      } catch (error) {
        console.error("Failed to generate AI notes", error);
        setAiNotes('Xin lỗi, hiện tại trợ lý AI không thể phân tích dữ liệu.');
      } finally {
        setLoadingAi(false);
      }
    };
    fetchAiNotes();
  }, [entries]);

  const latestEntry = entries.length > 0 ? entries[0] : null;
  const reversedEntries = [...entries].reverse(); // oldest first
  const chartData = reversedEntries.filter(e => e.height || e.weight).map(e => {
    let dateFormatted = '';
    try {
      dateFormatted = format(new Date(e.dateStr), 'dd/MM');
    } catch(err) {
      dateFormatted = 'N/A';
    }
    return {
      date: dateFormatted,
      height: e.height || null,
      weight: e.weight || null
    }
  });

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="mb-3">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 mb-0.5">
            {user ? `Chào ${user.displayName || 'ba mẹ'}!` : 'Chào mừng ba mẹ!'}
          </h1>
          <p className="text-xs text-gray-600">
            Cùng Nuôi Con theo dõi hành trình phát triển của bé yêu mỗi ngày.
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2 space-y-4">
           <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-4 text-white shadow-sm relative overflow-hidden">
             <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                   <h2 className="text-base sm:text-lg font-bold mb-0.5">Nhật ký hôm nay</h2>
                   <p className="text-rose-100 text-xs max-w-md">Lưu giữ lại khoảnh khắc đáng yêu của bé ngày hôm nay để không bỏ lỡ bất kỳ kỷ niệm nào.</p>
                </div>
                <Link to="/diary/new" className="inline-flex items-center justify-center bg-white text-rose-600 font-semibold px-3 py-1.5 text-xs rounded-lg shadow-sm hover:bg-rose-50 transition-colors flex-shrink-0 self-start sm:self-center">
                  <BookPlus className="w-3.5 h-3.5 mr-1" /> Viết nhật ký ngay
                </Link>
             </div>
             <CalendarDays className="absolute -right-6 -bottom-6 w-24 h-24 text-white opacity-10 pointer-events-none" />
           </div>

           {/* AI Notes Section */}
           <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-xl border border-violet-100 p-3.5 shadow-sm">
              <h3 className="text-xs sm:text-sm font-bold text-violet-900 mb-1.5 flex items-center">
                 <Sparkles className="w-3.5 h-3.5 mr-1 text-violet-500" /> AI Phân tích & Lưu ý
              </h3>
              {loadingAi ? (
                 <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-2 py-1">
                       <div className="h-2 bg-violet-200 rounded w-3/4"></div>
                       <div className="h-2 bg-violet-200 rounded w-5/6"></div>
                       <div className="h-2 bg-violet-200 rounded w-1/2"></div>
                    </div>
                 </div>
              ) : (
                 <p className="text-violet-800 text-xs leading-relaxed">{aiNotes || 'Hãy tạo thêm nhật ký để AI có thể phân tích thông tin của bé.'}</p>
              )}
           </div>

           {/* Growth Chart Section */}
           {chartData.length > 0 && (
             <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm">
               <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1 text-rose-500" /> Biểu đồ phát triển (Cân nặng & Chiều cao)
               </h3>
               <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        <Line yAxisId="left" type="monotone" dataKey="height" name="Chiều cao (cm)" stroke="#f43f5e" strokeWidth={1.5} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                        <Line yAxisId="right" type="monotone" dataKey="weight" name="Cân nặng (kg)" stroke="#8b5cf6" strokeWidth={1.5} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
             </div>
           )}

           <div>
              <div className="flex items-center justify-between mb-2">
                 <h3 className="text-xs sm:text-sm font-bold text-gray-900">Kỷ niệm gần nhất</h3>
                 <Link to="/diary" className="text-xs font-medium text-rose-600 hover:text-rose-700 flex items-center">
                    Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1" />
                 </Link>
              </div>
              
              {latestEntry ? (
                 <Link to={`/diary/${latestEntry.id}`} className="block bg-white rounded-xl border border-gray-200 p-3 hover:border-rose-300 hover:shadow-md transition-all">
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
                               } catch(e) {
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
                 <div className="bg-white rounded-xl border border-dashed border-gray-300 p-5 text-center">
                    <Book className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">Chưa có trang nhật ký nào.</p>
                 </div>
              )}
           </div>
        </div>

        <div className="space-y-3">
            <Link to="/easy" className="group block bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200 p-3 shadow-sm hover:border-rose-400 hover:shadow-md transition-all relative overflow-hidden">
              <div className="flex items-center space-x-3">
                <div className="bg-rose-500 text-white w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
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

            <Link to="/assistant" className="group block bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:border-violet-300 hover:shadow-md transition-all relative overflow-hidden">
              <div className="flex items-center space-x-3">
                <div className="bg-violet-50 text-violet-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                   <Bot className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-violet-600 transition-colors">Trợ lý AI thông minh</h3>
                  <p className="text-gray-500 text-[11px] truncate">Hỏi đáp trực tiếp sức khỏe, giấc ngủ của bé...</p>
                </div>
                <ArrowRight className="w-4 h-4 text-violet-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>

                       <Link to="/knowledge" className="group block bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:border-orange-300 hover:shadow-md transition-all text-left">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-50 text-orange-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                   <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">Kiến thức nuôi con</h3>
                  <p className="text-gray-500 text-[11px] truncate">Các giai đoạn phát triển, sơ cấp cứu, sức khỏe...</p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </div>
            </Link>
           
                       <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 flex-shrink-0">
                     <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-[11px] text-gray-500 font-medium">Tổng trang nhật ký</p>
                     <p className="text-base font-bold text-gray-900">{entries.length}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
  );
};

