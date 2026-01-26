import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { Experiment } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const icons = {
    plus: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    play: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    ),
    pause: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
        </svg>
    ),
    check: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
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
    trash: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    close: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
};

const statusColors = {
    draft: 'badge-warning',
    running: 'badge-success',
    paused: 'badge-info',
    completed: 'badge-primary',
};

export default function Experiments() {
    const { state, dispatch } = useData();
    const { experiments, landingPages } = state;

    const [filter, setFilter] = useState<'all' | 'running' | 'completed'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newExperiment, setNewExperiment] = useState({
        name: '',
        description: '',
        type: 'headline' as Experiment['type'],
        targetId: landingPages[0]?.id || '',
        variantAName: 'Control',
        variantBName: 'Variant B',
    });

    const filteredExperiments = experiments.filter((exp) => {
        if (filter === 'all') return true;
        if (filter === 'running') return exp.status === 'running';
        if (filter === 'completed') return exp.status === 'completed';
        return true;
    });

    const handleCreate = () => {
        if (!newExperiment.name) return;

        const experiment: Experiment = {
            id: uuidv4(),
            name: newExperiment.name,
            description: newExperiment.description,
            status: 'draft',
            type: newExperiment.type,
            targetId: newExperiment.targetId,
            variants: [
                {
                    id: 'a',
                    name: newExperiment.variantAName,
                    content: {},
                    impressions: 0,
                    conversions: 0,
                    conversionRate: 0,
                },
                {
                    id: 'b',
                    name: newExperiment.variantBName,
                    content: {},
                    impressions: 0,
                    conversions: 0,
                    conversionRate: 0,
                },
            ],
            trafficSplit: [50, 50],
            metric: 'conversions',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_EXPERIMENT', payload: experiment });
        setShowCreateModal(false);
        setNewExperiment({
            name: '',
            description: '',
            type: 'headline',
            targetId: landingPages[0]?.id || '',
            variantAName: 'Control',
            variantBName: 'Variant B',
        });
    };

    const handleToggleStatus = (exp: Experiment) => {
        let newStatus: Experiment['status'] = 'draft';
        if (exp.status === 'draft') newStatus = 'running';
        else if (exp.status === 'running') newStatus = 'paused';
        else if (exp.status === 'paused') newStatus = 'running';

        dispatch({
            type: 'UPDATE_EXPERIMENT',
            payload: {
                ...exp,
                status: newStatus,
                startDate: newStatus === 'running' ? (exp.startDate || new Date().toISOString()) : exp.startDate,
                updatedAt: new Date().toISOString(),
            },
        });
    };

    const handleComplete = (exp: Experiment) => {
        // Find winner based on conversion rate
        const winner = exp.variants.reduce((a, b) =>
            a.conversionRate > b.conversionRate ? a : b
        );

        dispatch({
            type: 'UPDATE_EXPERIMENT',
            payload: {
                ...exp,
                status: 'completed',
                winner: winner.id,
                endDate: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this experiment?')) {
            dispatch({ type: 'DELETE_EXPERIMENT', payload: id });
        }
    };

    // Stats
    const runningCount = experiments.filter(e => e.status === 'running').length;
    const completedCount = experiments.filter(e => e.status === 'completed').length;
    const avgLift = experiments
        .filter(e => e.status === 'completed' && e.winner)
        .reduce((acc, e) => {
            const winner = e.variants.find(v => v.id === e.winner);
            const control = e.variants.find(v => v.id === 'a');
            if (winner && control && control.conversionRate > 0) {
                return acc + ((winner.conversionRate - control.conversionRate) / control.conversionRate * 100);
            }
            return acc;
        }, 0) / (completedCount || 1);

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Experiments</h1>
                    <p className="page-subtitle">A/B test your way to better conversions</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    {icons.plus}
                    New Experiment
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 mb-6">
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Total Experiments</p>
                    <p className="text-3xl font-bold">{experiments.length}</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Running</p>
                    <p className="text-3xl font-bold text-success">{runningCount}</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Completed</p>
                    <p className="text-3xl font-bold text-primary">{completedCount}</p>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <p className="text-sm text-muted mb-1">Avg. Lift</p>
                    <p className="text-3xl font-bold">{avgLift > 0 ? '+' : ''}{avgLift.toFixed(1)}%</p>
                </div>
            </div>

            {/* Filters */}
            <div className="tabs" style={{ maxWidth: '400px' }}>
                <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    All
                </button>
                <button className={`tab ${filter === 'running' ? 'active' : ''}`} onClick={() => setFilter('running')}>
                    Running
                </button>
                <button className={`tab ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
                    Completed
                </button>
            </div>

            {/* Experiments List */}
            {filteredExperiments.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {filteredExperiments.map((exp) => (
                        <div key={exp.id} className="card" style={{ padding: 'var(--space-6)' }}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <Link
                                            to={`/experiments/${exp.id}`}
                                            className="text-lg font-semibold"
                                            style={{ textDecoration: 'none', color: 'var(--color-text-primary)' }}
                                        >
                                            {exp.name}
                                        </Link>
                                        <span className={`badge ${statusColors[exp.status]}`}>
                                            {exp.status}
                                        </span>
                                        {exp.winner && (
                                            <span className="badge badge-success flex items-center gap-1">
                                                {icons.trophy}
                                                Winner: {exp.variants.find(v => v.id === exp.winner)?.name}
                                            </span>
                                        )}
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm text-muted">{exp.description}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {exp.status !== 'completed' && (
                                        <>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleToggleStatus(exp)}
                                            >
                                                {exp.status === 'running' ? icons.pause : icons.play}
                                                {exp.status === 'running' ? 'Pause' : 'Start'}
                                            </button>
                                            {exp.status === 'running' && (
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => handleComplete(exp)}
                                                >
                                                    {icons.check}
                                                    Complete
                                                </button>
                                            )}
                                        </>
                                    )}
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ color: 'var(--color-error)' }}
                                        onClick={() => handleDelete(exp.id)}
                                    >
                                        {icons.trash}
                                    </button>
                                </div>
                            </div>

                            {/* Variants */}
                            <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                                {exp.variants.map((variant) => {
                                    const isWinner = exp.winner === variant.id;
                                    return (
                                        <div
                                            key={variant.id}
                                            className="card"
                                            style={{
                                                padding: 'var(--space-4)',
                                                background: 'var(--color-bg-tertiary)',
                                                borderColor: isWinner ? 'var(--color-success)' : undefined,
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="font-medium">{variant.name}</span>
                                                {isWinner && (
                                                    <span style={{ color: 'var(--color-success)' }}>{icons.trophy}</span>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-3" style={{ gap: 'var(--space-2)' }}>
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold">{variant.impressions.toLocaleString()}</div>
                                                    <div className="text-xs text-muted">Impressions</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-lg font-semibold">{variant.conversions}</div>
                                                    <div className="text-xs text-muted">Conversions</div>
                                                </div>
                                                <div className="text-center">
                                                    <div
                                                        className="text-lg font-semibold"
                                                        style={{ color: isWinner ? 'var(--color-success)' : undefined }}
                                                    >
                                                        {variant.conversionRate.toFixed(1)}%
                                                    </div>
                                                    <div className="text-xs text-muted">CVR</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card empty-state">
                    <h3 className="empty-state-title">No experiments found</h3>
                    <p className="empty-state-description">
                        {filter !== 'all'
                            ? 'Try changing the filter.'
                            : 'Create your first A/B test to optimize conversions.'}
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        {icons.plus}
                        New Experiment
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Experiment</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                                {icons.close}
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-4">
                                <label className="input-label">Experiment Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newExperiment.name}
                                    onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                                    placeholder="e.g., Hero Headline Test"
                                />
                            </div>

                            <div className="input-group mb-4">
                                <label className="input-label">Description</label>
                                <textarea
                                    className="input"
                                    value={newExperiment.description}
                                    onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
                                    placeholder="What are you testing?"
                                />
                            </div>

                            <div className="input-group mb-4">
                                <label className="input-label">Test Type</label>
                                <select
                                    className="input"
                                    value={newExperiment.type}
                                    onChange={(e) => setNewExperiment({ ...newExperiment, type: e.target.value as Experiment['type'] })}
                                >
                                    <option value="headline">Headline</option>
                                    <option value="cta">CTA Button</option>
                                    <option value="landing_page">Landing Page</option>
                                    <option value="form">Form</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                                <div className="input-group">
                                    <label className="input-label">Variant A Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newExperiment.variantAName}
                                        onChange={(e) => setNewExperiment({ ...newExperiment, variantAName: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Variant B Name</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={newExperiment.variantBName}
                                        onChange={(e) => setNewExperiment({ ...newExperiment, variantBName: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={!newExperiment.name}
                            >
                                Create Experiment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
