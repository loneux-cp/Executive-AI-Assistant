import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Modal, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useDocuments } from '@/hooks/useDocuments';
import { AIService } from '@/services/aiService';
import { Document } from '@/types';

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { documents, addDocument, deleteDocument, updateDocument } = useDocuments();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return 'picture-as-pdf';
      case 'docx': return 'description';
      case 'txt': return 'text-snippet';
      default: return 'insert-drive-file';
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return '#EF4444';
      case 'docx': return '#3B82F6';
      case 'txt': return '#10B981';
      default: return '#6B7280';
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'txt';
        
        const newDocument: Omit<Document, 'id' | 'uploadedAt'> = {
          name: file.name,
          type: fileExtension as 'pdf' | 'docx' | 'txt',
          size: file.size || 0,
        };

        addDocument(newDocument);
        showWebAlert('Успех', `Документ "${file.name}" успешно загружен!`);
      }
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось загрузить документ. Попробуйте еще раз.');
    }
  };

  const handleAnalyzeDocument = async (document: Document) => {
    setAnalyzing(true);
    try {
      const analysis = await AIService.analyzeDocument(document);
      updateDocument(document.id, { summary: analysis });
      showWebAlert('Анализ завершен', 'Документ успешно проанализирован!');
    } catch (error) {
      showWebAlert('Ошибка', 'Не удалось проанализировать документ.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteDocument = (docId: string, docName: string) => {
    showWebAlert(
      'Удалить документ',
      `Вы уверены, что хотите удалить "${docName}"?`,
      () => {
        deleteDocument(docId);
        setSelectedDocument(null);
        showWebAlert('Удалено', 'Документ удален успешно');
      }
    );
  };

  const handlePreviewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowPreview(true);
  };

  const generateMockPreview = (document: Document) => {
    const mockContent = {
      pdf: `📄 ${document.name}\n\nЭто предпросмотр PDF документа.\n\nВ полной версии здесь будет отображаться:\n• Текстовое содержимое\n• Изображения\n• Таблицы\n• Диаграммы\n\nДля MVP показана заглушка.`,
      docx: `📝 ${document.name}\n\nПредпросмотр DOCX документа.\n\nОсновные разделы:\n1. Введение\n2. Основная часть\n3. Заключение\n\nВ реальном приложении здесь будет полный текст документа.`,
      txt: `📄 ${document.name}\n\nТекстовый файл готов к просмотру.\n\nСодержание:\n- Структурированный текст\n- Основные разделы\n- Ключевые пункты\n\nВ MVP версии показан пример содержимого.`
    };
    
    return mockContent[document.type] || mockContent.txt;
  };

  const sortedDocuments = documents.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Документы</Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handlePickDocument}
        >
          <MaterialIcons name="upload-file" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {documents.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>Нет документов</Text>
            <Text style={styles.emptySubtext}>Загрузите документы для AI анализа</Text>
            <TouchableOpacity style={styles.uploadPrompt} onPress={handlePickDocument}>
              <MaterialIcons name="cloud-upload" size={24} color="#3B82F6" />
              <Text style={styles.uploadPromptText}>Загрузить документ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedDocuments.map(document => (
            <TouchableOpacity
              key={document.id}
              style={styles.documentItem}
              onPress={() => setSelectedDocument(document)}
              activeOpacity={0.7}
            >
              <View style={styles.documentHeader}>
                <MaterialIcons
                  name={getFileIcon(document.type)}
                  size={28}
                  color={getFileTypeColor(document.type)}
                />
                <View style={styles.documentInfo}>
                  <Text style={styles.documentName} numberOfLines={1}>
                    {document.name}
                  </Text>
                  <View style={styles.documentMeta}>
                    <Text style={styles.documentSize}>
                      {formatFileSize(document.size)}
                    </Text>
                    <Text style={styles.documentDate}>
                      {formatDate(document.uploadedAt)}
                    </Text>
                  </View>
                </View>
                <View style={styles.documentActions}>
                  {document.summary && (
                    <MaterialIcons name="psychology" size={16} color="#10B981" />
                  )}
                  <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Document Detail Modal */}
      <Modal visible={!!selectedDocument && !showPreview} animationType="slide" presentationStyle="pageSheet">
        {selectedDocument && (
          <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedDocument(null)}>
                <MaterialIcons name="arrow-back" size={24} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedDocument.name}
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => handlePreviewDocument(selectedDocument)}
                  style={styles.previewButton}
                >
                  <MaterialIcons name="visibility" size={24} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteDocument(selectedDocument.id, selectedDocument.name)}
                  style={styles.deleteButton}
                >
                  <MaterialIcons name="delete" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView style={styles.documentContent}>
              <View style={styles.documentDetails}>
                <View style={styles.detailRow}>
                  <MaterialIcons 
                    name={getFileIcon(selectedDocument.type)} 
                    size={32} 
                    color={getFileTypeColor(selectedDocument.type)} 
                  />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Тип файла</Text>
                    <Text style={styles.detailValue}>{selectedDocument.type.toUpperCase()}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <MaterialIcons name="storage" size={24} color="#6B7280" />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Размер</Text>
                    <Text style={styles.detailValue}>{formatFileSize(selectedDocument.size)}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <MaterialIcons name="schedule" size={24} color="#6B7280" />
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailLabel}>Загружен</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedDocument.uploadedAt)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.analysisSection}>
                <View style={styles.analysisSectionHeader}>
                  <Text style={styles.sectionTitle}>AI Анализ</Text>
                  {!selectedDocument.summary && (
                    <TouchableOpacity
                      style={[styles.analyzeButton, analyzing && styles.analyzeButtonDisabled]}
                      onPress={() => handleAnalyzeDocument(selectedDocument)}
                      disabled={analyzing}
                    >
                      <MaterialIcons 
                        name={analyzing ? "hourglass-empty" : "psychology"} 
                        size={16} 
                        color="#ffffff" 
                      />
                      <Text style={styles.analyzeButtonText}>
                        {analyzing ? 'Анализирую...' : 'Анализировать'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {selectedDocument.summary ? (
                  <View style={styles.summaryContainer}>
                    <Text style={styles.summaryText}>{selectedDocument.summary}</Text>
                    <TouchableOpacity
                      style={styles.reAnalyzeButton}
                      onPress={() => handleAnalyzeDocument(selectedDocument)}
                      disabled={analyzing}
                    >
                      <MaterialIcons name="refresh" size={16} color="#3B82F6" />
                      <Text style={styles.reAnalyzeButtonText}>Обновить анализ</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noAnalysis}>
                    <MaterialIcons name="psychology" size={32} color="#9CA3AF" />
                    <Text style={styles.noAnalysisText}>
                      Документ еще не проанализирован
                    </Text>
                    <Text style={styles.noAnalysisSubtext}>
                      AI анализ поможет выделить ключевые моменты, найти важные даты и создать задачи
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.quickActions}>
                <Text style={styles.sectionTitle}>Быстрые действия</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => showWebAlert('Создание задач', 'В реальном приложении здесь будут созданы задачи на основе содержимого документа')}
                  >
                    <MaterialIcons name="add-task" size={20} color="#3B82F6" />
                    <Text style={styles.actionButtonText}>Создать задачи</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => showWebAlert('Календарь', 'Даты из документа будут добавлены в календарь')}
                  >
                    <MaterialIcons name="event" size={20} color="#10B981" />
                    <Text style={styles.actionButtonText}>В календарь</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => showWebAlert('Поиск', 'Функция поиска по документу будет добавлена')}
                  >
                    <MaterialIcons name="search" size={20} color="#F59E0B" />
                    <Text style={styles.actionButtonText}>Поиск</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* Document Preview Modal */}
      <Modal visible={showPreview} animationType="slide" presentationStyle="fullScreen">
        {selectedDocument && (
          <View style={[styles.previewContainer, { paddingTop: insets.top }]}>
            <View style={styles.previewHeader}>
              <TouchableOpacity onPress={() => setShowPreview(false)}>
                <MaterialIcons name="close" size={24} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedDocument.name}
              </Text>
              <TouchableOpacity
                onPress={() => showWebAlert('Поделиться', 'Функция будет добавлена в следующих версиях')}
              >
                <MaterialIcons name="share" size={24} color="#3B82F6" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.previewContent}>
              <Text style={styles.previewText}>
                {generateMockPreview(selectedDocument)}
              </Text>
              
              <View style={styles.previewFooter}>
                <Text style={styles.previewFooterText}>
                  В полной версии здесь будет отображаться реальное содержимое документа
                </Text>
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
  uploadButton: {
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
    textAlign: 'center',
  },
  uploadPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  uploadPromptText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3B82F6',
  },
  documentItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  documentSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  documentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  documentContent: {
    flex: 1,
    padding: 20,
  },
  documentDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailInfo: {
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
    marginTop: 2,
  },
  analysisSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  analysisSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  analyzeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  summaryContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
  },
  summaryText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  reAnalyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  reAnalyzeButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  noAnalysis: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noAnalysisText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
  },
  noAnalysisSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  quickActions: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  previewTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
    textAlign: 'center',
  },
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  previewFooter: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginTop: 32,
  },
  previewFooterText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
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