// Supabase Sync Middleware
// Intercepts DataContext dispatches and syncs to Supabase in background.
// localStorage is always written first (instant UI), Supabase is async.
// If Supabase is unreachable, the app continues offline.

import { useCallback, useRef } from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import type { AppAction } from '../types';

// Dynamically import the API to handle missing env vars gracefully
let api: typeof import('../lib/api') | null = null;
const supabaseAvailable = isSupabaseConfigured;

if (supabaseAvailable) {
    try {
        api = await import('../lib/api');
    } catch {
        console.warn('Failed to load API module');
    }
}

type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncState {
    status: SyncStatus;
    lastSynced: string | null;
    pendingActions: number;
}

export function useSupabaseSync() {
    const syncState = useRef<SyncState>({
        status: supabaseAvailable ? 'synced' : 'offline',
        lastSynced: null,
        pendingActions: 0,
    });

    const syncAction = useCallback(async (action: AppAction) => {
        if (!supabaseAvailable || !api) return;

        syncState.current.pendingActions++;
        syncState.current.status = 'syncing';

        try {
            switch (action.type) {
                case 'ADD_LEAD':
                    await api.leadsApi.create({
                        id: action.payload.id,
                        email: action.payload.email,
                        name: action.payload.name,
                        company: action.payload.company || null,
                        phone: action.payload.phone || null,
                        source: action.payload.source,
                        stage: action.payload.stage,
                        score: action.payload.score,
                        tags: action.payload.tags,
                        notes: action.payload.notes || null,
                        custom_fields: action.payload.customFields || null,
                    });
                    break;

                case 'UPDATE_LEAD':
                    await api.leadsApi.update(action.payload.id, {
                        email: action.payload.email,
                        name: action.payload.name,
                        company: action.payload.company || null,
                        phone: action.payload.phone || null,
                        source: action.payload.source,
                        stage: action.payload.stage,
                        score: action.payload.score,
                        tags: action.payload.tags,
                        notes: action.payload.notes || null,
                    });
                    break;

                case 'DELETE_LEAD':
                    await api.leadsApi.delete(action.payload);
                    break;

                case 'ADD_CONTENT':
                    await api.contentApi.create({
                        id: action.payload.id,
                        title: action.payload.title,
                        content: action.payload.content,
                        platform: action.payload.platform,
                        status: action.payload.status,
                        tone: action.payload.tone,
                        hashtags: action.payload.hashtags,
                        campaign_id: action.payload.campaignId || null,
                        scheduled_at: action.payload.scheduledAt || null,
                    });
                    break;

                case 'UPDATE_CONTENT':
                    await api.contentApi.update(action.payload.id, {
                        title: action.payload.title,
                        content: action.payload.content,
                        platform: action.payload.platform,
                        status: action.payload.status,
                        tone: action.payload.tone,
                        hashtags: action.payload.hashtags,
                    });
                    break;

                case 'DELETE_CONTENT':
                    await api.contentApi.delete(action.payload);
                    break;

                case 'ADD_AUDIENCE':
                    await api.audiencesApi.create({
                        id: action.payload.id,
                        name: action.payload.name,
                        description: action.payload.description || null,
                        criteria: action.payload.criteria as unknown as Record<string, unknown>,
                        size: action.payload.size,
                    });
                    break;

                case 'DELETE_AUDIENCE':
                    await api.audiencesApi.delete(action.payload);
                    break;

                case 'SET_PRODUCT_PROFILE':
                    await api.productProfileApi.upsert({
                        name: action.payload.name,
                        description: action.payload.description,
                        value_props: action.payload.valueProps,
                        target_audience: action.payload.targetAudience,
                        keywords: action.payload.keywords,
                        tone: action.payload.tone,
                        competitors: action.payload.competitors,
                        url: action.payload.url || null,
                    });
                    break;

                // Actions that don't need Supabase sync
                case 'LOAD_STATE':
                case 'RESET_STATE':
                case 'UPDATE_METRICS':
                case 'ADD_ACTIVITY':
                    break;

                default:
                    // Other actions silently skip Supabase
                    break;
            }

            syncState.current.lastSynced = new Date().toISOString();
            syncState.current.status = 'synced';
        } catch (err) {
            console.warn('Supabase sync failed (data saved locally):', err);
            syncState.current.status = 'error';
        } finally {
            syncState.current.pendingActions--;
            if (syncState.current.pendingActions === 0 && syncState.current.status === 'syncing') {
                syncState.current.status = 'synced';
            }
        }
    }, []);

    return {
        syncAction,
        getSyncStatus: () => syncState.current.status,
        isOnline: supabaseAvailable,
    };
}
