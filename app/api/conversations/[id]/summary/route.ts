import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { getConversation, updateConversationInsights } from '@/lib/db/conversations';
import { generateConversationInsights } from '@/lib/ai/summary-generator';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Get the conversation
    const conversation = await getConversation(conversationId);

    if (!conversation || conversation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Generate insights
    const insights = await generateConversationInsights(
      conversation.messages,
      conversation.assistantType
    );

    // Update conversation with insights
    await updateConversationInsights(conversationId, insights);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating conversation summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }

    // Get the conversation
    const conversation = await getConversation(conversationId);

    if (!conversation || conversation.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ insights: conversation.insights || null });
  } catch (error) {
    console.error('Error fetching conversation summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}

