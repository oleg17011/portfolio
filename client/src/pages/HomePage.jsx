import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Code2,
  ExternalLink,
  FileText,
  Star,
  Layers,
  AlertCircle,
  RefreshCw,
  Boxes,
  ChevronRight,
  Globe,
  Download
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';

const API = 'http://localhost:5000';

const FADE_UP = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden border border-white/60 bg-white/70 backdrop-blur-md shadow-sm animate-pulse">
    <div className="aspect-video bg-slate-200/80" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-slate-200 rounded-lg w-3/4" />
      <div className="h-3 bg-slate-100 rounded-lg w-full" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-16 bg-slate-100 rounded-full" />
        <div className="h-6 w-12 bg-slate-100 rounded-full" />
      </div>
    </div>
  </div>
);

const ProjectCard = ({ project, index }) => {
  const shouldReduceMotion = useReducedMotion();
  const [imgError, setImgError] = useState(false);

  const imageUrl = project.imageUrl
    ? project.imageUrl.startsWith('http')
      ? project.imageUrl
      : `${API}${project.imageUrl}`
    : null;

  return (
    <motion.article
      variants={FADE_UP}
      custom={index}
      className="group flex flex-col rounded-2xl overflow-hidden border border-white/70 bg-white/80 backdrop-blur-md shadow-sm hover:shadow-xl hover:shadow-indigo-100/70 transition-all duration-300"
      whileHover={shouldReduceMotion ? {} : { y: -5 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
    >
      <div className="relative aspect-video overflow-hidden bg-linear-to-br from-indigo-50 to-slate-100">
        {imageUrl && !imgError ? (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <img
              src={imageUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </a>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-indigo-200">
            <Boxes className="w-10 h-10" strokeWidth={1.2} />
            <span className="text-xs text-slate-300 font-medium">Нет изображения</span>
          </div>
        )}

        {project.isFeatured && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-amber-400/90 backdrop-blur-sm text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            <Star className="w-3 h-3 fill-amber-700" />
            Избранное
          </span>
        )}

        {project.isPublic && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-emerald-400/80 backdrop-blur-sm text-emerald-900 text-xs font-semibold px-2 py-0.5 rounded-full">
            <Globe className="w-3 h-3" />
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-white/30 to-transparent" />
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-base font-semibold text-slate-800 leading-snug line-clamp-2">
          {project.title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed flex-1 line-clamp-3">
          {project.description}
        </p>

        {project.technologies?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {project.technologies.map((tech, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 font-medium px-2.5 py-1 rounded-full border border-indigo-100">
                <Code2 className="w-3 h-3" />
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.diplomaUrl && (() => {
          const fileUrl = project.diplomaUrl.startsWith('http') ? project.diplomaUrl : `${API}${project.diplomaUrl}`;
          const ext = project.diplomaUrl.split('.').pop().toLowerCase();
          const isViewable = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);

          return (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={!isViewable ? true : undefined}
              className="inline-flex items-center gap-1.5 w-fit text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors duration-150 mt-auto pt-1"
            >
              {isViewable ? <FileText className="w-4 h-4 shrink-0" /> : <Download className="w-4 h-4 shrink-0" />}
              {isViewable ? `Открыть (.${ext})` : `Скачать (.${ext})`}
              {isViewable && <ExternalLink className="w-3.5 h-3.5 opacity-60" />}
            </a>
          );
        })()}
      </div>
    </motion.article>
  );
};

const Hero = ({ count }) => {
  const { t } = useLang();
  return (
    <section className="relative pt-14 pb-6 px-4 sm:pt-20 sm:pb-8 text-center overflow-hidden">
      <div aria-hidden className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full opacity-25 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute -bottom-32 -left-32 w-80 h-80 bg-violet-200 rounded-full opacity-20 blur-3xl pointer-events-none" />
      <div aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-75 bg-sky-100 rounded-full opacity-20 blur-3xl pointer-events-none" />

      <motion.div initial="hidden" animate="visible" variants={STAGGER} className="relative z-10 max-w-2xl mx-auto">
        <motion.span variants={FADE_UP} className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold tracking-widest text-indigo-500 uppercase mb-5 bg-white border border-indigo-100 shadow-sm px-4 py-1.5 rounded-full">
          <Layers className="w-3.5 h-3.5" />
          Full-Stack Developer · MERN Stack
        </motion.span>

        <motion.h1 variants={FADE_UP} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] mb-4">
          {t('home_title') || 'Мое Портфолио'}
        </motion.h1>

        <motion.p variants={FADE_UP} className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
          {t('home_subtitle') || 'Академические и профессиональные проекты'}
        </motion.p>

        {count > 0 && (
          <motion.a variants={FADE_UP} href="#projects" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-lg shadow-indigo-200/60 transition-colors duration-150">
            {t('all_projects') || 'Все проекты'}
            <ChevronRight className="w-4 h-4" />
          </motion.a>
        )}
      </motion.div>
    </section>
  );
};

const ErrorState = ({ onRetry }) => (
  <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4 text-center py-20 px-6 max-w-sm mx-auto">
    <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
      <AlertCircle className="w-7 h-7 text-red-400" />
    </div>
    <p className="text-base font-semibold text-slate-700">Не удалось загрузить проекты</p>
    <p className="text-sm text-slate-400">Убедитесь, что сервер запущен на localhost:5000</p>
    <button onClick={onRetry} className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors duration-150">
      <RefreshCw className="w-4 h-4" /> Попробовать снова
    </button>
  </motion.div>
);

const EmptyState = () => {
  const { t } = useLang();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-24 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-2">
        <Boxes className="w-10 h-10 text-indigo-200" strokeWidth={1} />
      </div>
      <p className="text-lg font-semibold text-slate-500">{t('status_empty') || 'Проектов пока нет'}</p>
    </motion.div>
  );
};

function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tick, setTick]         = useState(0);
  const { t } = useLang();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.get('http://localhost:5000/api/projects', { headers })
      .then(res => { if (!cancelled) setProjects(res.data); })
      .catch(() => { if (!cancelled) setError('Ошибка загрузки.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(ellipse_at_top,#e0e7ff_0%,transparent_55%)]">
      <Hero count={projects.length} />

      <section id="projects" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {!error && !loading && projects.length > 0 && (
          <div className="flex items-center justify-center mb-8">
            <h2 className="text-xl font-bold text-slate-800">
              {t('all_projects') || 'Все проекты'}
            </h2>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="skeletons" exit={{ opacity: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </motion.div>
          )}
          {!loading && error  && <ErrorState key="error" onRetry={() => setTick(t => t + 1)} />}
          {!loading && !error && projects.length === 0 && <EmptyState key="empty" />}
          {!loading && !error && projects.length > 0 && (
            <motion.div key="cards" initial="hidden" animate="visible" variants={STAGGER} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, i) => (
                <ProjectCard key={project._id} project={project} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}

export default HomePage;

