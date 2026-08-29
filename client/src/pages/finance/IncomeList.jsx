import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const IncomeList = () => {
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/income').then(({ data }) => setRecords(data.data || []))
            .catch((err) => setError(err.response?.data?.message || 'Failed to load income records.'));
    }, []);

    const base = user?.role === 'ADMIN' ? '/admin' : '/manager';
    return <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Other Income</h2><Link to={`${base}/income/new`} className="btn btn-success">+ Record Income</Link>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm table-responsive"><table className="table table-hover mb-0">
            <thead className="table-dark"><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{records.length === 0 ? <tr><td colSpan="5" className="text-center py-4">No income records found.</td></tr> : records.map((record) => <tr key={record._id}>
                <td>{new Date(record.incomeDate).toLocaleDateString()}</td><td>{record.category.replace('_', ' ')}</td><td>{record.description}</td><td>₹{Number(record.amount || 0).toFixed(2)}</td>
                <td><span className={`badge ${record.verificationStatus === 'VERIFIED' ? 'bg-success' : record.verificationStatus === 'REJECTED' ? 'bg-danger' : 'bg-warning text-dark'}`}>{record.verificationStatus}</span></td>
            </tr>)}</tbody>
        </table></div>
    </div>;
};

export default IncomeList;
