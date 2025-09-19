import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Modal, Platform, Alert, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useEmail } from '@/hooks/useEmail';
import { Email } from '@/types';
import { AIService } from '@/services/aiService';

export default function EmailScreen() {
  const insets = useSafeAreaInsets();
  const { emails, markAsRead, toggleStar, deleteEmail, unreadCount, addEmail } = useEmail();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: '',
  });
  const [aiAssisting, setAiAssisting] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'formal' | 'friendly' | 'brief'>('formal');

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

  const handleComposeEmail = () => {
    if (!composeData.to.trim() || !composeData.subject.trim() || !composeData.body.trim()) {
      showWebAlert('Ошибка', 'Заполните все обязательные поля');
      return;
    }

    // Добавляем письмо как отправленное (в реальном приложении здесь была бы отправка)
    const newEmail: Omit<Email, 'id' | 'receivedAt'> = {
      from: 'user@example.com',
      to: composeData.to,
      subject: composeData.subject,
      body: composeData.body,
      isRead: true,
      isStarred: false,
    };

    addEmail(newEmail);
    setComposeData({ to: '', subject: '', body: '' });
    setShowCompose(false);
    showWebAlert('Отправлено', 'Письмо отправлено успешно! (В MVP сохранено локально)');
  };

  const handleAiAssist = async () => {
    if (!composeData.subject.trim()) {
      showWebAlert('Подсказка', 'Введите тему письма для получения лучших предложений от AI');
      return;
    }

    setAiAssisting(true);
    try {
      const draft = await AIService.generateEmailDraft(composeData.subject, selectedTone);
      setComposeData(prev => ({ ...prev, body: prev.body + '\n\n' + draft }));
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось получить помощь от AI. Попробуйте позже.');
    } finally {
      setAiAssisting(false);
    }
  };

  const handleQuickReply = async (originalEmail: Email) => {
    setAiAssisting(true);
    try {
      const replyContext = `Ответ на письмо: "${originalEmail.subject}" от ${originalEmail.from}`;
      const draft = await AIService.generateEmailDraft(replyContext, 'formal');
      
      setComposeData({
        to: originalEmail.from,
        subject: `Re: ${originalEmail.subject}`,
        body: draft,
      });
      setSelectedEmail(null);
      setShowCompose(true);
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось создать черновик ответа');
    } finally {
      setAiAssisting(false);
    }
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
          onPress={() => {
            setComposeData({ to: '', subject: '', body: '' });
            setShowCompose(true);
          }}
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

      {/* Email Detail Modal */}
      <Modal visible={!!selectedEmail} animationType="slide" presentationStyle="pageSheet">
        {selectedEmail && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedEmail(null)}>
                <MaterialIcons name="arrow-back" size={24} color="#111827" />
              </TouchableOpacity>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => handleQuickReply(selectedEmail)}
                  style={styles.actionButton}
                  disabled={aiAssisting}
                >
                  <MaterialIcons name="reply" size={24} color={aiAssisting ? "#9CA3AF" : "#3B82F6"} />
                </TouchableOpacity>
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
                  style={[styles.replyButton, aiAssisting && styles.replyButtonDisabled]}
                  onPress={() => handleQuickReply(selectedEmail)}
                  disabled={aiAssisting}
                >
                  <MaterialIcons 
                    name={aiAssisting ? "hourglass-empty" : "smart-toy"} 
                    size={20} 
                    color={aiAssisting ? "#9CA3AF" : "#3B82F6"} 
                  />
                  <Text style={[styles.replyButtonText, aiAssisting && styles.replyButtonTextDisabled]}>
                    {aiAssisting ? 'Создаю ответ...' : 'AI Ответ'}
                  </Text>
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

      {/* Compose Modal */}
      <Modal visible={showCompose} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCompose(false)}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Новое письмо</Text>
            <TouchableOpacity onPress={handleComposeEmail}>
              <Text style={styles.saveButton}>Отправить</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.composeContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Кому *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="email@example.com"
                value={composeData.to}
                onChangeText={(text) => setComposeData(prev => ({ ...prev, to: text }))}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Тема *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Тема письма"
                value={composeData.subject}
                onChangeText={(text) => setComposeData(prev => ({ ...prev, subject: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.aiAssistHeader}>
                <Text style={styles.inputLabel}>Сообщение *</Text>
                <TouchableOpacity
                  style={[styles.aiButton, aiAssisting && styles.aiButtonDisabled]}
                  onPress={handleAiAssist}
                  disabled={aiAssisting}
                >
                  <MaterialIcons 
                    name={aiAssisting ? "hourglass-empty" : "smart-toy"} 
                    size={16} 
                    color={aiAssisting ? "#9CA3AF" : "#8B5CF6"} 
                  />
                  <Text style={[styles.aiButtonText, aiAssisting && styles.aiButtonTextDisabled]}>
                    {aiAssisting ? 'Помогаю...' : 'AI Помощь'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.toneSelector}>
                <Text style={styles.toneSelectorLabel}>Стиль:</Text>
                {[
                  { key: 'formal' as const, label: 'Деловой' },
                  { key: 'friendly' as const, label: 'Дружелюбный' },
                  { key: 'brief' as const, label: 'Краткий' }
                ].map(tone => (
                  <TouchableOpacity
                    key={tone.key}
                    style={[
                      styles.toneOption,
                      selectedTone === tone.key && styles.toneOptionSelected
                    ]}
                    onPress={() => setSelectedTone(tone.key)}
                  >
                    <Text style={[
                      styles.toneOptionText,
                      selectedTone === tone.key && styles.toneOptionTextSelected
                    ]}>
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Введите текст письма..."
                value={composeData.body}
                onChangeText={(text) => setComposeData(prev => ({ ...prev, body: text }))}
                multiline
                numberOfLines={8}
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
  replyButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  replyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  replyButtonTextDisabled: {
    color: '#9CA3AF',
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
  composeContent: {
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
    height: 120,
    textAlignVertical: 'top',
  },
  aiAssistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  aiButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  aiButtonTextDisabled: {
    color: '#9CA3AF',
  },
  toneSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  toneSelectorLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  toneOption: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  toneOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  toneOptionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  toneOptionTextSelected: {
    color: '#ffffff',
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