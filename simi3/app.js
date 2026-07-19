// ═══════════════════════════════════════════════════════════════════════════════
// APP — login, lobby, multiplayer tic tac toe with polling
// ═══════════════════════════════════════════════════════════════════════════════

let me = localStorage.getItem('username') || '';
let currentGameId = null;
let table = null;
let pollTimer = null;
let lastStep = -1;

// ── SERIALISATION ──────────────────────────────────────────────────────────
// Strip _logic before saving to DB, reattach when loading.

function tableToRow(t) {
	const { _logic, ...rest } = t;
	return rest;
}

function rowToTable(row) {
	const t = typeof row.fen === 'string' ? JSON.parse(row.fen) : row.fen;
	t.id = row.id;
	t._logic = ticTacToe;
	return t;
}

// ── SCREENS ────────────────────────────────────────────────────────────────

function render() {
	clearInterval(pollTimer);
	pollTimer = null;
	const root = document.getElementById('dMain');
	root.innerHTML = '';
	if (!me) return renderLogin(root);
	if (!currentGameId) return renderLobby(root);
	renderGame(root);
}

// ── LOGIN ──────────────────────────────────────────────────────────────────

function renderLogin(root) {
	const wrap = el("div", { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "40px 0" });
	wrap.appendChild(el("div", { fontSize: "22px", fontWeight: 600, color: "var(--text-primary)" }, null, "Tic Tac Toe"));
	wrap.appendChild(el("div", { fontSize: "14px", color: "var(--text-secondary)" }, null, "Enter your name to start"));

	const input = el("input", {
		padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--border)",
		fontSize: "15px", width: "220px", textAlign: "center", outline: "none",
	}, { placeholder: "Your name" });
	if (me) input.value = me;

	const btn = el("button", {
		padding: "10px 24px", borderRadius: "8px", border: "none",
		background: "var(--text-accent)", color: "#fff", fontSize: "14px", fontWeight: 500,
		cursor: "pointer",
	}, null, "Enter");

	function doLogin() {
		const name = input.value.trim();
		if (!name) return;
		me = name;
		localStorage.setItem('username', name);
		render();
	}
	btn.addEventListener('click', doLogin);
	input.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

	wrap.appendChild(input);
	wrap.appendChild(btn);
	root.appendChild(wrap);
}

// ── LOBBY ──────────────────────────────────────────────────────────────────

async function renderLobby(root) {
	const wrap = el("div", { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px 0", width: "100%", maxWidth: "500px" });

	// header
	const header = el("div", { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" });
	header.appendChild(el("div", { fontSize: "20px", fontWeight: 600, color: "var(--text-primary)" }, null, "Games"));
	const userBtn = el("button", { fontSize: "12px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }, null, me);
	userBtn.addEventListener('click', () => { me = ''; localStorage.removeItem('username'); render(); });
	header.appendChild(userBtn);
	wrap.appendChild(header);

	// create button
	const createBtn = el("button", {
		width: "100%", padding: "12px", borderRadius: "10px", border: "1px dashed var(--border-accent)",
		background: "var(--bg-accent)", color: "var(--text-accent)", fontSize: "14px", fontWeight: 500,
		cursor: "pointer",
	}, null, "+ Create new game");
	createBtn.addEventListener('click', async () => {
		createBtn.disabled = true;
		createBtn.textContent = "Creating...";
		await createGame();
	});
	wrap.appendChild(createBtn);

	// game list
	const list = el("div", { display: "flex", flexDirection: "column", gap: "8px", width: "100%" });
	list.appendChild(el("div", { fontSize: "13px", color: "var(--text-muted)" }, null, "Loading..."));
	wrap.appendChild(list);
	root.appendChild(wrap);

	// fetch games
	const res = await apiGetGameTables();
	const games = res.tables || [];

	list.innerHTML = '';
	if (games.length === 0) {
		list.appendChild(el("div", { fontSize: "13px", color: "var(--text-muted)", padding: "20px 0", textAlign: "center" }, null, "No games yet. Create one!"));
		return;
	}

	for (const g of games) {
		const players = typeof g.players === 'string' ? JSON.parse(g.players) : (g.players || []);
		const status = g.status || 'playing';
		const isFull = players.length >= 2;
		const iAmIn = players.includes(me);

		const row = el("div", {
			padding: "12px 16px", borderRadius: "10px",
			border: "0.5px solid var(--border)", background: "var(--surface-1)",
			display: "flex", justifyContent: "space-between", alignItems: "center",
		});

		const info = el("div", { display: "flex", flexDirection: "column", gap: "2px" });
		info.appendChild(el("div", { fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }, null, g.friendly || `Game #${g.id}`));
		info.appendChild(el("div", { fontSize: "12px", color: "var(--text-secondary)" }, null,
			players.length > 0 ? players.join(' vs ') : 'Empty'));
		if (status !== 'playing') {
			info.appendChild(el("div", { fontSize: "11px", color: "var(--text-muted)" }, null, status));
		}
		row.appendChild(info);

		if (iAmIn || status === 'won' || status === 'draw') {
			const openBtn = el("button", {
				padding: "6px 16px", borderRadius: "6px", border: "none",
				background: "var(--text-accent)", color: "#fff", fontSize: "12px", cursor: "pointer",
			}, null, "Open");
			openBtn.addEventListener('click', () => openGame(g.id));
			row.appendChild(openBtn);
		} else if (!isFull) {
			const joinBtn = el("button", {
				padding: "6px 16px", borderRadius: "6px", border: "1px solid var(--border-accent)",
				background: "var(--bg-accent)", color: "var(--text-accent)", fontSize: "12px", cursor: "pointer",
			}, null, "Join");
			joinBtn.addEventListener('click', async () => {
				joinBtn.disabled = true;
				await joinGame(g);
			});
			row.appendChild(joinBtn);
		} else {
			row.appendChild(el("div", { fontSize: "12px", color: "var(--text-muted)" }, null, "full"));
		}

		list.appendChild(row);
	}
}

// ── GAME ACTIONS ───────────────────────────────────────────────────────────

async function createGame() {
	const players = [me];
	const fresh = createTable(players, {}, ticTacToe);
	const row = tableToRow(fresh);
	const res = await apiInsertRow('gametable', {
		friendly: `${me}'s game`,
		game: 'Tic Tac Toe',
		host: me,
		owner: me,
		players: JSON.stringify(players),
		fen: JSON.stringify(row),
		turn: JSON.stringify(fresh.turn),
		status: 'playing',
		step: 0,
		round: 1,
	});
	await openGame(res.insert_id);
}

async function joinGame(g) {
	const players = typeof g.players === 'string' ? JSON.parse(g.players) : (g.players || []);
	if (players.includes(me) || players.length >= 2) return;

	players.push(me);
	const symbols = ["✕", "○"];
	const fen = typeof g.fen === 'string' ? JSON.parse(g.fen) : g.fen;
	fen.players[me] = { name: me, score: 0, symbol: symbols[players.length - 1] };

	await apiUpdateRow('gametable', g.id, {
		players: JSON.stringify(players),
		fen: JSON.stringify(fen),
	});
	await openGame(g.id);
}

// ── GAME VIEW ──────────────────────────────────────────────────────────────

async function openGame(id) {
	currentGameId = id;
	table = null;
	lastStep = -1;
	render();
}

function renderGame(root) {
	const wrap = el("div", { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px 0" });

	// loading
	if (!table) {
		wrap.appendChild(el("div", { fontSize: "14px", color: "var(--text-muted)" }, null, "Loading game..."));
		root.appendChild(wrap);
		pollTable();
		return;
	}

	// back button
	const backBtn = el("button", {
		alignSelf: "flex-start", fontSize: "12px", color: "var(--text-secondary)",
		background: "none", border: "none", cursor: "pointer", marginBottom: "8px",
	}, null, "← Back to lobby");
	backBtn.addEventListener('click', () => { currentGameId = null; table = null; render(); });
	wrap.appendChild(backBtn);

	// title
	wrap.appendChild(el("div", { fontSize: "22px", fontWeight: 600, color: "var(--text-primary)" }, null, table._logic.name));

	// game card
	const card = el("div", {
		background: "var(--surface-2)", borderRadius: "16px",
		border: "0.5px solid var(--border)", padding: "28px",
		display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", minWidth: "360px",
	});
	card.appendChild(renderStatus(table));
	card.appendChild(renderPlayers(table, me));

	// board
	const actions = table._logic.turn?.includes(me) ? activateTable(me, table) : [];
	card.appendChild(renderBoard(table, actions, handleAction));

	// restart button
	if (table.status !== 'playing') {
		const btn = el("button", {
			width: "100%", padding: "10px 0", borderRadius: "8px", border: "none",
			background: "var(--text-accent)", color: "#fff", fontSize: "14px", cursor: "pointer",
		}, null, "Play again");
		btn.addEventListener('click', handleRestart);
		card.appendChild(btn);
	}

	// waiting message
	const playerNames = Object.keys(table.players || {});
	if (playerNames.length < 2 && table.status === 'playing') {
		card.appendChild(el("div", {
			fontSize: "13px", color: "var(--text-muted)", fontStyle: "italic",
		}, null, "Waiting for opponent to join..."));
	}

	wrap.appendChild(card);

	// state toggle
	const stateArea = el("div", { width: "100%", maxWidth: "420px" });
	const toggleBtn = el("button", { fontSize: "12px", color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" },
		null, "show table state");
	toggleBtn.addEventListener('click', () => {
		const pre = stateArea.querySelector('pre');
		if (pre) { pre.remove(); toggleBtn.textContent = "show table state"; return; }
		const serialised = JSON.stringify(tableToRow(table), null, 2);
		stateArea.appendChild(el("pre", {
			fontSize: "11px", textAlign: "left", background: "var(--surface-1)",
			padding: "12px", borderRadius: "8px", border: "0.5px solid var(--border)",
			overflow: "auto", maxHeight: "260px", marginTop: "8px", color: "var(--text-secondary)",
		}, null, serialised));
		toggleBtn.textContent = "hide table state";
	});
	stateArea.appendChild(toggleBtn);
	wrap.appendChild(stateArea);

	root.appendChild(wrap);

	// start polling
	if (!pollTimer) {
		pollTimer = setInterval(pollTable, 1500);
		pollTable();
	}
}

// ── ACTIONS ────────────────────────────────────────────────────────────────

async function handleAction(action) {
	if (!table || !me) return;
	const logic = table._logic;
	const currentPlayer = table.turn?.[0];
	if (currentPlayer !== me) return;

	// apply locally first (optimistic)
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

	// save to backend
	const row = tableToRow(next);
	const update = {
		fen: JSON.stringify(row),
		turn: JSON.stringify(next.turn),
		status: next.status,
		step: (table.step || 0) + 1,
		action: JSON.stringify(action),
	};
	if (next.winLine) update.notes = JSON.stringify(next.winLine);

	const res = await apiUpdateRow('gametable', currentGameId, update);
	if (res.success && res.row) {
		table = rowToTable(res.row);
		lastStep = table.step;
		renderGame(document.getElementById('dMain'));
	}
}

async function handleRestart() {
	if (!table || !me) return;
	const players = Object.keys(table.players);
	const fresh = createTable(players, {}, ticTacToe);
	// carry scores
	for (const name of players) {
		if (table.players[name]) fresh.players[name].score = table.players[name].score;
	}
	const row = tableToRow(fresh);
	const res = await apiUpdateRow('gametable', currentGameId, {
		fen: JSON.stringify(row),
		turn: JSON.stringify(fresh.turn),
		status: 'playing',
		step: (table.step || 0) + 1,
	});
	if (res.success && res.row) {
		table = rowToTable(res.row);
		lastStep = table.step;
		renderGame(document.getElementById('dMain'));
	}
}

// ── POLLING ────────────────────────────────────────────────────────────────

async function pollTable() {
	if (!currentGameId) return;
	const res = await apiGetTable(currentGameId);
	if (res.error) return;
	const row = res.table;
	if (!row) return;

	const newStep = row.step || 0;
	if (newStep !== lastStep) {
		table = rowToTable(row);
		lastStep = newStep;
		renderGame(document.getElementById('dMain'));
	}
}

// ── INIT ───────────────────────────────────────────────────────────────────

render();
