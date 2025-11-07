'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Target, 
  Lightbulb, 
  TrendingUp, 
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ConversationInsights } from '@/models/conversation';

interface ConversationInsightsProps {
  conversationId: string;
  assistantType?: string;
}

export function ConversationInsightsPanel({ 
  conversationId,
}: ConversationInsightsProps) {
  const [insights, setInsights] = useState<ConversationInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  // Fetch existing insights
  useEffect(() => {
    const fetchInsights = async () => {
      if (!conversationId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/conversations/${conversationId}/summary`);

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setInsights(data.insights);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [conversationId]);

  const handleGenerate = async () => {
    if (!conversationId) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/summary`, {
        method: 'POST',
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressLabel = (progress: number) => {
    if (progress >= 70) return 'Good Progress';
    if (progress >= 40) return 'In Progress';
    return 'Getting Started';
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-semibold text-foreground mb-2">Conversation Insights</div>
        <div className="text-sm text-muted-foreground">Loading insights...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!insights ? (
        <div className="text-center py-8 sm:py-12 space-y-4">
          <div className="flex justify-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <div className="space-y-2">
            <p className="text-base font-medium text-foreground">
              No insights generated yet
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Generate a summary to see topics, objectives, and progress from your conversation.
            </p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            size="default"
            className="mt-4"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          {/* Progress Section */}
          <div className="space-y-4 p-4 sm:p-6 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-base font-semibold text-foreground">Progress Overview</span>
              </div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-sm px-3 py-1",
                  insights.progress === 100 
                    ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30"
                    : insights.progress >= 50
                    ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                    : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                )}
              >
                {insights.progress}% {getProgressLabel(insights.progress)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 rounded-full",
                    getProgressColor(insights.progress)
                  )}
                  style={{ width: `${insights.progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Based on conversation depth and engagement
              </p>
            </div>
          </div>

          {/* Topics Section */}
          {insights.topics.length > 0 && (
            <div className="space-y-4 p-4 sm:p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Topics Discussed</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {insights.topics.map((topic, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-sm px-3 py-1.5"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Objectives Section */}
          {insights.objectives.length > 0 && (
            <div className="space-y-4 p-4 sm:p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Objectives</h3>
              </div>
              <ul className="space-y-3">
                {insights.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm text-foreground leading-relaxed">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Points Section */}
          {insights.keyPoints.length > 0 && (
            <div className="space-y-4 p-4 sm:p-6 rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold text-foreground">Key Points</h3>
              </div>
              <ul className="space-y-3">
                {insights.keyPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-sm text-foreground leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">Last Updated</p>
              <p className="text-xs text-muted-foreground">
                {new Date(insights.lastUpdated).toLocaleString()}
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              size="default"
              variant="outline"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Insights
                </>
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

