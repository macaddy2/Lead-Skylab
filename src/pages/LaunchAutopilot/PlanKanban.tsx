import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
import { PHASE_STYLES, CONTENT_STATUS_COLORS, CONTENT_STATUS_LABELS } from '../../constants/statusColors';
import type { LaunchPhaseType, ContentQueueItem } from '../../types';

const PlanKanban: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const { state, dispatch } = useData();
    const plan = state.launchPlans.find(p => p.id === planId);
    const queueItems = state.contentQueue.filter(q => q.planId === planId);

    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    if (!plan) {
        return (
            <div className="not-found glass-card">
                <h2>Plan Not Found</h2>
                <p>This launch plan doesn't exist or was deleted.</p>
                <Link to="/autopilot" className="btn btn-primary">Back to Autopilot</Link>
            </div>
        );
    }

    const phases: LaunchPhaseType[] = ['pre_launch', 'launch_day', 'growth', 'complete'];

    const getPhaseItems = (phaseType: LaunchPhaseType) => {
        return queueItems.filter(item => item.phaseId === phaseType);
    };

    const handleDragStart = (itemId: string) => {
        setDraggedItem(itemId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (targetPhase: LaunchPhaseType) => {
        if (draggedItem) {
            dispatch({
                type: 'MOVE_CONTENT_TO_PHASE',
                payload: { itemId: draggedItem, phaseType: targetPhase },
            });
            setDraggedItem(null);
        }
    };

    const handleApprove = (itemId: string) => {
        const item = queueItems.find(q => q.id === itemId);
        if (item) {
            dispatch({
                type: 'UPDATE_QUEUE_ITEM',
                payload: { ...item, status: 'approved', approvedAt: new Date().toISOString() },
            });
        }
    };

    const handleReject = (itemId: string) => {
        const item = queueItems.find(q => q.id === itemId);
        if (item) {
            dispatch({
                type: 'UPDATE_QUEUE_ITEM',
                payload: { ...item, status: 'rejected' },
            });
        }
    };

    const getStatusBadge = (status: ContentQueueItem['status']) => ({
        label: CONTENT_STATUS_LABELS[status] ?? status,
        color: CONTENT_STATUS_COLORS[status] ?? '#6b7280',
    });

    return (
        <div className="plan-kanban">
            <div className="kanban-header">
                <div className="header-left">
                    <Link to="/autopilot" className="back-link">← Back</Link>
                    <div className="plan-info">
                        <h1>{plan.name}</h1>
                        <span className="plan-product">{plan.productName}</span>
                        <span className={`plan-status ${plan.status}`}>{plan.status}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <Link to={`/autopilot/queue?planId=${planId}`} className="btn btn-ghost">
                        📤 Content Queue
                    </Link>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            const newStatus: 'draft' | 'active' | 'paused' | 'completed' = plan.status === 'draft' ? 'active' : 'paused';
                            dispatch({ type: 'UPDATE_LAUNCH_PLAN', payload: { ...plan, status: newStatus, updatedAt: new Date().toISOString() } });
                        }}
                    >
                        {plan.status === 'draft' ? '🚀 Activate' : plan.status === 'active' ? '⏸️ Pause' : '▶️ Resume'}
                    </button>
                </div>
            </div>

            <div className="kanban-board">
                {phases.map(phaseType => {
                    const phase = PHASE_STYLES[phaseType];
                    const items = getPhaseItems(phaseType);
                    const phaseData = plan.phases.find(p => p.type === phaseType);

                    return (
                        <div
                            key={phaseType}
                            className={`kanban-column ${draggedItem ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(phaseType)}
                        >
                            <div
                                className="column-header"
                                style={{ borderTopColor: phase.color }}
                            >
                                <span className="phase-emoji">{phase.emoji}</span>
                                <span className="phase-name">{phase.label}</span>
                                <span className="item-count">{items.length}</span>
                            </div>

                            {phaseData && (
                                <div className="phase-info">
                                    <div className="phase-dates">
                                        {phaseData.startDate && (
                                            <span>{new Date(phaseData.startDate).toLocaleDateString()}</span>
                                        )}
                                        {phaseData.endDate && (
                                            <span> → {new Date(phaseData.endDate).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    {phaseData.milestones.length > 0 && (
                                        <div className="milestones-mini">
                                            {phaseData.milestones.map(m => (
                                                <span
                                                    key={m.id}
                                                    className={`milestone-dot ${m.completed ? 'completed' : ''}`}
                                                    title={m.title}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="column-content">
                                {items.length === 0 ? (
                                    <div className="empty-column">
                                        <p>No content scheduled</p>
                                        <p className="hint">Drag items here or generate new content</p>
                                    </div>
                                ) : (
                                    items.map(item => {
                                        const badge = getStatusBadge(item.status);
                                        return (
                                            <div
                                                key={item.id}
                                                className="kanban-card"
                                                draggable
                                                onDragStart={() => handleDragStart(item.id)}
                                            >
                                                <div className="card-header">
                                                    <span
                                                        className="status-badge"
                                                        style={{ backgroundColor: badge.color + '20', color: badge.color }}
                                                    >
                                                        {badge.label}
                                                    </span>
                                                    <span className="platform-icon">
                                                        {item.content.platform === 'twitter' && '𝕏'}
                                                        {item.content.platform === 'linkedin' && '🔗'}
                                                        {item.content.platform === 'instagram' && '📸'}
                                                        {item.content.platform === 'email' && '📧'}
                                                    </span>
                                                </div>
                                                <h4>{item.content.title}</h4>
                                                <p className="card-preview">
                                                    {item.content.content.substring(0, 100)}...
                                                </p>
                                                <div className="card-meta">
                                                    <span>📅 {item.scheduledDate}</span>
                                                    <span>⏰ {item.scheduledTime}</span>
                                                </div>
                                                {item.status === 'queued' && (
                                                    <div className="card-actions">
                                                        <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => handleApprove(item.id)}
                                                        >
                                                            ✔ Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-ghost"
                                                            onClick={() => handleReject(item.id)}
                                                        >
                                                            ✗ Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <button className="add-content-btn">
                                + Generate Content
                            </button>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default PlanKanban;
