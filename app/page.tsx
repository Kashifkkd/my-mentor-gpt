import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Sparkles,
  MessageSquare,
  Bot,
  GraduationCap,
  Heart,
  Users,
  Zap,
  BrainCircuit,
  ShieldCheck,
} from 'lucide-react';

import { auth } from '@/auth';
import { LandingNavbar } from '@/components/landing-navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PricingSection } from '@/components/pricing-section';
import { HeroHeadline } from '@/components/hero-headline';

const featureHighlights: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Streaming conversations',
    description: 'Experience natural back-and-forth dialogue with real-time responses tailored to your goals.',
    icon: MessageSquare,
  },
  {
    title: 'Expert assistants',
    description: 'Choose mentors, teachers, or therapists tuned to support your learning and wellbeing journey.',
    icon: Bot,
  },
  {
    title: 'Actionable insights',
    description: 'Unlock AI summaries and progress tracking that keep every conversation purposeful.',
    icon: BrainCircuit,
  },
];

const assistantProfiles: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Teacher',
    description: 'Personalized tutoring, study plans, and concept breakdowns that fit your learning style.',
    icon: GraduationCap,
  },
  {
    title: 'Therapist',
    description: 'Compassionate conversations and coping strategies to support your mental wellbeing.',
    icon: Heart,
  },
  {
    title: 'Mentor',
    description: 'Career guidance, interview prep, and accountability from an AI mentor that understands your goals.',
    icon: Users,
  },
];

export default async function Home() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar isAuthenticated={isAuthenticated} />

      <main className="flex flex-1 flex-col">
        <section className="relative flex items-center justify-center px-4 pt-24 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Personalized mentoring powered by AI</span>
          </div>

            <HeroHeadline />

            <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Build momentum with AI assistants that coach you through new skills, offer compassionate support, and
              keep every conversation focused on results.
          </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/chat">
                  <Zap className="mr-2 h-5 w-5" />
                  Start a session
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/signup">
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  Create your workspace
              </Link>
            </Button>
          </div>

            <div className="mt-12 inline-flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
                Streaming chat
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
                Secure by design
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
                Always available
              </Badge>
                </div>
              </div>
        </section>

        <section
          id="features"
          className="border-t border-border bg-muted/30 px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Why Mentors Choose Us
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">Built for meaningful conversations</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((highlight) => {
                const Icon = highlight.icon;
                return (
                  <div
                    key={highlight.title}
                    className="rounded-xl border border-border bg-card p-6 text-left shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">{highlight.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{highlight.description}</p>
                  </div>
                );
              })}
                </div>
              </div>
        </section>

        <section
          id="assistants"
          className="px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24"
        >
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Assistant Library
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
                Specialists for every learning moment
              </h2>
              <p className="mt-4 text-sm text-muted-foreground sm:text-base">
                Switch between assistants in one click or tailor your own with custom prompts and context fields.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assistantProfiles.map((profile) => {
                const Icon = profile.icon;
                return (
                  <div
                    key={profile.title}
                    className="rounded-xl border border-border bg-card p-6 text-left shadow-sm transition hover:shadow-md"
                  >
                    <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-card-foreground">{profile.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{profile.description}</p>
                  </div>
                );
              })}
                </div>
              </div>
        </section>

        <PricingSection />

        <section
          id="insights"
          className="border-t border-border bg-muted/20 px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24"
        >
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-8 rounded-2xl bg-card p-8 text-center shadow-sm sm:flex-row sm:text-left">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold text-foreground sm:text-3xl">See every conversation at a glance</h3>
              <p className="text-sm text-muted-foreground sm:text-base">
                Conversation summaries, goal tracking, and actionable insights help you stay focused on outcomes—
                whether you&apos;re studying, planning your career, or prioritizing wellbeing.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="outline">
                <Link href="/chat">Review insights</Link>
              </Button>
              <Button asChild>
                <Link href={isAuthenticated ? '/chat' : '/signup'}>
                  {isAuthenticated ? 'Resume your chat' : 'Create free account'}
                </Link>
              </Button>
          </div>
          </div>
        </section>
      </main>
    </div>
  );
}
