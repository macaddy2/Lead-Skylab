import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

// Icons
const icons = {
    trendUp: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    ),
    trendDown: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </svg>
    ),
    users: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    activity: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    ),
    target: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
    dollar: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    ),
    arrowRight: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    ),
};

// Color palette for charts
const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

interface MetricCardProps {
    label: string;
    value: string | number;
    trend?: { value: number; isPositive: boolean };
    icon: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'accent';
}

function MetricCard({ label, value, trend, icon, variant = 'primary' }: MetricCardProps) {
    return (
        <div className={`card metric-card ${variant}`} style={{ padding: 'var(--space-5)' }}>
            <div className="flex items-center justify-between mb-4">
                <span className="metric-label">{label}</span>
                <div style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>{icon}</div>
            </div>
            <div className="metric-value">{value}</div>
            {trend && (
                <div className={`metric-trend ${trend.isPositive ? 'up' : 'down'}`} style={{ marginTop: 'var(--space-2)' }}>
                    {trend.isPositive ? icons.trendUp : icons.trendDown}
                    <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: 'var(--space-1)' }}>vs last week</span>
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { state } = useData();
    const { leads, activities, experiments, landingPages, surveys } = state;

    // Compute real metrics from app data
    const computedMetrics = useMemo(() => {
        const totalLeads = leads.length;
        const activatedLeads = leads.filter(l => l.stage !== 'new' && l.stage !== 'lost').length;
        const activationRate = totalLeads > 0 ? Math.round((activatedLeads / totalLeads) * 100) : 0;

        const wonLeads = leads.filter(l => l.stage === 'won').length;
        const lostLeads = leads.filter(l => l.stage === 'lost').length;
        const closedLeads = wonLeads + lostLeads;
        const retentionRate = closedLeads > 0 ? Math.round((wonLeads / closedLeads) * 100) : 0;

        // NPS from surveys (if any NPS-type surveys exist)
        let npsScore = state.metrics.npsScore;
        const npsSurveys = surveys.filter(s => s.type === 'nps');
        if (npsSurveys.length > 0) {
            const allResponses = npsSurveys.flatMap(s => s.responses || []);
            if (allResponses.length > 0) {
                const npsAnswers = allResponses
                    .map(r => {
                        const npsQ = r.answers?.find((a: { questionId: string; value: unknown }) => typeof a.value === 'number');
                        return npsQ ? (npsQ.value as number) : null;
                    })
                    .filter((v): v is number => v !== null);

                if (npsAnswers.length > 0) {
                    const promoters = npsAnswers.filter(s => s >= 9).length;
                    const detractors = npsAnswers.filter(s => s <= 6).length;
                    npsScore = Math.round(((promoters - detractors) / npsAnswers.length) * 100);
                }
            }
        }

        // Overall PMF score: weighted average of key metrics
        const overallScore = Math.round(
            (activationRate * 0.3 + retentionRate * 0.3 + Math.max(0, npsScore + 50) * 0.4) / 1.0
        );

        return {
            overallScore: Math.min(100, Math.max(0, overallScore)),
            npsScore,
            activationRate,
            retentionRate,
            mrr: state.metrics.mrr, // Keep as manually-set (no payment integration yet)
        };
    }, [leads, surveys, state.metrics.npsScore, state.metrics.mrr]);

    const metrics = { ...state.metrics, ...computedMetrics };

    // Calculate pipeline data
    const pipelineData = useMemo(() => {
        const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];
        return stages.map((stage, index) => {
            const count = leads.filter(l => l.stage === stage).length;
            return {
                name: stage.charAt(0).toUpperCase() + stage.slice(1),
                value: count,
                fill: COLORS[index % COLORS.length],
            };
        });
    }, [leads]);

    // Compute retention curve from lead cohorts (weekly)
    const retentionData = useMemo(() => {
        const now = Date.now();
        const weeks = Array.from({ length: 8 }, (_, i) => {
            const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
            const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;
            const cohort = leads.filter(l => {
                const created = new Date(l.createdAt).getTime();
                return created >= weekStart && created < weekEnd;
            });
            const active = cohort.filter(l => {
                const lastActivity = new Date(l.lastActivityAt || l.updatedAt).getTime();
                return lastActivity >= weekEnd;
            });
            const retention = cohort.length > 0 ? Math.round((active.length / cohort.length) * 100) : (100 - i * 8);
            return { week: `W${i + 1}`, retention: Math.max(0, retention) };
        });
        return weeks.reverse();
    }, [leads]);

    // Compute trend from lead creation over past months
    const revenueData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const monthIdx = (now.getMonth() - 5 + i + 12) % 12;
            const leadsInMonth = leads.filter(l => {
                const d = new Date(l.createdAt);
                return d.getMonth() === monthIdx;
            }).length;
            // Approximate MRR based on lead count (since no real payment data)
            const baseMRR = metrics.mrr || 48500;
            const variation = baseMRR * (0.7 + (leadsInMonth / Math.max(leads.length, 1)) * 1.5);
            return { month: months[monthIdx], mrr: Math.round(variation) };
        });
    }, [leads, metrics.mrr]);

    // Lead source distribution (real data)
    const sourceData = useMemo(() => {
        const sources = ['landing_page', 'referral', 'organic', 'social', 'paid_ad'];
        return sources.map((source, index) => ({
            name: source.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            value: leads.filter(l => l.source === source).length,
            fill: COLORS[index],
        })).filter(d => d.value > 0);
    }, [leads]);

    // Active experiments
    const activeExperiments = experiments.filter(e => e.status === 'running');

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Format time ago
    const timeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">PMF Dashboard</h1>
                    <p className="page-subtitle">Track your product-market fit metrics in real-time</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary">
                        Export Report
                    </button>
                    <button className="btn btn-primary">
                        Refresh Data
                    </button>
                </div>
            </div>

            {/* PMF Score Hero */}
            <div
                className="card mb-6"
                style={{
                    padding: 'var(--space-8)',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(6, 182, 212, 0.1) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
            >
                <p className="text-muted text-sm mb-2">OVERALL PMF SCORE</p>
                <div
                    style={{
                        fontSize: '5rem',
                        fontWeight: '800',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1,
                    }}
                >
                    {metrics.overallScore}
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="metric-trend up">
                        {icons.trendUp}
                        <span>+5 from last month</span>
                    </div>
                </div>
                <p className="text-muted text-sm mt-4" style={{ maxWidth: '600px', margin: '0 auto', marginTop: 'var(--space-4)' }}>
                    Based on NPS ({metrics.npsScore}), activation rate ({metrics.activationRate}%),
                    retention ({metrics.retentionRate}%), and user engagement metrics.
                </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 mb-6">
                <MetricCard
                    label="NPS Score"
                    value={`+${metrics.npsScore}`}
                    trend={{ value: 8, isPositive: true }}
                    icon={icons.activity}
                    variant="primary"
                />
                <MetricCard
                    label="Activation Rate"
                    value={`${metrics.activationRate}%`}
                    trend={{ value: 3.2, isPositive: true }}
                    icon={icons.target}
                    variant="secondary"
                />
                <MetricCard
                    label="Retention (30d)"
                    value={`${metrics.retentionRate}%`}
                    trend={{ value: 2.1, isPositive: false }}
                    icon={icons.users}
                    variant="success"
                />
                <MetricCard
                    label="MRR"
                    value={formatCurrency(metrics.mrr)}
                    trend={{ value: 7.8, isPositive: true }}
                    icon={icons.dollar}
                    variant="warning"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 mb-6">
                {/* Lead Pipeline */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Lead Pipeline
                            </h3>
                            <p className="text-muted text-sm">{leads.length} total leads</p>
                        </div>
                        <Link to="/leads" className="btn btn-ghost btn-sm">
                            View All {icons.arrowRight}
                        </Link>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pipelineData} layout="vertical">
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {pipelineData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Retention Curve */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Retention Curve
                            </h3>
                            <p className="text-muted text-sm">8-week cohort analysis</p>
                        </div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={retentionData}>
                                <defs>
                                    <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                    }}
                                    formatter={(value) => [`${value}%`, 'Retention']}
                                />
                                <Area type="monotone" dataKey="retention" stroke="#6366f1" strokeWidth={2} fill="url(#retentionGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-3 mb-6">
                {/* Revenue Trend */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                                MRR Growth
                            </h3>
                            <p className="text-muted text-sm">Last 6 months</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                    }}
                                    formatter={(value) => [formatCurrency(value as number), 'MRR']}
                                />
                                <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Lead Sources */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Lead Sources
                            </h3>
                            <p className="text-muted text-sm">Distribution by channel</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center mt-4">
                        {sourceData.slice(0, 3).map((source, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: source.fill }} />
                                <span className="text-muted">{source.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Recent Activity
                            </h3>
                            <p className="text-muted text-sm">Last 7 days</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {activities.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="flex gap-3">
                                <div
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        marginTop: 6,
                                        flexShrink: 0,
                                        background: activity.type === 'lead_created' ? 'var(--color-success)'
                                            : activity.type === 'lead_converted' ? 'var(--color-primary)'
                                                : activity.type === 'experiment_completed' ? 'var(--color-warning)'
                                                    : 'var(--color-info)',
                                    }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p className="text-sm" style={{ lineHeight: 1.4 }}>{activity.title}</p>
                                    <p className="text-xs text-muted" style={{ marginTop: 2 }}>{timeAgo(activity.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Experiments & Landing Pages */}
            <div className="grid grid-cols-2">
                {/* Active Experiments */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Active Experiments
                            </h3>
                            <p className="text-muted text-sm">{activeExperiments.length} running</p>
                        </div>
                        <Link to="/experiments" className="btn btn-ghost btn-sm">
                            View All {icons.arrowRight}
                        </Link>
                    </div>
                    {activeExperiments.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {activeExperiments.map((exp) => (
                                <Link key={exp.id} to={`/experiments/${exp.id}`} style={{ textDecoration: 'none' }}>
                                    <div
                                        className="card"
                                        style={{
                                            padding: 'var(--space-4)',
                                            background: 'var(--color-bg-tertiary)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{exp.name}</span>
                                            <span className="badge badge-success">Running</span>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            {exp.variants.map((v) => (
                                                <div key={v.id} className="flex items-center gap-2">
                                                    <span className="text-muted">{v.name}:</span>
                                                    <span className="font-medium">{v.conversionRate.toFixed(1)}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                            <p className="text-muted">No active experiments</p>
                            <Link to="/experiments" className="btn btn-primary btn-sm mt-4">
                                Create Experiment
                            </Link>
                        </div>
                    )}
                </div>

                {/* Top Landing Pages */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                                Top Landing Pages
                            </h3>
                            <p className="text-muted text-sm">By conversion rate</p>
                        </div>
                        <Link to="/pages" className="btn btn-ghost btn-sm">
                            View All {icons.arrowRight}
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {landingPages
                            .filter(p => p.status === 'published')
                            .sort((a, b) => b.analytics.conversionRate - a.analytics.conversionRate)
                            .slice(0, 3)
                            .map((page) => (
                                <Link key={page.id} to={`/pages/${page.id}`} style={{ textDecoration: 'none' }}>
                                    <div
                                        className="card"
                                        style={{
                                            padding: 'var(--space-4)',
                                            background: 'var(--color-bg-tertiary)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{page.title}</span>
                                            <span className="badge badge-primary">{page.analytics.conversionRate.toFixed(1)}% CVR</span>
                                        </div>
                                        <div className="flex gap-4 text-sm text-muted">
                                            <span>{page.analytics.views.toLocaleString()} views</span>
                                            <span>{page.analytics.formSubmissions} signups</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
