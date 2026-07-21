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
