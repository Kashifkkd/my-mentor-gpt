'use client';

import { useEffect, useState } from 'react';
import { AvatarGroup } from '@/components/ui/shadcn-io/avatar-group';
import {
  Cursor,
  CursorBody,
  CursorMessage,
  CursorName,
  CursorPointer,
} from '@/components/ui/shadcn-io/cursor';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  message?: string;
  position: { x: number; y: number };
  color: {
    foreground: string;
    background: string;
  };
}

interface LiveCollaborationProps {
  conversationId?: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  enabled?: boolean;
}

const colors = [
  {
    foreground: 'text-emerald-800',
    background: 'bg-emerald-50',
  },
  {
    foreground: 'text-rose-800',
    background: 'bg-rose-50',
  },
  {
    foreground: 'text-sky-800',
    background: 'bg-sky-50',
  },
  {
    foreground: 'text-purple-800',
    background: 'bg-purple-50',
  },
  {
    foreground: 'text-orange-800',
    background: 'bg-orange-50',
  },
];

// Helper function to generate random position
const getRandomPosition = () => ({
  x: Math.floor(Math.random() * 80) + 10, // Keep within 10-90% range
  y: Math.floor(Math.random() * 80) + 10, // Keep within 10-90% range
});

export function LiveCollaboration({
  currentUserId,
  currentUserName = 'You',
  currentUserAvatar = 'https://github.com/dovazencot.png',
  enabled = false,
}: LiveCollaborationProps) {
  // Initialize with current user if enabled
  const initialCollaborators: Collaborator[] = enabled && currentUserId ? [
    {
      id: currentUserId,
      name: currentUserName,
      avatar: currentUserAvatar,
      position: getRandomPosition(),
      color: colors[0],
    },
  ] : [];

  const [collaborators, setCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const isActive = enabled && currentUserId !== undefined;

  // Simulate other users joining (for demo purposes)
  // In production, this would come from WebSocket/Server-Sent Events
  useEffect(() => {
    if (!enabled || !isActive) return;

    // Simulate demo users for presentation
    const demoUsers: Collaborator[] = [
      {
        id: 'demo-user-1',
        name: 'Dr. Sarah Chen',
        avatar: 'https://github.com/shadcn.png',
        message: 'Great explanation!',
        position: getRandomPosition(),
        color: colors[1],
      },
      {
        id: 'demo-user-2',
        name: 'Prof. James Wilson',
        avatar: 'https://github.com/leerob.png',
        position: getRandomPosition(),
        color: colors[2],
      },
    ];

    // Add demo users after a delay
    const timer = setTimeout(() => {
      setCollaborators((prev) => [...prev, ...demoUsers]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [enabled, isActive]);

  // Move cursors randomly (simulating user activity)
  useEffect(() => {
    if (!enabled || !isActive || collaborators.length === 0) return;

    const collaboratorIds = collaborators.map((c) => c.id);
    const intervals = collaboratorIds.map((id) => {
      return setInterval(() => {
        setCollaborators((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, position: getRandomPosition() }
              : c
          )
        );
      }, Math.random() * 3000 + 2000); // Random intervals between 2-5 seconds
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collaborators.length, enabled, isActive]);

  if (!enabled || !isActive) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute top-4 right-4">
        <AvatarGroup variant="stack" animate size={32}>
          {collaborators.map((collaborator) => (
            <Avatar key={collaborator.id}>
              <AvatarImage src={collaborator.avatar} />
              <AvatarFallback>
                {collaborator.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
      </div>

      {collaborators.map((collaborator) => (
        <Cursor
          className="absolute transition-all duration-1000 ease-out"
          key={collaborator.id}
          style={{
            top: `${collaborator.position.y}%`,
            left: `${collaborator.position.x}%`,
          }}
        >
          <CursorPointer
            className={cn(collaborator.color.foreground)}
          />
          <CursorBody
            className={cn(
              collaborator.color.background,
              collaborator.color.foreground,
              'gap-1 px-3 py-2'
            )}
          >
            <div className="flex items-center gap-2 !opacity-100">
              <Image
                alt={collaborator.name}
                className="size-4 rounded-full"
                height={16}
                src={collaborator.avatar}
                unoptimized
                width={16}
              />
              <CursorName className="font-medium">
                {collaborator.name}
              </CursorName>
            </div>
            {collaborator.message && (
              <CursorMessage className="text-xs opacity-90">
                {collaborator.message}
              </CursorMessage>
            )}
          </CursorBody>
        </Cursor>
      ))}
    </div>
  );
}

