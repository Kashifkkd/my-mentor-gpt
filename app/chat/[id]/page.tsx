import { Suspense } from 'react';
import ChatInterface from "@/components/chat-interface";
import { ChatLayout } from "@/components/chat-layout";
import { assistantTypes, defaultWorkspaces } from "@/lib/assistant-config";

export const metadata = {
  title: 'Chat - My Mentor GPT',
  description: 'Chat with your AI mentor',
};

function ChatPageWithIdContent() {
  return (
    <ChatLayout
      assistantTypes={assistantTypes}
      workspaces={defaultWorkspaces}
    >
      <div className="flex h-full w-full flex-col p-0 sm:p-2 md:p-4">
        <ChatInterface />
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

