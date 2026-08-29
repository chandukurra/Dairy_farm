import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const InventoryTransactionForm = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        item: '',
        transactionType: 'USAGE',
        quantity: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await api.get('/inventory');
                setItems(res.data.data);
            } catch (err) {
                setError('Failed to load inventory items.');
            }
        };
        fetchItems();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await api.post('/inventory-transactions', {
                ...formData,
                quantity: Number(formData.quantity)
            });
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit transaction.');
            setSaving(false);
        }
    };

    const selectedItem = items.find(i => i._id === formData.item);

    return (
        <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-header bg-white"><h4 className="mb-0">Log Stock Transaction</h4></div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Select Item *</label>
                        <select className="form-select" name="item" value={formData.item} onChange={handleChange} required>
                            <option value="">-- Choose Item --</option>
                            {items.map(i => (
                                <option key={i._id} value={i._id}>{i.itemName} (Current Stock: {i.currentQuantity} {i.unit})</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Transaction Type *</label>
                            <select className="form-select" name="transactionType" value={formData.transactionType} onChange={handleChange}>
                                <option value="USAGE">Usage (Consume Stock)</option>
                                <option value="PURCHASE">Purchase (Add to Stock)</option>
                                <option value="ADJUSTMENT">Adjustment</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Date *</label>
                            <input type="date" className="form-control" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Quantity ({selectedItem?.unit || 'Units'}) *</label>
                        <input type="number" step="0.01" min="0.01" className="form-control" name="quantity" value={formData.quantity} onChange={handleChange} required />
                        {formData.transactionType === 'USAGE' && selectedItem && (
                            <small className="text-warning">This will deduct from current stock after verification.</small>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Reason / Description *</label>
                        <input type="text" className="form-control" name="description" value={formData.description} onChange={handleChange} placeholder="e.g., Daily cow feed usage" required />
                    </div>

                    <button type="submit" className="btn btn-warning w-100 mt-3" disabled={saving || !formData.item}>
                        {saving ? 'Submitting...' : 'Submit for Verification'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InventoryTransactionForm;