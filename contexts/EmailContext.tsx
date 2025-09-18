import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { Email } from '@/types';
import { StorageService } from '@/services/storageService';

interface EmailContextType {
  emails: Email[];
  addEmail: (email: Omit<Email, 'id' | 'receivedAt'>) => void;
  markAsRead: (id: string) => void;
  toggleStar: (id: string) => void;
  deleteEmail: (id: string) => void;
  loading: boolean;
  unreadCount: number;
}

export const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmails();
  }, []);

  const loadEmails = async () => {
    try {
      const savedEmails = await StorageService.getEmails();
      // Add mock emails if none exist
      if (savedEmails.length === 0) {
        const mockEmails = generateMockEmails();
        await StorageService.saveEmails(mockEmails);
        setEmails(mockEmails);
      } else {
        setEmails(savedEmails);
      }
    } catch (error) {
      console.error('Ошибка загрузки писем:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEmails = async (updatedEmails: Email[]) => {
    try {
      await StorageService.saveEmails(updatedEmails);
      setEmails(updatedEmails);
    } catch (error) {
      console.error('Ошибка сохранения писем:', error);
    }
  };

  const addEmail = (emailData: Omit<Email, 'id' | 'receivedAt'>) => {
    const newEmail: Email = {
      ...emailData,
      id: Date.now().toString(),
      receivedAt: new Date(),
    };
    const updatedEmails = [newEmail, ...emails];
    saveEmails(updatedEmails);
  };

  const markAsRead = (id: string) => {
    const updatedEmails = emails.map(email => 
      email.id === id ? { ...email, isRead: true } : email
    );
    saveEmails(updatedEmails);
  };

  const toggleStar = (id: string) => {
    const updatedEmails = emails.map(email => 
      email.id === id ? { ...email, isStarred: !email.isStarred } : email
    );
    saveEmails(updatedEmails);
  };

  const deleteEmail = (id: string) => {
    const updatedEmails = emails.filter(email => email.id !== id);
    saveEmails(updatedEmails);
  };

  const unreadCount = emails.filter(email => !email.isRead).length;

  return (
    <EmailContext.Provider value={{
      emails,
      addEmail,
      markAsRead,
      toggleStar,
      deleteEmail,
      loading,
      unreadCount
    }}>
      {children}
    </EmailContext.Provider>
  );
}

function generateMockEmails(): Email[] {
  const mockEmails: Email[] = [
    {
      id: '1',
      from: 'partner@company.ru',
      to: 'user@example.com',
      subject: 'Предложение о сотрудничестве',
      body: 'Добрый день! Рассматриваем возможность партнерства с вашей компанией...',
      isRead: false,
      receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isStarred: true
    },
    {
      id: '2',
      from: 'support@service.ru',
      to: 'user@example.com',
      subject: 'Подтверждение заказа №12345',
      body: 'Ваш заказ успешно оформлен и находится в обработке...',
      isRead: true,
      receivedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isStarred: false
    },
    {
      id: '3',
      from: 'newsletter@tech.ru',
      to: 'user@example.com',
      subject: 'Еженедельный дайджест технологий',
      body: 'Главные новости технологической сферы за прошедшую неделю...',
      isRead: false,
      receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isStarred: false
    }
  ];
  return mockEmails;
}