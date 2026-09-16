'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTeams } from '@/hooks/use-teams';
import { TeamCard } from './team-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';
import { TeamFormModal } from './team-form-modal';

export function TeamList() {
  const { teams, isLoading, fetchTeams, createTeam } = useTeams();
  const [showNewTeamModal, setShowNewTeamModal] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  if (isLoading && teams.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading your teams...</p>
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center py-12">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              No teams yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create your first team to get started with team formation and evaluation
            </p>
          </div>
          <Button
            onClick={() => setShowNewTeamModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Team
          </Button>
          {showNewTeamModal && (
            <TeamFormModal
              open={showNewTeamModal}
              onOpenChange={setShowNewTeamModal}
              onSubmit={async (data) => {
                await createTeam(data);
                setShowNewTeamModal(false);
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Teams ({teams.length})
        </h2>
        <Button
          onClick={() => setShowNewTeamModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Team
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      {showNewTeamModal && (
        <TeamFormModal
          open={showNewTeamModal}
          onOpenChange={setShowNewTeamModal}
          onSubmit={async (data) => {
            await createTeam(data);
            setShowNewTeamModal(false);
          }}
        />
      )}
    </div>
  );
}
