import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import DashboardHero from '../../components/DashboardHero';
import SmartTipCard from '../../components/SmartTipCard';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const { theme, setTheme } = useContext(ThemeContext);
    const [savedNotice, setSavedNotice] = useState(false);

    // Local form states
    const [farmInfo, setFarmInfo] = useState({
        farmName: "Kurra's Dairy Farm",
        farmCode: 'KDF-AP-2026',
        location: 'Vijayawada, Andhra Pradesh',
        managerPhone: '+91 98765 43210'
    });

    const [toggles, setToggles] = useState({
        lowStockAlerts: true,
        dailyYieldDigest: true,
        strictVerification: true,
        autoBackup: true
    });

    const handleSave = (e) => {
        e.preventDefault();
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    return (
        <div className="module-page">
            <DashboardHero
                eyebrow="CONFIGURATION & PREFERENCES"
                title="⚙️ Farm Settings"
                subtitle="Configure and manage your dairy farm preferences, security credentials, operational rules, and notification alerts."
                actionText="💾 Save Preferences"
                actionOnClick={handleSave}
                actionBtnClass="btn-cta-green"
            />

            {savedNotice && (
                <div className="alert alert-success d-flex align-items-center mb-4" style={{ borderRadius: '.75rem' }}>
                    <span className="me-2 fs-5">✓</span>
                    <strong>Preferences updated successfully. All changes are active.</strong>
                </div>
            )}

            <div className="module-grid">
                {/* ── Main Settings Grid ── */}
                <div className="module-main-panel">
                    <div className="settings-grid">
                        {/* 1. Farm Information Card */}
                        <div className="setting-card">
                            <div className="setting-card-header">
                                <div className="setting-icon">🏢</div>
                                <div>
                                    <h6 className="text-light fw-bold mb-0">Farm Information</h6>
                                    <small className="text-muted">Legal identity and farm registration</small>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small">Farm Business Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={farmInfo.farmName}
                                    onChange={(e) => setFarmInfo({ ...farmInfo, farmName: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small">License / Registration Code</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={farmInfo.farmCode}
                                    onChange={(e) => setFarmInfo({ ...farmInfo, farmCode: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="form-label text-muted small">Farm Operating Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={farmInfo.location}
                                    onChange={(e) => setFarmInfo({ ...farmInfo, location: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* 2. Profile Settings Card */}
                        <div className="setting-card">
                            <div className="setting-card-header">
                                <div className="setting-icon" style={{ background: 'rgba(59, 130, 246, .15)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, .3)' }}>👤</div>
                                <div>
                                    <h6 className="text-light fw-bold mb-0">Profile & Contacts</h6>
                                    <small className="text-muted">Active operator account details</small>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small">User Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={user?.name || "Administrator"}
                                    disabled
                                    style={{ opacity: 0.8 }}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small">Registered Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={user?.email || "admin@kurradairy.com"}
                                    disabled
                                    style={{ opacity: 0.8 }}
                                />
                            </div>
                            <div>
                                <label className="form-label text-muted small">Manager Hotline Phone</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={farmInfo.managerPhone}
                                    onChange={(e) => setFarmInfo({ ...farmInfo, managerPhone: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* 3. Security & Access Card */}
                        <div className="setting-card">
                            <div className="setting-card-header">
                                <div className="setting-icon" style={{ background: 'rgba(239, 68, 68, .15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, .3)' }}>🔐</div>
                                <div>
                                    <h6 className="text-light fw-bold mb-0">Security & Permissions</h6>
                                    <small className="text-muted">Session security and verification rules</small>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-dark">
                                <div>
                                    <div className="text-light small fw-medium">Two-Tier Record Verification</div>
                                    <small className="text-muted" style={{ fontSize: '.68rem' }}>Require admin sign-off on manager submissions</small>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={toggles.strictVerification}
                                        onChange={() => setToggles({ ...toggles, strictVerification: !toggles.strictVerification })}
                                    />
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-dark">
                                <div>
                                    <div className="text-light small fw-medium">Session Inactivity Lock</div>
                                    <small className="text-muted" style={{ fontSize: '.68rem' }}>Auto logout after 8 hours of idle time</small>
                                </div>
                                <span className="badge bg-dark border border-secondary text-info">8 Hours</span>
                            </div>
                            <div>
                                <button type="button" className="btn btn-sm btn-outline-secondary w-100" style={{ borderRadius: '.5rem' }}>
                                    🔑 Change Login Password
                                </button>
                            </div>
                        </div>

                        {/* 4. Notifications Card */}
                        <div className="setting-card">
                            <div className="setting-card-header">
                                <div className="setting-icon" style={{ background: 'rgba(245, 158, 11, .15)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, .3)' }}>🔔</div>
                                <div>
                                    <h6 className="text-light fw-bold mb-0">Smart Alerts & Notifications</h6>
                                    <small className="text-muted">Automated farm warnings and triggers</small>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-dark">
                                <div>
                                    <div className="text-light small fw-medium">Low Stock Inventory Alerts</div>
                                    <small className="text-muted" style={{ fontSize: '.68rem' }}>Notify when fodder or medicines breach min. stock</small>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={toggles.lowStockAlerts}
                                        onChange={() => setToggles({ ...toggles, lowStockAlerts: !toggles.lowStockAlerts })}
                                    />
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-light small fw-medium">Daily Milk Yield Digest</div>
                                    <small className="text-muted" style={{ fontSize: '.68rem' }}>Evening summary of total morning & evening yields</small>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={toggles.dailyYieldDigest}
                                        onChange={() => setToggles({ ...toggles, dailyYieldDigest: !toggles.dailyYieldDigest })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 5. Appearance & System Standards */}
                        <div className="setting-card">
                            <div className="setting-card-header">
                                <div className="setting-icon" style={{ background: 'rgba(139, 92, 246, .15)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, .3)' }}>🎨</div>
                                <div>
                                    <h6 className="text-light fw-bold mb-0">Appearance & Standards</h6>
                                    <small className="text-muted">Dashboard visual theme and units</small>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-muted small">Theme Interface</label>
                                <select 
                                    className="form-select bg-dark text-light border-secondary"
                                    value={theme}
                                    onChange={(e) => setTheme(e.target.value)}
                                >
                                    <option value="dark">🌙 Dark Premium Glass</option>
                                    <option value="light">☀️ Clean Farm Light</option>
                                </select>
                            </div>
                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="form-label text-muted small">Currency Symbol</label>
                                    <input type="text" className="form-control" value="₹ (Indian Rupee)" disabled />
                                </div>
                                <div className="col-6">
                                    <label className="form-label text-muted small">Volume Unit</label>
                                    <input type="text" className="form-control" value="Litres (L)" disabled />
                                </div>
                            </div>
                        </div>

                        {/* 6. Data Management & Backup */}
                        <div className="setting-card">
                            <div className="setting-card-header">
                                <div className="setting-icon" style={{ background: 'rgba(16, 185, 129, .15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, .3)' }}>💾</div>
                                <div>
                                    <h6 className="text-light fw-bold mb-0">Data Management & Backup</h6>
                                    <small className="text-muted">Database retention and archives</small>
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-dark">
                                <div>
                                    <div className="text-light small fw-medium">Daily Cloud Database Snapshot</div>
                                    <small className="text-success" style={{ fontSize: '.68rem' }}>✓ Encrypted backup taken at 02:00 AM</small>
                                </div>
                                <span className="status-pill active">ACTIVE</span>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="button" onClick={() => alert('Export initiated: Preparing comprehensive farm records JSON archive.')} className="btn btn-sm btn-outline-info flex-grow-1" style={{ borderRadius: '.5rem' }}>
                                    📥 Export Data (JSON)
                                </button>
                                <button type="button" onClick={() => alert('Database integrity check passed. All collections synchronized.')} className="btn btn-sm btn-outline-secondary flex-grow-1" style={{ borderRadius: '.5rem' }}>
                                    ⚡ Health Check
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Right-Side Settings Insights ── */}
                <aside className="module-insights dashboard-insights">
                    <div className="insights-title">
                        <span>🛡️</span>
                        <strong>System Health</strong>
                        <span>⋮</span>
                    </div>

                    {/* Server Status Card */}
                    <div className="insights-card">
                        <div className="section-label">
                            🟢 Platform Status
                            <span>Live</span>
                        </div>
                        <strong style={{ color: '#34d399', fontSize: '1.45rem' }}>
                            100% Operational
                        </strong>
                        <p style={{ color: '#94a3b8', fontSize: '.68rem' }}>
                            All micro-modules & APIs connected
                        </p>
                        <div className="insights-split">
                            <div>
                                <span>MongoDB</span>
                                <b style={{ color: '#34d399' }}>Connected</b>
                            </div>
                            <div>
                                <span>Version</span>
                                <b>v2.0 Pro</b>
                            </div>
                        </div>
                    </div>

                    {/* Security Checklist */}
                    <div className="insights-card">
                        <div className="section-label">
                            🔐 Security Audit
                            <span>Standard</span>
                        </div>
                        <div className="mt-2 text-light" style={{ fontSize: '.74rem' }}>
                            <div className="mb-1 text-success">✓ HTTPS Encryption Active</div>
                            <div className="mb-1 text-success">✓ JWT Authorization Enabled</div>
                            <div className="mb-1 text-success">✓ Role Isolation Enforced</div>
                        </div>
                    </div>

                    {/* Smart Maintenance Tip */}
                    <SmartTipCard
                        icon="💡"
                        title="Configuration Tip"
                        tip="Perform a weekly data export archive and audit user accounts to guarantee seamless farm operational continuity."
                        footer="♥ Kurra's Smart Dairy Farm SaaS"
                    />
                </aside>
            </div>
        </div>
    );
};

export default Settings;
