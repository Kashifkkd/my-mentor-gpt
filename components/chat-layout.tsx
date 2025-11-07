'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChatNavbar } from './chat-navbar';
import { ChatSidebar } from './chat-sidebar';
import { NewConversationDialog } from './new-conversation-dialog';
import type { AssistantType, Workspace } from '@/lib/types/assistant';
import type { ConversationSummary } from '@/models/conversation';
import { useCurrentSession } from '@/hooks/use-current-session';
import { ChatEnvironmentProvider } from '@/hooks/use-chat-environment';

interface ChatLayoutProps {
  children: React.ReactNode;
  workspaces?: Workspace[];
  assistantTypes?: AssistantType[];
  currentWorkspace?: Workspace;
  currentAssistant?: AssistantType;
  conversations?: ConversationSummary[];
  isLoadingConversations?: boolean;
  onWorkspaceChange?: (workspaceId: string) => void;
  onNewChat?: () => void;
  onDeleteConversation?: (id: string) => void;
}

export function ChatLayout({
  children,
  workspaces,
  assistantTypes,
  currentWorkspace,
  currentAssistant,
  conversations,
  isLoadingConversations,
  onWorkspaceChange,
  onNewChat,
  onDeleteConversation,
}: ChatLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlAssistantType = searchParams.get('assistant');
  const isAssistantsPage = pathname?.startsWith('/assistants');

  const { session, status } = useCurrentSession();

  const currentUser = useMemo(() => {
    if (!session?.user) {
      return undefined;
    }

    return {
      id: session.user.id,
      name: session.user.name ?? undefined,
      email: session.user.email ?? undefined,
      image: session.user.image ?? undefined,
    };
  }, [session?.user]);

  const fallbackWorkspace = useMemo(() => {
    if (currentWorkspace) {
      return currentWorkspace;
    }
    if (workspaces && workspaces.length > 0) {
      return workspaces[0];
    }
    return {
      id: 'personal',
      name: 'Personal',
      slug: 'personal',
    } satisfies Workspace;
  }, [currentWorkspace, workspaces]);

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(fallbackWorkspace.id);

  useEffect(() => {
    if (fallbackWorkspace.id !== activeWorkspaceId) {
      setActiveWorkspaceId(fallbackWorkspace.id);
    }
  }, [fallbackWorkspace.id, activeWorkspaceId]);

  const currentWorkspaceData = useMemo(() => {
    if (workspaces && workspaces.length > 0) {
      return workspaces.find((workspaceItem) => workspaceItem.id === activeWorkspaceId) || fallbackWorkspace;
    }

    if (currentWorkspace && currentWorkspace.id === activeWorkspaceId) {
      return currentWorkspace;
    }

    return fallbackWorkspace;
  }, [workspaces, currentWorkspace, activeWorkspaceId, fallbackWorkspace]);

  const availableAssistantTypes = assistantTypes || [];
  const resolvedAssistant = urlAssistantType
    ? availableAssistantTypes.find((a) => a.id === urlAssistantType) || currentAssistant || availableAssistantTypes[0]
    : currentAssistant || availableAssistantTypes[0];

  const assistantsList = isAssistantsPage
    ? availableAssistantTypes.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      systemPrompt: '',
      model: 'gpt-4',
      temperature: 0.7,
    }))
    : [];

  const [conversationList, setConversationList] = useState<ConversationSummary[]>(conversations || []);
  const [isLoading, setIsLoading] = useState(isLoadingConversations || false);
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated' || !currentUser) {
      return;
    }

    const fetchConversations = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (currentWorkspaceData.id) {
          params.append('workspaceId', currentWorkspaceData.id);
        }
        if (resolvedAssistant?.id) {
          params.append('assistantType', resolvedAssistant.id);
        }

        const queryString = params.toString();
        const url = queryString ? `/api/conversations?${queryString}` : '/api/conversations';
        const response = await fetch(url);
        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setConversationList(data.conversations || []);
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();

    const handleConversationCreated = () => {
      fetchConversations();
    };

    window.addEventListener('conversation-created', handleConversationCreated as EventListener);
    return () => {
      window.removeEventListener('conversation-created', handleConversationCreated as EventListener);
    };
  }, [currentWorkspaceData.id, resolvedAssistant?.id, router, status, currentUser]);

  const handleWorkspaceSelectionChange = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    onWorkspaceChange?.(workspaceId);
  };

  const handleNewChat = () => {
    setIsNewConversationDialogOpen(true);
  };

  const handleDeleteConversation = async (id: string) => {
    if (status !== 'authenticated' || !currentUser) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      if (response.ok) {
        setConversationList((prev) => prev.filter((conv) => conv.id !== id));
        if (window.location.pathname === `/chat/${id}`) {
          router.push('/chat');
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Loading your workspace...</span>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Redirecting to login…</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">Preparing your workspace...</span>
      </div>
    );
  }

  return (
    <ChatEnvironmentProvider
      value={{
        workspaceId: currentWorkspaceData.id ?? null,
        assistantType: resolvedAssistant?.id ?? null,
      }}
    >
      <div className="flex h-screen flex-col bg-background">
        <ChatNavbar
          workspaces={workspaces}
          currentWorkspace={currentWorkspaceData}
          onWorkspaceChange={handleWorkspaceSelectionChange}
          onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
        />

        <div className="flex flex-1 overflow-hidden">
          <ChatSidebar
            user={currentUser}
            workspace={currentWorkspaceData}
            conversations={conversationList}
            assistants={assistantsList}
            isLoading={isLoading}
            onNewChat={onNewChat || handleNewChat}
            onDeleteConversation={onDeleteConversation || handleDeleteConversation}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
          />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>

        <NewConversationDialog
          open={isNewConversationDialogOpen}
          onOpenChange={setIsNewConversationDialogOpen}
          assistantTypes={availableAssistantTypes}
          currentWorkspaceId={currentWorkspaceData.id}
          defaultAssistantType={resolvedAssistant?.id}
        />
      </div>
    </ChatEnvironmentProvider>
  );
}

