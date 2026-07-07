const _GT = {}; //tables
const _STYLE_PARAMS = {
	align: 'text-align',
	bg: 'background-color',
	dir: 'flex-direction',
	fg: 'color',
	hgap: 'column-gap',
	vgap: 'row-gap',
	matop: 'margin-top',
	maleft: 'margin-left',
	mabottom: 'margin-bottom',
	maright: 'margin-right',
	origin: 'transform-origin',
	patop: 'padding-top',
	paleft: 'padding-left',
	pabottom: 'padding-bottom',
	paright: 'padding-right',
	rounding: 'border-radius',
	w: 'width',
	h: 'height',
	wmin: 'min-width',
	hmin: 'min-height',
	wmax: 'max-width',
	hmax: 'max-height',
	hline: 'line-height',
	fontSize: 'font-size',
	fz: 'font-size',
	family: 'font-family',
	weight: 'font-weight',
	z: 'z-index'
};
const _CORNERS = ['◢', '◣', '◤', '◥'];
function _mStyle(elem, styles, unit = 'px') {
	elem = toElem(elem);
	if (isdef(styles.vmargin)) { styles.mabottom = styles.matop = styles.vmargin; }
	if (isdef(styles.hmargin)) { styles.maleft = styles.maright = styles.hmargin; }
	let bg, fg;
	if (isdef(styles.bg) || isdef(styles.fg)) {
		[bg, fg] = colorsFromBFA(styles.bg, styles.fg, styles.alpha);
	}
	if (isdef(styles.vpadding) || isdef(styles.hpadding)) {
		styles.padding = valf(styles.vpadding, 0) + unit + ' ' + valf(styles.hpadding, 0) + unit;
	}
	if (isdef(styles.upperRounding)) {
		let rtop = '' + valf(styles.upperRounding, 0) + unit;
		let rbot = '0' + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	} else if (isdef(styles.lowerRounding)) {
		let rbot = '' + valf(styles.lowerRounding, 0) + unit;
		let rtop = '0' + unit;
		styles['border-radius'] = rtop + ' ' + rtop + ' ' + rbot + ' ' + rbot;
	}
	if (isdef(styles.box)) styles['box-sizing'] = 'border-box';
	for (const k in styles) {
		let val = styles[k];
		let key = k;
		if (isdef(STYLE_PARAMS[k])) key = STYLE_PARAMS[k];
		else if (k == 'font' && !isString(val)) {
			let fz = f.size; if (isNumber(fz)) fz = '' + fz + 'px';
			let ff = f.family;
			let fv = f.variant;
			let fw = isdef(f.bold) ? 'bold' : isdef(f.light) ? 'light' : f.weight;
			let fs = isdef(f.italic) ? 'italic' : f.style;
			if (nundef(fz) || nundef(ff)) return null;
			let s = fz + ' ' + ff;
			if (isdef(fw)) s = fw + ' ' + s;
			if (isdef(fv)) s = fv + ' ' + s;
			if (isdef(fs)) s = fs + ' ' + s;
			elem.style.setProperty(k, s);
			continue;
		} else if (k == 'classname') {
			mClass(elem, styles[k]);
		} else if (k == 'border') {
			if (isNumber(val)) val = `solid ${val}px ${isdef(styles.fg) ? styles.fg : '#ffffff80'}`;
			if (val.indexOf(' ') < 0) val = 'solid 1px ' + val;
		} else if (k == 'layout') {
			if (val[0] == 'f') {
				val = val.slice(1);
				elem.style.setProperty('display', 'flex');
				elem.style.setProperty('flex-wrap', 'wrap');
				let hor, vert;
				if (val.length == 1) hor = vert = 'center';
				else {
					let di = { c: 'center', s: 'start', e: 'end' };
					hor = di[val[1]];
					vert = di[val[2]];
				}
				let justStyle = val[0] == 'v' ? vert : hor;
				let alignStyle = val[0] == 'v' ? hor : vert;
				elem.style.setProperty('justify-content', justStyle);
				elem.style.setProperty('align-items', alignStyle);
				switch (val[0]) {
					case 'v': elem.style.setProperty('flex-direction', 'column'); break;
					case 'h': elem.style.setProperty('flex-direction', 'row'); break;
				}
			} else if (val[0] == 'g') {
				val = val.slice(1);
				elem.style.setProperty('display', 'grid');
				let n = allNumbers(val);
				let cols = n[0];
				let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
				elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
				elem.style.setProperty('place-content', 'center');
			}
		} else if (k == 'layflex') {
			elem.style.setProperty('display', 'flex');
			elem.style.setProperty('flex', '0 1 auto');
			elem.style.setProperty('flex-wrap', 'wrap');
			if (val == 'v') { elem.style.setProperty('writing-mode', 'vertical-lr'); }
		} else if (k == 'laygrid') {
			elem.style.setProperty('display', 'grid');
			let n = allNumbers(val);
			let cols = n[0];
			let w = n.length > 1 ? '' + n[1] + 'px' : 'auto';
			elem.style.setProperty('grid-template-columns', `repeat(${cols}, ${w})`);
			elem.style.setProperty('place-content', 'center');
		}
		if (key == 'font-weight') { elem.style.setProperty(key, val); continue; }
		else if (key == 'background-color') elem.style.background = bg;
		else if (key == 'color') elem.style.color = fg;
		else if (key == 'opacity') elem.style.opacity = val;
		else if (key == 'wrap') elem.style.flexWrap = 'wrap';
		else if (startsWith(k, 'dir')) {
			isCol = val[0] == 'c';
			elem.style.setProperty('flex-direction', 'column');
		} else if (key == 'flex') {
			if (isNumber(val)) val = '' + val + ' 1 0%';
			elem.style.setProperty(key, makeUnitString(val, unit));
		} else {
			elem.style.setProperty(key, makeUnitString(val, unit));
		}
	}
}

//#region basemin
var SERVER = "http://localhost:8080/aroot/simple"; // oder telecave!
var Pollmode = 'auto';
var Sayings;
var Info;
var ColorDi;
var Items = {};
var PrevItems = {};
var DA = {};
var Card = {};
var TO = {};
var Counter = { server: 0 };
var uiActivated = false;
var S = {};
var Z;
var U = null;
var PL;
var G;
var UI = {};
var Serverdata = {};
var Clientdata = {};
var dTable;
var dHistory;
var Config;
var Syms;
var SymKeys;
var ByGroupSubgroup;
var KeySets;
var C52;
var Cinno;
var C52Cards;
var FORCE_REDRAW = false;
var TESTING = false;
var firsttime = false;
var UIDCounter = 0;
class _SimpleTimer {
	constructor(elem, msTick, onTick, msTotal, onElapsed) {
		this.elem = elem;
		this.msTotal = this.msLeft = msTotal;
		this.onTick = onTick;
		this.onElapsed = onElapsed;
		this.interval = msTick;
		this.running = false;
		this.paused = false;
		this.TO = null;
	}
	togglePause() { if (this.paused) this.continue(); else this.pause(); }
	clear() { let elapsed = this.stop(); clearElement(this.elem); return elapsed; }
	continue() {
		if (!this.running) this.start();
		else if (!this.paused) return;
		else { this.paused = false; this.TO = setInterval(this.tickHandler.bind(this), this.interval); }
	}
	tickHandler() {
		this.msLeft -= this.interval;
		this.msElapsed = this.msTotal - this.msLeft;
		this.output();
		if (isdef(this.onTick)) this.onTick();
		if (this.msLeft <= 0) {
			this.stop();
			this.msLeft = 0;
			if (isdef(this.onElapsed)) {
				this.onElapsed(0);
			}
		}
	}
	start() {
		if (this.running) this.stop();
		this.started = new Date().now;
		this.msLeft = this.msTotal;
		this.msElapsed = 0;
		this.running = true;
		this.output();
		this.TO = setInterval(this.tickHandler.bind(this), this.interval);
	}
	output() {
		this.elem.innerHTML = timeConversion(Math.max(this.msLeft, 0), 'msh');
	}
	stop() {
		if (!this.running) return;
		clearInterval(this.TO);
		this.TO = null;
		this.running = false;
		return this.msLeft;
	}
	pause() {
		if (this.paused || !this.running) return;
		clearInterval(this.TO);
		this.paused = true;
	}
}
function addIf(arr, el) { if (!arr.includes(el)) arr.push(el); }
function addKeys(ofrom, oto) { for (const k in ofrom) if (nundef(oto[k])) oto[k] = ofrom[k]; return oto; }
function aggregate_elements(list_of_object, propname) {
	let result = [];
	for (let i = 0; i < list_of_object.length; i++) {
		let obj = list_of_object[i];
		let arr = obj[propname];
		for (let j = 0; j < arr.length; j++) {
			result.push(arr[j]);
		}
	}
	return result;
}
function allNumbers(s) {
	let m = s.match(/\-.\d+|\-\d+|\.\d+|\d+\.\d+|\d+\b|\d+(?=\w)/g);
	if (m) return m.map(v => Number(v)); else return null;
}
function alphaToHex(zero1) {
	zero1 = Math.round(zero1 * 100) / 100;
	var alpha = Math.round(zero1 * 255);
	var hex = (alpha + 0x10000)
		.toString(16)
		.slice(-2)
		.toUpperCase();
	var perc = Math.round(zero1 * 100);
	return hex;
}
function arr_get_min(arr, func) {
	if (isEmpty(arr)) return null;
	if (nundef(func)) func = x => x;
	let i = 0; let aug = arr.map(x => ({ el: jsCopy(x), val: func(x), i: i++ }));
	sortBy(aug, 'val');
	let min = aug[0].val;
	let res = arrTakeWhile(aug, x => x.val == min); return res.map(x => arr[x.i]);
}
function arrBuckets(arr, func, sortbystr) {
	let di = {};
	for (const a of arr) {
		let val = func(a);
		if (nundef(di[val])) di[val] = { val: val, list: [] };
		di[val].list.push(a);
	}
	let res = []
	let keys = get_keys(di);
	if (isdef(sortbystr)) {
		keys.sort((a, b) => sortbystr.indexOf(a) - sortbystr.indexOf(b));
	}
	return keys.map(x => di[x]);
}
function arrChildren(elem) { return [...toElem(elem).children]; }
function arrCount(arr, func) { return arr.filter(func).length; }
function arrCycle(arr, count) { return arrRotate(arr, count); }
function arrExtend(arr, list) { list.map(x => arr.push(x)); return arr; }
function arrFirst(arr) { return arr.length > 0 ? arr[0] : null; }
function arrFlatten(arr) {
	let res = [];
	for (let i = 0; i < arr.length; i++) {
		for (let j = 0; j < arr[i].length; j++) {
			res.push(arr[i][j]);
		}
	}
	return res;
}
function arrFromIndex(arr, i) { return arr.slice(i); }
function arrLast(arr) { return arr.length > 0 ? arr[arr.length - 1] : null; }
function arrMin(arr, f) { return arr_get_min(arr, f); }
function arrMinus(a, b) { if (isList(b)) return a.filter(x => !b.includes(x)); else return a.filter(x => x != b); }
function arrPlus(a, b) { b.map(x => a.push(x)); return a; }
function arrRange(from = 1, to = 10, step = 1) { let res = []; for (let i = from; i <= to; i += step)res.push(i); return res; }
function arrRemove(arr, listweg) {
	arrReplace(arr, listweg, []);
}
function arrRemovip(arr, el) {
	let i = arr.indexOf(el);
	if (i > -1) arr.splice(i, 1);
	return i;
}
function arrReplace(arr, listweg, listdazu) {
	arrExtend(arr, listdazu);
	listweg.map(x => arrRemovip(arr, x));
	return arr;
}
function arrReplace1(arr, elweg, eldazu) {
	let i = arr.indexOf(elweg);
	arr[i] = eldazu;
	return arr;
}
function arrReverse(arr) { return jsCopy(arr).reverse(); }
function arrRotate(arr, count) {
	var unshift = Array.prototype.unshift,
		splice = Array.prototype.splice;
	var len = arr.length >>> 0, count = count >> 0;
	let arr1 = jsCopy(arr);
	unshift.apply(arr1, splice.call(arr1, count % len, len));
	return arr1;
}
function arrShufflip(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function arrSplitAtIndex(arr, i) {
	return [arr.slice(0, i), arr.slice(i)];
}
function arrSum(arr, props) { if (nundef(props)) return arr.reduce((a, b) => a + b); if (!isList(props)) props = [props]; return arr.reduce((a, b) => a + (lookup(b, props) || 0), 0); }
function arrTake(arr, n = 0, from = 0) {
	if (isDict(arr)) {
		let keys = Object.keys(arr);
		return n > 0 ? keys.slice(from, from + n).map(x => (arr[x])) : keys.slice(from).map(x => (arr[x]));
	} else return n > 0 ? arr.slice(from, from + n) : arr.slice(from);
}
function arrTakeLast(arr, n, from = 0) {
	let res = [];
	if (isDict(arr)) {
		let keys = Object.keys(arr);
		let ilast = keys.length - 1; for (let i = ilast - from; i >= 0 && i > ilast - from - n; i--) { res.unshift(arr[keys[i]]); }
	} else {
		let ilast = arr.length - 1; for (let i = ilast - from; i >= 0 && i > ilast - from - n; i--) { res.unshift(arr[i]); }
	}
	return res;
}
function arrTakeWhile(arr, func) {
	let res = [];
	for (const a of arr) {
		if (func(a)) res.push(a); else break;
	}
	return res;
}
function assertion(cond) {
	if (!cond) {
		let args = [...arguments];
		for (const a of args) {
			console.log('\n', a);
		}
		throw new Error('TERMINATING!!!')
	}
}
function bottom_elem_from_to(arr1, arr2) { last_elem_from_to(arr1, arr2); }
function capitalize(s) {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
}
function choose(arr, n, excepti) { return rChoose(arr, n, null, excepti); }
function chooseRandom(arr) { return rChoose(arr); }
function clear_timeouts() {
	for (const k in TO) clearTimeout(TO[k]);
	stop_simple_timer();
}
function clearElement(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (window.jQuery == undefined) { elem.innerHTML = ''; return elem; }
	while (elem.firstChild) {
		$(elem.firstChild).remove();
	}
	return elem;
}
function coin(percent = 50) { let r = Math.random(); r *= 100; return r < percent; }
function colorFrom(cAny, a, allowHsl = false) {
	if (isString(cAny)) {
		if (cAny[0] == '#') {
			if (a == undefined) return cAny;
			cAny = cAny.substring(0, 7);
			return cAny + (a == 1 ? '' : alphaToHex(a));
		} else if (isdef(ColorDi) && lookup(ColorDi, [cAny])) {
			let c = ColorDi[cAny].c;
			if (a == undefined) return c;
			c = c.substring(0, 7);
			return c + (a == 1 ? '' : alphaToHex(a));
		} else if (startsWith(cAny, 'rand')) {
			let spec = capitalize(cAny.substring(4));
			if (isdef(window['color' + spec])) {
				c = window['color' + spec]();
			} else c = rColor();
			if (a == undefined) return c;
			return c + (a == 1 ? '' : alphaToHex(a));
		} else if (startsWith(cAny, 'linear')) {
			return cAny;
		} else if (cAny[0] == 'r' && cAny[1] == 'g') {
			if (a == undefined) return cAny;
			if (cAny[3] == 'a') {
				if (a < 1) {
					return stringBeforeLast(cAny, ',') + ',' + a + ')';
				} else {
					let parts = cAny.split(',');
					let r = firstNumber(parts[0]);
					return 'rgb(' + r + ',' + parts[1] + ',' + parts[2] + ')';
				}
			} else {
				if (a < 1) {
					return 'rgba' + cAny.substring(3, cAny.length - 1) + ',' + a + ')';
				} else {
					return cAny;
				}
			}
		} else if (cAny[0] == 'h' && cAny[1] == 's') {
			if (allowHsl) {
				if (a == undefined) return cAny;
				if (cAny[3] == 'a') {
					if (a < 1) {
						return stringBeforeLast(cAny, ',') + ',' + a + ')';
					} else {
						let parts = cAny.split(',');
						let r = firstNumber(parts[0]);
						return 'hsl(' + r + ',' + parts[1] + ',' + parts[2] + ')';
					}
				} else {
					return a == 1 ? cAny : 'hsla' + cAny.substring(3, cAny.length - 1) + ',' + a + ')'; //cAny.substring(0,cAny.length-1) + ',' + a + ')';
				}
			} else {
				if (cAny[3] == 'a') {
					cAny = HSLAToRGBA(cAny);
				} else {
					cAny = HSLToRGB(cAny);
				}
				return colorFrom(cAny, a, false);
			}
		} else { //will get here only once!!!
			ensureColorDict();
			let c = ColorDi[cAny];
			if (nundef(c)) {
				if (startsWith(cAny, 'rand')) {
					let spec = cAny.substring(4);
					if (isdef(window['color' + spec])) {
						c = window['color' + spec](res);
					} else c = rColor();
				} else {
					console.log('color not available:', cAny);
					throw new Error('color not found: ' + cAny)
					return '#00000000'; //transparent!
				}
			} else c = c.c;
			if (a == undefined) return c;
			c = c.substring(0, 7);
			return c + (a == 1 ? '' : alphaToHex(a));
		}
	} else if (Array.isArray(cAny)) {
		if (cAny.length == 3 && isNumber(cAny[0])) { //assume this is a rgb
			let r = cAny[0];
			let g = cAny[1];
			let b = cAny[2];
			return a == undefined || a == 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
		} else { // interpret as list of colors to choose from!
			return rChoose(cAny);
		}
	} else if (typeof cAny == 'object') {
		if ('h' in cAny) {
			let hslString = '';
			if (a == undefined || a == 1) {
				hslString = `hsl(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%)`;
			} else {
				hslString = `hsla(${cAny.h},${Math.round(cAny.s <= 1.0 ? cAny.s * 100 : cAny.s)}%,${Math.round(cAny.l <= 1.0 ? cAny.l * 100 : cAny.l)}%,${a})`;
			}
			if (allowHsl) {
				return hslString;
			} else {
				return colorFrom(hslString, a, allowHsl);
			}
		} else if ('r' in cAny) {
			if (a !== undefined && a < 1) {
				return `rgba(${cAny.r},${cAny.g},${cAny.b},${a})`;
			} else {
				return `rgb(${cAny.r},${cAny.g},${cAny.b})`;
			}
		}
	}
}
function colorFromHSL(hue, sat = 100, lum = 50) {
	return hslToHex(valf(hue, rHue()), sat, lum);
}
function colorIdealText(bg, grayPreferred = false) {
	let rgb = colorRGB(bg, true);
	const nThreshold = 105; //40; //105;
	let r = rgb.r;
	let g = rgb.g;
	let b = rgb.b;
	var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
	var foreColor = 255 - bgDelta < nThreshold ? 'black' : 'white';
	if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? 'dimgray' : 'snow';
	return foreColor;
}
function colorLight(c, percent = 20, log = true) {
	if (nundef(c)) {
		return colorFromHSL(rHue(), 100, 85);
	} else c = colorFrom(c);
	let zero1 = percent / 100;
	return pSBC(zero1, c, undefined, !log);
}
function colorRGB(cAny, asObject = false) {
	let res = colorFrom(cAny);
	let srgb = res;
	if (res[0] == '#') {
		srgb = pSBC(0, res, 'c');
	}
	let n = allNumbers(srgb);
	if (asObject) {
		return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 };
	} else {
		return srgb;
	}
}
function colorsFromBFA(bg, fg, alpha) {
	if (fg == 'contrast') {
		if (bg != 'inherit') bg = colorFrom(bg, alpha);
		fg = colorIdealText(bg);
	} else if (bg == 'contrast') {
		fg = colorFrom(fg);
		bg = colorIdealText(fg);
	} else {
		if (isdef(bg) && bg != 'inherit') bg = colorFrom(bg, alpha);
		if (isdef(fg) && fg != 'inherit') fg = colorFrom(fg);
	}
	return [bg, fg];
}
function colorTrans(cAny, alpha = 0.5) {
	return colorFrom(cAny, alpha);
}
function contains(s, sSub) { return s.toLowerCase().includes(sSub.toLowerCase()); }
function copyKeys(ofrom, oto, except = {}, only) {
	let keys = isdef(only) ? only : Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
}
function dict2list(d, keyName = 'id') {
	let res = [];
	for (const key in d) {
		let val = d[key];
		let o;
		if (isDict(val)) { o = jsCopy(val); } else { o = { value: val }; }
		o[keyName] = key;
		res.push(o);
	}
	return res;
}
function elem_from_to(el, arr1, arr2) { removeInPlace(arr1, el); arr2.push(el); }
function elem_from_to_top(el, arr1, arr2) { removeInPlace(arr1, el); arr2.unshift(el); }
function endsWith(s, sSub) { let i = s.indexOf(sSub); return i >= 0 && i == s.length - sSub.length; }
function ensureColorDict() {
	if (isdef(ColorDi)) return;
	ColorDi = {};
	let names = getColorNames();
	let hexes = getColorHexes();
	for (let i = 0; i < names.length; i++) {
		ColorDi[names[i].toLowerCase()] = { c: '#' + hexes[i] };
	}
	const newcolors = {
		black: { c: '#000000', D: 'schwarz' },
		blue: { c: '#0000ff', D: 'blau' },
		BLUE: { c: '#4363d8', E: 'blue', D: 'blau' },
		BLUEGREEN: { c: '#004054', E: 'bluegreen', D: 'blaugrün' },
		BROWN: { c: '#96613d', E: 'brown', D: 'braun' },
		deepyellow: { c: '#ffed01', E: 'yellow', D: 'gelb' },
		FIREBRICK: { c: '#800000', E: 'darkred', D: 'rotbraun' },
		gold: { c: 'gold', D: 'golden' },
		green: { c: 'green', D: 'grün' },
		GREEN: { c: '#3cb44b', E: 'green', D: 'grün' },
		grey: { c: 'grey', D: 'grau' },
		lightblue: { c: 'lightblue', D: 'hellblau' }, //{ c: '#42d4f4', D: 'hellblau' },
		LIGHTBLUE: { c: '#42d4f4', E: 'lightblue', D: 'hellblau' },
		lightgreen: { c: 'lightgreen', D: 'hellgrün' },
		LIGHTGREEN: { c: '#afff45', E: 'lightgreen', D: 'hellgrün' },
		lightyellow: { c: '#fff620', E: 'lightyellow', D: 'gelb' },
		NEONORANGE: { c: '#ff6700', E: 'neonorange', D: 'neonorange' },
		NEONYELLOW: { c: '#efff04', E: 'neonyellow', D: 'neongelb' },
		olive: { c: 'olive', D: 'oliv' },
		OLIVE: { c: '#808000', E: 'olive', D: 'oliv' },
		orange: { c: 'orange', D: 'orange' },
		ORANGE: { c: '#f58231', E: 'orange', D: 'orange' },
		PINK: { c: 'deeppink', D: 'rosa' },
		pink: { c: 'pink', D: 'rosa' },
		purple: { c: 'purple', D: 'lila' },
		PURPLE: { c: '#911eb4', E: 'purple', D: 'lila' },
		red: { c: 'red', D: 'rot' },
		RED: { c: '#e6194B', E: 'red', D: 'rot' },
		skyblue: { c: 'skyblue', D: 'himmelblau' },
		SKYBLUE: { c: 'deepskyblue', D: 'himmelblau' },
		teal: { c: '#469990', D: 'blaugrün' },
		TEAL: { c: '#469990', E: 'teal', D: 'blaugrün' },
		transparent: { c: '#00000000', E: 'transparent', D: 'transparent' },
		violet: { c: 'violet', E: 'violet', D: 'violett' },
		VIOLET: { c: 'indigo', E: 'violet', D: 'violett' },
		white: { c: 'white', D: 'weiss' },
		yellow: { c: 'yellow', D: 'gelb' },
		yelloworange: { c: '#ffc300', E: 'yellow', D: 'gelb' },
		YELLOW: { c: '#ffe119', E: 'yellow', D: 'gelb' },
	};
	for (const k in newcolors) {
		let cnew = newcolors[k];
		if (cnew.c[0] != '#' && isdef(ColorDi[cnew.c])) cnew.c = ColorDi[cnew.c].c;
		ColorDi[k] = cnew;
	}
}
function evNoBubble(ev) { ev.preventDefault(); ev.cancelBubble = true; }
function evToClosestId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToId(ev) {
	let elem = findParentWithId(ev.target);
	return elem.id;
}
function evToProp(ev, prop) {
	let x = ev.target;
	while (isdef(x) && nundef(x.getAttribute(prop))) x = x.parentNode;
	return isdef(x) ? x.getAttribute(prop) : null;
}
function evToTargetAttribute(ev, attr) {
	let val = ev.target.getAttribute(attr);
	if (nundef(val)) { val = ev.target.parentNode.getAttribute(attr); }
	return val;
}
function exchange_by_index(arr1, i1, arr2, i2) {
	let temp = arr1[i1];
	arr1[i1] = arr2[i2];
	arr2[i2] = temp;
}
function findParentWithId(elem) { while (elem && !(elem.id)) { elem = elem.parentNode; } return elem; }
function firstCond(arr, func) {
	if (nundef(arr)) return null;
	for (const a of arr) {
		if (func(a)) return a;
	}
	return null;
}
function firstCondDictKeys(dict, func) {
	for (const k in dict) { if (func(k)) return k; }
	return null;
}
function firstNumber(s) {
	if (s) {
		let m = s.match(/-?\d+/);
		if (m) {
			let sh = m.shift();
			if (sh) { return Number(sh); }
		}
	}
	return null;
}
function fisherYates(arr) {
	if (arr.length == 2 && coin()) { return arr; } //let temp=arr[0];arr[0]=arr[1];arr[1]=temp;return arr;} //return coin()?[arr[0],arr[1]]:[arr[1],arr[0]];
	var rnd, temp;
	let last = arr[0];
	for (var i = arr.length - 1; i; i--) {
		rnd = Math.random() * i | 0;
		temp = arr[i];
		arr[i] = arr[rnd];
		arr[rnd] = temp;
	}
	return arr;
}
function get_checked_radios(rg) {
	let inputs = rg.getElementsByTagName('INPUT');
	let list = [];
	for (const ch of inputs) {
		let checked = ch.getAttribute('checked');
		if (ch.checked) list.push(ch.value);
	}
	return list;
}
function get_keys(o) { return Object.keys(o); }
function get_mouse_pos(ev) {
	let x = ev.pageX - document.body.scrollLeft; // - ev.target.offsetY;
	let y = ev.pageY - document.body.scrollTop; // - ev.target.offsetY;
	return ({ x: x, y: y });
}
function get_values(o) { return Object.values(o); }
function getColorHexes(x) {
	return [
		'f0f8ff',
		'faebd7',
		'00ffff',
		'7fffd4',
		'f0ffff',
		'f5f5dc',
		'ffe4c4',
		'000000',
		'ffebcd',
		'0000ff',
		'8a2be2',
		'a52a2a',
		'deb887',
		'5f9ea0',
		'7fff00',
		'd2691e',
		'ff7f50',
		'6495ed',
		'fff8dc',
		'dc143c',
		'00ffff',
		'00008b',
		'008b8b',
		'b8860b',
		'a9a9a9',
		'a9a9a9',
		'006400',
		'bdb76b',
		'8b008b',
		'556b2f',
		'ff8c00',
		'9932cc',
		'8b0000',
		'e9967a',
		'8fbc8f',
		'483d8b',
		'2f4f4f',
		'2f4f4f',
		'00ced1',
		'9400d3',
		'ff1493',
		'00bfff',
		'696969',
		'696969',
		'1e90ff',
		'b22222',
		'fffaf0',
		'228b22',
		'ff00ff',
		'dcdcdc',
		'f8f8ff',
		'ffd700',
		'daa520',
		'808080',
		'808080',
		'008000',
		'adff2f',
		'f0fff0',
		'ff69b4',
		'cd5c5c',
		'4b0082',
		'fffff0',
		'f0e68c',
		'e6e6fa',
		'fff0f5',
		'7cfc00',
		'fffacd',
		'add8e6',
		'f08080',
		'e0ffff',
		'fafad2',
		'd3d3d3',
		'd3d3d3',
		'90ee90',
		'ffb6c1',
		'ffa07a',
		'20b2aa',
		'87cefa',
		'778899',
		'778899',
		'b0c4de',
		'ffffe0',
		'00ff00',
		'32cd32',
		'faf0e6',
		'ff00ff',
		'800000',
		'66cdaa',
		'0000cd',
		'ba55d3',
		'9370db',
		'3cb371',
		'7b68ee',
		'00fa9a',
		'48d1cc',
		'c71585',
		'191970',
		'f5fffa',
		'ffe4e1',
		'ffe4b5',
		'ffdead',
		'000080',
		'fdf5e6',
		'808000',
		'6b8e23',
		'ffa500',
		'ff4500',
		'da70d6',
		'eee8aa',
		'98fb98',
		'afeeee',
		'db7093',
		'ffefd5',
		'ffdab9',
		'cd853f',
		'ffc0cb',
		'dda0dd',
		'b0e0e6',
		'800080',
		'663399',
		'ff0000',
		'bc8f8f',
		'4169e1',
		'8b4513',
		'fa8072',
		'f4a460',
		'2e8b57',
		'fff5ee',
		'a0522d',
		'c0c0c0',
		'87ceeb',
		'6a5acd',
		'708090',
		'708090',
		'fffafa',
		'00ff7f',
		'4682b4',
		'd2b48c',
		'008080',
		'd8bfd8',
		'ff6347',
		'40e0d0',
		'ee82ee',
		'f5deb3',
		'ffffff',
		'f5f5f5',
		'ffff00',
		'9acd32'
	];
}
function getColorNames() {
	return [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'Aquamarine',
		'Azure',
		'Beige',
		'Bisque',
		'Black',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkGray',
		'DarkGrey',
		'DarkGreen',
		'DarkKhaki',
		'DarkMagenta',
		'DarkOliveGreen',
		'DarkOrange',
		'DarkOrchid',
		'DarkRed',
		'DarkSalmon',
		'DarkSeaGreen',
		'DarkSlateBlue',
		'DarkSlateGray',
		'DarkSlateGrey',
		'DarkTurquoise',
		'DarkViolet',
		'DeepPink',
		'DeepSkyBlue',
		'DimGray',
		'DimGrey',
		'DodgerBlue',
		'FireBrick',
		'FloralWhite',
		'ForestGreen',
		'Fuchsia',
		'Gainsboro',
		'GhostWhite',
		'Gold',
		'GoldenRod',
		'Gray',
		'Grey',
		'Green',
		'GreenYellow',
		'HoneyDew',
		'HotPink',
		'IndianRed',
		'Indigo',
		'Ivory',
		'Khaki',
		'Lavender',
		'LavenderBlush',
		'LawnGreen',
		'LemonChiffon',
		'LightBlue',
		'LightCoral',
		'LightCyan',
		'LightGoldenRodYellow',
		'LightGray',
		'LightGrey',
		'LightGreen',
		'LightPink',
		'LightSalmon',
		'LightSeaGreen',
		'LightSkyBlue',
		'LightSlateGray',
		'LightSlateGrey',
		'LightSteelBlue',
		'LightYellow',
		'Lime',
		'LimeGreen',
		'Linen',
		'Magenta',
		'Maroon',
		'MediumAquaMarine',
		'MediumBlue',
		'MediumOrchid',
		'MediumPurple',
		'MediumSeaGreen',
		'MediumSlateBlue',
		'MediumSpringGreen',
		'MediumTurquoise',
		'MediumVioletRed',
		'MidnightBlue',
		'MintCream',
		'MistyRose',
		'Moccasin',
		'NavajoWhite',
		'Navy',
		'OldLace',
		'Olive',
		'OliveDrab',
		'Orange',
		'OrangeRed',
		'Orchid',
		'PaleGoldenRod',
		'PaleGreen',
		'PaleTurquoise',
		'PaleVioletRed',
		'PapayaWhip',
		'PeachPuff',
		'Peru',
		'Pink',
		'Plum',
		'PowderBlue',
		'Purple',
		'RebeccaPurple',
		'Red',
		'RosyBrown',
		'RoyalBlue',
		'SaddleBrown',
		'Salmon',
		'SandyBrown',
		'SeaGreen',
		'SeaShell',
		'Sienna',
		'Silver',
		'SkyBlue',
		'SlateBlue',
		'SlateGray',
		'SlateGrey',
		'Snow',
		'SpringGreen',
		'SteelBlue',
		'Tan',
		'Teal',
		'Thistle',
		'Tomato',
		'Turquoise',
		'Violet',
		'Wheat',
		'White',
		'WhiteSmoke',
		'Yellow',
		'YellowGreen'
	];
}
function getRect(elem, relto) {
	if (isString(elem)) elem = document.getElementById(elem);
	let res = elem.getBoundingClientRect();
	if (isdef(relto)) {
		let b2 = relto.getBoundingClientRect();
		let b1 = res;
		res = {
			x: b1.x - b2.x,
			y: b1.y - b2.y,
			left: b1.left - b2.left,
			top: b1.top - b2.top,
			right: b1.right - b2.right,
			bottom: b1.bottom - b2.bottom,
			width: b1.width,
			height: b1.height
		};
	}
	let r = { x: res.left, y: res.top, w: res.width, h: res.height };
	addKeys({ l: r.x, t: r.y, r: r.x + r.w, b: r.t + r.h }, r);
	return r;
}
function getSizeNeeded(elem) {
	var d = elem.cloneNode(true); //document.createElement("div");
	d.style.width = 'auto';
	document.body.appendChild(d);
	let cStyles = {};
	cStyles.position = 'fixed';
	cStyles.opacity = 0;
	cStyles.top = '-9999px';
	mStyle(d, cStyles);
	height = d.clientHeight;
	width = d.clientWidth;
	d.parentNode.removeChild(d);
	return { w: Math.round(width), h: Math.round(height) };
}
function getStyleProp(elem, prop) { return getComputedStyle(elem).getPropertyValue(prop); }
function getTypeOf(param) {
	let type = typeof param;
	if (type == 'string') {
		return 'string';
	}
	if (type == 'object') {
		type = param.constructor.name;
		if (startsWith(type, 'SVG')) type = stringBefore(stringAfter(type, 'SVG'), 'Element').toLowerCase();
		else if (startsWith(type, 'HTML')) type = stringBefore(stringAfter(type, 'HTML'), 'Element').toLowerCase();
	}
	let lType = type.toLowerCase();
	if (lType.includes('event')) type = 'event';
	return type;
}
function getUID(pref = '') {
	UIDCounter += 1;
	return pref + '_' + UIDCounter;
}
function hide(elem) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (nundef(elem)) return;
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:hidden;display:none');
	} else {
		elem.style.display = 'none';
	}
}
function HSLAToRGBA(hsla, isPct) {
	let ex = /^hsla\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)(((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2},\s?)|((\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}\s\/\s))((0?\.\d+)|[01]|(([1-9]?\d(\.\d+)?)|100|(\.\d+))%)\)$/i;
	if (ex.test(hsla)) {
		let sep = hsla.indexOf(',') > -1 ? ',' : ' ';
		hsla = hsla
			.substr(5)
			.split(')')[0]
			.split(sep);
		if (hsla.indexOf('/') > -1) hsla.splice(3, 1);
		isPct = isPct === true;
		let h = hsla[0],
			s = hsla[1].substr(0, hsla[1].length - 1) / 100,
			l = hsla[2].substr(0, hsla[2].length - 1) / 100,
			a = hsla[3];
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;
		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;
		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);
		let pctFound = a.indexOf('%') > -1;
		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
			if (!pctFound) {
				a *= 100;
			} else {
				a = a.substr(0, a.length - 1);
			}
		} else if (pctFound) {
			a = a.substr(0, a.length - 1) / 100;
		}
		return 'rgba(' + (isPct ? r + '%,' + g + '%,' + b + '%,' + a + '%' : +r + ',' + +g + ',' + +b + ',' + +a) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function hslToHex(h, s, l) {
	l /= 100;
	const a = s * Math.min(l, 1 - l) / 100;
	const f = n => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}
function HSLToRGB(hsl, isPct) {
	let ex = /^hsl\(((((([12]?[1-9]?\d)|[12]0\d|(3[0-5]\d))(\.\d+)?)|(\.\d+))(deg)?|(0|0?\.\d+)turn|(([0-6](\.\d+)?)|(\.\d+))rad)((,\s?(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2}|(\s(([1-9]?\d(\.\d+)?)|100|(\.\d+))%){2})\)$/i;
	if (ex.test(hsl)) {
		let sep = hsl.indexOf(',') > -1 ? ',' : ' ';
		hsl = hsl
			.substr(4)
			.split(')')[0]
			.split(sep);
		isPct = isPct === true;
		let h = hsl[0],
			s = hsl[1].substr(0, hsl[1].length - 1) / 100,
			l = hsl[2].substr(0, hsl[2].length - 1) / 100;
		if (h.indexOf('deg') > -1) h = h.substr(0, h.length - 3);
		else if (h.indexOf('rad') > -1) h = Math.round((h.substr(0, h.length - 3) / (2 * Math.PI)) * 360);
		else if (h.indexOf('turn') > -1) h = Math.round(h.substr(0, h.length - 4) * 360);
		if (h >= 360) h %= 360;
		let c = (1 - Math.abs(2 * l - 1)) * s,
			x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
			m = l - c / 2,
			r = 0,
			g = 0,
			b = 0;
		if (0 <= h && h < 60) {
			r = c;
			g = x;
			b = 0;
		} else if (60 <= h && h < 120) {
			r = x;
			g = c;
			b = 0;
		} else if (120 <= h && h < 180) {
			r = 0;
			g = c;
			b = x;
		} else if (180 <= h && h < 240) {
			r = 0;
			g = x;
			b = c;
		} else if (240 <= h && h < 300) {
			r = x;
			g = 0;
			b = c;
		} else if (300 <= h && h < 360) {
			r = c;
			g = 0;
			b = x;
		}
		r = Math.round((r + m) * 255);
		g = Math.round((g + m) * 255);
		b = Math.round((b + m) * 255);
		if (isPct) {
			r = +((r / 255) * 100).toFixed(1);
			g = +((g / 255) * 100).toFixed(1);
			b = +((b / 255) * 100).toFixed(1);
		}
		return 'rgb(' + (isPct ? r + '%,' + g + '%,' + b + '%' : +r + ',' + +g + ',' + +b) + ')';
	} else {
		return 'Invalid input color';
	}
} //ok
function iAdd(item, props) {
	let id, l;
	if (isString(item)) { id = item; item = Items[id]; }
	else if (nundef(item.id)) { id = item.id = iRegister(item); }
	else { id = item.id; if (nundef(Items[id])) Items[id] = item; }
	if (nundef(item.live)) item.live = {};
	l = item.live;
	for (const k in props) {
		let val = props[k];
		if (nundef(val)) {
			continue;
		}
		l[k] = val;
		if (k == 'div') val.id = id;
		if (isdef(val.id) && val.id != id) {
			lookupAddIfToList(val, ['memberOf'], id);
		}
	}
}
function iDiv(i) { return isdef(i.live) ? i.live.div : isdef(i.div) ? i.div : i; }
function if_plural(n) { return n == 1 ? '' : 's'; }
function if_stringified(obj) { return is_stringified(obj) ? JSON.parse(obj) : obj; }
function iMeasure(item, sizingOptions) {
	if (nundef(iDiv(item))) return;
	setRect(iDiv(item), valf(sizingOptions, { hgrow: true, wgrow: true }));
}
function iRegister(item, id) { let uid = isdef(id) ? id : getUID(); Items[uid] = item; return uid; }
function is_stringified(obj) {
	if (isString(obj)) {
		return '"\'{[('.includes(obj[0]);
	}
	return false;
}
function isdef(x) { return x !== null && x !== undefined; }
function isDict(d) { let res = (d !== null) && (typeof (d) == 'object') && !isList(d); return res; }
function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}
function isList(arr) { return Array.isArray(arr); }
function isLiteral(x) { return isString(x) || isNumber(x); }
function isNumber(x) { return x !== ' ' && x !== true && x !== false && isdef(x) && (x == 0 || !isNaN(+x)); }
function isString(param) { return typeof param == 'string'; }
function isSvg(elem) { return startsWith(elem.constructor.name, 'SVG'); }
function jsCopy(o) { return JSON.parse(JSON.stringify(o)); }
function last_elem_from_to(arr1, arr2) { arr2.push(arr1.pop()); }
function lastCond(arr, func) {
	if (nundef(arr)) return null;
	for (let i = arr.length - 1; i >= 0; i--) { let a = arr[i]; if (func(a)) return a; }
	return null;
}
function list2dict(arr, keyprop = 'id', uniqueKeys = true) {
	let di = {};
	for (const a of arr) {
		if (uniqueKeys) lookupSet(di, [a[keyprop]], a);
		else lookupAddToList(di, [a[keyprop]], a);
	}
	return di;
}
function loader_off() { let d = mBy('loader_holder'); if (isdef(d)) d.className = 'loader_off'; }
function loader_on() { let d = mBy('loader_holder'); if (isdef(d)) d.className = 'loader_on'; }
function lookup(dict, keys) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (k === undefined) break;
		let e = d[k];
		if (e === undefined || e === null) return null; // {console.log('null',k,typeof k);return null;}
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupAddIfToList(dict, keys, val) {
	let lst = lookup(dict, keys);
	if (isList(lst) && lst.includes(val)) return;
	lookupAddToList(dict, keys, val);
}
function lookupAddToList(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				console.assert(false, 'lookupAddToList: last key indefined!' + keys.join(' '));
				return null;
			} else if (isList(d[k])) {
				d[k].push(val);
			} else {
				d[k] = [val];
			}
			return d[k];
		}
		if (nundef(k)) continue; //skip undef or null values
		if (d[k] === undefined) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function lookupSet(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (nundef(k)) continue; //skip undef or null values
		if (d[k] === undefined) d[k] = (i == ilast ? val : {});
		if (nundef(d[k])) d[k] = (i == ilast ? val : {});
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}
function lookupSetOverride(dict, keys, val) {
	let d = dict;
	let ilast = keys.length - 1;
	let i = 0;
	for (const k of keys) {
		if (i == ilast) {
			if (nundef(k)) {
				return null;
			} else {
				d[k] = val;
			}
			return d[k];
		}
		if (nundef(k)) continue; //skip undef or null values
		if (nundef(d[k])) d[k] = {};
		d = d[k];
		i += 1;
	}
	return d;
}
function makeUnitString(nOrString, unit = 'px', defaultVal = '100%') {
	if (nundef(nOrString)) return defaultVal;
	if (isNumber(nOrString)) nOrString = '' + nOrString + unit;
	return nOrString;
}
function _mAnimate(elem, prop, valist, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0, forwards = 'none') {
	let kflist = [];
	for (const perc in valist) {
		let o = {};
		let val = valist[perc];
		o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
		kflist.push(o);
	}
	let opts = { duration: msDuration, fill: forwards, easing: easing, delay: delay };
	let a = toElem(elem).animate(kflist, opts);
	if (isdef(callback)) { a.onfinish = callback; }
	return a;
}
function mButton(caption, handler, dParent, styles, classes, id) {
	let x = mCreate('button');
	x.innerHTML = caption;
	if (isdef(handler)) x.onclick = handler;
	if (isdef(dParent)) dParent.appendChild(x);
	if (isdef(styles)) mStyle(x, styles);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(id)) x.id = id;
	return x;
}
function mCardText(ckey, sz, color) {
	let j = is_jolly(ckey);
	if (nundef(color)) color = get_color_of_card(ckey);
	return is_jolly(ckey) ?
		`<span style="font-size:12px;font-family:Algerian;color:${color}">jolly</span>` :
		is_color(ckey) ? `<span style="font-weight:bold;color:${color}">${ckey}</span>` :
			is_color(stringAfter(ckey, '_')) ? `<span style="font-size:16px;font-family:Algerian;color:${color}">${stringBefore(ckey, '_')}</span>` :
				`${ckey[0]}${mSuit(ckey, sz, color)}`;
}
function mClass(d) {
	d = toElem(d);
	if (arguments.length == 2 && isList(arguments[1])) for (let i = 0; i < arguments[1].length; i++) d.classList.add(arguments[1][i]);
	else for (let i = 1; i < arguments.length; i++) d.classList.add(arguments[i]);
}
function mClassRemove(d) { d = toElem(d); for (let i = 1; i < arguments.length; i++) d.classList.remove(arguments[i]); }
function mColFlex(dParent, chflex = [1, 5, 1], bgs) { // = [YELLOW, ORANGE, RED]) {
	let styles = { opacity: 1, display: 'flex', 'align-items': 'stretch', 'flex-flow': 'nowrap' };
	mStyle(dParent, styles);
	let res = [];
	for (let i = 0; i < chflex.length; i++) {
		let bg = isdef(bgs) ? bgs[i] : null;
		let d1 = mDiv(dParent, { flex: chflex[i], bg: bg });
		res.push(d1);
	}
	return res;
}
function mCreate(tag, styles, id) { let d = document.createElement(tag); if (isdef(id)) d.id = id; if (isdef(styles)) mStyle(d, styles); return d; }
function mCreateFrom(htmlString) {
	var div = document.createElement('div');
	div.innerHTML = htmlString.trim();// '<div>halloooooooooooooo</div>';// htmlString.trim();
	return div.firstChild;
}
function mDataTable(reclist, dParent, rowstylefunc, headers, id, showheaders = true) {
	if (nundef(headers)) headers = get_keys(reclist[0]);
	let t = mTable(dParent, headers, showheaders);
	if (isdef(id)) t.id = `t${id}`;
	let rowitems = [];
	let i = 0;
	for (const u of reclist) {
		let rid = isdef(id) ? `r${id}_${i}` : null;
		r = mTableRow(t, u, headers, rid);
		if (isdef(rowstylefunc)) mStyle(r.div, rowstylefunc(u));
		rowitems.push({ div: r.div, colitems: r.colitems, o: u, id: rid, index: i });
		i++;
	}
	return { div: t, rowitems: rowitems };
}
function mDiv(dParent, styles, id, inner, classes, sizing) {
	let d = mCreate('div');
	if (dParent) mAppend(dParent, d);
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(id)) d.id = id;
	if (isdef(inner)) d.innerHTML = inner;
	if (isdef(sizing)) { setRect(d, sizing); }
	return d;
}
function mDiv100(dParent, styles, id, sizing = true) { let d = mDiv(dParent, styles, id); mSize(d, 100, 100, '%', sizing); return d; }
function mDivItem(dParent, styles, id, content) {
	if (nundef(id)) id = getUID();
	let d = mDiv(dParent, styles, id, content);
	return mItem(id, { div: d });
}
function mDraggable(item) {
	let d = iDiv(item);
	d.draggable = true;
	d.ondragstart = drag;
}
function mDroppable(item, handler, dragoverhandler) {
	function allowDrop(ev) { ev.preventDefault(); }
	let d = iDiv(item);
	d.ondragover = isdef(dragoverhandler) ? dragoverhandler : allowDrop;
	d.ondrop = handler;
}
function measure_fieldset(fs) {
	let legend = fs.firstChild;
	let r = getRect(legend);
	let labels = fs.getElementsByTagName('label');
	let wmax = 0;
	for (const l of labels) {
		let r1 = getRect(l);
		wmax = Math.max(wmax, r1.w);
	}
	let wt = r.w;
	let wo = wmax + 24;
	let diff = wt - wo;
	if (diff >= 10) {
		for (const l of labels) { let d = l.parentNode; mStyle(d, { maleft: diff / 2 }); }
	}
	let wneeded = Math.max(wt, wo) + 10;
	mStyle(fs, { wmin: wneeded });
	for (const l of labels) { let d = l.parentNode; mStyle(l, { display: 'inline-block', wmin: 50 }); mStyle(d, { wmin: wneeded - 40 }); }
}
function mFadeClear(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, () => { mClear(d); if (callback) callback(); }, ms); }
function mFadeClearShow(d, ms = 800, callback = null) { return mAnimate(d, 'opacity', [1, 0], () => { mClear(d); if (callback) callback(); }, ms); }
function mFadeRemove(d, ms = 800, callback = null) { return mAnimateTo(d, 'opacity', 0, () => { mRemove(d); if (callback) callback(); }, ms); }
function mFall(d, ms = 800, dist = 50) { toElem(d).animate([{ opacity: 0, transform: `translateY(-${dist}px)` }, { opacity: 1, transform: 'translateY(0px)' },], { fill: 'both', duration: ms, easing: 'ease' }); }
function mFlex(d, or = 'h') {
	d = toElem(d);
	d.style.display = 'flex';
	d.style.flexFlow = (or == 'v' ? 'column' : 'row') + ' ' + (or == 'w' ? 'wrap' : 'nowrap');
}
function mFlexWrap(d) { mFlex(d, 'w'); }
function mGetStyle(elem, prop) {
	let val;
	elem = toElem(elem);
	if (prop == 'bg') { val = getStyleProp(elem, 'background-color'); if (isEmpty(val)) return getStyleProp(elem, 'background'); }
	else if (isdef(STYLE_PARAMS[prop])) { val = getStyleProp(elem, STYLE_PARAMS[prop]); } //elem.style[STYLE_PARAMS[prop]]; }
	else {
		switch (prop) {
			case 'vmargin': val = stringBefore(elem.style.margin, ' '); break;
			case 'hmargin': val = stringAfter(elem.style.margin, ' '); break;
			case 'vpadding': val = stringBefore(elem.style.padding, ' '); break;
			case 'hpadding': val = stringAfter(elem.style.padding, ' '); break;
			case 'box': val = elem.style.boxSizing; break;
			case 'dir': val = elem.style.flexDirection; break;
		}
	}
	if (nundef(val)) val = getStyleProp(elem, prop); // elem.style[prop];
	if (val.endsWith('px')) return firstNumber(val); else return val;
}
function mIfNotRelative(d) { if (isEmpty(d.style.position)) d.style.position = 'relative'; }
function mImage() { return mImg(...arguments); }
function mImg(path, dParent, styles, classes, callback) {
	let d = mCreate('img');
	if (isdef(callback)) d.onload = callback;
	d.src = path;
	mAppend(dParent, d);
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	if (isdef(styles.w)) d.setAttribute('width', styles.w + 'px');
	if (isdef(styles.h)) d.setAttribute('height', styles.h + 'px');
	return d;
}
function mInput(dParent, styles, id, placeholder, classtr = 'input', tabindex = null, value = '') {
	let html = `<input type="text" id=${id} class="${classtr}" placeholder="${valf(placeholder, '')}" tabindex="${tabindex}" value="${value}">`;
	let d = mAppend(dParent, mCreateFrom(html));
	if (isdef(styles)) mStyle(d, styles);
	return d;
}
function mInsert(dParent, el, index = 0) { dParent.insertBefore(el, dParent.childNodes[index]); }
function miPic(item, dParent, styles, classes) {
	let info = isString(item) ? Syms[item] : isdef(item.info) ? item.info : item;
	let d = mDiv(dParent);
	d.innerHTML = info.text;
	if (nundef(styles)) styles = {};
	let family = info.family; // == 'emoNoto' && DA.isFirefox == true? 'emoNotoFF':info.family;
	addKeys({ family: family, fz: 50, display: 'inline-block' }, styles);
	mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	mCenterCenterFlex(d);
	return d;
}
function mItem(id, diDOM, di = {}, addSizing = false) {
	let item = di;
	id = isdef(id) ? id : isdef(diDOM) && isdef(diDOM.div) && !isEmpty(diDOM.div.id) ? diDOM.div.id : getUID();
	item.id = iRegister(item, id);
	if (isdef(diDOM) && isdef(diDOM.div)) { diDOM.div.id = id; iAdd(item, diDOM); }
	if (addSizing) {
		if (nundef(item.sizing)) item.sizing = 'sizeToContent';
		if (nundef(item.positioning)) { item.positioning = 'absolute'; }
		if (nundef(item.posType)) { item.posType = 'center'; }
		if (isdef(diDOM) && item.sizing == 'sizeToContent') iMeasure(item, item.sizingOptions);
	}
	return item;
}
function mLinebreak(dParent, gap) {
	dParent = toElem(dParent);
	let d;
	let display = getComputedStyle(dParent).display;
	if (display == 'flex') {
		d = mDiv(dParent, { fz: 2, 'flex-basis': '100%', h: 0, w: '100%' }, null, ' &nbsp; ');
	} else {
		d = mDiv(dParent, {}, null, '<br>');
	}
	if (isdef(gap)) { d.style.minHeight = gap + 'px'; d.innerHTML = ' &nbsp; '; d.style.opacity = .2; }//return mLinebreak(dParent);}
	return d;
}
function mPulse(d, ms, callback = null) { mClass(d, 'onPulse'); TO[getUID()] = setTimeout(() => { mClassRemove(d, 'onPulse'); if (callback) callback(); }, ms); }
function mPulse1(d, callback) { mPulse(d, 1000, callback); }
function mRadio(label, val, name, dParent, styles = {}, handler, group_id, is_on) {
	let cursor = styles.cursor; delete styles.cursor;
	let d = mDiv(dParent, styles, group_id + '_' + val);
	let id = isdef(group_id) ? `i_${group_id}_${val}` : getUID();
	let type = isdef(group_id) ? 'radio' : 'checkbox';
	let checked = isdef(is_on) ? is_on : false;
	let inp = mCreateFrom(`<input class='radio' id='${id}' type="${type}" name="${name}" value="${val}">`); // checked="${checked}" >`);
	if (checked) inp.checked = true;
	let text = mCreateFrom(`<label for='${inp.id}'>${label}</label>`);
	if (isdef(cursor)) { inp.style.cursor = text.style.cursor = cursor; }
	mAppend(d, inp);
	mAppend(d, text);
	if (isdef(handler)) {
		inp.onclick = ev => {
			ev.cancelBubble = true;
			if (handler == 'toggle') {
			} else if (isdef(handler)) {
				handler(val);
			}
		};
	}
	return d;
}
function mRadioGroup(dParent, styles, id, legend, legendstyles) {
	let f = mCreate('fieldset');
	f.id = id;
	if (isdef(styles)) mStyle(f, styles);
	if (isdef(legend)) {
		let l = mCreate('legend');
		l.innerHTML = legend;
		mAppend(f, l);
		if (isdef(legendstyles)) { mStyle(l, legendstyles); }
	}
	mAppend(dParent, f);
	return f;
}
function mRemoveChildrenFromIndex(dParent, i) { while (dParent.children[i]) { mRemove(dParent.children[i]); } }
function mShield(dParent, styles = { bg: '#00000020' }, id = null, classnames = null, hideonclick = false) {
	dParent = toElem(dParent);
	let d = mDiv(dParent, styles, id, classnames);
	lookupAddIfToList(DA, ['shields'], d);
	mIfNotRelative(dParent);
	mStyle(d, { position: 'absolute', left: 0, top: 0, w: '100%', h: '100%' });
	if (hideonclick) d.onclick = ev => { evNoBubble(ev); d.remove(); };
	else d.onclick = ev => { evNoBubble(ev); };
	mClass(d, 'topmost');
	return d;
}
function mShieldsOff() { if (nundef(DA.shields)) return; for (const d of DA.shields) d.remove(); }
function mShrinkTranslate(child, scale, newParent, ms = 800, callback) {
	let [dx, dy] = get_screen_distance(child, newParent);
	mAnimate(child, 'transform', [`translateX(${dx}px) translateY(${dy}px) scale(${scale})`], callback, ms, 'ease');
}
function mSize(d, w, h, unit = 'px', sizing) { if (nundef(h)) h = w; mStyle(d, { width: w, height: h }, unit); if (isdef(sizing)) setRect(d, sizing); }
function mStamp(d1, text, color, sz) {
	mStyle(d1, { position: 'relative' });
	let r = getRect(d1);
	let [w, h] = [r.w, r.h];
	color = valf(color, 'black');
	sz = valf(sz, r.h / 7);
	let [padding, border, rounding, angle] = [sz / 10, sz / 6, sz / 8, rChoose([-16, -14, -10, 10, 14])];
	let d2 = mDiv(d1, {
		fg: color,
		position: 'absolute', top: 25, left: 5,
		transform: `rotate(${angle}deg)`,
		fz: sz,
		hpadding: 2,
		vpadding: 0,
		rounding: rounding,
		border: `${border}px solid ${colorTrans(color, .8)}`, // black
		'-webkit-mask-size': `${w}px ${h}px`,
		'-webkit-mask-position': `50% 50%`,
		'-webkit-mask-image': 'url("../base/assets/images/textures/grunge.png")',
		weight: 400, // 800
		display: 'inline-block',
		'text-transform': 'uppercase',
		family: 'blackops', // courier blackops fredericka
		'mix-blend-mode': 'multiply',
	}, null, text);
}
function mSuit(ckey, sz = 20, color = null) {
	let suit = ckey.length == 1 ? ckey : ckey[1];
	let di = { S: '&spades;', H: '&hearts;', D: '&diams;', C: '&clubs;' };
	color = valf(color, suit == 'H' || suit == 'D' ? 'red' : 'black');
	let html = `<span style='color:${color};font-size:${sz}px'>${di[suit]}</span>`;
	return html;
}
function mSym(key, dParent, styles = {}, pos, classes) {
	let info = Syms[key];
	styles.display = 'inline-block';
	let family = info.family; // == 'emoNoto' && DA.isFirefox == true? 'emoNotoFF':info.family;
	styles.family = family;
	let sizes;
	if (isdef(styles.sz)) { sizes = mSymSizeToBox(info, styles.sz, styles.sz); }
	else if (isdef(styles.w) && isdef(styles.h)) { sizes = mSymSizeToBox(info, styles.w, styles.h); }
	else if (isdef(styles.fz)) { sizes = mSymSizeToFz(info, styles.fz); }
	else if (isdef(styles.h)) { sizes = mSymSizeToH(info, styles.h); }
	else if (isdef(styles.w)) { sizes = mSymSizeToW(info, styles.w); }
	else { sizes = mSymSizeToFz(info, 25); }
	styles.fz = sizes.fz;
	styles.w = sizes.w;
	styles.h = sizes.h;
	styles.align = 'center';
	if (isdef(styles.bg) && info.family != 'emoNoto') { styles.fg = styles.bg; delete styles.bg; }
	let x = mDiv(dParent, styles, null, info.text);
	if (isdef(classes)) mClass(x, classes);
	if (isdef(pos)) { mPlace(x, pos); }
	return x;
}
function mSymSizeToBox(info, w, h) {
	let fw = w / info.w;
	let fh = h / info.h;
	let f = Math.min(fw, fh);
	return { fz: 100 * f, w: info.w * f, h: info.h * f };
}
function mSymSizeToFz(info, fz) { let f = fz / 100; return { fz: fz, w: info.w * f, h: info.h * f }; }
function mSymSizeToH(info, h) { let f = h / info.h; return { fz: 100 * f, w: info.w * f, h: h }; }
function mSymSizeToW(info, w) { let f = w / info.w; return { fz: 100 * f, w: w, h: info.h * f }; }
function mTable(dParent, headers, showheaders, styles = { mabottom: 0 }, className = 'table') {
	let d = mDiv(dParent);
	let t = mCreate('table');
	mAppend(d, t);
	if (isdef(className)) mClass(t, className);
	if (isdef(styles)) mStyle(t, styles);
	if (showheaders) {
		let code = `<tr>`;
		for (const h of headers) {
			code += `<th>${h}</th>`
		}
		code += `</tr>`;
		t.innerHTML = code;
	}
	return t;
}
function mTableCol(r, val) {
	let col = mCreate('td');
	mAppend(r, col);
	if (isdef(val)) col.innerHTML = val;
	return col;
}
function mTableCommandify(rowitems, di) {
	for (const item of rowitems) {
		for (const index in di) {
			let colitem = item.colitems[index];
			colitem.div.innerHTML = di[index](item, colitem.val);
		}
	}
}
function mTableRow(t, o, headers, id) {
	let elem = mCreate('tr');
	if (isdef(id)) elem.id = id;
	mAppend(t, elem);
	let colitems = [];
	for (const k of headers) {
		let val = isdef(o[k]) ? isDict(o[k]) ? JSON.stringify(o[k]) : isList(o[k]) ? o[k].join(', ') : o[k] : '';
		let col = mTableCol(elem, val);
		colitems.push({ div: col, key: k, val: val });
	}
	return { div: elem, colitems: colitems };
}
function mTableTransition(d, ms = 800) {
	toElem(d).animate([{ opacity: .25 }, { opacity: 1 },], { fill: 'both', duration: ms, easing: 'ease' });
}
function mText(text, dParent, styles, classes) {
	if (!isString(text)) text = text.toString();
	let d = mDiv(dParent);
	if (!isEmpty(text)) { d.innerHTML = text; }
	if (isdef(styles)) mStyle(d, styles);
	if (isdef(classes)) mClass(d, classes);
	return d;
}
function mTranslateBy(elem, x, y, ms = 800, callback = null) {
	mAnimate(elem, 'transform', [`translateX(${x}px) translateY(${y}px)`], callback, ms, 'ease'); //translate(${dx}px,${dy}px)`
}
function mYaml(d, js) {
	d.innerHTML = '<pre>' + jsonToYaml(js) + '</pre>';
	return d;
}
function nundef(x) { return x === null || x === undefined; }
function object2string(o, props = [], except_props = []) {
	let s = '';
	if (nundef(o)) return s;
	if (isString(o)) return o;
	let keys = Object.keys(o).sort();
	for (const k of keys) {
		if (!isEmpty(props) && props.includes(k) || !except_props.includes(k)) {
			let val = isList(o[k]) ? o[k].join(',') : isDict(o[k]) ? object2string(o[k].props, except_props) : o[k];
			let key_part = isEmpty(s) ? '' : `, ${k}:`;
			s += val;
		}
	}
	return s;
}
function plural(n) { return n == 0 || n > 1 ? 's' : ''; }
function pSBC(p, c0, c1, l) {
	let r, g, b, P, f, t, h, i = parseInt, m = Math.round, a = typeof c1 == 'string';
	if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
	h = c0.length > 9;
	h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h;
	f = pSBCr(c0);
	P = p < 0;
	t = c1 && c1 != 'c' ? pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 };
	p = P ? p * -1 : p;
	P = 1 - p;
	if (!f || !t) return null;
	if (l) { r = m(P * f.r + p * t.r); g = m(P * f.g + p * t.g); b = m(P * f.b + p * t.b); }
	else { r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5); g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5); b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5); }
	a = f.a;
	t = t.a;
	f = a >= 0 || t >= 0;
	a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0;
	if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
	else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
}
function pSBCr(d) {
	let i = parseInt, m = Math.round, a = typeof c1 == 'string';
	let n = d.length,
		x = {};
	if (n > 9) {
		([r, g, b, a] = d = d.split(',')), (n = d.length);
		if (n < 3 || n > 4) return null;
		(x.r = parseInt(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = parseInt(g)), (x.b = parseInt(b)), (x.a = a ? parseFloat(a) : -1);
	} else {
		if (n == 8 || n == 6 || n < 4) return null;
		if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
		d = parseInt(d.slice(1), 16);
		if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
		else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
	}
	return x;
}
function range(f, t, st = 1) {
	if (nundef(t)) {
		t = f - 1;
		f = 0;
	}
	let arr = [];
	for (let i = f; i <= t; i += st) {
		arr.push(i);
	}
	return arr;
}
function rCard(postfix = 'n', ranks = '*A23456789TJQK', suits = 'HSDC') { return rChoose(ranks) + rChoose(suits) + postfix; }
function rChoose(arr, n = 1, func = null, exceptIndices = null) {
	let indices = arrRange(0, arr.length - 1);
	if (isdef(exceptIndices)) {
		for (const i of exceptIndices) removeInPlace(indices, i);
	}
	if (isdef(func)) indices = indices.filter(x => func(arr[x]));
	if (n == 1) {
		let idx = Math.floor(Math.random() * indices.length);
		return arr[indices[idx]];
	}
	arrShufflip(indices);
	return indices.slice(0, n).map(x => arr[x]);
}
function rColor(cbrightness, c2, alpha = null) {
	if (isdef(c2)) {
		let c = colorMix(cbrightness, c2, rNumber(0, 100));
		return colorTrans(c, alpha ?? Math.random());
	}
	if (isdef(cbrightness)) {
		let hue = rHue();
		let sat = 100;
		let b = isNumber(cbrightness) ? cbrightness : cbrightness == 'dark' ? 25 : cbrightness == 'light' ? 75 : 50;
		return colorFromHSL(hue, sat, b);
	}
	let s = '#';
	for (let i = 0; i < 6; i++) {
		s += rChoose(['f', 'c', '9', '6', '3', '0']);
	}
	return s;
}
function removeDuplicates(keys, prop) {
	let di = {};
	let res = [];
	let items = keys.map(x => Syms[x]);
	for (const item of items) {
		if (isdef(di[item.best])) { continue; }
		res.push(item);
		di[item.key] = true;
	}
	return res.map(x => x.key);
}
function removeInPlace(arr, el) {
	arrRemovip(arr, el);
}
function reverse(x) {
	if (isString(x)) {
		var newString = "";
		for (var i = x.length - 1; i >= 0; i--) {
			newString += x[i];
		}
		return newString;
	}
	if (isList(x)) return x.reverse();
	if (isDict(x)) return dict2list(x, 'value').reverse();
	return x;
}
function rHue() { return (rNumber(0, 36) * 10) % 360; }
function rNumber(min = 0, max = 100) {
	return Math.floor(Math.random() * (max - min + 1)) + min; //min and max inclusive!
}
function sameList(l1, l2) {
	if (l1.length != l2.length) return false;
	for (const s of l1) {
		if (!l2.includes(s)) return false;
	}
	return true;
}
function setKeys({ allowDuplicates, nMin = 25, lang, key, keySets, filterFunc, param, confidence, sortByFunc } = {}) {
	let keys = jsCopy(keySets[key]);
	if (isdef(nMin)) {
		let diff = nMin - keys.length;
		let additionalSet = diff > 0 ? nMin > 100 ? firstCondDictKeys(keySets, k => k != key && keySets[k].length > diff) : 'best100' : null;
		if (additionalSet) KeySets[additionalSet].map(x => addIf(keys, x)); //
	}
	let primary = [];
	let spare = [];
	for (const k of keys) {
		let info = Syms[k];
		info.best = info[lang];
		if (nundef(info.best)) {
			let ersatzLang = (lang == 'D' ? 'D' : 'E');
			let klang = 'best' + ersatzLang;
			if (nundef(info[klang])) info[klang] = lastOfLanguage(k, ersatzLang);
		}
		let isMatch = true;
		if (isdef(filterFunc)) isMatch = isMatch && filterFunc(param, k, info.best);
		if (isdef(confidence)) isMatch = info[klang + 'Conf'] >= confidence;
		if (isMatch) { primary.push(k); } else { spare.push(k); }
	}
	if (isdef(nMin)) {
		let len = primary.length;
		let nMissing = nMin - len;
		if (nMissing > 0) { let list = choose(spare, nMissing); spare = arrMinus(spare, list); primary = primary.concat(list); }
	}
	if (isdef(sortByFunc)) { sortBy(primary, sortByFunc); }
	if (isdef(nMin)) console.assert(primary.length >= nMin);
	if (nundef(allowDuplicates)) {
		primary = removeDuplicates(primary);
	}
	return primary;
}
function setRect(elem, options) {
	let r = getRect(elem);
	elem.rect = r;
	elem.setAttribute('rect', `${r.w} ${r.h} ${r.t} ${r.l} ${r.b} ${r.r}`); //damit ich es sehen kann!!!
	if (isDict(options)) {
		if (options.hgrow) mStyle(elem, { hmin: r.h });
		else if (options.hfix) mStyle(elem, { h: r.h });
		else if (options.hshrink) mStyle(elem, { hmax: r.h });
		if (options.wgrow) mStyle(elem, { wmin: r.w });
		else if (options.wfix) mStyle(elem, { w: r.w });
		else if (options.wshrink) mStyle(elem, { wmax: r.w });
	}
	return r;
}
function show(elem, isInline = false) {
	if (isString(elem)) elem = document.getElementById(elem);
	if (isSvg(elem)) {
		elem.setAttribute('style', 'visibility:visible');
	} else {
		elem.style.display = isInline ? 'inline-block' : null;
	}
	return elem;
}
function show_special_message(msg, stay = false, ms = 3000, delay = 0, styles = {}, callback = null) { //divTestStyles={}) {
	let dParent = mBy('dBandMessage');
	if (nundef(dParent)) dParent = mDiv(document.body, {}, 'dBandMessage');
	show(dParent);
	clearElement(dParent);
	addKeys({ position: 'fixed', top: 200, classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' }, styles);
	if (!isEmpty(styles.classname)) { mClass(dParent, styles.classname); }
	delete styles.classname;
	mStyle(dParent, styles);
	dParent.innerHTML = msg;
	if (delay > 0) TO.special = setTimeout(() => { mFadeRemove(dParent, ms, callback); }, delay);
	else mFadeRemove(dParent, ms, callback);
}
function shuffle(arr) { if (isEmpty(arr)) return []; else return fisherYates(arr); }
function simpleCompare(o1, o2) {
	let s1 = object2string(o1);
	let s2 = object2string(o2);
	return s1 == s2;
}
function sortBy(arr, key) { arr.sort((a, b) => (a[key] < b[key] ? -1 : 1)); return arr; }
function sortByDescending(arr, key) { arr.sort((a, b) => (a[key] > b[key] ? -1 : 1)); return arr; }
function sortByFunc(arr, func) { arr.sort((a, b) => (func(a) < func(b) ? -1 : 1)); return arr; }
function sortByFuncDescending(arr, func) { arr.sort((a, b) => (func(a) > func(b) ? -1 : 1)); return arr; }
function startsWith(s, sSub) {
	return s.substring(0, sSub.length) == sSub;
}
function stop_simple_timer() { if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; } }
function stringAfter(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return '';
	return sFull.substring(idx + sSub.length);
}
function stringBefore(sFull, sSub) {
	let idx = sFull.indexOf(sSub);
	if (idx < 0) return sFull;
	return sFull.substring(0, idx);
}
function stringBeforeLast(sFull, sSub) {
	let parts = sFull.split(sSub);
	return sFull.substring(0, sFull.length - arrLast(parts).length - 1);
}
function stringBetween(sFull, sStart, sEnd) {
	return stringBefore(stringAfter(sFull, sStart), isdef(sEnd) ? sEnd : sStart);
}
function timeConversion(duration, format = 'Hmsh') {
	const portions = [];
	const msInHour = 1000 * 60 * 60;
	const hours = Math.trunc(duration / msInHour);
	if (format.includes('H')) portions.push((hours < 10 ? '0' : '') + hours);
	duration = duration - (hours * msInHour); // hours + 'h');
	const msInMinute = 1000 * 60;
	const minutes = Math.trunc(duration / msInMinute);
	if (format.includes('m')) portions.push((minutes < 10 ? '0' : '') + minutes);// minutes + 'm');
	duration = duration - (minutes * msInMinute);
	const msInSecond = 1000;
	const seconds = Math.trunc(duration / 1000);
	if (format.includes('s')) portions.push((seconds < 10 ? '0' : '') + seconds);//seconds + 's');
	duration = duration - (seconds * msInSecond);
	const hundreds = duration / 10;
	if (format.includes('h')) portions.push((hundreds < 10 ? '0' : '') + hundreds);//hundreds);
	return portions.join(':');
}
function toElem(d) { return isString(d) ? mBy(d) : d; }
function toLetters(s) { return [...s]; }
function top_elem_from_to(arr1, arr2) { arr2.push(arr1.shift()); }

function valf(val, def) { return isdef(val) ? val : def; }
//#endregion basemin

//#region legacy
function cBlank(dParent, styles = {}, id) {
	if (nundef(styles.h)) styles.h = Card.sz;
	if (nundef(styles.w)) styles.w = styles.h * .7;
	if (nundef(styles.bg)) styles.bg = 'white';
	styles.position = 'relative';
	let [w, h, sz] = [styles.w, styles.h, Math.min(styles.w, styles.h)];
	if (nundef(styles.rounding)) styles.rounding = sz * .05;
	let d = mDiv(dParent, styles, id, null, 'card');
	let item = mItem(null, { div: d }, { type: 'card', sz: sz, rounding: styles.rounding });
	copyKeys(styles, item);
	return item;
}
function cRound(dParent, styles = {}, id) {
	styles.w = valf(styles.w, Card.sz);
	styles.h = valf(styles.h, Card.sz);
	styles.rounding = '50%';
	return cBlank(dParent, styles, id);
}
function deck_add(deck, n, arr) { let els = deck_deal(deck, n); els.map(x => arr.push(x)); return arr; }
function deck_deal(deck, n) { return deck.splice(0, n); }
function fillColarr(colarr, items) {
	let i = 0;
	let result = [];
	for (const r of colarr) {
		let arr = [];
		for (let c = 0; c < r; c++) {
			arr.push(items[i]); i++;
		}
		result.push(arr);
	}
	return result;
}
function get_splay_number(wsplay) { return wsplay == 'none' ? 0 : wsplay == 'left' ? 1 : wsplay == 'right' ? 2 : wsplay == 'up' ? 3 : 4; }
function has_farm(uname) { return firstCond(UI.players[uname].buildinglist, x => x.type == 'farm'); }
function hide_options_popup() { let d = mBy('dOptions'); if (isdef(d)) mRemove(d); }
function is_card(o) { return isdef(o.rank) || isdef(o.o) && isdef(o.o.rank); }
function mColsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', 'justify-content': 'space-between' }); //,'align-items':'center'});
	if (isdef(colStyles)) mStyle(d0, colStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			d1 = mDiv(d0); //,null,randomName());
			mRowsX(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContentX(content, d0, itemStyles); //mDiv(d0, styles, null, content);
			akku.push(d1);
		}
	}
}
function mContainerSplay(d, splay, w, h, num, ov) {
	if (nundef(splay)) splay = 2;
	if (!isNumber(splay)) splay = get_splay_number(splay);
	if (isString(ov) && ov[ov.length - 1] == '%') ov = splay == 0 ? 1 : splay == 3 ? Number(ov) * h / 100 : Number(ov) * w / 100;
	if (splay == 3) {
		d.style.display = 'grid';
		d.style.gridTemplateRows = `repeat(${num},${ov}px)`;
		console.log('HAAAAAAAAAAAALLLLLLLLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOOOOOOOO')
		d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 2 || splay == 1) {
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		let wnew = w + (num - 1) * (ov * 1.1);
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 0) {
		d.style.display = 'grid'; ov = .5
		d.style.gridTemplateColumns = `repeat(${num},${ov}px)`;
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
	} else if (splay == 5) { //lead card has wider splay than rest
		d.style.display = 'grid';
		d.style.gridTemplateColumns = `${ov}px repeat(${num - 1},${ov / 2}px)`; //100px repeat(auto-fill, 100px)
		d.style.minWidth = `${w + (num) * (ov / 2 * 1.1)}px`;
	} else if (splay == 4) {
		d.style.position = 'relative';
		if (nundef(ov)) ov = .5;
		d.style.minWidth = `${w + (num - 1) * (ov * 1.1)}px`;
		d.style.minHeight = `${h + (num - 1) * (ov * 1.1)}px`;
	}
}
function mContentX(content, dParent, styles = { sz: Card.sz / 5, fg: 'random' }) {
	let [key, scale] = isDict(content) ? [content.key, content.scale] : [content, 1];
	if (scale != 1) { styles.transform = `scale(${scale},${Math.abs(scale)})`; }
	let dResult = mDiv(dParent);
	let ds = isdef(Syms[key]) ? mSym(key, dResult, styles) : mDiv(dResult, styles, null, key);
	return dResult;
}
function mItemSplay(item, list, splay, ov = .5) {
	if (!isNumber(splay)) splay = get_splay_number(splay);
	let d = iDiv(item);
	let idx = list.indexOf(item.key);
	if (splay == 4) {
		let offset = (list.length - idx) * ov;
		mStyle(d, { position: 'absolute', left: offset, top: offset }); //,Z:list.length - idx});
		d.style.zIndex = list.length - idx;
	} else {
		d.style.zIndex = splay != 2 ? list.length - idx : 0;
	}
}
function mRowsX(dParent, arr, itemStyles = { bg: 'random' }, rowStyles, colStyles, akku) {
	let d0 = mDiv100(dParent, { display: 'flex', dir: 'column', 'justify-content': 'space-between' });//,'align-items':'center'});
	if (isdef(rowStyles)) mStyle(d0, rowStyles);
	for (let i = 0; i < arr.length; i++) {
		let content = arr[i];
		if (isList(content)) {
			let d1 = mDiv(d0);
			mColsX(d1, content, itemStyles, rowStyles, colStyles, akku);
		} else {
			d1 = mContentX(content, d0, itemStyles);
			akku.push(d1);
		}
	}
}
function name2id(name) { return 'd_' + name.split(' ').join('_'); }
function onclick_home() { stopgame(); start_with_assets(); }
//#endregion legacy

//#region apiserver
function _poll() {
	if (nundef(U) || nundef(Z) || nundef(Z.friendly)) { console.log('poll without U or Z!!!', U, Z); return; }
	show_polling_signal();
	if (nundef(DA.pollCounter)) DA.pollCounter = 0; DA.pollCounter++; console.log('polling'); //, DA.pollCounter);
	if (Z.game == 'feedback' && i_am_host()) {
		send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, fen: Z.fen, write_fen: true, auto: true }, 'table');
	} else send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, auto: true }, 'table');
}
function autopoll(ms) { TO.poll = setTimeout(_poll, valf(ms, valf(Z.options.poll, 2000))); }
function ensure_polling() { }
function handle_result(result, cmd) {
	if (result.trim() == "") return;
	let obj;
	try { obj = JSON.parse(result); } catch { console.log('ERROR:', result); }
	if (Clientdata.AUTORESET) { Clientdata.AUTORESET = false; if (result.auto == true) { console.log('message bounced'); return; } }
	DA.result = jsCopy(obj); //console.log('DA.result', DA.result);
	processServerdata(obj, cmd);
	switch (cmd) {
		case "assets": load_assets(obj); start_with_assets(); break;
		case "users": show_users(); break;
		case "tables": show_tables(); break;
		case "delete_table":
		case "delete_tables": show_tables(); break;
		case "table1":
			update_table();
			console.log('cmd', cmd)
			console.log('obj', obj)
			for (const k in obj) { if (isLiteral(obj[k])) { console.log(k, obj[k]); } }
			clear_timeouts();
			gamestep();
			break;
		case "gameover":
		case "table":
		case "startgame":
			update_table();
			if (Z.skip_presentation) { Z.func.state_info(mBy('dTitleLeft')); autopoll(); return; }
			clear_timeouts();
			gamestep();
			break;
	}
}
function phpPost(data, cmd) {
	if (DA.TEST1 === true && cmd == 'table') { cmd = 'table1'; }
	pollStop();
	var o = {};
	o.data = valf(data, {});
	o.cmd = cmd;
	o = JSON.stringify(o);
	if (DA.SIMSIM && (DA.exclusive || ['table', 'startgame', 'gameover', 'tables'].includes(cmd))) {
		sendSIMSIM(o, DA.exclusive);
		FORCE_REDRAW = true;
		if (DA.exclusive) return;
	} else if (DA.simulate) {
		sendSIMSIM(o, true, true);
		FORCE_REDRAW = true;
		return;
	}
	clear_transaction();
	var xml = new XMLHttpRequest();
	loader_on();
	xml.onload = function () {
		if (xml.readyState == 4 || xml.status == 200) {
			loader_off();
			handle_result(xml.responseText, cmd);
		} else { console.log('WTF?????') }
	}
	xml.open("POST", "api.php", true);
	xml.send(o);
}
function pollStop() { clearTimeout(TO.poll); Clientdata.AUTORESET = true; }
function processServerdata(obj, cmd) {
	if (isdef(Serverdata.table)) Serverdata.prevtable = jsCopy(Serverdata.table);
	if (isdef(obj.playerdata)) {
		let old_playerdata = valf(Serverdata.playerdata, []);
		let di = list2dict(old_playerdata, 'name');
		Serverdata.playerdata = if_stringified(obj.playerdata);
		Serverdata.playerdata_changed_for = [];
		for (const o of Serverdata.playerdata) {
			let old = di[o.name];
			o.state = isEmpty(o.state) ? '' : if_stringified(o.state);
			o.state1 = isEmpty(o.state1) ? '' : if_stringified(o.state1);
			o.state2 = isEmpty(o.state2) ? '' : if_stringified(o.state2);
			let changed = nundef(old) ? true : !simpleCompare(old, o);
			if (changed) {
				Serverdata.playerdata_changed_for.push(o.name);
			}
		}
	} else if (isdef(Serverdata.playerdata)) {
		Serverdata.playerdata_changed_for = Serverdata.playerdata.map(x => x.name);
		Serverdata.playerdata = [];
	} else Serverdata.playerdata_changed_for = [];
	for (const k in obj) {
		if (k == 'tables') Serverdata.tables = obj.tables.map(x => unpack_table(x));
		else if (k == 'table') { Serverdata.table = unpack_table(obj.table); }
		else if (k == 'users') Serverdata[k] = obj[k];
		else if (k == 'playerdata') continue;
		else if (cmd != 'assets') Serverdata[k] = obj[k];
	}
	if (isdef(obj.table)) {
		assertion(isdef(Serverdata.table) && obj.table.id == Serverdata.table.id, 'table NOT in Serverdata or table id mismatch');
		let i = Serverdata.tables.findIndex(x => x.id == obj.table.id);
		if (i != -1) { Serverdata.tables[i] = Serverdata.table; } else Serverdata.tables.push(Serverdata.table);
	}
	else if (isdef(Serverdata.table)) {
		let t = Serverdata.tables.find(x => x.id == Serverdata.table.id);
		if (nundef(t)) delete Serverdata.table;
	}
}
function send_or_sim(o, cmd) {
	Counter.server += 1; //console.log('send_or_sim '+Counter.server);
	phpPost(o, cmd);
}
function stopPolling() { pollStop(); }
function unpack_table(table) {
	for (const k of ['players', 'fen', 'options', 'scoring']) {
		let val = table[k];
		if (isdef(table[k])) table[k] = if_stringified(val); if (nundef(table[k])) table[k] = {}; //JSON.parse(table[k]); else table[k] = {};
	}
	if (isdef(table.modified)) { table.modified = Number(table.modified); table.timestamp = new Date(table.modified); table.stime = stringBeforeLast(table.timestamp.toString(), 'G').trim(); }
	assertion(isdef(window[table.game]), 'game function for ' + table.game + ' not defined in window');
	if (isdef(table.game)) { table.func = window[table.game](); }
	if (isdef(table.options.mode)) { table.mode = table.options.mode; }
	delete table.action; delete table.expected;
	return table;
}
function update_table() {
	assertion(isdef(U), 'NO USER LOGGED IN WHEN GETTING TABLE FROM SERVER!!!!!!!!!!!!!!!!!!!!', U);
	if (nundef(Z) || nundef(Z.prev)) Z = { prev: {} };
	for (const wichtig of ['playerdata', 'notes', 'uplayer', 'uname', 'friendly', 'step', 'round', 'phase', 'stage', 'timestamp', 'modified', 'stime', 'mode', 'scoring']) {
		if (isdef(Z[wichtig])) Z.prev[wichtig] = jsCopy(Z[wichtig]);
	}
	Z.prev.turn = Clientdata.last_turn = Clientdata.this_turn;
	copyKeys(Serverdata, Z);
	if (isdef(Serverdata.table)) { copyKeys(Serverdata.table, Z); Z.playerlist = Z.players; copyKeys(Serverdata.table.fen, Z); }
	assertion(isdef(Z.fen), 'no fen in Z bei cmd=table or startgame!!!', Serverdata);
	assertion(isdef(Z.host), 'TABLE HAS NOT HOST IN UPDATE_TABLE!!!!!!!!!!!!!!')
	Clientdata.this_turn = Z.turn;
	set_user(U.name); //sets Z.uname
	assertion(!isEmpty(Z.turn), 'turn empty!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', Z.turn);
	let [fen, uname, turn, mode, host] = [Z.fen, Z.uname, Z.fen.turn, Z.mode, Z.host];
	let role = Z.role = !is_playing(uname, fen) ? 'spectator' : fen.turn.includes(uname) ? 'active' : 'inactive';
	let upl = role != 'spectator' ? uname : turn[0];
	if (Z.game == 'accuse') {
		if (isdef(Clientdata.mode)) Z.mode = Clientdata.mode;
		if (mode == 'hotseat' && turn.length > 1) {
			let next = get_next_in_list(Z.prev.uplayer, Z.turn); if (next) upl = next;
		} else if (turn.length > 1 && uname == host) { //hand membership round
			let bots = turn_has_bots_that_must_move();
			if (!isEmpty(bots)) upl = bots[0];
		} else if (uname == host && !is_human_player(turn[0])) {
			upl = turn[0];
		} else if (mode == 'hotseat') {
			upl = turn[0];
		}
	} else {
		upl = Z.role == 'active' ? uname : turn[0];
		if (mode == 'hotseat' && turn.length > 1) { let next = get_next_in_list(Z.prev.uplayer, Z.turn); if (next) upl = next; }
		if (mode == 'multi' && Z.role == 'inactive' && (uname != host || is_human_player(upl))) { upl = uname; }
	}
	set_player(upl, fen); //sets uplayer
	let pl = Z.pl;
	Z.playmode = pl.playmode; //could be human | ai | hybrid (that's for later!!!)
	Z.strategy = uname == pl.name ? valf(Clientdata.strategy, pl.strategy) : pl.strategy; //humans are really hybrids: they have default strategy 'random'
	let [uplayer, friendly, modified] = [Z.uplayer, Z.friendly, Z.modified];
	Z.uplayer_data = firstCond(Z.playerdata, x => x.name == Z.uplayer);
	let sametable = !FORCE_REDRAW && friendly == Z.prev.friendly && modified <= Z.prev.modified && uplayer == Z.prev.uplayer;
	let sameplayerdata = isEmpty(Z.playerdata_changed_for);
	let myplayerdatachanged = Z.playerdata_changed_for.includes(Z.uplayer);
	let specialcase = !i_am_host() && !i_am_acting_host() && !i_am_trigger() && !myplayerdatachanged;
	Z.skip_presentation = sametable && (sameplayerdata || specialcase);
	if (DA.TEST1 && DA.TEST0 && (!sametable || !sameplayerdata)) {
		console.log('======>Z.skip_presentation', Z.skip_presentation, '\nplayerdata_changed_for', Z.playerdata_changed_for);
		console.log('_______ *** THE END *** ___________')
	}
	FORCE_REDRAW = false;
}
//#endregion apiserver

//#region apisimphp
function apiphp(o, saveFromZ = false) {
	let [data, cmd] = [o.data, o.cmd];
	let result = {}, friendly, uname, state, player_status, fen;
	if (saveFromZ && isdef(data.friendly) && !db_table_exists(data.friendly)) {
		let res = db_new_table(data.friendly, Z.game, Z.host, jsCopy(Z.playerlist), jsCopy(Z.fen), jsCopy(Z.options));
		if (isdef(Z.playerdata)) res.playerdata = jsCopy(Z.playerdata);
	}
	if (cmd == 'table') {
		if (isdef(data.auto)) result.auto = data.auto;
		friendly = data.friendly;
		uname = data.uname;
		result.status = "table";
		if (isdef(data.clear_players)) {
			result.playerdata = db_clear_players(friendly);
			result.status = "clear_players";
		} else if (isdef(data.write_player) && isdef(data.state)) {
			player_status = isdef(data.player_status) ? data.player_status : '';
			result.playerdata = db_write_player(friendly, uname, data.state, player_status);
			result.status = "write_player";
		} else {
			result.playerdata = db_read_playerdata(friendly);
		}
		if (isdef(data.write_fen)) {
			result.table = db_write_fen(friendly, data.fen);
			result.status += " write_fen";
		} else {
			result.table = db_read_table(friendly);
		}
	} else if (cmd == 'startgame') {
		let res = db_new_table(data.friendly, data.game, data.host, data.players, data.fen, data.options);
		result.table = res.table;
		result.playerdata = res.playerdata;
		result.status = `startgame ${data.friendly}`;
	} else if (cmd == 'tables') {
		result.tables = dict2list(GT, 'friendly').map(x => x.table);
		result.status = "tables";
	} else if (cmd == 'gameover') {
		result.table = db_write_fen(data.friendly, data.fen, data.scoring);
		result.status = `scored table ${data.friendly}`;
	}
	return result;
}
function data_from_client(raw) {
	assertion(is_stringified(raw), 'data should be stringified json!!!!!!!!!!!!!!!', raw);
	let js = JSON.parse(raw);
	return js;
}
function db_clear_players(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly]; //for now only 1 copy!
	for (const pldata of t.playerdata) { pldata.state = null; pldata.player_status = null; }
	return t.playerdata;
}
function db_new_table(friendly, game, host, players, fen, options) {
	let table = { friendly, game, host, players, fen, options };
	table.modified = Date.now();	//console.log(table.modified,typeof table.modified);
	let playerdata = [];
	for (const plname of players) {
		playerdata.push({ name: `${plname}`, state: null, player_status: null });
	}
	let res = { table, playerdata };
	GT[friendly] = res;
	return res;
}
function db_read_playerdata(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	return GT[friendly].playerdata;
}
function db_read_table(friendly) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	return GT[friendly].table;
}
function db_table_exists(friendly) { return isdef(GT[friendly]); }
function db_write_fen(friendly, fen, scoring = null) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	let table = t.table;
	table.fen = fen; table.scoring = scoring; table.phase = isdef(scoring) ? 'over' : '';
	table.modified = Date.now();	//console.log(table.modified,typeof table.modified);
	return table;
}
function db_write_player(friendly, uname, state, player_status) {
	assertion(isdef(GT[friendly]), `table ${friendly} does NOT exist!!!!`);
	let t = GT[friendly];
	let pldata = firstCond(t.playerdata, x => x.name == uname);
	pldata.state = state;
	pldata.player_status = player_status;
	pldata.checked = Date.now();
	return t.playerdata;
}
function sendSIMSIM(o, exclusive = false, saveFromZ = false) {
	o = data_from_client(o);	//console.log('sendSIMSIM', o,exclusive);
	let result = apiphp(o, saveFromZ); //console.log('result', result); //this is server send!!! 
	if (TESTING && o.cmd == 'startgame') { for (const func of DA.test.mods) func(result.table); }
	let res = JSON.stringify(result);
	if (exclusive) { if_hotseat_autoswitch(result); handle_result(res, o.cmd); } else { console.log('sendSIMSIM testresult', result); }
}
//#endregion apisimphp

//#region cards
function accuse_get_card(ckey, h, w, backcolor = BLUE, ov = .3) {
	if (is_color(ckey)) {
		return get_color_card(ckey, h)
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
	fen.akku = akku;
	return di_ranks;
}
function ari_get_card(ckey, h, w, ov = .3) {
	let type = ckey[2];
	let sz = { largecard: 100, smallcard: 50 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	else if (type == 'h') heritage_card_deco(card);
	return card;
}
function ari_get_card_large(ckey, h, w, ov = .2) {
	let type = ckey[2];
	let sz = { largecard: 120, smallcard: 80 };
	let info = type == 'n' ? to_aristocard(ckey, sz.largecard) : type == 'l' ? to_luxurycard(ckey, sz.largecard) : type == 'r' ? to_rumorcard(ckey, sz.smallcard) : to_commissioncard(ckey, sz.smallcard);
	let card = cardFromInfo(info, h, w, ov);
	if (type == 'l') luxury_card_deco(card);
	return card;
}
function calc_hand_value(hand, card_func = ferro_get_card) {
	let vals = hand.map(x => card_func(x).val);
	let sum = vals.reduce((a, b) => a + b, 0);
	return sum;
}
function cardFromInfo(info, h, w, ov) {
	let svgCode = C52[info.c52key];
	let ckey = info.key;
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
	return newarr;
}
function ferro_get_card(ckey, h, w, ov = .25) {
	let type = ckey[2];
	let info = ckey[0] == '*' ? get_joker_info() : jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2]; //n,l,c=mini...
	let [r, s] = [info.rank, info.suit];
	info.val = r == '*' ? 50 : r == 'A' ? 20 : 'TJQK'.includes(r) ? 10 : Number(r);
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
function heritage_card_deco(card) {
	let d = iDiv(card); mStyle(d, { position: 'relative' });
	let d1 = mDiv(d, { fg: 'silver', fz: 11, family: 'tangerine', position: 'absolute', right: '36%', top: 1 }, null, 'heritage');
}
function is_card_key(ckey, rankstr = '*A23456789TJQK', suitstr = 'SHCD') {
	return is_nc_card(ckey) || is_color(ckey) || rankstr.includes(ckey[0]) && suitstr.includes(ckey[1]);
}
function is_joker(card) { return is_jolly(card.key); }
function is_jolly(ckey) { return ckey[0] == '*'; }
function is_overlapping_set(cards, max_jollies_allowed = 1, seqlen = 7, group_same_suit_allowed = true) {
	let istart = 0;
	let inextstart = 0;
	let lmin = 3;
	let legal = true;
	if (cards.length < lmin) return false;
	while (legal && istart <= cards.length - lmin) {
		let cl = cards.slice(istart, istart + lmin);
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
	let jolly_idx = find_index_of_jolly(j);
	j[jolly_idx] = key;
}
function sort_cards(hand, bySuit = true, suits = 'CDHS', byRank = true, rankstr = '23456789TJQKA') {
	if (bySuit && byRank) {
		let buckets = arrBuckets(hand, x => x[1], suits);
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
	let i_max_diff = partial_sequences.findIndex(x => x.diff_to_next == Math.max(...partial_sequences.map(x => x.diff_to_next)));
	let max_diff = partial_sequences[i_max_diff].diff_to_next;
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
		if (i < len - 1) {
			for (let j = 0; j < nj; j++) { final_sequence.push(jollies[ij++]); }
			jollies_needed += nj;
		}
	}
	for (let i = 0; i < final_sequence.length; i++) { items[i] = final_sequence[i]; }
	return jollies_needed;
}
function spread_hand(path, ov) {
	let hand = lookup(UI, path.split('.'));
	assertion(hand, 'hand does NOT exist', path);
	if (hand.ctype != 'hand') return;
	if (isEmpty(hand.items)) return;
	let card = hand.items[0];
	if (nundef(ov)) ov = card.ov;
	if (hand.ov == ov) return;
	hand.ov = ov;
	let cont = hand.cardcontainer;
	let items = hand.items;
	mContainerSplay(cont, hand.splay, card.w, card.h, items.length, ov * card.w);
}
function to_aristocard(ckey, sz = 100, color = RED, w) {
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
function to_commissioncard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
function to_luxurycard(ckey, sz = 100, color = 'gold', w) { return to_aristocard(ckey, sz, color); }
function to_rumorcard(ckey, sz = 40, color = GREEN, w) { return to_aristocard(ckey, sz, color); }
function ui_add_cards_to_hand_container(cont, items, list) {
	if (nundef(list)) list = items.map(x => x.key);
	for (const item of items) {
		mAppend(cont, iDiv(item));
		mItemSplay(item, list, 2, Card.ovw);
	}
}
//#endregion cards

//#region gamehelpers
var WhichCorner = 0;
function activate_playerstats(items) {
	let fen = Z.fen;
	for (const plname in fen.players) {
		let ui = items[plname];
		let d = iDiv(ui);
		d.onclick = () => { switch_uname(plname); onclick_reload(); }
	}
}
function activate_ui() {
	if (uiActivated) { DA.ai_is_moving = false; return; }
	uiActivated = true; DA.ai_is_moving = false;
}
function ai_move(ms = 100) {
	DA.ai_is_moving = true;
	let [A, fen] = [valf(Z.A, {}), Z.fen];
	let selitems;
	if (Z.game == 'accuse' && Z.stage == 'hand') {
		selitems = [];
	} else if (Z.game == 'ferro') {
		if (Z.stage == 'card_selection') {
			let uplayer = Z.uplayer;
			let i1 = firstCond(A.items, x => x.path.includes(`${uplayer}.hand`));
			let i2 = firstCond(A.items, x => x.key == 'discard');
			selitems = [i1, i2];
		} else if (Z.stage == 'buy_or_pass') {
			selitems = [A.items[1]]; //waehlt immer pass
		} else selitems = [A.items[0]];
	} else if (Z.game == 'bluff') {
		let [newbid, handler] = bluff_ai();
		if (newbid) { fen.newbid = newbid; UI.dAnzeige.innerHTML = bid_to_string(newbid); }
		else if (handler != handle_gehtHoch) { bluff_generate_random_bid(); }
		A.callback = handler;
		selitems = [];
	} else if (A.command == 'trade') {
		selitems = ai_pick_legal_trade();
	} else if (A.command == 'exchange') {
		selitems = ai_pick_legal_exchange();
	} else if (A.command == 'upgrade') {
		selitems = [rChoose(A.items)];
	} else if (A.command == 'rumor') {
		selitems = [];
		let buildings = A.items.filter(x => x.path.includes('building'));
		let rumors = A.items.filter(x => !x.path.includes('building'));
		selitems = [rChoose(buildings), rChoose(rumors)];
	} else if (ARI.stage[Z.stage] == 'rumors_weitergeben') {
		let players = A.items.filter(x => Z.plorder.includes(x.key))
		let rumors = A.items.filter(x => !Z.plorder.includes(x.key))
		selitems = [rChoose(players), rChoose(rumors)];
	} else if (ARI.stage[Z.stage] == 'journey') {
		selitems = []; // always pass!
	} else {
		let items = A.items;
		let nmin = A.minselected;
		let nmax = Math.min(A.maxselected, items.length);
		let nselect = rNumber(nmin, nmax);
		selitems = rChoose(items, nselect); if (!isList(selitems)) selitems = [selitems];
	}
	for (const item of selitems) {
		select_last(item, select_toggle);
		if (isdef(item.submit_on_click)) A.selected.pop();
	}
	clearTimeout(TO.ai);
	loader_on();
	TO.ai = setTimeout(() => { if (isdef(A.callback)) A.callback(); loader_off(); }, ms);
}
function animate_card_exchange(i0, i1, callback) {
	showItemAsUnselected(i0);
	showItemAsUnselected(i1);
	let d0 = iDiv(i0.o);
	let d1 = iDiv(i1.o);
	let r0 = getRect(d0);
	let r1 = getRect(d1);
	let c0 = { x: r0.x + r0.w / 2, y: r0.y + r0.h / 2 };
	let c1 = { x: r1.x + r1.w / 2, y: r1.y + r1.h / 2 };
	let v = { x: c1.x - c0.x, y: c1.y - c0.y };
	mTranslateBy(d0, v.x, v.y);
	mTranslateBy(d1, -v.x, -v.y, 700, callback);
}
function animate_card_transfer(card, goal, callback) {
	let d = iDiv(card);
	let dgoal = iDiv(goal); //das muss irgendein UI item sein!
	let r = getRect(d);
	let rgoal = getRect(dgoal);
	let c = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
	let cgoal = { x: rgoal.x + rgoal.w / 2, y: rgoal.y + rgoal.h / 2 };
	let v = { x: cgoal.x - c.x, y: cgoal.y - c.y };
	mTranslateBy(d, v.x, v.y, 700, callback);
}
function animatedTitle(msg = 'DU BIST DRAN!!!!!') {
	TO.titleInterval = setInterval(() => {
		let corner = CORNERS[WhichCorner++ % CORNERS.length];
		document.title = `${corner} ${msg}`; //'⌞&amp;21543;    U+231E \0xE2Fo\u0027o Bar';
	}, 1000);
}
function clear_screen() { mShieldsOff(); clear_status(); clear_title(); for (const ch of arrChildren('dScreen')) mClear(ch); mClassRemove('dTexture', 'wood'); mStyle(document.body, { bg: 'white', fg: 'black' }); }
function clear_status() { if (nundef(mBy('dStatus'))) return; clearTimeout(TO.fleeting); mRemove("dStatus"); }
function clear_title() { mClear('dTitleMiddle'); mClear('dTitleLeft'); mClear('dTitleRight'); }
function clearPlayers() {
	for (const item of DA.allPlayers) {
		if (item.isSelected && !is_loggedin(item.uname)) {
			style_not_playing(item, '', DA.playerlist);
		}
	}
	assertion(!isEmpty(DA.playerlist), "uname removed from playerlist!!!!!!!!!!!!!!!")
	DA.lastName = DA.playerlist[0].uname; // DA.allPlayers.find(x=>x.uname == DA.playerlist[0]);
}
function collect_game_specific_options(game) {
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	let di = {};
	for (const p in poss) {
		let key = p;
		let vals = poss[p];
		if (isString(vals) && vals.split(',').length <= 1) {
			di[p] = isNumber(vals) ? Number(vals) : vals;
			continue;
		}
		let fs = mBy(`d_${p}`);
		let val = get_checked_radios(fs)[0];
		di[p] = isNumber(val) ? Number(val) : val;
	}
	return di;
}
function deactivate_ui() { uiActivated = false; DA.ai_is_moving = true; }
function delete_table(friendly) { stopgame(); phpPost({ friendly: friendly }, 'delete_table'); }
function ev_to_gname(ev) { evNoBubble(ev); return evToTargetAttribute(ev, 'gamename'); }
function find_card(index, ui_item) { return ui_item.items[index]; }
function gamestep() {
	show_admin_ui();
	DA.running = true; clear_screen(); dTable = mBy('dTable'); mClass('dTexture', 'wood');
	if (Z.game == 'aristo') { if (Z.role != Clientdata.role || Z.mode == 'multi' && Z.role != 'active') mFall(dTable); Clientdata.role = Z.role; }//else mTableTransition(dTable, 2000);
	else mFall(dTable);
	shield_off();
	show_title();
	show_role();
	Z.func.present(dTable);	// *** Z.uname und Z.uplayer ist IMMER da! ***
	if (isdef(Z.scoring.winners)) { show_winners(); animatedTitle('GAMEOVER!'); }
	else if (Z.func.check_gameover(Z)) {
		let winners = show_winners();
		Z.scoring = { winners: winners }
		sendgameover(winners[0], Z.friendly, Z.fen, Z.scoring);
	} else if (is_shield_mode()) {
		staticTitle();
		if (!DA.no_shield == true) { hide('bRestartMove'); shield_on(); } //mShield(dTable.firstChild.childNodes[1])} //if (isdef(Z.fen.shield)) mShield(dTable);  }
		autopoll();
	} else {
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null, autosubmit: Config.autosubmit };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z);
		Z.func.activate_ui();
		if (Z.isWaiting == true || Z.mode != 'multi') staticTitle(); else animatedTitle();
		if (Z.options.zen_mode != 'yes' && Z.mode != 'hotseat' && Z.fen.keeppolling) {
			autopoll();
			console.log('gamestep autopoll');
		}
	}
	if (TESTING == true) landing();	//DA.max=100;DA.runs=valf(DA.runs+1,0);if (DA.runs<DA.max) onclick_restart();
}
function generate_table_name(n) {
	let existing = Serverdata.tables.map(x => x.friendly);
	while (true) {
		let cap = rChoose(Info.capital);
		let parts = cap.split(' ');
		if (parts.length == 2) cap = stringBefore(cap, ' '); else cap = stringBefore(cap, '-');
		cap = cap.trim();
		let s = (n == 2 ? 'duel of ' : rChoose(['battle of ', 'war of '])) + cap;
		if (!existing.includes(s)) return s;
	}
}
function get_admin_player(list) {
	let res = valf(firstCond(list, x => x == 'mimi'), firstCond(list, x => ['felix', 'amanda', 'lauren'].includes(x)));
	return res ?? list[0]; //if (!res) return list[0];
}
function get_game_color(game) { return colorFrom(Config.games[game].color); }
function get_logout_button() {
	let html = `<a id="aLogout" href="javascript:onclick_logout()">logout</a>`;
	return mCreateFrom(html);
}
function get_multi_trigger() { return lookup(Z, ['fen', 'trigger']); }
function get_next_in_list(el, list) {
	let iturn = list.indexOf(el);
	let nextplayer = list[(iturn + 1) % list.length];
	return nextplayer;
}
function get_playmode(uname) { return Z.fen.players[uname].playmode; }
function get_texture(name) { return `url(../base/assets/images/textures/${name}.png)`; }
function get_user_pic_and_name(uname, dParent, sz = 50, border = 'solid medium white') {
	let html = `
			<div username='${uname}' style='text-align:center;font-size:${sz / 2.8}px'>
				<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0;border:${border}'>
				<div style='margin-top:${-sz / 6}px'>${uname}</div>
			</div>`;
	let elem = mCreateFrom(html);
	mAppend(dParent, elem);
	return elem;
}
function _get_waiting_html(sz = 30) { return `<img src="../base/assets/images/active_player.gif" height="${sz}" style="margin:0px ${sz / 3}px" />`; }
function hFunc(content, funcname, arg1, arg2, arg3) {
	let html = `<a style='color:blue' href="javascript:${funcname}('${arg1}','${arg2}','${arg3}');">${content}</a>`;
	return html;
}
function hide_buildings() {
	let uplayer = Z.uplayer;
	let buildings = UI.players[uplayer].buildinglist;
	for (const b of buildings) {
		for (let i = 1; i < b.items.length; i++) {
			let card = b.items[i];
			if (b.schweine.includes(card)) continue;
			face_down(b.items[i]);
		}
	}
}
function HPLayout() {
	if (isdef(UI.DRR)) UI.DRR.remove();
	mInsert(UI.dRechts, UI.dHistory);
	Clientdata.historyLayout = 'hp';
}
function HRPLayout() {
	let dr = UI.dRechts;
	dr.remove();
	let drr = UI.DRR = mDiv(dTable);
	mAppend(drr, UI.dHistory);
	mAppend(dTable, dr);
	Clientdata.historyLayout = 'hrp';
}
function i_am_acting_host() { return U.name == Z.fen.acting_host; }
function i_am_host() { return U.name == Z.host; }
function i_am_trigger() { return is_multi_trigger(U.name); }
function if_hotseat_autoswitch(result) {
	if (isdef(result.table) && isdef(Z) && Z.mode == 'hotseat') { //!DA.AUTOSWITCH) {
		let turn = lookup(result, ['table', 'fen', 'turn']);
		assertion(isdef(turn), 'turn is NOT defined (_sendSIMSIM) !!!!');
		let uname = turn.length == 1 ? turn[0] : get_next_in_list(U.name, turn);
		if (uname != U.name) switch_uname(uname);
	}
}
function is_advanced_user() {
	let advancedUsers = ['mimi', 'felix', 'bob', 'buddy', 'minnow', 'nimble', 'leo']; //, 'guest', 'felix'];
	return isdef(U) && ((advancedUsers.includes(DA.secretuser) || advancedUsers.includes(U.name)));
}
function is_ai_player(plname) {
	let [fen, name] = [Z.fen, valf(plname, Z.uplayer)];
	return lookup(fen, ['players', name, 'playmode']) == 'bot';
}
function is_color(s) { return isdef(ColorDi[s.toLowerCase()]); }
function is_human_player(plname) {
	let [fen, name] = [Z.fen, valf(plname, Z.uplayer)];
	return lookup(fen, ['players', name, 'playmode']) == 'human';
}
function is_loggedin(name) { return isdef(U) && U.name == name; }
function is_multi_trigger(plname) { return lookup(Z, ['fen', 'trigger']) == plname; }
function is_player(s) { return isdef(Z.fen.players[s]); }
function is_playing(pl, fen) {
	return isList(fen.plorder) && fen.plorder.includes(pl) || isList(fen.roundorder) && fen.roundorder.includes(pl) || Z.game == 'feedback' && isdef(Z.fen.players[pl]);
}
function is_shield_mode() {
	return Z.role == 'spectator'
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.host != Z.uname
		|| Z.mode == 'multi' && Z.role == 'inactive' && Z.pl.playmode != 'bot'
}
function new_cards_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (stage == 'card_selection' && !isEmpty(pl.newcards)) {
		let anim_elems = [];
		for (const key of pl.newcards) {
			let ui = lastCond(UI.players[uplayer].hand.items, x => x.key == key);
			if (nundef(ui)) { pl.newcards = []; return; }
			ui = iDiv(ui);
			anim_elems.push(ui);
		}
		delete pl.newcards;
		anim_elems.map(x => mPulse(x, n * 1000));
	}
}
function path2fen(fen, path) { let o = lookup(fen, path.split('.')); return o; }
function PHLayout() {
	if (isdef(UI.DRR)) UI.DRR.remove();
	mAppend(UI.dRechts, UI.dHistory);
	Clientdata.historyLayout = 'ph';
}
function player_stat_count(key, n, dParent, styles = {}) {
	let sz = valf(styles.sz, 16);
	addKeys({ display: 'flex', margin: 4, dir: 'column', hmax: 2 * sz, 'align-content': 'start', fz: sz, align: 'center' }, styles);
	let d = mDiv(dParent, styles);
	if (isdef(Syms[key])) mSym(key, d, { h: sz, 'line-height': sz, w: '100%' });
	else mText(key, d, { h: sz, fz: sz, w: '100%' });
	d.innerHTML += `<span style="font-weight:bold">${n}</span>`;
	return d;
}
function prep_move() {
	let [fen, uplayer, pl] = [Z.fen, Z.uplayer, Z.pl];
	for (const k of ['round', 'phase', 'stage', 'step', 'turn']) { fen[k] = Z[k]; }
	deactivate_ui();
	clear_timeouts();
}
function PRHLayout() {
	let drr = UI.DRR = mDiv(dTable);
	mAppend(drr, UI.dHistory);
	Clientdata.historyLayout = 'prh';
}
function remove_player(fen, uname) {
	if (nundef(fen.original_players)) fen.original_players = jsCopy(fen.players);
	removeInPlace(fen.plorder, uname);
	delete fen.players[uname];
	return fen.plorder;
}
function round_change_animation(n = 2) {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	let pl = fen.players[uplayer];
	if (pl.roundchange) {
		let d = mBy('dTitleLeft');
		mStyle(d, { 'transform-origin': '0% 0%' });
		mPulse(d, n * 1000);
		show_special_message(`${fen.round_winner} won round ${Z.round - 1}!!!`)
		delete pl.roundchange;
	}
}
function sendgameover(plname, friendly, fen, scoring) {
	let o = { winners: plname, friendly: friendly, fen: fen, scoring: scoring };
	phpPost(o, 'gameover');
}
function set_player(name, fen) {
	if (isdef(PL) && PL.name != name) { Z.prev.pl = PL; Z.prev.uplayer = PL.name; }
	PL = Z.pl = firstCond(Serverdata.users, x => x.name == name);
	copyKeys(fen.players[name], PL);
	Z.uplayer = name;
}
function set_player_strategy(val) {
	Z.strategy = Clientdata.strategy = Z.pl.strategy = val;
	mRemove('dOptions')
}
function set_user(name) {
	if (isdef(Z) && isdef(U) && U.name != name) {
		Z.prev.u = U;
		Z.prev.uname = U.name;
	}
	U = firstCond(Serverdata.users, x => x.name == name);
	if (isdef(Z)) {
		Z.u = U;
		Z.uname = name;
	}
}
function shield_off() {
	mStyle('dAdmin', { bg: 'white' });
}
function shield_on() {
	mShield(dTable.firstChild.childNodes[1]);
	mStyle('dAdmin', { bg: 'silver' });
}
function show_admin_ui() {
	for (const id of ['bSpotitStart', 'bClearAck', 'bRandomMove', 'bSkipPlayer', 'bRestartMove', 'dTakeover', 'bExperience']) hide(id);
	if (Z.game == 'spotit' && Z.uname == Z.host && Z.stage == 'init') show('bSpotitStart');
	else if (Z.game == 'bluff' && Z.uname == Z.host && Z.stage == 1) show('bClearAck');
	else if (Z.uname == Z.host && Z.stage == 'round_end') show('bClearAck');
	else if (Z.game == 'ferro' && Z.uname == 'mimi' && Z.stage != 'card_selection') show('bClearAck');
	if (Z.game == 'accuse' && lookup(Z, ['fen', 'players', Z.uplayer, 'experience']) > 0) show('bExperience');
	if (['ferro', 'bluff', 'aristo', 'a_game'].includes(Z.game) && (Z.role == 'active' || Z.mode == 'hotseat')) {
		show('bRandomMove');
	}
	if (Z.uname == Z.host || Z.uname == 'mimi' || Z.uname == 'felix') show('dHostButtons'); else hide('dHostButtons');
	if (DA.showTestButtons == true) show('dTestButtons'); else hide('dTestButtons');
}
function show_game_menu(gamename) {
	stopgame();
	show('dMenu'); mClear('dMenu');
	let dMenu = mBy('dMenu');
	let dForm = mDiv(dMenu, { align: 'center' }, 'fMenuInput');
	let dInputs = mDiv(dForm, {}, 'dMenuInput');
	let dButtons = mDiv(dForm, {}, 'dMenuButtons');
	let bstart = mButton('start', () => {
		let players = DA.playerlist.map(x => ({ name: x.uname, playmode: x.playmode }));
		let game = gamename;
		let options = collect_game_specific_options(game);
		for (const pl of players) { if (isEmpty(pl.strategy)) pl.strategy = valf(options.strategy, 'random'); }
		startgame(game, players, options); hide('dMenu');
	}, dButtons, {}, ['button', 'enabled']);
	let bcancel = mButton('cancel', () => { hide('dMenu'); }, dButtons, {}, ['button', 'enabled']);
	let bclear = mButton('clear players', clearPlayers, dButtons, {}, ['button', 'enabled']);
	let d = dInputs; mClear(d); mCenterFlex(d);
	let dPlayers = mDiv(d, { gap: 6 });
	mCenterFlex(dPlayers);
	DA.playerlist = [];
	DA.allPlayers = [];
	DA.lastName = null;
	let params = [gamename, DA.playerlist];
	let funcs = [style_not_playing, style_playing_as_human, style_playing_as_bot];
	for (const u of Serverdata.users) {
		let d = get_user_pic_and_name(u.name, dPlayers, 40);
		mStyle(d, { w: 60, cursor: 'pointer' })
		let item = { uname: u.name, div: d, state: 0, strategy: '', isSelected: false };
		DA.allPlayers.push(item);
		if (is_loggedin(u.name)) { toggle_select(item, funcs, gamename, DA.playerlist); DA.lastName = U.name; }
		else d.onclick = ev => {
			if (ev.shiftKey) {
				let list = Serverdata.users;
				if (nundef(DA.lastName)) DA.lastName = list[0].name;
				let x1 = list.find(x => x.name == DA.lastName);
				let i1 = list.indexOf(x1);
				let x2 = list.find(x => x.name == item.uname);
				let i2 = list.indexOf(x2);
				if (i1 == i2) return;
				if (i1 > i2) [i1, i2] = [i2, i1];
				assertion(i1 < i2, "NOT IN CORRECT ORDER!!!!!")
				for (let i = i1; i <= i2; i++) {
					let xitem = DA.allPlayers[i];
					if (xitem.isSelected) continue;
					style_playing_as_human(xitem, gamename, DA.playerlist);
				}
				DA.lastName = item.uname;
			} else {
				toggle_select(item, funcs, gamename, DA.playerlist);
				if (item.isSelected) DA.lastName = item.uname;
			}
		}
	}
	mDiv(d, { w: '100%', fz: 11, fg: '#444' }, null, '(use SHIFT to multi-select players)'); //'SHIFT<br>multiselect');
	mLinebreak(d, 1);
	show_game_options(d, gamename);
	mFall('dMenu');
}
function show_game_options(dParent, game) {
	mRemoveChildrenFromIndex(dParent, 2);
	let poss = Config.games[game].options;
	if (nundef(poss)) return;
	for (const p in poss) {
		let key = p;
		let val = poss[p];
		if (isString(val)) {
			let list = val.split(','); // make a list 
			if (list.length <= 1) continue;
			let fs = mRadioGroup(dParent, {}, `d_${key}`, key);
			for (const v of list) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, null, key, true); }
			measure_fieldset(fs);
		}
	}
}
function show_games(ms = 500) {
	let dParent = mBy('dGames');
	mClear(dParent);
	mText(`<h2>start new game</h2>`, dParent, { maleft: 12 });
	let d = mDiv(dParent, { fg: 'white', animation: 'appear 1s ease both' }, 'game_menu'); mFlexWrap(d);
	let gamelist = 'accuse aristo bluff wise spotit ferro'; if (DA.TEST0) gamelist += ' a_game';
	for (const gname of toWords(gamelist)) {
		let g = Config.games[gname];
		let [sym, bg, color, id] = [Syms[g.logo], g.color, null, getUID()];
		let d1 = mDiv(d, { cursor: 'pointer', rounding: 10, margin: 10, padding: 0, patop: 15, wmin: 140, height: 90, bg: bg, position: 'relative' }, g.id);
		d1.setAttribute('gamename', gname);
		d1.onclick = onclick_game_menu_item;
		mCenterFlex(d1);
		mDiv(d1, { fz: 50, family: sym.family, 'line-height': 55 }, null, sym.text);
		mLinebreak(d1);
		mDiv(d1, { fz: 18, align: 'center' }, null, g.friendly);
	}
}
function show_history_layout(layout) {
	assertion(isdef(UI.dHistoryParent) && isdef(UI.dHistory), 'UI.dHistoryParent && UI.dHistory do NOT exist!!!');
	if (layout == 'ph') PHLayout();
	else if (layout == 'hp') HPLayout();
	else if (layout == 'prh') PRHLayout();
	else if (layout == 'hrp') HRPLayout();
	else PHLayout();
}
function show_history_popup() {
	if (isEmpty(Z.fen.history)) return;
	assertion(isdef(UI.dHistoryParent) && isdef(UI.dHistory), 'UI.dHistoryParent && UI.dHistory do NOT exist!!!');
	let l = valf(Clientdata.historyLayout, 'ph');
	let cycle = ['ph', 'hp', 'prh', 'hrp'];
	let i = (cycle.indexOf(l) + 1) % cycle.length;
	show_history_layout(cycle[i]);
}
function show_hourglass(uname, d, sz, stylesPos = {}) {
	let html = get_waiting_html(sz);
	mStyle(d, { position: 'relative' });
	addKeys({ position: 'absolute' }, stylesPos);
	let dw = mDiv(d, stylesPos, `dh_${uname}`, html);
}
function show_instruction(msg) { mBy('dSelections0').innerHTML = msg; }
function show_message(msg = '', stay = false) {
	mStyle(dTable, { transition: 'all 1s ease' });
	let d = mBy('dMessage'); d.innerHTML = msg;
	if (stay) return;
	let ms = 1000, delay = 3000;
	let anim = d.animate([{ transform: `scale(1,1)`, opacity: 1 }, { transform: `scale(1,0)`, opacity: 0 },], { duration: 1000, easing: 'ease', delay: delay });
	dTable.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-56px)' },], { fill: 'none', duration: ms, easing: 'ease', delay: delay });
	anim.onfinish = () => {
		mClear(d);
	}
}
function show_options_popup(options) {
	let opresent = {};
	let di = { mode: 'gamemode', yes: true, no: false };
	let keys = get_keys(options);
	keys.sort();
	for (const k of get_keys(options).sort()) {
		let key = valf(di[k], k);
		let val = valf(di[options[k]], options[k]);
		opresent[key] = val;
	}
	let x = mYaml(mCreate('div'), opresent);
	let dpop = mPopup(x.innerHTML, dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, bg: 'dimgray' }, 'dOptions');
	mInsert(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
}
function show_playerdatastate() {
	for (const pldata of Z.playerdata) {
		console.log('player', pldata.name, `status=${isEmpty(pldata.player_status) ? 'none' : pldata.player_status}`, pldata.state);
	}
}
function show_polling_signal() {
	if (DA.TEST0 != true) return;
	let d1 = mDiv(mBy('dAdmin'), { position: 'fixed', top: 10, left: 73 });
	let bg = Z.skip_presentation == true ? 'grey' : 'green'; //valf(DA.reloadColor, 'green')
	let d2 = mDiv(d1, { width: 20, height: 20, bg: bg, rounding: 10, display: 'inline-block' });
	mFadeRemove(d1, 1000);
}
function show_role() {
	if (Z.game == 'accuse') { show_role_accuse(); return; }
	let d = mBy('dAdminMiddle');
	clearElement(d);
	let hotseatplayer = Z.uname != Z.uplayer && Z.mode == 'hotseat' && Z.host == Z.uname;
	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	let location = ''; //`<span style="color:dimgray;font-family:Algerian">${Z.friendly}  </span>`; // `in ${stringAfter(Z.friendly,'of ')}`;
	if (hotseatplayer) {
		styles = boldstyle;
		text = `your turn for ${Z.uplayer}`;
	} else if (Z.role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
	} else if (Z.role == 'active') {
		styles = boldstyle;
		text = `It's your turn!!!`;
	} else if (Z.role == 'waiting') {
		text = `waiting for players to complete their moves...`;
	} else {
		assertion(Z.role == 'inactive', 'role is not active or inactive or spectating ' + Z.role);
		styles = normalstyle;
		text = `(${Z.turn[0]}'s turn)`;
	}
	d.innerHTML = location + text;
	mStyle(d, styles);
}
function show_settings(dParent) {
	let [options, fen, uplayer] = [Z.options, Z.fen, Z.uplayer];
	clearElement(dParent);
	mFlex(dParent);
	mStyle(dParent, { 'justify-content': 'end', gap: 12, paright: 10 })
	let playmode = get_playmode(uplayer); //console.log('playmode',playmode,'uplayer',uplayer);
	let game_mode = Z.mode;
	let st = { fz: 20, padding: 0, h: 40, box: true, matop: 2, rounding: '50%', cursor: 'pointer' };
	let dHistoryButton = miPic('scroll', dParent, st);
	dHistoryButton.onclick = show_history_popup;
	if (isdef(Config.games[Z.game].options.strategy)) {
		let dStrategy = miPic('chess pawn', dParent, st);
		dStrategy.onclick = show_strategy_popup;
	}
	let d = miPic('gear', dParent, st);
	options.playmode = playmode;
	d.onmouseenter = () => show_options_popup(options);
	d.onmouseleave = hide_options_popup;
}
function show_strategy_popup() {
	let dpop = mPopup('', dTable, { fz: 16, fg: 'white', top: 0, right: 0, border: 'white', padding: 10, bg: 'dimgray' }, 'dOptions');
	mAppend(dpop, mCreateFrom(`<div style="text-align:center;width:100%;font-family:Algerian;font-size:22px;">${Z.game}</div>`));
	mDiv(dpop, { matop: 5, maleft: 10 }, null, `choose strategy:`);
	let vals = Config.games[Z.game].options.strategy.split(',');
	let key = 'strategy';
	let fs = mRadioGroup(dpop, { fg: 'white' }, `d_${key}`); //,`${key}`, {fg:'white',border:'1px solid red'});
	for (const v of vals) { mRadio(v, isNumber(v) ? Number(v) : v, key, fs, { cursor: 'pointer' }, set_player_strategy, key, v == Z.strategy); }
	measure_fieldset(fs);
}
function show_tables(ms = 500) {
	clear_screen();
	let dParent = mBy('dTables');
	mClear(dParent);
	show_games();
	let tables = Serverdata.tables;
	if (isEmpty(tables)) { mText('no active game tables', dParent); return []; }
	tables.map(x => x.game_friendly = Config.games[x.game].friendly);
	mText(`<h2>game tables</h2>`, dParent, { maleft: 12 })
	let t = mDataTable(tables, dParent, null, ['friendly', 'game_friendly', 'players'], 'tables', false);
	mTableCommandify(t.rowitems, {
		0: (item, val) => hFunc(val, 'onclick_table', val, item.id),
	});
	let d = iDiv(t);
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let h = hFunc('delete', 'delete_table', ri.o.friendly);
		c = mAppend(r, mCreate('td'));
		c.innerHTML = h;
	}
}
function show_title() {
	settingsOn = Z.func.state_info(mBy('dTitleLeft'));
	if (nundef(settingsOn) || settingsOn) show_settings(mBy('dTitleRight'));
	mBy('dTablename').innerHTML = Z.friendly;
}
function show_username(loadTable = false) {
	let uname = U.name;
	let dpic = get_user_pic(uname, 30);
	let d = mBy('dAdminRight');
	mClear(d);
	if (['felix', 'mimi', 'lauren', 'amanda'].includes(uname)) add_advanced_ui(d); //mAppend(d, get_advanced_menu_buttons());
	mAppend(d, get_logout_button());
	mAppend(d, dpic);
	if (is_advanced_user()) { show('dAdvanced1'); } else { hide('dAdvanced'); hide('dAdvanced1'); }
	if (!TESTING && !DA.running) {
		if (!loadTable) phpPost({ app: 'easy' }, 'tables');
		else if (!isEmpty(Serverdata.tables)) {
			onclick_table(Serverdata.tables[0].friendly);
		}
	}
}
function show_users(ms = 300) {
	let dParent = mBy('dUsers');
	mClear(dParent);
	for (const u of Serverdata.users) {
		if (['ally', 'bob', 'leo'].includes(u.name)) continue;
		let d = get_user_pic_and_name(u.name, dParent);
		d.onclick = () => onclick_user(u.name);
		mStyle(d, { cursor: 'pointer' });
	}
	mFall(dParent, ms);
}
function show_waiting_for_ack_message() {
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	mBy('dSelections0').innerHTML = 'waiting for next round to start...'; //.remove();
}
function show_waiting_message(msg) {
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	mBy('dSelections0').innerHTML = msg;
}
function show_winners() {
	let winners = Z.fen.winners;
	let multiple_winners = winners.length > 1;
	let winners_html = winners.map(x => get_user_pic_html(x, 35)).join(' ');
	let msg = `
		<div style="display:flex;gap:10px;align-items:center">
			<div style="color:red;font-size:22px;font-weight:bold;">GAME OVER! the winner${multiple_winners ? 's are: ' : ' is '}</div>
			<div style="padding-top:5px;">${winners_html}</div>
		</div>
	`;
	show_message(msg, true);
	mShield(dTable);
	hide('bRestartMove');
	return Z.fen.winners;
}
function shuffletest(list) {
	for (let i = 0; i < 100; i++) {
		shuffle(list);
		console.log('shuffle: ' + jsCopy(list));
	}
}
function sss() { show_playerdatastate(); }
function start() {
	DA.showTestButtons = true;
	let uname = DA.secretuser = localStorage.getItem('uname');
	if (isdef(uname)) U = { name: uname };
	phpPost({ app: 'simple' }, 'assets');
}
function start_game_with_players(n, game = 'accuse', opts = {}) {
	let numplayers = n;
	let list = jsCopy(Serverdata.users).map(x => x.name);
	removeInPlace(list, 'mimi');
	removeInPlace(list, 'felix');
	let playernames = rChoose(list, numplayers - 2);
	playernames = ['mimi', 'felix'].concat(playernames);
	let uname = U.name;
	removeInPlace(playernames, uname);
	playernames.unshift(uname);
	let playmodes = playernames.map(x => 'human');
	let players = [];
	for (let i = 0; i < n; i++) players.push({ name: playernames[i], playmode: playmodes[i] });
	addKeys({ mode: 'multi' }, opts);
	startgame(game, players, opts);
}
function start_with_assets(reload = false) {
	DA.isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1; if (DA.isFirefox) console.log('using Firefox!')
	show_home_logo();
	if (nundef(U)) { show_users(); return; }
	show_username(reload);
	if (DA.TEST0 || DA.showTestButtons) show('dTestButtons');
}
function startgame(game, players, options = {}) {
	if (nundef(game)) game = 'a_game';
	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
	addKeys(default_options, options); //ensure options
	if (nundef(players)) players = rChoose(Serverdata.users, 2).map(x => ({ name: x.name })); //, playmode: 'human', strategy:valf(options.strategy,'random') })); //ensure players
	let playernames = players.map(x => x.name);
	let fen = window[game]().setup(playernames, options);
	if (nundef(fen.round)) fen.round = 1;
	if (nundef(fen.phase)) fen.phase = '';
	if (nundef(fen.stage)) fen.stage = 0;
	if (nundef(fen.step)) fen.step = 0;
	if (nundef(fen.turn)) fen.turn = [fen.plorder[0]]; else if (DA.TESTSTART1 && fen.turn.length == 1) fen.turn = [playernames[0]];
	players.map(x => { let pl = fen.players[x.name]; pl.playmode = valf(x.playmode, 'human'); pl.strategy = valf(x.strategy, valf(options.strategy, 'random')); });
	if (options.mode == 'solo') {
		let me = isdef(U) && isdef(fen.players[U.name]) ? U.name : rChoose(playernames);
		for (const plname of playernames) {
			if (plname == me) continue;
			fen.players[plname].playmode = 'bot';
		}
		options.mode = 'hotseat';
	}
	for (const k in options) { if (isNumber(options[k])) options[k] = parseInt(options[k]); }
	let o = {
		friendly: generate_table_name(players.length), game: game, host: playernames[0], players: playernames,
		fen: fen, options: options
	};
	ensure_polling(); // macht einfach nur Pollmode = 'auto'
	phpPost(o, 'startgame');
}
function stopgame() {
	if (!DA.running) return;
	DA.running = false;
	DA.noshow = 0;
	clear_timeouts();
	hide('bRestartMove');
	hide('dHostButtons');
	mStyle('dAdmin', { bg: 'white' });
	mClear('dAdminMiddle')
	for (const id of ['bSpotitStart', 'bClearAck', 'bRandomMove', 'bSkipPlayer']) hide(id);
	pollStop();
	Z = null; delete Serverdata.table; delete Serverdata.playerdata; Clientdata = {};
	staticTitle();
}
function switch_uname(plname) {
	set_user(plname);
	show_username();
}
function tableLayoutMR(dParent, m = 7, r = 1) {
	let ui = UI; ui.players = {};
	clearElement(dParent);
	let bg = 'transparent';
	let [dMiddle, dRechts] = [ui.dMiddle, ui.dRechts] = mColFlex(dParent, [m, r], [bg, bg]);
	mCenterFlex(dMiddle, false); //no horizontal centering!
	let dOben = ui.dOben = mDiv(dMiddle, { w: '100%', display: 'block' }, 'dOben');
	let dSelections = ui.dSelections = mDiv(dOben, {}, 'dSelections');
	for (let i = 0; i <= 5; i++) { ui[`dSelections${i}`] = mDiv(dSelections, {}, `dSelections${i}`); }
	let dActions = ui.dActions = mDiv(dOben, { w: '100%' });
	for (let i = 0; i <= 5; i++) { ui[`dActions${i}`] = mDiv(dActions, { w: '100%' }, `dActions${i}`); }
	ui.dError = mDiv(dOben, { w: '100%', bg: 'red', fg: 'yellow', hpadding: 12, box: true }, 'dError');
	let dSubmitOrRestart = ui.dSubmitOrRestart = mDiv(dOben, { w: '100%' });
	let dOpenTable = ui.dOpenTable = mDiv(dMiddle, { w: '100%', padding: 10 }); mFlexWrap(dOpenTable);// mLinebreak(d_table);
	return [dOben, dOpenTable, dMiddle, dRechts];
}
function take_turn(write_fen = true, write_player = false, clear_players = false, player_status = null) {
	prep_move();
	let o = { uname: Z.uplayer, friendly: Z.friendly };
	if (isdef(Z.fen)) o.fen = Z.fen;
	if (write_fen) { assertion(isdef(Z.fen) && isdef(Z.fen.turn), 'write_fen without fen!!!!'); o.write_fen = true; }
	if (write_player) {
		o.write_player = true;
		if (isdef(Z.state)) o.state = Z.state;
		if (isdef(Z.state1)) o.state1 = Z.state1;
		if (isdef(Z.state2)) o.state2 = Z.state2;
	}
	if (clear_players) {
		o.clear_players = true; delete Z.playerdata; delete o.fen.pldata;
	}
	o.player_status = player_status;
	let cmd = 'table';
	send_or_sim(o, cmd);
}
function take_turn_fen() { take_turn(); }
function take_turn_fen_clear() { take_turn(true, false, true); }
function take_turn_fen_write() { take_turn(true, true); }
function take_turn_multi() { if (isdef(Z.state)) take_turn(false, true); else take_turn(false, false); }
function take_turn_spotit() { take_turn(true, true); }
function take_turn_state1() { if (isdef(Z.state1)) take_turn(false, true); else take_turn(false, false); }
function take_turn_waiting() { take_turn(true, false, false, null); }
function take_turn_write() { take_turn_multi(); }
//#endregion gamehelpers

//#region onclick
function onclick_ack() {
	if (nundef(Z) || nundef(Z.func.clear_ack)) return;
	Z.func.clear_ack();
}
function onclick_advanced_mode() { Clientdata.mode = toggle_mode(); } //onclick_reload(); }
function onclick_advanced_test() {
	DA.showTestButtons = toggle_visibility('dTestButtons');
	style_advanced_button();
}
function onclick_experience() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let plnames = get_other_players();
	let nums = range(1, fen.players[uplayer].experience);
	if (isEmpty(nums)) { show_special_message('you dont have any experience points!'); return; }
	show_special_popup('select player and number of experience points to gift:', send_experience_points, {}, plnames, nums);
}
function onclick_game_menu_item(ev) { show_game_menu(ev_to_gname(ev)); }
function onclick_logout() {
	mFadeClearShow('dAdminRight', 300);
	mClear('dAdminMiddle');
	stopgame();
	clear_screen();
	U = null;
	show_users();
}
function onclick_random() {
	if (uiActivated && !DA.ai_is_moving) ai_move(300);
	else if (!uiActivated) console.log('NOP: ui not activated...');
	else if (DA.ai_is_moving) console.log('NOP: ai is (or was already) moving...');
	else console.log('NOP: unknown...');
}
function onclick_reload() {
	if (isdef(Z)) {
		if (Z.game == 'fritz' && nundef(Z.fen.winners)) {
			console.log(Z);
			Z.fen.players[Z.uplayer].time_left = stop_timer();
			take_turn_fen();
		} else {
			FORCE_REDRAW = true; send_or_sim({ friendly: Z.friendly, uname: Z.uplayer, auto: false }, 'table');
		}
	} else if (U) { onclick_tables(); }
	else { show_users(); }
}
function onclick_remove_host() {
	let [role, host, game, fen, uplayer, turn, stage] = [Z.role, Z.host, Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
}
function onclick_reset_all() { stopgame(); phpPost({ app: 'simple' }, 'delete_tables'); }
function onclick_restart() {
	let [game, fen, plorder, host] = [Z.game, Z.fen, Z.plorder, Z.host];
	Z.scoring = {};
	if (nundef(fen.original_players)) fen.original_players = fen.players;
	let playernames = [host].concat(get_keys(fen.original_players).filter(x => x != host));
	let playmodes = playernames.map(x => fen.original_players[x].playmode);
	let strategies = playernames.map(x => fen.original_players[x].strategy);
	let default_options = {}; for (const k in Config.games[game].options) default_options[k] = arrLast(Config.games[game].options[k].split(','));
	addKeys(default_options, Z.options);
	fen = Z.fen = Z.func.setup(playernames, Z.options);
	[Z.plorder, Z.stage, Z.turn, Z.round, Z.step, Z.phase] = [fen.plorder, fen.stage, fen.turn, 1, 1, fen.phase];
	if (DA.TESTSTART1) Z.turn = fen.turn = [Z.host];
	let i = 0; playernames.map(x => { let pl = fen.players[x]; pl.name = x; pl.strategy = strategies[i]; pl.playmode = playmodes[i++]; });
	take_turn_fen_clear();
}
function onclick_restart_move() { clear_transaction(); onclick_reload(); }
function onclick_skip() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	if (game == 'spotit') return;
	else if (game == 'bluff' && stage == 1 || game == 'ferro' && stage == 'auto_ack') { onclick_ack(); }
	else if (game == 'aristo') {
		Z.uplayer = Z.turn[0];
		Z.A = { level: 0, di: {}, ll: [], items: [], selected: [], tree: null, breadcrumbs: [], sib: [], command: null };
		copyKeys(jsCopy(Z.fen), Z);
		copyKeys(UI, Z);
		activate_ui(Z);
		Z.func.activate_ui();
		ai_move();
	} else {
		let plskip = Z.turn[0];
		Z.turn = [get_next_player(Z, plskip)];
		Z.uplayer = plskip;
		take_turn_fen();
	}
}
function onclick_skip_membership_selection() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		let plname = pld.name;
		let pl = fen.players[plname];
		pld.state = { item: rChoose(pl.hand) };
	}
	relegate_to_host(Z.playerdata);
}
function onclick_start_spotit() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	Z.stage = 'move';
	Z.turn = jsCopy(Z.plorder);
	take_turn_fen();
}
function onclick_table(tablename) {
	send_or_sim({ friendly: tablename, uname: U.name }, 'table');
}
function onclick_tables() { phpPost({ app: 'simple' }, 'tables'); }
function onclick_tithe_all() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		if (isdef(pl.tithes)) { continue; }
		pl.tithes = { val: rNumber(8, 10) };
	}
	proceed_to_newcards_selection();
}
function onclick_user(uname) {
	U = firstCond(Serverdata.users, x => x.name == uname);
	localStorage.setItem('uname', U.name);
	DA.secretuser = U.name;
	let elem = firstCond(arrChildren('dUsers'), x => x.getAttribute('username') == uname);
	let img = elem.children[0];
	mShrinkTranslate(img, .75, 'dAdminRight', 400, show_username);
	mFadeClear('dUsers', 300);
}
function onclick_view_buildings() {
	let [game, fen, uplayer, turn, stage] = [Z.game, Z.fen, Z.uplayer, Z.turn, Z.stage];
	let buildings = UI.players[uplayer].buildinglist;
	for (const b of buildings) b.items.map(x => face_up(x));
	TO.buildings = setTimeout(hide_buildings, 5000);
}
function onclick_vote_1() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pld = Z.playerdata.filter(x => !isDict(x.state));
	let pld1 = rChoose(pld);
	pld1.state = { item: rChoose(fen.players[pld1.name].hand) };
	relegate_to_host(Z.playerdata);
}
function onclick_vote_empty() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		pld.state = { item: '' };
	}
	relegate_to_host(Z.playerdata);
}
function onclick_vote_president() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pls = rChoose(Z.turn, 2);
	let pld0 = Z.playerdata.find(x => x.name == pls[0]);
	let pld1 = Z.playerdata.find(x => x.name == pls[1]);
	pld0.state = { item: get_random_ballot_card() };
	pld1.state = { item: get_random_ballot_card() };
	relegate_to_host(Z.playerdata);
}
function onclick_vote_random() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		let plname = pld.name;
		let pl = fen.players[plname];
		pld.state = { item: (coin() ? '' : rChoose(pl.hand)) };
	}
	relegate_to_host(Z.playerdata);
}
function onclick_vote_red() {
	let [game, A, fen, uplayer, plorder] = [Z.game, Z.A, Z.fen, Z.uplayer, Z.plorder];
	for (const pld of Z.playerdata) {
		if (isDict(pld.state)) continue;
		let plname = pld.name;
		let pl = fen.players[plname];
		let list = pl.hand.filter(x => get_color_of_card(x) == 'red');
		pld.state = { item: isEmpty(list) ? '' : rChoose(list) };
	}
	relegate_to_host(Z.playerdata);
}
function style_advanced_button() {
	let b = mBy('dAdvancedUI').children[0];
	if (DA.showTestButtons) { b.innerHTML = ' '; mStyle(b, { bg: GREEN, opacity: 1 }); } //fg: 'green' }) }
	else { b.innerHTML = ' '; mStyle(b, { bg: 'silver', opacity: .5 }); } //fg: 'black' }) }
}
function style_not_playing(item, game, list) {
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: 'transparent', fg: 'black' });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 0; item.playmode = 'none'; removeInPlace(list, item);
	item.isSelected = false;
}
function style_playing_as_bot(item, game, list) {
	let ui = iDiv(item); let uname = ui.getAttribute('username'); let bg = get_game_color(game);
	mStyle(ui, { bg: bg, fg: colorIdealText(bg) });
	arrLast(arrChildren(ui)).innerHTML = uname.substring(0, 3) + 'bot';
	item.ifunc = 2; item.playmode = 'bot';
	item.isSelected = true;
}
function style_playing_as_human(item, game, list) {
	let ui = iDiv(item); let uname = ui.getAttribute('username');
	mStyle(ui, { bg: get_user_color(uname), fg: colorIdealText(get_user_color(uname)) });
	arrLast(arrChildren(ui)).innerHTML = uname;
	item.ifunc = 1; item.playmode = 'human'; list.push(item);
	item.isSelected = true;
}
function test_start_aristo(n = 3, mode = 'multi') {
	let game = 'aristo';
	let playernames = arrTake(['mimi', 'felix', 'amanda', 'lauren', 'gul', 'nasi'], n);
	let playmodes = ['human', 'human', 'human', 'human', 'human', 'human'];
	let strategies = ['random', 'random', 'random', 'random', 'random', 'random', 'random'];
	let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	let options = { mode: mode, commission: 'no' };
	startgame(game, players, options);
}
function test_start_ferro(mode = 'multi') {
	let game = 'ferro';
	let playernames = ['mimi', 'lauren', 'felix'];
	let playmodes = ['human', 'human', 'human'];
	let strategies = ['random', 'random', 'random'];
	let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategies[i], playmode: playmodes[i++] }));
	let options = { mode: mode, thinking_time: 20 };
	startgame(game, players, options);
}
function toggle_select(item, funcs) {
	let params = [...arguments];
	let ifunc = (valf(item.ifunc, 0) + 1) % funcs.length; let f = funcs[ifunc]; f(item, ...params.slice(2));
}
//#endregion onclick

//#region select
function add_transaction(cmd) {
	if (!DA.simulate) start_transaction();
	DA.transactionlist.push(cmd);
}
function clear_selection() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (nundef(Z.A) || isEmpty(A.selected)) return;
	let selitems = A.selected.map(x => A.items[x]);
	for (const item of selitems) { ari_make_unselected(item); }
	A.selected = [];
}
function clear_transaction() { DA.simulate = false; DA.transactionlist = []; }
function continue_after_error() {
	dError.innerHTML = ''; if (isdef(DA.callback)) { DA.callback(); delete (DA.callback); }
}
function remove_from_selection(card) {
	if (nundef(Z.A)) return;
	let A = Z.A;
	let item = firstCond(A.items, x => x.id == card.id);
	if (isdef(item)) {
		let idx = item.index;
		A.items.splice(item.index, 1);
		removeInPlace(A.selected, item.index);
		make_card_unselectable(item);
		make_card_unselected(item);
		reindex_items(A.items);
	}
}
function select_confirm_weiter(callback) {
	select_add_items(ui_get_string_items(['weiter']), callback, 'may click to continue', 1, 1, Z.mode == 'multi');
}
function select_error(msg, callback = null, stay = false) {
	let [A] = [Z.A];
	DA.callback = callback;
	if (A.maxselected == 1 && A.selected.length > 0) {
		let item = A.items[A.selected[0]];
		ari_make_unselected(item);
		A.selected = [];
	} else if (A.selected.length == 2) {
		let item = A.items[A.selected[1]];
		ari_make_unselected(item);
		A.selected = [A.selected[0]];
	}
	dError.innerHTML = msg;
	if (stay) {
		dError.innerHTML += '<br><button onclick="continue_after_error()">CLICK TO CONTINUE</button>';
	} else {
		TO.error = setTimeout(continue_after_error, 3000);
	}
}
function select_highlight() {
	let A = Z.A; for (const i of A.selected) {
		let a = A.items[i];
		showItemAsSelected(a, true);
	}
}
function select_last(item, callback, ev) {
	if (isdef(ev)) evNoBubble(ev);
	Z.A.last_selected = item; callback(item, ev);
}
function select_timer(ms, callback) {
	let d = mBy('dSelections0');
	let dtimer = mDiv(d, { w: 80, maleft: 10, fg: 'red', weight: 'bold' }, 'dTimer');
	if (isdef(DA.timer)) { DA.timer.clear(); DA.timer = null; }
	let timer = DA.timer = new SimpleTimer(dtimer, 1000, null, ms, callback);
	timer.start();
	return dtimer;
}
function select_toggle() { //item,ev) {
	if (!uiActivated) { console.log('ui is deactivated!!!'); return; }
	let A = Z.A;
	let item = A.last_selected;
	if (A.selected.includes(item.index)) {
		removeInPlace(A.selected, item.index);
		ari_make_unselected(item);
	} else {
		if (A.maxselected == 1 && !isEmpty(A.selected)) { ari_make_unselected(A.items[A.selected[0]]); A.selected = []; }
		A.selected.push(item.index);
		showItemAsSelected(item);
		if (!DA.ai_is_moving && A.selected.length >= A.maxselected && A.autosubmit) {
			setTimeout(() => A.callback(), 100);
		}
	}
}
function start_transaction() {
	if (DA.simulate) return;
	DA.simulate = true;
	DA.snapshot = { fen: jsCopy(Z.fen), stage: Z.stage, round: Z.round, phase: Z.phase, turn: Z.turn }; //brauch ich eigentlich nicht
	DA.transactionlist = [];
}
function stop_timer() {
	if (isdef(DA.timer)) {
		let res = DA.timer.clear();
		DA.timer = null;
		return isNumber(res) ? res : 0;
	}
	return 0;
}
//#endregion select

//#region test
function add_a_correct_building_to(fen, uname, type) {
	let ranks = lookupSet(DA, ['test', 'extra', 'ranks'], 'A23456789TJQK');
	if (ranks.length <= 0) {
		console.log('===>ranks empty!', ranks)
		ranks = lookupSetOverride(DA, ['test', 'extra', 'ranks'], 'A23456789TJQK');
	}
	let r = ranks[0]; lookupSetOverride(DA, ['test', 'extra', 'ranks'], ranks.substring(1));
	let keys = [`${r}Sn`, `${r}Hn`, `${r}Cn`, `${r}Dn`];
	if (type != 'farm') keys.push(`${r}Cn`); if (type == 'chateau') keys.push(`${r}Hn`);
	fen.players[uname].buildings[type].push({ list: keys, h: null });
}
function add_a_schwein(fen, uname) {
	let type = rChoose(['farm', 'estate', 'chateau']);
	let keys = deck_deal(fen.deck, type[0] == 'f' ? 4 : type[0] == 'e' ? 5 : 6);
	fen.players[uname].buildings[type].push({ list: keys, h: null });
}
function ensure_actions(fen) { fen.actionsCompleted = []; }
function ensure_market(fen, n) { fen.stallSelected = []; deck_add(fen.deck, n - fen.market.length, fen.market); }
function ensure_stall(fen, uplayer, n) { let pl = fen.players[uplayer]; deck_add(fen.deck, n - pl.stall.length, pl.stall); }
function ensure_stallSelected(fen) { if (nundef(fen.stallSelected)) fen.stallSelected = []; }
function fentest0_min_items() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	[pl.hand, pl.stall, Z.stage, Z.phase] = [['JSn', '2Hn', '3Hn', '3Dn', '3Cn', '4Hn'], ['QSn', 'KHn'], 5, 'king'];
	ensure_actions(fen);
	take_turn_fen();
}
function fentest1_auction() {
	Z.stage = 12;
	Z.phase = 'jack';
	ensure_market(Z.fen, 3);
	take_turn_fen();
}
function fentest2_build() {
	Z.stage = 5;
	Z.phase = 'king';
	ensure_stall(Z.fen, Z.uplayer, 4);
	ensure_actions(Z.fen);
	take_turn_fen();
}
function fentest4_visit() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	fen.actionsCompleted = [];
	for (const plname of fen.plorder) {
		add_a_schwein(fen, plname);
	}
	Z.stage = 5;
	Z.phase = 'queen';
	take_turn_fen();
}
function fentest5_market_opens() {
	Z.stage = 3;
	Z.phase = 'king';
	take_turn_fen();
}
function fentest6_endgame() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	fen.actionsCompleted = [];
	for (const plname of fen.plorder) {
		add_a_correct_building_to(fen, plname, 'chateau');
		add_a_correct_building_to(fen, plname, rChoose(['farm', 'estate', 'chateau']));
		if (coin()) add_a_correct_building_to(fen, plname, rChoose(['farm', 'estate', 'chateau']));
		fen.actionsCompleted.push(plname);
	}
	fen.pl_gameover = [];
	for (const plname of fen.plorder) {
		let bcorrect = ari_get_correct_buildings(fen.players[plname].buildings);
		let can_end = ari_check_end_condition(bcorrect);
		if (can_end) fen.pl_gameover.push(plname);
	}
	if (isEmpty(fen.pl_gameover)) { console.log('try again!!!!!!!!!!!'); return; }
	Z.stage = 10;
	Z.phase = 'king';
	take_turn_fen(true);
}
function fentest6_start11() { start_game_with_players(11, 'accuse', { stability: 2, rounds: 2, cardtype: 'num', colors: 3 }); }
function fentest6_start14() { start_game_with_players(14); }
function fentest6_start4() { start_game_with_players(4, 'accuse', { stability: 1, cardtype: 'c52', rounds: 1 }); }
function fentest6_start5() { start_game_with_players(5, 'accuse', { stability: 2, cardtype: 'num' }); }
function fentest6_start6() { start_game_with_players(6, 'accuse', { stability: 2, cardtype: 'c52' }); }
function fentest6_start8() { start_game_with_players(8, 'accuse', { stability: 2, cardtype: 'c52' }); }
function fentest7_cards() {
	mClear('dTable');
	dTable = mBy('dTable'); mStyle(dTable, { gap: 10 }); mCenterFlex(dTable);
	for (let i = 0; i < 10; i++) {
		show_number_card(`${rNumber(1, 999)}_${rColor()}`, 100);
	}
}
function fentest7_gameover() {
	let [game, A, fen, uplayer] = [Z.game, Z.A, Z.fen, Z.uplayer];
	if (game == 'aristo') fentest6_endgame();
	else if (game == 'spotit') {
		for (const plname in fen.players) { fen.players[plname].score = Z.options.winning_score - 1; }
		take_turn_fen();
	} else if (game == 'bluff') {
		let pl = fen.players[uplayer];
		while (pl.handsize < Z.options.max_handsize) inc_handsize(fen, uplayer); //.handsize = Z.options.max_handsize; }
		deck_add(fen.deck, 1, pl.hand);
		take_turn_fen();
	}
}
function getfen1() {
	let res = {
		"players": {
			"guest": {
				"score": 0,
				"name": "guest",
				"idleft": "JSh",
				"color": "#1e90ff",
				"idright": "JHh",
				"hand": [
					"5Dn",
					"7Sn",
					"5Cn",
					"9Sn",
					"4Dn",
					"7Cn"
				],
				"playmode": "bot",
				"strategy": "random",
				"membership": "8Sn"
			},
			"lauren": {
				"score": 0,
				"name": "lauren",
				"idleft": "JHh",
				"color": "#004054",
				"idright": "KHh",
				"hand": [
					"2Cn",
					"4Sn",
					"6Hn",
					"8Hn",
					"2Sn",
					"9Cn"
				],
				"playmode": "bot",
				"strategy": "random",
				"membership": "3Dn"
			},
			"gul": {
				"score": 0,
				"name": "gul",
				"idleft": "KHh",
				"color": "#6fccc3",
				"idright": "KSh",
				"hand": [
					"TDn",
					"7Dn",
					"8Cn",
					"7Hn",
					"TCn",
					"5Hn"
				],
				"playmode": "bot",
				"strategy": "random",
				"membership": "4Hn"
			},
			"felix": {
				"score": 0,
				"name": "felix",
				"idleft": "KSh",
				"color": "#4363d8",
				"idright": "QHh",
				"hand": [
					"TSn",
					"2Hn",
					"4Cn",
					"5Sn",
					"2Dn"
				],
				"playmode": "human",
				"strategy": "random",
				"membership": "8Dn"
			},
			"mimi": {
				"score": 0,
				"name": "mimi",
				"idleft": "QHh",
				"color": "#76AEEBFF",
				"idright": "JSh",
				"hand": [
					"3Cn",
					"9Hn",
					"3Hn",
					"9Dn",
					"3Sn",
					"THn"
				],
				"playmode": "human",
				"strategy": "random",
				"membership": "6Dn"
			}
		},
		"plorder": [
			"guest",
			"lauren",
			"gul",
			"felix",
			"mimi"
		],
		"history": [
			{
				"title": "*** game start ***",
				"lines": []
			},
			{
				"title": "membership",
				"lines": [
					"mimi 6Dn",
					"felix 8Dn",
					"guest 8Sn",
					"gul 4Hn",
					"lauren 3Dn"
				]
			},
			{
				"title": "poll",
				"lines": [
					"mimi 3Hn",
					"felix 6Sn"
				]
			},
			{
				"title": "president",
				"lines": [
					"felix wins presidency!"
				]
			}
		],
		"rounds": 1,
		"stability": 2,
		"deck_identities": [
			"QSh"
		],
		"phase": "1",
		"stage": "president",
		"step": 0,
		"turn": [
			"felix"
		],
		"deck_discard": [
			"6Sn"
		],
		"deck_ballots": [
			"6Cn"
		],
		"handsize": 7,
		"policies": [],
		"validvoters": [
			"felix",
			"mimi"
		],
		"round": 1,
		"cardsrevealed": true,
		"president": "felix",
		"isprovisional": false
	}
	return res;
}
function landing() { if (isdef(DA.landing)) DA.landing(); } //onclick_by_rank(); } //show_strategy_popup(); } //onclick_random(); }//show_history_popup(); }
function test7_add_hand_card() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let card = prompt('enter card (eg. 8H');
	fen.players[uplayer].hand.push(card + 'n');
	take_turn_fen();
}
//#endregion test

//#region accuse
function accuse() {
	function state_info(dParent) {
		let histinfo = !isEmpty(Z.fen.generations) ? '(' + Z.fen.generations.map(x => x.color == 'white' ? '_' : x.color).join(', ') + ')' : '';
		dParent.innerHTML = Z.phase > Z.options.rounds ? `game over ${histinfo}!` : `generation ${Z.fen.phase}/${Z.options.rounds} ${histinfo}`; //`phase: ${Z.phase}, turn: ${Z.turn}, stage:${Z.stage}`; 
		return false;
	}
	function setup(players, options) {
		let fen = {
			players: {}, plorder: jsCopy(players),
			history: [{ title: '*** game start ***', lines: [] }],
			rounds: options.rounds, stability: options.stability, cardtype: options.cardtype,
			handsize: Number(options.handsize) + (players.length > 9 ? 0 : 1),
			colors: arrTake(get_nc_color_array(), Number(options.colors)),
		};
		shuffle(fen.plorder);
		let plorder = fen.plorder;
		let num = Math.max(7, Math.ceil(players.length / 2));
		let deck_identities = fen.deck_identities = [];
		for (let i = 0; i < num; i++) {
			for (const c of fen.colors) {
				deck_identities.push(c);
			}
		}
		shuffle(deck_identities);
		for (const plname of plorder) {
			let pl = fen.players[plname] = {
				score: 0,
				experience: 0,
				name: plname,
				idleft: deck_deal(deck_identities, 1)[0],
				color: get_user_color(plname),
			};
		}
		for (let i = 0; i < plorder.length; i++) {
			let j = (i + 1) % plorder.length;
			fen.players[plorder[i]].idright = fen.players[plorder[j]].idleft;
		}
		[fen.phase, fen.stage, fen.step, fen.turn] = ['1', 'membership', 0, jsCopy(fen.plorder)];
		start_new_generation(fen, fen.plorder, options);
		return fen;
	}
	function check_gameover() {
		if (Z.phase <= Z.fen.rounds) return false;
		let [fen, num] = [Z.fen, Z.fen.rounds];
		for (const plname in fen.players) {
			let pl = fen.players[plname];
			let cleft = get_color_of_card(pl.idleft);
			let cright = get_color_of_card(pl.idright);
			for (const sess of fen.generations) {
				if (sess.color == cleft) pl.score += 1;
				if (sess.color == cright) pl.score += 1;
			}
		}
		let playerlist = dict2list(fen.players, 'name');
		let sorted = sortByDescending(playerlist, 'score');
		let max_score = sorted[0].score;
		let all_winners = sorted.filter(x => x.score == max_score);
		let sorted2 = sortByDescending(all_winners, 'experience');
		let max_experience = sorted2[0].experience;
		let all_experience = sorted2.filter(x => x.experience == max_experience);
		fen.winners = all_experience.map(x => x.name);
		return fen.winners;
	}
	return { state_info, setup, present: accuse_present, check_gameover, activate_ui: accuse_activate };
}
function accuse_activate() {
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let donelist = Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.item));
	let complete = ['hand', 'membership', 'tied_consensus'].includes(stage) && donelist.length >= turn.length || stage == 'round' && firstCond(pldata, x => isDict(x.state));
	if (complete && !sameList(turn, [Z.host])) {
		relegate_to_host(donelist);
		return;
	}
	let waiting = isdef(donelist.find(x => x.name == uplayer)) && turn.length > 1;
	assertion(!complete || sameList(turn, [Z.host]), 'complete hat nicht zu host uebergeben!!!!!!!!!!')
	assertion(!complete || !waiting, 'ERROR WAITING WHEN COMPLETE!!!')
	Z.isWaiting = waiting; //das ist nur fuer page tab title animated vs static
	assertion(turn.length == 1 || ['membership', 'hand', 'round'].includes(stage), "FALSCHE ASSUMPTION!!!!!!!!!!!!!");
	if (turn.length == 1) check_experience_states();
	if (waiting) {
		accuse_show_selected_state(donelist.find(x => x.name == uplayer).state);
		if (Z.mode != 'multi') { take_turn_waiting(); return; }
		autopoll();
	} else if (stage == 'handresolve') {
		assertion(uplayer == Z.host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		DA.gobutton = mButton('evaluate cards', accuse_evaluate_votes, dTable, {}, ['donebutton', 'enabled']);
	} else if (stage == 'membershipresolve') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let histest = [];
		for (const pldata of fen.pldata) { //Z.playerdata) {
			let plname = pldata.name;
			let card = pldata.state.item;
			assertion(!isEmpty(card), "INVALID MEMBERSHIP SELECTION!!!!!!!!!!!!", uplayer)
			let pl = fen.players[plname];
			pl.membership = card;
			removeInPlace(pl.hand, card);
			histest.push(`${plname} ${DA.showTestButtons ? card : ''}`); //TODO:KEEP secret!!!!!!!!!!!!!!!!!!!!!!
		}
		ari_history_list(histest, 'membership');
		start_new_poll();
	} else if (stage == 'roundresolve') {
		assertion(uplayer == Z.host, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		Z.turn = jsCopy(Z.plorder);
		Z.phase = Number(Z.phase) + 1;
		stage = Z.stage = Z.phase > fen.rounds ? 'gameover' : 'membership';
		if (stage == 'membership') {
			for (const pl in fen.players) { delete fen.players[pl].membership; }
			start_new_generation(fen, Z.plorder, Z.options);
		}
		take_turn_fen_clear();
	} else if (stage == 'president') {
		let parley_action_available = get_others_with_at_least_one_hand_card().length >= 1;
		addIf(fen.presidents_poll, fen.president);
		if (parley_action_available) {
			select_add_items(ui_get_string_items(['parley']), president_parley, 'may parley cards', 0, 1);
		} else {
			Z.stage = 'president_2';
			accuse_activate();
		}
	} else if (stage == 'president_2') {
		let accuse_action_available = !fen.isprovisional || fen.players[uplayer].hand.length >= 1;
		let actions = ['defect', 'resign'];
		if (accuse_action_available) actions.unshift('accuse');
		select_add_items(ui_get_string_items(actions), president_action, 'must select action to play', 1, 1);
	} else if (stage == 'pay_for_accuse') {
		select_add_items(ui_get_hand_items(uplayer), pay_for_accuse_action, 'must pay a card for accuse action', 1, 1);
	} else if (stage == 'accuse_action_select_player') {
		let plnames = get_keys(fen.players);
		let validplayers = plnames.filter(x => fen.players[x].hand.length >= 1 && x != uplayer && !fen.presidents_poll.includes(x));
		select_add_items(ui_get_player_items(validplayers), accuse_submit_accused, 'must select player name', 1, 1);
	} else if (stage == 'accuse_action_select_color') {
		select_add_items(ui_get_string_items(fen.colors), accuse_submit_accused_color, 'must select color', 1, 1);
	} else if (stage == 'accuse_action_entlarvt') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_provisional') {
		select_add_items(ui_get_hand_items(uplayer), accuse_replaced_membership, 'must select new alliance', 1, 1);
	} else if (stage == 'accuse_action_policy') {
		select_add_items(ui_get_hand_items(uplayer), accuse_enact_policy, 'may enact a policy', 0, 1);
	} else if (stage == 'accuse_action_new_president') {
		set_new_president();
	} else if (stage == 'parley_select_player') {
		let players = get_others_with_at_least_one_hand_card();
		select_add_items(ui_get_player_items(players), parley_player_selected, 'must select player to exchange cards with', 1, 1);
	} else if (stage == 'parley_select_cards') {
		select_add_items(ui_get_hand_items(uplayer), parley_cards_selected, 'may select cards to exchange', 0, fen.maxcards);
	} else if (stage == 'parley_opponent_selects') {
		let n = fen.player_cards.length;
		select_add_items(ui_get_hand_items(uplayer), parley_opponent_selected, `must select ${n} cards`, n, n);
	} else if (stage == 'defect_membership') {
		select_add_items(ui_get_hand_items(uplayer), defect_resolve, 'may replace your alliance', 0, 1);
	} else if (stage == 'membership') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_membership, 'must select your alliance', 1, 1);
	} else if (stage == 'hand') {
		select_add_items(ui_get_hand_items(uplayer), accuse_submit_card, 'may select card to play', 0, 1);
	} else if (stage == 'round') {
		show_special_message(`generation end! ${fen.generations[fen.phase - 1].color} wins`, false, 3000, 0, { top: 67 })
		if (is_ai_player(uplayer)) accuse_onclick_weiter();
		else {
			mLinebreak(dTable, 12)
			mButton('WEITER', accuse_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
		}
	} else {
		alert(`PROBLEM!!! unknown stage ${stage}`)
	}
}
function accuse_discard(card) { Z.fen.deck_discard.push(card) }
function accuse_enact_policy() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let card = isEmpty(A.selected) ? '' : A.items[A.selected[0]].a;
	if (!isEmpty(card)) {
		lookupAddToList(fen, ['policies'], get_color_of_card(card));
		removeInPlace(fen.players[uplayer].hand, card);
		ari_history_list(`${uplayer} enacts a ${get_color_of_card(card)} policy`, 'policy')
		let policies_needed = fen.stability - fen.crisis;
		let arr = arrTakeLast(fen.policies, policies_needed);
		let color = arrAllSame(arr, get_color_of_card);
		if (color && arr.length >= policies_needed) {
			fen.dominance = true;
			ari_history_list(`${color} dominance reached!`, 'generation ends')
			accuse_score_update(color);
			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();
		} else {
			president_end();
		}
	} else {
		president_end();
	}
}
function accuse_evaluate_votes() {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	assertion(uplayer == host && fen.cardsrevealed, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
	let votes = [];
	for (const pldata of fen.pldata) { //Z.playerdata) {
		let plname = pldata.name;
		let card = pldata.state.item;
		if (!isEmpty(card)) votes.push({ plname: plname, card: card });
		else removeInPlace(fen.validvoters, plname);
	}
	ari_history_list(votes.map(x => `${x.plname} ${x.card}`), 'votes');
	if (isEmpty(votes)) { eval_empty_votes(votes); return; }
	let color = arrSame(votes, x => get_color_of_card(x.card));
	if (color) { eval_consensus(votes, color); return; }
	let max_votes = get_max_votes(votes);
	if (max_votes.length == 1) { eval_president(max_votes[0]); }
	else { eval_tie(max_votes, votes); }
}
function accuse_onclick_weiter() {
	Z.state = { item: Z.uplayer };
	take_turn_multi();
}
function accuse_player_stat(dParent, plname, hvotecard, himg, hstatfz, gap) {
	let players = Z.fen.players;
	let pl = players[plname];
	let onturn = Z.turn.includes(plname);
	let sz = himg; //onturn?100:50;
	let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
	let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
	let rounding = pl.playmode == 'bot' ? '0px' : '50%';
	let d = mDiv(dParent, { align: 'center' });
	let card = mDiv(d, { hmin: hvotecard + gap, bg: 'transparent', mabottom: gap, paright: 4 }); mCenterFlex(card);
	let wstats = sz * 1.3;
	let dcombine = mDiv(d, { w: wstats, margin: 'auto' }); //,{padding:6});
	let dimg = mDiv(dcombine, { padding: 0 }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};border:${border};box-sizing:border-box" width=${sz} height=${sz}>`); mCenterFlex(dimg);
	let stats = mDiv(dcombine, { align: 'center', w: wstats, bg: 'silver', rounding: 10 }); mCenterFlex(stats);
	let x = lookupSetOverride(UI, ['stats', plname], { douter: d, dcombi: dcombine, dstats: stats, dimg: dimg, dcard: card });
	let numcols = 3;
	accuse_player_stat_count('star', pl.score, stats, { sz: hstatfz }, numcols);
	accuse_player_stat_count('hand with fingers splayed', pl.hand.length, stats, { sz: hstatfz }, numcols);
	accuse_player_stat_count('eye', pl.experience, stats, { sz: hstatfz }, numcols);
	return x;
}
function accuse_player_stat_count(key, n, dParent, styles = {}, numcols) {
	let sz = valf(styles.sz, 8);
	let d = mDiv(dParent, { w: `${100 / numcols}%`, align: 'center' });
	let dsym;
	if (isdef(Syms[key])) dsym = mSym(key, d, { h: sz, 'line-height': sz, w: '100%' });
	else dsym = mText(key, d, { h: sz, fz: sz, w: '100%' });
	let dn = mDiv(d, { fz: 2 * sz, weight: 'bold' }, null, n);
	return d;
}
function accuse_present(dParent) {
	mStyle(mBy('dTitle'), { display: 'grid', 'grid-template-columns': 'auto 1fr auto', h: 32 });
	DA.no_shield = true;
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	if (firsttime) { fen = Z.fen = getfen1(); firsttime = false; }
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt); mStyle(dt, { hmin: 700 })
	historyShow(fen, dRechts);
	if (isdef(fen.msg)) { show_message(fen.msg, true); }
	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 25, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 25];
	let [d1, d2, d3, d4, d5] = [mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt), mDiv(dt)];
	let [color, n] = get_policies_to_win();
	UI.policies = ui_type_accuse_policies(fen.policies, d1, { h: hpol }, '', 'policies', accuse_get_card_func(hsm, GREEN), false);
	mStyle(d1, { h: isEmpty(fen.policies) ? 40 : hpol, w: '90%', display: 'flex', gap: 12 })
	let msg = color == 'any' ? `${n} policies are needed to win!` : n <= 0 ? `${capitalize(color)} wins generation ${fen.generations.length}!` : `${capitalize(color)} needs ${n} more policies`
	let x = mDiv(d1, { h: isEmpty(fen.policies) ? 40 : hpolcard }, null, msg); mCenterCenterFlex(x)
	let [wgap, hgap] = [20, 12];
	let players = fen.players;
	let wneeded = (himg + wgap) * fen.plorder.length + wgap;
	let wouter = '95%';
	let order = get_present_order();
	let me = order[0];
	if (Z.phase > Z.options.rounds) show_playerstats_over(d2); else show_playerstats_orig(d2);
	mStyle(d3, { hmin: hstat, w: wouter }); mCenterFlex(d3);
	let dnet = mDiv(d3, { w: wneeded });
	let wrest = wneeded - 2 * himg;
	dnet.style.gridTemplateColumns = `64px 1fr 64px`;
	dnet.style.display = 'inline-grid';
	dnet.style.padding = `${hgap}px ${wgap}px`;
	let pl = fen.players[me];
	let par = (64 - hnetcard * .7) / 2;
	let d_idright = mDiv(dnet, { w: 64, padding: par });
	let idright = get_color_card(pl.idright, hnetcard); mAppend(d_idright, iDiv(idright))
	let dme_stats = mDiv(dnet, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	let dx = accuse_player_stat(dme_stats, me, hvotecard, himg, hstatfz, gap);
	let d_idleft = mDiv(dnet, { w: 64, padding: par });
	let idleft = get_color_card(pl.idleft, hnetcard); mAppend(d_idleft, iDiv(idleft))
	mStyle(d4, { margin: 10, h: hhand, w: '90%' }); mCenterFlex(d4);
	let handui = ui_type_accuse_hand(pl.hand, d4, { h: hhand }, `players.${uplayer}.hand`, 'hand', accuse_get_card_func(hhandcard));
	lookupSetOverride(ui, ['players', uplayer, 'hand'], handui);
	presentcards(hvotecard);
	let plnames = stage == 'round' || stage == 'gameover' ? order : [me];
	plnames.map(x => show_membership_color(x, hnetcard, himg));
}
function accuse_replaced_membership() {
	let [stage, A, uplayer, fen, accused] = [Z.stage, Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	assertion(accused == uplayer, "accuse_replace_membership: WRONG PLAYER!!!!")
	let card = A.items[A.selected[0]].a;
	let pl = fen.players[uplayer];
	accuse_discard(pl.membership)
	pl.membership = card;
	removeInPlace(pl.hand, card);
	ari_history_list(`${accused} chooses new membership` + (DA.showTestButtons ? ` ${card}` : ''), 'accuse');
	delete fen.msg;
	if (stage == 'accuse_action_entlarvt') {
		Z.turn = [fen.president];
		Z.stage = 'accuse_action_policy';
		take_turn_fen_clear(); //!!!!clear added!!!!
	} else {
		fen.newpresident = accused;
		set_new_president();
	}
}
function accuse_score_update(color) {
	let [fen] = [Z.fen];
	let generation_entry = { color: color };
	let plgeneration = generation_entry.players = {};
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		plgeneration[plname] = get_color_of_card(pl.membership); // { left: get_color_of_card(pl.idleft), middle: get_color_of_card(pl.membership), right: get_color_of_card(pl.idright) };
		if (get_color_of_card(pl.membership) == color) pl.score += 1;
	}
	lookupAddToList(fen, ['generations'], generation_entry);
}
function accuse_show_selected_state(state) {
	let [fen, uplayer, stage] = [Z.fen, Z.uplayer, Z.stage];
	let mystate = state.item;
	if (!isEmpty(mystate)) {
		let handui = lookup(UI, ['players', uplayer, 'hand']);
		let items = handui.items;
		let cardui = items.find(x => x.key == mystate)
		if (stage == 'hand' && isdef(cardui)) make_card_selected(cardui);
		else if (stage == 'membership' && isdef(cardui)) make_card_selected(cardui);
		else mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
	}
}
function accuse_submit_accused() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let plname = A.items[A.selected[0]].a;
	fen.accused = plname;
	Z.stage = 'accuse_action_select_color';
	ari_history_list(`${uplayer} accuses ${plname}`, 'accuse')
	accuse_activate();
}
function accuse_submit_accused_color() {
	let [A, uplayer, fen, accused] = [Z.A, Z.uplayer, Z.fen, Z.fen.accused];
	let color = A.items[A.selected[0]].a;
	let card = fen.players[accused].membership;
	let real_color = get_color_of_card(card);
	ari_history_list(`${uplayer} guesses ${color == real_color ? 'CORRECT' : 'WRONG'} (${color})`, 'accuse')
	console.log(`PRESIDENT GUESSES ${color == real_color ? 'CORRECT' : 'WRONG!!!'}!!!`);
	fen.msg = `PRESIDENT GUESSES ${color == real_color ? 'CORRECT' : 'WRONG!!!'}!!!`;
	if (color == real_color) {
		Z.turn = [accused];
		fen.players[uplayer].hand.push(card);
		fen.wrong_guesses = 0;
		delete fen.players[accused].membership;
		Z.stage = 'accuse_action_entlarvt';
		take_turn_fen_clear(); //!!!!clear added!!!!
	} else {
		Z.turn = [accused];
		fen.players[accused].hand.push(card);
		fen.wrong_guesses += 1;
		delete fen.players[accused].membership;
		Z.stage = 'accuse_action_provisional';
		take_turn_fen_clear(); //!!!!clear added!!!!
	}
}
function accuse_submit_card() {
	let A = Z.A;
	let card = isEmpty(A.selected) ? '' : A.items[A.selected[0]].a;
	Z.state = { item: card };
	take_turn_multi();
}
function accuse_submit_membership() {
	let A = Z.A;
	let card = A.items[A.selected[0]].a;
	Z.state = { item: card };
	take_turn_multi();
}
function add_advanced_ui(dParent) {
	mDiv(dParent, {}, 'dAdvancedUI');
	show_advanced_ui_buttons();
}
function arrAllSame(arr, func) {
	if (isEmpty(arr)) return false;
	let arr1 = arr.map(x => func(x));
	let sample = arr1[0];
	for (let i = 1; i < arr1.length; i++) if (arr1[i] != sample) return false;
	return sample;
}
function arrSame(arr, func) {
	if (isEmpty(arr)) return true;
	let x = func(arr[0]);
	for (let i = 1; i < arr.length; i++) {
		if (func(arr[i]) != x) return false;
	}
	return x;
}
function calcNumRanks(total, repeat, ncolors) {
	let d = Math.ceil(total / (repeat * ncolors));
	return range(1, d + 1);
}
function check_enough_policies_or_start_new_poll(msg_new_poll) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let policies_needed = fen.stability - fen.crisis;
	let arr = arrTakeLast(fen.policies, policies_needed);
	let color = arrAllSame(arr, get_color_of_card);
	if (color && arr.length >= policies_needed) {
		fen.dominance = true;
		ari_history_list(`${color} dominance reached!`, 'generation ends')
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
		return true;
	} else {
		ari_history_list(msg_new_poll, 'new poll')
		start_new_poll();
		return false;
	}
}
function check_experience_states() {
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let donelist = Z.playerdata.filter(x => isDict(x.state1));
	for (const x of donelist) {
		let plfrom = x.name;
		let plto = x.state1.plname;
		let num = Number(x.state1.num);
		fen.players[plfrom].experience -= num;
		fen.players[plto].experience += num;
		ari_history_list(`${plfrom} bribes ${plto}: ${num} points!`, 'corruption!')
		x.state1 = null; //reset fuer den fall dass multiple times in accuse_activate gehe!!!!
	}
}
function defect_resolve() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let card = A.items[A.selected[0]].a;
	let pl = fen.players[uplayer];
	let mem = pl.membership;
	pl.membership = card;
	removeInPlace(pl.hand, card);
	let def = Z.options.defected;
	console.log('defected', def);
	if (def == 'remove') accuse_discard(mem);
	else if (def == 'exchange') pl.hand.push(mem);
	else if (def == 'draw') pl.hand.push(fen.deck_discard.shift())
	ari_history_list(`${uplayer} replaces membership`, 'defect')
	president_end();
}
function eval_consensus(votes, color) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let vsorted = sortCardObjectsByRankDesc(votes, fen.ranks, 'card');
	let opt = valf(Z.options.consensus, 'policy');
	if (opt == 'policy') {
		fen.policies.push(color); //get_color_card(color)); //color == 'red' ? 'QDn' : 'QSn'); //last_policy);
		fen.validvoters = jsCopy(Z.plorder);
		check_enough_policies_or_start_new_poll(`consensus on ${color}`);
	} else if (opt == "coupdetat") {
		let ace_present = vsorted.find(x => is_ace(x.card));
		if (isdef(ace_present)) {
			ari_history_list(`coup succeeded! ${color} wins!`, 'generation ends');
			accuse_score_update(color);
			Z.turn = jsCopy(Z.plorder);
			Z.stage = 'round';
			take_turn_fen_clear();
		} else { //just add a policy
			fen.policies.push(color); //get_color_card(color)); //color == 'red' ? 'QDn' : 'QSn'); 
			fen.validvoters = jsCopy(Z.plorder);
			check_enough_policies_or_start_new_poll(`consensus on ${color}`);
		}
	} else if (opt == 'generation') {
		ari_history_list(`consensus on ${color}!`, 'generation ends');
		accuse_score_update(color);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (opt == 'playerpolicy') { // opt == 'policy'
		let tie = vsorted.length > 1 && getRankOf(vsorted[0].card) == getRankOf(vsorted[1].card);
		if (tie) {
			let maxrank = getRankOf(vsorted[0].card);
			let tied_votes = arrTakeWhile(vsorted, x => getRankOf(x.card) == maxrank);
			let tied_players = tied_votes.map(x => x.plname);
			console.log('tied', tied_votes, tied_players);
			Z.turn = tied_players;
			Z.stage = 'tied_consensus';
			fen.tied_votes = tied_votes;
			take_turn_fen_clear();
		} else {
			let winner = vsorted[0];
			fen.policies.push(winner.card);
			removeInPlace(fen.players[winner.plname].hand, winner.card);
			fen.validvoters = jsCopy(Z.plorder);
			check_enough_policies_or_start_new_poll(`consensus on ${color}`);
		}
	}
}
function eval_empty_votes(votes) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let last_policy = arrLast(fen.policies);
	if (last_policy) {
		fen.policies.push(last_policy);
	}
	fen.validvoters = jsCopy(Z.plorder);
	check_enough_policies_or_start_new_poll(`no one voted: policy repeat`);
}
function eval_president(winning_vote) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let plwinner = winning_vote.plname;
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		if (isdef(pl.pending) && !isEmpty(pl.pending)) pl.pending.map(x => pl.hand.push(x));
		delete pl.pending;
	}
	removeInPlace(fen.players[plwinner].hand, winning_vote.card);
	fen.deck_discard.push(winning_vote.card);
	fen.president = plwinner;
	fen.players[plwinner].experience += 1;
	fen.isprovisional = false;
	ari_history_list(`${plwinner} wins presidency!`, 'president');
	Z.turn = [plwinner];
	Z.stage = 'president';
	take_turn_fen_clear();
}
function eval_tie(max_votes, votes) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	ari_history_list('tie! new poll round', 'poll');
	for (const v of votes) {
		let plname = v.plname;
		let pl = fen.players[plname];
		lookupAddToList(pl, ['pending'], v.card)
		removeInPlace(pl.hand, v.card);
	}
	start_new_poll();
}
function get_advanced_menu_buttons() {
	let html = `<a href="javascript:onclick_advanced_test()">T</a>`;
	let btest = mCreateFrom(html);
	let mode = 'multi';
	html = `<a href="javascript:onclick_advanced_mode()">${mode[0].toUpperCase()}</a>`;
	let bmode = mCreateFrom(html);
	let d = mCreate('div');
	mAppend(d, btest);
	mAppend(d, bmode);
	let styles = { bg: 'silver', wmin: 25, h: 25, rounding: '50%', maright: 10, align: 'center' };
	mStyle(btest, styles);
	mStyle(bmode, styles);
	mClass(btest, 'hop1')
	mClass(bmode, 'hop1')
	return d;
}
function get_color_card(ckey, h, opts = {}) {
	let color;
	if (nundef(ckey)) color = 'transparent'; else color = is_color(ckey) ? ckey : get_color_of_card(ckey);
	let type = 'color';
	let info = { friendly: color, color: valf(opts.bg, BLUE) }
	info.ckey = color;
	let el = mDiv(null, { bg: color == 'black' ? '#222' : color, rounding: h / 10, border: 'silver' });
	h = valf(h, valf(info.h, 100));
	w = valf(opts.w, h * .7);
	mSize(el, w, h);
	let card = {};
	copyKeys(info, card);
	copyKeys({ sz: h, w: w, h: h, faceUp: true, div: el }, card);
	card.ov = valf(opts.ov, .3);
	return card;
}
function get_max_votes(votes) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let vsorted = sortCardObjectsByRankDesc(votes, fen.ranks, 'card');
	let maxrank = getRankOf(vsorted[0].card);
	let tied_votes = arrTakeWhile(vsorted, x => getRankOf(x.card) == maxrank);
	return tied_votes;
}
function get_nc_color_array() { return ['red', 'black', 'blue', 'green', 'gold', 'hotpink', 'cyan'] }
function get_nc_complement_array(color) { return { red: '#ff9999', black: '#999', blue: BLUE, green: GREEN, gold: 'lightgoldenrodyellow', hotpink: 'pink', cyan: TEAL }[color]; }
function get_number_card(ckey, h = 100, w = null, backcolor = BLUE, ov = .3) {
	let info = {};
	let color = stringAfter(ckey, '_');
	let num = stringBefore(ckey, '_');
	info.key = ckey;
	info.cardtype = 'num';
	let [r, s] = [info.rank, info.suit] = [Number(num), color];
	info.val = r; // Number(num);
	info.color = backcolor;
	let sz = info.sz = info.h = h;
	w = info.w = valf(w, sz * .7);
	if (!isList(Z.fen.ranks)) Z.fen.ranks = calcNumRanks(get_keys(Z.fen.players).length * Z.fen.handsize, 2, Z.fen.colors.length);
	let ranks = valf(lookup(Z, ['fen', 'ranks']), range(100)); //Z.fen.ranks;
	info.irank = ranks.indexOf(r);
	info.isuit = valf(lookup(Z, ['fen', 'colors']), get_nc_color_array()).indexOf(s); //range(100));'SHCD'.indexOf(s);
	info.isort = info.isuit * ranks.length + info.irank;
	let d = mDiv(null, { h: h, w: w, rounding: 4, bg: 'white', border: 'silver' }, null, null, 'card');
	let [sm, lg] = [sz / 8, sz / 4]
	let styles = { fg: color, h: sm, fz: sm, hline: sm, weight: 'bold' };
	for (const pos of ['tl', 'tr']) {
		let d1 = mDiv(d, styles, null, num);
		mPlace(d1, pos, 2, 2);
	}
	for (const pos of ['bl', 'br']) {
		let d1 = mDiv(d, styles, null, num);
		d1.style.transform = 'rotate(180deg)';
		mPlace(d1, pos, 2, 2);
	}
	let dbig = mDiv(d, { matop: (h - lg) / 2, family: 'algerian', fg: color, fz: lg, h: lg, w: w, hline: lg, align: 'center' }, null, num);
	let res = {};
	copyKeys(info, res);
	copyKeys({ w: info.w, h: info.h, faceUp: true, div: d }, res);
	if (isdef(ov)) res.ov = ov;
	return res;
}
function get_other_players() { return get_keys(Z.fen.players).filter(x => x != Z.uplayer); }
function get_others_with_at_least_one_hand_card() {
	return get_keys(Z.fen.players).filter(x => x != Z.uplayer && Z.fen.players[x].hand.length >= 1);
}
function get_player_data(plname) { return firstCond(Z.playerdata, x => x.name == plname); }
function get_policies_to_win() {
	let fen = Z.fen;
	let policies_needed = fen.stability - fen.crisis;
	if (isEmpty(fen.policies)) return ['any', policies_needed];
	let revlist = jsCopy(fen.policies).reverse();
	let color = get_color_of_card(revlist[0]);
	let samecolorlist = arrTakeWhile(revlist, x => get_color_of_card(x) == color);
	return [color, Math.max(0, policies_needed - samecolorlist.length)];
}
function get_random_ballot_card() {
	let [fen] = [Z.fen];
	return fen.cardtype == 'num' ? `${rChoose(fen.ranks)}_${rChoose(fen.colors)}` : `${rCard('n', fen.ranks, 'SHDC')}`;
}
function get_valid_voters() {
	return Z.fen.validvoters.filter(x => Z.fen.players[x].hand.length >= 1);
}
function getRankOf(ckey, ranks) {
	if (is_nc_card(ckey)) return Number(stringBefore(ckey, '_'));
	if (nundef(ranks)) ranks = valf(lookup(Z, ['fen', 'ranks']), 'A23456789TJQK');
	return ckey[0];
}
function gift_experience_points() {
	let selected = DA.popupitems.filter(x => x.isSelected);
	if (selected.length < 2) {
		return;
	}
	let plname_item = selected.find(x => x.irow == 0);
	let plname = plname_item.a;
	let num_item = selected.find(x => x.irow == 1);
	let num = Number(num_item.a);
	mRemove('dBandMessage');
	Z.state1 = { plname: plname, num: num };
	take_turn_state1();
}
function has_player_state(plname) { let pld = get_player_data(plname); return pld ? pld.state : false; }
function is_ace(ckey) { return ckey[0] == 'A' || firstNumber(ckey) == 1; }
function is_nc_card(ckey) { return ckey.includes('_'); }
function parley_cards_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let player_cards = fen.player_cards = A.selected.map(x => A.items[x].a);
	Z.turn = [fen.other];
	Z.stage = 'parley_opponent_selects';
	take_turn_fen_clear(); //!!!!clear added!!!!
}
function parley_opponent_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let opp_cards = A.selected.map(x => A.items[x].a);
	let pl1 = fen.players[fen.president];
	let pl2 = fen.players[uplayer];
	fen.player_cards.map(x => removeInPlace(pl1.hand, x))
	fen.player_cards.map(x => pl2.hand.push(x));
	opp_cards.map(x => removeInPlace(pl2.hand, x))
	opp_cards.map(x => pl1.hand.push(x));
	ari_history_list(`president ${fen.president} exchanged ${opp_cards.length} cards with ${uplayer}`, 'parley')
	Z.stage = 'president_2';
	Z.turn = [fen.president];
	take_turn_fen_clear();
}
function parley_player_selected() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let other = fen.other = A.items[A.selected[0]].a;
	fen.maxcards = Math.min(fen.players[other].hand.length, fen.players[uplayer].hand.length);
	Z.stage = 'parley_select_cards'
	accuse_activate();
}
function pay_for_accuse_action() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let card = A.items[A.selected[0]].a;
	removeInPlace(fen.players[uplayer].hand, card); accuse_discard(card)
	redraw_hand();
	Z.stage = 'accuse_action_select_player';
	ari_history_list(`${uplayer} pays for accuse action`, 'accuse')
	accuse_activate();
}
function presentcards(h) {
	let [pldata, stage, A, fen, phase, uplayer, turn, uname, host] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	let donelist = isdef(fen.pldata) ? fen.pldata : Z.playerdata.filter(x => isDict(x.state) && isdef(x.state.item));
	if (!startsWith(stage, 'hand') && !startsWith(stage, 'membership')) return;
	for (const pld of donelist) {
		let plname = pld.name;
		let plui = lookup(UI, ['stats', plname]);
		let dcard = plui.dcard;
		if (isEmpty(arrChildren(dcard))) {
			let card = pld.state.item;
			let actualcard = plui.actualcard = !isEmpty(card);
			let card1 = plui.card = accuse_get_card(actualcard ? card : 'AHn', h)
			mAppend(dcard, iDiv(card1));
		}
		if (!Z.fen.cardsrevealed || !plui.actualcard) face_down(plui.card);
	}
}
function president_action() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	let action = A.items[A.selected[0]].a;
	if (action == 'accuse') {
		Z.stage = 'accuse_action_select_player'; //provisional does NOT pay anymore
		accuse_activate();
	} else if (action == 'parley') {
		Z.stage = 'parley_select_player';
		accuse_activate();
	} else if (action == 'defect') {
		Z.stage = 'defect_membership';
		accuse_activate();
	} else if (action == 'resign') {
		ari_history_list(`${uplayer} resigns as president`, 'resign')
		president_end();
	}
}
function president_end() {
	let fen = Z.fen;
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	fen.validvoters = jsCopy(fen.plorder);
	start_new_poll();
}
function president_parley() {
	let [A, uplayer, fen] = [Z.A, Z.uplayer, Z.fen];
	if (!isEmpty(A.selected)) {
		Z.stage = 'parley_select_player';
		accuse_activate();
	} else {
		Z.stage = 'president_2';
		accuse_activate();
	}
}
function redraw_hand() {
	let [uplayer, fen, ui, dt] = [Z.uplayer, Z.fen, UI, dTable];
	let ch = arrChildren(dt);
	let handui = UI.players[uplayer].hand.container;
	handui.remove();
	let pl = fen.players[uplayer];
	lookupSetOverride(ui, ['players', uplayer, 'hand'], ui_type_hand(pl.hand, dt, { paleft: 25 }, `players.${uplayer}.hand`));
}
function relegate_to_host(list) {
	let [stage, A, fen, phase, uplayer, turn, uname, host] = [Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host];
	if (stage == 'hand') fen.cardsrevealed = true;
	Z.turn = [Z.host];
	fen.pldata = list;
	Z.stage = Z.stage + 'resolve';
	take_turn_fen(); //das ist ein fen override in multiturn!!!!!!!
	return;
}
function send_experience_points() {
	console.log('sending experience points.....')
}
function set_new_president() {
	let fen = Z.fen;
	if (fen.wrong_guesses >= 3) {
		ari_history_list(`too many wrong guesses!!!`, 'abort');
		president_end();
	} else {
		fen.president = fen.newpresident;
		delete fen.newpresident;
		fen.isprovisional = true;
		Z.stage = 'president';
		Z.turn = [fen.president];
		ari_history_list(`new president is ${fen.president}`, 'provisional president')
		take_turn_fen_clear(); //!!!!clear added!!!!
	}
}
function show_advanced_ui_buttons() {
	let dParent = mBy('dAdvancedUI');
	mClear(dParent)
	let sz = 20;
	let styles = { bg: 'silver', wmin: sz, h: sz, rounding: '50%', maright: 10, align: 'center' };
	mButton(' ', onclick_advanced_test, dParent, styles, 'enabled');
	style_advanced_button();
}
function show_membership_color(plname, hnetcard, himg) {
	let dx = lookup(UI, ['stats', plname]);
	let pl = Z.fen.players[plname];
	if (nundef(pl.membership)) return;
	let c = get_color_of_card(pl.membership);
	mStyle(dx.dcombi, { bg: c, rounding: hnetcard / 10, patop: 4 })
	mStyle(dx.dstats, { bg: c, fg: 'white' });
	dx.dimg.firstChild.width = dx.dimg.firstChild.height = himg - 10;
}
function show_number_card(ckey, sz) {
	let card = cBlank(dTable, { h: sz, border: 'silver' });
	let d = iDiv(card, { margin: 10 });
	let color = stringAfter(ckey, '_');
	let num = stringBefore(ckey, '_');
	let [sm, lg] = [sz / 8, sz / 4]
	let styles = { fg: color, h: sm, fz: sm, hline: sm, weight: 'bold' };
	for (const pos of ['tl', 'tr']) {
		let d1 = mDiv(d, styles, null, num);
		mPlace(d1, pos, 2, 2);
	}
	for (const pos of ['bl', 'br']) {
		let d1 = mDiv(d, styles, null, num);
		d1.style.transform = 'rotate(180deg)';
		mPlace(d1, pos, 2, 2);
	}
	let dbig = mDiv(d, { family: 'algerian', fg: color, fz: lg, h: lg, w: '100%', hline: lg, align: 'center' }, null, num);
	mPlace(dbig, 'cc');
	return card;
}
function show_playerstats_orig(d2) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 25, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 25];
	let [wgap, hgap] = [20, 12];
	let players = fen.players;
	let wneeded = (himg + wgap) * fen.plorder.length + wgap;
	let wouter = '95%';
	mStyle(d2, { hmin: hstat, wmin: wouter }); mCenterFlex(d2);
	let dstats = mDiv(d2, { wmin: wneeded });
	let order = get_present_order();
	let me = order[0];
	dstats.style.gridTemplateColumns = 'repeat(' + (fen.plorder.length - 1) + ',1fr)';
	dstats.style.display = 'inline-grid';
	dstats.style.padding = dstats.style.gap = `${hgap}px ${wgap}px`;
	assertion(me == uplayer, "MEEEEEEEEEEEEEEE")
	for (const plname of order.slice(1)) { accuse_player_stat(dstats, plname, hvotecard, himg, hstatfz, gap); }
	mLinebreak(d2)
}
function show_playerstats_over(d2) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [hlg, hsm] = [80, 50];
	let [hpolcard, hvotecard, himg, hstatfz, hnetcard, hhandcard, gap] = [hsm, hlg, 50, 8, hsm, hlg, 4];
	let [hpol, hstat, hhand] = [hpolcard + 25, hvotecard + himg + hstatfz * 5 + gap * 2, hhandcard + 25];
	let [wgap, hgap] = [10, 12]; //NEW!
	let players = fen.players;
	let order = get_present_order();
	let me = order[0];
	let ncols = order.length - 1 + order.length - 2;
	let wneeded = (himg + wgap) * ncols + wgap;
	let wouter = '95%';
	mStyle(d2, { hmin: hstat, wmin: wouter }); mCenterFlex(d2);
	let dstats = mDiv(d2, { wmin: wneeded });
	let szcols = '1fr'; //isover?'auto':'1fr';
	dstats.style.gridTemplateColumns = `repeat(${ncols},${szcols})`; // 'repeat(' + ncols + `,1fr)`;
	dstats.style.display = 'inline-grid';
	dstats.style.padding = dstats.style.gap = `${hgap}px ${wgap}px`;
	assertion(me == uplayer, "MEEEEEEEEEEEEEEE")
	for (const plname of order.slice(1)) {
		let dshell1 = mDiv(dstats); mCenterCenterFlex(dshell1)
		accuse_player_stat(dshell1, plname, hvotecard, himg, hstatfz, gap);
		if (plname == arrLast(order)) break;
		let dshell2 = mDiv(dstats); mCenterCenterFlex(dshell2)
		let dncshell = mDiv(dshell2); //,{bg:'green'}); //{h:141,patop:90,bg:GREEN});
		let dummy = mDiv(dncshell, { h: 50, bg: 'transparent' })
		let netcard = get_color_card(fen.players[plname].idright, 50);
		mAppend(dncshell, iDiv(netcard));
	}
	mLinebreak(d2)
}
function show_role_accuse() {
	let d = mBy('dAdminMiddle');
	clearElement(d);
	let [role, pldata, stage, fen, phase, uplayer, turn, uname, host, mode] = [Z.role, Z.playerdata, Z.stage, Z.fen, Z.phase, Z.uplayer, Z.turn, Z.uname, Z.host, Z.mode];
	let styles, text;
	let boldstyle = { fg: 'red', weight: 'bold', fz: 20 };
	let normalstyle = { fg: 'black', weight: null, fz: null };
	if (mode == 'hotseat') {
		text = `hotseat: <span style='color:${get_user_color(uplayer)}'>${uplayer}</span>`;
		styles = boldstyle;
		styles.wmin = 220;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'spectator') {
		styles = normalstyle;
		text = `(spectating)`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'inactive' && !DA.showTestButtons) {
		styles = normalstyle;
		text = `(${turn[0]}'s turn)`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'active' && turn.length > 1 && !has_player_state(uplayer)) {
		styles = boldstyle;
		text = `It's your turn!!!`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (role == 'active' && turn.length == 1) {
		styles = boldstyle;
		text = `It's your turn!!!`;
		d.innerHTML = text; mStyle(d, styles);
	} else if (DA.showTestButtons) {
		let pls = turn.filter(x => x != uname && !has_player_state(x));
		if (isEmpty(pls)) pls = [host];
		let dpics = mDiv(d, { gap: 10 }); mCenterCenterFlex(dpics);
		for (const plname of pls) {
			let pic = get_user_pic(plname, sz = 30, border = 'solid medium white');
			mStyle(pic, { cursor: 'pointer' })
			pic.onclick = () => transferToPlayer(plname);
			mAppend(dpics, pic);
		}
	} else {
		styles = normalstyle;
		text = `(waiting for other players)`;
		d.innerHTML = text; mStyle(d, styles);
	}
}
function show_special_popup(title, onsubmit, styles = {}) {
	let dParent = mBy('dBandMessage');
	if (nundef(dParent)) dParent = mDiv(document.body, {}, 'dBandMessage');
	show(dParent);
	clearElement(dParent);
	addKeys({ position: 'fixed', top: 154, classname: 'slow_gradient_blink', vpadding: 10, align: 'center', position: 'absolute', fg: 'white', fz: 24, w: '100vw' }, styles);
	if (!isEmpty(styles.classname)) { mClass(dParent, styles.classname); }
	delete styles.classname;
	mStyle(dParent, styles);
	mDiv(dParent, {}, null, title)
	let dContent = mDiv(dParent, { bg: 'silver' })
	DA.popupitems = [];
	let irow = 0;
	let buttonstyle = { maleft: 10, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const list of [...arguments].slice(3)) {
		let d = mDiv(dContent, { padding: 10 }, `d_line_${irow}`);
		mCenterFlex(d);
		let items = ui_get_string_items(list);
		DA.popupitems = DA.popupitems.concat(items);
		let sample = items[0];
		let type = sample.itype = isNumber(sample.a) ? 'number' : is_card(sample.a) ? 'card' : is_player(sample.a) ? 'player' : isdef(sample.o) ? 'container' : is_color(sample.a) ? 'color' : 'string';
		let icol = 0;
		for (const item of items) {
			item.div = mButton(item.a, unselect_select, d, buttonstyle, 'selectable_button', `b_${irow}_${icol}`);
			item.id = item.div.id;
			item.irow = irow;
			item.icol = icol;
			if (type == 'color') mStyle(item.div, { bg: item.a, fg: 'contrast' });
			icol++;
		}
		irow++;
	}
	mButton("submit", gift_experience_points, dContent, buttonstyle, ['donebutton', 'enabled']);
	mButton("cancel", () => { mRemove('dBandMessage'); }, dContent, buttonstyle, ['donebutton', 'enabled']);
}
function sortCardObjectsByRank(arr, ranks, ckeyprop) {
	if (isEmpty(arr)) return [];
	if (is_nc_card(arr[0][ckeyprop])) return sortByFunc(arr, x => Number(stringBefore(x[ckeyprop], '_')));
	if (nundef(ranks)) ranks = valf(lookup(Z, ['fen', 'ranks']), 'A23456789TJQK');
	return sortByFunc(arr, x => ranks.indexOf(x[ckeyprop][0]));
}
function sortCardObjectsByRankDesc(arr, ranks, ckeyprop) {
	let res = sortCardObjectsByRank(arr, ranks, ckeyprop);
	return arrReverse(res);
}
function start_new_generation(fen, players, options) {
	let deck_discard = fen.deck_discard = [];
	let deck_ballots = [];
	let handsize = fen.handsize;
	let ctype = fen.cardtype;
	if (ctype == 'c52') {
		let ranks = fen.ranks = '*A23456789TJQK';
		let tb = {
			4: ['4', '5', 5, 12, 1],
			5: ['4', 'T', 6, 2, 1],
			6: ['2', 'T', 6, 0, 1],
			7: ['A', 'T', 6, 2, 1],
			8: ['2', 'K', 6, 0, 1],
			9: ['A', 'K', 6, 0, 1],
			10: ['2', 'K', 5, 2, 1],
			11: ['A', 'K', 5, 3, 1],
			12: ['2', '8', 5, 4, 2],
			13: ['2', '9', 5, 2, 2],
			14: ['2', '9', 5, 2, 2], //add 4 10s
		};
		if (nundef(players)) players = get_keys(fen.players);
		let N = players.length;
		let [r0, r1, hz, jo, numdecks] = tb[N];
		for (let i = ranks.indexOf(r0); i <= ranks.indexOf(r1); i++) {
			for (let nd = 0; nd < numdecks; nd++) {
				let c = ranks[i];
				for (const suit of 'SHDC') { deck_ballots.push(c + suit + 'n'); }
			}
		}
		if (N == 14) { for (const suit of 'SHDC') { deck_ballots.push('T' + suit + 'n'); } }
		for (let i = 0; i < jo; i++) { deck_ballots.push('*' + (i % 2 ? 'H' : 'S') + 'n'); }
	} else if (ctype == 'num') {
		let ncolors = fen.colors.length;
		let nplayers = get_keys(fen.players).length;
		let ranks = fen.ranks = calcNumRanks(players.length * handsize, 2, ncolors);
		let ncards = handsize * nplayers;
		let colors = fen.colors;
		let n = 1;
		while (deck_ballots.length < ncards) {
			for (const i of range(2)) {
				for (const c of colors) { deck_ballots.push(`${n}_${c}`); }
				if (deck_ballots.length >= ncards) break;
			}
			n++;
		}
		n--;
		fen.ranks = range(1, n);
	}
	shuffle(deck_ballots); //console.log('deck', deck_ballots);
	fen.deck_ballots = deck_ballots;
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck_ballots, handsize);
	}
	let gens = lookup(fen, ['generations']);
	let last_winning_color = gens && gens.length >= 1 ? arrLast(gens).color : null;
	fen.policies = [];
	if (last_winning_color && fen.colors.includes(last_winning_color)) {
		fen.policies.push(last_winning_color); //get_color_card(last_winning_color)); //'Q' + (last_winning_color == 'red' ? 'H' : 'S') + 'n');
	}
	fen.validvoters = jsCopy(players)
	fen.crisis = 0;
	delete fen.president;
	delete fen.newpresident;
	delete fen.isprovisional;
	delete fen.player_cards;
	delete fen.accused;
	delete fen.dominance;
}
function start_new_poll() {
	Z.stage = 'hand';
	Z.fen.cardsrevealed = false;
	Z.fen.wrong_guesses = 0;
	Z.fen.presidents_poll = [];
	Z.turn = get_valid_voters();
	take_turn_fen_clear();
}
function toggle_mode() {
	let mode = valf(Clientdata.mode, Z.mode);
	let newmode = mode == 'multi' ? 'hotseat' : 'multi';
	let b = mBy('dAdvancedUI').children[1];
	if (newmode == 'multi') { b.innerHTML = 'M'; mStyle(b, { fg: 'blue' }) }
	else { b.innerHTML = 'H'; mStyle(b, { fg: 'red' }) }
	return newmode;
}
function toggle_visibility(elem) {
	elem = toElem(elem);
	if (nundef(elem)) return;
	let vis = elem.style.display;
	if (vis == 'none') { show(elem); return true; } else { hide(elem); return false; }
}
function transferToPlayer(plname) {
	stopgame();
	clear_screen();
	set_user(plname);	//U = firstCond(Serverdata.users, x => x.name == plname);	//localStorage.setItem('uname', U.name); DA.secretuser = U.name;
	assertion(U.name == plname, 'set_user nicht geklappt!!!!!!!')
	show_username(true);
}
function turn_has_bots_that_must_move() {
	let [turn, pldata] = [Z.turn, Z.playerdata];
	if (isEmpty(pldata)) return [];
	let pldata_dict = list2dict(pldata, 'name');
	let bots_on_turn = turn.filter(x => Z.fen.players[x].playmode != 'human');
	for (const bot of bots_on_turn) {
	}
	let no_pldata = bots_on_turn.filter(x => !isDict(pldata_dict[x].state));
	let is_bot_turn = turn.length == bots_on_turn.length;
	if (is_bot_turn && turn.length == 1) return [turn];
	return no_pldata;
}
function ui_add_accuse_container_title(title, cont, items, show_if_empty) {
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let elem = mText(title, cont, { margin: 3 });
		return elem;
	}
	return null;
}
function ui_get_player_items(playernames) {
	let items = [], i = 0;
	for (const plname of playernames) {
		let plui = UI.stats[plname];
		plui.div = plui.dimg;
		plui.itype = 'player';
		let item = { o: plui, a: plname, key: plname, friendly: plname, path: `stats.${plname}`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_type_accuse_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, styles);
	let items = list.map(x => get_card_func(x));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: valf(styles.h, Config.ui.card.h), ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	let dtitle = ui_add_accuse_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
		dtitle: dtitle,
	};
}
function ui_type_accuse_policies(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, styles);
	let items = list.map(x => get_card_func(x));
	for (const item of items) {
		let d = iDiv(item);
		let color = item.ckey;
		let c = get_nc_complement_array(color); //colorMix((color,.7)
		mStyle(d, { bg: c, border: color }); //`solid 2px ${color}`,box:true}); //color,thickness:3,box:true}); //'#ddd',border:item.ckey});
	}
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: valf(styles.h, Config.ui.card.h), ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	let dtitle = ui_add_accuse_container_title(title, cont, items, show_if_empty);
	return {
		ctype: 'hand',
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		splay: splay,
		items: items,
		dtitle: dtitle,
	};
}
function unselect_select(ev) {
	let id = evToId(ev);
	let [irow, icol] = allNumbers(id);
	let newitem = null;
	for (const item of DA.popupitems) {
		let id1 = iDiv(item).id;
		let [irow1, icol1] = allNumbers(id1);
		if (irow1 == irow && icol1 != icol && item.isSelected) {
			make_string_unselected(item);
			item.isSelected = false;
		} else if (irow1 == irow && icol1 == icol) {
			newitem = item;
		}
	}
	if (newitem.isSelected) { make_string_unselected(newitem); newitem.isSelected = false; }
	else { make_string_selected(newitem); newitem.isSelected = true; }
}
//#endregion accuse

//#region aristo
function a2_pay_with_card(item) {
	let fen = Z.fen;
	let source = lookup(fen, item.path.split('.'));
	elem_from_to_top(item.key, source, fen.deck_discard);
	ari_reorg_discard(fen);
}
function a2_pay_with_coin(uplayer) {
	let fen = Z.fen;
	fen.players[uplayer].coins -= 1;
}
function add_schwein(card, fenbuilding, uibuilding) {
	if (isdef(uibuilding)) add_ui_schwein(card, uibuilding.schweine);
	let ckey = isString(card) ? card : card.key;
	let index = isString(card) ? fenbuilding.list.indexOf(ckey) : card.index;
	fenbuilding.schweine.push(index);
	console.log('fen schweine', fenbuilding.schweine);
}
function add_ui_schwein(item, uischweine) {
	uischweine.push(item);
	mStyle(iDiv(item), { position: 'relative' });
	miPic('pig', iDiv(item), { position: 'absolute', top: 30, left: 0, fz: 30 });
	face_up(item);
}
function aggregate_player(fen, prop) {
	let res = [];
	for (const uplayer in fen.players) {
		let list = fen.players[uplayer][prop];
		res = res.concat(list);
	}
	return res;
}
function ai_pick_legal_exchange() {
	let [A, fen, uplayer, items] = [Z.A, Z.fen, Z.uplayer, Z.A.items];
	let firstPick = rChoose(items, 1, x => x.path.includes('building'));
	let secondPick = rChoose(items, 1, x => !x.path.includes('building'));
	return [firstPick, secondPick];
}
function ai_pick_legal_trade() {
	let [A, fen, uplayer, items] = [Z.A, Z.fen, Z.uplayer, Z.A.items];
	let stall = fen.players[uplayer].stall;
	let firstPick = rChoose(items, 1, x => x.path.includes(uplayer)); //stall.includes(x.key));
	let secondPick = rChoose(items, 1, x => !x.path.includes(uplayer));
	return [firstPick, secondPick];
}
function animbuilding(ui_building, ms = 800, callback = null) {
	let d = ui_building.cardcontainer;
	let ani = [{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }];
	let options = {
		duration: ms,
		iterations: 1,
		easing: 'ease-out',
	};
	let a = d.animate(ani, options);
	a.onfinish = callback;
}
function animcoin(plname, ms = 800, callback = null) {
	let d = UI.player_stat_items[plname].dCoin;
	let ani = [{ transform: 'scale(1)' }, { transform: 'scale(3)' }, { transform: 'scale(1)' }];
	let options = {
		duration: ms,
		iterations: 1,
		easing: 'ease-out',
	};
	let a = d.animate(ani, options);
	a.onfinish = () => {
		let uplayer = Z.uplayer;
		let dAmount = UI.player_stat_items[uplayer].dAmount;
		dAmount.innerHTML = Z.fen.players[uplayer].coins;
		mStyle(dAmount, { fg: 'red' });
		if (callback) callback();
	};
}
function ari_activate_ui() { ari_pre_action(); }
function ari_add_hand_card() {
	let fen = Z.fen;
	for (const uplayer of fen.plorder) {
		ari_ensure_deck(fen, 1);
		top_elem_from_to(fen.deck, fen.players[uplayer].hand);
	}
}
function ari_add_harvest_cards(fen) {
	for (const plname of fen.plorder) {
		for (const f of fen.players[plname].buildings.farm) {
			if (nundef(f.h)) {
				let list = [];
				ari_ensure_deck(fen, 1);
				top_elem_from_to(fen.deck, list);
				f.h = list[0];
			}
		}
	}
}
function ari_check_action_available(a, fen, uplayer) {
	let cards;
	let pl = fen.players[uplayer];
	if (a == 'trade') {
		cards = ari_get_all_trading_cards(fen);
		let not_pl_stall = cards.filter(x => !pl.stall.includes(x.key));
		return cards.length >= 2 && pl.stall.length > 0 && not_pl_stall.length > 0;
	} else if (a == 'exchange') {
		cards = ari_get_all_wrong_building_cards(fen, uplayer);
		return cards.length > 0 && (pl.hand.length + pl.stall.length > 0);
	} else if (a == 'build') {
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		if (res.length < 4) return false;
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		if (fen.phase != 'king' && (!has_a_king || res.length < 5)) return false;
		if (pl.coin == 0 && res.length < 5) return false;
		return true;
	} else if (a == 'upgrade') {
		if (isEmpty(pl.buildings.farm) && isEmpty(pl.buildings.estate)) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		if (isEmpty(res)) return false;
		let has_a_king = firstCond(res, x => x[0] == 'K');
		if (pl.coins < 1 && !has_a_king) return false;
		if (fen.phase != 'king' && !has_a_king) return false;
		if (pl.coin == 0 && res.length < 2) return false;
		return true;
	} else if (a == 'downgrade') {
		if (isEmpty(pl.buildings.chateau) && isEmpty(pl.buildings.estate)) return false;
		return true;
	} else if (a == 'buy') {
		if (fen.open_discard.length == 0) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_jack = firstCond(res, x => x[0] == 'J');
		if (pl.coins < 1 && !has_a_jack) return false;
		if (fen.phase != 'jack' && !has_a_jack) return false;
		return true;
	} else if (a == 'visit') {
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		if (n == 0) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (fen.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'harvest') {
		let harvests = ari_get_all_building_harvest_cards(fen, uplayer);
		return !isEmpty(harvests);
	} else if (a == 'pickup') {
		return !isEmpty(pl.stall);
	} else if (a == 'sell') {
		return pl.stall.length >= 2;
	} else if (a == 'pass') {
		return true;
	} else if (a == 'commission') {
		for (const c of pl.commissions) {
			let rank = c[0];
			if (firstCond(pl.stall, x => x[0] == rank)) return true; //nur wenn in stall!!!!!!
		}
		return false;
	} else if (a == 'rumor') {
		if (isEmpty(pl.rumors)) return false;
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		if (n == 0) return false;
		return true;
	} else if (a == 'inspect') {
		if (isEmpty(pl.rumors)) return false;
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				n += fen.players[plname].buildings[k].length;
			}
		}
		return n > 0;
	} else if (a == 'blackmail') {
		let others = fen.plorder.filter(x => x != uplayer);
		let n = 0;
		for (const plname of others) {
			for (const k in fen.players[plname].buildings) {
				let list = fen.players[plname].buildings[k];
				let building_with_rumor = firstCond(list, x => !isEmpty(x.rumors));
				if (building_with_rumor) n++;
			}
		}
		if (n == 0) return false;
		let res = ari_get_player_hand_and_stall(fen, uplayer);
		let has_a_queen = firstCond(res, x => x[0] == 'Q');
		if (pl.coins < 1 && !has_a_queen) return false;
		if (fen.phase != 'queen' && !has_a_queen) return false;
		return true;
	} else if (a == 'buy rumor') {
		if (fen.deck_rumors.length == 0) return false;
		if (pl.coins < 1) return false;
		return true;
	}
}
function ari_check_end_condition(blist) {
	let nchateau = blist.chateau.length;
	let nfarm = blist.farm.length;
	let nestate = blist.estate.length;
	if (nchateau >= 2 || nchateau >= 1 && nfarm >= 3 || nchateau >= 1 && nestate >= 2) {
		return true;
	}
	return false;
}
function ari_clear_church() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	for (const prop of ['church', 'church_order', 'selorder', 'tithemin', 'tithe_minimum', 'toBeSelected', 'candidates']) delete fen[prop];
	for (const plname in fen.players) {
		delete fen.players[plname].tithes;
	}
	fen.church = ari_deck_deal_safe(fen, Z.plorder.length);
}
function ari_deck_deal_safe(fen, n) { ari_ensure_deck(fen, n); return deck_deal(fen.deck, n); }
function ari_ensure_deck(fen, n) {
	if (fen.deck.length < n) { ari_refill_deck(fen); }
}
function ari_get_actions(uplayer) {
	let fen = Z.fen;
	let actions = exp_rumors(Z.options) ? ['trade', 'exchange', 'build', 'upgrade', 'downgrade', 'buy', 'buy rumor', 'rumor', 'inspect', 'blackmail', 'harvest', 'pickup', 'sell', 'tithe', 'commission']
		: ['trade', 'exchange', 'build', 'upgrade', 'downgrade', 'buy', 'visit', 'harvest', 'pickup', 'sell', 'tithe', 'commission'];
	if (Config.autosubmit) actions.push('pass'); ////, 'pass'];
	let avail_actions = [];
	for (const a of actions) {
		let avail = ari_check_action_available(a, fen, uplayer);
		if (avail) avail_actions.push(a);
	}
	return avail_actions;
}
function ari_get_all_building_harvest_cards(fen, uplayer) {
	let res = [];
	let pl = fen.players[uplayer];
	for (const b of pl.buildings.farm) {
		if (b.h) res.push({ b: b, h: b.h });
	}
	return res;
}
function ari_get_all_trading_cards(fen) {
	let res = [];
	fen.market.map(c => res.push({ key: c, path: 'market' }));
	for (const uplayer of fen.plorder) {
		let pl = fen.players[uplayer];
		let stall = pl.stall;
		stall.map(x => res.push({ key: x, path: `players.${uplayer}.stall` }));
	}
	return res;
}
function ari_get_all_wrong_building_cards(fen, uplayer) {
	let res = [];
	let pl = fen.players[uplayer];
	for (const k in pl.buildings) {
		for (const b of pl.buildings[k]) {
			let bcards = b.list;
			let lead = bcards[0];
			let [rank, suit] = [lead[0], lead[1]];
			for (let i = 1; i < bcards.length; i++) {
				if (bcards[i][0] != rank) res.push({ c: bcards[i], building: b });
			}
		}
	}
	return res;
}
function ari_get_building_type(obuilding) { let n = obuilding.list.length; return n == 4 ? 'farm' : n == 5 ? 'estate' : 'chateau'; }
function ari_get_first_tax_payer(fen, pl_tax) { return ari_get_tax_payer(fen, pl_tax, 0); }
function ari_get_max_journey_length(fen, uplayer) {
	let pl = fen.players[uplayer];
	let sorted_journeys = sortByDescending(pl.journeys.map(x => ({ arr: x, len: x.length })), 'len');
	return isEmpty(pl.journeys) ? 0 : sorted_journeys[0].len;
}
function ari_get_player_hand_and_stall(fen, uplayer) {
	let res = [];
	res = res.concat(fen.players[uplayer].hand);
	res = res.concat(fen.players[uplayer].stall);
	return res;
}
function ari_get_tax_payer(fen, pl_tax, ifrom = 0) {
	let iturn = ifrom;
	let uplayer = fen.plorder[iturn];
	if (nundef(uplayer)) return null;
	while (pl_tax[uplayer] <= 0) {
		iturn++;
		if (iturn >= fen.plorder.length) return null;
		uplayer = fen.plorder[iturn];
	}
	return uplayer;
}
function ari_history_list(lines, title = '', fen) {
	if (nundef(fen)) fen = Z.fen;
	if (nundef(fen.history)) fen.history = [];
	if (isString(lines)) lines = [lines];
	fen.history.push({ title: title, lines: lines });
}
function ari_move_herald(fen) {
	fen.heraldorder = arrCycle(fen.heraldorder, 1);
	ari_history_list([`*** new herald: ${fen.heraldorder[0]} ***`], 'herald');
	return fen.heraldorder[0];
}
function ari_move_market_to_discard() {
	let fen = Z.fen;
	while (fen.market.length > 0) {
		elem_from_to_top(fen.market[0], fen.market, fen.deck_discard);
	}
	ari_reorg_discard();
}
function ari_move_stalls_to_hands() {
	let fen = Z.fen;
	for (const uplayer of fen.plorder) {
		fen.players[uplayer].hand = fen.players[uplayer].hand.concat(fen.players[uplayer].stall);
		fen.players[uplayer].stall = [];
	}
}
function ari_next_action() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	deactivate_ui();
	console.assert(isdef(Z.num_actions));
	fen.num_actions -= 1;
	fen.action_number += 1;
	if (fen.num_actions <= 0) {
		fen.total_pl_actions = 0;
		lookupAddIfToList(fen, ['actionsCompleted'], uplayer);
		let next = ari_select_next_player_according_to_stall_value(fen);
		if (!next) {
			ari_next_phase();
		} else {
			Z.turn = [next];
		}
	} else {
		Z.stage = 5;
	}
	take_turn_fen();
}
function ari_next_phase() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	ari_move_market_to_discard();
	ari_move_stalls_to_hands();
	ari_add_hand_card();
	delete fen.actionsCompleted;
	delete fen.stallSelected;
	Z.turn = [fen.plorder[0]];
	if (Z.stage == 10) {
		Z.phase = 'queen';
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	} else if (fen.phase == 'king') {
		fen.pl_gameover = [];
		for (const plname of fen.plorder) {
			let bcorrect = ari_get_correct_buildings(fen.players[plname].buildings);
			let can_end = ari_check_end_condition(bcorrect);
			if (can_end) fen.pl_gameover.push(plname);
		}
		if (!isEmpty(fen.pl_gameover)) {
			Z.stage = 10;
			Z.turn = [fen.pl_gameover[0]];
		} else {
			Z.phase = 'queen';
			[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
		}
	} else if (fen.phase == 'queen') {
		for (const uplayer of fen.plorder) {
			for (const k in fen.players[uplayer].buildings) {
				if (k == 'farm') continue;
				let n = fen.players[uplayer].buildings[k].length;
				fen.players[uplayer].coins += n;
				if (n > 0) ari_history_list([`${uplayer} gets ${n} coins for ${k} buildings`], 'payout');
			}
		}
		Z.phase = 'jack';
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	} else {
		fen.herald = ari_move_herald(fen, uplayer);
		fen.plorder = jsCopy(fen.heraldorder);
		ari_add_harvest_cards(fen);
		Z.phase = 'king';
		let taxneeded = ari_tax_phase_needed(fen);
		Z.turn = taxneeded ? fen.turn : [fen.herald];
		if (taxneeded) Z.stage = 2; else[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	}
	return Z.stage;
}
function ari_open_rumors(stage = 28) {
	let [fen, deck] = [Z.fen, UI.deck_rumors];
	DA.qanim = [];
	fen.stage = Z.stage = stage;
	let n = Math.min(2, fen.deck_rumors.length);
	let cards = arrTake(fen.deck_rumors, n);
	let uicards = cards.map(x => ari_get_card(x));
	let dest = UI.rumor_top = ui_type_market([], deck.container.parentNode, { maleft: 12 }, `rumor_top`, 'rumor_top', ari_get_card);
	mMagnifyOnHoverControlPopup(dest.cardcontainer);
	for (let i = 0; i < n; i++) {
		DA.qanim.push([qanim_flip_topmost, [deck]]);
		DA.qanim.push([qanim_move_topmost, [deck, dest]]);
		DA.qanim.push([q_move_topmost, [deck, dest]]);
	}
	DA.qanim.push([q_mirror_fen, ['deck_rumors', 'rumor_top']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}
function ari_refill_deck(fen) {
	fen.deck = fen.deck.concat(fen.open_discard).concat(fen.deck_discard);
	shuffle(fen.deck);
	fen.open_discard = [];
	fen.deck_discard = [];
	console.log('deck refilled: contains', fen.deck.length, 'cards');
}
function ari_reorg_discard() {
	let fen = Z.fen;
	while (fen.deck_discard.length > 0 && fen.open_discard.length < 4) {
		bottom_elem_from_to(fen.deck_discard, fen.open_discard);
	}
}
function ari_reveal_all_buildings(fen) {
	for (const plname of fen.plorder) {
		let gbs = UI.players[plname].buildinglist;
		for (const gb of gbs) {
			gb.items.map(x => face_up(x));
		}
	}
}
function ari_select_next_player_according_to_stall_value() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	fen.stage = 5;
	let minval = 100000;
	let minplayer = null;
	for (const uname of fen.plorder) {
		if (fen.actionsCompleted.includes(uname)) continue;
		let stall = fen.players[uname].stall;
		if (isEmpty(stall)) { fen.actionsCompleted.push(uname); continue; }
		let val = fen.players[uname].stall_value = arrSum(stall.map(x => ari_get_card(x).val));
		if (val < minval) { minval = val; minplayer = uname; }
	}
	if (!minplayer) {
		return null;
	} else {
		Z.turn = fen.turn = [minplayer];
		fen.num_actions = fen.total_pl_actions = fen.players[minplayer].stall.length;
		fen.action_number = 1;
		return minplayer;
	}
}
function ari_start_action_stage() {
	let next = ari_select_next_player_according_to_stall_value();
	if (!next) { ari_next_phase(); }
	take_turn_fen();
}
function ari_start_church_stage() {
	let [fen] = [Z.fen];
	let order = fen.plorder = fen.church_order = determine_church_turn_order();
	[Z.turn, Z.stage] = [[order[0]], 17];
	ari_history_list([`inquisition starts!`], 'church');
	take_turn_fen();
}
function ari_state(dParent) {
	function get_phase_html() {
		if (isEmpty(Z.phase) || Z.phase == 'over') return null; //capitalize(Z.friendly);
		let rank = Z.phase[0].toUpperCase();
		let card = ari_get_card(rank + 'Hn', 40);
		let d = iDiv(card);
		mClassRemove(d.firstChild, 'card');
		return iDiv(card).outerHTML;
	}
	if (DA.TEST0 == true) {
		let html = `${Z.stage}`;
		if (isdef(Z.playerdata)) {
			let trigger = get_multi_trigger();
			if (trigger) html += ` trigger:${trigger}`;
			for (const data of Z.playerdata) {
				if (data.name == trigger) continue;
				let name = data.name;
				let state = data.state;
				let s_state = object2string(state);
				html += ` ${name}:'${s_state}'`; // (${typeof state})`;
			}
			dParent.innerHTML += ` ${Z.playerdata.map(x => x.name)}`;
		}
		dParent.innerHTML = html;
		return;
	}
	let user_html = get_user_pic_html(Z.uplayer, 30);
	let phase_html = get_phase_html();
	let html = '';
	if (phase_html) html += `${Z.phase}:&nbsp;${phase_html}`;
	if (Z.stage == 17) { html += `&nbsp;&nbsp;CHURCH EVENT!!!`; }
	else if (TESTING) { html += `&nbsp;&nbsp;&nbsp;stage: ${ARI.stage[Z.stage]}`; }
	else html += `&nbsp;player: ${user_html} `;
	dParent.innerHTML = html;
}
function ari_tax_phase_needed(fen) {
	let pl_tax = {};
	let need_tax_phase = false;
	for (const uplayer of fen.plorder) {
		let hsz = fen.players[uplayer].hand.length;
		let nchateaus = fen.players[uplayer].buildings.chateau.length;
		let allowed = ARI.sz_hand + nchateaus;
		let diff = hsz - allowed;
		if (diff > 0) need_tax_phase = true;
		pl_tax[uplayer] = diff;
	}
	if (need_tax_phase) {
		fen.turn = [ari_get_first_tax_payer(fen, pl_tax)];
		fen.pl_tax = pl_tax;
		fen.stage = 2;
		return true;
	} else {
		fen.stage = 3;
		return false;
	}
}
function being_blackmailed() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let cmd = item.key;
	console.log('selected reaction to blackmail:', item.key);
	if (cmd == 'accept') { Z.stage = 34; ari_pre_action(); }
	else if (cmd == 'reject') { post_reject_blackmail(); }
	else { post_defend_blackmail(); }
}
function check_correct_journey(A, fen, uplayer) {
	let items = A.selected.map(x => A.items[x]);
	if (items.length < 2) {
		select_error('please select at least 2 items!'); return [null, null, null];//a total of at least 2 items must be selected
	}
	let carditems = items.filter(x => is_card(x));
	if (isEmpty(carditems)) {
		select_error('please select at least 1 card!'); return [null, null, null];//at least one hand card must be selected
	} else if (items.length - carditems.length > 1) {
		select_error('please select no more than 1 journey!'); return [null, null, null];//at most one journey must be selected
	}
	let journeyitem = firstCond(items, x => !is_card(x));
	let cards = journeyitem ? jsCopy(journeyitem.o.list) : [];
	cards = cards.concat(carditems.map(x => x.o.key));
	let jlegal = is_journey(cards);
	if (!jlegal || jlegal.length != cards.length) {
		select_error('this is not a legal journey!!'); return [null, null, null];//is this a legal journey?
	}
	return [carditems, journeyitem, jlegal];
}
function check_if_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let jacks = fen.market.filter(x => x[0] == 'J');
	let queens = fen.market.filter(x => x[0] == 'Q');
	for (const plname of plorder) {
		let pl = fen.players[plname];
		let pl_jacks = pl.stall.filter(x => x[0] == 'J');
		let pl_queens = pl.stall.filter(x => x[0] == 'Q');
		jacks = jacks.concat(pl_jacks);
		queens = queens.concat(pl_queens);
	}
	let ischurch = false;
	for (const j of jacks) {
		if (firstCond(queens, x => x[1] != j[1])) ischurch = true;
	}
	return ischurch;
}
function check_resolve() {
	let can_resolve = true;
	for (const plname of Z.plorder) {
		let data1 = firstCond(Z.playerdata, x => x.name == plname && !isEmpty(x.state));
		if (nundef(data1)) { can_resolve = false; break; }
	}
	return can_resolve;
}
function determine_church_turn_order() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let initial = [];
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.vps = ari_calc_fictive_vps(fen, plname);
		pl.max_journey_length = ari_get_max_journey_length(fen, plname);
		pl.score = pl.vps * 10000 + pl.max_journey_length * 100 + pl.coins;
		initial.push(pl);
	}
	let sorted = sortByDescending(initial, 'score');
	return sorted.map(x => x.name);
}
function find_common_ancestor(d1, d2) { return dTable; }
function find_journeys(fen, uplayer) {
	let h = fen.players[uplayer].hand;
	let seqs = find_sequences(h, 2, 'A23456789TJQK');
	if (!isEmpty(seqs)) return seqs;
	let existing_journeys = aggregate_player(fen, 'journeys');
	for (const j of existing_journeys) {
		let h1 = j.concat(h);
		let seqs1 = find_sequences(h1, j.length + 1, 'A23456789TJQK');
		if (!isEmpty(seqs1)) return seqs1;
	}
	return seqs;
}
function find_players_with_potential_journey(fen) {
	let res = [];
	for (const uplayer of fen.plorder) {
		if (isdef(fen.passed) && fen.passed.includes(uplayer)) continue;
		let j = find_journeys(fen, uplayer);
		if (!isEmpty(j)) res.push(uplayer);
	}
	return res;
}
function find_sequences(blatt, n = 2, rankstr = '23456789TJQKA', allow_cycle = false) {
	let suitlists = get_suitlists_sorted_by_rank(blatt, rankstr, true); //true...remove_duplicates
	let seqs = [];
	for (const lst of get_values(suitlists)) {
		let len = lst.length;
		if (len < n) continue;
		let l = allow_cycle ? lst.concat(lst) : lst;
		for (let istart = 0; istart < len; istart++) {
			let seq = [l[istart]];
			let i = istart;
			while (i + 1 < l.length && follows_in_rank(l[i], l[i + 1], rankstr)) {
				seq.push(l[i + 1]);
				i++;
			}
			if (seq.length >= n) seqs.push(seq);
		}
	}
	return seqs;
}
function follows_in_rank(c1, c2, rankstr) {
	return get_rank_index(c2, rankstr) - get_rank_index(c1, rankstr) == 1;
	let i1 = rankstr.indexOf(c1[0]);
	let i2 = rankstr.indexOf(c2[0]);
	console.log('follows?', c1, i1, c2, i2, i2 - i1)
	return rankstr.indexOf(c2[0]) - rankstr.indexOf(c1[0]) == 1;
}
function get_pay_history(payment, uplayer) { return [`${uplayer} pays with ${payment}`]; }
function get_rank_index(ckey, rankstr = '23456789TJQKA') { return rankstr.indexOf(ckey[0]); }
function get_suitlists_sorted_by_rank(blatt, rankstr = '23456789TJQKA', remove_duplicates = false) {
	let di = {};
	for (const k of blatt) {
		let suit = k[1];
		if (nundef(di[suit])) di[suit] = [];
		if (remove_duplicates) addIf(di[suit], k); else di[suit].push(k);
	}
	for (const s in di) {
		sortByRank(di[s], rankstr);
	}
	return di;
}
function get_trade_history(uplayer, i0, i1) {
	if (i1.path.includes(uplayer)) { let h = i0; i0 = i1; i1 = h; }
	return [`${uplayer} trades ${i0.key} (from own stall) for ${i1.key} (from ${i1.path == 'market' ? 'market' : stringBetween(i1.path, '.', '.')})`];
}
function is_in_middle_of_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	return isdef(fen.players[uplayer].tithes);
}
function is_journey(cards) {
	let jlist = find_sequences(cards, cards.length, 'A23456789TJQK');
	let j = firstCond(jlist, x => x.length == cards.length);
	return j;
}
function is_stall_selection_complete() { return Z.fen.stallSelected.length == Z.fen.plorder.length; }
function matches_on_either_end(card, j) {
	let key = card.key;
	let jfirst = arrFirst(j.o.list);
	let jlast = arrLast(j.o.list);
	rankstr = 'A23456789TJQK';
	let [s, s1, s2] = [key[1], jfirst[1], jlast[1]];
	let anfang = s == s1 && follows_in_rank(key, jfirst, rankstr);
	let ende = s == s2 && follows_in_rank(jlast, key, rankstr);
	return anfang || ende; // follows_in_rank(rcard,rjfirst,rankstr) || follows_in_rank(rjlast, rcard, rankstr);
}
function payment_complete() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.payment = A.items[A.selected[0]];
	let nextstage = Z.stage = ARI.stage[A.command];
	ari_pre_action();
}
function post_accept_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let blackmailer = fen.blackmail.blackmailer;
	let blackmailed = fen.blackmail.blackmailed;
	let building_path = fen.blackmail.building_path;
	let fenbuilding = path2fen(fen, building_path);
	let building_owner = stringAfter(building_path, '.'); building_owner = stringBefore(building_owner, '.');
	assertion(building_owner == blackmailed && blackmailed == uplayer, 'blackmailed and uplayer and building owner must be same');
	elem_from_to(item.key, fen.players[blackmailed].stall, fen.players[blackmailer].hand);
	ari_history_list([`${blackmailed} accepts: gives ${item.key} to ${blackmailer}`], 'blackmail');
	delete fenbuilding.isblackmailed;
	[Z.stage, Z.turn] = [35, [blackmailer]];
	take_turn_fen();
}
function post_auction() {
	console.assert(Z.stage == 13, 'WRONG STAGE IN POST AUCTION ' + Z.stage);
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.selected.map(x => A.items[x])[0]; // A.items.filter(x => A.selected.includes(x.index)).map(x => x.key);
	lookupSet(fen, ['buy', uplayer], { key: item.key, index: A.selected[0] });
	ari_history_list([`${uplayer} selects ${item.key}`], 'auction');
	for (const plname of fen.maxplayers) {
		if (!lookup(fen, ['buy', plname])) {
			Z.turn = [plname]; //fen.plorder[iturn];
			take_turn_fen(); //wenn send mache muss ich die ui nicht korrigieren!
			return;
		}
	}
	let buylist = dict2list(fen.buy, 'playername');
	let discardlist = [];
	for (const plname of fen.maxplayers) {
		let choice = fen.buy[plname]; //{key:item.key,index:A.selected[0]}
		let n = arrCount(buylist, x => x.index == choice.index);
		let is_unique = n == 1; //!firstCond(buylist, x => x.id != plname && x.key == choice);
		if (is_unique) {
			fen.players[plname].coins -= fen.second_most;
			let x = UI.player_stat_items[plname].dCoin; mPulse1(x); //console.log('dCoin: ', x); 
			elem_from_to(choice.key, fen.market, fen.players[plname].hand);
			ari_history_list([`${plname} buys ${choice.key} for ${fen.second_most}`], 'auction');
			let card = find_card(choice.index, UI.market);
			animate_card_transfer(card, arrLast(UI.players[plname].hand.items)); //UI.player_stat_items[plname]);
		} else {
			addIf(discardlist, choice.key);
			delete fen.buy[plname];
		}
	}
	for (const key of discardlist) {
		elem_from_to(key, fen.market, fen.deck_discard);
		ari_reorg_discard(fen);
		ari_history_list([`${key} is discarded`], 'auction');
	}
	delete fen.second_most;
	delete fen.maxplayers;
	delete fen.buy;
	delete fen.auction;
	Z.stage = 4;
	Z.turn = [fen.plorder[0]];
	setTimeout(take_turn_fen, 1000); //take_turn_fen(); 
}
function post_ball() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let keys = A.selected.map(x => A.items[x]).map(x => x.key);
	keys.map(x => lookupAddIfToList(fen, ['ball', uplayer], x));
	keys.map(x => removeInPlace(fen.players[uplayer].hand, x));
	let iturn = fen.plorder.indexOf(uplayer) + 1;
	if (iturn >= fen.plorder.length) { //alle sind durch ball selection
		if (isdef(fen.ball)) {
			let all = [];
			for (const c of fen.market) all.push(c);
			for (const uplayer in fen.ball) for (const c of fen.ball[uplayer]) all.push(c);
			shuffle(all);
			fen.market = [];
			for (let i = 0; i < 2; i++) top_elem_from_to(all, fen.market);
			for (const uplayer in fen.ball) for (let i = 0; i < fen.ball[uplayer].length; i++) top_elem_from_to(all, fen.players[uplayer].hand);
			delete fen.ball;
		} //else { console.log('empty ball!!!'); }
		iturn = 0;
		Z.stage = 4;
		console.assert(fen.phase == 'queen', 'wie bitte noch nicht in queen phase?!!!!!!!!!!!');
	}
	Z.turn = [fen.plorder[iturn]];
	ari_history_list([`${uplayer} added ${keys.length} card${plural(keys.length)} to ball!`], 'ball');
	take_turn_fen(); //wenn send mache muss ich die ui nicht korrigieren!
}
function post_blackmail() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	ari_history_list([`blackmail complete!`], 'blackmail');
	delete fen.blackmail;
	ari_next_action();
}
function post_build() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	if (A.selected.length < 4 || A.selected.length > 6) {
		select_error('select 4, 5, or 6 cards to build!');
		return;
	}
	let building_items = A.selected.map(x => A.items[x]);
	let building_type = building_items.length == 4 ? 'farm' : building_items.length == '5' ? 'estate' : 'chateau';
	fen.players[uplayer].buildings[building_type].push({ list: building_items.map(x => x.key), h: null, schweine: [], lead: building_items[0].key });
	for (const item of building_items) {
		let source = lookup(fen, item.path.split('.'));
		removeInPlace(source, item.key);
	}
	ari_history_list([`${uplayer} builds a ${building_type}`], 'build');
	let is_coin_pay = process_payment();
	let ms = 1800;
	if (is_coin_pay) animcoin(Z.uplayer, 1000);
	remove_ui_items(building_items);
	let pl = fen.players[uplayer];
	let nfarms = pl.buildings.farm.length;
	let nestates = pl.buildings.estate.length;
	let nchateaus = pl.buildings.chateau.length;
	let index = building_type == 'farm' ? nfarms - 1 : building_type == 'estate' ? nfarms + nestates - 1 : nfarms + nestates + nchateaus - 1;
	console.log('index of new building is', index);
	let ifinal = UI.players[uplayer].indexOfFirstBuilding + index;
	console.log('ifinal', ifinal);
	let dpl = iDiv(UI.players[uplayer]);
	let akku = [];
	while (dpl.children.length > ifinal) { akku.push(dpl.lastChild); dpl.removeChild(dpl.lastChild); }
	let fenbuilding = arrLast(fen.players[uplayer].buildings[building_type]);
	let newbuilding = ui_type_building(fenbuilding, dpl, { maleft: 8 }, `players.${uplayer}.buildings.${building_type}.${index}`, building_type, ari_get_card, true, false);
	animbuilding(newbuilding, ms, ari_next_action);
	akku.map(x => mAppend(dpl, x));
}
function post_buy() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.items[A.selected[0]];
	elem_from_to(item.key, fen.open_discard, fen.players[uplayer].hand);
	ari_history_list([`${uplayer} buys ${item.key}`], 'buy')
	ari_reorg_discard();
	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	process_payment();
	setTimeout(ari_next_action, 1000); //ari_next_action();
}
function post_buy_rumor() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let non_selected = A.items.filter(x => x.index != A.selected[0]);
	let rumor = item.key;
	for (const item of non_selected) { fen.deck_rumors.push(item.key); }
	fen.players[uplayer].rumors.push(rumor);
	fen.players[uplayer].coins -= 1;
	ari_history_list([`${uplayer} bought a rumor`], 'rumor');
	ari_next_action();
}
function post_church() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let pl = fen.players[uplayer];
	let items = A.selected.map(x => A.items[x]);
	let card = items.find(x => x.path && x.path.includes('church')); if (isdef(card)) card = card.key;
	let cand = items.length > 1 ? items.find(x => !x.path) : fen.candidates[0];
	if (isdef(cand) && isDict(cand)) cand = cand.key;
	if (nundef(card) || nundef(cand)) {
		select_error(`You must select a card ${items.length > 1 ? 'and a candidate' : ''}!`);
		return;
	}
	elem_from_to(card, fen.church, fen.players[cand].hand);
	ari_history_list([`${uplayer} gives ${cand} card ${card}`], 'new cards');
	removeInPlace(fen.toBeSelected, cand);
	if (fen.church.length == 1) {
		let cand = fen.toBeSelected[0];
		let card = fen.church[0];
		elem_from_to(card, fen.church, fen.players[cand].hand);
		ari_history_list([`${cand} receives last card: ${card}`], 'new cards');
		Z.stage = 14;
		let plorder = fen.plorder = jsCopy(fen.heraldorder);
		Z.turn = [plorder[0]];
		take_turn_fen();
	} else {
		Z.turn = [get_next_in_list(uplayer, fen.selorder)];
		take_turn_fen();
	}
}
function post_comm_setup_stage() {
	let [fen, A, uplayer, plorder, pl] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.pl];
	let achtungHack = false;
	let new_playerdata = [];
	for (const data of Z.playerdata) {
		let o = data;
		if (is_stringified(data)) {
			console.log('achtungHack: data is stringified');
			o = JSON.parse(data);
			achtungHack = true;
		} else if (is_stringified(data.state)) {
			console.log('achtungHack: data.state is stringified');
			o.state = JSON.parse(data.state);
			achtungHack = true;
		}
		new_playerdata.push(o);
		let state = o.state;
		let giver = state.giver;
		let receiver = state.receiver;
		let keys = state.keys;
		keys.map(x => elem_from_to(x, fen.players[giver].commissions, fen.players[receiver].commissions));
	}
	if (achtungHack) { Z.playerdata = new_playerdata; }
	fen.comm_setup_num -= 1;
	if (fen.comm_setup_num <= 0) {
		delete fen.comm_setup_di;
		delete fen.comm_setup_num;
		delete fen.keeppolling;
		ari_history_list([`commission trading ends`], 'commissions');
		if (exp_rumors && plorder.length > 2) {
			[Z.stage, Z.turn] = [24, Z.options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder];
			ari_history_list([`gossiping starts`], 'rumors');
		} else { [Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase); }
	} else {
		[Z.stage, Z.turn] = [23, Z.options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder];
	}
	take_turn_fen_clear();
}
function post_commission() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let comm_selected = A.items[A.selected[0]];
	let stall_item = A.commission_stall_item;
	console.log('stall_item:', stall_item);
	let rank = A.commission.key[0];
	if (nundef(fen.commissioned)) fen.commissioned = [];
	let x = firstCond(fen.commissioned, x => x.rank == rank);
	if (x) { removeInPlace(fen.commissioned, x); }
	else { x = { key: A.commission.key, rank: rank, count: 0 }; }
	x.count += 1;
	let pl = fen.players[uplayer];
	let top = isEmpty(fen.commissioned) ? null : arrLast(fen.commissioned);
	let rankstr = 'A23456789TJQK';
	let points = !top || get_rank_index(rank, rankstr) >= get_rank_index(top.rank, rankstr) ? 1 : 0;
	points += Number(x.count);
	pl.coins += points;
	fen.commissioned.push(x);
	let key = stall_item.key;
	removeInPlace(pl.stall, key); // das muss aendern!!!!!!!!!!!!!
	if (comm_selected.path == 'open_commissions') {
		removeInPlace(fen.open_commissions, comm_selected.key);
		top_elem_from_to(fen.deck_commission, fen.open_commissions);
	} else {
		removeInPlace(fen.deck_commission, comm_selected.key);
	}
	arrReplace(pl.commissions, [A.commission.key], [comm_selected.key]);
	ari_history_list([`${uplayer} commissions card ${A.commission.key}`, `${uplayer} gets ${points} coin${if_plural(points)} for commissioning ${A.commission.key}`], 'commission');
	ari_next_action();
}
function post_complementing_market_after_church() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	let selectedKeys = A.selected.map(i => A.items[i].key);
	for (const ckey of selectedKeys) {
		elem_from_to(ckey, fen.players[uplayer].hand, fen.players[uplayer].stall);
	}
	if (selectedKeys.length > 0) ari_history_list([`${uplayer} complements stall`], 'complement stall');
	let next = get_next_player(Z, uplayer);
	if (next == plorder[0]) {
		ari_clear_church();
		ari_start_action_stage();
	} else {
		Z.turn = [next];
		take_turn_fen();
	}
}
function post_defend_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let blackmailer = fen.blackmail.blackmailer;
	let blackmailed = fen.blackmail.blackmailed;
	let building_path = fen.blackmail.building_path;
	let fenbuilding = path2fen(fen, building_path);
	let building_owner = stringAfter(building_path, '.'); building_owner = stringBefore(building_owner, '.');
	assertion(building_owner == blackmailed && blackmailed == uplayer, 'blackmailed and uplayer and building owner must be same');
	let rumors = fen.players[building_owner].rumors;
	let lead = fenbuilding.lead;
	let brumors = fenbuilding.rumors;
	let match = firstCond(rumors, x => x[0] == lead[0]);
	removeInPlace(rumors, match);
	brumors.pop();
	ari_history_list([`${blackmailed} defends: pays matching rumor to deflect blackmail, 1 rumor is removed from building`], 'blackmail');
	delete fenbuilding.isblackmailed;
	[Z.stage, Z.turn] = [35, [blackmailer]];
	take_turn_fen();
}
function post_downgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let pl = fen.players[uplayer];
	A.downgrade_cards = A.selected.map(x => A.items[x]); //
	let obuilding = lookup(fen, A.building.path.split('.'));
	let n = obuilding.list.length;
	let nremove = A.downgrade_cards.length;
	let nfinal = n - nremove;
	let type = A.building.o.type;
	let list = pl.buildings[type];
	removeInPlace(list, obuilding);
	let cards = A.downgrade_cards.map(x => x.key);
	if (nfinal < 4) {
		pl.hand = pl.hand.concat(obuilding.list);
	} else if (nfinal == 4) {
		pl.buildings.farm.push(obuilding);
		pl.hand = pl.hand.concat(cards);
	} else if (nfinal == 5) {
		pl.buildings.estate.push(obuilding);
		pl.hand = pl.hand.concat(cards);
	} else if (nfinal == 6) {
		pl.buildings.chateau.push(obuilding);
		pl.hand = pl.hand.concat(cards);
	}
	A.downgrade_cards.map(x => removeInPlace(obuilding.list, x.key));
	if (isdef(pl.tithes)) {
		for (const c of cards) removeInPlace(pl.hand, c);
	}
	ari_history_list([`${uplayer} downgrades to ${ari_get_building_type(obuilding)}`], 'downgrade');
	if (isdef(pl.tithes)) { proceed_to_newcards_selection(); } else ari_next_action(fen, uplayer);
}
function post_endgame() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	if (A.selected[0] == 0) {
		console.log('GAMEOVER!!!!!!!!!!!!!!!!!!!');
		for (const plname of fen.plorder) {
			let pl = fen.players[plname];
			pl.vps = ari_calc_real_vps(fen, plname);
			pl.max_journey_length = ari_get_max_journey_length(fen, plname);
			pl.score = pl.vps * 10000 + pl.max_journey_length * 100 + pl.coins;
			console.log('score', plname, pl.score);
		}
		let playerlist = dict2list(fen.players, 'name');
		let sorted = sortByDescending(playerlist, 'score');
		console.log('scores', sorted.map(x => `${x.name}:${x.score}`));
		let max_score = sorted[0].score;
		let all_winners = sorted.filter(x => x.score == max_score);
		fen.winners = all_winners.map(x => x.name);
		console.log('winners:', fen.winners)
		take_turn_fen();
	} else {
		let iturn = fen.pl_gameover.indexOf(uplayer) + 1;
		if (iturn >= fen.pl_gameover.length) { //niemand wollte beenden: move to queen phase!
			delete fen.pl_gameover;
			Z.turn = [fen.plorder[0]];
			Z.phase = 'queen';
			[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
			take_turn_fen();
		} else {
			Z.turn = [fen.pl_gameover[iturn]];
			take_turn_fen();
		}
	}
}
function post_exchange() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	if (A.selected.length != 2) {
		select_error('please, select exactly 2 cards!');
		return;
	}
	let i0 = A.items[A.selected[0]];
	let i1 = A.items[A.selected[1]];
	let [p0, p1] = [i0.path, i1.path];
	if (p0.includes('build') == p1.includes('build')) {
		select_error('select exactly one building card and one of your hand or stall cards!');
		return;
	}
	let ibuilding = p0.includes('build') ? i0 : i1;
	let ihandstall = ibuilding == i0 ? i1 : i0;
	let fenbuilding = lookup(fen, ibuilding.path.split('.')); //stringBeforeLast(ibuilding.path, '.').split('.'));
	let ib_index = ibuilding.o.index; //index of the building card within building!
	if (fenbuilding.schweine.includes(ib_index)) {
		fenbuilding.schweine.splice(fenbuilding.schweine.indexOf(ib_index), 1);
	}
	let pl = fen.players[uplayer];
	let list2 = ihandstall.path.includes('hand') ? pl.hand : pl.stall;
	let i2 = list2.indexOf(ihandstall.o.key)
	exchange_by_index(fenbuilding.list, ib_index, list2, i2);
	ari_history_list([`${uplayer} exchanges card in ${ari_get_building_type(fenbuilding)}`], 'exchange');
	animate_card_exchange(ibuilding, ihandstall, ari_next_action);
}
function post_harvest() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let obuilding = lookup(fen, item.path.split('.'));
	fen.players[uplayer].hand.push(obuilding.h);
	obuilding.h = null;
	ari_history_list([`${uplayer} harvests`], 'harvest');
	ari_next_action();
}
function post_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let schwein = A.items[A.selected[0]].o;
	turn_new_schwein_up(schwein, A.fenbuilding, A.uibuilding);
}
function post_luxury_or_journey_cards() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let luxury_selected = A.selected[0] == 0;
	console.log('carditems', A.carditems);
	let n = A.carditems.length;
	if (luxury_selected) {
		let cardstoreplace = A.carditems.map(x => x.key); //add n luxury cards to player hand
		arrReplace(fen.players[uplayer].hand, cardstoreplace, deck_deal(fen.deck_luxury, n));
	} else {
		let len = A.jlegal.length;
		let handcards = firstCond(A.carditems, x => A.jlegal[0] == x.key) ? arrFromIndex(A.jlegal, len - n) : A.jlegal.slice(0, n);
		console.log('handcards', handcards);
		arrExtend(fen.players[uplayer].hand, handcards);
		A.jlegal = arrMinus(A.jlegal, handcards);
		let cardstoremove = A.carditems.map(x => x.key);
		arrRemove(fen.players[uplayer].hand, cardstoremove);
	}
	let path = A.journeyitem.path;
	let parts = path.split('.');
	let owner = parts[1];
	console.log('path', path, 'parts', parts, 'owner', owner)
	fen.players[owner].journeys.splice(Number(parts[3]), 1, A.jlegal);
	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase); //set_nextplayer_after_journey();
	ari_history_list([`${uplayer} added to existing journey and takes ${luxury_selected ? 'luxury cards' : 'journey cards'}`], 'journey');
	take_turn_fen();
}
function post_new_journey() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	fen.players[uplayer].journeys.push(A.jlegal);
	arrReplace(fen.players[uplayer].hand, A.jlegal, deck_deal(fen.deck_luxury, A.jlegal.length));
	ari_history_list([`${uplayer} added journey`], 'journey');
	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase);
	take_turn_fen();
}
function post_pass() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let n = fen.total_pl_actions - fen.num_actions;
	ari_history_list([`${uplayer} passes after ${n} action${plural(n)}`], 'pass');
	fen.num_actions = 0;
	ari_next_action();
}
function post_pickup() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	elem_from_to(item.key, fen.players[uplayer].stall, fen.players[uplayer].hand);
	ari_history_list([`${uplayer} picks up ${item.key}`], 'pickup');
	ari_next_action();
}
function post_reject_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let blackmailer = fen.blackmail.blackmailer;
	let blackmailed = fen.blackmail.blackmailed;
	let building_path = fen.blackmail.building_path;
	let fenbuilding = path2fen(fen, building_path);
	let building_owner = stringAfter(building_path, '.'); building_owner = stringBefore(building_owner, '.');
	assertion(building_owner == blackmailed && blackmailed == uplayer, 'blackmailed and uplayer and building owner must be same');
	ari_history_list([`${blackmailed} rejects!`], 'blackmail');
	let rumors = fenbuilding.rumors;
	let has_lead_rumor = firstCond(rumors, x => x[0] == fenbuilding.lead[0]);
	if (has_lead_rumor) {
		let stall = fen.players[blackmailed].stall;
		fen.players[blackmailer].hand = fen.players[blackmailer].hand.concat(stall);
		fen.players[blackmailed].stall = [];
		ari_history_list([`RUMOR CORRECT!!! ${blackmailed} looses entire stall to ${blackmailer}`], 'blackmail');
	} else {
		ari_history_list([`${blackmailed} was lucky!!! rumors incorrect`], 'blackmail');
	}
	delete fenbuilding.rumors;
	delete fenbuilding.isblackmailed;
	[Z.stage, Z.turn] = [35, [blackmailer]];
	take_turn_fen();
}
function post_rumor_both() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let non_selected = A.items.filter(x => x.index != A.selected[0])[0];
	let rumor = item.key;
	let rumor_other = non_selected.key;
	fen.players[uplayer].rumors.push(rumor);
	fen.players[A.owner].rumors.push(rumor_other);
	ari_history_list([`${uplayer} got a rumor, ${A.owner} got one too`], 'rumor');
	ari_next_action();
}
function post_rumor_setup() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	for (const plname of plorder) { fen.players[plname].rumors = []; }
	for (const plname of plorder) {
		let data = firstCond(Z.playerdata, x => x.name == plname);
		let di = data.state.di;
		for (const k in di) {
			arrPlus(fen.players[k].rumors, di[k]);
		}
	}
	ari_history_list([`gossiping ends`], 'rumors');
	[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, fen.phase);
	take_turn_fen_clear();
}
function post_sell() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	if (A.selected.length != 2) {
		select_error('select exactly 2 cards to sell!');
		return;
	}
	for (const i of A.selected) {
		let c = A.items[i].key;
		elem_from_to(c, fen.players[uplayer].stall, fen.deck_discard);
	}
	ari_reorg_discard();
	fen.players[uplayer].coins += 1;
	let [i1, i2] = A.selected.map(x => A.items[x].key)
	ari_history_list([`${uplayer} sells ${i1} and ${i2}`], 'sell');
	ari_next_action(fen, uplayer);
}
function post_stall_selected() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let selectedKeys = A.selected.map(i => A.items[i].key);
	for (const ckey of selectedKeys) {
		elem_from_to(ckey, fen.players[uplayer].hand, fen.players[uplayer].stall);
	}
	ensure_stallSelected(fen);
	fen.stallSelected.push(uplayer);
	ari_history_list([`${uplayer} puts up a stall for ${selectedKeys.length} action${plural(selectedKeys.length)}`], 'market');
	if (is_stall_selection_complete()) {
		delete fen.stallSelected;
		fen.actionsCompleted = [];
		if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
	} else {
		Z.turn = [get_next_player(Z, uplayer)];
		take_turn_fen();
	}
}
function post_tax() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let items = A.selected.map(x => A.items[x]);
	let n = fen.pl_tax[uplayer];
	if (items.length != n) {
		select_error(`please select exactly ${n} cards`);
		return;
	}
	for (const item of items) {
		elem_from_to_top(item.key, fen.players[uplayer].hand, fen.deck_discard);
	}
	ari_reorg_discard();
	ari_history_list([`${uplayer} pays tax: ${fen.pl_tax[uplayer]}`], 'tax');
	fen.pl_tax[uplayer] = 0;
	let iturn = fen.plorder.indexOf(uplayer);
	let plnext = ari_get_tax_payer(fen, fen.pl_tax, iturn + 1);
	if (plnext == null) {
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, 'king');
		delete fen.pl_tax;
	} else {
		Z.turn = [plnext];
	}
	take_turn_fen(fen, uplayer);
}
function post_tithe() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let items = A.selected.map(x => A.items[x]);
	if (items.length == 0) { select_error('No cards selected!'); return; }
	let st = items.map(x => ({ key: x.key, path: x.path }));
	let val = arrSum(st.map(x => ari_get_card(x.key).val));
	lookupSet(fen, ['players', uplayer, 'tithes'], { keys: st, val: val });
	remove_tithes_from_play(fen, uplayer);
	let pldone = plorder.filter(x => isdef(fen.players[x].tithes));
	let minplayers = arrMin(pldone, x => fen.players[x].tithes.val);
	let minplayer = isList(minplayers) ? minplayers[0] : minplayers;
	let minval = fen.tithemin = fen.players[minplayer].tithes.val;
	let next = get_next_in_list(uplayer, fen.church_order);
	if (next == fen.church_order[0]) {
		assertion(sameList(pldone, plorder), 'NOT all players have tithes!!!!!!!', pldone);
		if (minplayers.length > 1) { proceed_to_newcards_selection(); return; }
		else {
			pldone = pldone.filter(x => x != minplayer);
			let sorted = sortBy(pldone, x => fen.players[x].tithes.val);
			let second_min = sorted[0];
			fen.tithe_minimum = fen.players[second_min].tithes.val - minval;
			let pl = fen.players[minplayer];
			let hst = pl.hand.concat(pl.stall);
			let vals = hst.map(x => ari_get_card(x).val);
			let sum = isEmpty(vals) ? 0 : arrSum(vals);
			let min = fen.tithe_minimum;
			if (sum < min) {
				pl.hand = [];
				pl.stall = [];
				let buildings = arrFlatten(get_values(pl.buildings));
				console.log('buildings', buildings);
				if (isEmpty(buildings)) {
					ari_history_list([`${minplayer} does not have a building to downgrade!`], 'downgrade');
					proceed_to_newcards_selection();
					return;
				}
				ari_history_list([`${minplayer} must downgrade a building to tithe ${min}!`], 'downgrade');
				Z.stage = 22;
			} else {
				ari_history_list([`${minplayer} must tithe more cards to reach ${min}!`], 'tithe');
				Z.stage = 21;
			}
			Z.turn = [minplayer];
		}
	} else {
		Z.turn = [next];
	}
	take_turn_fen();
}
function post_tithe_minimum() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	let items = A.selected.map(x => A.items[x]);
	let st = items.map(x => ({ key: x.key, path: x.path }));
	pl.tithes.keys = pl.tithes.keys.concat(st);
	let newval = arrSum(st.map(x => ari_get_card(x.key).val));
	pl.tithes.val += newval;
	console.log('tithe_minimum', fen.tithe_minimum);
	console.log('val', pl.tithes.val);
	if (newval < fen.tithe_minimum) {
		select_error(`you need to tithe at least ${fen.tithe_minimum} to reach minimum`);
		return;
	}
	remove_tithes_from_play(fen, uplayer, st);
	proceed_to_newcards_selection();
}
function post_trade() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	if (A.selected.length != 2) {
		select_error('please, select exactly 2 cards!');
		return;
	}
	let i0 = A.items[A.selected[0]];
	let i1 = A.items[A.selected[1]];
	let num_own_stall = [i0, i1].filter(x => x.path.includes(uplayer)).length;
	if (i0.path == i1.path) {
		select_error('you cannot trade cards from the same group');
		return;
	} else if (num_own_stall != 1) {
		select_error('you have to pick one card of your stall and one other card');
		return;
	} else {
		let list0 = lookup(fen, i0.path.split('.'));
		let list1 = lookup(fen, i1.path.split('.'));
		exchange_by_index(list0, i0.o.index, list1, i1.o.index);
		ari_history_list(get_trade_history(uplayer, i0, i1), 'trade');
		animate_card_exchange(i0, i1, ari_next_action);
	}
}
function post_upgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.building = A.items[A.selected[0]];
	let gb = A.building;
	let b = lookup(fen, gb.path.split('.'));
	let n = A.upgrade_cards.length;
	let type0 = gb.o.type;
	let len = gb.o.list.length + n;
	let type1 = len == 5 ? 'estate' : 'chateau';
	let target = lookup(fen, gb.path.split('.'));
	for (const o of A.upgrade_cards) {
		let source = lookup(fen, o.path.split('.'));
		elem_from_to(o.key, source, target.list);
	}
	let bres = target; //lookup(otree,target);
	bres.h = null;
	removeInPlace(fen.players[uplayer].buildings[type0], bres);
	fen.players[uplayer].buildings[type1].push(bres);
	ari_history_list([`${uplayer} upgrades a ${type0}`], 'upgrade');
	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	process_payment();
	setTimeout(ari_next_action, 1000); //ari_next_action();
}
function post_visit() {
	let [fen, A, uplayer, building, obuilding, owner] = [Z.fen, Z.A, Z.uplayer, Z.A.building, Z.A.obuilding, Z.A.buildingowner];
	let buildingtype = Z.A.building.o.type;
	let res = A.selected[0] == 0; //confirm('destroy the building?'); //TODO das muss besser werden!!!!!!!
	if (!res) {
		if (fen.players[owner].coins > 0) {
			fen.players[owner].coins -= 1;
			fen.players[uplayer].coins += 1;
		}
	} else {
		let list = obuilding.list;
		let correct_key = list[0];
		let rank = correct_key[0];
		while (list.length > 0) {
			let ckey = list[0];
			if (ckey[0] != rank) {
				elem_from_to_top(ckey, list, fen.deck_discard);
			} else {
				elem_from_to(ckey, list, fen.players[owner].hand);
			}
		}
		if (isdef(obuilding.h)) {
			fen.deck_discard.unshift(obuilding.h);
		}
		ari_reorg_discard(fen);
		let blist = lookup(fen, stringBeforeLast(building.path, '.').split('.')); //building.path.split('.')); //stringBeforeLast(ibuilding.path, '.').split('.'));, stringBeforeLast(building.path, '.').split('.'));
		removeInPlace(blist, obuilding);
	}
	ari_history_list([`${uplayer} visited ${buildingtype} of ${owner} resulting in ${res ? 'destruction' : 'payoff'}`,], 'visit');
	ari_next_action(fen, uplayer);
}
function proceed_to_newcards_selection() {
	let fen = Z.fen;
	let selorder = fen.selorder = sortByFuncDescending(fen.church_order, x => fen.players[x].tithes.val);
	fen.toBeSelected = jsCopy(selorder);
	fen.plorder = selorder;
	Z.turn = [selorder[0]];
	Z.stage = 19;
	take_turn_fen();
}
function process_auction() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	if (isEmpty(A.selected)) A.selected = [0];
	let playerbid = Number(valf(A.items[A.selected[0]].a, '0')); //A.selected.map(x => A.items[x]); 
	lookupSet(fen, ['auction', uplayer], playerbid);
	let iturn = fen.plorder.indexOf(uplayer) + 1;
	if (iturn >= fen.plorder.length) { //console.log('auction over!');
		let list = dict2list(fen.auction, 'uplayer');
		list = sortByDescending(list, 'value');
		let max = list[0].value;
		if (max == 0) {
			Z.stage = 4;
			Z.turn = [fen.plorder[0]];
			take_turn_fen();
			return;
		}
		let second = fen.second_most = list.length == 1 ? randomNumber(0, max) : list[1].value;
		Z.stage = 13;
		let maxplayers = fen.maxplayers = list.filter(x => x.value == max).map(x => x.uplayer);
		Z.turn = [maxplayers[0]];
		for (const plname of plorder) {
			ari_history_list([`${plname} bids ${fen.auction[plname]}`], 'auction');
		}
		ari_history_list([`auction winner${if_plural(fen.maxplayers.length)}: ${fen.maxplayers.join(', ')} (price: ${fen.second_most} coin)`], 'auction');
	} else {
		Z.turn = [fen.plorder[iturn]];
	}
	take_turn_fen(); //wenn send mache muss ich die ui nicht korrigieren!
}
function process_blackmail() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	console.log('selected building to blackmail:', item);
	let building_owner = stringAfter(item.o.path, '.'); building_owner = stringBefore(building_owner, '.');
	let path = item.o.path;
	fen.blackmail = { blackmailer: uplayer, blackmailed: building_owner, payment: A.payment, building_path: path };
	let fenbuilding = lookup(fen, path.split('.'));
	console.log('blackmail:', fen.blackmail);
	fenbuilding.isblackmailed = true;
	ari_history_list([`${uplayer} is blackmailing ${building_owner}`], 'blackmail');
	[Z.stage, Z.turn] = [33, [building_owner]];
	console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh')
	process_payment();
	setTimeout(take_turn_fen, 1000); //take_turn_fen();
}
function process_command() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let item = A.last_selected;
	if (nundef(item)) { post_pass(); return; }
	A.selected = [item.index];
	let a = A.items[A.selected[0]];
	A.command = a.key;
	ari_pre_action();
}
function process_commission() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.commission = A.items[A.selected[0]];
	if (A.commission.similar.length > 1) {
		Z.stage = 37;
	} else {
		A.commission_stall_item = A.commission.similar[0];
		Z.stage = 16;
	}
	ari_pre_action();
}
function process_commission_stall() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	console.log('process_commission_stall selected', A.selected, 'item', A.items[A.selected[0]]);
	Z.A.commission_stall_item = A.items[A.selected[0]];
	Z.stage = 16;
	ari_pre_action();
}
function process_downgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	A.building = A.items[A.selected[0]];
	fen.stage = Z.stage = 103;
	let items = ui_get_hidden_building_items(A.building.o);
	items.map(x => face_up(x.o));
	A.possible_downgrade_cards = items;
	ari_pre_action();
}
function process_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let cards = item.o.items;
	cards.map(x => face_up(x))
	weiter_process_inspect();
}
function process_journey() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	if (isEmpty(A.selected)) {
		if (nundef(fen.passed)) fen.passed = []; fen.passed.push(uplayer);
		[Z.stage, Z.turn] = set_journey_or_stall_stage(fen, Z.options, Z.phase); //set_nextplayer_after_journey();
		take_turn_fen();
		return;
	}
	let sel = A.selected.map(x => A.items[x].key);
	let [carditems, journeyitem, jlegal] = check_correct_journey(A, fen, uplayer);
	if (!carditems) return;
	delete fen.passed; //at this point, a player has selected successful journey so all players can enter journey round again!
	[A.carditems, A.journeyitem, A.jlegal] = [carditems, journeyitem, jlegal];
	Z.stage = A.journeyitem ? 30 : 31;
	ari_pre_action();
}
function process_payment() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.payment;
	is_coin_pay = nundef(item.o);
	if (is_coin_pay) a2_pay_with_coin(uplayer); else a2_pay_with_card(item);
	ari_history_list(get_pay_history(is_coin_pay ? 'coin' : item.o.key, uplayer), 'payment');
	A.payment_complete = true;
	return is_coin_pay;
}
function process_rumor() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let items = A.selected.map(x => A.items[x]);
	let building = firstCond(items, x => x.path.includes('building'));
	let rumor = firstCond(items, x => !x.path.includes('building'));
	if (nundef(building) || nundef(rumor)) {
		select_error('you must select exactly one building and one rumor card!');
		return;
	}
	let fenbuilding = lookup(fen, building.path.split('.'));
	lookupAddToList(fenbuilding, ['rumors'], rumor.key);
	removeInPlace(fen.players[uplayer].rumors, rumor.key);
	ari_history_list([`${uplayer} added rumor to ${ari_get_building_type(fenbuilding)}`,], 'rumor');
	ari_next_action(fen, uplayer);
}
function process_rumor_discard() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	console.log('.........items', A.items, A.selected, item);
	let rumor = item.key;
	removeInPlace(fen.players[uplayer].rumors, rumor);
	ari_history_list([`building is correct! ${uplayer} had to discard rumor (${rumor})`], 'rumor');
	ari_next_action();
}
function process_rumors_setup() {
	let [fen, A, uplayer, plorder, data] = [Z.fen, Z.A, Z.uplayer, Z.plorder, Z.uplayer_data];
	let items = A.selected.map(x => A.items[x]);
	let receiver = firstCond(items, x => plorder.includes(x.key)).key;
	let rumor = firstCond(items, x => !plorder.includes(x.key));
	if (nundef(receiver) || nundef(rumor)) {
		select_error('you must select exactly one player and one rumor card!');
		return;
	}
	assertion(isdef(data), 'no data for player ' + uplayer); //	sss(); //console.log('data',data);
	rumor_update_playerdata(data, receiver, rumor);
	let playerdata_complete = rumor_playerdata_complete();
	if (playerdata_complete) {
		Z.turn = [Z.host];
		Z.stage = 105; //'next_rumors_setup_stage';
		clear_transaction();
		take_turn_fen_write();
	} else if (isEmpty(data.state.remaining)) {
		clear_transaction();
		take_turn_write();
	} else {
		add_transaction('rumorsetup');
		take_turn_write();
	}
}
function process_upgrade() {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let n = A.selected.length;
	if (n > 2 || n == 2 && !has_farm(uplayer)) {
		select_error('too many cards selected!');
		return;
	} else if (n == 0) {
		select_error('please select hand or stall card(s) to upgrade!');
		return;
	}
	A.upgrade_cards = A.selected.map(x => A.items[x]);
	Z.stage = fen.stage = 102;
	ari_pre_action();
}
function process_visit() {
	alert('NOT IMPLEMENTED!');
	process_payment();
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let item = A.items[A.selected[0]];
	let obuilding = lookup(fen, item.path.split('.'));
	let parts = item.path.split('.');
	let owner = parts[1];
	if (isdef(obuilding.schweine)) {
		Z.stage = 46;
		A.building = item;
		A.obuilding = obuilding;
		A.buildingowner = owner;
		ari_pre_action();
		return;
	} else {
		let cards = item.o.items;
		let key = cards[0].rank;
		for (const c of cards) {
			if (c.rank != key) { schweine = true; schweine = c.key; face_up(c); break; }
		}
		if (schweine) {
			if (fen.players[owner].coins > 0) {
				fen.players[owner].coins--;
				fen.players[uplayer].coins++;
			}
			let b = lookup(fen, item.path.split('.'));
			b.schweine = schweine;
		}
		ari_history_list([
			`${uplayer} visited ${ari_get_building_type(obuilding)} of ${owner} resulting in ${schweine ? 'schweine' : 'ok'} ${ari_get_building_type(obuilding)}`,
		], 'visit');
	}
}
function q_mirror_fen() {
	let fen = Z.fen;
	for (const prop of arguments) {
		let ui = UI[prop];
		fen[prop] = ui.list;
	}
	qanim();
}
function q_move_topmost(uideck, uito) {
	let topmost = pop_top(uideck); //pop_deck(uideck);
	let dfrom = iDiv(topmost);
	dfrom.remove();
	dfrom.style.position = 'static';
	dfrom.style.zIndex = 0;
	uito.items.push(topmost);
	uito.list = uito.items.map(x => x.key);
	mAppend(uito.cardcontainer, dfrom);
	qanim();
}
function qanim() {
	if (!isEmpty(DA.qanim)) {
		let [f, params] = DA.qanim.shift();
		f(...params);
	} //else console.log('...anim q done!')
}
function qanim_flip(card, ms = 400) {
	mAnimate(iDiv(card), 'transform', [`scale(1,1)`, `scale(0,1)`],
		() => {
			if (card.faceUp) face_down(card); else face_up(card);
			mAnimate(iDiv(card), 'transform', [`scale(0,1)`, `scale(1,1)`], qanim, ms / 2, 'ease-in', 0, 'both');
		},
		ms / 2, 'ease-out', 0, 'both');
}
function qanim_flip_topmost(deck, ms = 400) {
	qanim_flip(deck.get_topcard(), ms);
}
function qanim_move(card, uifrom, uito, ms = 400) {
	let dfrom = iDiv(card);
	let dto = isEmpty(uito.items) ? uito.cardcontainer : iDiv(arrLast(uito.items));
	let dParent = find_common_ancestor(dfrom, dto);
	let rfrom = getRect(dfrom, dParent);
	let rto = getRect(dto, dParent);
	dfrom.style.zIndex = 100;
	let [offx, offy] = isEmpty(uito.items) ? [4, 4] : [card.w, 0];
	let a = mAnimate(dfrom, 'transform',
		[`translate(${offx + rto.l - rfrom.l}px, ${offy + rto.t - rfrom.t}px)`], qanim,
		ms, 'ease');
}
function qanim_move_topmost(uideck, uito, ms = 400) {
	let card = uideck.get_topcard();
	qanim_move(card, uideck, uito, ms);
}
function reindex_items(items) { let i = 0; items.map(x => { x.index = i; i++; }); }
function remove_tithes_from_play(fen, plname, tithes) {
	let pl = fen.players[plname];
	if (nundef(tithes)) tithes = pl.tithes.keys;
	for (const tithe of tithes) {
		if (tithe.path.includes('hand')) { removeInPlace(pl.hand, tithe.key); }
		else if (tithe.path.includes('stall')) { removeInPlace(pl.stall, tithe.key); }
	}
	ari_history_list([`${plname} tithes ${tithes.map(x => x.key).join(', ')}!`], 'tithe');
}
function remove_ui_items(items) {
	console.log('remove_ui_items', items);
	for (const item of items) {
		let card = item.o;
		make_card_unselectable(item);
		iDiv(item.o).remove();
	}
}
function reveal_church_cards() {
	let [fen, A, uplayer, plorder] = [Z.fen, Z.A, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	let uichurch = UI.church;
	let dOpenTable = UI.dOpenTable;
	let church_cards = uichurch.items;
	uichurch.container.remove();
	UI.church = uichurch = ui_type_market(fen.church, dOpenTable, { maleft: 25 }, 'church', 'church');
}
function rumor_playerdata_complete() {
	for (const pldata of Z.playerdata) {
		if (isEmpty(pldata.state) || !isEmpty(pldata.state.remaining)) return false;
	}
	return true;
}
function rumor_update_playerdata(data, receiver, rumor) {
	let remaining = arrMinus(data.state.remaining, rumor.key); //fen.players[uplayer].rumors = arrMinus(fen.players[uplayer].rumors, rumor.key);
	lookupAddToList(data, ['state', 'di', receiver], rumor.key);
	lookupAddToList(data, ['state', 'receivers'], receiver);
	lookupSetOverride(data, ['state', 'remaining'], remaining);
	Z.state = data.state; //genau DAS muss gesendet werden!!!!!
}
function too_many_string_items(A) { return A.items.filter(x => nundef(x.o)).length >= 8; }
function turn_new_schwein_up(schwein, fenbuilding, uibuilding) {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let is_first_schwein = isEmpty(fenbuilding.schweine);
	add_schwein(schwein, fenbuilding, uibuilding);
	ari_history_list([`${uplayer} reveals a schwein!`], 'inspect');
	if (is_first_schwein) {
		console.log('unique AND first new schwein');
		show_instruction('found schwein - both players get a rumor!');
		let owner = stringAfter(uibuilding.path, '.');
		owner = stringBefore(owner, '.');
		console.log('owner', owner, 'uplayer', uplayer);
		A.owner = owner;
		ari_open_rumors(32);
	} else {
		console.log('unique new schwein (gibt schon schweine)')
		show_instruction('found schwein - you gain a rumor!');
		let rumor = fen.deck_rumors[0]; fen.deck_rumors.shift();
		fen.players[uplayer].rumors.push(rumor);
		ari_history_list([`${uplayer} inspects a schweine building!`], 'inspect');
		ari_next_action();
	}
}
function ui_get_all_hidden_building_items(uplayer) {
	let items = [];
	for (const gb of UI.players[uplayer].buildinglist) {
		items = items.concat(ui_get_hidden_building_items(gb));
	}
	reindex_items(items);
	return items;
}
function ui_get_blackmailed_items() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let commands = ['accept', 'reject'];
	let rumors = fen.players[uplayer].rumors;
	let b = path2fen(fen, fen.blackmail.building_path);
	if (nundef(b.lead)) b.lead = b.list[0];
	if (isList(rumors) && firstCond(rumors, x => x[0] == b.lead[0])) {
		commands.push('defend');
	}
	return ui_get_string_items(commands);
}
function ui_get_build_items(uplayer, except) {
	let items = ui_get_hand_and_stall_items(uplayer);
	if (is_card(except)) items = items.filter(x => x.key != except.key);
	reindex_items(items);
	return items;
}
function ui_get_building_items(uplayer) {
	let gblist = UI.players[uplayer].buildinglist;
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_building_items_of_type(uplayer, types = ['farm', 'estate', 'chateau']) {
	let gblist = UI.players[uplayer].buildinglist.filter(x => types.includes(x.type));
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_buildings(gblist) {
	let items = [], i = 0;
	for (const o of gblist) {
		let name = o.type + ' ' + (o.list[0][0] == 'T' ? '10' : o.list[0][0]);
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_church_items(uplayer) {
	let fen = Z.fen;
	let items = [], i = 0;
	let church = UI.church;
	for (const o of church.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: church.path, index: i };
		i++;
		items.push(item);
	}
	let candidates = fen.candidates = arrMinus(fen.toBeSelected, uplayer);
	if (candidates.length > 1) {
		let player_items = ui_get_string_items(candidates);
		items = items.concat(player_items);
		reindex_items(items);
	}
	return items;
}
function ui_get_coin_amounts(uplayer) {
	let items = [];
	for (let i = 0; i <= Z.fen.players[uplayer].coins; i++) {
		let cmd = '' + i;
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		items.push(item);
	}
	return items;
}
function ui_get_commands(uplayer) {
	let avail = ari_get_actions(uplayer);
	let items = [], i = 0;
	for (const cmd of avail) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_commission_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.players[uplayer].commissions;
	let stall = ui_get_stall_items(uplayer);
	for (const o of comm.items) {
		let rank = o.key[0];
		let similar = firstCond(stall, x => x.key[0] == rank);
		if (!similar) continue;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i, similar: stall.filter(x => x.key[0] == rank) }; // similar: similar };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_commission_new_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.open_commissions;
	for (const o of comm.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let topdeck = UI.deck_commission.get_topcard();
	items.push({ o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: 'deck_commission', index: i });
	return items;
}
function ui_get_commission_stall_items() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	console.log('ui_get_commission_stall_items similar', A.commission.similar);
	let items = A.commission.similar;
	reindex_items(items);
	return items;
}
function ui_get_deck_item(uideck) {
	let topdeck = uideck.get_topcard();
	let item = { o: topdeck, a: topdeck.key, key: topdeck.key, friendly: topdeck.short, path: uideck.path, index: 0 };
	return item;
}
function ui_get_endgame(uplayer) { return ui_get_string_items(['end game', 'go on']); }
function ui_get_other_buildings(uplayer) {
	let items = [];
	for (const plname of Z.plorder) {
		if (plname == uplayer) continue;
		items = items.concat(ui_get_buildings(UI.players[plname].buildinglist));
	}
	reindex_items(items);
	return items;
}
function ui_get_other_buildings_and_rumors(uplayer) {
	let items = ui_get_other_buildings(uplayer);
	items = items.concat(ui_get_rumors_items(uplayer));
	reindex_items(items);
	return items;
}
function ui_get_other_buildings_with_rumors(uplayer) {
	let items = [];
	for (const plname of Z.plorder) {
		if (plname == uplayer) continue;
		items = items.concat(ui_get_buildings(UI.players[plname].buildinglist.filter(x => !isEmpty(x.rumors))));
	}
	reindex_items(items);
	return items;
}
function ui_get_payment_items(pay_letter) {
	let [fen, A, uplayer] = [Z.fen, Z.A, Z.uplayer];
	let items = ui_get_hand_and_stall_items(uplayer); //gets all hand and stall cards
	let n = items.length;
	items = items.filter(x => x.key[0] == pay_letter);
	if (n == 4 && A.command == 'build') items = []; //das ist damit min building items gewahrt bleibt!
	if (n == 1 && A.command == 'upgrade') items = []; //das ist damit min upgrade items gewahrt bleibt!
	if (fen.players[uplayer].coins > 0 && fen.phase[0].toUpperCase() == pay_letter) {
		items.push({ o: null, a: 'coin', key: 'coin', friendly: 'coin', path: null });
	}
	let i = 0; items.map(x => { x.index = i; i++; }); //need to reindex when concat!!!
	return items;
}
function ui_get_rumors_and_players_items(uplayer) {
	let items = [], i = 0;
	let comm = UI.players[uplayer].rumors;
	let [data, pl] = [Z.uplayer_data, Z.pl];
	assertion(isdef(data), 'no data for player ' + uplayer);
	if (!isDict(data.state)) data.state = { remaining: jsCopy(pl.rumors), receivers: [], di: {} };
	let rem = data.state.remaining;
	for (const k of rem) {
		let o = firstCond(comm.items, x => x.key == k);
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	let players = [];
	let receivers = data.state.receivers;
	for (const plname in UI.players) {
		if (plname == uplayer || receivers.includes(plname)) continue;
		players.push(plname);
	}
	items = items.concat(ui_get_string_items(players));
	reindex_items(items);
	return items;
}
function ui_get_rumors_items(uplayer) {
	let items = [], i = 0;
	let rum = UI.players[uplayer].rumors;
	for (const o of rum.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: rum.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_schweine_candidates(uibuilding) {
	let items = ui_get_hidden_building_items(uibuilding);
	items = items.filter(x => x.o.key[0] != uibuilding.keycard.key[0]);
	reindex_items(items);
	return items;
}
function ui_get_stall_items(uplayer) {
	let items = [], i = 0;
	let stall = UI.players[uplayer].stall;
	for (const o of stall.items) {
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: stall.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_string_items(commands) {
	let items = [], i = 0;
	for (const cmd of commands) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_top_rumors() {
	let items = [], i = 0;
	for (const o of UI.rumor_top.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `rumor_top`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_trade_items(uplayer) {
	let items = ui_get_market_items(uplayer);
	items = items.concat(ui_get_stall_items(uplayer));//zuerst eigene!
	for (const plname of Z.fen.plorder) {
		if (plname != uplayer) items = items.concat(ui_get_stall_items(plname));
	}
	reindex_items(items);
	return items;
}
function weiter_process_inspect() {
	let [stage, A, fen, uplayer] = [Z.stage, Z.A, Z.fen, Z.uplayer];
	let item = A.items[A.selected[0]];
	let uibuilding = A.uibuilding = item.o;
	let fenbuilding = A.fenbuilding = lookup(fen, uibuilding.path.split('.'));
	let key = uibuilding.keycard.key;
	let cards = uibuilding.items;
	let schweine_cand = [];
	for (let i = 1; i < cards.length; i++) {
		if (fenbuilding.schweine.includes(i)) continue; //if index i is already in schweine, skip this card
		let card = cards[i];
		if (card.key == key) continue;
		assertion(i == card.index, 'wrong card index!!!!')
		schweine_cand.push(card); //add this card to schweine_cand
	}
	if (schweine_cand.length > 1) {
		Z.stage = 38;
		ari_pre_action();
	} else if (schweine_cand.length == 1) {
		setTimeout(() => turn_new_schwein_up(schweine_cand[0], fenbuilding, uibuilding), 3000);
	} else if (isEmpty(fenbuilding.schweine)) {
		Z.stage = 29;
		ari_history_list([`${uplayer} inspects a correct building`], 'inspect');
		show_instruction('the building is CORRECT - You loose 1 rumor')
		setTimeout(ari_pre_action, 2000); //ari_pre_action();
	} else {
		let rumor = fen.deck_rumors[0]; fen.deck_rumors.shift();
		fen.players[uplayer].rumors.push(rumor);
		show_instruction('no additional schwein has been found - you gain 1 rumor')
		ari_history_list([`${uplayer} inspects a schweine!`], 'inspect');
		setTimeout(ari_next_action, 2000);
	}
}
//#endregion aristo

//#region bluff
function apply_skin2(item) {
	let d = item.container; mCenterFlex(d); mStyle(d, { position: 'relative', w: 400 }); //,bg:'pink'});
	let h = 24;
	let top = `calc( 50% - ${h / 2}px )`
	mText(item.label + ':', d, { position: 'absolute', left: 0, top: top, h: h });
	mText(`<span style="font-size:20px;margin:10px;color:red">${item.content}</span>`, d);
	item.button = mButton(item.caption, item.handler, d, { position: 'absolute', right: 0, top: top, h: h, w: 80 }, ['selectbutton', 'enabled']);
}
function apply_skin3(item) {
	let d = item.container; mCenterCenterFlex(d); mStyle(d, { position: 'relative', w: 400 }); //,bg:'pink'});
	let h = 24;
	let top = `calc( 50% - ${h / 2}px )`
	mText(item.label + ':', d, { position: 'absolute', left: 0, top: top, h: h });
	let panel = UI.dAnzeige = item.panel = mDiv(d, { bg: '#ffffff80', padding: '4px 12px', w: 200, align: 'center', rounding: 8 });
	let words = toWords(item.content)
	let panelitems = UI.panelItems = item.panelitems = [];
	for (let i = 0; i < 4; i++) {
		let text = valf(words[i], '');
		let dw = mDiv(panel, { hpadding: 4, display: 'inline', fz: 22, weight: 'bold', fg: 'red' }, `dbid_${i}`, text);
		panelitems.push({ div: dw, index: i, initial: text, state: 'unselected' })
	}
	let b = item.buttonX = mDiv(panel, { fz: 10, hpadding: 4, bg: 'white' }, null, 'CLR', 'enabled'); mPlace(b, 'tr', 2)
	b.onclick = bluff_clear_panel;
	item.button = mButton(item.caption, item.handler, d, { position: 'absolute', right: 0, top: top, h: h, w: 80 }, ['selectbutton', 'enabled']);
}
function bid_to_string(bid) { return bid.join(' '); }
function bluff() {
	const rankstr = '3456789TJQKA2';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: {}, stage: 'move', phase: '' };
		let num_cards_needed = players.length * options.max_handsize;
		let num_decks_needed = fen.num_decks = Math.ceil(num_cards_needed / 52);
		let deck = fen.deck = create_fen_deck('n', num_decks_needed);
		shuffle(deck);
		shuffle(fen.plorder);
		fen.turn = [fen.plorder[0]];
		for (const plname of fen.plorder) {
			let handsize = options.min_handsize;
			fen.players[plname] = {
				hand: deck_deal(deck, handsize),
				handsize: handsize,
				name: plname,
				color: get_user_color(plname),
			};
		}
		fen.stage = 0;
		return fen;
	}
	function clear_ack() { if (Z.stage == 1) { bluff_change_to_turn_round(); take_turn_fen(); } }
	function check_gameover(Z) { let pls = get_keys(Z.fen.players); if (pls.length < 2) Z.fen.winners = pls; return valf(Z.fen.winners, false); }
	function activate_ui() { bluff_activate_new(); }
	function present(dParent) { bluff_present(dParent); }
	function stats(dParent) { bluff_stats(dParent); }
	function state_info(dParent) { bluff_state(dParent); }
	return { rankstr, setup, activate_ui, check_gameover, clear_ack, present, state_info, stats };
}
function bluff_activate_new() {
	let [z, A, fen, stage, uplayer, ui, dt] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI, UI.dOpenTable];
	if (stage == 1) bluff_activate_stage1(); else { bluff_activate_stage0(); if (is_ai_player()) ai_move(1000); }
}
function bluff_activate_stage0() {
	let [z, A, fen, stage, uplayer, ui, dt] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI, UI.dOpenTable];
	if (isdef(fen.lastbid)) show(ui.currentBidItem.button);
	bluff_show_new_bid(dt);
	mLinebreak(dt, 10);
	bluff_button_panel1(dt, fen.newbid, 50);
}
function bluff_activate_stage1() {
	let [z, A, fen, stage, uplayer, ui, dt] = [Z, Z.A, Z.fen, Z.stage, Z.uplayer, UI, UI.dOpenTable];
	if (isdef(DA.ack) && isdef(DA.ack[uplayer])) { console.log('DA.ack', DA.ack); mText('...waiting for ack', dt); return; }
	if (isdef(ui.dHandsize)) mPulse(ui.dHandsize, 2000);
}
function bluff_ai() {
	let [A, fen, uplayer, pl] = [Z.A, Z.fen, Z.uplayer, Z.pl];
	const torank = { _: '_', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	const toword = { _: '_', '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	let words = get_keys(torank).slice(1); // words sind three, four, ..., king, ace
	let all_hand_cards = aggregate_elements(dict2list(fen.players, 'name'), 'hand'); // all cards in play
	let no_twos = all_hand_cards.filter(x => x[0] != '2'); // alle Karten ohne 2er
	let rankstr = '3456789TJQKA2';
	sortByRank(all_hand_cards, rankstr);
	let byrank = aggregate_player_hands_by_rank(fen);
	let rank_list = dict2list(byrank, 'rank');
	let unique_ranks = sortByRank(get_keys(byrank));
	let myranks = sortByRank(pl.hand.map(x => x[0]));
	let my_unique = unique_ranks.filter(x => myranks.includes(x));
	rank_list.map(x => { x.mine = myranks.includes(x.rank); x.irank = rankstr.indexOf(x.rank); x.i = x.irank + 100 * x.value; });
	rank_list = rank_list.filter(x => x.rank != '2');
	sortByDescending(rank_list, 'i');
	let maxcount = rank_list[0].value;
	let mymaxcount = rank_list.filter(x => x.mine)[0].value;
	let expected = all_hand_cards.length / 13; // auch 2er gibt es soviele!
	let nreason = Math.max(1, Math.round(expected * 2));
	let n_twos = all_hand_cards.filter(x => x[0] == '2').length;
	let have2 = firstCond(rank_list, x => x.rank == '2' && x.mine);
	return botbest(rank_list, maxcount, mymaxcount, expected, nreason, n_twos, have2, words, fen);
}
function bluff_button_panel1(dt, bid, sz) {
	let n = bid[0] == '_' ? 1 : Number(bid[0]);
	let arr1 = arrRange(n, n + 5);
	let arr2 = toLetters('3456789TJQKA');
	let arr3 = arrRange(0, 5);
	let arr4 = toLetters('3456789TJQKA');
	let dPanel = mDiv(dt, { gap: 5 });
	[d1, d2, d3, d4] = mColFlex(dPanel, [1, 2, 1, 2]);//,[YELLOW,ORANGE,RED,BLUE]);
	UI.dn1 = create_bluff_input1(d1, arr1, 1, sz, 0); d1.onmouseenter = () => iHigh(UI.panelItems[0]); d1.onmouseleave = () => iUnhigh(UI.panelItems[0]);
	UI.dr1 = create_bluff_input1(d2, arr2, 2, sz, 1); d2.onmouseenter = () => iHigh(UI.panelItems[1]); d2.onmouseleave = () => iUnhigh(UI.panelItems[1]);
	UI.dn2 = create_bluff_input1(d3, arr3, 1, sz, 2); d3.onmouseenter = () => iHigh(UI.panelItems[2]); d3.onmouseleave = () => iUnhigh(UI.panelItems[2]);
	UI.dr2 = create_bluff_input1(d4, arr4, 2, sz, 3); d4.onmouseenter = () => iHigh(UI.panelItems[3]); d4.onmouseleave = () => iUnhigh(UI.panelItems[3]);
}
function bluff_change_to_ack_round(fen, nextplayer) {
	[Z.stage, Z.turn] = [1, [get_admin_player(fen.plorder)]];
	fen.keeppolling = true;
	fen.nextturn = [nextplayer]; //next player after ack!
}
function bluff_change_to_turn_round() {
	let [fen, stage] = [Z.fen, Z.stage];
	assertion(stage == 1, "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");
	Z.stage = 0;
	Z.turn = fen.nextturn;
	Z.round += 1;
	for (const k of ['bidder', 'loser', 'aufheber', 'lastbid', 'lastbidder']) delete fen[k];
	for (const k of ['nextturn', 'keeppolling']) delete fen[k];
	for (const plname of fen.plorder) { delete fen.players[plname].lastbid; }
}
function bluff_clear_panel() {
	for (const item of UI.panelItems) {
		let d = iDiv(item);
		d.innerHTML = '_';
	}
	Z.fen.newbid = ['_', '_', '_', '_'];
}
function bluff_generate_random_bid() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	const di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let words = get_keys(di2).slice(1);
	let b = isdef(fen.lastbid) ? jsCopy(fen.lastbid) : null;
	if (isdef(b)) {
		assertion(b[0] >= (b[2] == '_' ? 0 : b[2]), 'bluff_generate_random_bid: bid not formatted correctly!!!!!!!', b)
		let nmax = calc_reasonable_max(fen);
		let n = b[0] == '_' ? 1 : Number(b[0]);
		let done = false;
		if (n > nmax + 1) {
			const di = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
			let rankstr = '3456789TJQKA';
			let w1 = di2[b[1]];
			let idx = isdef(w1) ? rankstr.indexOf(w1) : -1;
			if (idx >= 0 && idx < rankstr.length - 2) {
				let r = rankstr[idx + 1];
				b[1] = di[r];
				done = true;
			}
		}
		if (!done) {
			if (b[3] == '_') { b[2] = 1; b[3] = rChoose(words, 1, x => x != b[1]); }
			else if (b[0] > b[2]) { b[2] += 1; } //console.log('new bid is now:', b); }
			else { b[0] += coin(80) ? 1 : 2; if (coin()) b[2] = b[3] = '_'; }
		}
	} else {
		let nmax = calc_reasonable_max(fen);
		let nmin = Math.max(nmax - 1, 1);
		let arr_nmax = arrRange(1, nmax);
		let arr_nmin = arrRange(1, nmin);
		b = [rChoose(arr_nmax), rChoose(words), rChoose(arr_nmin), rChoose(words)];
		if (b[1] == b[3]) b[3] = rChoose(words, 1, x => x != b[1]);
		if (coin()) b[2] = b[3] = '_';
	}
	fen.newbid = b;
	UI.dAnzeige.innerHTML = bid_to_string(b);
}
function bluff_present(dParent) {
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	let [fen, uplayer, ui, stage, dt] = [Z.fen, Z.uplayer, UI, Z.stage, dOpenTable];
	clearElement(dt); mCenterFlex(dt);
	if (stage == 1) { DA.no_shield = true; } else { DA.ack = {}; DA.no_shield = false; }
	bluff_stats(dt);
	mLinebreak(dt, 10);
	bluff_show_cards(dt);
	mLinebreak(dt, 4);
	let item = ui.currentBidItem = bluff_show_current_bid(dt);
	hide(item.button);
	mLinebreak(dt, 10);
	if (stage == 1) {
		show_waiting_for_ack_message();
		let loser = fen.loser;
		let msg1 = fen.war_drin ? 'war drin!' : 'war NICHT drin!!!';
		let msg2 = isdef(fen.players[loser]) ? `${capitalize(loser)} will get ${fen.players[loser].handsize} cards!` : `${capitalize(loser)} is out!`;
		mText(`<span style="color:red">${msg1} ${msg2}</span>`, dt, { fz: 22 });
		mLinebreak(dt, 4);
	}
}
function bluff_show_cards(dt) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let pl = fen.players[uplayer], upl = ui.players[uplayer] = {};
	mText(stage == 1 ? "all players' cards: " : "player's hand: ", dt); mLinebreak(dt, 2);
	let cards = stage == 1 ? fen.akku : pl.hand;
	cards = sort_cards(cards, false, 'CDSH', true, '3456789TJQKA2'); // immer by rank!
	let hand = upl.hand = ui_type_hand(cards, dt, { hmin: 160 }, null, '', ckey => ari_get_card(ckey, 150));
	let uname_plays = isdef(fen.players[Z.uname]);;//Z.turn.includes(Z.uname);
	let ishidden = stage == 0 && uname_plays && uplayer != Z.uname && Z.mode != 'hotseat';
	if (ishidden) { hand.items.map(x => face_down(x)); }
}
function bluff_show_current_bid(dt) {
	let fen = Z.fen;
	let bid = fen.oldbid = valf(fen.lastbid, ['_', '_', '_', '_']);
	let d = mDiv(dt);
	let content = `${bid_to_string(bid)}`;
	let item = { container: d, label: 'current bid', content: content, caption: 'geht hoch!', handler: handle_gehtHoch };
	apply_skin2(item);
	return item;
}
function bluff_show_new_bid(dt) {
	let fen = Z.fen;
	let bid = fen.oldbid = valf(fen.lastbid, ['_', '_', '_', '_']);
	fen.newbid = jsCopy(bid); // ['4', 'queen', '3', 'jack'];
	let d = mDiv(dt);
	let content = `${bid_to_string(bid)}`;
	let item = { container: d, label: 'YOUR bid', content: content, caption: 'BID', handler: handle_bid };
	apply_skin3(item);
}
function bluff_state(dParent) {
	let user_html = get_user_pic_html(Z.uplayer, 30);
	dParent.innerHTML = `Round ${Z.round}:&nbsp;player: ${user_html} `;
}
function bluff_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent, {}, { 'border-width': 1, margin: 10, wmax: 180 });
	let fen = Z.fen;
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		if (fen.turn.includes(plname)) {
			let dh = show_hourglass(plname, d, 20, { left: -4, top: 0 });
		}
		let dhz = mDiv(d, { fg: pl.handsize == Z.options.max_handsize ? 'yellow' : 'white' }, null, `hand: ${pl.handsize}`); mLinebreak(d);
		if (plname == fen.loser) UI.dHandsize = dhz;
		let elem = mDiv(d, { fg: plname == fen.lastbidder ? 'red' : 'white' }, null, `${valf(pl.lastbid, ['_']).join(' ')}`);
		let szhand = getSizeNeeded(dhz);
		let sz = getSizeNeeded(elem);
		let w = Math.max(szhand.w + 20, sz.w + 20, 80);
		mStyle(d, { w: w }); //, bg: 'blue' });
		mLinebreak(d);
	}
	return player_stat_items[Z.uplayer];
}
function botbest(list, max, mmax, exp, nreas, n2, have2, words, fen) {
	if (nundef(DA.ctrandom)) DA.ctrandom = 1; console.log(`${DA.ctrandom++}: ${Z.uplayer} using strategy`, Z.strategy)
	let bot = window[`bot_${Z.strategy}`];
	let [b, f] = bot(list, max, mmax, exp, nreas, n2, have2, words, fen);
	assertion(!b || b[2] != 0, 'bot returned bid with n2==0');
	return [b, f];
}
function calc_bid_minus_cards(fen, bid) {
	let di2 = { _: '_', three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 'T', jack: 'J', queen: 'Q', king: 'K', ace: 'A' };
	let di_ranks = aggregate_player_hands_by_rank(fen);
	let [brauch1, r1, brauch2, r2] = bid;
	[r1, r2] = [di2[r1], di2[r2]];
	if (brauch1 == '_') brauch1 = 0;
	if (brauch2 == '_') brauch2 = 0;
	let hab1 = valf(di_ranks[r1], 0);
	let hab2 = valf(di_ranks[r2], 0);
	let wildcards = valf(di_ranks['2'], 0);
	let diff1 = Math.max(0, brauch1 - hab1);
	let diff2 = Math.max(0, brauch2 - hab2);
	return diff1 + diff2 - wildcards;
}
function calc_reasonable_max(fen) {
	let allcards = [];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		allcards = allcards.concat(pl.hand);
	}
	let ncards = allcards.length;
	let nmax = Math.floor(ncards / 13) + 1;
	return nmax;
}
function create_bluff_input1(dParent, arr, units = 1, sz, index) {
	let d = mDiv(dParent, { gap: 5, w: units * sz * 1.35 }); mCenterFlex(d);
	for (const a of arr) {
		let da = mDiv(d, { align: 'center', wmin: 20, padding: 4, cursor: 'pointer', rounding: 4, bg: units == 1 ? '#e4914b' : 'sienna', fg: 'contrast' }, null, a == 'T' ? '10' : a); //units == 1?a:di[a]);
		da.onclick = () => input_to_anzeige1(a, index);
	}
	return d;
}
function handle_bid() {
	let [z, A, fen, uplayer, ui] = [Z, Z.A, Z.fen, Z.uplayer, UI];
	let oldbid = jsCopy(fen.oldbid);
	let bid = jsCopy(fen.newbid);
	let ranks = '23456789TJQKA';
	bid = normalize_bid(bid);
	let higher = is_bid_higher_than(bid, oldbid);
	if (bid[2] == 0) bid[2] = '_';
	if (!higher) {
		select_error('the bid you entered is not high enough!');
	} else {
		fen.lastbid = fen.players[uplayer].lastbid = bid; //fen.newbid;
		fen.lastbidder = uplayer;
		delete fen.oldbid; delete fen.newbid;
		Z.turn = [get_next_player(Z, uplayer)];
		take_turn_fen();
	}
}
function handle_gehtHoch() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let [bid, bidder] = [fen.lastbid, fen.lastbidder];
	let diff = calc_bid_minus_cards(fen, bid); // hier wird schon der akku gemacht!!! ich kann also jetzt die cards renewen!!!
	let aufheber = uplayer;
	let loser = diff > 0 ? bidder : aufheber;
	let war_drin = fen.war_drin = diff <= 0;
	let loser_handsize = inc_handsize(fen, loser);
	new_deal(fen);
	let nextplayer;
	if (loser_handsize > Z.options.max_handsize) {
		nextplayer = get_next_player(Z, loser)
		let plorder = fen.plorder = remove_player(fen, loser);
	} else {
		nextplayer = loser;
	}
	fen.loser = loser; fen.bidder = bidder; fen.aufheber = aufheber;
	bluff_change_to_ack_round(fen, nextplayer);
	take_turn_fen();
}
function iHigh(item) { let d = iDiv(item); mStyle(d, { bg: 'darkgray' }); }
function inc_handsize(fen, uname) {
	let pl = fen.players[uname];
	pl.handsize = Number(pl.handsize) + 1;
	return pl.handsize;
}
function input_to_anzeige1(caption, index) {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	const di = { '3': 'three', '4': 'four', '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', T: 'ten', J: 'jack', Q: 'queen', K: 'king', A: 'ace' };
	let bid = fen.newbid;
	if (index == 0) {
		bid[0] = Number(caption);
		if (bid[0] == 0) {
			bid[0] = '_'; bid[1] = '_';
		} else if (bid[1] == '_') {
			let hand = fen.players[uplayer].hand;
			let c1 = arrLast(hand); //highest
			let r = c1[0];
			if (r == '2') r = bid[3] == 'ace' ? 'K' : 'A';
			if (di[r] == bid[3]) bid[1] = bid[3] == 'three' ? 'four' : 'three'; else bid[1] = di[r];
		}
	} else if (index == 1) {
		bid[1] = di[caption];
		if (bid[0] == '_') bid[0] = 1;
		if (bid[3] == bid[1]) { bid[0] = bid[0] + bid[2]; bid[2] = bid[3] = '_'; }
	} else if (index == 2) {
		bid[2] = Number(caption);
		if (bid[2] == 0) {
			bid[2] = '_'; bid[3] = '_';
		} else if (bid[3] == '_') {
			let hand = fen.players[uplayer].hand;
			let c1 = hand[0];
			let r = c1[0];
			if (r == '2') r = bid[1] == 'ace' ? 'K' : 'A';
			if (di[r] == bid[1]) bid[3] = bid[1] == 'three' ? 'four' : 'three'; else bid[3] = di[r];
		}
	} else {
		bid[3] = di[caption];
		if (bid[2] == '_') bid[2] = 1;
		if (bid[3] == bid[1]) { bid[0] = bid[0] + bid[2]; bid[1] = bid[3]; bid[2] = bid[3] = '_'; }
	}
	for (let i = 0; i < 4; i++)	iDiv(UI.panelItems[i]).innerHTML = bid[i];
}
function is_bid_higher_than(bid, oldbid) {
	bid = jsCopy(bid);
	if (bid[0] == '_') bid[0] = 0;
	if (bid[2] == '_') bid[2] = 0;
	if (oldbid[0] == '_') oldbid[0] = 0;
	if (oldbid[2] == '_') oldbid[2] = 0;
	let higher = bid[0] > oldbid[0]
		|| bid[0] == oldbid[0] && is_higher_ranked_name(bid[1], oldbid[1])
		|| bid[0] == oldbid[0] && bid[1] == oldbid[1] && bid[2] > oldbid[2]
		|| bid[0] == oldbid[0] && bid[1] == oldbid[1] && bid[2] == oldbid[2] && is_higher_ranked_name(bid[3], oldbid[3]);
	return higher;
}
function is_higher_ranked_name(f1, f2) {
	let di2 = { _: 0, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, jack: 11, queen: 12, king: 13, ace: 14 };
	return di2[f1] > di2[f2];
}
function iUnhigh(item) { let d = iDiv(item); mStyle(d, { bg: 'transparent' }); }
function new_deal(fen) {
	let deck = fen.deck = create_fen_deck('n', fen.num_decks);
	shuffle(deck);
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let handsize = pl.handsize;
		pl.hand = deck_deal(deck, handsize);
	}
}
function normalize_bid(bid) {
	let need_to_sort = bid[0] == '_' && bid[2] != '_'
		|| bid[2] != '_' && bid[2] > bid[0]
		|| bid[2] == bid[0] && is_higher_ranked_name(bid[3], bid[1]);
	if (need_to_sort) {
		let [h0, h1] = [bid[0], bid[1]];
		[bid[0], bid[1]] = [bid[2], bid[3]];
		[bid[2], bid[3]] = [h0, h1];
	}
	return bid;
}
//#endregion bluff

//#region fritz
function add_card_to_group(card, oldgroup, oldindex, targetcard, targetgroup) {
	card.groupid = targetgroup.id;
	if (card.source == 'hand') {
		let hand = UI.players[Z.uplayer].hand;
		removeInPlace(hand.items, card);
	}
	card.source = 'group';
	mDroppable(iDiv(card), drop_card_fritz, dragover_fritz);
	if (nundef(targetcard)) { //} || targetcard.id == arrLast(targetgroup.ids)) {
		targetgroup.ids.push(card.id);
		mAppend(iDiv(targetgroup), iDiv(card));
	} else {
		let index = targetgroup.ids.indexOf(targetcard.id) + 1;
		targetgroup.ids.splice(index, 0, card.id);
		mClear(iDiv(targetgroup));
		for (let i = 0; i < targetgroup.ids.length; i++) {
			let c = Items[targetgroup.ids[i]];
			mAppend(iDiv(targetgroup), iDiv(c));
		}
	}
	resplay_container(targetgroup);
}
function calc_fritz_score() {
	let [round, plorder, stage, A, fen, uplayer] = [Z.round, Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	for (const plname of fen.roundorder) {
		let pl = fen.players[plname];
		if (nundef(pl.score)) pl.score = 0;
		else pl.score += calc_hand_value(pl.hand.concat(pl.loosecards), fritz_get_card);
	}
}
function cleanup_or_resplay(oldgroup) {
	if (isdef(oldgroup) && isEmpty(oldgroup.ids)) {
		let oldgroupid = oldgroup.id;
		mRemove(iDiv(oldgroup));
		removeInPlace(DA.TJ, oldgroup);
		delete Items[oldgroupid];
	} else if (isdef(oldgroup)) { oldgroup.ov = .3222; resplay_container(oldgroup, .3222) }
}
function clear_quick_buttons() {
	if (isdef(DA.bQuick)) { DA.bQuick.remove(); delete DA.bQuick; }
}
function deck_deal_safe_fritz(fen, plname, n = 1) {
	if (fen.deck.length < n) {
		fen.deck = create_fen_deck('n', fen.num_decks, 0);
		fen.loosecards.push('*Hn'); //1 jolly kommt dazu!
	}
	let new_cards = deck_deal(fen.deck, n);
	fen.players[plname].hand.push(...new_cards);
	new_cards.map(x => lookupAddToList(fen.players[plname], ['newcards'], x));
	return new_cards;
}
function drag(ev) { clear_quick_buttons(); ev.dataTransfer.setData("text", ev.target.id); }
function dragover_fritz(ev) {
	ev.preventDefault();
	ev.dataTransfer.dropEffect = "move"; //macht so ein kleines kastel, 'copy' (default) macht ein kastel mit einem +
	let target_id = evToClosestId(ev);
	let d = mBy(target_id);
	mStyle(d, { bg: 'red' });
	if (target_id == 'dOpenTable') {
	} else if (isdef(Items[target_id])) {
		let targetcard = Items[target_id];
		let targetgroup = Items[targetcard.groupid];
	} else {
	}
}
function drop_card_fritz(ev) {
	ev.preventDefault();
	evNoBubble(ev);
	if (isdef(mBy('ddhint'))) mRemove(mBy('ddhint')); //removes the text saying 'drag and drop cards here'
	var data = ev.dataTransfer.getData("text");
	let card = Items[data];
	let target_id = evToClosestId(ev);
	if (card.source == 'discard') {
		let [discard, loose] = arrSplitAtIndex(UI.deck_discard.items, card.index);
		c = loose[0];
		loose = loose.slice(1);
		assertion(c == card, 'NEEEEEEEE');
		for (const c of loose) {
			console.log('card', c.key, 'source', c.source)
			if (c.source == 'discard') frnew(c, { target: 'dummy' });
		}
	}
	if (target_id == 'dOpenTable') {
		frnew(card, ev);
	} else if (isdef(Items[target_id])) {
		let targetcard = Items[target_id];
		let targetgroup = Items[targetcard.groupid];
		fradd(card, targetgroup, targetcard);
	} else {
	}
}
function end_of_round_fritz(plname) {
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	calc_fritz_score();
	ari_history_list([`${plname} wins the round`], 'round over');
	fen.round_winner = plname;
	plorder = fen.plorder = jsCopy(fen.roundorder); //restore fen.plorder to contain all players
	if (Z.round >= fen.maxrounds) {
		fen.winners = find_players_with_min_score();
		ari_history_list([`game over: ${fen.winners.join(', ')} win${fen.winners.length == 1 ? 's' : ''}`], 'game over');
		Z.stage = 'game_over';
		console.log('end of game: stage', Z.stage, '\nplorder', fen.plorder, '\nturn', Z.turn);
	} else {
		let starter = fen.starter = get_next_in_list(fen.starter, plorder);
		console.log('starter', starter);
		Z.turn = [starter];
		Z.round += 1;
		fritz_new_table(fen, Z.options);
		fritz_new_player_hands(fen, Z.turn[0], Z.options);
	}
}
function end_of_turn_fritz() {
	let [A, fen, uplayer, plorder] = [Z.A, Z.fen, Z.uplayer, Z.plorder];
	let pl = fen.players[uplayer];
	clear_quick_buttons();
	let ms = fen.players[uplayer].time_left = stop_timer();
	let ploose = {};
	fen.journeys = [];
	fen.loosecards = [];
	for (const plname in fen.players) { fen.players[plname].loosecards = []; }
	for (const group of DA.TJ) {
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		let set = Z.options.overlapping == 'yes' ? is_overlapping_set(cards, Z.options.jokers_per_group, 3, false)
			: ferro_is_set(cards, Z.options.jokers_per_group, 3, false);
		if (!set) {
			for (const card of cards) {
				if (is_joker(card)) {
					fen.loosecards.push(card.key);
					continue;
				}
				let owner = valf(card.owner, uplayer);
				lookupAddToList(ploose, [owner], card.key);
			}
		} else {
			let j = set; //[];
			fen.journeys.push(j);
		}
	}
	for (const plname in ploose) {
		fen.players[plname].loosecards = ploose[plname];
	}
	let discard = UI.deck_discard.items.filter(x => x.source == 'discard');
	fen.deck_discard = discard.map(x => x.key);
	if (!isEmpty(A.selected)) {
		let ui_discarded_card = A.selected.map(x => A.items[x].o)[0];
		removeInPlace(UI.players[uplayer].hand.items, ui_discarded_card);
		ckey = ui_discarded_card.key;
		elem_from_to(ckey, fen.players[uplayer].hand, fen.deck_discard);
		ari_history_list([`${uplayer} discards ${ckey}`], 'discard');
	}
	let uihand = UI.players[uplayer].hand.items; //.filter(x => x.source == 'hand');
	let fenhand_vorher = fen.players[uplayer].hand;
	let fenhand = fen.players[uplayer].hand = uihand.filter(x => x.source == 'hand').map(x => x.key);
	if (isEmpty(fenhand) && isEmpty(fen.players[uplayer].loosecards)) {
		end_of_round_fritz(uplayer);
	} else if (ms <= 100) {
		console.log(`time is up for ${uplayer}!!!`);
		ari_history_list([`${uplayer} runs out of time`], 'timeout');
		if (fen.plorder.length <= 1) { end_of_round_fritz(uplayer); }
		else { Z.turn = [get_next_player(Z, uplayer)]; deck_deal_safe_fritz(fen, Z.turn[0]); removeInPlace(fen.plorder, uplayer); }
	} else { Z.turn = [get_next_player(Z, uplayer)]; deck_deal_safe_fritz(fen, Z.turn[0]); }
	take_turn_fen();
}
function fradd(card, targetgroup, targetcard) {
	let [oldgroup, oldindex] = untie_card(card);
	assertion(isdef(targetgroup.id), 'NO ID IN fradd!!!!!!!', targetgroup);
	add_card_to_group(card, oldgroup, oldindex, targetcard, targetgroup);
	if (targetgroup != oldgroup) cleanup_or_resplay(oldgroup);
}
function fritz() {
	const rankstr = 'A23456789TJQK*';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [], maxrounds: options.cycles * players.length };
		let n = players.length;
		fen.num_decks = 2 + (n >= 9 ? 2 : n >= 7 ? 1 : 0); //n == 2 ? 1 : 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		fritz_new_table(fen, options);
		let deck = fen.deck;
		shuffle(fen.plorder);
		let starter = fen.starter = fen.plorder[0];
		fen.roundorder = jsCopy(fen.plorder);
		let handsize = valf(Number(options.handsize), 11);
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, plname == starter ? handsize + 1 : handsize),
				loosecards: [],
				time_left: options.seconds_per_game * 1000, //seconds
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		[fen.phase, fen.stage, fen.turn] = ['', 'card_selection', [starter]];
		return fen;
	}
	function activate_ui() { fritz_activate_ui(); }
	function check_gameover() { return isdef(Z.fen.winners) ? Z.fen.winners : false; }
	function present(dParent) { fritz_present(dParent); }
	function stats(dParent) { fritz_stats(dParent); }
	function state_info(dParent) { fritz_state_info(dParent); }
	return { rankstr, setup, activate_ui, check_gameover, present, state_info, stats };
}
function fritz_activate_ui() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	A.autosubmit = false;
	new_cards_animation(1);
	round_change_animation(1);
	select_add_items(ui_get_hand_items(uplayer), end_of_turn_fritz, 'must drag drop cards to assemble groups, then discard 1 hand card', 0, 1);
	A.items.map(x => iDiv(x).onclick = ev => {
		let card = Items[x.id];
		let item = x;
		clear_quick_buttons();
		select_last(item, select_toggle, ev);
		if (item.index == A.selected[0]) {
			let pos = get_mouse_pos(ev);
			let b = DA.bQuick = mButton('discard', ev => {
				b.remove();
				end_of_turn_fritz();
			}, document.body, { position: 'absolute', left: pos.x - 40, top: pos.y - 10 }, 'selectbutton');
		}
	});
	UI.timer = select_timer(fen.players[uplayer].time_left + Z.options.seconds_per_move * 1000, end_of_turn_fritz);
}
function fritz_card(ckey, h, w, ov, draggable) {
	let type = ckey[2];
	let info = ckey[0] == '*' ? get_joker_info() : jsCopy(C52Cards[ckey.substring(0, 2)]);
	info.key = ckey;
	info.cardtype = ckey[2]; //n,l,c=mini...
	let [r, s] = [info.rank, info.suit];
	info.val = r == '*' ? 25 : r == 'A' ? 1 : 'TJQK'.includes(r) ? 10 : Number(r);
	info.color = RED;
	info.sz = info.h = valf(h, Config.ui.card.h);
	info.w = valf(w, info.sz * .7);
	info.irank = '23456789TJQKA*'.indexOf(r);
	info.isuit = 'SHCDJ'.indexOf(s);
	info.isort = info.isuit * 14 + info.irank;
	let card = cardFromInfo(info, h, w, ov);
	card.id = iDiv(card).id = getUID('c');
	Items[card.id] = card;
	if (draggable && Z.role == 'active') mDraggable(card);
	return card;
}
function fritz_get_card(ckey, h, w, ov = .25) { return fritz_card(ckey, h, w, ov, true); }
function fritz_get_hint_card(ckey) { return fritz_card(ckey, 50, 30, .25, false); }
function fritz_new_player_hands(fen, starter, options) {
	let handsize = options.handsize;
	let deck = fen.deck;
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck, plname == starter ? handsize + 1 : handsize);
		pl.loosecards = [];
		pl.time_left = options.seconds_per_game * 1000; //seconds
		pl.roundchange = true;
		delete pl.handsorting;
		delete pl.newcards;
	}
}
function fritz_new_table(fen, options) {
	fen.deck = create_fen_deck('n', fen.num_decks, 0);
	fen.deck_discard = [];
	fen.journeys = [];
	fen.loosecards = arrRepeat(options.jokers, '*Hn'); // ['*Hn'];
	shuffle(fen.deck);
}
function fritz_present(dParent) {
	DA.hovergroup = null;
	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, Z.uplayer, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent); mFlexWrap(dOpenTable)
	Config.ui.card.h = 130;
	Config.ui.container.h = Config.ui.card.h + 30;
	if (isEmpty(fen.deck_discard)) {
		mText('discard pile is empty!', dOpenTable);
		ui.deck_discard = { items: [] }
	} else {
		mText('discard pile:', dOpenTable); mLinebreak(dOpenTable);
		let deck_discard = ui.deck_discard = ui_type_hand(fen.deck_discard, dOpenTable, { maright: 25 }, 'deck_discard', null, fritz_get_card, true);
		let i = 0; deck_discard.items.map(x => { x.source = 'discard'; x.index = i++ });
	}
	mLinebreak(dOpenTable);
	mDiv(dOpenTable, { box: true, w: '100%' }, null, '<hr>');
	let ddarea = UI.ddarea = mDiv(dOpenTable, { border: 'dashed 1px black', bg: '#eeeeee80', box: true, hmin: 162, wmin: 245, padding: '5px 50px 5px 5px', margin: 5 });
	mDroppable(ddarea, drop_card_fritz, dragover_fritz); ddarea.id = 'dOpenTable'; Items[ddarea.id] = ddarea;
	mFlexWrap(ddarea)
	fritz_stats(dRechts);
	historyShow(fen, dRechts);
	DA.TJ = [];
	for (const j of fen.journeys) {
		let cards = j.map(x => fritz_get_card(x));
		frnew(cards[0], { target: 'hallo' });
		for (let i = 1; i < cards.length; i++) { fradd(cards[i], Items[cards[0].groupid]); }
	}
	let loosecards = ui.loosecards = jsCopy(fen.loosecards).map(c => fritz_get_card(c));
	for (const plname of fen.plorder) {
		let cards = fen.players[plname].loosecards.map(c => fritz_get_card(c));
		cards.map(x => x.owner = plname);
		loosecards = loosecards.concat(cards);
	}
	for (const looseui of loosecards) {
		let card = looseui;
		frnew(card, { target: 'hallo' });
	}
	for (const group of DA.TJ) {
		assertion(isdef(group.id), 'no group id', group);
		let d = iDiv(group);
		let ch = arrChildren(iDiv(group));
		let cards = ch.map(x => Items[x.id]);
		cards.map(x => mDroppable(x, drop_card_fritz, dragover_fritz));
	}
	if (arrChildren(ddarea).length == 0) {
		let d = mDiv(ddarea, { 'pointer-events': 'none', maleft: 45, align: 'center', hmin: 40, w: '100%', fz: 12, fg: 'dimgray' }, 'ddhint', 'drag and drop cards here');
	}
	ui.players = {};
	// let uname_plays = fen.plorder.includes(Z.uname);
	// let plmain = uname_plays && Z.mode == 'multi' ? Z.uname : uplayer;
	let uname_plays = table.plorder.includes(me);
	//console.log('uname_plays', uname_plays, 'me', me, 'plorder', table.plorder, 'mode', table.options.mode);
	let plmain = uname_plays && table.options.mode == 'multi' ? me : table.turn[0];
	let order = arrCycle(table.plorder, table.plorder.indexOf(plmain));
	fritz_present_player(plmain, dMiddle);
	if (TESTING) {
		for (const plname of arrMinus(fen.plorder, plmain)) {
			fritz_present_player(plname, dMiddle);
		}
	}
	if (uname_plays) { ari_show_handsorting_buttons_for(table.players[plmain], ui); }//delete Clientdata.handsorting;}
	// show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname, { left: 58, bottom: -1 });
}
function fritz_present_player(playername, dMiddle) {
	let [fen, ui, stage] = [Z.fen, UI, Z.stage];
	let pl = fen.players[playername];
	let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 10, border: `2px ${get_user_color(playername)} solid` };
	let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(playername, 25)); mFlexWrap(d); mLinebreak(d, 10);
	pl.hand = correct_handsorting(pl.hand, playername);
	let upl = ui.players[playername] = { div: d };
	upl.hand = ui_type_hand(pl.hand, d, {}, `players.${playername}.hand`, 'hand', fritz_get_card);
	upl.hand.items.map(x => x.source = 'hand');
	let ploose = pl.loosecards;
	if (!isEmpty(ploose)) {
		upl.loose = ui_type_market(ploose, d, {}, `players.${playername}.loose`, 'untouchables', fritz_get_hint_card);
		upl.loose.items.map(x => x.source = 'loose');
	} else {
	}
}
function fritz_state_info(dParent) {
	let user_html = get_user_pic_html(Z.uplayer, 30);
	dParent.innerHTML = `Round ${Z.round}:&nbsp;player: ${user_html} `;
}
function fritz_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent);
	let fen = Z.fen;
	console.log('players', get_keys(fen.players));
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		console.log('uname', plname);
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mLinebreak(d);
		player_stat_count('hand with fingers splayed', calc_hand_value(pl.hand.concat(pl.loosecards), fritz_get_card), d);
		player_stat_count('star', pl.score, d);
		if (fen.turn.includes(plname)) { show_hourglass(plname, d, 30, { left: -3, top: 0 }); }
		else if (!fen.plorder.includes(plname)) mStyle(d, { opacity: 0.5 });
	}
}
function frnew(card, ev) {
	let [oldgroup, oldindex] = untie_card(card);
	let id = getUID('g');
	let d = mDiv(Items.dOpenTable, { display: 'grid', margin: 10 }, id); //, transition:'all * .5s' }, id);
	let targetgroup = { div: d, id: id, ids: [], ov: .5222 };
	assertion(isdef(DA.TJ), 'DA.TJ undefined in frnew!!!');
	DA.TJ.push(targetgroup);
	Items[id] = targetgroup;
	assertion(isdef(targetgroup.id), 'NO ID IN frnew!!!!!!!', targetgroup);
	add_card_to_group(card, oldgroup, oldindex, null, targetgroup);
	if (targetgroup != oldgroup) cleanup_or_resplay(oldgroup);
}
function resplay_container(targetgroup, ovpercent) {
	let d = iDiv(targetgroup);
	let card = Items[targetgroup.ids[0]];
	let ov = valf(targetgroup.ov, .1222)
	mContainerSplay(d, 2, card.w, card.h, arrChildren(d).length, ov * card.w);
	let items = arrChildren(d).map(x => Items[x.id]);
	ui_add_cards_to_hand_container(d, items);
}
function untie_card(card) {
	remove_from_selection(card);
	clear_selection();
	let oldgroupid = card.groupid;
	if (isdef(oldgroupid)) delete card.owner;
	let oldgroup = Items[oldgroupid];
	let oldindex = isdef(oldgroup) ? oldgroup.ids.indexOf(card.id) : null;
	if (isdef(oldgroup)) removeInPlace(oldgroup.ids, card.id);
	return [oldgroup, oldindex]; // {oldindex:oldindex,oldgroup:oldgroup};
}
//#endregion fritz

//#region ferro
function calc_ferro_highest_goal_achieved(pl) {
	let jsorted = jsCopy(pl.journeys).sort((a, b) => b.length - a.length);
	let di = {
		'3': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 3,
		'33': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 3
			&& is_group(jsorted[1]) && jsorted[1].length >= 3,
		'4': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 4,
		'44': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 4
			&& is_group(jsorted[1]) && jsorted[1].length >= 4,
		'5': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 5,
		'55': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 5
			&& is_group(jsorted[1]) && jsorted[1].length >= 5,
		'7R': jsorted.length > 0 && is_sequence(jsorted[0]) && jsorted[0].length >= 7,
	};
	for (const k of Z.fen.availableGoals) { // ['7R', '55', '5', '44', '4', '33', '3']) {
		if (pl.goals[k]) {
			console.log('player', pl.name, 'already achieved goal', k);
			continue;
		}
		let achieved = di[k];
		if (achieved) {
			return k;
		}
	}
	return null;
}
function calc_ferro_score(roundwinner) {
	let [round, plorder, stage, A, fen, uplayer] = [Z.round, Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	assertion(roundwinner == uplayer, '_calc_ferro_score: roundwinner != uplayer');
	for (const plname of plorder) {
		let pl = fen.players[plname];
		pl.newcards = [];
		if (nundef(pl.score)) pl.score = 0;
		if (uplayer == plname) pl.score -= round * 5;
		else pl.score += calc_hand_value(pl.hand);
	}
}
function deck_deal_safe_ferro(fen, plname, n) {
	if (fen.deck.length < n) {
		fen.deck = fen.deck.concat(fen.deck_discard.reverse());
		fen.deck_discard = [];
	}
	let new_cards = deck_deal(fen.deck, n);
	fen.players[plname].hand.push(...new_cards);
	new_cards.map(x => lookupAddToList(fen.players[plname], ['newcards'], x));
	return new_cards;
}
function end_of_round_ferro() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	calc_ferro_score(uplayer);
	if (Z.options.phase_order == 'anti') {
		for (const plname of plorder) {
			let pl = fen.players[plname];
			if (!pl.roundgoal) pl.goals[get_round_goal()] = true;
		}
	}
	ari_history_list([`${uplayer} wins the round`], 'round');
	fen.round_winner = uplayer;
	[Z.stage, Z.turn] = ['round_end', [Z.host]]; //jsCopy(plorder)];
	take_turn_fen();
}
function ferro() {
	const rankstr = '23456789TJQKA*';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		options.jokers_per_group = 1;
		fen.allGoals = ['7R', '55', '5', '44', '4', '33', '3'];
		fen.availableGoals = options.maxrounds == 1 ? [rChoose(fen.allGoals)] : options.maxrounds < 7 ? rChoose(fen.allGoals, options.maxrounds) : fen.allGoals;
		fen.availableGoals.sort((a, b) => fen.allGoals.indexOf(a) - fen.allGoals.indexOf(b)); //sorted most difficult first
		fen.roundGoals = arrReverse(fen.availableGoals); //sorted easiest first!
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 9 ? 2 : n >= 7 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		let deck = fen.deck = create_fen_deck('n', num_decks, 4 * num_decks);
		let deck_discard = fen.deck_discard = [];
		shuffle(deck);
		if (DA.TESTING != true) { shuffle(fen.plorder); shuffle(fen.plorder); } //shuffletest(fen.plorder);		}
		let starter = fen.plorder[0];
		let handsize = valf(Number(options.handsize), 11);
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, plname == starter ? handsize + 1 : handsize),
				journeys: [],
				roundgoal: false,
				coins: options.coins, //0, //10,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
			pl.goals = {};
			for (const g of fen.availableGoals) { pl.goals[g] = 0; }//console.log('g',g);  { 3: 0, 33: 0, 4: 0, 44: 0, 5: 0, 55: 0, '7R': 0 };
		}
		fen.phase = ''; //TODO: king !!!!!!!
		[fen.stage, fen.turn] = ['card_selection', [starter]];
		return fen;
	}
	function activate_ui() { ferro_activate_ui(); }
	function check_gameover() { return isdef(Z.fen.winners) ? Z.fen.winners : false; }
	function clear_ack() {
		if (Z.stage == 'round_end') { start_new_round_ferro(); take_turn_fen(); }
		else if (Z.stage != 'card_selection') {
			for (const plname of Z.fen.canbuy) {
				let pldata = firstCond(Z.playerdata, x => x.name == plname);
				if (isdef(pldata) && lookup(pldata, ['state', 'buy']) == true) {
					Z.fen.buyer = plname;
					break;
				}
			}
			Z.stage = 'can_resolve';
			ferro_change_to_card_selection();
		}
	}
	function present(dParent) { ferro_present(dParent); }
	function stats(dParent) { ferro_stats(dParent); }
	function state_info(dParent) { ferro_state(dParent); }
	return { rankstr, setup, activate_ui, check_gameover, clear_ack, present, state_info, stats };
}
function ferro_ack_uplayer() { if (Z.mode == 'multi') { ferro_ack_uplayer_multi(); } else { ferro_ack_uplayer_hotseat(); } }
function ferro_ack_uplayer_hotseat() {
	let [A, fen, uplayer] = [Z.A, Z.fen, Z.uplayer];
	let buy = !isEmpty(A.selected) && A.selected[0] == 0;
	if (buy || uplayer == fen.lastplayer) { fen.buyer = uplayer;[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve']; }
	else { Z.turn = [get_next_in_list(uplayer, fen.canbuy)]; }
	take_turn_fen();
}
function ferro_ack_uplayer_multi() {
	let [A, uplayer] = [Z.A, Z.uplayer];
	stopPolling();
	let o_pldata = Z.playerdata.find(x => x.name == uplayer);
	Z.state = o_pldata.state = { buy: !isEmpty(A.selected) && A.selected[0] == 0 };
	let can_resolve = ferro_check_resolve();
	if (can_resolve) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_fen_write();
	} else { take_turn_multi(); }
}
function ferro_activate_ui() { ferro_pre_action(); }
function ferro_change_to_buy_pass() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let nextplayer = get_next_player(Z, uplayer); //player after buy_or_pass round
	let newturn = jsCopy(plorder); while (newturn[0] != nextplayer) { newturn = arrCycle(newturn, 1); } //console.log('newturn', newturn);
	fen.canbuy = newturn.filter(x => x != uplayer && fen.players[x].coins > 0); //fen.canbuy list ist angeordnet nach reihenfolge der frage
	fen.trigger = uplayer; //NEIN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!get_admin_player(fen.plorder); // uplayer;
	fen.buyer = null;
	fen.nextturn = [nextplayer];
	if (isEmpty(fen.canbuy)) { Z.stage = 'can_resolve'; ferro_change_to_card_selection(); return; }
	else if (Z.mode == 'multi') { [Z.stage, Z.turn] = ['buy_or_pass', fen.canbuy]; fen.keeppolling = true; take_turn_fen_clear(); }
	else {
		fen.canbuy.map(x => fen.players[x].buy = 'unset');
		fen.lastplayer = arrLast(fen.canbuy);
		[Z.stage, Z.turn] = ['buy_or_pass', [fen.canbuy[0]]];
		take_turn_fen();
	}
}
function ferro_change_to_card_selection() {
	let [fen, stage] = [Z.fen, Z.stage];
	assertion(stage != 'card_selection', "ALREADY IN TURN ROUND!!!!!!!!!!!!!!!!!!!!!!");
	assertion(stage == 'can_resolve', "change to card_selection: NOT IN can_resolve stage!!!!!!!!!!!!!!!!!!!!!!");
	assertion(Z.uplayer == 'mimi' || Z.uplayer == fen.trigger, "mixup uplayer in change_to_card_selection!!!!!!!!!!!!!!!!!!!!!!");
	if (isdef(fen.buyer)) {
		let plname = fen.buyer;
		let pl = fen.players[plname];
		let card = fen.deck_discard.shift();
		pl.hand.push(card);
		lookupAddToList(pl, ['newcards'], card);
		deck_deal_safe_ferro(fen, plname, 1);
		pl.coins -= 1; //pay
		ari_history_list([`${plname} bought ${card}`], 'buy');
	}
	let nextplayer = fen.nextturn[0];
	deck_deal_safe_ferro(fen, nextplayer, 1);
	Z.turn = fen.nextturn;
	Z.stage = 'card_selection';
	for (const k of ['buyer', 'canbuy', 'nextturn', 'trigger', 'lastplayer']) delete fen[k];//cleanup buy_or_pass multi-turn!!!!!!!!!!!!!
	delete fen.keeppolling;
	clear_transaction();
	take_turn_fen();
}
function ferro_check_resolve() {
	let [pldata, stage, A, fen, plorder, uplayer, deck, turn] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck, Z.turn];
	let pl = fen.players[uplayer];
	assertion(stage == 'buy_or_pass', "check_resolve NOT IN buy_or_pass stage!!!!!!!!!");
	assertion(isdef(pldata), "no playerdata in buy_or_pass stage!!!!!!!!!!!!!!!!!!!!!!!");
	let done = true;
	for (const plname of turn) {
		let data = firstCond(pldata, x => x.name == plname);
		assertion(isdef(data), 'no pldata for', plname);
		let state = data.state;
		if (isEmpty(state)) done = false;
		else if (state.buy == true) fen.buyer = plname;
		else continue;
		break;
	}
	return done;
}
function ferro_is_set(cards, max_jollies_allowed = 1, seqlen = 7, group_same_suit_allowed = true) {
	if (cards.length < 3) return false;
	let num_jollies_in_cards = cards.filter(x => is_joker(x)).length;
	if (num_jollies_in_cards > max_jollies_allowed) return false;
	cards = sortCardItemsByRank(cards.map(x => x), rankstr = '23456789TJQKA*');
	let rank = cards[0].rank;
	let isgroup = cards.every(x => x.rank == rank || is_joker(x));
	let suits = cards.filter(x => !is_joker(x)).map(x => x.suit);
	let num_duplicate_suits = suits.filter(x => suits.filter(y => y == x).length > 1).length;
	if (isgroup && !group_same_suit_allowed && num_duplicate_suits > 0) return false;
	else if (isgroup) return cards.map(x => x.key);
	let suit = cards[0].suit;
	if (!cards.every(x => is_jolly(x.key) || x.suit == suit)) return false;
	let keys = cards.map(x => x.key);
	if (keys.length != new Set(keys).size) return false;
	let at_most_jollies = Math.min(num_jollies_in_cards, max_jollies_allowed);
	let num_jolly = sortCardItemsToSequence(cards, rankstr = '23456789TJQKA', at_most_jollies);
	let cond1 = num_jolly <= at_most_jollies; //this sequence does not need more jollies than it should
	let cond2 = cards.length >= seqlen; //console.log('cond2', cond2);
	if (cond1 && cond2) return cards.map(x => x.key); else return false;
}
function ferro_pre_action() {
	let [stage, A, fen, plorder, uplayer, deck] = [Z.stage, Z.A, Z.fen, Z.plorder, Z.uplayer, Z.deck];
	switch (stage) {
		case 'can_resolve': if (Z.options.auto_weiter) ferro_change_to_card_selection(); else { select_add_items(ui_get_string_items(['weiter']), ferro_change_to_card_selection, 'may click to continue', 1, 1, Z.mode == 'multi'); select_timer(2000, ferro_change_to_card_selection); } break;
		case 'buy_or_pass': if (!is_playerdata_set(uplayer)) { select_add_items(ui_get_buy_or_pass_items(), ferro_ack_uplayer, 'may click discard pile to buy or pass', 1, 1); if (uplayer != 'nasi') select_timer(Z.options.thinking_time * 1000, ferro_ack_uplayer); } break;
		case 'card_selection': select_add_items(ui_get_ferro_items(uplayer), fp_card_selection, 'must select one or more cards', 1, 100); break;
		default: console.log('stage is', stage); break;
	}
}
function ferro_present(dParent) {
	if (DA.simulate == true) show('bRestartMove'); else hide('bRestartMove'); //console.log('DA', DA);
	let [fen, ui, uplayer, stage, pl] = [Z.fen, UI, Z.uplayer, Z.stage, Z.pl];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent);
	ferro_stats(dRechts);
	historyShow(fen, dRechts);
	let deck = ui.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck', ferro_get_card);
	let deck_discard = ui.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', ferro_get_card);
	if (!isEmpty(deck_discard.items)) face_up(deck_discard.get_topcard());
	order = get_present_order();
	for (const plname of order) {
		let pl = fen.players[plname];
		let playerstyles = { w: '100%', bg: '#ffffff80', fg: 'black', padding: 4, margin: 4, rounding: 10, border: `2px ${get_user_color(plname)} solid` };
		let d = mDiv(dMiddle, playerstyles, null, get_user_pic_html(plname, 25));
		mFlexWrap(d);
		mLinebreak(d, 10);
		let hidden = compute_hidden(plname);
		ferro_present_player(plname, d, hidden);
	}
	Z.isWaiting = false;
	if (Z.stage == 'round_end') {
		show_waiting_for_ack_message();
		if (Z.role == 'active' || i_am_host()) {
			show('bClearAck');
		}
	} else if (Z.stage == 'buy_or_pass' && uplayer == fen.trigger && ferro_check_resolve()) {
		assertion(Z.stage == 'buy_or_pass', 'stage is not buy_or_pass when checking can_resolve!');
		Z.stage = 'can_resolve';
		[Z.turn, Z.stage] = [[get_multi_trigger()], 'can_resolve'];
		take_turn_fen(); return;
	} else if (Z.stage == 'buy_or_pass' && (Z.role != 'active' || is_playerdata_set(uplayer))) {
		assertion(isdef(Z.playerdata), 'playerdata is not defined in buy_or_pass (present ferro)');
		let pl_not_done = Z.playerdata.filter(x => Z.turn.includes(x.name) && isEmpty(x.state)).map(x => x.name);
		show_waiting_message(`waiting for possible buy decision...`);
		Z.isWaiting = true;
	}
	//show_handsorting_buttons_for(Z.mode == 'hotseat' ? Z.uplayer : Z.uname, { bottom: -2 });
	if (table.plorder.includes(me)) { ari_show_handsorting_buttons_for(table.players[show_first], ui); }//delete Clientdata.handsorting;}
	new_cards_animation();
}
function ferro_present_player(plname, d, ishidden = false) {
	let fen = Z.fen;
	let pl = fen.players[plname];
	let ui = UI.players[plname] = { div: d };
	Config.ui.card.h = ishidden ? 100 : 150;
	Config.ui.container.h = Config.ui.card.h + 30;
	if (!ishidden) pl.hand = correct_handsorting(pl.hand, plname);
	let hand = ui.hand = ui_type_hand(pl.hand, d, {}, `players.${plname}.hand`, 'hand', ferro_get_card);
	if (ishidden) { hand.items.map(x => face_down(x)); }
	ui.journeys = [];
	let i = 0;
	for (const j of pl.journeys) {
		let jui = ui_type_lead_hand(j, d, { maleft: 12, h: 130 }, `players.${plname}.journeys.${i}`, '', ferro_get_card);//list, dParent, path, title, get_card_func
		i += 1;
		ui.journeys.push(jui);
	}
}
function ferro_process_discard() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	if (!isEmpty(pl.journeys) && !pl.roundgoal) {
		let goal = is_fixed_goal() ? get_round_goal() : calc_ferro_highest_goal_achieved(pl);
		pl.roundgoal = goal;
		pl.goals[goal] = true;
		ari_history_list([`${pl.name} achieved goal ${pl.roundgoal}`], 'achieve');
	}
	let c = A.selectedCards[0].key;
	elem_from_to_top(c, fen.players[uplayer].hand, fen.deck_discard);
	ari_history_list([`${uplayer} discards ${c}`], 'discard');
	if (fen.players[uplayer].hand.length == 0) { end_of_round_ferro(); } else ferro_change_to_buy_pass(); //ferro_change_to_ack_round();
}
function ferro_process_jolly(key, j) {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let a = key;
	let b = j.find(x => x[0] == '*');
	arrReplace1(fen.players[uplayer].hand, a, b);
	replace_jolly(key, j);
	ari_history_list([`${uplayer} replaces for jolly`], 'jolly');
	Z.stage = 'card_selection';
}
function ferro_process_set(keys) {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	if (is_group(keys)) {
		keys = sort_cards(keys, true, 'CDSH', true, '23456789TJQKA*');
	}
	let j = [];
	keys.map(x => elem_from_to(x, fen.players[uplayer].hand, j));
	fen.players[uplayer].journeys.push(j);
	ari_history_list([`${uplayer} reveals ${j.join(', ')}`], 'auflegen');
	Z.stage = 'card_selection';
}
function ferro_state(dParent) {
	if (DA.TEST0 == true) {
		let html = `${Z.stage}`;
		if (isdef(Z.playerdata)) {
			let trigger = get_multi_trigger();
			if (trigger) html += ` trigger:${trigger}`;
			for (const data of Z.playerdata) {
				if (data.name == trigger) continue;
				let name = data.name;
				let state = data.state;
				let s_state = object2string(state);
				html += ` ${name}:'${s_state}'`; // (${typeof state})`;
			}
			dParent.innerHTML += ` ${Z.playerdata.map(x => x.name)}`;
		}
		dParent.innerHTML = html;
		return;
	}
	if (Z.stage == 'round_end') {
		dParent.innerHTML = `Round ${Z.round} ended by &nbsp;${get_user_pic_html(Z.fen.round_winner, 30)}`;
	} else if (is_fixed_goal()) {
		let goal = get_round_goal();
		console.log('goal', goal);
		let goal_html = `<div style="font-weight:bold;border-radius:50%;background:white;color:red;line-height:100%;padding:4px 8px">${goal}</div>`;
		dParent.innerHTML = `Round ${Z.round}:&nbsp;&nbsp;minimum:&nbsp;${goal_html}`;
	} else {
		let user_html = get_user_pic_html(Z.stage == 'buy_or_pass' ? Z.fen.nextturn[0] : Z.turn[0], 30);
		dParent.innerHTML = `Round ${Z.round}:&nbsp;${Z.stage == 'buy_or_pass' ? 'next ' : ''}turn: ${user_html} `;
	}
}
function ferro_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent);
	let fen = Z.fen;
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); mCenterFlex(d); mStyle(d, { wmin: 150 }); mLinebreak(d);
		player_stat_count('coin', pl.coins, d);
		player_stat_count('pinching hand', pl.hand.length, d);
		if (!compute_hidden(plname)) player_stat_count('hand with fingers splayed', calc_hand_value(pl.hand), d);
		player_stat_count('star', pl.score, d);
		mLinebreak(d, 4);
		if (!is_fixed_goal()) {
			let d2 = mDiv(d, { padding: 4, display: 'flex' }, `d_${plname}_goals`);
			if (fen.availableGoals.length < 4) { mStyle(d2, { wmin: 120 }); mCenterFlex(d2); }
			let sz = 16;
			let styles_done = { h: sz, fz: sz, maleft: 6, fg: 'grey', 'text-decoration': 'line-through green', weight: 'bold' };
			let styles_todo = { h: sz, fz: sz, maleft: 6, border: 'red', weight: 'bold', padding: 4, 'line-height': sz }; // 'text-decoration': 'underline red', 
			for (const k of fen.roundGoals) { //in pl.goals) {
				mText(k, d2, pl.goals[k] ? styles_done : styles_todo);
			}
		}
		if (fen.turn.includes(plname)) { show_hourglass(plname, d, 30, { left: -3, top: 0 }); }
	}
}
function ferro_transaction_error() {
	let d = mDiv(dError, { padding: 10, align: 'center' }, null, `Illegal turn sequence - transaction cannot be completed!!!<br>press reload and try again!<br>`);
	mButton('RELOAD', onclick_reload, d, { margin: 10 });
	clear_transaction();
}
function find_players_with_min_score() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let minscore = Infinity;
	let minscorepls = [];
	for (const plname of plorder) {
		let pl = fen.players[plname];
		if (pl.score < minscore) { minscore = pl.score; minscorepls = [plname]; }
		else if (pl.score == minscore) minscorepls.push(plname);
	}
	return minscorepls;
}
function fp_card_selection() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let selitems = A.selectedCards = A.selected.map(x => A.items[x]);
	let cards = selitems.map(x => x.o);
	let cmd = A.last_selected.key;
	if (cmd == 'discard') {
		if (selitems.length != 1) { select_error('select exactly 1 hand card to discard!'); return; }
		let item = selitems[0];
		if (!item.path.includes(`${uplayer}.hand`)) { select_error('select a hand card to discard!', () => { ari_make_unselected(item); A.selected = []; }); return; }
		assertion(DA.transactionlist.length == 0 || DA.simulate, '!!!!!!!!!!!!!!!!transactionlist is not empty!');
		if (DA.transactionlist.length > 0) {
			console.log('VERIFYING TRANSACTION............')
			let legal = verify_min_req();
			clear_transaction();
			if (legal) {
				ferro_process_discard(); //discard selected card
			} else {
				ferro_transaction_error();
			}
		} else {
			ferro_process_discard(); //discard selected card
		}
	} else if (cmd == 'jolly') {
		if (selitems.length != 2) { select_error('select a hand card and the jolly you want!'); return; }
		let handcard = selitems.find(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let jolly = selitems.find(x => is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (!isdef(handcard) || !isdef(jolly)) { select_error('select a hand card and the jolly you want!'); return; }
		let key = handcard.key;
		let j = path2fen(fen, jolly.path);
		if (!jolly_matches(key, j)) { select_error('your card does not match jolly!'); return; }
		if (pl.journeys.length == 0) { add_transaction(cmd); }
		ferro_process_jolly(key, j);
		take_turn_fen();
	} else if (cmd == 'auflegen') {
		if (selitems.length < 3) { select_error('select cards to form a group!'); return; }
		else if (pl.hand.length == selitems.length) { select_error('you need to keep a card for discard!!', clear_selection); return; }
		let newset = ferro_is_set(cards, Z.options.jokers_per_group);
		if (!newset) { select_error('this is NOT a valid set!'); return; }
		let is_illegal = is_correct_group_illegal(cards);
		if (is_illegal) { select_error(is_illegal); return; }
		if (pl.journeys.length == 0) { add_transaction(cmd); }
		let keys = newset; //cards.map(x => x.key);
		ferro_process_set(keys);
		take_turn_fen();
	} else if (cmd == 'anlegen') {
		if (selitems.length < 1) { select_error('select at least 1 hand card and the first card of a group!'); return; }
		else if (pl.hand.length == selitems.length - 1) { select_error('you need to keep a card for discard!!', clear_selection); return; }
		let handcards = selitems.filter(x => !is_joker(x.o) && x.path.includes(`${uplayer}.hand`));
		let groupcard = selitems.find(x => !is_joker(x.o) && !x.path.includes(`${uplayer}.hand`));
		if (isEmpty(handcards) || !isdef(groupcard)) { select_error('select 1 or more hand cards and the first card of a group!'); return; }
		let hand_rank = handcards[0].key[0];
		let handcards_same_rank = handcards.every(x => x.key[0] == hand_rank);
		let j = path2fen(fen, groupcard.path);
		if (is_group(j)) {
			if (!handcards_same_rank) { select_error('all hand cards must have the same rank!'); return; }
			let group_rank = groupcard.key[0];
			if (group_rank == hand_rank) {
				for (const h of handcards) {
					elem_from_to(h.key, fen.players[uplayer].hand, j);
				}
				if (pl.journeys.length == 0) { add_transaction(cmd); }
				take_turn_fen();
				return;
			} else {
				select_error('hand cards do not match the group!');
				return;
			}
		} else { //its a sequence!
			let suit = get_sequence_suit(j);
			let handkeys = handcards.map(x => x.key); //console.log('suit',suit,'keys', keys);
			if (firstCond(handkeys, x => x[1] != suit)) { select_error('hand card suit does not match the group!'); return; }
			let ij = j.findIndex(x => is_jolly(x));
			let j_has_jolly = ij > -1;
			let rank_to_be_relaced_by_jolly = j_has_jolly ? find_jolly_rank(j) : null;
			let r = rank_to_be_relaced_by_jolly;
			if (r) {
				j[ij] = r + suit + 'n';
			}
			keys = handkeys.concat(j);
			let allcards = keys.map(x => ferro_get_card(x)); // handcards.concat(j.map(x=>ferro_get_card(x)));
			let jneeded = sortCardItemsToSequence(allcards, undefined, 0);
			if (jneeded == 0) {
				let seq = allcards.map(x => x.key);
				if (r) { arrReplace1(seq, r + suit + 'n', '*Hn'); }
				j.length = 0;
				j.push(...seq);
				for (const k of handkeys) { removeInPlace(fen.players[uplayer].hand, k); }
				if (pl.journeys.length == 0) { add_transaction(cmd); }
				take_turn_fen();
			} else {
				if (r != null) { j[ij] = '*Hn'; }
				select_error('hand cards cannot be added to sequence!');
				return;
			}
		}
	}
}
function get_available_goals(plname) {
	return Z.fen.availableGoals.filter(x => !Z.fen.players[plname].goals[x]);
}
function get_round_goal() { return Z.fen.roundGoals[Z.round - 1]; } //get_keys(Z.fen.players[Z.uplayer].goals).sort()[Z.round - 1]; }
function is_correct_group_illegal(cards) {
	let keys = cards.map(x => x.key);
	let isgroup = is_group(keys);
	if (isgroup) return false;
	if (is_fixed_goal() && get_round_goal() != '7R') {
		return `the goal for this round is ${get_round_goal()}!`;
	}
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	if (!is_fixed_goal() && pl.goals['7R'] == true) return `you can only have one sequence of 7!`;
	if (pl.journeys.find(x => is_sequence(x))) return `you can only have one sequence of 7!`;
	if (pl.roundgoal) return `row of 7 NOT allowed except if it is the round goal!`;
	return false;
}
function is_fixed_goal() { return Z.options.phase_order == 'fixed'; }
function is_group(j) {
	if (j.length < 3) return false;
	let rank = firstCond(j, x => !is_jolly(x))[0];
	return j.every(x => is_jolly(x) || x[0] == rank);
}
function is_sequence(j) { return !is_group(j); }
function start_new_round_ferro() {
	let [plorder, stage, A, fen, uplayer] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	Z.stage = 'card_selection';
	fen.plorder = arrCycle(plorder, 1);
	let starter = fen.plorder[0];
	Z.turn = fen.turn = [starter];
	let deck = fen.deck = create_fen_deck('n', fen.num_decks, fen.num_decks * 4);
	let deck_discard = fen.deck_discard = [];
	shuffle(deck);
	let handsize = valf(Number(Z.options.handsize), 11);
	for (const plname of fen.plorder) {
		let pl = fen.players[plname];
		pl.hand = deck_deal(deck, plname == starter ? handsize + 1 : handsize);
		pl.journeys = [];
		pl.roundgoal = false;
		pl.roundchange = true;
		delete pl.handsorting;
	}
	Z.round += 1;
	if (Z.round > Z.options.maxrounds) {
		ari_history_list([`game over`], 'game');
		Z.stage = 'game_over';
		fen.winners = find_players_with_min_score();
	}
}
function ui_get_buy_or_pass_items() {
	let items = [], i = 0;
	if (!isEmpty(UI.deck_discard.items)) items.push(ui_get_deck_item(UI.deck_discard));
	items = items.concat(ui_get_string_items(['pass']));
	reindex_items(items);
	return items;
}
function ui_get_ferro_items() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer);	//hand items
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			for (const o of jitem.items) {
				if (!is_joker(o)) { continue; }
				let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
				items.push(item);
			}
		}
	}
	for (const plname of plorder) {
		let jlist = UI.players[plname].journeys;
		for (const jitem of jlist) {
			let o = jitem.items[0]; // lead card
			let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: jitem.path, index: 0 };
			items.push(item);
		}
	}
	let cmds = ui_get_submit_items(['discard', 'auflegen', 'jolly', 'anlegen']);
	items = items.concat(cmds);
	reindex_items(items);
	return items;
}
function ui_get_submit_items(commands) {
	let items = [], i = 0;
	for (const cmd of commands) { //just strings!
		let item = { o: null, a: cmd, key: cmd, friendly: cmd, path: null, index: i, submit_on_click: true, itemtype: 'submit' };
		i++;
		items.push(item);
	}
	return items;
}
function verify_min_req() {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[uplayer];
	let jsorted = jsCopy(pl.journeys).sort((a, b) => b.length - a.length);
	let di = {
		'3': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 3,
		'33': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 3
			&& is_group(jsorted[1]) && jsorted[1].length >= 3,
		'4': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 4,
		'44': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 4
			&& is_group(jsorted[1]) && jsorted[1].length >= 4,
		'5': jsorted.length > 0 && is_group(jsorted[0]) && jsorted[0].length >= 5,
		'55': jsorted.length > 1 && is_group(jsorted[0]) && jsorted[0].length >= 5
			&& is_group(jsorted[1]) && jsorted[1].length >= 5,
		'7R': jsorted.length > 0 && is_sequence(jsorted[0]) && jsorted[0].length >= 7,
	};
	let goals = is_fixed_goal() ? [get_round_goal()] : get_available_goals(uplayer);
	for (const g of goals) {
		if (di[g] == true) { return true; } //console.log('achieved',g);
	}
	return false;
}
//#endregion ferro

//#region spotit
function cal_num_syms_adaptive() {
	let [uplayer, fen] = [Z.uplayer, Z.fen];
	let pl = fen.players[uplayer];
	pl.score = get_player_score(pl.name);
	let by_score = dict2list(fen.players);
	for (const pl of by_score) { pl.score = get_player_score(pl.name); }
	let avg_score = 0;
	for (const pl of by_score) { avg_score += pl.score; }
	avg_score /= by_score.length;
	let di = { nasi: -3, gul: -3, sheeba: -2, mimi: -1, annabel: 1 };
	let baseline = valf(di[uplayer], 0);
	let dn = baseline + Math.floor(pl.score - avg_score);
	let n = Z.options.num_symbols;
	let nfinal = Math.max(4, Math.min(14, dn + n));
	return nfinal;
}
function calc_syms(numSyms) {
	let n = numSyms, rows, realrows, colarr;
	if (n == 3) { rows = 2; realrows = 1; colarr = [1, 2]; }
	else if (n == 4) { rows = 2; realrows = 2; colarr = [2, 2]; }
	else if (n == 5) { rows = 3; realrows = 3; colarr = [1, 3, 1]; }
	else if (n == 6) { rows = 3.3; realrows = 3; colarr = [2, 3, 1]; }
	else if (n == 7) { rows = 3; realrows = 3; colarr = [2, 3, 2]; } //default
	else if (n == 8) { rows = 3.8; realrows = 4; colarr = [1, 3, 3, 1]; }
	else if (n == 9) { rows = 4; realrows = 4; colarr = [2, 3, 3, 1]; }
	else if (n == 10) { rows = 4; realrows = 4; colarr = [2, 3, 3, 2]; }
	else if (n == 11) { rows = 4.5; realrows = 4; colarr = [2, 3, 4, 2]; }
	else if (n == 12) { rows = 5; realrows = 5; colarr = [1, 3, 4, 3, 1]; }
	else if (n == 13) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 1]; }
	else if (n == 14) { rows = 5; realrows = 5; colarr = [2, 3, 4, 3, 2]; }
	else if (n == 15) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 3, 2]; }
	else if (n == 16) { rows = 5.5; realrows = 5; colarr = [2, 3, 5, 4, 2]; }
	else if (n == 17) { rows = 5.5; realrows = 5; colarr = [2, 4, 5, 4, 2]; } //17
	else if (n == 18) { rows = 5.8; realrows = 5; colarr = [2, 4, 5, 4, 3]; } //18
	return [rows, realrows, colarr];
}
function ensure_score(plname) {
	let sc = 0;
	if (isdef(Z.playerdata)) {
		let pldata = valf(firstCond(Z.playerdata, x => x.name == plname), { name: plname, state: { score: 0 } });
		sc = isdef(pldata.state) ? pldata.state.score : 0;
	} else Z.playerdata = Z.plorder.map(x => [{ name: x, state: { score: 0 } }]);
	lookupSet(Z.fen, ['players', plname, 'score'], sc);
}
function find_shared_keys(keylist, keylists) {
	let shared = [];
	for (const keylist2 of keylists) {
		for (const key of keylist) {
			if (keylist2.includes(key)) {
				shared.push(key);
			}
		}
	}
	return shared;
}
function get_player_score(plname) { ensure_score(plname); return Z.fen.players[plname].score; }
function inc_player_score(plname) { ensure_score(plname); return Z.fen.players[plname].score += 1; }
function modify_item_for_adaptive(item, items, n) {
	item.numSyms = n;
	[item.rows, item.cols, item.colarr] = calc_syms(item.numSyms);
	let other_items = items.filter(x => x != item);
	let shared_syms = find_shared_keys(item.keys, other_items.map(x => x.keys));
	let other_symbols = item.keys.filter(x => !shared_syms.includes(x));
	item.keys = shared_syms;
	let num_missing = item.numSyms - item.keys.length;
	item.keys = item.keys.concat(rChoose(other_symbols, num_missing));
	shuffle(item.keys);
	item.scales = item.keys.map(x => rChoose([1, .75, 1.2, .9, .8]));
}
function spotit() {
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), turn: [players[0]], stage: 'init', phase: '' };
		for (const plname of players) {
			fen.players[plname] = {
				score: 0, name: plname, color: get_user_color(plname),
			};
		}
		fen.items = spotit_item_fen(options);
		if (nundef(options.mode)) options.mode = 'multi';
		return fen;
	}
	function check_gameover() {
		for (const uname of Z.plorder) {
			let cond = get_player_score(uname) >= Z.options.winning_score;
			if (cond) { Z.fen.winners = [uname]; return Z.fen.winners; }
		}
		return false;
	}
	function state_info(dParent) { spotit_state(dParent); }
	function present(dParent) { spotit_present(dParent); }
	function stats(dParent) { spotit_stats(dParent); }
	function activate_ui() { spotit_activate(); }
	return { setup, activate_ui, check_gameover, present, state_info, stats };
}
function spotit_activate() {
	let [stage, uplayer, host, plorder, fen] = [Z.stage, Z.uplayer, Z.host, Z.plorder, Z.fen];
	if (stage == 'move' && uplayer == host && get_player_score(host) >= 1) {
		let bots = plorder.filter(x => fen.players[x].playmode == 'bot');
		if (isEmpty(bots)) return;
		let bot = rChoose(bots);
		TO.main = setTimeout(() => spotit_move(bot, true), rNumber(2000, 9000));
	}
}
function spotit_card(info, dParent, cardStyles, onClickSym) {
	Card.sz = 300;
	copyKeys({ w: Card.sz, h: Card.sz }, cardStyles);
	let card = cRound(dParent, cardStyles, info.id);
	addKeys(info, card);
	card.faceUp = true;
	let zipped = [];
	for (let i = 0; i < card.keys.length; i++) {
		zipped.push({ key: card.keys[i], scale: card.scales[i] });
	}
	card.pattern = fillColarr(card.colarr, zipped);
	let symStyles = { sz: Card.sz / (card.rows + 1), fg: 'random', hmargin: 10, vmargin: 6, cursor: 'pointer' };
	let syms = [];
	mRowsX(iDiv(card), card.pattern, symStyles, { 'justify-content': 'center' }, { 'justify-content': 'center' }, syms);
	for (let i = 0; i < info.keys.length; i++) {
		let key = card.keys[i];
		let sym = syms[i];
		card.live[key] = sym;
		sym.setAttribute('key', key);
		sym.onclick = ev => onClickSym(ev, key); //ev, sym, key, card);
	}
	return card;
}
function spotit_create_sample(numCards, numSyms, vocab, lang, min_scale, max_scale) {
	lang = valf(lang, 'E');
	let [rows, cols, colarr] = calc_syms(numSyms);
	let perCard = arrSum(colarr);
	let nShared = (numCards * (numCards - 1)) / 2;
	let nUnique = perCard - numCards + 1;
	let numKeysNeeded = nShared + numCards * nUnique;
	let nMin = numKeysNeeded + 3;
	let keypool = setKeys({ nMin: nMin, lang: valf(lang, 'E'), key: valf(vocab, 'animals'), keySets: KeySets, filterFunc: (_, x) => !x.includes(' ') });
	let keys = choose(keypool, numKeysNeeded);
	let dupls = keys.slice(0, nShared); //these keys are shared: cards 1 and 2 share the first one, 1 and 3 the second one,...
	let uniqs = keys.slice(nShared);
	let infos = [];
	for (let i = 0; i < numCards; i++) {
		let keylist = uniqs.slice(i * nUnique, (i + 1) * nUnique);
		let info = { id: getUID(), shares: {}, keys: keylist, rows: rows, cols: cols, colarr: colarr, num_syms: perCard };
		infos.push(info);
	}
	let iShared = 0;
	for (let i = 0; i < numCards; i++) {
		for (let j = i + 1; j < numCards; j++) {
			let c1 = infos[i];
			let c2 = infos[j];
			let dupl = dupls[iShared++];
			c1.keys.push(dupl);
			c1.shares[c2.id] = dupl;
			c2.shares[c1.id] = dupl;
			c2.keys.push(dupl);
		}
	}
	for (const info of infos) { shuffle(info.keys); }
	for (const info of infos) {
		info.scales = info.keys.map(x => chooseRandom([.5, .75, 1, 1.2]));
	}
	for (const info of infos) {
		let zipped = [];
		for (let i = 0; i < info.keys.length; i++) {
			zipped.push({ key: info.keys[i], scale: info.scales[i] });
		}
		info.pattern = fillColarr(info.colarr, zipped);
	}
	return infos;
}
function spotit_find_shared(card, keyClicked) {
	let success = false, othercard = null;
	for (const c of Z.cards) {
		if (c == card) continue;
		if (c.keys.includes(keyClicked)) { success = true; othercard = c; }
	}
	return [success, othercard];
}
function spotit_interact(ev, key) {
	ev.cancelBubble = true;
	if (!uiActivated) { console.log('ui NOT activated'); return; }
	let keyClicked = evToProp(ev, 'key');
	let id = evToId(ev);
	if (isdef(keyClicked) && isdef(Items[id])) {
		let item = Items[id];
		let dsym = ev.target;
		let card = Items[id];
		let [success, othercard] = spotit_find_shared(card, keyClicked);
		spotit_move(Z.uplayer, success);
	}
}
function spotit_item_fen(options) {
	let o = {
		num_cards: valf(options.num_cards, 2),
		num_symbols: options.adaptive == 'yes' ? 14 : valf(options.num_symbols, 7),
		vocab: valf(options.vocab, 'lifePlus'),
		lang: 'E',
		min_scale: valf(options.min_scale, 0.75),
		max_scale: valf(options.max_scale, 1.25),
	};
	let items = spotit_create_sample(o.num_cards, o.num_symbols, o.vocab, o.lang, o.min_scale, o.max_scale);
	let item_fens = [];
	for (const item of items) {
		let arr = arrFlatten(item.pattern);
		let ifen = arr.map(x => `${x.key}:${x.scale}`).join(' ');
		item_fens.push(ifen);
	}
	let res = item_fens.join(',');
	return res;
}
function spotit_move(uplayer, success) {
	if (success) {
		inc_player_score(uplayer);
		assertion(get_player_score(uplayer) >= 1, 'player score should be >= 1');
		Z.fen.items = spotit_item_fen(Z.options);
		Z.state = { score: get_player_score(uplayer) };
		take_turn_spotit();
	} else {
		let d = mShield(dTable, { bg: '#000000aa', fg: 'red', fz: 60, align: 'center' });
		d.innerHTML = 'NOPE!!! try again!';
		TO.spotit_penalty = setTimeout(() => d.remove(), 2000);
	}
}
function spotit_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	spotit_read_all_scores();
	let dt = dOpenTable; clearElement(dt); mCenterFlex(dt);
	spotit_stats(dt);
	mLinebreak(dt, 10);
	let ks_for_cards = fen.items.split(',');
	let numCards = ks_for_cards.length;
	let items = Z.items = [];
	Items = [];
	let i = 0;
	for (const s of ks_for_cards) {
		let ks_list = s.split(' ');
		let item = {};
		item.keys = ks_list.map(x => stringBefore(x, ':'));
		item.scales = ks_list.map(x => stringAfter(x, ':')).map(x => Number(x));
		item.index = i; i++;
		let n = item.numSyms = item.keys.length;
		let [rows, cols, colarr] = calc_syms(item.numSyms);
		item.colarr = colarr;
		item.rows = rows;
		items.push(item);
	}
	Z.cards = [];
	let is_adaptive = Z.options.adaptive == 'yes';
	let nsyms = is_adaptive ? cal_num_syms_adaptive() : Z.options.num_symbols;
	for (const item of items) {
		if (is_adaptive) { modify_item_for_adaptive(item, items, nsyms); }
		let card = spotit_card(item, dt, { margin: 20, padding: 10 }, spotit_interact);
		Z.cards.push(card);
		if (Z.stage == 'init') {
			face_down(card, GREEN, 'food');
		}
	}
	mLinebreak(dt, 10);
}
function spotit_read_all_scores() {
	if (nundef(Z.playerdata)) {
		Z.playerdata = [];
		for (const pl in Z.fen.players) {
			Z.playerdata.push({
				name: pl,
				state: { score: 0 },
			});
		}
	}
	for (const pldata of Z.playerdata) {
		let plname = pldata.name;
		let state = pldata.state;
		let score = !isEmpty(state) ? state.score : 0;
		let fenscore = lookupSet(Z.fen, ['players', plname, 'score'], score);
		Z.fen.players[plname].score = Math.max(fenscore, score);
	}
}
function spotit_state(dParent) {
	let user_html = get_user_pic_html(Z.uplayer, 30);
	let msg = Z.stage == 'init' ? `getting ready...` : `player: ${user_html}`;
	dParent.innerHTML = `Round ${Z.round}:&nbsp;${msg} `;
}
function spotit_stats(d) {
	let players = Z.fen.players;
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname of get_present_order()) {
		let pl = players[plname];
		let onturn = Z.turn.includes(plname);
		let sz = 50; //onturn?100:50;
		let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
		let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
		let rounding = pl.playmode == 'bot' ? '0px' : '50%';
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);
	}
}
//#endregion spotit

//#region wise
function wise() {
	function state_info(dParent) { return; }//dParent.innerHTML = `stage: ${Z.stage}`; }
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [], num: options.num };
		let starter = fen.starter = fen.plorder[0];
		Sayings = shuffle(Sayings);
		fen.index = 0;
		fen.saying = Sayings[fen.index];
		for (const plname of players) {
			let pl = fen.players[plname] = {
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		[fen.phase, fen.stage, fen.step, fen.turn] = ['one', 'write', 0, jsCopy(fen.plorder)];
		return fen;
	}
	function check_gameover() {
		let winners = [];
		for (const plname of Z.plorder) {
			let cond = get_player_score(plname) >= Z.options.winning_score;
			if (cond) { winners.push(plname); }
		}
		if (!isEmpty(winners)) Z.fen.winners = winners;
		return isEmpty(winners) ? false : Z.fen.winners;
	}
	function post_collect() { agmove_resolve(); } //console.log('YEAH!!!! post_collect',Z); ag_post_collect(); }
	return { post_collect, state_info, setup, present: wise_present, check_gameover, activate_ui: wise_activate };
}
function wise_activate() {
	let [pldata, stage, A, fen, phase, uplayer] = [Z.playerdata, Z.stage, Z.A, Z.fen, Z.phase, Z.uplayer];
	let donelist = Z.playerdata.filter(x => isDict(x.state));
	let complete = donelist.length == Z.plorder.length;
	let resolvable = uplayer == fen.starter && complete;
	let waiting = !resolvable && isdef(donelist.find(x => x.name == uplayer));
	console.log(uplayer, stage, 'done', donelist, 'complete', complete, 'waiting', waiting);
	Z.isWaiting = false;
	if (waiting) {
		mDiv(dTable, {}, null, 'WAITING FOR PLAYERS TO COMPLETE....');
		if (complete) {
			Z.turn = [fen.starter];
			if (Z.mode != 'multi') take_turn_waiting();
		}
		Z.isWaiting = true;
		autopoll();
	} else if (stage == 'write' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let start = fen.saying.start.toLowerCase();
		let sentences = [];
		for (const pldata of Z.playerdata) {
			let plname = pldata.name;
			let text = start + ' ' + pldata.state.text;
			sentences.push({ plname: plname, text: text.toLowerCase() });
		}
		sentences.push({ plname: '', text: start + ' ' + fen.saying.end.toLowerCase() });
		fen.sentences = shuffle(sentences);
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'select';
		take_turn_fen_clear();
	} else if (stage == 'write') {
		let d = mCreate('form');
		let dt = dTable;
		mAppend(dt, d);
		d.autocomplete = "off";
		d.action = "javascript:void(0);";
		mDiv(d, { fz: 20 }, 'dForm', fen.saying.start.toLowerCase() + '...');
		Z.form = d;
		mLinebreak(d, 10);
		mInput(d, { wmin: 600 }, 'i_end', 'enter ending');
		d.onsubmit = wise_submit_text;
	} else if (stage == 'select' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		let d = mDiv(dTable, {});
		fen.result = {};
		for (const pldata of Z.playerdata) {
			let selecting = pldata.name;
			let selected = pldata.state.plname;
			let text = pldata.state.text;
			if (isEmpty(selected)) { //} || selected === null || !selected || nundef(selected)){ // nundef(selected)) {
				console.log('REINGEGANGEN!!!!!!!!!!!!!!')
				fen.players[selecting].score += 1;
				selected = 'correct';
			} else if (selecting != selected) {
				fen.players[selected].score += 1;
			}
			fen.result[selecting] = { plname: selected, text: text };
		}
		delete fen.sentences;
		Z.turn = jsCopy(Z.plorder);
		Z.stage = 'round';
		take_turn_fen_clear();
	} else if (stage == 'select') {
		let d = mDiv(dTable, {});
		let i = 1;
		for (const s of fen.sentences) {
			let d1 = mDiv(d, { fz: 20, hline: 30 }, `dsent_${s.plname}`, '' + (i++) + ') ' + s.text, 'hop1');
			d1.onclick = wise_select_sentence;
		}
	} else if (stage == 'round' && resolvable) {
		assertion(uplayer == fen.starter, 'NOT THE STARTER WHO COMPLETES THE STAGE!!!')
		delete fen.result;
		Z.turn = jsCopy(Z.plorder);
		fen.index++;
		fen.saying = Sayings[fen.index];
		Z.stage = 'write';
		take_turn_fen_clear();
	} else if (stage == 'round') {
		let d = mDiv(dTable, {});
		for (const plname in fen.result) {
			let o = fen.result[plname];
			let d1 = mDiv(d, { fz: 20, hline: 30 }, null, `${plname} selected ${o.plname}: ${o.text}`);
		}
		mLinebreak(dTable, 12)
		mButton('WEITER', wise_onclick_weiter, dTable, {}, ['donebutton', 'enabled']);
	} else {
		console.log('Z', Z)
		alert('PROBLEM!!!')
	}
}
function wise_onclick_weiter() {
	Z.state = { plname: Z.uplayer };
	take_turn_multi();
}
function wise_present(dParent) {
	let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
	let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0); ///tableLayoutOMR(dParent, 5, 1);
	let dt = dTable = dOpenTable; clearElement(dt); mCenterFlex(dt);
	wise_stats(dt);
	mLinebreak(dt, 10);
}
function wise_select_sentence(ev) {
	if (!uiActivated) return;
	let text = ev.target.innerHTML;
	let plname = stringAfter(ev.target.id, 'dsent_')
	Z.state = { plname: plname, text: text };
	take_turn_multi();
}
function wise_stats(d) {
	let players = Z.fen.players;
	let d1 = mDiv(d, { display: 'flex', 'justify-content': 'center', 'align-items': 'space-evenly' });
	for (const plname of get_present_order()) {
		let pl = players[plname];
		let onturn = Z.turn.includes(plname);
		let sz = 50; //onturn?100:50;
		let bcolor = plname == Z.uplayer ? 'lime' : 'silver';
		let border = pl.playmode == 'bot' ? `double 5px ${bcolor}` : `solid 5px ${bcolor}`;
		let rounding = pl.playmode == 'bot' ? '0px' : '50%';
		let d2 = mDiv(d1, { margin: 4, align: 'center' }, null, `<img src='../base/assets/images/${plname}.jpg' style="border-radius:${rounding};display:block;border:${border};box-sizing:border-box" class='img_person' width=${sz} height=${sz}>${get_player_score(plname)}`);
	}
}
function wise_submit_text(ev) { ev.preventDefault(); let text = mBy('i_end').value; Z.state = { text: text }; take_turn_multi(); }
//#endregion wise

