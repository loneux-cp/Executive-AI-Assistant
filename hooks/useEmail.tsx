import { useContext } from 'react';
import { EmailContext } from '@/contexts/EmailContext';

export function useEmail() {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within EmailProvider');
  }
  return context;
}