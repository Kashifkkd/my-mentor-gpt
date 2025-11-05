import { NextRequest, NextResponse } from 'next/server';
import {
  getConversations,
  createConversation,
} from '@/lib/db/conversations';

/**
 * GET /api/conversations
 * Get all conversations with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || undefined;
    const workspaceId = searchParams.get('workspaceId') || undefined;
    const assistantType = searchParams.get('assistantType') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const conversations = await getConversations(
      userId,
      workspaceId,
      assistantType,
      limit
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages = [], userId, workspaceId, assistantType, title, customFields } = body;

    const conversationId = await createConversation(
      messages,
      userId,
      workspaceId,
      assistantType,
      customFields
    );

    // Update title if provided
    if (title && conversationId) {
      const { updateConversationTitle } = await import('@/lib/db/conversations');
      await updateConversationTitle(conversationId, title);
    }

    return NextResponse.json({ 
      id: conversationId,
      message: 'Conversation created successfully' 
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}

