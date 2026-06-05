import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Camera, Save, User, BookOpen, Hash, CheckCircle } from 'lucide-react';
import { useLang } from '../contexts/LangContext';

const API = 'http://localhost:5000';

export default function ProfilePage({ user, setUser }) {
  const { t } = useLang();
  const fileRef = useRef(null);

  const [form,     setForm]     = useState({ name: '', group: '', iin: '' });
  const [preview,  setPreview]  = useState('');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${API}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const { name, group, iin, avatar } = res.data;
        setForm({ name: name || '', group: group || '', iin: iin || '' });
        if (avatar) setPreview(`${API}${avatar}`);
      })
      .catch(() => setError('Не удалось загрузить профиль'))
      .finally(() => setLoading(false));
  }, []);

  
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API}/api/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(prev => ({ ...prev, name: res.data.user.name }));
      setSuccess('Профиль успешно сохранён!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await axios.post(`${API}/api/profile/avatar`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setPreview(`${API}${res.data.avatar}`);
      setUser(prev => ({ ...prev, avatar: res.data.avatar }));
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки фото');
    } finally {
      setUploading(false);
    }
  };

  const InputCls = `
    w-full px-4 py-3 rounded-2xl
    bg-slate-50 dark:bg-slate-800
    border border-slate-200 dark:border-slate-700
    text-slate-800 dark:text-slate-100
    placeholder-slate-400 dark:placeholder-slate-500
    outline-none focus:border-indigo-400 dark:focus:border-indigo-500
    transition-colors text-sm font-medium
  `;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-300 dark:text-slate-600 text-2xl font-black animate-pulse">
        {t('status_loading')}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-8 uppercase italic tracking-tighter">
        {t('profile_title')}
      </h1>

      
      <div className="flex flex-col items-center mb-10">
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl overflow-hidden bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-100 dark:border-indigo-800">
            {preview ? (
              <img src={preview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={40} className="text-indigo-300" />
              </div>
            )}
          </div>

          
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="
              absolute -bottom-2 -right-2
              w-10 h-10 rounded-full
              bg-indigo-500 hover:bg-indigo-600
              text-white shadow-lg
              flex items-center justify-center
              transition-colors disabled:bg-slate-300
            "
          >
            <Camera size={16} />
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {uploading && (
          <p className="text-sm text-indigo-500 font-semibold mt-3 animate-pulse">
            Загружаем фото...
          </p>
        )}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
          JPEG, PNG или WebP · до 3 МБ
        </p>
      </div>

      
      {error && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      
      <form onSubmit={handleSave} className="space-y-5">

        
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <User size={12} />
            {t('field_name')}
          </label>
          <input
            type="text"
            placeholder={t('field_name')}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className={InputCls}
          />
        </div>

        
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <BookOpen size={12} />
            {t('field_group')}
          </label>
          <input
            type="text"
            placeholder="ПО 22-4"
            value={form.group}
            onChange={e => setForm({ ...form, group: e.target.value })}
            className={InputCls}
          />
        </div>

        
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <Hash size={12} />
            {t('field_iin')}
          </label>
          <input
            type="text"
            placeholder="123456789012"
            maxLength={12}
            value={form.iin}
            onChange={e => setForm({ ...form, iin: e.target.value.replace(/\D/g, '').slice(0, 12) })}
            className={InputCls}
          />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            12 цифр без пробелов
          </p>
        </div>

        
        <div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            {t('field_email')} (только чтение)
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className={`${InputCls} opacity-50 cursor-not-allowed`}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="
            w-full py-4 rounded-2xl
            bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700
            dark:bg-indigo-600 dark:hover:bg-indigo-700
            text-white font-black uppercase tracking-widest text-sm
            shadow-lg shadow-indigo-100 dark:shadow-none
            disabled:bg-slate-300 dark:disabled:bg-slate-700
            transition-all active:scale-[0.99]
            flex items-center justify-center gap-2
          "
        >
          <Save size={16} />
          {saving ? t('status_loading') : t('btn_save')}
        </button>
      </form>
    </div>
  );
}

