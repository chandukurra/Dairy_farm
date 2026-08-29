import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SaleForm = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    
    const [formData, setFormData] = useState({
        customer: '',
        saleDate: new Date().toISOString().split('T')[0], // Defaults to today
        quantity: '',
        pricePerLitre: ''
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // ✨ THIS IS THE FIX: Fetching from the correct new route
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const res = await api.get('/customers'); 
                setCustomers(res.data?.data || []);
            } catch (err) {
                console.error("🚨 Failed to load customers:", err.response?.data || err.message);
                setError("Failed to load customers.");
            }
        };
        fetchCustomers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Auto-calculate total
    const totalAmount = (Number(formData.quantity || 0) * Number(formData.pricePerLitre || 0)).toFixed(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/milk-sales', formData);
            navigate(-1);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record sale.');
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm border-0 mx-auto" style={{ maxWidth: '600px' }}>
            <div className="card-body p-4">
                <h3 className="mb-4">Record Milk Sale</h3>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* Customer Dropdown */}
                    <div className="mb-3">
                        <label className="form-label">Select Customer *</label>
                        <select 
                            className="form-select" 
                            name="customer" 
                            value={formData.customer} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="">-- Choose Customer --</option>
                            {customers.map(cust => (
                                <option key={cust._id} value={cust._id}>
                                    {cust.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="mb-3">
                        <label className="form-label">Date *</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            name="saleDate" 
                            value={formData.saleDate} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    {/* Quantity & Price Row */}
                    <div className="row mb-4">
                        <div className="col-md-6">
                            <label className="form-label">Quantity (Litres) *</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                name="quantity" 
                                min="0.1" 
                                step="0.1"
                                value={formData.quantity} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Price per Litre (₹) *</label>
                            <input 
                                type="number" 
                                className="form-control" 
                                name="pricePerLitre" 
                                min="1"
                                value={formData.pricePerLitre} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Auto-Calculated Total */}
                    <div className="alert alert-success d-flex justify-content-between align-items-center mb-4">
                        <span className="fw-bold fs-5">Total Amount:</span>
                        <span className="fw-bold fs-4">₹{totalAmount}</span>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-2 fs-5" 
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Sale for Verification'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SaleForm;
