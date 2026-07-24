import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

function sanitizeErrorMessage(msg: any): string {
  if (!msg || typeof msg !== 'string') return 'Lỗi xử lý API.';
  return msg
    .replace(/AIza[A-Za-z0-9_-]{35}/g, '[MASKED_KEY]')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[MASKED_KEY]')
    .replace(/key=[A-Za-z0-9_-]+/g, 'key=[MASKED_KEY]');
}

async function generateAIContent(
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
  let apiKey = process.env.GEMINI_API_KEY;
  let modelName = 'gemini-2.5-flash';

  if (provider === 'gemini') {
    if (!aiSettings?.geminiApiKey?.trim()) {
      throw new Error('Chưa nhập Gemini API Key trong Cài đặt.');
    }
    apiKey = aiSettings.geminiApiKey.trim();
    if (aiSettings?.geminiModel?.trim()) {
      modelName = aiSettings.geminiModel.trim();
    }
  }

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  return response.text;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { dataStr, aiSettings } = req.body || {};

    if (typeof dataStr !== 'string' || dataStr.trim().length === 0 || dataStr.length > 5000) {
      return res.status(400).json({ error: 'Dữ liệu đầu vào không hợp lệ.' });
    }

    const prompt = `Dưới đây là một số thông tin chăm sóc bé gần nhất:\n${dataStr}\n\nHãy phân tích ngắn gọn (khoảng 3-4 câu) bằng tiếng Việt về tình trạng của bé. Chỉ ra xu hướng (nếu có đủ số liệu cao/nặng), nhấn mạnh những vấn đề bất thường (nếu có), và đưa ra 1 lời khuyên nhỏ. Trả lời thân thiện như một bác sĩ nhi khoa, không dùng markdown in đậm (*).`;

    const notesText = await generateAIContent(prompt, aiSettings);

    return res.status(200).json({ notes: notesText });
  } catch (error: any) {
    const safeErrorMsg = sanitizeErrorMessage(error?.message);
    console.error('AI Error (Sanitized):', safeErrorMsg);
    return res.status(500).json({ error: safeErrorMsg });
  }
}
