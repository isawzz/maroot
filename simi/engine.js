
// Global Styles Configuration
const STYLES = {
	table: { background: '#f0f0f0', padding: '20px', borderRadius: '8px', width: 'max-content', margin: 'auto' },
	boardSquare: { display: 'grid', gap: '5px', margin: '15px 0' },
	cell: { width: '60px', height: '60px', background: '#fff', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' },
	status: { fontSize: '18px', fontWeight: 'bold', textAlign: 'center', margin: '10px 0' },
	playerInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }
};

// Mocking helper layout functions based on source environment
function mDom(parent, styles = {}, opts = {}) {
	const el = document.createElement(opts.tag || 'div');
	if (opts.html) el.innerHTML = opts.html;
	if (opts.className) el.className = opts.className;
	if (parent) parent.appendChild(el);
	mStyle(el, styles);
	return el;
}

function mStyle(el, styles = {}) {
	for (const [key, value] of Object.entries(styles)) {
		el.style[key] = value;
	}
}

// Engine Functions
function createGamelogic(game_instructions) {
	return {
		checkWin: game_instructions.checkWin,
		checkDraw: game_instructions.checkDraw,
		executeMove: game_instructions.executeMove
	};
}

function createTable(players, options, gamename) {
	const playerDict = {};
	players.forEach(p => playerDict[p] = { score: 0 });

	return {
		gamename,
		options,
		players: playerDict,
		plorder: [...players],
		turn: [players[0]],
		status: 'started',
		board: {
			type: options.boardType || 'square',
			rows: options.rows || 3,
			cols: options.cols || 3,
			state: Array((options.rows || 3) * (options.cols || 3)).fill(null)
		},
		history: []
	};
}

function presentTable(player, table) {
	const dMain = document.getElementById('dMain') || document.body;
	dMain.innerHTML = ''; // Clear previous frame

	const dTable = mDom(dMain, STYLES.table);

	// Game Title & Status
	mDom(dTable, STYLES.status, { html: `Game: ${table.gamename.toUpperCase()} (${table.status})` });

	// Players Meta Info
	const dPlayers = mDom(dTable, STYLES.playerInfo);
	for (const [name, meta] of Object.entries(table.players)) {
		const isTurn = table.turn.includes(name) ? ' ★' : '';
		mDom(dPlayers, {}, { html: `<b>${name}</b>: ${meta.score} pts${isTurn}` });
	}

	// Auto-UI Conversion for Board Grid
	let uiCells = [];
	if (table.board.type === 'square') {
		const dBoard = mDom(dTable, {
			...STYLES.boardSquare,
			gridTemplateRows: `repeat(${table.board.rows}, max-content)`,
			gridTemplateColumns: `repeat(${table.board.cols}, max-content)`
		});

		table.board.state.forEach((val, idx) => {
			const cell = mDom(dBoard, STYLES.cell, { html: val || '' });
			cell.dataset.index = idx;
			uiCells.push(cell);
		});
	}

	return { dTable, uiCells };
}

function activateTable(player, table, ui, logic, onMoveComplete) {
	if (table.status !== 'started' || !table.turn.includes(player)) return;

	ui.uiCells.forEach(cell => {
		const idx = parseInt(cell.dataset.index);
		if (table.board.state[idx] !== null) return; // Cell already occupied

		cell.onclick = () => {
			// Execute turn logic safely
			logic.executeMove(table, player, idx);

			// Post-move check cycles
			if (logic.checkWin(table, player)) {
				table.status = 'won';
				table.players[player].score += 1;
			} else if (logic.checkDraw(table)) {
				table.status = 'draw';
			} else {
				// Toggle Active Turn Order
				const nextIdx = (table.plorder.indexOf(player) + 1) % table.plorder.length;
				table.turn = [table.plorder[nextIdx]];
			}

			onMoveComplete(table);
		};
	});
}
