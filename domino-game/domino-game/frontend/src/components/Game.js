import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Game.css';
import DominoTile from './DominoTile';

function Game({ socket, gameData, playerName }) {
  const [selectedTile, setSelectedTile] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null);
  const [botMessage, setBotMessage] = useState(null);

  useEffect(() => {
    // Слухаємо дії бота
    socket.on('botAction', (data) => {
      setBotMessage(data.message);
      
      // Прибираємо повідомлення через 3 сек
      setTimeout(() => {
        setBotMessage(null);
      }, 3000);
    });

    return () => {
      socket.off('botAction');
    };
  }, [socket]);

  if (gameData.waiting && !gameData.withBot) {
    return (
      <div className="game-waiting">
        <motion.div 
          className="waiting-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="spinner"></div>
          <h2>Очікуємо противника...</h2>
          <p>Гра починається очікуємо на іншого гравця</p>
        </motion.div>
      </div>
    );
  }

  const handleTileClick = (tile) => {
    if (!gameData.isYourTurn) {
      alert('зараз не ваш хід!');
      return;
    }

    console.log('Tile selected:', tile);
    setSelectedTile(tile);
  };

  const handlePlayTile = (side) => {
    if (!selectedTile) {
      alert('Спочатку виберіть плитку!');
      return;
    }

    console.log('Playing tile:', selectedTile, 'on side:', side);
    socket.emit('playTile', { tile: selectedTile, side });
    setSelectedTile(null);
    setSelectedSide(null);
  };

  const handleDrawTile = () => {
    if (!gameData.isYourTurn) {
      alert('зараз не ваш хід!');
      return;
    }

    socket.emit('drawTile');
  };

  const handleLeaveGame = () => {
    if (window.confirm('Ви впевнені що хочете покинути гру?')) {
      socket.emit('leaveGame');
    }
  };

  const currentPlayerName = gameData.players?.find(p => p.id === gameData.currentPlayer)?.name || 'Игрок';
  const opponent = gameData.players?.find(p => p.name !== playerName);
  const isOpponentBot = opponent?.isBot || false;

  return (
    <div className="game">
      <div className="game-container">
        {/* Header */}
        <div className="game-header">
          <div className="player-info-box">
            <span className="player-icon">👤</span>
            <span className="player-name">{playerName}</span>
            <span className="tiles-count">{gameData.hand?.length || 0} костей</span>
          </div>
          
          <div className="turn-indicator">
            {gameData.isYourTurn ? (
              <motion.div 
                className="your-turn"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                🎯 Ваш хід!
              </motion.div>
            ) : (
              <div className="opponent-turn">
                ⏳ Хід противника ({currentPlayerName})
              </div>
            )}
          </div>

          <div className="opponent-info-box">
            <span className="opponent-icon">{isOpponentBot ? '🤖' : '👤'}</span>
            <span className="opponent-name">
              {gameData.players?.find(p => p.name !== playerName)?.name || 'Супротивник'}
            </span>
            <span className="tiles-count">{gameData.opponentTilesCount || 0} костей</span>
            {isOpponentBot && gameData.botDifficulty && (
              <span className={`bot-difficulty ${gameData.botDifficulty}`}>
                {gameData.botDifficulty === 'easy' && '😊'}
                {gameData.botDifficulty === 'medium' && '🎯'}
                {gameData.botDifficulty === 'hard' && '🔥'}
              </span>
            )}
          </div>
        </div>

        {/*Повідомлення про дії бота */}
        <AnimatePresence>
          {botMessage && (
            <motion.div
              className="bot-message"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              🤖 {botMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Table */}
        <div className="game-table">
          <div className="table-actions">
            {gameData.isYourTurn && selectedTile && (
              <>
                <motion.button
                  className="side-btn left-btn"
                  onClick={() => handlePlayTile(gameData.table.length === 0 ? 'left' : 'left')}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {gameData.table.length === 0 ? '✓ Положить' : '⬅️ Ліворуч'}
                </motion.button>
              </>
            )}
          </div>

          <div className="table-surface">
            {gameData.table.length === 0 ? (
              <div className="empty-table">
                <p>🎲 Стіл пустий</p>
                <p className="hint">{gameData.isYourTurn ? 'Виберіть кість' : 'очікування ходу'}</p>
              </div>
            ) : (
              <div className="dominoes-chain">
                <AnimatePresence>
                  {gameData.table.map((tile, index) => (
                    <motion.div
                      key={`${tile[0]}-${tile[1]}-${index}`}
                      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <DominoTile tile={tile} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="table-actions">
            {gameData.table.length > 0 && gameData.isYourTurn && selectedTile && (
              <motion.button
                className="side-btn right-btn"
                onClick={() => handlePlayTile('right')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                Праворуч ➡️
              </motion.button>
            )}
          </div>
        </div>

        {/* Player Hand */}
        <div className="player-hand">
          <div className="hand-label">
            <span>Ваші плитки</span>
            {selectedTile && (
              <motion.span 
                className="selected-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ✓ плитка вибрана
              </motion.span>
            )}
          </div>
          <div className="hand-tiles">
            {gameData.hand?.map((tile, index) => (
              <motion.div
                key={`${tile[0]}-${tile[1]}-${index}`}
                className={`hand-tile ${
                  selectedTile && 
                  selectedTile[0] === tile[0] && 
                  selectedTile[1] === tile[1] 
                    ? 'selected' 
                    : ''
                }`}
                onClick={() => handleTileClick(tile)}
                whileHover={{ scale: 1.1, y: -10 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <DominoTile tile={tile} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="game-controls">
          <motion.button
            className="draw-btn"
            onClick={handleDrawTile}
            disabled={!gameData.isYourTurn}
            whileHover={{ scale: gameData.isYourTurn ? 1.05 : 1 }}
            whileTap={{ scale: gameData.isYourTurn ? 0.95 : 1 }}
          >
            🎲 Взяти з базару
          </motion.button>
          
          <motion.button
            className="leave-btn"
            onClick={handleLeaveGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚪 Вийти з гри
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Game;
