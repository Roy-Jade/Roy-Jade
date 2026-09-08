import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postSoftskill, patchSoftskill } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import { useSoftskillData } from '../../../../cv/hooks/useSoftskillData';

interface Props {
    mode: 'add' | 'edit';
    itemId?: number;
    onClose: () => void;
}

interface FormData {
    slug: string;
    label: string;
}

const emptyForm: FormData = { slug: '', label: '' };

export default function SoftskillForm({ mode, itemId, onClose }: Props) {
    const queryClient = useQueryClient();
    const { data: softskills = [] } = useSoftskillData();
    const existing = mode === 'edit' ? softskills.find(s => s.id === itemId) : undefined;

    const [form, setForm] = useState<FormData>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (existing) setForm({ slug: existing.slug, label: existing.label });
    }, [existing]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            if (mode === 'edit' && itemId !== undefined) {
                await patchSoftskill(itemId, form);
            } else {
                await postSoftskill(form);
            }
            await queryClient.invalidateQueries({ queryKey: ['softskill'] });
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
                <label>Libellé
                    <input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} required />
                </label>
            </div>
            {errorMessage && <p className="dash-error">{errorMessage}</p>}
            <div className="form-actions">
                <button type="submit">{mode === 'edit' ? 'Sauvegarder' : 'Ajouter'}</button>
                <button type="button" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
}
