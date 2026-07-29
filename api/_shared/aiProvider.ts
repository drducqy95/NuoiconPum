import { GoogleGenAI } from '@google/genai';

export function sanitizeErrorMessage(msg: any): string {
  if (!msg || typeof msg !== 'string') return 'Lỗi xử lý API.';
  return msg
    .replace(/AIza[A-Za-z0-9_-]{35}/g, '[MASKED_KEY]')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[MASKED_KEY]')
    .replace(/key=[A-Za-z0-9_-]+/g, 'key=[MASKED_KEY]');
}

export async function generateAIContent(
  prompt: string,
  aiSettings?: any
): Promise<string> {
  const provider = aiSettings?.provider || 'system';

  // 1. OpenAI Compatible Provider (OpenAI, Groq, DeepSeek, OpenRouter, Ollama, etc.)
  if (provider === 'openai') {
    const apiKey = aiSettings?.openaiApiKey?.trim();
    let baseUrl = (aiSettings?.openaiBaseUrl?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const modelName = aiSettings?.openaiModel?.trim() || 'gpt-4o-mini';
    const temperature = Number(aiSettings?.temperature) || 0.7;
    const maxTokens = Number(aiSettings?.maxTokens) || 1000;

    if (!apiKey && !baseUrl.includes('localhost')) {
      throw new Error('Chưa nhập API Key cho nhà cung cấp OpenAI tương thích.');
    }

    const endpoint = `${baseUrl}/chat/completions`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson?.error?.message || `Lỗi API OpenAI (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    const responseText = data.choices?.[0]?.message?.content;
    if (!responseText) {
      throw new Error('Nhà cung cấp AI không trả về phản hồi.');
    }
    return responseText;
  }

  // 2. Custom Gemini API Key or System Default Key
  let apiKey = process.env.GEMINI_API_KEY || '';
  let modelName = 'gemini-3.1-flash-lite';

  if (aiSettings?.geminiModel?.trim()) {
    modelName = aiSettings.geminiModel.trim();
  }

  if (provider === 'gemini') {
    if (!aiSettings?.geminiApiKey?.trim()) {
      throw new Error('Chưa nhập Gemini API Key trong Cài đặt.');
    }
    apiKey = aiSettings.geminiApiKey.trim();
  }

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  return response.text || '';
}
