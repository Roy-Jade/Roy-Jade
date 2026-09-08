import type { Profile } from '../../../../../types/Profile';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardProfile.scss';

interface Props {
    profiles: Profile[];
    editingId: number | null;
    onEdit: (profile: Profile) => void;
    onAdd: () => void;
}

export default function DashboardProfile({ profiles, editingId, onEdit, onAdd }: Props) {
    return (
        <section className="dashboard-section dashboard-profile">
            <h2>Profils</h2>

            {profiles.map(profile => (
                <div key={profile.id} className={`item-card${editingId === profile.id ? ' item-card--editing' : ''}`}>
                    <div className="item-card__header">
                        <strong className="item-card__title">{profile.context}</strong>
                        <EditButton onClick={() => onEdit(profile)} />
                    </div>
                    {profile.tagline && <div className="item-card__subtitle">{profile.tagline}</div>}
                    {profile.description && <div className="item-card__description">{profile.description}</div>}
                </div>
            ))}

            <AddButton label="Ajouter un profil" onClick={onAdd} />
        </section>
    );
}
