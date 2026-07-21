onload = start; VERBOSE = false; TESTING = true; DEV = false; POLLING = true;

function start() { test0(); }

async function test01() {
	let res = await apiGetGameTables();
	let games = res.tables || [];
	conslog(games[0], true);
}

async function test0_ttt() {
	await prelim();
	initUI();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	await pollInit();
	DA.menu = 'games';
	await switchToUser('mimi');

	console.log('creating ttt game...');
	let table = createGameTable('ttt', ['amanda', 'mimi'], {
		columns: '3', rows: '3', symbols: 'XO',
	}, {
		amanda: { playmode: 'human' },
		mimi: { playmode: 'bot', strategy: 'clairvoyant' },
	});
	await tableSaveNew(table);
	DA.tid = table.id;
	DA.menu = 'table';
	await updateMain();
	console.log('ttt game created!');
}
async function test0() {
	await prelim();
	initUI();
	await postlim();
}

async function prelim() {
	await loadAssetsStaticPreload();
}
async function postlim(uname) {
	await DAInit();

	mStyle('dPage', {}, { className: 'wood' });

	await pollInit();

	await switchToUser(uname); // da wird M.users geladen!
}

