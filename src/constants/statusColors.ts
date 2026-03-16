/**
 * Lead Skylab — Shared Status & Phase Color Constants
 *
 * Single source of truth for all status/phase color mappings used across
 * PlanKanban, ContentQueue, LaunchAutopilot dashboard, and ExperimentDetail.
 *
 * These are raw hex values because they are used as dynamic JS props (e.g.
 * Recharts fills, CSS `color + '20'` alpha compositing). Where possible,
 * values are pinned to the equivalent design-system token value.
 *
 * Token reference:
 *   --color-primary       = #6366f1
 *   --color-primary-light = #818cf8
 *   --color-secondary     = #8b5cf6
 *   --color-accent        = #06b6d4
 *   --color-success       = #10b981  (success-500)
 *   --success-400         = #34d399
 *   --color-warning       = #f59e0b  (warning-500)
 *   --warning-400         = #fbbf24
 *   --color-error         = #ef4444  (error-500)
 *   --gray-500            = #6b7280
 */

// ─── Content Queue & Kanban — item status ────────────────────────────────────

export type ContentStatus = 'queued' | 'approved' | 'published' | 'rejected' | 'failed';

export const CONTENT_STATUS_COLORS: Record<ContentStatus, string> = {
    queued: '#f59e0b', // --color-warning
    approved: '#10b981', // --color-success
    published: '#6366f1', // --color-primary
    rejected: '#ef4444', // --color-error
    failed: '#ef4444', // --color-error
};

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
    queued: 'Pending',
    approved: 'Approved',
    published: 'Published',
    rejected: 'Rejected',
    failed: 'Failed',
};

export function getContentStatusColor(status: string): string {
    return CONTENT_STATUS_COLORS[status as ContentStatus] ?? '#6b7280';
}

export function getContentStatusLabel(status: string): string {
    return CONTENT_STATUS_LABELS[status as ContentStatus] ?? status;
}

// ─── Launch Plan — phase colors ───────────────────────────────────────────────

export type LaunchPhaseKey = 'pre_launch' | 'launch_day' | 'growth' | 'complete';

export interface PhaseStyle {
    label: string;
    emoji: string;
    color: string;
}

export const PHASE_STYLES: Record<LaunchPhaseKey, PhaseStyle> = {
    pre_launch: { label: 'Pre-Launch', emoji: '🎯', color: '#6366f1' },  // --color-primary
    launch_day: { label: 'Launch Day', emoji: '🚀', color: '#f59e0b' },  // --color-warning
    growth: { label: 'Growth', emoji: '📈', color: '#10b981' },  // --color-success
    complete: { label: 'Complete', emoji: '✅', color: '#8b5cf6' },  // --color-secondary
};

// ─── Dashboard Stat Cards — gradient + sparkline color ───────────────────────

export interface StatStyle {
    gradient: string;
    color: string;
}

export const STAT_STYLES = {
    activeLaunches: { gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#8b5cf6' },
    pendingApproval: { gradient: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)', color: '#f59e0b' },
    inQueue: { gradient: 'linear-gradient(135deg, #06b6d4 0%, #0ea5e9 100%)', color: '#06b6d4' },
    publishedToday: { gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', color: '#10b981' },
} satisfies Record<string, StatStyle>;

// ─── Recharts — chart bar colors (token-pinned values) ───────────────────────

export const CHART_COLORS = {
    primary: '#6366f1', // --color-primary
    success: '#10b981', // --color-success
    warning: '#f59e0b', // --color-warning
    error: '#ef4444', // --color-error
    muted: '#64748b', // --color-text-muted
    secondary: '#94a3b8', // --color-text-secondary
};
