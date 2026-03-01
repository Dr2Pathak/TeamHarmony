'use client';

import { useState, useEffect } from 'react';
import { TeamMember } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TeamMemberCard } from './team-member-card';
import { Loader2 } from 'lucide-react';

interface AvailableUser {
  id: string;
  name: string;
  role: string;
  personality_stability_score: number | null;
}

interface MemberSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMember: (member: TeamMember) => void;
  existingMemberIds: string[];
  title?: string;
  description?: string;
}

export function MemberSelectionModal({
  open,
  onOpenChange,
  onSelectMember,
  existingMemberIds,
  title = 'Add Team Member',
  description = 'Select a member to add to your team',
}: MemberSelectionModalProps) {
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setIsLoading(true);
      fetch('/api/users/search?q=')
        .then((res) => res.ok ? res.json() : { users: [] })
        .then(({ users }) => {
          const filtered = (users || []).filter(
            (u: AvailableUser) => !existingMemberIds.includes(u.id)
          );
          setAvailableUsers(filtered);
        })
        .catch(() => setAvailableUsers([]))
        .finally(() => setIsLoading(false));
    }
  }, [open, existingMemberIds]);

  const toTeamMember = (user: AvailableUser): TeamMember => ({
    id: '',
    userId: user.id,
    name: user.name,
    role: user.role,
    personalityStability: {
      score: user.personality_stability_score ?? 0,
      confidenceLevel: '',
      recommendation: '',
      strengths: [],
      weaknesses: [],
    },
    memberRecommendation: '',
    memberStrengths: [],
    memberWeaknesses: [],
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">{title}</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : availableUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No members available to add at this time
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableUsers.map((user) => {
              const member = toTeamMember(user);
              return (
                <div key={user.id} className="relative group">
                  <TeamMemberCard member={member} />
                  <Button
                    onClick={() => {
                      onSelectMember(member);
                      onOpenChange(false);
                    }}
                    className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700"
                  >
                    Select
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
