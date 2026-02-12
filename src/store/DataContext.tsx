import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSupabaseSync } from './useSupabaseSync';
import type {
    AppState,
    AppAction,
    Lead,
    LandingPage,
    Experiment,
    Survey,
    Audience,
    PMFMetrics,
    Activity,
    ContentTemplate,
    LaunchTemplate,
} from '../types';

// Initial PMF Metrics with demo data
const initialMetrics: PMFMetrics = {
    overallScore: 67,
    npsScore: 42,
    npsRespondents: 156,
    activationRate: 34,
    retentionRate: 45,
    churnRate: 8.5,
    cltv: 2400,
    cac: 320,
    mrr: 48500,
    weeklyActiveUsers: 1240,
    monthlyActiveUsers: 3800,
    referralRate: 18,
    lastUpdated: new Date().toISOString(),
};

// Demo leads for initial state
const demoLeads: Lead[] = [
    {
        id: uuidv4(),
        email: 'john.smith@techcorp.com',
        name: 'John Smith',
        company: 'TechCorp Inc',
        phone: '+1 555-0123',
        source: 'landing_page',
        stage: 'qualified',
        score: 85,
        tags: ['enterprise', 'decision-maker'],
        notes: 'Very interested in the product. Scheduled demo for next week.',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        email: 'sarah.johnson@startup.io',
        name: 'Sarah Johnson',
        company: 'Startup.io',
        source: 'referral',
        stage: 'contacted',
        score: 72,
        tags: ['startup', 'early-adopter'],
        notes: 'Referred by existing customer. Looking for PMF tools.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: uuidv4(),
        email: 'mike.wilson@agency.co',
        name: 'Mike Wilson',
        company: 'Digital Agency Co',
        source: 'organic',
        stage: 'new',
        score: 45,
        tags: ['agency'],
        notes: '',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: uuidv4(),
        email: 'emma.davis@fundedco.com',
        name: 'Emma Davis',
        company: 'FundedCo',
        phone: '+1 555-0456',
        source: 'paid_ad',
        stage: 'proposal',
        score: 92,
        tags: ['funded', 'hot-lead', 'enterprise'],
        notes: 'Series B startup. Ready to buy. Send proposal ASAP.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        email: 'alex.chen@innovate.tech',
        name: 'Alex Chen',
        company: 'Innovate Tech',
        source: 'social',
        stage: 'new',
        score: 38,
        tags: ['tech'],
        notes: 'Downloaded whitepaper from LinkedIn campaign.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
    },
];

// Demo landing pages
const demoLandingPages: LandingPage[] = [
    {
        id: uuidv4(),
        title: 'Product Launch - Main',
        slug: 'product-launch',
        status: 'published',
        template: 'hero_simple',
        sections: [
            {
                id: uuidv4(),
                type: 'hero',
                order: 0,
                content: {
                    headline: 'Ship Your MVP with Confidence',
                    subheadline: 'Validate product-market fit faster with automated lead generation and real-time feedback.',
                    ctaText: 'Get Started Free',
                    ctaLink: '#signup',
                    alignment: 'center',
                },
            },
            {
                id: uuidv4(),
                type: 'form',
                order: 1,
                content: {
                    title: 'Start Your Free Trial',
                    subtitle: 'No credit card required',
                    fields: [
                        { id: '1', type: 'text', label: 'Full Name', required: true },
                        { id: '2', type: 'email', label: 'Work Email', required: true },
                        { id: '3', type: 'text', label: 'Company', required: false },
                    ],
                    submitText: 'Start Free Trial',
                    successMessage: 'Thanks! Check your email to get started.',
                },
            },
        ],
        settings: {
            metaTitle: 'Lead Skylab - Ship Your MVP with Confidence',
            metaDescription: 'Validate product-market fit faster with automated lead generation.',
        },
        analytics: {
            views: 2840,
            uniqueVisitors: 2156,
            formSubmissions: 342,
            conversionRate: 15.9,
            avgTimeOnPage: 125,
            bounceRate: 42,
        },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: uuidv4(),
        title: 'Early Access Waitlist',
        slug: 'early-access',
        status: 'published',
        template: 'hero_split',
        sections: [
            {
                id: uuidv4(),
                type: 'hero',
                order: 0,
                content: {
                    headline: 'Be First to Experience the Future',
                    subheadline: 'Join our exclusive early access program and shape the product.',
                    ctaText: 'Join Waitlist',
                    alignment: 'left',
                },
            },
        ],
        settings: {
            metaTitle: 'Early Access - Lead Skylab',
            metaDescription: 'Join our exclusive early access program.',
        },
        analytics: {
            views: 1560,
            uniqueVisitors: 1234,
            formSubmissions: 890,
            conversionRate: 72.1,
            avgTimeOnPage: 45,
            bounceRate: 18,
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Demo experiments
const demoExperiments: Experiment[] = [
    {
        id: uuidv4(),
        name: 'Hero Headline A/B Test',
        description: 'Testing different value propositions in the hero section',
        status: 'running',
        type: 'headline',
        targetId: demoLandingPages[0].id,
        variants: [
            {
                id: 'a',
                name: 'Variant A - Ship with Confidence',
                content: { headline: 'Ship Your MVP with Confidence' },
                impressions: 1420,
                conversions: 176,
                conversionRate: 12.4,
            },
            {
                id: 'b',
                name: 'Variant B - Validate Faster',
                content: { headline: 'Validate Product-Market Fit 10x Faster' },
                impressions: 1420,
                conversions: 117,
                conversionRate: 8.2,
            },
        ],
        trafficSplit: [50, 50],
        metric: 'conversions',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: 'CTA Button Color Test',
        description: 'Testing purple vs teal CTA button',
        status: 'completed',
        type: 'cta',
        targetId: demoLandingPages[0].id,
        variants: [
            {
                id: 'a',
                name: 'Purple Button',
                content: { color: '#6366f1' },
                impressions: 2000,
                conversions: 280,
                conversionRate: 14.0,
            },
            {
                id: 'b',
                name: 'Teal Button',
                content: { color: '#14b8a6' },
                impressions: 2000,
                conversions: 340,
                conversionRate: 17.0,
            },
        ],
        trafficSplit: [50, 50],
        metric: 'clicks',
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        winner: 'b',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Demo surveys
const demoSurveys: Survey[] = [
    {
        id: uuidv4(),
        title: 'PMF Survey - Q1 2026',
        description: 'Quarterly product-market fit assessment',
        status: 'active',
        type: 'pmf',
        questions: [
            {
                id: '1',
                type: 'nps',
                question: 'How likely are you to recommend our product to a friend or colleague?',
                required: true,
                min: 0,
                max: 10,
                order: 0,
            },
            {
                id: '2',
                type: 'single_choice',
                question: 'How would you feel if you could no longer use our product?',
                required: true,
                options: ['Very disappointed', 'Somewhat disappointed', 'Not disappointed'],
                order: 1,
            },
            {
                id: '3',
                type: 'open_ended',
                question: 'What is the main benefit you receive from our product?',
                required: false,
                order: 2,
            },
        ],
        settings: {
            showProgressBar: true,
            allowAnonymous: false,
            thankYouMessage: 'Thank you for your feedback! It helps us improve.',
        },
        responses: [
            {
                id: uuidv4(),
                surveyId: '',
                respondentEmail: 'john@example.com',
                answers: [
                    { questionId: '1', value: 9 },
                    { questionId: '2', value: 'Very disappointed' },
                    { questionId: '3', value: 'Saves me hours of manual work every week' },
                ],
                completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// Demo audiences
const demoAudiences: Audience[] = [
    {
        id: uuidv4(),
        name: 'Hot Leads',
        description: 'Leads with score > 80 ready for sales outreach',
        type: 'segment',
        criteria: [
            { field: 'score', operator: 'greater_than', value: 80 },
        ],
        size: 45,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: 'Enterprise Prospects',
        description: 'Leads from enterprise companies',
        type: 'segment',
        criteria: [
            { field: 'tags', operator: 'contains', value: 'enterprise' },
        ],
        size: 128,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: 'Inactive Users',
        description: 'Users who haven\'t engaged in 30+ days',
        type: 'segment',
        criteria: [
            { field: 'lastActivityAt', operator: 'less_than', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        size: 234,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// Demo activities
const demoActivities: Activity[] = [
    {
        id: uuidv4(),
        type: 'lead_created',
        title: 'New Lead Captured',
        description: 'Alex Chen signed up from LinkedIn campaign',
        entityId: demoLeads[4].id,
        entityType: 'lead',
        timestamp: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        type: 'experiment_completed',
        title: 'Experiment Completed',
        description: 'CTA Button Color Test finished - Teal won with 17% CTR',
        entityId: demoExperiments[1].id,
        entityType: 'experiment',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: uuidv4(),
        type: 'survey_response',
        title: 'Survey Response',
        description: 'New PMF survey response received - NPS: 9',
        entityId: demoSurveys[0].id,
        entityType: 'survey',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: uuidv4(),
        type: 'lead_converted',
        title: 'Lead Converted',
        description: 'Emma Davis moved to Proposal stage',
        entityId: demoLeads[3].id,
        entityType: 'lead',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Demo content templates
const demoTemplates: ContentTemplate[] = [
    {
        id: '1',
        name: 'Product Launch Tweet',
        description: 'Announce your product launch on Twitter',
        category: 'social',
        platform: 'twitter',
        template: '🚀 Excited to announce {product_name}!\n\n{value_prop}\n\n{cta}\n\n{hashtags}',
        variables: ['product_name', 'value_prop', 'cta', 'hashtags'],
        example: '🚀 Excited to announce Lead Skylab!\n\nValidate your product-market fit 10x faster with AI-powered lead generation.\n\nTry it free → leadskylab.com\n\n#startup #saas #pmf',
    },
    {
        id: '2',
        name: 'LinkedIn Thought Leadership',
        description: 'Share insights and build authority',
        category: 'social',
        platform: 'linkedin',
        template: '{hook}\n\nHere\'s what I learned:\n\n{points}\n\n{conclusion}\n\n{cta}',
        variables: ['hook', 'points', 'conclusion', 'cta'],
        example: 'Most startups fail because they build what they think users want.\n\nHere\'s what I learned:\n\n1. Talk to 100 users before writing code\n2. Measure PMF weekly\n3. Pivot fast when data says so\n\nThe best product is the one people actually need.\n\nWhat\'s your approach to validation?',
    },
    {
        id: '3',
        name: 'Welcome Email',
        description: 'Welcome new subscribers or users',
        category: 'email',
        platform: 'email',
        template: 'Subject: Welcome to {product_name}! 🎉\n\nHey {first_name},\n\n{welcome_message}\n\n{next_steps}\n\nBest,\n{sender_name}',
        variables: ['product_name', 'first_name', 'welcome_message', 'next_steps', 'sender_name'],
        example: 'Subject: Welcome to Lead Skylab! 🎉\n\nHey Sarah,\n\nThanks for signing up! You\'re now part of a community of founders who take PMF seriously.\n\nHere\'s how to get started:\n1. Connect your landing page\n2. Set up your first experiment\n3. Create a PMF survey\n\nBest,\nThe Lead Skylab Team',
    },
    {
        id: '4',
        name: 'TikTok Hook',
        description: 'Attention-grabbing TikTok video scripts',
        category: 'social',
        platform: 'tiktok',
        template: 'HOOK: {hook}\n\nBODY: {body}\n\nCTA: {cta}\n\nHASHTAGS: {hashtags}',
        variables: ['hook', 'body', 'cta', 'hashtags'],
        example: 'HOOK: Stop building features nobody wants\n\nBODY: Here\'s the 3-step PMF framework that saved my startup...\n\nCTA: Follow for more founder tips\n\nHASHTAGS: #startup #founder #pmf #tech',
    },
    {
        id: '5',
        name: 'Reddit Thread',
        description: 'Engaging Reddit post for community discussion',
        category: 'social',
        platform: 'reddit',
        template: 'Title: {title}\n\n{body}\n\n{question}',
        variables: ['title', 'body', 'question'],
        example: 'Title: How we went from 0 to 100 paying customers in 60 days\n\nWe launched our SaaS 2 months ago. Here\'s exactly what worked:\n\n1. Cold outreach on LinkedIn (30% of customers)\n2. Reddit/Twitter content (25%)\n3. Referrals (45%)\n\nThe key was validating PMF before scaling.\n\nWhat channels worked best for your first 100 customers?',
    },
];

// Demo launch templates
const demoLaunchTemplates: LaunchTemplate[] = [
    {
        id: '1',
        name: 'SaaS Product Launch',
        description: 'Perfect for software products launching to market',
        category: 'saas',
        defaultPhases: [
            { type: 'pre_launch', name: 'Pre-Launch', description: 'Build anticipation and waitlist', durationDays: 14, suggestedMilestones: ['Teaser campaign', 'Waitlist landing page', 'Influencer outreach'] },
            { type: 'launch_day', name: 'Launch Day', description: 'Maximum visibility push', durationDays: 3, suggestedMilestones: ['Announcement posts', 'Email blast', 'PR release'] },
            { type: 'growth', name: 'Growth Phase', description: 'Sustain momentum and convert', durationDays: 30, suggestedMilestones: ['User testimonials', 'Case studies', 'Feature highlights'] },
        ],
        defaultPreferences: { enabledPlatforms: ['twitter', 'linkedin', 'email'] },
        estimatedDuration: 47,
    },
    {
        id: '2',
        name: 'Product Hunt Launch',
        description: 'Optimized for Product Hunt launches with build-up strategy',
        category: 'product_hunt',
        defaultPhases: [
            { type: 'pre_launch', name: 'Pre-Hunt', description: 'Build community before hunt', durationDays: 7, suggestedMilestones: ['Coming soon page', 'Hunter outreach', 'Community engagement'] },
            { type: 'launch_day', name: 'Hunt Day', description: 'All-out push on PH', durationDays: 1, suggestedMilestones: ['Launch tweet', 'Community alerts', 'Respond to comments'] },
            { type: 'growth', name: 'Post-Hunt', description: 'Capitalize on traffic', durationDays: 14, suggestedMilestones: ['Thank you campaign', 'Convert traffic', 'Badge display'] },
        ],
        defaultPreferences: { enabledPlatforms: ['twitter', 'linkedin'] },
        estimatedDuration: 22,
    },
    {
        id: '3',
        name: 'Indie Hacker Build in Public',
        description: 'Gradual launch with transparent journey sharing',
        category: 'indie_hacker',
        defaultPhases: [
            { type: 'pre_launch', name: 'Build in Public', description: 'Share your journey', durationDays: 21, suggestedMilestones: ['Weekly updates', 'Behind the scenes', 'Problem validation'] },
            { type: 'launch_day', name: 'Soft Launch', description: 'First users onboarded', durationDays: 7, suggestedMilestones: ['Beta invites', 'Feedback collection', 'Quick wins'] },
            { type: 'growth', name: 'Scale', description: 'Grow based on learnings', durationDays: 30, suggestedMilestones: ['Feature iterations', 'User stories', 'Revenue milestones'] },
        ],
        defaultPreferences: { enabledPlatforms: ['twitter', 'reddit'] },
        estimatedDuration: 58,
    },
    {
        id: '4',
        name: 'Enterprise B2B Launch',
        description: 'Professional launch for B2B enterprise products',
        category: 'enterprise',
        defaultPhases: [
            { type: 'pre_launch', name: 'Awareness', description: 'Educate the market', durationDays: 30, suggestedMilestones: ['Thought leadership', 'Webinar series', 'White papers'] },
            { type: 'launch_day', name: 'Launch Event', description: 'Official announcement', durationDays: 7, suggestedMilestones: ['Press release', 'Demo videos', 'Partner announcements'] },
            { type: 'growth', name: 'Pipeline Building', description: 'Generate qualified leads', durationDays: 60, suggestedMilestones: ['Case studies', 'ROI calculators', 'Enterprise demos'] },
        ],
        defaultPreferences: { enabledPlatforms: ['linkedin', 'email'] },
        estimatedDuration: 97,
    },
    {
        id: '5',
        name: 'E-commerce Product Drop',
        description: 'Create hype and urgency for product drops',
        category: 'ecommerce',
        defaultPhases: [
            { type: 'pre_launch', name: 'Tease', description: 'Build anticipation', durationDays: 7, suggestedMilestones: ['Sneak peeks', 'Countdown', 'Early access signup'] },
            { type: 'launch_day', name: 'Drop Day', description: 'Maximum urgency', durationDays: 1, suggestedMilestones: ['Launch announcement', 'Limited availability', 'Social proof'] },
            { type: 'growth', name: 'Sustain', description: 'Keep momentum', durationDays: 14, suggestedMilestones: ['Customer photos', 'Reviews campaign', 'Restock alerts'] },
        ],
        defaultPreferences: { enabledPlatforms: ['instagram', 'tiktok', 'email'] },
        estimatedDuration: 22,
    },
];

// Initial state
const initialState: AppState = {
    leads: demoLeads,
    landingPages: demoLandingPages,
    experiments: demoExperiments,
    surveys: demoSurveys,
    audiences: demoAudiences,
    personas: [],
    metrics: initialMetrics,
    activities: demoActivities,
    notifications: [],
    // Content Studio
    contentPieces: [],
    contentCampaigns: [],
    productProfile: null,
    contentTemplates: demoTemplates,
    // Launch Autopilot
    launchPlans: [],
    contentQueue: [],
    launchTemplates: demoLaunchTemplates,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'ADD_LEAD':
            return { ...state, leads: [...state.leads, action.payload] };
        case 'UPDATE_LEAD':
            return {
                ...state,
                leads: state.leads.map((lead) =>
                    lead.id === action.payload.id ? action.payload : lead
                ),
            };
        case 'DELETE_LEAD':
            return {
                ...state,
                leads: state.leads.filter((lead) => lead.id !== action.payload),
            };
        case 'ADD_LANDING_PAGE':
            return { ...state, landingPages: [...state.landingPages, action.payload] };
        case 'UPDATE_LANDING_PAGE':
            return {
                ...state,
                landingPages: state.landingPages.map((page) =>
                    page.id === action.payload.id ? action.payload : page
                ),
            };
        case 'DELETE_LANDING_PAGE':
            return {
                ...state,
                landingPages: state.landingPages.filter((page) => page.id !== action.payload),
            };
        case 'ADD_EXPERIMENT':
            return { ...state, experiments: [...state.experiments, action.payload] };
        case 'UPDATE_EXPERIMENT':
            return {
                ...state,
                experiments: state.experiments.map((exp) =>
                    exp.id === action.payload.id ? action.payload : exp
                ),
            };
        case 'DELETE_EXPERIMENT':
            return {
                ...state,
                experiments: state.experiments.filter((exp) => exp.id !== action.payload),
            };
        case 'ADD_SURVEY':
            return { ...state, surveys: [...state.surveys, action.payload] };
        case 'UPDATE_SURVEY':
            return {
                ...state,
                surveys: state.surveys.map((survey) =>
                    survey.id === action.payload.id ? action.payload : survey
                ),
            };
        case 'DELETE_SURVEY':
            return {
                ...state,
                surveys: state.surveys.filter((survey) => survey.id !== action.payload),
            };
        case 'ADD_AUDIENCE':
            return { ...state, audiences: [...state.audiences, action.payload] };
        case 'UPDATE_AUDIENCE':
            return {
                ...state,
                audiences: state.audiences.map((audience) =>
                    audience.id === action.payload.id ? action.payload : audience
                ),
            };
        case 'DELETE_AUDIENCE':
            return {
                ...state,
                audiences: state.audiences.filter((audience) => audience.id !== action.payload),
            };
        case 'UPDATE_METRICS':
            return {
                ...state,
                metrics: { ...state.metrics, ...action.payload, lastUpdated: new Date().toISOString() },
            };
        case 'ADD_ACTIVITY':
            return { ...state, activities: [action.payload, ...state.activities].slice(0, 50) };
        case 'LOAD_STATE':
            return action.payload;
        case 'RESET_STATE':
            return initialState;
        // Content Studio actions
        case 'ADD_CONTENT':
            return { ...state, contentPieces: [...state.contentPieces, action.payload] };
        case 'UPDATE_CONTENT':
            return {
                ...state,
                contentPieces: state.contentPieces.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                ),
            };
        case 'DELETE_CONTENT':
            return {
                ...state,
                contentPieces: state.contentPieces.filter((c) => c.id !== action.payload),
            };
        case 'ADD_CAMPAIGN':
            return { ...state, contentCampaigns: [...state.contentCampaigns, action.payload] };
        case 'UPDATE_CAMPAIGN':
            return {
                ...state,
                contentCampaigns: state.contentCampaigns.map((c) =>
                    c.id === action.payload.id ? action.payload : c
                ),
            };
        case 'DELETE_CAMPAIGN':
            return {
                ...state,
                contentCampaigns: state.contentCampaigns.filter((c) => c.id !== action.payload),
            };
        case 'SET_PRODUCT_PROFILE':
            return { ...state, productProfile: action.payload };
        // Launch Autopilot actions
        case 'ADD_LAUNCH_PLAN':
            return { ...state, launchPlans: [...state.launchPlans, action.payload] };
        case 'UPDATE_LAUNCH_PLAN':
            return {
                ...state,
                launchPlans: state.launchPlans.map((p) =>
                    p.id === action.payload.id ? action.payload : p
                ),
            };
        case 'DELETE_LAUNCH_PLAN':
            return {
                ...state,
                launchPlans: state.launchPlans.filter((p) => p.id !== action.payload),
                contentQueue: state.contentQueue.filter((q) => q.planId !== action.payload),
            };
        case 'ADD_QUEUE_ITEM':
            return { ...state, contentQueue: [...state.contentQueue, action.payload] };
        case 'UPDATE_QUEUE_ITEM':
            return {
                ...state,
                contentQueue: state.contentQueue.map((q) =>
                    q.id === action.payload.id ? action.payload : q
                ),
            };
        case 'DELETE_QUEUE_ITEM':
            return {
                ...state,
                contentQueue: state.contentQueue.filter((q) => q.id !== action.payload),
            };
        case 'BULK_APPROVE_QUEUE':
            return {
                ...state,
                contentQueue: state.contentQueue.map((q) =>
                    action.payload.includes(q.id)
                        ? { ...q, status: 'approved' as const, approvedAt: new Date().toISOString() }
                        : q
                ),
            };
        case 'MOVE_CONTENT_TO_PHASE':
            return {
                ...state,
                contentQueue: state.contentQueue.map((q) =>
                    q.id === action.payload.itemId
                        ? {
                            ...q,
                            phaseId: action.payload.phaseType,
                        }
                        : q
                ),
            };
        default:
            return state;
    }
}

// Context types
interface DataContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    // Helper functions
    calculateLeadScore: (lead: Partial<Lead>) => number;
    getLeadsByStage: (stage: string) => Lead[];
    getActiveExperiments: () => Experiment[];
    getPublishedPages: () => LandingPage[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'lead_skylab_state';

// Provider component
export function DataProvider({ children }: { children: ReactNode }) {
    const [state, baseDispatch] = useReducer(appReducer, initialState);
    const { syncAction, isOnline } = useSupabaseSync();

    // Wrapped dispatch that syncs to Supabase in background
    const dispatch = useCallback((action: AppAction) => {
        baseDispatch(action);
        // Fire-and-forget Supabase sync
        syncAction(action).catch(() => {
            // Sync errors logged in useSupabaseSync, app continues offline
        });
    }, [syncAction]);

    // Load state from localStorage on mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                baseDispatch({ type: 'LOAD_STATE', payload: parsed });
            }
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
        }
        if (isOnline) {
            console.info('Supabase sync enabled - changes will sync to cloud');
        }
    }, [isOnline]);

    // Save state to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
        }
    }, [state]);

    // Lead scoring algorithm
    const calculateLeadScore = (lead: Partial<Lead>): number => {
        let score = 0;

        // Source scoring
        const sourceScores: Record<string, number> = {
            referral: 25,
            landing_page: 20,
            organic: 15,
            social: 10,
            paid_ad: 15,
            email: 12,
            direct: 8,
            other: 5,
        };
        score += sourceScores[lead.source || 'other'] || 5;

        // Company presence
        if (lead.company) score += 15;
        if (lead.phone) score += 10;

        // Stage progression
        const stageScores: Record<string, number> = {
            new: 0,
            contacted: 10,
            qualified: 25,
            proposal: 35,
            negotiation: 45,
            won: 50,
            lost: 0,
        };
        score += stageScores[lead.stage || 'new'] || 0;

        // Tags bonus
        if (lead.tags?.includes('enterprise')) score += 10;
        if (lead.tags?.includes('decision-maker')) score += 10;
        if (lead.tags?.includes('hot-lead')) score += 15;
        if (lead.tags?.includes('funded')) score += 10;

        return Math.min(100, Math.max(0, score));
    };

    // Helper functions
    const getLeadsByStage = (stage: string): Lead[] => {
        return state.leads.filter((lead) => lead.stage === stage);
    };

    const getActiveExperiments = (): Experiment[] => {
        return state.experiments.filter((exp) => exp.status === 'running');
    };

    const getPublishedPages = (): LandingPage[] => {
        return state.landingPages.filter((page) => page.status === 'published');
    };

    const value: DataContextType = {
        state,
        dispatch,
        calculateLeadScore,
        getLeadsByStage,
        getActiveExperiments,
        getPublishedPages,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// Hook to use the context
// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextType {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

export default DataContext;
