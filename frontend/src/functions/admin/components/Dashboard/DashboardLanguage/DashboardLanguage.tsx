import type { Language } from '../../../../../types/Language';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardLanguage.scss';

interface Props {
    languages: Language[];
    editingId: number | null;
    onEdit: (lang: Language) => void;
    onAdd: () => void;
}

export default function DashboardLanguage({ languages, editingId, onEdit, onAdd }: Props) {
    return (
        <section className="dashboard-section dashboard-language">
            <h2>Langues</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Langue</span>
                    <span>Niveau</span>
                    <span />
                </div>
                {languages.map(lang => (
                    <div key={lang.id} className={`items-list__row${editingId === lang.id ? ' items-list__row--editing' : ''}`}>
                        <div className="items-list__row-data">
                            <span>{lang.label}</span>
                            <span className="muted">{lang.level || '—'}</span>
                            <EditButton onClick={() => onEdit(lang)} />
                        </div>
                    </div>
                ))}
            </div>
            <AddButton label="Ajouter une langue" onClick={onAdd} />
        </section>
    );
}
