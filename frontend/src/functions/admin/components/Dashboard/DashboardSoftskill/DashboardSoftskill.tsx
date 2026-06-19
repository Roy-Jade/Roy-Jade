import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Softskill } from '../../../../../api/dashboardApi';
import { postSoftskill, patchSoftskill } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardSoftskill.scss';

interface Props {
    softskills: Softskill[];
}

interface SoftskillForm {
    slug: string;
    label: string;
}

const emptyForm: SoftskillForm = { slug: '', label: '' };

export default function DashboardSoftskill({ softskills }: Props) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<SoftskillForm>(emptyForm);
    const [addForm, setAddForm] = useState<SoftskillForm>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });

    const startEdit = (skill: Softskill) => {
        setEditingId(skill.id);
        setEditForm({ slug: skill.slug, label: skill.label });
        setErrorMessage('');
    };

    const handleEdit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (editingId === null) return;
        setErrorMessage('');
        try {
            await patchSoftskill(editingId, editForm);
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
            await postSoftskill(addForm);
            await invalidate();
            setAddForm(emptyForm);
            setIsAdding(false);
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    return (
        <section className="dashboard-section dashboard-softskill">
            <h2>Soft skills</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Soft skill</span>
                    <span />
                </div>
                {softskills.map(skill => (
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
                    </div>
                    {errorMessage && <p className="dash-error">{errorMessage}</p>}
                    <div className="form-actions">
                        <button type="submit">Ajouter</button>
                        <button type="button" onClick={() => { setIsAdding(false); setAddForm(emptyForm); }}>Annuler</button>
                    </div>
                </form>
            ) : (
                <AddButton label="Ajouter un soft skill" onClick={() => { setIsAdding(true); setErrorMessage(''); }} />
            )}
        </section>
    );
}
