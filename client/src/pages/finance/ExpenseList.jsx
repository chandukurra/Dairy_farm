import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await api.get('/expenses');
                setExpenses(res.data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load expenses');
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;
    if (error) return <div className="alert alert-danger m-4">{error}</div>;

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>💸 Farm Expenses</h2>
                <Link to="/admin/expenses/new" className="btn btn-danger">+ Record Expense</Link>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount (₹)</th>
                                <th>Method</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4">No expenses recorded yet.</td></tr>
                            ) : (
                                expenses.map(expense => (
                                    <tr key={expense._id}>
                                        <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                                        <td><span className="badge bg-secondary">{expense.category}</span></td>
                                        <td>{expense.description}</td>
                                        <td className="text-danger fw-bold">₹{expense.amount}</td>
                                        <td>{expense.paymentMethod}</td>
                                        <td>
                                            {/* UI update: Yellow badge for PENDING, bold green text for SETTLED */}
                                            {expense.status === 'PENDING' ? (
                                                <span className="badge bg-warning text-dark">PENDING</span>
                                            ) : (
                                                <span className="text-success fw-bold">{expense.status}</span>
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

export default ExpenseList;