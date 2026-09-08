import { useEffect, useRef, useState } from 'react';
// import './index.css';
import {Link, NavLink} from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import MenuIcon from '../../../../assets/menu.svg?react';
import { logout } from '../../../../api/authApi';
import { useAdminSession } from '../../hooks/useAdminSession';
// Note : NavLink est un Link qui gère le aria-current="page" automatiquement.

export default function Header() {
    const [isBurgerOpen, setIsBurgerOpen] = useState(false);
    const burgerRef = useRef<HTMLButtonElement>(null); // Permet de mettre un ref à un élément (ici un bouton)
    const queryClient = useQueryClient();
    const { data: session } = useAdminSession();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            queryClient.invalidateQueries({ queryKey: ['authSession'] });
        }
    };

    // Le useEffect permet de mettre le mettre un écouteur sur le menu burger qui se déclenche quand escape est appuyé ; l'événement déclenché ferme le menu et met le focus sur le bouton du menu
    useEffect(() => {
        function handleKeyDown(e:KeyboardEvent) {if (e.key === "Escape" ) {
            setIsBurgerOpen(false);
            burgerRef.current?.focus()
        }}
        document.addEventListener("keydown", handleKeyDown)
        
        return () => document.removeEventListener("keydown", handleKeyDown)
        }, []
    )

    return(
        <header>
            <a href="#main-content" className='visually-hidden visually-hidden-focusable'>Aller au contenu principal</a>
            <Link to="/">
                <p>Grégoire Portier</p>
            </Link>

            <button 
                className='nav-burger' 
                ref={burgerRef} // la ref nécessaire pour envoyer le focus sur le bouton
                aria-expanded={isBurgerOpen}
                aria-controls="nav-menu"
                aria-label={isBurgerOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
                onClick={() => setIsBurgerOpen(!isBurgerOpen)}
                >
                    <MenuIcon aria-hidden='true' />
                </button>
            <nav id='nav-menu' aria-label="Navigation principale">
                <ul>
                    <li><NavLink to="/">Accueil</NavLink></li> 
                    <li><NavLink to="/cv">CV</NavLink></li>
                    <li><NavLink to="/portfolio">Portfolio</NavLink></li>
                    {session?.isAdmin && (
                        <li><button type="button" onClick={handleLogout}>Se déconnecter</button></li>
                    )}
                </ul>
            </nav>

        </header>
    );
}
