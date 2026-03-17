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
