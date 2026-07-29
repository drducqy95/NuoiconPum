import localforage from 'localforage';

export interface BabyProfile {
  // Personal Info
  name: string;           // Tên đầy đủ (VD: Nguyễn Văn Pum)
  nickname: string;       // Tên gọi ở nhà (VD: Bé Pum)
  birthDate: string;      // Ngày sinh (YYYY-MM-DD)
  gender: 'male' | 'female' | 'other';
  avatarUrl?: string;     // Ảnh đại diện (Base64 hoặc URL)
  
  // Medical & Health Info
  bloodType?: 'A' | 'B' | 'AB' | 'O' | 'unknown';
  allergies?: string;     // Dị ứng (VD: Dị ứng đạm sữa bò, dị ứng hải sản...)
  medicalNotes?: string;  // Tiền sử bệnh lý / Lưu ý sức khỏe
  medicalHistory?: string;
  pediatricianName?: string; // Bác sĩ nhi khoa phụ trách
  pediatricianPhone?: string; // SĐT bác sĩ / Khẩn cấp
  hospitalName?: string;     // Bệnh viện / Phòng khám quen
  vaccineNotes?: string;     // Ghi chú vắc-xin / Tiêm chủng
  gestationalAgeWeeks?: number;
  birthWeightKg?: number;
  birthHeightCm?: number;
  birthHeadCircumferenceCm?: number;
}

export const DEFAULT_BABY_PROFILE: BabyProfile = {
  name: 'Bé Pum',
  nickname: 'Pum',
  birthDate: new Date().toISOString().split('T')[0],
  gender: 'male',
  avatarUrl: '',
  bloodType: 'unknown',
  allergies: '',
  medicalNotes: '',
  pediatricianName: '',
  pediatricianPhone: '',
  hospitalName: '',
  vaccineNotes: '',
};

const babyProfileStore = localforage.createInstance({
  name: 'NuoiConDB',
  storeName: 'baby_profile',
});

export const babyProfileStorage = {
  async getProfile(): Promise<BabyProfile> {
    try {
      const saved = await babyProfileStore.getItem<BabyProfile>('baby_info');
      if (saved) {
        return { ...DEFAULT_BABY_PROFILE, ...saved };
      }
    } catch (e) {
      console.error('Failed to load baby profile', e);
    }
    return DEFAULT_BABY_PROFILE;
  },

  async saveProfile(profile: BabyProfile): Promise<void> {
    await babyProfileStore.setItem('baby_info', profile);
  },
};

// Utility helper to calculate exact age string (Months & Days)
export function getBabyAgeText(birthDateStr: string): string {
  if (!birthDateStr) return '';
  const birth = new Date(birthDateStr);
  const now = new Date();
  if (isNaN(birth.getTime())) return '';

  let diffTime = now.getTime() - birth.getTime();
  if (diffTime < 0) return 'Mới sinh';

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30.4375);
  const remainingDays = Math.floor(diffDays % 30.4375);

  if (months === 0) {
    return `${diffDays} ngày tuổi`;
  }
  if (remainingDays === 0) {
    return `${months} tháng tuổi`;
  }
  return `${months} tháng ${remainingDays} ngày tuổi`;
}
