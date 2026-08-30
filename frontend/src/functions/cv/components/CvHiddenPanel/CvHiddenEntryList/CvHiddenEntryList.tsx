import type { HiddenEntry } from '../../../utils/hiddenGroups';

interface Props {
    entries: HiddenEntry[];
    onShow: (entry: HiddenEntry) => void;
}

export default function CvHiddenEntryList({ entries, onShow }: Props) {
    return (
        <ul className="cv-hidden-entry-list">
            {entries.map(entry => (
                <li key={`${entry.toggleKey}-${entry.id}`} className="cv-hidden-entry">
                    <span className="cv-hidden-entry__label">{entry.label}</span>
                    <button type="button" onClick={() => onShow(entry)}>
                        Afficher
                    </button>
                </li>
            ))}
        </ul>
    );
}
