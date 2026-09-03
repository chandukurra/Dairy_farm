import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';
import EmptyState from '../../components/EmptyState';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomerData();
    }, []);

    const fetchCustomerData = async () => {
        try {
            const [custRes, salesRes] = await Promise.all([
                api.get('/customers'),
                api.get('/milk-sales').catch(() => ({ data: { data: [] } }))
            ]);
            setCustomers(custRes.data.data || custRes.data || []);
            setSales(salesRes.data.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to load customers.');
            setLoading(false);
        }
    };

    // ── Derived metrics ──
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => (c.status || 'ACTIVE').toUpperCase() === 'ACTIVE').length;
    const totalMilkPurchased = sales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
    const totalCustomerRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    // Customer spending lookup
    const customerSpending = {};
    sales.forEach(s => {
        const cId = s.customer?._id || s.customer;
        if (cId) {
            customerSpending[cId] = (customerSpending[cId] || 0) + Number(s.totalAmount || 0);
        }
    });

    // Top customer
    const topCustomer = customers.reduce((top, c) => {
        const spent = customerSpending[c._id] || 0;
        return (!top || spent > top.spent) ? { customer: c, spent } : top;
    }, null);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="CLIENT RELATIONS"
                title="👥 Customer Management"
                subtitle="Manage dairy customers, track purchasing history, and build customer loyalty."
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
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Address</th>
                                        <th>Total Spent</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-4">
                                                <EmptyState icon="👥" message="No customers found." submessage="Customers registered via customer portal will appear here." />
                                            </td>
                                        </tr>
                                    ) : (
                                        customers.map((customer) => (
                                            <tr key={customer._id}>
                                                <td className="text-start ps-3">
                                                    <strong className="text-info">{customer.name}</strong>
                                                </td>
                                                <td>{customer.phone || '—'}</td>
                                                <td className="text-muted">{customer.email || '—'}</td>
                                                <td className="text-start">{customer.address || '—'}</td>
                                                <td className="fw-bold text-success">
                                                    ₹{Number(customerSpending[customer._id] || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                </td>
                                                <td>
                                                    <span className={`status-pill ${(customer.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                                        {customer.status || 'ACTIVE'}
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
                            title="Total Customers"
                            value={totalCustomers}
                            icon="👥"
                            bgColor="bg-blue"
                        />
                        <DashboardCard
                            title="Active Customers"
                            value={activeCustomers}
                            icon="⭐"
                            bgColor="bg-green"
                        />
                        <DashboardCard
                            title="Milk Purchased"
                            value={`${totalMilkPurchased.toFixed(1)} L`}
                            icon="🥛"
                            bgColor="bg-purple"
                        />
                        <DashboardCard
                            title="Total Revenue"
                            value={`₹${totalCustomerRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="💰"
                            bgColor="bg-amber"
                        />
                    </div>
                </div>

                {/* ── Right-Side Customer Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>🤝</span>
                        <strong>Customer Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Top Customer Card */}
                    <div className="insights-card">
                        <div className="section-label">
                            🏆 Top Valued Customer
                            <span>All-time</span>
                        </div>
                        {topCustomer && topCustomer.spent > 0 ? (
                            <>
                                <strong>
                                    {topCustomer.customer.name}
                                    <small> customer</small>
                                </strong>
                                <p style={{ color: '#10B981', fontSize: '.76rem', fontWeight: 600 }}>
                                    ₹{topCustomer.spent.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Total purchases
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                                    Phone: {topCustomer.customer.phone || 'N/A'}
                                </p>
                            </>
                        ) : (
                            <p style={{ color: '#7d9198', fontSize: '.72rem', marginTop: '.4rem' }}>
                                No purchase records recorded yet.
                            </p>
                        )}
                    </div>

                    {/* Recent Customers */}
                    <div className="insights-card">
                        <div className="section-label">
                            ⏱ Recent Registrations
                            <span>Latest</span>
                        </div>
                        <div className="mt-2">
                            {customers.slice(0, 4).map((c) => (
                                <div key={c._id} className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-dark" style={{ fontSize: '.74rem' }}>
                                    <span className="text-light fw-medium">{c.name}</span>
                                    <span className="text-muted">{c.phone ? c.phone.slice(-4) : '—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Smart Business Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Smart Customer Tip"
                        tip="Maintain transparent milk quality and prompt billing to build long-term trust and repeat daily milk subscriptions."
                        footer="♥ Loyal customers build steady dairy revenues!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default CustomerList;
