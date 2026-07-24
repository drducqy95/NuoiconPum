import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import Markdown from 'react-markdown';
import { Send, Bot, User as UserIcon, Loader2, Sparkles, BookOpen, Clock, ShieldCheck, Key, Settings as SettingsIcon, Baby } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../apiClient';
import { localDiaryApi, LocalDiaryEntry } from '../data/localDiaryApi';
import { easyStorage, getDayTotalMilk, EasyDayLog } from '../data/easyStorage';
import { aiSettingsStorage, AISettings } from '../data/aiSettingsStorage';
import { babyProfileStorage, BabyProfile, getBabyAgeText } from '../data/babyProfileStorage';

export const Assistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Chào bạn! Mình là Trợ lý AI Nuôi Con. Mình đã kết nối dữ liệu từ Hồ Sơ Bé, Nhật Ký & Lịch EASY. Bạn có băn khoăn gì về sức khỏe, dinh dưỡng hay sự phát triển của bé không? Hãy hỏi mình nhé!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<LocalDiaryEntry[]>([]);
  const [todayEasyLog, setTodayEasyLog] = useState<EasyDayLog | null>(null);
  const [babyProfile, setBabyProfile] = useState<BabyProfile | null>(null);
  const [currentAiConfig, setCurrentAiConfig] = useState<AISettings | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch diary entries, EASY log, baby profile, and AI settings
  useEffect(() => {
    const loadContextData = async () => {
      try {
        const diaryData = await localDiaryApi.getAllEntries();
        setEntries(diaryData);

        const today = new Date().toISOString().split('T')[0];
        const easyLog = await easyStorage.getDayLog(today);
        setTodayEasyLog(easyLog || null);

        const profile = await babyProfileStorage.getProfile();
        setBabyProfile(profile);

        const aiConfig = await aiSettingsStorage.getSettings();
        setCurrentAiConfig(aiConfig);
      } catch (err) {
        console.error('Failed to load baby context for AI assistant', err);
      }
    };
    loadContextData();
  }, []);

  // Format context string for AI model prompt
  const buildBabyContextString = (): string => {
    const recentEntries = entries.slice(0, 7);
    const today = new Date().toISOString().split('T')[0];
    const milkStats = todayEasyLog ? getDayTotalMilk(todayEasyLog) : null;

    let contextParts: string[] = [];

    // 1. Baby Profile & Medical Info
    if (babyProfile) {
      const ageText = getBabyAgeText(babyProfile.birthDate);
      const profileSummary = `HỒ SƠ BÉ:
+ Tên đầy đủ: ${babyProfile.name || 'N/A'} (Tên gọi ở nhà: ${babyProfile.nickname || 'Bé'})
+ Ngày sinh: ${babyProfile.birthDate || 'N/A'} (${ageText || 'Chưa rõ độ tuổi'})
+ Giới tính: ${babyProfile.gender === 'female' ? 'Bé gái' : 'Bé trai'} | Nhóm máu: ${babyProfile.bloodType || 'Chưa rõ'}
+ Tiền sử DỊ ỨNG: ${babyProfile.allergies ? `⚠️ ${babyProfile.allergies}` : 'Không có ghi nhận dị ứng'}
+ Lưu ý Y TẾ / Bệnh lý: ${babyProfile.medicalNotes ? `🩺 ${babyProfile.medicalNotes}` : 'Thể trạng bình thường'}
+ Tiêm chủng & Vắc-xin: ${babyProfile.vaccineNotes || 'Không có ghi chú'}`;

      contextParts.push(profileSummary);
    }

    // 2. Diary Entries Summary
    if (recentEntries.length > 0) {
      const diarySummary = recentEntries.map(e => {
        const h = e.height ? `Cao: ${e.height}cm` : '';
        const w = e.weight ? `Nặng: ${e.weight}kg` : '';
        const d = (e.wetDiapers || e.dirtyDiapers) ? `Tã: ${e.wetDiapers || 0} ướt/${e.dirtyDiapers || 0} dơ` : '';
        const notes = e.abnormalNotes ? `Bất thường: ${e.abnormalNotes}` : '';
        const summary = [h, w, d, notes].filter(Boolean).join(', ');

        return `+ Ngày ${e.dateStr}: ${e.title || 'Nhật ký'} (${summary || 'Ghi chép bình thường'}) - Nội dung: "${e.content.slice(0, 150)}"`;
      }).join('\n');

      contextParts.push(`DỮ LIỆU NHẬT KÝ GẦN ĐÂY (${recentEntries.length} ngày):\n${diarySummary}`);
    }

    // 3. EASY Schedule Today
    if (todayEasyLog && milkStats) {
      contextParts.push(`LỊCH TRÌNH EASY HÔM NAY (${today}):
+ Mẫu lịch: ${todayEasyLog.presetId} (Giờ dậy sáng: ${todayEasyLog.morningWakeTime})
+ Tổng lượng sữa nạp: ${milkStats.grandTotal} ml (Sữa mẹ: ${milkStats.breastMilkTotal}ml, Sữa công thức: ${milkStats.formulaMilkTotal}ml)
+ Giờ đi ngủ đêm: ${todayEasyLog.bedtimeStart}
+ Chất lượng giấc ngủ đêm: ${todayEasyLog.nightSleepQuality || 5}/5 sao`);
    }

    return contextParts.join('\n\n');
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const historyMsg = messages.map(m => `${m.role === 'user' ? 'Parent' : 'Assistant'}: ${m.text}`).join('\n');
      const babyContext = buildBabyContextString();
      const aiSettings = await aiSettingsStorage.getSettings();

      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ historyMsg, userMessage, babyContext, aiSettings })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || 'Lỗi kết nối API');
      }

      const data = await res.json();
      const responseMsg = data.text || 'Xin lỗi, mình đang gặp chút trục trặc. Bạn vui lòng thử lại nhé.';
      setMessages(prev => [...prev, { role: 'model', text: responseMsg }]);

    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: `*Lỗi: ${error?.message || 'Đã xảy ra lỗi kết nối với máy chủ AI. Vui lòng kiểm tra Cài đặt API Key hoặc thử lại sau.'}*` }]);
    } finally {
      setLoading(false);
    }
  };

  const providerLabel = currentAiConfig?.provider === 'openai' 
    ? `OpenAI (${currentAiConfig.openaiModel})` 
    : (currentAiConfig?.provider === 'gemini' ? `Gemini Custom (${currentAiConfig.geminiModel})` : 'Mặc Định');

  const babyName = babyProfile?.nickname || babyProfile?.name || 'Bé';

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col overflow-hidden">
      
      {/* Header with Context Connection Indicator */}
      <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="w-6 h-6 text-violet-500 mr-2" />
            Trợ Lý AI Nhi Khoa cho {babyName}
          </h1>
          <p className="text-xs text-gray-500">Tư vấn sức khỏe, dinh dưỡng & giấc ngủ cá nhân hóa theo hồ sơ và nhật ký của {babyName}</p>
        </div>

        {/* Data Sync & Provider Status Badges */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <div className="flex items-center space-x-1.5 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-xl text-xs font-bold text-violet-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Đã kết nối Hồ sơ y tế & {entries.length} nhật ký</span>
          </div>

          <Link
            to="/settings"
            className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-gray-700 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Đổi API Key / Provider / Hồ sơ bé"
          >
            <Key className="w-3.5 h-3.5 text-amber-600" />
            <span>{providerLabel}</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-rose-100 text-rose-600 ml-3' : 'bg-violet-100 text-violet-600 mr-3'
                }`}>
                  {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-rose-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">{msg.text}</p>
                  ) : (
                    <div className="prose prose-sm md:prose-base prose-violet max-w-none text-xs sm:text-sm leading-relaxed">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex max-w-[85%] flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mr-3">
                  <Bot size={16} />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm rounded-tl-sm flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                  <span className="text-xs text-gray-500 font-semibold">Đang phân tích hồ sơ {babyName} & suy nghĩ câu trả lời...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-50 border-t border-gray-100 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
          <span className="text-gray-400 font-bold whitespace-nowrap">Gợi ý:</span>
          {[
            `Dựa vào tiền sử dị ứng và độ tuổi, ${babyName} nên lưu ý điều gì khi tập ăn dặm?`,
            `Dựa vào nhật ký, cữ sữa hôm nay của ${babyName} đã đủ chưa?`,
            `Lịch EASY hiện tại có phù hợp với số tháng tuổi của ${babyName} không?`
          ].map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(promptText);
              }}
              className="px-3 py-1 bg-white hover:bg-violet-50 text-gray-700 hover:text-violet-700 border border-gray-200 rounded-full whitespace-nowrap text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="p-3 md:p-4 bg-white border-t border-gray-200 flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Hỏi AI về sức khỏe, dị ứng hay cữ ăn của ${babyName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-50 border border-gray-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl transition-colors cursor-pointer shadow-xs flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default Assistant;
