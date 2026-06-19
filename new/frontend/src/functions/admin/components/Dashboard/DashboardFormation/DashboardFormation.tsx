import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Formation, Hardskill, Domain, FormationInput } from '../../../../../api/dashboardApi';
import { postFormation, patchFormation } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardFormation.scss';

interface Props {
    formations: Formation[];
    hardskills: Hardskill[];
    domains: Domain[];
}

interface FormFormData {
    slug: string;
    title: string;
    institution: string;
    location: string;
    obtention_date: string;
    description: string;
    level: string;
}

const emptyFormData: FormFormData = {
    slug: '', title: '', institution: '',
    location: '', obtention_date: '', description: '', level: '',
};

const toInput = (f: FormFormData): FormationInput => ({
    slug: f.slug,
    title: f.title,
    ...(f.institution && { institution: f.institution }),
    ...(f.location && { location: f.location }),
    ...(f.obtention_date && { obtention_date: f.obtention_date }),
    ...(f.description && { description: f.description }),
    ...(f.level && { level: f.level }),
});

const toggleId = (ids: number[], id: number): number[] =>
    ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];

export default function DashboardFormation({ formations, hardskills, domains }: Props) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<FormFormData>(emptyFormData);
    const [formTasks, setFormTasks] = useState<string[]>([]);
    const [formHardskillIds, setFormHardskillIds] = useState<number[]>([]);
    const [formDomainIds, setFormDomainIds] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });

    const startEdit = (form: Formation) => {
        setFormData({
            slug: form.slug,
            title: form.title,
            institution: form.institution ?? '',
            location: form.location ?? '',
            obtention_date: form.obtention_date ?? '',
            description: form.description ?? '',
            level: form.level ?? '',
        });
        setFormTasks(form.tasks.slice().sort((a, b) => a.position - b.position).map(t => t.content));
        setFormHardskillIds(
            form.hardskills
                .map(ref => hardskills.find(h => h.slug === ref.slug)?.id)
                .filter((id): id is number => id !== undefined)
        );
        setFormDomainIds(form.domains.map(d => d.id));
        setErrorMessage('');
        setEditingId(form.id);
        setIsAdding(false);
    };

    const startAdd = () => {
        setFormData(emptyFormData);
        setFormTasks([]);
        setFormHardskillIds([]);
        setFormDomainIds([]);
        setErrorMessage('');
        setEditingId(null);
        setIsAdding(true);
    };

    const cancelForm = () => {
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        if (editingId === null) return;
        setErrorMessage('');
        try {
            await patchFormation(editingId, {
                formationData: toInput(formData),
                domainData: formDomainIds,
                hardskillData: formHardskillIds,
                taskData: formTasks,
            });
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
            await postFormation({
                data: toInput(formData),
                domain: formDomainIds,
                tasks: formTasks,
                hardskill: formHardskillIds,
            });
            await invalidate();
            cancelForm();
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    const isFormOpen = editingId !== null || isAdding;

    return (
        <section className="dashboard-section dashboard-formation">
            <h2>Formations et diplômes</h2>

            {formations.map(form => (
                <div key={form.id} className={`item-card${editingId === form.id ? ' item-card--editing' : ''}`}>
                    <div className="item-card__header">
                        <div>
                            <div className="item-card__title">{form.title}</div>
                            <div className="item-card__subtitle">
                                {[form.institution, form.location].filter(Boolean).join(' · ')}
                                {form.obtention_date && ` · ${form.obtention_date}`}
                            </div>
                        </div>
                        <div className="item-card__actions">
                            {form.level && <span className="item-card__badge">{form.level}</span>}
                            {!isFormOpen && <EditButton onClick={() => startEdit(form)} />}
                        </div>
                    </div>
                    {form.description && (
                        <div className="item-card__description">{form.description}</div>
                    )}
                    {form.tasks.length > 0 && (
                        <ul className="item-card__tasks">
                            {form.tasks.slice().sort((a, b) => a.position - b.position).map((t, i) => (
                                <li key={i}>{t.content}</li>
                            ))}
                        </ul>
                    )}
                    {editingId === form.id && (
                        <div className="item-card__editing-label">✎ en cours d'édition</div>
                    )}
                </div>
            ))}

            {isFormOpen && (
                <form className="rich-form" onSubmit={editingId !== null ? handleEdit : handleAdd}>
                    <p className="rich-form__heading">
                        {editingId !== null ? 'Modifier la formation' : 'Nouvelle formation'}
                    </p>
                    <div className="form-grid">
                        <label>Slug
                            <input value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} required />
                        </label>
                        <label>Niveau
                            <input value={formData.level} onChange={e => setFormData(p => ({ ...p, level: e.target.value }))} />
                        </label>
                    </div>
                    <div className="form-full">
                        <label>Titre
                            <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required />
                        </label>
                    </div>
                    <div className="form-grid">
                        <label>Établissement
                            <input value={formData.institution} onChange={e => setFormData(p => ({ ...p, institution: e.target.value }))} />
                        </label>
                        <label>Lieu
                            <input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
                        </label>
                    </div>
                    <div className="form-full">
                        <label>Date d'obtention
                            <input value={formData.obtention_date} onChange={e => setFormData(p => ({ ...p, obtention_date: e.target.value }))} />
                        </label>
                    </div>
                    <div className="form-full">
                        <label>Description
                            <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
                        </label>
                    </div>

                    <fieldset>
                        <legend>Tâches</legend>
                        {formTasks.map((task, i) => (
                            <div key={i} className="task-row">
                                <input
                                    value={task}
                                    onChange={e => setFormTasks(p => p.map((t, j) => j === i ? e.target.value : t))}
                                />
                                <button type="button" onClick={() => setFormTasks(p => p.filter((_, j) => j !== i))}>Supprimer</button>
                            </div>
                        ))}
                        <button type="button" className="task-add-btn" onClick={() => setFormTasks(p => [...p, ''])}>+ Ajouter une tâche</button>
                    </fieldset>

                    <fieldset>
                        <legend>Domaines</legend>
                        {domains.map(d => (
                            <label key={d.id}>
                                <input type="checkbox" checked={formDomainIds.includes(d.id)} onChange={() => setFormDomainIds(p => toggleId(p, d.id))} />
                                {d.label}
                            </label>
                        ))}
                    </fieldset>

                    <fieldset>
                        <legend>Hard skills</legend>
                        {hardskills.map(s => (
                            <label key={s.id}>
                                <input type="checkbox" checked={formHardskillIds.includes(s.id)} onChange={() => setFormHardskillIds(p => toggleId(p, s.id))} />
                                {s.label}
                            </label>
                        ))}
                    </fieldset>

                    {errorMessage && <p className="dash-error">{errorMessage}</p>}
                    <div className="form-actions">
                        <button type="submit">{editingId !== null ? 'Sauvegarder' : 'Ajouter'}</button>
                        <button type="button" onClick={cancelForm}>Annuler</button>
                    </div>
                </form>
            )}

            {!isFormOpen && (
                <AddButton label="Ajouter une formation" onClick={startAdd} />
            )}
        </section>
    );
}
