import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Info,
    Shield,
    Zap
} from 'lucide-react';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/about', label: 'About', icon: Info },
];

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="glass sticky top-0 z-50 border-b border-cyber-cyan/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-cyan to-cyber-magenta flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-cyber-dark" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-cyan rounded-full animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold gradient-text">JTR-AuditLab</h1>
                                <p className="text-xs text-slate-400">Password Audit Dashboard</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex items-center gap-1">
                            {navItems.map(({ path, label, icon: Icon }) => (
                                <NavLink
                                    key={path}
                                    to={path}
                                    className={({ isActive }) =>
                                        `relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isActive
                                            ? 'text-cyber-cyan bg-cyber-cyan/10'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{label}</span>
                                            {isActive && (
                                                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </nav>

                        {/* Status indicator */}
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-navy/50 border border-cyber-cyan/20">
                            <Zap className="w-4 h-4 text-cyber-cyan" />
                            <span className="text-xs text-slate-300">Lab Environment</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="glass border-t border-cyber-cyan/10 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                        <p>© 2026 JTR-AuditLab - Educational Use Only</p>
                        <p className="flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Authorized Lab Environment
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
