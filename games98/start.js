onload = start; VERBOSE = false; TESTING = true; DEV = false;

function start() { test26_simpleGame(); }

function ttest113() {
	document.body.innerHTML = '';
	const width = 800; //window.innerWidth;
	const height = 800; //window.innerHeight;
	const numPoints = 100;

	const points = Array.from({ length: numPoints }, () => [
		Math.random() * width,
		Math.random() * height,
	]);

	const delaunay = d3.Delaunay.from(points);
	const voronoi = delaunay.voronoi([10, 10, width - 10, height - 10]); console.log(voronoi)

	// Store tile divs so we can access by index
	const tileDivs = [];

	for (let i = 0; i < points.length; i++) {
		const polygon = voronoi.cellPolygon(i); //console.log(polygon)
		if (!polygon) continue;

		const div = document.createElement('div');
		div.className = 'tile';

		const clip = polygon.map((p) => `${p[0]}px ${p[1]}px`).join(', ');
		div.style.clipPath = `polygon(${clip})`;

		const hue = Math.floor(Math.random() * 360);
		div.style.backgroundColor = `hsl(${hue}, 60%, 60%)`;

		document.body.appendChild(div);
		tileDivs[i] = div;
	}

	// Add hover listeners to highlight neighbors
	tileDivs.forEach((div, i) => {
		div.addEventListener('mouseenter', () => {

			// Highlight hovered tile
			//div.classList.add('highlighted');

			// Highlight neighbors
			for (const neighborIndex of delaunay.neighbors(i)) {
				if (tileDivs[neighborIndex]) {
					tileDivs[neighborIndex].classList.add('highlighted');
				}
			}
		});

		div.addEventListener('mouseleave', () => {
			// Remove highlight from hovered tile
			div.classList.remove('highlighted');

			// Remove highlight from neighbors
			for (const neighborIndex of delaunay.neighbors(i)) {
				if (tileDivs[neighborIndex]) {
					tileDivs[neighborIndex].classList.remove('highlighted');
				}
			}
		});
	});

}
function ttest112() {
	let margin = 0.05;
	const options = {
		function: planeFunction, u_range: [margin, 1 - margin], v_range: [margin / 2, 1 - margin / 2], adaptor_class: SvgAdaptor,
		u_num: 4,
		v_num: 4,
		u_cyclic: false,
		v_cyclic: false,
		// wrap_u: false,
		// wrap_v: false, 
		color_pattern: 3, svg_fill_colors: ['#264653', '#ce2323', '#e9c46a', 'yellow'],
	};
	// const tessagon = new SimpleBoundaryTessagon(options);	//console.log(tessagon); return;
	const tessagon = new Simple2Tessagon(options);	//console.log(tessagon); return;
	const { mesh, svg } = tessagon.create_mesh(); //logVerts(mesh.vert_list); //return;
	let d = mDom('dPage', { margin: 20, display: 'inline-block' });
	//let svgCode = drawTessagonVertices(tessagon, 500, 500, radius = 13);
	let svgCode = exportTessagonToSVGPlusTiles(tessagon, 700, 700, options.svg_fill_colors);	//console.log(svgCode);
	//let svgCode = wrapGElements(svg, 'hallo', 'green');	//console.log(svgCode);
	let el = mCreateFrom(svgCode);	//console.log(el);
	mAppend(d, el);

	const neighbors = getFaceNeighborsAll(mesh.face_list); console.log(neighbors)
	attachHoverHighlight(el, neighbors)
}
function ttest111() {
	let margin = 0.05;
	Counter = 0;
	const options = {
		function: planeFunction,
		u_range: [margin, 1 - margin], // [0.05, 0.95]
		v_range: [margin / 2, 1 - margin / 2], // [0.05, 0.95]		
		u_num: 3,
		v_num: 3,
		u_cyclic: false,
		v_cyclic: false,
		// wrap_u: false,
		// wrap_v: false, 
		color_pattern: 0,
		svg_fill_colors: ['#264653', '#6e2323', '#e9c46a'],
		adaptor_class: SvgAdaptor //mesh IS the svg
	};

	const tessagon = new HexTessagon(options);	//console.log(tessagon); return;
	const { mesh, svg } = tessagon.create_mesh(); console.log('mesh', mesh);


	let d = mDom('dPage', { margin: 20, display: 'inline-block' });
	//let svgCode = drawTessagonVertices(tessagon, 500, 500, radius = 13);
	let svgCode = exportTessagonToSVG(tessagon, 500, 500);	//console.log(svgCode);
	let el = mCreateFrom(svgCode);	//console.log(el);
	mAppend(d, el);
	//attachHoverHighlight(el, neighbors);
}

async function test27_orbit() {
	//let dp=mDom('dPage',{display:'flex',padding:10,bg:'green'})
	let d = mDom('dPage', { bg: 'green' }, { id: 'dOrbit' });
	let { w, h } = displayOrbitCentered('dOrbit', 3);
	console.log(w, h);
	mStyle(d, { w, h, bg: 'green' })
}
async function test26_simpleGame() {
	await prelim();
	await postlim();

}
async function test25_cardMoving() {
	await loadAssetsStaticPreload();
	t23_buttons();
	let dTable = mDom('dPage', { bg: 'orange', h100: true }, { id: 'dTable' })

	t23_createTable();
	t23_present();
	t25_activate();

}
async function test24_cardFlipping() {
	await loadAssetsStaticPreload();
	t23_buttons();
	let dTable = mDom('dPage', { bg: 'orange', h100: true }, { id: 'dTable' })

	t23_createTable();
	t23_present();

	let top = arrLast(UI.deck.cards);
	top.div.onclick = fInterruptable(cFlip, top);
}
async function test23() {
	await loadAssetsStaticPreload();
	t23_buttons();
	let dTable = mDom('dPage', { bg: 'orange', h100: true }, { id: 'dTable' })

	t23_createTable();
	t23_present();

	let success = await aw23_doAnimation(1000);
	if (success) t23_modfen();
	t23_present();


	//return;
	onclick = wrapFunc(() => t23_doAnimation(5000, () => t23_modfen));
	//onclick = ev => { ev.stopPropagation(); ev.preventDefault(); t23_doAnimation(5000, () => { t23_modfen(); t23_present(); }) };

}
async function test22() {
	await loadAssetsStaticPreload();

	mDom('dPage', { bg: 'red' }, { tag: 'button', html: 'test', onclick: onclickTest22 })

	let dDeck = mDom('dPage', {}, { id: 'dDeck' });
	let dHand = mDom('dPage', {}, { id: 'dHand' });

	let deck = c52Deck();
	let hand = ['KS', '2C', '3C']; //, '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC', 'AC', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH'];
	let table = T = { deck, hand };

	let uDeck = deck.map(key => uiTypeCard52(key, 150));
	let uHand = hand.map(key => uiTypeCard52(key, 150));

	let gDeck = cSplayDiagonal(uDeck.slice(0, 10), 'dDeck', 0.008);
	let gHand = cSplay(uHand, 'dHand', 'right');
}
async function test21() {
	await loadAssetsStaticPreload();

	let dDeck = mDom('dPage', {}, { id: 'dDeck' });
	let dHand = mDom('dPage', {}, { id: 'dHand' });

	let deck = c52Deck();
	let hand = ['KS', '2C', '3C']; //, '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC', 'AC', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH'];
	let udeck = deck.map(key => uiTypeCard52(key, 150));
	let uhand = hand.map(key => uiTypeCard52(key, 150));

	// 1. Initial Render
	let topCard = drawDeck(udeck, 'dDeck');
	mClass(topCard.div, 'selectable');
	assertion(arrLast(udeck) == topCard, "!!!!!!!!!!!!!")
	//d.onclick = handleDeckClick;

	cSplay(uhand, 'dHand', 'right');
}
async function test20() {
	await loadAssetsStaticPreload();
	//console.log(M.c52)
	let d = mDom('dPage', { bg: 'green', margin: 20, padding: 20, box: true })
	let card = uiTypeCard52('2H', 150);
	mAppend(d, card.div);
	card.div.onclick = () => {
		if (card.faceUp) face_down(card);
		else face_up(card);

		// let dc = iDiv(card);
		// mStyle(dc,{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',color:'navy'})
		// mDom(dc,{position},{html:123})
		// dc.style.display = 'flex';
		// dc.style.alignItems = 'center';
		// dc.style.justifyContent = 'center';
		// dc.style.fontSize = '20px';
		// dc.style.color = 'navy';
		//dc.textContent = 12; // Shows total count on the bottom sliver

	}
}
async function test19() {
	await loadAssetsStaticPreload();

	// let dOpenTable = mDom('dPage');
	let hand = ['KS', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC', 'AC', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH'];
	for (const x of range(3)) { hand = hand.concat(hand); }
	// ui_type_deck(hand, dOpenTable, { maleft: 12 }, 'deck', 'deck');

	let deckCards = hand.map(key => uiTypeCard52(key, 150));
	let topcard = drawDeck(deckCards, 'dPage', 'down');
	console.log(topcard)
	//	face_up(topcard);
	//return;

	return;
	hand = hand.slice(10, 18);
	for (const dir of ['left', 'right', 'up', 'down', 'diagonal']) {
		let cards = hand.map(key => uiTypeCard52(key, 150));

		cards = cSort(cards, null, '23456789TJQKA');

		cSplay(cards, 'dPage', dir, .001);

		for (const c of cards) {
			if (coin()) make_card_selectable(c);
		}
	}
}
async function test18() {
	await loadAssetsStaticPreload();

	let hand = ['KS', '2C', '3C'];

	for (const dir of ['left', 'right', 'up', 'down', 'diagonal']) {
		let cards = hand.map(key => uiTypeCard52(key, 150));

		cards = cSort(cards, null, '23456789TJQKA');

		cSplay(cards, 'dPage', dir);

		for (const c of cards) {
			if (coin()) make_card_selectable(c);
		}
	}
	return;

	let [rows, cols] = [1, hand.length];
	let dg = mGrid(rows, cols, 'dPage', { gap: 4, border: '1px solid grey', padding: 20, box: true });
	for (const c of cards) {
		let dc = c.div;
		mAppend(dg, dc);
		make_card_selectable(c);
	}
}
async function test17() {
	await loadAssetsStaticPreload();

	let hand = ['KS', '2C', '3C'];
	let [rows, cols] = [1, hand.length];
	let dg = mGrid(rows, cols, 'dPage', { gap: 4, border: '1px solid grey', padding: 20, box: true });
	for (const key of hand) {
		let c = uiTypeCard52(key, 200);
		let dc = c.div;
		mAppend(dg, dc);
		make_card_selectable(c);
	}
}
async function test16() {
	await loadAssetsStaticPreload();

	let d = mDom('dPage', { margin: 20 });
	let c = uiTypeCard52('KH', 200);
	mAppend(d, c.div);
	mStyle(d, { w: c.w, h: c.h })

	let dc = c.div;
	mClass(dc, 'selectable');
	mClass(d, 'selectable_parent')
}
async function test15() {
	await loadAssetsStaticPreload();
	console.log(M);
	let d = mDom('dPage');
	let c = uiTypeCard52('KH', 200);
	mAppend(d, c.div);

	d = c.div;
	mClass(d, 'selectable'); return;
	mStyle(d, { padding: 10, bg: 'red' })

	make_card_selectable(c)
}
async function test14() {
	await test13();

	//I want to activate the ui for the top church item
	let fi = T.fen.church[1];
	let item = Items.church[fi];
	console.log('here we go!', item);

	await mSleep(1000)

	let d = iDiv(item);
	mClass(d, 'selectable');
	mClass(d.parentNode, 'selectable');
	mClass(d.parentNode.parentNode, 'selectable');
	console.log('HAAAAAAAAAAAAAAAA', d)
	//mStyle(d,{h:300})
	return;
	toggleItemSelectionState(item);

}
async function test13() {
	//document.body,innerHTML='';
	await loadAssetsStaticPreload();
	// initUI(); //Old();
	//return;
	mClear('dPage');
	let x = mLayoutTLM('dPage', {}, { wcol: 10, registerDivs: true, shade: false });//assertion(false,'THE END')
	//console.log('x', x);assertion(false, '* THE END *');

	for (const d of x) mStyle(d, { box: true, bg: rColor() });	//console.log(x);//return;

	let d = mBy('dTop'); mStyle(d, { box: true });
	mStyle('dMain', { box: true, overy: 'scroll' }); //,{className:'wood'});


	for (const id1 of ['dMenu', 'dTest', 'dHidden', 'dExtra']) {
		mDom(d, { display: 'flex', justifyContent: 'space-between', box: true }, { id: id1 });
		for (const id2 of ['Left', 'Middle', 'Right']) {
			let id = id1 + id2;
			mDom(id1, { align: 'center', box: true }, { id });
		}
	}

	mStyle('dMenu', { bg: '#ffffffbd' });
	mStyle('dMenuLeft', { display: 'flex', gap: 4, padding: '5px 10px', box: true }, { className: 'button_container' });
	mStyle('dMenuRight', { display: 'flex', justify: 'space-evenly', alignItems: 'center', box: true }, {});

	d = mBy('dMenuLeft'); //mClass(d, 'button_container'); //mFlex(d); // mStyle(d, { display: 'flex', vStretch: true, gap: 10, padding: 4, box: true }); //, box:true, vStretch:true, hCenter: true, padding: 10, gap: 10 }) //mClass(d,'flex')
	let bstyle = {};
	show_home_logo(d);
	mDom(d, bstyle, { tag: 'button', html: 'Games', onclick: switchToMenu, menu: 'top', key: 'games' });
	mDom(d, bstyle, { tag: 'button', html: 'Table', onclick: switchToMenu, menu: 'top', key: 'table' });
	mDom(d, bstyle, { tag: 'button', html: 'Settings', onclick: switchToMenu, menu: 'top', key: 'settings' });

	//console.log(DA);

	let dg = mGrid(1, 3, 'dLeft');
	//console.log('grid', dg);
	mStyle(dg, { bg: 'red', h100: true, wmin: 100, box: true });
	for (let i = 0; i < 3; i++) {
		let col = mDom(dg, { h100: true, bg: rColor(), box: true }, { id: `dLeft${i + 1}` });
		col.innerHTML = `col ${i + 1}`;
		//mDom(col, { hmin: 200, box: true, margin: 10 }, { html: `col ${i+1}` });
	}
	showTestButtons('dLeft1');
	//return;

	await postlim();

	//createOneTable();
}
async function test12() {
	//	localStorage.setItem('menu', 'games');
	await prelim();
	showTestButtons();
	await dbDeleteAllTables();

	let table = DA.t1 = await createAristoTable(['felix', 'mimi']); //, { rumors: 'no', commission:'no', church: 'no' ,journey: 'no',peasants:'no' } );
	await tableSaveNew(table);
	DA.tid = table.id;
	DA.menu = 'table';

	//await switchToMenu('table');
	let uiUpdated = await updateMain();
	if (uiUpdated) { show_polling_signal('green'); } else { show_polling_signal('lightgrey'); }

}
async function test11() {
	localStorage.setItem('menu', 'games');
	await prelim();

	showTestButtons();
	await dbDeleteAllTables();
	let [t1, ttest] = [DA.t1, DA.ttest] = await createTables();
	DA.tid = t1.id;
	DA.friendly1 = t1.friendly;
	DA.friendly2 = 'test_comm_exchange';
	await switchToMenu('table');

}
async function test10() {
	await prelim();
	let table = await tableGetByFriendly("duel_of_Road_Town"); //load a table that is already saved
	let t2 = await tableGetByFriendly("test_comm_exchange");
	let diff = deepCompare(table, t2);
	console.log('deepCompare result:', diff);
}
async function test9() {
	await prelim();
	//let table = await createAristoTable(['mimi', 'felix']); //table is not saved!
	//await tableSaveNew(table);

	let table = await tableGetByFriendly("rally_of_Avarua"); //load a table that is already saved

	//console.log(table); //return;
	let table1 = jsCopy(table);
	aritest0_exchange_commissions(table1);
	table1.friendly = 'test_comm_exchange';
	delete table1.id;

	DA.table1 = table1;

	await tableSaveNew(table1);


	//	console.log('table1', table1);



	// let items = table.players.mimi.commissions;
	// let n = 2;
	// let callback = async () => await process_comm_setup('mimi', table, items.slice(0, n));
	// mStyle('bCommit', { opacity: 1 });
	//commitButton.onclick = async() => await callback();
}
async function test5() {
	await loadAssetsStaticPreload();

	initUI(); //Old();

	await DAInit();

	mStyle('dPage', {}, { className: 'wood' });

	await pollInit();
	await switchToUser(); // da wird M.users geladen!
	//console.log('current user', U);
	await load_assets();

	M.images = await loadStaticYaml('y/all_image_files.yaml');
	let byKey = {}, byDir = {};
	for (const fname of M.images) {
		let dir = stringBeforeLast(fname, '/');
		dir = stringAfterLast(dir, '/')
		let key = stringAfterLast(fname, '/');
		key = stringBefore(key, '.');
		key = normalizeString(key);
		byKey[key] = fname;
		lookupAddIfToList(byDir, [dir], fname);
		//console.log(dir,key);
	}
	M.imgByKey = byKey;
	M.imgByDir = byDir;

	//updateMain();
	//onclickMoreUsers();

}
async function test8() {
	mClear('dPage');
	mLayoutTM('dPage', {}, { wcol: 0, registerDivs: true, shade: false });
	let d = mBy('dMain');
	M = await loadStaticYaml('y/m.yaml');
	M.config = await loadStaticYaml('y/config.yaml');

	// let n = 1, fen = {};//plNames.length;
	// let num_decks = fen.num_decks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
	// let deck = c52Decks(num_decks).map(x => x + 'n'); arrShuffle(deck);
	// console.log('deck', deck);

	// let uideck = ui_type_deck(['KH', '2C', '3C'], d, { maleft: 12 }, 'deck', 'deck'); //, ari_get_card);

	let deck = c52Deck();
	deck = c52Decks(2);
	console.log('deck', deck);


}
async function test7() {
	await loadAssetsStaticPreload();
	await DAInit();
	await load_assets();
	mClear('dPage');
	showCardMini('dPage', '7Hn', 35);
	//mLayoutTM('dPage', {}, { wcol: 0, registerDivs: true, shade: false });

}
async function test6() {
	mClear('dPage');
	mLayoutTM('dPage', {}, { wcol: 0, registerDivs: true, shade: false });

}
async function test4() {

	let d = mDom('dPage', { display: 'flex', gap: 10, bg: 'gold' }, {});
	let shadow = 'inset 0 0 0 3px black';
	let w = 2;
	let style = {
		round: true,
		margin: 20,
		w: 100,
		h: 100,
		fit: 'fill',
		//display: 'block',
		outline: `${w}px solid red`,
		'outline-offset': `-${w}px`,
		// boxShadow: 'inset 2 2 2 3px green',
		// overflow:

	};
	//style = {w:100,h:100,fit:'fill',margin:10,'box-shadow':shadow};
	mDom(d, style, { tag: 'img', src: '../assets/img/users/mimi.jpg' });
	return;

	await loadAssetsStaticPreload();

	initUI(); //Old();

	await DAInit();

	mStyle('dPage', {}, { className: 'wood' });

	if (TESTING || DEV) {
		let d = mBy('dTestRight'); mClass(d, 'button_container'); //mFlex(d);
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

	await pollInit();
	switchToUser(); // da wird M.users geladen!
	await load_assets();

	M.images = await loadStaticYaml('y/all_image_files.yaml');
	let byKey = {}, byDir = {};
	for (const fname of M.images) {
		let dir = stringBeforeLast(fname, '/');
		dir = stringAfterLast(dir, '/')
		let key = stringAfterLast(fname, '/');
		key = stringBefore(key, '.');
		key = normalizeString(key);
		byKey[key] = fname;
		lookupAddIfToList(byDir, [dir], fname);
		//console.log(dir,key);
	}
	M.imgByKey = byKey;
	M.imgByDir = byDir;
}
async function test3() {

	// await loadAssetsStaticPreload();
	// await DAInit();
	let d = mDom('dPage', { display: 'flex', gap: 10, bg: 'gold' }, {});
	// mStyle(d, { display: 'flex', placeContent: 'center' });
	// faButton(d, 'angles_up', {}, {}); 
	//mDom(d, {cursor: 'pointer',fz:22 }, { tag:'i',className:"fa-solid fa-angles-up" }); 
	let x = faButton(d, 'angles_down', { fz: 40 });
	console.log(x)
	return;

	await loadAssetsStaticPreload();

	initUI(); //Old();

	await DAInit();

	mStyle('dPage', {}, { className: 'wood' });

	if (TESTING || DEV) {
		let d = mBy('dTestRight'); mClass(d, 'button_container'); //mFlex(d);
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

	await pollInit();
	switchToUser(); // da wird M.users geladen!
	await load_assets();

	M.images = await loadStaticYaml('y/all_image_files.yaml');
	let byKey = {}, byDir = {};
	for (const fname of M.images) {
		let dir = stringBeforeLast(fname, '/');
		dir = stringAfterLast(dir, '/')
		let key = stringAfterLast(fname, '/');
		key = stringBefore(key, '.');
		key = normalizeString(key);
		byKey[key] = fname;
		lookupAddIfToList(byDir, [dir], fname);
		//console.log(dir,key);
	}
	M.imgByKey = byKey;
	M.imgByDir = byDir;
}
async function test2_getImages() {
	let dirs = await mGetFiles('assets/img');
	console.log(dirs);
	let list = [];
	for (const d of dirs.files) {
		if (d[0] == '.') continue;
		let files = await mGetFiles('assets/img/' + d);
		console.log(d, files);
		for (const f of files.dir) {
			//console.log('dir:',f);return;
			let src = '../assets/img/' + d + '/' + f.name;
			list.push(src);
			console.log(src);
			let img = mDom('dPage', { w: 100, h: 100 }, { tag: 'img', src });
		}
	}
	downloadAsYaml(list, 'all_image_files');
}

async function test1() {

	await loadAssetsStaticPreload();

	initUI(); //Old();
	switchToUser();


	return;
	await DAInit();
	await load_assets();
	return;
	//await mSleep(100);
	await pollInit();
	show_home_logo();

	U = null;//M.users.mimi;
	if (nundef(U)) { show_users(); return; }

	show_username(true);

	// await switchToUser();
}
async function test0() {
	await DAInit();
	BG_CARD_BACK = rColor();
	DA.showTestButtons = false;
	DA.TEST0 = false;
	let uname = 'mimi'; DA.secretuser = localStorage.getItem('uname');
	if (isdef(uname)) U = M.users[uname];
	console.log(U);
	//let res = await mPhpPost({ app: 'simple' }, 'assets');
	await load_assets();
	DA.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; if (DA.isFirefox) console.log('using Firefox!')
	show_home_logo();
	if (nundef(U)) { show_users(); return; }
	show_username(true);
	if (DA.TEST0 || DA.showTestButtons) show('dTestButtons');

	//onclick_home();
}


async function prelim() {
	await loadAssetsStaticPreload();
	initUI(); //Old();
}
async function postlim() {
	await DAInit();

	mStyle('dPage', {}, { className: 'wood' });

	await pollInit();
	await switchToUser(); // da wird M.users geladen!
	//console.log('current user', U);
	await load_assets();

	M.images = await loadStaticYaml('y/all_image_files.yaml');
	let byKey = {}, byDir = {};
	for (const fname of M.images) {
		let dir = stringBeforeLast(fname, '/');
		dir = stringAfterLast(dir, '/')
		let key = stringAfterLast(fname, '/');
		key = stringBefore(key, '.');
		key = normalizeString(key);
		byKey[key] = fname;
		lookupAddIfToList(byDir, [dir], fname);
		//console.log(dir,key);
	}
	M.imgByKey = byKey;
	M.imgByDir = byDir;

	//updateMain();
	//onclickMoreUsers();
}


