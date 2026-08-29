import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const UserForm = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        address: '',
        role: 'FARM_MANAGER' // Hardcoded as this is primarily for creating staff
    });
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            // Note: You must ensure you have a POST /api/users endpoint in your backend 
            // protected by authorize('ADMIN') that accepts this payload.
            await api.post('/users', formData);
            navigate('/admin/users');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create staff account.');
            setSaving(false);
        }
    };

    return (
        <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-header bg-white">
                <h4 className="mb-0 text-primary">Create Farm Manager Account</h4>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Full Name *</label>
                        <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Email Address *</label>
                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Phone Number *</label>
                            <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Residential Address *</label>
                        <textarea className="form-control" name="address" rows="2" value={formData.address} onChange={handleChange} required></textarea>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Temporary Password *</label>
                        <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} minLength="6" required />
                        <small className="text-muted">The manager should change this after their first login.</small>
                    </div>

                    <div className="mt-4 d-flex gap-2">
                        <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                            {saving ? 'Creating...' : 'Create Manager Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;