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
                <Link to="/autopilot" className="back-link">â† Back</Link>
                <h1>âš™ï¸ Owner Preferences</h1>
                <button
                    className={`btn btn-primary ${saved ? 'btn-success' : ''}`}
                    onClick={handleSave}
                >
                    {saved ? 'âœ“ Saved!' : 'Save Preferences'}
                </button>
            </div>

            <div className="preferences-grid">
                {/* Platforms */}
                <section className="pref-section glass-card">
                    <h2>ðŸŽ¯ Enabled Platforms</h2>
                    <p className="section-desc">Select which platforms to include in your content strategy</p>
                    <div className="platform-grid">
                        {platforms.map(platform => (
                            <button
                                key={platform}
                                className={`platform-btn ${preferences.enabledPlatforms.includes(platform) ? 'active' : ''}`}
                                onClick={() => togglePlatform(platform)}
                            >
                                <span className="platform-icon">
                                    {platform === 'twitter' && 'ð•'}
                                    {platform === 'linkedin' && 'ðŸ”—'}
                                    {platform === 'instagram' && 'ðŸ“¸'}
                                    {platform === 'tiktok' && 'â™ª'}
                                    {platform === 'reddit' && 'ðŸ”´'}
                                    {platform === 'facebook' && 'f'}
                                    {platform === 'email' && 'ðŸ“§'}
                                </span>
                                <span className="platform-name">{platform}</span>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Posting Frequency */}
                <section className="pref-section glass-card">
                    <h2>ðŸ“… Posting Frequency</h2>
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
                    <h2>ðŸŽ­ Voice & Tone</h2>
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
                    <h2>âœ… Approval Workflow</h2>
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
                    <h2>ðŸ“ Content Pillars</h2>
                    <p className="section-desc">Define your main content themes</p>
                    <div className="tags-container">
                        {preferences.contentPillars.map((pillar, i) => (
                            <span key={i} className="tag">
                                {pillar}
                                <button onClick={() => removeTag('contentPillars', i)}>Ã—</button>
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
                    <h2>ðŸ”‘ Keywords</h2>
                    <div className="tags-container">
                        {preferences.keywords.map((kw, i) => (
                            <span key={i} className="tag tag-secondary">
                                {kw}
                                <button onClick={() => removeTag('keywords', i)}>Ã—</button>
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
                    <h2>ðŸ’¬ Brand Voice</h2>
                    <div className="voice-group">
                        <label>Words to use:</label>
                        <div className="tags-container small">
                            {preferences.wordsToUse.map((word, i) => (
                                <span key={i} className="tag tag-success">
                                    {word}
                                    <button onClick={() => removeTag('wordsToUse', i)}>Ã—</button>
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
                                    <button onClick={() => removeTag('wordsToAvoid', i)}>Ã—</button>
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

        </div>
    );
};

export default Preferences;
