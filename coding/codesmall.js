
async function codeDictForFiles(files) {
	let di = {};
	for (const name of files) {
		console.log(name)
		let list = await codeParseFile(name);
		let dilist = list2dict(list, 'key');
		copyKeys(dilist, di);
	}
	return di;
}

function codeDictToText(di, downloadName) {
	const sortedFunctionNames = Object.keys(di).sort();
	const result = sortedFunctionNames.map(name => di[name].code).join('\n');
	if (isdef(downloadName)) downloadAsText(result, downloadName);
	return sortedFunctionNames;
}

async function codePackClosure(project, names, filterfuncs) {
	let fullnames = ['../codebig.js'];
	fullnames = fullnames.concat(names.map(x => `${project}/${x}.js`));
	let di = await codeDictForFiles(fullnames);
	codeDictToText(di, 'codebig.txt');
	let keys = findFunctionClosure(di, filterfuncs); console.log(keys)
	let di2 = {};
	for (const k of keys) { di2[k] = di[k]; }
	codeDictToText(di2, 'codesmall.txt');
	let sorted = Array.from(keys).sort(); console.log(sorted);
}
async function codePackMLib(project, names) {
	let fullnames = names.map(x => `${project}/${x}.js`);
	let di = await codeDictForFiles(fullnames);
	codeDictToText(di, 'codebig.txt');
	let dimlib = {},difull = {};
	for (const k in di) { 
		if (k.startsWith('m') && k[1]==k[1].toUpperCase())	dimlib[k] = di[k]; 
		else difull[k] = di[k];
	}
	codeDictToText(difull, 'codefull.txt');
	codeDictToText(dimlib, 'codemlib.txt');
	console.log(Object.keys(dimlib));
}

function codeParseBlock(lines, i) {
	let l = lines[i];
	let type = l[0] == 'a' ? ithWord(l, 1) : ithWord(l, 0);
	let key = l[0] == 'a' ? ithWord(l, 2, true) : ithWord(l, 1, true);
	let code = l + '\n'; i++; l = lines[i];
	while (i < lines.length && !(['var', 'const', 'cla', 'func', 'async'].some(x => l.startsWith(x)) && !l.startsWith('}'))) {
		if (!(l.trim().startsWith('//') || isEmptyOrWhiteSpace(l))) code += l + '\n';
		i++; l = lines[i];
	}
	code = replaceAllSpecialChars(code, '\t', '  ');
	code = code.trim();
	return [{ key, type, code }, i];
}

function codeParseBlocks(text) {
	let lines = text.split('\n');
	lines = lines.map(x => removeTrailingComments(x));
	let i = 0, o = null, res = [];
	while (i < lines.length) {
		let l = lines[i];
		if (['var', 'const', 'cla', 'func', 'async'].some(x => l.startsWith(x))) {
			[o, iLineAfterBlock] = codeParseBlock(lines, i);
			i = iLineAfterBlock;
			res.push(o)
		} else i++;
	}
	return res;
}

async function codeParseFile(path) {
	let file = await fetch(path);
	let text = await file.text();
	let olist = codeParseBlocks(text);
	return olist;
}

function copyKeys(ofrom, oto, except = {}, only = null) {
	let keys = isdef(only) ? only : Object.keys(ofrom);
	for (const k of keys) {
		if (isdef(except[k])) continue;
		oto[k] = ofrom[k];
	}
	return oto;
}

function downloadAsText(text, filename) {
	const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(link.href);
}

function findFunctionClosure(di, initialFunctions, outputFile) {
	const closure = new Set();
	const toProcess = initialFunctions;// [...initialFunctions];
	DA.di = di;
	console.log('di', di,'initialFunctions',initialFunctions)

	while (toProcess.length > 0) {
		const funcName = toProcess.pop();

		let isKey = Object.prototype.hasOwnProperty.call(di, funcName);
		if (!isKey || closure.has(funcName)) {
			continue;
		}

		closure.add(funcName);
		const functionCode = di[funcName].code;
		//console.log(funcName, functionCode)

		// Extract called functions within the current function's body
		// const calledFunctions = Array.from(functionCode.matchAll(/\b([a-zA-Z_$][\w$]*)\s*\(/g))
		const calledFunctions = Array.from(functionCode.matchAll(/\b([a-zA-Z_$][\w$]*)\b/g))
			.map((match) => match[1])
			.filter((name) => name !== funcName && di[name]);

		toProcess.push(...calledFunctions);
	}
	return closure;
}

function isEmpty(arr) {
	return arr === undefined || !arr
		|| (isString(arr) && (arr == 'undefined' || arr == ''))
		|| (Array.isArray(arr) && arr.length == 0)
		|| Object.entries(arr).length === 0;
}

function isEmptyOrWhiteSpace(s) { return isEmpty(s.trim()); }

function isList(arr) { return Array.isArray(arr); }

function isString(param) { return typeof param == 'string'; }

function isdef(x) { return x !== null && x !== undefined; }

function ithWord(s, n, allow_) {
	let ws = toWords(s, allow_);
	return ws[Math.min(n, ws.length - 1)];
}

function list2dict(arr, keyprop = 'id', uniqueKeys = true) {
	let di = {};
	for (const a of arr) {
		let key = typeof (a) == 'object' ? a[keyprop] : a;
		if (uniqueKeys) lookupSet(di, [key], a);
		else lookupAddToList(di, [key], a);
	}
	return di;
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
		if (nundef(k)) continue;
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
		if (nundef(k)) continue;
		if (d[k] === undefined) d[k] = (i == ilast ? val : {});
		if (nundef(d[k])) d[k] = (i == ilast ? val : {});
		d = d[k];
		if (i == ilast) return d;
		i += 1;
	}
	return d;
}

function nundef(x) { return x === null || x === undefined || x === 'undefined'; }

function removeTrailingComments(line) {
	let icomm = line.indexOf('//');
	let ch = line[icomm - 1];
	if (icomm <= 0 || ch == "'" || ':"`'.includes(ch)) return line;
	if ([':', '"', "'", '`'].some(x => line.indexOf(x) >= 0 && line.indexOf(x) < icomm)) return line;
	return line.substring(0, icomm);
}

function replaceAllSpecialChars(str, sSub, sBy) { return str.split(sSub).join(sBy); }

function startsWith(s, sSub) {
	return s.substring(0, sSub.length) == sSub;
}

function toWords(s, allow_ = false) {
	let arr = allow_ ? s.split(/[\W]+/) : s.split(/[\W|_]+/);
	return arr.filter(x => !isEmpty(x));
}

function trim(str) {
	return str.replace(/^\s+|\s+$/gm, '');
}



