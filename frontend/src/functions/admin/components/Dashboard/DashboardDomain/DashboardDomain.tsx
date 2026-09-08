import type { Domain } from '../../../../../types/Domain';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardDomain.scss';

interface Props {
    domains: Domain[];
    editingId: number | null;
    onEdit: (domain: Domain) => void;
    onAdd: () => void;
}

export default function DashboardDomain({ domains, editingId, onEdit, onAdd }: Props) {
    return (
        <section className="dashboard-section dashboard-domain">
            <h2>Domaines</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Domaine</span>
                    <span>Slug</span>
                    <span />
                </div>
                {domains.map(domain => (
                    <div key={domain.id} className={`items-list__row${editingId === domain.id ? ' items-list__row--editing' : ''}`}>
                        <div className="items-list__row-data">
                            <span>{domain.label}</span>
                            <span className="muted">{domain.slug}</span>
                            <EditButton onClick={() => onEdit(domain)} />
                        </div>
                    </div>
                ))}
            </div>
            <AddButton label="Ajouter un domaine" onClick={onAdd} />
        </section>
    );
}
