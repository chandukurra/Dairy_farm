const DashboardCard = ({ title, value, icon, bgColor = "bg-primary" }) => {
    return (
        <div className="col-md-3 mb-4">
            <div className={`dashboard-stat card text-white ${bgColor} shadow-sm h-100`}>
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="card-title mb-1 text-uppercase text-white-50">{title}</h6>
                        <h3 className="mb-0">{value}</h3>
                    </div>
                    <div className="fs-1 opacity-50">{icon}</div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCard;
