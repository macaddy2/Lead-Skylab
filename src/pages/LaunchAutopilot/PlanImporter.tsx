import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useData } from '../../store/DataContext';
import { getDefaultPreferences } from '../../types';
import type { LaunchPlan, ContentQueueItem, LaunchPhaseType, ContentPlatform } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExtractedItem {
    id: string;
    title: string;
    description: string;
    platform: string;
    phase: LaunchPhaseType;
    scheduledDate: string;
    scheduledTime: string;
    hashtags: string[];
    approved: boolean;
    edited: boolean;
}

interface ExtractedPlan {
    campaignName: string;
    productName: string;
    targetAudience: string;
    duration: number;
    platforms: string[];
    items: ExtractedItem[];
}

// ─── Gemini API Call ──────────────────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

async function parseMarketingPlan(text: string): Promise<ExtractedPlan> {
    const prompt = `You are a marketing strategy extraction engine. Analyze the following marketing implementation plan and extract structured actionables.

Return ONLY valid JSON in this exact shape (no markdown, no explanation):
{
  "campaignName": "string - name of the campaign or product",
  "productName": "string - the product or service being marketed",
  "targetAudience": "string - brief description of the target audience",
  "duration": number - estimated campaign duration in days,
  "platforms": ["array of platforms mentioned: twitter, linkedin, instagram, tiktok, email, reddit"],
  "items": [
    {
      "title": "string - short action title",
      "description": "string - the post content or action description",
      "platform": "one of: twitter, linkedin, instagram, tiktok, email, reddit",
      "phase": "one of: pre_launch, launch_day, growth, complete",
      "scheduledDate": "YYYY-MM-DD",
      "scheduledTime": "HH:MM",
      "hashtags": ["array of relevant hashtags without #"]
    }
  ]
}

Extract up to 12 actionable content items. If dates are not specified, distribute them across the next 30 days starting from today (${new Date().toISOString().split('T')[0]}). Assign earlier items to pre_launch, the main announcement to launch_day, and follow-up content to growth.

MARKETING PLAN:
${text.slice(0, 8000)}`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON in Gemini response');

    const parsed = JSON.parse(jsonMatch[0]);
    return {
        ...parsed,
        items: (parsed.items || []).map((item: Omit<ExtractedItem, 'id' | 'approved' | 'edited'>) => ({
            ...item,
            id: uuidv4(),
            approved: false,
            edited: false,
        })),
    };
}

// ─── File Reading ─────────────────────────────────────────────────────────────

async function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// ─── Platform Icons ───────────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, string> = {
    twitter: '𝕏',
    linkedin: '🔗',
    instagram: '📸',
    tiktok: '🎵',
    email: '📧',
    reddit: '🤖',
};

const PHASE_LABELS: Record<LaunchPhaseType, string> = {
    pre_launch: '🎯 Pre-Launch',
    launch_day: '🚀 Launch Day',
    growth: '📈 Growth',
    complete: '✅ Complete',
};

// ─── Component ────────────────────────────────────────────────────────────────

type ImportStep = 'upload' | 'parsing' | 'review' | 'done';

export default function PlanImporter() {
    const navigate = useNavigate();
    const { dispatch } = useData();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [step, setStep] = useState<ImportStep>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [extractedPlan, setExtractedPlan] = useState<ExtractedPlan | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Drag & Drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => setIsDragging(false), []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, []);

    const handleFile = async (file: File) => {
        const allowed = ['text/plain', 'text/markdown', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.some(t => file.type === t) && !file.name.match(/\.(txt|md|pdf|docx)$/i)) {
            setError('Unsupported file type. Please upload a .txt, .md, .pdf, or .docx file.');
            return;
        }
        setUploadedFile(file);
        setError(null);
        setStep('parsing');

        try {
            const text = await readFileAsText(file);
            const plan = await parseMarketingPlan(text);
            setExtractedPlan(plan);
            setStep('review');
        } catch (err) {
            setError(`Failed to parse plan: ${err instanceof Error ? err.message : 'Unknown error'}`);
            setStep('upload');
        }
    };

    const toggleApprove = (id: string) => {
        if (!extractedPlan) return;
        setExtractedPlan({
            ...extractedPlan,
            items: extractedPlan.items.map(item =>
                item.id === id ? { ...item, approved: !item.approved } : item
            ),
        });
    };

    const approveAll = () => {
        if (!extractedPlan) return;
        setExtractedPlan({
            ...extractedPlan,
            items: extractedPlan.items.map(item => ({ ...item, approved: true })),
        });
    };

    const updateItem = (id: string, updates: Partial<ExtractedItem>) => {
        if (!extractedPlan) return;
        setExtractedPlan({
            ...extractedPlan,
            items: extractedPlan.items.map(item =>
                item.id === id ? { ...item, ...updates, edited: true } : item
            ),
        });
        setEditingId(null);
    };

    const commitToQueue = () => {
        if (!extractedPlan) return;

        const approvedItems = extractedPlan.items.filter(i => i.approved);
        if (approvedItems.length === 0) {
            setError('Please approve at least one item before committing.');
            return;
        }

        // Create a new launch plan
        const planId = uuidv4();
        const now = new Date().toISOString();
        const newPlan: LaunchPlan = {
            id: planId,
            name: extractedPlan.campaignName,
            productName: extractedPlan.productName,
            status: 'active',
            inputMode: 'import',
            phases: (['pre_launch', 'launch_day', 'growth', 'complete'] as LaunchPhaseType[]).map(type => ({
                id: uuidv4(),
                type,
                name: PHASE_LABELS[type].replace(/^[^ ]+ /, ''),
                description: '',
                status: type === 'pre_launch' ? 'active' : 'pending',
                milestones: [],
                contentItems: [],
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            })),
            preferences: getDefaultPreferences(),
            startDate: new Date().toISOString().split('T')[0],
            launchDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            createdAt: now,
            updatedAt: now,
        };

        dispatch({ type: 'ADD_LAUNCH_PLAN', payload: newPlan });

        // Create content queue items for all approved items
        approvedItems.forEach(item => {
            const queueItem: ContentQueueItem = {
                id: uuidv4(),
                planId,
                phaseId: item.phase,
                content: {
                    id: uuidv4(),
                    title: item.title,
                    content: item.description,
                    platform: item.platform as ContentPlatform,
                    status: 'draft',
                    tone: 'professional',
                    hashtags: item.hashtags,
                    createdAt: now,
                    updatedAt: now,
                },
                scheduledDate: item.scheduledDate,
                scheduledTime: item.scheduledTime,
                status: 'queued',
            };
            dispatch({ type: 'ADD_QUEUE_ITEM', payload: queueItem });
        });

        setStep('done');

        // Navigate to the new plan after a moment
        setTimeout(() => {
            navigate(`/autopilot/plans/${planId}`);
        }, 1500);
    };

    const approvedCount = extractedPlan?.items.filter(i => i.approved).length ?? 0;

    return (
        <div className="plan-importer animate-fadeIn">
            {/* Header */}
            <div className="importer-header">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/autopilot')}>
                    ← Back
                </button>
                <div>
                    <h1>Import Marketing Plan</h1>
                    <p className="text-muted">Upload your plan and AI will extract actionable social posts</p>
                </div>
            </div>

            {/* Steps indicator */}
            <div className="importer-steps">
                {(['upload', 'parsing', 'review', 'done'] as ImportStep[]).map((s, i) => (
                    <div key={s} className={`importer-step ${step === s ? 'active' : ''} ${['parsing', 'review', 'done'].indexOf(step) > ['parsing', 'review', 'done'].indexOf(s) ? 'completed' : ''}`}>
                        <div className="step-dot">{i + 1}</div>
                        <span className="step-label">
                            {s === 'upload' ? 'Upload' : s === 'parsing' ? 'Parsing' : s === 'review' ? 'Review' : 'Done'}
                        </span>
                    </div>
                ))}
            </div>

            {error && (
                <div className="alert alert-error">
                    ⚠️ {error}
                    <button className="btn btn-ghost btn-sm" onClick={() => setError(null)}>✕</button>
                </div>
            )}

            {/* STEP: Upload */}
            {step === 'upload' && (
                <div
                    className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.md,.pdf,.docx"
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    <div className="upload-icon">📄</div>
                    <h3>Drag & drop your marketing plan</h3>
                    <p className="text-muted">Supports .txt, .md, .pdf, .docx</p>
                    <button className="btn btn-primary" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        Choose File
                    </button>
                    <p className="upload-hint text-xs text-muted">
                        Your plan will be processed by Gemini AI to extract campaigns, platforms, timelines, and content ideas
                    </p>
                </div>
            )}

            {/* STEP: Parsing */}
            {step === 'parsing' && (
                <div className="parsing-state">
                    <div className="parsing-animation">
                        <div className="spinner spinner-lg" />
                    </div>
                    <h3>Analyzing your plan...</h3>
                    <p className="text-muted">Gemini AI is reading <strong>{uploadedFile?.name}</strong> and extracting actionables</p>
                    <ul className="parsing-steps">
                        <li>✓ Reading document</li>
                        <li className="active">🔍 Identifying campaigns & platforms</li>
                        <li>⏳ Generating content queue</li>
                    </ul>
                </div>
            )}

            {/* STEP: Review */}
            {step === 'review' && extractedPlan && (
                <div className="review-section">
                    {/* Plan Summary */}
                    <div className="card plan-summary">
                        <div className="plan-summary-grid">
                            <div>
                                <p className="text-xs text-muted">Campaign</p>
                                <p className="font-semibold">{extractedPlan.campaignName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Product</p>
                                <p className="font-semibold">{extractedPlan.productName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Duration</p>
                                <p className="font-semibold">{extractedPlan.duration} days</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted">Platforms</p>
                                <div className="platform-chips">
                                    {extractedPlan.platforms.map(p => (
                                        <span key={p} className="platform-chip">
                                            {PLATFORM_ICONS[p] ?? '📱'} {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-muted mt-3">
                            <strong>Audience:</strong> {extractedPlan.targetAudience}
                        </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="review-actions">
                        <p className="text-sm text-muted">
                            {approvedCount} of {extractedPlan.items.length} items approved
                        </p>
                        <div className="flex gap-3">
                            <button className="btn btn-ghost btn-sm" onClick={approveAll}>
                                ✓ Approve All
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={commitToQueue}
                                disabled={approvedCount === 0}
                            >
                                🚀 Commit {approvedCount} to Queue
                            </button>
                        </div>
                    </div>

                    {/* Items by phase */}
                    {(['pre_launch', 'launch_day', 'growth', 'complete'] as LaunchPhaseType[]).map(phase => {
                        const phaseItems = extractedPlan.items.filter(i => i.phase === phase);
                        if (phaseItems.length === 0) return null;

                        return (
                            <div key={phase} className="phase-group">
                                <h3 className="phase-group-label">{PHASE_LABELS[phase]}</h3>
                                <div className="extracted-items">
                                    {phaseItems.map(item => (
                                        <div
                                            key={item.id}
                                            className={`extracted-card ${item.approved ? 'approved' : ''}`}
                                        >
                                            <div className="extracted-card-header">
                                                <div className="flex items-center gap-2">
                                                    <span className="platform-badge">
                                                        {PLATFORM_ICONS[item.platform] ?? '📱'} {item.platform}
                                                    </span>
                                                    {item.edited && <span className="badge badge-info text-xs">edited</span>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-muted">
                                                        {item.scheduledDate} {item.scheduledTime}
                                                    </span>
                                                    <button
                                                        className="btn btn-ghost btn-xs"
                                                        onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        className={`btn btn-sm ${item.approved ? 'btn-success' : 'btn-ghost'}`}
                                                        onClick={() => toggleApprove(item.id)}
                                                    >
                                                        {item.approved ? '✓ Approved' : 'Approve'}
                                                    </button>
                                                </div>
                                            </div>

                                            {editingId === item.id ? (
                                                <ItemEditor item={item} onSave={updates => updateItem(item.id, updates)} onCancel={() => setEditingId(null)} />
                                            ) : (
                                                <>
                                                    <h4 className="extracted-title">{item.title}</h4>
                                                    <p className="extracted-desc">{item.description}</p>
                                                    {item.hashtags.length > 0 && (
                                                        <div className="hashtag-row">
                                                            {item.hashtags.map(h => (
                                                                <span key={h} className="hashtag">#{h}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* STEP: Done */}
            {step === 'done' && (
                <div className="done-state">
                    <div className="done-icon">🎉</div>
                    <h3>Plan imported! Redirecting to your launch plan...</h3>
                </div>
            )}
        </div>
    );
}

// ─── Inline Item Editor ───────────────────────────────────────────────────────

function ItemEditor({ item, onSave, onCancel }: {
    item: ExtractedItem;
    onSave: (updates: Partial<ExtractedItem>) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState(item.title);
    const [description, setDescription] = useState(item.description);
    const [scheduledDate, setScheduledDate] = useState(item.scheduledDate);
    const [scheduledTime, setScheduledTime] = useState(item.scheduledTime);
    const [platform, setPlatform] = useState(item.platform);

    return (
        <div className="item-editor">
            <div className="input-group">
                <label className="input-label">Title</label>
                <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="input-group">
                <label className="input-label">Content</label>
                <textarea className="input" rows={4} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-3">
                <div className="input-group flex-1">
                    <label className="input-label">Platform</label>
                    <select className="input" value={platform} onChange={e => setPlatform(e.target.value)}>
                        {['twitter', 'linkedin', 'instagram', 'tiktok', 'email', 'reddit'].map(p => (
                            <option key={p} value={p}>{PLATFORM_ICONS[p]} {p}</option>
                        ))}
                    </select>
                </div>
                <div className="input-group flex-1">
                    <label className="input-label">Date</label>
                    <input type="date" className="input" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
                </div>
                <div className="input-group flex-1">
                    <label className="input-label">Time</label>
                    <input type="time" className="input" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
                </div>
            </div>
            <div className="flex gap-2 mt-3">
                <button className="btn btn-primary btn-sm" onClick={() => onSave({ title, description, scheduledDate, scheduledTime, platform })}>
                    Save Changes
                </button>
                <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
            </div>
        </div>
    );
}
