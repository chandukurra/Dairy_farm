import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';
import EmptyState from '../../components/EmptyState';

const Verifications = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [verifiedCount, setVerifiedCount] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);

    const fetchVerifications = async () => {
        try {
            const res = await api.get('/verifications');
            setVerifications(res.data.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to load verifications');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifications();
    }, []);

    const handleAction = async (id, newStatus) => {
        try {
            await api.put(`/verifications/${id}/verify`, { status: newStatus });
            if (newStatus === 'APPROVED' || newStatus === 'VERIFIED') {
                setVerifiedCount(prev => prev + 1);
            } else {
                setRejectedCount(prev => prev + 1);
            }
            fetchVerifications(); 
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating verification');
        }
    };

    const pendingCount = verifications.length;
    const totalRequests = pendingCount + verifiedCount + rejectedCount;

    // Breakdown of pending types
    const typeMap = {};
    verifications.forEach(v => {
        const t = v.recordType || 'Record';
        typeMap[t] = (typeMap[t] || 0) + 1;
    });

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="AUDIT & COMPLIANCE"
                title="✓ Verification Center"
                subtitle="Review, audit, and approve manager logs, milk production entries, and financial vouchers."
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
                                        <th>Date Submitted</th>
                                        <th>Record Type</th>
                                        <th>Submitted By</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {verifications.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-4">
                                                <EmptyState icon="✓" message="Queue is all clear!" submessage="No pending records await administrative verification at this time." />
                                            </td>
                                        </tr>
                                    ) : (
                                        verifications.map(ticket => (
                                            <tr key={ticket._id}>
                                                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className="badge bg-dark border border-secondary text-cyan">
                                                        {ticket.recordType}
                                                    </span>
                                                </td>
                                                <td className="text-start ps-3">
                                                    <strong className="text-light">{ticket.submittedBy?.name || 'Manager'}</strong>
                                                </td>
                                                <td>
                                                    <span className="status-pill pending">PENDING REVIEW</span>
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-2">
                                                        <button 
                                                            className="btn btn-sm btn-outline-success"
                                                            onClick={() => handleAction(ticket._id, 'APPROVED')}
                                                            style={{ borderRadius: '.5rem', fontWeight: 600 }}
                                                        >
                                                            ✓ Accept
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleAction(ticket._id, 'REJECTED')}
                                                            style={{ borderRadius: '.5rem', fontWeight: 600 }}
                                                        >
                                                            ✕ Reject
                                                        </button>
                                                    </div>
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
                            title="Pending Audit"
                            value={pendingCount}
                            icon="⏳"
                            bgColor="bg-amber"
                        />
                        <DashboardCard
                            title="Approved This Session"
                            value={verifiedCount}
                            icon="✓"
                            bgColor="bg-green"
                        />
                        <DashboardCard
                            title="Rejected"
                            value={rejectedCount}
                            icon="✕"
                            bgColor="bg-rose"
                        />
                        <DashboardCard
                            title="Total Processed"
                            value={totalRequests}
                            icon="📊"
                            bgColor="bg-blue"
                        />
                    </div>
                </div>

                {/* ── Right-Side Verification Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>🛡️</span>
                        <strong>Audit Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Queue Status Card */}
                    <div className="insights-card">
                        <div className="section-label">
                            ⏳ Queue Backlog
                            <span>Live</span>
                        </div>
                        <strong>
                            {pendingCount}
                            <small> pending</small>
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            {pendingCount === 0 ? 'All logs up to date' : 'Items requiring admin sign-off'}
                        </p>
                    </div>

                    {/* Pending Type Breakdown */}
                    <div className="insights-card">
                        <div className="section-label">
                            📑 Pending Types
                            <span>Distribution</span>
                        </div>
                        <div className="mt-2">
                            {Object.keys(typeMap).length === 0 ? (
                                <p style={{ color: '#34d399', fontSize: '.74rem', marginTop: '.3rem' }}>✓ Zero pending items.</p>
                            ) : (
                                Object.entries(typeMap).map(([type, count]) => (
                                    <div key={type} className="d-flex justify-content-between align-items-center mb-1 text-light" style={{ fontSize: '.74rem' }}>
                                        <span>• {type}</span>
                                        <span className="badge bg-amber text-dark fw-bold">{count}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Smart Audit Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Audit Rule of Thumb"
                        tip="Verify morning & evening milk quantities and purchase bills within 24 hours to prevent discrepancy cascades."
                        footer="♥ Accurate auditing ensures clean financials!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default Verifications;