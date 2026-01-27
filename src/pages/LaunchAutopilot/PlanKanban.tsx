import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../store/DataContext';
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
    const phaseLabels: Record<LaunchPhaseType, { label: string; emoji: string; color: string }> = {
        pre_launch: { label: 'Pre-Launch', emoji: '🎯', color: '#6366f1' },
        launch_day: { label: 'Launch Day', emoji: '🚀', color: '#f59e0b' },
        growth: { label: 'Growth', emoji: '📈', color: '#10b981' },
        complete: { label: 'Complete', emoji: '✅', color: '#8b5cf6' },
    };

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

    const getStatusBadge = (status: ContentQueueItem['status']) => {
        const badges = {
            queued: { label: 'Pending', color: '#f59e0b' },
            approved: { label: 'Approved', color: '#10b981' },
            published: { label: 'Published', color: '#6366f1' },
            rejected: { label: 'Rejected', color: '#ef4444' },
            failed: { label: 'Failed', color: '#ef4444' },
        };
        return badges[status];
    };

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
                    const phase = phaseLabels[phaseType];
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
                                                            ✓ Approve
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

            <style>{`
                .plan-kanban {
                    padding: var(--spacing-6);
                    height: calc(100vh - 80px);
                    display: flex;
                    flex-direction: column;
                }

                .kanban-header {
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
                    gap: var(--spacing-6);
                }

                .back-link {
                    color: var(--gray-400);
                    text-decoration: none;
                    font-size: 0.875rem;
                }

                .back-link:hover {
                    color: var(--primary-400);
                }

                .plan-info {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-3);
                }

                .plan-info h1 {
                    font-size: 1.5rem;
                    margin: 0;
                }

                .plan-product {
                    color: var(--gray-400);
                }

                .plan-status {
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .plan-status.draft {
                    background: rgba(156, 163, 175, 0.2);
                    color: var(--gray-400);
                }

                .plan-status.active {
                    background: rgba(16, 185, 129, 0.2);
                    color: var(--success-400);
                }

                .plan-status.paused {
                    background: rgba(245, 158, 11, 0.2);
                    color: var(--warning-400);
                }

                .header-actions {
                    display: flex;
                    gap: var(--spacing-3);
                    flex-wrap: wrap;
                }

                .header-actions .btn {
                    white-space: nowrap;
                }

                .kanban-board {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--spacing-4);
                    flex: 1;
                    min-height: 0;
                    overflow-x: auto;
                }

                .kanban-column {
                    background: var(--gray-900);
                    border-radius: var(--radius-lg);
                    display: flex;
                    flex-direction: column;
                    min-width: 280px;
                    border-top: 3px solid var(--gray-700);
                }

                .kanban-column.dragging {
                    border: 2px dashed var(--primary-500);
                }

                .column-header {
                    padding: var(--spacing-4);
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    border-bottom: 1px solid var(--gray-800);
                    border-top: 3px solid;
                    margin: -1px -1px 0 -1px;
                    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
                }

                .phase-emoji {
                    font-size: 1.25rem;
                }

                .phase-name {
                    font-weight: 600;
                    color: var(--gray-100);
                }

                .item-count {
                    margin-left: auto;
                    background: var(--gray-800);
                    padding: 2px 8px;
                    border-radius: var(--radius-full);
                    font-size: 0.75rem;
                    color: var(--gray-400);
                }

                .phase-info {
                    padding: var(--spacing-3) var(--spacing-4);
                    border-bottom: 1px solid var(--gray-800);
                    font-size: 0.75rem;
                    color: var(--gray-500);
                }

                .milestones-mini {
                    display: flex;
                    gap: 4px;
                    margin-top: var(--spacing-2);
                }

                .milestone-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--gray-600);
                }

                .milestone-dot.completed {
                    background: var(--success-500);
                }

                .column-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: var(--spacing-3);
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-3);
                }

                .empty-column {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--gray-500);
                    text-align: center;
                    padding: var(--spacing-6);
                }

                .empty-column .hint {
                    font-size: 0.75rem;
                    color: var(--gray-600);
                }

                .kanban-card {
                    background: var(--gray-800);
                    border-radius: var(--radius-md);
                    padding: var(--spacing-4);
                    cursor: grab;
                    transition: transform 0.1s ease, box-shadow 0.1s ease;
                }

                .kanban-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .kanban-card:active {
                    cursor: grabbing;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--spacing-2);
                }

                .status-badge {
                    font-size: 0.625rem;
                    padding: 2px 6px;
                    border-radius: var(--radius-sm);
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .platform-icon {
                    font-size: 0.875rem;
                }

                .kanban-card h4 {
                    font-size: 0.875rem;
                    color: var(--gray-100);
                    margin-bottom: var(--spacing-2);
                    line-height: 1.4;
                }

                .card-preview {
                    font-size: 0.75rem;
                    color: var(--gray-400);
                    line-height: 1.5;
                    margin-bottom: var(--spacing-3);
                }

                .card-meta {
                    display: flex;
                    gap: var(--spacing-3);
                    font-size: 0.688rem;
                    color: var(--gray-500);
                }

                .card-actions {
                    display: flex;
                    gap: var(--spacing-2);
                    margin-top: var(--spacing-3);
                    padding-top: var(--spacing-3);
                    border-top: 1px solid var(--gray-700);
                }

                .btn-sm {
                    padding: var(--spacing-1) var(--spacing-2);
                    font-size: 0.75rem;
                }

                .btn-success {
                    background: var(--success-600);
                    color: white;
                    border: none;
                    cursor: pointer;
                }

                .btn-success:hover {
                    background: var(--success-500);
                }

                .card-actions .btn {
                    padding: var(--spacing-2) var(--spacing-3);
                    font-size: 0.75rem;
                    border-radius: var(--radius-md);
                }

                .card-actions .btn-ghost {
                    color: var(--gray-400);
                    background: transparent;
                    border: 1px solid var(--gray-600);
                }

                .card-actions .btn-ghost:hover {
                    color: var(--error-400);
                    border-color: var(--error-400);
                    background: rgba(239, 68, 68, 0.1);
                }

                .add-content-btn {
                    margin: var(--spacing-3);
                    padding: var(--spacing-3);
                    border: 2px dashed var(--gray-700);
                    border-radius: var(--radius-md);
                    background: transparent;
                    color: var(--gray-400);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .add-content-btn:hover {
                    border-color: var(--primary-500);
                    color: var(--primary-400);
                    background: rgba(99, 102, 241, 0.1);
                }

                .not-found {
                    max-width: 400px;
                    margin: var(--spacing-12) auto;
                    padding: var(--spacing-8);
                    text-align: center;
                }

                .not-found h2 {
                    margin-bottom: var(--spacing-2);
                }

                .not-found p {
                    color: var(--gray-400);
                    margin-bottom: var(--spacing-6);
                }

                @media (max-width: 1200px) {
                    .kanban-board {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .kanban-board {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default PlanKanban;
