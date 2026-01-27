import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';

const icons = {
    search: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
        </svg>
    ),
    bell: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    help: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
        </svg>
    ),
    logout: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    ),
};

export default function Header() {
    const { state } = useData();
    const { user, signOut } = useAuth();
    const [searchFocused, setSearchFocused] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const unreadNotifications = state.notifications.filter(n => !n.read).length;

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 'var(--sidebar-width)',
                right: 0,
                height: 'var(--header-height)',
                background: 'rgba(10, 10, 15, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 var(--space-6)',
                zIndex: 'var(--z-sticky)',
                transition: 'left var(--transition-slow)',
            }}
        >
            {/* Search */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '400px',
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        left: 'var(--space-4)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: searchFocused ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        transition: 'color var(--transition-fast)',
                        display: 'flex',
                    }}
                >
                    {icons.search}
                </span>
                <input
                    type="text"
                    placeholder="Search leads, pages, experiments..."
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    style={{
                        width: '100%',
                        padding: 'var(--space-3) var(--space-4) var(--space-3) var(--space-12)',
                        background: 'var(--color-bg-tertiary)',
                        border: `1px solid ${searchFocused ? 'var(--color-primary)' : 'var(--glass-border)'}`,
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-primary)',
                        fontSize: 'var(--font-size-sm)',
                        outline: 'none',
                        transition: 'all var(--transition-fast)',
                    }}
                />
                <kbd
                    style={{
                        position: 'absolute',
                        right: 'var(--space-3)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        padding: 'var(--space-1) var(--space-2)',
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                        fontFamily: 'var(--font-mono)',
                    }}
                >
                    ⌘K
                </kbd>
            </div>

            {/* Right Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                {/* PMF Score Badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        padding: 'var(--space-2) var(--space-4)',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-full)',
                        marginRight: 'var(--space-4)',
                    }}
                >
                    <div
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: state.metrics.overallScore >= 70
                                ? 'var(--color-success)'
                                : state.metrics.overallScore >= 40
                                    ? 'var(--color-warning)'
                                    : 'var(--color-error)',
                        }}
                    />
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                        PMF Score:
                    </span>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {state.metrics.overallScore}
                    </span>
                </div>

                {/* Help Button */}
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--glass-bg)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                    }}
                >
                    {icons.help}
                </button>

                {/* Notifications Button */}
                <button
                    style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '36px',
                        height: '36px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-lg)',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--glass-bg)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                    }}
                >
                    {icons.bell}
                    {unreadNotifications > 0 && (
                        <span
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '16px',
                                height: '16px',
                                background: 'var(--gradient-accent)',
                                borderRadius: '50%',
                                fontSize: '10px',
                                fontWeight: 'var(--font-weight-semibold)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {unreadNotifications}
                        </span>
                    )}
                </button>

                {/* User Avatar with Dropdown */}
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-3)',
                            padding: 'var(--space-2)',
                            background: userMenuOpen ? 'var(--glass-bg)' : 'transparent',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--glass-bg)';
                        }}
                        onMouseLeave={(e) => {
                            if (!userMenuOpen) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-full)',
                                background: 'var(--gradient-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-semibold)',
                                color: 'white',
                            }}
                        >
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <div 
                                onClick={() => setUserMenuOpen(false)}
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    zIndex: 10,
                                }}
                            />
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 8px)',
                                    right: 0,
                                    width: '240px',
                                    background: 'var(--color-bg-elevated)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 20,
                                    overflow: 'hidden',
                                }}
                            >
                                {/* User Info */}
                                <div
                                    style={{
                                        padding: 'var(--space-4)',
                                        borderBottom: '1px solid var(--glass-border)',
                                    }}
                                >
                                    <p style={{ 
                                        margin: 0, 
                                        fontSize: 'var(--font-size-sm)', 
                                        fontWeight: 'var(--font-weight-medium)',
                                        color: 'var(--color-text-primary)',
                                    }}>
                                        {user?.email}
                                    </p>
                                    <p style={{ 
                                        margin: 'var(--space-1) 0 0', 
                                        fontSize: 'var(--font-size-xs)', 
                                        color: 'var(--color-text-muted)',
                                    }}>
                                        Signed in
                                    </p>
                                </div>

                                {/* Menu Items */}
                                <div style={{ padding: 'var(--space-2)' }}>
                                    <button
                                        onClick={async () => {
                                            setUserMenuOpen(false);
                                            await signOut();
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-3)',
                                            width: '100%',
                                            padding: 'var(--space-3) var(--space-3)',
                                            background: 'transparent',
                                            border: 'none',
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--color-error)',
                                            fontSize: 'var(--font-size-sm)',
                                            cursor: 'pointer',
                                            transition: 'all var(--transition-fast)',
                                            textAlign: 'left',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        {icons.logout}
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
