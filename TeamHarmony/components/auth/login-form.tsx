'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, LoginFormData } from '@/lib/validation-schemas';
import { AlertCircle, Loader2 } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState('');

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      setError('');
      await login(data);
      // Redirect to profile on success
      router.push('/profile');
    } catch (err) {
      setError('Failed to sign in. Please check your credentials.');
      console.error(err);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sign in to TeamHarmony</h1>
        <p className="text-gray-600 dark:text-gray-400">Enter your email and password to continue</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="your@email.com"
                    type="email"
                    disabled={isLoading}
                    className="bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    disabled={isLoading}
                    className="bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-slate-950 text-gray-600 dark:text-gray-400">
            Don't have an account?
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => router.push('/register')}
      >
        Create an account
      </Button>
    </div>
  );
}
