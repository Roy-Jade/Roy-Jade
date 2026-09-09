import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postHardskill, patchHardskill } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import { useHardskillData } from '../../../../cv/hooks/useHardskillData';
import { useFiltersData } from '../../../../cv/hooks/useFiltersData';
import { useToast } from '../../../context/ToastContext';

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
    category: string;
    sub_category: string;
}

const HARDSKILL_LEVELS = ["notions", "courant", "maîtrise"];
const emptyForm: FormData = { slug: '', label: '', level: '', category: '', sub_category: '' };

export default function HardskillForm({ mode, itemId, onClose, onPreviewChange }: Props) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { data: filtersData } = useFiltersData();
    // Niveau le plus bas + toutes les catégories : équivaut à "tous les hardskills",
    // indépendamment du filtre CV actuellement affiché (fetchHardskill filtre par
    // niveau minimum, pas par correspondance exacte).
    const { data: hardskills = [] } = useHardskillData(HARDSKILL_LEVELS[0], filtersData?.category ?? []);
    const existing = mode === 'edit' ? hardskills.find(s => s.id === itemId) : undefined;

    const [form, setForm] = useState<FormData>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (existing) setForm({
            slug: existing.slug,
            label: existing.label,
            level: existing.level ?? '',
            category: existing.category ?? '',
            sub_category: existing.sub_category ?? '',
        });
    }, [existing]);

    useEffect(() => {
        if (mode === 'edit' && !existing) return;
        onPreviewChange?.({
            id: existing?.id ?? -1,
            slug: form.slug,
            label: form.label,
            level: form.level,
            category: form.category,
            sub_category: form.sub_category || null,
        });
    }, [mode, existing, form, onPreviewChange]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            if (mode === 'edit' && itemId !== undefined) {
                await patchHardskill(itemId, form);
            } else {
                await postHardskill(form);
            }
            await queryClient.invalidateQueries({ queryKey: ['hardskill'] });
            showToast(mode === 'edit' ? 'Compétence mise à jour' : 'Compétence ajoutée');
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
            <div className="form-grid">
                <label>Niveau
                    <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                        <option value="">—</option>
                        {HARDSKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </label>
                <label>Catégorie
                    <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                </label>
            </div>
            <div className="form-grid">
                <label>Sous-catégorie
                    <input value={form.sub_category} onChange={e => setForm(p => ({ ...p, sub_category: e.target.value }))} />
                </label>
                <div />
            </div>
            {errorMessage && <p className="dash-error">{errorMessage}</p>}
            <div className="form-actions">
                <button type="submit">{mode === 'edit' ? 'Sauvegarder' : 'Ajouter'}</button>
                <button type="button" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
}
