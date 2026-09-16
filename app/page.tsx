'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/layout/navigation'
import { Footer } from '@/components/layout/footer'
import { useAuth } from '@/hooks/use-auth'
import { Users, BarChart3, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-screen flex-col text-foreground">
      <Navigation />
      <main className="flex-1">
        {/* Full-bleed hero — brand first, one composition */}
        <section className="relative isolate min-h-[calc(100vh-4.25rem)] overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-20">
            <img
              src="/hero-illustration.jpg"
              alt=""
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--harmony-mist)] via-[color:var(--harmony-mist)]/92 to-[color:var(--harmony-mist)]/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-[color:var(--harmony-sky)]/25" />
          </div>

          {/* Signature harmonic rings */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="animate-chord absolute left-[62%] top-[16%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full border border-primary/25" />
            <div className="animate-chord absolute left-[66%] top-[24%] h-[18rem] w-[18rem] -translate-x-1/2 rounded-full border border-primary/30 [animation-delay:1.2s]" />
            <div className="animate-float-soft absolute left-[52%] top-[36%] h-16 w-16 rounded-full bg-primary/30 blur-[1px]" />
            <div className="animate-float-soft absolute left-[74%] top-[40%] h-10 w-10 rounded-full bg-accent/40 [animation-delay:1.5s]" />
            <div className="animate-float-soft absolute left-[68%] top-[26%] h-12 w-12 rounded-full bg-[color:var(--harmony-sky)]/90 [animation-delay:0.8s]" />
          </div>

          <div className="mx-auto flex min-h-[calc(100vh-4.25rem)] max-w-7xl flex-col justify-center px-4 py-16 md:px-8 md:py-20">
            <div className="animate-fade-up max-w-2xl space-y-8">
              <p className="font-display text-4xl font-semibold tracking-tight text-primary sm:text-5xl md:text-6xl">
                TeamHarmony
              </p>
              <h1 className="font-display text-3xl font-medium leading-[1.15] text-foreground text-balance sm:text-4xl md:text-5xl">
                Build teams that feel as steady as they perform.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Personality-aware matching and stability insights help educators and leaders form groups with real chemistry.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {isAuthenticated ? (
                  <Link href="/teams">
                    <Button size="lg" className="rounded-full px-7">
                      View Teams
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="rounded-full px-7">
                        Get started free
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button size="lg" variant="outline" className="rounded-full px-7">
                        Learn more
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="border-y border-border/60 bg-card/50 py-20 md:py-28">
          <div className="mx-auto max-w-7xl space-y-12 px-4 md:px-8">
            <div className="mx-auto max-w-2xl space-y-3 text-center">
              <h2 className="font-display text-3xl font-semibold md:text-4xl">Why TeamHarmony?</h2>
              <p className="text-lg text-muted-foreground">
                Form, understand, and steadily improve the groups you rely on.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: Users,
                  title: 'Personality matching',
                  description:
                    'Pair complementary traits so collaboration feels natural instead of forced.',
                },
                {
                  icon: BarChart3,
                  title: 'Stability scoring',
                  description:
                    'See clear stability signals for people and whole teams before you commit.',
                },
                {
                  icon: Sparkles,
                  title: 'Actionable insights',
                  description:
                    'Get practical recommendations that make group dynamics easier to improve.',
                },
              ].map((feature) => {
                const Icon = feature.icon
                return (
                  <article key={feature.title} className="harmony-ring rounded-2xl bg-card p-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 font-display text-xl font-semibold">{feature.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mx-auto mb-14 max-w-2xl space-y-3 text-center">
              <h2 className="font-display text-3xl font-semibold md:text-4xl">How it works</h2>
              <p className="text-lg text-muted-foreground">
                A calm path from profile to optimized groups.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              {[
                {
                  step: '01',
                  title: 'Create profile',
                  description: 'Share personality traits and professional context.',
                },
                {
                  step: '02',
                  title: 'Form teams',
                  description: 'Build groups with stability and fit in mind.',
                },
                {
                  step: '03',
                  title: 'Evaluate',
                  description: 'Review harmony and compatibility analysis.',
                },
                {
                  step: '04',
                  title: 'Optimize',
                  description: 'Use insights to refine dynamics over time.',
                },
              ].map((item) => (
                <div key={item.step} className="space-y-3 border-t border-primary/25 pt-5">
                  <div className="font-display text-3xl font-semibold text-primary/35">{item.step}</div>
                  <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-y border-border/60 bg-secondary/40 py-20 md:py-28">
          <div className="mx-auto max-w-7xl space-y-10 px-4 md:px-8">
            <h2 className="font-display text-center text-3xl font-semibold md:text-4xl">Benefits</h2>
            <div className="mx-auto grid max-w-3xl gap-4">
              {[
                'Reduce friction through personality-aware matching',
                'Improve productivity with stronger team chemistry',
                'Make clearer decisions about group composition',
                'Support satisfaction and longer-term collaboration',
                'Accelerate performance toward shared goals',
                'Build steadier, more welcoming work environments',
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 text-base md:text-lg">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {!isAuthenticated && (
          <section className="py-20 md:py-28">
            <div className="mx-auto max-w-7xl px-4 md:px-8">
              <div className="harmony-ring relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-card to-[color:var(--harmony-sky)]/40 px-6 py-14 text-center md:px-12">
                <div className="mx-auto max-w-2xl space-y-6">
                  <h2 className="font-display text-3xl font-semibold md:text-4xl">
                    Ready to bring more harmony to your teams?
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Start forming steadier, higher-trust groups with TeamHarmony today.
                  </p>
                  <Link href="/register">
                    <Button size="lg" className="rounded-full px-8">
                      Get started for free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  )
}
