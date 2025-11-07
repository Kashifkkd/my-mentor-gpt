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
import { MicIcon, PaperclipIcon, RotateCcwIcon, Sparkles, Lightbulb, MessageSquare, BookOpen, Zap, Users, Heart, Briefcase, Code } from 'lucide-react';
import { nanoid } from 'nanoid';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { type FormEventHandler, useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { models as modelConfigs, defaultModel } from '@/lib/models';
import { assistantTypes } from '@/lib/assistant-config';
import { useTextSelection } from '@/hooks/use-text-selection';
import { TextSelectionPopup } from '@/components/text-selection-popup';
import { useCurrentSession } from '@/hooks/use-current-session';
import { EmailVerificationDialog } from '@/components/email-verification-dialog';
import { useChatEnvironment } from '@/hooks/use-chat-environment';

type ChatMessage = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  reasoning?: string;
  sources?: Array<{ title: string; url: string }>;
  isStreaming?: boolean;
};

const EMAIL_VERIFICATION_THRESHOLD = 12;

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

type Suggestion = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  prompt: string;
  color: string;
};

interface ChatWelcomeScreenProps {
  suggestions: Suggestion[];
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
    <div className="border-t p-2 sm:p-4" data-chat-input>
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

  const { workspaceId: currentWorkspaceIdFromContext } = useChatEnvironment();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState(defaultModel.id);
  const [isTyping, setIsTyping] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [conversationAssistantType, setConversationAssistantType] = useState<string | null>(null);
  const [newConversationId, setNewConversationId] = useState<string | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationData, setVerificationData] = useState({
    threshold: EMAIL_VERIFICATION_THRESHOLD,
    messagesUsed: 0,
  });

  const { refresh: refreshSession } = useCurrentSession();

  const chatInterfaceRef = useRef<HTMLDivElement>(null);

  const { text, rects, selection: textSelection } = useTextSelection();

  // Check if current selection is inside chat interface but NOT in input/textarea
  const isSelectionInsideChat = (() => {
    if (!text || text.trim().length === 0) return false;
    if (!textSelection || textSelection.rangeCount === 0) return false;
    
    const range = textSelection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    
    // Check if selection is inside chat interface
    const isInChatInterface = chatInterfaceRef.current?.contains(
      container.nodeType === Node.TEXT_NODE ? container.parentNode : container
    ) ?? false;
    
    if (!isInChatInterface) return false;
    
    // Check if selection is inside input/textarea - exclude those
    const nodeToCheck = container.nodeType === Node.TEXT_NODE ? container.parentNode : container;
    if (nodeToCheck) {
      const element = nodeToCheck as HTMLElement;
      // Check if it's inside a textarea or input
      const isInInput = element.closest('textarea, input, [data-chat-input]');
      if (isInInput) return false;
    }
    
    return true;
  })();

  useEffect(() => {
    if (conversationId && conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId);
    }
    if (!conversationId && currentConversationId) {
      setCurrentConversationId(null);
    }
  }, [conversationId, currentConversationId]);

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

        if (response.status === 401) {
          router.push('/login');
          return;
        }

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
  }, [conversationId, router]);

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
      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (assistantType) {
        requestHeaders['x-assistant-type'] = assistantType;
      }

      if (currentWorkspaceIdFromContext) {
        requestHeaders['x-workspace-id'] = currentWorkspaceIdFromContext;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          conversationId: currentConversationId,
          modelId: selectedModel,
        }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        setIsTyping(false);

        if (data?.error === 'EMAIL_VERIFICATION_REQUIRED') {
          setVerificationData({
            threshold: data.threshold ?? EMAIL_VERIFICATION_THRESHOLD,
            messagesUsed: data.messagesUsed ?? 0,
          });
          setVerificationDialogOpen(true);
          return;
        }

        if (data?.error === 'PLAN_LIMIT_REACHED') {
          const planMessage = `You've reached your ${data.plan ?? 'current'} plan limit (${data.messagesUsed ?? '—'}/${data.messageLimit ?? '—'} messages). Upgrade your plan to continue.`;
          setMessages(prev => [
            ...prev,
            {
              id: nanoid(),
              content: planMessage,
              role: 'assistant',
              timestamp: new Date(),
            },
          ]);
          return;
        }

        throw new Error(data?.error ?? 'Failed to send message');
      }

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const messagesUsedHeader = response.headers.get('X-Usage-Messages-Used');
      const messageLimitHeader = response.headers.get('X-Usage-Messages-Limit');
      if (messagesUsedHeader && messageLimitHeader) {
        window.dispatchEvent(
          new CustomEvent('usage-updated', {
            detail: {
              messagesUsed: Number(messagesUsedHeader),
              messageLimit: Number(messageLimitHeader),
            },
          }),
        );
      }

      refreshSession().catch(() => undefined);

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
                })
                  .then((res) => {
                    if (res.status === 401) {
                      router.push('/login');
                    }
                    return res;
                  })
                  .catch(err => console.error('Failed to generate summary:', err));
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
  }, [inputValue, isTyping, messages, currentConversationId, assistantType, router, selectedModel, newConversationId, refreshSession, currentWorkspaceIdFromContext]);
  
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

  const handleTextSelectionSend = useCallback((selectedText: string) => {
    // Set the selected text as the input value
    setInputValue(selectedText);
    // Focus the textarea
    const textarea = document.querySelector('textarea[placeholder*="Ask me anything"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.focus();
      // Move cursor to end
      textarea.setSelectionRange(selectedText.length, selectedText.length);
    }
    // Clear the text selection
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleTextSelectionClose = useCallback(() => {
    // Clear the text selection
    window.getSelection()?.removeAllRanges();
  }, []);

  type AssistantId = (typeof assistantTypes)[number]['id'];

  const defaultSuggestions = useMemo<Suggestion[]>(
    () => [
      {
        icon: Lightbulb,
        title: 'Get help with a concept',
        prompt: 'Explain quantum computing in simple terms',
        color: 'text-yellow-500 dark:text-yellow-400',
      },
      {
        icon: MessageSquare,
        title: 'Practice a conversation',
        prompt: 'Help me prepare for a job interview',
        color: 'text-blue-500 dark:text-blue-400',
      },
      {
        icon: BookOpen,
        title: 'Learn something new',
        prompt: 'Teach me about machine learning fundamentals',
        color: 'text-green-500 dark:text-green-400',
      },
      {
        icon: Zap,
        title: 'Get creative ideas',
        prompt: 'Suggest 5 creative project ideas for beginners',
        color: 'text-purple-500 dark:text-purple-400',
      },
    ],
    [],
  );

  const assistantSuggestionMap = useMemo<Partial<Record<AssistantId, Suggestion[]>>>(() => {
    return {
      therapist: [
        {
          icon: Heart,
          title: 'Wellbeing check-in',
          prompt: 'Help me create a daily reflection routine to manage stress.',
          color: 'text-pink-500 dark:text-pink-400',
        },
        {
          icon: Lightbulb,
          title: 'Mindfulness support',
          prompt: 'Guide me through a 5-minute grounding exercise.',
          color: 'text-yellow-500 dark:text-yellow-400',
        },
        {
          icon: MessageSquare,
          title: 'Difficult conversation prep',
          prompt: 'Help me express compassion while setting boundaries with a friend.',
          color: 'text-blue-500 dark:text-blue-400',
        },
        {
          icon: Zap,
          title: 'Mood boost activities',
          prompt: 'Suggest weekend activities that can lift my mood.',
          color: 'text-purple-500 dark:text-purple-400',
        },
      ],
      teacher: [
        {
          icon: BookOpen,
          title: 'Study plan',
          prompt: 'Design a two-week plan to master calculus fundamentals.',
          color: 'text-green-500 dark:text-green-400',
        },
        {
          icon: Lightbulb,
          title: 'Concept explanation',
          prompt: 'Explain photosynthesis for a classroom presentation.',
          color: 'text-yellow-500 dark:text-yellow-400',
        },
        {
          icon: MessageSquare,
          title: 'Quiz practice',
          prompt: 'Create a 10-question quiz on World War II history.',
          color: 'text-blue-500 dark:text-blue-400',
        },
        {
          icon: Zap,
          title: 'Learning games',
          prompt: 'Suggest interactive ways to teach geometry to middle schoolers.',
          color: 'text-purple-500 dark:text-purple-400',
        },
      ],
      mentor: [
        {
          icon: Briefcase,
          title: 'Career strategy',
          prompt: 'Outline a 90-day plan to transition into product management.',
          color: 'text-slate-500 dark:text-slate-300',
        },
        {
          icon: MessageSquare,
          title: 'Interview rehearsal',
          prompt: 'Run a mock interview for a senior software engineer role.',
          color: 'text-blue-500 dark:text-blue-400',
        },
        {
          icon: Lightbulb,
          title: 'Skill mapping',
          prompt: 'Assess my strengths and gaps for a leadership position.',
          color: 'text-yellow-500 dark:text-yellow-400',
        },
        {
          icon: Zap,
          title: 'Networking playbook',
          prompt: 'Draft outreach messages to connect with industry mentors.',
          color: 'text-purple-500 dark:text-purple-400',
        },
      ],
      coach: [
        {
          icon: Heart,
          title: 'Goal setting',
          prompt: 'Help me set SMART goals for improving work-life balance.',
          color: 'text-pink-500 dark:text-pink-400',
        },
        {
          icon: MessageSquare,
          title: 'Accountability partner',
          prompt: 'Create a weekly check-in template to track my progress.',
          color: 'text-blue-500 dark:text-blue-400',
        },
        {
          icon: Lightbulb,
          title: 'Habit design',
          prompt: 'Design a morning routine that supports my goals.',
          color: 'text-yellow-500 dark:text-yellow-400',
        },
        {
          icon: Zap,
          title: 'Motivation boost',
          prompt: 'Share affirmations for staying focused under pressure.',
          color: 'text-purple-500 dark:text-purple-400',
        },
      ],
      tutor: [
        {
          icon: BookOpen,
          title: 'Homework help',
          prompt: 'Walk me through solving quadratic equations step by step.',
          color: 'text-green-500 dark:text-green-400',
        },
        {
          icon: MessageSquare,
          title: 'Exam drill',
          prompt: 'Build flashcards for key biology vocabulary.',
          color: 'text-blue-500 dark:text-blue-400',
        },
        {
          icon: Lightbulb,
          title: 'Concept clarity',
          prompt: 'Break down Newton’s laws with real-world examples.',
          color: 'text-yellow-500 dark:text-yellow-400',
        },
        {
          icon: Zap,
          title: 'Study hacks',
          prompt: 'Recommend techniques to memorize historical dates.',
          color: 'text-purple-500 dark:text-purple-400',
        },
      ],
      advisor: [
        {
          icon: Code,
          title: 'Decision framework',
          prompt: 'Help me compare the pros and cons of two business ideas.',
          color: 'text-sky-500 dark:text-sky-400',
        },
        {
          icon: MessageSquare,
          title: 'Quick guidance',
          prompt: 'Advise me on managing conflicting stakeholder priorities.',
          color: 'text-blue-500 dark:text-blue-400',
        },
        {
          icon: Lightbulb,
          title: 'Idea validation',
          prompt: 'Evaluate a concept for a mental wellness mobile app.',
          color: 'text-yellow-500 dark:text-yellow-400',
        },
        {
          icon: Zap,
          title: 'Action plan',
          prompt: 'Draft a one-page plan to launch a side project in 30 days.',
          color: 'text-purple-500 dark:text-purple-400',
        },
      ],
    };
  }, []);

  const suggestions = useMemo(() => {
    if (effectiveAssistantType && assistantSuggestionMap[effectiveAssistantType as AssistantId]) {
      return assistantSuggestionMap[effectiveAssistantType as AssistantId] ?? defaultSuggestions;
    }
    return defaultSuggestions;
  }, [assistantSuggestionMap, defaultSuggestions, effectiveAssistantType]);

  return (
    <div 
      ref={chatInterfaceRef}
      className="flex h-full w-full flex-col overflow-hidden relative"
      data-chat-interface
    >

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

      <TextSelectionPopup
        text={text}
        rects={rects}
        isOpen={isSelectionInsideChat && text.length > 0}
        onClose={handleTextSelectionClose}
        onSend={handleTextSelectionSend}
      />

      <EmailVerificationDialog
        open={verificationDialogOpen}
        onOpenChange={setVerificationDialogOpen}
        onVerified={() => {
          setVerificationDialogOpen(false);
          refreshSession().catch(() => undefined);
        }}
        threshold={verificationData.threshold}
        messagesUsed={verificationData.messagesUsed}
      />
    </div>
  );
};
export default ChatInterface;