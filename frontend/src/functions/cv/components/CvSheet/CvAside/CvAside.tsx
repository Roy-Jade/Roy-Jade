import { useQuery } from '@tanstack/react-query';
import { getAside } from '../../../../../api/cvApi';
import type { Language } from '../../../../../types/Language';
import type { Hobby } from '../../../../../types/Hobby';
import type { HiddenIdField } from '../../../../../types/searchParams';
import type { DashboardCategory, EditingState } from '../../../../admin/types/EditingState';
import type { EditPreview } from '../../../../admin/types/EditPreview';
import { isHidden } from '../../../../../utils/isHidden';
import { useHardskillData } from '../../../hooks/useHardskillData';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import photo from '../../../../../assets/photo.jpg';
import HardskillItem from './HardskillItem';
import LanguageItem from './LanguageItem';
import HobbyItem from './HobbyItem';
// import './CvAside.scss';

interface Props {
    level: string;
    categories: string[];
    hiddenHardskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
    editing: EditingState | null;
    preview: EditPreview | null;
    setAnchor: (node: HTMLElement | null) => void;
    onEdit?: (category: DashboardCategory, item?: { id: number }) => void;
    onAdd?: (category: DashboardCategory) => void;
}

export default function CvAside({ level, categories, hiddenHardskillIds, toggleHidden, editing, preview, setAnchor, onEdit, onAdd }: Props) {
    const { data: hardskills = [], isLoading, isError } = useHardskillData(level, categories);
    const isEditingItem = (category: 'hardskill' | 'language' | 'hobby', id: number) =>
        editing?.category === category && editing.mode === 'edit' && editing.item?.id === id;
    const isAddingNew = (category: 'hardskill' | 'language' | 'hobby') =>
        editing?.category === category && editing.mode === 'add';

    const { data: aside, isLoading: isAsideLoading, isError: isAsideError } = useQuery<{ language: Language[]; hobby: Hobby[] }>({
        queryKey: ['aside'],
        queryFn: getAside,
        staleTime: 20 * 60 * 1000,
    });
    const { language = [], hobby = [] } = aside ?? {};

    const hardskillDraft = preview?.category === 'hardskill' ? preview.data : null;
    const languageDraft = preview?.category === 'language' ? preview.data : null;
    const hobbyDraft = preview?.category === 'hobby' ? preview.data : null;

    return (
        <aside className="cv-aside cv-selectable">
            <img src={photo} alt="Photo de profil" className="cv-aside__photo" />

            {(isLoading || isAsideLoading) && <p>…</p>}
            {(isError || isAsideError) && <p>Erreur</p>}

            {(hardskills.length > 0 || isAddingNew('hardskill')) && (
                <article>
                    <h2 className="hover-reveal">
                        Compétences
                        {onAdd && (
                            <HoverAction icon={<span>+</span>} label="Ajouter une compétence" onClick={() => onAdd('hardskill')} />
                        )}
                    </h2>
                    <ul>
                        {hardskills
                            .filter(skill => !isHidden(skill.id, hiddenHardskillIds))
                            .map(skill => (
                                <HardskillItem
                                    key={skill.id}
                                    skill={isEditingItem('hardskill', skill.id) && hardskillDraft ? hardskillDraft : skill}
                                    onHide={() => toggleHidden('hiddenHardskillIds', skill.id)}
                                    onEdit={onEdit ? () => onEdit('hardskill', { id: skill.id }) : undefined}
                                    ref={isEditingItem('hardskill', skill.id) ? setAnchor : undefined}
                                />
                            ))}
                        {isAddingNew('hardskill') && (
                            hardskillDraft
                                ? <HardskillItem skill={hardskillDraft} onHide={() => {}} ref={setAnchor} />
                                : <li ref={setAnchor}>Nouvelle compétence</li>
                        )}
                    </ul>
                </article>
            )}

            {(language.length > 0 || isAddingNew('language')) && (
                <article>
                    <h2 className="hover-reveal">
                        Langues
                        {onAdd && (
                            <HoverAction icon={<span>+</span>} label="Ajouter une langue" onClick={() => onAdd('language')} />
                        )}
                    </h2>
                    <ul>
                        {language.map(item => (
                            <LanguageItem
                                key={item.id}
                                item={isEditingItem('language', item.id) && languageDraft ? languageDraft : item}
                                onEdit={onEdit ? () => onEdit('language', { id: item.id }) : undefined}
                                ref={isEditingItem('language', item.id) ? setAnchor : undefined}
                            />
                        ))}
                        {isAddingNew('language') && (
                            languageDraft
                                ? <LanguageItem item={languageDraft} ref={setAnchor} />
                                : <li ref={setAnchor}>Nouvelle langue</li>
                        )}
                    </ul>
                </article>
            )}

            {(hobby.length > 0 || isAddingNew('hobby')) && (
                <article>
                    <h2 className="hover-reveal">
                        Centres d'intérêts
                        {onAdd && (
                            <HoverAction icon={<span>+</span>} label="Ajouter un centre d'intérêt" onClick={() => onAdd('hobby')} />
                        )}
                    </h2>
                    <ul>
                        {hobby.map(item => (
                            <HobbyItem
                                key={item.id}
                                item={isEditingItem('hobby', item.id) && hobbyDraft ? hobbyDraft : item}
                                onEdit={onEdit ? () => onEdit('hobby', { id: item.id }) : undefined}
                                ref={isEditingItem('hobby', item.id) ? setAnchor : undefined}
                            />
                        ))}
                        {isAddingNew('hobby') && (
                            hobbyDraft
                                ? <HobbyItem item={hobbyDraft} ref={setAnchor} />
                                : <li ref={setAnchor}>Nouveau centre d'intérêt</li>
                        )}
                    </ul>
                </article>
            )}
        </aside>
    );
}
