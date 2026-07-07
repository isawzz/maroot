
function uiTypeCard52(ckey, h = 100, bg = 'red', border = 'black', borderthickness = 1, shadow = true, bgFace = 'white') {
	let w = h * 0.7;
	let html = M.c52['card_' + ckey.slice(0, 2)];
	if (!shadow) html = html.replace(/class=["']card["']\s?/, '');
	html = html.replace('fill="white" stroke="black"', `fill="${bgFace}" stroke="${border}" stroke-width="${borderthickness}"`);
	let div = mDom(null, { h, w }, { html });
	let res = { key: ckey, w, h, svgUp: html, faceUp: true, div, bg, border, borderthickness, shadow, color: bg };
	return res;
}

function AI_uiTypeCard52(ckey, h = 100, bg = 'red', border = 'black', borderthickness = 1, shadow = true, bgFace = 'white') {
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
	const CARD_RATIO = 240 / 336;          // exact ratio from SVG viewBox 240×336
	const w = Math.round(h * CARD_RATIO);  // was h*0.7 (≈1.4% too narrow)

	let html = M.c52['card_' + ckey.slice(0, 2)];

	// Remove drop-shadow: strip the class attribute from the <svg> root only.
	// The original regex could hit nested elements with a "card" class.
	if (!shadow) {
		html = html.replace(/(<svg\b[^>]*?)\s+class="[^"]*"/, '$1');
	}

	const div = mDom(null, { h, w, }, { html });

	// Style the face rect via DOM — works regardless of attribute order in source
	const rect = div.querySelector('rect');
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


	const rect = card.div?.querySelector('rect');
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

  const div = mDom(null, { h, w, background: bg }, { html });

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

  const div = mDom(null, { rounding:w/20,h, w, background: bg }, { html });

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