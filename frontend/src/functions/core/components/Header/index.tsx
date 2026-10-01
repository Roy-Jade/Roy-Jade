import './Header.scss';
import { Link, NavLink } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { logout } from '../../../../api/authApi';
import { useAdminSession } from '../../hooks/useAdminSession';
import Logo from '../Logo/Logo';
import CtaLink from '../CtaLink/CtaLink';

export default function Header() {
    const queryClient = useQueryClient();
    const { data: session } = useAdminSession();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            queryClient.invalidateQueries({ queryKey: ['authSession'] });
        }
    };

    return (
        <header className="site-header">
            <a href="#main-content" className="site-header__skip">Aller au contenu principal</a>

            <div className="site-header__inner">
                <Link to="/" className="site-header__home">
                    <Logo variant="mark" className="site-header__logo site-header__logo--compact" />
                    <Logo variant="full" className="site-header__logo site-header__logo--wide" />
                </Link>

                <nav className="site-header__nav" aria-label="Navigation principale">
                    <ul>
                        <li><NavLink to="/" className="site-header__link">Accueil</NavLink></li>
                        <li><NavLink to="/cv" className="site-header__link">CV</NavLink></li>
                        <li><NavLink to="/portfolio" className="site-header__link">Portfolio</NavLink></li>
                    </ul>
                </nav>

                {session?.isAdmin && (
                    <button type="button" className="site-header__logout" onClick={handleLogout}>
                        Se déconnecter
                    </button>
                )}

                <div className="site-header__contact">
                    <CtaLink to="/contact" variant="secondary">Contactez-moi</CtaLink>
                </div>
            </div>
        </header>
    );
}
