import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const SaleList = () => {
    const { user } = useContext(AuthContext);
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const res = await api.get('/milk-sales');
            setSales(res.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load sales records.');
            setLoading(false);
        }
    };

    const getBaseRoute = () => user?.role === 'ADMIN' ? '/admin' : '/manager';

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>💰 Milk Sales Log</h2>
                <Link to={`${getBaseRoute()}/sales/new`} className="btn btn-success">
                    + Record Sale
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body p-0 table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Date</th>
                                <th>Customer</th>
                                <th>Quantity (L)</th>
                                <th>Price/L (₹)</th>
                                <th>Total (₹)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4">No sales records found.</td></tr>
                            ) : (
                                sales.map((sale) => (
                                    <tr key={sale._id}>
                                        <td>{new Date(sale.saleDate).toLocaleDateString()}</td>
                                        <td><strong>{sale.customer?.name || 'Unknown'}</strong></td>
                                        <td>{sale.quantity}</td>
                                        <td>{sale.pricePerLitre}</td>
                                        <td className="fw-bold text-success">{sale.totalAmount}</td>
                                        <td>
                                            <span className={`badge ${
                                                sale.status === 'VERIFIED' ? 'bg-success' :
                                                sale.status === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                                            }`}>
                                                {sale.status}
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

export default SaleList;
