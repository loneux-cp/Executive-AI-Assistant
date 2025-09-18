import { Task, CalendarEvent, Email, Document, AICommand } from '@/types';

export class AIService {
  private static mockResponses = {
    greeting: [
      'Добро пожаловать! Я ваш личный помощник. Чем могу помочь?',
      'Здравствуйте! Готов выполнить ваши задачи.',
      'Привет! Что будем делать сегодня?'
    ],
    taskCreate: [
      'Задача создана успешно!',
      'Добавил новую задачу в ваш список.',
      'Задача сохранена. Не забудьте её выполнить!'
    ],
    eventCreate: [
      'Событие добавлено в календарь.',
      'Напоминание установлено!',
      'Встреча запланирована успешно.'
    ],
    documentSummary: [
      'Документ проанализирован. Вот краткое содержание:',
      'Основные тезисы документа:',
      'Анализ завершён. Ключевые моменты:'
    ]
  };

  static async processCommand(command: string): Promise<string> {
    const lowercaseCommand = command.toLowerCase();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Parse different command types
    if (this.isGreeting(lowercaseCommand)) {
      return this.getRandomResponse('greeting');
    }

    if (this.isTaskCommand(lowercaseCommand)) {
      return this.getRandomResponse('taskCreate');
    }

    if (this.isCalendarCommand(lowercaseCommand)) {
      return this.getRandomResponse('eventCreate');
    }

    if (this.isDocumentCommand(lowercaseCommand)) {
      return this.getRandomResponse('documentSummary');
    }

    // Default response
    return 'Понял ваш запрос. В MVP версии доступны базовые функции: создание задач, планирование встреч и анализ документов. Что конкретно вы хотели бы сделать?';
  }

  private static isGreeting(command: string): boolean {
    const greetings = ['привет', 'здравствуй', 'добро пожаловать', 'hello', 'hi'];
    return greetings.some(greeting => command.includes(greeting));
  }

  private static isTaskCommand(command: string): boolean {
    const taskKeywords = ['создай задачу', 'добавь задачу', 'новая задача', 'task', 'задание'];
    return taskKeywords.some(keyword => command.includes(keyword));
  }

  private static isCalendarCommand(command: string): boolean {
    const calendarKeywords = ['создай встречу', 'добавь событие', 'запланируй', 'календарь', 'напоминание'];
    return calendarKeywords.some(keyword => command.includes(keyword));
  }

  private static isDocumentCommand(command: string): boolean {
    const docKeywords = ['анализ', 'резюме', 'документ', 'прочитай', 'summarize'];
    return docKeywords.some(keyword => command.includes(keyword));
  }

  private static getRandomResponse(type: keyof typeof AIService.mockResponses): string {
    const responses = this.mockResponses[type];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  static async analyzeDocument(document: Document): Promise<string> {
    // Simulate document analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return `Документ "${document.name}" проанализирован:\n\n• Тип: ${document.type.toUpperCase()}\n• Размер: ${(document.size / 1024).toFixed(1)} KB\n• Основное содержание: MVP версия поддерживает базовый анализ структуры документа\n• Рекомендации: Для полного анализа подключите внешние AI сервисы`;
  }
}