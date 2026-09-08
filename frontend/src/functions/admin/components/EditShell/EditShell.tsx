import type { ComponentType } from 'react';
import type { DashboardCategory } from '../../types/EditingState';
import IdentityForm from './forms/IdentityForm';
import ProfileForm from './forms/ProfileForm';
import DomainForm from './forms/DomainForm';
import SoftskillForm from './forms/SoftskillForm';
import HardskillForm from './forms/HardskillForm';
import LanguageForm from './forms/LanguageForm';
import HobbyForm from './forms/HobbyForm';
import ExperienceForm from './forms/ExperienceForm';
import FormationForm from './forms/FormationForm';

interface FormProps {
    mode: 'add' | 'edit';
    itemId?: number;
    onClose: () => void;
}

interface Props extends FormProps {
    category: DashboardCategory;
}

const CATEGORY_LABELS: Record<DashboardCategory, string> = {
    identity: 'identité',
    profile: 'profil',
    domain: 'domaine',
    softskill: 'soft skill',
    hardskill: 'hard skill',
    experience: 'expérience',
    formation: 'formation',
    language: 'langue',
    hobby: "centre d'intérêt",
};

const CATEGORY_FORMS: Partial<Record<DashboardCategory, ComponentType<FormProps>>> = {
    identity: IdentityForm,
    profile: ProfileForm,
    domain: DomainForm,
    softskill: SoftskillForm,
    hardskill: HardskillForm,
    language: LanguageForm,
    hobby: HobbyForm,
    experience: ExperienceForm,
    formation: FormationForm,
};

export default function EditShell({ category, mode, itemId, onClose }: Props) {
    const Form = CATEGORY_FORMS[category];
    const label = `${mode === 'add' ? 'Ajout' : 'Édition'} — ${CATEGORY_LABELS[category]}`;

    return (
        <section className="edit-shell" aria-label={label}>
            {Form ? (
                <Form mode={mode} itemId={itemId} onClose={onClose} />
            ) : (
                <p>
                    Formulaire {mode === 'add' ? "d'ajout" : "d'édition"} — {CATEGORY_LABELS[category]} (à venir)
                    <button type="button" onClick={onClose}>Annuler</button>
                </p>
            )}
        </section>
    );
}
