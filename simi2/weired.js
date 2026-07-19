// ═══════════════════════════════════════════════════════════════════════════════
// GAME ENGINE — pure logic, zero UI
// ═══════════════════════════════════════════════════════════════════════════════

function createGameLogic(instructions) {
	const required = ["name", "setup", "getActions", "applyAction", "checkWinner"];
	for (const k of required) {
		const want = k === "name" ? "string" : "function";
		if (typeof instructions[k] !== want)
			throw new Error(`createGameLogic: '${k}' must be a ${want}`);
	}
	return Object.freeze({ ...instructions });
}

function createTable(players, options = {}, gameLogic) {
	const table = gameLogic.setup(players, options);
	return { ...table, _logic: gameLogic };
}

function activateTable(playerName, table) {
	const logic = table._logic;
	if (!table.turn?.includes(playerName)) return [];
	return logic.getActions(table, playerName);
}

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

function renderPlayers(table) {
	const { players, turn, winner } = table;
	const container = el("div", { display: "flex", gap: "10px" });
	for (const [name, data] of Object.entries(players)) {
		const isActive = turn?.includes(name);
		const isWinner = winner === name;
		const card = el("div", {
			padding: "10px 18px", borderRadius: "12px",
			border: `${isActive ? 2 : 0.5}px solid ${isActive ? "var(--border-accent)" : "var(--border)"}`,
			background: isWinner ? "var(--bg-success)" : isActive ? "var(--bg-accent)" : "var(--surface-1)",
			minWidth: "90px", textAlign: "center",
		}, null,
			el("div", { fontSize: "26px", lineHeight: "1.1" }, null, data.symbol),
			el("div", { fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", marginTop: "4px" }, null, name),
			el("div", { fontSize: "12px", color: "var(--text-secondary)" }, null, `score: ${data.score}`),
			isActive ? el("div", { fontSize: "11px", color: "var(--text-accent)", marginTop: "3px" }, null, "▲ your turn") : null,
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

function renderListBoard(board, actions, onAction, present) {
	const renderItem = present.renderItem ?? (v => typeof v === "string" ? v : JSON.stringify(v));
	const actionIds = new Set(actions.map(a => String(a.id)));
	const container = el("div", { display: "flex", flexDirection: "column", gap: "8px", width: "100%" });
	(board.items ?? []).forEach((item, i) => {
		const id = String(item.id ?? i);
		const canClick = actionIds.has(id);
		const row = el("div", {
			padding: "10px 16px", borderRadius: "8px",
			border: "0.5px solid var(--border)",
			background: canClick ? "var(--bg-accent)" : "var(--surface-1)",
			color: canClick ? "var(--text-accent)" : "var(--text-primary)",
			cursor: canClick ? "pointer" : "default", fontSize: "14px",
		}, null, renderItem(item, i));
		if (canClick) row.addEventListener("click", () => onAction({ type: "pick", id }));
		container.appendChild(row);
	});
	return container;
}

function renderBoard(table, actions, onAction) {
	const { board } = table;
	if (!board) return el("div");
	const p = table._logic.present ?? {};

	if (board.type === "grid")
		return renderGridBoard(board, table.winLine, actions, onAction, p);
	if (board.type === "list")
		return renderListBoard(board, actions, onAction, p);

	// fallback
	return el("pre", {
		fontSize: "11px", textAlign: "left", background: "var(--surface-1)",
		padding: "10px", borderRadius: "8px", border: "0.5px solid var(--border)",
		maxHeight: "200px", overflow: "auto",
	}, null, JSON.stringify(board, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIC TAC TOE
// ═══════════════════════════════════════════════════════════════════════════════

const WIN_LINES = [
	[[0, 0], [0, 1], [0, 2]], [[1, 0], [1, 1], [1, 2]], [[2, 0], [2, 1], [2, 2]],
	[[0, 0], [1, 0], [2, 0]], [[0, 1], [1, 1], [2, 1]], [[0, 2], [1, 2], [2, 2]],
	[[0, 0], [1, 1], [2, 2]], [[0, 2], [1, 1], [2, 0]],
];

const ticTacToe = createGameLogic({
	name: "Tic Tac Toe",

	setup(players) {
		const symbols = ["✕", "○"];
		return {
			players: Object.fromEntries(
				players.map((name, i) => [name, { name, score: 0, symbol: symbols[i] }])
			),
			board: {
				type: "grid", rows: 3, cols: 3,
				cells: Array.from({ length: 3 }, () => Array(3).fill(null)),
			},
			turn: [players[0]], status: "playing", winner: null, winLine: null,
		};
	},

	getActions(table, player) {
		if (table.status !== "playing") return [];
		if (!table.turn.includes(player)) return [];
		const actions = [];
		const { rows, cols, cells } = table.board;
		for (let r = 0; r < rows; r++)
			for (let c = 0; c < cols; c++)
				if (!cells[r][c]) actions.push({ type: "place", row: r, col: c });
		return actions;
	},

	applyAction(table, action, player) {
		if (action.type !== "place") return table;
		const { row, col } = action;
		const sym = table.players[player].symbol;
		const newCells = table.board.cells.map(r => [...r]);
		if (newCells[row][col]) return table;
		newCells[row][col] = sym;
		const names = Object.keys(table.players);
		const nextName = names[(names.indexOf(player) + 1) % names.length];
		return { ...table, board: { ...table.board, cells: newCells }, turn: [nextName] };
	},

	checkWinner(table) {
		const { cells } = table.board;
		for (const line of WIN_LINES) {
			const [a, b, c] = line;
			const v = cells[a[0]][a[1]];
			if (v && v === cells[b[0]][b[1]] && v === cells[c[0]][c[1]]) {
				const winner = Object.values(table.players).find(p => p.symbol === v)?.name;
				return { winner, status: "won", winLine: line };
			}
		}
		if (cells.every(row => row.every(cell => cell)))
			return { winner: null, status: "draw", winLine: null };
		return null;
	},

	present: {
		cellSize: 95,
		renderCell: v => v ?? "",
		symbolColors: { "✕": "var(--text-danger)", "○": "var(--text-accent)" },
		symbolBg: { "✕": "var(--bg-danger)", "○": "var(--bg-accent)", null: "var(--surface-2)" },
	},
});

// ═══════════════════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════════════════

const PLAYERS = ["Alice", "Bob"];

let table = createTable(PLAYERS, {}, ticTacToe);
let showState = false;

function handleAction(action) {
	const logic = table._logic;
	const currentPlayer = table.turn?.[0];
	let next = logic.applyAction(table, action, currentPlayer);
	const result = logic.checkWinner(next);
	if (result) {
		const updatedPlayers = { ...next.players };
		if (result.winner)
			updatedPlayers[result.winner] = {
				...updatedPlayers[result.winner],
				score: updatedPlayers[result.winner].score + 1,
			};
		next = { ...next, ...result, players: updatedPlayers };
	}
	table = next;
	render();
}

function handleRestart() {
	const scores = Object.fromEntries(
		Object.entries(table.players).map(([n, d]) => [n, d.score])
	);
	const fresh = createTable(PLAYERS, {}, ticTacToe);
	table = {
		...fresh,
		players: Object.fromEntries(
			Object.entries(fresh.players).map(([n, d]) => [n, { ...d, score: scores[n] ?? 0 }])
		),
	};
	render();
}

function render() {
	const root = document.getElementById("dMain");
	root.innerHTML = "";
	const currentPlayer = table.turn?.[0];
	const actions = activateTable(currentPlayer, table);

	const container = el("div", { padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" });

	// title
	container.appendChild(el("div", { fontSize: "22px", fontWeight: 500, color: "var(--text-primary)" }, null, table._logic.name));

	// game card
	const card = el("div", {
		background: "var(--surface-2)", borderRadius: "16px",
		border: "0.5px solid var(--border)", padding: "28px",
		display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", minWidth: "360px",
	});
	card.appendChild(renderStatus(table));
	card.appendChild(renderPlayers(table));
	card.appendChild(renderBoard(table, actions, handleAction));
	if (table.status !== "playing") {
		const btn = el("button", { width: "100%", padding: "10px 0", borderRadius: "8px" }, null, "Play again");
		btn.addEventListener("click", handleRestart);
		card.appendChild(btn);
	}
	container.appendChild(card);

	// state toggle
	const stateArea = el("div", { width: "100%", maxWidth: "420px" });
	const toggleBtn = el("button", { fontSize: "12px", color: "var(--text-secondary)" }, null,
		showState ? "hide" : "show", " table state (engine output)");
	toggleBtn.addEventListener("click", () => { showState = !showState; render(); });
	stateArea.appendChild(toggleBtn);
	if (showState) {
		const serialised = JSON.stringify({ ...table, _logic: "[GameLogic]" }, null, 2);
		stateArea.appendChild(el("pre", {
			fontSize: "11px", textAlign: "left", background: "var(--surface-1)",
			padding: "12px", borderRadius: "8px", border: "0.5px solid var(--border)",
			overflow: "auto", maxHeight: "260px", marginTop: "8px", color: "var(--text-secondary)",
		}, null, serialised));
	}
	container.appendChild(stateArea);

	// help
	const help = el("div", {
		maxWidth: "420px", fontSize: "12px", color: "var(--text-muted)",
		borderTop: "0.5px solid var(--border)", paddingTop: "16px",
		lineHeight: "1.8", textAlign: "left",
	});
	help.innerHTML = `<strong style="color: var(--text-secondary)">Engine functions</strong><br>` +
		`<code>createGameLogic(instructions)</code> — validates and freezes a game spec<br>` +
		`<code>createTable(players, options, logic)</code> — calls setup, returns state dict<br>` +
		`<code>presentTable(player, table)</code> — auto-converts board.type → UI<br>` +
		`<code>activateTable(player, table)</code> — returns valid actions for this player`;
	container.appendChild(help);

	root.appendChild(container);
}

render();
