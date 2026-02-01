import {
    Shield,
    BookOpen,
    AlertTriangle,
    CheckCircle,
    Lock,
    Key,
    Cpu,
    Zap,
    Users,
    GraduationCap,
    Scale,
    Terminal
} from 'lucide-react';

const attackModes = [
    {
        name: 'Dictionary Attack',
        icon: BookOpen,
        description: 'Uses wordlists of common passwords and variations. Most effective against weak passwords based on dictionary words.',
        effectiveness: 'High for common passwords',
    },
    {
        name: 'Brute Force / Incremental',
        icon: Zap,
        description: 'Tries every possible combination systematically. Guaranteed to find the password eventually, but can be extremely slow for long passwords.',
        effectiveness: 'Guaranteed but slow',
    },
    {
        name: 'Single Crack Mode',
        icon: Key,
        description: 'Uses login names and GECOS information to generate candidate passwords. Effective for systems with user metadata.',
        effectiveness: 'High for systems with user info',
    },
];

const ethicsPoints = [
    {
        icon: CheckCircle,
        title: 'Explicit Authorization',
        description: 'Only audit systems where you have written permission from the owner.',
    },
    {
        icon: Lock,
        title: 'Controlled Environment',
        description: 'Use only in isolated lab environments, never on production systems without approval.',
    },
    {
        icon: Users,
        title: 'Educational Purpose',
        description: 'The goal is to improve security awareness and password policies, not to compromise accounts.',
    },
    {
        icon: Scale,
        title: 'Legal Compliance',
        description: 'Unauthorized password cracking is illegal under computer fraud laws in most jurisdictions.',
    },
];

export default function About() {
    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyber-cyan to-cyber-magenta mb-4">
                    <Shield className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold gradient-text mb-2">
                    JTR-AuditLab
                </h1>
                <p className="text-lg text-slate-400">
                    Password Audit Dashboard for Controlled Lab Environments
                </p>
            </div>

            {/* Main Info Card */}
            <div className="glass-card p-8">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-cyber-cyan/10">
                        <Terminal className="w-6 h-6 text-cyber-cyan" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">What is JTR-AuditLab?</h2>
                        <p className="text-slate-300 leading-relaxed">
                            JTR-AuditLab is a modern graphical interface for password security auditing and assessment.
                            Built on proven open-source tools, it combines powerful password analysis capabilities with
                            an accessible, educational interface designed for security professionals and students learning
                            password security concepts in controlled environments.
                        </p>
                    </div>
                </div>

                <div className="bg-cyber-dark/50 rounded-xl p-6 border border-cyber-cyan/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-cyber-magenta" />
                        Purpose of This GUI
                    </h3>
                    <p className="text-slate-300 leading-relaxed mb-4">
                        This graphical interface provides an accessible way to perform password security audits for
                        <strong className="text-cyber-cyan"> defensive and educational purposes</strong>.
                        Security professionals and students can use it to:
                    </p>
                    <ul className="space-y-2 text-slate-300">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <span>Audit password strength in organizational systems</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <span>Evaluate and improve password policies</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <span>Learn about password security concepts in a lab setting</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                            <span>Train security teams on password vulnerabilities</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Attack Modes */}
            <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Key className="w-5 h-5 text-cyber-cyan" />
                    Attack Modes Explained
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attackModes.map((mode) => (
                        <div
                            key={mode.name}
                            className="p-5 rounded-xl bg-cyber-dark/50 border border-cyber-cyan/10 hover:border-cyber-cyan/30 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-lg bg-cyber-cyan/10">
                                    <mode.icon className="w-5 h-5 text-cyber-cyan" />
                                </div>
                                <h3 className="font-semibold text-white">{mode.name}</h3>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{mode.description}</p>
                            <p className="text-xs text-cyber-magenta">
                                Effectiveness: {mode.effectiveness}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Ethics Section */}
            <div className="glass-card p-8 border-l-4 border-amber-500">
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-amber-500/10">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Lab Usage & Ethics</h2>
                        <p className="text-slate-300">
                            Password auditing tools carry significant ethical and legal responsibilities.
                            Always follow these guidelines:
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ethicsPoints.map((point) => (
                        <div
                            key={point.title}
                            className="flex items-start gap-3 p-4 rounded-xl bg-cyber-dark/50 border border-amber-500/20"
                        >
                            <point.icon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-white mb-1">{point.title}</h4>
                                <p className="text-sm text-slate-400">{point.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400 font-medium">
                        ⚠️ Warning: Unauthorized access to computer systems is a criminal offense.
                        Using password cracking tools without explicit permission is illegal and unethical.
                        This tool is intended solely for authorized security testing and educational purposes.
                    </p>
                </div>
            </div>

            {/* Project Info */}
            <div className="glass-card p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyber-cyan" />
                    Project Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center p-4 rounded-xl bg-cyber-dark/50 border border-cyber-cyan/10">
                        <p className="text-sm text-slate-400 mb-1">Version</p>
                        <p className="text-lg font-bold text-white">1.0.0</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-cyber-dark/50 border border-cyber-cyan/10">
                        <p className="text-sm text-slate-400 mb-1">Environment</p>
                        <p className="text-lg font-bold text-white">Lab Only</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-cyber-dark/50 border border-cyber-cyan/10">
                        <p className="text-sm text-slate-400 mb-1">License</p>
                        <p className="text-lg font-bold text-white">Educational</p>
                    </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20">
                    <p className="text-sm text-slate-300 text-center">
                        Built with React, FastAPI, and powerful security auditing tools.
                        <br />
                        <span className="text-cyber-cyan">For educational and authorized security testing only.</span>
                    </p>
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center text-sm text-slate-500 pb-8">
                <p>
                    JTR-AuditLab is an independent educational platform for password security auditing.
                </p>
            </div>
        </div>
    );
}
