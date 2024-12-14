import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import LobbyBg from "./assets/lobby.jpeg";
const serverURL = import.meta.env.VITE_SERVER_URL; // For Vite projects

interface LobbyProps {
  socket: Socket;
}

import contractABI from './abi.json';
import { useAppContext } from './Context'; // Import context
import { ethers } from 'ethers';
declare global {
  interface Window {
    ethereum?: any;
  }
}
const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // Provided contract address


function Lobby({ socket }: LobbyProps) {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const {account, setAccount, setContract, checkShapeKey } = useAppContext(); // Access context
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const [selectedAccount] = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.ready;

        const signer = await provider.getSigner();

        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        setAccount(selectedAccount);
        setContract(contractInstance);
        setLoading(false);
        checkShapeKey(selectedAccount);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setLoading(false);
      }
    } else {
      alert('Please install MetaMask or an Ethereum-compatible wallet.');
    }
  };

  const handleCreateRoom = async () => {
    try {
      const response = await axios.post(`${serverURL}/create-room`);
      if (response.data.roomCode) {
        setTimeout(() => {
          socket.emit('joinRoom', { roomCode: response.data.roomCode, walletConnected: account });
        }, 500);
        navigate(`/board?roomCode=${response.data.roomCode}`);
      } else {
        setError('Failed to create room. Please try again');
      }
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Error creating room. Please try again');
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode) {
      setError('Please enter room code');
      return;
    }

    try {
      const response = await axios.post(`${serverURL}/join-room`, { roomCode });
      if (response.data.success) {
        setTimeout(() => {
          socket.emit('joinRoom', { roomCode: roomCode, walletConnected: account });
        }, 500);
        navigate(`/board?roomCode=${roomCode}`);
      } else {
        setError('Failed to join the room. Please check the room code');
      }
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Error joining room. Please try again');
    }
  };

  return (
    <div className="arena-container" style={{
      backgroundImage: `url(${LobbyBg})`}}>
      <h1 className="arena-title medievalsharp-bold">Adventurer's Arena</h1>
      <button className="arena-button medievalsharp-regular" onClick={handleCreateRoom}>
        Create a Room
      </button>
      <div className="room-input-container">
        <input
          type="text"
          className="room-input merienda-regular"
          placeholder="Enter Room Code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
        <button className="arena-button medievalsharp-regular" onClick={handleJoinRoom}>
          Join a Room
        </button>
      </div>
      {error && <p className="error-text merienda-regular">{error}</p>}
      <button
        className="arena-button medievalsharp-regular"
        onClick={() => navigate('/how-to-play')}
      >
        How to Play
      </button>

      {/* {!account && 
        <button onClick={connectWallet} className="arena-button medievalsharp-regular" disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>}
      {account && 
        <button className='arena-button medievalsharp-regular' onClick={() => navigate('/skins')}>
          Select Skins
        </button>} */}
    </div>
  );
}

export default Lobby;
