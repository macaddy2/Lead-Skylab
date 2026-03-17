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
