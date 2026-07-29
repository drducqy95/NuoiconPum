import React, { useState, useEffect } from 'react';
import { Pin, RefreshCw, Sparkles } from 'lucide-react';
import { BabyProfile, getBabyAgeText } from '../../data/babyProfileStorage';
import { LocalDiaryEntry } from '../../data/localDiaryApi';
import { easyStorage, getDayTotalMilk } from '../../data/easyStorage';
import { aiSettingsStorage } from '../../data/aiSettingsStorage';
import { format, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { apiFetch } from '../../apiClient';

interface AiAdviceWidgetProps {
  babyProfile: BabyProfile | null;
  entries: LocalDiaryEntry[];
}

export const AiAdviceWidget: React.FC<AiAdviceWidgetProps> = ({ babyProfile, entries }) => {
  const [pinnedAiAdvice, setPinnedAiAdvice] = useState<string>('');
  const [analyzedDateStr, setAnalyzedDateStr] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const analyzeYesterdayAndPinAdvice = async (forceRefresh = false) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = subDays(new Date(), 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    const yesterdayFormatted = format(yesterdayDate, 'dd/MM/yyyy', { locale: vi });

    setAnalyzedDateStr(yesterdayFormatted);

    const cacheKey = `pinned_ai_advice_${todayStr}`;
    const cachedAdvice = localStorage.getItem(cacheKey);

    if (cachedAdvice && !forceRefresh) {
      setPinnedAiAdvice(cachedAdvice);
      return;
    }

    setLoadingAi(true);
    try {
      const yesterdayEntry = entries.find(e => e.dateStr === yesterdayStr) || entries[0];
      const yesterdayEasy = await easyStorage.getDayLog(yesterdayStr);
      const milkStats = yesterdayEasy ? getDayTotalMilk(yesterdayEasy) : null;
      const aiSettings = await aiSettingsStorage.getSettings();
      const currentProfile = babyProfile; // passed from parent

      if (!currentProfile) return; // Wait until profile loads

      const babyName = currentProfile.nickname || currentProfile.name || 'bé';
      const ageText = getBabyAgeText(currentProfile.birthDate);

      const dataStr = `
THÔNG TIN BÉ: Tên: ${babyName}, Độ tuổi: ${ageText}, Giới tính: ${currentProfile.gender === 'female' ? 'Bé gái' : 'Bé trai'}, Tiền sử dị ứng: ${currentProfile.allergies || 'Không'}, Lưu ý y tế: ${currentProfile.medicalNotes || 'Không'}.

PHÂN TÍCH CHĂM SÓC NGÀY HÔM QUA (${yesterdayFormatted}):
- Nhật ký: ${yesterdayEntry ? `Chiều cao: ${yesterdayEntry.height || 'N/A'}cm, Cân nặng: ${yesterdayEntry.weight || 'N/A'}kg, Tã: ${yesterdayEntry.wetDiapers || 0} ướt/${yesterdayEntry.dirtyDiapers || 0} dơ. Dấu hiệu bất thường: "${yesterdayEntry.abnormalNotes || 'Không có'}". Ghi chú: "${yesterdayEntry.title || ''} - ${yesterdayEntry.content || ''}"` : 'Chưa nhập nhật ký'}
- Lịch EASY: ${yesterdayEasy && milkStats ? `Tổng sữa: ${milkStats.grandTotal}ml (Sữa mẹ: ${milkStats.breastMilkTotal}ml, Sữa CT: ${milkStats.formulaMilkTotal}ml), Giờ ngủ đêm: ${yesterdayEasy.bedtimeStart}, Đánh giá giấc đêm: ${yesterdayEasy.nightSleepQuality || 5}/5 sao` : 'Chưa lưu lịch EASY'}
`;

      const res = await apiFetch('/api/generate-notes', {
        method: 'POST',
        body: JSON.stringify({ dataStr, aiSettings })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || 'Lỗi API');
      }

      const responseData = await res.json();
      const generatedText = responseData.notes || `Hôm qua ${babyName} sinh hoạt rất ngoan! Hãy tiếp tục duy trì cữ ăn và giấc ngủ khoa học cho bé hôm nay nhé.`;
      
      setPinnedAiAdvice(generatedText);
      localStorage.setItem(cacheKey, generatedText);
    } catch (error) {
      console.error("Failed to generate pinned AI advice", error);
      const babyName = babyProfile?.nickname || 'bé';
      setPinnedAiAdvice(`Hôm qua ${babyName} sinh hoạt rất ngoan! Hãy tiếp tục duy trì cữ ăn và giấc ngủ khoa học cho bé hôm nay nhé.`);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    if (babyProfile) {
      analyzeYesterdayAndPinAdvice();
    }
  }, [entries, babyProfile]);

  const babyName = babyProfile?.nickname || babyProfile?.name || 'bé';

  return (
    <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden space-y-3">
      <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-yellow-400 text-indigo-950 font-black flex items-center justify-center">
            <Pin className="w-4 h-4 text-indigo-950 fill-indigo-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold bg-yellow-300 text-indigo-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                📌 Lời khuyên ghim hôm nay cho {babyName}
              </span>
              <span className="text-[11px] text-purple-100 font-medium hidden sm:inline">
                (Phân tích tự động dữ liệu ngày {analyzedDateStr})
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => analyzeYesterdayAndPinAdvice(true)}
          disabled={loadingAi}
          title="Phân tích lại dữ liệu"
          className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Phân tích lại</span>
        </button>
      </div>

      {loadingAi ? (
        <div className="animate-pulse space-y-2 py-2">
          <div className="h-2.5 bg-white/30 rounded w-3/4"></div>
          <div className="h-2.5 bg-white/30 rounded w-5/6"></div>
          <div className="h-2.5 bg-white/30 rounded w-1/2"></div>
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed text-purple-50 space-y-2">
          <div className="flex items-start space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
            <div className="italic">
              "{pinnedAiAdvice || `Hôm qua ${babyName} sinh hoạt rất ngoan! Hãy tiếp tục duy trì cữ ăn và giấc ngủ khoa học cho bé hôm nay nhé.`}"
            </div>
          </div>
          <div className="text-[10px] text-purple-200 text-right font-medium">
            — Trợ lý Bác sĩ Nhi khoa AI Nuôi Con
          </div>
        </div>
      )}
    </div>
  );
};
