import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { navItems, isNavActive } from './navItems';

interface MobileDrawerProps {
    open: boolean;
    onClose: () => void;
}

/**
 * Slide-in navigation drawer for small screens. Opened from the header
 * hamburger or the bottom bar's "More" button. Lists the full nav.
 */
export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
    const location = useLocation();

    // Close on Escape while open.
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="mobile-drawer-overlay" onClick={onClose}>
            <aside
                className="mobile-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mobile-drawer-logo">
                    <div className="sidebar-logo-icon" style={{ width: 32, height: 32 }}>
                        <Layers size={16} color="white" />
                    </div>
                    <span className="mobile-drawer-logo-text">Lead Skylab</span>
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isNavActive(item.path, location.pathname);
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            aria-current={active ? 'page' : undefined}
                            className={`sidebar-nav-link ${active ? 'active' : ''}`}
                            style={{ padding: 'var(--space-3) var(--space-4)' }}
                        >
                            <span className="sidebar-icon-wrap">
                                <Icon size={17} />
                            </span>
                            <span className="sidebar-nav-label">{item.label}</span>
                        </NavLink>
                    );
                })}
            </aside>
        </div>
    );
}
