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

    return (
        <nav className="app-navbar navbar navbar-expand-lg navbar-dark px-4">
            <span className="navbar-brand mb-0 h1 d-lg-none">🐄 Kurra's Dairy</span>
            <div className="ms-auto d-flex align-items-center">
                <span className="text-light me-3">
                    Welcome, <strong>{user?.name}</strong> (<span className="user-role-badge">{user?.role}</span>)
                </span>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
