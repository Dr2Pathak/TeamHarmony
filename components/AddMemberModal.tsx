'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, UserPlus } from 'lucide-react'

interface Member {
  id: string
  name: string
  role: string
  stability: number
}

interface AddMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableMembers: Member[]
  onAddMember: (userId: string) => Promise<void>
  onSearch: (query: string) => void
  isLoading: boolean
}

export function AddMemberModal({
  open,
  onOpenChange,
  availableMembers,
  onAddMember,
  onSearch,
  isLoading,
}: AddMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [addingId, setAddingId] = useState<string | null>(null)

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    onSearch(value)
  }

  const handleAdd = async (userId: string) => {
    setAddingId(userId)
    try {
      await onAddMember(userId)
    } finally {
      setAddingId(null)
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 65) return 'bg-green-100 text-green-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Search by email to find and add members to your team
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : availableMembers.length > 0 ? (
            availableMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-secondary/50 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {member.stability > 0 && (
                    <Badge className={getScoreColor(member.stability)} variant="secondary">
                      {member.stability}%
                    </Badge>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAdd(member.id)}
                    disabled={addingId === member.id}
                    className="gap-1"
                  >
                    {addingId === member.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <UserPlus className="w-3 h-3" />
                    )}
                    Add
                  </Button>
                </div>
              </div>
            ))
          ) : searchQuery.length > 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No members found for &quot;{searchQuery}&quot;
            </p>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">
              Type an email to search for members
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
