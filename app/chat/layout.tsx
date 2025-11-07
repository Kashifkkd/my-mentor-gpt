import { auth } from '@/auth';
import { redirect } from 'next/navigation';

interface ChatRouteLayoutProps {
  children: React.ReactNode;
}

export default async function ChatRouteLayout({ children }: ChatRouteLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return <>{children}</>;
}

