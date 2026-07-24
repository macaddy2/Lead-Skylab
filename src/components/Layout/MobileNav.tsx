import { NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { bottomNavItems, isNavActive } from './navItems';

interface MobileNavProps {
    onMenuClick: () => void;
}

/**
 * Fixed bottom navigation bar shown on small screens (< 900px).
 * Surfaces four primary destinations plus a "More" button that opens
 * the full navigation drawer.
 */
export default function MobileNav({ onMenuClick }: MobileNavProps) {
    const location = useLocation();

    return (
        <nav className="mobile-nav" aria-label="Primary">
            {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item.path, location.pathname);
                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        aria-current={active ? 'page' : undefined}
                        className={`mobile-nav-item ${active ? 'active' : ''}`}
                    >
                        <Icon size={19} />
                        <span className="mobile-nav-label">{item.shortLabel ?? item.label}</span>
                    </NavLink>
                );
            })}
            <button
                type="button"
                className="mobile-nav-item"
                onClick={onMenuClick}
                aria-label="Open navigation menu"
            >
                <Menu size={19} />
                <span className="mobile-nav-label">More</span>
            </button>
        </nav>
    );
}
