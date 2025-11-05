'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  SquarePlus,
  Settings,
  LogOut,
  ChevronDown,
  Bot,
  Trash2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { ConversationSummary } from '@/models/conversation';
import type { Workspace } from '@/lib/types/assistant';

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

interface ChatSidebarProps {
  user: User;
  workspace: Workspace;
  conversations?: ConversationSummary[];
  isLoading?: boolean;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const primaryNavigation = [
  {
    id: 'chat',
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    id: 'assistant',
    name: 'Assistant',
    href: '/chat?assistant=mentor',
    icon: Bot,
  },
];

function getInitials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ChatSidebar({
  user,
  conversations = [],
  isLoading = false,
  onNewChat,
  onDeleteConversation,
  isMobileOpen = false,
  onMobileClose,
}: ChatSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isHovered, setIsHovered] = useState(false);
  const assistantParam = searchParams.get('assistant');

  // Check if we're on /chat or /chat/[id]
  // Assistant is active when assistant param is present, otherwise chat is active
  const activeModule = assistantParam ? 'assistant' : 'chat';

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Render sidebar content
  const renderSidebarContent = () => (
    <div className="flex h-full relative">
      {/* Primary Sidebar - Fixed width, expands as overlay on desktop */}
      <div
        className="w-16 flex flex-col bg-sidebar border-r border-sidebar-border relative z-30"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Overlay expansion - Desktop only */}
        <div
          className={cn(
            'hidden md:block absolute left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40',
            isHovered ? 'w-64 opacity-100' : 'w-16 opacity-0 pointer-events-none'
          )}
        >
          {/* Expanded content */}
          <div className="p-2 space-y-2 h-full flex flex-col">
            <nav className="flex-1 space-y-2">
              {primaryNavigation.map((item) => {
                const isActive = activeModule === item.id;
                const Icon = item.icon;

                return (
                  <div key={item.id}>
                    <Link href={item.href}>
                      <Button
                        variant="secondary"
                        className={cn(
                          'w-full justify-start h-10 relative cursor-pointer shadow-none',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80'
                            : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5 mr-3 stroke-2" />
                        <span className="flex-1 text-left text-sm">{item.name}</span>
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sidebar-primary rounded-r" />
                        )}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </nav>

            {/* User Menu in overlay */}
            <div className="p-3 border-t border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-auto p-2 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground w-full justify-start cursor-pointer shadow-none"
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(user.name || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">
                          {user.name || user.email}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {}}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Collapsed content */}
        <nav className="flex-1 p-2 space-y-2">
          {primaryNavigation.map((item) => {
            const isActive = activeModule === item.id;
            const Icon = item.icon;

            return (
              <div key={item.id}>
                <Link href={item.href}>
                  <Button
                    variant="secondary"
                    className={cn(
                      'w-full justify-center h-10 relative cursor-pointer px-2 shadow-none',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80'
                        : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                    )}
                    title={item.name}
                  >
                    <Icon className="h-5 w-5 stroke-2" />
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sidebar-primary rounded-r" />
                    )}
                  </Button>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User Menu collapsed */}
        <div className="p-3 border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="h-auto p-2 bg-[#1a1a1a] hover:bg-accent/50 hover:text-accent-foreground w-full justify-center cursor-pointer shadow-none"
              >
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user.name || user.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {}}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Secondary Sidebar - Conversation list (Desktop) */}
      <div className="hidden md:block w-80 bg-sidebar border-r border-sidebar-border flex-shrink-0 relative z-20">
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-sidebar-foreground truncate">
              Conversations {conversations.length > 0 && `(${conversations.length})`}
            </h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-fit"
                    onClick={onNewChat}
                  >
                    <SquarePlus className="h-8 w-8 stroke-2" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <nav className="p-5 space-y-2 overflow-y-auto h-[calc(100%-80px)]">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 h-10 px-4">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
                <div className="flex-1 h-4 bg-gray-300 rounded animate-pulse" />
              </div>
            ))
          ) : conversations.length > 0 ? (
            conversations.map((conversation) => {
              const isActive = pathname === `/chat/${conversation.id}`;
              return (
                <div
                  key={conversation.id}
                  className={cn(
                    'group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <Link
                    href={assistantParam 
                      ? `/chat/${conversation.id}?assistant=${assistantParam}`
                      : `/chat/${conversation.id}`
                    }
                    className="flex-1 min-w-0"
                  >
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 flex-shrink-0 stroke-2" />
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-sm font-medium truncate",
                          isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
                        )}>
                          {conversation.title || 'New Conversation'}
                        </div>
                        <div className={cn(
                          "text-xs",
                          isActive ? "text-sidebar-accent-foreground/70" : "text-sidebar-foreground/60"
                        )}>
                          {conversation.messageCount} messages
                        </div>
                      </div>
                    </div>
                  </Link>
                  {onDeleteConversation && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault();
                        onDeleteConversation(conversation.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 px-4">
              <div className="text-sm text-muted-foreground">
                No conversations yet
              </div>
              <div className="text-xs text-muted-foreground/70 mt-1">
                Start a new chat to get started
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );

  // Render conversations list (for mobile drawer)
  const renderConversationsList = () => (
    <div className="flex-1 bg-sidebar border-l border-sidebar-border flex-shrink-0 relative z-20 overflow-hidden flex flex-col min-w-0">
      <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-sidebar-border w-full">
        <div className="flex items-center justify-between w-full gap-2">
          <h3 className="text-lg font-semibold text-sidebar-foreground truncate flex-1 min-w-0">
            Conversations {conversations.length > 0 && `(${conversations.length})`}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={onNewChat}
          >
            <SquarePlus className="h-4 w-4 stroke-2" />
          </Button>
        </div>
      </div>

      <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto min-h-0 w-full">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 h-10 px-4">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
              <div className="flex-1 h-4 bg-gray-300 rounded animate-pulse" />
            </div>
          ))
        ) : conversations.length > 0 ? (
          conversations.map((conversation) => {
            const isActive = pathname === `/chat/${conversation.id}`;
            return (
              <div
                key={conversation.id}
                className={cn(
                  'group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
                onClick={onMobileClose}
              >
                <Link
                  href={assistantParam 
                    ? `/chat/${conversation.id}?assistant=${assistantParam}`
                    : `/chat/${conversation.id}`
                  }
                  className="flex-1 min-w-0"
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4 flex-shrink-0 stroke-2" />
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-medium truncate",
                        isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
                      )}>
                        {conversation.title || 'New Conversation'}
                      </div>
                      <div className={cn(
                        "text-xs",
                        isActive ? "text-sidebar-accent-foreground/70" : "text-sidebar-foreground/60"
                      )}>
                        {conversation.messageCount} messages
                      </div>
                    </div>
                  </div>
                </Link>
                {onDeleteConversation && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteConversation(conversation.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 px-4">
            <div className="text-sm text-muted-foreground">
              No conversations yet
            </div>
            <div className="text-xs text-muted-foreground/70 mt-1">
              Start a new chat to get started
            </div>
          </div>
        )}
      </nav>
    </div>
  );

  // Desktop sidebar (always visible on md+)
  const desktopSidebar = (
    <div className="hidden md:flex h-full relative">
      {renderSidebarContent()}
    </div>
  );

  // Mobile sidebar (drawer) - with navigation on left and conversations on right
  const mobileSidebar = (
    <Sheet open={isMobileOpen} onOpenChange={onMobileClose}>
      <SheetContent 
        side="left"
        className="w-[90vw] p-0 h-full overflow-hidden flex flex-col gap-0"
        showCloseButton={false}
      >
        <SheetHeader className="px-4 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-hidden flex w-full min-w-0">
          {/* Left side - Navigation */}
          <div className="w-16 flex flex-col bg-sidebar border-r border-sidebar-border relative z-30 flex-shrink-0">
            <nav className="flex-1 p-2 space-y-2">
              {primaryNavigation.map((item) => {
                const isActive = activeModule === item.id;
                const Icon = item.icon;

                return (
                  <div key={item.id}>
                    <Link href={item.href} onClick={onMobileClose}>
                      <Button
                        variant="secondary"
                        className={cn(
                          'w-full justify-center h-10 relative cursor-pointer px-2 shadow-none',
                          isActive
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80'
                            : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                        title={item.name}
                      >
                        <Icon className="h-5 w-5 stroke-2" />
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sidebar-primary rounded-r" />
                        )}
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </nav>
            {/* User Menu collapsed */}
            <div className="p-3 border-t border-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-auto p-2 bg-[#1a1a1a] hover:bg-accent/50 hover:text-accent-foreground w-full justify-center cursor-pointer shadow-none"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {}}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Right side - Conversations */}
          {renderConversationsList()}
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}

