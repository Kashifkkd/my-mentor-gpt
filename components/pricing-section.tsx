'use client';

import { useState } from 'react';
import NumberFlow from '@number-flow/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ArrowRight, BadgeCheck } from 'lucide-react';

type BillingFrequency = 'monthly' | 'yearly';

const PLANS = [
  {
    id: 'hobby',
    name: 'Hobby',
    price: {
      monthly: 'Free forever',
      yearly: 'Free forever',
    },
    description: 'The perfect starting place for your web app or personal project.',
    features: [
      '50 AI messages / month',
      'Community support',
      'Single-user account',
      '5 saved conversations',
      'Basic analytics',
    ],
    cta: 'Get started for free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: {
      monthly: 29,
      yearly: 24,
    },
    description: 'Everything you need to build and scale your workflow.',
    features: [
      'Unlimited AI messages',
      'Priority email support',
      'Multi-user workspaces',
      'Advanced assistant customization',
      'Conversation insights & exports',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: {
      monthly: 'Talk to sales',
      yearly: 'Talk to sales',
    },
    description: 'Critical security, performance, observability, and support.',
    features: [
      'Dedicated success manager',
      'Custom SLAs',
      'Single sign-on (SSO)',
      'Secure deployment options',
      'Tailored onboarding & training',
    ],
    cta: 'Contact sales',
  },
];

export function PricingSection() {
  const [frequency, setFrequency] = useState<BillingFrequency>('monthly');

  return (
    <section id="pricing" className="bg-muted/30 py-24 scroll-mt-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 text-center">
        <div className="flex flex-col items-center gap-6">
          <h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
            Choose the plan that matches your workflow. Upgrade any time as your needs grow.
          </p>
          <Tabs defaultValue={frequency} onValueChange={(value) => setFrequency(value as BillingFrequency)}>
            <TabsList>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge variant="secondary" className="ml-2">
                  Save 20%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price = plan.price[frequency];

            return (
              <Card
                key={plan.id}
                className={cn('relative text-left transition-shadow hover:shadow-lg', plan.popular && 'ring-2 ring-primary')}
              >
                {plan.popular ? (
                  <Badge className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full">
                    Most popular
                  </Badge>
                ) : null}
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                  <CardDescription className="space-y-2">
                    <p>{plan.description}</p>
                    {typeof price === 'number' ? (
                      <div className="space-y-2">
                        <div className="flex items-end justify-between gap-2">
                          <NumberFlow
                            className="text-3xl font-semibold text-foreground"
                            format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
                            suffix="/month"
                            value={price}
                          />
                          {frequency === 'monthly' ? (
                            <Badge variant="outline" className="text-xs uppercase tracking-wide">
                              Billed monthly
                            </Badge>
                          ) : null}

                        </div>
                      </div>
                    ) : (
                      <span className="text-3xl font-semibold text-foreground">{price}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BadgeCheck className="h-4 w-4" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant={plan.popular ? 'default' : 'secondary'}>
                    {plan.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

