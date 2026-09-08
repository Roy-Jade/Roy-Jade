import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postHobby, patchHobby } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import { useAsideData } from '../../../../cv/hooks/useAsideData';

interface Props {
    mode: 'add' | 'edit';
    itemId?: number;
    onClose: () => void;
}

interface FormData {
    slug: string;
    label: string;
    supplement: string;
}

const emptyForm: FormData = { slug: '', label: '', supplement: '' };

export default function HobbyForm({ mode, itemId, onClose }: Props) {
    const queryClient = useQueryClient();
    const { data: aside } = useAsideData();
    const existing = mode === 'edit' ? aside?.hobby.find(h => h.id === itemId) : undefined;

    const [form, setForm] = useState<FormData>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (existing) setForm({ slug: existing.slug, label: existing.label, supplement: existing.supplement ?? '' });
    }, [existing]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            if (mode === 'edit' && itemId !== undefined) {
                await patchHobby(itemId, form);
            } else {
                await postHobby(form);
            }
            await queryClient.invalidateQueries({ queryKey: ['aside'] });
            onClose();
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    if (mode === 'edit' && !existing) return <p>Chargement…</p>;

    return (
        <form className="rich-form" onSubmit={handleSubmit}>
            <div className="form-grid">
                <label>Slug
                    <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required />
                </label>
                <label>Loisir
                    <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} required />
                </label>
            </div>
            <label>Complément
                <input value={form.supplement} onChange={e => setForm(p => ({ ...p, supplement: e.target.value }))} />
            </label>
            {errorMessage && <p className="dash-error">{errorMessage}</p>}
            <div className="form-actions">
                <button type="submit">{mode === 'edit' ? 'Sauvegarder' : 'Ajouter'}</button>
                <button type="button" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
}
