import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import farmHero from '../../assets/dairy-login-background.png';
import FarmInsights from '../../components/FarmInsights';

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
    const totalMilk = milkRecords.reduce((sum, record) => sum + Number(record.totalQuantity || 0), 0);
    const morningMilk = milkRecords.reduce((sum, record) => sum + Number(record.morningQuantity || 0), 0);
    const eveningMilk = milkRecords.reduce((sum, record) => sum + Number(record.eveningQuantity || 0), 0);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="milk-page">
            <section className="milk-hero mb-4" style={{ backgroundImage: `url(${farmHero})` }}>
                <div className="milk-hero-content">
                    <span className="eyebrow">DAILY OPERATIONS</span>
                    <h2>🥛 Milk Production Log</h2>
                    <p>Track daily milk production from all animals.</p>
                </div>
                <Link to={`${getBaseRoute()}/milk/new`} className="btn btn-success">
                    + Log Daily Milk
                </Link>
            </section>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="milk-grid">
                <div className="card milk-records-card shadow-sm">
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
                                        <td className="animal-code"><strong>{record.animal?.animalCode || '—'}</strong></td>
                                        <td><span className="morning-value">☀ {record.morningQuantity}</span></td>
                                        <td><span className="evening-value">☾ {record.eveningQuantity}</span></td>
                                        <td className="fw-bold total-value">{record.totalQuantity}</td>
                                        <td>{record.enteredBy?.name}</td>
                                        <td>
                                            <span className={`badge status-badge ${
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
                <FarmInsights milk={{ today: totalMilk, morning: morningMilk, evening: eveningMilk }} />
            </div>
        </div>
    );
};

export default MilkList;
