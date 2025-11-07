import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthShell } from '@/components/auth/auth-shell';
import { SignupForm } from '@/components/auth/signup-form';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Create an account | My Mentor GPT',
  description: 'Join My Mentor GPT to get tailored AI mentorship.',
};

export default async function SignupPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/chat');
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your journey with a smarter mentor."
    >
      <SignupForm />
    </AuthShell>
  );
}

