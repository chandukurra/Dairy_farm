import { useEffect, useState } from 'react';
import api from '../../services/api';

const Attendance = () => {
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [attendance, setAttendance] = useState([]); const [summary, setSummary] = useState([]); const [message, setMessage] = useState(''); const [error, setError] = useState('');
    const loadDaily = async () => { try { const { data } = await api.get(`/attendance?date=${date}`); setAttendance(data.data || []); } catch (err) { setError(err.response?.data?.message || 'Failed to load attendance.'); } };
    const loadMonthly = async () => { try { const { data } = await api.get(`/attendance/monthly?month=${month}`); setSummary(data.data || []); } catch (err) { setError(err.response?.data?.message || 'Failed to load monthly summary.'); } };
    useEffect(() => { loadDaily(); }, [date]);
    useEffect(() => { loadMonthly(); }, [month]);
    const changeStatus = (id, status) => setAttendance((records) => records.map((record) => record._id === id ? { ...record, status } : record));
    const save = async () => { setMessage(''); setError(''); try { await api.post('/attendance', { date, attendance: attendance.map(({ _id, status }) => ({ manager: _id, status })) }); setMessage('Attendance saved.'); loadMonthly(); } catch (err) { setError(err.response?.data?.message || 'Failed to save attendance.'); } };
    return <div><div className="d-flex justify-content-between align-items-center mb-4"><h2>Farm Manager Attendance</h2><div><label className="me-2">Date</label><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></div></div>
        {message && <div className="alert alert-success">{message}</div>}{error && <div className="alert alert-danger">{error}</div>}
        <div className="card shadow-sm mb-4"><div className="card-body"><h5>Daily Register</h5><div className="table-responsive"><table className="table align-middle"><thead><tr><th>Farm Manager</th><th>Email</th><th>Attendance</th></tr></thead><tbody>{attendance.length === 0 ? <tr><td colSpan="3" className="text-center">No active farm managers found.</td></tr> : attendance.map((record) => <tr key={record._id}><td>{record.name}</td><td>{record.email}</td><td><select className="form-select" style={{ maxWidth: '180px' }} value={record.status} onChange={(event) => changeStatus(record._id, event.target.value)}><option value="PRESENT">Present</option><option value="ABSENT">Absent</option></select></td></tr>)}</tbody></table></div><button className="btn btn-primary" onClick={save}>Save Attendance</button></div></div>
        <div className="card shadow-sm"><div className="card-body"><div className="d-flex justify-content-between align-items-center mb-3"><h5 className="mb-0">Monthly Salary Attendance Summary</h5><input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></div><div className="table-responsive"><table className="table mb-0"><thead><tr><th>Farm Manager</th><th>Present Days</th><th>Absent Days</th></tr></thead><tbody>{summary.length === 0 ? <tr><td colSpan="3" className="text-center">No attendance has been marked for this month.</td></tr> : summary.map((record) => <tr key={record.manager}><td>{record.manager}</td><td className="text-success fw-bold">{record.presentDays}</td><td>{record.absentDays}</td></tr>)}</tbody></table></div></div></div>
    </div>;
};
export default Attendance;
