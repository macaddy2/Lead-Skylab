import { describe, it, expect } from 'vitest';
import {
    CONTENT_STATUS_COLORS,
    PHASE_STYLES,
    STAT_STYLES,
    CHART_COLORS,
    getContentStatusColor,
    getContentStatusLabel,
} from '../constants/statusColors';

describe('statusColors constants', () => {
    it('CONTENT_STATUS_COLORS maps every queue status to a hex color', () => {
        const statuses = ['queued', 'approved', 'published', 'rejected', 'failed'] as const;
        statuses.forEach((s) => {
            expect(CONTENT_STATUS_COLORS[s]).toBeDefined();
            expect(CONTENT_STATUS_COLORS[s]).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    it('PHASE_STYLES covers all launch phases', () => {
        const phases = ['pre_launch', 'launch_day', 'growth', 'complete'] as const;
        phases.forEach((p) => {
            expect(PHASE_STYLES[p]).toBeDefined();
            expect(PHASE_STYLES[p].label).toBeTruthy();
            expect(PHASE_STYLES[p].emoji).toBeTruthy();
            expect(PHASE_STYLES[p].color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    it('STAT_STYLES has gradient and color for each stat type', () => {
        expect(Object.keys(STAT_STYLES).length).toBeGreaterThan(0);
        Object.values(STAT_STYLES).forEach((style) => {
            expect(style.gradient).toContain('linear-gradient');
            expect(style.color).toMatch(/^#[0-9a-f]{6}$/i);
        });
    });

    it('CHART_COLORS has at least primary, success, warning, error', () => {
        expect(CHART_COLORS.primary).toBeDefined();
        expect(CHART_COLORS.success).toBeDefined();
        expect(CHART_COLORS.warning).toBeDefined();
        expect(CHART_COLORS.error).toBeDefined();
    });

    it('getContentStatusColor returns fallback for unknown status', () => {
        expect(getContentStatusColor('unknown')).toBe('#6b7280');
    });

    it('getContentStatusLabel returns original string for unknown status', () => {
        expect(getContentStatusLabel('foo')).toBe('foo');
    });
});
