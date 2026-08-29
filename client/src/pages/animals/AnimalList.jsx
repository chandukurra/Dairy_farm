import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

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
            setAnimals(res.data.data);
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

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🐄 Livestock Management</h2>
                <Link to={`${getBaseRoute()}/animals/new`} className="btn btn-success">
                    + Add New Animal
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-body p-0 table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Code</th>
                                <th>Image</th>
                                <th>Species</th>
                                <th>Gender</th>
                                <th>Status</th>
                                <th>Health</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {animals.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">No animals found in the system.</td>
                                </tr>
                            ) : (
                                animals.map((animal) => (
                                    <tr key={animal._id} className="align-middle">
                                        <td><strong>{animal.animalCode}</strong></td>
                                        <td>
                                            {animal.image?.url ? (
                                                <img src={animal.image.url} alt="Animal" className="rounded-circle" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                                            ) : (
                                                <span className="badge bg-secondary">No Image</span>
                                            )}
                                        </td>
                                        <td>{animal.species}</td>
                                        <td>{animal.gender}</td>
                                        <td>
                                            <span className={`badge ${animal.status === 'ACTIVE' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {animal.status}
                                            </span>
                                        </td>
                                        <td>{animal.healthStatus}</td>
                                        <td>
                                            <Link to={`${getBaseRoute()}/animals/edit/${animal._id}`} className="btn btn-sm btn-primary me-2">Edit</Link>
                                            {user?.role === 'ADMIN' && (
                                                <button onClick={() => handleDelete(animal._id)} className="btn btn-sm btn-danger">Delete</button>
                                            )}
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

export default AnimalList;