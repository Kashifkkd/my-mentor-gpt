'use client';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation';
import { Loader } from '@/components/ui/shadcn-io/ai/loader';
import { Message, MessageAvatar, MessageContent } from '@/components/ui/shadcn-io/ai/message';
import { Response } from '@/components/ui/shadcn-io/ai/response';
import {
  PromptInput,
  PromptInputButton,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ui/shadcn-io/ai/reasoning';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ui/shadcn-io/ai/source';
import { Button } from '@/components/ui/button';
import { MicIcon, PaperclipIcon, RotateCcwIcon, Sparkles, Lightbulb, MessageSquare, BookOpen, Zap, Users } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { type FormEventHandler, useCallback, useState, useEffect } from 'react';
import { models as modelConfigs, defaultModel } from '@/lib/models';
import { assistantTypes } from '@/lib/assistant-config';

type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  reasoning?: string;
  sources?: Array<{ title: string; url: string }>;
  isStreaming?: boolean;
};

// ============================================================================
// Sub-components
// ============================================================================

interface ChatHeaderProps {
  assistantName: string;
  selectedModel: string;
  currentConversationId: string | null;
  conversationAssistantType: string | null;
  onReset: () => void;
}

function ChatHeader({
  assistantName,
  selectedModel,
  currentConversationId,
  conversationAssistantType,
  onReset,
}: ChatHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const isCollabMode = tab === 'collab';

  const handleCollabClick = () => {
    const baseUrl = currentConversationId ? `/chat/${currentConversationId}` : '/chat';
    const assistantParam = conversationAssistantType ? `&assistant=${conversationAssistantType}` : '';
    if (!isCollabMode) {
      router.push(`${baseUrl}?tab=collab${assistantParam}`);
    } else {
      router.push(`${baseUrl}${assistantParam ? `?${assistantParam.slice(1)}` : ''}`);
    }
  };

  const handleInsightsClick = () => {
    const baseUrl = currentConversationId ? `/chat/${currentConversationId}` : '/chat';
    const assistantParam = conversationAssistantType ? `&assistant=${conversationAssistantType}` : '';
    router.push(`${baseUrl}?tab=insights${assistantParam}`);
  };

  return (
    <div className="flex items-center justify-between border-b bg-muted/50 px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="size-2 rounded-full bg-green-500 flex-shrink-0" />
          <span className="font-medium text-xs sm:text-sm truncate">{assistantName}</span>
        </div>
        <div className="h-4 w-px bg-border flex-shrink-0" />
        <span className="text-muted-foreground text-xs truncate hidden sm:inline">
          {modelConfigs.find(m => m.id === selectedModel)?.name || 'Unknown Model'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {/* Collaboration Toggle - Available for all */}
        {currentConversationId && (
          <Button
            variant={isCollabMode ? "default" : "ghost"}
            size="sm"
            onClick={handleCollabClick}
            className="h-8 px-2 flex-shrink-0"
          >
            <Users className="size-4" />
            <span className="ml-1 hidden sm:inline">Collab</span>
          </Button>
        )}
        {/* Insights Button - only show if not in collab mode */}
        {!isCollabMode && currentConversationId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInsightsClick}
            className="h-8 px-2 flex-shrink-0"
          >
            <Sparkles className="size-4" />
            <span className="ml-1 hidden sm:inline">Insights</span>
          </Button>
        )}
        {/* Reset Button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onReset}
          className="h-8 px-2 flex-shrink-0"
        >
          <RotateCcwIcon className="size-4" />
          <span className="ml-1 hidden sm:inline">Reset</span>
        </Button>
      </div>
    </div>
  );
}

interface ChatWelcomeScreenProps {
  suggestions: Array<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    prompt: string;
    color: string;
  }>;
  onSuggestionClick: (prompt: string) => void;
}

function ChatWelcomeScreen({ suggestions, onSuggestionClick }: ChatWelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center h-full px-2 sm:px-4">
      <div className="w-full max-w-3xl mx-auto space-y-6 sm:space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 text-primary relative z-10" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            How can I help you today?
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto px-2">
            Ask me anything, and I&apos;ll do my best to assist you with information, guidance, or creative ideas.
          </p>
        </div>

        {/* Suggested Prompts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 px-2">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion.prompt)}
                className="group relative p-3 sm:p-4 rounded-lg border border-border bg-card hover:bg-accent transition-all duration-200 text-left hover:shadow-md hover:border-primary/50"
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className={`mt-0.5 ${suggestion.color} flex-shrink-0`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {suggestion.prompt}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            💡 Tip: You can also type your own question in the input below
          </p>
        </div>
      </div>
    </div>
  );
}

interface ChatMessageItemProps {
  message: ChatMessage;
}

function ChatMessageItem({ message }: ChatMessageItemProps) {
  return (
    <div className="space-y-3">
      <Message from={message.role}>
        <MessageContent>
          {message.isStreaming && message.content === '' ? (
            <div className="flex items-center gap-2">
              <Loader size={14} />
              <span className="text-muted-foreground text-sm">Thinking...</span>
            </div>
          ) : (
            <Response parseIncompleteMarkdown={message.isStreaming}>
              {message.content}
            </Response>
          )}
        </MessageContent>
        <MessageAvatar 
          src={message.role === 'user' ? 'https://github.com/dovazencot.png' : 'https://github.com/vercel.png'} 
          name={message.role === 'user' ? 'User' : 'AI'} 
        />
      </Message>
      {/* Reasoning */}
      {message.reasoning && (
        <div className="ml-10">
          <Reasoning isStreaming={message.isStreaming} defaultOpen={false}>
            <ReasoningTrigger />
            <ReasoningContent>{message.reasoning}</ReasoningContent>
          </Reasoning>
        </div>
      )}
      {/* Sources */}
      {message.sources && message.sources.length > 0 && (
        <div className="ml-10">
          <Sources>
            <SourcesTrigger count={message.sources.length} />
            <SourcesContent>
              {message.sources.map((source, index) => (
                <Source key={index} href={source.url} title={source.title} />
              ))}
            </SourcesContent>
          </Sources>
        </div>
      )}
    </div>
  );
}

interface ChatInputAreaProps {
  inputValue: string;
  selectedModel: string;
  isTyping: boolean;
  onInputChange: (value: string) => void;
  onModelChange: (modelId: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

function ChatInputArea({
  inputValue,
  selectedModel,
  isTyping,
  onInputChange,
  onModelChange,
  onSubmit,
}: ChatInputAreaProps) {
  return (
    <div className="border-t p-2 sm:p-4">
      <PromptInput onSubmit={onSubmit}>
        <PromptInputTextarea
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask me anything..."
          disabled={isTyping}
          className="text-sm sm:text-base"
        />
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputButton disabled={isTyping}>
              <PaperclipIcon size={16} />
            </PromptInputButton>
            <PromptInputButton disabled={isTyping}>
              <MicIcon size={16} />
              <span>Voice</span>
            </PromptInputButton>
            <PromptInputModelSelect 
              value={selectedModel} 
              onValueChange={onModelChange}
              disabled={isTyping}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {modelConfigs.map((model) => (
                  <PromptInputModelSelectItem key={model.id} value={model.id}>
                    <div className="flex items-center gap-2">
                      <span>{model.name}</span>
                      {model.isFree && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                          Free
                        </span>
                      )}
                    </div>
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>
          <PromptInputSubmit 
            disabled={!inputValue.trim() || isTyping}
            status={isTyping ? 'streaming' : 'ready'}
          />
        </PromptInputToolbar>
      </PromptInput>
    </div>
  );
}

function ChatLoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2">
        <Loader size={14} />
        <span className="text-muted-foreground text-sm">Loading conversation...</span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const ChatInterface = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const conversationId = pathname.startsWith('/chat/') && pathname !== '/chat' && pathname !== '/chat/history' 
    ? pathname.split('/chat/')[1] 
    : null;
  const assistantType = searchParams.get('assistant') || null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState(defaultModel.id);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [conversationAssistantType, setConversationAssistantType] = useState<string | null>(null);
  const [newConversationId, setNewConversationId] = useState<string | null>(null);

  // Load messages from conversation when conversationId is present
  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      setIsLoadingMessages(true);
      try {
        const response = await fetch(`/api/conversations/${conversationId}`);
        if (response.ok) {
          const data = await response.json();
          const conversation = data.conversation;
          if (conversation) {
            // Store assistant type from conversation
            if (conversation.assistantType) {
              setConversationAssistantType(conversation.assistantType);
            }
            // Convert conversation messages to ChatMessage format
            if (conversation.messages) {
              const loadedMessages: ChatMessage[] = conversation.messages.map((msg: { role: string; content: string; timestamp?: Date }) => ({
                id: nanoid(),
                content: msg.content,
                role: msg.role as 'user' | 'assistant',
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
              }));
              setMessages(loadedMessages);
            }
          }
        } else {
          console.error('Failed to load conversation');
          setMessages([]);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  // Update assistant type when URL param changes
  useEffect(() => {
    if (assistantType) {
      setConversationAssistantType(assistantType);
    }
  }, [assistantType]);
  
  const handleSubmit: FormEventHandler<HTMLFormElement> = useCallback(async (event) => {
    event.preventDefault();
    
    if (!inputValue.trim() || isTyping) return;
    
    const userMessageContent = inputValue.trim();
    
    // Add user message
    const userMessage: ChatMessage = {
      id: nanoid(),
      content: userMessageContent,
      role: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call API to create conversation and get response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(assistantType && { 'x-assistant-type': assistantType }),
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          conversationId: currentConversationId,
          modelId: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Get conversation ID from response header
      const newConversationIdFromHeader = response.headers.get('X-Conversation-Id');
      
      // If this is the first message and no conversation ID exists, navigate to new URL
      if (!currentConversationId && newConversationIdFromHeader) {
        setCurrentConversationId(newConversationIdFromHeader);
        setNewConversationId(newConversationIdFromHeader);
        // Build URL with assistant param if present
        const url = assistantType 
          ? `/chat/${newConversationIdFromHeader}?assistant=${assistantType}`
          : `/chat/${newConversationIdFromHeader}`;
        router.push(url);
        // Trigger a refresh of the conversation list in parent
        window.dispatchEvent(new CustomEvent('conversation-created', { detail: { id: newConversationIdFromHeader } }));
      } else if (newConversationIdFromHeader) {
        setNewConversationId(newConversationIdFromHeader);
      }

      // Read the streaming response
      // AI SDK's toTextStreamResponse() streams plain text chunks
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      const assistantMessageId = nanoid();
      
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages(prev => [...prev, assistantMessage]);

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Decode the chunk and append to full response
            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;
            
            // Update message with streaming content in real-time
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse, isStreaming: true }
                : msg
            ));
          }
          
          // Flush any remaining bytes
          decoder.decode();
          
          // Mark as complete
          setMessages(prev => {
            const updated = prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse, isStreaming: false }
                : msg
            );
            
            // Auto-generate summary after 5+ messages (including the assistant response)
            const conversationIdForSummary = currentConversationId || newConversationId;
            if (updated.length >= 5 && conversationIdForSummary) {
              // Trigger summary generation in background after a short delay
              setTimeout(() => {
                fetch(`/api/conversations/${conversationIdForSummary}/summary`, {
                  method: 'POST',
                }).catch(err => console.error('Failed to generate summary:', err));
              }, 2000);
            }
            
            return updated;
          });
        } catch (streamError) {
          console.error('Error reading stream:', streamError);
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: fullResponse || 'Error reading stream', isStreaming: false }
              : msg
          ));
        } finally {
          setIsTyping(false);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      // Show error message to user
      const errorMessageId = nanoid();
      const errorMessage: ChatMessage = {
        id: errorMessageId,
        content: 'Sorry, I encountered an error while processing your message. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [inputValue, isTyping, messages, currentConversationId, assistantType, router, selectedModel, newConversationId]);
  
  const handleReset = useCallback(() => {
    setMessages([]);
    setInputValue('');
    setIsTyping(false);
    setCurrentConversationId(null);
    setConversationAssistantType(null);
    // Navigate to base chat page
    const url = assistantType ? `/chat?assistant=${assistantType}` : '/chat';
    router.push(url);
  }, [assistantType, router]);

  // Get assistant name from assistantType (from URL or conversation)
  const effectiveAssistantType = conversationAssistantType || assistantType;
  const selectedAssistant = assistantTypes.find(a => a.id === effectiveAssistantType);
  const assistantName = selectedAssistant?.name || 'AI Assistant';

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputValue(suggestion);
    // Focus the textarea
    const textarea = document.querySelector('textarea[placeholder*="Ask me anything"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      // Move cursor to end
      textarea.setSelectionRange(suggestion.length, suggestion.length);
    }
  }, []);

  const suggestions = [
    {
      icon: Lightbulb,
      title: "Get help with a concept",
      prompt: "Explain quantum computing in simple terms",
      color: "text-yellow-500 dark:text-yellow-400"
    },
    {
      icon: MessageSquare,
      title: "Practice a conversation",
      prompt: "Help me prepare for a job interview",
      color: "text-blue-500 dark:text-blue-400"
    },
    {
      icon: BookOpen,
      title: "Learn something new",
      prompt: "Teach me about machine learning fundamentals",
      color: "text-green-500 dark:text-green-400"
    },
    {
      icon: Zap,
      title: "Get creative ideas",
      prompt: "Suggest 5 creative project ideas for beginners",
      color: "text-purple-500 dark:text-purple-400"
    }
  ];

  // Note: Tab-based routing is now handled at the page level
  // This component only renders chat interface

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-none md:rounded-xl border-0 md:border bg-background shadow-sm relative">

      <ChatHeader
        assistantName={assistantName}
        selectedModel={selectedModel}
        currentConversationId={currentConversationId}
        conversationAssistantType={conversationAssistantType}
        onReset={handleReset}
      />

      <Conversation className="flex-1">
        <ConversationContent className="space-y-4">
          {isLoadingMessages ? (
            <ChatLoadingState />
          ) : messages.length === 0 ? (
            <ChatWelcomeScreen
              suggestions={suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          ) : (
            messages.map((message) => (
              <ChatMessageItem key={message.id} message={message} />
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <ChatInputArea
        inputValue={inputValue}
        selectedModel={selectedModel}
        isTyping={isTyping}
        onInputChange={setInputValue}
        onModelChange={setSelectedModel}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
export default ChatInterface;