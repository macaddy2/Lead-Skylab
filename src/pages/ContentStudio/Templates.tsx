import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { ContentPlatform } from '../../types';

const icons = {
    back: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    copy: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    ),
};

const platformLabels: Record<ContentPlatform | 'all', string> = {
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    reddit: 'Reddit',
    facebook: 'Facebook',
    email: 'Email',
    all: 'All Platforms',
};

const categoryLabels: Record<string, string> = {
    social: 'Social Media',
    email: 'Email',
    ad: 'Ads',
    blog: 'Blog',
};

export default function Templates() {
    const navigate = useNavigate();
    const { state } = useData();
    const { contentTemplates } = state;

    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterPlatform, setFilterPlatform] = useState<string>('all');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const categories = ['all', ...Array.from(new Set(contentTemplates.map(t => t.category)))];
    const platforms = ['all', ...Array.from(new Set(contentTemplates.map(t => t.platform)))];

    const filteredTemplates = contentTemplates.filter(template => {
        const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
        const matchesPlatform = filterPlatform === 'all' || template.platform === filterPlatform || template.platform === 'all';
        return matchesCategory && matchesPlatform;
    });

    const selectedTemplateData = contentTemplates.find(t => t.id === selectedTemplate);

    const copyExample = () => {
        if (selectedTemplateData) {
            navigator.clipboard.writeText(selectedTemplateData.example);
        }
    };

    const useTemplate = () => {
        if (selectedTemplateData) {
            navigate(`/content/generate?template=${selectedTemplateData.id}`);
        }
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
                            Content Templates
                        </h1>
                        <p className="text-muted">Browse and use proven content templates</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6" style={{ padding: 'var(--space-4)' }}>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">Category:</span>
                        <div className="flex gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`btn btn-sm ${filterCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setFilterCategory(cat)}
                                    style={{ textTransform: 'capitalize' }}
                                >
                                    {cat === 'all' ? 'All' : categoryLabels[cat] || cat}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted">Platform:</span>
                        <div className="flex gap-2">
                            {platforms.map((p) => (
                                <button
                                    key={p}
                                    className={`btn btn-sm ${filterPlatform === p ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setFilterPlatform(p)}
                                >
                                    {p === 'all' ? 'All' : platformLabels[p as ContentPlatform] || p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                {/* Templates List */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-semibold">Available Templates ({filteredTemplates.length})</h3>

                    {filteredTemplates.length === 0 ? (
                        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                            <p className="text-muted">No templates match your filters</p>
                        </div>
                    ) : (
                        filteredTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="card"
                                style={{
                                    padding: 'var(--space-4)',
                                    cursor: 'pointer',
                                    borderColor: selectedTemplate === template.id ? 'var(--color-primary)' : undefined,
                                    background: selectedTemplate === template.id ? 'rgba(99, 102, 241, 0.1)' : undefined,
                                }}
                                onClick={() => setSelectedTemplate(template.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{template.name}</span>
                                    <span className="badge badge-info">
                                        {platformLabels[template.platform as ContentPlatform] || template.platform}
                                    </span>
                                </div>
                                <p className="text-sm text-muted">{template.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="badge" style={{ textTransform: 'capitalize' }}>
                                        {categoryLabels[template.category] || template.category}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Template Preview */}
                <div className="flex flex-col gap-4">
                    <h3 className="font-semibold">Preview</h3>

                    {!selectedTemplateData ? (
                        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                            <p className="text-muted">Select a template to preview</p>
                        </div>
                    ) : (
                        <>
                            <div className="card" style={{ padding: 'var(--space-6)' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-semibold">{selectedTemplateData.name}</h4>
                                    <div className="flex gap-2">
                                        <button className="btn btn-ghost btn-sm" onClick={copyExample}>
                                            {icons.copy} Copy
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-muted mb-2">Template Structure:</p>
                                    <pre
                                        style={{
                                            background: 'var(--color-bg-tertiary)',
                                            padding: 'var(--space-4)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: 'var(--font-size-sm)',
                                            whiteSpace: 'pre-wrap',
                                            overflow: 'auto',
                                        }}
                                    >
                                        {selectedTemplateData.template}
                                    </pre>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm text-muted mb-2">Variables:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTemplateData.variables.map((v) => (
                                            <span key={v} className="badge badge-primary">
                                                {`{${v}}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="card" style={{ padding: 'var(--space-6)' }}>
                                <p className="text-sm text-muted mb-2">Example Output:</p>
                                <div
                                    style={{
                                        background: 'var(--color-bg-tertiary)',
                                        padding: 'var(--space-4)',
                                        borderRadius: 'var(--radius-md)',
                                        whiteSpace: 'pre-wrap',
                                    }}
                                >
                                    {selectedTemplateData.example}
                                </div>
                            </div>

                            <button className="btn btn-primary" onClick={useTemplate}>
                                Use This Template
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
