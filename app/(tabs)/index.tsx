import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { AIAssistant } from '@/components/ui/AIAssistant';
import { QuickActions } from '@/components/ui/QuickActions';
import { useTasks } from '@/hooks/useTasks';
import { useEmail } from '@/hooks/useEmail';
import { useCalendar } from '@/hooks/useCalendar';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { tasks } = useTasks();
  const { emails, unreadCount } = useEmail();
  const { events } = useCalendar();

  const activeTasks = tasks.filter(task => !task.completed);
  const todayEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.startDate);
    return eventDate.toDateString() === today.toDateString();
  });

  const handleCreateTask = () => {
    // Navigate to task creation - placeholder for MVP
    console.log('Создание задачи');
  };

  const handleCreateEvent = () => {
    // Navigate to event creation - placeholder for MVP
    console.log('Создание события');
  };

  const handleViewEmail = () => {
    // Navigate to email - placeholder for MVP
    console.log('Переход к почте');
  };

  const handleUploadDocument = () => {
    // Navigate to document upload - placeholder for MVP
    console.log('Загрузка документа');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Добро пожаловать!</Text>
          <Text style={styles.subtitle}>Ваш личный помощник готов к работе</Text>
        </View>
        <MaterialIcons name="account-circle" size={32} color="#3B82F6" />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <AIAssistant onCommandExecuted={(cmd, res) => console.log('Command:', cmd, 'Response:', res)} />
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="assignment" size={24} color="#3B82F6" />
            <Text style={styles.statNumber}>{activeTasks.length}</Text>
            <Text style={styles.statLabel}>Активных задач</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="today" size={24} color="#10B981" />
            <Text style={styles.statNumber}>{todayEvents.length}</Text>
            <Text style={styles.statLabel}>Событий сегодня</Text>
          </View>
          
          <View style={styles.statCard}>
            <MaterialIcons name="mail" size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{unreadCount}</Text>
            <Text style={styles.statLabel}>Непрочитанных</Text>
          </View>
        </View>

        <QuickActions
          onCreateTask={handleCreateTask}
          onCreateEvent={handleCreateEvent}
          onViewEmail={handleViewEmail}
          onUploadDocument={handleUploadDocument}
        />

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Недавняя активность</Text>
          {activeTasks.length === 0 && todayEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="done-all" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>Все задачи выполнены!</Text>
              <Text style={styles.emptySubtext}>Создайте новую задачу или событие</Text>
            </View>
          ) : (
            <View style={styles.recentItems}>
              {activeTasks.slice(0, 3).map(task => (
                <View key={task.id} style={styles.recentItem}>
                  <MaterialIcons name="radio-button-unchecked" size={16} color="#3B82F6" />
                  <Text style={styles.recentItemText}>{task.title}</Text>
                </View>
              ))}
              {todayEvents.slice(0, 2).map(event => (
                <View key={event.id} style={styles.recentItem}>
                  <MaterialIcons name="event" size={16} color="#10B981" />
                  <Text style={styles.recentItemText}>{event.title}</Text>
                </View>
              ))}
            </View>
          )}
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
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
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
  },
  recentItems: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentItemText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
});