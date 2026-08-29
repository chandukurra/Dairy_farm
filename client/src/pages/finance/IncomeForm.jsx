import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const IncomeForm = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ incomeDate: new Date().toISOString().slice(0, 10), category: 'MANURE_SALES', description: '', amount: '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
    const submit = async (event) => {
        event.preventDefault(); setSaving(true); setError('');
        try { await api.post('/income', { ...form, amount: Number(form.amount) }); navigate(-1); }
        catch (err) { setError(err.response?.data?.message || 'Failed to save income.'); setSaving(false); }
    };
    return <div className="card shadow-sm mx-auto" style={{ maxWidth: '600px' }}><div className="card-header bg-white"><h4 className="mb-0">Record Other Income</h4></div><div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}<form onSubmit={submit}>
            <div className="row"><div className="col-md-6 mb-3"><label className="form-label">Date</label><input className="form-control" type="date" name="incomeDate" value={form.incomeDate} onChange={change} required /></div>
            <div className="col-md-6 mb-3"><label className="form-label">Category</label><select className="form-select" name="category" value={form.category} onChange={change}><option value="MANURE_SALES">Manure Sales</option><option value="ANIMAL_SALES">Animal Sales</option><option value="OTHER">Other</option></select></div></div>
            <div className="mb-3"><label className="form-label">Description</label><input className="form-control" name="description" value={form.description} onChange={change} required /></div>
            <div className="mb-3"><label className="form-label">Amount (₹)</label><input className="form-control" type="number" min="0.01" step="0.01" name="amount" value={form.amount} onChange={change} required /></div>
            <button className="btn btn-success w-100" disabled={saving}>{saving ? 'Submitting...' : 'Submit for Verification'}</button>
        </form></div></div>;
};
export default IncomeForm;
