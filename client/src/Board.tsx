import { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Points } from "./components/Points";
import { graph, getNodesWithinMv, getValidJumpPoints, getAdjacentEnemyPieces, getUnoccupiedNodes, neighborNode } from "./utils";
import { cellSize, containerHeight, containerWidth, entryPoints, initialGameState, GameState } from "./constants";
import { PieceCard } from "./components/PieceCard";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "./Context"; 

interface BoardProps {
  socket:Socket
}

export default function Board({socket}: BoardProps ) {
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [playerPiecesData, setPlayerPiecesData] = useState<GameState>(initialGameState);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [activePiece, setActivePiece] = useState<string | null>(null);
  const [neighbors, setNeighbors] = useState<number[]>([]);
  const [targets, setTargets]=useState<string[]>([]);
  const [targettedBy, setTargettedBy]=useState<string | null>(null);
  const [inRecovery, setInRecovery] = useState<{ 1: string | null; 2: string | null }>({ 1: null, 2: null });
  const [healerSelected, setHealerSelected] = useState(false);
  const [gameStarted, setGameStarted]=useState<boolean>(false);
  const [gameWon, setGameWon]=useState<0 | 1 | 2 > (0);
  const [winnerAddr, setWinnerAddr]=useState<string | null>(null);
  const [playerDC, setPlayerDC]=useState<boolean>(false);
  const [registering, setRegistering]=useState<number>(1);
  const { skinImageMap, contract } = useAppContext(); 
  const backgroundImage = skinImageMap["Map"];
  const urlParams = new URLSearchParams(window.location.search);
  const roomCode = urlParams.get('roomCode');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("assignPlayer", (number: number) => {
      setPlayerNumber(number);
      console.log(`Assigned Player Number: ${number}`);
    });
  
    socket.on("updateGameState", (newState) => {
      setPlayerPiecesData(newState.playerPiecesData);
      setCurrentPlayer(newState.currentPlayer);
      setTargets([]);
      setTargettedBy(null);
      handleRecoveryPieces();
      setHealerSelected(false);
    });
  
    socket.on("resetGame", () => {
      setTargets([]);
      setTargettedBy(null);
      setPlayerDC(true);
    });
    
    socket.on("startGame", () => {
      setGameStarted(true);
    });

      socket.on("gameWon", (data) => {
        setPlayerPiecesData(data.playerPiecesData);
        if (data.winner !== 0) {
          setGameWon(data.winner);
          if (data.registerWin != null) {
            setWinnerAddr(data.registerWin);
        }
        }
      });
  
    return () => {
      socket.off("assignPlayer");
      socket.off("updateGameState");
      socket.off("resetGame");
      socket.off("startGame");
      socket.off("gameWon");
    };
  }, []);

  const goLobby = () => {
    navigate("/");
  }

  const forfeit = () => {
    socket.emit("forfeit", {
      playerNumber,
      playerPiecesData
    });
  }

  const handleRecoveryPieces = () => {
    if (!playerNumber) {return;}
    const opponentPlayer = playerNumber === 1 ? 2 : 1;
    const updatedPlayerPiecesData = { ...playerPiecesData };
  
    let selfNewInRecovery: string | null = null;
    let previousSelfInRecovery = inRecovery[playerNumber as 1 | 2];
  
    for (const [pieceId, piece] of Object.entries(playerPiecesData[playerNumber as 1 | 2])) {
      if (piece.index === -2) {
        if (!selfNewInRecovery) {
          selfNewInRecovery = pieceId;
        } else {
          updatedPlayerPiecesData[playerNumber as 1 | 2] = {
            ...updatedPlayerPiecesData[playerNumber as 1 | 2],
            [pieceId]: {
              ...piece,
              index: -1,
            },
          };
        }
      }
    }
    if (selfNewInRecovery && selfNewInRecovery !== previousSelfInRecovery) {
      if (previousSelfInRecovery) {
        updatedPlayerPiecesData[playerNumber as 1 | 2] = {
          ...updatedPlayerPiecesData[playerNumber as 1 | 2],
          [previousSelfInRecovery]: {
            ...updatedPlayerPiecesData[playerNumber as 1 | 2][previousSelfInRecovery],
            index: -1,
          },
        };
      }
      setInRecovery((prev) => ({
        ...prev,
        [playerNumber]: selfNewInRecovery,
      }));
    }
    let opponentNewInRecovery: string | null = null;
    let previousOpponentInRecovery = inRecovery[opponentPlayer];
    for (const [pieceId, piece] of Object.entries(playerPiecesData[opponentPlayer])) {
      if (piece.index === -2) {
        if (!opponentNewInRecovery) {
          opponentNewInRecovery = pieceId;
        } else {
          updatedPlayerPiecesData[opponentPlayer] = {
            ...updatedPlayerPiecesData[opponentPlayer],
            [pieceId]: {
              ...piece,
              index: -1,
            },
          };
        }
      }
    }
    if (opponentNewInRecovery && opponentNewInRecovery !== previousOpponentInRecovery) {
      if (previousOpponentInRecovery) {
        updatedPlayerPiecesData[opponentPlayer] = {
          ...updatedPlayerPiecesData[opponentPlayer],
          [previousOpponentInRecovery]: {
            ...updatedPlayerPiecesData[opponentPlayer][previousOpponentInRecovery],
            index: -1,
          },
        };
      }
      setInRecovery((prev) => ({
        ...prev,
        [opponentPlayer]: opponentNewInRecovery,
      }));
    }
    setPlayerPiecesData(updatedPlayerPiecesData);
  };

  const handleDeployment = (pieceName: string) => {

    setNeighbors([]);
    setSelectedPoint(null);
    if (activePiece === pieceName) {
      setActivePiece(null);
      setIsPlacingMode(false);
    } else {
      setActivePiece(pieceName);
      setIsPlacingMode(true);
    }
  };

  const handleHeal = (targetPieceName: string) => {
    if (!playerNumber || currentPlayer!==playerNumber) {
      return;
    }
    const healer = Object.entries(playerPiecesData[playerNumber as 1 | 2]).find(
      ([_, piece]) => targettedBy === "Healer" && piece.index > -1
    )?.[1];
    if (!healer || healer.index < 0) {
      return;
    }
    const updatedPlayerPiecesData = { ...playerPiecesData };
    const targetPiece = updatedPlayerPiecesData[playerNumber as 1 | 2][targetPieceName];
    if (!targetPiece || targetPiece.index < 0) {
      return;
    }
    const healAmount = healer.heal || 10;
    const maxHp = initialGameState[playerNumber as 1 | 2][targetPieceName].hp;
    updatedPlayerPiecesData[playerNumber as 1 | 2] = {
      ...updatedPlayerPiecesData[playerNumber as 1 | 2],
      [targetPieceName]: {
        ...targetPiece,
        hp: Math.min(targetPiece.hp + healAmount, maxHp),
      },
    };
    setPlayerPiecesData(updatedPlayerPiecesData);
    socket.emit("playerMove", {
      playerPiecesData: updatedPlayerPiecesData,
      currentPlayer,
    });
  };

  const handleAttack = (targetPieceName: string) => {
    if (!playerNumber || !targettedBy || playerNumber !== currentPlayer) {
      return;
    }let extraDmg = 0;
    let extraDefenseEnemyTank = 0;
    let extraDefensePlayerTank = 0;
    let rangedAttack=false;
    const attacker = playerPiecesData[playerNumber as 1 | 2][targettedBy];
    const opponentPlayer = playerNumber === 1 ? 2 : 1;
    const target = playerPiecesData[opponentPlayer][targetPieceName];

    if (!attacker || !target) {
      return;
    }
    if (targettedBy === "Knight") {
      extraDmg = 5;
    }
    if (target.specialAbility === "Fortified" && target.index === (opponentPlayer === 1 ? 18 : 1)) {
      extraDefenseEnemyTank = 1;
    }
    if (attacker.specialAbility === "Fortified" && attacker.index === (playerNumber === 1 ? 18 : 1)) {
      extraDefensePlayerTank = 1;
    }
    if (attacker.specialAbility === "Ranged") {
      rangedAttack = !neighborNode(graph, attacker.index, target.index);
    }
    const updatedAttackerHp = rangedAttack ? attacker.hp : Math.max(attacker.hp + extraDefensePlayerTank - target.atk, 0);
    const updatedTargetHp = Math.max(target.hp + extraDefenseEnemyTank - (attacker.atk + extraDmg), 0);
    extraDmg = 0;
    const updatedPlayerPiecesData = { ...playerPiecesData };
    if (updatedAttackerHp === 0) {
      const currentInRecovery = inRecovery[playerNumber];
      if (currentInRecovery) {
        updatedPlayerPiecesData[playerNumber] = {
          ...updatedPlayerPiecesData[playerNumber],
          [currentInRecovery]: {
            ...updatedPlayerPiecesData[playerNumber][currentInRecovery],
            index: -1,
          },
        };
      }
      updatedPlayerPiecesData[playerNumber] = {
        ...updatedPlayerPiecesData[playerNumber],
        [targettedBy]: {
          ...attacker,
          hp: initialGameState[playerNumber][targettedBy].hp,
          index: -2,
        },
      };
  
      setInRecovery((prev) => ({
        ...prev,
        [playerNumber]: targettedBy,
      }));
    } else {
      updatedPlayerPiecesData[playerNumber] = {
        ...updatedPlayerPiecesData[playerNumber],
        [targettedBy]: {
          ...attacker,
          hp: updatedAttackerHp,
        },
      };
    }
    if (updatedTargetHp === 0) {
      const currentInRecovery = inRecovery[opponentPlayer];
      if (currentInRecovery) {
        updatedPlayerPiecesData[opponentPlayer] = {
          ...updatedPlayerPiecesData[opponentPlayer],
          [currentInRecovery]: {
            ...updatedPlayerPiecesData[opponentPlayer][currentInRecovery],
            index: -1,
          },
        };
      }
      updatedPlayerPiecesData[opponentPlayer] = {
        ...updatedPlayerPiecesData[opponentPlayer],
        [targetPieceName]: {
          ...target,
          hp: initialGameState[opponentPlayer][targetPieceName].hp,
          index: -2,
        },
      };
      setInRecovery((prev) => ({
        ...prev,
        [opponentPlayer]: targetPieceName,
      }));
    } else {
      updatedPlayerPiecesData[opponentPlayer] = {
        ...updatedPlayerPiecesData[opponentPlayer],
        [targetPieceName]: {
          ...target,
          hp: updatedTargetHp,
        },
      };
    }
    setPlayerPiecesData(updatedPlayerPiecesData);
    socket.emit("playerMove", {
      playerPiecesData: updatedPlayerPiecesData,
      currentPlayer: playerNumber === 1 ? 2 : 1,
    });
    setTargets([]);
    setTargettedBy(null);
    setActivePiece(null);
    setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
  };

  const handleAttacking = (pieceName: string) => {
    if(playerNumber){ 
      setTargettedBy(pieceName);
      if (pieceName === "Healer") {
        setHealerSelected(true);
      } else {
        setHealerSelected(false);
      }
      if(pieceName=="Mage"){
        setTargets(getAdjacentEnemyPieces(graph, pieceName, playerPiecesData, playerNumber as 1|2, 2));
      }else{
        setTargets(getAdjacentEnemyPieces(graph, pieceName, playerPiecesData, playerNumber as 1|2));
      }
    }
  };

  const handlePieceButtonClick = (pieceName: string, canDeploy : boolean) => {
    if(canDeploy){
      setTargets([]);
      handleDeployment(pieceName);
      setHealerSelected(false);
    }
    else{
      handleAttacking(pieceName);
    }
  };

  const handlePointClick = (index: number) => {
    if (playerNumber !== currentPlayer) {
      return;
    }
    if (isPlacingMode && activePiece !== null) {
      const playerPieces = playerPiecesData[currentPlayer];
      const validPlacement = entryPoints[currentPlayer].includes(index);

      if (validPlacement && !Object.values(playerPieces).some(piece => piece.index === index)) {
        const pieceData = playerPiecesData[currentPlayer][activePiece];

        const newPlayerPiecesData = {
          ...playerPiecesData,
          [currentPlayer]: {
            ...playerPiecesData[currentPlayer],
            [activePiece]: { ...pieceData, index }
          },
        };
        setPlayerPiecesData(newPlayerPiecesData);
        socket.emit("playerMove", {
          playerPiecesData: newPlayerPiecesData,
          currentPlayer: currentPlayer === 1 ? 2 : 1,
        });
        setIsPlacingMode(false);
        setActivePiece(null);
        setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
        setTargets([]);
      }
    } else if (!isPlacingMode) {
      if (Object.values(playerPiecesData[currentPlayer]).some(piece => piece.index === index)) {
        if (selectedPoint === index) {
          setSelectedPoint(null);
          setNeighbors([]);
        } else {
          setSelectedPoint(index);
          const selectedPiece = Object.values(playerPiecesData[currentPlayer]).find(
            (piece) => piece.index === index
          );
          if (selectedPiece) {
          const allWithinReachNeighbors = getNodesWithinMv(graph, index, selectedPiece.mv);
          if(selectedPiece.specialAbility==="Pathfinder"){
            const validPoints = getUnoccupiedNodes(playerPiecesData, allWithinReachNeighbors);
            setNeighbors(validPoints);
          }else{
            const validPoints = getValidJumpPoints(graph, index, playerPiecesData, allWithinReachNeighbors);
            setNeighbors(validPoints);
          }
        setTargets([]);
        }
      }
      } else if (neighbors.includes(index)) {
        if (selectedPoint !== null) {
          const updatedPlayerPieces = Object.fromEntries(
            Object.entries(playerPiecesData[currentPlayer]).map(([pieceName, piece]) => [
              pieceName,
              piece.index === selectedPoint ? { ...piece, index } : piece,
            ])
            );
            const newPlayerPiecesData = {
              ...playerPiecesData,
            [currentPlayer]: updatedPlayerPieces,
          };
          setPlayerPiecesData(newPlayerPiecesData);

          setNeighbors([]);
          setSelectedPoint(null);
          socket.emit("playerMove", {
            playerPiecesData: newPlayerPiecesData,
            currentPlayer: currentPlayer === 1 ? 2 : 1,
          });
          setCurrentPlayer((prev) => (prev === 1 ? 2 : 1));
        setTargets([]);

        }
      }
    }
  };

  const registerWinner = async() =>{
    setRegistering(2);
    
    try {
    const tx = await contract.registerWinner(roomCode, winnerAddr);
    await tx.wait();
  } catch (error) {
    console.error("Error buying item:", error);
  }
    setRegistering(3);
    console.log("Registered the winner");
    const winnings =await contract.getWinnings(winnerAddr);
    const winBal =await  contract.getWinningTokensAmount(winnerAddr);
    console.log("Winnings", winnings, " balance ", winBal);
  }

  const SelfPlayer = playerNumber;
  const OpponentPlayer = playerNumber === 1 ? 2 : 1;
  console.log(playerNumber);
  if(SelfPlayer!=null && OpponentPlayer!=null && gameStarted){
  return (
    <div className="board-container"   style={{
      backgroundImage: `url(${backgroundImage})`}}>
       {gameWon!==0 && (
        <div className="overlay">
          <p className="overlay-text-win medievalsharp-regular"           style={{
            color: gameWon === playerNumber ? "#ffd500" : "#9932cc",
          }}>
            {gameWon === playerNumber ? "You" : `Opponent `} Won
          </p>
          <button className="overlay-button merienda-regular" onClick={goLobby}>
            Go back to Lobby
          </button>
          {(registering < 3 && winnerAddr!==null && 
             <button className="overlay-button merienda-regular" onClick={registerWinner}>
             {registering!=1 ? "Registering" : "Register Winner"}
             </button>
             )}
         
        </div>
      )}
       {playerDC && (
        <div className="overlay">
          <p className="overlay-text-win medievalsharp-regular">
            A Player Disconnected
          </p>
          <button className="overlay-button merienda-regular" onClick={goLobby}>
            Go back to Lobby
          </button>
        </div>
      )}
      <div className="board-left-panel">
        <div className="board-left-panel-margin">
        <h1 
          className="player-turn"  
          style={{
            color: currentPlayer === playerNumber ? "#ffd500" : "#9932cc",
          }}
        >
          {currentPlayer === playerNumber ? "Your Turn" : "Opponent's Turn"}
        </h1>
          <div className="board-main-content">
            <div className="board-player-row">
              {Object.entries(playerPiecesData[SelfPlayer as 1 | 2]).map(([name, piece], index) => {
                const canDeploy = piece.index === -1;
                const isInRecovery = piece.index === -2;

                const isDeployed = piece.index > -1; //  const isHealerActive = targettedBy === "Healer";
                const isHealerOnBoard = playerPiecesData[SelfPlayer as 1 | 2].Healer?.index > -1;
                const shouldShowHealButton = healerSelected && isDeployed && isHealerOnBoard && activePiece === null;

                return (
                  <div key={`player-${index}`} onClick={() => handlePieceButtonClick(name, canDeploy)} className="board-piece-container">
                    {shouldShowHealButton && (
                      <button onClick={(e) => {e.stopPropagation();handleHeal(name);}} className="board-heal-button">
                        Heal
                      </button>
                    )}
                    <PieceCard
                      name={name}
                      selected={name === activePiece}
                      hp={piece.hp}
                      atk={piece.atk}
                      isSelf={true}
                      canDeploy={canDeploy}
                      inRecovery={isInRecovery}
                    />
                  </div>
                  );
                })}
                </div>

              <div className="board-piece-row">
              {Object.entries(playerPiecesData[OpponentPlayer as 1 | 2]).map(([name, piece], index) => {
                const isInRecovery = piece.index===-2;
                return (
                  <div key={`opponent-${index}`} onClick={() => {
                      if (targets.includes(name) && !isInRecovery) {
                        handleAttack(name);
                      }
                    }}
                    style={{cursor: targets.includes(name) && !isInRecovery ? "pointer" : "not-allowed",}}>
                    <PieceCard
                      name={name}
                      hp={piece.hp}
                      atk={piece.atk}
                      isSelf={false}
                      canDeploy={false}
                      isTarget={targets.includes(name)}
                      inRecovery={isInRecovery} 
                    />
                  </div>
                  );
                })}
                </div>
              </div>

              <button className="forfeit-button merienda-regular" onClick={forfeit}>Forfeit</button>
            </div>
          </div>
            <div className="board-right-container">
              <Layout
                cellSize={cellSize}
                containerWidth={containerWidth}
                containerHeight={containerHeight}
              >
                <Points
                  cellSize={cellSize}
                  neighbors={neighbors}
                  selectedPoint={selectedPoint}
                  currentPlayer={currentPlayer}
                  handlePointClick={handlePointClick}
                  playerPieces={playerPiecesData}
                />
              </Layout>
            </div>
            
          </div>
        );
      }else{
        return(
          <div className="opponent-joining">    
         {!gameStarted && (
        <div className="overlay">
          <p className="overlay-text-waiting medievalsharp-regular">Waiting for Players</p>
          <p className="overlay-text-waiting medievalsharp-regular">
            Room Id: <span className="room-code">{roomCode || "N/A"}</span>
          </p>
        </div>
          )}
          </div>
        ); 
      }
}


