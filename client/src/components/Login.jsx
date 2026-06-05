import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, KeyRound, Mail, ArrowLeft } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

const API = 'http://localhost:5000/api/auth';

export default function Login({ setUser }) {
  const { t } = useLang();
  const navigate = useNavigate();

  
  const [step,     setStep]     = useState('credentials');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [code,     setCode]     = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API}/login`, { email, password });
      
      setStep('twofa');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleVerify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Введите 6-значный код');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${API}/verify-2fa`, { email, code });
      const { token, user } = res.data;

      localStorage.setItem('token',     token);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole',  user.role);

      setUser({ email: user.email, token, role: user.role, name: user.name, avatar: user.avatar });
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный или истёкший код.');
    } finally {
      setLoading(false);
    }
  };

  const InputCls = `
    w-full px-4 py-3 rounded-2xl
    bg-slate-50 dark:bg-slate-800
    border border-slate-200 dark:border-slate-700
    text-slate-800 dark:text-slate-100
    placeholder-slate-400 dark:placeholder-slate-500
    outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-750
    transition-colors text-sm font-medium
  `;

  return (
    <div className="
      min-h-screen flex items-center justify-center
      bg-linear-to-br from-slate-50 via-indigo-50/30 to-slate-50
      dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900
      px-4
    ">
      <div className="w-full max-w-md">
        <div className="
          bg-white dark:bg-slate-900
          rounded-3xl shadow-xl shadow-slate-100 dark:shadow-none
          border border-slate-100 dark:border-slate-800
          p-8 sm:p-10
        ">

          
          {step === 'credentials' && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-7 h-7 text-indigo-500" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {t('nav_login')}
                </h1>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                  {t('field_email')} и {t('field_password').toLowerCase()}
                </p>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email" required
                  placeholder={t('field_email')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={InputCls}
                />

                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required
                    placeholder={t('field_password')}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`${InputCls} pr-11`}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-100 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors">
                  {loading ? t('status_loading') : t('btn_login')}
                </button>
              </form>

              <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-6">
                Нет аккаунта?{' '}
                <Link to="/register" className="text-indigo-500 font-semibold hover:underline">
                  {t('btn_register')}
                </Link>
              </p>
            </>
          )}

          
          {step === 'twofa' && (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-violet-500" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                  {t('twofa_title')}
                </h1>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                  {t('twofa_hint')}
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <Mail size={14} className="text-indigo-400" />
                  <span className="text-sm font-semibold text-indigo-500">{email}</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="_ _ _ _ _ _"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="
                    w-full px-4 py-4 rounded-2xl text-center
                    text-3xl font-black tracking-[0.5em]
                    bg-slate-50 dark:bg-slate-800
                    border border-slate-200 dark:border-slate-700
                    text-slate-800 dark:text-slate-100
                    outline-none focus:border-violet-400
                    transition-colors
                  "
                />

                <button type="submit" disabled={loading || code.length !== 6}
                  className="w-full py-3 rounded-2xl bg-violet-500 hover:bg-violet-600 active:bg-violet-700 text-white font-bold text-sm shadow-lg shadow-violet-100 disabled:bg-slate-300 dark:disabled:bg-slate-700 transition-colors">
                  {loading ? t('status_loading') : t('btn_verify')}
                </button>
              </form>

              <button
                onClick={() => { setStep('credentials'); setCode(''); setError(''); }}
                className="w-full flex items-center justify-center gap-2 mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <ArrowLeft size={14} />
                Назад к вводу пароля
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

