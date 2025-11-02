import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Lobby.css';

function Lobby({ socket, playerName }) {
  const [games, setGames] = useState([]);
  const [showBotModal, setShowBotModal] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

  useEffect(() => {
    socket.on('gamesList', (gamesList) => {
      setGames(gamesList);
    });

    socket.on('gameRemoved', (gameId) => {
      setGames(prev => prev.filter(g => g.gameId !== gameId));
    });

    return () => {
      socket.off('gamesList');
      socket.off('gameRemoved');
    };
  }, [socket]);

  const handleCreateGame = () => {
    socket.emit('createGame', { withBot: false });
  };

  const handleCreateBotGame = () => {
    setShowBotModal(true);
  };

  const handleStartBotGame = () => {
    socket.emit('createGame', { 
      withBot: true, 
      botDifficulty: selectedDifficulty 
    });
    setShowBotModal(false);
  };

  const handleJoinGame = (gameId) => {
    socket.emit('joinGame', gameId);
  };

  return (
    <div className="lobby">
      <motion.div 
        className="lobby-container"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="lobby-header">
          <h2>🎮 Ігрове лоббі</h2>
          <p className="player-info">Ласкаво просимо, <strong>{playerName}</strong>!</p>
        </div>

        <div className="lobby-actions">
          <motion.button 
            className="create-game-btn"
            onClick={handleCreateGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            👥 Створити гру з гравцем
          </motion.button>
          
          <motion.button 
            className="create-bot-btn"
            onClick={handleCreateBotGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🤖 Грати з ботом
          </motion.button>
        </div>

        <div className="games-section">
          <h3>Доступні ігри ({games.length})</h3>
          {games.length === 0 ? (
            <div className="no-games">
              <p>🎲 Немає доступних ігор</p>
              <p className="hint">Створити нову гру щоб почати!</p>
            </div>
          ) : (
            <div className="games-list">
              {games.map((game, index) => (
                <motion.div 
                  key={game.gameId}
                  className="game-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="game-info">
                    <div className="game-creator">
                      <span className="icon">👤</span>
                      <span className="name">{game.creator}</span>
                    </div>
                    <div className="game-players">
                      <span className="icon">👥</span>
                      <span>{game.playersCount}/2</span>
                    </div>
                  </div>
                  <motion.button 
                    className="join-btn"
                    onClick={() => handleJoinGame(game.gameId)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    Приєднатися
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="lobby-footer">
          <div className="info-card">
           <h4>📋 Правила гри</h4>
              <ul>
                <li>Кожному гравцеві роздають 7 кісточок доміно</li>
                <li>По черзі розкладайте кубики з відповідними числами</li>
                <li>Якщо немає відповідної кістки, візьміть її на ринку</li>
                <li>Перемагає той, хто першим позбудеться всіх кісток</li>
              </ul>
          </div>
        </div>
      </motion.div>

      {/* Modal для вибору складності бота */}
      {showBotModal && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowBotModal(false)}
        >
          <motion.div 
            className="bot-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>🤖 Виберіть складність бота</h3>
            
            <div className="difficulty-options">
              <motion.div 
                className={`difficulty-card ${selectedDifficulty === 'easy' ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty('easy')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="difficulty-icon">😊</div>
                <h4>Легко</h4>
                <p>Для початківців</p>
                <p className="difficulty-desc">Бот грає випадкові ходи</p>
              </motion.div>

              <motion.div 
                className={`difficulty-card ${selectedDifficulty === 'medium' ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty('medium')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="difficulty-icon">🎯</div>
                <h4>Середні</h4>
                <p>Для досвідченних</p>
                <p className="difficulty-desc">Бот використовує базову стратегію</p>
              </motion.div>

              <motion.div 
                className={`difficulty-card ${selectedDifficulty === 'hard' ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty('hard')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="difficulty-icon">🔥</div>
                <h4>Важко </h4>
                <p>Для професіоналів</p>
                <p className="difficulty-desc">Бот використовує продвинуту стратегію</p>
              </motion.div>
            </div>

            <div className="modal-actions">
              <motion.button 
                className="cancel-btn"
                onClick={() => setShowBotModal(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Відмінити
              </motion.button>
              <motion.button 
                className="start-btn"
                onClick={handleStartBotGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Почати гру
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Lobby;
