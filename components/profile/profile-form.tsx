'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { profileSchema, type ProfileFormData } from '@/lib/validation-schemas';
import type { SurveyData } from '@/lib/types';
import { PersonalityStabilitySection } from './personality-stability';
import { AlertCircle, Loader2, FileText, Mic } from 'lucide-react';

const SURVEY_QUESTIONS: Array<{ key: keyof ProfileFormData; label: string; placeholder: string; type: 'textarea' | 'input' }> = [
  {
    key: 'surveyGroupRole',
    label: 'What role do you naturally take in group projects?',
    placeholder: 'e.g., I tend to take the lead and organize tasks...',
    type: 'textarea',
  },
  {
    key: 'surveyDecisionMaking',
    label: 'How do you prefer to make decisions?',
    placeholder: 'e.g., I like to gather all the facts first...',
    type: 'textarea',
  },
  {
    key: 'surveyDeadline',
    label: 'When facing a tight deadline, you usually...',
    placeholder: 'e.g., I stay calm and prioritize...',
    type: 'textarea',
  },
  {
    key: 'surveyConflict',
    label: 'How do you typically handle conflict in a team?',
    placeholder: 'e.g., I try to mediate and find common ground...',
    type: 'textarea',
  },
  {
    key: 'surveyOrganized',
    label: 'On a scale from 1\u20135, how organized are you?',
    placeholder: 'e.g., 4',
    type: 'input',
  },
  {
    key: 'surveySpeakingUp',
    label: 'On a scale from 1\u20135, how comfortable are you speaking up in group discussions?',
    placeholder: 'e.g., 3',
    type: 'input',
  },
  {
    key: 'surveySkills',
    label: 'What are your top 5 technical or functional skills?',
    placeholder: 'e.g., Python, project management, data analysis...',
    type: 'textarea',
  },
  {
    key: 'surveyFrustrations',
    label: 'When working in a team, what frustrates you the most?',
    placeholder: 'e.g., Lack of communication, unclear expectations...',
    type: 'textarea',
  },
];

export function ProfileForm() {
  const { currentUser, updateProfile, analyzePersonality, isLoading } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const existingSurvey = (currentUser?.surveyData || {}) as SurveyData;

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      surveyGroupRole: existingSurvey.groupRole || '',
      surveyDecisionMaking: existingSurvey.decisionMaking || '',
      surveyDeadline: existingSurvey.deadline || '',
      surveyConflict: existingSurvey.conflict || '',
      surveyOrganized: existingSurvey.organized || '',
      surveySpeakingUp: existingSurvey.speakingUp || '',
      surveySkills: existingSurvey.skills || '',
      surveyFrustrations: existingSurvey.frustrations || '',
    },
  });

  async function onSubmit(data: ProfileFormData) {
    try {
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      if (resumeFile) formData.append('resume', resumeFile);
      if (audioFile) formData.append('audio', audioFile);

      // Build structured survey data
      const surveyData: SurveyData = {
        groupRole: data.surveyGroupRole || '',
        decisionMaking: data.surveyDecisionMaking || '',
        deadline: data.surveyDeadline || '',
        conflict: data.surveyConflict || '',
        organized: data.surveyOrganized || '',
        speakingUp: data.surveySpeakingUp || '',
        skills: data.surveySkills || '',
        frustrations: data.surveyFrustrations || '',
      };
      formData.append('surveyData', JSON.stringify(surveyData));

      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    }
  }

  async function handleAnalyze() {
    setIsAnalyzing(true);
    try {
      setError('');
      await analyzePersonality();
      setSuccess('Personality analysis complete!');
    } catch (err) {
      setError('Failed to analyze personality. Please try again.');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const personalityData = currentUser?.personalityStability && currentUser.personalityStability.score > 0
    ? currentUser.personalityStability
    : null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Provide information about yourself so we can match you with the perfect team
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 flex gap-3">
          <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700 dark:text-green-200">{success}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Basic Information</CardTitle>
              <CardDescription>Tell us about yourself</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john@example.com"
                            type="email"
                            disabled={isLoading}
                            className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Survey Questions */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Self-Assessment</p>
                    {SURVEY_QUESTIONS.map((q) => (
                      <FormField
                        key={q.key}
                        control={form.control}
                        name={q.key}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-700 dark:text-gray-300 text-xs">{q.label}</FormLabel>
                            <FormControl>
                              {q.type === 'textarea' ? (
                                <Textarea
                                  placeholder={q.placeholder}
                                  disabled={isLoading}
                                  rows={2}
                                  className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-700 resize-none text-sm"
                                  {...field}
                                />
                              ) : (
                                <Input
                                  placeholder={q.placeholder}
                                  disabled={isLoading}
                                  className="bg-gray-50 dark:bg-slate-900 border-gray-300 dark:border-slate-700 text-sm"
                                  {...field}
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* File Uploads */}
          <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <CardHeader>
              <CardTitle className="text-sm text-gray-900 dark:text-white">Assessment Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                onClick={() => resumeInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Resume</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {resumeFile ? resumeFile.name : 'Click to upload'}
                  </p>
                </div>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
              </div>
              <div
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                onClick={() => audioInputRef.current?.click()}
              >
                <Mic className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Voice Note</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {audioFile ? audioFile.name : 'Click to upload'}
                  </p>
                </div>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.webm,.ogg"
                  className="hidden"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || isLoading || !currentUser?.profileComplete}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {isAnalyzing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Personality'}
          </Button>
        </div>

        {/* Personality Stability Section */}
        <div className="md:col-span-2">
          {personalityData ? (
            <PersonalityStabilitySection data={personalityData} />
          ) : (
            <Card className="border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  Complete your profile and click &quot;Analyze Personality&quot; to see your stability assessment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
