import { auth } from '@/auth';
import { redirect } from 'next/navigation';

interface AssistantsRouteLayoutProps {
  children: React.ReactNode;
}

export default async function AssistantsRouteLayout({ children }: AssistantsRouteLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <>{children}</>;
}

