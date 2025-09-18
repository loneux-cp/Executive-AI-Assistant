import React, { useState, Platform, Modal } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface QuickActionsProps {
  onCreateTask: () => void;
  onCreateEvent: () => void;
  onViewEmail: () => void;
  onUploadDocument: () => void;
}

export function QuickActions({ onCreateTask, onCreateEvent, onViewEmail, onUploadDocument }: QuickActionsProps) {
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

  const actions = [
    {
      title: 'Новая задача',
      icon: 'add-task',
      color: '#3B82F6',
      onPress: () => {
        showWebAlert('Создание задачи', 'Переходим к созданию новой задачи...', onCreateTask);
      }
    },
    {
      title: 'Событие',
      icon: 'event',
      color: '#10B981',
      onPress: () => {
        showWebAlert('Новое событие', 'Создаем событие в календаре...', onCreateEvent);
      }
    },
    {
      title: 'Почта',
      icon: 'email',
      color: '#F59E0B',
      onPress: () => {
        showWebAlert('Почта', 'Открываем почтовый ящик...', onViewEmail);
      }
    },
    {
      title: 'Документ',
      icon: 'upload-file',
      color: '#8B5CF6',
      onPress: () => {
        showWebAlert('Загрузка документа', 'Функция загрузки в разработке...', onUploadDocument);
      }
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Быстрые действия</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.actionButton, { borderColor: action.color }]}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name={action.icon as any} 
              size={24} 
              color={action.color} 
            />
            <Text style={[styles.actionText, { color: action.color }]}>
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
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