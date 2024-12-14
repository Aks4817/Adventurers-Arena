interface BuyCardProps {
  image: string;
  title: string;
  onAction: () => void;
  buttonText: string;
}

const BuyCard: React.FC<BuyCardProps> = ({ image, title, onAction, buttonText }) => {
  return (
    <div className="card">
      <img src={image} alt={title} />
      <h3>{title}</h3>
      <button onClick={onAction}>{buttonText}</button>
    </div>
  );
};

export default BuyCard;
