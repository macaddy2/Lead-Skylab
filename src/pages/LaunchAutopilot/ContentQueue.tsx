import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import { getContentStatusColor } from '../../constants/statusColors';

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



    const getPlatformIcon = (platform: string) => {
        const icons: Record<string, string> = {
            twitter: 'ð•',
            linkedin: 'in',
            instagram: 'ðŸ“¸',
            tiktok: 'â™ª',
            reddit: 'ðŸ”´',
            facebook: 'f',
            email: 'ðŸ“§',
        };
        return icons[platform] || 'ðŸ“„';
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
                    <Link to="/autopilot" className="back-link">â† Back</Link>
                    <h1>ðŸ“¤ Content Queue</h1>
                    {planIdFilter && (
                        <span className="plan-filter">
                            for {getPlanName(planIdFilter)}
                        </span>
                    )}
                </div>
                <div className="header-actions">
                    {selectedItems.length > 0 && (
                        <button className="btn btn-primary" onClick={handleBulkApprove}>
                            âœ“ Approve Selected ({selectedItems.length})
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
                        <div className="empty-icon">ðŸ“­</div>
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
                                                style={{ backgroundColor: getContentStatusColor(item.status) + '20' }}
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
                                                        backgroundColor: getContentStatusColor(item.status) + '20',
                                                        color: getContentStatusColor(item.status),
                                                    }}
                                                >
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="item-body">{item.content.content.substring(0, 150)}...</p>
                                            <div className="item-meta">
                                                <span>â° {item.scheduledTime}</span>
                                                <span>ðŸ“‹ {getPlanName(item.planId)}</span>
                                                <span className="platform-name">{item.content.platform}</span>
                                            </div>
                                        </div>
                                        {item.status === 'queued' && (
                                            <div className="item-actions">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleApprove(item.id)}
                                                >
                                                    âœ“
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost"
                                                    onClick={() => handleReject(item.id)}
                                                >
                                                    âœ—
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

        </div>
    );
};

export default ContentQueue;
