import type { VercelRequest, VercelResponse } from '@vercel/node';

function sanitizeErrorMessage(msg: any): string {
  if (!msg || typeof msg !== 'string') return 'Lỗi xử lý API.';
  return msg
    .replace(/AIza[A-Za-z0-9_-]{35}/g, '[MASKED_KEY]')
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, '[MASKED_KEY]')
    .replace(/key=[A-Za-z0-9_-]+/g, 'key=[MASKED_KEY]');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { provider, geminiApiKey, openaiApiKey, openaiBaseUrl } = req.body || {};

    // 1. Fetch Google Gemini Models List
    if (provider === 'gemini') {
      const apiKey = geminiApiKey?.trim();
      if (!apiKey) {
        return res.status(400).json({ error: 'Vui lòng nhập Gemini API Key trước khi nạp danh sách model.' });
      }

      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!geminiRes.ok) {
        const errJson = await geminiRes.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Lỗi API Gemini (${geminiRes.status}): Key không hợp lệ hoặc bị hạn chế.`);
      }

      const data = await geminiRes.json();
      const rawModels: any[] = data.models || [];

      // Filter only generative text models
      const models = rawModels
        .map(m => m.name.replace(/^models\//, ''))
        .filter(id => id.startsWith('gemini'));

      return res.status(200).json({ models });
    }

    // 2. Fetch OpenAI-Compatible Provider Models List
    if (provider === 'openai') {
      const apiKey = openaiApiKey?.trim();
      let baseUrl = (openaiBaseUrl?.trim() || 'https://api.openai.com/v1').replace(/\/+$/, '');

      if (!apiKey && !baseUrl.includes('localhost')) {
        return res.status(400).json({ error: 'Vui lòng nhập API Key trước khi nạp danh sách model.' });
      }

      const endpoint = `${baseUrl}/models`;
      const openAiRes = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
      });

      if (!openAiRes.ok) {
        const errJson = await openAiRes.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `Lỗi API (${openAiRes.status}): Không thể nạp danh sách model từ ${baseUrl}.`);
      }

      const data = await openAiRes.json();
      const rawData: any[] = Array.isArray(data) ? data : (data.data || []);
      const models = rawData.map(m => (typeof m === 'string' ? m : m.id)).filter(Boolean);

      return res.status(200).json({ models });
    }

    return res.status(400).json({ error: 'Provider không hợp lệ.' });
  } catch (error: any) {
    const safeErrorMsg = sanitizeErrorMessage(error?.message);
    console.error('Fetch Models Error (Sanitized):', safeErrorMsg);
    return res.status(500).json({ error: safeErrorMsg });
  }
}
