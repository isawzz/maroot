onload = start;

async function start() { }//libsAll();}//mlib_vio();}//splitClosureVio(); } //project_ilms(); }//return;mlib_p5();return;project_p5(); }

async function libsAll() {
	codeAllInOne(`../games98`, ['codefun','todo','done','bau0','bau1','bau2','bau3','bau4','bau5','bau6']);
}
async function mlib_vio98() {
	codePackSplit('../vio98', ['codebig', 'eliminated', 'experimental', 'coderest', 'closure', 'done', 'bau1', 'bau2', 'bau3', 'bau4'], ['../vio98/start.js'], ['test0']);
}
async function mclosure_free() {
	return;
	codePackClosure('../fun0', ['globals', 'codeall','gsm','cards','bluff','done', 'bau1', 'bau2', 'bau3', 'bau4', 'start'], ['etest3','ftest1','atest0','ctest0','bluff','setgame','dodogame','badger']);
}
async function mlib_NEW() {
	codePackMLib('../vio99', ['codeilms', 'codesimple0', 'codebella']);
}
async function mlib_bella() {
	codePackMLib('../bella', ['allcode', 'codebig', 'done', 'game', 'games', 'bau1', 'bau2', 'bau3']);
}
async function mlib_rsg() {
	codePackMLib('../rsg', ['codebig', 'api', 'bau1', 'bau2', 'bau3']);
}
async function mlib_simple0() {
	codePackMLib('../simple0', ['codebig', 'done', 'bau1', 'bau2', 'bau3']);
}
async function mlib_ilms() {
	codePackMLib('../ilms', ['access_globals', 'alternative', 'codefull', 'codemlib', 'done', 'donetbd', 'onclick', 'polling', 'present', 'bau1', 'bau2', 'bau3', 'bau4']);
}
async function project_ilms() {
	codePackClosure('../ilms', ['codefull', 'codemlib', 'done', 'onclick', 'bau1', 'bau2', 'bau3', 'bau4', 'start'], ['test4_game0']);
}
async function mlib_p5() {
	codePackMLib('../p5', ['codesmall', 'ajetzt', 'action', 'color', 'done', 'onclick', 'bau1', 'bau2', 'bau3', 'bau4', 'start']);
}
async function project_p5() {
	codePackClosure('../p5', ['codesmall', 'ajetzt', 'action', 'color', 'done', 'onclick', 'bau1', 'bau2', 'bau3', 'bau4', 'start'], ['', '', '', '', 'test1', 'test8', 'test4_multiButton']);
}
async function project_coding() {
	codePackClosure('../coding', ['codesmall', 'done', 'bau1', 'bau2', 'start'], ['codePacker']);
}
async function test2_p5() {
	let project = '../p5';
	let names = ['../codebig.js'];
	names = names.concat(['bau1', 'bau2', 'bau3', 'bau4', 'codebig', 'start'].map(x => `${project}/${x}.js`));
	let di = await codeDictForFiles(names);
	console.log(di);
	codeDictToText(di, 'codebig.txt');
	return;
	// let keys = findFunctionClosure(di, ['loadAssetsStatic','loadColors','mBy','mClear','mDom','mKey','mPostPhp','mShade',"mStyle", 'test0']);
	let keys = findFunctionClosure(di, ['test1', 'test3']);
	console.log(keys);
	let sorted = Array.from(keys).sort();
	for (const k of sorted) {
		di[k].code = `\n${di[k].code}`;
	}
	const closureCode = sorted.map((name) => di[name].code).join('\n');
	downloadAsText(closureCode, 'codesmall.txt');

	//fs.writeFileSync(outputFile, closureCode, 'utf-8');

}
async function test2_coding() {
	let project = '../coding';
	let names = ['codebig', 'bau1', 'bau2', 'done'];
	let funcs = ['codeBigSmall', 'mBy', 'mDom', 'mKey', 'mShade', "mStyle"];

	codeBigSmall(project, names, funcs);
}
async function test2_todo() {
	let project = '../todo';
	let names = ['../codebig.js'];
	names = names.concat(['bau1', 'bau2', 'bau3', 'bau4', 'done'].map(x => `${project}/${x}.js`));
	let di = await codeDictForFiles(names);
	console.log(di);
	codeDictToText(di, 'codebig.txt');
	let keys = findFunctionClosure(di, ['loadAssetsStatic', 'loadColors', 'mBy', 'mClear', 'mDom', 'mKey', 'mPostPhp', 'mShade', "mStyle"]);
	console.log(keys);
	const closureCode = Array.from(keys).sort().map((name) => di[name].code).join('\r\n');
	downloadAsText(closureCode, 'codesmall.txt');

	//fs.writeFileSync(outputFile, closureCode, 'utf-8');

}
async function test1() {
	let project = '../coding';
	let names = ['output', 'done', 'bau1', 'bau2'];
	let di = await codeDictForFiles(names.map(x => `${project}/${x}.js`));
	console.log(di);
	codeDictToText(di, 'output.txt');
	let keys = findFunctionClosure(di, ['mBy', 'mDom', "mStyle"]);
	console.log(keys);

	const closureCode = Array.from(keys).sort().map((name) => di[name].code).join('\r\n');
	downloadAsText(closureCode, 'output1.txt');

	//fs.writeFileSync(outputFile, closureCode, 'utf-8');

}
async function test1_codeDictToText() {
	let names = ["../coding/output.js"];
	let di = await codeDictForFiles(names);
	console.log('di', di);
	let sortedKeys = codeDictToText(di);
}
async function test1_codeDictForFiles() {
	let names = ["../todo/closure.js", "../todo/bau1.js", "../todo/bau2.js", "../todo/bau3.js", "../todo/bau4.js"];
	let di = await codeDictForFiles(names);
	console.log('di', di);
	const sortedFunctionNames = Object.keys(di).sort();
	const result = sortedFunctionNames.map(name => di[name].code).join('\n');
	console.log(sortedFunctionNames)
	//	downloadAsText(result,'output.txt');
}
async function test0() {
	let res = await codeParseFile('../todo/codesmall.js');
	console.log('res', res);

}











