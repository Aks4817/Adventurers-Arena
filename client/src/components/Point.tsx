// Point.tsx
import React from 'react';

interface PointProps {
  size: number;
  id: number;
  color: string;
  shouldGlow: boolean;
}

const Point: React.FC<PointProps> = ({ size, color, shouldGlow }) => {
  const boxShadow = shouldGlow
    ? `0 0 20px 10px ${color}`
    : "none";

  return (
    <div
      className="point-container"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: "50%",
        boxShadow: boxShadow,
        transition: "box-shadow 0.3s ease-in-out",
      }}
    />
  );
};

export default Point;
