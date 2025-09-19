import { Task, CalendarEvent, Email, Document } from '@/types';

interface AIContext {
  currentTasks: Task[];
  upcomingEvents: CalendarEvent[];
  unreadEmails: Email[];
  recentDocuments: Document[];
}

export class AIService {
  private static mockResponses = {
    greeting: [
      'Добро пожаловать! Я ваш персональный AI-помощник. Готов помочь с задачами, календарем и документами.',
      'Здравствуйте! Анализирую ваше расписание и готов предложить оптимизации.',
      'Привет! Вижу у вас {taskCount} активных задач и {eventCount} событий сегодня. Чем помочь?'
    ],
    taskAnalysis: [
      'Анализирую ваши задачи... У вас {highPriorityCount} высокоприоритетных задач. Рекомендую начать с "{firstTask}".',
      'Обратил внимание: у вас {overdueCount} просроченных задач. Стоит пересмотреть приоритеты.',
      'Хорошая новость: вы выполнили {completedToday} задач сегодня! Продуктивный день!'
    ],
    scheduleOptimization: [
      'Анализирую ваше расписание... Вижу свободное окно {timeSlot}. Можно запланировать "{suggestedTask}".',
      'Внимание: у вас плотный день с {eventCount} встречами. Рекомендую перенести менее важные дела.',
      'Оптимальное время для фокусной работы: {focusTime}. Запланировать задачу "{taskName}"?'
    ],
    emailAssistance: [
      'Помогу составить письмо. Какой тон предпочитаете: деловой, дружелюбный или формальный?',
      'Анализирую контекст переписки... Предлагаю начать с: "{suggestedStart}"',
      'У вас {unreadCount} непрочитанных писем. Самое важное от {importantSender}.'
    ],
    documentInsights: [
      'Документ "{docName}" содержит {keyPoints} ключевых пунктов. Создать задачи на основе содержания?',
      'Обнаружил в документе важные даты: {dates}. Добавить в календарь?',
      'Резюме готово: {summary}. Сохранить основные тезисы как заметки?'
    ]
  };

  static async processCommand(command: string, context?: AIContext): Promise<string> {
    const lowercaseCommand = command.toLowerCase();
    
    // Имитация обработки
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Контекстный анализ
    if (context) {
      if (this.isScheduleQuery(lowercaseCommand)) {
        return this.generateScheduleAdvice(context);
      }
      
      if (this.isProductivityQuery(lowercaseCommand)) {
        return this.generateProductivityInsights(context);
      }
    }

    // Обработка различных типов команд
    if (this.isGreeting(lowercaseCommand)) {
      return this.getContextualResponse('greeting', context);
    }

    if (this.isTaskCommand(lowercaseCommand)) {
      return this.processTaskCommand(command, context);
    }

    if (this.isCalendarCommand(lowercaseCommand)) {
      return this.processCalendarCommand(command, context);
    }

    if (this.isEmailCommand(lowercaseCommand)) {
      return this.processEmailCommand(command, context);
    }

    if (this.isDocumentCommand(lowercaseCommand)) {
      return this.processDocumentCommand(command, context);
    }

    // Интеллектуальный ответ по умолчанию
    return this.generateSmartResponse(command, context);
  }

  private static isScheduleQuery(command: string): boolean {
    const scheduleKeywords = ['расписание', 'план', 'свободное время', 'когда', 'schedule'];
    return scheduleKeywords.some(keyword => command.includes(keyword));
  }

  private static isProductivityQuery(command: string): boolean {
    const productivityKeywords = ['продуктивность', 'эффективность', 'статистика', 'прогресс'];
    return productivityKeywords.some(keyword => command.includes(keyword));
  }

  private static isGreeting(command: string): boolean {
    const greetings = ['привет', 'здравствуй', 'добро пожаловать', 'hello', 'hi', 'помощь'];
    return greetings.some(greeting => command.includes(greeting));
  }

  private static isTaskCommand(command: string): boolean {
    const taskKeywords = ['создай задачу', 'добавь задачу', 'новая задача', 'task', 'задание', 'дело'];
    return taskKeywords.some(keyword => command.includes(keyword));
  }

  private static isCalendarCommand(command: string): boolean {
    const calendarKeywords = ['создай встречу', 'добавь событие', 'запланируй', 'календарь', 'напоминание', 'встреча'];
    return calendarKeywords.some(keyword => command.includes(keyword));
  }

  private static isEmailCommand(command: string): boolean {
    const emailKeywords = ['напиши письмо', 'email', 'почта', 'ответ', 'черновик'];
    return emailKeywords.some(keyword => command.includes(keyword));
  }

  private static isDocumentCommand(command: string): boolean {
    const docKeywords = ['анализ', 'резюме', 'документ', 'прочитай', 'summarize', 'файл'];
    return docKeywords.some(keyword => command.includes(keyword));
  }

  private static getContextualResponse(type: keyof typeof AIService.mockResponses, context?: AIContext): string {
    const responses = this.mockResponses[type];
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    if (context) {
      const activeTasks = context.currentTasks.filter(t => !t.completed);
      const todayEvents = context.upcomingEvents.filter(e => {
        const today = new Date();
        return e.startDate.toDateString() === today.toDateString();
      });
      
      response = response.replace('{taskCount}', activeTasks.length.toString());
      response = response.replace('{eventCount}', todayEvents.length.toString());
    }
    
    return response;
  }

  private static generateScheduleAdvice(context: AIContext): string {
    const activeTasks = context.currentTasks.filter(t => !t.completed);
    const todayEvents = context.upcomingEvents.filter(e => {
      const today = new Date();
      return e.startDate.toDateString() === today.toDateString();
    });

    if (todayEvents.length > 5) {
      return `⚠️ Внимание: у вас очень плотный день с ${todayEvents.length} событиями. Рекомендую:\n\n• Перенести менее критичные встречи\n• Заблокировать время для важных задач\n• Запланировать перерывы между встречами`;
    }

    if (activeTasks.length > 10) {
      const highPriorityTasks = activeTasks.filter(t => t.priority === 'high');
      return `📋 У вас ${activeTasks.length} активных задач, из них ${highPriorityTasks.length} высокоприоритетных.\n\nРекомендую сосредоточиться на: "${highPriorityTasks[0]?.title || activeTasks[0]?.title}"`;
    }

    return `✅ Ваше расписание сбалансировано! ${todayEvents.length} событий сегодня, ${activeTasks.length} активных задач. Отличная продуктивность!`;
  }

  private static generateProductivityInsights(context: AIContext): string {
    const completedTasks = context.currentTasks.filter(t => t.completed);
    const overdueTasks = context.currentTasks.filter(t => 
      t.dueDate && new Date() > t.dueDate && !t.completed
    );

    return `📊 Ваша продуктивность:\n\n✅ Выполнено задач: ${completedTasks.length}\n⏰ Просрочено: ${overdueTasks.length}\n📧 Непрочитанных писем: ${context.unreadEmails.length}\n📄 Документов к обработке: ${context.recentDocuments.length}\n\n${overdueTasks.length > 0 ? '💡 Рекомендую пересмотреть дедлайны просроченных задач.' : '🎉 Отличная работа! Все в срок!'}`;
  }

  private static processTaskCommand(command: string, context?: AIContext): string {
    // Извлечение задачи из команды
    const taskMatch = command.match(/создай задачу[:\s]+["']?([^"']+)["']?/i) || 
                     command.match(/добавь задачу[:\s]+["']?([^"']+)["']?/i);
    
    if (taskMatch) {
      const taskTitle = taskMatch[1].trim();
      return `✅ Создана задача: "${taskTitle}"\n\n💡 Рекомендации:\n• Установить дедлайн\n• Выбрать приоритет\n• Добавить детали для лучшего планирования`;
    }

    return `📝 Готов создать задачу! Назовите, что нужно сделать, и я помогу правильно её структурировать с учетом вашего текущего расписания.`;
  }

  private static processCalendarCommand(command: string, context?: AIContext): string {
    const eventMatch = command.match(/создай встречу[:\s]+["']?([^"']+)["']?/i) ||
                      command.match(/запланируй[:\s]+["']?([^"']+)["']?/i);
    
    if (eventMatch) {
      const eventTitle = eventMatch[1].trim();
      return `📅 Планирую событие: "${eventTitle}"\n\n🎯 Предлагаю время:\n• Завтра 14:00-15:00\n• Послезавтра 10:00-11:00\n\n💡 Учту ваше текущее расписание при выборе оптимального времени.`;
    }

    return `📅 Помогу запланировать встречу! Учту ваши существующие события и предложу оптимальное время.`;
  }

  private static processEmailCommand(command: string, context?: AIContext): string {
    if (command.includes('напиши письмо') || command.includes('черновик')) {
      return `📧 Помогу составить письмо!\n\n📝 Выберите стиль:\n• Деловой (формальный)\n• Дружелюбный (неформальный)\n• Краткий (только факты)\n\n💡 Укажите тему и основные пункты, я структурирую текст.`;
    }

    if (context && context.unreadEmails.length > 0) {
      return `📬 У вас ${context.unreadEmails.length} непрочитанных писем.\n\n🔥 Самые важные:\n${context.unreadEmails.slice(0, 2).map(e => `• От ${e.from}: ${e.subject}`).join('\n')}\n\nПомочь с ответами?`;
    }

    return `📧 Готов помочь с электронной почтой: составить письмо, структурировать ответ или проанализировать важные сообщения.`;
  }

  private static processDocumentCommand(command: string, context?: AIContext): string {
    if (command.includes('анализ') || command.includes('резюме')) {
      return `📄 Анализирую документы...\n\n🔍 Найденные паттерны:\n• Ключевые даты и дедлайны\n• Действия к выполнению\n• Важные контакты\n\n💡 Создать задачи на основе содержания?`;
    }

    return `📄 Готов проанализировать документы! Загрузите файл, и я:\n\n• Создам краткое резюме\n• Выделю ключевые пункты\n• Предложу действия\n• Найду важные даты`;
  }

  private static generateSmartResponse(command: string, context?: AIContext): string {
    const responses = [
      `🤔 Интересный запрос! Позвольте проанализировать и предложить наилучший подход для решения.`,
      `💡 Понял вашу задачу. Рекомендую разбить её на этапы для максимальной эффективности.`,
      `🎯 Готов помочь! В MVP версии доступны: управление задачами, планирование встреч, анализ документов и email-помощь.`
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  static async analyzeDocument(document: Document): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const insights = [
      `📋 Документ "${document.name}" проанализирован:\n\n🔍 Структура:\n• ${Math.floor(Math.random() * 5) + 3} основных разделов\n• ${Math.floor(Math.random() * 10) + 5} ключевых пунктов\n• ${Math.floor(Math.random() * 3) + 1} важных дат`,
      
      `📊 Анализ "${document.name}" завершен:\n\n💼 Тип контента: ${document.type === 'pdf' ? 'Официальный документ' : 'Текстовый файл'}\n📈 Сложность: Средняя\n⚡ Время чтения: ${Math.floor(document.size / 1000) + 2} мин`,
      
      `🎯 Обработка "${document.name}":\n\n✅ Извлечено ключевых данных\n📅 Найдены временные рамки\n📋 Выделены задачи к выполнению\n🔗 Определены связи с другими проектами`
    ];

    const baseInsight = insights[Math.floor(Math.random() * insights.length)];
    
    return `${baseInsight}\n\n💡 Рекомендации:\n• Создать задачи на основе содержания\n• Добавить ключевые даты в календарь\n• Сохранить важные контакты\n• Настроить напоминания по дедлайнам`;
  }

  static async generateEmailDraft(context: string, tone: 'formal' | 'friendly' | 'brief' = 'formal'): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1800));

    const templates = {
      formal: {
        greeting: 'Уважаемый(-ая)',
        body: 'Обращаюсь к Вам по вопросу',
        closing: 'С уважением'
      },
      friendly: {
        greeting: 'Привет',
        body: 'Хотел(а) обсудить с тобой',
        closing: 'До встречи'
      },
      brief: {
        greeting: 'Здравствуйте',
        body: 'Кратко по теме:',
        closing: 'Спасибо'
      }
    };

    const template = templates[tone];
    
    return `📧 Черновик письма (${tone === 'formal' ? 'деловой' : tone === 'friendly' ? 'дружелюбный' : 'краткий'} стиль):\n\n${template.greeting},\n\n${template.body} ${context}.\n\n[Основной текст письма]\n\n${template.closing},\n[Ваше имя]\n\n💡 Совет: Добавьте конкретные детали и призыв к действию для большей эффективности.`;
  }

  static async getScheduleOptimization(tasks: Task[], events: CalendarEvent[]): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const activeTasks = tasks.filter(t => !t.completed);
    const todayEvents = events.filter(e => {
      const today = new Date();
      return e.startDate.toDateString() === today.toDateString();
    });

    const highPriorityTasks = activeTasks.filter(t => t.priority === 'high');
    const overdueTasks = activeTasks.filter(t => 
      t.dueDate && new Date() > t.dueDate
    );

    let optimization = `🎯 Анализ расписания:\n\n`;

    if (overdueTasks.length > 0) {
      optimization += `⚠️ КРИТИЧНО: ${overdueTasks.length} просроченных задач\n`;
      optimization += `Первоочередно: "${overdueTasks[0].title}"\n\n`;
    }

    if (todayEvents.length > 4) {
      optimization += `📅 Плотный день: ${todayEvents.length} встреч\nРекомендую 15-минутные перерывы между событиями\n\n`;
    }

    if (highPriorityTasks.length > 0) {
      optimization += `🔥 Приоритетные задачи (${highPriorityTasks.length}):\n`;
      optimization += highPriorityTasks.slice(0, 3).map(t => `• ${t.title}`).join('\n');
      optimization += `\n\n`;
    }

    optimization += `💡 Рекомендации:\n`;
    optimization += `• Заблокировать 2 часа для глубокой работы\n`;
    optimization += `• Группировать похожие задачи\n`;
    optimization += `• Запланировать время на email и звонки\n`;
    optimization += `• Оставить буферное время для непредвиденных дел`;

    return optimization;
  }
}