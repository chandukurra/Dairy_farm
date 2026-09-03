import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const AnimalProfile = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    
    const [animal, setAnimal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnimalData = async () => {
            try {
                const animalRes = await api.get(`/animals/${id}`);
                setAnimal(animalRes.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch animal details', err);
                setLoading(false);
            }
        };
        fetchAnimalData();
    }, [id]);

    const getBaseRoute = () => user?.role === 'ADMIN' ? '/admin' : '/manager';

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
    if (!animal) return <div className="alert alert-danger m-4">Animal not found.</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{animal.animalCode} - {animal.species} Profile</h2>
                <Link to={`${getBaseRoute()}/animals`} className="btn btn-outline-secondary">Back to List</Link>
            </div>

            <div className="row">
                {/* Animal Details Card */}
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm h-100">
                        {animal.image?.url ? (
                            <img src={animal.image.url} className="card-img-top" alt="Animal" style={{ height: '250px', objectFit: 'cover' }} />
                        ) : (
                            <div className="bg-light text-center py-5"><h1 className="text-muted display-1">🐄</h1></div>
                        )}
                        <div className="card-body">
                            <h5 className="card-title">{animal.name || 'No Name'}</h5>
                            <p className="card-text">
                                <strong>Gender:</strong> {animal.gender}<br/>
                                <strong>Species:</strong> {animal.species}<br/>
                                <strong>Breed:</strong> {animal.breed || '—'}<br/>
                                <strong>Weight:</strong> {animal.weight ? `${animal.weight} kg` : '—'}<br/>
                                <strong>Health Status:</strong> <span className={`badge ${animal.healthStatus === 'HEALTHY' ? 'bg-success' : 'bg-danger'}`}>{animal.healthStatus}</span><br/>
                                <strong>Farm Status:</strong> {animal.status}
                            </p>
                            <Link to={`${getBaseRoute()}/animals/edit/${animal._id}`} className="btn btn-primary w-100">Edit Details</Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    {/* Health Records Tab */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-danger">🏥 Clinical Status & Treatment</h5>
                            <Link to={`${getBaseRoute()}/expenses/new`} className="btn btn-sm btn-outline-danger">+ Log Treatment Expense</Link>
                        </div>
                        <div className="card-body">
                            <div className="p-3 bg-light rounded mb-3">
                                <strong>Current Health Evaluation:</strong> <span className={`badge ms-2 ${animal.healthStatus === 'HEALTHY' ? 'bg-success' : 'bg-warning text-dark'}`}>{animal.healthStatus}</span>
                                <p className="text-muted small mt-2 mb-0">
                                    Notes: {animal.notes || 'No special medical observations noted.'}
                                </p>
                            </div>
                            <small className="text-muted">
                                To record veterinary fees or medication purchases for this animal, click <strong>+ Log Treatment Expense</strong> to track it in farm finances.
                            </small>
                        </div>
                    </div>

                    {/* Vaccinations Tab */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-info">💉 Vaccination & Preventive Care</h5>
                            <Link to={`${getBaseRoute()}/expenses/new`} className="btn btn-sm btn-outline-info">+ Log Vaccine Expense</Link>
                        </div>
                        <div className="card-body">
                            <div className="p-3 bg-light rounded mb-3">
                                <strong>Preventive Care Profile:</strong>
                                <ul className="mb-0 mt-2 small text-muted">
                                    <li>Species schedule: <strong>{animal.species === 'COW' ? 'Bovine Viral & FMD Protocol' : 'Buffalo Immunization Protocol'}</strong></li>
                                    <li>Herd standing: <strong>{animal.status}</strong></li>
                                </ul>
                            </div>
                            <small className="text-muted">
                                Use the Expense module to log vaccine batch purchases and veterinary administration costs.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimalProfile;
