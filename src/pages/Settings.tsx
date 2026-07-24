import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { localDiaryApi } from '../data/localDiaryApi';
import { db, handleFirestoreError } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp, collection } from 'firebase/firestore';
import { CloudUpload, Settings as SettingsIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ type: 'success'|'error', text: string } | null>(null);

  const handleSync = async () => {
    if (!user) {
      setSyncResult({ type: 'error', text: 'Vui lòng đăng nhập để đồng bộ dữ liệu.' });
      return;
    }
    
    setSyncing(true);
    setSyncResult(null);
    try {
      // Get local entries that are not synced
      const allEntries = await localDiaryApi.getAllEntries();
      const unsyncedEntries = allEntries.filter(e => !e.synced);
      
      if (unsyncedEntries.length === 0) {
         setSyncResult({ type: 'success', text: 'Tất cả dữ liệu đã được đồng bộ.' });
         setSyncing(false);
         return;
      }

      let successCount = 0;
      for (const entry of unsyncedEntries) {
         const entryData = {
            userId: user.uid,
            title: entry.title.trim() || 'Không tiêu đề',
            content: entry.content.trim() || '',
            date: Timestamp.fromDate(new Date(entry.dateStr)),
            dateStr: entry.dateStr,
            images: entry.images || [],
            height: entry.height || null,
            weight: entry.weight || null,
            breastMilkVolume: entry.breastMilkVolume || null,
            formulaVolume: entry.formulaVolume || null,
            formulaType: entry.formulaType || null,
            dirtyDiapers: entry.dirtyDiapers || null,
            wetDiapers: entry.wetDiapers || null,
            abnormalNotes: entry.abnormalNotes || null,
            updatedAt: serverTimestamp(),
         };
         
         // We can use the local ID as the firestore Document ID or generate a new one. Let's use the local ID to avoid duplicates.
         const docRef = doc(db, `users/${user.uid}/diaryEntries`, entry.id);
         const docSnap = await getDoc(docRef);
         
         if (docSnap.exists()) {
             await setDoc(docRef, entryData, { merge: true });
         } else {
             await setDoc(docRef, {
                 ...entryData,
                 createdAt: serverTimestamp()
             });
         }
         
         // Mark local as synced
         await localDiaryApi.markAsSynced(entry.id);
         successCount++;
      }
      
      setSyncResult({ type: 'success', text: `Đã đồng bộ thành công ${successCount} mục lên Cloud.` });

    } catch (error) {
       console.error("Lỗi đồng bộ:", error);
       setSyncResult({ type: 'error', text: 'Đồng bộ thất bại, vui lòng thử lại sau.' });
    } finally {
       setSyncing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
         <div className="mb-4 flex items-center justify-between">
           <div>
             <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
               <SettingsIcon className="w-6 h-6 text-gray-700 mr-2" />
               Cài đặt & Đồng bộ
             </h1>
             <p className="text-xs text-gray-500">Quản lý dữ liệu và thiết lập ứng dụng</p>
           </div>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Đồng bộ đám mây (Firebase)</h2>
            <p className="text-gray-600 mb-6 max-w-2xl text-sm leading-relaxed">
             Mọi dữ liệu của bạn được lưu trữ an toàn trên thiết bị này và không cần mạng internet.
             Bạn có thể chọn đồng bộ thủ công lên cloud để sao lưu hoặc xem trên thiết bị khác.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-start text-sm text-gray-600 flex-1">
                <CloudUpload className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Trạng thái đồng bộ</p>
                  <p>Bạn đã đồng bộ tất cả dữ liệu cục bộ mới nhất lên Firebase chưa?</p>
                </div>
             </div>
             
             <button
                onClick={handleSync}
                disabled={syncing || !user}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 transition-colors"
             >
                {syncing ? (
                   <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                ) : (
                   <CloudUpload className="-ml-1 mr-2 h-4 w-4" />
                )}
                {syncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}
             </button>
          </div>

          {!user && (
            <div className="flex items-center p-4 rounded-md text-orange-800 bg-orange-50 border border-orange-200 mb-6 font-medium text-sm">
                <AlertCircle className="w-5 h-5 mr-2" />
                Bạn cần đăng nhập bằng tài khoản Google (ở menu góc trên) để sử dụng tính năng đồng bộ.
            </div>
          )}

          {syncResult && (
             <div className={`flex items-center p-4 rounded-md text-sm font-medium ${
                 syncResult.type === 'success' ? 'text-green-800 bg-green-50 border border-green-200' : 'text-red-800 bg-red-50 border border-red-200'
             }`}>
                {syncResult.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                {syncResult.text}
             </div>
          )}
       </div>
     </div>
    </div>
  );
};
