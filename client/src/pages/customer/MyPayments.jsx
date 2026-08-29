import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const MyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => { api.get('/payments').then(({ data }) => setPayments(data.data || [])).catch(() => setError('Failed to load your payment history.')).finally(() => setLoading(false)); }, []);
    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;
    return <div><div className="d-flex justify-content-between align-items-center mb-4"><h2>My Payment History</h2><Link to="/customer/payments/new" className="btn btn-primary">+ Submit Payment</Link></div>
        <div className="card shadow-sm table-responsive"><table className="table table-hover mb-0"><thead className="table-dark"><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th><th>Verification</th></tr></thead><tbody>
        {payments.length === 0 ? <tr><td colSpan="5" className="text-center py-4">No payments recorded yet.</td></tr> : payments.map((payment) => <tr key={payment._id}><td>{new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}</td><td className="text-success fw-bold">₹{Number(payment.amount || 0).toFixed(2)}</td><td>{payment.paymentMethod.replace('_', ' ')}</td><td>{payment.referenceNumber || '—'}</td><td><span className={`badge ${payment.paymentStatus === 'VERIFIED' ? 'bg-success' : payment.paymentStatus === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`}>{payment.paymentStatus}</span></td></tr>)}
        </tbody></table></div></div>;
};
export default MyPayments;
