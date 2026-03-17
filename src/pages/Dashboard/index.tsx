import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { TrendingUp, TrendingDown, Users, Activity, Target, DollarSign, ArrowRight } from 'lucide-react';

// Color palette for charts
const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const tooltipStyle = {
    background: '#1a1a24',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#f8fafc',
};

interface MetricCardProps {
    label: string;
    value: string | number;
    trend?: { value: number; isPositive: boolean };
    icon: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'accent';
}

function MetricCard({ label, value, trend, icon, variant = 'primary' }: MetricCardProps) {
    return (
        <div className={`card metric-card p-5 ${variant}`}>
            <div className="flex items-center justify-between mb-4">
                <span className="metric-label">{label}</span>
                <div className="text-muted" style={{ opacity: 0.7 }}>{icon}</div>
            </div>
            <div className="metric-value">{value}</div>
            {trend && (
                <div className={`metric-trend mt-2 ${trend.isPositive ? 'up' : 'down'}`}>
                    {trend.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                    <span className="text-muted" style={{ marginLeft: 'var(--space-1)' }}>vs last week</span>
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const { state } = useData();
    const { leads, activities, experiments, landingPages, surveys } = state;

    const computedMetrics = useMemo(() => {
        const totalLeads = leads.length;
        const activatedLeads = leads.filter(l => l.stage !== 'new' && l.stage !== 'lost').length;
        const activationRate = totalLeads > 0 ? Math.round((activatedLeads / totalLeads) * 100) : 0;

        const wonLeads = leads.filter(l => l.stage === 'won').length;
        const lostLeads = leads.filter(l => l.stage === 'lost').length;
        const closedLeads = wonLeads + lostLeads;
        const retentionRate = closedLeads > 0 ? Math.round((wonLeads / closedLeads) * 100) : 0;

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

        const overallScore = Math.round(
            (activationRate * 0.3 + retentionRate * 0.3 + Math.max(0, npsScore + 50) * 0.4) / 1.0
        );

        return {
            overallScore: Math.min(100, Math.max(0, overallScore)),
            npsScore,
            activationRate,
            retentionRate,
            mrr: state.metrics.mrr,
        };
    }, [leads, surveys, state.metrics.npsScore, state.metrics.mrr]);

    const metrics = { ...state.metrics, ...computedMetrics };

    const pipelineData = useMemo(() => {
        const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];
        return stages.map((stage, index) => ({
            name: stage.charAt(0).toUpperCase() + stage.slice(1),
            value: leads.filter(l => l.stage === stage).length,
            fill: COLORS[index % COLORS.length],
        }));
    }, [leads]);

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

    const revenueData = useMemo(() => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const monthIdx = (now.getMonth() - 5 + i + 12) % 12;
            const leadsInMonth = leads.filter(l => new Date(l.createdAt).getMonth() === monthIdx).length;
            const baseMRR = metrics.mrr || 48500;
            const variation = baseMRR * (0.7 + (leadsInMonth / Math.max(leads.length, 1)) * 1.5);
            return { month: months[monthIdx], mrr: Math.round(variation) };
        });
    }, [leads, metrics.mrr]);

    const sourceData = useMemo(() => {
        const sources = ['landing_page', 'referral', 'organic', 'social', 'paid_ad'];
        return sources.map((source, index) => ({
            name: source.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            value: leads.filter(l => l.source === source).length,
            fill: COLORS[index],
        })).filter(d => d.value > 0);
    }, [leads]);

    const activeExperiments = experiments.filter(e => e.status === 'running');

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    const timeAgo = (timestamp: string) => {
        const diffMs = Date.now() - new Date(timestamp).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const activityDotColor = (type: string) =>
        type === 'lead_created' ? 'var(--color-success)'
            : type === 'lead_converted' ? 'var(--color-primary)'
                : type === 'experiment_completed' ? 'var(--color-warning)'
                    : 'var(--color-info)';

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">PMF Dashboard</h1>
                    <p className="page-subtitle">Track your product-market fit metrics in real-time</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary">Export Report</button>
                    <button className="btn btn-primary">Refresh Data</button>
                </div>
            </div>

            {/* PMF Score Hero */}
            <div
                className="card mb-6 p-8 text-center"
                style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(6, 182, 212, 0.1) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
            >
                <p className="text-muted text-sm mb-2">OVERALL PMF SCORE</p>
                <div className="page-title" style={{ fontSize: '5rem', lineHeight: 1 }}>
                    {metrics.overallScore}
                </div>
                <div className="flex items-center justify-center gap-2 mt-4">
                    <div className="metric-trend up">
                        <TrendingUp size={16} />
                        <span>+5 from last month</span>
                    </div>
                </div>
                <p className="text-muted text-sm mt-4" style={{ maxWidth: '600px', margin: 'var(--space-4) auto 0' }}>
                    Based on NPS ({metrics.npsScore}), activation rate ({metrics.activationRate}%),
                    retention ({metrics.retentionRate}%), and user engagement metrics.
                </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-4 mb-6">
                <MetricCard label="NPS Score" value={`+${metrics.npsScore}`} trend={{ value: 8, isPositive: true }} icon={<Activity size={24} />} variant="primary" />
                <MetricCard label="Activation Rate" value={`${metrics.activationRate}%`} trend={{ value: 3.2, isPositive: true }} icon={<Target size={24} />} variant="secondary" />
                <MetricCard label="Retention (30d)" value={`${metrics.retentionRate}%`} trend={{ value: 2.1, isPositive: false }} icon={<Users size={24} />} variant="success" />
                <MetricCard label="MRR" value={formatCurrency(metrics.mrr)} trend={{ value: 7.8, isPositive: true }} icon={<DollarSign size={24} />} variant="warning" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-2 mb-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Lead Pipeline</h3>
                            <p className="text-muted text-sm">{leads.length} total leads</p>
                        </div>
                        <Link to="/leads" className="btn btn-ghost btn-sm">View All <ArrowRight size={16} /></Link>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pipelineData} layout="vertical">
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {pipelineData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Retention Curve</h3>
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
                                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Retention']} />
                                <Area type="monotone" dataKey="retention" stroke="#6366f1" strokeWidth={2} fill="url(#retentionGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-3 mb-6">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">MRR Growth</h3>
                            <p className="text-muted text-sm">Last 6 months</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(value as number), 'MRR']} />
                                <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Lead Sources</h3>
                            <p className="text-muted text-sm">Distribution by channel</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value">
                                    {sourceData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center mt-4">
                        {sourceData.slice(0, 3).map((source, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <div className="status-dot" style={{ background: source.fill, marginTop: 0 }} />
                                <span className="text-muted">{source.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Recent Activity</h3>
                            <p className="text-muted text-sm">Last 7 days</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {activities.slice(0, 5).map((activity) => (
                            <div key={activity.id} className="flex gap-3">
                                <div className="status-dot" style={{ background: activityDotColor(activity.type), flexShrink: 0 }} />
                                <div className="flex-1" style={{ minWidth: 0 }}>
                                    <p className="text-sm" style={{ lineHeight: 1.4 }}>{activity.title}</p>
                                    <p className="text-xs text-muted mt-2">{timeAgo(activity.timestamp)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Experiments & Landing Pages */}
            <div className="grid grid-cols-2">
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Active Experiments</h3>
                            <p className="text-muted text-sm">{activeExperiments.length} running</p>
                        </div>
                        <Link to="/experiments" className="btn btn-ghost btn-sm">View All <ArrowRight size={16} /></Link>
                    </div>
                    {activeExperiments.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {activeExperiments.map((exp) => (
                                <Link key={exp.id} to={`/experiments/${exp.id}`} className="link-unstyled">
                                    <div className="card p-4 cursor-pointer" style={{ background: 'var(--color-bg-tertiary)' }}>
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
                        <div className="empty-state p-8">
                            <p className="text-muted">No active experiments</p>
                            <Link to="/experiments" className="btn btn-primary btn-sm mt-4">Create Experiment</Link>
                        </div>
                    )}
                </div>

                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold">Top Landing Pages</h3>
                            <p className="text-muted text-sm">By conversion rate</p>
                        </div>
                        <Link to="/pages" className="btn btn-ghost btn-sm">View All <ArrowRight size={16} /></Link>
                    </div>
                    <div className="flex flex-col gap-4">
                        {landingPages
                            .filter(p => p.status === 'published')
                            .sort((a, b) => b.analytics.conversionRate - a.analytics.conversionRate)
                            .slice(0, 3)
                            .map((page) => (
                                <Link key={page.id} to={`/pages/${page.id}`} className="link-unstyled">
                                    <div className="card p-4 cursor-pointer" style={{ background: 'var(--color-bg-tertiary)' }}>
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
