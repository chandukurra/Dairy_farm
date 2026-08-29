import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ExpenseForm = () => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        expenseDate: new Date().toISOString().split('T')[0],
        category: 'FEED',
        description: '',
        amount: '',
        paymentMethod: 'CASH'
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
            await api.post('/expenses', {
                ...formData,
                amount: Number(formData.amount)
            });
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save expense record.');
            setSaving(false);
        }
    };

    return (
        <div className="card shadow-sm max-w-2xl mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-header bg-white">
                <h4 className="mb-0 text-danger">Record Farm Expense</h4>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Date *</label>
                            <input type="date" className="form-control" name="expenseDate" value={formData.expenseDate} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Category *</label>
                            <select className="form-select" name="category" value={formData.category} onChange={handleChange} required>
                                <option value="FEED">Feed</option>
                                <option value="FODDER">Fodder</option>
                                <option value="MEDICINE">Medicine</option>
                                <option value="VACCINATION">Vaccination</option>
                                <option value="SALARY">Salary</option>
                                <option value="ELECTRICITY">Electricity</option>
                                <option value="WATER">Water</option>
                                <option value="TRANSPORTATION">Transportation</option>
                                <option value="EQUIPMENT">Equipment</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="ANIMAL_PURCHASE">Animal Purchase</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description / Reason *</label>
                        <input type="text" className="form-control" name="description" value={formData.description} onChange={handleChange} placeholder="e.g., Bought 50 bags of cow feed" required />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Amount (₹) *</label>
                            <input type="number" step="0.01" min="1" className="form-control" name="amount" value={formData.amount} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Payment Method *</label>
                            <select className="form-select" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required>
                                <option value="CASH">Cash</option>
                                <option value="UPI">UPI / Digital</option>
                                <option value="BANK_TRANSFER">Bank Transfer</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 d-flex gap-2">
                        <button type="submit" className="btn btn-danger w-100" disabled={saving}>
                            {saving ? 'Saving...' : 'Submit Expense for Verification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExpenseForm;