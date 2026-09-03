import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';
import EmptyState from '../../components/EmptyState';

const ExpenseList = () => {
    const { user } = useContext(AuthContext);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data.data || []);
            setLoading(false);
        } catch (err) {
            setError('Failed to load expenses');
            setLoading(false);
        }
    };

    const base = user?.role === 'ADMIN' ? '/admin' : '/manager';

    // ── Expense calculations ──
    const todayStr = new Date().toISOString().slice(0, 10);
    const currentMonthStr = new Date().toISOString().slice(0, 7);

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const todayExpenses = expenses
        .filter((e) => e.expenseDate && e.expenseDate.slice(0, 10) === todayStr)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const monthlyExpenses = expenses
        .filter((e) => e.expenseDate && e.expenseDate.slice(0, 7) === currentMonthStr)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Category breakdown
    const categoryTotals = {};
    expenses.forEach((e) => {
        const cat = e.category || 'General';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.amount || 0);
    });

    const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCategoryEntry ? topCategoryEntry[0] : 'None';
    const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>;

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="OUTFLOW CONTROL"
                title="💸 Expense Management"
                subtitle="Track and manage farm operational costs, feed purchases, and maintenance expenses."
                actionText="+ Add Expense"
                actionLink={`${base}/expenses/new`}
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
                                        <tr>
                                            <td colSpan="6" className="py-4">
                                                <EmptyState icon="💸" message="No expenses recorded yet." submessage="Click '+ Add Expense' to record your first farm expenditure." />
                                            </td>
                                        </tr>
                                    ) : (
                                        expenses.map((expense) => (
                                            <tr key={expense._id}>
                                                <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                                                <td>
                                                    <span className="badge bg-dark border border-secondary text-info">
                                                        {expense.category}
                                                    </span>
                                                </td>
                                                <td className="text-start ps-3">{expense.description || '—'}</td>
                                                <td className="text-danger fw-bold">
                                                    ₹{Number(expense.amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </td>
                                                <td>{expense.paymentMethod || 'CASH'}</td>
                                                <td>
                                                    <span
                                                        className={`status-pill ${
                                                            expense.status === 'SETTLED' || expense.status === 'VERIFIED'
                                                                ? 'verified'
                                                                : expense.status === 'PENDING'
                                                                ? 'pending'
                                                                : 'rejected'
                                                        }`}
                                                    >
                                                        {expense.status || 'SETTLED'}
                                                    </span>
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
                            title="Total Expenses"
                            value={`₹${totalExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="💸"
                            bgColor="bg-rose"
                        />
                        <DashboardCard
                            title="Today's Expenses"
                            value={`₹${todayExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="📅"
                            bgColor="bg-amber"
                        />
                        <DashboardCard
                            title="Monthly Outflow"
                            value={`₹${monthlyExpenses.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                            icon="📊"
                            bgColor="bg-purple"
                        />
                        <DashboardCard
                            title="Top Cost Category"
                            value={topCategory}
                            icon="📉"
                            bgColor="bg-blue"
                        />
                    </div>
                </div>

                {/* ── Right-Side Expense Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>📊</span>
                        <strong>Expense Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Top Expense Category Card */}
                    <div className="insights-card">
                        <div className="section-label">
                            🔝 Highest Expenditure
                            <span>Dominant</span>
                        </div>
                        <strong>
                            {topCategory}
                            <small> category</small>
                        </strong>
                        <p style={{ color: '#f87171', fontSize: '.76rem', fontWeight: 600 }}>
                            ₹{topCategoryAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            {totalExpenses > 0 ? `${Math.round((topCategoryAmount / totalExpenses) * 100)}%` : '0%'} of total farm budget
                        </p>
                    </div>

                    {/* Category Breakdown List */}
                    <div className="insights-card">
                        <div className="section-label">
                            📁 Category Breakdown
                            <span>All-time</span>
                        </div>
                        <div className="mt-2">
                            {Object.entries(categoryTotals).slice(0, 4).map(([cat, amt]) => (
                                <div key={cat} className="d-flex justify-content-between align-items-center mb-2 pb-1 border-bottom border-dark" style={{ fontSize: '.74rem' }}>
                                    <span className="text-light">{cat}</span>
                                    <span className="text-danger fw-semibold">₹{amt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Smart Cost-Saving Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Cost-Saving Tip"
                        tip="Bulk purchase seasonal cattle fodder, silage, and mineral supplements to negotiate up to 15-20% vendor discounts."
                        footer="♥ Frugal management drives farm profitability!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default ExpenseList;