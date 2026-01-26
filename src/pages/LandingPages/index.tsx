import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';

const icons = {
    plus: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    eye: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    edit: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    copy: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
    ),
    trash: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    externalLink: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    ),
};

export default function LandingPages() {
    const { state, dispatch } = useData();
    const { landingPages } = state;
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

    const filteredPages = landingPages.filter((page) => {
        if (filter === 'all') return true;
        return page.status === filter;
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this landing page?')) {
            dispatch({ type: 'DELETE_LANDING_PAGE', payload: id });
        }
    };

    const handleDuplicate = (page: typeof landingPages[0]) => {
        const newPage = {
            ...page,
            id: crypto.randomUUID(),
            title: `${page.title} (Copy)`,
            slug: `${page.slug}-copy`,
            status: 'draft' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: undefined,
            analytics: {
                views: 0,
                uniqueVisitors: 0,
                formSubmissions: 0,
                conversionRate: 0,
                avgTimeOnPage: 0,
                bounceRate: 0,
            },
        };
        dispatch({ type: 'ADD_LANDING_PAGE', payload: newPage });
    };

    const togglePublish = (page: typeof landingPages[0]) => {
        const updatedPage = {
            ...page,
            status: page.status === 'published' ? 'draft' as const : 'published' as const,
            publishedAt: page.status === 'published' ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        dispatch({ type: 'UPDATE_LANDING_PAGE', payload: updatedPage });
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Landing Pages</h1>
                    <p className="page-subtitle">Create and manage high-converting landing pages</p>
                </div>
                <Link to="/pages/new" className="btn btn-primary">
                    {icons.plus}
                    New Landing Page
                </Link>
            </div>

            {/* Filters */}
            <div className="tabs" style={{ maxWidth: '400px' }}>
                <button
                    className={`tab ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    All ({landingPages.length})
                </button>
                <button
                    className={`tab ${filter === 'published' ? 'active' : ''}`}
                    onClick={() => setFilter('published')}
                >
                    Published ({landingPages.filter(p => p.status === 'published').length})
                </button>
                <button
                    className={`tab ${filter === 'draft' ? 'active' : ''}`}
                    onClick={() => setFilter('draft')}
                >
                    Drafts ({landingPages.filter(p => p.status === 'draft').length})
                </button>
            </div>

            {/* Pages Grid */}
            {filteredPages.length > 0 ? (
                <div className="grid grid-cols-3">
                    {filteredPages.map((page) => (
                        <div key={page.id} className="card" style={{ overflow: 'hidden' }}>
                            {/* Preview Banner */}
                            <div
                                style={{
                                    height: '120px',
                                    background: page.status === 'published'
                                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
                                        : 'var(--color-bg-tertiary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderBottom: '1px solid var(--glass-border)',
                                    position: 'relative',
                                }}
                            >
                                <span style={{ fontSize: '3rem', opacity: 0.3 }}>📄</span>
                                <span
                                    className={`badge ${page.status === 'published' ? 'badge-success' : 'badge-warning'}`}
                                    style={{ position: 'absolute', top: 'var(--space-3)', right: 'var(--space-3)' }}
                                >
                                    {page.status}
                                </span>
                            </div>

                            {/* Content */}
                            <div style={{ padding: 'var(--space-5)' }}>
                                <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>
                                    {page.title}
                                </h3>
                                <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                                    /{page.slug}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3" style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold">{page.analytics.views.toLocaleString()}</div>
                                        <div className="text-xs text-muted">Views</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold">{page.analytics.formSubmissions}</div>
                                        <div className="text-xs text-muted">Signups</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-semibold text-success">{page.analytics.conversionRate.toFixed(1)}%</div>
                                        <div className="text-xs text-muted">CVR</div>
                                    </div>
                                </div>

                                <p className="text-xs text-muted" style={{ marginBottom: 'var(--space-4)' }}>
                                    Updated {formatDate(page.updatedAt)}
                                </p>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link to={`/pages/${page.id}`} className="btn btn-secondary btn-sm flex-1">
                                        {icons.edit}
                                        Edit
                                    </Link>
                                    <button
                                        className={`btn btn-sm ${page.status === 'published' ? 'btn-ghost' : 'btn-primary'}`}
                                        style={{ flex: 1 }}
                                        onClick={() => togglePublish(page)}
                                    >
                                        {page.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </button>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    {page.status === 'published' && (
                                        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>
                                            {icons.externalLink}
                                            View
                                        </button>
                                    )}
                                    <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => handleDuplicate(page)}>
                                        {icons.copy}
                                        Copy
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ color: 'var(--color-error)' }}
                                        onClick={() => handleDelete(page.id)}
                                    >
                                        {icons.trash}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card empty-state">
                    <div className="empty-state-icon">📄</div>
                    <h3 className="empty-state-title">No landing pages yet</h3>
                    <p className="empty-state-description">
                        Create your first landing page to start capturing leads and validating your product.
                    </p>
                    <Link to="/pages/new" className="btn btn-primary">
                        {icons.plus}
                        Create Landing Page
                    </Link>
                </div>
            )}
        </div>
    );
}
