'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

const CATEGORIES = [
  'Profile',
  'Education',
  'Skills',
  'Projects',
  'Experience',
  'Achievements',
  'Certifications',
  'Links'
];

interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  isDynamic: boolean;
  check?: (data: any) => boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // Profile
  { id: 'prof-name', category: 'Profile', text: 'Full Name configured on Profile', isDynamic: true, check: (d) => !!d.name?.trim() },
  { id: 'prof-email', category: 'Profile', text: 'Professional email is set', isDynamic: true, check: (d) => !!d.email?.trim() },
  { id: 'prof-role', category: 'Profile', text: 'Target career job role selected', isDynamic: true, check: (d) => !!d.targetRole?.trim() },
  // Education
  { id: 'edu-college', category: 'Education', text: 'College / University listed', isDynamic: true, check: (d) => !!d.college?.trim() },
  { id: 'edu-branch', category: 'Education', text: 'Branch / Discipline listed', isDynamic: true, check: (d) => !!d.branch?.trim() },
  { id: 'edu-year', category: 'Education', text: 'Graduation year set', isDynamic: true, check: (d) => !!d.graduationYear },
  { id: 'edu-cgpa', category: 'Education', text: 'Academic CGPA added to profile', isDynamic: true, check: (d) => Number(d.cgpa) > 0 },
  // Skills
  { id: 'skills-count', category: 'Skills', text: 'At least 3 technical skills listed', isDynamic: true, check: (d) => (d.skills || []).length >= 3 },
  // Projects
  { id: 'proj-count', category: 'Projects', text: 'At least 2 technical projects added', isDynamic: true, check: (d) => (d.projects || []).length >= 2 },
  { id: 'proj-desc', category: 'Projects', text: 'Descriptions added to all projects', isDynamic: true, check: (d) => (d.projects || []).length > 0 && (d.projects || []).every((p: any) => !!p.description?.trim() && p.description.trim().length > 5) },
  // Experience
  { id: 'exp-added', category: 'Experience', text: 'Internship or volunteer experience added', isDynamic: false },
  { id: 'exp-verbs', category: 'Experience', text: 'Bullet points start with strong action verbs', isDynamic: false },
  { id: 'exp-quantified', category: 'Experience', text: 'Accomplishments are quantified (e.g. percentages)', isDynamic: false },
  // Achievements
  { id: 'ach-contest', category: 'Achievements', text: 'Co-curricular achievements / coding contests listed', isDynamic: false },
  { id: 'ach-hackathon', category: 'Achievements', text: 'Hackathon positions or project awards detailed', isDynamic: false },
  // Certifications
  { id: 'cert-count', category: 'Certifications', text: 'At least 1 industry certification listed', isDynamic: true, check: (d) => (d.certifications || []).length >= 1 },
  // Links
  { id: 'links-linkedin', category: 'Links', text: 'LinkedIn profile link added', isDynamic: false },
  { id: 'links-github', category: 'Links', text: 'GitHub profile link added', isDynamic: false },
  { id: 'links-portfolio', category: 'Links', text: 'Portfolio / Personal site link added', isDynamic: false }
];

export default function ResumeChecklistPage() {
  const [data, setData] = useState<any>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Floating Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null,
  });

  // Auto-dismiss toast
  useEffect(() => {
    if (toast.type) {
      const timer = setTimeout(() => {
        setToast({ message: '', type: null });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // Fetch checklist state & user profile
  const fetchChecklistData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/resume-checklist');
      if (!res.ok) throw new Error('Failed to load resume checklist');
      const doc = await res.json();
      setData(doc);
      setCheckedItems(doc.checkedItems || []);
    } catch (err: any) {
      showToast(err.message || 'Error loading checklist data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklistData();
  }, []);

  // Update checkbox state
  const handleToggleCheckbox = async (itemId: string) => {
    setIsUpdating(true);
    let nextChecked = [...checkedItems];
    if (nextChecked.includes(itemId)) {
      nextChecked = nextChecked.filter((id) => id !== itemId);
    } else {
      nextChecked.push(itemId);
    }

    // Pessimistic update UI locally
    setCheckedItems(nextChecked);

    try {
      const res = await fetch('/api/resume-checklist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkedItems: nextChecked }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save changes');
      }

      showToast('Checklist state saved to database', 'success');
    } catch (err: any) {
      showToast(err.message || 'Error saving changes', 'error');
      // Revert checked state
      setCheckedItems(checkedItems);
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine if item is completed
  const isItemCompleted = (item: ChecklistItem) => {
    if (item.isDynamic) {
      return data ? !!item.check?.(data) : false;
    }
    return checkedItems.includes(item.id);
  };

  // Stats calculation
  const totalItemsCount = CHECKLIST_ITEMS.length;
  const completedItemsCount = CHECKLIST_ITEMS.filter((item) => isItemCompleted(item)).length;
  const completionPercent = totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  // Group items by Category
  const getItemsByCategory = (category: string) => {
    return CHECKLIST_ITEMS.filter((item) => item.category === category);
  };

  // Check if a category is fully complete
  const isCategoryComplete = (category: string) => {
    const categoryItems = getItemsByCategory(category);
    return categoryItems.every((item) => isItemCompleted(item));
  };

  // Identify missing categories
  const missingCategories = CATEGORIES.filter((cat) => !isCategoryComplete(cat));

  // Circular progress dimensions
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  return (
    <div className="flex-1 bg-slate-950 p-6 md:p-12 relative overflow-hidden animate-slide-up">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-violet-600/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-indigo-600/5 blur-3xl" />

      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent flex items-center gap-3">
              <FileText className="h-10 w-10 text-indigo-400" />
              Resume Checklist Module
            </h1>
            <p className="text-slate-400 mt-1">
              Analyze your resume completion score and track placement standards in real time.
            </p>
          </div>
          <Link href="/dashboard/profile">
            <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white cursor-pointer shadow-lg shadow-indigo-600/20 hover:from-violet-500 hover:to-indigo-500 transition-all font-semibold flex items-center gap-2">
              Edit Career Profile
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Circular Progress & Missing Categories Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Dial Card */}
          <Card className="md:col-span-1 glass-panel p-6 flex flex-col items-center justify-center text-center">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                Resume Index
              </CardTitle>
            </CardHeader>
            <div className="relative flex items-center justify-center my-6">
              {/* Glowing gradient background */}
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-xl animate-pulse" />
              
              {/* Circular Ring */}
              <svg className="w-40 h-40 transform -rotate-90 relative z-10">
                {/* Background circle */}
                <circle
                  className="text-slate-800"
                  strokeWidth={strokeWidth}
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="80"
                  cy="80"
                />
                {/* Foreground Progress */}
                <circle
                  className="text-indigo-500 transition-all duration-500 ease-out"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="url(#progressGradient)"
                  fill="transparent"
                  r={radius}
                  cx="80"
                  cy="80"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center Text */}
              <div className="absolute flex flex-col items-center justify-center relative z-20">
                <span className="text-3xl font-black text-white">{completionPercent}%</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Complete</span>
              </div>
            </div>
            <div className="text-xs font-semibold text-indigo-400 mt-2 px-3 py-1 rounded-full bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isUpdating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              {isUpdating ? 'Auto-saving changes...' : 'Checklist Synchronized'}
            </div>
          </Card>

          {/* Missing Categories list */}
          <Card className="md:col-span-2 glass-panel p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white border-b border-border/10 pb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-indigo-400" />
                Missing Resume Categories
              </h3>

              <div className="mt-4 space-y-3">
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-10 w-full bg-slate-950/60 rounded-xl skeleton-pulse" />
                    <div className="h-10 w-full bg-slate-950/60 rounded-xl skeleton-pulse" />
                  </div>
                ) : missingCategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {missingCategories.map((cat) => (
                      <div
                        key={cat}
                        className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-xs text-slate-300 font-medium"
                      >
                        <span className="flex items-center gap-2 text-rose-300">
                          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                          {cat} Section
                        </span>
                        <span className="text-[10px] text-slate-500 italic">Incomplete</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-xs text-emerald-400 font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    All resume categories verified! Your portfolio is placement-ready.
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed pt-4 border-t border-border/5 mt-4">
              * Dynamic categories update automatically when you modify your professional SkillBridge profile. Manual sections can be checked off below.
            </p>
          </Card>

        </div>

        {/* Categories checklist grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CATEGORIES.map((cat) => {
            const items = getItemsByCategory(cat);
            const isComplete = isCategoryComplete(cat);

            return (
              <Card
                key={cat}
                className={`glass-panel p-6 flex flex-col justify-between transition-all duration-300 ${
                  isComplete ? 'border-emerald-500/10 shadow-[0_4px_20px_-10px_rgba(16,185,129,0.02)]' : ''
                }`}
              >
                <div className="space-y-4">
                  
                  {/* Category Card Header */}
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ChevronRight className="h-4.5 w-4.5 text-indigo-400" />
                      {cat} Standards
                    </h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      isComplete
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                        : 'bg-slate-900 text-slate-500 border border-transparent'
                    }`}>
                      {isComplete ? 'VERIFIED' : 'INCOMPLETE'}
                    </span>
                  </div>

                  {/* Checklist Items list */}
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="space-y-2">
                        <div className="h-6 w-full bg-slate-950/60 rounded-md skeleton-pulse" />
                        <div className="h-6 w-full bg-slate-950/60 rounded-md skeleton-pulse" />
                      </div>
                    ) : (
                      items.map((item) => {
                        const completed = isItemCompleted(item);

                        return (
                          <div
                            key={item.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-xs leading-relaxed transition-all ${
                              completed
                                ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-300'
                                : 'bg-slate-950/50 border-border/10 text-slate-400'
                            }`}
                          >
                            
                            {/* Action selector (Checkbox or Dynamic indicator) */}
                            {item.isDynamic ? (
                              <div className="mt-0.5">
                                {completed ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                                ) : (
                                  <AlertCircle className="h-4.5 w-4.5 text-slate-600 shrink-0" />
                                )}
                              </div>
                            ) : (
                              <input
                                type="checkbox"
                                checked={completed}
                                onChange={() => handleToggleCheckbox(item.id)}
                                className="mt-1 h-4 w-4 rounded-sm border-border/30 bg-slate-900 accent-indigo-500 cursor-pointer shrink-0"
                              />
                            )}

                            {/* Label text */}
                            <div className="flex-1 flex flex-col gap-1">
                              <span className={completed ? 'text-slate-300' : 'text-slate-400 font-medium'}>
                                {item.text}
                              </span>
                              {item.isDynamic && !completed && (
                                <Link
                                  href="/dashboard/profile"
                                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-0.5 hover:underline"
                                >
                                  Update Profile details
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </Link>
                              )}
                              {item.isDynamic && (
                                <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">
                                  Auto-evaluated
                                </span>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                </div>
              </Card>
            );
          })}
        </div>

      </div>

      {/* FLOATING TOASTS */}
      {toast.type && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border shadow-2xl animate-slide-up ${
          toast.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
        } backdrop-blur-md`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
