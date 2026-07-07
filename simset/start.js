onload = start; VERBOSE = false; TESTING = true; DEV = false; POLLING = true;

function start() { test0_cardbasics(); }

async function test0_cardbasics() {
	await loadAssetsStaticPreload();
	let d = mDom('dPage', { padding: 50 }, {}); mFlexWrap(d);
	let c = uiTypeCard52('QH', 200); mAppend(d, c.div);
	let dc = iDiv(c);
	//setCardBorder(c, 'red', 3);
	await mSleep(1000);
	for (const i of range(10)) {
		await flipCard(c);
	}
	//set_card_border(c,3, 'red', true)
	//flashCardBorder(c, 'red', 1000, 3);
	//make_card_selectable(c);
}
async function test0_createGame() {
	await prelim();
	initUI();
	// await postlim();
	await DAInit();
	mStyle('dPage', {}, { className: 'wood' });
	await pollInit();
	DA.menu = 'games';
	await switchToUser('mimi');
	//await switchToUser(uname); // da wird M.users geladen!
	if (!TESTING) { console.log(DA); return; }

	console.log('________________________')
	let table = createGameTable('aristo', ['amanda', 'mimi'], //, 'felix'], //,'amanda','lauren','mac','nasi'],
		{ church: 'no', rumors: 'no', peasants: 'no', commission: 'no', journey: 'no', winning_score: 5, adaptive: 'yes', num_symbols: '10', num_cards: '2', },
		{
			amanda: { playmode: 'human', hint: 2 },
			mimi: { playmode: 'human', hint: 2 },
			// felix: { playmode: 'human', hint: 2 },
		});
	//table.turn = ['amanda'];console.log(table); return; //geht nur bei bluff oder spotit
	await tableSaveNew(table);
	DA.tid = table.id;
	DA.menu = 'table';
	await updateMain();
	console.log('done')

}
async function test0_specialKeys() {
	await loadAssetsStaticPreload();
	await loadAssetsStatic();
	console.log(M);
	let d = mDom('dPage', {}, {}); mFlexWrap(d);
	for (const k of SpecialKeys) {
		console.log(k)
		mKey(k, d, {}, {});
	}

}
async function test0_emoji() {
	await loadAssetsStaticPreload();
	await loadAssetsStatic();

	let sz = 300;
	let n = rNumber(6, 13); mFlexWrap('dPage')
	let d;

	for (const n of range(3, 21)) {
		d = makeContainer('dPage', sz);
		Items = makeItems(n - 1);
		arrangeOnCard(d, Items, sz);

	}
	return;
	d = makeContainer('dPage', sz); mStyle(d, { matop: 10 })
	Items = makeItems(n);
	arrangeOnCircleX(d, Items, { mode: 'concentric' });

	d = makeContainer('dPage', sz);
	Items = makeItems(n);
	arrangeOnCircleGrid(d, Items, sz);

	d = makeContainer('dPage', sz);
	Items = makeItems(n * 2)
	arrangeWithLayout(d, Items);

	d = makeContainer('dPage', sz);
	Items = makeItems(n / 2)
	arrangeWithLayout(d, Items);
	//arrangeShapesEvenlyCircle(d, Items, 4);
	//Items.map(x=>mAppend(d,x));arrangeItemsInSpiral(d, Items,70,.5);
	//Items.map(x=>mAppend(d,x));arrangeInConcentricCircles(d, Items,75,70);
	//Items.map(x=>mAppend(d,x));arrangeInCustomConcentricCircles(d, Items,[6,10,12],65,[50,50,40]);
	//console.log(d)
}
async function test10_emoji() {
	await loadAssetsStaticPreload();
	await loadAssetsStatic();

	let sz = 300;
	let n = rNumber(6, 13);
	let d, t;

	t = Date.now();
	for (const i of range(100)) {
		d = makeContainer('dPage', sz); mStyle(d, { matop: 10 })
		Items = makeItems(n);
		arrangeOnCircleGrid(d, Items, { mode: 'concentric' });
	}
	console.log(Date.now() - t);

	t = Date.now();
	for (const i of range(100)) {
		d = makeContainer('dPage', sz); mStyle(d, { matop: 10 })
		Items = makeItems(n);
		arrangeOnCircle(d, Items, { mode: 'concentric' });
	}
	console.log(Date.now() - t);

	t = Date.now();
	for (const i of range(100)) {
		d = makeContainer('dPage', sz); mStyle(d, { matop: 10 })
		Items = makeItems(n);
		arrangeOnCircleX(d, Items, { mode: 'concentric' });
	}
	console.log(Date.now() - t);

	t = Date.now();
	for (const i of range(100)) {
		d = makeContainer('dPage', sz);
		Items = makeItems(n);
		arrangeOnCard(d, Items, sz);
	}
	console.log(Date.now() - t);

	t = Date.now();
	for (const i of range(100)) {
		d = makeContainer('dPage', sz);
		Items = makeItems(n * 2)
		arrangeWithLayout(d, Items);
	}
	console.log(Date.now() - t);

	return;

	d = makeContainer('dPage', sz);
	Items = makeItems(n);
	arrangeOnCircleGrid(d, Items, sz);

	d = makeContainer('dPage', sz);
	Items = makeItems(n * 2)
	arrangeWithLayout(d, Items);

	d = makeContainer('dPage', sz);
	Items = makeItems(n / 2)
	arrangeWithLayout(d, Items);
	//arrangeShapesEvenlyCircle(d, Items, 4);
	//Items.map(x=>mAppend(d,x));arrangeItemsInSpiral(d, Items,70,.5);
	//Items.map(x=>mAppend(d,x));arrangeInConcentricCircles(d, Items,75,70);
	//Items.map(x=>mAppend(d,x));arrangeInCustomConcentricCircles(d, Items,[6,10,12],65,[50,50,40]);
	//console.log(d)
}
async function test09_emoji() {
	await loadAssetsStaticPreload();
	await loadAssetsStatic();

	let sz = 300;
	let n = rNumber(6, 13);
	let d;

	// d = makeContainer('dPage', sz); mStyle(d, { matop: 10 })
	// Items = makeItems(n);
	// arrangeOnCircleX(d, Items, { mode: 'concentric' });

	// d = makeContainer('dPage', sz);
	// Items = makeItems(n);
	// arrangeOnCard(d, Items, sz);

	d = makeContainer('dPage', sz);
	Items = makeItems(n);
	arrangeOnCircleGrid(d, Items, sz);

	d = makeContainer('dPage', sz);
	Items = makeItems(n * 2)
	arrangeWithLayout(d, Items);

	d = makeContainer('dPage', sz);
	Items = makeItems(n / 2)
	arrangeWithLayout(d, Items);
	//arrangeShapesEvenlyCircle(d, Items, 4);
	//Items.map(x=>mAppend(d,x));arrangeItemsInSpiral(d, Items,70,.5);
	//Items.map(x=>mAppend(d,x));arrangeInConcentricCircles(d, Items,75,70);
	//Items.map(x=>mAppend(d,x));arrangeInCustomConcentricCircles(d, Items,[6,10,12],65,[50,50,40]);
	//console.log(d)
}
async function test08_emoji() {
	await loadAssetsStaticPreload();
	await loadAssetsStatic();
	//,filter: 'drop-shadow(4px 5px 2px #111)'
	let shadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
	//let d = mDom('dPage',{border:'grey',shadow,round:true,w:300,h:300,position:'relative'}); mFlex(d);
	let szCard = 300;
	let dParent = mDom('dPage', { border: 'red', w: 320, h: 320, round: true }); mFlex(dParent, true, 'center');
	dParent = mDom(dParent, { position: 'relative', w: 300, h: 300, round: true });
	//let d = cRound(dParent, { border: 'solid #ccc 3px', w: szCard, h: szCard, margin: 20 });
	//d = iDiv(d);
	//d.style.boxShadow = shadow;
	Items = [];
	let sz = 80;
	let rotate = `${rChoose([0, 45, 90, 135, 180, 225, 270, 315])}deg`;
	// let sizes = [40,80,50];let sizes2=[40,60,80];
	let cnt = 0, i = 0;
	let list = arrShuffle(SpecialKeys);
	let l = [[70], [40, 60, 80, 50, 80, 30], [80, 30, 30, 30, 30, 30, 30, 30, 30, 30]];
	l = [[70], [50, 40, 80, 40, 40, 70], [60, 40, 40, 50, 40, 40, 40, 40, 40, 40, 40]];
	let sizes = l.flat(); //console.log(sizes);
	let avg = 75; let maxCount = rNumber(7, 13);
	avg = avg - (13 - maxCount) ^ 2;
	//7:75, 8:73, 9:71, 10:69, 11:67, 12:65, 13:63
	sizes = [100, 50, 75];
	sizes = [avg + 25, avg, avg - 25]; console.log('maxCount', maxCount, '\navg', avg, '\nsizes', sizes)
	for (const key of list) {
		//if (i>5) sizes = sizes2;
		sz = sizes[i++ % sizes.length];//sz == 50?40:sz ==40?80:40;
		// let ff = M.emo[key].sz / 100;
		// let d1 = mKey(key, d, { round: true, fz: sz * ff, w: sz, h: sz }, { key });cnt++;
		// Items.push(d1);

		if (isdef(M.allImages[key])) {
			cnt++;
			let d2 = mKey(key, null, { round: true, w: sz, h: sz }, { szImage: sz * .75, key, prefer: 'img' });
			Items.push(d2);

		}
		if (cnt > 8) break;
	}

	arrangeShapesEvenlyCircle(dParent, Items, 10); mLinebreak(dParent)
	// arrangeOnCard(dParent1, syms1, 300); mLinebreak(dParent1)
	// arrangeShapesEvenlyCircle(d, Items, 20);
	//arrangeItemsInSpiral(d, Items,70,.5);
	// arrangeInConcentricCircles(d, Items,75,70);
	//arrangeInCustomConcentricCircles(d, Items,[6,10,12],65,[50,50,40]);
	//console.log(d)
}
async function test07_emoji() {
	await loadAssetsStaticPreload();
	await loadAssetsStatic();
	let d = mDom('dPage', { w: 1200, h: 1200, position: 'relative' }); mFlex(d);
	Items = [];
	let sz = 40; let rotate = `${rChoose([0, 45, 90, 135, 180, 225, 270, 315])}deg`;
	for (const key of SpecialKeys) {
		let ff = M.emo[key].sz / 100;
		let d1 = mKey(key, d, { bg: rColor(), round: true, fz: sz * ff, w: sz, h: sz }, { key });
		Items.push(d1);

		if (isdef(M.allImages[key])) {
			let d2 = mKey(key, d, { bg: rColor(), round: true, w: sz, h: sz }, { szImage: sz * .75, key, prefer: 'img' });
			Items.push(d2);

		}
	}

	arrangeItemsInSpiral(d, Items, 50, .5);
	console.log(d)
}

async function test0_abacus() {
	await loadAssetsStaticPreload();
	await loadAssetsStatic();

	console.log(M)
	let d = mDom('dPage', { gap: 10 }); mFlex(d);
	console.log(M.superdi.abacus, M.emo.abacus);
	let sz = 200;
	mKey('abacus', d, { bg: 'green', sz }, { prefer: 'img' });
	mKey('abacus', d, { rotate: '45deg', bg: 'green', w: sz, h: sz, fz: sz * M.emo.abacus.sz / 100 }, {});

	return;

}

async function test07_emoji() {
	await prelim();
	let d = mDom('dPage'); mFlex(d);
	Items = [];
	let sz = 40;
	for (const k of SpecialKeys) {
		let ff = M.emo[k].sz / 100;
		let d1 = mKey(k, d, { bg: rColor(), round: true, fz: sz * ff, w: sz, h: sz, rotate: `${rChoose([0, 45, 90, 135, 180, 225, 270, 315])}deg` });
		let item = { key: k, div: d1 };
		d1.onclick = () => {
			toggleItemSelection(item, 'framedPicture', Items);
			console.log(Items.map(x => x.key));
			console.log(item.rad)
		};
	}
}
async function test01_specialkeys() {
	let ok = SpecialKeys.every(x => SpecialKeys2.includes(x)); console.log(ok);

	console.log(SpecialKeys.length, SpecialKeys2.length);

	let list = Array.from(new Set(SpecialKeys.concat(SpecialKeys2)));
	list.sort();
	console.log(list.size);

	let nok1 = SpecialKeys2.some(x => !list.includes(x));

	let more = [
		"derelict_house",
		"cupcake",
		"croissant",
		"dizzy",
		"dodo",
		"flag_united_states",
		"house",
		"ice",
		"hyacinth",
		"lollipop",
		"locomotive",
		"magnifying_glass_tilted_left",
		"magnet",
		"panda",
		"sailboat",
		"screwdriver",
		"skateboard",
		"sled"
	];
	let nok2 = more.some(x => !list.includes(x));

	console.log(nok1, nok2, list);

	let list1 = SpecialKeys.concat(more);
	list1.sort();
	//console.log(list1);
}
async function test06_emoji() {
	await prelim();
	//let dirad = await loadStaticYaml('y/dirad40.yaml');
	let d = mDom('dPage'); mFlex(d);
	Items = [];
	//let dinew={};
	let sz = 40;
	for (const k in M.emo) { //of SpecialKeys){ //M.emo) {
		//let info = dirad[k];
		let ff = M.emo[k].sz / 100; // = info.rad;
		let d1 = mKey(k, d, { bg: rColor(), round: true, fz: sz * ff, w: sz, h: sz, rotate: `${rChoose([0, 45, 90, 135, 180, 225, 270, 315])}deg` });
		let item = { key: k, div: d1 };
		d1.onclick = () => {
			toggleItemSelection(item, 'framedPicture', Items);
			console.log(Items.map(x => x.key));
		};
	}

	//console.log(dinew);
	//downloadAsYaml(M.emo,'diemo');

}
async function test05_emoji() {
	await prelim();
	let dirad = await loadStaticYaml('y/dirad.yaml');
	let d = mDom('dPage'); mFlex(d);
	Items = [];
	let dinew = {};
	let sz = 40;
	for (const k in M.emo) { //of SpecialKeys){ //M.emo) {
		let info = dirad[k]; console.log(info);
		dinew[k] = { max: Math.ceil(info.radmax), min: Math.ceil(info.radmin), rad: Math.ceil(100 * info.radmax / 40), cov: Math.floor(info.cov) };
		let d1 = mKey(k, d, { bg: rColor(), round: true, fz: sz * .8, w: sz, h: sz, rotate: `${rChoose([0, 45, 90, 135, 180, 225, 270, 315])}deg` });
		let item = { key: k, div: d1 };
		d1.onclick = () => {
			toggleItemSelection(item, 'framedPicture', Items);
			console.log(Items.map(x => x.key));
		};
	}

	console.log(dinew);
	//downloadAsYaml(dinew,'dirad40');

}
async function test04_emoji() {
	await prelim();
	let d = mDom('dPage'); mFlex(d);
	let di = M.dirad = await loadStaticYaml('y/dirad.yaml');
	let sz = 40;

	let list = dict2list(di);


	let stats = calculateKeyMetrics(list, 'cov');
	console.log(stats);
	// Output: { min: 21.8, max: 24.75, median: 23.45, avg: 23.24 }

	let newdi = getFilteredDict(di, (k, v) => v.cov > 58 && v.cov < 90);
	for (const k in newdi) {
		let d1 = mKey(k, d, { fz: 40 });
	}

}
async function test03_emoji() {
	// --- Usage Example ---
	// const metrics = calculateEmojiCircleMetrics('🐝', 100);
	// console.log(metrics); 
	// Output Example: { radius: 46.21, coveragePercentage: 38.45, pixelCount: 2580 }
	await prelim();
	let d = mDom('dPage'); mFlex(d);
	let di = M.dirad = await loadStaticYaml('y/dirad.yaml');
	let sz = 40;
	for (const k in di) {
		let d1 = mKey(k, d, { fz: 40 });
		let emo = M.emo[k];
		let res = calculateEmojiCircleMetrics(emo.html, sz);
		let o = di[k];
		o.r = res.coveragePercentage;
		o.cov = res.coveragePercentage;
		o.pix = res.pixelCount;
	}
	downloadAsYaml(di, 'dirad');


}
async function test02_emoji() {
	await prelim();
	let d = mDom('dPage'); mFlex(d);
	let di = M.dirad = await loadStaticYaml('y/dirad.yaml');
	let res = getFilteredSymbols(di, 20, 22);
	console.log('res', res);
	let sz = 40;
	for (const k of res) {
		//console.log(k, di[k]);
		let d1 = mKey(k, d, { fz: sz, rotate: `${rChoose([0, 45, 90, 135, 180, 225, 270, 315])}deg` });
	}

}
async function test01_emoji() {
	await prelim();
	let d = mDom('dPage'); mFlex(d);

	let sz = 40;
	//w = fz*.25, h = fz*.2

	let di = {};
	let totalRadmax = 0, totalRadmin = 1000;
	let sumMax = 0, sumMin = 0;

	for (const k in M.emo) {
		let o = di[k] = {};
		radmax = 0; radmin = 1000;
		for (const angle of [0, 45, 90, 135, 180, 225, 270, 315]) {
			let emo = M.emo[k];
			//let d1 = mKey(k, d, { fz: sz, rotate: `${angle}deg` });
			let metrics = calculateEmojiMetrics(emo.html, sz, angle);
			let rad = metrics.radius;
			if (rad > radmax) radmax = rad;
			if (rad < radmin) radmin = rad;
			o[angle] = metrics;
		}
		o.radmax = radmax;
		o.radmin = radmin;
		sumMax += radmax;
		sumMin += radmin;
		if (radmax > totalRadmax) totalRadmax = radmax;
		if (radmin < totalRadmin) totalRadmin = radmin;
	}

	let avgMax = sumMax / Object.keys(di).length;
	let avgMin = sumMin / Object.keys(di).length;
	console.log(avgMax, avgMin);
	//sort dictionary by radmax
	sortDictBy(di, 'radmax');

	console.log(totalRadmax, totalRadmin);
	downloadAsYaml(di, 'di');


	// --- Usage Example ---
	// const metrics = calculateEmojiMetrics('🐝', 80, 45, 'Noto Color Emoji');
	// console.log(metrics); 
	// Output format: { centerX: 104.5, centerY: 102.1, radius: 41.34 }

}
async function test0_texture() {
	//YES!!!!
	await loadAssetsStaticPreload();
	let sz = 500, szCard = 300;
	let d0 = mDom('dPage', { overy: 'scroll', hmax: '100%', wmax: '100%', h100: true }); //, w100: true, padding: 20, margin: 0, box: true });
	let d = mDom(d0, { w: sz, h: sz, bg: YELLOW, margin: 12, padding: 12, box: true });
	let card = cRound(d, { bg: 'pink', w: szCard, h: szCard });
	card.faceUp = true;
	face_down(card, GREEN, 'food');

	console.log(card)
}
async function test03_texture() {
	//YES!!!!
	let sz = 300;
	let d0 = mDom('dPage', { overy: 'scroll', hmax: '100%', wmax: '100%', h100: true, w100: true, padding: 20, margin: 0, box: true });
	let d = mDom(d0, { w: sz + 100, h: 300, bg: GREEN });
	let d2 = mDom(d0, { h: 300, bg: YELLOW, margin: 10 });
	let d3 = mDom(d0, { w: sz, h: 300, bg: RED, mah: 100 });
	let d4 = mDom(d0, { w: sz, h: 300, bg: BLUE, margin: 0 });

}
async function test02_texture() {
	//YES!!!!
	let sz = 300;
	let d0 = mDom('dPage', { overy: 'scroll', hmax: '100%', wmax: '100%', h100: true, w100: true, padding: 20, margin: 0, box: true });
	let d = mDom(d0, { w: sz + 100, h: 300, bg: GREEN });
	let d2 = mDom(d0, { h: 300, bg: YELLOW, margin: 10 });
	let d3 = mDom(d0, { w: sz, h: 300, bg: RED, mah: 100 });
	let d4 = mDom(d0, { w: sz, h: 300, bg: BLUE, margin: 0 });

}
async function test01_texture() {
	console.log(mBy('dPage')); //return;
	// let d0=mDom('dPage',{display:'flex',flexWrap:'wrap',gap:20,dir:'row',h:'100vh',w:'100vw',hmax:'100vh',wmax:'100vw',box:true,padding:0,margin:0});
	//d0=mDom(d0,{hmax:'100%',wmax:'100%',h100:true,w100:true,padding:0,margin:0,box:true});

	//NO!!!!
	// let d0=mDom('dPage',{hmax:'100%',wmax:'100%',h100:true,w100:true,padding:20,margin:0,box:true});
	// d0=mDom(d0,{h100:true,w100:true,padding:0,margin:0,box:true});
	// let d =mDom(d0,{w:500,h:300,bg:GREEN});
	// let d2 =mDom(d0,{w:300,h:300,bg:YELLOW, margin:10});
	// let d3 =mDom(d0,{w:300,h:300,bg:RED, mah:300});
	// let d4 =mDom(d0,{w:300,h:300,bg:BLUE, margin:0});

	//YES!!!!
	let sz = 300;
	let dMain = mDom('dPage', { overy: 'scroll', hmax: '100%', wmax: '100%', h100: true, w100: true, padding: 20, margin: 0, box: true });
	// mStyle('dPage', { overy:'scroll',hmax: '100%', wmax: '100%', h100: true, w100: true, padding: 20, margin: 0, box: true });
	// let dOuter = mBy('dPage');
	let d0 = mDom(dMain, { h100: true, padding: 0, margin: 0, box: true });
	let d = mDom(d0, { w: sz + 100, h: 300, bg: GREEN });
	let d2 = mDom(d0, { h: 300, bg: YELLOW, margin: 10 });
	let d3 = mDom(d0, { w: sz, h: 300, bg: RED, mah: 100 });
	let d4 = mDom(d0, { w: sz, h: 300, bg: BLUE, margin: 0 });

	//NO!!!!
	// let dOuter = mDom('dPage', { hmax: '100%', wmax: '100%', h100: true, w100: true, padding: 20, margin: 0, box: true });
	// // d, d3, and d4 have fixed or explicit widths. 
	// // They are safe because their widths are smaller than the screen.
	// let d = mDom(dOuter, { w: 500, h: 300, bg: GREEN });
	// // CRITICAL FIX FOR d2: 
	// // 1. REMOVE 'w100: true' or 'width: 100%' entirely!
	// // 2. Because it is a default block element, it automatically calculates its own width 
	// //    as: (Available Parent Width - Left Margin - Right Margin).
	// let d2 = mDom(dOuter, { h: 300, bg: YELLOW, margin: 10 });
	// let d3 = mDom(dOuter, { w: 300, h: 300, bg: RED, mah: 300 });
	// let d4 = mDom(dOuter, { w: 300, h: 300, bg: BLUE, margin: 0 });



}
async function test01_specialKeys() {
	await loadAssetsStaticPreload();
	console.log(M);

}
async function test0_selectLifePlus() {
	let superdiPlus = await loadStaticYaml('y/superdi_plus.yaml');
	console.log(Object.keys(superdiPlus).length);
	let superdi = await loadStaticYaml('y/superdi_old.yaml');
	console.log(Object.keys(superdi).length);

	await loadAssetsStaticPreload();
	let digroup = await loadStaticYaml('y/digroup.yaml');
	for (const k of M.emokeys) {
		let contained = false;
		for (const kg in digroup) {
			let vals = flattenDictValues(digroup[kg]);
			if (vals.includes(k)) {
				contained = true;
				break;
			}
		}
		if (!contained) console.log(k);
	}
	//console.log(Object.keys(superdi).length);


	let emos = Object.keys(superdi).filter(x => superdi[x].emo);
	console.log(emos.length);
	let nomo = emos.filter(x => !M.emokeys.includes(x));
	console.log(nomo);

	console.log(Object.keys(M.emo).length)
	console.log(M.emo.buffalo)
	let di = await loadStaticYaml('assets/allSyms.yaml');
	let direpl = { top_hat: 'hat', resting: 'bed', direct_hit: 'bullseye' };
	let best100 = getCatKeys(di, 'best100');
	let lifeplus = getCatKeys(di, 'lifePlus');
	let objectplus = getCatKeys(di, 'objectPlus');

	//console.log(best100List);
	function correctKeys(list) {
		let res = [];
		for (const k of list) {
			let s = normalizeString(k);
			let x = M.emo[s];
			if (x) { res.push(s) }//console.log(k,s,x); 
			else {
				if (direpl[s]) {
					s = direpl[s];
					x = M.emo[s];
					if (x) res.push(s); //console.log('=>',k,s,x);
				} else console.log(k, s, 'NOT FOUND');
			}
		}
		return res;
		//console.log(k);
	}
	let res = { best100: correctKeys(best100), lifeplus: correctKeys(lifeplus), objectplus: correctKeys(objectplus) }; // { best100, lifeplus }
	console.log(res)
	downloadAsYaml(res, 'specialKeys');
	// Assuming 'M.allSyms' or your loaded data matches the structure:
	/*
	const mySyms = {
		"abacus": { "key": "abacus", "cats": ["huge", "all", "nemo"] },
		"adhesive bandage": { "key": "adhesive bandage", "cats": ["huge", "best100", "all"] }
	};
	*/

	// const best100List = getBest100Keys(M.allSyms);
	// console.log(best100List); // Output: ['adhesive bandage']

}
async function test0_newShapes() {
	await loadAssetsStaticPreload();

	mClear(document.body);
	document.body.style.overflowX = 'hidden';
	document.body.style.margin = '20';
	let d0 = mDom(document.body, { display: 'flex' });
	let dParent = mDom(d0, { margin: 10 });
	let dParent1 = mDom(d0);
	for (const n of range(3, 18)) {
		let els = spotitSetup(n);

		let syms = spotitSyms(els);
		let syms1 = spotitSyms(els); console.log(syms1);

		arrangeShapesEvenlyCircle(320, syms, dParent, gap = 10); mLinebreak(dParent)
		arrangeOnCard(dParent1, syms1, 300); mLinebreak(dParent1)
		//let card = spotitCard(dParent,els,300); //console.log(card)
	}
}
async function test03_newShapes() {
	await loadAssetsStaticPreload();

	mClear(document.body);
	document.body.style.overflowX = 'hidden';
	document.body.style.margin = '20px';

	// Set up a main column layout container for the entire page
	let dPage = mDom(document.body, {
		display: 'flex',
		'flex-direction': 'column',
		gap: '20px'
	});

	for (const n of range(3, 18)) {
		// 1. Create a row container dedicated solely to this 'n' step 
		// This locks both cards onto the exact same vertical alignment line!
		let dRow = mDom(dPage, {
			display: 'flex',
			'flex-direction': 'row',
			'align-items': 'center',
			'justify-content': 'flex-start',
			gap: '40px' // Clean spacing separation between the columns
		});

		let els = spotitSetup(n);

		// 2. Generate separate live DOM symbol elements for each card placement strategy
		let syms = spotitSyms(els);
		let syms1 = spotitSyms(els);

		// 3. Render Strategy A: Fermat Spiral Engine (Left Column)
		// Note: Adjusted szCard to 300 + 20 to match the exact physical size of the second strategy
		let cardA = arrangeShapesEvenlyCircle(300, syms, dRow, 10);

		// 4. Render Strategy B: Row-Grid Framework Tiling (Right Column)
		let cardB = arrangeOnCard(dRow, syms1, 300);
	}
}
async function test02_newShapes() {
	await loadAssetsStaticPreload();

	mClear(document.body);
	document.body.style.overflowX = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;
	for (const n of range(3, 18)) {
		let els = spotitSetup(n);
		let card = spotitCard(dParent, els, 300); //console.log(card)
	}
}
async function test01_newShapes() {
	await loadAssetsStaticPreload();
	let n = 8;
	let group = 'animals_nature';
	let list = Object.keys(M.emogroup[group]);
	let subgroups = matchWildcardArray('animal*', list);
	let keypool = subgroups.map(x => M.emogroup[group][x]).flat();
	let keys = rChoose(keypool, n);
	let scaleList = [.6, .75, 1];
	let scales = keys.map(x => rChoose(scaleList));
	let uniformSize = 50;

	let els = [];
	for (const i of range(n)) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = uniformSize * scale;
		els[i] = { scale, w: sz, h: sz, bg: 'transparent', key };
	}

	// REPLACED: Now calls the calc_syms row arrangement layout structure strategy
	let cont = arrangeShapesEvenlyRowGrid(300, arrTake(els, n), dPage);

	//arrChildren(cont).forEach(x => console.log(x));
}
async function test0_shapes() {
	await loadAssetsStaticPreload();

	let n = 8;
	let group = 'animals_nature';
	let list = Object.keys(M.emogroup[group]); //console.log(list);
	//return;
	let subgroups = matchWildcardArray('animal*', list);
	let keypool = subgroups.map(x => M.emogroup[group][x]).flat();
	//console.log(keypool);

	let keys = rChoose(keypool, n);

	let scaleList = [.6, .75, 1];
	let scales = keys.map(x => rChoose(scaleList));
	let uniformSize = 40;
	//const els = [{ w: 40, h: 30, bg: '#ff6b6b' }, { w: 50, h: 50, bg: '#4ecdc4' }, { w: 35, h: 45, bg: '#ffe66d' }, { w: 60, h: 30, bg: '#1a535c' }, { w: 45, h: 45, bg: '#ff9f43' }, { w: 30, h: 30, bg: '#ee5253' }, { w: 55, h: 35, bg: '#10ac84' }, { w: 20, h: 30, bg: '#ff6b6b' }, { w: 10, h: 20, bg: '#4ecdc4' }, { w: 35, h: 32, bg: '#ffe66d' }, { w: 60, h: 30, bg: '#1a535c' }, { w: 45, h: 45, bg: '#ff9f43' }, { w: 60, h: 30, bg: '#1a535c' }, { w: 45, h: 45, bg: '#ff9f43' },];
	let els = [];
	for (const i of range(n)) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		//let baseIconSz = uniformSize / 1.5;
		let sz = uniformSize * scale;
		els[i] = { scale, w: sz, h: sz, bg: 'transparent', key };
	}

	//conslog(els.map(x=>`${x.scale} ${x.w}`))

	let cont = arrangeShapesEvenlyCircle(300, arrTake(els, n), dPage);
	arrChildren(cont).forEach(x => console.log(x));
}
async function test03_shapes() {
	await loadAssetsStaticPreload();

	let n = 8;
	let group = 'animals_nature';
	let list = Object.keys(M.emogroup[group]); //console.log(list);
	//return;
	let subgroups = matchWildcardArray('animal*', list);
	let keypool = subgroups.map(x => M.emogroup[group][x]).flat();
	//console.log(keypool);

	let keys = rChoose(keypool, n);

	let scaleList = [.6, .75, 1];
	let scales = keys.map(x => rChoose(scaleList));
	let uniformSize = 40;
	//const els = [{ w: 40, h: 30, bg: '#ff6b6b' }, { w: 50, h: 50, bg: '#4ecdc4' }, { w: 35, h: 45, bg: '#ffe66d' }, { w: 60, h: 30, bg: '#1a535c' }, { w: 45, h: 45, bg: '#ff9f43' }, { w: 30, h: 30, bg: '#ee5253' }, { w: 55, h: 35, bg: '#10ac84' }, { w: 20, h: 30, bg: '#ff6b6b' }, { w: 10, h: 20, bg: '#4ecdc4' }, { w: 35, h: 32, bg: '#ffe66d' }, { w: 60, h: 30, bg: '#1a535c' }, { w: 45, h: 45, bg: '#ff9f43' }, { w: 60, h: 30, bg: '#1a535c' }, { w: 45, h: 45, bg: '#ff9f43' },];
	let els = [];
	for (const i of range(n)) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		//let baseIconSz = uniformSize / 1.5;
		let sz = uniformSize * scale;
		els[i] = { scale, w: sz, h: sz, bg: 'transparent', key };
	}

	//conslog(els.map(x=>`${x.scale} ${x.w}`))

	let cont = arrangeShapesEvenlyCircle(300, arrTake(els, n), dPage);
	arrChildren(cont).forEach(x => console.log(x));

	return;


	let t = Date.now();
	for (const sz of [100, 180, 250, 300]) {
		for (const n of [7, 10, 12, 14, 20])
			arrangeShapesEvenlyCircle(sz, arrTake(els, n), dPage);
	}

	let t1 = Date.now();
	console.log(t1 - t); return;

	await mSleep(100);

	t = Date.now();
	for (const sz of [100, 180, 250, 300]) {
		for (const n of [7, 10, 12, 14, 20])
			arrangeShapesEvenlyCircle1(sz, arrTake(els, n), dPage);
	}
	t1 = Date.now();
	console.log(t1 - t);




}
async function test00_shapes() {
	// Define your list of items with mixed dimensions
	await loadAssetsStaticPreload();

	let n = 100;
	let keys = rChoose(M.emokeys, n);
	let scaleList = [.5, .75, 1, 1.25, 1.5];
	let scales = keys.map(x => rChoose(scaleList));

	let numRows = 2;
	let numCols = 15;
	let uniformSize = 40;
	//const els = [{ w: 40, h: 30, bg: '#ff6b6b' }, { w: 50, h: 50, bg: '#4ecdc4' }, { w: 35, h: 45, bg: '#ffe66d' }, { w: 60, h: 30, bg: '#1a535c' }, { w: 45, h: 45, bg: '#ff9f43' }, { w: 30, h: 30, bg: '#ee5253' }, { w: 55, h: 35, bg: '#10ac84' }, { w: 20, h: 30, bg: '#ff6b6b' }, { w: 10, h: 20, bg: '#4ecdc4' }, { w: 35, h: 32, bg: '#ffe66d' }, { w: 60, h: 30, bg: '#1a535c' }, { w: 45, h: 45, bg: '#ff9f43' }, { w: 60, h: 30, bg: '#1a535c' }, { w: 45, h: 45, bg: '#ff9f43' },];

	// Target parent wrapper element
	let els = [];
	for (const i of range(20)) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		// Calculate the size of the emoji icon base bounding box limits
		// Note: We use uniformSize divided by 1.5 to make sure scaled-up icons (1.5x) fit without overflow
		let baseIconSz = uniformSize / 1.5;
		let sz = baseIconSz * scale;
		els[i] = { w: sz, h: sz, bg: rColor() };
	}
	let dPage = document.getElementById('dPage');
	//let d2 = mDom(dPage,{w:300,h:300})
	let gap = 10;
	let d2 = mDom(dPage, { display: 'flex', bg: 'blue', w: 1000, h: 100, box: true, padding: gap, overflow: 'hidden' });

	// Inject structural grid constraints
	// d2.style.display = 'grid';
	// d2.style.gridTemplateColumns = `repeat(${numCols}, ${uniformSize}px)`;
	// d2.style.gridTemplateRows = `repeat(${numRows}, ${uniformSize}px)`;
	// d2.style.gap = `${gap}px`;
	// d2.style.alignContent = 'start';
	// d2.style.justifyContent = 'start';

	//return;
	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];

		// Calculate the size of the emoji icon base bounding box limits
		// Note: We use uniformSize divided by 1.5 to make sure scaled-up icons (1.5x) fit without overflow
		let baseIconSz = uniformSize / 1.5;
		let sz = baseIconSz * scale;
		console.log(sz);
		// Each outer element shell takes exactly 100% of its designated grid track space
		let styles2 = { w: sz, h: sz, fz: sz * .8, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'auto' }
		let styles = {
			bg: 'red',
			w: uniformSize,
			h: uniformSize,
			box: true,
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			margin: gap
		};
		let d0 = mDom(d2, styles, { key });

		let d1 = mKey(key, d0, styles2, { key });

		// Drill into the target child node icon element and force absolute alignment clustering
		// let dIcon = d1.firstChild || d1; //console.log(dIcon,dIcon.style)
		// if (dIcon && dIcon.style) {
		//   dIcon.style.width = `${sz}px`;
		//   dIcon.style.height = `${sz}px`;
		//   dIcon.style.fontSize = `${sz * 0.8}px`;
		//   dIcon.style.display = 'flex';
		//   dIcon.style.alignItems = 'center';
		//   dIcon.style.justifyContent = 'center';
		//   dIcon.style.margin = 'auto'; // Locks position right in the core center point
		// }

		// els.push(d0);
	}

	for (const sz of [180, 250, 300, 400, 500]) {
		for (const n of [7, 10, 12, 14])
			arrangeShapesEvenlyCircle(sz, arrTake(els, n), dPage);
	}



}
async function test02_shapes() {
	// Define your list of items with mixed dimensions

	const childRectangles = [
		{ w: 40, h: 30, bg: '#ff6b6b' },
		{ w: 50, h: 50, bg: '#4ecdc4' },
		{ w: 35, h: 45, bg: '#ffe66d' },
		{ w: 60, h: 30, bg: '#1a535c' },
		{ w: 45, h: 45, bg: '#ff9f43' },
		{ w: 30, h: 30, bg: '#ee5253' },
		{ w: 55, h: 35, bg: '#10ac84' },
		{ w: 20, h: 30, bg: '#ff6b6b' },
		{ w: 10, h: 20, bg: '#4ecdc4' },
		{ w: 35, h: 32, bg: '#ffe66d' },
		{ w: 60, h: 30, bg: '#1a535c' },
		{ w: 45, h: 45, bg: '#ff9f43' },
		{ w: 60, h: 30, bg: '#1a535c' },
		{ w: 45, h: 45, bg: '#ff9f43' },
	];

	// Target parent wrapper element
	const mainWall = document.getElementById('dPage');

	for (const sz of [180, 250, 300, 400, 500]) {
		for (const n of [7, 10, 12, 14])
			arrangeShapesEvenlyCircle(sz, arrTake(childRectangles, n), mainWall);
	}
}
async function test0_mKey() {
	await loadAssetsStaticPreload();
	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;

	let n = 33;
	let keys = rChoose(M.emokeys, n);
	let scaleList = [.5, .75, 1, 1.25, 1.5];
	let scales = keys.map(x => rChoose(scaleList));

	let numRows = 5;
	let numCols = 5;
	let uniformSize = 75;
	showPics(dParent, keys, scales, numRows, numCols, uniformSize)
}
async function test013_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;

	// 1. Inputs for the strict Grid dimension limits
	let numRowsVisible = 4;
	let numCols = 5;

	// Each grid cell framework base sizes
	let uniformWidth = 75;  // 50 * 1.5 (covers maximum scale size cleanly)
	let uniformHeight = 75; // 50 * 1.5 

	// 2. Mathematically exact container measurements derived from track setups
	let containerWidth = numCols * uniformWidth + (numCols - 1) * gap + (2 * gap);
	let containerHeight = numRowsVisible * uniformHeight + (numRowsVisible - 1) * gap + (2 * gap);

	// Control Buttons Header
	let dControls = mDom(dParent, { display: 'flex', gap: 20, margin: 10 });
	let btnUp = mDom(dControls, { tag: 'button', html: 'Page Up (▲)', cursor: 'pointer', padding: '5px 15px' });
	let btnDown = mDom(dControls, { tag: 'button', html: 'Page Down (▼)', cursor: 'pointer', padding: '5px 15px' });
	let txtPage = mDom(dControls, { tag: 'span', html: 'Page: 1', 'font-weight': 'bold', 'align-self': 'center' });

	// 3. Main Fixed Box Container Styled Explicitly as a Strict CSS Grid
	let d2 = mDom(dParent, {
		bg: 'blue',
		w: containerWidth,
		h: containerHeight,
		box: true,
		padding: gap,
		overflow: 'hidden'
	});

	// Inject CSS Grid rules directly to ensure columns and rows match your criteria perfectly
	d2.style.display = 'grid';
	d2.style.gridTemplateColumns = `repeat(${numCols}, ${uniformWidth}px)`;
	d2.style.gridTemplateRows = `repeat(${numRowsVisible}, ${uniformHeight}px)`;
	d2.style.gap = `${gap}px`;
	d2.style.alignContent = 'start';
	d2.style.justifyContent = 'start';

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	let currentPage = 0;
	// Total elements per page is now locked analytically by your grid definitions!
	let itemsPerPage = numCols * numRowsVisible;

	let renderedElements = [];
	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;

		// 4. Each item cell wrapper occupies 100% of its uniform grid slot, 
		// and uses centering rules to anchor the variable emoji right in the middle.
		let styles = {
			bg: 'red',
			w100: true,
			h100: true,
			box: true,
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
		};

		let d1 = mKey(key, d2, styles, { key });

		// Target the actual emoji symbol element inside the cell wrapper to center it
		let dIcon = d1.firstChild || d1;
		if (dIcon && dIcon.style) {
			dIcon.style.width = `${sz}px`;
			dIcon.style.height = `${sz}px`;
			dIcon.style.fontSize = `${sz * 0.8}px`;
			dIcon.style.display = 'flex';
			dIcon.style.alignItems = 'center';
			dIcon.style.justifyContent = 'center';
			dIcon.style.margin = 'auto'; // Locks alignment directly in the true core center
		}

		renderedElements.push(d1);
	}

	// 5. Update Visibility Slices
	function renderCurrentPage() {
		let startIdx = currentPage * itemsPerPage;
		let endIdx = startIdx + itemsPerPage;

		renderedElements.forEach((el, idx) => {
			if (idx >= startIdx && idx < endIdx) {
				el.style.display = 'inline-flex';
			} else {
				el.style.display = 'none';
			}
		});

		txtPage.innerHTML = `Page: ${currentPage + 1} / ${Math.ceil(n / itemsPerPage)}`;
	}

	function pageUp() {
		if (currentPage > 0) {
			currentPage--;
			renderCurrentPage();
		}
	}

	function pageDown() {
		let maxPage = Math.ceil(n / itemsPerPage) - 1;
		if (currentPage < maxPage) {
			currentPage++;
			renderCurrentPage();
		}
	}

	btnUp.onclick = pageUp;
	btnDown.onclick = pageDown;

	window.onkeydown = function (e) {
		if (e.key === 'PageDown' || e.key === 'ArrowDown' || e.code === 'PageDown') {
			e.preventDefault();
			pageDown();
		} else if (e.key === 'PageUp' || e.key === 'ArrowUp' || e.code === 'PageUp') {
			e.preventDefault();
			pageUp();
		}
	};

	// Run the render calculation instantly since there's no layout guesswork required anymore
	renderCurrentPage();
}
async function test012_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;

	let uniformHeight = 50 * 1.25; // 62.5px
	let numRowsVisible = 4; // Changing this to 4 or 10 now works flawlessly!
	let containerHeight = numRowsVisible * (uniformHeight + gap) + gap;

	// Control Buttons Header
	let dControls = mDom(dParent, { display: 'flex', gap: 20, margin: 10 });
	let btnUp = mDom(dControls, { tag: 'button', html: 'Page Up (▲)', cursor: 'pointer', padding: '5px 15px' });
	let btnDown = mDom(dControls, { tag: 'button', html: 'Page Down (▼)', cursor: 'pointer', padding: '5px 15px' });
	let txtPage = mDom(dControls, { tag: 'span', html: 'Page: 1', 'font-weight': 'bold', 'align-self': 'center' });

	// Main fixed window box
	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		h: containerHeight,
		w: 400,
		box: true,
		padding: gap,
		overflow: 'hidden',
		alignContent: 'flex-start',
		justifyContent: 'flex-start'
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	let currentPage = 0;
	let itemsPerPage = 0;

	let renderedElements = [];
	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;

		let styles = {
			bg: 'red',
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,
			minHeight: `${uniformHeight}px`,
			maxHeight: `${uniformHeight}px`,
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center'
		};

		let d1 = mKey(key, d2, styles, { key });
		renderedElements.push(d1);
	}

	// FIXED CAPACITY LOGIC:
	function updatePageCapacity() {
		if (renderedElements.length === 0) return;

		let containerWidth = d2.clientWidth - (2 * gap);

		// Instead of using element [0], calculate the real MAXIMUM possible element width 
		// to guarantee elements never break out vertically.
		let maxScale = 1.25;
		let maxElementWidth = 50 * maxScale;
		let sampleWidth = maxElementWidth + gap;

		let itemsPerRow = Math.floor((containerWidth + gap) / sampleWidth) || 1;

		itemsPerPage = itemsPerRow * numRowsVisible;
		renderCurrentPage();
	}

	function renderCurrentPage() {
		let startIdx = currentPage * itemsPerPage;
		let endIdx = startIdx + itemsPerPage;

		renderedElements.forEach((el, idx) => {
			if (idx >= startIdx && idx < endIdx) {
				el.style.display = 'inline-flex';
			} else {
				el.style.display = 'none';
			}
		});

		txtPage.innerHTML = `Page: ${currentPage + 1} / ${Math.ceil(n / itemsPerPage)}`;
	}

	function pageUp() {
		if (currentPage > 0) {
			currentPage--;
			renderCurrentPage();
		}
	}

	function pageDown() {
		let maxPage = Math.ceil(n / itemsPerPage) - 1;
		if (currentPage < maxPage) {
			currentPage++;
			renderCurrentPage();
		}
	}

	btnUp.onclick = pageUp;
	btnDown.onclick = pageDown;

	window.onkeydown = function (e) {
		if (e.key === 'PageDown' || e.key === 'ArrowDown' || e.code === 'PageDown') {
			e.preventDefault();
			pageDown();
		} else if (e.key === 'PageUp' || e.key === 'ArrowUp' || e.code === 'PageUp') {
			e.preventDefault();
			pageUp();
		}
	};

	setTimeout(updatePageCapacity, 50);
}
async function test0MIST_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;

	// 1. Establish the uniform height once
	let uniformHeight = 50 * 1.5; // Using 1.5 to safely cover the largest scale
	let numRowsVisible = 4;

	// 2. Use that exact variable to calculate the container size
	// Formula: (Rows * height) + (Rows * gap) + extra gap for the bottom padding
	let containerHeight = numRowsVisible * (uniformHeight + gap) + gap;

	let dControls = mDom(dParent, { display: 'flex', gap: 20, margin: 10 });
	let btnUp = mDom(dControls, { tag: 'button', html: 'Page Up (▲)' });
	let btnDown = mDom(dControls, { tag: 'button', html: 'Page Down (▼)' });
	let txtPage = mDom(dControls, { tag: 'span', html: 'Page: 1', alignSelf: 'center' });

	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		h: containerHeight, // Container size derived from uniformHeight
		w: 400,
		box: true,
		padding: gap,
		overflow: 'hidden',
		alignContent: 'flex-start'
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	let currentPage = 0;
	let itemsPerPage = 0;
	let renderedElements = [];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;

		let styles = {
			bg: 'red',
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,
			// 3. Force every item into the uniformHeight box
			minHeight: `${uniformHeight}px`,
			maxHeight: `${uniformHeight}px`,
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center'
		};

		let d1 = mKey(key, d2, styles, { key });
		renderedElements.push(d1);
	}

	function updatePageCapacity() {
		let containerWidth = d2.clientWidth - (2 * gap);
		// Use the max width an element can take to determine columns
		let maxElementWidth = 50 * 1.5;
		let itemsPerRow = Math.floor((containerWidth + gap) / (maxElementWidth + gap)) || 1;

		itemsPerPage = itemsPerRow * numRowsVisible;
		renderCurrentPage();
	}

	function renderCurrentPage() {
		let startIdx = currentPage * itemsPerPage;
		let endIdx = startIdx + itemsPerPage;

		renderedElements.forEach((el, idx) => {
			el.style.display = (idx >= startIdx && idx < endIdx) ? 'inline-flex' : 'none';
		});

		txtPage.innerHTML = `Page: ${currentPage + 1} / ${Math.ceil(n / itemsPerPage)}`;
	}

	btnUp.onclick = () => { if (currentPage > 0) { currentPage--; renderCurrentPage(); } };
	btnDown.onclick = () => { if (currentPage < (Math.ceil(n / itemsPerPage) - 1)) { currentPage++; renderCurrentPage(); } };

	setTimeout(updatePageCapacity, 50);
}
async function test011_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;

	let uniformHeight = 50 * 1.25; // 62.5px
	let numRowsVisible = 4;
	let containerHeight = numRowsVisible * (uniformHeight + gap) + gap;

	// Render control buttons header
	let dControls = mDom(dParent, { display: 'flex', gap: 20, margin: 10 });
	let btnUp = mDom(dControls, { tag: 'button', html: 'Page Up (▲)', cursor: 'pointer', padding: '5px 15px' });
	let btnDown = mDom(dControls, { tag: 'button', html: 'Page Down (▼)', cursor: 'pointer', padding: '5px 15px' });
	let txtPage = mDom(dControls, { tag: 'span', html: 'Page: 1', 'font-weight': 'bold', 'align-self': 'center' });

	// Main fixed box window
	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		h: containerHeight,
		w: 400,
		box: true,
		padding: gap,
		overflow: 'hidden',

		// CRITICAL FIX: Stops flex columns/rows from stretching out across empty height space.
		// This forces items on partial pages to group together cleanly at the very top.
		alignContent: 'flex-start',
		justifyContent: 'flex-start'
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	let currentPage = 0;
	let itemsPerPage = 0;

	let renderedElements = [];
	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;

		let styles = {
			bg: 'red',
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,
			minHeight: `${uniformHeight}px`,
			maxHeight: `${uniformHeight}px`,
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center'
		};

		let d1 = mKey(key, d2, styles, { key });
		renderedElements.push(d1);
	}

	function updatePageCapacity() {
		if (renderedElements.length === 0) return;

		let containerWidth = d2.clientWidth - (2 * gap);
		let sampleWidth = renderedElements[0].offsetWidth + gap;
		let itemsPerRow = Math.floor((containerWidth + gap) / sampleWidth) || 1;

		itemsPerPage = itemsPerRow * numRowsVisible;
		renderCurrentPage();
	}

	function renderCurrentPage() {
		let startIdx = currentPage * itemsPerPage;
		let endIdx = startIdx + itemsPerPage;

		renderedElements.forEach((el, idx) => {
			if (idx >= startIdx && idx < endIdx) {
				el.style.display = 'inline-flex';
			} else {
				el.style.display = 'none';
			}
		});

		txtPage.innerHTML = `Page: ${currentPage + 1} / ${Math.ceil(n / itemsPerPage)}`;
	}

	function pageUp() {
		if (currentPage > 0) {
			currentPage--;
			renderCurrentPage();
		}
	}

	function pageDown() {
		let maxPage = Math.ceil(n / itemsPerPage) - 1;
		if (currentPage < maxPage) {
			currentPage++;
			renderCurrentPage();
		}
	}

	btnUp.onclick = pageUp;
	btnDown.onclick = pageDown;

	window.onkeydown = function (e) {
		if (e.key === 'PageDown' || e.key === 'ArrowDown' || e.code === 'PageDown') {
			e.preventDefault();
			pageDown();
		} else if (e.key === 'PageUp' || e.key === 'ArrowUp' || e.code === 'PageUp') {
			e.preventDefault();
			pageUp();
		}
	};

	setTimeout(updatePageCapacity, 50);
}
async function test010_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;

	// 1. Structural dimensions matching your exact mathematical request
	let uniformHeight = 50 * 1.25; // 62.5px (largest element scale ceiling)
	let numRowsVisible = 10;
	let containerHeight = numRowsVisible * (uniformHeight + gap) + gap;

	// Render the control layout header first
	let dControls = mDom(dParent, { display: 'flex', gap: 20, margin: 10 });
	let btnUp = mDom(dControls, { tag: 'button', html: 'Page Up (▲)', cursor: 'pointer', padding: '5px 15px' });
	let btnDown = mDom(dControls, { tag: 'button', html: 'Page Down (▼)', cursor: 'pointer', padding: '5px 15px' });
	let txtPage = mDom(dControls, { tag: 'span', html: 'Page: 1', 'font-weight': 'bold', 'align-self': 'center' });

	// Main fixed bounding box container window
	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		h: containerHeight,
		w: 400,
		box: true,
		padding: gap,
		overflow: 'hidden' // Completely disable standard scrollbars
	});

	// Generate dataset parameters
	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	// 2. Pagination State Tracking Variable
	let currentPage = 0;
	let itemsPerPage = 0; // Calculated dynamically below after rendering

	// Render all assets upfront, but handle visibility via custom chunk segments
	let renderedElements = [];
	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;

		let styles = {
			bg: 'red',
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,
			minHeight: `${uniformHeight}px`,
			maxHeight: `${uniformHeight}px`,
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center'
		};

		let d1 = mKey(key, d2, styles, { key });
		renderedElements.push(d1);
	}

	// 3. Dynamic Capacity Check: See how many elements naturally fit per 10-row page
	function updatePageCapacity() {
		if (renderedElements.length === 0) return;

		let containerWidth = d2.clientWidth - (2 * gap);
		let sampleWidth = renderedElements[0].offsetWidth + gap;
		let itemsPerRow = Math.floor((containerWidth + gap) / sampleWidth) || 1;

		itemsPerPage = itemsPerRow * numRowsVisible;
		renderCurrentPage();
	}

	// 4. Update element visibility flags based on the target chunk slice range
	function renderCurrentPage() {
		let startIdx = currentPage * itemsPerPage;
		let endIdx = startIdx + itemsPerPage;

		renderedElements.forEach((el, idx) => {
			if (idx >= startIdx && idx < endIdx) {
				el.style.display = 'inline-flex'; // Show item
			} else {
				el.style.display = 'none'; // Hide item
			}
		});

		txtPage.innerHTML = `Page: ${currentPage + 1} / ${Math.ceil(n / itemsPerPage)}`;
	}

	// 5. Navigation Control functions
	function pageUp() {
		if (currentPage > 0) {
			currentPage--;
			renderCurrentPage();
		}
	}

	function pageDown() {
		let maxPage = Math.ceil(n / itemsPerPage) - 1;
		if (currentPage < maxPage) {
			currentPage++;
			renderCurrentPage();
		}
	}

	// Bind Mouse UI Click Events
	btnUp.onclick = pageUp;
	btnDown.onclick = pageDown;

	// 6. Global Keyboard Event Intercept (PageUp / PageDown keys)
	window.onkeydown = function (e) {
		if (e.key === 'PageDown' || e.key === 'ArrowDown' || e.code === 'PageDown') {
			e.preventDefault();
			pageDown();
		} else if (e.key === 'PageUp' || e.key === 'ArrowUp' || e.code === 'PageUp') {
			e.preventDefault();
			pageUp();
		}
	};

	// Run initial capacity calculation layout check after elements settle in the DOM tree
	setTimeout(updatePageCapacity, 50);
}
async function test09_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;

	// 1. Calculate the uniform grid row height based on your largest element (50 * 1.25)
	let uniformRowHeight = 50 * 1.25; // 62.5px

	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		h: 500,
		w: 400,
		overy: 'auto',

		// Enable native vertical scroll snapping
		scrollSnapType: 'y mandatory',

		// Offset snap calculations by your gap so things don't slide under the top padding edge
		scrollPaddingTop: gap,
		box: true,
		padding: gap,
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50;// * scale;

		let styles = {
			bg: 'red',
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,

			// 2. CRITICAL CHANGE: Force all cells to conform to the exact same baseline bounding height
			// This guarantees every wrapped layout row becomes perfectly uniform!
			minHeight: `${uniformRowHeight}px`,
			maxHeight: `${uniformRowHeight}px`,

			// Make sure elements center their inner symbols vertically within the unified row boundary
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',

			// Snaps the container window directly to the top edge of this cell row layer
			scrollSnapAlign: 'start'
		};

		let d1 = mKey(key, d2, styles, { key });
	}
}
async function test0NO_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';

	let d2 = mGridFlex(document.body, {
		gap,
		bg: 'blue',
		w: 400,
		h: 500,
		box: true,
		padding: gap,
		// Enable vertical snapping
		scrollSnapType: 'y mandatory',
		// This is the secret sauce: it aligns the snap point with your padding
		scrollPaddingTop: gap,
		overy: 'auto'
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50; //50 * scale;

		// styles object for the emoji
		let styles = {
			bg: 'red',
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,
			// Ensure each individual item knows it is a snap point
			scrollSnapAlign: 'start'
		};

		let d1 = mKey(key, d2, styles, { key });
	}
}
async function test08_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';

	let d2 = mGridFlex(document.body, {
		gap,
		bg: 'blue',
		w: 400,
		h: 500,
		box: true,
		padding: gap,
		// Enable vertical snapping
		scrollSnapType: 'y mandatory',
		// This is the secret sauce: it aligns the snap point with your padding
		scrollPaddingTop: gap,
		overy: 'auto'
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * 1.25; //scale;

		// styles object for the emoji
		let styles = {
			bg: 'red',
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,
			// Ensure each individual item knows it is a snap point
			scrollSnapAlign: 'start'
		};

		let d1 = mKey(key, d2, styles, { key });
	}
}
async function test07_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;

	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		h: 500,
		w: 400,
		overy: 'auto',
		scrollSnapType: 'y mandatory', // Enforces strict vertical alignment snapping
		box: true,
		padding: gap,
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;

		// 2. Add 'scrollSnapAlign' to individual items.
		// 'start' locks the top edge of the items cleanly to the top viewport edge of dParent.
		let styles = {
			bg: 'red',
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,
			scrollSnapAlign: 'start'
		};

		let d1 = mKey(key, d2, styles, { key });
	}
}
async function test06_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	let dParent = document.body;

	// 1. Configure dParent to capture and snap vertical scroll boundaries
	// let dParent = mDom(document.body, {
	//   h: 500,
	//   w: 400,
	//   overy: 'auto',
	//   scrollSnapType: 'y mandatory' // Enforces strict vertical alignment snapping
	// });

	// // d2 expands naturally to match the full content height
	// let d2 = mGridFlex(dParent, {
	//   gap,
	//   bg: 'blue',
	//   w100: true,
	//   box: true,
	//   padding: gap,
	// });

	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		h: 500,
		w: 400,
		overy: 'auto',
		scrollSnapType: 'y mandatory', // Enforces strict vertical alignment snapping
		box: true,
		padding: gap,
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;

		// 2. Add 'scrollSnapAlign' to individual items.
		// 'start' locks the top edge of the items cleanly to the top viewport edge of dParent.
		let styles = {
			bg: 'red',
			w: sz,
			h: sz,
			sz,
			fz: sz * .8,
			scrollSnapAlign: 'start'
		};

		let d1 = mKey(key, d2, styles, { key });
	}
}
async function test05_mKey() {
	await loadAssetsStaticPreload();
	let gap = 10;

	mClear(document.body);
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	// let dParent = mDom(document.body,{h:'100vh',overy: 'auto'});
	let dParent = mDom(document.body, { h: 500, w: 400, overy: 'auto' });

	// d2 is the element with the vertical scrollbar
	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		w100: true,
		// Height must be constrained for a scrollbar to appear.
		// This fills the screen height minus the parent's padding.
		//h: `calc(100vh - ${gap * 2}px)`, 
		box: true,
		//h100:true,
		padding: gap,
		//overy: 'auto' // This places the scrollbar directly on d2
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;
		let styles = { bg: 'red', w: sz, h: sz, sz, fz: sz * .8 };
		let d1 = mKey(key, d2, styles, { key });
	}

}
async function test04_mKey() {
	mClear(document.body);

	// Prevent the main window and dParent from scrolling
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';

	await loadAssetsStaticPreload();
	let gap = 10;

	// dParent acts as a static layout container
	let dParent = mDom(document.body, {
		bg: 'green',
		box: true,
		h: '100vh',
		w100: true,
		padding: gap,
		overflow: 'hidden' // Ensure dParent itself never scrolls
	});

	// d2 is the element with the vertical scrollbar
	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		w: 550,
		// Height must be constrained for a scrollbar to appear.
		// This fills the screen height minus the parent's padding.
		h: `calc(100vh - ${gap * 2}px)`,
		box: true,
		padding: gap,
		overflowY: 'auto' // This places the scrollbar directly on d2
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;
		let styles = { bg: 'red', w: sz, h: sz, sz, fz: sz * .8 };
		let d1 = mKey(key, d2, styles, { key });
	}
}
async function test03_mKey() {
	mClear(document.body);

	// Prevent the main window/body from scrolling
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';

	await loadAssetsStaticPreload();
	let gap = 10;

	// dParent acts as the 'Scroll Container'
	// It has a fixed height (100vh) and handles the scrolling
	let dParent = mDom(document.body, {
		bg: 'green',
		box: true,
		h: '100vh',
		w100: true,
		padding: gap,
	});

	// d2 acts as the 'Content Wrapper'
	// It will naturally expand (span) to fit all 900 items
	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		w: 550,
		h: 'auto', // d2 height now spans its content
		box: true,
		overflowY: 'scroll', // This allows you to scroll down the grid
		padding: gap
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;
		let styles = { bg: 'red', w: sz, h: sz, sz, fz: sz * .8 };
		let d1 = mKey(key, d2, styles, { key });
	}
}
async function test01_mKey() {
	mClear(document.body);
	await loadAssetsStaticPreload(); console.log(M);
	let gap = 10;
	let dParent = mDom(document.body, { bg: 'green', box: 'true', h100: true, w100: true, padding: gap });
	let d2 = mGridFlex(dParent, { gap, bg: 'blue', w: 550, box: true, padding: gap });

	let n = 900;
	let keys = rChoose(M.emokeys, n);['badger', 'butterfly'];
	let scales = rChoose([.5, .75, 1, 1.25], n);
	scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];
	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;
		let styles = { bg: 'red', w: sz, h: sz, sz, fz: sz * .8 };
		let d1 = mKey(key, d2, styles, { key });
		console.log(styles);
		console.log('sz', sz);
		console.log(d1)
	}
}
async function test02_mKey() {
	mClear(document.body);

	// Force body to never scroll window-wide
	document.body.style.overflow = 'hidden';
	document.body.style.margin = '0';
	document.body.style.height = '100vh';

	await loadAssetsStaticPreload(); console.log(M);
	let gap = 10;

	// Use h: '100vh' or h100 with hidden overflow to enforce window boundaries
	let dParent = mDom(document.body, {
		bg: 'green',
		box: 'true',
		h: '100vh',
		w100: true,
		padding: gap,
		overflow: 'hidden' // Guarantees dParent will never show scrollbars
	});

	// For d2, we must cap its maximum height so it overflows internally 
	// instead of pushing its containers. calc(100vh - 2 * gap - 2 * padding) handles this perfectly.
	let d2 = mGridFlex(dParent, {
		gap,
		bg: 'blue',
		w: 550,
		h: `calc(100vh - ${gap * 4}px)`, // Accounts for top/bottom padding of dParent and d2
		box: true,
		padding: gap,
		overflowY: 'auto' // ONLY d2 will scroll vertically when items exceed height
	});

	let n = 900;
	let keys = rChoose(M.emokeys, n);
	let scales = [.5, .75, 1, 1.25, 1.5, 1.25, 1, .75, .5];

	for (let i = 0; i < n; i++) {
		let key = keys[i];
		let scale = scales[i % scales.length];
		let sz = 50 * scale;
		let styles = { bg: 'red', w: sz, h: sz, sz, fz: sz * .8 };
		let d1 = mKey(key, d2, styles, { key });
	}
}
async function test01_shapes() {
	// Define your list of items with mixed dimensions

	const childRectangles = [
		{ w: 40, h: 30, bg: '#ff6b6b' },
		{ w: 50, h: 50, bg: '#4ecdc4' },
		{ w: 35, h: 45, bg: '#ffe66d' },
		{ w: 60, h: 30, bg: '#1a535c' },
		{ w: 45, h: 45, bg: '#ff9f43' },
		{ w: 30, h: 30, bg: '#ee5253' },
		{ w: 55, h: 35, bg: '#10ac84' },
		{ w: 20, h: 30, bg: '#ff6b6b' },
		{ w: 10, h: 20, bg: '#4ecdc4' },
		{ w: 35, h: 32, bg: '#ffe66d' },
		{ w: 60, h: 30, bg: '#1a535c' },
		{ w: 45, h: 45, bg: '#ff9f43' },
		{ w: 60, h: 30, bg: '#1a535c' },
		{ w: 45, h: 45, bg: '#ff9f43' },
	];

	// Target parent wrapper element
	const mainWall = document.getElementById('dPage');

	for (const sz of [180, 250, 300, 400, 500]) {
		for (const n of [7, 10, 12, 14])
			arrangeShapesEvenlyCircle(sz, arrTake(childRectangles, n), mainWall);
	}

	return;

	// 1. Arrange them inside a Circle
	arrangeShapesEvenly('circle', 400, 400, childRectangles, mainWall);

	// 2. Arrange them inside a Triangle
	arrangeShapesEvenly('triangle', 400, 400, childRectangles, mainWall);

	// 3. Arrange them inside a standard Rectangle layout
	arrangeShapesEvenly('rectangle', 500, 300, childRectangles, mainWall);
}
async function test01_createGame() {
	await prelim();
	initUI();
	await postlim();
	//console.log(DA);return;

	//console.log(M.config.games.bluff);
	let table = createGameTable('bluff', ['diana', 'mimi'],
		{ min_handsize: 2, max_handsize: 2 },
		{
			diana: { playmode: 'bot', strategy: 'clairvoyant' },
			mimi: { playmode: 'bot', strategy: 'random' }
		});
	//console.log(table); return;
	await tableSaveNew(table);
	DA.tid = table.id;
	DA.menu = 'table';
	updateMain();

}
async function test0() {
	await prelim();
	initUI();
	await postlim();
}
async function test0_was() {
	await prelim();
	let d = mBy('dPage');
	mTimerCreate(d, { fz: 40, fg: 'hotpink', bg: 'rose', align: 'center', border: 'royal 15' }); //der started auch gleich
	d.onclick = async () => { mClear('dPage'); initUI(); await postlim(); }
	//console.log(M.colorNames)
}

async function BROKEN_test0_grid0() {
	await prelim();
	initUI();
	await postlim();
	pollOff();
	mClear('dMain'); let dParent = mBy('dMain');

	//let d = mDom('dMain',{transform:'translate(50%,50%)'});
	let d = mDom(dParent, { padding: 10, margin: 10 }); mCenterFlex(d);
	let line1 = mDom(d, { display: 'flex', gap: 10, margin: 10, place: 'center' });//mCenterCenterFlex(line1);
	mDom(line1, {}, { html: 'drag user images to rumor cards, then confirm' });
	mDom(line1, {}, { tag: 'button', html: 'confirm' });
	mLinebreak(d)
	let dg = mGrid(2, 3, d, { place: 'center', gap: 10, margin: 20 });

	//define cards and make them dropzones (mDropZone)
	let cKeys = ['KH', '2C', '3C'];
	for (const k of cKeys) {
		let cItem = uiTypeCard52(k, 150);
		let div = cItem.div;
		mAppend(dg, div);
		div.id = k;
		console.log(div.id);
	}
	let plNames = ['felix', 'mimi', 'amanda'];
	for (const p of plNames) {
		let pl = M.users[p];
		let du = mDom(dg, { margin: 10 }, { id: p });
		mAppend(du, get_user_pic(p, 50));
	}
	ariSetupRumorAssignment(plNames, cKeys, ariFinalizeRumorAssignment, true);
}
async function atest0_mod1() {
	await prelim();
	initUI();

	await postlim('felix');

}
async function atest0_mod0() {
	await prelim();
	initUI();

	await postlim('felix');

	let table = T; //console.log(table.players.felix)
	aritest0_buildings(table, U.name);
	await tableSaveUpdate(table);
	await updateMain();
}

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
	initUI();

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
	let topCard = uiTypeDeck(udeck, 'dDeck');
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
async function test19_deck_splay() {
	await loadAssetsStaticPreload();

	// let dOpenTable = mDom('dPage');
	let hand = ['KS', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', 'TC', 'JC', 'QC', 'KC', 'AC', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', 'TH', 'JH', 'QH', 'KH', 'AH'];
	for (const x of range(3)) { hand = hand.concat(hand); }
	// ui_type_deck(hand, dOpenTable, { maleft: 12 }, 'deck', 'deck');

	let deckCards = hand.map(key => uiTypeCard52(key, 150));
	let o = uiTypeDeck(deckCards, 'dPage', 'down');
	console.log(o.topCard)
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
	initUI();

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
	initUI();


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
async function test00() {
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
}
async function postlim(uname) {
	await DAInit();

	mStyle('dPage', {}, { className: 'wood' });

	await pollInit();

	await switchToUser(uname); // da wird M.users geladen!
}


