import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CustomerPaymentForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ paymentDate: new Date().toISOString().slice(0, 10), amount: '', paymentMethod: 'UPI', referenceNumber: '' });
    const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
    const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
    const submit = async (event) => { event.preventDefault(); setSaving(true); setError(''); try { await api.post('/payments', { ...form, amount: Number(form.amount) }); navigate('/customer/payments'); } catch (err) { setError(err.response?.data?.message || 'Could not submit payment.'); setSaving(false); } };
    return <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}><div className="card-header bg-white"><h4 className="mb-0">Submit a Payment</h4></div><div className="card-body"><p className="text-muted">Your farm manager will verify this payment after checking the reference number.</p>{error && <div className="alert alert-danger">{error}</div>}<form onSubmit={submit}>
        <div className="row"><div className="col-md-6 mb-3"><label className="form-label">Payment Date</label><input className="form-control" type="date" name="paymentDate" value={form.paymentDate} onChange={change} required /></div><div className="col-md-6 mb-3"><label className="form-label">Amount (₹)</label><input className="form-control" type="number" min="0.01" step="0.01" name="amount" value={form.amount} onChange={change} required /></div></div>
        <div className="mb-3"><label className="form-label">Payment Method</label><select className="form-select" name="paymentMethod" value={form.paymentMethod} onChange={change}><option value="UPI">UPI</option><option value="BANK_TRANSFER">Bank Transfer</option><option value="CASH">Cash</option><option value="OTHER">Other</option></select></div>
        <div className="mb-3"><label className="form-label">Transaction / Payment Reference</label><input className="form-control" name="referenceNumber" value={form.referenceNumber} onChange={change} placeholder="e.g. UPI transaction ID" required /></div>
        <button className="btn btn-primary w-100" disabled={saving}>{saving ? 'Submitting...' : 'Submit for Verification'}</button>
    </form></div></div>;
};
export default CustomerPaymentForm;
