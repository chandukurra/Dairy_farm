import { Link } from 'react-router-dom';
import farmHero from '../assets/dairy-login-background.png';

const DashboardHero = ({
    eyebrow = "OPERATIONS",
    title,
    subtitle,
    actionText,
    actionLink,
    actionOnClick,
    actionBtnClass = "btn-cta-green",
    children
}) => {
    return (
        <section className="milk-hero mb-4" style={{ backgroundImage: `url(${farmHero})` }}>
            <div className="milk-hero-content">
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
                {children}
                {actionText && (
                    actionLink ? (
                        <Link to={actionLink} className={`btn ${actionBtnClass}`}>
                            {actionText}
                        </Link>
                    ) : (
                        <button type="button" onClick={actionOnClick} className={`btn ${actionBtnClass}`}>
                            {actionText}
                        </button>
                    )
                )}
            </div>
        </section>
    );
};

export default DashboardHero;
