import { useState, useCallback } from 'react';

const PIN_KEY = 'fpc_pin';
const SESSION_KEY = 'fpc_auth';

function hashPin(pin: string): string {
  return btoa(pin + 'fpc_salt');
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => sessionStorage.getItem(SESSION_KEY) === 'true'
  );

  const hasPin = !!localStorage.getItem(PIN_KEY);

  const setPin = useCallback((pin: string) => {
    localStorage.setItem(PIN_KEY, hashPin(pin));
    sessionStorage.setItem(SESSION_KEY, 'true');
    setIsAuthenticated(true);
  }, []);

  const checkPin = useCallback((pin: string): boolean => {
    const stored = localStorage.getItem(PIN_KEY);
    return stored === hashPin(pin);
  }, []);

  const login = useCallback((pin: string): boolean => {
    if (checkPin(pin)) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [checkPin]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  const changePin = useCallback((oldPin: string, newPin: string): boolean => {
    if (!checkPin(oldPin)) return false;
    localStorage.setItem(PIN_KEY, hashPin(newPin));
    return true;
  }, [checkPin]);

  return { hasPin, isAuthenticated, setPin, checkPin, login, logout, changePin };
}
