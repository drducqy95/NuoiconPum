import { babyProfileStorage, BabyProfile } from '../data/babyProfileStorage';
import { easyStorage, EasyDayLog } from '../data/easyStorage';
import { getTrackedVaccines, saveTrackedVaccines, TrackedVaccineRecord } from '../data/vaccineTrackerStorage';
import { localDiaryApi, LocalDiaryEntry } from '../data/localDiaryApi';
import { aiSettingsStorage, AISettings } from '../data/aiSettingsStorage';

export interface CungConBackupData {
  version: string;
  appName: string;
  createdAt: string;
  babyProfile?: BabyProfile;
  easyLogs?: EasyDayLog[];
  vaccines?: TrackedVaccineRecord[];
  diaryEntries?: LocalDiaryEntry[];
  aiSettings?: AISettings;
}

export interface DriveFileInfo {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
}

/**
 * Gather all application data into a single unified Backup object
 */
export async function createFullBackupPackage(): Promise<CungConBackupData> {
  const babyProfile = await babyProfileStorage.getProfile();
  const easyLogs = await easyStorage.getAllDayLogs();
  const vaccines = getTrackedVaccines();
  const diaryEntries = await localDiaryApi.getAllEntries();
  const aiSettings = await aiSettingsStorage.getSettings();

  return {
    version: '2.0',
    appName: 'Cùng Con - Cẩm Nang & Nhật Ký Nuôi Con Khoa Học',
    createdAt: new Date().toISOString(),
    babyProfile,
    easyLogs,
    vaccines,
    diaryEntries,
    aiSettings,
  };
}

/**
 * Restore all local stores from a Backup object
 */
export async function restoreFullBackupPackage(data: CungConBackupData): Promise<void> {
  if (!data || typeof data !== 'object') {
    throw new Error('Dữ liệu sao lưu không hợp lệ.');
  }

  if (data.babyProfile) {
    await babyProfileStorage.saveProfile(data.babyProfile);
  }

  if (Array.isArray(data.easyLogs)) {
    for (const log of data.easyLogs) {
      if (log.dateStr) {
        await easyStorage.saveDayLog(log);
      }
    }
  }

  if (Array.isArray(data.vaccines)) {
    saveTrackedVaccines(data.vaccines);
  }

  if (Array.isArray(data.diaryEntries)) {
    for (const entry of data.diaryEntries) {
      if (entry.id) {
        await localDiaryApi.saveEntry(entry);
      }
    }
  }

  if (data.aiSettings) {
    await aiSettingsStorage.saveSettings(data.aiSettings);
  }
}

/**
 * Trigger local browser download of JSON backup file
 */
export function downloadBackupLocally(backupData: CungConBackupData): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cung_con_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Upload backup JSON to Google Drive
 */
/**
 * Upload backup JSON to Google Drive (Creates new file or updates existing file for today)
 */
export async function uploadBackupToDrive(
  accessToken: string,
  backupData: CungConBackupData
): Promise<DriveFileInfo> {
  if (!accessToken) {
    throw new Error('TOKEN_EXPIRED: Chưa có token đăng nhập Google Drive.');
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `cung_con_backup_${dateStr}.json`;
  const fileContent = JSON.stringify(backupData, null, 2);

  // Check if a backup file with this name already exists
  let existingFileId: string | null = null;
  try {
    const existingList = await listBackupsFromDrive(accessToken);
    const found = existingList.find(f => f.name === fileName);
    if (found) {
      existingFileId = found.id;
    }
  } catch (e) {
    console.warn('Could not list existing drive files prior to upload:', e);
  }

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,createdTime,size`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,size';

  const method = existingFileId ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem('gdrive_access_token');
    throw new Error('TOKEN_EXPIRED: Phiên làm việc Google Drive đã hết hạn hoặc chưa được cấp quyền.');
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Lỗi tải file lên Google Drive (${res.status}): ${errText}`);
  }

  const result = await res.json();
  return result;
}

/**
 * Fetch list of Cùng Con backup files from Google Drive
 */
export async function listBackupsFromDrive(accessToken: string): Promise<DriveFileInfo[]> {
  if (!accessToken) {
    throw new Error('TOKEN_EXPIRED: Chưa có token đăng nhập Google Drive.');
  }

  const query = encodeURIComponent("name contains 'cung_con_backup' and trashed = false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,createdTime,size)`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem('gdrive_access_token');
    throw new Error('TOKEN_EXPIRED: Phiên làm việc Google Drive đã hết hạn hoặc chưa được cấp quyền.');
  }

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Lỗi đọc danh sách file từ Google Drive (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Download backup JSON from Google Drive by file ID
 */
export async function downloadBackupFromDrive(
  accessToken: string,
  fileId: string
): Promise<CungConBackupData> {
  if (!accessToken) {
    throw new Error('TOKEN_EXPIRED: Chưa có token đăng nhập Google Drive.');
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    sessionStorage.removeItem('gdrive_access_token');
    throw new Error('TOKEN_EXPIRED: Phiên làm việc Google Drive đã hết hạn.');
  }

  if (!res.ok) {
    throw new Error(`Lỗi tải dữ liệu file từ Google Drive (${res.status})`);
  }

  const data = await res.json();
  return data;
}
