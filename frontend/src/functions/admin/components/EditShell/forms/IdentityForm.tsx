import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { patchIdentity } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import { useIdentityData } from '../../../../cv/hooks/useIdentityData';
import { useToast } from '../../../context/ToastContext';

interface Props {
    onClose: () => void;
}

interface FormData {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    github_link: string;
    gitlab_link: string;
    linkedin_link: string;
}

const emptyForm: FormData = {
    firstname: '', lastname: '', email: '', telephone: '',
    github_link: '', gitlab_link: '', linkedin_link: '',
};

export default function IdentityForm({ onClose }: Props) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { data: identity } = useIdentityData();

    const [form, setForm] = useState<FormData>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (identity) setForm({
            firstname: identity.firstname,
            lastname: identity.lastname,
            email: identity.email ?? '',
            telephone: identity.telephone ?? '',
            github_link: identity.github_link ?? '',
            gitlab_link: identity.gitlab_link ?? '',
            linkedin_link: identity.linkedin_link ?? '',
        });
    }, [identity]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            await patchIdentity(form);
            await queryClient.invalidateQueries({ queryKey: ['identity'] });
            showToast('Identité mise à jour');
            onClose();
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    if (!identity) return <p>Chargement…</p>;

    return (
        <form className="card-form" onSubmit={handleSubmit}>
            <div className="form-grid-2">
                <label>Prénom
                    <input value={form.firstname} onChange={e => setForm(p => ({ ...p, firstname: e.target.value }))} required />
                </label>
                <label>Nom
                    <input value={form.lastname} onChange={e => setForm(p => ({ ...p, lastname: e.target.value }))} required />
                </label>
            </div>
            <div className="form-grid-2">
                <label>Email
                    <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </label>
                <label>Téléphone
                    <input value={form.telephone} onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))} />
                </label>
            </div>
            <label>GitHub
                <input value={form.github_link} onChange={e => setForm(p => ({ ...p, github_link: e.target.value }))} />
            </label>
            <label>GitLab
                <input value={form.gitlab_link} onChange={e => setForm(p => ({ ...p, gitlab_link: e.target.value }))} />
            </label>
            <label>LinkedIn
                <input value={form.linkedin_link} onChange={e => setForm(p => ({ ...p, linkedin_link: e.target.value }))} />
            </label>
            {errorMessage && <p className="dash-error">{errorMessage}</p>}
            <div className="form-actions">
                <button type="submit">Sauvegarder</button>
                <button type="button" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
}
