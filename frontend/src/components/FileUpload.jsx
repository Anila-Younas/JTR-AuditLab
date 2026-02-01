import { useState, useRef, useCallback } from 'react';
import { Upload, File, Trash2, Check, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const statusConfig = {
    pending: { label: 'Pending', color: 'text-slate-400', bg: 'bg-slate-400/20' },
    queued: { label: 'In Queue', color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
    auditing: { label: 'Auditing', color: 'text-cyber-cyan', bg: 'bg-cyber-cyan/20' },
    completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-400/20' },
    failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-400/20' },
    stopped: { label: 'Stopped', color: 'text-orange-400', bg: 'bg-orange-400/20' },
};

export default function FileUpload() {
    const { datasets, selectedDataset, setSelectedDataset, uploadDataset, deleteDataset, isAuditing } = useApp();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleUpload(files[0]);
        }
    }, []);

    const handleFileSelect = useCallback(async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            await handleUpload(files[0]);
        }
        // Reset input
        e.target.value = '';
    }, []);

    const handleUpload = async (file) => {
        setIsUploading(true);
        try {
            const dataset = await uploadDataset(file);
            if (dataset && !selectedDataset) {
                setSelectedDataset(dataset);
            }
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`upload-zone ${isDragging ? 'drag-over' : ''} ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".txt,.hash,.hashes,.passwd,.shadow"
                    className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                    {isUploading ? (
                        <Loader2 className="w-10 h-10 text-cyber-cyan animate-spin" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-cyber-cyan/10 flex items-center justify-center">
                            <Upload className="w-7 h-7 text-cyber-cyan" />
                        </div>
                    )}

                    <div className="text-center">
                        <p className="text-sm font-medium text-white">
                            {isUploading ? 'Uploading...' : 'Upload Password Hash Dataset'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Drag & drop or click to browse
                        </p>
                        <p className="text-xs text-cyber-magenta mt-2 font-medium">
                            Lab Use Only
                        </p>
                    </div>
                </div>
            </div>

            {/* Dataset List */}
            {datasets.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                        <File className="w-4 h-4" />
                        Uploaded Datasets ({datasets.length})
                    </h4>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {datasets.map((dataset) => {
                            const isSelected = selectedDataset?.id === dataset.id;
                            const status = statusConfig[dataset.status] || statusConfig.pending;

                            return (
                                <div
                                    key={dataset.id}
                                    onClick={() => !isAuditing && setSelectedDataset(dataset)}
                                    className={`
                    group p-3 rounded-lg border transition-all duration-200 cursor-pointer
                    ${isSelected
                                            ? 'bg-cyber-cyan/10 border-cyber-cyan/40'
                                            : 'bg-cyber-dark/50 border-cyber-cyan/10 hover:border-cyber-cyan/30'
                                        }
                    ${isAuditing ? 'cursor-not-allowed opacity-70' : ''}
                  `}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-cyber-cyan flex-shrink-0" />
                                                )}
                                                <p className="text-sm font-medium text-white truncate">
                                                    {dataset.name}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                                                <span>{formatFileSize(dataset.size)}</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(dataset.uploaded_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color} ${status.bg}`}>
                                                {status.label}
                                            </span>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isAuditing) deleteDataset(dataset.id);
                                                }}
                                                disabled={isAuditing}
                                                className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {dataset.hash_count && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            ~{dataset.hash_count} hashes detected
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {datasets.length === 0 && !isUploading && (
                <div className="text-center py-4">
                    <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">No datasets uploaded yet</p>
                </div>
            )}
        </div>
    );
}
