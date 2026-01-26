import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { LandingPage, HeroContent, FormContent, FormField } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const icons = {
    save: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    ),
    eye: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    back: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    trash: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
};

const defaultHeroContent: HeroContent = {
    headline: 'Your Amazing Product',
    subheadline: 'Describe your value proposition in one compelling sentence.',
    ctaText: 'Get Started',
    alignment: 'center',
};

const defaultFormContent: FormContent = {
    title: 'Start Your Free Trial',
    subtitle: 'No credit card required',
    fields: [
        { id: '1', type: 'email', label: 'Email Address', required: true },
    ],
    submitText: 'Get Started',
    successMessage: 'Thanks! Check your email.',
};

export default function LandingPageEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useData();

    const existingPage = id ? state.landingPages.find((p) => p.id === id) : null;

    const [page, setPage] = useState<LandingPage>(() => {
        if (existingPage) return existingPage;
        return {
            id: uuidv4(),
            title: 'New Landing Page',
            slug: 'new-page',
            status: 'draft',
            template: 'hero_simple',
            sections: [
                {
                    id: uuidv4(),
                    type: 'hero',
                    order: 0,
                    content: defaultHeroContent,
                },
                {
                    id: uuidv4(),
                    type: 'form',
                    order: 1,
                    content: defaultFormContent,
                },
            ],
            settings: {
                metaTitle: '',
                metaDescription: '',
            },
            analytics: {
                views: 0,
                uniqueVisitors: 0,
                formSubmissions: 0,
                conversionRate: 0,
                avgTimeOnPage: 0,
                bounceRate: 0,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    });

    const [activeTab, setActiveTab] = useState<'content' | 'settings' | 'preview'>('content');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (existingPage) {
            setPage(existingPage);
        }
    }, [existingPage]);

    const handleSave = () => {
        setIsSaving(true);
        const updatedPage = { ...page, updatedAt: new Date().toISOString() };

        if (existingPage) {
            dispatch({ type: 'UPDATE_LANDING_PAGE', payload: updatedPage });
        } else {
            dispatch({ type: 'ADD_LANDING_PAGE', payload: updatedPage });
        }

        setTimeout(() => {
            setIsSaving(false);
            if (!existingPage) {
                navigate(`/pages/${page.id}`);
            }
        }, 500);
    };

    const getHeroContent = (): HeroContent => {
        const section = page.sections.find(s => s.type === 'hero');
        return (section?.content as HeroContent) || defaultHeroContent;
    };

    const getFormContent = (): FormContent => {
        const section = page.sections.find(s => s.type === 'form');
        return (section?.content as FormContent) || defaultFormContent;
    };

    const updateHeroContent = (updates: Partial<HeroContent>) => {
        setPage(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.type === 'hero'
                    ? { ...s, content: { ...s.content as HeroContent, ...updates } }
                    : s
            ),
        }));
    };

    const updateFormContent = (updates: Partial<FormContent>) => {
        setPage(prev => ({
            ...prev,
            sections: prev.sections.map(s =>
                s.type === 'form'
                    ? { ...s, content: { ...s.content as FormContent, ...updates } }
                    : s
            ),
        }));
    };

    const addFormField = () => {
        const formContent = getFormContent();
        const newField: FormField = {
            id: uuidv4(),
            type: 'text',
            label: 'New Field',
            required: false,
        };
        updateFormContent({
            fields: [...formContent.fields, newField],
        });
    };

    const removeFormField = (fieldId: string) => {
        const formContent = getFormContent();
        updateFormContent({
            fields: formContent.fields.filter(f => f.id !== fieldId),
        });
    };

    const updateFormField = (fieldId: string, updates: Partial<FormField>) => {
        const formContent = getFormContent();
        updateFormContent({
            fields: formContent.fields.map(f =>
                f.id === fieldId ? { ...f, ...updates } : f
            ),
        });
    };

    const heroContent = getHeroContent();
    const formContent = getFormContent();

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/pages')}>
                        {icons.back}
                    </button>
                    <div>
                        <input
                            type="text"
                            value={page.title}
                            onChange={(e) => setPage(prev => ({ ...prev, title: e.target.value }))}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-text-primary)',
                                outline: 'none',
                                width: '100%',
                                maxWidth: '400px',
                            }}
                        />
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-muted text-sm">/</span>
                            <input
                                type="text"
                                value={page.slug}
                                onChange={(e) => setPage(prev => ({
                                    ...prev,
                                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                }))}
                                className="text-sm text-muted"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    width: '200px',
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <span className={`badge ${page.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                        {page.status}
                    </span>
                    <button className="btn btn-secondary" onClick={() => setActiveTab('preview')}>
                        {icons.eye}
                        Preview
                    </button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : icons.save}
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ maxWidth: '400px' }}>
                <button className={`tab ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
                    Content
                </button>
                <button className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    Settings
                </button>
                <button className={`tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>
                    Preview
                </button>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div className="grid grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                    {/* Hero Section Editor */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-6">Hero Section</h3>

                        <div className="input-group mb-4">
                            <label className="input-label">Headline</label>
                            <input
                                type="text"
                                className="input"
                                value={heroContent.headline}
                                onChange={(e) => updateHeroContent({ headline: e.target.value })}
                            />
                        </div>

                        <div className="input-group mb-4">
                            <label className="input-label">Subheadline</label>
                            <textarea
                                className="input"
                                value={heroContent.subheadline}
                                onChange={(e) => updateHeroContent({ subheadline: e.target.value })}
                                style={{ minHeight: '80px' }}
                            />
                        </div>

                        <div className="input-group mb-4">
                            <label className="input-label">CTA Button Text</label>
                            <input
                                type="text"
                                className="input"
                                value={heroContent.ctaText}
                                onChange={(e) => updateHeroContent({ ctaText: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Alignment</label>
                            <select
                                className="input"
                                value={heroContent.alignment}
                                onChange={(e) => updateHeroContent({ alignment: e.target.value as 'left' | 'center' | 'right' })}
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    </div>

                    {/* Form Section Editor */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-semibold">Lead Capture Form</h3>
                            <button className="btn btn-ghost btn-sm" onClick={addFormField}>
                                {icons.plus}
                                Add Field
                            </button>
                        </div>

                        <div className="input-group mb-4">
                            <label className="input-label">Form Title</label>
                            <input
                                type="text"
                                className="input"
                                value={formContent.title}
                                onChange={(e) => updateFormContent({ title: e.target.value })}
                            />
                        </div>

                        <div className="input-group mb-4">
                            <label className="input-label">Subtitle</label>
                            <input
                                type="text"
                                className="input"
                                value={formContent.subtitle || ''}
                                onChange={(e) => updateFormContent({ subtitle: e.target.value })}
                            />
                        </div>

                        <div className="input-group mb-4">
                            <label className="input-label">Form Fields</label>
                            <div className="flex flex-col gap-3">
                                {formContent.fields.map((field) => (
                                    <div
                                        key={field.id}
                                        className="card"
                                        style={{
                                            padding: 'var(--space-3)',
                                            background: 'var(--color-bg-tertiary)',
                                        }}
                                    >
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                className="input"
                                                style={{ flex: 1 }}
                                                value={field.label}
                                                onChange={(e) => updateFormField(field.id, { label: e.target.value })}
                                            />
                                            <select
                                                className="input"
                                                style={{ width: '120px' }}
                                                value={field.type}
                                                onChange={(e) => updateFormField(field.id, { type: e.target.value as FormField['type'] })}
                                            >
                                                <option value="text">Text</option>
                                                <option value="email">Email</option>
                                                <option value="phone">Phone</option>
                                                <option value="textarea">Textarea</option>
                                            </select>
                                            <label className="flex items-center gap-2 text-sm text-muted">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={(e) => updateFormField(field.id, { required: e.target.checked })}
                                                />
                                                Required
                                            </label>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                style={{ color: 'var(--color-error)' }}
                                                onClick={() => removeFormField(field.id)}
                                            >
                                                {icons.trash}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="input-group mb-4">
                            <label className="input-label">Submit Button Text</label>
                            <input
                                type="text"
                                className="input"
                                value={formContent.submitText}
                                onChange={(e) => updateFormContent({ submitText: e.target.value })}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Success Message</label>
                            <input
                                type="text"
                                className="input"
                                value={formContent.successMessage}
                                onChange={(e) => updateFormContent({ successMessage: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="card" style={{ padding: 'var(--space-6)', maxWidth: '600px' }}>
                    <h3 className="font-semibold mb-6">SEO & Settings</h3>

                    <div className="input-group mb-4">
                        <label className="input-label">Meta Title</label>
                        <input
                            type="text"
                            className="input"
                            value={page.settings.metaTitle}
                            onChange={(e) => setPage(prev => ({
                                ...prev,
                                settings: { ...prev.settings, metaTitle: e.target.value }
                            }))}
                            placeholder={page.title}
                        />
                    </div>

                    <div className="input-group mb-4">
                        <label className="input-label">Meta Description</label>
                        <textarea
                            className="input"
                            value={page.settings.metaDescription}
                            onChange={(e) => setPage(prev => ({
                                ...prev,
                                settings: { ...prev.settings, metaDescription: e.target.value }
                            }))}
                            style={{ minHeight: '100px' }}
                            placeholder="Describe your page for search engines..."
                        />
                    </div>

                    <div className="input-group mb-6">
                        <label className="input-label">Custom CSS</label>
                        <textarea
                            className="input"
                            value={page.settings.customCss || ''}
                            onChange={(e) => setPage(prev => ({
                                ...prev,
                                settings: { ...prev.settings, customCss: e.target.value }
                            }))}
                            style={{ minHeight: '120px', fontFamily: 'var(--font-mono)' }}
                            placeholder="/* Add custom styles */"
                        />
                    </div>

                    <div className="divider" />

                    <h3 className="font-semibold mb-4 mt-6">Publishing</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Page Status</p>
                            <p className="text-sm text-muted">Make this page publicly accessible</p>
                        </div>
                        <button
                            className={`toggle ${page.status === 'published' ? 'active' : ''}`}
                            onClick={() => setPage(prev => ({
                                ...prev,
                                status: prev.status === 'published' ? 'draft' : 'published',
                                publishedAt: prev.status === 'published' ? undefined : new Date().toISOString(),
                            }))}
                        />
                    </div>
                </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
                <div
                    className="card"
                    style={{
                        padding: 0,
                        overflow: 'hidden',
                        background: 'white',
                        color: '#1a1a2e',
                    }}
                >
                    {/* Hero Preview */}
                    <div
                        style={{
                            padding: 'var(--space-16) var(--space-8)',
                            textAlign: heroContent.alignment,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                        }}
                    >
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: 'var(--space-4)' }}>
                            {heroContent.headline}
                        </h1>
                        <p style={{ fontSize: '1.25rem', opacity: 0.9, maxWidth: '600px', margin: heroContent.alignment === 'center' ? '0 auto' : 0, marginBottom: 'var(--space-8)' }}>
                            {heroContent.subheadline}
                        </p>
                        <button
                            style={{
                                padding: 'var(--space-4) var(--space-8)',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                background: 'white',
                                color: '#667eea',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                cursor: 'pointer',
                            }}
                        >
                            {heroContent.ctaText}
                        </button>
                    </div>

                    {/* Form Preview */}
                    <div
                        style={{
                            padding: 'var(--space-12) var(--space-8)',
                            maxWidth: '500px',
                            margin: '0 auto',
                        }}
                    >
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', textAlign: 'center', marginBottom: 'var(--space-2)', color: '#1a1a2e' }}>
                            {formContent.title}
                        </h2>
                        {formContent.subtitle && (
                            <p style={{ textAlign: 'center', color: '#666', marginBottom: 'var(--space-6)' }}>
                                {formContent.subtitle}
                            </p>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {formContent.fields.map((field) => (
                                <div key={field.id}>
                                    <label style={{ display: 'block', marginBottom: 'var(--space-1)', fontWeight: '500', color: '#333' }}>
                                        {field.label} {field.required && <span style={{ color: '#ef4444' }}>*</span>}
                                    </label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                            style={{
                                                width: '100%',
                                                padding: 'var(--space-3)',
                                                border: '1px solid #ddd',
                                                borderRadius: 'var(--radius-md)',
                                                fontSize: '1rem',
                                                minHeight: '100px',
                                            }}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                                            style={{
                                                width: '100%',
                                                padding: 'var(--space-3)',
                                                border: '1px solid #ddd',
                                                borderRadius: 'var(--radius-md)',
                                                fontSize: '1rem',
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                            <button
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-4)',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-lg)',
                                    cursor: 'pointer',
                                    marginTop: 'var(--space-2)',
                                }}
                            >
                                {formContent.submitText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
