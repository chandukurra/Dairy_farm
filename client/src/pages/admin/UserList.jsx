import { useState, useEffect } from 'react';
import api from '../../services/api';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';
import EmptyState from '../../components/EmptyState';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterRole, setFilterRole] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [filterRole]);

    const fetchUsers = async () => {
        try {
            const endpoint = filterRole ? `/users?role=${filterRole}` : '/users';
            const res = await api.get(endpoint);
            setUsers(res.data.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to load users.');
            setLoading(false);
        }
    };

    const toggleUserStatus = async (id, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;

        try {
            await api.put(`/users/${id}/status`, { status: newStatus });
            setUsers(users.map(u => u._id === id ? { ...u, status: newStatus } : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user status.');
        }
    };

    // ── Workforce metrics ──
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
    const staffMembers = users.filter(u => u.role === 'FARM_MANAGER' || u.role === 'ADMIN').length;
    const customerUsers = users.filter(u => u.role === 'CUSTOMER').length;

    // Role breakdown
    const roleCountMap = {};
    users.forEach(u => {
        const r = (u.role || 'USER').replace('_', ' ');
        roleCountMap[r] = (roleCountMap[r] || 0) + 1;
    });

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="TEAM & ACCESS CONTROL"
                title="👥 Users & Staff Management"
                subtitle="Manage farm managers, staff members, customer logins, and role-based permissions."
                actionText="+ Add Farm Manager"
                actionLink="/admin/users/new"
                actionBtnClass="btn-cta-green"
            />

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            {/* Filter Tabs */}
            <div className="d-flex gap-2 mb-4">
                <button
                    className={`btn btn-sm ${filterRole === '' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-light'}`}
                    onClick={() => setFilterRole('')}
                    style={{ borderRadius: '.5rem', padding: '.45rem 1rem' }}
                >
                    All Accounts ({totalUsers})
                </button>
                <button
                    className={`btn btn-sm ${filterRole === 'FARM_MANAGER' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-light'}`}
                    onClick={() => setFilterRole('FARM_MANAGER')}
                    style={{ borderRadius: '.5rem', padding: '.45rem 1rem' }}
                >
                    Farm Managers
                </button>
                <button
                    className={`btn btn-sm ${filterRole === 'CUSTOMER' ? 'btn-info text-dark fw-bold' : 'btn-outline-secondary text-light'}`}
                    onClick={() => setFilterRole('CUSTOMER')}
                    style={{ borderRadius: '.5rem', padding: '.45rem 1rem' }}
                >
                    Customers
                </button>
            </div>

            <div className="module-grid">
                {/* ── Main Panel ── */}
                <div className="module-main-panel">
                    <div className="card glass-table-card shadow-sm">
                        <div className="card-body p-0 table-responsive">
                            <table className="table table-hover mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-4">
                                                <EmptyState icon="👥" message="No users found for this filter." />
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr key={u._id}>
                                                <td className="text-start ps-3">
                                                    <strong className="text-light">{u.name}</strong>
                                                </td>
                                                <td className="text-muted">{u.email}</td>
                                                <td>{u.phone || '—'}</td>
                                                <td>
                                                    <span
                                                        className={`badge ${
                                                            u.role === 'ADMIN'
                                                                ? 'bg-danger'
                                                                : u.role === 'FARM_MANAGER'
                                                                ? 'bg-primary'
                                                                : 'bg-secondary'
                                                        }`}
                                                    >
                                                        {(u.role || '').replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-pill ${u.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                                        {u.status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {u.role !== 'ADMIN' ? (
                                                        <button
                                                            onClick={() => toggleUserStatus(u._id, u.status)}
                                                            className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                            style={{ borderRadius: '.45rem', fontSize: '.75rem' }}
                                                        >
                                                            {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                        </button>
                                                    ) : (
                                                        <span className="badge bg-dark border border-secondary text-muted">Primary Admin</span>
                                                    )}
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
                            title="Total Users"
                            value={totalUsers}
                            icon="👥"
                            bgColor="bg-blue"
                        />
                        <DashboardCard
                            title="Active Accounts"
                            value={activeUsers}
                            icon="🟢"
                            bgColor="bg-green"
                        />
                        <DashboardCard
                            title="Staff & Managers"
                            value={staffMembers}
                            icon="👨‍💼"
                            bgColor="bg-purple"
                        />
                        <DashboardCard
                            title="Customer Accounts"
                            value={customerUsers}
                            icon="🔐"
                            bgColor="bg-amber"
                        />
                    </div>
                </div>

                {/* ── Right-Side Workforce Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>👔</span>
                        <strong>Workforce Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Active Staff Ratio */}
                    <div className="insights-card">
                        <div className="section-label">
                            🟢 Account Status
                            <span>Overview</span>
                        </div>
                        <strong>
                            {totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}%` : '100%'}
                            <small> active</small>
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            {activeUsers} of {totalUsers} user profiles enabled
                        </p>
                        <div className="insights-split">
                            <div>
                                <span>Active</span>
                                <b style={{ color: '#34d399' }}>{activeUsers}</b>
                            </div>
                            <div>
                                <span>Inactive</span>
                                <b style={{ color: '#f87171' }}>{totalUsers - activeUsers}</b>
                            </div>
                        </div>
                    </div>

                    {/* Role Distribution */}
                    <div className="insights-card">
                        <div className="section-label">
                            👥 Role Allocation
                            <span>Breakdown</span>
                        </div>
                        <div className="mt-2">
                            {Object.entries(roleCountMap).map(([role, count]) => (
                                <div key={role} className="d-flex justify-content-between align-items-center mb-1 text-light" style={{ fontSize: '.74rem' }}>
                                    <span>• {role}</span>
                                    <span className="badge bg-secondary">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Smart Security Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Security Best Practice"
                        tip="Deactivate login privileges immediately when a farm manager or temporary staff member concludes their service tenure."
                        footer="♥ Protect farm data & financial records!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default UserList;