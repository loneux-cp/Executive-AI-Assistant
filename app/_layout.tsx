import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TaskProvider } from '@/contexts/TaskContext';
import { CalendarProvider } from '@/contexts/CalendarContext';
import { EmailProvider } from '@/contexts/EmailContext';
import { DocumentProvider } from '@/contexts/DocumentContext';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TaskProvider>
        <CalendarProvider>
          <EmailProvider>
            <DocumentProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
              </Stack>
              <StatusBar style="auto" />
            </DocumentProvider>
          </EmailProvider>
        </CalendarProvider>
      </TaskProvider>
    </SafeAreaProvider>
  );
}