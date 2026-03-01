'use client'

import { createContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import type { Team, TeamFormData } from '@/lib/types'

interface TeamContextType {
  teams: Team[]
  currentTeam: Team | null
  isLoading: boolean
  fetchTeams: () => Promise<void>
  fetchTeamById: (teamId: string) => Promise<void>
  createTeam: (data: TeamFormData) => Promise<Team>
  addMember: (teamId: string, userId: string) => Promise<void>
  removeMember: (teamId: string, memberId: string) => Promise<void>
  confirmTeam: (teamId: string) => Promise<void>
  deleteTeam: (teamId: string) => Promise<void>
}

export const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const { currentUser } = useAuth()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const getAuthId = useCallback((): string => {
    const authId = currentUser?.authId
    if (!authId) throw new Error('Not authenticated')
    return authId
  }, [currentUser?.authId])

  const fetchTeams = useCallback(async () => {
    setIsLoading(true)
    try {
      const authId = getAuthId()
      const response = await fetch('/api/teams', {
        headers: { 'x-auth-id': authId },
      })

      if (!response.ok) throw new Error('Failed to fetch teams')

      const { teams: fetchedTeams } = await response.json()
      setTeams(fetchedTeams)
    } catch {
      // User may not be authenticated yet
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }, [getAuthId])

  const fetchTeamById = useCallback(async (teamId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}`)

      if (!response.ok) throw new Error('Failed to fetch team')

      const { team } = await response.json()
      setCurrentTeam(team)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTeam = useCallback(async (data: TeamFormData): Promise<Team> => {
    setIsLoading(true)
    try {
      const authId = getAuthId()
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-id': authId,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to create team')
      }

      const { team } = await response.json()
      setTeams((prev: Team[]) => [team, ...prev])
      return team
    } finally {
      setIsLoading(false)
    }
  }, [getAuthId])

  const addMember = useCallback(async (teamId: string, userId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to add member')
      }

      // Refresh team data
      await fetchTeamById(teamId)
    } finally {
      setIsLoading(false)
    }
  }, [fetchTeamById])

  const removeMember = useCallback(async (teamId: string, memberId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to remove member')
      }

      // Refresh team data
      await fetchTeamById(teamId)
    } finally {
      setIsLoading(false)
    }
  }, [fetchTeamById])

  const confirmTeam = useCallback(async (teamId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}/confirm`, {
        method: 'POST',
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to evaluate team')
      }

      // Refresh team data to get evaluation results
      await fetchTeamById(teamId)
      // Also refresh teams list
      await fetchTeams()
    } finally {
      setIsLoading(false)
    }
  }, [fetchTeamById, fetchTeams])

  const deleteTeam = useCallback(async (teamId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to delete team')
      }

      setTeams((prev: Team[]) => prev.filter((t: Team) => t.id !== teamId))
      if (currentTeam?.id === teamId) {
        setCurrentTeam(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [currentTeam?.id])

  const value: TeamContextType = {
    teams,
    currentTeam,
    isLoading,
    fetchTeams,
    fetchTeamById,
    createTeam,
    addMember,
    removeMember,
    confirmTeam,
    deleteTeam,
  }

  if (!isHydrated) {
    return <>{children}</>
  }

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}
