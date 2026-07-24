import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { localDiaryApi, LocalDiaryEntry } from '../data/localDiaryApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Plus, Image as ImageIcon, Calendar } from 'lucide-react';

export const DiaryList: React.FC = () => {
  const [entries, setEntries] = useState<LocalDiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const localData = await localDiaryApi.getAllEntries();
        setEntries(localData);
      } catch (error) {
        console.error("Failed to load local entries", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nhật ký chăm bé</h1>
            <p className="text-xs text-gray-500">Lưu giữ lại mỗi ngày bé khôn lớn</p>
          </div>
          <Link
            to="/diary/new"
            className="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition-colors"
          >
            <Plus className="-ml-1 mr-1.5 h-4 w-4 hidden sm:inline-block" aria-hidden="true" />
            <span className="hidden sm:inline">Viết nhật ký</span>
            <Plus className="h-4 w-4 sm:hidden" />
          </Link>
        </div>

      {loading ? (
        <div className="flex justify-center p-12">
           <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
           <h3 className="mt-2 text-sm font-semibold text-gray-900">Chưa có nhật ký nào</h3>
           <p className="mt-1 text-sm text-gray-500">Bắt đầu lưu lại những kỷ niệm đáng yêu của bé.</p>
           <div className="mt-6">
             <Link
               to="/diary/new"
               className="inline-flex items-center rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
             >
               <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
               Viết trang đầu tiên
             </Link>
           </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              to={`/diary/${entry.id}`}
              className="group flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-rose-300 transition-all overflow-hidden"
            >
              {entry.images && entry.images.length > 0 ? (
                <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  <img 
                    src={entry.images[0]} 
                    alt="Diary cover" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] w-full bg-rose-50 text-rose-200 flex items-center justify-center">
                   <ImageIcon className="w-12 h-12" />
                </div>
              )}
              
              <div className="flex flex-col flex-1 p-4">
                 <div className="flex items-center text-xs text-gray-500 mb-2">
                   <Calendar className="w-3.5 h-3.5 mr-1" />
                   {entry.dateStr ? (() => {
                     try {
                       return format(new Date(entry.dateStr), 'EEEE, dd MMMM, yyyy', { locale: vi });
                     } catch(err) {
                       return 'Ngày không hợp lệ';
                     }
                   })() : 'No date'}
                 </div>
                 <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-rose-600 transition-colors">
                   {entry.title || 'Không có tiêu đề'}
                 </h3>
                 <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                   {entry.content}
                 </p>
                 {!entry.synced && (
                    <span className="text-[10px] font-medium text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full mt-3 w-fit border border-orange-100">Chưa đồng bộ</span>
                 )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};
