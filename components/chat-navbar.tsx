'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sparkles, Search, Bell, Menu, LogOut } from 'lucide-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { ModeToggle } from '@/components/mode-toggle';
import { defaultWorkspaces } from '@/lib/assistant-config';
import type { Workspace } from '@/lib/types/assistant';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentSession } from '@/hooks/use-current-session';

interface ChatNavbarProps {
  workspaces?: Workspace[];
  currentWorkspace?: Workspace;
  onWorkspaceChange?: (workspaceId: string) => void;
  onMobileMenuClick?: () => void;
}

export function ChatNavbar({
  workspaces = defaultWorkspaces,
  currentWorkspace,
  onWorkspaceChange,
  onMobileMenuClick,
}: ChatNavbarProps) {
  type UsageSummary = {
    messagesUsed: number;
    messageLimit: number;
    plan: 'free' | 'pro' | 'enterprise';
  };

  const { session, status } = useCurrentSession();
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const activeWorkspaceId = currentWorkspace?.id || workspaces?.[0]?.id || '';

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }

    let isMounted = true;

    const loadUsage = async () => {
      try {
        const response = await fetch('/api/users/usage');
        if (!response.ok) return;
        const data = await response.json();
        if (!isMounted) return;
        setUsage({
          messagesUsed: data.usage.messagesUsed,
          messageLimit: data.usage.messageLimit,
          plan: (data.plan ?? 'free') as UsageSummary['plan'],
        });
      } catch (error) {
        console.error('Failed to load usage information:', error);
      }
    };

    const handleUsageUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ messagesUsed: number; messageLimit: number }>).detail;
      if (!detail) return;
      const fallbackPlan = (session?.user.plan ?? 'free') as UsageSummary['plan'];
      setUsage((prevUsage: UsageSummary | null) => ({
        plan: prevUsage?.plan ?? fallbackPlan,
        messagesUsed: detail.messagesUsed,
        messageLimit: detail.messageLimit,
      }));
    };

    loadUsage();
    window.addEventListener('usage-updated', handleUsageUpdated as EventListener);

    return () => {
      isMounted = false;
      window.removeEventListener('usage-updated', handleUsageUpdated as EventListener);
    };
  }, [status, session?.user.plan]);

  const userInitials = useMemo(() => {
    const name = session?.user?.name;
    if (!name) return session?.user?.email?.charAt(0)?.toUpperCase() ?? 'U';
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [session?.user?.email, session?.user?.name]);

  const handleWorkspaceChange = (workspaceId: string) => {
    onWorkspaceChange?.(workspaceId);
  };

  const handleSignOut = () => {
    void signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="w-full border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-2 sm:px-4">
        {/* Left side - Mobile menu, Logo/Title */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={onMobileMenuClick}
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            href="/"
            className="flex items-center space-x-2 text-foreground transition-colors hover:text-primary"
            aria-label="Go to dashboard home"
          >
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold sm:text-lg">My Mentor GPT</span>
          </Link>

          {/* Workspace Selector - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex items-center space-x-3 ml-4">
            <Combobox
              options={workspaces.map((workspace) => ({
                value: workspace.id,
                label: workspace.name,
              }))}
              value={activeWorkspaceId}
              onValueChange={handleWorkspaceChange}
              placeholder="Select workspace"
              searchPlaceholder="Search workspaces..."
              emptyMessage="No workspace found."
              className="w-auto min-w-[180px]"
            />
          </div>
        </div>

        {/* Right side - Search box, Notification, Theme Toggle, Profile */}
        <div className="flex items-center justify-end space-x-1 sm:space-x-3">
          {/* Search box - Hidden on mobile */}
          <div className="hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="h-9 w-48 xl:w-64 pl-9 pr-3"
            />
          </div>

          {/* Notification button - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hidden sm:flex"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {status === 'authenticated' && usage ? (
            <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground sm:flex">
              <span>
                Usage {usage.messagesUsed}/{usage.messageLimit}
              </span>
              {usage.plan === 'free' ? (
                <Button asChild size="sm" variant="outline" className='px-2 py-1 text-sm'>
                  <a href="#pricing" className='text-sm'>Upgrade</a>
                </Button>
              ) : null}
            </div>
          ) : null}

          <ModeToggle />

          {status === 'authenticated' && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center rounded-full border border-transparent p-0.5 hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label="User menu"
                >
                  <Avatar className="size-8">
                    {session.user.image ? (
                      <AvatarImage src={session.user.image} alt={session.user.name ?? session.user.email ?? 'User'} />
                    ) : null}
                    <AvatarFallback className="text-xs font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {session.user.name ?? 'Account'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : status === 'loading' ? (
            <Button variant="ghost" size="sm" disabled className="inline-flex">
              Loading…
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm" className="inline-flex">
              <a href="/login">Sign in</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

