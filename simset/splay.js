// ─────────────────────────────────────────────────────────────────────────────
// SPLAY ENGINE  —  works with card objects {div,w,h} OR plain HTMLElements
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalise one item to {el, w, h, original}.
 * Accepts either a card object (from uiTypeCard52) or a plain HTMLElement.
 */
function _normalizeItem(item) {
  if (item instanceof HTMLElement) {
    return { el: item, w: item.offsetWidth || 60, h: item.offsetHeight || 60, original: item };
  }
  return { el: item.div, w: item.w, h: item.h, original: item };
}

/**
 * Compute left/top/rotation/zIndex for a straight-line splay.
 * overlap: 0 = touching · 0.65 = default · 1 = stacked · <0 = gapped
 */
function _linearCoords(norm, direction, overlap, rotateStep) {
  const { w, h } = norm[0];
  const sx = w * (1 - overlap);
  const sy = h * (1 - overlap);

  const vectors = {
    right:       [ sx,  0      ],
    left:        [-sx,  0      ],
    up:          [  0, -sy     ],
    down:        [  0,  sy     ],
    'down-right':[ sx,  sy*0.5 ],
    'down-left': [-sx,  sy*0.5 ],
    'up-right':  [ sx, -sy*0.5 ],
    'up-left':   [-sx, -sy*0.5 ],
  };

  const [dx, dy] = vectors[direction] ?? vectors.right;
  const raw = norm.map((item, i) => ({
    ...item,
    left:     i * dx,
    top:      i * dy,
    rotation: i * rotateStep,
    zIndex:   i + 1,
  }));

  // Shift bounding box to (0,0)
  const minL = Math.min(...raw.map(p => p.left));
  const minT = Math.min(...raw.map(p => p.top));
  raw.forEach(p => { p.left -= minL; p.top -= minT; });
  return raw;
}

/**
 * Compute left/top/rotation/zIndex for an arc fan.
 * Cards are arranged along a circular arc, each tilted to follow the curve,
 * as if held in a hand. Centre card sits at the top of the arc.
 */
function _fanCoords(norm, spreadDeg, arcRadius) {
  const { w, h } = norm[0];
  const n  = norm.length;
  const R  = arcRadius ?? Math.max(h * 2.5, w * 3.5);
  const totalRad   = (spreadDeg * Math.PI) / 180;
  const startAngle = -totalRad / 2;
  const stepAngle  = n > 1 ? totalRad / (n - 1) : 0;

  const raw = norm.map((item, i) => {
    const θ = startAngle + i * stepAngle;
    return {
      ...item,
      left:     R * Math.sin(θ) - item.w / 2,
      top:      R * (1 - Math.cos(θ)) - item.h / 2,
      rotation: θ * (180 / Math.PI),
      zIndex:   i + 1,
    };
  });

  const minL = Math.min(...raw.map(p => p.left));
  const minT = Math.min(...raw.map(p => p.top));
  raw.forEach(p => { p.left -= minL; p.top -= minT; });
  return raw;
}

/**
 * Attach hover-raise and click-select interactions to one element.
 * Called on every splayItems() call so dataset options stay up-to-date,
 * but DOM listeners are only attached once (guarded by data-splay-bound).
 *
 * Hover  : raises the element in its own local space (feels natural in a fan).
 * Click  : toggles data-selected="1" and shows a coloured outline.
 */
function _bindInteractions(el, { hoverRaise, selectionColor, selectionWidth }) {
  // Always refresh runtime options on the element so re-splaying with new
  // values (different colour, different raise) takes effect immediately.
  el.dataset.splayHoverRaise      = String(hoverRaise);
  el.dataset.splaySelectionColor  = selectionColor;
  el.dataset.splaySelectionWidth  = String(selectionWidth);

  if (el.dataset.splayBound === '1') return; // listeners already attached
  el.dataset.splayBound = '1';
  el.style.cursor = 'pointer';

  el.addEventListener('mouseenter', () => {
    const rot   = parseFloat(el.dataset.splayRotation || '0');
    const raise = parseFloat(el.dataset.splayHoverRaise || '10');
    el.style.transition = 'transform 0.12s ease';
    el.style.transform  = rot
      ? `rotate(${rot}deg) translateY(-${raise}px)`
      : `translateY(-${raise}px)`;
  });

  el.addEventListener('mouseleave', () => {
    const rot = parseFloat(el.dataset.splayRotation || '0');
    el.style.transition = 'transform 0.12s ease';
    el.style.transform  = rot ? `rotate(${rot}deg)` : '';
  });

  el.addEventListener('click', () => {
    const isSelected = el.dataset.selected === '1';
    if (isSelected) {
      el.dataset.selected    = '0';
      el.style.outline       = '';
      el.style.outlineOffset = '';
    } else {
      const color = el.dataset.splaySelectionColor || 'red';
      const width = el.dataset.splaySelectionWidth || '3';
      el.dataset.selected    = '1';
      el.style.outline       = `${width}px solid ${color}`;
      el.style.outlineOffset = '0px';
    }
  });
}

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
async function splayItems(items, container, {
  direction      = 'right',
  overlap        = 0.65,
  rotateStep     = 0,
  spreadDeg      = 40,
  arcRadius,
  padding        = 6,
  hoverRaise     = 10,
  selectionColor = 'red',
  selectionWidth = 3,
  animate        = true,
  durationMs     = 250,
} = {}) {
  if (!items.length) return { width: 0, height: 0 };

  const norm = items.map(_normalizeItem);

  const positions = direction === 'fan'
    ? _fanCoords(norm, spreadDeg, arcRadius)
    : _linearCoords(norm, direction, overlap, rotateStep);

  // Compute container size from bounding box of all placed items
  const maxRight  = Math.max(...positions.map(p => p.left + p.w));
  const maxBottom = Math.max(...positions.map(p => p.top  + p.h));
  const totalW    = Math.ceil(maxRight  + 2 * padding);
  const totalH    = Math.ceil(maxBottom + 2 * padding);

  container.style.position = 'relative';
  container.style.width    = `${totalW}px`;
  container.style.height   = `${totalH}px`;

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
    el.dataset.splayZIndex   = String(zIndex);
    // Also update card.splayRotation for flip animation compatibility
    if (original && !(original instanceof HTMLElement)) original.splayRotation = rotation;

    el.style.position   = 'absolute';
    el.style.zIndex     = String(zIndex);
    el.style.transition = tr;
    el.style.left       = `${Math.round(left + padding)}px`;
    el.style.top        = `${Math.round(top  + padding)}px`;
    el.style.transform  = rotation ? `rotate(${rotation.toFixed(2)}deg)` : '';

    _bindInteractions(el, { hoverRaise, selectionColor, selectionWidth });
  });

  if (animate) await new Promise(r => setTimeout(r, durationMs));

  return { width: totalW, height: totalH };
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience shorthands
// ─────────────────────────────────────────────────────────────────────────────

const splayRight    = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'right'      });
const splayLeft     = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'left'       });
const splayUp       = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'up'         });
const splayDown     = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'down'       });
const splayFan      = (items, el, opts = {}) => splayItems(items, el, { ...opts, direction: 'fan'        });
const splayDiagonal = (items, el, dir = 'down-right', opts = {}) =>
                       splayItems(items, el, { ...opts, direction: dir });

// ─────────────────────────────────────────────────────────────────────────────
// Selection query
// ─────────────────────────────────────────────────────────────────────────────

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
function getSelected(container, items) {
  const selectedEls = Array.from(container.querySelectorAll('[data-selected="1"]'));
  if (!items) return selectedEls;
  return items.filter(item => {
    const el = item instanceof HTMLElement ? item : item.div;
    return selectedEls.includes(el);
  });
}
