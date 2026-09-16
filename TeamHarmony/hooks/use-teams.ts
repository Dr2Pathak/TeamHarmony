'use client'

import { useContext } from 'react'
import { TeamContext } from '@/context/team-context'
import type { Team } from '@/lib/types'

export function useTeams() {
  const context = useContext(TeamContext)

  if (context === undefined) {
    return {
      teams: [] as Team[],
      currentTeam: null as Team | null,
      isLoading: false,
      fetchTeams: async () => {},
      fetchTeamById: async () => {},
      createTeam: async (): Promise<Team> => ({ id: '', name: '', description: '', ownerId: '', confirmed: false, members: [], teamEvaluation: null, createdAt: '', updatedAt: '' }),
      addMember: async () => {},
      removeMember: async () => {},
      confirmTeam: async () => {},
      deleteTeam: async () => {},
    }
  }

  return context
}
