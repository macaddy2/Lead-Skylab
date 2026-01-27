// Supabase Database Types
// Auto-generated types would normally come from Supabase CLI
// This file provides TypeScript types for our database schema

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    preferences: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    preferences?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    preferences?: Json | null;
                    updated_at?: string;
                };
            };
            leads: {
                Row: {
                    id: string;
                    user_id: string;
                    email: string;
                    name: string;
                    company: string | null;
                    phone: string | null;
                    source: string;
                    stage: string;
                    score: number;
                    tags: string[];
                    notes: string | null;
                    custom_fields: Json | null;
                    created_at: string;
                    updated_at: string;
                    last_activity_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    email: string;
                    name: string;
                    company?: string | null;
                    phone?: string | null;
                    source: string;
                    stage?: string;
                    score?: number;
                    tags?: string[];
                    notes?: string | null;
                    custom_fields?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                    last_activity_at?: string;
                };
                Update: {
                    email?: string;
                    name?: string;
                    company?: string | null;
                    phone?: string | null;
                    source?: string;
                    stage?: string;
                    score?: number;
                    tags?: string[];
                    notes?: string | null;
                    custom_fields?: Json | null;
                    updated_at?: string;
                    last_activity_at?: string;
                };
            };
            landing_pages: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    slug: string;
                    status: string;
                    template: string;
                    sections: Json;
                    settings: Json;
                    analytics: Json;
                    created_at: string;
                    updated_at: string;
                    published_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    slug: string;
                    status?: string;
                    template: string;
                    sections?: Json;
                    settings?: Json;
                    analytics?: Json;
                    created_at?: string;
                    updated_at?: string;
                    published_at?: string | null;
                };
                Update: {
                    title?: string;
                    slug?: string;
                    status?: string;
                    template?: string;
                    sections?: Json;
                    settings?: Json;
                    analytics?: Json;
                    updated_at?: string;
                    published_at?: string | null;
                };
            };
            experiments: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    description: string | null;
                    status: string;
                    type: string;
                    target_id: string;
                    traffic_split: number[];
                    metric: string;
                    winner: string | null;
                    start_date: string | null;
                    end_date: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    description?: string | null;
                    status?: string;
                    type: string;
                    target_id: string;
                    traffic_split?: number[];
                    metric: string;
                    winner?: string | null;
                    start_date?: string | null;
                    end_date?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    status?: string;
                    traffic_split?: number[];
                    metric?: string;
                    winner?: string | null;
                    end_date?: string | null;
                    updated_at?: string;
                };
            };
            experiment_variants: {
                Row: {
                    id: string;
                    experiment_id: string;
                    name: string;
                    description: string | null;
                    content: Json;
                    impressions: number;
                    conversions: number;
                };
                Insert: {
                    id?: string;
                    experiment_id: string;
                    name: string;
                    description?: string | null;
                    content: Json;
                    impressions?: number;
                    conversions?: number;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    content?: Json;
                    impressions?: number;
                    conversions?: number;
                };
            };
            surveys: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    description: string | null;
                    status: string;
                    type: string;
                    questions: Json;
                    settings: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    description?: string | null;
                    status?: string;
                    type: string;
                    questions?: Json;
                    settings?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    title?: string;
                    description?: string | null;
                    status?: string;
                    questions?: Json;
                    settings?: Json;
                    updated_at?: string;
                };
            };
            survey_responses: {
                Row: {
                    id: string;
                    survey_id: string;
                    respondent_email: string | null;
                    answers: Json;
                    metadata: Json | null;
                    completed_at: string;
                };
                Insert: {
                    id?: string;
                    survey_id: string;
                    respondent_email?: string | null;
                    answers: Json;
                    metadata?: Json | null;
                    completed_at?: string;
                };
                Update: {
                    answers?: Json;
                    metadata?: Json | null;
                };
            };
            audiences: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    description: string | null;
                    type: string;
                    criteria: Json;
                    size: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    description?: string | null;
                    type?: string;
                    criteria?: Json;
                    size?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    type?: string;
                    criteria?: Json;
                    size?: number;
                    updated_at?: string;
                };
            };
            content_pieces: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    content: string;
                    platform: string;
                    status: string;
                    tone: string;
                    campaign_id: string | null;
                    template_id: string | null;
                    hashtags: string[];
                    scheduled_at: string | null;
                    published_at: string | null;
                    analytics: Json | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    content: string;
                    platform: string;
                    status?: string;
                    tone?: string;
                    campaign_id?: string | null;
                    template_id?: string | null;
                    hashtags?: string[];
                    scheduled_at?: string | null;
                    published_at?: string | null;
                    analytics?: Json | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    title?: string;
                    content?: string;
                    platform?: string;
                    status?: string;
                    tone?: string;
                    campaign_id?: string | null;
                    hashtags?: string[];
                    scheduled_at?: string | null;
                    published_at?: string | null;
                    analytics?: Json | null;
                    updated_at?: string;
                };
            };
            content_campaigns: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    description: string | null;
                    status: string;
                    platforms: string[];
                    start_date: string | null;
                    end_date: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    description?: string | null;
                    status?: string;
                    platforms?: string[];
                    start_date?: string | null;
                    end_date?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    status?: string;
                    platforms?: string[];
                    start_date?: string | null;
                    end_date?: string | null;
                    updated_at?: string;
                };
            };
            product_profiles: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    url: string | null;
                    description: string;
                    value_props: string[];
                    target_audience: string;
                    keywords: string[];
                    tone: string;
                    competitors: string[];
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    url?: string | null;
                    description: string;
                    value_props?: string[];
                    target_audience: string;
                    keywords?: string[];
                    tone?: string;
                    competitors?: string[];
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    url?: string | null;
                    description?: string;
                    value_props?: string[];
                    target_audience?: string;
                    keywords?: string[];
                    tone?: string;
                    competitors?: string[];
                    updated_at?: string;
                };
            };
            launch_plans: {
                Row: {
                    id: string;
                    user_id: string;
                    name: string;
                    description: string | null;
                    product_name: string;
                    product_url: string | null;
                    status: string;
                    input_mode: string;
                    preferences: Json;
                    start_date: string;
                    launch_date: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    name: string;
                    description?: string | null;
                    product_name: string;
                    product_url?: string | null;
                    status?: string;
                    input_mode: string;
                    preferences: Json;
                    start_date: string;
                    launch_date: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    name?: string;
                    description?: string | null;
                    product_name?: string;
                    product_url?: string | null;
                    status?: string;
                    preferences?: Json;
                    start_date?: string;
                    launch_date?: string;
                    updated_at?: string;
                };
            };
            launch_phases: {
                Row: {
                    id: string;
                    plan_id: string;
                    type: string;
                    name: string;
                    description: string | null;
                    start_date: string;
                    end_date: string;
                    milestones: Json;
                    status: string;
                };
                Insert: {
                    id?: string;
                    plan_id: string;
                    type: string;
                    name: string;
                    description?: string | null;
                    start_date: string;
                    end_date: string;
                    milestones?: Json;
                    status?: string;
                };
                Update: {
                    type?: string;
                    name?: string;
                    description?: string | null;
                    start_date?: string;
                    end_date?: string;
                    milestones?: Json;
                    status?: string;
                };
            };
            content_queue_items: {
                Row: {
                    id: string;
                    plan_id: string;
                    phase_id: string;
                    content_piece_id: string;
                    scheduled_date: string;
                    scheduled_time: string;
                    status: string;
                    approved_at: string | null;
                    published_at: string | null;
                    error: string | null;
                };
                Insert: {
                    id?: string;
                    plan_id: string;
                    phase_id: string;
                    content_piece_id: string;
                    scheduled_date: string;
                    scheduled_time: string;
                    status?: string;
                    approved_at?: string | null;
                    published_at?: string | null;
                    error?: string | null;
                };
                Update: {
                    scheduled_date?: string;
                    scheduled_time?: string;
                    status?: string;
                    approved_at?: string | null;
                    published_at?: string | null;
                    error?: string | null;
                };
            };
            activities: {
                Row: {
                    id: string;
                    user_id: string;
                    type: string;
                    title: string;
                    description: string;
                    entity_id: string;
                    entity_type: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: string;
                    title: string;
                    description: string;
                    entity_id: string;
                    entity_type: string;
                    created_at?: string;
                };
                Update: never;
            };
        };
    };
}

// Helper types for common operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
