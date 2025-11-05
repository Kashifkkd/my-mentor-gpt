'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatNavbar } from './chat-navbar';
import { ChatSidebar } from './chat-sidebar';
import { NewConversationDialog } from './new-conversation-dialog';
import type { AssistantType, Workspace } from '@/lib/types/assistant';
import type { ConversationSummary } from '@/models/conversation';

interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

interface ChatLayoutProps {
  children: React.ReactNode;
  user?: User;
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
  user,
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
  // Default user if not provided
  const defaultUser: User = {
    id: 'user-1',
    name: 'User',
    email: 'user@example.com',
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const urlAssistantType = searchParams.get('assistant');
  
  const currentUser = user || defaultUser;
  const currentWorkspaceData = currentWorkspace || workspaces?.[0] || {
    id: 'personal',
    name: 'Personal',
    slug: 'personal',
  };

  // Get assistant from URL param or use provided/default
  const availableAssistantTypes = assistantTypes || [];
  const resolvedAssistant = urlAssistantType 
    ? (availableAssistantTypes.find(a => a.id === urlAssistantType) || currentAssistant || availableAssistantTypes[0])
    : (currentAssistant || availableAssistantTypes[0]);

  const [conversationList, setConversationList] = useState<ConversationSummary[]>(conversations || []);
  const [isLoading, setIsLoading] = useState(isLoadingConversations || false);
  const [isNewConversationDialogOpen, setIsNewConversationDialogOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch conversations on mount and when workspace/assistant changes
  useEffect(() => {
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

    // Listen for new conversation creation
    const handleConversationCreated = () => {
      fetchConversations();
    };

    window.addEventListener('conversation-created', handleConversationCreated as EventListener);
    return () => {
      window.removeEventListener('conversation-created', handleConversationCreated as EventListener);
    };
  }, [currentWorkspaceData.id, resolvedAssistant?.id]);

  const handleNewChat = () => {
    setIsNewConversationDialogOpen(true);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setConversationList(prev => prev.filter(conv => conv.id !== id));
        // If we're on the deleted conversation, redirect to /chat (which shows welcome message)
        if (window.location.pathname === `/chat/${id}`) {
          router.push('/chat');
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Navbar - Full Width */}
      <ChatNavbar
        workspaces={workspaces}
        currentWorkspace={currentWorkspaceData}
        onWorkspaceChange={onWorkspaceChange}
        onMobileMenuClick={() => setIsMobileSidebarOpen(true)}
      />

      {/* Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <ChatSidebar
          user={currentUser}
          workspace={currentWorkspaceData}
          conversations={conversationList}
          isLoading={isLoading}
          onNewChat={onNewChat || handleNewChat}
          onDeleteConversation={onDeleteConversation || handleDeleteConversation}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* New Conversation Dialog */}
      <NewConversationDialog
        open={isNewConversationDialogOpen}
        onOpenChange={setIsNewConversationDialogOpen}
        assistantTypes={availableAssistantTypes}
        currentWorkspaceId={currentWorkspaceData.id}
        defaultAssistantType={resolvedAssistant?.id}
      />
    </div>
  );
}

