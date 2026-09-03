import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import farmHero from '../../assets/dairy-login-background.png';
import DashboardCard from '../../components/DashboardCard';
import SalesInsights from '../../components/SalesInsights';

const SaleList = () => {
    const { user } = useContext(AuthContext);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await api.get('/milk-sales');
            setSales(res.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load sales records.');
            setLoading(false);
        }
    };

    const getBaseRoute = () => user?.role === 'ADMIN' ? '/admin' : '/manager';

    // ── Derived analytics (client-side, no extra API calls) ──────────────────
    const today = new Date().toLocaleDateString('en-CA');

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const todayRevenue = sales
        .filter(s => s.saleDate && new Date(s.saleDate).toLocaleDateString('en-CA') === today)
        .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const totalQty = sales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);

    const avgPrice = totalQty > 0 ? (totalRevenue / totalQty) : 0;
    // ─────────────────────────────────────────────────────────────────────────

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="sales-page">
            {/* ── Hero Banner ── */}
            <section className="milk-hero mb-4" style={{ backgroundImage: `url(${farmHero})` }}>
                <div className="milk-hero-content">
                    <span className="eyebrow">REVENUE OPERATIONS</span>
                    <h2>💰 Milk Sales Log</h2>
                    <p>Track and manage all milk sales, customer purchases, and revenue.</p>
                </div>
                <Link to={`${getBaseRoute()}/sales/new`} className="btn btn-sales-cta">
                    + Record Sale
                </Link>
            </section>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* ── Two-column grid ── */}
            <div className="milk-grid sales-grid">
                {/* ── LEFT: Main panel ── */}
                <div className="milk-main-panel sales-main-panel">

                    {/* Sales table */}
                    <div className="card milk-records-card sales-records-card shadow-sm">
                        <div className="card-body p-0 table-responsive">
                            <table className="table table-hover mb-0 text-center align-middle">
                                <thead className="table-dark">
                                    <tr>
                                        <th>📅 Date</th>
                                        <th>👤 Customer</th>
                                        <th>🥛 Qty (L)</th>
                                        <th>💲 Price/L (₹)</th>
                                        <th>💰 Total (₹)</th>
                                        <th>🏷 Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-5" style={{ color: '#7d9198' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🛒</div>
                                                No sales records found. Record your first sale!
                                            </td>
                                        </tr>
                                    ) : (
                                        sales.map((sale) => (
                                            <tr key={sale._id}>
                                                <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                                                <td className="sale-customer-name">
                                                    <strong>{sale.customer?.name || 'Unknown'}</strong>
                                                </td>
                                                <td className="sale-qty-value">{Number(sale.quantity).toFixed(1)}</td>
                                                <td>₹{sale.pricePerLitre}</td>
                                                <td className="sale-revenue-value fw-bold">
                                                    ₹{Number(sale.totalAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </td>
                                                <td>
                                                    <span className={`badge status-badge ${
                                                        sale.status === 'VERIFIED'  ? 'bg-success' :
                                                        sale.status === 'REJECTED'  ? 'bg-danger'  : 'bg-warning text-dark'
                                                    }`}>
                                                        {sale.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* ── Analytics stat cards ── */}
                    <div className="production-summary row mt-3">
                        <DashboardCard
                            title="Total Revenue"
                            value={`₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="💳"
                            bgColor="bg-primary"
                        />
                        <DashboardCard
                            title="Today's Revenue"
                            value={`₹${todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="📈"
                            bgColor="bg-success"
                        />
                        <DashboardCard
                            title="Total Qty Sold"
                            value={`${totalQty.toFixed(1)} L`}
                            icon="🥛"
                            bgColor="bg-purple"
                        />
                        <DashboardCard
                            title="Avg. Selling Price"
                            value={`₹${avgPrice.toFixed(1)}/L`}
                            icon="🏷"
                            bgColor="bg-gold"
                        />
                    </div>

                </div>

                {/* ── RIGHT: Smart Sales Insights panel ── */}
                <SalesInsights sales={sales} />
            </div>
        </div>
    );
};

export default SaleList;
