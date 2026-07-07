
function animateCardToHand(item, dTarget, onComplete) {

  let sourceDiv = iDiv(item);
  dTarget = toElem(dTarget);

  // 1. Get positions
  let startRect = sourceDiv.getBoundingClientRect();
  
  // We estimate the target position (usually the right side of the hand)
  let endRect = dTarget.getBoundingClientRect();
  let targetX = endRect.left + item.w; //startRect.width;endRect.left + (endRect.width > 0 ? endRect.width : 0);
  let targetY = endRect.top;

  // 2. Create a clone for the animation
  let flyingDiv = sourceDiv.cloneNode(true);
  flyingDiv.classList.add('flying-card');
  
  // Set initial position
  flyingDiv.style.width = startRect.width + 'px';
  flyingDiv.style.height = startRect.height + 'px';
  flyingDiv.style.left = startRect.left + 'px';
  flyingDiv.style.top = startRect.top + 'px';

  document.body.appendChild(flyingDiv);

  // 3. Trigger animation on the next frame
  requestAnimationFrame(() => {
    flyingDiv.style.left = targetX + 'px';
    flyingDiv.style.top = targetY + 'px';
    // Optional: make it slightly smaller or rotate it as it flies
    // flyingDiv.style.transform = 'rotate(15deg) scale(0.9)';
  });

  // 4. Cleanup and callback
  flyingDiv.addEventListener('transitionend', () => {
    flyingDiv.remove();
    onComplete();
  });
}


//#region possibly unneeded code from codefun.js
function cloneIfNecessary(value, optionsArgument) {
  var clone = optionsArgument && optionsArgument.clone === true
  return (clone && isMergeableObject(value)) ? deepmerge(emptyTarget(value), value, optionsArgument) : value
}
function cloneImage(img, targetDiv, x = 100, y = 100, w = 100, h = 100) {
  const clonedImage = img.cloneNode();
  clonedImage.style.position = 'absolute';
  clonedImage.style.left = `${x - w / 2}px`;
  clonedImage.style.top = `${y - h / 2}px`;
  clonedImage.style.width = `${w}px`;
  clonedImage.style.height = `${h}px`;
  targetDiv.appendChild(clonedImage);
  return clonedImage;
}
function closeLeftSidebar() { mClear('dLeft'); mStyle('dLeft', { w: 0, wmin: 0 }) }
function closePopup(name = 'dPopup') { if (isdef(mBy(name))) mBy(name).remove(); }
function clusterize(di, sz = 20) {
  const clustered = {};
  for (const key in di) {
    const [x, y] = key.split(',').map(Number);
    const clusterX = Math.floor(x / sz) * sz;
    const clusterY = Math.floor(y / sz) * sz;
    const clusterKey = `${clusterX},${clusterY}`;
    if (!clustered[clusterKey]) {
      clustered[clusterKey] = new Set();
    }
    di[key].forEach(value => clustered[clusterKey].add(value));
  }
  for (const key in clustered) {
    clustered[key] = Array.from(clustered[key]);
  }
  return clustered;
}
function cmdDisable(key) { mClass(mBy(key), 'disabled') }
function cmdEnable(key) { mClassRemove(mBy(key), 'disabled') }
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
  return [{ key: key, type: type, code: code }, i];
}
function codeParseBlocks(text) {
  let lines = text.split('\r\n');
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
async function homeOnclickDeleteBlog() {
  let ta = mByTag('textarea');
  if (nundef(ta)) return;
  let val = ta.value;
  let me = getUname();
  if (isEmptyOrWhiteSpace(val)) return;
  U.blog = [];
  await postUserChange();
}
async function homeOnclickEditBlog() {
  let ta = mByTag('textarea');
  if (nundef(ta)) return;
  ta.value = U.blog.map(x => x.text).join('\n');
}
async function homeOnclickSaveBlog() {
  let ta = mByTag('textarea');
  if (nundef(ta)) return;
  let val = ta.value;
  let me = getUname();
  if (isEmptyOrWhiteSpace(val)) return;
  lookupAddToList(U, ['blog'], { text: val, ts: getNow() });
  await postUserChange();
}
function homeSidebar(wmin = 150) {
  mStyle('dLeft', { wmin });
  let d = mDom('dLeft', { wmin: wmin - 10, matop: 20, h: window.innerHeight - getRect('dLeft').y - 102 }); //, bg:'#00000020'  }); 
  let gap = 5;
  let stylesTitles = { matop: 10, bg: '#ffffff80', fg: 'black' };
  let cmds = {};
  cmds.homeNew = mCommand(d, 'homeNew', 'New Entry'); mNewline(d, gap);
  UI.commands = cmds;
}
function initCodingUI() {
  mStyle('dMain', { bg: 'silver' });
  [dTable, dSidebar] = mCols100('dMain', '1fr auto', 0);
  let [dtitle, dta] = mRows100(dTable, 'auto 1fr', 2);
  mDiv(dtitle, { padding: 10, fg: 'white', fz: 24 }, null, 'OUTPUT:');
  AU.ta = mTextArea100(dta, { fz: 20, padding: 10, family: 'opensans' });
}
function initCrowd() {
  while (availablePeeps.length) {
    addPeepToCrowd().walk.progress(Math.random())
  }
}
function initSockets(username) {
  let socket = DA.socket = io("http://localhost:5000");  // Adjust if needed
  socket.on("connect", () => {
    console.log("Connected to server");
  });
  socket.on("chat_message", function (data) {
    showChatMessage(data);
  });
  socket.on("games_list", games => {
    showGamesList(games);
  });
  socket.on("game_started", data => {
    console.log("Game started:", data);
    document.getElementById("gameIdInput").value = data.gameid;
    document.getElementById("stateGameId").value = data.gameid;
    updateGameState(data.state);
  });
  socket.on("game_update", updateGameState);
  socket.on("state", updateGameState);
  socket.on("error", err => {
    console.error("Error:", err.message);
    alert("Server error: " + err.message);
  });
  socket.on("user_joined", msg => {
    const chatBox = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.textContent = `[JOIN] ${msg}`;
    div.style.color = "green";
    chatBox.appendChild(div);
  });
  socket.on("user_left", msg => {
    const chatBox = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.textContent = `[LEAVE] ${msg}`;
    div.style.color = "red";
    chatBox.appendChild(div);
  });
  socket.emit("register", { username });
}
async function initTest() {
  API_BASE = getBackendUrl();
  DA.items = {};
  DA.selectedImages = [];
  await loadAssetsStatic();
  stickyHeaderCode();
  let elems = mLayoutLM('dPage');
  mStyle('dMain', { overy: 'auto' });
  let dLeft = mBy('dLeft');
  mStyle(dLeft, { overy: 'auto' });
}
function mSidebar(dParent = 'dLeft', wmin = 170, styles = {}, opts = {}) {
  dParent = toElem(dParent);
  mStyle(dParent, { wmin: wmin, patop: 25 });
  let d = mDom(dParent, styles, opts);
  return { wmin, d }
}
function settingsSidebar() {
  let wmin = 170;
  mStyle('dLeft', { wmin: wmin });
  let d = mDom('dLeft', { wmin: wmin - 10, margin: 10, matop: 160, h: window.innerHeight - getRect('dLeft').y - 102 }); //, bg:'#00000020'  }); 
  let gap = 5;
  UI.commands.settThemeEditor = mCommand(d, 'settThemeEditor', 'Theme Editor', { save: true }); mNewline(d, gap);
  UI.commands.settTheme = mCommand(d, 'settTheme', 'Themes', { save: true }); mNewline(d, gap);
  UI.commands.settColor = mCommand(d, 'settColor', 'Color', { save: true }); mNewline(d, gap);
  UI.commands.settFg = mCommand(d, 'settFg', 'Text Color', { save: true }); mNewline(d, gap);
  UI.commands.settTexture = mCommand(d, 'settTexture', 'Texture', { save: true }); mNewline(d, gap);
  UI.commands.settBlendMode = mCommand(d, 'settBlendMode', 'Blend Mode', { save: true }); mNewline(d, 2 * gap);
  UI.commands.settRemoveTexture = mCommand(d, 'settRemoveTexture', 'Remove Texture'); mNewline(d, gap);
  UI.commands.settResetAll = mCommand(d, 'settResetAll', 'Revert Settings'); mNewline(d, gap);
  UI.commands.settAddYourTheme = mCommand(d, 'settAddYourTheme', 'Add Your Theme'); mNewline(d, gap);
  UI.commands.settDeleteTheme = mCommand(d, 'settDeleteTheme', 'Delete Theme'); mNewline(d, gap);
}
function simpleCheckCommands() {
  if (nundef(UI.selectedImages)) UI.selectedImages = [];
  let n = UI.selectedImages.length;
  for (const k in UI.commands) {
    let cmd = UI.commands[k];
    if (nundef(cmd) || nundef(iDiv(cmd)) || nundef(mBy(k))) continue;
    if (nundef(cmd.fSel) || cmd.fSel(n)) cmdEnable(k); else cmdDisable(k);
  }
}
function simpleClearSelections() {
  mClearAllSelections();
  simpleCheckCommands();
}
async function simpleFinishEditing(canvas, dPopup, inpFriendly, inpCats, sisi) {
  const dataUrl = canvas.toDataURL('image/png'); //davon jetzt die dataUrl!
  if (isEmpty(inpFriendly.value)) inpFriendly.value = 'pic'
  let friendly = inpFriendly.value;
  let [name, imgname] = findUniqueSuperdiKey(friendly);
  console.log('key name will be', name, imgname);
  let key = name, filename = name + '.png';
  let o = { image: dataUrl, coll: sisi.name, filename };
  let resp = await mPostRoute('postImage', o); //console.log('resp', resp); //sollte path enthalten!
  filename = resp.filename;
  let imgPath = `../assets/img/${sisi.name}/${filename}`;
  let cats = extractWords(valf(inpCats.value, ''));
  let item = isdef(M.superdi[key]) ? jsCopy(M.superdi[key]) : { key, friendly, cats, colls: [] };
  item[valf(imgname, 'img')] = imgPath;
  dPopup.remove();
  await simpleOnDroppedItem(item, key, sisi);
}
function simpleInit(name, sisi) {
  if (nundef(name) && isdef(UI.simple)) { sisi = UI.simple; name = sisi.name; }
  let isReload = isdef(sisi.index) && sisi.name == name;
  if (!isReload) { sisi.index = 0; sisi.pageIndex = 1; sisi.name = name; sisi.filter = null; }
  let list = [];
  if (name == 'all' || isEmpty(name)) { list = Object.keys(M.superdi); }
  else if (isdef(M.byCollection[name])) { list = M.byCollection[name]; }
  else list = [];
  localStorage.setItem('sisi', name)
  let dMenu = sisi.dMenu;
  mClear(dMenu);
  let d = mDom(dMenu); mFlexV(d);
  mDom(d, { fz: 24, weight: 'bold' }, { html: 'Collection:' });
  let collNames = M.collections;
  let dlColl = mDatalist(d, collNames, { placeholder: "<select from list>" });
  dlColl.inpElem.oninput = ev => { console.log(sisi.name, ev.target.value); simpleInit(ev.target.value, sisi); }
  dlColl.inpElem.value = name;
  list = sortByFunc(list, x => M.superdi[x].friendly);
  sisi.masterKeys = list;
  sisi.keys = sisi.filter ? collFilterImages(sisi, sisi.filter) : list;
  let cats = collectCats(sisi.keys);
  cats.sort();
  d = mDom(dMenu); mFlexV(d);
  let wLabel = sisi.cols < 6 ? 117 : 'auto';
  mDom(d, { fz: 24, weight: 'bold', w: wLabel, align: 'right' }, { edit: true, html: 'Filter:' });
  let dlCat = mDatalist(d, cats, { edit: false, placeholder: "<enter value>", value: sisi.filter });
  dlCat.inpElem.oninput = ev => {
    let coll = UI.simple;
    let s = ev.target.value.toLowerCase().trim();
    let list = collFilterImages(coll, s);
    coll.keys = list;
    coll.filter = s;
    coll.index = 0; coll.pageIndex = 1; simpleClearSelections();
    simpleShowImageBatch(coll, 0, false);
  };
  d = mDom(dMenu, { gap: 10, align: 'right' });
  mButton('prev', () => simpleShowImageBatch(sisi, -1), d, { w: 70, margin: 0, maleft: 10 }, 'input', 'bPrev');
  mButton('next', () => simpleShowImageBatch(sisi, 1), d, { w: 70, margin: 0, maleft: 10 }, 'input', 'bNext');
  simpleClearSelections();
  simpleShowImageBatch(sisi);
}
function simpleLocked(collname) {
  if (nundef(collname)) collname = lookup(UI, ['simple', 'name']);
  if (!collname) return true;
  return getUname() != '_unsafe' && ['all', 'emo', 'fa6', 'icon', 'nations', 'users'].includes(collname);
}
async function simpleOnDropImage(ev, elem) {
  let dt = ev.dataTransfer;
  if (dt.types.includes('itemkey')) {
    let data = ev.dataTransfer.getData('itemkey');
    await simpleOnDroppedItem(data);
  } else {
    const files = ev.dataTransfer.files;
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = async (evReader) => {
        let data = evReader.target.result;
        await simpleOnDroppedUrl(data, UI.simple);
      };
      reader.readAsDataURL(files[0]);
    }
  }
}
async function simpleOnDroppedItem(itemOrKey, key, sisi) {
  if (nundef(sisi)) sisi = UI.simple;
  let item;
  if (isString(itemOrKey)) { key = itemOrKey; item = M.superdi[key]; } else { item = itemOrKey; }
  assertion(isdef(key), 'NO KEY!!!!!');
  lookupAddIfToList(item, ['colls'], sisi.name);
  let o = M.superdi[key];
  if (isdef(o)) {
    console.log(`HA! ${key} already there`);
    let changed = false;
    for (const k in item) {
      let val = item[k];
      if (isLiteral(val) && o[k] != item[k]) { changed = true; break; }
      else if (isList(val) && !sameList(val, o[k])) { changed = true; break; }
    }
    if (!changed) return;
  }
  console.log(`........But changed!!!`);
  let di = {}; di[key] = item;
  await updateSuperdi(di);
  simpleInit(sisi.name, sisi)
}
async function simpleOnDroppedUrl(src, sisi) {
  let sz = 400;
  let dPopup = mDom(document.body, { position: 'fixed', top: 40, left: 0, wmin: sz, hmin: sz, bg: 'pink' });
  let dParent = mDom(dPopup);
  let d = mDom(dParent, { w: sz, h: sz, border: 'dimgray', margin: 10 });
  let canvas = createPanZoomCanvas(d, src, sz, sz);
  let instr = mDom(dPopup, { align: 'center', mabot: 10 }, { html: `- panzoom image to your liking -` })
  let dinp = mDom(dPopup, { padding: 10, align: 'right', display: 'inline-block' })
  mDom(dinp, { display: 'inline-block' }, { html: 'Name: ' });
  let inpFriendly = mDom(dinp, { outline: 'none', w: 200 }, { className: 'input', name: 'friendly', tag: 'input', type: 'text', placeholder: `<enter name>` });
  let defaultName = '';
  let iDefault = 1;
  let k = sisi.masterKeys.find(x => x == `${sisi.name}${iDefault}`);
  while (isdef(k)) { iDefault++; k = sisi.masterKeys.find(x => x == `${sisi.name}${iDefault}`); }
  defaultName = `${sisi.name}${iDefault}`;
  inpFriendly.value = defaultName;
  mDom(dinp, { h: 1 });
  mDom(dinp, { display: 'inline-block' }, { html: 'Categories: ' })
  let inpCats = mDom(dinp, { outline: 'none', w: 200 }, { className: 'input', name: 'cats', tag: 'input', type: 'text', placeholder: `<enter categories>` });
  let db2 = mDom(dPopup, { padding: 10, display: 'flex', gap: 10, 'justify-content': 'end' });
  mButton('Cancel', () => dPopup.remove(), db2, { w: 70 }, 'input');
  mButton('Save', () => simpleFinishEditing(canvas, dPopup, inpFriendly, inpCats, sisi), db2, { w: 70 }, 'input');
}
async function simpleOnclickItem(ev) {
  let id = evToId(ev);
  let item = UI.simple.items[id]; if (nundef(item)) return;
  let selkey = item.key;
  toggleSelectionOfPicture(iDiv(item), selkey, UI.selectedImages);
  simpleCheckCommands();
}
async function simpleOnclickLabel(ev) {
  evNoBubble(ev);
  let id = evToId(ev); console.log('id', id)
  let o = lookup(UI.simple, ['items', id]);
  if (!o) return;
  console.log('clicked label of', o);
  let [key, elem, collname] = [o.key, o.name, iDiv(o)];
  let newfriendly = await mGather(ev.target);
  if (!newfriendly) return;
  if (isEmpty(newfriendly)) {
    showMessage(`ERROR: name invalid: ${newfriendly}`);
    return;
  }
  console.log('rename friendly to', newfriendly)
  let item = M.superdi[key];
  item.friendly = newfriendly;
  let di = {};
  di[key] = item;
  let res = await mPostRoute('postUpdateSuperdi', { di });
  console.log('postUpdateSuperdi', res)
  await loadAssets();
  ev.target.innerHTML = newfriendly;
}
async function simpleSetAvatar(key) {
  U.imgKey = key;
  let res = await postUserChange(U);
}
function simpleShowImageBatch(sisi, inc = 0, alertEmpty = false) {
  let [keys, index, numCells] = [sisi.keys, sisi.index, sisi.rows * sisi.cols];
  if (isEmpty(keys) && alertEmpty) showMessage('nothing has been added to this collection yet!');
  if (keys.length <= numCells) inc = 0;
  let newPageIndex = sisi.pageIndex + inc;
  let numItems = keys.length;
  let maxPage = Math.max(1, Math.ceil(numItems / numCells));
  if (newPageIndex > maxPage) newPageIndex = 1;
  if (newPageIndex < 1) newPageIndex = maxPage;
  index = numCells * (newPageIndex - 1);
  let list = arrTakeFromTo(keys, index, index + numCells);
  sisi.index = index; sisi.pageIndex = newPageIndex;
  sisi.items = {};
  let name = sisi.name;
  for (let i = 0; i < list.length; i++) {
    let key = list[i];
    let d = sisi.cells[i];
    mStyle(d, { opacity: 1 });
    mClass(d, 'magnifiable')
    let id = getUID();
    let d1 = simpleShowImageInBatch(key, d, {}, { prefer: sisi.name == 'emo' ? 'img' : 'photo' });
    d1.id = id;
    let item = { div: d1, key, name, id, index: i, page: newPageIndex };
    sisi.items[id] = item;
    if (isList(UI.selectedImages) && UI.selectedImages.includes(key)) mSelect(d1);
  }
  for (let i = list.length; i < numCells; i++) {
    mStyle(sisi.cells[i], { opacity: 0 })
  }
  sisi.dPageIndex.innerHTML = `page ${sisi.pageIndex}/${maxPage}`;
  let [dNext, dPrev] = [mBy('bNext'), mBy('bPrev')];
  if (maxPage == 1) { mClass(dPrev, 'disabled'); mClass(dNext, 'disabled'); }
  else { mClassRemove(dPrev, 'disabled'); mClassRemove(dNext, 'disabled'); }
}
function simpleShowImageInBatch(key, dParent, styles = {}, opts = {}) {
  let o = M.superdi[key]; o.key = key;
  addKeys({ bg: rColor() }, styles);
  mClear(dParent);
  [w, h] = [dParent.offsetWidth, dParent.offsetHeight];
  let [sz, fz] = [.9 * w, .8 * h];
  let d1 = mDiv(dParent, { position: 'relative', w: '100%', h: '100%', padding: 11, box: true });//overflow: 'hidden', 
  mCenterCenterFlex(d1)
  let el = null;
  let src = (opts.prefer == 'photo' && isdef(o.photo)) ? o.photo : valf(o.img, null);
  if (isdef(src)) {
    if (o.cats.includes('card')) {
      el = mDom(d1, { h: '100%', 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src });
      mDom(d1, { h: 1, w: '100%' })
    } else {
      el = mDom(d1, { w: '100%', h: '100%', 'object-fit': 'cover', 'object-position': 'center center' }, { tag: 'img', src });
    }
  }
  else if (isdef(o.text)) el = mDom(d1, { fz: fz, hline: fz, family: 'emoNoto', fg: rColor(), display: 'inline' }, { html: o.text });
  else if (isdef(o.fa)) el = mDom(d1, { fz: fz, hline: fz, family: 'pictoFa', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa) });
  else if (isdef(o.ga)) el = mDom(d1, { fz: fz, hline: fz, family: 'pictoGame', bg: 'beige', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.ga) });
  else if (isdef(o.fa6)) el = mDom(d1, { fz: fz, hline: fz, family: 'fa6', bg: 'transparent', fg: rColor(), display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
  assertion(el, 'PROBLEM mit' + key);
  let label = mDom(d1, { fz: 11, cursor: 'pointer' }, { html: o.friendly, className: 'ellipsis hoverHue' });
  label.onclick = simpleOnclickLabel;
  mStyle(d1, { cursor: 'pointer' });
  d1.onclick = simpleOnclickItem;
  d1.setAttribute('key', key);
  d1.setAttribute('draggable', true)
  d1.ondragstart = ev => { ev.dataTransfer.setData('itemkey', key); }
  return d1;
}
function simpleSidebar(wmin) {
  mStyle('dLeft', { wmin });
  let d = mDom('dLeft', { wmin: wmin - 10, matop: 20, h: window.innerHeight - getRect('dLeft').y - 102 }); //, bg:'#00000020'  }); 
  let gap = 5;
  let stylesTitles = { matop: 10, bg: '#ffffff80', fg: 'black' };
  let cmds = {};
  cmds.simpleNew = mCommand(d, 'simpleNew', 'New'); mNewline(d, gap);
  mDom(d, stylesTitles, { html: 'Selection:' })
  cmds.simpleSelectAll = mCommand(d, 'simpleSelectAll', 'Select All'); mNewline(d, gap);
  cmds.simpleSelectPage = mCommand(d, 'simpleSelectPage', 'Select Page'); mNewline(d, gap);
  cmds.simpleClearSelections = mCommand(d, 'simpleClearSelections', 'Clear Selection', { fSel: x => x >= 1 }); mNewline(d, gap);
  mDom(d, stylesTitles, { html: 'Item:' })
  cmds.setAvatar = mCommand(d, 'setAvatar', 'Set Avatar', { fSel: x => x == 1 }); mNewline(d, gap);
  cmds.editDetails = mCommand(d, 'editDetails', 'Edit Details', { fSel: x => x == 1 }); mNewline(d, gap);
  mDom(d, stylesTitles, { html: 'Items:' })
  cmds.addSelected = mCommand(d, 'addSelected', 'Add To', { fSel: x => (x >= 1) }); mNewline(d, gap);
  cmds.simpleRemove = mCommand(d, 'simpleRemove', 'Remove', { fSel: x => (!simpleLocked() && x >= 1) }); mNewline(d, gap);
  UI.commands = cmds;
  simpleCheckCommands();
}
async function simpleUpload(route, o) {
  let server = getServerurl();
  server += `/${route}`;
  const response = await fetch(server, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    body: JSON.stringify(o)
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    return 'ERROR 1';
  }
}


//#endregion

function set_journey_or_stall_stage(table) {
	console.log(table)
	let fen = table.fen, options = table.options, phase = table.fen.phase, plorder = fen.plorder;
	console.log('set_journey_or_stall_stage', plorder, options);
	let pljourney = exp_journeys(options) ? find_players_with_potential_journey(fen) : [];
	console.log('pljourney', pljourney);
	let stage, turn;
	if (isEmpty(pljourney)) {
		delete fen.passed;
		turn = [fen.plorder[0]];
		//ari_ensure_deck(fen, phase == 'jack' ? 3 : 2); 
		//stage = 3; 
		fen.stage = phase == 'jack' ? 12 : phase == 'queen' ? 11 : 4;
		fen.stallSelected = [];

	} else { turn = [pljourney[0]]; stage = 1; }
	return [stage, turn];
}

async function tablesDeleteAll() {
  let res = await mPhpPost('all', { action: 'delete_dir', dir: 'tables' });
  if (VERBOSE) console.log('res', res);
  DA.tid = null;
  localStorage.removeItem('tid');
  await switchToMenu('games');
}


//#region alles mit Z. oder fen.turn oder fen.players



function bluff_change_to_ack_round(fen, nextplayer) {
  [Z.stage, Z.turn] = [1, [get_admin_player(fen.plorder)]];
  fen.keeppolling = true;
  fen.nextturn = [nextplayer];
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
  let words = get_keys(torank).slice(1);
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
  let expected = all_hand_cards.length / 13;
  let nreason = Math.max(1, Math.round(expected * 2));
  let n_twos = all_hand_cards.filter(x => x[0] == '2').length;
  let have2 = firstCond(rank_list, x => x.rank == '2' && x.mine);
  return botbest(rank_list, maxcount, mymaxcount, expected, nreason, n_twos, have2, words, fen);
}
function bluff_clear_panel(me, table, ui) {
  let fen = table.fen;
  for (const item of ui.panelItems) {
    let d = iDiv(item);
    d.innerHTML = ' _ ';
  }
  fen.newbid = ['_', '_', '_', '_'];
}
function bluff_convert2ranks(b) { return [b[0], BLUFF.torank[b[1]], b[2] == '_' ? 0 : b[2], BLUFF.torank[b[3]]]; }
function bluff_convert2words(b) { return [b[0], BLUFF.toword[b[1]], b[2] < 1 ? '_' : b[2], BLUFF.toword[b[3]]]; }
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
      else if (b[0] > b[2]) { b[2] += 1; }
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
function bluff_orig() {
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
        hand: cDeckDeal(deck, handsize),
        handsize: handsize,
        name: plname,
        color: get_user_color(plname),
      };
    }
    fen.stage = 0;
    return fen;
  }
  function clear_ack() { if (Z.stage == 1) { bluff_change_to_turn_round(); take_turn_fen(); } }
  function check_gameover(Z) {
    let pls = get_keys(Z.fen.players);
    if (pls.length < 2) Z.fen.winners = pls;
    return valf(Z.fen.winners, false);
  }
  function activate_ui() { bluff_activate_new(); }
  function present(dParent) { bluff_present(dParent); }
  function stats(dParent) { bluff_stats(dParent); }
  function state_info(dParent) { bluff_state(dParent); }
  return { rankstr, setup, activate_ui, check_gameover, clear_ack, present, state_info, stats };
}
function bluff_present(dParent) {
  let [dOben, dOpenTable, dMiddle, dRechts] = tableLayoutMR(dParent, 1, 0);
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
function bluff_reset_to_current_bid() { onclick_reload(); }
function bluff_show_cards(dt) {
  let [fen, ui, stage, uplayer] = [Z.fen, UI, Z.stage, Z.uplayer];
  let pl = fen.players[uplayer], upl = ui.players[uplayer] = {};
  mText(stage == 1 ? "all players' cards: " : "player's hand: ", dt); mLinebreak(dt, 2);
  let cards = stage == 1 ? fen.akku : pl.hand;
  cards = sort_cards(cards, false, 'CDSH', true, '3456789TJQKA2'); // immer by rank!
  let hand = upl.hand = ui_type_hand(cards, dt, { hmin: 160 }, null, '', ckey => ari_get_card(ckey, 150));
  let uname_plays = isdef(fen.players[Z.uname]);;
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
function bluff_show_new_bid(dt, fen) {
  let bid = fen.oldbid = valf(fen.lastbid, ['_', '_', '_', '_']);
  fen.newbid = jsCopy(bid);
  let d = mDiv(dt);
  let content = `${bid_to_string(bid)}`;
  let item = { container: d, label: 'YOUR bid', content: content, caption: 'BID', handler: handle_bid };
  apply_skin3(item);
}
function bluff_state(dParent) {
  let user_html = get_user_pic_html(Z.uplayer, 30);
  dParent.innerHTML = `Round ${Z.round}:&nbsp;player: ${user_html} `;
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
    fen.lastbid = fen.players[uplayer].lastbid = bid;
    fen.lastbidder = uplayer;
    delete fen.oldbid; delete fen.newbid;
    Z.turn = [get_next_player(Z, uplayer)];
    take_turn_fen();
  }
}

function ari_stats(dParent) {
	let player_stat_items = UI.player_stat_items = ui_player_info(dParent);
	let fen = Z.fen;
	let herald = fen.heraldorder[0];
	for (const plname in fen.players) {
		let pl = fen.players[plname];
		let item = player_stat_items[plname];
		let d = iDiv(item); console.log('item', item, 'd', d)
		console.log('ari_stats for player', plname, pl, item);
		console.log(d)
		mCenterFlex(d); mLinebreak(d);
		if (plname == herald) {
			mSym('tied-scroll', d, { fg: 'gold', fz: 24, padding: 4 }, 'TR');
		}
		if (exp_church(table.options)) {
			if (isdef(pl.tithes)) {
				player_stat_count('cross', pl.tithes.val, d);
			}
		}
		let dCoin = player_stat_count('coin', pl.coins, d);
		item.dCoin = dCoin.firstChild;
		item.dAmount = dCoin.children[1];
		let list = pl.hand.concat(pl.stall);
		let list_luxury = list.filter(x => x[2] == 'l');
		player_stat_count('pinching hand', list.length, d);
		let d1 = player_stat_count('hand-holding-usd', list_luxury.length, d);
		mStyle(d1.firstChild, { fg: 'gold', fz: 20 })
		if (!isEmpty(fen.players[plname].stall) && fen.stage >= 5 && fen.stage <= 6) {
			player_stat_count('shinto shrine', !fen.actionsCompleted.includes(plname) || fen.stage < 6 ? calc_stall_value(fen, plname) : '_', d);
		}
		player_stat_count('star', plname == U.name || isdef(fen.winners) ? ari_calc_real_vps(fen, plname) : ari_calc_fictive_vps(fen, plname), d);
		if (fen.turn.includes(plname)) {
			show_hourglass(plname, d, 30, { left: -3, top: 0 }); //'calc( 50% - 36px )' });
		}
	}
}


//#endregion


//#region closure

function is_playerdata_set(plname) {
	return isdef(Z.playerdata) && !isEmpty(Z.playerdata) && !isEmpty(Z.playerdata.find(x => x.name == plname).state);
}


function ariShowPhase(table) {
	let d = mBy('dTitleLeft');
	//mDom()

	mCenterFlex(d);
	mClear(d);
	let fen = table.fen;
	let phase = fen.phase;
	let stage = fen.stage;
	mDom(d, { fz: 24, family: 'opensans', weight: 'bold' }, { html: phase });

	let pl = table.players[plname];
	let src = MGetUserImageSource(plname);
	let cimgborder = pl.color;
	let sz = 20;
	let img = mDom(d0, { border: `1px solid ${cimgborder}`, maleft: 4, bg: 'beige', h: sz, w: sz, round: pl.playmode !== 'bot' }, { tag: 'img', src });

	let user_html = get_user_pic_html(table.turn[0], 30);
	let phase_html = get_phase_html(table);
	// let phase = table.fen.phase;
	if (isEmpty(phase) || phase == 'over') return null; //capitalize(Z.friendly);
	let rank = phase[0].toUpperCase();
	let ucard = uiTypeCard52(rank + 'H', 40, 'white', 'black', 1, false);
	//let d = iDiv(ucard);
	mClassRemove(d.firstChild, 'card');
	return iDiv(ucard).outerHTML;
	//let phase = table.fen.phase;

	let html = '&nbsp;&nbsp;';
	if (phase_html) html += `${phase}:&nbsp;${phase_html}`;
	if (table.fen.stage == 17) { html += `&nbsp;&nbsp;CHURCH EVENT!!!`; }
	else html += `&nbsp;player: ${user_html} `;
	mBy('dTitle').firstChild.innerHTML = html;
}


function remove_card_shadow(c) { iDiv(c).firstChild.setAttribute('class', null); }

function _correct_handsorting(hand, plname) {
	let pl = Z.fen.players[plname];
	let [cs, pls, locs] = [Clientdata.handsorting, pl.handsorting, localStorage.getItem('handsorting')];
	let s = cs ?? pls ?? locs ?? Config.games[Z.game].defaulthandsorting;
	hand = sort_cards(hand, s == 'suit', 'CDSH', true, Z.func.rankstr);
	return hand;
}

function ui_add_container_title(title, cont, items, show_if_empty) {
	
	//mDom(cont,{w100:true},{className:'centered',html:title}); return;
	if (isdef(title) && (!isEmpty(items) || show_if_empty)) {
		let st = get_containertitle_styles();
		let stmeasure = jsCopy(st); delete stmeasure.position;
		let elem = mText(title, cont, stmeasure);
		let sz = getSizeNeeded(elem);
		let offsetx = valf(st.left, 0);
		let cont_wmin = mGetStyle(cont, 'wmin');
		let my_min = sz.w + offsetx * 1.5;
		let wmin = !isNumber(cont_wmin) ? my_min : Math.max(valf(cont_wmin, 0), my_min);
		mStyle(cont, { wmin: wmin });
		mStyle(elem, st);
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
		mContainerSplay(d, 2, card.w, card.h, items.length, card.ov * card.w);
	}
	return d;
}


function _ui_type_church(list, dParent, styles = {}, path = 'trick', title = '', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont, { display: 'flex' });
	let items = [];
	let n = Z.plorder.length;
	let inc = 90;
	let rotation = n % 2 ? 0 : 90;
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
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}

function _arrRepeat(n, el) { let res = []; for (let i = 0; i < n; i++) res.push(el); return res; }

function ariSetup(players, options) {
	let fen = { players: {}, plorder: jsCopy(players), history: [] };
	let n = players.length;
	let num_decks = fen.num_decks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
	let deck = fen.deck = create_fen_deck('n', num_decks);
	shuffle(deck);
	let deck_commission = fen.deck_commission = create_fen_deck('c'); shuffle(deck_commission);
	let deck_luxury = fen.deck_luxury = create_fen_deck('l'); shuffle(deck_luxury);
	console.log('options', options)
	let deck_rumors = fen.deck_rumors = exp_rumors(options) ? create_fen_deck('r') : []; shuffle(deck_rumors);
	shuffle(fen.plorder);
	fen.market = deck_deal(deck, 2);
	fen.deck_discard = [];
	fen.open_discard = [];
	fen.commissioned = [];
	fen.open_commissions = exp_commissions(options) ? deck_deal(deck_commission, 3) : [];
	fen.church = exp_church(options) ? deck_deal(deck, players.length) : [];
	for (const plname of players) {
		let pl = fen.players[plname] = {
			hand: deck_deal(deck, 7),
			commissions: exp_commissions(options) ? deck_deal(deck_commission, 4) : [],
			rumors: exp_rumors(options) ? deck_deal(deck_rumors, players.length - 1) : [],
			journeys: [], //options.journey == 'no' ? [] : coin() ? [['QSr', 'KSr']] : [['3Cr', '4Cr']],
			buildings: { farm: [], estate: [], chateau: [] },
			stall: [],
			stall_value: 0,
			coins: 3,
			vps: 0,
			score: 0,
			name: plname,
			color: get_user_color(plname),
		};
	}
	fen.phase = 'king'; //TODO: king !!!!!!!
	fen.num_actions = 0;
	fen.herald = fen.plorder[0];
	fen.heraldorder = jsCopy(fen.plorder);
	if (exp_commissions(options)) {
		ari_history_list([`commission trading starts`], 'commissions', fen);
		[fen.stage, fen.turn] = [23, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder]; fen.comm_setup_num = 3; fen.keeppolling = true;
	} else if (exp_rumors(options) && fen.plorder.length > 2) {
		ari_history_list([`gossiping starts`], 'rumors', fen);
		[fen.stage, fen.turn] = [24, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder];
	} else[fen.stage, fen.turn] = set_journey_or_stall_stage(fen, options, fen.phase);
	return fen;
}


function mPlace(elem, pos, offx, offy) {
	elem = toElem(elem);
	pos = pos.toLowerCase();
	let dParent = elem.parentNode; if (dParent.style.position != 'absolute') dParent.style.position = 'relative';
	let vert = valf(offx, 0); // valf(margin, Math.max(wSym,hSym) / 10); //0;
	let hor = isdef(offy) ? offy : vert;
	if (pos[0] == 'c' || pos[1] == 'c') {
		let rParent = getRect(dParent);
		let [wParent, hParent] = [rParent.w, rParent.h];
		let rElem = getRect(elem);
		let [wElem, hElem] = [rElem.w, rElem.h];
		switch (pos) {
			case 'cc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert + (hParent - hElem) / 2 }); break;
			case 'tc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, top: vert }); break;
			case 'bc': mStyle(elem, { position: 'absolute', left: hor + (wParent - wElem) / 2, bottom: vert }); break;
			case 'cl': mStyle(elem, { position: 'absolute', left: hor, top: vert + (hParent - hElem) / 2 }); break;
			case 'cr': mStyle(elem, { position: 'absolute', right: hor, top: vert + (hParent - hElem) / 2 }); break;
		}
		return;
	}
	let di = { t: 'top', b: 'bottom', r: 'right', l: 'left' };
	elem.style.position = 'absolute';
	elem.style[di[pos[0]]] = hor + 'px'; elem.style[di[pos[1]]] = vert + 'px';
}
function mPopup(content, dParent, styles, id) {
	if (isdef(mBy(id))) mRemove(id);
	mIfNotRelative(dParent);
	if (nundef(styles)) styles = { top: 0, left: 0 };
	styles.position = 'absolute';
	let d1 = mDiv(dParent, styles, valf(id, getUID()), content);
	return d1;
}



function _get_c52j_info(ckey, backcolor = BLUE) {
	let info;
	if (ckey[0] == '*') {
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
function _get_color_of_card(ckey) { return is_color(ckey) ? ckey : ckey.length == 3 ? ['H', 'D'].includes(ckey[1]) ? 'red' : 'black' : stringAfter(ckey, '_'); }
function _get_container_styles(styles = {}) { let defaults = valf(Config.ui.container, {}); defaults.position = 'relative'; addKeys(defaults, styles); return styles; }
function _get_containertitle_styles(styles = {}) { let defaults = valf(Config.ui.containertitle, {}); defaults.position = 'absolute'; addKeys(defaults, styles); return styles; }
function _get_group_rank(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[0]; }
function _get_joker_info() {
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
function _get_sequence_suit(j) { let non_jolly_key = firstCond(j, x => !is_jolly(x)); return non_jolly_key[1]; }


function ui_type_building(b, dParent, styles = {}, path = 'farm', title = '', get_card_func = ari_get_card, separate_lead = false, ishidden = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let cardcont = mDiv(cont);
	let list = b.list;
	let d = mDiv(dParent);
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
	if (!isEmpty(b.rumors)) {
		let d = cont;
		mStyle(d, { position: 'relative' });
		d_rumors = mDiv(d, { display: 'flex', gap: 2, position: 'absolute', h: 30, bottom: 0, right: 0 }); //,bg:'green'});
		for (const rumor of b.rumors) {
			let dr = mDiv(d_rumors, { h: 24, w: 16, vmargin: 3, align: 'center', bg: 'dimgray', rounding: 2 }, null, 'R');
			rumorItems.push({ div: dr, key: rumor });
		}
	}
	let card = isEmpty(items) ? { w: 1, h: 100, ov: 0 } : items[0];
	let [ov, splay] = separate_lead ? [card.ov * 1.5, 5] : [card.ov, 2];
	mContainerSplay(cardcont, 5, card.w, card.h, items.length, card.ov * 1.5 * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items);
	let uischweine = [];
	for (let i = 1; i < items.length; i++) {
		let item = items[i];
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
function _ui_type_hand(list, dParent, styles = {}, path = 'hand', title = 'hand', get_card_func = ari_get_card, show_if_empty = false) {
	let cont = ui_make_container(dParent, get_container_styles(styles));
	let items = list.map(x => get_card_func(x));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: Config.ui.card.h, ov: 0 } : items[0];
	let splay = 2;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items, show_if_empty);
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
	let items = list.map(x => get_card_func(x, hcard));
	let cardcont = mDiv(cont);
	let card = isEmpty(items) ? { w: 1, h: hcard, ov: 0 } : items[0];
	let splay = 5;
	mContainerSplay(cardcont, splay, card.w, card.h, items.length, card.ov * card.w);
	ui_add_cards_to_hand_container(cardcont, items, list);
	ui_add_container_title(title, cont, items, show_if_empty);
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
	ui_add_container_title(title, cont, items, show_if_empty);
	return {
		list: list,
		path: path,
		container: cont,
		cardcontainer: cardcont,
		items: items,
	}
}

function _get_user_color(uname) { let u = firstCond(Serverdata.users, x => x.name == uname); return colorFrom(u.color); }
function _get_user_pic(uname, sz = 50, border = 'solid medium white') {
	let html = get_user_pic_html(uname, sz, border); // `<img src='../base/assets/images/${uname}.jpg' width='${sz}' height='${sz}' class='img_person' style='margin:0px 4px;border:${border}'>`
	return mCreateFrom(html);
}
function compute_hidden(plname) {
	let [fen, uplayer] = [Z.fen, Z.uplayer];
	let pl = fen.players[plname];
	let hidden;
	if (isdef(fen.winners)) hidden = false;
	else if (Z.role == 'spectator') hidden = plname != uplayer;
	else if (Z.mode == 'hotseat') hidden = (pl.playmode == 'bot' || plname != uplayer);
	else hidden = plname != Z.uname;
	return hidden;
}
function get_present_order(me,table) {
	let [fen, uplayer, uname] = [Z.fen, Z.uplayer, Z.uname];
	assertion(is_human_player(uplayer) || uname == Z.host, "PRESENT ORDER ME WRONG!!!!!!!!!!!!!")
	let uname_plays = fen.plorder.includes(uname);
	let is_bot = !is_human_player(uplayer);
	let show_first = Z.mode == 'multi' && uname_plays && !is_bot ? Z.uname : uplayer;
	return arrCycle(Z.fen.plorder, Z.fen.plorder.indexOf(show_first));
}


//#endregion

function face_down(item, color, texture) {
  if (!item.faceUp) return;
  if (isdef(texture) || lookup(item, ['live', 'dCover'])) {
    face_down_alt(item, color, texture);
  } else {
    let svgCode = C52.card_2B;
    item.div.innerHTML = svgCode;
    if (nundef(color)) color = item.color;
    if (isdef(item.color)) item.div.children[0].children[1].setAttribute('fill', item.color);
  }
  item.faceUp = false;
}
function face_down_alt(item, bg, texture_name) {
  let dCover = item.live.dCover;
  if (nundef(dCover)) {
    let d = iDiv(item);
    dCover = item.live.dCover = mDiv(d, { background: bg, rounding: mGetStyle(d, 'rounding'), position: 'absolute', width: '100%', height: '100%', left: 0, top: 0 });
    let t = get_texture(texture_name);
    dCover.style.backgroundImage = t;
    dCover.style.backgroundRepeat = 'repeat';
  } else mStyle(dCover, { display: 'block' });
}
function face_up(item) {
  if (item.faceUp) return;
  if (lookup(item, ['live', 'dCover'])) mStyle(item.live.dCover, { display: 'none' });
  else item.div.innerHTML = isdef(item.c52key) ? C52[item.c52key] : item.html;
  item.faceUp = true;
}


function _aristo() {
	const rankstr = 'A23456789TJQK*';
	function setup(players, options) {
		let fen = { players: {}, plorder: jsCopy(players), history: [] };
		let n = players.length;
		let num_decks = fen.num_decks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
		let deck = fen.deck = create_fen_deck('n', num_decks);
		shuffle(deck);
		let deck_commission = fen.deck_commission = create_fen_deck('c'); shuffle(deck_commission);
		let deck_luxury = fen.deck_luxury = create_fen_deck('l'); shuffle(deck_luxury);
		let deck_rumors = fen.deck_rumors = exp_rumors(options) ? create_fen_deck('r') : []; shuffle(deck_rumors);
		shuffle(fen.plorder);
		fen.market = [];
		fen.deck_discard = [];
		fen.open_discard = [];
		fen.commissioned = []; //eg., [Q,A,5,...]
		fen.open_commissions = exp_commissions(options) ? deck_deal(deck_commission, 3) : [];
		fen.church = exp_church(options) ? deck_deal(deck, players.length) : [];
		for (const plname of players) {
			let pl = fen.players[plname] = {
				hand: deck_deal(deck, 7),
				commissions: exp_commissions(options) ? deck_deal(deck_commission, 4) : [],
				rumors: exp_rumors(options) ? deck_deal(deck_rumors, players.length - 1) : [],
				journeys: [], //options.journey == 'no' ? [] : coin() ? [['QSr', 'KSr']] : [['3Cr', '4Cr']],
				buildings: { farm: [], estate: [], chateau: [] },
				stall: [],
				stall_value: 0,
				coins: 3,
				vps: 0,
				score: 0,
				name: plname,
				color: get_user_color(plname),
			};
		}
		fen.phase = 'king'; //TODO: king !!!!!!!
		fen.num_actions = 0;
		fen.herald = fen.plorder[0];
		fen.heraldorder = jsCopy(fen.plorder);
		if (exp_commissions(options)) {
			ari_history_list([`commission trading starts`], 'commissions', fen);
			[fen.stage, fen.turn] = [23, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder]; fen.comm_setup_num = 3; fen.keeppolling = true;
		} else if (exp_rumors(options) && fen.plorder.length > 2) {
			ari_history_list([`gossiping starts`], 'rumors', fen);
			[fen.stage, fen.turn] = [24, options.mode == 'hotseat' ? [fen.plorder[0]] : fen.plorder];
		} else[fen.stage, fen.turn] = set_journey_or_stall_stage(fen, options, fen.phase);
		return fen;
	}
	function activate_ui() { ari_activate_ui(); }
	function check_gameover(z) { return isdef(z.fen.winners) ? z.fen.winners : false; }
	function present(dParent) { ari_present(dParent); }
	function stats(dParent) { ari_stats(dParent); }
	function state_info(dParent) { ari_state(dParent); }
	function get_selection_color(item) {
		if (Z.stage == 41 && Z.A.selected.length == 1) return 'blue'; return 'red';
	}
	return { get_selection_color, rankstr, setup, activate_ui, check_gameover, present, state_info, stats };
}



//#region ltest...
function ltest0_card() { let c = ari_get_card('QSn'); mAppend(dTable, iDiv(c)); }
function ltest100_auction() {
  TESTING = true; DA.testing = true; DA.test = { mods: [set_auction_phase], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat', commission: 'no', rumors: 'no' });
}
function ltest101_commission() {
  TESTING = true; DA.testing = true; DA.test = { mods: [set_queen_phase, give_player_multiple_commission_cards], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat', commission: 'yes', rumors: 'no' });
}
function ltest102_luxurycard() {
  let dTable = mBy('dTable'); clearElement(dTable); mStyle(dTable, { hmin: 400 });
  drawcard('AHl', dTable, 300);
  drawcard('AHl', dTable, 200);
  drawcard('AHl', dTable, 100);
}
function ltest103_aristo_journey() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_luxury_cards], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat', commission: 'no', rumors: 'no' });
}
function ltest105_aristo_church() {
  TESTING = true; DA.testing = true;
  DA.test = { mods: [give_players_stalls, make_church], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest106_aristo_build() {
  TESTING = true; DA.testing = true; DA.test = { mods: [set_king_phase, give_player_only_4_cards], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest107_aristo_build() {
  TESTING = true; DA.testing = true; DA.test = { mods: [set_king_phase, give_players_schweine_variety], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })));
}
function ltest107_aristo_inspect_schwein() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_schwein, set_queen_phase], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  let playernames = [U.name, 'felix'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest108_animate_coin() {
  TESTING = true; DA.testing = true; DA.test = { mods: [set_king_phase, give_players_schweine_variety], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  let playernames = [U.name, 'felix'];
  DA.landing = () => {
    d = UI.player_stat_items[Z.uplayer].dCoin;
    anim1(d);
  };
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest108_aristo_inspect_schwein() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_schweine_variety, set_queen_phase], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  let playernames = [U.name, 'felix'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest109_ferro() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_achieve_5], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'felix', 'gul'];//, 'amanda', 'lauren', 'valerie', 'guest', 'nimble', 'sheeba', 'sarah']; //, 'gul', 'amanda', 'lauren'];
  startgame('ferro', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest109_spotit() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  let playernames = [U.name, 'felix'];
  startgame('spotit', playernames.map(x => ({ name: x, playmode: 'human' })), {});
}
function ltest10_ferro_sim() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_one_player_0_coins], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.auto_moves = [['random']];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'felix', playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest110_auction() {
  TESTING = true; DA.testing = true; DA.test = { mods: [set_auction_phase], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat', commission: 'no', rumors: 'no' });
}
function ltest110_fritz() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'amanda', 'lauren'];
  startgame('fritz', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest111_start() {
  show_home_logo();
  if (nundef(U)) { show_users(); return; } show_username();
  if (DA.TEST0) show('dTestButtons');
}
function ltest11_ferro_discard() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { console.log('discard:', Z.fen.deck_discard); }
  DA.auto_moves = [['random'], [1], [1], ['random']];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest12_ferro_buy() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { console.log('discard:', Z.fen.deck_discard); }
  DA.auto_moves = [['random']];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest1_card() { let c = cLandscape(dTable, { margin: 12 }); }
function ltest20_spotit_adaptive() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { console.log('discard:', Z.fen); }
  DA.auto_moves = [];
  startgame('spotit', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest21_spotit() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { console.log('discard:', Z.fen); }
  DA.auto_moves = [];
  startgame('spotit', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat', adaptive: false });
}
function ltest22_ferro_action1() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest23_aristo_building_downgrade() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_buildings], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest24_ferro_jolly() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [give_other_jolly_group], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest25_ferro_jolly() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [give_each_jolly_group], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest26_ferro_endgame() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [each_hand_of_one], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest27_ferro_commands() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [['random']];//[['random']];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest28_ferro_jolly_complex() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [give_other_jolly_group], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest29_ferro_play() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_hand_group, o => o.round = 2], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [[0, 1, 2], [1]];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest2_card() {
  let c = cPortrait(dTable, { margin: 12, border: 'solid 4px lime', bg: 'lightgreen' });
  let d = iDiv(c);
  console.log('d', d)
  let ds = mSym('red apple', d, { sz: 30 }, 'tl');
  ds = mSymText(2, d, { sz: 25, rounding: '50%', bg: 'gold', margin: 3 }, 'tr');
  ds = mText('APPLES', d, { family: 'Algerian', w: '100%', fz: 12, align: 'center', position: 'absolute', bottom: 0 });//mPlace(ds,'tc',0,8)
  ds = mSymText(2, d, { sz: 25, rounding: '50%', bg: 'crimson', margin: 3 }, 'br');
  ds = mSym('green apple', d, { sz: 70 }, 'cc');
}
function ltest30_ferro_jolly_jolly() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [give_each_jolly_group, give_player_jolly], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest31_ferro_rollback() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [small_hands, give_other_jolly_group, o => o.round = 1], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest32_select_error() {
  DA.magnify_on_select = true; 
  TESTING = true; DA.testing = true; DA.test = { mods: [small_hands, give_other_jolly_group, o => o.round = 4], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => ferro_transaction_error(['44', '5', '55', '7R'], ['jolly', 'anlegen'], 'take_turn_single');
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest33_ferro_sequence() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_sequence, give_other_jolly_group, o => o.round = 1], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [[2, 3, 6, 9, 10, 11, 12]];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest34_ferro_anlegen() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [give_other_jolly_group, o => o.round = 1], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [[0, 14]];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest35_ferro_sequence_anlegen() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [give_other_jolly_sequence, o => o.round = 1], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest36_ferro_two_sequence() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_jolly_sequence, give_player_sequence, o => o.round = 1], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [[0, 1, 2, 3, 4, 5, 6, 7, 8]];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest37_ferro_4_players() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }, { name: 'felix', playmode: 'human' }, { name: 'gul', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest38_ferro_end_of_round() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_group, give_player_only_one_card], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'nasi', playmode: 'human' }, { name: 'felix', playmode: 'human' }, { name: 'gul', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest39_ferro_7R() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_7R], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [[0, 1, 2, 3, 4, 5, 6, 7]];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }, { name: 'felix', playmode: 'human' }, { name: 'gul', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest3_card() {
  let di = SHERIFF.cards;
  for (const name in di) {
    let c = sheriff_card(name); 
    mAppend(dTable, iDiv(c));
  }
}
function ltest40_ferro_7R_anlegen() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_7R], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [[0, 1, 2, 3, 4, 5, 6, 7]];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }, { name: 'felix', playmode: 'human' }, { name: 'gul', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest41_frenzy_DD() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('fritz', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest42_aristo() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest43_fritz_discard_pile() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [make_deck_discard], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('fritz', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest44_ferro_7R() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_7R], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = []; 
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }, { name: 'felix', playmode: 'human' }, { name: 'gul', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest45_fritz() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('fritz', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest46_fritz_endgame() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = {
    mods: [o => { let pl = o.fen.players[o.fen.turn[0]].hand = ['4Hn', '2Cn', '3Cn']; }], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0]
  };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('fritz', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest47_aristo() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest48_aristo_church() {
  TESTING = true; DA.testing = true; DA.test = {
    mods: [give_players_stalls], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0]
  };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest49_aristo_church() {
  TESTING = true; DA.testing = true; DA.test = {
    mods: [give_players_stalls, make_church, set_player_tithes], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0]
  };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest4_sheriff() {
  let di = SHERIFF.cards;
  for (const name in di) { let c = sheriff_card(name); mAppend(dTable, iDiv(c)); }
}
function ltest50_aristo_church() {
  TESTING = true; DA.testing = true; DA.test = {
    mods: [give_players_stalls, make_church], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0]
  };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest51_aristo_church_downgrade() {
  TESTING = true; DA.testing = true; DA.test = {
    mods: [give_players_stalls, prep_for_church_downgrade], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0]
  };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest52_aristo_church_empty() {
  TESTING = true; DA.testing = true; DA.test = {
    mods: [give_players_empty_stalls], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0]
  };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest53_fritz_endround() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = {
    mods: [o => { let pl = o.fen.players[o.fen.turn[0]].hand = ['4Hn']; }], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0]
  };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('fritz', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest54_fritz_outoftime() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = {
    mods: [make_both_run_out_of_time], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0]
  };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('fritz', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest55_fritz_set_with_same_suits() {
  DA.magnify_on_select = true;
  TESTING = true; DA.testing = true; DA.test = {
    mods: [give_player_hand_groups], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0]
  };
  DA.test.end = () => { };
  DA.auto_moves = [];
  startgame('fritz', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest56_algo_overlapping_sets() {
  let cards = ['2Hn', '3Hn', '4Hn', '5Hn', '6Hn', '7Hn', '7Cn', '7Dn', '7Hn'].map(x => fritz_get_card(x));
  let res = is_overlapping_set(cards, 1, 3, false); 
  console.log('res:', res);
  res = is_overlapping_set(['2Hn', '3Hn', '4Hn', '3Hn', '2Hn'].map(x => fritz_get_card(x)), 1, 3, false); //ok
  console.log('res:', res);
  res = is_overlapping_set(['2Hn', '3Hn', '4Hn', '3Hn'].map(x => fritz_get_card(x)), 1, 3, false); //false ok
  console.log('res:', res);
  res = is_overlapping_set(['2Hn', '3Hn', '3Hn', '3Cn'].map(x => fritz_get_card(x)), 1, 3, false); //false ok
  console.log('res:', res);
  res = is_overlapping_set(['2Hn', '3Hn', '4Hn', '5Hn', '5Cn', '5Dn', '5Cn', '5Hn'].map(x => fritz_get_card(x)), 1, 3, false); //ok
  console.log('res:', res);
  res = is_overlapping_set(['2Hn', '3Hn', '4Hn', '5Hn', '5Cn', '5Cn', '5Cn', '5Hn', '6Hn', '7Hn'].map(x => fritz_get_card(x)), 1, 3, false); //false ok
  console.log('res:', res);
  res = is_overlapping_set(['2Hn', '*Hn', '2Cn', '3Hn', '4Cn'].map(x => fritz_get_card(x)), 1, 3, false);
  console.log('res:', res);
  res = is_overlapping_set(['2Hn', '*Hn', '2Cn', '3Cn', '4Cn'].map(x => fritz_get_card(x)), 1, 3, false);
  console.log('res:', res);
  res = is_overlapping_set(['4Hn', '3Hn', '2Hn', '2Cn', '2Sn', '3Sn', '4Sn'].map(x => fritz_get_card(x)), 1, 3, false); //ok
  console.log('res:', res);
  res = is_overlapping_set(['4Hn', '3Hn'].map(x => fritz_get_card(x)), 1, 3, false); //ok FEHLER!!!
  console.log('res:', res);
  res = is_overlapping_set(['4Hn'].map(x => fritz_get_card(x)), 1, 3, false); //ok FEHLER!!!
  console.log('res:', res);
}
function ltest57_aristo() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest58_aristo_building_rumor_harvest() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_buildings_plus, add_rumors_to_buildings, give_player_queen], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest59_arrTakeLast() {
  let x = arrTakeLast([0, 1, 2, 3, 4, 5], 3, 2); console.log('x', x);
  x = arrTakeLast({ blue: 1, red: 2, green: 3 }, 2, 2); console.log('x', x);
  x = arrTakeLast([0, 1, 2, 3, 4, 5], 10, 0); console.log('x', x);
}
function ltest5_jokerhtml() {
  let html = `
    <div style="position: absolute; top: 0px; left: 0px; width: 200px; height: 300px; background: blue">
      HALLLLLLLLLLLLLLLLLLLLOOOOOOOOOOOOOOOOOOO
      <!-- joker svg orig -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        class="card"
        face="0J"
        height="100%"
        preserveAspectRatio="none"
        viewBox="-120 -168 240 336"
        width="100%"
      >
        <symbol id="J11" preserveAspectRatio="none" viewBox="0 0 1300 2000">
          <path fill="#FC4" d="M1095,1000A445,445 0 0 1 650,1445 445,445 0 0 1 205,1000 445,445 0 0 1 650,555 445,445 0 0 1 1095,1000Z"></path>
        </symbol>
        <symbol id="J12" preserveAspectRatio="none" viewBox="0 0 1300 2000">
          <path
            fill="red"
            d="M317.05664,1294.416 100,1620l220,-60 40,240 140,-200 160,200 40,-200 180,180 60,-220 260,60 -236.67969,-304.3027A445,445 0 0 1 650,1445 445,445 0 0 1 317.05664,1294.416ZM831.71484,249.10742C687.94378,262.65874 542.4812,256.33752 420,520 369.08062,331.38331 278.61481,370.61289 187.77148,412.01367a75,75 0 0 1 2.52344,19.12695 75,75 0 0 1 -16.78515,47.19532c66.827,55.25537 117.57478,127.8247 155.77539,213.90429A445,445 0 0 1 650,555 445,445 0 0 1 924.33984,650.26562c42.39917,-50.4556 91.60026,-93.34711 167.51176,-106.5332a75,75 0 0 1 -0.6524,-9.14258 75,75 0 0 1 14.6172,-44.3457C1026.3517,437.47479 931.12146,446.83238 840,440 761.98041,388.07638 804.10248,338.17898 853.51758,288.4043a75,75 0 0 1 -21.80274,-39.29688z"
          ></path>
        </symbol>
        <symbol id="J13" preserveAspectRatio="none" viewBox="0 0 1300 2000">
          <path
            fill="#44F"
            d="M879.65521,937.6026a40,40 0 0 1 -40,40 40,40 0 0 1 -40,-40 40,40 0 0 1 40,-40 40,40 0 0 1 40,40zm-379.31039,0a40,40 0 0 1 -40,40 40,40 0 0 1 -40,-40 40,40 0 0 1 40,-40 40,40 0 0 1 40,40z"
          ></path>
        </symbol>
        <symbol id="J14" preserveAspectRatio="none" viewBox="0 0 1300 2000">
          <path
            stroke="#44F"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="6"
            fill="none"
            d="M317.05664,1294.416 100,1620l220,-60 40,240 140,-200 160,200 40,-200 180,180 60,-220 260,60 -236.67969,-304.3027M1241.1987,534.58948a75,75 0 0 1 -75,75 75,75 0 0 1 -75,-75 75,75 0 0 1 75,-75 75,75 0 0 1 75,75zM980.11493,234.09686a75,75 0 0 1 -75,75 75,75 0 0 1 -75,-75 75,75 0 0 1 75,-75 75,75 0 0 1 75,75zM190.29556,431.1412a75,75 0 0 1 -75,75 75,75 0 0 1 -74.999997,-75 75,75 0 0 1 74.999997,-75 75,75 0 0 1 75,75zM924.3457,650.27148c42.40088,-50.45397 91.5936,-93.35356 167.5059,-106.53906 -0.4037,-3.03138 -0.6215,-6.0846 -0.6524,-9.14258 0.03,-15.96068 5.1503,-31.4957 14.6172,-44.3457C1026.3517,437.47479 931.12146,446.83238 840,440 761.98041,388.07638 804.10248,338.17898 853.51758,288.4043 842.40414,277.84182 834.79487,264.12701 831.71484,249.10742 687.94378,262.65874 542.4812,256.33752 420,520 369.08062,331.38331 278.61481,370.61289 187.77148,412.01367c1.66108,6.24042 2.50924,12.66925 2.52344,19.12695 -0.0209,17.1896 -5.94587,33.85038 -16.7832,47.19336 66.82714,55.25532 117.5686,127.8306 155.76953,213.91016M384.88867,1140c51.89013,98.343 153.91815,159.9189 265.11133,160 111.19809,-0.076 213.23257,-61.6527 265.125,-160M1095,1000A445,445 0 0 1 650,1445 445,445 0 0 1 205,1000 445,445 0 0 1 650,555 445,445 0 0 1 1095,1000Z"
          ></path>
        </symbol>
        <rect width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12" fill="white" stroke="black"></rect>
        <text x="-110" y="-115" fill="red" stroke="red" style="font:bold 60px sans-serif">*</text>
        <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J11"></use>
        <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J12"></use>
        <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J13"></use>
        <use width="202.8" height="312" x="-101.4" y="-156" xlink:href="#J14"></use>
      </svg>
    </div>
  `;
  document.body.appendChild(mCreateFrom(html));
}
function ltest60_aristo_inspect_schwein() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_schwein, add_rumors_to_buildings], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest61_aristo_inspect_correct() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_buildings, add_rumors_to_buildings], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest62_aristo_inspect_closed_schwein() {
  TESTING = true; DA.testing = true; DA.test = { mods: [x => give_players_schwein(x, false), add_rumors_to_buildings], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest63_aristo_blackmail() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_other_various_buildings, set_queen_phase], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest64_aristo_blackmailed_building() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_other_blackmailed_building], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest65_stamp() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest66_stamp_style() {
  dTable = mBy('dTable'); mClass('dTexture', 'wood'); mCenterFlex(dTable);
  let hand = ['2Hn', '3Hn', '4Hn', '5Hn', '6Hn', '7Hn', '8Hn', '9Hn', 'THn', 'JHn', 'QHn', 'KHn', 'AHn'];
  let ui = ui_type_hand(hand, dTable);
  mStamp(ui.container, 'blackmail');
}
function ltest67_aristo_blackmail_owner() {
  TESTING = true; DA.testing = true; DA.test = { mods: [set_blackmail_owner_stage], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest68_aristo_blackmail_owner_defend() {
  TESTING = true; DA.testing = true; DA.test = { mods: [set_blackmail_owner_stage_defend], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  startgame('aristo', [{ name: U.name, playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest69_ferro_is_group() {
  let j = ['*Hn', '8Dn', '8Hn'];
  let x = is_group(j);
  console.log('is_group', x);
  j = ['8Hn', '*Dn', '8Hn'];
  x = is_group(j);
  console.log('is_group', x);
}
function ltest6_bluff_skin() {
  startgame('bluff', [{ name: 'valerie', playmode: 'human' }, { name: 'felix', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest70_aristo_church() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_stalls, make_church], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'leo', 'gul']; //, 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest71_ferro() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'leo', 'gul']; //, 'gul', 'amanda', 'lauren'];
  startgame('ferro', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest72_ferro() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'gul', 'amanda', 'lauren', 'valerie', 'guest', 'nimble', 'sheeba', 'sarah']; //, 'gul', 'amanda', 'lauren'];
  startgame('ferro', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest73_ferro_deck_empty() {
  TESTING = true; DA.testing = true; DA.test = { mods: [make_deck_empty], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'gul', 'amanda', 'lauren', 'valerie', 'guest', 'nimble', 'sheeba', 'sarah']; //, 'gul', 'amanda', 'lauren'];
  startgame('ferro', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest74_ferro_scroll_history() {
  TESTING = true; DA.testing = true; DA.test = { mods: [make_long_history], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'felix', 'gul', 'amanda', 'lauren', 'valerie', 'guest', 'nimble', 'sheeba', 'sarah']; //, 'gul', 'amanda', 'lauren'];
  startgame('ferro', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest75_ferro_multi() {
  TESTING = true; DA.testing = true; DA.test = { mods: [make_long_history], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [['random']];//[['random']];
  let playernames = ['mimi', 'felix', 'gul', 'amanda', 'lauren', 'valerie', 'guest', 'nimble', 'sheeba', 'sarah']; //, 'gul', 'amanda', 'lauren'];
  startgame('ferro', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'multi' });
}
function ltest76_aristo_multi() {
  TESTING = true; DA.testing = true; DA.test = { mods: [make_long_history], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'felix', 'gul'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'multi', rumors: 'no', commission: 'no', journey: 'no' });
}
function ltest77_aristo_church() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_stalls, make_church], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'leo', 'gul']; //, 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest78_aristo_church() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_stalls, make_church], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [['random'], ['random']];
  let playernames = [U.name, 'felix']; //, 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest79_bluff_multi() {
  TESTING = true; DA.testing = true; DA.test = { mods: [make_long_history], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'felix']; //, 'gul', 'amanda', 'lauren'];
  startgame('bluff', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'multi' });
}
function ltest7_ferro_skin() {
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'felix', playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest80_fritz_multi() {
  TESTING = true; DA.testing = true; DA.test = { mods: [make_long_history], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'felix']; //, 'gul', 'amanda', 'lauren'];
  startgame('fritz', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'multi' });
}
function ltest81_spotit_multi() {
  TESTING = true; DA.testing = true; DA.test = { mods: [make_long_history], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'felix']; //, 'gul', 'amanda', 'lauren'];
  startgame('spotit', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'multi' });
}
function ltest82_ferro() {
  TESTING = true; DA.testing = true; DA.test = { mods: [make_long_history], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'felix', 'gul'];//, 'amanda', 'lauren', 'valerie', 'guest', 'nimble', 'sheeba', 'sarah']; //, 'gul', 'amanda', 'lauren'];
  startgame('ferro', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest83_ferro_multi() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'felix']; //, 'gul', 'amanda']; //, 'lauren', 'valerie', 'guest', 'nimble', 'sheeba', 'sarah']; //, 'gul', 'amanda', 'lauren'];
  startgame('ferro', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'multi' });
}
function ltest83_svg() {
  dTable = mBy('dTexture'); mCenterFlex(dTable); mStyle(dTable, { hmin: 500 }); mClass(dTable, 'wood');
  mStyle(dTable, { gap: 10 });
  let card;
  card = cBlankSvg(dTable);
  console.log('card', card); //mClass(iDiv(card),'hoverScale')
  let g = iG(card); 
  let x = mgSuit('Pik'); //console.log('x', x);
  mgSize(x, 40);
  mgPos(card, x); 
}
function ltest84_svg() {
  let dTable = mBy('dTable'); clearElement(dTable); mStyle(dTable, { hmin: 400 })
  let card = cBlank(dTable); let d = iDiv(card); let sz = card.h / 6;
  let i = 0;
  for (let suit of ['H', 'S', 'D', 'C']) {
    let s1 = mSuit(suit, d, { w: sz, h: sz }); //console.log('s1', s1);
    mPos(s1, sz * i, 0); i++;
  }
}
function ltest85_card_short_text() {
  let dTable = mBy('dTable'); clearElement(dTable); mStyle(dTable, { hmin: 400 });
  let ckey = 'KCn';
  let sz = 20;
  let d = mDiv(dTable, {}, null, `hallo das ist ein ${mCardText(ckey)}.`);
  return;
}
function ltest86_ferro() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_player_two_ferro_sets, make_long_history], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'felix', 'gul'];//, 'amanda', 'lauren', 'valerie', 'guest', 'nimble', 'sheeba', 'sarah']; //, 'gul', 'amanda', 'lauren'];
  startgame('ferro', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest87_aristo() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest88_aristo_market() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_stalls], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest89_aristo_journey() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat', commission: 'no', rumors: 'no' });
}
function ltest8_ferro_sim() {
  TESTING = true; DA.testing = true; DA.test = { iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.auto_moves = [['last']];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'felix', playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest90_bluff() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'amanda', 'lauren'];
  startgame('bluff', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest90_bluff_ueberbiete() {
  TESTING = true; DA.testing = true; DA.test = { mods: [bluff_start_bid], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'amanda', 'lauren'];
  startgame('bluff', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest91_bluff_strategy() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'lauren', 'felix'];
  let playmodes = ['human', 'bot', 'bot'];
  let strategy = ['', 'random', 'clairvoyant'];
  let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategy[i], playmode: playmodes[i++] }));
  let options = { mode: 'hotseat' };
  startgame('bluff', players, options);
}
function ltest92_bluff_bots() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = ['mimi', 'lauren', 'felix'];
  let playmodes = ['bot', 'bot', 'bot'];
  let strategy = ['random', 'perfect', 'clairvoyant'];
  let i = 0; let players = playernames.map(x => ({ name: x, strategy: strategy[i], playmode: playmodes[i++] }));
  let options = { mode: 'hotseat' };
  startgame('bluff', players, options);
}
function ltest93_bluff() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'amanda', 'lauren'];
  startgame('bluff', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest94_aristo_journey() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_hand_journey], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat', commission: 'no', rumors: 'no' });
}
function ltest95_aristo_rumor_action() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_buildings_plus, set_queen_phase, give_player_king], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat' });
}
function ltest96_aristo_visit() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_schwein, set_queen_phase, give_player_queen], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat', commission: 'no', rumors: 'no' });
}
function ltest97_find_sequences() {
  let x = follows_in_rank('ACn', '2Cn', 'A23456789TJQK');
  console.log('follows', x);
  x = find_sequences(['ACn', '2Cn', '3Hn', '5Hn', '7Hn', '7Sn', '7Cn', '7Dn'], 2, 'A23456789TJQK');
  console.log('follows', x);
}
function ltest98_weired_blatt_aendern() {
  TESTING = true; DA.testing = true; DA.test = { mods: [give_players_hand_A2], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat', commission: 'no', rumors: 'no' });
}
function ltest99_fritz() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix']; //, 'amanda', 'lauren'];
  startgame('fritz', playernames.map(x => ({ name: x, playmode: 'human' })), { mode: 'hotseat', commission: 'no', rumors: 'no' });
}
function ltest9_ferro_sim() {
  TESTING = true; DA.testing = true; DA.test = { iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.auto_moves = [['random']];
  startgame('ferro', [{ name: U.name, playmode: 'human' }, { name: 'felix', playmode: 'human' }, { name: 'amanda', playmode: 'human' }], { mode: 'hotseat' });
}
function ltest_aristo_simple() {
  TESTING = true; DA.testing = true; DA.test = { mods: [], iter: 0, maxiter: 200, running: false, step: true, suiteRunning: false, number: 0, list: [0] };
  DA.test.end = () => { }; 
  DA.auto_moves = [];
  let playernames = [U.name, 'felix', 'gul', 'amanda', 'lauren']; //, 'gul', 'amanda', 'lauren'];
  startgame('aristo', playernames.map(x => ({ name: x, playmode: 'human' })), { commission: 'no' });
}
//#endregion

function faButton(dParent, key, styles = {}, opts = {}) {
  let o = lookup(M.superdi, [key]);
  if (!isdef(o)) {
    console.warn(`no superdi entry for key ${key}`);
    return;
  }
  let html = `<div class='faButtonOuter'><div class='faButtonInner'>&#x${o.fa6};</div></div>`;
  let d = mDom(dParent, styles, { html, ...opts });
  mClass(d, 'faButtonOuter');
  mClass(d.firstChild, 'faButtonInner');
  d.onclick = ev => {
    evNoBubble(ev);
    if (isdef(opts.onclick)) opts.onclick(ev);
  }
  mStyle(d, { cursor: 'pointer', display: 'flex', placeContent: 'center' });
  mStyle(d.firstChild, { fontSize: '24px', lineHeight: '24px', fontFamily: 'fa6', background: 'rgba(0,0,0,0)', color: 'lightgray' });
  return d;
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
function downloadAsYaml(o, filename, opts = { allowUnicode: true, noRefs: true, lineWidth: -1, noCompatMode: true, quotingType: '"', styles: { '!!str': 'plain' } }) {
  let y = jsyaml.dump(o, { noCompatMode: true });
  downloadAsText(y, filename + '.yaml');
}

function show_MMM(msg) { show_fleeting_message(msg, mBy('dMMM')); }
function show_fleeting_message(s, dParent, styles, id, ms = 2000) {
  let d = mDiv(dParent, styles, id, s);
  mFadeRemove(d, ms);
}
function mButtonX(dParent, handler = null, sz = 22, offset = 5, color = 'contrast') {
  mIfNotRelative(dParent);
  let [top, right] = [offset - 3, offset];
  let bx = mDom(dParent, { position: 'absolute', top, right, w: sz, h: sz, cursor: 'pointer' }, { className: 'hop1' });
  bx.onclick = ev => { evNoBubble(ev); if (!handler) dParent.remove(); else handler(ev); }
  let o = M.superdi.xmark;
  let bg = mGetStyle(dParent, 'bg'); if (isEmpty(bg)) bg = 'white';
  let fg = color == 'contrast' ? colorIdealText(bg, true) : color;
  el = mDom(bx, { fz: sz, hline: sz, family: 'fa6', fg, display: 'inline' }, { html: String.fromCharCode('0x' + o.fa6) });
  return bx;
}
function mPopup(content, dParent, styles, id) {
  if (isdef(mBy(id))) mRemove(id);
  mIfNotRelative(dParent);
  if (nundef(styles)) styles = { top: 0, left: 0 };
  styles.position = 'absolute';
  let d1 = mDiv(dParent, styles, valf(id, getUID()), content);
  return d1;
}
function mPopupSimple(d) {
  const popup = document.createElement('div');
  popup.innerHTML = '✨ I am a centered popup! ✨';
  popup.style.position = 'absolute';
  popup.style.background = 'white';
  popup.style.border = '1px solid #ccc';
  popup.style.borderRadius = '8px';
  popup.style.padding = '20px';
  popup.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  popup.style.zIndex = '1000'; // Ensure it appears on top
  popup.style.transform = 'translate(-50%, -50%)';
  const rect = d.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2 + window.scrollX;
  const centerY = rect.top + rect.height / 2 + window.scrollY;
  popup.style.left = `${centerX}px`;
  popup.style.top = `${centerY}px`;
  document.body.appendChild(popup);
  return popup;
}
function mSym(key, dParent, styles = {}, pos, classes) {
  let info = Syms[key];
  styles.display = 'inline-block';
  let family = info.family;
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

