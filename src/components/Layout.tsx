import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLangContext } from '../context/LangContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { currentLang, toggleLang, t } = useLangContext();

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `nav-item${isActive ? ' active' : ''}`;

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
        <NavLink to="/members" className={navClass}>
          <span className="nav-icon">👥</span>
          <span>{t('members')}</span>
        </NavLink>
        <NavLink to="/meetings" className={navClass}>
          <span className="nav-icon">📋</span>
          <span>{t('meetings')}</span>
        </NavLink>
        <NavLink to="/settings" className={navClass}>
          <span className="nav-icon">⚙️</span>
          <span>{t('settings')}</span>
        </NavLink>
      </nav>
    </div>
  );
}
