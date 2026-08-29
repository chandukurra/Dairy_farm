import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const PaymentList = () => {
    const { user } = useContext(AuthContext);
    const [payments, setPayments] = useState([]); const [error, setError] = useState('');
    useEffect(() => { api.get('/payments').then(({ data }) => setPayments(data.data || [])).catch((err) => setError(err.response?.data?.message || 'Failed to load payments.')); }, []);
    const verify = async (id, status) => { try { await api.put(`/payments/${id}/verify`, { status }); setPayments((items) => items.map((item) => item._id === id ? { ...item, paymentStatus: status } : item)); } catch (err) { setError(err.response?.data?.message || 'Could not update payment status.'); } };
    const base = user?.role === 'ADMIN' ? '/admin' : '/manager';
    return <div><div className="d-flex justify-content-between align-items-center mb-4"><h2>Customer Payments</h2><Link to={`${base}/payments/new`} className="btn btn-success">+ Record Payment</Link></div>{error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm table-responsive"><table className="table table-hover mb-0"><thead className="table-dark"><tr><th>Date</th><th>Customer</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th><th>Action</th></tr></thead><tbody>
        {payments.length === 0 ? <tr><td colSpan="7" className="text-center py-4">No payments recorded.</td></tr> : payments.map((payment) => <tr key={payment._id}><td>{new Date(payment.paymentDate).toLocaleDateString()}</td><td>{payment.customer?.name || 'Unknown'}</td><td>₹{Number(payment.amount || 0).toFixed(2)}</td><td>{payment.paymentMethod.replace('_', ' ')}</td><td><span className={`badge ${payment.paymentStatus === 'VERIFIED' ? 'bg-success' : payment.paymentStatus === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`}>{payment.paymentStatus}</span></td><td>{payment.referenceNumber || '—'}</td><td>{payment.paymentStatus === 'PENDING' ? <><button className="btn btn-sm btn-success me-1" onClick={() => verify(payment._id, 'VERIFIED')}>Verify</button><button className="btn btn-sm btn-outline-danger" onClick={() => verify(payment._id, 'REJECTED')}>Reject</button></> : '—'}</td></tr>)}
        </tbody></table></div></div>;
};
export default PaymentList;
