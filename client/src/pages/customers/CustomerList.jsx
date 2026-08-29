import { useState, useEffect } from 'react';
import api from '../../services/api';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            // Note: You may need to create a /customers route on your backend if not explicitly done in Phase 6, 
            // assuming it returns the Customer model data.
            const res = await api.get('/customers');
            setCustomers(res.data.data || res.data); // Adjust based on your API wrapper
            setLoading(false);
        } catch (err) {
            setError('Failed to load customers.');
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>👥 Customer Management</h2>
                {/* Registration is typically handled via public /register, but an internal form can be added */}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body p-0 table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4">No customers found.</td></tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer._id}>
                                        <td><strong>{customer.name}</strong></td>
                                        <td>{customer.phone}</td>
                                        <td>{customer.email || 'N/A'}</td>
                                        <td>{customer.address}</td>
                                        <td>
                                            <span className={`badge ${customer.status === 'ACTIVE' ? 'bg-success' : 'bg-danger'}`}>
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
        </div>
    );
};

export default CustomerList;
