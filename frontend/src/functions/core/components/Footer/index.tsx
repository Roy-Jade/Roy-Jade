import './Footer.scss';
import { NavLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getIdentity } from '../../../../api/cvApi';
import CtaLink from '../CtaLink/CtaLink';
import { socialLinks } from '../../constants/socialLinks';

export default function Footer() {
    // Information d'appoint : rien n'est affiché pendant le chargement ni en cas d'erreur
    // (visible dans l'onglet réseau de l'inspecteur si besoin).
    const { data } = useQuery({
        queryKey: ['identity'],
        queryFn: getIdentity,
        staleTime: 20 * 60 * 1000,
    })

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">

                <nav className="site-footer__nav" aria-label="Liens utiles">
                    <ul>
                        <li><NavLink to="/legal" className="site-footer__link">Mentions légales</NavLink></li>
                        <li className="site-footer__contact-link"><NavLink to="/contact" className="site-footer__link">Me contacter</NavLink></li>
                    </ul>
                </nav>

                <div className="site-footer__contact-cta">
                    <CtaLink to="/contact" variant="secondary">Me contacter</CtaLink>
                </div>

                {data && (
                    <address className="site-footer__identity">
                        <span className="site-footer__name">{data.firstname} {data.lastname}</span>
                        {/* Liens externes volontairement dans le même onglet : le visiteur choisit
                            d'en ouvrir un nouveau (Cmd/Ctrl+clic, clic du milieu), rien ne lui est imposé. */}
                        {socialLinks.map(({ key, icon, label }) => {
                            const href = data[key];
                            if (!href) return null;
                            return (
                                <a href={href} className={`site-footer__link site-footer__social site-footer__social--${key}`} key={key}>
                                    <img src={icon} alt="" />
                                    {label}
                                </a>
                            );
                        })}
                    </address>
                )}
            </div>
        </footer>
    );
}
