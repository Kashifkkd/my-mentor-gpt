import ChatInterface from "@/components/chat-interface";
import { ChatLayout } from "@/components/chat-layout";
import { assistantTypes, defaultWorkspaces } from "@/lib/assistant-config";

export const metadata = {
  title: 'Chat - My Mentor GPT',
  description: 'Chat with your AI mentor',
};

export default function ChatPageWithId() {
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

