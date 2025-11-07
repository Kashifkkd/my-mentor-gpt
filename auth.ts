import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { authConfig } from './auth.config';
import clientPromise from '@/lib/db';
import { findUserByEmail, findUserById, refreshUserUsageIfNeeded } from '@/lib/db/users';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const authResult = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'Email & Password',
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const existingUser = await findUserByEmail(email);

        if (!existingUser?.hashedPassword) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          password,
          existingUser.hashedPassword,
        );

        if (!isValidPassword) {
          return null;
        }

        return {
          id: existingUser._id.toString(),
          name: existingUser.name ?? undefined,
          email: existingUser.email,
          emailVerified: existingUser.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.plan = (token as any).plan ?? 'free';
        session.user.emailVerified = Boolean((token as any).emailVerified);
        session.user.usage = {
          messagesUsed: (token as any).messagesUsed ?? 0,
          messageLimit: (token as any).messageLimit ?? 0,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      const userId = user?.id ?? token.sub;
      if (!userId) {
        return token;
      }

      const dbUser = await findUserById(userId);
      if (!dbUser) {
        return token;
      }

      const refreshedUser = await refreshUserUsageIfNeeded(dbUser);
      (token as any).plan = refreshedUser.plan;
      (token as any).emailVerified = Boolean(refreshedUser.emailVerified);
      (token as any).messagesUsed = refreshedUser.usage.messagesUsed;
      (token as any).messageLimit = refreshedUser.usage.messageLimit;
      return token;
    },
  },
});

export const { auth, signIn, signOut } = authResult;
export const GET = authResult.handlers.GET;
export const POST = authResult.handlers.POST;

