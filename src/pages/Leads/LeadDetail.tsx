import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { LeadStage, LeadSource } from '../../types';

const icons = {
    back: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    save: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    ),
    mail: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    phone: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    ),
    building: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4v18" />
            <path d="M19 21V11l-6-4" />
            <path d="M9 9h1" />
            <path d="M9 13h1" />
            <path d="M9 17h1" />
        </svg>
    ),
    tag: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
    ),
    plus: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    x: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
};

const stageColors: Record<LeadStage, string> = {
    new: 'badge-info',
    contacted: 'badge-primary',
    qualified: 'badge-success',
    proposal: 'badge-warning',
    negotiation: 'badge-primary',
    won: 'badge-success',
    lost: 'badge-error',
};

const stages: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const sources: LeadSource[] = ['landing_page', 'referral', 'organic', 'social', 'email', 'paid_ad', 'direct', 'other'];

export default function LeadDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch, calculateLeadScore } = useData();

    const lead = state.leads.find(l => l.id === id);

    const [formData, setFormData] = useState(() => lead || {
        name: '',
        email: '',
        company: '',
        phone: '',
        source: 'other' as LeadSource,
        stage: 'new' as LeadStage,
        tags: [] as string[],
        notes: '',
    });

    const [newTag, setNewTag] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    if (!lead) {
        return (
            <div className="empty-state">
                <h2>Lead not found</h2>
                <button className="btn btn-primary mt-4" onClick={() => navigate('/leads')}>
                    Back to Leads
                </button>
            </div>
        );
    }

    const handleSave = () => {
        setIsSaving(true);
        const updatedLead = {
            ...lead,
            ...formData,
            score: calculateLeadScore({ ...formData }),
            updatedAt: new Date().toISOString(),
        };
        dispatch({ type: 'UPDATE_LEAD', payload: updatedLead });
        setTimeout(() => setIsSaving(false), 500);
    };

    const handleAddTag = () => {
        if (newTag && !formData.tags.includes(newTag)) {
            setFormData({ ...formData, tags: [...formData.tags, newTag] });
            setNewTag('');
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 50) return 'var(--color-warning)';
        return 'var(--color-text-muted)';
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/leads')}>
                        {icons.back}
                    </button>
                    <div className="flex items-center gap-4">
                        <div
                            className="avatar avatar-lg"
                            style={{ background: 'var(--gradient-primary)' }}
                        >
                            {formData.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                                {formData.name}
                            </h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`badge ${stageColors[formData.stage]}`}>
                                    {formData.stage}
                                </span>
                                <span
                                    className="flex items-center gap-1 text-sm font-medium"
                                    style={{ color: getScoreColor(lead.score) }}
                                >
                                    Score: {lead.score}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : icons.save}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-3" style={{ gap: 'var(--space-6)' }}>
                {/* Main Info */}
                <div style={{ gridColumn: 'span 2' }}>
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-6">Lead Information</h3>

                        <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Company</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.company || ''}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Phone</label>
                                <input
                                    type="tel"
                                    className="input"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Source</label>
                                <select
                                    className="input"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value as LeadSource })}
                                >
                                    {sources.map(s => (
                                        <option key={s} value={s}>
                                            {s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Stage</label>
                                <select
                                    className="input"
                                    value={formData.stage}
                                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as LeadStage })}
                                >
                                    {stages.map(s => (
                                        <option key={s} value={s}>
                                            {s.charAt(0).toUpperCase() + s.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="input-group mt-4">
                            <label className="input-label">Notes</label>
                            <textarea
                                className="input"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                style={{ minHeight: '120px' }}
                                placeholder="Add notes about this lead..."
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="card mt-6" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Tags</h3>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {formData.tags.map(tag => (
                                <span key={tag} className="tag tag-removable" onClick={() => handleRemoveTag(tag)}>
                                    {tag}
                                    <span style={{ marginLeft: 'var(--space-1)', opacity: 0.7 }}>{icons.x}</span>
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="input"
                                placeholder="Add a tag..."
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-secondary" onClick={handleAddTag}>
                                {icons.plus}
                                Add
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Quick Info */}
                    <div className="card" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Quick Info</h3>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <span style={{ color: 'var(--color-text-muted)' }}>{icons.mail}</span>
                                <a href={`mailto:${formData.email}`} className="text-sm">
                                    {formData.email}
                                </a>
                            </div>

                            {formData.phone && (
                                <div className="flex items-center gap-3">
                                    <span style={{ color: 'var(--color-text-muted)' }}>{icons.phone}</span>
                                    <a href={`tel:${formData.phone}`} className="text-sm">
                                        {formData.phone}
                                    </a>
                                </div>
                            )}

                            {formData.company && (
                                <div className="flex items-center gap-3">
                                    <span style={{ color: 'var(--color-text-muted)' }}>{icons.building}</span>
                                    <span className="text-sm">{formData.company}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="card mt-6" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Lead Score</h3>

                        <div className="text-center mb-4">
                            <div
                                style={{
                                    fontSize: 'var(--font-size-4xl)',
                                    fontWeight: 'var(--font-weight-bold)',
                                    color: getScoreColor(lead.score),
                                }}
                            >
                                {lead.score}
                            </div>
                            <p className="text-sm text-muted">out of 100</p>
                        </div>

                        <div className="progress mb-2">
                            <div
                                className="progress-bar primary"
                                style={{ width: `${lead.score}%` }}
                            />
                        </div>

                        <p className="text-xs text-muted text-center">
                            Score based on source, stage, and engagement
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="card mt-6" style={{ padding: 'var(--space-6)' }}>
                        <h3 className="font-semibold mb-4">Activity</h3>

                        <div className="flex flex-col gap-4">
                            <div className="flex gap-3">
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', marginTop: 6 }} />
                                <div>
                                    <p className="text-sm">Lead created</p>
                                    <p className="text-xs text-muted">{formatDate(lead.createdAt)}</p>
                                </div>
                            </div>

                            {lead.updatedAt !== lead.createdAt && (
                                <div className="flex gap-3">
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-info)', marginTop: 6 }} />
                                    <div>
                                        <p className="text-sm">Last updated</p>
                                        <p className="text-xs text-muted">{formatDate(lead.updatedAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
