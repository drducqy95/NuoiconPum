export interface TrackedVaccineRecord {
  id: string;
  vaccineId: string;       // Matched with matrix id or 'custom'
  vaccineName: string;     // Vaccine title (e.g. Hexaxim 6in1, Synflorix)
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED';
  scheduledDate?: string;  // YYYY-MM-DD
  completedDate?: string;  // YYYY-MM-DD
  location?: string;       // e.g. VNVC, Trạm Y tế, Tiêm chủng mở rộng
  doseLabel?: string;      // e.g. Mũi 1, Mũi 2, Mũi nhắc
  reactionNotes?: string;  // Phản ứng sau tiêm (sốt, sưng...)
  notes?: string;          // Ghi chú cá nhân
  updatedAt: string;
}

const STORAGE_KEY = 'cungcon_tracked_vaccines';

// Default initial vaccine checklist preset for baby
const DEFAULT_VACCINE_PRESETS: Omit<TrackedVaccineRecord, 'id' | 'updatedAt'>[] = [
  { vaccineId: 'bcg', vaccineName: 'Vắc-xin Lao (BCG)', doseLabel: 'Sơ sinh - Mũi 1', status: 'COMPLETED', location: 'Bệnh viện phụ sản', notes: 'Đã tiêm sau sinh 24h' },
  { vaccineId: 'vgb', vaccineName: 'Viêm gan B sơ sinh', doseLabel: 'Sơ sinh - Mũi 1', status: 'COMPLETED', location: 'Bệnh viện phụ sản' },
  { vaccineId: '6in1_1', vaccineName: 'Vắc-xin 6 trong 1 (Hexaxim / Infanrix)', doseLabel: '2 tháng - Mũi 1', status: 'SCHEDULED', scheduledDate: '2026-08-01', location: 'VNVC' },
  { vaccineId: 'phecau_1', vaccineName: 'Phế cầu khuẩn (Synflorix / Prevenar 13)', doseLabel: '2 tháng - Mũi 1', status: 'SCHEDULED', scheduledDate: '2026-08-01', location: 'VNVC' },
  { vaccineId: 'rota_1', vaccineName: 'Tiêu chảy Rota Virus (Rotarix / Rotateq)', doseLabel: '2 tháng - Liều 1', status: 'SCHEDULED', scheduledDate: '2026-08-01', location: 'VNVC' },
  { vaccineId: '6in1_2', vaccineName: 'Vắc-xin 6 trong 1 (Mũi 2)', doseLabel: '3 tháng - Mũi 2', status: 'PENDING' },
  { vaccineId: 'cum_1', vaccineName: 'Cúm mùa (Vaxigrip Tetra)', doseLabel: '6 tháng - Mũi 1', status: 'PENDING' },
  { vaccineId: 'soi_1', vaccineName: 'Sởi đơn / MMR (Sởi - Quai bị - Rubella)', doseLabel: '9 tháng - Mũi 1', status: 'PENDING' },
];

export const getTrackedVaccines = (): TrackedVaccineRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading tracked vaccines:', e);
  }

  // Initialize with default presets
  const initialData: TrackedVaccineRecord[] = DEFAULT_VACCINE_PRESETS.map((p, idx) => ({
    ...p,
    id: `vrec_${Date.now()}_${idx}`,
    updatedAt: new Date().toISOString(),
  }));

  saveTrackedVaccines(initialData);
  return initialData;
};

export const saveTrackedVaccines = (records: TrackedVaccineRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving tracked vaccines:', e);
  }
};

export const addTrackedVaccine = (record: Omit<TrackedVaccineRecord, 'id' | 'updatedAt'>): TrackedVaccineRecord => {
  const records = getTrackedVaccines();
  const newRecord: TrackedVaccineRecord = {
    ...record,
    id: `vrec_${Date.now()}`,
    updatedAt: new Date().toISOString(),
  };
  const updated = [newRecord, ...records];
  saveTrackedVaccines(updated);
  return newRecord;
};

export const updateTrackedVaccine = (id: string, updates: Partial<TrackedVaccineRecord>): TrackedVaccineRecord[] => {
  const records = getTrackedVaccines();
  const updated = records.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r);
  saveTrackedVaccines(updated);
  return updated;
};

export const deleteTrackedVaccine = (id: string): TrackedVaccineRecord[] => {
  const records = getTrackedVaccines();
  const updated = records.filter(r => r.id !== id);
  saveTrackedVaccines(updated);
  return updated;
};
