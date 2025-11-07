'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Memoizes event callbacks without re-subscribing listeners.
 */
export function useEventCallback<T extends (...args: never[]) => unknown>(fn: T): T {
  const ref = useRef(fn);

  useLayoutEffect(() => {
    ref.current = fn;
  }, [fn]);

  return useCallback((...args: Parameters<T>) => ref.current(...args), []) as T;
}


