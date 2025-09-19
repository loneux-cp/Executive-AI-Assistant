import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Modal, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCalendar } from '@/hooks/useCalendar';
import { CalendarEvent } from '@/types';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { events, addEvent, deleteEvent, updateEvent, loading } = useCalendar();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    startDate: new Date(),
    duration: 60, // минуты
  });

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onOk?: () => void;
  }>({ visible: false, title: '', message: '' });

  const showWebAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setAlertConfig({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (startDate: Date, endDate: Date) => {
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}ч ${minutes}м`;
    } else if (hours > 0) {
      return `${hours}ч`;
    } else {
      return `${minutes}м`;
    }
  };

  const durationOptions = [
    { label: '15 минут', value: 15 },
    { label: '30 минут', value: 30 },
    { label: '45 минут', value: 45 },
    { label: '1 час', value: 60 },
    { label: '1.5 часа', value: 90 },
    { label: '2 часа', value: 120 },
    { label: '3 часа', value: 180 },
    { label: '4 часа', value: 240 },
    { label: 'Весь день', value: 480 },
  ];

  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) {
      showWebAlert('Ошибка', 'Введите название события');
      return;
    }

    const startDate = newEvent.startDate;
    const endDate = new Date(startDate.getTime() + newEvent.duration * 60 * 1000);

    const eventData: Omit<CalendarEvent, 'id'> = {
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      startDate,
      endDate,
    };

    addEvent(eventData);
    resetForm();
    setShowCreateModal(false);
    showWebAlert('Успех', 'Событие создано успешно!');
  };

  const handleEditEvent = () => {
    if (!editingEvent || !newEvent.title.trim()) {
      showWebAlert('Ошибка', 'Введите название события');
      return;
    }

    const startDate = newEvent.startDate;
    const endDate = new Date(startDate.getTime() + newEvent.duration * 60 * 1000);

    updateEvent(editingEvent.id, {
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      startDate,
      endDate,
    });

    resetForm();
    setEditingEvent(null);
    showWebAlert('Сохранено', 'Событие обновлено успешно!');
  };

  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    const duration = Math.floor((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60));
    setNewEvent({
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      startDate: event.startDate,
      duration,
    });
  };

  const resetForm = () => {
    setNewEvent({
      title: '',
      description: '',
      location: '',
      startDate: new Date(),
      duration: 60,
    });
  };

  const handleDeleteEvent = (eventId: string, eventTitle: string) => {
    showWebAlert(
      'Удалить событие',
      `Вы уверены, что хотите удалить "${eventTitle}"?`,
      () => {
        deleteEvent(eventId);
        showWebAlert('Удалено', 'Событие удалено успешно');
      }
    );
  };

  const adjustStartTime = (minutes: number) => {
    const newDate = new Date(newEvent.startDate.getTime() + minutes * 60 * 1000);
    setNewEvent(prev => ({ ...prev, startDate: newDate }));
  };

  const setQuickTime = (hour: number, minute: number = 0) => {
    const newDate = new Date();
    if (hour < new Date().getHours() || (hour === new Date().getHours() && minute <= new Date().getMinutes())) {
      newDate.setDate(newDate.getDate() + 1);
    }
    newDate.setHours(hour, minute, 0, 0);
    setNewEvent(prev => ({ ...prev, startDate: newDate }));
  };

  const groupEventsByDate = (events: CalendarEvent[]) => {
    const grouped: { [key: string]: CalendarEvent[] } = {};
    events.forEach(event => {
      const dateKey = event.startDate.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  };

  const sortedEvents = events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const groupedEvents = groupEventsByDate(sortedEvents);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Календарь</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowCreateModal(true);
          }}
        >
          <MaterialIcons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedEvents).length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Нет запланированных событий</Text>
            <Text style={styles.emptySubtext}>Создайте первое событие</Text>
          </View>
        ) : (
          Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
            <View key={dateKey} style={styles.daySection}>
              <Text style={styles.dayTitle}>
                {new Date(dateKey).toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
              {dayEvents.map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => openEditModal(event)}
                  activeOpacity={0.7}
                >
                  <View style={styles.eventHeader}>
                    <View style={styles.eventTime}>
                      <MaterialIcons name="access-time" size={16} color="#3B82F6" />
                      <Text style={styles.timeText}>
                        {event.startDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text style={styles.durationText}>
                        ({formatDuration(event.startDate, event.endDate)})
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteEvent(event.id, event.title)}
                      style={styles.deleteButton}
                    >
                      <MaterialIcons name="delete" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  
                  {event.description && (
                    <Text style={styles.eventDescription}>{event.description}</Text>
                  )}
                  
                  {event.location && (
                    <View style={styles.eventLocation}>
                      <MaterialIcons name="location-on" size={14} color="#6B7280" />
                      <Text style={styles.locationText}>{event.location}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal 
        visible={showCreateModal || !!editingEvent} 
        animationType="slide" 
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowCreateModal(false);
                setEditingEvent(null);
                resetForm();
              }}
            >
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingEvent ? 'Редактировать событие' : 'Новое событие'}
            </Text>
            <TouchableOpacity onPress={editingEvent ? handleEditEvent : handleCreateEvent}>
              <Text style={styles.saveButton}>Сохранить</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Название *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Что запланировано?"
                value={newEvent.title}
                onChangeText={(text) => setNewEvent(prev => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Время начала</Text>
              <View style={styles.timeContainer}>
                <Text style={styles.timeDisplay}>
                  {newEvent.startDate.toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
                <View style={styles.timeAdjustments}>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => adjustStartTime(-15)}
                  >
                    <Text style={styles.timeButtonText}>-15м</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => adjustStartTime(15)}
                  >
                    <Text style={styles.timeButtonText}>+15м</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => adjustStartTime(60)}
                  >
                    <Text style={styles.timeButtonText}>+1ч</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.quickTimeContainer}>
                <Text style={styles.quickTimeLabel}>Быстрый выбор:</Text>
                <View style={styles.quickTimeButtons}>
                  <TouchableOpacity style={styles.quickTimeButton} onPress={() => setQuickTime(9)}>
                    <Text style={styles.quickTimeButtonText}>9:00</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickTimeButton} onPress={() => setQuickTime(14)}>
                    <Text style={styles.quickTimeButtonText}>14:00</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.quickTimeButton} onPress={() => setQuickTime(18)}>
                    <Text style={styles.quickTimeButtonText}>18:00</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Длительность</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationScroll}>
                <View style={styles.durationOptions}>
                  {durationOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.durationOption,
                        newEvent.duration === option.value && styles.durationOptionSelected
                      ]}
                      onPress={() => setNewEvent(prev => ({ ...prev, duration: option.value }))}
                    >
                      <Text style={[
                        styles.durationOptionText,
                        newEvent.duration === option.value && styles.durationOptionTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              
              <View style={styles.timePreview}>
                <Text style={styles.timePreviewText}>
                  Окончание: {new Date(newEvent.startDate.getTime() + newEvent.duration * 60 * 1000)
                                .toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Описание</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Дополнительные детали (опционально)"
                value={newEvent.description}
                onChangeText={(text) => setNewEvent(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Место</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Место проведения (опционально)"
                value={newEvent.location}
                onChangeText={(text) => setNewEvent(prev => ({ ...prev, location: text }))}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {Platform.OS === 'web' && (
        <Modal visible={alertConfig.visible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={styles.alertContainer}>
              <Text style={styles.alertTitle}>{alertConfig.title}</Text>
              <Text style={styles.alertMessage}>{alertConfig.message}</Text>
              <TouchableOpacity 
                style={styles.alertButton}
                onPress={() => {
                  alertConfig.onOk?.();
                  setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
              >
                <Text style={styles.alertButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  daySection: {
    marginBottom: 24,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 20,
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  durationText: {
    fontSize: 11,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
  },
  timeDisplay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  timeAdjustments: {
    flexDirection: 'row',
    gap: 8,
  },
  timeButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  timeButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  quickTimeContainer: {
    marginTop: 12,
  },
  quickTimeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  quickTimeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  quickTimeButton: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickTimeButtonText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '500',
  },
  durationScroll: {
    marginBottom: 12,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  durationOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  durationOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  durationOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  durationOptionTextSelected: {
    color: '#ffffff',
  },
  timePreview: {
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 6,
  },
  timePreviewText: {
    fontSize: 12,
    color: '#0369A1',
    textAlign: 'center',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    minWidth: 280,
    maxWidth: '80%',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111827',
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: '#6B7280',
  },
  alertButton: {
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  alertButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});