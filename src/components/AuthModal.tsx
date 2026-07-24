import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { 
  signInWithGoogle, 
  signInWithEmail, 
  signUpWithEmail, 
  resetPassword 
} from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setMessage(null);
    setLoading(false);
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setMessage(null);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Lỗi đăng nhập bằng Google.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        if (!email || !password) {
          throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
        }
        await signInWithEmail(email, password);
        setMessage({ type: 'success', text: 'Đăng nhập thành công!' });
        setTimeout(() => {
          onClose();
          resetForm();
        }, 500);
      } else if (mode === 'register') {
        if (!email || !password || !displayName) {
          throw new Error('Vui lòng nhập Tên hiển thị, Email và Mật khẩu (tối thiểu 6 ký tự).');
        }
        if (password.length < 6) {
          throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
        }
        await signUpWithEmail(email, password, displayName);
        setMessage({ type: 'success', text: 'Tạo tài khoản thành công! Đã đăng nhập.' });
        setTimeout(() => {
          onClose();
          resetForm();
        }, 800);
      } else if (mode === 'forgot') {
        if (!email) {
          throw new Error('Vui lòng nhập Email để nhận liên kết khôi phục mật khẩu.');
        }
        await resetPassword(email);
        setMessage({ type: 'success', text: 'Đã gửi email khôi phục mật khẩu! Vui lòng kiểm tra hộp thư của bạn.' });
      }
    } catch (err: any) {
      let errText = err?.message || 'Có lỗi xảy ra.';
      if (errText.includes('auth/email-already-in-use')) {
        errText = 'Email này đã được đăng ký tài khoản khác.';
      } else if (errText.includes('auth/wrong-password') || errText.includes('auth/invalid-credential')) {
        errText = 'Mật khẩu hoặc Email không chính xác.';
      } else if (errText.includes('auth/user-not-found')) {
        errText = 'Không tìm thấy tài khoản với Email này.';
      } else if (errText.includes('auth/weak-password')) {
        errText = 'Mật khẩu quá yếu (tối thiểu 6 ký tự).';
      } else if (errText.includes('auth/invalid-email')) {
        errText = 'Định dạng Email không hợp lệ.';
      }
      setMessage({ type: 'error', text: errText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden transition-all">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-5 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <h2 className="text-xl font-extrabold tracking-tight">
            {mode === 'login' && 'Đăng Nhập Tài Khoản'}
            {mode === 'register' && 'Tạo Tài Khoản Mới'}
            {mode === 'forgot' && 'Khôi Phục Mật Khẩu'}
          </h2>
          <p className="text-xs text-rose-100 mt-1 font-medium">
            {mode === 'login' && 'Đăng nhập để đồng bộ dữ liệu nuôi con & sao lưu Google Drive'}
            {mode === 'register' && 'Tạo tài khoản cá nhân lưu giữ kỷ niệm bé khôn lớn'}
            {mode === 'forgot' && 'Nhập email để nhận liên kết đặt lại mật khẩu'}
          </p>
        </div>

        <div className="p-6 space-y-5">

          {/* Quick Google Sign In */}
          {mode !== 'forgot' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-50 border-2 border-gray-200 hover:border-rose-300 text-gray-800 font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-3 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Đăng nhập nhanh bằng Google</span>
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-3 text-[11px] font-bold text-gray-400 uppercase">Hoặc dùng Email</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
            </div>
          )}

          {/* Alert Message */}
          {message && (
            <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center space-x-2 animate-fade-in ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Display Name (Register Mode Only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tên của bạn / Tên bố mẹ:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Mẹ Mèo, Bố Pum"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Địa chỉ Email:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-700">Mật khẩu:</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('forgot')}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <span>
                {loading ? 'Đang xử lý...' : (
                  mode === 'login' ? 'Đăng Nhập' : mode === 'register' ? 'Tạo Tài Khoản Mới' : 'Gửi Email Khôi Phục'
                )}
              </span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Switch Mode Links */}
          <div className="pt-2 text-center text-xs font-medium text-gray-600 border-t border-gray-100">
            {mode === 'login' && (
              <p>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="font-extrabold text-rose-600 hover:underline cursor-pointer"
                >
                  Tạo tài khoản mới ngay
                </button>
              </p>
            )}
            {mode === 'register' && (
              <p>
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-extrabold text-rose-600 hover:underline cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p>
                Quay lại{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-extrabold text-rose-600 hover:underline cursor-pointer"
                >
                  Đăng nhập
                </button>
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
