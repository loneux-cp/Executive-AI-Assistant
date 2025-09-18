import React, { createContext, ReactNode, useState, useEffect } from 'react';
import { CalendarEvent } from '@/types';
import { StorageService } from '@/services/storageService';

interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  loading: boolean;
}

export const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const savedEvents = await StorageService.getCalendarEvents();
      setEvents(savedEvents);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvents = async (updatedEvents: CalendarEvent[]) => {
    try {
      await StorageService.saveCalendarEvents(updatedEvents);
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Ошибка сохранения событий:', error);
    }
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    const updatedEvents = [...events, newEvent];
    saveEvents(updatedEvents);
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    const updatedEvents = events.map(event => 
      event.id === id ? { ...event, ...updates } : event
    );
    saveEvents(updatedEvents);
  };

  const deleteEvent = (id: string) => {
    const updatedEvents = events.filter(event => event.id !== id);
    saveEvents(updatedEvents);
  };

  return (
    <CalendarContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      loading
    }}>
      {children}
    </CalendarContext.Provider>
  );
}