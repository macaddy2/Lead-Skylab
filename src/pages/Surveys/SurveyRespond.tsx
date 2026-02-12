// Public Survey Response Page
// Accessible without authentication at /survey/:id/respond
import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { SurveyQuestion, SurveyAnswer, SurveyResponse } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export default function SurveyRespond() {
    const { id } = useParams();
    const { state, dispatch } = useData();

    const survey = useMemo(() => state.surveys.find(s => s.id === id), [state.surveys, id]);

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!survey) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Survey Not Found</h2>
                    <p style={styles.subtitle}>This survey doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    if (survey.status !== 'active') {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={styles.title}>{survey.title}</h2>
                    <p style={styles.subtitle}>This survey is no longer accepting responses.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>&#10003;</div>
                        <h2 style={styles.title}>{survey.settings.thankYouMessage}</h2>
                        <p style={styles.subtitle}>Your response has been recorded.</p>
                    </div>
                </div>
            </div>
        );
    }

    const questions = survey.questions;
    const totalSteps = questions.length + (survey.settings.allowAnonymous ? 0 : 1);
    const progress = totalSteps > 0 ? ((currentStep) / totalSteps) * 100 : 0;

    const setAnswer = (questionId: string, value: string | number | string[]) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        setError(null);
    };

    const toggleMultiChoice = (questionId: string, option: string) => {
        const current = (answers[questionId] as string[]) || [];
        const updated = current.includes(option)
            ? current.filter(o => o !== option)
            : [...current, option];
        setAnswer(questionId, updated);
    };

    const canProceed = () => {
        if (currentStep === 0 && !survey.settings.allowAnonymous) {
            return email.trim().length > 0 && email.includes('@');
        }
        const qIndex = survey.settings.allowAnonymous ? currentStep : currentStep - 1;
        if (qIndex < 0 || qIndex >= questions.length) return true;
        const question = questions[qIndex];
        if (!question.required) return true;
        const answer = answers[question.id];
        if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) return false;
        return true;
    };

    const handleNext = () => {
        if (!canProceed()) {
            setError('This field is required');
            return;
        }
        setError(null);
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    };

    const handleSubmit = () => {
        const surveyAnswers: SurveyAnswer[] = questions.map(q => ({
            questionId: q.id,
            value: answers[q.id] ?? '',
        }));

        const response: SurveyResponse = {
            id: uuidv4(),
            surveyId: survey.id,
            respondentEmail: email || undefined,
            answers: surveyAnswers,
            completedAt: new Date().toISOString(),
        };

        dispatch({
            type: 'UPDATE_SURVEY',
            payload: {
                ...survey,
                responses: [...survey.responses, response],
                updatedAt: new Date().toISOString(),
            },
        });

        setSubmitted(true);
    };

    const renderEmailStep = () => (
        <div>
            <p style={styles.questionText}>Before we start, please enter your email</p>
            <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="you@example.com"
                style={styles.textInput}
                autoFocus
            />
        </div>
    );

    const renderQuestion = (question: SurveyQuestion) => {
        switch (question.type) {
            case 'nps':
                return (
                    <div>
                        <p style={styles.questionText}>
                            {question.question || 'How likely are you to recommend us?'}
                            {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {Array.from({ length: 11 }, (_, i) => i).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setAnswer(question.id, n)}
                                    style={{
                                        ...styles.npsButton,
                                        background: answers[question.id] === n
                                            ? n <= 6 ? '#ef4444' : n <= 8 ? '#f59e0b' : '#22c55e'
                                            : '#f3f4f6',
                                        color: answers[question.id] === n ? 'white' : '#374151',
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Not likely</span>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Very likely</span>
                        </div>
                    </div>
                );

            case 'rating':
                return (
                    <div>
                        <p style={styles.questionText}>
                            {question.question}
                            {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            {[1, 2, 3, 4, 5].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setAnswer(question.id, n)}
                                    style={{
                                        ...styles.ratingButton,
                                        background: (answers[question.id] as number) >= n
                                            ? '#f59e0b'
                                            : '#f3f4f6',
                                        transform: (answers[question.id] as number) >= n ? 'scale(1.15)' : 'scale(1)',
                                    }}
                                >
                                    &#9733;
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'single_choice':
                return (
                    <div>
                        <p style={styles.questionText}>
                            {question.question}
                            {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {question.options?.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setAnswer(question.id, option)}
                                    style={{
                                        ...styles.choiceButton,
                                        borderColor: answers[question.id] === option ? '#667eea' : '#e5e7eb',
                                        background: answers[question.id] === option ? '#eef2ff' : 'white',
                                    }}
                                >
                                    <span style={{
                                        ...styles.radioCircle,
                                        borderColor: answers[question.id] === option ? '#667eea' : '#d1d5db',
                                        background: answers[question.id] === option ? '#667eea' : 'white',
                                    }} />
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'multiple_choice':
                return (
                    <div>
                        <p style={styles.questionText}>
                            {question.question}
                            {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                        </p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '12px' }}>Select all that apply</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {question.options?.map((option) => {
                                const selected = ((answers[question.id] as string[]) || []).includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => toggleMultiChoice(question.id, option)}
                                        style={{
                                            ...styles.choiceButton,
                                            borderColor: selected ? '#667eea' : '#e5e7eb',
                                            background: selected ? '#eef2ff' : 'white',
                                        }}
                                    >
                                        <span style={{
                                            ...styles.checkbox,
                                            borderColor: selected ? '#667eea' : '#d1d5db',
                                            background: selected ? '#667eea' : 'white',
                                            color: selected ? 'white' : 'transparent',
                                        }}>&#10003;</span>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'open_ended':
                return (
                    <div>
                        <p style={styles.questionText}>
                            {question.question}
                            {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                        </p>
                        <textarea
                            value={(answers[question.id] as string) || ''}
                            onChange={(e) => setAnswer(question.id, e.target.value)}
                            placeholder="Type your answer..."
                            style={{ ...styles.textInput, minHeight: '120px', resize: 'vertical' }}
                        />
                    </div>
                );

            case 'scale':
                return (
                    <div>
                        <p style={styles.questionText}>
                            {question.question}
                            {question.required && <span style={{ color: '#ef4444' }}> *</span>}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {Array.from({ length: (question.max || 5) - (question.min || 1) + 1 }, (_, i) => i + (question.min || 1)).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setAnswer(question.id, n)}
                                    style={{
                                        ...styles.scaleButton,
                                        background: answers[question.id] === n ? '#667eea' : '#f3f4f6',
                                        color: answers[question.id] === n ? 'white' : '#374151',
                                    }}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const showEmailFirst = !survey.settings.allowAnonymous;
    const qIndex = showEmailFirst ? currentStep - 1 : currentStep;
    const currentQuestion = qIndex >= 0 && qIndex < questions.length ? questions[qIndex] : null;
    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h2 style={styles.title}>{survey.title}</h2>
                    {survey.description && <p style={styles.subtitle}>{survey.description}</p>}
                </div>

                {/* Progress Bar */}
                {survey.settings.showProgressBar && (
                    <div style={styles.progressTrack}>
                        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
                    </div>
                )}

                {/* Step Counter */}
                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>
                    {currentStep + 1} of {totalSteps}
                </p>

                {/* Question Content */}
                <div style={{ minHeight: '160px' }}>
                    {showEmailFirst && currentStep === 0
                        ? renderEmailStep()
                        : currentQuestion && renderQuestion(currentQuestion)
                    }
                </div>

                {/* Error */}
                {error && (
                    <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px' }}>{error}</p>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        style={{
                            ...styles.navButton,
                            opacity: currentStep === 0 ? 0.3 : 1,
                            cursor: currentStep === 0 ? 'default' : 'pointer',
                        }}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        style={styles.primaryButton}
                    >
                        {isLastStep ? 'Submit' : 'Next'}
                    </button>
                </div>
            </div>

            {/* Branding */}
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '24px' }}>
                Powered by Lead Skylab
            </p>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
    },
    card: {
        width: '100%',
        maxWidth: '560px',
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1a1a2e',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '0.95rem',
        color: '#6b7280',
    },
    progressTrack: {
        height: '4px',
        background: '#e5e7eb',
        borderRadius: '2px',
        marginBottom: '8px',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea, #764ba2)',
        borderRadius: '2px',
        transition: 'width 0.3s ease',
    },
    questionText: {
        fontSize: '1.1rem',
        fontWeight: 500,
        color: '#1f2937',
        marginBottom: '20px',
        lineHeight: 1.5,
    },
    textInput: {
        width: '100%',
        padding: '14px 16px',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.2s',
        fontFamily: 'inherit',
    },
    npsButton: {
        width: '40px',
        height: '40px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 600,
        transition: 'all 0.15s ease',
    },
    ratingButton: {
        width: '48px',
        height: '48px',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '24px',
        transition: 'all 0.15s ease',
    },
    choiceButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        border: '2px solid #e5e7eb',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '0.95rem',
        textAlign: 'left' as const,
        transition: 'all 0.15s ease',
        background: 'white',
    },
    radioCircle: {
        display: 'inline-block',
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        border: '2px solid #d1d5db',
        flexShrink: 0,
    },
    checkbox: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        borderRadius: '4px',
        border: '2px solid #d1d5db',
        flexShrink: 0,
        fontSize: '12px',
        fontWeight: 700,
    },
    scaleButton: {
        width: '44px',
        height: '44px',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 600,
        transition: 'all 0.15s ease',
    },
    navButton: {
        padding: '10px 24px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        background: 'white',
        color: '#6b7280',
        fontSize: '0.95rem',
        fontWeight: 500,
        cursor: 'pointer',
    },
    primaryButton: {
        padding: '10px 32px',
        border: 'none',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '0.95rem',
        fontWeight: 600,
        cursor: 'pointer',
    },
};
