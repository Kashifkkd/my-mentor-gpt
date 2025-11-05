'use client';

import { Suspense } from 'react';
import { ChatLayout } from "@/components/chat-layout";
import { assistantTypes, defaultWorkspaces } from "@/lib/assistant-config";

function ChatPageContent() {
  return (
    <ChatLayout
      assistantTypes={assistantTypes}
      workspaces={defaultWorkspaces}
    >
      <div className="flex h-full w-full flex-col items-center justify-center p-2 sm:p-4">
        <div className="text-center space-y-3 sm:space-y-4 px-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Welcome to My Mentor GPT</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Click the &quot;+&quot; button in the sidebar to start a new conversation
          </p>
        </div>
      </div>
    </ChatLayout>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}

