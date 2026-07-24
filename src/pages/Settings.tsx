import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { localDiaryApi } from '../data/localDiaryApi';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import {
  CloudUpload,
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle2,
  Bot,
  Key,
  Sparkles,
  Sliders,
  Server,
  Save,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  ShieldCheck,
  Baby,
  HeartPulse,
  Stethoscope,
  Camera,
  Trash2,
  Syringe,
  Calendar,
  Cloud,
  FileJson,
  HardDrive
} from 'lucide-react';
import { aiSettingsStorage, AISettings, DEFAULT_AI_SETTINGS } from '../data/aiSettingsStorage';
import { babyProfileStorage, BabyProfile, DEFAULT_BABY_PROFILE, getBabyAgeText } from '../data/babyProfileStorage';
import { apiFetch } from '../apiClient';
import { signInWithGoogle } from '../firebase';
import {
  createFullBackupPackage,
  restoreFullBackupPackage,
  downloadBackupLocally,
  uploadBackupToDrive,
  listBackupsFromDrive,
  downloadBackupFromDrive,
  DriveFileInfo
} from '../services/backupService';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Baby Profile State
  const [babyProfile, setBabyProfile] = useState<BabyProfile>(DEFAULT_BABY_PROFILE);
  const [savingBaby, setSavingBaby] = useState(false);
  const [babySaveResult, setBabySaveResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // AI Settings State
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [savingAi, setSavingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Password / Key Visibility Toggles
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  // Dynamic Fetched Models State
  const [fetchedGeminiModels, setFetchedGeminiModels] = useState<string[]>(['gemini-3.1-flash-lite', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']);
  const [fetchedOpenaiModels, setFetchedOpenaiModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState<boolean>(false);

  // Backup & Google Drive State
  const [driveActionState, setDriveActionState] = useState<string | null>(null);
  const [driveResult, setDriveResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [driveFilesList, setDriveFilesList] = useState<DriveFileInfo[]>([]);

  // Backup to Google Drive (triggers login with drive scope if needed)
  const handleBackupToGoogleDrive = async () => {
    setDriveActionState('backup');
    setDriveResult(null);
    try {
      let token = sessionStorage.getItem('gdrive_access_token');
      if (!user || !token) {
        setDriveResult({ type: 'success', text: 'Đang mở đăng nhập Google cấp quyền Drive...' });
        await signInWithGoogle(true);
        token = sessionStorage.getItem('gdrive_access_token');
      }

      if (!token) {
        throw new Error('Chưa cấp quyền truy cập Google Drive.');
      }

      const backupPackage = await createFullBackupPackage();
      const uploadedFile = await uploadBackupToDrive(token, backupPackage);
      setDriveResult({
        type: 'success',
        text: `✅ Sao lưu lên Google Drive thành công! File: ${uploadedFile.name}`
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

  // Restore from Google Drive
  const handleRestoreFromGoogleDrive = async () => {
    setDriveActionState('restore');
    setDriveResult(null);
    try {
      let token = sessionStorage.getItem('gdrive_access_token');
      if (!user || !token) {
        setDriveResult({ type: 'success', text: 'Đang mở đăng nhập Google cấp quyền Drive...' });
        await signInWithGoogle(true);
        token = sessionStorage.getItem('gdrive_access_token');
      }

      if (!token) {
        throw new Error('Chưa cấp quyền truy cập Google Drive.');
      }

      const files = await listBackupsFromDrive(token);
      if (files.length === 0) {
        throw new Error('Chưa tìm thấy bản sao lưu nào trên Google Drive của bạn.');
      }

      setDriveFilesList(files);
      // Auto-restore the latest backup file
      const latestFile = files[0];
      const backupData = await downloadBackupFromDrive(token, latestFile.id);
      await restoreFullBackupPackage(backupData);

      // Refresh local states
      const newBaby = await babyProfileStorage.getProfile();
      setBabyProfile(newBaby);
      const newAi = await aiSettingsStorage.getSettings();
      setAiSettings(newAi);

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

  // Download Backup JSON to Device
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

  // Import Backup JSON from Device
  const handleImportLocalBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonStr = event.target?.result as string;
        const backupData = JSON.parse(jsonStr);
        await restoreFullBackupPackage(backupData);

        // Refresh local states
        const newBaby = await babyProfileStorage.getProfile();
        setBabyProfile(newBaby);
        const newAi = await aiSettingsStorage.getSettings();
        setAiSettings(newAi);

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

  useEffect(() => {
    aiSettingsStorage.getSettings().then(setAiSettings);
    babyProfileStorage.getProfile().then(setBabyProfile);
  }, []);

  // Handle Avatar Image Upload & Convert to Base64
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Kích thước ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBabyProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBabyProfile = async () => {
    setSavingBaby(true);
    setBabySaveResult(null);
    try {
      await babyProfileStorage.saveProfile(babyProfile);
      setBabySaveResult({ type: 'success', text: 'Đã cập nhật hồ sơ và thông tin y tế của bé thành công!' });
    } catch (err) {
      console.error(err);
      setBabySaveResult({ type: 'error', text: 'Lỗi lưu hồ sơ bé.' });
    } finally {
      setSavingBaby(false);
    }
  };

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

  // Fetch available models from API Key dynamically
  const handleFetchModelsFromApi = async (targetProvider: 'gemini' | 'openai') => {
    setFetchingModels(true);
    setAiTestResult(null);

    try {
      const res = await apiFetch('/api/models', {
        method: 'POST',
        body: JSON.stringify({
          provider: targetProvider,
          geminiApiKey: aiSettings.geminiApiKey,
          openaiApiKey: aiSettings.openaiApiKey,
          openaiBaseUrl: aiSettings.openaiBaseUrl
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || 'Không thể lấy danh sách model');
      }

      const data = await res.json();
      const modelList: string[] = data.models || [];

      if (modelList.length === 0) {
        throw new Error('API không trả về model nào khả dụng.');
      }

      if (targetProvider === 'gemini') {
        setFetchedGeminiModels(modelList);
        if (!modelList.includes(aiSettings.geminiModel)) {
          setAiSettings(prev => ({ ...prev, geminiModel: modelList[0] }));
        }
      } else {
        setFetchedOpenaiModels(modelList);
        if (!modelList.includes(aiSettings.openaiModel)) {
          setAiSettings(prev => ({ ...prev, openaiModel: modelList[0] }));
        }
      }

      setAiTestResult({
        type: 'success',
        text: `✅ Đã nạp tự động ${modelList.length} model từ API! Vui lòng chọn trong danh sách xổ xuống.`
      });

    } catch (err: any) {
      console.error('Failed to fetch models from API', err);
      setAiTestResult({
        type: 'error',
        text: `❌ ${err?.message || 'Lỗi nạp danh sách model từ API Key'}`
      });
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSaveAiSettings = async () => {
    setSavingAi(true);
    setAiTestResult(null);
    try {
      await aiSettingsStorage.saveSettings(aiSettings);
      setAiTestResult({ type: 'success', text: 'Đã lưu bảo mật cấu hình Trợ Lý AI thành công!' });
    } catch (e) {
      setAiTestResult({ type: 'error', text: 'Lỗi lưu cấu hình.' });
    } finally {
      setSavingAi(false);
    }
  };

  const handleTestAiConnection = async () => {
    setSavingAi(true);
    setAiTestResult(null);
    try {
      await aiSettingsStorage.saveSettings(aiSettings);

      const res = await apiFetch('/api/generate-notes', {
        method: 'POST',
        body: JSON.stringify({
          dataStr: 'Test kết nối AI: Bé ngoan, ăn ngon ngủ sâu.',
          aiSettings
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Lỗi kết nối API');
      }

      const data = await res.json();
      setAiTestResult({
        type: 'success',
        text: `✅ Kết nối thành công! Phản hồi từ AI: "${data.notes.slice(0, 100)}..."`
      });
    } catch (err: any) {
      setAiTestResult({
        type: 'error',
        text: `❌ Lỗi kết nối: ${err?.message || 'Không thể gọi API'}`
      });
    } finally {
      setSavingAi(false);
    }
  };

  // Preset Auto-fill for OpenAI Compatible providers
  const applyProviderPreset = (presetName: string) => {
    if (presetName === 'openai') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'https://api.openai.com/v1',
        openaiModel: 'gpt-4o-mini'
      }));
    } else if (presetName === 'groq') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'https://api.groq.com/openai/v1',
        openaiModel: 'llama-3.3-70b-versatile'
      }));
    } else if (presetName === 'deepseek') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'https://api.deepseek.com/v1',
        openaiModel: 'deepseek-chat'
      }));
    } else if (presetName === 'openrouter') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'https://openrouter.ai/api/v1',
        openaiModel: 'google/gemini-flash-1.5'
      }));
    } else if (presetName === 'ollama') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'http://localhost:11434/v1',
        openaiModel: 'llama3'
      }));
    }
  };

  const babyAgeText = getBabyAgeText(babyProfile.birthDate);

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Title Banner */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
              <SettingsIcon className="w-6 h-6 text-gray-700 mr-2" />
              Cài Đặt Hệ Thống & Hồ Sơ Bé
            </h1>
            <p className="text-xs text-gray-500">Quản lý thông tin cá nhân/y tế bé, cấu hình Trợ lý AI và đồng bộ dữ liệu</p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 1: HỒ SƠ BÉ (CÁ NHÂN, Y TẾ, ẢNH ĐẠI DIỆN) */}
        {/* ============================================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                <Baby className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Hồ Sơ Của Bé (Cá Nhân & Thông Tin Y Tế)</h2>
                <p className="text-xs text-gray-500">Dùng để cá nhân hóa Trợ lý AI tư vấn chính xác theo độ tuổi và thể trạng bé</p>
              </div>
            </div>

            {babyAgeText && (
              <span className="bg-rose-100 text-rose-800 text-xs font-black px-3 py-1 rounded-full border border-rose-200">
                🎂 {babyAgeText}
              </span>
            )}
          </div>

          {babySaveResult && (
            <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2 animate-fade-in ${
              babySaveResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {babySaveResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
              <span>{babySaveResult.text}</span>
            </div>
          )}

          {/* Avatar Upload Header Section */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5 bg-slate-50 p-4 rounded-2xl border border-gray-200">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md bg-rose-100 flex items-center justify-center text-rose-400">
                {babyProfile.avatarUrl ? (
                  <img src={babyProfile.avatarUrl} alt="Baby Avatar" className="w-full h-full object-cover" />
                ) : (
                  <Baby className="w-12 h-12 text-rose-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full cursor-pointer shadow-md transition-transform hover:scale-110">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <h3 className="text-base font-extrabold text-gray-900">
                {babyProfile.name || 'Bé chưa đặt tên'} ({babyProfile.nickname || 'Pum'})
              </h3>
              <p className="text-xs text-gray-500">
                Tải ảnh đại diện siêu đáng yêu của bé để hiển thị trên toàn ứng dụng
              </p>
              {babyProfile.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setBabyProfile(prev => ({ ...prev, avatarUrl: '' }))}
                  className="text-xs text-rose-600 font-bold hover:underline inline-flex items-center space-x-1 cursor-pointer pt-1"
                >
                  <Trash2 size={12} />
                  <span>Xóa ảnh đại diện</span>
                </button>
              )}
            </div>
          </div>

          {/* 1. THÔNG TIN CÁ NHÂN */}
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center">
              <Baby className="w-4 h-4 text-rose-500 mr-1.5" />
              1. Thông Tin Cá Nhân Bé
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Tên đầy đủ khai sinh:</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn Pum"
                  value={babyProfile.name}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Tên gọi ở nhà (Nickname):</label>
                <input
                  type="text"
                  placeholder="VD: Bé Pum, Bé Thỏ"
                  value={babyProfile.nickname}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, nickname: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Ngày sinh của bé:</label>
                <input
                  type="date"
                  value={babyProfile.birthDate}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Giới tính:</label>
                <select
                  value={babyProfile.gender}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, gender: e.target.value as any }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="male">👦 Bé trai</option>
                  <option value="female">👧 Bé gái</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. THÔNG TIN Y TẾ & SỨC KHỎE */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center">
              <HeartPulse className="w-4 h-4 text-rose-600 mr-1.5" />
              2. Hồ Sơ Y Tế & Tiền Sử Sức Khỏe
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Nhóm máu:</label>
                <select
                  value={babyProfile.bloodType || 'unknown'}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, bloodType: e.target.value as any }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="unknown">Chưa rõ nhóm máu</option>
                  <option value="A">Nhóm máu A</option>
                  <option value="B">Nhóm máu B</option>
                  <option value="AB">Nhóm máu AB</option>
                  <option value="O">Nhóm máu O</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Tiền sử dị ứng (Nếu có):</label>
                <input
                  type="text"
                  placeholder="VD: Dị ứng đạm sữa bò (CMPA), dị ứng hải sản, dị ứng trứng..."
                  value={babyProfile.allergies || ''}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, allergies: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-bold mb-1">Lưu ý y tế đặc biệt / Tiền sử bệnh lý:</label>
                <textarea
                  rows={2}
                  placeholder="VD: Trào ngược dạ dày thực quản (GERD), sinh thiếu tháng 35 tuần, nhạy cảm tiếng ồn..."
                  value={babyProfile.medicalNotes || ''}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, medicalNotes: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Bác sĩ & Bệnh viện liên hệ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Bác sĩ Nhi khoa phụ trách:</label>
                <input
                  type="text"
                  placeholder="VD: BS. Nguyễn Văn A"
                  value={babyProfile.pediatricianName || ''}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, pediatricianName: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">SĐT Liên hệ khẩn cấp / Bác sĩ:</label>
                <input
                  type="text"
                  placeholder="VD: 0912345678"
                  value={babyProfile.pediatricianPhone || ''}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, pediatricianPhone: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Bệnh viện / Phòng khám quen thuộc:</label>
                <input
                  type="text"
                  placeholder="VD: Bệnh viện Nhi Đồng 1"
                  value={babyProfile.hospitalName || ''}
                  onChange={(e) => setBabyProfile(prev => ({ ...prev, hospitalName: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Vaccine notes */}
            <div className="text-xs pt-1">
              <label className="block text-gray-700 font-bold mb-1 flex items-center">
                <Syringe className="w-3.5 h-3.5 text-purple-600 mr-1" />
                Ghi chú tiêm chủng & Vắc-xin:
              </label>
              <input
                type="text"
                placeholder="VD: Đã hoàn thành 6in1 mũi 2, phế cầu mũi 1. Hẹn lịch mũi 3 tháng sau..."
                value={babyProfile.vaccineNotes || ''}
                onChange={(e) => setBabyProfile(prev => ({ ...prev, vaccineNotes: e.target.value }))}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Save Profile */}
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSaveBabyProfile}
              disabled={savingBaby}
              className="w-full sm:w-auto px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{savingBaby ? 'Đang lưu...' : 'Lưu Hồ Sơ Bé'}</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: AI PROVIDER & API KEY CONFIGURATION */}
        {/* ============================================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-violet-50 text-violet-600">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Cấu Hình Bảo Mật Trợ Lý AI</h2>
                <p className="text-xs text-gray-500">
                  API Key của bạn được lưu hoàn toàn trên bộ nhớ thiết bị này (IndexedDB) và được proxy bảo mật qua HTTPS Serverless
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Proxy Bảo Mật 100%</span>
            </div>
          </div>

          {/* Test/Save Alert message */}
          {aiTestResult && (
            <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2 animate-fade-in ${
              aiTestResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {aiTestResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
              <span>{aiTestResult.text}</span>
            </div>
          )}

          {/* Provider Selector Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block">
              1. Chọn Nhà Cung Cấp Mô Hình (AI Provider):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* System Default */}
              <button
                type="button"
                onClick={() => setAiSettings(prev => ({ ...prev, provider: 'system' }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  aiSettings.provider === 'system'
                    ? 'bg-violet-50 border-violet-400 text-violet-950 font-extrabold ring-1 ring-violet-300 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-bold">Mặc Định Hệ Thống</span>
                </div>
                <p className="text-[11px] text-gray-500">Sử dụng Gemini Key cài sẵn từ server</p>
              </button>

              {/* Custom Gemini */}
              <button
                type="button"
                onClick={() => setAiSettings(prev => ({ ...prev, provider: 'gemini' }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  aiSettings.provider === 'gemini'
                    ? 'bg-violet-50 border-violet-400 text-violet-950 font-extrabold ring-1 ring-violet-300 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Key className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold">Google Gemini (API Key)</span>
                </div>
                <p className="text-[11px] text-gray-500">Dùng Gemini API Key cá nhân của bạn</p>
              </button>

              {/* OpenAI Compatible */}
              <button
                type="button"
                onClick={() => setAiSettings(prev => ({ ...prev, provider: 'openai' }))}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  aiSettings.provider === 'openai'
                    ? 'bg-violet-50 border-violet-400 text-violet-950 font-extrabold ring-1 ring-violet-300 shadow-2xs'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold">OpenAI Tương Thích</span>
                </div>
                <p className="text-[11px] text-gray-500">OpenAI, Groq, DeepSeek, OpenRouter, Ollama...</p>
              </button>

            </div>
          </div>

          {/* SYSTEM DEFAULT GEMINI MODEL SELECTION FORM */}
          {aiSettings.provider === 'system' && (
            <div className="bg-violet-50/60 border border-violet-200 rounded-xl p-4 space-y-3 animate-fade-in text-xs">
              <h3 className="font-extrabold text-violet-900 flex items-center justify-between">
                <span className="flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-violet-600" />
                  Cấu Hình Mô Hình Gemini Cho API Key Mặc Định Hệ Thống
                </span>
                <button
                  type="button"
                  onClick={() => handleFetchModelsFromApi('gemini')}
                  disabled={fetchingModels}
                  className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
                >
                  <Download className={`w-3.5 h-3.5 ${fetchingModels ? 'animate-bounce' : ''}`} />
                  <span>{fetchingModels ? 'Đang nạp...' : 'Tải Model từ Server'}</span>
                </button>
              </h3>

              <p className="text-gray-600 leading-relaxed">
                Đang sử dụng Gemini API Key cài sẵn từ máy chủ Vercel. Bạn có thể tự do lựa chọn phiên bản mô hình Gemini mong muốn dưới đây:
              </p>

              <div>
                <label className="block text-gray-700 font-bold mb-1 flex items-center justify-between">
                  <span>Chọn Mô Hình Gemini (Model):</span>
                  <span className="text-[10px] text-violet-800 font-normal">Đã tìm thấy {fetchedGeminiModels.length} model</span>
                </label>
                <select
                  value={aiSettings.geminiModel}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, geminiModel: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer"
                >
                  {fetchedGeminiModels.map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 'gemini-1.5-flash' ? '(Mặc định - Nhanh & Tối ưu)' : m === 'gemini-2.0-flash' ? '(Gemini 2.0 Flash mới nhất)' : m === 'gemini-1.5-pro' ? '(Gemini 1.5 Pro chuyên sâu)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* CUSTOM GEMINI CONFIG FORM */}
          {aiSettings.provider === 'gemini' && (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3 animate-fade-in text-xs">
              <h3 className="font-extrabold text-amber-900 flex items-center justify-between">
                <span className="flex items-center">
                  <Key className="w-4 h-4 mr-1.5 text-amber-600" />
                  Cấu Hình Google Gemini API Cá Nhân
                </span>
              </h3>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Gemini API Key (Được ẩn bảo mật):</label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      placeholder="Nhập Gemini API Key của bạn (AIza...)"
                      value={aiSettings.geminiApiKey}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-3 pr-10 py-2 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title={showGeminiKey ? 'Ẩn API Key' : 'Hiện API Key'}
                    >
                      {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFetchModelsFromApi('gemini')}
                    disabled={fetchingModels || !aiSettings.geminiApiKey}
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1 cursor-pointer flex-shrink-0 shadow-xs"
                  >
                    <Download className={`w-3.5 h-3.5 ${fetchingModels ? 'animate-bounce' : ''}`} />
                    <span>{fetchingModels ? 'Đang nạp...' : 'Tải Model từ API'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1 flex items-center justify-between">
                  <span>Chọn Model Gemini (Dropdown):</span>
                  <span className="text-[10px] text-amber-800 font-normal">Đã tìm thấy {fetchedGeminiModels.length} model</span>
                </label>
                <select
                  value={aiSettings.geminiModel}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, geminiModel: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
                >
                  {fetchedGeminiModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* OPENAI COMPATIBLE CONFIG FORM */}
          {aiSettings.provider === 'openai' && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-4 animate-fade-in text-xs">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                <h3 className="font-extrabold text-emerald-900 flex items-center">
                  <Server className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Cấu Hình OpenAI-Compatible Provider
                </h3>

                {/* Quick Auto-fill Presets */}
                <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] text-gray-500 font-bold mr-1">Tự động nạp:</span>
                  {[
                    { id: 'openai', label: 'OpenAI' },
                    { id: 'groq', label: 'Groq (Siêu nhanh)' },
                    { id: 'deepseek', label: 'DeepSeek' },
                    { id: 'openrouter', label: 'OpenRouter' },
                    { id: 'ollama', label: 'Local Ollama' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyProviderPreset(p.id)}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1">API Base URL (Endpoint):</label>
                  <input
                    type="text"
                    placeholder="https://api.openai.com/v1"
                    value={aiSettings.openaiBaseUrl}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, openaiBaseUrl: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1">API Key (Được ẩn bảo mật):</label>
                  <div className="relative">
                    <input
                      type={showOpenaiKey ? 'text' : 'password'}
                      placeholder="sk-proj-..."
                      value={aiSettings.openaiApiKey}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl pl-3 pr-10 py-2 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title={showOpenaiKey ? 'Ẩn API Key' : 'Hiện API Key'}
                    >
                      {showOpenaiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Model Dropdown + Fetch Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-700 font-bold">Danh Sách Model Thích Hợp (Dropdown):</label>
                  <button
                    type="button"
                    onClick={() => handleFetchModelsFromApi('openai')}
                    disabled={fetchingModels || (!aiSettings.openaiApiKey && !aiSettings.openaiBaseUrl.includes('localhost'))}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
                  >
                    <Download className={`w-3.5 h-3.5 ${fetchingModels ? 'animate-bounce' : ''}`} />
                    <span>{fetchingModels ? 'Đang nạp...' : 'Tải danh sách Model từ API'}</span>
                  </button>
                </div>

                {fetchedOpenaiModels.length > 0 ? (
                  <select
                    value={aiSettings.openaiModel}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, openaiModel: e.target.value }))}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    {fetchedOpenaiModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      placeholder="Nhập tên Model (VD: gpt-4o-mini, deepseek-chat, llama-3.3-70b-versatile)..."
                      value={aiSettings.openaiModel}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, openaiModel: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ADVANCED HYPERPARAMETERS */}
          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-3 text-xs">
            <h3 className="font-extrabold text-gray-900 flex items-center">
              <Sliders className="w-4 h-4 mr-1.5 text-indigo-600" />
              Tùy Chỉnh Chỉ Số Tham Số AI (Hyperparameters)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-gray-700">Độ Sáng Tạo (Temperature):</label>
                  <span className="font-mono font-extrabold text-indigo-600">{aiSettings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.1"
                  value={aiSettings.temperature}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  className="w-full cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0.0 (Chính xác / Logic)</span>
                  <span>1.0 (Sáng tạo)</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Giới Hạn Token Độ Dài (Max Tokens):</label>
                <input
                  type="number"
                  min="256"
                  max="4096"
                  step="128"
                  value={aiSettings.maxTokens}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1000 }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Actions Save & Test */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleTestAiConnection}
              disabled={savingAi}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${savingAi ? 'animate-spin' : ''}`} />
              <span>Kiểm Tra Kết Nối AI</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAiSettings}
              disabled={savingAi}
              className="w-full sm:w-auto px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingAi ? 'Đang lưu...' : 'Lưu Cấu Hình AI'}</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: CLOUD SYNC SECTION */}
        {/* ============================================================ */}
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

        {/* ============================================================ */}
        {/* SECTION 4: SAO LƯU GOOGLE DRIVE & XUẤT/NHẬP FILE */}
        {/* ============================================================ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-5">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sao Lưu Google Drive & Xuất / Nhập File Dữ Liệu</h2>
              <p className="text-xs text-gray-500">
                Lưu trữ toàn bộ dữ liệu (Hồ sơ bé, Lịch EASY, Tiêm chủng, Nhật ký, Cài đặt AI) lên tài khoản Google Drive cá nhân của bạn hoặc xuất file .JSON dự phòng
              </p>
            </div>
          </div>

          {/* Drive Action Result Alert */}
          {driveResult && (
            <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2 animate-fade-in ${
              driveResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {driveResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
              <span>{driveResult.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Google Drive Option */}
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

            {/* Offline File Backup Option */}
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

      </div>
    </div>
  );
};

export default Settings;
