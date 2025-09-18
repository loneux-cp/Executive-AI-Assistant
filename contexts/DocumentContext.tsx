import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { Document } from '@/types';
import { StorageService } from '@/services/storageService';

interface DocumentContextType {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id' | 'uploadedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  loading: boolean;
}

export const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const savedDocuments = await StorageService.getDocuments();
      setDocuments(savedDocuments);
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDocuments = async (updatedDocuments: Document[]) => {
    try {
      await StorageService.saveDocuments(updatedDocuments);
      setDocuments(updatedDocuments);
    } catch (error) {
      console.error('Ошибка сохранения документов:', error);
    }
  };

  const addDocument = (documentData: Omit<Document, 'id' | 'uploadedAt'>) => {
    const newDocument: Document = {
      ...documentData,
      id: Date.now().toString(),
      uploadedAt: new Date(),
    };
    const updatedDocuments = [...documents, newDocument];
    saveDocuments(updatedDocuments);
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    const updatedDocuments = documents.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    );
    saveDocuments(updatedDocuments);
  };

  const deleteDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    saveDocuments(updatedDocuments);
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      addDocument,
      updateDocument,
      deleteDocument,
      loading
    }}>
      {children}
    </DocumentContext.Provider>
  );
}