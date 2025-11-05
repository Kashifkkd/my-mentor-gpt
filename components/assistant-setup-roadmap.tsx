'use client';

import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Assistant {
  id: string;
  name?: string;
  description?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  field: keyof Assistant;
  required: boolean;
}

const setupSteps: SetupStep[] = [
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'Set name, description, and color',
    field: 'name',
    required: true,
  },
  {
    id: 'ai-config',
    title: 'AI Configuration',
    description: 'Configure model and temperature',
    field: 'model',
    required: false,
  },
  {
    id: 'system-prompt',
    title: 'System Prompt',
    description: 'Define the assistant\'s behavior and instructions',
    field: 'systemPrompt',
    required: false,
  },
];

interface AssistantSetupRoadmapProps {
  assistant: Assistant;
  onStepClick?: (stepId: string) => void;
}

export function AssistantSetupRoadmap({ 
  assistant, 
  onStepClick 
}: AssistantSetupRoadmapProps) {
  const getStepStatus = (step: SetupStep): 'completed' | 'in-progress' | 'pending' => {
    if (step.id === 'basic-info') {
      // Basic info is completed if name is filled (required field)
      const hasName = assistant.name && assistant.name.trim() !== '';
      return hasName ? 'completed' : 'pending';
    }
    
    if (step.id === 'ai-config') {
      // AI config is completed if model is set (has default, so usually completed)
      const hasModel = assistant.model && assistant.model.trim() !== '';
      return hasModel ? 'completed' : 'pending';
    }
    
    if (step.id === 'system-prompt') {
      // System prompt status
      const hasPrompt = assistant.systemPrompt && assistant.systemPrompt.trim() !== '';
      const hasDescription = assistant.description && assistant.description.trim() !== '';
      
      // If description exists but no prompt, it's in-progress (user started but didn't finish)
      if (hasDescription && !hasPrompt) return 'in-progress';
      return hasPrompt ? 'completed' : 'pending';
    }
    
    // Fallback: check field value
    const value = assistant[step.field];
    return value && value !== '' ? 'completed' : 'pending';
  };

  const getStepIcon = (status: 'completed' | 'in-progress' | 'pending') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepColor = (status: 'completed' | 'in-progress' | 'pending') => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-500/10';
      case 'in-progress':
        return 'border-yellow-500 bg-yellow-500/10';
      case 'pending':
        return 'border-muted bg-muted/50';
    }
  };

  const completedSteps = setupSteps.filter(step => getStepStatus(step) === 'completed').length;
  const totalSteps = setupSteps.length;
  const progress = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Setup Roadmap</h4>
        <span className="text-xs text-muted-foreground">
          {completedSteps}/{totalSteps} completed
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 rounded-full",
              progress === 100 
                ? "bg-green-500" 
                : progress >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {progress === 100 
            ? 'Setup complete! Your assistant is ready to use.' 
            : progress >= 50
            ? 'You\'re halfway there! Complete the remaining steps.'
            : 'Get started by completing the setup steps below.'}
        </p>
      </div>

      {/* Roadmap Steps */}
      <div className="space-y-3">
        {setupSteps.map((step, index) => {
          const status = getStepStatus(step);
          const isClickable = onStepClick && status !== 'completed';
          
          return (
            <div
              key={step.id}
              onClick={isClickable ? () => onStepClick(step.id) : undefined}
              className={cn(
                "relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all",
                getStepColor(status),
                isClickable && "cursor-pointer hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              {/* Connector Line */}
              {index < setupSteps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-6 top-12 w-0.5 h-full",
                    status === 'completed' 
                      ? "bg-green-500" 
                      : "bg-muted"
                  )}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 flex-shrink-0">
                {getStepIcon(status)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-medium text-foreground">
                    {step.title}
                  </h5>
                  {step.required && (
                    <span className="text-xs text-destructive">Required</span>
                  )}
                  {status === 'in-progress' && (
                    <span className="text-xs text-yellow-600 dark:text-yellow-400">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {status === 'completed' && (
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Done
                  </span>
                )}
                {status === 'in-progress' && (
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                    Continue
                  </span>
                )}
                {status === 'pending' && (
                  <span className="text-xs font-medium text-muted-foreground">
                    Start
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

