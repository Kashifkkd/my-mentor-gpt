/**
 * Conversation model types
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface Conversation {
  id?: string;
  userId?: string;
  workspaceId?: string;
  assistantType?: string;
  title?: string;
  customFields?: Record<string, string>; // User-provided fields for assistant customization
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationSummary {
  id: string;
  title?: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  workspaceId?: string;
  assistantType?: string;
}

