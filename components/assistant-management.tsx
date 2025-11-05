'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { assistantTypes, getAssistantIcon } from '@/lib/assistant-config';
import type { AssistantType } from '@/lib/types/assistant';
import { AssistantSetupRoadmap } from './assistant-setup-roadmap';

interface Assistant extends AssistantType {
  systemPrompt?: string;
  model?: string;
  temperature?: number;
}

// Calculate completion percentage for an assistant
function calculateCompletion(assistant: Assistant): number {
  const fields = [
    { key: 'name', required: true, weight: 2 },
    { key: 'description', required: false, weight: 1 },
    { key: 'systemPrompt', required: false, weight: 2 },
    { key: 'model', required: false, weight: 1 },
    { key: 'temperature', required: false, weight: 1 },
  ];

  let totalWeight = 0;
  let filledWeight = 0;

  fields.forEach(({ key, required, weight }) => {
    totalWeight += weight;
    const value = assistant[key as keyof Assistant];
    const isFilled = value !== undefined && value !== null && value !== '';
    
    if (isFilled || (!required && key === 'model')) {
      // Model has default value, so it's always considered filled
      if (key === 'model' || (key === 'temperature' && value !== undefined)) {
        filledWeight += weight;
      } else if (isFilled) {
        filledWeight += weight;
      }
    }
  });

  return totalWeight > 0 ? Math.round((filledWeight / totalWeight) * 100) : 0;
}

export function AssistantManagement() {
  const router = useRouter();
  const pathname = usePathname();
  // Get slug from URL (e.g., /assistants/teacher -> "teacher")
  const assistantSlug = pathname.startsWith('/assistants/') ? pathname.split('/assistants/')[1] : null;

  // Initialize with default assistants
  const [assistants, setAssistants] = useState<Assistant[]>(() =>
    assistantTypes.map(assistant => ({
      ...assistant,
      description: assistant.description || '',
      systemPrompt: '',
      model: 'gpt-4',
      temperature: 0.7,
    }))
  );

  // Find selected assistant from URL slug (using id as slug since they're the same)
  const selectedAssistant = assistantSlug 
    ? assistants.find(a => a.id === assistantSlug) || null
    : null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Assistant>>(() => {
    const initial = assistantTypes.map(assistant => ({
      ...assistant,
      description: assistant.description || '',
      systemPrompt: '',
      model: 'gpt-4',
      temperature: 0.7,
    }));
    const found = assistantSlug ? initial.find(a => a.id === assistantSlug) : null;
    return found || (initial.length > 0 ? initial[0] : {});
  });

  // Update form data when assistant changes
  useEffect(() => {
    if (selectedAssistant) {
      setFormData(selectedAssistant);
      setIsEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssistant?.id]);

  // Redirect to first assistant if slug is invalid or missing
  useEffect(() => {
    // Only redirect if we're on /assistants/[id] route but the slug doesn't match any assistant
    if (pathname.startsWith('/assistants/')) {
      const slug = pathname.split('/assistants/')[1];
      const isValidSlug = assistants.some(a => a.id === slug);
      
      if (!isValidSlug && assistants.length > 0) {
        // Invalid slug, redirect to first assistant
        router.replace(`/assistants/${assistants[0].id}`);
      }
    } else if (pathname === '/assistants' && assistants.length > 0) {
      // On /assistants without slug, redirect to first assistant
      router.replace(`/assistants/${assistants[0].id}`);
    }
  }, [pathname, assistants, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedAssistant) return;

    const updatedAssistants = assistants.map(assistant =>
      assistant.id === selectedAssistant.id
        ? { ...assistant, ...formData }
        : assistant
    );

    setAssistants(updatedAssistants);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!selectedAssistant) return;

    if (confirm(`Are you sure you want to delete "${selectedAssistant.name}"?`)) {
      const updatedAssistants = assistants.filter(
        assistant => assistant.id !== selectedAssistant.id
      );
      setAssistants(updatedAssistants);

      if (updatedAssistants.length > 0) {
        router.push(`/assistants/${updatedAssistants[0].id}`);
      } else {
        router.push('/assistants');
      }
    }
  };

  const handleCreateNew = () => {
    const newAssistant: Assistant = {
      id: `assistant-${Date.now()}`,
      name: 'New Assistant',
      description: '',
      color: 'blue',
      systemPrompt: '',
      model: 'gpt-4',
      temperature: 0.7,
    };

    setAssistants([...assistants, newAssistant]);
    router.push(`/assistants/${newAssistant.id}`);
    setFormData(newAssistant);
    setIsEditing(true);
  };

  const handleInputChange = (field: keyof Assistant, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
        {selectedAssistant ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {(() => {
                    const Icon = getAssistantIcon(selectedAssistant.id);
                    return <Icon className="h-5 w-5 text-primary flex-shrink-0" />;
                  })()}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="text-lg font-semibold text-card-foreground truncate">
                        {isEditing ? 'Edit Assistant' : selectedAssistant.name}
                      </h3>
                      {(() => {
                        const completion = calculateCompletion(selectedAssistant);
                        return (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs font-medium px-2 py-0.5",
                              completion === 100 
                                ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30" 
                                : completion >= 50
                                ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30"
                                : "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30"
                            )}
                          >
                            {completion}%
                          </Badge>
                        );
                      })()}
                    </div>
                    {/* Compact Progress Bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        {(() => {
                          const completion = calculateCompletion(selectedAssistant);
                          return (
                            <div
                              className={cn(
                                "h-full transition-all duration-300 rounded-full",
                                completion === 100 
                                  ? "bg-green-500" 
                                  : completion >= 50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              )}
                              style={{ width: `${completion}%` }}
                            />
                          );
                        })()}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {isEditing ? 'Updating...' : 'Setup progress'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData(selectedAssistant);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDelete}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-6">
              <div className="w-full space-y-6">
                {/* Setup Roadmap */}
                {/* <div className="p-4 rounded-lg border bg-card">
                  <AssistantSetupRoadmap 
                    assistant={selectedAssistant}
                    onStepClick={(stepId) => {
                      setIsEditing(true);
                      // Scroll to the relevant section
                      const element = document.getElementById(stepId);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  />
                </div> */}

                {/* Basic Information */}
                <div id="basic-info" className="space-y-4 scroll-mt-4">
                  <h4 className="text-sm font-semibold text-foreground">Basic Information</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Name <span className="text-destructive">*</span>
                      </label>
                      {isEditing ? (
                        <Input
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter assistant name"
                          className="w-full"
                        />
                      ) : (
                        <div className="p-2 rounded-md bg-muted text-foreground">
                          {selectedAssistant.name}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Color</label>
                      {isEditing ? (
                        <Select
                          value={formData.color || 'blue'}
                          onValueChange={(value) => handleInputChange('color', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="orange">Orange</SelectItem>
                            <SelectItem value="indigo">Indigo</SelectItem>
                            <SelectItem value="pink">Pink</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 rounded-md bg-muted">
                          <Badge variant="secondary">
                            {selectedAssistant.color ? selectedAssistant.color.charAt(0).toUpperCase() + selectedAssistant.color.slice(1) : 'Blue'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Description
                    </label>
                    {isEditing ? (
                      <Textarea
                        value={formData.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter assistant description"
                        rows={3}
                        className="w-full"
                      />
                    ) : (
                      <div className="p-2 rounded-md bg-muted text-foreground">
                        {selectedAssistant.description || 'No description'}
                      </div>
                    )}
                  </div>
                </div>

                {/* AI Configuration */}
                <div id="ai-config" className="space-y-4 pt-4 border-t scroll-mt-4">
                  <h4 className="text-sm font-semibold text-foreground">AI Configuration</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Model</label>
                      {isEditing ? (
                        <Select
                          value={formData.model || 'gpt-4'}
                          onValueChange={(value) => handleInputChange('model', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gpt-4">GPT-4</SelectItem>
                            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 rounded-md bg-muted text-foreground">
                          {selectedAssistant.model || 'gpt-4'}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Temperature ({formData.temperature ?? 0.7})
                      </label>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={formData.temperature ?? 0.7}
                          onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      ) : (
                        <div className="p-2 rounded-md bg-muted text-foreground">
                          {selectedAssistant.temperature ?? 0.7}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* System Prompt Section */}
                <div id="system-prompt" className="space-y-4 pt-4 border-t scroll-mt-4">
                  <h4 className="text-sm font-semibold text-foreground">System Prompt</h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      System Prompt
                    </label>
                    {isEditing ? (
                      <Textarea
                        value={formData.systemPrompt || ''}
                        onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                        placeholder="Enter system prompt for the assistant"
                        rows={6}
                        className="w-full"
                      />
                    ) : (
                      <div className="p-2 rounded-md bg-muted text-foreground whitespace-pre-wrap">
                        {selectedAssistant.systemPrompt || 'No system prompt set'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No assistant selected</p>
              <Button onClick={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Assistant
              </Button>
            </div>
          </div>
        )}
    </div>
  );
}

