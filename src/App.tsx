import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LangContext } from './context/LangContext';
import Layout from './components/Layout';
import { useLang } from './hooks/useLang';
import { useAuth } from './hooks/useAuth';

import AuthPage from './pages/AuthPage';
import MembersPage from './pages/MembersPage';
import MeetingsPage from './pages/MeetingsPage';
import MeetingDetailPage from './pages/MeetingDetailPage';
import ResolutionsPage from './pages/ResolutionsPage';
import SignaturesPage from './pages/SignaturesPage';
import AudioPage from './pages/AudioPage';
import SettingsPage from './pages/SettingsPage';

function AppInner() {
  const lang = useLang();
  const { isAuthenticated } = useAuth();
  const [authed, setAuthed] = useState(isAuthenticated);

  const requireAuth = (element: React.ReactElement) => {
    return authed ? element : <Navigate to="/auth" replace />;
  };

  return (
    <LangContext.Provider value={lang}>
      <HashRouter>
        <Routes>
          <Route path="/auth" element={<Layout><AuthPage onAuthSuccess={() => setAuthed(true)} /></Layout>} />
          <Route path="/members" element={requireAuth(<Layout><MembersPage /></Layout>)} />
          <Route path="/meetings" element={requireAuth(<Layout><MeetingsPage /></Layout>)} />
          <Route path="/meetings/:id" element={requireAuth(<Layout><MeetingDetailPage /></Layout>)} />
          <Route path="/meetings/:id/resolutions" element={requireAuth(<Layout><ResolutionsPage /></Layout>)} />
          <Route path="/meetings/:id/signatures" element={requireAuth(<Layout><SignaturesPage /></Layout>)} />
          <Route path="/meetings/:id/audio" element={requireAuth(<Layout><AudioPage /></Layout>)} />
          <Route path="/settings" element={requireAuth(<Layout><SettingsPage /></Layout>)} />
          <Route path="*" element={<Navigate to={authed ? '/meetings' : '/auth'} replace />} />
        </Routes>
      </HashRouter>
    </LangContext.Provider>
  );
}

export default function App() {
  return <AppInner />;
}
