import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Identity } from '../../../../../api/dashboardApi';
import { patchIdentity } from '../../../../../api/dashboardApi';
import { isApiError } from '../../../../../api/privateApi';
import EditButton from '../../ui/EditButton';
import './DashboardIdentity.scss';

interface Props {
    identity: Identity;
}

interface IdentityForm {
    firstname: string;
    lastname: string;
    email: string;
    telephone: string;
    github_link: string;
    gitlab_link: string;
    linkedin_link: string;
}

export default function DashboardIdentity({ identity }: Props) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState<IdentityForm>({
        firstname: '',
        lastname: '',
        email: '',
        telephone: '',
        github_link: '',
        gitlab_link: '',
        linkedin_link: '',
    });
    const [errorMessage, setErrorMessage] = useState('');

    const startEditing = () => {
        setForm({
            firstname: identity.firstname,
            lastname: identity.lastname,
            email: identity.email ?? '',
            telephone: identity.telephone ?? '',
            github_link: identity.github_link ?? '',
            gitlab_link: identity.gitlab_link ?? '',
            linkedin_link: identity.linkedin_link ?? '',
        });
        setErrorMessage('');
        setIsEditing(true);
    };

    const handleSubmit = async (e: { preventDefault(): void }) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            await patchIdentity(form);
            queryClient.invalidateQueries({ queryKey: ['dashboardOverview'] });
            setIsEditing(false);
        } catch (err) {
            setErrorMessage(isApiError(err) ? err.message : 'Erreur inattendue');
        }
    };

    const field = (key: keyof IdentityForm, label: string) => (
        <label>
            {label}
            <input
                type="text"
                value={form[key]}
                onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
            />
        </label>
    );

    if (isEditing) {
        return (
            <section className="dashboard-section dashboard-identity">
                <h2>Identité</h2>
                <div className="item-card item-card--editing">
                    <form className="card-form" onSubmit={handleSubmit}>
                        <div className="form-grid-2">
                            {field('firstname', 'Prénom')}
                            {field('lastname', 'Nom')}
                        </div>
                        <div className="form-grid-2">
                            {field('email', 'Email')}
                            {field('telephone', 'Téléphone')}
                        </div>
                        {field('github_link', 'GitHub')}
                        {field('gitlab_link', 'GitLab')}
                        {field('linkedin_link', 'LinkedIn')}
                        {errorMessage && <p className="dash-error">{errorMessage}</p>}
                        <div className="form-actions">
                            <button type="submit">Sauvegarder</button>
                            <button type="button" onClick={() => setIsEditing(false)}>Annuler</button>
                        </div>
                    </form>
                </div>
            </section>
        );
    }

    return (
        <section className="dashboard-section dashboard-identity">
            <h2>Identité</h2>
            <div className="item-card">
                <div className="item-card__header">
                    <div>
                        <div className="item-card__title">{identity.firstname} {identity.lastname}</div>
                        {identity.email && <div className="item-card__subtitle">{identity.email}</div>}
                        {identity.telephone && <div className="item-card__subtitle">{identity.telephone}</div>}
                    </div>
                    <EditButton onClick={startEditing} />
                </div>
                {(identity.github_link || identity.gitlab_link || identity.linkedin_link) && (
                    <div className="item-card__badges">
                        {identity.github_link && <span className="item-card__badge">GitHub</span>}
                        {identity.gitlab_link && <span className="item-card__badge">GitLab</span>}
                        {identity.linkedin_link && <span className="item-card__badge">LinkedIn</span>}
                    </div>
                )}
            </div>
        </section>
    );
}
