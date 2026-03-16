import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import { STAT_STYLES } from '../../constants/statusColors';

// SVG Icons
const icons = {
    rocket: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
    clock: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    ),
    queue: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
    ),
    check: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    chart: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    ),
    settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    plus: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    arrowRight: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
    zap: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    ),
    target: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
};

// Mini sparkline component
const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 60;
    const height = 24;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width={width} height={height} className="ml-auto">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
};

const LaunchAutopilotDashboard: React.FC = () => {
    const { state } = useData();
    const { launchPlans, contentQueue, launchTemplates } = state;

    const activePlans = launchPlans.filter(p => p.status === 'active');
    const pendingApproval = contentQueue.filter(q => q.status === 'queued').length;
    const publishedToday = contentQueue.filter(q => {
        if (!q.publishedAt) return false;
        const today = new Date().toDateString();
        return new Date(q.publishedAt).toDateString() === today;
    }).length;

    // Mock sparkline data (would come from real analytics in production)
    const sparklineData = useMemo(() => ({
        launches: [2, 3, 2, 4, 3, 5, activePlans.length],
        pending: [8, 6, 7, 5, 4, 3, pendingApproval],
        queue: [12, 15, 18, 14, 16, 19, contentQueue.length],
        published: [1, 2, 1, 3, 2, 4, publishedToday],
    }), [activePlans.length, pendingApproval, contentQueue.length, publishedToday]);

    const stats = [
        {
            label: 'Active Launches',
            value: activePlans.length,
            icon: icons.rocket,
            gradient: STAT_STYLES.activeLaunches.gradient,
            sparkline: sparklineData.launches,
            color: STAT_STYLES.activeLaunches.color,
        },
        {
            label: 'Pending Approval',
            value: pendingApproval,
            icon: icons.clock,
            gradient: STAT_STYLES.pendingApproval.gradient,
            sparkline: sparklineData.pending,
            color: STAT_STYLES.pendingApproval.color,
        },
        {
            label: 'In Queue',
            value: contentQueue.length,
            icon: icons.queue,
            gradient: STAT_STYLES.inQueue.gradient,
            sparkline: sparklineData.queue,
            color: STAT_STYLES.inQueue.color,
        },
        {
            label: 'Published Today',
            value: publishedToday,
            icon: icons.check,
            gradient: STAT_STYLES.publishedToday.gradient,
            sparkline: sparklineData.published,
            color: STAT_STYLES.publishedToday.color,
        },
    ];

    const templateIcons: Record<string, React.ReactNode> = {
        'Product Hunt Launch': icons.rocket,
        'Feature Release': icons.zap,
        'Beta Launch': icons.target,
        'Content Campaign': icons.chart,
    };

    return (
        <div className="autopilot-dashboard">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-background">
                    <div className="hero-gradient" />
                    <div className="hero-pattern" />
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">
                            <span className="pulse-dot" />
                            Autopilot Active
                        </div>
                        <h1>Launch Autopilot</h1>
                        <p>Automate your product launches with AI-powered content generation and scheduling</p>
                    </div>
                    <div className="hero-actions">
                        <Link to="/autopilot/new" className="btn btn-primary btn-lg">
                            {icons.plus}
                            New Launch
                        </Link>
                        <Link to="/autopilot/queue" className="btn btn-glass">
                            {icons.queue}
                            Content Queue
                        </Link>
                    </div>
                </div>
            </div>

            <div className="quick-nav">
                <Link to="/autopilot/analytics" className="nav-chip">
                    {icons.chart}
                    <span>Analytics</span>
                </Link>
                <Link to="/autopilot/preferences" className="nav-chip">
                    {icons.settings}
                    <span>Preferences</span>
                </Link>
                <Link to="/autopilot/import" className="nav-chip">
                    {icons.plus}
                    <span>Import Plan</span>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon" style={{ background: stat.gradient }}>
                                {stat.icon}
                            </div>
                            <Sparkline data={stat.sparkline} color={stat.color} />
                        </div>
                        <div className="stat-body">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Templates - Now prominently displayed as horizontal grid */}
            <section className="templates-section">
                <div className="section-header">
                    <h2>Launch Templates</h2>
                    <span className="section-subtitle">Quick start with a pre-built template</span>
                </div>
                <div className="templates-grid">
                    {launchTemplates.slice(0, 4).map(template => (
                        <Link
                            key={template.id}
                            to={`/autopilot/new?template=${template.id}`}
                            className="template-card"
                        >
                            <div className="template-icon">
                                {templateIcons[template.name] || icons.target}
                            </div>
                            <div className="template-content">
                                <h4>{template.name}</h4>
                                <p>{template.description}</p>
                                <div className="template-meta">
                                    <span>{template.defaultPhases.length} phases</span>
                                    <span className="meta-dot">â€¢</span>
                                    <span>~{template.estimatedDuration} days</span>
                                </div>
                            </div>
                            <div className="template-arrow">{icons.arrowRight}</div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Active Launches - Now below templates */}
            <section className="launches-section">
                <div className="section-header">
                    <h2>Active Launches</h2>
                    <Link to="/autopilot/new" className="btn btn-ghost btn-sm">
                        View All {icons.arrowRight}
                    </Link>
                </div>

                {activePlans.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-illustration">
                            <div className="orbit-ring">
                                <div className="orbit-dot" />
                            </div>
                            <div className="empty-icon">{icons.rocket}</div>
                        </div>
                        <h3>No Active Launches</h3>
                        <p>Create your first automated product launch to get started</p>
                        <Link to="/autopilot/new" className="btn btn-primary">
                            {icons.plus} Create Launch Plan
                        </Link>
                    </div>
                ) : (
                    <div className="launches-grid">
                        {activePlans.map(plan => {
                            const completedPhases = plan.phases.filter(p => p.status === 'completed').length;
                            const progress = (completedPhases / plan.phases.length) * 100;

                            return (
                                <Link key={plan.id} to={`/autopilot/plans/${plan.id}`} className="launch-card">
                                    <div className="launch-card-header">
                                        <div className="launch-info">
                                            <h3>{plan.name}</h3>
                                            <p>{plan.productName}</p>
                                        </div>
                                        <span className={`status-pill ${plan.status}`}>
                                            <span className="status-dot" />
                                            {plan.status}
                                        </span>
                                    </div>

                                    <div className="launch-phases">
                                        {plan.phases.map((phase, idx) => (
                                            <div
                                                key={phase.id}
                                                className={`phase-pip ${phase.status}`}
                                                title={phase.name}
                                            >
                                                {idx + 1}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="launch-progress">
                                        <div className="progress-track">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <span className="progress-label">
                                            {completedPhases}/{plan.phases.length} phases complete
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default LaunchAutopilotDashboard;
