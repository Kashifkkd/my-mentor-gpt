import { auth } from '@/auth';
import { findUserById, refreshUserUsageIfNeeded } from '@/lib/db/users';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await findUserById(session.user.id);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }

  const refreshedUser = await refreshUserUsageIfNeeded(user);

  return Response.json({
    plan: refreshedUser.plan,
    emailVerified: Boolean(refreshedUser.emailVerified),
    usage: {
      messagesUsed: refreshedUser.usage.messagesUsed,
      messageLimit: refreshedUser.usage.messageLimit,
      resetAt: refreshedUser.usage.resetAt,
    },
  });
}

