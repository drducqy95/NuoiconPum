import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

export interface GrowthRecord {
  id: string;
  dateStr: string; // "YYYY-MM-DD"
  monthAge: number; // Tuổi tính bằng tháng lúc đo
  weightKg?: number;
  heightCm?: number;
  notes?: string;
  createdAt: number;
}

const growthStore = localforage.createInstance({
  name: 'NuoiConDB',
  storeName: 'growth_records'
});

export const growthStorage = {
  async getAllRecords(): Promise<GrowthRecord[]> {
    const records: GrowthRecord[] = [];
    await growthStore.iterate((value: GrowthRecord) => {
      records.push(value);
    });
    // Sắp xếp giảm dần theo thời gian đo (mới nhất lên đầu)
    return records.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());
  },

  async getRecord(id: string): Promise<GrowthRecord | null> {
    return await growthStore.getItem(id);
  },

  async addRecord(record: Omit<GrowthRecord, 'id' | 'createdAt'>): Promise<string> {
    const id = uuidv4();
    const newRecord: GrowthRecord = {
      ...record,
      id,
      createdAt: Date.now()
    };
    await growthStore.setItem(id, newRecord);
    return id;
  },

  async updateRecord(id: string, updates: Partial<Omit<GrowthRecord, 'id' | 'createdAt'>>): Promise<void> {
    const existing = await growthStore.getItem<GrowthRecord>(id);
    if (existing) {
      await growthStore.setItem(id, { ...existing, ...updates });
    }
  },

  async deleteRecord(id: string): Promise<void> {
    await growthStore.removeItem(id);
  }
};
