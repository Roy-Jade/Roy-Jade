import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Hobby } from '../../../../../api/dashboardApi';
import { postHobby, patchHobby } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardHobby.scss';

interface Props {
    hobbies: Hobby[];
}

interface HobbyForm {
    slug: string;
    label: string;
    supplement: string;
}

const emptyForm: HobbyForm = { slug: '', label: '', supplement: '' };

export default function DashboardHobby({ hobbies }: Props) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<HobbyForm>(emptyForm);
    const [addForm, setAddForm] = useState<HobbyForm>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });

    const startEdit = (hobby: Hobby) => {
        setEditingId(hobby.id);
        setEditForm({ slug: hobby.slug, label: hobby.label, supplement: hobby.supplement ?? '' });
        setErrorMessage('');
    };

    const handleEdit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (editingId === null) return;
        setErrorMessage('');
        try {
            await patchHobby(editingId, editForm);
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
            await postHobby(addForm);
            await invalidate();
            setAddForm(emptyForm);
            setIsAdding(false);
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    return (
        <section className="dashboard-section dashboard-hobby">
            <h2>Centres d'intérêts</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Loisir</span>
                    <span>Complément</span>
                    <span />
                </div>
                {hobbies.map(hobby => (
                    <div key={hobby.id} className={`items-list__row${editingId === hobby.id ? ' items-list__row--editing' : ''}`}>
                        {editingId === hobby.id ? (
                            <form onSubmit={handleEdit} className="row-edit-form">
                                <div className="form-row">
                                    <label>Slug
                                        <input value={editForm.slug} onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))} required />
                                    </label>
                                    <label>Loisir
                                        <input value={editForm.label} onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))} required />
                                    </label>
                                    <label>Complément
                                        <input value={editForm.supplement} onChange={e => setEditForm(p => ({ ...p, supplement: e.target.value }))} />
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
                                <span>{hobby.label}</span>
                                <span className="muted">{hobby.supplement || '—'}</span>
                                <EditButton onClick={() => startEdit(hobby)} />
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
                        <label>Loisir
                            <input value={addForm.label} onChange={e => setAddForm(p => ({ ...p, label: e.target.value }))} required />
                        </label>
                        <label>Complément
                            <input value={addForm.supplement} onChange={e => setAddForm(p => ({ ...p, supplement: e.target.value }))} />
                        </label>
                    </div>
                    {errorMessage && <p className="dash-error">{errorMessage}</p>}
                    <div className="form-actions">
                        <button type="submit">Ajouter</button>
                        <button type="button" onClick={() => { setIsAdding(false); setAddForm(emptyForm); }}>Annuler</button>
                    </div>
                </form>
            ) : (
                <AddButton label="Ajouter un centre d'intérêt" onClick={() => { setIsAdding(true); setErrorMessage(''); }} />
            )}
        </section>
    );
}
