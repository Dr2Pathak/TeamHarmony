'use client';

import { TeamMember } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TeamMemberCardProps {
  member: TeamMember;
  onRemove?: (memberId: string) => void;
  onSwap?: (memberId: string) => void;
  showActions?: boolean;
}

export function TeamMemberCard({ member, onRemove, onSwap, showActions = false }: TeamMemberCardProps) {
  const getStabilityColor = (score: number) => {
    if (score >= 75) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  };

  const getTrendIcon = (score: number) => {
    if (score >= 75) return <TrendingUp className="w-4 h-4" />;
    if (score >= 50) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const score = member.personalityStability.score;

  return (
    <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4">
          {/* Member Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                {member.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                  {member.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {member.role}
                </p>
              </div>
            </div>
            {showActions && (
              <div className="flex items-center gap-1 flex-shrink-0">
                {onSwap && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSwap(member.id)}
                    className="hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    Swap
                  </Button>
                )}
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(member.id)}
                    className="hover:bg-red-100 dark:hover:bg-red-900/30 h-8 w-8"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Stability Score */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Stability Score</span>
              <Badge className={`text-xs px-2 py-0.5 ${getStabilityColor(score)} border-0 flex items-center gap-1`}>
                {getTrendIcon(score)}
                <span>{score}%</span>
              </Badge>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  score >= 75
                    ? 'bg-green-600'
                    : score >= 50
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Recommendation</p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              {member.personalityStability.recommendation}
            </p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Strengths</p>
              <div className="space-y-1">
                {member.personalityStability.strengths.slice(0, 2).map((strength, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full flex-shrink-0"></span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Weaknesses</p>
              <div className="space-y-1">
                {member.personalityStability.weaknesses.slice(0, 2).map((weakness, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full flex-shrink-0"></span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">{weakness}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
