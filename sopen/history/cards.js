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
function _cardOuterRect(div) {
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
    rounding: Math.ceil(w / 20), // matches SVG rx="12" in viewBox width 240: 12/240*w = w/20
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
function setCardBorder(card, color, thickness) {
  const rect = _cardOuterRect(card.div);
  if (!rect) return () => {};

  // Snapshot current state before touching anything
  const prevColor     = card.border;
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
function flashCardBorder(card, color, durationMs = 800, thickness) {
  const revert = setCardBorder(card, color, thickness);
  const tid    = setTimeout(revert, durationMs);
  return {
    cancel() { clearTimeout(tid); revert(); }
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// CARD FLIP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates the back-face SVG for a card, matching its current border/bg state.
 * Three concentric rectangles give a classic card-back look.
 * Called fresh on each flip so it always reflects the card's current colors.
 */
function _cardBackSVG(card) {
  const bg     = card.bg    || 'navy';
  const accent = card.bgFace || 'white';
  const stroke = card.border || 'black';
  const sw     = card.borderthickness || 1;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-120 -168 240 336" width="100%" height="100%" preserveAspectRatio="none">
    <rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12"
          fill="${bg}" stroke="${stroke}" stroke-width="${sw}"/>
    <rect width="207" height="303" x="-103.5" y="-151.5" rx="9" ry="9"
          fill="none" stroke="${accent}" stroke-width="3" opacity="0.55"/>
    <rect width="183" height="279" x="-91.5" y="-139.5" rx="7" ry="7"
          fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.35"/>
  </svg>`;
}

/**
 * Internal: plays a half-fold → swap-content → half-unfold CSS 3D animation.
 * Returns a Promise that resolves when the animation is fully complete.
 */
function _flipAnimate(card, toHtml, durationMs) {
  return new Promise(resolve => {
    const div  = card.div;
    const half = durationMs / 2;

    // Phase 1 — fold away: 0 → 90deg
    div.style.transition = `transform ${half}ms ease-in`;
    div.style.transform  = 'perspective(600px) rotateY(90deg)';

    setTimeout(() => {
      // Swap content at the fold point (card is edge-on, invisible)
      div.innerHTML = toHtml;

      // Jump to −90deg (other side, still edge-on) without animation
      div.style.transition = 'none';
      div.style.transform  = 'perspective(600px) rotateY(-90deg)';

      // Force reflow so the browser registers −90deg before we transition
      void div.offsetHeight;

      // Phase 2 — unfold: −90 → 0deg
      div.style.transition = `transform ${half}ms ease-out`;
      div.style.transform  = 'perspective(600px) rotateY(0deg)';

      // Resolve once the second half completes
      setTimeout(resolve, half);
    }, half);
  });
}

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
async function faceDown(card, animate = true, durationMs = 300) {
  if (!card.faceUp) return;
  card.faceUp = false;
  const backHtml = _cardBackSVG(card);
  if (animate) await _flipAnimate(card, backHtml, durationMs);
  else         card.div.innerHTML = backHtml;
}

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
async function faceUp(card, animate = true, durationMs = 300) {
  if (card.faceUp) return;
  card.faceUp = true;
  if (animate) await _flipAnimate(card, card.svgUp, durationMs);
  else         card.div.innerHTML = card.svgUp;
}

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
async function flipCard(card, animate = true, durationMs = 300) {
  if (card.faceUp) await faceDown(card, animate, durationMs);
  else             await faceUp(card, animate, durationMs);
}
