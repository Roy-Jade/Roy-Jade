import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postFormation, patchFormation } from '../../../../../api/dashboardApi';
import type { FormationInput } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import { useFormationData } from '../../../../cv/hooks/useFormationData';
import { useHardskillData } from '../../../../cv/hooks/useHardskillData';
import { useFiltersData } from '../../../../cv/hooks/useFiltersData';

interface Props {
    mode: 'add' | 'edit';
    itemId?: number;
    onClose: () => void;
}

interface FormData {
    slug: string;
    title: string;
    institution: string;
    location: string;
    obtention_date: string;
    description: string;
    level: string;
}

const HARDSKILL_LEVELS_FLOOR = 'notions';
const emptyForm: FormData = {
    slug: '', title: '', institution: '',
    location: '', obtention_date: '', description: '', level: '',
};

const toInput = (f: FormData): FormationInput => ({
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

export default function FormationForm({ mode, itemId, onClose }: Props) {
    const queryClient = useQueryClient();
    const { data: filtersData } = useFiltersData();
    const domains = filtersData?.domain ?? [];
    // Tous les domaines : équivaut à "toutes les formations", indépendamment
    // du filtre CV actuellement affiché.
    const { data: formations = [] } = useFormationData(domains.map(d => d.slug));
    const { data: hardskills = [] } = useHardskillData(HARDSKILL_LEVELS_FLOOR, filtersData?.category ?? []);
    const existing = mode === 'edit' ? formations.find(f => f.id === itemId) : undefined;

    const [form, setForm] = useState<FormData>(emptyForm);
    const [tasks, setTasks] = useState<string[]>([]);
    const [domainIds, setDomainIds] = useState<number[]>([]);
    const [hardskillIds, setHardskillIds] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!existing) return;
        setForm({
            slug: existing.slug,
            title: existing.title,
            institution: existing.institution ?? '',
            location: existing.location ?? '',
            obtention_date: existing.obtention_date ?? '',
            description: existing.description ?? '',
            level: existing.level ?? '',
        });
        setTasks(existing.tasks.slice().sort((a, b) => a.position - b.position).map(t => t.content));
        setDomainIds(
            existing.domains
                .map(slug => domains.find(d => d.slug === slug)?.id)
                .filter((id): id is number => id !== undefined)
        );
        setHardskillIds(
            existing.hardskills
                .map(ref => hardskills.find(h => h.slug === ref.slug)?.id)
                .filter((id): id is number => id !== undefined)
        );
    }, [existing, domains, hardskills]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            if (mode === 'edit' && itemId !== undefined) {
                await patchFormation(itemId, {
                    formationData: toInput(form),
                    domainData: domainIds,
                    hardskillData: hardskillIds,
                    taskData: tasks,
                });
            } else {
                await postFormation({
                    data: toInput(form),
                    domain: domainIds,
                    tasks,
                    hardskill: hardskillIds,
                });
            }
            await queryClient.invalidateQueries({ queryKey: ['formation'] });
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
                <label>Niveau
                    <input value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} />
                </label>
            </div>
            <div className="form-full">
                <label>Titre
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </label>
            </div>
            <div className="form-grid">
                <label>Établissement
                    <input value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} />
                </label>
                <label>Lieu
                    <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </label>
            </div>
            <div className="form-full">
                <label>Date d'obtention
                    <input value={form.obtention_date} onChange={e => setForm(p => ({ ...p, obtention_date: e.target.value }))} />
                </label>
            </div>
            <div className="form-full">
                <label>Description
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </label>
            </div>

            <fieldset>
                <legend>Tâches</legend>
                {tasks.map((task, i) => (
                    <div key={i} className="task-row">
                        <input
                            value={task}
                            onChange={e => setTasks(p => p.map((t, j) => j === i ? e.target.value : t))}
                        />
                        <button type="button" onClick={() => setTasks(p => p.filter((_, j) => j !== i))}>Supprimer</button>
                    </div>
                ))}
                <button type="button" className="task-add-btn" onClick={() => setTasks(p => [...p, ''])}>+ Ajouter une tâche</button>
            </fieldset>

            <fieldset>
                <legend>Domaines</legend>
                {domains.map(d => (
                    <label key={d.id}>
                        <input type="checkbox" checked={domainIds.includes(d.id)} onChange={() => setDomainIds(p => toggleId(p, d.id))} />
                        {d.label}
                    </label>
                ))}
            </fieldset>

            <fieldset>
                <legend>Hard skills</legend>
                {hardskills.map(s => (
                    <label key={s.id}>
                        <input type="checkbox" checked={hardskillIds.includes(s.id)} onChange={() => setHardskillIds(p => toggleId(p, s.id))} />
                        {s.label}
                    </label>
                ))}
            </fieldset>

            {errorMessage && <p className="dash-error">{errorMessage}</p>}
            <div className="form-actions">
                <button type="submit">{mode === 'edit' ? 'Sauvegarder' : 'Ajouter'}</button>
                <button type="button" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
}
