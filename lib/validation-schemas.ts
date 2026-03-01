import { z } from 'zod'

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Register Schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

// Profile Schema
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  surveyGroupRole: z.string().max(1000, 'Response too long').optional(),
  surveyDecisionMaking: z.string().max(1000, 'Response too long').optional(),
  surveyDeadline: z.string().max(1000, 'Response too long').optional(),
  surveyConflict: z.string().max(1000, 'Response too long').optional(),
  surveyOrganized: z.string().max(100, 'Response too long').optional(),
  surveySpeakingUp: z.string().max(100, 'Response too long').optional(),
  surveySkills: z.string().max(1000, 'Response too long').optional(),
  surveyFrustrations: z.string().max(1000, 'Response too long').optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// Team Schema
export const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
  description: z.string().max(500, 'Description too long').optional(),
})

export type TeamFormData = z.infer<typeof teamSchema>

// Member Selection Schema
export const memberSelectionSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
})

export type MemberSelectionData = z.infer<typeof memberSelectionSchema>

// Backward-compatible aliases
export type LoginFormValues = LoginFormData
export type RegisterFormValues = RegisterFormData
export type ProfileFormValues = ProfileFormData
export type CreateTeamFormValues = TeamFormData
export type AddMemberFormValues = MemberSelectionData
