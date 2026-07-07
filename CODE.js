

//#region arrange algorithms nicht so gut
function arrangeItemsInSpiral(container, items, spacing = 30, tightness = 0.5) {
  /**
   * Arranges child elements in a spiral starting from the center of the container.
   * * @param {HTMLElement} container - The parent container element (should have position: relative).
   * @param {HTMLElement[]} items - An array of DOM elements to arrange.
   * @param {number} [spacing=30] - Controls how far apart consecutive items are along the spiral path.
   * @param {number} [tightness=0.5] - Higher values expand the spiral faster; lower values pack loops closer together.
   */
  const numItems = items.length;
  if (numItems === 0) return;

  // 1. Get the center coordinates of the container
  mStyle(container, { position: 'relative' });
  const rect = container.getBoundingClientRect(); console.log(rect)
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // Golden Angle in radians (~137.5 degrees) provides a beautifully balanced Fermat distribution.
  // Alternatively, use a small linear increment (e.g., 0.3) for a strict traditional spooling spiral.
  // const angleIncrement = 137.5 * (Math.PI / 180);
  const angleIncrement = 137.5 * (Math.PI / 180);

  items.forEach((item, index) => {
    // 2. Fermat's Spiral math: radius grows with the square root of the index
    // For a strict Archimedean spiral instead, change Math.sqrt(index) to just: index
    const r = tightness * spacing * Math.sqrt(index);
    const theta = index * angleIncrement;

    // 3. Convert polar coordinates (r, theta) to Cartesian (x, y)
    const x = centerX + r * Math.cos(theta);
    const y = centerY + r * Math.sin(theta);

    // 4. Update element styles for absolute positioning centered on the (x, y) point
    item.style.position = 'absolute';
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;

    // Offset by half the item's dimensions so its absolute center aligns on the spiral path
    const itemW = item.offsetWidth || parseInt(item.style.width) || 0;
    const itemH = item.offsetHeight || parseInt(item.style.height) || 0;

    //item.style.transform = `translate(-50%, -50%)`;
  });
}
function arrangeInCustomConcentricCircles(container, items, ringCapacities = [6, 10, 12], baseRadius = 55, ringSpacings = [60, 70, 40]) {
  /**
   * Arranges items in concentric circles with user-defined capacities and variable spacings per ring.
   *
   * @param {HTMLElement} container - The parent container element (position: relative).
   * @param {HTMLElement[]} items - An array of DOM elements to arrange.
   * @param {number[]} ringCapacities - List of counts per ring, e.g., [5, 10, 15]
   * @param {number} [baseRadius=55] - The radius of the very first ring.
   * @param {number[]} ringSpacings - List of distances between successive rings, e.g., [45, 60, 75]
   */
  const numItems = items.length;
  if (numItems === 0) return;

  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // 1. Center Item (Index 0)
  items[0].style.position = 'absolute';
  items[0].style.left = `${centerX}px`;
  items[0].style.top = `${centerY}px`;
  items[0].style.transform = `translate(-50%, -50%)`;

  if (numItems === 1) return;

  let ringIndex = 0;
  let itemsPlaced = 1;
  let prevRingCapacity = 0;
  let currentRadius = baseRadius;

  while (itemsPlaced < numItems) {
    // Determine capacity: use list value or fallback to standard k * 6 close-packing
    const maxItemsInRing = ringCapacities[ringIndex] !== undefined
      ? ringCapacities[ringIndex]
      : (ringIndex + 1) * 6;

    const itemsInThisRing = Math.min(maxItemsInRing, numItems - itemsPlaced);

    // VARIABLE SPACING MATH:
    // If it's the first ring, it sits at baseRadius. 
    // For subsequent rings, we add the step spacing from your custom list.
    if (ringIndex > 0) {
      // Fallback to the last available spacing value in your array if the list runs out
      const stepSpacing = ringSpacings[ringIndex - 1] !== undefined
        ? ringSpacings[ringIndex - 1]
        : ringSpacings[ringSpacings.length - 1] || 50;

      currentRadius += stepSpacing;
    }

    // Interleaving phase shift to drop items into valleys of the previous layer
    let phaseShift = 0;
    if (prevRingCapacity > 0) {
      phaseShift = Math.PI / prevRingCapacity;
    }

    for (let i = 0; i < itemsInThisRing; i++) {
      const item = items[itemsPlaced];

      const angle = ((i / itemsInThisRing) * Math.PI * 2) + phaseShift;

      const x = centerX + currentRadius * Math.cos(angle);
      const y = centerY + currentRadius * Math.sin(angle);

      item.style.position = 'absolute';
      item.style.left = `${x}px`;
      item.style.top = `${y}px`;
      item.style.transform = `translate(-50%, -50%)`;

      itemsPlaced++;
    }

    prevRingCapacity = itemsInThisRing;
    ringIndex++;
  }
}
function arrangeInConcentricCircles(container, items, baseRadius = 55, ringSpacing = 50) {
  /**
   * Arranges items in concentric circles around a single centered element.
   * * @param {HTMLElement} container - The parent container element (should have position: relative).
   * @param {HTMLElement[]} items - An array of DOM elements to arrange.
   * @param {number} [baseRadius=55] - The radius of the first ring.
   * @param {number} [ringSpacing=50] - The distance between successive rings.
   */
  const numItems = items.length;
  if (numItems === 0) return;

  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // 1. Place the very first item dead center
  const firstItem = items[0];
  firstItem.style.position = 'absolute';
  firstItem.style.left = `${centerX}px`;
  firstItem.style.top = `${centerY}px`;
  firstItem.style.transform = `translate(-50%, -50%)`;

  if (numItems === 1) return;

  // 2. Distribute the remaining items into expanding rings
  let currentRing = 1;
  let itemsPlaced = 1; // Started with the center item

  while (itemsPlaced < numItems) {
    // Determine how many items fit in the current ring layer
    // Ring 1 gets 6 items, Ring 2 gets 12 items, Ring 3 gets 18 items, etc.
    const maxItemsInRing = currentRing * 6;
    const itemsInThisRing = Math.min(maxItemsInRing, numItems - itemsPlaced);

    // Calculate the radius for this specific layer
    const currentRadius = baseRadius + (currentRing - 1) * ringSpacing;

    for (let i = 0; i < itemsInThisRing; i++) {
      const item = items[itemsPlaced];

      // Evenly space angles around the 360-degree circle
      const angle = (i / itemsInThisRing) * Math.PI * 2;

      // Convert polar coordinates to Cartesian positions
      const x = centerX + currentRadius * Math.cos(angle);
      const y = centerY + currentRadius * Math.sin(angle);

      item.style.position = 'absolute';
      item.style.left = `${x}px`;
      item.style.top = `${y}px`;
      item.style.transform = `translate(-50%, -50%)`;

      itemsPlaced++;
    }

    currentRing++; // Step outwards to the next ring
  }
}
function arrangeShapesEvenlyCircle(container, items, gap = 10) {
  const numDivs = items.length;
  if (numDivs === 0) return container;

  // 1. Calculate dimensions directly from the pre-sized container
  const rect = container.getBoundingClientRect();
  const szCard = Math.min(rect.width, rect.height); // Use smallest dimension if it's not a perfect square
  const radius = szCard / 2;

  // =========================================================================
  // DYNAMIC AREA RESIZING ENGINE
  // =========================================================================
  const totalCircleArea = Math.PI * Math.pow(radius, 2);
  const targetElementArea = totalCircleArea * 0.42;

  let divMetrics = items.map((d, index) => {
    let originalW = d.w || d.offsetWidth || parseInt(d.style.width) || 40;
    let originalH = d.h || d.offsetHeight || parseInt(d.style.height) || 40;
    return { el: d, w: originalW, h: originalH, index };
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

  // 2. Generate target slots using Fermat's Spiral inside safe container boundaries
  const targetSlots = [];
  const goldenAngle = 137.5 * (Math.PI / 180);
  // Ensure we keep elements inside the card border by at least the specified gap
  const usableRadius = radius - gap;

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

  // ENFORCED MINIMUM GAP COLLISION CHECK
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

  // 3. Map Div elements to Target Slots
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
          // Calculate the true furthest corner point of the element boundary
          const itemRadius = Math.hypot(divData.w / 2, divData.h / 2);

          // Strict check: item boundary + gap must remain fully within the container circle
          if (centerDist + itemRadius + gap > radius) continue;

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
              el: divData.el
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

    if (!placed && targetSlots.length > 0) {
      const fallbackSlot = targetSlots.shift();
      finalizedNodes.push({
        x: fallbackSlot.x,
        y: fallbackSlot.y,
        w: divData.w * 0.7,
        h: divData.h * 0.7,
        el: divData.el
      });
    }
  });

  // 4. Position and append items into container frame without absolute padding adjustments
  finalizedNodes.forEach((node) => {
    const leftPos = node.x - (node.w / 2);
    const topPos = node.y - (node.h / 2);

    const rotationAngle = typeof rChoose !== 'undefined' ? rChoose([0, 5, 10, 15, 345, 350, 355]) : 0;

    // Use standard JS styles assignment if mStyle doesn't exist globally
    const targetStyle = {
      position: 'absolute',
      left: `${leftPos}px`,
      top: `${topPos}px`,
      width: `${node.w}px`,
      height: `${node.h}px`,
      fontSize: `${node.h * 0.8}px`,
      transform: `rotate(${rotationAngle}deg)`,
      margin: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };

    if (typeof mStyle === 'function') {
      mStyle(node.el, targetStyle);
    } else {
      Object.assign(node.el.style, targetStyle);
    }

    container.appendChild(node.el);
  });

  return container;
}
function arrangeOnCircleGrid(container, items, options = {}) {
	/**
	 * arrangeOnCircleGrid
	 * ----------------------------------------------------------------------------
	 * A generalized, deterministic version of the hand-tuned `layoutCircle`
	 * table from arrangeOnCard. Instead of a lookup table capped at n=18, row
	 * capacities are computed directly from the circle's actual chord width at
	 * each row's vertical position - the exact geometry that produced those
	 * hand-tuned numbers in the first place. This keeps the same clean,
	 * symmetric "wide middle rows, narrow top/bottom rows" look, but:
	 *   - works for ANY item count, not just 3-18
	 *   - adapts to the real circle size and real item size (no magic numbers)
	 *   - guarantees zero overlap BY CONSTRUCTION (each row gets its own
	 *     non-overlapping vertical band, and each row's column count is capped
	 *     by how many items actually fit across its chord width) rather than
	 *     via search/shrink-on-collision.
	 *
	 * @param {HTMLElement} container
	 * @param {HTMLElement[]} items
	 * @param {Object} [options]
	 * @param {number} [options.szCard] - circle diameter in px (defaults to measured container size)
	 * @param {number} [options.padding=14] - empty margin between items and the circle edge
	 * @param {number} [options.gap=8] - minimum spacing between items, horizontally and between rows
	 * @param {number|false} [options.targetCoverage=0.45] - target fraction of circle area covered by items
	 * @param {boolean|[number,number]} [options.rotate=false] - random rotation per item, see arrangeOnCircle
	 * @param {number} [options.seed]
	 * @returns {HTMLElement} container
	 */
	const n = items.length;
	if (n === 0) return container;

	const {
		padding = 14,
		gap = 8,
		targetCoverage = 0.45,
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

	// ---------------------------------------------------------------------
	// 1. Natural sizes + optional uniform area-coverage scale (same as arrangeOnCircle)
	// ---------------------------------------------------------------------
	let metrics = items.map(el => {
		const w = el.w || parseInt(el.style && el.style.width) || el.offsetWidth || 40;
		const h = el.h || parseInt(el.style && el.style.height) || el.offsetHeight || 40;
		return { el, w, h };
	});

	if (targetCoverage) {
		const circleArea = Math.PI * radius * radius;
		const targetArea = circleArea * targetCoverage;
		const currentArea = metrics.reduce((sum, m) => sum + m.w * m.h, 0) || 1;
		const scale = Math.sqrt(targetArea / currentArea);
		const maxDim = szCard / (Math.sqrt(n) * 0.9);
		metrics = metrics.map(m => {
			let w = m.w * scale, h = m.h * scale;
			if (w > maxDim || h > maxDim) {
				const capRatio = maxDim / Math.max(w, h);
				w *= capRatio; h *= capRatio;
			}
			return { ...m, w, h };
		});
	}

	const avgW = metrics.reduce((s, m) => s + m.w, 0) / n;
	const avgH = metrics.reduce((s, m) => s + m.h, 0) / n;

	// ---------------------------------------------------------------------
	// 2. Compute row capacities from real circle geometry, pick the smallest
	//    row count whose total capacity covers n items.
	// ---------------------------------------------------------------------
	function capacitiesForRows(rows) {
		const rowHeight = (2 * usableRadius) / rows;
		const pitchX = avgW + gap;
		const caps = [];
		for (let i = 0; i < rows; i++) {
			const yCenter = -usableRadius + rowHeight * (i + 0.5);
			// Half-chord at the row's nearest edge to center (worst case = top of row)
			const yEdge = Math.min(usableRadius, Math.abs(yCenter) + rowHeight / 2);
			const halfChord = Math.sqrt(Math.max(0, usableRadius * usableRadius - yEdge * yEdge));
			caps.push(Math.max(1, Math.floor((2 * halfChord) / pitchX)));
		}
		return caps;
	}

	let rows = 1;
	let caps = capacitiesForRows(rows);
	const maxRows = Math.max(2, Math.ceil((2 * usableRadius) / Math.max(avgH + gap, 1)));
	while (caps.reduce((s, c) => s + c, 0) < n && rows < maxRows) {
		rows++;
		caps = capacitiesForRows(rows);
	}

	// ---------------------------------------------------------------------
	// 3. Distribute n items across rows, biased toward the rows with the
	//    most headroom first (naturally fills the wide middle rows more,
	//    same visual pattern as the hand-tuned colarr table).
	// ---------------------------------------------------------------------
	const colarr = new Array(rows).fill(0);
	let remaining = n;
	// seed every row with 1 item first (so no row is ever empty), if we have enough
	for (let i = 0; i < rows && remaining > 0; i++) { colarr[i] = 1; remaining--; }
	while (remaining > 0) {
		let bestIdx = -1, bestHeadroom = -1;
		for (let i = 0; i < rows; i++) {
			const headroom = caps[i] - colarr[i];
			if (headroom > bestHeadroom) { bestHeadroom = headroom; bestIdx = i; }
		}
		if (bestIdx === -1 || bestHeadroom <= 0) break; // no row has room left (shouldn't happen given rows search above)
		colarr[bestIdx]++;
		remaining--;
	}
	// Any leftover (only if capacity estimate was too tight) gets appended to the largest row
	if (remaining > 0) {
		const widest = caps.indexOf(Math.max(...caps));
		colarr[widest] += remaining;
	}

	// ---------------------------------------------------------------------
	// 4. Place items row by row, left-to-right within each row, centered.
	//    Each row occupies its own non-overlapping vertical band, and each
	//    row's item count never exceeds what its chord width allows ->
	//    overlap-free by construction, no search needed.
	// ---------------------------------------------------------------------
	const rowHeight = (2 * usableRadius) / rows;
	const placed = [];
	let itemPtr = 0;
	// Largest items first, so they land in the widest (usually middle) rows
	const ordered = [...metrics].sort((a, b) => (b.w * b.h) - (a.w * a.h));

	for (let i = 0; i < rows; i++) {
		const count = colarr[i];
		if (count === 0) continue;
		const yCenter = -usableRadius + rowHeight * (i + 0.5);

		const rowItems = ordered.slice(itemPtr, itemPtr + count);
		itemPtr += count;

		const totalWidth = rowItems.reduce((s, m) => s + m.w, 0) + gap * (count - 1);
		let x = -totalWidth / 2;
		for (const m of rowItems) {
			const cx = x + m.w / 2;
			placed.push({ x: cx, y: yCenter, w: m.w, h: m.h, el: m.el });
			x += m.w + gap;
		}
	}

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

function _arrangeOnCircle(container, items, options = {}) {
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
function arrangeOnCircleGrid_NO(container, items, options = {}) {
	/**
	 * arrangeOnCircleGrid
	 * ----------------------------------------------------------------------------
	 * A generalized, deterministic version of the hand-tuned `layoutCircle`
	 * table from arrangeOnCard. Instead of a lookup table capped at n=18, row
	 * capacities are computed directly from the circle's actual chord width at
	 * each row's vertical position - the exact geometry that produced those
	 * hand-tuned numbers in the first place. This keeps the same clean,
	 * symmetric "wide middle rows, narrow top/bottom rows" look, but:
	 *   - works for ANY item count, not just 3-18
	 *   - adapts to the real circle size and real item size (no magic numbers)
	 *   - guarantees zero overlap BY CONSTRUCTION (each row gets its own
	 *     non-overlapping vertical band, and each row's column count is capped
	 *     by how many items actually fit across its chord width) rather than
	 *     via search/shrink-on-collision.
	 *
	 * @param {HTMLElement} container
	 * @param {HTMLElement[]} items
	 * @param {Object} [options]
	 * @param {number} [options.szCard] - circle diameter in px (defaults to measured container size)
	 * @param {number} [options.padding=14] - empty margin between items and the circle edge
	 * @param {number} [options.gap=8] - minimum spacing between items, horizontally and between rows
	 * @param {number|false} [options.targetCoverage=0.45] - target fraction of circle area covered by items
	 * @param {boolean|[number,number]} [options.rotate=false] - random rotation per item, see arrangeOnCircle
	 * @param {number} [options.seed]
	 * @returns {HTMLElement} container
	 */
	const n = items.length;
	if (n === 0) return container;

	const {
		padding = 14,
		gap = 8,
		targetCoverage = 0.45,
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

	// ---------------------------------------------------------------------
	// 1. Natural sizes + optional uniform area-coverage scale (same as arrangeOnCircle)
	// ---------------------------------------------------------------------
	let metrics = items.map(el => {
		const w = el.w || parseInt(el.style && el.style.width) || el.offsetWidth || 40;
		const h = el.h || parseInt(el.style && el.style.height) || el.offsetHeight || 40;
		return { el, w, h };
	});

	if (targetCoverage) {
		const circleArea = Math.PI * radius * radius;
		const targetArea = circleArea * targetCoverage;
		const currentArea = metrics.reduce((sum, m) => sum + m.w * m.h, 0) || 1;
		const scale = Math.sqrt(targetArea / currentArea);
		const maxDim = szCard / (Math.sqrt(n) * 0.9);
		metrics = metrics.map(m => {
			let w = m.w * scale, h = m.h * scale;
			if (w > maxDim || h > maxDim) {
				const capRatio = maxDim / Math.max(w, h);
				w *= capRatio; h *= capRatio;
			}
			return { ...m, w, h };
		});
	}

	const avgW = metrics.reduce((s, m) => s + m.w, 0) / n;
	const avgH = metrics.reduce((s, m) => s + m.h, 0) / n;

	// ---------------------------------------------------------------------
	// 2. Compute row capacities from real circle geometry, pick the smallest
	//    row count whose total capacity covers n items.
	// ---------------------------------------------------------------------
	function capacitiesForRows(rows) {
		const rowHeight = (2 * usableRadius) / rows;
		const pitchX = avgW + gap;
		const caps = [];
		for (let i = 0; i < rows; i++) {
			const yCenter = -usableRadius + rowHeight * (i + 0.5);
			// Half-chord at the row's nearest edge to center (worst case = top of row)
			const yEdge = Math.min(usableRadius, Math.abs(yCenter) + rowHeight / 2);
			const halfChord = Math.sqrt(Math.max(0, usableRadius * usableRadius - yEdge * yEdge));
			caps.push(Math.max(1, Math.floor((2 * halfChord) / pitchX)));
		}
		return caps;
	}

	let rows = 1;
	let caps = capacitiesForRows(rows);
	const maxRows = Math.max(2, Math.ceil((2 * usableRadius) / Math.max(avgH + gap, 1)));
	while (caps.reduce((s, c) => s + c, 0) < n && rows < maxRows) {
		rows++;
		caps = capacitiesForRows(rows);
	}

	// ---------------------------------------------------------------------
	// 3. Distribute n items across rows, biased toward the rows with the
	//    most headroom first (naturally fills the wide middle rows more,
	//    same visual pattern as the hand-tuned colarr table).
	// ---------------------------------------------------------------------
	const colarr = new Array(rows).fill(0);
	let remaining = n;
	// seed every row with 1 item first (so no row is ever empty), if we have enough
	for (let i = 0; i < rows && remaining > 0; i++) { colarr[i] = 1; remaining--; }
	while (remaining > 0) {
		let bestIdx = -1, bestHeadroom = -1;
		for (let i = 0; i < rows; i++) {
			const headroom = caps[i] - colarr[i];
			if (headroom > bestHeadroom) { bestHeadroom = headroom; bestIdx = i; }
		}
		if (bestIdx === -1 || bestHeadroom <= 0) break; // no row has room left (shouldn't happen given rows search above)
		colarr[bestIdx]++;
		remaining--;
	}
	// Any leftover (only if capacity estimate was too tight) gets appended to the largest row
	if (remaining > 0) {
		const widest = caps.indexOf(Math.max(...caps));
		colarr[widest] += remaining;
	}

	// ---------------------------------------------------------------------
	// 4. Place items row by row, left-to-right within each row, centered.
	//    Each row occupies its own non-overlapping vertical band, and each
	//    row's item count never exceeds what its chord width allows ->
	//    overlap-free by construction, no search needed.
	// ---------------------------------------------------------------------
	const rowHeight = (2 * usableRadius) / rows;
	const placed = [];
	let itemPtr = 0;
	// Largest items first, so they land in the widest (usually middle) rows
	const ordered = [...metrics].sort((a, b) => (b.w * b.h) - (a.w * a.h));

	for (let i = 0; i < rows; i++) {
		const count = colarr[i];
		if (count === 0) continue;
		const yCenter = -usableRadius + rowHeight * (i + 0.5);

		const rowItems = ordered.slice(itemPtr, itemPtr + count);
		itemPtr += count;

		const totalWidth = rowItems.reduce((s, m) => s + m.w, 0) + gap * (count - 1);
		let x = -totalWidth / 2;
		for (const m of rowItems) {
			const cx = x + m.w / 2;
			placed.push({ x: cx, y: yCenter, w: m.w, h: m.h, el: m.el });
			x += m.w + gap;
		}
	}

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
function _arrangeShapesEvenlyCircle(szCard, divs, dParent, gap = 10) {
  const padding = 10; // Extra 10px container padding
  const radius = szCard / 2;

  // 1. Create the main parent container circle
  // FIXED: Expanded physical w and h by (2 * padding) to handle the outer buffer seamlessly
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

  const numDivs = divs.length;
  if (numDivs === 0) return container;

  // =========================================================================
  // DYNAMIC AREA RESIZING ENGINE (Calculated using original interior szCard boundary)
  // =========================================================================
  const totalCircleArea = Math.PI * Math.pow(radius, 2);
  const targetElementArea = totalCircleArea * 0.42; 

  let divMetrics = divs.map((d, index) => {
    let originalW = d.w || d.offsetWidth || parseInt(d.style.width) || 40;
    let originalH = d.h || d.offsetHeight || parseInt(d.style.height) || 40;
    return { el: d, w: originalW, h: originalH, index };
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

  // 2. Generate target slots using Fermat's Spiral
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

  // ENFORCED MINIMUM GAP COLLISION CHECK
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

  // 3. Map Div elements to Target Slots
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
              el: divData.el
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

    if (!placed && targetSlots.length > 0) {
      const fallbackSlot = targetSlots.shift();
      finalizedNodes.push({
        x: fallbackSlot.x,
        y: fallbackSlot.y,
        w: divData.w * 0.7,
        h: divData.h * 0.7,
        el: divData.el
      });
    }
  });

  // 4. Position and append live HTML structures inside container frame
  finalizedNodes.forEach((node) => {
    // FIXED: Shift the left and top positioning by +padding to offset 
    // the layout from the newly expanded container borders.
    const leftPos = node.x - (node.w / 2) + padding;
    const topPos = node.y - (node.h / 2) + padding;
    
    const rotationAngle = rChoose ? rChoose([0, 5, 10, 15, 345, 350, 355]) : 0;

    mStyle(node.el, {
      position: 'absolute',
      left: leftPos,
      top: topPos,
      w: node.w,
      h: node.h,
      sz: node.w, 
      fz: node.h * 0.8,
      transform: `rotate(${rotationAngle}deg)`,
      margin: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    });

    container.appendChild(node.el);
  });

  return container;
}
function arrangeInConcentricCircles(container, items, baseRadius = 55, ringSpacing = 50) {
  const numItems = items.length;
  if (numItems === 0) return;

  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  // 1. Center Item (Index 0)
  items[0].style.position = 'absolute';
  items[0].style.left = `${centerX}px`;
  items[0].style.top = `${centerY}px`;
  items[0].style.transform = `translate(-50%, -50%)`;

  if (numItems === 1) return;

  let currentRing = 1;
  let itemsPlaced = 1;

  while (itemsPlaced < numItems) {
    // Ideal close-packing progression: 6, 12, 18, 24...
    const maxItemsInRing = currentRing * 6; 
    const itemsInThisRing = Math.min(maxItemsInRing, numItems - itemsPlaced);
    
    const currentRadius = baseRadius + (currentRing - 1) * ringSpacing;
    
    // ANGLE SHIFT MATH:
    // One full step in this ring is (2 * Math.PI / itemsInThisRing).
    // We shift by HALF of that step so items nest perfectly into the valleys of the previous layer.
    const phaseShift = Math.PI / itemsInThisRing; 

    for (let i = 0; i < itemsInThisRing; i++) {
      const item = items[itemsPlaced];
      
      // Calculate angle with the phase shift applied
      const angle = ((i / itemsInThisRing) * Math.PI * 2) + phaseShift;

      const x = centerX + currentRadius * Math.cos(angle);
      const y = centerY + currentRadius * Math.sin(angle);

      item.style.position = 'absolute';
      item.style.left = `${x}px`;
      item.style.top = `${y}px`;
      item.style.transform = `translate(-50%, -50%)`;

      itemsPlaced++;
    }

    currentRing++; 
  }
}
function arrangeItemsInSpiral(container, items, spacing = 30, tightness = 0.5, minRadius = 25) {
  const numItems = items.length;
  if (numItems === 0) return;

  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const goldenAngle = 137.5 * (Math.PI / 180); 

  items.forEach((item, index) => {
    // FIXED: Added minRadius so the innermost items don't collapse into the same central coordinate
    const r = minRadius + (tightness * spacing * Math.sqrt(index));
    const theta = index * goldenAngle;

    // Convert polar coordinates (r, theta) to Cartesian (x, y)
    const x = centerX + r * Math.cos(theta);
    const y = centerY + r * Math.sin(theta);

    item.style.position = 'absolute';
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    
    // Apply centering translation
    item.style.transform = `translate(-50%, -50%)`;
  });


}

function arrangeItemsInSpiral(container, items, spacing = 30, tightness = 0.5) {
  const numItems = items.length;
  if (numItems === 0) return;

  const rect = container.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const goldenAngle = 137.5 * (Math.PI / 180); 

  items.forEach((item, index) => {
    // Read the current item dimensions to dynamically calculate safe boundaries
    const itemW = item.offsetWidth || parseInt(item.style.width) || 24;
    const itemH = item.offsetHeight || parseInt(item.style.height) || 24;
    const baseRadius = Math.max(itemW, itemH) * 0.5;

    // PROGRESSIVE ENGINE:
    // If index is 0, it sits exactly at the center (r = 0).
    // For items 1, 2, 3... we gradually transition spacing to eliminate a wide hollow pocket.
    let adaptiveSpacing = spacing;
    if (index > 0 && index < 2) {
      // Scale down spacing for the innermost ring to bring them closer to index 0
      adaptiveSpacing = spacing * 1.5; //(0.8 + (index * 0.2)); 
    }

    // Fermat's Spiral base geometry
    let r = tightness * adaptiveSpacing * Math.sqrt(index);

    // Safety constraint: Guarantee that item 1 moves out at least by the item's physical radius
    if (index > 0 && r < baseRadius) {
      r = baseRadius + (index * 2);
    }

    const theta = index * goldenAngle;

    // Convert polar coordinates (r, theta) to Cartesian (x, y)
    const x = centerX + r * Math.cos(theta);
    const y = centerY + r * Math.sin(theta);

    item.style.position = 'absolute';
    item.style.left = `${x}px`;
    item.style.top = `${y}px`;
    
    // Smooth centering offset translation matrix
    item.style.transform = `translate(-50%, -50%)`;
  });
}
function _NOarrangeOnCard(dCard, divs, szCard = 300) {
  let n = divs.length;
  if (n === 0) return dCard;
  
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

  // 1. Better dynamic formula for base size x depending on n
  // Provides a highly responsive baseline across wide variations of element counts.
  let x = 80;
  if (n > 10) {
    x = 80 - (n - 10) * 2.5;
  } else if (n < 10) {
    x = 80 + (10 - n) * 4;
  }
  x = Math.max(35, Math.min(x, 120)); // Keep inside absolute safe constraints

  let [nth, rows, colarr] = layoutCircle(n);

  // 2. Pre-calculate layout map matrix slots to analyze horizontal alignment neighbors
  let slotAssignments = [];
  let currentIdx = 0;

  for (let i = 0; i < colarr.length; i++) {
    let rowCount = colarr[i];
    let rowSlots = [];
    for (let j = 0; j < rowCount; j++) {
      rowSlots.push({ row: i, col: j, totalInRow: rowCount, sizeType: 'normal', originalIndex: currentIdx++ });
    }
    slotAssignments.push(rowSlots);
  }

  // 3. Size harmonization engine: Enforce that elements aligning horizontally across rows are never both Large
  for (let i = 0; i < slotAssignments.length; i++) {
    let currentExRow = slotAssignments[i];
    
    // Check neighbor row below
    if (i < slotAssignments.length - 1) {
      let nextExRow = slotAssignments[i + 1];
      
      // Look for the specific "1 item aligned horizontally with center of 3 items" layout conflict pattern
      if ((currentExRow.length === 1 && nextExRow.length === 3) || (currentExRow.length === 3 && nextExRow.length === 1)) {
        let oneItemSlot = currentExRow.length === 1 ? currentExRow[0] : nextExRow[0];
        let threeItemCenterSlot = currentExRow.length === 3 ? currentExRow[1] : nextExRow[1];
        
        // Neither item should be Large. We lock them to Normal and Small respectively
        oneItemSlot.sizeType = 'small';
        threeItemCenterSlot.sizeType = 'normal';
      }
    }
  }

  // Set remaining unassigned slots safely to scatter large, normal, and small variations harmoniously
  let flatSlots = slotAssignments.flat();
  flatSlots.forEach((slot, idx) => {
    if (slot.sizeType === 'normal' && idx % 3 === 0) {
      slot.sizeType = 'large';
    } else if (slot.sizeType === 'normal' && idx % 5 === 0) {
      slot.sizeType = 'small';
    }
  });

  // Sort slots back by their original index chain to maintain structural sequence integrity during loop execution
  flatSlots.sort((a, b) => a.originalIndex - b.originalIndex);

  // 4. Render horizontal flex rows and apply calculated sizes
  let index = 0;
  for (let i = 0; i < colarr.length; i++) {
    let margin = i === 0 || i === colarr.length - 1 ? 22 : 0;
    if (colarr.length <= 2) margin = 8;

    let dr = mDom(d0, {
      flex: 1,
      w: `${100 - 2 * margin}%`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center'
    });

    for (let j = 0; j < colarr[i]; j++) {
      if (index >= n) break;
      
      let divEl = divs[index];
      let slotConfig = flatSlots[index];
      index++;

      // Apply the target harmonious size modifiers directly
      let sizeMultiplier = 1.0;
      if (slotConfig.sizeType === 'large') sizeMultiplier = 1.25;
      if (slotConfig.sizeType === 'small') sizeMultiplier = 0.75;

      let sz = x * sizeMultiplier;

      // Proportional font sizing parameters with corner clearance buffers
      let fontMultiplier = 0.8;
      if (j === colarr[i] - 1 && (i === colarr.length - 1 || i === 0)) {
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
        overflow: 'hidden',
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

function _NOarrangeOnCard(dCard, divs, szCard = 300) {
  let n = divs.length;
  if (n === 0) return dCard;
  
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

  // Dynamic base size x calculation
  let x = 80;
  if (n > 10) {
    x = 80 - (n - 10) * 2.5;
  } else if (n < 10) {
    x = 80 + (10 - n) * 4;
  }
  x = Math.max(35, Math.min(x, 120));

  let [nth, rows, colarr] = layoutCircle(n);

  // 1. Build the grid structure matrix
  let slotAssignments = [];
  let currentIdx = 0;

  for (let i = 0; i < colarr.length; i++) {
    let rowCount = colarr[i];
    let rowSlots = [];
    for (let j = 0; j < rowCount; j++) {
      rowSlots.push({ row: i, col: j, totalInRow: rowCount, sizeType: 'normal', originalIndex: currentIdx++ });
    }
    slotAssignments.push(rowSlots);
  }

  // 2. STRICT VERTICAL ALIGNMENT DETECTION (Center Collisions)
  for (let i = 0; i < slotAssignments.length - 1; i++) {
    let currentRow = slotAssignments[i];
    let nextRow = slotAssignments[i + 1];

    let currentCenterSlot = null;
    if (currentRow.length === 1) currentCenterSlot = currentRow[0];
    else if (currentRow.length % 2 !== 0) currentCenterSlot = currentRow[Math.floor(currentRow.length / 2)];

    let nextCenterSlot = null;
    if (nextRow.length === 1) nextCenterSlot = nextRow[0];
    else if (nextRow.length % 2 !== 0) nextCenterSlot = nextRow[Math.floor(nextRow.length / 2)];

    if (currentCenterSlot && nextCenterSlot) {
      currentCenterSlot.sizeType = 'small';
      nextCenterSlot.sizeType = 'small';
    }
  }

  // 3. ENFORCE TOP/BOTTOM ROW BOUNDARY CAPS
  for (let i = 0; i < slotAssignments.length; i++) {
    let rowSlots = slotAssignments[i];
    let isOuterRow = (i === 0 || i === slotAssignments.length - 1);

    for (let j = 0; j < rowSlots.length; j++) {
      let slot = rowSlots[j];
      
      if (isOuterRow) {
        // If it's a single item in the top/bottom row, make sure it stays normal or small
        if (rowSlots.length === 1) {
          if (slot.sizeType !== 'small') slot.sizeType = 'normal';
        } else {
          // If there are multiple items, make the outer edge items small to clear the circle arc
          if (j === 0 || j === rowSlots.length - 1) {
            slot.sizeType = 'small';
          } else {
            slot.sizeType = 'normal'; // Middle items of outer rows shouldn't bloat up to large either
          }
        }
      }
    }
  }

  // 4. Fill in remaining safe inner slots
  let flatSlots = slotAssignments.flat();
  flatSlots.forEach((slot, idx) => {
    // Only upgrade to large if it is completely unassigned and NOT on the top or bottom extreme rows
    if (slot.sizeType === 'normal') {
      let isOuterRow = (slot.row === 0 || slot.row === colarr.length - 1);
      if (!isOuterRow && idx % 3 === 0) {
        slot.sizeType = 'large';
      } else if (idx % 5 === 0) {
        slot.sizeType = 'small';
      }
    }
  });

  // Re-sort back to array sequencing order
  flatSlots.sort((a, b) => a.originalIndex - b.originalIndex);

  // 5. Dom rendering loop
  let index = 0;
  for (let i = 0; i < colarr.length; i++) {
    let margin = i === 0 || i === colarr.length - 1 ? 22 : 0;
    if (colarr.length <= 2) margin = 8;

    let dr = mDom(d0, {
      flex: 1,
      w: `${100 - 2 * margin}%`,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center'
    });

    for (let j = 0; j < colarr[i]; j++) {
      if (index >= n) break;
      
      let divEl = divs[index];
      let slotConfig = flatSlots[index];
      index++;

      let sizeMultiplier = 1.0;
      if (slotConfig.sizeType === 'large') sizeMultiplier = 1.25;
      if (slotConfig.sizeType === 'small') sizeMultiplier = 0.75;

      let sz = x * sizeMultiplier;

      // Extra font size correction for corner-most elements
      let fontMultiplier = 0.8;
      if (j === colarr[i] - 1 && (i === colarr.length - 1 || i === 0)) {
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
        overflow: 'hidden',
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



//#endregion


//#region chatgpt 2
function tangentCandidates(box, placed, padding = 8, stepDeg = 8) {

	let candidates = [];

	const r = boundingRadius(box);

	for (const other of placed) {

		const ro = boundingRadius(other);

		const dist = r + ro + padding;

		for (let a = 0; a < 360; a += stepDeg) {

			const ang = rad(a);

			candidates.push({
				x: other.x + dist * Math.cos(ang),
				y: other.y + dist * Math.sin(ang)
			});

		}
	}

	return candidates;

}
//--------------------------------------------------------------
// circle intersection
//--------------------------------------------------------------

function circleIntersections(x0, y0, r0, x1, y1, r1) {

    const dx = x1 - x0;
    const dy = y1 - y0;

    const d = Math.hypot(dx, dy);

    if (d > r0 + r1) return [];
    if (d < Math.abs(r0 - r1)) return [];
    if (d === 0) return [];

    const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);

    const h2 = r0 * r0 - a * a;

    if (h2 < 0) return [];

    const h = Math.sqrt(h2);

    const xm = x0 + a * dx / d;
    const ym = y0 + a * dy / d;

    const rx = -dy * h / d;
    const ry = dx * h / d;

    return [

        {
            x: xm + rx,
            y: ym + ry
        },

        {
            x: xm - rx,
            y: ym - ry
        }

    ];

}
//#endregion


//#region chatgpt 1

function arrangePackedCircle(container, items, options = {}) {

	const padding = options.padding ?? 8;
	const border = options.borderPadding ?? 12;
	const spiralStep = options.spiralStep ?? 5;
	const maxCandidates = options.maxCandidates ?? 6000;
	const relaxIterations = options.relaxIterations ?? 50;

	container.style.position = 'relative';

	const rect = container.getBoundingClientRect();

	const cx = rect.width / 2;
	const cy = rect.height / 2;
	const R = Math.min(rect.width, rect.height) / 2;

	//------------------------------------------------------------
	// build boxes
	//------------------------------------------------------------

	let boxes = items.map(makeBox);

	//------------------------------------------------------------
	// largest first
	//------------------------------------------------------------

	boxes.sort((a, b) => (b.w * b.h) - (a.w * a.h));

	//------------------------------------------------------------
	// candidate generator
	//------------------------------------------------------------

	const golden = Math.PI * (3 - Math.sqrt(5));

	function candidate(i) {

		let r = spiralStep * Math.sqrt(i);

		let a = i * golden;

		return {
			x: cx + r * Math.cos(a),
			y: cy + r * Math.sin(a)
		};

	}

	//------------------------------------------------------------
	// initial placement
	//------------------------------------------------------------

	let placed = [];

	for (let box of boxes) {

		let found = false;

		for (let k = 0; k < maxCandidates && !found; k++) {

			let p = candidate(k);

			box.x = p.x;
			box.y = p.y;

			if (!insideCircle(box, cx, cy, R, border))
				continue;

			let hit = false;

			for (let other of placed) {

				if (boxesOverlap(box, other, padding)) {
					hit = true;
					break;
				}

			}

			if (!hit) {
				placed.push(box);
				found = true;
			}

		}

		//--------------------------------------------------------
		// local search if spiral failed
		//--------------------------------------------------------

		if (!found) {

			outer:

			for (let rr = 5; rr < 100; rr += 5) {

				for (let a = 0; a < 360; a += 10) {

					let ang = rad(a);

					box.x = cx + rr * Math.cos(ang);
					box.y = cy + rr * Math.sin(ang);

					if (!insideCircle(box, cx, cy, R, border))
						continue;

					let hit = false;

					for (let other of placed) {

						if (boxesOverlap(box, other, padding)) {
							hit = true;
							break;
						}

					}

					if (!hit) {

						placed.push(box);
						found = true;
						break outer;

					}

				}

			}

		}

	}

	//------------------------------------------------------------
	// relaxation
	//------------------------------------------------------------

	for (let iter = 0; iter < relaxIterations; iter++) {

		for (let i = 0; i < placed.length; i++) {

			let A = placed[i];

			for (let j = i + 1; j < placed.length; j++) {

				let B = placed[j];

				if (!boxesOverlap(A, B, padding))
					continue;

				let dx = B.x - A.x;
				let dy = B.y - A.y;

				let d = Math.hypot(dx, dy);

				if (d < 0.001) {
					dx = Math.random() - .5;
					dy = Math.random() - .5;
					d = Math.hypot(dx, dy);
				}

				dx /= d;
				dy /= d;

				let push = 1.2;

				A.x -= dx * push;
				A.y -= dy * push;

				B.x += dx * push;
				B.y += dy * push;

			}

		}

		//--------------------------------------------
		// pull toward center
		//--------------------------------------------

		for (let b of placed) {

			b.x += (cx - b.x) * 0.015;
			b.y += (cy - b.y) * 0.015;

			//----------------------------------------
			// keep inside boundary
			//----------------------------------------

			let rr = boundingRadius(b);

			let dx = b.x - cx;
			let dy = b.y - cy;

			let d = Math.hypot(dx, dy);

			let limit = R - border - rr;

			if (d > limit) {

				b.x = cx + dx * limit / d;
				b.y = cy + dy * limit / d;

			}

		}

	}

	//------------------------------------------------------------
	// render
	//------------------------------------------------------------

	for (let b of placed) {

		b.el.style.position = "absolute";
		b.el.style.left = (b.x - b.w / 2) + "px";
		b.el.style.top = (b.y - b.h / 2) + "px";
		b.el.style.transform = `rotate(${b.angle * 180 / Math.PI}deg)`;

	}

}

//======================================================================
// Geometry
//======================================================================

function rad(deg) {
	return deg * Math.PI / 180;
}

function rotatePoint(x, y, a) {
	let c = Math.cos(a);
	let s = Math.sin(a);
	return {
		x: x * c - y * s,
		y: x * s + y * c
	};
}

function getRotation(el) {
	let m = (el.style.transform || '').match(/rotate\(([-0-9.]+)deg\)/);
	return m ? rad(parseFloat(m[1])) : 0;
}

//------------------------------------------------------------------
// rotated rectangle
//------------------------------------------------------------------

function makeBox(el) {

	let w =
		el.offsetWidth ||
		parseFloat(el.style.width) ||
		40;

	let h =
		el.offsetHeight ||
		parseFloat(el.style.height) ||
		40;

	return {
		el,
		w,
		h,
		angle: getRotation(el),
		x: 0,
		y: 0
	};
}

function getCorners(box) {

	let hw = box.w / 2;
	let hh = box.h / 2;

	let pts = [
		{ x: -hw, y: -hh },
		{ x: hw, y: -hh },
		{ x: hw, y: hh },
		{ x: -hw, y: hh }
	];
	let c = Math.cos(box.angle);
	let s = Math.sin(box.angle);

	return pts.map(p => {

		return {
			x: box.x + p.x * c - p.y * s,
			y: box.y + p.x * s + p.y * c
		};

	});

}

function edgeNormal(a, b) {

	let dx = b.x - a.x;
	let dy = b.y - a.y;

	let len = Math.hypot(dx, dy);

	return {
		x: -dy / len,
		y: dx / len
	};

}

function project(poly, axis) {

	let min = Infinity;
	let max = -Infinity;

	for (let p of poly) {

		let d = p.x * axis.x + p.y * axis.y;

		if (d < min) min = d;
		if (d > max) max = d;

	}

	return { min, max };

}

//------------------------------------------------------------------
// SAT collision
//------------------------------------------------------------------

function boxesOverlap(a, b, padding = 0) {

	let pa = getCorners(a);
	let pb = getCorners(b);

	let axes = [];

	for (let i = 0; i < 4; i++)
		axes.push(edgeNormal(pa[i], pa[(i + 1) % 4]));

	for (let i = 0; i < 4; i++)
		axes.push(edgeNormal(pb[i], pb[(i + 1) % 4]));

	for (let axis of axes) {

		let A = project(pa, axis);
		let B = project(pb, axis);

		if (A.max + padding < B.min) return false;
		if (B.max + padding < A.min) return false;

	}

	return true;

}

//------------------------------------------------------------------
// distance from center to furthest corner
//------------------------------------------------------------------

function boundingRadius(box) {

	return Math.sqrt(
		box.w * box.w +
		box.h * box.h
	) / 2;

}

//------------------------------------------------------------------
// inside circular boundary
//------------------------------------------------------------------

function insideCircle(box, cx, cy, R, border = 8) {

	let pts = getCorners(box);

	for (let p of pts) {

		let d = Math.hypot(
			p.x - cx,
			p.y - cy
		);

		if (d > R - border)
			return false;

	}

	return true;

}

//#endregion


//#region chatgpt 0
function arrangePackedCircle1(container, items, opts = {}) {

	const padding = opts.padding ?? 8;
	const border = opts.borderPadding ?? 12;
	const iterations = opts.iterations ?? 40;

	const rect = container.getBoundingClientRect();
	const cx = rect.width / 2;
	const cy = rect.height / 2;
	const R = Math.min(rect.width, rect.height) / 2 - border;

	//------------------------------------------------------------------
	// Collect geometry
	//------------------------------------------------------------------

	const nodes = items.map(item => {

		let w = item.offsetWidth || parseFloat(item.style.width) || 40;
		let h = item.offsetHeight || parseFloat(item.style.height) || 40;

		let rot = 0;

		const m = item.style.transform.match(/rotate\(([-0-9.]+)deg\)/);
		if (m) rot = parseFloat(m[1]);

		return {
			el: item,
			w,
			h,
			rot,
			r: Math.sqrt(w * w + h * h) / 2,
			x: 0,
			y: 0
		};
	});

	//------------------------------------------------------------------
	// largest first
	//------------------------------------------------------------------

	nodes.sort((a, b) => b.r - a.r);

	//------------------------------------------------------------------
	// candidate spiral
	//------------------------------------------------------------------

	const golden = Math.PI * (3 - Math.sqrt(5));

	function candidate(k) {

		const r = R * Math.sqrt((k + 0.5) / (nodes.length * 8));

		const a = k * golden;

		return {
			x: cx + r * Math.cos(a),
			y: cy + r * Math.sin(a)
		};
	}

	//------------------------------------------------------------------
	// quick collision
	//------------------------------------------------------------------

	function collide(a, b) {

		const dx = a.x - b.x;
		const dy = a.y - b.y;

		const d = Math.sqrt(dx * dx + dy * dy);

		return d < (a.r + b.r + padding);
	}

	//------------------------------------------------------------------
	// inside circle
	//------------------------------------------------------------------

	function inside(node) {

		const dx = node.x - cx;
		const dy = node.y - cy;

		return Math.sqrt(dx * dx + dy * dy) + node.r <= R;
	}

	//------------------------------------------------------------------
	// initial placement
	//------------------------------------------------------------------

	let placed = [];

	for (let n of nodes) {

		let ok = false;

		for (let k = 0; k < 5000 && !ok; k++) {

			const p = candidate(k);

			n.x = p.x;
			n.y = p.y;

			if (!inside(n)) continue;

			let hit = false;

			for (let q of placed) {

				if (collide(n, q)) {
					hit = true;
					break;
				}
			}

			if (!hit) {

				placed.push(n);
				ok = true;
			}
		}

		if (!ok) {

			// emergency
			n.x = cx;
			n.y = cy;
			placed.push(n);

		}

	}

	//------------------------------------------------------------------
	// relaxation
	//------------------------------------------------------------------

	for (let iter = 0; iter < iterations; iter++) {

		for (let i = 0; i < placed.length; i++) {

			let a = placed[i];

			for (let j = i + 1; j < placed.length; j++) {

				let b = placed[j];

				let dx = b.x - a.x;
				let dy = b.y - a.y;

				let d = Math.sqrt(dx * dx + dy * dy);

				if (d < 0.001) d = 0.001;

				let target = a.r + b.r + padding;

				if (d < target) {

					let push = (target - d) / 2;

					dx /= d;
					dy /= d;

					a.x -= dx * push;
					a.y -= dy * push;

					b.x += dx * push;
					b.y += dy * push;
				}
			}
		}

		// pull gently toward center

		for (let n of placed) {

			n.x += (cx - n.x) * 0.015;
			n.y += (cy - n.y) * 0.015;

			// keep inside

			let dx = n.x - cx;
			let dy = n.y - cy;

			let d = Math.sqrt(dx * dx + dy * dy);

			let limit = R - n.r;

			if (d > limit) {

				n.x = cx + dx * limit / d;
				n.y = cy + dy * limit / d;
			}
		}
	}

	//------------------------------------------------------------------
	// render
	//------------------------------------------------------------------

	for (let n of placed) {

		n.el.style.position = "absolute";
		n.el.style.left = (n.x - n.w / 2) + "px";
		n.el.style.top = (n.y - n.h / 2) + "px";

		n.el.style.transform = `rotate(${n.rot}deg)`;
	}

}

//#endregion

function spotit() {
	function setup(table) {
		let fen = table.fen = {};
		let options = table.options;
		let plNames = Object.keys(table.players);
		for (const name in table.players) {
			let pl = table.players[name];
			pl.score = 0;
		}
		table.plorder = jsCopy(plNames);
		//arrShuffle(table.plorder);
		table.turn = [table.plorder[0]];
		fen.movetype = 'turn';
		fen.stage = 'init';
		[fen.items, fen.shared, fen.extras] = spotitSetupCardsAdaptive(table);
		//conslog(fen.shared);
		//INTERRUPT();
	}
	async function process(uname, table, movedata) {
		if (table.fen.stage === 'init' && movedata == 'start') {
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
			else if (success){
				[fen.items, fen.shared, fen.extras] = spotitSetupCards(table);
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

		let ui = { dTable, cards: [] };

		let dt = dTable;
		mLinebreak(dt, 10);
		for (let i = 0; i < table.options.num_cards; i++) {

			//console.log(fen.stage);
			if (fen.stage === 'init') {
				let card = cRound(dt, { w: 300, h: 300, margin: 20 });
				card.faceUp = true;
				//console.log(card);
				face_down(card, GREEN, 'food1.png');
				continue;
			}

			let els = fen.items[i].zipped;
			//console.log(els);

			//let syms = spotitSyms(els);
			let n = options.adaptive == 'yes' ? cal_num_syms_adaptive(me,table) : options.num_symbols;

			let [container, syms] = plotSymbols(300, els.slice(0, n), dt, gap = 10);
			let uiCard = { container, syms };
			mClass(container, 'card');
			mStyle(container,{border: '2px solid grey'});
			uiCard.div = container;
			ui.cards.push(uiCard);
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
			ui.dButton.onclick = () => { rsgEval(me, me, table, ui, { div: ui.dButton, key: 'start' }); }
		} else {
			//console.log(ui.cards)
			for (let i = 0; i < ui.cards.length; i++) {
				let card = ui.cards[i];
				for (let j = 0; j < card.syms.length; j++) {
					let sym = card.syms[j];
					let dSym = iDiv(sym);
					dSym.setAttribute('key', sym.key)
					mStyle(dSym, { cursor: 'pointer' });
					ignoreDoubleClick(dSym, () => rsgEval(me, me, table, ui, { div: dSym, key: sym.key }));
				};
			}
			//ignoreDoubleClick(ui.dButton, () => rsgEval(me, me, table, ui));
		}
		//stdBotMoves(bot => rsgEval(bot, me, table, ui), table);
	}
	async function rsgEval(uname, me, table, ui, o) {
		stdEvalShield();
		if (uname == me) {
			toggleItemSelection(o.div);
		}
		let moveSent = await process(uname, table, o.key);
		if (moveSent) await updateMain(true);
		DA.isProcessingMove = false;
	}

	return { setup, activate, present, process };
}

async function spotitProcessNoMinus(me, table, movedata) {
	if (table.fen.stage === 'init' && movedata == 'start') {
		let newTable = gtCopy(table);
		newTable.turn = jsCopy(newTable.plorder);
		newTable.fen.stage = newTable.stage = 'move';
		await tableSaveUpdate(newTable);
		return true;
	} else if (table.fen.shared.includes(movedata)) {
		//success!
		let newTable = gtCopy(table);

		console.log(`${me} clicked a ${movedata}!!!`);
		newTable.players[me].score += 1;
		[newTable.fen.items, newTable.fen.shared] = spotitSetupCards(newTable);
		await tableSaveUpdateFS(newTable);
		return true;

	} else {
		return false;
	}
}
function _spotitSetupCards(table) {
	let options = table.options;
	//console.log('HALLO')
	let num_cards = valf(options.num_cards, 2);
	let num_symbols = valf(options.num_symbols, 7); //options.adaptive == 'yes' ? 14 : valf(options.num_symbols, 7),
	let n = num_symbols;
	let vocab = valf(options.vocab, 'best');
	let [group, wild] = vocab == 'best' ? ['special', 'best*'] : vocab == 'nature' ? ['special', 'lifeplus'] : vocab == 'object' ? ['special', 'objectplus'] : ['animals_nature', 'anim*'];
	let list = Object.keys(M.emogroup[group]);
	let subgroups = matchWildcardArray(wild, list);
	let keypool = subgroups.map(x => M.emogroup[group][x]).flat();

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

	for (const info of infos) {
		let n = info.keys.length;
		let arr = arrRepeat([.5, 1, .5, 1, .75], Math.ceil(n / 5));
		arrShuffle(arr); //console.log(arr);
		info.scales = info.keys.map((x, i) => arr[i]); //chooseRandom([0.5, .65, 0.75, .8, 1, 1, 1, 1.1, 1.15, 1.2, 1.3,]));
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


}
function face_down(item, color) {
	if (!item.faceUp) return;
	if (nundef(color)) color = item.color; else item.color = color;
	let svgCode = item.svgDown;
	if (nundef(svgCode)) {
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
	}
	item.div.innerHTML = svgCode;
	item.faceUp = false;
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

function spotit() {
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
		fen.stage = 'init';
		fen.items = spotitSetupCards(table);
		//console.log('fen.items', fen.items);
		// let me = U.name;
		// fen.items = spotit_item_fen(table);
		// console.log('fen.items',fen.items)
		// if (nundef(options.mode)) options.mode = 'multi';
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
		stdStatsScore(me, table, { allowUserSwitch: true });
		let fen = table.fen;

		let ui = { dTable };

		let dt = dTable;
		mLinebreak(dt, 10);
		ui.cards = [];
		for (let i = 0; i < table.options.num_cards; i++) {

			//console.log(fen.stage);
			if (fen.stage === 'init') {
				let card = cRound(dt, { w: 300, h: 300, margin: 20 });
				card.faceUp = true;
				//console.log(card);
				face_down(card, GREEN, 'food');
				continue;
			}

			let els = fen.items[i].zipped;
			//console.log(els);

			let syms = spotitSyms(els);
			let dCard = arrangeShapesEvenlyCircle(300, syms, dt, gap = 10);
			let uiCard = jsCopy(fen.items[i]);
			uiCard.div = dCard;
			ui.cards.push(uiCard);
		}
		return { dTable, ui };
	}
	async function activate(me, table, ui) {
		console.log('activate');
		let { myTurn, spectating } = stdInstruction(me, table);
		if (spectating) return;
		if (myTurn && table.fen.stage === 'init') {
			ui.dButton = mDom(ui.dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: 'START!' });
			//ui.dButton.disabled = true;
		} else {
			//ignoreDoubleClick(ui.dButton, () => rsgEvalButton(me, me, table, ui));
		}
		//stdBotMoves(bot => rsgEvalButton(bot, me, table, ui), table);
	}
	function stats(dParent) { spotit_stats(dParent); }
	function activate_ui() { spotit_activate(); }
	return { setup, activate, present, process };
}


function spotit_present(dt, me, table, ui) {
	let fen = table.fen;
	let stage = fen.stage;

	mLinebreak(dt, 10);

	// 1. Generate the symbol data directly using your custom asset extraction snippet
	let n = 8;
	let group = 'animals_nature';
	let list = Object.keys(M.emogroup[group]);

	// Use our wildcard filter to discover all animal subgroups
	let subgroups = matchWildcardArray('animal*', list);
	let keypool = subgroups.map(x => M.emogroup[group][x]).flat();

	let keys = rChoose(keypool, n);
	let scaleList = [.6, .75, 1];
	let scales = keys.map(x => rChoose(scaleList));
	let uniformSize = 40;

	let els = [];
	for (const i of range(n)) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = uniformSize * scale;
		els[i] = { scale, w: sz, h: sz, bg: 'transparent', key };
	}

	// 2. Synthesize a layout wrapper item mimicking a card state record
	let mockItem = {
		id: getUID ? getUID() : 'card_' + Date.now(),
		keys: els.map(x => x.key),
		scales: els.map(x => x.scale),
		index: 0,
		numSyms: n
	};

	// 3. First step: Make the card using spotit_card
	// We temporarily pass empty layout tracking metrics since we will rearrange them using calc_syms next
	mockItem.rows = 0;
	mockItem.cols = 0;
	mockItem.colarr = [];

	let card = spotit_card(mockItem, dt, { margin: 20 }, spotit_interact);

	// 4. Second step: Compute the target structure layout using calc_syms
	let [rows, realrows, colarr] = calc_syms(n);

	// Update the properties on the card tracking metadata payload
	card.rows = rows;
	card.realrows = realrows;
	card.colarr = colarr;

	// Initialize table tracking parameters
	fen.cards = [card];

	if (stage === 'init' || fen.stage === 'init') {
		face_down(card, GREEN, 'food');
	}

	mLinebreak(dt, 10);
	console.log('Finalized fen cards:', fen.cards);
}

function arrangeOnCard0(dParent, divs, szCard = 300) {
	let n = divs.length;
	const padding = 10; // 10px outer cushion padding constraint

	// 1. Create the main round card container with the padded dimensions
	let card = cRound(dParent, {
		border: 'solid #ccc 3px',
		w: szCard + (padding * 2),
		h: szCard + (padding * 2),
		margin: 20
	});
	let dCard = iDiv(card);

	mStyle(dCard, { padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' });

	// 2. Set up internal rows alignment grid panel (sized to the base interior width)
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

	// Use colarr.length to safely step over the returned blueprint rows count
	for (let i of range(colarr.length)) {
		let margin = i == 0 || i == colarr.length - 1 ? 22 : 4;
		if (colarr.length <= 2) margin = 8;

		let dr = mDom(d0, {
			flex: 1, // Distribute rows with clean, vertical equality
			w: `${100 - 2 * margin}%`,
			display: 'flex',
			justifyContent: 'space-around',
			alignItems: 'center'
		});

		for (let j of range(colarr[i])) {
			if (index >= n) break;
			let divEl = divs[index++];

			// Read current base sizing of the incoming live div or fallback
			let originalSz = divEl.w || divEl.offsetWidth || parseInt(divEl.style.width) || 50;
			let sz = szCard * (originalSz / 50) / nth;

			// Calculate font multiplier based on row boundaries (safeguard wide glyph breakout)
			let fontMultiplier = 0.8;
			if (j == colarr[i] - 1 && (i == colarr.length - 1 || i == 0)) {
				fontMultiplier = 0.68;
			}
			let fz = sz * fontMultiplier;

			// Update styles directly on the live element div
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
				overflow: 'hidden',
				textOverflow: 'contain'
			});

			// Maintain inner element sizing constraints
			let dIcon = divEl.firstChild || divEl;
			if (dIcon && dIcon.style) {
				dIcon.style.maxWidth = '100%';
				dIcon.style.maxHeight = '100%';
			}

			// Append live HTML div structure directly inside row strip
			dr.appendChild(iDiv ? iDiv(divEl) : divEl);
		}
	}
	return card;
}

function spotitSyms1(els) {
	let index = 0;
	let n = els.length;
	let szBase = 50;
	let dr = mDom(null, { w: 100, h: 100, bg: 'blue' });
	let syms = [];
	for (let j of range(n)) {
		let el = els[index++]; //console.log(el); return;
		let sz = szBase * els.scale;
		let symStyles = {
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,
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

		syms.push(sym);
	}
	return syms;
}

function arrangeShapesEvenlyCircle(containerSize, rectangles, dParent, gap = 10) {
	const radius = containerSize / 2;

	// 1. Create the main parent container circle
	let container = mDom(dParent, { position: 'relative', w: containerSize, h: containerSize, round: true, bg: '#f9f9f9', overflow: 'hidden', border: '2px solid #333', display: 'inline-block', margin: 10 });

	const numRects = rectangles.length;
	if (numRects === 0) return container;

	// =========================================================================
	// DYNAMIC AREA RESIZING ENGINE
	// =========================================================================
	const totalCircleArea = Math.PI * Math.pow(radius, 2);
	// Re-optimized target area coverage factor to 42%
	const targetElementArea = totalCircleArea * 0.42;

	let currentTotalArea = rectangles.reduce((sum, r) => sum + (r.w * r.h), 0);
	let idealScaleFactor = Math.sqrt(targetElementArea / currentTotalArea);

	const maxAllowedDimension = containerSize / (Math.sqrt(numRects) * 0.95);

	const scaledRectangles = rectangles.map(r => {
		let w = r.w * idealScaleFactor;
		let h = r.h * idealScaleFactor;

		if (w > maxAllowedDimension || h > maxAllowedDimension) {
			const capRatio = maxAllowedDimension / Math.max(w, h);
			w *= capRatio;
			h *= capRatio;
		}

		return { ...r, w, h };
	});

	// 2. Generate target slots using Fermat's Spiral
	const targetSlots = [];
	const goldenAngle = 137.5 * (Math.PI / 180);
	// Let target slots sit closer to the edge by minimizing baseline border padding
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

	const sortedRects = [...scaledRectangles].sort((a, b) => (b.w * b.h) - (a.w * a.h));
	const finalizedNodes = [];

	// ENFORCED MINIMUM GAP COLLISION CHECK
	function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2, requiredGap) {
		const boxOverlap = !(x1 + w1 / 2 + requiredGap < x2 - w2 / 2 ||
			x1 - w1 / 2 - requiredGap > x2 + w2 / 2 ||
			y1 + h1 / 2 + requiredGap < y2 - h2 / 2 ||
			y1 - h1 / 2 - requiredGap > y2 + h2 / 2);

		if (!boxOverlap) return false;

		// Use exact diagonal radius checks plus the strict gap padding constraint
		const r1 = Math.hypot(w1 / 2, h1 / 2);
		const r2 = Math.hypot(w2 / 2, h2 / 2);
		const distance = Math.hypot(x2 - x1, y2 - y1);

		return distance < (r1 + r2 + requiredGap);
	}

	// 3. Map Rectangles to Target Slots
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
			const maxLocalShift = containerSize * 0.35; // Increased shift tolerance to explore edge openings

			while (localRadius < maxLocalShift && !placed) {
				const microSteps = localRadius === 0 ? 1 : 20; // High angular resolution scanning
				for (let a = 0; a < microSteps; a++) {
					const microAngle = (a / microSteps) * Math.PI * 2;
					const testX = slot.x + localRadius * Math.cos(microAngle);
					const testY = slot.y + localRadius * Math.sin(microAngle);

					// CRITICAL FIX: Optimizing boundary constraints so elements can safely approach the perimeter
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
							bg: rectData.bg || 'transparent',
							key: rectData.key,
						});
						targetSlots.splice(s, 1);
						placed = true;
						break;
					}
				}
				localRadius += 1; // High resolution linear shift scanning
			}
			if (placed) break;
		}

		// Fallback placement if space runs out
		if (!placed && targetSlots.length > 0) {
			const fallbackSlot = targetSlots.shift();
			finalizedNodes.push({
				x: fallbackSlot.x,
				y: fallbackSlot.y,
				w: rectData.w * 0.7,
				h: rectData.h * 0.7,
				bg: rectData.bg || 'transparent',
				key: rectData.key,
			});
		}
	});

	// 4. Render to the DOM
	finalizedNodes.forEach((node) => {
		const leftPos = node.x - (node.w / 2);
		const topPos = node.y - (node.h / 2);
		console.log('size', node.w, node.h)
		mKey(node.key, container, {
			transform: `rotate(${rChoose([0, 5, 10, 15, 345, 350, 355])}deg)`,
			position: 'absolute',
			left: leftPos,
			top: topPos,
			rounding: 8,
			w: node.w,
			h: node.h,
			bg: node.bg,
			fz: node.h * 0.8,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			margin: 'auto'
		}, { key: node.key });
	});

	return container;
}

function arrangeShapesEvenlyCircle2(szCard, divs, dParent, gap = 10) {
	const radius = szCard / 2;

	// 1. Create the main parent container circle
	let container = mDom(dParent, { position: 'relative', w: szCard, h: szCard, round: true, bg: '#f9f9f9', overflow: 'hidden', border: '2px solid #333', display: 'inline-block', margin: 10 });

	const numDivs = divs.length;
	if (numDivs === 0) return container;

	// =========================================================================
	// DYNAMIC AREA RESIZING ENGINE
	// =========================================================================
	const totalCircleArea = Math.PI * Math.pow(radius, 2);
	const targetElementArea = totalCircleArea * 0.42;

	// Map incoming divs to structure metrics objects by checking their existing dimensions
	let divMetrics = divs.map((d, index) => {
		// Read your custom framework dictionary layout sizes or fallback to offset parameters
		let originalW = d.w || d.offsetWidth || parseInt(d.style.width) || 40;
		let originalH = d.h || d.offsetHeight || parseInt(d.style.height) || 40;
		return { el: d, w: originalW, h: originalH, index };
	});

	let currentTotalArea = divMetrics.reduce((sum, d) => sum + (d.w * d.h), 0); console.log(currentTotalArea);
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

	// 2. Generate target slots using Fermat's Spiral
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

	// ENFORCED MINIMUM GAP COLLISION CHECK
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

	// 3. Map Div elements to Target Slots
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
							el: divData.el
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

		// Fallback placement if space runs out
		if (!placed && targetSlots.length > 0) {
			const fallbackSlot = targetSlots.shift();
			finalizedNodes.push({
				x: fallbackSlot.x,
				y: fallbackSlot.y,
				w: divData.w * 0.7,
				h: divData.h * 0.7,
				el: divData.el
			});
		}
	});

	// 4. Position and append live HTML structures inside container frame
	finalizedNodes.forEach((node) => {
		const leftPos = node.x - (node.w / 2);
		const topPos = node.y - (node.h / 2);

		const rotationAngle = rChoose ? rChoose([0, 5, 10, 15, 345, 350, 355]) : 0;

		// Apply absolute placement updates over the existing live element
		mStyle(node.el, {
			position: 'absolute',
			left: leftPos,
			top: topPos,
			w: node.w,
			h: node.h,
			sz: node.w, // Ensure uniform structural tags match framework shapes
			fz: node.h * 0.8,
			transform: `rotate(${rotationAngle}deg)`,
			margin: 'auto',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center'
		});

		// Append node child tree into the output layout circle container
		container.appendChild(iDiv ? iDiv(node.el) : node.el);
	});

	return container;
}


async function createSymbols(n, uniformSize, scaleList, group, subgroupRegex) {

	await loadAssetsStaticPreload();
	let list = Object.keys(M.emogroup[group]);
	let subgroups = matchWildcardArray(subgroupRegex, list);
	let keypool = subgroups.map(x => M.emogroup[group][x]).flat();
	let keys = rChoose(keypool, n);
	let scales = keys.map(x => rChoose(scaleList));

	let els = [];
	for (const i of range(n)) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = uniformSize * scale;
		els[i] = { key, sz, scale };
	}

	return els;
}


function __spotit_setup(players, options) {
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
	function spotit_item_fen(options) {
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
	function spotit_create_sample(numCards, numSyms, vocab, lang, min_scale, max_scale) {
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
	function calc_syms(numSyms) {

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

	let fen = { players: {}, plorder: jsCopy(players), turn: [players[0]], stage: 'init', phase: '' };
	for (const plname of players) {
		fen.players[plname] = {
			score: 0, name: plname, color: get_user_color(plname),
		};
	}
	fen.items = spotit_item_fen(options);
	if (nundef(options.mode)) options.mode = 'multi';
	return fen;
}
function __spotit_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);

	function cal_num_syms_adaptive() {
		let [uplayer, fen] = [Z.uplayer, Z.fen];
		let pl = fen.players[uplayer];
		pl.score = get_player_score(pl.name);

		//sort players by score
		let by_score = dict2list(fen.players);
		for (const pl of by_score) { pl.score = get_player_score(pl.name); }

		//calculate average score in by_score array
		let avg_score = 0;
		for (const pl of by_score) { avg_score += pl.score; }
		avg_score /= by_score.length;

		let di = { nasi: -3, gul: -3, sheeba: -2, mimi: -1, annabel: 1 };

		let baseline = valf(di[uplayer], 0);
		let dn = baseline + Math.floor(pl.score - avg_score);

		//console.log('uplayer',uplayer,'baseline', baseline, 'avg', avg_score, 'pl.score', pl.score, 'dn', dn);

		let n = Z.options.num_symbols;

		//n+dn should be at least 4 and at most 14
		let nfinal = Math.max(4, Math.min(14, dn + n));
		return nfinal;
		//if (n + dn < 4) { dn = 4 - n; }
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
	function spotit_card(info, dParent, cardStyles, onClickSym) {
		Card.sz = 300;
		copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);
		let card = cRound(dParent, cardStyles, info.id);

		addKeys(info, card);
		card.faceUp = true;
		//console.log('card', card);
		//let d = iDiv(card);
		let zipped = [];
		for (let i = 0; i < card.keys.length; i++) {
			zipped.push({ key: card.keys[i], scale: card.scales[i] });
		}
		card.pattern = fillColarr(card.colarr, zipped);

		// symSize: abhaengig von rows
		let symStyles = { sz: Card.sz / (card.rows + 1), fg: 'random', hmargin: 10, vmargin: 6, cursor: 'pointer' };

		let syms = [];
		mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
		for (let i = 0; i < info.keys.length; i++) {
			let key = card.keys[i];
			let sym = syms[i];
			//console.log('key', key,'sym',sym);
			card.live[key] = sym;
			sym.setAttribute('key', key);
			sym.onclick = ev => onClickSym(ev, key); //ev, sym, key, card);
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

	//let pldata = Z.playerdata;
	spotit_read_all_scores();

	let dt = dOpenTable; clearElement(dt); mCenterFlex(dt);

	spotit_stats(dt);

	mLinebreak(dt, 10);

	//console.log('fen.items', fen.items); //ex.: 'bird:0.5 shark:0.75 rat:0.75 dragon:0.5 bat:0.5 tomato:0.5 basket:1.2,crown:1.2 rocket:0.75 shark:1 tangerine:1 ladybug:1 owl:1.2 fly:1.2'
	let ks_for_cards = fen.items.split(',');
	let numCards = ks_for_cards.length;
	let items = Z.items = [];
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

	Z.cards = [];
	let is_adaptive = Z.options.adaptive == 'yes';
	let nsyms = is_adaptive ? cal_num_syms_adaptive() : Z.options.num_symbols;

	for (const item of items) {
		//an item is a card

		//adaptive mode
		if (is_adaptive) { modify_item_for_adaptive(item, items, nsyms); }

		let card = spotit_card(item, dt, { margin: 20, padding: 10 }, spotit_interact);
		Z.cards.push(card);

		if (Z.stage == 'init') {
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



function spotitCardEvenly(dParent, els, szCard = 300) {
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


function showPics1(dParent, keys, numRows, numCols, uniformSize) {
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
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

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
			bg: 'red',
			w100: true,
			h100: true,
			box: true,
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
		};

		let d1 = mKey(key, d2, styles, { key });

		// Drill into the target child node icon element and force absolute alignment clustering
		let dIcon = d1.firstChild || d1; //console.log(dIcon,dIcon.style)
		if (dIcon && dIcon.style) {
			dIcon.style.width = `${sz}px`;
			dIcon.style.height = `${sz}px`;
			dIcon.style.fontSize = `${sz * 0.8}px`;
			dIcon.style.display = 'flex';
			dIcon.style.alignItems = 'center';
			dIcon.style.justifyContent = 'center';
			dIcon.style.margin = 'auto'; // Locks position right in the core center point
		}

		renderedElements.push(d1);
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

function spotitCard(dParent, els, szCard = 300) {
	let n = els.length;
	let card = cRound(dParent, { border: 'solid #ccc 3px', w: szCard, h: szCard, margin: 20 });
	let dCard = iDiv(card);
	mStyle(dCard, { padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' });
	let d0 = mDom(dCard, { w: '80%' });
	let [nth, rows, colarr] = layoutCircle(n); console.log(colarr)
	let index = 0;
	for (let i of range(rows)) {
		let margin = i == 0 || i == rows - 1 ? 20 : 0;
		let dr = mDom(d0, { h: szCard / nth, w: `${100 - 2 * margin}%`, maleft: `${margin}%`, display: 'flex', justifyContent: 'center', alignItems: 'center' });
		for (let j of range(colarr[i])) {
			let el = els[index++];
			let sz = szCard * el.scale / nth;
			mKey(el.key, dr, { w: sz, h: sz, sz, fz: sz * .8, cursor: 'pointer' });//, {w:szCard*el.scale,h:szCard*el.scale, sz:szCard*el.scale, cursor:'pointer'});
		}
	}
	return card;
}
function spotitCard(dParent, els, szCard = 300) {
	let n = els.length;
	let card = cRound(dParent, { border: 'solid #ccc 3px', w: szCard, h: szCard, margin: 20 });
	let dCard = iDiv(card);

	// Center d0 perfectly within the circle card frame
	mStyle(dCard, { padding: 12, display: 'flex', justifyContent: 'center', alignItems: 'center' });

	// Use a flex column on the inner wrapper to distribute rows vertically as well
	let d0 = mDom(dCard, {
		w: '92%',
		h: '92%',
		display: 'flex',
		dir: 'column',
		justifyContent: 'space-around' // Distributes rows evenly vertically
	});

	let [nth, rows, colarr] = layoutCircle(n); console.log(colarr)
	let index = 0;

	for (let i of range(rows)) {
		// Dynamically calculate horizontal inset margins based on the circular arc profile
		// Top and bottom rows get narrower width bounds to prevent corner edge breakout
		let margin = i == 0 || i == rows - 1 ? 22 : 4;
		if (rows <= 2) margin = 8; // Adjust margin rule if card has very few rows total

		let dr = mDom(d0, {
			h: szCard / nth,
			w: `${100 - 2 * margin}%`,
			maleft: `${margin}%`,
			display: 'flex',

			// CRITICAL FIX: Distribute items harmoniously across the available horizontal row track width
			justifyContent: 'space-around',
			alignItems: 'center'
		});

		for (let j of range(colarr[i])) {
			let el = els[index++];
			let sz = szCard * el.scale / nth;

			// Let individual symbols take a minor lateral cushion margin to smooth separation gaps
			let symStyles = {
				w: sz,
				h: sz,
				sz,
				fz: sz * .8,
				cursor: 'pointer',
				margin: '0 6px', // Guarantees symbols never bump right against each other
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center'
			};

			mKey(el.key, dr, symStyles);
		}
	}
	return card;
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
		alignItems: 'center' // <-- CRITICAL: This ensures all child rows are perfectly centered horizontally
	});

	let [nth, rows, colarr] = layoutCircle(n); console.log(colarr)
	let index = 0;

	for (let i of range(rows)) {
		// Top and bottom rows get narrower width restrictions to avoid boundary breakouts
		let margin = i == 0 || i == rows - 1 ? 22 : 4;
		if (rows <= 2) margin = 8;

		let dr = mDom(d0, {
			h: szCard / nth,
			w: `${100 - 2 * margin}%`,
			// REMOVED: maleft is gone so rows don't skew off-center!
			display: 'flex',
			justifyContent: 'space-around',
			alignItems: 'center'
		});

		for (let j of range(colarr[i])) {
			let el = els[index++];
			let sz = szCard * el.scale / nth;

			let symStyles = {
				w: sz,
				h: sz,
				sz,
				fz: sz * .8,
				cursor: 'pointer',
				margin: '0 6px',
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center'
			};

			mKey(el.key, dr, symStyles);
		}
	}
	return card;
}


function arrangeShapesEvenlyCircle3(containerSize, rectangles, dParent, gap = 10) {
	const radius = containerSize / 2;

	// 1. Create the main parent container circle
	let container = mDom(dParent, { position: 'relative', w: containerSize, h: containerSize, round: true, bg: '#f9f9f9', overflow: 'hidden', border: '2px solid #333', display: 'inline-block', margin: 10 });

	const numRects = rectangles.length;
	if (numRects === 0) return container;

	// =========================================================================
	// DYNAMIC AREA RESIZING ENGINE (Accounts for the forced gap footprint)
	// =========================================================================
	const totalCircleArea = Math.PI * Math.pow(radius, 2);
	// Slightly adjust target element area to guarantee the mandatory gap fit
	const targetElementArea = totalCircleArea * 0.38;

	let currentTotalArea = rectangles.reduce((sum, r) => sum + (r.w * r.h), 0);
	let idealScaleFactor = Math.sqrt(targetElementArea / currentTotalArea);

	const maxAllowedDimension = containerSize / (Math.sqrt(numRects) * 0.95);

	const scaledRectangles = rectangles.map(r => {
		let w = r.w * idealScaleFactor;
		let h = r.h * idealScaleFactor;

		if (w > maxAllowedDimension || h > maxAllowedDimension) {
			const capRatio = maxAllowedDimension / Math.max(w, h);
			w *= capRatio;
			h *= capRatio;
		}

		return { ...r, w, h };
	});

	// 2. Generate target slots using Fermat's Spiral
	const targetSlots = [];
	const goldenAngle = 137.5 * (Math.PI / 180);
	const borderPadding = containerSize * 0.08 + gap; // Include gap into wall padding
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

	const sortedRects = [...scaledRectangles].sort((a, b) => (b.w * b.h) - (a.w * a.h));
	const finalizedNodes = [];

	// =========================================================================
	// ENFORCED GAP COLLISION CHECK
	// =========================================================================
	function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2, requiredGap) {
		// 1. Strict box check including the mandatory gap parameter
		const boxOverlap = !(x1 + w1 / 2 + requiredGap < x2 - w2 / 2 ||
			x1 - w1 / 2 - requiredGap > x2 + w2 / 2 ||
			y1 + h1 / 2 + requiredGap < y2 - h2 / 2 ||
			y1 - h1 / 2 - requiredGap > y2 + h2 / 2);

		if (!boxOverlap) return false;

		// 2. Strict rotational radius clearance verification
		// Diagonal bounding radius calculation ensures the corners clear the gap
		const r1 = Math.hypot(w1 / 2, h1 / 2);
		const r2 = Math.hypot(w2 / 2, h2 / 2);
		const distance = Math.hypot(x2 - x1, y2 - y1);

		return distance < (r1 + r2 + requiredGap);
	}
	// =========================================================================

	// 3. Map Rectangles to Target Slots
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
			const maxLocalShift = containerSize * 0.25;

			while (localRadius < maxLocalShift && !placed) {
				const microSteps = localRadius === 0 ? 1 : 16;
				for (let a = 0; a < microSteps; a++) {
					const microAngle = (a / microSteps) * Math.PI * 2;
					const testX = slot.x + localRadius * Math.cos(microAngle);
					const testY = slot.y + localRadius * Math.sin(microAngle);

					// Boundary limit validation
					const centerDist = Math.hypot(testX - radius, testY - radius);
					const cornerBound = Math.hypot(rectData.w / 2, rectData.h / 2);
					if (centerDist + cornerBound > radius - (gap / 2) - 4) continue;

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
							bg: rectData.bg || 'transparent',
							key: rectData.key,
						});
						targetSlots.splice(s, 1);
						placed = true;
						break;
					}
				}
				localRadius += 2;
			}
			if (placed) break;
		}

		// Fallback placement (gently downsizes if item is trapped in a tight corner layout)
		if (!placed && targetSlots.length > 0) {
			const fallbackSlot = targetSlots.shift();
			finalizedNodes.push({
				x: fallbackSlot.x,
				y: fallbackSlot.y,
				w: rectData.w * 0.7,
				h: rectData.h * 0.7,
				bg: rectData.bg || 'transparent',
				key: rectData.key,
			});
		}
	});

	// 4. Render to the DOM
	finalizedNodes.forEach((node) => {
		const leftPos = node.x - (node.w / 2);
		const topPos = node.y - (node.h / 2);

		mKey(node.key, container, {
			transform: `rotate(${rChoose([0, 5, 10, 15, 345, 350, 355])}deg)`,
			position: 'absolute',
			left: leftPos,
			top: topPos,
			rounding: 8,
			w: node.w,
			h: node.h,
			bg: node.bg,
			fz: node.h * 0.8,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			margin: 'auto'
		}, { key: node.key });
	});

	return container;
}

function arrangeShapesEvenlyCircle2(containerSize, rectangles, dParent) {
	const radius = containerSize / 2;

	// 1. Create the main parent container circle
	let container = mDom(dParent, { position: 'relative', w: containerSize, h: containerSize, round: true, bg: '#f9f9f9', overflow: 'hidden', border: '2px solid #333', display: 'inline-block', margin: 10 });

	const numRects = rectangles.length;
	if (numRects === 0) return container;

	// =========================================================================
	// DYNAMIC HARMONIOUS RESIZING ENGINE (Adjusted for rotation clearance)
	// =========================================================================
	const totalCircleArea = Math.PI * Math.pow(radius, 2);
	const targetElementArea = totalCircleArea * 0.40;

	let currentTotalArea = rectangles.reduce((sum, r) => sum + (r.w * r.h), 0);
	let idealScaleFactor = Math.sqrt(targetElementArea / currentTotalArea);

	const maxAllowedDimension = containerSize / (Math.sqrt(numRects) * 0.9);

	const scaledRectangles = rectangles.map(r => {
		let w = r.w * idealScaleFactor;
		let h = r.h * idealScaleFactor;

		if (w > maxAllowedDimension || h > maxAllowedDimension) {
			const capRatio = maxAllowedDimension / Math.max(w, h);
			w *= capRatio;
			h *= capRatio;
		}

		return { ...r, w, h };
	});

	// 2. Generate target slots using Fermat's Spiral
	const targetSlots = [];
	const goldenAngle = 137.5 * (Math.PI / 180);
	const borderPadding = containerSize * 0.08;
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

	const sortedRects = [...scaledRectangles].sort((a, b) => (b.w * b.h) - (a.w * a.h));
	const finalizedNodes = [];

	// Rotation-Safe Collision Detection
	function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2, buffer) {
		const boxOverlap = !(x1 + w1 / 2 + buffer < x2 - w2 / 2 ||
			x1 - w1 / 2 - buffer > x2 + w2 / 2 ||
			y1 + h1 / 2 + buffer < y2 - h2 / 2 ||
			y1 - h1 / 2 - buffer > y2 + h2 / 2);

		if (!boxOverlap) return false;

		const r1 = Math.hypot(w1 / 2, h1 / 2);
		const r2 = Math.hypot(w2 / 2, h2 / 2);
		const distance = Math.hypot(x2 - x1, y2 - y1);

		return distance < (r1 + r2 + buffer);
	}

	// 3. Map Rectangles to Target Slots
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
			const maxLocalShift = containerSize * 0.22;

			while (localRadius < maxLocalShift && !placed) {
				const microSteps = localRadius === 0 ? 1 : 16;
				for (let a = 0; a < microSteps; a++) {
					const microAngle = (a / microSteps) * Math.PI * 2;
					const testX = slot.x + localRadius * Math.cos(microAngle);
					const testY = slot.y + localRadius * Math.sin(microAngle);

					const centerDist = Math.hypot(testX - radius, testY - radius);
					const cornerBound = Math.hypot(rectData.w / 2, rectData.h / 2);
					if (centerDist + cornerBound > radius - 6) continue;

					let collision = false;
					const dynamicBuffer = containerSize * 0.04;

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
							bg: rectData.bg || 'transparent', // <-- FIXED: Changed node.bg to rectData.bg
							key: rectData.key,
						});
						targetSlots.splice(s, 1);
						placed = true;
						break;
					}
				}
				localRadius += 2;
			}
			if (placed) break;
		}

		// Fallback placement
		if (!placed && targetSlots.length > 0) {
			const fallbackSlot = targetSlots.shift();
			finalizedNodes.push({
				x: fallbackSlot.x,
				y: fallbackSlot.y,
				w: rectData.w * 0.75,
				h: rectData.h * 0.75,
				bg: rectData.bg || 'transparent',
				key: rectData.key,
			});
		}
	});

	// 4. Render to the DOM
	finalizedNodes.forEach((node) => {
		const leftPos = node.x - (node.w / 2);
		const topPos = node.y - (node.h / 2);

		mKey(node.key, container, {
			transform: `rotate(${rChoose([0, 5, 10, 15, 345, 350, 355])}deg)`,
			position: 'absolute',
			left: leftPos,
			top: topPos,
			rounding: 8,
			w: node.w,
			h: node.h,
			bg: node.bg,
			fz: node.h * 0.8,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			margin: 'auto'
		}, { key: node.key });
	});

	return container;
}

function arrangeShapesEvenlyCircle1(containerSize, rectangles, dParent) {
	const radius = containerSize / 2;

	// 1. Create the main parent container circle
	let container = mDom(dParent, { position: 'relative', w: containerSize, h: containerSize, round: true, bg: '#f9f9f9', overflow: 'hidden', border: '2px solid #333', display: 'inline-block', margin: 10 });

	const numRects = rectangles.length;
	if (numRects === 0) return container;

	// =========================================================================
	// DYNAMIC HARMONIOUS RESIZING ENGINE (50% Area Fill Goal)
	// =========================================================================
	// Total Circle Area = Math.PI * radius^2
	const totalCircleArea = Math.PI * Math.pow(radius, 2);
	const targetElementArea = totalCircleArea * 0.40; // Target roughly 46-50% coverage

	// Calculate current total area of incoming shapes
	let currentTotalArea = rectangles.reduce((sum, r) => sum + (r.w * r.h), 0);

	// Compute the ideal scale factor k based on the area ratio
	let idealScaleFactor = Math.sqrt(targetElementArea / currentTotalArea);

	// Safety cap: Prevent individual items from getting too massive when 'n' is very small
	// An item shouldn't have a diagonal larger than a reasonable fraction of the container width
	const maxAllowedDimension = containerSize / (Math.sqrt(numRects) * 0.85);

	// Clone and scale rectangles uniformly
	const scaledRectangles = rectangles.map(r => {
		let w = r.w * idealScaleFactor;
		let h = r.h * idealScaleFactor;

		// Enforce the safety cap constraint
		if (w > maxAllowedDimension || h > maxAllowedDimension) {
			const capRatio = maxAllowedDimension / Math.max(w, h);
			w *= capRatio;
			h *= capRatio;
		}

		return { ...r, w, h };
	});
	// =========================================================================

	// 2. Generate N mathematically ideal, area-proportional target slots using Fermat's Spiral
	const targetSlots = [];
	const goldenAngle = 137.5 * (Math.PI / 180);
	const borderPadding = containerSize * 0.07;  // Slightly increased padding to keep large icons off edges
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

	// Sort scaled rectangles from largest to smallest to optimize geometric center allocation
	const sortedRects = [...scaledRectangles].sort((a, b) => (b.w * b.h) - (a.w * a.h));
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

		targetSlots.sort((a, b) => {
			const distA = Math.hypot(a.x - radius, a.y - radius);
			const distB = Math.hypot(b.x - radius, b.y - radius);
			return distA - distB;
		});

		for (let s = 0; s < targetSlots.length; s++) {
			const slot = targetSlots[s];

			let localRadius = 0;
			const maxLocalShift = containerSize * 0.18; // Slightly expanded search range for larger shapes

			while (localRadius < maxLocalShift && !placed) {
				const microSteps = localRadius === 0 ? 1 : 16; // Increased resolution steps for tightly packed boundaries
				for (let a = 0; a < microSteps; a++) {
					const microAngle = (a / microSteps) * Math.PI * 2;
					const testX = slot.x + localRadius * Math.cos(microAngle);
					const testY = slot.y + localRadius * Math.sin(microAngle);

					// Bound Check: Confirm corners stay inside card rim boundary
					const centerDist = Math.hypot(testX - radius, testY - radius);
					const cornerBound = Math.hypot(rectData.w / 2, rectData.h / 2);
					if (centerDist + cornerBound > radius - 8) continue;

					// Collision Check against already locked assets
					let collision = false;
					const dynamicBuffer = containerSize * 0.025; // Adjusted spacing buffer relative to new fills

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
							bg: rectData.bg || '#ff4757',
							key: rectData.key,
						});
						targetSlots.splice(s, 1);
						placed = true;
						break;
					}
				}
				localRadius += 2; // Denser scan tracking step
			}
			if (placed) break;
		}

		// Edge fallback: If an extreme aspect-ratio item fails placement, place it directly
		if (!placed && targetSlots.length > 0) {
			const fallbackSlot = targetSlots.shift();
			finalizedNodes.push({
				x: fallbackSlot.x,
				y: fallbackSlot.y,
				w: rectData.w * 0.8,
				h: rectData.h * 0.8,
				bg: rectData.bg || '#ff4757',
				key: rectData.key,
			});
		}
	});

	// 4. Render the perfectly spaced components to the DOM
	finalizedNodes.forEach((node) => {
		const leftPos = node.x - (node.w / 2);
		const topPos = node.y - (node.h / 2);

		mKey(node.key, container, {
			//transform: `rotate(${rChoose([0, 5, 10, 15, 345, 350, 355])}deg)`, // Controlled dynamic rotations
			position: 'absolute',
			left: leftPos,
			top: topPos,
			rounding: 8,
			w: node.w,
			h: node.h,
			bg: node.bg,
			fz: node.h * 0.8,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			margin: 'auto'
		}, { key: node.key });
	});

	return container;
}

function _arrangeShapesEvenlyCircle(containerSize, rectangles, dParent) {
	const radius = containerSize / 2;

	// 1. Create the main parent container circle
	let container = mDom(dParent, { position: 'relative', w: containerSize, h: containerSize, round: true, bg: '#f9f9f9', overflow: 'hidden', border: '2px solid #333' });

	const numRects = rectangles.length;
	if (numRects === 0) return container;

	// 2. Generate N mathematically ideal, area-proportional target slots using Fermat's Spiral
	const targetSlots = [];
	const goldenAngle = 137.5 * (Math.PI / 180); // The golden ratio angle for uniform distribution
	const borderPadding = containerSize * 0.06;  // Padding scales dynamically with circle size!
	const usableRadius = radius - borderPadding;

	//depending on containersize and n, w and h of rectangles should be modified to yield a harmonious card.


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
							bg: rectData.bg || '#ff4757',
							key: rectData.key,
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
				bg: rectData.bg || '#ff4757',
				key: rectData.key,

			});
		}
	});

	// 4. Render the perfectly spaced components to the DOM
	finalizedNodes.forEach((node) => {
		// let styles2 = { w: sz, h: sz, fz: sz * .8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }
		// let styles = { bg: 'red', w: uniformSize, h: uniformSize, box: true, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: gap };
		// let d0 = mDom(d2, styles, { key });
		// let d1 = mKey(key, d0, styles2, { key });
		const leftPos = node.x - (node.w / 2);
		const topPos = node.y - (node.h / 2);
		mKey(node.key, container, { transform: `rotate(${rChoose([0, 5, 10, 30, 300, 350])}deg)`, position: 'absolute', left: leftPos, top: topPos, rounding: 8, w: node.w, h: node.h, bg: node.bg, fz: node.h * .8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }, { key: node.key })
		// const rect = document.createElement('div');
		// rect.style.position = 'absolute';
		// rect.style.width = `${node.w}px`;
		// rect.style.height = `${node.h}px`;
		// rect.style.backgroundColor = node.bg;
		// rect.style.left = `${leftPos}px`;
		// rect.style.top = `${topPos}px`;
		// rect.style.borderRadius = '8px';
		// rect.style.boxShadow = '0 3px 6px rgba(0,0,0,0.12)';
		// container.appendChild(rect);
	});

	return container;
}


function spotit_present(dt, me, table, ui) {
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


function geo_arrangeShapesEvenlyCircle(containerSize, rectangles, dParent) {
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

	// Sort rectangles largest-to-smallest to optimize packing geometry
	const sortedRects = [...rectangles].sort((a, b) => (b.w * b.h) - (a.w * a.h));

	const placedNodes = [];
	const borderPadding = 10;

	// Helper function to check real rectangular box overlaps
	function intersects(x1, y1, w1, h1, x2, y2, w2, h2, padding) {
		return !(x1 + w1 / 2 + padding < x2 - w2 / 2 ||
			x1 - w1 / 2 - padding > x2 + w2 / 2 ||
			y1 + h1 / 2 + padding < y2 - h2 / 2 ||
			y1 - h1 / 2 - padding > y2 + h2 / 2);
	}

	// 2. Geometric Ring Spiral Placement Loop
	sortedRects.forEach((rectData) => {
		let placed = false;

		// We increment outward from the center using expanding radius layers
		// and step angularly to test positions evenly
		let currentRadius = 0;
		const radiusStep = 4; // Dense pixel scanning steps
		const angleStep = 0.15; // Angular scanning steps

		while (!placed && currentRadius < radius) {
			// Rotate the starting angle slightly per ring level to create a natural, non-linear scatter
			let startingAngle = currentRadius * 0.5;
			let maxAngles = Math.PI * 2;

			for (let angle = 0; angle < maxAngles; angle += angleStep) {
				const testAngle = startingAngle + angle;
				const testX = radius + currentRadius * Math.cos(testAngle);
				const testY = radius + currentRadius * Math.sin(testAngle);

				// Check A: Ensure the element's corners fit completely inside the circular container boundary
				const distFromCenter = Math.hypot(testX - radius, testY - radius);
				const maxCornerRadius = Math.hypot(rectData.w / 2, rectData.h / 2);

				if (distFromCenter + maxCornerRadius > radius - borderPadding) {
					continue; // Out of bounds, skip to a wider ring or angle
				}

				// Check B: Validate zero overlap against all items already locked on the card
				let hasCollision = false;
				const minimumPaddingBetween = 8; // Adjust this to control tight vs loose spreading

				for (let node of placedNodes) {
					if (intersects(testX, testY, rectData.w, rectData.h, node.x, node.y, node.w, node.h, minimumPaddingBetween)) {
						hasCollision = true;
						break;
					}
				}

				// If the position is valid, lock the geometric coordinates!
				if (!hasCollision) {
					placedNodes.push({
						x: testX,
						y: testY,
						w: rectData.w,
						h: rectData.h,
						bg: rectData.bg || '#ff4757'
					});
					placed = true;
					break;
				}
			}

			// Move outward to the next concentric layout ring
			currentRadius += radiusStep;
		}

		// Fallback: If an asset physically cannot fit, downscale it slightly so the card doesn't break
		if (!placed) {
			rectData.w *= 0.85;
			rectData.h *= 0.85;
		}
	});

	// 3. Render the mathematically optimized elements to the DOM
	placedNodes.forEach((node) => {
		const rect = document.createElement('div');
		rect.style.position = 'absolute';
		rect.style.width = `${node.w}px`;
		rect.style.height = `${node.h}px`;
		rect.style.backgroundColor = node.bg;

		// Shift from center back to standard absolute left/top styles
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

function _arrangeShapesEvenlyCircle(containerSize, rectangles, dParent) {
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

	// 2. Initial placement: Scatter them completely randomly across the surface area
	let nodes = rectangles.map((rectData) => {
		const maxDim = Math.max(rectData.w, rectData.h);
		const rBounds = maxDim / 2;

		const initAngle = Math.random() * Math.PI * 2;
		// Spreading them out immediately across the card radius
		const initDist = Math.sqrt(Math.random()) * (radius * 0.5);

		return {
			w: rectData.w,
			h: rectData.h,
			bg: rectData.bg || '#ff4757',
			rBounds: rBounds,
			x: radius + initDist * Math.cos(initAngle),
			y: radius + initDist * Math.sin(initAngle)
		};
	});

	// 3. Configuration Parameters
	const iterations = 400; // Extra ticks to let the honeycomb settle completely
	const borderPadding = 15;

	// 4. Equilibrium Simulation Loop
	for (let step = 0; step < iterations; step++) {

		// FORCE A: Gentle Central Gravity (Pulls items toward the middle to stop center emptiness)
		nodes.forEach(node => {
			let dx = radius - node.x;
			let dy = radius - node.y;
			let distFromCenter = Math.hypot(dx, dy);

			if (distFromCenter > 0) {
				// A light attraction force holding the cluster together
				node.x += (dx / distFromCenter) * 0.4;
				node.y += (dy / distFromCenter) * 0.4;
			}
		});

		// FORCE B: Strong Mutual Repulsion (Pushes neighbors apart to force equidistance)
		for (let i = 0; i < numRects; i++) {
			for (let j = i + 1; j < numRects; j++) {
				let n1 = nodes[i];
				let n2 = nodes[j];

				let dx = n2.x - n1.x;
				let dy = n2.y - n1.y;
				let dist = Math.hypot(dx, dy);

				// This dynamically calculates an ideal spacing based on the size of the container
				let idealSpacing = containerSize / 4.2;
				let minDist = n1.rBounds + n2.rBounds + idealSpacing;

				if (dist < minDist) {
					if (dist === 0) { dx = 1; dy = 0; dist = 1; }
					const overlap = minDist - dist;

					// Firm push apart vector
					const forceX = (dx / dist) * overlap * 0.5;
					const forceY = (dy / dist) * overlap * 0.5;

					n1.x -= forceX;
					n1.y -= forceY;
					n2.x += forceX;
					n2.y += forceY;
				}
			}
		}

		// FORCE C: Boundary Hard-Clamp Container
		nodes.forEach(node => {
			let dx = node.x - radius;
			let dy = node.y - radius;
			let distFromCenter = Math.hypot(dx, dy);

			let maxAllowedDist = radius - node.rBounds - borderPadding;

			if (distFromCenter > maxAllowedDist) {
				if (distFromCenter === 0) return;
				node.x = radius + (dx / distFromCenter) * maxAllowedDist;
				node.y = radius + (dy / distFromCenter) * maxAllowedDist;
			}
		});
	}

	// 5. Render elements to the DOM
	nodes.forEach((node) => {
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
		rect.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)';

		container.appendChild(rect);
	});

	return container;
}
function _blastArrangeShapesEvenlyCircle(containerSize, rectangles, dParent) {
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

	// 2. Initialize items distributed loosely around the center
	let nodes = rectangles.map((rectData) => {
		const maxDim = Math.max(rectData.w, rectData.h);
		const rBounds = maxDim / 2;

		const initAngle = Math.random() * Math.PI * 2;
		const initDist = Math.random() * 15; // Start closely to let forces explode outward uniformly

		return {
			w: rectData.w,
			h: rectData.h,
			bg: rectData.bg || '#ff4757',
			rBounds: rBounds,
			x: radius + initDist * Math.cos(initAngle),
			y: radius + initDist * Math.sin(initAngle)
		};
	});

	// 3. Configuration Parameters
	const iterations = 300; // More ticks to allow perfect structural sorting
	const borderPadding = 15; // Safety margin from the card rim

	// 4. Dual-Force Simulation Loop
	for (let step = 0; step < iterations; step++) {

		// FORCE A: Global Outward Expansion (Pushes items aggressively to fill the white space)
		nodes.forEach(node => {
			let dx = node.x - radius;
			let dy = node.y - radius;
			let distFromCenter = Math.hypot(dx, dy);

			if (distFromCenter > 0) {
				// Continuous outward push vector
				node.x += (dx / distFromCenter) * 1.5;
				node.y += (dy / distFromCenter) * 1.5;
			} else {
				// Jitter center node if perfectly stacked
				node.x += (Math.random() - 0.5);
				node.y += (Math.random() - 0.5);
			}
		});

		// FORCE B: Mutual Repulsion (Pushes overlapping neighbors apart)
		for (let i = 0; i < numRects; i++) {
			for (let j = i + 1; j < numRects; j++) {
				let n1 = nodes[i];
				let n2 = nodes[j];

				let dx = n2.x - n1.x;
				let dy = n2.y - n1.y;
				let dist = Math.hypot(dx, dy);

				// Dynamic maximum separation threshold based on container capacity
				let idealSpacing = containerSize / 4.8;
				let minDist = n1.rBounds + n2.rBounds + idealSpacing;

				if (dist < minDist) {
					if (dist === 0) { dx = 1; dy = 0; dist = 1; }
					const overlap = minDist - dist;

					// Firm push factor to force maximum distance spacing
					const forceX = (dx / dist) * overlap * 0.45;
					const forceY = (dy / dist) * overlap * 0.45;

					n1.x -= forceX;
					n1.y -= forceY;
					n2.x += forceX;
					n2.y += forceY;
				}
			}
		}

		// FORCE C: Boundary Hard-Clamp Container
		nodes.forEach(node => {
			let dx = node.x - radius;
			let dy = node.y - radius;
			let distFromCenter = Math.hypot(dx, dy);

			let maxAllowedDist = radius - node.rBounds - borderPadding;

			if (distFromCenter > maxAllowedDist) {
				if (distFromCenter === 0) return;
				node.x = radius + (dx / distFromCenter) * maxAllowedDist;
				node.y = radius + (dy / distFromCenter) * maxAllowedDist;
			}
		});
	}

	// 5. Render elements to the DOM
	nodes.forEach((node) => {
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
		rect.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)';

		container.appendChild(rect);
	});

	return container;
}


function _arrangeShapesEvenlyCircle(containerSize, rectangles, dParent) {
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

	// 2. CRITICAL FIX: Scatter initial positions across the WHOLE circle area, not just a tight center point
	let nodes = rectangles.map((rectData) => {
		const maxDim = Math.max(rectData.w, rectData.h);
		const rBounds = maxDim / 2;

		// Use a uniform distribution across the radius area
		const initAngle = Math.random() * Math.PI * 2;
		// Square root distribution spreads them evenly across the circle's surface area
		const initDist = Math.sqrt(Math.random()) * (radius * 0.6);

		return {
			w: rectData.w,
			h: rectData.h,
			bg: rectData.bg || '#ff4757',
			rBounds: rBounds,
			x: radius + initDist * Math.cos(initAngle),
			y: radius + initDist * Math.sin(initAngle)
		};
	});

	// 3. Dynamic Spacing: Scale up padding if the canvas grows to push items out further!
	const baseScale = containerSize / 200; // Normalizes settings against your sweet-spot size of 200
	const paddingBetween = 12 * baseScale;
	const borderPadding = 10 * baseScale;
	const iterations = 200; // Increased ticks to give items plenty of time to find their home

	// 4. Relaxation Loop
	for (let step = 0; step < iterations; step++) {
		// A. Push nodes away from each other (Repulsion)
		for (let i = 0; i < numRects; i++) {
			for (let j = i + 1; j < numRects; j++) {
				let n1 = nodes[i];
				let n2 = nodes[j];

				let dx = n2.x - n1.x;
				let dy = n2.y - n1.y;
				let dist = Math.hypot(dx, dy);

				let minDist = n1.rBounds + n2.rBounds + paddingBetween;

				if (dist < minDist) {
					if (dist === 0) { dx = 1; dy = 0; dist = 1; }
					const overlap = minDist - dist;

					// Apply a soft relaxation dampening factor (0.35) so layouts don't oscillate violently
					const forceX = (dx / dist) * overlap * 0.35;
					const forceY = (dy / dist) * overlap * 0.35;

					n1.x -= forceX;
					n1.y -= forceY;
					n2.x += forceX;
					n2.y += forceY;
				}
			}
		}

		// B. Containment: Clamp inside card bounds and gently nudge outliers inward
		nodes.forEach(node => {
			let dx = node.x - radius;
			let dy = node.y - radius;
			let distFromCenter = Math.hypot(dx, dy);

			let maxAllowedDist = radius - node.rBounds - borderPadding;

			if (distFromCenter > maxAllowedDist) {
				if (distFromCenter === 0) return;
				node.x = radius + (dx / distFromCenter) * maxAllowedDist;
				node.y = radius + (dy / distFromCenter) * maxAllowedDist;
			}
		});
	}

	// 5. Render to the DOM
	nodes.forEach((node) => {
		const rect = document.createElement('div');
		rect.style.position = 'absolute';
		rect.style.width = `${node.w}px`;
		rect.style.height = `${node.h}px`;
		rect.style.backgroundColor = node.bg;

		const leftPos = node.x - (node.w / 2);
		const topPos = node.y - (node.h / 2);

		rect.style.left = `${leftPos}px`;
		rect.style.top = `${topPos}px`;

		rect.style.borderRadius = '6px';
		rect.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16)';

		container.appendChild(rect);
	});

	return container;
}

function _arrangeShapesEvenlyCircle(containerSize, rectangles, dParent) {
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

	// 2. Initialize items near the center with a slight random distribution
	let nodes = rectangles.map((rectData) => {
		// Find the bounding radius of this individual rectangle
		const maxDim = Math.max(rectData.w, rectData.h);
		const rBounds = maxDim / 2;

		// Small initial offset from center so they don't sit perfectly on top of each other
		const initAngle = Math.random() * Math.PI * 2;
		const initDist = Math.random() * 20;

		return {
			w: rectData.w,
			h: rectData.h,
			bg: rectData.bg || '#ff4757',
			rBounds: rBounds, // Used for accurate distance push math
			x: radius + initDist * Math.cos(initAngle),
			y: radius + initDist * Math.sin(initAngle)
		};
	});

	// 3. Relaxation Loop (Force Repulsion Simulation)
	const iterations = 150; // How many physics ticks to settle the items
	const paddingBetween = 15; // Minimum space desired between elements
	const borderPadding = 12; // Minimum space away from the outer circle rim

	for (let step = 0; step < iterations; step++) {
		// A. Push nodes away from each other
		for (let i = 0; i < numRects; i++) {
			for (let j = i + 1; j < numRects; j++) {
				let n1 = nodes[i];
				let n2 = nodes[j];

				let dx = n2.x - n1.x;
				let dy = n2.y - n1.y;
				let dist = Math.hypot(dx, dy);

				// Minimum distance required to not overlap based on their unique sizes
				let minDist = n1.rBounds + n2.rBounds + paddingBetween;

				if (dist < minDist) {
					// If too close or on top of each other, calculate push vector
					if (dist === 0) { dx = 1; dy = 0; dist = 1; } // Prevent division by zero
					const overlap = minDist - dist;

					// Gently push them apart equally
					const forceX = (dx / dist) * overlap * 0.5;
					const forceY = (dy / dist) * overlap * 0.5;

					n1.x -= forceX;
					n1.y -= forceY;
					n2.x += forceX;
					n2.y += forceY;
				}
			}
		}

		// B. Push nodes away from the outer circle boundary
		nodes.forEach(node => {
			let dx = node.x - radius;
			let dy = node.y - radius;
			let distFromCenter = Math.hypot(dx, dy);

			let maxAllowedDist = radius - node.rBounds - borderPadding;

			if (distFromCenter > maxAllowedDist) {
				if (distFromCenter === 0) return;
				// Force the node back into the boundary limit
				node.x = radius + (dx / distFromCenter) * maxAllowedDist;
				node.y = radius + (dy / distFromCenter) * maxAllowedDist;
			}
		});
	}

	// 4. Render the settled nodes to the DOM
	nodes.forEach((node) => {
		const rect = document.createElement('div');
		rect.style.position = 'absolute';
		rect.style.width = `${node.w}px`;
		rect.style.height = `${node.h}px`;
		rect.style.backgroundColor = node.bg;

		// Convert center coordinates back to top-left styling positions
		const leftPos = node.x - (node.w / 2);
		const topPos = node.y - (node.h / 2);

		rect.style.left = `${leftPos}px`;
		rect.style.top = `${topPos}px`;

		rect.style.borderRadius = '6px';
		rect.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16)';

		container.appendChild(rect);
	});

	return container;
}
function _arrangeShapesEvenly(shapeType, containerWidth, containerHeight, rectangles, dParent) {
	// 1. Create the main parent container shape
	const container = document.createElement('div');
	container.style.position = 'relative';
	container.style.width = `${containerWidth}px`;
	container.style.height = `${containerHeight}px`;
	container.style.overflow = 'hidden';

	// Style container based on geometry
	if (shapeType === 'circle') {
		container.style.borderRadius = '50%';
		container.style.border = '2px solid #333';
		container.style.backgroundColor = '#f9f9f9';
	} else if (shapeType === 'triangle') {
		container.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
		container.style.backgroundColor = '#f0f0f0';
		container.style.border = '1px solid #ccc'; // Note: borders can look cut off with clip-path
	} else { // rectangle
		container.style.border = '2px solid #333';
		container.style.backgroundColor = '#f9f9f9';
	}

	dParent.appendChild(container);

	const numRects = rectangles.length;
	if (numRects === 0) return container;

	// 2. Mathematical validation functions (Grid-Mask check)
	function isInsideShape(x, y) {
		if (shapeType === 'rect' || shapeType === 'rectangle') {
			return x >= 0 && x <= containerWidth && y >= 0 && y <= containerHeight;
		}

		if (shapeType === 'circle') {
			const radiusX = containerWidth / 2;
			const radiusY = containerHeight / 2;
			// Elliptical distance formula normalized to 1
			const dx = (x - radiusX) / radiusX;
			const dy = (y - radiusY) / radiusY;
			return (dx * dx + dy * dy) <= 0.85; // 0.85 leaves a slight internal safety padding
		}

		if (shapeType === 'triangle') {
			// Coordinate checks against a 3-point top-centered triangle polygon
			const p1 = { x: containerWidth / 2, y: 0 };
			const p2 = { x: 0, y: containerHeight };
			const p3 = { x: containerWidth, y: containerHeight };

			// Barycentric coordinate formula for point-in-triangle test
			const alpha = ((p2.y - p3.y) * (x - p3.x) + (p3.x - p2.x) * (y - p3.y)) /
				((p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y));
			const beta = ((p3.y - p1.y) * (x - p3.x) + (p1.x - p3.x) * (y - p3.y)) /
				((p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y));
			const gamma = 1.0 - alpha - beta;

			// Keep nodes slightly away from the extreme sharp corners
			return alpha >= 0.08 && beta >= 0.08 && gamma >= 0.08;
		}
		return false;
	}

	// 3. Dynamic Grid Generation
	// Find grid dimensions that match the item count while respecting aspect ratio
	let cols = Math.ceil(Math.sqrt(numRects * (containerWidth / containerHeight)));
	let rows = Math.ceil(numRects / cols);

	// Upscale grid resolution to find enough valid shape slots
	while (true) {
		let validSlots = [];
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				// Calculate center coordinate of this specific cell slot
				const cx = (containerWidth / cols) * (c + 0.5);
				const cy = (containerHeight / rows) * (r + 0.5);

				if (isInsideShape(cx, cy)) {
					validSlots.push({ x: cx, y: cy });
				}
			}
		}

		// If our shape mask successfully harvested enough open slots, stop scaling!
		if (validSlots.length >= numRects) {
			// Prune slots down evenly to center the configuration
			const step = validSlots.length / numRects;
			let selectedSlots = [];
			for (let i = 0; i < numRects; i++) {
				selectedSlots.push(validSlots[Math.floor(i * step)]);
			}

			// 4. Render the Rectangles into the chosen layout coordinates
			rectangles.forEach((rectData, index) => {
				const slot = selectedSlots[index];
				const rect = document.createElement('div');

				rect.style.position = 'absolute';
				rect.style.width = `${rectData.w}px`;
				rect.style.height = `${rectData.h}px`;
				rect.style.backgroundColor = rectData.bg || '#ff4757';

				// Centering Correction: Align the element from its true geometric middle
				const leftPos = slot.x - (rectData.w / 2);
				const topPos = slot.y - (rectData.h / 2);

				rect.style.left = `${leftPos}px`;
				rect.style.top = `${topPos}px`;

				// Optional style polish
				rect.style.borderRadius = '4px';
				rect.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';

				container.appendChild(rect);
			});

			break;
		}

		// Expand grid step if geometry restrictions require more space parameters
		cols++;
		rows = Math.ceil(numRects / cols);
	}

	return container;
}


function _spotit_item_fen(me, table) {
	let options = table.options;
	//console.log('HALLO')
	let o = {
		num_cards: valf(options.num_cards, 2),
		num_symbols: options.adaptive == 'yes' ? 14 : valf(options.num_symbols, 7),
		vocab: valf(options.vocab, 'lifePlus'),
		lang: 'E',
		min_scale: valf(options.min_scale, 0.75),
		max_scale: valf(options.max_scale, 1.25),
	};

	let items = spotit_create_sample(me, table, o.num_cards, o.num_symbols, o.vocab, o.lang, o.min_scale, o.max_scale);
	console.log(items)
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

function _spotit_create_sample(me, table, numCards, numSyms, vocab, lang, min_scale, max_scale) {
	// lang and vocab are kept in the signature in case other parts of the code depend on it,
	// but they are no longer used for the keypool generation.
	let [rows, cols, colarr] = calc_syms(numSyms); console.log('numSyms', numSyms)

	// from here on, rows ONLY determines symbol size! colarr is used for placing elements
	let perCard = arrSum(colarr);
	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let numKeysNeeded = nShared + numCards * nUnique;

	let keypool = flattenDictValues(M.emogroup.objects); //M.byCat.animal; //Object.keys(M.emo);
	//console.log('keypool',keypool)

	// Fallback check if M.objects doesn't have enough symbols for the requested game size
	if (keypool.length < numKeysNeeded) {
		console.warn(`Not enough symbols in M.objects (${keypool.length}) for the required ${numKeysNeeded} unique/shared keys.`);
	}

	let keys = choose(keypool, numKeysNeeded);
	let dupls = keys.slice(0, nShared); // these keys are shared between pairs of cards
	let uniqs = keys.slice(nShared);

	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
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
		}
	}

	for (const info of infos) {
		shuffle(info.keys);
	}

	// Generate scale factors for each key
	for (const info of infos) {
		// Restored the use of min_scale/max_scale parameters if you want dynamic ranges, 
		// or you can stick to the hardcoded array below.
		info.scales = info.keys.map(x => chooseRandom([0.5, .65, 0.75, .8, 1, 1, 1, 1.1, 1.15, 1.2, 1.3,]));
	}

	for (const info of infos) {
		let zipped = [];
		for (let i = 0; i < info.keys.length; i++) {
			zipped.push({ key: info.keys[i], scale: info.scales[i] });
		}
		info.pattern = fillColarr(info.colarr, zipped);
	}

	return infos;
}


function _spotit_create_sample(me, table, numCards, numSyms, vocab, lang, min_scale, max_scale) {
	// lang and vocab are kept in the signature in case other parts of your code depend on it,
	// but they are no longer used for the keypool generation.
	let [rows, cols, colarr] = calc_syms(numSyms); console.log('numSyms', numSyms)

	// from here on, rows ONLY determines symbol size! colarr is used for placing elements
	let perCard = arrSum(colarr);
	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let numKeysNeeded = nShared + numCards * nUnique;

	// Use M.objects as the source for your symbol keys
	// if (!M || !M.objects) {
	//   console.error("M.objects is not defined or loaded.");
	//   return [];
	// }

	let keypool = flattenDictValues(M.emogroup.objects); //M.byCat.animal; //Object.keys(M.emo);
	//console.log('keypool',keypool)

	// Fallback check if M.objects doesn't have enough symbols for the requested game size
	if (keypool.length < numKeysNeeded) {
		console.warn(`Not enough symbols in M.objects (${keypool.length}) for the required ${numKeysNeeded} unique/shared keys.`);
	}

	let keys = choose(keypool, numKeysNeeded);
	let dupls = keys.slice(0, nShared); // these keys are shared between pairs of cards
	let uniqs = keys.slice(nShared);

	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
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
		}
	}

	for (const info of infos) {
		shuffle(info.keys);
	}

	// Generate scale factors for each key
	for (const info of infos) {
		// Restored the use of min_scale/max_scale parameters if you want dynamic ranges, 
		// or you can stick to the hardcoded array below.
		info.scales = info.keys.map(x => chooseRandom([0.5, 0.75, 1, 1.2]));
	}

	for (const info of infos) {
		let zipped = [];
		for (let i = 0; i < info.keys.length; i++) {
			zipped.push({ key: info.keys[i], scale: info.scales[i] });
		}
		info.pattern = fillColarr(info.colarr, zipped);
	}

	return infos;
}



function spotit_create_sample(me, table, numCards, numSyms, vocab, lang, min_scale, max_scale) {
	// lang and vocab are kept in the signature in case other parts of the code depend on it,
	// but they are no longer used for the keypool generation.
	let [rows, cols, colarr] = calc_syms(numSyms); console.log('numSyms', numSyms)

	// from here on, rows ONLY determines symbol size! colarr is used for placing elements
	let perCard = arrSum(colarr); assertion(numSyms == perCard, 'HAAAAAAAAAAAAAA')
	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let numKeysNeeded = nShared + numCards * nUnique;

	let keypool = flattenDictValues(M.emogroup.objects); //M.byCat.animal; //Object.keys(M.emo);
	//console.log('keypool',keypool)

	// Fallback check if M.objects doesn't have enough symbols for the requested game size
	if (keypool.length < numKeysNeeded) {
		console.warn(`Not enough symbols in M.objects (${keypool.length}) for the required ${numKeysNeeded} unique/shared keys.`);
	}

	let keys = choose(keypool, numKeysNeeded);
	let dupls = keys.slice(0, nShared); // these keys are shared between pairs of cards
	let uniqs = keys.slice(nShared);

	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
		let info = { id: getUID(), shares: {}, keys: keylist, num_syms: numSyms };
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
		}
	}

	for (const info of infos) {
		shuffle(info.keys);
	}

	console.log(min_scale, max_scale)

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
		info.fen = zipped;
		// info.pattern = fillColarr(info.colarr, zipped);
	}

	return infos;
}

function setup(players, options) {
	let fen = { players: {}, plorder: jsCopy(players), turn: [players[0]], stage: 'init', phase: '' };
	for (const plname of players) {
		fen.players[plname] = {
			score: 0, name: plname, color: get_user_color(plname),
		};
	}
	fen.items = spotit_item_fen(me, table);
	console.log(fen)
	if (nundef(options.mode)) options.mode = 'multi';

	//console.log('fen', fen)
	return fen;
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

	/* 3. Systematically generate ALL structurally legal bids */
	let allPossibleBids = [];

	for (let c1 = 1; c1 <= 20; c1++) {

		// Step A: Single Bids [c1, r1, '_', '_']
		availableRanks.forEach(r1 => {
			allPossibleBids.push({
				bid: [c1, toword[r1], '_', '_'],
				c1: c1,
				rIdx1: rankOrder.indexOf(r1),
				c2: 0,
				rIdx2: -1
			});
		});

		// Step B: Split Combo Bids [c1, r1, c2, r2]
		for (let c2 = 1; c2 <= 20; c2++) {
			availableRanks.forEach(r1 => {
				availableRanks.forEach(r2 => {
					if (r1 === r2) return; // Ranks must be distinct

					let rIdx1 = rankOrder.indexOf(r1);
					let rIdx2 = rankOrder.indexOf(r2);

					/* CRITICAL RULE INTEGRATION: Left-side structural dominance.
						 A split bid is only legal to generate if:
						 1. c1 is strictly greater than c2, OR
						 2. c1 equals c2 AND r1 is a higher rank than r2 (rIdx1 > rIdx2)
					*/
					if (c1 > c2 || (c1 === c2 && rIdx1 > rIdx2)) {
						allPossibleBids.push({
							bid: [c1, toword[r1], c2, toword[r2]],
							c1: c1,
							rIdx1: rIdx1,
							c2: c2,
							rIdx2: rIdx2
						});
					}
				});
			});
		}
	}

	/* 4. MASTER SORT: Order strictly by Number first, then Rank */
	allPossibleBids.sort((a, b) => {
		// Rule 1: Compare Primary Count (c1)
		if (a.c1 !== b.c1) return a.c1 - b.c1;

		// Rule 2: Compare Primary Rank Hierarchy Index
		if (a.rIdx1 !== b.rIdx1) return a.rIdx1 - b.rIdx1;

		// Rule 3: Compare Secondary Count (c2)
		if (a.c2 !== b.c2) return a.c2 - b.c2;

		// Rule 4: Compare Secondary Rank Hierarchy Index
		return a.rIdx2 - b.rIdx2;
	});

	/* 5. Find the current bid index inside our master sequence array */
	let currentMatchIdx = allPossibleBids.findIndex(item => {
		let b = item.bid;
		return Number(b[0]) === oldCount1 &&
			torank[b[1]] === oldRank1 &&
			(b[2] === '_' ? 0 : Number(b[2])) === oldCount2 &&
			torank[b[3]] === oldRank2;
	});

	/* 6. Return the immediate next sequence step */
	if (currentMatchIdx !== -1 && currentMatchIdx + 1 < allPossibleBids.length) {
		return allPossibleBids[currentMatchIdx + 1].bid;
	}

	/* Fallback: Safely bump the primary count if the current bid falls outside boundaries */
	let fallbackRank = availableRanks[0] || '3';
	return [
		oldCount1 + 1,
		toword[fallbackRank],
		'_',
		'_'
	];
}

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


function lowestPossibleBid(ralist) {
	const toword = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const rankOrder = '3456789TJQKA';

	/* Filter out ranks that have zero cards globally */
	let activeRanks = ralist.filter(x => Number(x.value) >= 1);

	/* Sort ascending by rankOrder index to find the absolute smallest rank present */
	let smallestPresentRankItem = activeRanks.length > 0
		? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
		: ralist.slice().sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]; // Fallback if everything is empty

	/* Return a clean array matching your standard single-bid layout */
	return [
		1,
		toword[smallestPresentRankItem.rank] || '_',
		'_',
		'_'
	];
}
function secondLowestBid(ralist) {
	const toword = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const rankOrder = '3456789TJQKA';

	/* Sort the entire ralist structural configuration by rankOrder index ascending */
	let sortedRalist = ralist.slice().sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));

	/* Grab the second lowest structural rank element (index 1) */
	/* Fallback to index 0 if the list somehow contains fewer than 2 elements */
	let secondLowestItem = sortedRalist[1] || sortedRalist[0];

	/* Return exactly 1 of that second lowest rank with an empty secondary component */
	return [
		1,
		toword[secondLowestItem.rank] || '_',
		'_',
		'_'
	];
}
function thirdLowestBid(ralist) {
	const toword = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const rankOrder = '3456789TJQKA';

	/* Sort the entire ralist configuration by rankOrder index ascending */
	let sortedRalist = ralist.slice().sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));

	/* Grab the third lowest structural rank element (index 2) */
	/* Fallback chain in case the dataset has fewer than 3 elements */
	let thirdLowestItem = sortedRalist[2] || sortedRalist[1] || sortedRalist[0];

	/* Return exactly 1 of that third lowest rank with an empty secondary component */
	return [
		1,
		toword[thirdLowestItem.rank] || '_',
		'_',
		'_'
	];
}



function _findMinimalCorrectHigherBid(ralist, wildcards, lastbid = null) {
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: COMPUTE EXACT ACTUAL HOLDINGS (REAL CORRECT MARGINS) --- */
	let realHoldings = {};
	rankOrder.split('').forEach(sym => {
		let match = ralist.find(x => x.rank === sym);
		let naturalCount = match ? (Number(match.value) || 0) : 0;
		realHoldings[sym] = naturalCount + Number(wildcards);
	});

	/* Find the smallest present rank on the table */
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

	let oldVolume = oldCount1 + oldCount2;

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

	/* --- PART 4: GENERATE CORRECT CANDIDATES --- */
	let candidates = [];

	rankOrder.split('').forEach(r1 => {
		let maxAvail1 = realHoldings[r1];
		if (maxAvail1 < 1) return;

		// Evaluate single rank options
		for (let c1 = 1; c1 <= maxAvail1; c1++) {
			let testSingle = [c1, toword[r1], '_', '_'];
			if (isValidHigher(testSingle)) {
				candidates.push({
					bid: testSingle,
					volume: c1,
					rankIdx1: rankOrder.indexOf(r1),
					rankIdx2: -1,
					isSplit: false
				});
			}

			// Evaluate split combo layouts (properly closed loops now!)
			rankOrder.split('').forEach(r2 => {
				if (r1 === r2) return;
				let maxAvail2 = realHoldings[r2];
				if (maxAvail2 < 1) return;

				for (let c2 = 1; c2 <= maxAvail2; c2++) {
					let testSplit = [c1, toword[r1], c2, toword[r2]];
					if (isValidHigher(testSplit)) {
						candidates.push({
							bid: testSplit,
							volume: c1 + c2,
							rankIdx1: rankOrder.indexOf(r1),
							rankIdx2: rankOrder.indexOf(r2),
							isSplit: true
						});
					}
				}
			});
		}
	});

	/* --- PART 5: CHOOSE THE ABSOLUTE MINIMAL CORRECT OPTION --- */
	if (candidates.length > 0) {
		candidates.sort((a, b) => {
			if (a.volume !== b.volume) return a.volume - b.volume;
			if (a.rankIdx1 !== b.rankIdx1) return a.rankIdx1 - b.rankIdx1;
			return a.rankIdx2 - b.rankIdx2;
		});
		return candidates[0].bid;
	}

	/* --- PART 6: EMERGENCY FALLBACK --- */
	let sortedRanksByStrength = ralist.slice().sort((a, b) => b.value - a.value);
	let topHoldingRank = sortedRanksByStrength[0] ? sortedRanksByStrength[0].rank : 'A';

	return [
		oldVolume + 1,
		toword[topHoldingRank],
		'_',
		'_'
	];
}



function findBids(rlist, wildcards, currentBid = null) {

	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	function mist(rlist, widcards, currentbid) {
		let highestCountRanks = rlist.slice().sort((a, b) => b.value - a.value);
		let maxItem = highestCountRanks[0];
		let minItem = highestCountRanks[1];

		let activeRanks = rlist.filter(x => x.value >= 1);
		let smallestPresentRankItem = activeRanks.length > 0
			? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
			: maxItem;

		let minimalBid = [
			1,
			toword[smallestPresentRankItem.rank] || '_',
			'_',
			'_'
		];

		let maxval = Number(maxItem.value);
		let minval = Number(minItem.value);

		let finalMaxCount = maxval + wildcards;
		let finalMinCount = Number(minItem.value)
		let finalMinRankWord = minItem ? (toword[minItem.rank] || '_') : '_';
		//console.log('finalMaxCount', finalMaxCount, 'finalMinCount', finalMinCount, 'finalMinRankWord', finalMinRankWord)

		/* If a valid second rank exists, force the split layout configuration unconditionally */
		let highestPossibleBid = [
			finalMaxCount,
			toword[maxItem.rank] || '_',
			finalMinCount,
			finalMinRankWord
		];

		/* --- PART 4: FIND MINIMAL HIGHER BID --- */
		/* If there is no previous bid, or it is empty/zero, match layout directly to minimalBid */
		if (currentBid === null || currentBid[0] === 0 || currentBid[0] === '_') {
			return {
				minimalBid,
				highestPossibleBid,
				minimalNextBid: [...minimalBid]
			};
		}

		/* Normalize active input parameters into functional tracking types with safe default boundaries */
		let oldCount1 = Number(currentBid[0]) || 0;
		let oldRank1 = torank[currentBid[1]] || '_';
		let oldCount2 = currentBid[2] === '_' ? 0 : (Number(currentBid[2]) || 0);
		let oldRank2 = torank[currentBid[3]] || '_';

		let oldVolume = oldCount1 + oldCount2;
		let minimalNextBid = null;

		if (oldCount2 > 0) {
			/* Two-Rank Bid Tweak Rule: Try to increase strictly the secondary rank first to find the minimal option */
			let secondaryHigherRanks = rlist.filter(x => rankOrder.indexOf(x.rank) > rankOrder.indexOf(oldRank2));
			if (secondaryHigherRanks.length > 0) {
				secondaryHigherRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
				let targetSecRank = secondaryHigherRanks[0].rank;

				let testBid = [oldCount1, currentBid[1], oldCount2, toword[targetSecRank]];
				if (is_bid_higher_than([oldCount1, oldRank1, oldCount2, targetSecRank], [oldCount1, oldRank1, oldCount2, oldRank2])) {
					minimalNextBid = testBid;
				}
			}

			/* If lifting secondary rank isn't enough or valid, try stepping up the primary rank value layout */
			if (minimalNextBid === null) {
				let primaryHigherRanks = rlist.filter(x => rankOrder.indexOf(x.rank) > rankOrder.indexOf(oldRank1));
				if (primaryHigherRanks.length > 0) {
					primaryHigherRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
					let targetPrimRank = primaryHigherRanks[0].rank;

					let testBid = [oldCount1, toword[targetPrimRank], oldCount2, currentBid[3]];
					if (is_bid_higher_than([oldCount1, targetPrimRank, oldCount2, oldRank2], [oldCount1, oldRank1, oldCount2, oldRank2])) {
						minimalNextBid = testBid;
					}
				}
			}
		} else {
			/* Single-Rank Bid Tweak Rule: Find the absolute closest next card rank available */
			let singleHigherRanks = rlist.filter(x => rankOrder.indexOf(x.rank) > rankOrder.indexOf(oldRank1));
			if (singleHigherRanks.length > 0) {
				singleHigherRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
				let targetRank = singleHigherRanks[0].rank;
				minimalNextBid = [oldCount1, toword[targetRank], '_', '_'];
			}

			/* Alternate split-conversion tie-breaker fallback */
			if (minimalNextBid === null && currentBid[2] === '_') {
				let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
				let sCount = oldVolume - pCount;
				let pRank = maxItem.rank;
				let sRank = minItem ? minItem.rank : maxItem.rank;

				let testBid = [pCount, toword[pRank] || '_', sCount, toword[sRank] || '_'];
				if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
					minimalNextBid = testBid;
				}
			}
		}

		/* Strategy C: Fallback. Volume must increment by 1 card using the absolute lowest present ranking */
		if (minimalNextBid === null) {
			minimalNextBid = [
				oldVolume + 1,
				toword[smallestPresentRankItem.rank] || '_',
				'_',
				'_'
			];
		}

		return {
			minimalBid,
			highestPossibleBid,
			minimalNextBid
		};
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
function bot_clairvoyant(list, wildcards = 0, lastbid = null) {
	let reduced_list = list.filter(x => x.value > 0);
	reduced_list = getPrioritizedSublist(reduced_list);
	if (!lastbid) reduced_list = reduced_list.filter(x => x.mine);
	let res = reduced_list.length >= 2 ? rChoose(reduced_list, 2) : [reduced_list[0], { value: 0, rank: '_' }];
	let max = res[0].value >= res[1].value ? res[0] : res[1]; let min = res[0].value < res[1].value ? res[0] : res[1];
	let b = [max.value + wildcards, max.rank, min.value, min.rank];
	if (isdef(lastbid)) {
		let [n1, r1, n2, r2] = bluff_convert2ranks(lastbid);
		if (!is_bid_higher_than(bluff_convert2words(b), lastbid)) {
			return [null, 'gehtHoch'];
		}
	}
	return [bluff_convert2words(b), 'bid'];
}


function generateComplexHigherBid(rank_list, totalWildcards, currentBid) {
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
	let activeRanks = rank_list.filter(x => x.value >= 1);
	activeRanks.sort((a, b) => b.value - a.value);

	let bestRankItem = activeRanks[0] || rank_list[0];
	let secondBestRankItem = activeRanks[1] || rank_list[1] || bestRankItem;

	function getNextRankSymbol(sym) {
		if (sym === '_') return rankOrder[0];
		let idx = rankOrder.indexOf(sym);
		if (idx === -1 || idx === rankOrder.length - 1) return null;
		return rankOrder[idx + 1];
	}

	/* Helper to check if a compiled bid is validly higher than the current bid */
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
	/* If the current bid ends with '_' and a standard mutation might fail, 
		 we check if Option A can save us by adding a second valid rank component. */
	if (count2 === 0 || rankWord2 === '_') {
		let targetSecRank = secondBestRankItem.rank === symbol1
			? rank_list.find(x => x.rank !== symbol1)?.rank || 'A'
			: secondBestRankItem.rank;
		let targetSecCount = secondBestRankItem.value > 0 ? secondBestRankItem.value : 1;

		let optionABid = [count1, rankWord1, targetSecCount, toword[targetSecRank]];

		/* If the current bid is so high that mutating it randomly is risky, 
			 or if Option A is cleanly valid right now, prioritize it to ensure we aren't wrong. */
		if (isValidHigher(optionABid)) {
			return optionABid;
		}
	}

	/* --- PART 3: STANDARD STRATEGY POOL (FALLBACK VARIETY) --- */
	let strategyPool = [];

	// Strategy B: Increase count 1
	strategyPool.push(() => [count1 + 1, rankWord1, currentBid[2], rankWord2]);

	// Strategy C: Switch components
	if (count2 > 0 && rankWord2 !== '_') {
		strategyPool.push(() => [count2, rankWord2, count1, rankWord1]);
	}

	// Strategy D1: Increase rank 1
	let upSymbol1 = getNextRankSymbol(symbol1);
	if (upSymbol1) {
		strategyPool.push(() => [count1, toword[upSymbol1], currentBid[2], rankWord2]);
	}

	// Strategy D2: Increase rank 2
	if (count2 > 0 && rankWord2 !== '_') {
		let upSymbol2 = getNextRankSymbol(symbol2);
		if (upSymbol2) {
			strategyPool.push(() => [count1, rankWord1, count2, toword[upSymbol2]]);
		}
	}

	/* Select and execute a random strategy */
	let primaryMutator = strategyPool[Math.floor(Math.random() * strategyPool.length)] || (() => [count1 + 1, rankWord1, currentBid[2], rankWord2]);
	let mutatedBid = primaryMutator();

	/* Optional combo layering (30% chance) */
	if (Math.random() < 0.3) {
		if (mutatedBid[2] === '_' || mutatedBid[2] === 0) {
			if (Math.random() > 0.5) {
				mutatedBid[0] += 1;
			} else {
				let nextSym = getNextRankSymbol(torank[mutatedBid[1]]);
				if (nextSym) mutatedBid[1] = toword[nextSym];
			}
		} else {
			if (Math.random() > 0.5) {
				mutatedBid[0] += 1;
			} else {
				let nextSym = getNextRankSymbol(torank[mutatedBid[3]]);
				if (nextSym) mutatedBid[3] = toword[nextSym];
			}
		}
	}

	/* --- PART 4: FINAL VALIDATION & REALISTIC EMERGENCY CEILING --- */
	if (isValidHigher(mutatedBid)) {
		return mutatedBid;
	}

	/* If the random mutation failed validity, check Option A one last time as a defensive shield */
	if (count2 === 0 || rankWord2 === '_') {
		let targetSecRank = secondBestRankItem.rank === symbol1 ? rank_list.find(x => x.rank !== symbol1)?.rank || 'A' : secondBestRankItem.rank;
		let targetSecCount = secondBestRankItem.value > 0 ? secondBestRankItem.value : 1;
		let optionABid = [count1, rankWord1, targetSecCount, toword[targetSecRank]];
		if (isValidHigher(optionABid)) {
			return optionABid;
		}
	}

	/* Ultimate fallback: Safely increment total volume using your best board asset */
	return [
		count1 + 1,
		toword[bestRankItem.rank],
		'_',
		'_'
	];
}

function generateComplexHigherBid(ralist, wildcards, currentBid) {
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: PARSE AND NORMALIZE CURRENT BID --- */
	let count1 = currentBid[0] === '_' ? 0 : Number(currentBid[0]);
	let rankWord1 = currentBid[1];
	let count2 = currentBid[2] === '_' ? 0 : Number(currentBid[2]);
	let rankWord2 = currentBid[3];

	let symbol1 = torank[rankWord1] || '_';
	let symbol2 = torank[rankWord2] || '_';

	/* --- PART 2: ANALYZE AVAILABLE TABLE ASSETS --- */
	/* Sort ranks by present global volume (value) to understand what's realistic */
	let activeRanks = ralist.filter(x => x.value >= 1);
	activeRanks.sort((a, b) => b.value - a.value);

	let bestRankItem = activeRanks[0] || ralist[0];
	let secondBestRankItem = activeRanks[1] || ralist[1] || bestRankItem;

	/* Helper to bump a rank symbol higher by 1 step safely */
	function getNextRankSymbol(sym) {
		if (sym === '_') return rankOrder[0];
		let idx = rankOrder.indexOf(sym);
		if (idx === -1 || idx === rankOrder.length - 1) return null;
		return rankOrder[idx + 1];
	}

	/* Gather a clean bank of mutation strategies */
	let strategyPool = [];

	/* Strategy A: Turn a single bid into a split combo by adding a secondary rank */
	if (count2 === 0 || rankWord2 === '_') {
		strategyPool.push(() => {
			/* Pick a distinct second rank with realistic table presence */
			let targetSecRank = secondBestRankItem.rank === symbol1 ? ralist.find(x => x.rank !== symbol1)?.rank || 'A' : secondBestRankItem.rank;
			/* Assign a realistic minimal count (at least 1) */
			let targetSecCount = secondBestRankItem.value > 0 ? secondBestRankItem.value : 1;
			return [count1, rankWord1, targetSecCount, toword[targetSecRank]];
		});
	}

	/* Strategy B: Increase the number of the first component by 1 */
	strategyPool.push(() => {
		return [count1 + 1, rankWord1, currentBid[2], rankWord2];
	});

	/* Strategy C: Switch the positions of component 1 and component 2 */
	if (count2 > 0 && rankWord2 !== '_') {
		strategyPool.push(() => {
			return [count2, rankWord2, count1, rankWord1];
		});
	}

	/* Strategy D1: Increase the rank of the first component */
	let upSymbol1 = getNextRankSymbol(symbol1);
	if (upSymbol1) {
		strategyPool.push(() => {
			return [count1, toword[upSymbol1], currentBid[2], rankWord2];
		});
	}

	/* Strategy D2: Increase the rank of the second component */
	if (count2 > 0 && rankWord2 !== '_') {
		let upSymbol2 = getNextRankSymbol(symbol2);
		if (upSymbol2) {
			strategyPool.push(() => {
				return [count1, rankWord1, count2, toword[upSymbol2]];
			});
		}
	}

	/* --- PART 3: EXECUTE OR COMBINE MUTATIONS --- */
	/* Pick a random primary mutation strategy from the available pool */
	let primaryMutator = strategyPool[Math.floor(Math.random() * strategyPool.length)];
	let mutatedBid = primaryMutator();

	// /* 30% chance to layer a secondary mutation (Combination Mode) if the bid layout allows it */
	// if (Math.random() < 0.3) {
	//   /* Re-evaluate properties on our modified template */
	//   if (mutatedBid[2] === '_' || mutatedBid[2] === 0) {
	//     /* Boost quantity or elevate single rank index further */
	//     if (Math.random() > 0.5) {
	//       mutatedBid[0] += 1;
	//     } else {
	//       let nextSym = getNextRankSymbol(torank[mutatedBid[1]]);
	//       if (nextSym) mutatedBid[1] = toword[nextSym];
	//     }
	//   } else {
	//     /* Tweak numbers or step up a rank index in the split layout structure */
	//     if (Math.random() > 0.5) {
	//       mutatedBid[0] += 1;
	//     } else {
	//       let nextSym = getNextRankSymbol(torank[mutatedBid[3]]);
	//       if (nextSym) mutatedBid[3] = toword[nextSym];
	//     }
	//   }
	// }

	/* --- PART 4: VALIDATION ENGINE AND REALISTIC CEILING FALLBACK --- */
	/* Convert layout back into native evaluation values to verify mechanics */
	let testCount1 = Number(mutatedBid[0]) || 0;
	let testRank1 = torank[mutatedBid[1]];
	let testCount2 = mutatedBid[2] === '_' ? 0 : (Number(mutatedBid[2]) || 0);
	let testRank2 = torank[mutatedBid[3]];

	/* Check if it clears the technical rule system criteria */
	let isValid = false;
	try {
		if (typeof is_bid_higher_than === 'function') {
			isValid = is_bid_higher_than([testCount1, testRank1, testCount2, testRank2], [count1, symbol1, count2, symbol2]);
		}
	} catch (e) {
		isValid = false;
	}

	/* If the mutation cycle didn't satisfy validation thresholds, run a realistic fallback anchor */
	if (!isValid) {
		let totalVolume = count1 + count2;
		/* Step up total volume cleanly using the highest value physical board assets */
		mutatedBid = [
			totalVolume + 1,
			toword[bestRankItem.rank],
			'_',
			'_'
		];
	}

	return mutatedBid;
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
		console.log('diff', diff)
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
		let dcards = mDom(dt, { align: 'center', display: 'flex' });
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
		assertion(table.turn.includes(me), `BLUFF: activate inactive player ${me} ${table.turn}!!!`);
		if (stage == 1) {
			mDom(dt, {}, { html: 'Next Round', tag: 'button', onclick: async () => await processStage1(table) })
		} else {
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
				ui.panelItems.push({ div: dw, index: i, initial: b[i], state: 'unselected' })
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
			if (table.players[me].playmode == 'bot') {
				conslog('hallo');
				showMessage('activating bot...');
				TO.botsleep = await mSleep(1000);
				let move = bluffBotMove(me, table);
				showMessage(`bot ${me} ready to move: ${move.movetype} ${isdef(move.newbid) ? move.newbid.join(' ') : ''}`, 3000,
					async () => {
						if (move.movetype == 'bid') {
							//console.log('HAAAAAAAAAAAA')
							table.fen.newbid = move.newbid;
							await bluffBid(me, table, ui);
						} else if (move.movetype == 'gehtHoch') {
							await gehtHoch(me, table, ui);
						}
					});
				return;
				TO.bbb = setTimeout(
					async () => {
						//console.log('___BOT IS MOVING!!!!');},10);
						let move = bluffBotMove(me, table);
						//console.log('=>', move.movetype, move.newbid);
						showMessage(`bot ${me} moves: ${move.movetype} ${isdef(move.newbid) ? move.newbid.join(' ') : ''}`, 0,
							async () => {
								if (move.movetype == 'bid') {
									//console.log('HAAAAAAAAAAAA')
									table.fen.newbid = move.newbid;
									await bluffBid(me, table, ui);
								} else if (move.movetype == 'gehtHoch') {
									await gehtHoch(me, table, ui);
								}
							})
						//await gehtHoch(me, table, ui);
					}, 10);
			}
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
	return { setup, present, activate, process };
}
function bluffBotMove(plName, table) {
	let { ralist, wildcards } = createRankList(plName, table);

	/* 1. IRONCLAD CHALLENGE RULE: If old bid is false based on reality, challenge immediately! */
	let lastbid = table.fen.lastbid;
	if (lastbid && lastbid[0] !== '_') {
		if (calc_bid_minus_cards(table, lastbid) > 0) {
			return [null, 'gehtHoch'];
		}
	}

	let [b, moveType] = bot_clairvoyant(ralist, wildcards, lastbid);

	if (moveType === 'gehtHoch') {
		return { movetype: 'gehtHoch' };
	}

	if (b[2] == 0 || b[2] === '_') {
		b[2] = '_';
		b[3] = '_';
	}

	return {
		movetype: 'bid',
		newbid: b
	};
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
		console.log('diff', diff)
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
		let dcards = mDom(dt, { align: 'center', display: 'flex' });
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
		assertion(table.turn.includes(me), `BLUFF: activate inactive player ${me} ${table.turn}!!!`);
		if (stage == 1) {
			mDom(dt, {}, { html: 'Next Round', tag: 'button', onclick: async () => await processStage1(table) })
		} else {
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
				ui.panelItems.push({ div: dw, index: i, initial: b[i], state: 'unselected' })
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
			if (table.players[me].playmode == 'bot') {
				conslog('hallo');
				showMessage('activating bot...');
				TO.botsleep = await mSleep(1000);
				let move = bluffBotMove(me, table);
				showMessage(`bot ${me} ready to move: ${move.movetype} ${isdef(move.newbid) ? move.newbid.join(' ') : ''}`, 3000,
					async () => {
						if (move.movetype == 'bid') {
							//console.log('HAAAAAAAAAAAA')
							table.fen.newbid = move.newbid;
							await bluffBid(me, table, ui);
						} else if (move.movetype == 'gehtHoch') {
							await gehtHoch(me, table, ui);
						}
					});
				return;
				TO.bbb = setTimeout(
					async () => {
						//console.log('___BOT IS MOVING!!!!');},10);
						let move = bluffBotMove(me, table);
						//console.log('=>', move.movetype, move.newbid);
						showMessage(`bot ${me} moves: ${move.movetype} ${isdef(move.newbid) ? move.newbid.join(' ') : ''}`, 0,
							async () => {
								if (move.movetype == 'bid') {
									//console.log('HAAAAAAAAAAAA')
									table.fen.newbid = move.newbid;
									await bluffBid(me, table, ui);
								} else if (move.movetype == 'gehtHoch') {
									await gehtHoch(me, table, ui);
								}
							})
						//await gehtHoch(me, table, ui);
					}, 10);
			}
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
	return { setup, present, activate, process };
}
function select_error(msg, callback = null, stay = false) {
	let [A] = [Z.A];
	DA.callback = callback;
	if (A.maxselected == 1 && A.selected.length > 0) {
		let item = A.items[A.selected[0]];
		ari_make_unselected(item);
		A.selected = [];
	} else if (A.selected.length == 2) {
		let item = A.items[A.selected[1]];
		ari_make_unselected(item);
		A.selected = [A.selected[0]];
	}
	dError.innerHTML = msg;
	if (stay) {
		dError.innerHTML += '<br><button onclick="continue_after_error()">CLICK TO CONTINUE</button>';
	} else {
		TO.error = setTimeout(continue_after_error, 3000);
	}
}

//#region bot old code
function bot_clairvoyant(list, maxvalue, mmax, exp, nreas, n2, have2, words, fen) {
	let reduced_list = list.filter(x => x.value == list[0].value || x.mine);
	let res = reduced_list.length >= 2 ? rChoose(list, 2) : [reduced_list[0], { value: 0, rank: '_' }];
	let max = res[0].value >= res[1].value ? res[0] : res[1]; let min = res[0].value < res[1].value ? res[0] : res[1];
	let b = [max.value, max.rank, min.value, min.rank];
	if (isdef(fen.lastbid)) {
		let [n1, r1, n2, r2] = bluff_convert2ranks(fen.lastbid);
		if (!is_bid_higher_than(bluff_convert2words(b), fen.lastbid)) {
			return [null, handle_gehtHoch];
		}
	}
	return [bluff_convert2words(b), handle_bid];
}
function bot_perfect(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	let i = 0; while (list[i].rank == '2') i++;
	let b = [list[i].value + n2, list[i].rank, list[i + 1].value, list[i + 1].rank];
	list.map(x => console.log(x));
	console.log('b:', b);
	if (isdef(fen.lastbid)) {
		let [n1, r1, n2, r2] = bluff_convert2ranks(fen.lastbid);
		if (!is_bid_higher_than(bluff_convert2words(b), fen.lastbid)) {
			return [null, handle_gehtHoch];
		}
	}
	return [bluff_convert2words(b), handle_bid];
}
function bot_random(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	let ranks = rChoose('3456789TJQKA', 2);
	let b;
	if (nundef(fen.lastbid)) b = [rNumber(1, nreas), ranks[0], rNumber(1, nreas), ranks[1]];
	else if (fen.lastbid[0] > nreas + 2) {
		return [null, handle_gehtHoch];
	} else {
		[n1, r1, n2, r2] = bluff_convert2ranks(fen.lastbid);
		assertion(isNumber(n1) && n1 > 0 && isNumber(n2), 'bot_random: n1 or n2 is not a number OR n1<=0!!!!!!!', n1, n2);
		if ((n1 + n2) / 2 > nreas && coin(50)) {
			return [null, handle_gehtHoch];
		} else if ((n1 + n2) / 2 <= nreas + 1) b = n1 <= nreas + 1 ? [n1 + 1, r1, n2, r2] : [n1, r1, n2 + 1, r2];
		else {
			let [i1, i2] = [BLUFF.rankstr.indexOf(r1), BLUFF.rankstr.indexOf(r2)];
			let s = '3456789TJQKA';
			let imin = Math.min(i1, i2); let imax = Math.max(i1, i2); let i = imax == i1 ? 1 : 2;
			let [smin, between, smax] = [s.substring(0, imin), s.substring(imin + 1, imax), s.substring(imax + 1, s.length)];
			if (!isEmpty(smax)) { if (i == 1) b = [n1, rChoose(smax), n2, r2]; else b = [n1, r1, n2, rChoose(smax)]; }
			else if (!isEmpty(between)) { if (i == 2) b = [n1, rChoose(between), n2, r2]; else b = [n1, r1, n2, rChoose(between)]; }
			else return [null, handle_gehtHoch];
		}
	}
	return [bluff_convert2words(b), handle_bid];
}
function botbest(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	if (nundef(DA.ctrandom)) DA.ctrandom = 1; console.log(`${DA.ctrandom++}: ${Z.uplayer} using strategy`, Z.strategy)
	let bot = window[`bot_${Z.strategy}`];
	let [b, f] = bot(list, max, mmax, exp, nreas, n2, have2, words, fen);
	assertion(!b || b[2] != 0, 'bot returned bid with n2==0');
	return [b, f];
}
//#endregion

//#region bot muell
function bot_clairvoyant_routine(table, list, wildcards, lastbid) {
	/* ALL COMMENTS PLACED INSIDE THE FUNCTION BLOCK */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';


	let myres = bot_clairvoyant(list, wildcards, lastbid);
	//conslog('myres', myres); //assertion(false, '* THE END *')
	return myres; // [myres, 'bid'];

	/* 2. BID ESCALATION: Bid is true, so we safely increase value thresholds */

	let currentBid = lastbid ? [
		Number(lastbid[0]),
		torank[lastbid[1]] || lastbid[1],
		lastbid[2] === '_' ? '_' : Number(lastbid[2]),
		torank[lastbid[3]] || lastbid[3]
	] : [0, '_', '_', '_'];

	let oldVolume = currentBid[0] + (currentBid[2] === '_' ? 0 : currentBid[2]);
	let reduced_list = list.filter(x => x.mine || x.value > 0);

	let maxItem = reduced_list[0];
	let minItem = reduced_list[1] || { rank: '_', value: 0 };
	let b = null;

	if (oldVolume > 0) {
		let highestOldRankIdx = Math.max(
			rankOrder.indexOf(currentBid[1]),
			rankOrder.indexOf(currentBid[3])
		);

		let higherRanks = list.filter(x => x.irank > highestOldRankIdx);

		if (higherRanks.length > 0) {
			let targetRankItem = higherRanks[0];
			if (currentBid[2] !== '_') {
				b = [currentBid[0], toword[targetRankItem.rank], currentBid[2], toword[minItem.rank]];
			} else {
				b = [currentBid[0], toword[targetRankItem.rank], '_', '_'];
			}
		} else if (currentBid[2] === '_') {
			/* Tie-break conversion: split a single rank to match total volume using upper rank items */
			let pRank = list[0];
			let sRank = list[1] || list[0];
			let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
			let sCount = oldVolume - pCount;

			b = [pCount, toword[pRank.rank], sCount, toword[sRank.rank]];
		}
	}

	/* Fallback volume increase loop if rank escalation parameters couldn't settle it cleanly */
	if (!b || !is_bid_higher_than([b[0], torank[b[1]], b[2] === '_' ? '_' : b[2], torank[b[3]]], currentBid)) {
		let targetVolume = oldVolume + 1;
		b = [
			targetVolume,
			toword[maxItem.rank] || '_',
			'_',
			'_'
		];
	}

	return [b, 'bid'];
}
function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES --- */
	/* Sort the global candidates using your priority ranking property 'i' */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* Filter out ranks that have zero cards globally, then sort by rankOrder index ascending */
	let activeRanks = rank_list.filter(x => x.value >= 1);
	let smallestPresentRankItem = activeRanks.length > 0
		? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
		: candidates[0];

	let minimalBid = [
		1,
		toword[smallestPresentRankItem.rank] || '_',
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	/* Extract total global wildcards safely by assessing the 'i' sorting evaluation layout gap */
	let sampleItem = rank_list[0] || { i: 0, irank: 0, value: 0 };
	let itemI = Number(sampleItem.i) || 0;
	let itemIrank = Number(sampleItem.irank) || 0;
	let itemNatural = Number(sampleItem.value) || 0;

	let totalWildcards = Math.max(0, Math.round((itemI - itemIrank) / 100) - itemNatural);

	let maxItem = candidates[0] || { rank: '_', value: 0 };

	/* FIXED: Find the true second highest available rank from rank_list (excluding maxItem) that actually has cards */
	//console.log('rank_list', rank_list)
	//console.log('maxItem', maxItem)
	let remainingCandidates = rank_list.filter(x => x.rank !== maxItem.rank && x.value >= 1);
	//console.log('remainingCandidates', remainingCandidates)
	assertion(remainingCandidates.length > 0, 'remainingCandidates 0!!!!')
	let minItem = remainingCandidates.length > 0 ? remainingCandidates[0] : null;

	/* Primary rank gets its maximal value (natural + all wildcards) */
	let finalMaxCount = (Number(maxItem.value) || 0) + totalWildcards;

	/* FIXED: Secondary rank uses its maximal value. If there is no distinct second rank with cards, look to fallback placeholders */
	let finalMinCount = minItem ? (Number(minItem.value) || 0) : 0;
	let finalMinRankWord = minItem ? (toword[minItem.rank] || '_') : '_';

	/* FIXED: If a second rank exists, include it unconditionally regardless of whether its count is 0, matching requested layout [1, 'king', 1, 'ten'] */
	let highestPossibleBid = [
		finalMaxCount,
		toword[maxItem.rank] || '_',
		finalMinRankWord !== '_' ? finalMinCount : '_',
		finalMinRankWord
	];

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* If there is no previous bid, the next minimal choice is mirror-anchored directly on minimalBid */
	if (currentBid === null || currentBid[0] === 0 || currentBid[0] === '_') {
		return {
			minimalBid,
			highestPossibleBid,
			minimalNextBid: [...minimalBid]
		};
	}

	/* Normalize active input parameters into functional tracking types with safe default boundaries */
	let oldCount1 = Number(currentBid[0]) || 0;
	let oldRank1 = torank[currentBid[1]] || '_';
	let oldCount2 = currentBid[2] === '_' ? 0 : (Number(currentBid[2]) || 0);
	let oldRank2 = torank[currentBid[3]] || '_';

	let oldVolume = oldCount1 + oldCount2;
	let oldMaxRankIdx = Math.max(rankOrder.indexOf(oldRank1), rankOrder.indexOf(oldRank2));

	let minimalNextBid = null;

	/* Strategy A: Try keeping the EXACT same card volume, but step up the rank index tie-breaker */
	let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > oldMaxRankIdx);

	if (singleHigherRanks.length > 0) {
		singleHigherRanks.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value;
			return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
		});

		let targetRank = singleHigherRanks[0].rank;

		if (currentBid[2] !== '_') {
			minimalNextBid = [oldCount1, toword[targetRank] || '_', oldCount2, currentBid[3] || '_'];
		} else {
			minimalNextBid = [oldCount1, toword[targetRank] || '_', '_', '_'];
		}
	}
	/* Strategy B: Convert a single high-rank bid to a split combo at identical volume to squeeze past it */
	else if (currentBid[2] === '_') {
		let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
		let sCount = oldVolume - pCount;

		let pRank = maxItem.rank;
		let sRank = minItem ? minItem.rank : maxItem.rank;

		let testBid = [pCount, toword[pRank] || '_', sCount, toword[sRank] || '_'];

		if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
			minimalNextBid = testBid;
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card. Anchored on our best physical holdings. */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[maxItem.rank] || '_',
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}

function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES --- */
	/* Sort the global candidates using your priority ranking property 'i' */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* Filter out ranks that have zero cards globally, then sort by rankOrder index ascending */
	let activeRanks = rank_list.filter(x => x.value >= 1);
	let smallestPresentRankItem = activeRanks.length > 0
		? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
		: candidates[0];

	let minimalBid = [
		1,
		toword[smallestPresentRankItem.rank] || '_',
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	/* Extract total global wildcards safely by assessing the 'i' sorting evaluation layout gap */
	let sampleItem = rank_list[0] || { i: 0, irank: 0, naturalCount: 0 };
	let itemI = Number(sampleItem.i) || 0;
	let itemIrank = Number(sampleItem.irank) || 0;
	let itemNatural = Number(sampleItem.naturalCount) || 0;

	let totalWildcards = Math.max(0, Math.round((itemI - itemIrank) / 100) - itemNatural);

	let maxItem = candidates[0] || { rank: '_', naturalCount: 0 };

	/* FIXED: Find the true second highest available rank from rank_list (excluding maxItem) that actually has cards */
	let remainingCandidates = rank_list.filter(x => x.rank !== maxItem.rank && x.value >= 1);
	let minItem = remainingCandidates.length > 0 ? remainingCandidates[0] : null;

	/* Primary rank gets its maximal value (natural + all wildcards) */
	let finalMaxCount = (Number(maxItem.naturalCount) || 0) + totalWildcards;

	/* FIXED: Secondary rank uses its maximal value. If there is no distinct second rank with cards, look to fallback placeholders */
	let finalMinCount = minItem ? (Number(minItem.naturalCount) || 0) : 0;
	let finalMinRankWord = minItem ? (toword[minItem.rank] || '_') : '_';

	/* FIXED: If a second rank exists, include it unconditionally regardless of whether its count is 0, matching requested layout [1, 'king', 1, 'ten'] */
	let highestPossibleBid = [
		finalMaxCount,
		toword[maxItem.rank] || '_',
		finalMinRankWord !== '_' ? finalMinCount : '_',
		finalMinRankWord
	];

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* If there is no previous bid, the next minimal choice is mirror-anchored directly on minimalBid */
	if (currentBid === null || currentBid[0] === 0 || currentBid[0] === '_') {
		return {
			minimalBid,
			highestPossibleBid,
			minimalNextBid: [...minimalBid]
		};
	}

	/* Normalize active input parameters into functional tracking types with safe default boundaries */
	let oldCount1 = Number(currentBid[0]) || 0;
	let oldRank1 = torank[currentBid[1]] || '_';
	let oldCount2 = currentBid[2] === '_' ? 0 : (Number(currentBid[2]) || 0);
	let oldRank2 = torank[currentBid[3]] || '_';

	let oldVolume = oldCount1 + oldCount2;
	let oldMaxRankIdx = Math.max(rankOrder.indexOf(oldRank1), rankOrder.indexOf(oldRank2));

	let minimalNextBid = null;

	/* Strategy A: Try keeping the EXACT same card volume, but step up the rank index tie-breaker */
	let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > oldMaxRankIdx);

	if (singleHigherRanks.length > 0) {
		singleHigherRanks.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value;
			return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
		});

		let targetRank = singleHigherRanks[0].rank;

		if (currentBid[2] !== '_') {
			minimalNextBid = [oldCount1, toword[targetRank] || '_', oldCount2, currentBid[3] || '_'];
		} else {
			minimalNextBid = [oldCount1, toword[targetRank] || '_', '_', '_'];
		}
	}
	/* Strategy B: Convert a single high-rank bid to a split combo at identical volume to squeeze past it */
	else if (currentBid[2] === '_') {
		let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
		let sCount = oldVolume - pCount;

		let pRank = maxItem.rank;
		let sRank = minItem ? minItem.rank : maxItem.rank;

		let testBid = [pCount, toword[pRank] || '_', sCount, toword[sRank] || '_'];

		if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
			minimalNextBid = testBid;
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card. Anchored on our best physical holdings. */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[maxItem.rank] || '_',
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}

function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES --- */
	/* Sort the global candidates using your priority ranking property 'i' */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* Filter out ranks that have zero cards globally, then sort by rankOrder index ascending */
	let activeRanks = rank_list.filter(x => x.value >= 1);
	let smallestPresentRankItem = activeRanks.length > 0
		? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
		: candidates[0];

	let minimalBid = [
		1,
		toword[smallestPresentRankItem.rank] || '_',
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	/* Extract total global wildcards safely by assessing the 'i' sorting evaluation layout gap */
	let sampleItem = rank_list[0] || { i: 0, irank: 0, naturalCount: 0 };
	let itemI = Number(sampleItem.i) || 0;
	let itemIrank = Number(sampleItem.irank) || 0;
	let itemNatural = Number(sampleItem.naturalCount) || 0;

	let totalWildcards = Math.max(0, Math.round((itemI - itemIrank) / 100) - itemNatural);

	let maxItem = candidates[0] || { rank: '_', naturalCount: 0 };

	/* Find the true second highest available rank from rank_list (excluding maxItem) that actually has cards */
	let remainingCandidates = rank_list.filter(x => x.rank !== maxItem.rank && x.value >= 1);
	let minItem = remainingCandidates.length > 0 ? remainingCandidates[0] : null;

	/* Primary rank gets its maximal value (natural + all wildcards) */
	let finalMaxCount = (Number(maxItem.naturalCount) || 0) + totalWildcards;

	/* Secondary rank uses its maximal value */
	let finalMinCount = 1; //minItem ? (Number(minItem.naturalCount) || 0) : 0;
	let finalMinRankWord = minItem ? (toword[minItem.rank] || '_') : '_';

	let highestPossibleBid = [
		finalMaxCount,
		toword[maxItem.rank] || '_',
		finalMinRankWord !== '_' ? finalMinCount : '_',
		finalMinRankWord
	];

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* If there is no previous bid, the next minimal choice is mirror-anchored directly on minimalBid */
	if (currentBid === null || currentBid[0] === 0 || currentBid[0] === '_') {
		return {
			minimalBid,
			highestPossibleBid,
			minimalNextBid: [...minimalBid]
		};
	}

	/* Normalize active input parameters into functional tracking types with safe default boundaries */
	let oldCount1 = Number(currentBid[0]) || 0;
	let oldRank1 = torank[currentBid[1]] || '_';
	let oldCount2 = currentBid[2] === '_' ? 0 : (Number(currentBid[2]) || 0);
	let oldRank2 = torank[currentBid[3]] || '_';

	let oldVolume = oldCount1 + oldCount2;
	let minimalNextBid = null;

	/* FIXED STRATEGY A & B: Evaluate rank order escalation choices across all active options */
	if (oldCount2 > 0) {
		/* Two-Rank Bid Tweak Rule: Try to increase strictly the secondary rank first to find the minimal option */
		let secondaryHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > rankOrder.indexOf(oldRank2));
		if (secondaryHigherRanks.length > 0) {
			secondaryHigherRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
			let targetSecRank = secondaryHigherRanks[0].rank;

			/* Build candidate test bid matching the current primary counts */
			let testBid = [oldCount1, currentBid[1], oldCount2, toword[targetSecRank]];
			if (is_bid_higher_than([oldCount1, oldRank1, oldCount2, targetSecRank], [oldCount1, oldRank1, oldCount2, oldRank2])) {
				minimalNextBid = testBid;
			}
		}

		/* If lifting secondary rank isn't enough or valid, try stepping up the primary rank value layout */
		if (minimalNextBid === null) {
			let primaryHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > rankOrder.indexOf(oldRank1));
			if (primaryHigherRanks.length > 0) {
				primaryHigherRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
				let targetPrimRank = primaryHigherRanks[0].rank;

				let testBid = [oldCount1, toword[targetPrimRank], oldCount2, currentBid[3]];
				if (is_bid_higher_than([oldCount1, targetPrimRank, oldCount2, oldRank2], [oldCount1, oldRank1, oldCount2, oldRank2])) {
					minimalNextBid = testBid;
				}
			}
		}
	} else {
		/* Single-Rank Bid Tweak Rule: Find the absolute closest next card rank available */
		let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > rankOrder.indexOf(oldRank1));
		if (singleHigherRanks.length > 0) {
			singleHigherRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
			let targetRank = singleHigherRanks[0].rank;
			minimalNextBid = [oldCount1, toword[targetRank], '_', '_'];
		}

		/* Alternate split-conversion tie-breaker fallback */
		if (minimalNextBid === null && currentBid[2] === '_') {
			let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
			let sCount = oldVolume - pCount;
			let pRank = maxItem.rank;
			let sRank = minItem ? minItem.rank : maxItem.rank;

			let testBid = [pCount, toword[pRank] || '_', sCount, toword[sRank] || '_'];
			if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
				minimalNextBid = testBid;
			}
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card using the absolute lowest present ranking */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[smallestPresentRankItem.rank] || '_',
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}

function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES FOR MAXIMUM VALUES --- */
	/* Sort the global candidates directly by natural card count descending first */
	let highestCountRanks = rank_list.slice().sort((a, b) => b.naturalCount - a.naturalCount);
	let maxItem = highestCountRanks[0] || { rank: '_', naturalCount: 0 };

	/* Find the true second highest rank available on the board (has at least 1 card globally) */
	let remainingCandidates = rank_list.filter(x => x.rank !== maxItem.rank && x.naturalCount >= 1);

	/* Sort remaining secondary candidates by value/rank priority so the absolute strongest secondary surfaces */
	remainingCandidates.sort((a, b) => b.i - a.i);
	let minItem = remainingCandidates[0] || null;

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* Filter out ranks that have zero cards globally, then sort by rankOrder index ascending */
	let activeRanks = rank_list.filter(x => x.naturalCount >= 1 || x.value >= 1);
	let smallestPresentRankItem = activeRanks.length > 0
		? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
		: maxItem;

	let minimalBid = [
		1,
		toword[smallestPresentRankItem.rank] || '_',
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	/* Extract total global wildcards safely by assessing the 'i' sorting evaluation layout gap */
	let sampleItem = rank_list[0] || { i: 0, irank: 0, naturalCount: 0 };
	let itemI = Number(sampleItem.i) || 0;
	let itemIrank = Number(sampleItem.irank) || 0;
	let itemNatural = Number(sampleItem.naturalCount) || 0;
	let totalWildcards = Math.max(0, Math.round((itemI - itemIrank) / 100) - itemNatural);

	/* Primary rank gets its maximal value (natural + all wildcards) */
	let finalMaxCount = (Number(maxItem.naturalCount) || 0) + totalWildcards;

	/* FIXED: Secondary rank uses its real natural count, enforced to be at least 1 if a minItem exists */
	let finalMinCount = minItem ? Math.max(1, Number(minItem.naturalCount) || 0) : '_';
	let finalMinRankWord = minItem ? (toword[minItem.rank] || '_') : '_';

	let highestPossibleBid = [
		finalMaxCount,
		toword[maxItem.rank] || '_',
		finalMinRankWord !== '_' ? finalMinCount : '_',
		finalMinRankWord
	];

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* If there is no previous bid, or it is empty/zero, match layout directly to minimalBid */
	if (currentBid === null || currentBid[0] === 0 || currentBid[0] === '_') {
		return {
			minimalBid,
			highestPossibleBid,
			minimalNextBid: [...minimalBid]
		};
	}

	/* Normalize active input parameters into functional tracking types with safe default boundaries */
	let oldCount1 = Number(currentBid[0]) || 0;
	let oldRank1 = torank[currentBid[1]] || '_';
	let oldCount2 = currentBid[2] === '_' ? 0 : (Number(currentBid[2]) || 0);
	let oldRank2 = torank[currentBid[3]] || '_';

	let oldVolume = oldCount1 + oldCount2;
	let minimalNextBid = null;

	if (oldCount2 > 0) {
		/* Two-Rank Bid Tweak Rule: Try to increase strictly the secondary rank first to find the minimal option */
		let secondaryHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > rankOrder.indexOf(oldRank2));
		if (secondaryHigherRanks.length > 0) {
			secondaryHigherRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
			let targetSecRank = secondaryHigherRanks[0].rank;

			let testBid = [oldCount1, currentBid[1], oldCount2, toword[targetSecRank]];
			if (is_bid_higher_than([oldCount1, oldRank1, oldCount2, targetSecRank], [oldCount1, oldRank1, oldCount2, oldRank2])) {
				minimalNextBid = testBid;
			}
		}

		/* If lifting secondary rank isn't enough or valid, try stepping up the primary rank value layout */
		if (minimalNextBid === null) {
			let primaryHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > rankOrder.indexOf(oldRank1));
			if (primaryHigherRanks.length > 0) {
				primaryHigherRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
				let targetPrimRank = primaryHigherRanks[0].rank;

				let testBid = [oldCount1, toword[targetPrimRank], oldCount2, currentBid[3]];
				if (is_bid_higher_than([oldCount1, targetPrimRank, oldCount2, oldRank2], [oldCount1, oldRank1, oldCount2, oldRank2])) {
					minimalNextBid = testBid;
				}
			}
		}
	} else {
		/* Single-Rank Bid Tweak Rule: Find the absolute closest next card rank available */
		let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > rankOrder.indexOf(oldRank1));
		if (singleHigherRanks.length > 0) {
			singleHigherRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
			let targetRank = singleHigherRanks[0].rank;
			minimalNextBid = [oldCount1, toword[targetRank], '_', '_'];
		}

		/* Alternate split-conversion tie-breaker fallback */
		if (minimalNextBid === null && currentBid[2] === '_') {
			let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
			let sCount = oldVolume - pCount;
			let pRank = maxItem.rank;
			let sRank = minItem ? minItem.rank : maxItem.rank;

			let testBid = [pCount, toword[pRank] || '_', sCount, toword[sRank] || '_'];
			if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
				minimalNextBid = testBid;
			}
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card using the absolute lowest present ranking */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[smallestPresentRankItem.rank] || '_',
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}

function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES --- */
	/* Sort the global candidates using your priority ranking property 'i' */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* Filter out ranks that have zero cards globally, then sort by rankOrder index ascending */
	let activeRanks = rank_list.filter(x => x.value >= 1);

	/* Fallback to the absolute first item if for some reason everything is empty */
	let smallestPresentRankItem = activeRanks.length > 0
		? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
		: candidates[0];

	/* The absolute minimal bid uses a quantity of 1 of that smallest present card rank */
	let minimalBid = [
		1,
		toword[smallestPresentRankItem.rank],
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	let maxItem = candidates[0];
	let minItem = candidates[1] || { rank: '_', value: 0 };

	/* Format the absolute structural ceiling of what exists on the layout */
	let highestPossibleBid = [
		maxItem.value,
		toword[maxItem.rank],
		minItem.value === 0 ? '_' : minItem.value,
		minItem.value === 0 ? '_' : toword[minItem.rank]
	];

	if (currentBid === null) {
		currentBid = [0, '_', '_', '_'];
	}

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* Normalize the input parameters into numbers and rank indices */
	let oldCount1 = Number(currentBid[0]);
	let oldRank1 = torank[currentBid[1]];
	let oldCount2 = currentBid[2] === '_' ? 0 : Number(currentBid[2]);
	let oldRank2 = torank[currentBid[3]];

	let oldVolume = oldCount1 + oldCount2;
	let oldMaxRankIdx = Math.max(rankOrder.indexOf(oldRank1), rankOrder.indexOf(oldRank2));

	let minimalNextBid = null;

	/* Strategy A: Try keeping the EXACT same card volume, but step up the rank index tie-breaker */
	let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > oldMaxRankIdx);

	if (singleHigherRanks.length > 0) {
		/* Sort higher ranks to pick our most comfortable target item (highest value/mine) */
		singleHigherRanks.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value;
			return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
		});

		let targetRank = singleHigherRanks[0].rank;

		if (currentBid[2] !== '_') {
			/* Preserve secondary count structure if old bid was split */
			minimalNextBid = [oldCount1, toword[targetRank], oldCount2, currentBid[3]];
		} else {
			/* Maintain clean single-rank layout */
			minimalNextBid = [oldCount1, toword[targetRank], '_', '_'];
		}
	}
	/* Strategy B: Convert a single high-rank bid to a split combo at identical volume to squeeze past it */
	else if (currentBid[2] === '_') {
		let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
		let sCount = oldVolume - pCount;

		/* Pull top choices directly from our custom prioritized list */
		let pRank = candidates[0].rank;
		let sRank = (candidates[1] || candidates[0]).rank;

		let testBid = [pCount, toword[pRank], sCount, toword[sRank]];

		/* Make sure our custom combination conversion successfully satisfies rule-engine indexing validations */
		if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
			minimalNextBid = testBid;
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card. Anchored on our best physical holdings. */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[candidates[0].rank],
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}

function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES --- */
	/* Sort the global candidates using your priority ranking property 'i' */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* Filter out ranks that have zero cards globally, then sort by rankOrder index ascending */
	let activeRanks = rank_list.filter(x => x.value >= 1);
	let smallestPresentRankItem = activeRanks.length > 0
		? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
		: candidates[0];

	let minimalBid = [
		1,
		toword[smallestPresentRankItem.rank],
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	/* Extract total global wildcards safely by assessing the 'i' sorting evaluation layout gap */
	let sampleItem = rank_list[0];
	let totalWildcards = Math.round((sampleItem.i - sampleItem.irank) / 100) - sampleItem.naturalCount;

	let maxItem = candidates[0];
	let minItem = candidates[1] || { rank: '_', value: 0 };

	/* FIXED MAXIMAL BID: Distribute wildcards completely to the primary high-value rank to maximize capacity */
	let finalMaxCount = maxItem.naturalCount + totalWildcards;
	let finalMinCount = minItem.rank !== '_' ? minItem.naturalCount : 0;

	let highestPossibleBid = [
		finalMaxCount,
		toword[maxItem.rank],
		finalMinCount === 0 ? '_' : finalMinCount,
		finalMinCount === 0 ? '_' : toword[minItem.rank]
	];

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* FIXED: If there is no previous bid, the next minimal choice is mirror-anchored directly on minimalBid */
	if (currentBid === null || currentBid[0] === 0 || currentBid[0] === '_') {
		return {
			minimalBid,
			highestPossibleBid,
			minimalNextBid: [...minimalBid]
		};
	}

	/* Normalize active input parameters into functional tracking types */
	let oldCount1 = Number(currentBid[0]);
	let oldRank1 = torank[currentBid[1]];
	let oldCount2 = currentBid[2] === '_' ? 0 : Number(currentBid[2]);
	let oldRank2 = torank[currentBid[3]];

	let oldVolume = oldCount1 + oldCount2;
	let oldMaxRankIdx = Math.max(rankOrder.indexOf(oldRank1), rankOrder.indexOf(oldRank2));

	let minimalNextBid = null;

	/* Strategy A: Try keeping the EXACT same card volume, but step up the rank index tie-breaker */
	let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > oldMaxRankIdx);

	if (singleHigherRanks.length > 0) {
		singleHigherRanks.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value;
			return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
		});

		let targetRank = singleHigherRanks[0].rank;

		if (currentBid[2] !== '_') {
			minimalNextBid = [oldCount1, toword[targetRank], oldCount2, currentBid[3]];
		} else {
			minimalNextBid = [oldCount1, toword[targetRank], '_', '_'];
		}
	}
	/* Strategy B: Convert a single high-rank bid to a split combo at identical volume to squeeze past it */
	else if (currentBid[2] === '_') {
		let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
		let sCount = oldVolume - pCount;

		let pRank = candidates[0].rank;
		let sRank = (candidates[1] || candidates[0]).rank;

		let testBid = [pCount, toword[pRank], sCount, toword[sRank]];

		if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
			minimalNextBid = testBid;
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card. Anchored on our best physical holdings. */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[candidates[0].rank],
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}

function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES --- */
	/* Sort the global candidates using your priority ranking property 'i' */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* Filter out ranks that have zero cards globally, then sort by rankOrder index ascending */
	let activeRanks = rank_list.filter(x => x.value >= 1);
	let smallestPresentRankItem = activeRanks.length > 0
		? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
		: candidates[0];

	let minimalBid = [
		1,
		toword[smallestPresentRankItem.rank] || '_',
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	/* FIXED: Use a fallback to 0 if naturalCount or i properties are missing/corrupted to prevent NaN */
	let sampleItem = rank_list[0] || { i: 0, irank: 0, naturalCount: 0 };
	let itemI = Number(sampleItem.i) || 0;
	let itemIrank = Number(sampleItem.irank) || 0;
	let itemNatural = Number(sampleItem.naturalCount) || 0;

	let totalWildcards = Math.max(0, Math.round((itemI - itemIrank) / 100) - itemNatural);

	let maxItem = candidates[0] || { rank: '_', naturalCount: 0 };
	let minItem = candidates[1] || { rank: '_', naturalCount: 0 };

	/* Ensure we parse pure numbers cleanly for card counts */
	let finalMaxCount = (Number(maxItem.naturalCount) || 0) + totalWildcards;
	let finalMinCount = minItem.rank !== '_' ? (Number(minItem.naturalCount) || 0) : 0;

	/* FIXED: Absolute safeguard against undefined values leaking into the output string array */
	let highestPossibleBid = [
		finalMaxCount,
		toword[maxItem.rank] || '_',
		finalMinCount === 0 ? '_' : finalMinCount,
		finalMinCount === 0 ? '_' : (toword[minItem.rank] || '_')
	];

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* If there is no previous bid, the next minimal choice is mirror-anchored directly on minimalBid */
	if (currentBid === null || currentBid[0] === 0 || currentBid[0] === '_') {
		return {
			minimalBid,
			highestPossibleBid,
			minimalNextBid: [...minimalBid]
		};
	}

	/* Normalize active input parameters into functional tracking types with safe default boundaries */
	let oldCount1 = Number(currentBid[0]) || 0;
	let oldRank1 = torank[currentBid[1]] || '_';
	let oldCount2 = currentBid[2] === '_' ? 0 : (Number(currentBid[2]) || 0);
	let oldRank2 = torank[currentBid[3]] || '_';

	let oldVolume = oldCount1 + oldCount2;
	let oldMaxRankIdx = Math.max(rankOrder.indexOf(oldRank1), rankOrder.indexOf(oldRank2));

	let minimalNextBid = null;

	/* Strategy A: Try keeping the EXACT same card volume, but step up the rank index tie-breaker */
	let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > oldMaxRankIdx);

	if (singleHigherRanks.length > 0) {
		singleHigherRanks.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value;
			return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
		});

		let targetRank = singleHigherRanks[0].rank;

		if (currentBid[2] !== '_') {
			minimalNextBid = [oldCount1, toword[targetRank] || '_', oldCount2, currentBid[3] || '_'];
		} else {
			minimalNextBid = [oldCount1, toword[targetRank] || '_', '_', '_'];
		}
	}
	/* Strategy B: Convert a single high-rank bid to a split combo at identical volume to squeeze past it */
	else if (currentBid[2] === '_') {
		let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
		let sCount = oldVolume - pCount;

		let pRank = maxItem.rank;
		let sRank = minItem.rank !== '_' ? minItem.rank : maxItem.rank;

		let testBid = [pCount, toword[pRank] || '_', sCount, toword[sRank] || '_'];

		if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
			minimalNextBid = testBid;
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card. Anchored on our best physical holdings. */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[maxItem.rank] || '_',
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}

function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES --- */
	/* Sort the global candidates using your priority ranking property 'i' */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* Filter out ranks that have zero cards globally, then sort by rankOrder index ascending */
	let activeRanks = rank_list.filter(x => x.value >= 1);
	let smallestPresentRankItem = activeRanks.length > 0
		? activeRanks.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0]
		: candidates[0];

	let minimalBid = [
		1,
		toword[smallestPresentRankItem.rank] || '_',
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	/* Extract total global wildcards safely by assessing the 'i' sorting evaluation layout gap */
	let sampleItem = rank_list[0] || { i: 0, irank: 0, naturalCount: 0 };
	let itemI = Number(sampleItem.i) || 0;
	let itemIrank = Number(sampleItem.irank) || 0;
	let itemNatural = Number(sampleItem.naturalCount) || 0;

	let totalWildcards = Math.max(0, Math.round((itemI - itemIrank) / 100) - itemNatural);

	let maxItem = candidates[0] || { rank: '_', naturalCount: 0 };
	let minItem = candidates[1] || { rank: '_', naturalCount: 0 };

	/* FIXED: Primary rank gets its maximal value (natural + all wildcards) */
	let finalMaxCount = (Number(maxItem.naturalCount) || 0) + totalWildcards;

	/* FIXED: Secondary rank now explicitly uses its own maximal natural value instead of 0 or undefined */
	let finalMinCount = minItem.rank !== '_' ? (Number(minItem.naturalCount) || 0) : 0;

	/* Absolute safeguard against undefined or NaN values leaking into the highest possible bid output */
	let highestPossibleBid = [
		finalMaxCount,
		toword[maxItem.rank] || '_',
		finalMinCount === 0 ? '_' : finalMinCount,
		finalMinCount === 0 ? '_' : (toword[minItem.rank] || '_')
	];

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* If there is no previous bid, the next minimal choice is mirror-anchored directly on minimalBid */
	if (currentBid === null || currentBid[0] === 0 || currentBid[0] === '_') {
		return {
			minimalBid,
			highestPossibleBid,
			minimalNextBid: [...minimalBid]
		};
	}

	/* Normalize active input parameters into functional tracking types with safe default boundaries */
	let oldCount1 = Number(currentBid[0]) || 0;
	let oldRank1 = torank[currentBid[1]] || '_';
	let oldCount2 = currentBid[2] === '_' ? 0 : (Number(currentBid[2]) || 0);
	let oldRank2 = torank[currentBid[3]] || '_';

	let oldVolume = oldCount1 + oldCount2;
	let oldMaxRankIdx = Math.max(rankOrder.indexOf(oldRank1), rankOrder.indexOf(oldRank2));

	let minimalNextBid = null;

	/* Strategy A: Try keeping the EXACT same card volume, but step up the rank index tie-breaker */
	let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > oldMaxRankIdx);

	if (singleHigherRanks.length > 0) {
		singleHigherRanks.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value;
			return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
		});

		let targetRank = singleHigherRanks[0].rank;

		if (currentBid[2] !== '_') {
			minimalNextBid = [oldCount1, toword[targetRank] || '_', oldCount2, currentBid[3] || '_'];
		} else {
			minimalNextBid = [oldCount1, toword[targetRank] || '_', '_', '_'];
		}
	}
	/* Strategy B: Convert a single high-rank bid to a split combo at identical volume to squeeze past it */
	else if (currentBid[2] === '_') {
		let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
		let sCount = oldVolume - pCount;

		let pRank = maxItem.rank;
		let sRank = minItem.rank !== '_' ? minItem.rank : maxItem.rank;

		let testBid = [pCount, toword[pRank] || '_', sCount, toword[sRank] || '_'];

		if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
			minimalNextBid = testBid;
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card. Anchored on our best physical holdings. */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[maxItem.rank] || '_',
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}


function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	/* Sort the global candidates using the custom value-then-ownership priority rule */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	let maxItem = candidates[0];
	let minItem = candidates[1] || { rank: '_', value: 0 };

	/* Format the absolute structural ceiling of what exists on the layout */
	let highestPossibleBid = [
		maxItem.value,
		toword[maxItem.rank],
		minItem.value === 0 ? '_' : minItem.value,
		minItem.value === 0 ? '_' : toword[minItem.rank]
	];

	if (currentBid === null) {
		currentBid = [0, '_', '_', '_'];

		//return { highestPossibleBid, minimalNextBid: null };
	}

	/* --- PART 2: FIND MINIMAL HIGHER BID --- */
	/* Normalize the input parameters into numbers and rank indices */
	let oldCount1 = Number(currentBid[0]);
	let oldRank1 = torank[currentBid[1]];
	let oldCount2 = currentBid[2] === '_' ? 0 : Number(currentBid[2]);
	let oldRank2 = torank[currentBid[3]];

	let oldVolume = oldCount1 + oldCount2;
	let oldMaxRankIdx = Math.max(rankOrder.indexOf(oldRank1), rankOrder.indexOf(oldRank2));

	let minimalNextBid = null;

	/* Strategy A: Try keeping the EXACT same card volume, but step up the rank index tie-breaker */
	let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > oldMaxRankIdx);

	if (singleHigherRanks.length > 0) {
		/* Sort higher ranks to pick our most comfortable target item (highest value/mine) */
		singleHigherRanks.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value;
			return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
		});

		let targetRank = singleHigherRanks[0].rank;

		if (currentBid[2] !== '_') {
			/* Preserve secondary count structure if old bid was split */
			minimalNextBid = [oldCount1, toword[targetRank], oldCount2, currentBid[3]];
		} else {
			/* Maintain clean single-rank layout */
			minimalNextBid = [oldCount1, toword[targetRank], '_', '_'];
		}
	}
	/* Strategy B: Convert a single high-rank bid to a split combo at identical volume to squeeze past it */
	else if (currentBid[2] === '_') {
		let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
		let sCount = oldVolume - pCount;

		/* Pull top choices directly from our custom prioritized list */
		let pRank = candidates[0].rank;
		let sRank = (candidates[1] || candidates[0]).rank;

		let testBid = [pCount, toword[pRank], sCount, toword[sRank]];

		/* Make sure our custom combination conversion successfully satisfies rule-engine indexing validations */
		if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
			minimalNextBid = testBid;
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card. Anchored on our best physical holdings. */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[candidates[0].rank],
			'_',
			'_'
		];
	}

	return {
		highestPossibleBid,
		minimalNextBid
	};
}

function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES --- */
	/* Sort the global candidates using your priority ranking property 'i' */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* The absolute minimal valid bid is always 1 of the bot's prioritized rank option */
	let lowestRankItem = candidates[0];
	let minimalBid = [
		1,
		toword[lowestRankItem.rank],
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	let maxItem = candidates[0];
	let minItem = candidates[1] || { rank: '_', value: 0 };

	/* Format the absolute structural ceiling of what exists on the layout */
	let highestPossibleBid = [
		maxItem.value,
		toword[maxItem.rank],
		minItem.value === 0 ? '_' : minItem.value,
		minItem.value === 0 ? '_' : toword[minItem.rank]
	];

	if (currentBid === null) {
		currentBid = [0, '_', '_', '_'];
	}

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* Normalize the input parameters into numbers and rank indices */
	let oldCount1 = Number(currentBid[0]);
	let oldRank1 = torank[currentBid[1]];
	let oldCount2 = currentBid[2] === '_' ? 0 : Number(currentBid[2]);
	let oldRank2 = torank[currentBid[3]];

	let oldVolume = oldCount1 + oldCount2;
	let oldMaxRankIdx = Math.max(rankOrder.indexOf(oldRank1), rankOrder.indexOf(oldRank2));

	let minimalNextBid = null;

	/* Strategy A: Try keeping the EXACT same card volume, but step up the rank index tie-breaker */
	let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > oldMaxRankIdx);

	if (singleHigherRanks.length > 0) {
		/* Sort higher ranks to pick our most comfortable target item (highest value/mine) */
		singleHigherRanks.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value;
			return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
		});

		let targetRank = singleHigherRanks[0].rank;

		if (currentBid[2] !== '_') {
			/* Preserve secondary count structure if old bid was split */
			minimalNextBid = [oldCount1, toword[targetRank], oldCount2, currentBid[3]];
		} else {
			/* Maintain clean single-rank layout */
			minimalNextBid = [oldCount1, toword[targetRank], '_', '_'];
		}
	}
	/* Strategy B: Convert a single high-rank bid to a split combo at identical volume to squeeze past it */
	else if (currentBid[2] === '_') {
		let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
		let sCount = oldVolume - pCount;

		/* Pull top choices directly from our custom prioritized list */
		let pRank = candidates[0].rank;
		let sRank = (candidates[1] || candidates[0]).rank;

		let testBid = [pCount, toword[pRank], sCount, toword[sRank]];

		/* Make sure our custom combination conversion successfully satisfies rule-engine indexing validations */
		if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
			minimalNextBid = testBid;
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card. Anchored on our best physical holdings. */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[candidates[0].rank],
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}

function findHighestAndNextBids(rank_list, currentBid = null) {
	/* Setup our vocabulary maps for smooth translation between symbols and strings */
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	/* --- PART 1: SORT CANDIDATES --- */
	/* Sort the global candidates using your priority ranking property 'i' */
	let candidates = rank_list.slice().sort((a, b) => b.i - a.i);

	/* --- PART 2: COMPUTE MINIMAL POSSIBLE BID --- */
	/* Sort by rankOrder index ascending to find the absolute smallest card rank available in rank_list */
	let smallestRankItem = rank_list.slice().sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank))[0];

	/* The absolute minimal bid uses a quantity of 1 of that smallest available rank */
	let minimalBid = [
		1,
		toword[smallestRankItem.rank],
		'_',
		'_'
	];

	/* --- PART 3: COMPUTE MAXIMUM REAL CLAIRVOYANT HOLDINGS --- */
	let maxItem = candidates[0];
	let minItem = candidates[1] || { rank: '_', value: 0 };

	/* Format the absolute structural ceiling of what exists on the layout */
	let highestPossibleBid = [
		maxItem.value,
		toword[maxItem.rank],
		minItem.value === 0 ? '_' : minItem.value,
		minItem.value === 0 ? '_' : toword[minItem.rank]
	];

	if (currentBid === null) {
		currentBid = [0, '_', '_', '_'];
	}

	/* --- PART 4: FIND MINIMAL HIGHER BID --- */
	/* Normalize the input parameters into numbers and rank indices */
	let oldCount1 = Number(currentBid[0]);
	let oldRank1 = torank[currentBid[1]];
	let oldCount2 = currentBid[2] === '_' ? 0 : Number(currentBid[2]);
	let oldRank2 = torank[currentBid[3]];

	let oldVolume = oldCount1 + oldCount2;
	let oldMaxRankIdx = Math.max(rankOrder.indexOf(oldRank1), rankOrder.indexOf(oldRank2));

	let minimalNextBid = null;

	/* Strategy A: Try keeping the EXACT same card volume, but step up the rank index tie-breaker */
	let singleHigherRanks = rank_list.filter(x => rankOrder.indexOf(x.rank) > oldMaxRankIdx);

	if (singleHigherRanks.length > 0) {
		/* Sort higher ranks to pick our most comfortable target item (highest value/mine) */
		singleHigherRanks.sort((a, b) => {
			if (b.value !== a.value) return b.value - a.value;
			return (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
		});

		let targetRank = singleHigherRanks[0].rank;

		if (currentBid[2] !== '_') {
			/* Preserve secondary count structure if old bid was split */
			minimalNextBid = [oldCount1, toword[targetRank], oldCount2, currentBid[3]];
		} else {
			/* Maintain clean single-rank layout */
			minimalNextBid = [oldCount1, toword[targetRank], '_', '_'];
		}
	}
	/* Strategy B: Convert a single high-rank bid to a split combo at identical volume to squeeze past it */
	else if (currentBid[2] === '_') {
		let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
		let sCount = oldVolume - pCount;

		/* Pull top choices directly from our custom prioritized list */
		let pRank = candidates[0].rank;
		let sRank = (candidates[1] || candidates[0]).rank;

		let testBid = [pCount, toword[pRank], sCount, toword[sRank]];

		/* Make sure our custom combination conversion successfully satisfies rule-engine indexing validations */
		if (is_bid_higher_than([pCount, pRank, sCount, sRank], [oldCount1, oldRank1, '_', '_'])) {
			minimalNextBid = testBid;
		}
	}

	/* Strategy C: Fallback. Volume must increment by 1 card. Anchored on our best physical holdings. */
	if (minimalNextBid === null) {
		minimalNextBid = [
			oldVolume + 1,
			toword[candidates[0].rank],
			'_',
			'_'
		];
	}

	return {
		minimalBid,
		highestPossibleBid,
		minimalNextBid
	};
}

//#endregion

//#region ___ v4



/**
 * Streamlined AI turn agent. Passes only what's needed to the brain.
 */
function bluffBotMove(plName, table) {
	let fen = table.fen;
	let pl = table.players[plName];

	// 1. Gather all active hand cards on the table
	let all_hand_cards = [];
	for (const name in table.players) {
		all_hand_cards = all_hand_cards.concat(table.players[name].hand);
	}

	let getCardRank = (card) => {
		let r = card.length === 3 ? card.substring(0, 2) : card[0];
		return r === '10' ? 'T' : r;
	};

	// 2. Count wild 2s globally
	let n_twos = all_hand_cards.filter(c => getCardRank(c) === '2').length;

	// 3. Count raw natural holdings globally
	let globalRanks = {};
	all_hand_cards.forEach(card => {
		let r = getCardRank(card);
		if (r !== '2') {
			globalRanks[r] = (globalRanks[r] || 0) + 1;
		}
	});

	const rankOrder = '3456789TJQKA';
	let myRanks = pl.hand.map(c => getCardRank(c));

	// 4. Build the core strategy worldview list
	let rank_list = rankOrder.split('').map(r => {
		let globalNaturalCount = globalRanks[r] || 0;
		let isMine = myRanks.includes(r);
		let irank = rankOrder.indexOf(r);

		return {
			rank: r,
			naturalCount: globalNaturalCount,
			mine: isMine,
			irank: irank,
			i: irank + 100 * (globalNaturalCount + n_twos)
		};
	});

	rank_list.sort((a, b) => b.i - a.i);

	// 5. Execute with only the clean two-param signature
	let [b, moveType] = bot_clairvoyant_routine(rank_list, table);

	if (moveType === 'gehtHoch') {
		return { movetype: 'gehtHoch' };
	}

	if (b[2] == 0 || b[2] === '_') {
		b[2] = '_';
		b[3] = '_';
	}

	return {
		movetype: 'bid',
		newbid: b
	};
}

/**
 * Simplified Strategy Brain taking strictly (list, table)
 */
function bot_clairvoyant_routine(list, table) {
	let fen = table.fen;
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	// 1. IRONCLAD CHALLENGE RULE: If old bid is false based on reality, challenge immediately!
	if (fen.lastbid && fen.lastbid[0] !== '_') {
		let normalizedOld = [
			fen.lastbid[0],
			torank[fen.lastbid[1]] || fen.lastbid[1],
			fen.lastbid[2] === '_' ? '_' : fen.lastbid[2],
			torank[fen.lastbid[3]] || fen.lastbid[3]
		];

		if (calc_bid_minus_cards(table, normalizedOld) > 0) {
			return [null, 'gehtHoch'];
		}
	}

	// 2. BID ESCALATION: Bid is true, so we safely increase value thresholds
	let currentBid = fen.lastbid ? [
		Number(fen.lastbid[0]),
		torank[fen.lastbid[1]] || fen.lastbid[1],
		fen.lastbid[2] === '_' ? '_' : Number(fen.lastbid[2]),
		torank[fen.lastbid[3]] || fen.lastbid[3]
	] : [0, '_', '_', '_'];

	let oldVolume = currentBid[0] + (currentBid[2] === '_' ? 0 : currentBid[2]);
	let reduced_list = list.filter(x => x.mine || x.naturalCount > 0);

	let maxItem = reduced_list[0];
	let minItem = reduced_list[1] || { rank: '_', naturalCount: 0 };
	let b = null;

	if (oldVolume > 0) {
		let highestOldRankIdx = Math.max(
			rankOrder.indexOf(currentBid[1]),
			rankOrder.indexOf(currentBid[3])
		);

		let higherRanks = list.filter(x => x.irank > highestOldRankIdx);

		if (higherRanks.length > 0) {
			let targetRankItem = higherRanks[0];
			if (currentBid[2] !== '_') {
				b = [currentBid[0], toword[targetRankItem.rank], currentBid[2], toword[minItem.rank]];
			} else {
				b = [currentBid[0], toword[targetRankItem.rank], '_', '_'];
			}
		} else if (currentBid[2] === '_') {
			// Tie-break conversion: split a single rank to match total volume using upper rank items
			let pRank = list[0];
			let sRank = list[1] || list[0];
			let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
			let sCount = oldVolume - pCount;

			b = [pCount, toword[pRank.rank], sCount, toword[sRank.rank]];
		}
	}

	// Fallback volume increase loop if rank escalation parameters couldn't settle it cleanly
	if (!b || !is_bid_higher_than([b[0], torank[b[1]], b[2] === '_' ? '_' : b[2], torank[b[3]]], currentBid)) {
		let targetVolume = oldVolume + 1;
		b = [
			targetVolume,
			toword[maxItem.rank] || '_',
			'_',
			'_'
		];
	}

	return [b, 'bid'];
}

//#endregion

//#region ______ v3
function bluffBotMove(plName, table) {
	/**
	 * Main entry point for the AI turn.
	 */
	let fen = table.fen;
	let pl = table.players[plName];

	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	let words = Object.keys(torank).slice(1);

	// 1. Gather all active hand cards on the table
	let all_hand_cards = [];
	for (const name in table.players) {
		all_hand_cards = all_hand_cards.concat(table.players[name].hand);
	}

	let getCardRank = (card) => {
		let r = card.length === 3 ? card.substring(0, 2) : card[0];
		return r === '10' ? 'T' : r;
	};

	// 2. Extract wild counts
	let n_twos = all_hand_cards.filter(c => getCardRank(c) === '2').length;
	let have2 = pl.hand.filter(c => getCardRank(c) === '2').length;

	// 3. Count raw natural holdings globally
	let globalRanks = {};
	all_hand_cards.forEach(card => {
		let r = getCardRank(card);
		if (r !== '2') {
			globalRanks[r] = (globalRanks[r] || 0) + 1;
		}
	});

	const rankOrder = '3456789TJQKA';
	let myRanks = pl.hand.map(c => getCardRank(c));

	// Build the prioritized list based on true natural existence
	let rank_list = rankOrder.split('').map(r => {
		let globalNaturalCount = globalRanks[r] || 0;
		let isMine = myRanks.includes(r);
		let irank = rankOrder.indexOf(r);

		return {
			rank: r,
			naturalCount: globalNaturalCount,
			mine: isMine,
			irank: irank,
			i: irank + 100 * (globalNaturalCount + n_twos)
		};
	});

	// Sort descending so the most abundant options bubble up
	rank_list.sort((a, b) => b.i - a.i);

	let maxcount = rank_list[0].naturalCount + n_twos;
	let ownedRanks = rank_list.filter(x => x.mine);
	let mymaxcount = ownedRanks.length > 0 ? (ownedRanks[0].naturalCount + n_twos) : n_twos;

	let expected = all_hand_cards.length / 13;
	let nreason = Math.max(1, Math.round(expected * 2));

	// 4. Run the tactical strategy routine
	let [b, moveType] = bot_clairvoyant_routine(rank_list, maxcount, mymaxcount, expected, nreason, n_twos, have2, words, table);

	if (moveType === 'gehtHoch') {
		return { movetype: 'gehtHoch' };
	}

	if (b[2] == 0 || b[2] === '_') {
		b[2] = '_';
		b[3] = '_';
	}

	return {
		movetype: 'bid',
		newbid: b
	};
}

function bot_clairvoyant_routine(list, maxvalue, mmax, exp, nreas, n2, have2, words, table) {
	/**
	 * Strategy Brain: Prioritizes tie-breaking rank escalations over expanding card volume.
	 * Only triggers challenges when the target cards mathematically do not exist.
	 */
	let fen = table.fen;
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const rankOrder = '3456789TJQKA';

	// SPECIFICATION 1: UNCONDITIONAL LIFT IF TRUE BLUFF
	// The bot computes reality first. If the current bid cannot physically be satisfied by the table, call it instantly.
	if (fen.lastbid && fen.lastbid[0] !== '_') {
		// let normalizedOld = [
		//   fen.lastbid[0],
		//   torank[fen.lastbid[1]] || fen.lastbid[1],
		//   fen.lastbid[2] === '_' ? '_' : fen.lastbid[2],
		//   torank[fen.lastbid[3]] || fen.lastbid[3]
		// ];

		let normalizedOld = fen.lastbid;
		console.log(':::', normalizedOld)
		// Use the core verification engine directly
		let x = calc_bid_minus_cards(table, normalizedOld)
		console.log('x', x)
		if (x > 0) {
			return [null, 'gehtHoch'];
		}
	}

	// Otherwise, the bid is true, meaning we MUST bid.
	let currentBid = fen.lastbid ? [
		Number(fen.lastbid[0]),
		torank[fen.lastbid[1]] || fen.lastbid[1],
		fen.lastbid[2] === '_' ? '_' : Number(fen.lastbid[2]),
		torank[fen.lastbid[3]] || fen.lastbid[3]
	] : [0, '_', '_', '_'];

	let oldVolume = currentBid[0] + (currentBid[2] === '_' ? 0 : currentBid[2]);

	// Target pool for picking high ranks
	let reduced_list = list.filter(x => x.mine || x.naturalCount > 0);

	let maxItem = reduced_list[0];
	let minItem = reduced_list[1] || { rank: '_', naturalCount: 0 };

	let b = null;

	// SPECIFICATION 2: ESCALATE RANK INSTEAD OF CARD COUNT VOLUME WHERE POSSIBLE
	if (oldVolume > 0) {
		let highestOldRankIdx = Math.max(
			rankOrder.indexOf(currentBid[1]),
			rankOrder.indexOf(currentBid[3])
		);

		// Filter available ranks that are strictly higher than the current highest bid rank
		console.log('list', list)
		let higherRanks = list.filter(x => x.irank > highestOldRankIdx);
		console.log('higherRanks', higherRanks, 'currentBid', currentBid, 'minItem', minItem)

		if (higherRanks.length > 0) {
			// We can preserve the volume but increase the poker rank!
			let targetRankItem = higherRanks[0]; // Pick the highest abundance option among upper ranks

			if (currentBid[2] !== '_') {
				// Old bid was a 2-rank split. Maintain the volume distribution split but up the value rank.
				b = [currentBid[0], toword[targetRankItem.rank], currentBid[2], toword[minItem.rank]];
			} else {
				// Old bid was a single rank. Keep it a single rank but lift its value rank.
				b = [currentBid[0], toword[targetRankItem.rank], '_', '_'];
			}
		} else if (currentBid[2] === '_') {
			// No single higher rank options available. 
			// Force conversion to a 2-rank bid layout to break the tie without adding volume!
			// Example: 4 Tens -> 3 Aces + 1 King (Total volume is 4, but Aces/Kings break the Ten rank tie)
			let pRank = list[0];
			let sRank = list[1] || list[0];

			let pCount = Math.max(1, Math.floor(oldVolume * 0.6));
			let sCount = oldVolume - pCount;

			b = [pCount, toword[pRank.rank], sCount, toword[sRank.rank]];
		}
	}

	// Fallback protection check: if we couldn't bypass using rank shifts, force a standard +1 volume raise.
	if (!b || !is_bid_higher_than([b[0], torank[b[1]], b[2] === '_' ? '_' : b[2], torank[b[3]]], currentBid)) {
		let targetVolume = oldVolume + 1;
		let finalCount1 = targetVolume;
		let finalCount2 = 0;

		b = [
			finalCount1,
			toword[maxItem.rank] || '_',
			finalCount2 === 0 ? '_' : finalCount2,
			finalCount2 === 0 ? '_' : (toword[minItem.rank] || '_')
		];
	}

	return [b, 'bid'];
}
//#endregion

//#region ___ orig
function bot_clairvoyant(list, maxvalue, mmax, exp, nreas, n2, have2, words, fen) {
	let reduced_list = list.filter(x => x.value == list[0].value || x.mine);
	let res = reduced_list.length >= 2 ? rChoose(list, 2) : [reduced_list[0], { value: 0, rank: '_' }];
	let max = res[0].value >= res[1].value ? res[0] : res[1]; let min = res[0].value < res[1].value ? res[0] : res[1];
	let b = [max.value, max.rank, min.value, min.rank];
	if (isdef(fen.lastbid)) {
		let [n1, r1, n2, r2] = bluff_convert2ranks(fen.lastbid);
		if (!is_bid_higher_than(bluff_convert2words(b), fen.lastbid)) {
			return [null, handle_gehtHoch];
		}
	}
	return [bluff_convert2words(b), handle_bid];
}
function bot_perfect(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	let i = 0; while (list[i].rank == '2') i++;
	let b = [list[i].value + n2, list[i].rank, list[i + 1].value, list[i + 1].rank];
	list.map(x => console.log(x)); //
	console.log('b:', b);
	if (isdef(fen.lastbid)) {
		let [n1, r1, n2, r2] = bluff_convert2ranks(fen.lastbid);
		if (!is_bid_higher_than(bluff_convert2words(b), fen.lastbid)) {
			return [null, handle_gehtHoch];
		}
	}
	return [bluff_convert2words(b), handle_bid];
}
function bot_random(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	let ranks = rChoose('3456789TJQKA', 2);
	let b;
	if (nundef(fen.lastbid)) b = [rNumber(1, nreas), ranks[0], rNumber(1, nreas), ranks[1]];
	else if (fen.lastbid[0] > nreas + 2) {
		return [null, handle_gehtHoch];
	} else {
		[n1, r1, n2, r2] = bluff_convert2ranks(fen.lastbid);
		assertion(isNumber(n1) && n1 > 0 && isNumber(n2), 'bot_random: n1 or n2 is not a number OR n1<=0!!!!!!!', n1, n2);
		if ((n1 + n2) / 2 > nreas && coin(50)) {
			return [null, handle_gehtHoch];
		} else if ((n1 + n2) / 2 <= nreas + 1) b = n1 <= nreas + 1 ? [n1 + 1, r1, n2, r2] : [n1, r1, n2 + 1, r2];
		else {
			let [i1, i2] = [BLUFF.rankstr.indexOf(r1), BLUFF.rankstr.indexOf(r2)];
			let s = '3456789TJQKA';
			let imin = Math.min(i1, i2); let imax = Math.max(i1, i2); let i = imax == i1 ? 1 : 2;
			let [smin, between, smax] = [s.substring(0, imin), s.substring(imin + 1, imax), s.substring(imax + 1, s.length)];
			if (!isEmpty(smax)) { if (i == 1) b = [n1, rChoose(smax), n2, r2]; else b = [n1, r1, n2, rChoose(smax)]; }
			else if (!isEmpty(between)) { if (i == 2) b = [n1, rChoose(between), n2, r2]; else b = [n1, r1, n2, rChoose(between)]; }
			else return [null, handle_gehtHoch];
		}
	}
	return [bluff_convert2words(b), handle_bid];
}
function botbest(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	if (nundef(DA.ctrandom)) DA.ctrandom = 1; console.log(`${DA.ctrandom++}: ${Z.uplayer} using strategy`, Z.strategy)
	let bot = window[`bot_${Z.strategy}`];
	let [b, f] = bot(list, max, mmax, exp, nreas, n2, have2, words, fen);
	assertion(!b || b[2] != 0, 'bot returned bid with n2==0');
	return [b, f];
}
function bluff_ai() {
	let [A, fen, uplayer, pl] = [Z.A, Z.fen, Z.uplayer, Z.pl];
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	let words = get_keys(torank).slice(1);
	let all_hand_cards = aggregate_elements(dict2list(fen.players, 'name'), 'hand');
	let no_twos = all_hand_cards.filter(x => x[0] != '2');
	let rankstr = '3456789TJQKA2';
	sortByRank(all_hand_cards, rankstr);
	let byrank = aggregate_player_hands_by_rank(fen);
	let rank_list = dict2list(byrank, 'rank');
	let unique_ranks = sortByRank(get_keys(byrank));
	let myranks = sortByRank(pl.hand.map(x => x[0]));
	let my_unique = unique_ranks.filter(x => myranks.includes(x));
	rank_list.map(x => { x.mine = myranks.includes(x.rank); x.irank = rankstr.indexOf(x.rank); x.i = x.irank + 100 * x.value; });
	rank_list = rank_list.filter(x => x.rank != '2');
	sortByDescending(rank_list, 'i');
	let maxcount = rank_list[0].value;
	let mymaxcount = rank_list.filter(x => x.mine)[0].value;
	let expected = all_hand_cards.length / 13;
	let nreason = Math.max(1, Math.round(expected * 2));
	let n_twos = all_hand_cards.filter(x => x[0] == '2').length;
	let have2 = firstCond(rank_list, x => x.rank == '2' && x.mine);
	return botbest(rank_list, maxcount, mymaxcount, expected, nreason, n_twos, have2, words, fen);
}

function bluff_convert2ranks(b) { return [b[0], BLUFF.torank[b[1]], b[2] == '_' ? 0 : b[2], BLUFF.torank[b[3]]]; }
function bluff_convert2words(b) { return [b[0], BLUFF.toword[b[1]], b[2] < 1 ? '_' : b[2], BLUFF.toword[b[3]]]; }
function bluff_generate_random_bid() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	const di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let words = get_keys(di2).slice(1);
	let b = isdef(fen.lastbid) ? jsCopy(fen.lastbid) : null;
	if (isdef(b)) {
		assertion(b[0] >= (b[2] == '_' ? 0 : b[2]), 'bluff_generate_random_bid: bid not formatted correctly!!!!!!!', b)
		let nmax = calc_reasonable_max(fen);
		let n = b[0] == '_' ? 1 : Number(b[0]);
		let done = false;
		if (n > nmax + 1) {
			const di = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
			let rankstr = '3456789TJQKA';
			let w1 = di2[b[1]];
			let idx = isdef(w1) ? rankstr.indexOf(w1) : -1;
			if (idx >= 0 && idx < rankstr.length - 2) {
				let r = rankstr[idx + 1];
				b[1] = di[r];
				done = true;
			}
		}
		if (!done) {
			if (b[3] == '_') { b[2] = 1; b[3] = rChoose(words, 1, x => x != b[1]); }
			else if (b[0] > b[2]) { b[2] += 1; } //console.log('new bid is now:', b); }
			else { b[0] += coin(80) ? 1 : 2; if (coin()) b[2] = b[3] = '_'; }
		}
	} else {
		let nmax = calc_reasonable_max(fen);
		let nmin = Math.max(nmax - 1, 1);
		let arr_nmax = arrRange(1, nmax);
		let arr_nmin = arrRange(1, nmin);
		b = [rChoose(arr_nmax), rChoose(words), rChoose(arr_nmin), rChoose(words)];
		if (b[1] == b[3]) b[3] = rChoose(words, 1, x => x != b[1]);
		if (coin()) b[2] = b[3] = '_';
	}
	fen.newbid = b;
	UI.dAnzeige.innerHTML = bid_to_string(b);
}
//#endregion

//#region older ai versions bluff strat
function bluffBotMove(plName, table) {
	let fen = table.fen;
	let pl = table.players[plName];

	// 1. Text translations for formatting
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	let words = Object.keys(torank).slice(1);

	// 2. Gather all active hand cards on the table
	let all_hand_cards = [];
	for (const name in table.players) {
		all_hand_cards = all_hand_cards.concat(table.players[name].hand);
	}

	// 3. Helper: extract clean rank characters ('10' -> 'T')
	let getCardRank = (card) => {
		let r = card.length === 3 ? card.substring(0, 2) : card[0];
		return r === '10' ? 'T' : r;
	};

	// 4. Calculate total wild 2s across the board
	let n_twos = all_hand_cards.filter(c => getCardRank(c) === '2').length;
	let have2 = pl.hand.filter(c => getCardRank(c) === '2').length;

	// 5. Aggregate natural counts globally across table (excluding 2s)
	let globalRanks = {};
	all_hand_cards.forEach(card => {
		let r = getCardRank(card);
		if (r !== '2') {
			globalRanks[r] = (globalRanks[r] || 0) + 1;
		}
	});

	// 6. Build the prioritized rank list for the bot's worldview
	const rankOrder = '3456789TJQKA';
	let myRanks = pl.hand.map(c => getCardRank(c));

	let rank_list = rankOrder.split('').map(r => {
		let globalNaturalCount = globalRanks[r] || 0;
		let totalValueWithWilds = globalNaturalCount + n_twos; // Clairvoyant advantage
		let isMine = myRanks.includes(r);
		let irank = rankOrder.indexOf(r);

		return {
			rank: r,
			value: totalValueWithWilds,
			mine: isMine,
			irank: irank,
			i: irank + 100 * totalValueWithWilds // Primary sort: total volume, Secondary sort: card value
		};
	});

	// Sort descending by weight score 'i'
	rank_list.sort((a, b) => b.i - a.i);

	// 7. Establish situational baselines
	let maxcount = rank_list[0].value;

	let ownedRanks = rank_list.filter(x => x.mine);
	let mymaxcount = ownedRanks.length > 0 ? ownedRanks[0].value : n_twos;

	let expected = all_hand_cards.length / 13;
	let nreason = Math.max(1, Math.round(expected * 2));

	// 8. Execute the Clairvoyant Strategy Routine
	let [b, moveType] = bot_clairvoyant_routine(rank_list, maxcount, mymaxcount, expected, nreason, n_twos, have2, words, table);

	// 9. Process final actions and translate array structural padding
	if (moveType === 'gehtHoch') {
		return { movetype: 'gehtHoch' };
	}

	// Convert text array ["three", "five"] back into clean internal structural codes ["3", "5"]
	let formattedBid = [
		b[0],
		torank[b[1]] || b[1],
		b[2] === '_' ? '_' : b[2],
		torank[b[3]] || b[3]
	];

	// Structural sanity defense fallback
	if (formattedBid[2] == 0) formattedBid[2] = '_';

	console.log('vorher', formattedBid)
	const di = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };

	if (isdef(di[formattedBid[1]])) formattedBid[1] = di[formattedBid[1]];
	if (isdef(di[formattedBid[3]])) formattedBid[3] = di[formattedBid[3]];
	console.log('returning', formattedBid)

	return {
		movetype: 'bid',
		newbid: formattedBid
	};
}

function bot_clairvoyant_routine(list, maxvalue, mmax, exp, nreas, n2, have2, words, table) {
	let fen = table.fen;

	// Tighter pool: only look at maximum abundance loops or ranks the bot physically touches
	let reduced_list = list.filter(x => x.value === list[0].value || x.mine);

	// Select up to two ranks
	let res = [];
	if (reduced_list.length >= 2) {
		// Simple random sampling helper built straight-in
		let indices = [];
		while (indices.length < 2) {
			let rIdx = Math.floor(Math.random() * reduced_list.length);
			if (!indices.includes(rIdx)) indices.push(rIdx);
		}
		res = [reduced_list[indices[0]], reduced_list[indices[1]]];
	} else {
		res = [reduced_list[0], { value: 0, rank: '_' }];
	}

	// Ensure internal sorting layout requirements are met (Highest volume first)
	let max = res[0].value >= res[1].value ? res[0] : res[1];
	let min = res[0].value < res[1].value ? res[0] : res[1];

	// Dictionary transformation translator map
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };

	let b = [
		max.value,
		toword[max.rank] || max.rank,
		min.value === 0 ? '_' : min.value,
		toword[min.rank] || min.rank
	];

	// Evaluate if the bid generated is legal compared to previous turn
	if (fen.lastbid && fen.lastbid[0] !== '_') {
		// Temporarily map modern string/int arrays to text symbols for the rule evaluator step
		let internalNewBid = [b[0], max.rank, b[2] === '_' ? '_' : b[2], min.rank];
		let internalOldBid = [fen.lastbid[0], fen.lastbid[1], fen.lastbid[2], fen.lastbid[3]];

		if (!is_bid_higher_than(internalNewBid, internalOldBid)) {
			// If our absolute maximum clairvoyant potential can't legally step over the current bid,
			// we know definitively they are bluffing out their teeth. Smash the emergency lift call!
			return [null, 'gehtHoch'];
		}
	}

	return [b, 'bid'];
}

function bluffBotMove(plName, table) {
	let fen = table.fen;
	let pl = table.players[plName];

	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	let words = Object.keys(torank).slice(1);

	// 1. Gather all active hand cards on the table
	let all_hand_cards = [];
	for (const name in table.players) {
		all_hand_cards = all_hand_cards.concat(table.players[name].hand);
	}

	let getCardRank = (card) => {
		let r = card.length === 3 ? card.substring(0, 2) : card[0];
		return r === '10' ? 'T' : r;
	};

	// 2. Extract wild counts
	let n_twos = all_hand_cards.filter(c => getCardRank(c) === '2').length;
	let have2 = pl.hand.filter(c => getCardRank(c) === '2').length;
	console.log('2', n_twos, have2)

	// 3. Count raw natural holdings globally (WITHOUT adding 2s yet)
	let globalRanks = {};
	all_hand_cards.forEach(card => {
		let r = getCardRank(card);
		if (r !== '2') {
			globalRanks[r] = (globalRanks[r] || 0) + 1;
		}
	});

	const rankOrder = '3456789TJQKA';
	let myRanks = pl.hand.map(c => getCardRank(c));

	// Build a base list of natural cards to help determine which ranks are strongest
	let rank_list = rankOrder.split('').map(r => {
		let globalNaturalCount = globalRanks[r] || 0;
		let isMine = myRanks.includes(r);
		let irank = rankOrder.indexOf(r);

		return {
			rank: r,
			naturalCount: globalNaturalCount,
			mine: isMine,
			irank: irank,
			i: irank + 100 * (globalNaturalCount + n_twos) // Keeping the sorting index weighted by potential maximum value
		};
	});

	// Sort descending so the most abundant natural options bubble to the top
	rank_list.sort((a, b) => b.i - a.i);

	let maxcount = rank_list[0].naturalCount + n_twos;
	let ownedRanks = rank_list.filter(x => x.mine);
	let mymaxcount = ownedRanks.length > 0 ? (ownedRanks[0].naturalCount + n_twos) : n_twos;

	let expected = all_hand_cards.length / 13;
	let nreason = Math.max(1, Math.round(expected * 2));

	// 4. Run the strategy logic
	let [b, moveType] = bot_clairvoyant_routine(rank_list, maxcount, mymaxcount, expected, nreason, n_twos, have2, words, table);

	if (moveType === 'gehtHoch') {
		return { movetype: 'gehtHoch' };
	}

	// Ensure internal structural fallback rules match
	if (b[2] == 0 || b[2] === '_') {
		b[2] = '_';
		b[3] = '_';
	}

	return {
		movetype: 'bid',
		newbid: b // Already perfectly formatted with words from the routine
	};
}

function bot_clairvoyant_routine(list, maxvalue, mmax, exp, nreas, n2, have2, words, table) {
	let fen = table.fen;
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };

	// Filter pool for realistic choices
	let reduced_list = list.filter(x => x.naturalCount === list[0].naturalCount || x.mine);

	let item1 = reduced_list[0];
	let item2 = null;

	if (reduced_list.length >= 2) {
		let rIdx = 1 + Math.floor(Math.random() * (reduced_list.length - 1));
		item2 = reduced_list[rIdx];
	}

	let finalCount1 = item1.naturalCount;
	let finalCount2 = item2 ? item2.naturalCount : 0;
	let remainingWildcards = n2;

	// FIXED WILDCARD DOUBLE-COUNTING:
	// Distribute the shared global wildcards cleanly. Primary choice gets prioritized.
	if (remainingWildcards > 0) {
		finalCount1 += remainingWildcards;
		remainingWildcards = 0; // In a clairvoyant scenario, anchoring entirely on the strongest rank is safest
	}

	// Ensure internal sorting order consistency (Primary rank must have greater/equal value)
	let maxItem = item1;
	let minItem = item2 || { rank: '_', naturalCount: 0 };
	let maxVal = finalCount1;
	let minVal = finalCount2;

	if (minVal > maxVal) {
		// Swap if secondary somehow ended up higher
		let tempItem = maxItem; maxItem = minItem; minItem = tempItem;
		let tempVal = maxVal; maxVal = minVal; minVal = tempVal;
	}

	// FORMAT RANKS AS WORDS: Use the toword dictionary for array positions [1] and [3]
	let b = [
		maxVal,
		toword[maxItem.rank] || '_',
		minVal === 0 ? '_' : minVal,
		minVal === 0 ? '_' : (toword[minItem.rank] || '_')
	];

	// Evaluate legality against the previous bid
	if (fen.lastbid && fen.lastbid[0] !== '_') {
		// Standard rule comparison engines use shorthand characters ('3', 'A'), so we translate back down to test
		let testNewBid = [
			b[0],
			torank[b[1]] || b[1],
			b[2] === '_' ? '_' : b[2],
			torank[b[3]] || b[3]
		];

		let testOldBid = [
			fen.lastbid[0],
			torank[fen.lastbid[1]] || fen.lastbid[1],
			fen.lastbid[2] === '_' ? '_' : fen.lastbid[2],
			torank[fen.lastbid[3]] || fen.lastbid[3]
		];

		if (!is_bid_higher_than(testNewBid, testOldBid)) {
			// If the maximum actual card limits cannot legally surpass the opponent's claim, call "geht hoch!"
			return [null, 'gehtHoch'];
		}
	}

	return [b, 'bid'];
}


function handle_gehtHoch() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let [bid, bidder] = [fen.lastbid, fen.lastbidder];
	let diff = calc_bid_minus_cards(fen, bid);
	let aufheber = uplayer;
	let loser = diff > 0 ? bidder : aufheber;
	let war_drin = fen.war_drin = diff <= 0;
	let loser_handsize = inc_handsize(fen, loser);
	new_deal(fen);
	let nextplayer;
	if (loser_handsize > Z.options.max_handsize) {
		nextplayer = get_next_player(Z, loser)
		let plorder = table.plorder = remove_player(fen, loser);
	} else {
		nextplayer = loser;
	}
	fen.loser = loser; fen.bidder = bidder; fen.aufheber = aufheber;
	bluff_change_to_ack_round(fen, nextplayer);
	take_turn_fen();
}

function _bluffBotMove(plName, table) {
	const rankOrder = '3456789TJQKA'; // 2 is removed from standard ranks because it's wild
	let fen = table.fen;
	let me = table.players[plName];
	let myHand = me.hand;

	//console.log('table',table,fen,myHand)

	// 1. Calculate Total Cards Unknown to this Bot
	let totalCardsInPlay = 0;
	for (const p in table.players) {
		totalCardsInPlay += table.players[p].handsize;
	}
	let unknownCardsCount = totalCardsInPlay - myHand.length;

	let totalPoolCards = fen.num_decks * 52;
	let poolMinusMyHand = totalPoolCards - myHand.length;

	// Helper: Get raw card rank, mapping '10' to 'T'
	let getCardRank = (card) => {
		let r = card.length === 3 ? card.substring(0, 2) : card[0];
		return r === '10' ? 'T' : r;
	};

	// Count my wild 2s
	let myWilds = myHand.filter(c => getCardRank(c) === '2').length;

	// Helper: Count matching cards + wild 2s in the bot's hand
	let myRankCountWithWilds = (rank) => {
		if (rank === '_') return 0;
		let naturalCount = myHand.filter(c => getCardRank(c) === rank).length;
		return naturalCount + myWilds;
	};

	// Helper: Probability estimation that accounts for remaining natural cards AND remaining wild 2s
	let estimateProbability = (rank, totalBidCount) => {
		if (rank === '_') return 1.0;

		let handCountWithWilds = myRankCountWithWilds(rank);
		let neededFromOthers = Math.max(0, totalBidCount - handCountWithWilds);
		if (neededFromOthers === 0) return 1.0;

		// How many natural versions of this rank AND wild 2s are left in the entire unrevealed pool?
		let naturalInHand = myHand.filter(c => getCardRank(c) === rank).length;
		let remainingNaturalInPool = Math.max(0, (fen.num_decks * 4) - naturalInHand);
		let remainingWildsInPool = Math.max(0, (fen.num_decks * 4) - myWilds);

		let totalTargetCardsInPool = remainingNaturalInPool + remainingWildsInPool;

		// Expected value of (Target Rank + Wild 2s) in the unknown cards remaining around the table
		let expectedCount = unknownCardsCount * (totalTargetCardsInPool / poolMinusMyHand);

		if (neededFromOthers <= expectedCount) return 0.95; // Higher confidence because wilds smooth things out
		if (neededFromOthers <= expectedCount + 1.5) return 0.6;
		if (neededFromOthers <= expectedCount + 3) return 0.25;
		return 0.02;
	};

	// 2. Evaluate Current Bid (if it exists)
	if (isdef(fen.lastbid)) {
		let lastBid = fen.lastbid;
		let prob1 = estimateProbability(lastBid[1], Number(lastBid[0]));
		let prob2 = lastBid[2] !== '_' ? estimateProbability(lastBid[3], Number(lastBid[2])) : 1.0;
		let combinedProbability = prob1 * prob2;

		// The bot is slightly more trusting now because wild 2s mean bids can scale high safely
		let skepticismThreshold = 0.50;
		if (Math.random() < 0.1) skepticismThreshold += 0.15;

		if (combinedProbability < skepticismThreshold) {
			return { movetype: 'gehtHoch' };
		}
	}

	// 3. Construct a Plausible Counter-Bid
	// Sort ranks by natural count first, using 2s to bolster them dynamically
	let ranksByStrength = rankOrder.split('').map(r => {
		return { rank: r, count: myRankCountWithWilds(r) };
	}).sort((a, b) => b.count - a.count);

	let primary = ranksByStrength[0];
	let secondary = ranksByStrength[1];
	console.log(primary, secondary)

	let currentBid = isdef(fen.lastbid) ? normalize_bid(fen.lastbid) : [0, '_', 0, '_'];
	let currentTotalVolume = Number(currentBid[0]) + (currentBid[2] === '_' ? 0 : Number(currentBid[2]));

	let newBid = [0, '_', 0, '_'];

	if (currentTotalVolume === 0) {
		// Start slightly higher if the bot holds a lot of wild 2s
		let startingBidCount = Math.max(1, primary.count);
		newBid = [startingBidCount, primary.rank, '_', '_'];
	} else {
		let shouldRaiseVolume = Math.random() > 0.35 || currentTotalVolume < 3;

		if (shouldRaiseVolume) {
			// With wilds in play, volume steps can comfortably jump by more than 1 if bot holds heavy 2s
			let jump = (myWilds >= 2 && Math.random() > 0.5) ? 2 : 1;
			let targetVolume = currentTotalVolume + jump;

			let pCount = Math.max(1, Math.floor(targetVolume * 0.6));
			let sCount = targetVolume - pCount;

			if (sCount > 0) {
				newBid = [pCount, primary.rank, sCount, secondary.rank];
			} else {
				newBid = [pCount, primary.rank, '_', '_'];
			}
		} else {
			// Keep volume same, escalate rank order
			let highestCurrentRankIdx = Math.max(
				rankOrder.indexOf(currentBid[1]),
				rankOrder.indexOf(currentBid[3])
			);

			let viableRank = primary.rank;
			if (rankOrder.indexOf(viableRank) <= highestCurrentRankIdx) {
				let higherRanks = rankOrder.split('').filter((_, idx) => idx > highestCurrentRankIdx);
				// Fallback to highest possible card if crowded out
				viableRank = higherRanks.length > 0 ? higherRanks[0] : 'A';
			}

			if (currentBid[2] !== '_' && Number(currentBid[2]) > 0) {
				newBid = [currentBid[0], viableRank, currentBid[2], 'A'];
			} else {
				newBid = [currentBid[0], viableRank, '_', '_'];
			}
		}
	}

	// Fallback Protection
	newBid = normalize_bid(newBid);
	if (!is_bid_higher_than(newBid, currentBid)) {
		let nextCount = currentTotalVolume + 1;
		newBid = [nextCount, currentBid[1] !== '_' ? currentBid[1] : 'A', '_', '_'];
	}

	// 4. Wild Bluff Factor
	// If the bot has multiple wild 2s, it gains immense "bluff confidence" and might push an aggressive bid
	console.log('wilds', myWilds)
	let bluffChance = myWilds >= 2 ? 0.30 : 0.12;
	if (Math.random() < bluffChance) {
		let inflation = myWilds >= 2 ? 2 : 1;
		newBid[0] = Number(newBid[0]) + inflation;
	}
	console.log('newBid', newBid)
	const di = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };

	if (isdef(di[newBid[1]])) newBid[1] = di[newBid[1]];
	if (isdef(di[newBid[3]])) newBid[3] = di[newBid[3]];
	return { movetype: 'bid', newbid: newBid };
}

function calc_bid_minus_cards(table, bid) {
	let fen = table.fen;
	let di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let di_ranks = aggregate_player_hands_by_rank(table);
	let [brauch1, r1, brauch2, r2] = bid;
	[r1, r2] = [di2[r1], di2[r2]];

	if (brauch1 == '_') brauch1 = 0;
	if (brauch2 == '_') brauch2 = 0;

	let hab1 = valf(di_ranks[r1], 0);
	let hab2 = valf(di_ranks[r2], 0);
	let wildcards = valf(di_ranks['2'], 0);

	// 1. Calculate how many natural cards are missing for each rank
	let deficit1 = Math.max(0, brauch1 - hab1);
	let deficit2 = Math.max(0, brauch2 - hab2);

	// 2. Combine the deficits
	let totalDeficit = deficit1 + deficit2;

	// 3. Apply wildcards to cover the total deficit, but clamp the final result at 0
	// (A return value of 0 means the bid was exactly met or exceeded, > 0 means caught bluffing)
	return Math.max(0, totalDeficit - wildcards);
}

function _botmove(plName, table) {
	const rankOrder = '3456789TJQKA2';
	let fen = table.fen;
	let me = table.players[plName];
	let myHand = me.hand;

	// 1. Calculate Total Cards Unknown to this Bot
	let totalCardsInPlay = 0;
	for (const p in table.players) {
		totalCardsInPlay += table.players[p].handsize;
	}
	let unknownCardsCount = totalCardsInPlay - myHand.length;

	// Total decks and remaining cards in pool (excluding bot's hand)
	let totalPoolCards = fen.num_decks * 52;
	let poolMinusMyHand = totalPoolCards - myHand.length;

	// Helper: Count how many of a rank the bot holds
	let myRankCount = (rank) => {
		if (rank === '_') return 0;
		return myHand.filter(c => {
			let r = c.length === 3 ? c.substring(0, 2) : c[0];
			return (r === '10' ? 'T' : r) === rank;
		}).length;
	};

	// Helper: Probability estimation that unknown players hold at least 'needed' cards
	// Uses a basic expected-value threshold approximation for quick, clean execution
	let estimateProbability = (rank, totalBidCount) => {
		if (rank === '_') return 1.0;
		let rankInBotHand = myRankCount(rank);
		let neededFromOthers = Math.max(0, totalBidCount - rankInBotHand);
		if (neededFromOthers === 0) return 1.0;

		let totalRankInDeck = fen.num_decks * 4;
		let remainingRankInPool = Math.max(0, totalRankInDeck - rankInBotHand);

		// Expected value of this rank in the rest of the table
		let expectedCount = unknownCardsCount * (remainingRankInPool / poolMinusMyHand);

		if (neededFromOthers <= expectedCount) return 0.9;
		if (neededFromOthers <= expectedCount + 1) return 0.5;
		if (neededFromOthers <= expectedCount + 2) return 0.15;
		return 0.01;
	};

	// 2. Evaluate Current Bid (if it exists)
	if (isdef(fen.lastbid)) {
		let lastBid = fen.lastbid;
		let prob1 = estimateProbability(lastBid[1], Number(lastBid[0]));
		let prob2 = lastBid[2] !== '_' ? estimateProbability(lastBid[3], Number(lastBid[2])) : 1.0;
		let combinedProbability = prob1 * prob2;

		// AI personality/skepticism threshold (e.g., call "geht hoch" if probability is under 25%)
		let skepticismThreshold = 0.25;

		// Introduce a little variance/mood swing so it doesn't always act identically
		if (Math.random() < 0.1) skepticismThreshold += 0.15;

		if (combinedProbability < skepticismThreshold) {
			return { movetype: 'gehtHoch' };
		}
	}

	// 3. Construct a Plausible Counter-Bid
	// The bot builds a bid using its strongest holdings as a foundation
	let ranksByStrength = rankOrder.split('').map(r => {
		return { rank: r, count: myRankCount(r) };
	}).sort((a, b) => b.count - a.count); // Strongest holdings first

	let primary = ranksByStrength[0];
	let secondary = ranksByStrength[1];

	let currentBid = isdef(fen.lastbid) ? normalize_bid(fen.lastbid) : [0, '_', 0, '_'];
	let currentTotalVolume = Number(currentBid[0]) + (currentBid[2] === '_' ? 0 : Number(currentBid[2]));

	let newBid = [0, '_', 0, '_'];

	// Base Rule: Escalation must step up total card volume or tie-break on rank index
	if (currentTotalVolume === 0) {
		// First bid of the game: Keep it safe and low based on personal hand strength
		newBid = [Math.max(1, primary.count), primary.rank, '_', '_'];
	} else {
		// Decision matrix: Decide whether to raise card volume or shift ranks
		let shouldRaiseVolume = Math.random() > 0.4 || currentTotalVolume < 2;

		if (shouldRaiseVolume) {
			let targetVolume = currentTotalVolume + 1;
			// Split the volume between its two strongest ranks
			let pCount = Math.max(1, Math.floor(targetVolume * 0.6));
			let sCount = targetVolume - pCount;

			if (sCount > 0) {
				newBid = [pCount, primary.rank, sCount, secondary.rank];
			} else {
				newBid = [pCount, primary.rank, '_', '_'];
			}
		} else {
			// Keep total volume identical but push the card value thresholds higher
			let highestCurrentRankIdx = Math.max(
				rankOrder.indexOf(currentBid[1]),
				rankOrder.indexOf(currentBid[3])
			);

			// Find a rank in its hand or a high rank that breaks the tie
			let viableRank = primary.rank;
			if (rankOrder.indexOf(viableRank) <= highestCurrentRankIdx) {
				// Force an escalation to a high card if personal hand strength ranks are too weak
				let higherRanks = rankOrder.split('').filter((_, idx) => idx > highestCurrentRankIdx);
				viableRank = higherRanks.length > 0 ? higherRanks[0] : '2';
			}

			if (currentBid[2] !== '_' && Number(currentBid[2]) > 0) {
				newBid = [currentBid[0], viableRank, currentBid[2], '2'];
			} else {
				newBid = [currentBid[0], viableRank, '_', '_'];
			}
		}
	}

	// Fallback Protection: Force an absolute minimum fallback bump if logic matches match exactly
	newBid = normalize_bid(newBid);
	if (!is_bid_higher_than(newBid, currentBid)) {
		let nextCount = Number(currentBid[0]) + 1;
		newBid = [nextCount, currentBid[1] !== '_' ? currentBid[1] : 'A', '_', '_'];
	}

	// 4. Inject a Calculated Bluff Chance
	// Humans occasionally make wild leaps. 15% of the time, the bot will wildly inflate its bid.
	if (Math.random() < 0.15) {
		newBid[0] = Number(newBid[0]) + Math.floor(Math.random() * 2) + 1;
	}

	return { movetype: 'bid', newbid: newBid };
}
//#endregion

//#region mTimerCreate
function mTimerCreate(dParent, msMax, format, callback) {
	let dtimer = mDom(dParent, { w: 80, maleft: 10, fg: 'red', weight: 'bold' }, { id: 'dTimer' });
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

function start_simple_timer(dtimer, msInterval, onTick, msTotal, onElapsed) {
	if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; }
	let timer = DA.timer = new SimpleTimer(dtimer, msInterval, onTick, msTotal, onElapsed);
	timer.start();
}
function stop_simple_timer() { if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; } }
//#endregion

//#region emoticount
async function _emoProcess(me, table, pickedCount) {
	console.log('process', me)
	if (table.pending_actions && table.pending_actions[me]) {
		console.log("You have already moved for this step.");
		//should never happen because shouldn't be my turn after moving!
		assertion(false, `it should NOT be my ${me} turn!!!!!!! ${table.turn}`)
		return false;
	}

	let success = pickedCount == table.fen.correctCount;
	let action = { plName: me, val: pickedCount, success };
	removeInPlace(table.turn, me);
	table.pending_actions[me] = action;


	// let res = await dbUpdateGameTableAll(table.id, table, action, me);
	let res = await fetch(DA.dbUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			cmd: "update_row_all",//db
			table: "gametable",//db
			id: table.id,
			player_id: me,
			data: { ...table, action: action }
		})
	});
	res = await res.json();
	//assertion(false, '* THE END *');

	let latestTable = res.row;
	let pending = latestTable.pending_actions;// || {};

	let status = Object.keys(pending).length >= Object.keys(table.players).length ? 'completed' : 'waiting';
	let result = { status, table: latestTable, pending, res };
	[status, table, pending, res] = [result.status, result.table, result.pending, result.res]
	console.log('===>\nturn', res.row.turn, '\npending', pending, '\nstatus', status);
	//console.log(':::', result);

	if (res.error) {
		assertion(false, '* ERROR *');
		//if (result.res.status === 409)
		return false;
		//return { status: 'error', res };
	}

	//console.log(result.status,result.pending,result.table.pending_actions,result.table.step)
	// 2. If this call completed the round, integrate and advance
	if (status === 'completed') {
		console.log("I am the architect. Finalizing round...");

		let finalTable = gtCopy(table);
		let allMoves = pending; // This is the dictionary of everyone's moves
		let players = finalTable.players;

		// --- GAME SPECIFIC INTEGRATION ---
		for (let name in allMoves) {
			if (players[name]) {
				let move = allMoves[name];
				players[name].score += (move.success ? 1 : -1);
			}
		}

		// Refresh the game state for the next round
		renewSet(finalTable.fen, 2, 8);

		// --- FINALIZATION ---
		finalTable.step += 1;
		finalTable.turn = Object.keys(players);
		finalTable.last_round_results = allMoves;
		finalTable.pending_actions = {}; // Clear buffer
		finalTable.modified = getNow();

		// Push the final state to the DB using the Atomic FS pattern
		res = await tableSaveUpdateFS(finalTable);
		return res.row;
	} else return latestTable;
}


// emoticount.present = (me,table) => {
// 	console.log('JAAAAAAAAAAAA geht',me);
// }

//#endregion

//#region tableSave and dbUpdate
async function ____tableSaveUpdateAll(table, action, playerId) {

	//console.log('HAAAAAAAAAAAAAAAAAAAAA', jsCopy(table), action, playerId)
	//console.log('sending',table, action, playerId);
	let res = await dbUpdateGameTableAll(table.id, table, action, playerId);
	//console.log('res', res);
	let latestTable = res.row;
	let pending = latestTable.pending_actions || {};
	let turn = latestTable.turn || [];
	let x = jsCopy(pending);
	//console.log('_______________', Object.keys(x).length, turn.length);
	//console.log('=>', latestTable)
	//assertion(false, '* THE END *');

	let status = 'none';
	if (Object.keys(pending).length >= Object.keys(table.players).length) {
		status = 'completed';
		// return { status: 'completed', table: latestTable, pending, res };
	} else {
		status = 'waiting';
		//startPolling(table.id, table.step);
		// return { status: 'waiting', table: latestTable, res };
	}
	console.log('____________', '\npending', Object.keys(x), '\nturn', turn, '\nstep', latestTable.step, '\nstatus', status)
	return { status, table: latestTable, pending, res };



}

async function _tableSaveUpdateFS(table) {
	table.modified = getNow();
	let res = await dbUpdateGameTableFS(table.id, table);
}
async function _dbUpdateGameTableFS(id, data) {
	data.expected = { step: data.step }
	let res = await fetch(DA.dbUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			cmd: "modify_row_fs",
			table: "gametable",
			id,
			data
		})
	});
	return await res.json();
}
async function _updateMain(forceUI = false) {
	let hasChanges = await updateData();
	if (!hasChanges && !forceUI) { return false; }
	//const isInteracting = checkPlayerBusy();
	await updateUI(); //isInteracting);
	return true;
}
async function _updateUI() {
	miniClearMain(); mClear('dMain');
	switch (DA.menu) {
		case 'table': await gtShow(); pollOn(); break;
		case 'settings': showSettings(); pollOff(); break;
		case 'games':
		default: showGamesAndTables(); pollOn(); break;
	}
}
async function _gtShow() {
	if (!DA.tid) { await switchToMenu('games'); showMessage('table missing!!!', 4000); return; }
	let table = T = DAGetTable(DA.tid);
	F = T.fen;
	let me = U.name;
	assertion(me == U.name);
	let func = DA.funcs[table.game]();
	let ui = func.present(me, table);
	if (ui.refresh) mFall('dTable', 400);
	if (table.status == 'over') {
		showGameover(table);
	} else if (table.status == 'started' && table.turn.includes(me)) {
		A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: M.config.autosubmit };
		await func.activate(me, table, ui);
	}
}

async function TEMP_dbUpdateGameSync(gameId, step, action, playerId) {
	let res = await fetch(DA.dbUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			cmd: "update_game_sync", // New PHP case name
			id: gameId,
			player_id: playerId,
			data: {
				step: step,
				action: action
			}
		})
	});
	return await res.json();
}
async function TEMP_tableSaveUpdateAll(table, action, playerId) {
	// 1. Mark this player as "moved" in the game_sync table
	let res = await dbUpdateGameSync(table.id, table.step, action, playerId);

	if (res.error) {
		console.error("Sync Error:", res.error);
		return;
	}

	if (res.status === 'completed') {
		// --- I AM THE ARCHITECT ---
		// 'res.moves' is a dictionary: { "Alice": {success:true...}, "Bob": {...} }
		console.log("All players have moved. Finalizing round...");

		// 2. Run the game-specific logic (e.g., in emoticount.js)
		await M[table.game].processFinalize(table, res.moves);
	} else {
		// --- STILL WAITING ---
		showWaitingShield(true);
		startPolling(table.id, table.step);
	}
}
async function TEMP_process(uname, table, pickedCount) {
	let success = (pickedCount == table.fen.correctCount);
	let action = { plName: uname, val: pickedCount, success: success };

	await tableSaveUpdateAll(table, action, uname);
}
async function TEMP_processFinalize(table, allMoves) {
	let nextTable = gtCopy(table);

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
	await updateMain(true, nextTable);
}
//#endregion

//#region emoticount

async function emoProcess(uname, table, pickedCount) {
	console.log('process', uname)
	let success = (pickedCount == table.fen.correctCount);
	let action = { plName: uname, val: pickedCount, success };

	//let res = await dbUpdateGameSync(table.id, table.step, action, playerId);
	let res = await fetch(DA.dbUrl, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			action: "update_game_sync", // New PHP case name
			id: table.id,
			player_id: uname,
			data: {
				step: table.step,
				action: action
			}
		})
	});
	//return await res.json();
	res = await res.json();


	if (res.error) {
		console.error("Sync Error:", res.error);
		return;
	}

	if (res.status === 'completed') {
		// --- I AM THE ARCHITECT ---
		// 'res.moves' is a dictionary: { "Alice": {success:true...}, "Bob": {...} }
		console.log("All players have moved. Finalizing round...");

		// 2. Run the game-specific logic (e.g., in emoticount.js)
		// await M[table.game].processFinalize(table, res.moves);
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


}
async function emotiCount_process(uname, table, pickedCount) {
	let success = pickedCount == table.fen.correctCount;
	let action = { plName: uname, val: pickedCount, success };
	//console.log('process',table,action)

	// 1. Sync move with the server
	removeInPlace(table.turn, uname);


	//let result = await tableSaveUpdateAll(table, action, uname);
	let playerId = uname;
	//console.log('HAAAAAAAAAAAAAAAAAAAAA', jsCopy(table), action, playerId)
	//console.log('sending',table, action, playerId);
	let res = await dbUpdateGameTableAll(table.id, table, action, playerId);
	//console.log('res', res);
	let latestTable = res.row;
	let pending = latestTable.pending_actions || {};
	let turn = latestTable.turn || [];
	let x = jsCopy(pending);
	//console.log('_______________', Object.keys(x).length, turn.length);
	//console.log('=>', latestTable)
	//assertion(false, '* THE END *');

	let status = 'none';
	if (Object.keys(pending).length >= Object.keys(table.players).length) {
		status = 'completed';
		// return { status: 'completed', table: latestTable, pending, res };
	} else {
		status = 'waiting';
		//startPolling(table.id, table.step);
		// return { status: 'waiting', table: latestTable, res };
	}
	console.log('____________', '\npending', Object.keys(x), '\nturn', turn, '\nstep', latestTable.step, '\nstatus', status)
	let result = { status, table: latestTable, pending, res };

	//console.log(':::', result);

	if (result.res.error) {
		assertion(false, '* ERROR *');
		//if (result.res.status === 409)
		return;
		//return { status: 'error', res };
	}

	//console.log(result.status,result.pending,result.table.pending_actions,result.table.step)
	// 2. If this call completed the round, integrate and advance
	if (result.status === 'completed') {
		console.log("I am the architect. Finalizing round...");

		let finalTable = gtCopy(result.table);
		let allMoves = result.pending; // This is the dictionary of everyone's moves
		let players = finalTable.players;

		// --- GAME SPECIFIC INTEGRATION ---
		for (let name in allMoves) {
			if (players[name]) {
				let move = allMoves[name];
				players[name].score += (move.success ? 1 : -1);
			}
		}

		// Refresh the game state for the next round
		renewSet(finalTable.fen, 2, 8);

		// --- FINALIZATION ---
		finalTable.step += 1;
		finalTable.turn = Object.keys(players);
		finalTable.last_round_results = allMoves;
		finalTable.pending_actions = {}; // Clear buffer
		finalTable.modified = getNow();

		// Push the final state to the DB using the Atomic FS pattern
		await tableSaveUpdateFS(finalTable);

		// UI update
		//await updateMain(true, finalTable);
	} else await updateMain(true);
}

async function _process(uname, table, pickedCount) {
	let success = pickedCount == table.fen.correctCount;
	console.log(pickedCount, table.fen.correctCount, success)

	// We update the score in the newTable object. 
	// This ONLY gets saved to the main table once EVERYONE has moved.
	if (success) {
		table.players[uname].score += 1;
	} else {
		table.players[uname].score -= 1;
	}

	// Prepare for next round if this is the final move
	let moveCount = Object.keys(table.pending_actions || {}).length + 1;
	let playerCount = Object.keys(table.players).length;

	if (moveCount >= playerCount) {
		renewSet(table.fen);
		//function integrateRoundResults(table, allMoves) {
		//INTEGRATE RESULTS HERE AND DO NOT DO THE UPDATE ALL!!!
		let newTable = gtCopy(table);
		let players = newTable.players;

		// 1. Update Scores based on all collected moves
		for (let name in allMoves) {
			let move = allMoves[name];
			if (players[name]) {
				if (move.success) players[name].score += 1;
				else players[name].score -= 1;
			}
		}

		// 2. Advance the Game State (FEN)
		// This calls your game-specific 'renewSet' or similar logic
		M[newTable.game].renewSet(newTable.fen);

		// 3. Cleanup for the next round
		newTable.step += 1;
		newTable.last_round_results = allMoves; // Store for history
		newTable.pending_actions = null;        // Clear the buffer

		//   return newTable;
		// }

	}

	// Use our All-Update logic
	await tableSaveUpdateAll(table, { plName: uname, val: pickedCount, success }, uname);
}


async function tableSaveUpdateAll(table, action, playerId) {
	table.modified = getNow();

	// 1. Submit the move to the server
	let res = await dbUpdateGameTableAll(table.id, table, action, playerId);

	if (res.error && res.error.includes('Step mismatch')) {
		console.warn("Sync error (409). Fetching latest table...");
		await updateMain(true); // Force a full refresh from DB
		return;
	}

	if (res.status === 'completed') {
		// Case A: You were the last player to move!
		// The server has already advanced the step.
		console.log("Round finalized by this move.");
		let fullTable = res.row;
		let allMoves = fullTable.pending_actions;

		// 2. Integration: Calculate new scores and new FEN
		let updatedTable = integrateRoundResults(fullTable, allMoves);

		// 3. Finalize: Save the completely updated table to the DB
		// Use FS (First Successful) just in case of a tie, though Step logic handles it.
		await tableSaveUpdateFS(updatedTable);

		console.log("Round integrated and saved by me.");
		//await updateMain(true, res.row);
	} else if (res.status === 'waiting') {
		// Case B: Move recorded, but others are still pending.
		console.log("Move recorded. Waiting for other players...");
		showWaitingShield(true);
		pollOn();
	}

	return res;
}
function BROKEN_badger() {
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
		newTable.action = { plName: uname, step: newTable.step, success };
		await tableSaveUpdateFS(newTable);
		return true;
	}
	function present(me, table) {
		let dTable = stdPresentBGATable(me, table, 500, 'wood');
		showTitleGame(table);
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
//#endregion

function createCenteredPopup(dParent, element, popupStyles = {}) {
	// 1. Ensure the parent has relative positioning for centering
	mStyle(dParent, { position: 'relative' });

	// 2. Define default popup styles
	let defaultPopupStyles = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		bg: 'white',
		padding: 10,
		border: '1px solid black',
		'z-index': 100,
		display: 'inline-block' // Ensures the div wraps the element size
	};

	// Merge custom styles with defaults
	let finalStyles = Object.assign(defaultPopupStyles, popupStyles);

	// 3. Create the popup container using mDom
	let dPopup = mDom(dParent, finalStyles);

	// 4. Append the provided element instead of setting HTML
	mAppend(dPopup, element);

	// 5. Resize parent to fit the popup's actual rendered size
	let rect = element.getBoundingClientRect();
	mStyle(dParent, {
		width: rect.width,
		height: rect.height
	});

	return dPopup;
}
function _createCenteredPopup(dParent, contentHtml, popupStyles = {}) {
	// 1. Ensure the parent has relative positioning so the popup can center within it
	mStyle(dParent, { position: 'relative' });

	// 2. Create the popup using mDom
	// Default styles ensure it starts centered but allows content to dictate size
	let defaultPopupStyles = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		bg: 'white',
		padding: 10,
		border: '1px solid black',
		'z-index': 100,
		display: 'inline-block' // Allows width to be determined by content
	};

	// Merge provided styles with defaults
	let finalStyles = Object.assign(defaultPopupStyles, popupStyles);

	// Create the element using your library's mDom function
	let dPopup = mDom(dParent, finalStyles, { html: contentHtml });

	// 3. Resize the parent div to fit the popup
	// We use getBoundingClientRect to get the actual rendered size of the content
	let rect = dPopup.getBoundingClientRect();

	mStyle(dParent, {
		width: rect.width,
		height: rect.height
	});

	return dPopup;
}


function setupRumorAssignment(playerIds, cardIds) {
	let connections = {};

	playerIds.forEach(id => {
		let d = iDiv(id);
		d.draggable = true;
		d.ondragstart = (ev) => {
			ev.dataTransfer.setData("playerId", id);
		};
	});

	cardIds.forEach(id => {
		let d = iDiv(id);
		d.ondragover = (ev) => ev.preventDefault();
		d.ondrop = (ev) => {
			ev.preventDefault();
			let playerId = ev.dataTransfer.getData("playerId");

			connections[id] = playerId;

			console.log(`Card ${id} connected to Player ${playerId}`);

			if (Object.keys(connections).length === cardIds.length) {
				finalize(connections);
			}
		};
	});
}
function setupRumorAssignment(playerIds, cardIds) {
	let connections = {};

	playerIds.forEach(id => {
		let d = mBy(id); console.log(d)
		d.draggable = true;

		// Add visual feedback during drag
		d.ondragstart = (ev) => {
			ev.dataTransfer.setData("playerId", id);
			mStyle(d, { opacity: 0.5 });
		};
		d.ondragend = (ev) => {
			mStyle(d, { opacity: 1 });
		};
	});

	cardIds.forEach(id => {
		let d = mBy(id);

		d.allowDrop = true;

		// Use mStyle for visual cues
		d.ondragover = (ev) => {
			ev.preventDefault();
			mStyle(d, { outline: '2px dashed yellow' });
		};

		d.ondragleave = (ev) => {
			mStyle(d, { outline: 'none' });
		};

		d.ondrop = (ev) => {
			ev.preventDefault();
			mStyle(d, { outline: 'none' });

			let playerId = ev.dataTransfer.getData("playerId");
			let playerDiv = iDiv(playerId);

			// Logic to handle changing connection
			// Remove previous player pic if it exists in this card
			let oldPic = d.querySelector('.connected-player');
			if (oldPic) oldPic.remove();

			// Create a clone or a specific indicator for the card
			let picClone = get_user_pic(playerId, 30);
			mClass(picClone, 'connected-player');
			mStyle(picClone, { position: 'absolute', top: 0, right: 0 });
			mAppend(d, picClone);

			connections[id] = playerId;

			if (Object.keys(connections).length === cardIds.length) {
				finalize(connections);
			}
		};
	});
}
function setupRumorAssignment(playerIds, cardIds) {
	let connections = {};

	playerIds.forEach(id => {
		let d = iDiv(id);
		let parent = d.parentNode;

		// Store the original home to put it back if replaced
		d.setAttribute('data-home', parent.id || 'player-container');

		d.draggable = true;
		d.ondragstart = (ev) => {
			ev.dataTransfer.setData("playerId", id);
		};
	});

	cardIds.forEach(id => {
		let dCard = iDiv(id);
		mStyle(dCard, { position: 'relative' });

		dCard.ondragover = (ev) => ev.preventDefault();

		dCard.ondrop = (ev) => {
			ev.preventDefault();
			let playerId = ev.dataTransfer.getData("playerId");
			let playerDiv = iDiv(playerId);

			// 1. Check if there is an existing player div already in this card
			let existingPlayer = Array.from(dCard.children).find(child => playerIds.includes(child.id));

			if (existingPlayer && existingPlayer.id !== playerId) {
				// Put old player back to their original home container
				let homeId = existingPlayer.getAttribute('data-home');
				let dHome = iDiv(homeId);
				mAppend(dHome, existingPlayer);
				mStyle(existingPlayer, { position: 'static', transform: 'none' });
			}

			// 2. Move new player into card and center it
			mAppend(dCard, playerDiv);
			mStyle(playerDiv, {
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				margin: 0
			});

			// 3. Update connection state
			connections[id] = playerId;

			if (Object.keys(connections).length === cardIds.length) {
				finalize(connections);
			}
		};
	});
}
function setupRumorAssignment(playerIds, cardIds) {
	let connections = {};

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
			let playerId = ev.dataTransfer.getData("playerId");
			let playerDiv = mBy(playerId);

			let existingPlayer = Array.from(dCard.children).find(child => playerIds.includes(child.id));

			if (existingPlayer && existingPlayer.id !== playerId) {
				let homeId = existingPlayer.getAttribute('data-home');
				let dHome = mBy(homeId);
				mAppend(dHome, existingPlayer);
				mStyle(existingPlayer, { position: 'static', transform: 'none' });
			}

			mAppend(dCard, playerDiv);
			mStyle(playerDiv, {
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				margin: 0
			});

			connections[id] = playerId;

			if (Object.keys(connections).length === cardIds.length) {
				callback(connections);
			}
		};
	});
}

function onclick_view_buildings() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	let buildings = UI.players[uplayer].buildinglist;
	for (const b of buildings) b.items.map(x => face_up(x));
	TO.buildings = setTimeout(hide_buildings, 5000);
}
function hide_buildings() {
	let uplayer = Z.uplayer;
	let buildings = UI.players[uplayer].buildinglist;
	for (const b of buildings) {
		for (let i = 1; i < b.items.length; i++) {
			let card = b.items[i];
			if (b.schweine.includes(card)) continue;
			face_down(b.items[i]);
		}
	}
}

function ariPresentPlayer(plName, table, d, smallsz, isHidden = false) {
	let fen = table.fen;
	let pl = table.players[plName];
	let ui = { div: d };

	//console.log(plName, isHidden)

	let handCards = ui.handCards = pl.hand.map(key => uiTypeCard52(key));
	if (isHidden) { handCards.map(x => face_down(x)); }
	cont = ariContainer(d, `d${capitalize(plName)}Hand`, 'hand');
	let hand = ui.hand = cSplay(handCards, cont, dir = 'right', splay = .25);

	let stallCards = ui.stallCards = pl.stall.map(key => uiTypeCard52(key));
	cont = ariContainer(d, `d${capitalize(plName)}Stall`, 'stall');
	let stall = ui.stall = cSplay(stallCards, cont, dir = 'right', splay = 1.2);
	if (fen.stage < 5 && isHidden) { stallCards.map(x => face_down(x)); }

	let peasantCards = ui.peasantCards = pl.peasants.map(key => uiTypeCard52(key, smallsz, 'green'));
	cont = ariContainer(d, `d${capitalize(plName)}Peasants`, 'peasants');
	let peasants = ui.peasants = cSplay(peasantCards, cont, dir = 'right', splay = 1.2);

	let peasantUsedCards = ui.peasantUsedCards = pl.peasantsUsed.map(key => uiTypeCard52(key, smallsz, 'green'));
	cont = ariContainer(d, `d${capitalize(plName)}PeasantUsed`, 'used');
	let peasantUsed = ui.peasantUsed = cSplay(peasantUsedCards, cont, dir = 'right', splay = 1.2);
	peasantUsedCards.map(x => face_down(x));

	if (exp_commissions(table.options)) {
		if (!isHidden) pl.commissions = cSort(pl.commissions, null, 'A23456789TJQK');
		let commisionCards = ui.commisionCards = pl.commissions.map(key => uiTypeCard52(key, smallsz, 'blue'));
		cont = ariContainer(d, `d${capitalize(plName)}Commissions`, 'commissions');
		let commissions = ui.commissions = cSplay(commisionCards, cont, dir = 'right', splay = 1.2);
		if (isHidden) { commisionCards.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(cont);
		// if (TESTING && isdef(DA.ttest)) {
		//   let testpl = DA.ttest.players[plName];
		//   ui_type_market(testpl.commissions, d1, { matop: -20, maleft: 12 }, `players.${plName}.test.commissions`, 'commissions', uiTypeCommissionCard)
		// }
	}

	if (exp_rumors(table.options)) {
		if (!isHidden) pl.rumors = cSort(pl.rumors, null, 'A23456789TJQK');
		let rumorCards = ui.rumorCards = pl.rumors.map(key => uiTypeCard52(key, smallsz, 'green'));
		cont = ariContainer(d, `d${capitalize(plName)}Rumors`, 'rumors');
		let rumors = ui.rumors = cSplay(rumorCards, cont, dir = 'right', splay = .25);
		if (isHidden) { rumorCards.map(x => face_down(x)); }
		else mMagnifyOnHoverControlPopup(cont);
	}

	ui.journeys = [];
	let i = 0;
	for (const j of pl.journeys) {
		let jCards = j.map(key => uiTypeCard52(key));
		let cont = ariContainer(d, `d${capitalize(plName)}Journey${i}`, 'journey');
		let jui = cSplay(jCards, cont, dir = 'right', splay = 0.2);
		i += 1;
		ui.journeys.push({ jCards, cont, jui });
	}
	mLinebreak(d, 8);
	ui.buildinglist = [];
	ui.indexOfFirstBuilding = arrChildren(d).length;
	for (const k in pl.buildings) {
		let i = 0;
		for (const b of pl.buildings[k]) {
			let type = k;
			let list = b.list;
			let bCards = list.map(key => uiTypeCard52(key));
			let hiddenCards = bCards.filter(x => x.key != b.lead);
			let leadCard = bCards.find(x => x.key == b.lead);

			hiddenCards.map(x => face_down(x));
			let cont = ariContainer(d, `d${capitalize(plName)}Building${k}${i}`, k);
			let bui = cSplay(bCards, cont, dir = 'right', splay = 0.2);
			let dHarvest = null;
			if (isdef(b.h)) {
				let d = iDiv(leadCard);
				mStyle(d, { position: 'relative' });
				dHarvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .8, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
			}
			let dRumors = null, rumorItems = [];
			if (!isEmpty(b.rumors)) {
				let d = cont;
				mStyle(d, { position: 'relative' });
				dRumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 6, right: 4, z: 10000 }); //,bg:'green'});
				for (const rumor of b.rumors) {
					let dr = mDiv(dRumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
					rumorItems.push({ div: dr, key: rumor });
				}
			}

			bui.dHarvest = dHarvest;
			bui.leadCard = leadCard;
			bui.dRumors = dRumors;
			bui.rumorItems = rumorItems;

			//console.log(k, bui)
			// let b_ui = ui_type_building(b, d, { maleft: 8 }, `players.${plName}.buildings.${k}.${i}`, type, ari_get_card, true, isHidden);
			bui.type = k;
			ui.buildinglist.push(bui);
			if (b.isBlackmailed) { mStamp(cont, 'blackmail'); }
			lookupAddToList(ui, ['buildings', k], bui); //GEHT!!!!!!!!!!!!!!!!!!!!!
			i += 1;
		}
	}
	return ui;
}

function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card, separate_lead = false, isHidden = false) {
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

function cSortNeedsItems(items, suitstr = 'CDSH', rankstr = '23456789TJQKA') {
	return items.sort((a, b) => {
		// First, compare by suit
		let asuit = a.key[1];
		let bsuit = b.key[1];
		console.log(suitstr, rankstr)
		if (suitstr && suitstr.indexOf(asuit) !== suitstr.indexOf(bsuit)) {
			return suitstr.indexOf(asuit) - suitstr.indexOf(bsuit);
		}
		return rankstr.indexOf(a.key[0]) - rankstr.indexOf(b.key[0]);// If suits are the same, compare by rank
	});
}
function cSortOk(hand, suits = null, ranks = null) {
	const suitOrder = suits ? Object.fromEntries([...suits].map((s, i) => [s, i])) : null;
	const rankOrder = ranks ? Object.fromEntries([...ranks].map((r, i) => [r, i])) : null;
	return hand.sort((a, b) => {
		const valA = typeof a === 'object' ? a.key : a;
		const valB = typeof b === 'object' ? b.key : b;
		if (suits) {
			const suitDiff = suitOrder[valA[1]] - suitOrder[valB[1]];
			if (suitDiff !== 0) return suitDiff;
		}
		if (ranks) {
			return rankOrder[valA[0]] - rankOrder[valB[0]];
		}
		return 0;
	});
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

function onclickSortCards(items, suitstr = 'CDSH', rankstr = '23456789TJQKA', splayDir = 'right') {
	let cardItems = cSort(items, suitstr, rankstr);
	cResplay(cardItems, splayDir);
}

function cResplay(cardItems, dir = 'right') {
	let dg = cardItems[0].div.parentNode; mClear(dg);
	let n = cardItems.length;
	const cardW = cardItems[0].w;
	const cardH = cardItems[0].h;
	const invSplay = 1 - .25;
	const marginW = -(cardW * invSplay);
	const marginH = -(cardH * invSplay);

	cardItems.forEach((c, i) => {
		let dc = iDiv(c);
		mAppend(dg, dc);
		dc.style.margin = "0";
		dc.style.zIndex = i;
		//if (i < n - 1) dc.style.marginRight = `${marginW}px`;
		if (i < n - 1) {
			if (dir === 'right') dc.style.marginRight = `${marginW}px`;
			if (dir === 'down') dc.style.marginBottom = `${marginH}px`;
			if (dir === 'left') dc.style.marginRight = `${marginW}px`;
			if (dir === 'up') dc.style.marginBottom = `${marginH}px`;
		}
	});
}

function faButton(dParent, key, styles = {}, opts = {}) {
	key = key.replace('_', '-'); //console.log(key);
	let cl = `fa-solid fa-` + key;
	if (opts.ani) cl += ' fa-' + opts.ani; //' '+opts.ani.map(x=>'fa-'+x).join(' ');
	let st = dictPlus(styles, { color: 'red', cursor: 'pointer', fz: 22 });
	return mDom(dParent, st, { tag: 'i', className: cl }); //`fa-solid fa-${key} fa-beat` });
	let o = M.fa[key];
	if (nundef(o)) {
		console.warn(`no superdi entry for key ${key}`);
		return;
	}
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

function ui_type_church(list, dParent, styles = {}, path = 'trick', title = '', get_card_func = uiTypeCard52, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDom(cont, { h: 100, w: 90 });//, { display: 'flex' });
	let items = [];
	let n = list.length;
	let inc = n == 4 ? 45 : n == 2 ? 90 : 360 / n; //console.log('inc', inc)
	let rotation = 0;
	for (const ckey of list) {
		let d = mDom(cardcont, { origin: 'center', transform: `rotate( ${rotation}deg )`, position: 'absolute', left: 8 });
		let c = get_card_func(ckey);
		if (ckey != arrLast(list)) face_down(c);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		let item = c;
		item.cont = d;
		item.itype = 'card';
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

function cSplayStar(cards, dParent) {
	if (cards.length === 0) return;
	const n = cards.length;
	const cardW = cards[0].w;
	const cardH = cards[0].h;
	let dg = mDom(dParent, { padding: 20, position: 'relative' });
	cards.forEach((c, i) => {
		let dc = iDiv(c);
		mAppend(dg, dc);
		dc.style.position = 'absolute';
		dc.style.margin = "0";
		dc.style.width = `${cardW}px`;
		dc.style.height = `${cardH}px`;
		dc.style.zIndex = i;
	});
	return dg;
}


function aristo() {
	const rankstr = 'A23456789TJQK*';
	function setup(table) {
		let fen = table.fen = {};
		let options = table.options;
		let players = table.players;
		let plNames = Object.keys(table.players);
		let n = plNames.length;
		let num_decks = fen.num_decks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		let deck = fen.deck = c52Decks(num_decks).map(x => x + 'n'); arrShuffle(deck);
		let deck_commission = fen.deck_commission = c52Decks(1).map(x => x + 'c'); arrShuffle(deck_commission);
		let deck_luxury = fen.deck_luxury = c52Decks(1).map(x => x + 'l'); arrShuffle(deck_luxury);
		let deck_rumors = fen.deck_rumors = exp_peasants(options) ? c52Decks(1).map(x => x + 'r') : []; if (exp_peasants(options)) shuffle(deck_rumors);
		table.plorder = jsCopy(plNames);
		arrShuffle(table.plorder);
		fen.market = cDeckDeal(deck, 2);
		fen.deck_discard = [];
		fen.open_discard = [];
		fen.commissioned = [];
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

function mButtonX(dParent, handler = null, pos = 'tr', sz = 22, offset = 5, color = 'contrast') {
	mIfNotRelative(dParent);
	let [top, right] = [offset - 3, offset];
	let bx = mDom(dParent, { position: 'absolute', top, right, w: sz, h: sz, cursor: 'pointer' }, { className: 'hop1' });
	bx.onclick = ev => { evNoBubble(ev); if (!handler) dParent.remove(); else handler(ev); }
	let o = M.superdi.xmark;
	let bg = mGetStyle(dParent, 'bg'); if (isEmpty(bg)) bg = 'white';
	let fg = color == 'contrast' ? colorIdealText(bg, true) : color;
	console.log(fg)
	el = mDom(bx, { fz: sz, hline: sz, family: 'fa6', fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
	return bx;
}

async function loadAssetsStatic() {
	if (nundef(M)) M = {};
	M = await loadStaticYaml('y/m.yaml');
	M.superdi = await loadStaticYaml('y/superdi_plus.yaml');
	M.details = await loadStaticYaml('y/details.yaml');
	M.config = await loadStaticYaml('y/config.yaml');
	M.users = await loadStaticYaml('y/users.yaml');
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
	M.emo = await loadStaticYaml('y/diemo.yaml');
	M.emogroup = await loadStaticYaml('y/digroup.yaml');
	M.emokeys = Object.keys(M.emo).sort();
	M.fa = await loadStaticYaml('y/fadi.yaml');
	M.fakeys = Object.keys(M.fa).sort();
}


function simplegame() {
	function setup(table) {
		stdSetupGame(table, 'taketurns');
		let fen = table.fen;
		fen.deck = c52Deck();
		fen.trick = [];
		for (const plname in table.players) {
			let pl = table.players[plname];
			pl.hand = deckDeal(fen.deck, 5);
		}
	}
	async function process(uname, table, key) { }
	function present(me, table) {
		let dTable = stdPresentBGATable(me, table, 1000);
		showTitleGame(table);
		stdStatsScore(me, table);

		let dOpenTable = mDom(dTable, { align: 'center', bg: 'red', round: true, w: 300, h: 300 })


		return { dTable, dOpenTable };
	}
	function activate(me, table, ui) { }
	return { setup, process, present, activate };
}

function gtDefault() {
	function setup(table) { stdSetupGame(table); }
	async function process(uname, table, key) { }
	function present(me, table) {
		let dTable = stdPresentBGATable(me, table, 1000);
		showTitleGame(table);
		stdStatsScore(me, table);
		let dButton = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `${table.step}` })
		return { dTable, dButton };
	}
	function activate(me, table, ui) { }
	return { setup, process, present, activate };
}

function dinogame() {
	function setup(table) {
		stdSetupGame(table, 'wait');
		table.stage = 'wait';
		table.fen.movedone = [];
		console.log('setup', table);
	}
	async function process(uname, table, buttonNumber) {
		//console.log('process', uname, table, buttonNumber)
		let newTable = gtCopy(table);
		lookupAddIfToList(newTable, ['fen', 'movedone'], uname);
		removeInPlace(newTable.turn, uname);
		console.log(newTable.players[uname])
		newTable.players[uname].action = { num: buttonNumber };
		console.log(newTable);
		if (newTable.turn.length == 0) {
			//console.log('___\nplayers',newTable.players,'\nturn',newTable.turn)
			console.log(newTable)
			for (const p in newTable.players) {
				let pl = newTable.players[p];
				pl.score += pl.action.num;
				delete pl.action;
			}
			newTable.turn = Object.keys(newTable.players);
			newTable.fen.movedone = [];
		}
		await tableSaveUpdate(newTable);
		return true;
	}
	function present(me, table) {
		let dTable = stdPresentBGATable(me, table, 1000);
		showTitleGame(table);
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
		return { dTable, dButton1, dButton2, dButton3 };
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



function fillWithTessellation(div, n, type) {
	const container = typeof div === 'string' ? document.getElementById(div) : div;
	container.innerHTML = ''; // Clear previous content

	// Ensure the container has relative positioning for absolute tiles
	container.style.position = 'relative';
	container.style.overflow = 'hidden';

	const rect = container.getBoundingClientRect();
	const step = rect.width / n;

	if (type.toLowerCase() === 'cairo') {
		// Cairo tiling consists of pentagons. 
		// We can simulate this by tiling 2x2 blocks of specific orientations.
		for (let i = -1; i <= n + 1; i++) {
			for (let j = -1; j <= n + 1; j++) {
				const x = i * step;
				const y = j * step;

				// Create the tile element using internal mDom pattern
				let tile = document.createElement('div');
				tile.style.position = 'absolute';
				tile.style.width = `${step + 1}px`; // +1 to prevent sub-pixel gaps
				tile.style.height = `${step + 1}px`;
				tile.style.left = `${x}px`;
				tile.style.top = `${y}px`;
				tile.style.backgroundColor = (i + j) % 2 === 0 ? '#3498db' : '#2ecc71';
				tile.style.border = '0.5px solid rgba(255,255,255,0.3)';

				// Cairo Pentagons logic: 
				// Alternate clip-paths based on grid position to form the characteristic 
				// interlocking pentagonal pattern found in Cairo tiling.
				if ((i + j) % 2 === 0) {
					tile.style.clipPath = 'polygon(0% 50%, 35% 0%, 100% 0%, 100% 100%, 35% 100%)';
				} else {
					tile.style.clipPath = 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)';
				}

				container.appendChild(tile);
			}
		}
	} else {
		// Fallback: Default to a simple square grid if type is unknown
		// Similar to _createGrid logic in the source
		for (let i = 0; i < n; i++) {
			for (let j = 0; j < n; j++) {
				let tile = document.createElement('div');
				tile.style.position = 'absolute';
				tile.style.width = `${step}px`;
				tile.style.height = `${step}px`;
				tile.style.left = `${i * step}px`;
				tile.style.top = `${j * step}px`;
				tile.style.border = '1px solid black';
				tile.style.backgroundColor = (i + j) % 2 === 0 ? '#eee' : '#ccc';
				container.appendChild(tile);
			}
		}
	}
}

//#region orbit layout
function displayOrbitCentered(containerId, n, radius = 300, dotSize = 160, centerSize = 400, padding = 20) {
	const container = document.getElementById(containerId);
	container.style.position = 'relative';

	// 1. Generate points for orbiting dots
	let points = [];
	for (let i = 0; i < n; i++) {
		const angle = (i * 2 * Math.PI) / n - (Math.PI / 2);
		points.push({
			x: radius * Math.cos(angle),
			y: radius * Math.sin(angle)
		});
	}

	// 2. Calculate boundaries including the Center Dot (at 0,0)
	// We check the furthest reach of the orbit dots vs the center dot radius
	const halfCenter = centerSize / 2;
	const halfDot = dotSize / 2;

	// Initial bounds set to the center dot's edges
	let minX = -halfCenter, maxX = halfCenter;
	let minY = -halfCenter, maxY = halfCenter;

	// Expand bounds if any orbiting dots stick out further
	points.forEach(p => {
		minX = Math.min(minX, p.x - halfDot);
		maxX = Math.max(maxX, p.x + halfDot);
		minY = Math.min(minY, p.y - halfDot);
		maxY = Math.max(maxY, p.y + halfDot);
	});

	// 3. Final Dimensions
	const totalW = (maxX - minX) + (padding * 2);
	const totalH = (maxY - minY) + (padding * 2);

	// 4. Position the origin (0,0) relative to the top-left of the box
	const centerX = padding - minX;
	const centerY = padding - minY;

	// Draw Center (Red)
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

	// Draw Orbiters (Blue)
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

	return { w: totalW, h: totalH, centerX, centerY };
}


function displayOrbitLayout(containerId, n, radius = 300, dotSize = 60) {
	const container = document.getElementById(containerId);
	container.style.position = 'relative';

	// 1. Create the Middle Div
	//mDom()
	const center = document.createElement('div');
	center.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${dotSize}px;
    height: ${dotSize}px;
    background: red;
    border-radius: 50%;
    transform: translate(-50%,0%);
  `;
	container.appendChild(center);

	// 2. Create the Orbiting Divs
	for (let i = 0; i < n; i++) {
		// Calculate angle in radians (360 degrees = 2 * PI)
		const angle = (i * 2 * Math.PI) / n;

		// Calculate X and Y offsets
		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);

		const orbitDiv = document.createElement('div');
		orbitDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${dotSize}px;
      height: ${dotSize}px;
      background: blue;
      border-radius: 50%;
      /* Move to center, then offset by X/Y, then center itself */
      transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));
    `;
		container.appendChild(orbitDiv);
	}
}

function displayOrbitLayout(containerId, n, radius = 500, centerSize = 300, dotSize = 60) {
	const container = document.getElementById(containerId);
	container.style.position = 'relative';

	// 1. Create the Middle Div
	const center = document.createElement('div');
	center.style.cssText = `
    position: absolute;
    top: ${dotSize + centerSize / 2}px;
    left: 50%;
    width: ${centerSize}px;
    height: ${centerSize}px;
    background: red;
    border-radius: 50%;
    transform: translate(-50%, 0%);
  `;
	container.appendChild(center);
	return;

	// 2. Create the Orbiting Divs
	for (let i = 0; i < n; i++) {
		// Calculate angle in radians (360 degrees = 2 * PI)
		const angle = (i * 2 * Math.PI) / n;

		// Calculate X and Y offsets
		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);

		const orbitDiv = document.createElement('div');
		orbitDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${dotSize}px;
      height: ${dotSize}px;
      background: blue;
      border-radius: 50%;
      /* Move to center, then offset by X/Y, then center itself */
      transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));
    `;
		container.appendChild(orbitDiv);
	}
}

function displayTopOrbitLayout(containerId, n, radius = 500, dotSize = 150, centerSize = 300) {
	const container = document.getElementById(containerId);
	container.style.position = 'relative';

	// The vertical anchor point: distance from the top 
	// enough to fit the radius and the half the dot's height
	const centerY = radius + (dotSize / 2);

	// 1. Create the "Table Center" (Red Div)
	const center = document.createElement('div');
	center.style.cssText = `
    position: absolute;
    top: ${centerY}px;
    left: 50%;
    width: ${centerSize}px;
    height: ${centerSize}px;
    background: red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  `;
	container.appendChild(center);

	// 2. Create the Orbiting Divs (Blue Divs)
	for (let i = 0; i < n; i++) {
		// Start at -Math.PI / 2 to place the first dot at 12 o'clock
		const angle = (i * 2 * Math.PI) / n - (Math.PI / 2);

		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);

		const orbitDiv = document.createElement('div');
		orbitDiv.style.cssText = `
      position: absolute;
      top: ${centerY}px; 
      left: 50%;
      width: ${dotSize}px;
      height: ${dotSize}px;
      background: blue;
      border-radius: 50%;
      /* Align to the center of the orbit, then offset by X and Y */
      transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));
    `;
		container.appendChild(orbitDiv);
	}
}
function displayTopOrbitLayout(containerId, n, radius = 100, dotSize = 20, centerSize = 40) {
	const container = document.getElementById(containerId);
	container.style.position = 'relative';

	// Total dimensions needed to fit the orbit and the dots
	const totalW = (radius * 2) + dotSize;
	const totalH = (radius * 2) + dotSize;

	// The vertical anchor point (the center of the red div)
	const centerY = radius + (dotSize / 2);

	// 1. Create the "Table Center"
	const center = document.createElement('div');
	center.style.cssText = `
    position: absolute;
    top: ${centerY}px;
    left: 50%;
    width: ${centerSize}px;
    height: ${centerSize}px;
    background: red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  `;
	container.appendChild(center);

	// 2. Create the Orbiting Divs
	for (let i = 0; i < n; i++) {
		const angle = (i * 2 * Math.PI) / n - (Math.PI / 2);
		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);

		const orbitDiv = document.createElement('div');
		orbitDiv.style.cssText = `
      position: absolute;
      top: ${centerY}px; 
      left: 50%;
      width: ${dotSize}px;
      height: ${dotSize}px;
      background: blue;
      border-radius: 50%;
      transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));
    `;
		container.appendChild(orbitDiv);
	}

	// Return the bounding box dimensions
	return {
		w: totalW,
		h: totalH
	};
}
function displayTopOrbitLayout(containerId, n, radius = 100, dotSize = 20, centerSize = 40, padding = 10) {
	const container = document.getElementById(containerId);
	container.style.position = 'relative';

	// Total dimensions: Diameter + Dot Thickness + Padding on both sides
	const totalW = (radius * 2) + dotSize + (padding * 2);
	const totalH = (radius * 2) + dotSize + (padding * 2);

	// Vertical anchor point: 
	// We need enough space for Padding + Half a Dot + Radius
	const centerY = padding + (dotSize / 2) + radius;

	// 1. Create the "Table Center" (Red Div)
	const center = document.createElement('div');
	center.style.cssText = `
    position: absolute;
    top: ${centerY}px;
    left: 50%;
    width: ${centerSize}px;
    height: ${centerSize}px;
    background: red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  `;
	container.appendChild(center);

	// 2. Create the Orbiting Divs (Blue Divs)
	for (let i = 0; i < n; i++) {
		const angle = (i * 2 * Math.PI) / n - (Math.PI / 2);
		const x = radius * Math.cos(angle);
		const y = radius * Math.sin(angle);

		const orbitDiv = document.createElement('div');
		orbitDiv.style.cssText = `
      position: absolute;
      top: ${centerY}px; 
      left: 50%;
      width: ${dotSize}px;
      height: ${dotSize}px;
      background: blue;
      border-radius: 50%;
      transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px));
    `;
		container.appendChild(orbitDiv);
	}

	return {
		w: totalW,
		h: totalH
	};
}
function displayOrbitCentered(containerId, n, radius = 100, dotSize = 20, centerSize = 40, padding = 10) {
	const container = document.getElementById(containerId);
	container.style.position = 'relative';

	// 1. Calculate the relative coordinates of all dots
	let points = [];
	for (let i = 0; i < n; i++) {
		const angle = (i * 2 * Math.PI) / n - (Math.PI / 2);
		points.push({
			x: radius * Math.cos(angle),
			y: radius * Math.sin(angle)
		});
	}

	// 2. Find the "Extents" (the furthest bounds reached by dots)
	// We include the dotSize/2 because the (x,y) is the center of the dot
	const minX = Math.min(...points.map(p => p.x)) - dotSize / 2;
	const maxX = Math.max(...points.map(p => p.x)) + dotSize / 2;
	const minY = Math.min(...points.map(p => p.y)) - dotSize / 2;
	const maxY = Math.max(...points.map(p => p.y)) + dotSize / 2;

	// 3. Calculate the actual width and height of the "Shape"
	const contentW = maxX - minX;
	const contentH = maxY - minY;

	// 4. Calculate total dimensions including padding
	const totalW = contentW + (padding * 2);
	const totalH = contentH + (padding * 2);

	// 5. Calculate where the "Table Center" (0,0) needs to be 
	// to make the whole shape centered in the container
	// We offset it so the leftmost point sits at 'padding'
	const centerX = padding - minX;
	const centerY = padding - minY;

	// Draw Middle Div
	const center = document.createElement('div');
	center.style.cssText = `
    position: absolute;
    top: ${centerY}px;
    left: ${centerX}px;
    width: ${centerSize}px;
    height: ${centerSize}px;
    background: red;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  `;
	container.appendChild(center);

	// Draw Orbiting Divs
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

	return { w: totalW, h: totalH };
}
function displayOrbitCentered(containerId, n, radius = 400, dotSize = 230, centerSize = 500, padding = 20) {
	const container = document.getElementById(containerId);
	container.style.position = 'relative';

	// 1. Generate the relative points (0,0 is the red dot)
	let points = [];
	for (let i = 0; i < n; i++) {
		const angle = (i * 2 * Math.PI) / n - (Math.PI / 2);
		points.push({
			x: radius * Math.cos(angle),
			y: radius * Math.sin(angle)
		});
	}

	// 2. Find the visual boundaries (including the thickness of the dots)
	const minX = Math.min(...points.map(p => p.x)) - dotSize / 2;
	const maxX = Math.max(...points.map(p => p.x)) + dotSize / 2;
	const minY = Math.min(...points.map(p => p.y)) - dotSize / 2;
	const maxY = Math.max(...points.map(p => p.y)) + dotSize / 2;

	// 3. Calculate dimensions of the actual shape
	const contentW = Math.max(maxX - minX, centerSize);
	const contentH = Math.max(maxY - minY, centerSize);

	// 4. Calculate total box size
	const totalW = contentW + (padding * 2);
	const totalH = contentH + (padding * 2);

	// 5. The "Magic Offset"
	// We want the 'min' point to be at 'padding'
	// If minX is -100 and padding is 20, centerX must be 120.
	const centerX = padding - minX;
	const centerY = padding - minY;

	// Draw Center (Red)
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

	// Draw Orbiters (Blue)
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

	return { w: totalW, h: totalH, centerX, centerY };
}

//#endregion
function aMove(d, dSource, dTarget, callback, offset, ms, easing, fade) {
	let b1 = getRect(dSource);
	let b2 = getRect(dTarget);
	if (nundef(offset)) offset = { x: 0, y: 0 };
	let dist = { x: b2.x - b1.x + offset.x, y: b2.y - b1.y + offset.y };
	d.style.zIndex = 100;
	let a = d.animate({ opacity: valf(fade, 1), transform: `translate(${dist.x}px,${dist.y}px)` }, { easing: valf(easing, 'EASE'), duration: ms });
	a.onfinish = () => { d.style.zIndex = iZMax(); if (isdef(callback)) callback(); };
}

function mTranslate(child, newParent, ms = 800, callback = null) {
	let [dx, dy] = get_screen_distance(child, newParent);
	onend = () => { mAppend(newParent, child); if (callback) callback(); };
	mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px)`], onend, ms, 'ease'); //translate(${dx}px,${dy}px)`
}
function get_screen_distance(child, newParent) {
	child = toElem(child);
	newParent = toElem(newParent);
	const parentOriginal = child.parentNode;
	let children = arrChildren(parentOriginal);
	let iChild = children.indexOf(child);
	let sibling = iChild == children.length - 1 ? null : children[iChild + 1];
	const x0 = child.getBoundingClientRect().left;
	const y0 = child.getBoundingClientRect().top;
	newParent.appendChild(child);
	const x1 = child.getBoundingClientRect().left;
	const y1 = child.getBoundingClientRect().top;
	if (sibling) parentOriginal.insertBefore(child, sibling); else parentOriginal.appendChild(child);
	return [x1 - x0, y1 - y0];
}

async function _onclickTest23() {

	console.log(UI.uDeck)
	let top = UI.uDeck.topCard;
	console.log(top)
	let dg = UI.gHand;

	animateCardToHand(top, dg, () => {
		let dParent = UI.dDeck;
		mClear(dParent);

		UI.uHandCards.push(top);
		removeInPlace(UI.uDeckCards, top);
		UI.uDeck = drawDeck(UI.uDeckCards, 'dDeck', 'up');
		console.log('done');
	});
}
async function _onclickTest23() {
	// Check if there are cards to draw
	if (!UI.uDeckCards || UI.uDeckCards.length === 0) return;

	let top = UI.uDeck.topCard;

	// We use the ID strings for the animator to find the DOM positions
	animateCardToHand(top, 'dHand', async () => {

		// 1. DATA UPDATE
		// Remove from deck array and add to hand array
		removeInPlace(UI.uDeckCards, top);
		UI.uHandCards.push(top);
		console.log(UI.uDeckCards, UI.uHandCards)

		await mSleep(500)
		mClear('dPage');
		return;
		let uDeck = drawDeck(UI.uDeckCards, 'dDeck', 'up');
		console.log(uDeck);
		//let gDeck = cSplayDiagonal(uDeck.slice(-5), 'dDeck', 0.008);
		let gHand = cSplay(UI.uHandCards, 'dHand', 'right');

		// // 2. RE-RENDER HAND
		// // cSplay clears dHand internally, so no need for mClear here
		// UI.gHand = cSplay(UI.uHandCards, 'dHand', 'right');

		// // 3. RE-RENDER DECK
		// // This will clear 'dDeck' and draw the remaining cards
		// UI.uDeck = drawDeck(UI.uDeckCards, 'dDeck', 'up');

		console.log('Animation complete. Deck size:', UI.uDeckCards.length);
	});
}


function drawDeck(cards, dParent, face = 'up', splay = 0.008) {
	if (cards.length === 0) return;

	mClear(dParent);
	const n = cards.length;
	const visualCount = Math.max(2, Math.min(n, Math.ceil(n / 15)));

	console.log('visualCount', visualCount, 'n', n);


	const cardW = cards[0].w;
	const cardH = cards[0].h;

	const offW = cardW * splay;
	const offH = cardH * splay;

	// Create the staircase grid
	let dg = mGrid(visualCount, visualCount, dParent, { gap: 0, padding: 20 });
	dg.style.display = 'inline-grid';
	dg.style.gridTemplateColumns = `repeat(${visualCount - 1}, ${offW}px) ${cardW}px`;
	dg.style.gridTemplateRows = `repeat(${visualCount - 1}, ${offH}px) ${cardH}px`;



	for (let i = 0; i < visualCount; i++) {
		let dc;
		const isTopCard = (i === visualCount - 1);

		if (isTopCard) {
			// The actual playable card (the last one in the deck)
			let cardObj = cards[n - 1];
			if (face == 'down') face_down(cardObj);
			dc = iDiv(cardObj);
			//make_card_selectable(cardObj);
		} else {
			// A simplified grey placeholder
			dc = document.createElement('div');
			mStyle(dc, { bg: 'dimgray', border: '1px solid #ccc', rounding: 6 })
			// dc.style.backgroundColor = 'dimgray'; // Light Grey
			// dc.style.border = '1px solid #ccc';
			// dc.style.borderRadius = '6px';
		}

		// Standard positioning
		mStyle(dc, { gridRow: i + 1, gridCol: i + 1, w: cardW, h: cardH, z: i });
		// dc.style.gridColumn = i + 1;
		// dc.style.gridRow = i + 1;
		// dc.style.width = `${cardW}px`;
		// dc.style.height = `${cardH}px`;
		// dc.style.zIndex = i;

		mAppend(dg, dc);
	}

	// After the loop, add a count badge to the container
	if (cards.length > 0) {
		addBadge(dg, cards.length);
	}

	return cards[n - 1];
}
function cSplay(cards, dParent, dir = 'right', splay = 0.25) {
	if (cards.length === 0) return;
	mClear(dParent);
	if (dir == 'diagonal') return cSplayDiagonal(cards, dParent, splay);

	const n = cards.length;
	const cardW = cards[0].w;
	const cardH = cards[0].h;

	const invSplay = 1 - splay;
	const marginW = -(cardW * invSplay);
	const marginH = -(cardH * invSplay);

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

		// 1. Z-INDEX: Higher index for EARLIER cards in the array
		// This makes cards[0] the topmost card visually.
		dc.style.zIndex = n - i;

		// 2. MARGIN LOGIC:
		// We apply margins to every card EXCEPT the one that is physically last in the visual stack.
		if (i > 0) {
			if (dir === 'right') dc.style.marginLeft = `${marginW}px`;
			if (dir === 'down') dc.style.marginTop = `${marginH}px`;
			if (dir === 'left') dc.style.marginRight = `${marginW}px`;
			if (dir === 'up') dc.style.marginBottom = `${marginH}px`;
		}
	});
	return dg;
}
function cSplay(cards, dParent, dir = 'right', splay = 0.25) {
	if (cards.length === 0) return;
	mClear(dParent);
	if (dir == 'diagonal') return cSplayDiagonal(cards, dParent, splay);

	const n = cards.length;
	const cardW = cards[0].w;
	const invSplay = 1 - splay;
	const marginW = -(cardW * invSplay);

	let dg = mGrid(1, n, dParent, { gap: 0, padding: 20 });
	dg.style.display = 'inline-grid';
	dg.style.gridTemplateColumns = `repeat(${n}, max-content)`;

	cards.forEach((c, i) => {
		let dc = iDiv(c);
		mAppend(dg, dc);

		dc.style.margin = "0";
		// Card 0 has the highest Z-Index
		dc.style.zIndex = n - i;

		// To splay RIGHT but keep Card 0 on top:
		// Every card after the first one pulls itself LEFT to tuck under the previous card.
		if (i > 0) {
			if (dir === 'right') dc.style.marginLeft = `${marginW}px`;
			if (dir === 'down') dc.style.marginTop = `${marginW}px`; // Uses width-based splay for consistency
		}
	});
	return dg;
}
function cSplay(cards, dParent, dir = 'right', splay = 0.25) {
	if (cards.length === 0) return;
	mClear(dParent);

	// Use a reversed copy so we don't mutate the actual hand data
	const revCards = [...cards].reverse();
	const n = revCards.length;
	const cardW = revCards[0].w;
	const cardH = revCards[0].h;
	const offW = cardW * splay;
	const offH = cardH * splay;

	// For 'right' or 'down', the "full" card is now at the END of the track
	// but since it's the reversed cards[0], it looks like the start!
	let dg = mGrid(1, 1, dParent, { gap: 0, padding: 20 });
	dg.style.display = 'inline-grid';

	if (dir === 'right') {
		dg.style.gridTemplateColumns = `repeat(${n - 1}, ${offW}px) ${cardW}px`;
		dg.style.gridTemplateRows = `${cardH}px`;
	} else if (dir === 'down') {
		dg.style.gridTemplateColumns = `${cardW}px`;
		dg.style.gridTemplateRows = `repeat(${n - 1}, ${offH}px) ${cardH}px`;
	}

	revCards.forEach((c, i) => {
		let dc = iDiv(c);
		mAppend(dg, dc);

		// Standard placement: they just fill the tracks
		// No z-index or margins needed!
		dc.style.gridColumn = i + 1;
		dc.style.gridRow = (dir === 'down') ? i + 1 : 1;
		dc.style.margin = "0";
	});

	return dg;
}

function ui_type_deck(list, dParent, styles = {}, path = 'deck', title = 'deck', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let items = [];
	ensure_ui(list, cardcont, items, get_card_func);
	ui_add_container_title(title, cont, items, show_if_empty);
	function get_topcard() { return isEmpty(list) ? null : items[0]; }
	function get_bottomcard() { return isEmpty(list) ? null : arrLast(items); }
	function ensure_ui(list, cardcont, items, get_card_func) {
		clearElement(cardcont);
		arrClear(items);
		if (isEmpty(list)) return;
		let n = Math.min(2, list.length);
		let ct = get_card_func(list[0]);
		items.push(ct);
		if (n > 1) {
			let cb = get_card_func(arrLast(list));
			items.push(cb);
		}
		mStyle(cardcont, { position: 'relative', wmin: ct.w + 8, hmin: ct.h });
		for (let i = items.length - 1; i >= 0; i--) {
			let x = items[i];
			face_down(x);
			mAppend(cardcont, iDiv(x));
			mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 })
		}
		mText(list.length, iDiv(ct), { position: 'absolute', left: list.length >= 100 ? '10%' : '25%', top: 10, fz: ct.h / 3 }); //add number of cards in deck to top card
	}
	return {
		ctype: 'deck',
		container: cont,
		cardcontainer: cardcont,
		items: items,
		list: list,
		title: title,
		path: path,
		func: get_card_func,
		get_topcard: get_topcard,
		get_bottomcard: get_bottomcard,
		get_card_func: get_card_func,
		renew: ensure_ui,
	};
}

function deckDrawTop(deckArray) {
	return deckArray.pop(); // Removes and returns the last element
}
function deckDiscardToBottom(deckArray, cardItem) {
	deckArray.unshift(cardItem); // Adds to the start of the array
}
function drawDeck(cards, dParent, face = 'up', splay = 0.008) {
	if (cards.length === 0) return;

	mClear(dParent);
	const n = cards.length;
	// Limit the visual stack to a maximum of 6 elements to save performance
	const visualCount = Math.max(2, Math.min(n, Math.ceil(n / 15)));
	console.log('visualCount', visualCount, 'n', n);
	const cardW = cards[0].w;
	const cardH = cards[0].h;

	const offW = cardW * splay;
	const offH = cardH * splay;

	// Create the staircase grid
	let dg = mGrid(visualCount, visualCount, dParent, { gap: 0, padding: 20 });
	dg.style.display = 'inline-grid';
	dg.style.gridTemplateColumns = `repeat(${visualCount - 1}, ${offW}px) ${cardW}px`;
	dg.style.gridTemplateRows = `repeat(${visualCount - 1}, ${offH}px) ${cardH}px`;



	for (let i = 0; i < visualCount; i++) {
		let dc;



		const isTopCard = (i === visualCount - 1);

		if (isTopCard) {
			// The actual playable card (the last one in the deck)
			let cardObj = cards[n - 1];
			if (face == 'down') face_down(cardObj);
			dc = iDiv(cardObj);
			//make_card_selectable(cardObj);
		} else {
			// A simplified grey placeholder
			dc = document.createElement('div');
			mStyle(dc, { bg: 'dimgray', border: '1px solid #ccc', rounding: 6 })
			// dc.style.backgroundColor = 'dimgray'; // Light Grey
			// dc.style.border = '1px solid #ccc';
			// dc.style.borderRadius = '6px';
		}
		// if (i === n-1 && n > visualCount) {
		// 	dc.style.display = 'flex';
		// 	dc.style.alignItems = 'center';
		// 	dc.style.justifyContent = 'center';
		// 	dc.style.fontSize = '20px';
		// 	dc.style.color = 'navy';
		// 	dc.textContent = n; // Shows total count on the bottom sliver
		// }

		// Standard positioning
		mStyle(dc, { gridRow: i + 1, gridCol: i + 1, w: cardW, h: cardH, z: i });
		// dc.style.gridColumn = i + 1;
		// dc.style.gridRow = i + 1;
		// dc.style.width = `${cardW}px`;
		// dc.style.height = `${cardH}px`;
		// dc.style.zIndex = i;

		mAppend(dg, dc);
	}

	// After the loop, add a count badge to the container
	if (cards.length > 0) {
		addBadge(dg, cards.length);
	}

	return cards[n - 1];
}

function handleDeckClick() {
	let drawnCard = deckDrawTop(myDeckArray);

	mClassRemove(drawnCard.div, 'selectable');
	drawnCard.div.onclick = null;

	// Add to hand (using unshift as you did)
	deckDiscardToBottom(myHand, drawnCard);

	// UI: Re-render deck
	let topCard = drawDeck(myDeckArray, 'dDeck');
	if (topCard) {
		let d = topCard.div;
		mClass(d, 'selectable');
		d.onclick = handleDeckClick;
	}

	// UI: Re-render hand
	let handContainer = document.getElementById('dHand');
	handContainer.innerHTML = ''; // Clear content
	handContainer.style.display = 'grid'; // Ensure it's in grid mode, not flex

	// Call your splay function
	// Note: Ensure your cSplay/drawSplayedHand function resets 
	// gridTemplateColumns and gridTemplateRows internally!
	cSplay(myHand, 'dHand', 'right');
}



function face_up(item) {
	if (item.faceUp) return;
	if (lookup(item, ['live', 'dCover'])) mStyle(item.live.dCover, { display: 'none' });
	else item.div.innerHTML = isdef(item.c52key) ? C52[item.c52key] : item.html;
	item.faceUp = true;
}
function face_down(item, color, texture) {
	if (!item.faceUp) return;
	if (isdef(texture) || lookup(item, ['live', 'dCover'])) {
		face_down_alt(item, color, texture);
	} else {
		let svgCode = M.c52.card_2B; //C52 is cached asset loaded in _start
		svgCode = `<svg xmlns="http://www.w3.org/2000/svg" class="card" face="2B" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
				<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
				<rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="#b01b1b" fill-opacity="0.5"></rect>
				<defs>
					<pattern id="backPatternLarge" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
						<path d="M15 0 L30 15 L15 30 L0 15 Z" fill="none" stroke="white" stroke-width="2" stroke-opacity=".8"/>
					</pattern>
				</defs>
				<rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="url(#backPatternLarge)"></rect>
			</svg>`;
		item.div.innerHTML = svgCode;
		if (nundef(color)) color = item.color;
		if (isdef(item.color)) item.div.children[0].children[1].setAttribute('fill', item.color);
	}
	item.faceUp = false;
}
function addBadge(dg, text) {
	mStyle(dg, { position: 'relative' });
	let badge = document.createElement('div');
	badge.textContent = text;
	badge.style.position = 'absolute';
	badge.style.bottom = '5px';
	badge.style.right = '5px';
	badge.style.background = 'red';
	badge.style.color = 'white';
	badge.style.borderRadius = '50%';
	badge.style.padding = '2px 6px';
	badge.style.fontSize = '12px';
	badge.style.zIndex = 100; // Always on top

	dg.style.position = 'relative'; // Ensure badge stays inside
	mAppend(dg, badge);

}
function redrawDeck(cards, containerId, splay = 0.02) {
	// 1. Get the container and clear it
	const root = document.getElementById(containerId);
	if (!root) return null;
	root.innerHTML = '';

	// 2. Handle empty deck
	if (!cards || cards.length === 0) return null;

	const n = cards.length;
	const visualCount = Math.min(n, 6);
	const cardW = cards[0].w;
	const cardH = cards[0].h;
	const offW = cardW * splay;
	const offH = cardH * splay;

	// 3. Create the new grid
	// We use your mGrid helper to set up the structure
	let dg = mGrid(visualCount, visualCount, containerId, {
		gap: 0,
		padding: 20,
		box: true
	});

	dg.style.display = 'grid';
	dg.style.position = 'relative'; // For the badge
	dg.style.gridTemplateColumns = `repeat(${visualCount - 1}, ${offW}px) ${cardW}px`;
	dg.style.gridTemplateRows = `repeat(${visualCount - 1}, ${offH}px) ${cardH}px`;

	// 4. Draw the stack
	for (let i = 0; i < visualCount; i++) {
		let dc;
		const isTopCard = (i === visualCount - 1);

		if (isTopCard) {
			// Use the actual top card object
			let topCardObj = cards[n - 1];
			dc = iDiv(topCardObj);

			// Reset card specific styles that might have been changed elsewhere
			dc.style.margin = "0";
			make_card_selectable(topCardObj);
		} else {
			// Create a dummy sliver
			dc = document.createElement('div');
			dc.style.backgroundColor = '#d3d3d3';
			dc.style.border = '1px solid #888';
			dc.style.borderRadius = '4px';
		}

		// Grid Positioning
		dc.style.gridColumn = i + 1;
		dc.style.gridRow = i + 1;
		dc.style.width = `${cardW}px`;
		dc.style.height = `${cardH}px`;
		dc.style.zIndex = i;

		mAppend(dg, dc);
	}

	// 5. Add a Count Badge (Alternative to textContent)
	// This avoids touching the Card SVG entirely
	let badge = document.createElement('div');
	badge.textContent = n;
	badge.style.cssText = `
    position: absolute;
    bottom: 5px;
    right: 5px;
    background: rgba(0,0,0,0.7);
    color: white;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 14px;
    font-family: sans-serif;
    z-index: 100;
    pointer-events: none;
  `;
	mAppend(dg, badge);

	return cards[n - 1];
}
function ui_type_deck(list, dParent, styles = {}, path = 'deck', title = 'deck', get_card_func = uiTypeCard52, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDom(cont);
	let items = [];
	ensure_ui(list, cardcont, items, get_card_func);
	ui_add_container_title(title, cont, items, show_if_empty);
	function get_topcard() { return isEmpty(list) ? null : items[0]; }
	function get_bottomcard() { return isEmpty(list) ? null : arrLast(items); }
	function ensure_ui(list, cardcont, items, get_card_func) {
		clearElement(cardcont); arrClear(items); if (isEmpty(list)) return;
		let n = Math.min(2, list.length); let ct = get_card_func(list[0]); items.push(ct); if (n > 1) { let cb = get_card_func(arrLast(list)); items.push(cb); }
		mStyle(cardcont, { position: 'relative', wmin: ct.w + 8, hmin: ct.h });
		for (let i = items.length - 1; i >= 0; i--) { let x = items[i]; face_down(x); mAppend(cardcont, iDiv(x)); mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 }) }
		mText(list.length, iDiv(ct), { position: 'absolute', left: list.length >= 100 ? '10%' : '25%', top: 10, fz: ct.h / 3 }); //add number of cards in deck to top card
	}
	return {
		ctype: 'deck',
		container: cont,
		cardcontainer: cardcont,
		items: items,
		list: list,
		title: title,
		path: path,
		func: get_card_func,
		get_topcard: get_topcard,
		get_bottomcard: get_bottomcard,
		get_card_func: get_card_func,
		renew: ensure_ui,
	};
}
function _drawDeck(cards, containerId) {
	const n = cards.length;
	if (n === 0) return;

	// If the deck is large, only show the last 3-5 visual layers
	const visualCount = Math.min(n, 5);
	const displayCards = cards.slice(-visualCount); // Get the top cards

	// Now call your splay function on just those 5 cards
	// This looks identical to 100 cards but uses 95% less RAM/CPU
	cSplay(displayCards, containerId, 'diagonal', 0.005);
}


function ui_type_hand(cards, dt, styles = {}, path = 'hand', title = 'hand', get_card_func = uiTypeCard52, show_if_empty = false) {
	//let cards = stage == 1 ? fen.akku : pl.hand; console.log('cards', cards);
	//cards = ['7C'];//, '8D', '9H', 'TS', 'JD', 'QC', 'KH', 'AC', '2D', '3H', '4S'];
	cards = cSort(cards, null, '23456789TJQKA');//'CDHS'
	let dcards = mDom(dt, { align: 'center', display: 'flex', mabottom: 10 }); //, { display: 'flex', justifyContent: 'center', alignItems: 'center' });
	let items = cards.map(x => get_card_func(x, 100));
	let padding = 0;
	let margin = 0;
	let dx = mDom(dcards, { display: 'grid', gridCols: `repeat(${cards.length},1fr)`, gap: 0, margin });
	let w = cSplay(dx, items.map(x => iDiv(x)), items[0].w);
	dx.style.width = dcards.style.width = (w + padding + margin - 50) + "px";
	ui_add_container_title(title, dt, items, show_if_empty);
	return {
		ctype: 'hand',
		list: cards,
		path: path,
		contparent: dt,
		container: dcards,
		cardcontainer: dx,
		//splay: splay,
		items: items,
	};
}
function showCards(dt, cards, sz = 150) {
	cards = ['7C'];//, '8D', '9H', 'TS', 'JD', 'QC', 'KH', 'AC', '2D', '3H', '4S'];
	cards = cSort(cards, null, '23456789TJQKA');//'CDHS'
	let dcards = mDom(dt, { align: 'center', display: 'flex' }); //, { display: 'flex', justifyContent: 'center', alignItems: 'center' });
	let ui = {};
	ui.cards = cards.map(x => uiTypeCard52(x, sz));
	let padding = 0;
	let margin = 0;
	let dx = mDom(dcards, { display: 'grid', gridCols: 'repeat(5,1fr)', gap: 10, margin });
	let w = cSplay(dx, ui.cards.map(x => iDiv(x)), ui.cards[0].w);
	dx.style.width = (w + padding + margin) + "px";
}
function cSplay(container, cards, w = 70, overlap = 0.75) {
	const cardWidth = w;
	const step = cardWidth * (1 - overlap);
	mStyle(container, { display: 'grid' }); //, maleft: -(cardWidth * .75) })
	container.style.gridTemplateColumns = `repeat(${cards.length}, ${step}px)`;
	cards.forEach((card, i) => {
		mAppend(container, card);
		card.style.gridColumn = i + 1;
		card.style.width = cardWidth + "px";
	});
	container.style.width = '500px';
	let x = (step * (cards.length - 1) + 2 * cardWidth);
	return x;
	console.log(x);
	container.style.width = x + "px";
}

function cSort(hand, suits = null, ranks = null) {
	const suitOrder = suits ? Object.fromEntries([...suits].map((s, i) => [s, i])) : null;
	const rankOrder = ranks ? Object.fromEntries([...ranks].map((r, i) => [r, i])) : null;
	return hand.sort((a, b) => {
		if (suits) {
			const suitDiff = suitOrder[a[1]] - suitOrder[b[1]];
			if (suitDiff !== 0) return suitDiff;
		}
		if (ranks) {
			return rankOrder[a[0]] - rankOrder[b[0]];
		}
		return 0;
	});
}

function mGrid(rows, cols, dParent, styles = {}, opts = {}) {
	styles.display = 'grid';
	if (isNumber(rows)) {
		[rows, cols] = [Math.ceil(rows), Math.ceil(cols)]
		addKeys({ gridCols: 'repeat(' + cols + ',auto)' }, styles);
		if (rows) styles.gridRows = 'repeat(' + rows + ',auto)';
		else styles.overy = 'auto';
	} else {
		copyKeys({ gridRows: rows, gridCols: cols }, styles);
	}
	let d = mDom(dParent, styles, opts);
	return d;
}

function set_card_border(item, thickness = 1, color = 'black', dasharray) {
	let d = iDiv(item);
	let rect = lastDescendantOfType('rect', d);
	if (rect) {
		rect.setAttribute('stroke-width', thickness);
		rect.setAttribute('stroke', color);
		if (isdef(dasharray)) rect.setAttribute('stroke-dasharray', dasharray);
	} else {
		mStyle(d, { border: `solid ${1}px ${color}` })
	}
}

function pollAndShow() {
	if (nundef(DA.pollStates)) return;
	DA.pollCounter++;
	if (DA.isProcessingMove) return;
	if (VERBOSE) console.log('polling...updating!', DA.pollCounter,);
	show_polling_signal('yellow');
	updateMain();
}
function pollAndShow() {
	if (nundef(DA.pollStates)) return;
	DA.pollCounter++;
	if (DA.isProcessingMove) return;
	if (VERBOSE) console.log('polling...updating!', DA.pollCounter,);
	//show_polling_signal('yellow');
	updateMain().then(uiUpdated => { if (uiUpdated) { show_polling_signal('green'); } else { show_polling_signal('lightgrey'); } });
}


function mLayout(dParent, rowlist, colt, rowt, styles = {}, opts = {}) {
	//console.log('mLayout', { dParent, rowlist, colt, rowt, styles, opts });
	dParent = toElem(dParent);
	mStyle(dParent, styles);
	rowlist = rowlist.map(x => x.replaceAll('@', valf(opts.suffix, ''))); //console.log(rowlist);
	rowt = rowt.replaceAll('@', valf(opts.hrow, 30));
	colt = colt.replaceAll('@', valf(opts.wcol, 30));
	console.log({ rowlist, colt, rowt });
	let areas = `${rowlist.join(" ")}`;
	console.log({ areas, colt, rowt });
	let newNames = mAreas(dParent, areas, colt, rowt);
	if (opts.registerDivs) {
		if (nundef(DA.divNames)) DA.divNames = [];
		DA.divNames = Array.from(new Set(DA.divNames.concat(newNames)));
	}
	if (opts.shade && nundef(styles.bgSrc)) { mShade(newNames, 2, 1); }
	return newNames.map(x => mBy(x));
}

function beautify_history(lines, title, fen, uplayer) {
	let html = `<div class="history"><span style="color:red;font-weight:bold;">${title}: </span>`;
	for (const l of lines) {
		let words = toWords(l);
		for (const w1 of words) {
			if (is_card_key(w1)) { html += mCardText(w1); continue; }
			w = w1.toLowerCase();
			if (isdef(fen.players[w])) {
				html += `<span style="color:${get_user_color(w)};font-weight:bold"> ${w} </span>`;
			} else html += ` ${w} `;
		}
		if (lines.length > 1) html = html.trim() + (l == arrLast(lines) ? '.' : ', ');
	}
	html += "</div>";
	return html;
}


function mistprocess_comm_setup() {
	//let [fen, A, uplayer, plorder, pl] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.pl];
	assertion(fen.keeppolling == true, "keeppolling must be true for process_comm_setup!!!");
	if (DA.hallo) {
		console.log('process_comm_setup:', Z.playerdata, Z.stage, uplayer, pl);
		return;
	}
	let items = A.selected.map(x => A.items[x]);
	let next = get_next_player(Z, uplayer);
	let receiver = next;
	let giver = uplayer;
	let keys = items.map(x => x.key);
	Z.state = { giver: giver, receiver: receiver, keys: keys };
	assertion(isdef(Z.playerdata), "Z.playerdata must be defined for process_comm_setup!!!");
	let data = firstCond(Z.playerdata, x => x.name == uplayer);
	assertion(isdef(data), `MISSING: playerdata for ${uplayer}`);
	data.state = Z.state;
	let can_resolve = check_resolve();
	if (can_resolve) {
		Z.turn = [Z.host];
		Z.stage = 104; //'next_comm_setup_stage';
		take_turn_fen_write();
	} else {
		if (Z.mode == 'hotseat') { Z.turn = [get_next_player(Z, uplayer)]; take_turn_fen_write(); }
		else take_turn_multi();
	}
}

function process_comm_setup() {
	let [fen, A, uplayer, plorder, pl] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.pl];
	assertion(fen.keeppolling == true, "keeppolling must be true for process_comm_setup!!!");
	if (DA.hallo) {
		console.log('process_comm_setup:', Z.playerdata, Z.stage, uplayer, pl);
		return;
	}
	let items = A.selected.map(x => A.items[x]);
	let next = get_next_player(Z, uplayer);
	let receiver = next;
	let giver = uplayer;
	let keys = items.map(x => x.key);
	Z.state = { giver: giver, receiver: receiver, keys: keys };
	assertion(isdef(Z.playerdata), "Z.playerdata must be defined for process_comm_setup!!!");
	let data = firstCond(Z.playerdata, x => x.name == uplayer);
	assertion(isdef(data), `MISSING: playerdata for ${uplayer}`);
	data.state = Z.state;
	let can_resolve = check_resolve();
	if (can_resolve) {
		Z.turn = [Z.host];
		Z.stage = 104; //'next_comm_setup_stage';
		take_turn_fen_write();
	} else {
		if (Z.mode == 'hotseat') { Z.turn = [get_next_player(Z, uplayer)]; take_turn_fen_write(); }
		else take_turn_multi();
	}
}

function modifyItemState(item, me, table, ui) {
	if (item.state === 'selectable') {
		item.state = 'selected';
	} else if (item.state === 'selected') {
		item.state = 'selectable';
	}
	showItemState(item, item.state);

}

function showItemState(item, state) {
	console.log('showItemState', item, state);
	showItemAsSelected(item, state == 'selected'); return;
	let d = item.o.div
	mStyle(d, {}, { className: state == 'selected' ? 'framedPicture' : 'selectable' });
}


function ari_present_rest() {


	let dParent = mBy('dMain');
	console.log('ari_present called!!!', dParent);
	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, me, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);
	if (fen.num_actions > 0 && (Z.role == 'active' || Z.mode == 'hotseat')) {
		mStyle(dOben, { hmin: 110 })
	}
	ari_stats(dRechts);
	show_history(fen, dRechts);
	let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', uiTypeCard52);
	let market = ui.market = ui_type_market(fen.market, dOpenTable, { maleft: 12 }, 'market', 'market', uiTypeCard52, true);
	let open_discard = ui.open_discard = ui_type_market(fen.open_discard, dOpenTable, { maleft: 12 }, 'open_discard', 'discard', uiTypeCard52);
	let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', uiTypeCard52);
	if (exp_commissions(table.options)) {
		let open_commissions = ui.open_commissions = ui_type_market(fen.open_commissions, dOpenTable, { maleft: 12 }, 'open_commissions', 'bank', uiTypeCard52);
		mMagnifyOnHoverControlPopup(ui.open_commissions.cardcontainer);
		let deck_commission = ui.deck_commission = ui_type_deck(fen.deck_commission, dOpenTable, { maleft: 4 }, 'deck_commission', '', uiTypeCard52);
		let comm = ui.commissioned = ui_type_rank_count(fen.commissioned, dOpenTable, {}, 'commissioned', 'sentiment', uiTypeCard52);
		if (comm.items.length > 0) { let isent = arrLast(comm.items); let dsent = iDiv(isent); set_card_border(dsent, 15, 'green'); }
	}
	if (exp_church(table.options)) {
		let church = ui.church = ui_type_church(fen.church, dOpenTable, { maleft: 28 }, 'church', 'church', uiTypeCard52);
	}
	if (exp_rumors(table.options)) {
		let deck_rumors = ui.deck_rumors = ui_type_deck(fen.deck_rumors, dOpenTable, { maleft: 25 }, 'deck_rumors', 'rumors', uiTypeCard52);
	}
	let uname_plays = fen.plorder.includes(Z.uname);
	let show_first = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	let order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 9, border: `2px ${get_user_color(plname)} solid` };
		let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));
		mFlexWrap(d);
		mLinebreak(d, 9);
		let hidden = compute_hidden(plname);
		ari_present_player(plname, d, hidden);
	}
	ari_show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname); delete Clientdata.handsorting;
	show_view_buildings_button(uplayer);
	let desc = ARI.stage[Z.stage];
	Z.isWaiting = false;
	if (isdef(fen.winners)) ari_reveal_all_buildings(fen);
	else if (desc == 'comm_weitergeben' && is_playerdata_set(uplayer)) {
		if ((Z.mode == 'hotseat' || Z.host == uplayer) && check_resolve()) {
			Z.turn = [Z.host];
			Z.stage = 104;
		}
		show_waiting_message(`waiting for other players...`);
		Z.isWaiting = true;
	}
}


function show_handsorting_buttons_for(plname, styles = {}) {
	if (Z.role == 'spectator' || isdef(mBy('dHandButtons'))) return;
	let fen = Z.fen;
	let pl = fen.players[plname];
	if (pl.hand.length <= 1) return;
	let d = UI.players[plname].hand.container; mStyle(d, { position: 'relative', wmin: 155 }); //,bg:'green' });
	addKeys({ position: 'absolute', left: 58, bottom: -8, height: 25 }, styles);
	let dHandButtons = mDiv(d, styles, 'dHandButtons');
	show_player_button('rank', dHandButtons, onclick_by_rank);
	show_player_button('suit', dHandButtons, onclick_by_suit);
}

function ari_show_handsorting_buttons_for(pl, ui) {
	// // if (Z.role == 'spectator' || isdef(mBy('dHandButtons'))) return;
	// let fen = Z.fen;
	// let pl = fen.players[plname];
	//console.log(ui)
	if (pl.hand.length <= 1) return;
	//console.log('pl',pl,'hand', pl.hand);
	let d = ui.players[pl.name].hand.container; mStyle(d, { position: 'relative' });
	//let dHandButtons = mDom(d, { display:'flex',wmin:100,bg:'red',position: 'absolute', bottom: -30, left: 0, height: 25 }, {id:'dHandButtons'});
	//console.log(dHandButtons)
	show_player_button('rank', dHandButtons, () => onclickSortCards(ui.players[pl.name].hand, null, 'A23456789TJQK'));
	show_player_button('suit', dHandButtons, () => onclickSortCards(ui.players[pl.name].hand, 'CDSH', 'A23456789TJQK'));
}

function _ui_type_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let items = list.map(x => get_card_func(x));
	let cardcont = mDom(cont);
	let card = isEmpty(items) ? { w: 1, h: M.config.ui.card.h, ov: 0 } : items[0];
	let splay = 2;
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

function _ui_type_deck(list, dParent, styles = {}, path = 'deck', title = 'deck', get_card_func = uiTypeCard52, show_if_empty = false) {
	//console.log('ui_type_deck', list, dParent, styles, path, title, get_card_func, show_if_empty)
	let cont = mDom(dParent);
	// clearElement(cardcont); arrClear(items); if (isEmpty(list)) return;
	// let n = Math.min(2, list.length);
	let ct = get_card_func(list[0]);
	//console.log('ct', ct )

	items.push(ct);
	if (n > 1) { let cb = get_card_func(arrLast(list)); items.push(cb); }
	mStyle(cardcont, { position: 'relative', wmin: ct.w + 8, hmin: ct.h });
	for (let i = items.length - 1; i >= 0; i--) {
		//console.log('i', i, 'item', items[i])
		let x = items[i]; face_down(x); mAppend(cardcont, iDiv(x)); mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 })
	}
	// mText(list.length, iDiv(ct), { position: 'absolute', left: list.length >= 100 ? '10%' : '25%', top: 10, fz: ct.h / 3 }); //add number of cards in deck to top card
	mDom(iDiv(ct), { fz: ct.h / 3, matop: -10 }, { className: 'centerCentered', html: list.length }); //add number of cards in deck to top card

	function muell() {
		let cont = ui_make_container(dParent, get_container_styles(styles));
		let cardcont = mDom(cont);
		let items = [];
		ensure_ui(list, cardcont, items, get_card_func);
		//ui_add_container_title(title, cont, items, show_if_empty);
		mStyle(cardcont, { h: 0 })
		mLinebreak(cont);
		mDom(cont, { h: 0, fg: 'black', fz: 12, align: 'center' }, { html: `${title}` });
		mStyle(cont, { h: 'auto', hmin: 0, bg: 'yellow', display: 'flex', dir: 'column', align: 'center' });
	}




	function get_topcard() { return isEmpty(list) ? null : items[0]; }
	function get_bottomcard() { return isEmpty(list) ? null : arrLast(items); }
	function ensure_ui(list, cardcont, items, get_card_func = uiTypeCard52) {
		clearElement(cardcont); arrClear(items); if (isEmpty(list)) return;
		let n = Math.min(2, list.length);
		let ct = get_card_func(list[0]);
		//console.log('ct', ct )
		items.push(ct);
		if (n > 1) { let cb = get_card_func(arrLast(list)); items.push(cb); }
		mStyle(cardcont, { position: 'relative', wmin: ct.w + 8, hmin: ct.h });
		for (let i = items.length - 1; i >= 0; i--) {
			//console.log('i', i, 'item', items[i])
			let x = items[i]; face_down(x); mAppend(cardcont, iDiv(x)); mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 })
		}
		// mText(list.length, iDiv(ct), { position: 'absolute', left: list.length >= 100 ? '10%' : '25%', top: 10, fz: ct.h / 3 }); //add number of cards in deck to top card
		mDom(iDiv(ct), { fz: ct.h / 3, matop: -10 }, { className: 'centerCentered', html: list.length }); //add number of cards in deck to top card
	}
	return {
		ctype: 'deck',
		container: cont,
		cardcontainer: cardcont,
		items: items,
		list: list,
		title: title,
		path: path,
		func: get_card_func,
		get_topcard: get_topcard,
		get_bottomcard: get_bottomcard,
		get_card_func: get_card_func,
		renew: ensure_ui,
	};
}

function ui_add_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let st = get_containertitle_styles();
		let stmeasure = jsCopy(st); delete stmeasure.position;
		let elem = mText(title, cont, stmeasure);
		let sz = getSizeNeeded(elem);
		let offsetx = valf(st.left, 0);
		let cont_wmin = mGetStyle(cont, 'wmin');
		let my_min = sz.w + offsetx * 1.5;
		let wmin = !isNumber(cont_wmin) ? my_min : Math.max(valf(cont_wmin, 0), my_min);
		mStyle(cont, { wmin: wmin });
		mStyle(elem, st);
		// mStyle(elem,{w100:true,maleft:0,bg:'yellow'})
	}
}

function _ari_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent); //fen.plorder.map(x => fen.players[x]));
	let fen = Z.fen;
	let herald = fen.heraldorder[0];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (plname == herald) {
			mSym('tied-scroll', d, { fg: 'gold', fz: 24, padding: 4 }, 'TR');
		}
		if (exp_church(Z.options)) {
			if (isdef(pl.tithes)) {
				player_stat_count('cross', pl.tithes.val, d);
			}
		}
		let dCoin = player_stat_count('coin', pl.coins, d);
		item.dCoin = dCoin.firstChild;
		item.dAmount = dCoin.children[1];
		let list = pl.hand.concat(pl.stall);
		let list_luxury = list.filter(x => x[2] == 'l');
		player_stat_count('pinching hand', list.length, d);
		let d1 = player_stat_count('hand-holding-usd', list_luxury.length, d);
		mStyle(d1.firstChild, { fg: 'gold', fz: 20 })
		if (!isEmpty(fen.players[plname].stall) && fen.stage >= 5 && fen.stage <= 6) {
			player_stat_count('shinto shrine', !fen.actionsCompleted.includes(plname) || fen.stage < 6 ? calc_stall_value(fen, plname) : '_', d);
		}
		player_stat_count('star', plname == U.name || isdef(fen.winners) ? ari_calc_real_vps(fen, plname) : ari_calc_fictive_vps(fen, plname), d);
		if (fen.turn.includes(plname)) {
			show_hourglass(plname, d, 30, { left: -3, top: 0 }); //'calc( 50% - 36px )' });
		}
	}
}

function _ari_present(dParent) {
	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, Z.uplayer, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);
	if (fen.num_actions > 0 && (Z.role == 'active' || Z.mode == 'hotseat')) {
		mStyle(dOben, { hmin: 110 })
	}
	ari_stats(dRechts);
	show_history(fen, dRechts);
	let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', ari_get_card);
	let market = ui.market = ui_type_market(fen.market, dOpenTable, { maleft: 12 }, 'market', 'market', ari_get_card, true);
	let open_discard = ui.open_discard = ui_type_market(fen.open_discard, dOpenTable, { maleft: 12 }, 'open_discard', 'discard', ari_get_card);
	let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', ari_get_card);
	if (exp_commissions(Z.options)) {
		let open_commissions = ui.open_commissions = ui_type_market(fen.open_commissions, dOpenTable, { maleft: 12 }, 'open_commissions', 'bank', ari_get_card);
		mMagnifyOnHoverControlPopup(ui.open_commissions.cardcontainer);
		let deck_commission = ui.deck_commission = ui_type_deck(fen.deck_commission, dOpenTable, { maleft: 4 }, 'deck_commission', '', ari_get_card);
		let comm = ui.commissioned = ui_type_rank_count(fen.commissioned, dOpenTable, {}, 'commissioned', 'sentiment', ari_get_card);
		if (comm.items.length > 0) { let isent = arrLast(comm.items); let dsent = iDiv(isent); set_card_border(dsent, 15, 'green'); }
	}
	if (exp_church(Z.options)) {
		let church = ui.church = ui_type_church(fen.church, dOpenTable, { maleft: 28 }, 'church', 'church', ari_get_card);
	}
	if (exp_rumors(Z.options)) {
		let deck_rumors = ui.deck_rumors = ui_type_deck(fen.deck_rumors, dOpenTable, { maleft: 25 }, 'deck_rumors', 'rumors', ari_get_card);
	}
	let uname_plays = fen.plorder.includes(Z.uname);
	let show_first = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	let order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 9, border: `2px ${get_user_color(plname)} solid` };
		let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));
		mFlexWrap(d);
		mLinebreak(d, 9);
		let hidden = compute_hidden(plname);
		ari_present_player(plname, d, hidden);
	}
	ari_show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname); delete Clientdata.handsorting;
	show_view_buildings_button(uplayer);
	let desc = ARI.stage[Z.stage];
	Z.isWaiting = false;
	if (isdef(fen.winners)) ari_reveal_all_buildings(fen);
	else if (desc == 'comm_weitergeben' && is_playerdata_set(uplayer)) {
		if ((Z.mode == 'hotseat' || Z.host == uplayer) && check_resolve()) {
			Z.turn = [Z.host];
			Z.stage = 104; //'next_comm_setup_stage';
		}
		show_waiting_message(`waiting for other players...`);
		Z.isWaiting = true;
	}
}
function uiTypeCard52(ckey, bg = 'green', h = 100, ov = .25) {
	let w = h * 0.7;
	let html = M.c52['card_' + ckey.slice(0, 2)];
	//html = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" face="2C" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%"><symbol id="SC2" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMinYMid"><path d="M30 150C35 385 85 400 130 500L-130 500C-85 400 -35 385 -30 150A10 10 0 0 0 -50 150A210 210 0 1 1 -124 -51A10 10 0 0 0 -110 -65A230 230 0 1 1 110 -65A10 10 0 0 0 124 -51A210 210 0 1 1 50 150A10 10 0 0 0 30 150Z" fill="black"></path></symbol><symbol id="VC2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid"><path d="M-225 -225C-245 -265 -200 -460 0 -460C 200 -460 225 -325 225 -225C225 -25 -225 160 -225 460L225 460L225 300" stroke="black" stroke-width="80" stroke-linecap="square" stroke-miterlimit="1.5" fill="none"></path></symbol><rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect><use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use><use xlink:href="#SC2" height="26.769" x="-111.784" y="-119"></use><use xlink:href="#SC2" height="70" x="-35" y="-135.588"></use><g transform="rotate(180)"><use xlink:href="#VC2" height="32" x="-114.4" y="-156"></use><use xlink:href="#SC2" height="26.769" x="-111.784" y="-119"></use><use xlink:href="#SC2" height="70" x="-35" y="-135.588"></use></g></svg>`
	//html = html.replace('class="card"','');
	html = html.replace(/class=["']card["']\s?/, '');
	html = html.replace('fill="white" stroke="black"', `fill="${bg}" stroke="black"`);
	console.log('html', html);

	let div = mDom(null, { h, w, bg }, { html });
	let res = { key: ckey, w, h, faceUp: true, div, bg };
	if (isdef(ov)) res.ov = ov;
	return res;
}

function _ui_player_info(dParent, outerStyles = { dir: 'column' }, innerStyles = {}) {
	let fen = Z.fen;
	if (nundef(outerStyles.display)) outerStyles.display = 'flex';
	mStyle(dParent, outerStyles);
	let items = {};
	let styles = jsCopy(innerStyles); addKeys({ rounding: 10, bg: '#00000050', margin: 4, padding: 4, patop: 12, box: true, 'border-style': 'solid', 'border-width': 6 }, styles);
	let order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let uname = pl.name;
		let imgPath = `../base/assets/images/${uname}.jpg`;
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
		items[uname] = item;
	}
	if (DA.SIMSIM || is_advanced_user()) activate_playerstats(items)
	return items;
}


function mBy(id) { return document.getElementById(id); }

function mClear(d) { clearElement(d); }
function _staticTitle() {
	clearInterval(TO.titleInterval);
	let url = window.location.href;
	let loc = url.includes('telecave') ? 'telecave' : 'local';
	let game = isdef(Z) ? stringAfter(Z.friendly, 'of ') : '♠ GAMES ♠';
	document.title = `(${loc}) ${game}`;
}

function _mRemove(elem) {
	elem = toElem(elem);
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
	elem.remove(); //elem.parentNode.removeChild(elem);
}
function mRemove(elem) {
	elem = toElem(elem);
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



//#region jsyaml
function jsonToYaml(o) { let y = jsyaml.dump(o); return y; }
function load_assets(obj) {
	Config = jsyaml.load(obj.config);
	Syms = jsyaml.load(obj.syms);
	SymKeys = Object.keys(Syms);
	ByGroupSubgroup = jsyaml.load(obj.symGSG);
	C52 = jsyaml.load(obj.c52);
	Cinno = jsyaml.load(obj.cinno);
	Info = jsyaml.load(obj.info);
	Sayings = jsyaml.load(obj.sayings);
	create_card_assets_c52();
	KeySets = getKeySets();
	assertion(isdef(Config), 'NO Config!!!!!!!!!!!!!!!!!!!!!!!!');
}




//#endregion


function show_home_logo() {
	let bg = colorLight();
	let dParent = mBy('dAdminLeft');
	clearElement(dParent);
	let d = miPic('castle', dParent, { cursor: 'pointer', fz: 24, padding: 6, h: 36, box: true, margin: 2 }); //, bg: bg, rounding: '50%' });
	d.onclick = onclick_home;
	let version = 'v0.0.1';
	let html = `version ${version}`
	mText(html, dParent, { fz: 12 });
}
function _mAreas(dParent, areas, gridCols, gridRows) {
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
function _NO_toWords(s) {
	let arr = s.split(/(?:,|\s|!)+/);
	return arr.filter(x => !isEmpty(x));
}
function _NO_toWords(s) {
	let arr = s.split(/(?:,|\s|!)+/);
	return arr.filter(x => !isEmpty(x));
}
function _mStyle(elem, styles, unit = 'px') {
	elem = toElem(elem);
	if (isdef(styles.vmargin)) { styles.mabottom = styles.matop = styles.vmargin; }
	if (isdef(styles.hmargin)) { styles.maleft = styles.maright = styles.hmargin; }
	let bg, fg;
	if (isdef(styles.bg) || isdef(styles.fg)) {
		[bg, fg] = colorsFromBFA(styles.bg, styles.fg, styles.alpha);
	}
	if (isdef(styles.vpadding) || isdef(styles.hpadding)) {
		styles.padding = valf(styles.vpadding, 0) + unit + ' ' + valf(styles.hpadding, 0) + unit;
	}
	if (isdef(styles.upperRounding)) {
		let rtop = '' + valf(styles.upperRounding, 0) + unit;
		let rbot = '0' + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	} else if (isdef(styles.lowerRounding)) {
		let rbot = '' + valf(styles.lowerRounding, 0) + unit;
		let rtop = '0' + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	}
	if (isdef(styles.box)) styles['box-sizing'] = 'border-box';
	for (const k in styles) {
		let val = styles[k];
		let key = k;
		if (isdef(STYLE_PARAMS[k])) key = STYLE_PARAMS[k];
		else if (k == 'font' && !isString(val)) {
			let fz = f.size; if (isNumber(fz)) fz = '' + fz + 'px';
			let ff = f.family;
			let fv = f.variant;
			let fw = isdef(f.bold) ? 'bold' : isdef(f.light) ? 'light' : f.weight;
			let fs = isdef(f.italic) ? 'italic' : f.style;
			if (nundef(fz) || nundef(ff)) return null;
			let s = fz + ' ' + ff;
			if (isdef(fw)) s = fw + ' ' + s;
			if (isdef(fv)) s = fv + ' ' + s;
			if (isdef(fs)) s = fs + ' ' + s;
			elem.style.setProperty(k, s);
			continue;
		} else if (k == 'classname') {
			mClass(elem, styles[k]);
		} else if (k == 'border') {
			if (isNumber(val)) val = `solid ${val}px ${isdef(styles.fg) ? styles.fg : '#ffffff80'}`;
			if (val.indexOf(' ') < 0) val = 'solid 1px ' + val;
		} else if (k == 'layout') {
			if (val[0] == 'f') {
				val = val.slice(1);
				elem.style.setProperty('display', 'flex');
				elem.style.setProperty('flex-wrap', 'wrap');
				let hor, vert;
				if (val.length == 1) hor = vert = 'center';
				else {
					let di = { c: 'center', s: 'start', e: 'end' };
					hor = di[val[1]];
					vert = di[val[2]];
				}
				let justStyle = val[0] == 'v' ? vert : hor;
				let alignStyle = val[0] == 'v' ? hor : vert;
				elem.style.setProperty('justify-content', justStyle);
				elem.style.setProperty('align-items', alignStyle);
				switch (val[0]) {
					case 'v': elem.style.setProperty('flex-direction', 'column'); break;
					case 'h': elem.style.setProperty('flex-direction', 'row'); break;
				}
			} else if (val[0] == 'g') {
				val = val.slice(1);
				elem.style.setProperty('display', 'grid');
				let n = allNumbers(val);
				let cols = n[0];
				let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
				elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
				elem.style.setProperty('place-content', 'center');
			}
		} else if (k == 'layflex') {
			elem.style.setProperty('display', 'flex');
			elem.style.setProperty('flex', '0 1 auto');
			elem.style.setProperty('flex-wrap', 'wrap');
			if (val == 'v') { elem.style.setProperty('writing-mode', 'vertical-lr'); }
		} else if (k == 'laygrid') {
			elem.style.setProperty('display', 'grid');
			let n = allNumbers(val);
			let cols = n[0];
			let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
			elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
			elem.style.setProperty('place-content', 'center');
		}
		if (key == 'font-weight') { elem.style.setProperty(key, val); continue; }
		else if (key == 'background-color') elem.style.background = bg;
		else if (key == 'color') elem.style.color = fg;
		else if (key == 'opacity') elem.style.opacity = val;
		else if (key == 'wrap') elem.style.flexWrap = 'wrap';
		else if (startsWith(k, 'dir')) {
			isCol = val[0] == 'c';
			elem.style.setProperty('flex-direction', 'column');
		} else if (key == 'flex') {
			if (isNumber(val)) val = '' + val + ' 1 0%';
			elem.style.setProperty(key, makeUnitString(val, unit));
		} else {
			elem.style.setProperty(key, makeUnitString(val, unit));
		}
	}
}

function onclick_logout() {
	mFadeClearShow('dMenuRight', 300);
	mClear('dMenuMiddle');
	stopgame();
	clear_screen();
	U = null;
	show_users();
}
function start_with_assets(reload = false) {
	DA.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; if (DA.isFirefox) console.log('using Firefox!')
	show_home_logo();
	if (nundef(U)) { show_users(); return; }
	show_username(reload);
	if (DA.TEST0 || DA.showTestButtons) show('dTestButtons');
}

function show_username(uname, d) {
	U = M.users[uname];

	mClear(d);
	let db = mDom(d, {}, { tag: 'a', id: 'aLogout', href: 'javascript:onclick_logout()', html: 'logout' });

	let dpic = get_user_pic(uname, 30);
	//mAppend(d, get_logout_button());
	mAppend(d, dpic);
	return;

	//get tables
	if (is_advanced_user()) { show('dAdvanced1'); } else { hide('dAdvanced'); hide('dAdvanced1'); }
	if (!TESTING && !DA.running) {
		if (!loadTable) mPhpPost({ app: 'easy' }, 'tables');
		else if (!isEmpty(Serverdata.tables)) {
			onclick_table(Serverdata.tables[0].friendly);
		}
	}
}
function initUIOld() {
	let d = mBy('dPage');
	let dAdmin = mDom(d, { padding: 10 }, { id: 'dAdmin' });
	let dAdminLeft = mDom(dAdmin, { display: 'flex', justify: 'space-evenly', align: 'center' }, { id: 'dAdminLeft' });

	let logo = mKey('castle', dAdminLeft, { cursor: 'pointer', fz: 24, box: true, onclick: onclick_home });

	let dAdminMiddle = mDom(dAdmin, {}, { id: 'dAdminMiddle' });
	let dAdminRight = mDom(dAdmin, { display: 'flex', justify: 'space-evenly', align: 'center', box: true, padding: 10 }, { id: 'dAdminRight' });
	let dTest = mDom(d, { display: 'flex', bg: 'silver', padding: 4, gap: 4, position: 'relative' }, { id: 'dTest' });
	mDom(dTest, {}, { tag: 'button', onclick: onclick_home, html: 'home' });
	mDom(dTest, {}, { tag: 'button', onclick: onclick_reload, html: 'reload' });
	return;
	let html = `
			<div id="dTexture">
				<div id="dMMM" style="position: absolute; background: red; color: yellow; width: 100%; text-align: center"></div>
				<div id="dTitle"
					style="display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; height: 42px; width: 100%">
					<div id="dTitleLeft"
						style="display: flex; justify-content: space-evenly; align-items: center; padding-left: 10px"></div>
					<div id="dTitleMiddle"></div>
					<div id="dTitleRight"
						style="min-width: 200px; display: flex; justify-content: end; align-items: center; box-sizing: border-box">
					</div>
				</div>
				<div id="dScreen">
					<!-- <div id="dInstruction" style="box-sizing: border-box; background: #00000040; color: white; width: 100%"></div> -->
					<div id="dMessage" class="section"></div>
					<div id="dUsers" class="mCenterFlex pad"></div>
					<div id="dTable"></div>
					<div id="dTables" class="section"></div>
					<div id="dGames" class="section"></div>
					<div id="dMenu" class="section"></div>
					<div id="dPadding" style="height: 20px"></div>
				</div>
			</div>
		`;
	mBy('dPage').innerHTML = html;
}
function mShrinkTranslate(child, scale, newParent, ms = 800, callback) {
	let [dx, dy] = get_screen_distance(child, newParent);
	console.log('mShrinkTranslate', { dx, dy, scale });
	mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px) scale(${scale})`], callback, ms, 'ease');
}
function get_screen_distance(child, newParent) {
	child = toElem(child);
	newParent = toElem(newParent);
	const parentOriginal = child.parentNode;
	let children = arrChildren(parentOriginal);
	let iChild = children.indexOf(child);
	let sibling = iChild == children.length - 1 ? null : children[iChild + 1];
	const x0 = child.getBoundingClientRect().left;
	const y0 = child.getBoundingClientRect().top;
	newParent.appendChild(child);
	const x1 = child.getBoundingClientRect().left;
	const y1 = child.getBoundingClientRect().top;
	if (sibling) parentOriginal.insertBefore(child, sibling); else parentOriginal.appendChild(child);
	return [x1 - x0, y1 - y0];
}
function get_screen_distance(child, newParent) {
	child = toElem(child);
	newParent = toElem(newParent);
	console.log('get_screen_distance', { child, newParent });
	let rChild = getBoundingClientRect(child);
	let rNewParent = getBoundingClientRect(newParent);
	return [100 + rNewParent.left - rChild.left, rNewParent.top - rChild.top];
}

function aimuellTranslate() {
	showUser(dParent, name, (ev) => {
		const img = ev.target; //popupImg;
		const target = mBy('dMenuRight'); //document.getElementById('target');

		const imgRect = img.getBoundingClientRect();
		const targetRect = target.getBoundingClientRect();

		// clone image
		const clone = img.cloneNode(true);
		// document.body.appendChild(clone);

		// place clone exactly over original
		Object.assign(clone.style, {
			position: 'fixed',
			left: imgRect.left + 'px',
			top: imgRect.top + 'px',
			width: imgRect.width + 'px',
			height: imgRect.height + 'px',
			margin: 0,
			zIndex: 9999,
			transition: 'transform 600ms ease, opacity 600ms ease',
			transformOrigin: 'top left'
		});

		// force layout so transition works
		clone.getBoundingClientRect();

		// compute movement
		const dx = targetRect.left - imgRect.left;
		const dy = targetRect.top - imgRect.top;
		const scale = targetRect.width / imgRect.width;

		// animate
		clone.style.transform = `translate(${dx}px, ${dy}px) scale(${scale}) `;
		clone.style.opacity = '0.2';

		// cleanup
		clone.addEventListener('transitionend', () => clone.remove(), { once: true });
	});

}


function showMessage(msg, ms = 3000, callback = null) {
	clearTimeout(TO.message);
	let d = mPopup('dMain', { left: 10, top: 10, transform: 'unset' }, { id: 'dMessage' });
	d.innerHTML = msg;
	if (ms > 0) TO.message = setTimeout(() => { clearMessage(true); if (callback) callback(); }, ms)
}

function initUI() {
	mClear('dPage');
	mLayoutTM('dPage', {}, { wcol: 0, registerDivs: true, shade: false });
	let d = mBy('dTop'); mStyle(d, { box: true });
	mStyle('dMain', { box: true, overy: 'scroll' });
	for (const id1 of ['dMenu', 'dTest', 'dHidden', 'dExtra', 'dMessage']) {
		mDom(d, { display: 'flex', justifyContent: 'space-between', box: true }, { id: id1 });
		for (const id2 of ['Left', 'Middle', 'Right']) {
			let id = id1 + id2;
			mDom(id1, { align: 'center', box: true }, { id });
		}
	}
	mStyle('dMenuLeft', { padding: '5px 10px', box: true }, { className: 'button_container' });
	mStyle('dMenuRight', { padding: '5px 10px', box: true }, { className: 'button_container' });
	d = mBy('dMenuLeft'); //mClass(d, 'button_container'); //mFlex(d); // mStyle(d, { display: 'flex', vStretch: true, gap: 10, padding: 4, box: true }); //, box:true, vStretch:true, hCenter: true, padding: 10, gap: 10 }) //mClass(d,'flex')
	if (TESTING || DEV) faButton(d, DEV ? 'angles_up' : 'angles_down', {}, { onclick: toggleDevmode });
	let bstyle = {};
	mDom(d, bstyle, { tag: 'button', html: 'Games', onclick: switchToMenu, menu: 'top', key: 'games' });
	mDom(d, bstyle, { tag: 'button', html: 'Table', onclick: switchToMenu, menu: 'top', key: 'table' });
	mDom(d, bstyle, { tag: 'button', html: 'Settings', onclick: switchToMenu, menu: 'top', key: 'settings' });
	if (TESTING || DEV) {
		let d = mBy('dTestRight'); mClass(d, 'button_container'); //mFlex(d);
		let names = ['gul', 'amanda', 'felix', 'lauren', 'mimi'];
		for (const name of names) {
			let b = mDom(d, {}, { tag: 'button', html: name, onclick: async (ev) => await switchToUser(name) });
		}
		d = mBy('dTestLeft');
		mClass(d, 'button_container');
		mDom(d, {}, { tag: 'button', html: 'delete all', onclick: tablesDeleteAll });
		let key = 'arrow_rotate_right';
		let b = mKey(key, d, { fz: 22, }, { tag: 'button', onclick: onclickReload });
	}
}
async function switchToUser(username) {
	pollOff();
	if (!isEmpty(username)) username = normalizeString(username);
	if (isEmpty(username)) username = localStorage.getItem('username') || 'guest';
	M.users = await loadStaticYaml('y/users.yaml');
	let userdata = MGetUser(username);
	if (!userdata) {
		let imgKey = isdef(M.superdi[username]) ? username : 'unknown_user';
		let color = colorFrom(rChoose(M.colorNames));
		let name = username;
		M.users[username] = userdata = { name, color, imgKey };
		console.log('new user created', userdata);
		console.log('M.users', M.users);
		await postUsers();
	}
	U = userdata;
	DA.tid = localStorage.getItem('tid');
	showUserNameInCorner(U.color, U.fg);
	localStorage.setItem('username', username);
	setTheme(U);
	updateUI();
}

function initUIOld() {
	let html = `
			<div id="dAdmin">
				<div id="dAdminLeft"
					style="display: flex; justify-content: space-evenly; align-items: center; padding-left: 10px"></div>
				<div id="dAdminMiddle"></div>
				<div id="dAdminRight"
					style="display: flex; justify-content: space-evenly; align-items: center; box-sizing: border-box"></div>
			</div>
			<div id="dTakeover" style="background: silver; padding: 3px; position: relative"></div>
			<div id="dTest" style="background: silver; padding: 3px; position: relative">
				<button onclick="onclick_home()">home</button>
				<button onclick="onclick_reload()">reload</button>
				<button onclick="onclick_restart_move()" id="bRestartMove" style="display: none">RESTART MOVE</button>
				<button id="bExperience" onclick="onclick_experience()" class="selectable_button"
					style="display: none">BRIBE!</button>
				&nbsp;&nbsp;&nbsp;
				<span id="dAdvanced1" style="display: none">
					<button onclick="onclick_reset_all()">delete tables</button>
				</span>
				<span id="dHostButtons" style="display: none">
					<button id="bSpotitStart" onclick="onclick_start_spotit()">spotit start</button>
					<button onclick="onclick_restart()">RESTART</button>
					<button id="bSkipPlayer" onclick="onclick_skip()">SKIP</button>
					&nbsp;&nbsp;&nbsp;
					<button id="bClearAck" onclick="onclick_ack()">CLEAR ACK</button>
					&nbsp;
				</span>
				<span id="dTestButtons" style="display: none">
					<button onclick="fentest7_cards()">TEST</button>
					<button onclick="fentest6_start4()">4!</button>
					<button onclick="fentest6_start5()">5</button>
					<button onclick="fentest6_start6()">6</button>
					<button onclick="fentest6_start8()">8</button>
					<button onclick="fentest6_start11()">11</button>
					<button onclick="fentest6_start14()">14</button>
					<button onclick="onclick_skip_membership_selection()">alliance</button>
					<button onclick="onclick_vote_empty()">vote empty</button>
					<button onclick="onclick_vote_president()">vote president</button>
					<button onclick="onclick_vote_random()">vote random</button>
					<button onclick="onclick_vote_red()">vote red</button>
					<button onclick="onclick_vote_1()">vote 1</button>

					<!-- <button onclick="test_start_aristo(3)">TEST ARISTO</button> -->
					<!-- <button onclick="test_start_aristo(2)">TEST ARISTO 2</button> -->
					<!-- <button onclick="test_start_ferro()">TEST FERRO</button> -->
					<!-- <button onclick="test_start_ferro('hotseat')">TEST FERRO HOTSEAT</button> -->
					<!-- <button onclick="test_start_ferro('solo')">TEST FERRO SOLO</button> -->
				</span>
				&nbsp;&nbsp;&nbsp;
				<button id="bRandomMove" onclick="onclick_random()" style="display: none">random</button>
				<button id="dummy" class="dummy">dummy</button>
				<div id="dAdvanced" style="display: none">
					<button onclick="onclick_restart()">RESTART</button>
					<button onclick="onclick_stoppolling()">stop polling</button>
					<button onclick="onclick_startpolling()">start polling</button>
					<button onclick="onclick_reset_all()">delete tables</button>
					<button onclick="test7_add_hand_card()">add card</button>
					<button onclick="onclick_remove_host()">remove host</button>
					<button onclick="onclick_ack()">CLEAR ACK</button>
					<button onclick="onclick_random()">random</button>
					<br />
					unit tests:
					<button onclick="fentest0_min_items()">min items</button>
					<button onclick="fentest1_auction()">auction</button>
					<button onclick="fentest2_build()">build</button>
					<button onclick="fentest4_visit()">visit</button>
					<button onclick="fentest5_market_opens()">pop</button>
					<button onclick="fentest6_endgame()">endgame</button>
					<button onclick="fentest7_gameover()">GAMEOVER</button>
					<button onclick="onclick_tithe_all()">tithe</button>
				</div>
				<div id="dTablename" style="float: right; font-family: algerian; margin-right: 5px"></div>
			</div>
			<div id="dTexture">
				<div id="dMMM" style="position: absolute; background: red; color: yellow; width: 100%; text-align: center"></div>
				<div id="dTitle"
					style="display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; height: 42px; width: 100%">
					<div id="dTitleLeft"
						style="display: flex; justify-content: space-evenly; align-items: center; padding-left: 10px"></div>
					<div id="dTitleMiddle"></div>
					<div id="dTitleRight"
						style="min-width: 200px; display: flex; justify-content: end; align-items: center; box-sizing: border-box">
					</div>
				</div>
				<div id="dScreen">
					<!-- <div id="dInstruction" style="box-sizing: border-box; background: #00000040; color: white; width: 100%"></div> -->
					<div id="dMessage" class="section"></div>
					<div id="dUsers" class="mCenterFlex pad"></div>
					<div id="dTable"></div>
					<div id="dTables" class="section"></div>
					<div id="dGames" class="section"></div>
					<div id="dMenu" class="section"></div>
					<div id="dPadding" style="height: 20px"></div>
				</div>
			</div>
		`;
	mBy('dPage').innerHTML = html;
}
function face_down(item, color, texture) {
	if (!item.faceUp) return;
	if (isdef(texture) || lookup(item, ['live', 'dCover'])) {
		face_down_alt(item, color, texture);
	} else {
		let svgCode = M.c52.card_2B; //C52 is cached asset loaded in _start
		svgCode = `
			<svg width="200" height="300" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
				<rect width="200" height="300" rx="15" fill="#2c3e50" />
				<defs>
					<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
						<path d="M 10 0 L 20 10 L 10 20 L 0 10 Z" fill="none" stroke="#34495e" stroke-width="1"/>
					</pattern>
				</defs>
				<rect x="10" y="10" width="180" height="280" rx="10" fill="url(#grid)" stroke="#ecf0f1" stroke-width="2"/>
			</svg>
			`;

		svgCode = `<svg xmlns="http://www.w3.org/2000/svg" class="card" face="2B" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
  <rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
  
  <rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="#b01b1b"></rect>
  
  <defs>
    <pattern id="backPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M10 0 L20 10 L10 20 L0 10 Z" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    </pattern>
  </defs>
  
  <rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="url(#backPattern)"></rect>
  
  <path d="M-30,0 L0,-40 L30,0 L0,40 Z M-20,0 L0,-25 L20,0 L0,25 Z" 
        fill="white" opacity="0.8" transform="scale(1.5)" />
</svg>`;

		svgCode = `<svg xmlns="http://www.w3.org/2000/svg" class="card" face="2B" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
  <rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
  
  <rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="#b01b1b"></rect>
  
  <defs>
    <pattern id="backPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    </pattern>
  </defs>
  
  <rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="url(#backPattern)"></rect>
</svg>`;
		svgCode = `<svg xmlns="http://www.w3.org/2000/svg" class="card" face="2B" height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
  <rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
  
  <rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="#b01b1b" fill-opacity="0.5"></rect>
  
  <defs>
    <pattern id="backPatternLarge" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <path d="M15 0 L30 15 L15 30 L0 15 Z" fill="none" stroke="white" stroke-width="2" stroke-opacity=".8"/>
    </pattern>
  </defs>
  
  <rect width="216.095" height="313.967" x="-108.047" y="-156.983" fill="url(#backPatternLarge)"></rect>
</svg>`
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
		let t = get_texture(texture_name);
		dCover.style.backgroundImage = t;
		dCover.style.backgroundRepeat = 'repeat';
	} else mStyle(dCover, { display: 'block' });
}

function reload() {
	console.log('reload!!!')
	if (radio_contacts.checked == true) get_contacts();
	else if (radio_chat.checked == true) get_chats();
	else if (radio_games.checked == true) get_games();
	else if (radio_play.checked == true) get_play();
}
function statsREST(table) {
	let style = { patop: 8, mabottom: 12, bg: 'beige', fg: 'contrast' };
	let player_stat_items = uiTypePlayerStats(table, me, 'dStats', 'rowflex', style);
	for (const plname in players) {
		let pl = players[plname];
		let item = player_stat_items[plname];
		if (pl.playmode == 'bot') { mStyle(item.img, { rounding: 0 }); }
		let d = iDiv(item);
		mLinebreak(d);
		mStyle(d, { wmax: 100, w: 90, box: true });
		statsCount('star', pl.score, d);
	}
}


