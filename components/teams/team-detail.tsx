'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeams } from '@/hooks/use-teams';
import { TeamMemberCard } from './team-member-card';
import { TeamEvaluation } from './team-evaluation';
import { MemberSelectionModal } from './member-selection-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, ArrowLeft } from 'lucide-react';

export function TeamDetail() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const { currentTeam, isLoading, fetchTeamById, addMember, removeMember, confirmTeam } = useTeams();
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeamById(teamId);
    }
  }, [teamId, fetchTeamById]);

  if (isLoading || !currentTeam) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading team details...</p>
        </div>
      </div>
    );
  }

  const handleConfirmTeam = async () => {
    setIsConfirming(true);
    try {
      await confirmTeam(currentTeam.id);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-400"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{currentTeam.name}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentTeam.members.length} member{currentTeam.members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-gray-900 dark:text-white">Team Members</CardTitle>
            <CardDescription>View and manage your team composition</CardDescription>
          </div>
          {!currentTeam.confirmed && (
            <Button
              onClick={() => setShowAddMemberModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {currentTeam.members.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No members added yet</p>
              <Button
                onClick={() => setShowAddMemberModal(true)}
                variant="outline"
              >
                Add Your First Member
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTeam.members.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  onRemove={!currentTeam.confirmed ? (id) => removeMember(currentTeam.id, id) : undefined}
                  showActions={!currentTeam.confirmed}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Team Button */}
      {currentTeam.members.length > 0 && !currentTeam.confirmed && (
        <div className="flex justify-center">
          <Button
            onClick={handleConfirmTeam}
            disabled={isConfirming}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 px-8"
          >
            {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isConfirming ? 'Evaluating Team...' : 'Confirm Team & Get Evaluation'}
          </Button>
        </div>
      )}

      {/* Team Evaluation Section */}
      {currentTeam.confirmed && currentTeam.teamEvaluation && (
        <TeamEvaluation
          teamEvaluation={currentTeam.teamEvaluation}
          members={currentTeam.members}
        />
      )}

      {/* Modals */}
      {showAddMemberModal && (
        <MemberSelectionModal
          open={showAddMemberModal}
          onOpenChange={setShowAddMemberModal}
          onSelectMember={(member) => {
            addMember(currentTeam.id, member.userId);
            setShowAddMemberModal(false);
          }}
          existingMemberIds={currentTeam.members.map(m => m.userId)}
        />
      )}
    </div>
  );
}
