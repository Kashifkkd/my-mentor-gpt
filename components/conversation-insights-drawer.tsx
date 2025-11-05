'use client';

import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ConversationInsightsPanel } from '@/components/conversation-insights';

interface ConversationInsightsDrawerProps {
  conversationId: string;
  assistantType?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConversationInsightsDrawer({
  conversationId,
  assistantType,
  isOpen,
  onOpenChange,
}: ConversationInsightsDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-2 flex-shrink-0"
        >
          <Sparkles className="size-4" />
          <span className="ml-1 hidden sm:inline">Insights</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[700px] overflow-y-auto p-0">
        <div className="flex flex-col h-full">
          {/* Header with Back Button for Mobile */}
          <div className="border-b border-border bg-card px-4 sm:px-6 py-4 sm:py-5 flex-shrink-0">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Back Button - Mobile Only */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="sm:hidden h-8 w-8 p-0 flex-shrink-0"
                aria-label="Close drawer"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 min-w-0">
                <SheetHeader className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <SheetTitle className="text-lg sm:text-xl">Conversation Insights</SheetTitle>
                  </div>
                  <SheetDescription className="text-sm text-muted-foreground">
                    AI-generated summary of topics, objectives, and progress
                  </SheetDescription>
                </SheetHeader>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <ConversationInsightsPanel 
              conversationId={conversationId}
              assistantType={assistantType}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

