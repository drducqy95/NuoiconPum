import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAIContent, sanitizeErrorMessage } from './_shared/aiProvider';

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
