import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postProfile, patchProfile } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import { useFiltersData } from '../../../../cv/hooks/useFiltersData';
import { useToast } from '../../../context/ToastContext';

interface Props {
    mode: 'add' | 'edit';
    itemId?: number;
    onClose: () => void;
    onPreviewChange?: (data: unknown) => void;
}

interface FormData {
    context: string;
    tagline: string;
    description: string;
}

const emptyForm: FormData = { context: '', tagline: '', description: '' };

export default function ProfileForm({ mode, itemId, onClose, onPreviewChange }: Props) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { data: filtersData } = useFiltersData();
    const existing = mode === 'edit' ? filtersData?.profile.find(p => p.id === itemId) : undefined;

    const [form, setForm] = useState<FormData>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (existing) setForm({
            context: existing.context,
            tagline: existing.tagline ?? '',
            description: existing.description ?? '',
        });
    }, [existing]);

    useEffect(() => {
        if (mode === 'edit' && !existing) return;
        onPreviewChange?.({
            id: existing?.id ?? -1,
            context: form.context,
            tagline: form.tagline,
            description: form.description,
        });
    }, [mode, existing, form, onPreviewChange]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            if (mode === 'edit' && itemId !== undefined) {
                await patchProfile(itemId, form);
            } else {
                await postProfile(form);
            }
            await queryClient.invalidateQueries({ queryKey: ['filters'] });
            await queryClient.invalidateQueries({ queryKey: ['profile'] });
            showToast(mode === 'edit' ? 'Profil mis à jour' : 'Profil ajouté');
            onClose();
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    if (mode === 'edit' && !existing) return <p>Chargement…</p>;

    return (
        <form className="card-form" onSubmit={handleSubmit}>
            <label>Contexte
                <input value={form.context} onChange={e => setForm(p => ({ ...p, context: e.target.value }))} required />
            </label>
            <label>Accroche
                <input value={form.tagline} onChange={e => setForm(p => ({ ...p, tagline: e.target.value }))} />
            </label>
            <label>Description
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </label>
            {errorMessage && <p className="dash-error">{errorMessage}</p>}
            <div className="form-actions">
                <button type="submit">{mode === 'edit' ? 'Sauvegarder' : 'Ajouter'}</button>
                <button type="button" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
}
