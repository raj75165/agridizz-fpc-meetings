import React from 'react';
import { useLangContext } from '../context/LangContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentLang, toggleLang, t } = useLangContext();

  return (
    <div className="app-container">
      <header className="top-nav">
        <span className="app-title">🌾 Agridizz FPC</span>
        <button className="lang-btn" onClick={toggleLang}>
          {currentLang === 'hi' ? 'EN' : 'हि'}
        </button>
      </header>
      <main className="main-content">{children}</main>
      <nav className="bottom-nav">
        <a href="#/members" className="nav-item">
          <span className="nav-icon">👥</span>
          <span>{t('members')}</span>
        </a>
        <a href="#/meetings" className="nav-item">
          <span className="nav-icon">📋</span>
          <span>{t('meetings')}</span>
        </a>
        <a href="#/settings" className="nav-item">
          <span className="nav-icon">⚙️</span>
          <span>{t('settings')}</span>
        </a>
      </nav>
    </div>
  );
}
