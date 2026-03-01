'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/hooks/use-auth'
import { profileSchema, type ProfileFormData } from '@/lib/validation-schemas'
import type { SurveyData } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { PersonalityStabilityBadge } from '@/components/PersonalityStabilityBadge'
import { FileText, Mic, Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

const SURVEY_QUESTIONS: Array<{ key: keyof ProfileFormData; label: string; placeholder: string; type: 'textarea' | 'input' }> = [
  {
    key: 'surveyGroupRole',
    label: 'What role do you naturally take in group projects?',
    placeholder: 'e.g., I tend to take the lead and organize tasks, or I prefer to support others and focus on execution...',
    type: 'textarea',
  },
  {
    key: 'surveyDecisionMaking',
    label: 'How do you prefer to make decisions?',
    placeholder: 'e.g., I like to gather all the facts first and analyze them, or I go with my gut feeling...',
    type: 'textarea',
  },
  {
    key: 'surveyDeadline',
    label: 'When facing a tight deadline, you usually...',
    placeholder: 'e.g., I stay calm and prioritize, or I work intensely under pressure...',
    type: 'textarea',
  },
  {
    key: 'surveyConflict',
    label: 'How do you typically handle conflict in a team?',
    placeholder: 'e.g., I try to mediate and find common ground, or I address issues directly...',
    type: 'textarea',
  },
  {
    key: 'surveyOrganized',
    label: 'On a scale from 1\u20135, how organized are you?',
    placeholder: 'e.g., 4 — I keep detailed plans but stay flexible',
    type: 'input',
  },
  {
    key: 'surveySpeakingUp',
    label: 'On a scale from 1\u20135, how comfortable are you speaking up in group discussions?',
    placeholder: 'e.g., 3 — It depends on the topic and the group',
    type: 'input',
  },
  {
    key: 'surveySkills',
    label: 'What are your top 5 technical or functional skills?',
    placeholder: 'e.g., Python, project management, data analysis, public speaking, UX design',
    type: 'textarea',
  },
  {
    key: 'surveyFrustrations',
    label: 'When working in a team, what frustrates you the most?',
    placeholder: 'e.g., Lack of communication, unclear expectations, people not pulling their weight...',
    type: 'textarea',
  },
]

export default function ProfilePage() {
  const { currentUser, updateProfile, analyzePersonality, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const existingSurvey = (currentUser?.surveyData || {}) as SurveyData

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      surveyGroupRole: existingSurvey.groupRole || '',
      surveyDecisionMaking: existingSurvey.decisionMaking || '',
      surveyDeadline: existingSurvey.deadline || '',
      surveyConflict: existingSurvey.conflict || '',
      surveyOrganized: existingSurvey.organized || '',
      surveySpeakingUp: existingSurvey.speakingUp || '',
      surveySkills: existingSurvey.skills || '',
      surveyFrustrations: existingSurvey.frustrations || '',
    },
  })

  async function onSubmit(values: ProfileFormData) {
    setIsLoading(true)
    try {
      // Build structured survey data
      const surveyData: SurveyData = {
        groupRole: values.surveyGroupRole || '',
        decisionMaking: values.surveyDecisionMaking || '',
        deadline: values.surveyDeadline || '',
        conflict: values.surveyConflict || '',
        organized: values.surveyOrganized || '',
        speakingUp: values.surveySpeakingUp || '',
        skills: values.surveySkills || '',
        frustrations: values.surveyFrustrations || '',
      }

      // Send as JSON — no files, instant save
      const formData = new FormData()
      formData.append('name', values.name)
      formData.append('email', values.email)
      formData.append('surveyData', JSON.stringify(surveyData))

      await updateProfile(formData)
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleFileUpload(type: 'resume' | 'audio') {
    const file = type === 'resume' ? resumeFile : audioFile
    if (!file) return

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append(type, file)

      await updateProfile(formData)
      toast({
        title: 'Success',
        description: `${type === 'resume' ? 'Resume' : 'Audio'} uploaded successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to upload ${type}.`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAnalyzePersonality() {
    setIsAnalyzing(true)
    try {
      await analyzePersonality()
      toast({
        title: 'Success',
        description: 'Personality analysis complete!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to analyze personality.',
        variant: 'destructive',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  function getColorCode(score: number): 'success' | 'warning' | 'danger' {
    if (score >= 65) return 'success'
    if (score >= 40) return 'warning'
    return 'danger'
  }

  const personalityData = currentUser?.personalityStability && currentUser.personalityStability.score > 0
    ? {
        score: currentUser.personalityStability.score,
        recommendation: currentUser.personalityStability.recommendation,
        strengths: currentUser.personalityStability.strengths,
        weaknesses: currentUser.personalityStability.weaknesses,
        colorCode: getColorCode(currentUser.personalityStability.score),
      }
    : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8">
        <div className="space-y-8">
          {/* Profile Information */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and team preferences</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update your name and email</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="name">Full Name</Label>
                          <FormControl>
                            <Input id="name" placeholder="John Doe" disabled={isLoading} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label htmlFor="email">Email</Label>
                          <FormControl>
                            <Input
                              id="email"
                              placeholder="john@example.com"
                              type="email"
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Self-Assessment Survey Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Self-Assessment Survey</CardTitle>
                  <CardDescription>
                    Answer these questions to help us understand your work style and team preferences.
                    Your responses directly influence personality analysis and team matching.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {SURVEY_QUESTIONS.map((q) => (
                    <FormField
                      key={q.key}
                      control={form.control}
                      name={q.key}
                      render={({ field }) => (
                        <FormItem>
                          <Label>{q.label}</Label>
                          <FormControl>
                            {q.type === 'textarea' ? (
                              <Textarea
                                placeholder={q.placeholder}
                                disabled={isLoading}
                                className="resize-none min-h-[80px]"
                                {...field}
                              />
                            ) : (
                              <Input
                                placeholder={q.placeholder}
                                disabled={isLoading}
                                {...field}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Save Button */}
              <Button type="submit" disabled={isLoading || authLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </form>
          </Form>

          {/* Assessment Materials — separate from profile save */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Materials</CardTitle>
              <CardDescription>Upload optional materials for personality assessment. Files are uploaded separately.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Resume Upload */}
                <div className="space-y-2">
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center hover:bg-secondary cursor-pointer transition"
                    onClick={() => resumeInputRef.current?.click()}
                  >
                    <FileText className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold">Resume</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {resumeFile ? resumeFile.name : (currentUser?.resumeText ? 'Resume uploaded' : 'Click to select')}
                    </p>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  {resumeFile && (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={isLoading}
                      onClick={() => handleFileUpload('resume')}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Upload Resume
                    </Button>
                  )}
                </div>

                {/* Audio Upload */}
                <div className="space-y-2">
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center hover:bg-secondary cursor-pointer transition"
                    onClick={() => audioInputRef.current?.click()}
                  >
                    <Mic className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold">Audio</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {audioFile ? audioFile.name : (currentUser?.audioTranscript ? 'Audio uploaded' : 'Click to select')}
                    </p>
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept=".mp3,.wav,.m4a,.webm,.ogg"
                      className="hidden"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  {audioFile && (
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      disabled={isLoading}
                      onClick={() => handleFileUpload('audio')}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Upload Audio
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analyze Personality Button */}
          <Card>
            <CardHeader>
              <CardTitle>Personality Analysis</CardTitle>
              <CardDescription>
                Run AI-powered personality stability analysis based on your profile data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleAnalyzePersonality}
                disabled={isAnalyzing || authLoading || !currentUser?.profileComplete}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Personality'
                )}
              </Button>
              {!currentUser?.profileComplete && (
                <p className="text-xs text-muted-foreground mt-2">
                  Save your profile above first to enable analysis.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Personality Stability Results */}
          {personalityData && (
            <PersonalityStabilityBadge data={personalityData} />
          )}

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Ready to Form Your Team?</CardTitle>
              <CardDescription>Complete your profile and start building your ideal team</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/teams/create">
                <Button className="w-full md:w-auto">Go to Team Formation</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
