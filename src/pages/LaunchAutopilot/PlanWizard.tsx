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

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

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

    const handleNext = async () => {
        const steps: WizardStep[] = ['mode', 'details', 'phases', 'preferences', 'review'];
        const currentIndex = steps.indexOf(step);

        if (step === 'details' && inputMode === 'import' && importedDoc && !phases.some(p => p.milestones.length > 0)) {
            setIsAnalyzing(true);
            try {
                const { analyzeDocumentForPlan } = await import('../../lib/gemini');
                const analysis = await analyzeDocumentForPlan(importedDoc);

                if (!productName) setProductName(analysis.productName || 'Imported Product');
                if (!description) setDescription(analysis.description || '');

                if (analysis.phases && analysis.phases.length > 0) {
                    setPhases(analysis.phases.map((p) => ({
                        type: p.type as any,
                        name: p.name,
                        description: p.description,
                        startDate: '',
                        endDate: '',
                        status: 'pending',
                        milestones: p.suggestedMilestones.map(m => ({
                            id: uuidv4(),
                            title: m,
                            dueDate: '',
                            completed: false
                        }))
                    })));
                }
            } catch (err) {
                console.error("Failed to analyze doc", err);
            } finally {
                setIsAnalyzing(false);
            }
        }

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

    const handleCreate = async () => {
        setIsGenerating(true);
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

        try {
            const { generateLaunchContent, isAIConfigured } = await import('../../lib/gemini');
            if (isAIConfigured() && preferences.enabledPlatforms.length > 0) {
                const mockProfile = {
                    id: 'temp',
                    name: productName,
                    description: description,
                    url: productUrl,
                    valueProps: [],
                    targetAudience: 'anyone',
                    keywords: [],
                    tone: 'professional' as any,
                    competitors: [],
                    createdAt: now,
                    updatedAt: now,
                };

                const draftContent = await generateLaunchContent({
                    productProfile: mockProfile,
                    launchDate: launchDate || now,
                    platforms: preferences.enabledPlatforms as any,
                    toneByPlatform: preferences.enabledPlatforms.reduce((acc, p) => ({ ...acc, [p]: 'professional' }), {} as any),
                    contentPillars: preferences.contentPillars.length > 0 ? preferences.contentPillars : ['general'],
                    phase: 'pre_launch',
                    count: 3
                });

                draftContent.forEach((c) => {
                    dispatch({
                        type: 'ADD_CONTENT',
                        payload: {
                            ...c,
                            id: uuidv4(),
                            status: 'draft',
                            createdAt: now,
                            updatedAt: now,
                        } as any
                    });
                });
            }
        } catch (e) {
            console.error('Queue auto-gen failed', e);
        } finally {
            setIsGenerating(false);
            navigate(`/autopilot/plans/${newPlan.id}`);
        }
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
                                <span className="mode-icon">ðŸ“„</span>
                                <h3>Import Document</h3>
                                <p>Paste an existing launch plan, PRD, or marketing doc. AI will extract phases and content ideas.</p>
                            </button>

                            <button
                                className="mode-card glass-card hover-lift"
                                onClick={() => handleModeSelect('ai_analyze')}
                            >
                                <span className="mode-icon">ðŸ¤–</span>
                                <h3>AI Analyze</h3>
                                <p>Enter your product URL and social handles. AI will analyze and create a tailored plan.</p>
                            </button>

                            <button
                                className="mode-card glass-card hover-lift"
                                onClick={() => handleModeSelect('manual')}
                            >
                                <span className="mode-icon">âœï¸</span>
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
                                                    >Ã—</button>
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
                                <h3>ðŸŽ¯ Platforms</h3>
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
                                <h3>âœ… Approval Workflow</h3>
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
                                <h3>ðŸ“ Content Pillars</h3>
                                <div className="tags-input">
                                    {preferences.contentPillars.map((pillar, i) => (
                                        <span key={i} className="tag">
                                            {pillar}
                                            <button onClick={() => setPreferences({
                                                ...preferences,
                                                contentPillars: preferences.contentPillars.filter((_, idx) => idx !== i),
                                            })}>Ã—</button>
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
                                <h3>â° Weekend Posting</h3>
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
                                <h4>ðŸ“‹ Plan Details</h4>
                                <dl>
                                    <dt>Name</dt><dd>{planName}</dd>
                                    <dt>Product</dt><dd>{productName}</dd>
                                    <dt>Launch Date</dt><dd>{launchDate}</dd>
                                    <dt>Input Mode</dt><dd>{inputMode}</dd>
                                </dl>
                            </div>

                            <div className="review-section">
                                <h4>ðŸ“… Phases ({phases.length})</h4>
                                <ul>
                                    {phases.map(p => (
                                        <li key={p.type}>
                                            <strong>{p.name}</strong> - {p.milestones.length} milestones
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="review-section">
                                <h4>ðŸŽ¯ Platforms</h4>
                                <div className="platform-badges">
                                    {preferences.enabledPlatforms.map(p => (
                                        <span key={p} className="platform-badge">{p}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="review-section">
                                <h4>âœ… Approval</h4>
                                <p>{preferences.approvalMode.replace('_', ' ')}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="wizard-actions">
                {step !== 'mode' && (
                    <button className="btn btn-ghost" onClick={handleBack}>
                        â† Back
                    </button>
                )}
                <div className="spacer"></div>
                {step !== 'review' ? (
                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                        disabled={isAnalyzing || (step === 'details' && (!planName || !productName || !launchDate))}
                    >
                        {isAnalyzing ? 'Analyzing...' : 'Continue →'}
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleCreate} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : '🚀 Create Launch Plan'}
                    </button>
                )}
            </div>


        </div>
    );
};

export default PlanWizard;
