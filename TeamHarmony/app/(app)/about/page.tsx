'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Users, Target, Zap, TrendingUp } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 md:px-8 md:py-14">
        <div className="space-y-16">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">About</p>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">About TeamHarmony</h1>
            <p className="text-xl leading-relaxed text-muted-foreground">
              We believe lasting collaboration starts when personalities complement each other and trust has room to grow.
            </p>
          </div>

          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-5">
              <h2 className="font-display text-3xl font-semibold">Our mission</h2>
              <p className="leading-relaxed text-muted-foreground">
                To help organizations form high-performing teams with personality-aware assessments and clear compatibility insights — so every member can contribute and thrive.
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  'Personality-driven team formation',
                  'Stability assessment and insights',
                  'Continuous team optimization',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative h-64 overflow-hidden rounded-2xl harmony-ring md:h-80">
              <Image
                src="/team-mission.jpg"
                alt="TeamHarmony mission - team collaboration"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="font-display text-center text-3xl font-semibold">Our values</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Target,
                  title: 'Precision',
                  description:
                    'We use careful personality assessment methods to provide clear, useful insights.',
                },
                {
                  icon: Users,
                  title: 'Collaboration',
                  description:
                    'We believe diverse teams work best when mutual respect and complementary strengths guide the mix.',
                },
                {
                  icon: TrendingUp,
                  title: 'Growth',
                  description:
                    'We help teams improve their dynamics steadily, not just once at formation time.',
                },
              ].map((value) => {
                const Icon = value.icon
                return (
                  <Card key={value.title} className="harmony-ring border-border/70 bg-card/90">
                    <CardContent className="pt-6">
                      <Icon className="mb-4 h-9 w-9 text-primary" />
                      <h3 className="mb-2 font-display text-xl font-semibold">{value.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="mb-2 font-display text-3xl font-semibold">How it works</h2>
              <p className="text-muted-foreground">Simple, data-informed team formation in four steps</p>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  step: '1',
                  title: 'Complete your profile',
                  description: 'Share your personality traits and professional background',
                },
                {
                  step: '2',
                  title: 'Create a team',
                  description: 'Define your team goals and structure requirements',
                },
                {
                  step: '3',
                  title: 'Add members',
                  description: 'Select team members with stability scores in mind',
                },
                {
                  step: '4',
                  title: 'Get insights',
                  description: 'Receive detailed team harmony and stability analysis',
                },
              ].map((item) => (
                <Card key={item.step} className="border-border/70 bg-card/90">
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 font-display text-xl font-semibold text-primary">
                      {item.step}
                    </div>
                    <h3 className="mb-2 font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="harmony-ring overflow-hidden rounded-3xl bg-gradient-to-br from-primary/12 via-card to-[color:var(--harmony-sky)]/35 px-6 py-12 text-center md:px-10">
            <div className="mx-auto max-w-xl space-y-4">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Ready to build your ideal team?
              </h2>
              <p className="text-muted-foreground">
                Start your journey toward steadier, higher-trust teams today.
              </p>
              <Link href="/register">
                <Button className="rounded-full gap-2">
                  <Zap className="h-4 w-4" />
                  Get started free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
