import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { login } from '../../../../api/authApi';
import { isApiError } from '../../../../api/privateApi';
// import './Login.scss';

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
        <dialog ref={dialogRef}>
            <button type="button" onClick={onClose}>×</button>
            <h2>Connexion</h2>
            <form onSubmit={handleSubmit}>
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
                {errorMessage && <p>{errorMessage}</p>}
                <button type="submit">Se connecter</button>
            </form>
        </dialog>
    );
}
