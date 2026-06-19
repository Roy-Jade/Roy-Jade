import type { Identity } from '../../../../../types/Identity';
import githubIcon from '../../../../../assets/icons/github.svg';
import gitlabIcon from '../../../../../assets/icons/gitlab.svg';
import linkedinIcon from '../../../../../assets/icons/linkedin.svg';
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
        <footer className="cv-footer">
            <h2>Sur les réseaux :</h2>
            <ul className="cv-footer__links">
                {socialLinks.map(({ key, icon, label }) => {
                    const href = identity?.[key];
                    if (!href) return null;
                    return (
                        <li key={key}>
                            <a href={href} aria-label={label} target="_blank" rel="noopener noreferrer">
                                <img src={icon} alt={label} />
                                {label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </footer>
    );
}
