import localforage from 'localforage';

export type AIProvider = 'system' | 'gemini' | 'openai';

export interface AISettings {
  provider: AIProvider; // 'system' (Mặc định hệ thống), 'gemini' (Gemini API riêng), 'openai' (OpenAI Tương thích)
  
  // Gemini custom settings
  geminiApiKey: string;
  geminiModel: string; // "gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.5-flash"
  
  // OpenAI compatible settings (OpenAI, Groq, DeepSeek, OpenRouter, Ollama)
  openaiApiKey: string;
  openaiBaseUrl: string; // "https://api.openai.com/v1", "https://api.groq.com/openai/v1", "https://openrouter.ai/api/v1", "https://api.deepseek.com/v1", "http://localhost:11434/v1"
  openaiModel: string; // "gpt-4o-mini", "gpt-4o", "deepseek-chat", "llama-3.3-70b-versatile"

  // Hyperparameters
  temperature: number; // 0.0 -> 1.0
  maxTokens: number;   // 256 -> 4096
}

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'system',
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
};

const aiSettingsStore = localforage.createInstance({
  name: 'NuoiConDB',
  storeName: 'ai_settings',
});

export const aiSettingsStorage = {
  async getSettings(): Promise<AISettings> {
    try {
      const saved = await aiSettingsStore.getItem<AISettings>('user_ai_config');
      if (saved) {
        return { ...DEFAULT_AI_SETTINGS, ...saved };
      }
    } catch (e) {
      console.error('Failed to load AI settings', e);
    }
    return DEFAULT_AI_SETTINGS;
  },

  async saveSettings(settings: AISettings): Promise<void> {
    await aiSettingsStore.setItem('user_ai_config', settings);
  },
};
