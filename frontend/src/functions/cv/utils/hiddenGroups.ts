import type { HiddenIdField } from '../../../types/searchParams';
import type { ExperienceItem } from '../../../types/Experience';
import type { FormationItem } from '../../../types/Formation';
import type { Hardskill } from '../../../types/Hardskill';
import { isHidden } from '../../../utils/isHidden';

export type HiddenEntry = {
    id: number;
    label: string;
    toggleKey: HiddenIdField;
};

export type HiddenSubGroup = {
    label: string;
    entries: HiddenEntry[];
};

export type HiddenItemGroup = {
    id: number;
    label: string;
    fullyHidden: boolean;
    toggleKey: HiddenIdField;
    subGroups: HiddenSubGroup[];
};

export const BUCKET_FIELDS: Record<'competence' | 'experience' | 'formation', HiddenIdField[]> = {
    competence: ['hiddenHardskillIds'],
    experience: [
        'hiddenExperienceIds',
        'hiddenExperienceDescriptionIds',
        'hiddenExperienceTaskIds',
        'hiddenExperienceHardskillIds',
        'hiddenExperienceSoftskillIds',
    ],
    formation: [
        'hiddenFormationIds',
        'hiddenFormationDescriptionIds',
        'hiddenFormationTaskIds',
        'hiddenFormationHardskillIds',
    ],
};

export const ALL_HIDDEN_FIELDS: HiddenIdField[] = [
    ...BUCKET_FIELDS.competence,
    ...BUCKET_FIELDS.experience,
    ...BUCKET_FIELDS.formation,
];

export function buildHardskillEntries(hardskills: Hardskill[], hiddenHardskillIds: number[]): HiddenEntry[] {
    return hardskills
        .filter(skill => isHidden(skill.id, hiddenHardskillIds))
        .map(skill => ({ id: skill.id, label: skill.label, toggleKey: 'hiddenHardskillIds' }));
}

export function buildExperienceGroups(
    experiences: ExperienceItem[],
    hidden: {
        ids: number[];
        description: number[];
        task: number[];
        hardskill: number[];
        softskill: number[];
    }
): HiddenItemGroup[] {
    const groups: HiddenItemGroup[] = [];

    experiences.forEach(exp => {
        if (isHidden(exp.id, hidden.ids)) {
            groups.push({
                id: exp.id,
                label: exp.title,
                fullyHidden: true,
                toggleKey: 'hiddenExperienceIds',
                subGroups: [],
            });
            return;
        }

        const subGroups: HiddenSubGroup[] = [];

        if (exp.description && isHidden(exp.id, hidden.description)) {
            subGroups.push({
                label: 'Description',
                entries: [{ id: exp.id, label: exp.description, toggleKey: 'hiddenExperienceDescriptionIds' }],
            });
        }

        const hiddenTasks = exp.tasks.filter(task => isHidden(task.id, hidden.task));
        if (hiddenTasks.length > 0) {
            subGroups.push({
                label: 'Tâches',
                entries: hiddenTasks.map(task => ({ id: task.id, label: task.content, toggleKey: 'hiddenExperienceTaskIds' })),
            });
        }

        const hiddenHardskills = exp.hardskills.filter(skill => isHidden(skill.id, hidden.hardskill));
        if (hiddenHardskills.length > 0) {
            subGroups.push({
                label: 'Compétences techniques',
                entries: hiddenHardskills.map(skill => ({ id: skill.id, label: skill.label, toggleKey: 'hiddenExperienceHardskillIds' })),
            });
        }

        const hiddenSoftskills = exp.softskills.filter(skill => isHidden(skill.id, hidden.softskill));
        if (hiddenSoftskills.length > 0) {
            subGroups.push({
                label: 'Compétences comportementales',
                entries: hiddenSoftskills.map(skill => ({ id: skill.id, label: skill.label, toggleKey: 'hiddenExperienceSoftskillIds' })),
            });
        }

        if (subGroups.length > 0) {
            groups.push({
                id: exp.id,
                label: exp.title,
                fullyHidden: false,
                toggleKey: 'hiddenExperienceIds',
                subGroups,
            });
        }
    });

    return groups;
}

export function buildFormationGroups(
    formations: FormationItem[],
    hidden: {
        ids: number[];
        description: number[];
        task: number[];
        hardskill: number[];
    }
): HiddenItemGroup[] {
    const groups: HiddenItemGroup[] = [];

    formations.forEach(formation => {
        if (isHidden(formation.id, hidden.ids)) {
            groups.push({
                id: formation.id,
                label: formation.title,
                fullyHidden: true,
                toggleKey: 'hiddenFormationIds',
                subGroups: [],
            });
            return;
        }

        const subGroups: HiddenSubGroup[] = [];

        if (formation.description && isHidden(formation.id, hidden.description)) {
            subGroups.push({
                label: 'Description',
                entries: [{ id: formation.id, label: formation.description, toggleKey: 'hiddenFormationDescriptionIds' }],
            });
        }

        const hiddenTasks = formation.tasks.filter(task => isHidden(task.id, hidden.task));
        if (hiddenTasks.length > 0) {
            subGroups.push({
                label: 'Tâches',
                entries: hiddenTasks.map(task => ({ id: task.id, label: task.content, toggleKey: 'hiddenFormationTaskIds' })),
            });
        }

        const hiddenHardskills = formation.hardskills.filter(skill => isHidden(skill.id, hidden.hardskill));
        if (hiddenHardskills.length > 0) {
            subGroups.push({
                label: 'Compétences techniques',
                entries: hiddenHardskills.map(skill => ({ id: skill.id, label: skill.label, toggleKey: 'hiddenFormationHardskillIds' })),
            });
        }

        if (subGroups.length > 0) {
            groups.push({
                id: formation.id,
                label: formation.title,
                fullyHidden: false,
                toggleKey: 'hiddenFormationIds',
                subGroups,
            });
        }
    });

    return groups;
}
