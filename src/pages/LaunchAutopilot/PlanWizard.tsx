import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import { v4 as uuidv4 } from 'uuid';
import type { LaunchPlan, PlanInputMode, LaunchPhase } from '../../types';
import { getDefaultPreferences } from '../../types';

type WizardStep = 'mode' | 'details' | 'phases' | 'preferences' | 'review';

const PlanWizard: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { state, dispatch } = useData();
    const templateId = searchParams.get('template');
    const selectedTemplate = templateId
        ? state.launchTemplates.find(t => t.id === templateId)
        : null;

    const [step, setStep] = useState<WizardStep>(selectedTemplate ? 'details' : 'mode');
    const [inputMode, setInputMode] = useState<PlanInputMode>(selectedTemplate ? 'manual' : 'manual');
    const [planName, setPlanName] = useState('');
    const [productName, setProductName] = useState('');
    const [productUrl, setProductUrl] = useState('');
    const [description, setDescription] = useState('');
    const [launchDate, setLaunchDate] = useState('');
    const [importedDoc, setImportedDoc] = useState('');
    const [phases, setPhases] = useState<Omit<LaunchPhase, 'id' | 'contentItems'>[]>(
        selectedTemplate?.defaultPhases.map(p => ({
            type: p.type,
            name: p.name,
            description: p.description,
            startDate: '',
            endDate: '',
            milestones: p.suggestedMilestones.map(m => ({
                id: uuidv4(),
                title: m,
                dueDate: '',
                completed: false,
            })),
            status: 'pending' as const,
        })) || []
    );
    const [preferences, setPreferences] = useState(
        selectedTemplate?.defaultPreferences
            ? { ...getDefaultPreferences(), ...selectedTemplate.defaultPreferences }
            : getDefaultPreferences()
    );

    const handleModeSelect = (mode: PlanInputMode) => {
        setInputMode(mode);
        if (mode === 'manual') {
            setPhases([
                { type: 'pre_launch', name: 'Pre-Launch', description: 'Build anticipation', startDate: '', endDate: '', milestones: [], status: 'pending' },
                { type: 'launch_day', name: 'Launch Day', description: 'Maximum visibility', startDate: '', endDate: '', milestones: [], status: 'pending' },
                { type: 'growth', name: 'Growth', description: 'Sustain momentum', startDate: '', endDate: '', milestones: [], status: 'pending' },
            ]);
        }
        setStep('details');
    };

    const handleNext = () => {
        const steps: WizardStep[] = ['mode', 'details', 'phases', 'preferences', 'review'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex < steps.length - 1) {
            setStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const steps: WizardStep[] = ['mode', 'details', 'phases', 'preferences', 'review'];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) {
            setStep(steps[currentIndex - 1]);
        }
    };

    const handleCreate = () => {
        const now = new Date().toISOString();
        const newPlan: LaunchPlan = {
            id: uuidv4(),
            name: planName,
            description,
            productName,
            productUrl,
            status: 'draft',
            inputMode,
            phases: phases.map(p => ({
                ...p,
                id: uuidv4(),
                contentItems: [],
            })),
            preferences,
            startDate: now,
            launchDate,
            createdAt: now,
            updatedAt: now,
        };
        dispatch({ type: 'ADD_LAUNCH_PLAN', payload: newPlan });
        navigate(`/autopilot/plans/${newPlan.id}`);
    };

    const togglePlatform = (platform: string) => {
        const enabled = preferences.enabledPlatforms as string[];
        setPreferences({
            ...preferences,
            enabledPlatforms: enabled.includes(platform)
                ? enabled.filter(p => p !== platform) as typeof preferences.enabledPlatforms
                : [...enabled, platform] as typeof preferences.enabledPlatforms,
        });
    };

    return (
        <div className="plan-wizard">
            <div className="wizard-header">
                <h1>Create Launch Plan</h1>
                <div className="wizard-steps">
                    {['mode', 'details', 'phases', 'preferences', 'review'].map((s, i) => (
                        <div
                            key={s}
                            className={`step-indicator ${step === s ? 'active' : ''} ${['mode', 'details', 'phases', 'preferences', 'review'].indexOf(step) > i ? 'completed' : ''}`}
                        >
                            <span className="step-number">{i + 1}</span>
                            <span className="step-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="wizard-content glass-card">
                {/* Step 1: Mode Selection */}
                {step === 'mode' && (
                    <div className="step-content mode-selection">
                        <h2>How do you want to create your launch plan?</h2>
                        <p className="step-description">Choose the method that works best for you</p>

                        <div className="mode-cards">
                            <button
                                className="mode-card glass-card hover-lift"
                                onClick={() => handleModeSelect('import')}
                            >
                                <span className="mode-icon">📄</span>
                                <h3>Import Document</h3>
                                <p>Paste an existing launch plan, PRD, or marketing doc. AI will extract phases and content ideas.</p>
                            </button>

                            <button
                                className="mode-card glass-card hover-lift"
                                onClick={() => handleModeSelect('ai_analyze')}
                            >
                                <span className="mode-icon">🤖</span>
                                <h3>AI Analyze</h3>
                                <p>Enter your product URL and social handles. AI will analyze and create a tailored plan.</p>
                            </button>

                            <button
                                className="mode-card glass-card hover-lift"
                                onClick={() => handleModeSelect('manual')}
                            >
                                <span className="mode-icon">✏️</span>
                                <h3>Manual Setup</h3>
                                <p>Choose from templates and customize phases, milestones, and content cadence yourself.</p>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Details */}
                {step === 'details' && (
                    <div className="step-content details-form">
                        <h2>Launch Details</h2>
                        <p className="step-description">Tell us about your product launch</p>

                        {inputMode === 'import' && (
                            <div className="form-group">
                                <label>Paste Your Launch Document</label>
                                <textarea
                                    value={importedDoc}
                                    onChange={(e) => setImportedDoc(e.target.value)}
                                    placeholder="Paste your PRD, launch plan, or marketing document here..."
                                    rows={8}
                                    className="textarea-lg"
                                />
                                <p className="form-hint">AI will extract phases, milestones, and content ideas from your document.</p>
                            </div>
                        )}

                        <div className="form-grid">
                            <div className="form-group">
                                <label>Plan Name *</label>
                                <input
                                    type="text"
                                    value={planName}
                                    onChange={(e) => setPlanName(e.target.value)}
                                    placeholder="e.g., Lead Skylab V2 Launch"
                                />
                            </div>
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input
                                    type="text"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder="e.g., Lead Skylab"
                                />
                            </div>
                            <div className="form-group">
                                <label>Product URL</label>
                                <input
                                    type="url"
                                    value={productUrl}
                                    onChange={(e) => setProductUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Launch Date *</label>
                                <input
                                    type="date"
                                    value={launchDate}
                                    onChange={(e) => setLaunchDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Brief description of this launch..."
                                rows={3}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Phases */}
                {step === 'phases' && (
                    <div className="step-content phases-config">
                        <h2>Launch Phases</h2>
                        <p className="step-description">Configure your 4-phase launch timeline</p>

                        <div className="phases-list">
                            {phases.map((phase, index) => (
                                <div key={phase.type} className="phase-config glass-card">
                                    <div className="phase-header">
                                        <span className="phase-number">{index + 1}</span>
                                        <div className="phase-info">
                                            <input
                                                type="text"
                                                value={phase.name}
                                                onChange={(e) => {
                                                    const updated = [...phases];
                                                    updated[index] = { ...phase, name: e.target.value };
                                                    setPhases(updated);
                                                }}
                                                className="phase-name-input"
                                            />
                                            <span className="phase-type">{phase.type.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                    <div className="phase-dates">
                                        <div className="form-group">
                                            <label>Start</label>
                                            <input
                                                type="date"
                                                value={phase.startDate}
                                                onChange={(e) => {
                                                    const updated = [...phases];
                                                    updated[index] = { ...phase, startDate: e.target.value };
                                                    setPhases(updated);
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>End</label>
                                            <input
                                                type="date"
                                                value={phase.endDate}
                                                onChange={(e) => {
                                                    const updated = [...phases];
                                                    updated[index] = { ...phase, endDate: e.target.value };
                                                    setPhases(updated);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="phase-milestones">
                                        <label>Milestones</label>
                                        <div className="milestones-tags">
                                            {phase.milestones.map((m, mi) => (
                                                <span key={m.id} className="milestone-tag">
                                                    {m.title}
                                                    <button
                                                        className="remove-btn"
                                                        onClick={() => {
                                                            const updated = [...phases];
                                                            updated[index] = {
                                                                ...phase,
                                                                milestones: phase.milestones.filter((_, i) => i !== mi),
                                                            };
                                                            setPhases(updated);
                                                        }}
                                                    >×</button>
                                                </span>
                                            ))}
                                            <input
                                                type="text"
                                                placeholder="Add milestone..."
                                                className="milestone-input"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const input = e.target as HTMLInputElement;
                                                        if (input.value.trim()) {
                                                            const updated = [...phases];
                                                            updated[index] = {
                                                                ...phase,
                                                                milestones: [...phase.milestones, {
                                                                    id: uuidv4(),
                                                                    title: input.value.trim(),
                                                                    dueDate: '',
                                                                    completed: false,
                                                                }],
                                                            };
                                                            setPhases(updated);
                                                            input.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 4: Preferences */}
                {step === 'preferences' && (
                    <div className="step-content preferences-config">
                        <h2>Owner Preferences</h2>
                        <p className="step-description">Configure your content strategy, tone, and workflow</p>

                        <div className="preferences-sections">
                            <div className="pref-section">
                                <h3>🎯 Platforms</h3>
                                <div className="platform-toggles">
                                    {['twitter', 'linkedin', 'instagram', 'tiktok', 'reddit', 'facebook', 'email'].map(platform => (
                                        <button
                                            key={platform}
                                            className={`platform-toggle ${preferences.enabledPlatforms.includes(platform as typeof preferences.enabledPlatforms[0]) ? 'active' : ''}`}
                                            onClick={() => togglePlatform(platform)}
                                        >
                                            {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pref-section">
                                <h3>✅ Approval Workflow</h3>
                                <div className="approval-options">
                                    {[
                                        { value: 'daily_digest', label: 'Daily Digest', desc: 'Review batch of content each morning' },
                                        { value: 'individual_review', label: 'Individual Review', desc: 'Approve each piece before publishing' },
                                        { value: 'auto_publish', label: 'Auto Publish', desc: 'Trust AI to publish automatically' },
                                        { value: 'hybrid', label: 'Hybrid', desc: 'Auto for some platforms, manual for others' },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            className={`approval-option ${preferences.approvalMode === opt.value ? 'active' : ''}`}
                                            onClick={() => setPreferences({ ...preferences, approvalMode: opt.value as typeof preferences.approvalMode })}
                                        >
                                            <strong>{opt.label}</strong>
                                            <span>{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pref-section">
                                <h3>📝 Content Pillars</h3>
                                <div className="tags-input">
                                    {preferences.contentPillars.map((pillar, i) => (
                                        <span key={i} className="tag">
                                            {pillar}
                                            <button onClick={() => setPreferences({
                                                ...preferences,
                                                contentPillars: preferences.contentPillars.filter((_, idx) => idx !== i),
                                            })}>×</button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        placeholder="Add pillar..."
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                const input = e.target as HTMLInputElement;
                                                if (input.value.trim()) {
                                                    setPreferences({
                                                        ...preferences,
                                                        contentPillars: [...preferences.contentPillars, input.value.trim()],
                                                    });
                                                    input.value = '';
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="pref-section">
                                <h3>⏰ Weekend Posting</h3>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={preferences.postOnWeekends}
                                        onChange={(e) => setPreferences({ ...preferences, postOnWeekends: e.target.checked })}
                                    />
                                    <span className="toggle-slider"></span>
                                    <span className="toggle-label">Post on weekends</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Review */}
                {step === 'review' && (
                    <div className="step-content review-summary">
                        <h2>Review Your Plan</h2>
                        <p className="step-description">Make sure everything looks good before creating</p>

                        <div className="review-sections">
                            <div className="review-section">
                                <h4>📋 Plan Details</h4>
                                <dl>
                                    <dt>Name</dt><dd>{planName}</dd>
                                    <dt>Product</dt><dd>{productName}</dd>
                                    <dt>Launch Date</dt><dd>{launchDate}</dd>
                                    <dt>Input Mode</dt><dd>{inputMode}</dd>
                                </dl>
                            </div>

                            <div className="review-section">
                                <h4>📅 Phases ({phases.length})</h4>
                                <ul>
                                    {phases.map(p => (
                                        <li key={p.type}>
                                            <strong>{p.name}</strong> - {p.milestones.length} milestones
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="review-section">
                                <h4>🎯 Platforms</h4>
                                <div className="platform-badges">
                                    {preferences.enabledPlatforms.map(p => (
                                        <span key={p} className="platform-badge">{p}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="review-section">
                                <h4>✅ Approval</h4>
                                <p>{preferences.approvalMode.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="wizard-actions">
                {step !== 'mode' && (
                    <button className="btn btn-ghost" onClick={handleBack}>
                        ← Back
                    </button>
                )}
                <div className="spacer"></div>
                {step !== 'review' ? (
                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                        disabled={step === 'details' && (!planName || !productName || !launchDate)}
                    >
                        Continue →
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleCreate}>
                        🚀 Create Launch Plan
                    </button>
                )}
            </div>

            <style>{`
                .plan-wizard {
                    padding: var(--spacing-6);
                    max-width: 900px;
                    margin: 0 auto;
                }

                .wizard-header {
                    text-align: center;
                    margin-bottom: var(--spacing-6);
                }

                .wizard-header h1 {
                    margin-bottom: var(--spacing-6);
                    background: linear-gradient(135deg, var(--primary-400), var(--secondary-400));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .wizard-steps {
                    display: flex;
                    justify-content: center;
                    gap: var(--spacing-2);
                }

                .step-indicator {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: var(--spacing-2) var(--spacing-4);
                    border-radius: var(--radius-full);
                    background: var(--gray-800);
                    color: var(--gray-500);
                    font-size: 0.875rem;
                }

                .step-indicator.active {
                    background: var(--primary-600);
                    color: white;
                }

                .step-indicator.completed {
                    background: var(--success-600);
                    color: white;
                }

                .step-number {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                }

                .wizard-content {
                    padding: var(--spacing-8);
                    margin-bottom: var(--spacing-4);
                    min-height: 400px;
                }

                .step-content h2 {
                    margin-bottom: var(--spacing-2);
                    color: var(--gray-100);
                }

                .step-description {
                    color: var(--gray-400);
                    margin-bottom: var(--spacing-6);
                }

                .mode-cards {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--spacing-4);
                }

                .mode-card {
                    padding: var(--spacing-6);
                    text-align: center;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .mode-card:hover {
                    border-color: var(--primary-500);
                }

                .mode-icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: var(--spacing-4);
                }

                .mode-card h3 {
                    color: var(--gray-100);
                    margin-bottom: var(--spacing-2);
                }

                .mode-card p {
                    color: var(--gray-400);
                    font-size: 0.875rem;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-4);
                    margin-bottom: var(--spacing-4);
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2);
                }

                .form-group label {
                    font-size: 0.875rem;
                    color: var(--gray-300);
                    font-weight: 500;
                }

                .form-group input,
                .form-group textarea,
                .form-group select {
                    padding: var(--spacing-3);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--gray-700);
                    background: var(--gray-800);
                    color: var(--gray-100);
                    font-size: 0.938rem;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    outline: none;
                    border-color: var(--primary-500);
                }

                .textarea-lg {
                    font-family: monospace;
                    font-size: 0.813rem;
                }

                .form-hint {
                    font-size: 0.75rem;
                    color: var(--gray-500);
                }

                .phases-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-4);
                }

                .phase-config {
                    padding: var(--spacing-5);
                }

                .phase-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-4);
                    margin-bottom: var(--spacing-4);
                }

                .phase-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary-600);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                }

                .phase-name-input {
                    font-size: 1.125rem;
                    font-weight: 600;
                    background: transparent;
                    border: none;
                    color: var(--gray-100);
                    padding: 0;
                }

                .phase-type {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--gray-500);
                    text-transform: uppercase;
                }

                .phase-dates {
                    display: flex;
                    gap: var(--spacing-4);
                    margin-bottom: var(--spacing-4);
                }

                .milestones-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-2);
                    padding: var(--spacing-3);
                    background: var(--gray-800);
                    border-radius: var(--radius-md);
                    min-height: 44px;
                }

                .milestone-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--spacing-1);
                    padding: 4px 8px;
                    background: var(--primary-600);
                    color: white;
                    border-radius: var(--radius-sm);
                    font-size: 0.813rem;
                }

                .remove-btn {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    padding: 0 2px;
                    font-size: 1rem;
                }

                .milestone-input {
                    flex: 1;
                    min-width: 120px;
                    border: none;
                    background: transparent;
                    color: var(--gray-100);
                }

                .preferences-sections {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-6);
                }

                .pref-section h3 {
                    margin-bottom: var(--spacing-3);
                    color: var(--gray-200);
                }

                .platform-toggles {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-2);
                }

                .platform-toggle {
                    padding: var(--spacing-2) var(--spacing-4);
                    border-radius: var(--radius-full);
                    border: 1px solid var(--gray-700);
                    background: var(--gray-800);
                    color: var(--gray-400);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .platform-toggle.active {
                    background: var(--primary-600);
                    border-color: var(--primary-600);
                    color: white;
                }

                .approval-options {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-3);
                }

                .approval-option {
                    padding: var(--spacing-4);
                    border-radius: var(--radius-md);
                    border: 2px solid var(--gray-700);
                    background: var(--gray-800);
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .approval-option.active {
                    border-color: var(--primary-500);
                    background: rgba(99, 102, 241, 0.1);
                }

                .approval-option strong {
                    display: block;
                    color: var(--gray-100);
                    margin-bottom: var(--spacing-1);
                }

                .approval-option span {
                    font-size: 0.813rem;
                    color: var(--gray-400);
                }

                .tags-input {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-2);
                    padding: var(--spacing-3);
                    background: var(--gray-800);
                    border-radius: var(--radius-md);
                    min-height: 44px;
                }

                .tag {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--spacing-1);
                    padding: 4px 8px;
                    background: var(--secondary-600);
                    color: white;
                    border-radius: var(--radius-sm);
                    font-size: 0.813rem;
                }

                .tag button {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    padding: 0 2px;
                }

                .tags-input input {
                    flex: 1;
                    min-width: 120px;
                    border: none;
                    background: transparent;
                    color: var(--gray-100);
                }

                .toggle-switch {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    cursor: pointer;
                }

                .toggle-switch input {
                    display: none;
                }

                .toggle-slider {
                    width: 48px;
                    height: 24px;
                    background: var(--gray-700);
                    border-radius: var(--radius-full);
                    position: relative;
                    transition: background 0.2s ease;
                }

                .toggle-slider::after {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.2s ease;
                }

                .toggle-switch input:checked + .toggle-slider {
                    background: var(--primary-600);
                }

                .toggle-switch input:checked + .toggle-slider::after {
                    transform: translateX(24px);
                }

                .toggle-label {
                    color: var(--gray-300);
                }

                .review-sections {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-4);
                }

                .review-section {
                    padding: var(--spacing-4);
                    background: var(--gray-800);
                    border-radius: var(--radius-md);
                }

                .review-section h4 {
                    margin-bottom: var(--spacing-3);
                    color: var(--gray-200);
                }

                .review-section dl {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: var(--spacing-2);
                }

                .review-section dt {
                    color: var(--gray-500);
                }

                .review-section dd {
                    color: var(--gray-100);
                }

                .review-section ul {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                }

                .review-section li {
                    padding: var(--spacing-1) 0;
                    color: var(--gray-300);
                }

                .platform-badges {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-2);
                }

                .platform-badge {
                    padding: 4px 12px;
                    background: var(--primary-600);
                    color: white;
                    border-radius: var(--radius-full);
                    font-size: 0.813rem;
                    text-transform: capitalize;
                }

                .wizard-actions {
                    display: flex;
                    gap: var(--spacing-4);
                }

                .spacer {
                    flex: 1;
                }

                @media (max-width: 768px) {
                    .mode-cards {
                        grid-template-columns: 1fr;
                    }
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    .approval-options {
                        grid-template-columns: 1fr;
                    }
                    .review-sections {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default PlanWizard;
