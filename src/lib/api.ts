// API Service Layer - Provides typed database operations via Supabase
/* eslint-disable @typescript-eslint/no-explicit-any */
import supabase from './supabase';
import type { Database } from './database.types';

// Type helpers - use Row types for returns
type Tables = Database['public']['Tables'];
type LeadRow = Tables['leads']['Row'];
type LeadInsert = Tables['leads']['Insert'];
type LeadUpdate = Tables['leads']['Update'];
type LandingPageRow = Tables['landing_pages']['Row'];
type LandingPageInsert = Tables['landing_pages']['Insert'];
type LandingPageUpdate = Tables['landing_pages']['Update'];
type SurveyRow = Tables['surveys']['Row'];
type SurveyInsert = Tables['surveys']['Insert'];
type SurveyUpdate = Tables['surveys']['Update'];
type SurveyResponseInsert = Tables['survey_responses']['Insert'];
type ExperimentRow = Tables['experiments']['Row'];
type ExperimentInsert = Tables['experiments']['Insert'];
type ExperimentUpdate = Tables['experiments']['Update'];
type ContentPieceRow = Tables['content_pieces']['Row'];
type ContentPieceInsert = Tables['content_pieces']['Insert'];
type ContentPieceUpdate = Tables['content_pieces']['Update'];
type ContentCampaignRow = Tables['content_campaigns']['Row'];
type ContentCampaignInsert = Tables['content_campaigns']['Insert'];
type ContentCampaignUpdate = Tables['content_campaigns']['Update'];
type ProductProfileRow = Tables['product_profiles']['Row'];
type ProductProfileInsert = Tables['product_profiles']['Insert'];
type LaunchPlanRow = Tables['launch_plans']['Row'];
type LaunchPlanInsert = Tables['launch_plans']['Insert'];
type LaunchPlanUpdate = Tables['launch_plans']['Update'];
type LaunchPhaseInsert = Tables['launch_phases']['Insert'];
type LaunchPhaseUpdate = Tables['launch_phases']['Update'];
type ContentQueueItemInsert = Tables['content_queue_items']['Insert'];
type ActivityInsert = Tables['activities']['Insert'];
type AudienceRow = Tables['audiences']['Row'];
type AudienceInsert = Tables['audiences']['Insert'];
type AudienceUpdate = Tables['audiences']['Update'];

// =============================================
// LEADS API
// =============================================
export const leadsApi = {
    getAll: async (options?: { orderBy?: string; limit?: number }): Promise<LeadRow[]> => {
        let query = supabase.from('leads').select('*');
        if (options?.orderBy) {
            query = query.order(options.orderBy, { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }
        if (options?.limit) query = query.limit(options.limit);
        const { data, error } = await query;
        if (error) throw error;
        return data as LeadRow[];
    },
    
    getById: async (id: string): Promise<LeadRow | null> => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as LeadRow | null;
    },
    
    create: async (lead: LeadInsert): Promise<LeadRow> => {
        const { data, error } = await supabase
            .from('leads')
            .insert(lead as any)
            .select()
            .single();
        if (error) throw error;
        return data as LeadRow;
    },
    
    update: async (id: string, updates: LeadUpdate): Promise<LeadRow> => {
        const { data, error } = await supabase
            .from('leads')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as LeadRow;
    },
    
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
    },
    
    getByStage: async (stage: string): Promise<LeadRow[]> => {
        const { data, error } = await supabase
            .from('leads')
            .select('*')
            .eq('stage', stage)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as LeadRow[];
    },
    
    updateStage: async (id: string, stage: string): Promise<LeadRow> => {
        const { data, error } = await supabase
            .from('leads')
            .update({ stage, last_activity_at: new Date().toISOString() } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as LeadRow;
    },
};

// =============================================
// LANDING PAGES API
// =============================================
export const landingPagesApi = {
    getAll: async (options?: { status?: string }): Promise<LandingPageRow[]> => {
        let query = supabase.from('landing_pages').select('*');
        if (options?.status) query = query.eq('status', options.status);
        query = query.order('updated_at', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        return data as LandingPageRow[];
    },
    
    getById: async (id: string): Promise<LandingPageRow | null> => {
        const { data, error } = await supabase
            .from('landing_pages')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as LandingPageRow | null;
    },
    
    getBySlug: async (slug: string): Promise<LandingPageRow | null> => {
        const { data, error } = await supabase
            .from('landing_pages')
            .select('*')
            .eq('slug', slug)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as LandingPageRow | null;
    },
    
    create: async (page: LandingPageInsert): Promise<LandingPageRow> => {
        const { data, error } = await supabase
            .from('landing_pages')
            .insert(page as any)
            .select()
            .single();
        if (error) throw error;
        return data as LandingPageRow;
    },
    
    update: async (id: string, updates: LandingPageUpdate): Promise<LandingPageRow> => {
        const { data, error } = await supabase
            .from('landing_pages')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as LandingPageRow;
    },
    
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('landing_pages').delete().eq('id', id);
        if (error) throw error;
    },
    
    publish: async (id: string): Promise<LandingPageRow> => {
        const { data, error } = await supabase
            .from('landing_pages')
            .update({ status: 'published', published_at: new Date().toISOString() } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as LandingPageRow;
    },
    
    recordView: async (id: string): Promise<LandingPageRow> => {
        const page = await landingPagesApi.getById(id);
        if (!page) throw new Error('Page not found');
        const analytics = (page.analytics as { views?: number }) || {};
        const { data, error } = await supabase
            .from('landing_pages')
            .update({ analytics: { ...analytics, views: (analytics.views || 0) + 1 } } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as LandingPageRow;
    },
};

// =============================================
// SURVEYS API
// =============================================
export const surveysApi = {
    getAll: async (): Promise<SurveyRow[]> => {
        const { data, error } = await supabase
            .from('surveys')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data as SurveyRow[];
    },
    
    getById: async (id: string): Promise<SurveyRow | null> => {
        const { data, error } = await supabase
            .from('surveys')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as SurveyRow | null;
    },
    
    create: async (survey: SurveyInsert): Promise<SurveyRow> => {
        const { data, error } = await supabase
            .from('surveys')
            .insert(survey as any)
            .select()
            .single();
        if (error) throw error;
        return data as SurveyRow;
    },
    
    update: async (id: string, updates: SurveyUpdate): Promise<SurveyRow> => {
        const { data, error } = await supabase
            .from('surveys')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as SurveyRow;
    },
    
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('surveys').delete().eq('id', id);
        if (error) throw error;
    },
    
    submitResponse: async (response: SurveyResponseInsert) => {
        const { data, error } = await supabase
            .from('survey_responses')
            .insert(response as any)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    getResponses: async (surveyId: string) => {
        const { data, error } = await supabase
            .from('survey_responses')
            .select('*')
            .eq('survey_id', surveyId)
            .order('completed_at', { ascending: false });
        if (error) throw error;
        return data;
    },
};

// =============================================
// EXPERIMENTS API
// =============================================
export const experimentsApi = {
    getAll: async (): Promise<ExperimentRow[]> => {
        const { data, error } = await supabase
            .from('experiments')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data as ExperimentRow[];
    },
    
    getById: async (id: string): Promise<ExperimentRow | null> => {
        const { data, error } = await supabase
            .from('experiments')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as ExperimentRow | null;
    },
    
    create: async (experiment: ExperimentInsert): Promise<ExperimentRow> => {
        const { data, error } = await supabase
            .from('experiments')
            .insert(experiment as any)
            .select()
            .single();
        if (error) throw error;
        return data as ExperimentRow;
    },
    
    update: async (id: string, updates: ExperimentUpdate): Promise<ExperimentRow> => {
        const { data, error } = await supabase
            .from('experiments')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as ExperimentRow;
    },
    
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('experiments').delete().eq('id', id);
        if (error) throw error;
    },
    
    start: async (id: string): Promise<ExperimentRow> => {
        const { data, error } = await supabase
            .from('experiments')
            .update({ status: 'running', start_date: new Date().toISOString() } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as ExperimentRow;
    },
    
    stop: async (id: string, winnerId?: string): Promise<ExperimentRow> => {
        const { data, error } = await supabase
            .from('experiments')
            .update({ status: 'completed', end_date: new Date().toISOString(), winner: winnerId || null } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as ExperimentRow;
    },
    
    recordImpression: async (variantId: string) => {
        const { data, error } = await supabase.rpc('increment_impressions', { variant_id: variantId });
        if (error) throw error;
        return data;
    },
    
    recordConversion: async (variantId: string) => {
        const { data, error } = await supabase.rpc('increment_conversions', { variant_id: variantId });
        if (error) throw error;
        return data;
    },
};

// =============================================
// CONTENT API
// =============================================
export const contentApi = {
    getAll: async (options?: { platform?: string; status?: string }): Promise<ContentPieceRow[]> => {
        let query = supabase.from('content_pieces').select('*');
        if (options?.platform) query = query.eq('platform', options.platform);
        if (options?.status) query = query.eq('status', options.status);
        query = query.order('created_at', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        return data as ContentPieceRow[];
    },
    
    getById: async (id: string): Promise<ContentPieceRow | null> => {
        const { data, error } = await supabase
            .from('content_pieces')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as ContentPieceRow | null;
    },
    
    create: async (content: ContentPieceInsert): Promise<ContentPieceRow> => {
        const { data, error } = await supabase
            .from('content_pieces')
            .insert(content as any)
            .select()
            .single();
        if (error) throw error;
        return data as ContentPieceRow;
    },
    
    update: async (id: string, updates: ContentPieceUpdate): Promise<ContentPieceRow> => {
        const { data, error } = await supabase
            .from('content_pieces')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as ContentPieceRow;
    },
    
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('content_pieces').delete().eq('id', id);
        if (error) throw error;
    },
    
    schedule: async (id: string, scheduledAt: string): Promise<ContentPieceRow> => {
        const { data, error } = await supabase
            .from('content_pieces')
            .update({ scheduled_at: scheduledAt, status: 'scheduled' } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as ContentPieceRow;
    },
    
    publish: async (id: string): Promise<ContentPieceRow> => {
        const { data, error } = await supabase
            .from('content_pieces')
            .update({ status: 'published', published_at: new Date().toISOString() } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as ContentPieceRow;
    },
};

// =============================================
// CAMPAIGNS API
// =============================================
export const campaignsApi = {
    getAll: async (): Promise<ContentCampaignRow[]> => {
        const { data, error } = await supabase
            .from('content_campaigns')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data as ContentCampaignRow[];
    },
    
    getById: async (id: string): Promise<ContentCampaignRow | null> => {
        const { data, error } = await supabase
            .from('content_campaigns')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as ContentCampaignRow | null;
    },
    
    create: async (campaign: ContentCampaignInsert): Promise<ContentCampaignRow> => {
        const { data, error } = await supabase
            .from('content_campaigns')
            .insert(campaign as any)
            .select()
            .single();
        if (error) throw error;
        return data as ContentCampaignRow;
    },
    
    update: async (id: string, updates: ContentCampaignUpdate): Promise<ContentCampaignRow> => {
        const { data, error } = await supabase
            .from('content_campaigns')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as ContentCampaignRow;
    },
    
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('content_campaigns').delete().eq('id', id);
        if (error) throw error;
    },
    
    getContent: async (campaignId: string): Promise<ContentPieceRow[]> => {
        const { data, error } = await supabase
            .from('content_pieces')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('scheduled_at', { ascending: true });
        if (error) throw error;
        return data as ContentPieceRow[];
    },
};

// =============================================
// PRODUCT PROFILE API
// =============================================
export const productProfileApi = {
    get: async (): Promise<ProductProfileRow | null> => {
        const { data, error } = await supabase
            .from('product_profiles')
            .select('*')
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as ProductProfileRow | null;
    },
    
    upsert: async (profile: ProductProfileInsert): Promise<ProductProfileRow> => {
        const { data, error } = await supabase
            .from('product_profiles')
            .upsert(profile as any)
            .select()
            .single();
        if (error) throw error;
        return data as ProductProfileRow;
    },
};

// =============================================
// LAUNCH PLANS API
// =============================================
export const launchPlansApi = {
    getAll: async (): Promise<LaunchPlanRow[]> => {
        const { data, error } = await supabase
            .from('launch_plans')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data as LaunchPlanRow[];
    },
    
    getById: async (id: string) => {
        const { data, error } = await supabase
            .from('launch_plans')
            .select(`*, phases:launch_phases(*)`)
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },
    
    create: async (plan: LaunchPlanInsert): Promise<LaunchPlanRow> => {
        const { data, error } = await supabase
            .from('launch_plans')
            .insert(plan as any)
            .select()
            .single();
        if (error) throw error;
        return data as LaunchPlanRow;
    },
    
    update: async (id: string, updates: LaunchPlanUpdate): Promise<LaunchPlanRow> => {
        const { data, error } = await supabase
            .from('launch_plans')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as LaunchPlanRow;
    },
    
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('launch_plans').delete().eq('id', id);
        if (error) throw error;
    },
    
    activate: async (id: string): Promise<LaunchPlanRow> => {
        const { data, error } = await supabase
            .from('launch_plans')
            .update({ status: 'active' } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as LaunchPlanRow;
    },
    
    pause: async (id: string): Promise<LaunchPlanRow> => {
        const { data, error } = await supabase
            .from('launch_plans')
            .update({ status: 'paused' } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as LaunchPlanRow;
    },
    
    createPhase: async (phase: LaunchPhaseInsert) => {
        const { data, error } = await supabase
            .from('launch_phases')
            .insert(phase as any)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    updatePhase: async (id: string, updates: LaunchPhaseUpdate) => {
        const { data, error } = await supabase
            .from('launch_phases')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    getQueue: async (planId: string) => {
        const { data, error } = await supabase
            .from('content_queue_items')
            .select(`*, content:content_pieces(*)`)
            .eq('plan_id', planId)
            .order('scheduled_date', { ascending: true })
            .order('scheduled_time', { ascending: true });
        if (error) throw error;
        return data;
    },
    
    addToQueue: async (item: ContentQueueItemInsert) => {
        const { data, error } = await supabase
            .from('content_queue_items')
            .insert(item as any)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    approveQueueItem: async (id: string) => {
        const { data, error } = await supabase
            .from('content_queue_items')
            .update({ status: 'approved', approved_at: new Date().toISOString() } as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    bulkApprove: async (ids: string[]) => {
        const { error } = await supabase
            .from('content_queue_items')
            .update({ status: 'approved', approved_at: new Date().toISOString() } as any)
            .in('id', ids);
        if (error) throw error;
    },
};

// =============================================
// ACTIVITIES API
// =============================================
export const activitiesApi = {
    getAll: async (limit: number = 50) => {
        const { data, error } = await supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) throw error;
        return data;
    },
    
    create: async (activity: ActivityInsert) => {
        const { data, error } = await supabase
            .from('activities')
            .insert(activity as any)
            .select()
            .single();
        if (error) throw error;
        return data;
    },
    
    log: async (type: string, title: string, description: string, entityId: string, entityType: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        return activitiesApi.create({
            user_id: user.id,
            type,
            title,
            description,
            entity_id: entityId,
            entity_type: entityType,
        });
    },
};

// =============================================
// AUDIENCES API
// =============================================
export const audiencesApi = {
    getAll: async (): Promise<AudienceRow[]> => {
        const { data, error } = await supabase
            .from('audiences')
            .select('*')
            .order('updated_at', { ascending: false });
        if (error) throw error;
        return data as AudienceRow[];
    },
    
    getById: async (id: string): Promise<AudienceRow | null> => {
        const { data, error } = await supabase
            .from('audiences')
            .select('*')
            .eq('id', id)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data as AudienceRow | null;
    },
    
    create: async (audience: AudienceInsert): Promise<AudienceRow> => {
        const { data, error } = await supabase
            .from('audiences')
            .insert(audience as any)
            .select()
            .single();
        if (error) throw error;
        return data as AudienceRow;
    },
    
    update: async (id: string, updates: AudienceUpdate): Promise<AudienceRow> => {
        const { data, error } = await supabase
            .from('audiences')
            .update(updates as any)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as AudienceRow;
    },
    
    delete: async (id: string): Promise<void> => {
        const { error } = await supabase.from('audiences').delete().eq('id', id);
        if (error) throw error;
    },
};

// Export all APIs
export const api = {
    leads: leadsApi,
    landingPages: landingPagesApi,
    surveys: surveysApi,
    experiments: experimentsApi,
    content: contentApi,
    campaigns: campaignsApi,
    productProfile: productProfileApi,
    launchPlans: launchPlansApi,
    activities: activitiesApi,
    audiences: audiencesApi,
};

export default api;
