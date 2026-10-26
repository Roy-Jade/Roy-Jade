import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login } from '../../../../api/authApi';
import { isApiError } from '../../../../api/privateApi';
import './Login.scss';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function Login({ isOpen, onClose }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const queryClient = useQueryClient();
    const [pseudonyme, setPseudonyme] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen && !dialog.open) dialog.showModal();
        else if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        dialog.addEventListener('close', onClose);
        return () => dialog.removeEventListener('close', onClose);
    }, [onClose]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            await login(pseudonyme, password);
            queryClient.invalidateQueries({ queryKey: ['authSession'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
            onClose();
        } catch (err) {
            if (isApiError(err)) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage('Erreur inattendue, veuillez réessayer.');
            }
        }
    };

    return (
        <dialog ref={dialogRef} className="login-dialog" aria-labelledby="login-dialog-title">
            <header className="login-dialog__header">
                <h2 id="login-dialog-title">Connexion</h2>
                <button type="button" className="login-dialog__close" aria-label="Fermer la fenêtre de connexion" onClick={onClose}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
            </header>
            <form className="login-dialog__form" onSubmit={handleSubmit}>
                <label>
                    Identifiant
                    <input
                        type="text"
                        value={pseudonyme}
                        onChange={e => setPseudonyme(e.target.value)}
                        autoFocus
                        required
                    />
                </label>
                <label>
                    Mot de passe
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                </label>
                {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
                <div className="form-actions">
                    <button type="submit">Se connecter</button>
                </div>
            </form>
        </dialog>
    );
}
