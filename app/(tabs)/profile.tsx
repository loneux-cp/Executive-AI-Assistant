import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Switch, Platform, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface UserProfile {
  name: string;
  email: string;
  notifications: boolean;
  autoSync: boolean;
  aiResponses: boolean;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Пользователь',
    email: 'user@example.com',
    notifications: true,
    autoSync: true,
    aiResponses: true,
  });
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSaveProfile = () => {
    setIsEditing(false);
    showWebAlert('Сохранено', 'Профиль успешно обновлен');
  };

  const settingsOptions = [
    {
      title: 'Уведомления',
      subtitle: 'Получать push-уведомления',
      key: 'notifications' as keyof UserProfile,
      type: 'switch'
    },
    {
      title: 'Автосинхронизация',
      subtitle: 'Синхронизация с системными календарями',
      key: 'autoSync' as keyof UserProfile,
      type: 'switch'
    },
    {
      title: 'AI Ответы',
      subtitle: 'Умные предложения от AI помощника',
      key: 'aiResponses' as keyof UserProfile,
      type: 'switch'
    }
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Профиль</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
        >
          <MaterialIcons name={isEditing ? "save" : "edit"} size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={48} color="#3B82F6" />
          </View>
          
          <View style={styles.userInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={profile.name}
                onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
                placeholder="Ваше имя"
              />
            ) : (
              <Text style={styles.userName}>{profile.name}</Text>
            )}
            
            {isEditing ? (
              <TextInput
                style={styles.emailInput}
                value={profile.email}
                onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
                placeholder="Email"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.userEmail}>{profile.email}</Text>
            )}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Задач выполнено</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Событий сегодня</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Документов</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          {settingsOptions.map((option, index) => (
            <View key={index} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
              </View>
              <Switch
                value={profile[option.key] as boolean}
                onValueChange={(value) => setProfile(prev => ({ ...prev, [option.key]: value }))}
                trackColor={{ false: '#D1D5DB', true: '#3B82F6' }}
                thumbColor="#ffffff"
              />
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Действия</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showWebAlert('Экспорт данных', 'Функция будет доступна в следующих версиях')}
          >
            <MaterialIcons name="cloud-download" size={24} color="#3B82F6" />
            <Text style={styles.actionText}>Экспорт данных</Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showWebAlert('Синхронизация', 'Синхронизация запущена...')}
          >
            <MaterialIcons name="sync" size={24} color="#10B981" />
            <Text style={styles.actionText}>Синхронизировать</Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => showWebAlert('Помощь', 'Если у вас есть вопросы, обращайтесь в службу поддержки')}
          >
            <MaterialIcons name="help-outline" size={24} color="#6B7280" />
            <Text style={styles.actionText}>Помощь и поддержка</Text>
            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Executive AI Assistant v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 AI Assistant MVP</Text>
        </View>
      </ScrollView>

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
  editButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 4,
    marginBottom: 8,
  },
  emailInput: {
    fontSize: 14,
    color: '#6B7280',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingVertical: 4,
  },
  statsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  settingsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  settingSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  actionsSection: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  appCopyright: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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