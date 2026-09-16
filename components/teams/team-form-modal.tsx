'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { teamSchema, TeamFormData } from '@/lib/validation-schemas';
import { Loader2 } from 'lucide-react';

interface TeamFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TeamFormData) => Promise<void>;
}

export function TeamFormModal({ open, onOpenChange, onSubmit }: TeamFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  async function handleSubmit(data: TeamFormData) {
    setIsLoading(true);
    try {
      await onSubmit(data);
      form.reset();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">Create New Team</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Set up a new team and start adding members
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Team Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Product Development Team"
                      disabled={isLoading}
                      className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 dark:text-gray-300">Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the team's purpose and goals"
                      disabled={isLoading}
                      rows={3}
                      className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-700 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
