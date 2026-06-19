import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Experience, Hardskill, Softskill, Domain, ExperienceInput } from '../../../../../api/dashboardApi';
import { postExperience, patchExperience } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardExperience.scss';

interface Props {
    experiences: Experience[];
    hardskills: Hardskill[];
    softskills: Softskill[];
    domains: Domain[];
}

interface ExpFormData {
    slug: string;
    type: 'detail' | 'summary';
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    description: string;
}

const emptyFormData: ExpFormData = {
    slug: '', type: 'detail', title: '', company: '',
    location: '', start_date: '', end_date: '', description: '',
};

const toInput = (f: ExpFormData): ExperienceInput => ({
    slug: f.slug,
    type: f.type,
    title: f.title,
    ...(f.company && { company: f.company }),
    ...(f.location && { location: f.location }),
    ...(f.start_date && { start_date: f.start_date }),
    ...(f.end_date && { end_date: f.end_date }),
    ...(f.description && { description: f.description }),
});

const toggleId = (ids: number[], id: number): number[] =>
    ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];

export default function DashboardExperience({ experiences, hardskills, softskills, domains }: Props) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<ExpFormData>(emptyFormData);
    const [formTasks, setFormTasks] = useState<string[]>([]);
    const [formHardskillIds, setFormHardskillIds] = useState<number[]>([]);
    const [formSoftskillIds, setFormSoftskillIds] = useState<number[]>([]);
    const [formDomainIds, setFormDomainIds] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });

    const startEdit = (exp: Experience) => {
        setFormData({
            slug: exp.slug,
            type: exp.type,
            title: exp.title,
            company: exp.company ?? '',
            location: exp.location ?? '',
            start_date: exp.start_date ?? '',
            end_date: exp.end_date ?? '',
            description: exp.description ?? '',
        });
        setFormTasks(exp.tasks.slice().sort((a, b) => a.position - b.position).map(t => t.content));
        setFormHardskillIds(
            exp.hardskills
                .map(ref => hardskills.find(h => h.slug === ref.slug)?.id)
                .filter((id): id is number => id !== undefined)
        );
        setFormSoftskillIds(
            exp.softskills
                .map(ref => softskills.find(s => s.slug === ref.slug)?.id)
                .filter((id): id is number => id !== undefined)
        );
        setFormDomainIds(exp.domains.map(d => d.id));
        setErrorMessage('');
        setEditingId(exp.id);
        setIsAdding(false);
    };

    const startAdd = () => {
        setFormData(emptyFormData);
        setFormTasks([]);
        setFormHardskillIds([]);
        setFormSoftskillIds([]);
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
            await patchExperience(editingId, {
                experienceData: toInput(formData),
                domainData: formDomainIds,
                hardskillData: formHardskillIds,
                softskillData: formSoftskillIds,
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
            await postExperience({
                data: toInput(formData),
                domain: formDomainIds,
                tasks: formTasks,
                hardskill: formHardskillIds,
                softskill: formSoftskillIds,
            });
            await invalidate();
            cancelForm();
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    const isFormOpen = editingId !== null || isAdding;

    return (
        <section className="dashboard-section dashboard-experience">
            <h2>Expériences professionnelles</h2>

            {experiences.map(exp => (
                <div key={exp.id} className={`item-card${editingId === exp.id ? ' item-card--editing' : ''}`}>
                    <div className="item-card__header">
                        <div>
                            <div className="item-card__title">{exp.title}</div>
                            <div className="item-card__subtitle">
                                {[exp.company, exp.location].filter(Boolean).join(' · ')}
                                {exp.start_date && ` · ${exp.start_date}${exp.end_date ? ` → ${exp.end_date}` : ' → présent'}`}
                            </div>
                        </div>
                        <div className="item-card__actions">
                            <span className="item-card__badge">{exp.type}</span>
                            {!isFormOpen && <EditButton onClick={() => startEdit(exp)} />}
                        </div>
                    </div>
                    {exp.description && (
                        <div className="item-card__description">{exp.description}</div>
                    )}
                    {exp.tasks.length > 0 && (
                        <ul className="item-card__tasks">
                            {exp.tasks.slice().sort((a, b) => a.position - b.position).map((t, i) => (
                                <li key={i}>{t.content}</li>
                            ))}
                        </ul>
                    )}
                    {editingId === exp.id && (
                        <div className="item-card__editing-label">✎ en cours d'édition</div>
                    )}
                </div>
            ))}

            {isFormOpen && (
                <form className="rich-form" onSubmit={editingId !== null ? handleEdit : handleAdd}>
                    <p className="rich-form__heading">
                        {editingId !== null ? "Modifier l'expérience" : 'Nouvelle expérience'}
                    </p>
                    <div className="form-grid">
                        <label>Slug
                            <input value={formData.slug} onChange={e => setFormData(p => ({ ...p, slug: e.target.value }))} required />
                        </label>
                        <label>Type
                            <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as 'detail' | 'summary' }))}>
                                <option value="detail">detail</option>
                                <option value="summary">summary</option>
                            </select>
                        </label>
                    </div>
                    <div className="form-grid">
                        <label>Titre
                            <input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} required />
                        </label>
                        <label>Entreprise
                            <input value={formData.company} onChange={e => setFormData(p => ({ ...p, company: e.target.value }))} />
                        </label>
                    </div>
                    <div className="form-grid">
                        <label>Lieu
                            <input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} />
                        </label>
                        <div />
                    </div>
                    <div className="form-grid">
                        <label>Début
                            <input value={formData.start_date} onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))} />
                        </label>
                        <label>Fin
                            <input value={formData.end_date} onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))} />
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

                    <fieldset>
                        <legend>Soft skills</legend>
                        {softskills.map(s => (
                            <label key={s.id}>
                                <input type="checkbox" checked={formSoftskillIds.includes(s.id)} onChange={() => setFormSoftskillIds(p => toggleId(p, s.id))} />
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
                <AddButton label="Ajouter une expérience" onClick={startAdd} />
            )}
        </section>
    );
}
