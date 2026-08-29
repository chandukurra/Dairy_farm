import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { login, error } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const role = await login(formData.email, formData.password);
            navigate(role === 'ADMIN' ? '/admin/dashboard' : role === 'FARM_MANAGER' ? '/manager/dashboard' : '/customer/dashboard');
        } catch {
            // Auth context shows the sign-in error.
        }
    };

    return (
        <main className="farm-login-page">
            <div className="farm-login-overlay" />
            <div className="container d-flex justify-content-center align-items-center min-vh-100 position-relative">
                <div className="card farm-login-card shadow-lg p-4">
                    <div className="text-center mb-4">
                        <div className="farm-login-icon">🐄</div>
                        <h3 className="mb-1">Kurra's Dairy</h3>
                        <p className="text-muted mb-0">Management System</p>
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3"><label className="form-label">Email</label><input type="email" className="form-control" name="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} required /></div>
                        <div className="mb-3"><label className="form-label">Password</label><input type="password" className="form-control" name="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} required /></div>
                        <button type="submit" className="btn btn-success w-100 mb-3">Login</button>
                    </form>
                    <div className="text-center"><p className="mb-0">New customer? <Link to="/register">Register here</Link></p></div>
                </div>
            </div>
        </main>
    );
};

export default Login;
