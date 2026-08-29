import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const PaymentForm = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({ customer: '', paymentDate: new Date().toISOString().slice(0, 10), amount: '', paymentMethod: 'CASH', paymentStatus: 'PAID', referenceNumber: '' });
    const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
    useEffect(() => { api.get('/customers').then(({ data }) => setCustomers(data.data || [])).catch(() => setError('Failed to load customers.')); }, []);
    const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
    const submit = async (event) => { event.preventDefault(); setSaving(true); setError(''); try { await api.post('/payments', { ...form, amount: Number(form.amount) }); navigate(-1); } catch (err) { setError(err.response?.data?.message || 'Failed to record payment.'); setSaving(false); } };
    return <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}><div className="card-header bg-white"><h4 className="mb-0">Record Customer Payment</h4></div><div className="card-body">{error && <div className="alert alert-danger">{error}</div>}<form onSubmit={submit}>
        <div className="mb-3"><label className="form-label">Customer</label><select className="form-select" name="customer" value={form.customer} onChange={change} required><option value="">Select a customer</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.name}</option>)}</select></div>
        <div className="row"><div className="col-md-6 mb-3"><label className="form-label">Date</label><input className="form-control" type="date" name="paymentDate" value={form.paymentDate} onChange={change} required /></div><div className="col-md-6 mb-3"><label className="form-label">Amount (₹)</label><input className="form-control" type="number" min="0.01" step="0.01" name="amount" value={form.amount} onChange={change} required /></div></div>
        <div className="row"><div className="col-md-6 mb-3"><label className="form-label">Method</label><select className="form-select" name="paymentMethod" value={form.paymentMethod} onChange={change}><option value="CASH">Cash</option><option value="UPI">UPI</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="OTHER">Other</option></select></div><div className="col-md-6 mb-3"><label className="form-label">Reference</label><input className="form-control" name="referenceNumber" value={form.referenceNumber} onChange={change} /></div></div>
        <button className="btn btn-success w-100" disabled={saving}>{saving ? 'Saving...' : 'Record Payment'}</button>
    </form></div></div>;
};
export default PaymentForm;
