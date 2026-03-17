// App-wide Types (PMF Metrics, Dashboard, State, Actions, Activity)

import type { Lead } from './leads';
import type { LandingPage } from './landing-pages';
import type { Experiment } from './experiments';
import type { Survey, SurveyAnswer } from './surveys';
import type { Audience, Persona } from './audience';
import type { ContentPiece, ContentCampaign, ProductProfile, ContentTemplate } from './content';
import type { LaunchPlan, LaunchTemplate, ContentQueueItem, LaunchPhaseType } from './launch';

// Re-export SurveyAnswer for consumers that import from app
export type { SurveyAnswer };

// PMF Metrics
export interface PMFMetrics {
    overallScore: number;
    npsScore: number;
    npsRespondents: number;
    activationRate: number;
    retentionRate: number;
    churnRate: number;
    cltv: number;
    cac: number;
    mrr: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    referralRate: number;
    lastUpdated: string;
}

export interface RetentionCohort {
    cohortDate: string;
    totalUsers: number;
    retention: number[];
}

export interface FunnelStage {
    name: string;
    count: number;
    percentage: number;
    dropoff: number;
}

// Dashboard
export interface DashboardData {
    metrics: PMFMetrics;
    leadPipeline: FunnelStage[];
    retentionCohorts: RetentionCohort[];
    recentLeads: Lead[];
    activeExperiments: Experiment[];
    topSurveyInsights: SurveyInsight[];
}

export interface SurveyInsight {
    question: string;
    topAnswer: string;
    percentage: number;
    sentiment: 'positive' | 'neutral' | 'negative';
}

// Activity and Notification
export interface Activity {
    id: string;
    type: 'lead_created' | 'lead_converted' | 'experiment_completed' | 'survey_response' | 'page_published';
    title: string;
    description: string;
    entityId: string;
    entityType: string;
    timestamp: string;
}

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    read: boolean;
    timestamp: string;
    actionUrl?: string;
}

// App State
export interface AppState {
    leads: Lead[];
    landingPages: LandingPage[];
    experiments: Experiment[];
    surveys: Survey[];
    audiences: Audience[];
    personas: Persona[];
    metrics: PMFMetrics;
    activities: Activity[];
    notifications: Notification[];
    contentPieces: ContentPiece[];
    contentCampaigns: ContentCampaign[];
    productProfile: ProductProfile | null;
    contentTemplates: ContentTemplate[];
    launchPlans: LaunchPlan[];
    contentQueue: ContentQueueItem[];
    launchTemplates: LaunchTemplate[];
}

// Context Action Types
export type AppAction =
    | { type: 'ADD_LEAD'; payload: Lead }
    | { type: 'UPDATE_LEAD'; payload: Lead }
    | { type: 'DELETE_LEAD'; payload: string }
    | { type: 'ADD_LANDING_PAGE'; payload: LandingPage }
    | { type: 'UPDATE_LANDING_PAGE'; payload: LandingPage }
    | { type: 'DELETE_LANDING_PAGE'; payload: string }
    | { type: 'ADD_EXPERIMENT'; payload: Experiment }
    | { type: 'UPDATE_EXPERIMENT'; payload: Experiment }
    | { type: 'DELETE_EXPERIMENT'; payload: string }
    | { type: 'ADD_SURVEY'; payload: Survey }
    | { type: 'UPDATE_SURVEY'; payload: Survey }
    | { type: 'DELETE_SURVEY'; payload: string }
    | { type: 'ADD_AUDIENCE'; payload: Audience }
    | { type: 'UPDATE_AUDIENCE'; payload: Audience }
    | { type: 'DELETE_AUDIENCE'; payload: string }
    | { type: 'UPDATE_METRICS'; payload: Partial<PMFMetrics> }
    | { type: 'ADD_ACTIVITY'; payload: Activity }
    | { type: 'LOAD_STATE'; payload: AppState }
    | { type: 'RESET_STATE' }
    | { type: 'ADD_CONTENT'; payload: ContentPiece }
    | { type: 'UPDATE_CONTENT'; payload: ContentPiece }
    | { type: 'DELETE_CONTENT'; payload: string }
    | { type: 'ADD_CAMPAIGN'; payload: ContentCampaign }
    | { type: 'UPDATE_CAMPAIGN'; payload: ContentCampaign }
    | { type: 'DELETE_CAMPAIGN'; payload: string }
    | { type: 'SET_PRODUCT_PROFILE'; payload: ProductProfile }
    | { type: 'ADD_LAUNCH_PLAN'; payload: LaunchPlan }
    | { type: 'UPDATE_LAUNCH_PLAN'; payload: LaunchPlan }
    | { type: 'DELETE_LAUNCH_PLAN'; payload: string }
    | { type: 'ADD_QUEUE_ITEM'; payload: ContentQueueItem }
    | { type: 'UPDATE_QUEUE_ITEM'; payload: ContentQueueItem }
    | { type: 'DELETE_QUEUE_ITEM'; payload: string }
    | { type: 'BULK_APPROVE_QUEUE'; payload: string[] }
    | { type: 'MOVE_CONTENT_TO_PHASE'; payload: { itemId: string; phaseType: LaunchPhaseType } };
