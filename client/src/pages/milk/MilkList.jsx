import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import farmHero from '../../assets/dairy-login-background.png';
import FarmInsights from '../../components/FarmInsights';
import DashboardCard from '../../components/DashboardCard';

const MilkList = () => {
    const { user } = useContext(AuthContext);
    const [milkRecords, setMilkRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        fetchMilkRecords();
    }, [user?.role]);

    const fetchMilkRecords = async () => {
        try {
            const dashboardPath = user?.role === 'ADMIN' ? 'admin' : 'manager';
            const [recordsResponse, dashboardResponse] = await Promise.all([
                api.get('/milk-production'),
                api.get(`/dashboard/${dashboardPath}`)
            ]);
            setMilkRecords(recordsResponse.data.data);
            setSummary(dashboardResponse.data.data);
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
                <div className="milk-main-panel">
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
                <div className="production-summary row mt-3">
                    <DashboardCard title="Total Animals" value={summary?.animals?.total ?? summary?.totalAnimals ?? '—'} icon="🐄" bgColor="bg-primary" />
                    <DashboardCard title="Today's Production" value={`${Number(summary?.milk?.today ?? totalMilk).toFixed(1)} L`} icon="🥛" bgColor="bg-success" />
                    <DashboardCard title="Avg. Production" value={`${(Number(summary?.milk?.today ?? totalMilk) / Math.max(Number(summary?.animals?.total ?? summary?.totalAnimals ?? 0), 1)).toFixed(1)} L`} icon="📊" bgColor="bg-purple" />
                    <DashboardCard title="This Month" value={`${Number(summary?.milk?.month ?? 0).toFixed(1)} L`} icon="📅" bgColor="bg-gold" />
                </div>
                </div>
                <FarmInsights milk={summary?.milk || { today: totalMilk, morning: morningMilk, evening: eveningMilk }} />
            </div>
        </div>
    );
};

export default MilkList;
