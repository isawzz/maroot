


function select_add_items(items, callback = null, instruction = null, min = 0, max = 100, prevent_autoselect = false) { //, show_submit_button=true) {
	//let A = {};
	select_clear_previous_level();
	A.level++; A.items = items; A.callback = callback; A.selected = []; A.minselected = min; A.maxselected = max;
	assertion(false, '* THE END *');
	show_progress(fen);
	let dInstruction = mBy('dSelections0');
	mClass(dInstruction, 'instruction');
	mCenterCenterFlex(dInstruction);
	dInstruction.innerHTML = (Z.role == 'active' ? `${get_waiting_html()}<span style="color:red;font-weight:bold;max-height:25px">You</span>` : `${Z.uplayer}`) + "&nbsp;" + instruction; // + '</div>';
	if (too_many_string_items(A)) { mLinebreak(dInstruction, 4); } //console.log('triggered!!!') }
	let has_submit_items = false;
	let buttonstyle = { maleft: 10, vmargin: 2, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }
	for (const item of A.items) {
		let type = item.itype = is_card(item) ? 'card' : is_player(item.a) ? 'player' : isdef(item.o) ? 'container' : is_color(item.a) ? 'color' : 'string'; // nundef(item.submit_on_click) ? 'string' : 'submit';
		if (isdef(item.submit_on_click)) { has_submit_items = true; }
		let id = item.id = lookup(item, ['o', 'id']) ? item.o.id : getUID(); A.di[id] = item;
		if (type == 'string' || type == 'color') { //make button for this item!
			let handler = ev => select_last(item, isdef(item.submit_on_click) ? callback : select_toggle, ev);
			item.div = mButton(item.a, handler, dInstruction, buttonstyle, null, id);
			if (type == 'color') mStyle(item.div, { bg: item.a, fg: 'contrast' });
		} else {
			let ui = item.div = iDiv(item.o);
			ui.onclick = ev => select_last(item, select_toggle, ev);
			ui.id = id;
		}
	}
	let show_submit_button = !has_submit_items && (A.minselected != A.maxselected || !A.autosubmit);
	if (show_submit_button) { mButton('submit', callback, dInstruction, buttonstyle, 'selectable_button', 'bSubmit'); }
	let show_restart_button = A.level > 1;
	if (show_restart_button) { mButton('restart', onclick_reload, dInstruction, buttonstyle, 'selectable_button', 'bReload'); }
	let dParent = window[`dActions${A.level}`];
	for (const item of A.items) { showItemAsSelectable(item, dParent, dInstruction); }
	assertion(A.items.length >= min, 'less options than min selection!!!!', A.items.length, 'min is', min); //TODO: sollte das passieren, check in ari_pre_action die mins!!!
	if (A.items.length == min && !is_ai_player() && !prevent_autoselect) {
		for (const item of A.items) { A.selected.push(item.index); showItemAsSelected(item); }
		if (A.autosubmit) {
			loader_on();
			setTimeout(() => { if (callback) callback(); loader_off(); }, 800);
		}
	} else if (is_ai_player()) {
		ai_move();
	} else if (TESTING && isdef(DA.test)) {
		if (DA.test.iter >= DA.auto_moves.length) {
			if (isdef(DA.test.end)) DA.test.end();
			activate_ui();
			return;
		}
		let selection = DA.auto_moves[DA.test.iter++];
		if (selection) {
			deactivate_ui();
			let numbers = [];
			for (const el of selection) {
				if (el == 'last') {
					numbers.push(A.items.length - 1);
				} else if (el == 'random') {
					numbers.push(rNumber(0, A.items.length - 1));
				} else if (isString(el)) {
					let commands = A.items.map(x => x.key);
					let idx = commands.indexOf(el);
					numbers.push(idx);
				} else numbers.push(el);
			}
			selection = numbers;
			A.selected = selection;
			if (selection.length == 1) A.command = A.items[A.selected[0]].key;
			A.last_selected = A.items[A.selected[0]];
			select_highlight();
			setTimeout(() => {
				if (A.callback) A.callback();
			}, 1000);
		} else { activate_ui(); }
	} else { activate_ui(); }
}
function select_clear_previous_level() {
	//let A = {};
	if (!isEmpty(A.items)) {
		console.assert(A.level >= 1, 'have items but level is ' + A.level);
		A.ll.push({ items: A.items, selected: A.selected });
		let dsel = Z.game == 'accuse' ? mBy(`dTitleMiddle`) : mBy(`dSelections1`); // mBy(`dSelections${A.level}`)
		mStyle(dsel, { display: 'flex', 'align-items': 'center', padding: 10, box: true, gap: 10 });
		for (const item of A.items) {
			showItemAsUnselected(item);
			if (A.keep_selection) continue;
			ari_make_unselected(item);
			if (!A.selected.includes(item.index)) continue;
			if (item.itype == 'card') {
				let d = iDiv(item);
				let card = item.o;
				let mini = mDiv(dsel, { bg: 'yellow', fg: 'black', hpadding: 2, border: '1px solid black' }, null, card.friendly);
			} else if (item.itype == 'container') {
				let list = item.o.list;
				let cards = list.map(x => ari_get_card(x, 30, 30 * .7));
				let cont2 = ui_make_hand_container(cards, dsel, { bg: 'transparent' });
				ui_add_cards_to_hand_container(cont2, cards, list);
			} else if (item.itype == 'string') {
				let db = mDiv(dsel, { bg: 'yellow', fg: 'black', border: 'black', hpadding: 4 }, item.id, item.a);
			} else if (item.itype == 'color') {
				let db = mDiv(dsel, { bg: item.a, fg: 'contrast', border: 'black', hpadding: 4 }, item.id, item.a);
			} else if (item.itype == 'player') {
				let db = mDiv(dsel, {}, item.id, `<span style="color:${get_user_color(item.a)};font-weight:bold"> ${item.a} </span>`);
			}
		}
	}
}


function gamestep() {
  show_admin_ui();
  DA.running = true; clear_screen(); dTable = mBy('dTable'); mClass('dTexture', 'wood');
  if (Z.game == 'aristo') { if (Z.role != Clientdata.role || Z.mode == 'multi' && Z.role != 'active') mFall(dTable); Clientdata.role = Z.role; }//else mTableTransition(dTable, 2000);
  else mFall(dTable);
  shield_off();
  show_title();
  show_role();
  Z.func.present(dTable);  
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
  if (TESTING == true) landing();  
}

function correct_handsorting(hand, pl) {
  let [cs, pls, locs] = [Clientdata.handsorting, pl.handsorting, localStorage.getItem('handsorting')];
  let s = cs ?? pls ?? locs ?? M.config.games[Z.game].defaulthandsorting;
  hand = sort_cards(hand, s == 'suit', 'CDSH', true, Z.func.rankstr);
  return hand;
}
function onclick_by_rank() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	pl.handsorting = 'rank'; //{ n: items.length, by: 'rank' };
	Clientdata.handsorting = pl.handsorting;
	localStorage.setItem('handsorting', Clientdata.handsorting);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //window[Z.game.toUpperCase()].rankstr); //'23456789TJQKA*');
	h.sortedBy = 'rank';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
}
function onclick_by_suit() {
	let [plorder, stage, A, fen, uplayer, pl] = [Z.plorder, Z.stage, Z.A, Z.fen, Z.uplayer, Z.fen.players[Z.uplayer]];
	let items = ui_get_hand_items(uplayer).map(x => x.o);
	let h = UI.players[uplayer].hand;
	Clientdata.handsorting = pl.handsorting = 'suit'; //{ n: items.length, by: 'suit' };
	localStorage.setItem('handsorting', Clientdata.handsorting);
	let cardcont = h.cardcontainer;
	let ch = arrChildren(cardcont);
	ch.map(x => x.remove());
	let sorted = sortCardItemsByRank(items, Z.func.rankstr); //'23456789TJQKA*');
	sorted = sortCardItemsBySuit(sorted);
	h.sortedBy = 'suit';
	for (const item of sorted) {
		mAppend(cardcont, iDiv(item));
	}
}

function _show_history(fen, dParent) {
  if (!isEmpty(fen.history)) {
    let html = '';
    for (const o of jsCopy(fen.history).reverse()) {
      html += beautify_history(o.lines, o.title, fen);
    }
    let dHistory = mDiv(dParent, { maright: 10, hpadding: 12, bg: colorLight('#EDC690', 50), box: true, matop: 4, rounding: 10, patop: 10, pabottom: 10, hmax: `calc( 100vh - 250px )`, 'overflow-y': 'auto', w: 260 }, null, html); //JSON.stringify(fen.history));
    UI.dHistoryParent = dParent;
    UI.dHistory = dHistory;
    if (isdef(Clientdata.historyLayout)) { show_history_layout(Clientdata.historyLayout); }
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
