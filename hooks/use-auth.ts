'use client'

import { useContext } from 'react'
import { AuthContext } from '@/context/auth-context'

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    return {
      currentUser: null,
      isLoading: false,
      isAuthenticated: false,
      isProfileComplete: false,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
      updateProfile: async () => {},
      analyzePersonality: async () => {},
      refreshUser: async () => {},
    }
  }

  return context
}
