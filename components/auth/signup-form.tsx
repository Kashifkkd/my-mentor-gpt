'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { signupAction, type SignupFormState } from '@/app/(auth)/signup/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const initialState: SignupFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="redirectTo" value="/chat" />
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          Full name
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ada Lovelace"
          autoComplete="name"
          aria-invalid={state.errors?.name ? 'true' : 'false'}
          aria-describedby={state.errors?.name ? 'name-error' : undefined}
          required
        />
        {state.errors?.name ? (
          <p id="name-error" className="text-sm text-destructive" aria-live="polite">
            {state.errors.name[0]}
          </p>
        ) : null}
      </div>

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
          placeholder="Create a strong password"
          autoComplete="new-password"
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
            Creating account...
          </span>
        ) : (
          'Create account'
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

