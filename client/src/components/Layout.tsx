import { ReactNode } from "react";
import { Lines } from "./Lines";

interface LayoutProps {
  cellSize: number;
  containerWidth: number;
  containerHeight: number;
  children: ReactNode;
}

export function Layout({
  cellSize,
  containerWidth,
  containerHeight,
  children,
}: LayoutProps) {
  return (
    <div
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        position: "relative",
      }}
    >
      <Lines cellSize={cellSize} />
      {children}
    </div>
  );
}
