'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }).max(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

interface EmailVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified?: () => void;
  threshold: number;
  messagesUsed: number;
}

const RESEND_COOLDOWN_SECONDS = 120;

export function EmailVerificationDialog({
  open,
  onOpenChange,
  onVerified,
  threshold,
  messagesUsed,
}: EmailVerificationDialogProps) {
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: '' },
  });

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldown]);

  const resetState = useCallback(() => {
    setSending(false);
    setVerifying(false);
    setCooldown(0);
    setError(null);
    setSuccess(false);
    setCodeSent(false);
    form.reset();
  }, [form]);

  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);

  const handleSendCode = useCallback(async () => {
    try {
      setSending(true);
      setError(null);
      const response = await fetch('/api/users/verification/request', {
        method: 'POST',
      });

      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        setCooldown(data.retryAfter ?? RESEND_COOLDOWN_SECONDS);
        setError('Verification email recently sent. Please try again soon.');
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to send verification email');
      }

      setCodeSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send verification email');
    } finally {
      setSending(false);
    }
  }, []);

  const onSubmit = useCallback(async (values: z.infer<typeof FormSchema>) => {
    try {
      setVerifying(true);
      setError(null);
      const response = await fetch('/api/users/verification/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: values.pin }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Invalid verification code');
      }

      setSuccess(true);
      onVerified?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify email');
    } finally {
      setVerifying(false);
    }
  }, [onVerified]);

  const usageMessage = useMemo(() => {
    if (!codeSent) {
      return `You have sent ${messagesUsed} messages. Please verify your email to continue beyond ${threshold} messages.`;
    }
    return 'Enter the 6-digit code sent to your email.';
  }, [codeSent, messagesUsed, threshold]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Email verification required</DialogTitle>
          <DialogDescription>{usageMessage}</DialogDescription>
        </DialogHeader>

        {!success ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                We’ve sent a verification code to your registered email address. Enter it below to continue using the chat.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSendCode}
                  disabled={sending || cooldown > 0}
                >
                  {sending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Send verification email'}
                </Button>
                {codeSent && (
                  <span className="text-xs text-muted-foreground">
                    Didn’t receive a code? Check your spam folder.
                  </span>
                )}
              </div>
            </div>

            {codeSent ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-time password</FormLabel>
                        <FormControl>
                          <InputOTP maxLength={6} {...field}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                        <FormDescription>
                          Enter the 6-digit verification code sent to your email.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-0">
                    <Button type="submit" disabled={verifying}>
                      {verifying ? 'Verifying…' : 'Verify email'}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Thank you! Your email address has been verified. You can now continue chatting without interruptions.
            </p>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Continue chatting</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


