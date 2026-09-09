import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postLanguage, patchLanguage } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import { useAsideData } from '../../../../cv/hooks/useAsideData';

interface Props {
    mode: 'add' | 'edit';
    itemId?: number;
    onClose: () => void;
    onPreviewChange?: (data: unknown) => void;
}

interface FormData {
    slug: string;
    label: string;
    level: string;
}

const LANGUAGE_LEVELS = [
    "Élémentaire A1", "Élémentaire A2",
    "Professionnel B1", "Professionnel B2",
    "Bilingue C1", "Bilingue C2",
    "Langue maternelle",
];

const emptyForm: FormData = { slug: '', label: '', level: '' };

export default function LanguageForm({ mode, itemId, onClose, onPreviewChange }: Props) {
    const queryClient = useQueryClient();
    const { data: aside } = useAsideData();
    const existing = mode === 'edit' ? aside?.language.find(l => l.id === itemId) : undefined;

    const [form, setForm] = useState<FormData>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (existing) setForm({ slug: existing.slug, label: existing.label, level: existing.level ?? '' });
    }, [existing]);

    useEffect(() => {
        if (mode === 'edit' && !existing) return;
        onPreviewChange?.({ id: existing?.id ?? -1, slug: form.slug, label: form.label, level: form.level || null });
    }, [mode, existing, form, onPreviewChange]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            if (mode === 'edit' && itemId !== undefined) {
                await patchLanguage(itemId, form);
            } else {
                await postLanguage(form);
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
                <label>Langue
                    <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} required />
                </label>
            </div>
            <label>Niveau
                <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                    <option value="">—</option>
                    {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </label>
            {errorMessage && <p className="dash-error">{errorMessage}</p>}
            <div className="form-actions">
                <button type="submit">{mode === 'edit' ? 'Sauvegarder' : 'Ajouter'}</button>
                <button type="button" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
}
