// Audience Types

export interface Audience {
    id: string;
    name: string;
    description?: string;
    type: 'segment' | 'persona';
    criteria: AudienceCriteria[];
    size: number;
    createdAt: string;
    updatedAt: string;
}

export interface AudienceCriteria {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: string | number | string[];
}

export interface Persona {
    id: string;
    name: string;
    avatar?: string;
    description: string;
    demographics: {
        ageRange: string;
        location: string;
        industry: string;
        role: string;
    };
    painPoints: string[];
    goals: string[];
    channels: string[];
    quote: string;
}
