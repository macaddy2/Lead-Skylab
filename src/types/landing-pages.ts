// Landing Page Types

export interface LandingPage {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published' | 'archived';
    template: LandingPageTemplate;
    sections: LandingPageSection[];
    settings: LandingPageSettings;
    analytics: LandingPageAnalytics;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
}

export type LandingPageTemplate =
    | 'hero_simple'
    | 'hero_split'
    | 'features_grid'
    | 'testimonials'
    | 'pricing'
    | 'custom';

export interface LandingPageSection {
    id: string;
    type: 'hero' | 'features' | 'benefits' | 'testimonials' | 'cta' | 'form' | 'faq' | 'custom';
    order: number;
    content: HeroContent | FeaturesContent | TestimonialsContent | CTAContent | FormContent;
    styles?: Record<string, string>;
}

export interface HeroContent {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink?: string;
    image?: string;
    alignment: 'left' | 'center' | 'right';
}

export interface FeaturesContent {
    title: string;
    subtitle?: string;
    features: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
}

export interface TestimonialsContent {
    title: string;
    testimonials: Array<{
        quote: string;
        author: string;
        role: string;
        company: string;
        avatar?: string;
    }>;
}

export interface CTAContent {
    headline: string;
    subheadline?: string;
    buttonText: string;
    buttonLink?: string;
}

export interface FormContent {
    title: string;
    subtitle?: string;
    fields: FormField[];
    submitText: string;
    successMessage: string;
}

export interface FormField {
    id: string;
    type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[];
}

export interface LandingPageSettings {
    favicon?: string;
    ogImage?: string;
    metaTitle: string;
    metaDescription: string;
    customCss?: string;
    customJs?: string;
    trackingId?: string;
}

export interface LandingPageAnalytics {
    views: number;
    uniqueVisitors: number;
    formSubmissions: number;
    conversionRate: number;
    avgTimeOnPage: number;
    bounceRate: number;
}
