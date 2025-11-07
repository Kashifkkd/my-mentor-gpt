import { auth } from '@/auth';
import {
  compareVerificationCode,
  clearVerificationCode,
  findUserById,
} from '@/lib/db/users';

import { z } from 'zod';

const RequestSchema = z.object({
  code: z.string().min(6).max(6),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: 'Invalid code' }, { status: 400 });
  }

  const user = await findUserById(session.user.id);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  if (user.emailVerified) {
    return Response.json({ message: 'Email already verified' }, { status: 200 });
  }

  const verificationState = user.verification ?? {
    codeHash: null,
    expiresAt: null,
    lastSentAt: null,
  };

  if (!verificationState.codeHash || !verificationState.expiresAt) {
    return Response.json({ error: 'No verification code issued' }, { status: 400 });
  }

  if (verificationState.expiresAt < new Date()) {
    return Response.json({ error: 'Verification code expired' }, { status: 400 });
  }

  const isValid = await compareVerificationCode(
    { ...user, verification: verificationState },
    parsed.data.code,
  );
  if (!isValid) {
    return Response.json({ error: 'Invalid verification code' }, { status: 400 });
  }

  await clearVerificationCode(user._id);

  return Response.json({ message: 'Email verified successfully' });
}

