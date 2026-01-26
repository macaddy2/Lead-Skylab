import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import type { ContentCampaign, ContentPlatform } from '../../types';
import { v4 as uuidv4 } from 'uuid';

const icons = {
    back: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
        </svg>
    ),
    plus: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    calendar: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    ),
};

const platformLabels: Record<ContentPlatform, string> = {
    twitter: 'Twitter/X',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    reddit: 'Reddit',
    facebook: 'Facebook',
    email: 'Email',
};

export default function Campaigns() {
    const navigate = useNavigate();
    const { state, dispatch } = useData();
    const { contentCampaigns, contentPieces } = state;

    const [showCreate, setShowCreate] = useState(false);
    const [newCampaign, setNewCampaign] = useState({
        name: '',
        description: '',
        platforms: [] as ContentPlatform[],
    });

    const handleCreateCampaign = () => {
        if (!newCampaign.name.trim()) return;

        const campaign: ContentCampaign = {
            id: uuidv4(),
            name: newCampaign.name,
            description: newCampaign.description,
            status: 'active',
            platforms: newCampaign.platforms,
            contentCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        dispatch({ type: 'ADD_CAMPAIGN', payload: campaign });
        setNewCampaign({ name: '', description: '', platforms: [] });
        setShowCreate(false);
    };

    const handleDeleteCampaign = (id: string) => {
        dispatch({ type: 'DELETE_CAMPAIGN', payload: id });
    };

    const togglePlatform = (platform: ContentPlatform) => {
        const current = newCampaign.platforms;
        if (current.includes(platform)) {
            setNewCampaign({ ...newCampaign, platforms: current.filter(p => p !== platform) });
        } else {
            setNewCampaign({ ...newCampaign, platforms: [...current, platform] });
        }
    };

    const getCampaignContentCount = (campaignId: string) => {
        return contentPieces.filter(c => c.campaignId === campaignId).length;
    };

    return (
        <div className="animate-fadeIn">
            {/* Header */}
            <div className="page-header">
                <div className="flex items-center gap-4">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/content')}>
                        {icons.back}
                    </button>
                    <div>
                        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
                            Campaigns
                        </h1>
                        <p className="text-muted">Organize your content by campaign</p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                    {icons.plus} New Campaign
                </button>
            </div>

            {/* Create Campaign Form */}
            {showCreate && (
                <div className="card mb-6" style={{ padding: 'var(--space-6)' }}>
                    <h3 className="font-semibold mb-4">Create New Campaign</h3>

                    <div className="form-group mb-4">
                        <label className="form-label">Campaign Name *</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="e.g., Product Launch Q1"
                            value={newCampaign.name}
                            onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                        />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Description</label>
                        <textarea
                            className="input"
                            rows={2}
                            placeholder="What is this campaign about?"
                            value={newCampaign.description}
                            onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                        />
                    </div>

                    <div className="form-group mb-6">
                        <label className="form-label">Platforms</label>
                        <div className="flex flex-wrap gap-2">
                            {(Object.keys(platformLabels) as ContentPlatform[]).map((platform) => (
                                <button
                                    key={platform}
                                    className={`btn btn-sm ${newCampaign.platforms.includes(platform) ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => togglePlatform(platform)}
                                >
                                    {platformLabels[platform]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="btn btn-primary" onClick={handleCreateCampaign}>
                            Create Campaign
                        </button>
                        <button className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Campaigns List */}
            {contentCampaigns.length === 0 ? (
                <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📅</div>
                    <h3>No campaigns yet</h3>
                    <p className="text-muted mb-4">Create a campaign to organize your content</p>
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                        {icons.plus} Create Your First Campaign
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2" style={{ gap: 'var(--space-6)' }}>
                    {contentCampaigns.map((campaign) => (
                        <div key={campaign.id} className="card" style={{ padding: 'var(--space-6)' }}>
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{campaign.name}</h3>
                                        <span className={`badge ${campaign.status === 'active' ? 'badge-success' : campaign.status === 'paused' ? 'badge-warning' : 'badge-primary'}`}>
                                            {campaign.status}
                                        </span>
                                    </div>
                                    {campaign.description && (
                                        <p className="text-sm text-muted">{campaign.description}</p>
                                    )}
                                </div>
                                <button
                                    className="btn btn-ghost btn-sm btn-icon"
                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                    style={{ color: 'var(--color-error)' }}
                                >
                                    ×
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {campaign.platforms.map((platform) => (
                                    <span key={platform} className="badge badge-info">
                                        {platformLabels[platform]}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted">
                                    <span>{getCampaignContentCount(campaign.id)} content pieces</span>
                                    <span>Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
