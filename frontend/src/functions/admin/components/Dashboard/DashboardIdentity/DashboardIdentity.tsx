import type { Identity } from '../../../../../types/Identity';
import EditButton from '../../ui/EditButton';
import './DashboardIdentity.scss';

interface Props {
    identity: Identity;
    isEditing: boolean;
    onEdit: () => void;
}

export default function DashboardIdentity({ identity, isEditing, onEdit }: Props) {
    return (
        <section className="dashboard-section dashboard-identity">
            <h2>Identité</h2>
            <div className={`item-card${isEditing ? ' item-card--editing' : ''}`}>
                <div className="item-card__header">
                    <div>
                        <div className="item-card__title">{identity.firstname} {identity.lastname}</div>
                        {identity.email && <div className="item-card__subtitle">{identity.email}</div>}
                        {identity.telephone && <div className="item-card__subtitle">{identity.telephone}</div>}
                    </div>
                    <EditButton onClick={onEdit} />
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
