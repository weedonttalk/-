// Доміно ігрова логіка

class Game {
  constructor(id, withBot = false, botDifficulty = 'medium') {
    this.id = id;
    this.players = [];
    this.boneyard = [];
    this.table = [];
    this.currentPlayer = null;
    this.started = false;
    this.withBot = withBot;
    this.botDifficulty = botDifficulty;
    this.isProcessingBotMove = false;
  }

  addPlayer(player) {
    if (this.players.length < 2) {
      this.players.push({
        ...player,
        isBot: player.isBot || false
      });
      return true;
    }
    return false;
  }

  startGame() {
    if (this.players.length !== 2 || this.started) return false;

    this.started = true;
    this.initializeDominoes();
    this.dealTiles();
    this.currentPlayer = this.players[0].id;

    return true;
  }

  initializeDominoes() {
    // Створити стандарт дабл шість доміно сет (28 плиток)
    this.boneyard = [];
    
    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        this.boneyard.push([i, j]);
      }
    }

    // Перемішати кості 
    this.shuffle(this.boneyard);
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  dealTiles() {
    const tilesPerPlayer = 7;
    
    this.players.forEach(player => {
      player.hand = [];
      for (let i = 0; i < tilesPerPlayer; i++) {
        player.hand.push(this.boneyard.pop());
      }
    });
  }

  getPlayerHand(playerId) {
    const player = this.players.find(p => p.id === playerId);
    return player ? player.hand : [];
  }

  getOpponentTilesCount(playerId) {
    const opponent = this.players.find(p => p.id !== playerId);
    return opponent ? opponent.hand.length : 0;
  }

  canPlayTile(tile, side) {
    // Якщо стіл порожній, грати можна будь-якою плиткою
    if (this.table.length === 0) return true;

    const leftEnd = this.table[0][0];
    const rightEnd = this.table[this.table.length - 1][1];

    if (side === 'left') {
      return tile[0] === leftEnd || tile[1] === leftEnd;
    } else {
      return tile[0] === rightEnd || tile[1] === rightEnd;
    }
  }

  playTile(playerId, tile, side) {
    const player = this.players.find(p => p.id === playerId);
    
    if (!player) {
      return { success: false, message: 'Игрок не найден' };
    }

    // Перевірте, чи є у гравця ця плитка
    const tileIndex = player.hand.findIndex(
      t => (t[0] === tile[0] && t[1] === tile[1]) || (t[0] === tile[1] && t[1] === tile[0])
    );

    if (tileIndex === -1) {
      return { success: false, message: 'У вас нет этой кости' };
    }

    // Перевірте, чи можна відтворити плитку
    if (this.table.length === 0) {
      // Перша плитка
      this.table.push(tile);
      player.hand.splice(tileIndex, 1);
      this.switchTurn();
      return { success: true };
    }

    const leftEnd = this.table[0][0];
    const rightEnd = this.table[this.table.length - 1][1];

    if (side === 'left') {
      if (tile[1] === leftEnd) {
        this.table.unshift(tile);
        player.hand.splice(tileIndex, 1);
        this.switchTurn();
        return { success: true };
      } else if (tile[0] === leftEnd) {
        this.table.unshift([tile[1], tile[0]]);
        player.hand.splice(tileIndex, 1);
        this.switchTurn();
        return { success: true };
      }
    } else if (side === 'right') {
      if (tile[0] === rightEnd) {
        this.table.push(tile);
        player.hand.splice(tileIndex, 1);
        this.switchTurn();
        return { success: true };
      } else if (tile[1] === rightEnd) {
        this.table.push([tile[1], tile[0]]);
        player.hand.splice(tileIndex, 1);
        this.switchTurn();
        return { success: true };
      }
    }

    return { success: false, message: 'Ця кість не підходить' };
  }

  drawTile(playerId) {
    if (this.boneyard.length === 0) {
      console.log(`📦 Boneyard is empty, cannot draw`);
      return { success: false, message: 'Базар пустий', switchTurn: true };
    }

    const player = this.players.find(p => p.id === playerId);
    const tile = this.boneyard.pop();
    player.hand.push(tile);

    console.log(`📦 ${player.name} drew tile [${tile[0]}|${tile[1]}] (${this.boneyard.length} left in boneyard)`);

    // Перевірте, чи можна відтворити намальовану плитку
    const leftEnd = this.table.length > 0 ? this.table[0][0] : null;
    const rightEnd = this.table.length > 0 ? this.table[this.table.length - 1][1] : null;

    const canPlay = this.table.length === 0 || 
      tile[0] === leftEnd || tile[1] === leftEnd ||
      tile[0] === rightEnd || tile[1] === rightEnd;

    console.log(`📦 Can play drawn tile? ${canPlay ? 'YES ✓' : 'NO ✗ (switching turn)'}`);

    // Якщо взятий кубик не можна зіграти, змініть хід
    if (!canPlay) {
      this.switchTurn();
    }

    return { 
      success: true, 
      tile, 
      switchTurn: !canPlay 
    };
  }

  switchTurn() {
    const currentIndex = this.players.findIndex(p => p.id === this.currentPlayer);
    const currentPlayer = this.players[currentIndex];
    const nextIndex = (currentIndex + 1) % this.players.length;
    const nextPlayer = this.players[nextIndex];
    
    console.log(`🔄 Turn switched: ${currentPlayer.name} → ${nextPlayer.name}`);
    
    this.currentPlayer = this.players[nextIndex].id;
  }

  checkWinner() {
    for (const player of this.players) {
      if (player.hand.length === 0) {
        return player.id;
      }
    }
    return null;
  }

  getCurrentPlayer() {
    return this.players.find(p => p.id === this.currentPlayer);
  }

  isCurrentPlayerBot() {
    const currentPlayer = this.getCurrentPlayer();
    return currentPlayer && currentPlayer.isBot;
  }

  hasValidMove(playerId) {
    if (this.table.length === 0) return true;

    const player = this.players.find(p => p.id === playerId);
    const leftEnd = this.table[0][0];
    const rightEnd = this.table[this.table.length - 1][1];

    return player.hand.some(tile => 
      tile[0] === leftEnd || tile[1] === leftEnd ||
      tile[0] === rightEnd || tile[1] === rightEnd
    );
  }
}

module.exports = { Game };
