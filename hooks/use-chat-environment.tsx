'use client';

import { createContext, useContext } from 'react';

interface ChatEnvironmentValue {
  workspaceId: string | null;
  assistantType: string | null;
}

const ChatEnvironmentContext = createContext<ChatEnvironmentValue | undefined>(undefined);

interface ChatEnvironmentProviderProps {
  value: ChatEnvironmentValue;
  children: React.ReactNode;
}

export function ChatEnvironmentProvider({ value, children }: ChatEnvironmentProviderProps) {
  return (
    <ChatEnvironmentContext.Provider value={value}>{children}</ChatEnvironmentContext.Provider>
  );
}

export function useChatEnvironment() {
  const context = useContext(ChatEnvironmentContext);
  if (!context) {
    throw new Error('useChatEnvironment must be used within a ChatEnvironmentProvider');
  }
  return context;
}


