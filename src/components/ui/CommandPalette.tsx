import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../store/DataContext';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'lead' | 'page' | 'experiment' | 'survey' | 'content' | 'nav';
  title: string;
  subtitle: string;
  path: string;
}

const navItems: SearchResult[] = [
  { id: 'nav-dashboard', type: 'nav', title: 'Dashboard', subtitle: 'PMF metrics overview', path: '/' },
  { id: 'nav-leads', type: 'nav', title: 'Leads', subtitle: 'Lead management', path: '/leads' },
  { id: 'nav-pages', type: 'nav', title: 'Landing Pages', subtitle: 'Page builder', path: '/pages' },
  { id: 'nav-experiments', type: 'nav', title: 'Experiments', subtitle: 'A/B testing', path: '/experiments' },
  { id: 'nav-surveys', type: 'nav', title: 'Surveys', subtitle: 'Survey builder', path: '/surveys' },
  { id: 'nav-audience', type: 'nav', title: 'Audience', subtitle: 'Segmentation', path: '/audience' },
  { id: 'nav-content', type: 'nav', title: 'Content Studio', subtitle: 'Content creation', path: '/content' },
  { id: 'nav-autopilot', type: 'nav', title: 'Launch Autopilot', subtitle: 'Launch planning', path: '/autopilot' },
];

const typeIcons: Record<string, React.ReactNode> = {
  lead: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  ),
  page: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  experiment: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18" />
    </svg>
  ),
  survey: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  content: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v1m0 16v1m9-9h-1M4 12H3" />
    </svg>
  ),
  nav: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

const typeLabels: Record<string, string> = {
  lead: 'Lead',
  page: 'Page',
  experiment: 'Experiment',
  survey: 'Survey',
  content: 'Content',
  nav: 'Navigate',
};

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { state } = useData();

  // Build searchable items from app state
  const allItems = useMemo((): SearchResult[] => {
    const items: SearchResult[] = [...navItems];

    state.leads.forEach((lead) => {
      items.push({
        id: lead.id,
        type: 'lead',
        title: lead.name,
        subtitle: `${lead.email} - ${lead.stage}`,
        path: `/leads/${lead.id}`,
      });
    });

    state.landingPages.forEach((page) => {
      items.push({
        id: page.id,
        type: 'page',
        title: page.title,
        subtitle: `/${page.slug} - ${page.status}`,
        path: `/pages/${page.id}`,
      });
    });

    state.experiments.forEach((exp) => {
      items.push({
        id: exp.id,
        type: 'experiment',
        title: exp.name,
        subtitle: `${exp.status} - ${exp.variants.length} variants`,
        path: `/experiments/${exp.id}`,
      });
    });

    state.surveys.forEach((survey) => {
      items.push({
        id: survey.id,
        type: 'survey',
        title: survey.title,
        subtitle: `${survey.status} - ${survey.responses.length} responses`,
        path: `/surveys/${survey.id}`,
      });
    });

    return items;
  }, [state.leads, state.landingPages, state.experiments, state.surveys]);

  // Filter results
  const results = useMemo(() => {
    if (!query.trim()) return navItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [query, allItems]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement;
      selected?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleSelect = useCallback((result: SearchResult) => {
    navigate(result.path);
    onClose();
  }, [navigate, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="presentation"
      style={{ alignItems: 'flex-start', paddingTop: '20vh' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search and navigate"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--glass-border)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, pages, experiments..."
            aria-label="Search"
            aria-activedescendant={results[selectedIndex]?.id}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontSize: 'var(--font-size-base)',
            }}
          />
          <kbd
            style={{
              padding: '2px 6px',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          role="listbox"
          style={{
            maxHeight: '340px',
            overflowY: 'auto',
            padding: 'var(--space-2)',
          }}
        >
          {results.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No results found
            </div>
          ) : (
            results.map((result, index) => (
              <div
                key={result.id}
                id={result.id}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSelect(result)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  background: index === selectedIndex ? 'var(--glass-hover)' : 'transparent',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span style={{ color: 'var(--color-text-muted)', display: 'flex', flexShrink: 0 }}>
                  {typeIcons[result.type]}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
                    {result.title}
                  </div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {result.subtitle}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    background: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    flexShrink: 0,
                  }}
                >
                  {typeLabels[result.type]}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-5)',
            borderTop: '1px solid var(--glass-border)',
            fontSize: '11px',
            color: 'var(--color-text-muted)',
          }}
        >
          <span><kbd style={{ fontFamily: 'var(--font-mono)' }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ fontFamily: 'var(--font-mono)' }}>↵</kbd> select</span>
          <span><kbd style={{ fontFamily: 'var(--font-mono)' }}>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
