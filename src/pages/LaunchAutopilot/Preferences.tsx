import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getDefaultPreferences } from '../../types';
import type { OwnerPreferences, ContentPlatform, ContentTone } from '../../types';

const Preferences: React.FC = () => {
    const [preferences, setPreferences] = useState<OwnerPreferences>(getDefaultPreferences());
    const [saved, setSaved] = useState(false);

    const platforms: ContentPlatform[] = ['twitter', 'linkedin', 'instagram', 'tiktok', 'reddit', 'facebook', 'email'];
    const tones: ContentTone[] = ['professional', 'casual', 'witty', 'bold', 'friendly', 'informative'];

    const handleSave = () => {
        // In a real app, this would save to backend or localStorage
        localStorage.setItem('launchAutopilot_preferences', JSON.stringify(preferences));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const togglePlatform = (platform: ContentPlatform) => {
        setPreferences(prev => ({
            ...prev,
            enabledPlatforms: prev.enabledPlatforms.includes(platform)
                ? prev.enabledPlatforms.filter(p => p !== platform)
                : [...prev.enabledPlatforms, platform],
        }));
    };

    const updateFrequency = (platform: ContentPlatform, value: number) => {
        setPreferences(prev => ({
            ...prev,
            frequencyByPlatform: { ...prev.frequencyByPlatform, [platform]: value },
        }));
    };

    const updateTone = (platform: ContentPlatform, tone: ContentTone) => {
        setPreferences(prev => ({
            ...prev,
            toneByPlatform: { ...prev.toneByPlatform, [platform]: tone },
        }));
    };

    const addTag = (field: 'contentPillars' | 'keywords' | 'wordsToUse' | 'wordsToAvoid' | 'brandPersonality', value: string) => {
        if (value.trim()) {
            setPreferences(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()],
            }));
        }
    };

    const removeTag = (field: 'contentPillars' | 'keywords' | 'wordsToUse' | 'wordsToAvoid' | 'brandPersonality', index: number) => {
        setPreferences(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="preferences-page">
            <div className="page-header">
                <Link to="/autopilot" className="back-link">← Back</Link>
                <h1>⚙️ Owner Preferences</h1>
                <button
                    className={`btn btn-primary ${saved ? 'btn-success' : ''}`}
                    onClick={handleSave}
                >
                    {saved ? '✓ Saved!' : 'Save Preferences'}
                </button>
            </div>

            <div className="preferences-grid">
                {/* Platforms */}
                <section className="pref-section glass-card">
                    <h2>🎯 Enabled Platforms</h2>
                    <p className="section-desc">Select which platforms to include in your content strategy</p>
                    <div className="platform-grid">
                        {platforms.map(platform => (
                            <button
                                key={platform}
                                className={`platform-btn ${preferences.enabledPlatforms.includes(platform) ? 'active' : ''}`}
                                onClick={() => togglePlatform(platform)}
                            >
                                <span className="platform-icon">
                                    {platform === 'twitter' && '𝕏'}
                                    {platform === 'linkedin' && '🔗'}
                                    {platform === 'instagram' && '📸'}
                                    {platform === 'tiktok' && '♪'}
                                    {platform === 'reddit' && '🔴'}
                                    {platform === 'facebook' && 'f'}
                                    {platform === 'email' && '📧'}
                                </span>
                                <span className="platform-name">{platform}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Posting Frequency */}
                <section className="pref-section glass-card">
                    <h2>📅 Posting Frequency</h2>
                    <p className="section-desc">Posts per day for each platform</p>
                    <div className="frequency-list">
                        {preferences.enabledPlatforms.map(platform => (
                            <div key={platform} className="frequency-row">
                                <span className="platform-label">{platform}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    value={preferences.frequencyByPlatform[platform]}
                                    onChange={(e) => updateFrequency(platform, parseInt(e.target.value))}
                                />
                                <span className="frequency-value">
                                    {preferences.frequencyByPlatform[platform]}/day
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="weekend-toggle">
                        <label>
                            <input
                                type="checkbox"
                                checked={preferences.postOnWeekends}
                                onChange={(e) => setPreferences(prev => ({ ...prev, postOnWeekends: e.target.checked }))}
                            />
                            <span>Post on weekends</span>
                        </label>
                    </div>
                </section>

                {/* Tone by Platform */}
                <section className="pref-section glass-card">
                    <h2>🎭 Voice & Tone</h2>
                    <p className="section-desc">Set the tone for each platform</p>
                    <div className="tone-list">
                        {preferences.enabledPlatforms.map(platform => (
                            <div key={platform} className="tone-row">
                                <span className="platform-label">{platform}</span>
                                <select
                                    value={preferences.toneByPlatform[platform]}
                                    onChange={(e) => updateTone(platform, e.target.value as ContentTone)}
                                >
                                    {tones.map(tone => (
                                        <option key={tone} value={tone}>{tone}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Approval Workflow */}
                <section className="pref-section glass-card">
                    <h2>✅ Approval Workflow</h2>
                    <p className="section-desc">How do you want to review content?</p>
                    <div className="approval-options">
                        {[
                            { value: 'daily_digest', label: 'Daily Digest', desc: 'Review batch each morning' },
                            { value: 'individual_review', label: 'Individual', desc: 'Approve each piece' },
                            { value: 'auto_publish', label: 'Auto Publish', desc: 'Trust AI fully' },
                            { value: 'hybrid', label: 'Hybrid', desc: 'Auto for some, manual for others' },
                        ].map(option => (
                            <button
                                key={option.value}
                                className={`approval-btn ${preferences.approvalMode === option.value ? 'active' : ''}`}
                                onClick={() => setPreferences(prev => ({
                                    ...prev,
                                    approvalMode: option.value as typeof prev.approvalMode
                                }))}
                            >
                                <strong>{option.label}</strong>
                                <span>{option.desc}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Content Pillars */}
                <section className="pref-section glass-card full-width">
                    <h2>📝 Content Pillars</h2>
                    <p className="section-desc">Define your main content themes</p>
                    <div className="tags-container">
                        {preferences.contentPillars.map((pillar, i) => (
                            <span key={i} className="tag">
                                {pillar}
                                <button onClick={() => removeTag('contentPillars', i)}>×</button>
                            </span>
                        ))}
                        <input
                            type="text"
                            placeholder="Add pillar..."
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    addTag('contentPillars', (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                    </div>
                </section>

                {/* Keywords */}
                <section className="pref-section glass-card">
                    <h2>🔑 Keywords</h2>
                    <div className="tags-container">
                        {preferences.keywords.map((kw, i) => (
                            <span key={i} className="tag tag-secondary">
                                {kw}
                                <button onClick={() => removeTag('keywords', i)}>×</button>
                            </span>
                        ))}
                        <input
                            type="text"
                            placeholder="Add keyword..."
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    addTag('keywords', (e.target as HTMLInputElement).value);
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }}
                        />
                    </div>
                </section>

                {/* Words to Use / Avoid */}
                <section className="pref-section glass-card">
                    <h2>💬 Brand Voice</h2>
                    <div className="voice-group">
                        <label>Words to use:</label>
                        <div className="tags-container small">
                            {preferences.wordsToUse.map((word, i) => (
                                <span key={i} className="tag tag-success">
                                    {word}
                                    <button onClick={() => removeTag('wordsToUse', i)}>×</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="Add..."
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addTag('wordsToUse', (e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="voice-group">
                        <label>Words to avoid:</label>
                        <div className="tags-container small">
                            {preferences.wordsToAvoid.map((word, i) => (
                                <span key={i} className="tag tag-danger">
                                    {word}
                                    <button onClick={() => removeTag('wordsToAvoid', i)}>×</button>
                                </span>
                            ))}
                            <input
                                type="text"
                                placeholder="Add..."
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addTag('wordsToAvoid', (e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>

            <style>{`
                .preferences-page {
                    padding: var(--spacing-6);
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-4);
                    margin-bottom: var(--spacing-6);
                    flex-wrap: wrap;
                }

                .page-header h1 {
                    flex: 1;
                    margin: 0;
                    min-width: 200px;
                }

                .page-header .btn {
                    white-space: nowrap;
                }

                .back-link {
                    color: var(--gray-400);
                    text-decoration: none;
                    transition: color 0.2s ease;
                }

                .back-link:hover {
                    color: var(--primary-400);
                }

                .preferences-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-4);
                }

                .pref-section {
                    padding: var(--spacing-5);
                }

                .pref-section.full-width {
                    grid-column: 1 / -1;
                }

                .pref-section h2 {
                    margin-bottom: var(--spacing-2);
                    font-size: 1.125rem;
                    color: var(--gray-100);
                }

                .section-desc {
                    color: var(--gray-500);
                    font-size: 0.875rem;
                    margin-bottom: var(--spacing-4);
                }

                .platform-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
                    gap: var(--spacing-2);
                }

                .platform-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--spacing-2);
                    padding: var(--spacing-3);
                    border: 2px solid var(--gray-700);
                    border-radius: var(--radius-md);
                    background: var(--gray-800);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .platform-btn.active {
                    border-color: var(--primary-500);
                    background: rgba(99, 102, 241, 0.1);
                }

                .platform-icon {
                    font-size: 1.5rem;
                }

                .platform-name {
                    font-size: 0.75rem;
                    text-transform: capitalize;
                    color: var(--gray-300);
                }

                .frequency-list, .tone-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                }

                .frequency-row, .tone-row {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .platform-label {
                    width: 80px;
                    text-transform: capitalize;
                    color: var(--gray-300);
                    font-size: 0.875rem;
                }

                .frequency-row input[type="range"] {
                    flex: 1;
                }

                .frequency-value {
                    width: 50px;
                    text-align: right;
                    font-size: 0.875rem;
                    color: var(--gray-400);
                }

                .tone-row select {
                    flex: 1;
                    padding: var(--spacing-2);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--gray-700);
                    background: var(--gray-800);
                    color: var(--gray-100);
                }

                .weekend-toggle {
                    margin-top: var(--spacing-4);
                    padding-top: var(--spacing-4);
                    border-top: 1px solid var(--gray-700);
                }

                .weekend-toggle label {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    cursor: pointer;
                    color: var(--gray-300);
                }

                .approval-options {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-2);
                }

                .approval-btn {
                    padding: var(--spacing-3);
                    border: 2px solid var(--gray-700);
                    border-radius: var(--radius-md);
                    background: var(--gray-800);
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .approval-btn.active {
                    border-color: var(--primary-500);
                    background: rgba(99, 102, 241, 0.1);
                }

                .approval-btn strong {
                    display: block;
                    color: var(--gray-100);
                    font-size: 0.875rem;
                }

                .approval-btn span {
                    font-size: 0.75rem;
                    color: var(--gray-500);
                }

                .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: var(--spacing-2);
                    padding: var(--spacing-3);
                    background: var(--gray-800);
                    border-radius: var(--radius-md);
                    min-height: 48px;
                }

                .tags-container.small {
                    padding: var(--spacing-2);
                    min-height: 36px;
                }

                .tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    background: var(--primary-600);
                    color: white;
                    border-radius: var(--radius-sm);
                    font-size: 0.813rem;
                }

                .tag-secondary {
                    background: var(--secondary-600);
                }

                .tag-success {
                    background: var(--success-600);
                }

                .tag-danger {
                    background: var(--error-600);
                }

                .tag button {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    padding: 0;
                    font-size: 1rem;
                    line-height: 1;
                }

                .tags-container input {
                    flex: 1;
                    min-width: 100px;
                    border: none;
                    background: transparent;
                    color: var(--gray-100);
                    font-size: 0.875rem;
                }

                .voice-group {
                    margin-bottom: var(--spacing-4);
                }

                .voice-group:last-child {
                    margin-bottom: 0;
                }

                .voice-group label {
                    display: block;
                    margin-bottom: var(--spacing-2);
                    font-size: 0.813rem;
                    color: var(--gray-400);
                }

                @media (max-width: 768px) {
                    .preferences-grid {
                        grid-template-columns: 1fr;
                    }
                    .approval-options {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Preferences;
