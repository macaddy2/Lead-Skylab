import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';

const Analytics: React.FC = () => {
    const { state } = useData();
    const { launchPlans, contentQueue } = state;

    const totalContent = contentQueue.length;
    const published = contentQueue.filter(q => q.status === 'published').length;
    const approved = contentQueue.filter(q => q.status === 'approved').length;
    const pending = contentQueue.filter(q => q.status === 'queued').length;
    const rejected = contentQueue.filter(q => q.status === 'rejected').length;

    const activePlans = launchPlans.filter(p => p.status === 'active').length;
    const completedPlans = launchPlans.filter(p => p.status === 'completed').length;

    // Content by platform
    const byPlatform = contentQueue.reduce((acc, item) => {
        const platform = item.content.platform;
        acc[platform] = (acc[platform] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Approval rate
    const approvalRate = totalContent > 0
        ? Math.round(((published + approved) / totalContent) * 100)
        : 0;

    return (
        <div className="analytics-page">
            <div className="page-header">
                <Link to="/autopilot" className="back-link">â† Back</Link>
                <h1>ðŸ“Š Launch Analytics</h1>
            </div>

            <div className="stats-overview">
                <div className="stat-card glass-card">
                    <div className="stat-value">{totalContent}</div>
                    <div className="stat-label">Total Content</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: 'var(--success-400)' }}>{published}</div>
                    <div className="stat-label">Published</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: 'var(--primary-400)' }}>{approved}</div>
                    <div className="stat-label">Approved</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-value" style={{ color: 'var(--warning-400)' }}>{pending}</div>
                    <div className="stat-label">Pending</div>
                </div>
            </div>

            <div className="analytics-grid">
                <div className="analytics-section glass-card">
                    <h3>Content by Platform</h3>
                    <div className="platform-breakdown">
                        {Object.entries(byPlatform).length === 0 ? (
                            <p className="empty-text">No content yet</p>
                        ) : (
                            Object.entries(byPlatform).map(([platform, count]) => (
                                <div key={platform} className="platform-bar">
                                    <span className="platform-name">{platform}</span>
                                    <div className="bar-container">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${(count / totalContent) * 100}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="platform-count">{count}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="analytics-section glass-card">
                    <h3>Approval Rate</h3>
                    <div className="approval-gauge">
                        <div className="gauge-circle">
                            <svg viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="var(--gray-700)"
                                    strokeWidth="3"
                                />
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="var(--success-500)"
                                    strokeWidth="3"
                                    strokeDasharray={`${approvalRate}, 100`}
                                />
                            </svg>
                            <span className="gauge-value">{approvalRate}%</span>
                        </div>
                        <p className="gauge-label">of content approved or published</p>
                    </div>
                </div>

                <div className="analytics-section glass-card">
                    <h3>Launch Status</h3>
                    <div className="status-list">
                        <div className="status-row">
                            <span className="status-dot active"></span>
                            <span>Active Launches</span>
                            <span className="status-value">{activePlans}</span>
                        </div>
                        <div className="status-row">
                            <span className="status-dot completed"></span>
                            <span>Completed</span>
                            <span className="status-value">{completedPlans}</span>
                        </div>
                        <div className="status-row">
                            <span className="status-dot rejected"></span>
                            <span>Rejected Content</span>
                            <span className="status-value">{rejected}</span>
                        </div>
                    </div>
                </div>

                <div className="analytics-section glass-card">
                    <h3>Recent Activity</h3>
                    {contentQueue.slice(0, 5).map(item => (
                        <div key={item.id} className="activity-item">
                            <span className="activity-platform">{item.content.platform}</span>
                            <span className="activity-title">{item.content.title}</span>
                            <span className={`activity-status ${item.status}`}>{item.status}</span>
                        </div>
                    ))}
                    {contentQueue.length === 0 && (
                        <p className="empty-text">No activity yet</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Analytics;
