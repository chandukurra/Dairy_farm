import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';
import EmptyState from '../../components/EmptyState';

const PaymentList = () => {
    const { user } = useContext(AuthContext);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const { data } = await api.get('/payments');
            setPayments(data.data || []);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load payments.');
            setLoading(false);
        }
    };

    const verify = async (id, status) => {
        try {
            await api.put(`/payments/${id}/verify`, { status });
            setPayments((items) =>
                items.map((item) => (item._id === id ? { ...item, paymentStatus: status } : item))
            );
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update payment status.');
        }
    };

    const base = user?.role === 'ADMIN' ? '/admin' : '/manager';

    // ── Financial analytics calculations ──
    const totalPaymentsCount = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const pendingPayments = payments.filter((p) => p.paymentStatus === 'PENDING');
    const pendingAmount = pendingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const completedPayments = payments.filter((p) => p.paymentStatus === 'VERIFIED');
    const completedAmount = completedPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Current month revenue
    const currentMonthKey = new Date().toISOString().slice(0, 7);
    const monthlyRevenue = completedPayments
        .filter((p) => p.paymentDate && p.paymentDate.slice(0, 7) === currentMonthKey)
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const completionRate = totalPaymentsCount > 0 ? Math.round((completedPayments.length / totalPaymentsCount) * 100) : 100;

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="FINANCIAL TRANSACTIONS"
                title="💳 Payment Management"
                subtitle="Track customer payments, verify receipts, and monitor farm cash flow."
                actionText="+ Record Payment"
                actionLink={`${base}/payments/new`}
                actionBtnClass="btn-cta-green"
            />

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="module-grid">
                {/* ── Main Panel ── */}
                <div className="module-main-panel">
                    <div className="card glass-table-card shadow-sm">
                        <div className="card-body p-0 table-responsive">
                            <table className="table table-hover mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Customer</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Reference</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-4">
                                                <EmptyState icon="💳" message="No payments recorded yet." submessage="Click '+ Record Payment' to log your first transaction." />
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((payment) => (
                                            <tr key={payment._id}>
                                                <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                                                <td className="text-start ps-3">
                                                    <strong className="text-info">{payment.customer?.name || 'Unknown'}</strong>
                                                </td>
                                                <td className="fw-bold text-success">
                                                    ₹{Number(payment.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </td>
                                                <td>
                                                    <span className="badge bg-dark border border-secondary text-light">
                                                        {(payment.paymentMethod || 'CASH').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="text-muted font-monospace">{payment.referenceNumber || '—'}</td>
                                                <td>
                                                    <span
                                                        className={`status-pill ${
                                                            payment.paymentStatus === 'VERIFIED'
                                                                ? 'verified'
                                                                : payment.paymentStatus === 'REJECTED'
                                                                ? 'rejected'
                                                                : 'pending'
                                                        }`}
                                                    >
                                                        {payment.paymentStatus}
                                                    </span>
                                                </td>
                                                <td>
                                                    {payment.paymentStatus === 'PENDING' ? (
                                                        <div className="d-flex justify-content-center gap-1">
                                                            <button
                                                                className="btn btn-sm btn-outline-success"
                                                                onClick={() => verify(payment._id, 'VERIFIED')}
                                                                title="Verify Payment"
                                                            >
                                                                ✓ Verify
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-danger"
                                                                onClick={() => verify(payment._id, 'REJECTED')}
                                                                title="Reject Payment"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted" style={{ fontSize: '.75rem' }}>Completed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Statistics Cards */}
                    <div className="production-summary row mt-3">
                        <DashboardCard
                            title="Total Received"
                            value={`₹${totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="💰"
                            bgColor="bg-blue"
                        />
                        <DashboardCard
                            title="Pending Amount"
                            value={`₹${pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="⏳"
                            bgColor="bg-amber"
                        />
                        <DashboardCard
                            title="Verified Amount"
                            value={`₹${completedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="✅"
                            bgColor="bg-green"
                        />
                        <DashboardCard
                            title="Monthly Revenue"
                            value={`₹${monthlyRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="📈"
                            bgColor="bg-purple"
                        />
                    </div>
                </div>

                {/* ── Right-Side Payment Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>💵</span>
                        <strong>Payment Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Completion Rate Card */}
                    <div className="insights-card">
                        <div className="section-label">
                            📊 Clearance Rate
                            <span>Live</span>
                        </div>
                        <strong>
                            {completionRate}%
                            <small> verified</small>
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            {completedPayments.length} of {totalPaymentsCount} transactions settled
                        </p>
                        <div className="insights-split">
                            <div>
                                <span>⏳ Pending</span>
                                <b>{pendingPayments.length}</b>
                            </div>
                            <div>
                                <span>✅ Verified</span>
                                <b>{completedPayments.length}</b>
                            </div>
                        </div>
                    </div>

                    {/* Pending Amount Alert */}
                    <div className="insights-card">
                        <div className="section-label">
                            ⚠️ Pending Settlement
                            <span>Action needed</span>
                        </div>
                        <strong style={{ color: pendingAmount > 0 ? '#fbbf24' : '#34d399', fontSize: '1.4rem' }}>
                            ₹{pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            {pendingPayments.length} payments await verification
                        </p>
                    </div>

                    {/* Smart Financial Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Smart Financial Tip"
                        tip="Reconcile online UPI and cash receipts daily to ensure clean accounts and prompt milk supply deliveries."
                        footer="♥ Clear transactions, hassle-free operations!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default PaymentList;
