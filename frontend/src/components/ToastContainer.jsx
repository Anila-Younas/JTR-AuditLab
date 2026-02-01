import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ToastContainer() {
    const { toasts, removeToast } = useApp();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5" />;
            case 'error':
                return <AlertCircle className="w-5 h-5" />;
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    return (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast toast-${toast.type} backdrop-blur-lg`}
                >
                    {getIcon(toast.type)}
                    <span className="flex-1 text-sm">{toast.message}</span>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
