import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const now = new Date();
    const dateLabel = now.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <nav className="app-navbar navbar navbar-expand-lg navbar-dark px-4">
            <button className="navbar-menu btn btn-link d-none d-lg-inline p-0" aria-label="Navigation menu">☰</button>
            <span className="navbar-brand mb-0 h1 d-lg-none">🐄 Kurra's Dairy</span>
            <div className="ms-auto d-flex align-items-center">
                <div className="navbar-greeting d-none d-md-flex"><span>☀️</span><div>Good day, <strong>{user?.name || 'Farmer'}</strong><small>{dateLabel}</small></div></div>
                <span className="notification-dot" aria-label="Notifications">♧</span>
                <span className="navbar-avatar" title={user?.role}>{user?.name?.slice(0, 2).toUpperCase() || 'KD'}</span>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm ms-2">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
