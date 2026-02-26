import { createContext, useContext } from 'react';
import { useLang } from '../hooks/useLang';

export type LangContextType = ReturnType<typeof useLang>;
export const LangContext = createContext<LangContextType | null>(null);

export function useLangContext() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLangContext must be used within LangProvider');
  return ctx;
}
