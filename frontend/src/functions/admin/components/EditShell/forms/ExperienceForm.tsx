import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postExperience, patchExperience } from '../../../../../api/dashboardApi';
import type { ExperienceInput } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import { useExperienceData } from '../../../../cv/hooks/useExperienceData';
import { useHardskillData } from '../../../../cv/hooks/useHardskillData';
import { useSoftskillData } from '../../../../cv/hooks/useSoftskillData';
import { useFiltersData } from '../../../../cv/hooks/useFiltersData';
import { useToast } from '../../../context/ToastContext';
import DateInput from '../../DateInput/DateInput';
import HardskillChecklist from '../../HardskillChecklist/HardskillChecklist';
import SoftskillChecklist from '../../SoftskillChecklist/SoftskillChecklist';
import type { Hardskill } from '../../../../../types/Hardskill';
import type { Softskill } from '../../../../../types/Softskill';

interface Props {
    mode: 'add' | 'edit';
    itemId?: number;
    onClose: () => void;
    onPreviewChange?: (data: unknown) => void;
}

interface FormData {
    type: 'detail' | 'summary';
    title: string;
    company: string;
    location: string;
    start_date: string;
    end_date: string;
    description: string;
}

const HARDSKILL_LEVELS_FLOOR = 'notions';
const emptyForm: FormData = {
    type: 'detail', title: '', company: '',
    location: '', start_date: '', end_date: '', description: '',
};

const toInput = (f: FormData): ExperienceInput => ({
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

export default function ExperienceForm({ mode, itemId, onClose, onPreviewChange }: Props) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { data: filtersData } = useFiltersData();
    const domains = filtersData?.domain ?? [];
    // Tous les domaines : équivaut à "toutes les expériences", indépendamment
    // du filtre CV actuellement affiché.
    const allDomains = domains.map(d => d.slug);
    const { data: experiences = [] } = useExperienceData(allDomains);
    const { data: hardskills = [] } = useHardskillData(HARDSKILL_LEVELS_FLOOR, filtersData?.category ?? []);
    const { data: softskills = [] } = useSoftskillData();
    const existing = mode === 'edit' ? experiences.find(e => e.id === itemId) : undefined;

    const [form, setForm] = useState<FormData>(emptyForm);
    const [tasks, setTasks] = useState<string[]>([]);
    const [domainIds, setDomainIds] = useState<number[]>([]);
    const [hardskillIds, setHardskillIds] = useState<number[]>([]);
    const [softskillIds, setSoftskillIds] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!existing) return;
        setForm({
            type: existing.type,
            title: existing.title,
            company: existing.company ?? '',
            location: existing.location ?? '',
            start_date: existing.start_date ?? '',
            end_date: existing.end_date ?? '',
            description: existing.description ?? '',
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
        setSoftskillIds(
            existing.softskills
                .map(ref => softskills.find(s => s.slug === ref.slug)?.id)
                .filter((id): id is number => id !== undefined)
        );
    }, [existing, domains, hardskills, softskills]);

    useEffect(() => {
        if (mode === 'edit' && !existing) return;
        onPreviewChange?.({
            id: existing?.id ?? -1,
            slug: existing?.slug ?? '',
            type: form.type,
            title: form.title,
            company: form.company || null,
            location: form.location || null,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
            description: form.description || null,
            tasks: tasks.map((content, i) => ({ id: -(i + 1), content, position: i })),
            hardskills: hardskillIds
                .map(id => hardskills.find(h => h.id === id))
                .filter((h): h is Hardskill => h !== undefined)
                .map(h => ({ id: h.id, slug: h.slug, label: h.label, level: h.level, category: h.category, sub_category: h.sub_category ?? '' })),
            softskills: softskillIds
                .map(id => softskills.find(s => s.id === id))
                .filter((s): s is Softskill => s !== undefined)
                .map(s => ({ id: s.id, slug: s.slug, label: s.label })),
            domains: domainIds
                .map(id => domains.find(d => d.id === id)?.slug)
                .filter((slug): slug is string => slug !== undefined),
        });
    }, [mode, existing, form, tasks, domainIds, hardskillIds, softskillIds, domains, hardskills, softskills, onPreviewChange]);

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            if (mode === 'edit' && itemId !== undefined) {
                await patchExperience(itemId, {
                    experienceData: toInput(form),
                    domainData: domainIds,
                    hardskillData: hardskillIds,
                    softskillData: softskillIds,
                    taskData: tasks,
                });
            } else {
                await postExperience({
                    data: toInput(form),
                    domain: domainIds,
                    tasks,
                    hardskill: hardskillIds,
                    softskill: softskillIds,
                });
            }
            await queryClient.invalidateQueries({ queryKey: ['experience'] });
            showToast(mode === 'edit' ? 'Expérience mise à jour' : 'Expérience ajoutée');
            onClose();
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    if (mode === 'edit' && !existing) return <p>Chargement…</p>;

    return (
        <form className="rich-form" onSubmit={handleSubmit}>
            <div className="form-grid">
                <label>Type
                    <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as 'detail' | 'summary' }))}>
                        <option value="detail">detail</option>
                        <option value="summary">summary</option>
                    </select>
                </label>
                <div />
            </div>
            <div className="form-grid">
                <label>Titre
                    <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </label>
                <label>Entreprise
                    <input value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                </label>
            </div>
            <div className="form-grid">
                <label>Lieu
                    <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                </label>
                <div />
            </div>
            <div className="form-grid">
                <label>Début
                    <DateInput value={form.start_date} onChange={v => setForm(p => ({ ...p, start_date: v }))} />
                </label>
                <label>Fin
                    <DateInput value={form.end_date} onChange={v => setForm(p => ({ ...p, end_date: v }))} />
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

            <HardskillChecklist
                hardskills={hardskills}
                checkedIds={hardskillIds}
                onToggle={id => setHardskillIds(p => toggleId(p, id))}
            />

            <SoftskillChecklist
                softskills={softskills}
                checkedIds={softskillIds}
                onToggle={id => setSoftskillIds(p => toggleId(p, id))}
            />

            {errorMessage && <p className="dash-error">{errorMessage}</p>}
            <div className="form-actions">
                <button type="submit">{mode === 'edit' ? 'Sauvegarder' : 'Ajouter'}</button>
                <button type="button" onClick={onClose}>Annuler</button>
            </div>
        </form>
    );
}
