import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { ContentPiece, ContentPlatform } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const icons = {
    edit: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    twitter: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    linkedin: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    ),
    instagram: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    ),
    tiktok: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
        </svg>
    ),
    reddit: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
    ),
    email: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    facebook: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    ),
    plus: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    sparkle: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <circle cx="12" cy="12" r="4" />
        </svg>
    ),
    calendar: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
};

const platformIcons: Record<ContentPlatform, React.ReactNode> = {
    twitter: icons.twitter,
    linkedin: icons.linkedin,
    instagram: icons.instagram,
    tiktok: icons.tiktok,
    reddit: icons.reddit,
    facebook: icons.facebook,
    email: icons.email,
};

const platformColors: Record<ContentPlatform, string> = {
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
    instagram: '#E4405F',
    tiktok: '#000000',
    reddit: '#FF4500',
    facebook: '#1877F2',
    email: '#6366f1',
};

const statusColors: Record<string, string> = {
    draft: 'badge-warning',
    review: 'badge-info',
    approved: 'badge-success',
    scheduled: 'badge-primary',
    published: 'badge-success',
    rejected: 'badge-error',
};

export default function ContentStudio() {
    const { state, dispatch } = useData();
    const { contentPieces, contentCampaigns, productProfile, contentTemplates } = state;
    const [showQuickGenerate, setShowQuickGenerate] = useState(false);
    const [quickPlatform, setQuickPlatform] = useState<ContentPlatform>('twitter');
    const [quickContent, setQuickContent] = useState('');

    const stats = {
        total: contentPieces.length,
        drafts: contentPieces.filter(c => c.status === 'draft').length,
        scheduled: contentPieces.filter(c => c.status === 'scheduled').length,
        published: contentPieces.filter(c => c.status === 'published').length,
    };

    const handleQuickGenerate = () => {
        if (!quickContent.trim()) return;

        const newContent: ContentPiece = {
            id: uuidv4(),
            title: quickContent.slice(0, 50) + (quickContent.length > 50 ? '...' : ''),
            content: quickContent,
            platform: quickPlatform,
            status: 'draft',
            tone: 'professional',
            hashtags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_CONTENT', payload: newContent });
        setQuickContent('');
        setShowQuickGenerate(false);
    };

    const handleDeleteContent = (id: string) => {
        dispatch({ type: 'DELETE_CONTENT', payload: id });
    };

    const handleUpdateStatus = (piece: ContentPiece, newStatus: ContentPiece['status']) => {
        dispatch({
            type: 'UPDATE_CONTENT',
            payload: { ...piece, status: newStatus, updatedAt: new Date().toISOString() },
        });
    };

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Content Studio</h1>
                    <p className="page-subtitle">Generate and manage AI-powered marketing content</p>
                </div>
                <div className="flex gap-3">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowQuickGenerate(!showQuickGenerate)}
                    >
                        {icons.plus} Quick Create
                    </button>
                    <Link to="/content/generate" className="btn btn-primary">
                        {icons.sparkle} Generate Content
                    </Link>
                </div>
            </div>

            {/* Quick Generate Panel */}
            {showQuickGenerate && (
                <div className="card mb-6" style={{ padding: 'var(--space-6)' }}>
                    <h3 className="font-semibold mb-4">Quick Create Content</h3>
                    <div className="flex gap-4 mb-4">
                        {(Object.keys(platformIcons) as ContentPlatform[]).map((platform) => (
                            <button
                                key={platform}
                                className={`btn btn-sm ${quickPlatform === platform ? 'btn-primary' : 'btn-ghost'}`}
                                onClick={() => setQuickPlatform(platform)}
                                style={{
                                    color: quickPlatform === platform ? '#fff' : platformColors[platform],
                                    borderColor: platformColors[platform],
                                }}
                            >
                                {platformIcons[platform]}
                                <span className="ml-2" style={{ textTransform: 'capitalize' }}>{platform}</span>
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="input mb-4"
                        rows={4}
                        placeholder="Write your content here..."
                        value={quickContent}
                        onChange={(e) => setQuickContent(e.target.value)}
                    />
                    <div className="flex gap-3">
                        <button className="btn btn-primary" onClick={handleQuickGenerate}>
                            Save as Draft
                        </button>
                        <button className="btn btn-ghost" onClick={() => setShowQuickGenerate(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-4 mb-6">
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Total Content</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Drafts</p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--color-warning)' }}>{stats.drafts}</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Scheduled</p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>{stats.scheduled}</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Published</p>
                    <p className="text-3xl font-bold" style={{ color: 'var(--color-success)' }}>{stats.published}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 mb-6">
                <Link to="/content/analyze" className="card" style={{ padding: 'var(--space-6)', textDecoration: 'none' }}>
                    <div className="flex items-center gap-4">
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {icons.sparkle}
                        </div>
                        <div>
                            <h3 className="font-semibold">Product Analyzer</h3>
                            <p className="text-sm text-muted">
                                {productProfile ? 'Profile configured' : 'Set up your product profile'}
                            </p>
                        </div>
                    </div>
                </Link>

                <Link to="/content/campaigns" className="card" style={{ padding: 'var(--space-6)', textDecoration: 'none' }}>
                    <div className="flex items-center gap-4">
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {icons.calendar}
                        </div>
                        <div>
                            <h3 className="font-semibold">Campaigns</h3>
                            <p className="text-sm text-muted">{contentCampaigns.length} active campaigns</p>
                        </div>
                    </div>
                </Link>

                <Link to="/content/templates" className="card" style={{ padding: 'var(--space-6)', textDecoration: 'none' }}>
                    <div className="flex items-center gap-4">
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 'var(--radius-lg)',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {icons.edit}
                        </div>
                        <div>
                            <h3 className="font-semibold">Templates</h3>
                            <p className="text-sm text-muted">{contentTemplates.length} templates available</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Content List */}
            <div className="card" style={{ padding: 'var(--space-6)' }}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Recent Content</h3>
                    <Link to="/content/generate" className="btn btn-ghost btn-sm">
                        View All →
                    </Link>
                </div>

                {contentPieces.length === 0 ? (
                    <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>✨</div>
                        <h3>No content yet</h3>
                        <p className="text-muted mb-4">Start generating AI-powered content for your marketing</p>
                        <Link to="/content/generate" className="btn btn-primary">
                            {icons.sparkle} Generate Your First Content
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {contentPieces.slice(0, 5).map((piece) => (
                            <div
                                key={piece.id}
                                className="card"
                                style={{
                                    padding: 'var(--space-4)',
                                    background: 'var(--color-bg-tertiary)',
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 'var(--radius-md)',
                                            background: platformColors[piece.platform],
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {platformIcons[piece.platform]}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{piece.title}</span>
                                            <span className={`badge ${statusColors[piece.status]}`}>
                                                {piece.status}
                                            </span>
                                        </div>
                                        <p
                                            className="text-sm text-muted"
                                            style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {piece.content}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        {piece.status === 'draft' && (
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleUpdateStatus(piece, 'review')}
                                            >
                                                Send to Review
                                            </button>
                                        )}
                                        {piece.status === 'review' && (
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleUpdateStatus(piece, 'approved')}
                                            >
                                                Approve
                                            </button>
                                        )}
                                        <button
                                            className="btn btn-ghost btn-sm btn-icon"
                                            onClick={() => handleDeleteContent(piece.id)}
                                            style={{ color: 'var(--color-error)' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
