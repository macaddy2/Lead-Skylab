import { useState } from 'react';
import { useData } from '../../store/DataContext';
import { useAuth } from '../../store/AuthContext';
import { Search, Bell, HelpCircle, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
    onSearchClick?: () => void;
    onMenuClick?: () => void;
}

export default function Header({ onSearchClick, onMenuClick }: HeaderProps) {
    const { state } = useData();
    const { user, signOut } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const unreadNotifications = state.notifications.filter(n => !n.read).length;
    const pmfScore = state.metrics.overallScore;
    const pmfDotClass = pmfScore >= 70 ? 'pmf-dot--success' : pmfScore >= 40 ? 'pmf-dot--warning' : 'pmf-dot--error';

    return (
        <header className="app-header" role="banner">
            {/* Hamburger — mobile only (opens navigation drawer) */}
            <button
                type="button"
                className="header-menu-btn"
                onClick={onMenuClick}
                aria-label="Open navigation menu"
            >
                <Menu size={20} />
            </button>

            {/* Search — opens command palette */}
            <button
                type="button"
                className="header-search header-search--button"
                onClick={onSearchClick}
                aria-label="Search (open command palette)"
            >
                <span className="header-search-icon">
                    <Search size={18} />
                </span>
                <span className="header-search-placeholder">Search leads, pages, experiments...</span>
                <kbd className="header-search-kbd">⌘K</kbd>
            </button>

            {/* Right Section */}
            <div className="header-actions flex items-center gap-2">
                {/* PMF Score Badge */}
                <div className="pmf-badge">
                    <div className={`pmf-dot ${pmfDotClass}`} />
                    <span className="text-sm text-secondary">PMF Score:</span>
                    <span className="text-sm font-semibold">{pmfScore}</span>
                </div>

                {/* Help Button */}
                <button className="icon-btn hide-mobile">
                    <HelpCircle size={18} />
                </button>

                {/* Notifications Button */}
                <button className="icon-btn">
                    <Bell size={18} />
                    {unreadNotifications > 0 && (
                        <span className="notification-badge">
                            {unreadNotifications}
                        </span>
                    )}
                </button>

                {/* User Avatar with Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className={`user-avatar-btn ${userMenuOpen ? 'open' : ''}`}
                    >
                        <div className="user-avatar">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                        <>
                            <div className="dropdown-backdrop" onClick={() => setUserMenuOpen(false)} />
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <p className="text-sm font-medium">{user?.email}</p>
                                    <p className="text-xs text-muted mt-2">Signed in</p>
                                </div>
                                <div className="dropdown-body">
                                    <button
                                        className="dropdown-item dropdown-item--danger"
                                        onClick={async () => {
                                            setUserMenuOpen(false);
                                            await signOut();
                                        }}
                                    >
                                        <LogOut size={16} />
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
