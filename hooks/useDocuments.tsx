import { useContext } from 'react';
import { DocumentContext } from '@/contexts/DocumentContext';

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within DocumentProvider');
  }
  return context;
}