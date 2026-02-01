import { useState } from 'react';
import { Play, Square, Settings, ChevronDown, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const auditModes = [
    { value: 'dictionary', label: 'Dictionary Attack', description: 'Wordlist-based attack using common passwords' },
    { value: 'bruteforce', label: 'Brute Force (Incremental)', description: 'Tries all digit/char combinations for increasing lengths' },
    { value: 'policy', label: 'Single Crack Mode', description: 'Uses login names and GECOS info for password cracking' },
];

export default function AuditControls() {
    const {
        selectedDataset,
        isAuditing,
        startAudit,
        stopAudit
    } = useApp();

    const [mode, setMode] = useState('dictionary');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [options, setOptions] = useState({
        verbose: false,
        estimate_only: false,
    });

    const handleStartAudit = () => {
        if (selectedDataset) {
            startAudit(selectedDataset.id, mode, options);
        }
    };

    const selectedMode = auditModes.find(m => m.value === mode);

    return (
        <div className="space-y-5">
            {/* Mode Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Audit Mode
                </label>
                <div className="relative">
                    <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        disabled={isAuditing}
                        className="select-cyber"
                    >
                        {auditModes.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>
                {selectedMode && (
                    <p className="mt-1.5 text-xs text-slate-500">
                        {selectedMode.description}
                    </p>
                )}
            </div>

            {/* Advanced Options Toggle */}
            <div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-cyber-cyan transition-colors"
                >
                    <Settings className="w-4 h-4" />
                    <span>Advanced Options</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                {showAdvanced && (
                    <div className="mt-3 p-4 rounded-lg bg-cyber-dark/50 border border-cyber-cyan/10 space-y-3 animate-fade-in">
                        {/* Verbose Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-white">Verbose Output</p>
                                <p className="text-xs text-slate-500">Show detailed progress information</p>
                            </div>
                            <button
                                onClick={() => setOptions(prev => ({ ...prev, verbose: !prev.verbose }))}
                                disabled={isAuditing}
                                className={`toggle ${options.verbose ? 'active' : ''}`}
                            >
                                <span className="toggle-knob" />
                            </button>
                        </div>

                        {/* Estimate Only Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-white">Estimate Only</p>
                                <p className="text-xs text-slate-500">Only estimate crack time, no full run</p>
                            </div>
                            <button
                                onClick={() => setOptions(prev => ({ ...prev, estimate_only: !prev.estimate_only }))}
                                disabled={isAuditing}
                                className={`toggle ${options.estimate_only ? 'active' : ''}`}
                            >
                                <span className="toggle-knob" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Selected Dataset Info */}
            {selectedDataset && (
                <div className="p-3 rounded-lg bg-cyber-cyan/5 border border-cyber-cyan/20">
                    <p className="text-xs text-slate-400">Selected Dataset</p>
                    <p className="text-sm font-medium text-white truncate mt-0.5">
                        {selectedDataset.name}
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleStartAudit}
                    disabled={isAuditing || !selectedDataset}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                    {isAuditing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Auditing...</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            <span>Start Audit</span>
                        </>
                    )}
                </button>

                {isAuditing && (
                    <button
                        onClick={stopAudit}
                        className="btn-danger flex items-center justify-center gap-2 px-6"
                    >
                        <Square className="w-4 h-4" />
                        <span>Stop</span>
                    </button>
                )}
            </div>

            {/* Warning Note */}
            {!selectedDataset && (
                <p className="text-xs text-center text-amber-400/80">
                    Please upload and select a dataset first
                </p>
            )}
        </div>
    );
}
