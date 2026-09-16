'use client';

import { PersonalityStability } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PersonalityStabilityProps {
  data: PersonalityStability;
}

export function PersonalityStabilitySection({ data }: PersonalityStabilityProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  };

  const getTrendIcon = (score: number) => {
    if (score >= 75) return <TrendingUp className="w-5 h-5" />;
    if (score >= 50) return <Minus className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

  const getStatusLabel = (score: number) => {
    if (score >= 75) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950" id="personality-stability">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Personality Stability</CardTitle>
        <CardDescription>Your team compatibility assessment results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Stability Score</span>
            <Badge className={`text-lg px-4 py-2 ${getScoreColor(data.score)} border-0`}>
              {getTrendIcon(data.score)}
              <span className="ml-2">{data.score}%</span>
            </Badge>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                data.score >= 75
                  ? 'bg-green-600'
                  : data.score >= 50
                  ? 'bg-yellow-600'
                  : 'bg-red-600'
              }`}
              style={{ width: `${data.score}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Status: {getStatusLabel(data.score)}</p>
        </div>

        {/* Recommendation */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recommendation</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {data.recommendation}
          </p>
        </div>

        {/* Strengths */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Strengths</h4>
          <div className="space-y-2">
            {data.strengths.map((strength, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50">
                <span className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Areas for Improvement</h4>
          <div className="space-y-2">
            {data.weaknesses.map((weakness, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50">
                <span className="w-2 h-2 bg-yellow-600 rounded-full flex-shrink-0"></span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{weakness}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
