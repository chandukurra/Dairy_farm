import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';
import EmptyState from '../../components/EmptyState';

const AnimalList = () => {
    const { user } = useContext(AuthContext);
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAnimals();
    }, []);

    const fetchAnimals = async () => {
        try {
            const res = await api.get('/animals');
            setAnimals(res.data.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to load animals.');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this animal? This action is permanent.')) {
            try {
                await api.delete(`/animals/${id}`);
                setAnimals(animals.filter(animal => animal._id !== id));
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete animal');
            }
        }
    };

    const getBaseRoute = () => user?.role === 'ADMIN' ? '/admin' : '/manager';

    // ── Dynamic livestock metrics ──
    const totalAnimals = animals.length;
    const healthyCount = animals.filter(a => 
        (a.healthStatus || '').toUpperCase() === 'HEALTHY' || !(a.healthStatus || '').toUpperCase().includes('SICK')
    ).length;
    const femaleCount = animals.filter(a => (a.gender || '').toUpperCase() === 'FEMALE').length;
    const activeCount = animals.filter(a => (a.status || '').toUpperCase() === 'ACTIVE').length;

    // Species breakdown
    const speciesMap = {};
    animals.forEach(a => {
        const sp = a.species || 'Other';
        speciesMap[sp] = (speciesMap[sp] || 0) + 1;
    });

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="HERD MANAGEMENT"
                title="🐄 Animals Management"
                subtitle="Manage and monitor all cattle, their health, breed and production details."
                actionText="+ Add Animal"
                actionLink={`${getBaseRoute()}/animals/new`}
                actionBtnClass="btn-cta-green"
            />

            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="module-grid">
                {/* ── Main Panel ── */}
                <div className="module-main-panel">
                    <div className="card glass-table-card shadow-sm">
                        <div className="card-body p-0 table-responsive">
                            <table className="table table-hover mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>Animal ID</th>
                                        <th>Photo</th>
                                        <th>Species</th>
                                        <th>Gender</th>
                                        <th>Status</th>
                                        <th>Health Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {animals.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-4">
                                                <EmptyState icon="🐄" message="No animals found in the system." submessage="Click '+ Add Animal' to register your first cattle." />
                                            </td>
                                        </tr>
                                    ) : (
                                        animals.map((animal) => (
                                            <tr key={animal._id}>
                                                <td>
                                                    <Link to={`${getBaseRoute()}/animals/${animal._id}`} className="fw-bold text-info text-decoration-none">
                                                        {animal.animalCode}
                                                    </Link>
                                                </td>
                                                <td>
                                                    {animal.image?.url ? (
                                                        <img
                                                            src={animal.image.url}
                                                            alt={animal.animalCode}
                                                            className="rounded-circle border border-secondary"
                                                            style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <span className="badge bg-dark border border-secondary text-light">No Image</span>
                                                    )}
                                                </td>
                                                <td><span className="fw-semibold text-light">{animal.species}</span></td>
                                                <td>
                                                    <span className={`badge ${animal.gender === 'FEMALE' ? 'bg-purple' : 'bg-secondary'}`}>
                                                        {animal.gender === 'FEMALE' ? '♀ Female' : '♂ Male'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-pill ${animal.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                                        {animal.status || 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`status-pill ${
                                                        (animal.healthStatus || '').toUpperCase() === 'HEALTHY' ? 'healthy' :
                                                        (animal.healthStatus || '').toUpperCase().includes('SICK') ? 'rejected' : 'warning'
                                                    }`}>
                                                        {animal.healthStatus || 'HEALTHY'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <Link to={`${getBaseRoute()}/animals/edit/${animal._id}`} className="btn btn-sm btn-outline-info">
                                                            Edit
                                                        </Link>
                                                        {user?.role === 'ADMIN' && (
                                                            <button onClick={() => handleDelete(animal._id)} className="btn btn-sm btn-outline-danger">
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
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
                            title="Total Animals"
                            value={totalAnimals}
                            icon="🐄"
                            bgColor="bg-blue"
                        />
                        <DashboardCard
                            title="Healthy Animals"
                            value={healthyCount}
                            icon="❤️"
                            bgColor="bg-green"
                        />
                        <DashboardCard
                            title="Female Cows"
                            value={femaleCount}
                            icon="🥛"
                            bgColor="bg-purple"
                        />
                        <DashboardCard
                            title="Active Herd"
                            value={activeCount}
                            icon="📈"
                            bgColor="bg-amber"
                        />
                    </div>
                </div>

                {/* ── Right-Side Smart Livestock Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>🌱</span>
                        <strong>Smart Livestock Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Herd Health Card */}
                    <div className="insights-card">
                        <div className="section-label">
                            ❤️ Herd Health Rate
                            <span>Live</span>
                        </div>
                        <strong>
                            {totalAnimals > 0 ? `${Math.round((healthyCount / totalAnimals) * 100)}%` : '100%'}
                            <small> healthy</small>
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            {healthyCount} of {totalAnimals} cattle in prime condition
                        </p>
                        <div className="insights-split">
                            <div>
                                <span>🟢 Healthy</span>
                                <b>{healthyCount}</b>
                            </div>
                            <div>
                                <span>⚠️ Attention</span>
                                <b>{totalAnimals - healthyCount}</b>
                            </div>
                        </div>
                    </div>

                    {/* Breed / Species Distribution */}
                    <div className="insights-card">
                        <div className="section-label">
                            📊 Breed & Species
                            <span>Distribution</span>
                        </div>
                        <div className="mt-2">
                            {Object.keys(speciesMap).length === 0 ? (
                                <p style={{ color: '#7d9198', fontSize: '.72rem' }}>No species data available.</p>
                            ) : (
                                Object.entries(speciesMap).map(([species, count]) => (
                                    <div key={species} className="d-flex justify-content-between align-items-center mb-1 text-light" style={{ fontSize: '.74rem' }}>
                                        <span>• {species}</span>
                                        <span className="badge bg-secondary">{count}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Smart Livestock Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Smart Livestock Tip"
                        tip="Ensure regular veterinary health checkups and adequate mineral feeding to boost immune resistance and milk quality."
                        footer="♥ Healthy cows, happy farm!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default AnimalList;