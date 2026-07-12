
function spotit_present(dt, me, table, ui) {
  let dTable = stdPresentBGATable(me, table, 1000, 'velvet');
  showTitleGame(me, table);
  stdStatsScore(me, table, { allowUserSwitch: true });
  // return {};
  let fen = table.fen;

  mLinebreak(dt, 10);
  ui.cards = [];
  for (let i = 0; i < table.options.num_cards; i++) {

    console.log(fen.stage);
    if (fen.stage === 'init') {
      let card = cRound(dt, { w: 300, h: 300, margin:20 });
      card.faceUp = true;
      console.log(card);
      face_down(card, GREEN, 'food');
      continue;
    }

    let els = fen.items[i].zipped;
    console.log(els);

    let syms = spotitSyms(els);
    let dCard = arrangeShapesEvenlyCircle(300, syms, dt, gap = 10);
    let uiCard = jsCopy(fen.items[i]);
    uiCard.div = dCard;
    ui.cards.push(uiCard);
  }
  return { dTable, ui };
}
function __spotit_present(dt, me, table, ui) {
  let fen = table.fen;
  let stage = fen.stage;
  let uplayer = me;

  mLinebreak(dt, 10);
  console.log("fen.items:", fen.items);

  // 1. Copy the card items list from the incoming table state data
  let items = Items = jsCopy(fen.items);
  let i = 0;
  for (const item of items) {
    item.index = i;
    i++;
  }

  fen.cards = [];

  // 2. Loop through and draw each card directly onto the dt element using our updated spacing physics
  for (const item of items) {
    // Pass item, target parent 'dt', clean layout objects, and the interaction function
    let card = spotit_card(item, dt, { margin: 20 }, spotit_interact);
    fen.cards.push(card);

    // 3. Handle initial hidden states cleanly
    if (stage === 'init') {
      face_down(card, GREEN, 'food');
    }
  }

  mLinebreak(dt, 10);
  console.log('fen cards:', fen.cards);
}

function spotit_card(info, dParent, cardStyles, onClickSym) {
  // 1. Establish strict card dimensions
  const containerSize = 300;
  const radius = containerSize / 2;
  const gap = 12; // Enforce strict minimal separation margin between icons

  // Clean up styles to pass to the frame builder
  copyKeys({ w: containerSize, h: containerSize }, cardStyles);
  let card = cRound(dParent, cardStyles, info.id);
  addKeys(info, card);
  card.faceUp = true;

  // Clear out default inner container content if any exists
  let dInner = iDiv(card);
  clearElement(dInner);
  mStyle(dInner, { position: 'relative', w: containerSize, h: containerSize, round: true, overflow: 'hidden' });

  const numRects = card.keys.length;
  if (numRects === 0) return card;

  // =========================================================================
  // DYNAMIC AREA RESIZING ENGINE
  // =========================================================================
  const totalCircleArea = Math.PI * Math.pow(radius, 2);
  const targetElementArea = totalCircleArea * 0.42; // Harmonious 42% coverage footprint

  // Re-map elements list with baseline unscaled bounding limits (base size 50)
  const baseSize = 50;
  let currentTotalArea = card.scales.reduce((sum, sc) => sum + Math.pow(baseSize * sc, 2), 0);
  let idealScaleFactor = Math.sqrt(targetElementArea / currentTotalArea);

  const maxAllowedDimension = containerSize / (Math.sqrt(numRects) * 0.95);

  const rectangles = card.keys.map((key, idx) => {
    let scale = card.scales[idx];
    let w = baseSize * scale * idealScaleFactor;
    let h = baseSize * scale * idealScaleFactor;

    // Safety size cap constraints
    if (w > maxAllowedDimension || h > maxAllowedDimension) {
      const capRatio = maxAllowedDimension / Math.max(w, h);
      w *= capRatio;
      h *= capRatio;
    }
    return { key, w, h };
  });

  // =========================================================================
  // FERMAT SPIRAL TARGET POSITION LAYER
  // =========================================================================
  const targetSlots = [];
  const goldenAngle = 137.5 * (Math.PI / 180);
  const borderPadding = containerSize * 0.04;
  const usableRadius = radius - borderPadding;

  for (let i = 0; i < numRects; i++) {
    const rFraction = numRects === 1 ? 0 : Math.sqrt((i + 0.5) / numRects);
    const currentRadius = rFraction * usableRadius;
    const currentAngle = i * goldenAngle;

    targetSlots.push({
      x: radius + currentRadius * Math.cos(currentAngle),
      y: radius + currentRadius * Math.sin(currentAngle)
    });
  }

  // Sort largest to smallest for layout optimization
  const sortedRects = [...rectangles].sort((a, b) => (b.w * b.h) - (a.w * a.h));
  const finalizedNodes = [];

  // Rotation-Aware Minkowski Buffer Intersection Check
  function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2, requiredGap) {
    const boxOverlap = !(x1 + w1 / 2 + requiredGap < x2 - w2 / 2 ||
      x1 - w1 / 2 - requiredGap > x2 + w2 / 2 ||
      y1 + h1 / 2 + requiredGap < y2 - h2 / 2 ||
      y1 - h1 / 2 - requiredGap > y2 + h2 / 2);

    if (!boxOverlap) return false;

    const r1 = Math.hypot(w1 / 2, h1 / 2);
    const r2 = Math.hypot(w2 / 2, h2 / 2);
    const distance = Math.hypot(x2 - x1, y2 - y1);

    return distance < (r1 + r2 + requiredGap);
  }

  // Map elements to geometry nodes
  sortedRects.forEach((rectData) => {
    let placed = false;

    targetSlots.sort((a, b) => {
      const distA = Math.hypot(a.x - radius, a.y - radius);
      const distB = Math.hypot(b.x - radius, b.y - radius);
      return distA - distB;
    });

    for (let s = 0; s < targetSlots.length; s++) {
      const slot = targetSlots[s];
      let localRadius = 0;
      const maxLocalShift = containerSize * 0.35;

      while (localRadius < maxLocalShift && !placed) {
        const microSteps = localRadius === 0 ? 1 : 20;
        for (let a = 0; a < microSteps; a++) {
          const microAngle = (a / microSteps) * Math.PI * 2;
          const testX = slot.x + localRadius * Math.cos(microAngle);
          const testY = slot.y + localRadius * Math.sin(microAngle);

          const centerDist = Math.hypot(testX - radius, testY - radius);
          const itemRadius = Math.min(rectData.w, rectData.h) / 2;
          if (centerDist + itemRadius > radius - 4) continue;

          let collision = false;
          for (let node of finalizedNodes) {
            if (checkCollision(testX, testY, rectData.w, rectData.h, node.x, node.y, node.w, node.h, gap)) {
              collision = true;
              break;
            }
          }

          if (!collision) {
            finalizedNodes.push({
              x: testX,
              y: testY,
              w: rectData.w,
              h: rectData.h,
              key: rectData.key,
            });
            targetSlots.splice(s, 1);
            placed = true;
            break;
          }
        }
        localRadius += 1;
      }
      if (placed) break;
    }

    // Trapped element edge fallback positioning
    if (!placed && targetSlots.length > 0) {
      const fallbackSlot = targetSlots.shift();
      finalizedNodes.push({
        x: fallbackSlot.x,
        y: fallbackSlot.y,
        w: rectData.w * 0.7,
        h: rectData.h * 0.7,
        key: rectData.key,
      });
    }
  });

  // =========================================================================
  // RENDERING VIA SYSTEM mKey FUNCTIONS
  // =========================================================================
  finalizedNodes.forEach((node) => {
    const leftPos = node.x - (node.w / 2);
    const topPos = node.y - (node.h / 2);

    // Select a slight random twist angle style
    const rotationAngle = rChoose([0, 5, 10, 15, 345, 350, 355]);

    // Build absolute properties layout parameters 
    let symStyles = {
      position: 'absolute',
      left: leftPos,
      top: topPos,
      w: node.w,
      h: node.h,
      fz: node.h * 0.8,
      bg: 'transparent',
      rounding: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      margin: 'auto',
      transform: `rotate(${rotationAngle}deg)`
    };

    // Draw using core framework framework symbols method
    let sym = mKey(node.key, dInner, symStyles, { key: node.key });

    // Enforce interaction handles required by spotit_present click events
    card.live[node.key] = sym;
    sym.setAttribute('key', node.key);
    sym.onclick = ev => onClickSym(ev, node.key);
  });

  return card;
}
function get_texture(name) { return `url(../assets/texrepeat/${name})`; }
function get_timestamp() { return Date.now(); }

//********************************* BLUFF ******************************** */


function bidSequence(startingBid, ralist, wildcards, n) {
  const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
  const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
  const rankOrder = '3456789TJQKA';

  let sequence = [];
  let currentLastBid = [...startingBid];

  /* 1. COMPUTE PHYSICAL TABLE ASSETS (FACTUAL LIMITS) */
  let realHoldings = {};
  rankOrder.split('').forEach(sym => {
    let match = ralist.find(x => x.rank === sym);
    let naturalCount = match ? (Number(match.value) || 0) : 0;
    realHoldings[sym] = naturalCount + Number(wildcards);
  });

  /* 2. GENERATE THE SEQUENCE STEP BY STEP */
  for (let step = 0; step < n; step++) {
    let oldCount1 = Number(currentLastBid[0]) || 0;
    let oldRank1 = torank[currentLastBid[1]] || '_';
    let oldCount2 = currentLastBid[2] === '_' ? 0 : (Number(currentLastBid[2]) || 0);
    let oldRank2 = torank[currentLastBid[3]] || '_';

    let foundNextBid = null;
    let candidates = [];

    // Helper to evaluate if a combination passes engine mechanics
    function isValidHigher(testBidArr) {
      try {
        if (typeof is_bid_higher_than === 'function') {
          return is_bid_higher_than(
            [Number(testBidArr[0]) || 0, torank[testBidArr[1]], testBidArr[2] === '_' ? 0 : Number(testBidArr[2]), torank[testBidArr[3]]],
            [oldCount1, oldRank1, oldCount2, oldRank2]
          );
        }
      } catch (e) { }
      return false;
    }

    /* Search through expanding volume tiers up to a safe structural ceiling */
    for (let totalVolume = 1; totalVolume <= 20; totalVolume++) {

      // Look for Single Bids [Volume, Rank, '_', '_']
      rankOrder.split('').forEach(r1 => {
        if (realHoldings[r1] < totalVolume) return;

        let testSingle = [totalVolume, toword[r1], '_', '_'];
        if (isValidHigher(testSingle)) {
          candidates.push({
            bid: testSingle,
            volume: totalVolume,
            rankIdx1: rankOrder.indexOf(r1),
            rankIdx2: -1,
            isSplit: false
          });
        }
      });

      // Look for Split Combo Bids [Count1, Rank1, Count2, Rank2]
      rankOrder.split('').forEach(r1 => {
        rankOrder.split('').forEach(r2 => {
          if (r1 === r2) return;

          for (let c1 = 1; c1 < totalVolume; c1++) {
            let c2 = totalVolume - c1;

            if (realHoldings[r1] >= c1 && realHoldings[r2] >= c2) {
              let testSplit = [c1, toword[r1], c2, toword[r2]];
              if (isValidHigher(testSplit)) {
                candidates.push({
                  bid: testSplit,
                  volume: totalVolume,
                  rankIdx1: rankOrder.indexOf(r1),
                  rankIdx2: rankOrder.indexOf(r2),
                  isSplit: true
                });
              }
            }
          }
        });
      });

      /* If we found valid steps inside this volume tier, sort and extract the absolute minimum */
      if (candidates.length > 0) {
        candidates.sort((a, b) => {
          if (a.volume !== b.volume) return a.volume - b.volume;
          if (a.isSplit !== b.isSplit) return a.isSplit ? 1 : -1; // Single bids prioritized over split combos
          if (a.rankIdx1 !== b.rankIdx1) return a.rankIdx1 - b.rankIdx1; // Lowest rank first
          return a.rankIdx2 - b.rankIdx2;
        });

        foundNextBid = candidates[0].bid;
        break; // Stop evaluating higher volumes for this sequence step
      }
    }

    /* Emergency Fallback: If assets are entirely exhausted, forcefully step up the volume layout */
    if (!foundNextBid) {
      let oldVolume = oldCount1 + oldCount2;
      let sortedByStrength = ralist.slice().sort((a, b) => b.value - a.value);
      let topHoldingRank = sortedByStrength[0] ? sortedByStrength[0].rank : 'A';
      foundNextBid = [oldVolume + 1, toword[topHoldingRank], '_', '_'];
    }

    // Push the clean step into our history and anchor the next loop on it
    sequence.push(foundNextBid);
    currentLastBid = [...foundNextBid];
  }

  return sequence;
}
function findMinimalCorrectHigherBid(ralist, wildcards, lastbid = null) {
  const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
  const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
  const rankOrder = '3456789TJQKA';

  /* --- PART 1: COMPUTE REAL LIFE ACTUAL HOLDINGS (FACTUAL MARGINS) --- */
  let realHoldings = {};
  rankOrder.split('').forEach(sym => {
    let match = ralist.find(x => x.rank === sym);
    let naturalCount = match ? (Number(match.value) || 0) : 0;
    realHoldings[sym] = naturalCount + Number(wildcards);
  });

  /* Find the lowest card physically present anywhere on the layout */
  let activeRanks = ralist.filter(x => (Number(x.value) || 0) > 0);
  let smallestPresentRankItem = activeRanks.length > 0
    ? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
    : ralist.slice().sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0];

  let absoluteMinimalBid = [
    1,
    toword[smallestPresentRankItem.rank] || '_',
    '_',
    '_'
  ];

  /* --- PART 2: INITIAL BID CASE --- */
  if (lastbid === null || lastbid[0] === 0 || lastbid[0] === '_') {
    return absoluteMinimalBid;
  }

  /* --- PART 3: PARSE LAST BID --- */
  let oldCount1 = Number(lastbid[0]) || 0;
  let oldRank1 = torank[lastbid[1]] || '_';
  let oldCount2 = lastbid[2] === '_' ? 0 : (Number(lastbid[2]) || 0);
  let oldRank2 = torank[lastbid[3]] || '_';

  function isValidHigher(testBidArr) {
    try {
      if (typeof is_bid_higher_than === 'function') {
        return is_bid_higher_than(
          [Number(testBidArr[0]) || 0, torank[testBidArr[1]], testBidArr[2] === '_' ? 0 : Number(testBidArr[2]), torank[testBidArr[3]]],
          [oldCount1, oldRank1, oldCount2, oldRank2]
        );
      }
    } catch (e) { }
    return false;
  }

  /* --- PART 4: EVALUATE CANDIDATES BY PRIORITY STEPS --- */
  let candidates = [];

  /* Loop up through every single realistic volume capacity bracket */
  for (let totalVolume = 1; totalVolume <= 10; totalVolume++) {

    // Evaluate Single Bids [Count, Rank, '_', '_']
    rankOrder.split('').forEach(r1 => {
      if (realHoldings[r1] < totalVolume) return; // Must possess enough cards to make it a correct bid

      let testSingle = [totalVolume, toword[r1], '_', '_'];
      if (isValidHigher(testSingle)) {
        candidates.push({
          bid: testSingle,
          volume: totalVolume,
          rankIdx1: rankOrder.indexOf(r1),
          rankIdx2: -1,
          isSplit: false
        });
      }
    });

    // Evaluate Split Combo Bids [Count1, Rank1, Count2, Rank2]
    rankOrder.split('').forEach(r1 => {
      rankOrder.split('').forEach(r2 => {
        if (r1 === r2) return; // Ranks must stay distinct

        /* Check every logical split partitioning slice that adds up to totalVolume */
        for (let c1 = 1; c1 < totalVolume; c1++) {
          let c2 = totalVolume - c1;

          // Double check that our physical holdings support this exact sub-combination split
          if (realHoldings[r1] >= c1 && realHoldings[r2] >= c2) {
            let testSplit = [c1, toword[r1], c2, toword[r2]];

            if (isValidHigher(testSplit)) {
              candidates.push({
                bid: testSplit,
                volume: totalVolume,
                rankIdx1: rankOrder.indexOf(r1),
                rankIdx2: rankOrder.indexOf(r2),
                isSplit: true
              });
            }
          }
        }
      });
    });

    /* --- PART 5: CHOOSE THE STRICtest MINIMAL TRIPPING BID --- */
    /* If we found valid correct options inside this volume tier, stop immediately!
       This ensures raising the total count allows a complete reset of the rank array pool. */
    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        /* Tie-breaker rules: 
           1. Prioritize lower total card volume first.
           2. Single bids take natural precedence over split combos at equivalent volume tiers.
           3. Lowest primary rank position wins.
           4. Lowest secondary rank index breaks remaining ties. */
        if (a.volume !== b.volume) return a.volume - b.volume;
        if (a.isSplit !== b.isSplit) return a.isSplit ? 1 : -1;
        if (a.rankIdx1 !== b.rankIdx1) return a.rankIdx1 - b.rankIdx1;
        return a.rankIdx2 - b.rankIdx2;
      });

      return candidates[0].bid;
    }
  }

  /* --- PART 6: EMERGENCY FALLBACK --- */
  let sortedRanksByStrength = ralist.slice().sort((a, b) => b.value - a.value);
  let topHoldingRank = sortedRanksByStrength[0] ? sortedRanksByStrength[0].rank : 'A';
  let oldVolume = oldCount1 + oldCount2;

  return [
    oldVolume + 1,
    toword[topHoldingRank],
    '_',
    '_'
  ];
}

async function bluffActivate(me, table, ui) {


  console.log('HAAAAAAAAAAAAAAAAAA')

  let fen = table.fen;
  let stage = fen.stage;
  let dt = ui.dTable;
  let myturn = table.turn.includes(me);
  let botturn = table.players[table.turn[0]].playmode == 'bot';

  aggregate_player_hands_by_rank(table);
  console.log(fen.akku); //return;

  //assertion(table.turn.includes(me), `BLUFF: activate inactive player ${me} ${table.turn}!!!`);
  if (stage == 1) {
    if (botturn) {
      await mSleep(8000);
      await processStage1(table);
      return;
    }
    mDom(dt, {}, { html: 'Next Round', tag: 'button', onclick: async () => await processStage1(table) });
    return;
  }

  if (myturn) {
    //show lastbid
    if (isdef(fen.lastbid)) {
      let dc1 = mDom(dt, { w: 480, alignItems: 'center' });
      makeGridColumns(dc1, '120px 1fr 120px');
      mDom(dc1, { align: 'right', maright: 10 }, { html: '<b>Current bid:</b>' });
      mDom(dc1, { bg: '#ffffffA0', fg: 'red', padding: 4 }, { className: 'selectbutton', html: bid_to_string(fen.lastbid) });
      ui.bGehtHoch = mButton('geht hoch!', async () => await gehtHoch(me, table, ui), dc1, {}, ['selectbutton', 'enabled']);
      mLinebreak(dt, 10);
    } else {
      mDom(dt, { fz: 18 }, { html: 'You are the first to bid!' });
      mLinebreak(dt, 10);
    }

    //show current bid and keyboard
    let bid = fen.oldbid = valf(fen.lastbid, ['_', '_', '_', '_']);
    fen.newbid = jsCopy(bid);
    let dc = ui.dPanelContainer = mDom(dt, { w: 480 });
    makeGridColumns(dc, '120px 1fr 120px');
    mDom(dc, { align: 'right', maright: 10 }, { html: '<b>Your bid:</b>' });
    ui.panel = mDom(dc, { bg: 'white' }, { className: 'selectbutton' });
    ui.panelItems = [];
    bid.forEach((b, i) => {
      let dw = mDom(ui.panel, { pah: 4, display: 'inline', fz: 18, weight: 'bold', fg: 'red' }, { id: `dbid_${i}`, html: b });
      dw.onclick = () => selectText(dw);
      ui.panelItems.push({ div: dw, index: i, initial: b, state: 'unselected' })
    });
    ui.bBid = mButton('BID', async () => await bluffBid(me, table, ui), dc, {}, ['selectbutton', 'enabled']);
    mLinebreak(dt, 20);
    let sz = 50;
    let n = bid[0] == '_' ? 1 : Number(bid[0]);
    let arrs = [arrRange(n, n + 5), toLetters('3456789TJQKA'), arrRange(0, 5), toLetters('3456789TJQKA')];
    let dTasten = ui.dTasten = mDiv(dt, { gap: 8 });
    let divs = [d1, d2, d3, d4] = mColFlex(dTasten, [1, 2, 1, 2]);
    for (let i = 0; i < 4; i++) {
      let d = divs[i];
      mStyle(d, { bg: i % 2 == 0 ? '#dda15e' : '#bb9457', padding: 6, rounding: 8 });
      ui[`dn${i + 1}`] = create_bluff_input1(me, table, ui, d, arrs[i], i % 2 ? 2 : 1, sz, i);
      d.onmouseenter = () => iHigh(ui.panelItems[i]); d.onmouseleave = () => iUnhigh(ui.panelItems[i]);
    }
  }

  //calc possible legal bids
  let { ralist, wildcards } = createRankList([table.turn], table);
  ralist = ralist.filter(x => x.value >= 1);
  let lastbid = fen.lastbid;
  let bids = []
  if (nundef(lastbid)) {
    //create a random bid
    let b = createRealisticRandomStartingBid(table, ralist, wildcards);
    let p = calculateBidProbability(ralist, wildcards, b);
    if (TESTING) {
      //conslog('starting bid', jsCopy(b), `probability: ${p}`);
    }
    if (p < .2 && b[0] > 2) b[0] -= 2;
    else if (p < .5 && b[0] > 1) b[0]--;
    if (TESTING) {
      p = calculateBidProbability(ralist, wildcards, b);
      //conslog('final bid', b, `probability: ${p}`);
    }
    bids.push(b);
  } else {
    let b = generateComplexHigherBid(ralist, wildcards, lastbid);
    if (TESTING) {
      p = calculateBidProbability(ralist, wildcards, b);
      //conslog('bid', b, `probability: ${p}`);
    }
    let lastBitCorrect = calc_bid_minus_cards(table, lastbid) <= 0;
    let bCorrect = calc_bid_minus_cards(table, b) <= 0;
    if (lastBitCorrect && bCorrect) {
      bids.push(b);
    } else if (!lastBitCorrect && !bCorrect) {
      bids.push('gehtHoch');
    } else { bids.push(b); bids.push('gehtHoch'); }
  }

  // let x = findMinimalCorrectHigherBid(ralist, wildcards, lastbid);

  x = lowestPossibleBid(ralist); 
  bids=[x];
  let n=30;
  for(let i=0;i<n;i++){
    x=nextHigherBid(ralist,x);
    bids.push(x);
  }
  // let y = nextHigherBid(ralist,x);
  // let z = nextHigherBid(ralist,y); //secondLowestBid(ralist);
  //let z = thirdLowestBid(ralist);

  // bids = [x, y, z];// seq;


  let seq = bidSequence(x, ralist, wildcards, 5);
  //bids.push(findMinimalCorrectHigherBid(ralist, wildcards, lastbid));
  conslog(`___ wildcards: ${wildcards}`, ralist, bids)

  mClear(dt);
  let cards = fen.akku;
  cards = cSort(cards, null, '23456789TJQKA');
  //let dcards = mDom(dt, { align: 'center', display: 'flex' });
  ui.cards = cards.map(x => uiTypeCard52(x, 150));
  cSplay(ui.cards, dt, 'right');







  //show bid buttons
  //	if (TESTING && myturn) {
  mLinebreak(dt, 10)
  let db2 = mDom(dt);
  for (const k in bids) {
    let bid = bids[k];
    let bBid = mDom(db2, { margin: 10 }, {
      tag: 'button', html: isList(bid) ? bid_to_string(bid) : bid,
      onclick: async () => {
        if (isList(bid)) {
          table.fen.newbid = bid;
          TO.hallo = await bluffBid(me, table, ui)
        } else if (bid == 'gehtHoch') {
          await gehtHoch(me, table, ui);
        }
      }
    });
  }
  //	}

  return;

  //botmove
  if (botturn) {
    TO.botsleep = await mSleep(3000);
    let bot = table.turn[0];
    let b = rChoose(bids);
    if (b == 'gehtHoch') {
      // ui.bGehtHoch.click();
      await processGehtHoch(bot, table);
    } else {
      // showBidInPanel(b, ui)
      table.fen.oldbid = valf(lastbid, ['_', '_', '_', '_']);
      table.fen.newbid = b;
      // stdEvalShield();
      let moveSent = await processBid(bot, table);
      // TO.botsleep = await mSleep(3000);
      // ui.bBid.click();
    }
    await updateMain(true);
    DA.isProcessingMove = false;
  }
}



function showBidInPanel(bid, ui) {
  /* Ensure the UI panel tracking array exists and has elements to update */
  if (!ui || !ui.panelItems || ui.panelItems.length < 4) {
    console.error("UI panel items are not properly initialized.");
    return;
  }

  bid.forEach((b, i) => {
    let item = ui.panelItems[i];
    if (item && item.div) {
      /* Update the actual text on the screen */
      item.div.innerHTML = b;
      
      /* Reset the internal tracker states to stay in sync with the new values */
      item.initial = b;
      item.state = 'unselected';
    }
  });
}
function bot_clairvoyant(list, wildcards=0, lastbid=null) {
	let reduced_list = list.filter(x => x.value > 0); 
	reduced_list = getPrioritizedSublist(reduced_list);
	if (!lastbid) reduced_list=reduced_list.filter(x => x.mine);
	let res = reduced_list.length >= 2 ? rChoose(reduced_list, 2) : [reduced_list[0], { value: 0, rank: '_' }];
	let max = res[0].value >= res[1].value ? res[0] : res[1]; let min = res[0].value < res[1].value ? res[0] : res[1];
	let b = [max.value+wildcards, max.rank, min.value, min.rank];
	if (isdef(lastbid)) {
		let [n1, r1, n2, r2] = bluff_convert2ranks(lastbid);
		if (!is_bid_higher_than(bluff_convert2words(b), lastbid)) {
			return [null, 'gehtHoch'];
		}
	}
	return [bluff_convert2words(b), 'bid'];
}


function swapGridItems(item1, item2) {
  // Get current positions
  const pos1 = {
    row: item1.style.gridRow,
    col: item1.style.gridColumn,
    area: item1.style.gridArea
  };
  const pos2 = {
    row: item2.style.gridRow,
    col: item2.style.gridColumn,
    area: item2.style.gridArea
  };

  // Swap using your mStyle utility
  mStyle(item1, {
    gridRow: pos2.row,
    gridColumn: pos2.col,
    gridArea: pos2.area
  });

  mStyle(item2, {
    gridRow: pos1.row,
    gridColumn: pos1.col,
    gridArea: pos1.area
  });
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
function mPopupSimple(d, styles) {
  mIfNotRelative(d);
  //top should be the div for the player next to me
  //let d=
  // let popup =  mDom(d,{transform:'translateX(-50%)',top:0,align:'center',rounding:10,border:'4px solid grey',padding:10,z:10000,position:'absolute',w:'80%',h:'60%',bg:'white',fz:20},{id:'dPopup'});
  let popup = mDom(d, { left: 20, align: 'center', rounding: 10, border: '4px solid grey', padding: 10, z: 10000, position: 'absolute', w: '80%', h: '60%', bg: 'white', fz: 20 }, { id: 'dPopup' });
  popup.innerHTML = '✨ I am a centered popup! ✨';
  popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.8)';
  // const rect = getRect(d); //d.getBoundingClientRect();
  // console.log(rect)
  // const centerX = rect.l + rect.w / 2 + window.scrollX;
  // const centerY = rect.t + rect.h / 2 + window.scrollY;
  // popup.style.left = `${centerX}px`;
  // popup.style.top = `${centerY}px`;
  //d.appendChild(popup);
  mStyle(popup, styles);
  return popup;
}

function mDraggable(item) {
  let d = iDiv(item);
  d.draggable = true;
  d.ondragstart = drag;
}
function mDroppable(item, handler, dragoverhandler) {
  function allowDrop(ev) { ev.preventDefault(); }
  let d = iDiv(item);
  d.ondragover = isdef(dragoverhandler) ? dragoverhandler : allowDrop;
  d.ondrop = handler;
}
function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); }

function connectRumorToPlayer(ev) {
  console.log(ev, arguments)
}
function ariSelectRumorCard(cItem) {
  toggleItemSelection(cItem);

}

//#region elim
function MGet() { return lookup(M, [...arguments]); }
function MGetGame(gamename) { return M.config.games[gamename]; }
function MGetGameColor(gamename) { return MGetGame(gamename).color; }
function MGetGameFriendly(gamename) { return MGetGame(gamename).friendly; }
function MGetGameOptions(gamename) { return MGetGame(gamename).options; }
function MGetGamePlayerOptions(gamename) { return MGetGame(gamename).ploptions; }
function MGetGamePlayerOptionsAsDict(gamename) { return valf(MGetGamePlayerOptions(gamename), {}); }
function MGetGameProp(prop) { return MGetGame(T.game)[prop]; }
function MGetTables() { return DA.tableDict; }
function MGetUser(uname) { return M.users[uname]; }
function MGetUserColor(uname) { return MGetUser(uname).color; }
function MGetUserImageKey(username) {
  let u = MGetUser(username);
  let key = u.imgKey;
  let m = M.superdi[key];
  if (nundef(m)) {
    key = 'unknown_user';
    m = M.superdi[key];
  }
  return m;
}
function MGetUserImageSource(username) {
  let u = MGetUser(username);
  let key = u.imgKey;
  return `../assets/img/users/${key}.jpg`;
}
function MGetUserOptionsForGame(name, gamename) { return lookup(M.users, [name, 'games', gamename]); }
function MTGetGameProp(prop) { return MGetGame(T.game)[prop]; }
var MyEasing = 'ease'; //cubic-bezier(1,-0.03,.86,.68)';
function TGetGameOption(prop) { return lookup(T, ['options', prop]); }
function UGetName() { return U.name; }
function allPlToPlayer(name) {
  let allPl = DA.allPlayers[name];
  return jsCopyExceptKeys(allPl, ['div', 'isSelected']);
}
function button96() {
  function setup(table) {
    let fen = {};
    for (const name in table.players) {
      let pl = table.players[name];
      pl.score = 0;
    }
    fen.cards = [1, 2, 3];
    fen.deck = range(4, table.options.numCards);
    table.plorder = jsCopy(table.playerNames);
    table.turn = jsCopy(table.playerNames);
    return fen;
  }
  function prepLayout(table) { presentStandardRoundTable(table); }
  async function stats(table) {
    let [me, players] = [getUname(), table.players];
    let style = { patop: 8, mabottom: 20, wmin: 80, bg: 'beige', fg: 'contrast' };
    let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'rowflex', style)
    for (const plName in players) {
      let pl = players[plName];
      let item = player_stat_items[plName];
      if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
      let d = iDiv(item);
      statsCount('star', pl.score, d); //, {}, {id:`stat_${plName}_score`});
    }
  }
  function present(table) {
    let fen = table.fen;
    mStyle('dTable', { padding: 25, w: 400, h: 400 });
    let d = mDom('dTable', { gap: 10, padding: 0 }); //mCenterFlex(d);
    let items = [];
    for (const card of fen.cards) {
      let item = cNumber(card);
      mAppend(d, iDiv(item));
      items.push(item);
    }
    return items;
  }
  async function activate(table, items) {
    await showInstructionStandard(table, 'must click a card'); //browser tab and instruction if any
    if (!isMyTurn(table)) { return; }
    for (const item of items) {
      let d = iDiv(item);
      mStyle(d, { cursor: 'pointer' });
      d.onclick = ev => onclickCard(table, item, items);
    }
    if (isEmpty(table.fen.cards)) return gameoverScore(table);
    if (amIHuman(table) && table.options.gamemode == 'multi') return;
    let name = amIHuman(table) && table.options.gamemode == 'solo' ? someOtherPlayerName(table) : getUname();
    if (nundef(name)) return;
    await botMove(name, table, items);
  }
  async function botMove(name, table, items) {
    let ms = rChoose(range(2000, 5000));
    TO.bot = setTimeout(async () => {
      let item = rChoose(items);
      toggleItemSelection(item);
      TO.bot1 = setTimeout(async () => await evalMove(name, table, item.key), 500);
    }, rNumber(ms, ms + 2000));
  }
  async function onclickCard(table, item, items) {
    toggleItemSelection(item);
    try { await mSleep(200); } catch (err) { return; }
    await evalMove(getUname(), table, item.key);
  }
  async function evalMove(name, table, key) {
    clearEvents();
    mShield('dTable', { bg: 'transparent' });
    let id = table.id;
    let step = table.step;
    let best = arrMinMax(table.fen.cards).min;
    let succeed = key == best;
    if (succeed) {
      table.players[name].score += 1;
      let fen = table.fen;
      let newCards = deckDeal(fen.deck, 1);
      if (newCards.length > 0) arrReplace1(fen.cards, key, newCards[0]); else removeInPlace(fen.cards, key);
    } else {
      table.players[name].score -= 1;
    }
    lookupAddToList(table, ['moves'], { step, name, move: key, change: succeed ? '+1' : '-1', score: table.players[name].score });
    let o = { id, name, step, table };
    if (succeed) o.stepIfValid = step + 1;
    let res = await mPostRoute('table', o);
  }
  return { prepLayout, setup, present, stats, activate };
}
function createPlayerOptionsPopup(dParent, player, handler) {
  let bg = MGetUserColor(player);
  let d1 = mDom(dParent, {
    bg: colorLight(bg, 50),
    border: `solid 2px ${bg}`,
    rounding: 6,
    display: 'inline-block',
    hPadding: 3
  }, { id: 'dPlayerOptions' });
  mDom(d1, {}, { html: player });
  let d = mDom(d1);
  mCenterFlex(d);
  mButtonX(d1, handler, 'tr', 20, 0, 'dimgray');
  return [d1, d];
}
async function dbUpdateGameTableAll(id, data, action, playerId) {
  // We include playerId at the top level so PHP can access $input['player_id']
  //console.log(id, jsCopy(data), action, playerId)
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "update_row_all",
      table: "gametable",
      id: id,
      player_id: playerId,
      data: { ...data, action: action }
    })
  });
  return await res.json();
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
async function loadAssets() {
  M = await mGetYaml('../y/m.yaml');
  console.log('HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
  M.superdi = await mGetYaml('../y/superdi.yaml');
  M.details = await mGetYaml('../y/details.yaml');
  let [di, byColl, byFriendly, byCat, allImages] = [M.superdi, {}, {}, {}, {}];
  for (const k in di) {
    let o = di[k];
    for (const cat of o.cats) lookupAddIfToList(byCat, [cat], k);
    for (const coll of o.colls) lookupAddIfToList(byColl, [coll], k);
    lookupAddIfToList(byFriendly, [o.friendly], k)
    if (isdef(o.img)) {
      let fname = stringAfterLast(o.img, '/')
      allImages[fname] = { fname, path: o.img, k };
    }
  }
  M.allImages = allImages;
  M.byCat = byCat;
  M.byCollection = byColl;
  M.byFriendly = byFriendly;
  M.categories = Object.keys(byCat); M.categories.sort();
  M.collections = Object.keys(byColl); M.collections.sort();
  M.names = Object.keys(byFriendly); M.names.sort();
  M.dicolor = await mGetYaml(`../assets/dicolor.yaml`);
  [M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
}
async function saveDataFromPlayerOptionsUI(gamename) {
  let id = 'dPlayerOptions';
  let lastAllPl = DA.lastAllPlayerItem; //console.log('lastAllPl', lastAllPl)
  let dold = mBy(id);
  if (isdef(dold)) { await saveAndUpdatePlayerOptions(lastAllPl, gamename); dold.remove(); }
}
async function saveAndUpdatePlayerOptions(allPl, gamename) {
  let name = allPl.name;
  let poss = jsCopy(valf(M.config.games[gamename].ploptions, {})); delete poss.playmode;
  if (nundef(poss)) return;
  let opts = {};
  for (const p in poss) { allPl[p] = getRadioValue(p); if (p != 'playmode') opts[p] = allPl[p]; }
  let id = 'dPlayerOptions'; mRemoveIfExists(id); //dont need UI anymore
  let oldOpts = valf(lookup(M.users, [name, 'games', gamename]), {});
  let changed = false;
  for (const p in poss) {
    if (p == 'playmode') continue;
    if (oldOpts[p] != opts[p]) {
      changed = true;
      break;
    }
  }
  if (changed) {
    let games = valf(M.users[name].games, {});
    games[gamename] = opts;
    let res = await postUsers();
  }
}
function stdPresentVelvetTable(me, table, ms) {
  if (isdef(ms)) pollChangeInterval(ms);
  presentVelvetTable();
  showTitleGame(me, table);
  let dTable = mBy('dTable'); mCenterFlex(dTable);
  return dTable;
}
async function updateDetails(di, key) {
  let res = await mPostRoute('postUpdateDetails', { key, di });
  await loadAssets();
}
async function updateSuperdi(di, key) {
  let res = await mPostRoute('postUpdateSuperdi', { di });
  await loadAssets();
}

//#endregion

