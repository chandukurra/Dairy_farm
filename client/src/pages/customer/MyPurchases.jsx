import { useState, useEffect } from 'react';
import api from '../../services/api';

const MyPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyPurchases = async () => {
            try {
                // ✨ FIXED: Now pointing to exactly '/milk-sales' to match your server.js
                const res = await api.get('/milk-sales'); 
                
                // Safely extract the array to prevent crashes
                setPurchases(res.data?.data || []);
                setLoading(false);
            } catch (err) {
                // 🚨 Bulletproof logging: This prints the exact backend error to your browser console
                console.error('🚨 My Purchases Error:', err.response?.data || err.message);
                
                setError(err.response?.data?.message || 'Failed to load your purchase history.');
                setLoading(false);
            }
        };
        fetchMyPurchases();
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
    
    if (error) return (
        <div className="alert alert-danger m-4 shadow-sm border-0">
            <h5 className="alert-heading fw-bold">⚠️ Connection Error</h5>
            <p className="mb-0">{error}</p>
        </div>
    );

    return (
        <div className="p-2">
            <h2 className="mb-4 fw-bold">🥛 My Milk Purchases</h2>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Date</th>
                                <th>Quantity (Liters)</th>
                                <th>Rate (₹/L)</th>
                                <th>Total Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-muted">No purchases found.</td></tr>
                            ) : (
                                purchases.map(purchase => (
                                    <tr key={purchase._id}>
                                        <td>{new Date(purchase.saleDate || purchase.createdAt).toLocaleDateString()}</td>
                                        <td className="fw-bold">{purchase.quantity} L</td>
                                        {/* Adjusted to check for pricePerLitre from your backend model */}
                                        <td>₹{purchase.pricePerLitre || purchase.rate}</td>
                                        <td className="fw-bold text-success">₹{purchase.totalAmount}</td>
                                        <td>
                                            <span className={`badge ${purchase.status === 'PAID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {purchase.status || 'DELIVERED'}
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

export default MyPurchases;