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
    const { historyMsg, userMessage, babyContext, aiSettings } = req.body || {};

    if (typeof userMessage !== 'string' || userMessage.trim().length === 0 || userMessage.length > 2000) {
      return res.status(400).json({ error: 'Nội dung câu hỏi không hợp lệ.' });
    }

    if (historyMsg !== undefined && (typeof historyMsg !== 'string' || historyMsg.length > 20000)) {
      return res.status(400).json({ error: 'Lịch sử hội thoại không hợp lệ.' });
    }

    if (babyContext !== undefined && (typeof babyContext !== 'string' || babyContext.length > 10000)) {
      return res.status(400).json({ error: 'Dữ liệu nhật ký không hợp lệ.' });
    }

    const promptContext = `You are a helpful, empathetic, and knowledgeable AI assistant for parents. Your name is 'Trợ lý Nuôi Con'. Answer in Vietnamese. Provide practical, gentle, and scientifically-backed advice on parenting, baby health, sleep, and nutrition. Use the provided Baby Records & Context to personalize your answer whenever relevant. Always remind parents to consult a doctor for serious medical conditions.

${babyContext ? `BABY RECORDS & CONTEXT:\n${babyContext}\n` : ''}
History:
${historyMsg || ''}
Parent: ${userMessage}
Assistant:`;

    const chatResponseText = await generateAIContent(promptContext, aiSettings);

    return res.status(200).json({ text: chatResponseText });
  } catch (error: any) {
    const safeErrorMsg = sanitizeErrorMessage(error?.message);
    console.error('AI Error (Sanitized):', safeErrorMsg);
    return res.status(500).json({ error: safeErrorMsg });
  }
}
