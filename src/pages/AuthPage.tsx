import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLangContext } from '../components/Layout';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const { hasPin, setPin, login } = useAuth();
  const { t } = useLangContext();
  const navigate = useNavigate();

  const [pin, setPin2] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError(t('pin4digits'));
      return;
    }

    if (!hasPin) {
      if (pin !== confirm) {
        setError(t('pinMismatch'));
        return;
      }
      setPin(pin);
      onAuthSuccess();
      navigate('/meetings', { replace: true });
    } else {
      if (!login(pin)) {
        setError(t('pinWrong'));
        return;
      }
      onAuthSuccess();
      navigate('/meetings', { replace: true });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{hasPin ? t('enterPin') : t('setPin')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{hasPin ? t('enterPin') : t('setPin')}</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => setPin2(e.target.value.replace(/\D/g, ''))}
              className="pin-input"
              autoFocus
            />
          </div>
          {!hasPin && (
            <div className="form-group">
              <label>{t('confirmPin')}</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirm}
                onChange={e => setConfirm(e.target.value.replace(/\D/g, ''))}
                className="pin-input"
              />
            </div>
          )}
          {error && <p className="error-msg">{error}</p>}
          <button type="submit" className="btn btn-primary full-width">{t('submit')}</button>
        </form>
      </div>
    </div>
  );
}
