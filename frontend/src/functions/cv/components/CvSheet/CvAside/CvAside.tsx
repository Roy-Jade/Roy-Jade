import { useQuery } from '@tanstack/react-query';
import { getAside } from '../../../../../api/cvApi';
import type { Language } from '../../../../../types/Language';
import type { Hobby } from '../../../../../types/Hobby';
import type { HiddenIdField } from '../../../../../types/searchParams';
import { isHidden } from '../../../../../utils/isHidden';
import { useHardskillData } from '../../../hooks/useHardskillData';
import HoverAction from '../../../../core/components/HoverAction/HoverAction';
import HideIcon from '../../../../../assets/icons/hide.svg?react';
import photo from '../../../../../assets/photo.jpg';
// import './CvAside.scss';

interface Props {
    level: string;
    categories: string[];
    hiddenHardskillIds: number[];
    toggleHidden: (key: HiddenIdField, id: number) => void;
}

export default function CvAside({ level, categories, hiddenHardskillIds, toggleHidden }: Props) {
    const { data: hardskills = [], isLoading, isError } = useHardskillData(level, categories);

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

            {hardskills.length > 0 && (
                <article>
                    <h2>Compétences</h2>
                    <ul>
                        {hardskills
                            .filter(skill => !isHidden(skill.id, hiddenHardskillIds))
                            .map(skill => (
                                <li key={skill.id} className="hover-reveal">
                                    {skill.label}
                                    <HoverAction
                                        icon={<HideIcon />}
                                        label={`Masquer la compétence : ${skill.label}`}
                                        onClick={() => toggleHidden('hiddenHardskillIds', skill.id)}
                                    />
                                </li>
                            ))}
                    </ul>
                </article>
            )}

            {language.length > 0 && (
                <article>
                    <h2>Langues</h2>
                    <ul>
                        {language.map(item => (
                            <li key={item.id}>{item.label}</li>
                        ))}
                    </ul>
                </article>
            )}

            {hobby.length > 0 && (
                <article>
                    <h2>Centres d'intérêts</h2>
                    <ul>
                        {hobby.map(item => (
                            <li key={item.id}>{item.label}</li>
                        ))}
                    </ul>
                </article>
            )}
        </aside>
    );
}
