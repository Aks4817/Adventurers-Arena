import { PlayersPieces } from "./constants";
type Graph = Record<number, number[]>;

export const graph: Graph = {
  0: [1,3,4],
  1: [0,2],
  2: [1,6,7],
  3: [0,8],
  4: [0, 5, 9],
  5: [4, 6],
  6: [2, 5, 10],
  7: [2,11],
  8: [3,12],
  9: [4, 13],
  10: [6, 15],
  11: [7,16],
  12: [8,17],
  13: [9, 14, 17],
  14: [10, 13, 15],
  15: [10, 14, 19],
  16: [11,19],
  17: [12,13,18],
  18: [17,19],
  19: [15,16,18],
};

export function getNodesWithinMv(graph: Graph, startNode: number, maxDistance: number): number[] {
  const queue: [number, number][] = [[startNode, 0]]; // [node, distance]
  const visited = new Set<number>();
  const result: number[] = [];

  while (queue.length > 0) {
    const [currentNode, distance] = queue.shift()!;

    if (distance > maxDistance) break;

    visited.add(currentNode);
    result.push(currentNode);

    for (const neighbor of graph[currentNode] || []) {
      if (!visited.has(neighbor)) {
        queue.push([neighbor, distance + 1]);
        visited.add(neighbor);
      }
    }
  }

  return result.filter(node => node !== startNode);
}


export function getValidJumpPoints(
  graph: Graph,
  startNode: number,
  gameState: { 1: Record<string, PlayersPieces>; 2: Record<string, PlayersPieces> },
  allNeighbors: number[] // Pass precomputed neighbors
): number[] {
  // Collect all occupied points from the game state
  const occupiedPoints = new Set<number>();

  // Iterate over both players and collect the indices of their pieces
  for (const player of [1, 2]) {
    const playerPieces = gameState[player as 1 | 2]; // Explicitly type the player key
    for (const pieceName in playerPieces) {
      const piece = playerPieces[pieceName];
      if (piece.index !== -1) {
        occupiedPoints.add(piece.index);
      }
    }
  }

  
  const isPathClear = (start: number, end: number): boolean => {
    const queue: number[] = [start];
    const visited = new Set<number>([start]);

    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      if (currentNode === end) return true;

      for (const neighbor of graph[currentNode] || []) {
        if (allNeighbors.includes(neighbor) && !visited.has(neighbor) && !occupiedPoints.has(neighbor)) {
          queue.push(neighbor);
          visited.add(neighbor);
        }
      }
    }

    return false; // If no path exists
  };

  return allNeighbors.filter((neighbor) => isPathClear(startNode, neighbor));
}

export function getUnoccupiedNodes(
  gameState: { 1: Record<string, PlayersPieces>; 2: Record<string, PlayersPieces> },
  allNeighbors: number[] // Precomputed neighbors
): number[] {
  // Collect all occupied points from the game state
  const occupiedPoints = new Set<number>();

  // Iterate over both players and collect the indices of their pieces
  for (const player of [1, 2]) {
    const playerPieces = gameState[player as 1 | 2]; // Explicitly type the player key
    for (const pieceName in playerPieces) {
      const piece = playerPieces[pieceName];
      if (piece.index !== -1) {
        occupiedPoints.add(piece.index);
      }
    }
  }

  // Filter neighbors to return only those that are not occupied
  return allNeighbors.filter((neighbor) => !occupiedPoints.has(neighbor));
}

export function getAdjacentEnemyPieces(
  graph: Graph,
  pieceName: string, // The piece name whose adjacency we need to check
  gameState: { 1: Record<string, PlayersPieces>; 2: Record<string, PlayersPieces> }, // The game state
  playerNumber: 1 | 2, // The player whose piece's adjacency to the enemy should be checked
  reach: number = 1 // Optional reach value, defaults to 1
): string[] {
  const enemyPlayer = playerNumber === 1 ? 2 : 1;
  const adjacentEnemyPieces: string[] = [];

  // Get the piece index from the game state
  const playerPieces = gameState[playerNumber];
  const piece = playerPieces[pieceName];

  if (piece && piece.index !== -1) {
    const pieceIndex = piece.index;

    // A set to track nodes within the specified reach
    const reachableIndexes = new Set<number>();
    const visited = new Set<number>();
    const queue: { node: number; depth: number }[] = [{ node: pieceIndex, depth: 0 }];

    // Perform a BFS to find all nodes within the specified reach
    while (queue.length > 0) {
      const { node, depth } = queue.shift()!;
      if (depth > reach) continue; // Stop if beyond reach
      if (visited.has(node)) continue; // Skip already visited nodes
      visited.add(node);

      reachableIndexes.add(node);
      for (const neighbor of graph[node] || []) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, depth: depth + 1 });
        }
      }
    }

    // Check if any enemy pieces occupy the reachable nodes
    for (const enemyPieceName in gameState[enemyPlayer]) {
      const enemyPiece = gameState[enemyPlayer][enemyPieceName];
      if (reachableIndexes.has(enemyPiece.index)) {
        adjacentEnemyPieces.push(enemyPieceName); // Add enemy piece name if within reach
      }
    }
  }

  return adjacentEnemyPieces; // Return the names of the enemy pieces within the specified reach
}

export function neighborNode(
  graph: Graph, // The graph representing connections between nodes
  index1: number, // The first index
  index2: number // The second index
): boolean {
  // Get the neighbors of index1
  const neighbors = graph[index1] || [];
  
  // Check if index2 is among the neighbors of index1
  return neighbors.includes(index2);
}

