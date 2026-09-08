import type { FormationItem as Formation } from '../../../../../types/Formation';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardFormation.scss';

interface Props {
    formations: Formation[];
    editingId: number | null;
    onEdit: (formation: Formation) => void;
    onAdd: () => void;
}

export default function DashboardFormation({ formations, editingId, onEdit, onAdd }: Props) {
    return (
        <section className="dashboard-section dashboard-formation">
            <h2>Formations et diplômes</h2>

            {formations.map(form => (
                <div key={form.id} className={`item-card${editingId === form.id ? ' item-card--editing' : ''}`}>
                    <div className="item-card__header">
                        <div>
                            <div className="item-card__title">{form.title}</div>
                            <div className="item-card__subtitle">
                                {[form.institution, form.location].filter(Boolean).join(' · ')}
                                {form.obtention_date && ` · ${form.obtention_date}`}
                            </div>
                        </div>
                        <div className="item-card__actions">
                            {form.level && <span className="item-card__badge">{form.level}</span>}
                            <EditButton onClick={() => onEdit(form)} />
                        </div>
                    </div>
                    {form.description && (
                        <div className="item-card__description">{form.description}</div>
                    )}
                    {form.tasks.length > 0 && (
                        <ul className="item-card__tasks">
                            {form.tasks.slice().sort((a, b) => a.position - b.position).map((t, i) => (
                                <li key={i}>{t.content}</li>
                            ))}
                        </ul>
                    )}
                    {editingId === form.id && (
                        <div className="item-card__editing-label">✎ en cours d'édition</div>
                    )}
                </div>
            ))}

            <AddButton label="Ajouter une formation" onClick={onAdd} />
        </section>
    );
}
