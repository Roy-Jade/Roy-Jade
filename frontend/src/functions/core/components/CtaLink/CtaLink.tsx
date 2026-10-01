import './CtaLink.scss';
import { Link } from 'react-router';

interface Props {
    to: string;
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
}

export default function CtaLink({ to, variant = 'primary', children }: Props) {
    return (
        <Link to={to} className={`cta-link cta-link--${variant}`}>
            {children}
        </Link>
    );
}
