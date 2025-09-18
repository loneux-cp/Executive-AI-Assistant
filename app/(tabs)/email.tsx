import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useEmail } from '@/hooks/useEmail';
import { Email } from '@/types';

export default function EmailScreen() {
  const insets = useSafeAreaInsets();
  const { emails, markAsRead, toggleStar, deleteEmail, unreadCount } = useEmail();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);

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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'только что';
    if (hours < 24) return `${hours}ч назад`;
    if (hours < 48) return 'вчера';
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleEmailPress = (email: Email) => {
    if (!email.isRead) {
      markAsRead(email.id);
    }
    setSelectedEmail(email);
  };

  const handleDeleteEmail = (emailId: string) => {
    showWebAlert(
      'Удалить письмо',
      'Вы уверены, что хотите удалить это письмо?',
      () => {
        deleteEmail(emailId);
        setSelectedEmail(null);
        showWebAlert('Удалено', 'Письмо удалено успешно');
      }
    );
  };

  const sortedEmails = emails.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Почта</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>
              {unreadCount} непрочитанных
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => showWebAlert('Написать письмо', 'Функция отправки писем будет добавлена в следующих версиях')}
        >
          <MaterialIcons name="edit" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {emails.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="mail-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Нет писем</Text>
            <Text style={styles.emptySubtext}>Ваша почта пуста</Text>
          </View>
        ) : (
          sortedEmails.map(email => (
            <TouchableOpacity
              key={email.id}
              style={[styles.emailItem, !email.isRead && styles.unreadItem]}
              onPress={() => handleEmailPress(email)}
              activeOpacity={0.7}
            >
              <View style={styles.emailHeader}>
                <View style={styles.senderInfo}>
                  <Text style={[styles.senderName, !email.isRead && styles.unreadText]}>
                    {email.from}
                  </Text>
                  <Text style={styles.emailDate}>{formatDate(email.receivedAt)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => toggleStar(email.id)}
                  style={styles.starButton}
                >
                  <MaterialIcons
                    name={email.isStarred ? "star" : "star-border"}
                    size={20}
                    color={email.isStarred ? "#F59E0B" : "#9CA3AF"}
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.emailSubject, !email.isRead && styles.unreadText]}>
                {email.subject}
              </Text>
              
              <Text style={styles.emailPreview} numberOfLines={2}>
                {email.body}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={!!selectedEmail} animationType="slide" presentationStyle="pageSheet">
        {selectedEmail && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedEmail(null)}>
                <MaterialIcons name="arrow-back" size={24} color="#111827" />
              </TouchableOpacity>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => toggleStar(selectedEmail.id)}
                  style={styles.actionButton}
                >
                  <MaterialIcons
                    name={selectedEmail.isStarred ? "star" : "star-border"}
                    size={24}
                    color={selectedEmail.isStarred ? "#F59E0B" : "#6B7280"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteEmail(selectedEmail.id)}
                  style={styles.actionButton}
                >
                  <MaterialIcons name="delete" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.emailContent}>
              <Text style={styles.emailTitle}>{selectedEmail.subject}</Text>
              
              <View style={styles.emailMeta}>
                <Text style={styles.emailFrom}>От: {selectedEmail.from}</Text>
                <Text style={styles.emailTo}>Кому: {selectedEmail.to}</Text>
                <Text style={styles.emailDate}>
                  {selectedEmail.receivedAt.toLocaleString('ru-RU')}
                </Text>
              </View>
              
              <Text style={styles.emailBody}>{selectedEmail.body}</Text>
              
              <View style={styles.replySection}>
                <TouchableOpacity 
                  style={styles.replyButton}
                  onPress={() => showWebAlert('Ответить', 'Функция ответа будет добавлена в следующих версиях')}
                >
                  <MaterialIcons name="reply" size={20} color="#3B82F6" />
                  <Text style={styles.replyButtonText}>Ответить</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.forwardButton}
                  onPress={() => showWebAlert('Переслать', 'Функция пересылки будет добавлена в следующих версиях')}
                >
                  <MaterialIcons name="forward" size={20} color="#6B7280" />
                  <Text style={styles.forwardButtonText}>Переслать</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        )}
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
  unreadCount: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  composeButton: {
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
  emailItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 1,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadItem: {
    borderLeftColor: '#3B82F6',
    backgroundColor: '#F8FAFC',
  },
  emailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  unreadText: {
    fontWeight: '600',
  },
  emailDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  starButton: {
    padding: 4,
  },
  emailSubject: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 6,
  },
  emailPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
  modalActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  emailContent: {
    flex: 1,
    padding: 20,
  },
  emailTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  emailMeta: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  emailFrom: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  emailTo: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  emailBody: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    marginBottom: 32,
  },
  replySection: {
    flexDirection: 'row',
    gap: 16,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  replyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  forwardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  forwardButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
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