import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const AnimalForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        animalCode: '',
        name: '',
        species: 'COW',
        breed: '',
        gender: 'FEMALE',
        healthStatus: 'HEALTHY',
        status: 'ACTIVE',
        purchaseCost: '',
        weight: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            fetchAnimal();
        }
    }, [id]);

    const fetchAnimal = async () => {
        try {
            const res = await api.get(`/animals/${id}`);
            const data = res.data.data;
            // Decimal128 handling: check if purchaseCost is an object
            const cost = data.purchaseCost?.$numberDecimal || data.purchaseCost || '';
            setFormData({ ...data, purchaseCost: cost });
            setLoading(false);
        } catch (err) {
            setError('Failed to load animal data');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Use FormData for file uploads
        const uploadData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                uploadData.append(key, formData[key]);
            }
        });
        
        if (imageFile) {
            uploadData.append('image', imageFile);
        }

        try {
            // Override the default application/json header for this specific request
            const config = { headers: { 'Content-Type': 'multipart/form-data' } };

            if (isEditMode) {
                await api.put(`/animals/${id}`, uploadData, config);
            } else {
                await api.post('/animals', uploadData, config);
            }
            
            // Go back to previous page
            navigate(-1); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save animal');
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="card shadow-sm max-w-2xl mx-auto">
            <div className="card-header bg-white">
                <h4 className="mb-0">{isEditMode ? 'Edit Animal' : 'Add New Animal'}</h4>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Animal Code *</label>
                            <input type="text" className="form-control" name="animalCode" value={formData.animalCode} onChange={handleChange} required disabled={isEditMode} placeholder="e.g., C001" />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Species *</label>
                            <select className="form-select" name="species" value={formData.species} onChange={handleChange}>
                                <option value="COW">Cow</option>
                                <option value="BUFFALO">Buffalo</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Name / Alias (Optional)</label>
                            <input type="text" className="form-control" name="name" value={formData.name || ''} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Gender *</label>
                            <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="FEMALE">Female</option>
                                <option value="MALE">Male</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Health Status</label>
                            <select className="form-select" name="healthStatus" value={formData.healthStatus} onChange={handleChange}>
                                <option value="HEALTHY">Healthy</option>
                                <option value="SICK">Sick</option>
                                <option value="UNDER_TREATMENT">Under Treatment</option>
                                <option value="PREGNANT">Pregnant</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Farm Status</label>
                            <select className="form-select" name="status" value={formData.status} onChange={handleChange}>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="SOLD">Sold</option>
                                <option value="DEAD">Dead</option>
                                <option value="TRANSFERRED">Transferred</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Purchase Cost (₹)</label>
                            <input type="number" step="0.01" className="form-control" name="purchaseCost" value={formData.purchaseCost} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Animal Photo</label>
                            <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                            <small className="text-muted">Max size: 5MB</small>
                        </div>
                    </div>
                    <div className="mt-4 d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Animal'}
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AnimalForm;