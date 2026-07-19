
function DAGetTable(id) {
  if (isdef(id)) DA.tid = id;
  assertion(isdef(DA.tableDict), 'no tableDict');
  return DA.tableDict[DA.tid];
}
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
function INTERRUPT() { clearEvents(); assertion(false, '* THE END *'); }
function _bindInteractions(el, { hoverRaise, selectionColor, selectionWidth }) {
  /**
   * Attach hover-raise and click-select interactions to one element.
   * Called on every splayItems() call so dataset options stay up-to-date,
   * but DOM listeners are only attached once (guarded by data-splay-bound).
   *
   * Hover  : raises the element in its own local space (feels natural in a fan).
   * Click  : toggles data-selected="1" and shows a coloured outline.
   */
  el.dataset.splayHoverRaise = String(hoverRaise);
  el.dataset.splaySelectionColor = selectionColor;
  el.dataset.splaySelectionWidth = String(selectionWidth);
  if (el.dataset.splayBound === '1') return; // listeners already attached
  el.dataset.splayBound = '1';
  el.style.cursor = 'pointer';
  el.addEventListener('mouseenter', () => {
    const rot = parseFloat(el.dataset.splayRotation || '0');
    const raise = parseFloat(el.dataset.splayHoverRaise || '10');
    el.style.transition = 'transform 0.12s ease';
    el.style.transform = rot
      ? `rotate(${rot}deg) translateY(-${raise}px)`
      : `translateY(-${raise}px)`;
  });
  el.addEventListener('mouseleave', () => {
    const rot = parseFloat(el.dataset.splayRotation || '0');
    el.style.transition = 'transform 0.12s ease';
    el.style.transform = rot ? `rotate(${rot}deg)` : '';
  });
  el.addEventListener('click', () => {
    const isSelected = el.dataset.selected === '1';
    if (isSelected) {
      el.dataset.selected = '0';
      el.style.outline = '';
      el.style.outlineOffset = '';
    } else {
      const color = el.dataset.splaySelectionColor || 'red';
      const width = el.dataset.splaySelectionWidth || '3';
      el.dataset.selected = '1';
      el.style.outline = `${width}px solid ${color}`;
      el.style.outlineOffset = '0px';
    }
  });
}
function _calc_hex_col_array(rows, cols) {
  let colarr = [];
  let even = rows % 2 == 0;
  for (let i = 0; i < rows; i++) {
    colarr[i] = cols;
    if (even && i < (rows / 2) - 1) cols += 1;
    else if (even && i > rows / 2) cols -= 1;
    else if (!even && i < (rows - 1) / 2) cols += 1;
    else if (!even || i >= (rows - 1) / 2) cols -= 1;
  }
  return colarr;
}
function _cardBackSVG(card) {
  /**
   * Generates the back-face SVG for a card, matching its current border/bg state.
   * Three concentric rectangles give a classic card-back look.
   * Called fresh on each flip so it always reflects the card's current colors.
   */
  const bg = card.bg || 'navy';
  const accent = card.bgFace || 'white';
  const stroke = card.border || 'black';
  const sw = card.borderthickness || 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-120 -168 240 336" width="100%" height="100%" preserveAspectRatio="none">
    <rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12"
          fill="${bg}" stroke="${stroke}" stroke-width="${sw}"/>
    <rect width="207" height="303" x="-103.5" y="-151.5" rx="9" ry="9"
          fill="none" stroke="${accent}" stroke-width="3" opacity="0.55"/>
    <rect width="183" height="279" x="-91.5" y="-139.5" rx="7" ry="7"
          fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.35"/>
  </svg>`;
}
function _cardOuterRect(div) {
  /**
   * uiTypeCard52  (improved)
   * ─────────────────────────────────────────────────────────────────────────────
   * Changes vs original:
   *  1. Exact aspect ratio: 240/336 from the SVG viewBox instead of the 0.7
   *     approximation (was 1.4% off, causing slight horizontal distortion).
   *  2. DOM-based rect styling instead of a brittle literal-string replace —
   *     immune to attribute order or whitespace variations in the source SVG.
   *  3. Shadow removal targets only the <svg> class attribute, not any nested
   *     class, so cards with multi-value classes or extra elements are safe.
   *  4. svgUp is built from div.innerHTML after DOM patching, so it always
   *     reflects the final rendered state rather than the raw template string.
   *  5. bg (back-face color) is now applied as a CSS background on the wrapper
   *     div so it shows when the card is flipped face-down.
   */
  const rects = Array.from(div.querySelectorAll('rect'));
  if (!rects.length) return null;
  return rects.reduce((best, r) =>
    (parseFloat(r.getAttribute('width')) * parseFloat(r.getAttribute('height'))) >
      (parseFloat(best.getAttribute('width')) * parseFloat(best.getAttribute('height')))
      ? r : best
  );
}
function _createCard(rank = "10", suit = "♣", height = 200, width) {
  if (nundef(width)) width = height * .7;
  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.width = width + "px";
  card.style.height = height + "px";
  card.style.border = "1px solid black";
  card.style.borderRadius = Math.max(4, width / 20) + 'px';
  card.style.background = "white";
  card.style.fontFamily = '"DejaVu Sans", "Arial Unicode MS", sans-serif';
  const centerX = width / 2;
  const colOffset = width * 0.2;
  const colX = [centerX - colOffset, centerX, centerX + colOffset];
  const topMargin = height * 0.12;
  const pipSpacing = (height - 2 * topMargin) / 3.3;
  const pipPatterns = {
    1: [[1, [1.5]]],
    2: [[1, [0, 3]]],
    3: [[1, [0, 1.5, 3]]],
    4: [[0, [0, 3]], [2, [0, 3]]],
    5: [[0, [0, 3]], [1, [1.5]], [2, [0, 3]]],
    6: [[0, [0, 1.5, 3]], [2, [0, 1.5, 3]]],
    7: [[0, [0, 1.5, 3]], [1, [0.75]], [2, [0, 1.5, 3]]],
    8: [[0, [0, 1.5, 3]], [1, [0.75, 2.25]], [2, [0, 1.5, 3]]],
    9: [[0, [0, 1, 2, 3]], [1, [1.5]], [2, [0, 1, 2, 3]]],
    10: [[0, [0, 1, 2, 3]], [1, [0.5, 2.5]], [2, [0, 1, 2, 3]]],
    11: [[0, [0, 1, 2, 3]], [1, [0.5, 1.5, 2.5]], [2, [0, 1, 2, 3]]],
  };
  const value = parseInt(rank);
  const pipData = pipPatterns[value];
  const pipFontSize = height * .2;
  pipData.forEach(([col, rows]) => {
    rows.forEach(rowIndex => {
      const pip = document.createElement("div");
      pip.textContent = suit;
      pip.style.position = "absolute";
      pip.style.left = (colX[col] - pipFontSize * 0.35) + "px";
      pip.style.top = (topMargin + pipSpacing * rowIndex - pipFontSize * 0.5) + "px";
      pip.style.fontSize = pipFontSize + "px";
      if (rowIndex === 3) pip.style.transform = "rotate(180deg)";
      card.appendChild(pip);
    });
  });
  function makeCorner() {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.fontSize = Math.floor(height * 0.08) + "px";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.lineHeight = "1";
    const rankDiv = document.createElement("div");
    rankDiv.textContent = rank;
    const suitDiv = document.createElement("div");
    suitDiv.textContent = suit;
    div.appendChild(rankDiv);
    div.appendChild(suitDiv);
    return div;
  }
  const top = makeCorner();
  top.style.left = "3px";
  top.style.top = "3px";
  card.appendChild(top);
  const bottom = makeCorner();
  bottom.style.right = "3px";
  bottom.style.bottom = "3px";
  bottom.style.transform = "rotate(180deg)";
  card.appendChild(bottom);
  return card;
}
function _createGrid(rows, cols, fill = null) {
  if (rows < 0 || cols < 0) throw new RangeError("rows and cols must be non-negative");
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => fill));
}
function _fanCoords(norm, spreadDeg, arcRadius) {
  /**
   * Compute left/top/rotation/zIndex for an arc fan.
   * Cards are arranged along a circular arc, each tilted to follow the curve,
   * as if held in a hand. Centre card sits at the top of the arc.
   */
  const { w, h } = norm[0];
  const n = norm.length;
  const R = arcRadius ?? Math.max(h * 2.5, w * 3.5);
  const totalRad = (spreadDeg * Math.PI) / 180;
  const startAngle = -totalRad / 2;
  const stepAngle = n > 1 ? totalRad / (n - 1) : 0;
  const raw = norm.map((item, i) => {
    const θ = startAngle + i * stepAngle;
    return {
      ...item,
      left: R * Math.sin(θ) - item.w / 2,
      top: R * (1 - Math.cos(θ)) - item.h / 2,
      rotation: θ * (180 / Math.PI),
      zIndex: i + 1,
    };
  });
  const minL = Math.min(...raw.map(p => p.left));
  const minT = Math.min(...raw.map(p => p.top));
  raw.forEach(p => { p.left -= minL; p.top -= minT; });
  return raw;
}
function _flipAnimate(card, toHtml, durationMs) {
  /**
   * Internal: plays a half-fold → swap-content → half-unfold CSS 3D animation.
   * Returns a Promise that resolves when the animation is fully complete.
   */
  return new Promise(resolve => {
    const div = card.div;
    const half = durationMs / 2;
    const rot = card.splayRotation || 0;
    const base = rot ? `rotate(${rot.toFixed(2)}deg)` : '';
    div.style.transition = `transform ${half}ms ease-in`;
    div.style.transform = `perspective(600px) rotateY(90deg) ${base}`;
    setTimeout(() => {
      div.innerHTML = toHtml;
      div.style.transition = 'none';
      div.style.transform = `perspective(600px) rotateY(-90deg) ${base}`;
      void div.offsetHeight;
      div.style.transition = `transform ${half}ms ease-out`;
      div.style.transform = `perspective(600px) rotateY(0deg) ${base}`;
      setTimeout(() => {
        div.style.transition = 'none';
        div.style.transform = base;
        resolve();
      }, half);
    }, half);
  });
}
function _getTextureStyle(bg, t) {
  let bgRepeat = t.includes('marble_') || t.includes('wall') ? 'no-repeat' : 'repeat';
  let bgSize = t.includes('marble_') || t.includes('wall') ? `cover` : t.includes('ttrans') ? '' : 'auto';
  let bgImage = `url('${t}')`;
  let bgBlend = t.includes('ttrans') ? 'normal' : (t.includes('marble_') || t.includes('wall')) ? 'luminosity' : 'multiply';
  return { bg, bgImage, bgSize, bgRepeat, bgBlend };
}
function _linearCoords(norm, direction, overlap, rotateStep) {
  /**
   * Compute left/top/rotation/zIndex for a straight-line splay.
   * overlap: 0 = touching · 0.65 = default · 1 = stacked · <0 = gapped
   */
  const { w, h } = norm[0];
  const sx = w * (1 - overlap);
  const sy = h * (1 - overlap);
  const vectors = {
    right: [sx, 0],
    left: [-sx, 0],
    up: [0, -sy],
    down: [0, sy],
    'down-right': [sx, sy * 0.5],
    'down-left': [-sx, sy * 0.5],
    'up-right': [sx, -sy * 0.5],
    'up-left': [-sx, -sy * 0.5],
  };
  const [dx, dy] = vectors[direction] ?? vectors.right;
  const raw = norm.map((item, i) => ({
    ...item,
    left: i * dx,
    top: i * dy,
    rotation: i * rotateStep,
    zIndex: i + 1,
  }));
  const minL = Math.min(...raw.map(p => p.left));
  const minT = Math.min(...raw.map(p => p.top));
  raw.forEach(p => { p.left -= minL; p.top -= minT; });
  return raw;
}
function _normalizeItem(item) {
  /**
   * Normalise one item to {el, w, h, original}.
   * Accepts either a card object (from uiTypeCard52) or a plain HTMLElement.
   */
  if (item instanceof HTMLElement) {
    return { el: item, w: item.offsetWidth || 60, h: item.offsetHeight || 60, original: item };
  }
  return { el: item.div, w: item.w, h: item.h, original: item };
}
async function _showTheme() {
  localStorage.setItem('settingsMenu', 'Themes');
  let d = mBy('dSettings'); mClear(d);
  let d1 = mDom(d, { gap: 12, padding: 10 }); mFlexWrap(d1);
  let themes = lookup(M.config, ['themes']);
  let name, fg;
  for (const key in themes) {
    let th = themes[key];
    let bg = th.color;
    fg = th.fg || colorIdealText(bg);
    name = th.name;
    let styles = { w: 300, h: 200, bg, fg, border: `solid 1px ${getCSSVariable('--fgButton')}` };
    let dsample = mDom(d1, styles, { theme: key });
    setTexture(th, dsample);
    let dnav = mDom(dsample, { bg, fg, padding: 10 }, { html: name.toUpperCase() });
    let dmain = mDom(dsample, { fg, padding: 10 }, { html: getMotto() }); //, className: 'section' });
    dsample.onclick = onclickThemeSample;
  }
}
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
function aFlip(d, ms = 300, easing = 'cubic-bezier(1,-0.03,.27,1)') {
  return d.animate({ transform: `scale(${0},${1})` }, { easing, duration: ms });
}
function aMove(d, newParent, ms = 800, easing = 'ease-in') {
  let [dx, dy] = screenDistance(d, newParent);
  return d.animate({ transform: `translateX(${dx}px) translateY(${dy}px)` }, { easing, duration: ms });
}
function aRotate(d, ms = 2000) { return d.animate({ transform: `rotate(360deg)` }, ms); }
function aRotateAccel(d, ms) { return d.animate({ transform: `rotate(1200deg)` }, { easing: 'cubic-bezier(.72, 0, 1, 1)', duration: ms }); }
function aTranslateBy(d, x, y, ms) { return d.animate({ transform: `translate(${x}px,${y}px)` }, ms); }// {easing:'cubic-bezier(1,-0.03,.27,1)',duration:ms}); }
function aTranslateByEase(d, x, y, ms, easing = 'cubic-bezier(1,-0.03,.27,1)') {
  return d.animate({ transform: `translate(${x}px,${y}px)` }, { easing: easing, duration: ms });
}
function aTranslateFadeBy(d, x, y, ms) { return d.animate({ opacity: .5, transform: `translate(${x}px,${y}px)` }, { easing: MyEasing, duration: ms }); }
function accuse_get_card(ckey, h, w, backcolor = BLUE, ov = .3) {
  if (is_color(ckey)) {
    return get_color_card(ckey, h)
  } else if (ckey.length > 3) {
    return get_number_card(ckey, h, null, backcolor, ov);
  } else {
    let info = get_c52j_info(ckey, backcolor);
    let card = cardFromInfo(info, h, w, ov);
    return card;
  }
}
function actionProcessLine(a, di) {
  let [key, rest] = a.split(':');
  let from = stringBefore(rest, '-');
  let to = stringAfter(rest, '-');
  if (isEmpty(to)) { DA.action = { a, key, from }; return; }
  [from, to] = [Number(from), Number(to)];
  let o = { key, from, to };
  addKeys(getDateTimeData(from, to), o);
  di.list.push(o);
  lookupAddToList(di.byKey, [key], o);
  lookupAddToList(di.byHour, [o.hour], o);
  lookupAddToList(di.byDate, [o.date], o);
}
function addAREA(id, o) {
  if (AREAS[id]) {
    error('AREAS ' + id + ' exists already!!! ');
    error(o);
    return;
  }
  AREAS[id] = o;
}
function addBadge(dg, text, bottom = -4, right = -2) {
  mStyle(dg, { position: 'relative' });
  let badge = mDom(dg, { position: 'absolute', bottom, right, bg: 'red', fg: 'white', fz: 12, z: 1000, round: true, pahv: '6 2' }, { html: text })
}
function addCity(cityMap, container, r, c, x, y, padding = 0) {
  const key = `${r}_${c}`;
  if (cityMap[key]) return;
  const city = document.createElement('div');
  city.className = 'city';
  city.style.position = 'absolute';
  let sz = 30;
  city.style.width = `${sz}px`;
  city.style.height = `${sz}px`;
  city.style.borderRadius = '50%';
  city.style.background = 'green';
  x -= padding;
  y -= padding;
  city.style.left = `${x - sz / 2}px`;
  city.style.top = `${y - sz / 2}px`;
  container.appendChild(city);
  cityMap[key] = { div: city, x, y, r, c };
}
function addDummy(dParent, place) {
  let b = mButton('', null, dParent, { opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' });
  if (isdef(place)) mPlace(b, place);
  b.id = 'dummy';
}
function addEditable(dParent, styles = {}, opts = {}) {
  addKeys({ tag: 'input', classes: 'plain' }, opts)
  addKeys({ wmax: '90%', box: true }, styles);
  let x = mDom(dParent, styles, opts);
  x.focus();
  x.addEventListener('keyup', ev => {
    if (ev.key == 'Enter') {
      mDummyFocus();
      if (isdef(opts.onEnter)) opts.onEnter(ev)
    }
  });
  return x;
}
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function addKeys(ofrom, oto) { for (const k in ofrom) if (!oto.hasOwnProperty(k)) oto[k] = ofrom[k]; return oto; }
function addPeepToCrowd() {
  const peep = removeRandomFromArray(availablePeeps)
  const walk = getRandomFromArray(walks)({
    peep,
    props: resetPeep({
      peep,
      stage,
    })
  }).eventCallback('onComplete', () => {
    removePeepFromCrowd(peep)
    addPeepToCrowd()
  })
  peep.walk = walk
  crowd.push(peep)
  crowd.sort((a, b) => a.anchorY - b.anchorY)
  return peep
}
function addPolygonNeighborClick(groupElement, fillColor = 'yellow') {
  if (!groupElement || !(groupElement instanceof SVGGElement)) {
    console.error("Invalid group element.");
    return;
  }
  const polygons = groupElement.querySelectorAll('polygon');
  polygons.forEach(polygon => {
    polygon.addEventListener('click', () => {
      const neighbors = polygon.dataset.neighbors?.split(',') || [];
      neighbors.forEach(id => {
        const neighbor = document.getElementById(id.trim());
        console.log('neighbor', neighbor);
        if (neighbor) {
          neighbor.style.fill = fillColor;
        }
      });
    });
  });
}
function addToolX(cropper, d) {
  let img = cropper.img;
  function createCropTool() {
    let rg = mRadioGroup(d, {}, 'rSizes', 'Select crop area: '); mClass(rg, 'input');
    let handler = cropper.setSize;
    mRadio('manual', [0, 0], 'rSizes', rg, {}, handler, 'rSizes', true)
    let [w, h] = [img.offsetWidth, img.offsetHeight];
    if (w >= 128 && h >= 128) mRadio('128 x 128 (emo)', [128, 128], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 200 && h >= 200) mRadio('200 x 200 (small)', [200, 200], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 300 && h >= 300) mRadio('300 x 300 (medium)', [300, 300], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 400 && h >= 400) mRadio('400 x 400 (large)', [400, 400], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 500 && h >= 500) mRadio('500 x 500 (xlarge)', [500, 500], 'rSizes', rg, {}, handler, 'rSizes', false)
    if (w >= 140 && h >= 200) mRadio('140 x 200 (card)', [140, 200], 'rSizes', rg, {}, handler, 'rSizes', false)
    else {
      let [w1, h1] = [w, w / .7];
      let [w2, h2] = [h * .7, h];
      if (w1 < w2) mRadio(`${w1} x ${h1} (card)`, [w1, h1], 'rSizes', rg, {}, handler, 'rSizes', false)
      else mRadio(`${w2} x ${h2} (card)`, [w2, h2], 'rSizes', rg, {}, handler, 'rSizes', false)
    }
    if (w >= 200 && h >= 140) mRadio('200 x 140 (landscape)', [200, 140], 'rSizes', rg, {}, handler, 'rSizes', false)
    else {
      let [w1, h1] = [w, w * .7];
      let [w2, h2] = [h / .7, h];
      if (w1 < w2) mRadio(`${w1} x ${h1} (landscape)`, [w1, h1], 'rSizes', rg, {}, handler, 'rSizes', false)
      else mRadio(`${w2} x ${h2} (landscape)`, [w2, h2], 'rSizes', rg, {}, handler, 'rSizes', false)
    }
    mDom(rg, { fz: 14, margin: 12 }, { html: '(or use mouse to select)' });
    return rg;
  }
  function createSquareTool() {
    let rg = mRadioGroup(d, {}, 'rSquare', 'Resize (cropped area) to height: '); mClass(rg, 'input');
    let handler = x => squareTo(cropper, x);
    mRadio(`${'just crop'}`, 0, 'rSquare', rg, {}, cropper.crop, 'rSquare', false)
    for (const h of [128, 200, 300, 400, 500, 600, 700, 800]) {
      mRadio(`${h}`, h, 'rSquare', rg, {}, handler, 'rSquare', false)
    }
    return rg;
  }
  let rgCrop = createCropTool();
  let rgResize = createSquareTool();
}
function addTooltip(el, text) {
  let tooltip;
  el.addEventListener("mouseenter", e => {
    tooltip = document.createElement("div");
    tooltip.textContent = text;
    Object.assign(tooltip.style, {
      position: "fixed",
      background: "rgba(0,0,0,0.75)",
      color: "white",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "13px",
      pointerEvents: "none",
      zIndex: 10000,
      whiteSpace: "nowrap",
      transition: "opacity 0.15s ease",
      opacity: "0"
    });
    document.body.appendChild(tooltip);
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.transform = "translate(-50%, -100%)";
    requestAnimationFrame(() => (tooltip.style.opacity = "1"));
  });
  el.addEventListener("mouseleave", () => {
    if (tooltip) {
      tooltip.style.opacity = "0";
      setTimeout(() => tooltip?.remove(), 150);
      tooltip = null;
    }
  });
}
function adjustComplex(panData) {
  let [x0, y0] = [panData.posStart.x, panData.posStart.y];
  let [dx, dy] = [panData.mouse.x - panData.mouseStart.x, panData.mouse.y - panData.mouseStart.y];
  let [wImg, hImg] = [panData.img.width, panData.img.height];
  let ideal = panData.cropStartSize.w;
  let [cx0, cy0] = [panData.cropStartPos.l + ideal / 2, panData.cropStartPos.t + ideal / 2];
  let [cx, cy] = [cx0 + dx, cy0 + dy];
  cx = clamp(cx, ideal / 2, wImg - ideal / 2); cy = clamp(cy, ideal / 2, hImg - ideal / 2);
  let lNew = clamp(cx - ideal / 2, 0, wImg);
  let tNew = clamp(cy - ideal / 2, 0, hImg);
  let rNew = clamp(cx + ideal / 2, 0, wImg);
  let bNew = clamp(cy + ideal / 2, 0, hImg);
  let wNew = Math.min(Math.abs(cx - lNew) * 2, Math.abs(rNew - cx) * 2);
  let hNew = Math.min(Math.abs(cy - tNew) * 2, Math.abs(bNew - cy) * 2);
  mStyle(panData.dCrop, { left: cx - wNew / 2, top: cy - hNew / 2, w: wNew, h: hNew });
}
function adjustCropper(img, dc, sz) {
  let [w, h] = [img.width, img.height];
  let [cx, cy, radx, rady, rad] = [w / 2, h / 2, sz / 2, sz / 2, sz / 2];
  mStyle(dc, { left: cx - radx, top: cy - rady, w: sz, h: sz });
}
function adjustCropperBy(dc, x, y, dx, dy, wImg, hImg, szIdeal) {
  console.log('_________\ndx', dx, 'dy', dy)
  if (nundef(wImg)) {
    mStyle(dc, { left: x + dx, top: y + dy });
    return;
  }
  console.log('image sz', wImg, hImg)
  let [l, t, w, h] = [mGetStyle(dc, 'left'), mGetStyle(dc, 'top'), mGetStyle(dc, 'w'), mGetStyle(dc, 'h')];
  let [cx, cy] = [l + w / 2, t + h / 2];
  let [cxNew, cyNew] = [cx + dx, cy + dy];
  let newDist = Math.min(cxNew, cyNew, wImg - cxNew, hImg - cyNew);
  let wNew = Math.min(szIdeal, newDist * 2);
  let hNew = Math.min(szIdeal, newDist * 2);
  let xNew = cxNew - wNew / 2;
  let yNew = cyNew - hNew / 2;
  mStyle(dc, { left: xNew, top: yNew, w: wNew, h: hNew }); 
}
function agCircle(g, sz) { let r = gEllipse(sz, sz); g.appendChild(r); return r; }
function agColoredShape(g, shape, w, h, color) {
  let f = window[SHAPEFUNCS[shape]];
  f(g, w, h);
  gBg(g, color);
}
function agEllipse(g, w, h) { let r = gEllipse(w, h); g.appendChild(r); return r; }
function agG(g) { let g1 = gG(); g.appendChild(g1); return g1; }
function agHex(g, w, h) { let pts = size2hex(w, h); return agPoly(g, pts); }
function agLine(g, x1, y1, x2, y2) { let r = gLine(x1, y1, x2, y2); g.appendChild(r); return r; }
function agPoly(g, pts) { let r = gPoly(pts); g.appendChild(r); return r; }
function agRect(g, w, h) { let r = gRect(w, h); g.appendChild(r); return r; }
function agShape(g, shape, w, h, color, rounding) {
  let sh = gShape(shape, w, h, color, rounding);
  g.appendChild(sh);
  return sh;
}
function agText(g, txt, fg, bg, font) {
  let res = new gText(g);
  res.text({ txt: txt, fill: fg, bgText: bg, font: font });
  return res;
}
function aggregate_player(fen, prop) {
  let res = [];
  for (const uplayer in fen.players) {
    let list = fen.players[uplayer][prop];
    res = res.concat(list);
  }
  return res;
}
function aggregate_player_hands_by_rank(table) {
  let fen = table.fen;
  let di_ranks = {};
  let akku = [];
  for (const uname in table.players) {
    let pl = table.players[uname];
    let hand = pl.hand;
    for (const c of hand) {
      akku.push(c);
      let r = c[0];
      if (isdef(di_ranks[r])) di_ranks[r] += 1; else di_ranks[r] = 1;
    }
  }
  fen.akku = akku;
  return di_ranks;
}
function allCondDict(d, func) {
  let res = [];
  for (const k in d) { if (func(d[k])) res.push(k); }
  return res;
}
function allElementsFromPoint(x, y) {
  var element, elements = [];
  var old_visibility = [];
  while (true) {
    element = document.elementFromPoint(x, y);
    if (!element || element === document.documentElement) {
      break;
    }
    elements.push(element);
    old_visibility.push(element.style.visibility);
    element.style.visibility = 'hidden';
  }
  for (var k = 0; k < elements.length; k++) {
    elements[k].style.visibility = old_visibility[k];
  }
  elements.reverse();
  return elements;
}
function allNumbers(s) {
  let m = s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
  if (m) return m.map(v => Number(v)); else return [];
}
function alphaToHex(a01) {
  a01 = Math.round(a01 * 100) / 100;
  var alpha = Math.round(a01 * 255);
  var hex = (alpha + 0x10000).toString(16).slice(-2).toUpperCase();
  return hex;
}
function amIHuman(table) { return isPlayerHuman(table, U.name); }
function anim_toggle_face(item, ms = 300, callback = null) {
  let d = iDiv(item);
  mClass(d, 'aniflip');
  TO.anim = setTimeout(() => {
    if (item.faceUp) face_down(item); else face_up(item); mClassRemove(d, 'aniflip');
    if (isdef(callback)) callback();
  }, ms);
}
function animateEndpointsOfActivatedLines() {
  function potentialSelectedPoint(p, l) {
    let d = iDiv(p);
    mClass(d, 'pulseFastInfinite');
    d.style.zIndex = 1000;
    mStyle(d, { cursor: 'pointer' });
    d.onclick = ev => lacunaSelectPointNeu(p, l);
    addIf(B.endPoints, p.id);
  }
  for (const l of B.lines) {
    iDiv(l).style.zIndex = 0;
  }
  for (const l of B.linesActivated) {
    B.possiblePairs.push(l);
    potentialSelectedPoint(l.p1, l);
    potentialSelectedPoint(l.p2, l);
  }
}
function animateProperty(elem, prop, start, middle, end, msDuration, forwards) {
  let kflist = [];
  for (const v of [start, middle, end]) {
    let o = {};
    o[prop] = isString(v) || prop == 'opacity' ? v : '' + v + 'px';
    kflist.push(o);
  }
  let opts = { duration: msDuration };
  if (isdef(forwards)) opts.fill = forwards;
  elem.animate(kflist, opts);
}
function animatedTitle(msg = 'DU BIST DRAN!!!!!') {
  TO.titleInterval = setInterval(() => {
    let idx = WhichCorner++ % CORNERS_BGA.length;
    let corner = CORNERS_BGA[idx];
    document.title = `${corner} ${msg}`; //'⌞&amp;21543;    U+231E \0xE2Fo\u0027o Bar';
  }, 1000);
}
function applyBlendMode(blendCSS) {
  setTexture({ texture: U.texture, bgSize: U.bgSize, bgRepeat: U.bgRepeat, bgBlend: blendCSS }, 'dPage');
  let func = (item, val) => {
    let ch = item.firstChild;
    let text = ch.innerHTML;
    if (text.includes(val)) {
      return true;
    }
    return false;
  }
  changeSelectionStatus(func, blendCSS);
}
function applyColor(bg) {
  setColors({ color: bg });
  let func = (item, val) => {
    let itemUrl = item.getAttribute('datacolor');
    if (itemUrl === val) {
      return true;
    }
    return false;
  }
  changeSelectionStatus(func, bg);
}
function applyOpts(d, opts = {}) {
  const aliases = {
    classes: 'className',
    inner: 'innerHTML',
    html: 'innerHTML',
    w: 'width',
    h: 'height',
  };
  for (const opt in opts) {
    let name = valf(aliases[opt], opt);
    let val = opts[opt];
    if (name == 'recClick') { d.onclick = async (ev) => { recUserEvent(); await val(ev); } }
    else if (['id', 'style', 'tag', 'innerHTML', 'className', 'checked', 'value'].includes(name) || name.startsWith('on')) d[name] = val;
    else d.setAttribute(name, val);
  }
}
function applyTexture(url, bgBlend, bgSize, bgRepeat) {
  console.log(url)
  setTexture({ texture: url, bgBlend, bgSize, bgRepeat }, 'dPage');
  let func = (item, val) => {
    let ch = arrChildren(item);
    assertion(ch.length >= 2, 'item has no children???');
    child = ch[1];
    let itemUrl = child.getAttribute('data-src');
    if (itemUrl === val) {
      return true;
    }
    return false;
  }
  changeSelectionStatus(func, url);
}
function applyTheme(color, url, bgBlend, bgSize, bgRepeat) {
  let key = null;
  if (isDict(color)) {
    key = evToAttr(color, 'theme');
    let theme = jsCopyExceptKeys(M.config.themes[key], ['name']);
    color = theme.color;
    url = theme.texture;
    bgBlend = theme.bgBlend;
    bgSize = theme.bgSize;
    bgRepeat = theme.bgRepeat;
  }
  setColors({ color })
  setTexture({ texture: url, bgBlend, bgSize, bgRepeat }, 'dPage');
  for (const item of arrChildren(mBy('dSettings').firstChild)) {
    item.style.outline = 0;
    item.setAttribute('selected', false);
  }
  if (!key) return;
  let func = (item, val) => {
    let themename = item.getAttribute('theme');
    if (themename === val) {
      return true;
    }
    return false;
  }
  changeSelectionStatus(func, key);
}
function ariContainer(dParent, id, label) {
  let styles = { wmin: 100, hmin: 150, position: 'relative', alignSelf: 'stretch', bg: 'green', fg: 'white', align: 'center' };
  let cont = mDom(dParent, styles, { id });
  if (label) {
    mDom(cont, { position: 'absolute', bottom: 0, w100: true, align: 'center' }, { html: label })
  }
  return cont;
}
function ariFinalizeRumorAssignment(me, table, connections) {
  console.log("All cards assigned:", connections);
}
function ariHideBuildings(ui) {
  for (const b of ui.buildinglist) {
    b.hiddenCards.map(x => face_down(x));
  }
}
function ariRevealBuildings(ui) {
  for (const b of ui.buildinglist) {
    b.hiddenCards.map(x => face_up(x));
  }
  TO.buildings = setTimeout(() => ariHideBuildings(ui), 5000);
}
function ariSetupRumorAssignment(me, table, testing = false) {
  let playerIds = getOtherPlayerNames(table, me);
  let cardIds = table.players[me].rumors;
  let connections = {};
  if (!testing) {
    let dParent = mBy('dInstruction');
    mClear(dParent);
    let d = mDom(dParent, { padding: 10, margin: 10, w100: true }, { className: 'section', }); mCenterFlex(d);
    let line1 = mDom(d, { display: 'flex', gap: 10, margin: 10, place: 'center' },);//mCenterCenterFlex(line1);
    mDom(line1, {}, { html: 'drag user images to rumor cards, then confirm' });
    mButton('commit', async () => ariFinalizeRumorAssignment(me, table, connections), line1, { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectbutton', 'bCommit');
    mStyle(mBy('bCommit'), { border: 'gray' }, { className: 'disabled', disabled: true });
    mLinebreak(d)
    let dg = mGrid(2, table.plorder.length - 1, d, { place: 'center', gap: 10, margin: 20 });
    for (const k of cardIds) {
      let cItem = uiTypeCard52(k, 150);
      let div = cItem.div;
      mAppend(dg, div);
      div.id = k;
      console.log(div.id);
    }
    for (const p of playerIds) {
      let pl = M.users[p];
      let du = mDom(dg, { margin: 10 }, { id: p });
      mAppend(du, get_user_pic(p, 50));
    }
  }
  playerIds.forEach(id => {
    let d = mBy(id);
    let parent = d.parentNode;
    d.setAttribute('data-home', parent.id || 'player-container');
    d.draggable = true;
    d.ondragstart = (ev) => {
      ev.dataTransfer.setData("playerId", id);
    };
  });
  cardIds.forEach(id => {
    let dCard = mBy(id);
    mStyle(dCard, { position: 'relative' });
    dCard.ondragover = (ev) => ev.preventDefault();
    dCard.ondrop = (ev) => {
      ev.preventDefault();
      let newPlayerId = ev.dataTransfer.getData("playerId");
      let newPlayerDiv = mBy(newPlayerId);
      let existingPlayerDiv = Array.from(dCard.children).find(child => playerIds.includes(child.id));
      if (existingPlayerDiv && existingPlayerDiv.id !== newPlayerId) {
        let incomingSource = newPlayerDiv.parentNode;
        mAppend(incomingSource, existingPlayerDiv);
        if (cardIds.includes(incomingSource.id)) {
          mStyle(existingPlayerDiv, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0
          });
          connections[incomingSource.id] = existingPlayerDiv.id;
        } else {
          mStyle(existingPlayerDiv, { position: 'static', transform: 'none' });
        }
      }
      mAppend(dCard, newPlayerDiv);
      mStyle(newPlayerDiv, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        margin: 0
      });
      connections[id] = newPlayerId;
      if (Object.keys(connections).length === cardIds.length) {
        mStyle(mBy('bCommit'), { opacity: 1 });
      }
    };
  });
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
    mDom(dStage, { weight: 'bold', fg: 'red', bg: 'yellow', fz: 24 }, { html: `${fen.stage}: ${ARI.stage[fen.stage]}` })
  }
  let dPlayers = mDom(d1, { maleft: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }, {});
  mDom(dPlayers, { fz: 14, deco: 'underline' }, { html: 'Turn:' });
  if (sameList(list, table.plorder) && list.length > 2) {
    mDom(dPlayers, { maleft: 4 }, { html: 'All' });
  } else {
    for (const plName of list) {
      let pl = table.players[plName];
      let src = `../assets/img/users/${M.users[plName].imgKey}.jpg`;
      if (nundef(src)) { src = `../assets/img/users/unknown_user.jpg`; }
      let cimgborder = pl.color;
      let sz = 20;
      let img = mDom(dPlayers, { cursor: 'pointer', border: `1px solid ${cimgborder}`, maleft: 4, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot' }, { tag: 'img', src });
      img.onclick = () => switchToUser(plName);
    }
  }
  html = fromNormalized(table.friendly) + ' (' + fromNormalized(M.config.games[table.game].friendly) + ')';
  mStyle(d2, {}, { html });
}
function ariStats(me, table) {
  let fen = table.fen;
  let ui = {};
  let [sz, bg, fg, cimgborder] = [50, '#00000050', 'white', 'white']; //return {dTable}
  statsInit(me, table, { sz, bg, fg, cimgborder, className: 'flexCol' });
  let herald = fen.heraldorder[0];
  for (const plName in table.players) {
    let pl = table.players[plName];
    let d = mBy('dStat_' + plName);
    let item = ui[plName] = { div: d, plName };
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
    if (!isEmpty(table.players[plName].stall) && fen.stage >= 5 && fen.stage <= 6) {
      statsCount('shinto_shrine', !fen.actionsCompleted.includes(plName) || fen.stage < 6 ? calc_stall_value(table, plName) : '_', d);
    }
    statsCount('star', plName == U.name || isdef(fen.winners) ? ari_calc_real_vps(table, plName) : ari_calc_fictive_vps(table, plName), d);
    if (plName == herald) {
      let x = mKey('scroll', d, { fg: 'gold', fz: 24, padding: 4 });
      mStyle(x, { position: 'absolute', top: 0, right: 0 });
    }
  }
  return ui;
}
function ari_calc_fictive_vps(table, plName) {
  let pl = table.players[plName];
  let bs = pl.buildings;
  let vps = calc_building_vps(bs);
  return vps;
}
function ari_calc_real_vps(table, plName) {
  let pl = table.players[plName];
  let bs = ari_get_correct_buildings(pl.buildings);
  let vps = calc_building_vps(bs);
  for (const btype in bs) {
    let blist = bs[btype];
    for (const b of blist) {
      let lead = b.list[0];
      if (firstCond(pl.commissions, x => x[0] == lead[0])) {
        vps += 1;
      }
    }
  }
  return vps;
}
function ari_get_correct_buildings(buildings) {
  let bcorrect = { farm: [], estate: [], chateau: [] };
  for (const type in buildings) {
    for (const b of buildings[type]) {
      let list = b.list;
      let lead = list[0];
      let iscorrect = true;
      for (const key of arrFromIndex(list, 1)) {
        if (key[0] != lead[0]) { iscorrect = false; continue; }
      }
      if (iscorrect) {
        lookupAddIfToList(bcorrect, [type], b);
      }
    }
  }
  return bcorrect;
}
function aristo() {
  const rankstr = 'A23456789TJQK*';
  async function process(uname, table, keys, m) { }
  function setup(table) {
    let fen = table.fen = {};
    let options = table.options;
    let players = table.players;
    let plNames = Object.keys(table.players);
    let n = plNames.length;
    let numDecks = fen.numDecks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
    let deck = fen.deck = c52Decks(numDecks).map(x => x + 'n'); arrShuffle(deck);
    let deckCommission = fen.deckCommission = c52Decks(1).map(x => x + 'c'); arrShuffle(deckCommission);
    let deckLuxury = fen.deckLuxury = c52Decks(1).map(x => x + 'l'); arrShuffle(deckLuxury);
    let deckRumors = fen.deckRumors = c52Decks(1).map(x => x + 'r'); arrShuffle(deckRumors);
    table.plorder = jsCopy(plNames);
    arrShuffle(table.plorder);
    fen.market = cDeckDeal(deck, 2);
    fen.deckDiscard = [];
    fen.openDiscard = [];
    fen.commissioned = [];
    fen.openCommissions = exp_commissions(options) ? cDeckDeal(deckCommission, 3) : [];
    fen.church = exp_church(options) ? cDeckDeal(deck, plNames.length) : [];
    for (const plName of plNames) {
      let pl = table.players[plName];
      addKeys({
        hand: cSort(cDeckDeal(deck, 7), null, rankstr),
        commissions: exp_commissions(options) ? cSort(cDeckDeal(deckCommission, 4), null, rankstr) : [],
        rumors: exp_rumors(options) ? cSort(cDeckDeal(deckRumors, Object.keys(players).length - 1), null, rankstr) : [],
        peasants: [],
        peasantsUsed: [],
        journeys: [], //options.journey == 'no' ? [] : coin() ? [['QSr', 'KSr']] : [['3Cr', '4Cr']],
        buildings: { farm: [], estate: [], chateau: [] },
        stall: [],
        stall_value: 0,
        coins: 3,
        vps: 0,
        score: 0,
        name: plName,
        color: pl.color,
      }, pl);
    }
    fen.phase = 'king'; //TODO: king !!!!!!!
    fen.numActions = 0;
    fen.herald = table.plorder[0];
    fen.heraldorder = jsCopy(table.plorder);
    if (exp_rumors(options)) {
      historyAddLines([`gossiping starts`], 'rumors', fen);
      [fen.stage, table.turn] = [24, table.plorder];
    } else if (exp_commissions(options)) {
      historyAddLines([`commission trading starts`], 'commissions', fen);
      [fen.stage, table.turn] = [23, table.plorder];
      fen.commSetupNum = 3; fen.keeppolling = true;
    } else if (exp_journeys(options)) {
      historyAddLines([`journey starts`], 'journey', fen);
      [fen.stage, table.turn] = [1, table.plorder];
    } else {
      [fen.stage, table.turn] = setStallStage(table);
    }
    table.turn = table.turn.sort();
  }
  function present(me, table) { return ari_present(me, table); }
  function activate(me, table, ui) { ari_pre_action(me, table, ui); }
  return { setup, present, activate, process };
}
function arrAllDifferent(arr) {
  const uniqueElements = new Set(arr);
  const allDifferent = uniqueElements.size === arr.length;
  return allDifferent;
}
function arrAllSameOrDifferent(arr) {
  if (arr.length === 0) {
    return true;
  }
  const allSame = arr.every(element => element === arr[0]);
  if (allSame) {
    return true;
  }
  return arrAllDifferent(arr);
}
function arrAverage(arr, prop) {
  if (isDict(arr)) arr = Object.values(arr);
  let n = arr.length; if (!n) return 0;
  let sum = arrSum(arr, prop);
  return sum / n;
}
function arrBalancedAverage(arr, prop) {
  if (arr.length != 2) return arrAverage(arr, prop);
  let o = arrMinMax(arr, x => x[prop]);
  let [min, max] = [o.min, o.max];
  if (max < min * 1000) return (min + max) / 2;
  let s = '' + max; 
  let snew = '';
  for (let i = 0; i < s.length; i++) {
    let ch = s[i];
    if (ch == '0' || ch == '.') snew += ch; else snew += '1';
  }
  let nnew = Number(snew);
  return (min + nnew) / 2;
}
function arrBuckets(arr, func, sortbystr) {
  let di = {};
  for (const a of arr) {
    let val = func(a);
    if (nundef(di[val])) di[val] = { val: val, list: [] };
    di[val].list.push(a);
  }
  let res = []
  let keys = Object.keys(di);
  if (isdef(sortbystr)) {
    keys.sort((a, b) => sortbystr.indexOf(a) - sortbystr.indexOf(b));
  }
  return keys.map(x => di[x]);
}
function arrChildren(elem) { return [...toElem(elem).children]; }
function arrClear(arr) { arr.length = 0; return arr; }
function arrCycle(arr, count) { return arrRotate(arr, count); }
function arrFindKeywordFromIndex(keywords, words, iStart) {
  for (let i = iStart; i < words.length; i++) {
    let w = words[i];
    if (keywords.some(x => x == w)) return { i, w };
  }
  return null;
}
function arrFlatten(arr) {
  let res = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      res.push(arr[i][j]);
    }
  }
  return res;
}
function arrFromIndex(arr, i) { return arr.slice(i); }
function arrIntersect(a, b) { return a.filter(x => b.includes(x)); }
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrMax(arr, f) { return arrMinMax(arr, f).max; }
function arrMin(arr, f) { return arrMinMax(arr, f).min; }
function arrMinMax(arr, func) {
  if (nundef(func)) func = x => x;
  else if (isString(func)) { let val = func; func = x => x[val]; }
  let min = func(arr[0]), max = func(arr[0]), imin = 0, imax = 0;
  for (let i = 1, len = arr.length; i < len; i++) {
    let v = func(arr[i]);
    if (v < min) {
      min = v; imin = i;
    } else if (v > max) {
      max = v; imax = i;
    }
  }
  return { min: min, imin: imin, max: max, imax: imax, elmin: arr[imin], elmax: arr[imax] };
}
function arrMinus(arr, b) {
  if (isList(arr)) {
    if (isList(b)) return arr.filter(x => !b.includes(x)); else return arr.filter(x => x != b);
  } else {
    let dinew = {};
    let keys = isList(b) ? Object.keys(arr).filter(x => !b.includes(x)) : Object.keys(arr).filter(x => x != b);
    for (const k of keys) dinew[k] = arr[k];
    return dinew;
  }
}
function arrNext(list, el) {
  let iturn = list.indexOf(el);
  let elnext = list[(iturn + 1) % list.length];
  return elnext;
}
function arrNoDuplicates(arr) { return [...new Set(arr)]; }
function arrRange(from = 1, to = 10, step = 1) { let res = []; for (let i = from; i <= to; i += step)res.push(i); return res; }
function arrRemoveDuplicates(arr) { return Array.from(new Set(arr)); }
function arrRemovip(arr, el) {
  let i = arr.indexOf(el);
  if (i > -1) arr.splice(i, 1);
  return i;
}
function arrRepeat(arr, n) { return Array(n).fill(arr).flat(); }
function arrReplace1(arr, elweg, eldazu) {
  let i = arr.indexOf(elweg);
  arr[i] = eldazu;
  return arr;
}
function arrRotate(arr, count) {
  var unshift = Array.prototype.unshift,
    splice = Array.prototype.splice;
  var len = arr.length >>> 0, count = count >> 0;
  let arr1 = jsCopy(arr);
  unshift.apply(arr1, splice.call(arr1, count % len, len));
  return arr1;
}
function arrShuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function arrSum(arr, props) {
  if (nundef(props)) return arr.reduce((a, b) => a + b);
  if (!isList(props)) props = [props];
  return arr.reduce((a, b) => a + (lookup(b, props) || 0), 0);
}
function arrTake(arr, n = 0, from = 0) {
  if (isDict(arr)) {
    let keys = Object.keys(arr);
    return n > 0 ? keys.slice(from, from + n).map(x => (arr[x])) : keys.slice(from).map(x => (arr[x]));
  } else return n > 0 ? arr.slice(from, from + n) : arr.slice(from);
}
function arrTakeWhile(arr, func) {
  let res = [];
  for (const a of arr) {
    if (func(a)) res.push(a); else break;
  }
  return res;
}
function arrWithout(arr, b) { return arrMinus(arr, b); }
function arrangeOnCard(dCard, divs, szCard = 300) {
  let n = divs.length;
  const padding = 10;
  const radius = szCard / 2;
  mStyle(dCard, { padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' });
  let d0 = mDom(dCard, {
    w: '92%',
    h: '92%',
    display: 'flex',
    'flex-direction': 'column',
    justifyContent: 'space-around',
    alignItems: 'center'
  });
  const totalCircleArea = Math.PI * Math.pow(radius, 2);
  const targetElementArea = totalCircleArea * 0.46;
  let divMetrics = divs.map((d, index) => {
    let originalSz = d.w ||
      (d.style && parseInt(d.style.width)) ||
      d.offsetWidth ||
      50;
    return { el: d, baseSz: originalSz, index };
  });
  let currentTotalArea = divMetrics.reduce((sum, d) => sum + Math.pow(d.baseSz, 2), 0);
  let idealScaleFactor = Math.sqrt(targetElementArea / currentTotalArea);
  const maxAllowedDimension = szCard / (Math.sqrt(n) * 0.85);
  let [nth, rows, colarr] = layoutCircle(n);
  let maxHeight = (dCard.h - padding * 2) / rows;
  let index = 0;
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
      let sz = metric.baseSz * idealScaleFactor;
      if (sz > maxAllowedDimension) {
        sz = maxAllowedDimension;
      }
      let fontMultiplier = 0.8;
      if (j == colarr[i] - 1 && (i == colarr.length - 1 || i == 0)) {
        fontMultiplier = 0.68;
      }
      let fz = sz * fontMultiplier;
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
        textOverflow: 'contain'
      });
      let dIcon = divEl.firstChild || divEl;
      if (dIcon && dIcon.style) {
        dIcon.style.maxWidth = '100%';
        dIcon.style.maxHeight = '100%';
        dIcon.style.display = 'flex';
        dIcon.style.alignItems = 'center';
        dIcon.style.justifyContent = 'center';
      }
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
  if (typeof mStyle === 'function') {
    mStyle(container, { position: 'relative' });
  } else {
    container.style.position = container.style.position || 'relative';
  }
  const rect = container.getBoundingClientRect();
  const szCard = options.szCard || Math.min(rect.width, rect.height) || 300;
  const radius = szCard / 2;
  const usableRadius = radius - padding;
  if (usableRadius <= 0) return container;
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
      if (ringIndex > n + 5) break;
    }
    return slots;
  }
  function randomSlots(n) {
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
  if (mode === 'random') {
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
  } else {
    slots.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  }
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
  const placed = [];
  const ordered = [...metrics].sort((a, b) => (b.w * b.h) - (a.w * a.h));
  ordered.forEach(item => {
    let { w, h } = item;
    let scale = 1;
    let success = false;
    while (!success && scale >= minScale - 1e-6) {
      const tw = w * scale, th = h * scale;
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
      if (!success) scale -= 0.1;
    }
    if (!success) {
      const tw = w * minScale, th = h * minScale;
      const fallback = slots.shift() || { x: 0, y: 0 };
      placed.push({ x: fallback.x, y: fallback.y, w: tw, h: th, el: item.el });
    }
  });
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
  if (typeof mStyle === 'function') {
    mStyle(container, { position: 'relative' });
  } else {
    container.style.position = container.style.position || 'relative';
  }
  const rect = container.getBoundingClientRect();
  const szCard = options.szCard || Math.min(rect.width, rect.height) || 300;
  const radius = szCard / 2;
  const usableRadius = radius - padding;
  if (usableRadius <= 0) return container;
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
      if (ringIndex > n + 5) break;
    }
    const maxR = slots.reduce((m, s) => Math.max(m, Math.hypot(s.x, s.y)), 0);
    if (maxR > usableRadius) {
      const shrink = usableRadius / maxR;
      for (const s of slots) { s.x *= shrink; s.y *= shrink; }
    }
    return slots;
  }
  function randomSlots(n) {
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
  if (mode === 'random') {
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
  } else {
    slots.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  }
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
  function clampInsideCircle(x, y, w, h) {
    const itemRadius = Math.hypot(w / 2, h / 2);
    const maxCenterDist = Math.max(0, usableRadius - itemRadius);
    const dist = Math.hypot(x, y);
    if (dist <= maxCenterDist || dist === 0) return { x, y };
    const k = maxCenterDist / dist;
    return { x: x * k, y: y * k };
  }
  const maxSpan = metrics.reduce((m, it) => Math.max(m, it.w, it.h), 0);
  const cellSize = Math.max(maxSpan + gap, 8);
  const grid = new Map();
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
  const placed = [];
  const ordered = [...metrics].sort((a, b) => (b.w * b.h) - (a.w * a.h));
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
      while (localR <= maxShift && !success) {
        const steps = localR === 0 ? 1 : 16;
        for (let a = 0; a < steps; a++) {
          const angle = (a / steps) * Math.PI * 2;
          const x = base.x + localR * Math.cos(angle);
          const y = base.y + localR * Math.sin(angle);
          if (!fitsInsideCircle(x, y, tw, th)) continue;
          if (gridHasCollision(x, y, tw, th)) continue;
          const c = clampInsideCircle(x, y, tw, th);
          const node = { x: c.x, y: c.y, w: tw, h: th, el: item.el };
          placed.push(node);
          gridInsert(node);
          success = true;
          break;
        }
        localR += Math.max(4, tw * 0.1);
      }
      if (!success) scale -= 0.1;
    }
    if (!success) {
      const tw = w * minScale, th = h * minScale;
      const c = clampInsideCircle(base.x, base.y, tw, th);
      const node = { x: c.x, y: c.y, w: tw, h: th, el: item.el };
      placed.push(node);
      gridInsert(node);
    }
  });
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
  if (typeof mStyle === 'function') {
    mStyle(container, { position: 'relative' });
  } else {
    container.style.position = container.style.position || 'relative';
  }
  const rect = container.getBoundingClientRect();
  const szCard = options.szCard || Math.min(rect.width, rect.height) || 300;
  const radius = szCard / 2;
  const usableRadius = radius - padding;
  if (usableRadius <= 0) return container;
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
      if (ringIndex > n + 5) break;
    }
    const maxR = slots.reduce((m, s) => Math.max(m, Math.hypot(s.x, s.y)), 0);
    if (maxR > usableRadius) {
      const shrink = usableRadius / maxR;
      for (const s of slots) { s.x *= shrink; s.y *= shrink; }
    }
    return slots;
  }
  function randomSlots(n) {
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
  if (mode === 'random') {
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
  } else {
    slots.sort((a, b) => Math.hypot(a.x, a.y) - Math.hypot(b.x, b.y));
  }
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
  function clampInsideCircle(x, y, w, h) {
    const itemRadius = Math.hypot(w / 2, h / 2);
    const maxCenterDist = Math.max(0, usableRadius - itemRadius);
    const dist = Math.hypot(x, y);
    if (dist <= maxCenterDist || dist === 0) return { x, y };
    const k = maxCenterDist / dist;
    return { x: x * k, y: y * k };
  }
  const maxSpan = metrics.reduce((m, it) => Math.max(m, it.w, it.h), 0);
  const cellSize = Math.max(maxSpan + gap, 8);
  const grid = new Map();
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
  const placed = [];
  const ordered = [...metrics].sort((a, b) => (b.w * b.h) - (a.w * a.h));
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
      while (localR <= maxShift && !success) {
        const steps = localR === 0 ? 1 : 16;
        for (let a = 0; a < steps; a++) {
          const angle = (a / steps) * Math.PI * 2;
          const x = base.x + localR * Math.cos(angle);
          const y = base.y + localR * Math.sin(angle);
          if (!fitsInsideCircle(x, y, tw, th)) continue;
          if (gridHasCollision(x, y, tw, th)) continue;
          const c = clampInsideCircle(x, y, tw, th);
          const node = { x: c.x, y: c.y, w: tw, h: th, el: item.el };
          placed.push(node);
          gridInsert(node);
          success = true;
          break;
        }
        localR += Math.max(4, tw * 0.1);
      }
      if (!success) scale -= 0.1;
    }
    if (!success) {
      const tw = w * minScale, th = h * minScale;
      const c = clampInsideCircle(base.x, base.y, tw, th);
      const node = { x: c.x, y: c.y, w: tw, h: th, el: item.el };
      placed.push(node);
      gridInsert(node);
    }
  });
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
function assertion(cond) {
  if (!cond) {
    let args = [...arguments];
    for (const a of args) {
      console.log('\n', a);
    }
    throw new Error('TERMINATING!!!')
  }
}
function assignKeywordsByCounts(counts, keywords) {
  if (!Array.isArray(counts) || !Array.isArray(keywords))
    throw new Error("Both arguments must be arrays.");
  if (counts.length === 0 || keywords.length === 0)
    return [];
  if (counts.length > keywords.length)
    throw new Error("Not enough unique keywords for the given counts.");
  const chosenKeywords = keywords;
  const result = [];
  for (let i = 0; i < counts.length; i++) {
    const kw = chosenKeywords[i];
    for (let j = 0; j < counts[i]; j++) {
      result.push(kw);
    }
  }
  return result;
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
    if (success) {
      newTable.players[uname].score += 1;
      renewSet(newTable.fen);
    } else {
      newTable.players[uname].score -= 1;
    }
    newTable.action = { plName: uname, step: newTable.step, action: { success }, success };
    let res = await tableSaveUpdateFS(newTable);
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
function bgImageFromPath(path) { return isdef(path) ? `url('${path}')` : null; }
function bid_to_string(bid) { return bid.join(' '); }
async function blogSaveAll() {
  function replaceDivs(str) {
    return str.replaceAll('<div>', '<br>').replaceAll('</div>', '');
  }
  let blog = DA.blogs;
  let list = dict2list(blog);
  for (const bl of list) {
    let d = bl.dParts;
    let chi = arrChildren(d);
    let parts = [];
    let prevType = null;
    let prevText = null;
    for (const ch of chi) {
      let type = ch.getAttribute('type'); 
      if (type == 'text') {
        let txt = ch.innerHTML;
        txt = replaceDivs(txt);
        if (isdef(prevText)) txt = prevText + '<br>' + txt;
        prevType = 'text';
        prevText = txt;
      } else {
        if (isdef(prevText)) { parts.push(prevText); prevText = null; }
        prevType = type;
        if (type == 'image') {
          parts.push(ch.src);
        } else if (!type) {
          console.log('need to save image data', ch)
          saveBase64Image(ch, 'img1.jpg');
        }
      }
    }
    bl.parts = parts;
  }
  let di = {};
  for (const el of list) {
    di[el.key] = { title: el.o.title, text: el.parts };
  }
  let text = jsyaml.dump(di);
  let res = await mPhpPostFile(text, 'zdata/blog1.yaml');
  return res;
}
function blogShow(d, key, o) {
  let dBlog = mDom(d, { fz: 20, className: 'collapsible' }, { key });
  mDom(dBlog, { className: 'title' }, { html: `${key}: ${o.title}` });
  let dParts = mDom(dBlog, { className: 'sortable' });
  let blogItem = { o, key, div: dBlog, dParts, items: [] }
  for (let textPart of o.text) {
    let d2, type;
    if (textPart.includes('blogimages/')) {
      type = 'image'
      d2 = mDom(dParts, { w100: true }, { tag: 'img', src: textPart, type });
    } else {
      type = 'text'
      d2 = mDom(dParts, { caret: 'white', padding: 2, outline: '' }, { html: textPart, contenteditable: true, type });
    }
    let item = { key, text: textPart, div: d2, type };
    blogItem.items.push(item);
  }
  mDom(dParts, { patop: 5, pabottom: 2 }, { html: '<hr>', type: 'line' });
  return blogItem;
}
function blogShowAll(d, blog) {
  let dates = Object.keys(blog);
  dates.sort((a, b) => new Date(b) - new Date(a));
  let di = {};
  for (const date of dates) {
    di[date] = blogShow(d, date, blog[date]);
  }
  return di;
}
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
    let newTable = gtCopy(table);
    let fen = newTable.fen;
    let players = newTable.players;
    let oldbid = jsCopy(fen.oldbid);
    let bid = jsCopy(fen.newbid);
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
    let { ralist, wildcards } = createRankList([table.turn], table);
    ralist = ralist.filter(x => x.value >= 1);
    let lastbid = fen.lastbid;
    let bids = []
    if (nundef(lastbid)) {
      let b = createRealisticRandomStartingBid(table, ralist, wildcards);
      let p = calculateBidProbability(ralist, wildcards, b);
      if (TESTING) {
      }
      if (p < .2 && b[0] > 2) b[0] -= 2;
      else if (p < .5 && b[0] > 1) b[0]--;
      if (TESTING) {
        p = calculateBidProbability(ralist, wildcards, b);
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
      }
      let lastBitCorrect = calc_bid_minus_cards(table, lastbid) <= 0;
      let bCorrect = calc_bid_minus_cards(table, b) <= 0;
      let bAltCorrect = calc_bid_minus_cards(table, bAlt) <= 0;
      b = normalize_bid(b);
      bAlt = normalize_bid(bAlt);
      console.log('b', b)
      console.log('bAlt', bAlt)
      if (lastBitCorrect && bCorrect) {
        bids.push(b);
      } else if (!lastBitCorrect && !bCorrect) {
        bids.push(bAlt); bids.push('gehtHoch');
      } else { bids.push(bAlt); bids.push(b); bids.push('gehtHoch');console.log('3') }
    }
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
    if (botturn) {
      TO.botsleep = await mSleep(3000);
      let bot = table.turn[0];
      let b = rChoose(bids);
      if (b == 'gehtHoch') {
        await processGehtHoch(bot, table);
      } else {
        table.fen.oldbid = valf(lastbid, ['_', '_', '_', '_']);
        table.fen.newbid = b;
        let moveSent = await processBid(bot, table);
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
    let availableRanks = sortedRalist.map(x => x.rank);
    /* 2. Parse the incoming bid */
    let oldCount1 = Number(bid[0]) || 0;
    let oldRank1 = torank[bid[1]] || '_';
    let oldCount2 = bid[2] === '_' ? 0 : (Number(bid[2]) || 0);
    let oldRank2 = torank[bid[3]] || '_';
    let oldVolume = oldCount1 + oldCount2;
    /* 3. Systematically generate ALL structural bids up to an expanded volume tier */
    let allPossibleBids = [];
    for (let totalVolume = 1; totalVolume <= 30; totalVolume++) {
      let tierBids = [];
      availableRanks.forEach(r1 => {
        tierBids.push({
          bid: [totalVolume, toword[r1], '_', '_'],
          volume: totalVolume,
          isSplit: false,
          rankIdx1: rankOrder.indexOf(r1),
          rankIdx2: -1
        });
      });
      availableRanks.forEach(r1 => {
        availableRanks.forEach(r2 => {
          if (r1 === r2) return;
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
        if (a.isSplit !== b.isSplit) return a.isSplit ? 1 : -1;
        if (a.rankIdx1 !== b.rankIdx1) return a.rankIdx1 - b.rankIdx1;
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
      let matchingCardsInDeck = NATURALS_PER_RANK + WILDCARDS_IN_DECK;
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
      totalMatchingBidCards = NATURALS_PER_RANK + NATURALS_PER_RANK + WILDCARDS_IN_DECK;
    } else {
      totalMatchingBidCards = NATURALS_PER_RANK + WILDCARDS_IN_DECK;
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
    strategyPool.push(() => [count1 + 1, rankWord1, currentBid[2], rankWord2]);
    if (count2 > 0 && rankWord2 !== '_') {
      strategyPool.push(() => [count2, rankWord2, count1, rankWord1]);
    }
    let upSymbol1 = getNextUniqueRankSymbol(symbol1, symbol2);
    if (upSymbol1) {
      strategyPool.push(() => [count1, toword[upSymbol1], currentBid[2], rankWord2]);
    }
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
    let currentRankSymbol = torank[currentRankWord];
    let currentIndex = rankOrder.indexOf(currentRankSymbol);
    if (currentIndex === -1 || currentIndex === rankOrder.length - 1) {
      return null;
    }
    let higherSymbols = rankOrder.slice(currentIndex + 1).split('');
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
function bluff_convert2ranks(b) { return [b[0], BLUFF.torank[b[1]], b[2] == '_' ? 0 : b[2], BLUFF.torank[b[3]]]; }
function bluff_convert2words(b) { return [b[0], BLUFF.toword[b[1]], b[2] < 1 ? '_' : b[2], BLUFF.toword[b[3]]]; }
function c52Deck() {
  return combineLetters(['A23456789TJQK', 'SHDC']);
}
function c52Decks(n) {
  return arrRepeat(c52Deck(), n);
}
function c52Sort(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
  return hand.sort((a, b) => {
    if (bySuit) {
      const suitDiff = suits.indexOf(a[1]) - suits.indexOf(b[1]);
      if (suitDiff !== 0) return suitDiff;
    }
    if (byRank) {
      return rankstr.indexOf(a[0]) - rankstr.indexOf(b[0]);
    }
    return 0;
  });
}
function cBlank(dParent, styles = {}, opts = {}) {
  if (nundef(styles.h)) styles.h = valf(styles.sz, 100);
  if (nundef(styles.w)) styles.w = styles.h * .7;
  if (nundef(styles.bg)) styles.bg = 'white';
  styles.position = 'relative';
  if (nundef(styles.rounding)) styles.rounding = Math.min(styles.w, styles.h) / 21;
  addKeys({ className: 'card' }, opts);
  let d = mDom(dParent, styles, opts);
  opts.type = 'card';
  addKeys(styles, opts);
  let item = mItem(d ? { div: d } : {}, opts);
  return item;
}
function cDeckDeal(deck, n) { return deck.splice(0, n); }
function cFlip(card, callback) {
  let child = card.div;
  let a = ANIM.flipcard = aFlip(child, 800, 'ease-in');
  a.onfinish = () => { toggle_face(card); if (isdef(callback)) callback(); };
  return a;
}
function cPortrait(dParent, styles = {}, opts = {}) {
  if (nundef(styles.h)) styles.h = 100;
  if (nundef(styles.w)) styles.w = styles.h * .7;
  return cBlank(dParent, styles, opts);
}
function cPrintSym(card, sym, styles, pos) {
  let d = iDiv(card);
  let opts = {};
  if (isNumber(sym)) {
    opts.html = sym;
  } else if (sym.includes('/')) {
    opts.tag = 'img';
    opts.src = sym;
  }
  let d1 = mDom(d, styles, opts);
  mPlace(d1, pos, pos[0] == 'c' ? 0 : 2, pos[1] == 'c' ? 0 : 2);
}
function cRound(dParent, styles = {}, opts = {}) {
  styles.w = valf(styles.w, 100);
  styles.h = valf(styles.h, 100);
  styles.rounding = '50%';
  return cBlank(dParent, styles, opts);
}
function cSort(hand, suits = null, ranks = null) {
  const sMap = suits ? Object.fromEntries([...suits].map((s, i) => [s, i])) : {};
  const rMap = ranks ? Object.fromEntries([...ranks].map((r, i) => [r, i])) : {};
  return hand.sort((a, b) => {
    const { [1]: sA, [0]: rA } = a.key ?? a;
    const { [1]: sB, [0]: rB } = b.key ?? b;
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
function cSplayDiagonal(cards, dParent, splay = 0.25) {
  const n = cards.length;
  let rc = Math.max(n, 1);
  let dg = mGrid(rc, rc, dParent, { gap: 0, padding: 20 });
  if (n === 0) return dg;
  const cardW = cards[0].w;
  const cardH = cards[0].h;
  const offW = cardW * splay;
  const offH = cardH * splay;
  const colTemplate = `repeat(${n - 1}, ${offW}px) ${cardW}px`;
  const rowTemplate = `repeat(${n - 1}, ${offH}px) ${cardH}px`;
  dg.style.display = 'inline-grid';
  dg.style.gridTemplateColumns = colTemplate;
  dg.style.gridTemplateRows = rowTemplate;
  cards.forEach((c, i) => {
    let dc = iDiv(c);
    mAppend(dg, dc);
    dc.style.gridColumn = i + 1;
    dc.style.gridRow = i + 1;
    dc.style.margin = "0";
    dc.style.width = `${cardW}px`;
    dc.style.height = `${cardH}px`;
    dc.style.zIndex = i;
  });
  return dg;
}
function cal_num_syms_adaptive(me, table) {
  let [fen, players, uplayer] = [table.fen, table.players, me];
  let pl = players[uplayer];
  let by_score = dict2list(players);
  let avg_score = 0;
  for (const pl of by_score) { avg_score += pl.score; }
  avg_score /= by_score.length;
  let di = { nasi: -3, gul: -3, sheeba: -2, mimi: -1, annabel: 1 };
  let baseline = valf(di[uplayer], 0);
  let dn = baseline + Math.floor(pl.score - avg_score);
  let n = table.options.num_symbols;
  let nfinal = Math.max(4, Math.min(table.options.max_count, dn + n));
  return nfinal;
}
function calcBotLevel(table) {
  let humanPlayers = dict2list(table.players).filter(x => x.playmode == 'human');
  if (isEmpty(humanPlayers) || getGameOption('use_level') == 'no') return null;
  let level = arrAverage(humanPlayers, 'level');
  return level;
}
function calcCardSize(rows, cols, wmax, hmax, wbyhRatio = 2) {
  if (nundef(hmax)) hmax = window.innerHeight;
  if (nundef(wmax)) wmax = window.innerWidth;
  var h1 = Math.floor(hmax / rows);
  var w1 = Math.floor(wbyhRatio * h1);
  var w2 = Math.floor(wmax / cols);
  let hbywRatio = 1 / wbyhRatio;
  var h2 = Math.floor(hbywRatio * w2);
  var h = Math.min(h1, h2);
  var w = Math.min(w1, w2);
  return { w, h };
}
function calcLifespan(s) {
  let arr = allNumbers(s, Math.abs);
  let num, unit, lifespan;
  if (!isEmpty(arr)) {
    if (arr.length > 2) arr = arr.slice(0, 2)
    let n = arrAverage(arr);
    unit = s.includes('year') ? 'y' : s.includes('month') ? 'm' : s.includes('week') ? 'w' : s.includes('day') ? 'd' : s.includes('hour') ? 'h' : 'y';
    num = calcYears(n, unit);
    lifespan = yearsToReadable(num);
  } else {
    let s1 = s.toLowerCase();
    let words = toWords(s1);
    if (s1.includes('a few')) {
      unit = wordAfter(words, 'few');
      let n = calcYears(3, unit);
      arr.push(n);
    }
    if (s1.includes('several')) {
      unit = wordAfter(words, 'several'); 
      let n = calcYears(3, unit);
      arr.push(n);
      let next = wordAfter(words, unit);
      if (next == 'to') {
        unit = wordAfter(words, 'to'); 
        if (['day', 'week', 'month', 'year'].some(x => unit.startsWith(x))) {
          let n = calcYears(3, unit);
          arr.push(n);
        }
      }
    }
    let di = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20 };
    for (const w of Object.keys(di)) {
      if (s.includes(w)) {
        let n = calcYears(di[w], stringAfter(s, w));
        arr.push(n);
      }
    }
    let n = arrAverage(arr);
    unit = 'year';
    lifespan = yearsToReadable(n);
    num = allNumbers(lifespan)[0];
    unit = stringAfter(lifespan, ' ');
  }
  unit = unit[0];
  return { s, text: lifespan, num, unit };
}
function calcNumericInfo(str, diunit, base) {
  if (nundef(str)) return { str: '', num: 0, base, text: '' };
  let s = str.toLowerCase(); s = replaceAll(s, '-', ' ');
  let words1 = stringSplit(s);
  let words = words1.map(x => x == 'few' || x == 'several' ? 3 : x); //console.log(words)
  let arr = allNumbers(words.join(' ')); //console.log(arr)
  if (isEmpty(arr)) {
    console.log('could NOT find any numbers!!!!')
    return { str, num: 1, unit: base, text: s };
  }
  let num, unit, text;
  let units = Object.keys(diunit);
  let arrunits = [];
  let unitFound = base;
  for (const n of arr) {
    let i = words.indexOf('' + n); //console.log('...',n,arr,words,i); //return;
    unit = arrFindKeywordFromIndex(units, words, i);
    if (unit) {
      unitFound = unit.w;
      arrunits.push({ n, unit: unit.w });
    }
    words = words.slice(i + 1);
  }
  for (const o of arrunits) {
    o.nnorm = o.n * diunit[o.unit];
  }
  let avg = arrBalancedAverage(arrunits, 'nnorm'); //let av2=arrBalancedAverage(arrunits,'nnorm')
  unit = arrunits[0].unit;
  num = avg / diunit[unit];
  text = `${num.toFixed(1)} ${unit}`;
  return { str, num, unit, text, avg };
}
function calcOffsprings(str) {
  let s = str.toLowerCase(); s = replaceAll(s, '-', ' '); s = replaceAll(s, ',', '');
  if (s.includes('incub')) s = stringBefore(s, 'incub');
  let arr = allNumbers(s);
  if (isEmpty(arr) && s.includes('hundred') && s.includes('thousand')) { s = s.replace('hundred', '100 '); s = s.replace('thousand', '1000 '); arr = [100, 1000]; }
  else if (isEmpty(arr) && s.includes('hundred')) { s = s.replace('hundred', '100 '); arr = [100]; }
  else if (isEmpty(arr) && s.includes('thousand')) { s = s.replace('thousand', '1000 '); arr = [1000]; }
  else if (isEmpty(arr) && s.includes('ten')) { s = s.replace('ten', '10 '); arr = [10]; }
  else if (isEmpty(arr) && s.includes('dozen')) { s = s.replace('dozen', '20 '); arr = [20]; }
  let words = toWords(s).filter(x => x != 's');
  if (isEmpty(arr)) return 1;
  let newarr = [];
  for (const n of arr) {
    let w = wordAfter(words, n);
    if (isdef(w) && ['day', 'month', 'week', 'year'].some(x => w.includes(x))) break;
    newarr.push(n);
  }
  let num = arrAverage(newarr);
  let text = newarr.length > 1 ? `${newarr[0]}-${newarr[1]} children}` : `${num} child${num == 1 ? '' : 'ren'}`;
  return { str, num, unit: 'child', text };
}
function calcRows(fontSize, fontFamily, content, maxWidth) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = `${fontSize}px ${fontFamily}`;
  const words = ('' + content).split(' ');
  let line = '';
  let rows = 0;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      rows++;
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  if (line.length > 0) {
    rows++;
  }
  return rows;
}
function calcRowsCols(num, rows, cols) {
  const table = {
    2: { rows: 1, cols: 2 },
    5: { rows: 2, cols: 3 },
    7: { rows: 2, cols: 4 },
    11: { rows: 3, cols: 4 },
  };
  let shape = 'rect';
  if (isdef(rows) && isdef(cols)) {
  } else if (isdef(table[num])) {
    return table[num];
  } else if (isdef(rows)) {
    cols = Math.ceil(num / rows);
  } else if (isdef(cols)) {
    rows = Math.ceil(num / cols);
  } else if (num == 2) {
    rows = 1; cols = 2;
  } else if ([4, 6, 9, 12, 16, 20, 25, 30, 36, 42, 49, 56, 64].includes(num)) {
    rows = Math.floor(Math.sqrt(num));
    cols = Math.ceil(Math.sqrt(num));
  } else if ([3, 8, 15, 24, 35, 48, 63].includes(num)) {
    let lower = Math.floor(Math.sqrt(num));
    console.assert(num == lower * (lower + 2), 'RECHNUNG FALSCH IN calcRowsCols');
    rows = lower;
    cols = lower + 2;
  } else if (num > 1 && num < 10) {
    shape = 'circle';
  } else if (num > 16 && 0 == num % 4) {
    rows = 4; cols = num / 4;
  } else if (num > 9 && 0 == num % 3) {
    rows = 3; cols = num / 3;
  } else if (0 == num % 2) {
    rows = 2; cols = num / 2;
  } else {
    rows = 1; cols = num;
  }
  return { rows: rows, cols: cols, recommendedShape: shape };
}
function calcSize(str) {
  return calcNumericInfo(str, { cm: .01, centimeter: .01, centimeters: .01, mm: .001, millimeter: .001, millimeters: .001, meter: 1, meters: 1, m: 1 }, 'm');
}
function calcSizeAbWo(n, rows, cols, wmax, hmax, wimax = 200, himax = 200, fw = 1, fh = 1) {
  if (nundef(cols)) cols = Math.ceil(n / rows); else if (nundef(rows)) rows = Math.ceil(n / cols);
  let wi = wmax * fw / cols;
  let hi = hmax * fh / rows;
  wi = Math.min(wi, wimax);
  hi = Math.min(hi, himax);
  return [wi, hi, rows, cols];
}
function calcWeight(str) {
  return calcNumericInfo(str, { kg: 1, kilogram: 1, kilograms: 1, mg: .000001, milligram: .000001, milligrams: .000001, grams: .001, gram: .001, g: .001, ton: 1000, tons: 1000 }, 'kg');
}
function calcYears(n, unit) {
  let ch = unit[0];
  let frac = ch == 'y' ? 1 : ch == 'm' ? 12 : ch == 'w' ? 52 : ch == 'd' ? 365 : ch == 'h' ? 365 * 24 : 1;
  return n / frac;
}
function calc_bid_minus_cards(table, bid) {
  let di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
  let di_ranks = aggregate_player_hands_by_rank(table);
  let [brauch1, r1, brauch2, r2] = bid;
  [r1, r2] = [di2[r1], di2[r2]];
  if (brauch1 == '_') brauch1 = 0;
  if (brauch2 == '_') brauch2 = 0;
  let hab1 = valf(di_ranks[r1], 0);
  let hab2 = valf(di_ranks[r2], 0);
  let wildcards = valf(di_ranks['2'], 0);
  let diff1 = Math.max(0, brauch1 - hab1);
  let diff2 = Math.max(0, brauch2 - hab2);
  return diff1 + diff2 - wildcards;
}
function calc_building_vps(bs) {
  let res = 0;
  res += bs.farm.length;
  res += bs.estate.length * 2;
  res += bs.chateau.length * 3;
  return res;
}
function calc_syms(numSyms) {
  let n = numSyms, rows, realrows, colarr;
  if (n == 3) { rows = 2; realrows = 1; colarr = [1, 2]; }
  else if (n == 4) { rows = 2; realrows = 2; colarr = [2, 2]; }
  else if (n == 5) { rows = 3; realrows = 3; colarr = [1, 3, 1]; }
  else if (n == 6) { rows = 3.3; realrows = 3; colarr = [2, 3, 1]; }
  else if (n == 7) { rows = 3; realrows = 3; colarr = [2, 3, 2]; }
  else if (n == 8) { rows = 3.8; realrows = 4; colarr = [1, 3, 3, 1]; }
  else if (n == 9) { rows = 4; realrows = 4; colarr = [2, 3, 3, 1]; }
  else if (n == 10) { rows = 4; realrows = 4; colarr = [2, 3, 3, 2]; }
  else if (n == 11) { rows = 4.5; realrows = 4; colarr = [2, 3, 4, 2]; }
  else if (n == 12) { rows = 5; realrows = 5; colarr = [1, 3, 4, 3, 1]; }
  else if (n == 13) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 1]; }
  else if (n == 14) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 2]; }
  else if (n == 15) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 3, 2]; }
  else if (n == 16) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 4, 2]; }
  else if (n == 17) { rows = 5.5; realrows = 5; colarr = [2, 4, 5, 4, 2]; }
  else if (n == 18) { rows = 5.8; realrows = 5; colarr = [2, 4, 5, 4, 3]; }
  return [rows, realrows, colarr];
}
function calculateCells(n, containerWidth, containerHeight, itemRatio = 1) {
  let best = { cols: 1, rows: n, score: Infinity, w: 0, h: 0 };
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;
    const actualRatio = cellWidth / cellHeight;
    const score = Math.abs(actualRatio - itemRatio);
    if (score < best.score) {
      best = {
        cols,
        rows,
        score,
        w: cellWidth,
        h: cellHeight
      };
    }
  }
  return best;
}
function calculateEmojiCircleMetrics(emojiHtml, fontSize = 100, fontFamily = 'emoNoto') {
  let emoji = emojiHtml;
  if (emojiHtml.startsWith('&')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = emojiHtml;
    emoji = tempDiv.textContent;
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const size = fontSize * 2.5;
  canvas.width = size;
  canvas.height = size;
  const cx = size / 2;
  const cy = size / 2;
  ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, cy);
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  let minX = size, maxX = 0, minY = size, maxY = 0;
  let activePixels = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const alphaIndex = (y * size + x) * 4 + 3;
      if (data[alphaIndex] > 15) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        activePixels.push({ x, y });
      }
    }
  }
  if (activePixels.length === 0) {
    return { radius: 0, coveragePercentage: 0, pixelCount: 0 };
  }
  const visualCenterX = (minX + maxX) / 2;
  const visualCenterY = (minY + maxY) / 2;
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
  const circleAreaPixels = Math.PI * maxDistanceSq;
  const totalVisiblePixels = activePixels.length;
  const coveragePercentage = (totalVisiblePixels / circleAreaPixels) * 100;
  return {
    radius: parseFloat(radius.toFixed(2)),
    coveragePercentage: parseFloat(coveragePercentage.toFixed(2)),
    pixelCount: totalVisiblePixels
  };
}
function calculateEmojiMetrics(emojiHtmlCode, fontSize, rotateAngle, fontFamily = 'emoNoto') {
  let emoji = emojiHtmlCode;
  if (emojiHtmlCode.startsWith('&')) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = emojiHtmlCode;
    emoji = tempDiv.textContent;
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const pad = fontSize * 1.5;
  const size = fontSize * 2 + pad;
  canvas.width = size;
  canvas.height = size;
  const cx = size / 2;
  const cy = size / 2;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotateAngle * Math.PI) / 180);
  ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, 0, 0);
  ctx.restore();
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  let minX = size, maxX = 0, minY = size, maxY = 0;
  let hasPixels = false;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const alphaIndex = (y * size + x) * 4 + 3;
      if (data[alphaIndex] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        hasPixels = true;
      }
    }
  }
  if (!hasPixels) {
    return { centerX: cx, centerY: cy, radius: fontSize / 2 };
  }
  const visualCenterX = (minX + maxX) / 2;
  const visualCenterY = (minY + maxY) / 2;
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
function calculateKeyMetrics(list, key) {
  const values = list
    .map(obj => obj[key])
    .filter(val => typeof val === 'number' && !isNaN(val));
  if (values.length === 0) return null;
  values.sort((a, b) => a - b);
  const min = values[0];
  const max = values[values.length - 1];
  const sum = values.reduce((total, val) => total + val, 0);
  const avg = sum / values.length;
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
function calculateSecondsDifference(timestamp1, timestamp2) {
  const differenceInMilliseconds = Math.abs(timestamp1 - timestamp2);
  const differenceInSeconds = Math.ceil(differenceInMilliseconds / 1000);
  return differenceInSeconds;
}
function canAct() { return (aiActivated || uiActivated) && !auxOpen; }
function capitalize(s) {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function cardFromInfo(info, h, w, ov) {
  let svgCode = M.c52[info.c52key];
  let ckey = info.key;
  if (info.rank == '*') {
    let color = get_color_of_card(ckey);
    if (color != 'red') svgCode = colored_jolly(color);
  }
  svgCode = '<div>' + svgCode + '</div>';
  let el = mCreateFrom(svgCode);
  h = valf(h, valf(info.h, 100));
  w = valf(w, h * .7);
  mSize(el, w, h);
  let res = {};
  copyKeys(info, res);
  copyKeys({ w: w, h: h, faceUp: true, div: el }, res);
  if (isdef(ov)) res.ov = ov;
  return res;
}
function centerAt(elem, x, y) {
  const rect = elem.getBoundingClientRect();
  const offsetX = x - rect.width / 2;
  const offsetY = y - rect.height / 2;
  elem.style.position = 'absolute';
  elem.style.left = `${offsetX}px`;
  elem.style.top = `${offsetY}px`;
}
function centerOfDiv(div) {
  const rect = div.getBoundingClientRect();
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  return {
    x: rect.left + scrollLeft + rect.width / 2,
    y: rect.top + scrollTop + rect.height / 2
  };
}
function centerVerticalOneLine(elem, h) {
  if (nundef(h)) h = elem.offsetHeight;
  mStyle(elem.hline, h);
}
function changeSelectionStatus(func, val) {
  let dParent = mBy('dSettings').firstChild;
  let items = arrChildren(dParent);
  let oldItem = null, newItem = null;
  for (const item of items) {
    let outline = item.style.outline;
    if (outline.includes('yellow')) {
      oldItem = item;
    }
    if (func(item, val)) { newItem = item; }
  }
  if (isdef(oldItem)) { oldItem.setAttribute('selected', false); oldItem.style.outline = 0; }
  if (isdef(newItem)) { newItem.setAttribute('selected', true); mStyle(newItem, { outline: '3px solid yellow' }); }
}
function checkPlayerBusy() { return Object.values(DA.selectedItems).length > 0; }
function checkShowCommitButton(items, n, callback) {
  let selectedItems = items.filter(x => x.state === 'selected');
  if (selectedItems.length === n) {
    mStyle('bCommit', { opacity: 1 });
  } else {
    mStyle('bCommit', { opacity: 0 });
  }
}
function checkToInput(ev, inp, grid) {
  let checklist = Array.from(grid.querySelectorAll('input[type="checkbox"]')); //chks=items.map(x=>iDiv(x).firstChild);
  let names = checklist.filter(x => x.checked).map(x => x.name);
  sortCheckboxes(grid);
  names.sort();
  inp.value = names.join(', ') + ', ';
}
function choose(arr, n, excepti) { return rChoose(arr, n, null, excepti); }
function chooseRandom(arr) { return rChoose(arr); }
function circleCenters(rows, cols, wCell, hCell) {
  let [w, h] = [cols * wCell, rows * hCell];
  let cx = w / 2;
  let cy = h / 2;
  let centers = [{ x: cx, y: cy }];
  let rx = cx + wCell / 2; let dradx = rx / wCell;
  let ry = cy + hCell / 2; let drady = ry / hCell;
  let nSchichten = Math.floor(Math.min(dradx, drady));
  for (let i = 1; i < nSchichten; i++) {
    let [newCenters, wsch, hsch] = oneCircleCenters(i * 2 + 1, i * 2 + 1, wCell, hCell);
    for (const nc of newCenters) {
      centers.push({ x: nc.x + cx - wsch / 2, y: nc.y + cy - hsch / 2 });
    }
  }
  return [centers, wCell * cols, hCell * rows];
}
function clamp(x, min, max) { return Math.min(Math.max(x, min), max); }
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
function clear_screen() { mShieldsOff(); clear_status(); clear_title(); for (const ch of arrChildren('dScreen')) mClear(ch); mClassRemove('dTexture', 'wood'); mStyle(document.body, { bg: 'white', fg: 'black' }); }
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
async function clickOn(tag, text) {
  let parent = isDict(tag) ? tag : document;
  let list = nundef(text) ? [...parent.querySelectorAll('*')] : [...parent.querySelectorAll(tag), ...parent.querySelectorAll(`[${tag}]`)];
  const d = list.map(fs => fs.value == text || [...fs.querySelectorAll('*')].find(el => el.innerHTML.trim() === text)).find(el => el);
  if (isdef(d)) d.click();
  await mSleep(100);
  return d;
}
async function clickOnButtonWithCaption(text) {
  let list = [...document.querySelectorAll('button')];//console.log(list)
  let b = firstCond(list, x => x.innerText == text);
  if (isdef(b)) b.click();
}
function coin(percent = 50) { return Math.random() * 100 < percent; }
function collectOptions() {
  let poss = M.config.games[DA.gamename].options;
  let options = DA.options = {};
  if (nundef(poss)) return options;
  for (const p in poss) {
    let fs = mBy(`d_${p}`);
    let val = getCheckedRadios(fs)[0];
    options[p] = isNumber(val) ? Number(val) : val;
  }
  return options;
}
function collectPlayers() {
  let players = {};
  for (const name of DA.playerList) {
    let allPl = DA.allPlayers[name];
    players[name] = jsCopyExceptKeys(allPl, ['div', 'isSelected']);
  }
  return players;
}
function colorCalculator(p, c0, c1, l) {
  function pSBCr(d) {
    let i = parseInt, m = Math.round, a = typeof c1 == 'string';
    let n = d.length,
      x = {};
    if (n > 9) {
      ([r, g, b, a] = d = d.split(',')), (n = d.length);
      if (n < 3 || n > 4) return null;
      (x.r = parseInt(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = parseInt(g)), (x.b = parseInt(b)), (x.a = a ? parseFloat(a) : -1);
    } else {
      if (n == 8 || n == 6 || n < 4) return null;
      if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
      d = parseInt(d.slice(1), 16);
      if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
      else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
    }
    return x;
  }
  let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof c1 == 'string';
  if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
  h = c0.length > 9;
  h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h;
  f = pSBCr(c0);
  P = p < 0;
  t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 };
  p = P ? p * -1 : p;
  P = 1 - p;
  if (!f || !t) return null;
  if (l) { r = m(P * f.r + p * t.r); g = m(P * f.g + p * t.g); b = m(P * f.b + p * t.b); }
  else { r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5); g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5); b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5); }
  a = f.a;
  t = t.a;
  f = a >= 0 || t >= 0;
  a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;
  if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
  else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
}
function colorComplement(color) {
  let [r, g, b] = colorHexToRgbArray(colorFrom(color));
  let compR = 255 - r;
  let compG = 255 - g;
  let compB = 255 - b;
  return colorRgbArgsToHex79(compR, compG, compB);
}
function colorContrastPickFromList(color, colorlist = ['white', 'black']) {
  let contrast = 0;
  let result = null;
  let rgb = colorHexToRgbArray(colorFrom(color));
  for (c1 of colorlist) {
    let x = colorHexToRgbArray(colorFrom(c1));
    let c = colorGetContrast(rgb, x);
    if (c > contrast) { contrast = c; result = c1; }
  }
  return result;
}
function colorDark(c, percent = 50, log = true) {
  if (nundef(c)) c = rColor(); else c = colorFrom(c);
  let zero1 = -percent / 100;
  return colorCalculator(zero1, c, undefined, !log);
}
function colorDistance(color1, color2) {
  let [r1, g1, b1] = colorHexToRgbArray(colorFrom(color1));
  let [r2, g2, b2] = colorHexToRgbArray(colorFrom(color2));
  let distance = Math.sqrt(
    Math.pow(r2 - r1, 2) +
    Math.pow(g2 - g1, 2) +
    Math.pow(b2 - b1, 2)
  );
  return Number(distance.toFixed(2));
}
function colorDistanceHue(color1, color2) {
  let c1 = colorO(color1);
  let c2 = colorO(color2);
  let hueDiff = Math.abs(c1.hue - c2.hue);
  let hueDistance = Math.min(hueDiff, 360 - hueDiff) / 180;
  let num = (hueDistance * 100).toFixed(2);
  return Number(num);
}
function colorFrom(c, a) {
  c = colorToHex79(c);
  if (nundef(a)) return c;
  return c.substring(0, 7) + (a < 1 ? alphaToHex(a) : '');
}
function colorFromHsl(h, s = 100, l = 50) { return colorFrom({ h, s, l }); }
function colorFromHslNamed(h, s = 100, l = 50) { let x = colorFrom({ h, s, l }); return colorNearestNamed(x); }
function colorFromHue(h, s = 100, l = 50) { return colorFrom({ h, s, l }); }
function colorFromHueNamed(h, s = 100, l = 50) { return colorFromHslNamed(h, s, l); }
function colorFromHwb(h, wPercent, bPercent) {
  let [r, g, b] = colorHwb360ToRgbArray(h, wPercent, bPercent);
  return colorRgbArgsToHex79(r, g, b);
}
function colorFromNat(ncol, wPercent, bPercent) {
  return colorFromNcol(ncol, wPercent, bPercent);
}
function colorFromNcol(ncol, wPercent, bPercent) {
  let h = colorNcolToHue(ncol); if (VERBOSE)
  return colorFromHwb(h, wPercent, bPercent);
}
function colorFromRgb(r, g, b) { return colorFrom({ r, g, b }); }
function colorFromRgbNamed(r, g, b) { let x = colorFrom({ r, g, b }); return colorNearestNamed(x); }
function colorGetBucket(c) {
  let buckets = 'red orange yellow lime green greencyan cyan cyanblue blue bluemagenta magenta magentared black'.split(' ');
  c = colorFrom(c);
  let hsl = colorHexToHsl360Object(c);
  let hue = hsl.h;
  let hshift = (hue + 16) % 360;
  let ib = Math.floor(hshift / 30);
  return buckets[ib];
}
function colorGetContrast(c1, c2) {
  function luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
      v /= 255;
      return v <= 0.03928
        ? v / 12.92
        : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }
  let rgb1 = colorHexToRgbArray(colorFrom(c1));
  let rgb2 = colorHexToRgbArray(colorFrom(c2));
  var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  var brightest = Math.max(lum1, lum2);
  var darkest = Math.min(lum1, lum2);
  let res = (brightest + 0.05) / (darkest + 0.05);
  return Number(res.toFixed(3));
}
function colorGetHue(c) { return colorGetHue01(c) * 360; }
function colorGetHue01(c) {
  let hex = colorFrom(c);
  let hsl = colorHexToHsl01Array(hex);
  return hsl[0];
}
function colorGetLum(c) { return colorGetLum01(c) * 100; }
function colorGetLum01(c) {
  let hex = colorFrom(c);
  let hsl = colorHexToHsl01Array(hex);
  return hsl[2];
}
function colorGetPureHue(c) { c = colorO(c); return c.hue == 0 ? c.hex : colorFromHsl(c.hue, 100, 50); }
function colorGetSat(c) { return colorGetSat01(c) * 100; }
function colorGetSat01(c) {
  let hex = colorFrom(c);
  let hsl = colorHexToHsl01Array(hex);
  return hsl[1];
}
function colorHex45ToHex79(c) {
  let r = c[1];
  let g = c[2];
  let b = c[3];
  if (c.length == 5) return `#${r}${r}${g}${g}${b}${b}${c[4]}${c[4]}`;
  return `#${r}${r}${g}${g}${b}${b}`;
}
function colorHex79ToRgbArray(c) {
  let r = 0, g = 0, b = 0;
  r = parseInt(c[1] + c[2], 16);
  g = parseInt(c[3] + c[4], 16);
  b = parseInt(c[5] + c[6], 16);
  if (c.length == 7) return [r, g, b];
  let a = parseInt(c[7] + c[8], 16) / 255;
  return [r, g, b, a];
}
function colorHexToHsl01Array(c) { return colorRgbArgsToHsl01Array(...colorHexToRgbArray(c)); }
function colorHexToHsl360Object(c) {
  let arr = colorHexToHsl01Array(c);
  return colorHsl01ArrayToHsl360Object(arr);
}
function colorHexToRgbArray(c) {
  if (c.length < 7) c = colorHex45ToHex79(c);
  return colorHex79ToRgbArray(c);
}
function colorHexToRgbObject(c) {
  let arr = colorHexToRgbArray(c);
  let o = { r: arr[0], g: arr[1], b: arr[2] };
  if (arr.length > 3) o.a = arr[3];
  return o;
}
function colorHsl01ArgsToHex79(h, s, l, a) {
  let rgb = colorHsl01ArgsToRgbArray(h, s, l, a);
  let res = colorRgbArgsToHex79(rgb[0], rgb[1], rgb[2], rgb.length > 3 ? rgb[3] : null);
  return res;
}
function colorHsl01ArgsToRgbArray(h, s, l, a) {
  let r, g, b;
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  if (s === 0) {
    r = g = b = l;
  } else {
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  let res = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  if (nundef(a) || a == 1) return res;
  res.push(a);
  return res;
}
function colorHsl01ArrayToHsl360Object(arr) {
  let res = { h: arr[0] * 360, s: arr[1] * 100, l: arr[2] * 100 };
  if (arr.length > 3) res.a = arr[3];
  return res;
}
function colorHsl01ObjectToHex79(c) {
  if (isdef(c.a)) return colorHsl01ArgsToHex79(c.h, c.s, c.l, c.a);
  return colorHsl01ArgsToHex79(c.h, c.s, c.l);
}
function colorHsl360ArgsToHex79(h, s, l, a) {
  let o01 = colorHsl360ArgsToHsl01Object(h, s, l, a);
  return colorHsl01ArgsToHex79(o01.h, o01.s, o01.l, o01.a)
}
function colorHsl360ArgsToHsl01Object(h, s, l, a) {
  let res = { h: h / 360, s: s / 100, l: l / 100 };
  if (isdef(a)) res.a = a;
  return res;
}
function colorHsl360ObjectToHex79(c) {
  let o01 = colorHsl360ArgsToHsl01Object(c.h, c.s, c.l, c.a);
  return colorHsl01ObjectToHex79(o01)
}
function colorHsl360StringToHex79(c) {
  let o360 = colorHsl360StringToHsl360Object(c);
  let o01 = colorHsl360ArgsToHsl01Object(o360.h, o360.s, o360.l, o360.a);
  return colorHsl01ObjectToHex79(o01);
}
function colorHsl360StringToHsl360Object(c) {
  let [h, s, l, a] = c.match(/\d+\.?\d*/g).map(Number);
  if (isdef(a) && a > 1) a /= 10;
  return { h, s, l, a };
}
function colorHwb360ToRgbArray(h, w, b) {
  let [r, g, blue] = colorHsl01ArgsToRgbArray(h / 360, 1, 0.5);
  let whiteness = w / 100;
  let blackness = b / 100;
  r = Math.round((r / 255 * (1 - whiteness - blackness) + whiteness) * 255);
  g = Math.round((g / 255 * (1 - whiteness - blackness) + whiteness) * 255);
  b = Math.round((blue / 255 * (1 - whiteness - blackness) + whiteness) * 255);
  return [r, g, b];
}
function colorIdealText(bg, grayPreferred = false, nThreshold = 105) {
  let rgb = colorHexToRgbObject(colorFrom(bg));
  let r = rgb.r;
  let g = rgb.g;
  let b = rgb.b;
  var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
  var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
  if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
  return foreColor;
}
function colorIsHex79(c) { return isString(c) && c[0] == '#' && (c.length == 7 || c.length == 9); }
function colorLight(c, percent = 20, log = true) {
  if (nundef(c)) {
    return colorHsl360ArgsToHex79(rHue(), 100, 85);
  } else c = colorFrom(c);
  let zero1 = percent / 100;
  return colorCalculator(zero1, c, undefined, !log);
}
function colorNcolToHue(ncol) {
  let pure = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta'].map(x => x.toUpperCase()[0]);
  let [letter, num] = [ncol[0], Number(ncol.substring(1))];
  let idx = pure.indexOf(letter);
  let hue = idx * 60 + fromPercent(num, 60);
  return hue;
}
function colorNearestNamed(inputColor, namedColors) {
  if (nundef(namedColors)) namedColors = M.colorList;
  let minDistance = Infinity;
  let nearestColor = null;
  namedColors.forEach(namedColor => {
    let distance = colorDistance(inputColor, namedColor.hex);
    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = namedColor;
    }
  });
  return nearestColor;
}
function colorO(c) {
  if (isDict(c)) return c;
  let hex = colorFrom(c);
  let o = w3color(hex);
  let named = colorNearestNamed(hex);
  let distance = Math.round(colorDistance(named.hex, hex));
  o.name = named.name;
  o.distance = distance;
  o.bucket = colorGetBucket(hex);
  o.hex = hex;
  return o;
}
function colorPalette(color, type = 'shade') { return colorShades(colorFrom(color)); }
function colorPaletteFromImage(img) {
  if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
  return ColorThiefObject.getPalette(img).map(x => colorFrom(x));
}
function colorRgbArgsToHex79(r, g, b, a) {
  r = Math.round(r).toString(16).padStart(2, '0');
  g = Math.round(g).toString(16).padStart(2, '0');
  b = Math.round(b).toString(16).padStart(2, '0');
  if (nundef(a)) return `#${r}${g}${b}`;
  a = Math.round(a * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}${a}`;
}
function colorRgbArgsToHsl01Array(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}
function colorRgbArrayToHex79(arr) { return colorRgbArgsToHex79(...arr); }
function colorRgbStringToHex79(c) {
  let parts = c.split(',');
  let r = clamp(firstNumber(parts[0]), 0, 255);
  let g = clamp(firstNumber(parts[1]), 0, 255);
  let b = clamp(firstNumber(parts[2]), 0, 255);
  let a = parts.length > 3 ? Number(stringBefore(parts[3], ')')) : null;
  return colorRgbArgsToHex79(r, g, b, a);
}
function colorSample(d, color) {
  if (nundef(d)) return;
  mStyle(d, { bg: color, fg: colorIdealText(color) }); //, fg:colorIdealText(color) });  
  d.innerHTML = `${color}<br>${w3color(color).toHslString()}`;
}
function colorSchemeRYB() {
  let ryb = ['#FE2712', '#FC600A', '#FB9902', '#FCCC1A', '#FEFE33', '#B2D732', '#66B032', '#347C98', '#0247FE', '#4424D6', '#8601AF', '#C21460'];
  return ryb;
  if (VERBOSE)console.log('w3color', w3color('deeppink'))
  for (const c of ryb) {
    let cw = w3color(c);
    if (VERBOSE)console.log(cw.hue, cw.sat, cw.lightness, cw.ncol);
  }
}
function colorShades(color) {
  let res = [];
  for (let frac = -0.8; frac <= 0.8; frac += 0.2) {
    let c = colorCalculator(frac, color, undefined, true);
    res.push(c);
  }
  return res;
}
function colorSortByLightness(list) {
  let ext = list.map(x => colorO(x));
  let sorted = sortByDescending(ext, 'lightness').map(x => x.hex);
  return sorted;
}
function colorToHex79(c) {
  if (colorIsHex79(c)) return c;
  ColorDi = M.colorByName;
  let tString = isString(c), tArr = isList(c), tObj = isDict(c);
  if (tString && c[0] == '#') return colorHex45ToHex79(c);
  else if (tString && isdef(ColorDi) && lookup(ColorDi, [c])) { return ColorDi[c].hex; }
  else if (tString && c.startsWith('rand')) {
    let spec = capitalize(c.substring(4));
    let func = window['color' + spec];
    c = isdef(func) ? func() : rColor();
    assertion(colorIsHex79(c), 'ERROR coloFrom!!!!!!!!! (rand)');
    return c;
  } else if (tString && (c.startsWith('linear') || c.startsWith('radial'))) return c;
  else if (tString && c.startsWith('rgb')) { return colorRgbStringToHex79(c); }
  else if (tString && c.startsWith('hsl')) return colorHsl360StringToHex79(c);
  else if (tString && c == 'transparent') return '#00000000';
  else if (tString && c == 'inherit') return c;
  else if (tArr && (c.length == 3 || c.length == 4) && isNumber(c[0])) return colorRgbArrayToHex79(c);
  else if (tArr) return colorToHex79(rChoose(tArr));
  else if (tObj && 'h' in c && (c.h == 0 || c.h == 1 || c.h > 1)) { return colorHsl360ObjectToHex79(c); }
  else if (tObj && 'h' in c) return colorHsl01ObjectToHex79(c);
  else if (tObj && 'r' in c) return colorRgbArgsToHex79(c.r, c.g, c.b, c.a);
  else if (tString) {
    for (const name in ColorDi) {
      if (name.includes(c)) return ColorDi[name].hex;
    }
  }
  assertion(false, `NO COLOR FOUND FOR ${c}`);
}
function colorToHwb360Object(c) {
  c = colorFrom(c);
  let [r, g, blue] = colorHexToRgbArray(c);
  let [h, s, l] = colorHexToHsl01Array(c); h *= 360;
  let w = 100 * Math.min(r, g, blue) / 255;
  let b = 100 * (1 - Math.max(r, g, blue) / 255);
  return { h, w, b };
}
function colorTrans(cAny, alpha = 0.5) { return colorFrom(cAny, alpha); }
function colorTurnHueBy(color, inc = 180) {
  let [r, g, b] = colorHexToRgbArray(colorFrom(color));
  let [h, s, l] = colorRgbArgsToHsl01Array(r, g, b); h *= 360;
  h = (h + inc) % 360;
  let [newR, newG, newB] = colorHsl01ArgsToRgbArray(h / 360, s, l);
  return colorRgbArgsToHex79(newR, newG, newB);
}
function colored_jolly(color) {
  let id = `J_${color}`;
  let svg = `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" face="1J" 
    height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
    <symbol id="J11" preserveAspectRatio="none" viewBox="0 0 1300 2000">
    <path fill="#FC4" d="M1095,1000A445,445 0 0 1 650,1445 445,445 0 0 1 205,1000 445,445 0 0 1 650,555 445,445 0 0 1 1095,1000Z"></path>
    </symbol>
    <symbol id="${id}" preserveAspectRatio="none" viewBox="0 0 1300 2000">
    <path fill="${color}" d="M317.05664,1294.416 100,1620l220,-60 40,240 140,-200 160,200 40,-200 180,180 60,-220 260,60 -236.67969,-304.3027A445,445 0 0 1 650,1445 445,445 0 0 1 317.05664,1294.416ZM831.71484,249.10742C687.94378,262.65874 542.4812,256.33752 420,520 369.08062,331.38331 278.61481,370.61289 187.77148,412.01367a75,75 0 0 1 2.52344,19.12695 75,75 0 0 1 -16.78515,47.19532c66.827,55.25537 117.57478,127.8247 155.77539,213.90429A445,445 0 0 1 650,555 445,445 0 0 1 924.33984,650.26562c42.39917,-50.4556 91.60026,-93.34711 167.51176,-106.5332a75,75 0 0 1 -0.6524,-9.14258 75,75 0 0 1 14.6172,-44.3457C1026.3517,437.47479 931.12146,446.83238 840,440 761.98041,388.07638 804.10248,338.17898 853.51758,288.4043a75,75 0 0 1 -21.80274,-39.29688z"></path>
    </symbol>
    <symbol id="J13" preserveAspectRatio="none" viewBox="0 0 1300 2000">
    <path fill="#44F" d="M879.65521,937.6026a40,40 0 0 1 -40,40 40,40 0 0 1 -40,-40 40,40 0 0 1 40,-40 40,40 0 0 1 40,40zm-379.31039,0a40,40 0 0 1 -40,40 40,40 0 0 1 -40,-40 40,40 0 0 1 40,-40 40,40 0 0 1 40,40z"></path>
    </symbol>
    <symbol id="J14" preserveAspectRatio="none" viewBox="0 0 1300 2000">
    <path stroke="#44F" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" fill="none" d="M317.05664,1294.416 100,1620l220,-60 40,240 140,-200 160,200 40,-200 180,180 60,-220 260,60 -236.67969,-304.3027M1241.1987,534.58948a75,75 0 0 1 -75,75 75,75 0 0 1 -75,-75 75,75 0 0 1 75,-75 75,75 0 0 1 75,75zM980.11493,234.09686a75,75 0 0 1 -75,75 75,75 0 0 1 -75,-75 75,75 0 0 1 75,-75 75,75 0 0 1 75,75zM190.29556,431.1412a75,75 0 0 1 -75,75 75,75 0 0 1 -74.999997,-75 75,75 0 0 1 74.999997,-75 75,75 0 0 1 75,75zM924.3457,650.27148c42.40088,-50.45397 91.5936,-93.35356 167.5059,-106.53906 -0.4037,-3.03138 -0.6215,-6.0846 -0.6524,-9.14258 0.03,-15.96068 5.1503,-31.4957 14.6172,-44.3457C1026.3517,437.47479 931.12146,446.83238 840,440 761.98041,388.07638 804.10248,338.17898 853.51758,288.4043 842.40414,277.84182 834.79487,264.12701 831.71484,249.10742 687.94378,262.65874 542.4812,256.33752 420,520 369.08062,331.38331 278.61481,370.61289 187.77148,412.01367c1.66108,6.24042 2.50924,12.66925 2.52344,19.12695 -0.0209,17.1896 -5.94587,33.85038 -16.7832,47.19336 66.82714,55.25532 117.5686,127.8306 155.76953,213.91016M384.88867,1140c51.89013,98.343 153.91815,159.9189 265.11133,160 111.19809,-0.076 213.23257,-61.6527 265.125,-160M1095,1000A445,445 0 0 1 650,1445 445,445 0 0 1 205,1000 445,445 0 0 1 650,555 445,445 0 0 1 1095,1000Z"></path>
    </symbol>
    <rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
    <text x="-110" y="-115" fill="${color}" stroke="${color}" style="font:bold 60px sans-serif">*</text>
    <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J11"></use>
    <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#${id}"></use>
    <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J13"></use>
    <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J14"></use>
    </svg>
  `;
  return svg;
}
function colormapAsString() {
  let html = `
    <area style='cursor:pointer' shape='poly' coords='63,0,72,4,72,15,63,19,54,15,54,4' onclick='clickColor("#003366",-200,54)' onmouseover='mouseOverColor("#003366")' alt='#003366' />
    <area style='cursor:pointer' shape='poly' coords='81,0,90,4,90,15,81,19,72,15,72,4' onclick='clickColor("#336699",-200,72)' onmouseover='mouseOverColor("#336699")' alt='#336699' />
    <area style='cursor:pointer' shape='poly' coords='99,0,108,4,108,15,99,19,90,15,90,4' onclick='clickColor("#3366CC",-200,90)' onmouseover='mouseOverColor("#3366CC")' alt='#3366CC' />
    <area style='cursor:pointer' shape='poly' coords='117,0,126,4,126,15,117,19,108,15,108,4' onclick='clickColor("#003399",-200,108)' onmouseover='mouseOverColor("#003399")' alt='#003399' />
    <area style='cursor:pointer' shape='poly' coords='135,0,144,4,144,15,135,19,126,15,126,4' onclick='clickColor("#000099",-200,126)' onmouseover='mouseOverColor("#000099")' alt='#000099' />
    <area style='cursor:pointer' shape='poly' coords='153,0,162,4,162,15,153,19,144,15,144,4' onclick='clickColor("#0000CC",-200,144)' onmouseover='mouseOverColor("#0000CC")' alt='#0000CC' />
    <area style='cursor:pointer' shape='poly' coords='171,0,180,4,180,15,171,19,162,15,162,4' onclick='clickColor("#000066",-200,162)' onmouseover='mouseOverColor("#000066")' alt='#000066' />
    <area style='cursor:pointer' shape='poly' coords='54,15,63,19,63,30,54,34,45,30,45,19' onclick='clickColor("#006666",-185,45)' onmouseover='mouseOverColor("#006666")' alt='#006666' />
    <area style='cursor:pointer' shape='poly' coords='72,15,81,19,81,30,72,34,63,30,63,19' onclick='clickColor("#006699",-185,63)' onmouseover='mouseOverColor("#006699")' alt='#006699' />
    <area style='cursor:pointer' shape='poly' coords='90,15,99,19,99,30,90,34,81,30,81,19' onclick='clickColor("#0099CC",-185,81)' onmouseover='mouseOverColor("#0099CC")' alt='#0099CC' />
    <area style='cursor:pointer' shape='poly' coords='108,15,117,19,117,30,108,34,99,30,99,19' onclick='clickColor("#0066CC",-185,99)' onmouseover='mouseOverColor("#0066CC")' alt='#0066CC' />
    <area style='cursor:pointer' shape='poly' coords='126,15,135,19,135,30,126,34,117,30,117,19' onclick='clickColor("#0033CC",-185,117)' onmouseover='mouseOverColor("#0033CC")' alt='#0033CC' />
    <area style='cursor:pointer' shape='poly' coords='144,15,153,19,153,30,144,34,135,30,135,19' onclick='clickColor("#0000FF",-185,135)' onmouseover='mouseOverColor("#0000FF")' alt='#0000FF' />
    <area style='cursor:pointer' shape='poly' coords='162,15,171,19,171,30,162,34,153,30,153,19' onclick='clickColor("#3333FF",-185,153)' onmouseover='mouseOverColor("#3333FF")' alt='#3333FF' />
    <area style='cursor:pointer' shape='poly' coords='180,15,189,19,189,30,180,34,171,30,171,19' onclick='clickColor("#333399",-185,171)' onmouseover='mouseOverColor("#333399")' alt='#333399' />
    <area style='cursor:pointer' shape='poly' coords='45,30,54,34,54,45,45,49,36,45,36,34' onclick='clickColor("#669999",-170,36)' onmouseover='mouseOverColor("#669999")' alt='#669999' />
    <area style='cursor:pointer' shape='poly' coords='63,30,72,34,72,45,63,49,54,45,54,34' onclick='clickColor("#009999",-170,54)' onmouseover='mouseOverColor("#009999")' alt='#009999' />
    <area style='cursor:pointer' shape='poly' coords='81,30,90,34,90,45,81,49,72,45,72,34' onclick='clickColor("#33CCCC",-170,72)' onmouseover='mouseOverColor("#33CCCC")' alt='#33CCCC' />
    <area style='cursor:pointer' shape='poly' coords='99,30,108,34,108,45,99,49,90,45,90,34' onclick='clickColor("#00CCFF",-170,90)' onmouseover='mouseOverColor("#00CCFF")' alt='#00CCFF' />
    <area style='cursor:pointer' shape='poly' coords='117,30,126,34,126,45,117,49,108,45,108,34' onclick='clickColor("#0099FF",-170,108)' onmouseover='mouseOverColor("#0099FF")' alt='#0099FF' />
    <area style='cursor:pointer' shape='poly' coords='135,30,144,34,144,45,135,49,126,45,126,34' onclick='clickColor("#0066FF",-170,126)' onmouseover='mouseOverColor("#0066FF")' alt='#0066FF' />
    <area style='cursor:pointer' shape='poly' coords='153,30,162,34,162,45,153,49,144,45,144,34' onclick='clickColor("#3366FF",-170,144)' onmouseover='mouseOverColor("#3366FF")' alt='#3366FF' />
    <area style='cursor:pointer' shape='poly' coords='171,30,180,34,180,45,171,49,162,45,162,34' onclick='clickColor("#3333CC",-170,162)' onmouseover='mouseOverColor("#3333CC")' alt='#3333CC' />
    <area style='cursor:pointer' shape='poly' coords='189,30,198,34,198,45,189,49,180,45,180,34' onclick='clickColor("#666699",-170,180)' onmouseover='mouseOverColor("#666699")' alt='#666699' />
    <area style='cursor:pointer' shape='poly' coords='36,45,45,49,45,60,36,64,27,60,27,49' onclick='clickColor("#339966",-155,27)' onmouseover='mouseOverColor("#339966")' alt='#339966' />
    <area style='cursor:pointer' shape='poly' coords='54,45,63,49,63,60,54,64,45,60,45,49' onclick='clickColor("#00CC99",-155,45)' onmouseover='mouseOverColor("#00CC99")' alt='#00CC99' />
    <area style='cursor:pointer' shape='poly' coords='72,45,81,49,81,60,72,64,63,60,63,49' onclick='clickColor("#00FFCC",-155,63)' onmouseover='mouseOverColor("#00FFCC")' alt='#00FFCC' />
    <area style='cursor:pointer' shape='poly' coords='90,45,99,49,99,60,90,64,81,60,81,49' onclick='clickColor("#00FFFF",-155,81)' onmouseover='mouseOverColor("#00FFFF")' alt='#00FFFF' />
    <area style='cursor:pointer' shape='poly' coords='108,45,117,49,117,60,108,64,99,60,99,49' onclick='clickColor("#33CCFF",-155,99)' onmouseover='mouseOverColor("#33CCFF")' alt='#33CCFF' />
    <area style='cursor:pointer' shape='poly' coords='126,45,135,49,135,60,126,64,117,60,117,49' onclick='clickColor("#3399FF",-155,117)' onmouseover='mouseOverColor("#3399FF")' alt='#3399FF' />
    <area style='cursor:pointer' shape='poly' coords='144,45,153,49,153,60,144,64,135,60,135,49' onclick='clickColor("#6699FF",-155,135)' onmouseover='mouseOverColor("#6699FF")' alt='#6699FF' />
    <area style='cursor:pointer' shape='poly' coords='162,45,171,49,171,60,162,64,153,60,153,49' onclick='clickColor("#6666FF",-155,153)' onmouseover='mouseOverColor("#6666FF")' alt='#6666FF' />
    <area style='cursor:pointer' shape='poly' coords='180,45,189,49,189,60,180,64,171,60,171,49' onclick='clickColor("#6600FF",-155,171)' onmouseover='mouseOverColor("#6600FF")' alt='#6600FF' />
    <area style='cursor:pointer' shape='poly' coords='198,45,207,49,207,60,198,64,189,60,189,49' onclick='clickColor("#6600CC",-155,189)' onmouseover='mouseOverColor("#6600CC")' alt='#6600CC' />
    <area style='cursor:pointer' shape='poly' coords='27,60,36,64,36,75,27,79,18,75,18,64' onclick='clickColor("#339933",-140,18)' onmouseover='mouseOverColor("#339933")' alt='#339933' />
    <area style='cursor:pointer' shape='poly' coords='45,60,54,64,54,75,45,79,36,75,36,64' onclick='clickColor("#00CC66",-140,36)' onmouseover='mouseOverColor("#00CC66")' alt='#00CC66' />
    <area style='cursor:pointer' shape='poly' coords='63,60,72,64,72,75,63,79,54,75,54,64' onclick='clickColor("#00FF99",-140,54)' onmouseover='mouseOverColor("#00FF99")' alt='#00FF99' />
    <area style='cursor:pointer' shape='poly' coords='81,60,90,64,90,75,81,79,72,75,72,64' onclick='clickColor("#66FFCC",-140,72)' onmouseover='mouseOverColor("#66FFCC")' alt='#66FFCC' />
    <area style='cursor:pointer' shape='poly' coords='99,60,108,64,108,75,99,79,90,75,90,64' onclick='clickColor("#66FFFF",-140,90)' onmouseover='mouseOverColor("#66FFFF")' alt='#66FFFF' />
    <area style='cursor:pointer' shape='poly' coords='117,60,126,64,126,75,117,79,108,75,108,64' onclick='clickColor("#66CCFF",-140,108)' onmouseover='mouseOverColor("#66CCFF")' alt='#66CCFF' />
    <area style='cursor:pointer' shape='poly' coords='135,60,144,64,144,75,135,79,126,75,126,64' onclick='clickColor("#99CCFF",-140,126)' onmouseover='mouseOverColor("#99CCFF")' alt='#99CCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,60,162,64,162,75,153,79,144,75,144,64' onclick='clickColor("#9999FF",-140,144)' onmouseover='mouseOverColor("#9999FF")' alt='#9999FF' />
    <area style='cursor:pointer' shape='poly' coords='171,60,180,64,180,75,171,79,162,75,162,64' onclick='clickColor("#9966FF",-140,162)' onmouseover='mouseOverColor("#9966FF")' alt='#9966FF' />
    <area style='cursor:pointer' shape='poly' coords='189,60,198,64,198,75,189,79,180,75,180,64' onclick='clickColor("#9933FF",-140,180)' onmouseover='mouseOverColor("#9933FF")' alt='#9933FF' />
    <area style='cursor:pointer' shape='poly' coords='207,60,216,64,216,75,207,79,198,75,198,64' onclick='clickColor("#9900FF",-140,198)' onmouseover='mouseOverColor("#9900FF")' alt='#9900FF' />
    <area style='cursor:pointer' shape='poly' coords='18,75,27,79,27,90,18,94,9,90,9,79' onclick='clickColor("#006600",-125,9)' onmouseover='mouseOverColor("#006600")' alt='#006600' />
    <area style='cursor:pointer' shape='poly' coords='36,75,45,79,45,90,36,94,27,90,27,79' onclick='clickColor("#00CC00",-125,27)' onmouseover='mouseOverColor("#00CC00")' alt='#00CC00' />
    <area style='cursor:pointer' shape='poly' coords='54,75,63,79,63,90,54,94,45,90,45,79' onclick='clickColor("#00FF00",-125,45)' onmouseover='mouseOverColor("#00FF00")' alt='#00FF00' />
    <area style='cursor:pointer' shape='poly' coords='72,75,81,79,81,90,72,94,63,90,63,79' onclick='clickColor("#66FF99",-125,63)' onmouseover='mouseOverColor("#66FF99")' alt='#66FF99' />
    <area style='cursor:pointer' shape='poly' coords='90,75,99,79,99,90,90,94,81,90,81,79' onclick='clickColor("#99FFCC",-125,81)' onmouseover='mouseOverColor("#99FFCC")' alt='#99FFCC' />
    <area style='cursor:pointer' shape='poly' coords='108,75,117,79,117,90,108,94,99,90,99,79' onclick='clickColor("#CCFFFF",-125,99)' onmouseover='mouseOverColor("#CCFFFF")' alt='#CCFFFF' />
    <area style='cursor:pointer' shape='poly' coords='126,75,135,79,135,90,126,94,117,90,117,79' onclick='clickColor("#CCCCFF",-125,117)' onmouseover='mouseOverColor("#CCCCFF")' alt='#CCCCFF' />
    <area style='cursor:pointer' shape='poly' coords='144,75,153,79,153,90,144,94,135,90,135,79' onclick='clickColor("#CC99FF",-125,135)' onmouseover='mouseOverColor("#CC99FF")' alt='#CC99FF' />
    <area style='cursor:pointer' shape='poly' coords='162,75,171,79,171,90,162,94,153,90,153,79' onclick='clickColor("#CC66FF",-125,153)' onmouseover='mouseOverColor("#CC66FF")' alt='#CC66FF' />
    <area style='cursor:pointer' shape='poly' coords='180,75,189,79,189,90,180,94,171,90,171,79' onclick='clickColor("#CC33FF",-125,171)' onmouseover='mouseOverColor("#CC33FF")' alt='#CC33FF' />
    <area style='cursor:pointer' shape='poly' coords='198,75,207,79,207,90,198,94,189,90,189,79' onclick='clickColor("#CC00FF",-125,189)' onmouseover='mouseOverColor("#CC00FF")' alt='#CC00FF' />
    <area style='cursor:pointer' shape='poly' coords='216,75,225,79,225,90,216,94,207,90,207,79' onclick='clickColor("#9900CC",-125,207)' onmouseover='mouseOverColor("#9900CC")' alt='#9900CC' />
    <area style='cursor:pointer' shape='poly' coords='9,90,18,94,18,105,9,109,0,105,0,94' onclick='clickColor("#003300",-110,0)' onmouseover='mouseOverColor("#003300")' alt='#003300' />
    <area style='cursor:pointer' shape='poly' coords='27,90,36,94,36,105,27,109,18,105,18,94' onclick='clickColor("#009933",-110,18)' onmouseover='mouseOverColor("#009933")' alt='#009933' />
    <area style='cursor:pointer' shape='poly' coords='45,90,54,94,54,105,45,109,36,105,36,94' onclick='clickColor("#33CC33",-110,36)' onmouseover='mouseOverColor("#33CC33")' alt='#33CC33' />
    <area style='cursor:pointer' shape='poly' coords='63,90,72,94,72,105,63,109,54,105,54,94' onclick='clickColor("#66FF66",-110,54)' onmouseover='mouseOverColor("#66FF66")' alt='#66FF66' />
    <area style='cursor:pointer' shape='poly' coords='81,90,90,94,90,105,81,109,72,105,72,94' onclick='clickColor("#99FF99",-110,72)' onmouseover='mouseOverColor("#99FF99")' alt='#99FF99' />
    <area style='cursor:pointer' shape='poly' coords='99,90,108,94,108,105,99,109,90,105,90,94' onclick='clickColor("#CCFFCC",-110,90)' onmouseover='mouseOverColor("#CCFFCC")' alt='#CCFFCC' />
    <area style='cursor:pointer' shape='poly' coords='117,90,126,94,126,105,117,109,108,105,108,94' onclick='clickColor("#FFFFFF",-110,108)' onmouseover='mouseOverColor("#FFFFFF")' alt='#FFFFFF' />
    <area style='cursor:pointer' shape='poly' coords='135,90,144,94,144,105,135,109,126,105,126,94' onclick='clickColor("#FFCCEE",-110,126)' onmouseover='mouseOverColor("#FFCCEE")' alt='#FFCCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,90,162,94,162,105,153,109,144,105,144,94' onclick='clickColor("#FFAAEE",-110,144)' onmouseover='mouseOverColor("#FFAAEE")' alt='#FF33DD' />
    <area style='cursor:pointer' shape='poly' coords='171,90,180,94,180,105,171,109,162,105,162,94' onclick='clickColor("#FF88EE",-110,162)' onmouseover='mouseOverColor("#FF88EE")' alt='#FF66FF' />
    <area style='cursor:pointer' shape='poly' coords='189,90,198,94,198,105,189,109,180,105,180,94' onclick='clickColor("#FF14EE",-110,180)' onmouseover='mouseOverColor("#FF14EE")' alt='#FF00FF' />
    <area style='cursor:pointer' shape='poly' coords='207,90,216,94,216,105,207,109,198,105,198,94' onclick='clickColor("#CC00CC",-110,198)' onmouseover='mouseOverColor("#CC00CC")' alt='#CC00CC' />
    <area style='cursor:pointer' shape='poly' coords='225,90,234,94,234,105,225,109,216,105,216,94' onclick='clickColor("#660066",-110,216)' onmouseover='mouseOverColor("#660066")' alt='#660066' />
    <area style='cursor:pointer' shape='poly' coords='18,105,27,109,27,120,18,124,9,120,9,109' onclick='clickColor("#336600",-95,9)' onmouseover='mouseOverColor("#336600")' alt='#336600' />
    <area style='cursor:pointer' shape='poly' coords='36,105,45,109,45,120,36,124,27,120,27,109' onclick='clickColor("#009900",-95,27)' onmouseover='mouseOverColor("#009900")' alt='#009900' />
    <area style='cursor:pointer' shape='poly' coords='54,105,63,109,63,120,54,124,45,120,45,109' onclick='clickColor("#66FF33",-95,45)' onmouseover='mouseOverColor("#66FF33")' alt='#66FF33' />
    <area style='cursor:pointer' shape='poly' coords='72,105,81,109,81,120,72,124,63,120,63,109' onclick='clickColor("#99FF66",-95,63)' onmouseover='mouseOverColor("#99FF66")' alt='#99FF66' />
    <area style='cursor:pointer' shape='poly' coords='90,105,99,109,99,120,90,124,81,120,81,109' onclick='clickColor("#CCFF99",-95,81)' onmouseover='mouseOverColor("#CCFF99")' alt='#CCFF99' />
    <area style='cursor:pointer' shape='poly' coords='108,105,117,109,117,120,108,124,99,120,99,109' onclick='clickColor("#FFFFCC",-95,99)' onmouseover='mouseOverColor("#FFFFCC")' alt='#FFFFCC' />
    <area style='cursor:pointer' shape='poly' coords='126,105,135,109,135,120,126,124,117,120,117,109' onclick='clickColor("#FFCCCC",-95,117)' onmouseover='mouseOverColor("#FFCCCC")' alt='#FFCCCC' />
    <area style='cursor:pointer' shape='poly' coords='144,105,153,109,153,120,144,124,135,120,135,109' onclick='clickColor("#FF99CC",-95,135)' onmouseover='mouseOverColor("#FF99CC")' alt='#FF99CC' />
    <area style='cursor:pointer' shape='poly' coords='162,105,171,109,171,120,162,124,153,120,153,109' onclick='clickColor("#FF66CC",-95,153)' onmouseover='mouseOverColor("#FF66CC")' alt='#FF66CC' />
    <area style='cursor:pointer' shape='poly' coords='180,105,189,109,189,120,180,124,171,120,171,109' onclick='clickColor("#FF33CC",-95,171)' onmouseover='mouseOverColor("#FF33CC")' alt='#FF33CC' />
    <area style='cursor:pointer' shape='poly' coords='198,105,207,109,207,120,198,124,189,120,189,109' onclick='clickColor("#CC0099",-95,189)' onmouseover='mouseOverColor("#CC0099")' alt='#CC0099' />
    <area style='cursor:pointer' shape='poly' coords='216,105,225,109,225,120,216,124,207,120,207,109' onclick='clickColor("#993399",-95,207)' onmouseover='mouseOverColor("#993399")' alt='#993399' />
    <area style='cursor:pointer' shape='poly' coords='27,120,36,124,36,135,27,139,18,135,18,124' onclick='clickColor("#333300",-80,18)' onmouseover='mouseOverColor("#333300")' alt='#333300' />
    <area style='cursor:pointer' shape='poly' coords='45,120,54,124,54,135,45,139,36,135,36,124' onclick='clickColor("#669900",-80,36)' onmouseover='mouseOverColor("#669900")' alt='#669900' />
    <area style='cursor:pointer' shape='poly' coords='63,120,72,124,72,135,63,139,54,135,54,124' onclick='clickColor("#99FF33",-80,54)' onmouseover='mouseOverColor("#99FF33")' alt='#99FF33' />
    <area style='cursor:pointer' shape='poly' coords='81,120,90,124,90,135,81,139,72,135,72,124' onclick='clickColor("#CCFF66",-80,72)' onmouseover='mouseOverColor("#CCFF66")' alt='#CCFF66' />
    <area style='cursor:pointer' shape='poly' coords='99,120,108,124,108,135,99,139,90,135,90,124' onclick='clickColor("#FFFF99",-80,90)' onmouseover='mouseOverColor("#FFFF99")' alt='#FFFF99' />
    <area style='cursor:pointer' shape='poly' coords='117,120,126,124,126,135,117,139,108,135,108,124' onclick='clickColor("#FFCC99",-80,108)' onmouseover='mouseOverColor("#FFCC99")' alt='#FFCC99' />
    <area style='cursor:pointer' shape='poly' coords='135,120,144,124,144,135,135,139,126,135,126,124' onclick='clickColor("#FF9999",-80,126)' onmouseover='mouseOverColor("#FF9999")' alt='#FF9999' />
    <area style='cursor:pointer' shape='poly' coords='153,120,162,124,162,135,153,139,144,135,144,124' onclick='clickColor("#FF6699",-80,144)' onmouseover='mouseOverColor("#FF6699")' alt='#FF6699' />
    <area style='cursor:pointer' shape='poly' coords='171,120,180,124,180,135,171,139,162,135,162,124' onclick='clickColor("#FF3399",-80,162)' onmouseover='mouseOverColor("#FF3399")' alt='#FF3399' />
    <area style='cursor:pointer' shape='poly' coords='189,120,198,124,198,135,189,139,180,135,180,124' onclick='clickColor("#CC3399",-80,180)' onmouseover='mouseOverColor("#CC3399")' alt='#CC3399' />
    <area style='cursor:pointer' shape='poly' coords='207,120,216,124,216,135,207,139,198,135,198,124' onclick='clickColor("#990099",-80,198)' onmouseover='mouseOverColor("#990099")' alt='#990099' />
    <area style='cursor:pointer' shape='poly' coords='36,135,45,139,45,150,36,154,27,150,27,139' onclick='clickColor("#666633",-65,27)' onmouseover='mouseOverColor("#666633")' alt='#666633' />
    <area style='cursor:pointer' shape='poly' coords='54,135,63,139,63,150,54,154,45,150,45,139' onclick='clickColor("#99CC00",-65,45)' onmouseover='mouseOverColor("#99CC00")' alt='#99CC00' />
    <area style='cursor:pointer' shape='poly' coords='72,135,81,139,81,150,72,154,63,150,63,139' onclick='clickColor("#CCFF33",-65,63)' onmouseover='mouseOverColor("#CCFF33")' alt='#CCFF33' />
    <area style='cursor:pointer' shape='poly' coords='90,135,99,139,99,150,90,154,81,150,81,139' onclick='clickColor("#FFFF66",-65,81)' onmouseover='mouseOverColor("#FFFF66")' alt='#FFFF66' />
    <area style='cursor:pointer' shape='poly' coords='108,135,117,139,117,150,108,154,99,150,99,139' onclick='clickColor("#FFCC66",-65,99)' onmouseover='mouseOverColor("#FFCC66")' alt='#FFCC66' />
    <area style='cursor:pointer' shape='poly' coords='126,135,135,139,135,150,126,154,117,150,117,139' onclick='clickColor("#FF9966",-65,117)' onmouseover='mouseOverColor("#FF9966")' alt='#FF9966' />
    <area style='cursor:pointer' shape='poly' coords='144,135,153,139,153,150,144,154,135,150,135,139' onclick='clickColor("#FF6666",-65,135)' onmouseover='mouseOverColor("#FF6666")' alt='#FF6666' />
    <area style='cursor:pointer' shape='poly' coords='162,135,171,139,171,150,162,154,153,150,153,139' onclick='clickColor("#FF0066",-65,153)' onmouseover='mouseOverColor("#FF0066")' alt='#FF0066' />
    <area style='cursor:pointer' shape='poly' coords='180,135,189,139,189,150,180,154,171,150,171,139' onclick='clickColor("#CC6699",-65,171)' onmouseover='mouseOverColor("#CC6699")' alt='#CC6699' />
    <area style='cursor:pointer' shape='poly' coords='198,135,207,139,207,150,198,154,189,150,189,139' onclick='clickColor("#993366",-65,189)' onmouseover='mouseOverColor("#993366")' alt='#993366' />
    <area style='cursor:pointer' shape='poly' coords='45,150,54,154,54,165,45,169,36,165,36,154' onclick='clickColor("#999966",-50,36)' onmouseover='mouseOverColor("#999966")' alt='#999966' />
    <area style='cursor:pointer' shape='poly' coords='63,150,72,154,72,165,63,169,54,165,54,154' onclick='clickColor("#CCCC00",-50,54)' onmouseover='mouseOverColor("#CCCC00")' alt='#CCCC00' />
    <area style='cursor:pointer' shape='poly' coords='81,150,90,154,90,165,81,169,72,165,72,154' onclick='clickColor("#FFFF00",-50,72)' onmouseover='mouseOverColor("#FFFF00")' alt='#FFFF00' />
    <area style='cursor:pointer' shape='poly' coords='99,150,108,154,108,165,99,169,90,165,90,154' onclick='clickColor("#FFCC00",-50,90)' onmouseover='mouseOverColor("#FFCC00")' alt='#FFCC00' />
    <area style='cursor:pointer' shape='poly' coords='117,150,126,154,126,165,117,169,108,165,108,154' onclick='clickColor("#FF9933",-50,108)' onmouseover='mouseOverColor("#FF9933")' alt='#FF9933' />
    <area style='cursor:pointer' shape='poly' coords='135,150,144,154,144,165,135,169,126,165,126,154' onclick='clickColor("#FF6600",-50,126)' onmouseover='mouseOverColor("#FF6600")' alt='#FF6600' />
    <area style='cursor:pointer' shape='poly' coords='153,150,162,154,162,165,153,169,144,165,144,154' onclick='clickColor("#FF5050",-50,144)' onmouseover='mouseOverColor("#FF5050")' alt='#FF5050' />
    <area style='cursor:pointer' shape='poly' coords='171,150,180,154,180,165,171,169,162,165,162,154' onclick='clickColor("#CC0066",-50,162)' onmouseover='mouseOverColor("#CC0066")' alt='#CC0066' />
    <area style='cursor:pointer' shape='poly' coords='189,150,198,154,198,165,189,169,180,165,180,154' onclick='clickColor("#660033",-50,180)' onmouseover='mouseOverColor("#660033")' alt='#660033' />
    <area style='cursor:pointer' shape='poly' coords='54,165,63,169,63,180,54,184,45,180,45,169' onclick='clickColor("#996633",-35,45)' onmouseover='mouseOverColor("#996633")' alt='#996633' />
    <area style='cursor:pointer' shape='poly' coords='72,165,81,169,81,180,72,184,63,180,63,169' onclick='clickColor("#CC9900",-35,63)' onmouseover='mouseOverColor("#CC9900")' alt='#CC9900' />
    <area style='cursor:pointer' shape='poly' coords='90,165,99,169,99,180,90,184,81,180,81,169' onclick='clickColor("#FF9900",-35,81)' onmouseover='mouseOverColor("#FF9900")' alt='#FF9900' />
    <area style='cursor:pointer' shape='poly' coords='108,165,117,169,117,180,108,184,99,180,99,169' onclick='clickColor("#CC6600",-35,99)' onmouseover='mouseOverColor("#CC6600")' alt='#CC6600' />
    <area style='cursor:pointer' shape='poly' coords='126,165,135,169,135,180,126,184,117,180,117,169' onclick='clickColor("#FF3300",-35,117)' onmouseover='mouseOverColor("#FF3300")' alt='#FF3300' />
    <area style='cursor:pointer' shape='poly' coords='144,165,153,169,153,180,144,184,135,180,135,169' onclick='clickColor("#FF0000",-35,135)' onmouseover='mouseOverColor("#FF0000")' alt='#FF0000' />
    <area style='cursor:pointer' shape='poly' coords='162,165,171,169,171,180,162,184,153,180,153,169' onclick='clickColor("#CC0000",-35,153)' onmouseover='mouseOverColor("#CC0000")' alt='#CC0000' />
    <area style='cursor:pointer' shape='poly' coords='180,165,189,169,189,180,180,184,171,180,171,169' onclick='clickColor("#990033",-35,171)' onmouseover='mouseOverColor("#990033")' alt='#990033' />
    <area style='cursor:pointer' shape='poly' coords='63,180,72,184,72,195,63,199,54,195,54,184' onclick='clickColor("#663300",-20,54)' onmouseover='mouseOverColor("#663300")' alt='#663300' />
    <area style='cursor:pointer' shape='poly' coords='81,180,90,184,90,195,81,199,72,195,72,184' onclick='clickColor("#996600",-20,72)' onmouseover='mouseOverColor("#996600")' alt='#996600' />
    <area style='cursor:pointer' shape='poly' coords='99,180,108,184,108,195,99,199,90,195,90,184' onclick='clickColor("#CC3300",-20,90)' onmouseover='mouseOverColor("#CC3300")' alt='#CC3300' />
    <area style='cursor:pointer' shape='poly' coords='117,180,126,184,126,195,117,199,108,195,108,184' onclick='clickColor("#993300",-20,108)' onmouseover='mouseOverColor("#993300")' alt='#993300' />
    <area style='cursor:pointer' shape='poly' coords='135,180,144,184,144,195,135,199,126,195,126,184' onclick='clickColor("#990000",-20,126)' onmouseover='mouseOverColor("#990000")' alt='#990000' />
    <area style='cursor:pointer' shape='poly' coords='153,180,162,184,162,195,153,199,144,195,144,184' onclick='clickColor("#800000",-20,144)' onmouseover='mouseOverColor("#800000")' alt='#800000' />
    <area style='cursor:pointer' shape='poly' coords='171,180,180,184,180,195,171,199,162,195,162,184' onclick='clickColor("#993333",-20,162)' onmouseover='mouseOverColor("#993333")' alt='#993333' />
   `;
  return html;
}
function colormapAsStringOrig() {
  let html = `
    <area style='cursor:pointer' shape='poly' coords='63,0,72,4,72,15,63,19,54,15,54,4' onclick='clickColor("#003366",-200,54)' onmouseover='mouseOverColor("#003366")' alt='#003366' />
    <area style='cursor:pointer' shape='poly' coords='81,0,90,4,90,15,81,19,72,15,72,4' onclick='clickColor("#336699",-200,72)' onmouseover='mouseOverColor("#336699")' alt='#336699' />
    <area style='cursor:pointer' shape='poly' coords='99,0,108,4,108,15,99,19,90,15,90,4' onclick='clickColor("#3366CC",-200,90)' onmouseover='mouseOverColor("#3366CC")' alt='#3366CC' />
    <area style='cursor:pointer' shape='poly' coords='117,0,126,4,126,15,117,19,108,15,108,4' onclick='clickColor("#003399",-200,108)' onmouseover='mouseOverColor("#003399")' alt='#003399' />
    <area style='cursor:pointer' shape='poly' coords='135,0,144,4,144,15,135,19,126,15,126,4' onclick='clickColor("#000099",-200,126)' onmouseover='mouseOverColor("#000099")' alt='#000099' />
    <area style='cursor:pointer' shape='poly' coords='153,0,162,4,162,15,153,19,144,15,144,4' onclick='clickColor("#0000CC",-200,144)' onmouseover='mouseOverColor("#0000CC")' alt='#0000CC' />
    <area style='cursor:pointer' shape='poly' coords='171,0,180,4,180,15,171,19,162,15,162,4' onclick='clickColor("#000066",-200,162)' onmouseover='mouseOverColor("#000066")' alt='#000066' />
    <area style='cursor:pointer' shape='poly' coords='54,15,63,19,63,30,54,34,45,30,45,19' onclick='clickColor("#006666",-185,45)' onmouseover='mouseOverColor("#006666")' alt='#006666' />
    <area style='cursor:pointer' shape='poly' coords='72,15,81,19,81,30,72,34,63,30,63,19' onclick='clickColor("#006699",-185,63)' onmouseover='mouseOverColor("#006699")' alt='#006699' />
    <area style='cursor:pointer' shape='poly' coords='90,15,99,19,99,30,90,34,81,30,81,19' onclick='clickColor("#0099CC",-185,81)' onmouseover='mouseOverColor("#0099CC")' alt='#0099CC' />
    <area style='cursor:pointer' shape='poly' coords='108,15,117,19,117,30,108,34,99,30,99,19' onclick='clickColor("#0066CC",-185,99)' onmouseover='mouseOverColor("#0066CC")' alt='#0066CC' />
    <area style='cursor:pointer' shape='poly' coords='126,15,135,19,135,30,126,34,117,30,117,19' onclick='clickColor("#0033CC",-185,117)' onmouseover='mouseOverColor("#0033CC")' alt='#0033CC' />
    <area style='cursor:pointer' shape='poly' coords='144,15,153,19,153,30,144,34,135,30,135,19' onclick='clickColor("#0000FF",-185,135)' onmouseover='mouseOverColor("#0000FF")' alt='#0000FF' />
    <area style='cursor:pointer' shape='poly' coords='162,15,171,19,171,30,162,34,153,30,153,19' onclick='clickColor("#3333FF",-185,153)' onmouseover='mouseOverColor("#3333FF")' alt='#3333FF' />
    <area style='cursor:pointer' shape='poly' coords='180,15,189,19,189,30,180,34,171,30,171,19' onclick='clickColor("#333399",-185,171)' onmouseover='mouseOverColor("#333399")' alt='#333399' />
    <area style='cursor:pointer' shape='poly' coords='45,30,54,34,54,45,45,49,36,45,36,34' onclick='clickColor("#669999",-170,36)' onmouseover='mouseOverColor("#669999")' alt='#669999' />
    <area style='cursor:pointer' shape='poly' coords='63,30,72,34,72,45,63,49,54,45,54,34' onclick='clickColor("#009999",-170,54)' onmouseover='mouseOverColor("#009999")' alt='#009999' />
    <area style='cursor:pointer' shape='poly' coords='81,30,90,34,90,45,81,49,72,45,72,34' onclick='clickColor("#33CCCC",-170,72)' onmouseover='mouseOverColor("#33CCCC")' alt='#33CCCC' />
    <area style='cursor:pointer' shape='poly' coords='99,30,108,34,108,45,99,49,90,45,90,34' onclick='clickColor("#00CCFF",-170,90)' onmouseover='mouseOverColor("#00CCFF")' alt='#00CCFF' />
    <area style='cursor:pointer' shape='poly' coords='117,30,126,34,126,45,117,49,108,45,108,34' onclick='clickColor("#0099FF",-170,108)' onmouseover='mouseOverColor("#0099FF")' alt='#0099FF' />
    <area style='cursor:pointer' shape='poly' coords='135,30,144,34,144,45,135,49,126,45,126,34' onclick='clickColor("#0066FF",-170,126)' onmouseover='mouseOverColor("#0066FF")' alt='#0066FF' />
    <area style='cursor:pointer' shape='poly' coords='153,30,162,34,162,45,153,49,144,45,144,34' onclick='clickColor("#3366FF",-170,144)' onmouseover='mouseOverColor("#3366FF")' alt='#3366FF' />
    <area style='cursor:pointer' shape='poly' coords='171,30,180,34,180,45,171,49,162,45,162,34' onclick='clickColor("#3333CC",-170,162)' onmouseover='mouseOverColor("#3333CC")' alt='#3333CC' />
    <area style='cursor:pointer' shape='poly' coords='189,30,198,34,198,45,189,49,180,45,180,34' onclick='clickColor("#666699",-170,180)' onmouseover='mouseOverColor("#666699")' alt='#666699' />
    <area style='cursor:pointer' shape='poly' coords='36,45,45,49,45,60,36,64,27,60,27,49' onclick='clickColor("#339966",-155,27)' onmouseover='mouseOverColor("#339966")' alt='#339966' />
    <area style='cursor:pointer' shape='poly' coords='54,45,63,49,63,60,54,64,45,60,45,49' onclick='clickColor("#00CC99",-155,45)' onmouseover='mouseOverColor("#00CC99")' alt='#00CC99' />
    <area style='cursor:pointer' shape='poly' coords='72,45,81,49,81,60,72,64,63,60,63,49' onclick='clickColor("#00FFCC",-155,63)' onmouseover='mouseOverColor("#00FFCC")' alt='#00FFCC' />
    <area style='cursor:pointer' shape='poly' coords='90,45,99,49,99,60,90,64,81,60,81,49' onclick='clickColor("#00FFFF",-155,81)' onmouseover='mouseOverColor("#00FFFF")' alt='#00FFFF' />
    <area style='cursor:pointer' shape='poly' coords='108,45,117,49,117,60,108,64,99,60,99,49' onclick='clickColor("#33CCFF",-155,99)' onmouseover='mouseOverColor("#33CCFF")' alt='#33CCFF' />
    <area style='cursor:pointer' shape='poly' coords='126,45,135,49,135,60,126,64,117,60,117,49' onclick='clickColor("#3399FF",-155,117)' onmouseover='mouseOverColor("#3399FF")' alt='#3399FF' />
    <area style='cursor:pointer' shape='poly' coords='144,45,153,49,153,60,144,64,135,60,135,49' onclick='clickColor("#6699FF",-155,135)' onmouseover='mouseOverColor("#6699FF")' alt='#6699FF' />
    <area style='cursor:pointer' shape='poly' coords='162,45,171,49,171,60,162,64,153,60,153,49' onclick='clickColor("#6666FF",-155,153)' onmouseover='mouseOverColor("#6666FF")' alt='#6666FF' />
    <area style='cursor:pointer' shape='poly' coords='180,45,189,49,189,60,180,64,171,60,171,49' onclick='clickColor("#6600FF",-155,171)' onmouseover='mouseOverColor("#6600FF")' alt='#6600FF' />
    <area style='cursor:pointer' shape='poly' coords='198,45,207,49,207,60,198,64,189,60,189,49' onclick='clickColor("#6600CC",-155,189)' onmouseover='mouseOverColor("#6600CC")' alt='#6600CC' />
    <area style='cursor:pointer' shape='poly' coords='27,60,36,64,36,75,27,79,18,75,18,64' onclick='clickColor("#339933",-140,18)' onmouseover='mouseOverColor("#339933")' alt='#339933' />
    <area style='cursor:pointer' shape='poly' coords='45,60,54,64,54,75,45,79,36,75,36,64' onclick='clickColor("#00CC66",-140,36)' onmouseover='mouseOverColor("#00CC66")' alt='#00CC66' />
    <area style='cursor:pointer' shape='poly' coords='63,60,72,64,72,75,63,79,54,75,54,64' onclick='clickColor("#00FF99",-140,54)' onmouseover='mouseOverColor("#00FF99")' alt='#00FF99' />
    <area style='cursor:pointer' shape='poly' coords='81,60,90,64,90,75,81,79,72,75,72,64' onclick='clickColor("#66FFCC",-140,72)' onmouseover='mouseOverColor("#66FFCC")' alt='#66FFCC' />
    <area style='cursor:pointer' shape='poly' coords='99,60,108,64,108,75,99,79,90,75,90,64' onclick='clickColor("#66FFFF",-140,90)' onmouseover='mouseOverColor("#66FFFF")' alt='#66FFFF' />
    <area style='cursor:pointer' shape='poly' coords='117,60,126,64,126,75,117,79,108,75,108,64' onclick='clickColor("#66CCFF",-140,108)' onmouseover='mouseOverColor("#66CCFF")' alt='#66CCFF' />
    <area style='cursor:pointer' shape='poly' coords='135,60,144,64,144,75,135,79,126,75,126,64' onclick='clickColor("#99CCFF",-140,126)' onmouseover='mouseOverColor("#99CCFF")' alt='#99CCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,60,162,64,162,75,153,79,144,75,144,64' onclick='clickColor("#9999FF",-140,144)' onmouseover='mouseOverColor("#9999FF")' alt='#9999FF' />
    <area style='cursor:pointer' shape='poly' coords='171,60,180,64,180,75,171,79,162,75,162,64' onclick='clickColor("#9966FF",-140,162)' onmouseover='mouseOverColor("#9966FF")' alt='#9966FF' />
    <area style='cursor:pointer' shape='poly' coords='189,60,198,64,198,75,189,79,180,75,180,64' onclick='clickColor("#9933FF",-140,180)' onmouseover='mouseOverColor("#9933FF")' alt='#9933FF' />
    <area style='cursor:pointer' shape='poly' coords='207,60,216,64,216,75,207,79,198,75,198,64' onclick='clickColor("#9900FF",-140,198)' onmouseover='mouseOverColor("#9900FF")' alt='#9900FF' />
    <area style='cursor:pointer' shape='poly' coords='18,75,27,79,27,90,18,94,9,90,9,79' onclick='clickColor("#006600",-125,9)' onmouseover='mouseOverColor("#006600")' alt='#006600' />
    <area style='cursor:pointer' shape='poly' coords='36,75,45,79,45,90,36,94,27,90,27,79' onclick='clickColor("#00CC00",-125,27)' onmouseover='mouseOverColor("#00CC00")' alt='#00CC00' />
    <area style='cursor:pointer' shape='poly' coords='54,75,63,79,63,90,54,94,45,90,45,79' onclick='clickColor("#00FF00",-125,45)' onmouseover='mouseOverColor("#00FF00")' alt='#00FF00' />
    <area style='cursor:pointer' shape='poly' coords='72,75,81,79,81,90,72,94,63,90,63,79' onclick='clickColor("#66FF99",-125,63)' onmouseover='mouseOverColor("#66FF99")' alt='#66FF99' />
    <area style='cursor:pointer' shape='poly' coords='90,75,99,79,99,90,90,94,81,90,81,79' onclick='clickColor("#99FFCC",-125,81)' onmouseover='mouseOverColor("#99FFCC")' alt='#99FFCC' />
    <area style='cursor:pointer' shape='poly' coords='108,75,117,79,117,90,108,94,99,90,99,79' onclick='clickColor("#CCFFFF",-125,99)' onmouseover='mouseOverColor("#CCFFFF")' alt='#CCFFFF' />
    <area style='cursor:pointer' shape='poly' coords='126,75,135,79,135,90,126,94,117,90,117,79' onclick='clickColor("#CCCCFF",-125,117)' onmouseover='mouseOverColor("#CCCCFF")' alt='#CCCCFF' />
    <area style='cursor:pointer' shape='poly' coords='144,75,153,79,153,90,144,94,135,90,135,79' onclick='clickColor("#CC99FF",-125,135)' onmouseover='mouseOverColor("#CC99FF")' alt='#CC99FF' />
    <area style='cursor:pointer' shape='poly' coords='162,75,171,79,171,90,162,94,153,90,153,79' onclick='clickColor("#CC66FF",-125,153)' onmouseover='mouseOverColor("#CC66FF")' alt='#CC66FF' />
    <area style='cursor:pointer' shape='poly' coords='180,75,189,79,189,90,180,94,171,90,171,79' onclick='clickColor("#CC33FF",-125,171)' onmouseover='mouseOverColor("#CC33FF")' alt='#CC33FF' />
    <area style='cursor:pointer' shape='poly' coords='198,75,207,79,207,90,198,94,189,90,189,79' onclick='clickColor("#CC00FF",-125,189)' onmouseover='mouseOverColor("#CC00FF")' alt='#CC00FF' />
    <area style='cursor:pointer' shape='poly' coords='216,75,225,79,225,90,216,94,207,90,207,79' onclick='clickColor("#9900CC",-125,207)' onmouseover='mouseOverColor("#9900CC")' alt='#9900CC' />
    <area style='cursor:pointer' shape='poly' coords='9,90,18,94,18,105,9,109,0,105,0,94' onclick='clickColor("#003300",-110,0)' onmouseover='mouseOverColor("#003300")' alt='#003300' />
    <area style='cursor:pointer' shape='poly' coords='27,90,36,94,36,105,27,109,18,105,18,94' onclick='clickColor("#009933",-110,18)' onmouseover='mouseOverColor("#009933")' alt='#009933' />
    <area style='cursor:pointer' shape='poly' coords='45,90,54,94,54,105,45,109,36,105,36,94' onclick='clickColor("#33CC33",-110,36)' onmouseover='mouseOverColor("#33CC33")' alt='#33CC33' />
    <area style='cursor:pointer' shape='poly' coords='63,90,72,94,72,105,63,109,54,105,54,94' onclick='clickColor("#66FF66",-110,54)' onmouseover='mouseOverColor("#66FF66")' alt='#66FF66' />
    <area style='cursor:pointer' shape='poly' coords='81,90,90,94,90,105,81,109,72,105,72,94' onclick='clickColor("#99FF99",-110,72)' onmouseover='mouseOverColor("#99FF99")' alt='#99FF99' />
    <area style='cursor:pointer' shape='poly' coords='99,90,108,94,108,105,99,109,90,105,90,94' onclick='clickColor("#CCFFCC",-110,90)' onmouseover='mouseOverColor("#CCFFCC")' alt='#CCFFCC' />
    <area style='cursor:pointer' shape='poly' coords='117,90,126,94,126,105,117,109,108,105,108,94' onclick='clickColor("#FFFFFF",-110,108)' onmouseover='mouseOverColor("#FFFFFF")' alt='#FFFFFF' />
    <area style='cursor:pointer' shape='poly' coords='135,90,144,94,144,105,135,109,126,105,126,94' onclick='clickColor("#FFCCFF",-110,126)' onmouseover='mouseOverColor("#FFCCFF")' alt='#FFCCFF' />
    <area style='cursor:pointer' shape='poly' coords='153,90,162,94,162,105,153,109,144,105,144,94' onclick='clickColor("#FF99FF",-110,144)' onmouseover='mouseOverColor("#FF99FF")' alt='#FF99FF' />
    <area style='cursor:pointer' shape='poly' coords='171,90,180,94,180,105,171,109,162,105,162,94' onclick='clickColor("#FF66FF",-110,162)' onmouseover='mouseOverColor("#FF66FF")' alt='#FF66FF' />
    <area style='cursor:pointer' shape='poly' coords='189,90,198,94,198,105,189,109,180,105,180,94' onclick='clickColor("#FF00FF",-110,180)' onmouseover='mouseOverColor("#FF00FF")' alt='#FF00FF' />
    <area style='cursor:pointer' shape='poly' coords='207,90,216,94,216,105,207,109,198,105,198,94' onclick='clickColor("#CC00CC",-110,198)' onmouseover='mouseOverColor("#CC00CC")' alt='#CC00CC' />
    <area style='cursor:pointer' shape='poly' coords='225,90,234,94,234,105,225,109,216,105,216,94' onclick='clickColor("#660066",-110,216)' onmouseover='mouseOverColor("#660066")' alt='#660066' />
    <area style='cursor:pointer' shape='poly' coords='18,105,27,109,27,120,18,124,9,120,9,109' onclick='clickColor("#336600",-95,9)' onmouseover='mouseOverColor("#336600")' alt='#336600' />
    <area style='cursor:pointer' shape='poly' coords='36,105,45,109,45,120,36,124,27,120,27,109' onclick='clickColor("#009900",-95,27)' onmouseover='mouseOverColor("#009900")' alt='#009900' />
    <area style='cursor:pointer' shape='poly' coords='54,105,63,109,63,120,54,124,45,120,45,109' onclick='clickColor("#66FF33",-95,45)' onmouseover='mouseOverColor("#66FF33")' alt='#66FF33' />
    <area style='cursor:pointer' shape='poly' coords='72,105,81,109,81,120,72,124,63,120,63,109' onclick='clickColor("#99FF66",-95,63)' onmouseover='mouseOverColor("#99FF66")' alt='#99FF66' />
    <area style='cursor:pointer' shape='poly' coords='90,105,99,109,99,120,90,124,81,120,81,109' onclick='clickColor("#CCFF99",-95,81)' onmouseover='mouseOverColor("#CCFF99")' alt='#CCFF99' />
    <area style='cursor:pointer' shape='poly' coords='108,105,117,109,117,120,108,124,99,120,99,109' onclick='clickColor("#FFFFCC",-95,99)' onmouseover='mouseOverColor("#FFFFCC")' alt='#FFFFCC' />
    <area style='cursor:pointer' shape='poly' coords='126,105,135,109,135,120,126,124,117,120,117,109' onclick='clickColor("#FFCCCC",-95,117)' onmouseover='mouseOverColor("#FFCCCC")' alt='#FFCCCC' />
    <area style='cursor:pointer' shape='poly' coords='144,105,153,109,153,120,144,124,135,120,135,109' onclick='clickColor("#FF99CC",-95,135)' onmouseover='mouseOverColor("#FF99CC")' alt='#FF99CC' />
    <area style='cursor:pointer' shape='poly' coords='162,105,171,109,171,120,162,124,153,120,153,109' onclick='clickColor("#FF66CC",-95,153)' onmouseover='mouseOverColor("#FF66CC")' alt='#FF66CC' />
    <area style='cursor:pointer' shape='poly' coords='180,105,189,109,189,120,180,124,171,120,171,109' onclick='clickColor("#FF33CC",-95,171)' onmouseover='mouseOverColor("#FF33CC")' alt='#FF33CC' />
    <area style='cursor:pointer' shape='poly' coords='198,105,207,109,207,120,198,124,189,120,189,109' onclick='clickColor("#CC0099",-95,189)' onmouseover='mouseOverColor("#CC0099")' alt='#CC0099' />
    <area style='cursor:pointer' shape='poly' coords='216,105,225,109,225,120,216,124,207,120,207,109' onclick='clickColor("#993399",-95,207)' onmouseover='mouseOverColor("#993399")' alt='#993399' />
    <area style='cursor:pointer' shape='poly' coords='27,120,36,124,36,135,27,139,18,135,18,124' onclick='clickColor("#333300",-80,18)' onmouseover='mouseOverColor("#333300")' alt='#333300' />
    <area style='cursor:pointer' shape='poly' coords='45,120,54,124,54,135,45,139,36,135,36,124' onclick='clickColor("#669900",-80,36)' onmouseover='mouseOverColor("#669900")' alt='#669900' />
    <area style='cursor:pointer' shape='poly' coords='63,120,72,124,72,135,63,139,54,135,54,124' onclick='clickColor("#99FF33",-80,54)' onmouseover='mouseOverColor("#99FF33")' alt='#99FF33' />
    <area style='cursor:pointer' shape='poly' coords='81,120,90,124,90,135,81,139,72,135,72,124' onclick='clickColor("#CCFF66",-80,72)' onmouseover='mouseOverColor("#CCFF66")' alt='#CCFF66' />
    <area style='cursor:pointer' shape='poly' coords='99,120,108,124,108,135,99,139,90,135,90,124' onclick='clickColor("#FFFF99",-80,90)' onmouseover='mouseOverColor("#FFFF99")' alt='#FFFF99' />
    <area style='cursor:pointer' shape='poly' coords='117,120,126,124,126,135,117,139,108,135,108,124' onclick='clickColor("#FFCC99",-80,108)' onmouseover='mouseOverColor("#FFCC99")' alt='#FFCC99' />
    <area style='cursor:pointer' shape='poly' coords='135,120,144,124,144,135,135,139,126,135,126,124' onclick='clickColor("#FF9999",-80,126)' onmouseover='mouseOverColor("#FF9999")' alt='#FF9999' />
    <area style='cursor:pointer' shape='poly' coords='153,120,162,124,162,135,153,139,144,135,144,124' onclick='clickColor("#FF6699",-80,144)' onmouseover='mouseOverColor("#FF6699")' alt='#FF6699' />
    <area style='cursor:pointer' shape='poly' coords='171,120,180,124,180,135,171,139,162,135,162,124' onclick='clickColor("#FF3399",-80,162)' onmouseover='mouseOverColor("#FF3399")' alt='#FF3399' />
    <area style='cursor:pointer' shape='poly' coords='189,120,198,124,198,135,189,139,180,135,180,124' onclick='clickColor("#CC3399",-80,180)' onmouseover='mouseOverColor("#CC3399")' alt='#CC3399' />
    <area style='cursor:pointer' shape='poly' coords='207,120,216,124,216,135,207,139,198,135,198,124' onclick='clickColor("#990099",-80,198)' onmouseover='mouseOverColor("#990099")' alt='#990099' />
    <area style='cursor:pointer' shape='poly' coords='36,135,45,139,45,150,36,154,27,150,27,139' onclick='clickColor("#666633",-65,27)' onmouseover='mouseOverColor("#666633")' alt='#666633' />
    <area style='cursor:pointer' shape='poly' coords='54,135,63,139,63,150,54,154,45,150,45,139' onclick='clickColor("#99CC00",-65,45)' onmouseover='mouseOverColor("#99CC00")' alt='#99CC00' />
    <area style='cursor:pointer' shape='poly' coords='72,135,81,139,81,150,72,154,63,150,63,139' onclick='clickColor("#CCFF33",-65,63)' onmouseover='mouseOverColor("#CCFF33")' alt='#CCFF33' />
    <area style='cursor:pointer' shape='poly' coords='90,135,99,139,99,150,90,154,81,150,81,139' onclick='clickColor("#FFFF66",-65,81)' onmouseover='mouseOverColor("#FFFF66")' alt='#FFFF66' />
    <area style='cursor:pointer' shape='poly' coords='108,135,117,139,117,150,108,154,99,150,99,139' onclick='clickColor("#FFCC66",-65,99)' onmouseover='mouseOverColor("#FFCC66")' alt='#FFCC66' />
    <area style='cursor:pointer' shape='poly' coords='126,135,135,139,135,150,126,154,117,150,117,139' onclick='clickColor("#FF9966",-65,117)' onmouseover='mouseOverColor("#FF9966")' alt='#FF9966' />
    <area style='cursor:pointer' shape='poly' coords='144,135,153,139,153,150,144,154,135,150,135,139' onclick='clickColor("#FF6666",-65,135)' onmouseover='mouseOverColor("#FF6666")' alt='#FF6666' />
    <area style='cursor:pointer' shape='poly' coords='162,135,171,139,171,150,162,154,153,150,153,139' onclick='clickColor("#FF0066",-65,153)' onmouseover='mouseOverColor("#FF0066")' alt='#FF0066' />
    <area style='cursor:pointer' shape='poly' coords='180,135,189,139,189,150,180,154,171,150,171,139' onclick='clickColor("#CC6699",-65,171)' onmouseover='mouseOverColor("#CC6699")' alt='#CC6699' />
    <area style='cursor:pointer' shape='poly' coords='198,135,207,139,207,150,198,154,189,150,189,139' onclick='clickColor("#993366",-65,189)' onmouseover='mouseOverColor("#993366")' alt='#993366' />
    <area style='cursor:pointer' shape='poly' coords='45,150,54,154,54,165,45,169,36,165,36,154' onclick='clickColor("#999966",-50,36)' onmouseover='mouseOverColor("#999966")' alt='#999966' />
    <area style='cursor:pointer' shape='poly' coords='63,150,72,154,72,165,63,169,54,165,54,154' onclick='clickColor("#CCCC00",-50,54)' onmouseover='mouseOverColor("#CCCC00")' alt='#CCCC00' />
    <area style='cursor:pointer' shape='poly' coords='81,150,90,154,90,165,81,169,72,165,72,154' onclick='clickColor("#FFFF00",-50,72)' onmouseover='mouseOverColor("#FFFF00")' alt='#FFFF00' />
    <area style='cursor:pointer' shape='poly' coords='99,150,108,154,108,165,99,169,90,165,90,154' onclick='clickColor("#FFCC00",-50,90)' onmouseover='mouseOverColor("#FFCC00")' alt='#FFCC00' />
    <area style='cursor:pointer' shape='poly' coords='117,150,126,154,126,165,117,169,108,165,108,154' onclick='clickColor("#FF9933",-50,108)' onmouseover='mouseOverColor("#FF9933")' alt='#FF9933' />
    <area style='cursor:pointer' shape='poly' coords='135,150,144,154,144,165,135,169,126,165,126,154' onclick='clickColor("#FF6600",-50,126)' onmouseover='mouseOverColor("#FF6600")' alt='#FF6600' />
    <area style='cursor:pointer' shape='poly' coords='153,150,162,154,162,165,153,169,144,165,144,154' onclick='clickColor("#FF5050",-50,144)' onmouseover='mouseOverColor("#FF5050")' alt='#FF5050' />
    <area style='cursor:pointer' shape='poly' coords='171,150,180,154,180,165,171,169,162,165,162,154' onclick='clickColor("#CC0066",-50,162)' onmouseover='mouseOverColor("#CC0066")' alt='#CC0066' />
    <area style='cursor:pointer' shape='poly' coords='189,150,198,154,198,165,189,169,180,165,180,154' onclick='clickColor("#660033",-50,180)' onmouseover='mouseOverColor("#660033")' alt='#660033' />
    <area style='cursor:pointer' shape='poly' coords='54,165,63,169,63,180,54,184,45,180,45,169' onclick='clickColor("#996633",-35,45)' onmouseover='mouseOverColor("#996633")' alt='#996633' />
    <area style='cursor:pointer' shape='poly' coords='72,165,81,169,81,180,72,184,63,180,63,169' onclick='clickColor("#CC9900",-35,63)' onmouseover='mouseOverColor("#CC9900")' alt='#CC9900' />
    <area style='cursor:pointer' shape='poly' coords='90,165,99,169,99,180,90,184,81,180,81,169' onclick='clickColor("#FF9900",-35,81)' onmouseover='mouseOverColor("#FF9900")' alt='#FF9900' />
    <area style='cursor:pointer' shape='poly' coords='108,165,117,169,117,180,108,184,99,180,99,169' onclick='clickColor("#CC6600",-35,99)' onmouseover='mouseOverColor("#CC6600")' alt='#CC6600' />
    <area style='cursor:pointer' shape='poly' coords='126,165,135,169,135,180,126,184,117,180,117,169' onclick='clickColor("#FF3300",-35,117)' onmouseover='mouseOverColor("#FF3300")' alt='#FF3300' />
    <area style='cursor:pointer' shape='poly' coords='144,165,153,169,153,180,144,184,135,180,135,169' onclick='clickColor("#FF0000",-35,135)' onmouseover='mouseOverColor("#FF0000")' alt='#FF0000' />
    <area style='cursor:pointer' shape='poly' coords='162,165,171,169,171,180,162,184,153,180,153,169' onclick='clickColor("#CC0000",-35,153)' onmouseover='mouseOverColor("#CC0000")' alt='#CC0000' />
    <area style='cursor:pointer' shape='poly' coords='180,165,189,169,189,180,180,184,171,180,171,169' onclick='clickColor("#990033",-35,171)' onmouseover='mouseOverColor("#990033")' alt='#990033' />
    <area style='cursor:pointer' shape='poly' coords='63,180,72,184,72,195,63,199,54,195,54,184' onclick='clickColor("#663300",-20,54)' onmouseover='mouseOverColor("#663300")' alt='#663300' />
    <area style='cursor:pointer' shape='poly' coords='81,180,90,184,90,195,81,199,72,195,72,184' onclick='clickColor("#996600",-20,72)' onmouseover='mouseOverColor("#996600")' alt='#996600' />
    <area style='cursor:pointer' shape='poly' coords='99,180,108,184,108,195,99,199,90,195,90,184' onclick='clickColor("#CC3300",-20,90)' onmouseover='mouseOverColor("#CC3300")' alt='#CC3300' />
    <area style='cursor:pointer' shape='poly' coords='117,180,126,184,126,195,117,199,108,195,108,184' onclick='clickColor("#993300",-20,108)' onmouseover='mouseOverColor("#993300")' alt='#993300' />
    <area style='cursor:pointer' shape='poly' coords='135,180,144,184,144,195,135,199,126,195,126,184' onclick='clickColor("#990000",-20,126)' onmouseover='mouseOverColor("#990000")' alt='#990000' />
    <area style='cursor:pointer' shape='poly' coords='153,180,162,184,162,195,153,199,144,195,144,184' onclick='clickColor("#800000",-20,144)' onmouseover='mouseOverColor("#800000")' alt='#800000' />
    <area style='cursor:pointer' shape='poly' coords='171,180,180,184,180,195,171,199,162,195,162,184' onclick='clickColor("#993333",-20,162)' onmouseover='mouseOverColor("#993333")' alt='#993333' />
   `;
  return html;
}
function combineLetters(list) {
  if (list.length === 0) return [];
  let result = [''];
  for (const str of list) {
    let temp = [];
    for (const combo of result) {
      for (const char of str) {
        temp.push(combo + char);
      }
    }
    result = temp;
  }
  return result;
}
function computeColorX(c) {
  let res = c;
  if (isList(c)) return rChoose(c);
  else if (isString(c) && c.startsWith('rand')) {
    res = rColor();
    let spec = c.substring(4);
    if (isdef(window['color' + spec])) {
      res = window['color' + spec](res);
    }
  }
  return res;
}
function computeFaceNeighbors(face_list) {
  const vertexToFaces = new Map();
  face_list.forEach((faceVerts, faceIdx) => {
    faceVerts.forEach((v) => {
      if (!vertexToFaces.has(v)) vertexToFaces.set(v, new Set());
      vertexToFaces.get(v).add(faceIdx);
    });
  });
  const neighbors = {};
  face_list.forEach((faceVerts, faceIdx) => {
    const neighborSet = new Set();
    faceVerts.forEach((v) => {
      const facesWithV = vertexToFaces.get(v);
      facesWithV.forEach((neighborFaceIdx) => {
        if (neighborFaceIdx !== faceIdx) {
          neighborSet.add(neighborFaceIdx);
        }
      });
    });
    neighbors[faceIdx] = Array.from(neighborSet).sort((a, b) => a - b);
  });
  return neighbors;
}
function conslog() {
  console.log(joinArgumentsToString(...arguments))
}
function contains(s, sSub) { return s.toLowerCase().includes(sSub.toLowerCase()); }
function convertDogmaText(t) {
  let parts = t.split('[');
  let html = parts[0];
  for (const p of parts.slice(1)) {
    let k = stringBefore(p, ']');
    if (isNumber(k)) {
      let lpad = k == '10' ? 0 : 6;
      let rpad = k == '10' ? 3 : 6;
      html += `<span style="padding-left:${lpad}px;padding-right:${rpad}px;background-color:white;color:black;border-radius:50%">${k}</span>`;
    } else if (isdef(InnoDict[k])) {
      let sym = InnoDict[k].k;
      let bg = InnoDict[k].bg;
      let fg = InnoDict[k].fg;
      let s1 = symbolDict[sym];
      let family = s1.family;
      let txt = s1.text;
      let pad = k == 'factory' ? '2px 6px' : '2px';
      html += `<span style="padding:${pad};font-family:${family};background-color:${bg};color:white;border-radius:50%">${txt}</span>`;
    } else html += ` ${k} `
    html += stringAfter(p, ']');
  }
  return html;
}
function copyKeys(ofrom, oto, except = {}, only = null) {
  let keys = isdef(only) ? only : Object.keys(ofrom);
  for (const k of keys) {
    if (isdef(except[k])) continue;
    oto[k] = ofrom[k];
  }
  return oto;
}
function correctFuncName(specType) {
  switch (specType) {
    case 'list': specType = 'liste'; break;
    case 'dict': specType = 'dicti'; break;
    case undefined: specType = 'panel'; break;
  }
  return specType;
}
function createAlphaSet(baselist, n) {
  let keys = rChoose(baselist, n);
  keys.sort();
  let oddman = keys[0];
  list = arrShuffle(keys);
  return { inst: 'click the first symbol in alphabetical order', list, oddman };
}
function createBlendModeItems(theme) {
  let blendModes = arrMinus(getBlendModesCSS(), ['saturation', 'color']);
  let itemsBlend = [];
  for (let i = 0; i < blendModes.length; i++) {
    let item = jsCopy(theme); item.bgBlend = blendModes[i]; item.bgImage = `url('${item.texture}')`;
    item.name = item.bgBlend;
    itemsBlend.push(item);
  }
  return itemsBlend;
}
function createCard(rank = "10", suit = "♣", height = 200, width) {
  if (nundef(width)) width = height * 0.7;
  const color = (suit === "♥" || suit === "♦") ? "red" : "black";
  const card = document.createElement("div");
  card.style.position = "relative";
  card.style.width = width + "px";
  card.style.height = height + "px";
  card.style.border = "1px solid black";
  card.style.borderRadius = Math.max(4, width / 20) + "px";
  card.style.background = "white";
  card.style.fontFamily = '"DejaVu Sans", "Arial Unicode MS", sans-serif';
  const pipFontSize = height * 0.2;
  const topMargin = height * 0.12;
  const pipSpacing = (height - 2 * topMargin) / 3.3;
  const centerX = width / 2;
  const colOffset = width * 0.22;
  const colX = [
    centerX - colOffset,
    centerX,
    centerX + colOffset
  ];
  const pipPatterns = {
    1: [[1, [1.5]]],
    2: [[1, [0, 3]]],
    3: [[1, [0, 1.5, 3]]],
    4: [[0, [0, 3]], [2, [0, 3]]],
    5: [[0, [0, 3]], [1, [1.5]], [2, [0, 3]]],
    6: [[0, [0, 1.5, 3]], [2, [0, 1.5, 3]]],
    7: [[0, [0, 1.5, 3]], [1, [0.75]], [2, [0, 1.5, 3]]],
    8: [[0, [0, 1.5, 3]], [1, [0.75, 2.25]], [2, [0, 1.5, 3]]],
    9: [[0, [0, 1, 2, 3]], [1, [1.5]], [2, [0, 1, 2, 3]]],
    10: [[0, [0, 1, 2, 3]], [1, [0.5, 2.5]], [2, [0, 1, 2, 3]]],
    11: [[0, [0, 1, 2, 3]], [1, [0.5, 1.5, 2.5]], [2, [0, 1, 2, 3]]],
  };
  const pipData = pipPatterns[parseInt(rank)];
  if (pipData) {
    for (const [col, rows] of pipData) {
      for (const row of rows) {
        const pip = document.createElement("div");
        pip.textContent = suit;
        pip.style.position = "absolute";
        pip.style.fontSize = pipFontSize + "px";
        pip.style.color = color;
        pip.style.left = (colX[col] - pipFontSize * 0.5) + "px";
        pip.style.top = (topMargin + pipSpacing * row - pipFontSize * 0.5) + "px";
        if (row >= 2.8) pip.style.transform = "rotate(180deg)";
        card.appendChild(pip);
      }
    }
  }
  function makeCorner() {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.fontSize = Math.floor(height * 0.1) + "px";
    div.style.display = "flex";
    div.style.flexDirection = "column";
    div.style.alignItems = "center";
    div.style.lineHeight = "1";
    div.style.color = color;
    const rankDiv = document.createElement("div");
    rankDiv.textContent = rank;
    const suitDiv = document.createElement("div");
    suitDiv.textContent = suit;
    div.appendChild(rankDiv);
    div.appendChild(suitDiv);
    return div;
  }
  const top = makeCorner();
  top.style.left = "5px";
  top.style.top = "5px";
  card.appendChild(top);
  const bottom = makeCorner();
  bottom.style.right = "5px";
  bottom.style.bottom = "5px";
  bottom.style.transform = "rotate(180deg)";
  card.appendChild(bottom);
  return card;
}
function createCardContainer(dParent, styles = {}, id) {
  let container = mDom(dParent, { ...flexCenterCenter(), fg: 'white', ...styles }, { id });
  return container;
}
async function createColorItems(theme, n = 10) {
  let colors = [colorFrom(theme.color)];
  if (!isEmpty(theme.texture)) {
    colors = await createThemePalette(theme.texture, theme.bgBlend, theme.color, n);
  } else {
    colors = createSingleColorPalette(theme.color)
  }
  let palettes = paletteCreateFrom(colors);
  let pal = [];
  for (const p of palettes) {
    let pal2 = p.map(
      x => {
        let x1 = colorFrom(x);
        let res = colorNearestNamed(x1);
        assertion(isDict(res), `FALSCH! ${x} ${x1} ${res}`);
        return res;
      });
    pal = pal.concat(pal2);
  }
  pal.map(x => x.color = x.hex)
  return pal;
}
function createCustomCard(rank = "A", symbol = "♠", color = "#111", family = 'emoNoto', height = 160, width) {
  if (typeof width === "undefined") width = Math.round(height * 0.7);
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", `${rank} ${symbol}`);
  svg.style.display = "block";
  const radius = Math.max(6, width / 20);
  const borderInset = 1;
  const bg = document.createElementNS(ns, "rect");
  bg.setAttribute("x", 0.5 + borderInset); // inset the stroke
  bg.setAttribute("y", 0.5 + borderInset);
  bg.setAttribute("rx", radius);
  bg.setAttribute("ry", radius);
  bg.setAttribute("width", width - 1 - 2 * borderInset); // account for inset
  bg.setAttribute("height", height - 1 - 2 * borderInset);
  bg.setAttribute("fill", "white");
  bg.setAttribute("stroke", "silver"); // only border
  bg.setAttribute("stroke-width", 1);
  svg.appendChild(bg);
  const cornerPad = Math.max(6, Math.round(width * 0.03));
  const smallIndexFont = Math.round(height * 0.10);
  const smallSuitFont = Math.round(height * 0.09);
  const pipFont = Math.round(height * 0.22);
  const centerX = width / 2;
  const topMargin = height * 0.12;
  const pipSpacing = (height - 2 * topMargin) / 3.3;
  const colOffset = width * 0.22;
  const colX = [centerX - colOffset, centerX, centerX + colOffset];
  const pipPatterns = {
    1: [[1, [1.5]]],
    2: [[1, [0, 3]]],
    3: [[1, [0, 1.5, 3]]],
    4: [[0, [0, 3]], [2, [0, 3]]],
    5: [[0, [0, 3]], [1, [1.5]], [2, [0, 3]]],
    6: [[0, [0, 1.5, 3]], [2, [0, 1.5, 3]]],
    7: [[0, [0, 1.5, 3]], [1, [0.75]], [2, [0, 1.5, 3]]],
    8: [[0, [0, 1.5, 3]], [1, [0.75, 2.25]], [2, [0, 1.5, 3]]],
    9: [[0, [0, 1, 2, 3]], [1, [1.5]], [2, [0, 1, 2, 3]]],
    10: [[0, [0, 1, 2, 3]], [1, [0.5, 2.5]], [2, [0, 1, 2, 3]]]
  };
  function _makeSymbolText(txt, fontSize, x, y, options = {}) {
    const t = document.createElementNS(ns, "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.setAttribute("fill", options.fill || color);
    t.setAttribute("font-size", fontSize / 2);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
    t.setAttribute(
      "font-family",
      options.fontFamily ||
      '"DejaVu Sans", "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif'
    );
    if (options.transform) t.setAttribute("transform", options.transform);
    t.textContent = decodeHtmlEntity(txt);
    return t;
  }
  function makeSymbolText(txt, fontSize, x, y, options = {}) {
    txt = decodeHtmlEntity(txt);
    const t = document.createElementNS(ns, "text");
    t.setAttribute("x", x);
    t.setAttribute("y", y);
    t.setAttribute("fill", options.fill || color);
    t.setAttribute("font-size", fontSize);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("dominant-baseline", "middle");
    t.setAttribute(
      "font-family",
      options.fontFamily ||
      '"DejaVu Sans","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif"'
    );
    t.textContent = txt;
    if (options.transform) t.setAttribute("transform", options.transform);
    return t;
  }
  const cornerGroup = document.createElementNS(ns, "g");
  cornerGroup.setAttribute("transform", `translate(${cornerPad}, ${cornerPad})`);
  const rankText = document.createElementNS(ns, "text");
  rankText.setAttribute("x", 0);
  rankText.setAttribute("y", 0);
  rankText.setAttribute("fill", color);
  rankText.setAttribute("font-size", smallIndexFont);
  rankText.setAttribute("font-family", "serif");
  rankText.setAttribute("dominant-baseline", "hanging");
  rankText.textContent = rank;
  cornerGroup.appendChild(rankText);
  const smallSuit = document.createElementNS(ns, "text");
  smallSuit.setAttribute("x", Math.max(smallIndexFont * 0.5, 0));
  smallSuit.setAttribute("y", smallIndexFont + 4);
  smallSuit.setAttribute("fill", color);
  smallSuit.setAttribute("font-size", smallSuitFont);
  smallSuit.setAttribute("text-anchor", "middle");
  smallSuit.setAttribute("dominant-baseline", "hanging");
  smallSuit.textContent = decodeHtmlEntity(symbol);
  cornerGroup.appendChild(smallSuit);
  svg.appendChild(cornerGroup);
  const cornerBottom = cornerGroup.cloneNode(true);
  const bx = width - cornerPad;
  const by = height - cornerPad;
  const gbottom = document.createElementNS(ns, "g");
  gbottom.setAttribute(
    "transform",
    `translate(${bx}, ${by}) rotate(180) translate(${-cornerPad}, ${-cornerPad})`
  );
  gbottom.appendChild(cornerBottom);
  svg.appendChild(gbottom);
  let symsz = 0.4;
  const numeric = parseInt(rank, 10);
  if (rank === "J" || rank === "Q" || rank === "K") {
    let raw;
    if (rank === "K") raw = getSvgKing();
    else if (rank === "Q") raw = getSvgQueen();
    else raw = getSvgJack();
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, "image/svg+xml");
    const faceSvg = doc.documentElement;
    const vb = faceSvg.getAttribute("viewBox").split(/\s+/).map(Number);
    const [vx, vy, vw, vh] = vb;
    const maxH = height * 0.75;
    const scale = maxH / vh;
    const gx = (width - vw * scale) / 2;
    const gy = (height - vh * scale) / 2;
    const gFace = document.createElementNS(ns, "g");
    gFace.setAttribute(
      "transform",
      `translate(${gx}, ${gy}) scale(${scale})`
    );
    gFace.appendChild(faceSvg);
    svg.appendChild(gFace);
    const gFace2 = document.createElementNS(ns, "g");
    gFace2.setAttribute(
      "transform",
      `translate(${width}, ${height}) rotate(180) translate(${gx}, ${gy}) scale(${scale})`
    );
    const clone2 = faceSvg.cloneNode(true);
    gFace2.appendChild(clone2);
    svg.appendChild(gFace2);
  }
  else if (rank === "A") {
    const big = makeSymbolText(symbol, Math.round(height * symsz), centerX, height / 2, { fill: color });
    svg.appendChild(big);
  }
  else if (!Number.isNaN(numeric) && pipPatterns[numeric]) {
    const pattern = pipPatterns[numeric];
    for (const [col, rows] of pattern) {
      for (const row of rows) {
        const cx = colX[col];
        const cy = topMargin + pipSpacing * row;
        const rotate = row >= 2.8;
        if (!rotate) {
          const t = makeSymbolText(symbol, Math.round(pipFont * 2 / 3), cx, cy);
          svg.appendChild(t);
        } else {
          const g = document.createElementNS(ns, "g");
          g.setAttribute("transform", `translate(${cx}, ${cy}) rotate(180)`);
          const t = makeSymbolText(symbol, Math.round(pipFont * 2 / 3), 0, 0);
          g.appendChild(t);
          svg.appendChild(g);
        }
      }
    }
  }
  else {
    const fallback = makeSymbolText(
      symbol,
      Math.round(height * 0.45),
      centerX,
      height / 2,
      { fill: color }
    );
    svg.appendChild(fallback);
  }
  return svg;
}
function createFrequentSet(baselist, n) {
  let keys = rChoose(baselist, n);
  let oddman = keys[0];
  let nums = [3];
  let rest = divideNumberRandomly(n - 3, [1, 2]);
  nums = nums.concat(rest);
  let list = assignKeywordsByCounts(nums, keys);
  list = arrShuffle(list);
  return { inst: 'click the most frequent symbol', list, oddman };
}
function createGameCard(container, game) {
  let bg = game.color, fg = colorIdealText(bg);
  let styles = { cursor: 'pointer', rounding: 10, bg, fg, fz: 65, hline: 65, padding: 10, wmin: 140, margin: 10, align: 'center' }; //, margin: 10, padding: 10, patop: 10, w: 140, height: 100, bg, position: 'relative' }
  let x = mKey(game.logo, container, styles, { label: capitalize(game.friendly), prefer: 'emo' });
  x.onclick = onclickGameMenuItem;
  x.setAttribute('gamename', game.name);
  x.id = game.id;
  return x;
}
function createGameTable(gamename, playerNames, options = {}, ploptions = {}) {
  if (nundef(playerNames)) playerNames = ['mimi', 'felix'];
  let defaults = M.config.games[gamename].options;
  if (defaults) {
    for (const k in defaults) {
      if (nundef(options[k])) {
        let val = defaults[k];
        if (isString(val) && val.includes(',')) { val = val.split(','); val = val[val.length - 1].trim(); }
        options[k] = isNumber(val) ? Number(val) : val;
      }
    }
  }
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
function createGrid(n, m, cellSize = "auto") {
  const grid = document.createElement("div");
  grid.style.display = "inline-grid";
  grid.style.gridTemplateRows = `repeat(${n}, ${cellSize})`;
  grid.style.gridTemplateColumns = `repeat(${m}, ${cellSize})`;
  grid.style.gap = "4px"; // optional spacing between cells
  for (let i = 0; i < n * m; i++) {
    const cell = document.createElement("div");
    cell.style.background = "#ccc";
    cell.textContent = i + 1;
    grid.appendChild(cell);
  }
  return grid;
}
function createHexShapedGrid(containerId, rows = 5, maxCols = 5, sz = 50, gap = 1) {
  if (rows % 2 === 0) {
    console.error("Number of rows must be odd for a symmetrical hexagon grid.");
    return;
  }
  const container = toElem(containerId);
  container.innerHTML = '';
  const hexWidth = sz * 2;
  const hexHeight = hexWidth;
  const vertSpacing = hexHeight * 0.75;
  const midRow = Math.floor(rows / 2);
  const tiles = {};
  let [w, h] = [hexWidth - gap, hexHeight - gap];
  for (let r = 0; r < rows; r++) {
    const offsetFromMiddle = Math.abs(midRow - r);
    const cols = maxCols - offsetFromMiddle;
    const totalRowOffset = ((maxCols - cols) / 2) * hexWidth;
    const horizontalOffset = (r % 2 === 1) ? hexWidth / 2 : 0;
    const y = r * vertSpacing;
    for (let i = 0; i < cols; i++) {
      const x = i * hexWidth + totalRowOffset;
      const c = Math.round(x / (hexWidth / 2));
      const id = `r${r}_c${c}`;
      let div = mDom(container, { className: 'hex', left: x, top: y, w, h }, { id })
      const tile = { id, div, x, y, sz, c, r, NE: null, E: null, SE: null, SW: null, W: null, NW: null };
      tiles[id] = tile;
    }
  }
  for (const id in tiles) {
    const tile = tiles[id];
    let [r, c] = [tile.r, tile.c];
    function getTile(rr, cc) { return tiles[`r${rr}_c${cc}`] || null; }
    tile.E = getTile(r, c + 2);
    tile.W = getTile(r, c - 2);
    tile.NE = getTile(r - 1, c + 1);
    tile.NW = getTile(r - 1, c - 1);
    tile.SE = getTile(r + 1, c + 1);
    tile.SW = getTile(r + 1, c - 1);
  }
  let hGrid = rows * vertSpacing + hexHeight * 0.25;
  let wGrid = maxCols * hexWidth;
  mStyle(container, { w: wGrid, h: hGrid }); //,bg:'skyblue'})
  return tiles;
}
function createInteractiveCanvas(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = 300 / Math.min(img.width, img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      let isDragging = false;
      let rect = { x: 100, y: 100, width: 50, height: 50 }; // Initial rectangle properties
      let dragOffsetX, dragOffsetY;
      function isMouseInRect(x, y) {
        return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height;
      }
      function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        ctx.fillStyle = 'red';
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      }
      canvas.addEventListener('mousedown', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (isMouseInRect(x, y)) {
          isDragging = true;
          dragOffsetX = x - rect.x;
          dragOffsetY = y - rect.y;
        }
      });
      canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
          const rect = canvas.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          rect.x = x - dragOffsetX;
          rect.y = y - dragOffsetY;
          draw();
        }
      });
      canvas.addEventListener('mouseup', () => {
        isDragging = false;
      });
      draw();
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });
}
async function createItemPalette(d0, url, bgBlend, bg, n, bgSize, bgRepeat, o, w, h) {
  let items = await showImageColorPaletteN(d0, url, bgBlend, bg, n);
  items.map(x => { x.bgBlend = bgBlend; x.url = url; x.bgSize = bgSize; x.bgRepeat = bgRepeat; x.dir = o.dir; x.file = o.file; });
  for (const item of items) {
    item.div.onclick = () => {
      let di;
      if (o.dir == 'tnew') {
        di = mDom(null, { w, h, bg: item.bg, bgBlend, bgImage: bgImageFromPath(url), bgRepeat: 'repeat', bgPos: 'center', cursor: 'pointer', title: o.file });
      } else {
        di = mDom(null, { w, h, bg: item.bg, bgBlend, bgImage: bgImageFromPath(url), bgSize, bgPos: 'center', cursor: 'pointer', title: o.file });
      }
      replaceNthChild(d0, 2, di)
      di.onclick = async () => {
        createItemPalette(d0, url, bgBlend, item.bg, n, bgSize, bgRepeat, o, w, h);
        if (arrChildren(d0).length > 3) removeNthChild(d0, 3);
      }
    }
  }
}
function createKeys(n, group, subgroupRegex) {
  let list = Object.keys(M.emogroup[group]);
  let subgroups = matchWildcardArray(subgroupRegex, list);
  let keypool = subgroups.map(x => M.emogroup[group][x]).flat();
  let keys = rChoose(keypool, n);
  return keys;
}
function createOddManSet(listYes, listNo, n) {
  let res = rChoose(listYes, n - 1);
  let oddman = rChoose(listNo);
  res.push(oddman);
  res = arrShuffle(res);
  return { inst: 'click the symbol that does not fit', list: res, oddman };
}
function createPlayerOptionDialog(plName, gamename, dPlayer, label) {
  let dParent = mBy('dGameMenu');
  let poss = M.config.games[gamename].ploptions;
  if (!poss) return;
  let dPlOpts = mBy('dPlayerOptions');
  if (isdef(dPlOpts)) mClear(dPlOpts);
  else dPlOpts = mDom(dParent, { fg: 'black', bg: 'linen', border: `solid 2px ${'silver'}`, rounding: 6, display: 'inline-block', hPadding: 3 }, { id: 'dPlayerOptions' });
  mDom(dPlOpts, { maleft: 5, matop: -2 }, { html: label });
  let d = mDom(dPlOpts, { display: 'flex', justifyContent: 'center', flexWrap: 'wrap' });
  for (const [key, val] of Object.entries(poss)) {
    if (!isString(val)) continue;
    let list = val.split(',');
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
function createScaledCanvasFromImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = 300 / Math.min(img.width, img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      resolve(canvas);
    };
    img.onerror = reject;
    img.src = src;
  });
}
function createSingleColorPalette(bg, n = 10) {
  let colors = getMatchingColorList(bg);
  if (colors.length < n) { colors = colors.concat(colors.map(x => invertColor(x))); }
  if (colors.length < n) { colors = colors.concat(colors.map(x => colorComplement(x))); }
  while (colors.length < n) { colors.push(rColor()); }
  colors = colors.slice(0, n).map(x => colorFrom(x));
  return colors;
}
function createSymbol(id, viewBox, pathData, fill = "#000") {
  const svgNS = "http://www.w3.org/2000/svg";
  const symbol = document.createElementNS(svgNS, "symbol");
  symbol.setAttribute("id", id);
  symbol.setAttribute("viewBox", viewBox);
  symbol.setAttribute("preserveAspectRatio", "none");
  const path = document.createElementNS(svgNS, "path");
  path.setAttribute("d", pathData);
  path.setAttribute("fill", fill);
  symbol.appendChild(path);
  return symbol;
}
async function createTextureItems(theme) {
  let textures = await getTexturesForThemeEditor();
  let itemsTexture = [];
  for (let i = 0; i < textures.length; i++) {
    let item = jsCopy(theme);
    let o = textures[i];
    let url = `../assets/${o.dir}/${o.file}`;
    item.texture = url;
    item.bgImage = `url('${url}')`;
    switch (o.dir) {
      case 'texwall':
        item.bgSize = 'cover'; // use cover for minimal cropping
        item.bgRepeat = 'no-repeat';
        item.bgBlend = DA.theme.bgBlend || 'luminosity';
        break;
      case 'texrepeat':
        let nums = getAppendedNumbers(stringBeforeLast(o.file, '.'));
        item.bgSize = nums.length == 2 ? `${nums[0]}px ${nums[1]}px` : 'auto';
        item.bgRepeat = 'repeat';
        item.bgBlend = DA.theme.bgBlend || 'normal';
        break;
    }
    item.name = o.file;
    itemsTexture.push(item);
  }
  return itemsTexture;
}
async function createThemePalette(url, bgBlend, bg, n = 10, minocc = 0, sz = 60) {
  let colors = await getMostDifferentColorsWithThresholdAndBlend(url, bgBlend, bg, n, minocc, sz);
  if (colors.length < n) { colors = colors.concat(colors.map(x => invertColor(x))); }
  if (colors.length < n) { colors = colors.concat(colors.map(x => colorComplement(x))); }
  while (colors.length < n) { colors.push(rColor()); }
  colors = colors.slice(0, n).map(x => colorFrom(x));
  return colors;
}
function createUniqueSet(baselist, n) {
  let keys = rChoose(baselist, n);
  let oddman = keys[0];
  let nums = [1];
  let rest = divideNumberRandomly(n - 1, [2, 3]);
  nums = nums.concat(rest);
  let list = assignKeywordsByCounts(nums, keys);
  list = arrShuffle(list);
  return { inst: 'click the symbol that is unique', list, oddman };
}
function create_bluff_input1(me, table, ui, dParent, arr, units = 1, sz, index) {
  let d = mDiv(dParent, { gap: 5, w: units * sz * 1.35 }); mCenterFlex(d);
  for (const a of arr) {
    let da = mDiv(d, { align: 'center', wmin: 20, padding: 4, cursor: 'pointer', rounding: 4, bg: units == 1 ? '#e4914b' : 'sienna', fg: 'contrast' }, null, a == 'T' ? '10' : a); //units == 1?a:di[a]);
    da.onclick = () => input_to_anzeige1(me, table, ui, a, index);
  }
  return d;
}
function create_fen_deck(cardtype, num_decks = 1, num_jokers = 0) {
  let arr = Object.keys(C52Cards).map(x => x + cardtype);
  let newarr = [];
  while (num_decks > 0) { newarr = newarr.concat(arr); num_decks--; }
  while (num_jokers > 0) { newarr.push('*H' + cardtype); num_jokers--; }
  return newarr;
}
function cropImage(imageUrl, d) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    d.appendChild(canvas);
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    let isCropping = false;
    let startX, startY, endX, endY;
    canvas.addEventListener('mousedown', (e) => {
      isCropping = true;
      startX = e.offsetX;
      startY = e.offsetY;
    });
    canvas.addEventListener('mousemove', (e) => {
      if (isCropping) {
        endX = e.offsetX;
        endY = e.offsetY;
        drawCropRect();
      }
    });
    canvas.addEventListener('mouseup', (e) => {
      if (isCropping) {
        isCropping = false;
        cropImage();
      }
    });
    function drawCropRect() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, startY, endX - startX, endY - startY);
    }
    function cropImage() {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = endX - startX;
      croppedCanvas.height = endY - startY;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(img, startX, startY, endX - startX, endY - startY, 0, 0, endX - startX, endY - startY);
      const link = document.createElement('a');
      link.download = 'cropped_image.png';
      link.href = croppedCanvas.toDataURL('image/png');
      link.click();
    }
  };
  img.src = imageUrl;
}
function cropTo(tool, wnew, hnew) {
  let [img, dParent, cropBox, setRect] = [tool.img, tool.dParent, tool.cropBox, tool.setRect];
  let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
  let xnew = x + (wnew - w) / 2;
  let ynew = y + (hnew - h) / 2;
  redrawImage(img, dParent, xnew, ynew, wnew, wnew, wnew, hnew, () => setRect(0, 0, wnew, hnew))
}
function cryptid() {
}
function cryptidTile(d, x, r, sz, gap, clip, bg, territory) {
  let sznet = sz - gap;
  let posnet = sz - gap / 2;
  let [w, h, left, top] = [sznet, sznet, x * posnet * .5, r * posnet * .75];
  let html = `
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" pointer-events="none">
              <polygon
                points="50,0 100,25 100,75 50,100 0,75 0,25"
                stroke="${territory == 'puma' ? 'red' : territory == 'bear' ? 'silver' : bg}"
                stroke-width="2"
                fill="${bg}"
                ${territory == 'puma' || territory == 'bear' ? 'stroke-dasharray="2,2"' : ''}
                stroke-linejoin="round"
              />
            </svg>
      `; //vector-effect="non-scaling-stroke" points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" 
  let d1 = mDom(d, { cursor: 'pointer', position: 'absolute', left, top, w, h, clip, bg }, { html });
  mCenterCenterFlex(d1);
  return d1;
}
async function dbAddNewGameTable(table) {
  if (nundef(table)) table = { friendly: "mygame" + rWord(10), phase: "start", round: 1 };
  else addKeys({ phase: 'start', round: 1 }, table)
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "insert_row",
      table: "gametable",
      data: table
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
async function dbDeleteGameTable(id) {
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "delete_row",
      table: "gametable",
      id
    })
  });
  return await res.json();
}
async function dbFinalizeRound(table) {
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
async function dbGetGameTable(id) {
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cmd: "get_table", id })
  });
  return await res.json();
}
async function dbGetGameTables() {
  let url = DA.dbUrl;
  let res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cmd: "get_game_tables", table: 'gametable' })
  });
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
async function dbUpdateGameTable(id, data) {
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "modify_row",
      table: "gametable",
      id,
      data
    })
  });
  return await res.json();
}
async function dbUpdateGameTableFO(id, data) {
  data.expected = { step: data.step }
  let res = await fetch(DA.dbUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cmd: "modify_row_fo",
      table: "gametable",
      id,
      data
    })
  });
  return await res.json();
}
async function dbUpdateGameTableFS(id, data) {
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
  return await res.json();
}
function deckDeal(deck, n) { return deck.splice(0, n); }
function decodeHtmlEntity(str) {
  return str.replace(/&#(x?[0-9A-Fa-f]+);/g, (_, code) => {
    if (code.startsWith("x") || code.startsWith("X")) {
      return String.fromCodePoint(parseInt(code.slice(1), 16));
    } else {
      return String.fromCodePoint(parseInt(code, 10));
    }
  });
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
function deepMerge(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return mergeArrays(target, source);
  } else if (isObject(target) && isObject(source)) {
    const output = Object.assign({}, target);
    Object.keys(source).forEach(key => {
      if (isObject(source[key]) || Array.isArray(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
    return output;
  }
  return source;
}
function deepMergeConcatLists(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source];
  } else if (isObject(target) && isObject(source)) {
    const output = Object.assign({}, target);
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMergeConcatLists(target[key], source[key]);
        }
      } else if (Array.isArray(source[key])) {
        output[key] = target[key] ? deepMergeConcatLists(target[key], source[key]) : source[key];
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
    return output;
  }
  return source;
}
function deepMergeIndex(target, source) {
  if (typeof target !== 'object' || typeof source !== 'object') {
    throw new Error('Both arguments must be objects');
  }
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (target.hasOwnProperty(key)) {
        if (typeof target[key] === 'object' && typeof source[key] === 'object') {
          target[key] = deepMergeIndex(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}
function deepMergeOverrideLists(target, source) {
  let output = Object.assign({}, source);
  if (isObject(source) && isObject(target)) {
    Object.keys(target).forEach(key => {
      if (isObject(target[key])) {
        if (!(key in source))
          Object.assign(output, { [key]: target[key] });
        else
          output[key] = deepMergeOverrideLists(source[key], target[key]);
      } else {
        Object.assign(output, { [key]: target[key] });
      }
    });
  }
  return output;
}
function deepmerge(target, source, optionsArgument) {
  var array = Array.isArray(source);
  var options = optionsArgument || { arrayMerge: defaultArrayMerge }
  var arrayMerge = options.arrayMerge || defaultArrayMerge
  if (array) {
    return Array.isArray(target) ? arrayMerge(target, source, optionsArgument) : cloneIfNecessary(source, optionsArgument)
  } else {
    return mergeObject(target, source, optionsArgument)
  }
}
function deepmergeOverride(base, drueber) { return mergeOverrideArrays(base, drueber); }
function defaultArrayMerge(target, source, optionsArgument) {
  var destination = target.slice()
  source.forEach(function (e, i) {
    if (typeof destination[i] === 'undefined') {
      destination[i] = cloneIfNecessary(e, optionsArgument)
    } else if (isMergeableObject(e)) {
      destination[i] = deepmerge(target[i], e, optionsArgument)
    } else if (target.indexOf(e) === -1) {
      destination.push(cloneIfNecessary(e, optionsArgument))
    }
  })
  return destination
}
async function deleteEvent(id) {
  let result = await simpleUpload('postEvent', { id });
  delete Items[id];
  mBy(id).remove();
}
async function deleteGame(gameId) {
  return await api('DELETE', `/delete_game/${gameId}`);
}
async function deleteGames() {
  return await api('DELETE', `/delete_games`);
}
async function deleteTheme(ev) {
  let key = evToAttr(ev, 'theme');
  delete M.config.themes[key];
  await postConfig();
  ev.target.remove();
}
function detectSessionType() {
  if (isdef(DA.project)) return DA.sessionType;
  let loc = window.location.href;
  DA.project = stringAfterLast(stringBefore(loc, '/index.html'), '/');//console.log('project', DA.project);
  DA.serverdir = SERVERDIR;
  DA.sessionType =
    loc.includes('moxito.online/at0') ? 'at0' :
      loc.includes('moxito.online') ? 'fastcomet' :
        loc.includes('telecave') ? 'telecave' :
          loc.includes('8080') ? 'php' :
            loc.includes(':3000') ? 'nodejs' :
              loc.includes(':5000') ? 'flask' :
                'live'; // loc.includes('vidulus') ? 'vps' :
  return DA.sessionType;
}
function dict2csv(di) {
  const items = Object.values(di);
  if (items.length === 0) return "";
  const headers = Object.keys(items[0]);
  let csvRows = [headers.join(',')];
  for (const item of items) {
    const row = headers.map(header => {
      let value = item[header];
      if (Array.isArray(value)) {
        value = value.join(' ');
      }
      let stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"')) {
        stringValue = `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvRows.push(row.join(','));
  }
  return csvRows.join('\n');
}
function dict2list(di, keyName = 'id') {
  let vals = Object.values(di);
  if (vals.length == 0) return [];
  let res = [];
  if (!isDict(vals[0])) {
    for (const v of vals) res.push({ value: v });
  } else res = vals;
  let keys = Object.keys(di);
  for (let i = 0; i < res.length; i++) { res[i][keyName] = keys[i]; }
  return res;
}
function dictMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], dictMerge(target[key], source[key]));
    }
  }
  return { ...target, ...source };
}
function dictPlus(target, source) {
  let result = addKeys(source, target);
  return result;
}
function dinogame() {
  function setup(table) {
    stdSetupGame(table, 'wait');
    table.stage = 'wait';
    console.log('setup', table);
  }
  async function process(uname, table, buttonNumber) {
    let newTable = gtCopy(table);
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
function disableButton(b) { mClass(toElem(b), 'disabled') }
function displayOrbitCentered(containerId, n, radius = 300, dotSize = 140, centerSize = 400, padding = 10) {
  const container = document.getElementById(containerId);
  container.style.position = 'relative';
  let points = [];
  for (let i = 0; i < n; i++) {
    const angle = (i * 2 * Math.PI) / n + (Math.PI / 2);
    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    });
  }
  const halfCenter = centerSize / 2;
  const halfDot = dotSize / 2;
  let minX = -halfCenter, maxX = halfCenter;
  let minY = -halfCenter, maxY = halfCenter;
  points.forEach(p => {
    minX = Math.min(minX, p.x - halfDot);
    maxX = Math.max(maxX, p.x + halfDot);
    minY = Math.min(minY, p.y - halfDot);
    maxY = Math.max(maxY, p.y + halfDot);
  });
  const totalW = (maxX - minX) + (padding * 2);
  const totalH = (maxY - minY) + (padding * 2);
  const centerX = padding - minX;
  const centerY = padding - minY;
  const dCenter = document.createElement('div');
  dCenter.style.cssText = `
    position: absolute;
    top: ${centerY}px;
    left: ${centerX}px;
    width: ${centerSize}px;
    height: ${centerSize}px;
    background: red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  `;
  container.appendChild(dCenter);
  points.forEach(p => {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      top: ${centerY}px;
      left: ${centerX}px;
      width: ${dotSize}px;
      height: ${dotSize}px;
      background: blue;
      border-radius: 50%;
      transform: translate(calc(-50% + ${p.x}px), calc(-50% + ${p.y}px));
    `;
    container.appendChild(dot);
  });
  container.style.width = `${totalW}px`;
  container.style.height = `${totalH}px`;
  return { w: totalW, h: totalH, centerX, centerY };
}
function divideNumberRandomly(n, allowed) {
  allowed = Array.from(new Set(allowed))
    .filter(x => Number.isInteger(x) && x > 0)
    .sort((a, b) => a - b);
  if (!Number.isInteger(n) || n <= 0 || allowed.length === 0) return null;
  if (allowed[0] > n) return null;
  const impossible = new Set();
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function tryFill(remaining) {
    if (remaining === 0) return [];
    if (impossible.has(remaining)) return null;
    const choices = shuffle(allowed).filter(x => x <= remaining);
    for (const c of choices) {
      const rest = tryFill(remaining - c);
      if (rest !== null) {
        return [c, ...rest];
      }
    }
    impossible.add(remaining);
    return null;
  }
  return tryFill(n);
}
function divideRectangleIntoGrid(w, h, n) {
  let bestRows = 1;
  let bestCols = n;
  let bestAspectRatio = Infinity;
  for (let rows = 1; rows <= n; rows++) {
    const cols = Math.ceil(n / rows);
    const cellWidth = w / cols;
    const cellHeight = h / rows;
    const aspectRatio = Math.abs(cellWidth / cellHeight - 1);
    if (aspectRatio < bestAspectRatio) {
      bestAspectRatio = aspectRatio;
      bestRows = rows;
      bestCols = cols;
    }
  }
  return { rows: bestRows, cols: bestCols };
}
function doYourThing(inp, grid) {
  let words = extractWords(inp.value, ' ').map(x => x.toLowerCase());
  let checklist = Array.from(grid.querySelectorAll('input[type="checkbox"]')); //chks=items.map(x=>iDiv(x).firstChild);
  let allNames = checklist.map(x => x.name);
  let names = checklist.filter(x => x.checked).map(x => x.name);
  for (const w of words) {
    if (!allNames.includes(w)) {
      let div = mCheckbox(grid, w);
      let chk = div.firstChild;
      chk.checked = true;
      chk.addEventListener('click', ev => checkToInput(ev, inp, grid))
      needToSortChildren = true;
    } else {
      let chk = checklist.find(x => x.name == w);
      if (!chk.checked) chk.checked = true;
    }
  }
  for (const name of names) {
    if (!words.includes(name)) {
      let chk = checklist.find(x => x.name == name);
      chk.checked = false;
    }
  }
  sortCheckboxes(grid);
  words.sort();
  inp.value = words.join(', ') + ', ';
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
function downloadAsText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
function downloadAsYaml(o, filename) {
  let y = YAML.stringify(o);
  downloadAsText(y, filename + '.yaml');
}
async function downloadVideo(url, filename) {
  try {
    const response = await fetch(url, { mode: 'no-cors' });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'video.mp4'; // Set the filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
  }
}
function draw() {
  background(51);
  for (let i = 0; i < tree.length; i++) {
    tree[i].show();
    if (jittering) tree[i].jitter();
  }
  for (let i = 0; i < leaves.length; i++) {
    let l = leaves[i].current;
    noStroke();
    fill(0, 255, 100, 100);
    ellipse(l.x, l.y, 8, 8);
    if (jittering) leaves[i].current.y += random(0, 2);
  }
}
function drawCairoTile(parent, x, y, w, h, flip = false, color = 'black') {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.width = `${w}px`;
  div.style.height = `${h}px`;
  div.style.left = `${x}px`;
  div.style.top = `${y}px`;
  div.style.backgroundColor = color;
  div.style.clipPath = getCairoPentagonClipPath();
  if (flip) div.style.transform = 'scaleX(-1)';
  parent.appendChild(div);
  return div;
}
function drawCircle(d, x, y, sz = 4, bg = 'red') {
  mDom(d, { bg, round: true, w: sz, h: sz, position: 'absolute', left: x - sz / 2, top: y - sz / 2 }); //left:0,top:0}); //
}
function drawHexBoard(topside, side, dParent, styles = {}, itemStyles = {}, opts = {}) {
  addKeys({ box: true }, styles);
  let dOuter = mDom(dParent, styles, opts);
  let d = mDom(dOuter, { position: 'relative', });
  let { centers, rows, maxcols } = hexBoardCenters(topside, side);
  let [w, h] = mSizeSuccession(itemStyles, 24);
  let gap = valf(styles.gap, -.5);
  let items = [];
  if (gap != 0) copyKeys({ w: w - gap, h: h - gap }, itemStyles);
  for (const c of centers) {
    let dhex = hexFromCenter(d, { x: c.x * w, y: c.y * h }, addKeys({ bg: 'rand' }, itemStyles));
    let item = { div: dhex, cx: c.x, cy: c.y, row: c.row, col: c.col };
    items.push(item);
  }
  let [wBoard, hBoard] = [maxcols * w, rows * h * .75 + h * .25];
  mStyle(d, { w: wBoard, h: hBoard });
  return { div: dOuter, topside, side, centers, rows, maxcols, boardShape: 'hex', w, h, wBoard, hBoard, items }
}
function drawInteractiveLine(d, p1, p2, color = 'black', thickness = 10) {
  const offs = thickness / 2;
  let [x1, y1, x2, y2] = [p1.x, p1.y, p2.x, p2.y];
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const line = mDom(d, { left: x1, top: y1 - offs, bg: color, opacity: .1, className: 'line1', w: distance, h: thickness, transform: `rotate(${angle}deg)` })
  line.dataset.x1 = x1;
  line.dataset.y1 = y1;
  line.dataset.x2 = x2;
  line.dataset.y2 = y2;
  line.dataset.thickness = thickness;
  return line;
}
function drawMeeple(dParent, p) {
  let addLabel = true;
  let html = isdef(p.owner) && addLabel ? p.owner[0].toUpperCase() : ''; //p.id.substring(1) : ''
  let d1 = p.div = mDom(dParent, { fz: p.sz * .75, left: p.x + p.sz / 2, top: p.y + p.sz / 2, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg, fg: 'contrast' }, { html, id: p.id });
  mCenterCenterFlex(d1);
  d1.style.cursor = 'default';
}
function drawPentagonAtCenter(parent, center, w, h, color = 'black') {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.width = `${w}px`;
  div.style.height = `${h}px`;
  div.style.left = `${center.x - w / 2}px`;
  div.style.top = `${center.y - h / 2}px`;
  div.style.backgroundColor = color;
  div.style.clipPath = generatePentagonClipPath();
  parent.appendChild(div);
  return div;
}
function drawPix(ctx, x, y, color = 'red', sz = 5) {
  ctx.fillStyle = color;
  ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz)
}
function drawPixFrame(ctx, x, y, color = 'red', sz = 5) {
  ctx.strokeStyle = color;
  ctx.strokeRect(x - sz / 2, y - sz / 2, sz, sz)
}
function drawPoint(dParent, p, addLabel = true) {
  let html = isdef(p.owner) && addLabel ? p.owner[0].toUpperCase() : '';
  addKeys({ sz: 20, bg: rColor(), id: getUID() }, p);
  let d1 = p.div = mDom(dParent, { round: true, left: p.x, top: p.y, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg, align: 'center', fg: 'contrast' }, { html, id: p.id });
  d1.style.cursor = 'default';
  if (isdef(p.border)) mStyle(d1, { outline: `solid ${p.border} 4px` });
  let rect = getRect(d1);
  p.cx = p.x + p.sz / 2; p.cy = p.y + p.sz / 2;
  p.xPage = rect.x; p.yPage = rect.y;
  p.cxPage = rect.x + p.sz / 2; p.cyPage = rect.y + p.sz / 2;
  return p;
}
function drawPointStar(p1, d, sz) {
  let starSizes = [1, .4, 1, 1, 1, .8, 1, .6, 1];
  let itype = p1.type % starSizes.length;
  p1.sz = sz = 30 * starSizes[itype];
  let img = p1.div = cloneImage(M.starImages[itype], d, p1.x, p1.y, sz, sz);
  img.id = p1.id = `p${p1.x}_${p1.y}`;
}
function emoPresent(me, table) {
  let dTable = stdPresentBGATable(me, table, 500, 'velvet');
  showTitleGame(me, table); mDom('dTitleMiddle', {}, { html: `step ${table.step}` })
  stdStatsScore(me, table);
  let fen = table.fen;
  let dParent = mDom(dTable, { w: 500, h: 400, matop: 20 });
  mFit(fen.list, dParent, false);
  mLinebreak(dTable, 20);
  let dChoices = mDom(dTable, { display: 'flex', 'justify-content': 'center', matop: 20 });
  let buttons = [];
  for (let c of fen.choices) {
    let b = mDom(dChoices, { cursor: 'pointer', bg: 'orange', padding: 15, margin: 10, round: 5, fz: 24, w: 60, align: 'center', family: 'blackops' }, { html: c, val: c });
    buttons.push(b);
  }
  return { dTable, buttons };
}
function emoticount() {
  function setup(table) {
    stdSetupGame(table);
    let fen = table.fen;
    fen.items = M.emokeys;
    renewSet(fen, table.options.min, table.options.max);
  }
  function renewSet(fen, min, max) {
    let keys = rChoose(fen.items, 4);
    let target = keys[0];
    let others = keys.slice(1);
    let list = [];
    let count = rNumber(2, 5);
    for (let i = 0; i < count; i++) list.push(target);
    while (list.length < 20) list.push(rChoose(others));
    fen.list = arrShuffle(list);
    fen.target = target;
    fen.correctCount = count;
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
      console.log("All players have moved. Finalizing round...");
      let nextTable = gtCopy(table);
      let allMoves = res.moves;
      for (let name in allMoves) {
        let move = allMoves[name];
        if (nextTable.players[name] && move) {
          nextTable.players[name].score += (move.success ? 1 : -1);
        }
      }
      renewSet(nextTable.fen);
      nextTable.step += 1;
      nextTable.last_round_results = allMoves;
      nextTable.modified = getNow();
      await dbFinalizeRound(nextTable);
    } else {
    }
    await updateMain();
  }
  function present(me, table) { return emoPresent(me, table); }
  async function activate(me, table, ui) {
    let { myTurn, spectating } = stdInstruction(me, table);
    let x = mKey(table.fen.target, 'dInstruction', { maleft: 5 }, { prefer: 'emoji' });
    if (spectating) return;
    for (let b of ui.buttons) {
      mStyle(b, { cursor: 'pointer' });
      b.onclick = () => rsgEval(me, table, b.getAttribute('val'));
    }
  }
  async function rsgEval(me, table, val) {
    DA.isProcessingMove = true;
    stdEvalShield();
    let res = await process(me, table, val);
    if (res) await updateMain(true, res);
    DA.isProcessingMove = false;
  }
  return { setup, present, activate, process };
}
function empty(arr) {
  let result = arr === undefined || !arr || (isString(arr) && (arr == 'undefined' || arr == '')) || (Array.isArray(arr) && arr.length == 0) || emptyDict(arr);
  testHelpers(typeof arr, result ? 'EMPTY' : arr);
  return result;
}
function emptyDict(obj) {
  let test = Object.entries(obj).length === 0 && obj.constructor === Object;
  return test;
}
function emptyTarget(val) {
  return Array.isArray(val) ? [] : {}
}
function enableButton(b) { mClassRemove(toElem(b), 'disabled') }
function enableTooltip(el, text) {
  let tooltip = document.getElementById("global-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "global-tooltip";
    Object.assign(tooltip.style, {
      position: "fixed",
      background: "rgba(0,0,0,0.8)",
      color: "white",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "13px",
      pointerEvents: "none",
      zIndex: 10000,
      whiteSpace: "nowrap",
      transition: "opacity 0.2s ease",
      opacity: "0",
      visibility: "hidden"
    });
    document.body.appendChild(tooltip);
  }
  let hideTimeout;
  el.addEventListener("mouseenter", e => {
    clearTimeout(hideTimeout);
    tooltip.textContent = text;
    const rect = el.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.style.transform = "translate(-50%, -100%)";
    tooltip.style.visibility = "visible";
    tooltip.style.opacity = "1";
    hideTimeout = setTimeout(() => {
      tooltip.style.opacity = "0";
      tooltip.style.visibility = "hidden";
    }, 3000);
  });
  el.addEventListener("mouseleave", () => {
    clearTimeout(hideTimeout);
    tooltip.style.opacity = "0";
    tooltip.style.visibility = "hidden";
  });
}
function endsWith(s, sSub) { let i = s.indexOf(sSub); return i >= 0 && i == s.length - sSub.length; }
function enterInterruptState() {
  clearTimeouts();
  if (isdef(G.instance)) G.instance.clear();
  auxOpen = true;
}
function entityToUnicode(entity) {
  const div = document.createElement("div");
  div.innerHTML = entity;
  return div.textContent;
}
function error(msg) {
  let fname = getFunctionsNameThatCalledThisFunction();
  console.log(fname, 'ERROR!!!!! ', msg);
}
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function evNoBubble(ev) { ev.preventDefault(); ev.stopPropagation(); }
function evToAttr(ev, attr) { let elem = findAncestorWithAttribute(ev.target, attr); return elem.getAttribute(attr); }
function evToAttrElem(ev, attr) { let elem = findAncestorWithAttribute(ev.target, attr); return { val: elem.getAttribute(attr), elem }; }
function evToClass(ev, className) { let elem = findAncestorWith(ev.target, { className }); return elem; }
function evToId(ev) { let elem = findAncestorWithAttribute(ev.target, 'id'); return elem.id; }
function evalCond(o, condKey, condVal) {
  let func = FUNCTIONS[condKey];
  if (isString(func)) func = window[func];
  if (nundef(func)) {
    if (nundef(o[condKey])) return null;
    if (isList(condVal)) {
      for (const v of condVal) if (o[condKey] == v) return true;
      return null;
    } else {
      return isdef(o[condKey]) ? o[condKey] == condVal : null;
    }
  }
  return func(o, condVal);
}
function evalConds(o, conds) {
  for (const [f, v] of Object.entries(conds)) {
    if (!evalCond(o, f, v)) return false;
  }
  return true;
}
function exitToAddon(callback) {
  AD.callback = callback;
  enterInterruptState(); auxOpen = false;
  AD.run();
}
function exp_church(options) { return options.church == 'yes'; }
function exp_commissions(options) { return options.commission == 'yes'; }
function exp_journeys(options) { return options.journey == 'yes'; }
function exp_peasants(options) { return options.peasants == 'yes'; }
function exp_rumors(options) { return options.rumors == 'yes'; }
function extendRect(r4) { r4.l = r4.x; r4.t = r4.y; r4.r = r4.x + r4.w; r4.b = r4.t + r4.h; }
function extractColors(s, colors) {
  let words = toWords(s);
  words = words.map(x => strRemoveTrailing(x, 'ish')).map(x => x.toLowerCase());
  if (nundef(colors)) colors = Object.keys(M.colorByName);
  let res = [];
  for (const w of words) {
    for (const c of colors) {
      if (w == c) res.push(c);
    }
  }
  return res;
}
function extractFoodAndType(s) {
  let carni = ['mouse', 'bird', 'fish', 'beetle', 'spider', 'animal', 'frog', 'lizard', 'worm', 'deer', 'zebra', 'shrimp', 'squid', 'snail'];
  let insecti = ['worm', 'ant', 'insect', 'moth', 'flies', 'grasshopper',]
  let herbi = ['grass', 'grasses', 'leaves', 'fruit', 'flowers', 'grain', 'berries', 'plant', 'bamboo', 'tree', 'wood', 'reed', 'twig', 'crops', 'herbs'];
  s = s.toLowerCase();
  let words = toWords(s, true).map(x => strRemoveTrailing(x, 's'));
  let di = { herbi, carni, insecti };
  let types = [];
  let contained = [];
  for (const type in di) {
    let arr = di[type];
    for (const a of arr) {
      let w = strRemoveTrailing(a, 's');
      if (words.includes(w)) {
        addIf(contained, a);
        addIf(types, type);
        continue;
      }
    }
  }
  let type;
  for (const t of ['omni', 'herbi', 'carni', 'insecti']) {
    if (s.includes(t)) type = t + 'vorous';
  }
  if (nundef(type)) {
    if (isEmpty(types)) { type = 'unknown' }
    if (types.includes('herbi') && types.length >= 2) type = 'omnivorous';
    else if (types.length >= 2) type = 'carnivorous';
    else type = types[0] + 'vorous';
  }
  return [contained, type];
}
function extractHabitat(str, ignore = []) {
  let s = str.toLowerCase();
  let habit = [];
  let di = M.habitat;
  for (const k in di) {
    if (k == 'geo') continue;
    for (const hab of di[k]) {
      if (ignore.includes(hab)) continue;
      if (s.includes(hab)) { addIf(habit, k); break; }
    }
  }
  return habit;
}
function extractLines(text, list, reverse = false) {
  let arr = text.split('\n').filter(line => list.some(prefix => line.startsWith(prefix))); // Keep lines starting with any prefix
  if (reverse) arr.reverse();
  return arr.join('\n');
}
function extractSpecies(s) {
  s = s.toLowerCase();
  let words = toWords(s);
  if (words.length <= 2) { s = s.replace('suborder', ''); s = s.replace('genus', ''); return s.trim(); }
  s = s.replace(' x ', ', ');
  if (s.includes('hybrid')) return s;
  if (s.includes('including')) return arrTake(toWords(stringAfter(s, 'including')), 2).join(' ');
  if (s.includes('suborder')) return wordAfter(s, 'suborder');
  let firstTwo = arrTake(words, 2).join(' '); //console.log(slower);
  return firstTwo;
}
function extractWords(s, allowed) {
  let specialChars = getSeparators(allowed);
  let parts = splitAtAnyOf(s, specialChars.join('')).map(x => x.trim());
  return parts.filter(x => !isEmpty(x));
}
function fInterruptable(func) { return wrapFunc(func, [...arguments].slice(1)); }
function fShowThemeSample(dmm, theme, styles) {
  dmm = toElem(dmm);
  mClear(dmm);
  showThemeSample(dmm, theme);
  mStyle(dmm, styles)
}
function faButton(dParent, key, styles = {}, opts = {}) {
  key = key.replace('_', '-'); //console.log(key);
  let cl = `fa-solid fa-` + key;
  if (opts.ani) cl += ' fa-' + opts.ani; //' '+opts.ani.map(x=>'fa-'+x).join(' ');
  let st = dictPlus(styles, { color: 'red', cursor: 'pointer', fz: 22 });
  return mDom(dParent, st, { tag: 'i', className: cl }); //`fa-solid fa-${key} fa-beat` });
}
async function faceDown(card, animate = true, durationMs = 300) {
  /**
   * faceDown
   * Flips a card to its back face. No-ops if already face-down.
   * Returns a Promise that resolves when the flip is complete (or immediately
   * if animate=false or the card is already face-down).
   *
   * @param {Object}  card
   * @param {boolean} [animate=true]
   * @param {number}  [durationMs=300]
   * @returns {Promise<void>}
   *
   * @example
   *   await faceDown(card);
   *   await faceDown(card, true, 500);   
   *   await faceDown(card, false);       
   */
  if (!card.faceUp) return;
  card.faceUp = false;
  const backHtml = _cardBackSVG(card);
  if (animate) await _flipAnimate(card, backHtml, durationMs);
  else card.div.innerHTML = backHtml;
}
async function faceUp(card, animate = true, durationMs = 300) {
  /**
   * faceUp
   * Flips a card to its front face. No-ops if already face-up.
   * Returns a Promise that resolves when the flip is complete.
   *
   * @param {Object}  card
   * @param {boolean} [animate=true]
   * @param {number}  [durationMs=300]
   * @returns {Promise<void>}
   *
   * @example
   *   await faceUp(card);
   */
  if (card.faceUp) return;
  card.faceUp = true;
  if (animate) await _flipAnimate(card, card.svgUp, durationMs);
  else card.div.innerHTML = card.svgUp;
}
function face_down(item, color, texture) {
  if (!item.faceUp) return;
  if (isdef(texture) || lookup(item, ['live', 'dCover'])) {
    face_down_alt(item, color, texture);
  } else {
    let svgCode = M.c52.card_2B;
    item.div.innerHTML = svgCode;
    if (nundef(color)) color = item.color;
    if (isdef(item.color)) item.div.children[0].children[1].setAttribute('fill', item.color);
  }
  item.faceUp = false;
}
function face_down_alt(item, bg, texture_name) {
  let dCover = item.live.dCover;
  if (nundef(dCover)) {
    let d = iDiv(item);
    dCover = item.live.dCover = mDiv(d, { background: bg, rounding: mGetStyle(d, 'rounding'), position: 'absolute', width: '100%', height: '100%', left: 0, top: 0 });
    let t = getTexture(texture_name);
    mStyle(dCover, { bgImage: t, bgSize: '80%', bgRepeat: 'repeat' });
  } else mStyle(dCover, { display: 'block' });
}
function face_up(item) {
  if (item.faceUp) return;
  if (lookup(item, ['live', 'dCover'])) mStyle(item.live.dCover, { display: 'none' });
  else item.div.innerHTML = isdef(item.c52key) ? C52[item.c52key] : item.html;
  item.faceUp = true;
}
function ferro_get_card(ckey, h, w, ov = .25) {
  let type = ckey[2];
  let info = ckey[0] == '*' ? get_joker_info() : jsCopy(C52Cards[ckey.substring(0, 2)]);
  info.key = ckey;
  info.cardtype = ckey[2];
  let [r, s] = [info.rank, info.suit];
  info.val = r == '*' ? 50 : r == 'A' ? 20 : 'TJQK'.includes(r) ? 10 : Number(r);
  info.color = RED;
  info.sz = info.h = valf(h, M.config.ui.card.h);
  info.w = valf(w, info.sz * .7);
  info.irank = '23456789TJQKA*'.indexOf(r);
  info.isuit = 'SHCDJ'.indexOf(s);
  info.isort = info.isuit * 14 + info.irank;
  let card = cardFromInfo(info, h, w, ov);
  return card;
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
function fillFormFromObject(inputs, wIdeal, df, db, styles, opts) {
  let popup = mDom(df, { margin: 10 });
  mDom(popup, {}, { html: 'paste your information into the text area' })
  let ta = mDom(popup, {}, { tag: 'textarea', rows: 20, cols: 80 });
  let b = mButton('Parse To Form', () => { onclickPasteDetailObject(ta.value, inputs, wIdeal, df, styles, opts); }, db, { maright: 10 }, 'button', 'bParseIntoForm');
  mInsert(db, b);
}
function fillMultiForm(dict, inputs, wIdeal, df, styles, opts) {
  mClear(df);
  for (const k in dict) {
    let [content, val] = [k, dict[k]];
    mDom(df, {}, { html: `${content}:` });
    let inp = mDom(df, styles, opts);
    inp.rows = calcRows(styles.fz, styles.family, val, wIdeal);
    inp.value = val;
    inputs.push({ name: content, inp: inp });
    mNewline(df)
  }
}
function filterIsolatedPairs(pairs, blockers, threshold = 10) {
  let newPairs = [];
  for (const pair of pairs) {
    const [ax, ay] = [pair[0].x, pair[0].y];
    const [bx, by] = [pair[1].x, pair[1].y];
    let isIsolated = true;
    for (const blocker of blockers) {
      const [px, py] = [blocker.x, blocker.y];
      const distance = pointToLineDistance(px, py, ax, ay, bx, by);
      if (distance < threshold) {
        isIsolated = false;
        break;
      }
    }
    if (isIsolated) {
      newPairs.push(pair);
    }
  }
  return newPairs;
}
function findAncestorWith(elem, { attribute = null, className = null, id = null }) {
  elem = toElem(elem);
  while (elem) {
    if ((attribute && elem.hasAttribute && elem.hasAttribute(attribute))
      || (className && elem.classList && elem.classList.contains(className))
      || (id && isdef(elem.id))) { return elem; }
    elem = elem.parentNode;
  }
  return null;
}
function findAncestorWithAttribute(el, attrName) {
  while (el) {
    if (el.hasAttribute && el.hasAttribute(attrName)) return el;
    el = el.parentElement;
  }
  return null;
}
function findClosestMeeple(p) {
  let fen = T.fen;
  let dist = 9999999;
  let closestMeeple = null;
  for (const meeple of fen.meeples) {
    let d = getDistanceBetweenCenters(mBy(p.id), mBy(meeple.id));
    if (d < dist) {
      dist = d;
      closestMeeple = meeple;
    }
  }
  return closestMeeple;
}
function findIsolatedPairs(nodes, prop = 'bg', threshold = 3) {
  const isolatedPairs = [], obstaclePairs = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (nodes[i][prop] != nodes[j][prop]) continue;
      const [ax, ay] = [nodes[i].x, nodes[i].y];
      const [bx, by] = [nodes[j].x, nodes[j].y];
      let isIsolated = true;
      for (let k = 0; k < nodes.length; k++) {
        if (k === i || k === j) continue;
        const [px, py] = [nodes[k].x, nodes[k].y];
        const distance = pointToLineDistance(px, py, ax, ay, bx, by);
        if (distance < threshold) {
          isIsolated = false;
          break;
        }
      }
      let pair = nodes[i].x <= nodes[j].x ? [nodes[i], nodes[j]] : [nodes[j], nodes[i]]; //console.log(pair[0].x,pair[1].x);
      assertion(pair[0].x <= pair[1].x, "NOT SORTED!!!!!!!!!!!!!!!!");
      if (isIsolated) {
        isolatedPairs.push(pair);
      } else {
        obstaclePairs.push(pair);
      }
    }
  }
  return { isolatedPairs, obstaclePairs };
}
function findMidlines(res, diff) {
  let mid1, mid2;
  for (const l1 of res) {
    for (const l2 of res) {
      if (isWithinDelta(Math.abs(l1.val - l2.val), diff, 2)) {
        mid1 = l1; mid2 = l2;
      }
    }
    if (isdef(mid1)) break;
  }
  let kleinere = mid1.val < mid2.val ? mid1 : mid2;
  let groessere = mid1 == kleinere ? mid2 : mid1;
  return [kleinere, groessere];
}
function findMostFrequentVal(arr, prop, delta = 0) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return null;
  }
  let frequencyMap = new Map();
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i][prop];
    frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1);
  }
  let mostFrequentY;
  let maxFrequency = 0;
  for (let [val, frequency] of frequencyMap) {
    if (frequency > maxFrequency) {
      mostFrequentY = val;
      maxFrequency = frequency;
    }
  }
  return mostFrequentY;
}
function findNextBar(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
  for (let x = x1; x < x2; x++) {
    for (let y = y1; y < y2; y++) {
      let c = isPix(ctx, x, y, cgoal, delta);
      if (c) {
        drawPixFrame(ctx, x - 1, y - 1, 'red', 3)
        let len = 1, yy = y + 1; xx = x;
        while (yy < y2) {
          let p = getPixRgb(ctx, xx, yy);
          let c1 = isPix(ctx, xx, yy, cgoal, delta + 10);
          yy++;
          if (c1) len++;
        }
        return { c, x, y, len };
      }
    }
  }
}
function findNextLine(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      let c = isPix(ctx, x, y, cgoal, delta);
      if (c) {
        drawPixFrame(ctx, x - 1, y - 1, 'red', 3)
        let len = 1, xx = x + 1; yy = y;
        while (xx < x2) {
          let p = getPixRgb(ctx, xx, yy);
          let c1 = isPix(ctx, xx, yy, cgoal, delta + 10);
          xx++;
          if (c1) len++;
        }
        return { c, x, y, len };
      }
    }
  }
}
function findPlayerWithMeeplesLeft(name) {
  let pnamesWithMeeplesLeft = [];
  for (const pname in T.players) {
    let meeplesOfThatPlayer = T.fen.meeples.filter(x => x.owner == pname);
    if (meeplesOfThatPlayer.length < T.options.numMeeples) pnamesWithMeeplesLeft.push(pname);
  }
  if (pnamesWithMeeplesLeft.length == 0) return null;
  let nextPlayer = null;
  while (!nextPlayer) {
    nextPlayer = arrNext(T.plorder, name);
    if (!pnamesWithMeeplesLeft.includes(nextPlayer)) { name = nextPlayer; nextPlayer = null; }
  }
  return nextPlayer;
}
function findPointAtDistance(pt, dx, dy, list, delta = 0) {
  for (const p1 of list) {
    if (isWithinDelta(Math.abs(pt.x - p1.x), dx, delta) && isWithinDelta(Math.abs(pt.y - p1.y), dy, delta)) return p1;
  }
  return null;
}
function findPoints(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
  let p;
  let resy = [], resx = [];
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      p = isPixDark(ctx, x, y);
      if (p) {
        let l = isLightBeforeV(ctx, x, y);
        let d = isLightAfterV(ctx, x, y);
        if (l || d) resy.push({ x, y })
        l = isLightBefore(ctx, x, y);
        d = isLightAfter(ctx, x, y);
        if (l || d) resx.push({ x, y })
      }
    }
  }
  return [resx, resy];
}
function findPointsBoth(ctx, x1, x2, y1, y2, cgoal, delta = 10) {
  let p;
  let resy = [], resx = [];
  for (let y = y1; y < y2; y++) {
    for (let x = x1; x < x2; x++) {
      p = isPix(ctx, x, y, cgoal, delta);
      if (p) {
        let l = isLightBeforeV(ctx, x, y);
        let d = isLightAfterV(ctx, x, y);
        if (l && d) resy.push({ x, y })
        l = isLightBefore(ctx, x, y);
        d = isLightAfter(ctx, x, y);
        if (l && d) resx.push({ x, y })
      }
    }
  }
  return [resx, resy];
}
function find_index_of_jolly(j) { return j.findIndex(x => is_jolly(x)); }
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
function first(arr) {
  return arr.length > 0 ? arr[0] : null;
}
function firstCond(aos, func) {
  if (nundef(aos)) return null;
  else if (isDict(aos)) for (const k in aos) { if (func(k) || func(aos[k])) return k; }
  else for (const a of aos) { if (func(a)) return a; }
  return null;
}
function firstCondDictKeys(dict, func) {
  for (const k in dict) { if (func(k)) return k; }
  return null;
}
function firstNumber(s) {
  if (s) {
    let m = s.match(/-?\d+/);
    if (m) {
      let sh = m.shift();
      if (sh) { return Number(sh); }
    }
  }
  return null;
}
function fisherYates(arr) {
  if (arr.length == 2 && coin()) { return arr; }
  var rnd, temp;
  let last = arr[0];
  for (var i = arr.length - 1; i; i--) {
    rnd = Math.random() * i | 0;
    temp = arr[i];
    arr[i] = arr[rnd];
    arr[rnd] = temp;
  }
  return arr;
}
function fitCellsInRect(n, w, h) {
  if (n <= 0) return { cellW: 0, cellH: 0, cols: 0, rows: 0 };
  let best = null;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const cellW = w / cols;
    const cellH = h / rows;
    const cellSize = Math.min(cellW, cellH);
    if (!best || cellSize > best.cellSize) {
      best = { cols, rows, cellW, cellH, cellSize };
    }
  }
  return best;
}
function fitEvenlyInGrid(list, dParent, styles, opts) {
  let n = list.length;
  let r = getRect(dParent);
  let { cols, rows, score, w, h } = calculateCells(n, r.w, r.w, itemRatio = 1)
  let wTotal = cols * (w + styles.gap) + styles.padding * 2;
  let hTotal = rows * (h + styles.gap) + styles.padding * 2;
  w *= r.w / wTotal;
  h *= r.h / hTotal;
  let fz = Math.min(w, h) * .6;
  let d = mGrid(rows, cols, dParent, styles, opts);
  let items = [];
  for (let x of list) {
    let bg = rColor(); let fg = colorIdealText(bg);
    let label = fromNormalized(x);
    console.log(w, h, h - 25, w * .75)
    let itemStyles = { w, h, fz, fg: 'grey', align: 'center', bg, fg };
    let d1 = mKey1(x, d, itemStyles, { prefer: 'emo', label });
    items.push({ div: d1, key: x, o: M.superdi[x] })
  }
  return items;
}
function flashCardBorder(card, color, durationMs = 800, thickness) {
  /**
   * flashCardBorder
   * ─────────────────────────────────────────────────────────────────────────────
   * Temporarily changes a card's border, then auto-reverts after `durationMs`.
   * Returns a handle so you can cancel (and immediately revert) before the timer
   * fires — useful if a card is played or removed before the flash completes.
   *
   * @param  {Object}  card
   * @param  {string}  color
   * @param  {number}  [durationMs=800]
   * @param  {number}  [thickness]       optional stroke-width override
   * @returns {{ cancel: Function }}     call .cancel() to revert early
   *
   * @example
   *   
   *   const flash = flashCardBorder(card, 'gold', 1000, 3);
   *
   *   
   *   flash.cancel();
   */
  const revert = setCardBorder(card, color, thickness);
  const tid = setTimeout(revert, durationMs);
  return {
    cancel() { clearTimeout(tid); revert(); }
  };
}
function flattenDictValues(dict) {
  return Object.values(dict).flat();
}
function fleetingMessage(msg, d, styles, ms, fade) {
  if (isString(msg)) {
    dFleetingMessage.innerHTML = msg;
    mStyle(dFleetingMessage, styles);
  } else {
    mAppend(dFleetingMessage, msg);
  }
  if (fade) Animation1 = mAnimate(dFleetingMessage, 'opacity', [1, .4, 0], null, ms, 'ease-in', 0, 'both');
  return dFleetingMessage;
}
function flexCenterCenter() { return { display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' } }
function flexCenterTop() { return { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' } }
function flexColumnCenter() { return { display: 'flex', dir: 'column', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' } }
function flexLeftCenter() { return { display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexWrap: 'wrap' } }
function flexLeftTop() { return { display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start', flexWrap: 'wrap' } }
function flexSpaceBetween() { return { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } }
async function flipCard(card, animate = true, durationMs = 300) {
  /**
   * flipCard
   * Toggles between face-up and face-down.
   * Returns a Promise that resolves when the flip is complete.
   *
   * @param {Object}  card
   * @param {boolean} [animate=true]
   * @param {number}  [durationMs=300]
   * @returns {Promise<void>}
   *
   * @example
   *   await flipCard(card);                       
   *   await flipCard(card, true, 600);            
   *   await flipCard(card, false);                
   *
   *   
   *   for (const card of hand) {
   *     await faceDown(card, false);
   *   }
   *   for (const card of hand) {
   *     await faceUp(card);
   *     await new Promise(r => setTimeout(r, 200));
   *   }
   */
  if (card.faceUp) await faceDown(card, animate, durationMs);
  else await faceUp(card, animate, durationMs);
}
function foldCartesianProduct(keys, valuesLists) {
  const result = [];
  function helper(index, current) {
    if (index === keys.length) {
      result.push(Object.fromEntries(keys.map((k, i) => [k, current[i]])));
      return;
    }
    for (const value of valuesLists[index]) {
      helper(index + 1, [...current, value]);
    }
  }
  helper(0, []);
  return result;
}
function formatDate(d) {
  const date = isdef(d) ? d : new Date();
  const month = ('0' + date.getMonth()).slice(0, 2);
  const day = date.getDate();
  const year = date.getFullYear();
  const dateString = `${month}/${day}/${year}`;
  return dateString;
}
function formatDateCompact(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const yy = pad(date.getFullYear() % 100);
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yy}${mm}${dd}_${hh}${mi}${ss}`;
}
function formatLegend(key) {
  return key.includes('per') ? stringBefore(key, '_') + '/' + stringAfterLast(key, '_')
    : key.includes('_') ? replaceAll(key, '_', ' ') : key;
}
function formatMilliseconds(ms, format) {
  let remaining = ms;
  const days = Math.floor(remaining / 86400000);
  remaining %= 86400000;
  const hours = Math.floor(remaining / 3600000);
  remaining %= 3600000;
  const minutes = Math.floor(remaining / 60000);
  remaining %= 60000;
  const seconds = Math.floor(remaining / 1000);
  remaining %= 1000;
  const milliseconds = remaining;
  const pad = (n, len) => String(n).padStart(len, "0");
  return format
    .replace(/dd/g, pad(days, 2))
    .replace(/d/g, days)
    .replace(/hh/g, pad(hours, 2))
    .replace(/h/g, hours)
    .replace(/mm/g, pad(minutes, 2))
    .replace(/m/g, minutes)
    .replace(/ss/g, pad(seconds, 2))
    .replace(/s/g, seconds)
    .replace(/SSS/g, pad(milliseconds, 3))
    .replace(/SS/g, pad(milliseconds, 2))
    .replace(/S/g, milliseconds);
}
function from01ToPercent(x) { return Math.round(Number(x) * 100); }
function fromNormalized(s, opts = {}) {
  let sep = valf(opts.sep, '_');
  let caps = isdef(opts.caps) ? opts.caps : true;
  let x = replaceAll(s, sep, ' ');
  let words = caps ? toWords(x).map(x => capitalize(x)).join(' ') : toWords(x).join(' ');
  return words;
}
function fromPercent(n, total) { return Math.round(n * total / 100); }
function gBg(g, color) { g.setAttribute('fill', color); }
function gCreate(tag) { return document.createElementNS('http:/' + '/www.w3.org/2000/svg', tag); }
function gEllipse(w, h) { let r = gCreate('ellipse'); r.setAttribute('rx', w / 2); r.setAttribute('ry', h / 2); return r; }
function gG() { return gCreate('g'); }
function gLine(x1, y1, x2, y2) { let r = gCreate('line'); r.setAttribute('x1', x1); r.setAttribute('y1', y1); r.setAttribute('x2', x2); r.setAttribute('y2', y2); return r; }
function gPoly(pts) { let r = gCreate('polygon'); if (pts) r.setAttribute('points', pts); return r; }
function gRect(w, h) { let r = gCreate('rect'); r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('x', -w / 2); r.setAttribute('y', -h / 2); return r; }
function gRounding(r, rounding) {
  r.setAttribute('rx', rounding);
  r.setAttribute('ry', rounding);
}
function gShape(shape, w = 20, h = 20, color = 'green', rounding) {
  let el = gG();
  if (nundef(shape)) shape = 'rect';
  console.log(shape)
  if (shape != 'line') agColoredShape(el, shape, w, h, color);
  else gStroke(el, color, w);
  if (isdef(rounding) && shape == 'rect') {
    let r = el.children[0];
    gRounding(r, rounding);
  }
  return el;
}
function gStroke(g, color, thickness) { g.setAttribute('stroke', color); if (thickness) g.setAttribute('stroke-width', thickness); }
function gSvg() { return gCreate('svg'); }
function generateColors(n, brightness, startHue = 0, saturation = 100) {
  const colors = [];
  let inc = Math.floor(360 / n);
  for (let i = 0; i < n; i++) {
    const hue = (startHue + (i * inc)) % 360;
    colors.push(`hsl(${hue}, ${saturation}%, ${brightness}%)`);
  }
  return colors;
}
function generateHotspots(dParent, pointPairs, sz = 20, color = 'red') {
  let hotspots = [];
  let linesByPair = {};
  for (const pair of pointPairs) {
    unlockLengthyProcess();
    let ids = pair.map(x => x.id);
    let key = ids.join(',');
    let [pStart, pEnd] = [B.diPoints[ids[0]], B.diPoints[ids[1]]];
    let line = getEquidistantPoints(pStart, pEnd, sz / 2);
    for (const p of line) {
      p.bg = color;
      p.sz = sz;
      p.start = ids[0];
      p.end = ids[1];
      p.startX = pStart.x;
      p.endX = pEnd.x;
      p.startY = pStart.y;
      p.endY = pEnd.y;
      p.id = getUID();
      p.pairs = [key];
      hotspots.push(p);
    }
    linesByPair[key] = line;
  }
  let dihotspots = lacunaDrawPoints(dParent, hotspots);
  if (color == 'transparent') hotspots.map(x => mStyle(x.div, { opacity: 0 }))
  let [c1, c2, c3, c4, c5, c6] = [0, 0, 0, 0, 0, 0];
  for (const p1 of hotspots) {
    assertion(p1.startX <= p1.endX, "NOT SORTED!!!!!")
    for (const p2 of hotspots) {
      unlockLengthyProcess();
      if (p1 == p2) { c3++; continue; }
      if (p1.startX > p2.endX) { c1++; continue; }
      if (p2.startX > p1.endX) { c2++; continue; }
      if (p1.start == p2.start && p1.end == p2.end) { c4++; continue; }
      if (p1.start == p2.end && p1.end == p2.start) { c5++; continue; }
      let miny1 = Math.min(p1.startY, p1.endY);
      let maxy1 = Math.max(p1.startY, p1.endY);
      let miny2 = Math.min(p2.startY, p2.endY);
      let maxy2 = Math.max(p2.startY, p2.endY);
      if (miny1 > maxy2 || miny2 > maxy1) { c5++; continue; }
      c6++;
      let dist = getDistanceBetweenPoints(p1, p2);
      if (dist < sz / 3) {
        let newlist = new Set(p1.pairs.concat(p2.pairs));
        p1.pairs = Array.from(newlist);
        p2.pairs = Array.from(newlist);
        if (color != 'transparent') {
          p1.bg = 'blue'; mStyle(p1.div, { bg: 'blue' });
          p2.bg = 'blue'; mStyle(p2.div, { bg: 'blue' });
        }
      }
    }
  }
  return [hotspots, linesByPair];
}
function generatePentagonClipPath() {
  const points = [];
  const cx = 50, cy = 50;
  const r = 50;
  const angleOffset = -90;
  for (let i = 0; i < 5; i++) {
    const angleDeg = angleOffset + i * 72;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = cx + r * Math.cos(angleRad);
    const y = cy + r * Math.sin(angleRad);
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(', ')})`;
}
function generatePizzaSvg(sz) {
  let colors = Array.from(arguments).slice(1);
  let numSlices = colors.length;
  const radius = sz / 2;
  const centerX = radius;
  const centerY = radius;
  const angleStep = (2 * Math.PI) / numSlices;
  const svgParts = [];
  svgParts.push(`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" xmlns="http://www.w3.org/2000/svg">`);
  for (let i = 0; i < numSlices; i++) {
    const startAngle = i * angleStep;
    const endAngle = (i + 1) * angleStep;
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    const largeArcFlag = angleStep > Math.PI ? 1 : 0;
    const pathData = [
      `M ${centerX},${centerY}`, // Move to the center
      `L ${x1},${y1}`,           // Line to the start of the arc
      `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`, // Arc to the end of the slice
      `Z`                        // Close the path
    ].join(' ');
    svgParts.push(`<path d="${pathData}" fill="${colors[i]}" />`);
  }
  svgParts.push('</svg>');
  return svgParts.join('\n');
}
function generateRandomPointsRect(n, w, h, rand = 0) {
  const points = [];
  let { rows, cols } = divideRectangleIntoGrid(w, h * .8, n);
  const xSpacing = w / (cols + 1);
  const ySpacing = h / (rows + 1);
  let dmin = 10;
  let x, y, xfix, yfix, xlast = -dmin, ylast = -dmin;
  for (let i = 0; i < rows; i++) {
    yfix = (i + .75) * ySpacing;
    for (let j = 0; j < cols; j++) {
      xfix = (j + .75) * xSpacing;
      if (points.length < n) {
        let dx = rand * (Math.random() - 0.5) * xSpacing; if (coin()) dx = -dx;
        let dy = rand * (Math.random() - 0.5) * ySpacing; if (coin()) dy = -dy;
        x = xfix + dx; if (x > xlast && x - xlast < dmin) x += dmin;
        y = yfix + dy; if (y > ylast && y - ylast < dmin) y += dmin;
        xlast = x;
        points.push({ x: Math.round(x), y: Math.round(y) });
      }
      ylast = y
    }
  }
  return points;
}
function generateRandomPointsRound(n, w, h, rand = 0.8) {
  let [radx, rady] = [w / 2, h / 2];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const points = [];
  for (let i = 1; i < n + 1; i++) {
    const angle = i * goldenAngle + (Math.random() - 0.5) * goldenAngle * rand / 4;
    const distance = Math.sqrt(i / n);
    let x = radx + distance * radx * Math.cos(angle);
    let y = rady + distance * rady * Math.sin(angle);
    points.push({ x: Math.round(x), y: Math.round(y) });
  }
  return points;
}
function generateRepeatedColors(n, repeat, colorList) {
  const colors = [];
  let max = Math.ceil(n / repeat);
  for (let i = 0; i < max; i++) {
    const color = colorList[i % colorList.length];
    for (let j = 0; j < repeat; j++) {
      colors.push(color);
    }
  }
  return colors;
}
function generateSvgWithImage(imageSrc, width = 100, height = 100) {
  if (!imageSrc || typeof imageSrc !== 'string') {
    console.error("Invalid image source provided to generateSvgWithImage.");
    return ''; // Return empty string or handle error as appropriate
  }
  const svgCode = `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <image xlink:href="${imageSrc}" x="0" y="0" width="${width}" height="${height}"/>
      </svg>
  `;
  return svgCode;
}
function generateTableName(n, existing) {
  while (true) {
    let cap = rChoose(M.asciiCapitals);
    let parts = cap.split(' ');
    if (parts.length == 2) cap = stringBefore(cap, ' '); else cap = stringBefore(cap, '-');
    cap = cap.trim();
    let arr = ['battle of ', 'rally of ', 'showdown in ', 'summit of ', 'joust of ', 'tournament of ', 'rendezvous in ', 'soiree in ', 'festival of '];//,'encounter in ']; //['battle of ', 'war of ']
    if (n == 2) arr.push('duel of ');
    let s = rChoose(arr) + cap;
    s = normalizeString(s, { lowercase: false });
    if (!existing.includes(s)) return s;
  }
}
function getAbstractSymbol(n) {
  if (nundef(n)) n = rChoose(range(1, 100));
  else if (isList(n)) n = rChoose(n);
  return `abstract_${String(n).padStart(3, '0')}`;
}
function getActivatedLines(lines) {
  if (nundef(lines)) return [];
  let res = [];
  for (const l of lines) {
    let d = iDiv(l);
    let bg = mGetStyle(d, 'bg');
    let opa = mGetStyle(d, 'opacity'); //console.log(bg, opa);
    if (bg == 'red' || opa == 1) res.push(l);
  }
  return res;
}
function getAllColorsAsNameHexObjects() {
  let result = [];
  let di = M.dicolor;
  let bucketlist = 'yellow orangeyellow orange orangered red magentapink magenta bluemagenta blue cyanblue cyan greencyan green yellowgreen'.split(' ');
  bucketlist = arrCycle(bucketlist, 8);
  for (const bucket of bucketlist) {
    let list = dict2list(di[bucket]);
    let clist = [];
    for (const c of list) {
      let o = w3color(c.value);
      o.name = c.id;
      o.hex = c.value;
      clist.push(o);
    }
    let sorted = sortByFunc(clist, x => -x.lightness);
    result = result.concat(sorted)
  }
  return result;
}
async function getAllTables() {
  const tables = await api('GET', '/get_tables');
  console.log(tables);
}
function getAnimals() {
  let gr = 'Animals & Nature';
  let result = [];
  for (const sg in ByGroupSubgroup[gr]) {
    if (startsWith(sg, 'anim')) result = result.concat(ByGroupSubgroup[gr][sg]);
  }
  return result;
}
async function getAnnotations(path) {
  let enan = await loadStaticText(path);
  let lines = enan.split("\n");
  let anoo = parseAnnotations(lines);
  return anoo;
}
function getAppendedNumbers(s) {
  let suffix = stringAfter(s, '_');
  if (suffix.length == 0) return []
  let nums = allNumbers(suffix);
  return nums;
}
function getBar(ctx, list, val) {
  let res = list.filter(p => isWithinDelta(p.x, val, 2) && (isLightBefore(ctx, p.x, p.y) || isLightAfter(ctx, p.x, p.y)));
  return res;
}
function getBlendCanvas(blendMode = 'normal') {
  const blendModeMapping = {
    'normal': 'source-over',       // Default blending mode
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity',
    'pass-through': 'source-over' // This is a made-up value for cases where no blending is applied
  };
  return valf(blendModeMapping[blendMode], blendMode);
}
function getBlendModeForCanvas(blendMode = 'normal') {
  const blendModeMapping = {
    'normal': 'source-over',       // Default blending mode
    'multiply': 'multiply',
    'screen': 'screen',
    'overlay': 'overlay',
    'darken': 'darken',
    'lighten': 'lighten',
    'color-dodge': 'color-dodge',
    'saturation': 'saturation',
    'color': 'color',
    'luminosity': 'luminosity',
    'pass-through': 'source-over' // This is a made-up value for cases where no blending is applied
  };
  return valf(blendModeMapping[blendMode], blendMode);
}
function getBlendModesCSS() {
  return 'normal|multiply|screen|overlay|darken|lighten|color-dodge|saturation|color|luminosity'.split('|');
}
function getBlendModesCanvas() {
  const blendModes = [
    'source-over',
    'lighter',
    'copy',
    'multiply',
    'screen',
    'overlay',
    'darken',
    'lighten',
    'color-dodge',
    'color-burn',
    'hard-light',
    'soft-light',
    'difference',
    'exclusion',
    'hue',
    'saturation',
    'color',
    'luminosity'
  ];
  return blendModes;
}
function getButtonCaptionName(name) { return `bTest${name}`; }
function getCSSVariable(varname) { return getCssVar(varname); }
function getCairoPentagonClipPath() {
  return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
}
async function getCanvasCtx(d, styles = {}, opts = {}) {
  opts.tag = 'canvas';
  let cv = mDom(d, styles, opts);
  let ctx = cv.getContext('2d');
  let fill = valf(styles.fill, styles.bg);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, cv.width, cv.height);
  }
  let bgBlend = styles.bgBlend;
  if (bgBlend) ctx.globalCompositeOperation = bgBlend;
  let src = valf(opts.src, opts.path);
  if (src) {
    let isRepeat = src.includes('ttrans');
    let imgStyle = isRepeat ? {} : { w: cv.width, h: cv.height };
    let img = await imgAsync(null, imgStyle, { src });
    if (bgBlend) ctx.globalCompositeOperation = bgBlend;
    if (isRepeat) {
      const pattern = ctx.createPattern(img, 'repeat');
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, cv.width, cv.height);
    } else ctx.drawImage(img, 0, 0, cv.width, cv.height);
  }
  return { cv, ctx };
}
function getCatKeys(symsObject, cat = 'best100') {
  const allKeys = Object.keys(symsObject);
  return allKeys.filter(key => {
    const symbolData = symsObject[key];
    return symbolData && Array.isArray(symbolData.cats) && symbolData.cats.includes(cat);
  });
}
function getCheckedNames(dParent) {
  let checks = Array.from(dParent.querySelectorAll('input[type="checkbox"]')); //dParent.getElementsByTagName('input'));
  let res = [];
  for (const ch of checks) {
    if (ch.checked) res.push(ch.name);
  }
  return res;
}
function getCheckedRadios(rg) {
  let inputs = rg.getElementsByTagName('INPUT');
  let list = [];
  for (const ch of inputs) {
    if (ch.checked) list.push(ch.value);
  }
  return list;
}
function getColorHexes(x) {
  return [
    'f0f8ff',
    'faebd7',
    '00ffff',
    '7fffd4',
    'f0ffff',
    'f5f5dc',
    'ffe4c4',
    '000000',
    'ffebcd',
    '0000ff',
    '8a2be2',
    'a52a2a',
    'deb887',
    '5f9ea0',
    '7fff00',
    'd2691e',
    'ff7f50',
    '6495ed',
    'fff8dc',
    'dc143c',
    '00ffff',
    '00008b',
    '008b8b',
    'b8860b',
    'a9a9a9',
    'a9a9a9',
    '006400',
    'bdb76b',
    '8b008b',
    '556b2f',
    'ff8c00',
    '9932cc',
    '8b0000',
    'e9967a',
    '8fbc8f',
    '483d8b',
    '2f4f4f',
    '2f4f4f',
    '00ced1',
    '9400d3',
    'ff1493',
    '00bfff',
    '696969',
    '696969',
    '1e90ff',
    'b22222',
    'fffaf0',
    '228b22',
    'ff00ff',
    'dcdcdc',
    'f8f8ff',
    'ffd700',
    'daa520',
    '808080',
    '808080',
    '008000',
    'adff2f',
    'f0fff0',
    'ff69b4',
    'cd5c5c',
    '4b0082',
    'fffff0',
    'f0e68c',
    'e6e6fa',
    'fff0f5',
    '7cfc00',
    'fffacd',
    'add8e6',
    'f08080',
    'e0ffff',
    'fafad2',
    'd3d3d3',
    'd3d3d3',
    '90ee90',
    'ffb6c1',
    'ffa07a',
    '20b2aa',
    '87cefa',
    '778899',
    '778899',
    'b0c4de',
    'ffffe0',
    '00ff00',
    '32cd32',
    'faf0e6',
    'ff00ff',
    '800000',
    '66cdaa',
    '0000cd',
    'ba55d3',
    '9370db',
    '3cb371',
    '7b68ee',
    '00fa9a',
    '48d1cc',
    'c71585',
    '191970',
    'f5fffa',
    'ffe4e1',
    'ffe4b5',
    'ffdead',
    '000080',
    'fdf5e6',
    '808000',
    '6b8e23',
    'ffa500',
    'ff4500',
    'da70d6',
    'eee8aa',
    '98fb98',
    'afeeee',
    'db7093',
    'ffefd5',
    'ffdab9',
    'cd853f',
    'ffc0cb',
    'dda0dd',
    'b0e0e6',
    '800080',
    '663399',
    'ff0000',
    'bc8f8f',
    '4169e1',
    '8b4513',
    'fa8072',
    'f4a460',
    '2e8b57',
    'fff5ee',
    'a0522d',
    'c0c0c0',
    '87ceeb',
    '6a5acd',
    '708090',
    '708090',
    'fffafa',
    '00ff7f',
    '4682b4',
    'd2b48c',
    '008080',
    'd8bfd8',
    'ff6347',
    '40e0d0',
    'ee82ee',
    'f5deb3',
    'ffffff',
    'f5f5f5',
    'ffff00',
    '9acd32'
  ];
}
function getColorNames() {
  return [
    'AliceBlue',
    'AntiqueWhite',
    'Aqua',
    'Aquamarine',
    'Azure',
    'Beige',
    'Bisque',
    'Black',
    'BlanchedAlmond',
    'Blue',
    'BlueViolet',
    'Brown',
    'BurlyWood',
    'CadetBlue',
    'Chartreuse',
    'Chocolate',
    'Coral',
    'CornflowerBlue',
    'Cornsilk',
    'Crimson',
    'Cyan',
    'DarkBlue',
    'DarkCyan',
    'DarkGoldenRod',
    'DarkGray',
    'DarkGrey',
    'DarkGreen',
    'DarkKhaki',
    'DarkMagenta',
    'DarkOliveGreen',
    'DarkOrange',
    'DarkOrchid',
    'DarkRed',
    'DarkSalmon',
    'DarkSeaGreen',
    'DarkSlateBlue',
    'DarkSlateGray',
    'DarkSlateGrey',
    'DarkTurquoise',
    'DarkViolet',
    'DeepPink',
    'DeepSkyBlue',
    'DimGray',
    'DimGrey',
    'DodgerBlue',
    'FireBrick',
    'FloralWhite',
    'ForestGreen',
    'Fuchsia',
    'Gainsboro',
    'GhostWhite',
    'Gold',
    'GoldenRod',
    'Gray',
    'Grey',
    'Green',
    'GreenYellow',
    'HoneyDew',
    'HotPink',
    'IndianRed',
    'Indigo',
    'Ivory',
    'Khaki',
    'Lavender',
    'LavenderBlush',
    'LawnGreen',
    'LemonChiffon',
    'LightBlue',
    'LightCoral',
    'LightCyan',
    'LightGoldenRodYellow',
    'LightGray',
    'LightGrey',
    'LightGreen',
    'LightPink',
    'LightSalmon',
    'LightSeaGreen',
    'LightSkyBlue',
    'LightSlateGray',
    'LightSlateGrey',
    'LightSteelBlue',
    'LightYellow',
    'Lime',
    'LimeGreen',
    'Linen',
    'Magenta',
    'Maroon',
    'MediumAquaMarine',
    'MediumBlue',
    'MediumOrchid',
    'MediumPurple',
    'MediumSeaGreen',
    'MediumSlateBlue',
    'MediumSpringGreen',
    'MediumTurquoise',
    'MediumVioletRed',
    'MidnightBlue',
    'MintCream',
    'MistyRose',
    'Moccasin',
    'NavajoWhite',
    'Navy',
    'OldLace',
    'Olive',
    'OliveDrab',
    'Orange',
    'OrangeRed',
    'Orchid',
    'PaleGoldenRod',
    'PaleGreen',
    'PaleTurquoise',
    'PaleVioletRed',
    'PapayaWhip',
    'PeachPuff',
    'Peru',
    'Pink',
    'Plum',
    'PowderBlue',
    'Purple',
    'RebeccaPurple',
    'Red',
    'RosyBrown',
    'RoyalBlue',
    'SaddleBrown',
    'Salmon',
    'SandyBrown',
    'SeaGreen',
    'SeaShell',
    'Sienna',
    'Silver',
    'SkyBlue',
    'SlateBlue',
    'SlateGray',
    'SlateGrey',
    'Snow',
    'SpringGreen',
    'SteelBlue',
    'Tan',
    'Teal',
    'Thistle',
    'Tomato',
    'Turquoise',
    'Violet',
    'Wheat',
    'White',
    'WhiteSmoke',
    'Yellow',
    'YellowGreen'
  ];
}
function getColormapColors() {
  let s = colormapAsStringOrig();
  let parts = s.split('clickColor("');
  let colors = [];
  for (const p of parts) { if (p.startsWith('#')) colors.push(p.substring(0, 7)); }
  return colors;
}
function getCssVar(varname) { return getComputedStyle(document.body).getPropertyValue(varname); }
async function getDA(key, fast = true) {
  if (isdef(DA[key])) return DA[key];
  let loc = window.location.href;
  DA.isMoxito = loc.includes('moxito.online');
  DA.isTelecave = loc.includes('telecave');
  DA.isLocal = !DA.isMoxito && !DA.isTelecave;
  DA.isLocalhost = DA.isLocal && loc.includes('localhost');
  DA.isLive = DA.isLocal && !DA.isLocalhost;
  DA.project = stringAfterLast(stringBeforeLast(loc, '/'), '/'); //console.log('project', DA.project);
  DA.staticUrl = DA.isLive ? '../' : DA.isLocalhost ? 'http://localhost/maroot/' : DA.isMoxito ? 'https://moxito.online/' : 'https://www.telecave.net/ma/'; //'https://moxito.online/';
  DA.phpUrl = (DA.isLocal ? 'http://localhost/maroot/' : DA.isMoxito ? 'https://moxito.online/' : 'https://www.telecave.net/ma/') + DA.project + '/ppph/';
  DA.dbUrl = (DA.isLocal ? 'http://localhost/maroot/' : DA.isMoxito ? 'https://moxito.online/' : 'https://www.telecave.net/ma/') + DA.project + '/ppph/db_api.php';
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
function getDashedHexBorder(color) {
  return {
    background: `repeating-linear-gradient(-60deg, ${color}, ${color} 4px, transparent 4px, transparent 10px),
    repeating-linear-gradient(60deg, ${color}, ${color} 4px, transparent 4px, transparent 10px),
    repeating-linear-gradient(0deg, ${color}, ${color} 4px, transparent 4px, transparent 10px)`,
    bgSize: '100% 100%'
  }
  return {
    background: `repeating-linear-gradient(-60deg, ${color}, ${color} 4px, transparent 4px, transparent 10px)`,
    bgSize: '100% 100%'
  };
}
function getDateTimeData(from, to) {
  let dt = new Date(from);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(dt.getDate()).padStart(2, '0'); // Add leading zero if needed
  const hour = String(dt.getHours()).padStart(2, '0'); // Get hours (24-hour format)
  const minute = String(dt.getMinutes()).padStart(2, '0'); // Get minutes
  const second = String(dt.getSeconds()).padStart(2, '0'); // Get minutes
  let dateSort = `${year}.${month}.${day}`;
  let date = `${day}.${month}.${year}`;
  let time = `${hour}:${minute}:${second}`;
  let secs = calculateSecondsDifference(from, to);
  return { dt, year, month, day, hour, minute, second, date, time, secs, dateSort };
}
function getDetailedSuperdi(key) {
  let o = M.superdi[key];
  let details = valf(M.details[key], M.details[o.friendly]);
  if (nundef(details)) return null;
  addKeys(details, o);
  o.key = key;
  o.class = o.class.toLowerCase();
  if (isdef(o.lifespan)) o.olifespan = calcLifespan(o.lifespan);
  if (isdef(o.food)) {
    [o.foodlist, o.foodtype] = extractFoodAndType(o.food);
    let foodTokens = [];
    if (['berries', 'fruit'].some(x => o.foodlist.includes(x))) foodTokens.push('cherries');
    if (['fish', 'shrimp', 'squid'].some(x => o.foodlist.includes(x))) foodTokens.push('fish');
    if (['wheat', 'grain', 'crops'].some(x => o.foodlist.includes(x))) foodTokens.push('grain');
    if (o.foodtype.startsWith('insect')) foodTokens.push('worm');
    else if (o.foodtype.startsWith('carni')) foodTokens.push('mouse');
    else if (o.foodtype.startsWith('omni')) foodTokens.push('omni');
    else if (o.foodtype.startsWith('herbi')) foodTokens.push('seedling');
    o.foodTokens = arrTake(foodTokens, 3);
  }
  if (isdef(o.offsprings)) o.ooffsprings = calcOffsprings(o.offsprings);
  if (isdef(o.weight)) { o.oweight = calcWeight(o.weight); o.nweight = o.oweight.avg; }
  if (isdef(o.size)) { o.osize = calcSize(o.size); o.nsize = o.osize.avg; }
  if (isdef(o.species)) {
    let x = o.species; o.longSpecies = x; o.species = extractSpecies(x);
  }
  if (isdef(o.habitat)) {
    let text = o.habitat;
    let hlist = o.hablist = extractHabitat(text, ['coastal']);
    let habTokens = [];
    if (['wetland'].some(x => hlist.includes(x))) { habTokens.push('wetland'); } //colors.push('lightblue'); imgs.push('../assets/games/wingspan/wetland.png'); }
    if (['dwellings', 'grassland', 'desert'].some(x => hlist.includes(x))) { habTokens.push('grassland'); } //{ colors.push('goldenrod'); imgs.push('../assets/games/wingspan/grassland2.png'); }
    if (['forest', 'mountain', 'ice'].some(x => hlist.includes(x))) { habTokens.push('forest'); } //{ colors.push('emerald'); imgs.push('../assets/games/wingspan/forest1.png'); }
    o.habTokens = habTokens;
  }
  let colors = ['turquoise', 'bluegreen', 'teal', 'brown', 'gray', 'green', 'violet', 'blue', 'black', 'yellow', 'white', 'lavender', 'orange', 'buff', 'red', 'pink', 'golden', 'cream', 'grey', 'sunny', 'beige'];
  if (isdef(o.color)) o.colors = extractColors(o.color, colors);
  o = sortDictionary(o);
  return o;
}
function getDistanceBetweenCenters(div1, div2) {
  const rect1 = div1.getBoundingClientRect();
  const rect2 = div2.getBoundingClientRect();
  const centerX1 = rect1.left + rect1.width / 2;
  const centerY1 = rect1.top + rect1.height / 2;
  const centerX2 = rect2.left + rect2.width / 2;
  const centerY2 = rect2.top + rect2.height / 2;
  const dx = centerX2 - centerX1;
  const dy = centerY2 - centerY1;
  return Math.sqrt(dx * dx + dy * dy);
}
function getDistanceBetweenPoints(p1, p2) {
  if (isString(p1)) p1 = B.diPoints[p1];
  if (isString(p2)) p2 = B.diPoints[p2];
  return getDistanceBetweenCenters(p1.div, p2.div);
}
async function getDivPalette(div, topN = 10, blendBgColor = null) {
  return new Promise((resolve, reject) => {
    const style = getComputedStyle(div);
    const bgImage = style.backgroundImage;
    const match = bgImage && bgImage.match(/url\(["']?(.*?)["']?\)/);
    if (!match) {
      reject(new Error("No background-image found on element"));
      return;
    }
    const imgUrl = match[1];
    const blendMode = style.backgroundBlendMode || style.mixBlendMode || "source-over";
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const w = div.clientWidth || img.width;
      const h = div.clientHeight || img.height;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (blendBgColor) {
        ctx.fillStyle = blendBgColor;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.globalCompositeOperation = blendMode;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(canvas, topN);
      resolve(palette.map(c => `rgb(${c[0]},${c[1]},${c[2]})`));
    };
    img.onerror = reject;
  });
}
function getDynId(loc, oid) { return loc + '@' + oid; }
function getElementWithAttribute(key, val) {
  return document.querySelector(`[${key}="${val}"]`);
}
function getEquidistantPoints(p1, p2, d = 10, includeEnds = false) {
  const points = [];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const numPoints = Math.floor(distance / d);
  let istart = includeEnds ? 0 : 1;
  let iend = includeEnds ? numPoints : numPoints - 1;
  for (let i = istart; i <= iend; i++) {
    const t = i / numPoints;
    const x = p1.x + t * dx;
    const y = p1.y + t * dy;
    points.push({ x, y });
  }
  return points;
}
function getEventValue(o) {
  if (isEmpty(o.time)) return o.text;
  return o.time + ' ' + stringBefore(o.text, '\n');
}
function getFigureSvg(letters = 'HQ') {
  let part1 = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" face="${letters}"
      height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
      <defs>
        <rect id="X${letters}" width="164.8" height="260.8" x="-82.4" y="-130.4"></rect>
      </defs>
  `;
  let part3 = `<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}1"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}1"></use>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}2"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}2"></use>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}3"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}3"></use>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}31"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}31"></use>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}32"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}32"></use>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}33"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}33"></use>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}34"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}34"></use>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}4"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}4"></use>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}5"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}5"></use>
      <use width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}6"></use>
      <use transform="rotate(180)" width="164.8" height="260.8" x="-82.4" y="-130.4" xlink:href="#${letters}6"></use>
      <use xlink:href="#VSJ" height="32" x="-114.4" y="-156"></use>
      <use xlink:href="#SSJ" height="26.769" x="-111.784" y="-119"></use>
      <use xlink:href="#SSJ" height="55.68" x="-91.768" y="-132.16"></use>
      <g transform="rotate(180)">
        <use xlink:href="#VSJ" height="32" x="-114.4" y="-156"></use>
        <use xlink:href="#SSJ" height="26.769" x="-111.784" y="-119"></use>
        <use xlink:href="#SSJ" height="55.68" x="-91.768" y="-132.16"></use>
      </g>
      <use xlink:href="#X${letters}" stroke="#44F" fill="none"></use>
    </svg>
  `;
  let part2 = '';
  for (const i of range(1, 6)) {
    if (i == 3) {
      for (let j = 1; j <= 4; j++) {
        part2 += M.c52Symbols[`${letters}${i}${j}`];
      }
    }
    part2 += M.c52Symbols[`${letters}${i}`];
  }
  let p = part2.split(`fill='`);
  let part2New = p[0];
  for (let i = 1; i < p.length; i++) {
    let s = p[i];
    part2New += `fill=`;
    let color = stringBefore(s, "'");//console.log(color);
    let rest = s.slice(color.length + 1);
    part2New = part2New + `'${color == 'none' ? 'none' : i == 3 ? 'black' : rColor()}' ` + rest;
  }
  return part1 + part2New + part3;
}
function getFilteredDict(di, func) {
  let res = {};
  for (const k in di) {
    if (func(k, di[k])) res[k] = di[k];
  }
  return res;
}
function getFilteredSymbols(diradDict, min = 22, max = 24) {
  const matchingKeys = [];
  for (const key in diradDict) {
    const entry = diradDict[key];
    if (entry && entry.radmin !== undefined && entry.radmax !== undefined) {
      const radmin = entry.radmin;
      const radmax = entry.radmax;
      const diff = radmax - radmin;
      if (diff <= 1 && radmin >= min && radmax <= max) {
        matchingKeys.push(key);
      }
    }
  }
  return matchingKeys;
}
function getFunctionsNameThatCalledThisFunction() {
  let c1 = getFunctionsNameThatCalledThisFunction.caller;
  if (nundef(c1)) return 'no caller!';
  let c2 = c1.caller;
  if (nundef(c2)) return 'no caller!';
  return c2.name;
}
function getGSGElements(gCond, sCond) {
  let keys = [];
  let byg = ByGroupSubgroup;
  for (const gKey in byg) {
    if (!gCond(gKey)) continue;
    for (const sKey in byg[gKey]) {
      if (!sCond(sKey)) continue;
      keys = keys.concat(byg[gKey][sKey]);
    }
  }
  return keys.sort();
}
function getGameOption(prop) { return lookup(T, ['options', prop]); }
function getGamePlayerOptions(gamename) { return getGameConfig(gamename).ploptions; }
async function getGameState(gameId) {
  return await api('GET', `/game_state/${gameId}`);
}
function getGameValues() {
  let user = U.id;
  let game = G.id;
  let level = G.level;
  let settings = { numColors: 1, numRepeat: 1, numPics: 1, numSteps: 1, colors: ColorList };
  settings = mergeOverride(settings, DB.settings);
  if (isdef(U.settings)) settings = mergeOverride(settings, U.settings);
  if (isdef(DB.games[game])) settings = mergeOverride(settings, DB.games[game]);
  let next = lookup(DB.games, [game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
  next = lookup(U, ['games', game]); if (next) settings = mergeOverride(settings, next);
  next = lookup(U, ['games', game, 'levels', level]); if (next) settings = mergeOverride(settings, next);
  delete settings.levels;
  Speech.setLanguage(settings.language);
  return settings;
}
function getHexCornerList(x, y, sz) { return [x + sz, y, x + 2 * sz, y + sz / 2, x + 2 * sz, y + sz * 3 / 2, x + sz, y + 2 * sz, x, y + sz * 3 / 2, x, y + sz / 2]; }
function getImageData(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // To avoid CORS issues
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      let data = canvas.toDataURL('image/png');
      resolve(data);
    };
    img.onerror = (err) => {
      reject(new Error('Failed to load image'));
    };
  });
}
function getInnermostTextString(div) {
  if (!div || !div.children.length) {
    return div && div.innerHTML.trim() && !/<[^>]+>/.test(div.innerHTML) ? div.innerHTML.trim() : null;
  }
  for (let child of div.children) {
    let result = getInnermostTextString(child);
    if (result) return result;
  }
  return null;
}
function getItem(k) { return infoToItem(Syms[k]); }
function getKeyTypes() { return ['plain', 'fa', 'ga', 'fa6', 'img', 'text', 'photo']; }
function getLine(ctx, list, val) {
  let res = list.filter(p => isWithinDelta(p.y, val, 2) && (isLightBeforeV(ctx, p.x, p.y) || isLightAfterV(ctx, p.x, p.y)));
  let ls = sortBy(res, 'x');
  let segments = [], seg = [];
  let i = -1; let lastx = -1;
  while (++i < ls.length) {
    let el = ls[i];
    if (lastx >= 0 && el.x > lastx + 1) {
      segments.push(seg); seg = [];
    } else {
      if (el.x != lastx) seg.push(el);
    }
    lastx = el.x;
  }
  segments.push(seg);
  let len = 0, best = null;
  for (const s of segments) { if (s.length > len) { len = s.length; best = s } }
  return best;
}
function getListAndDictsForDicolors() {
  let bucketlist = Object.keys(M.dicolor);
  bucketlist = arrCycle(bucketlist, 8);
  let dicolorlist = [];
  for (const bucket of bucketlist) {
    let list = dict2list(M.dicolor[bucket]);
    for (const c of list) {
      let o = w3color(c.value);
      o.name = c.id;
      o.hex = c.value;
      o.bucket = bucket;
      dicolorlist.push(o);
    }
  }
  let byhex = list2dict(dicolorlist, 'hex');
  let byname = list2dict(dicolorlist, 'name');
  return [dicolorlist, byhex, byname];
}
function getMatchingColorList(hex) {
  hex = colorFrom(hex);
  const { h, s, l } = hexToHsl(hex);
  return [
    hex,
    hslToHex((h + 180) % 360, s, l),
    hslToHex((h + 30) % 360, s, l),
    hslToHex((h + 330) % 360, s, l),
    hslToHex((h + 120) % 360, s, l),
    hslToHex((h + 240) % 360, s, l),
    hslToHex((h + 150) % 360, s, l),
    hslToHex((h + 210) % 360, s, l),
    hslToHex(h, s, Math.max(0, l - 20)),
    hslToHex(h, s, Math.min(100, l + 20))
  ].map(x => colorFrom(x));
}
function getMatchingColors(hex) {
  hex = colorFrom(hex);
  const { h, s, l } = hexToHsl(hex);
  return {
    complementary: hslToHex((h + 180) % 360, s, l),
    analogous: [
      hslToHex((h + 30) % 360, s, l),
      hslToHex((h + 330) % 360, s, l)
    ],
    triadic: [
      hslToHex((h + 120) % 360, s, l),
      hslToHex((h + 240) % 360, s, l)
    ],
    splitComplementary: [
      hslToHex((h + 150) % 360, s, l),
      hslToHex((h + 210) % 360, s, l)
    ],
    monochromatic: [
      hslToHex(h, s, Math.max(0, l - 20)),
      hslToHex(h, s, Math.min(100, l + 20))
    ]
  };
}
function getMaxWordWidth(words, div) {
  if (!div || !Array.isArray(words)) return 0;
  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'nowrap';
  span.style.top = '-9999px';
  span.style.left = '-9999px';
  const computedStyle = window.getComputedStyle(div);
  span.style.font = computedStyle.font;
  span.style.fontSize = computedStyle.fontSize;
  span.style.fontFamily = computedStyle.fontFamily;
  span.style.fontWeight = computedStyle.fontWeight;
  span.style.letterSpacing = computedStyle.letterSpacing;
  span.style.wordSpacing = computedStyle.wordSpacing;
  span.style.textTransform = computedStyle.textTransform;
  document.body.appendChild(span);
  let maxWidth = 0;
  for (const word of words) {
    span.textContent = word;
    const width = span.offsetWidth;
    if (width > maxWidth) {
      maxWidth = width;
    }
  }
  document.body.removeChild(span);
  return maxWidth;
}
async function getMostDifferentColors(imgUrl, topN = 10, sampleSize = 100) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const scale = Math.min(sampleSize / img.width, sampleSize / img.height, 1);
      const w = Math.max(1, Math.floor(img.width * scale));
      const h = Math.max(1, Math.floor(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      const colorMap = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 16) * 16;
        const g = Math.round(data[i + 1] / 16) * 16;
        const b = Math.round(data[i + 2] / 16) * 16;
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      const colors = Object.keys(colorMap).map(c => c.split(",").map(Number));
      if (colors.length <= topN) {
        resolve(colors.map(c => `rgb(${c.join(",")})`));
        return;
      }
      const selected = [];
      selected.push(colors[0]);
      while (selected.length < topN) {
        let maxDist = -1;
        let nextColor = null;
        for (const c of colors) {
          if (selected.includes(c)) continue;
          const dist = Math.min(...selected.map(s => {
            const dr = s[0] - c[0];
            const dg = s[1] - c[1];
            const db = s[2] - c[2];
            return dr * dr + dg * dg + db * db;
          }));
          if (dist > maxDist) {
            maxDist = dist;
            nextColor = c;
          }
        }
        if (!nextColor) break;
        selected.push(nextColor);
      }
      resolve(selected.map(c => `rgb(${c.join(",")})`));
    };
    img.onerror = reject;
  });
}
async function getMostDifferentColorsWithThreshold(imgUrl, topN = 10, sampleSize = 100, minOccurrence = 5) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const scale = Math.min(sampleSize / img.width, sampleSize / img.height, 1);
      const w = Math.max(1, Math.floor(img.width * scale));
      const h = Math.max(1, Math.floor(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;
      const colorMap = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 16) * 16;
        const g = Math.round(data[i + 1] / 16) * 16;
        const b = Math.round(data[i + 2] / 16) * 16;
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      const frequentColors = Object.entries(colorMap)
        .filter(([key, count]) => count >= minOccurrence)
        .map(([key]) => key.split(",").map(Number));
      if (frequentColors.length <= topN) {
        resolve(frequentColors.map(c => `rgb(${c.join(",")})`));
        return;
      }
      const selected = [];
      selected.push(frequentColors[0]);
      while (selected.length < topN) {
        let maxDist = -1;
        let nextColor = null;
        for (const c of frequentColors) {
          if (selected.includes(c)) continue;
          const dist = Math.min(...selected.map(s => {
            const dr = s[0] - c[0];
            const dg = s[1] - c[1];
            const db = s[2] - c[2];
            return dr * dr + dg * dg + db * db;
          }));
          if (dist > maxDist) {
            maxDist = dist;
            nextColor = c;
          }
        }
        if (!nextColor) break;
        selected.push(nextColor);
      }
      resolve(selected.map(c => `rgb(${c.join(",")})`));
    };
    img.onerror = reject;
  });
}
async function getMostDifferentColorsWithThresholdAndBlend(
  imgUrl,
  blendMode = "multiply",
  backgroundColor = "white",
  topN = 10,
  minOccurrence = 5,
  sampleSize = 100
) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // allow cross-origin images
    img.src = imgUrl;
    img.onload = () => {
      const scale = Math.min(sampleSize / img.width, sampleSize / img.height, 1);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = blendMode;
      ctx.drawImage(img, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
      const imageData = ctx.getImageData(0, 0, w, h).data;
      const colorCount = {};
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const a = imageData[i + 3];
        if (a === 0) continue;
        const rq = Math.round(r / 16) * 16;
        const gq = Math.round(g / 16) * 16;
        const bq = Math.round(b / 16) * 16;
        const color = `${rq},${gq},${bq}`;
        colorCount[color] = (colorCount[color] || 0) + 1;
      }
      const filteredColors = Object.entries(colorCount).filter(
        ([, count]) => count >= minOccurrence
      );
      if (filteredColors.length === 0) {
        resolve([]);
        return;
      }
      filteredColors.sort((a, b) => b[1] - a[1]);
      const selected = [];
      const distance = (c1, c2) => {
        const [r1, g1, b1] = c1.split(",").map(Number);
        const [r2, g2, b2] = c2.split(",").map(Number);
        return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
      };
      for (const [color] of filteredColors) {
        if (selected.length === 0) {
          selected.push(color);
        } else {
          const minDist = Math.min(...selected.map((c) => distance(c, color)));
          if (minDist > 40) {
            selected.push(color);
          }
        }
        if (selected.length >= topN) break;
      }
      resolve(selected.map((c) => `rgb(${c})`));
    };
    img.onerror = reject;
  });
}
async function getMostDifferentColorsWithThresholdB(
  imgUrl,
  topN = 10,
  sampleSize = 100,
  minOccurrence = 5,
  blendMode = "source-over",   // new parameter
  blendColor = null
) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;
    img.onload = () => {
      const scale = Math.min(sampleSize / img.width, sampleSize / img.height, 1);
      const w = Math.max(1, Math.floor(img.width * scale));
      const h = Math.max(1, Math.floor(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h); mAppend('dPage', canvas);
      if (blendColor) {
        ctx.globalCompositeOperation = blendMode;
        ctx.fillStyle = blendColor;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = blendMode;
      }
      const data = ctx.getImageData(0, 0, w, h).data;
      const colorMap = {};
      for (let i = 0; i < data.length; i += 4) {
        const r = Math.round(data[i] / 16) * 16;
        const g = Math.round(data[i + 1] / 16) * 16;
        const b = Math.round(data[i + 2] / 16) * 16;
        const key = `${r},${g},${b}`;
        colorMap[key] = (colorMap[key] || 0) + 1;
      }
      const frequentColors = Object.entries(colorMap)
        .filter(([key, count]) => count >= minOccurrence)
        .map(([key]) => key.split(",").map(Number));
      if (frequentColors.length <= topN) {
        resolve(frequentColors.map(c => `rgb(${c.join(",")})`));
        return;
      }
      const selected = [];
      selected.push(frequentColors[0]);
      while (selected.length < topN) {
        let maxDist = -1;
        let nextColor = null;
        for (const c of frequentColors) {
          if (selected.some(sel => sel[0] === c[0] && sel[1] === c[1] && sel[2] === c[2])) continue;
          const dist = Math.min(...selected.map(s => {
            const dr = s[0] - c[0];
            const dg = s[1] - c[1];
            const db = s[2] - c[2];
            return dr * dr + dg * dg + db * db;
          }));
          if (dist > maxDist) {
            maxDist = dist;
            nextColor = c;
          }
        }
        if (!nextColor) break;
        selected.push(nextColor);
      }
      resolve(selected.map(c => `rgb(${c.join(",")})`));
    };
    img.onerror = reject;
  });
}
function getMotto() {
  let list = [
    `Let's play!`, 'Enjoy this beautiful space!', 'First vacation day!', 'No place like home!',
    'You are free!', 'Nothing to do here!', `Don't worry, be happy!`, `Good times ahead!`,
    'Right here, right now', 'Life is a dream', 'Dream away!', 'Airport forever', 'All is well',
    `Let the world spin!`
  ];
  return rChoose(list);
}
function getMouseCoordinates(event) {
  const image = event.target;
  const offsetX = event.clientX +
    (window.scrollX !== undefined ? window.scrollX : (document.documentElement || document.body.parentNode || document.body).scrollLeft) -
    12;
  const offsetY = event.clientY +
    (window.scrollY !== undefined ? window.scrollY : (document.documentElement || document.body.parentNode || document.body).scrollTop) -
    124;
  return { x: offsetX, y: offsetY };
}
function getMouseCoordinatesRelativeToElement(ev, elem) {
  if (nundef(elem)) elem = ev.target;
  const rect = elem.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  return { x, y };
}
function getNature() {
  let gr = 'Animals & Nature';
  let result = [];
  for (const sg in ByGroupSubgroup[gr]) {
    result = result.concat(ByGroupSubgroup[gr][sg]);
  }
  return result;
}
function getNavBg() { return mGetStyle('dNav', 'bg'); }
function getNonOverlappingPlusOne(listOfArrays) {
  const keyFrequency = new Map();
  listOfArrays.forEach(arr => {
    arr.forEach(obj => {
      keyFrequency.set(obj.key, (keyFrequency.get(obj.key) || 0) + 1);
    });
  });
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
  const selectedOverlappers = [];
  const takenKeys = new Set();
  strictlyUnique.forEach(arr => arr.forEach(obj => takenKeys.add(obj.key)));
  for (const arr of overlappingCandidates) {
    const hasOverlap = arr.some(obj => takenKeys.has(obj.key));
    if (!hasOverlap) {
      selectedOverlappers.push(arr);
      arr.forEach(obj => takenKeys.add(obj.key));
    }
  }
  return [...strictlyUnique, ...selectedOverlappers];
}
function getNow() { return Math.floor(Date.now() / 1000); }
function getO(n, R) { let oid = n.oid; if (isdef(oid)) return R.getO(oid); else return null; }
function getOtherPlayerNames(table, me) { return table.plorder.filter(x => x != me); }
function getPaletteFromCanvas(canvas) {
  if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
  const dataUrl = canvas.toDataURL();
  const img = new Image();
  img.src = dataUrl;
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const palette = ColorThiefObject.getPalette(img);
      resolve(palette ? palette.map(x => colorFrom(x)) : ['black', 'white']);
    };
    img.onerror = () => {
      reject(new Error('Failed to load the image from canvas.'));
    };
  });
}
function getParams(areaName, oSpec, oid) {
  let params = oSpec.params ? oSpec.params : {};
  let panels = oSpec.panels ? oSpec.panels : [];
  let num = panels.length;
  let or = params.orientation ? params.orientation == 'h' ? 'rows'
    : 'columns' : DEF_ORIENTATION;
  let split = params.split ? params.split : DEF_SPLIT;
  let bg = oSpec.color ? oSpec.color : randomColor();
  let fg = bg ? colorIdealText(bg) : null;
  let id = oSpec.id ? oSpec.id : areaName;
  if (oid) { id = getDynId(id, oid); }
  let parent = mBy(areaName);
  if (oSpec.id) {
    parent.id = id;
    addAREA(id, oSpec);
    parent.innerHTML = id;
  }
  if (bg) { mColor(parent, bg, fg); }
  return [num, or, split, bg, fg, id, panels, parent];
}
function getPipPatterns() {
  return {
    1: [[1, [1.5]]],
    2: [[1, [0, 3]]],
    3: [[1, [0, 1.5, 3]]],
    4: [[0, [0, 3]], [2, [0, 3]]],
    5: [[0, [0, 3]], [1, [1.5]], [2, [0, 3]]],
    6: [[0, [0, 1.5, 3]], [2, [0, 1.5, 3]]],
    7: [[0, [0, 1.5, 3]], [1, [0.75]], [2, [0, 1.5, 3]]],
    8: [[0, [0, 1.5, 3]], [1, [0.75, 2.25]], [2, [0, 1.5, 3]]],
    9: [[0, [0, 1, 2, 3]], [1, [1.5]], [2, [0, 1, 2, 3]]],
    10: [[0, [0, 1, 2, 3]], [1, [0.5, 2.5]], [2, [0, 1, 2, 3]]],
    11: [[0, [0, 1, 2, 3]], [1, [0.5, 1.5, 2.5]], [2, [0, 1, 2, 3]]],
    12: [[0, [0, .75, 1.5, 2.25, 3]], [1, [0.3, 2.7]], [2, [0, .75, 1.5, 2.25, 3]]],
    13: [[0, [0, .75, 1.5, 2.25, 3]], [1, [0.3, 1.1, 2.7]], [2, [0, .75, 1.5, 2.25, 3]]],
    14: [[0, [0, .75, 1.5, 2.25, 3]], [1, [0.3, 1.1, 1.9, 2.7]], [2, [0, .75, 1.5, 2.25, 3]]],
  };
}
function getPixRgb(ctx, x, y) {
  var pix = ctx.getImageData(x, y, 1, 1).data;
  var red = pix[0]; var green = pix[1]; var blue = pix[2];
  return { r: red, g: green, b: blue };
}
function getPixTL(img) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, 1, 1).data;
  const r = imageData[0];
  const g = imageData[1];
  const b = imageData[2];
  const a = imageData[3] / 255;
  const color = { r, g, b, a };
  return color;
}
function getPlayerProp(prop, name) { let pl = T.players[valf(name, getUname())]; return pl[prop]; }
function getPlayersWithMaxScore(table) {
  let list = dict2list(table.players, 'name');
  list = sortByDescending(list, 'score');
  maxlist = arrTakeWhile(list, x => x.score == list[0].score);
  return maxlist.map(x => x.name);
}
function getPoly(offsets, x, y, w, h) {
  let poly = [];
  for (let p of offsets) {
    let px = Math.round(x + p[0] * w);
    let py = Math.round(y + p[1] * h);
    poly.push({ x: px, y: py });
  }
  return poly;
}
function getPolyNeighbors(poly) {
  const neighbors = poly.getAttribute('data-neighbors').split(','); //console.log(neighbors);
  return neighbors.map(x => mBy(x));
}
function getQuadCornerList(x, y, sz) { return [x, y, x + sz, y, x + sz, y + sz, x, y + sz]; }
function getRandomFromArray(array) { return (array[randomIndex(array) | 0]) }
function getRect(elem, relto) {
  if (isString(elem)) elem = document.getElementById(elem);
  let res = elem.getBoundingClientRect();
  if (isdef(relto)) {
    let b2 = relto.getBoundingClientRect();
    let b1 = res;
    res = {
      x: b1.x - b2.x,
      y: b1.y - b2.y,
      left: b1.left - b2.left,
      top: b1.top - b2.top,
      right: b1.right - b2.right,
      bottom: b1.bottom - b2.bottom,
      width: b1.width,
      height: b1.height
    };
  }
  let r = { x: res.left, y: res.top, w: res.width, h: res.height };
  addKeys({ l: r.x, t: r.y, r: r.x + r.w, b: r.y + r.h }, r);
  return r;
}
function getRectInt(elem, relto) {
  if (isString(elem)) elem = document.getElementById(elem);
  let res = elem.getBoundingClientRect();
  if (isdef(relto)) {
    let b2 = relto.getBoundingClientRect();
    let b1 = res;
    res = {
      x: b1.x - b2.x,
      y: b1.y - b2.y,
      left: b1.left - b2.left,
      top: b1.top - b2.top,
      right: b1.right - b2.right,
      bottom: b1.bottom - b2.bottom,
      width: b1.width,
      height: b1.height
    };
  }
  let r4 = { x: Math.round(res.left), y: Math.round(res.top), w: Math.round(res.width), h: Math.round(res.height) };
  extendRect(r4);
  return r4;
}
function getSelected(container, items) {
  /**
   * getSelected
   * Returns all items currently selected (clicked) inside a container.
   *
   * @param {HTMLElement}          container
   * @param {Array<Object|HTMLElement>} [items]
   *   The original items array passed to splayItems.
   *   If provided, returns the matching original objects (card objects or elements).
   *   If omitted, returns the raw selected HTMLElements found in the container.
   *
   * @returns {Array<Object|HTMLElement>}
   *
   * @example
   *   
   *   const selected = getSelected(handEl, hand);
   *
   *   
   *   const selectedEls = getSelected(handEl);
   */
  const selectedEls = Array.from(container.querySelectorAll('[data-selected="1"]'));
  if (!items) return selectedEls;
  return items.filter(item => {
    const el = item instanceof HTMLElement ? item : item.div;
    return selectedEls.includes(el);
  });
}
function getSeparators(allowed) {
  let specialChars = toLetters(' ,-.!?;:');
  if (isdef(allowed)) specialChars = arrMinus(specialChars, toLetters(allowed));
  return specialChars;
}
function getServerurl(port = 3000) {
  let type = detectSessionType();
  let server = type == 'vps' ? 'https://server.vidulusludorum.com' : `http://localhost:${port}`;
  return server;
}
function getSetOfDifferentTypesOfPoints(points) {
  let types = new Set(); for (const p of points) types.add(p.type); return types;
}
function getSizeNeeded(elem) {
  var d = elem.cloneNode(true);
  d.style.width = 'auto';
  document.body.appendChild(d);
  let cStyles = {};
  cStyles.position = 'fixed';
  cStyles.opacity = 0;
  cStyles.top = '-9999px';
  mStyle(d, cStyles);
  height = d.clientHeight;
  width = d.clientWidth;
  d.parentNode.removeChild(d);
  return { w: Math.round(width), h: Math.round(height) };
}
function getStyleProp(elem, prop) { return getComputedStyle(elem).getPropertyValue(prop); }
function getSuperdi(key) { return valf(M.superdi[key], {}); }
function getSvgJack() { return __cardSvgs.JH; }
function getSvgKing() { return __cardSvgs.KH; }
function getSvgQueen() { return __cardSvgs.QH; }
function getSymbolPositions1(rank) {
  const positions = {
    "A": [[0, 0]],
    "2": [[0, -70], [0, 70]],
    "3": [[0, -90], [0, 0], [0, 90]],
    "4": [[-50, -90], [50, -90], [-50, 90], [50, 90]],
    "5": [[-50, -90], [50, -90], [0, 0], [-50, 90], [50, 90]],
    "6": [
      [-50, -90], [50, -90],
      [-50, 0], [50, 0],
      [-50, 90], [50, 90]
    ],
    "7": [
      [-50, -110], [50, -110],
      [-50, -40], [50, -40],
      [0, 40],
      [-50, 110], [50, 110]
    ],
    "8": [
      [-50, -110], [50, -110],
      [-50, -40], [50, -40],
      [-50, 40], [50, 40],
      [-50, 110], [50, 110]
    ],
    "9": [
      [-50, -110], [50, -110],
      [0, -70],
      [-50, -20], [50, -20],
      [-50, 40], [50, 40],
      [0, 110]
    ],
    "10": [
      [-50, -110], [50, -110],
      [-50, -70], [50, -70],
      [-50, -10], [50, -10],
      [-50, 50], [50, 50],
      [-50, 110], [50, 110]
    ],
    "J": [],
    "Q": [],
    "K": [],
  };
  return positions[rank];
}
function getTable() { assertion(!Tid, `getTable!!! ${T.id} !!! ${Tid}`); return T; }
async function getTableNames() {
  const names = await api('GET', '/get_table_names');
  console.log(names);
}
function getTessagonDict() {
  return {
    BigHexTriTessagon: BigHexTriTessagon,
    BrickTessagon: BrickTessagon,
    CloverdaleTessagon: CloverdaleTessagon,
    DissectedHexQuadTessagon: DissectedHexQuadTessagon,
    DissectedHexTriTessagon: DissectedHexTriTessagon,
    DissectedSquareTessagon: DissectedSquareTessagon,
    DissectedTriangleTessagon: DissectedTriangleTessagon,
    DodecaTessagon: DodecaTessagon,
    DodecaTriTessagon: DodecaTriTessagon,
    FloretTessagon: FloretTessagon,
    HexBigTriTessagon: HexBigTriTessagon,
    HexSquareTriTessagon: HexSquareTriTessagon,
    HexTessagon: HexTessagon,
    HexTriTessagon: HexTriTessagon,
    IslamicHexStarsTessagon: IslamicHexStarsTessagon,
    IslamicStarsCrossesTessagon: IslamicStarsCrossesTessagon,
    OctoTessagon: OctoTessagon,
    PentaTessagon: PentaTessagon,
    Penta2Tessagon: Penta2Tessagon,
    PythagoreanTessagon: PythagoreanTessagon,
    RhombusTessagon: RhombusTessagon,
    SquareTessagon: SquareTessagon,
    SquareTriTessagon: SquareTriTessagon,
    SquareTri2Tessagon: SquareTri2Tessagon,
    StanleyParkTessagon: StanleyParkTessagon,
    TriTessagon: TriTessagon,
    ValemountTessagon: ValemountTessagon,
    WeaveTessagon: WeaveTessagon,
    ZigZagTessagon: ZigZagTessagon,
  };
}
function getTexture(name, repeat = true) { return `url(../assets/texrepeat/${name})`; }
async function getTextureFiles(dirList) {
  let list = [];
  for (const dir of dirList) {
    let files = await getTextures(dir);
    list = list.concat(files.map(x => ({ dir, file: x })));
  }
  list = sortBy(list, 'file');
  return list;
}
async function getTextures(dir = 'textures') {
  let res = await mGetFiles(`assets/${dir}`);
  let filenames = M[dir] = res.filesInfo.map(x => x.name);
  return filenames;
}
async function getTexturesForThemeEditor() {
  let all = await getTextureFiles(['texwall']);
  let textures = [];
  for (const o of all) {
    let file = stringBefore(o.file, '.');
    let num = allNumbers(file);
    if (!isEmpty(num)) continue;
    textures.push(o);
  }
  let rep = await getTextureFiles(['texrepeat']);
  let wennhell = 'mosaic illusion knitted argyle linnen cube fabric muster puzzle leaves owl wood arabic';
  let wenndunkel = 'leaves owl arabic food blaett diam texti escher knitted korb maze carbon wellen alumi trans0 food circ subtle-grey kreuz scribble squar stitch tapete xv';
  let theme = DA.theme;
  let list = colorIdealText(theme.color) == 'white' ? wenndunkel : wennhell;
  list = toWords(list)
  for (const o of rep) {
    if (list.some(x => o.file.includes(x))) {
      textures.push(o);
    }
  }
  return textures;
}
async function getTopColors(imgUrl, topN = 10, sampleSize = 100) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // allow cross-origin images
    img.src = imgUrl;
    img.onload = () => {
      const scale = Math.min(sampleSize / img.width, sampleSize / img.height, 1);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h).data;
      const colorCount = {};
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const rq = Math.round(r / 16) * 16;
        const gq = Math.round(g / 16) * 16;
        const bq = Math.round(b / 16) * 16;
        const color = `${rq},${gq},${bq}`;
        colorCount[color] = (colorCount[color] || 0) + 1;
      }
      const sortedColors = Object.entries(colorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([color]) => `rgb(${color})`);
      resolve(sortedColors);
    };
    img.onerror = reject;
  });
}
async function getTopColorsThief(url, topN = 10, sampleSize = 100) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(img, topN);
      resolve(palette);
    };
    img.onerror = reject;
    img.src = url;
  });
}
async function getTopColorsThiefOpt(url, topN = 10, sampleSize = 100) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      try {
        const scale = Math.min(sampleSize / img.width, sampleSize / img.height, 1);
        const w = Math.floor(img.width * scale);
        const h = Math.floor(img.height * scale);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const resizedImg = new Image();
        resizedImg.onload = () => {
          try {
            const colorThief = new ColorThief();
            const palette = colorThief.getPalette(resizedImg, topN);
            resolve(palette);
          } catch (err) {
            reject(err);
          }
        };
        resizedImg.onerror = reject;
        resizedImg.src = canvas.toDataURL();
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
function getTurnPlayers(table) {
  return arrMinus(table.turn, table.pending).join(', ');
}
function getTypeOf(param) {
  let type = typeof param;
  if (type == 'string') {
    return 'string';
  }
  if (type == 'object') {
    type = param.constructor.name;
    if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
    else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
  }
  let lType = type.toLowerCase();
  if (lType.includes('event')) type = 'event';
  return type;
}
function getUID(pref = '') {
  UIDCounter += 1;
  return pref + '_' + UIDCounter;
}
function getUname() { return U.name; }
function getWaitingHtml(sz = 30) { return `<img src="../assets/icons/active_player.gif" height="${sz}" style="margin:0px ${sz / 3}px" />`; }
function getXYKey(x, y) { return [x, y]; }
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
function get_next_player(table, uname) {
  let plorder = table.plorder;
  let iturn = plorder.indexOf(uname);
  let nextplayer = plorder[(iturn + 1) % plorder.length];
  return nextplayer;
}
function get_screen_distance(child, newParent) {
  child = toElem(child);
  newParent = toElem(newParent);
  let rChild = child.getBoundingClientRect();
  let rNewParent = newParent.getBoundingClientRect();
  return [rNewParent.left - rChild.left + 50, rNewParent.top - rChild.top];
}
function get_splay_number(wsplay) { return wsplay == 'none' ? 0 : wsplay == 'left' ? 1 : wsplay == 'right' ? 2 : wsplay == 'up' ? 3 : 4; }
function get_user_pic(uname, sz = 50, border = 'solid medium white') {
  let html = get_user_pic_html(uname, sz, border);
  return mCreateFrom(html);
}
function get_user_pic_html(uname, sz = 50, border = 'solid medium white') {
  return `<img src='../assets/img/users/${M.users[uname].imgKey}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0px 4px;border:${border}'>`
}
function globalKeyHandling() {
  DA.hotkeys = {};
  DA.keysToCheck = {};
  document.addEventListener('keydown', keyDownHandler);
  document.addEventListener('keyup', keyUpHandler);
  document.addEventListener('keydown', hotkeyHandler);
}
function grayShades(n) {
  const shades = [];
  for (let i = 0; i < n; i++) {
    const v = Math.round(255 - (i * 255 / (n - 1)));
    const hex = v.toString(16).padStart(2, '0');
    shades.push(`#${hex}${hex}${hex}`);
  }
  return shades;
}
function gtCopy(table) {
  let newTable = jsCopy(table);
  newTable.oldfen = jsCopy(table.fen);
  return newTable;
}
function gtDefault() {
  function setup(table) { stdSetupGame(table); }
  async function process(uname, table, key) { }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(me, table);
    stdStatsScore(me, table);
    let dButton = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `${table.step}` })
    return { dTable, dButton, refresh: true };
  }
  function activate(me, table, ui) { }
  return { setup, process, present, activate };
}
function gtInitFuncs() {
  DA.funcs = { aristo, badger, bluff, dinogame, dodogame, emoticount, setgame, simplegame, spotit };
  for (const gname of DA.gamelist) {
    if (isdef(DA.funcs[gname])) continue;
    DA.funcs[gname] = gtDefault;
  }
}
function gtOverWinners(newTable) {
  newTable.fen.winners = getPlayersWithMaxScore(newTable);
  newTable.status = 'over';
  newTable.turn = [];
}
async function gtSendMove() { }
function gtSetToStarted(table) {
  DA.funcs[table.game]().setup(table);
  table.status = 'started';
  table.step = 0;
  delete table.oldfen;
  assertion(table.turn)
  return table;
}
async function gtShow() {
  if (!DA.tid) { await switchToMenu('games'); showMessage('table missing!!!', 4000); return; }
  let table = T = DAGetTable(DA.tid);
  F = T.fen;
  let me = U.name;
  assertion(me == U.name);
  let func = DA.func = DA.funcs[table.game]();
  let ui = DA.ui = await func.present(me, table);
  if (TESTING && table.game == 'setgame') func.setFindAllSets(ui.items); //.map(x=>console.log(x[0],x[1],x[2]));
  if (ui.refresh) mFall('dTable', 400);
  if (table.status == 'over') {
    showGameover(table);
  } else if (table.status == 'started' && table.plorder.includes(me)) {
    A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: M.config.autosubmit };
    await func.activate(me, table, ui);
  }
}
function hFunc(content, funcname, arg1, arg2, arg3) {
  let html = `<a style='color:blue' href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
  return html;
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
function handleVisibilityChange() {
  if (document.visibilityState === "hidden") {
    console.log('HIDDEN!!!')
    if (pollIsOn()) DA.pollHidden = true;
    pollOff();
  } else if (DA.pollHidden) {
    console.log('VISIBLE!!!');
    delete DA.pollHidden;
    pollOn(true);
  }
}
function hasBuildings(pl) {
  return Object.values(pl.buildings).some(buildingList => buildingList.length > 0);
}
function hasSkinTone(emojiCodeString) {
  return emojiCodeString
    .toLowerCase()
    .split('_')
    .some(cp => {
      const code = parseInt(cp, 16);
      return code >= 0x1F3FB && code <= 0x1F3FF;
    });
}
function heritage_card_deco(card) {
  let d = iDiv(card); mStyle(d, { position: 'relative' });
  let d1 = mDiv(d, { fg: 'silver', fz: 11, family: 'tangerine', position: 'absolute', right: '36%', top: 1 }, null, 'heritage');
}
function hex1Centers(rows, cols, wCell = 100, hCell = null) {
  let colarr = _calc_hex_col_array(rows, cols);
  let maxcols = arrMax(colarr);
  if (nundef(hCell)) hCell = (hCell / .866);
  let hline = hCell * .75;
  let offX = wCell / 2, offY = hCell / 2;
  let centers = [];
  let x = 0; y = 0;
  for (let r = 0; r < colarr.length; r++) {
    let n = colarr[r];
    for (let c = 0; c < n; c++) {
      let dx = (maxcols - n) * wCell / 2;
      let dy = r * hline;
      let center = { x: dx + c * wCell + offX, y: dy + offY };
      centers.push(center);
    }
  }
  return [centers, wCell * maxcols, hCell / 4 + rows * hline];
}
function hexBoardCenters(topside, side) {
  if (nundef(topside)) topside = 4;
  if (nundef(side)) side = topside;
  let [rows, maxcols] = [side + side - 1, topside + side - 1];
  assertion(rows % 2 == 1, `hex with even rows ${rows} top:${topside} side:${side}!`);
  let centers = [];
  let cols = topside;
  let y = 0.5;
  for (i of range(rows)) {
    let n = cols;
    let x = (maxcols - n) / 2 + .5;
    for (const c of range(n)) {
      centers.push({ x, y, row: i + 1, col: x * 2 }); x++;
    }
    y += .75
    if (i < (rows - 1) / 2) cols += 1; else cols -= 1;
  }
  assertion(cols == topside - 1, `END OF COLS WRONG ${cols}`)
  return { centers, rows, maxcols };
}
function hexCenters(rows, cols, wCell = 100, hCell) {
  if (nundef(hCell)) hCell = (hCell / .866);
  let hline = hCell * .75;
  let offX = wCell / 2, offY = hCell / 2;
  let centers = [];
  let startSmaller = Math.floor(rows / 2) % 2 == 1;
  let x = 0; y = 0;
  for (let r = 0; r < rows; r++) {
    let isSmaller = startSmaller && r % 2 == 0 || !startSmaller && r % 2 == 1;
    let curCols = isSmaller ? cols - 1 : cols;
    let dx = isSmaller ? wCell / 2 : 0;
    dx += offX;
    for (let c = 0; c < curCols; c++) {
      let center = { x: dx + c * wCell, y: offY + r * hline };
      centers.push(center);
    }
  }
  return [centers, wCell * cols, hCell / 4 + rows * hline];
}
function hexFromCenter(dParent, center, styles = {}, opts = {}) {
  let [w, h] = mSizeSuccession(styles, 40);
  let [left, top] = [center.x - w / 2, center.y - h / 2];
  let d = mDom(dParent, { w, h, position: 'absolute', left, top, 'clip-path': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }, opts);
  mStyle(d, styles);
  return d;
}
function hexToHsl(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map(x => x + x).join("");
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60);
  }
  return { h, s: +(s * 100).toFixed(1), l: +(l * 100).toFixed(1) };
}
function hide(elem) {
  if (isString(elem)) elem = document.getElementById(elem);
  if (nundef(elem)) return;
  if (isSvg(elem)) {
    elem.setAttribute('style', 'visibility:hidden;display:none');
  } else {
    elem.style.display = 'none';
  }
}
function highlightHotspots(ev) {
  let [x, y] = [ev.clientX, ev.clientY];
  let els = allElementsFromPoint(x, y);
  let endPoints = [], possiblePairs = [];
  for (const elem of els) {
    let p = B.hotspotDict[elem.id];
    if (isdef(p)) {
      addIf(endPoints, p.start);
      addIf(endPoints, p.end);
      let pair = [p.start, p.end]; pair.sort();
      addIf(possiblePairs, pair.join(','));
    }
  }
  stopPulsing(endPoints);
  startPulsing(endPoints);
  B.endPoints = endPoints;
  B.selectedPoints = [];
  B.possiblePairs = possiblePairs;
}
function highlightPlayerItem(item) {
  let c = M.users[item.name].color;
  let hsl = hexToHsl(c);
  let cb = hsl.l > 50 ? colorDark(c, 50) : c;
  mStyle(iDiv(item), { bg: c, outline: `1px solid ${cb}` });
}
function historyAddLines(lines, title = '', fen) {
  if (nundef(fen.history)) fen.history = [];
  if (isString(lines)) lines = [lines];
  fen.history.push({ title: title, lines: lines });
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
        let pl = players[w];
        let bg = pl.color;
        let fg=colorIdealText(bg);
        if (fg == 'black') bg = colorDark(bg, 60); 
        // console.log(fg,bg,fg=='white',w);
        html += `<span style="color:${bg};font-weight:bold"> ${w} </span>`;
      } else html += ` ${w} `;
    }
    if (lines.length > 1) html = html.trim() + (l == arrLast(lines) ? '.' : ', ');
  }
  html += "</div>";
  return html;
}
function historyShow(table, dParent) {
  let [fen, players] = [table.fen, table.players];
  mStyle(dParent, { w: 200 });
  if (!isEmpty(fen.history)) {
    let html = '';
    for (const o of jsCopy(fen.history).reverse()) {
      html += historyBeautify(o.lines, o.title, table);
    }
    let bg = colorLight('#EDC690', 50);
    let dHistory = mDom(dParent, { padding: 8, box: true, bg, margin: 8 }, { html });
  }
}
function hotkeyActivate(key, handler) { lookupSetOverride(DA, ['hotkeys', key], handler); }
function hotkeyDeactivate(key) { delete DA.hotkeys[key]; }
function hotkeyHandler(ev) {
  let k = ev.key;
  let handler = lookup(DA, ['hotkeys', ev.key]);
  if (handler) { handler(ev); }
}
function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function iAdd(item, liveprops = {}, addprops = {}) {
  let id, l;
  if (isString(item)) { id = item; item = valf(Items[id], {}); }
  let el = valf(liveprops.div, liveprops.ui, iDiv(item), null);
  id = valnwhite(addprops.id, item.id, (el ? el.id : getUID()), getUID());
  item.id = id; if (nundef(Items[id])) Items[id] = item; if (el) el.id = id;
  if (nundef(item.live)) item.live = {};
  l = item.live;
  for (const k in liveprops) {
    let val = liveprops[k];
    if (nundef(val)) { continue; }
    l[k] = val;
    if (isdef(val.id) && val.id != id) { lookupAddIfToList(val, ['memberOf'], id); }
  }
  if (isdef(addprops)) copyKeys(addprops, item);
  return item;
}
function iDiv(i) {
  return valf(i.div, isdef(i.live) ? i.live.div : i.ui, i);
}
function iHigh(item) { let d = iDiv(item); mStyle(d, { bg: 'darkgray' }); }
function iRegister(item, id) { let uid = isdef(id) ? id : getUID(); Items[uid] = item; return uid; }
function iUnhigh(item) { let d = iDiv(item); mStyle(d, { bg: 'transparent' }); }
function ignoreDoubleClick(el, handler, delay = 400) {
  let lastClickTime = 0;
  el.addEventListener("click", e => {
    const now = Date.now();
    if (now - lastClickTime < delay) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    lastClickTime = now;
    handler(e);
  });
}
async function ilAddGadget(ev) {
  let dParent = DA.currentPage;
  let list = ['image', 'page', 'text'];
  let item = await mGather(mSelect, ev.target, {}, { list }); 
  if (item == 'image') {
    return mImageDropper(dParent);
  } else if (item == 'text') {
    let bg = rChoose(DA.palette);
    let fg = colorIdealText(bg);
    let d2 = mDom(dParent, { align: 'left', padding: 10, rounding: 10, matop: 10, fz: 20, caret: fg, fg, bg }, { html: '', contenteditable: true });
    d2.focus();
    d2.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        d2.blur();
      }
    });
    return d2;
  } else if (item == 'page') {
    let d2 = mDom(dParent, { align: 'left', padding: 10, rounding: 10, matop: 10, fz: 20, caret: fg, fg, bg }, { html: '', contenteditable: true });
    d2.focus();
    d2.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        d2.blur();
      }
    });
    return d2;
  }
}
async function ilNewPage() {
  clearMain();
  let bg = rChoose(DA.palette);
  let fg = colorIdealText(bg);
  let d = DA.currentPage = mDom('dMain', { padding: 10, w: 500, align: 'center' });
}
async function imgAsIsInDiv(url, dParent) {
  let d = mDom(dParent, { bg: 'pink', wmin: 128, hmin: 128, display: 'inline-block', align: 'center', margin: 10 }, { className: 'imgWrapper' });
  let sz = 300;
  let img = await imgAsync(d, {}, { tag: 'img', src: url });
  let [w, h] = [img.width, img.height]; 
  let scale = sz / img.height;
  return [img, scale];
}
function imgAsync(dParent, styles, opts) {
  let path = opts.src;
  delete opts.src;
  addKeys({ tag: 'img' }, opts); //if forget
  return new Promise((resolve, reject) => {
    const img = mDom(dParent, styles, opts);
    img.onload = () => {
      resolve(img);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = path;
  });
}
async function imgCrop(img, dc, wOrig, hOrig) {
  let dims = mGetStyles(dc, ['left', 'top', 'w', 'h']); //console.log('dims', dims);
  let wScale = img.width / wOrig;
  let hScale = img.height / hOrig;
  console.log('scale', wScale, hScale, wOrig, hOrig, img.width, img.height)
  let d1 = mDom(document.body, { margin: 10 });
  let canvas = mDom(d1, {}, { tag: 'canvas', width: dims.w, height: dims.h });
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, dims.left / wScale, dims.top / hScale, (dims.w) / wScale, img.height / hScale, 0, 0, dims.w, dims.h)
}
async function imgScaledToHeightInDiv(url, dParent, sz = 300) {
  let d = mDom(dParent, { bg: 'pink', wmin: 128, hmin: 128, display: 'inline-block', align: 'center', margin: 10 }, { className: 'imgWrapper' });
  let img = await imgAsync(d, {}, { tag: 'img', src: url });
  let [w, h] = [img.width, img.height];
  let scale = sz / img.height;
  img.width *= scale;
  img.height *= scale;
  mStyle(img, { w: img.width, h: img.height })
  return [img, scale];
}
function imgToDataUrl(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl;
}
function infoToItem(x) { let item = { info: x, key: x.key }; item.id = iRegister(item); return item; }
function initUI() {
  mClear('dPage');
  let x = mLayoutTLM('dPage', {}, { wcol: 0, registerDivs: true, shade: false });//assertion(false,'THE END')
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
function injectStripedPattern(color) {
  const patternId = `striped-${color.replace('#', '')}`;
  if (document.getElementById(patternId)) return patternId;
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById('svgDefsGlobal');
  const defs = svg.querySelector('defs') || (() => {
    const d = document.createElementNS(svgNS, 'defs');
    svg.appendChild(d);
    return d;
  })();
  const pattern = document.createElementNS(svgNS, 'pattern');
  applyOpts(pattern, { id: patternId, patternUnits: 'userSpaceOnUse', width: 4, height: 4, patternTransform: 'rotate(45)' });
  pattern.innerHTML = `<path d="M-1,1 H5" style="stroke:${color}; stroke-width:1" />`;
  defs.appendChild(pattern);
  return patternId;
}
function inpToChecklist(ev, grid) {
  let key = ev.key;
  let inp = ev.target;
  if (key == 'Backspace') {
    let s = inp.value;
    let cursorPos = inp.selectionStart;
    let ch = cursorPos == 0 ? null : inp.value[cursorPos - 1];
    if (!ch || isWhiteSpace(ch)) {
      doYourThing(inp, grid);
    }
    console.log('Backspace', ch);
    return;
  }
  if (key == 'Enter') ev.preventDefault();
  if (isExpressionSeparator(key) || key == 'Enter') doYourThing(inp, grid);
}
function input_to_anzeige1(me, table, ui, caption, index) {
  let [fen, pl] = [table.fen, table.players[me]];
  const di = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
  let bid = fen.newbid;
  if (index == 0) {
    bid[0] = Number(caption);
    if (bid[0] == 0) {
      bid[0] = '_'; bid[1] = '_';
    } else if (bid[1] == '_') {
      let hand = pl.hand;
      let c1 = arrLast(hand);
      let r = c1[0];
      if (r == '2') r = bid[3] == 'ace' ? 'K' : 'A';
      if (di[r] == bid[3]) bid[1] = bid[3] == 'three' ? 'four' : 'three'; else bid[1] = di[r];
    }
  } else if (index == 1) {
    bid[1] = di[caption];
    if (bid[0] == '_') bid[0] = 1;
    if (bid[3] == bid[1]) { bid[0] = bid[0] + bid[2]; bid[2] = bid[3] = '_'; }
  } else if (index == 2) {
    bid[2] = Number(caption);
    if (bid[2] == 0) {
      bid[2] = '_'; bid[3] = '_';
    } else if (bid[3] == '_') {
      let hand = pl.hand;
      let c1 = hand[0];
      let r = c1[0];
      if (r == '2') r = bid[1] == 'ace' ? 'K' : 'A';
      if (di[r] == bid[1]) bid[3] = bid[1] == 'three' ? 'four' : 'three'; else bid[3] = di[r];
    }
  } else {
    bid[3] = di[caption];
    if (bid[2] == '_') bid[2] = 1;
    if (bid[3] == bid[1]) { bid[0] = bid[0] + bid[2]; bid[1] = bid[3]; bid[2] = bid[3] = '_'; }
  }
  for (let i = 0; i < 4; i++)  iDiv(ui.panelItems[i]).innerHTML = bid[i];
}
function intersection(arr1, arr2) {
  let res = [];
  for (const a of arr1) {
    if (arr2.includes(a)) {
      addIf(res, a);
    }
  }
  return res;
}
function invalidateTables() { DA.tableDict = null; }
function invertColor(input) {
  input = colorFrom(input);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex2 = (n) => n.toString(16).padStart(2, "0");
  const hexMatch = input.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex.split("").map((c) => c + c).join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const ir = toHex2(255 - r);
    const ig = toHex2(255 - g);
    const ib = toHex2(255 - b);
    return `#${ir}${ig}${ib}`;
  }
}
function isAlphaNum(s) { query = /^[a-zA-Z0-9]+$/; return query.test(s); }
function isBetween(n, a, b) { return n >= a && n <= b }
function isBusy() { return DA.sysState == 'busy'; }
function isColor(s) { return isdef(M.colorByName[s]) || s.length == 7 && s[0] == '#'; }
function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }
function isDigit(s) { return /^[0-9]$/i.test(s); }
function isEmpty(arr) {
  return arr === undefined || !arr
    || (isString(arr) && (arr == 'undefined' || arr == ''))
    || (Array.isArray(arr) && arr.length == 0)
    || Object.entries(arr).length === 0;
}
function isExpressionSeparator(ch, charsAllowed) { return ',-.!?;:'.includes(ch); }
function isFilename(s) { return s.includes('../'); }
function isKeyDown(key) { return lookup(DA.keysToCheck, [key]); }
function isLetter(s) { return /^[a-zA-Z]$/i.test(s); }
function isLightAfter(ctx, x, y) {
  for (let p = x + 1; p < x + 4; p++) if (isPixLight(ctx, p, y)) return true;
  return false;
}
function isLightAfterV(ctx, x, y) {
  for (let p = y + 1; p < y + 5; p++) if (isPixLight(ctx, x, p)) return true;
  return false;
}
function isLightBefore(ctx, x, y) {
  for (let p = x - 4; p < x - 1; p++) if (isPixLight(ctx, p, y)) return true;
  return false;
}
function isLightBeforeV(ctx, x, y) {
  for (let p = y - 4; p < y - 1; p++) if (isPixLight(ctx, x, p)) return true;
  return false;
}
function isList(arr) { return Array.isArray(arr); }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isMergeableObject(val) {
  var nonNullObject = val && typeof val === 'object'
  return nonNullObject
    && Object.prototype.toString.call(val) !== '[object RegExp]'
    && Object.prototype.toString.call(val) !== '[object Date]'
}
function isMyTurn(uname, table) { return table.turn.includes(uname) }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isNumeric(x) { return !isNaN(+x); }
function isObject(item) { return item && typeof item === 'object' && !Array.isArray(item); }
function isPix(ctx, x, y, color, delta = 10) {
  let rgb = colorHexToRgbObject(colorFrom(color));
  let p = getPixRgb(ctx, x, y);
  let found = isWithinDelta(p.r, rgb.r, delta) && isWithinDelta(p.g, rgb.g, delta) && isWithinDelta(p.b, rgb.b, delta);
  return found ? p : null;
}
function isPixDark(ctx, x, y) {
  var pix = ctx.getImageData(x, y, 1, 1).data;
  var red = pix[0]; var green = pix[1]; var blue = pix[2];
  return green < 100 && blue < 100;
}
function isPixLight(ctx, x, y) {
  var pix = ctx.getImageData(x, y, 1, 1).data;
  var red = pix[0]; var green = pix[1]; var blue = pix[2];
  return red + green + blue > 520;
}
function isPlayerHuman(table, name) { return table.players[name].playmode != 'bot'; }
function isSameDate(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
}
async function isServerRunning(which = 'flask', remote = false) {
  let url = remote ? 'https://moxito.online/' : 'http://localhost:5000/';
  url += which == 'flask' ? 'flaskgame0/' : 'node';
  console.log('checking url', url);
  try {
    const res = await fetch(url, {
      mode: 'no-cors',
    });
    console.log('res', res);
    return res.ok ? true : null;
  } catch (err) {
    return null;
  }
}
function isSet(x) { return (isDict(x) && (x.set || x._set)); }
function isString(param) { return typeof param == 'string'; }
function isSvg(elem) { return startsWith(elem.constructor.name, 'SVG'); }
function isTimeForAddon() {
  if (nundef(ADS)) return false;
  if (isEmpty(U.avAddons)) return false;
  if (isdef(AD) && AD.running && AD.checkEndCondition()) {
    console.log('END!')
    AD.die();
    U.addons[AD.key].open = false;
    AD = null;
  }
  if (isdef(AD)) return AD.isTimeForAddon();
  let open = allCondDict(U.addons, x => x.open == true);
  if (isEmpty(open)) {
    console.log('open is empty! choosing a random addon!')
    let k = chooseRandom(U.avAddons);
    AD = new ADS[k].cl(k, ADS[k], {});
  } else if (open.length == 1) {
    let k = open[0];
    AD = new ADS[k].cl(k, ADS[k], U.addons[k]);
  } else {
    let k = chooseRandom(open);
    AD = new ADS[k].cl(k, ADS[k], U.addons[k]);
  }
  return AD.isTimeForAddon();
}
function isWhiteSpace(s) { let white = new RegExp(/^\s$/); return white.test(s.charAt(0)); }
function isWithinDelta(n, goal, delta) { return isBetween(n, goal - delta, goal + delta) }
function is_bid_higher_than(bid, oldbid) {
  bid = jsCopy(bid);
  if (bid[0] == '_') bid[0] = 0;
  if (bid[2] == '_') bid[2] = 0;
  if (oldbid[0] == '_') oldbid[0] = 0;
  if (oldbid[2] == '_') oldbid[2] = 0;
  let higher = bid[0] > oldbid[0]
    || bid[0] == oldbid[0] && is_higher_ranked_name(bid[1], oldbid[1])
    || bid[0] == oldbid[0] && bid[1] == oldbid[1] && bid[2] > oldbid[2]
    || bid[0] == oldbid[0] && bid[1] == oldbid[1] && bid[2] == oldbid[2] && is_higher_ranked_name(bid[3], oldbid[3]);
  return higher;
}
function is_card_key(ckey, rankstr = '*A23456789TJQK', suitstr = 'SHCD') {
  return is_nc_card(ckey) || is_color(ckey) || rankstr.includes(ckey[0]) && suitstr.includes(ckey[1]);
}
function is_color(s) { return isdef(M.colorByName[s.toLowerCase()]); }
function is_higher_ranked_name(f1, f2) {
  let di2 = { _: 0, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, jack: 11, queen: 12, king: 13, ace: 14 };
  return di2[f1] > di2[f2];
}
function is_joker(card) { return is_jolly(card.key); }
function is_jolly(ckey) { return ckey[0] == '*'; }
function is_nc_card(ckey) { return ckey.includes('_'); }
function isdef(x) { return x !== null && x !== undefined && x !== 'undefined'; }
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
function jsCopy(o) { return JSON.parse(JSON.stringify(o)); }
function jsCopyExceptKeys(o, keys = []) {
  if (!isDict(o)) return jsCopy(o);
  let onew = {};
  for (const k in o) { if (keys.includes(k)) continue; onew[k] = o[k]; }
  return JSON.parse(JSON.stringify(onew));
}
function jsonToYaml(o) { let y = jsyaml.dump(o); return y; }
function keyDownHandler(ev) { DA.keysToCheck[ev.key] = true; }
function keyUpHandler(ev) { delete DA.keysToCheck[ev.key]; }
function lacuna() {
  function setup(table) {
    let opts = table.options;
    opts = { numPoints: 10, numColors: 2, numMeeples: 1 };
    let n = opts.numPoints;
    let neach = opts.numPoints / opts.numColors;
    let points = lacunaGenerateFenPoints(n, neach, 1000, 1000);
    let fen = { points };
    for (const name in table.players) {
      let pl = table.players[name];
      pl.score = 0;
      pl.positions = [];
      pl.flowers = {};
      for (const c of range(opts.numColors)) { pl.flowers[c] = 0; }
    }
    fen.meeples = [];
    table.plorder = jsCopy(Object.keys(table.players));
    table.turn = [rChoose(Object.keys(table.players))];
    return fen;
  }
  function stats(table) {
    let [me, players] = [getUname(), table.players];
    let style = { patop: 8, mabottom: 20, wmin: 80, bg: 'beige', fg: 'contrast' };
    let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'colflex', style)
    for (const plName in players) {
      let pl = players[plName];
      let item = player_stat_items[plName];
      if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
      let d = iDiv(item); mCenterFlex(d); mLinebreak(d); mIfNotRelative(d);
      for (const c in pl.flowers) {
        let n = pl.flowers[c];
        statsCount(c, n, d);
      }
      if (table.turn.includes(plName)) { mDom(d, { position: 'absolute', left: -3, top: 0 }, { html: getWaitingHtml() }); }
    }
  }
  function present(table) {
    let fen = table.fen;
    console.log(table.fen, table.players);
    B = {};
    let dTable = presentBgaRoundTable();
    B.points = lacunaPresentPoints(fen.points, dTable);
  }
  function muell(table) {
    let [w, h, sz, n, neach, points, meeples] = [fen.w, fen.h, fen.sz, fen.n, fen.neach, jsCopy(fen.points), jsCopy(fen.meeples)];
    let padding = 20;
    mStyle(dTable, { bg: 'midnight_purple', position: 'relative', padding, wmin: w + 2 * padding, hmin: h + 2 * padding });
    let dParent = B.dParent = mDom(dTable, { w, h, position: 'absolute', left: 2 * padding, top: 2 * padding }, { id: 'dCanvas' });
    B.points = points;
    B.sz = sz;
    B.diPoints = lacunaDrawPoints(dParent, points);
    B.meeples = meeples;
    B.diMeeples = lacunaDrawPoints(dParent, meeples);
    return B.points;
  }
  async function activate(table, items) {
    if (!isMyTurn(table)) return;
    setInstruction('must place a meeple'); //browser tab and instruction if any
    console.log('AAAAAAAAAAAAAAAA')
    return;
    setTimeout(() => lacunaStartMove(), 10);
  }
  return { setup, present, stats, activate, hasInstruction: true };
}
function lacunaColorName(val) {
  let clist = { red: "#E63946", green: "#06D6A0", blue: "#118AB2", cyan: "#0F4C75", magenta: "#D81159", yellow: "#FFD166", orange: "#F4A261", purple: "#9D4EDD", pink: "#FF80AB", brown: "#8D6E63", lime: "#A7FF83", indigo: "#3A0CA3", violet: "#B5838D", gold: "#F5C518", teal: "#008080" };
  for (const k in clist) {
    if (val == clist[k]) return k;
  }
  return 'unknown';
}
function lacunaColors() {
  let clist = { red: 'crimson', green: "#00ff00", blue: "#0000ff", cyan: "#00ffff", yellow: "#FFD166", pink: "#FF80AB", orange: "#F4A261", purple: "#9D4EDD", brown: "#8D6E63", lime: "#A7FF83", indigo: "#3A0CA3", violet: "#B5838D", gold: "#F5C518", teal: "#008080", magenta: "#D81159" };
  return Object.values(clist);
}
function lacunaDrawPoints(dParent, points, addLabel = true) {
  let items = [];
  for (const p of points) {
    let html = isdef(p.owner) && addLabel ? p.owner[0].toUpperCase() : ''; //p.id.substring(1) : ''
    let d1 = p.div = mDom(dParent, { round: true, left: p.x, top: p.y, w: p.sz, h: p.sz, position: 'absolute', bg: p.bg, align: 'center', fg: 'contrast' }, { html, id: p.id });
    d1.style.cursor = 'default';
    if (isdef(p.border)) mStyle(d1, { outline: `solid ${p.border} 4px` });
    let rect = getRect(d1);
    p.cx = p.x + p.sz / 2; p.cy = p.y + p.sz / 2;
    p.xPage = rect.x; p.yPage = rect.y;
    p.cxPage = rect.x + p.sz / 2; p.cyPage = rect.y + p.sz / 2;
    items[p.id] = p;
  }
  return items;
}
async function lacunaGameover() {
  showMessage('Game over');
  console.log('Game over');
  let [fen, players] = [T.fen, T.players];
  for (const p of fen.points) {
    let closestMeeple = findClosestMeeple(p);
    if (closestMeeple) {
      let owner = closestMeeple.owner;
      players[owner].flowers[p.bg] += 1;
      p.owner = owner;
    }
  }
  for (const plName of Object.keys(T.players)) {
    let pl = T.players[plName];
    for (const f in pl.flowers) pl.score += pl.flowers[f];
  }
  let table = T;
  table.fen.winners = getPlayersWithMaxScore(table);
  table.status = 'over';
  table.turn = [];
  let id = table.id;
  let name = getUname();
  let step = table.step;
  let o = { id, name, step, table };
  let res = await mPostRoute('table', o); //console.log(res);
}
function lacunaGenerateFenPoints(n, nColors, w = 1000, h = 1000, rand = .8) {
  let pts = generateRandomPointsRound(n, w, h, rand);
  return pts.map(p => `${p.x}_${p.y}_${rChoose(range(nColors))}`); //.join(' ');
}
function lacunaGeneratePoints(w, h, n = 49, neach = 7, sz = 10, rand = .7, round = false) {
  let clist = lacunaColors();
  let points = round ? generateRandomPointsRound(n, w, h, rand) : generateRandomPointsRect(n, w, h, rand);
  let colors = generateRepeatedColors(n, neach, clist); arrShuffle(colors);
  for (let i = 0; i < n; i++) { points[i].bg = colors[i]; points[i].sz = sz; points[i].id = getUID(); }
  return points;
}
function lacunaMakeSelectableME() {
  for (const id of B.endPoints) {
    let div = mBy(id);
    mClass(div, 'selectable')
    div.onclick = ev => lacunaSelectPointME(ev);
  }
}
async function lacunaMoveComplete(idlist) {
  console.log('lacunaMoveComplete', idlist); return idlist;
  let [fen, players, me, table] = [T.fen, T.players, T.players[getUname()], T]
  B.endPoints.map(x => lacunaUnselectable(x));
  showMessage(`________Move completed, removing ${idlist}`);
  assertion(idlist.length == 2 || idlist.length == 0, `WTF3!!! ${idlist.length}`);
  if (idlist.length == 2) {
    fen.points = fen.points.filter(x => x.id != idlist[0] && x.id != idlist[1]);
    let color = B.diPoints[idlist[0]].bg;
    let flower = lacunaColorName(color);
    let n = lookup(me, ['flowers', color]);
    lookupSetOverride(me, ['flowers', color], n ? n + 2 : 2);
  }
  let nextPlayer = findPlayerWithMeeplesLeft(getUname());
  if (nextPlayer) {
    table.turn = [nextPlayer];
    let o = { id: table.id, name: me, step: table.step + 1, table };
    let res = await mPostRoute('table', o); //console.log(res);
  } else await lacunaGameover();
}
async function lacunaMoveCompletedME(idlist) {
  let [fen, players, me, table] = [T.fen, T.players, T.players[getUname()], T]
  B.endPoints.map(x => lacunaUnselectable(x));
  showMessage(`________Move completed, removing ${idlist}`);
  assertion(idlist.length == 2 || idlist.length == 0, `WTF3!!! ${idlist.length}`);
  if (idlist.length == 2) {
    fen.points = fen.points.filter(x => x.id != idlist[0] && x.id != idlist[1]);
    let color = B.diPoints[idlist[0]].bg;
    let flower = lacunaColorName(color);
    let n = lookup(me, ['flowers', color]);
    lookupSetOverride(me, ['flowers', color], n ? n + 2 : 2);
  }
  let nextPlayer = findPlayerWithMeeplesLeft(getUname());
  if (nextPlayer) {
    table.turn = [nextPlayer];
    let o = { id: table.id, name: me, step: table.step + 1, table };
    let res = await mPostRoute('table', o); //console.log(res);
  } else await lacunaGameover();
}
async function lacunaPresent() {
  await loadStarImages();
  let [n, nTypes] = [49, 7];
  let fenPoints = lacunaGenerateFenPoints(n, nTypes, 1000, 1000, 0); logMinMax(fenPoints);
  B = {};
  let d1 = mDom(document.body, { hline: 0, margin: 0 }, { html: '&nbsp;' });
  let [w, h, margin, padding, border] = [500, 500, 20, 30, 8];
  let d = mDom(d1, { border: `${border}px solid #555`, wbox: true, position: 'relative', w, h, bg: '#242430', margin, padding }, { id: 'dCanvas' });
  let sz = 30;
  let points = [];
  for (const p of fenPoints) {
    let p1 = pointFromFenRaw(p);
    p1.x = mapRange(p1.x, 0, 1000, 0, w);
    p1.y = mapRange(p1.y, 0, 1000, 0, h);
    p1 = pointAddMargin(p1, padding);
    drawPointStar(p1, d, sz);
    points.push(p1);
  }
  B.diPoints = list2dict(points, 'id');
  console.log(points[0], getSetOfDifferentTypesOfPoints(points));
  B.obstacleThreshold = 10; B.triggerThreshold = 8;
  let result = findIsolatedPairs(points, 'type', B.obstacleThreshold); //je groesser threshold umso mehr obstacles werden detected!
  let pairs = result.isolatedPairs;
  let lines = []; B.lines = lines;
  pairs.map(pair => lines.push({ p1: pair[0], p2: pair[1], div: drawInteractiveLine(d, pair[0], pair[1], 'lightblue', 1) })); //rColor(), 1)));
  d.onmousemove = onMouseMoveLine;
  B.counter = 0;
  B.meeples = [];
  document.onclick = placeYourMeeple;
}
function lacunaPresentPoints(points, d) {
  let [w, h, sz, margin, padding] = [400, 400, 10, 10, 20];
  B.sz = sz;
  let dParent = B.dParent = mDom(d, { w, h, margin, padding, position: 'relative', bg: '#eee' }, { id: 'dCanvas' });
  for (const p of points) {
    let p1 = pointFromFenRaw(p);
    p1.x = mapRange(p1.x, 0, 1000, 0, w - sz);
    p1.y = mapRange(p1.y, 0, 1000, 0, h - sz);
    p1 = pointAddMargin(p1, padding);
    p1.sz = sz;
    p1 = drawPoint(dParent, p1);
  }
}
async function lacunaSelectPointME(ev) {
  let [fen, players, pl] = [T.fen, T.players, T.players[getUname()]]
  let id = evToId(ev);
  let p = B.diPoints[id];
  lookupAddIfToList(B, ['selectedPoints'], id); //console.log(B.selectedPoints.length)
  assertion(B.selectedPoints.length >= 1, "WTF");
  if (B.selectedPoints.length == 1) {
    let eps = [];
    for (const pair of B.possiblePairs.map(x => x.split(',').map(x => B.diPoints[x]))) {
      let p1 = pair[0];
      let p2 = pair[1];
      if (p1.id != id && p2.id != id) continue;
      if (p1.id == id) addIf(eps, p2.id); else addIf(eps, p1.id);
    }
    let unselect = B.endPoints.filter(x => !eps.includes(x));
    unselect.map(x => lacunaUnselectable(x));
    B.endPoints = eps;
    if (B.endPoints.length < 2) {
      B.selectedPoints.push(B.endPoints[0]);
      await lacunaMoveCompletedME(B.selectedPoints);
    }
  } else {
    assertion(B.selectedPoints.length == 2, "WTF2!!!!!!!!!!!!!");
    await lacunaMoveCompletedME(B.selectedPoints);
  }
}
async function lacunaSelectPointNeu(p, l) {
  let id = p.id;
  lookupAddIfToList(B, ['selectedPoints'], id); //console.log(B.selectedPoints.length)
  assertion(B.selectedPoints.length >= 1, "WTF");
  if (B.selectedPoints.length == 1) {
    let eps = [];
    for (const line of B.possiblePairs) {
      let p1 = line.p1;
      let p2 = line.p2;
      if (p1.id != id && p2.id != id) continue;
      if (p1.id == id) addIf(eps, p2.id); else addIf(eps, p1.id);
    }
    let unselect = B.endPoints.filter(x => !eps.includes(x));
    unselect.map(x => { let d = mBy(id); mClassRemove(div, 'pulseFastInfinite'); d.onclick = null; });
    B.endPoints = eps;
    if (B.endPoints.length < 2) {
      B.selectedPoints.push(B.endPoints[0]);
      await lacunaMoveCompletedME(B.selectedPoints);
    }
  } else {
    assertion(B.selectedPoints.length == 2, "WTF2!!!!!!!!!!!!!");
    await lacunaMoveCompletedME(B.selectedPoints);
  }
}
function lacunaStartMove() {
  lockForLengthyProcess();
  h = { meeples: B.meeples, dParent: B.dParent, points: B.points, sz: B.sz };
  let [points, dParent, sz] = [B.points, B.dParent, B.sz];
  let result = findIsolatedPairs(points, sz * 1.2);
  let isolated = B.isolatedPairs = filterIsolatedPairs(result.isolatedPairs, B.meeples, 15);
  let [hotspots, linesByPair] = generateHotspots(dParent, isolated, sz, 'transparent');
  B.hotspots = hotspots;
  B.linesByPair = linesByPair;
  B.pairs = linesByPair;
  B.hotspotList = hotspots;
  B.hotspotDict = list2dict(hotspots, 'id');
  dParent.onmousemove = highlightHotspots;
  dParent.onclick = placeYourMeepleME;
  unlock();
}
function lacunaUnselectable(id) {
  let div = mBy(id);
  mClassRemove(div, 'selectable');
  div.onclick = null;
}
function last(arr) {
  return arr.length > 0 ? arr[arr.length - 1] : null;
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
function lastOfLanguage(key, language) {
  let y = symbolDict[key];
  let w = y[language];
  let last = stringAfterLast(w, '|');
  return last.trim();
}
function lastWord(s) { return arrLast(toWords(s)); }
function layoutCircle(n) {
  let nth, rows, colarr;
  if (n == 3) { nth = 2.3; rows = 2; colarr = [1, 2]; }
  else if (n == 4) { nth = 2.3; rows = 2; colarr = [2, 2]; }
  else if (n == 5) { nth = 3; rows = 3; colarr = [1, 2, 2]; }
  else if (n == 6) { nth = 3.3; rows = 3; colarr = [1, 3, 2]; }
  else if (n == 7) { nth = 3; rows = 3; colarr = [2, 3, 2]; }
  else if (n == 8) { nth = 3.8; rows = 3; colarr = [2, 4, 2]; }
  else if (n == 9) { nth = 4; rows = 4; colarr = [2, 3, 3, 1]; }
  else if (n == 10) { nth = 4; rows = 4; colarr = [2, 3, 3, 2]; }
  else if (n == 11) { nth = 4.5; rows = 4; colarr = [2, 3, 4, 2]; }
  else if (n == 12) { nth = 4.8; rows = 4; colarr = [2, 4, 4, 2]; }
  else if (n == 13) { nth = 5; rows = 5; colarr = [2, 3, 4, 3, 1]; }
  else if (n == 14) { nth = 5; rows = 5; colarr = [2, 3, 4, 3, 2]; }
  else if (n == 15) { nth = 5.5; rows = 4; colarr = [3, 4, 5, 3]; }
  else if (n == 16) { nth = 5.5; rows = 5; colarr = [2, 3, 5, 4, 2]; }
  else if (n == 17) { nth = 5.5; rows = 5; colarr = [2, 4, 5, 4, 2]; }
  else if (n == 18) { nth = 5.8; rows = 5; colarr = [2, 4, 5, 4, 3]; }
  else if (n == 19) { nth = 5.8; rows = 5; colarr = [3, 4, 5, 4, 3]; }
  else if (n == 20) { nth = 5.8; rows = 5; colarr = [2, 5, 6, 5, 2]; }
  else if (n == 21) { nth = 5.8; rows = 5; colarr = [2, 5, 6, 5, 3]; }
  else if (n == 22) { nth = 5.8; rows = 5; colarr = [3, 5, 6, 5, 3]; }
  else if (n == 23) { nth = 5.8; rows = 5; colarr = [4, 5, 6, 5, 3]; }
  else if (n == 24) { nth = 5.8; rows = 5; colarr = [4, 5, 6, 5, 4]; }
  return [nth, rows, colarr];
}
function list2dict(arr, keyprop = 'id', uniqueKeys = true) {
  let di = {};
  for (const a of arr) {
    let key = typeof (a) == 'object' ? a[keyprop] : a;
    if (uniqueKeys) lookupSet(di, [key], a);
    else lookupAddToList(di, [key], a);
  }
  return di;
}
function liste(areaName, oSpec, oid, o) {
  let [num, or, split, bg, fg, id, panels, parent] = getParams(areaName, oSpec, oid);
  parent.style.display = 'inline-grid';
  return parent;
}
async function loadAndMakeInteractive(imageUrl) {
  try {
    const canvas = await createInteractiveCanvas(imageUrl);
    document.body.appendChild(canvas);
  } catch (error) {
    console.error("Error loading image:", error);
  }
}
async function loadAndScaleImage(imageUrl) {
  try {
    const canvas = await createScaledCanvasFromImage(imageUrl);
    document.body.appendChild(canvas);
  } catch (error) {
    console.error("Error loading image:", error);
  }
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
function loadColors(bh = 18, bs = 20, bl = 20) {
  if (nundef(M.dicolor)) {
    M.dicolor = dicolor;
  }
  if (nundef(M.colorList)) {
    [M.colorList, M.colorByHex, M.colorByName] = getListAndDictsForDicolors();
    M.colorNames = Object.keys(M.colorByName); M.colorNames.sort();
  }
  let list = M.colorList;
  for (const x of list) {
    let fg = colorIdealText(x.hex);
    x.fg = fg;
    x.sorth = Math.round(x.hue / bh) * bh;
    x.sortl = Math.round(x.lightness * 100 / bl) * bl;
    x.sorts = Math.round(x.sat * 100 / bs) * bs;
  }
  list = sortByMultipleProperties(list, 'fg', 'sorth', 'sorts', 'sortl', 'hue');
  return list;
}
async function loadGame(gameId) {
  return await api('GET', `/load_game/${gameId}`);
}
async function loadStarImages() {
  let list = [];
  let names = ['bl1', 'bl2', 'bl3', 'bl4', 'bl7', 'bl8', 'bl9', 'bl6', 'bl5'];
  for (const name of names) { list.push(`../assets/icons/stars/${name}.png`); }
  let starImages = await preloadImages(list);
  M.starImages = starImages;
  return starImages;
}
async function loadStaticJson(path) {
  let server = await getDA('staticUrl'); //console.log('server', server);
  let res = await fetch(server + path);
  if (!res.ok) return null;
  return await res.json();
}
async function loadStaticText(path) {
  let server = await getDA('staticUrl'); //console.log('server', server);
  let res = await fetch(server + path);
  if (!res.ok) return null;
  return await res.text();
}
async function loadStaticYaml(path) {
  let server = await getDA('staticUrl'); //console.log('server', server);
  let res = await fetch(server + path);
  if (!res.ok) return null;
  let text = await res.text();
  return YAML.parse(text);
}
function loadSuperdiAssets() {
  let [di, byType, byCat, allImages] = [M.superdi, {}, {}, {}];
  for (const k in di) {
    let o = di[k];
    if (nundef(o.cats)) o.cats = ['nocat'];
    for (const cat of o.cats) lookupAddIfToList(byCat, [cat], k);
    if (isdef(o.img)) {
      let fname = stringAfterLast(o.img, '/')
      allImages[k] = { fname, path: o.img, key: k };
    }
    if (isdef(o.photo)) {
      let fname = stringAfterLast(o.photo, '/')
      allImages[k + '_photo'] = { fname, path: o.photo, key: k };
    }
  }
  for (const k in M.superdi) { M.superdi[k].key = k; }
  M.allImages = allImages;
  M.byCat = byCat;
  M.categories = Object.keys(byCat); M.categories.sort();
  for (const k in M.superdi) {
    let o = M.superdi[k];
    for (const fk in Families) {
      if (isdef(o[fk])) { lookupAddIfToList(byType, [fk], k); }
    }
  }
  M.byType = byType;
}
function loadUsers() {
}
function lockForLengthyProcess() {
  DA.LengthyProcessRunning = true;
  console.log('LOCK!!!!!!!!!!!!!!!!!!!!!!');
}
function logMinMax(fenPoints) {
  let xValues = fenPoints.map(p => parseInt(p.split('_')[0]));
  let yValues = fenPoints.map(p => parseInt(p.split('_')[1]));
  let minX = Math.min(...xValues);
  let maxX = Math.max(...xValues);
  let minY = Math.min(...yValues);
  let maxY = Math.max(...yValues);
  console.log('Min X:', minX);
  console.log('Max X:', maxX);
  console.log('Min Y:', minY);
  console.log('Max Y:', maxY);
}
function lookup(dict, keys) {
  if (nundef(dict)) return null;
  let d = dict;
  let ilast = keys.length - 1;
  let i = 0;
  for (const k of keys) {
    if (k === undefined) break;
    let e = d[k];
    if (e === undefined || e === null) return null;
    d = d[k];
    if (i == ilast) return d;
    i += 1;
  }
  return d;
}
function lookupAddIfToList(dict, keys, val) {
  let lst = lookup(dict, keys);
  if (isList(lst) && lst.includes(val)) return;
  return lookupAddToList(dict, keys, val);
}
function lookupAddToList(dict, keys, val) {
  let d = dict;
  let ilast = keys.length - 1;
  let i = 0;
  for (const k of keys) {
    if (i == ilast) {
      if (nundef(k)) {
        console.assert(false, 'lookupAddToList: last key indefined!' + keys.join(' '));
        return null;
      } else if (isList(d[k])) {
        d[k].push(val);
      } else {
        d[k] = [val];
      }
      return d[k];
    }
    if (nundef(k)) continue;
    if (d[k] === undefined) d[k] = {};
    d = d[k];
    i += 1;
  }
  return d;
}
function lookupSet(dict, keys, val) {
  let d = dict;
  let ilast = keys.length - 1;
  let i = 0;
  for (const k of keys) {
    if (nundef(k)) continue;
    if (nundef(d[k])) d[k] = (i == ilast ? val : {});
    d = d[k];
    if (i == ilast) return d;
    i += 1;
  }
  return d;
}
function lookupSetOverride(dict, keys, val) {
  let d = dict;
  let ilast = keys.length - 1;
  let i = 0;
  for (const k of keys) {
    if (i == ilast) {
      if (nundef(k)) {
        return null;
      } else {
        d[k] = val;
        return d[k];
      }
    }
    if (nundef(k)) continue;
    if (nundef(d[k]) || !isDict(d[k])) d[k] = {};
    d = d[k];
    i += 1;
  }
  return d;
}
function luxury_card_deco(card) {
  let d = iDiv(card); mStyle(d, { position: 'relative' });
  let d1 = mDiv(d, { fg: 'dimgray', fz: 11, family: 'tangerine', position: 'absolute', left: 0, top: 0, 'writing-mode': 'vertical-rl', transform: 'scale(-1)', top: '35%' }, null, 'Luxury');
  let html = `<img height=${18} src="../base/assets/images/icons/deco0.svg" style="transform:scaleX(-1);">`;
  d1 = mDiv(d, { position: 'absolute', bottom: -2, left: 3, opacity: .25 }, null, html);
}
function mAdjustPage(wmargin) {
  let r = getRect('dBuffer');
  let r2 = getRect('dExtra');
  let [w, h] = [window.innerWidth - wmargin, window.innerHeight - (r.h + r2.h)];
  mStyle('dMain', { w, h });
  mStyle('dPage', { w, h });
}
function mAlign(box, dOuter, opts) {
  if (mGetStyle(box, 'display') != 'inline-block') {
    let parent = box.parentNode;
    let wrapper = mDom(parent, { display: 'inline-block' });
    mAppend(wrapper, box);
    box = wrapper;
  }
  let rOuter = getRect(dOuter);
  let rbox = getRect(box);
  let align = valf(opts.align, 'bl'), ov = valf(opts.ov, 0);
  let dx, dy;
  if (align == 'tl') { dx = rOuter.l; dy = rOuter.t - rbox.h * (1 - ov); }
  else if (align == 'bl') { dx = rOuter.l; dy = rOuter.b - rbox.h * ov; }
  else if (align == 'cl') { dx = rOuter.l - rbox.w * (1 - ov); dy = rOuter.t + rOuter.h / 2 - rbox.h / 2; }
  else if (align == 'tr') { dx = rOuter.l + rOuter.w - rbox.w; dy = rOuter.t - rbox.h * (1 - ov); }
  else if (align == 'br') { dx = rOuter.l + rOuter.w - rbox.w; dy = rOuter.t + rOuter.h - rbox.h * ov; }
  else if (align == 'cr') { dx = rOuter.l + rOuter.w - rbox.w + rbox.w * (1 - ov); dy = rOuter.t + rOuter.h / 2 - rbox.h / 2; }
  else if (align == 'tc') { dx = rOuter.l + rOuter.w / 2 - rbox.w / 2; dy = rOuter.t - rbox.h * (1 - ov); }
  else if (align == 'bc') { dx = rOuter.l + rOuter.w / 2 - rbox.w / 2; dy = rOuter.t + rOuter.h - rbox.h * ov; }
  else if (align == 'cc') { dx = rOuter.l + rOuter.w / 2 - rbox.w / 2; dy = rOuter.t + rOuter.h / 2 - rbox.h / 2; }
  dx = clamp(dx, 0, window.innerWidth - rbox.w); dy = clamp(dy, 0, window.innerHeight - rbox.h);
  mPos(box, dx, dy, opts.offx, opts.offy);
}
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
function mAnimateTo(elem, prop, val, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0) {
  let o = {};
  o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
  let kflist = [o];
  let opts = { duration: msDuration, fill: 'forwards', easing: easing, delay: delay };
  let a = toElem(elem).animate(kflist, opts);
  if (isdef(callback)) { a.onfinish = callback; }
  return a;
}
function mAppear(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 1, callback, ms); }
function mAppend(d, child) { toElem(d).appendChild(child); return child; }
function mAreas(dParent, areas, gridCols, gridRows) {
  mClear(dParent); mStyle(dParent, { padding: 0 })
  let names = arrNoDuplicates(toWords(areas));
  let dg = mDom(dParent, { w100: true, h100: true, box: true, padding: 0, margin: 0 });
  for (const name of names) {
    let d = mDom(dg, { family: 'opensans', margin: 0, padding: 0, box: true }, { id: name });
    d.style.gridArea = name;
  }
  mStyle(dg, { display: 'grid', gridCols, gridRows });
  dg.style.gridTemplateAreas = areas;
  return names;
}
function mButton(caption, handler, dParent, styles, classes, id) {
  let x = mCreate('button');
  x.innerHTML = caption;
  if (isdef(handler)) x.onclick = handler;
  if (isdef(dParent)) toElem(dParent).appendChild(x);
  if (isdef(styles)) mStyle(x, styles);
  if (isdef(classes)) mClass(x, classes);
  if (isdef(id)) x.id = id;
  return x;
}
function mButtonX(dParent, handler, pos = 'tr', sz = 14, offset = 3, color = 'white') {
  let d2 = mDom(dParent, { fg: color, fz: sz, w: sz, h: sz, cursor: 'pointer' }, { tag: 'i', className: "fa fa-times", id: 'btnX' });
  mPlace(d2, pos, offset);
  d2.onclick = handler;
  return d2;
}
function mBy(id, what, elem) {
  if (nundef(elem)) elem = document;
  if (nundef(what)) return elem.getElementById(id);
  switch (what) {
    case 'class': return Array.from(elem.getElementsByClassName(id)); break;
    case 'tag': return Array.from(elem.getElementsByTagName(id)); break;
    case 'name': return Array.from(elem.getElementsByName(id)); break;
    case 'query': return Array.from(elem.querySelectorAll(id)); break;
    default: return elem.getElementById(id);
  }
}
function mByAttr(key, val) {
  const selector = val ? `[${key}="${val}"]` : `[${key}]`;
  let list = Array.from(document.querySelectorAll(selector));
  return (list.length == 1) ? list[0] : list;
}
function mCenterCenter(d, gap) { mCenterCenterFlex(d, gap); }
function mCenterCenterFlex(d) { mCenterFlex(d, true, true, true); }
function mCenterFlex(d, hCenter = true, vCenter = false, wrap = true) {
  let styles = { display: 'flex' };
  if (hCenter) styles['justify-content'] = 'center';
  styles['align-content'] = vCenter ? 'center' : 'flex-start';
  if (wrap) styles['flex-wrap'] = 'wrap';
  mStyle(d, styles);
}
function mCheckbox(dg, name, value) {
  let di = mDom(dg, { display: 'inline-block' });
  let chk = mDom(di, {}, { tag: 'input', type: 'checkbox', id: getUID('c'), name: name });
  if (isdef(value)) chk.checked = value;
  let label = mDom(di, {}, { tag: 'label', html: name, for: chk.id });
  return di;
}
function mClass(d) {
  d = toElem(d);
  if (arguments.length == 2) {
    let arg = arguments[1];
    if (isString(arg) && arg.indexOf(' ') > 0) { arg = toWords(arg); }
    else if (isString(arg)) arg = [arg];
    if (isList(arg)) {
      for (let i = 0; i < arg.length; i++) {
        d.classList.add(arg[i]);
      }
    }
  } else for (let i = 1; i < arguments.length; i++) d.classList.add(arguments[i]);
}
function mClassRemove(d) { d = toElem(d); for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mClear(d) {
  d = toElem(d); if (d) d.innerHTML = '';
}
function mColFlex(dParent, chflex = [1, 5, 1], bgs) {
  let styles = { opacity: 1, display: 'flex', aitems: 'stretch', 'flex-flow': 'nowrap' };
  mStyle(dParent, styles);
  let res = [];
  for (let i = 0; i < chflex.length; i++) {
    let bg = isdef(bgs) ? bgs[i] : null;
    let d1 = mDiv(dParent, { flex: chflex[i] });
    if (isdef(bg)) mStyle(d1, { bg: bg });
    res.push(d1);
  }
  return res;
}
async function mCollapse(divs, dParent, styles = {}) {
  function collapseOne(div) {
    let b = div.firstChild.firstChild;
    b.textContent = '+';
    let chi = arrChildren(div).slice(1);
    chi.map(x => mStyle(x, { display: 'none' }));
  }
  function expandOne(div) {
    let b = div.firstChild.firstChild;
    b.textContent = '- ';
    let chi = arrChildren(div).slice(1);
    chi.map(x => mStyle(x, { display: 'block' }));
  }
  function isCollapsedOne(div) { let chi = arrChildren(div).slice(1); return chi[0].style.display === 'none'; }
  function toggleOne(div) { if (isCollapsedOne(div)) expandOne(div); else collapseOne(div); }
  function collapseAll() { divs.map(collapseOne); }
  function expandAll() { divs.map(expandOne); }
  divs.forEach(div => {
    let d1 = div.firstChild;
    let b = mDom(d1, { margin: 5, cursor: 'pointer' }, { tag: 'span', html: '- ' }); mInsert(d1, b, 0);
    b.onclick = () => { toggleOne(div); }
  });
  let dController = null;
  if (isdef(dParent)) {
    let bExpand = await mKey('circle_chevron_down', dParent, styles, { tag: 'button', onclick: expandAll });
    let bCollapse = await mKey('circle_chevron_up', dParent, styles, { tag: 'button', onclick: collapseAll });
    dController = mToggleCompose(bExpand, bCollapse);
  }
  return { divs, dController, toggleOne, collapseOne, expandOne, isCollapsedOne, collapseAll, expandAll };
}
function mColor(d, bg, fg) { return mStyle(d, { 'background-color': bg, 'color': fg }); }
function mCols(dParent, arr, itemStyles = { bg: 'random' }, rowStyles = {}, colStyles = {}, akku = []) {
  let d0 = mDom(dParent, { w100: true, h100: true, display: 'flex', 'justify-content': 'space-between' });
  if (isdef(colStyles)) mStyle(d0, colStyles);
  for (let i = 0; i < arr.length; i++) {
    let content = arr[i];
    if (isList(content)) {
      d1 = mDom(d0);
      mRows(d1, content, itemStyles, rowStyles, colStyles, akku);
    } else {
      d1 = mKey(content, d0, itemStyles);
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
function mContainerSplay(d, splay, w, h, num, ov) {
  if (nundef(splay)) splay = 2;
  if (!isNumber(splay)) splay = get_splay_number(splay);
  if (isString(ov) && ov[ov.length - 1] == '%') ov = splay == 0 ? 1 : splay == 3 ? Number(ov) * h / 100 : Number(ov) * w / 100;
  if (splay == 3) {
    d.style.display = 'grid';
    d.style.gridTemplateRows = `repeat(${num},${ov}px)`;
    console.log('HAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOO')
    d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
  } else if (splay == 2 || splay == 1) {
    d.style.display = 'grid';
    d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
    let wnew = w + (num - 1) * (ov * 1.1);
    d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
  } else if (splay == 0) {
    d.style.display = 'grid'; ov = .5
    d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
    d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
  } else if (splay == 5) {
    d.style.display = 'grid';
    d.style.gridTemplateColumns = `${ov}px repeat(${num - 1},${ov / 2}px)`;
    d.style.minWidth = `${w + (num) * (ov / 2 * 1.1)}px`;
  } else if (splay == 4) {
    d.style.position = 'relative';
    if (nundef(ov)) ov = .5;
    d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
    d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
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
  let ds = mKey(key, dResult, styles);
  return dResult;
}
function mCreate(tag, styles, id) { let d = document.createElement(tag); if (isdef(id)) d.id = id; if (isdef(styles)) mStyle(d, styles); return d; }
function mCreateFrom(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}
function mCropResizePan(dParent, img, dButtons) {
  let [worig, horig] = [img.offsetWidth, img.offsetHeight];
  mStyle(dParent, { w: worig, h: horig, position: 'relative' });
  const cropBox = mDom(dParent, { position: 'absolute', left: 0, top: 0, w: worig, h: horig }, { className: 'crop-box' });
  const messageBox = mDom(cropBox, { bg: '#ffffff80', fg: 'black', cursor: 'move' });
  let sz = 16;
  const centerBox = mDom(cropBox, { bg: 'red', w: sz, h: sz, rounding: '50%', position: 'absolute' });
  const wHandle = mDom(cropBox, { cursor: 'ew-resize', bg: 'red', w: sz, h: sz, right: -sz / 2, top: '50%', rounding: '50%', position: 'absolute' });
  const hHandle = mDom(cropBox, { cursor: 'ns-resize', bg: 'red', w: sz, h: sz, left: '50%', bottom: -sz / 2, rounding: '50%', position: 'absolute' });
  const whHandle = mDom(cropBox, { cursor: 'nwse-resize', bg: 'red', w: sz, h: sz, right: -sz / 2, bottom: -sz / 2, rounding: '50%', position: 'absolute' });
  let isResizing = null;
  let resizeStartW;
  let resizeStartH;
  function startResize(e) {
    e.preventDefault(); evNoBubble(e);
    isResizing = e.target == wHandle ? 'w' : e.target == hHandle ? 'h' : 'wh';
    [resizeStartW, resizeStartH] = [parseInt(cropBox.style.width), parseInt(cropBox.style.height)];
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  }
  function resize(e) {
    if (!isResizing) return;
    e.preventDefault(); evNoBubble(e);
    let newWidth, newHeight;
    if (isResizing == 'w') {
      newWidth = e.clientX;
      newHeight = img.height;
    } else if (isResizing == 'h') {
      newWidth = img.width;
      newHeight = e.clientY;
    } else if (isResizing == 'wh') {
      newHeight = e.clientY;
      let aspectRatio = img.width / img.height;
      newWidth = aspectRatio * newHeight;
    }
    [img, dParent].map(x => mStyle(x, { w: newWidth, h: newHeight }));
    setRect(0, 0, newWidth, newHeight);
  }
  function stopResize() {
    isResizing = null;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
    let [wnew, hnew] = [parseInt(cropBox.style.width), parseInt(cropBox.style.height)]
    redrawImage(img, dParent, 0, 0, resizeStartW, resizeStartH, wnew, hnew, () => setRect(0, 0, wnew, hnew))
  }
  function resizeTo(wnew, hnew) {
    if (hnew == 0) hnew = img.height;
    if (wnew == 0) {
      let aspectRatio = img.width / img.height;
      wnew = aspectRatio * hnew;
    }
    redrawImage(img, dParent, 0, 0, img.width, img.height, wnew, hnew, () => setRect(0, 0, wnew, hnew))
  }
  let isCropping = false;
  let cropStartX;
  let cropStartY;
  function startCrop(ev) {
    ev.preventDefault();
    isCropping = true;
    let pt = getMouseCoordinates(ev);
    [cropStartX, cropStartY] = [pt.x, pt.y - 24];
    document.addEventListener('mousemove', crop); //cropCenter);
    document.addEventListener('mouseup', stopCrop);
  }
  function crop(ev) {
    ev.preventDefault();
    if (isCropping) {
      evNoBubble(ev);
      let pt = getMouseCoordinates(ev);
      let [mouseX, mouseY] = [pt.x, pt.y];
      const width = Math.abs(mouseX - cropStartX);
      const height = Math.abs(mouseY - cropStartY);
      const left = Math.min(mouseX, cropStartX);
      const top = Math.min(mouseY, cropStartY);
      setRect(left, top, width, height);
    }
  }
  function cropX(e) {
    e.preventDefault();
    if (isCropping) {
      const mouseX = e.clientX - dParent.offsetLeft;
      const mouseY = e.clientY - dParent.offsetTop;
      const width = Math.abs(mouseX - cropStartX);
      const height = 300;
      const left = Math.min(mouseX, cropStartX);
      const top = 0;
      setRect(left, top, width, height);
    }
  }
  function cropCenter(e) {
    e.preventDefault();
    if (isCropping) {
      const mouseX = e.clientX - dParent.offsetLeft;
      const mouseY = e.clientY - dParent.offsetTop;
      const radiusX = Math.abs(mouseX - cropStartX);
      const radiusY = Math.abs(mouseY - cropStartY);
      const centerX = cropStartX;
      const centerY = cropStartY;
      const width = radiusX * 2;
      const height = radiusY * 2;
      const left = centerX - radiusX;
      const top = centerY - radiusY;
      setRect(left, top, width, height);
    }
  }
  function stopCrop() {
    isCropping = false;
    document.removeEventListener('mousemove', crop);
    document.removeEventListener('mouseup', stopCrop);
  }
  function cropImage() {
    let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
    redrawImage(img, dParent, x, y, w, h, w, h, () => setRect(0, 0, w, h))
  }
  function cropTo(wnew, hnew) {
    let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
    let xnew = x + (wnew - w) / 2;
    let ynew = y + (hnew - h) / 2;
    redrawImage(img, dParent, xnew, ynew, wnew, wnew, wnew, hnew, () => setRect(0, 0, wnew, hnew))
  }
  let isPanning = false;
  let panStartX;
  let panStartY;
  let cboxX;
  let cboxY;
  function startPan(e) {
    e.preventDefault(); evNoBubble(e);
    isPanning = true;
    panStartX = e.clientX - dParent.offsetLeft;
    panStartY = e.clientY - dParent.offsetTop;
    cboxX = parseInt(cropBox.style.left)
    cboxY = parseInt(cropBox.style.top)
    document.addEventListener('mousemove', pan); //cropCenter);
    document.addEventListener('mouseup', stopPan);
  }
  function pan(e) {
    e.preventDefault();
    if (isPanning) {
      evNoBubble(e);
      const mouseX = e.clientX - dParent.offsetLeft;
      const mouseY = e.clientY - dParent.offsetTop;
      let diffX = panStartX - mouseX;
      let diffY = panStartY - mouseY;
      const left = cboxX - diffX
      const top = cboxY - diffY
      setRect(left, top, parseInt(cropBox.style.width), parseInt(cropBox.style.height));
    }
  }
  function stopPan() {
    isPanning = false;
    document.removeEventListener('mousemove', crop);
    document.removeEventListener('mouseup', stopCrop);
  }
  function getRect() { return ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x])); }
  function setRect(left, top, width, height) {
    mStyle(cropBox, { left: left, top: top, w: width, h: height });
    messageBox.innerHTML = `size: ${Math.round(width)} x ${Math.round(height)}`;
    mStyle(centerBox, { left: width / 2 - 5, top: height / 2 - 5 });
  }
  function show_cropbox() { cropBox.style.display = 'block' }
  function hide_cropbox() { cropBox.style.display = 'none' }
  function setSize(wnew, hnew) {
    if (isList(wnew)) [wnew, hnew] = wnew;
    if (wnew == 0 || hnew == 0) {
      setRect(0, 0, worig, horig);
      return;
    }
    let [x, y, w, h] = getRect();
    let [cx, cy] = [x + w / 2, y + h / 2];
    let [xnew, ynew] = [cx - (wnew / 2), cy - (hnew / 2)];
    setRect(xnew, ynew, wnew, hnew);
  }
  wHandle.addEventListener('mousedown', startResize);
  hHandle.addEventListener('mousedown', startResize);
  whHandle.addEventListener('mousedown', startResize);
  cropBox.addEventListener('mousedown', startCrop);
  messageBox.addEventListener('mousedown', startPan);
  setRect(0, 0, worig, horig);
  return {
    cropBox: cropBox,
    dParent: dParent,
    elem: cropBox,
    img: img,
    messageBox: messageBox,
    crop: cropImage,
    getRect: getRect,
    hide: hide_cropbox,
    resizeTo: resizeTo,
    setRect: setRect,
    setSize: setSize,
    show: show_cropbox,
  }
}
function mDataTable(reclist, dParent, rowstylefunc, headers, id, showheaders = true) {
  if (nundef(headers)) headers = Object.keys(reclist[0]);
  let t = mTable(dParent, headers, showheaders);
  if (isdef(id)) t.id = `t${id}`;
  let rowitems = [];
  let i = 0;
  for (const u of reclist) {
    let rid = isdef(id) ? `r${id}_${i}` : null;
    r = mTableRow(t, u, headers, rid);
    if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
    rowitems.push({ div: r.div, colitems: r.colitems, o: u, id: rid, index: i });
    i++;
  }
  return { div: t, rowitems: rowitems };
}
function mDiv(dParent, styles, id, inner, classes, sizing) {
  dParent = toElem(dParent);
  let d = mCreate('div');
  if (dParent) mAppend(dParent, d);
  if (isdef(styles)) mStyle(d, styles);
  if (isdef(classes)) mClass(d, classes);
  if (isdef(id)) d.id = id;
  if (isdef(inner)) d.innerHTML = inner;
  if (isdef(sizing)) { setRect(d, sizing); }
  return d;
}
function mDom(dParent, styles = {}, opts = {}) {
  let tag = valf(opts.tag, 'div');
  let d = document.createElement(tag);
  if (tag == 'textarea') styles.wrap = 'hard';
  mStyle(d, styles);
  applyOpts(d, opts);
  if (isdef(dParent)) mAppend(dParent, d);
  return d;
}
function mDom100(dParent, styles = {}, opts = {}) { copyKeys({ w100: true, h100: true, box: true }, styles); return mDom(dParent, styles, opts); }
function mDummyFocus() {
  if (nundef(mBy('dummy'))) mDom(document.body, { position: 'absolute', top: 0, left: 0, opacity: 0, h: 0, w: 0, padding: 0, margin: 0, outline: 'none', border: 'none', bg: 'transparent' }, { tag: 'button', id: 'dummy', html: 'dummy' }); //addDummy(document.body); //, 'cc');
  mBy('dummy').focus();
}
function mFade(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, callback, ms); }
function mFadeClear(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, () => { mClear(d); if (callback) callback(); }, ms); }
function mFadeRemove(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, () => { mRemove(d); if (callback) callback(); }, ms); }
function mFall(d, ms = 800, dist = 50) { toElem(d).animate([{ opacity: 0, transform: `translateY(-${dist}px)` }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' }); }
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
async function mFlaskUrl() {
  console.log(DA);
  let session = detectSessionType();
  let server = sessionType == 'fastcomet' ? 'https://moxito.online/' : sessionType == 'telecave' ? 'https://www.telecave.net/' : `http://localhost/${DA.serverdir}/`;
  return server + `${projectName}/ppph/`;
}
function mFlex(d, wrap = true, halign = 'start', valign = 'center', row = true) {
  d = toElem(d);
  mStyle(d, {
    display: 'flex',
    'flex-wrap': wrap ? 'wrap' : 'nowrap',
    'flex-direction': row ? 'row' : 'column',
    'align-items': row ? valign : halign,
    'justify-content': row ? halign : valign
  });
}
function mFlexLR(d) { mStyle(d, { display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }); }
function mFlexLine(d, startEndCenter = 'center') { mStyle(d, { display: 'flex', 'justify-content': startEndCenter, 'align-items': 'center' }); }
function mFlexWrap(d) { mFlex(d, 'w'); }
function mGather(f, d, styles = {}, opts = {}) {
  return new Promise((resolve, _) => {
    let dShield = mShield();
    let fCancel = _ => { dShield.remove(); hotkeyDeactivate('Escape'); resolve(null) };
    let fSuccess = val => { dShield.remove(); hotkeyDeactivate('Escape'); resolve(val) };
    dShield.onclick = fCancel;
    hotkeyActivate('Escape', fCancel);
    let [box, inp] = mInBox(f, dShield, styles, styles, dictMerge(opts, { fSuccess }));
    let align = opts.align || 'bl';
    mAlign(box, d, { align, offx: -24 });
    inp.focus();
  });
}
function mGetAttr(elem, prop) { return elem.getAttribute(prop); }
async function mGetFiles(dir) {
  let res = await mPhpPost('all', { cmd: 'dir', dir });
  return res;
}
async function mGetJsonCors(url) {
  let res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors' // Set CORS mode to enable cross-origin requests
  });
  let json = await res.json();
  return json;
}
async function mGetRoute(route, o = {}, port = 3000) {
  let server = getServerurl(port);
  server += `/${route}?`;
  for (const k in o) { server += `${k}=${o[k]}&`; }
  const response = await fetch(server, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
  });
  return tryJSONParse(await response.text());
}
function mGetStyle(elem, prop) {
  let val;
  elem = toElem(elem);
  if (prop == 'bg') { val = getStyleProp(elem, 'background-color'); if (isEmpty(val)) return getStyleProp(elem, 'background'); }
  else if (isdef(STYLE_PARAMS_2[prop])) { val = getStyleProp(elem, STYLE_PARAMS_2[prop]); }
  else {
    switch (prop) {
      case 'vMargin': val = stringBefore(elem.style.margin, ' '); break;
      case 'hMargin': val = stringAfter(elem.style.margin, ' '); break;
      case 'vPadding': val = stringBefore(elem.style.padding, ' '); break;
      case 'hPadding': val = stringAfter(elem.style.padding, ' '); break;
      case 'box': val = elem.style.boxSizing; break;
      case 'dir': val = elem.style.flexDirection; break;
    }
  }
  if (nundef(val)) val = getStyleProp(elem, prop);
  if (val.endsWith('px')) return firstNumber(val); else return val;
}
function mGetStyles(elem, proplist) {
  let res = {};
  for (const p of proplist) { res[p] = mGetStyle(elem, p) }
  return res;
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
function mGridFlex(dParent, styles = {}, opts = {}) {
  addKeys({ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }, styles);
  let d = mDom(dParent, styles, opts);
  return d;
}
function mGridFromElements(dParent, elems, maxHeight, numColumns) {
  dParent.innerHTML = '';
  let cols = `repeat(${numColumns}, 1fr)`; //'repeat(auto-fill, minmax(0, 1fr))';
  let grid = mDom(dParent, { display: 'inline-grid', gridCols: cols, gap: 10, padding: 4, overy: 'auto', hmax: maxHeight })
  elems.forEach(x => mAppend(grid, x));
  return grid;
}
function mGridOld(rows, cols, dParent, styles = {}, opts = {}) {
  [rows, cols] = [Math.ceil(rows), Math.ceil(cols)]
  addKeys({ display: 'inline-grid', gridCols: 'repeat(' + cols + ',1fr)' }, styles);
  if (rows) styles.gridRows = 'repeat(' + rows + ',auto)';
  else styles.overy = 'auto';
  let d = mDom(dParent, styles, opts);
  return d;
}
function mHasClass(el, className) {
  if (el.classList) return el.classList.contains(className);
  else {
    let x = !!el.className;
    return isString(x) && !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
  }
}
function mIfNotRelative(d) { d = toElem(d); if (isEmpty(d.style.position)) d.style.position = 'relative'; }
async function mImageSaveUI(dParent, dir, src, savetype = 'unique') {
  let html = `<div id="drop-zone">
      <p id="label" style="text-align:center; padding-top:200px;">Drag Image Here</p>
      <img id="image-to-crop" />
    </div>
    <div class="controls">
      <input type="text" id="filename-input" placeholder="Enter filename (e.g. profile)" />
      <button id="upload-btn" style="display:none;">Crop & Upload</button>
      <button id="cancel-btn" style="display:none;">Cancel</button>
    </div>
    `;
  mDom(dParent, {}, { html })
  const dropZone = document.getElementById('drop-zone');
  const imageEl = document.getElementById('image-to-crop');
  const uploadBtn = document.getElementById('upload-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const inp = document.getElementById('filename-input');
  mStyle(inp, { fz: 16, padding: 4, box: true, w: 260 })
  mStyle(dropZone, { box: true });
  let cropper;
  if (isdef(src)) {
    document.getElementById('label').style.display = 'none';
    uploadBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    imageEl.src = src;
    imageEl.onload = () => {
      if (cropper) cropper.destroy();
      cropper = new Cropper(imageEl, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 0.8,
        zoomable: true,
        movable: true,
      });
    };
  }
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => { e.preventDefault(); e.stopPropagation(); });
  });
  dropZone.addEventListener('drop', (e) => {
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      imageEl.src = event.target.result;
      document.getElementById('label').style.display = 'none';
      uploadBtn.style.display = 'inline-block';
      cancelBtn.style.display = 'inline-block';
      if (cropper) cropper.destroy();
      cropper = new Cropper(imageEl, {
        aspectRatio: 1, // Force a square
        viewMode: 1,    // Restrict crop box to within the container
        autoCropArea: 0.8,
        zoomable: true,
        movable: true,
      });
    };
    reader.readAsDataURL(file);
  });
  uploadBtn.addEventListener('click', () => {
    if (!cropper) return;
    const customName = document.getElementById('filename-input').value.trim() || 'image';
    const canvas = cropper.getCroppedCanvas({ width: 200, height: 200 });
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      formData.append('filename', customName);
      formData.append('dirname', dir);
      formData.append('savetype', savetype); // 'override' || 'unique'
      console.log("Uploading 200x200 cropped image...", dir, customName);
      let server = await getDA('phpUrl');
      console.log('server', server)
      const response = await fetch(server + 'upload2.php', {
        method: 'POST',
        body: formData
      });
      let res = await response.json();
      console.log('saved as', res.path, res.filename);
      U.imgKey = stringBeforeLast(res.filename, '.');
      console.log(M.users[U.name], U)
      await postUsers();
    }, 'image/jpeg', 0.7);
  });
  cancelBtn.addEventListener('click', () => {
    document.getElementById('label').style.display = 'block';
    uploadBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    imageEl.src = '';
    if (cropper) cropper.destroy();
  });
}
function mInBox(f, dParent, boxStyles = {}, inpStyles = {}, opts = {}) {
  let dbox = mDom(dParent, boxStyles);
  let dinp = f(dbox, inpStyles, opts);
  return [dbox, dinp];
}
function mInput(dParent, styles = {}, opts = {}) {
  addKeys({ tag: 'input', id: getUID(), placeholder: '', autocomplete: "off", value: '', selectOnClick: true, type: "text" }, opts);
  let d = mDom(dParent, styles, opts);
  d.onclick = opts.selectOnClick ? ev => { evNoBubble(ev); d.select(); } : ev => { evNoBubble(ev); };
  d.onkeydown = ev => {
    if (ev.key == 'Enter' && isdef(opts.fSuccess)) { evNoBubble(ev); opts.fSuccess(d.value); }
    else if (ev.key == 'Escape' && isdef(opts.fCancel)) { evNoBubble(ev); opts.fCancel(); }
  }
  return d;
}
function mInsert(dParent, elem, index = 0) {
  dParent = toElem(dParent)
  if (dParent.childNodes.length <= index) {
    dParent.appendChild(elem);
  } else {
    dParent.insertBefore(elem, dParent.childNodes[index]);
  }
  return elem;
}
function mItem(liveprops = {}, opts = {}) {
  let id = valf(opts.id, getUID());
  let item = opts;
  item.live = liveprops;
  item.id = id;
  let d = iDiv(item); if (isdef(d)) d.id = id;
  Items[id] = item;
  return item;
}
function mItemSplay(item, items, splay, ov = .5) {
  if (!isNumber(splay)) splay = get_splay_number(splay);
  let d = iDiv(item);
  let idx = items.indexOf(item);
  if (splay == 4) {
    let offset = (list.length - idx) * ov;
    mStyle(d, { position: 'absolute', left: offset, top: offset });
    d.style.zIndex = list.length - idx;
  } else {
    d.style.zIndex = splay != 2 ? list.length - idx : 0;
  }
}
function mKey(imgKey, d, styles = {}, opts = {}) {
  if (nundef(opts.prefer)) { opts.prefer = 'emoji'; }
  styles = jsCopy(styles);
  if (!isString(imgKey)) { imgKey = imgKey.toString(); opts.prefer = 'plain'; }
  let o = opts.prefer == 'emoji' ? M.emo[imgKey] : imgKey.includes('.') ? { src: imgKey } : opts.prefer == 'plain' ? { plain: imgKey } : lookup(M.superdi, [imgKey]);
  let type = opts.prefer;
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
    let family = styles.family || 'emoNoto';
    let fz = styles.fz || 50;
    let cursor = styles.cursor || 'default';
    let astyles = { hline: 1, cursor, fz, family, display: 'flex', dir: 'column', justifyContent: 'center', alignItems: 'center' };
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
function mLMR(dParent) {
  dParent = toElem(dParent);
  let d = mDom(dParent, { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-flow': 'row nowrap' });
  let stflex = { gap: 10, display: 'flex', 'align-items': 'center' };
  let [l, m, r] = [mDom(d, stflex), mDom(d, stflex), mDom(d, stflex)];
  return [d, l, m, r];
}
function mLayout(dParent, rowlist, colt, rowt, styles = {}, opts = {}) {
  dParent = toElem(dParent);
  mStyle(dParent, styles);
  rowlist = rowlist.map(x => x.replaceAll('@', valf(opts.suffix, ''))); //console.log(rowlist);
  rowt = rowt.replaceAll('@', valf(opts.hrow, 30));
  colt = colt.replaceAll('@', valf(opts.wcol, 30));
  let areas = `'${rowlist.join("' '")}'`; //console.log(rowlist,areas);
  let newNames = mAreas(dParent, areas, colt, rowt);
  if (opts.registerDivs) {
    if (nundef(DA.divNames)) DA.divNames = [];
    DA.divNames = Array.from(new Set(DA.divNames.concat(newNames)));
  }
  if (opts.shade && nundef(styles.bgSrc)) { mShade(newNames, 2, 1); }
  return newNames.map(x => mBy(x));
}
function mLayoutTLM(dParent, styles = {}, opts = {}) {
  let rowlist = [`dTop@ dTop@`, `dLeft@ dMain@`];
  let colt = `minmax(@px, auto) 1fr`;
  let rowt = `minmax(@px, auto) 1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLayoutTM(dParent, styles = {}, opts = {}, hrow = 30) {
  let rowlist = [`dTop@`, `dMain@`];
  let colt = `1fr`;
  let rowt = `auto 1fr`; // `minmax(@px, auto) 1fr`;
  return mLayout(dParent, rowlist, colt, rowt, styles, opts);
}
function mLinebreak(dParent, gap = 0) {
  dParent = toElem(dParent);
  let display = getComputedStyle(dParent).display;
  if (display == 'flex') {
    d = mDom(dParent, { 'flex-basis': '100%', h: gap, hline: gap, w: '100%' }, { html: '' });
  } else {
    d = mDom(dParent, { hline: gap, h: gap }, { html: '&nbsp;' });
  }
  return d;
}
function mMagnify(elem, scale = 5) {
  elem.classList.add(`topmost`);
  MAGNIFIER_IMAGE = elem;
  const rect = elem.getBoundingClientRect();
  let [w, h] = [rect.width * scale, rect.height * scale];
  let [cx, cy] = [rect.width / 2 + rect.left, rect.height / 2 + rect.top];
  let [l, t, r, b] = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2];
  let originX = 'center';
  let originY = 'center';
  let [tx, ty] = [0, 0];
  if (l < 0) { tx = -l / scale; }
  if (t < 0) { ty = -t / scale; }
  if (r > window.innerWidth) { tx = -(r - window.innerWidth) / scale; }
  if (b > window.innerHeight) { ty = -(b - window.innerHeight) / scale; }
  elem.style.transform = `scale(${scale}) translate(${tx}px,${ty}px)`;
  elem.style.transformOrigin = `${originX} ${originY}`;
}
function mMagnifyOff() {
  if (!MAGNIFIER_IMAGE) return;
  let elem = MAGNIFIER_IMAGE;
  MAGNIFIER_IMAGE = null;
  elem.classList.remove(`topmost`);
  elem.style.transform = null;
}
function mMagnifyOnHoverControlPopup(elem) {
  elem.onmouseenter = ev => {
    if (ev.ctrlKey) {
      let r = getRect(elem, document.body);
      let popup = mDom(document.body, { rounding: 4, position: 'absolute', top: r.y, left: r.x }, { id: 'popup' });
      let clone = elem.cloneNode(true);
      popup.appendChild(clone);
      mClass(popup, 'doublesize')
      popup.onmouseleave = () => popup.remove();
    }
  }
}
function mMenu(dParent, key) { let [d, l, m, r] = mLMR(dParent); return { dParent, elem: d, l, m, r, key, cur: null }; }
function mNewline(d, gap = 1) { mDom(d, { h: gap }); }
function mNode(o, dParent, title, isSized = false) {
  let d = mCreate('div');
  mYaml(d, o);
  let pre = d.getElementsByTagName('pre')[0];
  pre.style.fontFamily = 'inherit';
  if (isdef(title)) mInsert(d, mText(title));
  if (isdef(dParent)) mAppend(dParent, d);
  if (isDict(o)) d.style.textAlign = 'left';
  if (isSized) addClass(d, 'centered');
  return d;
}
async function mNodeUrl() {
  console.log(DA);
  let session = detectSessionType();
  let server = sessionType == 'fastcomet' ? 'https://moxito.online/' : sessionType == 'telecave' ? 'https://www.telecave.net/' : `http://localhost/${DA.serverdir}/`;
  return server + `${projectName}/ppph/`;
}
function mOnEnter(elem, handler) {
  elem.addEventListener('keydown', ev => {
    if (ev.key == 'Enter') {
      ev.preventDefault();
      mDummyFocus();
      if (handler) handler(ev);
    }
  });
}
function mOnEnterInput(elem, handler) {
  elem.addEventListener('keydown', ev => {
    if (ev.key == 'Enter') {
      ev.preventDefault();
      mDummyFocus();
      if (handler) handler(ev.target.value);
    }
  });
}
async function mPalette(dParent, src, showPal = true, showImg = false) {
  async function getPaletteFromCanvas(canvas, n) {
    if (nundef(ColorThiefObject)) ColorThiefObject = new ColorThief();
    const dataUrl = canvas.toDataURL();
    const img = new Image();
    img.src = dataUrl;
    return new Promise((resolve, reject) => {
      img.onload = () => {
        const palette = ColorThiefObject.getPalette(img, n);
        resolve(palette ? palette.map(x => colorFrom(x)) : ['black', 'white']);
      };
      img.onerror = () => {
        reject(new Error('Failed to load the image from canvas.'));
      };
    });
  }
  let dc = mDom(dParent, { display: showImg ? 'inline' : 'none' })
  let ca = await getCanvasCtx(dc, { w: 100, h: 100, fill: 'white' }, { src });
  let palette = await getPaletteFromCanvas(ca.cv);
  if (!showImg) dc.remove();
  if (showPal) showPaletteMini(dParent, palette);
  return palette;
}
async function mPhpPost(cmd, o, jsonResult = true) {
  let server = await getDA('phpUrl');
  if (isdef(o.path) && (o.path.startsWith('zdata') || o.path.startsWith('y'))) o.path = '../../' + o.path;
  if (VERBOSE)console.log('to php:', server + `${cmd}.php`, o);
  let res = await fetch(server + `${cmd}.php`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(o),
    }
  );
  let text;
  try {
    text = await res.text();
    if (!jsonResult) {
      return text;
    }
    let obj = JSON.parse(text);
    if (VERBOSE)console.log('from php:\n', obj);
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
function mPlace(elem, pos, offx, offy) {
  elem = toElem(elem);
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
function mPos(d, x, y, offx = 0, offy = 0, unit = 'px') {
  let dParent = d.parentNode; mIfNotRelative(dParent);
  mStyle(d, { left: `${x + offx}${unit}`, top: `${y + offy}${unit}`, position: 'absolute' });
}
async function mPostRoute(route, o = {}) {
  let server = getServerurl();
  server += `/${route}`;
  const response = await fetch(server, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    body: JSON.stringify(o)
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return 'ERROR 1';
  }
}
async function mPostYaml(o, path) {
  return await mPostRoute('postYaml', { o, path });
}
function mPulse(d, ms, callback = null) { mClass(d, 'onPulse'); TO[getUID()] = setTimeout(() => { mClassRemove(d, 'onPulse'); if (callback) callback(); }, ms); }
function mRadio(label, val, name, dParent, styles = {}, onchangeHandler, group_id, is_on) {
  let cursor = styles.cursor; delete styles.cursor;
  let d = mDom(dParent, styles, { id: group_id + '_' + val });
  let id = isdef(group_id) ? `i_${group_id}_${val}` : getUID();
  let type = isdef(group_id) ? 'radio' : 'checkbox';
  let checked = isdef(is_on) ? is_on : false;
  let inp = mCreateFrom(`<input class='radio' id='${id}' type="${type}" name="${name}" value="${val}">`);
  if (checked) inp.checked = true;
  let text = mCreateFrom(`<label for='${inp.id}'>${label}</label>`);
  if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
  mAppend(d, inp);
  mAppend(d, text);
  if (isdef(onchangeHandler)) {
    inp.onchange = ev => {
      ev.cancelBubble = true;
      if (onchangeHandler == 'toggle') {
      } else if (isdef(onchangeHandler)) {
        onchangeHandler(ev.target.checked, name, val);
      }
    };
  }
  return d;
}
function mRadioGroup(dParent, styles, id, legend, legendstyles = {}) {
  let dOuter = mDom(dParent, { bg: 'white', rounding: 10, margin: 4 })
  let f = mCreate('fieldset');
  f.id = id;
  if (isdef(styles)) mStyle(f, styles);
  if (isdef(legend)) {
    let l = mCreate('legend');
    l.innerHTML = legend;
    mAppend(f, l);
    if (isdef(legendstyles)) { mStyle(l, legendstyles); }
  }
  mAppend(dOuter, f);
  return f;
}
function mRemove(elem) {
  elem = toElem(elem); if (nundef(elem)) return;
  var a = elem.attributes, i, l, n;
  if (a) {
    for (i = a.length - 1; i >= 0; i -= 1) {
      n = a[i].name;
      if (typeof elem[n] === 'function') {
        elem[n] = null;
      }
    }
  }
  a = elem.childNodes;
  if (a) {
    l = a.length;
    for (i = a.length - 1; i >= 0; i -= 1) {
      mRemove(elem.childNodes[i]);
    }
  }
  elem.remove();
}
function mRemoveClass(d) { for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mRemoveIfExists(d) { d = toElem(d); if (isdef(d)) d.remove(); }
function mRows(dParent, arr, itemStyles = { bg: 'random' }, rowStyles = {}, colStyles = {}, akku = []) {
  let d0 = mDom(dParent, { w100: true, h100: true, display: 'flex', dir: 'column', 'justify-content': 'space-between' });
  if (isdef(rowStyles)) mStyle(d0, rowStyles);
  for (let i = 0; i < arr.length; i++) {
    let content = arr[i];
    if (isList(content)) {
      let d1 = mDiv(d0);
      mCols(d1, content, itemStyles, rowStyles, colStyles, akku);
    } else {
      d1 = mContent(content, d0, itemStyles);
      akku.push(d1);
    }
  }
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
function mSelect(dParent, styles = {}, opts = {}) {
  let d0 = mDom(dParent, dictMerge(styles, { gap: 6 }), opts);
  mCenterCenterFlex(d0);
  function onclick(ev) {
    evNoBubble(ev);
    if (isdef(opts.func)) opts.func(ev.target.innerHTML);
  }
  for (const html of opts.list) {
    mDom(d0, {}, { tag: 'button', html, onclick });
  }
  return d0;
}
function mSelectPopup(title, list, func) {
  let d = mDom(document.body, { position: 'fixed', top: 0, left: 0, w: '100vw', h: '100vh', bg: '#00000020', z: 10000 });
  let d1 = mDom(d, { align: 'center', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', padding: 20, box: true, bg: 'white', fg: 'black' });
  mDom(d1, {}, { tag: 'h3', html: title });
  let d0 = mDom(d1, { gap: 20, bg: 'white', fg: 'black', padding: 10, wmin: 200 });
  mCenterCenterFlex(d0);
  function onclick(ev) {
    evNoBubble(ev);
    let v = ev.target.innerHTML;
    if (isdef(func)) func(v);
    mRemove(d);
  }
  for (const html of list) {
    mDom(d0, { bg: '#cccccc80' }, { tag: 'button', html, onclick });
  }
  return d0;
}
function mSetAttr(elem, prop, val) { elem.setAttribute(prop, val); }
function mShade(names, offset = 1, contrast = 1) {
  let palette = paletteTransWhiteBlack(names.length * contrast + 2 * offset).slice(offset);
  for (const name of names) {
    let d = toElem(name);
    mStyle(d, { bg: palette.shift(), fg: 'contrast', box: true });
  }
}
function mShape(shape, dParent, styles = {}, opts = {}) {
  styles = jsCopy(styles);
  styles.display = 'inline-block';
  let [w, h] = mSizeSuccession(styles, 100);
  addKeys({ w, h }, styles);
  let clip = PolyClips[shape];
  if (nundef(clip)) styles.round = true; else styles.clip = clip;
  let d = mDom(dParent, styles, opts);
  if (isdef(opts.pos)) { mPlace(d, opts.pos); }
  else if (isdef(opts.center)) centerAt(d, opts.center.x, opts.center.y);
  return d;
}
function mShield(dParent, styles = {}, opts = {}) {
  addKeys({ bg: '#00000080' }, styles);
  addKeys({ id: 'shield' }, opts);
  dParent = valf(toElem(dParent), document.body);
  let d = mDom(dParent, styles, opts);
  mIfNotRelative(dParent);
  mStyle(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
  mClass(d, 'topmost');
  return d;
}
function mShieldOff(id = 'shield') {
  let d = mBy(id);
  if (isdef(d)) mRemove(d);
}
function mShrinkTranslate(img, dTarget, scale, ms = 800, callback) {
  let [dx, dy] = get_screen_distance(img, dTarget);
  mAnimate(img, 'transform', [`translateX(${dx}px) translateY(${dy}px) scale(${scale})`], callback, ms, 'ease');
}
function mSize(d, w, h, unit = 'px', sizing) {
  if (nundef(h)) h = w;
  mStyle(d, { w, h });
  if (isdef(sizing)) setRect(d, sizing);
}
function mSizeSuccession(styles = {}, szDefault = 100, fromWidth = true) {
  let [w, h] = [styles.w, styles.h];
  if (fromWidth) {
    w = valf(w, styles.sz, h, szDefault);
    h = valf(h, styles.sz, styles.fz, w, szDefault);
  } else {
    h = valf(h, styles.sz, styles.fz, w, szDefault);
    w = valf(w, styles.sz, h, szDefault);
  }
  return [w, h];
}
function mSleep(ms = 1000) {
  return new Promise(
    (res, rej) => {
      if (ms > 10000) { ms = 10000; }
      if (isdef(TO.SLEEPTIMEOUT)) clearTimeout(TO.SLEEPTIMEOUT);
      TO.SLEEPTIMEOUT = setTimeout(res, ms);
    });
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
function mStyle(elem, styles = {}, opts = {}) {
  elem = toElem(elem);
  let styles1 = mStyles(styles);
  for (const key in styles1) {
    elem.style.setProperty(key, styles1[key]);
  }
  applyOpts(elem, opts);
}
function mStyles(styles) {
  let res = {};
  for (const k in styles) {
    let key = k, val = styles[k];
    if (k in STYLES) {
      let dival = STYLES[k];
      if (typeof dival == 'function') {
        val = dival(val, styles.bg);
        if (isList(val)) [key, val] = val;
      }
      else if (isList(dival)) {
        [key, val] = dival;
      } else if (isString(dival)) key = dival;
      else val = dival;
    }
    let val1 = isNumber(val) && !NO_UNIT_STYLES.some(x => key.startsWith(x)) || key == 'fz' ? '' + Number(val) + 'px' : val;
    res[key] = val1;
  }
  return res;
}
function mSvg(dParent, styles = {}, opts = {}) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, opts.tag || "svg");
  mStyle(svg, styles);
  applyOpts(svg, opts);
  if (isdef(dParent)) mAppend(dParent, svg);
  return svg;
}
function mTable(dParent, headers, showheaders, styles = { mabottom: 0 }, className = 'table') {
  let d = mDom(dParent);
  let t = mCreate('table');
  mAppend(d, t);
  if (isdef(className)) mClass(t, className);
  if (isdef(styles)) mStyle(t, styles);
  if (showheaders) {
    let code = `<tr>`;
    for (const h of headers) {
      code += `<th>${h}</th>`
    }
    code += `</tr>`;
    t.innerHTML = code;
  }
  return t;
}
function mTableCol(r, val) {
  let col = mCreate('td');
  mAppend(r, col);
  if (isdef(val)) col.innerHTML = val;
  return col;
}
function mTableCommandify(rowitems, di) {
  for (const item of rowitems) {
    for (const index in di) {
      let colitem = item.colitems[index];
      colitem.div.innerHTML = di[index](item, colitem.val);
    }
  }
}
function mTableRow(t, o, headers, id) {
  let elem = mCreate('tr');
  if (isdef(id)) elem.id = id;
  mAppend(t, elem);
  let colitems = [];
  for (const k of headers) {
    let val = isdef(o[k]) ? isDict(o[k]) ? JSON.stringify(o[k]) : isList(o[k]) ? o[k].join(', ') : o[k] : '';
    let col = mTableCol(elem, val);
    colitems.push({ div: col, key: k, val: val });
  }
  return { div: elem, colitems: colitems };
}
function mTableStylify(rowitems, di) {
  for (const item of rowitems) {
    for (const index in di) {
      let colitem = item.colitems[index];
      mStyle(colitem.div, di[index]);
    }
  }
}
function mText(text, dParent, styles, classes) {
  if (!isString(text)) text = text.toString();
  let d = mDom(dParent);
  if (!isEmpty(text)) { d.innerHTML = text; }
  if (isdef(styles)) mStyle(d, styles);
  if (isdef(classes)) mClass(d, classes);
  return d;
}
function mTimerCreate(dParent, styles = {}, msMax = 10000, format = 'ss', callback = null) {
  addKeys({ w: 80, maleft: 10, fg: 'red', weight: 'bold' }, styles);
  let dtimer = mDom(dParent, styles, { id: 'dTimer' });
  mTimerStop();
  let timer = DA.timer = new mTimer(dtimer, 1000, null, msMax, callback, format);
  timer.start();
  return dtimer;
}
function mTimerStop() {
  if (isdef(DA.timer)) {
    let res = DA.timer.clear();
    DA.timer = null;
    return isNumber(res) ? res : 0;
  }
  return 0;
}
function mToggle(ev) {
  let key = ev.target.getAttribute('data-toggle');
  let t = DA.toggle[key];
  let prev = t.state;
  t.state = (t.state + 1) % t.seq.length;
  let html = t.seq[t.state];
  mStyle(t.elem, { bg: t.states[html] }, { html });
  if (isdef(t.handler)) t.handler(key, prev, t.state);
}
async function mToggleButton(dParent, styles = {}) {
  addKeys({ display: 'flex', wrap: 'wrap', alignItems: 'center' }, styles)
  let d1 = mDom(dParent, styles, { tag: 'button' });
  let list = Array.from(arguments).slice(2);
  let buttons = [];
  let style = { className: 'no_select', display: 'flex', 'flex-wrap': 'nowrap', alignItems: 'center', cursor: 'pointer' };
  let words = list.map(x => x.label);
  let hasKey = list.some(x => x.key);
  let w = getMaxWordWidth(words, d1) + (hasKey ? valf(styles.h, 30) * 1.35 + 2 : 10); //console.log(w);
  mStyle(d1, { w, justifyContent: 'center' });
  for (const l of list) {
    let b = mDom(d1, style, { onclick: l.onclick });
    mDom(b, { maright: 6, 'white-space': 'nowrap' }, { html: l.label });
    if (l.key) await mKey(l.key, b, { h: styles.h, w: styles.h, fz: styles.h }); //:fz:valf(styles.h,50) });
    buttons.push(b);
  }
  return mToggleCompose(...buttons);
}
function mToggleCompose() {
  let list = Array.from(arguments);
  if (isEmpty(list)) return;
  let dParent = list[0].parentNode;
  let tb = mDom(dParent);
  let n = list.length;
  let i = 0;
  for (const b of list) {
    mAppend(tb, b);
    b.setAttribute('idx', i++);
    if (i < n) mStyle(b, { display: 'none' });
  }
  tb.onclick = ev => {
    let idx = Number(evToAttr(ev, 'idx'));
    let inew = (idx + 1) % n;
    let b = list[inew];
    list.map(x => mStyle(x, { display: 'none' }));
    mStyle(b, { display: 'flex' });
  }
  return tb;
}
function mUnselect(elem) { mClassRemove(elem, 'framedPicture'); }
function mYaml(d, js) {
  d.innerHTML = '<pre>' + jsonToYaml(js) + '</pre>';
}
function mYesNo(dParent, styles = {}, opts = {}) {
  console.log('____ mYesNo', dParent, styles, opts);
  return mSelect(dParent, styles, dictMerge(opts, { list: ['yes', 'no'] }));
}
function makeArrayWithParts(keys) {
  let arr = []; keys[0].split('_').map(x => arr.push([]));
  for (const key of keys) {
    let parts = key.split('_');
    for (let i = 0; i < parts.length; i++) arr[i].push(parts[i]);
  }
  return arr;
}
function makeCategories() {
  let keys = Categories = {
    animal: getGSGElements(g => g == 'Animals & Nature', s => startsWith(s, 'animal')),
    clothing: getGSGElements(g => g == 'Objects', s => s == 'clothing'),
    emotion: getGSGElements(g => g == 'Smileys & Emotion', s => startsWith(s, 'face') && !['face-costume', 'face-hat'].includes(s)),
    food: getGSGElements(g => g == 'Food & Drink', s => startsWith(s, 'food')),
    'game/toy': (['sparkler', 'firecracker', 'artist palette', 'balloon', 'confetti ball'].concat(ByGroupSubgroup['Activities']['game'])).sort(),
    gesture: getGSGElements(g => g == 'People & Body', s => startsWith(s, 'hand')),
    job: ByGroupSubgroup['People & Body']['job'],
    mammal: ByGroupSubgroup['Animals & Nature']['animal-mammal'],
    music: getGSGElements(g => g == 'Objects', s => startsWith(s, 'musi')),
    object: getGSGElements(g => g == 'Objects', s => true),
    place: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'place')),
    plant: getGSGElements(g => g == 'Animals & Nature' || g == 'Food & Drink', s => startsWith(s, 'plant') || s == 'food-vegetable' || s == 'food-fruit'),
    sport: ByGroupSubgroup['Activities']['sport'],
    tool: getGSGElements(g => g == 'Objects', s => s == 'tool'),
    transport: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'transport')),
  };
  let incompatible = DA.incompatibleCats = {
    animal: ['mammal'],
    clothing: ['object'],
    emotion: ['gesture'],
    food: ['plant', 'animal'],
    'game/toy': ['object', 'music'],
    gesture: ['emotion'],
    job: ['sport'],
    mammal: ['animal'],
    music: ['object', 'game/toy'],
    object: ['music', 'clothing', 'game/toy', 'tool'],
    place: [],
    plant: ['food'],
    sport: ['job'],
    tool: ['object'],
    transport: [],
  }
}
function makeContainer(dParent, szCard) {
  let card = cRound(dParent, { margin: 12, border: '2 #888', w: szCard, h: szCard });
  return iDiv(card);
}
function makeGridColumns(element, columns) {
  element.style.display = "grid";
  element.style.gridTemplateColumns = columns;
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
async function makeMove(gameId, move) {
  return await api('POST', `/make_move/${gameId}`, { move });
}
function makePool(cond, source, R) {
  if (nundef(cond)) return [];
  else if (cond == 'all') return source;
  let pool = [];
  for (const oid of source) {
    let o = R.getO(oid);
    if (!evalConds(o, cond)) continue;
    pool.push(oid);
  }
  return pool;
}
function makeSelectable(o) {
  let d = iDiv(o);
  mClass(d, 'hoverScale');
}
function makeSymbolText(txt, fontSize, x, y, options = {}) {
  txt = decodeHtmlEntity(txt);
  const ns = "http://www.w3.org/2000/svg";
  const t = document.createElementNS(ns, "text");
  t.setAttribute("x", x);
  t.setAttribute("y", y);
  t.setAttribute("fill", options.fill || color);
  t.setAttribute("font-size", fontSize);
  t.setAttribute("text-anchor", "middle");
  t.setAttribute("dominant-baseline", "middle");
  t.setAttribute(
    "font-family",
    options.fontFamily ||
    '"DejaVu Sans","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif"'
  );
  t.textContent = txt;
  if (options.transform) t.setAttribute("transform", options.transform);
  return t;
}
function makeUnitString(nOrString, unit = 'px', defaultVal = '100%') {
  if (nundef(nOrString)) return defaultVal;
  if (isNumber(nOrString)) nOrString = '' + nOrString + unit;
  return nOrString;
}
function make_card_selectable(item) {
  let d = item.div;
  mClass(d, 'selectable');
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
function mapRange(value, inMin, inMax, outMin, outMax) {
  return Math.round((value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
}
function matchWildcardArray(pattern, stringArray) {
  const regexPattern = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape regex special chars
    .replace(/\*/g, '.*');                // Convert wildcard to regex equivalents
  const regex = new RegExp(`^${regexPattern}$`, 'i'); // 'i' flag makes it case-insensitive
  return stringArray.filter(str => regex.test(str));
}
function measureElement(el) {
  let info = window.getComputedStyle(el, null);
  return { w: info.width, h: info.height };
}
function measureFieldset(fs) {
  let legend = fs.firstChild;
  let r = getRect(legend);
  let labels = fs.getElementsByTagName('label');
  let wmax = 0;
  for (const l of labels) {
    let r1 = getRect(l);
    wmax = Math.max(wmax, r1.w);
  }
  let wt = r.w;
  let wo = wmax + 24;
  let diff = wt - wo;
  if (diff >= 10) {
    for (const l of labels) { let d = l.parentNode; mStyle(d, { maleft: diff / 2 }); }
  }
  let wneeded = Math.max(wt, wo) + 10;
  mStyle(fs, { wmin: wneeded });
  for (const l of labels) { let d = l.parentNode; mStyle(l, { display: 'inline-block', wmin: 50 }); mStyle(d, { wmin: wneeded - 40 }); }
}
function measureHeightOfTextStyle(dParent, styles = {}) {
  let d = mDom(dParent, styles, { html: 'Hql' });
  let s = measureElement(d);
  d.remove();
  return firstNumber(s.h);
}
function measureText(text, styles = {}, cx = null) {
  function getTextWidth(text, font) {
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    var context = canvas.getContext('2d');
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
  }
  if (!cx) {
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    cx = canvas.getContext('2d');
  }
  cx.font = isdef(styles.font) ? styles.font : `${styles.fz}px ${styles.family}`;
  var metrics = cx.measureText(text);
  return [metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent];
}
async function measureUsedAreaOfDiv(div) {
  const canvas = await html2canvas(div, {
    backgroundColor: null, // preserve transparency
    scale: 1
  });
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height).data;
  let minX = width, minY = height, maxX = 0, maxY = 0;
  let hasContent = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const alpha = imageData[index + 3];
      if (alpha > 0) {
        hasContent = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!hasContent) return null;
  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}
function mergeArrays(target, source) {
  function getKey(item) { return item.key || item.id || item.name; }
  const merged = Array.from(target);
  const keyMap = {};
  target.forEach((item, index) => {
    const k = getKey(item);
    if (k) keyMap[k] = index;
  });
  source.forEach((item) => {
    const k = getKey(item);
    if (k && keyMap[k] !== undefined) {
      merged[keyMap[k]] = deepMerge(target[keyMap[k]], item);
    } else {
      merged.push(item);
    }
  });
  return merged;
}
function mergeDynSetNodes(o) {
  let merged = {};
  let interpool = null;
  for (const nodeId in o.RSG) {
    let node = jsCopy(dynSpec[nodeId]);
    let pool = node.pool;
    if (pool) {
      if (!interpool) interpool = pool;
      else interpool = intersection(interpool, pool);
    }
    merged = deepmerge(merged, node);
  }
  merged.pool = interpool;
  return merged;
}
function mergeFallbackAnnotations(baseEmoji) {
  const fallback = {
    "☄️": {
      "en": { "name": "comet", "keywords": ["comet", "space", "astronomy", "meteor"] },
      "de": { "name": "Komet", "keywords": ["Komet", "Weltraum", "Astronomie", "Meteor"] },
      "es": { "name": "cometa", "keywords": ["cometa", "espacio", "astronomía", "meteoro"] },
      "fr": { "name": "comète", "keywords": ["comète", "espace", "astronomie", "météore"] }
    },
    "⚒️": {
      "en": { "name": "hammer and pick", "keywords": ["hammer", "pick", "tools", "mining", "construction"] },
      "de": { "name": "Hammer und Spitzhacke", "keywords": ["Hammer", "Spitzhacke", "Werkzeug", "Bergbau", "Bau"] },
      "es": { "name": "martillo y pico", "keywords": ["martillo", "pico", "herramienta", "minería", "construcción"] },
      "fr": { "name": "marteau et pioche", "keywords": ["marteau", "pioche", "outil", "mine", "construction"] }
    },
    "⚓": {
      "en": { "name": "anchor", "keywords": ["anchor", "ship", "navy", "stability", "nautical"] },
      "de": { "name": "Anker", "keywords": ["Anker", "Schiff", "Marine", "Stabilität", "Nautik"] },
      "es": { "name": "ancla", "keywords": ["ancla", "barco", "marina", "estabilidad", "náutico"] },
      "fr": { "name": "ancre", "keywords": ["ancre", "bateau", "marine", "stabilité", "nautique"] }
    },
    "⚔️": {
      "en": { "name": "crossed swords", "keywords": ["swords", "crossed", "battle", "war", "duel"] },
      "de": { "name": "Gekreuzte Schwerter", "keywords": ["Schwerter", "gekreuzt", "Kampf", "Krieg", "Duell"] },
      "es": { "name": "espadas cruzadas", "keywords": ["espadas", "cruzadas", "batalla", "guerra", "duelo"] },
      "fr": { "name": "épées croisées", "keywords": ["épées", "croisées", "combat", "guerre", "duel"] }
    },
    "⚕️": {
      "en": { "name": "medical symbol", "keywords": ["medical", "health", "medicine", "staff of asclepius"] },
      "de": { "name": "Medizinisches Symbol", "keywords": ["medizin", "Gesundheit", "Arzt", "Äskulapstab"] },
      "es": { "name": "símbolo médico", "keywords": ["médico", "salud", "medicina", "bastón de Asclepio"] },
      "fr": { "name": "symbole médical", "keywords": ["médical", "santé", "médecine", "bâton d’Asclépios"] }
    },
    "⚖️": {
      "en": { "name": "balance scale", "keywords": ["scale", "balance", "justice", "law"] },
      "de": { "name": "Waage", "keywords": ["Waage", "Gleichgewicht", "Gerechtigkeit", "Recht"] },
      "es": { "name": "balanza", "keywords": ["balanza", "equilibrio", "justicia", "ley"] },
      "fr": { "name": "balance", "keywords": ["balance", "équilibre", "justice", "loi"] }
    },
    "⚗️": {
      "en": { "name": "alembic", "keywords": ["alembic", "chemistry", "distillation", "experiment"] },
      "de": { "name": "Alembik", "keywords": ["Labor", "Chemie", "Destillation", "Experiment"] },
      "es": { "name": "alambique", "keywords": ["alambique", "química", "destilación", "experimento"] },
      "fr": { "name": "alambic", "keywords": ["alambic", "chimie", "distillation", "expérience"] }
    },
    "⚙️": {
      "en": { "name": "gear", "keywords": ["gear", "settings", "tool", "mechanical"] },
      "de": { "name": "Zahnrad", "keywords": ["Zahnrad", "Einstellung", "Werkzeug", "Mechanik"] },
      "es": { "name": "engranaje", "keywords": ["engranaje", "ajuste", "herramienta", "mecánico"] },
      "fr": { "name": "engrenage", "keywords": ["engrenage", "réglage", "outil", "mécanique"] }
    },
    "⚚": {
      "en": { "name": "staff of hermes", "keywords": ["hermes", "caduceus", "commerce", "mythology"] },
      "de": { "name": "Stab des Hermes", "keywords": ["Hermes", "Caduceus", "Handel", "Mythologie"] },
      "es": { "name": "caduceo", "keywords": ["hermes", "caduceo", "comercio", "mitología"] },
      "fr": { "name": "caducée", "keywords": ["Hermès", "caducée", "commerce", "mythologie"] }
    },
    "⚛️": {
      "en": { "name": "atom symbol", "keywords": ["atom", "science", "nuclear", "particle"] },
      "de": { "name": "Atomsymbol", "keywords": ["Atom", "Wissenschaft", "Kern", "Teilchen"] },
      "es": { "name": "símbolo atómico", "keywords": ["átomo", "ciencia", "nuclear", "partícula"] },
      "fr": { "name": "symbole atomique", "keywords": ["atome", "science", "nucléaire", "particule"] }
    },
    "⚜️": {
      "en": { "name": "fleur-de-lis", "keywords": ["fleur-de-lis", "symbol", "heraldry", "france"] },
      "de": { "name": "Lilie", "keywords": ["Lilie", "Symbol", "Heraldik", "Frankreich"] },
      "es": { "name": "flor de lis", "keywords": ["flor de lis", "símbolo", "heráldica", "francia"] },
      "fr": { "name": "fleur de lys", "keywords": ["fleur de lys", "symbole", "héraldique", "France"] }
    },
    "⚝": {
      "en": { "name": "outline star", "keywords": ["star", "outline", "symbol"] },
      "de": { "name": "Umrissstern", "keywords": ["Stern", "Umriss", "Symbol"] },
      "es": { "name": "estrella en contorno", "keywords": ["estrella", "contorno", "símbolo"] },
      "fr": { "name": "étoile en contour", "keywords": ["étoile", "contour", "symbole"] }
    },
    "⚞": {
      "en": { "name": "three lines converging left", "keywords": ["lines", "symbol", "arrow"] },
      "de": { "name": "Drei Linien links", "keywords": ["Linien", "Symbol", "Pfeil"] },
      "es": { "name": "tres líneas hacia la izquierda", "keywords": ["líneas", "símbolo", "flecha"] },
      "fr": { "name": "trois traits à gauche", "keywords": ["traits", "symbole", "flèche"] }
    },
    "⚟": {
      "en": { "name": "three lines converging right", "keywords": ["lines", "symbol", "arrow"] },
      "de": { "name": "Drei Linien rechts", "keywords": ["Linien", "Symbol", "Pfeil"] },
      "es": { "name": "tres líneas hacia la derecha", "keywords": ["líneas", "símbolo", "flecha"] },
      "fr": { "name": "trois traits à droite", "keywords": ["traits", "symbole", "flèche"] }
    },
    "⛏️": {
      "en": { "name": "pick", "keywords": ["pickaxe", "tools", "mining", "digging", "stone"] },
      "de": { "name": "Hacke", "keywords": ["Werkzeug", "Bergbau", "Graben", "Stein", "Arbeit"] },
      "es": { "name": "pico", "keywords": ["herramienta", "minería", "excavar", "piedra", "trabajo"] },
      "fr": { "name": "pioche", "keywords": ["outil", "mine", "creuser", "pierre", "travail"] }
    },
    "⛑️": {
      "en": { "name": "rescue helmet", "keywords": ["helmet", "rescue", "protection", "worker"] },
      "de": { "name": "Rettungshelm", "keywords": ["Helm", "Rettung", "Schutz", "Arbeiter"] },
      "es": { "name": "casco de rescate", "keywords": ["casco", "rescate", "protección", "trabajador"] },
      "fr": { "name": "casque de secours", "keywords": ["casque", "secours", "protection", "ouvrier"] }
    },
    "⛓️": {
      "en": { "name": "chains", "keywords": ["chain", "link", "metal", "binding", "connection"] },
      "de": { "name": "Ketten", "keywords": ["Kette", "Verbinden", "Metall", "Bindung", "Verbindung"] },
      "es": { "name": "cadenas", "keywords": ["cadena", "vínculo", "metal", "unión", "enlace"] },
      "fr": { "name": "chaînes", "keywords": ["chaîne", "lien", "métal", "connexion", "attache"] }
    },
    "⛰️": {
      "en": { "name": "mountain", "keywords": ["mountain", "peak", "nature", "hiking", "landscape"] },
      "de": { "name": "Berg", "keywords": ["Berg", "Gipfel", "Natur", "Wandern", "Landschaft"] },
      "es": { "name": "montaña", "keywords": ["montaña", "cumbre", "naturaleza", "senderismo", "paisaje"] },
      "fr": { "name": "montagne", "keywords": ["montagne", "sommet", "nature", "randonnée", "paysage"] }
    },
    "⛱️": {
      "en": { "name": "beach umbrella", "keywords": ["umbrella", "beach", "sun", "shade", "relax"] },
      "de": { "name": "Strandsonnenschirm", "keywords": ["Schirm", "Strand", "Sonne", "Schatten", "Entspannen"] },
      "es": { "name": "sombrilla de playa", "keywords": ["sombrilla", "playa", "sol", "sombra", "descanso"] },
      "fr": { "name": "parasol de plage", "keywords": ["parasol", "plage", "soleil", "ombre", "détente"] }
    },
    "⛸️": {
      "en": { "name": "ice skate", "keywords": ["ice", "skate", "winter", "sport"] },
      "de": { "name": "Schlittschuh", "keywords": ["Eis", "Sport", "Winter", "Schlittschuhlaufen"] },
      "es": { "name": "patín de hielo", "keywords": ["hielo", "patín", "invierno", "deporte"] },
      "fr": { "name": "patin à glace", "keywords": ["glace", "patin", "hiver", "sport"] }
    },
    "⛳": {
      "en": { "name": "golf hole", "keywords": ["golf", "hole", "flag", "sport"] },
      "de": { "name": "Golfloch mit Fahne", "keywords": ["Golf", "Loch", "Fahne", "Sport"] },
      "es": { "name": "hoyo de golf con bandera", "keywords": ["golf", "hoyo", "bandera", "deporte"] },
      "fr": { "name": "trou de golf avec drapeau", "keywords": ["golf", "trou", "drapeau", "sport"] }
    },
    "⛴️": {
      "en": { "name": "ferry", "keywords": ["ferry", "boat", "ship", "transport", "travel"] },
      "de": { "name": "Fähre", "keywords": ["Fähre", "Boot", "Schiff", "Transport", "Reise"] },
      "es": { "name": "ferry", "keywords": ["ferry", "barco", "buque", "transporte", "viaje"] },
      "fr": { "name": "ferry", "keywords": ["ferry", "bateau", "navire", "transport", "voyage"] }
    },
    "⛺": {
      "en": { "name": "tent", "keywords": ["tent", "camping", "nature", "outdoor", "recreation"] },
      "de": { "name": "Zelt", "keywords": ["Zelt", "Camping", "Natur", "Freizeit"] },
      "es": { "name": "tienda de campaña", "keywords": ["tienda", "camping", "naturaleza", "aire libre"] },
      "fr": { "name": "tente", "keywords": ["tente", "camping", "nature", "plein air"] }
    },
    "⛽": {
      "en": { "name": "fuel pump", "keywords": ["fuel", "gas", "station", "petrol"] },
      "de": { "name": "Tankstelle", "keywords": ["Tankstelle", "Benzin", "Treibstoff", "Pumpe"] },
      "es": { "name": "gasolinera", "keywords": ["gasolinera", "combustible", "bomba", "gasolina"] },
      "fr": { "name": "station-service", "keywords": ["station-service", "carburant", "pompe", "essence"] }
    }
  }
  for (const cp in fallback) {
    if (!baseEmoji[cp]) {
      baseEmoji[cp] = fallback[cp];
    }
  }
  return baseEmoji;
}
function mergeObject(target, source, optionsArgument) {
  var destination = {}
  if (isMergeableObject(target)) {
    Object.keys(target).forEach(function (key) {
      destination[key] = cloneIfNecessary(target[key], optionsArgument)
    })
  }
  Object.keys(source).forEach(function (key) {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneIfNecessary(source[key], optionsArgument)
    } else {
      destination[key] = deepmerge(target[key], source[key], optionsArgument)
    }
  })
  return destination;
}
function mergeOverride(base, drueber) { return _deepMerge(base, drueber, { arrayMerge: _overwriteMerge }); }
function mergeOverrideArrays(base, drueber) {
  return deepmerge(base, drueber, { arrayMerge: overwriteMerge });
}
function mimali(c, m) {
  let seasonColors = 'winter_blue midnightblue light_azure capri spring_frost light_green deep_green summer_sky yellow_pantone orange pale_fallen_leaves timberwolf'.split(' ');
  let c2 = seasonColors[m - 1];
  let colors = paletteMix(c, c2, 6).slice();
  let wheel = [];
  for (const x of colors) {
    let pal1 = paletteShades(x);
    for (const i of range(7)) wheel.push(pal1[i + 2]);
  }
  return wheel;
}
function miniClearMain() {
  clearTimeouts();
  clearEvents();
  clearMessage(true);
  staticTitle();
  mClear('dTitle');
  mClear('dHidden');
  mClear('dInstruction')
}
function mixColors(c1, c2, c2Weight01) {
  let [color1, color2] = [colorFrom(c1), colorFrom(c2)]
  const hex1 = color1.substring(1);
  const hex2 = color2.substring(1);
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  const r = Math.floor(r1 * (1 - c2Weight01) + r2 * c2Weight01);
  const g = Math.floor(g1 * (1 - c2Weight01) + g2 * c2Weight01);
  const b = Math.floor(b1 * (1 - c2Weight01) + b2 * c2Weight01);
  const hex = colorRgbArgsToHex79(r, g, b);
  return hex;
}
function modify_item_for_adaptive(item, items, n) {
  item.numSyms = n;
  [item.rows, item.cols, item.colarr] = calc_syms(item.numSyms);
  let other_items = items.filter(x => x != item);
  let shared_syms = find_shared_keys(item.keys, other_items.map(x => x.keys));
  let other_symbols = item.keys.filter(x => !shared_syms.includes(x));
  item.keys = shared_syms;
  let num_missing = item.numSyms - item.keys.length;
  item.keys = item.keys.concat(rChoose(other_symbols, num_missing));
  shuffle(item.keys);
  item.scales = item.keys.map(x => rChoose([1, .75, 1.2, .9, .8]));
}
function msKey(key, d, styles = {}, opts = {}) {
  styles = jsCopy(styles);
  let o = key.includes('.') ? { src: key } : opts.prefer == 'plain' ? { plain: key } : lookup(M.superdi, [key]);
  let type = opts.prefer;
  let types = ['src', 'img', 'photo', 'uni', 'emo', 'fa6', 'fa', 'ga', 'plain'];
  if (nundef(o[type])) type = types.find(x => isdef(o[x]));
  let d0;
  if (['img', 'src', 'photo'].includes(type)) {
    d0 = mDom(d, { ...styles, h: 100 }, { ...opts, tag: 'img', src: o[type], alt: key });
  } else if (type == 'plain') {
    d0 = mDom(d, { styles, className: 'label' }, { ...opts, html: o[type], title: o[type] });
  } else {
    let family = Families[type] || 'inherit';
    let text = ['fa6', 'fa', 'ga'].includes(type) ? `&#x${o[type]};` : o[type];
    d0 = mDom(d, { ...styles, family }, { ...opts, html: text });
  }
  return d0;
}
function name2id(name) { return 'd_' + name.split(' ').join('_'); }
function nextBar(ctx, rest, color) {
  list = rest;
  let val = findMostFrequentVal(list, 'x');
  rest = list.filter(p => !isWithinDelta(p.x, val, 2));
  let line = getBar(ctx, list, val);
  line.map(p => drawPix(ctx, p.x, p.y, color));
  return { val, line, rest, color };
}
function nextLine(ctx, rest, color) {
  list = rest;
  let val = findMostFrequentVal(list, 'y');
  rest = list.filter(p => !isWithinDelta(p.y, val, 2));
  let line = getLine(ctx, list, val);
  if (line) line.map(p => drawPix(ctx, p.x, p.y, color));
  return { val, line, rest, color };
}
function normalizeString(s, opts = {}) {
  let sep = valf(opts.sep, '_');
  let keep = valf(opts.keep, []);
  let lowercase = isdef(opts.lowercase) ? opts.lowercase : true;
  s = lowercase ? s.toLowerCase().trim() : s.trim();
  let res = '';
  for (let i = 0; i < s.length; i++) { if (isAlphaNum(s[i]) || keep.includes(s[i])) res += s[i]; else if (last(res) != sep) res += sep; }
  return res;
}
function normalize_bid(bid) {
  let need_to_sort = bid[0] == '_' && bid[2] != '_'
    || bid[2] != '_' && bid[2] > bid[0]
    || bid[2] == bid[0] && is_higher_ranked_name(bid[3], bid[1]);
  if (need_to_sort) {
    let [h0, h1] = [bid[0], bid[1]];
    [bid[0], bid[1]] = [bid[2], bid[3]];
    [bid[2], bid[3]] = [h0, h1];
  }
  return bid;
}
function nundef(x) { return x === null || x === undefined || x === 'undefined'; }
function onMouseMoveLine(ev) {
  let d = mBy('dCanvas'); //ev.target;
  let b = mGetStyle(d, 'border-width'); //if (VERBOSE)//console.log(b);
  const mouseX = ev.clientX - d.offsetLeft - b;
  const mouseY = ev.clientY + 2 - d.offsetTop - b;
  B.lines.forEach(line => {
    const x1 = parseFloat(iDiv(line).dataset.x1);
    const y1 = parseFloat(iDiv(line).dataset.y1);
    const x2 = parseFloat(iDiv(line).dataset.x2);
    const y2 = parseFloat(iDiv(line).dataset.y2);
    const thickness = B.triggerThreshold;
    const distance = pointToLineDistance(mouseX, mouseY, x1, y1, x2, y2);
    if (distance <= thickness / 2) {
      mStyle(iDiv(line), { opacity: 1, bg: 'red' });
    } else {
      mStyle(iDiv(line), { opacity: .1, bg: 'white' });
    }
  });
}
async function onPoll() {
  while (isBusy()) await mSleep(100);
  assertion()
}
async function onchangeAutoSwitch() {
  if (DA.autoSwitch === true) {
    DA.autoSwitch = false
  } else {
    DA.autoSwitch = true
  }
}
async function onclickAddToThemes(ev) {
  let theme = jsCopy(DA.theme);
  let newname = await mGather(mInput, ev.target, { bg: 'pink', padding: 4 }, { value: '' });
  console.log('you entered', newname);
  theme.name = newname;
  let old = M.config.themes[newname]; if (isdef(old)) {console.log(old); delete M.config.themes[newname]; }
  let key = newname;
  let o = { name: theme.name, color: theme.color, fg: theme.fg, bgBlend: theme.bgBlend, bgRepeat: theme.bgRepeat, bgSize: theme.bgSize, texture: theme.texture };
  let onew = {};
  for (const k in o) if (!isEmpty(o[k])) onew[k] = o[k];
  console.log('new theme', key, onew)
  M.config.themes[key] = onew;
  await postConfig();
}
async function onclickBackgroundColor(ev) {
  let bg = mGetStyle(ev.target, 'bg');
  let dSample = mBy('dThemeSample');
  let dbg = mBy('dThemeColors');
  console.log('dbg', dbg, 'dSample', dSample);
  mStyle(dSample, { bg });
  mStyle(dbg, { bg });
}
async function onclickBlendMode(blendCSS) {
  async function fkeep(answer) {
    if (answer == 'yes') {
      applyBlendMode(blendCSS);
      await setBlendModeToItem(blendCSS);
    }
    else applyBlendMode(U.bgBlend);
  }
  applyBlendMode(blendCSS);
  mSelectPopup('Keep blend mode?', ['yes', 'no'], fkeep);
}
async function onclickClearPlayers() {
  let me = U.name;
  DA.playerList = [me];
  for (const name in DA.allPlayers) {
    if (name != me) unselectPlayerItem(DA.allPlayers[name]);
  }
  assertion(!isEmpty(DA.playerList), "uname removed from playerList!!!!!!!!!!!!!!!")
  DA.lastName = me;
  mRemoveIfExists('dPlayerOptions')
}
async function onclickColorInSettings(color, el) {
  async function fkeep(answer) {
    if (answer == 'yes') {
      await setColorsToItem(color);
    } else {
      applyColor(U.color);
    }
  }
  applyColor(color);
  mSelectPopup('Keep color?', ['yes', 'no'], fkeep);
}
async function onclickDeleteAll(id) {
  if (localStorage.getItem('tid') == id) {
    localStorage.removeItem('tid');
    DA.tid = null;
  }
  res = await dbDeleteAllTables();
  await updateMain();
}
async function onclickDeleteFinished(id) {
  if (localStorage.getItem('tid') == id) {
    localStorage.removeItem('tid');
    DA.tid = null;
  }
  res = await dbDeleteFinishedTables();
  await updateMain();
}
async function onclickForegroundColor(ev) {
  let fg = mGetStyle(ev.target, 'bg');
  let dSample = mBy('dThemeSample');
  let dbg = mBy('dThemeColors');
  console.log('dbg', dbg, 'dSample', dSample);
  mStyle(dSample, { fg });
  mStyle(dbg, { fg });
}
async function onclickGameMenuItem(ev) {
  evNoBubble(ev);
  let prev = document.querySelector('.framedPicture');
  if (isdef(prev)) mClassRemove(prev, 'framedPicture');
  let elem = evToAttrElem(ev, 'gamename').elem; //console.log('elem', elem);
  mClass(elem, 'framedPicture');
  let gamename = evToAttr(ev, 'gamename');
  pollOff();
  await showGameMenu(gamename);
}
async function onclickGameMenuPlayer(ev) {
  let name = evToAttr(ev, 'username'); //console.log('name',name); return;
  let shift = ev.shiftKey;
  await showGameMenuPlayerDialog(name, shift);
}
async function onclickGameStart() {
  let options = collectOptions();
  let players = collectPlayers();
  await saveAndUpdateAllPlayerOptions()
  mRemove('dGameMenu');
  let table = tableCreate(DA.gamename, players, options, 'open');
  gtSetToStarted(table);
  await tableSaveNew(table);
  DA.tid = table.id;
  await switchToMenu('table');
}
async function onclickModifyGameState() {
  let o = DAGetTable();
  let onew = pickFromObject(o, ['owner', 'turn', 'game', 'status', 'id', 'name', 'modified', 'friendly']); //, 'game_friendly', 'xplayerNames']);
  onew.msg = 'HAAAAAAAAAAAAALLLLO ' + getNow();
  await tableSave(onew);
  await updateMain();
}
async function onclickMoreUsers() {
  let animation = 'diamond-in-center .5s ease-in-out';
  let dPopup = mDom('dPage', { animation, position: 'absolute', top: 0, left: 0, w: '100vw', h: '100vh', z: 10000, bg: 'rgba(0,0,0,0.5)' }, { className: 'flexCS' });
  let dParent = mDom(dPopup, { hmin: 200, wmax: 700, padding: 20, gap: 10, w: '70%', rounding: 20, margin: '10%', patop: 20, bg: 'white' }, { className: 'flexCC' });
  for (const name in M.users) {
    showUser(dParent, name, async (ev) => {
      ev.stopPropagation();
      let img = ev.target;
      mShrinkTranslate(img, mBy('dMenuRight'), .75, 700, async () => {
        dPopup.remove();
        switchToUser(name);
      });
    });
  }
  let dinp = mDom(dParent, { fz: 20, maleft: 12, bg: 'lightgray', fg: 'black', border: '1px solid dimgray', align: 'center', w: 120, rounding: 8 }, { tag: 'input', type: 'text', placeholder: '<new user>' });
  dinp.onchange = async ev => {
    let uname = ev.target.value.trim();
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
async function onclickOpenToJoinGame() {
  let options = collectOptions();
  let players = collectPlayers();
  await saveAndUpdateAllPlayerOptions()
  mRemove('dGameMenu');
  let table = tableCreate(DA.gamename, players, options, 'open');
  await tableSaveNew(table);
  await updateMain();
}
async function onclickReload() {
  console.log('reload!!!')
  location.reload();
}
function onclickRevertTheme() {
  DA.theme = jsCopy(DA.orig);
  redrawTheme();
}
async function onclickSaveTheme() {
  console.log('Save', DA.theme.name, DA.theme)
  copyKeys(DA.theme, M.config.themes[DA.theme.name]);
  await postConfig();
}
async function onclickSettAvatar() {
  localStorage.setItem('settingsMenu', 'Avatar');
  let d = mBy('dSettings'); mClear(d);
  await mImageSaveUI(d, 'assets/img/users', M.users[U.name].imgKey, 'override');
}
async function onclickSettBlendMode() {
  if (isEmpty(U.texture)) {
    showMessage('You need to set a Texture in order to set a Blend Mode!');
    return;
  }
  localStorage.setItem('settingsMenu', 'Blend Mode')
  showBlendModes();
}
async function onclickSettColor() {
  localStorage.setItem('settingsMenu', 'Color')
  await showColors();
}
async function onclickSettContainTextures() {
  localStorage.setItem('settingsMenu', 'Contain');
  await showTextures('tcontain');
}
async function onclickSettDeleteTheme() {
  let name = `th_${U.name}`;
  if (!lookup(M.config, ['themes', name])) { showMessage(`theme ${name} does not exist!`); return; }
  delete M.config.themes[name];
  await postConfig();
  await onclickSettingsThemes();
}
async function onclickSettMoreTextures() {
  localStorage.setItem('settingsMenu', 'More Textures');
  await showTextures('tnew');
}
async function onclickSettNewTextures() {
  localStorage.setItem('settingsMenu', 'New Textures');
  await showTextures('textures3');
}
async function onclickSettRemoveTexture() {
  if (isEmpty(U.texture)) return;
  for (const prop of ['texture', 'palette', 'blendMode', 'bgImage', 'bgSize', 'bgBlend', 'bgRepeat']) delete U[prop];
  await updateUserTheme();
}
async function onclickSettRepeatTextures() {
  localStorage.setItem('settingsMenu', 'Repeat');
  await showTextures('trepeat');
}
async function onclickSettResetAll() {
  let prev = DA.restoreSetting;
  if (nundef(prev)) {console.log('nothing to revert!'); return; }
  copyKeys(prev, U);
  DA.restoreSetting = null;
  updateUserTheme();
}
async function onclickSettTexture() {
  localStorage.setItem('settingsMenu', 'Texture');
  await showTextures();
}
async function onclickSettThemeEditor(ev) {
  localStorage.setItem('settingsMenu', 'Theme Editor');
  DA.themeKey = null;
  DA.theme = jsCopy(U);
  DA.orig = jsCopy(DA.theme);
  await showThemeEditor();
}
async function onclickSettingsThemes() {
  localStorage.setItem('settingsMenu', 'Themes');
  let d = mBy('dSettings'); mClear(d);
  let d1 = mDom(d, { gap: 12, padding: 10 }); mFlexWrap(d1);
  let themes = lookup(M.config, ['themes']);
  let name, fg;
  for (const key in themes) {
    let th = themes[key];
    let bg = th.color;
    fg = th.fg || colorIdealText(bg);
    name = th.name;
    let styles = { w: 300, h: 200, bg, fg, border: `solid 1px ${getCSSVariable('--fgButton')}` };
    let dsample = mDom(d1, styles, { theme: key });
    setTexture(th, dsample);
    let dnav = mDom(dsample, { bg, fg, padding: 10 }, { html: name.toUpperCase() });
    let dmain = mDom(dsample, { fg, padding: 10 }, { html: getMotto() }); //, className: 'section' });
    dsample.onclick = onclickThemeInSettingsThemes;
  }
}
async function onclickTable(id) { DA.tid = id; await switchToMenu('table'); }
async function onclickTableDelete(id) {
  if (localStorage.getItem('tid') == id) {
    localStorage.removeItem('tid');
    DA.tid = null;
  }
  res = await dbDeleteGameTable(id);
  await updateMain();
}
async function onclickTableJoin(id) {
  let t = DAGetTable(id);
  let me = U.name;
  assertion(t.status == 'open', 'too late to join! game has already started!')
  assertion(!Object.keys(t.players).includes(me), `${me} already joined!!!`);
  t.players[me] = userToPlayer(me, t.game);
  Object.keys(t.players).push(me);
  await tableSaveUpdate(t);
  await updateMain();
}
async function onclickTableLeave(id) {
  let t = DAGetTable(id);
  let me = U.name;
  assertion(t.status == 'open', 'too late to leave! game has already started!')
  assertion(Object.keys(t.players).includes(me), `${me} NOT in joined players!!!!`);
  delete t.players[me];
  removeInPlace(Object.keys(t.players), me);
  await tableSaveUpdate(t);
  await updateMain();
}
async function onclickTableStart(id) {
  let table = DA.tableDict[id];
  if (!table) { showMessage('table missing!'); return await updateMain(); }
  table = gtSetToStarted(table);
  await tableSaveUpdate(table);
  DA.tid = id;
  await switchToMenu('table');
}
async function onclickTexture(item) {
  async function fkeep(answer) {
    if (answer == 'yes') {
      await setTextureToItem(item);
    }
    else applyTexture(U.texture, U.bgBlend, U.bgSize, U.bgRepeat);
  }
  applyTexture(item.texture, item.bgBlend, item.bgSize, item.bgRepeat);
  mSelectPopup('Keep texture?', ['yes', 'no'], fkeep);
}
async function onclickThemeBlendMode(bgBlend) {
  console.log('onclickThemeBlendMode', bgBlend);
  let dSample = mBy('dThemeSample');
  let dbg = mBy('dThemeColors');
  console.log('dbg', dbg, 'dSample', dSample);
  mStyle(dSample, { bgBlend });
}
async function onclickThemeEditorBlendMode(ev) {
  let bgBlend = DA.theme.bgBlend = mGetStyle(ev.target, 'bgBlend');
  await redrawTheme();
}
async function onclickThemeEditorColor(ev) {
  let bg = mGetStyle(ev.target, 'bg');
  DA.theme.color = DA.theme.bg = bg;
  DA.theme.fg = colorIdealText(bg);
  redrawTheme();
}
async function onclickThemeEditorTexture(ev) {
  let bgImage = DA.theme.bgImage = mGetStyle(ev.target, 'bgImage');
  DA.theme.texture = pathFromBgImage(bgImage);
  DA.theme.bgSize = mGetStyle(ev.target, 'bgSize');
  DA.theme.bgRepeat = mGetStyle(ev.target, 'bgRepeat');
  await redrawTheme();
}
async function onclickThemeInSettingsThemes(ev) {
  let key = evToAttr(ev, 'theme');
  async function fkeep(answer) {
    console.log('the answer is', answer)
    if (answer == 'keep') {
      await setThemeToItem(ev);
    } else if (answer == 'delete') {
      applyTheme(U.color, U.texture, U.bgBlend, U.bgSize, U.bgRepeat);
      await deleteTheme(ev);
    } else if (answer == 'cancel') {
      applyTheme(U.color, U.texture, U.bgBlend, U.bgSize, U.bgRepeat);
    } else if (answer == 'edit') {
      applyTheme(U.color, U.texture, U.bgBlend, U.bgSize, U.bgRepeat);
      await openThemeEditor(key);
    }
  }
  applyTheme(ev);
  mSelectPopup(`What would you like to do with theme ${key.toUpperCase()}?`, ['keep', 'delete', 'edit', 'cancel'], fkeep);
}
async function onclickUser() {
  await onclickMoreUsers();
}
function onclick_home() { stopgame(); show_home_logo(); return; start_with_assets(); }
function onclick_user(uname) {
  U = M.users[uname];
  localStorage.setItem('uname', U.name);
  DA.secretuser = U.name;
  let elem = firstCond(arrChildren('dUsers'), x => x.getAttribute('username') == uname);
  let img = elem.children[0];
  mShrinkTranslate(img, .75, 'dAdminRight', 400, show_username);
  mFadeClear('dUsers', 300);
}
async function ondropPreviewImage(dParent, url, key) {
  if (isdef(key)) {
    let o = M.superdi[key];
    UI.imgColl.value = o.cats[0];
    UI.imgName.value = o.friendly;
  }
  assertion(dParent == UI.dDrop, `problem bei ondropPreviewImage parent:${dParent}, dDrop:${UI.dDrop}`)
  dParent = UI.dDrop;
  let dButtons = UI.dButtons;
  let dTool = UI.dTool;
  dParent.innerHTML = '';
  dButtons.innerHTML = '';
  dTool.innerHTML = '';
  let img = UI.img = mDom(dParent, {}, { tag: 'img', src: url });
  img.onload = async () => {
    img.onload = null;
    UI.img_orig = new Image(img.offsetWidth, img.offsetHeight);
    UI.url = url;
    let tool = UI.cropper = mCropResizePan(dParent, img);
    addToolX(tool, dTool)
    mDom(dButtons, { w: 120 }, { tag: 'button', html: 'Upload', onclick: onclickUpload, className: 'input' })
    mButton('Restart', () => ondropPreviewImage(url), dButtons, { w: 120, maleft: 12 }, 'input');
  }
}
async function ondropShowImage(url, dDrop) {
  mClear(dDrop);
  let img = await imgAsync(dDrop, { hmax: 300 }, { src: url });
  console.log('img dims', img.width, img.height); //works!!!
  mStyle(dDrop, { w: img.width, h: img.height + 30, align: 'center' });
  mDom(dDrop, { fg: colorContrastPickFromList(dDrop, ['blue', 'lime', 'yellow']) }, { className: 'blink', html: 'DONE! now click on where you think the image should be centered!' })
  console.log('DONE! now click on where you think the image should be centered!')
  img.onclick = storeMouseCoords;
}
function onenterHex(item, board) {
  colorSample(board.dSample, item.color);
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
function onleaveHex(item, board) {
  let selitem = board.items.find(x => x.isSelected == true);
  if (nundef(selitem)) return;
  colorSample(board.dSample, selitem.color);
}
function openPopup(name = 'dPopup') {
  closePopup();
  let popup = document.createElement('div');
  popup.id = name;
  let defStyle = { padding: 25, bg: 'white', fg: 'black', zIndex: 100000, rounding: 12, position: 'fixed', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)', wmin: 300, hmin: 100, border: '1px solid #ccc', };
  mStyle(popup, defStyle);
  mButtonX(popup, null, 'tr', 25, 4);
  document.body.appendChild(popup);
  return popup;
}
async function openThemeEditor(key) {
  DA.themeKey = key;
  DA.theme = jsCopy(M.config.themes[key]);
  DA.orig = jsCopy(DA.theme);
  DA.themeKey = key;
  await showThemeEditor();
}
function overwriteMerge(destinationArray, sourceArray, options) { return sourceArray }
function pSBCr(d) {
  let i = parseInt, m = Math.round, a = typeof c1 == 'string';
  let n = d.length,
    x = {};
  if (n > 9) {
    ([r, g, b, a] = d = d.split(',')), (n = d.length);
    if (n < 3 || n > 4) return null;
    (x.r = parseInt(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = parseInt(g)), (x.b = parseInt(b)), (x.a = a ? parseFloat(a) : -1);
  } else {
    if (n == 8 || n == 6 || n < 4) return null;
    if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
    d = parseInt(d.slice(1), 16);
    if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
    else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
  }
  return x;
}
function paletteContrastVariety(pal, n = 20) {
  pal = pal.map(x => colorO(x));
  let res = [];
  ['white', 'black'].map(x => res.push(colorO(x)));
  let o = paletteGetBestContrasting(pal, pal[0], pal[1]).best;
  res.push(o)
  let pal2 = jsCopy(pal).filter(x => x.hex != o.hex);
  res.push(colorO(colorGetPureHue(o)));
  let o2 = paletteGetBestContrasting(pal2, pal[0], pal[1]).best;
  res.push(o2)
  res.push(colorO(colorGetPureHue(o2)))
  res.push(colorO(colorComplement(pal[0].hex)));
  res.push(colorO(colorComplement(pal[1].hex)));
  [60, 120, 180, 240, 300].map(x => {
    res.push(colorO(colorTurnHueBy(pal[0].hex, x)));
    res.push(colorO(colorTurnHueBy(pal[1].hex, x)));
  });
  ['silver', 'dimgray', '#ff0000', '#ffff00'].map(x => res.push(colorO(x)));
  res = res.map(x => x.hex); res = arrRemoveDuplicates(res);
  let palContrast = res.slice(0, 2);
  let sorted = colorSortByLightness(res.slice(2));
  let i = 0;
  while (i < sorted.length) {
    let hex = sorted[i];
    let ok = true;
    for (const h1 of palContrast) {
      let d = colorDistance(hex, h1);
      if (d < 70) { ok = false; break; }
    }
    if (ok) palContrast.push(hex);
    i++;
  }
  if (n < palContrast.length) palContrast = palContrast.slice(0, n)
  return palContrast;
}
function paletteCreateFrom(palette) {
  let palettes = [palette];
  let n = palette.length;
  if (n < 10) return;
  let hue = colorGetHue(palette[0]);
  for (const b of [20, 35, 50, 65, 80]) {
    let palshades = [];
    for (const i of range(Math.max(palette.length - 7, 4))) {
      let p = palette[i];
      let o = colorO(p);
      let h = o.hue;
      let s = o.sat * 100;
      let l = b;
      let cnew = colorFromHsl(h, s, l);
      palshades.push(cnew);
    }
    let pal = generateColors(7, b, hue, 50);
    palshades = palshades.concat(pal);
    palettes.push(palshades);
  }
  for (const b of [20, 35, 50, 65, 80]) {
    let newpal = generateColors(palette.length, b, 0);
    palettes.push(newpal);
  }
  let grayscales = grayShades(palette.length);
  grayscales.forEach(cnew => { if (cnew.includes('-')) assertion(false) });
  palettes.push(grayscales);
  return palettes;
}
function paletteGetBestContrasting(pal) {
  let clist = Array.from(arguments).slice(1).map(x => colorO(x));
  pal = pal.map(x => colorO(x));
  let best = null, dbest = 0;
  for (const p of pal) {
    let arr = clist.map(x => colorDistanceHue(p, x));
    let dmax = arrMinMax(arr).min;
    if (dmax > dbest) {
      best = p; dbest = dmax;
    }
  }
  if (dbest == 0) best = pal[4];
  return { best, dbest };
}
function paletteMix(startColor, endColor, numSteps) {
  const colors = [];
  let step = 0;
  while (step < numSteps) {
    const currentColor = mixColors(startColor, endColor, step / numSteps);
    colors.push(currentColor);
    step++;
  }
  return colors;
}
function paletteShades(color, from = -0.8, to = 0.8, step = 0.2) {
  let res = [];
  for (let frac = from; frac <= to; frac += step) {
    let c = colorCalculator(frac, color, undefined, true);
    res.push(c);
  }
  return res;
}
function paletteToObjects(pal) { return pal.map(x => colorO(x)); }
function paletteTransWhiteBlack(n = 9) {
  let c = 'white';
  let pal = [c];
  let [iw, ib] = [Math.floor(n / 2), Math.floor((n - 1) / 2)];
  let [incw, incb] = [1 / (iw + 1), 1 / (ib + 1)];
  for (let i = 1; i < iw; i++) {
    let alpha = 1 - i * incw;
    pal.push(colorTrans(c, alpha));
  }
  pal.push('transparent');
  c = 'black';
  for (let i = 1; i < ib; i++) {
    let alpha = i * incb;
    pal.push(colorTrans(c, alpha));
  }
  pal.push(c);
  return pal;
}
function parseAnnotations(lines) {
  const dict = {};
  for (const line of lines) {
    const cpMatch = line.match(/cp="([^"]+)"/);
    if (!cpMatch) continue;
    const cp = cpMatch[1];
    const textMatch = line.match(/>([^<]*)</);
    const inner = textMatch ? textMatch[1].trim() : "";
    if (!dict[cp]) dict[cp] = {};
    if (line.includes('type="tts"')) {
      dict[cp].name = inner;
    } else {
      dict[cp].enan = inner.split("|").map(w => w.trim());
    }
  }
  return dict;
}
async function parseAnnotations1() {
  let en = await getAnnotations('y/emo/enan.xml');  //console.log(Object.keys(en).length);
  let de = await getAnnotations('y/emo/dean.xml');  //console.log(de);
  let es = await getAnnotations('y/emo/esan.xml');  //console.log(es);
  let fr = await getAnnotations('y/emo/fran.xml');  //console.log(fr);
  let en1 = await getAnnotations('y/emo/der/enan.xml');  //console.log(Object.keys(en1).length);
  let de1 = await getAnnotations('y/emo/der/dean.xml');  //console.log(de1);
  let es1 = await getAnnotations('y/emo/der/esan.xml');  //console.log(es1);
  let fr1 = await getAnnotations('y/emo/der/fran.xml');  //console.log(fr1);
  let en2 = deepMerge(en, en1);
  let de2 = deepMerge(de, de1);
  let es2 = deepMerge(es, es1);
  let fr2 = deepMerge(fr, fr1);
  return [en, es, fr, de];
}
function parseCodePoints(str) {
  return str
    .split('_')
    .map(s => parseInt(s.replace(/^u/i, ''), 16));
}
function pathFromBgImage(bgImage) {
  let content = bgImage.substring(5, bgImage.length - 2);
  if (content.includes('http')) {
    content = '../assets' + stringAfter(content, 'assets')
  }
  return content;
}
function pickFromObject(obj, keys) {
  return Object.fromEntries(
    keys.filter(key => key in obj).map(key => [key, obj[key]])
  );
}
function pickRandomSet(listYes, listNo, n, qTypes = null) {
  let qType = rChoose(qTypes ?? ['oddman', 'unique', 'frequent', 'alpha']);
  let set = null;
  switch (qType) {
    case 'oddman': set = createOddManSet(listYes, listNo, n); break;
    case 'unique': set = createUniqueSet(listYes, n); break;
    case 'frequent': set = createFrequentSet(listYes, n); break;
    case 'alpha': set = createAlphaSet(listYes, n); break;
  }
  set.key = qType;
  return set;
}
function placeCircle(dParent, cx, cy, sz, bg = 'red') {
  let o = { cx, cy, sz };
  let [w, h] = [sz, sz];
  o.div = mDom(dParent, { w, h, position: 'absolute', round: true, x: cx - sz / 2, y: cy - sz / 2, bg });
  return o;
}
async function placeYourMeeple(ev) {
  let d = mBy('dCanvas');
  document.onclick = null;
  d.onmousemove = null;
  let sz = rChoose(range(10, 40));
  let b = mGetStyle(d, 'border-width'); //console.log(b);
  let p = mGetStyle(d, 'padding');//console.log(p);
  x = ev.clientX - d.offsetLeft - b - sz;
  y = ev.clientY - d.offsetTop - b - sz;
  let pMeeple = { x, y, sz, bg: 'red', border: 'gold', id: getUID(), owner: 'hallo' };
  drawMeeple(d, pMeeple);
  lookupAddToList(B, ['meeples'], pMeeple);
  let linesActivated = B.linesActivated = getActivatedLines(B.lines);
  console.log('linesActivated', linesActivated);
  B.selectedPoints = [];
  B.endPoints = [];
  B.possiblePairs = [];
  if (linesActivated.length == 1) {
    B.selectedPoints.push(linesActivated[0].p1.id);
    B.selectedPoints.push(linesActivated[0].p2.id);
    let res = await lacunaMoveComplete(B.selectedPoints);
  } else {
    animateEndpointsOfActivatedLines();
  }
}
async function placeYourMeepleGame(ev) {
  let [fen, players, pl] = [T.fen, T.players, T.players[getUname()]]
  stopPulsing();
  d = mBy('dCanvas');
  d.onmousemove = null;
  d.onclick = null;
  for (const p of B.hotspotList) { mStyle(p.div, { z: 0 }) }
  for (const p of B.points) { p.div.style.zIndex = 1000; }
  let sz = 20;
  x = ev.clientX - d.offsetLeft - d.parentNode.offsetLeft;
  y = ev.clientY - d.offsetTop - d.parentNode.offsetTop;
  let pMeeple = { x: x - sz / 2, y: y - sz / 2, sz, bg: 'black', border: getPlayerProp('color'), id: getUID(), owner: getUname() };
  fen.meeples.push(jsCopy(pMeeple));
  showMeeple(d, pMeeple);
  B.meeples.push(pMeeple);
  if (B.endPoints.length == 0) {
    await lacunaMoveCompletedME([]);
  } else if (B.endPoints.length == 2) {
    B.selectedPoints.push(B.endPoints[0]);
    B.selectedPoints.push(B.endPoints[1]);
    await lacunaMoveCompletedME(B.selectedPoints);
  } else lacunaMakeSelectableME();
}
async function placeYourMeepleME(ev) {
  let [fen, players, pl] = [T.fen, T.players, T.players[getUname()]]
  stopPulsing();
  d = mBy('dCanvas');
  d.onmousemove = null;
  d.onclick = null;
  for (const p of B.hotspotList) { mStyle(p.div, { z: 0 }) }
  for (const p of B.points) { p.div.style.zIndex = 1000; }
  let sz = 20;
  x = ev.clientX - d.offsetLeft - d.parentNode.offsetLeft;
  y = ev.clientY - d.offsetTop - d.parentNode.offsetTop;
  let pMeeple = { x: x - sz / 2, y: y - sz / 2, sz, bg: 'black', border: getPlayerProp('color'), id: getUID(), owner: getUname() };
  fen.meeples.push(jsCopy(pMeeple));
  showMeeple(d, pMeeple);
  B.meeples.push(pMeeple);
  if (B.endPoints.length == 0) {
    await lacunaMoveCompletedME([]);
  } else if (B.endPoints.length == 2) {
    B.selectedPoints.push(B.endPoints[0]);
    B.selectedPoints.push(B.endPoints[1]);
    await lacunaMoveCompletedME(B.selectedPoints);
  } else lacunaMakeSelectableME();
}
function planeFunction(u, v) {
  return [u, v, 0];
}
function playA() { playTone(442); }
function playTone(frequency, duration = 10000) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine'; // other options: 'square', 'triangle', 'sawtooth'
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration / 1000);
}
function pluralOf(s, n) {
  di = { food: '', child: 'ren' };
  return s + (n == 0 || n > 1 ? valf(di[s.toLowerCase()], 's') : '');
}
function pointAddMargin(p, margin) {
  return { x: p.x + margin, y: p.y + margin, type: p.type, owner: p.owner };
}
function pointFromFenRaw(pfen) {
  const [x, y, type, owner] = pfen.split('_').map(val => isNaN(val) ? val : parseInt(val, 10));
  return { x, y, type, owner: nundef(owner) ? null : owner };
}
function pointToLineDistance(x, y, x1, y1, x2, y2) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  const param = len_sq !== 0 ? dot / len_sq : -1;
  let xx, yy;
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}
async function pollAndShow() {
  if (nundef(DA.pollStates)) return;
  DA.pollCounter++;
  if (DA.isProcessingMove) { if (VERBOSE)console.log('...processing move'); return; }
  if (VERBOSE)console.log('polling...updating!'); //, DA.pollCounter,);
  DA.isProcessingMove = true;
  let uiUpdated = await updateMain();
  DA.isProcessingMove = false;
}
function pollChangeInterval(ms) {
  if (nundef(DA.pollStates)) return;
  ms = Math.max(ms, 500);
  let state = DA.pollStates.table.ON;
  if (state.interval == ms) return;
  state.interval = ms;
  if (pollIsOn()) {
    clearTimeout(DA.TOPOLL);
    DA.TOPOLL = setInterval(pollAndShow, ms);
  }
}
async function pollInit() {
  await reloadTables();
  DA.menu = localStorage.getItem('menu') || 'games';
  let pollStates = DA.pollStates = {
    games: {
      OFF: { color: 'red', text: 'OFF', blink: false, interval: 10000, index: 0, ison: false },
      ON: { color: 'green', text: 'ON', blink: false, interval: 3000, index: 1, ison: true },
    },
    table: {
      OFF: { color: 'red', text: 'OFF', blink: false, interval: 10000, index: 2, ison: false },
      ON: { color: 'green', text: 'ON', blink: false, interval: 4000, index: 3, ison: true },
    },
    settings: {
      OFF: { color: 'red', text: 'OFF', blink: false, interval: 10000, index: 0, ison: false },
      ON: { color: 'green', text: 'ON', blink: false, interval: 3000, index: 1, ison: true },
    },
  };
  DA.pollMode = 'auto';
  document.addEventListener("visibilitychange", handleVisibilityChange);
  if (POLLING) pollSetState(DA.pollStates[DA.menu]['ON']);
}
function pollIsOn() { return isdef(DA.pollStates) && DA.pollState && DA.pollState.ison; }
function pollOff() {
  if (nundef(DA.pollStates) || !POLLING) return;
  assertion(DA.menu, 'pollOff: DA.menu not defined!!!')
  pollSetState(DA.pollStates[DA.menu]['OFF'])
}
function pollOn(force = false) {
  if (nundef(DA.pollStates) || !POLLING) return;
  if (pollIsOn() || !force && DA.pollMode == 'manual') return;
  assertion(DA.menu, 'pollOn: DA.menu not defined!!!')
  pollSetState(DA.pollStates[DA.menu]['ON'])
}
function pollSetState(pollState) {
  if (nundef(DA.pollStates)) return;
  if (DA.pollState == pollState) return;
  DA.pollState = pollState;
  DA.pollInterval = pollState.interval;
  DA.pollCounter = 0;
  let bPollToggle = mBy('bPollToggle');
  if (isdef(bPollToggle)) {
    mStyle(bPollToggle, { color: pollState.color }, { html: `${pollState.text + (pollState.interval ? (':') + pollState.interval : '')}` });
    if (pollState.blink) {
      bPollToggle.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, iterations: Infinity });
    } else {
      bPollToggle.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    }
  }
  if (pollState.text == 'ON' && !DA.TOPOLL) {
    assertion(DA.pollInterval >= 500, `poll interval to small!!! ${DA.pollInterval}`);
    DA.TOPOLL = setInterval(pollAndShow, DA.pollInterval);
  } else if (pollState.text == 'OFF' && DA.TOPOLL) {
    clearInterval(DA.TOPOLL); DA.TOPOLL = null;
  }
}
function pollToggle() {
  if (nundef(DA.pollStates) || !POLLING) return;
  let menu = DA.menu;
  let pollStates = DA.pollStates[menu];
  let pollState = pollStates[DA.pollState == pollStates.ON ? 'OFF' : 'ON'];
  pollSetState(pollState);
}
function polyPointsFrom(w, h, x, y, pointArr) {
  x -= w / 2;
  y -= h / 2;
  let pts = pointArr.map(p => [p.X * w + x, p.Y * h + y]);
  let newpts = [];
  for (const p of pts) {
    newp = { X: p[0], Y: Math.round(p[1]) };
    newpts.push(newp);
  }
  pts = newpts;
  let sPoints = pts.map(p => '' + p.X + ',' + p.Y).join(' ');
  return sPoints;
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
    let res = await dbGetGameTable(DA.tid);
    table = res.table;
    table.pending = res.movedPlayers ?? [];
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
async function postConfig() {
  let res = await mPhpPost('all', { cmd: 'savey', file: 'config', o: M.config });
}
async function postImage(img, path) {
  let dataUrl = imgToDataUrl(img);
  let o = { image: dataUrl, filename: path };
  let resp = await mPostRoute('postImage', o);
}
async function postUsers() {
  let res = await mPhpPost('all', { cmd: 'savey', file: 'users', o: M.users });
  return res;
}
function precomputePolygonNeighbors(groupElement) {
  if (!groupElement || !(groupElement instanceof SVGGElement)) {
    console.error("Invalid group element.");
    return;
  }
  const polygons = Array.from(groupElement.querySelectorAll('polygon'));
  polygons.forEach((polygon, i) => {
    if (!polygon.id) {
      polygon.id = `poly-${i}`;
    }
  });
  function getPointSet(polygon) {
    return new Set(
      polygon.getAttribute('points')
        .trim()
        .split(/\s+/)
        .map(p => p.trim())
    );
  }
  const pointSets = new Map();
  polygons.forEach(p => {
    pointSets.set(p.id, getPointSet(p));
  });
  polygons.forEach(p1 => {
    const id1 = p1.id;
    const set1 = pointSets.get(id1);
    const neighbors = [];
    polygons.forEach(p2 => {
      const id2 = p2.id;
      if (id1 === id2) return;
      const set2 = pointSets.get(id2);
      const shared = [...set1].filter(point => set2.has(point));
      if (shared.length >= 2) {
        neighbors.push(id2);
      }
    });
    p1.dataset.neighbors = neighbors.join(',');
  });
}
async function preloadImages(imageUrls) {
  const promises = imageUrls.map(async (url) => {
    const img = new Image();
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  });
  return await Promise.all(promises);
}
function presentItems(items, dParent, fclick, ngroup = 10) {
  mClear(dParent)
  let rect = getRect(dParent);
  let gap = 4;
  let d = mDom(dParent, { w100: true, h100: true, gap, box: true, padding: gap }); mCenterCenterFlex(d);
  let sz = (rect.w - 2 * gap) / ngroup;
  sz = fitCellsInRect(items.length, rect.w - gap, rect.h - gap);
  for (const item of items) {
    if (nundef(item.fg)) item.fg = colorIdealText(item.color);
    let dItem = mDom(d, { bg: item.color, fg: item.fg, w: sz.cellW - gap, h: sz.cellH - 2 * gap });
    enableTooltip(dItem, item.name)
    if (isdef(fclick)) mStyle(dItem, { cursor: 'pointer' }, { onclick: fclick });
    if (isdef(item.texture)) {
      mStyle(dItem, { bgImage: item.bgImage, bgSize: item.bgSize, bgRepeat: item.bgRepeat, bgBlend: item.bgBlend });
    }
    item.div = dItem;
  }
}
function presentStandardRoundTable() {
  d = mDom('dMain'); mCenterFlex(d);
  mDom(d, {}, { id: 'dInstruction', className: 'instruction' }); mLinebreak(d); // instruction
  mDom(d, { matop: 20 }, { id: 'dStats' }); mLinebreak(d);
  let minTableSize = 400;
  let d2 = mDom(d); mCenterFlex(d2);
  let dLeftOfTable = mDom(d2);
  let dTable = mDom(d2, { hmin: minTableSize, wmin: minTableSize, margin: 20, round: true }, { id: 'dTable', className: 'wood' });
  mCenterCenter(dTable);
  let dRightOfTable = mDom(d2);
}
function proceed(nextLevel) {
  if (nundef(nextLevel)) nextLevel = currentLevel;
  if (nextLevel > MAXLEVEL) {
    let iGame = gameSequence.indexOf(currentGame) + 1;
    if (iGame == gameSequence.length) {
      soundGoodBye();
      mClass(document.body, 'aniSlowlyDisappear');
      show(dLevelComplete);
      dLevelComplete.innerHTML = 'CONGRATULATIONS! You are done!';
    } else {
      let nextGame = gameSequence[iGame];
      setGoal(nextGame);
    }
  } else if (LevelChange) startLevel(nextLevel);
  else startRound();
}
async function process_comm_setup(me, table, items) {
  let newTable = gtCopy(table);
  let fen = newTable.fen;
  let n = fen.commSetupNum;
  lookupAddIfToList(newTable, ['fen', 'movedone'], me);
  removeInPlace(newTable.turn, me);
  newTable.players[me].action = { items: items.filter(x => x.state === 'selected').map(x => x.key), num: n };
  if (newTable.turn.length == 0) {
    for (const p in newTable.players) {
      let pl = newTable.players[p];
      let nextPlayer = get_next_player(newTable, p);
      let nextPl = newTable.players[nextPlayer];
      for (const key of pl.action.items) {
        let idx = pl.commissions.indexOf(key);
        if (idx >= 0) {
          pl.commissions.splice(idx, 1);
          nextPl.commissions.push(key);
        }
      }
      delete pl.action;
    }
    if (n == 1) {
      delete newTable.fen.commSetupNum;
      historyAddLines([`commission trading ends`], 'commissions', fen);
      if (exp_rumors(table.options) && plorder.length >= 2) {
        [newTable.stage, newTable.turn] = [24, table.plorder];
        historyAddLines([`gossiping starts`], 'rumors', fen);
      } else {
        [newTable.fen.stage, newTable.turn] = setStallStage(newTable);
        console.log('stall stage', newTable.fen.stage, newTable.turn);
      }
    } else {
      newTable.fen.commSetupNum = n - 1;
      newTable.turn = Object.keys(newTable.players);
    }
  }
  await tableSaveUpdate(newTable);
  updateMain(newTable);
}
async function pyStartGame(gamename, players, options = {}) {
  const data = {
    gamename: valf(gamename, 'tictactoe'),
    players: valf(players, ['felix', 'mimi']),
    options
  };
  return await api('POST', '/start_game', data);
}
function qsort(arr) {
  if (arr.length <= 1) return arr
  let x = arr[0]
  let lower = [], upper = []
  for (i = 1; i < arr.length; i++)
    if (arr[i] < x) lower.push(arr[i])
    else upper.push(arr[i])
  return qsort(lower).concat([x]).concat(qsort(upper));
}
function quadCenters(rows, cols, wCell, hCell) {
  let offX = wCell / 2, offY = hCell / 2;
  let centers = [];
  let x = 0; y = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let center = { x: x + offX, y: y + offY };
      centers.push(center);
      x += wCell;
    }
    y += hCell; x = 0;
  }
  return [centers, wCell * cols, hCell * rows];
}
function rBlendCanvas() { return rChoose(getBlendModesCanvas()); }
function rChoose(arr, n = 1, func = null, exceptIndices = null) {
  if (isDict(arr)) arr = dict2list(arr, 'key');
  let indices = arrRange(0, arr.length - 1);
  if (isdef(exceptIndices)) {
    for (const i of exceptIndices) removeInPlace(indices, i);
  }
  if (isdef(func)) indices = indices.filter(x => func(arr[x]));
  if (n == 1) {
    let idx = Math.floor(Math.random() * indices.length);
    return arr[indices[idx]];
  }
  arrShuffle(indices);
  return indices.slice(0, n).map(x => arr[x]);
}
function rColor(lum100OrAlpha01 = 1, alpha01 = 1, hueVari = 60) {
  let c;
  if (lum100OrAlpha01 <= 1) {
    c = '#';
    for (let i = 0; i < 6; i++) { c += rChoose(['f', 'c', '9', '6', '3', '0']); }
    alpha01 = lum100OrAlpha01;
  } else {
    let hue = rHue(hueVari);
    let sat = 100;
    let b = isNumber(lum100OrAlpha01) ? lum100OrAlpha01 : lum100OrAlpha01 == 'dark' ? 25 : lum100OrAlpha01 == 'light' ? 75 : 50;
    c = colorHsl360ArgsToHex79(hue, sat, b);
  }
  return alpha01 < 1 ? colorTrans(c, alpha01) : c;
}
function rHue(vari = 36) { return (rNumber(0, vari) * Math.round(360 / vari)) % 360; }
function rLetter(except) { return rLetters(1, except)[0]; }
function rLetters(n, except = []) {
  let all = 'abcdefghijklmnopqrstuvwxyz';
  for (const l of except) all = all.replace(l, '');
  return rChoose(toLetters(all), n);
}
function rNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rWord(n = 6) { return rLetters(n).join(''); }
function randomColor() { return rColor(); }
function randomIndex(array) { return randomRange(0, array.length) | 0 }
function randomNumber(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomRange(min, max) { return min + Math.random() * (max - min) }
function range(f, t, st = 1) {
  if (nundef(t)) {
    t = f - 1;
    f = 0;
  }
  let arr = [];
  for (let i = f; i <= t; i += st) {
    arr.push(i);
  }
  return arr;
}
function recFlatten(o) {
  if (isLiteral(o)) return o;
  else if (isList(o)) return o.map(x => recFlatten(x)).join(', ');
  else if (isDict(o)) {
    let valist = [];
    for (const k in o) { let val1 = recFlatten(o[k]); valist.push(`${k}: ${val1}`); }
    return valist.join(', ');
  }
}
function recUserEvent() { DA.prevEvUser = DA.evUser; DA.evUser = getNow(); DA.evList.push({ user: DA.evUser }); }
function redrawImage(img, dParent, x, y, wold, hold, w, h, callback) {
  let canvas = mDom(null, {}, { tag: 'canvas', width: w, height: h });
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, x, y, wold, hold, 0, 0, w, h);
  const imgDataUrl = canvas.toDataURL('image/png'); // Change format as needed
  img.onload = () => {
    img.onload = null;
    img.width = w;
    img.height = h;
    mStyle(img, { w: w, h: h });
    mStyle(dParent, { w: w, h: h });
    callback();
  }
  img.src = imgDataUrl;
  return imgDataUrl;
}
async function redrawTheme() {
  let ds = DA.themeDivs;
  let theme = DA.theme;
  let key = DA.themeKey;
  if (nundef(theme.fg)) theme.fg = colorIdealText(theme.color);
  for (const k in DA.themeDivs) { let d = DA.themeDivs[k]; mClear(d); mStyle(d, { bg: theme.color, fg: theme.fg }) }
  mStyle('dFrame', { outline: `1px solid ${theme.fg}` })
  fShowThemeSample(ds.dmiddle, theme, {});
  let textures = await createTextureItems(theme);
  presentItems(textures, ds.dtop, onclickThemeEditorTexture);
  let colors = await createColorItems(theme);
  presentItems(colors, ds.dbottom, onclickThemeEditorColor);
  if (isdef(theme.texture)) {
    let blendModes = createBlendModeItems(theme);
    presentItems(blendModes, ds.dright, onclickThemeEditorBlendMode);
  }
  mClear(ds.dleft);
  let st = { wmin: 150, margin: 6 }
  if (isdef(key)) {
    mDom(ds.dleft, st, { html: 'Set Theme', tag: 'button', onclick: setCurrentTheme })
    mLinebreak(ds.dleft);
    mDom(ds.dleft, st, { html: 'Remove Texture', tag: 'button', onclick: removeCurrentTexture })
    mLinebreak(ds.dleft);
    mDom(ds.dleft, st, { html: 'Save', tag: 'button', onclick: onclickSaveTheme })
    mLinebreak(ds.dleft);
    mDom(ds.dleft, st, { html: 'Undo Changes', tag: 'button', onclick: onclickRevertTheme })
  } else {
    mDom(ds.dleft, st, { html: 'Set Theme', tag: 'button', onclick: setCurrentTheme })
    mLinebreak(ds.dleft);
    mDom(ds.dleft, st, { html: 'Remove Texture', tag: 'button', onclick: removeCurrentTexture })
    mLinebreak(ds.dleft);
    mDom(ds.dleft, st, { html: 'Add to Themes', tag: 'button', onclick: onclickAddToThemes })
    mLinebreak(ds.dleft);
    mDom(ds.dleft, st, { html: 'Undo Changes', tag: 'button', onclick: onclickRevertTheme })
  }
}
async function reloadTables() {
  let tables = {};
  let res = await dbGetGameTables();
  tables = list2dict(res.tables, 'id');
  let moves = res.moves;
  for (const id in tables) {
    tables[id].pending = moves.filter(x => x.game_id == id && x.has_moved).map(x => x.player_id);
  }
  let hasChanges = nundef(DA.tableDict) || !sameList(Object.keys(DA.tableDict), Object.keys(tables)) || !isdef(mBy('game_menu'));
  DA.tableDict = tables;
  return hasChanges;
}
async function removeCurrentTexture() {
  let item0 = { texture: '', bgImage: '', bgRepeat: 'no-repeat', bgBlend: 'normal' };
  copyKeys(item0, DA.theme);
  await redrawTheme();
}
function removeDuplicates(keys, prop) {
  let di = {};
  let res = [];
  let items = keys.map(x => Syms[x]);
  for (const item of items) {
    if (isdef(di[item.best])) { continue; }
    res.push(item);
    di[item.key] = true;
  }
  return res.map(x => x.key);
}
function removeFromArray(array, i) { return array.splice(i, 1)[0] }
function removeInPlace(arr, el) {
  arrRemovip(arr, el);
}
function removeItemFromArray(array, item) { return removeFromArray(array, array.indexOf(item)) }
function removeNthChild(parent, n) {
  const children = parent.children;
  if (n < 1 || n > children.length) {
    console.error("Invalid child index");
    return;
  }
  const child = children[n - 1];
  parent.removeChild(child);
}
function removePeepFromCrowd(peep) {
  removeItemFromArray(crowd, peep)
  availablePeeps.push(peep)
}
function removeRandomFromArray(array) { return removeFromArray(array, randomIndex(array)) }
function remove_card_shadow(c) {
  iDiv(c).firstChild.setAttribute('class', null);
}
function remove_player(table, uname) {
  let fen = table.fen;
  if (nundef(fen.original_players)) fen.original_players = jsCopy(table.players);
  removeInPlace(table.plorder, uname);
  delete table.players[uname];
  return table.plorder;
}
function renderBoard() {
  let boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";
  boardDiv.style.gridTemplateColumns = `repeat(${boardState[0].length}, 50px)`;
  boardState.forEach((row, y) => {
    row.forEach((cell, x) => {
      let div = document.createElement("div");
      div.className = "cell";
      div.innerText = cell;
      div.onclick = () => makeMove(x, y);
      boardDiv.appendChild(div);
    });
  });
}
function replaceAll(str, search, replacement) {
  return str.split(search).join(replacement);
}
function replaceAllSpecialChars(str, sSub, sBy) { return str.split(sSub).join(sBy); }
function replaceColor(svgString, attr, fromColor, toColor) {
  const regex = new RegExp(`${attr}=['"]${fromColor}['"]`, 'g');
  return svgString.replace(regex, `${attr}='${toColor}'`);
}
function replaceColorsInCard(svg, newColor) {
  const colorsToReplace = ['red', 'black'];
  const attrs = ['fill', 'stroke'];
  for (const attr of attrs) {
    for (const color of colorsToReplace) {
      svg = replaceColor(svg, attr, color, newColor);
    }
  }
  return svg;
}
function replaceNthChild(parent, n, newElement) {
  const children = parent.children;
  if (n < 1 || n > children.length) {
    console.error("Invalid child index");
    return;
  }
  const oldChild = children[n - 1];
  parent.replaceChild(newElement, oldChild);
}
function resetPeep({ stage, peep }) {
  const direction = Math.random() > 0.5 ? 1 : -1
  const offsetY = 100 - 250 * gsap.parseEase('power2.in')(Math.random())
  const startY = stage.height - peep.height + offsetY
  let startX
  let endX
  if (direction === 1) {
    startX = -peep.width
    endX = stage.width
    peep.scaleX = 1
  } else {
    startX = stage.width + peep.width
    endX = 0
    peep.scaleX = -1
  }
  peep.x = startX
  peep.y = startY
  peep.anchorY = startY
  return {
    startX,
    startY,
    endX
  }
}
function resetRound() {
  clearTimeouts();
  clearFleetingMessage();
  clearEvents();
}
function resize() {
  stage.width = Canvas.clientWidth
  stage.height = Canvas.clientHeight
  Canvas.width = stage.width * devicePixelRatio
  Canvas.height = stage.height * devicePixelRatio
  crowd.forEach((peep) => {
    peep.walk.kill()
  })
  crowd.length = 0
  availablePeeps.length = 0
  availablePeeps.push(...allPeeps)
  initCrowd()
}
function resizeTo(tool, wnew, hnew) {
  let [img, dParent, cropBox, setRect] = [tool.img, tool.dParent, tool.cropBox, tool.setRect];
  if (hnew == 0) hnew = img.height;
  if (wnew == 0) {
    let aspectRatio = img.width / img.height;
    wnew = aspectRatio * hnew;
  }
  redrawImage(img, dParent, 0, 0, img.width, img.height, wnew, hnew, () => setRect(0, 0, wnew, hnew))
}
async function restartGame() {
  return await api('POST', '/restart');
}
function root(areaName) {
  setTableSize(areaName, 400, 300);
  UIROOT = jsCopy(SPEC.staticSpec.root);
  for (const k in AREAS) delete AREAS[k];
  PROTO = {};
  INFO = {};
  staticArea(areaName, UIROOT);
  addAREA('root', UIROOT);
}
async function rotateAndWriteAge(img, card) {
  let diStage = { 0: 'I', 1: 'I', 2: 'II', 3: 'III', 4: 'II II' };
  let [w, h] = [img.width, img.height];
  mDom('dExtra', { h: 4 })
  let cv2 = mDom('dExtra', {}, { tag: 'canvas', width: h, height: w });
  let ctx2 = cv2.getContext('2d');
  ctx2.translate(h, 0)
  ctx2.rotate(90 * Math.PI / 180);
  ctx2.drawImage(img, 0, 0, w, h);
  mDom('dExtra', { h: 4 })
  let cv3 = mDom('dExtra', {}, { tag: 'canvas', width: h, height: w });
  let ctx3 = cv3.getContext('2d');
  ctx3.drawImage(cv2, 0, 0);
  let x = cv3.width / 2;
  let y = cv3.height;
  ctx3.fillStyle = 'white';
  ctx3.font = '20px Arial';
  ctx3.textAlign = 'center';
  let text = diStage(card.age);
  ctx3.fillText(text, x, y);
  return cv3;
}
function rsg(me, table) {
}
function sameList(l1, l2) {
  if (l1.length != l2.length) return false;
  for (const s of l1) {
    if (!l2.includes(s)) return false;
  }
  return true;
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
  if (changed) {
    let res = await postUsers();
  }
}
function saveBase64Image(imgElement, filename) {
  if (!imgElement || !imgElement.src.startsWith('data:image/jpeg;base64,')) {
    console.error('Invalid image element or source.');
    return;
  }
  const base64Data = imgElement.src.split(',')[1];
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'image/jpeg' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
async function saveGame(gameId, data) {
  return await api('POST', `/save_game/${gameId}`, data);
}
function scaleAnimation(elem) {
  elem = toElem(elem);
  let ani = elem.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.3)', color: 'red', backgroundColor: 'yellow' },
  ], {
    duration: 500,
    easing: 'ease-in',
    iterations: 2,
    direction: 'alternate'
  });
  return ani;
}
function screenDistance(elem, container, corner = 'right') {
  const eRect = elem.getBoundingClientRect();
  const cRect = container.getBoundingClientRect();
  const startX = eRect.left;
  const startY = eRect.top;
  const targetX = (corner === 'right') ? cRect.right - eRect.width : cRect.left;
  const targetY = cRect.top;
  return [targetX - startX, targetY - startY];
}
function sectionTitle(dParent, title) {
  mText(title, dParent, { fz: '150%', weight: 'bold', margin: 12, matop: 0 });
}
function selectCivSpot(d) {
  if (isdef(M.selectedCivSpot)) mClassRemove(M.selectedCivSpot, 'shadow');
  M.selectedCivSpot = d;
  mClass(d, 'shadow')
}
function selectExtraWorker(item) {
}
function selectText(el) {
  if (el instanceof HTMLTextAreaElement) { el.select(); return; }
  var sel, range;
  if (window.getSelection && document.createRange) {
    sel = window.getSelection();
    if (sel.toString() == '') {
      window.setTimeout(function () {
        range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
      }, 1);
    }
  } else if (document.selection) {
    sel = document.selection.createRange();
    if (sel.text == '') {
      range = document.body.createTextRange();
      range.moveToElementText(el);
      range.select();
    }
  }
}
async function setBlendModeToItem(blendCSS) {
  U.bgBlend = blendCSS;
  M.users[U.name] = jsCopy(U);
  await postUsers();
}
function setCardBorder(card, color, thickness) {
  /**
   * setCardBorder
   * ─────────────────────────────────────────────────────────────────────────────
   * Sets a card's border color and/or thickness immediately, and returns a
   * revert function that restores exactly the state at the moment of the call.
   * Calls can be safely nested or chained — each revert closure is independent.
   *
   * @param  {Object}  card           Result object from uiTypeCard52
   * @param  {string}  color          New border color (any CSS color string)
   * @param  {number}  [thickness]    New stroke-width in px; omit to leave unchanged
   * @returns {Function}              revert() — call to restore previous values
   *
   * @example
   *   const revert = setCardBorder(card, 'gold', 3);
   *   
   *   revert();
   */
  const rect = _cardOuterRect(card.div);
  if (!rect) return () => { };
  const prevColor = card.border;
  const prevThickness = card.borderthickness;
  rect.setAttribute('stroke', color);
  card.border = color;
  if (thickness !== undefined) {
    rect.setAttribute('stroke-width', String(thickness));
    card.borderthickness = thickness;
  }
  return function revert() {
    rect.setAttribute('stroke', prevColor);
    card.border = prevColor;
    rect.setAttribute('stroke-width', String(prevThickness));
    card.borderthickness = prevThickness;
  };
}
function setColors(item) {
  let bg = item.color;
  let fg = isdef(item.fg) ? item.fg : colorIdealText(bg);
  mStyle('dPage', { bg, fg });
  showUserNameInCorner(bg, fg);
}
async function setColorsToItem(bg) {
  U.color = colorFrom(bg);
  M.users[U.name] = jsCopy(U);
  await postUsers();
}
function setCreateDeck(num) {
  let deck = [];
  ['red', 'purple', 'green'].forEach(color => {
    ['diamond', 'squiggle', 'oval'].forEach(shape => {
      [1, 2, 3].forEach(num => {
        ['solid', 'striped', 'open'].forEach(fill => {
          deck.push(`${color}_${shape}_${num}_${fill}`);
        });
      });
    });
  });
  arrShuffle(deck);
  if (isdef(num)) deck = deck.slice(0, num);
  return deck;
}
function setCssVar(varname, val) { document.body.style.setProperty(varname, val); }
async function setCurrentTheme() {
  copyKeys(DA.theme, U);
  U.color = colorFrom(U.color);
  delete U.bgImage;
  assertion(!U.texture.startsWith('http'), 'KATHAS setCurrentTheme!!!!!')
  M.users[U.name] = jsCopy(U);
  await postUsers();
  setTheme(U);
}
function setDrawCardSmall(card, dParent, hCard = 100) {
  const paths = {
    diamond: "M25 0 L50 50 L25 100 L0 50 Z",
    squiggle: "M38.4,63.4c2,16.1,11,19.9,10.6,28.3c1,9.2-21.1,12.2-33.4,3.8s-15.8-21.2-9.3-38c3.7-7.5,4.9-14,4.8-20 c0-16.1-11-19.9-10.6-28.3C1,0.1,21.6-3,33.9,5.5s15.8,21.2,9.3,38C40.4,50.6,38.5,57.4,38.4,63.4z",
    oval: "M25,95C14.2,95,5.5,85.2,5.5,80V20C5.5,13.2,14.2,5.2,25,5.2S44.5,13.2,44.5,20v60 C44.5,85.2,35.8,95,25,95z"
  }
  let [color, shape, num, patt] = card.split('_');
  let wCard = hCard / .65;
  let wSymbol = wCard / 4;
  let hSymbol = 2 * wSymbol;
  let d0 = mDom(dParent, { display: 'flex', wmin: wCard, h: hCard, bg: 'white', rounding: 10, gap: 2 });
  mStyle(d0, { justifyContent: 'center', 'align-items': 'center', margin: 2 })
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
function setGoal(index) {
  if (nundef(index)) {
    let rnd = G.numPics < 2 ? 0 : randomNumber(0, G.numPics - 2);
    if (G.numPics >= 2 && rnd == lastPosition && coin(70)) rnd = G.numPics - 1;
    index = rnd;
  }
  lastPosition = index;
  Goal = Pictures[index];
}
function setInstruction(s) { mBy('dInstructionText').innerHTML = s; }
function setKeys({ allowDuplicates, nMin = 25, lang, key, keySets, filterFunc, param, confidence, sortByFunc } = {}) {
  let keys = jsCopy(keySets[key]);
  if (isdef(nMin)) {
    let diff = nMin - keys.length;
    let additionalSet = diff > 0 ? nMin > 100 ? firstCondDictKeys(keySets, k => k != key && keySets[k].length > diff) : 'best100' : null;
    if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x));
  }
  let primary = [];
  let spare = [];
  for (const k of keys) {
    let info = Syms[k];
    info.best = info[lang];
    if (nundef(info.best)) {
      let ersatzLang = (lang == 'D' ? 'D' : 'E');
      let klang = 'best' + ersatzLang;
      if (nundef(info[klang])) info[klang] = lastOfLanguage(k, ersatzLang);
    }
    let isMatch = true;
    if (isdef(filterFunc)) isMatch = isMatch && filterFunc(param, k, info.best);
    if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
    if (isMatch) { primary.push(k); } else { spare.push(k); }
  }
  if (isdef(nMin)) {
    let len = primary.length;
    let nMissing = nMin - len;
    if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(spare, list); primary = primary.concat(list); }
  }
  if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }
  if (isdef(nMin)) console.assert(primary.length >= nMin);
  if (nundef(allowDuplicates)) {
    primary = removeDuplicates(primary);
  }
  return primary;
}
function setLanguage(x) { currentLanguage = x; startLevel(); }
async function setPlayerNotPlaying(item, gamename) {
  removeInPlace(DA.playerList, item.name);
  let d1 = createPlayerOptionDialog(item.name, gamename, item.div, `${item.name} (not playing)`);
  arrChildren(d1).forEach(d => mStyle(d, { opacity: .5 }));
  unselectPlayerItem(item);
}
async function setPlayerPlaying(allPlItem, gamename) {
  let plName = allPlItem.name;
  addIf(DA.playerList, plName);
  highlightPlayerItem(allPlItem);
  let d1 = createPlayerOptionDialog(plName, gamename, allPlItem.div, `${plName}`);
  arrChildren(d1).forEach(d => mStyle(d, { opacity: 1 }));
}
function setPlayersToMulti() {
  for (const name in DA.allPlayers) {
    lookupSetOverride(DA.allPlayers, [name, 'playmode'], 'human');
    updateUserImageToBotHuman(name, 'human');
  }
  setRadioValue('playmode', 'human');
}
function setPlayersToSolo() {
  let me = U.name;
  for (const name in DA.allPlayers) {
    let val = name == me ? 'human' : 'bot';
    lookupSetOverride(DA.allPlayers, [name, 'playmode'], val);
    updateUserImageToBotHuman(name, val);
  }
  let popup = mBy('dPlayerOptions');
  if (isdef(popup)) {
    let val = popup.firstChild.innerHTML.includes(U.name) ? 'human' : 'bot';
    setRadioValue('playmode', 'bot');
  }
}
function setRadioValue(prop, val) {
  let input = mBy(`i_${prop}_${val}`);
  if (nundef(input)) return;
  input.checked = true;
}
function setRect(elem, options) {
  let r = getRect(elem);
  elem.rect = r;
  elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`);
  if (isDict(options)) {
    if (options.hgrow) mStyle(elem, { hmin: r.h });
    else if (options.hfix) mStyle(elem, { h: r.h });
    else if (options.hshrink) mStyle(elem, { hmax: r.h });
    if (options.wgrow) mStyle(elem, { wmin: r.w });
    else if (options.wfix) mStyle(elem, { w: r.w });
    else if (options.wshrink) mStyle(elem, { wmax: r.w });
  }
  return r;
}
async function setSendMove(name, newTable, success, lastMove) {
  let step = newTable.step;
  let change = success ? 1 : -1;
  if (success) {
    newTable.step += 1;
    newTable.players[name].score += change;
    newTable.oldfen.move = lastMove;
    newTable.oldfen.name = name;
  }
  let res = await tableSaveRace(newTable, { step, name, change, prop: 'score', success, lastMove });
  console.log(res.message)
}
function setStallStage(table) {
  let fen = table.fen;
  delete fen.passed;
  table.turn = [table.plorder[0]];
  fen.stage = fen.phase == 'jack' ? 12 : fen.phase == 'queen' ? 11 : 4;
  fen.stallSelected = [];
  if (fen.phase == 'queen' && nundef(fen.ball)) {
    fen.ball = [];
    fen.ballContributions = {};
    fen.ballPlayers = [];
  }
  return [fen.stage, table.turn];
}
function setTableSize(w, h, unit = 'px') {
  let d = mBy('areaTable');
  mStyle(d, { 'min-width': w, 'min-height': h }, unit);
}
function setTexture(item, d) {
  d = toElem(d)
  if (nundef(d)) d = mBy('dPage');
  if (isEmpty(item.texture)) {
    d.style.backgroundImage = '';
    d.style.backgroundSize = '';
    d.style.backgroundBlendMode = '';
    d.style.backgroundRepeat = '';
    return;
  }
  let bgImage = bgImageFromPath(item.texture);
  let bgBlend = item.bgBlend;
  let bgSize = item.bgSize;
  let bgRepeat = item.bgRepeat;
  if (bgSize == 'cover') bgSize = '100% 100%';
  if (!isEmpty(bgSize)) { mStyle(d, { bgImage, bgBlend, bgRepeat, bgSize }); }
  else { d.style.backgroundSize = ''; mStyle(d, { bgImage, bgBlend, bgRepeat }); }
}
async function setTextureToItem(item) {
  if (isEmpty(item.texture)) {
    for (const prop of ['texture', 'palette', 'bgImage', 'bgSize', 'bgBlend', 'bgRepeat']) delete U[prop];
  } else {
    U.texture = item.texture;
    U.bgBlend = item.bgBlend;
    U.bgSize = item.bgSize;
    U.bgRepeat = item.bgRepeat;
  }
  U.color = colorFrom(U.color);
  delete U.bgImage;
  assertion(!U.texture.startsWith('http'), 'KATHAS setCurrentTheme!!!!!')
  M.users[U.name] = jsCopy(U);
  await postUsers();
}
function setTheme(item) {
  if (nundef(item)) item = U;
  setColors(item);
  setTexture(item);
}
async function setThemeToItem(ev) {
  let key = evToAttr(ev, 'theme');
  let theme = jsCopyExceptKeys(M.config.themes[key], ['name']);
  copyKeys(theme, U);
  U.color = colorFrom(U.color);
  delete U.bgImage;
  if (!isEMpty(U.texture)) assertion(!U.texture.startsWith('http'), 'KATHAS setCurrentTheme!!!!!')
  M.users[U.name] = jsCopy(U);
  await postUsers();
}
function setToSelected(el) {
  el.setAttribute('selected', true);
  mStyle(el, { outline: '3px solid yellow' });
}
function set_card_border(item, thickness = 1, color = 'black', dasharray = null) {
  let d = item.div;
  console.log('set_card_border', item, d);
  let rect = lastDescendantOfType('rect', d);
  if (rect) {
    rect.setAttribute('stroke-width', thickness);
    rect.setAttribute('stroke', color);
    if (isdef(dasharray)) rect.setAttribute('stroke-dasharray', dasharray);
  } else {
    mStyle(d, { border: `solid ${thickness}px ${color}` })
  }
}
function set_card_style(item, styles = {}, className) {
  console.log('set_card_style', item, styles);
  let d = iDiv(item);
  let svg = findDescendantOfType('svg', d);
  let rect = findDescendantOfType('rect', svg);
  if (isdef(styles.shadow)) {
    let shadow = styles.shadow;
    delete styles.shadow;
    let hexcolor = colorFrom(styles.shadow);
    svg.style.filter = `drop-shadow(4px 5px 2px ${hexcolor})`;
  }
  if (isdef(styles.bg)) {
    let hexcolor = colorFrom(styles.bg);
    rect.setAttribute('stroke-width', 14); rect.setAttribute('stroke', hexcolor);
  }
  assertion(rect, 'NO RECT FOUND IN ELEM', d);
  mStyle(d, styles);
  if (isdef(className)) mClass(svg, className);
}
function setgame() {
  function setup(table) {
    stdSetupGame(table);
    let minCD = arrMin(Object.values(table.players), x => x.countdown);
    for (const plName in table.players) {
      table.players[plName].cdRel = table.options.use_levels == 'yes' ? table.players[plName].countdown - minCD : 0;
    }
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
      special = setCheckIfSpecial(keys);
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
    let d1 = mDom(dParent, {}, { id: 'dTableButtons' });
    let d2 = mDom(dParent, { w, }, { id: 'dTableCards' });
    let rect = getRectInt(d2);
    let gap = 10;
    let maxHeight = window.innerHeight - 100 - rect.y - 40 - (rows - 1) * gap;
    sz = calcCardSize(rows + 1, fen.cols, rect.w, maxHeight, 2);
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
      }
      table.fen.originalPlayers = table.players;
    }
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
    if (!isEmpty(Object.keys(DA.selectedItems))) {
      console.log('HALLO!!!!!!!!!!!!!!!!!!!')
      let itemsCand = ui.items.filter(x => isdef(DA.selectedItems[x.key]));
      let doEval = true;
      if (lookup(table, ['action', 'success'])) {
        let lastset = table.action.keys;
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
      stdEvalShield();
      await rsgEval(uname, table, keys, m, bypass);
    } else {
      DA.isProcessingMove = false;
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
      nonOverlappingSets.map(x =>console.log(x[0].key, x[1].key, x[2].key));
    }
    if (isEmpty(result))console.log('no set!')
    return result;
  }
  return { setup, present, activate, process, setFindAllSets }
}
function settingsCheck() {
  if (isdef(DA.settings)) {
    cmdDisable(UI.commands.settResetAll.key);
    for (const k in DA.settings) {
      if (isLiteral(U[k]) && DA.settings[k] != U[k]) {
        cmdEnable(UI.commands.settResetAll.key); break;
      }
    }
  }
}
async function settingsOpen() {
  DA.settings = jsCopy(U);
  clearMain();
  let d = mDom('dMain', {}, { id: 'dSettingsMenu' });
  let submenu = valf(localStorage.getItem('settingsMenu'), 'settTheme');
  settingsSidebar();
  await UI.commands[submenu].open();
  settingsCheck();
}
function show(elem, isInline = false) {
  if (isString(elem)) elem = document.getElementById(elem);
  if (isSvg(elem)) {
    elem.setAttribute('style', 'visibility:visible');
  } else {
    elem.style.display = isInline ? 'inline-block' : null;
  }
  return elem;
}
async function showBlendModePalette(dParent, selected, onclick, wcell, fText) {
  mClear(dParent);
  const d1 = mDom(dParent, { padding: 10, gap: 4 });
  mFlexWrap(d1);
  let list = arrMinus(getBlendModesCSS(), ['saturation', 'color']);
  const n = 14;
  const w = n * wcell, h = w * 0.65;
  for (const blendCSS of list) {
    let bg = colorFrom(U.color);
    let fg = U.fg || colorIdealText(bg);
    let url = U.texture;
    let bgImage = `url('${url}')`;
    let bgSize = U.bgSize;
    let bgRepeat = U.bgRepeat;
    let bgBlend = blendCSS;
    let d0 = mDom(d1, { w, fg }, { className: 'ellipsis', html: fText(bgBlend) });
    let dc = mDom(d0, { w, h, bg, bgImage, bgSize, bgRepeat, bgBlend, cursor: 'pointer', border: 'white' });
    dc.style.backgroundPosition = 'center';
    if (bgBlend == U.bgBlend) mStyle(d0, { outline: 'solid 2px yellow' });
    if (isdef(onclick)) d0.onclick = () => onclick(blendCSS);
  }
}
async function showBlendModes() {
  let dParent = mBy('dSettings');
  let fText = bgBlend => `<b>Blendmode: ${bgBlend}</b>`
  let wcell = 29;
  showBlendModePalette(dParent, U.bgBlend, onclickBlendMode, wcell, fText);
}
async function showCalendarApp() {
  if (!U) {console.log('you have to be logged in to use this menu!!!'); return; }
  showTitle('Calendar');
  let d1 = mDom('dMain', { w: 800, h: 800, margin: 20 }); //, bg: 'white' })
  let x = DA.calendar = await uiTypeCalendar(d1);
}
function showCardMini(dt, card, sz = 40, bg = 'red', border = 'black', borderThickness = 3, shadow = false, bgFace = 'white') {
  mFlex(dt);
  let cardui = uiTypeCard52(card, sz, bg, border, borderThickness, shadow, bgFace);
  mClear(dt);
  mAppend(dt, cardui.div);
}
function showChatMessage(data) {
  var chatBox = document.getElementById("chatBox");
  var newMessage = document.createElement("div");
  newMessage.textContent = data.username + ": " + data.message;
  chatBox.appendChild(newMessage);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function showColorBox(c, skeys = 'name hex hue sat lum', dParent = null, styles = {}) {
  let bg = c.hex;
  let fg = colorIdealText(bg);
  let keys = toWords(skeys);
  let st = jsCopy(styles)
  addKeys({ bg, fg, align: 'center' }, st);
  let textStyles = { weight: 'bold' };
  let d2 = mDom(dParent, st, { class: 'colorbox', dataColor: bg });
  mDom(d2, textStyles, { html: c[keys[0]] });
  let html = '';
  for (let i = 1; i < keys.length; i++) {
    let key = keys[i];
    let val = c[key];
    if (isNumber(val)) val = Number(val);
    if (val <= 1) val = from01ToPercent(val);
    html += `${key}:${val}<br>`;
  }
  let dmini = mDom(d2, {}, { html });
  let item = jsCopy(c);
  item.div = dmini;
  item.dOuter = d2;
  return item;
}
function showColorPalette(d, palette, hue, fclick, lines = 4) {
  let palettes = [palette];
  for (const b of [20, 35, 50, 65, 80]) {
    let palshades = [];
    for (const i of range(Math.max(palette.length - 7, 4))) {
      let p = palette[i];
      let o = colorO(p);
      let h = o.hue;
      let s = o.sat * 100;
      let l = b;
      let cnew = colorFromHsl(h, s, l);
      palshades.push(cnew);
    }
    let pal = generateColors(7, b, hue, 50);
    palshades = palshades.concat(pal);
    palettes.push(palshades);
  }
  for (const b of [20, 35, 50, 65, 80]) {
    palettes.push(generateColors(palette.length, b, 0));
  }
  let grayscales = grayShades(palette.length);
  palettes.push(grayscales)
  let items = [];
  for (const pal of palettes.slice(0, lines)) {
    mLinebreak(d);
    let newItems = showPaletteMiniX(d, pal);
    items = items.concat(newItems);
  }
  for (const item of items) {
    let div = iDiv(item);
    mStyle(div, { cursor: 'pointer' }, { onclick: fclick });
  }
  return items;
}
function showColorPalette1(d, palette, fclick, n = 10, lines = 4) {
  let palettes = paletteCreateFrom(palette);
  let rect = getRect(d);
  console.log('showColorPalette1 rect', rect); return;
  mCenterFlex(d);
  let items = [];
  for (const pal of palettes.slice(0, lines)) {
    mLinebreak(d);
    let newItems = showPal(d, pal.slice(0, n));
    items = items.concat(newItems);
  }
  for (const item of items) {
    let div = iDiv(item);
    mStyle(div, { cursor: 'pointer' }, { onclick: fclick });
  }
  return items;
}
async function showColors() {
  const dParent = mBy('dSettings');
  mClear(dParent);
  const list = getAllColorsAsNameHexObjects();
  const d1 = mDom(dParent, { padding: 10, gap: 4 });
  let color = colorFrom(U.color);
  color = colorNearestNamed(color).hex;
  mFlexWrap(d1);
  let cur = null;
  for (var c of list) {
    let bg = c.hex;
    let html = `${c.name}`;
    let el = mDom(d1, { cursor: 'pointer', margin: 6, padding: 10, bg, fg: colorIdealText(bg) }, { html, class: 'colorbox', dataColor: bg });
    if (bg == color) {
      cur = el;
    }
    el.onclick = () => onclickColorInSettings(bg, el);
  }
  assertion(cur, "NO SELECTED ELEMENT!!!!")
  if (cur) {
    setToSelected(cur);
    let rect1 = getRectInt(cur, d1);
    mBy('dSettings').scrollTo({ top: rect1.y + window.scrollY - 20, behavior: 'smooth' });
  }
}
async function showDashboard() {
  let me = U.name;
  if (me == 'guest') { mDom('dMain', { align: 'center', className: 'section' }, { html: 'click username in upper right corner to log in' }); return; }
  homeSidebar(150);
  mAdjustPage(150);
  let div = mDom100('dMain');
  let d1 = mDom(div); mCenterFlex(d1)
  let dta = mDom(d1, { gap: 10, padding: 12 }, { className: 'section' });
  let dblog = mDom(d1, { w100: true, align: 'center' });
  let blog = U.blog;
  if (nundef(blog)) return;
  for (const bl of blog) {
    let dx = mDom(dblog, {}, { className: 'section', html: bl.text });
  }
}
function showDetailsPresentation(o, dParent) {
  let onew = {};
  let nogo = ['longSpecies', 'ooffsprings', 'name', 'cats', 'colls', 'friendly', 'ga', 'fa', 'fa6', 'text', 'key', 'nsize', 'nweight', 'img', 'photo']
  for (const k in o) {
    if (nogo.includes(k)) continue;
    let val = o[k];
    let knew = k == 'ofoodtype' ? 'foodtype' : k;
    if (isString(val)) {
      val = replaceAll(val, '>-', '');
      val = val.trim();
      if (val.startsWith("'")) val = val.substring(1);
      if (val.endsWith("'")) val = val.substring(0, val.length - 1);
      if (val.includes(':')) val = stringAfter(val, ':')
      onew[knew] = capitalize(val.trim());
    }
    if (k == 'food')console.log(onew[knew])
  }
  onew = sortDictionary(onew);
  return showObjectInTable(onew, dParent, { w: window.innerWidth * .8 });
}
async function showDirPics(dir, dParent) {
  let imgs = await mGetFiles(dir);
  for (const fname of imgs) {
    let src = `${dir}/${fname}`;
    let sz = 200;
    let styles = { 'object-position': 'center top', 'object-fit': 'cover', h: sz, w: sz, round: true, border: `${rColor()} 2px solid` }
    let img = mDom(dParent, styles, { tag: 'img', src });
  }
}
async function showGameMenu(gamename) {
  let users = M.users = await loadStaticYaml('y/users.yaml'); //console.log('users',users); return;
  mRemoveIfExists('dGameMenu');
  let dMenu = mDom('dMain', {}, { className: 'section', id: 'dGameMenu' });
  sectionTitle('dGameMenu', 'game options');
  let style = { display: 'flex', justifyContent: 'center', w: '100%', gap: 10, matop: 6 };
  let dPlayers = mDom(dMenu, style, { id: 'dMenuPlayers' }); //mCenterFlex(dPlayers);
  let dOptions = mDom(dMenu, style, { id: 'dMenuOptions' }); //'dMenuOptions'); //mCenterFlex(dOptions);
  let dButtons = mDom(dMenu, style, { id: 'dMenuButtons' }); //'dMenuButtons');
  DA.gamename = gamename;
  DA.gameOptions = {};
  DA.playerList = [];
  DA.allPlayers = {};
  DA.lastName = null;
  await showGamePlayers(dPlayers, users);
  await showGameOptions(dOptions, gamename);
  let astart = mButton('Start', onclickGameStart, dButtons, {}, ['button', 'input']);
  let ajoin = mButton('Open to Join', onclickOpenToJoinGame, dButtons, {}, ['button', 'input']);
  let acancel = mButton('Cancel', () => mClear(dMenu), dButtons, {}, ['button', 'input']);
  let bclear = mButton('Clear Players', onclickClearPlayers, dButtons, {}, ['button', 'input']);
}
async function showGameMenuPlayerDialog(name, shift = false) {
  let allPlItem = DA.allPlayers[name];
  let gamename = DA.gamename;
  let da = iDiv(allPlItem);
  if (!DA.playerList.includes(name) || name == U.name) await setPlayerPlaying(allPlItem, gamename);
  else if (name != U.name) await setPlayerNotPlaying(allPlItem, gamename);
}
async function showGameOptions(dParent, gamename) {
  let poss = M.config.games[gamename].options;
  if (nundef(poss)) return;
  for (const p in poss) {
    let key = p;
    let val = poss[p];
    if (isString(val)) {
      let list = val.split(',');
      let legend = formatLegend(key);
      let fs = mRadioGroup(dParent, { fg: 'black' }, `d_${key}`, legend);
      for (const v of list) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, null, key, true); }
      measureFieldset(fs);
    }
  }
  let inpsolo = mBy(`i_gamemode_solo`);//console.log('HALLO',inpsolo)
  let inpmulti = mBy(`i_gamemode_multi`);
  let inphotseat = mBy(`i_gamemode_hotseat`);
  if (isdef(inpsolo)) inpsolo.onclick = setPlayersToSolo;
  if (isdef(inpmulti)) inpmulti.onclick = setPlayersToMulti;
  if (isdef(inphotseat)) inphotseat.onclick = setPlayersToMulti;
}
async function showGamePlayers(dParent, users) {
  let me = U.name;
  mStyle(dParent, { flexWrap: 'wrap' });
  let userlist = ['amanda', 'felix', 'mimi'];
  for (const name in users) addIf(userlist, name);
  for (const name of userlist) {
    let d = showUser(dParent, name, onclickGameMenuPlayer);
    let item = userToPlayer(name, DA.gamename); item.div = d; item.isSelected = false;
    DA.allPlayers[name] = item;
  }
  await setPlayerPlaying(DA.allPlayers[me], DA.gamename);
}
function showGameover(t) {
  mStyle('dTop', { z: 200000 })
  let winners = t.fen.winners;
  let msg = winners.length > 1 ? `GAME OVER - The winners are ${winners.join(', ')}!!!` : `GAME OVER - The winner is ${winners[0]}!!!`;
  let dh = mBy('dHidden');
  let dh1 = mDom(dh, { fz: 30, pav: 20, align: 'center', w100: true, bg: U.color }, { html: msg }); //mStyle(dex,{h:100,bg})
  let bg = U.color;
  dh1.style.background = `linear-gradient(45deg, ${bg},#ffeedd, ${bg})`;
  mLinebreak(dh1);
  mDom(dh1, { bg: '#00000080', fg: 'white', matop: 10 }, {
    tag: 'button', html: 'play again!',
    onclick: () => { if (isdef(t.fen.original_players)) t.players = t.fen.original_players; onclickTableStart(t.id) }
  });
}
function showGames(dParent) {
  sectionTitle(dParent, 'games');
  let gameMenu = createCardContainer(dParent, {}, 'game_menu');
  for (const gname of DA.gamelist) {
    let g = M.config.games[gname];
    g.name = gname;
    createGameCard(gameMenu, g);
  }
}
function showGamesAndTables() {
  let tables = dict2list(DA.tableDict);
  tables.sort((a, b) => a.modified < b.modified ? 1 : -1);
  let me = U.name;
  let dTableList = mBy('dTableList') || mDom('dMain', {}, { className: 'section', id: 'dTableList' });
  mClear(dTableList);
  showTables(dTableList, tables, me);
  let dGameList = mBy('dGameList') || mDom('dMain', {}, { className: 'section', id: 'dGameList' });
  mClear(dGameList);
  showGames(dGameList);
  let dGameMenu = mBy('dGameMenu');
  if (isdef(dGameMenu)) {
    console.log('removing old game menu');
    mRemove(dGameMenu);
  }
}
function showHandSortingButtonsFor(pl, ui) {
  if (pl.hand.length <= 1) return;
  let x = ui.hand;
  let d = x.container.parentNode;
  let bstyles = { z: 10000, position: 'absolute', hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black' };
  let b1 = mDom(d, { ...bstyles, left: 20, bottom: 2 }, { tag: 'button', innerHTML: 'rank' });
  b1.onclick = () => {
    let cardItems = cSort(ui.handCards, null, 'A23456789TJQK');
    splayItems(cardItems, x.container, { direction: x.direction, overlap: x.overlap });
  }
  let b2 = mDom(d, { ...bstyles, right: 20, bottom: 2 }, { tag: 'button', innerHTML: 'suit' });
  b2.onclick = () => {
    let cardItems = cSort(ui.handCards, 'CDSH', 'A23456789TJQK');
    splayItems(cardItems, x.container, { direction: x.direction, overlap: x.overlap });
  }
}
function showHourglass(uname, d, sz, stylesPos = {}) {
  let html = getWaitingHtml(sz);
  mStyle(d, { position: 'relative' });
  addKeys({ position: 'absolute' }, stylesPos);
  let dw = mDom(d, stylesPos, { id: `dh_${uname}`, html });
}
function showImage(key, dParent, styles = {}, useSymbol = false) {
  let o = M.superdi[key];
  if (nundef(o)) {console.log('showImage:key not found', key); return; }
  let [w, h] = [valf(styles.w, styles.sz), valf(styles.h, styles.sz)];
  if (nundef(w)) {
    mClear(dParent);
    [w, h] = [dParent.offsetWidth, dParent.offsetHeight];
  } else {
    addKeys({ w: w, h: h }, styles)
    dParent = mDom(dParent, styles);
  }
  let [sz, fz, fg] = [.9 * w, .8 * h, valf(styles.fg, rColor())];
  let hline = valf(styles.hline * fz, fz);
  let d1 = mDom(dParent, { position: 'relative', h: fz, overflow: 'hidden' });
  mCenterCenterFlex(d1)
  let el = null;
  if (!useSymbol && isdef(o.img)) el = mDom(d1, { w: '100%', h: '100%', 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src: `${o.img}` });
  else if (isdef(o.text)) el = mDom(d1, { fz: fz, hline: hline, family: 'emoNoto', fg: fg, display: 'inline' }, { html: o.text });
  else if (isdef(o.fa6)) el = mDom(d1, { fz: fz - 2, hline: hline, family: 'fa6', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
  else if (isdef(o.fa)) el = mDom(d1, { fz: fz, hline: hline, family: 'pictoFa', bg: 'transparent', fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
  else if (isdef(o.ga)) el = mDom(d1, { fz: fz, hline: hline, family: 'pictoGame', bg: valf(styles.bg, 'beige'), fg: fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
  else if (isdef(o.img)) el = mDom(d1, { w: '100%', h: '100%', 'object-fit': 'contain', 'object-position': 'center center' }, { tag: 'img', src: `${o.img}` });
  assertion(el, 'PROBLEM mit' + key);
  mStyle(el, { cursor: 'pointer' })
  return d1;
}
async function showImageColorPalette(dParent, url, bgBlend, bg, n = 10, minocc = 0, sz = 60) {
  let colors = await getMostDifferentColorsWithThresholdAndBlend(url, bgBlend, bg, n, minocc, sz);
  if (colors.length < n) { colors = colors.concat(colors.map(x => invertColor(x))); }
  if (colors.length < n) { colors = colors.concat(colors.map(x => colorComplement(x))); }
  while (colors.length < n) { colors.push(rColor()); }
  colors = colors.slice(0, n);
  if (isdef(dParent)) showPaletteMiniX(dParent, colors.map(x => colorFrom(x)), 50);
  return colors;
}
async function showImageColorPaletteN(dParent, url, bgBlend, bg, n = 14, minocc = 0, sz = 60) {
  let colors = await getMostDifferentColorsWithThresholdAndBlend(url, bgBlend, bg, n, minocc, sz);
  let o = { orig: colors.map(x => colorFrom(x)) }
  o.complementary = colors.map(x => colorComplement(x));
  for (const c of colors) {
    let cm = getMatchingColors(c);
    for (const k in cm) {
      if (nundef(o[k])) o[k] = [];
      let x = cm[k];
      if (!isList(x)) o[k].push(x); else o[k] = o[k].concat(x);
    }
  }
  let res = Array.from(o.orig);
  for (const k in o) {
    if (k == 'orig') continue;
    let x = o[k];
    if (!isList(x)) x = [x];
    assertion(isList(x), 'ERROR showImageColorPaletteX');
    res.push(x[0]); res.push(x[1]);
  }
  res = res.slice(0, n);
  let result = [];
  for (const k in o) {
    let x = o[k];
    if (!isList(x)) x = [x];
    assertion(isList(x), 'ERROR showImageColorPaletteX');
    result = result.concat(o[k]);
  }
  if (isdef(dParent)) {
    let items = showPaletteMiniX(dParent, res.map(x => colorFrom(x)), 40);
    return items;
    for (const k in o) {
      mDom(dParent, {}, { html: `<b>${k} (${o[k].length})</b>` });
      showPaletteMiniX(dParent, o[k].map(x => colorFrom(x)), 50);
    }
  }
  return res;
}
async function showImageColorPaletteX(dParent, url, bgBlend, bg, n = 10, minocc = 0, sz = 60) {
  let colors = await getMostDifferentColorsWithThresholdAndBlend(url, bgBlend, bg, n, minocc, sz);
  console.log('orig', url, colors.length);
  let o = { orig: colors.map(x => colorFrom(x)) }
  o.complementary = colors.map(x => colorComplement(x));
  for (const c of colors) {
    let cm = getMatchingColors(c);
    for (const k in cm) {
      if (nundef(o[k])) o[k] = [];
      let x = cm[k];
      if (!isList(x)) o[k].push(x); else o[k] = o[k].concat(x);
    }
  }
  let result = [];
  for (const k in o) {
    let x = o[k];
    if (!isList(x)) x = [x];
    assertion(isList(x), 'ERROR showImageColorPaletteX');
    console.log(o[k])
    result = result.concat(o[k]);
  }
  console.log('result', result);
  if (isdef(dParent)) {
    for (const k in o) {
      mDom(dParent, {}, { html: `<b>${k} (${o[k].length})</b>` });
      showPaletteMiniX(dParent, o[k].map(x => colorFrom(x)), 50);
    }
  }
  return result;
}
async function showInstructionCompact(table, instruction) {
  let myTurn = isMyTurn(table);
  if (!myTurn) staticTitle(table); else animatedTitle();
  if (nundef(instruction)) return;
  let styleInstruction = { hmin: 42, display: 'flex', 'justify-content': 'center', 'align-items': 'center' };
  let dinst = mBy('dInstruction');
  if (nundef(dinst)) return;
  mClear(dinst);
  let html;
  if (myTurn) {
    styleInstruction.maleft = -30;
    html = `
        ${getWaitingHtml()}
        <span style="color:red;font-weight:bold;max-height:25px">You</span>
        &nbsp;${instruction};
        `;
  } else { html = `waiting for: ${getTurnPlayers(table)}` }
  mDom(dinst, styleInstruction, { html });
}
async function showInstructionStandard(table, instruction) {
  let myTurn = isMyTurn(table);
  if (!myTurn) staticTitle(table); else animatedTitle();
  if (nundef(instruction)) return;
  let styleInstruction = { hmin: 42, display: 'flex', 'justify-content': 'center', 'align-items': 'center' };
  let dinst = mBy('dInstruction');
  if (nundef(dinst)) return;
  mClear(dinst);
  let html;
  if (myTurn) {
    styleInstruction.maleft = -30;
    html = `
        ${getWaitingHtml()}
        <span style="color:red;font-weight:bold;max-height:25px">You</span>
        &nbsp;${instruction};
        `;
  } else { html = `waiting for: ${getTurnPlayers(table)}` }
  mDom(dinst, styleInstruction, { html });
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
function showItemAsUnselected(item) {
  switch (item.itype) {
    case 'card': make_card_unselected(item); break;
    case 'container': make_container_unselected(item); break;
    case 'player': make_container_unselected(item); break;
    case 'string': make_string_unselected(item); break;
  }
  item.state = 'unselected';
}
async function showKeys(keys, d) {
  let centered = { display: 'flex', alignItems: 'center', justifyContent: 'center', baseline: 'middle' };
  mClear(d);
  let [gap, w, h] = [10, 100, 100];
  let dGrid = mDom(d, { display: 'flex', fg: 'black', gap, padding: gap, wrap: true });
  let i = 0;
  let n = Math.floor(window.innerWidth / (w + gap)) * Math.floor(window.innerHeight / (h + gap));
  for (const k of keys) {
    let d = mDom(dGrid, { bg: 'silver', padding: gap, cursor: 'pointer' }, { id: getUID(), onclick: onclickItem });
    let x = mKey(k, d, { w, h, fz: h, hline: h, box: true, fg: 'black', bg: 'white' }, { special: true });
    mDom(d, { w, fg: 'black', 'text-overflow': 'ellipsis', 'white-space': 'nowrap', overflow: 'hidden', fz: 16, align: 'center' }, { html: k, title: k });
    DA.items[d.id] = { div: d, key: k };
    if (0 === ++i % n) await mSleep(20);
  }
}
function showMeeple(d, pMeeple) {
  lacunaDrawPoints(d, [pMeeple], false);
  let color = getPlayerProp('color', pMeeple.owner); //console.log('color', color)
  let letter = pMeeple.owner[0].toUpperCase();
  mStyle(iDiv(pMeeple), { border: `${color} 5px solid` });
  iDiv(pMeeple).innerHTML = letter;
}
function showMessage(msg, ms = 0, callback = null) {
  clearTimeout(TO.message);
  let d = mPopup(null, { transform: 'unset' }, { id: 'dMessage', html: msg });
  if (ms > 0) {
    TO.message = mFadeRemove(d, ms);
    if (callback) TO.message = setTimeout(() => { if (callback) callback(); }, ms + 2)
  }
}
function showObject(o, keys, dParent, styles = {}, opts = {}) {
  if (nundef(keys)) { keys = Object.keys(o); opts.showKeys = true; styles.align = 'left' }
  addKeys({ align: 'center', padding: 2, bg: 'dimgrey', fg: 'contrast' }, styles);
  let d = mDom(dParent, styles, opts);
  let onew = {};
  for (const k of keys) onew[k] = o[k];
  mNode(onew, d, opts.title);
  return d;
}
function showObjectInTable(onew, dParent, styles = {}, opts = {}) {
  let d = mDom(dParent, styles);
  let t = mTable(d);
  for (const k in onew) {
    let r = mCreate('tr');
    mAppend(t, r);
    let col = mCreate('td'); mAppend(r, col); col.innerHTML = `${k}: `;
    col = mCreate('td'); mAppend(r, col); mDom(col, {}, { html: `${onew[k]}` });
  }
  return t;
}
function showPal(dParent, colors, sz = 21) {
  let d1 = mDom(dParent, { display: 'flex', dir: 'column', wrap: true, gap: 1 }); //, hmax: '100vh', dir: 'column' });
  let rect = getRect(dParent);
  let items = [];
  for (var c of colors) {
    if (isDict(c)) c = c.hex;
    let fg = 'dimgray'; //colorIdealText(c); if (fg == 'white') fg='silver';
    let dc = mDom(d1, { w: sz, h: sz, bg: c, fg }); //,{onclick:()=>{let el=arrChildren(dParent)[1];el.style.backgroundColor=c;}});
    items.push({ div: dc, bg: c })
  }
  return items;
}
async function showPaletteFor(dParent, src, color, blendMode) {
  let fill = color;
  let bgBlend = getBlendCanvas(blendMode);
  let d = mDom(dParent, { w100: true, gap: 4 }); mCenterFlex(d);
  let palette = [color];
  if (isdef(src)) {
    let ca = await getCanvasCtx(d, { w: 500, h: 300, fill, bgBlend }, { src });
    palette = await getPaletteFromCanvas(ca.cv);
    palette.unshift(fill);
  } else {
    let ca = mDom(d, { w: 500, h: 300 });
    palette = arrCycle(paletteShades(color), 4);
  }
  let dominant = palette[0];
  let palContrast = paletteContrastVariety(palette, palette.length);
  mLinebreak(d);
  showPaletteMini(d, palette);
  mLinebreak(d);
  showPaletteMini(d, palContrast);
  mLinebreak(d);
  return [palette.map(x => colorO(x)), palContrast];
}
function showPaletteMini(dParent, colors, sz = 30) {
  let d1 = mDom(dParent, { display: 'flex', wrap: true, gap: 2 }); //, hmax: '100vh', dir: 'column' });
  let items = [];
  for (var c of colors) {
    if (isDict(c)) c = c.hex;
    let fg = 'dimgray'; //colorIdealText(c); if (fg == 'white') fg='silver';
    let dc = mDom(d1, { w: sz, h: sz, bg: c, fg, border: `${fg} solid 3px` });
    items.push({ div: dc, bg: c })
  }
  return items;
}
function showPaletteMiniX(dParent, colors, sz = 21) {
  let d1 = mDom(dParent, { display: 'flex', wrap: true, gap: 1 }); //, hmax: '100vh', dir: 'column' });
  let items = [];
  for (var c of colors) {
    if (isDict(c)) c = c.hex;
    let fg = 'dimgray'; //colorIdealText(c); if (fg == 'white') fg='silver';
    let dc = mDom(d1, { w: sz, h: sz, bg: c, fg }); //,{onclick:()=>{let el=arrChildren(dParent)[1];el.style.backgroundColor=c;}});
    items.push({ div: dc, bg: c })
  }
  return items;
}
function showPics(dParent, keys, scales, numRows, numCols, uniformSize) {
  let gap = 10;
  let containerWidth = numCols * uniformSize + (numCols - 1) * gap + (2 * gap);
  let containerHeight = numRows * uniformSize + (numRows - 1) * gap + (2 * gap);
  let dControls = mDom(dParent, { display: 'flex', gap: 20, margin: 10 });
  let btnUp = mDom(dControls, { tag: 'button', html: 'Page Up (▲)', cursor: 'pointer', padding: '5px 15px' });
  let btnDown = mDom(dControls, { tag: 'button', html: 'Page Down (▼)', cursor: 'pointer', padding: '5px 15px' });
  let txtPage = mDom(dControls, { tag: 'span', html: 'Page: 1', 'font-weight': 'bold', 'align-self': 'center' });
  let d2 = mDom(dParent, {
    bg: 'blue',
    w: containerWidth,
    h: containerHeight,
    box: true,
    padding: gap,
    overflow: 'hidden'
  });
  d2.style.display = 'grid';
  d2.style.gridTemplateColumns = `repeat(${numCols}, ${uniformSize}px)`;
  d2.style.gridTemplateRows = `repeat(${numRows}, ${uniformSize}px)`;
  d2.style.gap = `${gap}px`;
  d2.style.alignContent = 'start';
  d2.style.justifyContent = 'start';
  let n = keys.length;
  let currentPage = 0;
  let itemsPerPage = numCols * numRows;
  let renderedElements = [];
  for (let i = 0; i < n; i++) {
    let key = keys[i];
    let scale = scales[i % scales.length];
    let baseIconSz = uniformSize / 1.5;
    let sz = baseIconSz * scale;
    console.log(sz);
    let styles = {
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
    renderedElements.push(d0);
  }
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
  window.onkeydown = function (e) {
    if (e.key === 'PageDown' || e.key === 'ArrowDown' || e.code === 'PageDown') {
      e.preventDefault();
      pageDown();
    } else if (e.key === 'PageUp' || e.key === 'ArrowUp' || e.code === 'PageUp') {
      e.preventDefault();
      pageUp();
    }
  };
  renderCurrentPage();
}
function showPlaetze(dCard, item, gap, color = 'silver') {
  let n = item.ooffsprings.num;
  let sym = item.class == 'mammal' ? 'paw' : 'big_egg';
  let html = wsGetChildInline(item, color);
  let plaetze = nundef(n) ? 2 : n == 0 ? 0 : n == 1 ? 1 : n < 8 ? 2 : n < 25 ? 3 : n < 100 ? 4 : n < 1000 ? 5 : 6;
  let [rows, cols, w] = [3, plaetze <= 3 ? 1 : 2, plaetze <= 3 ? gap : 3 * gap]
  let dgrid = mGrid(3, cols, dCard, { gap: gap * .8 });//{w,h:5*gap,gap:gap/2});
  for (const i of range(plaetze)) { mDom(dgrid, { w: gap, h: gap, fg: color }, { html }); }
  return dgrid;
}
function showSettings() {
  let dParent = mDom('dMain', { padding: 0, margin: 0, w100: true, h100: true }); //, bg: U.color, fg: 'contrast' });
  let [dlb, dSettings] = mLayout(dParent, [`dSettingsMenu@ dSettings@`], `auto 1fr`, `1fr`, {}, { hrow: 30, wcol: 200, registerDivs: false, shade: false });
  mStyle(dlb, { patop: 20, align: 'center', w: 170, h100: true, bg: '#00000080', fg: 'white' }); //, padding: 10, box: true });
  mStyle(dSettings, { h100: true });//, padding: 10, box: true });
  mStyle('dSettings', { overy: 'scroll' });
  mStyle('dMain', { overy: 'hidden' });
  let bstyle = { w: 100, margin: '6px auto' }
  mDom(dlb, bstyle, { tag: 'button', html: 'Theme Editor', onclick: onclickSettThemeEditor, menu: 'top', key: 'games' });
  mDom(dlb, bstyle, { tag: 'button', html: 'Themes', onclick: onclickSettingsThemes, menu: 'top', key: 'table' });
  mDom(dlb, bstyle, { tag: 'button', html: 'Color', onclick: onclickSettColor, menu: 'top', key: 'settings' });
  mDom(dlb, bstyle, { tag: 'button', html: 'Texture', onclick: onclickSettTexture, menu: 'top', key: 'settings' });
  mDom(dlb, bstyle, { tag: 'button', html: 'Blend Mode', onclick: onclickSettBlendMode, menu: 'top', key: 'settings' });
  mDom(dlb, bstyle, { tag: 'button', html: 'Avatar', onclick: onclickSettAvatar, menu: 'top', key: 'settings' });
  let menu = localStorage.getItem('settingsMenu') || 'Theme Editor'; //console.log('menu', menu);
  clickOnButtonWithCaption(menu);
}
function showTables(dParent, tables, me) {
  let d = mDom(dParent, { display: 'flex', alignItems: 'baseline' });
  mDom(d, { fz: '150%', weight: 'bold', margin: 12, matop: 0 }, { html: 'tables' });
  if (isEmpty(tables)) return mDom(dParent, { maleft: 12, fg: 'blue' }, { html: 'no active game tables' });
  let t = mDataTable(tables, dParent, null, ['friendly'], 'tables', false);
  mTableCommandify(t.rowitems.filter(ri => ri.o.status != 'open'), {
    0: (item, val) => hFunc(val, 'onclickTable', item.o.id, item.id),
  });
  mTableStylify(t.rowitems.filter(ri => ri.o.status == 'open'), { 0: { fg: 'blue' } });
  let dFin = false; dAll = true;
  for (const ri of t.rowitems) {
    let r = iDiv(ri), id = ri.o.id, status = ri.o.status, owner = ri.o.owner, plNames = Object.keys(ri.o.players);
    mAppend(r, mCreate('td')).innerHTML = M.config.games[ri.o.game].friendly;
    mAppend(r, mCreate('td')).innerHTML = `(${status})`;
    mAppend(r, mCreate('td')).innerHTML = `${plNames.join(', ')}`;//'hallo'; //plNames.join(', ');
    if (ri.o.prior == 1) mDom(r, {}, { tag: 'td', html: getWaitingHtml(24) });
    if (status == 'over') { dFin = true; }
    if (status == 'open') {
      if (plNames.includes(me)) {
        if (owner != me) mAppend(r, mCreate('td')).innerHTML = hFunc('leave', 'onclickTableLeave', id);
      } else mAppend(r, mCreate('td')).innerHTML = hFunc('join', 'onclickTableJoin', id);
    }
    mAppend(r, mCreate('td')).innerHTML = hFunc('delete', 'onclickTableDelete', id);
    if (owner == me) {
      if (status == 'open') mAppend(r, mCreate('td')).innerHTML = hFunc('start', 'onclickTableStart', id);
    }
  }
  if (dFin) mDom(d, { bg: 'silver', patop: 4 }, { tag: 'button', html: 'delete finished', onclick: onclickDeleteFinished })
  mDom(d, { bg: 'silver', maleft: 10, patop: 4 }, { tag: 'button', html: 'delete all', onclick: onclickDeleteAll })
}
async function showTessellation(ev) {
  let name = ev.target.innerHTML;
  const response = await fetch(`http://localhost:5000/tesvg?u=${2}&v=${2}&shape=${name}`);
  const res = await response.text();
  console.log(res)
  mClear('dMain')
  let d = mBy('dMain');
  let html = `
        <svg id="svg2" width="500" height="500" viewBox="0 0 1 1" xmlns="http://www.w3.org/2000/svg" stroke="black"
            fill="lightblue" stroke-width="0.005">
            ${res}
        </svg>
        `;
  d.innerHTML = html;
  const gElement = document.querySelector('g');
  precomputePolygonNeighbors(gElement);
  addPolygonNeighborClick(gElement);
}
async function showTextColors() {
  let d = mBy('dSettingsMenu'); mClear(d);
  let d1 = mDom(d, { gap: 12, padding: 10 }); mFlexWrap(d1);
  let colors = ['white', 'silver', 'dimgray', 'black'].map(x => w3color(x)); //, getCSSVariable('--fgButton'), getCSSVariable('--fgButtonHover')].map(x => w3color(x));
  for (var c of colors) {
    let bg = 'transparent';
    let fg = c.hex = c.toHexString();
    let d2 = mDom(d1, { border: fg, wmin: 250, bg, fg, padding: 20 }, { class: 'colorbox', dataColor: fg });
    mDom(d2, { weight: 'bold', align: 'center' }, { html: 'Text Sample' });
    let html = `<br>${fg}<br>hue:${c.hue}<br>sat:${Math.round(c.sat * 100)}<br>lum:${Math.round(c.lightness * 100)}`
    let dmini = mDom(d2, { align: 'center', wmin: 120, padding: 2, bg, fg }, { html });
  }
  let divs = document.getElementsByClassName('colorbox');
  for (const div of divs) {
    div.onclick = async () => onclickTextColor(div.getAttribute('dataColor'));
  }
}
async function showTextures() {
  const dParent = mBy('dSettings');
  mClear(dParent);
  const list = await getTextureFiles(['texrepeat', 'texwall']);
  const d1 = mDom(dParent, { padding: 10, gap: 4 });
  mFlexWrap(d1);
  const n = 14, wcell = 29;
  const w = n * wcell, h = w * 0.65;
  const itemsTexture = [];
  let bg = colorFrom(U.color);
  let fg = U.fg || colorIdealText(bg);
  const d0 = mDom(d1, { w, fg }, { className: 'ellipsis', html: `<b>no texture</b>` });
  const dc = mDom(d0, { w, h, bg, fg, cursor: 'pointer', });
  let item0 = { div: dc, texture: '', bgImage: '', bgRepeat: 'no-repeat', bgBlend: 'normal', isSelected: isEmpty(U.texture) };
  itemsTexture.push(item0);
  dc.onclick = async () => await onclickTexture(item0);
  const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const el = entry.target;
        const url = el.dataset.src;
        el.style.backgroundImage = `url('${url}')`;
        obs.unobserve(el);
      }
    }
  }, { rootMargin: '200px' });
  const chunkSize = 20;
  for (let i = 0; i < list.length; i += chunkSize) {
    const chunk = list.slice(i, i + chunkSize);
    const frag = document.createDocumentFragment();
    const promises = chunk.map(async o => {
      let url = `../assets/${o.dir}/${o.file}`;
      let bgSize, bgRepeat, bgBlend;
      switch (o.dir) {
        case 'texwall':
          bgSize = 'cover'; // use cover for minimal cropping
          bgRepeat = 'no-repeat';
          bgBlend = U.bgBlend || 'luminosity';
          break;
        case 'texrepeat':
          let nums = getAppendedNumbers(stringBeforeLast(o.file, '.'));
          bgSize = nums.length == 2 ? `${nums[0]}px ${nums[1]}px` : 'auto';
          bgRepeat = 'repeat';
          bgBlend = U.bgBlend || 'normal';
          break;
      }
      const d0 = mDom(frag, { w, fg }, { className: 'ellipsis', html: `<b>${bgRepeat == 'repeat' ? 'R' : ''} ${o.file} ${bgBlend}</b>` });
      const dc = mDom(d0, { w, h, bg, fg, bgSize, bgRepeat, bgBlend, cursor: 'pointer', });
      dc.style.backgroundPosition = 'center';
      dc.dataset.src = url;
      observer.observe(dc);
      const item = { div: dc, texture: url, bgImage: `url('${url}')`, bgRepeat, bgBlend, isSelected: url == U.texture };
      item.bgSize = bgSize == 'cover' ? '100% 100%' : bgSize; // always expand cover to 100% 100%
      itemsTexture.push(item);
      dc.onclick = async () => await onclickTexture(item);
    });
    await Promise.all(promises);
    d1.appendChild(frag);
    await mSleep(10);
  }
  let cur = itemsTexture.find(x => x.isSelected);
  let rect = cur ? cur.div.getBoundingClientRect() : null; //console.log('rect', rect);
  if (rect) {
    dParent.scrollTo({ top: rect.top + window.scrollY - 100, behavior: 'smooth' });
    mStyle(cur.div.parentNode, { outline: '3px solid yellow' });
  }
  return itemsTexture;
}
async function showThemeEditor() {
  let theme = DA.theme;
  let bg = theme.color;
  const dParent = mBy('dSettings'); mClear(dParent);
  let dtop = mDom(dParent, { bg, display: 'flex', justifyContent: 'center', alignItems: 'center', w: '100%', h: '25%' }, { id: 'dtopTheme' });
  let dRest = mDom(dParent, { bg, display: 'flex', justifyContent: 'center', alignItems: 'center', w: '100%', h: '50%' }, { id: 'dFrame' });
  let dleft = mDom(dRest, { h100: true, w: '30%' }, { id: 'dleftTheme' }); mCenterCenterFlex(dleft)
  let dmiddle = mDom(dRest, { h100: true, w: '40%', }, { id: 'dmiddleTheme' });
  let dright = mDom(dRest, { h100: true, w: '30%' }, { id: 'drightTheme' });
  let dbottom = mDom(dParent, { bg, display: 'flex', justifyContent: 'center', alignItems: 'center', w: '100%', h: '25%' }, { id: 'dbottomTheme' });
  DA.themeDivs = { dtop, dleft, dmiddle, dright, dbottom };
  await redrawTheme();
}
function showThemeSample(dParent, th, styles = {}) {
  mClear(dParent);
  let bg = colorFrom(th.color);
  let fg = th.fg || colorIdealText(bg);
  let name = th.name;
  let dOuter = mDom(dParent, { padding: 10, box: true, h100: true });
  let r = getRect(dOuter);
  let dsample = mDom(dOuter, { h: r.h - 20, outline: `1px ${fg} solid` }, { theme: name, id: 'dThemeSample' });
  let dx = dsample;
  setTexture(th, dx)
  mStyle(dx, { bg, fg })
  let dmain = mDom(dsample, { padding: 10 }, { html: getMotto() });
  let dnav = mDom(dsample, { bg, fg, align: 'center' }, { tag: 'h1', html: `Theme: ${th.name}` })
  return dsample;
}
function showTitle(title, dParent = 'dTitle') {
  mClear(dParent);
  return mDom(dParent, { maleft: 20 }, { tag: 'h1', html: title, classes: 'title' });
}
function showTitleGame(me, table) {
  dTitle = mBy('dTitle');
  mClear(dTitle);
  mStyle(dTitle, { patop: 4, wrap: 'nowrap', box: true });
  let list = table.turn;
  let d0 = mDom(dTitle, flexSpaceBetween());
  let d1 = mDom(d0, { paleft: 12 }, { html: `Player${list.length > 1 ? 's' : ''}: `, id: 'dTitleLeft' });
  if (sameList(list, table.plorder)) {
    mDom(d0, { maleft: 4 }, { html: 'All' });
  } else {
    for (const plName of list) {
      let pl = table.players[plName];
      let src = `../assets/img/users/${M.users[plName].imgKey}.jpg`;
      let cimgborder = pl.color;
      let sz = 20;
      let img = mDom(d0, { border: `1px solid ${cimgborder}`, maleft: 4, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot' }, { tag: 'img', src });
    }
  }
  mDom(dTitle, {}, { id: 'dTitleMiddle' });
  html = fromNormalized(table.friendly) + ' (' + fromNormalized(M.config.games[table.game].friendly) + ')';
  mDom(dTitle, { paright: 10, box: true }, { html, id: 'dTitleRight' });
  let dtr = mBy('dTitleRight');
  dtr.onmouseenter = () => onhoverGamename(me, table);
  dtr.onmouseleave = () => mRemove('dGameOptions');
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
  let u = M.users[uname];
  let key = u.imgKey;
  let src = `../assets/img/users/${M.users[uname].imgKey}.jpg`;
  if (nundef(src)) { src = `../assets/img/users/unknown_user.jpg`; }
  let img = mDom(d, { h: sz, w: sz, round: true, border: `${u.color} 3px solid` }, { tag: 'img', src });
  return img;
}
function showUserNameInCorner(bg) {
  let username = U.name;
  let d = mBy('dMenuRight'); //41px button:33px
  mClear(d);
  let sz = 24; let h = sz + 6;
  let src = `../assets/img/users/${M.users[username].imgKey}.jpg`;
  if (nundef(bg)) bg = colorFrom(U.color);
  fg = colorIdealText(bg);
  let d1 = mDom(d, { bg, fg, display: 'flex', alignItems: 'center', gap: 10 }, { className: 'buttonstyle' }); // { bg, fg, display: 'flex', rounding: 2, alignItems: 'center', gap: 10, margin: 0, pah: 12 });
  let w = 2;
  let style = {
    round: true,
    w: sz,
    h: sz,
    outline: `${w}px solid ${bg}`,
    'outline-offset': `-1px`,
  };
  let img = mDom(d, style, { tag: 'img', src });
  let text = mDom(d1, { fg, bg }, { tag: 'button', html: capitalize(username) });
  mDom(d, { maright: 10 }, { tag: 'button', html: '...' });
  let flexStyle = { cursor: 'pointer', display: 'flex', 'flex-direction': 'row', alignItems: 'center', gap: 10, wrap: 'nowrap' };
  mStyle(d, flexStyle, { onclick: onclickMoreUsers });
}
function show_home_logo(d) {
  if (nundef(d)) { mClear('dAdminLeft'); d = mBy('dAdminLeft'); }
  let logo = mKey('castle', d, { cursor: 'pointer', fz: 24, box: true }); let bg = colorLight();
}
function show_player_button(caption, ui_item, handler) {
  let d = ui_item;
  console.log('show_player_button', caption, d);
  let styles = { hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black', maright: 4 };
  let b = mButton(caption, handler, d, styles, 'enabled');
  return b;
}
function showim2(imgKey, d, styles = {}, opts = {}) {
  let o = lookup(M.superdi, [imgKey]);
  let src;
  if (isFilename(imgKey)) src = imgKey;
  else if (isdef(o) && isdef(opts.prefer)) src = valf(o[opts.prefer], o.img);
  else if (isdef(o)) src = valf(o.img, o.photo)
  let [w, h] = mSizeSuccession(styles, 40);
  addKeys({ w, h }, styles);
  if (nundef(o) && nundef(src)) src = rChoose(M.allImages).path;
  if (isdef(src)) return mDom(d, styles, { tag: 'img', src });
  fz = .8 * h;
  let [family, html] = isdef(o.text) ? ['emoNoto', o.text] : isdef(o.fa) ? ['pictoFa', String.fromCharCode('0x' + o.fa)] : isdef(o.ga) ? ['pictoGame', String.fromCharCode('0x' + o.ga)] : isdef(o.fa6) ? ['fa6', String.fromCharCode('0x' + o.fa6)] : ['algerian', o.friendly];
  addKeys({ family, fz, hline: fz, display: 'inline' }, styles);
  let el = mDom(d, styles, { html }); mCenterCenterFlex(el);
  return el;
  if (isdef(o.text)) el = mDom(d, { fz: fz, hline: fz, family: 'emoNoto', fg: rColor(), display: 'inline' }, { html: o.text });
  else if (isdef(o.fa)) el = mDom(d, { fz: fz, hline: fz, family: 'pictoFa', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
  else if (isdef(o.ga)) el = mDom(d, { fz: fz, hline: fz, family: 'pictoGame', bg: 'beige', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
  else if (isdef(o.fa6)) el = mDom(d, { fz: fz, hline: fz, family: 'fa6', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
  return el;
}
function shuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
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
function simulateClick(elem) {
  var evt = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
  var canceled = !elem.dispatchEvent(evt);
}
function size2hex(w = 100, h = 0, x = 0, y = 0) {
  let hexPoints = [{ X: 0.5, Y: 0 }, { X: 1, Y: 0.25 }, { X: 1, Y: 0.75 }, { X: 0.5, Y: 1 }, { X: 0, Y: 0.75 }, { X: 0, Y: 0.25 }];
  if (h == 0) {
    h = (2 * w) / 1.73;
  }
  return polyPointsFrom(w, h, x, y, hexPoints);
}
function sortBy(arr, key) {
  function fsort(a, b) {
    let [av, bv] = [a[key], b[key]];
    if (isNumber(av) && isNumber(bv)) return Number(av) < Number(bv) ? -1 : 1;
    if (isEmpty(av)) return -1;
    if (isEmpty(bv)) return 1;
    return av < bv ? -1 : 1;
  }
  arr.sort(fsort);
  return arr;
}
function sortByDescending(arr, key) {
  function fsort(a, b) {
    let [av, bv] = [a[key], b[key]];
    if (isNumber(av) && isNumber(bv)) return Number(av) > Number(bv) ? -1 : 1;
    if (isEmpty(av)) return 1;
    if (isEmpty(bv)) return -1;
    return av > bv ? -1 : 1;
  }
  arr.sort(fsort);
  return arr;
}
function sortByFunc(arr, func) { arr.sort((a, b) => (func(a) < func(b) ? -1 : 1)); return arr; }
function sortByMultipleProperties(list) {
  let props = Array.from(arguments).slice(1);
  return list.sort((a, b) => {
    for (const p of props) {
      if (a[p] < b[p]) return -1;
      if (a[p] > b[p]) return 1;
    }
    return 0;
  });
}
function sortCardItemsByRank(items, rankstr = '23456789TJQKA') {
  let ranks = toLetters(rankstr);
  items.sort((a, b) => ranks.indexOf(a.key[0]) - ranks.indexOf(b.key[0]));
  return items;
}
function sortCheckboxes(grid) {
  let divs = arrChildren(grid);
  divs.map(x => x.remove());
  let chyes = divs.filter(x => x.firstChild.checked == true);
  let chno = divs.filter(x => !chyes.includes(x));
  chyes = sortByFunc(chyes, x => x.firstChild.name);
  chno = sortByFunc(chno, x => x.firstChild.name);
  for (const d of chyes) { mAppend(grid, d) }
  for (const d of chno) { mAppend(grid, d) }
}
function sortDictBy(dict, valueKey, ascending = true) {
  return Object.fromEntries(
    Object.entries(dict).sort(([, a], [, b]) => {
      const valA = a[valueKey] !== undefined ? a[valueKey] : '';
      const valB = b[valueKey] !== undefined ? b[valueKey] : '';
      if (valA < valB) return ascending ? -1 : 1;
      if (valA > valB) return ascending ? 1 : -1;
      return 0;
    })
  );
}
function sortDictionary(di) {
  let keys = Object.keys(di);
  keys.sort();
  let newdi = {};
  for (const k of keys) {
    newdi[k] = di[k];
  }
  return newdi;
}
function sort_cards(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
  if (bySuit && byRank) {
    let buckets = arrBuckets(hand, x => x[1], suits);
    for (const b of buckets) { sort_cards(b.list, false, null, true, rankstr); }
    hand.length = 0; buckets.map(x => x.list.map(y => hand.push(y)));
  } else if (bySuit) hand.sort((a, b) => suits.indexOf(a[1]) - suits.indexOf(b[1]));
  else if (byRank) hand.sort((a, b) => rankstr.indexOf(a[0]) - rankstr.indexOf(b[0]));
  return hand;
}
const splayDiagonal = (items, el, dir = 'down-right', opts = {}) =>
  splayItems(items, el, { ...opts, direction: dir });
const splayDown = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'down' });
const splayFan = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'fan' });
const splayLeft = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'left' });
const splayRight = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'right' });
const splayUp = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'up' });
function splitAtAnyOf(s, sep) {
  let arr = [], w = '';
  for (let i = 0; i < s.length; i++) {
    let ch = s[i];
    if (sep.includes(ch)) {
      if (!isEmpty(w)) arr.push(w);
      w = '';
    } else {
      w += ch;
    }
  }
  if (!isEmpty(w)) arr.push(w);
  return arr;
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
      let success = fen.shared.includes(movedata);
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
    avg = Math.round(Math.min(200 / Math.sqrt(n), 85));
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
      let els = fen.items[i].keys.slice(0, n);
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
  let [nth, rows, colarr] = layoutCircle(n);
  let index = 0;
  for (let i of range(rows)) {
    let margin = i == 0 || i == rows - 1 ? 22 : 4;
    if (rows <= 2) margin = 8;
    let dr = mDom(d0, {
      w: `${100 - 2 * margin}%`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center'
    });
    for (let j of range(colarr[i])) {
      let el = els[index++];
      let sz = szCard * el.scale / nth;
      let fontMultiplier = 0.8;
      if (j == colarr[i] - 1 && (i == rows - 1 || i == 0)) {
        fontMultiplier = 0.68;
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
        overflow: 'hidden',
        textOverflow: 'contain',
        rotate: `${rChoose([0, 10, 20, 30, 320, 350, 320])}deg`,
      };
      let sym = mKey(el.key, dr, symStyles);
      let dIcon = sym.firstChild || sym;
      if (dIcon && dIcon.style) {
        dIcon.style.maxWidth = '100%';
        dIcon.style.maxHeight = '100%';
      }
    }
  }
  return card;
}
function spotitSetup(n) {
  let keys = createKeys(n, 'special', 'best*');
  let arr = arrRepeat([.5, 1, .5, 1, .75], Math.ceil(n / 5)); arrShuffle(arr);
  let scales = keys.map((x, i) => arr[i]);
  let els = []; for (let i of range(n)) { els[i] = { key: keys[i], scale: scales[i % 4] }; }
  return els;
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
  return [infos, dupls];
}
function spotitSyms(els) {
  let index = 0;
  let n = els.length;
  let szBase = 50;
  let dr = mDom(null, { bg: 'blue' });
  let syms = [];
  for (let j of range(n)) {
    let el = els[index++];
    let sz = rChoose(n <= 10 ? [35, 50, 75, 100] : [50, 100]); //szBase * els.scale;
    let symStyles = {
      w: sz,
      h: sz,
      sz,
      fz: sz * .8,
      margin: '0 6px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      textOverflow: 'contain',
      rotate: `${rChoose([0, 10, 20, 30, 320, 350, 320])}deg`,
    };
    let sym = mKey(el.key, dr, symStyles);
    syms.push(sym);
  }
  return syms;
}
function spotit_activate() {
  let [stage, uplayer, host, plorder, fen] = [Z.stage, Z.uplayer, Z.host, Z.plorder, Z.fen];
  if (stage == 'move' && uplayer == host && get_player_score(host) >= 1) {
    let bots = plorder.filter(x => fen.players[x].playmode == 'bot');
    if (isEmpty(bots)) return;
    let bot = rChoose(bots);
    TO.main = setTimeout(() => spotit_move(bot, true), rNumber(2000, 9000));
  }
}
function spotit_card(info, dParent, cardStyles, onClickSym) {
  console.log(info, dParent, cardStyles, onClickSym)
  Card.sz = 300;
  copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);
  let card = cRound(dParent, cardStyles, info);
  addKeys(info, card);
  card.faceUp = true;
  let zipped = card.zipped;
  let sz = Card.sz / Math.sqrt(card.keys.length);
  let symStyles = { fg: 'random', hmargin: 10, vmargin: 6, cursor: 'pointer' };
  let syms = [];
  for (let i = 0; i < info.keys.length; i++) {
    let key = card.keys[i];
    let scale = rChoose([.25, .5, .75]);
    let styles = jsCopy(symStyles);
    styles.sz = sz * scale; styles.w = sz * scale; styles.h = sz * scale;
    let sym = mKey(key, iDiv(card), styles, {});
    card.live[key] = sym;
    sym.setAttribute('key', key);
    sym.onclick = ev => onClickSym(ev, key);
    syms.push(sym);
  }
  return card;
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
  if (!uiActivated) {console.log('ui NOT activated'); return; }
  let keyClicked = evToProp(ev, 'key');
  let id = evToId(ev);
  if (isdef(keyClicked) && isdef(Items[id])) {
    let item = Items[id];
    let dsym = ev.target;
    let card = Items[id];
    let [success, othercard] = spotit_find_shared(card, keyClicked);
    spotit_move(Z.uplayer, success);
  }
}
function spotit_item_fen(table) {
  let options = table.options;
  let num_cards = valf(options.num_cards, 2);
  let num_symbols = valf(options.num_symbols, 7);
  let vocab = valf(options.vocab, 'objects');
  let keypool = flattenDictValues(M.emogroup[vocab]);
  let min_scale = num_symbols < 10 ? .75 : num_symbols > 11 ? .5 : .6; //valf(options.min_scale, 0.75),
  let max_scale = num_symbols < 10 ? 1.5 : num_symbols > 11 ? 1.2 : 1; //valf(options.max_scale, 1.25),
  let nShared = (num_cards * (num_cards - 1)) / 2;
  let nUnique = num_symbols - num_cards + 1;
  let numKeysNeeded = nShared + num_cards * nUnique;
  if (keypool.length < numKeysNeeded) {
    console.warn(`Not enough symbols in M.objects (${keypool.length}) for the required ${numKeysNeeded} unique/shared keys.`);
  }
  let keys = rChoose(keypool, numKeysNeeded);
  let dupls = keys.slice(0, nShared);
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
  for (const info of infos) {
    info.scales = info.keys.map(x => rChoose(range(min_scale, max_scale, .2)));
  }
  for (const info of infos) {
    let zipped = [];
    for (let i = 0; i < info.keys.length; i++) {
      zipped.push({ key: info.keys[i], scale: info.scales[i] });
    }
    info.zipped = zipped;
  }
  return infos;
  assertion(false, '*THE END*')
  let item_fens = [];
  for (const item of items) {
    let arr = arrFlatten(item.pattern);
    let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
    item_fens.push(ifen);
  }
  let res = item_fens.join('===');
  return res;
}
function spotit_move(uplayer, success) {
  if (success) {
    inc_player_score(uplayer);
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
function spotit_state(dParent) {
  let user_html = get_user_pic_html(Z.uplayer, 30);
  let msg = Z.stage == 'init' ? `getting ready...` : `player: ${user_html}`;
  dParent.innerHTML = `Round ${Z.round}:&nbsp;${msg} `;
}
function spotit_stats(d) {
  let players = Z.fen.players;
  let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
  for (const plname of get_present_order()) {
    let pl = players[plname];
    let onturn = Z.turn.includes(plname);
    let sz = 50;
    let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
    let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
    let rounding = pl.playmode == 'bot' ? '0px' : '50%';
    let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);
  }
}
function spread_hand(path, ov) {
  let hand = lookup(UI, path.split('.'));
  assertion(hand, 'hand does NOT exist', path);
  if (hand.ctype != 'hand') return;
  if (isEmpty(hand.items)) return;
  let card = hand.items[0];
  if (nundef(ov)) ov = card.ov;
  if (hand.ov == ov) return;
  hand.ov = ov;
  let cont = hand.cardcontainer;
  let items = hand.items;
  mContainerSplay(cont, hand.splay, card.w, card.h, items.length, ov * card.w);
}
function squareTo(tool, sznew = 128) {
  let [img, dParent, cropBox, setRect] = [tool.img, tool.dParent, tool.cropBox, tool.setRect];
  let [x, y, w, h] = ['left', 'top', 'width', 'height'].map(x => parseInt(cropBox.style[x]));
  if (sznew == 0) sznew = h;
  let sz = Math.max(w, h)
  let [x1, y1] = [x - (sz - w) / 2, y - (sz - h) / 2];
  redrawImage(img, dParent, x1, y1, sz, sz, sznew, sznew, () => tool.setRect(0, 0, sznew, sznew))
}
function startLevel() {
  Speech.setLanguage(Settings.language);
  getGameValues(Username, G.id, G.level);
  G.instance.startLevel();
  if (G.keys.length < G.numPics) { updateKeySettings(G.numPics + 5); }
  startRound();
}
function startPulsing(idlist) {
  idlist.map(x => B.diPoints[x].div.classList.add('pulseFastInfinite'));
}
function startRound() {
  if (G.addonActive != true && isTimeForAddon()) {
    G.addonActive = true;
    exitToAddon(startRound); return;
  } else G.addonActive = false;
  resetRound();
  uiActivated = false;
  G.instance.startRound();
  TOMain = setTimeout(() => prompt(), 300);
}
function startsWith(s, sSub) {
  return s.substring(0, sSub.length) == sSub;
}
function staticArea(areaName, oSpec) {
  func = correctFuncName(oSpec.type);
  oSpec.ui = window[func](areaName, oSpec);
}
function staticTitle(table) {
  clearInterval(TO.titleInterval);
  let url = window.location.href;
  let loc = url.includes('moxito') ? '(fastComet)' : url.includes('telecave') ? '(telecave)' : '(local)';
  let game = isdef(table) ? lastWord(table.friendly) : '♠ Moxito ♠';
  document.title = `${loc} ${game}`;
}
function statsCount(key, n, dParent, styles = {}, opts = {}) {
  let sz = valf(styles.sz, 22);
  addKeys({ display: 'flex', margin: 4, dir: 'column', 'align-content': 'center', fz: sz, align: 'center' }, styles);
  let d = mDiv(dParent, styles);
  let o = M.superdi[key];
  if (typeof key == 'function') key(d, { w: '100%', fg: 'grey' });
  else if (isFilename(key)) {
    mKey(key, d, { w: '100%', fg: 'grey' }, opts);
  }
  else if (isColor(key)) mDom(d, { bg: key, fz: sz, w: '100%', fg: key }, { html: ' ' });
  else if (isdef(o)) {
    mKey(key, d, { fz: sz, h: sz, fg: 'grey' }, opts);
  }
  else mText(key, d, { fz: sz, w: '100%' });
  d.innerHTML += `<span ${isdef(opts.id) ? `id='${opts.id}'` : ''} style="font-weight:bold;color:inherit">${n}</span>`;
  return d;
}
function statsInit(me, table, extras = {}) {
  let players = table.players;
  let sz = isdef(extras.sz) ? extras.sz : 40;
  let styles = { margin: 10, rounding: 10, margin: 4, padding: 4, patop: 12, box: true }; //, 'border-style': 'solid', 'border-width': 6 }
  let showfirst = isdef(table.players[me]) ? me : table.plorder[0];
  let order = arrCycle(table.plorder, table.plorder.indexOf(showfirst));
  let d = mDom('dStats', { matop: 6, mabottom: 10 }, { className: extras.className || 'flexCC' });
  let usedPlayerColor = false;
  let bg, fg, cborder, cimgborder;
  for (const plName of order) {
    let pl = players[plName];
    let src = `../assets/img/users/${M.users[plName].imgKey}.jpg`;
    if (nundef(extras.bg)) { usedPlayerColor = true; bg = pl.color; fg = colorIdealText(pl.color); }
    else if (nundef(extras.fg)) { bg = extras.bg; fg = colorIdealText(extras.bg); }
    else { bg = extras.bg; fg = extras.fg; }
    if (usedPlayerColor) { cborder = extras.cborder || 'white'; cimgborder = extras.cimgborder || 'white'; }
    else { cborder = extras.cborder || pl.color; cimgborder = extras.cimgborder || pl.color; }
    copyKeys({ bg, fg, border: `${cborder == pl.color ? 2 : 1}px solid ${cborder}` }, styles);
    let d1 = mDom(d, styles, { id: 'dStat_' + plName });
    if (extras.allowUserSwitch || TESTING) {
      mStyle(d1, { cursor: 'pointer' });
      d1.onclick = async () => { await switchToUser(plName); }
    }
    let img = mDom(d1, { border: `${cimgborder == pl.color ? 2 : 1}px solid ${cimgborder}`, padding: 0, margin: 10, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot' }, { tag: 'img', src });
    mLinebreak(d1);
    if (table.turn.includes(plName) && !table.pending.includes(plName)) showHourglass(plName, d1, sz / 2, { left: -4, top: 4 });
  }
}
async function stdBotMoves(botMove, table) {
  let bots = table.turn.filter(name => table.players[name].playmode == 'bot');
  if (bots.length > 0) {
    let bot = rChoose(bots);
    let min = lookup(table.options, ['botmin']) ?? 5000;
    let max = Math.max(min + 1000, lookup(table.options, ['botmax']) ?? 5000);
    let ms = rChoose(range(min, max));
    let cd = table.players[bot].cdRel;
    if (isdef(cd)) ms += cd * 1000;
    if (isdef(TO.bot)) clearTimeout(TO.bot);
    TO.bot = setTimeout(async () => { if (!DA.isProcessingMove) await botMove(bot); }, ms);
  }
}
function stdEvalShield(d, bg = '#000000cc') {
  clearEvents();
  DA.isProcessingMove = true;
  mShield(isdef(d) ? d : 'dTable', { bg: 'transparent' });
}
function stdInstruction(me, table, text) {
  let myTurn = table.turn.includes(me) && !table.pending.includes(me);
  let spectating = !Object.keys(table.players).includes(me);
  let fen = table.fen;
  let dInst = mBy('dInstruction'); 
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
    html = `waiting for: ${getTurnPlayers(table)}`
  }
  dInst.innerHTML = html;
  mStyle(dInst, { w100: true, hmin: 50 }, { className: 'section' });
  return { myTurn, spectating };
}
function stdPresentBGATable(me, table, ms, className = 'wood') {
  setCssVar('--velvet-color', M.users[me].color);
  if (isdef(ms)) pollChangeInterval(ms);
  let dm = mDom('dMain', { hmin: 700, align: 'center', box: true }, { className });
  mDom(dm, flexSpaceBetween(), { id: 'dTitle' });
  mDom(dm, flexCenterCenter(), { id: 'dInstruction' });
  mDom(dm, flexCenterCenter(), { id: 'dStats' });
  mDom(dm, flexCenterCenter(), { id: 'dTable' });
  return mBy('dTable');
}
function stdPresentBGATableCols(me, table, ms, className = 'wood') {
  setCssVar('--velvet-color', M.users[me].color);
  if (isdef(ms)) pollChangeInterval(ms);
  let dm = mDom('dMain', { hmin: 700, box: true, padding: 0 }, { className });
  mDom(dm, flexSpaceBetween(), { id: 'dTitle' });
  let dg = mGrid('auto', '1fr auto', dm); 
  let dTable = mDom(dg, flexCenterCenter(), { id: 'dTable' });
  mDom(dg, { hmin: 1000 }, { id: 'dStats' });
  mDom(dTable, flexCenterCenter(), { id: 'dInstruction' });
  mDom(dTable, flexCenterCenter(), { id: 'dActions' });
  return dTable;
}
function stdRowsColsContainer(dParent, cols, styles = {}) {
  addKeys({
    margin: 'auto',
    padding: 10,
    gap: 10,
    display: 'grid',
    bg: 'green',
    'grid-template-columns': `repeat(${cols}, 1fr)`
  }, styles);
  return mDiv(dParent, styles);
}
function stdSetupGame(table, type = 'race') {
  let fen = table.fen = {};
  fen.movetype = type;
  stdSetupScore0(table);
  table.plorder = jsCopy(Object.keys(table.players));
  switch (type) {
    case 'wait':
    case 'race': table.turn = jsCopy(table.plorder); break;
    default: table.turn = [table.plorder[0]];
  }
}
function stdSetupScore0(table) {
  for (const name in table.players) {
    let pl = table.players[name];
    pl.score = 0;
  }
}
function stdStatsScore(me, table, extras = {}) {
  statsInit(me, table, extras);
  for (const plName in table.players) {
    let pl = table.players[plName];
    let d = mBy('dStat_' + plName);
    mDom(d, { fz: 22, margin: 4 }, { html: pl.score });
    let lp = lookup(table, ['action', 'plName']); 
    let t = getNow();
    if (lp == plName) mAnimate(d, 'outline', ['3px solid yellow', ''], null, 1500, 'ease-out', 0, 'both');
  }
}
function stopAutobot() {
  if (isdef(TO.SLEEPTIMEOUT)) clearTimeout(TO.SLEEPTIMEOUT);
  DA.stopAutobot = true;
}
function stopPulsing(idExcept = []) {
  let drem = document.querySelectorAll('.pulseFastInfinite');
  for (const d of drem) {
    if (idExcept.includes(d.id)) continue;
    d.classList.remove('pulseFastInfinite');
  }
}
function strRemoveTrailing(s, sub) {
  return s.endsWith(sub) ? stringBeforeLast(s, sub) : s;
}
function stringAfter(sFull, sSub) {
  let idx = sFull.indexOf(sSub);
  if (idx < 0) return '';
  return sFull.substring(idx + sSub.length);
}
function stringAfterLast(sFull, sSub) {
  let parts = sFull.split(sSub);
  return arrLast(parts);
}
function stringBefore(sFull, sSub) {
  let idx = sFull.indexOf(sSub);
  if (idx < 0) return sFull;
  return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
  let parts = sFull.split(sSub);
  return sFull.substring(0, sFull.length - arrLast(parts).length - 1);
}
function stringCSSToCamelCase(s) {
  let parts = s.split('-');
  let res = parts[0];
  for (let i = 1; i < parts.length; i++) { res += capitalize(parts[i]) }
  return res;
}
function stringCount(s, sSub, caseInsensitive = true) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    if (s.slice(i).startsWith(sSub)) n++;
  }
  return n;
  let m = new RegExp(sSub, 'g' + (caseInsensitive ? 'i' : ''));
  let s1 = s.match(m);
  return s1 ? s1.length : 0;
}
function stringSplit(input) {
  return input.split(/[\s,]+/);
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
async function switchToUser(uname) {
  pollOff();
  if (!isEmpty(uname)) uname = normalizeString(uname);
  if (isEmpty(uname)) uname = localStorage.getItem('username') || 'guest';
  if (nundef(M.users)) M.users = await loadStaticYaml('y/users.yaml');
  let userdata = M.users[uname];
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
  DA.selectedItems = {};
  showUserNameInCorner(U.color);
  localStorage.setItem('username', uname);
  updateUI(true);
}
function tableCreate(gamename, players, options, status) {
  if (nundef(gamename)) gamename = "dodogame";
  if (nundef(players)) players = { mimi: userToPlayer('mimi', gamename), felix: userToPlayer('felix', gamename), amanda: userToPlayer('amanda', gamename) };
  if (nundef(options)) options = M.config.games[gamename].options;
  let me = U.name;
  if (!(me in players)) players[me] = userToPlayer(me, gamename);
  let table = {
    fen: null,
    game: gamename,
    owner: me, //xplayerNames[0],
    friendly: generateTableName(Object.keys(players).length, []),
    players,
    options,
    status,
  };
  return table;
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
  return res.row;
  console.log('res', res)
  if (res.success && res.row) {
    T = res.row;
  } else if (res.row) {
    T = res.row;
    console.warn("Move rejected: Someone else moved first.");
  }
  updateUI();
  return res;
}
function takeFromTo(ad, from, to) {
  if (isDict(ad)) {
    let keys = Object.keys(ad);
    return keys.slice(from, to).map(x => (ad[x]));
  } else return ad.slice(from, to);
}
async function testg1() {
  await DAInit(); let d = mDom('dPage')
  let x = gSvg();
  let x1 = gShape();
  mAppend(x, x1);
  mAppend(d, x);
}
function timeConversion(duration, format = 'Hmsh') {
  const portions = [];
  const msInHour = 1000 * 60 * 60;
  const hours = Math.trunc(duration / msInHour);
  if (format.includes('H')) portions.push((hours < 10 ? '0' : '') + hours);
  duration = duration - (hours * msInHour);
  const msInMinute = 1000 * 60;
  const minutes = Math.trunc(duration / msInMinute);
  if (format.includes('m')) portions.push((minutes < 10 ? '0' : '') + minutes);// minutes + 'm');
  duration = duration - (minutes * msInMinute);
  const msInSecond = 1000;
  const seconds = Math.trunc(duration / 1000);
  if (format.includes('s')) portions.push((seconds < 10 ? '0' : '') + seconds);//seconds + 's');
  duration = duration - (seconds * msInSecond);
  const hundreds = duration / 10;
  if (format.includes('h')) portions.push((hundreds < 10 ? '0' : '') + hundreds);//hundreds);
  return portions.join(':');
}
function toElem(d) { return isString(d) ? mBy(d) : d; }
function toLetters(s) { return [...s]; }
function toNameValueList(any) {
  if (isEmpty(any)) return [];
  let list = [];
  if (isString(any)) {
    let words = toWords(any);
    for (const w of words) { list.push({ name: w, value: w }) };
  } else if (isDict(any)) {
    for (const k in any) { list.push({ name: k, value: any[k] }) };
  } else if (isList(any) && !isDict(any[0])) {
    for (const el of any) list.push({ name: el, value: el });
  } else if (isList(any) && isdef(any[0].name) && isdef(any[0].value)) {
    list = any;
  } else {
    let el = any[0];
    let keys = Object.keys(el);
    let nameKey = keys[0];
    let valueKey = keys[1];
    for (const x of any) {
      list.push({ name: x[nameKey], value: x[valueKey] });
    }
  }
  return list;
}
function toPercent(n, total) { return Math.round(n * 100 / total); }
function toWords(s, allow_ = false) {
  let arr = allow_ ? s.split(/[\W]+/) : s.split(/[\W|_]+/);
  return arr.filter(x => !isEmpty(x));
}
function to_commissioncard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
function to_luxurycard(ckey, sz = 100, color = 'gold', w) { return to_aristocard(ckey, sz, color); }
function to_rumorcard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
function toggleDevmode() {
  DEV = !DEV;
  clearTimeouts();
  clearEvents();
  staticTitle();
  mClear('dPage');
  initUI();
}
function toggleItemSelection(item, classSelected = 'framedPicture', selectedItems = null) {
  if (nundef(item)) return;
  let ui = iDiv(item);
  item.isSelected = nundef(item.isSelected) ? true : !item.isSelected;
  if (isdef(classSelected)) if (item.isSelected) mClass(ui, classSelected); else mRemoveClass(ui, classSelected);
  if (isdef(selectedItems)) {
    if (item.isSelected) {
      console.assert(!selectedItems.includes(item), 'UNSELECTED PIC IN PICLIST!!!!!!!!!!!!')
      selectedItems.push(item);
    } else {
      console.assert(selectedItems.includes(item), 'PIC NOT IN PICLIST BUT HAS BEEN SELECTED!!!!!!!!!!!!')
      removeInPlace(selectedItems, item);
    }
  }
}
function toggleItemSelectionState(item) {
  if (item.state === 'selectable') {
    showItemAsSelected(item);
  } else if (item.state === 'selected') {
    showItemAsUnselected(item);
    showItemAsSelectable(item);
  }
}
function toggleSelectionOfPicture(elem, selkey, selectedPics, className = 'framedPicture') {
  if (selectedPics.includes(selkey)) {
    removeInPlace(selectedPics, selkey); mUnselect(elem);
  } else {
    selectedPics.push(selkey); mSelect(elem);
  }
}
function toggleSelectionState(card) {
  mStyle(iDiv(card), { border: 'red' });
}
function toggle_face(item) { if (item.faceUp) face_down(item); else face_up(item); }
function transformColorName(s) {
  let res = replaceAll(s, ' ', '_');
  return res.toLowerCase();
}
function trim(str) {
  return str.replace(/^\s+|\s+$/gm, '');
}
function tryJSONParse(astext) {
  try {
    const data = JSON.parse(astext);
    return data;
  } catch {
    console.log('text', astext)
    return { message: 'ERROR', text: astext }
  }
}
async function tt0() {
  await DAInit();
  let d = mBy('djs');
  for (const i of range(1, 6))
    updateSymbolPath(`SJ${i}`, "M10 90 L50 10 L90 90 Z");
}
function turtle() {
  background(51);
  stroke(255);
  translate(width / 2, height);
  for (let i = 0; i < sentence.length; i++) {
    let x = sentence.charAt(i);
    if ('ABF'.includes(x)) { line(0, 0, 0, -len); translate(0, -len); }
    else if (x == '+') rotate(angle);
    else if (x == '-') rotate(-angle);
    else if (x == '[') push();
    else if (x == ']') pop();
  }
}
async function txtErgebnis() {
  let txt = await loadStaticText('ymox.txt');
  txt = extractLines(txt, ['=>']);
  console.log(txt);
}
async function uiTypeCalendar(dParent) {
  const [wcell, hcell, gap] = [120, 100, 10];
  let outerStyles = {
    rounding: 4, patop: 4, pabottom: 4, weight: 'bold', box: true,
    paleft: gap / 2, w: wcell, hmin: hcell,
    bg: 'black', fg: 'white', cursor: 'pointer'
  }
  let innerStyles = { box: true, padding: 0, align: 'center', bg: 'beige', rounding: 4 };
  innerStyles.w = wcell - 11.75;
  innerStyles.hmin = `calc( 100% - 23px )`;
  let fz = 12;
  let h = measureHeightOfTextStyle(dParent, { fz: fz }); 
  let eventStyles = { fz: fz, hmin: h, w: '100%' };
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var dParent = toElem(dParent);
  var container = mDom(dParent, {}, { id: 'dCalendar' });
  var currentDate = new Date();
  var today = new Date();
  let dTitle = mDom(container, { w: 890, vPadding: gap, fz: 26, family: 'sans-serif', display: 'flex', justify: 'space-between', className: 'title' });
  var dWeekdays = mGrid(1, 7, container, { gap: gap });
  var dDays = [];
  var info = {};
  for (const w of weekdays) { mDom(dWeekdays, { w: wcell, className: 'subtitle' }, { html: w }); };
  var dGrid = mGrid(6, 7, container, { gap: gap });
  var dDate = mDom(dTitle, { display: 'flex', gap: gap, className: 'title' }, { id: 'dDate', html: '' });
  var dButtons = mDom(dTitle, { display: 'flex', gap: gap });
  mButton('Prev',
    async () => {
      let m = currentDate.getMonth();
      let y = currentDate.getFullYear();
      if (m == 0) setDate(12, y - 1); else await setDate(m, y);
    },
    dButtons, { w: 70, margin: 0 }, 'input');
  mButton('Next',
    async () => {
      let m = currentDate.getMonth();
      let y = currentDate.getFullYear();
      if (m == 11) setDate(1, y + 1); else await setDate(m + 2, y);
    }, dButtons, { w: 70, margin: 0 }, 'input');
  var dMonth, dYear;
  function getDayDiv(dt) {
    if (dt.getMonth() != currentDate.getMonth() || dt.getFullYear() != currentDate.getFullYear()) return null;
    let i = dt.getDate() + info.dayOffset;
    if (i < 1 || i > info.numDays) return null;
    let ui = dDays[i];
    if (ui.style.opacity === 0) return null;
    return ui.children[0];
  }
  async function setDate(m, y) {
    currentDate.setMonth(m - 1);
    currentDate.setFullYear(y);
    mClear(dDate);
    dMonth = mDom(dDate, {}, { id: 'dMonth', html: `${currentDate.toLocaleDateString('en-us', { month: 'long' })}` });
    dYear = mDom(dDate, {}, { id: 'dYear', html: `${currentDate.getFullYear()}` });
    mClear(dGrid);
    dDays.length = 0;
    let c = getNavBg();
    let dayColors = mimali(c, m).map(x => colorFrom(x))
    for (const i of range(42)) {
      let cell = mDom(dGrid, outerStyles);
      mStyle(cell, { bg: dayColors[i], fg: 'contrast' })
      dDays[i] = cell;
    }
    populate(currentDate);
    await refreshEvents();
    return { container, date: currentDate, dDate, dGrid, dMonth, dYear, setDate, populate };
  }
  function populate() {
    let dt = currentDate;
    const day = info.day = dt.getDate();
    const month = info.month = dt.getMonth();
    const year = info.year = dt.getFullYear();
    const firstDayOfMonth = info.firstDay = new Date(year, month, 1);
    const daysInMonth = info.numDays = new Date(year, month + 1, 0).getDate();
    const dateString = info.dayString = firstDayOfMonth.toLocaleDateString('en-us', {
      weekday: 'long',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const paddingDays = weekdays.indexOf(dateString.split(', ')[0]);
    info.dayOffset = paddingDays - 1;
    for (const i of range(42)) {
      if (i < paddingDays || i >= paddingDays + daysInMonth) { mStyle(dDays[i], { opacity: 0 }); }
    }
    for (let i = paddingDays + 1; i <= paddingDays + daysInMonth; i++) {
      const daySquare = dDays[i - 1];
      let date = new Date(year, month, i - paddingDays);
      daySquare.innerText = i - paddingDays + (isSameDate(date, today) ? ' TODAY' : '');
      let d = mDom(daySquare, innerStyles, { id: date.getTime() });
      daySquare.onclick = ev => { evNoBubble(ev); onclickDay(d, eventStyles); }
    }
  }
  async function refreshEvents() {
    let events = await getEvents();
    for (const k in events) {
      let o = events[k];
      let dt = new Date(Number(o.day));
      let dDay = getDayDiv(dt);
      if (!dDay) continue;
      uiTypeEvent(dDay, o, eventStyles);
    }
    mDummyFocus();
  }
  await setDate(currentDate.getMonth() + 1, currentDate.getFullYear());
  return { container, date: currentDate, dDate, dGrid, dMonth, dYear, info, getDayDiv, refreshEvents, setDate, populate }
}
function uiTypeCard52(ckey, h = 100, bg = 'transparent', border = 'black', borderthickness = 1, shadow = true, bgFace = 'white') {
  const CARD_RATIO = 240 / 336;
  const w = Math.round(h * CARD_RATIO);
  let html = M.c52['card_' + ckey.slice(0, 2)];
  if (!shadow) {
    html = html.replace(/(<svg\b[^>]*?)\s+class="[^"]*"/, '$1');
  }
  const div = mDom(null, {
    h, w,
    bg,
    rounding: Math.round(w / 20), // matches SVG rx="12" in viewBox width 240: 12/240*w = w/20
    overflow: 'hidden'                 // clips any stroke bleed at the corners
  }, { html });
  const rect = _cardOuterRect(div);
  if (rect) {
    rect.setAttribute('fill', bgFace);
    rect.setAttribute('stroke', border);
    rect.setAttribute('stroke-width', String(borderthickness));
  }
  const svgUp = div.innerHTML;
  return { key: ckey, w, h, svgUp, faceUp: true, div, bg, border, borderthickness, shadow, bgFace };
}
function uiTypeCheckList(any, dParent, styles = {}, opts = {}) {
  let lst = toNameValueList(any); lst.map(x => { if (x.value !== true) x.value = false; });
  addKeys({ overy: 'auto' }, styles)
  let d = mDom(dParent, styles, opts);
  lst.forEach((o, index) => {
    let [text, value] = [o.name, o.value];
    let dcheck = mDom(d, {}, { tag: 'input', type: 'checkbox', name: text, value: text, id: `ch_${index}`, checked: value });
    let dlabel = mDom(d, {}, { tag: 'label', for: dcheck.id, html: text });
    mNewline(d, 0);
  });
  return d;
}
function uiTypeCheckListInput(any, dParent, styles = {}, opts = {}) {
  let dg = mDom(dParent);
  let list = toNameValueList(any); list.map(x => { if (x.value != true) x.value = false; });
  let items = [];
  for (const o of list) {
    let div = mCheckbox(dg, o.name, o.value);
    items.push({ nam: o.name, div, w: mGetStyle(div, 'w'), h: mGetStyle(div, 'h') });
  }
  let wmax = arrMax(items, 'w'); 
  let cols = 4;
  let wgrid = wmax * cols + 100;
  dg.remove();
  dg = mDom(dParent);
  let inp = mDom(dg, { w100: true, box: true, mabottom: 10 }, { className: 'input', tag: 'input', type: 'text' });
  let db = mDom(dg, { w100: true, box: true, align: 'right', mabottom: 4 });
  mButton('cancel', () => opts.handler(null), db, {}, 'input');
  mButton('clear', ev => { onclickClear(inp, grid) }, db, { maleft: 10 }, 'input');
  mButton('done', () => opts.handler(extractWords(inp.value, ' ')), db, { maleft: 10 }, 'input');
  mStyle(dg, { w: wgrid, box: true, padding: 10 }); 
  console.log('...hmax', styles.hmax)
  let hmax = valf(styles.hmax, 450);
  let grid = mGrid(null, cols, dg, { w100: true, gap: 10, matop: 4, hmax: hmax - 150 }); 
  sortCheckboxes(grid);
  let chks = Array.from(dg.querySelectorAll('input[type="checkbox"]'));
  for (const chk of chks) {
    chk.addEventListener('click', ev => checkToInput(ev, inp, grid))
  }
  inp.value = list.filter(x => x.value).map(x => x.name).join(', ');
  inp.addEventListener('keypress', ev => inpToChecklist(ev, grid));
  return { dg, inp, grid };
}
function uiTypeDeck(cards, dParent, face = 'down', splay = 0.002, nTop = 2) {
  const n = cards.length;
  visualCount = Math.max(2, Math.min(n, Math.ceil(n / 15)));
  visualCount = Math.max(nTop + 1, visualCount);
  let part = cards.slice(-visualCount);
  mCenterFlex(dParent);
  let dcont = mDom(dParent, { matop: 10, position: 'relative' });
  let o = splayItems(part, dcont, { interactive: 'none', direction: 'down-right', overlap: 1 - splay, animate: false }); //'down-right'
  let dg = o.container;
  let topCard = cards[n - 1];
  if (face == 'down') part.map(x => face_down(x));
  let bottomCard = part[0];
  if (n > 0) addBadge(dg, n)
  return {
    topCard,
    bottomCard,
    dg,
  }
}
function uiTypeEvent(dParent, o, styles = {}) {
  Items[o.id] = o;
  let id = o.id;
  let ui = mDom(dParent, styles, { id: id }); //, className:'no_events'}); //onclick:ev=>evNoBubble(ev) }); 
  mStyle(ui, { overflow: 'hidden', display: 'flex', gap: 2, padding: 2, 'align-items': 'center' }); //,'justify-items':'center'})
  let [wtotal, wbutton, h] = [mGetStyle(dParent, 'w'), 17, styles.hmin];
  let fz = 15;
  let stInput = { overflow: 'hidden', hline: fz * 4 / 5, fz: fz, h: h, border: 'solid 1px silver', box: true, margin: 0, padding: 0 };
  let inp = mDom(ui, stInput, { html: o.text, tag: 'input', className: 'no_outline', onclick: ev => { evNoBubble(ev) } }); //;selectText(ev.target);}});
  inp.value = getEventValue(o);
  inp.addEventListener('keyup', ev => { if (ev.key == 'Enter') { mDummyFocus(); onEventEdited(id, inp.value); } });
  fz = 14;
  let stButton = { overflow: 'hidden', hline: fz * 4 / 5, fz: fz, box: true, fg: 'silver', bg: 'white', family: 'pictoFa', display: 'flex' };
  let b = mDom(ui, stButton, { html: String.fromCharCode('0x' + M.superdi.pen_square.fa) });
  ui.onclick = ev => { evNoBubble(ev); onclickExistingEvent(ev); }
  mStyle(inp, { w: wtotal - wbutton });
  return { ui: ui, inp: inp, id: id };
}
async function uiTypePalette(dParent, color, fg, src, blendMode) {
  let fill = color;
  let bgBlend = getBlendModeForCanvas(blendMode);
  d = mDom(dParent, { flex: 1, box: true }); //,{html:'hallo'});
  let palette = [color];
  let w = 500;
  let dContainer = mDom(d, { position: 'relative', margin: 'auto', w, padding: 0, box: true }, { id: 'canvasContainer' });
  let ca = null;
  if (isdef(src)) {
    ca = await getCanvasCtx(dContainer, { w, fill, bgBlend }, { src, id: 'canvas1' });
    palette = await getPaletteFromCanvas(ca.cv);
    palette.unshift(fill);
  } else {
    palette = arrCycle(paletteShades(color), 4);
  }
  let dText = mDom(dContainer, { fz: 24, weight: 'bold' }, { className: 'overlaid', html: 'HALLO', id: 'divOnCanvas' });
  if (nundef(fg)) fg = colorIdealText(color);
  mStyle(dText, { fg });
  let hue = colorGetHue(palette[0]);
  let dpals = mDom(d, { display: 'flex', gap: 20 })
  let dbg = mDom(dpals, { fg }, { html: 'background' });
  let dfg = mDom(dpals, { fg }, { html: 'foreground' });
  showColorPalette(dbg, palette, hue, onclickBackgroundColor);
  showColorPalette(dfg, palette, hue, onclickForegroundColor)
}
function uiTypePlayerStats(table, me, dParent, layout, styles = {}) {
  let dOuter = mDom(dParent, { margin: 10 }); dOuter.setAttribute('inert', true); 
  if (layout == 'rowflex') mStyle(dOuter, { display: 'flex', justify: 'center' });
  else if (layout == 'col') mStyle(dOuter, { display: 'flex', dir: 'column' });
  addKeys({ hmin: 120, rounding: 10, bg: '#00000050', margin: 8, box: true, 'border-style': 'solid', 'border-width': 7 }, styles);
  let show_first = me;
  let order = arrCycle(table.plorder, table.plorder.indexOf(show_first));
  let items = {};
  addKeys(flexCenterTop(), styles);
  for (const name of order) {
    let pl = table.players[name];
    let chex = colorFrom(pl.color);
    let [h, s, l] = colorHexToHsl01Array(chex);
    l = clamp(l, 0.35, 0.65);
    let cFinal = colorFromHsl(h, s, l);
    styles['border-color'] = cFinal; 
    styles.outline = `solid 1px #ffffff40`;
    let d = mDom(dOuter, styles, { id: name2id(name) }); 
    let img = showUserImage(name, d, 40); mStyle(img, { box: true });
    mLinebreak(d);
    mDom(d, { padding: 0, margin: 0, fz: 14, display: 'flex', 'flex-direction': 'column', align: 'center' }, { html: name });
    items[name] = { div: d, img, name };
  }
  return items;
}
function uiTypeSelect(any, dParent, styles = {}, opts = {}) {
  let list = toNameValueList(any);
  addKeys({ tag: 'select' }, opts);
  let d0 = mDom(dParent, styles, opts);
  let dselect = mDom(d0, {}, { tag: 'select' });
  for (const el of list) { mDom(dselect, {}, { tag: 'option', html: el.name, value: el.value }); }
  dselect.value = '';
  return [d0, dselect];
}
function uiTypeStar(cards, dParent, face = 'up') {
  const n = cards.length;
  let dg = mDom(dParent, { h: 130, wmin: 120, display: 'inline-grid', placeItems: 'center', position: 'relative' });
  let inc = 180 / n;
  let rotation = inc;
  for (const card of cards) {
    remove_card_shadow(card);
    const angle = rotation;
    mAppend(dg, card.div);
    mStyle(card.div, {
      position: 'absolute',
      left: 25,
      top: 20,
      transform: `rotate(${angle}deg)`, // translateY(-50px)
      transformOrigin: 'center' // Rotates around the card's center
    });
    rotation += inc;
    if (face === 'down') {
      face_down(card);
    } else {
      face_up(card);
    }
  }
  return {
    dg,
    cards,
    topCard: cards[n - 1]
  };
}
function ui_add_cards_to_hand_container(cont, items, list) {
  if (nundef(list)) list = items.map(x => x.key);
  for (const item of items) {
    mAppend(cont, iDiv(item));
    mItemSplay(item, list, 2, Card.ovw);
  }
}
function ui_add_container_title(title, cont, items, show_if_empty) {
  if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
    mDom(cont, { w100: true, align: 'center', maleft: -2, matop: 2 }, { html: title });
  }
}
function ui_get_all_commission_items(uplayer, table, ui) {
  let items = [], i = 0;
  let comm = ui.players[uplayer].commissions;
  for (const o of comm.items) {
    let item = { itemtype: 'card', o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
    i++;
    items.push(item);
  }
  return items;
}
function ui_get_exchange_items(uplayer) {
  let ihand = ui_get_hand_items(uplayer);
  let istall = ui_get_stall_items(uplayer);
  let irepair = ui_get_all_hidden_building_items(uplayer);
  irepair.map(x => face_up(x.o));
  let items = ihand.concat(istall).concat(irepair);
  reindex_items(items);
  return items;
}
function ui_get_farms_estates_items(uplayer) { return ui_get_building_items_of_type(uplayer, ['farm', 'estate']); }
function ui_get_hand_and_journey_items(uplayer) {
  let items = ui_get_hand_items(uplayer);
  let matching = [];
  for (const plName of Z.plorder) {
    let jitems = ui_get_journey_items(plName);
    for (const j of jitems) {
      for (const card of items) {
        if (matches_on_either_end(card, j)) { matching.push(j); break; }
      }
    }
  }
  items = items.concat(matching);
  reindex_items(items);
  return items;
}
function ui_get_hand_and_stall_items(uplayer) {
  let items = ui_get_hand_items(uplayer);
  items = items.concat(ui_get_stall_items(uplayer));
  reindex_items(items);
  return items;
}
function ui_get_hand_items(uplayer) {
  let items = [], i = 0;
  let hand = UI.players[uplayer].hand;
  for (const o of hand.items) {
    o.index = i;
    let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: hand.path, index: i };
    i++;
    items.push(item);
  }
  return items;
}
function ui_get_harvest_items(uplayer) {
  let items = []; let i = 0;
  for (const gb of UI.players[uplayer].buildinglist) {
    if (isdef(gb.harvest)) {
      let d = gb.harvest;
      mStyle(d, { cursor: 'pointer', opacity: 1 });
      gb.div = d;
      let name = 'H' + i + ':' + (gb.list[0][0] == 'T' ? '10' : gb.list[0][0]);
      let item = { o: gb, a: name, key: name, friendly: name, path: gb.path, index: i };
      i++;
      items.push(item);
    }
  }
  return items;
}
function ui_get_journey_items(plName) {
  let gblist = UI.players[plName].journeys;
  let items = [], i = 0;
  for (const o of gblist) {
    let name = `${plName}_j${i}`;
    o.div = o.container;
    let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
    i++;
    items.push(item);
  }
  return items;
}
function ui_get_market_items() {
  let items = [], i = 0;
  for (const o of UI.market.items) {
    o.index = i;
    let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `market`, index: i };
    i++;
    items.push(item);
  }
  return items;
}
function ui_get_open_discard_items() {
  let items = [], i = 0;
  for (const o of UI.open_discard.items) {
    let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `open_discard`, index: i };
    i++;
    items.push(item);
  }
  return items;
}
function ui_make_container(dParent, styles = { bg: 'random', padding: 10 }) {
  let id = getUID('u');
  let d = mDiv(dParent, styles, id);
  return d;
}
function uid() {
  UID += 1;
  return 'a' + UID;
}
function unicodeToEntity(char) {
  console.log('unicodeToEntity input:', char);
  return "&#" + char.codePointAt(0) + ";";
}
function unlock() {
  DA.LengthyProcessRunning = false;
  console.log('UNLOCK!!!!!!!!!!!!!!!!!!!!!!');
}
function unlockLengthyProcess() {
  try {
    if (DA.Interrupt === true && DA.LengthyProcessRunning === true) {
      DA.LengthyProcessRunning = false;
      console.log('INTERRUPT!!!!!!!!!!!!!!!!!!!!!!');
      throw 1;
    }
  }
  catch (err) { }
}
function unselectPlayerItem(item) {
  mStyle(iDiv(item), { bg: 'transparent', fg: 'black', border: `transparent`, outline: `1px solid transparent` });
}
function updateCardValue(svgStr, newLabel, index = 0) {
  const symbolIdMatches = [...svgStr.matchAll(/<symbol id='([^']+)'/g)];
  const symbolIds = symbolIdMatches.map(match => match[1]);
  console.log('symbolIds', symbolIds); //return;
  const valueSymbolId = symbolIds[index];
  if (!valueSymbolId) return svgStr;
  const updatedSvg = svgStr.replace(
    new RegExp(`<symbol id='${valueSymbolId}'[^>]*>[\\s\\S]*?<\\/symbol>`),
    `<symbol id='${valueSymbolId}' viewBox='-500 -500 1000 1000' preserveAspectRatio='xMinYMid'>
       <text x='-200' y='300' font-size='800' font-family='serif' fill='red'>${newLabel}</text>
     </symbol>`
  );
  return updatedSvg;
}
async function updateClientData() {
}
async function updateData() {
  switch (DA.menu) {
    case 'games': return await reloadTables();
    case 'table': return await reloadTable();
    default: return false;
  }
}
async function updateExtra() {
  console.log('updateExtra!!!!!!!!!!!!!!!!!!!!');
  mClear('dExtra');
  let d = mDom('dExtra');
  mStyle(d, { display: 'flex', justify: 'space-between' });
  let [left, right] = [mDom(d, {}, { id: 'dExtraLeft' }), mDom(d, {}, { id: 'dExtraRight' })];
  if (TESTING) await updateTestButtonsLogin();
}
function updateKeySettings(nMin) {
  if (nundef(G)) return;
  G.keys = setKeys({ nMin, lang: Settings.language, keysets: KeySets, key: Settings.vocab });
}
async function updateMain(forceUI = false, table = null) {
  let hasChanges = await updateData();
  if (!hasChanges && !forceUI) { return false; }
  await updateUI();
  return true;
}
async function updateState() {
  clearTimeout(TO.system); TO.system = null;
  await mSleep(100);
  showState();
  TO.system = setTimeout(updateState, 1000);
}
function updateSymbolPath(symbolId, newPathData) {
  const path = document.querySelector(`#${symbolId} path`);
  path.setAttribute("d", newPathData);
}
async function updateTestButtonsLogin(names) {
  if (nundef(names)) names = ['amanda', 'felix', 'lauren', 'mimi', 'gul'];
  let d = mBy('dExtraRight'); mClear(d);
  let me = getUname();
  for (const name of names) {
    let idname = getButtonCaptionName(name);
    let b = UI[idname] = mButton(name, async () => await switchToUser(name), d, { maleft: 4, hpadding: 3, wmin: 50, className: 'button' });
    if (me == name) mStyle(b, { bg: 'red', fg: 'white' });
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
function updateUserImageToBotHuman(playername, value) {
  function doit(checked, name, val) {
    let du = mByAttr('username', playername);
    let img = du.getElementsByTagName('img')[0];
    if (checked == true) if (val == 'human') mStyle(img, { round: true }); else mStyle(img, { rounding: 2 });
  }
  if (isdef(value)) doit(true, 0, value); else return doit;
}
async function updateUserTheme() {
  M.users[U.name] = jsCopy(U);
  await postUsers();
  await switchToUser(U.name);
}
function userToPlayer(name, gamename, playmode = 'human') {
  let user = M.users[name];
  let pl = jsCopyExceptKeys(user, ['games']);
  let options = valf(lookup(M.users, [name, 'games', gamename]), {});
  addKeys(options, pl);
  pl.playmode = playmode || 'human';
  let poss = M.config.games[gamename].ploptions;
  for (const p in poss) {
    if (isdef(pl[p])) continue;
    let val = poss[p];
    let defval = arrLast(val.split(','));
    if (isNumber(defval)) defval = Number(defval);
    pl[p] = defval;
  }
  return pl;
}
function valf() {
  for (const arg of arguments) if (isdef(arg)) return arg;
  return null;
}
function valnwhite() {
  for (const arg of arguments) {
    if (nundef(arg) || isEmpty(arg) || isWhiteSpace(arg)) {
      continue;
    }
    return arg;
  }
  return null;
}
async function wheelItems(items, container, {
  sweep = 360,
  startAngle = 0,
  inclusive = false,
  padding = 8,
  interactive = 'none', // 'top', 'bottom', 'all', 'none'
  hoverRaise = 12,
  selectionColor = 'red',
  selectionWidth = 3,
  animate = false,
  durationMs = 300,
} = {}) {
  if (!items.length) return { width: 0, height: 0 };
  const norm = items.map(_normalizeItem);
  const n = norm.length;
  const step = inclusive && n > 1 ? sweep / (n - 1) : sweep / n;
  const maxDiag = Math.ceil(Math.max(...norm.map(({ w, h }) => Math.hypot(w, h))));
  const totalSize = maxDiag + 2 * padding;
  const centre = totalSize / 2;
  container.style.position = 'relative';
  container.style.width = `${totalSize}px`;
  container.style.height = `${totalSize}px`;
  const tr = animate ? `transform ${durationMs}ms ease` : 'none';
  norm.forEach(({ el, w, h, original }, i) => {
    const rotation = startAngle + i * step;
    if (el.parentElement !== container) container.appendChild(el);
    el.dataset.splayRotation = String(rotation);
    el.dataset.splayZIndex = String(i + 1);
    if (original && !(original instanceof HTMLElement)) original.splayRotation = rotation;
    el.style.position = 'absolute';
    el.style.zIndex = String(i + 1);
    el.style.left = `${Math.round(centre - w / 2)}px`;
    el.style.top = `${Math.round(centre - h / 2)}px`;
    el.style.transition = tr;
    el.style.transform = `rotate(${rotation.toFixed(2)}deg)`;
    if (interactive == 'all' || interactive == 'top' && i == n - 1 || interactive == 'bottom' && i == 0) {
      _bindInteractions(el, { hoverRaise, selectionColor, selectionWidth });
    }
  });
  if (animate) await new Promise(r => setTimeout(r, durationMs));
  return {
    dg: container,
    cards: items,
    topCard: items[n - 1],
    width: totalSize,
    height: totalSize
  };
}
function where(o) {
  let fname = getFunctionsNameThatCalledThisFunction();
}
function without(arr, elementToRemove) {
  return arr.filter(function (el) {
    return el !== elementToRemove;
  });
}
function wordAfter(arr, w) {
  if (isString(arr)) arr = toWords(arr);
  let i = arr.indexOf(w);
  return i >= 0 && arr.length > i ? arr[i + 1] : null;
}
function wrapFunc(func, args = [], prop = true, clearev = true) {
  if (!isList(args)) args = [args];
  if (prop && clearev) return async ev => { ev.stopPropagation(); clearEvents(); func(...args); }
  else if (prop) return async ev => { ev.stopPropagation(); func(...args); }
  else if (clearev) return async ev => { clearEvents(); func(...args); }
  else return func(...args);
}
function wsCard(d, w, h) {
  let card = cBlank(d, { h, w, border: 'silver' }); //return;
  let dCard = iDiv(card);
  return [card, dCard];
}
function wsFenFromItem(item) {
  return `${item.key}@${item.valueFactor}@${normalizeString(item.power, '_', [':', '.'])}@${item.colorPower}@${item.abstract}@${item.colorSym}@${item.op}`;
}
function wsFood(tokens, op, dtop, sz) {
  let d = mDom(dtop); mCenterCenterFlex(d);
  let ch = op;
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    let d1 = wsPrintSymbol(d, sz, t);
    if (i < tokens.length - 1) mDom(d, { fz: sz * .7, weight: 'bold' }, { html: ch });
  }
}
function wsGenerateCardInfo(key) {
  let bg = rChoose(['white', 'sienna', 'pink', 'lightblue']);
  let palette = wsGetColorRainbow();
  let fg = rChoose(palette);
  sym = getAbstractSymbol([2, 8, 10, 23, 26]);
  power = wsGetPower(bg);
  valueFactor = rChoose(range(1, 3));
  op = rChoose(['+', '/']); 
  return wsFenFromItem({ key, valueFactor, power, colorPower: bg, abstract: sym, colorSym: fg, op });
}
function wsGetChildInline(item, color) {
  let type = item.class;
  let key = type == 'mammal' ? 'paw' : 'big_egg';
  let o = M.superdi[key];
  let [fam, sym] = isdef(o.fa6) ? ['fa6', 'fa6'] : isdef(o.fa) ? ['pictoFa', 'fa'] : ['pictoGame', 'ga'];
  let fg = valf(color, colorIdealText(item.colorPower, true));
  return `<span style="color:${fg};vertical-align:middle;line-height:80%;font-size:${item.fz * 1.5}px;font-family:${fam}">${String.fromCharCode('0x' + M.superdi[key][sym])}</span>`;
}
function wsGetColorRainbow() { return ['gold', 'limegreen', 'orangered', 'dodgerblue', 'indigo', 'hotpink']; }
function wsGetColorRainbowText(color) { return { gold: 'gold', limegreen: 'green', orangered: 'red', hotpink: 'pink', indigo: 'violet', dodgerblue: 'blue' }[color]; }
function wsGetFoodlist() { return ['cherries', 'fish', 'grain', 'mouse', 'seedling', 'worm'] }
function wsGetPower(colorOrKey, prop) {
  let powers = {
    _child_1_sym: [],
    _child_2_sym: [],
    _child_1_class: [],
    _child_2_class: [],
    _child_1_color: [],
    _child_2_color: [],
    _draw_1_card_deck: [],
    _draw_2_card_return_1: [],
    _draw_2_card_1: [],
    _tuck_1_pick_feeder: [],
    _tuck_1_pick_supply: [],
    _tuck_1_draw_tray: [],
    _tuck_1_draw_deck: [],
    _tuck_1_place: [],
    _food_1_supply: [],
    _food_1_feeder: [],
    _food_2_supply: [],
    _food_2_tray: [],
    _discard_1_child_pick_2_food_feeder: [],
    _discard_1_child_pick_1_food_supply: [],
    _discard_1_child_draw_2_card: [],
    _discard_1_food_draw_1_card: [],
    _discard_1_card_pick_1_food_supply: [],
    _repeat: [],
    _hunt_food_mouse: [],
    _hunt_food_fish: [],
    _hunt_card_sym: [],
    pink_draw_mission_pick_1_food_feeder: [],
    pink_place_child_pick_1_food_feeder: [],
    pink_hunt_successfully_pick_1_food_feeder: [],
    pink_draw_mission_draw_1_card_deck: [],
    pink_place_child_draw_1_card_deck: [],
    pink_hunt_successfully_draw_1_card_deck: [],
    white_draw_2_mission_return_1: [],
    white_collect_fish: [],
    white_collect_mouse: [],
    white_collect_worm: [],
    white_collect_cherries: [],
    white_child_sym: [],
    white_child_color: [],
    white_child_class: [],
    lightblue_feeder: [],
    lightblue_tray: [],
  };
  let list = Object.keys(powers);
  if (isColor(colorOrKey)) return rChoose(list.filter(x => colorOrKey == 'sienna' ? x.startsWith('_') : x.startsWith(colorOrKey)));
  else if (nundef(colorOrKey)) return rChoose(list);
  else if (nundef(prop)) return powers[colorOrKey];
  else return lookup(powers, [colorOrKey, prop]);
}
function wsGetRandomCards(n = 1, deck = null) {
  if (!deck) deck = jsCopy(M.byCollection.tierspiel).map(x => wsGenerateCardInfo(x));console.log(deck.length);
  let list = rChoose(deck, n);
  return list.length == 1 ? wsItemFromFen(list[0]) : list.map(x => wsItemFromFen(x));
}
function wsGetSymbolFilename(key) {
  let files = {
    cherries: '../assets/games/wingspan/fruit.svg',
    fish: '../assets/games/wingspan/fish.svg',
    forest: '../assets/games/wingspan/forest1.png',
    grain: '../assets/games/wingspan/wheat.svg',
    grassland: '../assets/games/wingspan/grassland2.png',
    mouse: '../assets/games/wingspan/mouse.svg',
    omni: '../assets/games/wingspan/pie3.svg',
    seedling: '../assets/img/emo/seedling.png',
    wetland: '../assets/games/wingspan/wetland.png',
    worm: '../assets/games/wingspan/worm.svg',
  };
  return files[key];
}
function wsGetSymbolInline(key, fz) { return `&nbsp;<span style="vertical-align:middle;line-height:80%;font-size:${fz * 1.5}px;font-family:pictoGame">${String.fromCharCode('0x' + M.superdi[key].ga)}</span>`; }
function wsHabitat(tokens, dtop, sz) {
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    if (i == 2) mLinebreak(dtop);
    let d = wsPrintSymbol(dtop, sz, t);
    if (i == 2) mStyle(d, { matop: -sz * 3 / 2 });
  }
}
function wsItemFromFen(fen) {
  let [key, valueFactor, power, colorPower, sym, colorSym, op] = fen.split('@');
  let o = getDetailedSuperdi(key);
  let item = jsCopy(o);
  let bg = item.colorPower = colorPower;
  let palette = wsGetColorRainbow();
  let fg = item.colorSym = colorSym;
  sym = item.abstract = sym;
  item.power = power;
  valueFactor = item.valueFactor = valueFactor;
  item.op = op;
  item.value = valueFactor * (item.op == '+' ? 1 : item.foodTokens.length);
  return item;
}
function wsOffspringSymbol(dParent, styles = {}) {
  console.log(styles)
  let [w, h] = [styles.h, styles.h];
  console.log(w, h)
  let d = mDom(dParent, { w, h, box: true });
  let fz = styles.h; let hline = fz;
  mIfNotRelative(d);
  let o = M.superdi.big_egg;
  let [fam, sym] = isdef(o.fa6) ? ['fa6', 'fa6'] : isdef(o.fa) ? ['pictoFa', 'fa'] : ['pictoGame', 'ga'];
  let dEgg = mDom(d, { fg: 'grey', family: fam, fz, padding: 0, hline }, { html: String.fromCharCode('0x' + o[sym]) });
  o = M.superdi.paw;
  [fam, sym] = isdef(o.fa6) ? ['fa6', 'fa6'] : isdef(o.fa) ? ['pictoFa', 'fa'] : ['pictoGame', 'ga'];
  let dPaw = mDom(d, { w100: true, fg: 'black', family: fam, fz: 8, hline }, { html: String.fromCharCode('0x' + o[sym]) });
  mCenterFlex(dPaw)
  mPlace(dPaw, 'tc')
}
async function wsOnclickCard(table, item, items) {console.log('click', item) }
function wsPowerText(item, d, styles = {}) {
  mClear(d)
  let key = item.power; if (key.startsWith('_')) key = 'sienna' + key;
  let parts = key.split('_'); 
  let s = '';
  let color = parts[0];
  if (color == 'sienna') s += 'WHEN ACTIVATED: ';
  else if (color == 'pink') s += 'ONCE BETWEEN TURNS: ';
  else if (color == 'white') s += 'WHEN PLAYED: ';
  else if (color == 'lightblue') s += 'ROUND END: ';
  copyKeys({ bg: color }, styles); mStyle(d, { bg: color, fg: 'contrast' });
  let what = parts[1];
  let verb = '';
  let n = Number(parts[2]);
  if (color == 'sienna') {
    if (what == 'child') {
      verb = 'place';
      s += `${capitalize(verb)} ${n} ${pluralOf('child', n)} on any`;
      let prop = parts[3];
      switch (prop) {
        case 'color':
          s += ` ${n == 1 ? 'card' : '2 cards'} with color <span style="border-radius:${item.fz}px;padding-left:${item.fz / 2}px;padding-right:${item.fz / 2}px;background-color:white;color:${colorFrom(item.colorSym)}">${wsGetColorRainbowText(item.colorSym)}</span>.`; break;
        case 'class':
          s += ` ${item.class}.`; break;
        case 'sym':
        default:
          s += ` ${n == 1 ? 'card' : '2 cards'} with symbol ${wsGetSymbolInline(item.abstract, item.fz)}.`;
      }
      if (n == 2) s += ` Other players may place 1 ${what}.`
    } else if (what == 'draw') {
      verb = 'draw';
      what = parts[3];
      s += `${capitalize(verb)} ${n} ${pluralOf(what, n)}`;
      let prop = parts[4];
      switch (prop) {
        case 'tray':
        case 'deck': s += ` from ${prop}.`; break;
        case 'return': s += `, return 1 at the end of action.`; break;
        case '1': s += ` Other players may draw 1.`; break;
        default: s += '.'; break;
      }
    } else if (what == 'tuck') {
      verb = what;
      what = parts[3];
      s += `${capitalize(verb)} ${n} ${pluralOf('card', n)}`;
      let prop = parts[3];
      switch (prop) {
        case 'pick': s += ` to ${prop} 1 food from ${parts[4]}.`; break;
        case 'draw': s += ` to ${prop} 1 card from ${parts[4]}.`; break;
        case 'place': s += ` to ${prop} 1 child on any card.`; break;
        default:
      }
    } else if (what == 'food') {
      verb = 'pick';
      s += `${capitalize(verb)} ${n} ${what} from ${parts[3]}.`;
      if (n == 2) s += ` Other players ${verb} 1 ${what}.`
    } else if (what == 'all') {
      s += `All players ${parts[2]} ${parts[3]} ${what}.`;
    } else if (what == 'discard') {
      let n1 = Number(parts[5])
      s += `You may ${what} ${n} ${parts[3]} to ${parts[4]}`;
      if (parts.length > 5) {
        let n1 = Number(parts[5]);
        s += ` ${n1} ${pluralOf(parts[6], n1)}`;
        s += parts.length > 7 ? ` from ${parts[7]}.` : '.';
      } else s += '.';
    } else if (what == 'repeat') {
      s += `Repeat another brown power on this habitat.`;
    } else if (what == 'hunt') {
      let verb = what; what = parts[2];
      if (what == 'food') {
        s += `Roll dice in feeder. If there is a ${parts[3]}, keep it.`;
      } else if (what == 'card') {
        s += `Draw a card. `;
        switch (parts[3]) {
          case 'sym':
          default: s += `If it has symbol ${wsGetSymbolInline(item.abstract, item.fz)}, tuck it.`; break;
        }
      }
    }
  }
  if (color == 'pink') {
    let [verb1, what1, verb2, n, what2, from] = parts.slice(1);
    s += `When another player ${verb1}s ${what1}, ${verb2} ${n} ${what2}`;
    s += isdef(from) ? ` from ${from}.` : '.';
  }
  if (color == 'white') {
    if (what == 'draw') {
      verb = 'draw';
      what = parts[3];
      s += `${capitalize(verb)} ${n} ${pluralOf(what, n)}`;
      let prop = parts[4];
      switch (prop) {
        case 'tray':
        case 'deck': s += ` from ${prop}.`; break;
        case 'return': s += `, return 1`; s += what == 'card' ? ` at the end of action.` : '.'; break;
        case '1': s += ` Other players may draw 1.`; break;
        default: s += '.'; break;
      }
    } else if (what == 'collect') {
      s += `Collect all ${parts[2]} from feeder.`
    } else if (what == 'child') {
      s += `Place 1 child on each of your cards with `;
      what = parts[2];
      switch (what) {
        case 'sym': s += `symbol ${wsGetSymbolInline(item.abstract, item.fz)}.`; break;
        case 'class': s += `class ${item.class}.`; break;
        case 'color': s += `color <span style="color:${colorFrom(item.colorSym)}">${wsGetColorRainbowText(item.colorSym)}</span>.`; break;
      }
    }
  }
  if (color == 'lightblue') {
    if (what == 'feeder') s += `Collect all food in feeder.`
    else if (what == 'tray') s += `Collect a card from tray.`
  }
  s = replaceAll(s, 'child', wsGetChildInline(item));
  d.innerHTML = s;
  return d;
}
async function wsPreAction(table, items) {
  let [fen, me] = [table.fen, getUname()]
  let [phase, stage, round, pl, plorder, turn] = [fen.phase, fen.stage, fen.round, table.players[me], table.plorder, table.turn];
  console.log()
}
function wsPrintSymbol(dParent, sz, key) {
  let files = {
    cherries: '../assets/games/wingspan/fruit.svg',
    fish: '../assets/games/wingspan/fish.svg',
    forest: '../assets/games/wingspan/forest1.png',
    grain: '../assets/games/wingspan/wheat.svg',
    grassland: '../assets/games/wingspan/grassland2.png',
    mouse: '../assets/games/wingspan/mouse.svg',
    omni: '../assets/games/wingspan/pie3.svg',
    seedling: '../assets/img/emo/seedling.png',
    wetland: '../assets/games/wingspan/wetland.png',
    worm: '../assets/games/wingspan/worm.svg',
  };
  let keys = Object.keys(files);
  let styles = { w: sz, h: sz, };
  if (['wetland', 'grassland', 'forest'].includes(key)) styles['clip-path'] = PolyClips.diamond;
  if (key == 'wetland') styles.bg = 'lightblue';
  else if (key == 'grassland') styles.bg = 'goldenrod';
  else if (key == 'forest') styles.bg = 'emerald';
  let src = valf(files[key], key == 'food' ? files[rChoose(keys)] : null);
  if (src) return mDom(dParent, styles, { tag: 'img', width: sz, height: sz, src: files[valf(key, rChoose(keys))] });
  let o = M.superdi[key];
  return showim2(key, dParent, styles);
}
function wsShowCardItem(item, d, fa) {
  let [w, h, sztop, sz, gap, fz] = [340, 500, 100, 30, 8, 16].map(x => x * fa);
  item.fz = fz;
  let [card, dCard] = wsCard(d, w, h);
  let dtop = wsTopLeft(dCard, sztop, card.rounding);
  addKeys(card, item);
  let [bg, fg] = [item.colorPower, item.colorSym];
  wsHabitat(item.habTokens, dtop, sz * 1.1); mLinebreak(dtop, sz / 5);
  wsFood(item.foodTokens, item.op, dtop, sz * .8);
  wsTitle(item, dCard, sztop, fz, gap);
  let [szPic, yPic] = [h / 2, sztop + gap]
  let d1 = showim2(item.key, dCard, { rounding: 12, w: szPic, h: szPic }, { prefer: 'photo' });
  mPlace(d1, 'tr', gap, yPic);
  let leftBorderOfPic = w - (szPic + gap);
  let dleft = mDom(dCard, { w: leftBorderOfPic, h: szPic }); mPlace(dleft, 'tl', gap / 2, sztop + gap);
  mCenterCenterFlex(dleft);
  let dval = mDom(dleft, { fg, w: sz * 1.2, align: 'center', fz: fz * 1.8, weight: 'bold' }, { html: item.value });
  mLinebreak(dleft, 2 * gap)
  let szSym = sz * 1.5;
  let a = showim2(item.abstract, dleft, { w: szSym, h: szSym, fg });
  mLinebreak(dleft, 3 * gap)
  let dPlaetze = item.live.dPlaetze = showPlaetze(dleft, item, gap * 2);
  item.dpower = mDom(dCard, { fz: fz * 1.2, padding: gap, matop: sztop + szPic + gap * 3, w100: true, bg, fg: 'contrast', box: true });
  wsPowerText(item, item.dpower, { fz: item.fz })
  let dinfo = mDom(dCard, { fz, hpadding: gap, box: true, w100: true });
  mPlace(dinfo, 'bl'); mFlexLine(dinfo, 'space-between');
  mDom(dinfo, {}, { html: item.class });
  mDom(dinfo, {}, { html: item.olifespan.text });
  mDom(dinfo, {}, { html: item.osize.text });
  return item;
}
function wsTitle(o, dCard, sztop, fz, gap) {
  let dtitle = mDom(dCard, { paleft: gap, wmax: sztop * 1.5 }); mPlace(dtitle, 'tl', sztop, gap)
  mDom(dtitle, { fz: fz * 1.1, weight: 'bold' }, { html: fromNormalized(o.friendly) });
  mDom(dtitle, { fz, 'font-style': 'italic' }, { html: o.species });
}
function wsTopLeft(dCard, sztop, rounding) {
  let dtop = mDom(dCard, { w: sztop, h: sztop, bg: '#ccc' });
  mPlace(dtop, 'tl');
  dtop.style.borderTopLeftRadius = dtop.style.borderBottomRightRadius = `${rounding}px`;
  mCenterCenterFlex(dtop);
  return dtop;
}
function xmlToJson(xml) {
  const obj = {};
  if (xml.nodeType === 1 && xml.attributes.length > 0) {
    obj["@attributes"] = {};
    for (let attr of xml.attributes) {
      obj["@attributes"][attr.name] = attr.value;
    }
  }
  if (xml.hasChildNodes()) {
    for (let node of xml.childNodes) {
      if (node.nodeType === 3) {
        const text = node.nodeValue.trim();
        if (text) return text;
      } else {
        const key = node.nodeName;
        const value = xmlToJson(node);
        if (!obj[key]) obj[key] = value;
        else {
          if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
          obj[key].push(value);
        }
      }
    }
  }
  return obj;
}
function yearsToReadable(n) {
  let di = { y: 1, m: 12, w: 52, d: 365, h: 365 * 24 };
  if (n > 1) return n.toFixed(1) + ' years';
  if (n * 12 > 1) return (n * 12).toFixed(1) + ' months';
  if (n * 52 > 1) return (n * 52).toFixed(1) + ' weeks';
  if (n * 365 > 1) return (n * 365).toFixed(1) + ' days';
  return (n * 365 * 24).toFixed(1) + ' hours';
}
function zInno(key, dParent) {
  let info = cinno[key]; info.key = key;
  console.log(info)
  let col = ColorDict[InnoDict[info.color]].c;
  info.c = colorDarker(col, info.color == 'yellow' ? .3 : .6);
  let bgCard = info.c;
  let item = { key: key, info: info };
  let d = item.div = mDom(null, { position: 'relative' });
  let color = InnoDict[info.type].fg;
  let bg = colorDarker(color, .5);
  let fg = colorLighter(color, .5);
  let dTitle = mDom(d, { margin: 5, bg: 'transparent', fg: 'white' });
  item.title = zText(key.toUpperCase(), dTitle, { display: 'inline', paleft: 10, paright: 10, weight: 'bold' });
  item.type = zInnoSymbol(info.type, dTitle, 20, 2, 0, 0, true);
  let dMain = item.dMain = mDom(d, { align: 'left' });
  let dogmas = [];
  for (const dog of info.dogmas) {
    let x = convertDogmaText(dog);
    dogmas.push(zText(x, dMain, { mabottom: 8 }));
  }
  item.dogmas = dogmas;
  let resources = [];
  for (const sym of info.resources) {
    let t =
      sym == 'None' ? zText(info.age.toString(), d, { margin: 5, w: 40, fz: 20, align: 'center', fg: 'black', bg: 'white', rounding: '50%', display: 'inline-block' }, 40, true)
        : sym == 'echo' ? zText(info.echo[0], d, { fz: 20, fg: 'white', bg: 'black' })
          : zInnoSymbol(sym, d); //zPic(InnoDict[sym].k, d, { margin: 5, padding: 4, w: 40, h: 40, bg: InnoDict[sym].bg, rounding: '10%' });
    resources.push(t);
  }
  item.resources = resources;
  posTR(dTitle);
  posTL(resources[0].div);
  posBL(resources[1].div);
  posBC(resources[2].div);
  posBR(resources[3].div);
  mStyleX(d, { margin: 4, w: 420, h: 220, padding: 50, rounding: 8, 'box-sizing': 'border-box', bg: bgCard });
  let dims = idealFontsizeX(dMain, 350, 120, 18, 8);
  item.dimsMain = dims;
  mAppend(d, dMain);
  if (isdef(dParent)) mAppend(dParent, d);
  return item;
}
function zInnoSymbol(sym, d, sz = 40, margin = 5, padding = 4, rounding = '10%', reverseColors = false) {
  let color = InnoDict[sym].fg;
  let fg, bg;
  if (reverseColors) {
    fg = colorDarker(color, .5);
    bg = colorLighter(color, .5);
  } else {
    bg = colorDarker(InnoDict[sym].bg, .2);
    fg = InnoDict[sym].fg;
  }
  return zPic(InnoDict[sym].k, d, { w: sz, h: sz, margin: margin, padding: padding, bg: bg, fg: fg, rounding: rounding });
}
function zPic(itemInfoKey, dParent, styles = {}) {
  let [item, info, key] = detectItemInfoKey(itemInfoKey);
  let outerStyles = isdef(styles) ? jsCopy(styles) : {};
  outerStyles.display = 'inline-block';
  let family = info.family;
  let wInfo = info.w;
  let hInfo = info.h; if (info.type == 'icon' && hInfo == 133) hInfo = 110;
  info.fz = 100;
  let innerStyles = { family: family };
  let [padw, padh] = isdef(styles.padding) ? [styles.padding, styles.padding] : [0, 0];
  let dOuter = isdef(dParent) ? mDom(dParent) : mDom();
  let d = mDom(dOuter);
  d.innerHTML = info.text;
  let wdes, hdes, fzdes, wreal, hreal, fzreal, f;
  if (isdef(styles.w) && isdef(styles.h) && isdef(styles.fz)) {
    [wdes, hdes, fzdes] = [styles.w, styles.h, styles.fz];
    let fw = wdes / wInfo;
    let fh = hdes / hInfo;
    let ffz = fzdes / info.fz;
    f = Math.min(fw, fh, ffz);
  } else if (isdef(styles.w) && isdef(styles.h)) {
    [wdes, hdes] = [styles.w, styles.h];
    let fw = wdes / wInfo;
    let fh = hdes / hInfo;
    f = Math.min(fw, fh);
  } else if (isdef(styles.w) && isdef(styles.fz)) {
    [wdes, fzdes] = [styles.w, styles.fz];
    let fw = wdes / wInfo;
    let ffz = fzdes / info.fz;
    f = Math.min(fw, ffz);
  } else if (isdef(styles.h) && isdef(styles.fz)) {
    [hdes, fzdes] = [styles.h, styles.fz];
    let fh = hdes / hInfo;
    let ffz = fzdes / info.fz;
    f = Math.min(fh, ffz);
  } else if (isdef(styles.h)) {
    hdes = styles.h;
    f = hdes / hInfo;
  } else if (isdef(styles.w)) {
    wdes = styles.w;
    f = wdes / wInfo;
  } else {
    mStyleX(d, innerStyles);
    mStyleX(dOuter, outerStyles);
    return dOuter;
  }
  fzreal = Math.floor(f * info.fz);
  wreal = Math.round(f * wInfo);
  hreal = Math.round(f * hInfo);
  wdes = Math.round(wdes);
  hdes = Math.round(hdes);
  padw += isdef(styles.w) ? (wdes - wreal) / 2 : 0;
  padh += isdef(styles.h) ? (hdes - hreal) / 2 : 0;
  if (!(padw >= 0 && padh >= 0)) {
    console.log(info)
    console.log('\nstyles.w', styles.w, '\nstyles.h', styles.h, '\nstyles.fz', styles.fz, '\nstyles.padding', styles.padding, '\nwInfo', wInfo, '\nhInfo', hInfo, '\nfzreal', fzreal, '\nwreal', wreal, '\nhreal', hreal, '\npadw', padw, '\npadh', padh);
  }
  innerStyles.fz = fzreal;
  innerStyles.weight = 900;
  innerStyles.w = wreal;
  innerStyles.h = hreal;
  mStyleX(d, innerStyles);
  outerStyles.padding = '' + padh + 'px ' + padw + 'px';
  outerStyles.w = wreal;
  outerStyles.h = hreal;
  mStyleX(dOuter, outerStyles);
  return {
    info: info, key: info.key, div: dOuter, outerDims: { w: wdes, h: hdes, hpadding: padh, wpadding: padw },
    innerDims: { w: wreal, h: hreal, fz: fzreal }, bg: dOuter.style.backgroundColor, fg: dOuter.style.color
  };
}

