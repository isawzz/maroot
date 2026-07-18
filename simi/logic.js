// 1. Defining Game Logic Profile Instructions
const tttInstructions = {
	executeMove: (table, player, cellIdx) => {
		// Assign piece markers dynamically based on player position placement order
		const marker = table.plorder.indexOf(player) === 0 ? 'X' : 'O';
		table.board.state[cellIdx] = marker;
		table.history.push({ player, cellIdx });
	},
	checkWin: (table, player) => {
		const marker = table.plorder.indexOf(player) === 0 ? 'X' : 'O';
		const s = table.board.state;
		const winPatterns = [
			[0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
			[0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
			[0, 4, 8], [2, 4, 6]           // Diagonals
		];
		return winPatterns.some(p => p.every(idx => s[idx] === marker));
	},
	checkDraw: (table) => {
		return table.board.state.every(cell => cell !== null);
	}
};

// 2. Initializing Loop Setup
const tttLogic = createGamelogic(tttInstructions);
let currentTable = createTable(['Felix', 'Amanda'], { boardType: 'square', rows: 3, cols: 3 }, 'Tic Tac Toe');

// 3. Simple Game Loop Render Runner
function gameLoop(table) {
	const activePlayer = table.turn[0]; // Active turn controller agent
	const ui = presentTable(activePlayer, table);

	activateTable(activePlayer, table, ui, tttLogic, (updatedTable) => {
		// Triggers redraw update frame on action confirmation
		gameLoop(updatedTable);
	});
}

// Start Game!
// Make sure you have a <div id="dMain"></div> element in your HTML body
gameLoop(currentTable);
