'use client';

import { TeamEvaluation as TeamEvaluationType, TeamMember } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TeamMemberCard } from './team-member-card';
import { SpiderChart } from './spider-chart';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TeamEvaluationProps {
  teamEvaluation: TeamEvaluationType;
  members: TeamMember[];
}

export function TeamEvaluation({ teamEvaluation, members }: TeamEvaluationProps) {
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

  const displayScore = Math.round(teamEvaluation.stabilityScore);

  const classificationColor = () => {
    switch (teamEvaluation.classification) {
      case 'Stable': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'Medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'Needs Change': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    }
  };

  // Build chart data from agent scores
  const chartData = teamEvaluation.agentScores.map((agent) => ({
    category: agent.agentName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: Math.round(agent.score * 100),
  }));

  return (
    <div className="space-y-8" id="team-evaluation">
      {/* Overall Team Evaluation */}
      <Card className="border-gray-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Team Evaluation</CardTitle>
          <CardDescription>Overall team harmony and compatibility assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stability Score */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Overall Stability Score</span>
              <Badge className={`text-lg px-4 py-2 ${getScoreColor(displayScore)} border-0`}>
                {getTrendIcon(displayScore)}
                <span className="ml-2">{displayScore}%</span>
              </Badge>
            </div>
            <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  displayScore >= 75
                    ? 'bg-green-600'
                    : displayScore >= 50
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
                }`}
                style={{ width: `${displayScore}%` }}
              ></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Recommendation */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recommendation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {teamEvaluation.recommendation}
              </p>
            </div>

            {/* Classification */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Classification</h4>
              <Badge className={`text-sm px-3 py-1 ${classificationColor()} border-0`}>
                {teamEvaluation.classification}
              </Badge>
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Team Strengths</h4>
            <div className="space-y-2">
              {teamEvaluation.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-950/50 border border-green-200 dark:border-green-900/30">
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
              {teamEvaluation.weaknesses.map((weakness, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-slate-950/50 border border-yellow-200 dark:border-yellow-900/30">
                  <span className="w-2 h-2 bg-yellow-600 rounded-full flex-shrink-0"></span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{weakness}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spider Chart */}
      {chartData.length > 0 && (
        <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Agent Evaluation Breakdown</CardTitle>
            <CardDescription>Visual representation of team evaluation by each agent</CardDescription>
          </CardHeader>
          <CardContent>
            <SpiderChart data={chartData} />
          </CardContent>
        </Card>
      )}

      {/* Member Evaluations */}
      <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Member Evaluations</CardTitle>
          <CardDescription>Individual assessment for each team member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
