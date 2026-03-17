import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    Target,
    FlaskConical,
    ClipboardList,
    Pencil,
    Rocket,
    Settings,
    ChevronsLeft,
    ChevronsRight,
    Layers,
    type LucideIcon,
} from 'lucide-react';

interface NavItem {
    path: string;
    label: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pages', label: 'Landing Pages', icon: FileText },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/audience', label: 'Audience', icon: Target },
    { path: '/experiments', label: 'Experiments', icon: FlaskConical },
    { path: '/surveys', label: 'Surveys', icon: ClipboardList },
    { path: '/content', label: 'Content Studio', icon: Pencil },
    { path: '/autopilot', label: 'Launch Autopilot', icon: Rocket },
];

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
            <nav className="sidebar-nav">
                <ul className="sidebar-nav-list">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/' && location.pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <li key={item.path}>
                                <NavLink
                                    to={item.path}
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
                >
                    {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                </button>
            </div>
        </aside>
    );
}
