import LogoutButton from '../components/LogoutButton.jsx'
import axios from 'axios';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';


export default function Root() {
    const navigate = useNavigate();

    const handleLogout = async (e) => {
        e.preventDefault();
        const res = await axios.post('/api/logout');
        if (res.data.success) {
            navigate('/');
        }
    };

    //? Rendering the layout and page content

    return (
        <>
            <nav>
                <ul>
                    <li>
                        <NavLink to="/">Home</NavLink>
                    </li>
                    <li>
                        <NavLink to="/movies">All movies</NavLink>
                    </li>
                    <li>
                        <NavLink to="/login">Log in</NavLink>
                    </li>
                    <li>
                        <NavLink to="/me">Your ratings</NavLink>
                    </li>
                    <li>
                        <LogoutButton onLogout={handleLogout} />
                    </li>
                </ul>
            </nav>

            <hr />

            <main>
                <Outlet />
            </main>
        </>
    );
}


