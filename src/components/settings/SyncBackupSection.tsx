import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import { localDiaryApi } from '../../data/localDiaryApi';
import { db, signInWithGoogle } from '../../firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { CloudUpload, CheckCircle2, AlertCircle, Cloud, Download, HardDrive, FileJson, Upload } from 'lucide-react';
import {
  createFullBackupPackage,
  restoreFullBackupPackage,
  downloadBackupLocally,
  uploadBackupToDrive,
  listBackupsFromDrive,
  downloadBackupFromDrive,
  DriveFileInfo
} from '../../services/backupService';
import { aiSettingsStorage } from '../../data/aiSettingsStorage';
import { babyProfileStorage } from '../../data/babyProfileStorage';

export const SyncBackupSection: React.FC = () => {
  const { user } = useAuth();
  
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [driveActionState, setDriveActionState] = useState<string | null>(null);
  const [driveResult, setDriveResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [driveFilesList, setDriveFilesList] = useState<DriveFileInfo[]>([]);

  const handleSync = async () => {
    if (!user) {
      setSyncResult({ type: 'error', text: 'Vui lòng đăng nhập để đồng bộ dữ liệu.' });
      return;
    }

    setSyncing(true);
    setSyncResult(null);
    try {
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

  const handleBackupToGoogleDrive = async () => {
    setDriveActionState('backup');
    setDriveResult(null);
    try {
      let token = sessionStorage.getItem('gdrive_access_token');
      if (!user || !token) {
        setDriveResult({ type: 'success', text: 'Đang kết nối tài khoản Google cấp quyền Drive...' });
        await signInWithGoogle(true);
        token = sessionStorage.getItem('gdrive_access_token');
      }

      if (!token) {
        throw new Error('Vui lòng chọn tài khoản Google để cấp quyền lưu trữ file lên Google Drive.');
      }

      const backupPackage = await createFullBackupPackage();
      let uploadedFile: DriveFileInfo;

      try {
        uploadedFile = await uploadBackupToDrive(token, backupPackage);
      } catch (uploadErr: any) {
        if (uploadErr?.message?.includes('TOKEN_EXPIRED')) {
          setDriveResult({ type: 'success', text: 'Phiên làm việc hết hạn, đang làm mới quyền Google Drive...' });
          await signInWithGoogle(true);
          token = sessionStorage.getItem('gdrive_access_token');
          if (!token) throw new Error('Cấp quyền Google Drive chưa thành công.');
          uploadedFile = await uploadBackupToDrive(token, backupPackage);
        } else {
          throw uploadErr;
        }
      }

      setDriveResult({
        type: 'success',
        text: `✅ Sao lưu lên Google Drive thành công! File: "${uploadedFile.name}"`
      });
    } catch (err: any) {
      console.error('Drive backup failed', err);
      setDriveResult({
        type: 'error',
        text: `❌ ${err?.message || 'Lỗi sao lưu lên Google Drive. Vui lòng thử lại.'}`
      });
    } finally {
      setDriveActionState(null);
    }
  };

  const handleRestoreFromGoogleDrive = async () => {
    setDriveActionState('restore');
    setDriveResult(null);
    try {
      let token = sessionStorage.getItem('gdrive_access_token');
      if (!user || !token) {
        setDriveResult({ type: 'success', text: 'Đang kết nối tài khoản Google cấp quyền Drive...' });
        await signInWithGoogle(true);
        token = sessionStorage.getItem('gdrive_access_token');
      }

      if (!token) {
        throw new Error('Vui lòng chọn tài khoản Google để cấp quyền lưu trữ file lên Google Drive.');
      }

      let files: DriveFileInfo[] = [];
      try {
        files = await listBackupsFromDrive(token);
      } catch (listErr: any) {
        if (listErr?.message?.includes('TOKEN_EXPIRED')) {
          setDriveResult({ type: 'success', text: 'Phiên làm việc hết hạn, đang làm mới quyền Google Drive...' });
          await signInWithGoogle(true);
          token = sessionStorage.getItem('gdrive_access_token');
          if (!token) throw new Error('Cấp quyền Google Drive chưa thành công.');
          files = await listBackupsFromDrive(token);
        } else {
          throw listErr;
        }
      }

      if (files.length === 0) {
        throw new Error('Chưa tìm thấy bản sao lưu nào trên Google Drive của bạn.');
      }

      setDriveFilesList(files);
      const latestFile = files[0];
      const backupData = await downloadBackupFromDrive(token, latestFile.id);
      await restoreFullBackupPackage(backupData);

      // We trigger a custom event so other components (BabyProfile, AiConfig, Dashboard) can reload data.
      window.dispatchEvent(new Event('appDataRestored'));

      setDriveResult({
        type: 'success',
        text: `🎉 Khôi phục dữ liệu thành công từ file Google Drive "${latestFile.name}" (${new Date(latestFile.createdTime).toLocaleString('vi-VN')})!`
      });
    } catch (err: any) {
      console.error('Drive restore failed', err);
      setDriveResult({
        type: 'error',
        text: `❌ ${err?.message || 'Lỗi khôi phục dữ liệu từ Google Drive.'}`
      });
    } finally {
      setDriveActionState(null);
    }
  };

  const handleDownloadLocalBackup = async () => {
    try {
      const backupPackage = await createFullBackupPackage();
      downloadBackupLocally(backupPackage);
      setDriveResult({
        type: 'success',
        text: '✅ Đã tải file sao lưu (.json) thành công về máy của bạn!'
      });
    } catch (err: any) {
      setDriveResult({
        type: 'error',
        text: 'Lỗi xuất file sao lưu.'
      });
    }
  };

  const handleImportLocalBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const backupData = JSON.parse(jsonStr);
        await restoreFullBackupPackage(backupData);

        window.dispatchEvent(new Event('appDataRestored'));

        setDriveResult({
          type: 'success',
          text: `🎉 Đã nhập và khôi phục toàn bộ dữ liệu thành công từ file "${file.name}"!`
        });
      } catch (err: any) {
        console.error('Import failed', err);
        setDriveResult({
          type: 'error',
          text: `Lỗi khôi phục file: ${err?.message || 'Định dạng JSON không hợp lệ.'}`
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Đồng Bộ Đám Mây (Firebase)</h2>
        <p className="text-gray-600 text-sm leading-relaxed max-w-2xl">
          Mọi dữ liệu nhật ký và lịch EASY của bạn được lưu trữ an toàn ngay trên trình duyệt (Offline local storage).
          Bạn có thể sao lưu thủ công lên Cloud Firebase bất cứ khi nào.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Trạng thái tài khoản: {user ? <span className="text-emerald-600 font-bold">{user.email || user.displayName}</span> : <span className="text-amber-600 font-bold">Chưa đăng nhập</span>}
            </p>
            <p className="text-xs text-gray-500 mt-1">Đồng bộ hai chiều dữ liệu nhật ký của bé lên cơ sở dữ liệu Firebase.</p>
          </div>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-2 flex-shrink-0 cursor-pointer"
          >
            <CloudUpload className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
            <span>{syncing ? 'Đang đồng bộ...' : 'Đồng bộ ngay'}</span>
          </button>
        </div>

        {syncResult && (
          <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
            syncResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {syncResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
            <span>{syncResult.text}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-5">
        <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sao Lưu Google Drive & Xuất / Nhập File Dữ</h2>
            <p className="text-xs text-gray-500">
              Lưu trữ toàn bộ dữ liệu (Hồ sơ bé, Lịch EASY, Tiêm chủng, Nhật ký, Cài đặt AI) lên tài khoản Google Drive cá nhân của bạn hoặc xuất file .JSON dự phòng
            </p>
          </div>
        </div>

        {driveResult && (
          <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2 animate-fade-in ${
            driveResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {driveResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
            <span>{driveResult.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50/40 border border-blue-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-blue-900 font-extrabold text-sm">
              <Cloud className="w-5 h-5 text-blue-600" />
              <span>Sao Lưu & Khôi Phục Qua Google Drive</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Tự động yêu cầu đăng nhập tài khoản Google (nếu chưa đăng nhập) và cấp quyền lưu trữ file an toàn lên Drive của bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleBackupToGoogleDrive}
                disabled={driveActionState !== null}
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <CloudUpload className={`w-4 h-4 ${driveActionState === 'backup' ? 'animate-bounce' : ''}`} />
                <span>{driveActionState === 'backup' ? 'Đang tải lên Drive...' : 'Sao lưu lên Google Drive'}</span>
              </button>

              <button
                type="button"
                onClick={handleRestoreFromGoogleDrive}
                disabled={driveActionState !== null}
                className="flex-1 py-2.5 px-3 bg-white hover:bg-blue-50 border border-blue-300 disabled:opacity-50 text-blue-900 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className={`w-4 h-4 text-blue-600 ${driveActionState === 'restore' ? 'animate-bounce' : ''}`} />
                <span>{driveActionState === 'restore' ? 'Đang nạp file...' : 'Khôi phục từ Drive'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2 text-slate-900 font-extrabold text-sm">
              <HardDrive className="w-5 h-5 text-slate-700" />
              <span>Xuất / Nhập File Dữ Liệu Máy Tính (.JSON)</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed font-medium">
              Tải file sao lưu offline về thiết bị hoặc nhập file .JSON từ máy để khôi phục khi đổi điện thoại/trình duyệt.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleDownloadLocalBackup}
                className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <FileJson className="w-4 h-4 text-yellow-400" />
                <span>Tải file Backup về máy</span>
              </button>

              <label className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs text-center">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Nhập file từ máy</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportLocalBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
