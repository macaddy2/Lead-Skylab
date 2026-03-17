// Survey Types

export interface Survey {
    id: string;
    title: string;
    description?: string;
    status: 'draft' | 'active' | 'closed';
    type: 'nps' | 'csat' | 'pmf' | 'custom';
    questions: SurveyQuestion[];
    settings: SurveySettings;
    responses: SurveyResponse[];
    createdAt: string;
    updatedAt: string;
}

export interface SurveyQuestion {
    id: string;
    type: 'nps' | 'rating' | 'multiple_choice' | 'single_choice' | 'open_ended' | 'scale';
    question: string;
    required: boolean;
    options?: string[];
    min?: number;
    max?: number;
    order: number;
}

export interface SurveySettings {
    showProgressBar: boolean;
    allowAnonymous: boolean;
    thankYouMessage: string;
    redirectUrl?: string;
}

export interface SurveyResponse {
    id: string;
    surveyId: string;
    respondentId?: string;
    respondentEmail?: string;
    answers: SurveyAnswer[];
    completedAt: string;
    metadata?: Record<string, unknown>;
}

export interface SurveyAnswer {
    questionId: string;
    value: string | number | string[];
}
