import type { NextAuthConfig } from 'next-auth';

const protectedRoutes = ['/chat', '/assistants'];
const authRedirectRoutes = ['/login', '/signup'];

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = nextUrl;

      const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
      if (isProtected) {
        return isLoggedIn;
      }

      if (isLoggedIn && authRedirectRoutes.includes(pathname)) {
        return Response.redirect(new URL('/chat', nextUrl));
      }

      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

