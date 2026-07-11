
function showHandSortingButtonsFor(pl, ui) {
	if (pl.hand.length <= 1) return;
	let x = ui.hand; //console.log(x)
	let d = x.container.parentNode;
	let bstyles = { z: 10000, position: 'absolute', hmin: 20, wmin: 50, h: 20, fz: 12, rounding: 6, bg: 'silver', fg: 'black' };
	let b1 = mDom(d, { ...bstyles, left: 20, bottom: 2 }, { tag: 'button', innerHTML: 'rank' });
	b1.onclick = () => {
		let cardItems = cSort(ui.handCards, null, 'A23456789TJQK');
		// cSplay(cardItems, null, x.dir, x.splay);
		splayItems(cardItems, x.container, { direction: x.direction, overlap: x.overlap });

	}
	let b2 = mDom(d, { ...bstyles, right: 20, bottom: 2 }, { tag: 'button', innerHTML: 'suit' });
	b2.onclick = () => {
		//let cont = x.container;
		let cardItems = cSort(ui.handCards, 'CDSH', 'A23456789TJQK');
		splayItems(cardItems, x.container, { direction: x.direction, overlap: x.overlap });

	}
}

function ari_pre_action(me, table, ui) {
	return;
	let [stage, fen, pl, upl, phase, deck, market] = [table.fen.stage, table.fen, table.players[me], ui.players[me], table.fen.phase, table.fen.deck, table.fen.market];
	if (fen.numActions > 0) fen.progress = `&nbsp;&nbsp;(action ${fen.action_number} of ${fen.total_pl_actions})`; else delete fen.progress;
	let stageText = ARI.stage[stage];

	switch (stageText) {
		case 'stall_selection':
			ariMakePlayerHandSelectable(me, table, ui);
			//console.log('!!!')
			break;
		case 'rumors_weitergeben':
			console.log('NOT IMPLEMENTED stage is', stageText); return;
			// if (table.plorder.length <= 2){
			// 	ariRumorPost(me, table); return;
			// }
			ariSetupRumorAssignment(me, table);
			break;
		default: console.log('NOT IMPLEMENTED stage is', stageText);
			break;



	}
	INTERRUPT();



	switch (stageText) {
		case 'rumors_weitergeben':
			let rumitems = ui_get_rumors_and_players_items(me);
			if (isEmpty(rumitems)) {
				show_waiting_message('waiting for other players...');
				Z.state = null;
				let done = rumor_playerdata_complete();
				if (done) {
					Z.turn = [Z.host];
					Z.stage = 105;
					clear_transaction();
					take_turn_fen();
				} else autopoll();
			} else select_add_items(rumitems, process_rumors_setup, `must select a player and a rumor to pass on`, 2, 2);
			break;
		case 'comm_weitergeben':
			let items = ui_get_all_commission_items(me, table, ui);
			DA.selectMin = DA.selectMax = fen.commSetupNum;
			DA.selectItems = items.map(x => x.o.div);
			let text = `must select ${fen.commSetupNum} card${fen.commSetupNum > 1 ? 's' : ''} to discard for commission setup`;
			let { myTurn, spectating } = stdInstruction(me, table, text);
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
					checkShowCommitButton(items, fen.commSetupNum);
				};
			}
			break;
		case 'action: command': fen.stage = 6; select_add_items(ui_get_commands(me), process_command, 'must select an action', 1, 1); break; //5
		case 'action step 2':
			switch (A.command) {
				case 'trade': select_add_items(ui_get_trade_items(me), post_trade, 'must select 2 cards to trade', 2, 2); break;
				case 'build': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for building', 1, 1); break;
				case 'upgrade': select_add_items(ui_get_payment_items('K'), payment_complete, 'must select payment for upgrade', 1, 1); break;
				case 'downgrade': select_add_items(ui_get_building_items(me, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
				case 'pickup': select_add_items(ui_get_stall_items(me), post_pickup, 'must select a stall card to take into your hand', 1, 1); break;
				case 'harvest': select_add_items(ui_get_harvest_items(me), post_harvest, 'must select a farm to harvest from', 1, 1); break;
				case 'sell': select_add_items(ui_get_stall_items(me), post_sell, 'must select 2 stall cards to sell', 2, 2); break;
				case 'buy': select_add_items(ui_get_payment_items('J'), payment_complete, 'must select payment option', 1, 1); break;
				case 'buy rumor': ari_open_rumors(); break;
				case 'exchange': select_add_items(ui_get_exchange_items(me), post_exchange, 'must select cards to exchange', 2, 2); break;
				case 'visit': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for visiting', 1, 1); break;
				case 'rumor': select_add_items(ui_get_other_buildings_and_rumors(me), process_rumor, 'must select a building and a rumor card to place', 2, 2); break;
				case 'inspect': select_add_items(ui_get_other_buildings(me), process_inspect, 'must select building to visit', 1, 1); break;
				case 'blackmail': select_add_items(ui_get_payment_items('Q'), payment_complete, 'must select payment for blackmailing', 1, 1); break;
				case 'commission': select_add_items(ui_get_commission_items(me, table, ui), process_commission, 'must select a card to commission', 1, 1); break;
				case 'pass': post_pass(); break;
			}
			break;
		case 'pick_schwein': select_add_items(ui_get_schweine_candidates(A.uibuilding), post_inspect, 'must select the new schwein', 1, 1); break;
		case 'next_rumor_setup_stage': post_rumor_setup(); break;
		case 'buy rumor': select_add_items(ui_get_top_rumors(), post_buy_rumor, 'must select one of the new rumor cards', 1, 1); break;
		case 'rumor discard': select_add_items(ui_get_rumors_items(me), process_rumor_discard, 'must select a rumor card to discard', 1, 1); break;
		case 'rumor_both': select_add_items(ui_get_top_rumors(), post_rumor_both, 'must select one of the new rumor cards', 1, 1); break;
		case 'blackmail': select_add_items(ui_get_other_buildings_with_rumors(me), process_blackmail, 'must select a building to blackmail', 1, 1); break;
		case 'blackmail_owner': select_add_items(ui_get_blackmailed_items(), being_blackmailed, 'must react to BLACKMAIL!!!', 1, 1); break; //console.log('YOU ARE BEING BLACKMAILED!!!',uplayer); break;
		case 'accept_blackmail': select_add_items(ui_get_stall_items(me), post_accept_blackmail, 'must select a card to pay off blackmailer', 1, 1); break;
		case 'blackmail_complete': post_blackmail(); break;
		case 'journey': select_add_items(ui_get_hand_and_journey_items(me), process_journey, 'may form new journey or add cards to existing one'); break;
		case 'add new journey': post_new_journey(); break;
		case 'TEST_starts_in_stall_selection_complete':
			if (is_stall_selection_complete()) {
				delete fen.stallSelected;
				fen.actionsCompleted = [];
				if (check_if_church()) ari_start_church_stage(); else ari_start_action_stage();
			} else select_add_items(ui_get_hand_items(me), post_stall_selected, 'must select your stall'); break;
		case 'stall selection': select_add_items(ui_get_hand_items(me), post_stall_selected, 'must select cards for stall'); break;
		case 'church': select_add_items(ui_get_hand_and_stall_items(me), post_tithe, `must select cards to tithe ${isdef(fen.tithemin) ? `(current minimum is ${fen.tithemin})` : ''}`, 1, 100); break;
		case 'church_minplayer_tithe_add': select_add_items(ui_get_hand_and_stall_items(me), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100); break;
		case 'church_minplayer_tithe_downgrade': select_add_items(ui_get_building_items(me, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1); break;
		case 'church_minplayer_tithe': console.log('NOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO');
			let pl = fen.players[me];
			let hst = pl.hand.concat(pl.stall);
			let vals = hst.map(x => ari_get_card(x).val);
			let sum = arrSum(vals);
			let min = fen.tithe_minimum;
			if (sum < min) {
				ari_history_list([`${me} must downgrade a building to tithe ${min}!`], 'downgrade');
				select_add_items(ui_get_building_items(me, A.payment), process_downgrade, 'must select a building to downgrade', 1, 1);
			} else {
				ari_history_list([`${me} must tithe more cards to reach ${min}!`], 'tithe');
				select_add_items(ui_get_hand_and_stall_items(me), post_tithe_minimum, `must select cards to reach at least ${fen.tithe_minimum}`, 1, 100);
			}
			break;
		case 'church_newcards':
			reveal_church_cards();
			let itemsChurch = ui_get_church_items(me);
			let num_select = itemsChurch.length == fen.church.length ? 1 : 2;
			let instr = num_select == 1 ? `must select a card for ${fen.candidates[0]}` : 'must select card and player';
			select_add_items(itemsChurch, post_church, instr, num_select, num_select);
			break;
		case 'complementing_market_after_church':
			select_add_items(ui_get_hand_items(me), post_complementing_market_after_church, 'may complement stall'); break;
		case 'tax': let n = fen.pl_tax[me]; select_add_items(ui_get_hand_items(me), post_tax, `must pay ${n} card${if_plural(n)} tax`, n, n); break;
		case 'build': select_add_items(ui_get_build_items(me, A.payment), post_build, 'must select cards to build (first card determines rank)', 4, 6, true); break;
		case 'commission_stall': select_add_items(ui_get_commission_stall_items(), process_commission_stall, 'must select matching stall card to discard', 1, 1); break;
		case 'commission new': select_add_items(ui_get_commission_new_items(me), post_commission, 'must select a new commission', 1, 1); break;
		case 'upgrade': select_add_items(ui_get_build_items(me, A.payment), process_upgrade, 'must select card(s) to upgrade a building', 1); break;
		case 'select building to upgrade': select_add_items(ui_get_farms_estates_items(me), post_upgrade, 'must select a building', 1, 1); break;
		case 'select downgrade cards': select_add_items(A.possible_downgrade_cards, post_downgrade, 'must select card(s) to downgrade a building', 1, is_in_middle_of_church() ? 1 : 100); break;
		case 'buy': select_add_items(ui_get_open_discard_items(me, A.payment), post_buy, 'must select a card to buy', 1, 1); break;
		case 'visit': select_add_items(ui_get_other_buildings(me, A.payment), process_visit, 'must select a building to visit', 1, 1); break;
		case 'visit destroy': select_add_items(ui_get_string_items(['destroy', 'get cash']), post_visit, 'must destroy the building or select the cash', 1, 1); break;
		case 'ball': select_add_items(ui_get_hand_items(me), post_ball, 'may add cards to the ball'); break;
		case 'auction: bid': select_add_items(ui_get_coin_amounts(me), process_auction, 'must bid for the auction', 1, 1); break;
		case 'auction: buy': select_add_items(ui_get_market_items(), post_auction, 'must buy a card', 1, 1); break;
		case 'end game?': select_add_items(ui_get_endgame(me), post_endgame, 'may end the game here and now or go on!', 1, 1); break;
		case 'pick luxury or journey cards': select_add_items(ui_get_string_items(['luxury cards', 'journey cards']), post_luxury_or_journey_cards, 'must select luxury cards or getting cards from the other end of the journey', 1, 1); break;
		case 'next_comm_setup_stage': select_confirm_weiter(post_comm_setup_stage); break;
		default: console.log('stage is', stage); break;
	}
}
