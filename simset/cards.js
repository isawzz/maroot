
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
  // Returns the outer card rect (largest area) from a card div.
  // querySelector('rect') returns the FIRST rect, which for face cards (J/Q/K)
  // is the inner decorative border, not the outer card edge. The outer rect is
  // always the one with the greatest width*height in SVG viewBox coordinates.
  const rects = Array.from(div.querySelectorAll('rect'));
  if (!rects.length) return null;
  return rects.reduce((best, r) =>
    (parseFloat(r.getAttribute('width')) * parseFloat(r.getAttribute('height'))) >
      (parseFloat(best.getAttribute('width')) * parseFloat(best.getAttribute('height')))
      ? r : best
  );
}

function uiTypeCard52(ckey, h = 100, bg = 'red', border = 'black', borderthickness = 1, shadow = true, bgFace = 'white') {
  const CARD_RATIO = 240 / 336;          // exact ratio from SVG viewBox 240×336
  const w = Math.round(h * CARD_RATIO);  // was h*0.7 (≈1.4% too narrow)

  let html = M.c52['card_' + ckey.slice(0, 2)];

  // Remove drop-shadow: strip the class attribute from the <svg> root only.
  // The original regex could hit nested elements with a "card" class.
  if (!shadow) {
    html = html.replace(/(<svg\b[^>]*?)\s+class="[^"]*"/, '$1');
  }

  const div = mDom(null, {
    h, w,
    background: bg,
    rounding: Math.round(w / 20), // matches SVG rx="12" in viewBox width 240: 12/240*w = w/20
    overflow: 'hidden'                 // clips any stroke bleed at the corners
  }, { html });

  // Style the OUTER rect (largest area = card background/border).
  // face cards have a smaller inner decorative rect that must not be targeted.
  const rect = _cardOuterRect(div);
  if (rect) {
    rect.setAttribute('fill', bgFace);
    rect.setAttribute('stroke', border);
    rect.setAttribute('stroke-width', String(borderthickness));
  }

  const svgUp = div.innerHTML; // reflects final patched state

  return { key: ckey, w, h, svgUp, faceUp: true, div, bg, border, borderthickness, shadow, bgFace };
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
   *   // ... later:
   *   revert();
   */
  const rect = _cardOuterRect(card.div);
  if (!rect) return () => { };

  // Snapshot current state before touching anything
  const prevColor = card.border;
  const prevThickness = card.borderthickness;

  // Apply new values
  rect.setAttribute('stroke', color);
  card.border = color;

  if (thickness !== undefined) {
    rect.setAttribute('stroke-width', String(thickness));
    card.borderthickness = thickness;
  }

  // Return a closure that restores the exact pre-call state
  return function revert() {
    rect.setAttribute('stroke', prevColor);
    card.border = prevColor;
    rect.setAttribute('stroke-width', String(prevThickness));
    card.borderthickness = prevThickness;
  };
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
   *   // Highlight selected card in gold for 1s
   *   const flash = flashCardBorder(card, 'gold', 1000, 3);
   *
   *   // Cancel early if card is played before 1s elapses
   *   flash.cancel();
   */
  const revert = setCardBorder(card, color, thickness);
  const tid = setTimeout(revert, durationMs);
  return {
    cancel() { clearTimeout(tid); revert(); }
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// CARD FLIP
// ─────────────────────────────────────────────────────────────────────────────

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

function _flipAnimate(card, toHtml, durationMs) {
  /**
   * Internal: plays a half-fold → swap-content → half-unfold CSS 3D animation.
   * Returns a Promise that resolves when the animation is fully complete.
   */
  return new Promise(resolve => {
    const div = card.div;
    const half = durationMs / 2;
    // Preserve any rotation applied by splayCards so the card stays in its
    // fanned/splayed position throughout the flip.
    const rot = card.splayRotation || 0;
    const base = rot ? `rotate(${rot.toFixed(2)}deg)` : '';

    // Phase 1 — fold away: 0 → 90deg
    div.style.transition = `transform ${half}ms ease-in`;
    div.style.transform = `perspective(600px) rotateY(90deg) ${base}`;

    setTimeout(() => {
      // Swap content at the fold point (card is edge-on, invisible)
      div.innerHTML = toHtml;

      // Jump to −90deg (other side, still edge-on) without animation
      div.style.transition = 'none';
      div.style.transform = `perspective(600px) rotateY(-90deg) ${base}`;

      // Force reflow so the browser registers −90deg before we transition
      void div.offsetHeight;

      // Phase 2 — unfold: −90 → 0deg
      div.style.transition = `transform ${half}ms ease-out`;
      div.style.transform = `perspective(600px) rotateY(0deg) ${base}`;

      setTimeout(() => {
        // Clean up perspective from transform, leaving only the splay rotation
        div.style.transition = 'none';
        div.style.transform = base;
        resolve();
      }, half);
    }, half);
  });
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
   *   await faceDown(card, true, 500);   // slower
   *   await faceDown(card, false);       // instant
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
   *   await flipCard(card);                       // animated toggle, 300ms
   *   await flipCard(card, true, 600);            // slower
   *   await flipCard(card, false);                // instant
   *
   *   // Deal 5 cards face-down then reveal one by one with a gap
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

// ─────────────────────────────────────────────────────────────────────────────
// SPLAY ENGINE  —  works with card objects {div,w,h} OR plain HTMLElements
// ─────────────────────────────────────────────────────────────────────────────

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

  // Shift bounding box to (0,0)
  const minL = Math.min(...raw.map(p => p.left));
  const minT = Math.min(...raw.map(p => p.top));
  raw.forEach(p => { p.left -= minL; p.top -= minT; });
  return raw;
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

function _bindInteractions(el, { hoverRaise, selectionColor, selectionWidth }) {
  /**
   * Attach hover-raise and click-select interactions to one element.
   * Called on every splayItems() call so dataset options stay up-to-date,
   * but DOM listeners are only attached once (guarded by data-splay-bound).
   *
   * Hover  : raises the element in its own local space (feels natural in a fan).
   * Click  : toggles data-selected="1" and shows a coloured outline.
   */
  // Always refresh runtime options on the element so re-splaying with new
  // values (different colour, different raise) takes effect immediately.
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

async function splayItems(items, container, {
  direction = 'right',
  overlap = 0.65,
  rotateStep = 0,
  spreadDeg = 40,
  arcRadius,
  padding = 6,
  hoverRaise = 10,
  selectionColor = 'red',
  selectionWidth = 3,
  animate = true,
  durationMs = 250,
} = {}) {
  /**
   * splayItems
   * ─────────────────────────────────────────────────────────────────────────────
   * Positions a list of cards or divs in a splay/fan inside a container.
   * The container is auto-sized; its required dimensions are returned.
   *
   * @param {Array<Object|HTMLElement>} items
   *   Card objects from uiTypeCard52, or plain HTMLElements.
   *
   * @param {HTMLElement} container
   *   Parent element. Gets position:relative and is resized to fit the splay.
   *
   * @param {Object} [options]
   * @param {'right'|'left'|'up'|'down'|
   *          'down-right'|'down-left'|'up-right'|'up-left'|
   *          'fan'} [options.direction='right']
   *
   * @param {number} [options.overlap=0.65]
   *   Fraction of each item's width/height hidden behind the next.
   *   0 = items just touching · 1 = perfect stack · <0 = gap between items.
   *
   * @param {number} [options.rotateStep=0]
   *   Extra rotation in degrees added per item (linear modes only).
   *   e.g. rotateStep=3 fans the cards slightly while still splaying linearly.
   *
   * @param {number} [options.spreadDeg=40]  Fan mode: total arc sweep in degrees.
   * @param {number} [options.arcRadius]     Fan mode: arc radius in px (auto if omitted).
   * @param {number} [options.padding=6]     Px gap between splay bounding box and container edge.
   * @param {number} [options.hoverRaise=10] Px the item lifts upward on hover.
   * @param {string} [options.selectionColor='red']  Outline colour when selected.
   * @param {number} [options.selectionWidth=3]      Outline width in px when selected.
   * @param {boolean}[options.animate=true]
   * @param {number} [options.durationMs=250]
   *
   * @returns {Promise<{width:number, height:number}>}
   *   Total pixel size required for the container.
   *
   * @example
   *   const { width, height } = await splayItems(hand, handEl, { direction: 'fan', spreadDeg: 50 });
   *   handEl.style.width  = width  + 'px';
   *   handEl.style.height = height + 'px';
   *
   *   await splayItems(deck, deckEl, { direction: 'down-right', overlap: 0.88 });
   *
   *   // Works with plain divs too
   *   await splayItems(Array.from(container.children), container, { direction: 'right' });
   */
  if (!items.length) return { width: 0, height: 0 };

  const norm = items.map(_normalizeItem);

  const positions = direction === 'fan'
    ? _fanCoords(norm, spreadDeg, arcRadius)
    : _linearCoords(norm, direction, overlap, rotateStep);

  // Compute container size from bounding box of all placed items
  const maxRight = Math.max(...positions.map(p => p.left + p.w));
  const maxBottom = Math.max(...positions.map(p => p.top + p.h));
  const totalW = Math.ceil(maxRight + 2 * padding);
  const totalH = Math.ceil(maxBottom + 2 * padding);

  container.style.position = 'relative';
  container.style.width = `${totalW}px`;
  container.style.height = `${totalH}px`;

  // Move items into container if needed
  positions.forEach(({ el }) => {
    if (el.parentElement !== container) container.appendChild(el);
  });

  // Apply positions
  const tr = animate
    ? `left ${durationMs}ms ease, top ${durationMs}ms ease, transform ${durationMs}ms ease`
    : 'none';

  positions.forEach(({ el, left, top, rotation, zIndex, original }) => {
    // Persist rotation so hover, flip, and getSelected can read it
    el.dataset.splayRotation = String(rotation);
    el.dataset.splayZIndex = String(zIndex);
    // Also update card.splayRotation for flip animation compatibility
    if (original && !(original instanceof HTMLElement)) original.splayRotation = rotation;

    el.style.position = 'absolute';
    el.style.zIndex = String(zIndex);
    el.style.transition = tr;
    el.style.left = `${Math.round(left + padding)}px`;
    el.style.top = `${Math.round(top + padding)}px`;
    el.style.transform = rotation ? `rotate(${rotation.toFixed(2)}deg)` : '';

    _bindInteractions(el, { hoverRaise, selectionColor, selectionWidth });
  });

  if (animate) await new Promise(r => setTimeout(r, durationMs));

  return { width: totalW, height: totalH };
}

const splayRight = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'right' });
const splayLeft = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'left' });
const splayUp = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'up' });
const splayDown = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'down' });
const splayFan = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'fan' });
const splayDiagonal = (items, el, dir = 'down-right', opts = {}) =>
  splayItems(items, el, { ...opts, direction: dir });


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
   *   // Get selected card objects
   *   const selected = getSelected(handEl, hand);
   *
   *   // Get selected raw elements (when working with plain divs)
   *   const selectedEls = getSelected(handEl);
   */
  const selectedEls = Array.from(container.querySelectorAll('[data-selected="1"]'));
  if (!items) return selectedEls;
  return items.filter(item => {
    const el = item instanceof HTMLElement ? item : item.div;
    return selectedEls.includes(el);
  });
}
