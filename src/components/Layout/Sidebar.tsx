import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// Icons as inline SVGs for simplicity
const icons = {
    dashboard: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    pages: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
    leads: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    audience: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    ),
    experiments: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4" />
            <path d="M3 9h18" />
            <path d="M3 15h18" />
        </svg>
    ),
    surveys: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
    ),
    settings: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
    content: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
            <circle cx="12" cy="12" r="4" />
        </svg>
    ),
    collapse: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="11 17 6 12 11 7" />
            <polyline points="18 17 13 12 18 7" />
        </svg>
    ),
    expand: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 17 18 12 13 7" />
            <polyline points="6 17 11 12 6 7" />
        </svg>
    ),
    autopilot: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
    ),
};

interface NavItem {
    path: string;
    label: string;
    icon: keyof typeof icons;
}

const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: 'dashboard' },
    { path: '/pages', label: 'Landing Pages', icon: 'pages' },
    { path: '/leads', label: 'Leads', icon: 'leads' },
    { path: '/audience', label: 'Audience', icon: 'audience' },
    { path: '/experiments', label: 'Experiments', icon: 'experiments' },
    { path: '/surveys', label: 'Surveys', icon: 'surveys' },
    { path: '/content', label: 'Content Studio', icon: 'content' },
    { path: '/autopilot', label: 'Launch Autopilot', icon: 'autopilot' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside
            className="sidebar"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '100vh',
                width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width var(--transition-slow)',
                zIndex: 'var(--z-sticky)',
                overflow: 'hidden',
            }}
        >
            {/* Logo */}
            <div
                style={{
                    padding: 'var(--space-5) var(--space-4)',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    minHeight: '64px',
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--gradient-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2" />
                        <polyline points="2 17 12 22 22 17" />
                        <polyline points="2 12 12 17 22 12" />
                    </svg>
                </div>
                {!collapsed && (
                    <div style={{ overflow: 'hidden' }}>
                        <h1
                            style={{
                                fontSize: 'var(--font-size-lg)',
                                fontWeight: 'var(--font-weight-bold)',
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Lead Skylab
                        </h1>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                            PMF Engine
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav aria-label="Main navigation" style={{ flex: 1, padding: 'var(--space-4)', overflowY: 'auto' }}>
                <ul role="menubar" aria-orientation="vertical" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));

                        return (
                            <li key={item.path} role="none">
                                <NavLink
                                    to={item.path}
                                    role="menuitem"
                                    aria-current={isActive ? 'page' : undefined}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-3)',
                                        padding: collapsed ? 'var(--space-3)' : 'var(--space-3) var(--space-4)',
                                        borderRadius: 'var(--radius-lg)',
                                        color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                        background: isActive ? 'var(--glass-hover)' : 'transparent',
                                        textDecoration: 'none',
                                        transition: 'all var(--transition-fast)',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        position: 'relative',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'var(--glass-bg)';
                                            e.currentTarget.style.color = 'var(--color-text-primary)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                                        }
                                    }}
                                >
                                    {isActive && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                left: collapsed ? '50%' : '-4px',
                                                top: collapsed ? '-4px' : '50%',
                                                transform: collapsed ? 'translateX(-50%)' : 'translateY(-50%)',
                                                width: collapsed ? '24px' : '3px',
                                                height: collapsed ? '3px' : '24px',
                                                background: 'var(--gradient-primary)',
                                                borderRadius: 'var(--radius-full)',
                                            }}
                                        />
                                    )}
                                    <span style={{ display: 'flex', alignItems: 'center' }}>
                                        {icons[item.icon]}
                                    </span>
                                    {!collapsed && (
                                        <span style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-sm)' }}>
                                            {item.label}
                                        </span>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div
                style={{
                    padding: 'var(--space-4)',
                    borderTop: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                }}
            >
                {/* Settings Link */}
                <NavLink
                    to="/settings"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        padding: collapsed ? 'var(--space-3)' : 'var(--space-3) var(--space-4)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-secondary)',
                        textDecoration: 'none',
                        transition: 'all var(--transition-fast)',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--glass-bg)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }}
                >
                    {icons.settings}
                    {!collapsed && <span style={{ fontSize: 'var(--font-size-sm)' }}>Settings</span>}
                </NavLink>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-expanded={!collapsed}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-3)',
                        background: 'transparent',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--glass-border)';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                    }}
                >
                    {collapsed ? icons.expand : icons.collapse}
                </button>
            </div>
        </aside>
    );
}
