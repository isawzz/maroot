function accuse_get_card(ckey, h, w, backcolor = BLUE, ov = .3) {
	//console.log('ckey', ckey)
	if (is_color(ckey)) {
		return get_color_card(ckey,h)
	} else if (ckey.length > 3) {
		return get_number_card(ckey, h, null, backcolor, ov);
	} else {
		let info = get_c52j_info(ckey, backcolor);
		let card = cardFromInfo(info, h, w, ov);
		return card;
	}
}
function accuse_get_card_func(hcard = 80, backcolor = BLUE) { return ckey => accuse_get_card(ckey, hcard, null, backcolor); }

function aggregate_player_hands_by_rank(fen) {
	//fen.akku will contain all player hand cards! 
	//returns di {rank:count}
	let di_ranks = {};
	let akku = [];
	for (const uname in fen.players) {
		let pl = fen.players[uname];
		let hand = pl.hand;
		for (const c of hand) {
			akku.push(c);
			let r = c[0];
			if (isdef(di_ranks[r])) di_ranks[r] += 1; else di_ranks[r] = 1;
		}
	}
	//console.log('di_ranks', di_ranks);
	fen.akku = akku;
	return di_ranks;
}
function anim_toggle_face(item, ms = 300, callback = null) {
	let d = iDiv(item);
	mClass(d, 'aniflip');
	TO.anim = setTimeout(() => {
		if (item.faceUp) face_down(item); else face_up(item); mClassRemove(d, 'aniflip');
		if (isdef(callback)) callback();
	}, ms);
}
function anim_face_up(item, ms = 300, callback = null) { face_down(item); anim_toggle_face(item, callback); }
function anim_face_down(item, ms = 300, callback = null) { face_up(item); anim_toggle_face(item, callback); }
function ari_get_card_large(ckey, h, w, ov = .2) {
	let type = ckey[2];
	let sz = { largecard: 120, smallcard: 80 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	return card;
}
function ari_get_card(ckey, h, w, ov = .3) {
	//console.log('ckey', ckey);
	let type = ckey[2];
	let sz = { largecard: 100, smallcard: 50 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	else if (type == 'h') heritage_card_deco(card);
	return card;
}
function cardFromInfo(info, h, w, ov) {
	let svgCode = C52[info.c52key];
	let ckey = info.key;
	//console.log('ckey', ckey, info.rank, info.suit, get_color_of_card(ckey));
	if (info.rank == '*') {
		let color = get_color_of_card(ckey);
		if (color != 'red') svgCode = colored_jolly(color);
	}
	svgCode = '<div>' + svgCode + '</div>';
	let el = mCreateFrom(svgCode);
	h = valf(h, valf(info.h, 100));
	w = valf(w, h * .7);
	mSize(el, w, h);
	let res = {};
	copyKeys(info, res);
	copyKeys({ w: w, h: h, faceUp: true, div: el }, res);
	if (isdef(ov)) res.ov = ov;
	return res;

}
function calc_hand_value(hand, card_func = ferro_get_card) {
	let vals = hand.map(x => card_func(x).val);
	//console.log('vals', vals);
	let sum = vals.reduce((a, b) => a + b, 0);
	return sum;
}
function colored_jolly(color) {
	let id = `J_${color}`;
	let svg = `
		<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="card" face="1J" 
		height="100%" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="100%">
		<symbol id="J11" preserveAspectRatio="none" viewBox="0 0 1300 2000">
		<path fill="#FC4" d="M1095,1000A445,445 0 0 1 650,1445 445,445 0 0 1 205,1000 445,445 0 0 1 650,555 445,445 0 0 1 1095,1000Z"></path>
		</symbol>
		<symbol id="${id}" preserveAspectRatio="none" viewBox="0 0 1300 2000">
		<path fill="${color}" d="M317.05664,1294.416 100,1620l220,-60 40,240 140,-200 160,200 40,-200 180,180 60,-220 260,60 -236.67969,-304.3027A445,445 0 0 1 650,1445 445,445 0 0 1 317.05664,1294.416ZM831.71484,249.10742C687.94378,262.65874 542.4812,256.33752 420,520 369.08062,331.38331 278.61481,370.61289 187.77148,412.01367a75,75 0 0 1 2.52344,19.12695 75,75 0 0 1 -16.78515,47.19532c66.827,55.25537 117.57478,127.8247 155.77539,213.90429A445,445 0 0 1 650,555 445,445 0 0 1 924.33984,650.26562c42.39917,-50.4556 91.60026,-93.34711 167.51176,-106.5332a75,75 0 0 1 -0.6524,-9.14258 75,75 0 0 1 14.6172,-44.3457C1026.3517,437.47479 931.12146,446.83238 840,440 761.98041,388.07638 804.10248,338.17898 853.51758,288.4043a75,75 0 0 1 -21.80274,-39.29688z"></path>
		</symbol>
		<symbol id="J13" preserveAspectRatio="none" viewBox="0 0 1300 2000">
		<path fill="#44F" d="M879.65521,937.6026a40,40 0 0 1 -40,40 40,40 0 0 1 -40,-40 40,40 0 0 1 40,-40 40,40 0 0 1 40,40zm-379.31039,0a40,40 0 0 1 -40,40 40,40 0 0 1 -40,-40 40,40 0 0 1 40,-40 40,40 0 0 1 40,40z"></path>
		</symbol>
		<symbol id="J14" preserveAspectRatio="none" viewBox="0 0 1300 2000">
		<path stroke="#44F" stroke-linecap="round" stroke-linejoin="round" stroke-width="6" fill="none" d="M317.05664,1294.416 100,1620l220,-60 40,240 140,-200 160,200 40,-200 180,180 60,-220 260,60 -236.67969,-304.3027M1241.1987,534.58948a75,75 0 0 1 -75,75 75,75 0 0 1 -75,-75 75,75 0 0 1 75,-75 75,75 0 0 1 75,75zM980.11493,234.09686a75,75 0 0 1 -75,75 75,75 0 0 1 -75,-75 75,75 0 0 1 75,-75 75,75 0 0 1 75,75zM190.29556,431.1412a75,75 0 0 1 -75,75 75,75 0 0 1 -74.999997,-75 75,75 0 0 1 74.999997,-75 75,75 0 0 1 75,75zM924.3457,650.27148c42.40088,-50.45397 91.5936,-93.35356 167.5059,-106.53906 -0.4037,-3.03138 -0.6215,-6.0846 -0.6524,-9.14258 0.03,-15.96068 5.1503,-31.4957 14.6172,-44.3457C1026.3517,437.47479 931.12146,446.83238 840,440 761.98041,388.07638 804.10248,338.17898 853.51758,288.4043 842.40414,277.84182 834.79487,264.12701 831.71484,249.10742 687.94378,262.65874 542.4812,256.33752 420,520 369.08062,331.38331 278.61481,370.61289 187.77148,412.01367c1.66108,6.24042 2.50924,12.66925 2.52344,19.12695 -0.0209,17.1896 -5.94587,33.85038 -16.7832,47.19336 66.82714,55.25532 117.5686,127.8306 155.76953,213.91016M384.88867,1140c51.89013,98.343 153.91815,159.9189 265.11133,160 111.19809,-0.076 213.23257,-61.6527 265.125,-160M1095,1000A445,445 0 0 1 650,1445 445,445 0 0 1 205,1000 445,445 0 0 1 650,555 445,445 0 0 1 1095,1000Z"></path>
		</symbol>
		<rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
		<text x="-110" y="-115" fill="${color}" stroke="${color}" style="font:bold 60px sans-serif">*</text>
		<use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J11"></use>
		<use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#${id}"></use>
		<use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J13"></use>
		<use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J14"></use>
		</svg>
	`;
	return svg;

}
function correct_handsorting(hand, plname) {
	let pl = Z.fen.players[plname];
	//console.log('pl',pl,'Clientdata',Clientdata);
	let [cs, pls, locs] = [Clientdata.handsorting, pl.handsorting, localStorage.getItem('handsorting')];
	//console.log('correct_handsorting:', 'client', cs, 'pl', pls, 'stor', locs);
	let s = cs ?? pls ?? locs ?? Config.games[Z.game].defaulthandsorting;
	hand = sort_cards(hand, s == 'suit', 'CDSH', true, Z.func.rankstr);
	return hand;
}
function create_card_assets_c52() {
	let ranknames = { A: 'Ace', K: 'King', T: '10', J: 'Jack', Q: 'Queen' };
	let suitnames = { S: 'Spades', H: 'Hearts', C: 'Clubs', D: 'Diamonds' };
	let rankstr = '23456789TJQKA';
	let suitstr = 'SHDC';
	sz = 100;
	let di = {};
	for (const r of toLetters(rankstr)) {
		for (const s of toLetters(suitstr)) {
			let k = r + s;
			let info = di[k] = { key: k, val: 1, irank: rankstr.indexOf(r), isuit: suitstr.indexOf(s), rank: r, suit: s, color: RED, c52key: 'card_' + r + s, w: sz * .7, h: sz, sz: sz, ov: .25, friendly: `${isNumber(r) ? r : ranknames[r]} of ${suitnames[s]}`, short: `${r}${s}` };
			info.isort = info.isuit * 13 + info.irank;
		}
	}
	C52Cards = di;
	return di;
}
function create_fen_deck(cardtype, num_decks = 1, num_jokers = 0) {
	let arr = get_keys(C52Cards).map(x => x + cardtype);
	let newarr = [];
	while (num_decks > 0) { newarr = newarr.concat(arr); num_decks--; }

	while (num_jokers > 0) { newarr.push('*H' + cardtype); num_jokers--; }

	//console.log('arr',arr)
	return newarr;
}
function face_down_alt(item, bg, texture_name) {
	//console.log('haaaaaaaaaaaaaaaaaaaaaaaa')
	let dCover = item.live.dCover;
	if (nundef(dCover)) {
		let d = iDiv(item);
		dCover = item.live.dCover = mDiv(d, { background: bg, rounding: mGetStyle(d, 'rounding'), position: 'absolute', width: '100%', height: '100%', left: 0, top: 0 });
		let t = get_texture(texture_name);
		dCover.style.backgroundImage = t;
		dCover.style.backgroundRepeat = 'repeat';
	} else mStyle(dCover, { display: 'block' });
}
function face_down(item, color, texture) {
	if (!item.faceUp) return;
	if (isdef(texture) || lookup(item, ['live', 'dCover'])) {
		face_down_alt(item, color, texture);
	} else {
		let svgCode = C52.card_2B; //C52 is cached asset loaded in _start
		item.div.innerHTML = svgCode;
		if (nundef(color)) color = item.color;
		if (isdef(item.color)) item.div.children[0].children[1].setAttribute('fill', item.color);
	}
	item.faceUp = false;
}
function face_up(item) {
	if (item.faceUp) return;
	//console.log('html',item.html)
	if (lookup(item, ['live', 'dCover'])) mStyle(item.live.dCover, { display: 'none' });
	else item.div.innerHTML = isdef(item.c52key) ? C52[item.c52key] : item.html;
	item.faceUp = true;
}
function ferro_get_card(ckey, h, w, ov = .25) {
	//joker is represented as '*Hn' where second letter is digit 0..9 (up to 9 jokers in play!)
	// H suit damit er beim sortieren immer rechts aufscheint!
	let type = ckey[2];
	// let info = type == 'n' ? to_aristocard(ckey) : type == 'l' ? to_luxurycard(ckey) : to_commissioncard(ckey);
	//den joker gibt es NICHT!!!!
	//console.log('ckey',ckey)
	let info = ckey[0] == '*' ? get_joker_info() : jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2]; //n,l,c=mini...
	let [r, s] = [info.rank, info.suit];
	info.val = r == '*' ? 50 : r == 'A' ? 20 : 'TJQK'.includes(r) ? 10 : Number(r);
	//console.log('r',r,'val',info.val)
	info.color = RED;
	info.sz = info.h = valf(h, Config.ui.card.h);
	info.w = valf(w, info.sz * .7);
	info.irank = '23456789TJQKA*'.indexOf(r);
	info.isuit = 'SHCDJ'.indexOf(s);
	info.isort = info.isuit * 14 + info.irank;
	let card = cardFromInfo(info, h, w, ov);
	return card;
}
function find_index_of_jolly(j) { return j.findIndex(x => is_jolly(x)); }
function find_jolly_rank(j, rankstr = 'A23456789TJQKA') {
	let jolly_idx = find_index_of_jolly(j);
	if (jolly_idx == -1) return false;
	if (jolly_idx > 0) {
		let rank_before_index = j[jolly_idx - 1][0];
		let rank_needed = rankstr[rankstr.indexOf(rank_before_index) + 1];
		return rank_needed;
	} else {
		let rank_after_index = j[jolly_idx + 1][0];
		let rank_needed = rank_after_index == 'A' ? 'K' : rankstr[rankstr.indexOf(rank_after_index) - 1];
		return rank_needed;
	}
}
function get_color_of_card(ckey) { return is_color(ckey) ? ckey : ckey.length == 3 ? ['H', 'D'].includes(ckey[1]) ? 'red' : 'black' : stringAfter(ckey, '_'); }
function get_group_rank(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[0]; }
function get_sequence_suit(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[1]; }
function get_c52j_info(ckey, backcolor = BLUE) {
	let info;
	if (ckey[0] == '*') {
		//info = get_joker_info();
		info = {
			c52key: `card_0J`, //'card_1J', //`card_${1+n%2}`,
			color: "#e6194B",
			friendly: "Joker",
			key: ckey,
			h: 100,
			ov: 0.25,
			rank: "*",
			short: "J",
			suit: ckey[1],
			sz: 100,
			val: 0,
			w: 70,
		};
	} else {
		info = jsCopy(C52Cards[ckey.substring(0, 2)]);
	}
	info.key = ckey;
	info.cardtype = ckey[2];
	let [r, s] = [info.rank, info.suit];
	info.val = r == '*' ? 0 : r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = backcolor;
	info.sz = info.h = sz;
	info.w = valf(w, sz * .7);
	let ranks = valf(lookup(Z, ['fen', 'ranks']), '*A23456789TJQK'); //Z.fen.ranks;
	info.irank = ranks.indexOf(r);
	info.isuit = 'SHCD'.indexOf(s);
	info.isort = info.isuit * ranks.length + info.irank;
	return info;
}
function get_joker_info() {
	return {
		c52key: `card_0J`, //'card_1J', //`card_${1+n%2}`,
		color: "#e6194B",
		friendly: "Joker",
		key: '*Hn',
		h: 100,
		irank: 14,
		isort: 100,
		isuit: 3,
		ov: 0.25,
		rank: "*",
		short: "J",
		suit: "H",
		sz: 100,
		val: 1,
		w: 70,
	};
}
function get_container_styles(styles = {}) { let defaults = valf(Config.ui.container, {}); defaults.position = 'relative'; addKeys(defaults, styles); return styles; }
function get_containertitle_styles(styles = {}) { let defaults = valf(Config.ui.containertitle, {}); defaults.position = 'absolute'; addKeys(defaults, styles); return styles; }
function has_at_most_n_jolly(j, n = 1) { return j.filter(x => is_jolly(x)).length <= n; }
function has_jolly(j) { return firstCond(j, x => is_jolly(x)); }
function heritage_card_deco(card) {
	let d = iDiv(card); mStyle(d, { position: 'relative' });
	let d1 = mDiv(d, { fg: 'silver', fz: 11, family: 'tangerine', position: 'absolute', right: '36%', top: 1 }, null, 'heritage');
}
function is_card_key(ckey, rankstr = '*A23456789TJQK', suitstr = 'SHCD') {
	return is_nc_card(ckey) || is_color(ckey) || rankstr.includes(ckey[0]) && suitstr.includes(ckey[1]);
}
function is_jolly(ckey) { return ckey[0] == '*'; }
function is_joker(card) { return is_jolly(card.key); }
function is_overlapping_set(cards, max_jollies_allowed = 1, seqlen = 7, group_same_suit_allowed = true) {

	//sequence can be up or down
	//case 2,3,4,3,2 oder 2,3,4,5,4,3
	//auf jeden fall nimm mindestens 3 cards vom anfang: die muessen eine seq or group ergeben!
	//let orig_cards = jsCopy(cards);
	let istart = 0;
	let inextstart = 0;
	let lmin = 3;
	let legal = true;

	if (cards.length < lmin) return false;

	while (legal && istart <= cards.length - lmin) {
		let cl = cards.slice(istart, istart + lmin);
		//console.log('istart',istart,'looking at',cl.map(x=>x.key).join(','));
		//check that cl is a ferro set
		let set = ferro_is_set(cl, max_jollies_allowed, seqlen, group_same_suit_allowed);

		if (set) { istart++; inextstart = Math.min(istart + lmin, cards.length - 3); }
		else if (!set && inextstart == istart) return false;
		else istart++;

	}
	return cards.map(x => x.key);
}
function jolly_matches(key, j, rankstr = 'A23456789TJQKA') {
	let jolly_idx = find_index_of_jolly(j);
	if (jolly_idx == -1) return false;

	if (is_group(j)) {
		let r = get_group_rank(j);
		if (key[0] == r) return true;
	} else if (jolly_idx > 0) {
		let rank_before_index = j[jolly_idx - 1][0];
		let suit_needed = j[jolly_idx - 1][1];
		let rank_needed = rankstr[rankstr.indexOf(rank_before_index) + 1];
		if (key[0] == rank_needed && key[1] == suit_needed) return true;
	} else {
		let rank_after_index = j[jolly_idx + 1][0];
		let suit_needed = j[jolly_idx + 1][1];
		let rank_needed = rank_after_index == 'A' ? 'K' : rankstr[rankstr.indexOf(rank_after_index) - 1];
		if (key[0] == rank_needed && key[1] == suit_needed) return true;
	}
	return false;
}
function luxury_card_deco(card) {
	let d = iDiv(card); mStyle(d, { position: 'relative' });
	let d1 = mDiv(d, { fg: 'dimgray', fz: 11, family: 'tangerine', position: 'absolute', left: 0, top: 0, 'writing-mode': 'vertical-rl', transform: 'scale(-1)', top: '35%' }, null, 'Luxury');
	let html = `<img height=${18} src="../base/assets/images/icons/deco0.svg" style="transform:scaleX(-1);">`;
	d1 = mDiv(d, { position: 'absolute', bottom: -2, left: 3, opacity: .25 }, null, html);
}
function pop_top(o) {
	if (isEmpty(o.list)) return null;
	let t = o.get_topcard();	//console.log('===>get_topcard:',t.key)
	o.list.shift();
	o.renew(o.list, o.cardcontainer, o.items, o.get_card_func);
	return t;
}
function replace_jolly(key, j) {
	//assume validity has been verified and only 1 jolly per group
	let jolly_idx = find_index_of_jolly(j);
	j[jolly_idx] = key;
}
function remove_card_shadow(c) { iDiv(c).firstChild.setAttribute('class', null); }
function set_card_border(item, thickness = 1, color = 'black', dasharray) {
	//console.log('set_card_border', item, thickness, color);
	let d = iDiv(item);
	//console.log('item', item)
	let rect = lastDescendantOfType('rect', d);
	//console.log('rect', rect);
	//assertion(rect, 'NO RECT FOUND IN ELEM', d);
	if (rect) {
		rect.setAttribute('stroke-width', thickness);
		rect.setAttribute('stroke', color);
		if (isdef(dasharray)) rect.setAttribute('stroke-dasharray', dasharray);
	} else {
		mStyle(d, { border: `solid ${1}px ${color}` })
	}
}
function set_card_style(item, styles = {}, className) {
	console.log('set_card_style', item, styles);
	let d = iDiv(item);
	let svg = findDescendantOfType('svg', d);
	let rect = findDescendantOfType('rect', svg);

	//shadow style will be applied to svg!
	if (isdef(styles.shadow)) {
		let shadow = styles.shadow;
		delete styles.shadow;
		let hexcolor = colorFrom(styles.shadow);
		svg.style.filter = `drop-shadow(4px 5px 2px ${hexcolor})`;
	}
	if (isdef(styles.bg)) {
		let hexcolor = colorFrom(styles.bg);
		rect.setAttribute('stroke-width', 14); rect.setAttribute('stroke', hexcolor);
	}

	assertion(rect, 'NO RECT FOUND IN ELEM', d);
	mStyle(d, styles);
	if (isdef(className)) mClass(svg, className);
}
function set_card_style_works(c, styles, className) {
	let d = iDiv(c);
	mStyle(d, styles);
	d.firstChild.setAttribute('class', className);
}
function sheriff_card(name, color) {
	let di = SHERIFF.cards;
	let info = valf(di[name], { ksym: 'crossbow', kcenter: 'green apple', label: 'crossbow', type: 'contraband', value: 9, penalty: 4 });
	let bcolor = SHERIFF.color[info.type]; // type == 'legal' ? 'lime' : type == 'contraband' ? 'crimson' : 'orangered';
	let c = cPortrait(null, { margin: 12, border: `solid 4px ${bcolor}`, bg: valf(color, colorLight('gold', 60)) });
	let d = iDiv(c);
	//console.log('d', d);

	let ds = mSym(info.ksym, d, { sz: 30 }, 'tl');
	ds = mSymText(info.value, d, { sz: 25, rounding: '50%', bg: 'gold', margin: 3 }, 'tr');
	ds = mText(info.label.toUpperCase(), d, { family: 'Algerian', w: '100%', fz: 12, align: 'center', position: 'absolute', bottom: 0 });//mPlace(ds,'tc',0,8)
	ds = mText(info.label.toUpperCase(), d, { family: 'Algerian', w: '100%', fz: 12, align: 'center', position: 'absolute', top: 0 });//mPlace(ds,'tc',0,8)
	ds = mSymText(info.penalty, d, { sz: 25, rounding: '50%', bg: 'crimson', margin: 3 }, 'br');
	ds = mSym(info.kcenter, d, { sz: 70 }, 'cc'); mPos(ds, 'calc( 50% - 35px )', 'calc( 50% - 35px )');
	// ds = mText('penalty:',d,{fz:12,display:'inline'});mPlace(ds,'bc',0,8)
	//set_card_border(c,5,'lime')
	return c;
}
function sort_cards(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
	if (bySuit && byRank) {
		let buckets = arrBuckets(hand, x => x[1], suits);
		//console.log('buckets',buckets);
		for (const b of buckets) { sort_cards(b.list, false, null, true, rankstr); } //sort each bucket by rank!
		hand.length = 0; buckets.map(x => x.list.map(y => hand.push(y))); //aggregate buckets to form hand
	} else if (bySuit) hand.sort((a, b) => suits.indexOf(a[1]) - suits.indexOf(b[1])); //.charCodeAt(1)-b.charCodeAt(1)); 
	else if (byRank) hand.sort((a, b) => rankstr.indexOf(a[0]) - rankstr.indexOf(b[0]));
	return hand;
}
function sortByRank(ckeys, rankstr = '23456789TJQKA') {
	let ranks = toLetters(rankstr);
	ckeys.sort((a, b) => ranks.indexOf(a[0]) - ranks.indexOf(b[0]));
	return ckeys;
}
function sortCardItemsByRank(items, rankstr = '23456789TJQKA') {
	let ranks = toLetters(rankstr);
	items.sort((a, b) => ranks.indexOf(a.key[0]) - ranks.indexOf(b.key[0]));
	return items;
}
function sortCardItemsBySuit(items, suitstr = 'CDSH') {

	let ranks = toLetters(suitstr);
	items.sort((a, b) => ranks.indexOf(a.key[1]) - ranks.indexOf(b.key[1]));
	return items;
}
function sortCardItemsToSequence(items, rankstr = '23456789TJQKA', jolly_allowed = 1) {
	let ranks = toLetters(rankstr);
	let n = items.length;
	let jollies = items.filter(x => is_joker(x));
	if (jollies.length > jolly_allowed) { return null; } //if has jollies, make sure that there are no more than jolly_allowed
	let no_jolly = items.filter(x => !is_joker(x));
	let sorted = sortCardItemsByRank(no_jolly, rankstr);

	//count gaps
	let partial_sequences = [], seq = [sorted[0]], first, second;
	for (let i = 0; i < sorted.length - 1; i++) {
		first = sorted[i];
		second = sorted[i + 1];
		diff = second.irank - first.irank;
		if (diff == 1) { seq.push(second); }
		else {
			partial_sequences.push({ seq: seq, len: seq.length, diff_to_next: diff });
			seq = [second];
		}
	}
	diff = sorted[0].irank - (sorted[sorted.length - 1].irank - rankstr.length)
	if (!isEmpty(seq)) {
		partial_sequences.push({ seq: seq, len: seq.length, diff_to_next: diff });
	} else {
		arrLast(partial_sequences).diff_to_next = diff;
	}
	//now I have all the partial sequences!
	//console.log('partial_sequences', partial_sequences);

	//partial sequence with highest diff_to_next will be placed last in final sequence
	//find index of partial sequence with highest diff_to_next
	let i_max_diff = partial_sequences.findIndex(x => x.diff_to_next == Math.max(...partial_sequences.map(x => x.diff_to_next)));
	let max_diff = partial_sequences[i_max_diff].diff_to_next;
	//console.log('max_diff',max_diff); 

	let istart = (i_max_diff + 1) % partial_sequences.length;

	let final_sequence = [];
	let jollies_needed = 0;
	let len = partial_sequences.length;
	let ij = 0;
	for (let i = 0; i < len; i++) {
		let index = (i + istart) % len;
		let list = partial_sequences[index].seq;
		final_sequence = final_sequence.concat(list);
		let nj = partial_sequences[index].diff_to_next - 1;
		//console.log('list',list,'nj',nj)
		if (i < len - 1) {
			for (let j = 0; j < nj; j++) { final_sequence.push(jollies[ij++]); }
			jollies_needed += nj;
		}
	}
	//console.log('final_sequence', final_sequence.map(x=>x.key)); //.map(x=>x.key));
	//console.log('jollies_needed', jollies_needed);

	//now, sort sequence in place!
	for (let i = 0; i < final_sequence.length; i++) { items[i] = final_sequence[i]; }
	return jollies_needed;

}
function spread_hand(path, ov) {
	//console.log('path',path)
	let hand = lookup(UI, path.split('.'));
	//if (hand && isdef(hand.list)) hand = hand.list;
	//console.log('hand',hand)

	assertion(hand, 'hand does NOT exist', path);
	//console.log('hand', hand, getFunctionsNameThatCalledThisFunction());
	if (hand.ctype != 'hand') return;
	//console.log('hand.ctype', hand.ctype);
	if (isEmpty(hand.items)) return;
	//console.log('hand.items', hand.items);

	//console.log('hand UI', hand);
	let card = hand.items[0];
	if (nundef(ov)) ov = card.ov;
	if (hand.ov == ov) return;
	//console.log('hand.ov', hand.ov, 'ov', ov); hier geht err nur 1x hin pro hand!!!
	hand.ov = ov;
	let cont = hand.cardcontainer;
	//console.log('cont', cont);
	let items = hand.items;
	mContainerSplay(cont, hand.splay, card.w, card.h, items.length, ov * card.w);

	//clearElement(container);
	//items.map(x => ui_add_cards_to_hand_container(container, items));
}
function symbolcolor(card, color) {
	let d = iDiv(card);
	//get all symbol elements
	//let symbols = d.getElementsByClassName('symbol');
	let els = d.getElementsByTagName('symbol'); // findDescendantOfType('symbol', d);
	console.log('list', els)
	for (const el of els) {
		let html = el.innerHTML;
		let html1 = replaceAll(html, 'red', color);
		let html2 = replaceAll(html1, 'black', color);
		el.innerHTML = html2;
	}

}
function to_aristocard(ckey, sz = 100, color = RED, w) {
	//console.log('ckey', ckey);
	let info = jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2];
	let [r, s] = [info.rank, info.suit];
	info.val = r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = color;
	info.sz = info.h = sz;
	info.w = valf(w, sz * .7);
	info.irank = 'A23456789TJQK'.indexOf(r);
	info.isuit = 'SHCD'.indexOf(s);
	info.isort = info.isuit * 13 + info.irank;
	return info;
}
function to_luxurycard(ckey, sz = 100, color = 'gold', w) { return to_aristocard(ckey, sz, color); }
function to_commissioncard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
function to_rumorcard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
function toggle_face(item) { if (item.faceUp) face_down(item); else face_up(item); }
function ui_add_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		//size container at least as wide as title needs!
		let st = get_containertitle_styles();
		let stmeasure = jsCopy(st); delete stmeasure.position;

		let elem = mText(title, cont, stmeasure);
		let sz = getSizeNeeded(elem);

		//if (show_if_empty) console.log('*** szNeeded=', title, sz);

		let offsetx = valf(st.left, 0);
		let cont_wmin = mGetStyle(cont, 'wmin');
		let my_min = sz.w + offsetx * 1.5;
		//console.log('container min-width:', cont_wmin);
		let wmin = !isNumber(cont_wmin) ? my_min : Math.max(valf(cont_wmin, 0), my_min);

		//console.log('offsetx',offsetx,st.left,sz.w,cont_wmin);
		//if (show_if_empty) console.log('*** wmin=', wmin);

		mStyle(cont, { wmin: wmin });
		mStyle(elem, st);
	}

}
function ui_add_cards_to_deck_container(cont, items, list) {
	//make 1 card
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 4, Card.ovdeck);
		face_down(item);
	}
	return items[0];
}
function ui_add_cards_to_hand_container(cont, items, list) {
	//make 1 card
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 2, Card.ovw);
	}
}
function ui_make_container(dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	return d;
}
function ui_make_hand_container(items, dParent, styles = { bg: 'random', padding: 10 }) {
	let id = getUID('u');
	let d = mDiv(dParent, styles, id);
	if (!isEmpty(items)) {
		let card = items[0];
		//console.log('card',card)
		mContainerSplay(d, 2, card.w, card.h, items.length, card.ov * card.w);
	}

	return d;
}
function ui_make_deck_container(list, dParent, styles = { bg: 'random', padding: 10 }, get_card_func) {
	let id = getUID('u'); // 'deck_cont'; //getUID('u');
	let d = mDiv(dParent, styles, id);
	if (isEmpty(list)) return d;
	let c = get_card_func(list[0]);
	mContainerSplay(d, 4, c.w, c.h, n, 0);

	return d;
}
function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card, separate_lead = false, ishidden = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let list = b.list;
	let d = mDiv(dParent);
	//console.log(b)
	let items = list.map(x => get_card_func(x));
	reindex_items(items);

	let d_harvest = null;
	if (isdef(b.h)) {
		let keycard = items[0];
		let d = iDiv(keycard);
		mStyle(d, { position: 'relative' });
		d_harvest = mDiv(d, { position: 'absolute', w: 20, h: 20, bg: 'orange', opacity: .5, fg: 'black', top: '45%', left: -10, rounding: '50%', align: 'center' }, null, 'H');
	}

	let d_rumors = null, rumorItems = [];
	//console.log('b',b)
	if (!isEmpty(b.rumors)) {
		//console.log('ja, hat rumors!!!!!!!!!!!!!!')
		let d = cont;
		mStyle(d, { position: 'relative' });
		d_rumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 0, right: 0 }); //,bg:'green'});
		for (const rumor of b.rumors) {
			let dr = mDiv(d_rumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
			rumorItems.push({ div: dr, key: rumor });
		}
	}

	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	//console.log('card',card)
	let [ov, splay] = separate_lead ? [card.ov * 1.5, 5] : [card.ov, 2];
	mContainerSplay(cardcont, 5, card.w, card.h, items.length, card.ov * 1.5 * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);

	ui_add_container_title(title, cont, items);

	let uischweine = [];
	//console.log('b', b);
	for (let i = 1; i < items.length; i++) {

		let item = items[i];
		//console.log('item',item)

		// uncomment the following code to keep own buildings always open!
		// if (ishidden && !b.schweine.includes(i)) face_down(item); //wenn ich immer offen sehen will!
		// else if (b.schweine.includes(i)) add_ui_schwein(item, uischweine);

		// uncomment the following code to show buildings closed by default!
		if (!b.schweine.includes(i)) face_down(item); else add_ui_schwein(item, uischweine);
	}

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
		schweine: uischweine,
		harvest: d_harvest,
		rumors: rumorItems,
		keycard: items[0],

	};
}
function ui_type_deck(list, dParent, styles = {}, path = 'deck', title = 'deck', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let items = [];
	ensure_ui(list, cardcont, items, get_card_func);
	ui_add_container_title(title, cont, items, show_if_empty);

	function get_topcard() { return isEmpty(list) ? null : items[0]; }
	function get_bottomcard() { return isEmpty(list) ? null : arrLast(items); }
	function ensure_ui(list, cardcont, items, get_card_func) {
		clearElement(cardcont); arrClear(items); if (isEmpty(list)) return;

		//make items
		let n = Math.min(2, list.length); let ct = get_card_func(list[0]); items.push(ct); if (n > 1) { let cb = get_card_func(arrLast(list)); items.push(cb); }
		mStyle(cardcont, { position: 'relative', wmin: ct.w + 8, hmin: ct.h });

		//append in umgekehrter reihenfolge!?
		for (let i = items.length - 1; i >= 0; i--) { let x = items[i]; face_down(x); mAppend(cardcont, iDiv(x)); mStyle(iDiv(x), { position: 'absolute', top: 0, left: 0 }) }
		// (old code) mContainerSplay(cont, 4, ct.w, ct.h, list.length, 0); // ui_add_cards_to_deck_container(cont, items);
		mText(list.length, iDiv(ct), { position: 'absolute', left: list.length >= 100 ? '10%' : '25%', top: 10, fz: ct.h / 3 }); //add number of cards in deck to top card
	}
	return {
		ctype: 'deck',
		container: cont,
		cardcontainer: cardcont,
		items: items,
		list: list,
		title: title,
		path: path,
		func: get_card_func,
		get_topcard: get_topcard,
		get_bottomcard: get_bottomcard,
		get_card_func: get_card_func,
		renew: ensure_ui,
	};
}
function ui_type_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {

	let cont = ui_make_container(dParent, get_container_styles(styles));

	//mStyle(cont,{bg:'lime'})

	let items = list.map(x => get_card_func(x));

	let cardcont = mDiv(cont);
	//if (!isEmpty(items)) {
	let card = isEmpty(items) ? { w: 1, h: Config.ui.card.h, ov: 0 } : items[0];
	//console.log('card',card)
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	//}
	ui_add_container_title(title, cont, items, show_if_empty);

	//console.log('hand container',cont, cardcont)

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
	};
}
function ui_type_lead_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {

	let hcard = isdef(styles.h) ? styles.h - 30 : Config.ui.card.h;
	addKeys(get_container_styles(styles), styles);
	let cont = ui_make_container(dParent, styles);

	//mStyle(cont,{bg:'lime'})

	let items = list.map(x => get_card_func(x, hcard));

	let cardcont = mDiv(cont);
	//if (!isEmpty(items)) {
	let card = isEmpty(items) ? { w: 1, h: hcard, ov: 0 } : items[0];
	//console.log('card',card)
	let splay = 5;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	//}
	ui_add_container_title(title, cont, items, show_if_empty);

	//console.log('hand container',cont, cardcont)

	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
	};
}
function ui_type_market(list, dParent, styles = {}, path = 'market', title = 'market', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex', gap: 2 });
	let items = list.map(x => get_card_func(x));
	items.map(x => mAppend(cardcont, iDiv(x)));
	ui_add_container_title(title, cont, items, show_if_empty);

	return {
		ctype: 'market',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	};
}
function ui_type_rank_count(list, dParent, styles, path, title, get_card_func, show_if_empty = false) {

	//styles.padding = 25;
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });

	let items = [];
	for (const o of list) {
		let d = mDiv(cardcont, { display: 'flex', dir: 'c', padding: 1, fz: 12, align: 'center', position: 'relative' });
		let c = get_card_func(o.key);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		d.innerHTML += `<span style="font-weight:bold">${o.count}</span>`;
		let item = { card: c, count: o.count, div: d };
		items.push(item);
	}

	//items.map(x => mAppend(cardcont, iDiv(x)));
	ui_add_container_title(title, cont, items, show_if_empty);

	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}
function ui_type_church(list, dParent, styles = {}, path = 'trick', title = '', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });
	let items = [];
	let n = Z.plorder.length;
	//let inc=360/(n==2?4:n),rotation=inc;
	let inc = 90;
	//4 players: start at 90, 3 players: start at 0
	let rotation = n % 2 ? 0 : 90;
	//console.log('list',list);
	for (const ckey of list) {
		let d = mDiv(cardcont, { origin: 'center', transform: `rotate( ${rotation}deg )`, position: 'absolute', left: 8 });
		let c = get_card_func(ckey);
		if (ckey != arrLast(list)) face_down(c);
		mAppend(d, iDiv(c));
		remove_card_shadow(c);
		let item = { card: c, div: d };
		items.push(item);
		rotation += inc;
	}

	//items.map(x => mAppend(cardcont, iDiv(x)));
	ui_add_container_title(title, cont, items, show_if_empty);

	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}




















