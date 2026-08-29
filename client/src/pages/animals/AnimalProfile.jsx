import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const AnimalProfile = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    
    const [animal, setAnimal] = useState(null);
    const [healthRecords] = useState([]);
    const [vaccinations] = useState([]);
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
                            <h5 className="mb-0 text-danger">🏥 Medical History</h5>
                            <button className="btn btn-sm btn-danger">+ Log Illness</button>
                        </div>
                        <div className="card-body p-0 table-responsive">
                            <table className="table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Diagnosis</th>
                                        <th>Treatment</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {healthRecords.length === 0 ? <tr><td colSpan="4" className="text-center py-3">No health records found.</td></tr> : 
                                        healthRecords.map(record => (
                                            <tr key={record._id}>
                                                <td>{new Date(record.checkupDate).toLocaleDateString()}</td>
                                                <td>{record.diagnosis}</td>
                                                <td>{record.treatment}</td>
                                                <td><span className="badge bg-secondary">{record.status}</span></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Vaccinations Tab */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-white d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-info">💉 Vaccinations</h5>
                            <button className="btn btn-sm btn-info text-white">+ Log Vaccine</button>
                        </div>
                        <div className="card-body p-0 table-responsive">
                            <table className="table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Vaccine Name</th>
                                        <th>Next Due Date</th>
                                        <th>Veterinarian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vaccinations.length === 0 ? <tr><td colSpan="4" className="text-center py-3">No vaccination records found.</td></tr> : 
                                        vaccinations.map(vac => (
                                            <tr key={vac._id}>
                                                <td>{new Date(vac.vaccinationDate).toLocaleDateString()}</td>
                                                <td><strong>{vac.vaccineName}</strong></td>
                                                <td className="text-danger">{new Date(vac.nextDueDate).toLocaleDateString()}</td>
                                                <td>{vac.veterinarian}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimalProfile;
