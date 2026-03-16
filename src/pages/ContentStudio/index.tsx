import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { ContentPiece, ContentPlatform } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// SVG Icons
const icons = {
    edit: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
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
    arrowRight: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    trash: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    check: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    send: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
    tiktok: '#00f2ea',
    reddit: '#FF4500',
    facebook: '#1877F2',
    email: '#6366f1',
};

const platformNames: Record<ContentPlatform, string> = {
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    reddit: 'Reddit',
    facebook: 'Facebook',
    email: 'Email',
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    draft: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', label: 'Draft' },
    review: { color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', label: 'In Review' },
    approved: { color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', label: 'Approved' },
    scheduled: { color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)', label: 'Scheduled' },
    published: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', label: 'Published' },
    rejected: { color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', label: 'Rejected' },
};

// Platform distribution chart
const PlatformRing: React.FC<{ data: Record<ContentPlatform, number> }> = ({ data }) => {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    if (total === 0) return null;

    const platforms = Object.entries(data).filter(([, count]) => count > 0) as [ContentPlatform, number][];
    let currentAngle = 0;

    return (
        <div className="platform-ring-container">
            <svg viewBox="0 0 100 100" className="platform-ring">
                {platforms.map(([platform, count]) => {
                    const percentage = count / total;
                    const angle = percentage * 360;
                    const startAngle = currentAngle;
                    currentAngle += angle;

                    const startRad = (startAngle - 90) * (Math.PI / 180);
                    const endRad = (startAngle + angle - 90) * (Math.PI / 180);

                    const x1 = 50 + 40 * Math.cos(startRad);
                    const y1 = 50 + 40 * Math.sin(startRad);
                    const x2 = 50 + 40 * Math.cos(endRad);
                    const y2 = 50 + 40 * Math.sin(endRad);

                    const largeArc = angle > 180 ? 1 : 0;

                    return (
                        <path
                            key={platform}
                            d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                            fill={platformColors[platform]}
                            opacity={0.9}
                        />
                    );
                })}
                <circle cx="50" cy="50" r="28" fill="var(--color-bg-secondary)" />
            </svg>
            <div className="ring-center">
                <span className="ring-total">{total}</span>
                <span className="ring-label">Total</span>
            </div>
        </div>
    );
};

export default function ContentStudio() {
    const { state, dispatch } = useData();
    const { contentPieces, contentCampaigns, productProfile, contentTemplates } = state;
    const [showQuickCreate, setShowQuickCreate] = useState(false);
    const [quickPlatform, setQuickPlatform] = useState<ContentPlatform>('twitter');
    const [quickContent, setQuickContent] = useState('');

    const stats = useMemo(() => ({
        total: contentPieces.length,
        drafts: contentPieces.filter(c => c.status === 'draft').length,
        scheduled: contentPieces.filter(c => c.status === 'scheduled').length,
        published: contentPieces.filter(c => c.status === 'published').length,
    }), [contentPieces]);

    const platformDistribution = useMemo(() => {
        const dist: Record<ContentPlatform, number> = {
            twitter: 0, linkedin: 0, instagram: 0,
            tiktok: 0, reddit: 0, facebook: 0, email: 0
        };
        contentPieces.forEach(p => { dist[p.platform]++; });
        return dist;
    }, [contentPieces]);

    const handleQuickCreate = () => {
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
        setShowQuickCreate(false);
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
        <div className="content-studio">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-background">
                    <div className="hero-gradient" />
                    <div className="floating-icons">
                        {Object.entries(platformIcons).map(([platform, icon], idx) => (
                            <div
                                key={platform}
                                className="floating-icon"
                                style={{
                                    '--delay': `${idx * 0.5}s`,
                                    '--color': platformColors[platform as ContentPlatform],
                                } as React.CSSProperties}
                            >
                                {icon}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">
                            {icons.sparkle}
                            AI-Powered
                        </div>
                        <h1>Content Studio</h1>
                        <p>Generate, manage, and publish AI-powered marketing content across all platforms</p>
                    </div>
                    <div className="hero-actions">
                        <Link to="/content/generate" className="btn btn-primary btn-lg">
                            {icons.sparkle}
                            Generate Content
                        </Link>
                        <button
                            className="btn btn-glass"
                            onClick={() => setShowQuickCreate(!showQuickCreate)}
                        >
                            {icons.plus}
                            Quick Create
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Create Modal */}
            {showQuickCreate && (
                <div className="quick-create-panel">
                    <div className="quick-create-header">
                        <h3>Quick Create</h3>
                        <button className="btn-close" onClick={() => setShowQuickCreate(false)}>Ã—</button>
                    </div>
                    <div className="platform-selector">
                        {(Object.keys(platformIcons) as ContentPlatform[]).map((platform) => (
                            <button
                                key={platform}
                                className={`platform-btn ${quickPlatform === platform ? 'active' : ''}`}
                                onClick={() => setQuickPlatform(platform)}
                                style={{ '--platform-color': platformColors[platform] } as React.CSSProperties}
                            >
                                {platformIcons[platform]}
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="quick-textarea"
                        rows={4}
                        placeholder={`Write your ${platformNames[quickPlatform]} content...`}
                        value={quickContent}
                        onChange={(e) => setQuickContent(e.target.value)}
                    />
                    <div className="quick-create-actions">
                        <button className="btn btn-primary" onClick={handleQuickCreate}>
                            Save as Draft
                        </button>
                        <span className="char-count">{quickContent.length} characters</span>
                    </div>
                </div>
            )}

            {/* Stats & Distribution */}
            <div className="stats-section">
                <div className="stats-grid">
                    <div className="stat-card stat-total">
                        <div className="stat-icon">{icons.edit}</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Content</span>
                        </div>
                    </div>
                    <div className="stat-card stat-drafts">
                        <div className="stat-icon">{icons.edit}</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.drafts}</span>
                            <span className="stat-label">Drafts</span>
                        </div>
                    </div>
                    <div className="stat-card stat-scheduled">
                        <div className="stat-icon">{icons.calendar}</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.scheduled}</span>
                            <span className="stat-label">Scheduled</span>
                        </div>
                    </div>
                    <div className="stat-card stat-published">
                        <div className="stat-icon">{icons.check}</div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.published}</span>
                            <span className="stat-label">Published</span>
                        </div>
                    </div>
                </div>

                <div className="distribution-card">
                    <h3>Platform Distribution</h3>
                    <div className="distribution-content">
                        <PlatformRing data={platformDistribution} />
                        <div className="platform-legend">
                            {Object.entries(platformDistribution)
                                .filter(([, count]) => count > 0)
                                .map(([platform, count]) => (
                                    <div key={platform} className="legend-item">
                                        <span
                                            className="legend-dot"
                                            style={{ background: platformColors[platform as ContentPlatform] }}
                                        />
                                        <span className="legend-platform">{platformNames[platform as ContentPlatform]}</span>
                                        <span className="legend-count">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Link to="/content/analyze" className="action-card">
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {icons.sparkle}
                    </div>
                    <div className="action-content">
                        <h4>Product Analyzer</h4>
                        <p>{productProfile ? 'Profile configured' : 'Set up your product'}</p>
                    </div>
                    <span className="action-arrow">{icons.arrowRight}</span>
                </Link>

                <Link to="/content/campaigns" className="action-card">
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #10b981, #14b8a6)' }}>
                        {icons.calendar}
                    </div>
                    <div className="action-content">
                        <h4>Campaigns</h4>
                        <p>{contentCampaigns.length} active campaigns</p>
                    </div>
                    <span className="action-arrow">{icons.arrowRight}</span>
                </Link>

                <Link to="/content/templates" className="action-card">
                    <div className="action-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                        {icons.edit}
                    </div>
                    <div className="action-content">
                        <h4>Templates</h4>
                        <p>{contentTemplates.length} templates</p>
                    </div>
                    <span className="action-arrow">{icons.arrowRight}</span>
                </Link>
            </div>

            {/* Content Grid */}
            <div className="content-section">
                <div className="section-header">
                    <h2>Recent Content</h2>
                    <Link to="/content/generate" className="btn btn-ghost btn-sm">
                        View All {icons.arrowRight}
                    </Link>
                </div>

                {contentPieces.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-illustration">
                            <div className="empty-sparkles">
                                <span className="sparkle s1">âœ¦</span>
                                <span className="sparkle s2">âœ¦</span>
                                <span className="sparkle s3">âœ¦</span>
                            </div>
                            <div className="empty-icon">{icons.sparkle}</div>
                        </div>
                        <h3>No content yet</h3>
                        <p>Start generating AI-powered content for your marketing</p>
                        <Link to="/content/generate" className="btn btn-primary">
                            {icons.sparkle} Generate Your First Content
                        </Link>
                    </div>
                ) : (
                    <div className="content-grid">
                        {contentPieces.slice(0, 6).map((piece) => (
                            <div key={piece.id} className="content-card">
                                <div className="card-header">
                                    <div
                                        className="platform-badge"
                                        style={{ background: platformColors[piece.platform] }}
                                    >
                                        {platformIcons[piece.platform]}
                                    </div>
                                    <span
                                        className="status-badge"
                                        style={{
                                            color: statusConfig[piece.status].color,
                                            background: statusConfig[piece.status].bg
                                        }}
                                    >
                                        {statusConfig[piece.status].label}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <h4>{piece.title}</h4>
                                    <p>{piece.content.slice(0, 120)}{piece.content.length > 120 ? '...' : ''}</p>
                                </div>
                                <div className="card-footer">
                                    <div className="card-actions">
                                        {piece.status === 'draft' && (
                                            <button
                                                className="action-btn"
                                                onClick={() => handleUpdateStatus(piece, 'review')}
                                                title="Send to Review"
                                            >
                                                {icons.send}
                                            </button>
                                        )}
                                        {piece.status === 'review' && (
                                            <button
                                                className="action-btn success"
                                                onClick={() => handleUpdateStatus(piece, 'approved')}
                                                title="Approve"
                                            >
                                                {icons.check}
                                            </button>
                                        )}
                                        <button
                                            className="action-btn danger"
                                            onClick={() => handleDeleteContent(piece.id)}
                                            title="Delete"
                                        >
                                            {icons.trash}
                                        </button>
                                    </div>
                                    <span className="card-date">
                                        {new Date(piece.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

