import { Shield } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import AuditControls from '../components/AuditControls';
import LiveConsole from '../components/LiveConsole';
import RiskMeter from '../components/RiskMeter';
import SessionSummary from '../components/SessionSummary';

export default function Dashboard() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Shield className="w-7 h-7 text-cyber-cyan" />
                        Password Audit Dashboard
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        JTR-AuditLab - Controlled Lab Environment
                    </p>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column - Control Panel */}
                <div className="lg:col-span-5 space-y-6">
                    {/* File Upload Card */}
                    <div className="glass-card glass-card-hover p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyber-cyan" />
                            Dataset Management
                        </h2>
                        <FileUpload />
                    </div>

                    {/* Audit Controls Card */}
                    <div className="glass-card glass-card-hover p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyber-magenta" />
                            Audit Configuration
                        </h2>
                        <AuditControls />
                    </div>
                </div>

                {/* Right Column - Output & Telemetry */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Live Console */}
                    <div className="glass-card glass-card-hover overflow-hidden" style={{ height: '400px' }}>
                        <LiveConsole />
                    </div>

                    {/* Risk Meter & Summary Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Risk Score Meter */}
                        <div className="glass-card glass-card-hover p-6">
                            <h3 className="text-sm font-semibold text-slate-300 mb-4 text-center">
                                Risk Assessment
                            </h3>
                            <RiskMeter />
                        </div>

                        {/* Session Summary */}
                        <div>
                            <SessionSummary />
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="glass-card p-4 border-l-4 border-cyber-magenta">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-cyber-magenta flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-white">
                            Educational & Defensive Use Only
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            This tool is designed for password policy auditing in controlled lab environments.
                            Unauthorized use against systems without explicit permission is prohibited.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
