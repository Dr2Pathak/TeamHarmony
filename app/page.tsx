'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/hooks/use-auth';
import { Users, BarChart3, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navigation />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance">
                Build{' '}
                <span className="text-primary">
                  Harmonious Teams
                </span>
                {' '}with Data-Driven Insights
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Form teams where personalities complement each other. Use personality-matched team formation to build high-performing groups with optimal stability and chemistry.
              </p>
              <div className="flex gap-4 flex-wrap">
                {isAuthenticated ? (
                  <Link href="/teams">
                    <Button size="lg" className="gap-2">
                      View Teams
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="gap-2">
                        Get Started Free
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button size="lg" variant="outline">
                        Learn More
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="relative hidden md:block rounded-2xl overflow-hidden h-80">
              <Image
                src="/hero-illustration.jpg"
                alt="TeamHarmony - Build harmonious teams"
                width={500}
                height={400}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold">Why TeamHarmony?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to form, manage, and optimize your teams
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: 'Personality Matching',
                  description:
                    'Advanced algorithms match team members based on complementary personality traits for better chemistry.',
                  color: 'text-primary',
                  bg: 'bg-primary/10',
                },
                {
                  icon: BarChart3,
                  title: 'Stability Scoring',
                  description:
                    'Get detailed stability metrics for each team member and your overall team dynamics.',
                  color: 'text-primary',
                  bg: 'bg-primary/10',
                },
                {
                  icon: Zap,
                  title: 'Actionable Insights',
                  description:
                    'Receive recommendations for team optimization and member compatibility improvements.',
                  color: 'text-primary',
                  bg: 'bg-primary/10',
                },
              ].map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <Card key={idx} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple, intuitive team formation in four easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Profile',
                description: 'Share your personality traits and professional background',
              },
              {
                step: '02',
                title: 'Form Teams',
                description: 'Create teams and add members based on stability scores',
              },
              {
                step: '03',
                title: 'Evaluate',
                description: 'Get detailed team harmony and compatibility analysis',
              },
              {
                step: '04',
                title: 'Optimize',
                description: 'Use insights to continuously improve team dynamics',
              },
            ].map((item, idx) => (
              <div key={idx} className="space-y-4">
                <div className="text-4xl font-bold text-primary/30">{item.step}</div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="bg-secondary py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
            <h2 className="text-4xl font-bold text-center">Benefits</h2>

            <div className="space-y-4">
              {[
                'Reduce team conflicts through personality-driven matching',
                'Improve productivity with better team chemistry',
                'Make data-informed decisions about team composition',
                'Increase employee satisfaction and retention',
                'Accelerate team performance and goal achievement',
                'Build sustainable, harmonious work environments',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3 text-lg">
                  <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
            <Card className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 border-primary/30">
              <CardContent className="pt-12 pb-12 text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold">Ready to Transform Your Teams?</h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Start building harmonious, high-performing teams today with TeamHarmony.
                  </p>
                </div>
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Get Started for Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
