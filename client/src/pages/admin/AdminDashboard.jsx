import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardCard from '../../components/DashboardCard';
import FarmInsights from '../../components/FarmInsights';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/dashboard/admin');
                setStats(res.data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    return (
        <div className="dashboard-grid">
          <div className="dashboard-main">
            <h2 className="mb-4">Admin Dashboard</h2>

            {/* Animal Statistics */}
            <h5 className="mb-3 border-bottom pb-2">Farm Livestock</h5>
            <div className="row">
                <DashboardCard title="Total Animals" value={stats.animals.total} icon="🐄" bgColor="bg-primary" />
                <DashboardCard title="Female Cows" value={stats.animals.cows} icon="🐄" bgColor="bg-info" />
                <DashboardCard title="Female Buffaloes" value={stats.animals.buffaloes} icon="🐃" bgColor="bg-secondary" />
                <DashboardCard title="Male Animals" value={stats.animals.males} icon="♂️" bgColor="bg-dark" />
            </div>

            {/* Milk & Operations */}
            <h5 className="mb-3 border-bottom pb-2 mt-4">Daily Operations</h5>
            <div className="row">
                <DashboardCard title="Today's Milk (L)" value={stats.milk.today} icon="🥛" bgColor="bg-success" />
                <DashboardCard title="Low Stock Items" value={stats.operations.lowStockCount} icon="📦" bgColor={stats.operations.lowStockCount > 0 ? "bg-danger" : "bg-secondary"} />
                <DashboardCard title="Total Customers" value={stats.operations.totalCustomers} icon="👥" bgColor="bg-info" />
                <DashboardCard title="Pending Checks" value={stats.operations.pendingVerifications} icon="🔎" bgColor={stats.operations.pendingVerifications > 0 ? "bg-warning text-dark" : "bg-secondary"} />
            </div>

            {/* Financial Overview */}
            <h5 className="mb-3 border-bottom pb-2 mt-4">Financial Overview (Verified Only)</h5>
            <div className="row">
                <DashboardCard title="Today's Sales" value={`₹${stats.finance.salesToday}`} icon="💰" bgColor="bg-success" />
                <DashboardCard title="Monthly Sales" value={`₹${stats.finance.salesMonth}`} icon="💰" bgColor="bg-success" />
                <DashboardCard title="Today's Expenses" value={`₹${stats.finance.expensesToday}`} icon="💸" bgColor="bg-danger" />
                <DashboardCard title="Monthly Expenses" value={`₹${stats.finance.expensesMonth}`} icon="💸" bgColor="bg-danger" />
            </div>
          </div>
          <FarmInsights milk={stats.milk} />
        </div>
    );
};

export default AdminDashboard;
