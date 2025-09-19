import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AIAssistant } from '@/components/ui/AIAssistant';
import { QuickActions } from '@/components/ui/QuickActions';
import { useTasks } from '@/hooks/useTasks';
import { useEmail } from '@/hooks/useEmail';
import { useCalendar } from '@/hooks/useCalendar';
import { AIService } from '@/services/aiService';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { tasks } = useTasks();
  const { emails, unreadCount } = useEmail();
  const { events } = useCalendar();
  const [aiRecommendation, setAiRecommendation] = useState<string>('');

  const activeTasks = tasks.filter(task => !task.completed);
  const completedToday = tasks.filter(task => {
    const today = new Date();
    return task.completed && task.createdAt.toDateString() === today.toDateString();
  });
  
  const todayEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.startDate);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(event => {
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const timeDiff = eventStart.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000; // Следующие 2 часа
  }).slice(0, 2);

  const overdueTasks = activeTasks.filter(task => 
    task.dueDate && new Date() > task.dueDate
  );

  const highPriorityTasks = activeTasks.filter(task => task.priority === 'high');

  useEffect(() => {
    generateAiRecommendation();
  }, [tasks, events, emails]);

  const generateAiRecommendation = async () => {
    try {
      const context = {
        currentTasks: tasks,
        upcomingEvents: events,
        unreadEmails: emails.filter(e => !e.isRead),
        recentDocuments: []
      };
      
      const recommendation = await AIService.getScheduleOptimization(tasks, events);
      setAiRecommendation(recommendation);
    } catch (error) {
      console.error('Ошибка получения рекомендации:', error);
    }
  };

  const getProductivityStatus = () => {
    if (overdueTasks.length > 2) {
      return { status: 'critical', text: 'Требует внимания', color: '#EF4444', icon: 'warning' as const };
    }
    if (activeTasks.length > 8) {
      return { status: 'busy', text: 'Высокая нагрузка', color: '#F59E0B', icon: 'schedule' as const };
    }
    if (completedToday.length > 3) {
      return { status: 'excellent', text: 'Отличная продуктивность', color: '#10B981', icon: 'trending-up' as const };
    }
    return { status: 'good', text: 'Стабильный темп', color: '#3B82F6', icon: 'check-circle' as const };
  };

  const productivityStatus = getProductivityStatus();

  const handleCreateTask = () => {
    // Navigate to task creation
    console.log('Создание задачи');
  };

  const handleCreateEvent = () => {
    // Navigate to event creation
    console.log('Создание события');
  };

  const handleViewEmail = () => {
    // Navigate to email
    console.log('Переход к почте');
  };

  const handleUploadDocument = () => {
    // Navigate to document upload
    console.log('Загрузка документа');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Добро пожаловать!</Text>
          <View style={styles.statusContainer}>
            <MaterialIcons name={productivityStatus.icon} size={16} color={productivityStatus.color} />
            <Text style={[styles.statusText, { color: productivityStatus.color }]}>
              {productivityStatus.text}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <MaterialIcons name="account-circle" size={32} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* AI Assistant */}
        <AIAssistant onCommandExecuted={(cmd, res) => console.log('Command:', cmd, 'Response:', res)} />
        
        {/* Critical Alerts */}
        {overdueTasks.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <MaterialIcons name="warning" size={20} color="#EF4444" />
              <Text style={styles.alertTitle}>Требует внимания</Text>
            </View>
            <Text style={styles.alertText}>
              {overdueTasks.length} просроченных задач. Первоочередно: "{overdueTasks[0].title}"
            </Text>
          </View>
        )}

        {/* Upcoming Events Alert */}
        {upcomingEvents.length > 0 && (
          <View style={styles.upcomingCard}>
            <View style={styles.upcomingHeader}>
              <MaterialIcons name="schedule" size={20} color="#F59E0B" />
              <Text style={styles.upcomingTitle}>Скоро</Text>
            </View>
            {upcomingEvents.map(event => (
              <Text key={event.id} style={styles.upcomingText}>
                {event.startDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} - {event.title}
              </Text>
            ))}
          </View>
        )}

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="assignment" size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{activeTasks.length}</Text>
            <Text style={styles.statLabel}>Активных задач</Text>
            {highPriorityTasks.length > 0 && (
              <Text style={styles.statSubtext}>
                {highPriorityTasks.length} высокий приоритет
              </Text>
            )}
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="today" size={24} color="#10B981" />
            <Text style={styles.statNumber}>{todayEvents.length}</Text>
            <Text style={styles.statLabel}>Событий сегодня</Text>
            {upcomingEvents.length > 0 && (
              <Text style={styles.statSubtext}>
                Ближайшее в {upcomingEvents[0].startDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="mail" size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Непрочитанных</Text>
            {completedToday.length > 0 && (
              <Text style={styles.statSubtext}>
                Выполнено: {completedToday.length}
              </Text>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <QuickActions
          onCreateTask={handleCreateTask}
          onCreateEvent={handleCreateEvent}
          onViewEmail={handleViewEmail}
          onUploadDocument={handleUploadDocument}
        />

        {/* AI Recommendations */}
        {aiRecommendation && (
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <MaterialIcons name="lightbulb" size={20} color="#8B5CF6" />
              <Text style={styles.recommendationTitle}>AI Рекомендации</Text>
            </View>
            <Text style={styles.recommendationText}>{aiRecommendation}</Text>
          </View>
        )}

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Последняя активность</Text>
          {activeTasks.length === 0 && todayEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="done-all" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>Все задачи выполнены!</Text>
              <Text style={styles.emptySubtext}>Отличная работа! Создайте новую задачу или событие</Text>
            </View>
          ) : (
            <View style={styles.recentItems}>
              {highPriorityTasks.slice(0, 2).map(task => (
                <View key={task.id} style={styles.recentItem}>
                  <MaterialIcons name="priority-high" size={16} color="#EF4444" />
                  <Text style={styles.recentItemText} numberOfLines={1}>{task.title}</Text>
                  <Text style={styles.recentItemType}>Высокий приоритет</Text>
                </View>
              ))}
              {activeTasks.filter(t => t.priority !== 'high').slice(0, 2).map(task => (
                <View key={task.id} style={styles.recentItem}>
                  <MaterialIcons name="radio-button-unchecked" size={16} color="#3B82F6" />
                  <Text style={styles.recentItemText} numberOfLines={1}>{task.title}</Text>
                  <Text style={styles.recentItemType}>Задача</Text>
                </View>
              ))}
              {todayEvents.slice(0, 2).map(event => (
                <View key={event.id} style={styles.recentItem}>
                  <MaterialIcons name="event" size={16} color="#10B981" />
                  <Text style={styles.recentItemText} numberOfLines={1}>{event.title}</Text>
                  <Text style={styles.recentItemType}>
                    {event.startDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Productivity Insights */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Статистика дня</Text>
          <View style={styles.insightsGrid}>
            <View style={styles.insightItem}>
              <Text style={styles.insightNumber}>{completedToday.length}</Text>
              <Text style={styles.insightLabel}>Выполнено</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={[styles.insightNumber, { color: overdueTasks.length > 0 ? '#EF4444' : '#10B981' }]}>
                {overdueTasks.length}
              </Text>
              <Text style={styles.insightLabel}>Просрочено</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightNumber}>{Math.round((completedToday.length / Math.max(activeTasks.length + completedToday.length, 1)) * 100)}%</Text>
              <Text style={styles.insightLabel}>Прогресс</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  profileButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  alertCard: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  alertText: {
    fontSize: 14,
    color: '#991B1B',
    lineHeight: 20,
  },
  upcomingCard: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706',
  },
  upcomingText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 2,
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  recommendationText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  recentSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  recentItems: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  recentItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  recentItemType: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  insightsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  insightsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  insightItem: {
    alignItems: 'center',
  },
  insightNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3B82F6',
  },
  insightLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});