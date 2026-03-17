import { describe, it, expect } from 'vitest';
import { appReducer, initialState } from '../store/DataContext';
import type { Lead, ContentPiece, AppState } from '../types';

// Minimal lead fixture
const makeLead = (overrides: Partial<Lead> = {}): Lead => ({
    id: 'lead-1',
    email: 'test@example.com',
    name: 'Test Lead',
    source: 'organic',
    stage: 'new',
    score: 50,
    tags: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    ...overrides,
});

const emptyState: AppState = {
    ...initialState,
    leads: [],
    landingPages: [],
    experiments: [],
    surveys: [],
    audiences: [],
    personas: [],
    activities: [],
    notifications: [],
    contentPieces: [],
    contentCampaigns: [],
    productProfile: null,
    contentTemplates: [],
    launchPlans: [],
    contentQueue: [],
    launchTemplates: [],
};

describe('appReducer', () => {
    // ── Lead CRUD ──────────────────────────────────────────────

    it('ADD_LEAD appends a lead', () => {
        const lead = makeLead();
        const result = appReducer(emptyState, { type: 'ADD_LEAD', payload: lead });
        expect(result.leads).toHaveLength(1);
        expect(result.leads[0]).toBe(lead);
    });

    it('UPDATE_LEAD replaces matching lead by id', () => {
        const lead = makeLead({ id: 'lead-1', name: 'Original' });
        const state = { ...emptyState, leads: [lead] };
        const updated = { ...lead, name: 'Updated' };
        const result = appReducer(state, { type: 'UPDATE_LEAD', payload: updated });
        expect(result.leads).toHaveLength(1);
        expect(result.leads[0].name).toBe('Updated');
    });

    it('DELETE_LEAD removes lead by id', () => {
        const lead = makeLead({ id: 'lead-1' });
        const state = { ...emptyState, leads: [lead] };
        const result = appReducer(state, { type: 'DELETE_LEAD', payload: 'lead-1' });
        expect(result.leads).toHaveLength(0);
    });

    // ── Content ──────────────────────────────────────────────

    it('ADD_CONTENT appends a content piece', () => {
        const piece: ContentPiece = {
            id: 'content-1',
            title: 'Test Post',
            content: 'Hello world',
            platform: 'twitter',
            status: 'draft',
            tone: 'casual',
            hashtags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const result = appReducer(emptyState, { type: 'ADD_CONTENT', payload: piece });
        expect(result.contentPieces).toHaveLength(1);
        expect(result.contentPieces[0].id).toBe('content-1');
    });

    // ── Activity cap ──────────────────────────────────────────

    it('ADD_ACTIVITY keeps at most 50 activities', () => {
        const activities = Array.from({ length: 50 }, (_, i) => ({
            id: `act-${i}`,
            type: 'lead_created' as const,
            title: `Activity ${i}`,
            description: '',
            entityId: '',
            entityType: '',
            timestamp: new Date().toISOString(),
        }));
        const state = { ...emptyState, activities };
        const newAct = { ...activities[0], id: 'act-new', title: 'Newest' };
        const result = appReducer(state, { type: 'ADD_ACTIVITY', payload: newAct });
        expect(result.activities).toHaveLength(50);
        expect(result.activities[0].id).toBe('act-new');
    });

    // ── Reset ──────────────────────────────────────────

    it('RESET_STATE returns initialState', () => {
        const lead = makeLead();
        const state = { ...initialState, leads: [...initialState.leads, lead] };
        const result = appReducer(state, { type: 'RESET_STATE' });
        expect(result).toBe(initialState);
    });
});
