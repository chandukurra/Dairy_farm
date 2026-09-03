import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';
import EmptyState from '../../components/EmptyState';

const IncomeList = () => {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/income')
            .then(({ data }) => {
                setRecords(data.data || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Failed to load income records.');
                setLoading(false);
            });
    }, []);

    const base = user?.role === 'ADMIN' ? '/admin' : '/manager';

    // ── Income metrics ──
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonthStr = new Date().toISOString().slice(0, 7);

    const totalIncome = records.reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const todayIncome = records
        .filter((r) => r.incomeDate && r.incomeDate.slice(0, 10) === todayStr)
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);
    const monthlyIncome = records
        .filter((r) => r.incomeDate && r.incomeDate.slice(0, 7) === currentMonthStr)
        .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // Categories
    const categoryTotals = {};
    records.forEach((r) => {
        const cat = (r.category || 'OTHER').replace('_', ' ');
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(r.amount || 0);
    });

    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topSource = topCategoryEntry ? topCategoryEntry[0] : 'None';
    const topSourceAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="SUPPLEMENTARY REVENUE"
                title="💰 Other Income"
                subtitle="Track additional revenue streams such as manure sales, bio-fertilizer, and livestock leasing."
                actionText="+ Add Income"
                actionLink={`${base}/income/new`}
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
                                        <th>Category</th>
                                        <th>Description</th>
                                        <th>Amount (₹)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-4">
                                                <EmptyState icon="💰" message="No supplementary income records found." submessage="Click '+ Add Income' to log by-product or manure sales." />
                                            </td>
                                        </tr>
                                    ) : (
                                        records.map((record) => (
                                            <tr key={record._id}>
                                                <td>{new Date(record.incomeDate).toLocaleDateString()}</td>
                                                <td>
                                                    <span className="badge bg-dark border border-secondary text-info">
                                                        {(record.category || 'OTHER').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="text-start ps-3">{record.description || '—'}</td>
                                                <td className="fw-bold text-success">
                                                    ₹{Number(record.amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`status-pill ${
                                                            record.verificationStatus === 'VERIFIED'
                                                                ? 'verified'
                                                                : record.verificationStatus === 'REJECTED'
                                                                ? 'rejected'
                                                                : 'pending'
                                                        }`}
                                                    >
                                                        {record.verificationStatus || 'PENDING'}
                                                    </span>
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
                            title="Total Other Income"
                            value={`₹${totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="💰"
                            bgColor="bg-blue"
                        />
                        <DashboardCard
                            title="Today's Income"
                            value={`₹${todayIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="📅"
                            bgColor="bg-green"
                        />
                        <DashboardCard
                            title="Monthly Extra"
                            value={`₹${monthlyIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="📈"
                            bgColor="bg-purple"
                        />
                        <DashboardCard
                            title="Top Income Source"
                            value={topSource}
                            icon="🏆"
                            bgColor="bg-gold"
                        />
                    </div>
                </div>

                {/* ── Right-Side Income Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>🌱</span>
                        <strong>Income Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Top Income Category Card */}
                    <div className="insights-card">
                        <div className="section-label">
                            🏆 Top Revenue Channel
                            <span>Primary</span>
                        </div>
                        <strong>
                            {topSource}
                            <small> source</small>
                        </strong>
                        <p style={{ color: '#34d399', fontSize: '.76rem', fontWeight: 600 }}>
                            ₹{topSourceAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} earned
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            {totalIncome > 0 ? `${Math.round((topSourceAmount / totalIncome) * 100)}%` : '0%'} of non-milk farm earnings
                        </p>
                    </div>

                    {/* Source Breakdown */}
                    <div className="insights-card">
                        <div className="section-label">
                            📊 Stream Distribution
                            <span>All-time</span>
                        </div>
                        <div className="mt-2">
                            {Object.entries(categoryTotals).map(([source, amt]) => (
                                <div key={source} className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-dark" style={{ fontSize: '.74rem' }}>
                                    <span className="text-light">{source}</span>
                                    <span className="text-success fw-semibold">₹{amt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Smart Business Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Agri-Business Tip"
                        tip="Convert cow dung into packaged vermicompost or bio-gas slurry to generate an extra 10-15% monthly net profit with zero added cattle."
                        footer="♥ Turn farm by-products into gold!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default IncomeList;
