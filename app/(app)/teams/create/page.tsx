'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useTeams } from '@/hooks/use-teams'
import { teamSchema, type TeamFormData } from '@/lib/validation-schemas'
import { useToast } from '@/hooks/use-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateTeamPage() {
  const router = useRouter()
  const { createTeam } = useTeams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  async function onSubmit(values: TeamFormData) {
    setIsLoading(true)
    try {
      const team = await createTeam(values)
      toast({
        title: 'Success',
        description: 'Team created successfully.',
      })
      router.push(`/teams/${team.id}`)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create team.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8">
        <div className="space-y-8">
          {/* Back Button */}
          <Link href="/teams" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ChevronLeft className="w-4 h-4" />
            Back to Teams
          </Link>

          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold mb-2">Create New Team</h1>
            <p className="text-muted-foreground">Define your team's name and description to get started</p>
          </div>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>Team Information</CardTitle>
              <CardDescription>Provide basic details about your team</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="name">Team Name</Label>
                        <FormControl>
                          <Input
                            id="name"
                            placeholder="e.g., Product Team Alpha"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="description">Description</Label>
                        <FormControl>
                          <Textarea
                            id="description"
                            placeholder="Describe your team's purpose and goals"
                            disabled={isLoading}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Creating...' : 'Create Team'}
                    </Button>
                    <Link href="/teams">
                      <Button variant="outline" disabled={isLoading}>
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-secondary/50 border-secondary">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Next Steps:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Create your team with a meaningful name</li>
                <li>2. Add team members based on their personality stability</li>
                <li>3. Review member compatibility and team dynamics</li>
                <li>4. Confirm your team formation</li>
                <li>5. Get detailed team evaluation insights</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
