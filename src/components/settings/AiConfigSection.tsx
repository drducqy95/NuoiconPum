import React, { useEffect, useState } from 'react';
import {
  Bot, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Key, Server,
  Download, Eye, EyeOff, Sliders, RefreshCw, Save
} from 'lucide-react';
import { aiSettingsStorage, AISettings, DEFAULT_AI_SETTINGS } from '../../data/aiSettingsStorage';
import { apiFetch } from '../../apiClient';

export const AiConfigSection: React.FC = () => {
  const [aiSettings, setAiSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [savingAi, setSavingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);

  const [fetchedGeminiModels, setFetchedGeminiModels] = useState<string[]>(['gemini-3.1-flash-lite', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro']);
  const [fetchedOpenaiModels, setFetchedOpenaiModels] = useState<string[]>([]);
  const [fetchingModels, setFetchingModels] = useState<boolean>(false);

  useEffect(() => {
    aiSettingsStorage.getSettings().then(setAiSettings);
  }, []);

  const handleFetchModelsFromApi = async (targetProvider: 'gemini' | 'openai') => {
    setFetchingModels(true);
    setAiTestResult(null);

    try {
      const res = await apiFetch('/api/models', {
        method: 'POST',
        body: JSON.stringify({
          provider: targetProvider,
          geminiApiKey: aiSettings.geminiApiKey,
          openaiApiKey: aiSettings.openaiApiKey,
          openaiBaseUrl: aiSettings.openaiBaseUrl
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error || 'Không thể lấy danh sách model');
      }

      const data = await res.json();
      const modelList: string[] = data.models || [];

      if (modelList.length === 0) {
        throw new Error('API không trả về model nào khả dụng.');
      }

      if (targetProvider === 'gemini') {
        setFetchedGeminiModels(modelList);
        if (!modelList.includes(aiSettings.geminiModel)) {
          setAiSettings(prev => ({ ...prev, geminiModel: modelList[0] }));
        }
      } else {
        setFetchedOpenaiModels(modelList);
        if (!modelList.includes(aiSettings.openaiModel)) {
          setAiSettings(prev => ({ ...prev, openaiModel: modelList[0] }));
        }
      }

      setAiTestResult({
        type: 'success',
        text: `✅ Đã nạp tự động ${modelList.length} model từ API! Vui lòng chọn trong danh sách xổ xuống.`
      });

    } catch (err: any) {
      console.error('Failed to fetch models from API', err);
      setAiTestResult({
        type: 'error',
        text: `❌ ${err?.message || 'Lỗi nạp danh sách model từ API Key'}`
      });
    } finally {
      setFetchingModels(false);
    }
  };

  const handleSaveAiSettings = async () => {
    setSavingAi(true);
    setAiTestResult(null);
    try {
      await aiSettingsStorage.saveSettings(aiSettings);
      setAiTestResult({ type: 'success', text: 'Đã lưu bảo mật cấu hình Trợ Lý AI thành công!' });
    } catch (e) {
      setAiTestResult({ type: 'error', text: 'Lỗi lưu cấu hình.' });
    } finally {
      setSavingAi(false);
    }
  };

  const handleTestAiConnection = async () => {
    setSavingAi(true);
    setAiTestResult(null);
    try {
      await aiSettingsStorage.saveSettings(aiSettings);

      const res = await apiFetch('/api/generate-notes', {
        method: 'POST',
        body: JSON.stringify({
          dataStr: 'Test kết nối AI: Bé ngoan, ăn ngon ngủ sâu.',
          aiSettings
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || 'Lỗi kết nối API');
      }

      const data = await res.json();
      setAiTestResult({
        type: 'success',
        text: `✅ Kết nối thành công! Phản hồi từ AI: "${data.notes.slice(0, 100)}..."`
      });
    } catch (err: any) {
      setAiTestResult({
        type: 'error',
        text: `❌ Lỗi kết nối: ${err?.message || 'Không thể gọi API'}`
      });
    } finally {
      setSavingAi(false);
    }
  };

  const applyProviderPreset = (presetName: string) => {
    if (presetName === 'openai') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'https://api.openai.com/v1',
        openaiModel: 'gpt-4o-mini'
      }));
    } else if (presetName === 'groq') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'https://api.groq.com/openai/v1',
        openaiModel: 'llama-3.3-70b-versatile'
      }));
    } else if (presetName === 'deepseek') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'https://api.deepseek.com/v1',
        openaiModel: 'deepseek-chat'
      }));
    } else if (presetName === 'openrouter') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'https://openrouter.ai/api/v1',
        openaiModel: 'google/gemini-2.5-flash'
      }));
    } else if (presetName === 'ollama') {
      setAiSettings(prev => ({
        ...prev,
        provider: 'openai',
        openaiBaseUrl: 'http://localhost:11434/v1',
        openaiModel: 'llama3'
      }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-violet-50 text-violet-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cấu Hình Bảo Mật Trợ Lý AI</h2>
            <p className="text-xs text-gray-500">
              API Key của bạn được lưu hoàn toàn trên bộ nhớ thiết bị này (IndexedDB) và được proxy bảo mật qua HTTPS Serverless
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Proxy Bảo Mật 100%</span>
        </div>
      </div>

      {aiTestResult && (
        <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2 animate-fade-in ${
          aiTestResult.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {aiTestResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
          <span>{aiTestResult.text}</span>
        </div>
      )}

      {/* Provider Selector Tabs */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block">
          1. Chọn Nhà Cung Cấp Mô Hình (AI Provider):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <button
            type="button"
            onClick={() => setAiSettings(prev => ({ ...prev, provider: 'system' }))}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              aiSettings.provider === 'system'
                ? 'bg-violet-50 border-violet-400 text-violet-950 font-extrabold ring-1 ring-violet-300 shadow-2xs'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-xs font-bold">Mặc Định Hệ Thống</span>
            </div>
            <p className="text-[11px] text-gray-500">Sử dụng Gemini Key cài sẵn từ server</p>
          </button>

          <button
            type="button"
            onClick={() => setAiSettings(prev => ({ ...prev, provider: 'gemini' }))}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              aiSettings.provider === 'gemini'
                ? 'bg-violet-50 border-violet-400 text-violet-950 font-extrabold ring-1 ring-violet-300 shadow-2xs'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Key className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold">Google Gemini (API Key)</span>
            </div>
            <p className="text-[11px] text-gray-500">Dùng Gemini API Key cá nhân của bạn</p>
          </button>

          <button
            type="button"
            onClick={() => setAiSettings(prev => ({ ...prev, provider: 'openai' }))}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              aiSettings.provider === 'openai'
                ? 'bg-violet-50 border-violet-400 text-violet-950 font-extrabold ring-1 ring-violet-300 shadow-2xs'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <Server className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold">OpenAI Tương Thích</span>
            </div>
            <p className="text-[11px] text-gray-500">OpenAI, Groq, DeepSeek, OpenRouter, Ollama...</p>
          </button>
        </div>
      </div>

      {/* SYSTEM DEFAULT GEMINI MODEL SELECTION FORM */}
      {aiSettings.provider === 'system' && (
        <div className="bg-violet-50/60 border border-violet-200 rounded-xl p-4 space-y-3 animate-fade-in text-xs">
          <h3 className="font-extrabold text-violet-900 flex items-center justify-between">
            <span className="flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-violet-600" />
              Cấu Hình Mô Hình Gemini Cho API Key Mặc Định Hệ Thống
            </span>
            <button
              type="button"
              onClick={() => handleFetchModelsFromApi('gemini')}
              disabled={fetchingModels}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
            >
              <Download className={`w-3.5 h-3.5 ${fetchingModels ? 'animate-bounce' : ''}`} />
              <span>{fetchingModels ? 'Đang nạp...' : 'Tải Model từ Server'}</span>
            </button>
          </h3>

          <p className="text-gray-600 leading-relaxed">
            Đang sử dụng Gemini API Key cài sẵn từ máy chủ Vercel. Bạn có thể tự do lựa chọn phiên bản mô hình Gemini mong muốn dưới đây:
          </p>

          <div>
            <label className="block text-gray-700 font-bold mb-1 flex items-center justify-between">
              <span>Chọn Mô Hình Gemini (Model):</span>
              <span className="text-[10px] text-violet-800 font-normal">Đã tìm thấy {fetchedGeminiModels.length} model</span>
            </label>
            <select
              value={aiSettings.geminiModel}
              onChange={(e) => setAiSettings(prev => ({ ...prev, geminiModel: e.target.value }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-violet-500 focus:outline-none cursor-pointer"
            >
              {fetchedGeminiModels.map((m) => (
                <option key={m} value={m}>
                  {m} {m === 'gemini-1.5-flash' ? '(Mặc định - Nhanh & Tối ưu)' : m === 'gemini-2.0-flash' ? '(Gemini 2.0 Flash mới nhất)' : m === 'gemini-1.5-pro' ? '(Gemini 1.5 Pro chuyên sâu)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* CUSTOM GEMINI CONFIG FORM */}
      {aiSettings.provider === 'gemini' && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-3 animate-fade-in text-xs">
          <h3 className="font-extrabold text-amber-900 flex items-center justify-between">
            <span className="flex items-center">
              <Key className="w-4 h-4 mr-1.5 text-amber-600" />
              Cấu Hình Google Gemini API Cá Nhân
            </span>
          </h3>

          <div>
            <label className="block text-gray-700 font-bold mb-1">Gemini API Key (Được ẩn bảo mật):</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type={showGeminiKey ? 'text' : 'password'}
                  placeholder="Nhập Gemini API Key của bạn (AIza...)"
                  value={aiSettings.geminiApiKey}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-3 pr-10 py-2 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={showGeminiKey ? 'Ẩn API Key' : 'Hiện API Key'}
                >
                  {showGeminiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleFetchModelsFromApi('gemini')}
                disabled={fetchingModels || !aiSettings.geminiApiKey}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1 cursor-pointer flex-shrink-0 shadow-xs"
              >
                <Download className={`w-3.5 h-3.5 ${fetchingModels ? 'animate-bounce' : ''}`} />
                <span>{fetchingModels ? 'Đang nạp...' : 'Tải Model từ API'}</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1 flex items-center justify-between">
              <span>Chọn Model Gemini (Dropdown):</span>
              <span className="text-[10px] text-amber-800 font-normal">Đã tìm thấy {fetchedGeminiModels.length} model</span>
            </label>
            <select
              value={aiSettings.geminiModel}
              onChange={(e) => setAiSettings(prev => ({ ...prev, geminiModel: e.target.value }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              {fetchedGeminiModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* OPENAI COMPATIBLE CONFIG FORM */}
      {aiSettings.provider === 'openai' && (
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-4 animate-fade-in text-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
            <h3 className="font-extrabold text-emerald-900 flex items-center">
              <Server className="w-4 h-4 mr-1.5 text-emerald-600" />
              Cấu Hình OpenAI-Compatible Provider
            </h3>

            {/* Quick Auto-fill Presets */}
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-gray-500 font-bold mr-1">Tự động nạp:</span>
              {[
                { id: 'openai', label: 'OpenAI' },
                { id: 'groq', label: 'Groq (Siêu nhanh)' },
                { id: 'deepseek', label: 'DeepSeek' },
                { id: 'openrouter', label: 'OpenRouter' },
                { id: 'ollama', label: 'Local Ollama' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyProviderPreset(p.id)}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1">API Base URL (Endpoint):</label>
              <input
                type="text"
                placeholder="https://api.openai.com/v1"
                value={aiSettings.openaiBaseUrl}
                onChange={(e) => setAiSettings(prev => ({ ...prev, openaiBaseUrl: e.target.value }))}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1">API Key (Được ẩn bảo mật):</label>
              <div className="relative">
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  placeholder="sk-proj-..."
                  value={aiSettings.openaiApiKey}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, openaiApiKey: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl pl-3 pr-10 py-2 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={showOpenaiKey ? 'Ẩn API Key' : 'Hiện API Key'}
                >
                  {showOpenaiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Model Dropdown + Fetch Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-gray-700 font-bold">Danh Sách Model Thích Hợp (Dropdown):</label>
              <button
                type="button"
                onClick={() => handleFetchModelsFromApi('openai')}
                disabled={fetchingModels || (!aiSettings.openaiApiKey && !aiSettings.openaiBaseUrl.includes('localhost'))}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-[11px] transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
              >
                <Download className={`w-3.5 h-3.5 ${fetchingModels ? 'animate-bounce' : ''}`} />
                <span>{fetchingModels ? 'Đang nạp...' : 'Tải danh sách Model từ API'}</span>
              </button>
            </div>

            {fetchedOpenaiModels.length > 0 ? (
              <select
                value={aiSettings.openaiModel}
                onChange={(e) => setAiSettings(prev => ({ ...prev, openaiModel: e.target.value }))}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold font-mono text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {fetchedOpenaiModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Nhập tên Model (VD: gpt-4o-mini, deepseek-chat, llama-3.3-70b-versatile)..."
                  value={aiSettings.openaiModel}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, openaiModel: e.target.value }))}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADVANCED HYPERPARAMETERS */}
      <div className="bg-slate-50 border border-gray-200 rounded-xl p-4 space-y-3 text-xs">
        <h3 className="font-extrabold text-gray-900 flex items-center">
          <Sliders className="w-4 h-4 mr-1.5 text-indigo-600" />
          Tùy Chỉnh Chỉ Số Tham Số AI (Hyperparameters)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-gray-700">Độ Sáng Tạo (Temperature):</label>
              <span className="font-mono font-extrabold text-indigo-600">{aiSettings.temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.1"
              value={aiSettings.temperature}
              onChange={(e) => setAiSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
              className="w-full cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>0.0 (Chính xác / Logic)</span>
              <span>1.0 (Sáng tạo)</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Giới Hạn Token Độ Dài (Max Tokens):</label>
            <input
              type="number"
              min="256"
              max="4096"
              step="128"
              value={aiSettings.maxTokens}
              onChange={(e) => setAiSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 1000 }))}
              className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Actions Save & Test */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleTestAiConnection}
          disabled={savingAi}
          className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-gray-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${savingAi ? 'animate-spin' : ''}`} />
          <span>Kiểm Tra Kết Nối AI</span>
        </button>

        <button
          type="button"
          onClick={handleSaveAiSettings}
          disabled={savingAi}
          className="w-full sm:w-auto px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-extrabold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{savingAi ? 'Đang lưu...' : 'Lưu Cấu Hình AI'}</span>
        </button>
      </div>
    </div>
  );
};
