import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';
import {
  createConversation,
  getConversation,
  addMessage,
  updateConversationTitle,
} from '@/lib/db/conversations';
import { getModelConfig, defaultModel } from '@/lib/models';
import type { ChatMessage } from '@/models/conversation';
import { buildSystemPrompt } from '@/lib/assistant-fields';
import { auth } from '@/auth';
import {
  findUserById,
  refreshUserUsageIfNeeded,
  incrementUserMessageUsage,
} from '@/lib/db/users';

// Console colors for highlighting
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const EMAIL_VERIFICATION_THRESHOLD = 12;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await findUserById(session.user.id);
    if (!dbUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const userWithUsage = await refreshUserUsageIfNeeded(dbUser);

    if (!userWithUsage.emailVerified && userWithUsage.usage.messagesUsed >= EMAIL_VERIFICATION_THRESHOLD) {
      return Response.json(
        {
          error: 'EMAIL_VERIFICATION_REQUIRED',
          messagesUsed: userWithUsage.usage.messagesUsed,
          threshold: EMAIL_VERIFICATION_THRESHOLD,
        },
        { status: 403 },
      );
    }

    if (userWithUsage.usage.messagesUsed >= userWithUsage.usage.messageLimit) {
      return Response.json(
        {
          error: 'PLAN_LIMIT_REACHED',
          plan: userWithUsage.plan,
          messagesUsed: userWithUsage.usage.messagesUsed,
          messageLimit: userWithUsage.usage.messageLimit,
        },
        { status: 403 },
      );
    }

    const { messages, conversationId, modelId } = await request.json();

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const updatedUserUsage = await incrementUserMessageUsage(userWithUsage._id);

    const usageSummary = {
      messagesUsed: updatedUserUsage?.usage.messagesUsed ?? userWithUsage.usage.messagesUsed + 1,
      messageLimit: updatedUserUsage?.usage.messageLimit ?? userWithUsage.usage.messageLimit,
    };

    // Get model configuration
    const selectedModelId = modelId || defaultModel.id;
    const modelConfig = getModelConfig(selectedModelId) || defaultModel;
    
    // Validate API keys based on provider
    if (modelConfig.provider === 'groq') {
      if (!process.env.GROQ_API_KEY) {
        console.error(
          `${colors.red}${colors.bright}❌ Groq:${colors.reset} ${colors.red}GROQ_API_KEY not found in environment variables${colors.reset}`
        );
        return Response.json(
          { error: 'Groq API key is not configured. Get a free API key at https://console.groq.com' },
          { status: 500 }
        );
      }
    } else if (modelConfig.provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) {
        console.error(
          `${colors.red}${colors.bright}❌ OpenAI:${colors.reset} ${colors.red}OPENAI_API_KEY not found in environment variables${colors.reset}`
        );
        return Response.json(
          { error: 'OpenAI API key is not configured' },
          { status: 500 }
        );
      }
    }

    // Log provider configuration
    const providerName = modelConfig.provider === 'groq' ? 'Groq' : 'OpenAI';
    const apiKeyEnv = modelConfig.provider === 'groq' ? 'GROQ_API_KEY' : 'OPENAI_API_KEY';
    const apiKey = process.env[apiKeyEnv] || '';
    const apiKeyPrefix = apiKey.substring(0, 7);
    
    console.log(
      `${colors.blue}${colors.bright}🤖 ${providerName}:${colors.reset} ${colors.cyan}Initializing connection...${colors.reset}`
    );
    console.log(
      `${colors.blue}${colors.bright}   Model:${colors.reset} ${colors.yellow}${modelConfig.name} (${modelConfig.id})${colors.reset}`
    );
    console.log(
      `${colors.blue}${colors.bright}   Provider:${colors.reset} ${colors.yellow}${modelConfig.provider}${modelConfig.isFree ? ' (Free)' : ' (Paid)'}${colors.reset}`
    );
    console.log(
      `${colors.blue}${colors.bright}   API Key:${colors.reset} ${colors.yellow}${apiKeyPrefix}...${colors.reset}`
    );

    // Get the last user message (the new one being sent)
    const lastUserMessage = messages
      .filter((msg: ChatMessage) => msg.role === 'user')
      .pop();

    // Handle conversation storage
    let currentConversationId = conversationId;
    const userId = session.user.id;

    // Extract workspace and assistant type from request
    const workspaceId = request.headers.get('x-workspace-id') || undefined;
    const assistantType = request.headers.get('x-assistant-type') || undefined;

    // Get conversation to access customFields (for existing conversations)
    let conversation = null;
    if (currentConversationId) {
      conversation = await getConversation(currentConversationId);
      if (!conversation) {
        return Response.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
    }

    // Build system prompt if conversation has customFields and assistantType
    // This applies to both new and existing conversations
    const effectiveAssistantType = conversation?.assistantType || assistantType;
    const effectiveCustomFields = conversation?.customFields;
    
    if (effectiveAssistantType && effectiveCustomFields) {
      const systemPrompt = buildSystemPrompt(
        effectiveAssistantType,
        effectiveCustomFields
      );

      // Prepend system message if not already present
      const hasSystemMessage = messages.some((msg: ChatMessage) => msg.role === 'system');
      if (!hasSystemMessage && systemPrompt) {
        messages.unshift({
          role: 'system',
          content: systemPrompt,
        });
      }
    }

    // If no conversation ID, create a new conversation
    if (!currentConversationId) {
      // Save all messages except the last user message (we'll save it separately)
      const previousMessages = messages.slice(0, -1);
      currentConversationId = await createConversation(
        previousMessages,
        userId,
        workspaceId,
        assistantType
      );
    }

    // Save the user message to database
    if (lastUserMessage) {
      await addMessage(currentConversationId, {
        ...lastUserMessage,
        timestamp: new Date(),
      });
    }

    // Get the appropriate model instance based on provider
    let model;
    if (modelConfig.provider === 'groq') {
      model = groq(modelConfig.id);
      console.log(
        `${colors.blue}${colors.bright}🔄 Groq:${colors.reset} ${colors.cyan}Sending request to Groq...${colors.reset}`
      );
    } else if (modelConfig.provider === 'openai') {
      model = openai(modelConfig.id);
      console.log(
        `${colors.blue}${colors.bright}🔄 OpenAI:${colors.reset} ${colors.cyan}Sending request to OpenAI...${colors.reset}`
      );
    } else {
      return Response.json(
        { error: `Unsupported provider: ${modelConfig.provider}` },
        { status: 400 }
      );
    }
    
    const result = await streamText({
      model,
      messages: messages.map((msg: ChatMessage) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      temperature: 0.7,
      // Save the response to database after streaming completes
      onFinish: async ({ text, finishReason, usage }) => {
        try {
          // Handle finishReason - it might be undefined
          const reason = finishReason || 'completed';
          const finishReasonDisplay = 
            reason === 'stop' ? 'completed' : 
            reason === 'length' ? 'token limit' : 
            reason === 'content-filter' ? 'filtered' : 
            reason === 'tool-calls' ? 'tool calls' :
            reason === 'error' ? 'error' :
            reason === 'other' ? 'other' :
            reason === 'unknown' ? 'unknown' :
            reason;
          
          console.log(
            `${colors.green}${colors.bright}✅ ${providerName}:${colors.reset} ${colors.green}Response received (${finishReasonDisplay})${colors.reset}`
          );
          
          // Log usage statistics if available
          if (usage) {
            // Log usage object - structure may vary by provider
            console.log(
              `${colors.cyan}${colors.bright}📊 ${providerName} Usage:${colors.reset} ${colors.cyan}${JSON.stringify(usage)}${colors.reset}`
            );
          }
          
          if (text && text.trim()) {
            // Save the assistant response to database
            await addMessage(currentConversationId, {
              role: 'assistant',
              content: text,
              timestamp: new Date(),
            });
            console.log(
              `${colors.green}${colors.bright}💾 MongoDB:${colors.reset} ${colors.green}Message saved to database${colors.reset}`
            );

            // Update conversation title if this is the first message
            const conversation = await getConversation(currentConversationId);
            if (conversation && !conversation.title && lastUserMessage) {
              // Generate a simple title from the first user message
              const title = lastUserMessage.content.slice(0, 50);
              await updateConversationTitle(currentConversationId, title);
              console.log(
                `${colors.green}${colors.bright}📝 MongoDB:${colors.reset} ${colors.green}Conversation title updated${colors.reset}`
              );
            }
          }
        } catch (error) {
          console.error(
            `${colors.red}${colors.bright}❌ MongoDB:${colors.reset} ${colors.red}Error saving message: ${error instanceof Error ? error.message : 'Unknown error'}${colors.reset}`
          );
          // Don't throw - we don't want to fail the request if DB save fails
        }
      },
    });

    console.log(
      `${colors.blue}${colors.bright}📡 ${providerName}:${colors.reset} ${colors.cyan}Streaming response to client...${colors.reset}`
    );

    // Return the streaming response directly
    // The AI SDK handles the streaming format properly
    return result.toTextStreamResponse({
      headers: {
        'X-Conversation-Id': currentConversationId,
        'X-Usage-Messages-Used': String(usageSummary.messagesUsed),
        'X-Usage-Messages-Limit': String(usageSummary.messageLimit),
      },
    });
  } catch (error) {
    console.error(
      `${colors.red}${colors.bright}❌ Chat API Error:${colors.reset} ${colors.red}${error instanceof Error ? error.message : 'Unknown error'}${colors.reset}`
    );
    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

