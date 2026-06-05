import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import { ThemeProvider } from './contexts/ThemeContext';
import { LangProvider }  from './contexts/LangContext';

import Navbar     from './components/Navbar';     
import Login      from './components/Login';
import Register   from './components/Register';

import HomePage   from './pages/HomePage';
import AdminPage  from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ user, allowedRoles, children }) {
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function PageWrapper({ children }) {
  const { pathname } = useLocation();
  const noNav = ['/login', '/register'].includes(pathname);

  return (
    <div className={`
      min-h-screen
      bg-[#f8faff] dark:bg-slate-950
      text-slate-900 dark:text-slate-100
      transition-colors duration-300
      ${noNav ? '' : 'pt-16 pb-16 lg:pb-0'}
    `}>
      {children}
    </div>
  );
}

function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token  = localStorage.getItem('token');
    const email  = localStorage.getItem('userEmail');
    const role   = localStorage.getItem('userRole')   || 'user';
    const name   = localStorage.getItem('userName')   || '';
    const avatar = localStorage.getItem('userAvatar') || '';

    if (token && email) {
      const finalRole = email === 'olegb3338@gmail.com' ? 'admin' : role;
      setUser({ email, token, role: finalRole, name, avatar });
    }
  }, []);

  const handleSetUser = (userData) => {
    if (userData.email === 'olegb3338@gmail.com') userData.role = 'admin';
    localStorage.setItem('userRole',   userData.role);
    localStorage.setItem('userName',   userData.name   || '');
    localStorage.setItem('userAvatar', userData.avatar || '');
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <ThemeProvider>
      <LangProvider>
        <PageWrapper>
          
          <Navbar user={user} onLogout={handleLogout} />

          <main className="selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-700">
            <PageTransition>
              <Routes>
                <Route path="/"         element={<HomePage />} />
                <Route path="/login"    element={<Login setUser={handleSetUser} />} />
                <Route path="/register" element={<Register />} />

                <Route path="/profile" element={
                  <ProtectedRoute user={user}>
                    <ProfilePage user={user} setUser={handleSetUser} />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute user={user} allowedRoles={['admin']}>
                    <AdminPage user={user} isAdminMode={true} />
                  </ProtectedRoute>
                } />

                <Route path="/dashboard" element={
                  <ProtectedRoute user={user}>
                    <AdminPage user={user} isAdminMode={false} />
                  </ProtectedRoute>
                } />

                <Route path="*" element={
                  <div className="min-h-screen flex items-center justify-center">
                    <p className="font-black text-slate-200 dark:text-slate-800 text-8xl select-none">404</p>
                  </div>
                } />
              </Routes>
            </PageTransition>
          </main>
        </PageWrapper>
      </LangProvider>
    </ThemeProvider>
  );
}

