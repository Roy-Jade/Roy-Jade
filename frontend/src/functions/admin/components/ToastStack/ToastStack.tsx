import { useToast } from '../../context/ToastContext';
import './ToastStack.scss';

export default function ToastStack() {
    const { toasts, dismissToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-stack">
            {toasts.map(t => (
                <button
                    key={t.id}
                    type="button"
                    className={`toast toast--${t.variant}`}
                    role={t.variant === 'error' ? 'alert' : 'status'}
                    aria-live={t.variant === 'error' ? 'assertive' : 'polite'}
                    onClick={() => dismissToast(t.id)}
                >
                    {t.text}
                </button>
            ))}
        </div>
    );
}
