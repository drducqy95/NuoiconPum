import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateAIContent, sanitizeErrorMessage } from './_shared/aiProvider';

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
