import './index.css';
import {Link} from 'react-router';

export default function Header() {
    return(
        <header>
            <Link to="/">
                <p>Grégoire Portier</p>
            </Link>

            <nav>
                <ul>
                    
                </ul>
            </nav>

        </header>
    );
}
