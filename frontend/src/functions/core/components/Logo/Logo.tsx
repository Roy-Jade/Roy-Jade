import './Logo.scss';
import LogoMark from '../../../../assets/logo-mark.svg?react';
import LogoWordmark from '../../../../assets/logo-wordmark.svg?react';

interface Props {
    variant?: 'full' | 'mark';
    decorative?: boolean;
    className?: string;
}

export default function Logo({ variant = 'full', decorative = false, className }: Props) {
    const classes = ['logo', `logo--${variant}`, className].filter(Boolean).join(' ');
    const a11y = decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': 'Grégoire Portier' };

    return (
        <span className={classes} {...a11y}>
            <LogoMark className="logo__mark" aria-hidden="true" />
            {variant === 'full' && <LogoWordmark className="logo__wordmark" aria-hidden="true" />}
        </span>
    );
}
