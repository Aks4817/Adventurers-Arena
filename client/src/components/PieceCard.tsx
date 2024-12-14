import { useAppContext } from '../Context'; // Import context

interface PieceCardProps {
  name: string;
  selected?: boolean;
  hp: number;
  atk: number;
  isSelf: boolean;
  canDeploy?: boolean;
  isTarget?: boolean;
  inRecovery?: boolean;
}

export const PieceCard = ({
  name,
  selected = false,
  hp,
  atk,
  isSelf,
  canDeploy = false,
  isTarget = false,
  inRecovery = false,
}: PieceCardProps) => {
  const { skinImageMap } = useAppContext(); // Access the image map from context

  let backgroundColor =
    inRecovery
      ? "#0d0d0d"
      : !isSelf
      ? isTarget
        ? "#0000cd"
        : "#9932cc"
      : selected
      ? "#fc3126"
      : canDeploy
      ? "#ffd500"
      : "#ff8c00";

  const pieceImage = skinImageMap[`${name}Card`]; // Use the image mapping from context

  const shouldGlow = backgroundColor === "#0000cd" || backgroundColor === "#fc3126";
  const boxShadow = shouldGlow
    ? `0 0 20px 10px ${backgroundColor}`
    : "none";

  return (
    <div
      className={`piececard-container merienda-regular`}
      style={{
        backgroundColor,
        boxShadow: boxShadow,
        transition: "box-shadow 0.3s ease-in-out",
      }}
    >
      <div className="piececard-image-container">
        {pieceImage ? (
          <img src={pieceImage} alt={name} className="piececard-image" />
        ) : (
          <span>{name || "{Placeholder image}"}</span>
        )}
      </div>
      <div className="piececard-stats-container">
        <div>HP: {hp}</div>
        <div>ATK: {atk}</div>
      </div>
    </div>
  );
};