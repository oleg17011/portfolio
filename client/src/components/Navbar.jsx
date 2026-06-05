import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, User, Shield, LayoutDashboard,
  Globe, LogOut, LogIn, UserPlus,
  Menu, X, ChevronRight,
} from 'lucide-react';
import { useLang } from '../contexts/LangContext';

const API_BASE = 'http://localhost:5000';

export default function Navbar({ user, onLogout }) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const location                  = useLocation();
  const navigate                  = useNavigate();
  const { lang, toggleLang, t }   = useLang();

  
  if (['/login', '/register'].includes(location.pathname)) return null;

  
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const panelPath = user?.role === 'admin' ? '/admin' : '/dashboard';
  const PanelIcon = user?.role === 'admin' ? Shield : LayoutDashboard;

  const navLinks = [
    { to: '/', icon: Home, label: t('nav_home') },
    ...(user
      ? [
          { to: panelPath, icon: PanelIcon, label: t('nav_panel') },
          { to: '/profile', icon: User,      label: t('nav_profile') },
        ]
      : [
          { to: '/login',    icon: LogIn,    label: t('nav_login')    },
          { to: '/register', icon: UserPlus, label: t('nav_register') },
        ]
    ),
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const langFlag = { ru: '🇷🇺', en: '🇬🇧', kk: '🇰🇿' }[lang] ?? '🌐';

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  
  const OVERLAY_VARIANTS = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.055 } },
  };
  const LINK_VARIANTS = {
    hidden:  { opacity: 0, x: -18 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <>
      
      <header
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300
          ${scrolled
            ? 'bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-b border-white/50 dark:border-slate-700/50 shadow-sm shadow-slate-200/40 dark:shadow-slate-950/60'
            : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/30 dark:border-slate-800/40'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-300/40 dark:shadow-indigo-900/60 group-hover:shadow-lg group-hover:shadow-indigo-300/50 transition-shadow">
              <span className="text-white text-sm font-black select-none">P</span>
            </div>
            <span className="text-lg font-black italic bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
              Portfolio
            </span>
          </Link>

          
          <nav className="hidden lg:flex items-center gap-1 bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl px-2 py-1.5 border border-slate-100 dark:border-slate-700/50 backdrop-blur-sm">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150
                  ${isActive(to)
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-700/50'
                  }
                `}
              >
                <Icon size={15} strokeWidth={isActive(to) ? 2.5 : 2} />
                {label}
              </Link>
            ))}
          </nav>

          
          <div className="flex items-center gap-2">

            
            <button
              onClick={toggleLang}
              title="Change language"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              <Globe size={15} className="text-emerald-500" />
              <span className="text-xs">{langFlag}</span>
            </button>

            
            {user && (
              <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-3 py-1.5 shadow-sm">
                
                <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-700">
                  {user.avatar
                    ? <img src={`${API_BASE}${user.avatar}`} alt="" className="w-full h-full object-cover" />
                    : <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300 uppercase">{user.email?.[0]}</span>
                  }
                </div>
                <div className="leading-tight">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-27.5">
                    {user.name || user.email}
                  </p>
                  <p className={`text-[9px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'text-amber-500' : 'text-indigo-400'}`}>
                    {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title={t('nav_logout')}
                  className="ml-1 p-1.5 rounded-lg text-slate-300 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}

            
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              className="lg:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen
                  ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.14 }} className="block"><X size={21} /></motion.span>
                  : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.14 }} className="block"><Menu size={21} /></motion.span>
                }
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      
      <AnimatePresence>
        {menuOpen && (
          <>
            
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            />

            
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed top-16 left-0 right-0 z-50 lg:hidden bg-white/96 dark:bg-slate-900/96 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-300/30 dark:shadow-slate-950/80"
            >
              
              <motion.nav
                variants={OVERLAY_VARIANTS}
                initial="hidden"
                animate="visible"
                className="px-4 pt-4 pb-2 space-y-1"
              >
                {navLinks.map(({ to, icon: Icon, label }) => (
                  <motion.div key={to} variants={LINK_VARIANTS}>
                    <Link
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className={`
                        flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all
                        ${isActive(to)
                          ? 'bg-indigo-50 dark:bg-indigo-900/25 text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }
                      `}
                    >
                      <span className="flex items-center gap-3">
                        <Icon size={18} strokeWidth={isActive(to) ? 2.5 : 2} />
                        {label}
                      </span>
                      <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                    </Link>
                  </motion.div>
                ))}
              </motion.nav>

              
              <div className="px-4 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                {user ? (
                  <>
                    
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-indigo-100 dark:ring-indigo-800">
                      {user.avatar
                        ? <img src={`${API_BASE}${user.avatar}`} alt="" className="w-full h-full object-cover" />
                        : <span className="text-sm font-black text-indigo-600 dark:text-indigo-300 uppercase">{user.email?.[0]}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name || user.email}</p>
                      <p className={`text-[10px] font-black uppercase ${user.role === 'admin' ? 'text-amber-500' : 'text-indigo-400'}`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </p>
                    </div>
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors shrink-0"
                    >
                      <LogOut size={13} />
                      {t('nav_logout')}
                    </button>
                  </>
                ) : (
                  <div className="flex-1" />
                )}

                
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <Globe size={13} />
                  {langFlag}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/92 dark:bg-slate-900/92 backdrop-blur-2xl border-t border-slate-100/80 dark:border-slate-800/80 safe-area-pb">
        <div className="grid h-16" style={{ gridTemplateColumns: `repeat(${navLinks.length + 1}, 1fr)` }}>
          {navLinks.map(({ to, icon: Icon, label }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center justify-center gap-0.5 transition-colors"
              >
                <div className={`p-1.5 rounded-xl transition-all duration-150 ${active ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''}`}>
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}
                  />
                </div>
                <span className={`text-[9px] font-bold truncate ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {label}
                </span>
              </Link>
            );
          })}

          
          <button
            onClick={toggleLang}
            className="flex flex-col items-center justify-center gap-0.5 text-slate-400 dark:text-slate-500"
          >
            <Globe size={20} strokeWidth={1.8} className="text-emerald-500" />
            <span className="text-[9px] font-bold">{langFlag}</span>
          </button>
        </div>
      </nav>
    </>
  );
}

