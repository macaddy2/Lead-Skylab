import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    Settings,
    ChevronsLeft,
    ChevronsRight,
    Layers,
} from 'lucide-react';
import { navItems, isNavActive } from './navItems';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside
            className="sidebar"
            style={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
        >
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Layers size={24} color="white" />
                </div>
                {!collapsed && (
                    <div className="sidebar-logo-overflow">
                        <h1 className="sidebar-logo-text">Lead Skylab</h1>
                        <p className="sidebar-logo-subtitle">PMF Engine</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav" aria-label="Main navigation">
                <ul className="sidebar-nav-list">
                    {navItems.map((item) => {
                        const isActive = isNavActive(item.path, location.pathname);
                        const Icon = item.icon;

                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
                                    aria-current={isActive ? 'page' : undefined}
                                    title={collapsed ? item.label : undefined}
                                    className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                                    style={{
                                        padding: collapsed ? 'var(--space-3)' : 'var(--space-3) var(--space-4)',
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                    }}
                                >
                                    {isActive && (
                                        <div
                                            className="sidebar-active-indicator"
                                            style={collapsed
                                                ? { left: '50%', top: '-4px', transform: 'translateX(-50%)', width: '24px', height: '3px' }
                                                : { left: '-4px', top: '50%', transform: 'translateY(-50%)', width: '3px', height: '24px' }
                                            }
                                        />
                                    )}
                                    <span className="sidebar-icon-wrap">
                                        <Icon size={20} />
                                    </span>
                                    {!collapsed && (
                                        <span className="sidebar-nav-label">
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
            <div className="sidebar-footer">
                {/* Settings Link */}
                <NavLink
                    to="/settings"
                    className="sidebar-nav-link"
                    style={{
                        padding: collapsed ? 'var(--space-3)' : 'var(--space-3) var(--space-4)',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                    }}
                >
                    <Settings size={20} />
                    {!collapsed && <span className="sidebar-nav-label">Settings</span>}
                </NavLink>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="sidebar-collapse-btn"
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    aria-expanded={!collapsed}
                >
                    {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                </button>
            </div>
        </aside>
    );
}
