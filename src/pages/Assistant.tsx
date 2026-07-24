import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import Markdown from 'react-markdown';
import { Send, Bot, User as UserIcon, Loader2, Sparkles } from 'lucide-react';
import { Calendar } from 'lucide-react';

export const Assistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Chào bạn, mình là Trợ lý AI Nuôi Con. Bạn có băn khoăn gì về sức khỏe, dinh dưỡng hay sự phát triển của bé không? Hãy hỏi mình nhé!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const historyMsg = messages.map(m => `${m.role === 'user' ? 'Parent' : 'Assistant'}: ${m.text}`).join('\n');
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ historyMsg, userMessage })
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json();
      const responseMsg = data.text || 'Xin lỗi, mình đang gặp chút trục trặc. Bạn vui lòng thử lại nhé.';
      setMessages(prev => [...prev, { role: 'model', text: responseMsg }]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: '*Đã xảy ra lỗi kết nối với máy chủ AI. Vui lòng kiểm tra API Key hoặc thử lại sau.*' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col overflow-hidden">
      <div className="mb-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="w-6 h-6 text-violet-500 mr-2" />
            Trợ lý AI
          </h1>
          <p className="text-xs text-gray-500">Người bạn đồng hành thông thái của ba mẹ</p>
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
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                     ) : (
                        <div className="prose prose-sm md:prose-base prose-violet max-w-none">
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
                    <div className="px-5 py-4 rounded-2xl bg-white border border-gray-200 shadow-sm rounded-tl-sm flex items-center">
                       <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                       <span className="ml-2 text-gray-500 text-sm">Đang suy nghĩ...</span>
                    </div>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
         </div>

          {/* Input area */}
          <div className="p-3 bg-white border-t border-gray-200 flex-shrink-0">
             <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  placeholder="Hỏi trợ lý (VD: Bé bị ho nên xử lý thế nào?)..."
                  className="w-full pl-4 pr-12 py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow text-gray-900 placeholder:text-gray-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:hover:bg-violet-600 transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
             </form>
             <p className="text-center text-[10px] text-gray-400 mt-1.5 flex items-center justify-center">
                AI có thể đưa ra câu trả lời không chính xác. Hãy luôn tham khảo bác sĩ khi cần thiết.
             </p>
          </div>
      </div>
    </div>
  );
};
