import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Profile } from '../../../../../api/dashboardApi';
import { postProfile, patchProfile } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardProfile.scss';

interface Props {
    profiles: Profile[];
}

interface ProfileForm {
    context: string;
    tagline: string;
    description: string;
}

const emptyForm: ProfileForm = { context: '', tagline: '', description: '' };

export default function DashboardProfile({ profiles }: Props) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<ProfileForm>(emptyForm);
    const [addForm, setAddForm] = useState<ProfileForm>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });

    const startEdit = (profile: Profile) => {
        setEditForm({
            context: profile.context,
            tagline: profile.tagline ?? '',
            description: profile.description ?? '',
        });
        setErrorMessage('');
        setEditingId(profile.id);
        setIsAdding(false);
    };

    const cancelEdit = () => setEditingId(null);

    const handleEdit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (editingId === null) return;
        setErrorMessage('');
        try {
            await patchProfile(editingId, editForm);
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
            await postProfile(addForm);
            await invalidate();
            setAddForm(emptyForm);
            setIsAdding(false);
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    return (
        <section className="dashboard-section dashboard-profile">
            <h2>Profils</h2>

            {profiles.map(profile => (
                <div key={profile.id} className={`item-card${editingId === profile.id ? ' item-card--editing' : ''}`}>
                    {editingId === profile.id ? (
                        <form className="card-form" onSubmit={handleEdit}>
                            <label>Contexte
                                <input value={editForm.context} onChange={e => setEditForm(p => ({ ...p, context: e.target.value }))} required />
                            </label>
                            <label>Accroche
                                <input value={editForm.tagline} onChange={e => setEditForm(p => ({ ...p, tagline: e.target.value }))} />
                            </label>
                            <label>Description
                                <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} />
                            </label>
                            {errorMessage && <p className="dash-error">{errorMessage}</p>}
                            <div className="form-actions">
                                <button type="submit">Sauvegarder</button>
                                <button type="button" onClick={cancelEdit}>Annuler</button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="item-card__header">
                                <strong className="item-card__title">{profile.context}</strong>
                                <EditButton onClick={() => startEdit(profile)} />
                            </div>
                            {profile.tagline && <div className="item-card__subtitle">{profile.tagline}</div>}
                            {profile.description && <div className="item-card__description">{profile.description}</div>}
                        </>
                    )}
                </div>
            ))}

            {isAdding ? (
                <form className="add-form" onSubmit={handleAdd}>
                    <label>Contexte
                        <input value={addForm.context} onChange={e => setAddForm(p => ({ ...p, context: e.target.value }))} required />
                    </label>
                    <label>Accroche
                        <input value={addForm.tagline} onChange={e => setAddForm(p => ({ ...p, tagline: e.target.value }))} />
                    </label>
                    <label>Description
                        <textarea value={addForm.description} onChange={e => setAddForm(p => ({ ...p, description: e.target.value }))} />
                    </label>
                    {errorMessage && <p className="dash-error">{errorMessage}</p>}
                    <div className="form-actions">
                        <button type="submit">Ajouter</button>
                        <button type="button" onClick={() => setIsAdding(false)}>Annuler</button>
                    </div>
                </form>
            ) : (
                <AddButton label="Ajouter un profil" onClick={() => { setIsAdding(true); setEditingId(null); }} />
            )}
        </section>
    );
}
