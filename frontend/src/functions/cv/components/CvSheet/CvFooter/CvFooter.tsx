import type { Identity } from '../../../../../types/Identity';
import githubIcon from '../../../../../assets/icons/github.svg';
import gitlabIcon from '../../../../../assets/icons/gitlab.svg';
import linkedinIcon from '../../../../../assets/icons/linkedin.svg';

import Tag from '../../../../core/components/Tag/Tag';
// import './CvFooter.scss';

const socialLinks = [
    { key: 'github_link' as const, icon: githubIcon, label: 'GitHub' },
    { key: 'gitlab_link' as const, icon: gitlabIcon, label: 'GitLab' },
    { key: 'linkedin_link' as const, icon: linkedinIcon, label: 'LinkedIn' },
];

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
                    const username = href.replace(/\/+$/, '').split('/').pop();
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
