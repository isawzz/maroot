
async function codeAllInOne(project, names, starterFiles, starter) {
	let fullnames = names.map(x => `${project}/${x}.js`);
	let di = await codeDictForFiles(fullnames); console.log('di', di);
	// let diStarter = await codeDictForFiles(starterFiles);
	// let diAll = { ...di, ...diStarter };
	// let keys = Array.from(findFunctionClosure(diAll, starter)); console.log(keys)
	// let diClosure = {};
	// let diRest = {};
	// let diStarterClosure = {};
	// for (const k of keys) {
	// 	if (k.startsWith('test')) diStarterClosure[k] = diStarter[k];
	// 	else diClosure[k] = di[k];
	// }
	// for (const k in di) {
	// 	if (!keys.includes(k)) diRest[k] = di[k];

	// }
	// codeDictToText(diClosure, 'closure.txt');
	// codeDictToText(diRest, 'coderest.txt');
	codeDictToText(di, 'codeall.txt');
}

async function codePackSplit(project, names, starterFiles, starter) {
	let fullnames = names.map(x => `${project}/${x}.js`);
	let di = await codeDictForFiles(fullnames); //console.log('di', di);
	let diStarter = await codeDictForFiles(starterFiles);
	let diAll = { ...di, ...diStarter };
	let keys = Array.from(findFunctionClosure(diAll, starter)); console.log(keys)
	let diClosure = {};
	let diRest = {};
	let diStarterClosure = {};
	for (const k of keys) {
		if (k.startsWith('test')) diStarterClosure[k] = diStarter[k];
		else diClosure[k] = di[k];
	}
	for (const k in di) {
		if (!keys.includes(k)) diRest[k] = di[k];

	}
	codeDictToText(diClosure, 'closure.txt');
	codeDictToText(diRest, 'coderest.txt');
	codeDictToText(diAll, 'codebig.txt');
}
async function splitClosureVio() {
	let fullnames = ['../vio97/codebig.js'];
	let starterFiles = ['../vio97/start.js'];
	let starter = ['test0'];

	let di = await codeDictForFiles(fullnames);
	let diStarter = await codeDictForFiles(starterFiles);
	let diAll = { ...di, ...diStarter };
	//codeDictToText(di, 'codebig.txt');
	let keys = Array.from(findFunctionClosure(diAll, starter)); console.log(keys)
	let diClosure = {};
	let diRest = {};
	let diStarterClosure = {};
	for (const k of keys) {
		if (k.startsWith('test')) diStarterClosure[k] = diStarter[k];
		else diClosure[k] = di[k];
	}
	for (const k in di) {
		if (!keys.includes(k)) diRest[k] = di[k];

	}
	codeDictToText(diClosure, 'closure.txt');
	codeDictToText(diRest, 'coderest.txt');
	//let sorted = Array.from(keys).sort(); console.log(sorted);


}


