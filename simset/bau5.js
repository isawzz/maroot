
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

	// Angular step between items
	const step = inclusive && n > 1 ? sweep / (n - 1) : sweep / n;

	// Container is a square whose side = diagonal of the largest item + padding.
	// This guarantees no item clips at any rotation angle.
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

		// Persist so hover + flip stay in sync
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
		dg:container,
		cards:items,
		topCard: items[n - 1],
		width: totalSize,
		height: totalSize
	};
}

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

