const EmptyState = ({
    icon = "📋",
    message = "No records found.",
    submessage = ""
}) => {
    return (
        <div className="text-center py-5" style={{ color: '#7d9198' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '.6rem' }}>{icon}</div>
            <div className="fw-semibold text-light mb-1">{message}</div>
            {submessage && <small className="text-muted">{submessage}</small>}
        </div>
    );
};

export default EmptyState;
