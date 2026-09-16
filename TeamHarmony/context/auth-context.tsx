'use client'

import { createContext, useState, useCallback, useRef, ReactNode, useEffect } from 'react'
import { createClient, resetClient } from '@/lib/supabase/client'
import { mapDbUserToUser, type User, type DbUser } from '@/lib/types'
import type { LoginFormData, RegisterFormData } from '@/lib/validation-schemas'

interface AuthContextType {
  currentUser: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isProfileComplete: boolean
  login: (data: LoginFormData) => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (formData: FormData) => Promise<void>
  analyzePersonality: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // Store authId in a ref so it's always available without calling getSession()
  const authIdRef = useRef<string | null>(null)
  const supabaseRef = useRef(createClient())
  const supabase = supabaseRef.current

  // Fetch user profile from DB by auth_id
  const fetchUserProfile = useCallback(async (authId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single()

    if (error || !data) return null
    return mapDbUserToUser(data as DbUser)
  }, [supabase])

  // Listen for auth state changes
  useEffect(() => {
    setIsHydrated(true)
    // No browser Supabase auth calls — login/register set state directly
    setIsLoading(false)
  }, [])

  // Helper to get authId without calling getSession
  const getAuthId = useCallback((): string | null => {
    return authIdRef.current || currentUser?.authId || null
  }, [currentUser?.authId])

  const login = useCallback(async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      // Call server-side login API — bypasses browser Supabase client entirely
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Login failed')
      }

      const { user } = await response.json()

      // Set user state directly — no browser Supabase client calls needed
      authIdRef.current = user.auth_id
      setCurrentUser(mapDbUserToUser(user as DbUser))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      // Create user via API route (handles both auth and DB row)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Registration failed')
      }

      // Auto-login after registration by calling the login API route
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      })

      if (!loginResponse.ok) {
        const err = await loginResponse.json()
        throw new Error(err.error || 'Login after registration failed')
      }

      const { user } = await loginResponse.json()
      authIdRef.current = user.auth_id
      setCurrentUser(mapDbUserToUser(user as DbUser))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    authIdRef.current = null
    setCurrentUser(null)
    // Use scope: 'local' to avoid the hanging network call to Supabase
    try {
      await supabaseRef.current.auth.signOut({ scope: 'local' })
    } catch {
      // Ignore errors
    }
    // Clear any lingering Supabase auth tokens from localStorage
    try {
      const keys = Object.keys(localStorage)
      for (const key of keys) {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key)
        }
      }
    } catch {
      // Ignore if localStorage is unavailable
    }
    // Reset the Supabase client to start fresh
    supabaseRef.current = resetClient()
    setIsLoading(false)
  }, [])

  const updateProfile = useCallback(async (formData: FormData) => {
    const authId = getAuthId()
    if (!authId) throw new Error('Not authenticated')

    formData.append('authId', authId)

    const response = await fetch('/api/profile/update', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Profile update failed')
    }

    const { user } = await response.json()
    setCurrentUser(mapDbUserToUser(user as DbUser))
  }, [getAuthId])

  const analyzePersonality = useCallback(async () => {
    const authId = getAuthId()
    if (!authId) throw new Error('Not authenticated')

    const response = await fetch('/api/profile/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authId }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Analysis failed')
    }

    const { user } = await response.json()
    setCurrentUser(mapDbUserToUser(user as DbUser))
  }, [getAuthId])

  const refreshUser = useCallback(async () => {
    const authId = getAuthId()
    if (authId) {
      const user = await fetchUserProfile(authId)
      setCurrentUser(user)
    }
  }, [getAuthId, fetchUserProfile])

  const value: AuthContextType = {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    isProfileComplete: currentUser?.profileComplete ?? false,
    login,
    register,
    logout,
    updateProfile,
    analyzePersonality,
    refreshUser,
  }

  if (!isHydrated) {
    return <>{children}</>
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
