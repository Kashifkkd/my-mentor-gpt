/**
 * Conversation model types
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ConversationInsights {
  topics: string[];           // ["mental health", "anxiety", "stress management"]
  objectives: string[];       // ["manage anxiety", "develop coping strategies"]
  keyPoints: string[];        // Important points discussed
  progress: number;           // 0-100, how much progress made
  lastUpdated: Date;
}

export interface Conversation {
  id?: string;
  userId?: string;
  workspaceId?: string;
  assistantType?: string;
  title?: string;
  customFields?: Record<string, string>; // User-provided fields for assistant customization
  messages: ChatMessage[];
  insights?: ConversationInsights; // AI-generated summary and insights
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

