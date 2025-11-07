'use client';

import TypingText from '@/components/ui/shadcn-io/typing-text';

export function HeroHeadline() {
  return (
    <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
      Your AI Mentor for{' '}
      <span className="relative inline-flex flex-col items-stretch">
        <TypingText
          className="bg-gradient-to-r from-primary via-emerald-400 to-accent bg-clip-text text-4xl font-semibold text-transparent sm:text-5xl lg:text-6xl"
          text={['Learning', 'Journey', 'Resilience']}
          typingSpeed={70}
          deletingSpeed={40}
          pauseDuration={1600}
          initialDelay={400}
          showCursor
          hideCursorWhileTyping
          variableSpeed={{ min: 40, max: 90 }}
          cursorClassName="h-16 translate-y-1 bg-primary/80"
          cursorCharacter="|"
        />
      </span>
    </h1>
  );
}


