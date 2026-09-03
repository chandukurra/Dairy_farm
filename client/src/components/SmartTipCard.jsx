const SmartTipCard = ({
    icon = "💡",
    title = "Smart Farm Tip",
    tip,
    footer = "♥ Healthy farm, thriving business!"
}) => {
    return (
        <div className="farm-tip">
            <span>{icon}</span>
            <div>
                <strong>{title}</strong>
                <p>{tip}</p>
                {footer && <small>{footer}</small>}
            </div>
        </div>
    );
};

export default SmartTipCard;
