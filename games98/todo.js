
function deckDrawTop(deckArray) {
	return deckArray.pop(); // Removes and returns the last element
}
function deckDiscardToBottom(deckArray, cardItem) {
	deckArray.unshift(cardItem); // Adds to the start of the array
}


function onclickSortCards(ui, suitstr = 'CDSH', rankstr = '23456789TJQKA') {
  //console.log(ui); 
  let items = ui.items;
  for (const item of items) {
    let c = item.key;
    let suit = c[1];
    let rank = c[0];
    item.sortkey = suitstr ? suitstr.indexOf(suit) * 100 + rankstr.indexOf(rank) : rankstr.indexOf(rank);
  }
  items.sort((a, b) => a.sortkey - b.sortkey);
  let cardcont = ui.items[0].div.parentNode;//cardcontainer;
  let x = cardcont.parentNode; //mStyle(x, { bg: 'red' });
  //mClear(cardcont);
  let w = cSplay(cardcont, items.map(x => iDiv(x)), items[0].w); return;
  //mStyle(cardcont, { bg:'red',w });
}


function ari_present(me, table) {
	let fen = table.fen;
	let stage = table.fen.stage;

	PrevItems = Items;
	Items = {};
	let dTable = Items.dTable = stdPresentBGATableCols(me, table, 2000);
	ariShowTitle(table);
	DA.stats = ariStats(me, table);
	historyShow(table, 'dStats');
assertion(false, '* THE END *');

	let dt = Items.dt = mDom('dTable', { pabottom: 20, h100: true, box: true, w100: true, bg: colorLight('#EDC690', 50) });
	let dOpenTable = Items.dOpenTable = mDom(dt, {}, { id: 'dOpenTable' }); mFlexWrap(dOpenTable);

	if (exp_church(table.options)) {
		//console.log('showing church!!!',fen.church)
		let church = Items.churchContainer = ui_type_church(fen.church, dOpenTable, { maleft: 28, maright: 42 }, 'church', 'church', uiTypeCard52);
		for (const item of church.items) {
			//console.log('=>', item, [...church.path.split('.'), item.key]);
			lookupSet(Items, [...church.path.split('.'), item.key], item);
		}
		// console.log('Items.church', Items.church,'fen.church', fen.church)
	}
	//console.log(Items);
	//assertion(false, '* THE END *');
	let deck = Items.deck = ui_type_deck(fen.deck, dOpenTable, { maleft: 12 }, 'deck', 'deck');
	let market = Items.market = ui_type_market(fen.market, dOpenTable, { maleft: 12 }, 'market', 'market', uiTypeCard52, true);
	let open_discard = Items.open_discard = ui_type_market(fen.open_discard, dOpenTable, { maleft: 12 }, 'open_discard', 'discard', uiTypeCard52);
	let deck_discard = Items.deck_discard = ui_type_deck(fen.deck_discard, dOpenTable, { maleft: 12 }, 'deck_discard', '', uiTypeCard52);

	if (exp_commissions(table.options)) {
		let open_commissions = Items.open_commissions = ui_type_market(fen.open_commissions, dOpenTable, { maleft: 12 }, 'open_commissions', 'bank', uiTypeCommissionCard);
		mMagnifyOnHoverControlPopup(Items.open_commissions.cardcontainer);
		let deck_commission = Items.deck_commission = ui_type_deck(fen.deck_commission, dOpenTable, { maleft: 4 }, 'deck_commission', '', uiTypeCommissionCard);
		let comm = Items.commissioned = ui_type_rank_count(fen.commissioned, dOpenTable, {}, 'commissioned', 'sentiment', uiTypeCommissionCard);
		if (comm.items.length > 0) { let isent = arrLast(comm.items); let dsent = iDiv(isent); set_card_border(dsent, 15, 'green'); }
	}

	if (exp_peasants(table.options) || exp_rumors(table.options)) {
		//console.log(table.options)
		let deck_rumors = Items.deck_rumors = ui_type_deck(fen.deck_rumors, dOpenTable, { maleft: 20 }, 'deck_rumors', exp_rumors(table.options) ? 'rumors' : 'peasants', uiTypeRumorCard);
	}

	Items.players = {};
	//let dMiddle = mDom(dt, { w100:true, bg:'red',display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 });
	let uname_plays = table.plorder.includes(me);
	//console.log('___________',me,uname_plays, table.plorder, table.options.mode);
	//console.log('uname_plays', uname_plays, 'me', me, 'plorder', table.plorder, 'mode', table.options.mode);
	let show_first = uname_plays ? me : table.turn[0];
	let order = arrCycle(table.plorder, table.plorder.indexOf(show_first));
	//console.log('order', order);
	let playerstyles = { bg: '#ffffff80', fg: 'black', padding: 10, margin: 4, rounding: 9 };
	for (const plname of order) {
		let pl = table.players[plname];
		let d = mDom(dt, playerstyles, { html: get_user_pic_html(plname, 25) });
		mStyle(d, { border: `2px ${pl.color} solid` })
		mFlexWrap(d);
		mLinebreak(d, 9);
		let hidden = plname != order[0]; //compute_hidden(plname);
		Items.players[plname] = ari_present_player(plname, table, d, hidden && !TESTING);
		//mLinebreak(d, 9);
	}
	if (uname_plays) { ari_show_handsorting_buttons_for(table.players[show_first], Items); }//delete Clientdata.handsorting;}
	//show_view_buildings_button(show_first);
	let pl = table.players[show_first];
	//console.log('showing view buildings button for', show_first, pl);
	if (hasBuildings(pl)) {
		//show_view_buildings_button(show_first);
		let d = Items.players[plname].buildinglist;
		let bstyles = { hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black', maright: 4 };
		let b1 = mDom(d, bstyles, { tag: 'button', innerHTML: 'view', onclick: () => onclick_view_buildings(table, Items) });

	}
	let desc = ARI.stage[stage];
	//console.log('_______________',ui)

	if (isdef(fen.winners)) ari_reveal_all_buildings(fen);
	else if (desc == 'comm_weitergeben' && !table.turn.includes(me)) {
		stdInstruction(me, table);
	}
	return Items;
}
function ari_pre_action(me, table, ui) {
	return;
	//console.log('ui', ui);
	let [stage, fen, phase, uplayer, deck, market] = [table.fen.stage, table.fen, table.fen.phase, me, table.fen.deck, table.fen.market];

	//fen.num_actions=2;fen.action_number=1;fen.total_pl_actions=3;console.log('___',fen.progress)

	if (fen.num_actions > 0) fen.progress = `&nbsp;&nbsp;(action ${fen.action_number} of ${fen.total_pl_actions})`; else delete fen.progress;
	//show_progress(fen);
	let stageText = ARI.stage[stage];
	//console.log('stage is', stage, stageText);


	switch (stageText) {
		case 'comm_weitergeben':
			// select_add_items(x, process_comm_setup, text, fen.comm_setup_num, fen.comm_setup_num);
			let items = ui_get_all_commission_items(uplayer, table, ui);

			DA.selectMin = DA.selectMax = fen.comm_setup_num;
			DA.selectItems = items.map(x => x.o.div);

			//console.log('commission items', items);

			let text = `must select ${fen.comm_setup_num} card${fen.comm_setup_num > 1 ? 's' : ''} to discard for commission setup`;
			let { myTurn, spectating } = stdInstruction(me, table, text);//showInstructionStandard(table,text)
			let handler = async () => process_comm_setup(me, table, items);
			if (nundef(mBy('bCommit'))) {
				mButton('commit', handler, mBy('dInstruction'), { maleft: 10, rounding: 6, padding: '4px 12px 5px 12px', border: '0px solid transparent', outline: 'none' }, 'selectable_button', 'bCommit');
				mStyle(mBy('bCommit'), { opacity: 0 });
			}
			for (const item of items) {
				showItemAsSelectable(item);
				let d = item.o.div;
				d.onclick = () => {
					toggleItemSelectionState(item);
					checkShowCommitButton(items, fen.comm_setup_num); //, handler);
				};
			}


			//assertion(false, '* THE END *');
			break;















		case 'action: command': fen.stage = 6; select_add_items(ui_get_commands(uplayer), process_command, 'must select an action', 1, 1); break; //5
		case 'action step 2':
			switch (A.command) {
				case 'trade': select_add_items(ui_get_trade_items(uplayer), post_trade, 'must select 2 cards to trade', 2, 2); break;
				case 'build': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for building', 1, 1); break;
				case 'upgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for upgrade', 1, 1); break;
				case 'downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
				case 'pickup': select_add_items(ui_get_stall_items(uplayer), post_pickup, 'must select a stall card to take into your hand', 1, 1); break;
				case 'harvest': select_add_items(ui_get_harvest_items(uplayer), post_harvest, 'must select a farm to harvest from', 1, 1); break;
				case 'sell': select_add_items(ui_get_stall_items(uplayer), post_sell, 'must select 2 stall cards to sell', 2, 2); break;
				case 'buy': select_add_items(ui_get_payment_items('J'), payment_complete, 'must select payment option', 1, 1); break;
				case 'buy rumor': ari_open_rumors(); break;
				case 'exchange': select_add_items(ui_get_exchange_items(uplayer), post_exchange, 'must select cards to exchange', 2, 2); break;
				case 'visit': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for visiting', 1, 1); break;
				case 'rumor': select_add_items(ui_get_other_buildings_and_rumors(uplayer), process_rumor, 'must select a building and a rumor card to place', 2, 2); break;
				case 'inspect': select_add_items(ui_get_other_buildings(uplayer), process_inspect, 'must select building to visit', 1, 1); break;
				case 'blackmail': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for blackmailing', 1, 1); break;
				case 'commission': select_add_items(ui_get_commission_items(me, table, ui), process_commission, 'must select a card to commission', 1, 1); break;
				case 'pass': post_pass(); break;
			}
			break;
		case 'pick_schwein': select_add_items(ui_get_schweine_candidates(A.uibuilding), post_inspect, 'must select the new schwein', 1, 1); break;
		case 'rumors_weitergeben':
			let rumitems = ui_get_rumors_and_players_items(uplayer);
			if (isEmpty(rumitems)) {
				show_waiting_message('waiting for other players...');
				Z.state = null;
				let done = rumor_playerdata_complete();
				if (done) {
					Z.turn = [Z.host];
					Z.stage = 105; //'next_rumors_setup_stage';
					clear_transaction();
					take_turn_fen();
				} else autopoll();
			} else select_add_items(rumitems, process_rumors_setup, `must select a player and a rumor to pass on`, 2, 2);
			break;
		case 'next_rumor_setup_stage': post_rumor_setup(); break;
		case 'buy rumor': select_add_items(ui_get_top_rumors(), post_buy_rumor, 'must select one of the new rumor cards', 1, 1); break;
		case 'rumor discard': select_add_items(ui_get_rumors_items(uplayer), process_rumor_discard, 'must select a rumor card to discard', 1, 1); break;
		case 'rumor_both': select_add_items(ui_get_top_rumors(), post_rumor_both, 'must select one of the new rumor cards', 1, 1); break;
		case 'blackmail': select_add_items(ui_get_other_buildings_with_rumors(uplayer), process_blackmail, 'must select a building to blackmail', 1, 1); break;
		case 'blackmail_owner': select_add_items(ui_get_blackmailed_items(), being_blackmailed, 'must react to BLACKMAIL!!!', 1, 1); break; //console.log('YOU ARE BEING BLACKMAILED!!!',uplayer); break;
		case 'accept_blackmail': select_add_items(ui_get_stall_items(uplayer), post_accept_blackmail, 'must select a card to pay off blackmailer', 1, 1); break;
		case 'blackmail_complete': post_blackmail(); break;
		case 'journey': select_add_items(ui_get_hand_and_journey_items(uplayer), process_journey, 'may form new journey or add cards to existing one'); break;
		case 'add new journey': post_new_journey(); break;
		//case 'auto market': ari_open_market(fen, phase, deck, market); break;
		case 'TEST_starts_in_stall_selection_complete':
			if (is_stall_selection_complete()) {
				delete fen.stallSelected;
				fen.actionsCompleted = [];
				if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
			} else select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select your stall'); break;
		case 'stall selection': select_add_items(ui_get_hand_items(uplayer), post_stall_selected, 'must select cards for stall'); break;
		case 'church': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe, `must select cards to tithe ${isdef(fen.tithemin) ? `(current minimum is ${fen.tithemin})` : ''}`, 1, 100); break;
		case 'church_minplayer_tithe_add': select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100); break;
		case 'church_minplayer_tithe_downgrade': select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
		case 'church_minplayer_tithe': console.log('NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
			let pl = fen.players[uplayer];
			let hst = pl.hand.concat(pl.stall);
			let vals = hst.map(x => ari_get_card(x).val);
			let sum = arrSum(vals);
			let min = fen.tithe_minimum;
			if (sum < min) {
				ari_history_list([`${uplayer} must downgrade a building to tithe ${min}!`], 'downgrade');
				select_add_items(ui_get_building_items(uplayer, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1);
			} else {
				ari_history_list([`${uplayer} must tithe more cards to reach ${min}!`], 'tithe');
				select_add_items(ui_get_hand_and_stall_items(uplayer), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100);
			}
			break;
		case 'church_newcards':
			reveal_church_cards();
			let itemsChurch = ui_get_church_items(uplayer);
			let num_select = itemsChurch.length == fen.church.length ? 1 : 2;
			let instr = num_select == 1 ? `must select a card for ${fen.candidates[0]}` : 'must select card and player';
			select_add_items(itemsChurch, post_church, instr, num_select, num_select);

			break;
		case 'complementing_market_after_church':
			select_add_items(ui_get_hand_items(uplayer), post_complementing_market_after_church, 'may complement stall'); break;
		case 'tax': let n = fen.pl_tax[uplayer]; select_add_items(ui_get_hand_items(uplayer), post_tax, `must pay ${n} card${if_plural(n)} tax`, n, n); break;
		case 'build': select_add_items(ui_get_build_items(uplayer, A.payment), post_build, 'must select cards to build (first card determines rank)', 4, 6, true); break;
		case 'commission_stall': select_add_items(ui_get_commission_stall_items(), process_commission_stall, 'must select matching stall card to discard', 1, 1); break;
		case 'commission new': select_add_items(ui_get_commission_new_items(uplayer), post_commission, 'must select a new commission', 1, 1); break;
		case 'upgrade': select_add_items(ui_get_build_items(uplayer, A.payment), process_upgrade, 'must select card(s) to upgrade a building', 1); break;
		case 'select building to upgrade': select_add_items(ui_get_farms_estates_items(uplayer), post_upgrade, 'must select a building', 1, 1); break;
		case 'select downgrade cards': select_add_items(A.possible_downgrade_cards, post_downgrade, 'must select card(s) to downgrade a building', 1, is_in_middle_of_church() ? 1 : 100); break;
		case 'buy': select_add_items(ui_get_open_discard_items(uplayer, A.payment), post_buy, 'must select a card to buy', 1, 1); break;
		case 'visit': select_add_items(ui_get_other_buildings(uplayer, A.payment), process_visit, 'must select a building to visit', 1, 1); break;
		case 'visit destroy': select_add_items(ui_get_string_items(['destroy', 'get cash']), post_visit, 'must destroy the building or select the cash', 1, 1); break;
		case 'ball': select_add_items(ui_get_hand_items(uplayer), post_ball, 'may add cards to the ball'); break;
		case 'auction: bid': select_add_items(ui_get_coin_amounts(uplayer), process_auction, 'must bid for the auction', 1, 1); break;
		case 'auction: buy': select_add_items(ui_get_market_items(), post_auction, 'must buy a card', 1, 1); break;
		case 'end game?': select_add_items(ui_get_endgame(uplayer), post_endgame, 'may end the game here and now or go on!', 1, 1); break;
		case 'pick luxury or journey cards': select_add_items(ui_get_string_items(['luxury cards', 'journey cards']), post_luxury_or_journey_cards, 'must select luxury cards or getting cards from the other end of the journey', 1, 1); break;
		case 'next_comm_setup_stage': select_confirm_weiter(post_comm_setup_stage); break;
		default: console.log('stage is', stage); break;
	}
}


function ari_open_market(fen, phase, deck, market) {
	DA.qanim = [];
	let n_market = phase == 'jack' ? 3 : 2;
	fen.stage = Z.stage = phase == 'jack' ? 12 : phase == 'queen' ? 11 : 4;
	fen.stallSelected = [];
	delete fen.passed;
	for (let i = 0; i < n_market; i++) {
		DA.qanim.push([qanim_flip_topmost, [deck]]);
		DA.qanim.push([qanim_move_topmost, [deck, market]]);
		DA.qanim.push([q_move_topmost, [deck, market]]);
	}
	DA.qanim.push([q_mirror_fen, ['deck', 'market']]);
	DA.qanim.push([ari_pre_action, []]);
	qanim();
}


//#region commission setup
function checkShowCommitButton(items, n, callback) {

	let selectedItems = items.filter(x => x.state === 'selected');
	if (selectedItems.length === n) {
		mStyle('bCommit', { opacity: 1 });
		//commitButton.onclick = async() => await callback();
	} else {
		mStyle('bCommit', { opacity: 0 });
	}
}
async function process_comm_setup(uname, table, items) {
	//the n selected items are sent to personal update (wie in dino)
	let fen = table.fen;
	let n = fen.comm_setup_num;
	//console.log('process_comm_setup', uname, table, items, n);
	let newTable = gtCopy(table);
	lookupAddIfToList(newTable, ['fen', 'movedone'], uname);
	removeInPlace(newTable.turn, uname);
	newTable.players[uname].action = { items: items.filter(x => x.state === 'selected').map(x => x.key), num: n };
	if (newTable.turn.length == 0) {
		//each player's selected commission cards are removed from pl.commission and added to the next player's commission cards.
		for (const p in newTable.players) {
			let pl = newTable.players[p];
			//remove pl.action.items from pl.commission and add to next player's commission
			let nextPlayer = get_next_player(newTable, p);
			let nextPl = newTable.players[nextPlayer];
			for (const key of pl.action.items) {
				let idx = pl.commissions.indexOf(key);
				if (idx >= 0) {
					pl.commissions.splice(idx, 1);
					nextPl.commissions.push(key);
				}
			}
			delete pl.action;

		}
		//console.log('n',n)
		if (n == 1) {
			delete newTable.fen.comm_setup_num;
			historyAddLines([`commission trading ends`], 'commissions', fen);
			if (exp_rumors(table.options) && plorder.length >= 2) {
				[newTable.stage, newTable.turn] = [24, table.plorder];
				historyAddLines([`gossiping starts`], 'rumors', fen);
			} else {
				[newTable.fen.stage, newTable.turn] = setStallStage(newTable);
				console.log('stall stage', newTable.fen.stage, newTable.turn);
			}
		} else {
			newTable.fen.comm_setup_num = n - 1;
			newTable.turn = Object.keys(newTable.players);
			newTable.fen.movedone = [];
		}
	}
	await tableSaveUpdate(newTable);
	updateMain(newTable);
}
function ui_get_all_commission_items(uplayer, table, ui) {
	//console.log('uplayer', uplayer, table, ui);
	let items = [], i = 0;
	let comm = ui.players[uplayer].commissions;
	for (const o of comm.items) {
		let item = { itemtype: 'card', o: o, a: o.key, key: o.key, friendly: o.short, path: comm.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}


//endregion


//#region closure code needed
function getKeySets() {
	makeCategories();	//console.log('Categories',Categories)
	let res = {};
	for (const k in Syms) {
		let info = Syms[k];
		if (nundef(info.cats)) continue;
		for (const ksk of info.cats) {
			lookupAddIfToList(res, [ksk], k);
		}
	}
	res.animals = getAnimals();
	res.nature = getNature();
	localStorage.setItem('KeySets', JSON.stringify(res));
	return res;
}
function makeCategories() {
	let keys = Categories = {
		animal: getGSGElements(g => g == 'Animals & Nature', s => startsWith(s, 'animal')),
		clothing: getGSGElements(g => g == 'Objects', s => s == 'clothing'),
		emotion: getGSGElements(g => g == 'Smileys & Emotion', s => startsWith(s, 'face') && !['face-costume', 'face-hat'].includes(s)),
		food: getGSGElements(g => g == 'Food & Drink', s => startsWith(s, 'food')),
		'game/toy': (['sparkler', 'firecracker', 'artist palette', 'balloon', 'confetti ball'].concat(ByGroupSubgroup['Activities']['game'])).sort(),
		gesture: getGSGElements(g => g == 'People & Body', s => startsWith(s, 'hand')),
		job: ByGroupSubgroup['People & Body']['job'],
		mammal: ByGroupSubgroup['Animals & Nature']['animal-mammal'],
		music: getGSGElements(g => g == 'Objects', s => startsWith(s, 'musi')),
		object: getGSGElements(g => g == 'Objects', s => true),
		place: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'place')),
		plant: getGSGElements(g => g == 'Animals & Nature' || g == 'Food & Drink', s => startsWith(s, 'plant') || s == 'food-vegetable' || s == 'food-fruit'),
		sport: ByGroupSubgroup['Activities']['sport'],
		tool: getGSGElements(g => g == 'Objects', s => s == 'tool'),
		transport: getGSGElements(g => g == 'Travel & Places', s => startsWith(s, 'transport')),
	};
	let incompatible = DA.incompatibleCats = {
		animal: ['mammal'],
		clothing: ['object'],
		emotion: ['gesture'],
		food: ['plant', 'animal'],
		'game/toy': ['object', 'music'],
		gesture: ['emotion'],
		job: ['sport'],
		mammal: ['animal'],
		music: ['object', 'game/toy'],
		object: ['music', 'clothing', 'game/toy', 'tool'],
		place: [],
		plant: ['food'],
		sport: ['job'],
		tool: ['object'],
		transport: [],
	}
}
function getGSGElements(gCond, sCond) {
	let keys = [];
	let byg = ByGroupSubgroup;
	for (const gKey in byg) {
		if (!gCond(gKey)) continue;
		for (const sKey in byg[gKey]) {
			if (!sCond(sKey)) continue;
			keys = keys.concat(byg[gKey][sKey]);
		}
	}
	return keys.sort();
}
function mAnimateTo(elem, prop, val, callback, msDuration = 1000, easing = 'cubic-bezier(1,-0.03,.86,.68)', delay = 0) {
	let o = {};
	o[prop] = isString(val) || prop == 'opacity' ? val : '' + val + 'px';
	let kflist = [o];
	let opts = { duration: msDuration, fill: 'forwards', easing: easing, delay: delay };
	let a = toElem(elem).animate(kflist, opts);
	if (isdef(callback)) { a.onfinish = callback; }
	return a;
}
function getAnimals() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		if (startsWith(sg, 'anim')) result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function getNature() {
	let gr = 'Animals & Nature';
	let result = [];
	for (const sg in ByGroupSubgroup[gr]) {
		result = result.concat(ByGroupSubgroup[gr][sg]);
	}
	return result;
}
function mCenterCenterFlex(d) { mCenterFlex(d, true, true, true); }
function mCenterFlex(d, hCenter = true, vCenter = false, wrap = true) {
	let styles = { display: 'flex' };
	if (hCenter) styles['justify-content'] = 'center';
	styles['align-content'] = vCenter ? 'center' : 'flex-start';
	if (wrap) styles['flex-wrap'] = 'wrap';
	mStyle(d, styles);
}




//#endregion

//#region ari_ from closure

function ari_calc_fictive_vps(fen, plname) {
	let pl = fen.players[plname];
	let bs = pl.buildings;
	let vps = calc_building_vps(bs);
	return vps;
}
function ari_calc_real_vps(fen, plname) {
	let pl = fen.players[plname];
	let bs = ari_get_correct_buildings(pl.buildings);
	let vps = calc_building_vps(bs);
	for (const btype in bs) {
		let blist = bs[btype];
		for (const b of blist) {
			let lead = b.list[0];
			if (firstCond(pl.commissions, x => x[0] == lead[0])) {
				vps += 1;
			}
		}
	}
	return vps;
}
function calc_building_vps(bs) {
	let res = 0;
	res += bs.farm.length;
	res += bs.estate.length * 2;
	res += bs.chateau.length * 3;
	return res;
}
function calc_stall_value(fen, plname) { let st = fen.players[plname].stall; if (isEmpty(st)) return 0; else return arrSum(st.map(x => ari_get_card(x).val)); }
function ari_get_correct_buildings(buildings) {
	let bcorrect = { farm: [], estate: [], chateau: [] };
	for (const type in buildings) {
		for (const b of buildings[type]) {
			let list = b.list;
			let lead = list[0];
			let iscorrect = true;
			for (const key of arrFromIndex(list, 1)) {
				if (key[0] != lead[0]) { iscorrect = false; continue; }
			}
			if (iscorrect) {
				lookupAddIfToList(bcorrect, [type], b);
			}
		}
	}
	return bcorrect; // [bcorrect, realvps];
}

function ui_get_exchange_items(uplayer) {
	let ihand = ui_get_hand_items(uplayer);
	let istall = ui_get_stall_items(uplayer);
	let irepair = ui_get_all_hidden_building_items(uplayer);
	irepair.map(x => face_up(x.o));
	let items = ihand.concat(istall).concat(irepair);
	reindex_items(items);
	return items;
}
function ui_get_farms_estates_items(uplayer) { return ui_get_building_items_of_type(uplayer, ['farm', 'estate']); }
function ui_get_hand_and_journey_items(uplayer) {
	let items = ui_get_hand_items(uplayer);
	let matching = [];
	for (const plname of Z.plorder) {
		let jitems = ui_get_journey_items(plname);
		for (const j of jitems) {
			for (const card of items) {
				if (matches_on_either_end(card, j)) { matching.push(j); break; }
			}
		}
	}
	items = items.concat(matching);
	reindex_items(items);
	return items;
}
function ui_get_hand_and_stall_items(uplayer) {
	let items = ui_get_hand_items(uplayer);
	items = items.concat(ui_get_stall_items(uplayer));
	reindex_items(items);
	return items;
}
function ui_get_hand_items(uplayer) {
	let items = [], i = 0;
	let hand = UI.players[uplayer].hand;
	for (const o of hand.items) {
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: hand.path, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_harvest_items(uplayer) {
	let items = []; let i = 0;
	for (const gb of UI.players[uplayer].buildinglist) {
		if (isdef(gb.harvest)) {
			let d = gb.harvest;
			mStyle(d, { cursor: 'pointer', opacity: 1 });
			gb.div = d;
			let name = 'H' + i + ':' + (gb.list[0][0] == 'T' ? '10' : gb.list[0][0]);
			let item = { o: gb, a: name, key: name, friendly: name, path: gb.path, index: i };
			i++;
			items.push(item);
		}
	}
	return items;
}
function ui_get_hidden_building_items(uibuilding) {
	let items = [];
	for (let i = 1; i < uibuilding.items.length; i++) {
		let o = uibuilding.items[i];
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: uibuilding.path, index: i - 1 };
		items.push(item);
	}
	return items;
}
function ui_get_journey_items(plname) {
	let gblist = UI.players[plname].journeys;
	let items = [], i = 0;
	for (const o of gblist) {
		let name = `${plname}_j${i}`;
		o.div = o.container;
		let item = { o: o, a: name, key: o.list[0], friendly: name, path: o.path, index: i, ui: o.container };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_market_items() {
	let items = [], i = 0;
	for (const o of UI.market.items) {
		o.index = i;
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `market`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function ui_get_open_discard_items() {
	let items = [], i = 0;
	for (const o of UI.open_discard.items) {
		let item = { o: o, a: o.key, key: o.key, friendly: o.short, path: `open_discard`, index: i };
		i++;
		items.push(item);
	}
	return items;
}
function mMagnifyOnHoverControlPopup(elem) {
	elem.onmouseenter = ev => {
		if (ev.ctrlKey) {
			let r = getRect(elem, document.body);
			let popup = mDiv(document.body, { rounding: 4, position: 'absolute', top: r.y, left: r.x }, 'popup');
			let clone = elem.cloneNode(true);
			popup.appendChild(clone);
			mClass(popup, 'doublesize')
			popup.onmouseleave = () => popup.remove();
		}
	}
}



//#endregion


