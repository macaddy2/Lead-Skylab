import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { ProductProfile, ContentTone } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const icons = {
    back: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    sparkle: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <circle cx="12" cy="12" r="4" />
        </svg>
    ),
    check: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
};

const tones: { value: ContentTone; label: string; description: string }[] = [
    { value: 'professional', label: 'Professional', description: 'Formal and business-like' },
    { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
    { value: 'bold', label: 'Bold', description: 'Confident and attention-grabbing' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'witty', label: 'Witty', description: 'Clever and humorous' },
];

export default function ProductAnalyzer() {
    const navigate = useNavigate();
    const { state, dispatch } = useData();
    const existingProfile = state.productProfile;

    const [formData, setFormData] = useState<Partial<ProductProfile>>({
        name: existingProfile?.name || '',
        url: existingProfile?.url || '',
        description: existingProfile?.description || '',
        valueProps: existingProfile?.valueProps || [''],
        targetAudience: existingProfile?.targetAudience || '',
        keywords: existingProfile?.keywords || [],
        tone: existingProfile?.tone || 'professional',
        competitors: existingProfile?.competitors || [''],
    });
    const [keywordInput, setKeywordInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzed, setAnalyzed] = useState(!!existingProfile);

    const handleValuePropChange = (index: number, value: string) => {
        const newProps = [...(formData.valueProps || [])];
        newProps[index] = value;
        setFormData({ ...formData, valueProps: newProps });
    };

    const addValueProp = () => {
        setFormData({ ...formData, valueProps: [...(formData.valueProps || []), ''] });
    };

    const removeValueProp = (index: number) => {
        const newProps = (formData.valueProps || []).filter((_, i) => i !== index);
        setFormData({ ...formData, valueProps: newProps });
    };

    const handleCompetitorChange = (index: number, value: string) => {
        const newCompetitors = [...(formData.competitors || [])];
        newCompetitors[index] = value;
        setFormData({ ...formData, competitors: newCompetitors });
    };

    const addCompetitor = () => {
        setFormData({ ...formData, competitors: [...(formData.competitors || []), ''] });
    };

    const removeCompetitor = (index: number) => {
        const newCompetitors = (formData.competitors || []).filter((_, i) => i !== index);
        setFormData({ ...formData, competitors: newCompetitors });
    };

    const addKeyword = () => {
        if (keywordInput.trim() && !(formData.keywords || []).includes(keywordInput.trim())) {
            setFormData({ ...formData, keywords: [...(formData.keywords || []), keywordInput.trim()] });
            setKeywordInput('');
        }
    };

    const removeKeyword = (keyword: string) => {
        setFormData({
            ...formData,
            keywords: (formData.keywords || []).filter(k => k !== keyword),
        });
    };

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        // Simulate AI analysis
        setTimeout(() => {
            setIsAnalyzing(false);
            setAnalyzed(true);
            // Add some auto-generated keywords if URL provided
            if (formData.url && (formData.keywords || []).length === 0) {
                setFormData({
                    ...formData,
                    keywords: ['startup', 'saas', 'productivity', 'growth', 'automation'],
                });
            }
        }, 2000);
    };

    const handleSave = () => {
        const profile: ProductProfile = {
            id: existingProfile?.id || uuidv4(),
            name: formData.name || '',
            url: formData.url,
            description: formData.description || '',
            valueProps: (formData.valueProps || []).filter(Boolean),
            targetAudience: formData.targetAudience || '',
            keywords: formData.keywords || [],
            tone: formData.tone || 'professional',
            competitors: (formData.competitors || []).filter(Boolean),
            createdAt: existingProfile?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        dispatch({ type: 'SET_PRODUCT_PROFILE', payload: profile });
        navigate('/content');
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/content')}>
                        {icons.back}
                    </button>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                            Product Analyzer
                        </h1>
                        <p className="text-muted">Configure your product profile for AI content generation</p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    {icons.check} Save Profile
                </button>
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                {/* Left Column - Product Details */}
                <div className="flex flex-col gap-6">
                    {/* Basic Info */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Product Information</h3>

                        <div className="form-group mb-4">
                            <label className="form-label">Product Name *</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Lead Skylab"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group mb-4">
                            <label className="form-label">Product URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="url"
                                    className="input"
                                    style={{ flex: 1 }}
                                    placeholder="https://yourproduct.com"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? 'Analyzing...' : icons.sparkle}
                                    {!isAnalyzing && ' Analyze'}
                                </button>
                            </div>
                            <p className="text-xs text-muted mt-1">
                                Enter your URL and click Analyze to auto-extract product info
                            </p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Product Description *</label>
                            <textarea
                                className="input"
                                rows={4}
                                placeholder="Describe what your product does and who it's for..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Value Propositions */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Value Propositions</h3>
                        <p className="text-sm text-muted mb-4">
                            List the main benefits your product provides
                        </p>

                        {(formData.valueProps || []).map((prop, index) => (
                            <div key={index} className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="input"
                                    style={{ flex: 1 }}
                                    placeholder={`Value prop ${index + 1}`}
                                    value={prop}
                                    onChange={(e) => handleValuePropChange(index, e.target.value)}
                                />
                                {(formData.valueProps || []).length > 1 && (
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => removeValueProp(index)}
                                        style={{ color: 'var(--color-error)' }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={addValueProp}>
                            + Add Value Proposition
                        </button>
                    </div>

                    {/* Competitors */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Competitors</h3>
                        <p className="text-sm text-muted mb-4">
                            List your main competitors (helps differentiate your content)
                        </p>

                        {(formData.competitors || []).map((competitor, index) => (
                            <div key={index} className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    className="input"
                                    style={{ flex: 1 }}
                                    placeholder={`Competitor ${index + 1}`}
                                    value={competitor}
                                    onChange={(e) => handleCompetitorChange(index, e.target.value)}
                                />
                                {(formData.competitors || []).length > 1 && (
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => removeCompetitor(index)}
                                        style={{ color: 'var(--color-error)' }}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button className="btn btn-ghost btn-sm" onClick={addCompetitor}>
                            + Add Competitor
                        </button>
                    </div>
                </div>

                {/* Right Column - Targeting */}
                <div className="flex flex-col gap-6">
                    {/* Target Audience */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Target Audience</h3>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="Describe your ideal customer (e.g., 'Startup founders building B2B SaaS products who want to validate product-market fit faster')"
                            value={formData.targetAudience}
                            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        />
                    </div>

                    {/* Keywords */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">SEO Keywords</h3>
                        <p className="text-sm text-muted mb-4">
                            Keywords to include in your content for SEO
                        </p>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                className="input"
                                style={{ flex: 1 }}
                                placeholder="Add keyword"
                                value={keywordInput}
                                onChange={(e) => setKeywordInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                            />
                            <button className="btn btn-secondary" onClick={addKeyword}>
                                Add
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(formData.keywords || []).map((keyword) => (
                                <span key={keyword} className="badge badge-primary" style={{ cursor: 'pointer' }}>
                                    {keyword}
                                    <button
                                        onClick={() => removeKeyword(keyword)}
                                        style={{ marginLeft: 4, background: 'none', border: 'none', cursor: 'pointer' }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>

                        {analyzed && (formData.keywords || []).length === 0 && (
                            <p className="text-xs text-muted mt-4">
                                💡 Tip: Click "Analyze" to auto-generate keywords from your URL
                            </p>
                        )}
                    </div>

                    {/* Content Tone */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Content Tone</h3>
                        <p className="text-sm text-muted mb-4">
                            Choose the default tone for your generated content
                        </p>

                        <div className="flex flex-col gap-3">
                            {tones.map((tone) => (
                                <label
                                    key={tone.value}
                                    className="card"
                                    style={{
                                        padding: 'var(--space-4)',
                                        cursor: 'pointer',
                                        background: formData.tone === tone.value ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                                        borderColor: formData.tone === tone.value ? 'var(--color-primary)' : undefined,
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="tone"
                                            value={tone.value}
                                            checked={formData.tone === tone.value}
                                            onChange={() => setFormData({ ...formData, tone: tone.value })}
                                            style={{ display: 'none' }}
                                        />
                                        <div>
                                            <span className="font-medium">{tone.label}</span>
                                            <p className="text-sm text-muted">{tone.description}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
