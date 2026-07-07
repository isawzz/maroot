
function aristo() {
  const rankstr = 'A23456789TJQK*';
  async function process(uname, table, keys, m) { }
  function setup(table) {
    let fen = table.fen = {};
    let options = table.options;
    let players = table.players;
    let plNames = Object.keys(table.players);
    let n = plNames.length;
    let numDecks = fen.numDecks = 2 + (n >= 8 ? 2 : n >= 6 ? 1 : 0); // 2 + (n > 5 ? Math.ceil((n - 5) / 2) : 0); //<=5?2:Math.max(2,Math.ceil(players.length/3));
    let deck = fen.deck = c52Decks(numDecks).map(x => x + 'n'); arrShuffle(deck);
    let deckCommission = fen.deckCommission = c52Decks(1).map(x => x + 'c'); arrShuffle(deckCommission);
    let deckLuxury = fen.deckLuxury = c52Decks(1).map(x => x + 'l'); arrShuffle(deckLuxury);
    let deckRumors = fen.deckRumors = c52Decks(1).map(x => x + 'r'); arrShuffle(deckRumors);
    table.plorder = jsCopy(plNames);
    arrShuffle(table.plorder);
    fen.market = cDeckDeal(deck, 2);
    fen.deckDiscard = [];
    fen.openDiscard = [];
    fen.commissioned = [];
    fen.openCommissions = exp_commissions(options) ? cDeckDeal(deckCommission, 3) : [];
    fen.church = exp_church(options) ? cDeckDeal(deck, plNames.length) : [];

    //console.log(fen)
    for (const plName of plNames) {
      let pl = table.players[plName];
      addKeys({
        hand: cSort(cDeckDeal(deck, 7), null, rankstr),
        commissions: exp_commissions(options) ? cSort(cDeckDeal(deckCommission, 4), null, rankstr) : [],
        rumors: exp_rumors(options) ? cSort(cDeckDeal(deckRumors, Object.keys(players).length - 1), null, rankstr) : [],
        peasants: [],
        peasantsUsed: [],
        journeys: [], //options.journey == 'no' ? [] : coin() ? [['QSr', 'KSr']] : [['3Cr', '4Cr']],
        buildings: { farm: [], estate: [], chateau: [] },
        stall: [],
        stall_value: 0,
        coins: 3,
        vps: 0,
        score: 0,
        name: plName,
        color: pl.color,
      }, pl);
      //console.log('rumors', pl.rumors, exp_rumors(options))
    }
    fen.phase = 'king'; //TODO: king !!!!!!!
    fen.numActions = 0;
    fen.herald = table.plorder[0];
    fen.heraldorder = jsCopy(table.plorder);
    if (exp_rumors(options)) {// && table.plorder.length > 2) {
      historyAddLines([`gossiping starts`], 'rumors', fen);
      [fen.stage, table.turn] = [24, table.plorder];
    } else if (exp_commissions(options)) {
      historyAddLines([`commission trading starts`], 'commissions', fen);
      [fen.stage, table.turn] = [23, table.plorder];
      fen.commSetupNum = 3; fen.keeppolling = true;
    } else if (exp_journeys(options)) {
      historyAddLines([`journey starts`], 'journey', fen);
      [fen.stage, table.turn] = [1, table.plorder];
    } else {
      [fen.stage, table.turn] = setStallStage(table);
    }
    table.turn = table.turn.sort();
  }
  function present(me, table) { return ari_present(me, table); }
  function activate(me, table, ui) { ari_pre_action(me, table, ui); }

  return { setup, present, activate, process };
}
