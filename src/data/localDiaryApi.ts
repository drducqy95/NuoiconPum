import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

export interface LocalDiaryEntry {
  id: string;
  userId?: string | null;
  title: string;
  content: string;
  dateStr: string; // YYYY-MM-DD
  images: string[];
  height?: number | null;
  weight?: number | null;
  breastMilkVolume?: number | null;
  formulaVolume?: number | null;
  formulaType?: string | null;
  dirtyDiapers?: number | null;
  wetDiapers?: number | null;
  abnormalNotes?: string | null;
  createdAt: number;
  updatedAt: number;
  synced: boolean; // Flag to check if it's synced to cloud
}

const diaryStore = localforage.createInstance({
  name: "NuoiConDB",
  storeName: "diary_entries"
});

export const localDiaryApi = {
  async getAllEntries(userId?: string | null): Promise<LocalDiaryEntry[]> {
    const keys = await diaryStore.keys();
    let entries: LocalDiaryEntry[] = [];
    for (const key of keys) {
      const entry: LocalDiaryEntry | null = await diaryStore.getItem(key);
      if (entry) {
         // If a userId is provided, filter by it. But also allow anonymous local entries to be claimed later.
         // For now, let's just get all local entries if userId isn't strict, or associate them appropriately.
         entries.push(entry);
      }
    }
    // Sort descending by date
    entries.sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());
    return entries;
  },

  async getEntry(id: string): Promise<LocalDiaryEntry | null> {
    return await diaryStore.getItem(id);
  },

  async addEntry(entryData: Omit<LocalDiaryEntry, 'id' | 'createdAt' | 'updatedAt' | 'synced'>): Promise<string> {
    const id = uuidv4();
    const newEntry: LocalDiaryEntry = {
      ...entryData,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false
    };
    await diaryStore.setItem(id, newEntry);
    return id;
  },

  async updateEntry(id: string, entryData: Partial<Omit<LocalDiaryEntry, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const existing: LocalDiaryEntry | null = await diaryStore.getItem(id);
    if (existing) {
      const updatedEntry: LocalDiaryEntry = {
        ...existing,
        ...entryData,
        updatedAt: Date.now(),
        synced: false // mark dirty on edit
      };
      await diaryStore.setItem(id, updatedEntry);
    }
  },

  async deleteEntry(id: string): Promise<void> {
    await diaryStore.removeItem(id);
  },
  
  async markAsSynced(id: string): Promise<void> {
     const existing: LocalDiaryEntry | null = await diaryStore.getItem(id);
     if (existing) {
        await diaryStore.setItem(id, { ...existing, synced: true });
     }
  }
};
