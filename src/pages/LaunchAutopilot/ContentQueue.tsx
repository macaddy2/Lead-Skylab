import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../../store/DataContext';

const ContentQueue: React.FC = () => {
    const [searchParams] = useSearchParams();
    const planIdFilter = searchParams.get('planId');
    const { state, dispatch } = useData();

    const allItems = planIdFilter
        ? state.contentQueue.filter(q => q.planId === planIdFilter)
        : state.contentQueue;

    const [filter, setFilter] = useState<'all' | 'queued' | 'approved' | 'published' | 'rejected'>('queued');
    const [selectedItems, setSelectedItems] = useState<string[]>([]);

    const filteredItems = filter === 'all'
        ? allItems
        : allItems.filter(item => item.status === filter);

    const getPlanName = (planId: string) => {
        return state.launchPlans.find(p => p.id === planId)?.name || 'Unknown Plan';
    };

    const toggleSelect = (itemId: string) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const selectAll = () => {
        const queuedIds = filteredItems.filter(i => i.status === 'queued').map(i => i.id);
        setSelectedItems(prev =>
            prev.length === queuedIds.length ? [] : queuedIds
        );
    };

    const handleBulkApprove = () => {
        dispatch({ type: 'BULK_APPROVE_QUEUE', payload: selectedItems });
        setSelectedItems([]);
    };

    const handleApprove = (itemId: string) => {
        const item = allItems.find(q => q.id === itemId);
        if (item) {
            dispatch({
                type: 'UPDATE_QUEUE_ITEM',
                payload: { ...item, status: 'approved', approvedAt: new Date().toISOString() },
            });
        }
    };

    const handleReject = (itemId: string) => {
        const item = allItems.find(q => q.id === itemId);
        if (item) {
            dispatch({
                type: 'UPDATE_QUEUE_ITEM',
                payload: { ...item, status: 'rejected' },
            });
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            queued: '#f59e0b',
            approved: '#10b981',
            published: '#6366f1',
            rejected: '#ef4444',
            failed: '#ef4444',
        };
        return colors[status] || '#6b7280';
    };

    const getPlatformIcon = (platform: string) => {
        const icons: Record<string, string> = {
            twitter: '𝕏',
            linkedin: 'in',
            instagram: '📸',
            tiktok: '♪',
            reddit: '🔴',
            facebook: 'f',
            email: '📧',
        };
        return icons[platform] || '📄';
    };

    const groupedByDate = filteredItems.reduce((acc, item) => {
        const date = item.scheduledDate;
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {} as Record<string, typeof filteredItems>);

    const sortedDates = Object.keys(groupedByDate).sort();

    return (
        <div className="content-queue">
            <div className="queue-header">
                <div className="header-left">
                    <Link to="/autopilot" className="back-link">← Back</Link>
                    <h1>📤 Content Queue</h1>
                    {planIdFilter && (
                        <span className="plan-filter">
                            for {getPlanName(planIdFilter)}
                        </span>
                    )}
                </div>
                <div className="header-actions">
                    {selectedItems.length > 0 && (
                        <button className="btn btn-primary" onClick={handleBulkApprove}>
                            ✓ Approve Selected ({selectedItems.length})
                        </button>
                    )}
                </div>
            </div>

            <div className="queue-filters">
                <div className="filter-tabs">
                    {(['all', 'queued', 'approved', 'published', 'rejected'] as const).map(f => (
                        <button
                            key={f}
                            className={`filter-tab ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                            <span className="count">
                                {f === 'all'
                                    ? allItems.length
                                    : allItems.filter(i => i.status === f).length}
                            </span>
                        </button>
                    ))}
                </div>
                {filter === 'queued' && filteredItems.length > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={selectAll}>
                        {selectedItems.length === filteredItems.filter(i => i.status === 'queued').length
                            ? 'Deselect All'
                            : 'Select All'}
                    </button>
                )}
            </div>

            <div className="queue-content">
                {sortedDates.length === 0 ? (
                    <div className="empty-state glass-card">
                        <div className="empty-icon">📭</div>
                        <h3>No Content in Queue</h3>
                        <p>Generate content from your launch plans to see items here</p>
                        <Link to="/autopilot" className="btn btn-primary">
                            View Launch Plans
                        </Link>
                    </div>
                ) : (
                    sortedDates.map(date => (
                        <div key={date} className="date-group">
                            <div className="date-header">
                                <span className="date-label">
                                    {new Date(date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                                <span className="date-count">
                                    {groupedByDate[date].length} items
                                </span>
                            </div>
                            <div className="queue-items">
                                {groupedByDate[date].map(item => (
                                    <div key={item.id} className="queue-item glass-card">
                                        {item.status === 'queued' && (
                                            <div className="item-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                />
                                            </div>
                                        )}
                                        <div className="item-platform">
                                            <span
                                                className="platform-icon"
                                                style={{ backgroundColor: getStatusColor(item.status) + '20' }}
                                            >
                                                {getPlatformIcon(item.content.platform)}
                                            </span>
                                        </div>
                                        <div className="item-content">
                                            <div className="item-header">
                                                <h4>{item.content.title}</h4>
                                                <span
                                                    className="status-badge"
                                                    style={{
                                                        backgroundColor: getStatusColor(item.status) + '20',
                                                        color: getStatusColor(item.status),
                                                    }}
                                                >
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="item-body">{item.content.content.substring(0, 150)}...</p>
                                            <div className="item-meta">
                                                <span>⏰ {item.scheduledTime}</span>
                                                <span>📋 {getPlanName(item.planId)}</span>
                                                <span className="platform-name">{item.content.platform}</span>
                                            </div>
                                        </div>
                                        {item.status === 'queued' && (
                                            <div className="item-actions">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleApprove(item.id)}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => handleReject(item.id)}
                                                >
                                                    ✗
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .content-queue {
                    padding: var(--spacing-6);
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .queue-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-6);
                    flex-wrap: wrap;
                    gap: var(--spacing-4);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-4);
                }

                .back-link {
                    color: var(--gray-400);
                    text-decoration: none;
                }

                .header-left h1 {
                    margin: 0;
                }

                .plan-filter {
                    color: var(--gray-400);
                    font-size: 0.875rem;
                }

                .queue-filters {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-6);
                    flex-wrap: wrap;
                    gap: var(--spacing-4);
                }

                .filter-tabs {
                    display: flex;
                    background: var(--gray-800);
                    border-radius: var(--radius-lg);
                    padding: 4px;
                }

                .filter-tab {
                    padding: var(--spacing-2) var(--spacing-4);
                    border: none;
                    background: transparent;
                    color: var(--gray-400);
                    cursor: pointer;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    transition: all 0.2s ease;
                }

                .filter-tab.active {
                    background: var(--primary-600);
                    color: white;
                }

                .filter-tab:hover:not(.active) {
                    background: var(--gray-700);
                }

                .filter-tab .count {
                    font-size: 0.75rem;
                    padding: 2px 6px;
                    background: rgba(255,255,255,0.1);
                    border-radius: var(--radius-full);
                }

                .date-group {
                    margin-bottom: var(--spacing-6);
                }

                .date-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-3);
                    padding-bottom: var(--spacing-2);
                    border-bottom: 1px solid var(--gray-800);
                }

                .date-label {
                    font-weight: 600;
                    color: var(--gray-200);
                }

                .date-count {
                    font-size: 0.813rem;
                    color: var(--gray-500);
                }

                .queue-items {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                }

                .queue-item {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--spacing-4);
                    padding: var(--spacing-4);
                }

                .item-checkbox {
                    padding-top: var(--spacing-1);
                }

                .item-checkbox input {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                }

                .item-platform {
                    flex-shrink: 0;
                }

                .platform-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.125rem;
                    font-weight: 600;
                }

                .item-content {
                    flex: 1;
                    min-width: 0;
                }

                .item-header {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                    margin-bottom: var(--spacing-2);
                }

                .item-header h4 {
                    margin: 0;
                    color: var(--gray-100);
                    font-size: 0.938rem;
                }

                .status-badge {
                    font-size: 0.625rem;
                    padding: 2px 6px;
                    border-radius: var(--radius-sm);
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .item-body {
                    color: var(--gray-400);
                    font-size: 0.875rem;
                    line-height: 1.5;
                    margin-bottom: var(--spacing-2);
                }

                .item-meta {
                    display: flex;
                    gap: var(--spacing-4);
                    font-size: 0.75rem;
                    color: var(--gray-500);
                }

                .platform-name {
                    text-transform: capitalize;
                }

                .item-actions {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-2);
                    flex-shrink: 0;
                }

                .item-actions .btn {
                    padding: var(--spacing-2) var(--spacing-3);
                    font-size: 0.875rem;
                    border-radius: var(--radius-md);
                    min-width: 40px;
                    justify-content: center;
                }

                .btn-success {
                    background: var(--success-600);
                    color: white;
                    border: none;
                    cursor: pointer;
                }

                .btn-success:hover {
                    background: var(--success-500);
                    transform: scale(1.05);
                }

                .item-actions .btn-ghost {
                    color: var(--gray-400);
                    background: transparent;
                    border: 1px solid var(--gray-600);
                }

                .item-actions .btn-ghost:hover {
                    color: var(--error-400);
                    border-color: var(--error-400);
                    background: rgba(239, 68, 68, 0.1);
                }

                .empty-state {
                    text-align: center;
                    padding: var(--spacing-12);
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: var(--spacing-4);
                }

                .empty-state h3 {
                    color: var(--gray-100);
                    margin-bottom: var(--spacing-2);
                }

                .empty-state p {
                    color: var(--gray-400);
                    margin-bottom: var(--spacing-6);
                }
            `}</style>
        </div>
    );
};

export default ContentQueue;
