'use client';

import { useCallback, useEffect, useState } from 'react';

import { useEventListener } from '@/hooks/use-event-listener';

const IS_SERVER = typeof window === 'undefined';

type Options<T, InitializeWithValue extends boolean | undefined> = {
  deserializer?: (value: string) => T;
  initializeWithValue: InitializeWithValue;
};

// SSR signature
export function useReadLocalStorage<T>(
  key: string,
  options: Options<T, false>,
): T | null | undefined;
// CSR signature
export function useReadLocalStorage<T>(
  key: string,
  options?: Partial<Options<T, true>>,
): T | null;
export function useReadLocalStorage<T>(
  key: string,
  options: Partial<Options<T, boolean>> = {},
): T | null | undefined {
  let { initializeWithValue = true } = options;

  if (IS_SERVER) {
    initializeWithValue = false;
  }

  const deserializer = useCallback<(value: string) => T | null>(
    (value) => {
      if (options.deserializer) {
        return options.deserializer(value);
      }

      if (value === 'undefined') {
        return undefined as unknown as T;
      }

      try {
        return JSON.parse(value) as T;
      } catch (error) {
        console.error('Error parsing JSON from localStorage:', error);
        return null;
      }
    },
    [options],
  );

  const readValue = useCallback((): T | null => {
    if (IS_SERVER) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(key);
      return raw ? deserializer(raw) : null;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  }, [key, deserializer]);

  const [storedValue, setStoredValue] = useState<T | null | undefined>(() => {
    if (initializeWithValue) {
      return readValue();
    }

    return undefined;
  });

  useEffect(() => {
    if (!initializeWithValue) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setStoredValue(readValue());
    });

    return () => cancelAnimationFrame(frame);
  }, [initializeWithValue, readValue]);

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
        return;
      }

      setStoredValue(readValue());
    },
    [key, readValue],
  );

  useEventListener('storage', handleStorageChange);
  useEventListener('local-storage', handleStorageChange);

  return storedValue;
}

export type { Options };


