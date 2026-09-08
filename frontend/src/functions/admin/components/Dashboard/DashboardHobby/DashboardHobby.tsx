import type { Hobby } from '../../../../../types/Hobby';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardHobby.scss';

interface Props {
    hobbies: Hobby[];
    editingId: number | null;
    onEdit: (hobby: Hobby) => void;
    onAdd: () => void;
}

export default function DashboardHobby({ hobbies, editingId, onEdit, onAdd }: Props) {
    return (
        <section className="dashboard-section dashboard-hobby">
            <h2>Centres d'intérêts</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Loisir</span>
                    <span>Complément</span>
                    <span />
                </div>
                {hobbies.map(hobby => (
                    <div key={hobby.id} className={`items-list__row${editingId === hobby.id ? ' items-list__row--editing' : ''}`}>
                        <div className="items-list__row-data">
                            <span>{hobby.label}</span>
                            <span className="muted">{hobby.supplement || '—'}</span>
                            <EditButton onClick={() => onEdit(hobby)} />
                        </div>
                    </div>
                ))}
            </div>
            <AddButton label="Ajouter un centre d'intérêt" onClick={onAdd} />
        </section>
    );
}
