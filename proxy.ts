import NextAuth from 'next-auth';

import { authConfig } from './auth.config';

// Proxy files in Next.js always run on the Node.js runtime and
// cannot export route segment config. We only export the auth
// proxy handler here.
export default NextAuth(authConfig).auth;

