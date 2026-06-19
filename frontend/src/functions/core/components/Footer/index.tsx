import { NavLink } from 'react-router';
// import './index.css';
import { useQuery } from '@tanstack/react-query';
import { getIdentity } from '../../../../api/cvApi';

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
                    {data.github_link && <a href={data.github_link}>Github</a>}
                    {data.gitlab_link && <a href={data.gitlab_link}>Gitlab</a>}
                    {data.linkedin_link && <a href={data.linkedin_link}>LinkedIn</a>}
                </address>
            }
        </footer>
    );
}
