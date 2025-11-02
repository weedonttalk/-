
class DominoBot {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.name = this.generateBotName();
  }

  generateBotName() {
    const names = [
      'БотМастер', 'Кібергравець', 'ДоміноПро', 'АлгоритмБот',
      'СтратегБот', 'РозумнийБот', 'ТактикБот', 'ПрофіБот'
    ];
    return names[Math.floor(Math.random() * names.length)];
  }

  // Основний метод для вибору хода
  makeMove(hand, table, boneyard) {
    switch (this.difficulty) {
      case 'easy':
        return this.easyMove(hand, table);
      case 'medium':
        return this.mediumMove(hand, table);
      case 'hard':
        return this.hardMove(hand, table, boneyard);
      default:
        return this.mediumMove(hand, table);
    }
  }

  // Легкий рівень - випадковий ход
  easyMove(hand, table) {
    const possibleMoves = this.getPossibleMoves(hand, table);
    
    if (possibleMoves.length === 0) {
      return { action: 'draw' };
    }

    // Вибираємо випадковий ход
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    return {
      action: 'play',
      tile: randomMove.tile,
      side: randomMove.side
    };
  }

  // Середній рівень - грає великі кості першими
  mediumMove(hand, table) {
    const possibleMoves = this.getPossibleMoves(hand, table);
    
    if (possibleMoves.length === 0) {
      return { action: 'draw' };
    }

    // Сортувати за кількістю балів на кубиках (від найбільшого до найменшого)
    possibleMoves.sort((a, b) => {
      const sumA = a.tile[0] + a.tile[1];
      const sumB = b.tile[0] + b.tile[1];
      return sumB - sumA;
    });

    return {
      action: 'play',
      tile: possibleMoves[0].tile,
      side: possibleMoves[0].side
    };
  }

  // Складний рівень - стратегічний хід
  hardMove(hand, table, boneyard) {
    const possibleMoves = this.getPossibleMoves(hand, table);
    
    if (possibleMoves.length === 0) {
      return { action: 'draw' };
    }

    // Ми оцінюємо кожен можливий крок
    const evaluatedMoves = possibleMoves.map(move => ({
      ...move,
      score: this.evaluateMove(move, hand, table, boneyard)
    }));

    // Сортуєм по оцінці
    evaluatedMoves.sort((a, b) => b.score - a.score);

    return {
      action: 'play',
      tile: evaluatedMoves[0].tile,
      side: evaluatedMoves[0].side
    };
  }

  //Отримайте всі можливі рухи
  getPossibleMoves(hand, table) {
    const moves = [];

    if (table.length === 0) {
      // Якщо стіл порожній, ми можемо грати в будь-які кубики
      hand.forEach(tile => {
        moves.push({ tile, side: 'left' });
      });
      return moves;
    }

    const leftEnd = table[0][0];
    const rightEnd = table[table.length - 1][1];

    hand.forEach(tile => {
      //Перевірка можливості руху ліворуч
      if (tile[1] === leftEnd) {
        moves.push({ tile, side: 'left' });
      } else if (tile[0] === leftEnd) {
        moves.push({ tile: [tile[1], tile[0]], side: 'left' });
      }

      // Перевірка можливості руху вправо
      if (tile[0] === rightEnd) {
        moves.push({ tile, side: 'right' });
      } else if (tile[1] === rightEnd) {
        moves.push({ tile: [tile[1], tile[0]], side: 'right' });
      }
    });

    return moves;
  }

  // Оцінка прогресу (для складного рівня)
  evaluateMove(move, hand, table, boneyard) {
    let score = 0;

    const tile = move.tile;
    const tileSum = tile[0] + tile[1];

    // 1. Ми вважаємо за краще грати у великі кубики
    score += tileSum * 2;

    // 2. Ми віддаємо перевагу подвійним (вони менш гнучкі)
    if (tile[0] === tile[1]) {
      score += 5;
    }

    // 3. Ми вважаємо за краще залишати собі більше варіантів
    const remainingHand = hand.filter(h => 
      !(h[0] === tile[0] && h[1] === tile[1]) &&
      !(h[0] === tile[1] && h[1] === tile[0])
    );

    // Підраховуємо, скільки кубиків у нас залишилося з кожним числом
    const numberCounts = {};
    remainingHand.forEach(t => {
      numberCounts[t[0]] = (numberCounts[t[0]] || 0) + 1;
      numberCounts[t[1]] = (numberCounts[t[1]] || 0) + 1;
    });

    // Чим більше різноманітності, тим краще
    const diversity = Object.keys(numberCounts).length;
    score += diversity * 3;

    // 4. Якщо у нас багато кубиків з певним числом, використовуйте його
    const numberFrequency = Math.max(...Object.values(numberCounts || {0: 0}));
    if (numberFrequency > 2) {
      score -= numberFrequency * 2; // Сохраняем частые числа
    }

    // 5. В кінці гри (кілька кубиків) ми граємо більш агресивно
    if (hand.length <= 3) {
      score += tileSum * 3;
    }

    return score;
  }

  // Імітація затримки для реалізму
  async delayMove() {
    const delay = this.difficulty === 'easy' ? 1000 : 
                  this.difficulty === 'medium' ? 1500 : 2000;
    
    // Додавання випадкової варіації
    const randomDelay = delay + Math.random() * 1000;
    
    return new Promise(resolve => setTimeout(resolve, randomDelay));
  }

  // Прийняття рішення: взяти кубик або пропустити хід
  shouldDrawOrPass(hand, table, boneyard) {
    const possibleMoves = this.getPossibleMoves(hand, table);
    
    // Якщо можливі ходи, то не беремо
    if (possibleMoves.length > 0) {
      return { action: 'play', moves: possibleMoves };
    }

    //Якщо ринок не порожній, візьміть кістку
    if (boneyard.length > 0) {
      return { action: 'draw' };
    }

    // Якщо ринок порожній і немає ходів, ми пропускаємо
    return { action: 'pass' };
  }
}

module.exports = { DominoBot };
