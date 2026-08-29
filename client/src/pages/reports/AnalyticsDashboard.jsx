import { useState, useEffect } from 'react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell // ✨ FIXED: Added Cell import
} from 'recharts';
import api from '../../services/api';

const AnalyticsDashboard = () => {
    const [finances, setFinances] = useState(null);
    const [milkTrend, setMilkTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // ✨ FIXED: Changed '/reports/profit' to '/dashboard/profit' to match your server.js
                const [financeRes, milkRes] = await Promise.all([
                    api.get('/reports/profit'),
                    api.get('/charts/milk-trend')
                ]);
                
                setFinances(financeRes.data?.data || null);
                
                // Format date for the chart X-Axis safely
                const rawMilkData = milkRes.data?.data || [];
                const formattedMilkData = rawMilkData.map(item => ({
                    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    Total_Yield: item.totalMilk
                }));
                
                setMilkTrend(formattedMilkData);
                setLoading(false);
            } catch (err) {
                // 🚨 Bulletproof Logging: This will tell you exactly which API is failing
                console.error('🚨 Analytics Dashboard Error:', err.response?.data || err.message);
                setError('Failed to load analytics data. Check browser console for details.');
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

    // Safeguard: Ensure finances exists before trying to access its properties
    if (!finances) return <div className="alert alert-warning m-4">No financial data available to display.</div>;

    // Data for the Profit/Loss Bar Chart
    const financialChartData = [
        { name: 'Milk Revenue', amount: finances.breakdown?.milkRevenue || 0 },
        { name: 'Other Income', amount: finances.breakdown?.additionalIncome || 0 },
        { name: 'Total Expenses', amount: finances.totalExpenses || 0 },
        { name: 'Net Profit', amount: finances.netProfit || 0 }
    ];

    return (
        <div className="p-2">
            <h2 className="mb-4 fw-bold">📈 Financial Reports & Analytics</h2>

            {/* Top Level Financial Summary Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card bg-success text-white shadow-sm border-0">
                        <div className="card-body">
                            <h6>Total Income</h6>
                            <h3>₹{finances.totalIncome || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card bg-danger text-white shadow-sm border-0">
                        <div className="card-body">
                            <h6>Total Expenses</h6>
                            <h3>₹{finances.totalExpenses || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className={`card text-white shadow-sm border-0 ${finances.netProfit >= 0 ? 'bg-primary' : 'bg-warning text-dark'}`}>
                        <div className="card-body">
                            <h6>Net Profit (Verified Records Only)</h6>
                            <h3>₹{finances.netProfit || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Milk Production Trend Line Chart */}
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm h-100 border-0">
                        <div className="card-header bg-white border-0 pt-4">
                            <h5 className="mb-0 fw-bold">Milk Production (Last 7 Days)</h5>
                        </div>
                        <div className="card-body" style={{ height: '350px' }}>
                            {milkTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={milkTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="Total_Yield" stroke="#0d6efd" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-muted mt-5 pt-5">Not enough data to display trend.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Financial Summary Bar Chart */}
                <div className="col-lg-6 mb-4">
                    <div className="card shadow-sm h-100 border-0">
                        <div className="card-header bg-white border-0 pt-4">
                            <h5 className="mb-0 fw-bold">Revenue vs Expense Breakdown</h5>
                        </div>
                        <div className="card-body" style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialChartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `₹${value}`} />
                                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                        {
                                            financialChartData.map((entry, index) => (
                                                /* ✨ FIXED: Capitalized Cell here! */
                                                <Cell key={`cell-${index}`} fill={
                                                    entry.name === 'Total Expenses' ? '#dc3545' : 
                                                    entry.name === 'Net Profit' && entry.amount < 0 ? '#ffc107' : '#198754'
                                                } />
                                            ))
                                        }
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
