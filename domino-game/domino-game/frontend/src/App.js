import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import Lobby from './components/Lobby';
import Game from './components/Game';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameState, setGameState] = useState('welcome'); // welcome, lobby, game
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('lobbyJoined', (data) => {
      setGameState('lobby');
    });

    newSocket.on('gameCreated', (data) => {
      // Тільки для ігр з реальними гравцями
      if (!data.withBot) {
        setGameData({ ...data, waiting: true });
        setGameState('game');
      }
    });

    newSocket.on('gameStarted', (data) => {
      console.log('Game started:', data);
      setGameData({ ...data, waiting: false });
      setGameState('game');
    });

    newSocket.on('gameUpdate', (data) => {
      setGameData(prev => ({ ...prev, ...data }));
    });

    newSocket.on('tileDrawn', (data) => {
      setGameData(prev => ({ ...prev, hand: data.hand, boneyardCount: data.boneyardCount }));
    });

    newSocket.on('gameOver', (data) => {
      alert(data.isWinner ? '🎉 Ви виграли!' : '😢 Ви програли!');
      setGameState('lobby');
      setGameData(null);
    });

    newSocket.on('opponentLeft', (data) => {
      alert(data.message);
      setGameState('lobby');
      setGameData(null);
    });

    newSocket.on('gameLeft', () => {
      setGameState('lobby');
      setGameData(null);
    });

    newSocket.on('error', (data) => {
      alert(data.message);
    });

    return () => newSocket.close();
  }, []);

  const handleJoinLobby = (name) => {
    setPlayerName(name);
    socket.emit('joinLobby', name);
  };

  return (
    <div className="App">
      {gameState === 'welcome' && (
        <WelcomeScreen onJoin={handleJoinLobby} />
      )}
      {gameState === 'lobby' && (
        <Lobby socket={socket} playerName={playerName} />
      )}
      {gameState === 'game' && gameData && (
        <Game socket={socket} gameData={gameData} playerName={playerName} />
      )}
    </div>
  );
}

function WelcomeScreen({ onJoin }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <div className="domino-logo">
          <div className="domino-piece">
            <div className="domino-half">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <div className="domino-divider"></div>
            <div className="domino-half">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>
        <h1>Доміно онлайн</h1>
        <p>Ласкаво просимо в класичну гру доміно!</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Введіть ваше ім'я"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoFocus
          />
          <button type="submit">Почати гру </button>
        </form>
      </div>
    </div>
  );
}

export default App;
