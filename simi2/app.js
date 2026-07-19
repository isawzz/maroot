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

	container.appendChild(el("div", { fontSize: "22px", fontWeight: 500, color: "var(--text-primary)" }, null, table._logic.name));

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
