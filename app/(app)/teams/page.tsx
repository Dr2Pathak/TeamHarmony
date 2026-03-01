'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTeams } from '@/hooks/use-teams'
import { TeamCard } from '@/components/TeamCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Plus, Users } from 'lucide-react'

export default function TeamsPage() {
  const { teams } = useTeams()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Teams</h1>
            <p className="text-lg text-muted-foreground">
              Create and manage your teams with personality matching
            </p>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <Link href="/teams/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create New Team
              </Button>
            </Link>
          </div>

          {/* Teams Grid */}
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
                  <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No teams yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      Start building your ideal team by creating a new team and adding members based on personality stability.
                    </p>
                  </div>
                  <Link href="/teams/create">
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Your First Team
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
