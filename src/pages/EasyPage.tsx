import React, { Suspense, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Clock, Milk, BookOpen } from 'lucide-react';
import { EasyDayLog, generateDefaultDayLog, easyStorage } from '../data/easyStorage';

// Lazy loaded tab components for bundle optimization & code splitting
const EasyScheduleTab = React.lazy(() => import('./easy/EasyScheduleTab'));
const FormulaLookupTab = React.lazy(() => import('./easy/FormulaLookupTab'));
const KnowledgeTab = React.lazy(() => import('./easy/KnowledgeTab'));

export const EasyPage: React.FC = () => {
  const { subpage } = useParams<{ subpage?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const activeTab = subpage === 'knowledge' ? 'knowledge' : (subpage === 'formula' ? 'formula' : 'schedule');

  const [dayLog, setDayLog] = useState<EasyDayLog | null>(null);

  useEffect(() => {
    let isMounted = true;
    const today = new Date().toISOString().split('T')[0];
    easyStorage.getDayLog(today).then((log) => {
      if (isMounted) {
        setDayLog(log || generateDefaultDayLog('easy3', '07:00', today));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto w-full bg-slate-50/50 pb-16">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            
            {/* Title */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                E
              </div>
              <div>
                <h1 className="text-base font-extrabold text-gray-900 leading-none">
                  Trợ Lý Nuôi Con E.A.S.Y
                </h1>
                <span className="text-[10px] text-gray-500 font-medium">Lịch trình & Dinh dưỡng khoa học</span>
              </div>
            </div>

            {/* Subpage Nav Tabs */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <Link
                to="/easy"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeTab === 'schedule'
                    ? 'bg-white text-indigo-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Lịch EASY</span>
              </Link>

              <Link
                to="/easy/formula"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeTab === 'formula'
                    ? 'bg-white text-amber-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Milk className="w-3.5 h-3.5 text-amber-600" />
                <span>Tra Cứu Sữa & Dinh Dưỡng</span>
              </Link>

              <Link
                to="/easy/knowledge"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeTab === 'knowledge'
                    ? 'bg-white text-rose-900 shadow-2xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-rose-600" />
                <span>Cẩm Nang EASY</span>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Main Content Area with Lazy Loading Suspense */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <Suspense
          fallback={
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 space-y-3 shadow-2xs">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-gray-500">Đang tải dữ liệu...</p>
            </div>
          }
        >
          {activeTab === 'schedule' && <EasyScheduleTab />}
          {activeTab === 'formula' && <FormulaLookupTab dayLog={dayLog} />}
          {activeTab === 'knowledge' && <KnowledgeTab />}
        </Suspense>
      </div>
    </div>
  );
};

export default EasyPage;
