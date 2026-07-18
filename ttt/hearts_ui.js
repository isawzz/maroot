// hearts_ui.js - Hearts game UI (uses mDom, mStyle, uiTypeCard52 from codeall.js)

const HUMAN = 'You';
const AI_NAMES = ['West', 'North', 'East'];
const ALL_PLAYERS = [HUMAN, ...AI_NAMES];
const CARD_H = 120;
const CARD_W = Math.round(CARD_H * 240 / 336);

let HG = null;
let dBoard, dTrick, dHand, dStatus, dScores, dPassArea;
let selectedPassCards = [];
let trickCards = {};
let oppCardContainers = {};
let pendingTrickClear = false;

function heartsUIInit() {
  HG = heartsNewGame(ALL_PLAYERS);
  mClear('dPage');

  // Outer container setup as a full-height column flex box
  dBoard = mDom('dPage', {
    margin: 'auto', w: 800, h: '100vh', box: true, overflow: 'hidden',
    bg: '#1a5c2a', display: 'flex', dir: 'column'
  });

  // --- ROW 1: TOP BAR (Status & Scores) ---
  let dTopBar = mDom(dBoard, {
    w100: true, box: true, padding: '8px 20px', h: 45,
    bg: '#0d3318', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  });
  dStatus = mDom(dTopBar, { fg: '#e0e0e0', fz: 18, weight: 'bold' });
  dScores = mDom(dTopBar, { fg: '#e0e0e0', fz: 14 });

  // --- ROW 2: MAIN GAME BOARD (Opponents & Central Trick Area) ---
  // Taking up the bulk of the upper/middle screen space
  let dGame = mDom(dBoard, {
    h: 500, w100: true, box: true, position: 'relative', overflow: 'hidden'
  });

  let dNorth = mDom(dGame, { position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)' });
  renderOpponent(dNorth, 'North');

  let dWest = mDom(dGame, { position: 'absolute', left: 20, top: '56%', transform: 'translateY(-50%)' });
  renderOpponentVertical(dWest, 'West');

  let dEast = mDom(dGame, { position: 'absolute', right: 20, top: '56%', transform: 'translateY(-50%)' });
  renderOpponentVertical(dEast, 'East');

  dTrick = mDom(dGame, {
    position: 'absolute', top: '60%', left: '50%',
    transform: 'translate(-50%, -50%)',
    w: CARD_W * 4 + 40, h: CARD_H + 60,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    bg: '#0d331880', rounding: 12, padding: 10
  });

  // --- ROW 3: HUMAN PLAYER SECTION (Entire Bottom Area) ---
  // This wrapper groups the Pass Area and the Hand vertically so they sit tightly together
  let dHumanSection = mDom(dBoard, {
    flex: 1, w100: true, box: true, bg: '#0d3318',
    display: 'flex', dir: 'column', alignItems: 'center'
  });

  // Pass Area sits cleanly right at the top of the human section
  dPassArea = mDom(dHumanSection, {
    w100: true, box: true, padding: '8px 20px', bg: '#0d3318cc',
    display: 'none', justifyContent: 'center', alignItems: 'center', gap: 15
  });

  // Hand Wrap sits directly underneath the pass area at the absolute bottom
  let dHandWrap = mDom(dHumanSection, {
    w100: true, box: true, padding: '10px 20px 20px',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    position: 'relative'
  });

  let dHandLabel = mDom(dHandWrap, {
    position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
    fg: '#aaa', fz: 12
  }, { html: HUMAN });

  dHand = mDom(dHandWrap, { display: 'flex', justifyContent: 'center', gap: -10, position: 'relative' });

  heartsUIStartHand();
}
function renderOpponent(dParent, name) {
  let label = mDom(dParent, { fg: '#ccc', fz: 13, align: 'center', matop: 2 }, { html: name });
  let dCards = mDom(dParent, { display: 'flex', matop: 4, justifyContent: 'center' });
  oppCardContainers[name] = { label, cards: dCards };
}

function renderOpponentVertical(dParent, name) {
  let label = mDom(dParent, { fg: '#ccc', fz: 13, align: 'center' }, { html: name });
  let dCards = mDom(dParent, { gap: -90, matop: 90, display: 'flex', dir: 'column', alignItems: 'center' });
  oppCardContainers[name] = { label, cards: dCards };
}

function heartsUIStartHand() {
  selectedPassCards = [];
  trickCards = {};
  pendingTrickClear = false;
  mClear(dTrick);
  heartsDeal(HG);
  updateStatus();
  updateScores();
  renderOpponentCards();
  if (HG.phase === 'pass') {
    let dir = PASS_DIRECTIONS[HG.passDirection % 4];
    if (dir === 'none') {
      heartsExecutePass(HG);
      renderHumanHand();
      updateStatus();
      renderOpponentCards();
      if (HG.currentPlayer !== HUMAN) setTimeout(() => aiTurn(), 500);
    } else {
      renderPassUI(dir);
      renderHumanHand(true);
    }
  }
}

function renderHumanHand(selectable = false) {
  mClear(dHand);
  let hand = HG.hands[HUMAN];
  let isPlay = HG.phase === 'play' && HG.currentPlayer === HUMAN;
  let validPlays = isPlay ? heartsGetValidPlays(HG) : [];

  for (const card of hand) {
    let isPassSelected = selectable && selectedPassCards.includes(card);
    let isPlayable = isPlay && validPlays.includes(card);

    let item = uiTypeCard52(card, CARD_H);
    let d = item.div;
    mStyle(d, {
      cursor: (selectable || isPlayable) ? 'pointer' : 'default',
      margin: '0 -28px',
      transition: 'transform 0.15s, box-shadow 0.15s',
      rounding: 8,
      position: 'relative',
      zIndex: 1,
    });

    if (isPassSelected) {
      mStyle(d, { transform: 'translateY(-20px)', shadow: '0 0 12px 4px #ffeb3b' });
    }

    if (isPlayable) {
      mStyle(d, { shadow: '0 0 8px 2px #4caf50' });
      d.onmouseenter = () => { mStyle(d, { transform: 'translateY(-12px)' }); };
      d.onmouseleave = () => { if (!isPassSelected) mStyle(d, { transform: 'translateY(0)' }); };
      d.onclick = () => humanPlayCard(card);
    } else if (selectable) {
      d.onclick = () => humanTogglePassCard(card);
    } else {
      mStyle(d, { opacity: 0.7 });
    }

    mAppend(dHand, d);
  }
}

function renderPassUI(dir) {
  mClear(dPassArea);
  dPassArea.style.display = 'flex';
  mDom(dPassArea, { fg: '#ffeb3b', fz: 16, weight: 'bold' }, {
    html: `Select 3 cards to pass ${dir} ${getPassArrow(dir)}`
  });
  let btnDone = mDom(dPassArea, {
    tag: 'button', bg: '#4caf50', fg: 'white', padding: '6px 20px',
    rounding: 6, cursor: 'pointer', weight: 'bold', fz: 14,
  }, { html: 'Pass Cards' });
  btnDone.onclick = () => humanPassCards();
}

function getPassArrow(dir) {
  if (dir === 'left') return '\u2190';
  if (dir === 'right') return '\u2192';
  if (dir === 'across') return '\u2195';
  return '';
}

function renderOpponentCards() {
  for (const name of AI_NAMES) {
    let cont = oppCardContainers[name];
    if (!cont) continue;
    mClear(cont.cards);
    let count = HG.hands[name].length;
    let isVert = (name === 'West' || name === 'East');
    let cardH = 100; //isVert ?40 : 50;

    for (let i = 0; i < count; i++) {
      let item = uiTypeCard52('2B', cardH);
      face_down(item, '#1a3a6e');
      let d = item.div;
      //let margin = isVert ? `-${cardH * .25}px 0` : `0 -${cardH * .10}px`;
      //margin=isVert?-25;
      mStyle(d, {
        position: 'relative',
        // margin: isVert ? '-18px 0' : '0 -6px',
        //margin,
        rounding: 4,
      });
      if (isVert) mStyle(d, { matop: -85 });
      else mStyle(d, { margin: '0 -25px' });
      mAppend(cont.cards, d);
    }
  }
}

function updateOpponentHighlights() {
  for (const name of AI_NAMES) {
    let cont = oppCardContainers[name];
    if (!cont) continue;
    let isActive = HG.phase === 'play' && HG.currentPlayer === name;
    mStyle(cont.label, {
      fg: isActive ? '#ffeb3b' : '#ccc',
      weight: isActive ? 'bold' : 'normal'
    });
  }
}

function updateStatus() {
  let st = heartsStatus(HG);
  let html = st.msg;
  if (HG.phase === 'play' && HG.currentPlayer === HUMAN) {
    html = '<span style="color:#4caf5b;font-size:20px">YOUR TURN</span> - ' + html;
  } else if (HG.phase === 'play' && HG.currentPlayer !== HUMAN) {
    html += ' <span style="color:#ffeb3b">(thinking...)</span>';
  }
  dStatus.innerHTML = html;
  updateOpponentHighlights();
}

function updateScores() {
  let html = '';
  for (const p of ALL_PLAYERS) {
    let pts = HG.scores[p];
    let handPts = HG.handScore[p] || 0;
    let tricks = HG.tricksWon[p] || 0;
    let isCurrent = HG.phase === 'play' && HG.currentPlayer === p;
    let color = isCurrent ? '#ffeb3b' : '#e0e0e0';
    html += `<span style="margin-left:15px;color:${color}"><b>${p}</b>: ${pts}pts <span style="color:#aaa;font-size:12px">(${tricks} tricks)</span>`;
    if (handPts > 0) html += ` <span style="color:#ff5722">+${handPts}</span>`;
    html += `</span>`;
  }
  dScores.innerHTML = html;
}

// === HUMAN ACTIONS ===

function humanTogglePassCard(card) {
  let idx = selectedPassCards.indexOf(card);
  if (idx >= 0) {
    selectedPassCards.splice(idx, 1);
  } else {
    if (selectedPassCards.length >= 3) return;
    selectedPassCards.push(card);
  }
  renderHumanHand(true);
}

function humanPassCards() {
  if (selectedPassCards.length !== 3) return;
  heartsSelectPassCards(HG, HUMAN, selectedPassCards);

  for (const name of AI_NAMES) {
    let hand = HG.hands[name];
    let toPass = hand.slice(0, 3);
    heartsSelectPassCards(HG, name, toPass);
  }

  heartsExecutePass(HG);
  dPassArea.style.display = 'none';
  selectedPassCards = [];
  renderHumanHand();
  renderOpponentCards();
  updateStatus();
  updateScores();
  if (HG.currentPlayer !== HUMAN) setTimeout(() => aiTurn(), 500);
}

function humanPlayCard(card) {
  if (HG.currentPlayer !== HUMAN) return;
  if (HG.phase !== 'play') return;

  let ok = heartsPlayCard(HG, HUMAN, card);
  if (!ok) return;

  clearTrickIfNeeded();
  animateTrickPlay(HUMAN, card);
  renderHumanHand();
  renderOpponentCards();
  updateStatus();
  updateScores();

  if (HG.phase === 'score') {
    setTimeout(() => humanFinishHand(), 1200);
  } else if (HG.currentPlayer !== HUMAN) {
    setTimeout(() => aiTurn(), 600);
  }
}

function humanFinishHand() {
  clearTrick();
  let result = heartsScoreHand(HG);
  updateScores();

  if (result.gameOver) {
    showGameOver(result.winner);
  } else {
    showHandResult(result, () => heartsUIStartHand());
  }
}

// === AI ===

function aiTurn() {
  if (HG.phase !== 'play') return;
  if (HG.currentPlayer === HUMAN) return;

  let player = HG.currentPlayer;
  let valid = heartsGetValidPlays(HG);
  if (valid.length === 0) return;

  let card = aiChooseCard(player, valid);
  heartsPlayCard(HG, player, card);

  clearTrickIfNeeded();
  animateTrickPlay(player, card);
  renderOpponentCards();
  updateStatus();
  updateScores();

  if (HG.phase === 'score') {
    setTimeout(() => {
      clearTrick();
      let result = heartsScoreHand(HG);
      updateScores();
      if (result.gameOver) {
        showGameOver(result.winner);
      } else {
        showHandResult(result, () => heartsUIStartHand());
      }
    }, 1200);
  } else if (HG.currentPlayer !== HUMAN) {
    setTimeout(() => aiTurn(), 600);
  } else {
    renderHumanHand();
    updateStatus();
    updateScores();
  }
}

// ========== AI STRATEGY ==========

function aiGetAllPlayed() {
  let played = new Set();
  for (const entry of HG.trickHistory) {
    for (const p of entry.trick) played.add(p.card);
  }
  for (const p of HG.currentTrick) played.add(p.card);
  return played;
}

function aiTrickPoints() {
  let pts = 0;
  for (const p of HG.currentTrick) {
    if (heartsCardSuit(p.card) === 'H') pts += 1;
    if (p.card === 'QS') pts += 13;
  }
  return pts;
}

function aiWouldWinTrick(card) {
  if (HG.currentTrick.length === 0) return true;
  let bestRank = -1;
  for (const p of HG.currentTrick) {
    if (heartsCardSuit(p.card) === HG.ledSuit) {
      let r = heartsCardRank(p.card);
      if (r > bestRank) bestRank = r;
    }
  }
  if (heartsCardSuit(card) !== HG.ledSuit) return false;
  return heartsCardRank(card) > bestRank;
}

function aiCountSuitRemaining(suit, hand, played) {
  let count = 0;
  for (const c of hand) if (heartsCardSuit(c) === suit) count++;
  let total = 13;
  for (const c of played) if (heartsCardSuit(c) === suit) count++;
  return total - count;
}

function aiAreHeartsBroken(played) {
  for (const c of played) if (heartsCardSuit(c) === 'H') return true;
  return false;
}

function aiCountPointsInTrick(trick) {
  let pts = 0;
  for (const p of trick) {
    if (heartsCardSuit(p.card) === 'H') pts += 1;
    if (p.card === 'QS') pts += 13;
  }
  return pts;
}

function aiCountOpponentHearts(player, hand, played) {
  let count = 0;
  for (const c of hand) if (heartsCardSuit(c) === 'H') count++;
  return count;
}

function aiOpponentsHaveCardsOfSuit(suit, player, played) {
  let oppCards = 0;
  for (const p of ALL_PLAYERS) {
    if (p === player) continue;
    for (const c of HG.hands[p]) {
      if (heartsCardSuit(c) === suit) oppCards++;
    }
  }
  return oppCards;
}

function aiChooseCard(player, valid) {
  if (valid.length === 1) return valid[0];

  let hand = HG.hands[player];
  let played = aiGetAllPlayed();
  let trickPts = aiTrickPoints();
  let trickLen = HG.currentTrick.length;
  let isLeading = trickLen === 0;
  let heartsBroken = aiAreHeartsBroken(played);

  if (isLeading) return aiLeadCard(player, valid, hand, played, heartsBroken);
  return aiFollowCard(player, valid, hand, played, trickPts, trickLen);
}

function aiLeadCard(player, valid, hand, played, heartsBroken) {
  let safe = valid.filter(c => c !== 'QS');
  if (!heartsBroken) safe = safe.filter(c => heartsCardSuit(c) !== 'H');
  if (safe.length === 0) safe = valid.slice();

  let myPts = HG.handScore[player];
  let shooting = myPts === 0 && hgMoonShotCandidate(player, hand, played);

  if (shooting) {
    let highCards = valid.filter(c => {
      let r = heartsCardRank(c);
      return r >= 10 || c === 'QS';
    });
    if (highCards.length > 0) {
      highCards.sort((a, b) => heartsCardRank(b) - heartsCardRank(a));
      return highCards[0];
    }
  }

  let suitCounts = {};
  for (const c of safe) {
    let s = heartsCardSuit(c);
    suitCounts[s] = (suitCounts[s] || 0) + 1;
  }

  let candidates = safe.filter(c => heartsCardSuit(c) !== 'S');
  if (candidates.length === 0) candidates = safe;

  candidates.sort((a, b) => {
    let sa = suitCounts[heartsCardSuit(a)] || 0;
    let sb = suitCounts[heartsCardSuit(b)] || 0;
    if (sa !== sb) return sa - sb;
    return heartsCardRank(a) - heartsCardRank(b);
  });

  return candidates[0];
}

function aiFollowCard(player, valid, hand, played, trickPts, trickLen) {
  let sameSuit = valid.filter(c => heartsCardSuit(c) === HG.ledSuit);
  let isLast = trickLen === 3;
  let winnerSoFar = aiGetTrickWinner();

  if (sameSuit.length > 0) {
    return aiFollowInSuit(player, sameSuit, hand, played, trickPts, isLast, winnerSoFar);
  } else {
    return aiFollowVoid(player, valid, hand, played, trickPts, isLast);
  }
}

function aiGetTrickWinner() {
  let best = null;
  let bestRank = -1;
  for (const p of HG.currentTrick) {
    if (heartsCardSuit(p.card) === HG.ledSuit) {
      let r = heartsCardRank(p.card);
      if (r > bestRank) { bestRank = r; best = p; }
    }
  }
  return best;
}

function aiFollowInSuit(player, sameSuit, hand, played, trickPts, isLast, winnerSoFar) {
  sameSuit.sort((a, b) => heartsCardRank(a) - heartsCardRank(b));

  if (trickPts > 0) {
    let nonWinners = sameSuit.filter(c => !aiWouldWinTrick(c));
    if (nonWinners.length > 0) {
      return nonWinners[nonWinners.length - 1];
    }
    return sameSuit[0];
  }

  if (isLast) {
    return sameSuit[0];
  }

  let meWinning = winnerSoFar && winnerSoFar.player === player;
  if (meWinning) {
    return sameSuit[0];
  }

  let winners = sameSuit.filter(c => aiWouldWinTrick(c));
  if (winners.length === sameSuit.length) {
    return sameSuit[0];
  }

  let safeCards = sameSuit.filter(c => !aiWouldWinTrick(c));
  if (safeCards.length > 0) {
    return safeCards[safeCards.length - 1];
  }

  return sameSuit[0];
}

function aiFollowVoid(player, valid, hand, played, trickPts, isLast) {
  if (valid.includes('QS')) return 'QS';

  let heartsInHand = valid.filter(c => heartsCardSuit(c) === 'H');
  if (heartsInHand.length > 0) {
    heartsInHand.sort((a, b) => heartsCardRank(b) - heartsCardRank(a));

    if (isLast) {
      let myPts = HG.handScore[player];
      let oppPts = Math.max(...ALL_PLAYERS.filter(p => p !== player).map(p => HG.handScore[p]));
      if (myPts <= 10 && oppPts < 20) {
        return valid[valid.length - 1];
      }
    }
    return heartsInHand[0];
  }

  let highCards = valid.filter(c => heartsCardRank(c) >= 10);
  if (highCards.length > 0) {
    highCards.sort((a, b) => heartsCardRank(b) - heartsCardRank(a));
    return highCards[0];
  }

  valid.sort((a, b) => heartsCardRank(b) - heartsCardRank(a));
  return valid[0];
}

function hgMoonShotCandidate(player, hand, played) {
  let spadesInHand = hand.filter(c => heartsCardSuit(c) === 'S');
  let heartsInHand = hand.filter(c => heartsCardSuit(c) === 'H');
  let highSpades = spadesInHand.filter(c => heartsCardRank(c) >= 11);
  let highHearts = heartsInHand.filter(c => heartsCardRank(c) >= 10);

  let hasQS = hand.includes('QS');
  let hasAS = hand.includes('AS');
  let hasKS = hand.includes('KS');

  let playedList = Array.from(played);
  let spadesPlayed = playedList.filter(c => heartsCardSuit(c) === 'S');
  let highSpadesPlayed = spadesPlayed.filter(c => heartsCardRank(c) >= 11);

  if (hasAS && hasKS && hasQS && highHearts.length >= 5) return true;
  if (hasAS && highHearts.length >= 7) return true;

  if (highSpades.length >= 2 && highHearts.length >= 5 && !spadesPlayed.includes('AS')) return true;

  return false;
}

// === TRICK DISPLAY ===

function clearTrickIfNeeded() {
  if (Object.keys(trickCards).length >= 4) {
    clearTrick();
  }
}

function clearTrick() {
  mClear(dTrick);
  trickCards = {};
}

function animateTrickPlay(player, card) {
  let item = uiTypeCard52(card, CARD_H * 0.85);
  let d = item.div;
  mStyle(d, { rounding: 6, position: 'absolute' });

  let positions = {
    [HUMAN]: { bottom: 5, left: '50%', transform: 'translateX(-50%)' },
    'West': { left: 5, top: '50%', transform: 'translateY(-50%)' },
    'North': { top: 5, left: '50%', transform: 'translateX(-50%)' },
    'East': { right: 5, top: '50%', transform: 'translateY(-50%)' },
  };
  let pos = positions[player];
  for (const [k, v] of Object.entries(pos)) {
    d.style[k] = typeof v === 'number' ? v + 'px' : v;
  }

  mDom(d, {
    position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)',
    fz: 10, fg: '#aaa', whiteSpece: 'nowrap'
  }, { html: player === HUMAN ? 'You' : player });

  mAppend(dTrick, d);
  trickCards[player] = d;
}

// === OVERLAYS ===

function showHandResult(result, onContinue) {
  let overlay = mDom('dPage', {
    position: 'fixed', top: 0, left: 0, w: '100vw', h: '100vh',
    bg: '#000000cc', display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  });

  let box = mDom(overlay, {
    bg: '#1a3a1a', rounding: 16, padding: 30, minw: 400,
    display: 'flex', dir: 'column', alignItems: 'center', gap: 12
  });

  mDom(box, { fg: '#ffeb3b', fz: 24, weight: 'bold' }, { html: 'Hand Complete' });

  if (result.moonTaker) {
    let who = result.moonTaker === HUMAN ? 'You' : result.moonTaker;
    mDom(box, { fg: '#ff5722', fz: 18 }, { html: `${who} shot the moon!` });
  }

  for (const p of ALL_PLAYERS) {
    let pts = HG.handScore[p];
    let tricks = HG.tricksWon[p] || 0;
    let color = pts === 0 ? '#4caf50' : pts >= 13 ? '#f44336' : '#ffeb3b';
    mDom(box, { fg: color, fz: 16 }, { html: `${p}: ${pts} pts (${tricks} tricks) - Total: ${HG.scores[p]}` });
  }

  let btn = mDom(box, {
    tag: 'button', bg: '#4caf50', fg: 'white', padding: '10px 30px',
    rounding: 8, cursor: 'pointer', weight: 'bold', fz: 16, matop: 10,
  }, { html: 'Next Hand' });
  btn.onclick = () => { overlay.remove(); onContinue(); };
}

function showGameOver(winner) {
  let overlay = mDom('dPage', {
    position: 'fixed', top: 0, left: 0, w: '100vw', h: '100vh',
    bg: '#000000dd', display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 1000
  });

  let box = mDom(overlay, {
    bg: '#1a3a1a', rounding: 16, padding: 40, minw: 400,
    display: 'flex', dir: 'column', alignItems: 'center', gap: 15
  });

  mDom(box, { fg: '#ffeb3b', fz: 32, weight: 'bold' }, { html: 'Game Over!' });

  let sorted = ALL_PLAYERS.slice().sort((a, b) => HG.scores[a] - HG.scores[b]);
  for (let i = 0; i < sorted.length; i++) {
    let p = sorted[i];
    let medal = i === 0 ? ' \uD83E\uDD47' : i === 1 ? ' \uD83E\uDD48' : i === 2 ? ' \uD83E\uDD49' : '';
    let color = i === 0 ? '#4caf50' : '#e0e0e0';
    mDom(box, { fg: color, fz: 20 }, { html: `${p}: ${HG.scores[p]} pts${medal}` });
  }

  let btn = mDom(box, {
    tag: 'button', bg: '#4caf50', fg: 'white', padding: '12px 40px',
    rounding: 8, cursor: 'pointer', weight: 'bold', fz: 18, matop: 15,
  }, { html: 'New Game' });
  btn.onclick = () => { overlay.remove(); heartsUIInit(); };
}
