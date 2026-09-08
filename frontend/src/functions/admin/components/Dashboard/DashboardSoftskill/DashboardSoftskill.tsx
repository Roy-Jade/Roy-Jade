import type { Softskill } from '../../../../../types/Softskill';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardSoftskill.scss';

interface Props {
    softskills: Softskill[];
    editingId: number | null;
    onEdit: (skill: Softskill) => void;
    onAdd: () => void;
}

export default function DashboardSoftskill({ softskills, editingId, onEdit, onAdd }: Props) {
    return (
        <section className="dashboard-section dashboard-softskill">
            <h2>Soft skills</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Soft skill</span>
                    <span />
                </div>
                {softskills.map(skill => (
                    <div key={skill.id} className={`items-list__row${editingId === skill.id ? ' items-list__row--editing' : ''}`}>
                        <div className="items-list__row-data">
                            <span>{skill.label}</span>
                            <EditButton onClick={() => onEdit(skill)} />
                        </div>
                    </div>
                ))}
            </div>
            <AddButton label="Ajouter un soft skill" onClick={onAdd} />
        </section>
    );
}
