import {
    LayoutDashboard,
    FileText,
    Users,
    Target,
    FlaskConical,
    ClipboardList,
    Pencil,
    Rocket,
    type LucideIcon,
} from 'lucide-react';

export interface NavItem {
    path: string;
    label: string;
    /** Short label for the compact mobile bottom bar */
    shortLabel?: string;
    icon: LucideIcon;
}

/** Primary navigation shown in the desktop sidebar and the mobile drawer. */
export const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/pages', label: 'Landing Pages', shortLabel: 'Pages', icon: FileText },
    { path: '/leads', label: 'Leads', icon: Users },
    { path: '/audience', label: 'Audience', icon: Target },
    { path: '/experiments', label: 'Experiments', shortLabel: 'Tests', icon: FlaskConical },
    { path: '/surveys', label: 'Surveys', icon: ClipboardList },
    { path: '/content', label: 'Content Studio', shortLabel: 'Content', icon: Pencil },
    { path: '/autopilot', label: 'Launch Autopilot', shortLabel: 'Launch', icon: Rocket },
];

/** The four destinations surfaced directly in the mobile bottom bar
 *  (a fifth "More" button opens the drawer with the full list). */
export const bottomNavItems: NavItem[] = [
    navItems[0], // Dashboard
    navItems[2], // Leads
    navItems[1], // Landing Pages
    navItems[6], // Content Studio
];

/** True when the given nav item matches the current pathname. */
export function isNavActive(itemPath: string, pathname: string): boolean {
    return (
        pathname === itemPath ||
        (itemPath !== '/' && pathname.startsWith(itemPath))
    );
}
