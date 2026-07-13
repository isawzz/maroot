// hearts.js - Pure Hearts game logic (no DOM)

const HEARTS_RANKS = '23456789TJQKA';
const HEARTS_SUITS = 'SHDC';
const SUIT_SYMBOLS = { S: '\u2660', H: '\u2665', D: '\u2666', C: '\u2663' };
const SUIT_COLORS = { S: 'black', H: 'red', D: 'red', C: 'black' };
const PASS_DIRECTIONS = ['left', 'right', 'across', 'none'];
const GAME_OVER_SCORE = 100;

function heartsMakeDeck() {
  let deck = [];
  for (const s of HEARTS_SUITS) {
    for (const r of HEARTS_RANKS) {
      deck.push(r + s);
    }
  }
  return deck;
}

function heartsShuffle(deck) {
  let a = deck.slice();
  for (let i = a.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function heartsSortHand(hand) {
  let order = {};
  for (const r of HEARTS_RANKS) order[r] = HEARTS_RANKS.indexOf(r);
  for (const s of HEARTS_SUITS) order[s] = 100 + HEARTS_SUITS.indexOf(s);
  return hand.slice().sort((a, b) => {
    let sa = a[1], sb = b[1];
    if (sa !== sb) return HEARTS_SUITS.indexOf(sa) - HEARTS_SUITS.indexOf(sb);
    return HEARTS_RANKS.indexOf(a[0]) - HEARTS_RANKS.indexOf(b[0]);
  });
}

function heartsCardRank(ckey) { return HEARTS_RANKS.indexOf(ckey[0]); }
function heartsCardSuit(ckey) { return ckey[1]; }
function heartsCardValue(ckey) { return heartsCardRank(ckey) + 2; }

function heartsTrickWinner(trick, ledSuit) {
  let best = null;
  for (const play of trick) {
    let s = heartsCardSuit(play.card);
    let r = heartsCardRank(play.card);
    if (s === ledSuit) {
      if (!best || r > heartsCardRank(best.card)) best = play;
    }
  }
  return best;
}

function heartsTrickPoints(trick) {
  let pts = 0;
  for (const play of trick) {
    let s = heartsCardSuit(play.card);
    if (s === 'H') pts += 1;
    if (play.card === 'QS') pts += 13;
  }
  return pts;
}

function heartsCanPlay(card, hand, trick, ledSuit, firstTrick) {
  if (trick.length === 0) {
    if (firstTrick && hand.includes('2C') && card !== '2C') return false;
    return true;
  }
  if (ledSuit) {
    let sameSuit = hand.filter(c => heartsCardSuit(c) === ledSuit);
    if (sameSuit.length > 0) {
      return heartsCardSuit(card) === ledSuit;
    }
  }
  return true;
}

function heartsNewGame(players) {
  let g = {
    players: players,
    scores: {},
    hands: {},
    tricks: {},
    currentTrick: [],
    trickHistory: [],
    ledSuit: null,
    passDirection: 0,
    passingCards: {},
    passedCards: [],
    phase: 'deal',
    leadPlayer: null,
    currentPlayer: null,
    trickCount: 0,
    tricksWon: {},
    handScore: {},
    totalTricksPlayed: 0,
    lastTrickWinner: null,
  };
  for (const p of players) {
    g.scores[p] = 0;
    g.hands[p] = [];
    g.tricks[p] = [];
    g.tricksWon[p] = 0;
    g.passingCards[p] = [];
    g.handScore[p] = 0;
  }
  return g;
}

function heartsDeal(g) {
  let deck = heartsShuffle(heartsMakeDeck());
  for (let i = 0; i < 52; i++) {
    g.hands[g.players[i % 4]].push(deck[i]);
  }
  for (const p of g.players) {
    g.hands[p] = heartsSortHand(g.hands[p]);
  }
  g.leadPlayer = null;
  g.currentTrick = [];
  g.trickHistory = [];
  g.ledSuit = null;
  g.trickCount = 0;
  g.totalTricksPlayed = 0;
  g.handScore = {};
  for (const p of g.players) {
    g.tricksWon[p] = 0;
    g.handScore[p] = 0;
    g.tricks[p] = [];
  }
  g.phase = 'pass';
}

function heartsGetPassTarget(g, fromPlayer) {
  let idx = g.players.indexOf(fromPlayer);
  let dir = PASS_DIRECTIONS[g.passDirection % 4];
  if (dir === 'none') return null;
  if (dir === 'left') return g.players[(idx + 1) % 4];
  if (dir === 'right') return g.players[(idx + 3) % 4];
  if (dir === 'across') return g.players[(idx + 2) % 4];
  return null;
}

function heartsSelectPassCards(g, player, cards) {
  if (cards.length !== 3) return false;
  for (const c of cards) {
    if (!g.hands[player].includes(c)) return false;
  }
  g.passingCards[player] = cards.slice();
  return true;
}

function heartsAllPassed(g) {
  return g.players.every(p => g.passingCards[p].length === 3);
}

function heartsExecutePass(g) {
  let dir = PASS_DIRECTIONS[g.passDirection % 4];
  if (dir === 'none') {
    g.passingCards = {};
    g.phase = 'play';
    let starter = g.lastTrickWinner || heartsFind2C(g);
    g.leadPlayer = starter;
    g.currentPlayer = starter;
    return;
  }
  let received = {};
  for (const p of g.players) {
    let target = heartsGetPassTarget(g, p);
    received[target] = g.passingCards[p];
  }
  for (const p of g.players) {
    for (const c of g.passingCards[p]) {
      let idx = g.hands[p].indexOf(c);
      if (idx >= 0) g.hands[p].splice(idx, 1);
    }
  }
  for (const p of g.players) {
    for (const c of received[p]) {
      g.hands[p].push(c);
    }
    g.hands[p] = heartsSortHand(g.hands[p]);
    g.passingCards[p] = [];
  }
  g.phase = 'play';
  let starter = g.lastTrickWinner || heartsFind2C(g);
  g.leadPlayer = starter;
  g.currentPlayer = starter;
}

function heartsFind2C(g) {
  for (const p of g.players) {
    if (g.hands[p].includes('2C')) return p;
  }
  return g.players[0];
}

function heartsIsFirstTrick(g) {
  return g.totalTricksPlayed === 0 && g.currentTrick.length === 0;
}

function heartsPlayCard(g, player, card) {
  if (player !== g.currentPlayer) return false;
  let idx = g.hands[player].indexOf(card);
  if (idx < 0) return false;

  let firstTrick = heartsIsFirstTrick(g);
  if (!heartsCanPlay(card, g.hands[player], g.currentTrick, g.ledSuit, firstTrick)) return false;

  g.hands[player].splice(idx, 1);
  g.currentTrick.push({ player, card });

  if (g.currentTrick.length === 1) {
    g.ledSuit = heartsCardSuit(card);
  }

  if (g.currentTrick.length === 4) {
    heartsResolveTrick(g);
  } else {
    g.currentPlayer = g.players[(g.players.indexOf(player) + 1) % 4];
  }
  return true;
}

function heartsResolveTrick(g) {
  let winner = heartsTrickWinner(g.currentTrick, g.ledSuit);
  let pts = heartsTrickPoints(g.currentTrick);
  g.tricksWon[winner.player] += 1;
  g.handScore[winner.player] += pts;
  g.tricks[winner.player].push(g.currentTrick.slice());
  g.trickHistory.push({
    trick: g.currentTrick.slice(),
    winner: winner.player,
    points: pts,
    ledSuit: g.ledSuit,
  });
  g.trickCount += 1;
  g.totalTricksPlayed += 1;

  let allCards = [];
  for (const p of g.players) allCards.push(...g.hands[p]);
  if (allCards.length === 0) {
    g.phase = 'score';
    g.currentTrick = [];
    g.ledSuit = null;
    g.currentPlayer = null;
    g.lastTrickWinner = winner.player;
  } else {
    g.currentTrick = [];
    g.ledSuit = null;
    g.currentPlayer = winner.player;
    g.leadPlayer = winner.player;
  }
}

function heartsScoreHand(g) {
  let moonTaker = null;
  for (const p of g.players) {
    if (g.handScore[p] === 26) moonTaker = p;
  }
  if (moonTaker) {
    for (const p of g.players) {
      g.handScore[p] = (p === moonTaker) ? 0 : 26;
    }
  }
  for (const p of g.players) {
    g.scores[p] += g.handScore[p];
  }
  g.passDirection += 1;
  let gameOver = false;
  let winner = null;
  for (const p of g.players) {
    if (g.scores[p] >= GAME_OVER_SCORE) {
      gameOver = true;
    }
  }
  if (gameOver) {
    let minScore = Infinity;
    for (const p of g.players) {
      if (g.scores[p] < minScore) { minScore = g.scores[p]; winner = p; }
    }
  }
  return { gameOver, winner, moonTaker };
}

function heartsGetValidPlays(g) {
  let player = g.currentPlayer;
  let hand = g.hands[player];
  let firstTrick = heartsIsFirstTrick(g);
  return hand.filter(c => heartsCanPlay(c, hand, g.currentTrick, g.ledSuit, firstTrick));
}

function heartsStatus(g) {
  let dir = PASS_DIRECTIONS[g.passDirection % 4];
  let msg = '';
  if (g.phase === 'pass') {
    if (dir === 'none') msg = 'No passing this hand';
    else msg = `Pass 3 cards ${dir}`;
  } else if (g.phase === 'play') {
    if (g.currentTrick.length === 0) {
      msg = `${g.currentPlayer}'s turn to lead`;
    } else {
      msg = `${g.currentPlayer}'s turn to play (${SUIT_SYMBOLS[g.ledSuit]} led)`;
    }
  } else if (g.phase === 'score') {
    msg = 'Hand complete!';
  }
  return {
    phase: g.phase,
    passDirection: dir,
    msg,
    currentPlayer: g.currentPlayer,
    ledSuit: g.ledSuit,
    trickCount: g.trickCount,
    scores: { ...g.scores },
    handScore: { ...g.handScore },
  };
}
