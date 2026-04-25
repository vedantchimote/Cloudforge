import { useEffect } from 'react';
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'error' | 'warning' | 'info' | 'success';

interface ErrorToastProps {
    type?: ToastType;
    title: string;
    message: string;
    details?: string[];
    onClose: () => void;
    autoClose?: boolean;
    duration?: number;
}

export default function ErrorToast({
    type = 'error',
    title,
    message,
    details,
    onClose,
    autoClose = true,
    duration = 5000,
}: ErrorToastProps) {
    useEffect(() => {
        if (autoClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'error':
                return <AlertCircle className="text-red-500" size={24} />;
            case 'warning':
                return <AlertTriangle className="text-yellow-500" size={24} />;
            case 'info':
                return <Info className="text-blue-500" size={24} />;
            case 'success':
                return <AlertCircle className="text-green-500" size={24} />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'error':
                return 'border-red-500';
            case 'warning':
                return 'border-yellow-500';
            case 'info':
                return 'border-blue-500';
            case 'success':
                return 'border-green-500';
        }
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 max-w-md bg-white rounded-lg shadow-lg border-l-4 ${getBorderColor()} p-4 animate-slide-in`}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">{getIcon()}</div>
                
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">{message}</p>
                    
                    {details && details.length > 0 && (
                        <ul className="mt-2 space-y-1">
                            {details.map((detail, index) => (
                                <li key={index} className="text-xs text-gray-500 flex items-start gap-1">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>{detail}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
