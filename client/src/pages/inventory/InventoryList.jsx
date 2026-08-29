import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const InventoryList = () => {
    const { user } = useContext(AuthContext);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showLowStockOnly, setShowLowStockOnly] = useState(false);

    useEffect(() => {
        fetchInventory(showLowStockOnly);
    }, [showLowStockOnly]);

    const fetchInventory = async (lowStock) => {
        setLoading(true);
        try {
            const endpoint = lowStock ? '/inventory?lowStock=true' : '/inventory';
            const res = await api.get(endpoint);
            setInventory(res.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load inventory.');
            setLoading(false);
        }
    };

    const getBaseRoute = () => user?.role === 'ADMIN' ? '/admin' : '/manager';

    if (loading && inventory.length === 0) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <h2>📦 Inventory Management</h2>
                <div className="d-flex gap-2">
                    <button 
                        className={`btn ${showLowStockOnly ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                    >
                        {showLowStockOnly ? 'Show All Items' : 'Show Low Stock Only'}
                    </button>
                    <Link to={`${getBaseRoute()}/inventory/transaction`} className="btn btn-warning text-dark fw-bold">
                        Log Usage / Purchase
                    </Link>
                    <Link to={`${getBaseRoute()}/inventory/new`} className="btn btn-primary">
                        + Add New Item Type
                    </Link>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body p-0 table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Current Stock</th>
                                <th>Min. Stock</th>
                                <th>Avg. Price</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4">No inventory items found.</td></tr>
                            ) : (
                                inventory.map((item) => (
                                    <tr key={item._id} className={item.isLowStock ? 'table-danger' : ''}>
                                        <td><strong>{item.itemName}</strong></td>
                                        <td><span className="badge bg-secondary">{item.category}</span></td>
                                        <td className="fw-bold">
                                            {item.currentQuantity} {item.unit}
                                            {item.isLowStock && <span className="ms-2 badge bg-danger">LOW</span>}
                                        </td>
                                        <td>{item.minimumStock} {item.unit}</td>
                                        <td>₹{item.price}</td>
                                        <td>{item.status}</td>
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

export default InventoryList;