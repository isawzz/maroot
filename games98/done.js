

function mAnimate(elem, prop, valist, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0, forwards = 'none') {
  let kflist = [];
  for (const perc in valist) {
    let o = {};
    let val = valist[perc];
    o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
    kflist.push(o);
  }
  let opts = { duration: msDuration, fill: forwards, easing: easing, delay: delay };
  let a = toElem(elem).animate(kflist, opts);
  if (isdef(callback)) { a.onfinish = callback; }
  return a;
}

function cSplay(cards, dParent, dir = 'right', splay = 0.25) {
  if (cards.length === 0) return;
  mClear(dParent);
  if (dir == 'diagonal') return cSplayDiagonal(cards, dParent, splay);

  const n = cards.length; //console.log('cards', cards, 'n', n);
  const cardW = cards[0].w;
  const cardH = cards[0].h;

  // Calculate the "Overlap" (How much of the card is hidden)
  // If splay is 0.25, we show 25%, so we hide 75%.
  const invSplay = 1 - splay;
  const marginW = -(cardW * invSplay);
  const marginH = -(cardH * invSplay);

  // 1. Create a simple grid. 
  // For horizontal (left/right), 1 row. For vertical (up/down), 1 column.
  let isHorizontal = ['left', 'right'].includes(dir);
  let rows = isHorizontal ? 1 : n;
  let cols = isHorizontal ? n : 1;

  let dg = mGrid(rows, cols, dParent, { gap: 0, padding: 20 });
  dg.style.gridTemplateRows = `repeat(${rows}, max-content)`;
  dg.style.gridTemplateColumns = `repeat(${cols}, max-content)`;
  dg.style.display = 'inline-grid';

  cards.forEach((c, i) => {
    let dc = iDiv(c);
    mAppend(dg, dc);

    // Reset styles
    dc.style.margin = "0";
    dc.style.zIndex = i;

    // 2. Apply Directional Logic
    if (i < n - 1) { // Don't apply margin to the very last card
      if (dir === 'right') dc.style.marginRight = `${marginW}px`;
      if (dir === 'down') dc.style.marginBottom = `${marginH}px`;
      if (dir === 'left') dc.style.marginRight = `${marginW}px`;
      if (dir === 'up') dc.style.marginBottom = `${marginH}px`;
    }

    // 3. Stacking Order (Z-Index)
    // For Left and Up, we usually want the FIRST card to be on top visually
    if (dir === 'left' || dir === 'up') {
      dc.style.zIndex = n - i;
    }

  });
  return dg;
}
function cSplayDiagonal(cards, dParent, splay = 0.25) {
  if (cards.length === 0) return;

  const n = cards.length;
  const cardW = cards[0].w;
  const cardH = cards[0].h;
  const offW = cardW * splay;
  const offH = cardH * splay;

  let dg = mGrid(n, n, dParent, { gap: 0, padding: 20 });

  // 1. FORCE THE TRACK SIZES
  // For diagonal, every track is the 'offset' size EXCEPT the last one
  const colTemplate = `repeat(${n - 1}, ${offW}px) ${cardW}px`;
  const rowTemplate = `repeat(${n - 1}, ${offH}px) ${cardH}px`;

  dg.style.display = 'inline-grid';
  dg.style.gridTemplateColumns = colTemplate;
  dg.style.gridTemplateRows = rowTemplate;

  cards.forEach((c, i) => {
    let dc = iDiv(c);
    mAppend(dg, dc);

    // 2. FORCE PLACEMENT
    // This places card 0 at 1,1; card 1 at 2,2; etc.
    dc.style.gridColumn = i + 1;
    dc.style.gridRow = i + 1;

    // 3. CLEANUP STYLES
    dc.style.margin = "0";
    dc.style.width = `${cardW}px`;
    dc.style.height = `${cardH}px`;
    dc.style.zIndex = i;

  });
  return dg;
}
function drawDeck(cards, dParent, face = 'up', splay = 0.002) {
  const n = cards.length;
  const visualCount = Math.max(2, Math.min(n, Math.ceil(n / 15)));
  let part = cards.slice(-visualCount);
  let dg = cSplayDiagonal(part, dParent, splay);
  let topCard = cards[n - 1];
  if (face == 'down') face_down(topCard);
  let bottomCard = part[0];
  addBadge(dg, n)
  return {
    topCard,
    bottomCard,
    dg,
  }
}
function screenDistance(elem, container, corner = 'right') {
  // 1. Get the global bounding boxes
  const eRect = elem.getBoundingClientRect();
  const cRect = container.getBoundingClientRect();

  // 2. Element top-left is our starting point
  const startX = eRect.left;
  const startY = eRect.top;

  // 3. Determine target X based on the requested corner
  // Top-right is container.left + container.width
  const targetX = (corner === 'right') ? cRect.right - eRect.width : cRect.left;
  const targetY = cRect.top;

  // 4. Return the delta (distance to travel)
  return [targetX - startX, targetY - startY];
}
function aRotate(d, ms = 2000) { return d.animate({ transform: `rotate(360deg)` }, ms); }
function aRotateAccel(d, ms) { return d.animate({ transform: `rotate(1200deg)` }, { easing: 'cubic-bezier(.72, 0, 1, 1)', duration: ms }); }
function aTranslateBy(d, x, y, ms) { return d.animate({ transform: `translate(${x}px,${y}px)` }, ms); }// {easing:'cubic-bezier(1,-0.03,.27,1)',duration:ms}); }
function aTranslateByEase(d, x, y, ms, easing = 'cubic-bezier(1,-0.03,.27,1)') {
  return d.animate({ transform: `translate(${x}px,${y}px)` }, { easing: easing, duration: ms });
}
function aTranslateFadeBy(d, x, y, ms) { return d.animate({ opacity: .5, transform: `translate(${x}px,${y}px)` }, { easing: MyEasing, duration: ms }); }
function aTranslateBy(d, x, y, ms) { return d.animate({ transform: `translate(${x}px,${y}px)` }, ms); }// {easing:'cubic-bezier(1,-0.03,.27,1)',duration:ms}); }
function aTranslateByEase(d, x, y, ms, easing = 'cubic-bezier(1,-0.03,.27,1)') {
  return d.animate({ transform: `translate(${x}px,${y}px)` }, { easing: easing, duration: ms });
}
function aTranslateFadeBy(d, x, y, ms) { return d.animate({ opacity: .5, transform: `translate(${x}px,${y}px)` }, { easing: MyEasing, duration: ms }); }



function wrapFunc(func, args = [], prop = true, clearev = true) {//args = [], prop = true, clearev = true) {
  if (!isList(args)) args = [args];
  if (prop && clearev) return async ev => { ev.stopPropagation(); clearEvents(); func(...args); }
  else if (prop) return async ev => { ev.stopPropagation(); func(...args); }
  else if (clearev) return async ev => { clearEvents(); func(...args); }
  else return func(...args);
}
function fInterruptable(func) { return wrapFunc(func, [...arguments].slice(1)); }

function cFlip(card, callback) {
  let child = card.div;
  let a = ANIM.flipcard = aFlip(child, 800, 'ease-in');
  a.onfinish = () => { toggle_face(card); if (isdef(callback)) callback(); };
  return a;
}
function cMove(card, newParent, callback) {
  let child = card.div;
  let zOld = child.style.zIndex;
  mStyle(child, { z: 10000 })
  let a = ANIM.move = aMove(child, newParent, 800, 'ease-in');
  // let [dx, dy] = screenDistance(child, newParent);
  // let a = ANIM.cards = mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px)`], callback, ms, 'ease-in');
  a.onfinish = () => { if (isdef(callback)) callback(); };
  a.oncancel = () => mStyle(child, { z: zOld });
  return a;

}
function aMove(d, newParent, ms = 800, easing = 'ease-in') {
  let [dx, dy] = screenDistance(d, newParent);
  return d.animate({ transform: `translateX(${dx}px) translateY(${dy}px)` }, { easing, duration: ms });

}

function aFlip(d, ms = 300, easing = 'cubic-bezier(1,-0.03,.27,1)') {
  return d.animate({ transform: `scale(${0},${1})` }, { easing, duration: ms });
}
function anim_face_down(item, ms = 300, callback = null) { face_up(item); anim_toggle_face(item, callback); }
function anim_face_up(item, ms = 300, callback = null) { face_down(item); anim_toggle_face(item, callback); }
function anim_toggle_face(item, ms = 300, callback = null) {
  let d = iDiv(item);
  mClass(d, 'aniflip');
  TO.anim = setTimeout(() => {
    if (item.faceUp) face_down(item); else face_up(item); mClassRemove(d, 'aniflip');
    if (isdef(callback)) callback();
  }, ms);
}

function setStallStage(table) {
  let fen = table.fen;
  //console.log('STALL!!!', '\nfen.passed',fen.passed,'\nfen.phase',fen.phase,'\nfen.stage',fen.stage);
  delete fen.passed;
  table.turn = [table.plorder[0]];
  fen.stage = fen.phase == 'jack' ? 12 : fen.phase == 'queen' ? 11 : 4;
  fen.stallSelected = [];
  return [fen.stage, table.turn];
}


function deepCompare(obj1, obj2) {
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return { oldValue: obj1, newValue: obj2 };
    const arr2 = [...obj2];
    for (let i = 0; i < obj1.length; i++) {
      let foundIndex = -1;
      for (let j = 0; j < arr2.length; j++) {
        if (deepCompare(obj1[i], arr2[j]) === null) {
          foundIndex = j;
          break;
        }
      }
      if (foundIndex !== -1) {
        arr2.splice(foundIndex, 1);
      } else {
        return { oldValue: obj1, newValue: obj2 };
      }
    }
    return null;
  }
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return obj1 === obj2 ? null : { oldValue: obj1, newValue: obj2 };
  }
  const changes = {};
  for (let key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      const nestedChanges = deepCompare(obj1[key], obj2[key]);
      if (nestedChanges !== null) {
        changes[key] = nestedChanges;
      }
    }
  }
  for (let key in obj2) {
    if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
      changes[key] = { oldValue: undefined, newValue: obj2[key] };
    }
  }
  return Object.keys(changes).length > 0 ? changes : null;
}

function addBadge(dg, text) {
  mStyle(dg, { position: 'relative' });
  let badge = mDom(dg, { position: 'absolute', bottom: 7, right: 7, bg: 'red', fg: 'white', fz: 12, z: 1000, round: true, pahv: '6 2' }, { html: text })
}

function face_up(item) {
  if (item.faceUp) return;
  let svgCode = item.svgUp;
  if (nundef(svgCode)) {
    svgCode = M.c52[item.key];
    item.svgUp = svgCode;

  }
  item.div.innerHTML = svgCode;
  item.faceUp = true;
}
function face_down(item, color = "#b01b1b") {
  if (!item.faceUp) return;
  let svgCode = item.svgDown;
  //console.log('svgCode', svgCode);
  if (nundef(svgCode)) {
    //let svgCode = M.c52.card_2B; //C52 is cached asset loaded in _start
    svgCode = item.svgDown = `<svg xmlns="http://www.w3.org/2000/svg" class="card" face="2B" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
				<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
				<rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="${color}" fill-opacity="0.7"></rect>
				<defs>
					<pattern id="backPatternLarge" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
						<path d="M15 0 L30 15 L15 30 L0 15 Z" fill="none" stroke="white" stroke-width="2" stroke-opacity=".8"/>
					</pattern>
				</defs>
				<rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="url(#backPatternLarge)"></rect>
			</svg>`;
    item.color = color;
    // if (nundef(color)) color = item.color;
    // if (isdef(item.color)) item.div.children[0].children[1].setAttribute('fill', item.color);
  }
  item.div.innerHTML = svgCode;
  item.faceUp = false;
}
function toggle_face(item) { if (item.faceUp) face_down(item); else face_up(item); }


function selectionClear() {
  DA.pendingItems = {};
  DA.isLocked = false;
}
function selectionToggle(item) {
  if (isdef(DA.pendingItems[item.key])) { delete DA.pendingItems[item.key]; }
  else DA.pendingItems[item.key] = item;

  DA.isLocked = Object.keys(DA.pendingItems).length > 0;
}
async function updateMain(forceUI = false) {
  let hasChanges = await updateData();
  if (!hasChanges && !forceUI) { return false; }
  await updateUI();
  return true;
}

async function reloadTable() {
  if (nundef(DA.tid)) DA.tid = localStorage.getItem('tid') || DA.tableDict ? arrLast(Object.keys(DA.tableDict)) : null;
  if (!DA.tid) return true;
  localStorage.setItem('tid', DA.tid);
  let table = await dbGetGameTable(DA.tid);
  if (table.error) {
    DA.tid = null;
    return true;
  }
  let clientTable = DAGetTable();
  let hasChanges = !clientTable || !table || table.modified != clientTable.modified || table.step != clientTable.step;
  if (hasChanges) {
    DA.oldTable = clientTable;
    DA.tableDict[DA.tid] = table;
  }
  return hasChanges;
}

function aristo() {
  const rankstr = 'A23456789TJQK*';
  function setup(table) {
    let fen = table.fen = {};
    let options = table.options; //console.log('options', options);
    let players = table.players;
    let plNames = Object.keys(table.players);
    let n = plNames.length;
    let num_decks = fen.num_decks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
    //console.log('num_decks', num_decks);
    let deck = fen.deck = c52Decks(num_decks).map(x => x + 'n'); arrShuffle(deck);
    let deck_commission = fen.deck_commission = c52Decks(1).map(x => x + 'c'); arrShuffle(deck_commission);
    let deck_luxury = fen.deck_luxury = c52Decks(1).map(x => x + 'l'); arrShuffle(deck_luxury);
    let deck_rumors = fen.deck_rumors = exp_peasants(options) ? c52Decks(1).map(x => x + 'r') : []; if (exp_peasants(options)) shuffle(deck_rumors);
    table.plorder = jsCopy(plNames);
    arrShuffle(table.plorder);
    fen.market = cDeckDeal(deck, 2);
    fen.deck_discard = [];
    fen.open_discard = [];
    fen.commissioned = []; //eg., [Q,A,5,...]
    fen.open_commissions = exp_commissions(options) ? cDeckDeal(deck_commission, 3) : [];
    fen.church = exp_church(options) ? cDeckDeal(deck, plNames.length) : [];
    for (const plname of plNames) {
      let pl = table.players[plname];
      addKeys({
        hand: cSort(cDeckDeal(deck, 7), null, rankstr),
        commissions: exp_commissions(options) ? cSort(cDeckDeal(deck_commission, 4), null, rankstr) : [],
        rumors: exp_rumors(options) ? cSort(cDeckDeal(deck_rumors, players.length - 1), null, rankstr) : [],
        journeys: [], //options.journey == 'no' ? [] : coin() ? [['QSr', 'KSr']] : [['3Cr', '4Cr']],
        buildings: { farm: [], estate: [], chateau: [] },
        stall: [],
        stall_value: 0,
        coins: 3,
        vps: 0,
        score: 0,
        name: plname,
        color: pl.color,
      }, pl);
    }
    fen.phase = 'king'; //TODO: king !!!!!!!
    fen.num_actions = 0;
    fen.herald = table.plorder[0];
    fen.heraldorder = jsCopy(table.plorder);

    // ariSetStage(table);
    if (exp_commissions(options)) {
      historyAddLines([`commission trading starts`], 'commissions', fen);
      [fen.stage, table.turn] = [23, table.plorder];
      fen.comm_setup_num = 3; fen.keeppolling = true;
    } else if (exp_rumors(options) && table.plorder.length > 2) {
      historyAddLines([`gossiping starts`], 'rumors', fen);
      [fen.stage, table.turn] = [24, table.plorder];
    } else if (exp_journeys(options)) {
      historyAddLines([`journey starts`], 'journey', fen);

      [fen.stage, table.turn] = [1, table.plorder];
    } else {
      [fen.stage, table.turn] = setStallStage(table);
    }
    table.turn = table.turn.sort();

    //console.log('table', table, 'fen', fen);
  }
  function present(me, table) { return ari_present(me, table); }
  function activate(me, table, ui) { ari_pre_action(me, table, ui); }


  function check_resolve() { return ari_check_resolve(); }
  function check_gameover(z) { return isdef(z.fen.winners) ? z.fen.winners : false; }
  function stats(dParent) { ari_stats(dParent); }
  function state_info(dParent) { ari_state(dParent); }
  function get_selection_color(item) {
    if (Z.stage == 41 && Z.A.selected.length == 1) return 'blue'; return 'red';
  }
  return { get_selection_color, rankstr, setup, activate, check_gameover, present, state_info, stats };
}

function cSort(hand, suits = null, ranks = null) {
  const suitOrder = suits ? Object.fromEntries([...suits].map((s, i) => [s, i])) : null;
  const rankOrder = ranks ? Object.fromEntries([...ranks].map((r, i) => [r, i])) : null;

  return hand.sort((a, b) => {
    // Normalize: extract the string key if it's an object
    const valA = typeof a === 'object' ? a.key : a;
    const valB = typeof b === 'object' ? b.key : b;

    if (suits) {
      // Access suit (index 1 of the string)
      const suitDiff = suitOrder[valA[1]] - suitOrder[valB[1]];
      if (suitDiff !== 0) return suitDiff;
    }

    if (ranks) {
      // Access rank (index 0 of the string)
      return rankOrder[valA[0]] - rankOrder[valB[0]];
    }

    return 0;
  });
}
function mGrid(rows, cols, dParent, styles = {}, opts = {}) {
  let d = mDom(dParent, styles, opts);
  if (isNumber(rows)) {
    d.style.display = 'inline-grid';
    [rows, cols] = [Math.ceil(rows), Math.ceil(cols)]
    d.style.gridTemplateColumns = `repeat(${cols}, max-content)`;
    d.style.gridTemplateRows = `repeat(${rows}, auto)`;
  } else {
    d.style.display = 'grid';
    copyKeys({ gridRows: rows, gridCols: cols }, styles);
    mStyle(d, styles)
  }
  return d;
}

function stdInstruction(me, table, text) {
  let myTurn = table.turn.includes(me);
  let spectating = !Object.keys(table.players).includes(me);
  //return { myTurn, spectating };
  let fen = table.fen;
  let dInst = mBy('dInstruction'); //console.log(table.turn)
  let html;
  if (myTurn) {
    animatedTitle();
    let text1, text2;
    if (isdef(text)) { text1 = 'You'; text2 = text; }
    else if (isdef(fen.instruction)) { text1 = 'You'; text2 = fen.instruction; }
    else { text1 = 'Your turn'; text2 = ''; }
    html = `
        ${getWaitingHtml(14)}
        <span style="color:red;font-weight:bold;max-height:25px">${text1}</span>
        &nbsp;<span id='dInstructionText'>${text2}</span>
        `;
  } else if (spectating) {
    html = 'you are a spectator!'
  } else { html = `waiting for: ${getTurnPlayers(table)}` }
  dInst.innerHTML = html;
  //mStyle(dInst, { bg:'white',w100:true,hmin: 42, display: 'flex', justifyContent: 'center', alignItems: 'center' },{className:'section'});
  //mClass(dInst,'section');
  mStyle(dInst, { w100: true }, { className: 'section' });
  return { myTurn, spectating };
}

function show_progress(fen) {
  if (isdef(fen.progress)) {
    let d = mBy('dTitleLeft');
    let former = mBy('dProgress');
    if (isdef(former)) former.remove();
    let dprogress = mDom(d, {}, { id: 'dProgress', html: `<div>${fen.progress}</div>` });
  }
}
function set_card_border(item, thickness = 1, color = 'black', dasharray) {
  let d = item.div;
  console.log('set_card_border', item, d);
  let rect = lastDescendantOfType('rect', d);
  if (rect) {
    rect.setAttribute('stroke-width', thickness);
    rect.setAttribute('stroke', color);
    if (isdef(dasharray)) rect.setAttribute('stroke-dasharray', dasharray);
  } else {
    mStyle(d, { border: `solid ${1}px ${color}` })
  }
}
function lastDescendantOfType(type, parent) {
  if (getTypeOf(parent) == type) return parent;
  let children = arrChildren(parent);
  if (isEmpty(children)) return null;
  for (const ch of children.reverse()) {
    let res = lastDescendantOfType(type, ch);
    if (res) return res;
  }
  return null;
}


function get_next_player(table, uname) {
  let plorder = table.plorder;
  let iturn = plorder.indexOf(uname);
  let nextplayer = plorder[(iturn + 1) % plorder.length];
  return nextplayer;
}

function get_prev_player(table, uname) {
  let plorder = table.plorder;
  let iturn = plorder.indexOf(uname);
  let prevplayer = plorder[(iturn - 1 + plorder.length) % plorder.length];
  return prevplayer;
}



//#region selection
function toggleItemSelectionState(item) {
  //console.log('item', item);
  if (item.state === 'selectable') {
    showItemAsSelected(item);
  } else if (item.state === 'selected') {
    showItemAsUnselected(item);
    showItemAsSelectable(item);
  }
}
function showItemAsSelectable(item) {
  switch (item.itype) {
    case 'card': make_card_selectable(item); break;
    case 'container': make_container_selectable(item); break;
    case 'player': make_container_selectable(item); break;
    case 'string': make_string_selectable(item); break;
  }
  item.state = 'selectable';
}
function showItemAsSelected(item) {
  switch (item.itype) {
    case 'card': make_card_selected(item); break;
    case 'container': make_container_selected(item); break;
    case 'player': make_container_selected(item); break;
    case 'string': make_string_selected(item); break;
  }
  item.state = 'selected';
}
function showItemAsUnselectable(item) {
  switch (item.itype) {
    case 'card': make_card_unselectable(item); break;
    case 'container': make_container_unselectable(item); break;
    case 'player': make_container_unselectable(item); break;
    case 'string': make_string_unselectable(item); break;
  }
  item.state = 'unselectable';
}
function showItemAsUnselected(item) {
  switch (item.itype) {
    case 'card': make_card_unselected(item); break;
    case 'container': make_container_unselected(item); break;
    case 'player': make_container_unselected(item); break;
    case 'string': make_string_unselected(item); break;
  }
  item.state = 'unselected';
}

function make_card_selectable(item) {
  let d = item.div; //console.log(d);//iDiv(item);
  mClass(d, 'selectable');
  // if (Z.game != 'aristo') { spread_hand(item.path, .3); }
  //mClass(d.parentNode, 'selectable_parent');
}
function make_card_selected(item) {
  let color = 'red';
  set_card_border(item, 13, color);
  if (DA.magnify_on_select) mClass(iDiv(item), 'mag');
}
function make_card_unselectable(item) { let d = iDiv(item); d.onclick = null; mClassRemove(d, 'selectable'); mClassRemove(d.parentNode, 'selectable_parent'); spread_hand(item.path); }
function make_card_unselected(item) { set_card_border(item); if (DA.magnify_on_select) mClassRemove(iDiv(item), 'mag'); }
function make_container_selectable(item) { let d = iDiv(item); mClass(d, 'selectable'); mClass(d, 'selectable_parent'); }
function make_container_selected(item) { let d = iDiv(item); mClass(d, 'selected_parent'); }
function make_container_unselectable(item) { let d = iDiv(item); d.onclick = null; mClassRemove(d, 'selectable'); mClassRemove(d, 'selectable_parent'); }
function make_container_unselected(item) { let d = iDiv(item); mClassRemove(d, 'selected_parent'); }
function make_string_selectable(item) { let d = mBy(item.id); mClass(d, 'selectable_button'); }
function make_string_selected(item) { let d = mBy(item.id); item.bg = mGetStyle(d, 'bg'); item.fg = mGetStyle(d, 'fg'); mStyle(d, { bg: 'yellow', fg: 'black' }); } //console.log('item', item, 'd', d); 
function make_string_unselectable(item) { let d = mBy(item.id); d.onclick = null; mClassRemove(d, 'selectable_button'); }
function make_string_unselected(item) { let d = mBy(item.id); mStyle(d, { bg: item.bg, fg: item.fg }); } //mClassRemove(d, 'string_selected'); }

//#endregion

async function pollAndShow() {
  if (nundef(DA.pollStates)) return;
  DA.pollCounter++;
  if (DA.isProcessingMove) return;
  if (VERBOSE) console.log('polling...updating!', DA.pollCounter,);
  DA.isProcessingMoave = true;
  let uiUpdated = await updateMain();
  //if (uiUpdated) { show_polling_signal('green'); } else { show_polling_signal('lightgrey'); }
  DA.isProcessingMove = false;
}


function stdPresentBGATableCols(me, table, ms, className = 'wood') {
  setCssVar('--velvet-color', MGetUserColor(me));
  if (isdef(ms)) pollChangeInterval(ms);
  let dm = mDom('dMain', { hmin: 700, box: true, padding: 0 }, { className });
  mDom(dm, flexSpaceBetween(), { id: 'dTitle' });
  let dg = mGrid('auto', '1fr auto', dm); //console.log('dg',dg)
  let dTable = mDom(dg, flexCenterCenter(), { id: 'dTable' });
  mDom(dg, { hmin: 1000 }, { id: 'dStats' });
  mDom(dTable, flexCenterCenter(), { id: 'dInstruction' });
  mDom(dTable, flexCenterCenter(), { id: 'dActions' });
  return dTable;
}

function ariShowTitle(table) {
  let fen = table.fen;
  let list = table.turn;

  let d0 = dTitle = mBy('dTitle');
  mClear(dTitle);
  mStyle(dTitle, { w100: true, patop: 4, wrap: 'nowrap', box: true });

  mStyle(dTitle, flexSpaceBetween());
  let d1 = mDom(d0, { paleft: 12, display: 'flex', alignItems: 'start', justifyContent: 'start' }, { id: 'dTitleLeft' });
  let d2 = mDom(d0, { paright: 10, box: true }, { id: 'dTitleRight' });

  let dPhase = mDom(d1, { display: 'flex', alignItems: 'center', justifyContent: 'center' });
  if (['king', 'queen', 'jack'].some(x => fen.phase == x)) {
    //dPhase.innerHTML = 'Phase: ';// + capitalize(fen.phase);
    let ph = mDom(dPhase, { wmax: 60, maright: 6 }); //, { html: `Phase: <span style="color:red;font-weight:bold">${capitalize(fen.phase)}</span>` });
    let ph1 = mDom(ph, { fz: 14, deco: 'underline' }, { html: `Phase` });
    let ph2 = mDom(ph, { fz: 18, fg: fen.phase == 'queen' ? 'black' : 'red', weight: 'bold', matop: -2 }, { html: capitalize(fen.phase) });
    let x = mDom(dPhase);
    let rank = fen.phase[0].toUpperCase();
    let card = rank + (fen.phase == 'queen' ? 'Sn' : 'Hn');
    showCardMini(x, card, 44);
  } else {
    dPhase.innerHTML = `Phase: ${fen.phase}`;
  }

  if (TESTING) {
    let dStage = mDom(d1, { maleft: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }, {});
    mDom(dStage, {}, { html: `${fen.stage}: ${ARI.stage[fen.stage]}` })
  }

  let dPlayers = mDom(d1, { maleft: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }, {});
  mDom(dPlayers, { fz: 14, deco: 'underline' }, { html: 'Turn:' });
  if (sameList(list, table.plorder) && list.length > 2) {
    mDom(dPlayers, { maleft: 4 }, { html: 'All' });
  } else {
    for (const plname of list) {
      let pl = table.players[plname];
      let src = MGetUserImageSource(plname);
      let cimgborder = pl.color;
      let sz = 20;
      let img = mDom(dPlayers, { cursor: 'pointer', border: `1px solid ${cimgborder}`, maleft: 4, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot' }, { tag: 'img', src });
      img.onclick = () => switchToUser(plname);
    }
  }
  //console.log(d1)
  // mDom(dTitle,{},{id:'dTitleMiddle'});
  html = fromNormalized(table.friendly) + ' (' + fromNormalized(MGetGame(table.game).friendly) + ')';
  mStyle(d2, {}, { html });

}

function hasBuildings(pl) {
  // Check if any of the arrays within the buildings object have a length > 0
  return Object.values(pl.buildings).some(buildingList => buildingList.length > 0);
}
function ari_present_player(plname, table, d, ishidden = false) {
  let fen = table.fen;
  let pl = table.players[plname];
  //d=mDom(d, { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, w100:true });
  let ui = { div: d };

  //mStyle(d, { w100:true});//,display: 'flex', alignItems: 'center', padding: 4, bg: pl.color + '80', border: `2px solid ${pl.color}`, rounding: 9, margin: 4 });
  let d1 = mDom(d); //, { bg: 'orange' });
  let hand = ui.hand = ui_type_hand(pl.hand, d1, {}, `players.${plname}.hand`, 'hand', uiTypeCard52);
  if (ishidden) { hand.items.map(x => face_down(x)); }

  d1 = mDom(d);
  let stall = ui.stall = ui_type_market(pl.stall, d1, { maleft: 12 }, `players.${plname}.stall`, 'stall', uiTypeCard52);
  if (fen.stage < 5 && ishidden) { stall.items.map(x => face_down(x)); }
  if (exp_commissions(table.options)) {
    d1 = mDom(d);
    if (!ishidden) pl.commissions = cSort(pl.commissions, null, 'A23456789TJQK'); //correct_handsorting(pl.commissions, plname);
    ui.commissions = ui_type_market(pl.commissions, d1, { maleft: 12 }, `players.${plname}.commissions`, 'commissions', uiTypeCommissionCard) //Z.stage == 23 ? ari_get_card_large : ari_get_card);
    if (ishidden) { ui.commissions.items.map(x => face_down(x)); }
    else mMagnifyOnHoverControlPopup(ui.commissions.cardcontainer);

    if (TESTING && isdef(DA.ttest)) {
      //show all cards open!
      let testpl = DA.ttest.players[plname];
      ui_type_market(testpl.commissions, d1, { matop: -20, maleft: 12 }, `players.${plname}.test.commissions`, 'commissions', uiTypeCommissionCard)
    }
  }
  //console.log('player ui',ui)
  return ui;
  if (exp_rumors(table.options)) {
    if (!ishidden) pl.rumors = correct_handsorting(pl.rumors, plname);
    ui.rumors = ui_type_market(pl.rumors, d, { maleft: 12 }, `players.${plname}.rumors`, 'rumors', Z.stage == 24 ? ari_get_card_large : ari_get_card);
    if (ishidden) { ui.rumors.items.map(x => face_down(x)); }
    else mMagnifyOnHoverControlPopup(ui.rumors.cardcontainer);
  }
  ui.journeys = [];
  let i = 0;
  for (const j of pl.journeys) {
    let jui = ui_type_hand(j, d, { maleft: 12 }, `players.${plname}.journeys.${i}`, '', ari_get_card);//list, dParent, path, title, get_card_func
    i += 1;
    ui.journeys.push(jui);
  }
  mLinebreak(d, 8);
  ui.buildinglist = [];
  ui.indexOfFirstBuilding = arrChildren(d).length;
  for (const k in pl.buildings) {
    let i = 0;
    for (const b of pl.buildings[k]) {
      let type = k;
      let b_ui = ui_type_building(b, d, { maleft: 8 }, `players.${plname}.buildings.${k}.${i}`, type, ari_get_card, true, ishidden);
      b_ui.type = k;
      ui.buildinglist.push(b_ui);
      if (b.isblackmailed) { mStamp(b_ui.cardcontainer, 'blackmail'); }
      lookupAddToList(ui, ['buildings', k], b_ui); //GEHT!!!!!!!!!!!!!!!!!!!!!
      i += 1;
    }
  }
  return ui;
}

function get_user_pic_html(uname, sz = 50, border = 'solid medium white') {
  return `<img src='../assets/img/users/${M.users[uname].imgKey}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0px 4px;border:${border}'>`
}




function ui_type_church(list, dParent, styles = {}, path = 'trick', title = '', get_card_func = uiTypeCard52, show_if_empty = false) {
  let cont = ui_make_container(dParent, get_container_styles(styles));
  let cardcont = mDom(cont, { h: 100, w: 90 });//, { display: 'flex' });
  let items = [];
  let n = list.length;
  let inc = n == 4 ? 45 : n == 2 ? 90 : 360 / n; //console.log('inc', inc)
  let rotation = 0; //n % 2 ? 0 : 90;
  for (const ckey of list) {
    let d = mDom(cardcont, { origin: 'center', transform: `rotate( ${rotation}deg )`, position: 'absolute', left: 8 });
    let c = get_card_func(ckey); //console.log('c', c)
    if (ckey != arrLast(list)) face_down(c);
    mAppend(d, iDiv(c));
    remove_card_shadow(c);
    let item = c;
    item.cont = d; //console.log(getRect(d))
    item.itype = 'card';
    //let item = { card: c, div: d };
    items.push(item);
    rotation += inc;
  }
  ui_add_container_title(title, cont, items, show_if_empty);
  return {
    list: list,
    path: path,
    container: cont,
    cardcontainer: cardcont,
    items: items,
  }
}


function ui_add_container_title(title, cont, items, show_if_empty) {
  if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
    mDom(cont, { w100: true, align: 'center', maleft: -2, matop: 2 }, { html: title });
  }
}


function ui_add_cards_to_deck_container(cont, items, list) {
  if (nundef(list)) list = items.map(x => x.key);
  for (const item of items) {
    mAppend(cont, iDiv(item));
    mItemSplay(item, list, 4, Card.ovdeck);
    face_down(item);
  }
  return items[0];
}
function ui_add_cards_to_hand_container(cont, items, list) {
  if (nundef(list)) list = items.map(x => x.key);
  for (const item of items) {
    mAppend(cont, iDiv(item));
    mItemSplay(item, list, 2, Card.ovw);
  }
}
function ui_make_container(dParent, styles = { bg: 'random', padding: 10 }) {
  let id = getUID('u');
  let d = mDiv(dParent, styles, id);
  return d;
}
function ui_make_deck_container(list, dParent, styles = { bg: 'random', padding: 10 }, get_card_func) {
  let id = getUID('u'); // 'deck_cont'; //getUID('u');
  let d = mDiv(dParent, styles, id);
  if (isEmpty(list)) return d;
  let c = get_card_func(list[0]);
  mContainerSplay(d, 4, c.w, c.h, n, 0);
  return d;
}
function ui_make_hand_container(items, dParent, styles = { bg: 'random', padding: 10 }) {
  let id = getUID('u');
  let d = mDiv(dParent, styles, id);
  if (!isEmpty(items)) {
    let card = items[0];
    mContainerSplay(d, 2, card.w, card.h, items.length, card.ov * card.w);
  }
  return d;
}




function mPlace(elem, pos, offx, offy) {
  elem = toElem(elem);
  //console.log(pos)
  pos = pos.toLowerCase();
  let dParent = elem.parentNode; mIfNotRelative(dParent);
  let hor = valf(offx, 0);
  let vert = isdef(offy) ? offy : hor;
  if (pos[0] == 'c' || pos[1] == 'c') {
    let dpp = dParent.parentNode;
    let opac = mGetStyle(dParent, 'opacity'); //console.log('opac', opac);
    if (nundef(dpp)) { mAppend(document.body, dParent); mStyle(dParent, { opacity: 0 }) }
    let rParent = getRect(dParent);
    let [wParent, hParent] = [rParent.w, rParent.h];
    let rElem = getRect(elem);
    let [wElem, hElem] = [rElem.w, rElem.h];
    if (nundef(dpp)) { dParent.remove(); mStyle(dParent, { opacity: valf(opac, 1) }) }
    switch (pos) {
      case 'cc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert + (hParent - hElem) / 2 }); break;
      case 'tc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert }); break;
      case 'bc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, bottom: vert }); break;
      case 'cl': mStyle(elem, { position: 'absolute', left: hor, top: vert + (hParent - hElem) / 2 }); break;
      case 'cr': mStyle(elem, { position: 'absolute', right: hor, top: vert + (hParent - hElem) / 2 }); break;
    }
    return;
  }
  let di = { t: 'top', b: 'bottom', r: 'right', l: 'left' };
  elem.style.position = 'absolute';
  let kvert = di[pos[0]], khor = di[pos[1]];
  elem.style[kvert] = vert + 'px'; elem.style[khor] = hor + 'px';
}

function mButtonX(dParent, handler = null, sz = 22, offset = 5, color = 'contrast') {
  mIfNotRelative(dParent);
  let [top, right] = [offset - 3, offset];
  let bx = mDom(dParent, { position: 'absolute', top, right, w: sz, h: sz, cursor: 'pointer' }, { className: 'hop1' });
  bx.onclick = ev => { evNoBubble(ev); if (!handler) dParent.remove(); else handler(ev); }
  let o = M.superdi.xmark;
  let bg = mGetStyle(dParent, 'bg'); if (isEmpty(bg)) bg = 'white';
  let fg = color == 'contrast' ? colorIdealText(bg, true) : color;
  el = mDom(bx, { fz: sz, hline: sz, family: 'fa6', fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
  return bx;
}
function mButtonX(dParent, handler, pos = 'tr', sz = 18, offset = 2, color = 'white') {
  let d2 = mDiv(dParent, { fg: color, w: sz, h: sz, pointer: 'cursor' }, null, `<i class="fa fa-times" style="font-size:${sz}px;"></i>`, 'btnX');
  mPlace(d2, pos, offset);
  d2.onclick = handler;
  return d2;
}


async function setPlayerNotPlaying(item, gamename) {
  await saveDataFromPlayerOptionsUI(gamename);
  removeInPlace(DA.playerList, item.name);
  mRemoveIfExists('dPlayerOptions');
  unselectPlayerItem(item);
}
async function setPlayerPlaying(allPlItem, gamename) {
  let name = allPlItem.name;
  addIf(DA.playerList, name);
  highlightPlayerItem(allPlItem);
  await saveDataFromPlayerOptionsUI(gamename);
  DA.lastAllPlayerItem = allPlItem;
  let poss = MGetGamePlayerOptions(gamename);
  if (!poss) return;
  let dParent = mBy('dGameMenu');
  let bg = MGetUserColor(name);
  let d1 = mDom(dParent, { bg: colorLight(bg, 50), border: `solid 2px ${bg}`, rounding: 6, display: 'inline-block', hPadding: 3 }, { id: 'dPlayerOptions' });
  mDom(d1, { maleft: 5, matop: -2 }, { html: name });
  let d = mDom(d1, { display: 'flex', justifyContent: 'center', flexWrap: 'wrap' });
  for (const [key, val] of Object.entries(poss)) {
    if (!isString(val)) continue;
    let list = val.split(',');
    let fs = mRadioGroup(d, { fg: 'black' }, `d_${key}`, formatLegend(key));
    for (const v of list) {
      let val = isNumber(v) ? Number(v) : v;
      let radio = mRadio(v, val, key, fs, { cursor: 'pointer' }, null, key, false);
      radio.firstChild.onchange = () => {
        lookupSetOverride(DA.allPlayers, [name, key], val);
        if (key === 'playmode') updateUserImageToBotHuman(name, val);
      };
    }
    let userval = lookup(DA.allPlayers, [name, key]);
    for (const ch of fs.children) {
      if (!ch.id) continue;
      let rval = stringAfterLast(ch.id, '_');
      if (isNumber(rval)) rval = Number(rval);
      ch.firstChild.checked = userval == rval || (nundef(userval) && `${rval}` == arrLast(list));
    }
    measureFieldset(fs);
  }
  let [r, rp] = [getRectInt(allPlItem.div, dParent), getRectInt(d1)];
  let x = Math.min(Math.max(r.x - rp.w / 2 + r.w / 2, 0), window.innerWidth - rp.w - 100);
  mIfNotRelative(dParent);
  mPos(d1, x, r.y - rp.h - 4);
  const cleanup = () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  };
  const saveAndClose = () => {
    saveAndUpdatePlayerOptions(allPlItem, gamename);
    cleanup();
    d1.remove();
  };
  const handleClickOutside = ev => {
    if (ev.target.closest('#dMenuPlayers') || ev.target.closest('#dPlayerOptions')) return;
    saveAndClose();
  };
  const handleEscape = ev => {
    if (ev.key === 'Escape') saveAndClose();
  };
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
  }, 0);
  mButtonX(d1, saveAndClose, 'tr', 18, 2, 'dimgray');
}

function get_c52j_info(ckey, backcolor = BLUE) {
  let info;
  if (ckey[0] == '*') {
    info = {
      c52key: `card_0J`, //'card_1J', //`card_${1+n%2}`,
      color: "#e6194B",
      friendly: "Joker",
      key: ckey,
      h: 100,
      ov: 0.25,
      rank: "*",
      short: "J",
      suit: ckey[1],
      sz: 100,
      val: 0,
      w: 70,
    };
  } else {
    info = jsCopy(C52Cards[ckey.substring(0, 2)]);
  }
  info.key = ckey;
  info.cardtype = ckey[2];
  let [r, s] = [info.rank, info.suit];
  info.val = r == '*' ? 0 : r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
  info.color = backcolor;
  info.sz = info.h = sz;
  info.w = valf(w, sz * .7);
  let ranks = valf(lookup(Z, ['fen', 'ranks']), '*A23456789TJQK'); //Z.fen.ranks;
  info.irank = ranks.indexOf(r);
  info.isuit = 'SHCD'.indexOf(s);
  info.isort = info.isuit * ranks.length + info.irank;
  return info;
}
function get_color_of_card(ckey) { return is_color(ckey) ? ckey : ckey.length == 3 ? ['H', 'D'].includes(ckey[1]) ? 'red' : 'black' : stringAfter(ckey, '_'); }
function get_container_styles(styles = {}) {
  let defaults = valf(M.config.ui.container, {});
  defaults.position = 'relative';
  addKeys(defaults, styles);
  return styles;
}
function get_containertitle_styles(styles = {}) { let defaults = valf(M.config.ui.containertitle, {}); defaults.position = 'absolute'; addKeys(defaults, styles); return styles; }
function get_group_rank(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[0]; }
function get_joker_info() {
  return {
    c52key: `card_0J`, //'card_1J', //`card_${1+n%2}`,
    color: "#e6194B",
    friendly: "Joker",
    key: '*Hn',
    h: 100,
    irank: 14,
    isort: 100,
    isuit: 3,
    ov: 0.25,
    rank: "*",
    short: "J",
    suit: "H",
    sz: 100,
    val: 1,
    w: 70,
  };
}
function get_robot_personality(name) { return { erratic: 20, bluff: 20, random: 20, risk: 20, passive: 20, clairvoyant: 20, aggressive: 20 }; }
function get_sequence_suit(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[1]; }
function get_splay_number(wsplay) { return wsplay == 'none' ? 0 : wsplay == 'left' ? 1 : wsplay == 'right' ? 2 : wsplay == 'up' ? 3 : 4; }
function get_splay_word(nsplay) { return nsplay == 0 ? 'none' : nsplay == 1 ? 'left' : nsplay == 2 ? 'right' : nsplay == 3 ? 'up' : 'deck'; }
function get_valid_voters() {
  return Z.fen.validvoters.filter(x => Z.fen.players[x].hand.length >= 1);
}



function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card, separate_lead = false, ishidden = false) {
  let cont = ui_make_container(dParent, get_container_styles(styles));
  let cardcont = mDiv(cont);
  let list = b.list;
  let d = mDiv(dParent);
  let items = list.map(x => get_card_func(x));
  reindex_items(items);
  let d_harvest = null;
  if (isdef(b.h)) {
    let keycard = items[0];
    let d = iDiv(keycard);
    mStyle(d, { position: 'relative' });
    d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
  }
  let d_rumors = null, rumorItems = [];
  if (!isEmpty(b.rumors)) {
    let d = cont;
    mStyle(d, { position: 'relative' });
    d_rumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 0, right: 0 }); //,bg:'green'});
    for (const rumor of b.rumors) {
      let dr = mDiv(d_rumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
      rumorItems.push({ div: dr, key: rumor });
    }
  }
  let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
  let [ov, splay] = separate_lead ? [card.ov * 1.5, 5] : [card.ov, 2];
  mContainerSplay(cardcont, 5, card.w, card.h, items.length, card.ov * 1.5 * card.w);
  ui_add_cards_to_hand_container(cardcont, items, list);
  ui_add_container_title(title, cont, items);
  let uischweine = [];
  for (let i = 1; i < items.length; i++) {
    let item = items[i];
    if (!b.schweine.includes(i)) face_down(item); else add_ui_schwein(item, uischweine);
  }
  return {
    ctype: 'hand',
    list: list,
    path: path,
    container: cont,
    cardcontainer: cardcont,
    items: items,
    schweine: uischweine,
    harvest: d_harvest,
    rumors: rumorItems,
    keycard: items[0],
  };
}
function ui_type_lead_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
  let hcard = isdef(styles.h) ? styles.h - 30 : Config.ui.card.h;
  addKeys(get_container_styles(styles), styles);
  let cont = ui_make_container(dParent, styles);
  let items = list.map(x => get_card_func(x, hcard));
  let cardcont = mDiv(cont);
  let card = isEmpty(items) ? { w: 1, h: hcard, ov: 0 } : items[0];
  let splay = 5;
  mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
  ui_add_cards_to_hand_container(cardcont, items, list);
  ui_add_container_title(title, cont, items, show_if_empty);
  return {
    ctype: 'hand',
    list: list,
    path: path,
    container: cont,
    cardcontainer: cardcont,
    splay: splay,
    items: items,
  };
}
function ui_type_market(list, dParent, styles = {}, path = 'market', title = 'market', get_card_func = ari_get_card, show_if_empty = false) {
  let cont = ui_make_container(dParent, get_container_styles(styles));
  let cardcont = mDiv(cont, { display: 'flex', gap: 2 });
  let items = list.map(x => get_card_func(x));
  items.map(x => mAppend(cardcont, iDiv(x)));
  ui_add_container_title(title, cont, items, show_if_empty);
  return {
    ctype: 'market',
    list: list,
    path: path,
    container: cont,
    cardcontainer: cardcont,
    items: items,
  };
}
function ui_type_rank_count(list, dParent, styles, path, title, get_card_func, show_if_empty = false) {
  let cont = ui_make_container(dParent, get_container_styles(styles));
  let cardcont = mDiv(cont, { display: 'flex' });
  let items = [];
  for (const o of list) {
    let d = mDiv(cardcont, { display: 'flex', dir: 'c', padding: 1, fz: 12, align: 'center', position: 'relative' });
    let c = get_card_func(o.key);
    mAppend(d, iDiv(c));
    remove_card_shadow(c);
    d.innerHTML += `<span style="font-weight:bold">${o.count}</span>`;
    let item = { card: c, count: o.count, div: d };
    items.push(item);
  }
  ui_add_container_title(title, cont, items, show_if_empty);
  return {
    list: list,
    path: path,
    container: cont,
    cardcontainer: cardcont,
    items: items,
  }
}



function show_view_buildings_button(plname) {
  if (Z.role == 'spectator' || isdef(mBy('dPlayerButtons'))) return;
  if (isEmpty(UI.players[plname].buildinglist)) return;
  let d1 = iDiv(UI.players[plname]); mStyle(d1, { position: 'relative' });
  let d2 = mDiv(d1, { position: 'absolute', top: 8, left: 50, height: 25 }, 'dPlayerButtons');
  show_player_button('view buildings', d2, onclick_view_buildings);
}

function historyShow(table, dParent) {
  let [fen, players] = [table.fen, table.players];
  mStyle(dParent, { w: 200 });
  //console.log('history',fen.history)
  if (!isEmpty(fen.history)) {
    let html = '';
    for (const o of jsCopy(fen.history).reverse()) {
      html += historyBeautify(o.lines, o.title, table);
    }
    //console.log('html', html,dParent);
    let bg = colorLight('#EDC690', 50);
    let dHistory = mDom(dParent, { padding: 8, box: true, bg, margin: 8 }, { html });
  }
}
function historyBeautify(lines, title, table) {
  let [fen, players] = [table.fen, table.players];
  let html = `<div class="history"><span style="color:red;font-weight:bold;">${title}: </span>`;
  for (const l of lines) {
    let words = toWords(l);
    for (const w1 of words) {
      if (is_card_key(w1)) { html += mCardText(w1); continue; }
      w = w1.toLowerCase();
      if (isdef(players[w])) {
        html += `<span style="color:${get_user_color(w)};font-weight:bold"> ${w} </span>`;
      } else html += ` ${w} `;
    }
    if (lines.length > 1) html = html.trim() + (l == arrLast(lines) ? '.' : ', ');
  }
  html += "</div>";
  return html;
}



function ariSetStage(table) { //TBD
  let options = table.options;
  let fen = table.fen;

  if (exp_commissions(options)) {
    historyAddLines([`commission trading starts`], 'commissions', fen);
    [fen.stage, table.turn] = [23, table.plorder];
    fen.comm_setup_num = 3; fen.keeppolling = true;
  } else if (exp_rumors(options) && table.plorder.length > 2) {
    historyAddLines([`gossiping starts`], 'rumors', fen);
    [fen.stage, table.turn] = [24, table.plorder];
  } else {

    [fen.stage, table.turn] = setStallStage(table);
  }
}

function historyAddLines(lines, title = '', fen) {
  if (nundef(fen.history)) fen.history = [];
  if (isString(lines)) lines = [lines];
  fen.history.push({ title: title, lines: lines });
}

function ui_player_info(dParent, outerStyles = { dir: 'column' }, innerStyles = {}) {
  let fen = Z.fen;
  if (nundef(outerStyles.display)) outerStyles.display = 'flex';
  mStyle(dParent, outerStyles);
  let items = {};
  let styles = jsCopy(innerStyles); addKeys({ rounding: 10, bg: '#00000050', margin: 4, padding: 4, patop: 12, box: true, 'border-style': 'solid', 'border-width': 6 }, styles);
  let order = get_present_order();
  for (const plname of order) {
    let pl = fen.players[plname];
    console.log('pl', pl);
    let uname = pl.name;
    let imgPath = `../assets/img/users/${M.users[uname].imgKey}.jpg`;
    styles['border-color'] = get_user_color(uname);
    let item = mDivItem(dParent, styles, name2id(uname));
    let d = iDiv(item);
    let picstyle = { w: 50, h: 50, box: true };
    let ucolor = get_user_color(uname);
    if (pl.playmode == 'bot') {
      copyKeys({ rounding: 0, border: `double 6px ${ucolor}` }, picstyle);
    } else {
      copyKeys({ rounding: '50%', border: `solid 2px white` }, picstyle);
    }
    let img = mImage(imgPath, d, picstyle, 'img_person');
    img.onclick = () => onclick_user(uname);
    items[uname] = item;
  }
  if (DA.SIMSIM || is_advanced_user()) activate_playerstats(items)
  return items;
}

function ari_show_handsorting_buttons_for(pl, ui) {
  if (pl.hand.length <= 1) return;

  let d = ui.players[pl.name].hand.container.parentNode;
  assertion(d == ui.players[pl.name].hand.contparent, 'hand container should be child of hand div');
  let text = d.lastChild; text.remove();
  let bstyles = { hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black', maright: 4 };
  let b1 = mDom(d, bstyles, { tag: 'button', innerHTML: 'rank', onclick: () => onclickSortCards(ui.players[pl.name].hand, null, 'A23456789TJQK') });
  let b2 = mDom(d, bstyles, { tag: 'button', innerHTML: 'suit', onclick: () => onclickSortCards(ui.players[pl.name].hand, 'CDSH', 'A23456789TJQK') });
  let dtext = mDom(d, { maleft: 2 }, { tag: 'span', html: 'hand' })
  //mAppend(d,text);

  // let dHandButtons = mDom(d, { display:'flex',wmin:100,bg:'red',position: 'absolute', bottom: -30, left: 0, height: 25 }, {id:'dHandButtons'});
  // console.log(dHandButtons)
  // show_player_button('rank', dHandButtons, ()=>onclickSortCards(ui.players[pl.name].hand,null,'A23456789TJQK'));
  // show_player_button('suit', dHandButtons, ()=>onclickSortCards(ui.players[pl.name].hand,'CDSH','A23456789TJQK'));
}
function show_player_button(caption, ui_item, handler) {
  let d = ui_item;//.container ?? iDiv(ui_item);
  console.log('show_player_button', caption, d);
  let styles = { hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black', maright: 4 };
  let b = mButton(caption, handler, d, styles, 'enabled');
  return b;
}


function remove_card_shadow(c) {
  //console.log(c,iDiv(c), iDiv(c).firstChild);
  iDiv(c).firstChild.setAttribute('class', null);
}



function exp_church(options) { return options.church == 'yes'; }
function exp_commissions(options) { return options.commission == 'yes'; }
function exp_journeys(options) { return options.journey == 'yes'; }
function exp_rumors(options) { return options.rumors == 'yes'; }
function exp_peasants(options) { return options.peasants == 'yes'; }

function showTitleGame(table, d) {
  dTitle = mBy('dTitle');
  mClear(dTitle);
  mStyle(dTitle, { patop: 4, wrap: 'nowrap', box: true });
  let list = table.turn;
  let d0 = mDom(dTitle, flexSpaceBetween());
  let d1 = mDom(d0, { paleft: 12 }, { html: `Player${list.length > 1 ? 's' : ''}: `, id: 'dTitleLeft' });
  if (sameList(list, table.plorder)) {
    mDom(d0, { maleft: 4 }, { html: 'All' });
  } else {
    for (const plname of list) {
      let pl = table.players[plname];
      let src = MGetUserImageSource(plname);
      let cimgborder = pl.color;
      let sz = 20;
      let img = mDom(d0, { border: `1px solid ${cimgborder}`, maleft: 4, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot' }, { tag: 'img', src });
    }
  }
  //console.log(d1)
  mDom(dTitle, {}, { id: 'dTitleMiddle' });
  html = fromNormalized(table.friendly) + ' (' + fromNormalized(MGetGame(table.game).friendly) + ')';
  mDom(dTitle, { paright: 10, box: true }, { html, id: 'dTitleRight' });
}

async function load_assets() {
  Config = await loadStaticYaml('../games98/old/config.yaml');
  Syms = await loadStaticYaml('../base/assets/allSyms.yaml');
  SymKeys = Object.keys(Syms);
  ByGroupSubgroup = await loadStaticYaml('../base/assets/symGSG.yaml');
  C52 = await loadStaticYaml('../base/assets/c52.yaml');
  Cinno = await loadStaticYaml('../base/assets/fe/inno.yaml');
  Info = await loadStaticYaml('../base/assets/lists/info.yaml');
  Sayings = await loadStaticYaml('../base/assets/games/wise/sayings.yaml');
  Poetry = await loadStaticYaml('../base/assets/games/poetry/poetry.yaml');
  create_card_assets_c52();
  KeySets = getKeySets();
  assertion(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
}
function showCardMini(dt, card, sz = 40) {
  mFlex(dt);
  let cardui = uiTypeCard52(card, sz, 'white', 'black', 3, false);
  mClear(dt);
  mAppend(dt, cardui.div);

}
function showTitle(title, dParent = 'dTitle') {
  mClear(dParent);
  return mDom(dParent, { maleft: 20 }, { tag: 'h1', html: title, classes: 'title' });
}
function uiTypeCard52(ckey, h = 100, bg = 'white', border = 'black', borderthickness = 1, shadow = true, color = 'red') {
  let w = h * 0.7;
  let html = M.c52['card_' + ckey.slice(0, 2)];
  //html = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%"><symbol id="SC2" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMinYMid"><path d="M30 150C35 385 85 400 130 500L-130 500C-85 400 -35 385 -30 150A10 10 0 0 0 -50 150A210 210 0 1 1 -124 -51A10 10 0 0 0 -110 -65A230 230 0 1 1 110 -65A10 10 0 0 0 124 -51A210 210 0 1 1 50 150A10 10 0 0 0 30 150Z" fill="black"></path></symbol><symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid"><path d="M-225 -225C-245 -265 -200 -460 0 -460C 200 -460 225 -325 225 -225C225 -25 -225 160 -225 460L225 460L225 300" stroke="black" stroke-width="80" stroke-linecap="square" stroke-miterlimit="1.5" fill="none"></path></symbol><rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect><use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use><use xlink:href="#SC2" height="26.769" x="-111.784" y="-119"></use><use xlink:href="#SC2" height="70" x="-35" y="-135.588"></use><g transform="rotate(180)"><use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use><use xlink:href="#SC2" height="26.769" x="-111.784" y="-119"></use><use xlink:href="#SC2" height="70" x="-35" y="-135.588"></use></g></svg>`
  // html = html.replace('class="card"', '');
  if (!shadow) html = html.replace(/class=["']card["']\s?/, '');
  html = html.replace('fill="white" stroke="black"', `fill="${bg}" stroke="${border}" stroke-width="${borderthickness}"`);
  //console.log('html', html);

  let div = mDom(null, { h, w }, { html });
  let res = { key: ckey, w, h, svgUp: html, faceUp: true, div, bg, border, borderthickness, shadow, color };
  //if (isdef(ov)) res.ov = ov;
  return res;
}
function uiTypeCommissionCard(ckey) {
  return uiTypeCard52(ckey, 60, 'lightyellow', 'navy', 2, true, 'blue');
}
function uiTypeRumorCard(ckey) {
  return uiTypeCard52(ckey, 60, 'lightgoldenrodyellow', 'green', 2, true, 'green');
}




function iDiv(i) {
  return valf(i.div, isdef(i.live) ? i.live.div : i.ui, i);
} //isdef(i.div) ? i.div : i; }

function tableLayoutMR(dParent, m = 7, r = 1) {
  let ui = UI; ui.players = {};
  clearElement(dParent);
  let bg = 'transparent';
  let [dMiddle, dRechts] = [ui.dMiddle, ui.dRechts] = mColFlex(dParent, [m, r], [bg, bg]);
  mCenterFlex(dMiddle, false);
  let dOben = ui.dOben = mDiv(dMiddle, { w: '100%', display: 'block' }, 'dOben');
  let dSelections = ui.dSelections = mDiv(dOben, {}, 'dSelections');
  for (let i = 0; i <= 5; i++) { ui[`dSelections${i}`] = mDiv(dSelections, {}, `dSelections${i}`); }
  let dActions = ui.dActions = mDiv(dOben, { w: '100%' });
  for (let i = 0; i <= 5; i++) { ui[`dActions${i}`] = mDiv(dActions, { w: '100%' }, `dActions${i}`); }
  ui.dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow', hpadding: 12, box: true }, 'dError');
  let dSubmitOrRestart = ui.dSubmitOrRestart = mDiv(dOben, { w: '100%' });
  let dOpenTable = ui.dOpenTable = mDiv(dMiddle, { w: '100%', padding: 10 }); mFlexWrap(dOpenTable);// mLinebreak(d_table);
  return [dOben, dOpenTable, dMiddle, dRechts];
}


function hToggleClassMenu(ev) {
  let elem = findAncestorWith(ev.target, { attribute: 'menu' });
  if (mHasClass(elem, 'active')) return [elem, elem];
  let menu = elem.getAttribute('menu');
  let others = mBy(`[menu='${menu}']`, 'query').filter(x => x != elem);
  let prev = null;
  for (const o of others) {
    assertion(o != elem);
    if (mHasClass(o, 'active')) { prev = o; mClassRemove(o, 'active'); }
  }
  mClass(elem, 'active');
  return [prev, elem];
}


async function switchToMenu(evOrMenu) {
  if (isdef(DA.menu)) pollOff();
  const ev = isDict(evOrMenu) ? evOrMenu : { target: getElementWithAttribute('key', isString(evOrMenu) ? evOrMenu : DA.menu || localStorage.getItem('menu') || 'games') };
  const [prevElem, elem] = hToggleClassMenu(ev);
  const menu = elem.getAttribute('key');
  assertion(menu, 'CATASTROPHIC FAILURE!!!');
  DA.menu = menu;
  localStorage.setItem('menu', menu);
  await updateMain(true);
}




//#region clear codeall
function clearBodyDiv(styles = {}, opts = {}) { document.body.innerHTML = ''; return mDom(document.body, styles, opts) }
function clearBodyReset100(styles = {}, opts = {}) {
  let body = document.body;
  body.setAttribute('style', '');
  body.innerHTML = '';
  copyKeys({ w: '100vw', h: '100vh', position: 'relative' }, styles)
  let d = mDom(document.body, styles, opts)
  return d;
}
function clearCell(cell) { mClear(cell); mStyle(cell, { opacity: 0 }); }
function clearDiv(dParent, styles = {}, opts = {}) {
  if (nundef(dParent)) dParent = document.body;
  addKeys({ className: 'h100', hline: 0 }, styles);
  addKeys({ html: '&nbsp;' }, opts);
  dParent.innerHTML = '';
  return mDom(dParent, styles, opts);
}
function clearElement(elem) {
  if (isString(elem)) elem = document.getElementById(elem);
  if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
  while (elem.firstChild) {
    $(elem.firstChild).remove();
  }
  return elem;
}
function clearEvents() {
  for (const k in TO) { clearTimeout(TO[k]); TO[k] = null; }
  for (const k in ANIM) { if (isdef(ANIM[k])) ANIM[k].cancel(); ANIM[k] = null; }
}
function clearFleetingMessage() {
  if (isdef(dFleetingMessage)) {
    dFleetingMessage.remove();
    dFleetingMessage = null;
    clearTimeout(TOFleetingMessage);
  }
}
function clearFlex(styles = {}) {
  let dp = clearBodyDiv({ bg: 'white', hmin: '100vh', padding: 0 });
  addKeys({ gap: 10, padding: 10 }, styles)
  let d = mDom(dp, styles); mFlexWrap(d);
  return d;
}
function clearMain() {
  clearTimeouts();
  clearEvents();
  staticTitle();
  mClear('dMain');
  mClear('dTitle');
  clearMessage();
  invalidateTables()
}
function clearMessage(remove = false) { if (remove) mRemove('dMessage'); else mStyle('dMessage', { h: 0 }, { html: '' }); }
function clearParent(ev) { mClear(ev.target.parentNode); }
function clearPlayers() {
  for (const item of DA.allPlayers) {
    if (item.isSelected && !is_loggedin(item.uname)) {
      style_not_playing(item, '', DA.playerlist);
    }
  }
  assertion(!isEmpty(DA.playerlist), "uname removed from playerlist!!!!!!!!!!!!!!!")
  DA.lastName = DA.playerlist[0].uname;
}
function clearStatus() { clearFleetingMessage(); }
function clearTable() {
  clearElement('dTable');
  clearElement('dHistory');
  show_title();
  clearElement('dMessage');
  clearElement('dInstruction');
  clearElement('dTitleRight');
  hide('bPauseContinue');
}
function clearTimeouts() {
  onclick = null;
  mTimerStop();
  clearTimeout(TOMain);
  clearTimeout(TOFleetingMessage);
  clearTimeout(TOTrial);
  if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
function clearZones() {
  for (const k in Zones) {
    clearElement(Zones[k].dData);
  }
}
function clear_quick_buttons() {
  if (isdef(DA.bQuick)) { DA.bQuick.remove(); delete DA.bQuick; }
}
function clear_selection() {
  let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
  if (nundef(Z.A) || isEmpty(A.selected)) return;
  let selitems = A.selected.map(x => A.items[x]);
  for (const item of selitems) { ari_make_unselected(item); }
  A.selected = [];
}
function clear_status() { if (nundef(mBy('dStatus'))) return; clearTimeout(TO.fleeting); mRemove("dStatus"); }
function clear_timeouts() {
  for (const k in TO) clearTimeout(TO[k]);
  stop_simple_timer();
}
function clear_title() { mClear('dTitleMiddle'); mClear('dTitleLeft'); mClear('dTitleRight'); }
function clear_transaction() { DA.simulate = false; DA.transactionlist = []; }
//#endregion

//#region clear codefun + clear_screen
function clear_screen() { mShieldsOff(); clear_status(); clear_title(); for (const ch of arrChildren('dScreen')) mClear(ch); mClassRemove('dTexture', 'wood'); mStyle(document.body, { bg: 'white', fg: 'black' }); }
function miniClearMain() {
  clearTimeouts();
  clearEvents();
  clearMessage(true);
  staticTitle();
  mClear('dTitle');
  mClear('dHidden');
  mClear('dInstruction')
}
function clearBodyDiv(styles = {}, opts = {}) { document.body.innerHTML = ''; return mDom(document.body, styles, opts) }
function clearBodyReset100(styles = {}, opts = {}) {
  let body = document.body;
  body.setAttribute('style', '');
  body.innerHTML = '';
  copyKeys({ w: '100vw', h: '100vh', position: 'relative' }, styles)
  let d = mDom(document.body, styles, opts)
  return d;
}
function clearCell(cell) { mClear(cell); mStyle(cell, { opacity: 0 }); }
function clearDiv(dParent, styles = {}, opts = {}) {
  if (nundef(dParent)) dParent = document.body;
  addKeys({ className: 'h100', hline: 0 }, styles);
  addKeys({ html: '&nbsp;' }, opts);
  dParent.innerHTML = '';
  return mDom(dParent, styles, opts);
}
function clearElement(elem) {
  if (isString(elem)) elem = document.getElementById(elem);
  if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
  while (elem.firstChild) {
    $(elem.firstChild).remove();
  }
  return elem;
}
function clearEvents() {
  for (const k in TO) { clearTimeout(TO[k]); TO[k] = null; }
  for (const k in ANIM) { if (isdef(ANIM[k])) ANIM[k].cancel(); ANIM[k] = null; }
}
function clearFleetingMessage() {
  if (isdef(dFleetingMessage)) { dFleetingMessage.remove(); dFleetingMessage = null; }
}
function clearFlex(styles = {}) {
  let dp = clearBodyDiv({ bg: 'white', hmin: '100vh', padding: 0 });
  addKeys({ gap: 10, padding: 10 }, styles)
  let d = mDom(dp, styles); mFlexWrap(d);
  return d;
}
function clearMain() {
  clearTimeouts();
  clearEvents();
  staticTitle();
  mClear('dMain');
  mClear('dTitle');
  clearMessage();
  invalidateTables()
}
function clearMessage(remove = false) { if (remove) mRemove('dMessage'); else mStyle('dMessage', { h: 0 }, { html: '' }); }
function clearParent(ev) { mClear(ev.target.parentNode); }
function clearTimeouts() {
  onclick = null;
  mTimerStop();
  clearTimeout(TOMain);
  clearTimeout(TOFleetingMessage);
  clearTimeout(TOTrial);
  if (isdef(TOList)) { for (const k in TOList) { TOList[k].map(x => clearTimeout(x)); } }
}
function clearZones() {
  for (const k in Zones) {
    clearElement(Zones[k].dData);
  }
}
//#endregion

function onclick_home() { stopgame(); show_home_logo(); return; start_with_assets(); }


function initUI() {
  mClear('dPage');
  let x = mLayoutTLM('dPage', {}, { wcol: 0, registerDivs: true, shade: false });//assertion(false,'THE END')
  //console.log('x', x);assertion(false, '* THE END *');

  let d = mBy('dTop'); mStyle(d, { box: true });
  mStyle('dMain', { box: true, overy: 'scroll' }); //,{className:'wood'});

  for (const id1 of ['dMenu', 'dTest', 'dHidden', 'dExtra']) {
    mDom(d, { display: 'flex', justifyContent: 'space-between', box: true }, { id: id1 });
    for (const id2 of ['Left', 'Middle', 'Right']) {
      let id = id1 + id2;
      mDom(id1, { align: 'center', box: true }, { id });
    }
  }

  mStyle('dMenu', { bg: '#ffffffbd' });
  mStyle('dMenuLeft', { display: 'flex', gap: 4, padding: '5px 10px', box: true }, { className: 'button_container' });
  mStyle('dMenuRight', { display: 'flex', justify: 'space-evenly', alignItems: 'center', box: true }, {});

  d = mBy('dMenuLeft'); //mClass(d, 'button_container'); //mFlex(d); // mStyle(d, { display: 'flex', vStretch: true, gap: 10, padding: 4, box: true }); //, box:true, vStretch:true, hCenter: true, padding: 10, gap: 10 }) //mClass(d,'flex')
  let bstyle = {};
  show_home_logo(d);
  mDom(d, bstyle, { tag: 'button', html: 'Games', onclick: switchToMenu, menu: 'top', key: 'games' });
  mDom(d, bstyle, { tag: 'button', html: 'Table', onclick: switchToMenu, menu: 'top', key: 'table' });
  mDom(d, bstyle, { tag: 'button', html: 'Settings', onclick: switchToMenu, menu: 'top', key: 'settings' });

}
function ariStats(me, table) {
  let fen = table.fen;
  let ui = {};
  let [sz, bg, fg, cimgborder] = [50, '#00000050', 'white', 'white']; //return {dTable}
  statsInit(me, table, { sz, bg, fg, cimgborder, className: 'flexCol' });
  let herald = fen.heraldorder[0]; //console.log('herald', herald);

  for (const plname in table.players) {
    let pl = table.players[plname];
    let d = mBy('dStat_' + plname);
    let item = ui[plname] = { div: d, plname };
    //let item = player_stat_items[plname];	let d = iDiv(item); 
    mCenterFlex(d); mLinebreak(d); mStyle(d, { position: 'relative' })
    if (exp_church(table.options)) {
      if (isdef(pl.tithes)) {
        statsCount('cross', pl.tithes.val, d);

      }
    }
    let dCoin = statsCount('coin', pl.coins, d);
    item.dCoin = dCoin.firstChild;
    item.dAmount = dCoin.children[1];

    let list = pl.hand.concat(pl.stall);
    let list_luxury = list.filter(x => x[2] == 'l');
    statsCount('pinching_hand', list.length, d);
    let d1 = statsCount('crown', list_luxury.length, d);
    mStyle(d1.firstChild, { fg: 'gold', fz: 20 })

    if (!isEmpty(table.players[plname].stall) && fen.stage >= 5 && fen.stage <= 6) {
      statsCount('shinto shrine', !fen.actionsCompleted.includes(plname) || fen.stage < 6 ? calc_stall_value(fen, plname) : '_', d);
    }
    statsCount('star', plname == U.name || isdef(fen.winners) ? ari_calc_real_vps(table, plname) : ari_calc_fictive_vps(table, plname), d);

    if (plname == herald) {
      //showHourglass(plname, d1, 20, { left: -4, top: 4 });
      let x = mKey('scroll', d, { fg: 'gold', fz: 24, padding: 4 });
      mStyle(x, { position: 'absolute', top: 0, right: 0 });
    }
  }
  return ui;
}

async function gtShow() {
  if (!DA.tid) { await switchToMenu('games'); showMessage('table missing!!!', 4000); return; }
  let table = T = DAGetTable(DA.tid); //console.log(table)
  F = T.fen;
  // F.players = T.players;
  // F.plorder = T.plorder;
  // F.turn = T.turn;
  // Serverdata = M;
  let me = UGetName();
  assertion(me == U.name);
  let func = DA.funcs[table.game](); //console.log('!!!!');
  let ui = func.present(me, table);
  // console.log('gtShow', ui);
  mFall('dTable', 400)
  if (table.status == 'over') {
    showGameover(table);
  } else if (table.status == 'started' && table.turn.includes(me)) {

    A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: M.config.autosubmit };
    //copyKeys(jsCopy(Z.fen), Z);
    //copyKeys(UI, Z);

    await func.activate(me, table, ui);
  }
}



async function updateUI() {
  miniClearMain(); mClear('dMain');
  //console.log('updateUI', DA.menu)
  switch (DA.menu) {
    case 'table': await gtShow(); pollOn(); break;
    case 'settings': showSettings(); pollOff(); break;
    case 'games':
    default: showGamesAndTables(); pollOn(); break;
  }
}



function get_user_pic(uname, sz = 50, border = 'solid medium white') {
  console.log('get_user_pic', uname, sz, border);
  let html = get_user_pic_html(uname, sz, border);
  return mCreateFrom(html);
}
function showUser(dParent, name, func) {
  let d = mDom(dParent, { align: 'center', padding: 2, cursor: 'pointer', border: `transparent` });
  let img = showUserImage(name, d, 40);
  let label = mDom(d, { matop: -4, fz: 12, fg: 'black', hline: 12 }, { html: name });
  d.setAttribute('username', name);
  if (isdef(func)) d.onclick = func;
  return d;
}
function showUserImage(uname, d, sz = 40) {
  let u = MGetUser(uname);
  let key = u.imgKey;
  let src = MGetUserImageSource(uname);
  if (nundef(src)) {
    key = 'unknown_user'; src = MGetUserImageSource(key);
  }
  let img = mDom(d, { h: sz, w: sz, round: true, border: `${u.color} 3px solid` }, { tag: 'img', src });
  return img;
}


function showUserNameInCorner(bg) {
  let username = U.name;
  let d = mBy('dMenuRight'); //41px button:33px
  mClear(d);
  let sz = 24; let h = sz + 6;
  let src = MGetUserImageSource(U.name);
  if (nundef(bg)) bg = colorFrom(U.color);
  fg = colorIdealText(bg);
  let d1 = mDom(d, { bg, fg, display: 'flex', alignItems: 'center', gap: 10 }, { className: 'buttonstyle' }); // { bg, fg, display: 'flex', rounding: 2, alignItems: 'center', gap: 10, margin: 0, pah: 12 });
  let w = 2;
  let style = {
    round: true,
    // margin: 20,
    w: sz,
    h: sz,
    // fit:'cover',
    //fit: 'fill',
    //display: 'block',
    outline: `${w}px solid ${bg}`,
    'outline-offset': `-1px`,
    // boxShadow: 'inset 2 2 2 3px green',
    // overflow:

  };
  //style = {w:100,h:100,fit:'fill',margin:10,'box-shadow':shadow};
  let img = mDom(d, style, { tag: 'img', src });
  //let img = mDom(d1, { fit:'fill',padding: 0, margin: 0, h: sz, w: sz, round: true, outline: `3px red ` }, { tag: 'img', src });
  let text = mDom(d1, { fg, bg }, { tag: 'button', html: capitalize(username) });
  mDom(d, { maright: 10 }, { tag: 'button', html: '...' });
  let flexStyle = { cursor: 'pointer', display: 'flex', 'flex-direction': 'row', alignItems: 'center', gap: 10, wrap: 'nowrap' };
  mStyle(d, flexStyle, { onclick: onclickMoreUsers });

}
function get_screen_distance(child, newParent) {
  child = toElem(child);
  newParent = toElem(newParent);
  let rChild = child.getBoundingClientRect();
  let rNewParent = newParent.getBoundingClientRect();
  return [rNewParent.left - rChild.left + 50, rNewParent.top - rChild.top];
}

function mShrinkTranslate(img, dTarget, scale, ms = 800, callback) {
  let [dx, dy] = get_screen_distance(img, dTarget);
  //console.log('onclickTranslate', { dx, dy, scale });
  // img.animate(
  //   [
  //     { transform: 'translate(0, 0)' },
  //     { transform: `translate(${dx}px, ${dy}px) scale(${scale})` }
  //   ],
  //   {
  //     duration: 400,
  //     easing: 'ease-out',
  //     fill: 'forwards'
  //   }
  // );

  mAnimate(img, 'transform', [`translateX(${dx}px) translateY(${dy}px) scale(${scale})`], callback, ms, 'ease');
}

async function onclickMoreUsers() {
  let animation = 'diamond-in-center .5s ease-in-out';
  let dPopup = mDom('dPage', { animation, position: 'absolute', top: 0, left: 0, w: '100vw', h: '100vh', z: 10000, bg: 'rgba(0,0,0,0.5)' }, { className: 'flexCS' });
  let dParent = mDom(dPopup, { hmin: 200, wmax: 700, gap: 10, w: '70%', rounding: 20, matop: '10%', patop: 20, bg: 'white' }, { className: 'flexCC' });
  for (const name in M.users) {

    showUser(dParent, name, async (ev) => {
      ev.stopPropagation();
      //es ist ein img
      let img = ev.target;//.firstChild;
      //console.log('ev.target', ev.target, img,mBy('dMenuRight'));
      mShrinkTranslate(img, mBy('dMenuRight'), .75, 700, async () => {
        dPopup.remove();
        switchToUser(name);
      });
      // mShrinkTranslate(img, .75, 'dMenuRight', 1000, async () => {
      //   dPopup.remove();
      //   switchToUser(name);

      // });
    });
  }
  let dinp = mDom(dParent, { fz: 20, maleft: 12, bg: 'lightgray', fg: 'black', border: '1px solid dimgray', align: 'center', w: 120, rounding: 8 }, { tag: 'input', type: 'text', placeholder: '<new user>' });
  dinp.onchange = async ev => {
    let uname = ev.target.value.trim();
    //console.log('ev.target', ev.target);
    if (isEmpty(uname) || !isAlphaNum(uname)) {
      console.log(`cannot switch to user ${uname}!`);
      return;
    }
    dPopup.remove();
    await switchToUser(uname);
  };
  dinp.onclick = ev => {
    ev.stopPropagation();
  };
  dPopup.onclick = ev => { evNoBubble(ev); mRemove(dPopup) };
}

function dictPlus(target, source) {
  let result = addKeys(source, target);
  return result;
}

function faButton(dParent, key, styles = {}, opts = {}) {

  //console.log('key', key)
  key = key.replace('_', '-'); //console.log(key);

  let cl = `fa-solid fa-` + key;
  if (opts.ani) cl += ' fa-' + opts.ani; //' '+opts.ani.map(x=>'fa-'+x).join(' ');
  let st = dictPlus(styles, { color: 'red', cursor: 'pointer', fz: 22 });
  //console.log(st)
  return mDom(dParent, st, { tag: 'i', className: cl }); //`fa-solid fa-${key} fa-beat` });

  //mDom(dParent,{},{html:'<i class="fa-solid fa-angles-up"></i>'});return;

  let o = M.fa[key];
  if (nundef(o)) {
    console.warn(`no superdi entry for key ${key}`);
    return;
  }
  //console.log(o)
  let html = `<div class='faButtonOuter'><div class='faButtonInner'>&#x${o.fa6};</div></div>`;
  let d = mDom(dParent, styles, { html, ...opts });
  mClass(d, 'faButtonOuter');
  mClass(d.firstChild, 'faButtonInner');
  d.onclick = ev => {
    evNoBubble(ev);
    if (isdef(opts.onclick)) opts.onclick(ev);
  }
  mStyle(d, { cursor: 'pointer', display: 'flex', placeContent: 'center' });
  mStyle(d.firstChild, { fontSize: '24px', lineHeight: '24px', fontFamily: 'fa6', background: 'rgba(0,0,0,0)', color: 'lightgray' });
  return d;
}


function onclick_user(uname) {
  U = M.users[uname];
  localStorage.setItem('uname', U.name);
  DA.secretuser = U.name;
  let elem = firstCond(arrChildren('dUsers'), x => x.getAttribute('username') == uname);
  let img = elem.children[0];
  mShrinkTranslate(img, .75, 'dAdminRight', 400, show_username);
  mFadeClear('dUsers', 300);
}

function mShrink(d, x = .75, y = .75, ms = 800, callback = null) {
  let anim = toElem(d).animate([{ transform: `scale(${1},${1})` }, { transform: `scale(${x},${y})` },], { fill: 'both', duration: ms, easing: 'ease' });
  anim.onfinish = callback;
}
function mShrinkUp(d, x = .75, y = 0, ms = 800, callback = null) {
  let anim = toElem(d).animate([{ transform: `scale(${1},${1})`, opacity: 1 }, { transform: `scale(${x},${y})`, opacity: 0 },], { fill: 'none', duration: ms, easing: 'ease' });
  anim.onfinish = mClear(d);
}

function showMessage(msg, ms = 5000, callback = null) {
  clearTimeout(TO.message);
  let d = mPopup(null, { transform: 'unset' }, { id: 'dMessage', html: msg });
  TO.message = mFadeRemove(d, ms);
  if (callback) TO.message = setTimeout(() => { if (callback) callback(); }, ms + 2)
}
function mLayout(dParent, rowlist, colt, rowt, styles = {}, opts = {}) {
  dParent = toElem(dParent);
  mStyle(dParent, styles);
  rowlist = rowlist.map(x => x.replaceAll('@', valf(opts.suffix, ''))); //console.log(rowlist);
  rowt = rowt.replaceAll('@', valf(opts.hrow, 30));
  colt = colt.replaceAll('@', valf(opts.wcol, 30));
  let areas = `'${rowlist.join("' '")}'`; //console.log(rowlist,areas);
  let newNames = mAreas(dParent, areas, colt, rowt); //console.log('newNames',newNames);
  if (opts.registerDivs) {
    if (nundef(DA.divNames)) DA.divNames = [];
    DA.divNames = Array.from(new Set(DA.divNames.concat(newNames)));
  }
  if (opts.shade && nundef(styles.bgSrc)) { mShade(newNames, 2, 1); }
  return newNames.map(x => mBy(x));
}
function arrNoDuplicates(arr) { return [...new Set(arr)]; }
function toWords(s, allow_ = false) {
  let arr = allow_ ? s.split(/[\W]+/) : s.split(/[\W|_]+/);
  return arr.filter(x => !isEmpty(x));
}

function show_home_logo(d) {
  if (nundef(d)) { mClear('dAdminLeft'); d = mBy('dAdminLeft'); }
  let logo = mKey('castle', d, { cursor: 'pointer', fz: 24, box: true }); let bg = colorLight();
}


function mAreas(dParent, areas, gridCols, gridRows) {
  mClear(dParent); mStyle(dParent, { padding: 0 })
  let names = arrNoDuplicates(toWords(areas)); //console.log({ names });
  let dg = mDom(dParent, { w100: true, h100: true, box: true, padding: 0, margin: 0 });
  for (const name of names) {
    let d = mDom(dg, { family: 'opensans', margin: 0, padding: 0, box: true }, { id: name });
    d.style.gridArea = name;
  }
  mStyle(dg, { display: 'grid', gridCols, gridRows });
  dg.style.gridTemplateAreas = areas;
  return names;
}


async function switchToUser(uname) {
  pollOff();
  if (!isEmpty(uname)) uname = normalizeString(uname);
  if (isEmpty(uname)) uname = localStorage.getItem('username') || 'guest';
  if (nundef(M.users)) M.users = await loadStaticYaml('y/users.yaml');
  //for (const k in M.users) { delete M.users.fg; } await postUsers(); return;
  let userdata = MGetUser(uname);
  if (!userdata) {
    let imgKey = isdef(M.imgByKey[uname]) ? uname : 'unknown_user';
    let color = colorFrom(rChoose(M.colorNames));
    let name = uname;
    M.users[uname] = userdata = { name, color, imgKey };
    console.log('new user created', userdata);
    console.log('M.users', M.users);
    await postUsers();
  }
  U = userdata;
  DA.tid = localStorage.getItem('tid');
  showUserNameInCorner(U.color);

  localStorage.setItem('username', uname);

  //setTheme(U);
  updateUI();
}

function stdPresentBGATable(me, table, ms, className = 'wood') {
  setCssVar('--velvet-color', MGetUserColor(me));
  if (isdef(ms)) pollChangeInterval(ms);
  let dm = mDom('dMain', { hmin: 700, align: 'center', box: true }, { className });
  mDom(dm, flexSpaceBetween(), { id: 'dTitle' });
  mDom(dm, flexCenterCenter(), { id: 'dInstruction' });
  mDom(dm, flexCenterCenter(), { id: 'dStats' });
  mDom(dm, flexCenterCenter(), { id: 'dTable' });
  return mBy('dTable');
}
function mPopup(dParent, styles = {}, opts = {}) {
  //if (nundef(dParent)) 
  dParent = document.body;
  if (isdef(mBy(opts.id))) mRemove(opts.id);
  mIfNotRelative(dParent);
  let animation = 'diamond-in-center .5s ease-in-out';
  addKeys({
    animation,
    bg: 'white',
    fg: 'black',
    padding: '4px 10px',//20,
    rounding: 0,// 12,
    margin: 0,//
    top: 40,
    left: 0,//50%',
    //transform: 'translateX(-50%)',
    position: 'absolute',
    z: 10000,
    w: '100%',//'fit-content',      // Grow horizontally to fit content
    h: 'auto',             // Grow vertically to fit content
    //wmax: '90vw',          // Safety: don't get wider than the screen
    //hmax: '80vh',          // Safety: don't get taller than the screen
  }, styles);
  let popup = mDom(dParent, styles, opts);
  mButtonX(popup);
  return popup;
}
function mPopupSimple(d) {
  const popup = document.createElement('div');
  popup.innerHTML = '✨ I am a centered popup! ✨';
  popup.style.position = 'absolute';
  popup.style.background = 'white';
  popup.style.border = '1px solid #ccc';
  popup.style.borderRadius = '8px';
  popup.style.padding = '20px';
  popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  popup.style.zIndex = '1000'; // Ensure it appears on top
  popup.style.transform = 'translate(-50%, -50%)';
  const rect = d.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2 + window.scrollX;
  const centerY = rect.top + rect.height / 2 + window.scrollY;
  popup.style.left = `${centerX}px`;
  popup.style.top = `${centerY}px`;
  document.body.appendChild(popup);
  return popup;
}

async function loadAssetsStaticPreload() {
  M = await loadStaticYaml('y/m.yaml');
  M.config = await loadStaticYaml('y/config.yaml');
  //M.users = await loadStaticYaml('y/users.yaml');
  M.emo = await loadStaticYaml('y/diemo.yaml');
  M.emogroup = await loadStaticYaml('y/digroup.yaml');
  M.emokeys = Object.keys(M.emo).sort();
  M.fa = await loadStaticYaml('y/fadi.yaml');
  M.fakeys = Object.keys(M.fa).sort();
}
async function loadAssetsStatic() {
  if (nundef(M)) M = {};
  M.superdi = await loadStaticYaml('y/superdi_plus.yaml');
  M.details = await loadStaticYaml('y/details.yaml');
  M.text = await loadStaticText('y/words.yaml');
  M.words = M.text.split('\n').map(x => x.trim());
  M.kqj = await loadStaticYaml('y/kqj.yaml');
  M.wordsAnagram = M.words.filter(x => x.length > 3 && x.length < 11 && x[0].toUpperCase() != x[0]);
  loadColors();
  loadSuperdiAssets();
  if (nundef(M.asciiCapitals)) {
    let except = ["Noum", 'Bras', 'Reykja'];
    M.asciiCapitals = M.capital.filter(x => !x.includes('.') && !except.some(y => x.startsWith(y)));
  }
  M.c52Symbols = await loadStaticYaml('assets/c52symbols.yaml');
}
