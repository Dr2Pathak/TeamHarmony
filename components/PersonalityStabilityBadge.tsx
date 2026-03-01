'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, XCircle, TrendingUp } from 'lucide-react'

export interface PersonalityStabilityData {
  score: number
  recommendation: string
  strengths: string[]
  weaknesses: string[]
  colorCode: 'success' | 'warning' | 'danger'
}

export interface PersonalityStabilityBadgeProps {
  data: PersonalityStabilityData
  size?: 'sm' | 'md' | 'lg'
}

export function PersonalityStabilityBadge({
  data,
  size = 'md',
}: PersonalityStabilityBadgeProps) {
  const getIcon = () => {
    switch (data.colorCode) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4" />
      case 'warning':
        return <AlertCircle className="w-4 h-4" />
      case 'danger':
        return <XCircle className="w-4 h-4" />
    }
  }

  const getColor = () => {
    switch (data.colorCode) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200'
    }
  }

  const getBackgroundColor = () => {
    switch (data.colorCode) {
      case 'success':
        return 'bg-green-50'
      case 'warning':
        return 'bg-yellow-50'
      case 'danger':
        return 'bg-red-50'
    }
  }

  if (size === 'sm') {
    return (
      <Badge variant="outline" className={`${getColor()} gap-2`}>
        {getIcon()}
        <span className="font-semibold">{data.score}%</span>
      </Badge>
    )
  }

  return (
    <Card className={getBackgroundColor()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Personality Stability</CardTitle>
          <Badge className={`${getColor()} gap-2`}>
            {getIcon()}
            <span>{data.score}%</span>
          </Badge>
        </div>
        <CardDescription>{data.recommendation}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              Strengths
            </h4>
            <ul className="space-y-1">
              {data.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {strength}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Areas for Growth
            </h4>
            <ul className="space-y-1">
              {data.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
