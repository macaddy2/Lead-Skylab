import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { v4 as uuidv4 } from 'uuid';

const icons = {
    plus: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
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
    target: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
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

const segmentColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Audience() {
    const { state, dispatch } = useData();
    const { audiences, leads } = state;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAudience, setNewAudience] = useState({
        name: '',
        description: '',
        criteria: { field: 'score', operator: 'greater_than', value: '50' },
    });

    const handleCreate = () => {
        if (!newAudience.name) return;

        // Calculate size based on criteria
        let size = 0;
        if (newAudience.criteria.field === 'score') {
            const targetValue = parseInt(newAudience.criteria.value);
            if (newAudience.criteria.operator === 'greater_than') {
                size = leads.filter(l => l.score > targetValue).length;
            } else {
                size = leads.filter(l => l.score < targetValue).length;
            }
        } else if (newAudience.criteria.field === 'stage') {
            size = leads.filter(l => l.stage === newAudience.criteria.value).length;
        } else if (newAudience.criteria.field === 'tags') {
            size = leads.filter(l => l.tags.includes(newAudience.criteria.value)).length;
        }

        const audience = {
            id: uuidv4(),
            name: newAudience.name,
            description: newAudience.description,
            type: 'segment' as const,
            criteria: [{
                field: newAudience.criteria.field,
                operator: newAudience.criteria.operator as 'greater_than' | 'less_than' | 'equals' | 'contains',
                value: newAudience.criteria.value,
            }],
            size,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_AUDIENCE', payload: audience });
        setShowCreateModal(false);
        setNewAudience({ name: '', description: '', criteria: { field: 'score', operator: 'greater_than', value: '50' } });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this audience segment?')) {
            dispatch({ type: 'DELETE_AUDIENCE', payload: id });
        }
    };

    // Summary stats
    const totalLeads = leads.length;
    const hotLeads = leads.filter(l => l.score > 80).length;
    const coldLeads = leads.filter(l => l.score < 40).length;

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Audience</h1>
                    <p className="page-subtitle">Segment and analyze your leads</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    {icons.plus}
                    Create Segment
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 mb-6">
                <div className="card metric-card primary" style={{ padding: 'var(--space-5)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="metric-label">Total Leads</span>
                        <span style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>{icons.users}</span>
                    </div>
                    <div className="metric-value">{totalLeads}</div>
                </div>

                <div className="card metric-card success" style={{ padding: 'var(--space-5)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="metric-label">Hot Leads</span>
                        <span style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>{icons.target}</span>
                    </div>
                    <div className="metric-value">{hotLeads}</div>
                    <p className="text-xs text-muted mt-1">Score &gt; 80</p>
                </div>

                <div className="card metric-card warning" style={{ padding: 'var(--space-5)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="metric-label">Warm Leads</span>
                    </div>
                    <div className="metric-value">{totalLeads - hotLeads - coldLeads}</div>
                    <p className="text-xs text-muted mt-1">Score 40-80</p>
                </div>

                <div className="card metric-card secondary" style={{ padding: 'var(--space-5)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="metric-label">Cold Leads</span>
                    </div>
                    <div className="metric-value">{coldLeads}</div>
                    <p className="text-xs text-muted mt-1">Score &lt; 40</p>
                </div>
            </div>

            {/* Segments */}
            <h2 className="text-lg font-semibold mb-4">Segments</h2>

            {audiences.length > 0 ? (
                <div className="grid grid-cols-3">
                    {audiences.map((audience, index) => (
                        <div
                            key={audience.id}
                            className="card"
                            style={{
                                padding: 'var(--space-6)',
                                borderTop: `3px solid ${segmentColors[index % segmentColors.length]}`,
                            }}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{audience.name}</h3>
                                    {audience.description && (
                                        <p className="text-sm text-muted mt-1">{audience.description}</p>
                                    )}
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    style={{ color: 'var(--color-error)' }}
                                    onClick={() => handleDelete(audience.id)}
                                >
                                    {icons.trash}
                                </button>
                            </div>

                            <div
                                className="flex items-center justify-center py-6 mb-4"
                                style={{
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-lg)'
                                }}
                            >
                                <div className="text-center">
                                    <div
                                        className="text-4xl font-bold"
                                        style={{ color: segmentColors[index % segmentColors.length] }}
                                    >
                                        {audience.size}
                                    </div>
                                    <p className="text-sm text-muted">leads</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {audience.criteria.map((c, i) => (
                                    <span key={i} className="tag">
                                        {c.field} {c.operator.replace('_', ' ')} {String(c.value)}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button className="btn btn-secondary btn-sm flex-1">
                                    View Leads
                                </button>
                                <button className="btn btn-ghost btn-sm flex-1">
                                    Export
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card empty-state">
                    <div className="empty-state-icon">{icons.target}</div>
                    <h3 className="empty-state-title">No segments yet</h3>
                    <p className="empty-state-description">
                        Create segments to group your leads based on specific criteria.
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        {icons.plus}
                        Create Segment
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Segment</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                                {icons.close}
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-4">
                                <label className="input-label">Segment Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newAudience.name}
                                    onChange={(e) => setNewAudience({ ...newAudience, name: e.target.value })}
                                    placeholder="e.g., Enterprise Leads"
                                />
                            </div>

                            <div className="input-group mb-4">
                                <label className="input-label">Description</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newAudience.description}
                                    onChange={(e) => setNewAudience({ ...newAudience, description: e.target.value })}
                                    placeholder="Optional description"
                                />
                            </div>

                            <div className="input-group mb-4">
                                <label className="input-label">Filter Criteria</label>
                                <div className="flex gap-2">
                                    <select
                                        className="input"
                                        value={newAudience.criteria.field}
                                        onChange={(e) => setNewAudience({
                                            ...newAudience,
                                            criteria: { ...newAudience.criteria, field: e.target.value }
                                        })}
                                    >
                                        <option value="score">Score</option>
                                        <option value="stage">Stage</option>
                                        <option value="source">Source</option>
                                        <option value="tags">Has Tag</option>
                                    </select>

                                    <select
                                        className="input"
                                        value={newAudience.criteria.operator}
                                        onChange={(e) => setNewAudience({
                                            ...newAudience,
                                            criteria: { ...newAudience.criteria, operator: e.target.value }
                                        })}
                                    >
                                        <option value="greater_than">Greater than</option>
                                        <option value="less_than">Less than</option>
                                        <option value="equals">Equals</option>
                                        <option value="contains">Contains</option>
                                    </select>

                                    <input
                                        type="text"
                                        className="input"
                                        value={newAudience.criteria.value}
                                        onChange={(e) => setNewAudience({
                                            ...newAudience,
                                            criteria: { ...newAudience.criteria, value: e.target.value }
                                        })}
                                        placeholder="Value"
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
                                disabled={!newAudience.name}
                            >
                                Create Segment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
