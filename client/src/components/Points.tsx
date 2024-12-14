import { nodes } from "../constants";
import Point from "./Point";
import { GameState } from "../constants";
import ScoutPiece from "../assets/ScoutPiece.png";
import KnightPiece from "../assets/KnightPiece.png";
import HealerPiece from "../assets/HealerPiece.png";
import MagePiece from "../assets/MagePiece.png";
import TankPiece from "../assets/TankPiece.png";
const PiecesImages = {
  Scout: ScoutPiece,
  Knight: KnightPiece,
  Healer: HealerPiece,
  Mage: MagePiece,
  Tank: TankPiece,
};

interface PointsProps {
  cellSize: number;
  neighbors: number[];
  currentPlayer: 1 | 2;
  handlePointClick: (index: number) => void;
  selectedPoint: number | null;
  playerPieces: GameState;
}

export function Points({
  cellSize,
  neighbors,
  handlePointClick,
  selectedPoint,
  playerPieces,
}: PointsProps) {
  return (
    <>
      {nodes.map((point, index) => {
        const left = (point.col - 1) * cellSize;
        const top = (point.row - 1) * cellSize;
        let pointColor = "#272727";
            switch(index) {
            case 1:
              pointColor = "#A2CFFD";
              break;
            case 18:
              pointColor = "#79FFBC";
              break;
            case 0:
            case 2:
              pointColor = "#0267CC";
              break;
            case 19:
            case 17:
              pointColor = "#00C060";
              break;
          }


        let pieceLabel: string | null = null;
        let pieceOwner: 1 | 2 | null = null;
        for (const player of [1, 2] as const) {
          for (const [name, piece] of Object.entries(playerPieces[player])) {
            if (piece.index === index) {
              pieceOwner = player;
              pieceLabel = name;
              break;
            }
          }
          if (pieceOwner) break;
        }

        if (pieceOwner === 1) {
          pointColor = "#00ff7f";
        } else if (pieceOwner === 2) {
          pointColor = "#1e90ff";
        }

        if (neighbors.includes(index)) {
          pointColor = "#ff4400";
        }

        if (selectedPoint === index) {
          pointColor = "#6f2da8";
        }

        return (
          <div
            className="points-point-container"
            key={index}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              left: `${left}px`,
              top: `${top}px`,
            }}
            onClick={() => handlePointClick(index)}
          >
            <Point size={cellSize} id={index} color={pointColor} shouldGlow={neighbors.includes(index) || selectedPoint === index} />
            {pieceLabel && (
              <div className="points-point-outer-container">
                <div
                  className="points-point-inner-circle"
                  style={{ backgroundColor: pointColor }}
                ></div>
                <img
                  src={PiecesImages[pieceLabel as keyof typeof PiecesImages]}
                  alt={pieceLabel}
                  className="points-piece-image"
                />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
