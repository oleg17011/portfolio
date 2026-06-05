import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2, LayoutGrid, ShieldCheck, User, Globe, Star,
  Upload, FileText, X, Lock, Calendar, ExternalLink,
  ChevronRight, Download, Plus, AlertCircle, CheckCircle2,
  Image as ImageIcon, Loader2, Pencil
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../contexts/LangContext';
import Editor from '@monaco-editor/react'; // Подключение Monaco Editor

const API_BASE = 'http://localhost:5000';

const INPUT_CLS = `
  w-full px-4 py-3 rounded-xl outline-none border transition-all text-sm font-medium
  bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm
  border-slate-200 dark:border-slate-700
  text-slate-800 dark:text-slate-100
  placeholder:text-slate-400 dark:placeholder:text-slate-500
  focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-300 dark:focus:border-indigo-600
`;

const LABEL_CLS = `block text-[10px] font-black uppercase tracking-widest mb-1.5 text-slate-400 dark:text-slate-500`;

const LIST_STAGGER = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.065 } },
};
const ITEM_VARS = {
  hidden:  { opacity: 0, y: 18, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

function getFileType(url = '') {
  const ext = url.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
  if (ext === 'pdf')                                         return 'pdf';
  if (['doc', 'docx'].includes(ext))                        return 'word';
  if (['xls', 'xlsx'].includes(ext))                        return 'excel';
  return 'unknown';
}

function Toggle({ value, onChange, label, icon: Icon, activeColor = 'bg-indigo-500' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-2 select-none cursor-pointer group"
    >
      <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${value ? activeColor : 'bg-slate-200 dark:bg-slate-700'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? 'translate-x-5' : ''}`} />
      </div>
      <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white transition-colors">
        {Icon && <Icon size={12} />}
        {label}
      </span>
    </button>
  );
}

function DocUpload({ file, onChange, label, hint }) {
  const fileRef = useRef(null);
  const ACCEPT  = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.webp';

  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      <div
        onClick={() => fileRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-2.5
          border-2 border-dashed rounded-2xl px-4 py-6 cursor-pointer
          transition-all duration-200 group
          ${file
            ? 'border-indigo-400 bg-indigo-50/60 dark:bg-indigo-900/20'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/30 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'
          }
        `}
      >
        <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={e => onChange(e.target.files?.[0] ?? null)} />
        {file ? (
          <>
            <FileText size={22} className="text-indigo-500" />
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-50">{file.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="absolute top-2 right-2 p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <Upload size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-400 transition-colors" />
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 text-center">{hint}</p>
          </>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3" />
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/3" />
      </div>
      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3800);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.94 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{ opacity: 0, y: 24, scale: 0.94 }}
      transition={{ type: 'spring', damping: 24, stiffness: 360 }}
      className={`
        fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-200
        flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl
        text-sm font-bold whitespace-nowrap select-none
        ${type === 'success'
          ? 'bg-emerald-600 text-white shadow-emerald-200/60 dark:shadow-emerald-900/60'
          : 'bg-red-600 text-white shadow-red-200/60 dark:shadow-red-900/60'
        }
      `}
    >
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X size={13} />
      </button>
    </motion.div>
  );
}

function FilePreview({ url }) {
  const [imgError, setImgError] = useState(false);
  const fullUrl = `${API_BASE}${url}`;
  const type    = getFileType(url);
  const ext     = url.split('.').pop().toUpperCase();

  if (type === 'image') {
    return imgError ? (
      <div className="flex flex-col items-center justify-center gap-3 py-14 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <ImageIcon size={26} className="text-slate-300 dark:text-slate-500" />
        </div>
        <p className="text-sm font-semibold text-slate-400">Изображение недоступно</p>
      </div>
    ) : (
      <img
        src={fullUrl}
        alt="Preview"
        className="w-full h-auto object-contain rounded-xl max-h-120"
        onError={() => setImgError(true)}
      />
    );
  }

  if (type === 'pdf') {
    return (
      <div
        className="w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
        style={{ aspectRatio: '3/4' }}
      >
        <iframe
          src={`${fullUrl}#toolbar=0&navpanes=0`}
          className="w-full h-full border-none"
          title="PDF Preview"
        />
      </div>
    );
  }

  const meta = {
    word:    { icon: '📄', label: 'Word Document',    color: 'text-blue-500'  },
    excel:   { icon: '📊', label: 'Excel Spreadsheet', color: 'text-green-500' },
    unknown: { icon: '📎', label: 'File',              color: 'text-slate-500' },
  }[type] || { icon: '📎', label: 'File', color: 'text-slate-500' };

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-12 px-6 text-center bg-slate-50/80 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center gap-1">
        <span className="text-3xl leading-none">{meta.icon}</span>
        <span className={`text-[9px] font-black uppercase tracking-wider ${meta.color}`}>.{ext}</span>
      </div>
      <div>
        <p className="font-bold text-slate-700 dark:text-slate-200">{meta.label}</p>
        <p className="text-xs text-slate-400 mt-1">Предпросмотр в браузере недоступен<br />для этого формата файла</p>
      </div>
      <a
        href={fullUrl}
        download
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/50 transition-all active:scale-[0.97]"
      >
        <Download size={14} />
        Скачать файл
      </a>
    </div>
  );
}

function ProjectForm({ form, setForm, diplomaFile, setDiplomaFile, onSubmit, isSubmitting, t, editingProject, onCancel }) {
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState('');

  const handleRunCode = async () => {
    if (!form.code?.trim()) {
      setRunOutput('Терминал: Код пуст. Напишите что-нибудь.');
      return;
    }
    setIsRunning(true);
    setRunOutput('Выполнение кода в песочнице...');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/api/projects/run-sandbox`, {
        code: form.code,
        language: form.language
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.stderr) {
        setRunOutput(`[Error Исполнения]:\n${res.data.stderr}`);
      } else {
        setRunOutput(res.data.stdout || '[Программа завершилась без вывода текста]');
      }
    } catch (err) {
      setRunOutput('Ошибка терминала: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className={LABEL_CLS}>{t('field_title')}</label>
        <input
          required
          placeholder={t('field_title')}
          className={INPUT_CLS}
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />
      </div>

      <div>
        <label className={LABEL_CLS}>{t('field_desc')}</label>
        <textarea
          required
          rows={4}
          placeholder={t('field_desc')}
          className={`${INPUT_CLS} resize-none`}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
      </div>

      <div>
        <label className={LABEL_CLS}>{t('field_tech')}</label>
        <input
          placeholder="React, Node.js, MongoDB..."
          className={INPUT_CLS}
          value={form.technologies}
          onChange={e => setForm(f => ({ ...f, technologies: e.target.value }))}
        />
      </div>

      {/* Интегрированная Секция Редактора Кода */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={LABEL_CLS}>Исходный код (Необязательно)</label>
          <select
            value={form.language}
            onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
            className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none text-slate-600 dark:text-slate-300 transition-colors"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="java">Java</option>
          </select>
        </div>
        
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-[#1e1e1e] p-1.5 shadow-inner">
          <Editor
            height="230px"
            language={form.language}
            theme="vs-dark"
            value={form.code}
            onChange={val => setForm(f => ({ ...f, code: val || '' }))}
            options={{
              minimap: { enabled: false },
              fontSize: 12,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="flex gap-2 items-center pt-0.5">
          <button
            type="button"
            disabled={isRunning}
            onClick={handleRunCode}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isRunning ? <Loader2 size={11} className="animate-spin" /> : '▶'} Компилировать и Запустить
          </button>
          {runOutput && (
            <button
              type="button"
              onClick={() => setRunOutput('')}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-red-400 transition-colors"
            >
              Очистить консоль
            </button>
          )}
        </div>

        {runOutput && (
          <pre className="w-full p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-40 border border-slate-800/80 whitespace-pre-wrap shadow-md">
            {runOutput}
          </pre>
        )}
      </div>

      <DocUpload
        file={diplomaFile}
        onChange={setDiplomaFile}
        label={t('field_diploma')}
        hint="PDF, Word, Excel, JPG, PNG"
      />

      <div className="flex flex-wrap gap-5 pt-1">
        <Toggle
          value={form.isPublic}
          onChange={v => setForm(f => ({ ...f, isPublic: v }))}
          label={t('field_public')}
          icon={Globe}
          activeColor="bg-emerald-500"
        />
        <Toggle
          value={form.isFeatured}
          onChange={v => setForm(f => ({ ...f, isFeatured: v }))}
          label={t('field_featured')}
          icon={Star}
          activeColor="bg-amber-400"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-black uppercase text-sm tracking-wide bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 text-white shadow-lg shadow-indigo-200/60 dark:shadow-indigo-900/60 transition-all duration-150"
        >
          {isSubmitting
            ? <><Loader2 size={16} className="animate-spin" /> {t('status_loading')}</>
            : (editingProject ? 'Сохранить изменения' : t('btn_add'))
          }
        </button>

        {editingProject && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold uppercase text-xs hover:bg-slate-200 transition-colors"
          >
            Отмена
          </button>
        )}
      </div>
    </form>
  );
}

const EMPTY_FORM = { title: '', description: '', technologies: '', isPublic: true, isFeatured: false, code: '', language: 'javascript' };

export default function AdminPage({ user }) {
  const [projects,        setProjects]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMobileForm,  setShowMobileForm]  = useState(false);
  const [toast,           setToast]           = useState(null); 
  const [editingProject,  setEditingProject]  = useState(null);

  const navigate  = useNavigate();
  const { t }     = useLang();
  const [form,     setForm]      = useState(EMPTY_FORM);
  const [diplomaFile, setDiplomaFile] = useState(null);

  const showToast = (message, type = 'error') => setToast({ message, type });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res   = await axios.get(`${API_BASE}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
    } catch {
      showToast('Не удалось загрузить проекты', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (e, project) => {
    e.stopPropagation();
    setEditingProject(project);
    
    const rootCode = project.codeFiles && project.codeFiles.length > 0 ? project.codeFiles[0] : null;
    
    setForm({
      title: project.title,
      description: project.description,
      technologies: project.technologies ? project.technologies.join(', ') : '',
      isPublic: project.isPublic,
      isFeatured: project.isFeatured,
      code: rootCode ? rootCode.content : '',
      language: rootCode ? (rootCode.language || 'javascript') : 'javascript'
    });
    setDiplomaFile(null);
    setShowMobileForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const fd    = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('isPublic',    form.isPublic);
      fd.append('isFeatured',  form.isFeatured);
      if (form.technologies.trim()) {
        form.technologies.split(',').map(s => s.trim()).forEach(tech => fd.append('technologies', tech));
      }
      if (diplomaFile) fd.append('diploma', diplomaFile);

      // Запаковываем код в JSON-структуру codeFiles перед отправкой на сервер
      if (form.code?.trim()) {
        const extensionMap = { javascript: 'js', python: 'py', cpp: 'cpp', java: 'java' };
        const ext = extensionMap[form.language] || 'txt';
        const codePayload = [{
          filename: `index.${ext}`,
          content: form.code,
          language: form.language
        }];
        fd.append('codeFiles', JSON.stringify(codePayload));
      } else {
        fd.append('codeFiles', JSON.stringify([]));
      }

      if (editingProject) {
        const res = await axios.put(`${API_BASE}/api/projects/${editingProject._id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setProjects(prev => prev.map(p => p._id === editingProject._id ? res.data : p));
        showToast('Проект обновлен!', 'success');
      } else {
        const res = await axios.post(`${API_BASE}/api/projects`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        setProjects(prev => [res.data, ...prev]);
        showToast('Проект добавлен!', 'success');
      }

      setForm(EMPTY_FORM);
      setDiplomaFile(null);
      setEditingProject(null);
      setShowMobileForm(false);
    } catch {
      showToast('Ошибка сохранения. Попробуйте снова.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProject = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Удалить проект?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(prev => prev.filter(p => p._id !== id));
      if (selectedProject?._id === id) setSelectedProject(null);
      showToast('Проект удалён', 'success');
    } catch {
      showToast('Ошибка удаления', 'error');
    }
  };

  const formProps = { 
    form, 
    setForm, 
    diplomaFile, 
    setDiplomaFile, 
    onSubmit: handleSubmit, 
    isSubmitting, 
    t,
    editingProject,
    onCancel: () => {
      setEditingProject(null);
      setForm(EMPTY_FORM);
      setShowMobileForm(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AnimatePresence>
        {toast && (
          <Toast
            key="toast"
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 lg:pb-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black italic text-slate-900 dark:text-white flex items-center gap-2.5 flex-wrap">
            <ShieldCheck size={28} className="text-indigo-600 shrink-0" />
            {t('admin_title')}
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 ml-10">
            {user?.name || user?.email}
            {isAdmin && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-500 font-black text-[11px] uppercase">
                👑 Admin
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <aside className="hidden lg:block w-full max-w-sm shrink-0">
            <div className="sticky top-24 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-700/50 shadow-xl shadow-slate-100/60 dark:shadow-slate-950/80 p-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
                <Plus size={14} className="text-indigo-500" />
                {editingProject ? 'Редактирование' : t('btn_create')}
              </h2>
              <ProjectForm {...formProps} />
            </div>
          </aside>

          <section className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl sm:text-2xl font-black italic text-slate-800 dark:text-white uppercase">
                {t('your_projects')}
                {' '}
                <span className="text-indigo-500">({projects.length})</span>
              </h2>
            </div>

            {loading && (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            )}

            {!loading && projects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-center mb-5">
                  <LayoutGrid size={30} className="text-indigo-200 dark:text-indigo-700" />
                </div>
                <p className="font-bold text-slate-500 dark:text-slate-400">{t('status_empty')}</p>
                <p className="text-xs text-slate-300 dark:text-slate-600 mt-1.5">
                  Нажмите <span className="lg:hidden">кнопку «+» ниже</span>
                  <span className="hidden lg:inline">на форму слева</span> чтобы добавить первый проект
                </p>
              </motion.div>
            )}

            {!loading && projects.length > 0 && (
              <motion.div
                key="list"
                initial="hidden"
                animate="visible"
                variants={LIST_STAGGER}
                className="space-y-3"
              >
                {projects.map(p => (
                  <motion.div
                    key={p._id}
                    variants={ITEM_VARS}
                    layout
                    layoutId={p._id}
                    onClick={() => setSelectedProject(p)}
                    className={`
                      group flex items-center justify-between gap-4
                      p-4 rounded-2xl border cursor-pointer
                      transition-all duration-200 ease-out
                      ${selectedProject?._id === p._id
                        ? 'border-indigo-400 bg-indigo-50/70 dark:bg-indigo-900/20 shadow-md shadow-indigo-100/50 dark:shadow-indigo-900/30 scale-[1.01]'
                        : 'border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm hover:border-indigo-200 dark:hover:border-indigo-700 hover:shadow-sm hover:scale-[1.005]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-150
                        ${selectedProject?._id === p._id
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300/40 dark:shadow-indigo-900/60'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500'
                        }
                      `}>
                        <LayoutGrid size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-800 dark:text-white truncate">{p.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase flex-wrap">
                          {p.isPublic
                            ? <Globe size={10} className="text-emerald-500 shrink-0" />
                            : <Lock size={10} className="shrink-0" />
                          }
                          <span>{p.isPublic ? 'Public' : 'Private'}</span>
                          <span className="opacity-30">·</span>
                          <Calendar size={10} className="shrink-0" />
                          <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                          {p.isFeatured && (
                            <>
                              <span className="opacity-30">·</span>
                              <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                            </>
                          )}
                          {((p.codeFiles && p.codeFiles.length > 0) || p.diplomaUrl) && (
                            <>
                              <span className="opacity-30">·</span>
                              <FileText size={10} className="text-indigo-400 shrink-0" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={e => startEdit(e, p)}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={e => deleteProject(e, p._id)}
                        className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight
                        size={16}
                        className="text-slate-200 dark:text-slate-700 group-hover:text-indigo-400 dark:group-hover:text-indigo-500 transition-colors"
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </div>
      </div>

      <motion.button
        onClick={() => {
          setEditingProject(null);
          setForm(EMPTY_FORM);
          setShowMobileForm(true);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-20 right-5 z-30 w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-2xl shadow-indigo-300/60 dark:shadow-indigo-900/70 lg:hidden"
        aria-label="Добавить проект"
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      <AnimatePresence>
        {showMobileForm && (
          <>
            <motion.div
              key="sheet-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileForm(false)}
              className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[92dvh] overflow-y-auto bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl lg:hidden"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">
                  {editingProject ? 'Редактирование' : t('btn_create')}
                </h3>
                <button
                  onClick={() => setShowMobileForm(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 pb-10">
                <ProjectForm {...formProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              key="drawer-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />

            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 340 }}
              className="fixed top-0 right-0 h-full w-full sm:max-w-xl bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
            >
              <div className="sticky top-0 z-10 bg-white/92 dark:bg-slate-900/92 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                    <FileText size={17} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Детали проекта
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                  <div className="w-11 h-11 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                    {user?.avatar
                      ? <img src={`${API_BASE}${user.avatar}`} alt="" className="w-full h-full object-cover" />
                      : <User size={20} className="text-indigo-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Автор</p>
                    <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                      {user?.name || user?.username || user?.email || '—'}
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2.5 leading-tight">
                    {selectedProject.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedProject.description}
                  </p>
                </div>

                {selectedProject.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Просмотр Сохранённого Кода в Режиме Read-Only */}
                {selectedProject.codeFiles && selectedProject.codeFiles.length > 0 && selectedProject.codeFiles[0].content && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Исходный код решения ({selectedProject.codeFiles[0].language})
                    </p>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-[#1e1e1e] p-1 shadow-md">
                      <Editor
                        height="220px"
                        language={selectedProject.codeFiles[0].language || 'javascript'}
                        theme="vs-dark"
                        value={selectedProject.codeFiles[0].content}
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 11,
                          scrollBeyondLastLine: false,
                          automaticLayout: true
                        }}
                      />
                    </div>
                  </div>
                )}

                {selectedProject.diplomaUrl && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Файл / Документ
                      </p>
                      <a
                        href={`${API_BASE}${selectedProject.diplomaUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors"
                      >
                        Открыть <ExternalLink size={11} />
                      </a>
                    </div>
                    <FilePreview url={selectedProject.diplomaUrl} />
                  </div>
                )}

                <p className="text-[11px] text-slate-300 dark:text-slate-600 flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Calendar size={11} />
                  Создан:{' '}
                  {new Date(selectedProject.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}