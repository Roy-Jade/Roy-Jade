import { useQuery } from '@tanstack/react-query';
import { getAside } from '../../../../../api/cvApi';
import type { Language } from '../../../../../types/Language';
import type { Hobby } from '../../../../../types/Hobby';
import type { HiddenIdField } from '../../../../../types/searchParams';
import type { EditingState } from '../../../../admin/types/EditingState';
import type { EditPreview } from '../../../../admin/types/EditPreview';
import { isHidden } from '../../../../../utils/isHidden';
import { useHardskillData } from '../../../hooks/useHardskillData';
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
}

export default function CvAside({ level, categories, hiddenHardskillIds, toggleHidden, editing, preview, setAnchor }: Props) {
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
                    <h2>Compétences</h2>
                    <ul>
                        {hardskills
                            .filter(skill => !isHidden(skill.id, hiddenHardskillIds))
                            .map(skill => (
                                <HardskillItem
                                    key={skill.id}
                                    skill={isEditingItem('hardskill', skill.id) && hardskillDraft ? hardskillDraft : skill}
                                    onHide={() => toggleHidden('hiddenHardskillIds', skill.id)}
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
                    <h2>Langues</h2>
                    <ul>
                        {language.map(item => (
                            <LanguageItem
                                key={item.id}
                                item={isEditingItem('language', item.id) && languageDraft ? languageDraft : item}
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
                    <h2>Centres d'intérêts</h2>
                    <ul>
                        {hobby.map(item => (
                            <HobbyItem
                                key={item.id}
                                item={isEditingItem('hobby', item.id) && hobbyDraft ? hobbyDraft : item}
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
