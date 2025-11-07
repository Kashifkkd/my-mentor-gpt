'use client';

import { useEffect, useRef } from 'react';

type PossibleEventTarget =
  | Window
  | Document
  | HTMLElement
  | EventTarget
  | MediaQueryList
  | null
  | undefined;

/**
 * Attaches an event listener to the provided target and cleans it up automatically.
 * Falls back to `window` when no target is supplied.
 */
export function useEventListener<EventType = Event>(
  eventName: string,
  handler: (event: EventType) => void,
  element?: PossibleEventTarget,
) {
  const savedHandler = useRef(handler);

  // Update ref if handler changes
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const target = element ?? (typeof window !== 'undefined' ? window : undefined);

    if (!target || typeof target.addEventListener !== 'function') {
      return;
    }

    const listener = (event: Event) => {
      savedHandler.current(event as EventType);
    };

    target.addEventListener(eventName, listener);

    return () => {
      target.removeEventListener(eventName, listener);
    };
  }, [eventName, element]);
}


