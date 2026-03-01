'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Users, BarChart3, AlertTriangle } from 'lucide-react'

interface GroupMember {
  email: string
  name: string
  stabilityScore: number
  estimatedMbti: string | null
}

interface OptimizedGroup {
  members: GroupMember[]
  score: number
}

interface OptimizationResult {
  groups: OptimizedGroup[]
  overall_score: number
  metadata: {
    total_students: number
    num_groups: number
    target_group_size: number
  }
}

function getScoreColor(score: number): string {
  const pct = score * 100
  if (pct >= 65) return 'bg-green-100 text-green-800'
  if (pct >= 40) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function getScoreBarColor(score: number): string {
  const pct = score * 100
  if (pct >= 65) return 'bg-green-600'
  if (pct >= 40) return 'bg-yellow-600'
  return 'bg-red-600'
}

export default function TeacherOptimizationPage() {
  const { toast } = useToast()
  const [emailsInput, setEmailsInput] = useState('')
  const [groupSize, setGroupSize] = useState(4)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [result, setResult] = useState<OptimizationResult | null>(null)

  const handleOptimize = async () => {
    const emails = emailsInput
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0)

    if (emails.length < 2) {
      toast({
        title: 'Error',
        description: 'Please enter at least 2 student emails.',
        variant: 'destructive',
      })
      return
    }

    if (groupSize < 2) {
      toast({
        title: 'Error',
        description: 'Group size must be at least 2.',
        variant: 'destructive',
      })
      return
    }

    if (groupSize > emails.length) {
      toast({
        title: 'Error',
        description: 'Group size cannot be greater than the number of students.',
        variant: 'destructive',
      })
      return
    }

    setIsOptimizing(true)
    setResult(null)
    try {
      const response = await fetch('/api/teacher/optimize-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_emails: emails,
          group_size: groupSize,
        }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Failed to optimize groups')
      }

      const data = await response.json()
      setResult(data)
      toast({
        title: 'Success',
        description: `Optimized ${data.metadata.total_students} students into ${data.metadata.num_groups} groups.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Optimization failed',
        variant: 'destructive',
      })
    } finally {
      setIsOptimizing(false)
    }
  }

  const emailCount = emailsInput
    .split(',')
    .map((e) => e.trim())
    .filter((e) => e.length > 0).length

  const notDivisible = emailCount > 0 && groupSize > 0 && emailCount % groupSize !== 0

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Teacher Group Optimization</h1>
            <p className="text-lg text-muted-foreground">
              Automatically form optimized student groups based on personality compatibility
            </p>
          </div>

          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Configure Groups
              </CardTitle>
              <CardDescription>
                Enter student emails and your desired group size
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emails">Student Emails (comma-separated)</Label>
                <Textarea
                  id="emails"
                  placeholder="student1@example.com, student2@example.com, student3@example.com..."
                  value={emailsInput}
                  onChange={(e) => setEmailsInput(e.target.value)}
                  rows={4}
                  disabled={isOptimizing}
                />
                {emailCount > 0 && (
                  <p className="text-xs text-muted-foreground">{emailCount} email(s) detected</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupSize">Target Group Size</Label>
                <Input
                  id="groupSize"
                  type="number"
                  min={2}
                  max={20}
                  value={groupSize}
                  onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                  className="max-w-[120px]"
                  disabled={isOptimizing}
                />
              </div>

              {notDivisible && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    {emailCount} students is not evenly divisible by {groupSize}. Some groups may differ by ±1 member.
                  </p>
                </div>
              )}

              <Button onClick={handleOptimize} disabled={isOptimizing || emailCount < 2} className="gap-2">
                {isOptimizing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4" />
                    Optimize Groups
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <>
              {/* Overall Score */}
              <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
                <CardHeader>
                  <CardTitle>Optimization Results</CardTitle>
                  <CardDescription>
                    {result.metadata.total_students} students organized into {result.metadata.num_groups} groups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Overall Compatibility Score</p>
                      <p className="text-3xl font-bold">{Math.round(result.overall_score * 100)}%</p>
                    </div>
                    <Badge className={`text-lg px-4 py-2 ${getScoreColor(result.overall_score)}`}>
                      {result.overall_score >= 0.65 ? 'Strong' : result.overall_score >= 0.45 ? 'Moderate' : 'Low'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Groups */}
              <div className="grid md:grid-cols-2 gap-6">
                {result.groups.map((group, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Group {idx + 1}</CardTitle>
                        <Badge className={getScoreColor(group.score)}>
                          {Math.round(group.score * 100)}%
                        </Badge>
                      </div>
                      {/* Score bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all ${getScoreBarColor(group.score)}`}
                          style={{ width: `${Math.round(group.score * 100)}%` }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {group.members.map((member) => (
                          <div
                            key={member.email}
                            className="flex items-center justify-between p-2 rounded-lg bg-secondary/50"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{member.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                              {member.estimatedMbti && (
                                <Badge variant="outline" className="text-xs">
                                  {member.estimatedMbti}
                                </Badge>
                              )}
                              <Badge className={getScoreColor(member.stabilityScore / 100)} variant="secondary">
                                {member.stabilityScore}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
