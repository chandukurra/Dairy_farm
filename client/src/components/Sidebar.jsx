import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    const getBaseRoute = () => {
        if (user?.role === 'ADMIN') return '/admin';
        if (user?.role === 'FARM_MANAGER') return '/manager';
        return '/customer';
    };

    const base = getBaseRoute();

    return (
        <aside className="app-sidebar text-white min-vh-100 p-3" style={{ width: '270px', position: 'sticky', top: 0 }}>
            <h4 className="sidebar-brand text-center mb-4 d-none d-lg-block pb-3">
                <span className="brand-icon">🐄</span> Kurra's Dairy
            </h4>
            <ul className="nav nav-pills flex-column mb-auto">
                <li className="nav-item">
                    <NavLink to={`${base}/dashboard`} className="nav-link text-white" activeclassname="active">
                        Dashboard
                    </NavLink>
                </li>
                
                {(user?.role === 'ADMIN' || user?.role === 'FARM_MANAGER') && (
                    <>
                        <li><NavLink to={`${base}/animals`} className="nav-link text-white">Animals</NavLink></li>
                        <li><NavLink to={`${base}/milk`} className="nav-link text-white">Milk Production</NavLink></li>
                        <li><NavLink to={`${base}/sales`} className="nav-link text-white">Milk Sales</NavLink></li>
                        <li><NavLink to={`${base}/customers`} className="nav-link text-white">Customers</NavLink></li>
                        <li><NavLink to={`${base}/payments`} className="nav-link text-white">Payments</NavLink></li>
                        <li><NavLink to={`${base}/expenses`} className="nav-link text-white">Expenses</NavLink></li>
                        <li><NavLink to={`${base}/income`} className="nav-link text-white">Other Income</NavLink></li>
                        <li><NavLink to={`${base}/inventory`} className="nav-link text-white">Inventory</NavLink></li>
                    </>
                )}

                {user?.role === 'ADMIN' && (
                    <>
                        <li><NavLink to={`${base}/reports`} className="nav-link text-white">Reports</NavLink></li>
                        <li><NavLink to={`${base}/verifications`} className="nav-link text-white">Verifications</NavLink></li>
                        <li><NavLink to={`${base}/attendance`} className="nav-link text-white">Manager Attendance</NavLink></li>
                        <li><NavLink to={`${base}/users`} className="nav-link text-white">Users & Staff</NavLink></li>
                    </>
                )}

                {user?.role === 'CUSTOMER' && (
                    <>
                        <li><NavLink to={`${base}/purchases`} className="nav-link text-white">My Purchases</NavLink></li>
                        <li><NavLink to={`${base}/payments`} className="nav-link text-white">My Payments</NavLink></li>
                    </>
                )}
            </ul>
        </aside>
    );
};

export default Sidebar;
