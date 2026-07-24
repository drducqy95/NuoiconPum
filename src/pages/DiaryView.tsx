import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { localDiaryApi, LocalDiaryEntry } from '../data/localDiaryApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ArrowLeft, Edit2, Trash2, Printer, Ruler, Scale, Baby, Droplets, Activity, AlertCircle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

export const DiaryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<LocalDiaryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  
  const printRef = useRef(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: entry?.title ? `Nhat_ky_${entry.title}` : 'Nhat_ky',
  });

  useEffect(() => {
    if (!id) return;

    const fetchDoc = async () => {
      try {
        const data = await localDiaryApi.getEntry(id);
        if (data) {
          setEntry(data);
        } else {
          navigate('/diary');
        }
      } catch (error) {
        console.error("Failed to load entry", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoc();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Bạn có chắc muốn xóa bài nhật ký này?')) return;
    try {
      await localDiaryApi.deleteEntry(id);
      navigate('/diary');
    } catch (error) {
      console.error("Failed to delete entry", error);
    }
  };

  if (loading) return (
     <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
     </div>
  );

  if (!entry) return null;

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
        <Link to="/diary" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Quay lại nhật ký</span>
          <span className="sm:hidden">Quay lại</span>
        </Link>
        <div className="flex space-x-2">
          {!entry.synced && (
             <div className="hidden sm:flex items-center px-2 py-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-100 rounded-full mr-2">
                Chưa đồng bộ
             </div>
          )}
          <button
            onClick={() => handlePrint()}
            className="inline-flex items-center p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="In / Lưu PDF"
          >
            <Printer className="w-5 h-5" />
          </button>
          <Link
            to={`/diary/${entry.id}/edit`}
            className="inline-flex items-center p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
          >
            <Edit2 className="w-5 h-5" />
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden print:border-none print:shadow-none" ref={printRef}>
        {entry.images && entry.images.length > 0 && (
          <div className="w-full">
            <img src={entry.images[0]} alt="Cover" className="w-full h-auto max-h-[500px] object-cover print:max-h-[800px]" />
          </div>
        )}
        <div className="p-4 sm:p-6 md:p-8">
          <div className="text-sm font-medium text-rose-500 mb-3 block">
            {entry.dateStr ? (() => {
              try {
                return format(new Date(entry.dateStr), 'EEEE, dd MMMM, yyyy', { locale: vi });
              } catch(e) {
                return 'Ngày không hợp lệ';
              }
            })() : ''}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 font-serif">
            {entry.title}
          </h1>
          <div className="prose prose-rose sm:prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {entry.content}
          </div>

          {(entry.height || entry.weight || entry.breastMilkVolume || entry.formulaVolume || entry.dirtyDiapers || entry.wetDiapers || entry.abnormalNotes) && (
            <div className="mt-6 pt-5 border-t border-gray-100">
               <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-center">
                 <Activity className="w-5 h-5 mr-2 text-rose-500" /> Bản tin sức khỏe
               </h3>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {(entry.height || entry.weight) && (
                     <div className="bg-rose-50/50 rounded-xl p-3 border border-rose-100">
                        <div className="flex items-center text-rose-800 mb-2 font-medium text-sm">
                           <Scale className="w-4 h-4 mr-1.5 opacity-70" /> Thể chất
                        </div>
                        {entry.height && <div className="text-gray-700 text-sm"><span className="text-gray-500">Cao:</span> <span className="font-semibold text-gray-900">{entry.height} cm</span></div>}
                        {entry.weight && <div className="text-gray-700 text-sm mt-1"><span className="text-gray-500">Nặng:</span> <span className="font-semibold text-gray-900">{entry.weight} kg</span></div>}
                     </div>
                  )}

                  {(entry.breastMilkVolume || entry.formulaVolume || entry.formulaType) && (
                     <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100">
                        <div className="flex items-center text-orange-800 mb-2 font-medium text-sm">
                           <Baby className="w-4 h-4 mr-1.5 opacity-70" /> Ăn uống
                        </div>
                        {entry.breastMilkVolume && <div className="text-gray-700 text-sm"><span className="text-gray-500">Sữa mẹ:</span> <span className="font-semibold text-gray-900">{entry.breastMilkVolume} ml</span></div>}
                        {entry.formulaVolume && <div className="text-gray-700 text-sm mt-1"><span className="text-gray-500">Sữa CT:</span> <span className="font-semibold text-gray-900">{entry.formulaVolume} ml</span> {entry.formulaType && <span className="text-xs text-gray-500">({entry.formulaType})</span>}</div>}
                     </div>
                  )}

                  {(entry.dirtyDiapers || entry.wetDiapers) && (
                     <div className="bg-blue-50/50 rounded-xl p-3 border border-blue-100">
                        <div className="flex items-center text-blue-800 mb-2 font-medium text-sm">
                           <Droplets className="w-4 h-4 mr-1.5 opacity-70" /> Bài tiết (Tã)
                        </div>
                        {entry.dirtyDiapers && <div className="text-gray-700 text-sm"><span className="text-gray-500">Đi ngoài (dơ):</span> <span className="font-semibold text-gray-900">{entry.dirtyDiapers}</span></div>}
                        {entry.wetDiapers && <div className="text-gray-700 text-sm mt-1"><span className="text-gray-500">Đi tè (ướt):</span> <span className="font-semibold text-gray-900">{entry.wetDiapers}</span></div>}
                     </div>
                  )}
               </div>

               {entry.abnormalNotes && (
                  <div className="bg-red-50/50 rounded-xl p-3 border border-red-100">
                     <div className="flex items-center text-red-800 mb-2 font-medium text-sm">
                        <AlertCircle className="w-4 h-4 mr-1.5 opacity-70" /> Ghi chú bất thường
                     </div>
                     <p className="text-gray-700 text-sm leading-relaxed">{entry.abnormalNotes}</p>
                  </div>
               )}
            </div>
          )}
          
          {entry.images && entry.images.length > 1 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
               {entry.images.slice(1).map((imgTag: string, idx: number) => (
                 <img key={idx} src={imgTag} alt={`Phụ đính ${idx+1}`} className="w-full h-auto rounded-lg object-cover aspect-video" />
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};
