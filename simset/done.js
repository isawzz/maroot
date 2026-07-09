
function spotitSetupCards(table) {
  let options = table.options;
  //let pl = table.players[me];
  let num_cards = valf(options.num_cards, 2);
  let num_symbols = valf(options.num_symbols, 7);

  //num_symbols = options.adaptive == 'yes' ? cal_num_syms_adaptive(me,table) : options.num_symbols;


  let szCard = valf(options.szCard, 300); // Base target inner card canvas dimension
  const padding = 10; // Explicit visual cushion layout padding buffer
  const radius = szCard / 2;

  // let vocab = valf(options.vocab, 'best');
  // let [group, wild] = vocab == 'best' ? ['special', 'best*'] : vocab == 'nature' ? ['special', 'lifeplus'] : vocab == 'object' ? ['special', 'objectplus'] : ['animals_nature', 'anim*'];
  // let list = Object.keys(M.emogroup[group]);
  // let subgroups = matchWildcardArray(wild, list);
  // let keypool = subgroups.map(x => M.emogroup[group][x]).flat();
  let keypool = SpecialKeys;

  let nShared = (num_cards * (num_cards - 1)) / 2;
  let nUnique = num_symbols - num_cards + 1;
  let numKeysNeeded = nShared + num_cards * nUnique;
  //let numExtras = 14-numKeysNeeded; 

  if (keypool.length < numKeysNeeded) {
    console.warn(`Not enough symbols for the required ${numKeysNeeded} unique/shared keys.`);
  }

  let keys = rChoose(keypool, numKeysNeeded);
  arrShuffle(keys);
  let dupls = keys.slice(0, nShared);
  let uniqs = keys.slice(nShared);

  let infos = [];
  for (let i = 0; i < num_cards; i++) {
    let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
    let info = { id: getUID(), shares: {}, keys: keylist, num_syms: num_symbols };
    infos.push(info);
    //console.log(info.keys);
  }

  let iShared = 0;
  for (let i = 0; i < num_cards; i++) {
    for (let j = i + 1; j < num_cards; j++) {
      let c1 = infos[i];
      let c2 = infos[j];
      let dupl = dupls[iShared++];
      c1.keys.push(dupl);
      c1.shares[c2.id] = dupl;
      c2.shares[c1.id] = dupl;
      c2.keys.push(dupl);
    }
  }

  for (const info of infos) {
    shuffle(info.keys);
  }

  for (const info of infos) {
    let n = info.keys.length;
    let arr = arrRepeat([.5, 1, .6, 1, .75], Math.ceil(n / 5));
    arrShuffle(arr);
    info.scales = info.keys.map((x, i) => arr[i]);
  }

  // ENFORCED MINIMUM GAP COLLISION CHECK MATH ENGINE
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

  // =========================================================================
  // GEOMETRIC CALCULATION ENGINE
  // =========================================================================
  for (const info of infos) {
    let zipped = [];
    let numDivs = info.keys.length;
    if (numDivs === 0) {
      info.zipped = zipped;
      continue;
    }

    // 1. Calculate ideal scale factor based on targeted area footprint coverage 
    const totalCircleArea = Math.PI * Math.pow(radius, 2);
    const targetElementArea = totalCircleArea * 0.42;

    // Assume fallback base dimensions are 40x40 scaled by assigned scale value
    let divMetrics = info.keys.map((key, index) => {
      let scale = info.scales[index];
      let baseW = 40 * scale;
      let baseH = 40 * scale;
      return { key, scale, w: baseW, h: baseH, index };
    });

    let currentTotalArea = divMetrics.reduce((sum, d) => sum + (d.w * d.h), 0);
    let idealScaleFactor = Math.sqrt(targetElementArea / currentTotalArea);
    const maxAllowedDimension = szCard / (Math.sqrt(numDivs) * 0.95);

    const scaledDivs = divMetrics.map(d => {
      let w = d.w * idealScaleFactor;
      let h = d.h * idealScaleFactor;
      if (w > maxAllowedDimension || h > maxAllowedDimension) {
        const capRatio = maxAllowedDimension / Math.max(w, h);
        w *= capRatio;
        h *= capRatio;
      }
      return { ...d, w, h };
    });

    // 2. Generate target slots via Fermat's Spiral
    const targetSlots = [];
    const goldenAngle = 137.5 * (Math.PI / 180);
    const borderPadding = szCard * 0.04;
    const usableRadius = radius - borderPadding;

    for (let i = 0; i < numDivs; i++) {
      const rFraction = numDivs === 1 ? 0 : Math.sqrt((i + 0.5) / numDivs);
      const currentRadius = rFraction * usableRadius;
      const currentAngle = i * goldenAngle;

      targetSlots.push({
        x: radius + currentRadius * Math.cos(currentAngle),
        y: radius + currentRadius * Math.sin(currentAngle)
      });
    }

    const sortedDivs = [...scaledDivs].sort((a, b) => (b.w * b.h) - (a.w * a.h));
    const finalizedNodes = [];
    const gap = 10;

    // 3. Match calculated items to coordinates
    sortedDivs.forEach((divData) => {
      let placed = false;

      targetSlots.sort((a, b) => {
        const distA = Math.hypot(a.x - radius, a.y - radius);
        const distB = Math.hypot(b.x - radius, b.y - radius);
        return distA - distB;
      });

      for (let s = 0; s < targetSlots.length; s++) {
        const slot = targetSlots[s];
        let localRadius = 0;
        const maxLocalShift = szCard * 0.35;

        while (localRadius < maxLocalShift && !placed) {
          const microSteps = localRadius === 0 ? 1 : 20;
          for (let a = 0; a < microSteps; a++) {
            const microAngle = (a / microSteps) * Math.PI * 2;
            const testX = slot.x + localRadius * Math.cos(microAngle);
            const testY = slot.y + localRadius * Math.sin(microAngle);

            const centerDist = Math.hypot(testX - radius, testY - radius);
            const itemRadius = Math.min(divData.w, divData.h) / 2;
            if (centerDist + itemRadius > radius - 4) continue;

            let collision = false;
            for (let node of finalizedNodes) {
              if (checkCollision(testX, testY, divData.w, divData.h, node.x, node.y, node.w, node.h, gap)) {
                collision = true;
                break;
              }
            }

            if (!collision) {
              finalizedNodes.push({
                x: testX,
                y: testY,
                w: divData.w,
                h: divData.h,
                key: divData.key,
                scale: divData.scale
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

      // Fallback if space runs out
      if (!placed && targetSlots.length > 0) {
        const fallbackSlot = targetSlots.shift();
        finalizedNodes.push({
          x: fallbackSlot.x,
          y: fallbackSlot.y,
          w: divData.w * 0.7,
          h: divData.h * 0.7,
          key: divData.key,
          scale: divData.scale
        });
      }
    });

    // 4. Map final geometric coordinates into absolute positional properties inside zipped array
    finalizedNodes.forEach((node) => {
      const leftPos = node.x - (node.w / 2) + padding;
      const topPos = node.y - (node.h / 2) + padding;
      const rotationAngle = rChoose ? rChoose([0, 5, 10, 15, 345, 350, 355]) : 0;

      zipped.push({
        key: node.key,
        scale: node.scale,
        w: node.w,
        h: node.h,
        left: leftPos,
        top: topPos,
        angle: rotationAngle
      });
    });

    info.zipped = zipped;
  }

  return [infos, dupls];
}


function plotSymbols(szCard, els, dParent) {
  const padding = 10;

  // 1. Render card parent ring element frame shell
  let container = mDom(dParent, {
    position: 'relative',
    w: szCard + (padding * 2),
    h: szCard + (padding * 2),
    round: true,
    bg: '#f9f9f9',
    overflow: 'hidden',
    border: '2px solid #333',
    display: 'inline-block',
    margin: 10
  });

  // 2. Iterate through elements and inject properties via precalculated info arrays
  let syms = [];
  els.forEach((el) => {
    // Read the geometry precalculated inside your card info map data tree structure
    let leftPos = el.left;
    let topPos = el.top;
    let w = el.w;
    let h = el.h;
    let angle = el.angle || 0;

    let sym = jsCopy(el);

    let item = mKey(el.key, container, {
      position: 'absolute',
      left: leftPos,
      top: topPos,
      w: w,
      h: h,
      sz: w,
      fz: h * 0.8,
      transform: `rotate(${angle}deg)`,
      margin: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });
    sym.div = item;
    container.appendChild(item);
    syms.push(sym);
  });

  return [container, syms];
}
function createKeys(n, group, subgroupRegex) {
  let list = Object.keys(M.emogroup[group]);
  let subgroups = matchWildcardArray(subgroupRegex, list);
  let keypool = subgroups.map(x => M.emogroup[group][x]).flat();
  let keys = rChoose(keypool, n);
  return keys;
}
function getCatKeys(symsObject, cat = 'best100') {
  // 1. Get all main object keys (e.g., 'abacus', 'adhesive bandage')
  const allKeys = Object.keys(symsObject);

  // 2. Filter keys where the 'cats' array exists and includes 'best100'
  return allKeys.filter(key => {
    const symbolData = symsObject[key];
    return symbolData && Array.isArray(symbolData.cats) && symbolData.cats.includes(cat);
  });
}
function getTexture(name, repeat = true) { return `url(../assets/texrepeat/${name})`; }

function matchWildcardArray(pattern, stringArray) {
  // 1. Escape special regex characters except the asterisk '*'
  // 2. Convert '*' to '.*' which means "zero or more of any character" in regex
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/\*/g, '.*');                // Convert wildcard to regex equivalents

  // 3. Wrap with ^ and $ to ensure a full string match (not just a partial substring)
  const regex = new RegExp(`^${regexPattern}$`, 'i'); // 'i' flag makes it case-insensitive

  // 4. Filter the array
  return stringArray.filter(str => regex.test(str));
}
function mGridFlex(dParent, styles = {}, opts = {}) {
  addKeys({ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, styles);
  let d = mDom(dParent, styles, opts);
  return d;
}
function mKey(imgKey, d, styles = {}, opts = {}) {
  //console.log('___',imgKey,opts)
  if (nundef(opts.prefer)) { opts.prefer = 'emoji'; }
  styles = jsCopy(styles);
  if (!isString(imgKey)) { imgKey = imgKey.toString(); opts.prefer = 'plain'; }
  let o = opts.prefer == 'emoji' ? M.emo[imgKey] : imgKey.includes('.') ? { src: imgKey } : opts.prefer == 'plain' ? { plain: imgKey } : lookup(M.superdi, [imgKey]);
  let type = opts.prefer;
  //console.log(o,type)
  let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
  if (nundef(type) && nundef(o[type])) type = types.find(x => isdef(o[x]));
  let d0 = mDom(d, styles, opts);
  let [w, h] = mSizeSuccession(styles, 100);
  if (type.startsWith('ani')) {
    o = M.emo[imgKey];
    if (!isdef(o.ani)) type = 'emoji';
    else {
      let astyles = { display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
      mStyle(d0, astyles);
      let img = mDom(d0, { h, fit: 'contain', cursor: 'pointer', transition: 'all 0.2s ease-in-out' }, { tag: 'img' });
      if (type == 'anihover') {
        let path = img.src = stringBefore(o.ani, '.webp') + '.png';
        img.onmouseenter = () => img.src = o.ani;
        img.onmouseleave = () => img.src = path;
      } else {
        img.src = o.ani;
      }
      if (isdef(opts.label)) {
        let x = mDom(d0, { w: '80%', maleft: '10%', matop: 4 })
        mDom(x, { fz: 18, family: 'opensans', align: 'center' }, { className: 'ellipsis', html: opts.label });
      }
      return d0;
    }
  }
  if (type == 'emoji') {
    //console.log(o,o.emo,o.html)
    let family = styles.family || 'emoNoto';
    let fz = styles.fz || 50;
    let cursor = styles.cursor || 'default';
    let astyles = { hline: 1, cursor, fz, family, display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
    //if (imgKey == 'bicycle') astyles.transform = 'translateY(-20%)';
    mStyle(d0, astyles, { html: o.html });
  } else if (['img', 'src', 'photo'].includes(type)) {
    let szi = isdef(opts.szImage) ? opts.szImage : styles.sz;
    let w1, h1;
    if (szi != h) { w1 = szi; h1 = szi; mFlex(d0, true, 'center'); } else { w1 = w; h1 = h; }
    let astyle = { w: w1, h: h1, fit: styles.fit ? styles.fit : o && o.cats.includes('card') ? 'contain' : 'cover', 'object-position': 'center center' };
    mDom(d0, astyle, { ...opts, tag: 'img', src: o[type], alt: imgKey });
  } else if (type == 'plain') {
    let [family, fz] = [valf(styles.family, 'opensans'), valf(styles.fz, 12)]; //console.log('fz', fz)
    mStyle(d0, { family, fz }, { html: o[type] });
    let x = mDom(d0, { family, fz }, { ...opts, html: o[type] }); //console.log(x)
  } else {
    //console.log(o,o.emo,o.html)
    let family = Families[type] || 'inherit';
    let text = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];
    let fz = styles.fz;
    let astyles = { fz, family, display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
    mStyle(d0, astyles, { html: text });
  }
  if (isdef(opts.label)) {
    let x = mDom(d0, { w: '80%', maleft: '10%', matop: 4 })
    mDom(x, { fz: 18, family: 'opensans', align: 'center' }, { className: 'ellipsis', html: opts.label });
  }
  return d0;
}
function showPics(dParent, keys, scales, numRows, numCols, uniformSize) {
  let gap = 10;

  // 1. Calculate exactly precise structural container measurements derived from the grid inputs
  let containerWidth = numCols * uniformSize + (numCols - 1) * gap + (2 * gap);
  let containerHeight = numRows * uniformSize + (numRows - 1) * gap + (2 * gap);

  // Pagination Controls UI Header Layer
  let dControls = mDom(dParent, { display: 'flex', gap: 20, margin: 10 });
  let btnUp = mDom(dControls, { tag: 'button', html: 'Page Up (▲)', cursor: 'pointer', padding: '5px 15px' });
  let btnDown = mDom(dControls, { tag: 'button', html: 'Page Down (▼)', cursor: 'pointer', padding: '5px 15px' });
  let txtPage = mDom(dControls, { tag: 'span', html: 'Page: 1', 'font-weight': 'bold', 'align-self': 'center' });

  // 2. Setup Main Base Container Box explicitly as a strict CSS Grid matrix
  let d2 = mDom(dParent, {
    bg: 'blue',
    w: containerWidth,
    h: containerHeight,
    box: true,
    padding: gap,
    overflow: 'hidden'
  });

  // Inject structural grid constraints
  d2.style.display = 'grid';
  d2.style.gridTemplateColumns = `repeat(${numCols}, ${uniformSize}px)`;
  d2.style.gridTemplateRows = `repeat(${numRows}, ${uniformSize}px)`;
  d2.style.gap = `${gap}px`;
  d2.style.alignContent = 'start';
  d2.style.justifyContent = 'start';

  let n = keys.length;

  let currentPage = 0;
  let itemsPerPage = numCols * numRows;

  // 3. Render items into cell wrapper bounds
  let renderedElements = [];
  for (let i = 0; i < n; i++) {
    let key = keys[i];
    let scale = scales[i % scales.length];

    // Calculate the size of the emoji icon base bounding box limits
    // Note: We use uniformSize divided by 1.5 to make sure scaled-up icons (1.5x) fit without overflow
    let baseIconSz = uniformSize / 1.5;
    let sz = baseIconSz * scale;
    console.log(sz);
    // Each outer element shell takes exactly 100% of its designated grid track space
    let styles = {
      // bg: 'red', 
      w100: true,
      h100: true,
      box: true,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
    let d0 = mDom(d2, styles, { key });

    let styles2 = { w: sz, h: sz, fz: sz * .8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }
    let d1 = mKey(key, d0, styles2, { key });

    // Drill into the target child node icon element and force absolute alignment clustering
    // let dIcon = d1.firstChild || d1; //console.log(dIcon,dIcon.style)
    // if (dIcon && dIcon.style) {
    //   dIcon.style.width = `${sz}px`;
    //   dIcon.style.height = `${sz}px`;
    //   dIcon.style.fontSize = `${sz * 0.8}px`;
    //   dIcon.style.display = 'flex';
    //   dIcon.style.alignItems = 'center';
    //   dIcon.style.justifyContent = 'center';
    //   dIcon.style.margin = 'auto'; // Locks position right in the core center point
    // }

    renderedElements.push(d0);
  }

  // 4. Clean Chunk Navigation slices Visibility Layer Engine
  function renderCurrentPage() {
    let startIdx = currentPage * itemsPerPage;
    let endIdx = startIdx + itemsPerPage;

    renderedElements.forEach((el, idx) => {
      if (idx >= startIdx && idx < endIdx) {
        el.style.display = 'inline-flex';
      } else {
        el.style.display = 'none';
      }
    });

    txtPage.innerHTML = `Page: ${currentPage + 1} / ${Math.max(1, Math.ceil(n / itemsPerPage))}`;
  }

  function pageUp() {
    if (currentPage > 0) {
      currentPage--;
      renderCurrentPage();
    }
  }

  function pageDown() {
    let maxPage = Math.ceil(n / itemsPerPage) - 1;
    if (currentPage < maxPage) {
      currentPage++;
      renderCurrentPage();
    }
  }

  btnUp.onclick = pageUp;
  btnDown.onclick = pageDown;

  // Key intercept loop binding
  window.onkeydown = function (e) {
    if (e.key === 'PageDown' || e.key === 'ArrowDown' || e.code === 'PageDown') {
      e.preventDefault();
      pageDown();
    } else if (e.key === 'PageUp' || e.key === 'ArrowUp' || e.code === 'PageUp') {
      e.preventDefault();
      pageUp();
    }
  };

  // Immediate layout evaluation initialization
  renderCurrentPage();
}
function spotitSetup(n) {
  let keys = createKeys(n, 'special', 'best*');
  let arr = arrRepeat([.5, 1, .5, 1, .75], Math.ceil(n / 5)); arrShuffle(arr); //console.log(arr);
  let scales = keys.map((x, i) => arr[i]); //rChoose([.5, .75, 1]));
  let els = []; for (let i of range(n)) { els[i] = { key: keys[i], scale: scales[i % 4] }; }
  return els;
}
function spotitCard(dParent, els, szCard = 300) {
  let n = els.length;
  let card = cRound(dParent, { border: 'solid #ccc 3px', w: szCard, h: szCard, margin: 20 });
  let dCard = iDiv(card);

  mStyle(dCard, { padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' });

  let d0 = mDom(dCard, {
    w: '92%',
    h: '92%',
    display: 'flex',
    'flex-direction': 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  });

  let [nth, rows, colarr] = layoutCircle(n); //console.log(colarr)
  let index = 0;

  for (let i of range(rows)) {
    let margin = i == 0 || i == rows - 1 ? 22 : 4;
    if (rows <= 2) margin = 8;

    let dr = mDom(d0, {
      //h: szCard / nth, 
      //flex:1,
      w: `${100 - 2 * margin}%`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center'
    });

    for (let j of range(colarr[i])) {
      let el = els[index++];
      let sz = szCard * el.scale / nth;

      // 1. CRITICAL FIX: Calculate font-size safely.
      // For wide/large elements on row edges (especially the bottom row right edge where the bison sits),
      // we reduce the font-size multiplier slightly (e.g., from 0.8 to 0.7 or 0.65) to keep the glyph bounded.
      let fontMultiplier = 0.8;

      // If this is a problematic edge position or known wide element, pull the font size down
      if (j == colarr[i] - 1 && (i == rows - 1 || i == 0)) {
        fontMultiplier = 0.68; // Gives breathing room at the card's rounded borders
      }

      let fz = sz * fontMultiplier;

      let symStyles = {
        w: sz,
        h: sz,
        sz,
        fz: fz,
        cursor: 'pointer',
        margin: '0 6px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        // 2. Prevent the text/emoji node from rendering outside its box constraints
        overflow: 'hidden',
        textOverflow: 'contain',
        rotate: `${rChoose([0, 10, 20, 30, 320, 350, 320])}deg`,
      };

      let sym = mKey(el.key, dr, symStyles);

      // 3. Fallback check: Ensure the inner symbol scale fits comfortably
      let dIcon = sym.firstChild || sym;
      if (dIcon && dIcon.style) {
        dIcon.style.maxWidth = '100%';
        dIcon.style.maxHeight = '100%';
        //dIcon.style.objectFit = 'contain';
      }
    }



  }
  return card;
}
function spotitSyms(els) {
  let index = 0;
  let n = els.length;
  let szBase = 50;
  let dr = mDom(null, { bg: 'blue' });
  let syms = [];
  for (let j of range(n)) {
    let el = els[index++]; //console.log(el); return;
    let sz = rChoose(n <= 10 ? [35, 50, 75, 100] : [50, 100]); //szBase * els.scale;
    let symStyles = {
      w: sz,
      h: sz,
      sz,
      fz: sz * .8,
      //cursor: 'pointer',
      margin: '0 6px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      // 2. Prevent the text/emoji node from rendering outside its box constraints
      overflow: 'hidden',
      textOverflow: 'contain',
      rotate: `${rChoose([0, 10, 20, 30, 320, 350, 320])}deg`,
    };


    let sym = mKey(el.key, dr, symStyles);

    syms.push(sym);
  }
  return syms;
}


function spotitSetupCardsAdaptive(table) {
  let options = table.options;
  let num_cards = valf(options.num_cards, 2);
  let num_symbols = valf(options.num_symbols, 7);

  num_symbols = options.num_symbols;
  let maxCount = options.max_count;
  let keys = rChoose(SpecialKeys, maxCount * num_cards);
  let nShared = (num_cards * (num_cards - 1)) / 2;
  let nUnique = maxCount - num_cards + 1;

  let dupls = keys.slice(0, nShared);
  let uniqs = keys.slice(nShared);

  let infos = [];
  for (let i = 0; i < num_cards; i++) {
    let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
    let info = { keys: keylist };
    infos.push(info);
  }

  let iShared = 0;
  for (let i = 0; i < num_cards; i++) {
    for (let j = i + 1; j < num_cards; j++) {
      let c1 = infos[i];
      let c2 = infos[j];
      let dupl = dupls[iShared++];
      c1.keys.unshift(dupl);
      c2.keys.unshift(dupl);
    }
  }

  // for (const info of infos) {
  //   shuffle(info.keys);
  // }

  return [infos, dupls];
}

function arrangeWithLayout(container, items, options = {}) {

  /**
   * arrangeOnCircle
   * ----------------------------------------------------------------------------
   * Distributes items inside a circular container without overlap, keeping a
   * boundary padding and even spacing between items. Supports three layout
   * strategies (random, concentric rings, golden-angle spiral) that all share
   * the same collision-resolution engine, so overlap-free placement is
   * guaranteed (items are shrunk as a last resort, never allowed to overlap).
   *
   * @param {HTMLElement} container - parent element (will be set to position:relative)
   * @param {HTMLElement[]} items - DOM elements to place. Each item may already
   *        have a width/height (via style, attribute, or offsetWidth/Height) -
   *        these are read as the item's natural size before any scaling.
   * @param {Object} [options]
   * @param {'random'|'concentric'|'spiral'} [options.mode='concentric'] - candidate slot strategy
   * @param {number} [options.szCard] - diameter of the circle in px. Defaults to
   *        min(container width, container height) from getBoundingClientRect().
   * @param {number} [options.padding=14] - empty margin kept between items and the circle edge
   * @param {number} [options.gap=8] - minimum empty space enforced between any two items
   * @param {number|false} [options.targetCoverage=0.45] - fraction of the circle's
   *        area items should roughly cover in total before collision resolution.
   *        Set to false/0 to keep items at their original natural size.
   * @param {number} [options.minScale=0.5] - lowest scale factor an item may be
   *        shrunk to while resolving an unavoidable collision
   * @param {boolean|[number,number]} [options.rotate=false] - if true, applies a
   *        random rotation in [-12,12]deg to each item; pass [min,max] for a
   *        custom range in degrees
   * @param {number} [options.seed] - optional seed for deterministic random mode
   * @returns {HTMLElement} container
   */
  const numItems = items.length;
  if (numItems === 0) return container;

  const {
    mode = 'concentric',
    padding = 14,
    gap = 8,
    targetCoverage = 0.45,
    minScale = 0.5,
    rotate = false,
    seed
  } = options;

  // ---------------------------------------------------------------------
  // 0. Seedable RNG (mulberry32) so "random" mode can be reproducible
  // ---------------------------------------------------------------------
  function makeRng(s) {
    if (s === undefined || s === null) return Math.random;
    let a = s >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = makeRng(seed);

  // ---------------------------------------------------------------------
  // 1. Container geometry
  // ---------------------------------------------------------------------
  if (typeof mStyle === 'function') {
    mStyle(container, { position: 'relative' });
  } else {
    container.style.position = container.style.position || 'relative';
  }

  const rect = container.getBoundingClientRect();
  const szCard = options.szCard || Math.min(rect.width, rect.height) || 300;
  const radius = szCard / 2;
  const usableRadius = radius - padding;
  if (usableRadius <= 0) return container; // nothing fits

  // ---------------------------------------------------------------------
  // 2. Read natural sizes, then apply an optional global area-based scale
  // ---------------------------------------------------------------------
  let metrics = items.map((el, index) => {
    const w = el.w || parseInt(el.style && el.style.width) || el.offsetWidth || 40;
    const h = el.h || parseInt(el.style && el.style.height) || el.offsetHeight || 40;
    return { el, w, h, index };
  });

  if (targetCoverage) {
    const circleArea = Math.PI * radius * radius;
    const targetArea = circleArea * targetCoverage;
    const currentArea = metrics.reduce((sum, m) => sum + m.w * m.h, 0) || 1;
    const scale = Math.sqrt(targetArea / currentArea);

    // Cap any single item so a handful of huge ones can't dominate the card
    const maxDim = szCard / (Math.sqrt(numItems) * 0.9);

    metrics = metrics.map(m => {
      let w = m.w * scale;
      let h = m.h * scale;
      if (w > maxDim || h > maxDim) {
        const capRatio = maxDim / Math.max(w, h);
        w *= capRatio;
        h *= capRatio;
      }
      return { ...m, w, h };
    });
  }

  const avgDiameter = metrics.reduce((s, m) => s + Math.hypot(m.w, m.h), 0) / numItems;

  // ---------------------------------------------------------------------
  // 3. Candidate slot generators (relative to circle center 0,0)
  // ---------------------------------------------------------------------
  function spiralSlots(n) {
    const goldenAngle = 137.5 * (Math.PI / 180);
    const slots = [];
    for (let i = 0; i < n; i++) {
      const rFrac = n === 1 ? 0 : Math.sqrt((i + 0.5) / n);
      const r = rFrac * usableRadius;
      const a = i * goldenAngle;
      slots.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
    return slots;
  }

  function concentricSlots(n) {
    const slots = [{ x: 0, y: 0 }];
    let ringRadius = 0;
    const ringStep = Math.max(avgDiameter + gap, 24);
    let placed = 1;
    let ringIndex = 0;
    let prevCapacity = 0;
    while (placed < n) {
      ringRadius += ringStep;
      ringIndex++;
      const circumference = 2 * Math.PI * ringRadius;
      const capacity = Math.max(1, Math.min(n - placed, Math.floor(circumference / ringStep)));
      const phase = prevCapacity > 0 ? Math.PI / prevCapacity : 0;
      for (let i = 0; i < capacity; i++) {
        const a = (i / capacity) * Math.PI * 2 + phase;
        slots.push({ x: ringRadius * Math.cos(a), y: ringRadius * Math.sin(a) });
      }
      placed += capacity;
      prevCapacity = capacity;
      if (ringIndex > n + 5) break; // safety valve
    }

    // Rings are generated outward by a fixed step and can overshoot
    // usableRadius for crowded cards. Rescale every slot's radius (keeping
    // its angle) so the outermost ring lands exactly on usableRadius.
    const maxR = slots.reduce((m, s) => Math.max(m, Math.hypot(s.x, s.y)), 0);
    if (maxR > usableRadius) {
      const shrink = usableRadius / maxR;
      for (const s of slots) { s.x *= shrink; s.y *= shrink; }
    }
    return slots;
  }

  function randomSlots(n) {
    // Dart-throwing with a minimum-distance rejection pass for even spread,
    // falling back to plain uniform-disc sampling if budget runs out.
    const slots = [];
    const minDist = Math.max(avgDiameter * 0.6, 1);
    const maxAttempts = n * 60;
    let attempts = 0;
    while (slots.length < n && attempts < maxAttempts) {
      attempts++;
      const r = usableRadius * Math.sqrt(rng());
      const a = rng() * Math.PI * 2;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      let ok = true;
      for (const s of slots) {
        if (Math.hypot(s.x - x, s.y - y) < minDist) { ok = false; break; }
      }
      if (ok) slots.push({ x, y });
    }
    // Top up with plain uniform points if rejection sampling fell short
    while (slots.length < n) {
      const r = usableRadius * Math.sqrt(rng());
      const a = rng() * Math.PI * 2;
      slots.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
    return slots;
  }

  const generators = { spiral: spiralSlots, concentric: concentricSlots, random: randomSlots };
  const buildSlots = generators[mode] || generators.concentric;
  let slots = buildSlots(numItems);

  // Slots closest to center first reads more natural for concentric/spiral;
  // for random mode, shuffle so largest items don't cluster in one spot.
  if (mode === 'random') {
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
  } else {
    slots.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  }

  // ---------------------------------------------------------------------
  // 4. Collision-aware placement engine — O(n log n)
  // ---------------------------------------------------------------------
  // The naive version checked every candidate point against *every already
  // placed item* (O(n) per check) while also trying *every remaining slot*
  // per item (O(n) per item) -> O(n^3) worst case. To bring this down:
  //   1. Items get exactly ONE primary slot each (1:1, assigned by sorted
  //      order via a pointer) instead of an exhaustive search over all
  //      slots -> O(n) total slot assignment instead of O(n^2).
  //   2. Collisions are tested via a uniform spatial hash grid, so each
  //      check only inspects the handful of items in nearby cells instead
  //      of the full placed list -> O(1) amortized per check instead of O(n).
  //   3. The only O(n log n) term left is the up-front sort by item area.
  function collides(x1, y1, w1, h1, x2, y2, w2, h2, requiredGap) {
    const boxOverlap = !(x1 + w1 / 2 + requiredGap < x2 - w2 / 2 ||
      x1 - w1 / 2 - requiredGap > x2 + w2 / 2 ||
      y1 + h1 / 2 + requiredGap < y2 - h2 / 2 ||
      y1 - h1 / 2 - requiredGap > y2 + h2 / 2);
    if (!boxOverlap) return false;
    const r1 = Math.hypot(w1 / 2, h1 / 2);
    const r2 = Math.hypot(w2 / 2, h2 / 2);
    return Math.hypot(x2 - x1, y2 - y1) < (r1 + r2 + requiredGap);
  }

  function fitsInsideCircle(x, y, w, h) {
    const itemRadius = Math.hypot(w / 2, h / 2);
    return Math.hypot(x, y) + itemRadius <= usableRadius;
  }

  // Hard guarantee: pull a point radially inward (same angle) until its
  // bounding radius fits within usableRadius. Applied as a final safety
  // net on every placed item — including fallback placements — so an
  // item can structurally never end up outside the circle, regardless of
  // where its candidate slot came from.
  function clampInsideCircle(x, y, w, h) {
    const itemRadius = Math.hypot(w / 2, h / 2);
    const maxCenterDist = Math.max(0, usableRadius - itemRadius);
    const dist = Math.hypot(x, y);
    if (dist <= maxCenterDist || dist === 0) return { x, y };
    const k = maxCenterDist / dist;
    return { x: x * k, y: y * k };
  }

  // --- spatial hash grid ---------------------------------------------
  // Cell size ~ largest item span + gap, so any possible collision for a
  // point is guaranteed to be found by checking just the 3x3 neighborhood.
  const maxSpan = metrics.reduce((m, it) => Math.max(m, it.w, it.h), 0);
  const cellSize = Math.max(maxSpan + gap, 8);
  const grid = new Map(); // "ix,iy" -> array of placed nodes

  function cellKey(ix, iy) { return ix + ',' + iy; }
  function cellOf(x, y) { return [Math.floor(x / cellSize), Math.floor(y / cellSize)]; }

  function gridInsert(node) {
    const [ix, iy] = cellOf(node.x, node.y);
    const key = cellKey(ix, iy);
    let bucket = grid.get(key);
    if (!bucket) { bucket = []; grid.set(key, bucket); }
    bucket.push(node);
  }

  function gridHasCollision(x, y, w, h) {
    const [ix, iy] = cellOf(x, y);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const bucket = grid.get(cellKey(ix + dx, iy + dy));
        if (!bucket) continue;
        for (const p of bucket) {
          if (collides(x, y, w, h, p.x, p.y, p.w, p.h, gap)) return true;
        }
      }
    }
    return false;
  }
  // ---------------------------------------------------------------------

  const placed = []; // { x, y, w, h, el }

  // Largest items first: they're hardest to fit and should claim good slots.
  // This sort is the only O(n log n) term in the whole engine.
  const ordered = [...metrics].sort((a, b) => (b.w * b.h) - (a.w * a.h));

  // Slots were generated 1:1 with item count, sorted by distance from
  // center (or shuffled for random mode). Walk them with a pointer instead
  // of splicing/searching the array -> O(1) amortized per item.
  let slotPtr = 0;
  function nextSlot() {
    return slotPtr < slots.length ? slots[slotPtr++] : { x: 0, y: 0 };
  }

  ordered.forEach(item => {
    let { w, h } = item;
    let scale = 1;
    let success = false;
    const base = nextSlot();

    while (!success && scale >= minScale - 1e-6) {
      const tw = w * scale, th = h * scale;
      const maxShift = szCard * 0.4;
      let localR = 0;

      // Local spiral search around this item's own slot only (constant
      // number of radius/angle steps, independent of n) using the grid
      // for O(1)-amortized neighbor collision checks.
      while (localR <= maxShift && !success) {
        const steps = localR === 0 ? 1 : 16;
        for (let a = 0; a < steps; a++) {
          const angle = (a / steps) * Math.PI * 2;
          const x = base.x + localR * Math.cos(angle);
          const y = base.y + localR * Math.sin(angle);

          if (!fitsInsideCircle(x, y, tw, th)) continue;
          if (gridHasCollision(x, y, tw, th)) continue;

          // Defense in depth: clamp even though fitsInsideCircle already
          // passed, to absorb any floating-point edge cases at the boundary.
          const c = clampInsideCircle(x, y, tw, th);
          const node = { x: c.x, y: c.y, w: tw, h: th, el: item.el };
          placed.push(node);
          gridInsert(node);
          success = true;
          break;
        }
        localR += Math.max(4, tw * 0.1);
      }

      if (!success) scale -= 0.1; // shrink and retry the local search
    }

    if (!success) {
      // Last resort: drop it at the minimum scale, clamped radially inward
      // so it is GUARANTEED to stay within the circle even if its slot
      // (e.g. an overshot concentric ring, or a collision-forced fallback)
      // would otherwise have placed it outside the boundary.
      const tw = w * minScale, th = h * minScale;
      const c = clampInsideCircle(base.x, base.y, tw, th);
      const node = { x: c.x, y: c.y, w: tw, h: th, el: item.el };
      placed.push(node);
      gridInsert(node);
    }
  });

  // ---------------------------------------------------------------------
  // 5. Apply final styles
  // ---------------------------------------------------------------------
  const [rotMin, rotMax] = Array.isArray(rotate) ? rotate : [-12, 12];

  placed.forEach(node => {
    const left = radius + node.x - node.w / 2;
    const top = radius + node.y - node.h / 2;
    const rotation = rotate ? rotMin + rng() * (rotMax - rotMin) : 0;

    const style = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${node.w}px`,
      height: `${node.h}px`,
      transform: `rotate(${rotation}deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    };

    if (typeof mStyle === 'function') {
      mStyle(node.el, style);
    } else {
      Object.assign(node.el.style, style);
    }

    const inner = node.el.firstChild;
    if (inner && inner.style) {
      inner.style.maxWidth = '100%';
      inner.style.maxHeight = '100%';
    }

    if (node.el.parentElement !== container) container.appendChild(node.el);
  });

  return container;
}
function arrangeOnCard(dCard, divs, szCard = 300) {
  let n = divs.length;
  const padding = 10; // Outer cushion padding boundary constraint
  const radius = szCard / 2;

  mStyle(dCard, { padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' });

  // 2. Set up internal content panel wrapper
  let d0 = mDom(dCard, {
    w: '92%',
    h: '92%',
    display: 'flex',
    'flex-direction': 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  });

  // =========================================================================
  // 50% ELEMENT AREA RESIZING ENGINE
  // =========================================================================
  const totalCircleArea = Math.PI * Math.pow(radius, 2);
  const targetElementArea = totalCircleArea * 0.46; // Target roughly ~46-50% area coverage inside padding

  // Collect the actual starting dimensions of each incoming live div element
  let divMetrics = divs.map((d, index) => {
    let originalSz = d.w ||
      (d.style && parseInt(d.style.width)) ||
      d.offsetWidth ||
      50; // Fallback baseline if unassigned
    return { el: d, baseSz: originalSz, index };
  });

  // Calculate current total surface footprint area
  let currentTotalArea = divMetrics.reduce((sum, d) => sum + Math.pow(d.baseSz, 2), 0);

  // Compute the ideal global scale factor
  let idealScaleFactor = Math.sqrt(targetElementArea / currentTotalArea);

  // Safety caps: Limit individual elements from getting too huge on small n lists
  const maxAllowedDimension = szCard / (Math.sqrt(n) * 0.85);
  // =========================================================================

  let [nth, rows, colarr] = layoutCircle(n);
  let maxHeight = (dCard.h - padding * 2) / rows;
  let index = 0;

  // Render horizontal flex row strips according to the layout pattern
  for (let i of range(colarr.length)) {
    let margin = i == 0 || i == colarr.length - 1 ? 22 : 0;
    if (colarr.length <= 2) margin = 8;

    let dr = mDom(d0, {
      flex: 1, // Dynamically distributes row strips with vertical equality
      w: `${100 - 2 * margin}%`,
      hmax: maxHeight,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center'
    });

    for (let j of range(colarr[i])) {
      if (index >= n) break;
      let metric = divMetrics[index++];
      let divEl = metric.el;

      // Apply the analytical scale factor directly to the element's base geometry
      let sz = metric.baseSz * idealScaleFactor;

      // Enforce our visual safety caps
      if (sz > maxAllowedDimension) {
        sz = maxAllowedDimension;
      }

      // Proportional aspect-ratio text scaling parameters (with boundary corner clearance adjustments)
      let fontMultiplier = 0.8;
      if (j == colarr[i] - 1 && (i == colarr.length - 1 || i == 0)) {
        fontMultiplier = 0.68;
      }
      let fz = sz * fontMultiplier;

      // Update structural style properties directly over the live element div
      mStyle(divEl, {
        w: sz,
        h: sz,
        sz: sz,
        fz: fz,
        cursor: 'pointer',
        margin: '0 6px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        //overflow: 'hidden',
        textOverflow: 'contain'
      });

      // Ensure text nodes or icon nodes adapt correctly to their newly assigned wrapper boxes
      let dIcon = divEl.firstChild || divEl;
      if (dIcon && dIcon.style) {
        dIcon.style.maxWidth = '100%';
        dIcon.style.maxHeight = '100%';
        dIcon.style.display = 'flex';
        dIcon.style.alignItems = 'center';
        dIcon.style.justifyContent = 'center';
      }

      // Place the live HTML element into the row node chain
      dr.appendChild(iDiv ? iDiv(divEl) : divEl);
    }
  }
  return dCard;
}
function arrangeOnCircle(container, items, options = {}) {
  /**
   * arrangeOnCircle
   * ----------------------------------------------------------------------------
   * Distributes items inside a circular container without overlap, keeping a
   * boundary padding and even spacing between items. Supports three layout
   * strategies (random, concentric rings, golden-angle spiral) that all share
   * the same collision-resolution engine, so overlap-free placement is
   * guaranteed (items are shrunk as a last resort, never allowed to overlap).
   *
   * @param {HTMLElement} container - parent element (will be set to position:relative)
   * @param {HTMLElement[]} items - DOM elements to place. Each item may already
   *        have a width/height (via style, attribute, or offsetWidth/Height) -
   *        these are read as the item's natural size before any scaling.
   * @param {Object} [options]
   * @param {'random'|'concentric'|'spiral'} [options.mode='concentric'] - candidate slot strategy
   * @param {number} [options.szCard] - diameter of the circle in px. Defaults to
   *        min(container width, container height) from getBoundingClientRect().
   * @param {number} [options.padding=14] - empty margin kept between items and the circle edge
   * @param {number} [options.gap=8] - minimum empty space enforced between any two items
   * @param {number|false} [options.targetCoverage=0.45] - fraction of the circle's
   *        area items should roughly cover in total before collision resolution.
   *        Set to false/0 to keep items at their original natural size.
   * @param {number} [options.minScale=0.5] - lowest scale factor an item may be
   *        shrunk to while resolving an unavoidable collision
   * @param {boolean|[number,number]} [options.rotate=false] - if true, applies a
   *        random rotation in [-12,12]deg to each item; pass [min,max] for a
   *        custom range in degrees
   * @param {number} [options.seed] - optional seed for deterministic random mode
   * @returns {HTMLElement} container
   */
  const numItems = items.length;
  if (numItems === 0) return container;

  const {
    mode = 'concentric',
    padding = 14,
    gap = 8,
    targetCoverage = 0.45,
    minScale = 0.5,
    rotate = false,
    seed
  } = options;

  // ---------------------------------------------------------------------
  // 0. Seedable RNG (mulberry32) so "random" mode can be reproducible
  // ---------------------------------------------------------------------
  function makeRng(s) {
    if (s === undefined || s === null) return Math.random;
    let a = s >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = makeRng(seed);

  // ---------------------------------------------------------------------
  // 1. Container geometry
  // ---------------------------------------------------------------------
  if (typeof mStyle === 'function') {
    mStyle(container, { position: 'relative' });
  } else {
    container.style.position = container.style.position || 'relative';
  }

  const rect = container.getBoundingClientRect();
  const szCard = options.szCard || Math.min(rect.width, rect.height) || 300;
  const radius = szCard / 2;
  const usableRadius = radius - padding;
  if (usableRadius <= 0) return container; // nothing fits

  // ---------------------------------------------------------------------
  // 2. Read natural sizes, then apply an optional global area-based scale
  // ---------------------------------------------------------------------
  let metrics = items.map((el, index) => {
    const w = el.w || parseInt(el.style && el.style.width) || el.offsetWidth || 40;
    const h = el.h || parseInt(el.style && el.style.height) || el.offsetHeight || 40;
    return { el, w, h, index };
  });

  if (targetCoverage) {
    const circleArea = Math.PI * radius * radius;
    const targetArea = circleArea * targetCoverage;
    const currentArea = metrics.reduce((sum, m) => sum + m.w * m.h, 0) || 1;
    const scale = Math.sqrt(targetArea / currentArea);

    // Cap any single item so a handful of huge ones can't dominate the card
    const maxDim = szCard / (Math.sqrt(numItems) * 0.9);

    metrics = metrics.map(m => {
      let w = m.w * scale;
      let h = m.h * scale;
      if (w > maxDim || h > maxDim) {
        const capRatio = maxDim / Math.max(w, h);
        w *= capRatio;
        h *= capRatio;
      }
      return { ...m, w, h };
    });
  }

  const avgDiameter = metrics.reduce((s, m) => s + Math.hypot(m.w, m.h), 0) / numItems;

  // ---------------------------------------------------------------------
  // 3. Candidate slot generators (relative to circle center 0,0)
  // ---------------------------------------------------------------------
  function spiralSlots(n) {
    const goldenAngle = 137.5 * (Math.PI / 180);
    const slots = [];
    for (let i = 0; i < n; i++) {
      const rFrac = n === 1 ? 0 : Math.sqrt((i + 0.5) / n);
      const r = rFrac * usableRadius;
      const a = i * goldenAngle;
      slots.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
    return slots;
  }

  function concentricSlots(n) {
    const slots = [{ x: 0, y: 0 }];
    let ringRadius = 0;
    const ringStep = Math.max(avgDiameter + gap, 24);
    let placed = 1;
    let ringIndex = 0;
    let prevCapacity = 0;
    while (placed < n) {
      ringRadius += ringStep;
      ringIndex++;
      const circumference = 2 * Math.PI * ringRadius;
      const capacity = Math.max(1, Math.min(n - placed, Math.floor(circumference / ringStep)));
      const phase = prevCapacity > 0 ? Math.PI / prevCapacity : 0;
      for (let i = 0; i < capacity; i++) {
        const a = (i / capacity) * Math.PI * 2 + phase;
        slots.push({ x: ringRadius * Math.cos(a), y: ringRadius * Math.sin(a) });
      }
      placed += capacity;
      prevCapacity = capacity;
      if (ringIndex > n + 5) break; // safety valve
    }
    return slots;
  }

  function randomSlots(n) {
    // Dart-throwing with a minimum-distance rejection pass for even spread,
    // falling back to plain uniform-disc sampling if budget runs out.
    const slots = [];
    const minDist = Math.max(avgDiameter * 0.6, 1);
    const maxAttempts = n * 60;
    let attempts = 0;
    while (slots.length < n && attempts < maxAttempts) {
      attempts++;
      const r = usableRadius * Math.sqrt(rng());
      const a = rng() * Math.PI * 2;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      let ok = true;
      for (const s of slots) {
        if (Math.hypot(s.x - x, s.y - y) < minDist) { ok = false; break; }
      }
      if (ok) slots.push({ x, y });
    }
    // Top up with plain uniform points if rejection sampling fell short
    while (slots.length < n) {
      const r = usableRadius * Math.sqrt(rng());
      const a = rng() * Math.PI * 2;
      slots.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
    return slots;
  }

  const generators = { spiral: spiralSlots, concentric: concentricSlots, random: randomSlots };
  const buildSlots = generators[mode] || generators.concentric;
  let slots = buildSlots(numItems);

  // Slots closest to center first reads more natural for concentric/spiral;
  // for random mode, shuffle so largest items don't cluster in one spot.
  if (mode === 'random') {
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
  } else {
    slots.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  }

  // ---------------------------------------------------------------------
  // 4. Collision-aware placement engine
  // ---------------------------------------------------------------------
  function collides(x1, y1, w1, h1, x2, y2, w2, h2, requiredGap) {
    const boxOverlap = !(x1 + w1 / 2 + requiredGap < x2 - w2 / 2 ||
      x1 - w1 / 2 - requiredGap > x2 + w2 / 2 ||
      y1 + h1 / 2 + requiredGap < y2 - h2 / 2 ||
      y1 - h1 / 2 - requiredGap > y2 + h2 / 2);
    if (!boxOverlap) return false;
    const r1 = Math.hypot(w1 / 2, h1 / 2);
    const r2 = Math.hypot(w2 / 2, h2 / 2);
    return Math.hypot(x2 - x1, y2 - y1) < (r1 + r2 + requiredGap);
  }

  function fitsInsideCircle(x, y, w, h) {
    const itemRadius = Math.hypot(w / 2, h / 2);
    return Math.hypot(x, y) + itemRadius <= usableRadius;
  }

  const placed = []; // { x, y, w, h, el }

  // Largest items first: they're hardest to fit and should claim good slots
  const ordered = [...metrics].sort((a, b) => (b.w * b.h) - (a.w * a.h));

  ordered.forEach(item => {
    let { w, h } = item;
    let scale = 1;
    let success = false;

    while (!success && scale >= minScale - 1e-6) {
      const tw = w * scale, th = h * scale;

      // Try each remaining slot, with a small local spiral search around it
      // so items settle into the nearest open space rather than failing outright.
      for (let s = 0; s < slots.length && !success; s++) {
        const base = slots[s];
        const maxShift = szCard * 0.4;
        let localR = 0;

        while (localR <= maxShift && !success) {
          const steps = localR === 0 ? 1 : 16;
          for (let a = 0; a < steps; a++) {
            const angle = (a / steps) * Math.PI * 2;
            const x = base.x + localR * Math.cos(angle);
            const y = base.y + localR * Math.sin(angle);

            if (!fitsInsideCircle(x, y, tw, th)) continue;

            let blocked = false;
            for (const p of placed) {
              if (collides(x, y, tw, th, p.x, p.y, p.w, p.h, gap)) { blocked = true; break; }
            }
            if (!blocked) {
              placed.push({ x, y, w: tw, h: th, el: item.el });
              slots.splice(s, 1);
              success = true;
              break;
            }
          }
          localR += Math.max(4, tw * 0.1);
        }
      }

      if (!success) scale -= 0.1; // shrink and retry the whole search
    }

    if (!success) {
      // Last resort: place at the sparsest spot we can find even if tight,
      // shrunk to the minimum scale, so nothing is ever silently dropped.
      const tw = w * minScale, th = h * minScale;
      const fallback = slots.shift() || { x: 0, y: 0 };
      placed.push({ x: fallback.x, y: fallback.y, w: tw, h: th, el: item.el });
    }
  });

  // ---------------------------------------------------------------------
  // 5. Apply final styles
  // ---------------------------------------------------------------------
  const [rotMin, rotMax] = Array.isArray(rotate) ? rotate : [-12, 12];

  placed.forEach(node => {
    const left = radius + node.x - node.w / 2;
    const top = radius + node.y - node.h / 2;
    const rotation = rotate ? rotMin + rng() * (rotMax - rotMin) : 0;

    const style = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${node.w}px`,
      height: `${node.h}px`,
      transform: `rotate(${rotation}deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    };

    if (typeof mStyle === 'function') {
      mStyle(node.el, style);
    } else {
      Object.assign(node.el.style, style);
    }

    const inner = node.el.firstChild;
    if (inner && inner.style) {
      inner.style.maxWidth = '100%';
      inner.style.maxHeight = '100%';
    }

    if (node.el.parentElement !== container) container.appendChild(node.el);
  });

  return container;
}
function arrangeOnCircleX(container, items, options = {}) {
  /**
   * arrangeOnCircle
   * ----------------------------------------------------------------------------
   * Distributes items inside a circular container without overlap, keeping a
   * boundary padding and even spacing between items. Supports three layout
   * strategies (random, concentric rings, golden-angle spiral) that all share
   * the same collision-resolution engine, so overlap-free placement is
   * guaranteed (items are shrunk as a last resort, never allowed to overlap).
   *
   * @param {HTMLElement} container - parent element (will be set to position:relative)
   * @param {HTMLElement[]} items - DOM elements to place. Each item may already
   *        have a width/height (via style, attribute, or offsetWidth/Height) -
   *        these are read as the item's natural size before any scaling.
   * @param {Object} [options]
   * @param {'random'|'concentric'|'spiral'} [options.mode='concentric'] - candidate slot strategy
   * @param {number} [options.szCard] - diameter of the circle in px. Defaults to
   *        min(container width, container height) from getBoundingClientRect().
   * @param {number} [options.padding=14] - empty margin kept between items and the circle edge
   * @param {number} [options.gap=8] - minimum empty space enforced between any two items
   * @param {number|false} [options.targetCoverage=0.45] - fraction of the circle's
   *        area items should roughly cover in total before collision resolution.
   *        Set to false/0 to keep items at their original natural size.
   * @param {number} [options.minScale=0.5] - lowest scale factor an item may be
   *        shrunk to while resolving an unavoidable collision
   * @param {boolean|[number,number]} [options.rotate=false] - if true, applies a
   *        random rotation in [-12,12]deg to each item; pass [min,max] for a
   *        custom range in degrees
   * @param {number} [options.seed] - optional seed for deterministic random mode
   * @returns {HTMLElement} container
   */
  const numItems = items.length;
  if (numItems === 0) return container;

  const {
    mode = 'concentric',
    padding = 14,
    gap = 8,
    targetCoverage = 0.45,
    minScale = 0.5,
    rotate = false,
    seed
  } = options;

  // ---------------------------------------------------------------------
  // 0. Seedable RNG (mulberry32) so "random" mode can be reproducible
  // ---------------------------------------------------------------------
  function makeRng(s) {
    if (s === undefined || s === null) return Math.random;
    let a = s >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = makeRng(seed);

  // ---------------------------------------------------------------------
  // 1. Container geometry
  // ---------------------------------------------------------------------
  if (typeof mStyle === 'function') {
    mStyle(container, { position: 'relative' });
  } else {
    container.style.position = container.style.position || 'relative';
  }

  const rect = container.getBoundingClientRect();
  const szCard = options.szCard || Math.min(rect.width, rect.height) || 300;
  const radius = szCard / 2;
  const usableRadius = radius - padding;
  if (usableRadius <= 0) return container; // nothing fits

  // ---------------------------------------------------------------------
  // 2. Read natural sizes, then apply an optional global area-based scale
  // ---------------------------------------------------------------------
  let metrics = items.map((el, index) => {
    const w = el.w || parseInt(el.style && el.style.width) || el.offsetWidth || 40;
    const h = el.h || parseInt(el.style && el.style.height) || el.offsetHeight || 40;
    return { el, w, h, index };
  });

  if (targetCoverage) {
    const circleArea = Math.PI * radius * radius;
    const targetArea = circleArea * targetCoverage;
    const currentArea = metrics.reduce((sum, m) => sum + m.w * m.h, 0) || 1;
    const scale = Math.sqrt(targetArea / currentArea);

    // Cap any single item so a handful of huge ones can't dominate the card
    const maxDim = szCard / (Math.sqrt(numItems) * 0.9);

    metrics = metrics.map(m => {
      let w = m.w * scale;
      let h = m.h * scale;
      if (w > maxDim || h > maxDim) {
        const capRatio = maxDim / Math.max(w, h);
        w *= capRatio;
        h *= capRatio;
      }
      return { ...m, w, h };
    });
  }

  const avgDiameter = metrics.reduce((s, m) => s + Math.hypot(m.w, m.h), 0) / numItems;

  // ---------------------------------------------------------------------
  // 3. Candidate slot generators (relative to circle center 0,0)
  // ---------------------------------------------------------------------
  function spiralSlots(n) {
    const goldenAngle = 137.5 * (Math.PI / 180);
    const slots = [];
    for (let i = 0; i < n; i++) {
      const rFrac = n === 1 ? 0 : Math.sqrt((i + 0.5) / n);
      const r = rFrac * usableRadius;
      const a = i * goldenAngle;
      slots.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
    return slots;
  }

  function concentricSlots(n) {
    const slots = [{ x: 0, y: 0 }];
    let ringRadius = 0;
    const ringStep = Math.max(avgDiameter + gap, 24);
    let placed = 1;
    let ringIndex = 0;
    let prevCapacity = 0;
    while (placed < n) {
      ringRadius += ringStep;
      ringIndex++;
      const circumference = 2 * Math.PI * ringRadius;
      const capacity = Math.max(1, Math.min(n - placed, Math.floor(circumference / ringStep)));
      const phase = prevCapacity > 0 ? Math.PI / prevCapacity : 0;
      for (let i = 0; i < capacity; i++) {
        const a = (i / capacity) * Math.PI * 2 + phase;
        slots.push({ x: ringRadius * Math.cos(a), y: ringRadius * Math.sin(a) });
      }
      placed += capacity;
      prevCapacity = capacity;
      if (ringIndex > n + 5) break; // safety valve
    }

    // Rings are generated outward by a fixed step and can overshoot
    // usableRadius for crowded cards. Rescale every slot's radius (keeping
    // its angle) so the outermost ring lands exactly on usableRadius.
    const maxR = slots.reduce((m, s) => Math.max(m, Math.hypot(s.x, s.y)), 0);
    if (maxR > usableRadius) {
      const shrink = usableRadius / maxR;
      for (const s of slots) { s.x *= shrink; s.y *= shrink; }
    }
    return slots;
  }

  function randomSlots(n) {
    // Dart-throwing with a minimum-distance rejection pass for even spread,
    // falling back to plain uniform-disc sampling if budget runs out.
    const slots = [];
    const minDist = Math.max(avgDiameter * 0.6, 1);
    const maxAttempts = n * 60;
    let attempts = 0;
    while (slots.length < n && attempts < maxAttempts) {
      attempts++;
      const r = usableRadius * Math.sqrt(rng());
      const a = rng() * Math.PI * 2;
      const x = r * Math.cos(a);
      const y = r * Math.sin(a);
      let ok = true;
      for (const s of slots) {
        if (Math.hypot(s.x - x, s.y - y) < minDist) { ok = false; break; }
      }
      if (ok) slots.push({ x, y });
    }
    // Top up with plain uniform points if rejection sampling fell short
    while (slots.length < n) {
      const r = usableRadius * Math.sqrt(rng());
      const a = rng() * Math.PI * 2;
      slots.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
    }
    return slots;
  }

  const generators = { spiral: spiralSlots, concentric: concentricSlots, random: randomSlots };
  const buildSlots = generators[mode] || generators.concentric;
  let slots = buildSlots(numItems);

  // Slots closest to center first reads more natural for concentric/spiral;
  // for random mode, shuffle so largest items don't cluster in one spot.
  if (mode === 'random') {
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
  } else {
    slots.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  }

  // ---------------------------------------------------------------------
  // 4. Collision-aware placement engine — O(n log n)
  // ---------------------------------------------------------------------
  // The naive version checked every candidate point against *every already
  // placed item* (O(n) per check) while also trying *every remaining slot*
  // per item (O(n) per item) -> O(n^3) worst case. To bring this down:
  //   1. Items get exactly ONE primary slot each (1:1, assigned by sorted
  //      order via a pointer) instead of an exhaustive search over all
  //      slots -> O(n) total slot assignment instead of O(n^2).
  //   2. Collisions are tested via a uniform spatial hash grid, so each
  //      check only inspects the handful of items in nearby cells instead
  //      of the full placed list -> O(1) amortized per check instead of O(n).
  //   3. The only O(n log n) term left is the up-front sort by item area.
  function collides(x1, y1, w1, h1, x2, y2, w2, h2, requiredGap) {
    const boxOverlap = !(x1 + w1 / 2 + requiredGap < x2 - w2 / 2 ||
      x1 - w1 / 2 - requiredGap > x2 + w2 / 2 ||
      y1 + h1 / 2 + requiredGap < y2 - h2 / 2 ||
      y1 - h1 / 2 - requiredGap > y2 + h2 / 2);
    if (!boxOverlap) return false;
    const r1 = Math.hypot(w1 / 2, h1 / 2);
    const r2 = Math.hypot(w2 / 2, h2 / 2);
    return Math.hypot(x2 - x1, y2 - y1) < (r1 + r2 + requiredGap);
  }

  function fitsInsideCircle(x, y, w, h) {
    const itemRadius = Math.hypot(w / 2, h / 2);
    return Math.hypot(x, y) + itemRadius <= usableRadius;
  }

  // Hard guarantee: pull a point radially inward (same angle) until its
  // bounding radius fits within usableRadius. Applied as a final safety
  // net on every placed item — including fallback placements — so an
  // item can structurally never end up outside the circle, regardless of
  // where its candidate slot came from.
  function clampInsideCircle(x, y, w, h) {
    const itemRadius = Math.hypot(w / 2, h / 2);
    const maxCenterDist = Math.max(0, usableRadius - itemRadius);
    const dist = Math.hypot(x, y);
    if (dist <= maxCenterDist || dist === 0) return { x, y };
    const k = maxCenterDist / dist;
    return { x: x * k, y: y * k };
  }

  // --- spatial hash grid ---------------------------------------------
  // Cell size ~ largest item span + gap, so any possible collision for a
  // point is guaranteed to be found by checking just the 3x3 neighborhood.
  const maxSpan = metrics.reduce((m, it) => Math.max(m, it.w, it.h), 0);
  const cellSize = Math.max(maxSpan + gap, 8);
  const grid = new Map(); // "ix,iy" -> array of placed nodes

  function cellKey(ix, iy) { return ix + ',' + iy; }
  function cellOf(x, y) { return [Math.floor(x / cellSize), Math.floor(y / cellSize)]; }

  function gridInsert(node) {
    const [ix, iy] = cellOf(node.x, node.y);
    const key = cellKey(ix, iy);
    let bucket = grid.get(key);
    if (!bucket) { bucket = []; grid.set(key, bucket); }
    bucket.push(node);
  }

  function gridHasCollision(x, y, w, h) {
    const [ix, iy] = cellOf(x, y);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const bucket = grid.get(cellKey(ix + dx, iy + dy));
        if (!bucket) continue;
        for (const p of bucket) {
          if (collides(x, y, w, h, p.x, p.y, p.w, p.h, gap)) return true;
        }
      }
    }
    return false;
  }
  // ---------------------------------------------------------------------

  const placed = []; // { x, y, w, h, el }

  // Largest items first: they're hardest to fit and should claim good slots.
  // This sort is the only O(n log n) term in the whole engine.
  const ordered = [...metrics].sort((a, b) => (b.w * b.h) - (a.w * a.h));

  // Slots were generated 1:1 with item count, sorted by distance from
  // center (or shuffled for random mode). Walk them with a pointer instead
  // of splicing/searching the array -> O(1) amortized per item.
  let slotPtr = 0;
  function nextSlot() {
    return slotPtr < slots.length ? slots[slotPtr++] : { x: 0, y: 0 };
  }

  ordered.forEach(item => {
    let { w, h } = item;
    let scale = 1;
    let success = false;
    const base = nextSlot();

    while (!success && scale >= minScale - 1e-6) {
      const tw = w * scale, th = h * scale;
      const maxShift = szCard * 0.4;
      let localR = 0;

      // Local spiral search around this item's own slot only (constant
      // number of radius/angle steps, independent of n) using the grid
      // for O(1)-amortized neighbor collision checks.
      while (localR <= maxShift && !success) {
        const steps = localR === 0 ? 1 : 16;
        for (let a = 0; a < steps; a++) {
          const angle = (a / steps) * Math.PI * 2;
          const x = base.x + localR * Math.cos(angle);
          const y = base.y + localR * Math.sin(angle);

          if (!fitsInsideCircle(x, y, tw, th)) continue;
          if (gridHasCollision(x, y, tw, th)) continue;

          // Defense in depth: clamp even though fitsInsideCircle already
          // passed, to absorb any floating-point edge cases at the boundary.
          const c = clampInsideCircle(x, y, tw, th);
          const node = { x: c.x, y: c.y, w: tw, h: th, el: item.el };
          placed.push(node);
          gridInsert(node);
          success = true;
          break;
        }
        localR += Math.max(4, tw * 0.1);
      }

      if (!success) scale -= 0.1; // shrink and retry the local search
    }

    if (!success) {
      // Last resort: drop it at the minimum scale, clamped radially inward
      // so it is GUARANTEED to stay within the circle even if its slot
      // (e.g. an overshot concentric ring, or a collision-forced fallback)
      // would otherwise have placed it outside the boundary.
      const tw = w * minScale, th = h * minScale;
      const c = clampInsideCircle(base.x, base.y, tw, th);
      const node = { x: c.x, y: c.y, w: tw, h: th, el: item.el };
      placed.push(node);
      gridInsert(node);
    }
  });

  // ---------------------------------------------------------------------
  // 5. Apply final styles
  // ---------------------------------------------------------------------
  const [rotMin, rotMax] = Array.isArray(rotate) ? rotate : [-12, 12];

  placed.forEach(node => {
    const left = radius + node.x - node.w / 2;
    const top = radius + node.y - node.h / 2;
    const rotation = rotate ? rotMin + rng() * (rotMax - rotMin) : 0;

    const style = {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${node.w}px`,
      height: `${node.h}px`,
      transform: `rotate(${rotation}deg)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    };

    if (typeof mStyle === 'function') {
      mStyle(node.el, style);
    } else {
      Object.assign(node.el.style, style);
    }

    const inner = node.el.firstChild;
    if (inner && inner.style) {
      inner.style.maxWidth = '100%';
      inner.style.maxHeight = '100%';
    }

    if (node.el.parentElement !== container) container.appendChild(node.el);
  });

  return container;
}
function layoutCircle(n) {
  let nth, rows, colarr;
  if (n == 3) { nth = 2.3; rows = 2; colarr = [1, 2]; }
  else if (n == 4) { nth = 2.3; rows = 2; colarr = [2, 2]; }
  else if (n == 5) { nth = 3; rows = 3; colarr = [1, 2, 2]; }// [1, 3, 1]; }
  else if (n == 6) { nth = 3.3; rows = 3; colarr = [1, 3, 2]; }
  else if (n == 7) { nth = 3; rows = 3; colarr = [2, 3, 2]; } //default
  else if (n == 8) { nth = 3.8; rows = 3; colarr = [2, 4, 2]; }//[1, 3, 3, 1]; }
  else if (n == 9) { nth = 4; rows = 4; colarr = [2, 3, 3, 1]; }
  else if (n == 10) { nth = 4; rows = 4; colarr = [2, 3, 3, 2]; }
  else if (n == 11) { nth = 4.5; rows = 4; colarr = [2, 3, 4, 2]; }
  else if (n == 12) { nth = 4.8; rows = 4; colarr = [2, 4, 4, 2]; }
  else if (n == 13) { nth = 5; rows = 5; colarr = [2, 3, 4, 3, 1]; }
  else if (n == 14) { nth = 5; rows = 5; colarr = [2, 3, 4, 3, 2]; }
  else if (n == 15) { nth = 5.5; rows = 4; colarr = [3, 4, 5, 3]; }
  else if (n == 16) { nth = 5.5; rows = 5; colarr = [2, 3, 5, 4, 2]; }
  else if (n == 17) { nth = 5.5; rows = 5; colarr = [2, 4, 5, 4, 2]; } //17
  else if (n == 18) { nth = 5.8; rows = 5; colarr = [2, 4, 5, 4, 3]; } //18
  else if (n == 19) { nth = 5.8; rows = 5; colarr = [3, 4, 5, 4, 3]; } //18
  else if (n == 20) { nth = 5.8; rows = 5; colarr = [2, 5, 6, 5, 2]; } //18
  else if (n == 21) { nth = 5.8; rows = 5; colarr = [2, 5, 6, 5, 3]; } //18
  else if (n == 22) { nth = 5.8; rows = 5; colarr = [3, 5, 6, 5, 3]; } //18
  else if (n == 23) { nth = 5.8; rows = 5; colarr = [4, 5, 6, 5, 3]; } //18
  else if (n == 24) { nth = 5.8; rows = 5; colarr = [4, 5, 6, 5, 4]; } //18
  return [nth, rows, colarr];
}

function spotit() {
  function setup(table) {
    let fen = table.fen = {};
    table.options.adaptive = 'yes';
    let options = table.options;
    let plNames = Object.keys(table.players);
    for (const name in table.players) {
      let pl = table.players[name];
      pl.score = 0;
    }
    table.plorder = jsCopy(plNames);
    table.turn = [table.plorder[0]];
    fen.movetype = 'turn';
    fen.stage = 'init';
    [fen.items, fen.shared] = spotitSetupCardsAdaptive(table);
  }
  async function process(uname, table, movedata) {
    if (table.fen.stage === 'init' && !movedata) {
      let newTable = gtCopy(table);
      newTable.turn = jsCopy(newTable.plorder);
      newTable.fen.stage = newTable.stage = 'move';
      await tableSaveUpdate(newTable);
      return true;
    } else {
      let newTable = gtCopy(table);
      let fen = newTable.fen;
      let success = fen.shared.includes(movedata); console.log('movedata', movedata, 'success', success);
      newTable.players[uname].score += success ? 1 : -1;
      let score = newTable.players[uname].score;
      newTable.action = { plName: uname, key: movedata, step: newTable.step, success };
      if (score >= table.options.winning_score) newTable.status = 'over';
      if (newTable.status == 'over') newTable.fen.winners = getPlayersWithMaxScore(newTable);
      else if (success) {
        [fen.items, fen.shared, fen.extras] = spotitSetupCardsAdaptive(table);
        conslog(fen.shared);
      }
      await tableSaveUpdateFS(newTable);
      return true;

    }
  }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    stdStatsScore(me, table, { allowUserSwitch: true });
    let fen = table.fen;
    let options = table.options;

    let ui = { dTable, cards: [] };

    let dt = dTable;
    mLinebreak(dt, 10);

    let n = options.adaptive == 'yes' ? cal_num_syms_adaptive(me, table) : options.num_symbols;
    console.log('===>n', n);
    //n=7;
    //let [nth, rows, colarr] = layoutCircle(n);
    //let maxCount = options.max_count;
    //avg = 80 + (4 - n) * 3;
    avg = Math.round(Math.min(200 / Math.sqrt(n), 85)); console.log(avg);
    let sizes = n <= 5 ? [avg * 1.5, avg * 1.25, avg * 1.25, avg, avg] : [avg, avg * .75, avg * 1.25, avg, avg * .75];
    let szCard = 320;
    let j = 0;

    for (let i = 0; i < table.options.num_cards; i++) {
      if (fen.stage === 'init') {
        let card = cRound(dt, { w: szCard, h: szCard, margin: 20 });
        card.faceUp = true;
        let dCard = iDiv(card);
        face_down(card, GREEN, 'food1.png');
        ui.cards.push(card);
        continue;
      }

      let els = fen.items[i].keys.slice(0, n); //console.log(els)
      arrShuffle(els);

      let card = cRound(dt, { margin: 12, border: '2 #888', w: szCard, h: szCard });
      let dCard = iDiv(card);
      card.syms = [];
      for (const key of els) {
        let sz = sizes[j++ % sizes.length];
        let rotate = `${rChoose([0, 25, 50, 315, 330])}deg`;
        let d2;
        if (isdef(M.allImages[key])) {
          d2 = mKey(key, dCard, { fit: 'contain', round: true, w: sz, h: sz, rotate }, { szImage: sz * .8, key, prefer: 'img' });
        } else {
          d2 = mKey(key, dCard, { round: true, w: sz, h: sz, fz: sz * .8, rotate }, { key, prefer: 'emoji' });
        }
        card.syms.push({ div: d2, key });
      }
      arrangeOnCard(dCard, arrChildren(dCard), szCard);
      ui.cards.push(card);
    }
    return ui;
  }
  async function activate(me, table, ui) {
    //console.log('activate', ui, ui.cards);
    let { myTurn, spectating } = stdInstruction(me, table);
    if (spectating) return;
    if (myTurn && table.fen.stage === 'init') {
      mLinebreak(ui.dTable, 10);
      ui.dButton = mDom(ui.dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: 'START!' });
      ui.dButton.onclick = () => { rsgEval(me, me, table, ui, null); }
    } else if (table.fen.stage === 'move') {

      console.log(table.fen.shared, table.fen.items[0]);
      for (let i = 0; i < ui.cards.length; i++) {
        let card = ui.cards[i];
        let syms = card.syms;
        for (let j = 0; j < syms.length; j++) {
          let sym = syms[j];
          let dSym = iDiv(sym);
          let key = dSym.getAttribute('key');
          mStyle(dSym, { cursor: 'pointer' });
          ignoreDoubleClick(dSym, () => rsgEval(me, me, table, ui, key));
        };
      }
    }
    if (table.fen.stage == 'move') stdBotMoves(async (bot) => await rsgEval(bot, me, table, ui, rChoose(table.fen.shared)), table);
  }
  async function rsgEval(uname, me, table, ui, key) {
    stdEvalShield();
    if (uname == me) {
      if (key == null) {
        toggleItemSelection(ui.dButton);
      } else {
        let elements = document.querySelectorAll(`[key="${key}"]`);
        elements.forEach(x => toggleItemSelection(x));
      }
    }
    await mSleep(300);
    let moveSent = await process(uname, table, key);
    if (moveSent) await updateMain(true);
    DA.isProcessingMove = false;
  }

  return { setup, activate, present, process };
}

function makeContainer(dParent, szCard) {
  let card = cRound(dParent, { margin: 12, border: '2 #888', w: szCard, h: szCard });
  return iDiv(card);
}
function makeItems(maxCount, szCard = 300) {
  Items = [];
  let cnt = 0, i = 0;
  if (nundef(maxCount)) maxCount = rNumber(6, 13);
  avg = 75 + (13 - maxCount) * 3;
  let list = rChoose(SpecialKeys, maxCount * 2);
  let sizes = [avg, avg * .75, avg * 1.25, avg, avg * .75];
  for (const key of list) {
    let sz = sizes[i++ % sizes.length];
    let rotate = `${rChoose([0, 25, 50, 315, 330])}deg`;
    if (isdef(M.allImages[key])) {
      cnt++;
      let d2 = mKey(key, null, { round: true, w: sz, h: sz, rotate }, { szImage: sz * .75, key, prefer: 'img' });
      Items.push(d2);

    }
    if (cnt > maxCount) break;
  }
  return Items;
}


function calculateKeyMetrics(list, key) {
  // 1. Extract and filter out values that are not valid numbers
  const values = list
    .map(obj => obj[key])
    .filter(val => typeof val === 'number' && !isNaN(val));

  if (values.length === 0) return null;

  // 2. Sort values ascending (crucial for median calculation)
  values.sort((a, b) => a - b);

  // 3. Compute Min, Max, and Sum/Avg
  const min = values[0];
  const max = values[values.length - 1];
  const sum = values.reduce((total, val) => total + val, 0);
  const avg = sum / values.length;

  // 4. Compute Median
  const mid = Math.floor(values.length / 2);
  const median = values.length % 2 !== 0
    ? values[mid]
    : (values[mid - 1] + values[mid]) / 2;

  return {
    min: parseFloat(min.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    median: parseFloat(median.toFixed(2)),
    avg: parseFloat(avg.toFixed(2))
  };
}
function calculateEmojiMetrics(emojiHtmlCode, fontSize, rotateAngle, fontFamily = 'emoNoto') {
  // 1. Resolve HTML entities if passed (e.g. &#128029; -> 🐝)
  let emoji = emojiHtmlCode;
  if (emojiHtmlCode.startsWith('&')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = emojiHtmlCode;
    emoji = tempDiv.textContent;
  }

  // 2. Prepare an offscreen canvas large enough to hold the rotated glyph
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  // Set canvas size safely beyond the bounding size to avoid clipping during rotation
  const pad = fontSize * 1.5;
  const size = fontSize * 2 + pad;
  canvas.width = size;
  canvas.height = size;

  // 3. Apply transformations (Translate to center, Rotate, then Draw)
  const cx = size / 2;
  const cy = size / 2;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotateAngle * Math.PI) / 180);

  // Configure text properties
  ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Draw the emoji at the transformed origin
  ctx.fillText(emoji, 0, 0);
  ctx.restore();

  // 4. Scan pixel data to find the exact bounding box of the visible emoji glyph
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  let minX = size, maxX = 0, minY = size, maxY = 0;
  let hasPixels = false;

  // Step through the alpha channel (every 4th byte: R, G, B, A)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const alphaIndex = (y * size + x) * 4 + 3;
      if (data[alphaIndex] > 10) { // Threshold to ignore anti-aliased artifact fringes
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        hasPixels = true;
      }
    }
  }

  // Fallback defaults if the canvas render failed or emoji was blank
  if (!hasPixels) {
    return { centerX: cx, centerY: cy, radius: fontSize / 2 };
  }

  // 5. Calculate Center and Minimum Enclosing Radius
  // Geometric center of the pixel bounding box
  const visualCenterX = (minX + maxX) / 2;
  const visualCenterY = (minY + maxY) / 2;

  // Maximum distance from the center to any edge pixel defines the precise bounding radius
  let maxDistanceSq = 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const alphaIndex = (y * size + x) * 4 + 3;
      if (data[alphaIndex] > 10) {
        const dx = x - visualCenterX;
        const dy = y - visualCenterY;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxDistanceSq) {
          maxDistanceSq = distSq;
        }
      }
    }
  }

  const radius = Math.sqrt(maxDistanceSq);

  return {
    centerX: visualCenterX,
    centerY: visualCenterY,
    radius: radius
  };
}
function calculateEmojiCircleMetrics(emojiHtml, fontSize = 100, fontFamily = 'emoNoto') {
  // 1. Convert HTML entity if necessary
  let emoji = emojiHtml;
  if (emojiHtml.startsWith('&')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = emojiHtml;
    emoji = tempDiv.textContent;
  }

  // 2. Setup a safe offscreen canvas size to avoid clipping boundary issues
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const size = fontSize * 2.5;
  canvas.width = size;
  canvas.height = size;

  // 3. Render the emoji perfectly centered
  const cx = size / 2;
  const cy = size / 2;
  ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, cy);

  // 4. Extract pixel arrays
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  let minX = size, maxX = 0, minY = size, maxY = 0;
  let activePixels = [];

  // Step through alpha layer to collect visible bounds
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const alphaIndex = (y * size + x) * 4 + 3;
      if (data[alphaIndex] > 15) { // Filter anti-aliasing artifacts noise floor
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        activePixels.push({ x, y });
      }
    }
  }

  // Fallback check if rendering failed/empty
  if (activePixels.length === 0) {
    return { radius: 0, coveragePercentage: 0, pixelCount: 0 };
  }

  // 5. Find the true visual center of the bounding box mass
  const visualCenterX = (minX + maxX) / 2;
  const visualCenterY = (minY + maxY) / 2;

  // 6. Calculate the minimum enclosing radius (furthest active pixel from visual center)
  let maxDistanceSq = 0;
  activePixels.forEach(p => {
    const dx = p.x - visualCenterX;
    const dy = p.y - visualCenterY;
    const distSq = dx * dx + dy * dy;
    if (distSq > maxDistanceSq) {
      maxDistanceSq = distSq;
    }
  });
  const radius = Math.sqrt(maxDistanceSq);

  // 7. Calculate coverage percentages
  const circleAreaPixels = Math.PI * maxDistanceSq;
  const totalVisiblePixels = activePixels.length;
  const coveragePercentage = (totalVisiblePixels / circleAreaPixels) * 100;

  return {
    radius: parseFloat(radius.toFixed(2)),
    coveragePercentage: parseFloat(coveragePercentage.toFixed(2)),
    pixelCount: totalVisiblePixels
  };
}
function getFilteredDict(di, func) {
  let res = {};
  for (const k in di) {
    if (func(k, di[k])) res[k] = di[k];
  }
  return res;
}
function getFilteredSymbols(diradDict, min = 22, max = 24) {
  // --- Example Usage ---
  // const myFilteredKeys = getFilteredSymbols(M.dirad);
  // console.log(myFilteredKeys);
  const matchingKeys = [];

  for (const key in diradDict) {
    const entry = diradDict[key];

    // Ensure the entry has the required properties
    if (entry && entry.radmin !== undefined && entry.radmax !== undefined) {
      const radmin = entry.radmin;
      const radmax = entry.radmax;
      const diff = radmax - radmin;

      // Check Criteria:
      // 1. diff between radmin and radmax at most 1
      // 2. radmin and radmax between 22 and 24
      if (diff <= 1 && radmin >= min && radmax <= max) {
        matchingKeys.push(key);
      }
    }
  }

  return matchingKeys;
}
function sortDictBy(dict, valueKey, ascending = true) {
  return Object.fromEntries(
    Object.entries(dict).sort(([, a], [, b]) => {
      // Handle missing properties gracefully
      const valA = a[valueKey] !== undefined ? a[valueKey] : '';
      const valB = b[valueKey] !== undefined ? b[valueKey] : '';

      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    })
  );
}


//#region bau0


async function DAInit() {
  DA.backendURL = await getDA('phpUrl');
  let gamelist = DEV ? 'aristo badger bluff dinogame dodogame emoticount ferro fishgame fritz huti lacuna nations setgame simplegame spotit wise' : 'aristo bluff setgame spotit';
  DA.gamelist = gamelist = toWords(gamelist);
  gtInitFuncs();
  DA.evList = [];
  DA.isProcessingMove = false;
  DA.selectedItems = {};

  await loadAssetsStatic();
  globalKeyHandling();
}

function badger() {
  function setup(table) {
    stdSetupGame(table);
    let fen = table.fen;
    fen.listType = M.byType.emo;
    fen.listYes = fen.listType.filter(x => M.byCat.animal.includes(x));
    fen.listNo = fen.listType.filter(x => ['transport', 'sport', 'building', 'clothing'].some(y => M.superdi[x].cats.includes(y)));
    fen.numCards = 12;
    fen.qTypes = ['unique', 'oddman', 'frequent', 'alpha'];
    renewSet(fen);
  }
  function renewSet(fen) {
    let { key, list, oddman, inst } = pickRandomSet(fen.listYes, fen.listNo, fen.numCards, fen.qTypes);
    fen.instruction = inst;
    fen.list = list;
    fen.bgs = list.map(x => rColor());
    fen.oddman = oddman;
    fen.key = key;
  }
  async function process(uname, table, key) {
    let newTable = gtCopy(table);
    let success = key == newTable.fen.oddman;
    //console.log(success,uname)
    if (success) {
      newTable.players[uname].score += 1;
      renewSet(newTable.fen);
    } else {
      newTable.players[uname].score -= 1;
    }
    newTable.action = { plName: uname, step: newTable.step, action: { success }, success };
    let res = await tableSaveUpdateFS(newTable);
    //console.log('tableUpdate returned',res)
    return true;
  }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 500, 'wood');
    showTitleGame(me, table);
    stdStatsScore(me, table);
    let fen = table.fen;
    let key = fen.key;
    let fg = key == 'unique' ? 'yellow' : key == 'oddman' ? 'lime' : key == 'frequent' ? 'red' : 'lightblue';
    let st = { matop: 10, fz: 40, fg, family: 'blackops', align: 'center', w: 200 }; //,weight:'bold'};
    let dKey = mDom(dTable, st, { html: key + '!' }); //(key.length > 7 ? '' : '!') });
    mLinebreak(dTable, 10);
    let dParent = mDom(dTable, { w: 500, h: 400 }); //, bg:'green' });
    let items = mFit(fen.list, dParent);
    for (let i = 0; i < items.length; i++) {
      let bg = fen.bgs[i];
      let fg = colorIdealText(bg);
      mStyle(items[i].div, { bg, fg });
    }
    let correctItem = items.find(x => x.key == fen.oddman);
    return { dTable, items, correctItem, refresh: true };
  }
  async function activate(me, table, ui) {
    let { myTurn, spectating } = stdInstruction(me, table);
    if (spectating) return;
    for (const item of ui.items) {
      let d = item.div;
      d.setAttribute('key', item.key);
      mStyle(d, { cursor: 'pointer' });
      ignoreDoubleClick(d, () => rsgEval(me, me, table, ui, item));
    }
    stdBotMoves(bot => rsgEval(bot, me, table, ui, ui.correctItem), table);
  }
  async function rsgEval(uname, me, table, ui, item) {
    stdEvalShield();
    if (uname == me) {
      toggleItemSelection({ div: iDiv(item) });
    }
    let moveSent = await process(uname, table, item.key);
    if (moveSent) await updateMain(true);
    DA.isProcessingMove = false;
  }
  return { setup, present, activate, process }
}


function dinogame() {
  function setup(table) {
    stdSetupGame(table, 'wait');
    table.stage = 'wait';
    //table.fen.movedone = [];
    console.log('setup', table);
  }
  async function process(uname, table, buttonNumber) {
    let newTable = gtCopy(table);
    //lookupAddIfToList(newTable, ['fen', 'movedone'], uname);
    removeInPlace(newTable.turn, uname);
    console.log(newTable.players[uname])
    newTable.players[uname].action = { num: buttonNumber };
    console.log(newTable);
    if (newTable.turn.length == 0) {
      console.log(newTable)
      for (const p in newTable.players) {
        let pl = newTable.players[p];
        pl.score += pl.action.num;
        delete pl.action;
      }
      newTable.turn = Object.keys(newTable.players);
      //newTable.fen.movedone = [];
    }
    await tableSaveUpdate(newTable);
    return true;
  }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    stdStatsScore(me, table);
    if (table.stage == 'wait') {
      mDom(dTable, { fz: 40, margin: 20 }, { html: `Waiting for ${table.turn.join(', ')}...<br>${table.fen.movedone.length}/${Object.keys(table.players).length} finished` });
    } else {
      mDom(dTable, { fz: 40, margin: 20 }, { html: `Round ${table.step}: Make your move!` });
    }
    mLinebreak(dTable);
    let dButton1 = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `1` })
    let dButton2 = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `2` })
    let dButton3 = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `3` })
    return { dTable, dButton1, dButton2, dButton3, refresh: true };
  }
  async function activate(me, table, ui) {
    let { myTurn, spectating } = stdInstruction(me, table);
    if (spectating) return;
    if (!myTurn) {
      ui.dButton.disabled = true;
    } else {
      ignoreDoubleClick(ui.dButton1, () => rsgEvalButton(me, me, table, ui, 1));
      ignoreDoubleClick(ui.dButton2, () => rsgEvalButton(me, me, table, ui, 2));
      ignoreDoubleClick(ui.dButton3, () => rsgEvalButton(me, me, table, ui, 3));
    }
    stdBotMoves(bot => rsgEvalButton(bot, me, table, ui), table);
  }
  async function rsgEvalButton(uname, me, table, ui, buttonNumber) {
    stdEvalShield();
    if (uname == me) {
      toggleItemSelection({ div: ui[`dButton${buttonNumber}`] });
    }
    let moveSent = await process(uname, table, buttonNumber);
    if (moveSent) await updateMain(true);
    DA.isProcessingMove = false;
  }
  return { setup, present, activate, process }
}

function dodogame() {
  function setup(table) {
    stdSetupGame(table);
  }
  async function process(uname, table) {
    let newTable = gtCopy(table);
    newTable.players[uname].score += 1;
    newTable.action = { plName: uname, step: newTable.step };
    await tableSaveUpdateFO(newTable);
    return true;
  }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    stdStatsScore(me, table);
    let dButton = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `${table.step}` })
    return { dTable, dButton, refresh: true };
  }
  async function activate(me, table, ui) {
    let { myTurn, spectating } = stdInstruction(me, table);
    if (spectating) return;
    if (!myTurn) {
      ui.dButton.disabled = true;
    } else {
      ignoreDoubleClick(ui.dButton, () => rsgEvalButton(me, me, table, ui));
    }
    stdBotMoves(bot => rsgEvalButton(bot, me, table, ui), table);
  }
  async function rsgEvalButton(uname, me, table, ui) {
    stdEvalShield();
    if (uname == me) {
      toggleItemSelection({ div: ui.dButton });
    }
    let moveSent = await process(uname, table);
    if (moveSent) await updateMain(true);
    DA.isProcessingMove = false;
  }
  return { setup, present, activate, process }
}

function emoticount() {
  function setup(table) {
    stdSetupGame(table);
    let fen = table.fen;
    fen.items = M.emokeys; // All emojis
    //table.pending_actions = {};
    renewSet(fen, table.options.min, table.options.max);
  }

  function renewSet(fen, min, max) {
    let keys = rChoose(fen.items, 4);
    let target = keys[0];
    let others = keys.slice(1);
    let list = [];
    let count = rNumber(2, 5); // The correct answer

    for (let i = 0; i < count; i++) list.push(target);
    while (list.length < 20) list.push(rChoose(others));

    fen.list = arrShuffle(list);
    fen.target = target;
    fen.correctCount = count;
    //console.log(target)
    fen.instruction = `must count how many`;

    fen.choices = [count, count + 1, count - 1, rNumber(1, 10)].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
  }

  async function process(uname, table, pickedCount) {
    console.log('process', uname)
    let success = (pickedCount == table.fen.correctCount);
    let action = { plName: uname, val: pickedCount, success };

    let res = await dbUpdateGameSync(uname, table, action);
    if (res.error) { console.error("Sync Error:", res.error); return; }

    if (res.status === 'completed') {
      // --- I AM THE ARCHITECT ---
      // 'res.moves' is a dictionary: { "Alice": {success:true...}, "Bob": {...} }
      console.log("All players have moved. Finalizing round...");

      let nextTable = gtCopy(table);
      let allMoves = res.moves;

      // 1. Integrate scores from the moves dictionary
      for (let name in allMoves) {
        let move = allMoves[name];
        if (nextTable.players[name] && move) {
          nextTable.players[name].score += (move.success ? 1 : -1);
        }
      }

      // 2. Generate next round
      renewSet(nextTable.fen);

      // 3. Prepare for next step
      nextTable.step += 1;
      nextTable.last_round_results = allMoves;
      nextTable.modified = getNow();

      // 4. ATOMIC SAVE & RESET
      // We use a special API call that saves the table AND clears the sync table
      await dbFinalizeRound(nextTable);

      // UI Refresh
      //await updateMain(true, nextTable);
    } else {
      // --- STILL WAITING ---
      //showWaitingShield(true);
    }

    await updateMain();

    //return await emoProcess(me,table,pickedCount);
  }

  function present(me, table) { return emoPresent(me, table); }

  async function activate(me, table, ui) {
    let { myTurn, spectating } = stdInstruction(me, table);
    //console.log(table.turn,table.pending)

    let x = mKey(table.fen.target, 'dInstruction', { maleft: 5 }, { prefer: 'emoji' });
    //let html=`<div style="width: 22px; height: 22px; font-size: 18px; text-align: center; background-color: rgb(9, 147, 51); color: rgb(255, 255, 255); cursor: default; font-family: emoNoto; display: flex; flex-direction: column; justify-content: center; align-items: center;">${M.emo[target].html}</div>`;
    //fen.instruction = `must guess how many ${html}?`;

    if (spectating) return;

    // If I have already moved in this step, show the shield immediately
    // let pending = table.pending_actions; // || {};
    // if (pending[me]) {
    //   //showMessage('WAIT!!!!')
    //   showWaitingShield(true, "You already answered! Waiting for others...");
    //   // Start polling if we aren't already
    //   //startPolling(table.id, table.step);
    //   return;
    // } else showWaitingShield(false);


    for (let b of ui.buttons) {
      mStyle(b, { cursor: 'pointer' });
      b.onclick = () => rsgEval(me, table, b.getAttribute('val'));
    }
  }

  async function rsgEval(me, table, val) {
    DA.isProcessingMove = true;
    stdEvalShield(); // Block UI
    //console.log(jsCopy(table.pending_actions), me)
    //console.log('______________rsgEval', me, table, val);
    let res = await process(me, table, val);
    //console.log('table',res)
    if (res) await updateMain(true, res);
    DA.isProcessingMove = false;
  }

  return { setup, present, activate, process };
}
function emoPresent(me, table) {

  //console.log('___present', '\nplayer', me, '\nturn', table.turn, '\npending', table.pending, '\nstep', table.step)
  let dTable = stdPresentBGATable(me, table, 500, 'velvet');
  showTitleGame(me, table); mDom('dTitleMiddle', {}, { html: `step ${table.step}` })
  stdStatsScore(me, table);

  let fen = table.fen;
  // Display the target instruction
  //mDom(dTable, { fz: 30, color: 'white', align: 'center', matop: 10 }, { html: `How many ${fen.target}?` });

  // Display the grid
  let dParent = mDom(dTable, { w: 500, h: 400, matop: 20 });
  mFit(fen.list, dParent, false);
  mLinebreak(dTable, 20);


  // Display the choice buttons at the bottom
  let dChoices = mDom(dTable, { display: 'flex', 'justify-content': 'center', matop: 20 });
  let buttons = [];
  for (let c of fen.choices) {
    let b = mDom(dChoices, { cursor: 'pointer', bg: 'orange', padding: 15, margin: 10, round: 5, fz: 24, w: 60, align: 'center', family: 'blackops' }, { html: c, val: c });
    buttons.push(b);
  }

  return { dTable, buttons };
}

function simplegame() {
  function setup(table) {
    stdSetupGame(table, 'taketurns');
    let fen = table.fen;
    fen.deck = c52Deck();
    fen.trick = [];
    for (const plName in table.players) {
      let pl = table.players[plName];
      pl.hand = deckDeal(fen.deck, 5);
    }
  }
  async function process(uname, table, key) { }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    stdStatsScore(me, table);
    let dOpenTable = mDom(dTable, { align: 'center', bg: 'red', round: true, w: 300, h: 300 })
    return { dTable, dOpenTable, refresh: true };
  }
  async function activate(me, table, ui) { }
  return { setup, process, present, activate };
}

//#endregion

//#region bau1


function bluff() {
  const rankstr = '3456789TJQKA2';
  const suitstr = 'CDSH';
  function setup(table) {
    let fen = table.fen = {};
    let options = table.options;
    let plNames = Object.keys(table.players);
    let num_cards_needed = plNames.length * table.options.max_handsize;
    let num_decks_needed = fen.num_decks = Math.ceil(num_cards_needed / 52);
    let deck = fen.deck = c52Decks(num_decks_needed);
    arrShuffle(deck);
    let handsize = options.min_handsize;
    for (const name in table.players) {
      let pl = table.players[name];
      pl.hand = cDeckDeal(deck, handsize);
      pl.handsize = handsize;
    }
    table.plorder = jsCopy(plNames);
    arrShuffle(table.plorder);
    table.turn = [table.plorder[0]];
    fen.movetype = 'turn';
    fen.stage = 0;
  }
  async function process(me, table, movetype) {
    if (movetype == 'bid') {
      return await processBid(me, table);
    } else if (movetype == 'gehtHoch') {
      return await processGehtHoch(me, table);
    } else {
      return false;
    }
  }
  async function processStage1(table) {
    let newTable = gtCopy(table);
    newTable.fen.stage = 0;
    for (const plName in newTable.players) {
      delete newTable.players[plName].lastbid;
    }
    delete newTable.fen.lastbid;
    delete newTable.fen.lastbidder;
    delete newTable.fen.war_drin;
    delete newTable.fen.oldbid;
    delete newTable.fen.newbid;
    delete newTable.fen.aufheber;
    delete newTable.fen.loser;
    delete newTable.fen.bidder;

    await tableSaveUpdate(newTable);
    return true;
  }
  async function processBid(me, table) {
    //console.log('processBid',me,table.fen.newbid)
    let newTable = gtCopy(table);
    let fen = newTable.fen;
    let players = newTable.players;
    //console.log(fen)
    let oldbid = jsCopy(fen.oldbid);
    let bid = jsCopy(fen.newbid);
    //console.log(oldbid, bid)
    bid = normalize_bid(bid);
    let higher = is_bid_higher_than(bid, oldbid);
    if (bid[2] == 0) bid[2] = '_';
    if (!higher) {
      return false;
    } else {
      fen.lastbid = players[me].lastbid = bid;
      fen.lastbidder = me;
      delete fen.oldbid; delete fen.newbid;
      newTable.turn = [arrNext(newTable.plorder, me)];
      await tableSaveUpdate(newTable);
      return true;
    }
  }
  async function processGehtHoch(me, table) {
    let newTable = gtCopy(table);
    let fen = newTable.fen;
    let players = newTable.players;
    table = newTable;
    let [bid, bidder] = [fen.lastbid, fen.lastbidder];
    let diff = calc_bid_minus_cards(table, bid);
    //console.log('diff', diff)
    let aufheber = me;
    let loser = diff > 0 ? bidder : aufheber;
    let war_drin = fen.war_drin = diff <= 0;
    let pl = table.players[loser];
    let loser_handsize = pl.handsize = Number(pl.handsize) + 1;
    let deck = fen.deck = c52Decks(fen.num_decks_needed); arrShuffle(fen.deck);
    for (const name in table.players) {
      let pl = table.players[name];
      pl.hand = cDeckDeal(deck, pl.handsize);
    }
    fen.stage = 1;
    let nextplayer;
    if (loser_handsize > table.options.max_handsize) {
      nextplayer = arrNext(table.plorder, loser)
      table.plorder = remove_player(table, loser);
      if (table.plorder.length < 2) {
        fen.winners = table.plorder;
        nextplayer = null;
        table.status = 'over';
      }
    } else {
      nextplayer = loser;
    }
    fen.loser = loser; fen.bidder = bidder; fen.aufheber = aufheber;
    table.turn = table.status == 'over' ? [] : [nextplayer];
    delete fen.lastbid; delete fen.lastbidder; delete fen.war_drin;
    delete fen.oldbid; delete fen.newbid;
    await tableSaveUpdate(newTable);
    return true;
  }
  function present(me, table) {
    //console.log(me, table.players)
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    let fen = table.fen;
    let stage = fen.stage;
    let ui = { dTable };
    let [sz, bg, fg, cimgborder] = [50, '#00000050', 'white', 'white'];
    statsInit(me, table, { sz, bg, fg, cimgborder });
    for (const plName in table.players) {
      let pl = table.players[plName];
      let d = mBy('dStat_' + plName);
      mStyle(d, { padding: 10 })
      let max = pl.handsize == table.options.max_handsize;
      let fg1 = fg == 'white' ? 'yellow' : 'red';
      let dhz = mDom(d, { fg: max ? fg1 : fg }, { html: `hand: ${pl.handsize}` });
      mLinebreak(d);
      let html = plName == fen.aufheber ? `<b>X</b>` : valf(pl.lastbid, ['_']).join(' ');
      let elem = mDom(d, { fg: fg1 }, { html });
      let szhand = getSizeNeeded(dhz);
      let sz = getSizeNeeded(elem);
      let w = Math.max(szhand.w + 20, sz.w + 20, 80);
      mLinebreak(d);
    }
    let dt = mDom('dTable', { pabottom: 20, w100: true, h100: true });
    let pl = me in table.players ? table.players[me] : table.players[table.turn[0]];
    mLinebreak(dt, 10);
    mText(stage == 1 ? "all players' cards: " : `${capitalize(pl.name)}'s hand: `, dt);
    mLinebreak(dt, 8);
    let cards = stage == 1 ? fen.akku : pl.hand;
    cards = cSort(cards, null, '23456789TJQKA');
    //let dcards = mDom(dt, { align: 'center', display: 'flex' });
    ui.cards = cards.map(x => uiTypeCard52(x, 150));
    cSplay(ui.cards, dt, 'right');
    if (stage == 1) {
      let message = `${fen.bidder}'s bid was ${fen.loser == fen.aufheber ? 'correct' : 'not correct'} - ${fen.loser} loses!!!`; // fen.aufheben + ' did not belive'
      mDom(dt, { fz: 20, maright: 20, matop: 20 }, { html: message });
      if (nundef(table.players[fen.loser])) {
        mDom(dt, { fz: 18, maright: 20, matop: 10 }, { html: `${fen.loser} is eliminated!!!` });
      }
      mLinebreak(dt, 20);
    }
    return ui;
  }
  async function activate(me, table, ui) {
    let fen = table.fen;
    let stage = fen.stage;
    let dt = ui.dTable;
    let myturn = table.turn.includes(me);
    let botturn = table.players[table.turn[0]].playmode == 'bot';

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
      b = normalize_bid(b);
      bids.push(b);

      console.log('realistic starting bid', b)
      let lb = normalize_bid(lowestPossibleBid(ralist));
      console.log('lowest possible bid', lb)

      bids.push(lb);
    } else {
      let b = generateComplexHigherBid(ralist, wildcards, lastbid);
      let bAlt = nextHigherBid(ralist, lastbid); bAlt = normalize_bid(bAlt);
      if (TESTING) {
        p = calculateBidProbability(ralist, wildcards, b);
        //conslog('bid', b, `probability: ${p}`);
      }
      let lastBitCorrect = calc_bid_minus_cards(table, lastbid) <= 0;
      let bCorrect = calc_bid_minus_cards(table, b) <= 0;
      let bAltCorrect = calc_bid_minus_cards(table, bAlt) <= 0;

      b = normalize_bid(b);
      bAlt = normalize_bid(bAlt);
      console.log('b', b)
      console.log('bAlt', bAlt)

      if (lastBitCorrect && bCorrect) {
        bids.push(b); console.log('1')
      } else if (!lastBitCorrect && !bCorrect) {
        bids.push(bAlt); bids.push('gehtHoch'); console.log('2');
      } else { bids.push(bAlt); bids.push(b); bids.push('gehtHoch'); console.log('3') }
    }

    // let x = findMinimalCorrectHigherBid(ralist, wildcards, lastbid);
    // let seq = bidSequence(x, ralist, wildcards, 5);
    // //bids.push(findMinimalCorrectHigherBid(ralist, wildcards, lastbid));
    // conslog(`___ wildcards: ${wildcards}`, ralist, seq)


    //show bid buttons
    if (TESTING && myturn) {
      mLinebreak(ui.dTable, 10)
      let db2 = mDom(ui.dTable);
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
    }

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
  async function bluffBid(me, table, ui) {
    stdEvalShield();
    let moveSent = await processBid(me, table);
    if (moveSent) { await updateMain(true); }
    else {
      mShieldOff();
      showMessage('the bid you entered is not high enough!');
    }
    DA.isProcessingMove = false;
  }
  async function gehtHoch(me, table, ui) {
    stdEvalShield();
    await processGehtHoch(me, table);
    await updateMain(true);
    DA.isProcessingMove = false;
  }
  function lowestPossibleBid(ralist) {
    const toword = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
    const rankOrder = '3456789TJQKA';

    /* Sort the entire ralist by its rankOrder index ascending to find the absolute lowest rank structural element */
    let sortedRalist = ralist.slice().sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
    let lowestRankItem = sortedRalist[0];

    /* Return exactly 1 of that lowest rank with an empty secondary component */
    return [
      1,
      toword[lowestRankItem.rank] || '_',
      '_',
      '_'
    ];
  }
  function nextHigherBid(ralist, bid) {
    const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
    const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
    const rankOrder = '3456789TJQKA';

    /* 1. Extract structural ranks available in the current game setup */
    let sortedRalist = ralist.slice().sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
    let availableRanks = sortedRalist.map(x => x.rank); // e.g., ['4', 'T', 'J', 'K']

    /* 2. Parse the incoming bid */
    let oldCount1 = Number(bid[0]) || 0;
    let oldRank1 = torank[bid[1]] || '_';
    let oldCount2 = bid[2] === '_' ? 0 : (Number(bid[2]) || 0);
    let oldRank2 = torank[bid[3]] || '_';
    let oldVolume = oldCount1 + oldCount2;

    /* 3. Systematically generate ALL structural bids up to an expanded volume tier */
    let allPossibleBids = [];

    // Loop through increasing volume tiers
    for (let totalVolume = 1; totalVolume <= 30; totalVolume++) {
      let tierBids = [];

      // Generate Single Bids [Volume, Rank, '_', '_']
      availableRanks.forEach(r1 => {
        tierBids.push({
          bid: [totalVolume, toword[r1], '_', '_'],
          volume: totalVolume,
          isSplit: false,
          rankIdx1: rankOrder.indexOf(r1),
          rankIdx2: -1
        });
      });

      // Generate Split Combo Bids [Count1, Rank1, Count2, Rank2]
      availableRanks.forEach(r1 => {
        availableRanks.forEach(r2 => {
          if (r1 === r2) return; // Ranks must stay unique

          for (let c1 = 1; c1 < totalVolume; c1++) {
            let c2 = totalVolume - c1;
            tierBids.push({
              bid: [c1, toword[r1], c2, toword[r2]],
              volume: totalVolume,
              isSplit: true,
              rankIdx1: rankOrder.indexOf(r1),
              rankIdx2: rankOrder.indexOf(r2)
            });
          }
        });
      });

      /* Sort this specific volume tier by your precise progression rules */
      tierBids.sort((a, b) => {
        // 1. Single bids naturally precede split combos within the same volume tier
        if (a.isSplit !== b.isSplit) return a.isSplit ? 1 : -1;
        // 2. Sort by the primary rank hierarchy index
        if (a.rankIdx1 !== b.rankIdx1) return a.rankIdx1 - b.rankIdx1;
        // 3. Sort by the secondary rank hierarchy index
        return a.rankIdx2 - b.rankIdx2;
      });

      allPossibleBids.push(...tierBids);
    }

    /* 4. Find the current bid index inside our ordered master list */
    let currentMatchIdx = allPossibleBids.findIndex(item => {
      let b = item.bid;
      return Number(b[0]) === oldCount1 &&
        torank[b[1]] === oldRank1 &&
        (b[2] === '_' ? 0 : Number(b[2])) === oldCount2 &&
        torank[b[3]] === oldRank2;
    });

    /* 5. Return the immediate next structural higher layout sequence step */
    if (currentMatchIdx !== -1 && currentMatchIdx + 1 < allPossibleBids.length) {
      return allPossibleBids[currentMatchIdx + 1].bid;
    }

    /* Fallback: If current bid is outside or exceeds generation matrix, increment volume */
    let fallbackRank = availableRanks[0] || '3';
    return [
      oldVolume + 1,
      toword[fallbackRank],
      '_',
      '_'
    ];
  }
  function calculateBidProbability(ralist, wildcards, bid) {
    const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };

    /* 1. Calculate total cards currently in play */
    /* Sum up the total values of all ranks + the wildcards */
    let totalCardsInPlay = ralist.reduce((sum, item) => sum + (Number(item.value) || 0), 0) + Number(wildcards);

    if (totalCardsInPlay === 0) return 0;

    const TOTAL_DECK_SIZE = 52;
    const WILDCARDS_IN_DECK = 4;
    const NATURALS_PER_RANK = 4;

    /* Parse the bid counts and ranks */
    let reqCount1 = Number(bid[0]) || 0;
    let rank1 = torank[bid[1]];
    let reqCount2 = bid[2] === '_' ? 0 : (Number(bid[2]) || 0);
    let rank2 = torank[bid[3]];

    /* Helper: Combinations formula nCr (n choose r) */
    function nCr(n, r) {
      if (r < 0 || r > n) return 0;
      if (r === 0 || r === n) return 1;
      let res = 1;
      for (let i = 1; i <= r; i++) {
        res = res * (n - r + i) / i;
      }
      return Math.round(res);
    }

    /* Helper: Hypergeometric probability */
    /* Probability of getting exactly 'k' successes in a sample of 'n' from a deck of 'N' with 'K' total successes available */
    function hypergeometric(k, n, K, N) {
      return (nCr(K, k) * nCr(N - K, n - k)) / nCr(N, n);
    }

    /* --- CASE 1: Single Rank Bid [Count1, Rank1, '_', '_'] --- */
    if (reqCount2 === 0 || rank2 === '_') {
      let matchingCardsInDeck = NATURALS_PER_RANK + WILDCARDS_IN_DECK; // 4 + 4 = 8
      let probabilityOfAtLeastReq = 0;

      /* Sum probabilities of getting at least reqCount1 matching cards */
      for (let k = reqCount1; k <= Math.min(matchingCardsInDeck, totalCardsInPlay); k++) {
        probabilityOfAtLeastReq += hypergeometric(k, totalCardsInPlay, matchingCardsInDeck, TOTAL_DECK_SIZE);
      }
      return Math.min(1, Math.max(0, probabilityOfAtLeastReq));
    }

    /* --- CASE 2: Split Rank Bid [Count1, Rank1, Count2, Rank2] --- */
    let totalMatchingBidCards = 0;

    /* If the two ranks are distinct, they pool their natural cards together with the wildcards */
    if (rank1 !== rank2) {
      totalMatchingBidCards = NATURALS_PER_RANK + NATURALS_PER_RANK + WILDCARDS_IN_DECK; // 4 + 4 + 4 = 12
    } else {
      totalMatchingBidCards = NATURALS_PER_RANK + WILDCARDS_IN_DECK; // 4 + 4 = 8
    }

    let totalRequiredCards = reqCount1 + reqCount2;
    let probabilityOfSplit = 0;

    /* Sum probabilities of hitting the total target combined card count */
    for (let k = totalRequiredCards; k <= Math.min(totalMatchingBidCards, totalCardsInPlay); k++) {
      probabilityOfSplit += hypergeometric(k, totalCardsInPlay, totalMatchingBidCards, TOTAL_DECK_SIZE);
    }

    return Math.min(1, Math.max(0, probabilityOfSplit));
  }
  function createRankList(plName, table) {
    let pl = table.players[plName];
    let all_hand_cards = [];

    for (const name in table.players) {
      all_hand_cards = all_hand_cards.concat(table.players[name].hand);
    }

    let getCardRank = (card) => {
      let r = card.length === 3 ? card.substring(0, 2) : card[0];
      return r === '10' ? 'T' : r;
    };

    let wildcards = all_hand_cards.filter(c => getCardRank(c) === '2').length;
    let globalRanks = {};
    all_hand_cards.forEach(card => {
      let r = getCardRank(card);
      if (r !== '2') { globalRanks[r] = (globalRanks[r] || 0) + 1; }
    });

    const rankOrder = '3456789TJQKA';
    let myRanks = pl.hand.map(c => getCardRank(c));

    let ralist = rankOrder.split('').map(r => {
      let globalNaturalCount = globalRanks[r] || 0;
      let isMine = myRanks.includes(r);
      let irank = rankOrder.indexOf(r);

      return {
        rank: r,
        value: globalNaturalCount,
        mine: isMine,
        irank: irank,
        i: irank + 100 * (globalNaturalCount + wildcards)
      };
    });

    ralist.sort((a, b) => b.i - a.i);
    return { ralist, wildcards };

  }
  function createRealisticRandomStartingBid(table, ralist, wildcards) {
    const toword = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
    const rankOrder = '3456789TJQKA';

    /* 1. Calculate how many total wildcards are floating around */
    let sampleItem = ralist[0];
    let itemI = Number(sampleItem.i) || 0;
    let itemIrank = Number(sampleItem.irank) || 0;
    let itemValue = Number(sampleItem.value) || 0;

    /* 2. Determine a realistic quantity anchor */
    let num = wildcards + itemValue;
    let plausible = table.plorder.length / 3;
    if (itemValue > plausible) {
      num -= Math.ceil(Math.random() * plausible);
    }

    /* 3. 40% of the time pick a random rank entirely independent of what players actually hold */
    let rank = toword[ralist[0].rank];
    if (coin(40)) {
      let randomIdx = Math.floor(Math.random() * rankOrder.length);
      rank = toword[rankOrder[randomIdx]];
      num--;
    }

    /* FIXED: Enforce that the primary count is ALWAYS at least 1 */
    if (num < 1) num = 1;

    /* 4. Construct a standard valid single-rank starting bid layout */
    /* (If a secondary count is ever added here later, ensure it uses Math.max(1, count2)) */
    return [
      num,
      rank,
      '_',
      '_'
    ];
  }
  function generateComplexHigherBid(ralist, wildcards, currentBid) {
    const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
    const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
    const rankOrder = '3456789TJQKA';

    /* --- PART 1: PARSE CURRENT BID --- */
    let count1 = currentBid[0] === '_' ? 0 : Number(currentBid[0]);
    let rankWord1 = currentBid[1];
    let count2 = currentBid[2] === '_' ? 0 : Number(currentBid[2]);
    let rankWord2 = currentBid[3];

    let symbol1 = torank[rankWord1] || '_';
    let symbol2 = torank[rankWord2] || '_';

    /* --- PART 2: ANALYZE ASSETS --- */
    let activeRanks = ralist.filter(x => x.value >= 1);
    activeRanks.sort((a, b) => b.value - a.value);

    let bestRankItem = activeRanks[0] || ralist[0];
    let secondBestRankItem = activeRanks[1] || ralist[1] || bestRankItem;

    /* Helper to step up a rank while avoiding a collision with a restricted rank */
    function getNextUniqueRankSymbol(currentSym, restrictedSym) {
      if (currentSym === '_') return rankOrder[0] === restrictedSym ? rankOrder[1] : rankOrder[0];
      let idx = rankOrder.indexOf(currentSym);
      if (idx === -1 || idx === rankOrder.length - 1) return null;

      let nextSym = rankOrder[idx + 1];
      if (nextSym === restrictedSym) {
        if (idx + 2 < rankOrder.length) {
          return rankOrder[idx + 2];
        }
        return null;
      }
      return nextSym;
    }

    function isValidHigher(testBidArr) {
      try {
        if (typeof is_bid_higher_than === 'function') {
          return is_bid_higher_than(
            [Number(testBidArr[0]) || 0, torank[testBidArr[1]], testBidArr[2] === '_' ? 0 : Number(testBidArr[2]), torank[testBidArr[3]]],
            [count1, symbol1, count2, symbol2]
          );
        }
      } catch (e) { }
      return false;
    }

    /* --- CRITICAL CHECK: ENFORCE OPTION A BEFORE FAILING --- */
    if (count2 === 0 || rankWord2 === '_') {
      let targetSecRank = secondBestRankItem.rank === symbol1
        ? ralist.find(x => x.rank !== symbol1)?.rank || symbol1 == 'A' ? 'K' : 'A'
        : secondBestRankItem.rank;
      let targetSecCount = secondBestRankItem.value > 0 ? secondBestRankItem.value : 1;

      let optionABid = [count1, rankWord1, targetSecCount, toword[targetSecRank]];

      if (isValidHigher(optionABid)) {
        return optionABid;
      }
    }

    /* --- PART 3: STANDARD STRATEGY POOL --- */
    let strategyPool = [];

    // Strategy B: Increase count 1
    strategyPool.push(() => [count1 + 1, rankWord1, currentBid[2], rankWord2]);

    // Strategy C: Switch components
    if (count2 > 0 && rankWord2 !== '_') {
      strategyPool.push(() => [count2, rankWord2, count1, rankWord1]);
    }

    // Strategy D1: Increase rank 1 (keeps ranks unique)
    let upSymbol1 = getNextUniqueRankSymbol(symbol1, symbol2);
    if (upSymbol1) {
      strategyPool.push(() => [count1, toword[upSymbol1], currentBid[2], rankWord2]);
    }

    // Strategy D2: Increase rank 2 (keeps ranks unique)
    if (count2 > 0 && rankWord2 !== '_') {
      let upSymbol2 = getNextUniqueRankSymbol(symbol2, symbol1);
      if (upSymbol2) {
        strategyPool.push(() => [count1, rankWord1, count2, toword[upSymbol2]]);
      }
    }

    /* Select and execute a random strategy */
    let primaryMutator = strategyPool[Math.floor(Math.random() * strategyPool.length)] || (() => [count1 + 1, rankWord1, currentBid[2], rankWord2]);
    let mutatedBid = primaryMutator();

    /* Optional combo layering (30% chance) */
    // if (Math.random() < 0.3) {
    //   let mSymbol1 = torank[mutatedBid[1]];
    //   let mSymbol2 = torank[mutatedBid[3]];

    //   if (mutatedBid[2] === '_' || mutatedBid[2] === 0) {
    //     if (Math.random() > 0.5) {
    //       mutatedBid[0] += 1;
    //     } else {
    //       let nextSym = getNextUniqueRankSymbol(mSymbol1, mSymbol2);
    //       if (nextSym) mutatedBid[1] = toword[nextSym];
    //     }
    //   } else {
    //     if (Math.random() > 0.5) {
    //       mutatedBid[0] += 1;
    //     } else {
    //       let nextSym = getNextUniqueRankSymbol(mSymbol2, mSymbol1);
    //       if (nextSym) mutatedBid[3] = toword[nextSym];
    //     }
    //   }
    // }

    /* --- PART 4: FINAL VALIDATION & EMERGENCY CEILING --- */
    if (isValidHigher(mutatedBid)) {
      return mutatedBid;
    }

    /* Fallback check Option A */
    if (count2 === 0 || rankWord2 === '_') {
      let targetSecRank = secondBestRankItem.rank === symbol1 ? ralist.find(x => x.rank !== symbol1)?.rank || 'A' : secondBestRankItem.rank;
      let targetSecCount = secondBestRankItem.value > 0 ? secondBestRankItem.value : 1;
      let optionABid = [count1, rankWord1, targetSecCount, toword[targetSecRank]];
      if (isValidHigher(optionABid)) {
        return optionABid;
      }
    }

    /* Ultimate fallback: Increment total volume cleanly using your best unique assets */
    let fallbackSecRank = secondBestRankItem.rank === bestRankItem.rank
      ? ralist.find(x => x.rank !== bestRankItem.rank)?.rank || 'A'
      : secondBestRankItem.rank;

    return [
      count1 + 1,
      toword[bestRankItem.rank],
      count2 > 0 ? count2 : 1,
      toword[fallbackSecRank]
    ];
  }
  function getRandomHigherRank(currentRankWord) {
    const toword = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
    const torank = { three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
    const rankOrder = '3456789TJQKA';

    /* Map the input word to its symbolic index */
    let currentRankSymbol = torank[currentRankWord];
    let currentIndex = rankOrder.indexOf(currentRankSymbol);

    /* If the rank is invalid, or it's already an Ace, there are no higher ranks available */
    if (currentIndex === -1 || currentIndex === rankOrder.length - 1) {
      return null;
    }

    /* Slice out all valid higher rank options */
    let higherSymbols = rankOrder.slice(currentIndex + 1).split('');

    /* Pick one completely at random */
    let randomSymbol = higherSymbols[Math.floor(Math.random() * higherSymbols.length)];

    return toword[randomSymbol];
  }
  function switchBidRanksIfHigher(bid) {
    const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
    const rankOrder = '3456789TJQKA';

    /* Extract the rank string components from the array */
    let rankWord1 = bid[1];
    let rankWord2 = bid[3];

    /* If there is no secondary rank (it's a single rank bid), return the bid as-is */
    if (rankWord2 === '_') {
      return [...bid];
    }

    /* Translate the words into symbol indices to verify mechanical priority rules */
    let idx1 = rankOrder.indexOf(torank[rankWord1]);
    let idx2 = rankOrder.indexOf(torank[rankWord2]);

    /* Swap the values if the second rank sits higher in the rank order hierarchy */
    if (idx2 > idx1) {
      return [
        bid[2],     /* Second count becomes the new primary count */
        rankWord2,  /* Second rank word becomes the new primary rank word */
        bid[0],     /* First count becomes the new secondary count */
        rankWord1   /* First rank word becomes the new secondary rank word */
      ];
    }

    /* Return a clean clone of the input configuration if no modifications are triggered */
    return [...bid];
  }
  return { setup, present, activate, process };
}







//#endregion

//#region bau2

function _spotit() {
  function setup(table) {
    let fen = table.fen = {};
    let options = table.options;
    let plNames = Object.keys(table.players);
    for (const name in table.players) {
      let pl = table.players[name];
      pl.score = 0;
    }
    table.plorder = jsCopy(plNames);
    arrShuffle(table.plorder);
    table.turn = [table.plorder[0]];
    fen.movetype = 'turn';
    fen.stage = 0;
    let me = U.name;
    fen.items = spotit_item_fen(table);
    console.log('fen.items', fen.items)
    if (nundef(options.mode)) options.mode = 'multi';
  }
  async function process(me, table, movetype) {
    if (movetype == 'bid') {
      return await processBid(me, table);
    } else if (movetype == 'gehtHoch') {
      return await processGehtHoch(me, table);
    } else {
      return false;
    }
  }
  function check_gameover() {
    for (const uname of Z.plorder) {
      let cond = get_player_score(uname) >= Z.options.winning_score;
      if (cond) { Z.fen.winners = [uname]; return Z.fen.winners; }
    }
    return false;
  }
  function state_info(dParent) { spotit_state(dParent); }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    let fen = table.fen;

    let ui = { dTable };

    spotit_present(dTable, me, table, ui);
    return { dTable };
  }
  async function activate(me, table, ui) {
    console.log('activate');
  }
  function stats(dParent) { spotit_stats(dParent); }
  function activate_ui() { spotit_activate(); }
  return { setup, activate, present, process };
}

function spotit_activate() {
  // nein das ist falsch!!!!!!
  //wenn ich der host bin, und es gibt bots, waehle 1 bot und setze timeout
  let [stage, uplayer, host, plorder, fen] = [Z.stage, Z.uplayer, Z.host, Z.plorder, Z.fen];

  if (stage == 'move' && uplayer == host && get_player_score(host) >= 1) {
    let bots = plorder.filter(x => fen.players[x].playmode == 'bot');
    if (isEmpty(bots)) return;
    let bot = rChoose(bots);
    TO.main = setTimeout(() => spotit_move(bot, true), rNumber(2000, 9000));
  }
}
function spotit_stats(d) {
  let players = Z.fen.players;
  let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
  for (const plname of get_present_order()) {
    let pl = players[plname];
    let onturn = Z.turn.includes(plname);
    let sz = 50; //onturn?100:50;
    //let border = onturn ? plname == Z.uplayer ? 'solid 5px lime' : 'solid 5px red' : 'solid medium white';
    // let border = plname == Z.uplayer ? 'solid 5px lime' : 0;
    // let border = plname == Z.uplayer ?pl.playmode == 'bot'? 'double 5px lime':'solid 5px lime' : 0;
    let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
    let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
    let rounding = pl.playmode == 'bot' ? '0px' : '50%';
    let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);
  }
}
function spotit_state(dParent) {
  let user_html = get_user_pic_html(Z.uplayer, 30);
  let msg = Z.stage == 'init' ? `getting ready...` : `player: ${user_html}`;
  dParent.innerHTML = `Round ${Z.round}:&nbsp;${msg} `;
}

function calc_syms(numSyms) {
  //should return [rows,cols,colarr]
  let n = numSyms, rows, realrows, colarr;
  if (n == 3) { rows = 2; realrows = 1; colarr = [1, 2]; }
  else if (n == 4) { rows = 2; realrows = 2; colarr = [2, 2]; }
  else if (n == 5) { rows = 3; realrows = 3; colarr = [1, 3, 1]; }
  else if (n == 6) { rows = 3.3; realrows = 3; colarr = [2, 3, 1]; }
  else if (n == 7) { rows = 3; realrows = 3; colarr = [2, 3, 2]; } //default
  else if (n == 8) { rows = 3.8; realrows = 4; colarr = [1, 3, 3, 1]; }
  else if (n == 9) { rows = 4; realrows = 4; colarr = [2, 3, 3, 1]; }
  else if (n == 10) { rows = 4; realrows = 4; colarr = [2, 3, 3, 2]; }
  else if (n == 11) { rows = 4.5; realrows = 4; colarr = [2, 3, 4, 2]; }
  else if (n == 12) { rows = 5; realrows = 5; colarr = [1, 3, 4, 3, 1]; }
  else if (n == 13) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 1]; }
  else if (n == 14) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 2]; }
  else if (n == 15) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 3, 2]; }
  else if (n == 16) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 4, 2]; }
  else if (n == 17) { rows = 5.5; realrows = 5; colarr = [2, 4, 5, 4, 2]; } //17
  else if (n == 18) { rows = 5.8; realrows = 5; colarr = [2, 4, 5, 4, 3]; } //18

  // // console.log('...numSyms,rows,cols', numSyms, rows, cols);
  // if (![9,11,13].includes(n)) colarr = _calc_hex_col_array(rows, realrows);

  // //correction for certain perCard outcomes:
  // if (rows == 3 && realrows == 1) { colarr = [1, 3, 1]; } //5
  // else if (rows == 2 && realrows == 1) { colarr = [1, 2]; } //3
  // else if (rows == 4 && realrows == 1) { rows = 3.3; colarr = [2, 3, 1]; } //6
  // else if (rows == 5 && realrows == 1) { rows = 4; realrows = 1; colarr = [1, 3, 3, 1]; } //8
  // else if (rows == 5 && realrows == 3) { rows = 5; realrows = 1; colarr = [1, 3, 4, 3, 1]; } //12
  // else if (rows == 6 && realrows == 2) { rows = 5.5; colarr = [2, 4, 5, 4, 2]; } //17
  // else if (rows == 6 && realrows == 3) { rows = 5.8; colarr = [2, 4, 5, 4, 3]; } //18

  // console.log('colarr',jsCopy(colarr));
  return [rows, realrows, colarr];
}
function find_shared_keys(keylist, keylists) {
  let shared = [];
  for (const keylist2 of keylists) {
    for (const key of keylist) {
      if (keylist2.includes(key)) {
        shared.push(key);
      }
    }
  }
  return shared;
}
function modify_item_for_adaptive(item, items, n) {

  item.numSyms = n;
  [item.rows, item.cols, item.colarr] = calc_syms(item.numSyms);

  //need to find shared symbol
  let other_items = items.filter(x => x != item);
  let shared_syms = find_shared_keys(item.keys, other_items.map(x => x.keys));
  let other_symbols = item.keys.filter(x => !shared_syms.includes(x));
  item.keys = shared_syms;
  let num_missing = item.numSyms - item.keys.length;
  item.keys = item.keys.concat(rChoose(other_symbols, num_missing));
  shuffle(item.keys);
  item.scales = item.keys.map(x => rChoose([1, .75, 1.2, .9, .8]));
}
function _spotit_create_sample(numCards, numSyms, vocab, lang, min_scale, max_scale) {
  lang = valf(lang, 'E');
  let [rows, cols, colarr] = calc_syms(numSyms);

  //from here on, rows ONLY determines symbol size! colarr is used for placing elements

  let perCard = arrSum(colarr);
  let nShared = (numCards * (numCards - 1)) / 2;
  let nUnique = perCard - numCards + 1;
  let numKeysNeeded = nShared + numCards * nUnique;
  let nMin = numKeysNeeded + 3;
  //lang = 'D';
  let keypool = setKeys({ nMin: nMin, lang: valf(lang, 'E'), key: valf(vocab, 'animals'), keySets: KeySets, filterFunc: (_, x) => !x.includes(' ') });
  //console.log('keys', keypool);

  let keys = choose(keypool, numKeysNeeded);
  let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
  let uniqs = keys.slice(nShared);
  //console.log('numCards', numCards, '\nperCard', perCard, '\ntotal', keys.length, '\ndupls', dupls, '\nuniqs', uniqs);

  let infos = [];
  for (let i = 0; i < numCards; i++) {
    let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
    //console.log('card unique keys:',card.keys);
    let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr, num_syms: perCard };
    infos.push(info);
  }

  let iShared = 0;
  for (let i = 0; i < numCards; i++) {
    for (let j = i + 1; j < numCards; j++) {
      let c1 = infos[i];
      let c2 = infos[j];
      let dupl = dupls[iShared++];
      c1.keys.push(dupl);
      c1.shares[c2.id] = dupl;
      c2.shares[c1.id] = dupl;
      c2.keys.push(dupl);
      //each gets a shared card
    }
  }

  for (const info of infos) { shuffle(info.keys); }

  //for each key make a scale factor
  //console.log('min_scale',min_scale,'max_scale',max_scale);
  for (const info of infos) {

    // info.scales = info.keys.map(x => randomNumber(min_scale * 100, max_scale * 100) / 100);
    info.scales = info.keys.map(x => chooseRandom([.5, .75, 1, 1.2]));

    //chooseRandom([.5, .75, 1, 1.25]);
    //info.scales = info.scales.map(x=>coin()?x:-x);
  }

  //console.log(card.scales);
  for (const info of infos) {
    let zipped = [];
    for (let i = 0; i < info.keys.length; i++) {
      zipped.push({ key: info.keys[i], scale: info.scales[i] });
    }
    info.pattern = fillColarr(info.colarr, zipped);
  }

  return infos;
}
function _spotit_item_fen(options) {
  let o = {
    num_cards: valf(options.num_cards, 2),
    num_symbols: options.adaptive == 'yes' ? 14 : valf(options.num_symbols, 7),
    vocab: valf(options.vocab, 'lifePlus'),
    lang: 'E',
    min_scale: valf(options.min_scale, 0.75),
    max_scale: valf(options.max_scale, 1.25),
  };

  let items = spotit_create_sample(o.num_cards, o.num_symbols, o.vocab, o.lang, o.min_scale, o.max_scale);
  let item_fens = [];
  for (const item of items) {
    let arr = arrFlatten(item.pattern);
    let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
    item_fens.push(ifen);
  }

  let res = item_fens.join(',');
  //console.log('res', res);
  return res;

}
function _spotit_present(dt, me, table, ui) {
  let [fen, stage, uplayer] = [table.fen, table.fen.stage, me];

  mLinebreak(dt, 10);
  //console.log(fen)

  //console.log('fen.items', fen.items); //ex.: 'bird:0.5 shark:0.75 rat:0.75 dragon:0.5 bat:0.5 tomato:0.5 basket:1.2,crown:1.2 rocket:0.75 shark:1 tangerine:1 ladybug:1 owl:1.2 fly:1.2'
  let ks_for_cards = fen.items.split(',');
  let numCards = ks_for_cards.length;
  let items = fen.items = [];
  Items = [];
  let i = 0;
  for (const s of ks_for_cards) {
    let ks_list = s.split(' ');
    let item = {};
    item.keys = ks_list.map(x => stringBefore(x, ':'));
    item.scales = ks_list.map(x => stringAfter(x, ':')).map(x => Number(x));
    item.index = i; i++;
    let n = item.numSyms = item.keys.length;
    let [rows, cols, colarr] = calc_syms(item.numSyms);
    item.colarr = colarr;
    item.rows = rows;
    items.push(item);
  }

  fen.cards = [];
  let is_adaptive = table.options.adaptive == 'yes';
  let nsyms = is_adaptive ? cal_num_syms_adaptive(me, table) : table.options.num_symbols;
  nsyms = 9;//table.options.num_symbols;

  for (const item of items) {
    //an item is a card

    //adaptive mode
    if (is_adaptive) { modify_item_for_adaptive(item, items, nsyms); }

    // let card = spotit_card(item, dt, { margin: 20, padding: 10 }, spotit_interact);
    let card = spotit_card(item, dt, {}, spotit_interact);
    table.fen.cards.push(card);

    if (fen.stage == 'init') {
      face_down(card, GREEN, 'food');

      // let d=iDiv(card);
      // //cover div d with a div with black background
      // let dCover = card.live.dCover = mDiv(d,{background:GREEN,rounding:'50%',position:'absolute',width:'100%',height:'100%',left:0,top:0});
      // dCover.style.backgroundImage = 'url(/./base/assets/images/textures/food.png)';
      // //dCover.style.backgroundSize = '100% 100%';
      // dCover.style.backgroundRepeat = 'repeat';
      // //mStyle(iDiv(card),{opacity:.1,transition: 'opacity .5s' });
    }
    //console.log('card', card)
  }
  mLinebreak(dt, 10);


}
function spotit_find_shared(card, keyClicked) {
  let success = false, othercard = null;
  for (const c of Z.cards) {
    if (c == card) continue;
    if (c.keys.includes(keyClicked)) { success = true; othercard = c; }
  }
  return [success, othercard];
}
function spotit_interact(ev, key) {
  ev.cancelBubble = true;
  if (!uiActivated) { console.log('ui NOT activated'); return; }

  let keyClicked = evToProp(ev, 'key');
  let id = evToId(ev);

  if (isdef(keyClicked) && isdef(Items[id])) {
    let item = Items[id];
    let dsym = ev.target;
    let card = Items[id];

    //find if symbol is shared!
    let [success, othercard] = spotit_find_shared(card, keyClicked);
    spotit_move(Z.uplayer, success);
  }
}
function spotit_move(uplayer, success) {
  //console.log('g',g,'uname',uname,'success',success)
  if (success) {
    //console.log('success!',jsCopy(g.expected));
    inc_player_score(uplayer);
    //integrate all playerdata into fen!

    //fen score von diesem player sollte jetzt 1 sein
    assertion(get_player_score(uplayer) >= 1, 'player score should be >= 1');

    Z.fen.items = spotit_item_fen(Z.options);
    Z.state = { score: get_player_score(uplayer) };
    take_turn_spotit();

  } else {
    let d = mShield(dTable, { bg: '#000000aa', fg: 'red', fz: 60, align: 'center' });
    d.innerHTML = 'NOPE!!! try again!';
    TO.spotit_penalty = setTimeout(() => d.remove(), 2000);
  }
}
function spotit_read_all_scores() {
  if (nundef(Z.playerdata)) {
    Z.playerdata = [];
    for (const pl in Z.fen.players) {
      Z.playerdata.push({
        name: pl,
        state: { score: 0 },
      });
    }
  }
  for (const pldata of Z.playerdata) {
    let plname = pldata.name;
    let state = pldata.state;
    let score = !isEmpty(state) ? state.score : 0;
    let fenscore = lookupSet(Z.fen, ['players', plname, 'score'], score);
    //console.log('fenscore',fenscore,'pldata',pldata);
    Z.fen.players[plname].score = Math.max(fenscore, score);
  }

}













//#endregion

//#region bau3

function _spotit_present(dt, me, table, ui) {
  let [fen, stage, uplayer] = [table.fen, table.fen.stage, me];

  mLinebreak(dt, 10);
  console.log(fen.items)

  let items = Items = jsCopy(fen.items);
  let i = 0;
  for (const item of items) {
    item.index = i; i++;
  }

  fen.cards = [];
  // let is_adaptive = table.options.adaptive == 'yes';
  // let nsyms = is_adaptive ? cal_num_syms_adaptive(me,table) : table.options.num_symbols;
  // nsyms = 9;//table.options.num_symbols;

  for (const item of items) {
    //an item is a card

    //adaptive mode
    //if (is_adaptive) { modify_item_for_adaptive(item, items, nsyms); }

    // let card = spotit_card(item, dt, { margin: 20, padding: 10 }, spotit_interact);
    let card = spotit_card(item, dt, {}, spotit_interact);
    table.fen.cards.push(card);

    if (fen.stage == 'init') {
      face_down(card, GREEN, 'food');

      // let d=iDiv(card);
      // //cover div d with a div with black background
      // let dCover = card.live.dCover = mDiv(d,{background:GREEN,rounding:'50%',position:'absolute',width:'100%',height:'100%',left:0,top:0});
      // dCover.style.backgroundImage = 'url(/./base/assets/images/textures/food.png)';
      // //dCover.style.backgroundSize = '100% 100%';
      // dCover.style.backgroundRepeat = 'repeat';
      // //mStyle(iDiv(card),{opacity:.1,transition: 'opacity .5s' });
    }
    //console.log('card', card)
  }
  mLinebreak(dt, 10);

  console.log('fen cards:', fen.cards)


}








//#endregion

//#region bau4

function _arrangeShapesEvenlyCircle(containerSize, rectangles, dParent) {
  // let styles2 = { w: sz, h: sz, fz: sz * .8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }
  // let styles = { bg: 'red', w: uniformSize, h: uniformSize, box: true, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: gap };
  // let d0 = mDom(d2, styles, { key });
  // let d1 = mKey(key, d0, styles2, { key });

  const radius = containerSize / 2;

  // 1. Create the main parent container circle
  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.width = `${containerSize}px`;
  container.style.height = `${containerSize}px`;
  container.style.borderRadius = '50%';
  container.style.border = '2px solid #333';
  container.style.backgroundColor = '#f9f9f9';
  container.style.overflow = 'hidden';
  dParent.appendChild(container);

  const numRects = rectangles.length;
  if (numRects === 0) return container;

  // 2. Generate N mathematically ideal, area-proportional target slots using Fermat's Spiral
  const targetSlots = [];
  const goldenAngle = 137.5 * (Math.PI / 180); // The golden ratio angle for uniform distribution
  const borderPadding = containerSize * 0.06;  // Padding scales dynamically with circle size!
  const usableRadius = radius - borderPadding;

  for (let i = 0; i < numRects; i++) {
    // Standardizing distribution: 1 central element if count is low, or spread across the area fraction
    const rFraction = numRects === 1 ? 0 : Math.sqrt((i + 0.5) / numRects);
    const currentRadius = rFraction * usableRadius;
    const currentAngle = i * goldenAngle;

    targetSlots.push({
      x: radius + currentRadius * Math.cos(currentAngle),
      y: radius + currentRadius * Math.sin(currentAngle)
    });
  }

  // Sort rectangles from largest to smallest to optimize geometric center allocation
  const sortedRects = [...rectangles].sort((a, b) => (b.w * b.h) - (a.w * a.h));
  const finalizedNodes = [];

  // Helper function to calculate box intersection margins
  function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2, buffer) {
    return !(x1 + w1 / 2 + buffer < x2 - w2 / 2 ||
      x1 - w1 / 2 - buffer > x2 + w2 / 2 ||
      y1 + h1 / 2 + buffer < y2 - h2 / 2 ||
      y1 - h1 / 2 - buffer > y2 + h2 / 2);
  }

  // 3. Map Rectangles to Target Slots with Dynamic Local Shift Relaxation
  sortedRects.forEach((rectData) => {
    let placed = false;

    // Sort remaining available slots by proximity to the center of the card
    targetSlots.sort((a, b) => {
      const distA = Math.hypot(a.x - radius, a.y - radius);
      const distB = Math.hypot(b.x - radius, b.y - radius);
      return distA - distB;
    });

    for (let s = 0; s < targetSlots.length; s++) {
      const slot = targetSlots[s];

      // Look around the target slot in small expanding micro-rings if it's slightly crowded
      let localRadius = 0;
      const maxLocalShift = containerSize * 0.15; // Allow minor shifting to solve shape aspect ratio conflicts

      while (localRadius < maxLocalShift && !placed) {
        const microSteps = localRadius === 0 ? 1 : 12;
        for (let a = 0; a < microSteps; a++) {
          const microAngle = (a / microSteps) * Math.PI * 2;
          const testX = slot.x + localRadius * Math.cos(microAngle);
          const testY = slot.y + localRadius * Math.sin(microAngle);

          // Bound Check: Confirm corners stay inside card rim boundary
          const centerDist = Math.hypot(testX - radius, testY - radius);
          const cornerBound = Math.hypot(rectData.w / 2, rectData.h / 2);
          if (centerDist + cornerBound > radius - 10) continue;

          // Collision Check against already locked assets
          let collision = false;
          // Spacing dynamically stretches out on larger container sizes!
          const dynamicBuffer = containerSize * 0.035;

          for (let node of finalizedNodes) {
            if (checkCollision(testX, testY, rectData.w, rectData.h, node.x, node.y, node.w, node.h, dynamicBuffer)) {
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
              bg: rectData.bg || '#ff4757'
            });
            targetSlots.splice(s, 1); // Consume this slot layout zone
            placed = true;
            break;
          }
        }
        localRadius += 3; // Step outward locally
      }
      if (placed) break;
    }

    // Edge fallback: If an extreme aspect-ratio item fails placement, place it at the first available slot directly
    if (!placed && targetSlots.length > 0) {
      const fallbackSlot = targetSlots.shift();
      finalizedNodes.push({
        x: fallbackSlot.x,
        y: fallbackSlot.y,
        w: rectData.w * 0.9,
        h: rectData.h * 0.9,
        bg: rectData.bg || '#ff4757'
      });
    }
  });

  // 4. Render the perfectly spaced components to the DOM
  finalizedNodes.forEach((node) => {
    const rect = document.createElement('div');
    rect.style.position = 'absolute';
    rect.style.width = `${node.w}px`;
    rect.style.height = `${node.h}px`;
    rect.style.backgroundColor = node.bg;

    const leftPos = node.x - (node.w / 2);
    const topPos = node.y - (node.h / 2);

    rect.style.left = `${leftPos}px`;
    rect.style.top = `${topPos}px`;

    rect.style.borderRadius = '8px';
    rect.style.boxShadow = '0 3px 6px rgba(0,0,0,0.12)';

    container.appendChild(rect);
  });

  return container;
}

function spotit_item_fen(table) {
  let options = table.options;
  //console.log('HALLO')
  let num_cards = valf(options.num_cards, 2);
  let num_symbols = valf(options.num_symbols, 7); //options.adaptive == 'yes' ? 14 : valf(options.num_symbols, 7),
  let vocab = valf(options.vocab, 'objects');
  let keypool = flattenDictValues(M.emogroup[vocab]); //M.byCat.animal; //Object.keys(M.emo);

  let min_scale = num_symbols < 10 ? .75 : num_symbols > 11 ? .5 : .6; //valf(options.min_scale, 0.75),
  let max_scale = num_symbols < 10 ? 1.5 : num_symbols > 11 ? 1.2 : 1; //valf(options.max_scale, 1.25),

  // let items = spotit_create_sample(me, table, num_cards, num_symbols, min_scale, max_scale);
  // console.log(items);

  let nShared = (num_cards * (num_cards - 1)) / 2;
  let nUnique = num_symbols - num_cards + 1;
  let numKeysNeeded = nShared + num_cards * nUnique;

  if (keypool.length < numKeysNeeded) {
    console.warn(`Not enough symbols in M.objects (${keypool.length}) for the required ${numKeysNeeded} unique/shared keys.`);
  }

  let keys = rChoose(keypool, numKeysNeeded);
  let dupls = keys.slice(0, nShared); // these keys are shared between pairs of cards
  let uniqs = keys.slice(nShared);

  let infos = [];
  for (let i = 0; i < num_cards; i++) {
    let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
    let info = { id: getUID(), shares: {}, keys: keylist, num_syms: num_symbols };
    infos.push(info);
  }

  let iShared = 0;
  for (let i = 0; i < num_cards; i++) {
    for (let j = i + 1; j < num_cards; j++) {
      let c1 = infos[i];
      let c2 = infos[j];
      let dupl = dupls[iShared++];
      c1.keys.push(dupl);
      c1.shares[c2.id] = dupl;
      c2.shares[c1.id] = dupl;
      c2.keys.push(dupl);
    }
  }

  for (const info of infos) {
    shuffle(info.keys);
  }

  //console.log(min_scale, max_scale)

  // Generate scale factors for each key
  for (const info of infos) {
    // Restored the use of min_scale/max_scale parameters if you want dynamic ranges, 
    // or you can stick to the hardcoded array below.
    info.scales = info.keys.map(x => rChoose(range(min_scale, max_scale, .2))); //chooseRandom([0.5, .65, 0.75, .8, 1, 1, 1, 1.1, 1.15, 1.2, 1.3,]));
  }

  for (const info of infos) {
    let zipped = [];
    for (let i = 0; i < info.keys.length; i++) {
      zipped.push({ key: info.keys[i], scale: info.scales[i] });
    }
    info.zipped = zipped;
    // info.pattern = fillColarr(info.colarr, zipped);
  }

  return infos;

  assertion(false, '*THE END*')

  let item_fens = [];
  for (const item of items) {
    let arr = arrFlatten(item.pattern); console.log(arr)
    let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
    item_fens.push(ifen);
  }

  let res = item_fens.join('===');
  console.log('::::res', res, item_fens);
  return res;

}


function mRows100(dParent, spec, gap = 4) {
  let grid = mDom(dParent, { padding: gap, gap: gap, box: true, display: 'grid', h: '100%', w: '100%' })
  grid.style.gridTemplateRows = spec;
  let res = [];
  for (const i of range(stringCount(spec, ' ') + 1)) {
    let d = mDom(grid, { h: '100%', w: '100%', box: true })
    res.push(d);
  }
  return res;
}
function spotit_card(info, dParent, cardStyles, onClickSym) {
  console.log(info, dParent, cardStyles, onClickSym)
  Card.sz = 300;
  copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);
  let card = cRound(dParent, cardStyles, info); console.log('!!!!!!!!!!!!', card)

  addKeys(info, card);
  card.faceUp = true;
  console.log('info', info, '\ncard', card);
  //let d = iDiv(card);
  let zipped = card.zipped; //[];
  // for (let i = 0; i < card.keys.length; i++) {
  // 	zipped.push({ key: card.keys[i], scale: card.scales[i] });
  // }
  //card.pattern = fillColarr(card.colarr, zipped);

  // symSize: abhaengig von rows
  let sz = Card.sz / Math.sqrt(card.keys.length);
  // let symStyles = { sz: Card.sz / (card.rows + 1), fg: 'random', hmargin: 10, vmargin: 6, cursor: 'pointer' };
  let symStyles = { fg: 'random', hmargin: 10, vmargin: 6, cursor: 'pointer' };

  let syms = [];
  console.log('card', card);

  for (let i = 0; i < info.keys.length; i++) {
    let key = card.keys[i];
    let scale = rChoose([.25, .5, .75]); //card.scales[i];
    let styles = jsCopy(symStyles);
    styles.sz = sz * scale; styles.w = sz * scale; styles.h = sz * scale;


    let sym = mKey(key, iDiv(card), styles, {});
    card.live[key] = sym;
    sym.setAttribute('key', key);
    sym.onclick = ev => onClickSym(ev, key); //ev, sym, key, card);
    syms.push(sym);
  }

  // mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
  // for (let i = 0; i < info.keys.length; i++) {
  // 	let key = card.keys[i];
  // 	let sym = syms[i];
  // 	//console.log('key', key,'sym',sym);
  // 	card.live[key] = sym;
  // 	sym.setAttribute('key', key);
  // 	sym.onclick = ev => onClickSym(ev, key); //ev, sym, key, card);
  // }

  return card;
}

function mRowsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
  let d0 = mDom(dParent, { w100: true, h100: true, display: 'flex', dir: 'column', 'justify-content': 'space-between' });
  if (isdef(rowStyles)) mStyle(d0, rowStyles);
  for (let i = 0; i < arr.length; i++) {
    let content = arr[i];
    if (isList(content)) {
      let d1 = mDom(d0);
      mColsX(d1, content, itemStyles, rowStyles, colStyles, akku);
    } else {
      d1 = mContentX(content, d0, itemStyles);
      akku.push(d1);
    }
  }
}
function mColsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
  let d0 = mDom(dParent, { w100: true, h100: true, display: 'flex', 'justify-content': 'space-between' });
  if (isdef(colStyles)) mStyle(d0, colStyles);
  for (let i = 0; i < arr.length; i++) {
    let content = arr[i];
    if (isList(content)) {
      d1 = mDom(d0);
      mRowsX(d1, content, itemStyles, rowStyles, colStyles, akku);
    } else {
      d1 = mContentX(content, d0, itemStyles);
      akku.push(d1);
    }
  }
}
function mContent(content, dParent, styles) {
  let d1 = isdef(Syms[content]) ? mSymInDivShrink(content, dParent, styles) : mDom(dParent, styles, { html: content });
  return d1;
}
function mContentX(content, dParent, styles = { sz: Card.sz / 5, fg: 'random' }) {
  let [key, scale] = isDict(content) ? [content.key, content.scale] : [content, 1];
  if (scale != 1) { styles.transform = `scale(${scale},${Math.abs(scale)})`; }
  let dResult = mDom(dParent);
  let ds = mKey(key, dResult, styles);//isdef(Syms[key]) ? mSym(key, dResult, styles) : mDom(dResult, styles, {html:key});
  return dResult;
}

//#region ai trial 1
function _spotit_card(info, dParent, cardStyles, onClickSym) {
  Card.sz = 300;
  copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);

  // Ensure the card handles overflow gracefully and centers content
  cardStyles.display = 'flex';
  cardStyles['flex-direction'] = 'column';
  cardStyles['justify-content'] = 'space-around'; // Spaces rows out top-to-bottom
  cardStyles['align-items'] = 'center';
  cardStyles.padding = '20px'; // Keeps elements away from the edge of the circle
  cardStyles['box-sizing'] = 'border-box';

  let card = cRound(dParent, cardStyles, info.id);

  addKeys(info, card);
  card.faceUp = true;

  let zipped = [];
  for (let i = 0; i < card.keys.length; i++) {
    zipped.push({ key: card.keys[i], scale: card.scales[i] });
  }
  card.pattern = fillColarr(card.colarr, zipped);

  // Dynamic symbol size calculation based on rows
  let symSize = (Card.sz - 60) / (card.rows);
  let symStyles = { sz: symSize, fg: 'random', cursor: 'pointer' };

  let syms = [];

  // Call mRowsX using space-around to evenly distribute row fragments 
  mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'space-around' }, { 'justify-content': 'space-around' }, syms);

  for (let i = 0; i < info.keys.length; i++) {
    let key = card.keys[i];
    let sym = syms[i];
    if (sym) {
      card.live[key] = sym;
      sym.setAttribute('key', key);
      sym.onclick = ev => onClickSym(ev, key);
    }
  }

  return card;
}

function mRowsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
  // Removed hard h100:true to prevent compressed vertical collapsing
  let d0 = mDom(dParent, { w100: true, display: 'flex', 'flex-direction': 'column', 'justify-content': 'space-around', 'align-items': 'center' });
  if (isdef(rowStyles)) mStyle(d0, rowStyles);

  for (let i = 0; i < arr.length; i++) {
    let content = arr[i];
    if (isList(content)) {
      let d1 = mDom(d0, { w100: true, display: 'flex', 'justify-content': 'space-around' });
      mColsX(d1, content, itemStyles, rowStyles, colStyles, akku);
    } else {
      let d1 = mContentX(content, d0, itemStyles);
      akku.push(d1);
    }
  }
}

function mColsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
  let d0 = mDom(dParent, { display: 'flex', 'justify-content': 'space-around', 'align-items': 'center' });
  if (isdef(colStyles)) mStyle(d0, colStyles);

  for (let i = 0; i < arr.length; i++) {
    let content = arr[i];
    if (isList(content)) {
      let d1 = mDom(d0);
      mRowsX(d1, content, itemStyles, rowStyles, colStyles, akku);
    } else {
      let d1 = mContentX(content, d0, itemStyles);
      akku.push(d1);
    }
  }
}

//#endregion

//#region ai trial 2
function _spotit_card(info, dParent, cardStyles, onClickSym) {
  Card.sz = 300;
  copyKeys({ w: Card.sz, h: Card.sz, position: 'relative' }, cardStyles);
  let card = cRound(dParent, cardStyles, info.id);

  addKeys(info, card);
  card.faceUp = true;

  let totalSyms = info.keys.length;
  let dParentDiv = iDiv(card);
  let radius = Card.sz / 2;

  for (let i = 0; i < totalSyms; i++) {
    let key = info.keys[i];

    // 1. Calculate size dynamically (give them a slightly higher baseline to fill space)
    let scale = info.scales[i] || 1;
    let baseSz = Card.sz / 3.8;
    let currentSz = baseSz * scale;

    let x, y;

    // 2. Handle positioning layout dynamically
    if (totalSyms % 2 !== 0 && i === totalSyms - 1) {
      // Put the very last symbol (if odd) dead center with a small random nudge
      let nudgeX = (Math.random() - 0.5) * 15;
      let nudgeY = (Math.random() - 0.5) * 15;
      x = radius - (currentSz / 2) + nudgeX;
      y = radius - (currentSz / 2) + nudgeY;
    } else {
      // Distribute remaining symbols on alternating near/far distance rings
      // This allows symbols to overlap radial layers and fill the entire white area!
      let isEvenIndex = (i % 2 === 0);
      let distanceFactor = isEvenIndex ? 0.62 : 0.48;

      // Add a slight angular jitter so they don't look like a perfect machine clock
      let angle = (i / (totalSyms - (totalSyms % 2 !== 0 ? 1 : 0))) * Math.PI * 2;
      angle += (Math.random() - 0.5) * 0.2;

      // Max boundaries calculation to guarantee it never bleeds past the card edge
      let maxAllowedRadius = radius - (currentSz / 2) - 10; // 10px safety padding
      let targetRadius = radius * distanceFactor;
      let finalRadius = Math.min(targetRadius, maxAllowedRadius);

      x = radius + (finalRadius * Math.cos(angle)) - (currentSz / 2);
      y = radius + (finalRadius * Math.sin(angle)) - (currentSz / 2);
    }

    // 3. Build the absolute layout styles
    let symStyles = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      w: currentSz,
      h: currentSz,
      cursor: 'pointer',
      display: 'flex',
      'justify-content': 'center',
      'align-items': 'center'
    };

    let dResult = mDom(dParentDiv, symStyles);

    // Apply scale directly inside mKey or via CSS transform to avoid squeezing
    let ds = mKey(key, dResult, { sz: currentSz });

    // 4. Organic rotation (essential for making it feel like SpotIt!)
    //let randomRotation = Math.floor(Math.random() * 360);
    //dResult.style.transform = `rotate(${randomRotation}deg)`;

    card.live[key] = dResult;
    dResult.setAttribute('key', key);
    dResult.onclick = ev => onClickSym(ev, key);
  }

  return card;
}


//#endregion

//#region ai trial 3

function _spotit_card(info, dParent, cardStyles, onClickSym) {
  Card.sz = 300;
  copyKeys({ w: Card.sz, h: Card.sz, position: 'relative' }, cardStyles);
  let card = cRound(dParent, cardStyles, info.id);

  addKeys(info, card);
  card.faceUp = true;

  let totalSyms = info.keys.length;
  let dParentDiv = iDiv(card);
  let radius = Card.sz / 2;

  for (let i = 0; i < totalSyms; i++) {
    let key = info.keys[i];

    let scale = info.scales[i] || 1;
    let baseSz = Card.sz / 3.8;
    let currentSz = baseSz * scale;

    let targetX, targetY;

    // 1. Calculate the target CENTER point for the symbol
    if (totalSyms % 2 !== 0 && i === totalSyms - 1) {
      // Center of the card
      targetX = radius;
      targetY = radius;
    } else {
      // Distribute evenly along the perimeter rings
      let isEvenIndex = (i % 2 === 0);
      let distanceFactor = isEvenIndex ? 0.62 : 0.46;

      let angle = (i / (totalSyms - (totalSyms % 2 !== 0 ? 1 : 0))) * Math.PI * 2;

      let maxAllowedRadius = radius - (currentSz / 2) - 12;
      let targetRadius = radius * distanceFactor;
      let finalRadius = Math.min(targetRadius, maxAllowedRadius);

      targetX = radius + (finalRadius * Math.cos(angle));
      targetY = radius + (finalRadius * Math.sin(angle));
    }

    // 2. CORRECTION: Subtract half the symbol's size so (left, top) aligns from the center!
    let x = targetX - (currentSz / 2);
    let y = targetY - (currentSz / 2);

    // 3. Apply the perfectly centered coordinates
    let symStyles = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      w: currentSz,
      h: currentSz,
      cursor: 'pointer',
      display: 'flex',
      'justify-content': 'center',
      'align-items': 'center'
    };

    let dResult = mDom(dParentDiv, symStyles);
    let ds = mKey(key, dResult, { sz: currentSz });

    // 4. Subtle tilt layout
    let subtleTilt = (Math.random() - 0.5) * 20;
    dResult.style.transform = `rotate(${subtleTilt}deg)`;

    card.live[key] = dResult;
    dResult.setAttribute('key', key);
    dResult.onclick = ev => onClickSym(ev, key);
  }

  return card;
}


//#endregion

//#region ai trial 4

function _spotit_card(info, dParent, cardStyles, onClickSym) {
  Card.sz = 300;

  // Force position: relative so absolute coordinates calculate from the card edge
  copyKeys({ w: Card.sz, h: Card.sz, position: 'relative' }, cardStyles);
  let card = cRound(dParent, cardStyles, info.id);

  addKeys(info, card);
  card.faceUp = true;

  let totalSyms = info.keys.length;
  let dParentDiv = iDiv(card);

  // CRITICAL CSS FIX: Make absolutely sure the inner wrapper container is relative
  dParentDiv.style.position = 'relative';
  dParentDiv.style.width = '100%';
  dParentDiv.style.height = '100%';

  let radius = Card.sz / 2;

  for (let i = 0; i < totalSyms; i++) {
    let key = info.keys[i];

    // 1. Calculate base size uniform across symbols
    let baseSz = Card.sz / 4;

    let targetX, targetY;

    // 2. Compute Center Target coordinates
    if (totalSyms % 2 !== 0 && i === totalSyms - 1) {
      targetX = radius;
      targetY = radius;
    } else {
      let isEvenIndex = (i % 2 === 0);
      // Pushing items further out to use the maximum empty ring space
      let distanceFactor = isEvenIndex ? 0.68 : 0.52;

      let angle = (i / (totalSyms - (totalSyms % 2 !== 0 ? 1 : 0))) * Math.PI * 2;

      let maxAllowedRadius = radius - (baseSz / 2) - 8;
      let targetRadius = radius * distanceFactor;
      let finalRadius = Math.min(targetRadius, maxAllowedRadius);

      targetX = radius + (finalRadius * Math.cos(angle));
      targetY = radius + (finalRadius * Math.sin(angle));
    }

    // Centering alignment correction math
    let x = targetX - (baseSz / 2);
    let y = targetY - (baseSz / 2);

    // 3. Layout Styles
    let symStyles = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      w: baseSz,
      h: baseSz,
      cursor: 'pointer',
      display: 'flex',
      'justify-content': 'center',
      'align-items': 'center'
    };

    let dResult = mDom(dParentDiv, symStyles);
    let ds = mKey(key, dResult, { sz: baseSz });

    // 4. COMBINED TRANSFORM: Apply dynamic game scaling AND the subtle organic tilt together!
    let scale = info.scales[i] || 1.0;
    let subtleTilt = (Math.random() - 0.5) * 25; // 25 degree gentle variance rotation

    dResult.style.transform = `scale(${scale}) rotate(${subtleTilt}deg)`;
    dResult.style.transformOrigin = 'center center'; // Ensures items scale/tilt outward from center

    card.live[key] = dResult;
    dResult.setAttribute('key', key);
    dResult.onclick = ev => onClickSym(ev, key);
  }

  return card;
}

//#endregion

//#region ai trial 5
function _spotit_card(info, dParent, cardStyles, onClickSym) {
  Card.sz = 300;

  // 1. Set explicit layout constraints for the card container
  cardStyles = {};
  copyKeys({
    w: Card.sz,
    h: Card.sz,
    position: 'relative',
    display: 'inline-block' // Prevents the cards from collapsing into lines if placed side-by-side
  }, cardStyles);

  let card = cRound(dParent, cardStyles, info.id);

  addKeys(info, card);
  card.faceUp = true;

  let totalSyms = info.keys.length;
  let dParentDiv = iDiv(card);

  // 2. CRITICAL FIX: Force the inner target container to be a relative bounding box.
  // This guarantees that 'absolute' symbols stick to THIS card, not the screen edge.
  if (dParentDiv) {
    dParentDiv.style.position = 'relative';
    dParentDiv.style.width = `${Card.sz}px`;
    dParentDiv.style.height = `${Card.sz}px`;
    dParentDiv.style.display = 'block';
    dParentDiv.style.overflow = 'hidden'; // Keeps symbols smoothly tucked inside the circle boundaries
  }

  let radius = Card.sz / 2;

  for (let i = 0; i < totalSyms; i++) {
    let key = info.keys[i];

    // 3. Set a standard base size
    let baseSz = Card.sz / 4.2;

    let targetX, targetY;

    // 4. Spread layout coordinates evenly
    if (totalSyms % 2 !== 0 && i === totalSyms - 1) {
      targetX = radius;
      targetY = radius;
    } else {
      let isEvenIndex = (i % 2 === 0);
      let distanceFactor = isEvenIndex ? 0.65 : 0.48;

      let angle = (i / (totalSyms - (totalSyms % 2 !== 0 ? 1 : 0))) * Math.PI * 2;

      let maxAllowedRadius = radius - (baseSz / 2) - 10;
      let targetRadius = radius * distanceFactor;
      let finalRadius = Math.min(targetRadius, maxAllowedRadius);

      targetX = radius + (finalRadius * Math.cos(angle));
      targetY = radius + (finalRadius * Math.sin(angle));
    }

    // Centering alignment calculation
    let x = targetX - (baseSz / 2);
    let y = targetY - (baseSz / 2);

    // 5. Structure layout for the individual symbol wrappers
    let symStyles = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      w: baseSz,
      h: baseSz,
      cursor: 'pointer',
      display: 'flex',
      'justify-content': 'center',
      'align-items': 'center'
    };

    let dResult = mDom(dParentDiv, symStyles);
    let ds = mKey(key, dResult, { sz: baseSz });

    // 6. Apply spotit dynamic sizing scales and gentle organic rotations together
    let scale = info.scales[i] || 1.0;
    let subtleTilt = (Math.random() - 0.5) * 30; // Up to 15 degrees tilt either way

    dResult.style.transform = `scale(${scale}) rotate(${subtleTilt}deg)`;
    dResult.style.transformOrigin = 'center center';

    card.live[key] = dResult;
    dResult.setAttribute('key', key);
    dResult.onclick = ev => onClickSym(ev, key);
  }

  return card;
}







//#endregion

//#endregion

//#region bau5

//#endregion

function cal_num_syms_adaptive(me, table) {
  let [fen, players, uplayer] = [table.fen, table.players, me];
  let pl = players[uplayer];

  let by_score = dict2list(players);
  //console.log('players',players)
  //for (const pl of by_score) { pl.score = get_player_score(pl.name); }

  //calculate average score in by_score array
  let avg_score = 0;
  for (const pl of by_score) { avg_score += pl.score; }
  avg_score /= by_score.length;

  let di = { nasi: -3, gul: -3, sheeba: -2, mimi: -1, annabel: 1 };

  let baseline = valf(di[uplayer], 0);
  let dn = baseline + Math.floor(pl.score - avg_score);

  //console.log('uplayer',uplayer,'baseline', baseline, 'avg', avg_score, 'pl.score', pl.score, 'dn', dn);

  let n = table.options.num_symbols;

  //n+dn should be at least 4 and at most 14
  let nfinal = Math.max(4, Math.min(table.options.max_count, dn + n));
  return nfinal;
  //if (n + dn < 4) { dn = 4 - n; }
}

function flattenDictValues(dict) {
  return Object.values(dict).flat();
}

function fillColarr(colarr, items) {
  let i = 0;
  let result = [];
  for (const r of colarr) {
    let arr = [];
    for (let c = 0; c < r; c++) {
      arr.push(items[i]); i++;
    }
    result.push(arr);
  }
  return result;
}
function bluff_convert2ranks(b) { return [b[0], BLUFF.torank[b[1]], b[2] == '_' ? 0 : b[2], BLUFF.torank[b[3]]]; }

function bluff_convert2words(b) { return [b[0], BLUFF.toword[b[1]], b[2] < 1 ? '_' : b[2], BLUFF.toword[b[3]]]; }

function getPrioritizedSublist(ralist) {
  /* 1. Slice to create a copy so we don't accidentally mutate the original ralist */
  let sublist = ralist.slice();

  /* 2. Sort primarily by total value descending, then by hand ownership (mine) descending */
  sublist.sort((a, b) => {
    if (b.value !== a.value) {
      return b.value - a.value; /* Higher global card count comes first */
    }

    /* If values are identical, true (1) comes before false (0) */
    let mineA = a.mine ? 1 : 0;
    let mineB = b.mine ? 1 : 0;
    return mineB - mineA;
  });

  return sublist;
}
function INTERRUPT() { clearEvents(); assertion(false, '* THE END *'); }

function setgame() {
  function setup(table) {
    stdSetupGame(table);

    //make countdown relative among players
    let minCD = arrMin(Object.values(table.players), x => x.countdown);
    for (const plName in table.players) {
      table.players[plName].cdRel = table.options.use_levels == 'yes' ? table.players[plName].countdown - minCD : 0;

    }
    //Object.values(table.players).map(x => console.log(`${x.name}:${x.cdRel}`));

    let fen = table.fen;
    let nums = allNumbers(table.options.grid_size);
    fen.numCards = nums[0] * nums[1];
    fen.cols = nums[1];
    fen.deck = setCreateDeck(table.options.deck_size);
    fen.cards = deckDeal(fen.deck, fen.numCards);
    fen.correctSet = setFindOneSet(fen.cards);
  }
  async function rsgEval(uname, table, keys, m, bypass = false) {
    if (m == 0 || m == 3) {
      //wait number of cdRel seconds
      let pl = table.players[uname];
      if (pl.playmode == 'human' && pl.cdRel > 0 && !bypass) {
        mClear('dInstruction');
        DA.isProcessingMove = false;
        mTimerCreate('dInstruction', { fg: 'red', bg: 'yellow', align: 'center', border: 'red 2' },
          pl.cdRel * 1000, 'ss', async () => {
            DA.isProcessingMove = true;
            let moveSent = await process(uname, table, keys, m);
            if (moveSent) { DA.selectedItems = {}; await updateMain(true); }
            DA.isProcessingMove = false;
          }
        );
      } else if (pl.playmode == 'bot' && pl.name == U.name) {
        TO.bot = setTimeout(async () => {
          let moveSent = await process(uname, table, keys, m);
          if (moveSent) { DA.selectedItems = {}; await updateMain(true); }
          DA.isProcessingMove = false;
        }, 1000);
      } else {
        let moveSent = await process(uname, table, keys, m);
        if (moveSent) { DA.selectedItems = {}; await updateMain(true); }
        DA.isProcessingMove = false;
      }
    } else {
      DA.isProcessingMove = false;
    }
  }
  async function process(uname, table, keys, m) {
    let success, special = false;
    let newTable = gtCopy(table);
    let fen = newTable.fen;
    if (m == 0) {
      success = !fen.correctSet;
      if (success) {
        let newCards = deckDeal(fen.deck, 1);
        if (!isEmpty(newCards)) fen.cards.push(newCards[0]); else gtOverWinners(newTable);
      }
    } else if (m == 3) {
      success = setCheckIfSet(keys);
      special = setCheckIfSpecial(keys); console.log('special', special, table.options.special_set)
      if (success) {
        let toomany = Math.max(0, fen.cards.length - fen.numCards);
        let need = Math.max(0, 3 - toomany);
        let newCards = deckDeal(fen.deck, need);
        for (let i = 0; i < 3; i++) if (i < newCards.length) arrReplace1(fen.cards, keys[i], newCards[i]); else removeInPlace(fen.cards, keys[i]);
      }
    } else assertion(false, `setgame process mit m=${m}`);
    fen.correctSet = setFindOneSet(fen.cards);
    let bonus = special ? table.options.special_set : 0;
    newTable.players[uname].score += success ? 1 + bonus : -1;
    newTable.action = { plName: uname, keys, step: newTable.step, success, special };
    if (newTable.status == 'over') newTable.fen.winners = getPlayersWithMaxScore(newTable);
    await tableSaveUpdateFS(newTable);
    return true;
  }
  function setFindOneSet(cards) {
    for (var x = 0; x < cards.length; x++) {
      for (var y = x + 1; y < cards.length; y++) {
        for (var z = y + 1; z < cards.length; z++) {
          assertion(cards[x] != cards[y], `WTF!?!?!?! ${cards[x]} ${cards[y]}`)
          let keys = [cards[x], cards[y], cards[z]];
          if (setCheckIfSet(keys)) return keys;
        }
      }
    }
    return null;
  }
  function setCheckIfSet(keys) {
    let arr = makeArrayWithParts(keys);
    let isSet = arr.every(x => arrAllSameOrDifferent(x));
    return isSet;
  }
  function setCheckIfSpecial(keys) {
    let arr = makeArrayWithParts(keys);
    let isSet = arr.every(x => arrAllDifferent(x));
    return isSet;
  }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 1000, 'velvet');
    showTitleGame(me, table);
    stdStatsScore(me, table, { allowUserSwitch: true });
    let fen = table.fen;
    let wmax = 700;
    let w = window.innerWidth < wmax ? window.innerWidth : wmax;
    let dParent = mDom('dTable', { pabottom: 0, w, h100: true });
    let rows = fen.rows = Math.ceil(fen.cards.length / fen.cols);
    // let d1 = mDom(dParent, { padding: 0, maleft: 100, w: 500 }, { id: 'dTableButtons' });
    let d1 = mDom(dParent, {}, { id: 'dTableButtons' });
    let d2 = mDom(dParent, { w, }, { id: 'dTableCards' });
    let rect = getRectInt(d2);
    let gap = 10;
    let maxHeight = window.innerHeight - 100 - rect.y - 40 - (rows - 1) * gap;
    sz = calcCardSize(rows + 1, fen.cols, rect.w, maxHeight, 2);
    //console.log('card size', sz, 'rows,cols', rows, fen.cols, 'rect', rect, 'maxHeight', maxHeight);
    let dBoard = mGridOld(rows, fen.cols, d2, { gap });
    let items = [];
    mStyle(d1, { gap: sz.h })
    for (const c of fen.cards) {
      let dc = setDrawCard(c, dBoard, sz.h);
      let item = { div: dc, key: c, isSelected: false };
      items.push(item);
    }
    mLinebreak(d2, 20)
    if (isdef(table.oldfen)) {
      let d0 = mDom(dParent, { margin: 10, w100: true }); dParent = d0;
      let html = `
          <div id="grid-wrapper" style="text-align:left;" class="scale-wrapper">
              <div id="prevGrid" class="scale-content-grid">
              </div>
          </div>
        `;
      let d = mCreateFrom(html);
      mAppend(dParent, d);
      let dg = mBy('prevGrid');
      let col = '1fr';
      for (const i of range(fen.cols - 1)) col += ' 1fr';
      mStyle(dg, { 'grid-template-columns': col, bg: table.players[table.oldfen.name]?.color ?? 'dimgray', padding: 10, rounding: 10 });
      dg.innerHTML = '';
      let keys = table.action.keys;
      for (const c of table.oldfen.cards) {
        let dc = setDrawCardSmall(c, dg, 25);
        mClass(dc, 'grid-item')
        if (keys.includes(c)) { mStyle(dc, { bg: 'yellow_crayola' }); }
      }
    }

    if (table.status == 'over') {
      console.log('adjust levels here for next game!!!!!!!');
      let winners = table.fen.winners;
      console.log('winners', winners);
      for (const plName of winners) {
        table.players[plName].countdown += 1;
        //soll ich oder soll ich nicht diesen player raufsetzen?
      }
      table.fen.originalPlayers = table.players;
    }
    //if (lookup(table, ['action', 'success']) || !checkPlayerBusy()) mFall('dTable', 400)
    return { dTable, items, refresh: lookup(table, ['action', 'success']) || !checkPlayerBusy() };
  }
  async function activate(me, table, ui) {
    assertion(!isEmpty(table.fen.cards), 'activate setgame no cards!');
    let { myTurn, spectating } = stdInstruction(me, table);
    if (spectating) return;
    for (const item of ui.items) {
      let d = iDiv(item);
      d.setAttribute('key', item.key);
      mStyle(d, { cursor: 'pointer' });
      ignoreDoubleClick(d, () => evalItems(me, me, table, ui, [item]));
    }
    let d1 = mBy('dTableButtons'); if (nundef(d1)) return;
    mClass(d1, 'button_container');
    let hintNum = table.players[me].hint;
    mStyle(d1, { padding: 12, justifyContent: 'center' }); //hintNum==0 && !TESTING? 'center':'space-between' })
    let bNoSet = ui.bNoSet = mDom(d1, { w: 100 }, { tag: 'button', id: 'bNoSet', html: 'No Set' });
    bNoSet.onclick = ev => evalNoSet(me, me, table, ui, [bNoSet]);
    if (TESTING) ui.bCheat = mDom(d1, { w: 100 }, { tag: 'button', html: 'Cheat', onclick: () => onclickHintOrCheat(me, table, ui, 2) });

    if (hintNum > 0) ui.bHint = mDom(d1, { w: 100 }, { tag: 'button', id: 'bHint', html: 'Hint', onclick: () => onclickHintOrCheat(me, table, ui, hintNum) });

    //console.log('selected', DA.selectedItems)
    if (!isEmpty(Object.keys(DA.selectedItems))) { //!lookup(table, ['action', 'success']) && 
      console.log('HALLO!!!!!!!!!!!!!!!!!!!')
      let itemsCand = ui.items.filter(x => isdef(DA.selectedItems[x.key]));
      //need to disable timer here!

      let doEval = true;
      //if cards have been selected but some of them aren't there anymore, do NOT evalItems
      if (lookup(table, ['action', 'success'])) {
        let lastset = table.action.keys;
        //check that all these keys do not overlap with selectedItems
        let selectedKeys = Object.keys(DA.selectedItems);
        if (selectedKeys.some(x => lastset.includes(x))) {
          doEval = false;
        }
      }
      console.log('====>doEval', doEval)
      if (doEval) {
        await evalItems(me, me, table, ui, itemsCand, true);
        return;
      } else DA.selectedItems = {};

      //there was an overlap, so do NOT select!
    }

    stdBotMoves(async (bot) => await cheat(bot, me, table, ui, 3), table);
  }
  async function onclickHintOrCheat(me, table, ui, n) {
    if (ui.bCheat) disableButton(ui.bCheat);
    if (ui.bHint) disableButton(ui.bHint);
    await cheat(me, me, table, ui, n);
  }
  async function cheat(uname, me, table, ui, n) {
    let items = ui.items;
    for (const item of ui.items) {
      if (item.isSelected) toggleItemSelection(item);
    }
    let oset = table.fen.correctSet;
    if (!oset) {
      if (n < 3) ANIM.button = scaleAnimation(ui.bNoSet); else await evalNoSet(uname, me, table, ui);
    } else {
      let candidates = rChoose(oset, n);
      let itemsCand = items.filter(x => candidates.includes(x.key));
      await evalItems(uname, me, table, ui, itemsCand);
    }
  }
  async function evalItems(uname, me, table, ui, items, bypass = false) {
    DA.isProcessingMove = true;
    items.map(item => toggleItemSelection(item, uname == me ? 'framedPicture' : null));
    let selitems = ui.items.filter(x => x.isSelected);
    if (uname == me) DA.selectedItems = list2dict(selitems, 'key');
    let [keys, m] = [selitems.map(x => x.key), selitems.length];

    assertion(m <= 3, 'more than 3 items selected!!!!!');
    if (m == 3) {
      //console.log('3 items in evalItems!')
      stdEvalShield();
      await rsgEval(uname, table, keys, m, bypass);
    } else {
      DA.isProcessingMove = false;
      //stdBotMoves(async (bot) => await cheat(bot, me, table, ui, 3), table);
    }
  }
  async function evalNoSet(uname, me, table, ui) {
    stdEvalShield();
    toggleItemSelection(ui.bNoSet, uname == me ? 'framedPicture' : null)
    await rsgEval(uname, table, [], 0);
  }
  function setDrawCard(card, dParent, hCard = 100) {
    const paths = {
      diamond: "M25 0 L50 50 L25 100 L0 50 Z",
      squiggle: "M38.4,63.4c2,16.1,11,19.9,10.6,28.3c1,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z",
      oval: "M25,95C14.2,95,5.5,85.2,5.5,80V20C5.5,13.2,14.2,5.2,25,5.2S44.5,13.2,44.5,20v60 C44.5,85.2,35.8,95,25,95z"
    }
    let [color, shape, num, patt] = card.split('_');
    let wCard = hCard / .65;
    let wSymbol = wCard / 4;
    let hSymbol = 2 * wSymbol;
    let d0 = mDom(dParent, { display: 'flex', w: wCard, h: hCard, bg: 'white', rounding: 10 });
    mStyle(d0, { justifyContent: 'center', 'align-items': 'center', gap: 6 })
    for (const i of range(num)) {
      const patternId = injectStripedPattern(color);
      let fill = patt == 'striped' ? `url(#striped-${color})` : patt == 'solid' ? color : 'none'
      let html = `
        <svg viewBox="-2 -2 54 105" xmlns="http://www.w3.org/2000/svg">
          <path d="${paths[shape]}"
                fill="${fill}"
                stroke="${color}"
                stroke-width="4"
          />
        </svg>
      `;
      let d1 = mDom(d0, { h: hSymbol, w: wSymbol }, { html });
    }
    return d0;
  }
  function setFindAllSets(items) {
    let result = [];
    for (var x = 0; x < items.length; x++) {
      for (var y = x + 1; y < items.length; y++) {
        for (var z = y + 1; z < items.length; z++) {
          assertion(items[x] != items[y], `WTF!?!?!?! ${items[x].key} ${items[y].key}`)
          let list = [items[x], items[y], items[z]];
          let keys = list.map(x => x.key);
          if (setCheckIfSet(keys)) result.push(list);
        }
      }
    }
    let nonOverlappingSets = getNonOverlappingPlusOne(result);
    if (VERBOSE) {
      console.log('non-verlapping sets:', nonOverlappingSets.length)
      nonOverlappingSets.map(x => console.log(x[0].key, x[1].key, x[2].key));
    }
    if (isEmpty(result)) console.log('no set!')
    return result;
  }
  return { setup, present, activate, process, setFindAllSets }
}

function createGameTable(gamename, playerNames, options = {}, ploptions = {}) {
  if (nundef(playerNames)) playerNames = ['mimi', 'felix'];

  let defaults = M.config.games[gamename].options;
  //console.log('defaults', defaults);
  if (defaults) {
    for (const k in defaults) {
      if (nundef(options[k])) {
        let val = defaults[k];
        if (isString(val) && val.includes(',')) { val = val.split(','); val = val[val.length - 1].trim(); }
        options[k] = isNumber(val) ? Number(val) : val;
      }
    }
  }
  //console.log(options)
  let players = {};
  for (const name of playerNames.sort()) {
    players[name] = userToPlayer(name, gamename);
    let plo = ploptions[name];
    if (plo) copyKeys(plo, players[name])
  }

  let table = tableCreate(gamename, players, options);
  gtSetToStarted(table);
  return table;
}

function joinArgumentsToString(...args) {
  /* Helper function to format values cleanly on a single line */
  function formatValueInline(val) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';

    if (Array.isArray(val)) {
      return '[' + val.map(item => {
        if (typeof item === 'object' && item !== null) {
          return formatValueInline(item);
        }
        return String(item);
      }).join(', ') + ']';
    }

    if (typeof val === 'object') {
      let parts = [];
      for (let key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          let child = val[key];
          if (typeof child === 'object' && child !== null) {
            parts.push(`${key}: ${formatValueInline(child)}`);
          } else {
            parts.push(`${key}: ${String(child)}`);
          }
        }
      }
      return '{ ' + parts.join(', ') + ' }';
    }

    return String(val);
  }

  /* Process every main argument passed to the function */
  return args.map(arg => {
    /* If the main argument is a list of arrays or objects, format each child on its own new line */
    if (Array.isArray(arg) && arg.length > 0 && typeof arg[0] === 'object' && arg[0] !== null) {
      return arg.map(item => formatValueInline(item)).join('\n');
    }

    /* Otherwise, treat the entire argument as a standard flat structural block */
    return formatValueInline(arg);
  }).join('\n');
}
function conslog() {

  console.log(joinArgumentsToString(...arguments))
}




//#region alphabetical

function arrFromIndex(arr, i) { return arr.slice(i); }
function checkPlayerBusy() { return Object.values(DA.selectedItems).length > 0; }
function collectPlayers() {
  let players = {};
  for (const name of DA.playerList) {
    //players[name] = allPlToPlayer(name);
    let allPl = DA.allPlayers[name];
    //console.log(allPl,DA)
    players[name] = jsCopyExceptKeys(allPl, ['div', 'isSelected']);
  }
  return players;
}
function createPlayerOptionDialog(plName, gamename, dPlayer, label) {
  let dParent = mBy('dGameMenu');
  let poss = M.config.games[gamename].ploptions;
  if (!poss) return;
  //let bg = M.users[name].color; console.log(bg);
  let dPlOpts = mBy('dPlayerOptions');
  if (isdef(dPlOpts)) mClear(dPlOpts);
  else dPlOpts = mDom(dParent, { fg: 'black', bg: 'linen', border: `solid 2px ${'silver'}`, rounding: 6, display: 'inline-block', hPadding: 3 }, { id: 'dPlayerOptions' });
  mDom(dPlOpts, { maleft: 5, matop: -2 }, { html: label });
  let d = mDom(dPlOpts, { display: 'flex', justifyContent: 'center', flexWrap: 'wrap' });
  for (const [key, val] of Object.entries(poss)) {
    //console.log('setPlayerPlaying',key)
    if (!isString(val)) continue;
    let list = val.split(',');
    //console.log(key, val, list)
    let fs = mRadioGroup(d, { fg: 'black' }, `d_${key}`, formatLegend(key));
    let userval = lookup(DA.allPlayers, [plName, key]);
    let listLast = arrLast(list);
    for (const v of list) {
      let valTyped = isNumber(v) ? Number(v) : v;
      let radio = mRadio(v, valTyped, key, fs, { cursor: 'pointer' }, null, key, valTyped == userval || nundef(userval) && v == listLast);
      radio.firstChild.onchange = () => {
        lookupSetOverride(DA.allPlayers, [plName, key], valTyped);
        if (key === 'playmode') updateUserImageToBotHuman(plName, valTyped);
      };
    }
    measureFieldset(fs);
  }
  posCenteredAboveDiv(dParent, dPlayer, dPlOpts);
  const cleanup = () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  };
  const saveAndClose = () => {
    cleanup();
    dPlOpts.remove();
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
  mButtonX(dPlOpts, saveAndClose, 'tr', 14, 3, 'dimgray');
  return dPlOpts;
}
function cSort(hand, suits = null, ranks = null) {
  const sMap = suits ? Object.fromEntries([...suits].map((s, i) => [s, i])) : {};
  const rMap = ranks ? Object.fromEntries([...ranks].map((r, i) => [r, i])) : {};

  return hand.sort((a, b) => {
    const { [1]: sA, [0]: rA } = a.key ?? a;
    const { [1]: sB, [0]: rB } = b.key ?? b;

    // Sort by suit first (if suits mapping exists)
    if (suits) {
      const diff = sMap[sA] - sMap[sB];
      if (diff !== 0) return diff;
    }
    return ranks ? rMap[rA] - rMap[rB] : 0;
  });
}
function cSplay(cards, dParent = null, dir = 'right', splay = 0.25) {
  const n = cards.length;
  if (n === 0) return mGrid(1, 1, dParent);
  if (dir == 'diagonal') return cSplayDiagonal(cards, dParent, splay);

  let dg;
  if (dParent) {
    // let els = Array.from(dParent.getElementsByTagName('grid'));
    // els.forEach(x => x.remove());
    //mClear(dParent);

    let isHorizontal = ['left', 'right'].includes(dir);
    let rows = isHorizontal ? 1 : n;
    let cols = isHorizontal ? n : 1;
    dg = mGrid(rows, cols, dParent, { gap: 0, padding: 20 });
    dg.style.gridTemplateRows = `repeat(${rows}, max-content)`;
    dg.style.gridTemplateColumns = `repeat(${cols}, max-content)`;
    dg.style.display = 'inline-grid';
  } else {
    dg = cards[0].div.parentNode;
    mClear(dg);
  }

  const cardW = cards[0].w;
  const cardH = cards[0].h;
  const invSplay = 1 - splay;
  const marginW = -(cardW * invSplay);
  const marginH = -(cardH * invSplay);
  cards.forEach((c, i) => {
    let dc = iDiv(c);
    mAppend(dg, dc);
    dc.style.margin = "0";
    dc.style.zIndex = i;
    if (i < n - 1) {
      if (dir === 'right') dc.style.marginRight = `${marginW}px`;
      if (dir === 'down') dc.style.marginBottom = `${marginH}px`;
      if (dir === 'left') dc.style.marginRight = `${marginW}px`;
      if (dir === 'up') dc.style.marginBottom = `${marginH}px`;
    }
    if (dir === 'left' || dir === 'up') {
      dc.style.zIndex = n - i;
    }
  });
  return { dg, dir, splay };
}
async function dbDeleteFinishedTables() {
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "delete_finished",
      table: "gametable",
    })
  });
  return await res.json();
}
async function dbDeleteAllTables() {
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "delete_all",
      table: "gametable",
    })
  });
  return await res.json();
}
async function dbUpdateGameTableFS(id, data) {
  // We keep your pattern of wrapping the data and calling the API
  data.expected = { step: data.step } //not used anymore!
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "update_row_fs", // Matches the case in db_api.php
      table: "gametable",
      id,
      data
    })
  });
  //console.log(await res.text())
  return await res.json();
}
async function dbUpdateGameSync(uname, table, action) {
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "update_game_sync", // New PHP case name
      id: table.id,
      player_id: uname,
      step: table.step,
      action
    })
  });
  return await res.json();
}
async function dbFinalizeRound(table) {
  // This sends the full table update to the server
  // The PHP side for 'finalize_round' should:
  // 1. UPDATE gametable SET ... WHERE id = id AND step = old_step
  // 2. DELETE FROM game_sync WHERE game_id = id

  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "finalize_round",
      table: "gametable",
      id: table.id,
      data: table // The new table with step incremented
    })
  });
  return await res.json();
}
async function getDA(key, fast = true) {
  if (isdef(DA[key])) return DA[key];
  let loc = window.location.href;
  DA.isMoxito = loc.includes('moxito.online');
  DA.isTelecave = loc.includes('telecave');
  DA.isLocal = !DA.isMoxito && !DA.isTelecave;
  DA.isLocalhost = DA.isLocal && loc.includes('localhost');
  DA.isLive = DA.isLocal && !DA.isLocalhost; //!loc.includes('8080');
  DA.project = stringAfterLast(stringBeforeLast(loc, '/'), '/'); //console.log('project', DA.project);
  DA.staticUrl = DA.isLive ? '../' : DA.isLocalhost ? 'http://localhost/maroot/' : DA.isMoxito ? 'https://moxito.online/' : 'https://www.telecave.net/ma/'; //'https://moxito.online/';
  DA.phpUrl = (DA.isLocal ? 'http://localhost/maroot/' : DA.isMoxito ? 'https://moxito.online/' : 'https://www.telecave.net/ma/') + DA.project + '/php/';
  DA.dbUrl = (DA.isLocal ? 'http://localhost/maroot/' : DA.isMoxito ? 'https://moxito.online/' : 'https://www.telecave.net/ma/') + DA.project + '/php/db_api.php';
  DA.flaskUrl = (DA.isLocal ? 'http://localhost:5000/' : 'https://moxito.online/flaskgame0/');
  DA.nodeUrl = (DA.isLocal ? 'http://localhost:3000/' : 'https://games.moxito.online/');
  if (!fast) {
    try {
      let flaskLocal = await fetch(DA.flaskUrl);
    } catch { DA.flaskUrl = 'https://moxito.online/flaskgame0/' }
    try {
      let nodeLocal = await fetch(DA.nodeUrl);
    } catch { DA.nodeUrl = 'https://games.moxito.online/' }
  }
  return DA[key];
}
function getNonOverlappingArrays(listOfArrays) {
  // // --- Example Usage ---
  // const data = [
  //   [{ key: 'a' }, { key: 'b' }], // Unique
  //   [{ key: 'c' }],               // Overlaps with the last array
  //   [{ key: 'd' }, { key: 'e' }], // Unique
  //   [{ key: 'c' }, { key: 'f' }]  // Overlaps (key 'c' is shared)
  // ];

  // const result = getNonOverlappingArrays(data);
  // console.log(result); 
  // // Output: [[{ key: 'a' }, { key: 'b' }], [{ key: 'd' }, { key: 'e' }]]
  const keyCounts = new Map();

  // Step 1: Count occurrences of every key across all arrays
  for (const arr of listOfArrays) {
    for (const obj of arr) {
      const count = keyCounts.get(obj.key) || 0;
      keyCounts.set(obj.key, count + 1);
    }
  }

  // Step 2: Filter for arrays where every object's key is globally unique
  return listOfArrays.filter(arr =>
    arr.every(obj => keyCounts.get(obj.key) === 1)
  );
}
function getUniqueRepresentativeSets(listOfArrays) {
  // // --- Example ---
  // const data = [
  //   [{ key: 'a' }, { key: 'b' }], // Kept (new keys a, b)
  //   [{ key: 'a' }],               // Skipped (key 'a' already exists)
  //   [{ key: 'c' }, { key: 'b' }], // Kept (new key c, even though b is duplicate)
  //   [{ key: 'c' }]                // Skipped (key 'c' already exists)
  // ];

  // console.log(getUniqueRepresentativeSets(data));
  // // Output: [[{key: 'a'}, {key: 'b'}], [{key: 'c'}, {key: 'b'}]]

  const seenKeys = new Set();
  const result = [];

  for (const arr of listOfArrays) {
    let hasNewKey = false;

    // Check if this array brings anything new to the table
    for (const obj of arr) {
      if (!seenKeys.has(obj.key)) {
        hasNewKey = true;
        break;
      }
    }

    // If it has at least one key we haven't seen yet, keep the whole array
    if (hasNewKey) {
      result.push(arr);
      // Mark all keys in this array as "seen"
      for (const obj of arr) {
        seenKeys.add(obj.key);
      }
    }
  }

  return result;
}
function getMaxNonOverlappingSameLength(listOfArrays) {
  // // --- Example ---
  // const data = [
  //   [{ key: 'a' }, { key: 'b' }], // Array 0: Conflicts with 1
  //   [{ key: 'a' }, { key: 'c' }], // Array 1: Conflicts with 0 AND 2 (Score 2) - Should be skipped
  //   [{ key: 'c' }, { key: 'd' }], // Array 2: Conflicts with 1
  //   [{ key: 'x' }, { key: 'y' }]  // Array 3: No conflicts (Score 0) - Always kept
  // ];

  // console.log(getMaxNonOverlappingSameLength(data));
  // // Result will keep Array 3 (score 0), then Array 0 and 2 (score 1), 
  // // effectively discarding Array 1 because it was the most "problematic".
  // 1. Build a map to see which arrays share which keys
  const keyToArraysMap = new Map();
  listOfArrays.forEach((arr, index) => {
    arr.forEach(obj => {
      if (!keyToArraysMap.has(obj.key)) keyToArraysMap.set(obj.key, []);
      keyToArraysMap.get(obj.key).push(index);
    });
  });

  // 2. Calculate "Conflict Score" for each array
  // (How many OTHER arrays does this array overlap with?)
  const conflictScores = listOfArrays.map((arr, index) => {
    const overlappingIndices = new Set();
    arr.forEach(obj => {
      keyToArraysMap.get(obj.key).forEach(otherIndex => {
        if (otherIndex !== index) overlappingIndices.add(otherIndex);
      });
    });
    return { index, score: overlappingIndices.size };
  });

  // 3. Sort by lowest conflict score
  conflictScores.sort((a, b) => a.score - b.score);

  const finalResult = [];
  const occupiedKeys = new Set();

  // 4. Pick sets greedily starting from the ones with least conflicts
  for (const item of conflictScores) {
    const currentSet = listOfArrays[item.index];
    const hasOverlap = currentSet.some(obj => occupiedKeys.has(obj.key));

    if (!hasOverlap) {
      finalResult.push(currentSet);
      currentSet.forEach(obj => occupiedKeys.add(obj.key));
    }
  }

  return finalResult;
}
function getNonOverlappingPlusOne(listOfArrays) {
  // --- Example ---
  // const data = [
  //   [{ key: 'unique1' }, { key: 'unique2' }], // Set A: Non-overlapping
  //   [{ key: 'overlap' }, { key: 'x' }],       // Set B: Overlaps with C
  //   [{ key: 'overlap' }, { key: 'y' }]        // Set C: Overlaps with B
  // ];

  // const result = getNonOverlappingPlusOne(data);
  // console.log(result);
  // /* Result will contain:
  //   1. Set A (The non-overlapper)
  //   2. Set B (The first available representative from the overlapping pair)
  // */
  const keyFrequency = new Map();

  // 1. Map out how many times each key appears across the entire universe
  listOfArrays.forEach(arr => {
    arr.forEach(obj => {
      keyFrequency.set(obj.key, (keyFrequency.get(obj.key) || 0) + 1);
    });
  });

  // 2. Identify "Strictly Unique" sets 
  // (Every key in the set appears exactly once in the whole list)
  const strictlyUnique = [];
  const overlappingCandidates = [];

  listOfArrays.forEach(arr => {
    const isStrictlyUnique = arr.every(obj => keyFrequency.get(obj.key) === 1);
    if (isStrictlyUnique) {
      strictlyUnique.push(arr);
    } else {
      overlappingCandidates.push(arr);
    }
  });

  // 3. From the overlapping candidates, pick as many as possible 
  // without stepping on each other's toes.
  const selectedOverlappers = [];
  const takenKeys = new Set();

  // Pre-fill takenKeys with keys from strictly unique sets 
  // so the overlappers don't steal their keys
  strictlyUnique.forEach(arr => arr.forEach(obj => takenKeys.add(obj.key)));

  for (const arr of overlappingCandidates) {
    const hasOverlap = arr.some(obj => takenKeys.has(obj.key));
    if (!hasOverlap) {
      selectedOverlappers.push(arr);
      arr.forEach(obj => takenKeys.add(obj.key));
    }
  }

  // 4. Combine them
  return [...strictlyUnique, ...selectedOverlappers];
}
function getOtherPlayerNames(table, me) { return table.plorder.filter(x => x != me); }

async function gtShow() {
  if (!DA.tid) { await switchToMenu('games'); showMessage('table missing!!!', 4000); return; }
  let table = T = DAGetTable(DA.tid);
  F = T.fen;
  let me = U.name;
  assertion(me == U.name);
  let func = DA.func = DA.funcs[table.game]();
  let ui = DA.ui = func.present(me, table);
  if (TESTING && table.game == 'setgame') func.setFindAllSets(ui.items); //.map(x=>console.log(x[0],x[1],x[2]));
  if (ui.refresh) mFall('dTable', 400);
  if (table.status == 'over') {
    showGameover(table);
  } else if (table.status == 'started' && table.plorder.includes(me)) {
    A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: M.config.autosubmit };
    //await bluffActivate(me, table, ui);
    await func.activate(me, table, ui);
  } //else if (table.status == 'started' && !table.turn.includes(me) && table.turn.some(x=>table.players[x].playmode == 'bot')) {
}
function highlightPlayerItem(item) {
  let c = M.users[item.name].color;
  let hsl = hexToHsl(c);
  let cb = hsl.l > 50 ? colorDark(c, 50) : c;
  mStyle(iDiv(item), { bg: c, outline: `1px solid ${cb}` });
}
function unselectPlayerItem(item) {
  mStyle(iDiv(item), { bg: 'transparent', fg: 'black', border: `transparent`, outline: `1px solid transparent` });
}
async function loadAssetsFast() {
  if (nundef(M)) M = {};
  M = await loadStaticYaml('assets/m.yaml');
  console.log(M)
  loadColors();
}
async function loadAssetsStatic() {
  if (nundef(M)) M = {};
  M.superdi = await loadStaticYaml('y/superdi_plus.yaml');
  M.details = await loadStaticYaml('y/details.yaml');
  M.text = await loadStaticText('y/words.yaml');
  M.words = M.text.split('\n').map(x => x.trim());
  M.kqj = await loadStaticYaml('y/kqj.yaml');
  M.wordsAnagram = M.words.filter(x => x.length > 3 && x.length < 11 && x[0].toUpperCase() != x[0]);
  loadSuperdiAssets();
  if (nundef(M.asciiCapitals)) {
    let except = ["Noum", 'Bras', 'Reykja'];
    M.asciiCapitals = M.capital.filter(x => !x.includes('.') && !except.some(y => x.startsWith(y)));
  }
  M.c52Symbols = await loadStaticYaml('assets/c52symbols.yaml');
  M.images = await loadStaticYaml('y/all_image_files.yaml');
  let byKey = {}, byDir = {};
  for (const fname of M.images) {
    let dir = stringBeforeLast(fname, '/');
    dir = stringAfterLast(dir, '/')
    let key = stringAfterLast(fname, '/');
    key = stringBefore(key, '.');
    key = normalizeString(key);
    byKey[key] = fname;
    lookupAddIfToList(byDir, [dir], fname);
    //console.log(dir,key);
  }
  M.imgByKey = byKey;
  M.imgByDir = byDir;


}
async function loadAssetsStaticPreload() {
  M = await loadStaticYaml('y/m.yaml');
  M.config = await loadStaticYaml('y/config.yaml');
  M.emo = await loadStaticYaml('y/diemo.yaml');
  M.emogroup = await loadStaticYaml('y/digroup.yaml');
  M.emokeys = Object.keys(M.emo).sort();
  M.fa = await loadStaticYaml('y/fadi.yaml');
  M.fakeys = Object.keys(M.fa).sort();
  loadColors();

}
function mButtonX(dParent, handler, pos = 'tr', sz = 14, offset = 3, color = 'white') {
  let d2 = mDom(dParent, { fg: color, fz: sz, w: sz, h: sz, cursor: 'pointer' }, { tag: 'i', className: "fa fa-times", id: 'btnX' });
  mPlace(d2, pos, offset);
  d2.onclick = handler;
  return d2;
}
async function mGetFiles(dir) {
  let res = await mPhpPost('all', { cmd: 'dir', dir });
  return res;
}
function mFit(list, dParent, showLabel = true, gap = 5, ratio = 1) {
  let n = list.length;
  let r = getRect(dParent);
  let { cols, rows, score, w, h } = calculateCells(n, r.w - gap, r.h - gap, ratio);
  w -= gap; h -= gap;
  let d = mDom(dParent, { justifyContent: 'center', position: 'relative', w100: true, h100: true, display: 'flex', flexWrap: 'wrap', box: true, padding: gap, gap })
  let items = [];
  let fz = Math.min(w, h) * .6;
  for (let x of list) {
    let bg = rColor(); let fg = colorIdealText(bg);
    let label = fromNormalized(x);
    let itemStyles = { w, h, fz, align: 'center', bg, fg };
    let d1 = mKey(x, d, itemStyles, { prefer: 'emoji', label: showLabel ? label : undefined });
    items.push({ div: d1, key: x, o: M.emo[x] })
  }
  return items;
}
async function mPhpPost(cmd, o, jsonResult = true) {
  let server = await getDA('phpUrl');
  if (isdef(o.path) && (o.path.startsWith('zdata') || o.path.startsWith('y'))) o.path = '../../' + o.path;
  if (VERBOSE) console.log('to php:', server + `${cmd}.php`, o);
  let res = await fetch(server + `${cmd}.php`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(o),
    }
  );
  let text;
  try {
    text = await res.text(); //console.log(text)
    if (!jsonResult) {
      return text;
    }
    let obj = JSON.parse(text);
    //if (isdef(obj.message)) { let m = obj.table.lastMove; }
    if (VERBOSE) console.log('from php:\n', obj);
    let mkeys = ["config", "superdi", "users", "details"];
    for (const k of mkeys) {
      if (isdef(obj[k])) {
        M[k] = obj[k];
        if (k == "superdi") {
          loadSuperdiAssets();
        } else if (k == "users") {
          loadUsers();
        }
      }
    }
    return obj;
  } catch (e) {
    return isString(text) ? text : e;
  }
}
function mPopup(dParent, styles = {}, opts = {}) {
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
    position: 'absolute',
    z: 10000,
    w: '100%',//'fit-content',      // Grow horizontally to fit content
    h: 'auto',             // Grow vertically to fit content
  }, styles);
  let popup = mDom(dParent, styles, opts);
  mButtonX(popup);
  return popup;
}
function mStamp(d1, text, color, sz) {
  mStyle(d1, { position: 'relative' });
  let r = getRect(d1);
  let [w, h] = [r.w, r.h];
  color = valf(color, 'black');
  sz = valf(sz, r.h / 7);
  let [padding, border, rounding, angle] = [sz / 10, sz / 6, sz / 8, rChoose([-16, -14, -10, 10, 14])];
  let d2 = mDom(d1, {
    fg: color,
    position: 'absolute', top: 45, left: 5,
    transform: `rotate(${angle}deg)`,
    fz: sz,
    hpadding: 2,
    vpadding: 0,
    rounding: rounding,
    border: `${border}px solid ${colorTrans(color, .8)}`, // black
    '-webkit-mask-size': `${w}px ${h}px`,
    '-webkit-mask-position': `50% 50%`,
    '-webkit-mask-image': 'url("../base/assets/images/textures/grunge.png")',
    weight: 400, // 800
    display: 'inline-block',
    'text-transform': 'uppercase',
    family: 'blackops', // courier blackops fredericka
    'mix-blend-mode': 'multiply',
    z: 10000,
  }, { html: text });
}
function mTimerCreate(dParent, styles = {}, msMax = 10000, format = 'ss', callback = null) {
  addKeys({ w: 80, maleft: 10, fg: 'red', weight: 'bold' }, styles);
  let dtimer = mDom(dParent, styles, { id: 'dTimer' });
  mTimerStop();
  let timer = DA.timer = new mTimer(dtimer, 1000, null, msMax, callback, format);
  timer.start();
  return dtimer;
}
function mTimerStart(dParent, msInterval, onTick, msTotal, onElapsed) {
  if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; }
  let timer = DA.timer = new mTimer(dParent, msInterval, onTick, msTotal, onElapsed);
  timer.start();
}
function mTimerStop() {
  if (isdef(DA.timer)) {
    let res = DA.timer.clear();
    DA.timer = null;
    return isNumber(res) ? res : 0;
  }
  return 0;
}

async function onclickDeleteFinished(id) {
  if (localStorage.getItem('tid') == id) {
    localStorage.removeItem('tid');
    DA.tid = null;
  }
  res = await dbDeleteFinishedTables();
  await updateMain();
}
async function onclickDeleteAll(id) {
  if (localStorage.getItem('tid') == id) {
    localStorage.removeItem('tid');
    DA.tid = null;
  }
  res = await dbDeleteAllTables();
  await updateMain();
}
function onhoverGamename(me, table) {
  let d = mDom('dMain', { padding: 10, bg: 'white', position: 'absolute', top: 130, right: 0 }, { id: 'dGameOptions' });
  for (const opt in table.options) {
    let val = table.options[opt];
    let d1 = mDom(d, {}, { html: `${opt}: ${val}` });
  }
  mDom(d, {}, { html: '____' });
  let poss = M.config.games[table.game].ploptions;
  for (const opt in table.players[me]) {
    if (!(opt in poss)) continue;
    let val = table.players[me][opt];
    let d1 = mDom(d, {}, { html: `${opt}: ${val}` });
  }
}
async function pollAndShow() {
  if (nundef(DA.pollStates)) return;
  DA.pollCounter++;
  if (DA.isProcessingMove) { if (VERBOSE) console.log('...processing move'); return; }
  if (VERBOSE) console.log('polling...updating!'); //, DA.pollCounter,);
  DA.isProcessingMove = true;
  let uiUpdated = await updateMain();
  //if (uiUpdated) console.log('UPDATED!'); //else console.log('polling...',DA.pollCounter)
  DA.isProcessingMove = false;
}
function posCenteredAboveDiv(dParent, d, d1) {
  let [r, rp] = [getRectInt(d, dParent), getRectInt(d1)];
  let x = Math.min(Math.max(r.x - rp.w / 2 + r.w / 2, 0), window.innerWidth - rp.w - 100);
  mIfNotRelative(dParent);
  mPos(d1, x, r.y - rp.h - 4);

} async function reloadTable(table) {
  if (nundef(DA.tid)) DA.tid = localStorage.getItem('tid') || DA.tableDict ? arrLast(Object.keys(DA.tableDict)) : null;
  if (!DA.tid) return true;
  localStorage.setItem('tid', DA.tid);
  if (nundef(table)) {
    //console.log('reload from server', DA.tid);
    let res = await dbGetGameTable(DA.tid);
    table = res.table;
    table.pending = res.movedPlayers ?? []; //console.log(table.pending);

    //console.log('table in reloadTable',table)
  }
  if (table.error) {
    DA.tid = null;
    return true;
  }
  let clientTable = DAGetTable();
  let hasChanges = !clientTable || !table || table.modified != clientTable.modified || table.step != clientTable.step || clientTable.pending && table.pending && !sameList(table.pending, clientTable.pending);
  if (hasChanges) {
    DA.oldTable = clientTable;
    DA.tableDict[DA.tid] = table;
  }
  return hasChanges;
}
async function saveAndUpdateAllPlayerOptions() {
  let gamename = DA.gamename;
  let plItems = DA.allPlayers;
  let changed = false;
  let poss = jsCopy(valf(M.config.games[gamename].ploptions, {})); delete poss.playmode;
  if (nundef(poss)) return;
  for (const plName in plItems) {
    let allPl = plItems[plName];
    let opts = {};
    for (const p in poss) {
      if (p == 'playmode') continue;
      opts[p] = allPl[p];
    }
    let oldOpts = valf(lookup(M.users, [plName, 'games', gamename]), {});
    for (const p in poss) {
      if (p == 'playmode') continue;
      if (oldOpts[p] != opts[p]) {
        changed = true;
        break;
      }
    }
    lookupSetOverride(M.users, [plName, 'games', gamename], opts);
  }
  //console.log('changed', changed,M.users.mimi.games,M.users.felix.games)
  if (changed) {
    let res = await postUsers();
  }
}
async function setPlayerPlaying(allPlItem, gamename) {
  let plName = allPlItem.name; //console.log('setPlayerPlaying', plName, allPlItem)
  addIf(DA.playerList, plName);
  highlightPlayerItem(allPlItem);
  let d1 = createPlayerOptionDialog(plName, gamename, allPlItem.div, `${plName}`);
  arrChildren(d1).forEach(d => mStyle(d, { opacity: 1 }));
}
async function setPlayerNotPlaying(item, gamename) {
  // await saveDataFromPlayerOptionsUI(gamename);
  removeInPlace(DA.playerList, item.name);
  //console.log('setPlayerNotPlaying', DA.playerList)

  let d1 = createPlayerOptionDialog(item.name, gamename, item.div, `${item.name} (not playing)`);
  arrChildren(d1).forEach(d => mStyle(d, { opacity: .5 }));

  //mRemoveIfExists('dPlayerOptions');
  unselectPlayerItem(item);
}
function showCardMini(dt, card, sz = 40, bg = 'red', border = 'black', borderThickness = 3, shadow = false, bgFace = 'white') {
  mFlex(dt);
  let cardui = uiTypeCard52(card, sz, bg, border, borderThickness, shadow, bgFace);
  mClear(dt);
  mAppend(dt, cardui.div);
}
async function showGameMenuPlayerDialog(name, shift = false) {
  let allPlItem = DA.allPlayers[name];
  let gamename = DA.gamename;
  let da = iDiv(allPlItem);
  if (!DA.playerList.includes(name) || name == U.name) await setPlayerPlaying(allPlItem, gamename);
  else if (name != U.name) await setPlayerNotPlaying(allPlItem, gamename);
}
async function showGamePlayers(dParent, users) {
  let me = U.name;
  mStyle(dParent, { flexWrap: 'wrap' });
  let userlist = ['amanda', 'felix', 'mimi'];
  for (const name in users) addIf(userlist, name);
  for (const name of userlist) {
    let d = showUser(dParent, name, onclickGameMenuPlayer);
    let item = userToPlayer(name, DA.gamename); item.div = d; item.isSelected = false;
    //d.onmouseenter = ()=>
    DA.allPlayers[name] = item;
  }
  await setPlayerPlaying(DA.allPlayers[me], DA.gamename);
}
function showHandSortingButtonsFor(pl, ui) {
  if (pl.hand.length <= 1) return;
  let x = ui.hand;
  let d = x.dg.parentNode;
  let bstyles = { z: 10000, position: 'absolute', hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black' };
  let b1 = mDom(d, { ...bstyles, left: 20, bottom: 2 }, { tag: 'button', innerHTML: 'rank' });
  b1.onclick = () => {
    let cardItems = cSort(ui.handCards, null, 'A23456789TJQK');
    cSplay(cardItems, null, x.dir, x.splay);

  }
  let b2 = mDom(d, { ...bstyles, right: 20, bottom: 2 }, { tag: 'button', innerHTML: 'suit' });
  b2.onclick = () => {
    let cardItems = cSort(ui.handCards, 'CDSH', 'A23456789TJQK');
    cSplay(cardItems, null, x.dir, x.splay);

  }
}
function showWaitingShield(show = true, message = "Waiting for other players...") {
  //showMessage(message);return;

  let d = mBy('dExtra');
  if (show) {
    mClear(d);
    mDom(d, {}, { html: 'WAIT!!!!!!!!!!!!!!!!!' });
  } else {
    mClear(d);
  }
  return;

  let id = 'waiting_shield';
  d = document.getElementById(id);

  if (!show) {
    if (d) d.remove();
    return;
  }

  if (d) return; // Shield already exists

  // Create the overlay
  d = mDom(document.body, {
    id: id,
    position: 'fixed',
    top: 0,
    left: 0,
    w: '100vw',
    h: '100vh',
    bg: 'rgba(0,0,0,0.5)',
    display: 'flex',
    'align-items': 'center',
    'justify-content': 'center',
    'z-index': 10000,
    cursor: 'wait'
  });

  // Create the message box
  let dBox = mDom(d, {
    bg: 'white',
    padding: 20,
    round: 10,
    family: 'blackops',
    fz: 24,
    border: '2px solid gold',
    align: 'center'
  }, { html: message });

  // Optional: Add a small loading spinner animation
  mDom(dBox, { matop: 10, fz: 14, family: 'Arial' }, { html: "Please stay on this page..." });
}
async function stdBotMoves(botMove, table) {
  let bots = table.turn.filter(name => table.players[name].playmode == 'bot');
  if (bots.length > 0) {
    let bot = rChoose(bots);
    let min = lookup(table.options, ['botmin']) ?? 5000;
    let max = Math.max(min + 1000, lookup(table.options, ['botmax']) ?? 5000);
    let ms = rChoose(range(min, max));
    let cd = table.players[bot].cdRel;
    if (isdef(cd)) ms += cd * 1000; console.log('==>cd', cd, ms)
    if (isdef(TO.bot)) clearTimeout(TO.bot);
    console.log('bot ready', bot, ms)
    TO.bot = setTimeout(async () => { if (!DA.isProcessingMove) await botMove(bot); }, ms);
  }
}
function stdInstruction(me, table, text) {
  let myTurn = table.turn.includes(me) && !table.pending.includes(me);
  //console.log('pending',table.pending,'myTurn',myTurn,me)
  let spectating = !Object.keys(table.players).includes(me);
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
  } else {
    //console.log('HERE!!!!!!!!!!!!')
    html = `waiting for: ${getTurnPlayers(table)}`
  }
  dInst.innerHTML = html;
  mStyle(dInst, { w100: true, hmin: 50 }, { className: 'section' });
  return { myTurn, spectating };
}
async function tableSaveNew(table) {
  table.modified = getNow();
  let res = await dbAddNewGameTable(table);
  table.id = res.insert_id;
}
async function tableSaveUpdate(table) {
  table.modified = getNow();
  let res = await dbUpdateGameTable(table.id, table);
}
async function tableSaveUpdateFO(table) {
  table.modified = getNow();
  let res = await dbUpdateGameTableFO(table.id, table);
}
async function tableSaveUpdateFS(table) {
  console.log('tableSaveUpdateFS', table.step)
  table.modified = getNow();
  let res = await dbUpdateGameTableFS(table.id, table);
  //await updateMain(false, res.row);
  return res.row;
  console.log('res', res)
  if (res.success && res.row) {
    // If successful, the server returns the row with step incremented
    T = res.row;
  } else if (res.row) {
    // If it failed (someone else moved), we still sync to the latest state
    T = res.row;
    console.warn("Move rejected: Someone else moved first.");
  }
  updateUI();
  return res;
}
async function updateMain(forceUI = false, table = null) {
  let hasChanges = await updateData();
  if (!hasChanges && !forceUI) { return false; }
  //const isInteracting = checkPlayerBusy();
  await updateUI(); //isInteracting);
  return true;
}
async function updateData() {
  switch (DA.menu) {
    case 'games': return await reloadTables();
    case 'table': return await reloadTable();
    default: return false;
  }
}
async function updateUI() {
  miniClearMain(); mClear('dMain');
  switch (DA.menu) {
    case 'table': await gtShow(); pollOn(); break;
    case 'settings': showSettings(); pollOff(); break;
    case 'games':
    default: showGamesAndTables(); pollOn(); break;
  }
}


//#endregion




