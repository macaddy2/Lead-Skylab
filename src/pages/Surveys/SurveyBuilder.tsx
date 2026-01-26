import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { Survey, SurveyQuestion } from '../../types';
import { v4 as uuidv4 } from 'uuid';

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
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    grip: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
        </svg>
    ),
};

const questionTypes = [
    { value: 'nps', label: 'NPS (0-10)' },
    { value: 'rating', label: 'Rating (1-5)' },
    { value: 'single_choice', label: 'Single Choice' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'open_ended', label: 'Open Ended' },
    { value: 'scale', label: 'Scale' },
];

export default function SurveyBuilder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, dispatch } = useData();

    const existingSurvey = id ? state.surveys.find(s => s.id === id) : null;

    const [survey, setSurvey] = useState<Survey>(() => {
        if (existingSurvey) return existingSurvey;
        return {
            id: uuidv4(),
            title: 'New Survey',
            description: '',
            status: 'draft',
            type: 'custom',
            questions: [],
            settings: {
                showProgressBar: true,
                allowAnonymous: true,
                thankYouMessage: 'Thank you for your feedback!',
            },
            responses: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    });

    const [activeTab, setActiveTab] = useState<'questions' | 'settings' | 'preview'>('questions');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (existingSurvey) {
            setSurvey(existingSurvey);
        }
    }, [existingSurvey]);

    const handleSave = () => {
        setIsSaving(true);
        const updatedSurvey = { ...survey, updatedAt: new Date().toISOString() };

        if (existingSurvey) {
            dispatch({ type: 'UPDATE_SURVEY', payload: updatedSurvey });
        } else {
            dispatch({ type: 'ADD_SURVEY', payload: updatedSurvey });
        }

        setTimeout(() => {
            setIsSaving(false);
            if (!existingSurvey) {
                navigate(`/surveys/${survey.id}`);
            }
        }, 500);
    };

    const addQuestion = (type: SurveyQuestion['type']) => {
        const newQuestion: SurveyQuestion = {
            id: uuidv4(),
            type,
            question: '',
            required: false,
            order: survey.questions.length,
            ...(type === 'nps' ? { min: 0, max: 10 } : {}),
            ...(type === 'rating' ? { min: 1, max: 5 } : {}),
            ...(type === 'single_choice' || type === 'multiple_choice' ? { options: ['Option 1', 'Option 2'] } : {}),
        };
        setSurvey({ ...survey, questions: [...survey.questions, newQuestion] });
    };

    const updateQuestion = (questionId: string, updates: Partial<SurveyQuestion>) => {
        setSurvey({
            ...survey,
            questions: survey.questions.map(q =>
                q.id === questionId ? { ...q, ...updates } : q
            ),
        });
    };

    const removeQuestion = (questionId: string) => {
        setSurvey({
            ...survey,
            questions: survey.questions.filter(q => q.id !== questionId),
        });
    };

    const addOption = (questionId: string) => {
        const question = survey.questions.find(q => q.id === questionId);
        if (question && question.options) {
            updateQuestion(questionId, {
                options: [...question.options, `Option ${question.options.length + 1}`],
            });
        }
    };

    const updateOption = (questionId: string, index: number, value: string) => {
        const question = survey.questions.find(q => q.id === questionId);
        if (question && question.options) {
            const newOptions = [...question.options];
            newOptions[index] = value;
            updateQuestion(questionId, { options: newOptions });
        }
    };

    const removeOption = (questionId: string, index: number) => {
        const question = survey.questions.find(q => q.id === questionId);
        if (question && question.options && question.options.length > 2) {
            updateQuestion(questionId, {
                options: question.options.filter((_, i) => i !== index),
            });
        }
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/surveys')}>
                        {icons.back}
                    </button>
                    <div>
                        <input
                            type="text"
                            value={survey.title}
                            onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: 'var(--font-size-2xl)',
                                fontWeight: 'var(--font-weight-bold)',
                                color: 'var(--color-text-primary)',
                                outline: 'none',
                                width: '100%',
                                maxWidth: '400px',
                            }}
                        />
                        <p className="text-sm text-muted mt-1">
                            {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <span className={`badge ${survey.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {survey.status}
                    </span>
                    <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : icons.save}
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ maxWidth: '400px' }}>
                <button className={`tab ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>
                    Questions
                </button>
                <button className={`tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    Settings
                </button>
                <button className={`tab ${activeTab === 'preview' ? 'active' : ''}`} onClick={() => setActiveTab('preview')}>
                    Preview
                </button>
            </div>

            {/* Questions Tab */}
            {activeTab === 'questions' && (
                <div>
                    {/* Add Question Buttons */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        {questionTypes.map(type => (
                            <button
                                key={type.value}
                                className="btn btn-secondary btn-sm"
                                onClick={() => addQuestion(type.value as SurveyQuestion['type'])}
                            >
                                {icons.plus}
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Questions List */}
                    <div className="flex flex-col gap-4">
                        {survey.questions.map((question, index) => (
                            <div key={question.id} className="card" style={{ padding: 'var(--space-5)' }}>
                                <div className="flex items-start gap-4">
                                    <div style={{ color: 'var(--color-text-muted)', cursor: 'grab' }}>
                                        {icons.grip}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-sm text-muted">Q{index + 1}</span>
                                            <select
                                                className="input"
                                                style={{ width: '150px' }}
                                                value={question.type}
                                                onChange={(e) => updateQuestion(question.id, { type: e.target.value as SurveyQuestion['type'] })}
                                            >
                                                {questionTypes.map(type => (
                                                    <option key={type.value} value={type.value}>{type.label}</option>
                                                ))}
                                            </select>
                                            <label className="flex items-center gap-2 text-sm text-muted">
                                                <input
                                                    type="checkbox"
                                                    checked={question.required}
                                                    onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
                                                />
                                                Required
                                            </label>
                                        </div>

                                        <input
                                            type="text"
                                            className="input mb-3"
                                            placeholder="Enter your question..."
                                            value={question.question}
                                            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                        />

                                        {/* Options for choice questions */}
                                        {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
                                            <div className="flex flex-col gap-2 ml-4">
                                                {question.options.map((option, optIndex) => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <span style={{ width: 20, textAlign: 'center' }}>
                                                            {question.type === 'single_choice' ? '○' : '☐'}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            className="input"
                                                            style={{ flex: 1 }}
                                                            value={option}
                                                            onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                                        />
                                                        {question.options!.length > 2 && (
                                                            <button
                                                                className="btn btn-ghost btn-sm"
                                                                onClick={() => removeOption(question.id, optIndex)}
                                                            >
                                                                {icons.trash}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ alignSelf: 'flex-start' }}
                                                    onClick={() => addOption(question.id)}
                                                >
                                                    {icons.plus}
                                                    Add Option
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        style={{ color: 'var(--color-error)' }}
                                        onClick={() => removeQuestion(question.id)}
                                    >
                                        {icons.trash}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {survey.questions.length === 0 && (
                        <div className="card empty-state">
                            <h3 className="empty-state-title">No questions yet</h3>
                            <p className="empty-state-description">Add your first question using the buttons above.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="card" style={{ padding: 'var(--space-6)', maxWidth: '600px' }}>
                    <h3 className="font-semibold mb-6">Survey Settings</h3>

                    <div className="input-group mb-4">
                        <label className="input-label">Description</label>
                        <textarea
                            className="input"
                            value={survey.description || ''}
                            onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                            placeholder="Brief description of the survey purpose"
                        />
                    </div>

                    <div className="input-group mb-4">
                        <label className="input-label">Thank You Message</label>
                        <input
                            type="text"
                            className="input"
                            value={survey.settings.thankYouMessage}
                            onChange={(e) => setSurvey({
                                ...survey,
                                settings: { ...survey.settings, thankYouMessage: e.target.value }
                            })}
                        />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="font-medium">Show Progress Bar</p>
                            <p className="text-sm text-muted">Display progress during survey</p>
                        </div>
                        <button
                            className={`toggle ${survey.settings.showProgressBar ? 'active' : ''}`}
                            onClick={() => setSurvey({
                                ...survey,
                                settings: { ...survey.settings, showProgressBar: !survey.settings.showProgressBar }
                            })}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Allow Anonymous</p>
                            <p className="text-sm text-muted">Don't require email to submit</p>
                        </div>
                        <button
                            className={`toggle ${survey.settings.allowAnonymous ? 'active' : ''}`}
                            onClick={() => setSurvey({
                                ...survey,
                                settings: { ...survey.settings, allowAnonymous: !survey.settings.allowAnonymous }
                            })}
                        />
                    </div>
                </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
                <div
                    className="card"
                    style={{
                        maxWidth: '600px',
                        padding: 'var(--space-8)',
                        background: 'white',
                        color: '#1a1a2e',
                    }}
                >
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: 'var(--space-2)', color: '#1a1a2e' }}>
                        {survey.title}
                    </h2>
                    {survey.description && (
                        <p style={{ color: '#666', marginBottom: 'var(--space-6)' }}>{survey.description}</p>
                    )}

                    {survey.settings.showProgressBar && (
                        <div className="progress mb-6" style={{ height: '4px' }}>
                            <div className="progress-bar primary" style={{ width: '0%' }} />
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {survey.questions.map((question, index) => (
                            <div key={question.id}>
                                <p style={{ fontWeight: '500', marginBottom: 'var(--space-3)', color: '#333' }}>
                                    {index + 1}. {question.question || 'Question text'}
                                    {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                                </p>

                                {question.type === 'nps' && (
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <button
                                                key={n}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                }}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {question.type === 'rating' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {'⭐'.repeat(n)}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {(question.type === 'single_choice' || question.type === 'multiple_choice') && question.options && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {question.options.map((option, i) => (
                                            <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input type={question.type === 'single_choice' ? 'radio' : 'checkbox'} name={question.id} />
                                                <span>{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {question.type === 'open_ended' && (
                                    <textarea
                                        placeholder="Your answer..."
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            minHeight: '100px',
                                            fontSize: '14px',
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {survey.questions.length > 0 && (
                        <button
                            style={{
                                width: '100%',
                                padding: '12px',
                                marginTop: 'var(--space-8)',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Submit Survey
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
