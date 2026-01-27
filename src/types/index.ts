// =============================================
// Lead Skylab - TypeScript Type Definitions
// =============================================

// Lead Management Types
export interface Lead {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  source: LeadSource;
  stage: LeadStage;
  score: number;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  customFields?: Record<string, string>;
}

export type LeadSource =
  | 'landing_page'
  | 'referral'
  | 'organic'
  | 'social'
  | 'email'
  | 'paid_ad'
  | 'direct'
  | 'other';

export type LeadStage =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'visit' | 'click' | 'form_submit' | 'email_open' | 'survey_complete' | 'note';
  description: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Landing Page Types
export interface LandingPage {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  template: LandingPageTemplate;
  sections: LandingPageSection[];
  settings: LandingPageSettings;
  analytics: LandingPageAnalytics;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type LandingPageTemplate =
  | 'hero_simple'
  | 'hero_split'
  | 'features_grid'
  | 'testimonials'
  | 'pricing'
  | 'custom';

export interface LandingPageSection {
  id: string;
  type: 'hero' | 'features' | 'benefits' | 'testimonials' | 'cta' | 'form' | 'faq' | 'custom';
  order: number;
  content: HeroContent | FeaturesContent | TestimonialsContent | CTAContent | FormContent;
  styles?: Record<string, string>;
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink?: string;
  image?: string;
  alignment: 'left' | 'center' | 'right';
}

export interface FeaturesContent {
  title: string;
  subtitle?: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface TestimonialsContent {
  title: string;
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
    company: string;
    avatar?: string;
  }>;
}

export interface CTAContent {
  headline: string;
  subheadline?: string;
  buttonText: string;
  buttonLink?: string;
}

export interface FormContent {
  title: string;
  subtitle?: string;
  fields: FormField[];
  submitText: string;
  successMessage: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
}

export interface LandingPageSettings {
  favicon?: string;
  ogImage?: string;
  metaTitle: string;
  metaDescription: string;
  customCss?: string;
  customJs?: string;
  trackingId?: string;
}

export interface LandingPageAnalytics {
  views: number;
  uniqueVisitors: number;
  formSubmissions: number;
  conversionRate: number;
  avgTimeOnPage: number;
  bounceRate: number;
}

// Experiment (A/B Testing) Types
export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  type: 'landing_page' | 'cta' | 'headline' | 'form' | 'email';
  targetId: string; // ID of the element being tested
  variants: ExperimentVariant[];
  trafficSplit: number[]; // Percentages for each variant
  metric: ExperimentMetric;
  startDate?: string;
  endDate?: string;
  winner?: string; // Variant ID
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description?: string;
  content: Record<string, unknown>;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

export type ExperimentMetric =
  | 'conversions'
  | 'clicks'
  | 'signups'
  | 'revenue'
  | 'time_on_page'
  | 'bounce_rate';

// Survey Types
export interface Survey {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'closed';
  type: 'nps' | 'csat' | 'pmf' | 'custom';
  questions: SurveyQuestion[];
  settings: SurveySettings;
  responses: SurveyResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
  id: string;
  type: 'nps' | 'rating' | 'multiple_choice' | 'single_choice' | 'open_ended' | 'scale';
  question: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  order: number;
}

export interface SurveySettings {
  showProgressBar: boolean;
  allowAnonymous: boolean;
  thankYouMessage: string;
  redirectUrl?: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  respondentId?: string;
  respondentEmail?: string;
  answers: SurveyAnswer[];
  completedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SurveyAnswer {
  questionId: string;
  value: string | number | string[];
}

// Audience Types
export interface Audience {
  id: string;
  name: string;
  description?: string;
  type: 'segment' | 'persona';
  criteria: AudienceCriteria[];
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface AudienceCriteria {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: string | number | string[];
}

export interface Persona {
  id: string;
  name: string;
  avatar?: string;
  description: string;
  demographics: {
    ageRange: string;
    location: string;
    industry: string;
    role: string;
  };
  painPoints: string[];
  goals: string[];
  channels: string[];
  quote: string;
}

// PMF Metrics Types
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
  retention: number[]; // Weekly retention percentages
}

export interface FunnelStage {
  name: string;
  count: number;
  percentage: number;
  dropoff: number;
}

// Dashboard Types
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

// Activity and Notification Types
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

// App State Types
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
  // Content Studio
  contentPieces: ContentPiece[];
  contentCampaigns: ContentCampaign[];
  productProfile: ProductProfile | null;
  contentTemplates: ContentTemplate[];
  // Launch Autopilot
  launchPlans: LaunchPlan[];
  contentQueue: ContentQueueItem[];
  launchTemplates: LaunchTemplate[];
}

// Content Studio Types
export type ContentPlatform =
  | 'twitter'
  | 'linkedin'
  | 'instagram'
  | 'tiktok'
  | 'reddit'
  | 'facebook'
  | 'email';

export type ContentStatus = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'rejected';

export type ContentTone = 'professional' | 'casual' | 'bold' | 'friendly' | 'witty' | 'informative';

export interface ContentPiece {
  id: string;
  title: string;
  content: string;
  platform: ContentPlatform;
  status: ContentStatus;
  tone: ContentTone;
  campaignId?: string;
  templateId?: string;
  hashtags: string[];
  scheduledAt?: string;
  publishedAt?: string;
  analytics?: ContentAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface ContentAnalytics {
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  leads: number;
}

export interface ContentCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'paused' | 'completed';
  platforms: ContentPlatform[];
  startDate?: string;
  endDate?: string;
  contentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductProfile {
  id: string;
  name: string;
  url?: string;
  description: string;
  valueProps: string[];
  targetAudience: string;
  keywords: string[];
  tone: ContentTone;
  competitors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'email' | 'ad' | 'blog';
  platform: ContentPlatform | 'all';
  template: string;
  variables: string[];
  example: string;
}

// =============================================
// Launch Autopilot Types
// =============================================

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
  // Content Strategy
  contentPillars: string[];
  keywords: string[];
  competitors: string[];
  uniqueSellingPoints: string[];

  // Voice & Tone (per platform)
  toneByPlatform: Record<ContentPlatform, ContentTone>;
  wordsToUse: string[];
  wordsToAvoid: string[];
  brandPersonality: string[];

  // Posting Cadence
  frequencyByPlatform: Record<ContentPlatform, number>;
  optimalPostingTimes: Record<ContentPlatform, string[]>;
  postOnWeekends: boolean;

  // Approval Workflow
  approvalMode: 'auto_publish' | 'daily_digest' | 'individual_review' | 'hybrid';
  autoApproveTypes: ContentPlatform[];

  // Platform Selection
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
  // Content Studio Actions
  | { type: 'ADD_CONTENT'; payload: ContentPiece }
  | { type: 'UPDATE_CONTENT'; payload: ContentPiece }
  | { type: 'DELETE_CONTENT'; payload: string }
  | { type: 'ADD_CAMPAIGN'; payload: ContentCampaign }
  | { type: 'UPDATE_CAMPAIGN'; payload: ContentCampaign }
  | { type: 'DELETE_CAMPAIGN'; payload: string }
  | { type: 'SET_PRODUCT_PROFILE'; payload: ProductProfile }
  // Launch Autopilot Actions
  | { type: 'ADD_LAUNCH_PLAN'; payload: LaunchPlan }
  | { type: 'UPDATE_LAUNCH_PLAN'; payload: LaunchPlan }
  | { type: 'DELETE_LAUNCH_PLAN'; payload: string }
  | { type: 'ADD_QUEUE_ITEM'; payload: ContentQueueItem }
  | { type: 'UPDATE_QUEUE_ITEM'; payload: ContentQueueItem }
  | { type: 'DELETE_QUEUE_ITEM'; payload: string }
  | { type: 'BULK_APPROVE_QUEUE'; payload: string[] }
  | { type: 'MOVE_CONTENT_TO_PHASE'; payload: { itemId: string; phaseType: LaunchPhaseType } };

