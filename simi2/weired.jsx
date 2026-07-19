
import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// GAME ENGINE — pure logic, zero UI
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * createGameLogic(instructions)
 * Validates and freezes a game definition.
 *
 * instructions must provide:
 *   name       string   — display name
 *   setup      fn(players, options) → table
 *   getActions fn(table, player)    → [{type, ...}]
 *   applyAction fn(table, action, player) → newTable   (must return new object)
 *   checkWinner fn(table) → null | {winner, status, ...}
 *   present    object    — (optional) rendering hints for presentTable
 */
function createGameLogic(instructions) {
	const required = ["name", "setup", "getActions", "applyAction", "checkWinner"];
	for (const k of required) {
		const want = k === "name" ? "string" : "function";
		if (typeof instructions[k] !== want)
			throw new Error(`createGameLogic: '${k}' must be a ${want}`);
	}
	return Object.freeze({ ...instructions });
}

/**
 * createTable(players, options, gameLogic)
 * Calls gameLogic.setup and attaches _logic so presentTable can reach it.
 * Returns a plain serialisable object — the single source of truth.
 */
function createTable(players, options = {}, gameLogic) {
	const table = gameLogic.setup(players, options);
	return { ...table, _logic: gameLogic }; // _logic stripped on serialise
}

/**
 * presentTable(playerName, table)
 * Inspects table and returns the right React component tree.
 * Auto-dispatches board.type → grid | list | fallback.
 * No interaction — pure display.
 *
 * In a DOM-only project this would write to a container element instead.
 */
function presentTable(playerName, table, onAction) {
	return <TableView playerName={playerName} table={table} onAction={onAction} />;
}

/**
 * activateTable(playerName, table, onAction)
 * Returns action descriptors the player may take right now.
 * In a DOM-only project this would attach/remove event listeners.
 *
 * Here it feeds the `actions` prop of BoardView; the board renderer
 * uses it to decide which cells/items are clickable.
 */
function activateTable(playerName, table) {
	const logic = table._logic;
	if (!table.turn?.includes(playerName)) return [];
	return logic.getActions(table, playerName);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESENTATION LAYER
// presentTable auto-converts any table dict to a UI by inspecting its shape.
// ═══════════════════════════════════════════════════════════════════════════════

function TableView({ playerName, table, onAction }) {
	const actions = activateTable(playerName, table);
	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
			<StatusBar table={table} />
			<PlayersPanel table={table} />
			<BoardView table={table} actions={actions} onAction={onAction} />
		</div>
	);
}

function StatusBar({ table }) {
	const { status, winner, turn } = table;
	let msg, color;
	if (status === "won") { msg = `${winner} wins!`; color = "var(--text-success)"; }
	else if (status === "draw") { msg = "Draw — no winner"; color = "var(--text-secondary)"; }
	else { msg = `${turn?.[0]}'s turn`; color = "var(--text-accent)"; }
	return (
		<div style={{ fontSize: 15, fontWeight: 500, color, letterSpacing: 0.3 }}>
			{msg}
		</div>
	);
}

function PlayersPanel({ table }) {
	const { players, turn, winner } = table;
	return (
		<div style={{ display: "flex", gap: 10 }}>
			{Object.entries(players).map(([name, data]) => {
				const isActive = turn?.includes(name);
				const isWinner = winner === name;
				return (
					<div key={name} style={{
						padding: "10px 18px", borderRadius: 12,
						border: `${isActive ? 2 : 0.5}px solid ${isActive ? "var(--border-accent)" : "var(--border)"}`,
						background: isWinner ? "var(--bg-success)" : isActive ? "var(--bg-accent)" : "var(--surface-1)",
						minWidth: 90, textAlign: "center",
					}}>
						<div style={{ fontSize: 26, lineHeight: 1.1 }}>{data.symbol}</div>
						<div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginTop: 4 }}>{name}</div>
						<div style={{ fontSize: 12, color: "var(--text-secondary)" }}>score: {data.score}</div>
						{isActive && <div style={{ fontSize: 11, color: "var(--text-accent)", marginTop: 3 }}>▲ your turn</div>}
						{isWinner && <div style={{ fontSize: 11, color: "var(--text-success)", marginTop: 3 }}>winner</div>}
					</div>
				);
			})}
		</div>
	);
}

// BoardView dispatches on board.type — this is the "auto-convert" heart of presentTable.
function BoardView({ table, actions, onAction }) {
	const { board } = table;
	if (!board) return null;
	const logic = table._logic;
	const p = logic.present ?? {};

	if (board.type === "grid")
		return <GridBoard board={board} winLine={table.winLine} actions={actions} onAction={onAction} present={p} />;

	if (board.type === "list")
		return <ListBoard board={board} actions={actions} onAction={onAction} present={p} />;

	// fallback: raw JSON view of unknown board type
	return (
		<pre style={{
			fontSize: 11, textAlign: "left", background: "var(--surface-1)",
			padding: 10, borderRadius: 8, border: "0.5px solid var(--border)", maxHeight: 200, overflow: "auto"
		}}>
			{JSON.stringify(board, null, 2)}
		</pre>
	);
}

function GridBoard({ board, winLine, actions, onAction, present }) {
	const { rows, cols, cells } = board;
	const cellSize = present.cellSize ?? 90;
	const renderCell = present.renderCell ?? (v => v ?? "");
	const fgColors = present.symbolColors ?? {};
	const bgColors = present.symbolBg ?? {};
	const actionSet = new Set(actions.map(a => `${a.row},${a.col}`));
	const onWin = (r, c) => winLine?.some(([wr, wc]) => wr === r && wc === c);

	return (
		<div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 6 }}>
			{Array.from({ length: rows }, (_, r) =>
				Array.from({ length: cols }, (_, c) => {
					const value = cells[r][c];
					const canClick = actionSet.has(`${r},${c}`);
					const winning = onWin(r, c);
					return (
						<div key={`${r}-${c}`}
							onClick={() => canClick && onAction({ type: "place", row: r, col: c })}
							style={{
								width: cellSize, height: cellSize,
								display: "flex", alignItems: "center", justifyContent: "center",
								fontSize: Math.round(cellSize * 0.42),
								fontWeight: 500,
								borderRadius: 10,
								border: `${winning ? 2 : 0.5}px solid ${winning ? "var(--border-warning)" : "var(--border-strong)"}`,
								background: winning ? "var(--bg-warning)" : (bgColors[value] ?? "var(--surface-2)"),
								color: fgColors[value] ?? "var(--text-primary)",
								cursor: canClick ? "pointer" : "default",
								transition: "all 0.12s ease",
								userSelect: "none",
							}}
							onMouseEnter={e => { if (canClick) e.currentTarget.style.background = "var(--surface-1)"; }}
							onMouseLeave={e => { if (canClick) e.currentTarget.style.background = bgColors[value] ?? "var(--surface-2)"; }}
						>
							{renderCell(value, r, c)}
						</div>
					);
				})
			)}
		</div>
	);
}

function ListBoard({ board, actions, onAction, present }) {
	const renderItem = present.renderItem ?? (v => typeof v === "string" ? v : JSON.stringify(v));
	const actionIds = new Set(actions.map(a => String(a.id)));
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
			{(board.items ?? []).map((item, i) => {
				const id = String(item.id ?? i);
				const canClick = actionIds.has(id);
				return (
					<div key={id}
						onClick={() => canClick && onAction({ type: "pick", id })}
						style={{
							padding: "10px 16px", borderRadius: 8,
							border: "0.5px solid var(--border)",
							background: canClick ? "var(--bg-accent)" : "var(--surface-1)",
							color: canClick ? "var(--text-accent)" : "var(--text-primary)",
							cursor: canClick ? "pointer" : "default",
							fontSize: 14,
						}}
					>
						{renderItem(item, i)}
					</div>
				);
			})}
		</div>
	);
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIC TAC TOE — game definition (plug into the engine above)
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
				type: "grid",
				rows: 3, cols: 3,
				cells: Array.from({ length: 3 }, () => Array(3).fill(null)),
			},
			turn: [players[0]],
			status: "playing",
			winner: null,
			winLine: null,
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
// APP DEMO — shows createTable → presentTable → activateTable cycle
// ═══════════════════════════════════════════════════════════════════════════════

const PLAYERS = ["Alice", "Bob"];

export default function App() {
	const [table, setTable] = useState(() => createTable(PLAYERS, {}, ticTacToe));
	const [showState, setShowState] = useState(false);
	const currentPlayer = table.turn?.[0];

	function handleAction(action) {
		const logic = table._logic;
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
		setTable(next);
	}

	function handleRestart() {
		const scores = Object.fromEntries(
			Object.entries(table.players).map(([n, d]) => [n, d.score])
		);
		const fresh = createTable(PLAYERS, {}, ticTacToe);
		setTable({
			...fresh,
			players: Object.fromEntries(
				Object.entries(fresh.players).map(([n, d]) => [n, { ...d, score: scores[n] ?? 0 }])
			),
		});
	}

	const serialised = JSON.stringify({ ...table, _logic: "[GameLogic]" }, null, 2);

	return (
		<div style={{ padding: "24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
			<div style={{ fontSize: 22, fontWeight: 500, color: "var(--text-primary)" }}>
				{table._logic.name}
			</div>

			<div style={{
				background: "var(--surface-2)", borderRadius: 16,
				border: "0.5px solid var(--border)", padding: 28,
				display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
				minWidth: 360,
			}}>
				{/* presentTable → renders the table dict as appropriate UI */}
				{presentTable(currentPlayer, table, handleAction)}

				{table.status !== "playing" && (
					<button onClick={handleRestart} style={{ width: "100%", padding: "10px 0", borderRadius: 8 }}>
						Play again
					</button>
				)}
			</div>

			<div style={{ width: "100%", maxWidth: 420 }}>
				<button onClick={() => setShowState(s => !s)} style={{ fontSize: 12, color: "var(--text-secondary)" }}>
					{showState ? "hide" : "show"} table state (engine output)
				</button>
				{showState && (
					<pre style={{
						fontSize: 11, textAlign: "left", background: "var(--surface-1)",
						padding: 12, borderRadius: 8, border: "0.5px solid var(--border)",
						overflow: "auto", maxHeight: 260, marginTop: 8, color: "var(--text-secondary)",
					}}>
						{serialised}
					</pre>
				)}
			</div>

			<div style={{
				maxWidth: 420, fontSize: 12, color: "var(--text-muted)",
				borderTop: "0.5px solid var(--border)", paddingTop: 16,
				lineHeight: 1.8, textAlign: "left",
			}}>
				<strong style={{ color: "var(--text-secondary)" }}>Engine functions</strong><br />
				<code>createGameLogic(instructions)</code> — validates and freezes a game spec<br />
				<code>createTable(players, options, logic)</code> — calls setup, returns state dict<br />
				<code>presentTable(player, table)</code> — auto-converts board.type → UI<br />
				<code>activateTable(player, table)</code> — returns valid actions for this player
			</div>
		</div>
	);
}
