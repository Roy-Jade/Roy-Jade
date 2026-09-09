import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface ToastMessage {
    id: number;
    text: string;
    variant: 'success' | 'error';
}

interface ToastContextValue {
    toasts: ToastMessage[];
    showToast: (text: string, variant?: ToastMessage['variant']) => void;
    dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const dismissToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((text: string, variant: ToastMessage['variant'] = 'success') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, text, variant }]);
        setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    }, [dismissToast]);

    const value = useMemo(() => ({ toasts, showToast, dismissToast }), [toasts, showToast, dismissToast]);

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast doit être utilisé dans un ToastProvider');
    return ctx;
}
