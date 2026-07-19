// ═══════════════════════════════════════════════════════════════════════════════
// DOM HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function el(tag, styles, attrs, ...children) {
	const e = document.createElement(tag);
	if (styles) Object.assign(e.style, styles);
	if (attrs) Object.entries(attrs).forEach(([k, v]) => {
		if (k.startsWith("on")) e.addEventListener(k.slice(2).toLowerCase(), v);
		else if (k === "className") e.className = v;
		else e.setAttribute(k, v);
	});
	children.flat().forEach(c => {
		if (c == null) return;
		e.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(c) : c);
	});
	return e;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESENTATION LAYER
// ═══════════════════════════════════════════════════════════════════════════════

function renderStatus(table) {
	const { status, winner, turn } = table;
	let msg, color;
	if (status === "won") { msg = `${winner} wins!`; color = "var(--text-success)"; }
	else if (status === "draw") { msg = "Draw — no winner"; color = "var(--text-secondary)"; }
	else { msg = `${turn?.[0]}'s turn`; color = "var(--text-accent)"; }
	return el("div", { fontSize: "15px", fontWeight: 500, color, letterSpacing: "0.3px" }, null, msg);
}

function renderPlayers(table, me) {
	const { players, turn, winner } = table;
	const container = el("div", { display: "flex", gap: "10px" });
	for (const [name, data] of Object.entries(players)) {
		const isActive = turn?.includes(name);
		const isWinner = winner === name;
		const isMe = name === me;
		const card = el("div", {
			padding: "10px 18px", borderRadius: "12px",
			border: `${isActive ? 2 : 0.5}px solid ${isActive ? "var(--border-accent)" : "var(--border)"}`,
			background: isWinner ? "var(--bg-success)" : isActive ? "var(--bg-accent)" : "var(--surface-1)",
			minWidth: "90px", textAlign: "center", position: "relative",
		}, null,
			el("div", { fontSize: "26px", lineHeight: "1.1" }, null, data.symbol),
			el("div", { fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginTop: "4px" }, null, name),
			el("div", { fontSize: "12px", color: "var(--text-secondary)" }, null, `score: ${data.score}`),
			isMe ? el("div", { fontSize: "10px", color: "var(--text-muted)", marginTop: "2px" }, null, "(you)") : null,
			isActive ? el("div", { fontSize: "11px", color: "var(--text-accent)", marginTop: "3px" }, null, "▲ turn") : null,
			isWinner ? el("div", { fontSize: "11px", color: "var(--text-success)", marginTop: "3px" }, null, "winner") : null,
		);
		container.appendChild(card);
	}
	return container;
}

function renderGridBoard(board, winLine, actions, onAction, present) {
	const { rows, cols, cells } = board;
	const cellSize = present.cellSize ?? 90;
	const renderCell = present.renderCell ?? (v => v ?? "");
	const fgColors = present.symbolColors ?? {};
	const bgColors = present.symbolBg ?? {};
	const actionSet = new Set(actions.map(a => `${a.row},${a.col}`));
	const onWin = (r, c) => winLine?.some(([wr, wc]) => wr === r && wc === c);

	const grid = el("div", {
		display: "grid", gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: "6px",
	});

	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			const value = cells[r][c];
			const canClick = actionSet.has(`${r},${c}`);
			const winning = onWin(r, c);
			const bg = winning ? "var(--bg-warning)" : (bgColors[value] ?? "var(--surface-2)");
			const cell = el("div", {
				width: `${cellSize}px`, height: `${cellSize}px`,
				display: "flex", alignItems: "center", justifyContent: "center",
				fontSize: `${Math.round(cellSize * 0.42)}px`, fontWeight: 500,
				borderRadius: "10px",
				border: `${winning ? 2 : 0.5}px solid ${winning ? "var(--border-warning)" : "var(--border-strong)"}`,
				background: bg, color: fgColors[value] ?? "var(--text-primary)",
				cursor: canClick ? "pointer" : "default",
				transition: "all 0.12s ease", userSelect: "none",
			}, null, renderCell(value, r, c));

			if (canClick) {
				cell.addEventListener("click", () => onAction({ type: "place", row: r, col: c }));
				cell.addEventListener("mouseenter", () => { cell.style.background = "var(--surface-1)"; });
				cell.addEventListener("mouseleave", () => { cell.style.background = bg; });
			}
			grid.appendChild(cell);
		}
	}
	return grid;
}

function renderBoard(table, actions, onAction) {
	const { board } = table;
	if (!board) return el("div");
	const p = table._logic?.present ?? {};

	if (board.type === "grid")
		return renderGridBoard(board, table.winLine, actions, onAction, p);

	return el("pre", {
		fontSize: "11px", textAlign: "left", background: "var(--surface-1)",
		padding: "10px", borderRadius: "8px", border: "0.5px solid var(--border)",
		maxHeight: "200px", overflow: "auto",
	}, null, JSON.stringify(board, null, 2));
}
