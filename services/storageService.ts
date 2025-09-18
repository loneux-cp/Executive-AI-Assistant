import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, CalendarEvent, Email, Document, User, AICommand } from '@/types';

export class StorageService {
  private static async getItem<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Ошибка чтения ${key}:`, error);
      return [];
    }
  }

  private static async setItem<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Ошибка записи ${key}:`, error);
    }
  }

  // Tasks
  static async getTasks(): Promise<Task[]> {
    const tasks = await this.getItem<Task>('tasks');
    return tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt),
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined
    }));
  }

  static async saveTasks(tasks: Task[]): Promise<void> {
    await this.setItem('tasks', tasks);
  }

  // Calendar Events
  static async getCalendarEvents(): Promise<CalendarEvent[]> {
    const events = await this.getItem<CalendarEvent>('calendar_events');
    return events.map(event => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      reminder: event.reminder ? new Date(event.reminder) : undefined
    }));
  }

  static async saveCalendarEvents(events: CalendarEvent[]): Promise<void> {
    await this.setItem('calendar_events', events);
  }

  // Emails
  static async getEmails(): Promise<Email[]> {
    const emails = await this.getItem<Email>('emails');
    return emails.map(email => ({
      ...email,
      receivedAt: new Date(email.receivedAt)
    }));
  }

  static async saveEmails(emails: Email[]): Promise<void> {
    await this.setItem('emails', emails);
  }

  // Documents
  static async getDocuments(): Promise<Document[]> {
    const documents = await this.getItem<Document>('documents');
    return documents.map(doc => ({
      ...doc,
      uploadedAt: new Date(doc.uploadedAt)
    }));
  }

  static async saveDocuments(documents: Document[]): Promise<void> {
    await this.setItem('documents', documents);
  }

  // AI Commands History
  static async getAICommands(): Promise<AICommand[]> {
    const commands = await this.getItem<AICommand>('ai_commands');
    return commands.map(cmd => ({
      ...cmd,
      timestamp: new Date(cmd.timestamp)
    }));
  }

  static async saveAICommands(commands: AICommand[]): Promise<void> {
    await this.setItem('ai_commands', commands);
  }

  // User Profile
  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_profile');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Ошибка чтения профиля пользователя:', error);
      return null;
    }
  }

  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user_profile', JSON.stringify(user));
    } catch (error) {
      console.error('Ошибка сохранения профиля пользователя:', error);
    }
  }
}