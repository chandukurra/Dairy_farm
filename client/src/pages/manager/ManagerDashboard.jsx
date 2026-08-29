import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardCard from '../../components/DashboardCard';

const ManagerDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/dashboard/manager');
                setStats(res.data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load operational dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    return (
        <div>
            <h2 className="mb-4">🚜 Operations Dashboard</h2>

            <div className="row">
                <DashboardCard title="Total Animals" value={stats.totalAnimals} icon="🐄" bgColor="bg-primary" />
                <DashboardCard title="Today's Milk (L)" value={stats.milkToday} icon="🥛" bgColor="bg-success" />
                <DashboardCard title="Today's Sales (₹)" value={stats.salesToday} icon="💰" bgColor="bg-info text-dark" />
                <DashboardCard 
                    title="Pending Checks" 
                    value={stats.pendingChecks} 
                    icon="🔎" 
                    bgColor={stats.pendingChecks > 0 ? "bg-warning text-dark" : "bg-secondary"} 
                />
            </div>

            <div className="mt-4 card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title">Quick Actions</h5>
                    <div className="d-flex flex-wrap gap-2">
                        <Link to="/manager/milk/new" className="btn btn-primary">Log Daily Milk</Link>
                        <Link to="/manager/sales/new" className="btn btn-success">Record Sale</Link>
                        <Link to="/manager/payments/new" className="btn btn-outline-success">Record Payment</Link>
                        <Link to="/manager/inventory/transaction" className="btn btn-warning">Log Stock Usage</Link>
                        <Link to="/manager/expenses/new" className="btn btn-outline-danger">Record Expense</Link>
                        <Link to="/manager/income/new" className="btn btn-outline-primary">Record Other Income</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
