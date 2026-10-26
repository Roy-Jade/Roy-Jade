import type { Identity } from '../../../../../types/Identity';
import { getUsername, socialLinks } from '../../../../core/constants/socialLinks';

import Tag from '../../../../core/components/Tag/Tag';
// import './CvFooter.scss';

interface Props {
    identity: Identity | undefined;
}

export default function CvFooter({ identity }: Props) {
    return (
        <footer className="cv-footer cv-selectable">
            <h2>Sur les réseaux :</h2>
            <ul className="cv-footer__list">
                {socialLinks.map(({ key, icon, label }) => {
                    const href = identity?.[key];
                    if (!href) return null;
                    const username = getUsername(href);
                    // Nouvel onglet volontaire, contrairement au footer du site : depuis le CV, on ouvre
                    // un lien pour recouper une info (ex. le code d'un projet cité) sans quitter le CV.
                    return (
                        <li className="cv-footer__list-links" key={key}>
                            <a href={href} aria-label={`${label} : ${username}`} target="_blank" rel="noopener noreferrer">
                                <img src={icon} alt={label} />
                                {username}
                            </a>
                        </li>
                    );
                })}
                {identity?.rqth &&
                    <li className="cv-footer__list-tag">
                        <Tag label="RQTH" variant="cv-other" />
                    </li>
                }
            </ul>
        </footer>
    );
}
