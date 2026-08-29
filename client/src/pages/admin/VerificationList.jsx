import { useState, useEffect } from 'react';
import api from '../../services/api';

const Verifications = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // We put this in its own function so we can call it again after approving!
    const fetchVerifications = async () => {
        try {
            const res = await api.get('/verifications');
            setVerifications(res.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load verifications');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVerifications();
    }, []);

    // This is the crucial function that sends 'APPROVED' and refreshes the list
    const handleAction = async (id, newStatus) => {
        try {
            // Send the exact status ('APPROVED' or 'REJECTED') in the body
            await api.put(`/verifications/${id}/verify`, { status: newStatus });
            
            // Instantly refresh the list to remove the approved ticket!
            fetchVerifications(); 
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating verification');
        }
    };

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    return (
        <div>
            <h2 className="mb-4">🔎 Pending Verifications</h2>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Date Submitted</th>
                                <th>Type</th>
                                <th>Submitted By</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {verifications.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-4">No pending records to verify.</td></tr>
                            ) : (
                                verifications.map(ticket => (
                                    <tr key={ticket._id}>
                                        <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                        <td><span className="badge bg-info text-dark">{ticket.recordType}</span></td>
                                        <td>{ticket.submittedBy?.name || 'Unknown'}</td>
                                        <td>
                                            <button 
                                                className="btn btn-sm btn-success me-2"
                                                onClick={() => handleAction(ticket._id, 'APPROVED')}
                                            >
                                                ✓ Accept
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleAction(ticket._id, 'REJECTED')}
                                            >
                                                ✕ Reject
                                            </button>
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

export default Verifications;