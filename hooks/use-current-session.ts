'use client';

import type { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

export const useCurrentSession = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [status, setStatus] = useState<SessionStatus>('unauthenticated');
    const pathname = usePathname();

    const retrieveSession = useCallback(async () => {
        try {
            setStatus('loading');
            const sessionData = await getSession();

            if (sessionData) {
                setSession(sessionData);
                setStatus('authenticated');
                return;
            }

            setSession(null);
            setStatus('unauthenticated');
        } catch (error) {
            console.error(error)
            setSession(null);
            setStatus('unauthenticated');
        }
    }, []);

    useEffect(() => {
        retrieveSession();
    }, [retrieveSession, pathname]);

    return { session, status, refresh: retrieveSession };
};


