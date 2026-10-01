import type { Identity } from '../../../types/Identity';
import githubIcon from '../../../assets/icons/github.svg';
import gitlabIcon from '../../../assets/icons/gitlab.svg';
import linkedinIcon from '../../../assets/icons/linkedin.svg';

interface SocialLink {
    key: keyof Pick<Identity, 'github_link' | 'gitlab_link' | 'linkedin_link'>;
    icon: string;
    label: string;
}

export const socialLinks: SocialLink[] = [
    { key: 'github_link', icon: githubIcon, label: 'GitHub' },
    { key: 'gitlab_link', icon: gitlabIcon, label: 'GitLab' },
    { key: 'linkedin_link', icon: linkedinIcon, label: 'LinkedIn' },
];
