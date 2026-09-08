import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postDomain, patchDomain } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import { useFiltersData } from '../../../../cv/hooks/useFiltersData';

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

export default function DomainForm({ mode, itemId, onClose }: Props) {
    const queryClient = useQueryClient();
    const { data: filtersData } = useFiltersData();
    const existing = mode === 'edit' ? filtersData?.domain.find(d => d.id === itemId) : undefined;

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
                await patchDomain(itemId, form);
            } else {
                await postDomain(form);
            }
            await queryClient.invalidateQueries({ queryKey: ['filters'] });
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
