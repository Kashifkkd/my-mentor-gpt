'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { assistantTypes } from '@/lib/assistant-config';

function AssistantsPageContent() {
  const router = useRouter();

  // Redirect to first assistant by default
  useEffect(() => {
    if (assistantTypes.length > 0) {
      router.replace(`/assistants/${assistantTypes[0].id}`);
    }
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="text-muted-foreground">Redirecting...</div>
    </div>
  );
}

export default function AssistantsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <AssistantsPageContent />
    </Suspense>
  );
}

