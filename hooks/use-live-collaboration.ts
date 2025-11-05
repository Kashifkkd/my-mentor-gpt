'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  position: { x: number; y: number };
  message?: string;
  lastSeen: Date;
}

interface UseLiveCollaborationOptions {
  conversationId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  enabled?: boolean;
}

export function useLiveCollaboration({
  conversationId,
  userId,
  userName,
  userAvatar,
  enabled = false,
}: UseLiveCollaborationOptions) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const sendPositionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track mouse movement
  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      mousePositionRef.current = { x, y };

      // Throttle position updates
      if (sendPositionTimeoutRef.current) {
        clearTimeout(sendPositionTimeoutRef.current);
      }

      sendPositionTimeoutRef.current = setTimeout(() => {
        // In production, send to WebSocket server
        // For now, update local state
        setCollaborators((prev) =>
          prev.map((c) =>
            c.id === userId
              ? { ...c, position: { x, y }, lastSeen: new Date() }
              : c
          )
        );
      }, 100); // Throttle to 10 updates per second
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (sendPositionTimeoutRef.current) {
        clearTimeout(sendPositionTimeoutRef.current);
      }
    };
  }, [enabled, userId]);

  // Initialize current user
  useEffect(() => {
    if (enabled && userId) {
      setCollaborators([
        {
          id: userId,
          name: userName,
          avatar: userAvatar,
          position: { x: 50, y: 50 },
          lastSeen: new Date(),
        },
      ]);
      setIsConnected(true);
    }
  }, [enabled, userId, userName, userAvatar]);

  // In production, this would connect to WebSocket
  // For now, we'll simulate with local state
  const addCollaborator = useCallback((collaborator: Omit<Collaborator, 'lastSeen'>) => {
    setCollaborators((prev) => {
      const exists = prev.find((c) => c.id === collaborator.id);
      if (exists) {
        return prev.map((c) =>
          c.id === collaborator.id
            ? { ...collaborator, lastSeen: new Date() }
            : c
        );
      }
      return [...prev, { ...collaborator, lastSeen: new Date() }];
    });
  }, []);

  const removeCollaborator = useCallback((collaboratorId: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
  }, []);

  const updateCollaboratorPosition = useCallback(
    (collaboratorId: string, position: { x: number; y: number }) => {
      setCollaborators((prev) =>
        prev.map((c) =>
          c.id === collaboratorId
            ? { ...c, position, lastSeen: new Date() }
            : c
        )
      );
    },
    []
  );

  const sendMessage = useCallback((message: string) => {
    // In production, send to WebSocket server
    setCollaborators((prev) =>
      prev.map((c) =>
        c.id === userId ? { ...c, message, lastSeen: new Date() } : c
      )
    );
  }, [userId]);

  // Clean up inactive collaborators (not seen for 30 seconds)
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      setCollaborators((prev) =>
        prev.filter((c) => {
          const secondsSinceLastSeen =
            (now.getTime() - c.lastSeen.getTime()) / 1000;
          return secondsSinceLastSeen < 30;
        })
      );
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [enabled]);

  return {
    collaborators,
    isConnected,
    addCollaborator,
    removeCollaborator,
    updateCollaboratorPosition,
    sendMessage,
  };
}

