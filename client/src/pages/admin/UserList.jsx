import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

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
            // Assumes you have an admin route like GET /api/users
            const endpoint = filterRole ? `/users?role=${filterRole}` : '/users';
            const res = await api.get(endpoint);
            setUsers(res.data.data);
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

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>👥 System Users & Staff</h2>
                <Link to="/admin/users/new" className="btn btn-primary">
                    + Create Farm Manager
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm mb-4 p-3 bg-white">
                <div className="d-flex gap-2">
                    <button className={`btn ${filterRole === '' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setFilterRole('')}>All Users</button>
                    <button className={`btn ${filterRole === 'FARM_MANAGER' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setFilterRole('FARM_MANAGER')}>Farm Managers</button>
                    <button className={`btn ${filterRole === 'CUSTOMER' ? 'btn-dark' : 'btn-outline-dark'}`} onClick={() => setFilterRole('CUSTOMER')}>Customers</button>
                </div>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0 table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-dark">
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
                                <tr><td colSpan="6" className="text-center py-4">No users found.</td></tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u._id}>
                                        <td><strong>{u.name}</strong></td>
                                        <td>{u.email}</td>
                                        <td>{u.phone}</td>
                                        <td>
                                            <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger' : u.role === 'FARM_MANAGER' ? 'bg-primary' : 'bg-secondary'}`}>
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.status === 'ACTIVE' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td>
                                            {u.role !== 'ADMIN' && (
                                                <button 
                                                    onClick={() => toggleUserStatus(u._id, u.status)} 
                                                    className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                >
                                                    {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            )}
                                        </td>
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

export default UserList;