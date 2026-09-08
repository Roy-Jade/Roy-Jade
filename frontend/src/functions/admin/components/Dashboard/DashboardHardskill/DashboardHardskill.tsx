import type { Hardskill } from '../../../../../types/Hardskill';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardHardskill.scss';

interface Props {
    hardskills: Hardskill[];
    editingId: number | null;
    onEdit: (skill: Hardskill) => void;
    onAdd: () => void;
}

const categoryDisplay = (skill: Hardskill): string => {
    if (!skill.category) return '—';
    return skill.sub_category ? `${skill.category} / ${skill.sub_category}` : skill.category;
};

export default function DashboardHardskill({ hardskills, editingId, onEdit, onAdd }: Props) {
    return (
        <section className="dashboard-section dashboard-hardskill">
            <h2>Hard skills</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Hard skill</span>
                    <span>Catégorie</span>
                    <span>Niveau</span>
                    <span />
                </div>
                {hardskills.map(skill => (
                    <div key={skill.id} className={`items-list__row${editingId === skill.id ? ' items-list__row--editing' : ''}`}>
                        <div className="items-list__row-data">
                            <span>{skill.label}</span>
                            <span className="muted">{categoryDisplay(skill)}</span>
                            <span className="muted">{skill.level || '—'}</span>
                            <EditButton onClick={() => onEdit(skill)} />
                        </div>
                    </div>
                ))}
            </div>
            <AddButton label="Ajouter un hard skill" onClick={onAdd} />
        </section>
    );
}
