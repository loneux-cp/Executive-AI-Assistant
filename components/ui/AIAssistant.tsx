import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Platform, Alert, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AIService } from '@/services/aiService';

interface AIAssistantProps {
  onCommandExecuted?: (command: string, response: string) => void;
}

export function AIAssistant({ onCommandExecuted }: AIAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [commandHistory, setCommandHistory] = useState<Array<{command: string, response: string}>>([]);
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

  const handleVoicePress = () => {
    if (isListening) {
      setIsListening(false);
      showWebAlert('Голосовой ввод', 'В MVP версии голосовой ввод симулируется. Используйте текстовое поле для команд.');
    } else {
      setIsListening(true);
      showWebAlert('Голосовой ввод', 'Говорите... (В MVP версии используйте текстовое поле)');
      setTimeout(() => setIsListening(false), 3000);
    }
  };

  const handleSendCommand = async () => {
    if (!command.trim()) return;

    setIsProcessing(true);
    try {
      const aiResponse = await AIService.processCommand(command);
      setResponse(aiResponse);
      
      const historyItem = { command, response: aiResponse };
      setCommandHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      
      onCommandExecuted?.(command, aiResponse);
      setCommand('');
    } catch (error) {
      setResponse('Произошла ошибка при обработке команды. Попробуйте еще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons name="assistant" size={24} color="#3B82F6" />
          <Text style={styles.title}>AI Помощник</Text>
        </View>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => setShowHistory(true)}
        >
          <MaterialIcons name="history" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.voiceSection}>
        <TouchableOpacity 
          style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
          onPress={handleVoicePress}
          disabled={isProcessing}
        >
          <MaterialIcons 
            name={isListening ? "mic" : "mic-none"} 
            size={32} 
            color={isListening ? "#ffffff" : "#3B82F6"} 
          />
        </TouchableOpacity>
        <Text style={styles.voiceText}>
          {isListening ? 'Слушаю...' : 'Нажмите для голосовой команды'}
        </Text>
      </View>

      <View style={styles.inputSection}>
        <TextInput
          style={styles.textInput}
          placeholder="Или введите команду текстом..."
          placeholderTextColor="#9CA3AF"
          value={command}
          onChangeText={setCommand}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !command.trim() && styles.sendButtonDisabled]}
          onPress={handleSendCommand}
          disabled={!command.trim() || isProcessing}
        >
          <MaterialIcons 
            name="send" 
            size={20} 
            color={command.trim() ? "#ffffff" : "#9CA3AF"} 
          />
        </TouchableOpacity>
      </View>

      {(response || isProcessing) && (
        <View style={styles.responseSection}>
          <View style={styles.responseHeader}>
            <MaterialIcons name="smart-toy" size={16} color="#3B82F6" />
            <Text style={styles.responseTitle}>Ответ помощника</Text>
          </View>
          <Text style={styles.responseText}>
            {isProcessing ? 'Обрабатываю запрос...' : response}
          </Text>
        </View>
      )}

      <Modal visible={showHistory} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.historyModal, { paddingTop: insets.top }]}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>История команд</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.historyList}>
            {commandHistory.length === 0 ? (
              <Text style={styles.emptyHistory}>История команд пуста</Text>
            ) : (
              commandHistory.map((item, index) => (
                <View key={index} style={styles.historyItem}>
                  <Text style={styles.historyCommand}>{item.command}</Text>
                  <Text style={styles.historyResponse}>{item.response}</Text>
                </View>
              ))
            )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  historyButton: {
    padding: 8,
  },
  voiceSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#2563EB',
  },
  voiceText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 48,
    maxHeight: 96,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  responseSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  responseTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  responseText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  historyModal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  historyList: {
    flex: 1,
    padding: 20,
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginTop: 40,
  },
  historyItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyCommand: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  historyResponse: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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