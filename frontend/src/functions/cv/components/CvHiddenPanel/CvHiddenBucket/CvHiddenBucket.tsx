import type { HiddenIdField } from '../../../../../types/searchParams';
import type { HiddenItemGroup } from '../../../utils/hiddenGroups';
import CvHiddenEntryList from '../CvHiddenEntryList/CvHiddenEntryList';

interface Props {
    bucketKey: string;
    title: string;
    itemGroups: HiddenItemGroup[];
    fields: HiddenIdField[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
    clearHidden: (keys: HiddenIdField[]) => void;
    register: (key: string) => (el: HTMLElement | null) => void;
    requestFocus: (chain: string[]) => void;
}

export default function CvHiddenBucket({
    bucketKey,
    title,
    itemGroups,
    fields,
    toggleHidden,
    clearHidden,
    register,
    requestFocus,
}: Props) {
    if (itemGroups.length === 0) return null;

    return (
        <section className="cv-hidden-bucket">
            <div className="cv-hidden-bucket__header" ref={register(bucketKey)} tabIndex={-1}>
                <h3>{title}</h3>
                <button
                    type="button"
                    onClick={() => {
                        requestFocus([bucketKey, 'panel-toggle']);
                        clearHidden(fields);
                    }}
                >
                    Tout réafficher
                </button>
            </div>
            <ul className="cv-hidden-bucket__items">
                {itemGroups.map(item => {
                    const itemKey = `item-${item.toggleKey}-${item.id}`;
                    return (
                        <li key={itemKey} className="cv-hidden-item">
                            <div className="cv-hidden-item__header" ref={register(itemKey)} tabIndex={-1}>
                                <span>{item.label}</span>
                                {item.fullyHidden && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            requestFocus([bucketKey, 'panel-toggle']);
                                            toggleHidden(item.toggleKey, item.id);
                                        }}
                                    >
                                        Afficher
                                    </button>
                                )}
                            </div>
                            {!item.fullyHidden && item.subGroups.map(subGroup => {
                                const subKey = `subgroup-${itemKey}-${subGroup.label}`;
                                return (
                                    <div key={subKey} className="cv-hidden-subgroup">
                                        <p className="cv-hidden-subgroup__label" ref={register(subKey)} tabIndex={-1}>
                                            {subGroup.label}
                                        </p>
                                        <CvHiddenEntryList
                                            entries={subGroup.entries}
                                            onShow={entry => {
                                                requestFocus([subKey, itemKey, bucketKey, 'panel-toggle']);
                                                toggleHidden(entry.toggleKey, entry.id);
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
