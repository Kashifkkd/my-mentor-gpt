'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { loginAction, type LoginFormState } from '@/app/(auth)/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: LoginFormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="redirectTo" value="/chat" />
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={state.errors?.email ? 'true' : 'false'}
          aria-describedby={state.errors?.email ? 'email-error' : undefined}
          required
        />
        {state.errors?.email ? (
          <p id="email-error" className="text-sm text-destructive" aria-live="polite">
            {state.errors.email[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="********"
          autoComplete="current-password"
          aria-invalid={state.errors?.password ? 'true' : 'false'}
          aria-describedby={state.errors?.password ? 'password-error' : undefined}
          required
        />
        {state.errors?.password ? (
          <p id="password-error" className="text-sm text-destructive" aria-live="polite">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" aria-live="polite">
          {state.message}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </span>
        ) : (
          'Sign in'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}

