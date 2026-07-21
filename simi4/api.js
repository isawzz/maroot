// ═══════════════════════════════════════════════════════════════════════════════
// API CLIENT — one function per api.php command
// ═══════════════════════════════════════════════════════════════════════════════

let API_URL;


async function api(cmd, params = {}) {
	API_URL = await getDA('phpUrl');
	API_URL += `api.php`;

	// if (isdef(o.path) && (o.path.startsWith('zdata') || o.path.startsWith('y'))) o.path = '../../' + o.path;
	// if (VERBOSE) console.log('to php:', server + `${cmd}.php`, o);
	const res = await fetch(API_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ cmd, ...params }),
	});
	//console.log(await res.text())
	return res.json();
}

// ── YAML / FILE ────────────────────────────────────────────────────────────

async function apiSaveYaml(file, o) {
	return api('savey', { file, o });
}

async function apiDeleteYaml(file) {
	return api('deletey', { file });
}

async function apiDeleteDir(dir) {
	return api('delete_dir', { dir });
}

async function apiDir(dir) {
	return api('dir', { dir });
}

// ── IMAGE UPLOAD ───────────────────────────────────────────────────────────

async function apiUploadImage(imageFile, filename, dirname = null, savetype = 'override') {
	const fd = new FormData();
	fd.append('image', imageFile);
	fd.append('filename', filename);
	fd.append('savetype', savetype);
	if (dirname) fd.append('dirname', dirname);
	const res = await fetch(API_URL, { method: 'POST', body: fd });
	return res.json();
}

// ── READ ───────────────────────────────────────────────────────────────────

async function apiGetDatabaseTables() {
	return api('get_database_tables');
}

async function apiGetGameTables() {
	return api('get_game_tables', { table: 'gametable' });
}

async function apiGetTable(id) {
	return api('get_table', { id });
}

// ── CREATE / DELETE ────────────────────────────────────────────────────────

async function apiInsertRow(table, data) {
	return api('insert_row', { table, data });
}

async function apiDeleteRow(table, id) {
	return api('delete_row', { table, id });
}

async function apiDeleteFinished(table) {
	return api('delete_finished', { table });
}

async function apiDeleteAll(table) {
	return api('delete_all', { table });
}

async function apiDropTable(table) {
	return api('drop_table', { table });
}

// ── UPDATE ─────────────────────────────────────────────────────────────────

async function apiUpdateRow(table, id, data) {
	return api('modify_row', { table, id, data });
}

async function apiUpdateRowFO(table, id, data) {
	return api('modify_row_fo', { table, id, data });
}

async function apiUpdateRowFS(table, id, data) {
	return api('update_row_fs', { table, id, data });
}

// ── SYNC ───────────────────────────────────────────────────────────────────

async function apiUpdateGameSync(id, player_id, step, action) {
	return api('update_game_sync', { id, player_id, step, action });
}

// ── FINALIZE ───────────────────────────────────────────────────────────────

async function apiFinalizeRound(id, data) {
	return api('finalize_round', { table: 'gametable', id, data });
}
