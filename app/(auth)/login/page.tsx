import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { auth } from '@/auth';

export const metadata: Metadata = {
  title: 'Sign in | My Mentor GPT',
  description: 'Access your personalized AI mentor experience.',
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect('/chat');
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your conversations."
      footer={
        <span>
          Forgot your password?{' '}
          <a
            href="mailto:support@my-mentor-gpt.com"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Contact support
          </a>
        </span>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}

