'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AssistantType } from '@/lib/types/assistant';
import { getAssistantIcon } from '@/lib/assistant-config';
import { getAssistantFields, type AssistantField } from '@/lib/assistant-fields';
import React from 'react';
import { X } from 'lucide-react';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistantTypes: AssistantType[];
  currentWorkspaceId?: string;
  defaultAssistantType?: string;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  assistantTypes,
  currentWorkspaceId,
  defaultAssistantType,
}: NewConversationDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState<string>(
    defaultAssistantType || assistantTypes[0]?.id || ''
  );
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  // Get fields for selected assistant type
  const assistantFields = selectedAssistant ? getAssistantFields(selectedAssistant) : [];

  // Reset custom fields when assistant type changes
  useEffect(() => {
    setCustomFields({});
  }, [selectedAssistant]);

  const handleFieldChange = (fieldId: string, value: string) => {
    setCustomFields(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const validateFields = (): boolean => {
    for (const field of assistantFields) {
      if (field.required && !customFields[field.id]?.trim()) {
        return false;
      }
    }
    return true;
  };

  const handleCreate = async () => {
    if (!title.trim() || !selectedAssistant || !validateFields()) return;

    setIsCreating(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          assistantType: selectedAssistant,
          workspaceId: currentWorkspaceId,
          customFields: customFields,
          messages: [],
        }),
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      const conversationId = data.id;

      // Reset form
      setTitle('');
      setSelectedAssistant(defaultAssistantType || assistantTypes[0]?.id || '');
      setCustomFields({});
      onOpenChange(false);

      // Navigate to the new conversation
      router.push(`/chat/${conversationId}?assistant=${selectedAssistant}`);

      // Trigger refresh of conversation list
      window.dispatchEvent(
        new CustomEvent('conversation-created', { detail: { id: conversationId } })
      );
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setTitle('');
      setSelectedAssistant(defaultAssistantType || assistantTypes[0]?.id || '');
      setCustomFields({});
    }
    onOpenChange(newOpen);
  };

  const handleDialogInteractOutside = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.closest('[data-prevent-dialog-close]')) {
      event.preventDefault();
    }
  };

  const renderField = (field: AssistantField) => {
    const value = customFields[field.id] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            rows={3}
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent data-prevent-dialog-close>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      default:
        return (
          <Input
            id={field.id}
            type="text"
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="min-w-[60vw] max-w-[600px] sm:w-[600px]"
        onInteractOutside={handleDialogInteractOutside}
        showCloseButton={false}
      >
        <DialogClose
          onClick={() => handleOpenChange(false)}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>
            Create a new conversation with a title, assistant type, and customize your assistant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1 scrollbar-hide">
          <div className="space-y-2">
            <label
              htmlFor="conversation-title"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Title
            </label>
            <Input
              id="conversation-title"
              placeholder="Enter conversation title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && title.trim() && selectedAssistant) {
                  e.preventDefault();
                  handleCreate();
                }
              }}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="assistant-type"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Assistant Type
            </label>
            <Combobox
              options={assistantTypes.map((assistant) => {
                const Icon = getAssistantIcon(assistant.id);
                return {
                  value: assistant.id,
                  label: assistant.name,
                  icon: Icon,
                  description: assistant.description,
                };
              })}
              value={selectedAssistant}
              onValueChange={setSelectedAssistant}
              placeholder="Select assistant type"
              searchPlaceholder="Search assistants..."
              emptyMessage="No assistant found."
            />
          </div>

          {/* Dynamic Fields based on Assistant Type */}
          {assistantFields.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-0">
                <div className="text-sm font-semibold text-foreground">
                  Customize Your Assistant
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide details to help your assistant understand your needs better.
                </p>
              </div>
              <div className="space-y-4">
                {assistantFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label
                      htmlFor={field.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    {field.description && (
                      <p className="text-xs text-muted-foreground -mt-1">{field.description}</p>
                    )}
                    <div className="w-full">
                      {renderField(field)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || !selectedAssistant || !validateFields() || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Conversation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

