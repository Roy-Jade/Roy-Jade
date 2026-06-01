import { NavLink } from 'react-router';
import './index.css';
import { useQuery } from '@tanstack/react-query';
import { getIdentity } from '../../../../api/cv';

export default function Footer() {

    const { data, isLoading, isError } = useQuery({
        queryKey: ['identity'],
        queryFn: getIdentity,
        staleTime: 20 * 60 * 1000,
    })

    return(
        <footer>
            <nav aria-label="Liens utiles">
                <ul>
                    <li><NavLink to="/legal">Mentions légales</NavLink></li> 
                    <li><NavLink to="/contact">Me contacter</NavLink></li>
                </ul>
            </nav>

            {isLoading ? <p>Récupération des données</p> :
                isError ? <p>Erreur à la récupération des données</p> :
                <address>
                    {data.firstname} {data.lastname}<br/>
                    <a href="{data.github_link}">Github</a>
                    <a href="{data.gitlab_link}">Gitlab</a>
                    <a href="{data.linkedin_link}">LinkedIn</a>
                </address>
            }
        </footer>
    );
}
