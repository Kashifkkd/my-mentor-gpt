'use client';

import { useState } from 'react';
import { Sparkles, Search, Bell, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Combobox } from '@/components/ui/combobox';
import { ModeToggle } from '@/components/mode-toggle';
import { defaultWorkspaces } from '@/lib/assistant-config';
import type { Workspace } from '@/lib/types/assistant';

interface ChatNavbarProps {
  workspaces?: Workspace[];
  currentWorkspace?: Workspace;
  onWorkspaceChange?: (workspaceId: string) => void;
  onMobileMenuClick?: () => void;
}

export function ChatNavbar({
  workspaces = defaultWorkspaces,
  currentWorkspace,
  onWorkspaceChange,
  onMobileMenuClick,
}: ChatNavbarProps) {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(
    currentWorkspace?.id || workspaces[0]?.id || ''
  );

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
    onWorkspaceChange?.(workspaceId);
  };

  return (
    <div className="w-full border-b border-border bg-card">
      <div className="flex h-14 items-center justify-between px-2 sm:px-4">
        {/* Left side - Mobile menu, Logo/Title */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 md:hidden"
            onClick={onMobileMenuClick}
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-base sm:text-lg font-semibold text-foreground">My Mentor GPT</h1>
          </div>

          {/* Workspace Selector - Hidden on mobile, shown on tablet+ */}
          <div className="hidden md:flex items-center space-x-3 ml-4">
            <Combobox
              options={workspaces.map((workspace) => ({
                value: workspace.id,
                label: workspace.name,
              }))}
              value={selectedWorkspaceId}
              onValueChange={handleWorkspaceChange}
              placeholder="Select workspace"
              searchPlaceholder="Search workspaces..."
              emptyMessage="No workspace found."
              className="w-auto min-w-[180px]"
            />
          </div>
        </div>

        {/* Right side - Search box, Notification, Theme Toggle, Profile */}
        <div className="flex items-center justify-end space-x-1 sm:space-x-3">
          {/* Search box - Hidden on mobile */}
          <div className="hidden lg:block relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search conversations..."
              className="h-9 w-48 xl:w-64 pl-9 pr-3"
            />
          </div>
          
          {/* Notification button - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hidden sm:flex"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
          </Button>
          
          <ModeToggle />
          
          {/* Profile button - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 hidden sm:flex"
            title="Profile"
          >
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

