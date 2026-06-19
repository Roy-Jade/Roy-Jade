import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Hardskill } from '../../../../../api/dashboardApi';
import { postHardskill, patchHardskill } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardHardskill.scss';

interface Props {
    hardskills: Hardskill[];
}

interface HardskillForm {
    slug: string;
    label: string;
    level: string;
    category: string;
    sub_category: string;
}

const HARDSKILL_LEVELS = ["notions", "courant", "maîtrise"];

const emptyForm: HardskillForm = { slug: '', label: '', level: '', category: '', sub_category: '' };

const toForm = (skill: Hardskill): HardskillForm => ({
    slug: skill.slug,
    label: skill.label,
    level: skill.level ?? '',
    category: skill.category ?? '',
    sub_category: skill.sub_category ?? '',
});

const categoryDisplay = (skill: Hardskill): string => {
    if (!skill.category) return '—';
    return skill.sub_category ? `${skill.category} / ${skill.sub_category}` : skill.category;
};

export default function DashboardHardskill({ hardskills }: Props) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<HardskillForm>(emptyForm);
    const [addForm, setAddForm] = useState<HardskillForm>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });

    const startEdit = (skill: Hardskill) => {
        setEditingId(skill.id);
        setEditForm(toForm(skill));
        setErrorMessage('');
    };

    const handleEdit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (editingId === null) return;
        setErrorMessage('');
        try {
            await patchHardskill(editingId, editForm);
            await invalidate();
            setEditingId(null);
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    const handleAdd = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            await postHardskill(addForm);
            await invalidate();
            setAddForm(emptyForm);
            setIsAdding(false);
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    return (
        <section className="dashboard-section dashboard-hardskill">
            <h2>Hard skills</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Hard skill</span>
                    <span>Catégorie</span>
                    <span>Niveau</span>
                    <span />
                </div>
                {hardskills.map(skill => (
                    <div key={skill.id} className={`items-list__row${editingId === skill.id ? ' items-list__row--editing' : ''}`}>
                        {editingId === skill.id ? (
                            <form onSubmit={handleEdit} className="row-edit-form">
                                <div className="form-row">
                                    <label>Slug
                                        <input value={editForm.slug} onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))} required />
                                    </label>
                                    <label>Libellé
                                        <input value={editForm.label} onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))} required />
                                    </label>
                                    <label>Niveau
                                        <select value={editForm.level} onChange={e => setEditForm(p => ({ ...p, level: e.target.value }))}>
                                            <option value="">—</option>
                                            {HARDSKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </label>
                                </div>
                                <div className="form-row">
                                    <label>Catégorie
                                        <input value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} />
                                    </label>
                                    <label>Sous-catégorie
                                        <input value={editForm.sub_category} onChange={e => setEditForm(p => ({ ...p, sub_category: e.target.value }))} />
                                    </label>
                                </div>
                                {errorMessage && <p className="dash-error">{errorMessage}</p>}
                                <div className="form-actions">
                                    <button type="submit">Sauvegarder</button>
                                    <button type="button" onClick={() => setEditingId(null)}>Annuler</button>
                                </div>
                            </form>
                        ) : (
                            <div className="items-list__row-data">
                                <span>{skill.label}</span>
                                <span className="muted">{categoryDisplay(skill)}</span>
                                <span className="muted">{skill.level || '—'}</span>
                                <EditButton onClick={() => startEdit(skill)} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {isAdding ? (
                <form className="add-form" onSubmit={handleAdd}>
                    <div className="form-row">
                        <label>Slug
                            <input value={addForm.slug} onChange={e => setAddForm(p => ({ ...p, slug: e.target.value }))} required />
                        </label>
                        <label>Libellé
                            <input value={addForm.label} onChange={e => setAddForm(p => ({ ...p, label: e.target.value }))} required />
                        </label>
                        <label>Niveau
                            <select value={addForm.level} onChange={e => setAddForm(p => ({ ...p, level: e.target.value }))}>
                                <option value="">—</option>
                                {HARDSKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </label>
                    </div>
                    <div className="form-row">
                        <label>Catégorie
                            <input value={addForm.category} onChange={e => setAddForm(p => ({ ...p, category: e.target.value }))} />
                        </label>
                        <label>Sous-catégorie
                            <input value={addForm.sub_category} onChange={e => setAddForm(p => ({ ...p, sub_category: e.target.value }))} />
                        </label>
                    </div>
                    {errorMessage && <p className="dash-error">{errorMessage}</p>}
                    <div className="form-actions">
                        <button type="submit">Ajouter</button>
                        <button type="button" onClick={() => { setIsAdding(false); setAddForm(emptyForm); }}>Annuler</button>
                    </div>
                </form>
            ) : (
                <AddButton label="Ajouter un hard skill" onClick={() => { setIsAdding(true); setErrorMessage(''); }} />
            )}
        </section>
    );
}
