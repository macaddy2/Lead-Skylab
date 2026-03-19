import type { LeadStage } from '../types';

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateMedium(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'var(--color-success)';
  if (score >= 50) return 'var(--color-warning)';
  return 'var(--color-text-muted)';
}

export const stageColors: Record<LeadStage, string> = {
  new: 'badge-info',
  contacted: 'badge-primary',
  qualified: 'badge-success',
  proposal: 'badge-warning',
  negotiation: 'badge-primary',
  won: 'badge-success',
  lost: 'badge-error',
};
