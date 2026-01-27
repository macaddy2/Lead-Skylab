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
                <Link to="/autopilot" className="back-link">← Back</Link>
                <h1>📊 Launch Analytics</h1>
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

            <style>{`
                .analytics-page {
                    padding: var(--spacing-6);
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-4);
                    margin-bottom: var(--spacing-6);
                }

                .back-link {
                    color: var(--gray-400);
                    text-decoration: none;
                }

                .back-link:hover {
                    color: var(--gray-200);
                }

                .stats-overview {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-4);
                    margin-bottom: var(--spacing-6);
                }

                .stat-card {
                    padding: var(--spacing-5);
                    text-align: center;
                }

                .stat-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--gray-100);
                }

                .stat-label {
                    color: var(--gray-400);
                    margin-top: var(--spacing-1);
                }

                .analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--spacing-4);
                }

                .analytics-section {
                    padding: var(--spacing-5);
                }

                .analytics-section h3 {
                    margin-bottom: var(--spacing-4);
                    color: var(--gray-200);
                }

                .platform-breakdown {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                }

                .platform-bar {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .platform-name {
                    width: 80px;
                    text-transform: capitalize;
                    color: var(--gray-300);
                    font-size: 0.875rem;
                }

                .bar-container {
                    flex: 1;
                    height: 8px;
                    background: var(--gray-700);
                    border-radius: var(--radius-full);
                    overflow: hidden;
                }

                .bar-fill {
                    height: 100%;
                    background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
                    border-radius: var(--radius-full);
                    transition: width 0.3s ease;
                }

                .platform-count {
                    width: 30px;
                    text-align: right;
                    font-size: 0.875rem;
                    color: var(--gray-400);
                }

                .approval-gauge {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .gauge-circle {
                    position: relative;
                    width: 120px;
                    height: 120px;
                }

                .gauge-circle svg {
                    transform: rotate(-90deg);
                }

                .gauge-value {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--gray-100);
                }

                .gauge-label {
                    margin-top: var(--spacing-3);
                    color: var(--gray-400);
                    font-size: 0.875rem;
                    text-align: center;
                }

                .status-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                }

                .status-row {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    color: var(--gray-300);
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .status-dot.active {
                    background: var(--success-500);
                }

                .status-dot.completed {
                    background: var(--primary-500);
                }

                .status-dot.rejected {
                    background: var(--error-500);
                }

                .status-value {
                    margin-left: auto;
                    font-weight: 600;
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    padding: var(--spacing-2) 0;
                    border-bottom: 1px solid var(--gray-800);
                }

                .activity-item:last-child {
                    border-bottom: none;
                }

                .activity-platform {
                    font-size: 0.75rem;
                    padding: 2px 6px;
                    background: var(--gray-700);
                    border-radius: var(--radius-sm);
                    text-transform: capitalize;
                }

                .activity-title {
                    flex: 1;
                    color: var(--gray-300);
                    font-size: 0.875rem;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .activity-status {
                    font-size: 0.625rem;
                    padding: 2px 6px;
                    border-radius: var(--radius-sm);
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .activity-status.queued {
                    background: rgba(245, 158, 11, 0.2);
                    color: var(--warning-400);
                }

                .activity-status.approved {
                    background: rgba(16, 185, 129, 0.2);
                    color: var(--success-400);
                }

                .activity-status.published {
                    background: rgba(99, 102, 241, 0.2);
                    color: var(--primary-400);
                }

                .empty-text {
                    color: var(--gray-500);
                    font-size: 0.875rem;
                    text-align: center;
                    padding: var(--spacing-4);
                }

                @media (max-width: 768px) {
                    .stats-overview {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .analytics-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Analytics;
