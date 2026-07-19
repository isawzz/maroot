// ═══════════════════════════════════════════════════════════════════════════════
// TIC TAC TOE — game definition
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
