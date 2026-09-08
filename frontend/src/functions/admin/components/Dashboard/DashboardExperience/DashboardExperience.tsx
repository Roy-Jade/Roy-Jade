import type { ExperienceItem as Experience } from '../../../../../types/Experience';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardExperience.scss';

interface Props {
    experiences: Experience[];
    editingId: number | null;
    onEdit: (experience: Experience) => void;
    onAdd: () => void;
}

export default function DashboardExperience({ experiences, editingId, onEdit, onAdd }: Props) {
    return (
        <section className="dashboard-section dashboard-experience">
            <h2>Expériences professionnelles</h2>

            {experiences.map(exp => (
                <div key={exp.id} className={`item-card${editingId === exp.id ? ' item-card--editing' : ''}`}>
                    <div className="item-card__header">
                        <div>
                            <div className="item-card__title">{exp.title}</div>
                            <div className="item-card__subtitle">
                                {[exp.company, exp.location].filter(Boolean).join(' · ')}
                                {exp.start_date && ` · ${exp.start_date}${exp.end_date ? ` → ${exp.end_date}` : ' → présent'}`}
                            </div>
                        </div>
                        <div className="item-card__actions">
                            <span className="item-card__badge">{exp.type}</span>
                            <EditButton onClick={() => onEdit(exp)} />
                        </div>
                    </div>
                    {exp.description && (
                        <div className="item-card__description">{exp.description}</div>
                    )}
                    {exp.tasks.length > 0 && (
                        <ul className="item-card__tasks">
                            {exp.tasks.slice().sort((a, b) => a.position - b.position).map((t, i) => (
                                <li key={i}>{t.content}</li>
                            ))}
                        </ul>
                    )}
                    {editingId === exp.id && (
                        <div className="item-card__editing-label">✎ en cours d'édition</div>
                    )}
                </div>
            ))}

            <AddButton label="Ajouter une expérience" onClick={onAdd} />
        </section>
    );
}
