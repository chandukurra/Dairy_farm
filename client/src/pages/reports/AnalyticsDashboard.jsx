import { useState, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import api from '../../services/api';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';

const AnalyticsDashboard = () => {
    const [finances, setFinances] = useState(null);
    const [milkTrend, setMilkTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [financeRes, milkRes] = await Promise.all([
                    api.get('/reports/profit'),
                    api.get('/charts/milk-trend')
                ]);
                
                setFinances(financeRes.data?.data || null);
                
                const rawMilkData = milkRes.data?.data || [];
                const formattedMilkData = rawMilkData.map(item => ({
                    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    Total_Yield: item.totalMilk
                }));
                
                setMilkTrend(formattedMilkData);
                setLoading(false);
            } catch (err) {
                console.error('🚨 Analytics Dashboard Error:', err.response?.data || err.message);
                setError('Failed to load analytics data.');
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
    
    if (error) return (
        <div className="alert alert-danger m-4 shadow-sm border-0">
            <h5 className="alert-heading fw-bold">⚠️ Connection Error</h5>
            <p className="mb-0">{error}</p>
        </div>
    );

    if (!finances) return <div className="alert alert-warning m-4">No financial data available to display.</div>;

    const financialChartData = [
        { name: 'Milk Revenue', amount: finances.breakdown?.milkRevenue || 0 },
        { name: 'Other Income', amount: finances.breakdown?.additionalIncome || 0 },
        { name: 'Total Expenses', amount: finances.totalExpenses || 0 },
        { name: 'Net Profit', amount: finances.netProfit || 0 }
    ];

    const totalIncome = Number(finances.totalIncome || 0);
    const totalExpenses = Number(finances.totalExpenses || 0);
    const netProfit = Number(finances.netProfit || 0);
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;
    const totalMilkYield = milkTrend.reduce((sum, d) => sum + Number(d.Total_Yield || 0), 0);

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="ANALYTICS & AUDIT"
                title="📊 Farm Reports & Analytics"
                subtitle="View high-level financial performance, milk yield trends, and profit margins."
            >
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn btn-outline-info"
                    style={{ borderRadius: '.65rem', padding: '.7rem 1.1rem', fontWeight: 600 }}
                >
                    🖨 Export / Print Report
                </button>
            </DashboardHero>

            <div className="module-grid">
                {/* ── Main Panel ── */}
                <div className="module-main-panel">
                    {/* Top 4 Summary Cards */}
                    <div className="production-summary row mb-4">
                        <DashboardCard
                            title="Milk Production Report"
                            value={`${totalMilkYield.toFixed(1)} L`}
                            icon="🥛"
                            bgColor="bg-blue"
                        />
                        <DashboardCard
                            title="Sales & Income Report"
                            value={`₹${totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="💰"
                            bgColor="bg-green"
                        />
                        <DashboardCard
                            title="Expense Report"
                            value={`₹${totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="💸"
                            bgColor="bg-rose"
                        />
                        <DashboardCard
                            title="Net Profit & Loss"
                            value={`₹${netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="📈"
                            bgColor={netProfit >= 0 ? "bg-amber" : "bg-purple"}
                        />
                    </div>

                    <div className="row g-4">
                        {/* Milk Production Trend Line Chart */}
                        <div className="col-lg-6">
                            <div className="card glass-table-card shadow-sm h-100 p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold text-light mb-0">🥛 Milk Yield Trend (7 Days)</h6>
                                    <span className="badge bg-primary">Daily L</span>
                                </div>
                                <div style={{ height: '320px' }}>
                                    {milkTrend.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={milkTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                                                <YAxis stroke="#94a3b8" fontSize={11} />
                                                <Tooltip contentStyle={{ backgroundColor: '#101d22', borderColor: '#22d3ee', color: '#fff', borderRadius: '8px' }} />
                                                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                                                <Line type="monotone" dataKey="Total_Yield" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4' }} activeDot={{ r: 7 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="text-center text-muted mt-5 pt-5">No yield data recorded.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Revenue vs Expense Breakdown Bar Chart */}
                        <div className="col-lg-6">
                            <div className="card glass-table-card shadow-sm h-100 p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="fw-bold text-light mb-0">⚖️ Financial Inflow vs Outflow</h6>
                                    <span className="badge bg-success">₹ INR</span>
                                </div>
                                <div style={{ height: '320px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={financialChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                                            <YAxis stroke="#94a3b8" fontSize={11} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#101d22', borderColor: '#10b981', color: '#fff', borderRadius: '8px' }}
                                                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                            />
                                            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                                {financialChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={
                                                        entry.name === 'Total Expenses' ? '#ef4444' : 
                                                        entry.name === 'Net Profit' && entry.amount < 0 ? '#f59e0b' : '#10b981'
                                                    } />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right-Side Farm Performance Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>📈</span>
                        <strong>Performance Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Net Margin Card */}
                    <div className="insights-card">
                        <div className="section-label">
                            💹 Operating Margin
                            <span>Verified</span>
                        </div>
                        <strong style={{ color: profitMargin >= 0 ? '#34d399' : '#f87171' }}>
                            {profitMargin}%
                            <small> margin</small>
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            {netProfit >= 0 ? 'Surplus farm operational cash flow' : 'Deficit — review cost centers'}
                        </p>
                        <div className="insights-split">
                            <div>
                                <span>Total In</span>
                                <b style={{ color: '#34d399' }}>₹{totalIncome.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</b>
                            </div>
                            <div>
                                <span>Total Out</span>
                                <b style={{ color: '#f87171' }}>₹{totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</b>
                            </div>
                        </div>
                    </div>

                    {/* Milk Trend Summary */}
                    <div className="insights-card">
                        <div className="section-label">
                            🥛 7-Day Peak Yield
                            <span>Trend</span>
                        </div>
                        <strong>
                            {Math.max(...milkTrend.map(m => Number(m.Total_Yield || 0)), 0).toFixed(1)} <small>L / day</small>
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            Aggregated across all verified herd entries
                        </p>
                    </div>

                    {/* Smart Business Performance Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Farm Growth Tip"
                        tip="Focus on reducing feed wastage and tracking individual cow yield to raise net operating margins above 35%."
                        footer="♥ Smart data fuels farm expansion!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
