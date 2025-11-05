import { getDb } from '@/lib/db';
import type { Conversation, ConversationSummary } from '@/models/conversation';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'conversations';

/**
 * Database operations for conversations
 * These are pure database functions - no API logic
 */

/**
 * Create a new conversation
 */
export async function createConversation(
  initialMessages: Conversation['messages'] = [],
  userId?: string,
  workspaceId?: string,
  assistantType?: string,
  customFields?: Record<string, string>
): Promise<string> {
  const db = await getDb();
  const conversation = {
    userId,
    workspaceId,
    assistantType,
    customFields,
    messages: initialMessages,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection(COLLECTION_NAME).insertOne(conversation);
  return result.insertedId.toString();
}

/**
 * Get a conversation by ID
 */
export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  const db = await getDb();
  
  if (!ObjectId.isValid(conversationId)) {
    return null;
  }

  const conversation = await db
    .collection(COLLECTION_NAME)
    .findOne({ _id: new ObjectId(conversationId) });

  if (!conversation) {
    return null;
  }

  // Convert _id to id
  const { _id, ...rest } = conversation;
  return {
    ...rest,
    id: _id.toString(),
  } as Conversation;
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  conversationId: string,
  message: Conversation['messages'][0]
): Promise<void> {
  const db = await getDb();
  
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  await db.collection(COLLECTION_NAME).updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $push: { messages: message },
      $set: { updatedAt: new Date() },
    } as unknown as Record<string, unknown>
  );
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  const db = await getDb();
  
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  await db.collection(COLLECTION_NAME).updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $set: { title, updatedAt: new Date() },
    }
  );
}

/**
 * Get all conversations for a user (optional)
 */
export async function getConversations(
  userId?: string,
  workspaceId?: string,
  assistantType?: string,
  limit: number = 50
): Promise<ConversationSummary[]> {
  const db = await getDb();
  
  const query: Record<string, unknown> = {};
  if (userId) query.userId = userId;
  if (workspaceId) query.workspaceId = workspaceId;
  if (assistantType) query.assistantType = assistantType;
  
  const conversations = await db
    .collection(COLLECTION_NAME)
    .find(query)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();

  return conversations.map((conv) => ({
    id: conv._id!.toString(),
    title: conv.title,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
    messageCount: conv.messages.length,
    workspaceId: conv.workspaceId,
    assistantType: conv.assistantType,
  }));
}

/**
 * Delete a conversation
 */
export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const db = await getDb();
  
  if (!ObjectId.isValid(conversationId)) {
    throw new Error('Invalid conversation ID');
  }

  await db.collection(COLLECTION_NAME).deleteOne({
    _id: new ObjectId(conversationId),
  });
}
