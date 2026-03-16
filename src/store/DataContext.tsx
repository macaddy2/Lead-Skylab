import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
    AppState,
    AppAction,
    Lead,
    LandingPage,
    Experiment,
} from '../types';
import {
    initialMetrics,
    demoLeads,
    demoLandingPages,
    demoExperiments,
    demoSurveys,
    demoAudiences,
    demoActivities,
    demoTemplates,
    demoLaunchTemplates,
} from '../data/seedData';

// ─── Initial State ────────────────────────────────────────────────────────────

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

// ─── Reducer ──────────────────────────────────────────────────────────────────

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
            return { ...initialState, ...action.payload };
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
                        ? { ...q, phaseId: action.payload.phaseType }
                        : q
                ),
            };
        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface DataContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    calculateLeadScore: (lead: Partial<Lead>) => number;
    getLeadsByStage: (stage: string) => Lead[];
    getActiveExperiments: () => Experiment[];
    getPublishedPages: () => LandingPage[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEY = 'lead_skylab_state';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DataProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                dispatch({ type: 'LOAD_STATE', payload: parsed });
            }
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
        }
    }, []);

    // Persist to localStorage on change
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
        }
    }, [state]);

    // Helper: lead scoring
    const calculateLeadScore = (lead: Partial<Lead>): number => {
        let score = 0;

        const sourceScores: Record<string, number> = {
            referral: 25, landing_page: 20, organic: 15,
            social: 10, paid_ad: 15, email: 12, direct: 8, other: 5,
        };
        score += sourceScores[lead.source || 'other'] || 5;
        if (lead.company) score += 15;
        if (lead.phone) score += 10;

        const stageScores: Record<string, number> = {
            new: 0, contacted: 10, qualified: 25, proposal: 35,
            negotiation: 45, won: 50, lost: 0,
        };
        score += stageScores[lead.stage || 'new'] || 0;

        if (lead.tags?.includes('enterprise')) score += 10;
        if (lead.tags?.includes('decision-maker')) score += 10;
        if (lead.tags?.includes('hot-lead')) score += 15;
        if (lead.tags?.includes('funded')) score += 10;

        return Math.min(100, Math.max(0, score));
    };

    const getLeadsByStage = (stage: string): Lead[] =>
        state.leads.filter((lead) => lead.stage === stage);

    const getActiveExperiments = (): Experiment[] =>
        state.experiments.filter((exp) => exp.status === 'running');

    const getPublishedPages = (): LandingPage[] =>
        state.landingPages.filter((page) => page.status === 'published');

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

// ─── Hook ─────────────────────────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextType {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}

export default DataContext;
