onload = start;

function start() { test01(); }

async function test01() {
	let res = await apiGetGameTables();
	let games = res.tables || [];
	conslog(games[0],true);

}
async function test0() {
	render();
}
