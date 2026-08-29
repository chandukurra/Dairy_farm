import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '', address: ''
    });
    const [localError, setLocalError] = useState('');
    const { register, error: contextError } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (formData.password !== formData.confirmPassword) {
            return setLocalError('Passwords do not match');
        }

        try {
            // The backend automatically assigns the CUSTOMER role
            await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                address: formData.address
            });
            navigate('/customer/dashboard');
        } catch (err) {
            // Handled by context
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="card shadow-lg p-4">
                        <h3 className="text-center mb-4">🐄 Create Customer Account</h3>
                        {(localError || contextError) && (
                            <div className="alert alert-danger">{localError || contextError}</div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Full Name</label>
                                <input type="text" name="name" className="form-control" onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input type="email" name="email" className="form-control" onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Phone Number</label>
                                <input type="tel" name="phone" className="form-control" onChange={handleChange} required />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Address</label>
                                <textarea name="address" className="form-control" rows="2" onChange={handleChange} required></textarea>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <input type="password" name="password" className="form-control" onChange={handleChange} minLength="6" required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Confirm Password</label>
                                <input type="password" name="confirmPassword" className="form-control" onChange={handleChange} minLength="6" required />
                            </div>
                            <button type="submit" className="btn btn-success w-100 mb-3">Register</button>
                        </form>
                        <div className="text-center">
                            <p>Already have an account? <Link to="/login">Login</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;