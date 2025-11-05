import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, MessageSquare, Bot, GraduationCap, Heart, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Logo/Brand */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">My Mentor GPT</h1>
          </div>

          {/* Main Heading */}
          <h2 className="mb-6 text-3xl font-semibold text-foreground sm:text-4xl lg:text-5xl">
            Your AI-Powered Learning Companion
          </h2>

          {/* Description */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Get personalized guidance from AI assistants tailored to your needs. 
            Whether you&apos;re learning, seeking therapy, or looking for mentorship, 
            we&apos;ve got you covered.
          </p>

          {/* CTA Buttons */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/chat">
                <MessageSquare className="mr-2 h-5 w-5" />
                Start Chatting
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/chat?assistant=mentor">
                <Bot className="mr-2 h-5 w-5" />
                Try Assistant
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6 text-left">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Teacher</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Get personalized tutoring and explanations tailored to your learning style and grade level.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 text-left">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Therapist</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive empathetic support and guidance for your mental health and wellbeing.
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6 text-left sm:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-md bg-primary/10 p-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">Mentor</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Get career guidance, advice, and mentorship to help you achieve your goals.
              </p>
            </div>
          </div>

          {/* Badge */}
          <div className="mt-12">
            <Badge variant="secondary" className="text-sm">
              Powered by AI • Customizable Assistants • Always Available
            </Badge>
          </div>
        </div>
      </main>
    </div>
  );
}
