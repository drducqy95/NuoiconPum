import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { BabyProfileSection } from '../components/settings/BabyProfileSection';
import { AiConfigSection } from '../components/settings/AiConfigSection';
import { SyncBackupSection } from '../components/settings/SyncBackupSection';

export const Settings: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto w-full bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-sm">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Cài Đặt Hệ Thống</h1>
            <p className="text-sm text-gray-500 font-medium">Quản lý hồ sơ bé, trợ lý AI và sao lưu dữ liệu an toàn</p>
          </div>
        </div>

        {/* Section 1: Baby Profile */}
        <BabyProfileSection />

        {/* Section 2: AI Config */}
        <AiConfigSection />

        {/* Section 3: Sync & Backup */}
        <SyncBackupSection />

      </div>
    </div>
  );
};

export default Settings;
