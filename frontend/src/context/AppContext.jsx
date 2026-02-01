import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

const STORAGE_KEYS = {
    DATASETS: 'jtr_datasets',
    SESSIONS: 'jtr_sessions',
};

export function AppProvider({ children }) {
    const [datasets, setDatasets] = useState([]);
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [abortController, setAbortController] = useState(null);
    const [consoleLogs, setConsoleLogs] = useState([]);
    const consoleBatchRef = useRef([]);
    const consoleTimerRef = useRef(null);
    const [riskScore, setRiskScore] = useState({
        level: 'none',
        percent: 0,
        totalHashes: 0,
        crackedCount: 0,
    });
    const [sessions, setSessions] = useState([]);
    const [toasts, setToasts] = useState([]);
    const datasetCacheRef = useRef({ data: null, timestamp: null });
    const CACHE_TTL = 5000;

    useEffect(() => {
        const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
        if (savedSessions) {
            try {
                setSessions(JSON.parse(savedSessions));
            } catch (e) {
                console.error('Failed to load sessions from storage');
            }
        }

        fetchSessions();
        fetchDatasets();
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    }, [sessions]);

    const fetchDatasets = useCallback(async () => {
        const now = Date.now();
        const cache = datasetCacheRef.current;

        if (cache.data && cache.timestamp && (now - cache.timestamp) < CACHE_TTL) {
            setDatasets(cache.data);
            return;
        }

        try {
            const { datasets: apiDatasets } = await api.listDatasets();
            const data = apiDatasets || [];
            datasetCacheRef.current = { data, timestamp: now };
            setDatasets(data);
        } catch (error) {
            console.error('Failed to fetch datasets:', error);
        }
    }, []);

    const fetchSessions = useCallback(async () => {
        try {
            const { sessions: apiSessions } = await api.listSessions();
            if (apiSessions && apiSessions.length > 0) {
                setSessions(apiSessions);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        }
    }, []);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const uploadDataset = useCallback(async (file) => {
        try {
            const result = await api.uploadDataset(file);
            if (result.success) {
                setDatasets(prev => [...prev, result.dataset]);
                addToast(`Dataset "${file.name}" uploaded successfully`, 'success');
                return result.dataset;
            }
        } catch (error) {
            addToast(`Upload failed: ${error.message}`, 'error');
            throw error;
        }
    }, [addToast]);

    const deleteDataset = useCallback(async (datasetId) => {
        try {
            await api.deleteDataset(datasetId);
            setDatasets(prev => prev.filter(d => d.id !== datasetId));
            if (selectedDataset?.id === datasetId) {
                setSelectedDataset(null);
            }
            addToast('Dataset deleted', 'info');
        } catch (error) {
            addToast(`Failed to delete dataset: ${error.message}`, 'error');
        }
    }, [selectedDataset, addToast]);

    const addConsoleLog = useCallback((message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        consoleBatchRef.current.push({ timestamp, message, type });

        if (consoleTimerRef.current) {
            clearTimeout(consoleTimerRef.current);
        }

        consoleTimerRef.current = setTimeout(() => {
            const batch = consoleBatchRef.current;
            consoleBatchRef.current = [];

            if (batch.length > 0) {
                setConsoleLogs(prev => {
                    const updated = [...prev, ...batch];
                    return updated.slice(-1000);
                });
            }
        }, 50);
    }, []);

    const clearConsole = useCallback(() => {
        setConsoleLogs([]);
    }, []);

    const startAudit = useCallback(async (datasetId, mode, options = {}) => {
        if (!datasetId) {
            addToast('Please select a dataset first', 'error');
            return;
        }

        setIsAuditing(true);
        clearConsole();
        setRiskScore({ level: 'none', percent: 0, totalHashes: 0, crackedCount: 0 });

        const controller = new AbortController();
        setAbortController(controller);

        addConsoleLog('Initializing audit...', 'info');
        addToast('Audit started', 'info');

        try {
            await api.runAudit(
                datasetId,
                mode,
                options,
                (message) => {
                    switch (message.type) {
                        case 'info':
                        case 'status':
                            addConsoleLog(message.message, 'info');
                            break;
                        case 'cracked':
                            addConsoleLog(message.message, 'success');
                            setRiskScore(prev => ({
                                ...prev,
                                crackedCount: message.cracked_count,
                                totalHashes: message.total,
                                percent: (message.cracked_count / message.total) * 100,
                            }));
                            break;
                        case 'warning':
                            addConsoleLog(message.message, 'warning');
                            break;
                        case 'error':
                            addConsoleLog(message.message, 'error');
                            break;
                        case 'summary':
                            setCurrentSessionId(message.session_id);
                            setRiskScore({
                                level: message.risk_level,
                                percent: message.cracked_percent,
                                totalHashes: message.total_hashes,
                                crackedCount: message.cracked_count,
                            });

                            // Add to sessions
                            const newSession = {
                                session_id: message.session_id,
                                dataset_name: message.dataset_name,
                                mode: message.mode,
                                started_at: new Date().toISOString(),
                                duration: message.duration,
                                risk_level: message.risk_level,
                                cracked_percent: message.cracked_percent,
                                total_hashes: message.total_hashes,
                                cracked_count: message.cracked_count,
                                status: 'completed',
                                notes: `Completed ${message.mode} analysis.`,
                            };

                            setSessions(prev => [newSession, ...prev]);

                            const riskText = message.risk_level === 'high' ? 'High Risk' :
                                message.risk_level === 'medium' ? 'Medium Risk' : 'Low Risk';
                            addToast(`Audit completed – ${riskText}`,
                                message.risk_level === 'high' ? 'error' :
                                    message.risk_level === 'medium' ? 'info' : 'success');
                            break;
                    }
                },
                controller.signal
            );
        } catch (error) {
            if (error.name === 'AbortError') {
                addConsoleLog('Audit cancelled by user', 'warning');
            } else {
                addConsoleLog(`Error: ${error.message}`, 'error');
                addToast(`Audit failed: ${error.message}`, 'error');
            }
        } finally {
            setIsAuditing(false);
            setAbortController(null);

            setDatasets(prev => prev.map(d =>
                d.id === datasetId ? { ...d, status: 'completed' } : d
            ));
        }
    }, [addConsoleLog, addToast, clearConsole]);

    const stopAudit = useCallback(async () => {
        if (abortController) {
            abortController.abort();
        }

        if (currentSessionId) {
            try {
                await api.stopAudit(currentSessionId);
            } catch (error) {
                console.error('Failed to stop audit on server:', error);
            }
        }

        setIsAuditing(false);
        addToast('Audit stopped', 'info');
    }, [abortController, currentSessionId, addToast]);

    const deleteSession = useCallback(async (sessionId) => {
        try {
            await api.deleteSession(sessionId);
        } catch (error) {
            console.error('Failed to delete session on server:', error);
        }

        setSessions(prev => prev.filter(s => s.session_id !== sessionId));
        addToast('Session deleted', 'info');
    }, [addToast]);

    const value = {
        datasets,
        selectedDataset,
        setSelectedDataset,
        uploadDataset,
        deleteDataset,
        fetchDatasets,
        isAuditing,
        startAudit,
        stopAudit,
        currentSessionId,
        consoleLogs,
        addConsoleLog,
        clearConsole,
        riskScore,
        setRiskScore,
        sessions,
        fetchSessions,
        deleteSession,
        toasts,
        addToast,
        removeToast,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}

export default AppContext;
