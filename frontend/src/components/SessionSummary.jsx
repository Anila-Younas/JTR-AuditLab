import { Hash, Target, Clock, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SessionSummary() {
    const { riskScore, sessions, isAuditing } = useApp();

    // Get the most recent completed session
    const latestSession = sessions.find(s => s.status === 'completed');

    const stats = [
        {
            label: 'Total Hashes',
            value: riskScore.totalHashes || latestSession?.total_hashes || 0,
            icon: Hash,
            color: 'text-cyber-cyan',
        },
        {
            label: 'Cracked',
            value: riskScore.crackedCount || latestSession?.cracked_count || 0,
            icon: Target,
            color: 'text-green-400',
        },
        {
            label: 'Avg Time',
            value: latestSession?.duration
                ? `${latestSession.duration.toFixed(1)}s`
                : '—',
            icon: Clock,
            color: 'text-amber-400',
        },
        {
            label: 'Mode',
            value: latestSession?.mode
                ? latestSession.mode.charAt(0).toUpperCase() + latestSession.mode.slice(1)
                : '—',
            icon: Activity,
            color: 'text-cyber-magenta',
        },
    ];

    return (
        <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-cyan" />
                Session Summary
            </h3>

            <div className="grid grid-cols-2 gap-3">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div
                        key={label}
                        className="p-3 rounded-lg bg-cyber-dark/50 border border-cyber-cyan/10"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${color}`} />
                            <span className="text-xs text-slate-500">{label}</span>
                        </div>
                        <p className="text-lg font-bold text-white">
                            {value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Progress bar for current session */}
            {isAuditing && riskScore.totalHashes > 0 && (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progress</span>
                        <span>{riskScore.percent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-cyber-dark rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyber-cyan to-cyber-magenta transition-all duration-300"
                            style={{ width: `${Math.min(riskScore.percent, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* No session message */}
            {!latestSession && !isAuditing && (
                <p className="text-xs text-slate-500 text-center mt-3">
                    No audit sessions yet
                </p>
            )}
        </div>
    );
}
