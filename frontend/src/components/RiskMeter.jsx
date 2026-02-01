import { useEffect, useState, useRef } from 'react';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function RiskMeter() {
    const { riskScore, isAuditing } = useApp();
    const [animatedPercent, setAnimatedPercent] = useState(0);
    const [showPulse, setShowPulse] = useState(false);
    const prevLevelRef = useRef(riskScore.level);

    // Animate the percentage
    useEffect(() => {
        const targetPercent = riskScore.percent;
        const duration = 800; // ms
        const steps = 60;
        const increment = (targetPercent - animatedPercent) / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setAnimatedPercent(targetPercent);
                clearInterval(timer);
            } else {
                setAnimatedPercent(prev => prev + increment);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [riskScore.percent]);

    // Trigger pulse on high risk
    useEffect(() => {
        if (riskScore.level === 'high' && prevLevelRef.current !== 'high') {
            setShowPulse(true);
            const timer = setTimeout(() => setShowPulse(false), 2000);
            return () => clearTimeout(timer);
        }
        prevLevelRef.current = riskScore.level;
    }, [riskScore.level]);

    const getConfig = () => {
        switch (riskScore.level) {
            case 'high':
                return {
                    color: '#ef4444',
                    gradient: 'from-red-500 to-orange-500',
                    bgGlow: 'shadow-glow-red',
                    label: 'High Risk',
                    icon: ShieldAlert,
                    textColor: 'text-red-400',
                };
            case 'medium':
                return {
                    color: '#f59e0b',
                    gradient: 'from-amber-500 to-yellow-500',
                    bgGlow: '',
                    label: 'Medium Risk',
                    icon: Shield,
                    textColor: 'text-amber-400',
                };
            case 'low':
                return {
                    color: '#22c55e',
                    gradient: 'from-green-500 to-emerald-500',
                    bgGlow: '',
                    label: 'Low Risk',
                    icon: ShieldCheck,
                    textColor: 'text-green-400',
                };
            default:
                return {
                    color: '#64748b',
                    gradient: 'from-slate-500 to-slate-600',
                    bgGlow: '',
                    label: 'Not Assessed',
                    icon: Shield,
                    textColor: 'text-slate-400',
                };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    // Calculate arc for SVG
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedPercent / 100) * circumference * 0.75; // 270 degree arc

    return (
        <div className="flex flex-col items-center">
            {/* Circular Gauge */}
            <div className={`relative ${showPulse ? 'animate-pulse' : ''}`}>
                {/* Pulse ring for high risk */}
                {showPulse && riskScore.level === 'high' && (
                    <div className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-red-500 opacity-50" />
                )}

                <svg width="200" height="160" viewBox="0 0 200 160" className="transform -rotate-[135deg]">
                    {/* Background arc */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="rgba(100, 116, 139, 0.2)"
                        strokeWidth="12"
                        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
                        strokeLinecap="round"
                    />

                    {/* Progress arc */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={config.color}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.3s ease',
                            filter: `drop-shadow(0 0 8px ${config.color}40)`,
                        }}
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                    <div className={`p-3 rounded-full bg-gradient-to-br ${config.gradient} mb-2`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-3xl font-bold ${config.textColor}`}>
                        {animatedPercent.toFixed(0)}%
                    </span>
                    <span className={`text-sm font-medium ${config.textColor}`}>
                        {config.label}
                    </span>
                </div>
            </div>

            {/* Stats below gauge */}
            <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                <div className="text-center p-3 rounded-lg bg-cyber-dark/50 border border-cyber-cyan/10">
                    <p className="text-2xl font-bold text-white">
                        {riskScore.crackedCount}
                    </p>
                    <p className="text-xs text-slate-400">Cracked</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-cyber-dark/50 border border-cyber-cyan/10">
                    <p className="text-2xl font-bold text-white">
                        {riskScore.totalHashes}
                    </p>
                    <p className="text-xs text-slate-400">Total Hashes</p>
                </div>
            </div>

            {/* Status indicator */}
            {isAuditing && (
                <div className="mt-4 flex items-center gap-2 text-cyber-cyan">
                    <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                    <span className="text-sm">Analyzing...</span>
                </div>
            )}
        </div>
    );
}
