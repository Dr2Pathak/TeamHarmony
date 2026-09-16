'use client';

import Link from 'next/link';
import { Team } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const getStabilityColor = (score?: number) => {
    if (!score) return 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300';
    if (score >= 75) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  };

  const getTrendIcon = (score?: number) => {
    if (!score) return null;
    if (score >= 75) return <TrendingUp className="w-4 h-4" />;
    if (score >= 50) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const stabilityScore = team.teamEvaluation?.stabilityScore;
  const isEvaluated = team.confirmed && team.teamEvaluation !== null;

  return (
    <Link href={`/teams/${team.id}`}>
      <Card className="border-gray-200 dark:border-slate-800 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer h-full bg-white dark:bg-slate-950">
        <CardContent className="pt-6 pb-6 h-full flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
                  {team.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Stability Score */}
            {stabilityScore !== undefined && stabilityScore !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Stability</span>
                  <Badge className={`text-xs px-2 py-0.5 ${getStabilityColor(Math.round(stabilityScore))} border-0 flex items-center gap-1`}>
                    {getTrendIcon(Math.round(stabilityScore))}
                    <span>{Math.round(stabilityScore)}%</span>
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stabilityScore >= 75
                        ? 'bg-green-600'
                        : stabilityScore >= 50
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.round(stabilityScore)}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex gap-2 pt-2">
              {isEvaluated ? (
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-0">
                  Evaluated
                </Badge>
              ) : team.confirmed ? (
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                  Confirmed
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-slate-700">
                  Pending
                </Badge>
              )}
            </div>
          </div>

          {/* Member Avatars */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-slate-800 mt-4">
            {team.members.slice(0, 3).map((member) => (
              <div
                key={member.id}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold"
                title={member.name}
              >
                {member.name.charAt(0)}
              </div>
            ))}
            {team.members.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-slate-700 flex items-center justify-center text-gray-700 dark:text-gray-300 text-xs font-semibold">
                +{team.members.length - 3}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
