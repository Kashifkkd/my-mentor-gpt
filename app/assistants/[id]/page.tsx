'use client';

import { Suspense } from 'react';
import { ChatLayout } from '@/components/chat-layout';
import { AssistantManagement } from '@/components/assistant-management';
import { assistantTypes, defaultWorkspaces } from '@/lib/assistant-config';

function AssistantDetailContent() {
  return (
    <ChatLayout
      assistantTypes={assistantTypes}
      workspaces={defaultWorkspaces}
    >
      <AssistantManagement />
    </ChatLayout>
  );
}

export default function AssistantDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <AssistantDetailContent />
    </Suspense>
  );
}

