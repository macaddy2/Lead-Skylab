import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import type { Lead, LeadStage, LeadSource } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const icons = {
    plus: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    search: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    ),
    filter: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    ),
    download: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
    ),
    grid: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
        </svg>
    ),
    list: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
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

const stageColors: Record<LeadStage, string> = {
    new: 'badge-info',
    contacted: 'badge-primary',
    qualified: 'badge-success',
    proposal: 'badge-warning',
    negotiation: 'badge-primary',
    won: 'badge-success',
    lost: 'badge-error',
};

const sourceLabels: Record<LeadSource, string> = {
    landing_page: 'Landing Page',
    referral: 'Referral',
    organic: 'Organic',
    social: 'Social',
    email: 'Email',
    paid_ad: 'Paid Ad',
    direct: 'Direct',
    other: 'Other',
};

export default function Leads() {
    const { state, dispatch, calculateLeadScore } = useData();
    const { addToast } = useToast();
    const { leads } = state;

    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState<LeadStage | 'all'>('all');
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'single' | 'bulk'; id?: string } | null>(null);

    // New lead form state
    const [newLead, setNewLead] = useState({
        email: '',
        name: '',
        company: '',
        source: 'landing_page' as LeadSource,
    });

    const filteredLeads = useMemo(() => {
        return leads.filter((lead) => {
            const matchesSearch =
                lead.name.toLowerCase().includes(search.toLowerCase()) ||
                lead.email.toLowerCase().includes(search.toLowerCase()) ||
                lead.company?.toLowerCase().includes(search.toLowerCase());
            const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
            return matchesSearch && matchesStage;
        });
    }, [leads, search, stageFilter]);

    const handleAddLead = () => {
        if (!newLead.email || !newLead.name) return;

        const lead: Lead = {
            id: uuidv4(),
            email: newLead.email,
            name: newLead.name,
            company: newLead.company,
            source: newLead.source,
            stage: 'new',
            score: calculateLeadScore({ ...newLead, stage: 'new', tags: [] }),
            tags: [],
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_LEAD', payload: lead });
        addToast('success', `${lead.name} added to pipeline`);
        setShowAddModal(false);
        setNewLead({ email: '', name: '', company: '', source: 'landing_page' });
    };

    const handleDeleteLead = (id: string) => {
        setDeleteConfirm({ type: 'single', id });
    };

    const handleBulkDelete = () => {
        setDeleteConfirm({ type: 'bulk' });
    };

    const confirmDelete = () => {
        if (deleteConfirm?.type === 'single' && deleteConfirm.id) {
            dispatch({ type: 'DELETE_LEAD', payload: deleteConfirm.id });
            addToast('success', 'Lead deleted');
        } else if (deleteConfirm?.type === 'bulk') {
            selectedLeads.forEach((id) => dispatch({ type: 'DELETE_LEAD', payload: id }));
            addToast('success', `${selectedLeads.length} leads deleted`);
            setSelectedLeads([]);
        }
        setDeleteConfirm(null);
    };

    const handleExport = () => {
        const csv = [
            ['Name', 'Email', 'Company', 'Source', 'Stage', 'Score', 'Created'].join(','),
            ...filteredLeads.map((lead) => [
                lead.name,
                lead.email,
                lead.company || '',
                lead.source,
                lead.stage,
                lead.score,
                new Date(lead.createdAt).toLocaleDateString(),
            ].join(',')),
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'leads.csv';
        a.click();
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 50) return 'var(--color-warning)';
        return 'var(--color-text-muted)';
    };

    // Kanban data
    const stages: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'];

    return (
        <div className="animate-fadeIn">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Leads</h1>
                    <p className="page-subtitle">{leads.length} total leads in your pipeline</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary" onClick={handleExport}>
                        {icons.download}
                        Export
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        {icons.plus}
                        Add Lead
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                            {icons.search}
                        </span>
                        <input
                            type="text"
                            placeholder="Search leads..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input"
                            style={{ paddingLeft: 'var(--space-10)', width: '300px' }}
                        />
                    </div>

                    {/* Stage Filter */}
                    <select
                        className="input"
                        style={{ width: '160px' }}
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value as LeadStage | 'all')}
                    >
                        <option value="all">All Stages</option>
                        {stages.map((stage) => (
                            <option key={stage} value={stage}>
                                {stage.charAt(0).toUpperCase() + stage.slice(1)}
                            </option>
                        ))}
                    </select>

                    {selectedLeads.length > 0 && (
                        <button className="btn btn-ghost" style={{ color: 'var(--color-error)' }} onClick={handleBulkDelete}>
                            {icons.trash}
                            Delete ({selectedLeads.length})
                        </button>
                    )}
                </div>

                {/* View Toggle */}
                <div className="tabs" style={{ width: 'auto', marginBottom: 0 }}>
                    <button
                        className={`tab ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                        style={{ padding: 'var(--space-2) var(--space-3)' }}
                    >
                        {icons.list}
                    </button>
                    <button
                        className={`tab ${viewMode === 'kanban' ? 'active' : ''}`}
                        onClick={() => setViewMode('kanban')}
                        style={{ padding: 'var(--space-2) var(--space-3)' }}
                    >
                        {icons.grid}
                    </button>
                </div>
            </div>

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedLeads(filteredLeads.map(l => l.id));
                                            } else {
                                                setSelectedLeads([]);
                                            }
                                        }}
                                    />
                                </th>
                                <th>Lead</th>
                                <th>Source</th>
                                <th>Stage</th>
                                <th>Score</th>
                                <th>Created</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map((lead) => (
                                <tr key={lead.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.includes(lead.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedLeads([...selectedLeads, lead.id]);
                                                } else {
                                                    setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <Link to={`/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar avatar-sm">
                                                    {lead.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{lead.name}</div>
                                                    <div className="text-sm text-muted">{lead.email}</div>
                                                </div>
                                            </div>
                                        </Link>
                                    </td>
                                    <td>{sourceLabels[lead.source]}</td>
                                    <td>
                                        <span className={`badge ${stageColors[lead.stage]}`}>
                                            {lead.stage}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <div
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    background: getScoreColor(lead.score)
                                                }}
                                            />
                                            <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{lead.score}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted">{formatDate(lead.createdAt)}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            <Link to={`/leads/${lead.id}`} className="btn btn-ghost btn-sm">
                                                Edit
                                            </Link>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                style={{ color: 'var(--color-error)' }}
                                                onClick={() => handleDeleteLead(lead.id)}
                                            >
                                                {icons.trash}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
                <div className="kanban-board">
                    {stages.map((stage) => {
                        const stageLeads = filteredLeads.filter(l => l.stage === stage);
                        return (
                            <div key={stage} className="kanban-column">
                                <div className="kanban-column-header">
                                    <div className="flex items-center gap-2">
                                        <span className={`badge ${stageColors[stage]}`}>{stage}</span>
                                        <span className="text-sm text-muted">({stageLeads.length})</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {stageLeads.map((lead) => (
                                        <Link key={lead.id} to={`/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
                                            <div className="kanban-card">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="avatar avatar-sm">{lead.name.charAt(0)}</div>
                                                    <div className="font-medium text-sm">{lead.name}</div>
                                                </div>
                                                <p className="text-xs text-muted mb-2">{lead.email}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-muted">{lead.company || 'No company'}</span>
                                                    <div
                                                        className="flex items-center gap-1 text-xs"
                                                        style={{ color: getScoreColor(lead.score) }}
                                                    >
                                                        <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{lead.score}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {filteredLeads.length === 0 && (
                <div className="card empty-state">
                    <h3 className="empty-state-title">No leads found</h3>
                    <p className="empty-state-description">
                        {search || stageFilter !== 'all'
                            ? 'Try adjusting your filters.'
                            : 'Add your first lead to get started.'}
                    </p>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteConfirm}
                title={deleteConfirm?.type === 'bulk' ? 'Delete Multiple Leads' : 'Delete Lead'}
                message={
                    deleteConfirm?.type === 'bulk'
                        ? `Are you sure you want to delete ${selectedLeads.length} leads? This action cannot be undone.`
                        : 'Are you sure you want to delete this lead? This action cannot be undone.'
                }
                confirmLabel="Delete"
                destructive
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm(null)}
            />

            {/* Add Lead Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Add New Lead</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowAddModal(false)}>
                                {icons.close}
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-4">
                                <label className="input-label">Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newLead.name}
                                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                    placeholder="John Smith"
                                />
                            </div>
                            <div className="input-group mb-4">
                                <label className="input-label">Email *</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={newLead.email}
                                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="input-group mb-4">
                                <label className="input-label">Company</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newLead.company}
                                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                                    placeholder="Acme Inc"
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Source</label>
                                <select
                                    className="input"
                                    value={newLead.source}
                                    onChange={(e) => setNewLead({ ...newLead, source: e.target.value as LeadSource })}
                                >
                                    {Object.entries(sourceLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAddLead}
                                disabled={!newLead.email || !newLead.name}
                            >
                                Add Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
