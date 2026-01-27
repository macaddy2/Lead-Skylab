import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';

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
        <svg width={width} height={height} style={{ marginLeft: 'auto' }}>
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
            gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            sparkline: sparklineData.launches,
            color: '#8b5cf6'
        },
        {
            label: 'Pending Approval',
            value: pendingApproval,
            icon: icons.clock,
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
            sparkline: sparklineData.pending,
            color: '#f59e0b'
        },
        {
            label: 'In Queue',
            value: contentQueue.length,
            icon: icons.queue,
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)',
            sparkline: sparklineData.queue,
            color: '#06b6d4'
        },
        {
            label: 'Published Today',
            value: publishedToday,
            icon: icons.check,
            gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            sparkline: sparklineData.published,
            color: '#10b981'
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

            {/* Quick Nav */}
            <div className="quick-nav">
                <Link to="/autopilot/analytics" className="nav-chip">
                    {icons.chart}
                    <span>Analytics</span>
                </Link>
                <Link to="/autopilot/preferences" className="nav-chip">
                    {icons.settings}
                    <span>Preferences</span>
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
                                    <span className="meta-dot">•</span>
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

            <style>{`
                .autopilot-dashboard {
                    min-height: 100vh;
                }

                /* Hero Section */
                .hero-section {
                    position: relative;
                    padding: var(--spacing-8) var(--spacing-6);
                    margin: calc(var(--spacing-6) * -1);
                    margin-bottom: var(--spacing-6);
                    overflow: hidden;
                }

                .hero-background {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                }

                .hero-gradient {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, 
                        rgba(99, 102, 241, 0.15) 0%, 
                        rgba(139, 92, 246, 0.1) 50%, 
                        rgba(6, 182, 212, 0.05) 100%
                    );
                }

                .hero-pattern {
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 24px 24px;
                }

                .hero-content {
                    position: relative;
                    z-index: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: 1400px;
                    margin: 0 auto;
                    gap: var(--spacing-6);
                    flex-wrap: wrap;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                    padding: var(--spacing-1) var(--spacing-3);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: var(--spacing-3);
                }

                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    background: #34d399;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }

                .hero-text h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin: 0 0 var(--spacing-2);
                    background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-text p {
                    color: var(--gray-400);
                    font-size: 1.1rem;
                    max-width: 500px;
                    margin: 0;
                }

                .hero-actions {
                    display: flex;
                    gap: var(--spacing-3);
                }

                .btn-lg {
                    padding: var(--spacing-3) var(--spacing-6);
                    font-size: 1rem;
                }

                .btn-glass {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: var(--gray-200);
                    padding: var(--spacing-3) var(--spacing-5);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    font-weight: 500;
                    transition: all 0.2s ease;
                    text-decoration: none;
                }

                .btn-glass:hover {
                    background: rgba(255,255,255,0.1);
                    border-color: rgba(255,255,255,0.2);
                }

                /* Quick Nav */
                .quick-nav {
                    display: flex;
                    gap: var(--spacing-2);
                    padding: 0 var(--spacing-6);
                    margin-bottom: var(--spacing-6);
                }

                .nav-chip {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: var(--spacing-2) var(--spacing-4);
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-full);
                    color: var(--gray-300);
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }

                .nav-chip:hover {
                    background: rgba(255,255,255,0.08);
                    color: var(--gray-100);
                }

                /* Stats Grid */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-4);
                    padding: 0 var(--spacing-6);
                    margin-bottom: var(--spacing-6);
                }

                .stat-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-5);
                    transition: all 0.3s ease;
                }

                .stat-card:hover {
                    border-color: rgba(255,255,255,0.15);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                }

                .stat-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: var(--spacing-4);
                }

                .stat-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--gray-100);
                    line-height: 1;
                }

                .stat-label {
                    color: var(--gray-400);
                    font-size: 0.875rem;
                    margin-top: var(--spacing-1);
                }

                /* Sections Layout */
                .templates-section,
                .launches-section {
                    padding: 0 var(--spacing-6);
                    margin-bottom: var(--spacing-6);
                }

                .section-subtitle {
                    color: var(--gray-500);
                    font-size: 0.875rem;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-4);
                }

                .section-header h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin: 0;
                }

                /* Empty State */
                .empty-state {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-10);
                    text-align: center;
                }

                .empty-illustration {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin: 0 auto var(--spacing-6);
                }

                .orbit-ring {
                    position: absolute;
                    inset: 0;
                    border: 2px dashed rgba(99, 102, 241, 0.3);
                    border-radius: 50%;
                    animation: spin 20s linear infinite;
                }

                .orbit-dot {
                    position: absolute;
                    top: -4px;
                    left: 50%;
                    width: 8px;
                    height: 8px;
                    background: #6366f1;
                    border-radius: 50%;
                    transform: translateX(-50%);
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .empty-icon {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--gray-400);
                }

                .empty-icon svg {
                    width: 32px;
                    height: 32px;
                }

                .empty-state h3 {
                    margin: 0 0 var(--spacing-2);
                    font-size: 1.25rem;
                }

                .empty-state p {
                    color: var(--gray-400);
                    margin: 0 0 var(--spacing-5);
                }

                /* Launch Cards */
                .launches-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                }

                .launch-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-5);
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                .launch-card:hover {
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.1);
                }

                .launch-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--spacing-4);
                }

                .launch-info h3 {
                    margin: 0 0 var(--spacing-1);
                    font-size: 1rem;
                    color: var(--gray-100);
                }

                .launch-info p {
                    margin: 0;
                    font-size: 0.875rem;
                    color: var(--gray-400);
                }

                .status-pill {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: var(--spacing-1) var(--spacing-3);
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .status-pill.active {
                    background: rgba(16, 185, 129, 0.15);
                    color: #34d399;
                }

                .status-pill.draft {
                    background: rgba(156, 163, 175, 0.15);
                    color: var(--gray-400);
                }

                .status-pill.paused {
                    background: rgba(245, 158, 11, 0.15);
                    color: #fbbf24;
                }

                .status-dot {
                    width: 6px;
                    height: 6px;
                    background: currentColor;
                    border-radius: 50%;
                }

                .launch-phases {
                    display: flex;
                    gap: var(--spacing-2);
                    margin-bottom: var(--spacing-4);
                }

                .phase-pip {
                    width: 28px;
                    height: 28px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }

                .phase-pip.completed {
                    background: rgba(16, 185, 129, 0.2);
                    color: #34d399;
                }

                .phase-pip.active {
                    background: rgba(99, 102, 241, 0.2);
                    color: #818cf8;
                    animation: phasePulse 2s infinite;
                }

                .phase-pip.pending {
                    background: rgba(156, 163, 175, 0.1);
                    color: var(--gray-500);
                }

                @keyframes phasePulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                    50% { box-shadow: 0 0 0 4px rgba(99, 102, 241, 0); }
                }

                .launch-progress {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .progress-track {
                    flex: 1;
                    height: 6px;
                    background: rgba(255,255,255,0.05);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #6366f1, #8b5cf6);
                    border-radius: var(--radius-full);
                    transition: width 0.5s ease;
                }

                .progress-label {
                    font-size: 0.75rem;
                    color: var(--gray-400);
                    white-space: nowrap;
                }

                /* Template Cards */
                .templates-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-4);
                }

                .template-card {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    border-radius: var(--radius-xl);
                    padding: var(--spacing-5);
                    text-decoration: none;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .template-card:hover {
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.15);
                }

                .template-card:hover .template-arrow {
                    opacity: 1;
                    transform: translate(0, 0);
                }

                .template-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-lg);
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #818cf8;
                }

                .template-content {
                    flex: 1;
                }

                .template-content h4 {
                    margin: 0 0 var(--spacing-2);
                    font-size: 1rem;
                    color: var(--gray-100);
                }

                .template-content p {
                    margin: 0;
                    font-size: 0.8rem;
                    color: var(--gray-400);
                    line-height: 1.5;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .template-meta {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    margin-top: var(--spacing-3);
                    font-size: 0.75rem;
                    color: var(--gray-500);
                }

                .meta-dot {
                    opacity: 0.5;
                }

                .template-arrow {
                    position: absolute;
                    top: var(--spacing-4);
                    right: var(--spacing-4);
                    color: var(--gray-500);
                    opacity: 0;
                    transform: translate(-4px, 0);
                    transition: all 0.2s ease;
                }

                /* Launches Grid */
                .launches-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-4);
                }

                /* Responsive */
                @media (max-width: 1200px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .templates-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .launches-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .hero-content {
                        flex-direction: column;
                        text-align: center;
                        align-items: center;
                    }
                    .hero-text {
                        text-align: center;
                    }
                    .hero-text p {
                        margin: 0 auto;
                    }
                    .hero-actions {
                        flex-direction: column;
                        width: 100%;
                    }
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    .templates-grid {
                        grid-template-columns: 1fr;
                    }
                    .quick-nav {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default LaunchAutopilotDashboard;
