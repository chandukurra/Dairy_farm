import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const MilkList = () => {
    const { user } = useContext(AuthContext);
    const [milkRecords, setMilkRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchMilkRecords();
    }, []);

    const fetchMilkRecords = async () => {
        try {
            const res = await api.get('/milk-production');
            setMilkRecords(res.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load milk records.');
            setLoading(false);
        }
    };

    const getBaseRoute = () => user?.role === 'ADMIN' ? '/admin' : '/manager';

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🥛 Milk Production Log</h2>
                <Link to={`${getBaseRoute()}/milk/new`} className="btn btn-success">
                    + Log Daily Milk
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body p-0 table-responsive">
                    <table className="table table-hover mb-0 text-center align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>Date</th>
                                <th>Animal Code</th>
                                <th>Morning (L)</th>
                                <th>Evening (L)</th>
                                <th>Total (L)</th>
                                <th>Entered By</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {milkRecords.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-4">No milk records found.</td>
                                </tr>
                            ) : (
                                milkRecords.map((record) => (
                                    <tr key={record._id}>
                                        <td>{new Date(record.productionDate).toLocaleDateString()}</td>
                                        <td><strong>{record.animal?.animalCode}</strong></td>
                                        <td>{record.morningQuantity}</td>
                                        <td>{record.eveningQuantity}</td>
                                        <td className="fw-bold">{record.totalQuantity}</td>
                                        <td>{record.enteredBy?.name}</td>
                                        <td>
                                            <span className={`badge ${
                                                record.verificationStatus === 'VERIFIED' ? 'bg-success' :
                                                record.verificationStatus === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'
                                            }`}>
                                                {record.verificationStatus}
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

export default MilkList;