'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { useTeams } from '@/hooks/use-teams'
import { TeamCard } from '@/components/TeamCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Users, Zap, TrendingUp, Plus } from 'lucide-react'

export default function DashboardPage() {
  const { currentUser } = useAuth()
  const { teams, fetchTeams } = useTeams()

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const totalMembers = teams.reduce((sum, team) => sum + team.members.length, 0)

  const evaluatedTeams = teams.filter((t) => t.teamEvaluation !== null)
  const averageStability = evaluatedTeams.length > 0
    ? Math.round(
        evaluatedTeams.reduce((sum, t) => sum + (t.teamEvaluation?.stabilityScore ?? 0), 0)
        / evaluatedTeams.length
      )
    : null

  const metrics = [
    {
      label: 'Total Teams',
      value: teams.length,
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Average Stability',
      value: averageStability !== null ? `${averageStability}%` : 'N/A',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Team Members',
      value: totalMembers,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">
              Welcome back, <span className="text-primary">{currentUser?.name || 'Guest'}</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage your teams and build harmonious team dynamics
            </p>
          </div>

          {/* Metrics */}
          <div className="grid md:grid-cols-3 gap-4">
            {metrics.map((metric, idx) => {
              const Icon = metric.icon
              return (
                <Card key={idx}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{metric.label}</p>
                        <p className="text-3xl font-bold mt-2">{metric.value}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg ${metric.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Teams Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Your Teams</h2>
                <p className="text-muted-foreground">Manage and organize your team assignments</p>
              </div>
              <Link href="/teams/create">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Team</span>
                </Button>
              </Link>
            </div>

            {teams.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="pt-8 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">No teams yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first team to get started with team formation
                      </p>
                    </div>
                    <Link href="/teams/create">
                      <Button>Create Your First Team</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Start */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Getting Started Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Complete your profile to unlock personality assessments</li>
                <li>• Create a team and add members based on their stability scores</li>
                <li>• Evaluate teams to get detailed harmony insights</li>
                <li>• Use the insights to refine your team composition</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
