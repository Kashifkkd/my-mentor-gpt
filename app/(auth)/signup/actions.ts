'use server';

import bcrypt from 'bcryptjs';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { signIn } from '@/auth';
import { createUser, findUserByEmail } from '@/lib/db/users';

const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .max(100, { message: 'Name must be at most 100 characters long.' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Enter a valid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long.' })
    .max(128, { message: 'Password must be at most 128 characters long.' }),
  redirectTo: z.string().optional(),
});

export type SignupFormState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string;
};

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData,
): Promise<SignupFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo'),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password, redirectTo } = parsed.data;

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return {
      message: 'An account with this email already exists. Please sign in instead.',
    };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await createUser({
    name,
    email,
    hashedPassword,
  });

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: redirectTo || '/chat',
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        message: 'Your account was created, but we could not sign you in. Please try logging in.',
      };
    }

    throw error;
  }

  return {};
}

