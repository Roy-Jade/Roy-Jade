import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Domain } from '../../../../../api/dashboardApi';
import { postDomain, patchDomain } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardDomain.scss';

interface Props {
    domains: Domain[];
}

interface DomainForm {
    slug: string;
    label: string;
}

const emptyForm: DomainForm = { slug: '', label: '' };

export default function DashboardDomain({ domains }: Props) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<DomainForm>(emptyForm);
    const [addForm, setAddForm] = useState<DomainForm>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });

    const startEdit = (domain: Domain) => {
        setEditForm({ slug: domain.slug, label: domain.label });
        setErrorMessage('');
        setEditingId(domain.id);
        setIsAdding(false);
    };

    const cancelEdit = () => setEditingId(null);

    const handleEdit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (editingId === null) return;
        setErrorMessage('');
        try {
            await patchDomain(editingId, editForm);
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
            await postDomain(addForm);
            await invalidate();
            setAddForm(emptyForm);
            setIsAdding(false);
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    return (
        <section className="dashboard-section dashboard-domain">
            <h2>Domaines</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Domaine</span>
                    <span>Slug</span>
                    <span />
                </div>
                {domains.map(domain => (
                    <div key={domain.id} className={`items-list__row${editingId === domain.id ? ' items-list__row--editing' : ''}`}>
                        {editingId === domain.id ? (
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
                                    <button type="button" onClick={cancelEdit}>Annuler</button>
                                </div>
                            </form>
                        ) : (
                            <div className="items-list__row-data">
                                <span>{domain.label}</span>
                                <span className="muted">{domain.slug}</span>
                                <EditButton onClick={() => startEdit(domain)} />
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
                        <button type="button" onClick={() => setIsAdding(false)}>Annuler</button>
                    </div>
                </form>
            ) : (
                <AddButton label="Ajouter un domaine" onClick={() => { setIsAdding(true); setEditingId(null); }} />
            )}
        </section>
    );
}
