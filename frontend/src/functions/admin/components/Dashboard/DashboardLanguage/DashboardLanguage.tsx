import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Language } from '../../../../../api/dashboardApi';
import { postLanguage, patchLanguage } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardLanguage.scss';

interface Props {
    languages: Language[];
}

interface LanguageForm {
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

const emptyForm: LanguageForm = { slug: '', label: '', level: '' };

export default function DashboardLanguage({ languages }: Props) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [editForm, setEditForm] = useState<LanguageForm>(emptyForm);
    const [addForm, setAddForm] = useState<LanguageForm>(emptyForm);
    const [errorMessage, setErrorMessage] = useState('');

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });

    const startEdit = (lang: Language) => {
        setEditingId(lang.id);
        setEditForm({ slug: lang.slug, label: lang.label, level: lang.level ?? '' });
        setErrorMessage('');
    };

    const handleEdit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (editingId === null) return;
        setErrorMessage('');
        try {
            await patchLanguage(editingId, editForm);
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
            await postLanguage(addForm);
            await invalidate();
            setAddForm(emptyForm);
            setIsAdding(false);
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    return (
        <section className="dashboard-section dashboard-language">
            <h2>Langues</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Langue</span>
                    <span>Niveau</span>
                    <span />
                </div>
                {languages.map(lang => (
                    <div key={lang.id} className={`items-list__row${editingId === lang.id ? ' items-list__row--editing' : ''}`}>
                        {editingId === lang.id ? (
                            <form onSubmit={handleEdit} className="row-edit-form">
                                <div className="form-row">
                                    <label>Slug
                                        <input value={editForm.slug} onChange={e => setEditForm(p => ({ ...p, slug: e.target.value }))} required />
                                    </label>
                                    <label>Langue
                                        <input value={editForm.label} onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))} required />
                                    </label>
                                    <label>Niveau
                                        <select value={editForm.level} onChange={e => setEditForm(p => ({ ...p, level: e.target.value }))}>
                                            <option value="">—</option>
                                            {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
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
                                <span>{lang.label}</span>
                                <span className="muted">{lang.level || '—'}</span>
                                <EditButton onClick={() => startEdit(lang)} />
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
                        <label>Langue
                            <input value={addForm.label} onChange={e => setAddForm(p => ({ ...p, label: e.target.value }))} required />
                        </label>
                        <label>Niveau
                            <select value={addForm.level} onChange={e => setAddForm(p => ({ ...p, level: e.target.value }))}>
                                <option value="">—</option>
                                {LANGUAGE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </label>
                    </div>
                    {errorMessage && <p className="dash-error">{errorMessage}</p>}
                    <div className="form-actions">
                        <button type="submit">Ajouter</button>
                        <button type="button" onClick={() => { setIsAdding(false); setAddForm(emptyForm); }}>Annuler</button>
                    </div>
                </form>
            ) : (
                <AddButton label="Ajouter une langue" onClick={() => { setIsAdding(true); setErrorMessage(''); }} />
            )}
        </section>
    );
}
