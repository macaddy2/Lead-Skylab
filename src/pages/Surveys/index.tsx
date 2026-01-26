import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { Survey } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const icons = {
    plus: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
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
    clipboard: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        </svg>
    ),
};

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function Surveys() {
    const { state, dispatch } = useData();
    const { surveys } = state;

    const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newSurvey, setNewSurvey] = useState({
        title: '',
        description: '',
        type: 'pmf' as Survey['type'],
    });

    const filteredSurveys = surveys.filter((survey) => {
        if (filter === 'all') return true;
        return survey.status === filter;
    });

    const handleCreate = () => {
        if (!newSurvey.title) return;

        // Default questions based on type
        const defaultQuestions = newSurvey.type === 'pmf' ? [
            {
                id: uuidv4(),
                type: 'single_choice' as const,
                question: 'How would you feel if you could no longer use this product?',
                required: true,
                options: ['Very disappointed', 'Somewhat disappointed', 'Not disappointed'],
                order: 0,
            },
            {
                id: uuidv4(),
                type: 'open_ended' as const,
                question: 'What is the main benefit you receive from this product?',
                required: false,
                order: 1,
            },
            {
                id: uuidv4(),
                type: 'open_ended' as const,
                question: 'How can we improve this product for you?',
                required: false,
                order: 2,
            },
        ] : newSurvey.type === 'nps' ? [
            {
                id: uuidv4(),
                type: 'nps' as const,
                question: 'How likely are you to recommend our product to a friend or colleague?',
                required: true,
                min: 0,
                max: 10,
                order: 0,
            },
            {
                id: uuidv4(),
                type: 'open_ended' as const,
                question: 'What is the primary reason for your score?',
                required: false,
                order: 1,
            },
        ] : [];

        const survey: Survey = {
            id: uuidv4(),
            title: newSurvey.title,
            description: newSurvey.description,
            status: 'draft',
            type: newSurvey.type,
            questions: defaultQuestions,
            settings: {
                showProgressBar: true,
                allowAnonymous: true,
                thankYouMessage: 'Thank you for your feedback!',
            },
            responses: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_SURVEY', payload: survey });
        setShowCreateModal(false);
        setNewSurvey({ title: '', description: '', type: 'pmf' });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this survey?')) {
            dispatch({ type: 'DELETE_SURVEY', payload: id });
        }
    };

    const toggleStatus = (survey: Survey) => {
        dispatch({
            type: 'UPDATE_SURVEY',
            payload: {
                ...survey,
                status: survey.status === 'active' ? 'closed' : 'active',
                updatedAt: new Date().toISOString(),
            },
        });
    };

    // Calculate NPS for a survey
    const calculateNPS = (survey: Survey) => {
        const npsResponses = survey.responses
            .map(r => r.answers.find(a => {
                const q = survey.questions.find(q => q.id === a.questionId);
                return q?.type === 'nps';
            }))
            .filter(a => a && typeof a.value === 'number')
            .map(a => a!.value as number);

        if (npsResponses.length === 0) return { score: 0, promoters: 0, passives: 0, detractors: 0 };

        const promoters = npsResponses.filter(s => s >= 9).length;
        const passives = npsResponses.filter(s => s >= 7 && s <= 8).length;
        const detractors = npsResponses.filter(s => s <= 6).length;
        const total = npsResponses.length;
        const score = Math.round(((promoters - detractors) / total) * 100);

        return { score, promoters, passives, detractors };
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Surveys</h1>
                    <p className="page-subtitle">Collect feedback and measure satisfaction</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    {icons.plus}
                    New Survey
                </button>
            </div>

            {/* Templates */}
            <div className="grid grid-cols-3 mb-6">
                <div
                    className="card"
                    style={{ padding: 'var(--space-5)', cursor: 'pointer' }}
                    onClick={() => {
                        setNewSurvey({ title: 'PMF Survey', description: 'Measure product-market fit', type: 'pmf' });
                        setShowCreateModal(true);
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--gradient-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            📊
                        </div>
                        <div>
                            <h3 className="font-semibold">PMF Survey</h3>
                            <p className="text-xs text-muted">Sean Ellis test</p>
                        </div>
                    </div>
                </div>

                <div
                    className="card"
                    style={{ padding: 'var(--space-5)', cursor: 'pointer' }}
                    onClick={() => {
                        setNewSurvey({ title: 'NPS Survey', description: 'Measure customer loyalty', type: 'nps' });
                        setShowCreateModal(true);
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--gradient-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            📈
                        </div>
                        <div>
                            <h3 className="font-semibold">NPS Survey</h3>
                            <p className="text-xs text-muted">Net Promoter Score</p>
                        </div>
                    </div>
                </div>

                <div
                    className="card"
                    style={{ padding: 'var(--space-5)', cursor: 'pointer' }}
                    onClick={() => {
                        setNewSurvey({ title: '', description: '', type: 'custom' });
                        setShowCreateModal(true);
                    }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--color-bg-tertiary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed var(--glass-border)',
                            }}
                        >
                            {icons.plus}
                        </div>
                        <div>
                            <h3 className="font-semibold">Custom Survey</h3>
                            <p className="text-xs text-muted">Start from scratch</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="tabs" style={{ maxWidth: '350px' }}>
                <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    All ({surveys.length})
                </button>
                <button className={`tab ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
                    Active
                </button>
                <button className={`tab ${filter === 'closed' ? 'active' : ''}`} onClick={() => setFilter('closed')}>
                    Closed
                </button>
            </div>

            {/* Surveys List */}
            {filteredSurveys.length > 0 ? (
                <div className="grid grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                    {filteredSurveys.map((survey) => {
                        const nps = calculateNPS(survey);
                        const responseCount = survey.responses.length;
                        const npsData = [
                            { name: 'Promoters', value: nps.promoters, fill: COLORS[0] },
                            { name: 'Passives', value: nps.passives, fill: COLORS[1] },
                            { name: 'Detractors', value: nps.detractors, fill: COLORS[2] },
                        ].filter(d => d.value > 0);

                        return (
                            <div key={survey.id} className="card" style={{ padding: 'var(--space-6)' }}>
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg">{survey.title}</h3>
                                            <span className={`badge ${survey.status === 'active' ? 'badge-success' : survey.status === 'closed' ? 'badge-error' : 'badge-warning'}`}>
                                                {survey.status}
                                            </span>
                                        </div>
                                        {survey.description && (
                                            <p className="text-sm text-muted">{survey.description}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            style={{ color: 'var(--color-error)' }}
                                            onClick={() => handleDelete(survey.id)}
                                        >
                                            {icons.trash}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2" style={{ gap: 'var(--space-4)' }}>
                                    {/* Stats */}
                                    <div
                                        className="card"
                                        style={{ padding: 'var(--space-4)', background: 'var(--color-bg-tertiary)' }}
                                    >
                                        <div className="text-center mb-3">
                                            <div className="text-3xl font-bold">{responseCount}</div>
                                            <p className="text-xs text-muted">Responses</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-sm">{survey.questions.length} questions</div>
                                        </div>
                                    </div>

                                    {/* NPS Chart or placeholder */}
                                    <div
                                        className="card"
                                        style={{ padding: 'var(--space-4)', background: 'var(--color-bg-tertiary)' }}
                                    >
                                        {npsData.length > 0 ? (
                                            <>
                                                <div style={{ height: '80px' }}>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={npsData}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={20}
                                                                outerRadius={35}
                                                                dataKey="value"
                                                            >
                                                                {npsData.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                                <div className="text-center">
                                                    <span className="text-sm font-medium">NPS: {nps.score}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center text-muted text-sm" style={{ paddingTop: 'var(--space-6)' }}>
                                                No responses yet
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <Link to={`/surveys/${survey.id}`} className="btn btn-secondary btn-sm flex-1">
                                        Edit
                                    </Link>
                                    <button
                                        className={`btn btn-sm flex-1 ${survey.status === 'active' ? 'btn-ghost' : 'btn-primary'}`}
                                        onClick={() => toggleStatus(survey)}
                                    >
                                        {survey.status === 'active' ? 'Close' : 'Activate'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card empty-state">
                    <div className="empty-state-icon">{icons.clipboard}</div>
                    <h3 className="empty-state-title">No surveys yet</h3>
                    <p className="empty-state-description">
                        Create a survey to collect feedback from your users.
                    </p>
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        {icons.plus}
                        Create Survey
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Create Survey</h2>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                                {icons.close}
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group mb-4">
                                <label className="input-label">Survey Title *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={newSurvey.title}
                                    onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                                    placeholder="e.g., Product Feedback Survey"
                                />
                            </div>

                            <div className="input-group mb-4">
                                <label className="input-label">Description</label>
                                <textarea
                                    className="input"
                                    value={newSurvey.description}
                                    onChange={(e) => setNewSurvey({ ...newSurvey, description: e.target.value })}
                                    placeholder="Brief description of the survey"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Survey Type</label>
                                <select
                                    className="input"
                                    value={newSurvey.type}
                                    onChange={(e) => setNewSurvey({ ...newSurvey, type: e.target.value as Survey['type'] })}
                                >
                                    <option value="pmf">PMF Survey (Sean Ellis)</option>
                                    <option value="nps">NPS Survey</option>
                                    <option value="csat">CSAT Survey</option>
                                    <option value="custom">Custom Survey</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={!newSurvey.title}
                            >
                                Create Survey
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
