import { getDb } from '@/lib/db';
import { ObjectId, type Collection } from 'mongodb';
import bcrypt from 'bcryptjs';

const COLLECTION_NAME = 'users';

export interface StoredUser {
  _id: ObjectId;
  name?: string | null;
  email: string;
  emailVerified: Date | null;
  image?: string | null;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
  plan: 'free' | 'pro' | 'enterprise';
  usage: {
    messagesUsed: number;
    messageLimit: number;
    resetAt: Date;
  };
  verification: {
    codeHash: string | null;
    expiresAt: Date | null;
    lastSentAt: Date | null;
  };
}

async function getUsersCollection(): Promise<Collection<StoredUser>> {
  const db = await getDb();
  const collection = db.collection<StoredUser>(COLLECTION_NAME);

  await collection.createIndex({ email: 1 }, { unique: true });

  return collection;
}

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  const users = await getUsersCollection();
  return users.findOne({ email });
}

export async function findUserById(userId: string | ObjectId): Promise<StoredUser | null> {
  const users = await getUsersCollection();
  const _id = typeof userId === 'string' ? new ObjectId(userId) : userId;
  const user = await users.findOne({ _id });
  if (!user) return null;

  let needsUpdate = false;
  const updates: Partial<StoredUser> = {} as Partial<StoredUser>;

  if (!user.plan) {
    (updates as any).plan = 'free';
    needsUpdate = true;
  }

  if (!user.usage || typeof user.usage.messageLimit === 'undefined') {
    (updates as any).usage = {
      messagesUsed: user.usage?.messagesUsed ?? 0,
      messageLimit: getDefaultMessageLimit((updates as any).plan ?? user.plan ?? 'free'),
      resetAt: getNextResetDate(new Date()),
    };
    needsUpdate = true;
  }

  if (!user.verification) {
    (updates as any).verification = {
      codeHash: null,
      expiresAt: null,
      lastSentAt: null,
    };
    needsUpdate = true;
  }

  if (needsUpdate) {
    await users.updateOne(
      { _id },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    );
    return {
      ...user,
      ...updates,
      plan: (updates as any).plan ?? user.plan ?? 'free',
      usage: (updates as any).usage ?? user.usage!,
      verification: (updates as any).verification ?? user.verification!,
    } as StoredUser;
  }

  return user;
}

interface CreateUserInput {
  name?: string;
  email: string;
  hashedPassword: string;
}

export async function createUser({
  name,
  email,
  hashedPassword,
}: CreateUserInput): Promise<StoredUser> {
  const users = await getUsersCollection();
  const now = new Date();

  const result = await users.insertOne({
    name: name ?? null,
    email,
    emailVerified: null,
    image: null,
    hashedPassword,
    createdAt: now,
    updatedAt: now,
    plan: 'free',
    usage: {
      messagesUsed: 0,
      messageLimit: 50,
      resetAt: getNextResetDate(now),
    },
    verification: {
      codeHash: null,
      expiresAt: null,
      lastSentAt: null,
    },
  } as StoredUser);

  const insertedUser = await users.findOne({ _id: result.insertedId });
  if (!insertedUser) {
    throw new Error('Failed to create user');
  }

  return insertedUser;
}

function getNextResetDate(from: Date): Date {
  const reset = new Date(from);
  reset.setMonth(reset.getMonth() + 1);
  reset.setHours(0, 0, 0, 0);
  return reset;
}

export async function updateUserPassword(
  userId: ObjectId,
  hashedPassword: string,
): Promise<void> {
  const users = await getUsersCollection();

  await users.updateOne(
    { _id: userId },
    {
      $set: {
        hashedPassword,
        updatedAt: new Date(),
      },
    },
  );
}

export async function incrementUserMessageUsage(
  userId: string | ObjectId,
  amount: number = 1,
): Promise<StoredUser | null> {
  const users = await getUsersCollection();
  const _id = typeof userId === 'string' ? new ObjectId(userId) : userId;

  const user = await users.findOne({ _id });
  if (!user) return null;

  const now = new Date();
  let { usage } = user;

  if (!usage || usage.resetAt < now) {
    usage = {
      messagesUsed: 0,
      messageLimit: usage?.messageLimit ?? getDefaultMessageLimit(user.plan),
      resetAt: getNextResetDate(now),
    };
  }

  usage.messagesUsed += amount;

  await users.updateOne(
    { _id },
    {
      $set: {
        usage,
        updatedAt: now,
      },
    },
  );

  return users.findOne({ _id });
}

export function getDefaultMessageLimit(plan: 'free' | 'pro' | 'enterprise'): number {
  switch (plan) {
    case 'pro':
      return 1000;
    case 'enterprise':
      return 10000;
    case 'free':
    default:
      return 50;
  }
}

export async function refreshUserUsageIfNeeded(user: StoredUser): Promise<StoredUser> {
  const users = await getUsersCollection();
  const now = new Date();

  if (user.usage.resetAt > now) {
    return user;
  }

  const updatedUsage = {
    messagesUsed: 0,
    messageLimit: getDefaultMessageLimit(user.plan),
    resetAt: getNextResetDate(now),
  };

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        usage: updatedUsage,
        updatedAt: now,
      },
    },
  );

  return {
    ...user,
    usage: updatedUsage,
    updatedAt: now,
  };
}

export async function setVerificationCode(
  userId: string | ObjectId,
  code: string,
  expiresAt: Date,
): Promise<void> {
  const users = await getUsersCollection();
  const _id = typeof userId === 'string' ? new ObjectId(userId) : userId;
  const codeHash = await bcrypt.hash(code, 10);
  await users.updateOne(
    { _id },
    {
      $set: {
        'verification.codeHash': codeHash,
        'verification.expiresAt': expiresAt,
        'verification.lastSentAt': new Date(),
      },
    },
  );
}

export async function clearVerificationCode(userId: string | ObjectId): Promise<void> {
  const users = await getUsersCollection();
  const _id = typeof userId === 'string' ? new ObjectId(userId) : userId;
  await users.updateOne(
    { _id },
    {
      $set: {
        emailVerified: new Date(),
        'verification.codeHash': null,
        'verification.expiresAt': null,
        'verification.lastSentAt': null,
        updatedAt: new Date(),
      },
    },
  );
}

export async function canResendVerification(user: StoredUser, cooldownSeconds: number): Promise<boolean> {
  const lastSentAt = user.verification?.lastSentAt;
  if (!lastSentAt) return true;
  const now = Date.now();
  return now - lastSentAt.getTime() >= cooldownSeconds * 1000;
}

export async function compareVerificationCode(user: StoredUser, code: string): Promise<boolean> {
  if (!user.verification.codeHash) {
    return false;
  }
  return bcrypt.compare(code, user.verification.codeHash);
}

