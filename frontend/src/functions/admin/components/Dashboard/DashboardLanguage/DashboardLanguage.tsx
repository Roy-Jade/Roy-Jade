import type { Language } from '../../../../../types/Language';
import EditButton from '../../ui/EditButton';
import AddButton from '../../ui/AddButton';
import './DashboardLanguage.scss';

interface Props {
    languages: Language[];
    editingId: number | null;
    onEdit: (lang: Language) => void;
    onAdd: () => void;
    onReorder: (id: number, direction: 'up' | 'down') => void;
}

export default function DashboardLanguage({ languages, editingId, onEdit, onAdd, onReorder }: Props) {
    return (
        <section className="dashboard-section dashboard-language">
            <h2>Langues</h2>
            <div className="items-list">
                <div className="items-list__header">
                    <span>Langue</span>
                    <span>Niveau</span>
                    <span />
                </div>
                {languages.map((lang, i) => (
                    <div key={lang.id} className={`items-list__row${editingId === lang.id ? ' items-list__row--editing' : ''}`}>
                        <div className="items-list__row-data">
                            <span>{lang.label}</span>
                            <span className="muted">{lang.level || '—'}</span>
                            <span className="items-list__actions">
                                <button type="button" className="reorder-button" aria-label="Monter" disabled={i === 0} onClick={() => onReorder(lang.id, 'up')}>↑</button>
                                <button type="button" className="reorder-button" aria-label="Descendre" disabled={i === languages.length - 1} onClick={() => onReorder(lang.id, 'down')}>↓</button>
                                <EditButton onClick={() => onEdit(lang)} />
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <AddButton label="Ajouter une langue" onClick={onAdd} />
        </section>
    );
}
