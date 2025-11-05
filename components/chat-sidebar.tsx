'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  MessageSquare,
  SquarePlus,
  Settings,
  LogOut,
  ChevronDown,
  Bot,
  Trash2,
  X,
  Search,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { getAssistantIcon } from '@/lib/assistant-config';

// ============================================================================
// Types & Constants
// ============================================================================

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

interface AssistantListItem {
  id: string;
  name: string;
  description?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
}

interface ChatSidebarProps {
  user: User;
  workspace: Workspace;
  conversations?: ConversationSummary[];
  assistants?: AssistantListItem[];
  isLoading?: boolean;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavigationItem {
  id: string;
  name: string;
  href: string;
  icon: typeof MessageSquare;
}

const primaryNavigation: NavigationItem[] = [
  {
    id: 'chat',
    name: 'Chat',
    href: '/chat',
    icon: MessageSquare,
  },
  {
    id: 'assistant',
    name: 'Assistant',
    href: '/assistants',
    icon: Bot,
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

function getInitials(name?: string) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================================================
// Loading & Empty State Components
// ============================================================================

function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 h-10 px-4">
          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
          <div className="flex-1 h-4 bg-gray-300 rounded animate-pulse" />
        </div>
      ))}
    </>
  );
}

function EmptyState({ 
  message, 
  subMessage 
}: { 
  message: string; 
  subMessage?: string;
}) {
  return (
    <div className="text-center py-8 px-4">
      <div className="text-sm text-muted-foreground">{message}</div>
      {subMessage && (
        <div className="text-xs text-muted-foreground/70 mt-1">{subMessage}</div>
      )}
    </div>
  );
}

// ============================================================================
// Navigation Components
// ============================================================================

interface PrimaryNavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
}

function PrimaryNavigationItem({ 
  item, 
  isActive, 
  isExpanded = false,
  onClick 
}: PrimaryNavigationItemProps) {
  const Icon = item.icon;
  
  if (isExpanded) {
    return (
      <Link href={item.href} onClick={onClick}>
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
    );
  }

  return (
    <Link href={item.href} onClick={onClick}>
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
  );
}

// ============================================================================
// User Menu Components
// ============================================================================

interface UserMenuProps {
  user: User;
  isExpanded?: boolean;
}

function UserMenu({ user, isExpanded = false }: UserMenuProps) {
  const menuContent = (
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
  );

  if (isExpanded) {
    return (
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
          {menuContent}
        </DropdownMenu>
      </div>
    );
  }

  return (
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
        {menuContent}
      </DropdownMenu>
    </div>
  );
}

// ============================================================================
// Conversation Components
// ============================================================================

interface ConversationItemProps {
  conversation: ConversationSummary;
  isActive: boolean;
  assistantParam: string | null;
  onDelete?: (id: string) => void;
  onClick?: () => void;
}

function ConversationItem({ 
  conversation, 
  isActive, 
  assistantParam,
  onDelete,
  onClick 
}: ConversationItemProps) {
  const href = assistantParam 
    ? `/chat/${conversation.id}?assistant=${assistantParam}`
    : `/chat/${conversation.id}`;

  return (
    <div
      className={cn(
        'group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
      onClick={onClick}
    >
      <Link href={href} className="flex-1 min-w-0">
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
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(conversation.id);
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

interface ConversationsListProps {
  conversations: ConversationSummary[];
  isLoading: boolean;
  pathname: string;
  assistantParam: string | null;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
  onItemClick?: () => void;
}

function ConversationsList({
  conversations,
  isLoading,
  pathname,
  assistantParam,
  onNewChat,
  onDeleteConversation,
  onItemClick,
}: ConversationsListProps) {
  return (
    <>
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-sidebar-foreground truncate">
            Conversations {conversations.length > 0 && `(${conversations.length})`}
          </h3>
          {onNewChat && (
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
          )}
        </div>
      </div>
      <nav className="p-5 space-y-2 overflow-y-auto h-[calc(100%-80px)] scrollbar-hide">
        {isLoading ? (
          <LoadingSkeleton />
        ) : conversations.length > 0 ? (
          conversations.map((conversation) => {
            const isActive = pathname === `/chat/${conversation.id}`;
            return (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={isActive}
                assistantParam={assistantParam}
                onDelete={onDeleteConversation}
                onClick={onItemClick}
              />
            );
          })
        ) : (
          <EmptyState 
            message="No conversations yet"
            subMessage="Start a new chat to get started"
          />
        )}
      </nav>
    </>
  );
}

// ============================================================================
// Assistant Components
// ============================================================================

interface AssistantItemProps {
  assistant: AssistantListItem;
  isActive: boolean;
  onSelect: (id: string) => void;
}

function AssistantItem({ assistant, isActive, onSelect }: AssistantItemProps) {
  // Get icon component constructor from factory function
  // This is safe - getAssistantIcon returns a component constructor from a lookup table
  const Icon = getAssistantIcon(assistant.id);
  
  return (
    <button
      onClick={() => onSelect(assistant.id)}
      className={cn(
        'w-full text-left group flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
          : 'hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {/* getAssistantIcon returns a component constructor, not a new component instance */}
        {React.createElement(Icon, { className: "h-4 w-4 flex-shrink-0 stroke-2" })}
        <div className="flex-1 min-w-0">
          <div className={cn(
            "text-sm font-medium truncate",
            isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground"
          )}>
            {assistant.name}
          </div>
          {assistant.description && (
            <div className={cn(
              "text-xs truncate",
              isActive ? "text-sidebar-accent-foreground/70" : "text-sidebar-foreground/60"
            )}>
              {assistant.description}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

interface AssistantsListProps {
  assistants: AssistantListItem[];
  activeAssistantId: string | null;
  onSelect: (id: string) => void;
}

function AssistantsList({ 
  assistants, 
  activeAssistantId, 
  onSelect 
}: AssistantsListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter assistants based on search query
  const filteredAssistants = assistants.filter((assistant) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      assistant.name.toLowerCase().includes(query) ||
      assistant.description?.toLowerCase().includes(query) ||
      assistant.id.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <div className="px-5 pt-5 pb-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-sidebar-foreground truncate">
            Assistants {filteredAssistants.length > 0 && `(${filteredAssistants.length})`}
          </h3>
        </div>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search assistants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm bg-sidebar border-sidebar-border"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <XCircle className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <nav className="px-5 pb-5 space-y-2 overflow-y-auto h-[calc(100%-140px)] scrollbar-hide">
        {filteredAssistants.length > 0 ? (
          filteredAssistants.map((assistant) => {
            const isActive = activeAssistantId === assistant.id;
            return (
              <AssistantItem
                key={assistant.id}
                assistant={assistant}
                isActive={isActive}
                onSelect={onSelect}
              />
            );
          })
        ) : searchQuery ? (
          <EmptyState message={`No assistants found for "${searchQuery}"`} />
        ) : (
          <EmptyState message="No assistants yet" />
        )}
      </nav>
    </>
  );
}

// ============================================================================
// Sidebar Layout Components
// ============================================================================

interface PrimarySidebarProps {
  user: User;
  activeModule: string;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onNavClick?: () => void;
}

function PrimarySidebar({
  user,
  activeModule,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onNavClick,
}: PrimarySidebarProps) {
  return (
    <div
      className="w-16 flex flex-col bg-sidebar border-r border-sidebar-border relative z-30"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Expanded overlay - Desktop only */}
      <div
        className={cn(
          'hidden md:block absolute left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out z-40',
          isHovered ? 'w-64 opacity-100' : 'w-16 opacity-0 pointer-events-none'
        )}
      >
        <div className="p-2 space-y-2 h-full flex flex-col">
          <nav className="flex-1 space-y-2">
            {primaryNavigation.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <div key={item.id}>
                  <PrimaryNavigationItem
                    item={item}
                    isActive={isActive}
                    isExpanded={true}
                    onClick={onNavClick}
                  />
                </div>
              );
            })}
          </nav>
          <UserMenu user={user} isExpanded={true} />
        </div>
      </div>

      {/* Collapsed content */}
      <nav className="flex-1 p-2 space-y-2">
        {primaryNavigation.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <div key={item.id}>
              <PrimaryNavigationItem
                item={item}
                isActive={isActive}
                isExpanded={false}
                onClick={onNavClick}
              />
            </div>
          );
        })}
      </nav>
      <UserMenu user={user} isExpanded={false} />
    </div>
  );
}

interface SecondarySidebarProps {
  isAssistantsPage: boolean;
  assistants: AssistantListItem[];
  conversations: ConversationSummary[];
  isLoading: boolean;
  pathname: string;
  assistantParam: string | null;
  activeAssistantId: string | null;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
  onSelectAssistant: (id: string) => void;
}

function SecondarySidebar({
  isAssistantsPage,
  assistants,
  conversations,
  isLoading,
  pathname,
  assistantParam,
  activeAssistantId,
  onNewChat,
  onDeleteConversation,
  onSelectAssistant,
}: SecondarySidebarProps) {
  return (
    <div className="hidden md:block w-80 bg-sidebar border-r border-sidebar-border flex-shrink-0 relative z-20">
      {isAssistantsPage ? (
        <AssistantsList
          assistants={assistants}
          activeAssistantId={activeAssistantId}
          onSelect={onSelectAssistant}
        />
      ) : (
        <ConversationsList
          conversations={conversations}
          isLoading={isLoading}
          pathname={pathname}
          assistantParam={assistantParam}
          onNewChat={onNewChat}
          onDeleteConversation={onDeleteConversation}
        />
      )}
    </div>
  );
}

// ============================================================================
// Mobile Sidebar Component
// ============================================================================

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  activeModule: string;
  conversations: ConversationSummary[];
  isLoading: boolean;
  pathname: string;
  assistantParam: string | null;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
}

function MobileSidebar({
  isOpen,
  onClose,
  user,
  activeModule,
  conversations,
  isLoading,
  pathname,
  assistantParam,
  onNewChat,
  onDeleteConversation,
}: MobileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
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
              onClick={onClose}
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
                return (
                  <div key={item.id}>
                    <PrimaryNavigationItem
                      item={item}
                      isActive={isActive}
                      isExpanded={false}
                      onClick={onClose}
                    />
                  </div>
                );
              })}
            </nav>
            <UserMenu user={user} isExpanded={false} />
          </div>
          {/* Right side - Conversations */}
          <div className="flex-1 bg-sidebar border-l border-sidebar-border flex-shrink-0 relative z-20 overflow-hidden flex flex-col min-w-0">
            <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-sidebar-border w-full">
              <div className="flex items-center justify-between w-full gap-2">
                <h3 className="text-lg font-semibold text-sidebar-foreground truncate flex-1 min-w-0">
                  Conversations {conversations.length > 0 && `(${conversations.length})`}
                </h3>
                {onNewChat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={onNewChat}
                  >
                    <SquarePlus className="h-4 w-4 stroke-2" />
                  </Button>
                )}
              </div>
            </div>
            <nav className="flex-1 px-4 pb-4 space-y-2 overflow-y-auto min-h-0 w-full scrollbar-hide">
              {isLoading ? (
                <LoadingSkeleton />
              ) : conversations.length > 0 ? (
                conversations.map((conversation) => {
                  const isActive = pathname === `/chat/${conversation.id}`;
                  return (
                    <ConversationItem
                      key={conversation.id}
                      conversation={conversation}
                      isActive={isActive}
                      assistantParam={assistantParam}
                      onDelete={onDeleteConversation}
                      onClick={onClose}
                    />
                  );
                })
              ) : (
                <EmptyState 
                  message="No conversations yet"
                  subMessage="Start a new chat to get started"
                />
              )}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// Main ChatSidebar Component
// ============================================================================

export function ChatSidebar({
  user,
  conversations = [],
  assistants = [],
  isLoading = false,
  onNewChat,
  onDeleteConversation,
  isMobileOpen = false,
  onMobileClose,
}: ChatSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const assistantParam = searchParams.get('assistant');

  // Check if we're on /assistants page
  const isAssistantsPage = pathname.startsWith('/assistants');
  // Get slug from URL (e.g., /assistants/teacher -> "teacher")
  const assistantSlug = pathname.startsWith('/assistants/') 
    ? pathname.split('/assistants/')[1] 
    : null;
  
  // Assistant is active when assistant param is present, otherwise chat is active
  const activeModule = isAssistantsPage 
    ? 'assistant' 
    : (assistantParam ? 'assistant' : 'chat');

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleSelectAssistant = (id: string) => {
    router.push(`/assistants/${id}`);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full relative">
        <PrimarySidebar
          user={user}
          activeModule={activeModule}
          isHovered={isHovered}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        <SecondarySidebar
          isAssistantsPage={isAssistantsPage}
          assistants={assistants}
          conversations={conversations}
          isLoading={isLoading}
          pathname={pathname}
          assistantParam={assistantParam}
          activeAssistantId={assistantSlug}
          onNewChat={onNewChat}
          onDeleteConversation={onDeleteConversation}
          onSelectAssistant={handleSelectAssistant}
        />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileOpen}
        onClose={onMobileClose || (() => {})}
        user={user}
        activeModule={activeModule}
        conversations={conversations}
        isLoading={isLoading}
        pathname={pathname}
        assistantParam={assistantParam}
        onNewChat={onNewChat}
        onDeleteConversation={onDeleteConversation}
      />
    </>
  );
}
