
function aritest0_buildings(table,plName='felix'){
	let pl = table.players[plName];
	pl.buildings.farm =	[
		{list:['2Cn','2Sn','2Hn','2Cl'],h:'ASn',lead:'2Cn'},
		{list:['4Cn','4Sl','4Hn','4Sn'],h:null,lead:'4Cn'}
	];
	pl.buildings.chateau =	[
		{list:['QCn','QSn','QHn','QCl','QSn','QSl'],h:null,lead:'QCn',rumors:['QSn','4Hn'],isBlackmailed:true},
	];

}


function t23_buttons() {
	let bStyles = { bg: 'red', margin: 10 }
	// mDom('dPage', bStyles, { tag: 'button', html: 'test', onclick: onclickTest23 });
	mDom('dPage', bStyles, { tag: 'button', html: 'mod fen', onclick: wrapFunc(t23_modfen) });
	// mDom('dPage', bStyles, { tag: 'button', html: 'clear', onclick: () => mClear('dTable') });
	mDom('dPage', bStyles, { tag: 'button', html: 'STOP!', onclick: wrapFunc(() => console.log('INTERRUPT!')) });

}
function t23_createTable() {
	let deck = c52Deck();
	let hand = ['KS', '2C', '3C']; //, '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC', 'AC', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH'];
	let table = T = { deck, hand };
}
function t23_present(ev) {
	if (ev) { ev.stopPropagation(); ev.preventDefault(); } clearEvents();

	mClear('dTable');
	let dDeck = mDom('dTable', {}, { id: 'dDeck' });
	let dHand = mDom('dTable', {}, { id: 'dHand' });

	let uDeckCards = T.deck.map(key => uiTypeCard52(key, 150));
	let uHandCards = T.hand.map(key => uiTypeCard52(key, 150));

	let uDeck = drawDeck(uDeckCards, 'dDeck', 'up');
	let gHand = cSplay(uHandCards, 'dHand', 'right');

	UI = { deck: { cards: uDeckCards, div: 'dDeck' }, hand: { cards: uHandCards, div: 'dHand', dg: gHand } };
}
function t23_modfen(ev) {
	if (ev) { ev.stopPropagation(); ev.preventDefault(); } clearEvents();
	let x = T.deck.pop();
	//console.log(T.deck, x)
	T.hand.push(x);
	t23_present();
}
function t25_activate() {
	let top = arrLast(UI.deck.cards);
	let newParent = UI.hand.dg;
	top.div.onclick = fInterruptable(cMove, top, newParent, ()=>{t23_modfen();t25_activate();});

}
function t23_doAnimation(ms = 1000, callback = null) {
	let child = arrLast(UI.deck.cards).div;
	let val = child.style.zIndex;
	mStyle(child, { z: 10000 })
	let newParent = UI.hand.dg;
	let [dx, dy] = screenDistance(child, newParent);
	let a = ANIM.cards = mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px)`], callback, ms, 'ease-in');
	a.oncancel = () => mStyle(child, { z: val });
	return a;

}
function aw23_doAnimation(ms = 1000) {
	return new Promise((resolve) => {
		let child = arrLast(UI.deck.cards).div;
		let oldZ = child.style.zIndex; // Save original z-index

		// 1. Prepare for flight
		mStyle(child, { z: 10000 });
		let newParent = UI.hand.dg;
		let [dx, dy] = screenDistance(child, newParent);

		// 2. Define the cleanup/completion logic
		const finalize = () => {
			// Restore z-index (or leave it for the hand logic to handle)
			mStyle(child, { z: oldZ });
			resolve(true); // This tells 'await' the animation is done
		};

		// 3. Start the animation
		let a = ANIM.cards = mAnimate(
			child,
			'transform',
			[`translateX(${dx}px) translateY(${dy}px)`],
			finalize, // Using finalize as the callback
			ms,
			'ease-in'
		);

		// 4. Handle cancellation (e.g., UI reset)
		a.oncancel = () => {
			mStyle(child, { z: oldZ });
			resolve(false); // Resolve anyway so the code doesn't hang
		};
	});
}

//#region old tests
async function test0_old() {
	await loadAssetsStatic(); console.log(M);
	let files = await mGetFilenames('tables'); console.log('files', files);
	let [dTop, dMain] = mLayoutTM('dPage');
	mStyle('dMain', { overy: 'auto', padding: 0 }); //,grid: '1fr / 1fr', gap: 10, padding: 10 });
	let d = mDom(dMain, { gap: 10, padding: 10, bg: 'red', wrap: true });  //,{className:'flex0'}); mFlex(d) //, { padding:10,flex:'center center row', wrap:true});//display: 'grid', gridCols: 2,gap:10, padding:10, bg: rColor() });
	mClass(d, 'flexCC')
	for (const i of range(10)) {
		showObject(DA, null, d, { bg: rColor() });
	}
}
async function test0_0() {
	await DAInit();
	await switchToUser('mac');
	await switchToMenu('settings');
	let dParent = 'dMain';
	mClear(dParent);
	let list = await getTextureFiles(['texrepeat', 'texwall']);
	let d0 = dParent;
	let d = dParent;
	let n = 14, wcell = 29;
	let w = n * wcell, h = w * 0.65;
	let itemsTexture = [];
	mStyle(dParent, { overy: 'auto' })
	for (const o of list) {
		let bg = rColor();
		let url = `../assets/${o.dir}/${o.file}`;
		let bgImage = `url('${url}')`;
		let bgSize, bgRepeat, bgBlend;
		switch (o.dir) {
			case 'textures':
			case 'textures3':
			case 'tcontain':
			case 'texwall': bgSize = '100% 100%'; bgRepeat = 'no-repeat'; bgBlend = 'luminosity'; break;
			case 'tnew':
			case 'trepeat':
			case 'texrepeat': let nums = getAppendedNumbers(stringBeforeLast(o.file, '.')); bgSize = nums.length == 2 ? `${nums[0]}px ${nums[1]}px` : 'auto'; bgRepeat = 'repeat'; bgBlend = 'normal'; break;
		}
		let d0 = mDom(d, { margin: 10, w }, { className: 'ellipsis', html: `<b>${bgRepeat == 'repeat' ? 'R' : ''} ${o.file} ${bgBlend}</b>` });
		let dc = mDom(d0, { w, h, bg, bgImage, bgSize, bgRepeat, bgBlend, cursor: 'pointer', border: 'white' });
		dc.style.backgroundPosition = 'center';
		let item = { div: dc, path: url, bgImage, bgRepeat, bgSize, bgBlend, isSelected: false };
		itemsTexture.push(item);
		dc.onclick = async () => { await onclickTexture(item, itemsTexture); await test0_compare(); };
		await createItemPalette(d0, url, bgBlend, bg, n, bgSize, bgRepeat, o, w, h);
	}
}
async function test0_badger_emo() {
	await DAInit();
	console.log(M)
	let list = M.byType.emo;
	list = list.filter(x => M.byCat.animal.includes(x))
	console.log(list.length);
	let sets = { unique: {}, mostFrequent: {}, alphaFirst: {}, alphaLast: {}, oddMan: {} };
	let list1 = rChoose(list, 12);
	console.log(list1);
	let d = mGrid(3, 3, 'dPage', { gap: 20, patop: 20 });
	let items = [];
	for (let x of list1) {
		let bg = rColor(); let fg = colorIdealText(bg);
		let label = fromNormalized(x);
		let d1 = mKey1(x, d, { patop: 20, fz: 80, h: 140, w: 180, fg: 'grey', align: 'center', bg, fg }, { prefer: 'emo', label });
		items.push({ div: d1, key: x, o: M.superdi[x] })
	}
	console.log(items)
}
async function test0_badger_emo_grid() {
	await DAInit();
	let list = M.byType.emo;
	list = list.filter(x => M.byCat.animal.includes(x));
	let n = 18;
	list = rChoose(list, n);
	console.log(list);
	let dParent = mDom(dPage, { w: 500, h: 400 });
	let items = mFit(list, dParent);
	console.log(items);
}
async function test0_badger_setup() {
	await DAInit();
	let table = { fen: {} };
	let fen = table.fen;
	fen.listType = M.byType.emo;
	fen.listYes = fen.listType.filter(x => M.byCat.animal.includes(x));
	fen.listNo = fen.listType.filter(x => M.byCat.transport.includes(x));
	fen.numCards = 12;
	fen.qTypes = ['oddman', 'unique', 'frequent', 'alpha'];
	fen.set = createUniqueSet(fen.listYes, fen.numCards);
	console.log(fen.set);
	fen.set = createOddManSet(fen.listYes, fen.listNo, fen.numCards);
	console.log(fen.set);
	fen.set = createFrequentSet(fen.listYes, fen.numCards);
	console.log(fen.set);
}
async function test0_bluff() {
	await DAInit();
	let dTable = mDom('dPage', { gap: 10 }); mCenterFlex(dTable);
	let t0, t1;
	t0 = showTimeSince();
	for (const key of ['2H', '3H', '4H', '5H', '6H', '7H', '8S', '9H', 'TH', 'JH', 'QH', 'KH', 'AH', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC']) {
		let svg = renderCard(key, 'red', 'grey', 'white');
		mDom(dTable, { w: 100, h: 140 }, { html: svg });
	}
	t1 = showTimeSince(t0);
	mLinebreak(dTable);
	t0 = showTimeSince();
	for (const key of ['2H', '3H', '4H', '5H', '6H', '7H', '8S', '9H', 'TH', 'JH', 'QH', 'KH', 'AH', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC']) {
		let svg = jsCopy(M.c52[`card_${key}`]);
		mDom(dTable, { w: 100, h: 140 }, { html: svg });
	}
	t1 = showTimeSince(t0);
	mLinebreak(dTable);
	t0 = showTimeSince();
	for (const key of ['2H', '3H', '4H', '5H', '6H', '7H', '8S', '9H', 'TH', 'JH', 'QH', 'KH', 'AH', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC']) {
		let svg = renderCard(key, 'green', 'green', 'white');
		mDom(dTable, { w: 100, h: 140 }, { html: svg });
	}
	t1 = showTimeSince(t0);
	mLinebreak(dTable);
	mTimerCreate(dTable, 5000, 's', x => console.log(x));
}
async function test0_compare() {
	await DAInit();
	await switchToUser();
	let list = await getTextureFiles(['texrepeat', 'texwall']);
	let d0 = 'dMain';
	let d = mDom(d0, { fg: 'black', display: 'flex', flexWrap: 'wrap', gap: 5 });
	let n = 14, wcell = 29;
	let w = n * wcell, h = w * 0.65;
	let itemsTexture = [];
	for (const o of list) {
		let bg = rColor();
		let url = `../assets/${o.dir}/${o.file}`;
		let bgImage = `url('${url}')`;
		let bgSize, bgRepeat, bgBlend;
		switch (o.dir) {
			case 'textures':
			case 'textures3':
			case 'tcontain':
			case 'texwall': bgSize = '100% 100%'; bgRepeat = 'no-repeat'; bgBlend = 'luminosity'; break;
			case 'tnew':
			case 'trepeat':
			case 'texrepeat': let nums = getAppendedNumbers(stringBeforeLast(o.file, '.')); bgSize = nums.length == 2 ? `${nums[0]}px ${nums[1]}px` : 'auto'; bgRepeat = 'repeat'; bgBlend = 'normal'; break;
		}
		let d0 = mDom(d, { margin: 10, w }, { className: 'ellipsis', html: `<b>${bgRepeat == 'repeat' ? 'R' : ''} ${o.file} ${bgBlend}</b>` });
		let dc = mDom(d0, { w, h, bg, bgImage, bgSize, bgRepeat, bgBlend, cursor: 'pointer', border: 'white' });
		dc.style.backgroundPosition = 'center';
		let item = { div: dc, path: url, bgImage, bgRepeat, bgSize, bgBlend, isSelected: false };
		itemsTexture.push(item);
		dc.onclick = async () => { await onclickTexture(item, itemsTexture); await test0_compare(); };
		await createItemPalette(d0, url, bgBlend, bg, n, bgSize, bgRepeat, o, w, h);
	}
}
async function test0_norm() {
	await DAInit();
	await switchToUser();
	DA.menu = localStorage.getItem('menu') || 'games';
	pollInit();
	if (DA.menu == 'table') {
		await reloadTables();
	}
	await switchToMenu();
	let d = mBy('dSettings');
	console.log(d);
	while (d) {
		mStyle(d, { margin: 0, padding: 0, overy: 'auto', overx: 'hidden', overflow: 'auto' });
		d = d.parentNode;
	}
	mStyle('dTextures', { overy: 'scroll' })
}
async function test0_test0() {
	await DAInit();
	await switchToUser('mac');
	await switchToMenu('settings');
	pollInit();
	setOverflowTo('auto', 'dSettings')
	let d = mBy('dSettings');
	console.log(d);
	while (d != document.body) {
		let st = mGetStyle(d, 'overflow-x');
		console.log(d, st);
		d = d.parentNode;
	}
	mStyle('dTextures', { overy: 'scroll' })
}
function test1_old(map) {
	var baseballIcon = L.icon({
		iconUrl: '../leaf94/baseball-marker.png',
		iconSize: [32, 37],
		iconAnchor: [16, 37],
		popupAnchor: [0, -28]
	});
	function onEachFeature(feature, layer) {
		var popupContent = '<p>I started out as a GeoJSON ' +
			feature.geometry.type + ", but now I'm a Leaflet vector!</p>";
		if (feature.properties && feature.properties.popupContent) {
			popupContent += feature.properties.popupContent;
		}
		layer.bindPopup(popupContent);
	}
	var bicycleRentalLayer = L.geoJSON([bicycleRental, campus], {
		style: function (feature) {
			return feature.properties && feature.properties.style;
		},
		onEachFeature: onEachFeature,
		pointToLayer: function (feature, latlng) {
			return L.circleMarker(latlng, {
				radius: 8,
				fillColor: '#ff7800',
				color: '#000',
				weight: 1,
				opacity: 1,
				fillOpacity: 0.8
			});
		}
	}).addTo(map);
	var freeBusLayer = L.geoJSON(freeBus, {
		filter: function (feature, layer) {
			if (feature.properties) {
				return feature.properties.underConstruction !== undefined ? !feature.properties.underConstruction : true;
			}
			return false;
		},
		onEachFeature: onEachFeature
	}).addTo(map);
	var coorsLayer = L.geoJSON(coorsField, {
		pointToLayer: function (feature, latlng) {
			return L.marker(latlng, { icon: baseballIcon });
		},
		onEachFeature: onEachFeature
	}).addTo(map);
}
async function test1_nopolling() {
	await DAInit();
	initUI(); await switchToUser('mimi'); await switchToMenu('games')
}
function testCartesianFunctions() {
	const data = [
		{ x: "a", y: 1 },
		{ x: "a", y: 2 },
		{ x: "b", y: 1 },
		{ x: "b", y: 2 }
	];
	const [keys, compact] = cartesianContract(data);
	const expanded = cartesianExpand(keys, compact);
	return {
		compact: [keys, compact],
		expanded: expanded
	};
}
async function testFlask() {
	let res = await pyStartGame('tictactoe', ['felix', 'amanda'], {});
	console.log('res', res);
	res = await getAllTables();
	console.log('res', res);
}
function testHelpers() {
	if (activatedTests.includes('helpers')) {
		console.log(...arguments);
	}
}
function testMouseMove(ev, pixelsByPair, ctx) {
	const mouseX = ev.clientX;
	const mouseY = ev.clientY;
	const highlightRadius = 5;
	let found = false;
	for (let i = 0; i < pixelsByPair.length; i++) {
		const pair = pixelsByPair[i];
		for (let j = 0; j < pair.pixels.length; j++) {
			const pixel = pair.pixels[j];
			const dx = mouseX - pixel.x;
			const dy = mouseY - pixel.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			if (distance < highlightRadius) {
				ctx.fillStyle = 'red';
				ctx.beginPath();
				ctx.arc(pair.x1, pair.y1, 5, 0, 2 * Math.PI);
				ctx.fill();
				ctx.beginPath();
				ctx.arc(pair.x2, pair.y2, 5, 0, 2 * Math.PI);
				ctx.fill();
				found = true;
				break;
			}
		}
		if (found) break;
	}
	if (!found) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	}
}
async function testOnclickBot(ev) {
	for (const b of [UI.bTestBot, UI.bTestHuman, UI.bTestHybrid]) {
		if (isdef(b)) mStyle(b, { bg: 'silver', fg: 'black' });
	}
	mStyle(UI.bTestBot, { bg: 'red', fg: 'white' });
	await onclickBot();
}
async function testOnclickHuman(ev) {
	for (const b of [UI.bTestBot, UI.bTestHuman, UI.bTestHybrid]) {
		if (isdef(b)) mStyle(b, { bg: 'silver', fg: 'black' });
	}
	mStyle(UI.bTestHuman, { bg: 'red', fg: 'white' });
	await onclickHuman();
}
async function testOnclickHybrid(ev) {
	for (const b of [UI.bTestBot, UI.bTestHuman, UI.bTestHybrid]) {
		if (isdef(b)) mStyle(b, { bg: 'silver', fg: 'black' });
	}
	mStyle(UI.bTestHybrid, { bg: 'red', fg: 'white' });
	await onclickHybrid();
}
async function testOnclickPlaymode(ev) {
	let b = UI.bPlaymode;
	let caption = b.innerHTML;
	if (caption.includes('human')) await onclickHuman();
	else await onclickBot();
}
async function test_createUniqueSet() {
	let keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
	let res = createUniqueSet(keys, 12);
	console.log(res);
}
async function test_divideNumber() {
	let nums = [3, 2, 4];
	let keys = ['a', 'b', 'c', 'd', 'e'];
	console.log(divideNumberRandomly(11, nums));
	let res = assignKeywordsByCounts(nums, keys);
	console.log(nums, res);
}
async function test_svg_card_faces() {
	await loadAssetsStaticPreload();

	await DAInit();
	let dParent = mDom('dPage', { gap: 10 }); mFlex(dParent);
	for (const l1 of ['S', 'H', 'D', 'C']) {
		for (const l2 of ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']) {
			let svg = getCardFaceSvg('HQ'); //l1+l2);  
			let h = 200, w = h * .7;
			let d = mDom(dParent, { w, h }, { html: svg });
			return;
		}
	}
}
async function testcard0() {
	await DAInit();
	let dTable = mDom('dPage', { gap: 10 }); mFlex(dTable);
	let ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	let suits = ['♠', '♥', '♦', '♣', '⭐️',];
	let keys = M.byType.emo;
	for (const i of range(20)) {
		let rank = rChoose(ranks);
		let suit = rChoose(keys);
		let o = M.superdi[suit];
		suit = o.emo;
		let family = 'emoNoto';
		let color = rColor();
		let c = createCustomCard(rank, suit, family, color, 100);
		console.log(c)
		let d = mDom(dTable);
		mAppend(d, c)
	}
}
async function testcard1() {
	await DAInit();
	injectCardSymbols();
	mStyle('dPage', { display: 'flex' });
	createDeckSymbols();
	dPage.appendChild(useCard("J", "♠"));
	dPage.appendChild(useCard("Q", "♠"));
	dPage.appendChild(useCard("K", "♠"));
	dPage.appendChild(useCard("12", "♥"));
	dPage.appendChild(useCard("13", "♦"));
	dPage.appendChild(useCard("14", "♦"));
	dPage.appendChild(useCard("K", "♦")); return;
	let svg = M.c52.card_KS;
	mDom('dPage', { h: 200 }, { html: svg });
	mLinebreak('dPage')
}
async function testcard2() {
	let d = mDom('dPage', {}, {
		html: `<svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="
        M100 20 
        L80 50 L120 50 Z 
        M85 50 
        C70 50, 60 70, 60 85 
        S70 110, 100 110 
        S140 100, 140 85 
        S130 50, 115 50 
        L100 50 Z 
        M100 65 
        C90 65, 85 70, 85 75 
        S90 85, 100 85 
        S115 75, 115 70 
        S110 65, 100 65 Z 
        M100 20 
        C95 10, 85 15, 85 25 
        S90 35, 100 35 
        S110 35, 115 25 
        S105 10, 100 20 Z 
        M70 110 L130 110 L130 130 L70 130 Z
      " stroke="black" stroke-width="3" fill="white"/>
    </svg>`});
}
async function testcard3() {
	await DAInit();
	injectCardSymbols();
	mStyle('dPage', { display: 'flex' });
	mDom('dPage', { h: 200, w: 100 }, { html: getJ1() });
}
async function testdb0() {
	let res = await fetch("http://localhost/maroot/swl99/php/dbtest1.php");
	let text = await res.text();
	console.log(text);
}
async function testdb1() {
	let res = await fetch("http://localhost/maroot/swl99/php/db_api.php");
	let text = await res.json();
	console.log(text);
}
async function testdb2() {
	let res = await dbGetDatabaseTables("gametable");
	console.log(res);
}
async function testdb3() {
	let res = await dbAddNewGameTable();
	console.log(res);
	await testdb2();
}
async function testdb4_delete() {
	let res = await dbGetGameTables();
	console.log(res);
	if (isEmpty(res)) { console.log('database is empty!!!'); return; }
	let id = rChoose(res.map(x => x.id));
	res = await dbDeleteGameTable(id);
	console.log(res);
}
async function testdb4_delete_add() {
	await DAInit();
	initUI(); await switchToUser('mimi'); await switchToMenu('games')
	let res = await dbGetGameTables();
	console.log(res);
	if (isEmpty(res)) {
		console.log('database is empty!!!');
		let table = tableCreate();
		gtSetToStarted(table);
		let res = await tableSaveNew(table);
		console.log(res);
		DA.tid = table.id;
		await switchToMenu('table');
	} else {
		let id = rChoose(res.map(x => x.id));
		res = await dbDeleteGameTable(id);
		console.log(res);
	}
}
async function testg() {
	await DAInit();
	let d = mDom('dPage')
	let x = gSvg(); console.log(x);
	let x1 = gShape(); console.log(x1);
	mAppend(x, x1);
	mAppend(d, x); console.log(d)
}
//endregion

//#region rest
async function onclickTest23() {
	mTranslate(top.div, grid);
	//mAnimateTo(top.div,)
}

async function onclickTest22() {
	mClear('dDeck');
	mClear('dHand');

	await mSleep(1000)
	let uDeck = T.deck.map(key => uiTypeCard52(key, 150));
	let uHand = T.hand.map(key => uiTypeCard52(key, 150));

	let gDeck = cSplayDiagonal(uDeck.slice(0, 10), 'dDeck', 0.008);
	let gHand = cSplay(uHand, 'dHand', 'right');

}

//#endregion

//#region for later
function ui2Table(ui, table) {
	//eg church objects
	console.log(ui, table);
	let path = ui.path;

}
function table2UI(table, ui) { }
//#endregion

async function createAristoTable(playerNames, options = {}) {
	if (nundef(playerNames)) playerNames = ['mimi', 'felix'];

	let defaults = M.config.games.aristo.options;
	//console.log('defaults', defaults);
	if (defaults) {
		for (const k in defaults) {
			if (nundef(options[k])) {
				let val = defaults[k];
				if (isString(val) && val.includes(',')) { val = val.split(','); val = val[val.length - 1].trim(); }
				options[k] = isNumber(val) ? Number(val) : val;
			}
		}
	}
	//console.log(options)
	let players = {};
	for (const name of playerNames.sort()) {
		players[name] = userToPlayer(name, 'aristo');
	}

	let table = tableCreate('aristo', players, options);
	gtSetToStarted(table);
	return table;
}
async function tableGetByFriendly(friendly) {
	let tables = await dbGetGameTables();
	let table = tables.find(t => t.friendly == friendly);
	return table;
}
async function clickAndWaitForUI(target) {
	const element = typeof target === 'string'
		? document.querySelector(target)
		: target;

	if (!element) {
		throw new Error("Element not found");
	}

	element.click();

	// Return a promise that resolves after the next browser paint
	return new Promise((resolve) => {
		requestAnimationFrame(() => {
			requestAnimationFrame(resolve);
		});
	});
}
async function switchToOtherUser(uname1, uname2) {
	if (nundef(uname1)) { uname1 = 'mimi'; uname2 = 'felix'; }
	await mSleep(rChoose(range(0, 500)));
	let username = localStorage.getItem('username') || 'guest';
	if (username == uname1) username = uname2; else username = uname1;
	await switchToUser(username);
}
async function switchToNextUser(me, table) {
	let names = jsCopy(table.turn);
	console.log('switching to other user', names);
	if (names.length <= 1) return;
	let next = names[(names.indexOf(me) + 1) % names.length];
	await switchToUser(next);
}

async function automove() {
	let table = DA.tableDict[DA.tid];
	let me = U.name;
	let pl = table.players[me];
	//console.log('automove for', U.name, 'in table', table.friendly);

	for (let i = 0; i < DA.selectMin; i++) {
		let item = DA.selectItems[i];

		// Usage:
		await clickAndWaitForUI(item);
		//console.log("The UI has officially updated.");
	}
	let commitButton = mBy('bCommit');
	await clickAndWaitForUI(commitButton);


	let names = Object.keys(table.players);
	console.log('switching to other user', names);
	await switchToNextUser(me, table);
	console.log(U.name, 'should now be the player');



}
async function saveTestTables() {
	if (isdef(DA.t1)) await tableSaveUpdate(DA.t1);
	if (isdef(DA.ttest)) await tableSaveUpdate(DA.ttest);
	await updateMain();

}
async function createOneTable() {
	let table = DA.t1 = await createAristoTable(['felix', 'mimi']); //, { rumors: 'no', commission:'no', church: 'no' ,journey: 'no',peasants:'no' } );
	await tableSaveNew(table);
	DA.tid = table.id;
	DA.menu = 'table';
	updateMain();

}
async function createTables() {
	let friendly = await createNewTable();
	let t1 = await tableGetByFriendly(friendly);
	await createTestTable(friendly);
	let ttest = await tableGetByFriendly("test_comm_exchange");
	return [t1, ttest];
}
async function createTestTable(friendly) {
	await deleteTableIfFriendlyExists('test_comm_exchange')
	let table1 = jsCopy(await tableGetByFriendly(friendly));
	table1.friendly = 'test_comm_exchange';
	delete table1.id;
	DA.table1 = table1;
	await tableSaveNew(table1);
}
async function createNewTable() {
	let table = await createAristoTable(['mimi', 'felix']);
	await tableSaveNew(table);
	return table.friendly;
}
async function deleteTableIfFriendlyExists(friendly) {
	let table = await tableGetByFriendly(friendly);
	if (table) {
		await dbDeleteGameTable(table.id);
		//console.log(`deleted table ${friendly}`);
	}
}
async function onclickCompare() {
	console.log('_____', DA)
	let t1 = await tableGetByFriendly(DA.friendly1);
	let ttest = await tableGetByFriendly(DA.friendly2);
	let diff = deepCompare(t1, ttest);
	console.log('deepCompare result:', diff);
	for (const plName of t1.plorder) {
		console.log(`${plName} - t1:`, t1.players[plName].commissions);
		console.log(`${plName} test:`, ttest.players[plName].commissions);
	}

	//load a table that is already saved
}
async function ___dbDeleteAllTables() {
	let tables = await dbGetGameTables();
	for (const t of tables) {
		await dbDeleteGameTable(t.id);
	}
	//console.log(`deleted ${tables.length} tables`);
	DA.tid = null;
	DA.menu = 'games';
	localStorage.removeItem('tid');
	await updateMain();
}
function showTestButtons(d = 'dLeft') {

	//	let d = mBy('dLeft1');  //mClass(d, 'button_container'); //mFlex(d);

	mStyle(d, { w: 140, bg: 'grey' })
	let bstyles = { h: 30, w: 128, matop: 6, maleft: 6, align: 'center', padding: 0, fz: 12 }; //{margin:'auto',display:'inline',box:true,w:'90%',fz:12};
	mDom(d, bstyles, { tag: 'button', html: 'delete all', onclick: dbDeleteAllTables });
	mDom(d, bstyles, { tag: 'button', html: 'CREATE', onclick: createOneTable });
	mLinebreak(d, 6);
	mDom(d, bstyles, { tag: 'button', html: 'MOVE', onclick: async () => await automove() });
	mLinebreak(d, 6);

	mDom(d, bstyles, { tag: 'button', html: 'create 2', onclick: startTestCreateTables });
	mDom(d, bstyles, { tag: 'button', html: 'compare', onclick: onclickCompare });
	mDom(d, bstyles, { tag: 'button', html: 'doExchange', onclick: doExchange });
	mDom(d, bstyles, { tag: 'button', html: 'skipToCommEnd', onclick: skipToCommissionEnd });
	return;

	d = mBy('dTestLeft');
	let bPollNow = mDom(d, {}, { tag: 'button', html: 'poll', onclick: onclickPoll, id: 'bPollNow' });
	let bPollToggle = mDom(d, {}, { tag: 'button', html: 'polling', id: 'bPollToggle', onclick: onclickPollToggle });
	DA.pollMode = 'manual';
	pollSetState(DA.pollStates[DA.menu]['OFF']);

	d = mBy('dTestRight'); mClass(d, 'button_container'); //mFlex(d);
	faButton(d, DEV ? 'angles_up' : 'angles_down', {}, { onclick: toggleDevmode });
	let names = ['gul', 'amanda', 'felix', 'lauren', 'mimi'];
	for (const name of names) {
		let b = mDom(d, {}, { tag: 'button', html: name, onclick: async (ev) => await switchToUser(name) });
	}
	d = mBy('dTestLeft');
	mClass(d, 'button_container');
	mDom(d, {}, { tag: 'button', html: 'delete all', onclick: dbDeleteAllTables });
	let key = 'arrow_rotate_right';
	let b = mKey(key, d, { fz: 22, }, { prefer: 'fa6', tag: 'button', onclick: onclickReload });


}
function show_polling_signal() {
	let d1 = mDiv(mBy('dMenu'), { position: 'fixed', top: 10, left: 273 });
	let bg = 'green'; //Z.skip_presentation == true ? 'grey' : 'green'; //valf(DA.reloadColor, 'green')
	let d2 = mDiv(d1, { width: 20, height: 20, bg: bg, rounding: 10, display: 'inline-block' });
	mFadeRemove(d1, 300);
}

async function startTestCreateTables() {
	let [t1, ttest] = [DA.t1, DA.ttest] = await createTables();
	DA.tid = t1.id;
	DA.friendly1 = t1.friendly;
	DA.friendly2 = 'test_comm_exchange';
	await switchToMenu('table');

}
async function clickLowestCommisionItem(table) {
	let ui = mBy('d' + U.name);
	let items = ui_get_all_commission_items(table.players(U.name), table);
}
async function doExchange() {
	DA.ttest = aritest0_exchange_commissions(DA.ttest);
	await saveTestTables();
	return DA.ttest;
}
async function skipToCommissionEnd() {
	DA.t1.fen.commSetupNum = 1;
	if (isdef(DA.ttest)) {
		DA.ttest.fen.commSetupNum = 1;
		DA.ttest = aritest0_exchange_commissions(DA.ttest);
	}
	await saveTestTables();
}
function aritest0_exchange_commissions(table) {
	const rankstr = 'A23456789TJQK';
	let fen = table.fen;
	let n = fen.commSetupNum;
	let plorder = table.plorder;
	let passed = {};
	for (const name of plorder) {
		let pl = table.players[name];
		let cards = cSort(jsCopy(pl.commissions), null, rankstr).slice(0, n);
		passed[name] = cards;
		for (const c of cards) removeInPlace(pl.commissions, c);
	}
	for (let i = 0; i < plorder.length; i++) {
		let name = plorder[i];
		let next = plorder[(i + 1) % plorder.length];
		table.players[next].commissions.push(...passed[name]);
	}
	table.players.mimi.commissions = cSort(table.players.mimi.commissions, null, rankstr);
	table.players.felix.commissions = cSort(table.players.felix.commissions, null, rankstr);
	table.players.mimi.hand = cSort(table.players.mimi.hand, null, rankstr);
	table.players.felix.hand = cSort(table.players.felix.hand, null, rankstr);
	table.turn = table.turn.sort();
	table.fen.commSetupNum = n - 1;

	return table;
}
