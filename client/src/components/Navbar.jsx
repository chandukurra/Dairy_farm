import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { notifications, unreadCount, markRead, markAllRead } = useContext(NotificationContext);
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const now = new Date();
    const dateLabel = now.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

    const openNotification = (notification) => {
        markRead(notification._id);
        setShowNotifications(false);
        if (notification.link) navigate(notification.link);
    };

    return (
        <nav className="app-navbar navbar navbar-expand-lg navbar-dark px-4">
            <button className="navbar-menu btn btn-link d-none d-lg-inline p-0" aria-label="Navigation menu">☰</button>
            <span className="navbar-brand mb-0 h1 d-lg-none">🐄 Kurra's Dairy</span>
            <div className="ms-auto d-flex align-items-center">
                <div className="navbar-greeting d-none d-md-flex"><span>☀️</span><div>Good day, <strong>{user?.name || 'Farmer'}</strong><small>{dateLabel}</small></div></div>
                <div className="notification-menu">
                    <button className="notification-button" onClick={() => setShowNotifications((visible) => !visible)} aria-label="Notifications" aria-expanded={showNotifications}>
                        🔔{unreadCount > 0 && <b>{unreadCount > 9 ? '9+' : unreadCount}</b>}
                    </button>
                    {showNotifications && <div className="notification-panel">
                        <div className="notification-panel-head"><strong>Notifications</strong>{unreadCount > 0 && <button onClick={markAllRead}>Mark all read</button>}</div>
                        <div className="notification-list">
                            {notifications.length === 0 ? <p className="notification-empty">You’re all caught up.</p> : notifications.map((notification) => <button key={notification._id} className={`notification-item ${notification.isRead ? 'is-read' : ''}`} onClick={() => openNotification(notification)}>
                                <span className={`notification-type ${notification.type?.toLowerCase()}`}>●</span>
                                <span><strong>{notification.title}</strong><small>{notification.message}</small><em>{new Date(notification.createdAt).toLocaleString()}</em></span>
                            </button>)}
                        </div>
                    </div>}
                </div>
                <span className="navbar-avatar" title={user?.role}>{user?.name?.slice(0, 2).toUpperCase() || 'KD'}</span>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm ms-2">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
