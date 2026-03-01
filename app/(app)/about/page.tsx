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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-5xl font-bold">About TeamHarmony</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              We believe that the key to organizational success lies in building teams where personalities complement each other and trust is the foundation.
            </p>
          </div>

          {/* Mission Section */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To empower organizations to form high-performing teams by providing data-driven personality assessments and team compatibility insights. We transform the way teams are built, ensuring that every team member can contribute their best and thrive.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Personality-driven team formation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Stability assessment and insights
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Continuous team optimization
                </li>
              </ul>
            </div>
            <div className="rounded-lg h-64 flex items-center justify-center overflow-hidden">
              <Image
                src="/team-mission.jpg"
                alt="TeamHarmony mission - team collaboration"
                width={400}
                height={300}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Values Section */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: 'Precision',
                  description: 'We use advanced personality assessment methodologies to provide accurate insights.',
                },
                {
                  icon: Users,
                  title: 'Collaboration',
                  description: 'We believe in the power of diverse teams working together with mutual respect.',
                },
                {
                  icon: TrendingUp,
                  title: 'Growth',
                  description: 'We help teams continuously improve and evolve their dynamics over time.',
                },
              ].map((value, idx) => {
                const Icon = value.icon
                return (
                  <Card key={idx}>
                    <CardContent className="pt-6">
                      <Icon className="w-10 h-10 text-primary mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* How It Works */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2">How It Works</h2>
              <p className="text-muted-foreground">Simple, data-driven team formation in four steps</p>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  step: '1',
                  title: 'Complete Your Profile',
                  description: 'Share your personality traits and professional background',
                },
                {
                  step: '2',
                  title: 'Create a Team',
                  description: 'Define your team goals and structure requirements',
                },
                {
                  step: '3',
                  title: 'Add Members',
                  description: 'Select team members based on stability scores',
                },
                {
                  step: '4',
                  title: 'Get Insights',
                  description: 'Receive detailed team harmony and stability analysis',
                },
              ].map((item, idx) => (
                <Card key={idx}>
                  <CardContent className="pt-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary text-xl font-bold flex items-center justify-center mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-8 text-center space-y-4">
              <h2 className="text-2xl font-bold">Ready to Build Your Ideal Team?</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Start your journey towards harmonious, high-performing teams today.
              </p>
              <Link href="/register">
                <Button className="gap-2">
                  <Zap className="w-4 h-4" />
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
