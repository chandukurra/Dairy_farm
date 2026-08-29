import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MilkForm = () => {
    const navigate = useNavigate();
    const [animals, setAnimals] = useState([]);
    
    const [formData, setFormData] = useState({
        animal: '',
        productionDate: new Date().toISOString().split('T')[0], // Today's date default
        morningQuantity: 0,
        eveningQuantity: 0
    });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch ONLY active animals (dead/sold/inactive cannot produce milk)
        const fetchActiveAnimals = async () => {
            try {
                const res = await api.get('/animals?status=ACTIVE');
                // Optional: Filter out males as well
                const femaleAnimals = res.data.data.filter(a => a.gender === 'FEMALE');
                setAnimals(femaleAnimals);
                setLoading(false);
            } catch (err) {
                setError('Failed to load animals.');
                setLoading(false);
            }
        };
        fetchActiveAnimals();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            await api.post('/milk-production', {
                animal: formData.animal,
                productionDate: formData.productionDate,
                morningQuantity: Number(formData.morningQuantity),
                eveningQuantity: Number(formData.eveningQuantity)
            });
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save milk record. Ensure there is no duplicate for today.');
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    const total = Number(formData.morningQuantity) + Number(formData.eveningQuantity);

    return (
        <div className="card shadow-sm max-w-2xl mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-header bg-white">
                <h4 className="mb-0">Log Daily Milk</h4>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Select Animal *</label>
                        <select className="form-select" name="animal" value={formData.animal} onChange={handleChange} required>
                            <option value="">-- Choose Animal --</option>
                            {animals.map(a => (
                                <option key={a._id} value={a._id}>{a.animalCode} - {a.species}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="mb-3">
                        <label className="form-label">Date *</label>
                        <input type="date" className="form-control" name="productionDate" value={formData.productionDate} onChange={handleChange} required />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Morning Yield (Litres)</label>
                            <input type="number" step="0.1" min="0" className="form-control" name="morningQuantity" value={formData.morningQuantity} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Evening Yield (Litres)</label>
                            <input type="number" step="0.1" min="0" className="form-control" name="eveningQuantity" value={formData.eveningQuantity} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="alert alert-info d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Calculated Total:</h5>
                        <h4 className="mb-0 fw-bold">{total.toFixed(1)} L</h4>
                    </div>

                    <div className="mt-4 d-flex gap-2">
                        <button type="submit" className="btn btn-primary w-100" disabled={saving || !formData.animal}>
                            {saving ? 'Saving...' : 'Submit for Verification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MilkForm;