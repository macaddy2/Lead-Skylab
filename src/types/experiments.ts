// Experiment (A/B Testing) Types

export interface Experiment {
    id: string;
    name: string;
    description?: string;
    status: 'draft' | 'running' | 'paused' | 'completed';
    type: 'landing_page' | 'cta' | 'headline' | 'form' | 'email';
    targetId: string;
    variants: ExperimentVariant[];
    trafficSplit: number[];
    metric: ExperimentMetric;
    startDate?: string;
    endDate?: string;
    winner?: string;
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
