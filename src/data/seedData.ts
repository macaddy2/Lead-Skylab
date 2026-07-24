/**
 * Lead Skylab — Demo / Seed Data
 *
 * Extracted from DataContext.tsx to keep the context file lean.
 * This file contains all initial demo data used to populate the app on first load.
 * The data itself may reference hex colors — these are _data payloads_ (e.g.
 * experiment variant colors) and are intentionally left as literal values.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
    Lead,
    LandingPage,
    Experiment,
    Survey,
    SurveyResponse,
    Audience,
    PMFMetrics,
    Activity,
    ContentTemplate,
    LaunchTemplate,
} from '../types';

// ─── Time helpers ───────────────────────────────────────────────────────────

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

// ─── PMF Metrics ──────────────────────────────────────────────────────────────

export const initialMetrics: PMFMetrics = {
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

// ─── Leads ────────────────────────────────────────────────────────────────────

const mkLead = (
    name: string,
    email: string,
    company: string,
    source: Lead['source'],
    stage: Lead['stage'],
    score: number,
    createdDaysAgo: number,
    tags: string[],
    notes: string,
    activeDaysAgo = Math.min(createdDaysAgo, 2),
): Lead => ({
    id: uuidv4(),
    email,
    name,
    company,
    source,
    stage,
    score,
    tags,
    notes,
    createdAt: daysAgo(createdDaysAgo),
    updatedAt: daysAgo(activeDaysAgo),
    lastActivityAt: daysAgo(activeDaysAgo),
});

export const demoLeads: Lead[] = [
    mkLead('Priya Raghavan', 'priya@marlowehealth.com', 'Marlowe Health', 'landing_page', 'qualified', 86, 2, ['enterprise', 'decision-maker'], 'Demo booked for Jul 29. Wants HIPAA notes before security review.'),
    mkLead('Marcus Reid', 'marcus@fernwoodcapital.com', 'Fernwood Capital', 'paid_ad', 'proposal', 91, 7, ['funded', 'hot-lead'], 'Series B. Proposal sent Jul 21 — following up Friday.'),
    mkLead('Tom Hardwick', 'tom@grainandco.com', 'Grain & Co', 'referral', 'negotiation', 88, 14, ['smb'], 'Negotiating annual plan, asked for 15% multi-seat discount.'),
    mkLead('Sofia Marchetti', 'sofia@lumeoanalytics.com', 'Lumeo Analytics', 'landing_page', 'qualified', 79, 5, ['analytics'], ''),
    mkLead('Daniel Okafor', 'd.okafor@brightpath.io', 'Brightpath Labs', 'referral', 'contacted', 71, 4, ['startup', 'early-adopter'], 'Referred by Nordvik. Evaluating vs. spreadsheet workflow.'),
    mkLead('Jake Tran', 'jake.tran@parcelly.app', 'Parcelly', 'organic', 'contacted', 63, 3, [], ''),
    mkLead('Hannah Osei', 'hannah@goldcoastmedia.com', 'GoldCoast Media', 'social', 'contacted', 58, 6, ['agency'], ''),
    mkLead('Ingrid Halvorsen', 'ingrid@nordvikstudio.no', 'Nordvik Studio', 'referral', 'won', 95, 24, ['case-study'], 'Closed Jul 8 — 12 seats annual. Agreed to case study.', 16),
    mkLead('Elena Ruiz', 'elena@solterraenergy.com', 'Solterra Energy', 'landing_page', 'won', 90, 30, ['enterprise'], '', 22),
    mkLead('Grace Liu', 'grace@meridianrobotics.com', 'Meridian Robotics', 'paid_ad', 'proposal', 84, 10, ['hardware'], ''),
    mkLead('Lena Vogel', 'lena.vogel@statlerworks.de', 'Statler Works', 'organic', 'new', 44, 1, [], ''),
    mkLead('Aisha Bello', 'aisha@kestrelapps.com', 'Kestrel Apps', 'social', 'new', 39, 1, [], 'Downloaded the PMF playbook.'),
    mkLead('Omar Haddad', 'omar@cairocode.dev', 'CairoCode', 'organic', 'new', 35, 0, [], ''),
    mkLead('Zoe Baxter', 'zoe@pixelforge.studio', 'Pixelforge', 'landing_page', 'new', 41, 0, [], ''),
    mkLead('Pete Lindqvist', 'pete@fjordsystems.se', 'Fjord Systems', 'referral', 'qualified', 76, 9, ['nordics'], ''),
    mkLead('Maria Santos', 'maria@alamedafoods.com', 'Alameda Foods', 'paid_ad', 'contacted', 55, 8, [], ''),
    mkLead('Chris Doyle', 'chris@redbrickins.com', 'Redbrick Insurance', 'direct', 'new', 48, 2, [], ''),
    mkLead('Yuki Tanaka', 'yuki@sakurametrics.jp', 'Sakura Metrics', 'organic', 'qualified', 81, 12, ['apac'], ''),
    mkLead('Sam Whitfield', 'sam@copperfieldbooks.com', 'Copperfield Books', 'social', 'new', 33, 3, [], ''),
    mkLead('Nadia Petrova', 'nadia@volnagames.io', 'Volna Games', 'landing_page', 'negotiation', 87, 16, ['gaming'], 'Legal reviewing DPA.'),
];

// ─── Landing Pages ────────────────────────────────────────────────────────────

const mkPage = (
    title: string,
    slug: string,
    status: LandingPage['status'],
    template: LandingPage['template'],
    headline: string,
    subheadline: string,
    ctaText: string,
    views: number,
    signups: number,
    conversionRate: number,
    createdDaysAgo: number,
): LandingPage => ({
    id: uuidv4(),
    title,
    slug,
    status,
    template,
    sections: [
        {
            id: uuidv4(),
            type: 'hero',
            order: 0,
            content: { headline, subheadline, ctaText, ctaLink: '#signup', alignment: 'center' },
        },
        {
            id: uuidv4(),
            type: 'form',
            order: 1,
            content: {
                title: 'Get started',
                subtitle: 'No credit card required',
                fields: [
                    { id: '1', type: 'email', label: 'Work email', required: true },
                    { id: '2', type: 'text', label: 'Company', required: false },
                ],
                submitText: ctaText,
                successMessage: 'Thanks! Check your inbox to continue.',
            },
        },
    ],
    settings: {
        metaTitle: `${title} · Lead Skylab`,
        metaDescription: subheadline,
    },
    analytics: {
        views,
        uniqueVisitors: Math.round(views * 0.82),
        formSubmissions: signups,
        conversionRate,
        avgTimeOnPage: 96,
        bounceRate: 44,
    },
    createdAt: daysAgo(createdDaysAgo),
    updatedAt: daysAgo(Math.min(createdDaysAgo, 3)),
    publishedAt: status === 'published' ? daysAgo(createdDaysAgo) : undefined,
});

export const demoLandingPages: LandingPage[] = [
    mkPage('Spring Launch — Free Trial', 'spring-trial', 'published', 'hero_simple',
        'Ship your MVP with confidence',
        'Validate product-market fit faster with automated lead capture and real-time feedback loops.',
        'Start free trial', 12480, 486, 3.9, 34),
    mkPage('Early Access Waitlist', 'early-access', 'published', 'hero_split',
        'Be first in line for Skylab 2.0',
        'Join 1,200+ founders on the waitlist and shape what we build next.',
        'Join the waitlist', 8912, 1204, 13.5, 45),
    mkPage('Webinar: PMF in 30 Days', 'pmf-webinar', 'published', 'hero_simple',
        'Find product-market fit in 30 days',
        'A live working session with founders who have done it — Aug 12, 10am PT.',
        'Save my seat', 3145, 402, 12.8, 12),
    mkPage('Pricing Experiment B', 'pricing-b', 'draft', 'pricing',
        'Simple pricing that scales with you',
        'One plan, every feature. $49/mo per workspace, cancel anytime.',
        'See pricing', 0, 0, 0, 1),
];

// ─── Experiments ──────────────────────────────────────────────────────────────

export const demoExperiments: Experiment[] = [
    {
        id: uuidv4(),
        name: 'Hero headline — value prop test',
        description: 'Testing two value propositions in the Spring Launch hero',
        status: 'running',
        type: 'headline',
        targetId: demoLandingPages[0].id,
        variants: [
            {
                id: 'a',
                name: 'A · "Ship your MVP with confidence"',
                content: { headline: 'Ship your MVP with confidence' },
                impressions: 1420,
                conversions: 176,
                conversionRate: 12.4,
            },
            {
                id: 'b',
                name: 'B · "Validate PMF 10× faster"',
                content: { headline: 'Validate PMF 10× faster' },
                impressions: 1418,
                conversions: 116,
                conversionRate: 8.2,
            },
        ],
        trafficSplit: [50, 50],
        metric: 'conversions',
        startDate: daysAgo(7),
        createdAt: daysAgo(7),
        updatedAt: daysAgo(0),
    },
    {
        id: uuidv4(),
        name: 'CTA color — indigo vs teal',
        description: 'Spring Launch page · button colour test',
        status: 'completed',
        type: 'cta',
        targetId: demoLandingPages[0].id,
        variants: [
            {
                id: 'a',
                name: 'A · Indigo button',
                // NOTE: color here is experiment data payload, not UI styling
                content: { color: '#6366f1' },
                impressions: 2004,
                conversions: 281,
                conversionRate: 14.0,
            },
            {
                id: 'b',
                name: 'B · Teal button',
                content: { color: '#14b8a6' },
                impressions: 1998,
                conversions: 340,
                conversionRate: 17.0,
            },
        ],
        trafficSplit: [50, 50],
        metric: 'clicks',
        startDate: daysAgo(30),
        endDate: daysAgo(16),
        winner: 'b',
        createdAt: daysAgo(30),
        updatedAt: daysAgo(16),
    },
    {
        id: uuidv4(),
        name: 'Pricing page — 2-tier vs single plan',
        description: 'Pricing Experiment B · not started',
        status: 'draft',
        type: 'landing_page',
        targetId: demoLandingPages[3].id,
        variants: [
            {
                id: 'a',
                name: 'A · Two tiers',
                content: { layout: 'two_tier' },
                impressions: 0,
                conversions: 0,
                conversionRate: 0,
            },
            {
                id: 'b',
                name: 'B · Single plan',
                content: { layout: 'single' },
                impressions: 0,
                conversions: 0,
                conversionRate: 0,
            },
        ],
        trafficSplit: [50, 50],
        metric: 'signups',
        createdAt: daysAgo(3),
        updatedAt: daysAgo(3),
    },
];

// ─── Surveys ──────────────────────────────────────────────────────────────────

/**
 * Build a realistic PMF/NPS response set. The mix is tuned so promoters −
 * detractors lands around the target NPS (e.g. 42 over 156 responses).
 */
const buildNpsResponses = (
    surveyId: string,
    promoters: number,
    passives: number,
    detractors: number,
): SurveyResponse[] => {
    const disappointment = ['Very disappointed', 'Somewhat disappointed', 'Not disappointed'];
    const benefits = [
        'Saves me hours of manual lead triage every week',
        'Finally see which channels actually convert',
        'The experiments make copy decisions data-driven',
        'One place for pipeline, pages and surveys',
        'Helped us hit PMF faster than spreadsheets ever did',
    ];
    const rows: SurveyResponse[] = [];
    let i = 0;
    const push = (value: number) => {
        rows.push({
            id: uuidv4(),
            surveyId,
            respondentEmail: `founder${i + 1}@example.com`,
            answers: [
                { questionId: '1', value },
                { questionId: '2', value: value >= 9 ? disappointment[0] : value >= 7 ? disappointment[1] : disappointment[2] },
                { questionId: '3', value: benefits[i % benefits.length] },
            ],
            completedAt: daysAgo((i % 28) + 1),
        });
        i += 1;
    };
    for (let k = 0; k < promoters; k++) push(9 + (k % 2)); // 9–10
    for (let k = 0; k < passives; k++) push(7 + (k % 2)); // 7–8
    for (let k = 0; k < detractors; k++) push(k % 7); // 0–6
    return rows;
};

const pmfSurveyId = uuidv4();

export const demoSurveys: Survey[] = [
    {
        id: pmfSurveyId,
        title: 'PMF Survey — Q3 2026',
        description: 'Quarterly product-market fit check',
        status: 'active',
        type: 'pmf',
        questions: [
            {
                id: '1',
                type: 'nps',
                question: 'How likely are you to recommend Lead Skylab to a friend or colleague?',
                required: true,
                min: 0,
                max: 10,
                order: 0,
            },
            {
                id: '2',
                type: 'single_choice',
                question: 'How would you feel if you could no longer use Lead Skylab?',
                required: true,
                options: ['Very disappointed', 'Somewhat disappointed', 'Not disappointed'],
                order: 1,
            },
            {
                id: '3',
                type: 'open_ended',
                question: 'What is the main benefit you get from Lead Skylab?',
                required: false,
                order: 2,
            },
        ],
        settings: {
            showProgressBar: true,
            allowAnonymous: false,
            thankYouMessage: 'Thank you for your feedback! It helps us improve.',
        },
        // 86 promoters − 20 detractors over 156 → NPS ≈ 42
        responses: buildNpsResponses(pmfSurveyId, 86, 50, 20),
        createdAt: daysAgo(30),
        updatedAt: daysAgo(0),
    },
    {
        id: uuidv4(),
        title: 'Onboarding Feedback',
        description: 'Sent 7 days after signup',
        status: 'draft',
        type: 'custom',
        questions: [
            {
                id: '1',
                type: 'single_choice',
                question: 'How easy was it to set up your first landing page?',
                required: true,
                options: ['Very easy', 'Somewhat easy', 'Difficult'],
                order: 0,
            },
            {
                id: '2',
                type: 'open_ended',
                question: 'What almost stopped you from finishing setup?',
                required: false,
                order: 1,
            },
        ],
        settings: {
            showProgressBar: true,
            allowAnonymous: true,
            thankYouMessage: 'Thanks — this helps us smooth out onboarding.',
        },
        responses: [],
        createdAt: daysAgo(6),
        updatedAt: daysAgo(6),
    },
];

// ─── Audiences ────────────────────────────────────────────────────────────────

export const demoAudiences: Audience[] = [
    {
        id: uuidv4(),
        name: 'Hot Leads',
        description: 'Leads with score > 80 ready for sales outreach',
        type: 'segment',
        criteria: [{ field: 'score', operator: 'greater_than', value: 80 }],
        size: 45,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: 'Enterprise Prospects',
        description: 'Leads from enterprise companies',
        type: 'segment',
        criteria: [{ field: 'tags', operator: 'contains', value: 'enterprise' }],
        size: 128,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: 'Inactive Users',
        description: "Users who haven't engaged in 30+ days",
        type: 'segment',
        criteria: [{ field: 'lastActivityAt', operator: 'less_than', value: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }],
        size: 234,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

// ─── Activities ───────────────────────────────────────────────────────────────

export const demoActivities: Activity[] = [
    {
        id: uuidv4(),
        type: 'lead_created',
        title: 'New lead captured',
        description: 'Zoe Baxter signed up via the Spring Launch page',
        entityId: demoLeads[13].id,
        entityType: 'lead',
        timestamp: daysAgo(0),
    },
    {
        id: uuidv4(),
        type: 'lead_converted',
        title: 'Deal won',
        description: 'Ingrid Halvorsen closed — 12 seats annual (Nordvik Studio)',
        entityId: demoLeads[7].id,
        entityType: 'lead',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: uuidv4(),
        type: 'experiment_completed',
        title: 'Experiment completed',
        description: 'CTA colour test finished — Teal won at 17.0% (98% confidence)',
        entityId: demoExperiments[1].id,
        entityType: 'experiment',
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: uuidv4(),
        type: 'survey_response',
        title: 'Survey response',
        description: 'New PMF survey response received — NPS 9',
        entityId: demoSurveys[0].id,
        entityType: 'survey',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: uuidv4(),
        type: 'lead_created',
        title: 'New lead captured',
        description: 'Omar Haddad signed up (organic search)',
        entityId: demoLeads[12].id,
        entityType: 'lead',
        timestamp: daysAgo(1),
    },
];

// ─── Content Templates ────────────────────────────────────────────────────────

export const demoTemplates: ContentTemplate[] = [
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
        template: "{hook}\n\nHere's what I learned:\n\n{points}\n\n{conclusion}\n\n{cta}",
        variables: ['hook', 'points', 'conclusion', 'cta'],
        example: "Most startups fail because they build what they think users want.\n\nHere's what I learned:\n\n1. Talk to 100 users before writing code\n2. Measure PMF weekly\n3. Pivot fast when data says so\n\nThe best product is the one people actually need.\n\nWhat's your approach to validation?",
    },
    {
        id: '3',
        name: 'Welcome Email',
        description: 'Welcome new subscribers or users',
        category: 'email',
        platform: 'email',
        template: 'Subject: Welcome to {product_name}! 🎉\n\nHey {first_name},\n\n{welcome_message}\n\n{next_steps}\n\nBest,\n{sender_name}',
        variables: ['product_name', 'first_name', 'welcome_message', 'next_steps', 'sender_name'],
        example: "Subject: Welcome to Lead Skylab! 🎉\n\nHey Sarah,\n\nThanks for signing up! You're now part of a community of founders who take PMF seriously.\n\nHere's how to get started:\n1. Connect your landing page\n2. Set up your first experiment\n3. Create a PMF survey\n\nBest,\nThe Lead Skylab Team",
    },
    {
        id: '4',
        name: 'TikTok Hook',
        description: 'Attention-grabbing TikTok video scripts',
        category: 'social',
        platform: 'tiktok',
        template: 'HOOK: {hook}\n\nBODY: {body}\n\nCTA: {cta}\n\nHASHTAGS: {hashtags}',
        variables: ['hook', 'body', 'cta', 'hashtags'],
        example: "HOOK: Stop building features nobody wants\n\nBODY: Here's the 3-step PMF framework that saved my startup...\n\nCTA: Follow for more founder tips\n\nHASHTAGS: #startup #founder #pmf #tech",
    },
    {
        id: '5',
        name: 'Reddit Thread',
        description: 'Engaging Reddit post for community discussion',
        category: 'social',
        platform: 'reddit',
        template: 'Title: {title}\n\n{body}\n\n{question}',
        variables: ['title', 'body', 'question'],
        example: "Title: How we went from 0 to 100 paying customers in 60 days\n\nWe launched our SaaS 2 months ago. Here's exactly what worked:\n\n1. Cold outreach on LinkedIn (30% of customers)\n2. Reddit/Twitter content (25%)\n3. Referrals (45%)\n\nThe key was validating PMF before scaling.\n\nWhat channels worked best for your first 100 customers?",
    },
];

// ─── Launch Templates ─────────────────────────────────────────────────────────

export const demoLaunchTemplates: LaunchTemplate[] = [
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
