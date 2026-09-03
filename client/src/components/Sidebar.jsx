import { NavLink } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import SupportCenterModal from './SupportCenterModal';

const Sidebar = () => {
    const { user } = useContext(AuthContext);
    const [isSupportOpen, setIsSupportOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setIsSupportOpen(true);
        window.addEventListener('open-support-center', handleOpen);
        return () => window.removeEventListener('open-support-center', handleOpen);
    }, []);

    const getBaseRoute = () => {
        if (user?.role === 'ADMIN') return '/admin';
        if (user?.role === 'FARM_MANAGER') return '/manager';
        return '/customer';
    };

    const base = getBaseRoute();

    return (
        <aside className="app-sidebar text-white min-vh-100 p-3" style={{ width: '270px', position: 'sticky', top: 0 }}>
            <div className="sidebar-brand mb-4 d-none d-lg-flex align-items-center pb-3">
                <span className="brand-icon">🐄</span>
                <span>
                    <strong>Kurra's Dairy</strong>
                    <small>Smart Dairy Farm</small>
                </span>
            </div>
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <NavLink to={`${base}/dashboard`} className="nav-link text-white">
                        <span className="nav-icon">⌂</span> Dashboard
                    </NavLink>
                </li>
                
                {(user?.role === 'ADMIN' || user?.role === 'FARM_MANAGER') && (
                    <>
                        <li><NavLink to={`${base}/animals`} className="nav-link text-white"><span className="nav-icon">🐄</span> Animals</NavLink></li>
                        <li><NavLink to={`${base}/milk`} className="nav-link text-white"><span className="nav-icon">🥛</span> Milk Production</NavLink></li>
                        <li><NavLink to={`${base}/sales`} className="nav-link text-white"><span className="nav-icon">🛒</span> Milk Sales</NavLink></li>
                        <li><NavLink to={`${base}/customers`} className="nav-link text-white"><span className="nav-icon">♧</span> Customers</NavLink></li>
                        <li><NavLink to={`${base}/payments`} className="nav-link text-white"><span className="nav-icon">▣</span> Payments</NavLink></li>
                        <li><NavLink to={`${base}/expenses`} className="nav-link text-white"><span className="nav-icon">▱</span> Expenses</NavLink></li>
                        <li><NavLink to={`${base}/income`} className="nav-link text-white"><span className="nav-icon">$</span> Other Income</NavLink></li>
                        <li><NavLink to={`${base}/inventory`} className="nav-link text-white"><span className="nav-icon">□</span> Inventory</NavLink></li>
                    </>
                )}

                {user?.role === 'ADMIN' && (
                    <>
                        <li><NavLink to={`${base}/reports`} className="nav-link text-white"><span className="nav-icon">📊</span> Reports</NavLink></li>
                        <li><NavLink to={`${base}/verifications`} className="nav-link text-white"><span className="nav-icon">✓</span> Verifications</NavLink></li>
                        <li><NavLink to={`${base}/attendance`} className="nav-link text-white"><span className="nav-icon">🕒</span> Manager Attendance</NavLink></li>
                        <li><NavLink to={`${base}/users`} className="nav-link text-white"><span className="nav-icon">👥</span> Users & Staff</NavLink></li>
                    </>
                )}

                {(user?.role === 'ADMIN' || user?.role === 'FARM_MANAGER') && (
                    <li><NavLink to={`${base}/settings`} className="nav-link text-white"><span className="nav-icon">⚙️</span> Settings</NavLink></li>
                )}

                {user?.role === 'CUSTOMER' && (
                    <>
                        <li><NavLink to={`${base}/purchases`} className="nav-link text-white">My Purchases</NavLink></li>
                        <li><NavLink to={`${base}/payments`} className="nav-link text-white">My Payments</NavLink></li>
                    </>
                )}
            </ul>
            <div
                className="sidebar-help d-none d-lg-flex"
                role="button"
                tabIndex={0}
                onClick={() => setIsSupportOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsSupportOpen(true);
                    }
                }}
                title="Click to open Help & Support Center"
            >
                <span>🎧</span>
                <div>
                    <strong>Need help?</strong>
                    <small>Contact support</small>
                </div>
            </div>

            <SupportCenterModal
                isOpen={isSupportOpen}
                onClose={() => setIsSupportOpen(false)}
            />
        </aside>
    );
};

export default Sidebar;
