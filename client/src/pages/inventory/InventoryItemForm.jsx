import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const InventoryItemForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        itemName: '',
        category: 'COW_FEED',
        unit: 'KG',
        minimumStock: 10,
        price: 0
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
            await api.post('/inventory', {
                ...formData,
                minimumStock: Number(formData.minimumStock),
                price: Number(formData.price)
            });
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create item.');
            setSaving(false);
        }
    };

    return (
        <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-header bg-white"><h4 className="mb-0">Add New Inventory Item</h4></div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Item Name *</label>
                        <input type="text" className="form-control" name="itemName" value={formData.itemName} onChange={handleChange} required />
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Category *</label>
                            <select className="form-select" name="category" value={formData.category} onChange={handleChange}>
                                <option value="COW_FEED">Cow Feed</option>
                                <option value="BUFFALO_FEED">Buffalo Feed</option>
                                <option value="FODDER">Fodder</option>
                                <option value="MEDICINE">Medicine</option>
                                <option value="VACCINE">Vaccine</option>
                                <option value="EQUIPMENT">Equipment</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Unit of Measurement *</label>
                            <select className="form-select" name="unit" value={formData.unit} onChange={handleChange}>
                                <option value="KG">Kilograms (KG)</option>
                                <option value="LITRE">Litres</option>
                                <option value="PIECE">Pieces</option>
                                <option value="BOTTLE">Bottles</option>
                            </select>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Minimum Stock Alert Level</label>
                            <input type="number" className="form-control" name="minimumStock" value={formData.minimumStock} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Estimated Price per Unit (₹)</label>
                            <input type="number" step="0.01" className="form-control" name="price" value={formData.price} onChange={handleChange} />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 mt-3" disabled={saving}>
                        {saving ? 'Saving...' : 'Create Item'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InventoryItemForm;