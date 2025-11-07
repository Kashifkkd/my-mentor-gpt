import { auth } from '@/auth';
import {
  canResendVerification,
  findUserById,
  setVerificationCode,
} from '@/lib/db/users';
import { sendVerificationEmail } from '@/lib/email/send-verification-email';

const RESEND_COOLDOWN_SECONDS = 120;
const CODE_EXPIRATION_MINUTES = 10;

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
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

  const canResend = await canResendVerification(
    { ...user, verification: verificationState },
    RESEND_COOLDOWN_SECONDS,
  );
  if (!canResend) {
    const lastSentAt = verificationState.lastSentAt?.getTime() ?? 0;
    const retryAfterSeconds = Math.max(
      0,
      RESEND_COOLDOWN_SECONDS - Math.floor((Date.now() - lastSentAt) / 1000),
    );
    return Response.json(
      {
        error: 'RATE_LIMITED',
        retryAfter: retryAfterSeconds,
      },
      { status: 429 },
    );
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000);

  try {
    await sendVerificationEmail({
      email: user.email,
      name: user.name ?? null,
      code,
      expiresInMinutes: CODE_EXPIRATION_MINUTES,
    });
  } catch (error) {
    console.error('Failed to send verification email', error);
    return Response.json({ error: 'Unable to send verification email' }, { status: 500 });
  }

  await setVerificationCode(user._id, code, expiresAt);

  return Response.json({ message: 'Verification code sent' });
}

