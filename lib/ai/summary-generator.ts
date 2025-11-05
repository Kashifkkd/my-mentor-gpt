import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { groq } from '@ai-sdk/groq';
import type { ChatMessage, ConversationInsights } from '@/models/conversation';
import { getModelConfig, defaultModel } from '@/lib/models';

/**
 * Generate conversation summary and insights using AI
 */
export async function generateConversationInsights(
  messages: ChatMessage[],
  assistantType?: string
): Promise<ConversationInsights> {
  // Use a lightweight, fast model for summary generation (prefer free Groq models)
  const modelConfig = getModelConfig('llama-3.1-8b-instant') || defaultModel;
  
  // Build context from messages
  const conversationText = messages
    .filter(msg => msg.role !== 'system')
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');

  // Create assistant-specific prompts
  const assistantPrompts: Record<string, string> = {
    therapist: `You are analyzing a therapy session conversation. Extract:
- Topics discussed (e.g., anxiety, depression, relationships, coping strategies)
- Therapeutic objectives (what the client is working towards)
- Key insights and progress points
- Overall progress estimate (0-100) based on engagement and depth of discussion

Focus on mental health themes, emotional patterns, and therapeutic goals.`,
    
    teacher: `You are analyzing an educational conversation. Extract:
- Subjects and topics covered (e.g., mathematics, algebra, problem-solving)
- Learning objectives (what the student is trying to learn)
- Key concepts and important takeaways
- Progress estimate (0-100) based on understanding demonstrated

Focus on educational content, learning goals, and knowledge gaps.`,
    
    mentor: `You are analyzing a mentorship conversation. Extract:
- Career or professional topics discussed
- Goals and objectives (what the mentee wants to achieve)
- Key advice and insights shared
- Progress estimate (0-100) based on clarity and actionability

Focus on professional development, career goals, and actionable advice.`,
  };

  const systemPrompt = assistantPrompts[assistantType || 'mentor'] || assistantPrompts.mentor;

  const prompt = `${systemPrompt}

Conversation:
${conversationText}

Please provide a JSON response with this exact structure:
{
  "topics": ["topic1", "topic2"],
  "objectives": ["objective1", "objective2"],
  "keyPoints": ["point1", "point2", "point3"],
  "progress": 45
}

Be concise and specific. Extract 3-5 topics, 2-4 objectives, and 3-6 key points. Progress should be 0-100.`;

  try {
    let result;
    
    if (modelConfig.provider === 'groq') {
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY not configured');
      }
      result = await generateText({
        model: groq('llama-3.1-8b-instant'),
        prompt,
      });
    } else {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
      }
      result = await generateText({
        model: openai(modelConfig.id),
        prompt,
      });
    }

    // Parse the JSON response
    const text = result.text.trim();
    let insights: Partial<ConversationInsights>;
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      insights = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback: try to parse the entire response
      insights = JSON.parse(text);
    }

    // Validate and format the response
    return {
      topics: Array.isArray(insights.topics) ? insights.topics : [],
      objectives: Array.isArray(insights.objectives) ? insights.objectives : [],
      keyPoints: Array.isArray(insights.keyPoints) ? insights.keyPoints : [],
      progress: typeof insights.progress === 'number' 
        ? Math.max(0, Math.min(100, insights.progress)) 
        : 0,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error generating conversation insights:', error);
    
    // Return default insights on error
    return {
      topics: [],
      objectives: [],
      keyPoints: [],
      progress: 0,
      lastUpdated: new Date(),
    };
  }
}

