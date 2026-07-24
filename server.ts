import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Check if GEMINI_API_KEY is available
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-notes", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }
      
      const { dataStr } = req.body;
      const prompt = `Dưới đây là một số thông tin chăm sóc bé gần nhất:\n${dataStr}\n\nHãy phân tích ngắn gọn (khoảng 3-4 câu) bằng tiếng Việt về tình trạng của bé. Chỉ ra xu hướng (nếu có đủ số liệu cao/nặng), nhấn mạnh những vấn đề bất thường (nếu có), và đưa ra 1 lời khuyên nhỏ. Trả lời thân thiện như một bác sĩ nhi khoa, không dùng markdown in đậm (*).`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      
      res.json({ notes: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate notes" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const { historyMsg, userMessage } = req.body;
      const promptContext = `You are a helpful, empathetic, and knowledgeable AI assistant for parents. Your name is 'Trợ lý Nuôi Con'. Answer in Vietnamese. Provide practical, gentle, and scientifically-backed advice on parenting, baby health, sleep, and nutrition. Always remind parents to consult a doctor for serious medical conditions.
      
History:
${historyMsg}
Parent: ${userMessage}
Assistant:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContext,
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to chat" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
