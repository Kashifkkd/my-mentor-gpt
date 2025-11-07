import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string;
      plan: 'free' | 'pro' | 'enterprise';
      emailVerified: boolean;
      usage: {
        messagesUsed: number;
        messageLimit: number;
      };
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    hashedPassword?: string;
    plan?: 'free' | 'pro' | 'enterprise';
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string;
    plan?: 'free' | 'pro' | 'enterprise';
    emailVerified?: boolean;
    messagesUsed?: number;
    messageLimit?: number;
  }
}

