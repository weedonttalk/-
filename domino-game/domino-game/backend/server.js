const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://frontend:3000'],
    methods: ['GET', 'POST']
  }
});

// Проміжне програмне забезпечення
app.use(cors());
app.use(express.json());

// MongoDB підключення
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Управління станом гри
const games = new Map();
const waitingPlayers = [];

// Логіка гри доміно
const { Game } = require('./gameLogic');
const { DominoBot } = require('./botLogic');

// Socket.IO обробка підключення
io.on('connection', (socket) => {
  console.log(`🔌 New player connected: ${socket.id}`);

  // Підключення гравців до гри
  socket.on('joinLobby', (playerName) => {
    socket.playerName = playerName;
    socket.emit('lobbyJoined', { playerId: socket.id, playerName });
    
    // Надіслати список доступних ігор
    const availableGames = Array.from(games.values())
      .filter(game => game.players.length < 2)
      .map(game => ({
        gameId: game.id,
        creator: game.players[0].name,
        playersCount: game.players.length
      }));
    
    socket.emit('gamesList', availableGames);
    console.log(`👤 ${playerName} joined lobby`);
  });

  // Створити нову гру 
  socket.on('createGame', (options = {}) => {
    const gameId = `game_${Date.now()}`;
    const withBot = options.withBot || false;
    const botDifficulty = options.botDifficulty || 'medium';
    
    const game = new Game(gameId, withBot, botDifficulty);
    
    game.addPlayer({
      id: socket.id,
      name: socket.playerName,
      socket: socket
    });

    games.set(gameId, game);
    socket.join(gameId);
    socket.gameId = gameId;

    // Якщо гра з ботом, відразу додайте бота
    if (withBot) {
      const bot = new DominoBot(botDifficulty);
      const botId = `bot_${Date.now()}`;
      
      game.addPlayer({
        id: botId,
        name: bot.name,
        socket: null,
        isBot: true,
        bot: bot
      });

      // Починаємо гру відразу 
      game.startGame();

      socket.emit('gameStarted', {
        gameId: game.id,
        players: game.players.map(p => ({ 
          id: p.id, 
          name: p.name,
          isBot: p.isBot || false 
        })),
        hand: game.getPlayerHand(socket.id),
        table: game.table,
        currentPlayer: game.currentPlayer,
        isYourTurn: game.currentPlayer === socket.id,
        withBot: true,
        botDifficulty: botDifficulty
      });

      console.log(`🤖 Game created with bot: ${gameId}, difficulty: ${botDifficulty}`);

      // Якщо бот ходить першим
      if (game.currentPlayer === botId) {
        handleBotMove(game, botId);
      }
    } else {
      socket.emit('gameCreated', { 
        gameId, 
        message: 'Ожидание второго игрока...',
        withBot: false
      });

      // Трансляція всім гравцям у лобі
      io.emit('gamesList', [{
        gameId: game.id,
        creator: socket.playerName,
        playersCount: 1
      }]);

      console.log(`🎮 Game created: ${gameId} by ${socket.playerName}`);
    }
  });

  // Приєднатися до існуючої гри
  socket.on('joinGame', (gameId) => {
    const game = games.get(gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Игра не найдена' });
      return;
    }

    if (game.players.length >= 2) {
      socket.emit('error', { message: 'Игра уже заполнена' });
      return;
    }

    game.addPlayer({
      id: socket.id,
      name: socket.playerName,
      socket: socket
    });

    socket.join(gameId);
    socket.gameId = gameId;

    // Почніть гру
    game.startGame();

    // Повідомити обох гравців
    game.players.forEach(player => {
      if (player.socket) {
        player.socket.emit('gameStarted', {
          gameId: game.id,
          players: game.players.map(p => ({ id: p.id, name: p.name })),
          hand: game.getPlayerHand(player.id),
          table: game.table,
          currentPlayer: game.currentPlayer,
          isYourTurn: game.currentPlayer === player.id
        });
      }
    });

    // Видалити зі списку доступних ігор
    io.emit('gameRemoved', gameId);

    console.log(`🎮 ${socket.playerName} joined game ${gameId}, game starting!`);
  });

  // Грайте в плитку доміно
  socket.on('playTile', ({ tile, side }) => {
    console.log(`🎲 ${socket.playerName} trying to play tile [${tile[0]}|${tile[1]}] on ${side}`);
    
    const game = games.get(socket.gameId);
    
    if (!game) {
      console.log('❌ Game not found');
      socket.emit('error', { message: 'Игра не найдена' });
      return;
    }

    if (game.currentPlayer !== socket.id) {
      console.log('❌ Not player turn');
      socket.emit('error', { message: 'Не ваш ход!' });
      return;
    }

    const result = game.playTile(socket.id, tile, side);
    console.log('Play result:', result);

    if (result.success) {
      // Транслювати стан гри обом гравцям
      game.players.forEach(player => {
        if (player.socket) {
          player.socket.emit('gameUpdate', {
            table: game.table,
            currentPlayer: game.currentPlayer,
            isYourTurn: game.currentPlayer === player.id,
            hand: game.getPlayerHand(player.id),
            opponentTilesCount: game.getOpponentTilesCount(player.id),
            lastMove: {
              player: socket.playerName,
              tile: tile
            }
          });
        }
      });

      // Перевірте переможця
      if (game.checkWinner()) {
        const winnerId = game.checkWinner();
        const winner = game.players.find(p => p.id === winnerId);
        game.players.forEach(player => {
          if (player.socket) {
            player.socket.emit('gameOver', {
              winner: winner.name,
              isWinner: player.id === winner.id
            });
          }
        });
        games.delete(socket.gameId);
        console.log(`🏆 Game ${socket.gameId} ended, winner: ${winner.name}`);
        return;
      }

      // Якщо наступний хід бота 
      if (game.isCurrentPlayerBot()) {
        handleBotMove(game, game.currentPlayer);
      }
    } else {
      socket.emit('error', { message: result.message });
    }
  });

  // Взяти плитку 
  socket.on('drawTile', () => {
    const game = games.get(socket.gameId);
    
    if (!game) {
      socket.emit('error', { message: 'Игра не найдена' });
      return;
    }

    if (game.currentPlayer !== socket.id) {
      socket.emit('error', { message: 'Не ваш ход!' });
      return;
    }

    const result = game.drawTile(socket.id);

    if (result.success) {
      socket.emit('tileDrawn', {
        tile: result.tile,
        hand: game.getPlayerHand(socket.id),
        boneyardCount: game.boneyard.length
      });

      // Повідомляємо всіх гравців про новий статус
      game.players.forEach(player => {
        if (player.socket) {
          player.socket.emit('gameUpdate', {
            table: game.table,
            currentPlayer: game.currentPlayer,
            isYourTurn: game.currentPlayer === player.id,
            hand: game.getPlayerHand(player.id),
            opponentTilesCount: game.getOpponentTilesCount(player.id)
          });
        }
      });

      // Якщо хід змінено, і наступний гравець – бот
      if (result.switchTurn && game.isCurrentPlayerBot()) {
        handleBotMove(game, game.currentPlayer);
      }
    } else {
      socket.emit('error', { message: result.message });
    }
  });

  // Пройти повторно
  socket.on('passTurn', () => {
    const game = games.get(socket.gameId);
    
    if (!game) return;
    if (game.currentPlayer !== socket.id) return;

    game.switchTurn();

    game.players.forEach(player => {
      if (player.socket) {
        player.socket.emit('gameUpdate', {
          table: game.table,
          currentPlayer: game.currentPlayer,
          isYourTurn: game.currentPlayer === player.id,
          hand: game.getPlayerHand(player.id),
          opponentTilesCount: game.getOpponentTilesCount(player.id)
        });
      }
    });
  });

  // Вийти з гри
  socket.on('leaveGame', () => {
    console.log(`🚪 Player ${socket.playerName} leaving game`);
    socket.emit('gameLeft');
    handlePlayerDisconnect(socket);
  });

  // відключитись
  socket.on('disconnect', () => {
    console.log(`🔌 Player disconnected: ${socket.id}`);
    handlePlayerDisconnect(socket);
  });
});

// Обробка ходу бота
async function handleBotMove(game, botId) {
  if (game.isProcessingBotMove) return;
  
  game.isProcessingBotMove = true;
  
  const botPlayer = game.players.find(p => p.id === botId);
  if (!botPlayer || !botPlayer.bot) {
    game.isProcessingBotMove = false;
    return;
  }

  const bot = botPlayer.bot;
  
  // Затримка для реалістичності
  await bot.delayMove();

  // Отримуємо рішення бота
  const decision = bot.shouldDrawOrPass(botPlayer.hand, game.table, game.boneyard);
  console.log(`🤖 Bot decision:`, decision.action);

  if (decision.action === 'draw') {
    console.log(`🤖 ${botPlayer.name} trying to draw tile`);
    // Бот бее кость з базару
    const drawResult = game.drawTile(botId);
    console.log(`🤖 Draw result:`, drawResult);
    
    if (drawResult.success) {
      // Повідомляємо всім гравцям
      game.players.forEach(player => {
        if (player.socket) {
          player.socket.emit('botAction', {
            action: 'draw',
            botName: botPlayer.name,
            message: `${botPlayer.name} взял кость из базара`
          });

          player.socket.emit('gameUpdate', {
            table: game.table,
            currentPlayer: game.currentPlayer,
            isYourTurn: game.currentPlayer === player.id,
            hand: game.getPlayerHand(player.id),
            opponentTilesCount: game.getOpponentTilesCount(player.id),
            boneyardCount: game.boneyard.length
          });
        }
      });

      // Якщо бот може рухатися з новою кісткою, ми робимо хід
      if (!drawResult.switchTurn) {
        game.isProcessingBotMove = false;
        setTimeout(() => handleBotMove(game, botId), 500);
      } else {
        // Хід змінено, ми знову повідомляємо гравців
        game.players.forEach(player => {
          if (player.socket) {
            player.socket.emit('gameUpdate', {
              table: game.table,
              currentPlayer: game.currentPlayer,
              isYourTurn: game.currentPlayer === player.id,
              hand: game.getPlayerHand(player.id),
              opponentTilesCount: game.getOpponentTilesCount(player.id)
            });
          }
        });
        game.isProcessingBotMove = false;
      }
    } else {
      // Базарий пустий пропускаємо хід
      game.switchTurn();
      game.players.forEach(player => {
        if (player.socket) {
          player.socket.emit('botAction', {
            action: 'pass',
            botName: botPlayer.name,
            message: `${botPlayer.name} пропускает ход`
          });

          player.socket.emit('gameUpdate', {
            table: game.table,
            currentPlayer: game.currentPlayer,
            isYourTurn: game.currentPlayer === player.id,
            hand: game.getPlayerHand(player.id),
            opponentTilesCount: game.getOpponentTilesCount(player.id)
          });
        }
      });
      game.isProcessingBotMove = false;
    }
  } else if (decision.action === 'play' && decision.moves && decision.moves.length > 0) {
    // Бот робить хід
    const move = bot.makeMove(botPlayer.hand, game.table, game.boneyard);
    console.log(`🤖 ${botPlayer.name} making move:`, move);
    
    if (move.action === 'play') {
      const result = game.playTile(botId, move.tile, move.side);
      console.log(`🤖 Play tile result:`, result);

      if (result.success) {
        // повідомляєм гравців
        game.players.forEach(player => {
          if (player.socket) {
            player.socket.emit('botAction', {
              action: 'play',
              botName: botPlayer.name,
              tile: move.tile,
              side: move.side,
              message: `${botPlayer.name} сыграл кость [${move.tile[0]}|${move.tile[1]}]`
            });

            player.socket.emit('gameUpdate', {
              table: game.table,
              currentPlayer: game.currentPlayer,
              isYourTurn: game.currentPlayer === player.id,
              hand: game.getPlayerHand(player.id),
              opponentTilesCount: game.getOpponentTilesCount(player.id),
              lastMove: {
                player: botPlayer.name,
                tile: move.tile
              }
            });
          }
        });

        // Перевіряємо переможців
        const winnerId = game.checkWinner();
        if (winnerId) {
          const winner = game.players.find(p => p.id === winnerId);
          game.players.forEach(player => {
            if (player.socket) {
              player.socket.emit('gameOver', {
                winner: winner.name,
                isWinner: player.id === winner.id
              });
            }
          });
          games.delete(game.id);
          console.log(`🏆 Game ${game.id} ended, winner: ${winner.name}`);
        }
      }
      game.isProcessingBotMove = false;
    }
  } else {
    // Пропускаємо хід
    game.switchTurn();
    game.players.forEach(player => {
      if (player.socket) {
        player.socket.emit('gameUpdate', {
          table: game.table,
          currentPlayer: game.currentPlayer,
          isYourTurn: game.currentPlayer === player.id,
          hand: game.getPlayerHand(player.id),
          opponentTilesCount: game.getOpponentTilesCount(player.id)
        });
      }
    });
    game.isProcessingBotMove = false;
  }
}

function handlePlayerDisconnect(socket) {
  if (socket.gameId) {
    const game = games.get(socket.gameId);
    if (game) {
      // Повідобити іншого гравця
      game.players.forEach(player => {
        if (player.id !== socket.id && player.socket) {
          player.socket.emit('opponentLeft', {
            message: 'Противник покинул игру'
          });
        }
      });
      games.delete(socket.gameId);
      io.emit('gameRemoved', socket.gameId);
    }
  }
}

// Маршрути
app.get('/health', (req, res) => {
  res.json({ status: 'OK', games: games.size });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
