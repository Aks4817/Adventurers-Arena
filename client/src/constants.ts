// Array of positions for red points
export const nodes = [
    { row: 1, col: 1 }, { row: 1, col: 8 }, { row: 1, col: 15 },
    { row: 4, col: 1 }, { row: 4, col: 4 }, { row: 4, col: 8 }, { row: 4, col: 12 }, { row: 4, col: 15 },
    { row: 7, col: 1 }, { row: 7, col: 4 }, { row: 7, col: 12 }, { row: 7, col: 15 },
    { row: 10, col: 1 }, { row: 10, col: 4 }, { row: 10, col: 8 }, { row: 10, col: 12 }, { row: 10, col: 15 },
    { row: 13, col: 1 }, { row: 13, col: 8 }, { row: 13, col: 15 },
  ];
  
  // Positions for horizontal lines in the first and last rows
  export const horizontalLines = [
    { startCol: 1, endCol: 8, row: 1 },
    { startCol: 8, endCol: 15, row: 1 },
    { startCol: 1, endCol: 8, row: 13 },
    { startCol: 8, endCol: 15, row: 13 },
  ];
  
  // Positions for vertical lines in the first and last columns
  export const verticalLines = [
    { startRow: 1, endRow: 7, col: 1 },
    { startRow: 7, endRow: 13, col: 1 },
    { startRow: 1, endRow: 7, col: 15 },
    { startRow: 7, endRow: 13, col: 15 },
  ];
  
  // Custom diagonal connections between points by index
  export const diagonals = [
    { startIndex: 0, endIndex: 4 },
    { startIndex: 2, endIndex: 6 },
    { startIndex: 17, endIndex: 13 },
    { startIndex: 19, endIndex: 15 },
    { startIndex: 5, endIndex: 9 },
    { startIndex: 10, endIndex: 14 },
  ];
  
  // Sequential connections between multiple points
  export const extraLines = [
    [4, 5, 6],
    [13, 14, 15],
    [4, 9, 13],
    [6, 10, 15],
  ];


  export type PieceType = {
    mv: number;
    hp: number;
    atk: number;
    specialAbility: string;
    heal?: number; // Only `Healer` will have this property
  };

  export type PlayersPieces = {
    mv: number;
    hp: number;
    atk: number;
    specialAbility: string;
    heal?: number;
    index: number; 
  };

  export const Pieces: Record<string, PieceType> = {
    Scout: {
      mv: 3,
      hp: 15,
      atk: 10,
      specialAbility: "Pathfinder"
    },
    Knight: {
      mv: 2,
      hp: 25,
      atk: 15,
      specialAbility: "Aggressor"
    },
    Tank: {
      mv: 1,
      hp: 40,
      atk: 10,
      specialAbility: "Fortified"
    },
    Mage: {
      mv: 2,
      hp: 20,
      atk: 15,
      specialAbility: "Ranged"
    },
    Healer: {
      mv: 2,
      hp: 30,
      atk: 5,
      heal: 15, // Specific to Healer
      specialAbility: "Medic"
    }
  };

  export type GameState = {
    1: Record<string, PlayersPieces>;  // Player 1's pieces, indexed by piece name (e.g., 'Scout', 'Knight', etc.)
    2: Record<string, PlayersPieces>;  // Player 2's pieces, indexed by piece name
  };
  
    
 export const initialGameState: GameState = {
  1: {
    Scout: { ...Pieces.Scout, index: -1 },
    Knight: { ...Pieces.Knight, index: -1 },
    Tank: { ...Pieces.Tank, index: -1 },
    Mage: { ...Pieces.Mage, index: -1 },
    Healer: { ...Pieces.Healer, index: -1 }
  },
  2: {
    Scout: { ...Pieces.Scout, index: -1 },
    Knight: { ...Pieces.Knight, index: -1 },
    Tank: { ...Pieces.Tank, index: -1 },
    Mage: { ...Pieces.Mage, index: -1 },
    Healer: { ...Pieces.Healer, index: -1 }
  }
};
  

export const cellSize = Math.min(
  window.innerWidth * 15 / 28 / 15,
  window.innerWidth * 13 / 28 / 13
);

export const containerWidth = cellSize * 15;
export const containerHeight = cellSize * 13;

export const entryPoints = {
  1: [17, 19],
  2: [0, 2],
};

