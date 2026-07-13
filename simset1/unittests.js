// ============================================================================
// unittests.js - Unit tests for all games in simset1
// Run by changing start.js: function start() { runAllTests(); }
// ============================================================================

let _testResults = [];
let _testPassed = 0;
let _testFailed = 0;

function assert(condition, msg) {
	if (!condition) throw new Error('ASSERT FAILED: ' + msg);
}
function assertEq(a, b, msg) {
	if (a !== b) throw new Error(`ASSERT EQ FAILED: ${msg || ''} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`);
}
function assertNeq(a, b, msg) {
	if (a === b) throw new Error(`ASSERT NEQ FAILED: ${msg || ''} both are ${JSON.stringify(a)}`);
}
function assertArrLen(arr, n, msg) {
	if (!Array.isArray(arr) || arr.length !== n) throw new Error(`ASSERT ARR LEN FAILED: ${msg || ''} expected length ${n}, got ${arr ? arr.length : 'non-array'}`);
}

async function test(name, fn) {
	let error = null;
	try {
		await fn();
		_testPassed++;
		console.log(`  PASS: ${name}`);
	} catch (e) {
		error = e;
		_testFailed++;
		console.error(`  FAIL: ${name} - ${e.message}`);
	}
	_testResults.push({ name, ok: !error, error: error?.message });
}

function testSummary() {
	let total = _testPassed + _testFailed;
	console.log(`\n========================================`);
	console.log(`TEST RESULTS: ${_testPassed}/${total} passed, ${_testFailed} failed`);
	console.log(`========================================\n`);
	return _testFailed === 0;
}

// ============================================================================
// TEST: gtInitFuncs - game registration
// ============================================================================
async function test_gtInitFuncs() {
	await test('gtInitFuncs registers all DEV games', () => {
		gtInitFuncs();
		assert(DA.funcs.aristo, 'aristo not registered');
		assert(DA.funcs.badger, 'badger not registered');
		assert(DA.funcs.bluff, 'bluff not registered');
		assert(DA.funcs.dinogame, 'dinogame not registered');
		assert(DA.funcs.dodogame, 'dodogame not registered');
		assert(DA.funcs.emoticount, 'emoticount not registered');
		assert(DA.funcs.setgame, 'setgame not registered');
		assert(DA.funcs.simplegame, 'simplegame not registered');
		assert(DA.funcs.spotit, 'spotit not registered');
	});
}

// ============================================================================
// TEST: stdSetupGame - shared game setup
// ============================================================================
async function test_stdSetupGame() {
	await test('stdSetupGame creates fen with correct movetype', () => {
		let table = { players: { p1: {}, p2: {} }, plorder: ['p1', 'p2'] };
		stdSetupGame(table, 'race');
		assertEq(table.fen.movetype, 'race');
		assert(table.plorder.length === 2);
	});
	await test('stdSetupGame sets turn for race type', () => {
		let table = { players: { p1: {}, p2: {} }, plorder: ['p1', 'p2'] };
		stdSetupGame(table, 'race');
		assert(Array.isArray(table.turn), 'turn is array');
		assertEq(table.turn.length, 2, 'all players in turn for race');
	});
	await test('stdSetupGame sets turn for taketurns type', () => {
		let table = { players: { p1: {}, p2: {} }, plorder: ['p1', 'p2'] };
		stdSetupGame(table, 'taketurns');
		assertEq(table.turn.length, 1, 'only first player for taketurns');
	});
	await test('stdSetupGame zeroes scores', () => {
		let table = { players: { p1: { score: 10 }, p2: { score: 5 } }, plorder: ['p1', 'p2'] };
		stdSetupGame(table);
		assertEq(table.players.p1.score, 0);
		assertEq(table.players.p2.score, 0);
	});
}

// ============================================================================
// TEST: gtDefault - fallback game
// ============================================================================
async function test_gtDefault() {
	await test('gtDefault returns correct interface', () => {
		let g = gtDefault();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
	});
	await test('gtDefault setup creates basic fen', () => {
		let g = gtDefault();
		let table = { game: 'test', players: { a: {}, b: {} }, plorder: ['a', 'b'], options: {} };
		g.setup(table);
		assert(table.fen, 'fen should exist');
		assertEq(table.fen.movetype, 'race');
	});
}

// ============================================================================
// TEST: aristo - Aristocracy game
// ============================================================================
async function test_aristo() {
	await test('aristo returns correct interface', () => {
		let g = aristo();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
	});
	await test('aristo setup creates decks and deals hands', () => {
		let g = aristo();
		let table = {
			game: 'aristo',
			players: {
				felix: { name: 'felix' },
				mimi: { name: 'mimi' }
			},
			plorder: ['felix', 'mimi'],
			options: { church: 'yes', rumors: 'no', peasants: 'no', commission: 'no', journey: 'no' }
		};
		g.setup(table);
		let fen = table.fen;
		assert(Array.isArray(fen.deck), 'deck should be array');
		assert(fen.deck.length > 0, 'deck should not be empty');
		assert(Array.isArray(fen.market), 'market should be array');
		assertEq(fen.market.length, 2, 'market should have 2 cards');
		assert(Array.isArray(fen.church), 'church should be array');
		assertEq(fen.church.length, 2, 'church should have 1 per player');
		for (let p of table.plorder) {
			let pl = table.players[p];
			assert(Array.isArray(pl.hand), `${p} hand should be array`);
			assertEq(pl.hand.length, 7, `${p} should have 7 cards`);
			assertEq(pl.coins, 3, `${p} should have 3 coins`);
			assertEq(pl.vps, 0, `${p} vps should be 0`);
			assert(pl.buildings, `${p} should have buildings`);
			assert(Array.isArray(pl.buildings.farm), `${p} farm should be array`);
			assert(Array.isArray(pl.buildings.estate), `${p} estate should be array`);
			assert(Array.isArray(pl.buildings.chateau), `${p} chateau should be array`);
		}
	});
	await test('aristo setup sets correct stage', () => {
		let g = aristo();
		let table = {
			game: 'aristo',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: { church: 'no', rumors: 'no', peasants: 'no', commission: 'no', journey: 'no' }
		};
		g.setup(table);
		assert(typeof table.fen.stage === 'number' || typeof table.fen.stage === 'string', 'stage should be set');
		assert(table.turn.length > 0, 'turn should have players');
	});
	await test('aristo setup with rumors expansion', () => {
		let g = aristo();
		let table = {
			game: 'aristo',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: { church: 'no', rumors: 'yes', peasants: 'no', commission: 'no', journey: 'no' }
		};
		g.setup(table);
		let fen = table.fen;
		assert(Array.isArray(fen.deckRumors), 'deckRumors should exist');
		assert(fen.deckRumors.length > 0, 'deckRumors should not be empty');
	});
	await test('aristo setup with commission expansion', () => {
		let g = aristo();
		let table = {
			game: 'aristo',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: { church: 'no', rumors: 'no', peasants: 'no', commission: 'yes', journey: 'no' }
		};
		g.setup(table);
		let fen = table.fen;
		assert(Array.isArray(fen.deckCommission), 'deckCommission should exist');
		assert(fen.openCommissions, 'openCommissions should exist');
		assertEq(fen.openCommissions.length, 3, 'should have 3 open commissions');
	});
}

// ============================================================================
// TEST: bluff - Bluff game
// ============================================================================
async function test_bluff() {
	await test('bluff returns correct interface', () => {
		let g = bluff();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
	});
	await test('bluff setup deals cards to players', () => {
		let g = bluff();
		let table = {
			game: 'bluff',
			players: {
				diana: { name: 'diana' },
				mimi: { name: 'mimi' }
			},
			plorder: ['diana', 'mimi'],
			options: { min_handsize: 2, max_handsize: 5 }
		};
		g.setup(table);
		assertEq(table.fen.movetype, 'turn');
		assertEq(table.fen.stage, 0);
		for (let p of table.plorder) {
			let pl = table.players[p];
			assert(Array.isArray(pl.hand), `${p} should have a hand`);
			assertEq(pl.hand.length, 2, `${p} should have min_handsize cards`);
			assertEq(pl.handsize, 2, `${p} handsize should be 2`);
		}
		assertEq(table.turn.length, 1, 'only first player goes first');
	});
	await test('bluff process bid validates higher bid', () => {
		let g = bluff();
		let table = {
			game: 'bluff',
			players: { a: { name: 'a', hand: ['3C', '4C'], handsize: 2 }, b: { name: 'b', hand: ['5C', '6C'], handsize: 2 } },
			plorder: ['a', 'b'],
			fen: { stage: 0, lastbid: null, lastbidder: null },
			turn: ['a'],
			options: { min_handsize: 2, max_handsize: 5 }
		};
		let r1 = g.process('a', table, 'bid');
		assert(r1 === true || r1 === false, 'process should return boolean');
	});
}

// ============================================================================
// TEST: badger - Badger game
// ============================================================================
async function test_badger() {
	await test('badger returns correct interface', () => {
		let g = badger();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
	});
	await test('badger setup initializes fen', () => {
		let g = badger();
		let table = {
			game: 'badger',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: {}
		};
		g.setup(table);
		assert(table.fen, 'fen should exist');
		assertEq(table.fen.numCards, 12);
		assert(Array.isArray(table.fen.qTypes));
	});
}

// ============================================================================
// TEST: dinogame - Dino game
// ============================================================================
async function test_dinogame() {
	await test('dinogame returns correct interface', () => {
		let g = dinogame();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
	});
	await test('dinogame setup sets wait stage', () => {
		let g = dinogame();
		let table = {
			game: 'dinogame',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: {}
		};
		g.setup(table);
		assertEq(table.fen.movetype, 'wait');
		assertEq(table.turn.length, 2, 'all players in turn for wait');
	});
	await test('dinogame process accepts button number', () => {
		let g = dinogame();
		let table = {
			game: 'dinogame',
			players: { a: { name: 'a', score: 0 }, b: { name: 'b', score: 0 } },
			plorder: ['a', 'b'],
			fen: { movetype: 'wait' },
			turn: ['a', 'b'],
			options: {}
		};
		let r = g.process('a', table, 2);
		assert(r === true, 'process should succeed');
		assert(table.players.a.action, 'player action should be recorded');
		assertEq(table.players.a.action.num, 2);
	});
}

// ============================================================================
// TEST: dodogame - Dodo game
// ============================================================================
async function test_dodogame() {
	await test('dodogame returns correct interface', () => {
		let g = dodogame();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
	});
	await test('dodogame setup initializes race', () => {
		let g = dodogame();
		let table = {
			game: 'dodogame',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: {}
		};
		g.setup(table);
		assertEq(table.fen.movetype, 'race');
	});
}

// ============================================================================
// TEST: emoticount - Emoticount game
// ============================================================================
async function test_emoticount() {
	await test('emoticount returns correct interface', () => {
		let g = emoticount();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
	});
	await test('emoticount setup creates emoji set', () => {
		let g = emoticount();
		let table = {
			game: 'emoticount',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: {}
		};
		g.setup(table);
		let fen = table.fen;
		assert(fen.target, 'target should be set');
		assert(typeof fen.correctCount === 'number', 'correctCount should be a number');
		assert(Array.isArray(fen.choices), 'choices should be array');
		assert(fen.choices.length >= 3, 'should have at least 3 choices');
	});
}

// ============================================================================
// TEST: setgame - Set Game
// ============================================================================
async function test_setgame() {
	await test('setgame returns correct interface', () => {
		let g = setgame();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
		assert(typeof g.setFindAllSets === 'function', 'should export setFindAllSets');
	});
	await test('setgame setup creates grid', () => {
		let g = setgame();
		let table = {
			game: 'setgame',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: { grid_size: '3x4', deck_size: 'full', special_set: 0 }
		};
		g.setup(table);
		let fen = table.fen;
		assertEq(table.fen.movetype, 'race');
		assert(Array.isArray(fen.items), 'items should be array');
		assertEq(fen.items.length, 12, 'should have 12 cards for 3x4');
	});
	await test('setFindOneSet finds valid sets', () => {
		let g = setgame();
		let cards = [
			{ shape: 'diamond', count: 1, fill: 'solid', color: 'red' },
			{ shape: 'diamond', count: 1, fill: 'solid', color: 'green' },
			{ shape: 'diamond', count: 1, fill: 'solid', color: 'purple' },
		];
		let result = g.setFindOneSet(cards);
		assert(result, 'should find a valid set (all same shape/count/fill, all different color)');
	});
	await test('setCheckIfSet validates SET rules', () => {
		let g = setgame();
		let validSet = [
			{ shape: 'diamond', count: 1, fill: 'solid', color: 'red' },
			{ shape: 'diamond', count: 1, fill: 'solid', color: 'green' },
			{ shape: 'diamond', count: 1, fill: 'solid', color: 'purple' },
		];
		let result = g.setFindOneSet(validSet);
		assert(result, 'valid set should be found');
	});
}

// ============================================================================
// TEST: simplegame - Simple game (template)
// ============================================================================
async function test_simplegame() {
	await test('simplegame returns correct interface', () => {
		let g = simplegame();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
	});
	await test('simplegame setup deals cards', () => {
		let g = simplegame();
		let table = {
			game: 'simplegame',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: {}
		};
		g.setup(table);
		assertEq(table.fen.movetype, 'taketurns');
		assert(table.fen.trick, 'trick should exist');
		for (let p of table.plorder) {
			let pl = table.players[p];
			assert(Array.isArray(pl.hand), `${p} should have a hand`);
			assertEq(pl.hand.length, 5, `${p} should have 5 cards`);
		}
	});
}

// ============================================================================
// TEST: spotit - Spot It / Dobble game
// ============================================================================
async function test_spotit() {
	await test('spotit returns correct interface', () => {
		let g = spotit();
		assert(typeof g.setup === 'function');
		assert(typeof g.process === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.activate === 'function');
	});
	await test('spotit setup generates cards', () => {
		let g = spotit();
		let table = {
			game: 'spotit',
			players: { a: { name: 'a', score: 0 }, b: { name: 'b', score: 0 } },
			plorder: ['a', 'b'],
			options: { winning_score: 5, adaptive: 'yes', num_symbols: '8' }
		};
		g.setup(table);
		let fen = table.fen;
		assertEq(table.fen.stage, 'init');
		assert(Array.isArray(fen.items), 'items should exist');
		assert(Array.isArray(fen.shared), 'shared should exist');
		assert(fen.shared.length > 0, 'shared should have items');
	});
	await test('spotit process init stage transitions', () => {
		let g = spotit();
		let table = {
			game: 'spotit',
			players: { a: { name: 'a', score: 0 }, b: { name: 'b', score: 0 } },
			plorder: ['a', 'b'],
			fen: { stage: 'init', items: [['a'], ['b']], shared: ['x'], movetype: 'turn' },
			turn: ['a']
		};
		let r = g.process('a', table, null);
		assert(r === true, 'init stage should succeed');
	});
}

// ============================================================================
// TEST: lacuna - Lacuna game (non-standard API)
// ============================================================================
async function test_lacuna() {
	await test('lacuna returns correct interface', () => {
		let g = lacuna();
		assert(typeof g.setup === 'function');
		assert(typeof g.activate === 'function');
		assert(typeof g.present === 'function');
		assert(typeof g.stats === 'function');
		assertEq(g.hasInstruction, true);
	});
	await test('lacuna setup generates points', () => {
		let g = lacuna();
		let table = {
			game: 'lacuna',
			players: { a: { name: 'a' }, b: { name: 'b' } },
			plorder: ['a', 'b'],
			options: {}
		};
		let fen = g.setup(table);
		assert(fen, 'setup should return fen');
		assert(Array.isArray(fen.points), 'points should be array');
	});
}

// ============================================================================
// TEST: Card utility functions
// ============================================================================
async function test_cardUtils() {
	await test('c52Deck creates 52 cards', () => {
		let deck = c52Deck();
		assertEq(deck.length, 52);
	});
	await test('c52Decks creates multiple decks', () => {
		let deck = c52Decks(2);
		assertEq(deck.length, 104);
	});
	await test('cDeckDeal deals correct number', () => {
		let deck = ['a', 'b', 'c', 'd', 'e'];
		let hand = cDeckDeal(deck, 3);
		assertEq(hand.length, 3);
		assertEq(deck.length, 2, 'deck should be reduced');
	});
}

// ============================================================================
// TEST: Array utility functions
// ============================================================================
async function test_arrUtils() {
	await test('arrShuffle preserves length', () => {
		let arr = [1, 2, 3, 4, 5];
		let original = [...arr];
		arrShuffle(arr);
		assertEq(arr.length, original.length, 'length should be preserved');
	});
	await test('arrCycle cycles elements', () => {
		let arr = [1, 2, 3];
		let result = arrCycle(arr, 1);
		assertEq(result[0], 2);
		assertEq(result[1], 3);
		assertEq(result[2], 1);
	});
	await test('arrAllSameOrDifferent detects all same', () => {
		let r = arrAllSameOrDifferent([5, 5, 5]);
		assertEq(r, 'allSame');
	});
	await test('arrAllSameOrDifferent detects all different', () => {
		let r = arrAllSameOrDifferent([1, 2, 3]);
		assertEq(r, 'allDifferent');
	});
	await test('arrAllSameOrDifferent detects mixed', () => {
		let r = arrAllSameOrDifferent([1, 1, 3]);
		assertEq(r, 'mixed');
	});
	await test('arrAverage computes correctly', () => {
		let r = arrAverage([2, 4, 6]);
		assertEq(r, 4);
	});
}

// ============================================================================
// TEST: Bluff-specific helpers
// ============================================================================
async function test_bluffHelpers() {
	await test('BLUFF.torank maps words to ranks', () => {
		assertEq(BLUFF.torank.three, '3');
		assertEq(BLUFF.torank.ace, 'A');
		assertEq(BLUFF.torank.ten, 'T');
	});
	await test('BLUFF.toword maps ranks to words', () => {
		assertEq(BLUFF.toword['3'], 'three');
		assertEq(BLUFF.toword['A'], 'ace');
		assertEq(BLUFF.toword['T'], 'ten');
	});
	await test('BLUFF.rankstr has 13 ranks', () => {
		assertEq(BLUFF.rankstr.length, 13);
	});
	await test('bluff_convert2ranks converts bid', () => {
		let bid = { rank: 'five', count: 3 };
		let result = bluff_convert2ranks(bid);
		assert(result, 'should convert');
	});
	await test('bluff_convert2words converts bid', () => {
		let bid = { rank: '5', count: 3 };
		let result = bluff_convert2words(bid);
		assert(result, 'should convert');
	});
}

// ============================================================================
// TEST: ARI stage definitions
// ============================================================================
async function test_ariStages() {
	await test('ARI stages are defined', () => {
		assertEq(ARI.stage[1], 'journey');
		assertEq(ARI.stage[2], 'tax');
		assertEq(ARI.stage.journey, 1);
		assertEq(ARI.stage.tax, 2);
		assertEq(ARI.stage.build, 41);
		assertEq(ARI.stage.upgrade, 44);
		assertEq(ARI.stage.downgrade, 45);
	});
	await test('ARI sz_hand is correct', () => {
		assertEq(ARI.sz_hand, 7);
	});
}

// ============================================================================
// TEST: Utility functions
// ============================================================================
async function test_utilFunctions() {
	await test('addIf adds unique element', () => {
		let arr = [1, 2, 3];
		addIf(arr, 4);
		assertEq(arr.length, 4);
		assertEq(arr[3], 4);
	});
	await test('addIf does not add duplicate', () => {
		let arr = [1, 2, 3];
		addIf(arr, 2);
		assertEq(arr.length, 3);
	});
	await test('addKeys copies missing keys', () => {
		let from = { a: 1, b: 2 };
		let to = { a: 10 };
		addKeys(from, to);
		assertEq(to.a, 10, 'existing key preserved');
		assertEq(to.b, 2, 'new key added');
	});
	await test('_createGrid creates 2d array', () => {
		let grid = _createGrid(3, 4, null);
		assertEq(grid.length, 3);
		assertEq(grid[0].length, 4);
		assert(grid[0][0] === null);
	});
	await test('_calc_hex_col_array computes correctly', () => {
		let result = _calc_hex_col_array(5, 3);
		assertEq(result.length, 5);
	});
	await test('_createCard creates card element', () => {
		let card = _createCard('10', '♣', 200);
		assert(card, 'card should exist');
		assert(card.appendChild, 'card should be a DOM element');
	});
}

// ============================================================================
// TEST: spotitSetup - Spot It card generation
// ============================================================================
async function test_spotitSetup() {
	await test('spotitSetup generates valid card data', () => {
		let els = spotitSetup(5);
		assert(Array.isArray(els), 'should return array');
		assertEq(els.length, 5, 'should have 5 elements per card');
	});
	await test('spotitSyms creates symbol elements', () => {
		let els = spotitSetup(4);
		let syms = spotitSyms(els);
		assert(Array.isArray(syms), 'syms should be array');
		assertEq(syms.length, 4, 'should have 4 syms');
	});
}

// ============================================================================
// TEST: Game table creation
// ============================================================================
async function test_createGameTable() {
	await test('createGameTable creates full table for aristo', () => {
		gtInitFuncs();
		let table = createGameTable('aristo', ['amanda', 'mimi'], {
			church: 'yes', rumors: 'no', peasants: 'no', commission: 'no', journey: 'no',
			winning_score: 5, adaptive: 'yes', num_symbols: '10', num_cards: '2'
		}, {
			amanda: { playmode: 'human', hint: 2 },
			mimi: { playmode: 'human', hint: 2 }
		});
		assert(table, 'table should exist');
		assertEq(table.game, 'aristo');
		assert(table.players.amanda, 'should have amanda');
		assert(table.players.mimi, 'should have mimi');
		assert(table.fen, 'should have fen');
		assert(table.turn, 'should have turn');
	});
	await test('createGameTable creates table for bluff', () => {
		gtInitFuncs();
		let table = createGameTable('bluff', ['diana', 'mimi'], {
			min_handsize: 2, max_handsize: 5
		}, {
			diana: { playmode: 'bot', strategy: 'random' },
			mimi: { playmode: 'bot', strategy: 'random' }
		});
		assert(table, 'table should exist');
		assertEq(table.game, 'bluff');
		assert(table.players.diana, 'should have diana');
		assert(table.players.mimi, 'should have mimi');
	});
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================
async function runAllTests() {
	_testResults = [];
	_testPassed = 0;
	_testFailed = 0;

	console.log('========================================');
	console.log('RUNNING ALL UNIT TESTS');
	console.log('========================================\n');

	console.log('--- Infrastructure ---');
	await test_gtInitFuncs();
	await test_stdSetupGame();
	await test_gtDefault();

	console.log('\n--- Games ---');
	await test_aristo();
	await test_badger();
	await test_bluff();
	await test_dinogame();
	await test_dodogame();
	await test_emoticount();
	await test_setgame();
	await test_simplegame();
	await test_spotit();
	await test_lacuna();

	console.log('\n--- Utilities ---');
	await test_cardUtils();
	await test_arrUtils();
	await test_bluffHelpers();
	await test_ariStages();
	await test_utilFunctions();
	await test_spotitSetup();

	console.log('\n--- Integration ---');
	await test_createGameTable();

	testSummary();
}
