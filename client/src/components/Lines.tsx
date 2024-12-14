import { diagonals, horizontalLines, verticalLines, nodes, extraLines } from "../constants";

interface LinesProps {
  cellSize: number;
}

export function Lines({ cellSize }: LinesProps) {
  return (
    <>
      {horizontalLines.map((line, index) => {
        const startX = (line.startCol - 1) * cellSize + cellSize / 2;
        const endX = (line.endCol - 1) * cellSize + cellSize / 2;
        const y = (line.row - 1) * cellSize + cellSize / 2;

        return (
          <div
            key={`h-line-${index}`}
            style={{
              position: "absolute",
              left: `${startX}px`,
              top: `${y}px`,
              width: `${endX - startX}px`,
              height: "10px",
              backgroundColor: "black",
              zIndex: 1,
            }}
          />
        );
      })}

      {verticalLines.map((line, index) => {
        const startY = (line.startRow - 1) * cellSize + cellSize / 2;
        const endY = (line.endRow - 1) * cellSize + cellSize / 2;
        const x = (line.col - 1) * cellSize + cellSize / 2;

        return (
          <div
            key={`v-line-${index}`}
            style={{
              position: "absolute",
              left: `${x}px`,
              top: `${startY}px`,
              width: "10px",
              height: `${endY - startY}px`,
              backgroundColor: "black",
              zIndex: 1,
            }}
          />
        );
      })}

      {diagonals.map((connection, index) => {
        const startPoint = nodes[connection.startIndex];
        const endPoint = nodes[connection.endIndex];

        if (!startPoint || !endPoint) return null;

        const startX = (startPoint.col - 1) * cellSize + cellSize / 2;
        const startY = (startPoint.row - 1) * cellSize + cellSize / 2;
        const endX = (endPoint.col - 1) * cellSize + cellSize / 2;
        const endY = (endPoint.row - 1) * cellSize + cellSize / 2;

        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <div
            key={`custom-line-${index}`}
            style={{
              position: "absolute",
              left: `${startX}px`,
              top: `${startY}px`,
              width: `${length}px`,
              height: "10px",
              backgroundColor: "black",
              zIndex: 1,
              transform: `rotate(${angle}deg)`,
              transformOrigin: "0 0",
            }}
          />
        );
      })}

      {extraLines.map((connection, connectionIndex) =>
        connection.slice(0, -1).map((startIdx, idx) => {
          const startPoint = nodes[startIdx];
          const endPoint = nodes[connection[idx + 1]];

          if (!startPoint || !endPoint) return null;

          const startX = (startPoint.col - 1) * cellSize + cellSize / 2;
          const startY = (startPoint.row - 1) * cellSize + cellSize / 2;
          const endX = (endPoint.col - 1) * cellSize + cellSize / 2;
          const endY = (endPoint.row - 1) * cellSize + cellSize / 2;

          const dx = endX - startX;
          const dy = endY - startY;
          const length = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <div
              key={`seq-line-${connectionIndex}-${idx}`}
              style={{
                position: "absolute",
                left: `${startX}px`,
                top: `${startY}px`,
                width: `${length}px`,
                height: "10px",
                backgroundColor: "black",
                zIndex: 1,
                transform: `rotate(${angle}deg)`,
                transformOrigin: "0 0",
              }}
            />
          );
        })
      )}
    </>
  );
}
