'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTeams } from '@/hooks/use-teams'
import { useToast } from '@/hooks/use-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AddMemberModal } from '@/components/AddMemberModal'
import { StabilityChart } from '@/components/StabilityChart'
import { ChevronLeft, Plus, Users, Trash2, CheckCircle2, Loader2 } from 'lucide-react'

interface SearchableMember {
  id: string
  name: string
  role: string
  stability: number
}

export default function TeamDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { currentTeam, fetchTeamById, addMember, removeMember, confirmTeam, deleteTeam, isLoading } = useTeams()
  const { toast } = useToast()
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchableMember[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const teamId = params.id as string

  const loadTeam = useCallback(async () => {
    if (teamId) {
      await fetchTeamById(teamId)
    }
  }, [teamId, fetchTeamById])

  useEffect(() => {
    loadTeam()
  }, [loadTeam])

  // Search members by email
  const handleMemberSearch = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const { users } = await response.json()
        const memberUserIds = currentTeam?.members.map((m) => m.userId) || []
        const filtered = users
          .filter((u: { id: string }) => !memberUserIds.includes(u.id))
          .map((u: { id: string; name: string; role: string; personality_stability_score: number | null }) => ({
            id: u.id,
            name: u.name,
            role: u.role,
            stability: u.personality_stability_score ?? 0,
          }))
        setSearchResults(filtered)
      }
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [currentTeam?.members])

  if (!currentTeam && isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!currentTeam) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Team not found</p>
              <Link href="/teams">
                <Button className="mt-4">Back to Teams</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const team = currentTeam

  const handleAddMember = async (userId: string) => {
    try {
      await addMember(team.id, userId)
      toast({
        title: 'Success',
        description: 'Member added to team',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add member',
        variant: 'destructive',
      })
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(team.id, memberId)
      toast({
        title: 'Success',
        description: 'Member removed from team',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to remove member',
        variant: 'destructive',
      })
    }
  }

  const handleConfirmTeam = async () => {
    setIsConfirming(true)
    try {
      await confirmTeam(team.id)
      toast({
        title: 'Success',
        description: 'Team confirmed and evaluated!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm team',
        variant: 'destructive',
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const handleDeleteTeam = async () => {
    setIsDeleting(true)
    try {
      await deleteTeam(team.id)
      toast({
        title: 'Success',
        description: 'Team deleted',
      })
      router.push('/teams')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete team',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  function getScoreColorClass(score: number): string {
    if (score >= 65) return 'bg-green-100 text-green-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  function getClassificationBadge(classification: string) {
    switch (classification) {
      case 'Stable':
        return <Badge className="bg-green-100 text-green-800 text-lg py-3 px-4">Stable</Badge>
      case 'Medium':
        return <Badge className="bg-yellow-100 text-yellow-800 text-lg py-3 px-4">Medium</Badge>
      case 'Needs Change':
        return <Badge className="bg-red-100 text-red-800 text-lg py-3 px-4">Needs Change</Badge>
      default:
        return null
    }
  }

  // Chart data from agent scores (if evaluation exists)
  const agentChartData = team.teamEvaluation?.agentScores.map((agent) => ({
    name: agent.agentName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    score: Math.round(agent.score * 100),
  })) || []

  // Member stability chart data
  const memberChartData = team.members.map((member) => ({
    name: member.name.split(' ')[0],
    score: member.personalityStability.score,
  }))

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="space-y-8">
          {/* Back Button */}
          <Link href="/teams" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ChevronLeft className="w-4 h-4" />
            Back to Teams
          </Link>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{team.name}</h1>
            {team.description && <p className="text-muted-foreground">{team.description}</p>}
          </div>

          {/* Team Status Card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members ({team.members.length})
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {!team.confirmed && (
                    <Button
                      onClick={handleConfirmTeam}
                      disabled={isConfirming || team.members.length === 0}
                      className="gap-2"
                    >
                      {isConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Confirm & Evaluate Team
                        </>
                      )}
                    </Button>
                  )}
                  {!team.confirmed && (
                    <Button
                      onClick={() => setIsAddMemberOpen(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Member
                    </Button>
                  )}
                  <Button
                    onClick={handleDeleteTeam}
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? 'Deleting...' : 'Delete Team'}
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Members List */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members.length > 0 ? (
              team.members.map((member) => (
                <Card key={member.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge className={getScoreColorClass(member.personalityStability.score)}>
                        {member.personalityStability.score}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {member.memberRecommendation && (
                      <p className="text-xs text-muted-foreground">
                        {member.memberRecommendation}
                      </p>
                    )}
                    {!team.confirmed && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="md:col-span-2 lg:col-span-3 border-dashed">
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">No members added yet</p>
                  <Button onClick={() => setIsAddMemberOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add First Member
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Member Stability Chart */}
          {team.members.length > 0 && memberChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Member Stability Scores</CardTitle>
                <CardDescription>Individual personality stability scores</CardDescription>
              </CardHeader>
              <CardContent>
                <StabilityChart data={memberChartData} />
              </CardContent>
            </Card>
          )}

          {/* Team Evaluation Results */}
          {team.confirmed && team.teamEvaluation && (
            <>
              {/* Overall Evaluation */}
              <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
                <CardHeader>
                  <CardTitle>Team Evaluation Results</CardTitle>
                  <CardDescription>Comprehensive team dynamics analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">Overall Team Stability</p>
                        <p className="text-3xl font-bold">{Math.round(team.teamEvaluation.stabilityScore)}%</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {team.teamEvaluation.recommendation}
                        </p>
                      </div>
                      {getClassificationBadge(team.teamEvaluation.classification)}
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {team.teamEvaluation.strengths.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-green-700">Strengths</h4>
                          <ul className="space-y-1">
                            {team.teamEvaluation.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-muted-foreground">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {team.teamEvaluation.weaknesses.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-yellow-700">Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {team.teamEvaluation.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm text-muted-foreground">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Member Recommendations */}
                    {team.members.some((m) => m.memberRecommendation) && (
                      <div>
                        <h4 className="font-semibold mb-4">Member-Level Insights</h4>
                        <div className="space-y-2">
                          {team.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 bg-secondary rounded">
                              <span className="font-medium">{member.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground max-w-[300px] truncate">
                                  {member.memberRecommendation}
                                </span>
                                <Badge variant="outline">{member.personalityStability.score}%</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Agent Scores Spider Chart */}
              {agentChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Evaluation Breakdown</CardTitle>
                    <CardDescription>Scores from each evaluation agent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <StabilityChart data={agentChartData} />
                  </CardContent>
                </Card>
              )}

              {/* Agent Details */}
              {team.teamEvaluation.agentScores.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {team.teamEvaluation.agentScores.map((agent) => (
                    <Card key={agent.agentName}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm">
                            {agent.agentName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </CardTitle>
                          <Badge className={getScoreColorClass(Math.round(agent.score * 100))}>
                            {Math.round(agent.score * 100)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">{agent.explanation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Add Member Modal */}
      <AddMemberModal
        open={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        availableMembers={searchResults}
        onAddMember={handleAddMember}
        onSearch={handleMemberSearch}
        isLoading={isSearching}
      />

      <Footer />
    </div>
  )
}
