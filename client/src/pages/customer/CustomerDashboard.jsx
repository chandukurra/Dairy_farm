import { useState, useEffect } from 'react';
import api from '../../services/api';

const CustomerDashboard = () => {
    const [stats, setStats] = useState({ totalMilk: 0, totalPaid: 0, recentPurchases: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch both endpoints with correct backend route names
                const [salesRes, paymentsRes] = await Promise.all([
                    api.get('/milk-sales'),
                    api.get('/payments')
                ]);

                const sales = salesRes.data?.data || [];
                const payments = paymentsRes.data?.data || [];

                // Calculate totals safely
                const totalMilk = sales.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0);
                const totalPaid = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

                setStats({
                    totalMilk,
                    totalPaid,
                    recentPurchases: sales.slice(0, 5)
                });
                setLoading(false);
            } catch (err) {
                console.error('🚨 Customer Dashboard Error:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to load your account data.');
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Loading your farm account...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger m-4 shadow-sm">
                <h5 className="alert-heading fw-bold">⚠️ Data Load Error</h5>
                <p className="mb-0">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-2">
            <h2 className="mb-4 fw-bold">👋 Welcome to Your Customer Portal</h2>

            <div className="row g-4 mb-4">
                <div className="col-md-6">
                    <div className="card text-white bg-primary shadow-sm h-100 border-0">
                        <div className="card-body p-4">
                            <h5 className="card-title text-light">Total Milk Purchased</h5>
                            <h2 className="display-6 fw-bold mb-0">{stats.totalMilk} Litres</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card text-white bg-success shadow-sm h-100 border-0">
                        <div className="card-body p-4">
                            <h5 className="card-title text-light">Total Amount Paid</h5>
                            <h2 className="display-6 fw-bold mb-0">₹{stats.totalPaid}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <h4 className="fw-bold mb-3">Recent Purchases</h4>
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Quantity (L)</th>
                                <th>Total (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentPurchases.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-4 text-muted">
                                        No purchase records found.
                                    </td>
                                </tr>
                            ) : (
                                stats.recentPurchases.map(purchase => (
                                    <tr key={purchase._id}>
                                        <td>{new Date(purchase.saleDate || purchase.createdAt).toLocaleDateString()}</td>
                                        <td>{purchase.quantity} L</td>
                                        <td>₹{purchase.totalAmount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;