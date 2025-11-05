'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChatInterface from "@/components/chat-interface";
import { ChatLayout } from "@/components/chat-layout";
import { CollaborationCanvas } from "@/components/collaboration-canvas";
import { ConversationInsightsPanel } from "@/components/conversation-insights";
import { assistantTypes, defaultWorkspaces } from "@/lib/assistant-config";

function ChatPageWithIdContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tab = searchParams.get('tab');
  const conversationId = pathname?.split('/chat/')[1] || null;
  
  // Get assistant type from URL or conversation
  const assistantType = searchParams.get('assistant') || null;
  const [conversationAssistantType, setConversationAssistantType] = useState<string | null>(null);

  // Load conversation to get assistant type
  useEffect(() => {
    if (conversationId) {
      fetch(`/api/conversations/${conversationId}`)
        .then(res => res.json())
        .then(data => {
          if (data.conversation?.assistantType) {
            setConversationAssistantType(data.conversation.assistantType);
          }
        })
        .catch(err => console.error('Error loading conversation:', err));
    }
  }, [conversationId]);

  return (
    <ChatLayout
      assistantTypes={assistantTypes}
      workspaces={defaultWorkspaces}
    >
      <div className="flex h-full w-full flex-col p-0 sm:p-2 md:p-4">
        {tab === 'collab' && conversationId ? (
          <CollaborationCanvas conversationId={conversationId} />
        ) : tab === 'insights' && conversationId ? (
          <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-background">
            <div className="border-b px-4 sm:px-6 py-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const baseUrl = `/chat/${conversationId}`;
                    const assistantParam = assistantType ? `?assistant=${assistantType}` : '';
                    router.push(`${baseUrl}${assistantParam}`);
                  }}
                  className="h-8 w-8 sm:w-auto px-2"
                >
                  <ArrowLeft className="h-4 w-4 sm:mr-2" />
                </Button>
                <div className="h-4 w-px bg-border" />
                <div>
                  <h2 className="text-lg font-semibold">Conversation Insights</h2>
                  <p className="text-sm text-muted-foreground">
                    AI-generated summary of topics, objectives, and progress
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <ConversationInsightsPanel 
                conversationId={conversationId}
                assistantType={conversationAssistantType || assistantType || undefined}
              />
            </div>
          </div>
        ) : (
          <ChatInterface />
        )}
      </div>
    </ChatLayout>
  );
}

export default function ChatPageWithId() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <ChatPageWithIdContent />
    </Suspense>
  );
}

