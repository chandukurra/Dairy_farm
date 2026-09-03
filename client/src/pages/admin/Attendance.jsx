import { useEffect, useState } from 'react';
import api from '../../services/api';
import DashboardHero from '../../components/DashboardHero';
import DashboardCard from '../../components/DashboardCard';
import SmartTipCard from '../../components/SmartTipCard';
import EmptyState from '../../components/EmptyState';

const Attendance = () => {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [attendance, setAttendance] = useState([]);
    const [summary, setSummary] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const loadDaily = async () => {
        try {
            const { data } = await api.get(`/attendance?date=${date}`);
            setAttendance(data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load attendance.');
        }
    };

    const loadMonthly = async () => {
        try {
            const { data } = await api.get(`/attendance/monthly?month=${month}`);
            setSummary(data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load monthly summary.');
        }
    };

    useEffect(() => {
        loadDaily();
    }, [date]);

    useEffect(() => {
        loadMonthly();
    }, [month]);

    const changeStatus = (id, status) => {
        setAttendance((records) =>
            records.map((record) => (record._id === id ? { ...record, status } : record))
        );
    };

    const save = async () => {
        setMessage('');
        setError('');
        setSaving(true);
        try {
            await api.post('/attendance', {
                date,
                attendance: attendance.map(({ _id, status }) => ({ manager: _id, status }))
            });
            setMessage('✓ Attendance saved successfully.');
            loadMonthly();
            setSaving(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save attendance.');
            setSaving(false);
        }
    };

    // ── Metrics ──
    const presentCount = attendance.filter((r) => r.status === 'PRESENT').length;
    const absentCount = attendance.filter((r) => r.status === 'ABSENT').length;
    const totalStaff = attendance.length;
    const attendanceRate = totalStaff > 0 ? Math.round((presentCount / totalStaff) * 100) : 100;
    const totalMonthlyPresents = summary.reduce((sum, s) => sum + Number(s.presentDays || 0), 0);

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="WORKFORCE LOGS"
                title="🕒 Manager Attendance"
                subtitle="Monitor daily staff presence, record shifts, and review monthly salary attendance rosters."
                actionText={saving ? "Saving..." : "💾 Save Attendance"}
                actionOnClick={save}
                actionBtnClass="btn-cta-green"
            >
                <div className="d-flex align-items-center gap-2">
                    <label className="text-light small fw-bold mb-0">Date:</label>
                    <input
                        type="date"
                        className="form-control form-control-sm bg-dark text-light border-secondary"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        style={{ maxWidth: '160px', borderRadius: '.5rem' }}
                    />
                </div>
            </DashboardHero>

            {message && <div className="alert alert-success mb-4">{message}</div>}
            {error && <div className="alert alert-danger mb-4">{error}</div>}

            <div className="module-grid">
                {/* ── Main Panel ── */}
                <div className="module-main-panel">
                    {/* Daily Register Table */}
                    <div className="card glass-table-card shadow-sm mb-4">
                        <div className="card-header bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center py-3">
                            <h6 className="mb-0 text-light fw-bold">📅 Daily Attendance Register ({date})</h6>
                            <span className="badge bg-primary">{presentCount} Present / {absentCount} Absent</span>
                        </div>
                        <div className="card-body p-0 table-responsive">
                            <table className="table table-hover mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>Staff Name</th>
                                        <th>Email</th>
                                        <th>Attendance Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="py-4">
                                                <EmptyState icon="👤" message="No farm managers assigned." submessage="Ensure active farm managers exist in the system." />
                                            </td>
                                        </tr>
                                    ) : (
                                        attendance.map((record) => (
                                            <tr key={record._id}>
                                                <td className="text-start ps-4">
                                                    <strong className="text-light">{record.name}</strong>
                                                </td>
                                                <td className="text-muted">{record.email}</td>
                                                <td>
                                                    <select
                                                        className={`form-select form-select-sm mx-auto ${record.status === 'PRESENT' ? 'border-success text-success' : 'border-danger text-danger'}`}
                                                        style={{ maxWidth: '160px', backgroundColor: '#101d22', fontWeight: 600 }}
                                                        value={record.status}
                                                        onChange={(event) => changeStatus(record._id, event.target.value)}
                                                    >
                                                        <option value="PRESENT">🟢 Present</option>
                                                        <option value="ABSENT">🔴 Absent</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Monthly Salary Attendance Summary Table */}
                    <div className="card glass-table-card shadow-sm">
                        <div className="card-header bg-dark border-bottom border-secondary d-flex justify-content-between align-items-center py-3">
                            <h6 className="mb-0 text-light fw-bold">📊 Monthly Payroll Attendance Summary</h6>
                            <input
                                type="month"
                                className="form-control form-control-sm bg-dark text-light border-secondary"
                                value={month}
                                onChange={(event) => setMonth(event.target.value)}
                                style={{ maxWidth: '170px', borderRadius: '.5rem' }}
                            />
                        </div>
                        <div className="card-body p-0 table-responsive">
                            <table className="table table-hover mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>Manager</th>
                                        <th>Present Days</th>
                                        <th>Absent Days</th>
                                        <th>Attendance %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="py-4">
                                                <EmptyState icon="📅" message="No attendance data recorded for this month." />
                                            </td>
                                        </tr>
                                    ) : (
                                        summary.map((record) => {
                                            const total = (Number(record.presentDays || 0) + Number(record.absentDays || 0)) || 1;
                                            const pct = Math.round((Number(record.presentDays || 0) / total) * 100);
                                            return (
                                                <tr key={record.manager}>
                                                    <td className="text-start ps-4">
                                                        <strong className="text-info">{record.manager}</strong>
                                                    </td>
                                                    <td className="text-success fw-bold">{record.presentDays}</td>
                                                    <td className="text-danger fw-bold">{record.absentDays}</td>
                                                    <td>
                                                        <span className={`badge ${pct >= 85 ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                            {pct}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Statistics Cards */}
                    <div className="production-summary row mt-3">
                        <DashboardCard
                            title="Present Today"
                            value={presentCount}
                            icon="👤"
                            bgColor="bg-green"
                        />
                        <DashboardCard
                            title="Absent Today"
                            value={absentCount}
                            icon="❌"
                            bgColor={absentCount > 0 ? "bg-rose" : "bg-blue"}
                        />
                        <DashboardCard
                            title="Monthly Logged Days"
                            value={totalMonthlyPresents}
                            icon="📅"
                            bgColor="bg-purple"
                        />
                        <DashboardCard
                            title="Attendance Rate"
                            value={`${attendanceRate}%`}
                            icon="📊"
                            bgColor="bg-amber"
                        />
                    </div>
                </div>

                {/* ── Right-Side Attendance Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>👥</span>
                        <strong>Attendance Insights</strong>
                        <span>⋮</span>
                    </div>

                    {/* Shift Presence Card */}
                    <div className="insights-card">
                        <div className="section-label">
                            🟢 Today's Workforce
                            <span>{date}</span>
                        </div>
                        <strong>
                            {attendanceRate}%
                            <small> on-duty</small>
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            {presentCount} of {totalStaff} managers present
                        </p>
                        <div className="insights-split">
                            <div>
                                <span>Present</span>
                                <b style={{ color: '#34d399' }}>{presentCount}</b>
                            </div>
                            <div>
                                <span>Absent</span>
                                <b style={{ color: '#f87171' }}>{absentCount}</b>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Reliability */}
                    <div className="insights-card">
                        <div className="section-label">
                            🏆 Month Summary ({month})
                            <span>Total</span>
                        </div>
                        <strong>
                            {totalMonthlyPresents} <small>shifts</small>
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            Cumulative manager days logged for payroll
                        </p>
                    </div>

                    {/* Smart Attendance Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Workforce Tip"
                        tip="Consistent attendance at morning 5:00 AM milking shifts ensures zero animal milking delays and optimal milk freshness."
                        footer="♥ Disciplined staff ensures high farm yields!"
                    />
                </aside>
            </div>
        </div>
    );
};

export default Attendance;
