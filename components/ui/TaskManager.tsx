import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Platform, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasks } from '@/hooks/useTasks';
import { Task } from '@/types';

interface TaskManagerProps {
  onTaskCreated?: () => void;
}

export function TaskManager({ onTaskCreated }: TaskManagerProps) {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTasks();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: undefined as Date | undefined,
  });
  const insets = useSafeAreaInsets();

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

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      showWebAlert('Ошибка', 'Введите название задачи');
      return;
    }

    addTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      completed: false,
      dueDate: newTask.dueDate,
    });

    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: undefined,
    });
    setShowCreateModal(false);
    onTaskCreated?.();
    showWebAlert('Успех', 'Задача создана успешно!');
  };

  const handleEditTask = () => {
    if (!editingTask || !newTask.title.trim()) {
      showWebAlert('Ошибка', 'Введите название задачи');
      return;
    }

    updateTask(editingTask.id, {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
    });

    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: undefined,
    });
    showWebAlert('Сохранено', 'Задача обновлена успешно!');
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate,
    });
  };

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    showWebAlert(
      'Удалить задачу',
      `Вы уверены, что хотите удалить "${taskTitle}"?`,
      () => {
        deleteTask(taskId);
        showWebAlert('Удалено', 'Задача удалена успешно');
      }
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityText = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return '';
    }
  };

  const priorityOptions: Task['priority'][] = ['low', 'medium', 'high'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Задачи</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Active Tasks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Активные задачи ({activeTasks.length})</Text>
          {activeTasks.length === 0 ? (
            <Text style={styles.emptyText}>Нет активных задач</Text>
          ) : (
            activeTasks.map(task => (
              <View key={task.id} style={styles.taskItem}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleTaskCompletion(task.id)}
                >
                  <MaterialIcons
                    name="check-box-outline-blank"
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.taskContent}
                  onPress={() => openEditModal(task)}
                >
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.description && (
                    <Text style={styles.taskDescription}>{task.description}</Text>
                  )}
                  <View style={styles.taskMeta}>
                    <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) }]}>
                      <Text style={styles.priorityText}>{getPriorityText(task.priority)}</Text>
                    </View>
                    {task.dueDate && (
                      <Text style={[styles.dueDate, new Date() > task.dueDate && styles.overdue]}>
                        {formatDate(task.dueDate)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTask(task.id, task.title)}
                >
                  <MaterialIcons name="delete" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Выполненные задачи ({completedTasks.length})</Text>
            {completedTasks.map(task => (
              <View key={task.id} style={[styles.taskItem, styles.completedTask]}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleTaskCompletion(task.id)}
                >
                  <MaterialIcons
                    name="check-box"
                    size={24}
                    color="#10B981"
                  />
                </TouchableOpacity>
                
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, styles.completedTitle]}>{task.title}</Text>
                  {task.description && (
                    <Text style={[styles.taskDescription, styles.completedText]}>{task.description}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteTask(task.id, task.title)}
                >
                  <MaterialIcons name="delete" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal 
        visible={showCreateModal || !!editingTask} 
        animationType="slide" 
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowCreateModal(false);
                setEditingTask(null);
                setNewTask({ title: '', description: '', priority: 'medium', dueDate: undefined });
              }}
            >
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingTask ? 'Редактировать задачу' : 'Новая задача'}
            </Text>
            <TouchableOpacity 
              onPress={editingTask ? handleEditTask : handleCreateTask}
            >
              <Text style={styles.saveButton}>Сохранить</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Название *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Что нужно сделать?"
                value={newTask.title}
                onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Описание</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Дополнительные детали (опционально)"
                value={newTask.description}
                onChangeText={(text) => setNewTask(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Приоритет</Text>
              <View style={styles.prioritySelector}>
                {priorityOptions.map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      { borderColor: getPriorityColor(priority) },
                      newTask.priority === priority && { backgroundColor: getPriorityColor(priority) }
                    ]}
                    onPress={() => setNewTask(prev => ({ ...prev, priority }))}
                  >
                    <Text style={[
                      styles.priorityOptionText,
                      { color: getPriorityColor(priority) },
                      newTask.priority === priority && { color: '#ffffff' }
                    ]}>
                      {getPriorityText(priority)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Дедлайн</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => showWebAlert('Выбор даты', 'В MVP используется дата через 24 часа')}
              >
                <MaterialIcons name="event" size={20} color="#3B82F6" />
                <Text style={styles.dateButtonText}>
                  {newTask.dueDate ? formatDate(newTask.dueDate) : 'Установить дедлайн'}
                </Text>
              </TouchableOpacity>
              {!newTask.dueDate && (
                <TouchableOpacity
                  style={styles.quickDateButton}
                  onPress={() => setNewTask(prev => ({ 
                    ...prev, 
                    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) 
                  }))}
                >
                  <Text style={styles.quickDateText}>Завтра в это время</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#F8FAFC',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    paddingVertical: 32,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#6B7280',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  completedText: {
    color: '#9CA3AF',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  dueDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  overdue: {
    color: '#EF4444',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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
  prioritySelector: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityOption: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  priorityOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  quickDateButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EBF4FF',
    borderRadius: 6,
  },
  quickDateText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
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