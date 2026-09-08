import { Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAside } from '../../../../../api/cvApi';
import type { Language } from '../../../../../types/Language';
import type { Hobby } from '../../../../../types/Hobby';
import type { HiddenIdField } from '../../../../../types/searchParams';
import type { EditingState } from '../../../../admin/types/EditingState';
import { isHidden } from '../../../../../utils/isHidden';
import { useHardskillData } from '../../../hooks/useHardskillData';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import HideIcon from '../../../../../assets/icons/hide.svg?react';
import photo from '../../../../../assets/photo.jpg';
import EditShell from '../../../../admin/components/EditShell/EditShell';
// import './CvAside.scss';

interface Props {
    level: string;
    categories: string[];
    hiddenHardskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
    editing: EditingState | null;
    onCloseEdit: () => void;
}

export default function CvAside({ level, categories, hiddenHardskillIds, toggleHidden, editing, onCloseEdit }: Props) {
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
                                <Fragment key={skill.id}>
                                <li className="hover-reveal">
                                    {skill.label}
                                    <HoverAction
                                        icon={<HideIcon />}
                                        label={`Masquer la compétence : ${skill.label}`}
                                        onClick={() => toggleHidden('hiddenHardskillIds', skill.id)}
                                    />
                                </li>
                                {isEditingItem('hardskill', skill.id) && (
                                    <li><EditShell category="hardskill" mode="edit" itemId={skill.id} onClose={onCloseEdit} /></li>
                                )}
                                </Fragment>
                            ))}
                        {isAddingNew('hardskill') && (
                            <li>
                                Nouvelle compétence
                                <EditShell category="hardskill" mode="add" onClose={onCloseEdit} />
                            </li>
                        )}
                    </ul>
                </article>
            )}

            {(language.length > 0 || isAddingNew('language')) && (
                <article>
                    <h2>Langues</h2>
                    <ul>
                        {language.map(item => (
                            <Fragment key={item.id}>
                            <li>{item.label}</li>
                            {isEditingItem('language', item.id) && (
                                <li><EditShell category="language" mode="edit" itemId={item.id} onClose={onCloseEdit} /></li>
                            )}
                            </Fragment>
                        ))}
                        {isAddingNew('language') && (
                            <li>
                                Nouvelle langue
                                <EditShell category="language" mode="add" onClose={onCloseEdit} />
                            </li>
                        )}
                    </ul>
                </article>
            )}

            {(hobby.length > 0 || isAddingNew('hobby')) && (
                <article>
                    <h2>Centres d'intérêts</h2>
                    <ul>
                        {hobby.map(item => (
                            <Fragment key={item.id}>
                            <li>{item.label}</li>
                            {isEditingItem('hobby', item.id) && (
                                <li><EditShell category="hobby" mode="edit" itemId={item.id} onClose={onCloseEdit} /></li>
                            )}
                            </Fragment>
                        ))}
                        {isAddingNew('hobby') && (
                            <li>
                                Nouveau centre d'intérêt
                                <EditShell category="hobby" mode="add" onClose={onCloseEdit} />
                            </li>
                        )}
                    </ul>
                </article>
            )}
        </aside>
    );
}
