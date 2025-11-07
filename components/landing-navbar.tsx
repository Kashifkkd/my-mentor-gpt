'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
} from '@/components/ui/sheet';
import { ModeToggle } from '@/components/mode-toggle';

interface LandingNavbarProps {
  isAuthenticated: boolean;
}

const navLinks: Array<{ href: string; label: string }> = [
  { href: '#features', label: 'Features' },
  { href: '#assistants', label: 'Assistants' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#insights', label: 'Insights' },
];

export function LandingNavbar({ isAuthenticated }: LandingNavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">AI Mentor</span>
          <span>My Mentor GPT</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ModeToggle />
          {isAuthenticated ? (
            <Button asChild>
              <Link href="/chat">Go to app</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="text-sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 md:hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]" showCloseButton>
            <div className="mt-10 flex flex-col gap-6">
              <div className="flex flex-col gap-2 text-left">
                <span className="text-xs font-medium uppercase text-muted-foreground">Navigate</span>
                <nav className="flex flex-col gap-4 text-sm font-medium text-foreground">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link href={link.href} className="hover:text-primary">
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>

              <ModeToggle />

              <div className="flex flex-col gap-3">
                {isAuthenticated ? (
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link href="/chat">Go to app</Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <>
                    <SheetClose asChild>
                      <Button asChild variant="ghost" className="w-full">
                        <Link href="/login">Sign in</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild className="w-full">
                        <Link href="/signup">Get started</Link>
                      </Button>
                    </SheetClose>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

