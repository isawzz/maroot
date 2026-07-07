onload = start; VERBOSE = false; TESTING = true; DEV = false; POLLING = true;

function start() { test0_listColors(); }

async function test0_listColors() {
	await loadAssetsStaticPreload();
	console.log(M);
  const dParent = mBy('dPage');
  mClear(dParent);
  const list = getAllColorsAsNameHexObjects();
  const d1 = mDom(dParent, { padding: 10, gap: 4 });
  let color = 'classic_rose';
  color = colorNearestNamed(color).hex;
  mFlexWrap(d1);
  let cur = null;
  for (var c of list) {
    let bg = c.hex;
    let html = `${c.name}`;
    let el = mDom(d1, { cursor: 'pointer', margin: 6, padding: 10, bg, fg: colorIdealText(bg) }, { html, class: 'colorbox', dataColor: bg });
    if (bg == color) {
      cur = el;
    }
    el.onclick = () => onclickColorInSettings(bg, el);
  }
  assertion(cur, "NO SELECTED ELEMENT!!!!")
  if (cur) {
    setToSelected(cur);
    let rect1 = getRectInt(cur, d1);
    mBy('dSettings').scrollTo({ top: rect1.y + window.scrollY - 20, behavior: 'smooth' });
  }
}

async function prelim() {
	await loadAssetsStaticPreload();
}
async function postlim(uname = 'mimi') {
	await DAInit();

	mStyle('dPage', {}, { className: 'wood' });

	await pollInit();

	await switchToUser(uname); // da wird M.users geladen!
}


