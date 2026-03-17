// Launch Autopilot Types

import type { ContentPlatform, ContentTone, ContentPiece } from './content';

export type LaunchPhaseType = 'pre_launch' | 'launch_day' | 'growth' | 'complete';

export type PlanInputMode = 'import' | 'ai_analyze' | 'manual';

export interface LaunchPlan {
    id: string;
    name: string;
    description?: string;
    productName: string;
    productUrl?: string;
    status: 'draft' | 'active' | 'paused' | 'completed';
    inputMode: PlanInputMode;
    phases: LaunchPhase[];
    preferences: OwnerPreferences;
    startDate: string;
    launchDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface LaunchPhase {
    id: string;
    type: LaunchPhaseType;
    name: string;
    description?: string;
    startDate: string;
    endDate: string;
    milestones: LaunchMilestone[];
    contentItems: ContentQueueItem[];
    status: 'pending' | 'active' | 'completed';
}

export interface LaunchMilestone {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    completed: boolean;
    contentGoal?: number;
}

export interface OwnerPreferences {
    contentPillars: string[];
    keywords: string[];
    competitors: string[];
    uniqueSellingPoints: string[];
    toneByPlatform: Record<ContentPlatform, ContentTone>;
    wordsToUse: string[];
    wordsToAvoid: string[];
    brandPersonality: string[];
    frequencyByPlatform: Record<ContentPlatform, number>;
    optimalPostingTimes: Record<ContentPlatform, string[]>;
    postOnWeekends: boolean;
    approvalMode: 'auto_publish' | 'daily_digest' | 'individual_review' | 'hybrid';
    autoApproveTypes: ContentPlatform[];
    enabledPlatforms: ContentPlatform[];
}

export interface ContentQueueItem {
    id: string;
    planId: string;
    phaseId: string;
    content: ContentPiece;
    scheduledDate: string;
    scheduledTime: string;
    status: 'queued' | 'approved' | 'published' | 'rejected' | 'failed';
    approvedAt?: string;
    publishedAt?: string;
    error?: string;
}

export interface LaunchTemplate {
    id: string;
    name: string;
    description: string;
    category: 'saas' | 'product_hunt' | 'indie_hacker' | 'enterprise' | 'ecommerce';
    defaultPhases: LaunchPhaseTemplate[];
    defaultPreferences: Partial<OwnerPreferences>;
    estimatedDuration: number;
}

export interface LaunchPhaseTemplate {
    type: LaunchPhaseType;
    name: string;
    description: string;
    durationDays: number;
    suggestedMilestones: string[];
}

export const getDefaultPreferences = (): OwnerPreferences => ({
    contentPillars: [],
    keywords: [],
    competitors: [],
    uniqueSellingPoints: [],
    toneByPlatform: {
        twitter: 'witty',
        linkedin: 'professional',
        instagram: 'casual',
        tiktok: 'bold',
        reddit: 'casual',
        facebook: 'friendly',
        email: 'professional',
    },
    wordsToUse: [],
    wordsToAvoid: [],
    brandPersonality: [],
    frequencyByPlatform: {
        twitter: 3,
        linkedin: 1,
        instagram: 1,
        tiktok: 1,
        reddit: 1,
        facebook: 1,
        email: 0,
    },
    optimalPostingTimes: {
        twitter: ['09:00', '12:00', '18:00'],
        linkedin: ['08:00', '12:00'],
        instagram: ['11:00', '19:00'],
        tiktok: ['19:00', '21:00'],
        reddit: ['10:00', '14:00'],
        facebook: ['09:00', '15:00'],
        email: ['10:00'],
    },
    postOnWeekends: false,
    approvalMode: 'daily_digest',
    autoApproveTypes: [],
    enabledPlatforms: ['twitter', 'linkedin'],
});
