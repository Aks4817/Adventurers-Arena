import { useNavigate } from 'react-router-dom';
import OverView from './assets/OverView.png'; 
import PieceMv from './assets/PieceMv.png';
import Attack from './assets/Attack.png';
import Pieces from './assets/Pieces.png';
import Bases from './assets/Bases.png';
import LobbyBg from "./assets/lobby.jpeg";

function HowToPlay() {
  const navigate = useNavigate();

  return (
    <div className="howtoplay-container" style={{
      backgroundImage: `url(${LobbyBg})`}}>
      <div className="howtoplay-overlay">
        <h1 className="howtoplay-title">Basic How to Play</h1>

        <div className="howtoplay-content">
          <section className="howtoplay-section">
            <div className="howtoplay-text">
              <h2>Game Overview</h2>
              <p>
                Adventurer's Arena is a two-player strategy board game. 2 players compete against each other using 5 pieces, each having different stats and abilities, to capture the opponent's base.
              </p>
              <h2>Rooms</h2>
              <p>
                One player creates a room and shares the room code with the other player. Once both players join, the game starts.
              </p>
            </div>
            <img src={OverView} alt="Game Overview" className="howtoplay-image" />
          </section>

          <section className="howtoplay-section howtoplay-reverse">
            <div className="howtoplay-text">
              <h2>Pieces and Their Special Abilities</h2>
              <ul>
                <li>
                  <strong>Scout:</strong> Can move 3 steps and has low health (HP: 15) and attack power (ATK: 10).<br /> Special ability:{" "}
                  <em>Pathfinder</em> (isn't blocked by pieces/goes through pieces).
                </li>
                <li>
                  <strong>Knight:</strong> Moves 2 steps with decent health (HP: 25) and attack power (ATK: 15). <br /> Special ability: <em>Aggressor</em>{" "}
                  (+5 damage when it initiates an attack).
                </li>
                <li>
                  <strong>Tank:</strong> Moves 1 step but has high health (HP: 40).
                  <br /> Special ability: <em>Fortified</em> (reduced damage taken when on its base).
                </li>
                <li>
                  <strong>Mage:</strong> Moves 2 steps with moderate health (HP: 20) and attack power (ATK: 15). <br /> Special ability: <em>Ranged</em> (can
                  attack from a distance of 2 steps).
                </li>
                <li>
                  <strong>Healer:</strong> Moves 2 steps with moderate health (HP: 30) and low attack power (ATK: 5).<br />  Special ability:{" "}
                  <em>Medic</em> (can heal one of the deployed allies by 15 HP when deployed).
                </li>
              </ul>
            </div>
            <img src={Pieces} alt="Pieces" className="howtoplay-image" />
          </section>

          <section className="howtoplay-section">
            <div className="howtoplay-text">
              <h2>Pieces' Deployment and Points</h2>
              <p>
                To deploy a piece, select a card. The card will glow red to indicate that its selected. Pieces can only be placed at one of the 2 deployable points of your side ( Be sure to not let them get captured).
              </p>
              <p>
                For the player who created the room (Player 1), their side is green one. For the player who joined  the room through code (Player 2), their side is the blue one.
              </p>
              <p>
                For both players, the darker 2 Points are the deployable points, while the lighter one is the base. Place any of your piece on opponent's base to win the game.
              </p>
            </div>
            <img src={Bases} alt="Deploy Pieces" className="howtoplay-image" />
          </section>

          <section className="howtoplay-section howtoplay-reverse">
            <div className="howtoplay-text">
              <h2>Moving a Piece</h2>
              <p>
                To move a piece, click on the piece on the board. It will glow purple and the valid points it can move to will glow red.
                </p>
              <p>
                Click on any red point to move your piece to that point.
              </p>

            </div>
            <img src={PieceMv} alt="Combat Mechanics" className="howtoplay-image" />
          </section>

          <section className="howtoplay-section ">
            <div className="howtoplay-text">
              <h2>Combat Mechanics</h2>
              <p>
                When you have a piece in range ( 2 for Mage, Adjacent for others ) of an opponent's piece and its your turn, you can click on the card of the piece. The opponent pieces that can be attacked will have their card glow blue. Click on the card to attack the piece. Your turn ends.
                </p>
              <p>
                When you attack an opponent's piece, the attacked piece's HP is reduced by the ATK of the attacking piece. The attacking piece's HP is reduced by the attacked piece's ATK. Meaning both pieces attack each other.
              </p>
              <p>
                If any piece has its Hp down to 0, it goes into Recovery (indicated by a black background). In order for the piece to get back into the game, another piece will have to go into Recovery essentially exchanging the pieces.
              </p>
            </div>
            <img src={Attack} alt="Combat Mechanics" className="howtoplay-image" />
          </section>
          
          <section className="howtoplay-section howtoplay-reverse">
            <div className="howtoplay-text">
              <h2>Some important points</h2>
              <p>
                Zoom in or out if you are unable to view the full board along with the 5 piece cards.
              </p>
              <p>
                Reloading the tab will mean disconnecting the game. However, you can always create a new room.
                </p>
              <p>
                For issues related to game, message: "._.guesswho" on discord
                </p>

            </div>
          </section>
          
        </div>

        <button className="howtoplay-button" onClick={() => navigate('/')}>
          Back to Lobby
        </button>
      </div>
    </div>
  );
}

export default HowToPlay;
