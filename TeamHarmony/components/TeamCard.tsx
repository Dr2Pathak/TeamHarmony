'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Team } from '@/lib/types'
import { Users, Calendar, ChevronRight } from 'lucide-react'

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const getStabilityColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-800'
    if (score >= 70) return 'bg-green-100 text-green-800'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const stabilityScore = team.teamEvaluation?.stabilityScore ?? null

  return (
    <Card className="hover:shadow-lg transition-all duration-200 group cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold group-hover:text-primary transition">{team.name}</h3>
            {team.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{team.description}</p>
            )}
          </div>
          <Badge className={getStabilityColor(stabilityScore)}>
            {stabilityScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {team.members.length} <span className="hidden sm:inline">members</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {new Date(team.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <Link href={`/teams/${team.id}`} className="block">
          <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition">
            View Team
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
