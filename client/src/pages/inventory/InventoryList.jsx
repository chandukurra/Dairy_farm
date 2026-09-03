import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';
import EmptyState from '../../components/EmptyState';

const InventoryList = () => {
    const { user } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    useEffect(() => {
        fetchInventory(showLowStockOnly);
    }, [showLowStockOnly]);

    const fetchInventory = async (lowStock) => {
        setLoading(true);
        try {
            const endpoint = lowStock ? '/inventory?lowStock=true' : '/inventory';
            const res = await api.get(endpoint);
            setInventory(res.data.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to load inventory.');
            setLoading(false);
        }
    };

    const getBaseRoute = () => user?.role === 'ADMIN' ? '/admin' : '/manager';

    // ── Inventory metrics ──
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter((i) => i.isLowStock || Number(i.currentQuantity) <= Number(i.minimumStock));
    const lowStockCount = lowStockItems.length;
    const totalValue = inventory.reduce((sum, i) => sum + (Number(i.currentQuantity || 0) * Number(i.price || 0)), 0);
    const healthyStockCount = totalItems - lowStockCount;

    if (loading && inventory.length === 0) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="SUPPLY & LOGISTICS"
                title="📦 Inventory Management"
                subtitle="Monitor farm supplies, feed stock levels, medicine inventory, and item consumption."
                actionText="+ Add Item"
                actionLink={`${getBaseRoute()}/inventory/new`}
                actionBtnClass="btn-cta-green"
            >
                <button
                    type="button"
                    className={`btn ${showLowStockOnly ? 'btn-danger' : 'btn-outline-danger'}`}
                    onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                    style={{ borderRadius: '.65rem', padding: '.7rem 1rem', fontWeight: 600 }}
                >
                    {showLowStockOnly ? 'Show All Items' : '⚠️ Low Stock Filter'}
                </button>
                <Link
                    to={`${getBaseRoute()}/inventory/transaction`}
                    className="btn btn-outline-warning"
                    style={{ borderRadius: '.65rem', padding: '.7rem 1rem', fontWeight: 600 }}
                >
                    ⚡ Log Usage / Purchase
                </Link>
            </DashboardHero>

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="module-grid">
                {/* ── Main Panel ── */}
                <div className="module-main-panel">
                    <div className="card glass-table-card shadow-sm">
                        <div className="card-body p-0 table-responsive">
                            <table className="table table-hover mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Category</th>
                                        <th>Current Stock</th>
                                        <th>Min. Stock</th>
                                        <th>Unit Price</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventory.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-4">
                                                <EmptyState icon="📦" message="No inventory supplies found." submessage="Click '+ Add Item' to register fodder, medicine, or supplies." />
                                            </td>
                                        </tr>
                                    ) : (
                                        inventory.map((item) => (
                                            <tr key={item._id}>
                                                <td className="text-start ps-3">
                                                    <strong className="text-light">{item.itemName}</strong>
                                                </td>
                                                <td>
                                                    <span className="badge bg-dark border border-secondary text-info">
                                                        {item.category}
                                                    </span>
                                                </td>
                                                <td className="fw-bold">
                                                    <span className={item.isLowStock ? 'text-danger' : 'text-success'}>
                                                        {item.currentQuantity} {item.unit}
                                                    </span>
                                                    {item.isLowStock && (
                                                        <span className="ms-2 badge bg-danger text-light" style={{ fontSize: '.62rem' }}>
                                                            LOW
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-muted">{item.minimumStock} {item.unit}</td>
                                                <td>₹{Number(item.price || 0).toFixed(2)}</td>
                                                <td>
                                                    <span
                                                        className={`status-pill ${
                                                            item.isLowStock
                                                                ? 'low'
                                                                : item.status === 'AVAILABLE'
                                                                ? 'active'
                                                                : 'warning'
                                                        }`}
                                                    >
                                                        {item.isLowStock ? 'LOW STOCK' : item.status || 'AVAILABLE'}
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
                            title="Total Items"
                            value={totalItems}
                            icon="📦"
                            bgColor="bg-blue"
                        />
                        <DashboardCard
                            title="Low Stock Alerts"
                            value={lowStockCount}
                            icon="⚠️"
                            bgColor={lowStockCount > 0 ? 'bg-rose' : 'bg-green'}
                        />
                        <DashboardCard
                            title="Inventory Valuation"
                            value={`₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="💰"
                            bgColor="bg-purple"
                        />
                        <DashboardCard
                            title="Healthy Supplies"
                            value={healthyStockCount}
                            icon="📈"
                            bgColor="bg-green"
                        />
                    </div>
                </div>

                {/* ── Right-Side Inventory Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>📦</span>
                        <strong>Inventory Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Low Stock Alert Box */}
                    <div className="insights-card">
                        <div className="section-label">
                            ⚠️ Reorder Recommendations
                            <span>Urgent</span>
                        </div>
                        {lowStockItems.length === 0 ? (
                            <p style={{ color: '#34d399', fontSize: '.76rem', marginTop: '.4rem', fontWeight: 600 }}>
                                ✓ All stock levels are sufficient!
                            </p>
                        ) : (
                            <div className="mt-2">
                                {lowStockItems.slice(0, 3).map((item) => (
                                    <div key={item._id} className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-dark" style={{ fontSize: '.74rem' }}>
                                        <span className="text-light">{item.itemName}</span>
                                        <span className="badge bg-danger">
                                            {item.currentQuantity} / {item.minimumStock} {item.unit}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stock Overview */}
                    <div className="insights-card">
                        <div className="section-label">
                            📊 Supply Health
                            <span>Summary</span>
                        </div>
                        <strong>
                            {totalItems > 0 ? `${Math.round((healthyStockCount / totalItems) * 100)}%` : '100%'}
                            <small> optimal</small>
                        </strong>
                        <div className="insights-split">
                            <div>
                                <span>🟢 Normal</span>
                                <b>{healthyStockCount}</b>
                            </div>
                            <div>
                                <span>🔴 Reorder</span>
                                <b>{lowStockCount}</b>
                            </div>
                        </div>
                    </div>

                    {/* Smart Inventory Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Inventory Best Practice"
                        tip="Store dry feed and cattle supplements in elevated, moisture-proof zones to prevent spoilage and fungal contamination."
                        footer="♥ Fresh feed keeps cattle productive!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default InventoryList;