import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const icons = {
    back: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    trophy: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
    ),
};

export default function ExperimentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state } = useData();

    const experiment = state.experiments.find(e => e.id === id);

    if (!experiment) {
        return (
            <div className="empty-state">
                <h2>Experiment not found</h2>
                <button className="btn btn-primary mt-4" onClick={() => navigate('/experiments')}>
                    Back to Experiments
                </button>
            </div>
        );
    }

    const chartData = experiment.variants.map((v, i) => ({
        name: v.name,
        rate: v.conversionRate,
        fill: i === 0 ? '#6366f1' : '#10b981',
    }));

    const totalImpressions = experiment.variants.reduce((acc, v) => acc + v.impressions, 0);
    const totalConversions = experiment.variants.reduce((acc, v) => acc + v.conversions, 0);

    // Calculate statistical significance (simplified)
    const significanceLevel = totalImpressions > 1000 ? 95 : totalImpressions > 500 ? 85 : totalImpressions > 100 ? 70 : 50;

    const formatDate = (date?: string) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/experiments')}>
                        {icons.back}
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                {experiment.name}
                            </h1>
                            <span className={`badge ${experiment.status === 'running' ? 'badge-success' : experiment.status === 'completed' ? 'badge-primary' : 'badge-warning'}`}>
                                {experiment.status}
                            </span>
                        </div>
                        {experiment.description && (
                            <p className="text-muted mt-1">{experiment.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 mb-6">
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Total Impressions</p>
                    <p className="text-3xl font-bold">{totalImpressions.toLocaleString()}</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Total Conversions</p>
                    <p className="text-3xl font-bold">{totalConversions}</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Confidence</p>
                    <p className="text-3xl font-bold">{significanceLevel}%</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Duration</p>
                    <p className="text-3xl font-bold">
                        {experiment.startDate && experiment.endDate
                            ? Math.ceil((new Date(experiment.endDate).getTime() - new Date(experiment.startDate).getTime()) / (1000 * 60 * 60 * 24))
                            : experiment.startDate
                                ? 'Ongoing'
                                : 0} {typeof experiment.startDate === 'string' && experiment.endDate ? 'days' : ''}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                {/* Conversion Comparison */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h3 className="font-semibold mb-6">Conversion Rate Comparison</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical">
                                <XAxis type="number" domain={[0, 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} width={120} />
                                <Tooltip
                                    contentStyle={{
                                        background: '#1a1a24',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: '#f8fafc',
                                    }}
                                    formatter={(value) => [`${(value as number).toFixed(2)}%`, 'Conversion Rate']}
                                />
                                <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Variant Details */}
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h3 className="font-semibold mb-6">Variant Details</h3>
                    <div className="flex flex-col gap-4">
                        {experiment.variants.map((variant) => {
                            const isWinner = experiment.winner === variant.id;
                            const controlRate = experiment.variants.find(v => v.id === 'a')?.conversionRate || 0;
                            const lift = controlRate > 0 ? ((variant.conversionRate - controlRate) / controlRate * 100) : 0;

                            return (
                                <div
                                    key={variant.id}
                                    className="card"
                                    style={{
                                        padding: 'var(--space-5)',
                                        background: 'var(--color-bg-tertiary)',
                                        borderColor: isWinner ? 'var(--color-success)' : undefined,
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{variant.name}</span>
                                            {isWinner && (
                                                <span className="badge badge-success flex items-center gap-1">
                                                    {icons.trophy} Winner
                                                </span>
                                            )}
                                        </div>
                                        {variant.id !== 'a' && (
                                            <span
                                                className="text-sm font-medium"
                                                style={{ color: lift >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}
                                            >
                                                {lift >= 0 ? '+' : ''}{lift.toFixed(1)}% vs Control
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-3" style={{ gap: 'var(--space-4)' }}>
                                        <div>
                                            <p className="text-2xl font-bold">{variant.impressions.toLocaleString()}</p>
                                            <p className="text-xs text-muted">Impressions</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{variant.conversions}</p>
                                            <p className="text-xs text-muted">Conversions</p>
                                        </div>
                                        <div>
                                            <p
                                                className="text-2xl font-bold"
                                                style={{ color: isWinner ? 'var(--color-success)' : undefined }}
                                            >
                                                {variant.conversionRate.toFixed(2)}%
                                            </p>
                                            <p className="text-xs text-muted">CVR</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="card mt-6" style={{ padding: 'var(--space-6)' }}>
                <h3 className="font-semibold mb-4">Experiment Timeline</h3>
                <div className="flex items-center gap-8">
                    <div>
                        <p className="text-sm text-muted">Created</p>
                        <p className="font-medium">{formatDate(experiment.createdAt)}</p>
                    </div>
                    <div style={{ height: '2px', flex: 1, background: 'var(--glass-border)' }} />
                    <div>
                        <p className="text-sm text-muted">Started</p>
                        <p className="font-medium">{formatDate(experiment.startDate)}</p>
                    </div>
                    <div style={{ height: '2px', flex: 1, background: 'var(--glass-border)' }} />
                    <div>
                        <p className="text-sm text-muted">Ended</p>
                        <p className="font-medium">{formatDate(experiment.endDate)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
