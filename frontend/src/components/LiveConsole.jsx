import { useEffect, useRef, useMemo } from 'react';
import { Terminal, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LiveConsole() {
    const { consoleLogs, clearConsole, isAuditing } = useApp();
    const consoleEndRef = useRef(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
    }, [consoleLogs.length]);

    const displayedLogs = useMemo(() => {
        return consoleLogs.slice(-500);
    }, [consoleLogs]);

    const getLogColor = (type) => {
        switch (type) {
            case 'success':
                return 'text-green-400';
            case 'error':
                return 'text-red-400';
            case 'warning':
                return 'text-yellow-400';
            default:
                return 'text-slate-300';
        }
    };

    return (
        <div className="console h-full flex flex-col">
            <div className="console-header flex-shrink-0">
                <div className="console-dot bg-red-500" />
                <div className="console-dot bg-yellow-500" />
                <div className="console-dot bg-green-500" />
                <div className="flex-1 flex items-center justify-between ml-4">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-cyber-cyan" />
                        <span className="text-sm font-medium text-slate-300">Live Output</span>
                        {consoleLogs.length > 500 && (
                            <span className="text-xs text-slate-500">(showing last 500)</span>
                        )}
                    </div>
                    <button
                        onClick={clearConsole}
                        disabled={isAuditing}
                        className="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                        title="Clear console"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="console-body flex-1 overflow-y-auto">
                {displayedLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600">
                        <Terminal className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">Waiting for audit output...</p>
                        <p className="text-xs mt-1">Start an audit to see live results</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {displayedLogs.map((log, index) => (
                            <div key={index} className="flex gap-3 animate-fade-in text-sm">
                                <span className="text-slate-600 flex-shrink-0 text-xs min-w-[80px]">
                                    [{log.timestamp}]
                                </span>
                                <span className={`${getLogColor(log.type)} break-all flex-1`}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                        <div ref={consoleEndRef} />
                    </div>
                )}
            </div>

            <div className="px-3 py-2 border-t border-cyber-cyan/10 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                    {consoleLogs.length} total lines
                </span>
                {isAuditing && (
                    <span className="flex items-center gap-2 text-cyber-cyan">
                        <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse" />
                        Running
                    </span>
                )}
            </div>
        </div>
    );
}
