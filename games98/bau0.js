
function simplegame() {
	function setup(table) { 
		stdSetupGame(table,'taketurns'); 
		let fen = table.fen;
		fen.deck = c52Deck();
		fen.trick=[];
		for(const plname in table.players){
			let pl = table.players[plname];
			pl.hand = deckDeal(fen.deck,5);
		}
	}
	async function process(uname, table, key) { }
	function present(me, table) {
		let dTable = stdPresentBGATable(me, table, 1000);
		showTitleGame(table);
		stdStatsScore(me, table);

		let dOpenTable = mDom(dTable,{align:'center',bg:'red',round:true,w:300,h:300})
		

		return { dTable, dOpenTable };
	}
	function activate(me, table, ui) { }
	return { setup, process, present, activate };
}

function gtDefault() {
	function setup(table) { stdSetupGame(table); }
	async function process(uname, table, key) { }
	function present(me, table) {
		let dTable = stdPresentBGATable(me, table, 1000);
		showTitleGame(table);
		stdStatsScore(me, table);
		let dButton = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `${table.step}` })
		return { dTable, dButton };
	}
	function activate(me, table, ui) { }
	return { setup, process, present, activate };
}
function dinogame() {
  function setup(table) {
    stdSetupGame(table, 'wait');
    table.stage = 'wait';
    table.fen.movedone = [];
    console.log('setup', table);
  }
  async function process(uname, table, buttonNumber) {
    //console.log('process', uname, table, buttonNumber)
    let newTable = gtCopy(table);
    lookupAddIfToList(newTable, ['fen', 'movedone'], uname);
    removeInPlace(newTable.turn, uname);
    console.log(newTable.players[uname])
    newTable.players[uname].action = { num: buttonNumber };
    console.log(newTable);
    if (newTable.turn.length == 0) {
      //console.log('___\nplayers',newTable.players,'\nturn',newTable.turn)
      console.log(newTable)
      for (const p in newTable.players) {
        let pl = newTable.players[p];
        pl.score += pl.action.num;
        delete pl.action;
      }
      newTable.turn = Object.keys(newTable.players);
      newTable.fen.movedone = [];
    }
    await tableSaveUpdate(newTable);
    return true;
  }
  function present(me, table) {
    let dTable = stdPresentBGATable(me, table, 1000);
    showTitleGame(table);
    stdStatsScore(me, table);
    if (table.stage == 'wait') {
      mDom(dTable, { fz: 40, margin: 20 }, { html: `Waiting for ${table.turn.join(', ')}...<br>${table.fen.movedone.length}/${Object.keys(table.players).length} finished` });
    } else {
      mDom(dTable, { fz: 40, margin: 20 }, { html: `Round ${table.step}: Make your move!` });
    }
    mLinebreak(dTable);
    let dButton1 = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `1` })
    let dButton2 = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `2` })
    let dButton3 = mDom(dTable, { fz: 60, margin: 60, padding: 30, round: true }, { tag: 'button', html: `3` })
    return { dTable, dButton1, dButton2, dButton3 };
  }
  async function activate(me, table, ui) {
    let { myTurn, spectating } = stdInstruction(me, table);
    if (spectating) return;
    if (!myTurn) {
      ui.dButton.disabled = true;
    } else {
      ignoreDoubleClick(ui.dButton1, () => rsgEvalButton(me, me, table, ui, 1));
      ignoreDoubleClick(ui.dButton2, () => rsgEvalButton(me, me, table, ui, 2));
      ignoreDoubleClick(ui.dButton3, () => rsgEvalButton(me, me, table, ui, 3));
    }
    stdBotMoves(bot => rsgEvalButton(bot, me, table, ui), table);
  }
  async function rsgEvalButton(uname, me, table, ui, buttonNumber) {
    stdEvalShield();
    if (uname == me) {
      toggleItemSelection({ div: ui[`dButton${buttonNumber}`] });
    }
    let moveSent = await process(uname, table, buttonNumber);
    if (moveSent) await updateMain(true);
    DA.isProcessingMove = false;
  }
  return { setup, present, activate, process }
}
