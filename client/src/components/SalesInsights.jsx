const SalesInsights = ({ sales = [] }) => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

    // --- Derived analytics from existing sales data ---
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    const todaySales = sales.filter(s => {
        const d = s.saleDate ? new Date(s.saleDate).toLocaleDateString('en-CA') : '';
        return d === today;
    });
    const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);

    // Percentage change: today vs yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toLocaleDateString('en-CA');
    const yRevenue = sales
        .filter(s => s.saleDate && new Date(s.saleDate).toLocaleDateString('en-CA') === yStr)
        .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
    const pctChange = yRevenue > 0 ? (((todayRevenue - yRevenue) / yRevenue) * 100).toFixed(1) : null;

    // Last 7 days bar chart
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toLocaleDateString('en-CA');
        const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const total = sales
            .filter(s => s.saleDate && new Date(s.saleDate).toLocaleDateString('en-CA') === key)
            .reduce((sum, s) => sum + Number(s.totalAmount || 0), 0);
        return { label, total };
    });
    const maxBar = Math.max(...last7.map(d => d.total), 1);

    // Top customer
    const customerMap = {};
    sales.forEach(s => {
        const name = s.customer?.name || 'Unknown';
        if (!customerMap[name]) customerMap[name] = { qty: 0, revenue: 0 };
        customerMap[name].qty += Number(s.quantity || 0);
        customerMap[name].revenue += Number(s.totalAmount || 0);
    });
    const topCustomerEntry = Object.entries(customerMap).sort((a, b) => b[1].revenue - a[1].revenue)[0];
    const topCustomer = topCustomerEntry
        ? { name: topCustomerEntry[0], ...topCustomerEntry[1] }
        : null;

    return (
        <aside className="sales-insights dashboard-insights">
            {/* Panel Header */}
            <div className="insights-title">
                <span>💹</span>
                <strong>Smart Sales Insights</strong>
                <span>⋮</span>
            </div>

            {/* Today's Revenue Card */}
            <div className="sales-today-card">
                <div className="section-label">
                    💰 Today&apos;s Revenue
                    <span>Live</span>
                </div>
                <strong>
                    ₹{todayRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    <small> today</small>
                </strong>
                {pctChange !== null ? (
                    <p className={Number(pctChange) >= 0 ? 'trend-up' : 'trend-down'}>
                        {Number(pctChange) >= 0 ? '▲' : '▼'} {Math.abs(pctChange)}% vs yesterday
                    </p>
                ) : (
                    <p style={{ color: '#91a5ae', fontSize: '.68rem' }}>No data from yesterday</p>
                )}
                <div className="revenue-split">
                    <div>
                        <span>📦 Total Orders</span>
                        <b>{todaySales.length}</b>
                    </div>
                    <div>
                        <span>🥛 Qty Sold</span>
                        <b>{todaySales.reduce((s, r) => s + Number(r.quantity || 0), 0).toFixed(1)} L</b>
                    </div>
                </div>
            </div>

            {/* Last 7 Days Bar Chart */}
            <div className="sales-chart-card">
                <div className="section-label">
                    📊 Last 7 Days Revenue
                    <span>Weekly</span>
                </div>
                <div className="milk-chart sales-chart" aria-label="Last 7 days sales revenue chart">
                    {last7.map((item, i) => (
                        <div className="chart-bar" key={i}>
                            <i style={{ height: `${Math.max(6, (item.total / maxBar) * 100)}%` }} />
                            <small>{item.label}</small>
                        </div>
                    ))}
                </div>
                <p style={{ color: '#7d9198', fontSize: '.62rem', marginTop: '.45rem' }}>
                    Total: ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
            </div>

            {/* Top Customer Card */}
            {topCustomer ? (
                <div className="top-customer-card">
                    <div className="section-label">
                        🏆 Top Customer
                        <span>All-time</span>
                    </div>
                    <div className="top-customer-info">
                        <span className="customer-avatar">
                            {topCustomer.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                            <strong>{topCustomer.name}</strong>
                            <small>{topCustomer.qty.toFixed(1)} L Purchased</small>
                            <small style={{ color: '#10B981' }}>
                                ₹{topCustomer.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })} Revenue
                            </small>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="top-customer-card">
                    <div className="section-label">🏆 Top Customer<span>All-time</span></div>
                    <p style={{ color: '#7d9198', fontSize: '.72rem', marginTop: '.5rem' }}>No sales data yet.</p>
                </div>
            )}

            {/* Smart Business Tip */}
            <div className="farm-tip sales-tip">
                <span>💡</span>
                <div>
                    <strong>Smart Business Tip</strong>
                    <p>
                        Regular customers contribute significantly to stable revenue.
                        Consider offering loyalty discounts for bulk purchases.
                    </p>
                    <small>♥ Happy customers, thriving farm!</small>
                </div>
            </div>
        </aside>
    );
};

export default SalesInsights;
