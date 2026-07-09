
function uiTypeCard52(ckey, h = 100, bg = 'transparent', border = 'black', borderthickness = 1, shadow = true, bgFace = 'white') {
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
    bg,
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

